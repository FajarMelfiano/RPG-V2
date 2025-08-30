
import OpenAI from 'openai';
import { Character, GameTurnResponse, Scene, StoryEntry, Quest, WorldEvent, Marketplace, TransactionLogEntry } from '../../types';
import { IAiDungeonMasterService } from "../aiService";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const openai = new OpenAI({ 
    apiKey: process.env.API_KEY,
    dangerouslyAllowBrowser: true 
});

const getJsonContent = (completion: OpenAI.Chat.Completions.ChatCompletion): string | null => {
    return completion.choices[0]?.message?.content ?? null;
}

class OpenAiDungeonMaster implements IAiDungeonMasterService {
    async generateWorld(worldData: { concept: string; factions: string; conflict: string; }): Promise<{ name: string; description: string; marketplace: Marketplace; }> {
        const systemPrompt = `Anda adalah seorang Arsitek Dunia AI. Tugas Anda adalah mengubah ide-ide pemain menjadi fondasi dunia fantasi yang kohesif. Balas HANYA dengan sebuah objek JSON tunggal yang valid.

Aturan Penting:
- Buat Marketplace awal dengan toko-toko berikut: 'general_store', 'blacksmith', 'alchemist', 'traveling_merchant'.
- Isi setiap toko dengan 3-7 item yang relevan.
- **SETIAP ITEM HARUS MEMILIKI ID UNIK**. Fokus pada deskripsi item, bukan statistik numerik.

Struktur JSON yang DIWAJIBKAN:
{
  "name": "string",
  "description": "string",
  "marketplace": {
    "shops": [
      { 
        "id": "string", "name": "string", "description": "string", 
        "inventory": [{ 
          "item": { 
            "id": "string", "name": "string", "description": "string", "value": "integer", "rarity": "string", 
            "type": "string", "slot": "string"
          }, 
          "quantity": "integer" 
        }] 
      }
    ]
  }
}`;

        const userPrompt = `Masukan Pemain:
- Konsep Inti Dunia: "${worldData.concept}"
- Faksi & Kekuatan Utama: "${worldData.factions}"
- Konflik Saat Ini: "${worldData.conflict}"`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" }
        });

        const jsonString = getJsonContent(completion);
        if (!jsonString) throw new Error("OpenAI response was empty.");
        return JSON.parse(jsonString);
    }

    async generateCharacter(characterData: { concept: string; background: string; }, worldContext: string): Promise<{ character: Omit<Character, 'id'>; initialScene: Scene; introStory: string; }> {
        
        const systemPrompt = `Anda adalah Dungeon Master (DM) AI. Ciptakan karakter yang logis untuk dunia yang ada. Balas HANYA dengan sebuah objek JSON tunggal yang valid.
        
Aturan Penting:
- **Level Awal Dinamis**: Analisis 'Latar Belakang & Pengalaman' untuk menentukan level awal (1-5).
- **Perlengkapan & Item**: Semua item di \`equipment\` dan \`inventory\` HARUS memiliki ID unik. Fokus pada deskripsi, bukan statistik.
- Adegan awal ('initialScene') HARUS menyertakan \`availableShopIds\` yang logis.

Struktur JSON yang DIWAJIBKAN:
{
  "character": {
    "name": "string", "race": "string", "characterClass": "string",
    "backstory": "string",
    "stats": { "level": "integer", "health": "integer", "maxHealth": "integer", "mana": "integer", "maxMana": "integer", "strength": "integer", "dexterity": "integer", "constitution": "integer", "intelligence": "integer", "wisdom": "integer", "charisma": "integer" },
    "inventory": [{ "item": { "id": "string", "name": "string", ... }, "quantity": "integer" }],
    "equipment": { "mainHand": { "id": "string", ... }, "chest": { "id": "string", ... } },
    "reputation": "integer", "gold": "integer"
  },
  "initialScene": { "location": "string", "description": "string", "npcs": [{...}], "availableShopIds": ["string"] },
  "introStory": "string"
}`;

        const userPrompt = `Konteks Dunia (Kebenaran Dasar):
"${worldContext}"

Masukan Pemain untuk Karakter:
- Konsep Inti: "${characterData.concept}"
- Latar Belakang & Pengalaman: "${characterData.background}"`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" }
        });

        const jsonString = getJsonContent(completion);
        if (!jsonString) throw new Error("OpenAI response was empty.");
        return JSON.parse(jsonString);
    }

    async generateNextScene(character: Character, party: Character[], scene: Scene, history: StoryEntry[], longTermMemory: string[], notes: string, quests: Quest[], worldEvents: WorldEvent[], turnCount: number, playerAction: string, transactionLog: TransactionLogEntry[], marketplace: Marketplace): Promise<GameTurnResponse> {
        const recentHistory = history.slice(-5).map(entry => {
            if(entry.type === 'action') return `Pemain: ${entry.content}`;
            if(entry.type === 'narrative') return `DM: ${entry.content}`;
            return '';
        }).join('\n');

        const systemPrompt = `Anda adalah Dungeon Master (DM) AI yang logis. Lanjutkan cerita. Balas HANYA dengan sebuah objek JSON tunggal yang valid.

Aturan Utama:
1.  **Kesadaran Naratif Perlengkapan**: Baca 'LOG TRANSAKSI' dan 'Karakter Pemain' (termasuk perlengkapan). Narasi Anda HARUS mencerminkan ini secara deskriptif.
2.  **Ketersediaan Toko Kontekstual (SANGAT PENTING)**: Gunakan data 'DAFTAR TOKO DUNIA' yang disediakan untuk mengisi \`availableShopIds\` secara logis berdasarkan lokasi baru di \`sceneUpdate\`.
3.  **Pedagang Keliling Dinamis**: Setiap 20-25 giliran, segarkan inventaris 'traveling_merchant' di \`marketplaceUpdate\`.
4.  **Sikap NPC Dinamis**: Sikap NPC dalam \`sceneUpdate\` HARUS diperbarui secara logis.
5.  **Loot Bermakna**: Jika pemain menemukan loot, item baru di \`karakterTerbaru.inventory\` HARUS memiliki ID unik dan deskripsi yang menarik.

Struktur JSON yang DIWAJIBKAN:
{
  "narasiBaru": "string",
  "karakterTerbaru": { ... },
  "partyTerbaru": [ ... ],
  "sceneUpdate": { "location": "string", "description": "string", "npcs": [{...}], "availableShopIds": ["string"] },
  "skillCheck": { ... },
  "memorySummary": "string",
  "questsUpdate": [ { ... } ],
  "worldEventsUpdate": [ { ... } ],
  "marketplaceUpdate": { "shops": [{...}] }
}`;

        const userPrompt = `Giliran Saat Ini: ${turnCount}
DAFTAR TOKO DUNIA:
${JSON.stringify(marketplace.shops.map(s => ({id: s.id, name: s.name})))}
LOG TRANSAKSI TERBARU:
${transactionLog.length > 0 ? transactionLog.map(t => `- Giliran ${t.turn}: ${t.type === 'buy' ? 'Membeli' : 'Menjual'} ${t.itemName} (x${t.quantity}) seharga ${Math.abs(t.goldAmount)} emas.`).join('\n') : 'Belum ada.'}

Kondisi Saat Ini:
- Karakter Pemain: ${JSON.stringify(character, null, 2)}
- Adegan: ${JSON.stringify(scene, null, 2)}
- Aksi Pemain: "${playerAction}"`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
            response_format: { type: "json_object" }
        });

        const jsonString = getJsonContent(completion);
        if (!jsonString) throw new Error("OpenAI response was empty.");
        return JSON.parse(jsonString) as GameTurnResponse;
    }

    async askOOCQuestion(history: StoryEntry[], longTermMemory: string[], question: string): Promise<string> {
        const recentHistory = history.slice(-10).map(entry => {
            if(entry.type === 'action' || entry.type === 'ooc_query') return `Pemain: ${entry.content}`;
            if(entry.type === 'narrative' || entry.type === 'ooc_response') return `GM: ${entry.content}`;
            return '';
        }).join('\n');

        const systemPrompt = `Anda adalah Game Master (GM) yang membantu. Pemain mengajukan pertanyaan di luar karakter (OOC). Jawab dengan jelas dan singkat berdasarkan konteks cerita.`;

        const userPrompt = `Konteks Cerita:
MEMORI JANGKA PANJANG:
- ${longTermMemory.join('\n- ')}
DIALOG TERBARU:
${recentHistory}

Pertanyaan OOC Pemain:
"${question}"

Jawaban Anda sebagai GM:`;
        
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        });
        return completion.choices[0]?.message?.content ?? "Maaf, saya tidak bisa memproses permintaan itu saat ini.";
    }
}

export const openAiProvider = new OpenAiDungeonMaster();
