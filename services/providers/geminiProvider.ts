import { GoogleGenAI, Type } from "@google/genai";
import { Character, GameTurnResponse, Scene, StoryEntry } from '../../types';
import { IAiDungeonMasterService } from "../aiService";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set. The application cannot start without it.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Skema JSON (tetap sama seperti sebelumnya)
const inventoryItemSchema = {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING },
      quantity: { type: Type.INTEGER },
      description: { type: Type.STRING },
      value: { type: Type.INTEGER, description: "Harga dasar item dalam keping emas. Harus lebih dari 0." }
    },
    required: ["name", "quantity", "description", "value"]
};

const characterSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "Nama karakter." },
    race: { type: Type.STRING, description: "Ras karakter (contoh: Manusia, Elf, Kurcaci)." },
    characterClass: { type: Type.STRING, description: "Kelas karakter (contoh: Prajurit, Penyihir, Pencuri)." },
    backstory: { type: Type.STRING, description: "Latar belakang cerita yang mendalam dan menarik untuk karakter dalam Bahasa Indonesia, berdasarkan masukan pemain." },
    stats: {
      type: Type.OBJECT,
      properties: {
        level: { type: Type.INTEGER, description: "Level awal karakter. Analisis latar belakang. Veteran bisa mulai dari level 3-5, pemula mulai dari 1." },
        health: { type: Type.INTEGER, description: "Poin kesehatan (HP) karakter saat ini, disesuaikan dengan level." },
        maxHealth: { type: Type.INTEGER, description: "Poin kesehatan (HP) maksimum karakter. Harus sama dengan health di awal, disesuaikan dengan level." },
        mana: { type: Type.INTEGER, description: "Poin mana karakter. Jika bukan kelas sihir, set ke 0. Disesuaikan dengan level." },
        maxMana: { type: Type.INTEGER, description: "Poin mana maksimum. Jika bukan kelas sihir, set ke 0. Disesuaikan dengan level." },
        strength: { type: Type.INTEGER, description: "Nilai antara 8 dan 18." },
        dexterity: { type: Type.INTEGER, description: "Nilai antara 8 dan 18." },
        constitution: { type: Type.INTEGER, description: "Nilai antara 8 dan 18." },
        intelligence: { type: Type.INTEGER, description: "Nilai antara 8 dan 18." },
        wisdom: { type: Type.INTEGER, description: "Nilai antara 8 dan 18." },
        charisma: { type: Type.INTEGER, description: "Nilai antara 8 dan 18." },
      },
      required: ["level", "health", "maxHealth", "mana", "maxMana", "strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"]
    },
    inventory: {
      type: Type.ARRAY,
      items: inventoryItemSchema
    },
    reputation: { type: Type.INTEGER, description: "Reputasi awal karakter, berdasarkan latar belakang. Bisa positif jika mereka pahlawan, atau 0 jika tidak dikenal." },
    gold: { type: Type.INTEGER, description: "Jumlah keping emas awal, berdasarkan latar belakang. Bangsawan mungkin punya 100, petualang biasa 25, orang miskin 5."}
  },
  required: ["name", "race", "characterClass", "backstory", "stats", "inventory", "reputation", "gold"]
};

