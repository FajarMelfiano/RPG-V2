import { Character, GameTurnResponse, Scene, StoryEntry } from '../../types';
import { IAiDungeonMasterService } from "../aiService";

// Konfigurasi untuk Main Docs API Provider
const API_URL = 'https://api.arliai.com/v1/chat/completions';
const API_KEY = '70795356-db55-4fe3-9cf0-6a378cfdb6f5';
const MODEL = 'Gemma-3-27B-ArliAI-RPMax-v3';

// ---- Skema JSON untuk Guided Generation ----

const inventoryItemSchema = {
    type: "object",
    properties: {
      name: { type: "string" },
      quantity: { type: "integer" },
      description: { type: "string" },
      value: { type: "integer", description: "Harga dasar item dalam keping emas. Harus lebih dari 0." }
    },
    required: ["name", "quantity", "description", "value"]
};

const characterSchema = {
  type: "object",
  properties: {
    name: { type: "string", description: "Nama karakter." },
    race: { type: "string", description: "Ras karakter (contoh: Manusia, Elf, Kurcaci)." },
    characterClass: { type: "string", description: "Kelas karakter (contoh: Prajurit, Penyihir, Pencuri)." },
    backstory: { type: "string", description: "Latar belakang cerita yang menarik dan singkat untuk karakter (2-3 kalimat) dalam Bahasa Indonesia, berdasarkan masukan pemain." },
    stats: {
      type: "object",
      properties: {
        level: { type: "integer", description: "Level awal karakter, harus 1." },
        health: { type: "integer", description: "Poin kesehatan (HP) karakter saat ini." },
        maxHealth: { type: "integer", description: "Poin kesehatan (HP) maksimum karakter. Harus sama dengan health di awal." },
        mana: { type: "integer", description: "Poin mana karakter. Jika bukan kelas sihir, set ke 0." },
        maxMana: { type: "integer", description: "Poin mana maksimum. Jika bukan kelas sihir, set ke 0." },
        strength: { type: "integer", description: "Nilai antara 8 dan 18." },
        dexterity: { type: "integer", description: "Nilai antara 8 dan 18." },
        constitution: { type: "integer", description: "Nilai antara 8 dan 18." },
        intelligence: { type: "integer", description: "Nilai antara 8 dan 18." },
        wisdom: { type: "integer", description: "Nilai antara 8 dan 18." },
        charisma: { type: "integer", description: "Nilai antara 8 dan 18." },
      },
      required: ["level", "health", "maxHealth", "mana", "maxMana", "strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"]
    },
    inventory: {
      type: "array",
      items: inventoryItemSchema
    },
    reputation: { type: "integer", description: "Reputasi awal karakter, berdasarkan latar belakang. Bisa positif jika mereka pahlawan, atau 0 jika tidak dikenal." },
    gold: { type: "integer", description: "Jumlah keping emas awal, berdasarkan latar belakang. Bangsawan mungkin punya 100, petualang biasa 25, orang miskin 5."}
  },
  required: ["name", "race", "characterClass", "backstory", "stats", "inventory", "reputation", "gold"]
};

const initialSceneSchema = {
    type: "object",
    properties: {
        location: { type: "string", description: "Nama lokasi awal yang sesuai dengan latar belakang karakter." },
        description: { type: "string", description: "Deskripsi singkat (2 kalimat) tentang lokasi dan suasana awal." },
        npcs: { 
            type: "array",
            items: {
                type: "object",
                properties: {
                    name: { type: "string" },
                    description: { type: "string" },
                    attitude: { type: "string", enum: ['Ramah', 'Netral', 'Curiga', 'Bermusuhan'] },
                    inventory: {
                        type: "array",
                        description: "Jika NPC ini adalah pedagang, isi dengan barang yang mereka jual. Jika tidak, biarkan kosong.",
                        items: inventoryItemSchema
                    }
                },
                required: ["name", "description", "attitude"]
            }
        }
    },
    required: ["location", "description", "npcs"]
}

const characterGenerationSchema = {
    type: "object",
    properties: {
        character: characterSchema,
        initialScene: initialSceneSchema,
        introStory: { type: "string", description: "Narasi pembuka singkat (2-3 kalimat) untuk memulai petualangan karakter dalam Bahasa Indonesia."}
    },
    required: ["character", "initialScene", "introStory"]
};


const gameTurnSchema = {
    type: "object",
    properties: {
        narasiBaru: { type: "string", description: "Bagian cerita selanjutnya dalam Bahasa Indonesia, mendeskripsikan hasil dari aksi pemain dan situasi baru. Harus menarik dan detail. Jika HP karakter 0 atau kurang, ini adalah narasi kematian mereka." },
        karakterTerbaru: characterSchema,
        sceneUpdate: initialSceneSchema,
        skillCheck: {
            type: "object",
            properties: {
                skill: { type: "string", description: "Keterampilan yang diuji (contoh: Persuasi, Akrobatik)." },
                attribute: { type: "string", description: "Atribut yang digunakan (contoh: Karisma, Ketangkasan)." },
                diceRoll: { type: "integer", description: "Hasil lemparan dadu d20 murni (angka antara 1 dan 20)." },
                bonus: { type: "integer", description: "Bonus dari atribut karakter. Dihitung sebagai (nilai_atribut - 10) / 2, dibulatkan ke bawah." },
                total: { type: "integer", description: "Total dari diceRoll + bonus." },
                dc: { type: "integer", description: "Tingkat Kesulitan (Difficulty Class) yang harus dikalahkan." },
                success: { type: "boolean", description: "Apakah total lemparan lebih besar atau sama dengan DC." }
            },
        },
        notifications: {
            type: "array",
            description: "Daftar singkat notifikasi untuk pemain tentang peristiwa penting, seperti 'Item Ditemukan: Kunci Berkarat', 'Reputasi +1', atau '+50 Emas'. Kosongkan jika tidak ada.",
            items: { type: "string" }
        }
    },
    required: ["narasiBaru", "karakterTerbaru", "sceneUpdate"]
};

