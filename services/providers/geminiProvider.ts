import { GoogleGenAI, Type } from "@google/genai";
import { Character, GameTurnResponse, Scene, StoryEntry, Quest, WorldEvent } from '../../types';
import { IAiDungeonMasterService } from "../aiService";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set. The application cannot start without it.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- SCHEMAS ---

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
    inventory: { type: Type.ARRAY, items: inventoryItemSchema },
    reputation: { type: Type.INTEGER, description: "Reputasi awal karakter, berdasarkan latar belakang. Bisa positif jika mereka pahlawan, atau 0 jika tidak dikenal." },
    gold: { type: Type.INTEGER, description: "Jumlah keping emas awal, berdasarkan latar belakang. Bangsawan mungkin punya 100, petualang biasa 25, orang miskin 5."}
  },
  required: ["name", "race", "characterClass", "backstory", "stats", "inventory", "reputation", "gold"]
};

const sceneSchema = {
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
                    inventory: { type: Type.ARRAY, description: "Jika NPC ini adalah pedagang, isi dengan barang yang mereka jual. Jika tidak, biarkan kosong.", items: inventoryItemSchema }
                },
                required: ["name", "description", "attitude"]
            }
        }
    },
    required: ["location", "description", "npcs"]
};

const worldGenerationSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "Nama yang epik dan unik untuk dunia ini, berdasarkan konsepnya." },
        description: { type: Type.STRING, description: "Deskripsi dunia yang kaya dan imersif (3-4 kalimat), menyatukan konsep, faksi, dan konflik yang diberikan." }
    },
    required: ["name", "description"]
};

const characterGenerationSchema = {
    type: Type.OBJECT,
    properties: {
        character: characterSchema,
        initialScene: sceneSchema,
        introStory: { type: Type.STRING, description: "Narasi pembuka yang mendalam dan imersif untuk memulai petualangan karakter dalam Bahasa Indonesia."}
    },
    required: ["character", "initialScene", "introStory"]
};

const questSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "Judul misi yang singkat dan jelas. Harus unik." },
        description: { type: Type.STRING, description: "Deskripsi misi yang diperbarui, menjelaskan apa yang perlu dilakukan." },
        status: { type: Type.STRING, enum: ['Aktif', 'Selesai'], description: "Status misi saat ini." },
    },
    required: ["title", "description", "status"]
};

const worldEventSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "Judul singkat untuk peristiwa dunia." },
        description: { type: Type.STRING, description: "Deskripsi singkat tentang peristiwa yang terjadi di dunia." },
        type: { type: Type.STRING, enum: ['Sejarah', 'Berita', 'Ramalan'], description: "Kategori peristiwa dunia." },
    },
    required: ["title", "description", "type"]
};

const gameTurnSchema = {
    type: Type.OBJECT,
    properties: {
        narasiBaru: { type: Type.STRING, description: "Bagian cerita selanjutnya dalam Bahasa Indonesia, mendeskripsikan hasil dari aksi pemain dan situasi baru. Harus menarik dan detail. Jika HP karakter 0 atau kurang, ini adalah narasi kematian mereka." },
        karakterTerbaru: characterSchema,
        partyTerbaru: { type: Type.ARRAY, description: "Daftar LENGKAP semua anggota party saat ini, dengan statistik terbarunya. Jika tidak ada, array kosong.", items: characterSchema },
        sceneUpdate: sceneSchema,
        skillCheck: {
            type: Type.OBJECT,
            properties: {
                skill: { type: Type.STRING, description: "Keterampilan yang diuji." },
                attribute: { type: Type.STRING, description: "Atribut yang digunakan." },
                diceRoll: { type: Type.INTEGER, description: "Hasil lemparan d20 murni (1-20)." },
                bonus: { type: Type.INTEGER, description: "Bonus dari atribut karakter. ((nilai_atribut - 10) / 2)." },
                total: { type: Type.INTEGER, description: "diceRoll + bonus." },
                dc: { type: Type.INTEGER, description: "Tingkat Kesulitan (Difficulty Class)." },
                success: { type: Type.BOOLEAN, description: "Apakah total >= DC." }
            }
        },
        notifications: { type: Type.ARRAY, description: "Daftar notifikasi singkat (misal: 'Item Ditemukan: Kunci'). Kosongkan jika tidak ada.", items: { type: Type.STRING } },
        memorySummary: { type: Type.STRING, description: "Ringkasan satu kalimat dari peristiwa penting giliran ini. Biarkan kosong jika tidak ada." },
        questsUpdate: { type: Type.ARRAY, description: "Daftar misi yang baru dibuat atau diperbarui. Kosongkan jika tidak ada.", items: questSchema },
        worldEventsUpdate: { type: Type.ARRAY, description: "Daftar peristiwa dunia baru. Buat satu setiap 5-10 giliran. Kosongkan jika tidak ada.", items: worldEventSchema }
    },
    required: ["narasiBaru", "karakterTerbaru", "partyTerbaru", "sceneUpdate"]
};


