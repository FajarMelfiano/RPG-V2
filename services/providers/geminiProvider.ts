import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Character, GameTurnResponse, Scene, StoryEntry, Quest, WorldEvent, Marketplace, TransactionLogEntry, ItemRarity, ItemSlot, WorldTheme, FamilyMember, WorldMemory, WorldMap, Residence } from '../../types';
import { IAiDungeonMasterService } from "../aiService";
import { apiKeyManager } from "../apiKeyManager";


async function generateContentWithRotation(request: any): Promise<GenerateContentResponse> {
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

const residenceSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING },
        name: { type: Type.STRING },
        description: { type: Type.STRING },
        location: { type: Type.STRING },
        storage: { type: Type.ARRAY, items: inventoryItemSchema }
    },
    required: ["id", "name", "description", "location", "storage"]
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
        type: { type: Type.STRING, description: "Jenis lokasi (misalnya, 'City', 'Town', 'Forest', 'Mountain', 'Dungeon', 'Camp', 'Other'). WAJIB diisi." },
    },
    required: ["id", "name", "description", "type"]
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
    family: { type: Type.ARRAY, items: familyMemberSchema },
    residences: { type: Type.ARRAY, items: residenceSchema }
  },
  required: ["name", "race", "characterClass", "age", "height", "appearance", "backstory", "stats", "inventory", "equipment", "reputation", "gold", "family", "residences"]
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
        },
        residenceGained: residenceSchema
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
        gmInterventionOoc: { type: Type.STRING, description: "Jika pemain membuat kesalahan faktual (salah nama, dll.), berikan pesan koreksi di sini. Jika tidak, biarkan kosong." },
        skillCheck: {
            type: Type.OBJECT,
            properties: {
                skill: { type: Type.STRING, description: "Keterampilan spesifik yang diuji (contoh: 'Persuasi', 'Menyelinap'). HARUS berupa string spesifik, BUKAN 'string'." },
                attribute: { type: Type.STRING, description: "Atribut yang digunakan (contoh: 'Karisma', 'Ketangkasan'). HARUS berupa string spesifik, BUKAN 'string'." },
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
5.  **Buat Peta Awal (WorldMap)**: Ciptakan peta relasional awal. Buat 3-5 lokasi (node) yang saling terhubung di sekitar area awal. Setiap node harus memiliki ID unik, nama, deskripsi singkat, dan **jenis ('type') yang sesuai (misalnya, 'City', 'Forest')**. Tentukan jalur (edge) yang menghubungkan node-node ini, lengkap dengan arah (misal, 'Utara', 'Jalan Berbatu').
6.  **Format JSON**: Pastikan output Anda sesuai dengan skema JSON yang diberikan.`;

        const response = await generateContentWithRotation({
            model: "gemini-2.0-flash",
            contents: { parts: [{ text: prompt }] },
            config: { responseMimeType: "application/json", responseSchema: worldGenerationSchema }
        });
        const jsonString = response.text;
        return JSON.parse(jsonString);
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
4.  **Properti Awal**: Jika latar belakang menyiratkan kepemilikan (misal: 'bangsawan yang memiliki manor kecil'), berikan karakter sebuah properti awal di array \`residences\`. Jika tidak, biarkan array kosong.
5.  **Tentukan Level Awal & Statistik**: Analisis latar belakang untuk menentukan level (1-5) dan alokasikan \`stats\` yang sesuai.
6.  **Perlengkapan & Inventaris Awal**: Berikan karakter perlengkapan awal yang logis di \`equipment\` dan beberapa item tambahan di \`inventory\`.
7.  **ID ITEM, KATEGORI & PENGGUNAAN**: Semua item di \`equipment\` dan \`inventory\` HARUS memiliki ID unik (UUID), \`category\` yang logis (misal: 'Peralatan', 'Ramuan', 'Item Misi'), dan \`usageNotes\` yang jelas (misal: 'Dipakai untuk bertarung', 'Minum untuk memulihkan HP').
8.  **Adegan Awal & NPC Unik**: Ciptakan \`initialScene\` dan \`introStory\` yang relevan.
    *   **Aturan Nama NPC**: Untuk setiap NPC di adegan awal, berikan nama yang **unik, bervariasi, dan sesuai dengan tema dunia**. Hindari nama-nama generik. Gunakan konteks dunia sebagai inspirasi.
    *   **Tautkan Pedagang**: Jika NPC di adegan awal adalah seorang pedagang, isi bidang \`shopId\` mereka dengan ID toko yang relevan.
    *   Tentukan \`availableShopIds\` secara logis berdasarkan lokasi. 
    *   Sikap NPC HARUS salah satu dari ['Ramah', 'Netral', 'Curiga', 'Bermusuhan'].
9.  **Format JSON**: Pastikan output sesuai dengan skema.`;

        const response = await generateContentWithRotation({
            model: "gemini-2.0-flash",
            contents: { parts: [{ text: prompt }] },
            config: { responseMimeType: "application/json", responseSchema: characterGenerationSchema }
        });
        const jsonString = response.text;
        return JSON.parse(jsonString);
    }

    async generateNextScene(character: Character, party: Character[], scene: Scene, history: StoryEntry[], longTermMemory: WorldMemory, notes: string, quests: Quest[], worldEvents: WorldEvent[], turnCount: number, playerAction: string, transactionLog: TransactionLogEntry[], marketplace: Marketplace, worldMap: WorldMap): Promise<GameTurnResponse> {
        
        const currentLocationNode = worldMap.nodes.find(node => node.name === scene.location);
        const charactersInScene = [character.name, ...party.map(p => p.name), ...scene.npcs.map(n => n.name)];

        const shopsInScene = marketplace.shops.filter(shop => 
            scene.availableShopIds?.includes(shop.id)
        );

        const marketplaceContext = shopsInScene.map(shop => {
            const npcOwner = scene.npcs.find(npc => npc.shopId === shop.id);
            return {
                shopId: shop.id,
                shopName: shop.name,
                owner: npcOwner?.name || 'Tidak diketahui',
                inventory: shop.inventory.map(item => ({
                    name: item.item.name,
                    price: item.item.value,
                    stock: item.quantity
                }))
            };
        });

        const prompt = `Anda adalah Dungeon Master (DM) AI yang logis dan konsisten. Misi utama Anda adalah menjaga kontinuitas cerita, realisme, dan menciptakan pengalaman yang dinamis. SEMUA TEKS HARUS DALAM BAHASA INDONESIA.

**ATURAN INTI & PRINSIP (WAJIB DIIKUTI):**
1.  **FOKUS PADA KONTEKS & KARAKTER YANG HADIR (ATURAN #1 PALING KRITIS)**: Narasi Anda HARUS berpusat pada aksi dan dialog dari karakter yang secara eksplisit ada di adegan saat ini. Jangan pernah menarasikan tindakan atau respons dari karakter yang tidak ada dalam daftar 'KARAKTER DI ADEGAN'. Jika seorang karakter (misalnya 'Freya') melakukan sesuatu, respons harus datang dari karakter lain yang hadir, BUKAN dari karakter acak seperti 'Penjaga Kota' yang tidak ada di sana. Pelanggaran aturan ini merusak permainan.
2.  **Pembaruan Adegan Dinamis (SANGAT PENTING)**: Jika aksi pemain secara logis mengakibatkan perpindahan ke sub-lokasi (misalnya, 'masuk ke dalam rumah', 'turun ke ruang bawah tanah'), Anda **WAJIB** memperbarui \`sceneUpdate\` secara detail. \`sceneUpdate.location\` harus diubah menjadi nama sub-lokasi yang lebih spesifik (misalnya, dari 'Jalan Utama' menjadi 'Di Dalam Rumah Eldrin'). Deskripsikan interiornya, suasana, dan yang paling penting, **populasikan \`sceneUpdate.npcs\` dengan karakter yang relevan** yang seharusnya berada di lokasi baru tersebut.
3.  **ATURAN INTERVENSI & KOREKSI GM (KRITIS)**: Jika aksi pemain mengandung kesalahan faktual yang jelas (misal: salah menyebut nama NPC/lokasi yang ada di adegan), Anda **WAJIB** memberikan koreksi singkat dan sopan melalui bidang \`gmInterventionOoc\`. JANGAN menarasikan hasil aksi yang salah. Cukup berikan koreksi. Contoh: "Tidak ada NPC bernama 'Grom' di sini, tapi ada 'Grek'. Apakah Anda bermaksud berbicara dengannya?".
4.  **HINDARI LEMPARAN DADU YANG TIDAK PERLU**: **JANGAN** membuat \`skillCheck\` untuk aksi-aksi biasa seperti berjalan, berbicara, atau mengamati. Hanya gunakan \`skillCheck\` jika ada **ketegangan dramatis** dan **hasil yang tidak pasti** dengan **konsekuensi kegagalan yang jelas**.
5.  **MANAJEMEN PETA & PENCEGAHAN DUPLIKASI (SANGAT KRITIS)**: Sebelum menambahkan lokasi baru ke \`mapUpdate\`, Anda **WAJIB** memeriksa 'DAFTAR LOKASI DI PETA'.
    *   **JANGAN BUAT DUPLIKAT**: Jika sebuah lokasi dengan nama yang sama atau sangat mirip sudah ada, **GUNAKAN KEMBALI NODE YANG ADA** dan JANGAN membuat node baru.
    *   **KONSISTENSI LOKASI**: Nama lokasi di \`sceneUpdate.location\` HARUS SAMA PERSIS dengan nama node yang relevan di 'DAFTAR LOKASI DI PETA'.
    *   **NODE BARU**: Ciptakan node baru di \`mapUpdate\` HANYA untuk lokasi yang benar-benar baru dan belum pernah disebutkan. Pastikan node baru memiliki 'type' yang sesuai.
6.  **MANAJEMEN EKONOMI (SANGAT KRITIS)**: Ketika menangani transaksi atau menjawab pertanyaan tentang harga, Anda **HARUS** mengacu pada harga yang tercantum dalam 'INFORMASI PASAR'. Jangan pernah mengarang harga. Jika pemain bertanya harga, berikan harga dari data tersebut. Periksa kepemilikan emas pemain sebelum memproses pembelian. **Pembelian Properti**: Jika pemain setuju untuk membeli properti, perbarui \`pembaruanKarakter\` dengan \`perubahanEmas\` (negatif) DAN \`residenceGained\` dengan detail properti yang baru. Pastikan ID properti unik.

**KONTEKS SAAT INI (Kebenaran Dasar):**
-   **Giliran Saat Ini**: ${turnCount}
-   **DAFTAR LOKASI DI PETA (ID & NAMA)**: ${JSON.stringify(worldMap.nodes.map(n => ({id: n.id, name: n.name})))}
-   **LOKASI SAAT INI**: "${scene.location}" (ID Node: ${currentLocationNode ? currentLocationNode.id : 'Tidak diketahui'})
-   **KARAKTER DI ADEGAN**: ${JSON.stringify(charactersInScene)}
-   **INFORMASI PASAR DI LOKASI INI**: ${JSON.stringify(marketplaceContext)}
-   **MEMORI DUNIA**: ${JSON.stringify(longTermMemory.worldStateSummary)}
-   **KEPEMILIKAN PEMAIN**: Emas: ${character.gold}, Properti: ${character.residences.map(r => r.name).join(', ') || 'Tidak ada'}
-   **AKSI PEMAIN**: "${playerAction}"

**TUGAS ANDA (Ikuti Secara Berurutan):**
1.  **Analisis & Kontekstualisasi**: Pahami aksi pemain dalam konteks LOKASI SAAT INI dan KARAKTER DI ADEGAN. Jika ini adalah interaksi ekonomi, rujuk **INFORMASI PASAR** dan **KEPEMILIKAN PEMAIN**.
2.  **Terapkan Aturan**: Terapkan **ATURAN FOKUS KONTEKS**, **ATURAN INTERVENSI GM**, dan **ATURAN MANAJEMEN PETA** terlebih dahulu. Jika pemain pindah lokasi, terapkan **ATURAN PEMBARUAN ADEGAN DINAMIS**.
3.  **Narasikan Hasil**: Tulis narasi (\`narasiBaru\`) yang merupakan kelanjutan LOGIS dari aksi pemain, dengan mematuhi semua aturan di atas.
4.  **Perbarui Dunia**: Perbarui HANYA apa yang berubah. Isi \`sceneUpdate\`, \`pembaruanKarakter\`, \`mapUpdate\`, dll., hanya jika ada perubahan. Jika pemain hanya berpindah antar lokasi yang sudah ada, \`mapUpdate\` harus kosong atau null.
5.  **Format Respons**: Pastikan output Anda sesuai dengan skema JSON.`;
        
        const response = await generateContentWithRotation({
            model: "gemini-2.0-flash",
            contents: { parts: [{ text: prompt }] },
            config: { responseMimeType: "application/json", responseSchema: gameTurnSchema }
        });
        const jsonString = response.text;
        return JSON.parse(jsonString) as GameTurnResponse;
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
        const text = response.text;
        return text;
    }
}

export const geminiProvider = new GeminiDungeonMaster();