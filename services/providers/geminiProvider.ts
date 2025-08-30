import { GoogleGenAI, Type } from "@google/genai";
import { Character, GameTurnResponse, Scene, StoryEntry } from '../../types';
import { IAiDungeonMasterService } from "../aiService";

// Fix: Correctly and robustly handle API key initialization.
// The code now exclusively uses `process.env.API_KEY` as per the guidelines
// and throws a clear error if it's not set. This resolves the TypeScript error
// `Property 'process' does not exist on type 'typeof globalThis'`.
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
    backstory: { type: Type.STRING, description: "Latar belakang cerita yang menarik dan singkat untuk karakter (2-3 kalimat) dalam Bahasa Indonesia, berdasarkan masukan pemain." },
    stats: {
      type: Type.OBJECT,
      properties: {
        level: { type: Type.INTEGER, description: "Level awal karakter, harus 1." },
        health: { type: Type.INTEGER, description: "Poin kesehatan (HP) karakter saat ini." },
        maxHealth: { type: Type.INTEGER, description: "Poin kesehatan (HP) maksimum karakter. Harus sama dengan health di awal." },
        mana: { type: Type.INTEGER, description: "Poin mana karakter. Jika bukan kelas sihir, set ke 0." },
        maxMana: { type: Type.INTEGER, description: "Poin mana maksimum. Jika bukan kelas sihir, set ke 0." },
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
                    name: { type: Type.STRING },
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
        introStory: { type: Type.STRING, description: "Narasi pembuka singkat (2-3 kalimat) untuk memulai petualangan karakter dalam Bahasa Indonesia."}
    },
    required: ["character", "initialScene", "introStory"]
};


const gameTurnSchema = {
    type: Type.OBJECT,
    properties: {
        narasiBaru: { type: Type.STRING, description: "Bagian cerita selanjutnya dalam Bahasa Indonesia, mendeskripsikan hasil dari aksi pemain dan situasi baru. Harus menarik dan detail. Jika HP karakter 0 atau kurang, ini adalah narasi kematian mereka." },
        karakterTerbaru: characterSchema,
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
        }
    },
    required: ["narasiBaru", "karakterTerbaru", "sceneUpdate"]
};