class GeminiDungeonMaster implements IAiDungeonMasterService {
    async generateWorld(worldData: { concept: string; factions: string; conflict: string; }): Promise<{ name: string; description: string; }> {
        const prompt = `Anda adalah seorang Arsitek Dunia AI, seorang pendongeng ulung yang bertugas menciptakan fondasi dari sebuah saga fantasi. Berdasarkan pilar-pilar yang diberikan pemain, tempa sebuah dunia yang kohesif dan menarik.

Masukan Pemain:
- Konsep Inti Dunia: "${worldData.concept}"
- Faksi & Kekuatan Utama: "${worldData.factions}"
- Konflik Saat Ini: "${worldData.conflict}"

Tugas Anda:
1.  **Sintesiskan Visi**: Baca dan pahami ketiga pilar tersebut. Temukan benang merah yang menghubungkannya.
2.  **Beri Nama Dunia**: Ciptakan nama yang epik, unik, dan menggugah untuk dunia ini, yang mencerminkan konsep intinya.
3.  **Tulis Deskripsi Dunia**: Tulis deskripsi yang kaya dan imersif (3-4 kalimat). Gabungkan konsep, faksi, dan konflik menjadi satu narasi yang koheren. Ini akan menjadi 'kebenaran dasar' dari dunia ini.
4.  **Format JSON**: Pastikan output Anda sesuai dengan skema JSON yang diberikan.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: worldGenerationSchema }
        });
        return JSON.parse(response.text);
    }

    async generateCharacter(characterData: { concept: string; background: string; }, worldContext: string): Promise<{ character: Omit<Character, 'id'>; initialScene: Scene; introStory: string; }> {
        const prompt = `Anda adalah seorang Dungeon Master (DM) AI yang sangat cerdas dan kreatif. Tugas Anda adalah menciptakan karakter yang hidup dan bernapas di dalam dunia yang sudah ada.

Konteks Dunia (Kebenaran Dasar):
"${worldContext}"

Masukan Pemain untuk Karakter:
- Konsep Inti: "${characterData.concept}"
- Latar Belakang & Pengalaman: "${characterData.background}"

Tugas Anda (Ikuti dengan SANGAT TELITI):
1.  **Integrasi Dunia**: Karakter ini HARUS terasa seperti bagian dari Konteks Dunia. Latar belakang, afiliasi, dan masalah mereka harus berakar pada realitas dunia tersebut.
2.  **Tentukan Level Awal**: Analisis 'Latar Belakang & Pengalaman'. Jika menggambarkan seorang pahlawan berpengalaman, tetapkan \`level\` awal yang lebih tinggi (3-5). Jika pemula, \`level\` adalah 1. Statistik lain harus disesuaikan dengan level ini.
3.  **Ciptakan Identitas**:
    *   **Nama**: Cari nama dari masukan pemain. Jika tidak ada, ciptakan nama fantasi unik yang sesuai dengan ras, kelas, dan dunia.
    *   **Ras & Kelas**: Tentukan dari 'Konsep Inti'.
4.  **Alokasi Statistik Cerdas**: Distribusikan poin atribut (8-18) yang mencerminkan cerita dan Konteks Dunia.
5.  **Konteks Ekonomi & Sosial**: Berikan 'gold' dan 'reputation' awal yang logis berdasarkan latar belakang DAN status sosial mereka di dalam dunia.
6.  **Inventaris yang Relevan**: Ciptakan inventaris awal yang masuk akal untuk peran mereka di dunia ini.
7.  **Adegan Awal yang Koheren**: Buat \`initialScene\` dan \`introStory\` yang merupakan kelanjutan langsung dari \`backstory\` karakter DAN terjadi di lokasi yang masuk akal di dalam dunia.
8.  **Format JSON**: Pastikan output Anda sesuai dengan skema JSON yang diberikan.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: characterGenerationSchema }
        });
        return JSON.parse(response.text);
    }

    async generateNextScene(character: Character, party: Character[], scene: Scene, history: StoryEntry[], longTermMemory: string[], notes: string, quests: Quest[], worldEvents: WorldEvent[], turnCount: number, playerAction: string): Promise<GameTurnResponse> {
        const recentHistory = history.slice(-5).map(entry => {
            if(entry.type === 'action') return `Pemain: ${entry.content}`;
            if(entry.type === 'narrative') return `DM: ${entry.content}`;
            return '';
        }).join('\n');
        
        const prompt = `Anda adalah Dungeon Master (DM) AI yang logis, konsisten, dan seorang pembangun dunia yang ulung. Tugas Anda adalah melanjutkan cerita, mengelola misi, dan membuat dunia terasa hidup. Selalu balas dalam Bahasa Indonesia.

Giliran Saat Ini: ${turnCount}

MEMORI JANGKA PANJANG (Sejarah Dunia):
- ${longTermMemory.join('\n- ') || 'Belum ada.'}
${notes.trim() ? `
CATATAN PRIBADI PEMAIN (Gunakan ini untuk memahami fokus dan teori pemain):
${notes}` : ''}

Kondisi Saat Ini:
- Karakter Pemain: ${JSON.stringify(character, null, 2)}
- Party (Rekan): ${JSON.stringify(party, null, 2)}
- Adegan: ${JSON.stringify(scene, null, 2)}
- Misi Aktif & Selesai: ${JSON.stringify(quests, null, 2)}
- Tawarikh Dunia (Peristiwa Masa Lalu): ${JSON.stringify(worldEvents, null, 2)}
- Log Cerita Terbaru:
${recentHistory}

Aksi Pemain:
"${playerAction}"

Tugas Anda (Ikuti Urutan Ini dengan SANGAT TELITI):
1.  **Analisis & Konsistensi Dunia**: Baca SEMUA informasi di atas. Pastikan respons Anda logis dan konsisten dengan semua yang telah terjadi.
2.  **Proses Aksi & Konsekuensi**: 
    *   **Aksi "Periksa"**: Jika aksi pemain adalah "Periksa [Nama NPC]", berikan deskripsi yang lebih mendalam tentang penampilan, bahasa tubuh, atau detail tersembunyi NPC tersebut. Ini adalah kesempatan untuk memberikan wawasan. Berdasarkan Kebijaksanaan (Insight) atau Kecerdasan (Investigasi) karakter, Anda BISA memicu 'Pemeriksaan Keterampilan' (skillCheck) untuk mengungkap niat tersembunyi atau petunjuk.
    *   **Aksi Lainnya**: Narasikan hasil aksi pemain. Jika perlu, lakukan 'Pemeriksaan Keterampilan' (skillCheck).
    *   **Perbarui Status**: Perbarui status karakter, party, dan adegan (\`karakterTerbaru\`, \`partyTerbaru\`, \`sceneUpdate\`).
    *   **SIKAP NPC HARUS BERUBAH**: Sikap NPC dalam \`sceneUpdate\` HARUS diperbarui secara logis berdasarkan aksi pemain. Jika pemain bersikap baik, sikap bisa membaik (misal: Netral -> Ramah). Jika pemain mengancam atau gagal dalam pemeriksaan sosial, sikap bisa memburuk (misal: Netral -> Curiga).
3.  **Manajemen Misi (questsUpdate)**: Identifikasi jika aksi memicu, memajukan, atau menyelesaikan misi. Jika ya, tambahkan objek Quest baru atau yang diperbarui ke array \`questsUpdate\`.
4.  **Tawarikh Dunia (worldEventsUpdate)**: Secara berkala (setiap 5-10 giliran), ciptakan satu peristiwa dunia baru. Variasikan jenisnya ('Sejarah', 'Berita', 'Ramalan').
5.  **Ciptakan Memori Baru (memorySummary)**: Jika terjadi peristiwa penting, tulis ringkasan satu kalimat di \`memorySummary\`.
6.  **Format Respons**: Pastikan respons Anda sesuai dengan skema JSON yang disediakan. Kosongkan array yang tidak relevan.`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: gameTurnSchema }
        });
        return JSON.parse(response.text) as GameTurnResponse;
    }

    async askOOCQuestion(history: StoryEntry[], longTermMemory: string[], question: string): Promise<string> {
        const recentHistory = history.slice(-10).map(entry => {
            if(entry.type === 'action') return `Pemain: ${entry.content}`;
            if(entry.type === 'narrative') return `DM: ${entry.content}`;
            return '';
        }).join('\n');

        const prompt = `Anda adalah seorang Game Master (GM) yang membantu untuk sebuah game RPG. Pemain mengajukan pertanyaan di luar karakter (OOC). Jawab pertanyaan mereka dengan jelas dan singkat, berdasarkan konteks cerita yang ada.

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