const initialSceneSchema = {
    type: Type.OBJECT,
    properties: {
        location: { type: Type.STRING, description: "Nama lokasi awal yang sesuai dengan latar belakang karakter." },
        description: { type: Type.STRING, description: "Deskripsi singkat (2 kalimat) tentang lokasi dan suasana awal." },
        npcs: { 
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "Nama NPC yang unik dan sesuai fantasi." },
                    description: { type: Type.STRING },
                    attitude: { type: Type.STRING, enum: ['Ramah', 'Netral', 'Curiga', 'Bermusuhan'] },
                    inventory: {
                        type: Type.ARRAY,
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
    type: Type.OBJECT,
    properties: {
        character: characterSchema,
        initialScene: initialSceneSchema,
        introStory: { type: Type.STRING, description: "Narasi pembuka yang mendalam dan imersif untuk memulai petualangan karakter dalam Bahasa Indonesia."}
    },
    required: ["character", "initialScene", "introStory"]
};


const gameTurnSchema = {
    type: Type.OBJECT,
    properties: {
        narasiBaru: { type: Type.STRING, description: "Bagian cerita selanjutnya dalam Bahasa Indonesia, mendeskripsikan hasil dari aksi pemain dan situasi baru. Harus menarik dan detail. Jika HP karakter 0 atau kurang, ini adalah narasi kematian mereka." },
        karakterTerbaru: characterSchema,
        partyTerbaru: {
            type: Type.ARRAY,
            description: "Daftar LENGKAP semua anggota party saat ini, dengan statistik terbarunya. Jika tidak ada anggota party, ini adalah array kosong.",
            items: characterSchema
        },
        sceneUpdate: initialSceneSchema,
        skillCheck: {
            type: Type.OBJECT,
            properties: {
                skill: { type: Type.STRING, description: "Keterampilan yang diuji (contoh: Persuasi, Akrobatik)." },
                attribute: { type: Type.STRING, description: "Atribut yang digunakan (contoh: Karisma, Ketangkasan)." },
                diceRoll: { type: Type.INTEGER, description: "Hasil lemparan dadu d20 murni (angka antara 1 dan 20)." },
                bonus: { type: Type.INTEGER, description: "Bonus dari atribut karakter. Dihitung sebagai (nilai_atribut - 10) / 2, dibulatkan ke bawah." },
                total: { type: Type.INTEGER, description: "Total dari diceRoll + bonus." },
                dc: { type: Type.INTEGER, description: "Tingkat Kesulitan (Difficulty Class) yang harus dikalahkan." },
                success: { type: Type.BOOLEAN, description: "Apakah total lemparan lebih besar atau sama dengan DC." }
            },
            required: ["skill", "attribute", "diceRoll", "bonus", "total", "dc", "success"]
        },
        notifications: {
            type: Type.ARRAY,
            description: "Daftar singkat notifikasi untuk pemain tentang peristiwa penting, seperti 'Item Ditemukan: Kunci Berkarat', 'Reputasi +1', atau '+50 Emas'. Kosongkan jika tidak ada.",
            items: { type: Type.STRING }
        },
        memorySummary: {
            type: Type.STRING,
            description: "Ringkasan singkat (satu kalimat) dari peristiwa penting di giliran ini untuk disimpan dalam ingatan jangka panjang. Contoh: 'Pemain merekrut Gorn si pandai besi di kota Brightwood', atau 'Pemain mengalahkan pemimpin goblin dan menemukan peta harta karun'. Biarkan kosong jika tidak ada peristiwa yang cukup penting untuk diingat."
        }
    },
    required: ["narasiBaru", "karakterTerbaru", "partyTerbaru", "sceneUpdate"]
};


class GeminiDungeonMaster implements IAiDungeonMasterService {
    async generateCharacter(characterData: { concept: string; background: string; }): Promise<{ character: Omit<Character, 'id'>; initialScene: Scene; introStory: string; }> {
        const prompt = `Anda adalah seorang Dungeon Master (DM) AI yang sangat cerdas dan kreatif untuk sebuah game RPG fantasi bergaya Dungeons & Dragons. Tugas Anda adalah menciptakan karakter yang mendalam dan hidup berdasarkan masukan pemain. SEMUA output harus dalam Bahasa Indonesia.

Masukan Pemain:
- Konsep Inti: "${characterData.concept}"
- Latar Belakang & Pengalaman: "${characterData.background}"

Tugas Anda (Ikuti dengan SANGAT TELITI):
1.  **Analisis Mendalam**: Baca dan pahami **kedua** masukan pemain secara holistik.
2.  **Tentukan Level Awal**: Analisis 'Latar Belakang & Pengalaman'. Jika menggambarkan seorang pahlawan yang berpengalaman (veteran perang, penyihir agung, ksatria terkenal), tetapkan \`level\` awal yang lebih tinggi (misalnya, 3, 4, atau 5). Jika mereka seorang pemula atau baru memulai, \`level\` adalah 1. Statistik lain seperti \`maxHealth\` dan \`maxMana\` harus disesuaikan secara logis dengan level ini.
3.  **Ciptakan Identitas Karakter**:
    *   **Nama**: Cari nama potensial dari masukan pemain. Jika tidak ada nama yang disebutkan, ciptakan nama fantasi yang unik dan bervariasi yang sesuai dengan ras dan kelasnya. HINDARI NAMA UMUM.
    *   **Ras & Kelas**: Tentukan ini dari 'Konsep Inti'.
4.  **Alokasi Statistik Cerdas**: Gunakan 'Latar Belakang & Pengalaman' untuk memengaruhi statistik. Latar belakang sebagai 'pandai besi veteran' harus menghasilkan Strength yang tinggi. 'Sarjana dari menara gading' harus memiliki Intelligence yang sangat tinggi. Jaga agar nilai tetap antara 8-18, tapi buatlah distribusi yang mencerminkan cerita.
5.  **Ekonomi Awal**: Berikan jumlah 'gold' dan 'reputation' awal berdasarkan latar belakang. Bangsawan kaya bisa mulai dengan 100 emas dan reputasi +5, petualang biasa 25 emas dan reputasi 0. Tetapkan 'value' yang masuk akal untuk SETIAP item di inventaris awal.
6.  **Inventaris Personal**: Ciptakan inventaris awal yang masuk akal. **Jika pemain menyebutkan item spesifik** (misalnya, "membawa pedang warisan ayahku"), pastikan item itu ada di dalam inventaris.
7.  **Tulis Latar Belakang (Backstory)**: Sintesiskan masukan pemain menjadi sebuah \`backstory\` yang mendalam dan menarik.
8.  **Ciptakan Adegan Awal yang Logis**: Buat \`initialScene\` dan \`introStory\` yang merupakan **kelanjutan langsung dan logis** dari \`backstory\` karakter. Pastikan nama NPC di adegan awal unik, jangan diulang-ulang.
9.  **Format JSON**: Pastikan output Anda sesuai dengan skema JSON yang diberikan.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
            responseMimeType: "application/json",
            responseSchema: characterGenerationSchema
            }
        });

        const jsonString = response.text;
        return JSON.parse(jsonString);
    }

    async generateNextScene(character: Character, party: Character[], scene: Scene, history: StoryEntry[], longTermMemory: string[], notes: string, playerAction: string): Promise<GameTurnResponse> {
        const recentHistory = history.slice(-5).map(entry => {
            if(entry.type === 'action') return `Pemain: ${entry.content}`;
            if(entry.type === 'narrative') return `DM: ${entry.content}`;
            return '';
        }).join('\n');
        
        const prompt = `Anda adalah Dungeon Master (DM) AI yang logis dan konsisten dengan ingatan yang sempurna. Tugas Anda adalah melanjutkan cerita berdasarkan aksi pemain dan menjaga konsistensi dunia. Selalu balas dalam Bahasa Indonesia.

MEMORI JANGKA PANJANG (Sejarah Dunia):
- ${longTermMemory.join('\n- ')}
${notes.trim() ? `
CATATAN PRIBADI PEMAIN (Gunakan ini untuk memahami fokus, teori, dan kecurigaan pemain):
${notes}` : ''}

Kondisi Saat Ini:
- Karakter Pemain: ${JSON.stringify(character, null, 2)}
- Party (Rekan): ${JSON.stringify(party, null, 2)}
- Adegan: ${JSON.stringify(scene, null, 2)}
- Log Cerita Terbaru:
${recentHistory}

Aksi Pemain:
"${playerAction}"

Tugas Anda (Ikuti Urutan Ini dengan SANGAT TELITI):
1.  **Analisis & Konsistensi Dunia**: Baca 'MEMORI JANGKA PANJANG', 'CATATAN PRIBADI PEMAIN', dan 'Log Cerita Terbaru'. Pastikan respons Anda tidak bertentangan dengan peristiwa yang sudah terjadi dan mempertimbangkan apa yang menurut pemain penting (dari catatannya). Jika pemain kembali ke lokasi yang sudah dikunjungi, ingat keadaannya dari memori.

2.  **Tentukan Kebutuhan Skill Check**: Analisis Aksi Pemain.
    *   **Apakah hasilnya tidak pasti?** (Contoh: "Aku mencoba melompati celah", "Aku mencoba membujuk penjaga", "Aku mencari jebakan").
    *   **JIKA YA**: Lakukan 'Pemeriksaan Keterampilan' (skillCheck).
        *   Tentukan keterampilan & atribut yang paling relevan (misal: Melompat -> Ketangkasan, Membujuk -> Karisma).
        *   Tentukan Tingkat Kesulitan (DC) yang logis (5=Sangat Mudah, 15=Sedang, 25=Sangat Sulit).
        *   Simulasikan lemparan d20 (angka acak 1-20).
        *   Hitung bonus: \`(nilai_atribut - 10) / 2\`, bulatkan ke bawah.
        *   Tentukan keberhasilan (d20 + bonus >= DC).
        *   Isi objek \`skillCheck\` secara lengkap.
    *   **JIKA TIDAK** (Contoh: "Aku berbicara dengan bartender", "Aku berjalan ke utara"), jangan buat \`skillCheck\`.

3.  **Proses Aksi & Konsekuensi Logis**:
    *   Narasikan hasil aksi berdasarkan hasil (atau ketiadaan) \`skillCheck\`. Jika gagal, deskripsikan konsekuensi negatif yang logis. Jika berhasil, deskripsikan hasilnya.
    *   Perbarui SEMUA status yang terpengaruh (HP, Emas, Reputasi, Inventaris) baik untuk pemain (\`karakterTerbaru\`) maupun party (\`partyTerbaru\`).
    *   Perbarui adegan (\`sceneUpdate\`), termasuk deskripsi, lokasi baru, atau perubahan sikap/inventaris NPC. Jika NPC baru muncul, berikan mereka nama yang unik dan belum pernah digunakan sebelumnya dalam cerita ini. HINDARI PENGULANGAN NAMA NPC.

4.  **Ciptakan Memori Baru**:
    *   Setelah memproses semuanya, pikirkan: "Apakah ada peristiwa penting yang terjadi di giliran ini yang harus diingat selamanya?" (misal: NPC penting direkrut/mati, item quest ditemukan, lokasi penting ditemukan, keputusan besar dibuat).
    *   **JIKA YA**: Tulis ringkasan satu kalimat yang jelas di \`memorySummary\`.
    *   **JIKA TIDAK**: Biarkan \`memorySummary\` kosong atau tidak ada.

5.  **Format Respons**: Pastikan respons Anda sesuai dengan skema JSON yang disediakan.`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: gameTurnSchema
            }
        });

        const jsonString = response.text;
        return JSON.parse(jsonString) as GameTurnResponse;
    }

    async askOOCQuestion(history: StoryEntry[], longTermMemory: string[], question: string): Promise<string> {
        const recentHistory = history.slice(-10).map(entry => {
            if(entry.type === 'action') return `Pemain: ${entry.content}`;
            if(entry.type === 'narrative') return `DM: ${entry.content}`;
            return '';
        }).join('\n');

        const prompt = `Anda adalah seorang Game Master (GM) yang membantu untuk sebuah game RPG. Pemain mengajukan pertanyaan di luar karakter (Out-of-Character/OOC). Tugas Anda adalah menjawab pertanyaan mereka dengan jelas dan singkat, berdasarkan konteks cerita yang ada. Jangan menjawab sebagai karakter dalam game, tetapi sebagai GM yang mengetahui segalanya tentang dunia game.

MEMORI JANGKA PANJANG (Sejarah Dunia):
- ${longTermMemory.join('\n- ')}

Konteks Cerita Terbaru:
${recentHistory}

Pertanyaan OOC Pemain:
"${question}"

Jawaban Anda (sebagai GM):`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        return response.text;
    }
}

export const geminiProvider = new GeminiDungeonMaster();