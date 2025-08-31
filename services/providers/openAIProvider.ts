



import OpenAI from 'openai';
// FIX: Added WorldMap to imports to support world map generation.
import { Character, GameTurnResponse, Scene, StoryEntry, Quest, WorldEvent, Marketplace, TransactionLogEntry, WorldTheme, WorldMemory, WorldMap } from '../../types';
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
    // FIX: Updated the return type to include `worldMap` and modified the system prompt to request it from the AI, aligning with the IAiDungeonMasterService interface.
    async generateWorld(worldData: { concept: string; factions: string; conflict: string; }): Promise<{ name: string; description: string; marketplace: Marketplace; theme: WorldTheme; worldMap: WorldMap; }> {
        const systemPrompt = `Anda adalah seorang Arsitek Dunia AI. Tugas Anda adalah mengubah ide-ide pemain menjadi fondasi dunia fantasi yang kohesif. Balas HANYA dengan sebuah objek JSON tunggal yang valid. SEMUA TEKS HARUS DALAM BAHASA INDONESIA.

Aturan Penting:
- **Pilih Tema (WAJIB)**: Berdasarkan 'Konsep Inti Dunia', pilih SATU tema yang paling cocok dari daftar ini: ['dark_fantasy', 'cyberpunk', 'steampunk', 'high_fantasy'].
- Buat Marketplace awal dengan toko-toko berikut: 'general_store', 'blacksmith', 'alchemist', 'traveling_merchant'.
- Isi setiap toko dengan 3-7 item yang relevan.
- **SETIAP ITEM HARUS MEMILIKI ID UNIK**. Fokus pada deskripsi item, bukan statistik numerik.
- **Buat Peta Awal (WorldMap)**: Ciptakan 3-5 lokasi (node) yang saling terhubung di sekitar area awal. Tentukan jalur (edge) yang menghubungkannya.

Struktur JSON yang DIWAJIBKAN:
{
  "name": "string",
  "description": "string",
  "theme": "string (salah satu dari: 'dark_fantasy', 'cyberpunk', 'steampunk', 'high_fantasy')",
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
  },
  "worldMap": {
      "nodes": [ { "id": "string", "name": "string", "description": "string" } ],
      "edges": [ { "fromNodeId": "string", "toNodeId": "string", "direction": "string", "description": "string" } ]
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
- **Ciptakan Detail Fisik (WAJIB)**: Hasilkan \`age\`, \`height\`, dan \`appearance\` yang realistis dan deskriptif.
- **Level Awal Dinamis**: Analisis 'Latar Belakang & Pengalaman' untuk menentukan level awal (1-5).
- **Ciptakan Keluarga (WAJIB)**: Berdasarkan latar belakang, ciptakan 1-3 anggota keluarga dalam array \`family\`.
- **Nama NPC Unik**: Untuk setiap NPC di adegan awal, berikan nama yang **unik, bervariasi, dan sesuai dengan tema dunia** (dapat disimpulkan dari konteks). Hindari nama-nama generik.
- **Perlengkapan & Item**: Semua item di \`equipment\` dan \`inventory\` HARUS memiliki ID unik. Fokus pada deskripsi, bukan statistik.
- Adegan awal ('initialScene') HARUS menyertakan \`availableShopIds\` yang logis.
- **Tautkan Pedagang**: Jika NPC di adegan awal adalah seorang pedagang, isi bidang \`shopId\` mereka dengan ID toko yang relevan.

Struktur JSON yang DIWAJIBKAN:
{
  "character": {
    "name": "string", "race": "string", "characterClass": "string",
    "age": "integer", "height": "string", "appearance": "string",
    "backstory": "string",
    "family": [{ "name": "string", "relationship": "string", "status": "string", "description": "string" }],
    "stats": { "level": "integer", "health": "integer", "maxHealth": "integer", "mana": "integer", "maxMana": "integer", "strength": "integer", "dexterity": "integer", "constitution": "integer", "intelligence": "integer", "wisdom": "integer", "charisma": "integer" },
    "inventory": [{ "item": { "id": "string", "name": "string", ... }, "quantity": "integer" }],
    "equipment": { "mainHand": { "id": "string", ... }, "chest": { "id": "string", ... } },
    "reputation": "integer", "gold": "integer"
  },
  "initialScene": { "location": "string", "description": "string", "npcs": [{"name": "string", "description": "string", "attitude": "string", "shopId": "string | null"}], "availableShopIds": ["string"] },
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

    async generateNextScene(character: Character, party: Character[], scene: Scene, history: StoryEntry[], longTermMemory: WorldMemory, notes: string, quests: Quest[], worldEvents: WorldEvent[], turnCount: number, playerAction: string, transactionLog: TransactionLogEntry[], marketplace: Marketplace): Promise<GameTurnResponse> {
        const recentHistory = history.slice(-5).map(entry => {
            if(entry.type === 'action') return `Pemain: ${entry.content}`;
            if(entry.type === 'narrative') return `DM: ${entry.content}`;
            return '';
        }).join('\n');

        const systemPrompt = `Anda adalah Dungeon Master (DM) AI yang logis. Lanjutkan cerita. Balas HANYA dengan sebuah objek JSON tunggal yang valid.

Aturan Utama:
1.  **Konsistensi Naratif**: Baca 'MEMORI DUNIA' dan 'Latar Belakang Karakter'. Cerita Anda HARUS konsisten dengan informasi ini.
2.  **Populasi Adegan**: Jika adegan berada di lokasi yang ramai (kota, pasar, kedai), populasikan dengan 5-10 NPC yang beragam.
3.  **Tautkan Pedagang**: Jika NPC di adegan adalah seorang pedagang, isi bidang \`shopId\` mereka dengan ID toko yang sesuai dari 'DAFTAR TOKO DUNIA'.
4.  **Hanya Laporkan Perubahan**: Gunakan objek \`pembaruanKarakter\` untuk melaporkan HANYA apa yang berubah pada status karakter.
5.  **Perbarui Memori**: Jika terjadi peristiwa penting, perbarui ringkasan di \`memoryUpdate.worldStateSummary\` agar lebih relevan.

Struktur JSON yang DIWAJIBKAN:
{
  "narasiBaru": "string",
  "pembaruanKarakter": { ... },
  "sceneUpdate": { "location": "string", "description": "string", "npcs": [{"name": "string", "description": "string", "attitude": "string", "shopId": "string | null"}], "availableShopIds": ["string"] },
  "skillCheck": { ... },
  "memoryUpdate": { "keyEvents": ["string"], "keyCharacters": ["string"], "worldStateSummary": "string" },
  "questsUpdate": [ { ... } ],
  "worldEventsUpdate": [ { ... } ],
  "marketplaceUpdate": { "shops": [{...}] }
}`;

        const userPrompt = `Giliran Saat Ini: ${turnCount}
MEMORI DUNIA: ${JSON.stringify(longTermMemory)}
Latar Belakang Karakter: ${character.backstory}
DAFTAR TOKO DUNIA: ${JSON.stringify(marketplace.shops.map(s => ({id: s.id, name: s.name})))}

Kondisi Saat Ini:
- Karakter Pemain: ${JSON.stringify({name: character.name, appearance: character.appearance, stats: character.stats})}
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

    async askOOCQuestion(history: StoryEntry[], longTermMemory: WorldMemory, question: string): Promise<string> {
        const recentHistory = history.slice(-10).map(entry => {
            if(entry.type === 'action' || entry.type === 'ooc_query') return `Pemain: ${entry.content}`;
            if(entry.type === 'narrative' || entry.type === 'ooc_response') return `GM: ${entry.content}`;
            return '';
        }).join('\n');

        const systemPrompt = `Anda adalah Game Master (GM) yang membantu. Pemain mengajukan pertanyaan di luar karakter (OOC). Jawab dengan jelas dan singkat berdasarkan konteks cerita.`;

        const userPrompt = `Konteks Cerita:
MEMORI DUNIA:
- ${JSON.stringify(longTermMemory)}
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