// Fungsi bantuan untuk mengekstrak konten JSON yang mungkin terbungkus dalam Markdown.
const getJsonContent = (content: string | null): string | null => {
    if (!content) return null;
    // Mencari ```json (...) ``` atau objek JSON murni
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```|({[\s\S]*})/);
    return jsonMatch ? (jsonMatch[1] || jsonMatch[2]) : content;
}

class MainDocsDungeonMaster implements IAiDungeonMasterService {
    private async makeApiCall(messages: {role: 'system' | 'user', content: string}[], schema: object): Promise<string | null> {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: MODEL,
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 2048,
                    // Menggunakan 'guided_json' untuk memastikan output sesuai skema.
                    guided_json: schema
                })
            });

            if (!response.ok) {
                const errorBody = await response.text();
                console.error(`Kesalahan API: ${response.status} ${response.statusText}`, errorBody);
                throw new Error(`Permintaan API gagal dengan status ${response.status}`);
            }

            const data = await response.json();
            const content = data.choices?.[0]?.message?.content ?? null;
            return getJsonContent(content);

        } catch (error) {
            console.error("Gagal saat mengambil data dari Main Docs API", error);
            throw error;
        }
    }

    async generateCharacter(characterData: { concept: string; background: string; }): Promise<{ character: Character; initialScene: Scene; introStory: string; }> {
        
        const systemPrompt = `Anda adalah seorang Dungeon Master (DM) AI yang sangat cerdas dan kreatif untuk sebuah game RPG fantasi. Tugas Anda adalah menciptakan karakter yang mendalam dan hidup berdasarkan masukan pemain. Gunakan kreativitas Anda untuk mengisi semua detail karakter, adegan, dan inventaris. Balas HANYA dengan objek JSON yang valid sesuai dengan skema yang disediakan. SEMUA output harus dalam Bahasa Indonesia.`;

        const userPrompt = `Tolong ciptakan karakter berdasarkan informasi ini:
- Konsep Inti: "${characterData.concept}"
- Latar Belakang & Pengalaman: "${characterData.background}"`;
        
        const jsonString = await this.makeApiCall([
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ], characterGenerationSchema);

        if (!jsonString) {
            throw new Error("Respons dari Main Docs API kosong.");
        }
        return JSON.parse(jsonString);
    }

    async generateNextScene(character: Character, scene: Scene, history: StoryEntry[], playerAction: string): Promise<GameTurnResponse> {
        const recentHistory = history.slice(-5).map(entry => {
            if(entry.type === 'action') return `Pemain: ${entry.content}`;
            if(entry.type === 'narrative') return `DM: ${entry.content}`;
            return '';
        }).join('\n');

        const systemPrompt = `Anda adalah Dungeon Master (DM) AI. Tugas Anda adalah melanjutkan cerita berdasarkan aksi pemain. Selalu balas dalam Bahasa Indonesia dan HANYA dengan sebuah objek JSON tunggal yang valid sesuai skema.

Aturan Penting:
1.  **Pahami Maksud Pemain**: Analisis aksi pemain untuk membedakan antara: transaksi ekonomi (beli/jual), interaksi dengan item yang sudah ada, atau aksi berisiko yang memerlukan \`skillCheck\`.
2.  **Logika Kritis**: Jika pemain berinteraksi dengan item yang sudah mereka miliki (misalnya, "lihat peta"), narasikan hasilnya tanpa mengubah emas mereka. JANGAN memprosesnya sebagai pembelian baru.
3.  **Update State**: Selalu kembalikan state game yang lengkap dan diperbarui di \`karakterTerbaru\` dan \`sceneUpdate\`.
4.  **Kondisi Kalah**: Jika HP karakter <= 0, \`narasiBaru\` harus menjadi narasi kematian yang dramatis.`;

        const userPrompt = `Kondisi Saat Ini:
- Karakter: ${JSON.stringify(character, null, 2)}
- Adegan: ${JSON.stringify(scene, null, 2)}
- Log Cerita Terbaru:
${recentHistory}

Aksi Pemain:
"${playerAction}"`;
        
        const jsonString = await this.makeApiCall([
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ], gameTurnSchema);

        if (!jsonString) {
            throw new Error("Respons dari Main Docs API kosong.");
        }
        return JSON.parse(jsonString) as GameTurnResponse;
    }
}

export const mainDocsProvider = new MainDocsDungeonMaster();