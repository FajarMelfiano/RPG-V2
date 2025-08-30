import OpenAI from 'openai';
import { Character, GameTurnResponse, Scene, StoryEntry } from '../../types';
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
    async generateCharacter(characterData: { concept: string; background: string; }): Promise<{ character: Omit<Character, 'id'>; initialScene: Scene; introStory: string; }> {
        
        const systemPrompt = `Anda adalah Dungeon Master (DM) AI yang sangat cerdas untuk sebuah game RPG. Tugas Anda adalah menciptakan karakter dan adegan awal berdasarkan masukan pemain. Balas HANYA dengan sebuah objek JSON tunggal yang valid, tanpa teks tambahan atau format markdown.
        
Aturan Penting:
- **Level Awal Dinamis**: Analisis 'Latar Belakang & Pengalaman' untuk menentukan level awal. Karakter berpengalaman (veteran perang, pahlawan terkenal) harus dimulai pada level yang lebih tinggi (misalnya 3-5) dengan statistik dan HP/Mana yang sesuai. Pemula dimulai pada level 1.
- Adegan awal ('initialScene' dan 'introStory') HARUS merupakan kelanjutan yang logis dan langsung dari 'backstory' karakter.
- Nama karakter dan NPC harus unik, bervariasi, dan sesuai dengan tema fantasi. Hindari nama-nama umum.

Struktur JSON yang DIWAJIBKAN:
{
  "character": {
    "name": "string (Jika pemain menyebutkan nama, gunakan itu. Jika tidak, buat nama fantasi yang unik dan bervariasi)",
    "race": "string (dari konsep inti)",
    "characterClass": "string (dari konsep inti)",
    "backstory": "string (ringkasan mendalam dari masukan pemain)",
    "stats": { "level": "integer (Analisis latar belakang. Pemula = 1, Veteran = 3-5)", "health": "integer (sesuaikan dgn level)", "maxHealth": "integer (sesuaikan dgn level)", "mana": "integer (sesuaikan dgn level)", "maxMana": "integer (sesuaikan dgn level)", "strength": "integer (8-18, dipengaruhi latar belakang)", "dexterity": "integer (8-18)", "constitution": "integer (8-18)", "intelligence": "integer (8-18, dipengaruhi latar belakang)", "wisdom": "integer (8-18)", "charisma": "integer (8-18)" },
    "inventory": [{ "name": "string", "quantity": "integer", "description": "string", "value": "integer (harga dalam emas)" }],
    "reputation": "integer (0 jika netral, positif jika latar belakang menyebutkan kepahlawanan)",
    "gold": "integer (dipengaruhi latar belakang, misal: bangsawan 100, petualang 25)"
  },
  "initialScene": {
    "location": "string (nama lokasi awal)",
    "description": "string (deskripsi singkat lokasi)",
    "npcs": [{ "name": "string (Nama harus unik dan fantasi)", "description": "string", "attitude": "'Ramah'|'Netral'|'Curiga'|'Bermusuhan'", "inventory": [{...}] }]
  },
  "introStory": "string (narasi pembuka petualangan yang imersif)"
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

    async generateNextScene(character: Character, party: Character[], scene: Scene, history: StoryEntry[], longTermMemory: string[], notes: string, playerAction: string): Promise<GameTurnResponse> {
        const recentHistory = history.slice(-5).map(entry => {
            if(entry.type === 'action') return `Pemain: ${entry.content}`;
            if(entry.type === 'narrative') return `DM: ${entry.content}`;
            return '';
        }).join('\n');

        const systemPrompt = `Anda adalah Dungeon Master (DM) AI yang logis dengan ingatan sempurna. Tugas Anda adalah melanjutkan cerita berdasarkan aksi pemain dan menjaga konsistensi dunia. Balas HANYA dengan sebuah objek JSON tunggal yang valid.

Aturan Utama & Proses Berpikir:
1.  **Konsistensi Dunia & Konteks Pemain**: Gunakan 'MEMORI JANGKA PANJANG' dan 'CATATAN PRIBADI PEMAIN' sebagai sumber kebenaran. Jangan bertentangan dengan peristiwa yang sudah terjadi dan pastikan narasi merespons apa yang dianggap penting oleh pemain (dari catatannya).
2.  **Skill Check**: Jika aksi pemain memiliki hasil yang tidak pasti ("mencoba", "berusaha"), lakukan 'Pemeriksaan Keterampilan'. Tentukan atribut yang relevan, DC yang logis, simulasikan d20, hitung bonus, dan isi objek \`skillCheck\`. Jika tidak, jangan sertakan objek \`skillCheck\`.
3.  **Konsekuensi**: Narasi harus mencerminkan keberhasilan atau kegagalan \`skillCheck\`. Perbarui semua status yang terpengaruh (\`karakterTerbaru\`, \`partyTerbaru\`, \`sceneUpdate\`).
4.  **Memori Baru**: Jika terjadi peristiwa yang sangat penting di giliran ini (item kunci, NPC bergabung/mati, lokasi ditemukan), buat ringkasan satu kalimat di \`memorySummary\`. Jika tidak, jangan sertakan field ini.
5.  **Manajemen Party**: Selalu kembalikan daftar party LENGKAP saat ini di \`partyTerbaru\`, bahkan jika kosong. Perbarui status anggota party jika terpengaruh oleh aksi.
6.  **Nama NPC Unik**: Jika ada NPC baru yang muncul di \`sceneUpdate\`, nama mereka HARUS unik dan belum pernah digunakan dalam sejarah cerita.

Struktur JSON yang DIWAJIBKAN:
{
  "narasiBaru": "string (deskripsi detail hasil aksi)",
  "karakterTerbaru": { "name": "string", "race": "string", "characterClass": "string", "backstory": "string", "stats": {}, "inventory": [], "reputation": "integer", "gold": "integer" },
  "partyTerbaru": [ { "name": "string", "race": "string", ... } ],
  "sceneUpdate": { "location": "string", "description": "string", "npcs": [] },
  "skillCheck": { "skill": "string", "attribute": "string", "diceRoll": "integer", "bonus": "integer", "total": "integer", "dc": "integer", "success": "boolean" },
  "notifications": [ "string" ],
  "memorySummary": "string (ringkasan satu kalimat dari peristiwa penting)"
}`;

        const userPrompt = `MEMORI JANGKA PANJANG (Sejarah Dunia):
- ${longTermMemory.join('\n- ')}
${notes.trim() ? `
CATATAN PRIBADI PEMAIN (Informasi ini adalah pemikiran internal pemain. Gunakan untuk memandu narasi):
${notes}` : ''}

Kondisi Saat Ini:
- Karakter Pemain: ${JSON.stringify(character, null, 2)}
- Party (Rekan): ${JSON.stringify(party, null, 2)}
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

    async askOOCQuestion(history: StoryEntry[], longTermMemory: string[], question: string): Promise<string> {
        const recentHistory = history.slice(-10).map(entry => {
            if(entry.type === 'action' || entry.type === 'ooc_query') return `Pemain: ${entry.content}`;
            if(entry.type === 'narrative' || entry.type === 'ooc_response') return `GM: ${entry.content}`;
            return '';
        }).join('\n');

        const systemPrompt = `Anda adalah Game Master (GM) yang membantu untuk sebuah game RPG. Pemain mengajukan pertanyaan di luar karakter (OOC). Tugas Anda adalah menjawab pertanyaan mereka dengan jelas, singkat, dan bermanfaat. Gunakan konteks cerita yang diberikan untuk memberikan jawaban yang akurat. Jangan menjawab sebagai karakter dalam game. Jawab langsung pertanyaannya.`;

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
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
        });

        return completion.choices[0]?.message?.content ?? "Maaf, saya tidak bisa memproses permintaan itu saat ini.";
    }
}

export const openAiProvider = new OpenAiDungeonMaster();