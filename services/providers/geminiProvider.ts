

// FIX: Replaced deprecated `GenerateContentRequest` type with `GenerateContentParameters`.
import { GoogleGenAI, Type, GenerateContentParameters } from "@google/genai";
import { Character, GameTurnResponse, Scene, StoryEntry, Quest, WorldEvent, Marketplace, TransactionLogEntry, ItemRarity, ItemSlot } from '../../types';
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
    gold: { type: Type.INTEGER }
  },
  required: ["name", "race", "characterClass", "backstory", "stats", "inventory", "equipment", "reputation", "gold"]
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
        marketplace: marketplaceSchema,
    },
    required: ["name", "description", "marketplace"]
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

const gameTurnSchema = {
    type: Type.OBJECT,
    properties: {
        narasiBaru: { type: Type.STRING },
        karakterTerbaru: characterSchema,
        partyTerbaru: { type: Type.ARRAY, items: characterSchema },
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
        memorySummary: { type: Type.STRING },
        questsUpdate: { type: Type.ARRAY, items: questSchema },
        worldEventsUpdate: { type: Type.ARRAY, items: worldEventSchema },
        marketplaceUpdate: marketplaceSchema,
    },
    required: ["narasiBaru", "karakterTerbaru", "partyTerbaru", "sceneUpdate"]
};

class GeminiDungeonMaster implements IAiDungeonMasterService {
    async generateWorld(worldData: { concept: string; factions: string; conflict: string; }): Promise<{ name: string; description: string; marketplace: Marketplace; }> {
        const prompt = `Anda adalah seorang Arsitek Dunia AI. Tugas Anda adalah menciptakan dunia fantasi yang hidup dengan ekonomi yang berfungsi. SEMUA TEKS YANG DIHASILKAN HARUS DALAM BAHASA INDONESIA.

Masukan Pemain:
- Konsep Inti Dunia: "${worldData.concept}"
- Faksi & Kekuatan Utama: "${worldData.factions}"
- Konflik Saat Ini: "${worldData.conflict}"

Tugas Anda:
1.  **Sintesiskan Visi**: Ciptakan nama dan deskripsi dunia yang imersif.
2.  **Ciptakan Pasar Awal (Marketplace)**: Buatlah toko-toko berikut: 'general_store', 'blacksmith', 'alchemist', 'traveling_merchant'.
3.  **Isi Inventaris Toko**: Untuk setiap toko, buat 3-5 item yang relevan dan deskriptif. Fokus pada narasi, BUKAN statistik numerik. Pastikan untuk memberikan ID unik (UUID) untuk setiap item.
4.  **Format JSON**: Pastikan output Anda sesuai dengan skema JSON yang diberikan.`;

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
2.  **Tentukan Level Awal & Statistik**: Analisis latar belakang untuk menentukan level (1-5) dan alokasikan \`stats\` yang sesuai.
3.  **Perlengkapan & Inventaris Awal**: Berikan karakter perlengkapan awal yang logis di \`equipment\` dan beberapa item tambahan di \`inventory\`. Fokus pada deskripsi item, bukan statistik numerik.
4.  **ID ITEM**: Semua item di \`equipment\` dan \`inventory\` HARUS memiliki ID unik (UUID).
5.  **Adegan Awal**: Ciptakan \`initialScene\` dan \`introStory\` yang relevan. Tentukan \`availableShopIds\` secara logis berdasarkan lokasi. Sikap NPC HARUS salah satu dari ['Ramah', 'Netral', 'Curiga', 'Bermusuhan'].
6.  **Format JSON**: Pastikan output sesuai dengan skema.`;

        const response = await generateContentWithRotation({
            model: "gemini-2.5-flash",
            contents: { parts: [{ text: prompt }] },
            config: { responseMimeType: "application/json", responseSchema: characterGenerationSchema }
        });
        return JSON.parse(response.text);
    }

