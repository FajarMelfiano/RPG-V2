// FIX: Replaced deprecated `GenerateContentRequest` type with `GenerateContentParameters`.
import { GoogleGenAI, Type, GenerateContentParameters } from "@google/genai";
import { Character, GameTurnResponse, Scene, StoryEntry, Quest, WorldEvent, Marketplace, TransactionLogEntry, ItemRarity, ItemSlot, WorldTheme, FamilyMember, WorldMemory } from '../../types';
import { IAiDungeonMasterService } from "../aiService";
import { apiKeyManager } from "../apiKeyManager";


async function generateContentWithRotation(request: GenerateContentParameters): Promise<any> {
    apiKeyManager.resetCycle(); 
    let retries = 0;

    while (retries <= (process.env.API_KEY?.split(',').length || 1)) {
        try {
            const ai = apiKeyManager.getCurrentAiInstance();
            const response = await ai.models.generateContent(request);
            return response;
        } catch (error: any) {
            const isResourceExhausted = error.toString().includes('429') || error.message?.includes('RESOURCE_EXHAUSTED');

            if (isResourceExhausted) {
                console.warn(`API key at index ${apiKeyManager.getCurrentIndex()} is exhausted. Rotating...`);
                apiKeyManager.rotateToNextKey();
                retries++;
            } else {
                throw error;
            }
        }
    }
    throw new Error("All available API keys are currently exhausted. Please try again later.");
}


const itemSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING },
        name: { type: Type.STRING },
        description: { type: Type.STRING },
        value: { type: Type.INTEGER },
        rarity: { type: Type.STRING },
        type: { type: Type.STRING },
        slot: { type: Type.STRING },
    },
    required: ["id", "name", "description", "value", "rarity", "type"]
};

const inventoryItemSchema = {
    type: Type.OBJECT,
    properties: {
        item: itemSchema,
        quantity: { type: Type.INTEGER },
    },
    required: ["item", "quantity"]
};

const shopSchema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    name: { type: Type.STRING },
    description: { type: Type.STRING },
    inventory: { type: Type.ARRAY, items: inventoryItemSchema }
  },
  required: ["id", "name", "description", "inventory"]
};

const marketplaceSchema = {
  type: Type.OBJECT,
  properties: {
    shops: { type: Type.ARRAY, items: shopSchema }
  },
  required: ["shops"]
};

const statsSchema = {
    type: Type.OBJECT,
    properties: {
        level: { type: Type.INTEGER },
        health: { type: Type.INTEGER },
        maxHealth: { type: Type.INTEGER },
        mana: { type: Type.INTEGER },
        maxMana: { type: Type.INTEGER },
        strength: { type: Type.INTEGER },
        dexterity: { type: Type.INTEGER },
        constitution: { type: Type.INTEGER },
        intelligence: { type: Type.INTEGER },
        wisdom: { type: Type.INTEGER },
        charisma: { type: Type.INTEGER },
    },
    required: ["level", "health", "maxHealth", "mana", "maxMana", "strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"]
};

const equipmentSchema = {
    type: Type.OBJECT,
    properties: {
        mainHand: itemSchema,
        offHand: itemSchema,
        head: itemSchema,
        chest: itemSchema,
        legs: itemSchema,
        feet: itemSchema,
        neck: itemSchema,
        ring: itemSchema,
    }
};

const familyMemberSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        relationship: { type: Type.STRING },
        status: { type: Type.STRING, enum: ['Hidup', 'Hilang', 'Meninggal', 'Dalam bahaya'] },
        description: { type: Type.STRING },
    },
    required: ["name", "relationship", "status", "description"]
};

const characterSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    race: { type: Type.STRING },
    characterClass: { type: Type.STRING },
    backstory: { type: Type.STRING },
    stats: statsSchema,
    inventory: { type: Type.ARRAY, items: inventoryItemSchema },
    equipment: equipmentSchema,
    reputation: { type: Type.INTEGER },
    gold: { type: Type.INTEGER },
    family: { type: Type.ARRAY, items: familyMemberSchema }
  },
  required: ["name", "race", "characterClass", "backstory", "stats", "inventory", "equipment", "reputation", "gold", "family"]
};

const sceneSchema = {
    type: Type.OBJECT,
    properties: {
        location: { type: Type.STRING },
        description: { type: Type.STRING },
        npcs: { 
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    attitude: { type: Type.STRING, enum: ['Ramah', 'Netral', 'Curiga', 'Bermusuhan'] },
                },
                required: ["name", "description", "attitude"]
            }
        },
        availableShopIds: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
    },
    required: ["location", "description", "npcs", "availableShopIds"]
};

const worldGenerationSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        description: { type: Type.STRING },
        theme: { type: Type.STRING, enum: ['dark_fantasy', 'cyberpunk', 'steampunk', 'high_fantasy'] },
        marketplace: marketplaceSchema,
    },
    required: ["name", "description", "theme", "marketplace"]
};

const characterGenerationSchema = {
    type: Type.OBJECT,
    properties: {
        character: characterSchema,
        initialScene: sceneSchema,
        introStory: { type: Type.STRING }
    },
    required: ["character", "initialScene", "introStory"]
};

const questSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        status: { type: Type.STRING },
    },
    required: ["title", "description", "status"]
};

const worldEventSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        type: { type: Type.STRING },
    },
    required: ["title", "description", "type"]
};

const characterUpdateSchema = {
    type: Type.OBJECT,
    properties: {
        perubahanHp: { type: Type.INTEGER, description: "Perubahan HP karakter. Positif untuk penyembuhan, negatif untuk kerusakan. Kosongkan jika tidak ada perubahan." },
        perubahanMana: { type: Type.INTEGER, description: "Perubahan Mana karakter. Positif untuk pemulihan, negatif untuk penggunaan. Kosongkan jika tidak ada perubahan." },
        perubahanEmas: { type: Type.INTEGER, description: "Jumlah emas yang diterima (positif) atau hilang (negatif). Kosongkan jika tidak ada." },
        itemDiterima: { 
            type: Type.ARRAY,
            description: "Daftar item BARU yang diterima karakter (misalnya dari rampasan atau hadiah). Jangan sertakan item yang dibeli.",
            items: inventoryItemSchema
        },
        itemDihapus: {
            type: Type.ARRAY,
            description: "Daftar item yang DIHAPUS dari inventaris karakter (misalnya karena digunakan, dijual, atau hilang).",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "Nama item yang dihapus. HARUS SAMA PERSIS dengan nama di inventaris." },
                    quantity: { type: Type.INTEGER, description: "Jumlah yang dihapus." }
                },
                required: ["name", "quantity"]
            }
        },
        keluargaDiperbarui: {
            type: Type.ARRAY,
            description: "Jika status anggota keluarga berubah (misalnya dari 'Hidup' menjadi 'Dalam bahaya'), laporkan SELURUH daftar keluarga yang diperbarui di sini.",
            items: familyMemberSchema
        }
    }
};

const worldMemorySchema = {
    type: Type.OBJECT,
    properties: {
        keyEvents: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Daftar peristiwa paling penting dalam cerita, yang membentuk dunia." },
        keyCharacters: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Daftar karakter (NPC) paling penting dan peran mereka." },
        worldStateSummary: { type: Type.STRING, description: "Ringkasan status dunia saat ini, termasuk konflik utama dan atmosfer umum." }
    },
    required: ["keyEvents", "keyCharacters", "worldStateSummary"]
};

const gameTurnSchema = {
    type: Type.OBJECT,
    properties: {
        narasiBaru: { type: Type.STRING, description: "Bagian cerita selanjutnya, mendeskripsikan hasil dari aksi pemain dan situasi baru. Harus menarik dan detail." },
        sceneUpdate: sceneSchema,
        skillCheck: {
            type: Type.OBJECT,
            properties: {
                skill: { type: Type.STRING },
                attribute: { type: Type.STRING },
                diceRoll: { type: Type.INTEGER },
                bonus: { type: Type.INTEGER },
                total: { type: Type.INTEGER },
                dc: { type: Type.INTEGER },
                success: { type: Type.BOOLEAN }
            }
        },
        memoryUpdate: worldMemorySchema,
        questsUpdate: { type: Type.ARRAY, items: questSchema },
        worldEventsUpdate: { type: Type.ARRAY, items: worldEventSchema },
        marketplaceUpdate: marketplaceSchema,
        pembaruanKarakter: characterUpdateSchema
    },
    required: ["narasiBaru", "sceneUpdate"],
};


