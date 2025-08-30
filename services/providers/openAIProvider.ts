import OpenAI from 'openai';
import { Character, GameTurnResponse, Scene, StoryEntry, Quest, WorldEvent } from '../../types';
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
    async generateWorld(worldData: { concept: string; factions: string; conflict: string; }): Promise<{ name: string; description: string; }> {
        const systemPrompt = `Anda adalah seorang Arsitek Dunia AI. Tugas Anda adalah mengubah ide-ide pemain menjadi fondasi dunia fantasi yang kohesif. Balas HANYA dengan sebuah objek JSON tunggal yang valid.

Struktur JSON yang DIWAJIBKAN:
{
  "name": "string (Nama yang epik dan unik untuk dunia, berdasarkan konsepnya)",
  "description": "string (Deskripsi imersif 3-4 kalimat yang menyatukan konsep, faksi, dan konflik)"
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
        
        const systemPrompt = `Anda adalah Dungeon Master (DM) AI. Tugas Anda adalah menciptakan karakter yang secara logis cocok dengan dunia yang sudah ada. Balas HANYA dengan sebuah objek JSON tunggal yang valid.
        
Aturan Penting:
- **Konteks Dunia adalah Segalanya**: Latar belakang, afiliasi, dan masalah karakter HARUS berakar pada deskripsi dunia yang diberikan.
- **Level Awal Dinamis**: Analisis 'Latar Belakang & Pengalaman' untuk menentukan level awal. Veteran = level 3-5, Pemula = level 1.
- Adegan awal ('initialScene' dan 'introStory') HARUS merupakan kelanjutan yang logis dari 'backstory' karakter.

Struktur JSON yang DIWAJIBKAN:
{
  "character": {
    "name": "string (Buat nama fantasi yang unik)",
    "race": "string", "characterClass": "string",
    "backstory": "string (ringkasan mendalam, relevan dengan dunia)",
    "stats": { "level": "integer (1-5)", "health": "integer", "maxHealth": "integer", "mana": "integer", "maxMana": "integer", "strength": "integer (8-18)", "dexterity": "integer (8-18)", "constitution": "integer (8-18)", "intelligence": "integer (8-18)", "wisdom": "integer (8-18)", "charisma": "integer (8-18)" },
    "inventory": [{ "name": "string", "quantity": "integer", "description": "string", "value": "integer" }],
    "reputation": "integer", "gold": "integer"
  },
  "initialScene": { "location": "string", "description": "string", "npcs": [{...}] },
  "introStory": "string (narasi pembuka yang imersif)"
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

    async generateNextScene(character: Character, party: Character[], scene: Scene, history: StoryEntry[], longTermMemory: string[], notes: string, quests: Quest[], worldEvents: WorldEvent[], turnCount: number, playerAction: string): Promise<GameTurnResponse> {
        const recentHistory = history.slice(-5).map(entry => {
            if(entry.type === 'action') return `Pemain: ${entry.content}`;
            if(entry.type === 'narrative') return `DM: ${entry.content}`;
            return '';
        }).join('\n');

        const systemPrompt = `Anda adalah Dungeon Master (DM) AI yang logis. Lanjutkan cerita, kelola misi, dan buat dunia terasa hidup. Balas HANYA dengan sebuah objek JSON tunggal yang valid.

Aturan Utama:
1.  **Konsistensi Dunia**: Gunakan semua data yang diberikan sebagai sumber kebenaran.
2.  **Aksi "Periksa"**: Jika aksi pemain adalah "Periksa [Nama NPC]", berikan deskripsi yang lebih mendalam. Anda BISA memicu \`skillCheck\` (Insight/Investigasi) untuk mengungkap petunjuk tersembunyi.
3.  **Sikap NPC Dinamis**: Sikap NPC dalam \`sceneUpdate\` HARUS diperbarui secara logis berdasarkan tindakan pemain (misalnya, menjadi lebih ramah atau lebih curiga).
4.  **Manajemen Misi**: Deteksi atau perbarui misi di \`questsUpdate\`.
5.  **Tawarikh Dunia**: Secara berkala (setiap 5-10 giliran), ciptakan satu peristiwa dunia baru di \`worldEventsUpdate\`.
6.  **Skill Check**: Jika hasil aksi (selain Periksa) tidak pasti, sertakan objek \`skillCheck\`.
7.  **Memori Baru**: Jika terjadi peristiwa penting, buat ringkasan di \`memorySummary\`.

Struktur JSON yang DIWAJIBKAN:
{
  "narasiBaru": "string",
  "karakterTerbaru": { ... },
  "partyTerbaru": [ ... ],
  "sceneUpdate": { ... },
  "skillCheck": { ... },
  "notifications": [ "string" ],
  "memorySummary": "string (opsional)",
  "questsUpdate": [ { ... } ],
  "worldEventsUpdate": [ { ... } ]
}`;

        const userPrompt = `Giliran Saat Ini: ${turnCount}
MEMORI JANGKA PANJANG:
- ${longTermMemory.join('\n- ') || 'Belum ada.'}
${notes.trim() ? `CATATAN PRIBADI PEMAIN:\n${notes}` : ''}

Kondisi Saat Ini:
- Karakter Pemain: ${JSON.stringify(character, null, 2)}
- Party: ${JSON.stringify(party, null, 2)}
- Adegan: ${JSON.stringify(scene, null, 2)}
- Misi: ${JSON.stringify(quests, null, 2)}
- Tawarikh Dunia: ${JSON.stringify(worldEvents, null, 2)}
Log Terbaru:
${recentHistory}

Aksi Pemain:
"${playerAction}"`;

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