    async generateNextScene(character: Character, party: Character[], scene: Scene, history: StoryEntry[], longTermMemory: string[], notes: string, quests: Quest[], worldEvents: WorldEvent[], turnCount: number, playerAction: string, transactionLog: TransactionLogEntry[], marketplace: Marketplace): Promise<GameTurnResponse> {
        const prompt = `Anda adalah Dungeon Master AI. Lanjutkan cerita. SEMUA TEKS YANG DIHASILKAN HARUS DALAM BAHASA INDONESIA.

Giliran Saat Ini: ${turnCount}
Konteks Dunia:
- DAFTAR TOKO YANG ADA DI DUNIA: ${JSON.stringify(marketplace.shops.map(s => ({id: s.id, name: s.name, description: s.description})))}
- LOG TRANSAKSI TERBARU: ${transactionLog.length > 0 ? transactionLog.map(t => `- Giliran ${t.turn}: ${t.type === 'buy' ? 'Membeli' : 'Menjual'} ${t.itemName} (x${t.quantity}) seharga ${Math.abs(t.goldAmount)} emas.`).join('\n') : 'Tidak ada.'}
- CATATAN PEMAIN: ${notes || 'Tidak ada.'}
- ... (dan data lainnya seperti memori, misi, dll.)

Kondisi Saat Ini:
- Karakter Pemain (termasuk perlengkapan): ${JSON.stringify(character, null, 2)}
- Adegan: ${JSON.stringify(scene, null, 2)}
- Aksi Pemain: "${playerAction}"

Tugas Anda:
1.  **Analisis Naratif**: Baca SEMUA informasi. Narasi Anda harus mencerminkan perlengkapan karakter secara deskriptif. Jika karakter memakai zirah pelat, sebutkan bagaimana serangan memantul. Jika senjatanya terlihat kuno, deskripsikan. Gunakan log transaksi untuk kesadaran ekonomi.
2.  **Proses Aksi**: Narasikan hasil aksi. Lakukan 'Pemeriksaan Keterampilan' (skillCheck) jika perlu. Tangani aksi "Periksa" NPC dengan detail.
3.  **Perbarui Status**: Perbarui SEMUA field di \`karakterTerbaru\`. Jika mereka menemukan loot, item baru HARUS memiliki ID unik. Sikap NPC dalam \`sceneUpdate\` harus diperbarui secara dinamis dan HARUS salah satu dari ['Ramah', 'Netral', 'Curiga', 'Bermusuhan'].
4.  **Ketersediaan Toko (SANGAT PENTING)**: Berdasarkan \`sceneUpdate.location\` yang baru, lihat DAFTAR TOKO YANG ADA dan tentukan \`availableShopIds\` secara realistis. Jika lokasi adalah "Pasar Perbatasan Lumina", maka toko-toko yang relevan HARUS tersedia. Jika di "Gua Gelap", maka array harus kosong.
5.  **Manajemen Pasar**: Setiap 20-25 giliran, segarkan inventaris 'traveling_merchant' di \`marketplaceUpdate\`.
6.  **Manajemen Misi & Dunia**: Perbarui misi dan peristiwa dunia seperti biasa.
7.  **Format Respons**: Pastikan output sesuai dengan skema JSON.`;
        
        const response = await generateContentWithRotation({
            model: "gemini-2.5-flash",
            contents: { parts: [{ text: prompt }] },
            config: { responseMimeType: "application/json", responseSchema: gameTurnSchema }
        });
        return JSON.parse(response.text) as GameTurnResponse;
    }

    async askOOCQuestion(history: StoryEntry[], longTermMemory: string[], question: string): Promise<string> {
        const prompt = `Anda adalah seorang Game Master (GM) yang membantu. Jawab pertanyaan OOC pemain dengan jelas dan singkat dalam Bahasa Indonesia, berdasarkan konteks cerita yang ada.

Konteks Cerita:
- Memori Jangka Panjang: ${longTermMemory.join('\n- ')}
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