class GeminiDungeonMaster implements IAiDungeonMasterService {
    async generateCharacter(characterData: { concept: string; background: string; }): Promise<{ character: Character; initialScene: Scene; introStory: string; }> {
        const prompt = `Anda adalah seorang Dungeon Master (DM) AI yang sangat cerdas dan kreatif untuk sebuah game RPG fantasi bergaya Dungeons & Dragons. Tugas Anda adalah menciptakan karakter yang mendalam dan hidup berdasarkan masukan pemain. SEMUA output harus dalam Bahasa Indonesia.

Masukan Pemain:
- Konsep Inti: "${characterData.concept}"
- Latar Belakang & Pengalaman: "${characterData.background}"

Tugas Anda (Ikuti dengan SANGAT TELITI):
1.  **Analisis Mendalam**: Baca dan pahami **kedua** masukan pemain secara holistik.
2.  **Ciptakan Identitas Karakter**:
    *   **Nama**: Cari nama potensial dari masukan pemain. Contoh: jika pemain menulis 'Prajurit tangguh Melfiano', gunakan 'Melfiano' sebagai nama. Jika tidak ada, ciptakan nama yang sesuai dengan ras dan kelasnya.
    *   **Ras & Kelas**: Tentukan ini dari 'Konsep Inti'.
3.  **Alokasi Statistik Cerdas**: Gunakan 'Latar Belakang & Pengalaman' untuk memengaruhi statistik. Ini harus lebih dari sekadar bonus kecil. Latar belakang sebagai 'pandai besi veteran' harus menghasilkan Strength yang tinggi. 'Sarjana dari menara gading' harus memiliki Intelligence yang sangat tinggi. Jaga agar nilai tetap antara 8-18, tapi buatlah distribusi yang mencerminkan cerita.
4.  **Ekonomi Awal**:
    *   **Emas Awal**: Berikan jumlah 'gold' awal berdasarkan latar belakang. Bangsawan kaya bisa mulai dengan 100 emas, petualang biasa 25, dan orang miskin hanya 5.
    *   **Nilai Item**: Tetapkan 'value' (harga dalam emas) yang masuk akal untuk SETIAP item di inventaris awal.
5.  **Reputasi Dinamis**: Analisis 'Latar Belakang & Pengalaman' untuk prestasi atau ketenaran.
    *   Contoh: "menyelamatkan desa dari serangan goblin" -> reputasi +5.
    *   Contoh: "terkenal sebagai pendekar pedang terbaik" -> reputasi +10.
    *   Jika netral, reputasi 0.
6.  **Inventaris Personal**: Ciptakan inventaris awal yang masuk akal. **Jika pemain menyebutkan item spesifik** (misalnya, "membawa pedang warisan ayahku"), pastikan item itu ada di dalam inventaris dengan deskripsi dan nilai yang sesuai.
7.  **Tulis Latar Belakang (Backstory)**: Sintesiskan masukan pemain menjadi sebuah \`backstory\` yang ringkas dan menarik (2-3 kalimat).
8.  **Ciptakan Adegan Awal**: Buat \`initialScene\` dan \`introStory\` yang imersif dan relevan dengan karakter yang baru saja Anda buat. Jika ada toko atau pandai besi di adegan awal, pastikan NPC tersebut memiliki 'inventory' dengan beberapa barang untuk dijual.
9.  **Format JSON**: Pastikan output Anda sesuai dengan skema JSON yang diberikan.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
            config: {
            responseMimeType: "application/json",
            responseSchema: characterGenerationSchema
            }
        });

        const jsonString = response.text;
        return JSON.parse(jsonString);
    }

    async generateNextScene(character: Character, scene: Scene, history: StoryEntry[], playerAction: string): Promise<GameTurnResponse> {
        const recentHistory = history.slice(-5).map(entry => {
            if(entry.type === 'action') return `Pemain: ${entry.content}`;
            if(entry.type === 'narrative') return `DM: ${entry.content}`;
            return '';
        }).join('\n');
        
        const prompt = `Anda adalah Dungeon Master (DM) ahli untuk sebuah game RPG fantasi. Lanjutkan cerita berdasarkan aksi pemain. Selalu balas dalam Bahasa Indonesia.

Kondisi Saat Ini:
- Karakter: ${JSON.stringify(character, null, 2)}
- Adegan: ${JSON.stringify(scene, null, 2)}
- Log Cerita Terbaru:
${recentHistory}

Aksi Pemain:
"${playerAction}"

Tugas Anda:
1.  **Analisis Maksud Pemain**: Pahami niat di balik aksi pemain:
    *   Apakah ini **transaksi ekonomi** (eksplisit "beli" atau "jual")?
    *   Apakah ini **interaksi dengan item yang sudah dimiliki** (misal: "lihat peta", "baca buku", "gunakan kunci")?
    *   Apakah ini **aksi berisiko** yang memerlukan \`skillCheck\` (misal: "coba panjat tembok", "bujuk penjaga")?
    *   Apakah ini **percakapan** atau **aksi sederhana** lainnya?

2.  **Proses Aksi Sesuai Maksud (SANGAT PENTING)**:
    *   **Jika Transaksi Ekonomi**:
        *   **Membeli**: Periksa: 1) Apakah NPC ada? 2) Apakah NPC menjual item itu? 3) Apakah pemain punya cukup 'gold'? Jika ya, kurangi emas pemain, tambahkan item ke inventaris, dan narasikan. Buat notifikasi (misal: "Item Diperoleh: Pedang Besi", "-50 Emas"). Jika gagal, jelaskan alasannya.
        *   **Menjual**: Periksa: 1) Apakah pemain punya item itu? 2) Apakah NPC mau membeli? Jika ya, hapus item dari pemain, tambahkan emas (biasanya 50% dari 'value'), dan narasikan. Buat notifikasi (misal: "+25 Emas").
    *   **Jika Interaksi Item**: **JANGAN LAKUKAN TRANSAKSI BARU**. Ini adalah aturan paling penting. Narasikan hasil dari penggunaan item tersebut. Contoh: Jika pemain sudah punya 'Peta Tua' dan berkata "Aku lihat peta itu", deskripsikan detail yang terlihat di peta. Ini tidak mengubah 'gold'.
    *   **Jika Aksi Berisiko**: Lakukan \`skillCheck\`. Tentukan DC, lempar d20, hitung bonus, dan isi objek 'skillCheck'. Hasilnya (berhasil/gagal) harus memengaruhi narasi.

3.  **Narasikan Cerita & Perbarui Dunia**:
    *   Tulis \`narasiBaru\` yang menarik berdasarkan hasil aksi.
    *   Perbarui \`karakterTerbaru\` secara lengkap (HP, inventaris, emas, reputasi).
    *   Perbarui \`sceneUpdate\` secara lengkap (lokasi, sikap NPC, inventaris NPC jika ada transaksi).

4.  **Buat Notifikasi & Cek Kondisi Kalah**:
    *   Isi \`notifications\` untuk peristiwa penting (perubahan emas, item, reputasi).
    *   Jika HP karakter <= 0, \`narasiBaru\` harus menjadi narasi kematian yang dramatis.

5.  **Format Respons**: Pastikan respons Anda sesuai dengan skema JSON yang disediakan.`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: gameTurnSchema
            }
        });

        const jsonString = response.text;
        return JSON.parse(jsonString) as GameTurnResponse;
    }
}

export const geminiProvider = new GeminiDungeonMaster();