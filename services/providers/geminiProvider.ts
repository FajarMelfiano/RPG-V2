
// FIX: Replaced deprecated `GenerateContentRequest` type with `GenerateContentParameters`.
import { GoogleGenAI, Type, GenerateContentParameters } from "@google/genai";
import { Character, GameTurnResponse, Scene, StoryEntry, Quest, WorldEvent, Marketplace, TransactionLogEntry, ItemRarity, ItemSlot, WorldTheme, FamilyMember, WorldMemory, WorldMap } from '../../types';
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
        category: { type: Type.STRING },
        usageNotes: { type: Type.STRING },
    },
    required: ["name", "description", "value", "rarity", "type", "category", "usageNotes"]
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

const mapNodeSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING },
        name: { type: Type.STRING },
        description: { type: Type.STRING },
    },
    required: ["id", "name", "description"]
};

const mapEdgeSchema = {
    type: Type.OBJECT,
    properties: {
        fromNodeId: { type: Type.STRING },
        toNodeId: { type: Type.STRING },
        direction: { type: Type.STRING },
        description: { type: Type.STRING },
    },
    required: ["fromNodeId", "toNodeId", "direction", "description"]
};

const worldMapSchema = {
    type: Type.OBJECT,
    properties: {
        nodes: { type: Type.ARRAY, items: mapNodeSchema },
        edges: { type: Type.ARRAY, items: mapEdgeSchema },
    },
    required: ["nodes", "edges"]
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
    age: { type: Type.INTEGER },
    height: { type: Type.STRING },
    appearance: { type: Type.STRING },
    backstory: { type: Type.STRING },
    stats: statsSchema,
    inventory: { type: Type.ARRAY, items: inventoryItemSchema },
    equipment: equipmentSchema,
    reputation: { type: Type.INTEGER },
    gold: { type: Type.INTEGER },
    family: { type: Type.ARRAY, items: familyMemberSchema }
  },
  required: ["name", "race", "characterClass", "age", "height", "appearance", "backstory", "stats", "inventory", "equipment", "reputation", "gold", "family"]
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
                    shopId: { type: Type.STRING }
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
        worldMap: worldMapSchema,
    },
    required: ["name", "description", "theme", "marketplace", "worldMap"]
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
        perubahanHp: { type: Type.INTEGER },
        perubahanMana: { type: Type.INTEGER },
        perubahanEmas: { type: Type.INTEGER },
        itemDiterima: { 
            type: Type.ARRAY,
            items: inventoryItemSchema
        },
        itemDihapus: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    quantity: { type: Type.INTEGER }
                },
                required: ["name", "quantity"]
            }
        },
        keluargaDiperbarui: {
            type: Type.ARRAY,
            items: familyMemberSchema
        }
    }
};

const worldMemorySchema = {
    type: Type.OBJECT,
    properties: {
        keyEvents: { type: Type.ARRAY, items: { type: Type.STRING } },
        keyCharacters: { type: Type.ARRAY, items: { type: Type.STRING } },
        worldStateSummary: { type: Type.STRING }
    },
    required: ["keyEvents", "keyCharacters", "worldStateSummary"]
};

const gameTurnSchema = {
    type: Type.OBJECT,
    properties: {
        narasiBaru: { type: Type.STRING },
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
        pembaruanKarakter: characterUpdateSchema,
        mapUpdate: worldMapSchema,
        partyUpdate: {
            type: Type.OBJECT,
            properties: {
                join: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        race: { type: Type.STRING },
                        characterClass: { type: Type.STRING },
                        stats: {
                            type: Type.OBJECT,
                            properties: {
                                level: { type: Type.INTEGER },
                                health: { type: Type.INTEGER },
                                maxHealth: { type: Type.INTEGER },
                                mana: { type: Type.INTEGER },
                                maxMana: { type: Type.INTEGER },
                            },
                             required: ["level", "health", "maxHealth", "mana", "maxMana"]
                        }
                    },
                    required: ["name", "race", "characterClass", "stats"]
                },
                leave: { type: Type.STRING }
            }
        }
    },
    required: ["narasiBaru", "sceneUpdate"],
};