class GeminiDungeonMaster implements IAiDungeonMasterService {
    async generateWorld(worldData: { concept: string; factions: string; conflict: string; }): Promise<{ name: string; description: string; marketplace: Marketplace; theme: WorldTheme; }> {
        const prompt = `Anda adalah seorang Arsitek Dunia AI. Tugas Anda adalah menciptakan dunia fantasi yang hidup dengan ekonomi yang berfungsi. SEMUA TEKS YANG DIHASILKAN HARUS DALAM BAHASA INDONESIA.

Masukan Pemain:
- Konsep Inti Dunia: "${worldData.concept}"
- Faksi & Kekuatan Utama: "${worldData.factions}"
- Konflik Saat Ini: "${worldData.conflict}"

Tugas Anda:
1.  **Sintesiskan Visi**: Ciptakan nama dan deskripsi dunia yang imersif.
2.  **Pilih Tema Visual (WAJIB)**: Berdasarkan 'Konsep Inti Dunia', pilih SATU tema visual yang paling cocok dari daftar berikut: ['dark_fantasy', 'cyberpunk', 'steampunk', 'high_fantasy']. Tema ini akan menentukan palet warna permainan.
3.  **Ciptakan Pasar Awal (Marketplace)**: Buatlah toko-toko berikut: 'general_store', 'blacksmith', 'alchemist', 'traveling_merchant'.
4.  **Isi Inventaris Toko**: Untuk setiap toko, buat inventaris yang kaya dengan **8 hingga 15 item** yang relevan dan deskriptif. Fokus pada narasi, BUKAN statistik numerik. Pastikan untuk memberikan ID unik (UUID) untuk setiap item.
5.  **Format JSON**: Pastikan output Anda sesuai dengan skema JSON yang diberikan.`;

        const response = await generateContentWithRotation({
            model: "gemini-2.5-flash",
            contents: { parts: [{ text: prompt }] },
            config: { responseMimeType: "application/json", responseSchema: worldGenerationSchema }
        });
        return JSON.parse(response.text);
    }

    async generateCharacter(characterData: { concept: string; background: string; }, worldContext: string): Promise<{ character: Omit<Character, 'id'>; initialScene: Scene; introStory: string; }> {
        const prompt = `Anda adalah seorang Dungeon Master AI. Ciptakan karakter yang hidup di dalam dunia yang sudah ada. SEMUA TEKS YANG DIHASILKAN HARUS DALAM BAHASA INDONESIA.

Konteks Dunia: "${worldContext}"
Masukan Pemain:
- Konsep Inti: "${characterData.concept}"
- Latar Belakang & Pengalaman: "${characterData.background}"

Tugas Anda:
1.  **Integrasi Dunia**: Karakter harus terasa seperti bagian dari dunia ini.
2.  **Ciptakan Keluarga (WAJIB)**: Berdasarkan latar belakang, ciptakan 1-3 anggota keluarga untuk karakter ini. Tentukan \`name\`, \`relationship\`, \`status\` ('Hidup', 'Hilang', 'Meninggal', 'Dalam bahaya'), dan \`description\` singkat yang bisa menjadi pemicu plot. Ini membuat karakter terasa terhubung dengan dunia.
3.  **Tentukan Level Awal & Statistik**: Analisis latar belakang untuk menentukan level (1-5) dan alokasikan \`stats\` yang sesuai.
4.  **Perlengkapan & Inventaris Awal**: Berikan karakter perlengkapan awal yang logis di \`equipment\` dan beberapa item tambahan di \`inventory\`. Fokus pada deskripsi item, bukan statistik numerik.
5.  **ID ITEM**: Semua item di \`equipment\` dan \`inventory\` HARUS memiliki ID unik (UUID).
6.  **Adegan Awal**: Ciptakan \`initialScene\` dan \`introStory\` yang relevan. Tentukan \`availableShopIds\` secara logis berdasarkan lokasi. Sikap NPC HARUS salah satu dari ['Ramah', 'Netral', 'Curiga', 'Bermusuhan'].
7.  **Format JSON**: Pastikan output sesuai dengan skema.`;

        const response = await generateContentWithRotation({
            model: "gemini-2.5-flash",
            contents: { parts: [{ text: prompt }] },
            config: { responseMimeType: "application/json", responseSchema: characterGenerationSchema }
        });
        return JSON.parse(response.text);
    }

