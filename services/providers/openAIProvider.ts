import OpenAI from 'openai';
import { Character, GameTurnResponse, Scene, StoryEntry } from '../../types';
import { IAiDungeonMasterService } from "../aiService";

// Menggunakan kunci API yang disediakan pengguna untuk mengatasi batasan lingkungan.
// Dalam aplikasi produksi nyata, kunci ini HARUS disimpan sebagai variabel lingkungan yang aman.
const openai = new OpenAI({ 
    apiKey: "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",
    dangerouslyAllowBrowser: true // Diperlukan untuk penggunaan sisi klien
});

const getJsonContent = (completion: OpenAI.Chat.Completions.ChatCompletion): string | null => {
    return completion.choices[0]?.message?.content ?? null;
}

class OpenAiDungeonMaster implements IAiDungeonMasterService {
    async generateCharacter(characterData: { concept: string; background: string; }): Promise<{ character: Character; initialScene: Scene; introStory: string; }> {
        
        const systemPrompt = `Anda adalah Dungeon Master (DM) AI yang sangat cerdas untuk sebuah game RPG. Tugas Anda adalah menciptakan karakter dan adegan awal berdasarkan masukan pemain. Balas HANYA dengan sebuah objek JSON tunggal yang valid, tanpa teks tambahan atau format markdown.
        
Struktur JSON yang DIWAJIBKAN:
{
  "character": {
    "name": "string (Jika pemain menyebutkan nama seperti 'Prajurit Melfiano', gunakan itu. Jika tidak, buat nama yang sesuai)",
    "race": "string (dari konsep inti)",
    "characterClass": "string (dari konsep inti)",
    "backstory": "string (2-3 kalimat ringkasan dari masukan pemain)",
    "stats": { "level": 1, "health": "integer", "maxHealth": "integer", "mana": "integer", "maxMana": "integer", "strength": "integer (8-18, dipengaruhi latar belakang)", "dexterity": "integer (8-18)", "constitution": "integer (8-18)", "intelligence": "integer (8-18, dipengaruhi latar belakang)", "wisdom": "integer (8-18)", "charisma": "integer (8-18)" },
    "inventory": [{ "name": "string", "quantity": "integer", "description": "string", "value": "integer (harga dalam emas)" }],
    "reputation": "integer (0 jika netral, positif jika latar belakang menyebutkan kepahlawanan)",
    "gold": "integer (dipengaruhi latar belakang, misal: bangsawan 100, petualang 25)"
  },
  "initialScene": {
    "location": "string (nama lokasi awal)",
    "description": "string (deskripsi singkat lokasi)",
    "npcs": [{ "name": "string", "description": "string", "attitude": "'Ramah'|'Netral'|'Curiga'|'Bermusuhan'", "inventory": [{...}] }]
  },
  "introStory": "string (2-3 kalimat narasi pembuka petualangan)"
}`;

        const userPrompt = `Masukan Pemain:
- Konsep Inti: "${characterData.concept}"
- Latar Belakang & Pengalaman: "${characterData.background}"`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Model yang efisien dan cerdas
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" }
        });

        const jsonString = getJsonContent(completion);
        if (!jsonString) {
            throw new Error("OpenAI response was empty.");
        }
        return JSON.parse(jsonString);
    }

    async generateNextScene(character: Character, scene: Scene, history: StoryEntry[], playerAction: string): Promise<GameTurnResponse> {
        const recentHistory = history.slice(-5).map(entry => {
            if(entry.type === 'action') return `Pemain: ${entry.content}`;
            if(entry.type === 'narrative') return `DM: ${entry.content}`;
            return '';
        }).join('\n');

        const systemPrompt = `Anda adalah Dungeon Master (DM) AI. Tugas Anda adalah melanjutkan cerita berdasarkan aksi pemain. Balas HANYA dengan sebuah objek JSON tunggal yang valid.

Aturan Utama:
1.  **Pahami Maksud**: Analisis aksi pemain. Bedakan dengan jelas antara:
    a. **Transaksi Ekonomi**: Aksi eksplisit seperti "beli" atau "jual".
    b. **Interaksi Item**: Menggunakan atau memeriksa item yang **SUDAH ADA** di inventaris pemain (misal: "lihat peta", "baca buku").
    c. **Aksi Berisiko**: Aksi yang hasilnya tidak pasti dan memerlukan \`skillCheck\`.
2.  **Logika Kritis**: **JANGAN** memproses aksi sebagai pembelian baru jika pemain sudah memiliki item tersebut. Jika pemain mengetik "lihat peta" dan peta sudah ada di inventaris, narasikan apa yang mereka lihat. JANGAN mengurangi emas mereka lagi. Ini adalah aturan yang paling penting.
3.  **Proses Aksi**:
    *   Jika **Transaksi**, perbarui emas dan inventaris pemain/NPC.
    *   Jika **Interaksi Item**, narasikan hasilnya tanpa mengubah emas.
    *   Jika **Aksi Berisiko**, sertakan objek \`skillCheck\` dalam respons.
4.  **Update State**: Selalu kembalikan state lengkap dan terperbarui dalam \`karakterTerbaru\` dan \`sceneUpdate\`.
5.  **Narasi**: \`narasiBaru\` harus mendeskripsikan hasil aksi secara menarik. Jika HP karakter <= 0, ini adalah narasi kematian mereka.
6.  **Notifikasi**: Gunakan array \`notifications\` untuk menyorot peristiwa penting seperti perubahan emas atau item.

Struktur JSON yang DIWAJIBKAN:
{
  "narasiBaru": "string (deskripsi hasil aksi pemain, 2-4 kalimat)",
  "karakterTerbaru": {
     "name": "${character.name}", "race": "${character.race}", "characterClass": "${character.characterClass}", "backstory": "...", "stats": { ... }, "inventory": [ ... ], "reputation": "integer", "gold": "integer"
  },
  "sceneUpdate": {
    "location": "string", "description": "string", "npcs": [ ... ]
  },
  "skillCheck": {
    "skill": "string", "attribute": "string", "diceRoll": "integer (1-20)", "bonus": "integer", "total": "integer", "dc": "integer", "success": "boolean"
  },
  "notifications": [
    "string"
  ]
}`;

        const userPrompt = `Kondisi Saat Ini:
- Karakter: ${JSON.stringify(character, null, 2)}
- Adegan: ${JSON.stringify(scene, null, 2)}

Log Cerita Terbaru:
${recentHistory}

Aksi Pemain:
"${playerAction}"`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" }
        });

        const jsonString = getJsonContent(completion);
        if (!jsonString) {
            throw new Error("OpenAI response was empty.");
        }
        return JSON.parse(jsonString) as GameTurnResponse;
    }
}

export const openAiProvider = new OpenAiDungeonMaster();