class GeminiDungeonMaster implements IAiDungeonMasterService {
    async generateWorld(worldData: { concept: string; factions: string; conflict: string; }): Promise<{ name: string; description: string; marketplace: Marketplace; theme: WorldTheme; worldMap: WorldMap; }> {
        const prompt = `Anda adalah seorang Arsitek Dunia AI. Tugas Anda adalah menciptakan dunia fantasi yang hidup dengan ekonomi dan geografi yang berfungsi. SEMUA TEKS YANG DIHASILKAN HARUS DALAM BAHASA INDONESIA.

Masukan Pemain:
- Konsep Inti Dunia: "${worldData.concept}"
- Faksi & Kekuatan Utama: "${worldData.factions}"
- Konflik Saat Ini: "${worldData.conflict}"

Tugas Anda:
1.  **Sintesiskan Visi**: Ciptakan nama dan deskripsi dunia yang imersif.
2.  **Pilih Tema Visual (WAJIB)**: Berdasarkan 'Konsep Inti Dunia', pilih SATU tema visual yang paling cocok dari daftar berikut: ['dark_fantasy', 'cyberpunk', 'steampunk', 'high_fantasy'].
3.  **Ciptakan Pasar Awal (Marketplace)**: Buatlah toko-toko berikut: 'general_store', 'blacksmith', 'alchemist', 'traveling_merchant'.
4.  **Isi Inventaris Toko**: Untuk setiap toko, buat inventaris yang kaya dengan **8 hingga 15 item** yang relevan. Berikan ID unik (UUID), \`category\`, dan \`usageNotes\` untuk setiap item.
5.  **Buat Peta Awal (WorldMap)**: Ciptakan peta relasional awal. Buat 3-5 lokasi (node) yang saling terhubung di sekitar area awal. Setiap node harus memiliki ID unik, nama, dan deskripsi singkat. Tentukan jalur (edge) yang menghubungkan node-node ini, lengkap dengan arah (misal, 'Utara', 'Jalan Berbatu').
6.  **Format JSON**: Pastikan output Anda sesuai dengan skema JSON yang diberikan.`;

        const response = await generateContentWithRotation({
            model: "gemini-2.0-flash",
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
2.  **Ciptakan Detail Fisik (WAJIB)**: Berdasarkan ras, kelas, dan latar belakang, ciptakan:
    *   \`age\`: Umur yang realistis (misal: Elf berumur 150 tahun, Manusia 25 tahun).
    *   \`height\`: Tinggi badan yang sesuai (misal: '190 cm').
    *   \`appearance\`: Deskripsi penampilan yang kaya (2-3 kalimat), mencakup rambut, mata, fitur wajah, dan tanda unik (bekas luka, tato, dll.).
3.  **Ciptakan Keluarga (WAJIB)**: Berdasarkan latar belakang, ciptakan 1-3 anggota keluarga untuk karakter ini. Tentukan \`name\`, \`relationship\`, \`status\` ('Hidup', 'Hilang', 'Meninggal', 'Dalam bahaya'), dan \`description\` singkat yang bisa menjadi pemicu plot.
4.  **Tentukan Level Awal & Statistik**: Analisis latar belakang untuk menentukan level (1-5) dan alokasikan \`stats\` yang sesuai.
5.  **Perlengkapan & Inventaris Awal**: Berikan karakter perlengkapan awal yang logis di \`equipment\` dan beberapa item tambahan di \`inventory\`.
6.  **ID ITEM, KATEGORI & PENGGUNAAN**: Semua item di \`equipment\` dan \`inventory\` HARUS memiliki ID unik (UUID), \`category\` yang logis (misal: 'Peralatan', 'Ramuan', 'Item Misi'), dan \`usageNotes\` yang jelas (misal: 'Dipakai untuk bertarung', 'Minum untuk memulihkan HP').
7.  **Adegan Awal & NPC Unik**: Ciptakan \`initialScene\` dan \`introStory\` yang relevan.
    *   **ATURAN NAMA LOKASI**: Nama \`initialScene.location\` HARUS SAMA PERSIS dengan nama salah satu node di peta dunia awal.
    *   **Aturan Nama NPC**: Untuk setiap NPC di adegan awal, berikan nama yang **unik, bervariasi, dan sesuai dengan tema dunia**. Hindari nama-nama generik. Gunakan konteks dunia sebagai inspirasi.
    *   **Tautkan Pedagang**: Jika NPC di adegan awal adalah seorang pedagang, isi bidang \`shopId\` mereka dengan ID toko yang relevan.
    *   Tentukan \`availableShopIds\` secara logis berdasarkan lokasi. 
    *   Sikap NPC HARUS salah satu dari ['Ramah', 'Netral', 'Curiga', 'Bermusuhan'].
8.  **Format JSON**: Pastikan output sesuai dengan skema.`;

        const response = await generateContentWithRotation({
            model: "gemini-2.0-flash",
            contents: { parts: [{ text: prompt }] },
            config: { responseMimeType: "application/json", responseSchema: characterGenerationSchema }
        });
        return JSON.parse(response.text);
    }

    async generateNextScene(character: Character, party: Character[], scene: Scene, history: StoryEntry[], longTermMemory: WorldMemory, notes: string, quests: Quest[], worldEvents: WorldEvent[], turnCount: number, playerAction: string, transactionLog: TransactionLogEntry[], marketplace: Marketplace, worldMap: WorldMap): Promise<GameTurnResponse> {
        
        const prompt = `Anda adalah Dungeon Master (DM) AI yang logis dan konsisten. Misi utama Anda adalah menjaga kontinuitas cerita. SEMUA TEKS HARUS DALAM BAHASA INDONESIA.

**ATURAN INTI & PRINSIP:**
1.  **Prinsip Realisme & Konsistensi**: Semua peristiwa HARUS mengikuti logika internal dunia. Keputusan naratif HARUS didasarkan pada peristiwa masa lalu yang tercatat di 'MEMORI DUNIA'.
2.  **Aturan Percakapan (SANGAT PENTING)**: Jika aksi pemain adalah memulai percakapan atau mengajukan pertanyaan kepada NPC, narasi Anda **HARUS** menyertakan respons atau reaksi dari NPC tersebut.
3.  **Aturan Penemuan Dialog (SANGAT PENTING)**: Jika seorang NPC mengungkapkan lokasi baru yang spesifik dan dapat ditindaklanjuti dalam dialog (misalnya, menyebutkan 'Pasar Neonova' atau 'Reruntuhan Kuno'), Anda **WAJIB** memperbarui peta dengan menambahkan node dan edge baru di \`mapUpdate\`.
4.  **Manajemen Peta (PENTING)**: Jika pemain berpindah ke lokasi BARU yang belum ada di \`worldMap\`, Anda **WAJIB** membuat \`mapUpdate\`. Tambahkan node baru untuk lokasi tersebut dan edge baru yang menghubungkannya ke lokasi sebelumnya. Kembalikan SELURUH objek peta yang diperbarui.
5.  **Konsistensi Lokasi**: Nama lokasi di \`sceneUpdate.location\` HARUS SAMA PERSIS dengan nama node yang relevan di \`mapUpdate\` (atau \`worldMap\` jika tidak ada pembaruan).
6.  **Populasi Adegan (SANGAT PENTING)**: Jika adegan berada di lokasi yang ramai (kota, pasar, kedai), populasikan dengan **5-10 NPC yang beragam**. Beri mereka nama, deskripsi singkat, dan sikap yang unik.
7.  **Tautkan Pedagang ke Toko**: Jika salah satu NPC yang Anda tempatkan di adegan adalah seorang pedagang (misalnya, pandai besi, alkemis), Anda **WAJIB** mengisi bidang \`shopId\` mereka dengan ID yang sesuai dari daftar toko di marketplace. Pastikan juga ID toko tersebut ada di \`sceneUpdate.availableShopIds\`.

**KONTEKS SAAT INI (Kebenaran Dasar):**
-   **Giliran Saat Ini**: ${turnCount}
-   **PETA DUNIA (Lokasi yang Diketahui)**: ${JSON.stringify(worldMap)}
-   **DAFTAR TOKO DUNIA (Pedagang yang Ada)**: ${JSON.stringify(marketplace.shops.map(s => ({id: s.id, name: s.name, description: s.description})))}
-   **MEMORI DUNIA**: ${JSON.stringify(longTermMemory)}
-   **KARAKTER PEMAIN**: ${JSON.stringify({ name: character.name, stats: character.stats, gold: character.gold, inventory: character.inventory.map(i => `${i.item.name} (x${i.quantity})`) })}
-   **ADEGAN SAAT INI**: ${JSON.stringify(scene)}
-   **AKSI PEMAIN**: "${playerAction}"

**TUGAS ANDA (Ikuti Secara Berurutan):**
1.  **Analisis & Kontekstualisasi**: Pahami aksi pemain dalam konteks MEMORI DUNIA, PETA DUNIA, dan situasi saat ini.
2.  **Pemeriksaan Keterampilan (Jika Perlu)**: Jika aksi pemain memiliki kemungkinan untuk gagal, buatlah \`skillCheck\`.
3.  **Narasikan Hasil**: Tulis narasi (\`narasiBaru\`) yang merupakan kelanjutan LOGIS dari aksi pemain.
4.  **Perbarui Status & Dunia**:
    *   **Pembaruan Karakter**: Laporkan HANYA perubahan pada HP, mana, emas, item, dll., di \`pembaruanKarakter\`. Untuk setiap item baru di \`itemDiterima\`, pastikan untuk menyertakan \`category\` dan \`usageNotes\` yang detail.
    *   **Pembaruan Peta**: Terapkan **Aturan Manajemen Peta** dan **Aturan Penemuan Dialog**. Jika peta diperbarui, sertakan di \`mapUpdate\`.
    *   **Pembaruan Adegan**: Perbarui \`sceneUpdate\` dengan lokasi baru. Terapkan **Aturan Konsistensi Lokasi** dan **Populasi Adegan**.
    *   **ATURAN WAJIB PEMBARUAN TOKO**: Terapkan **Aturan Tautkan Pedagang ke Toko**.
    *   Jika relevan, perbarui misi (\`questsUpdate\`) atau picu peristiwa dunia (\`worldEventsUpdate\`).
5.  **KONSOLIDASI MEMORI**: Sintesiskan peristiwa PENTING dari giliran ini ke dalam memori, lalu keluarkan objek memori yang telah disempurnakan di \`memoryUpdate\`.
6.  **Format Respons**: Pastikan output Anda sesuai dengan skema JSON.`;
        
        const response = await generateContentWithRotation({
            model: "gemini-2.0-flash",
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
            model: "gemini-2.0-flash",
            contents: { parts: [{ text: prompt }] },
        });
        return response.text;
    }
}

export const geminiProvider = new GeminiDungeonMaster();