    async generateNextScene(character: Character, party: Character[], scene: Scene, history: StoryEntry[], longTermMemory: WorldMemory, notes: string, quests: Quest[], worldEvents: WorldEvent[], turnCount: number, playerAction: string, transactionLog: TransactionLogEntry[], marketplace: Marketplace): Promise<GameTurnResponse> {
        
        const prompt = `Anda adalah Dungeon Master (DM) AI yang logis dan konsisten. Misi utama Anda adalah menjaga kontinuitas cerita. SEMUA TEKS HARUS DALAM BAHASA INDONESIA.

**ATURAN INTI & PRINSIP:**
1.  **Prinsip Realisme & Konsistensi**: Semua peristiwa HARUS mengikuti logika internal dunia. Karakter (NPC dan pemain) harus bertindak sesuai dengan kepribadian dan motivasi mereka. Keputusan naratif HARUS didasarkan pada peristiwa masa lalu yang tercatat di 'MEMORI DUNIA'.
2.  **Laporan Perubahan, Bukan Status Penuh**: Anda HANYA melaporkan perubahan status karakter melalui \`pembaruanKarakter\`.
3.  **Manajemen Memori Aktif**: Anda tidak hanya menambahkan ke memori; Anda mengelolanya.

**KONTEKS SAAT INI (Kebenaran Dasar):**
-   **Giliran Saat Ini**: ${turnCount}
-   **MEMORI DUNIA (Baca Ini Dulu)**: ${JSON.stringify(longTermMemory)}
-   **KARAKTER PEMAIN**:
    -   **Latar Belakang Asli**: ${character.backstory}
    -   **Status Saat Ini**: ${JSON.stringify({ name: character.name, stats: character.stats, gold: character.gold, inventory: character.inventory.map(i => `${i.item.name} (x${i.quantity})`) })}
    -   **Keluarga**: ${JSON.stringify(character.family)}
-   **MISI AKTIF**: ${quests.filter(q => q.status === 'Aktif').map(q => q.title).join(', ') || 'Tidak ada.'}
-   **ADEGAN SAAT INI**: ${JSON.stringify(scene)}
-   **AKSI PEMAIN**: "${playerAction}"

**TUGAS ANDA (Ikuti Secara Berurutan):**
1.  **Analisis & Kontekstualisasi**: Baca SEMUA informasi di atas. Pahami aksi pemain dalam konteks MEMORI DUNIA, latar belakang karakter, dan situasi saat ini.
2.  **Pemeriksaan Keterampilan (Jika Perlu)**: Jika aksi pemain memiliki kemungkinan untuk gagal (misalnya menyerang, menyelinap, membujuk, meretas), Anda **WAJIB** membuat \`skillCheck\`.
3.  **Narasikan Hasil**: Tulis narasi (\`narasiBaru\`) yang merupakan kelanjutan LOGIS dari aksi pemain, hasil \`skillCheck\`, dan konteks yang ada.
4.  **Perbarui Status & Dunia**:
    *   **Pembaruan Karakter**: Laporkan HANYA perubahan pada HP, mana, emas, item, atau status keluarga di \`pembaruanKarakter\`.
    *   **Pembaruan Adegan**: Perbarui \`sceneUpdate\` dengan lokasi, deskripsi, dan status NPC yang baru.
    *   **Ketersediaan Toko**: Berdasarkan lokasi baru di \`sceneUpdate\`, isi \`availableShopIds\` dengan benar.
    *   **Perkembangan Dunia**: Jika relevan, perbarui misi (\`questsUpdate\`) atau picu peristiwa dunia baru (\`worldEventsUpdate\`).
5.  **KONSOLIDASI MEMORI (Tugas Kritis)**:
    *   Baca kembali \`MEMORI DUNIA\` yang lama.
    *   Sintesiskan peristiwa-peristiwa PENTING dari giliran ini ke dalam memori tersebut.
    *   **TULIS ULANG** seluruh objek memori menjadi versi yang lebih baik dan lebih koheren. Jangan hanya menambahkan.
    *   Keluarkan objek memori yang telah diperbarui dan disempurnakan ini di \`memoryUpdate\`. Jika tidak ada perubahan signifikan, kembalikan objek memori yang sama.
6.  **Format Respons**: Pastikan output Anda sesuai dengan skema JSON.`;
        
        const response = await generateContentWithRotation({
            model: "gemini-2.5-flash",
            contents: { parts: [{ text: prompt }] },
            config: { responseMimeType: "application/json", responseSchema: gameTurnSchema }
        });
        return JSON.parse(response.text) as GameTurnResponse;
    }

    async askOOCQuestion(history: StoryEntry[], longTermMemory: WorldMemory, question: string): Promise<string> {
        const prompt = `Anda adalah seorang Game Master (GM) yang membantu. Jawab pertanyaan OOC pemain dengan jelas dan singkat dalam Bahasa Indonesia, berdasarkan konteks cerita yang ada.

Konteks Cerita:
- Memori Dunia: ${JSON.stringify(longTermMemory)}
- Dialog Terbaru: ${history.slice(-10).map(e => `${e.type}: ${e.content}`).join('\n')}
- Pertanyaan OOC Pemain: "${question}"

Jawaban Anda (sebagai GM):`;

        const response = await generateContentWithRotation({
            model: "gemini-2.5-flash",
            contents: { parts: [{ text: prompt }] },
        });
        return response.text;
    }
}

export const geminiProvider = new GeminiDungeonMaster();