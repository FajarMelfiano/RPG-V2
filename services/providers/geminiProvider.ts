

import { GoogleGenAI, Type } from "@google/genai";
import { Character, GameTurnResponse, Scene, StoryEntry, Quest, WorldEvent, Marketplace, TransactionLogEntry, ItemRarity, ItemSlot } from '../../types';
import { IAiDungeonMasterService } from "../aiService";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set. The application cannot start without it.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- SCHEMAS ---

const baseItemProperties = {
  id: { type: Type.STRING, description: "ID unik untuk item ini, gunakan UUID." },
  name: { type: Type.STRING },
  description: { type: Type.STRING },
  value: { type: Type.INTEGER, description: "Harga dasar item dalam keping emas. Harus lebih dari 0." },
  rarity: { type: Type.STRING, enum: Object.values(ItemRarity) },
};

// Skema item yang disederhanakan untuk menghindari kesalahan "too many states"
const itemSchema = {
    type: Type.OBJECT,
    description: "Represents any item in the game.",
    properties: {
        ...baseItemProperties,
        type: { type: Type.STRING, enum: ['Weapon', 'Armor', 'Accessory', 'Consumable', 'Misc'] },
        // Properti opsional untuk semua jenis item
        slot: { type: Type.STRING, enum: Object.values(ItemSlot), description: "Slot perlengkapan jika bisa dikenakan." },
        damage: { type: Type.STRING, description: "String dadu kerusakan (misal: '1d8 + KEK'). Hanya untuk Senjata." },
        properties: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Properti sihir (misal: 'Api'). Hanya untuk Senjata." },
        armorClass: { type: Type.INTEGER, description: "Bonus Kelas Zirah (AC). Hanya untuk Zirah/Perisai." },
        statBonuses: {
            type: Type.OBJECT,
            properties: {
                strength: { type: Type.INTEGER }, dexterity: { type: Type.INTEGER }, constitution: { type: Type.INTEGER },
                intelligence: { type: Type.INTEGER }, wisdom: { type: Type.INTEGER }, charisma: { type: Type.INTEGER },
            },
            description: "Bonus statistik. Hanya untuk Aksesoris."
        },
    },
    required: [...Object.keys(baseItemProperties), 'type']
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
    id: { type: Type.STRING, description: "ID unik untuk toko (misal: 'general_store', 'blacksmith')." },
    name: { type: Type.STRING, description: "Nama toko." },
    description: { type: Type.STRING, description: "Deskripsi singkat tentang toko dan pemiliknya." },
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

const baseStatsSchema = {
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
    name: { type: Type.STRING, description: "Nama karakter." },
    race: { type: Type.STRING },
    characterClass: { type: Type.STRING },
    backstory: { type: Type.STRING },
    baseStats: baseStatsSchema,
    inventory: { type: Type.ARRAY, items: inventoryItemSchema },
    equipment: equipmentSchema,
    reputation: { type: Type.INTEGER },
    gold: { type: Type.INTEGER }
  },
  required: ["name", "race", "characterClass", "backstory", "baseStats", "inventory", "equipment", "reputation", "gold"]
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
        status: { type: Type.STRING, enum: ['Aktif', 'Selesai'] },
    },
    required: ["title", "description", "status"]
};

const worldEventSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        type: { type: Type.STRING, enum: ['Sejarah', 'Berita', 'Ramalan'] },
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
        const prompt = `Anda adalah seorang Arsitek Dunia AI. Tugas Anda adalah menciptakan dunia fantasi yang hidup dengan ekonomi yang berfungsi.

Masukan Pemain:
- Konsep Inti Dunia: "${worldData.concept}"
- Faksi & Kekuatan Utama: "${worldData.factions}"
- Konflik Saat Ini: "${worldData.conflict}"

Tugas Anda:
1.  **Sintesiskan Visi**: Ciptakan nama dan deskripsi dunia yang imersif.
2.  **Ciptakan Pasar Awal (Marketplace)**: Buatlah toko-toko berikut:
    *   **Toko Kelontong** (id: 'general_store')
    *   **Pandai Besi** (id: 'blacksmith')
    *   **Alkemis** (id: 'alchemist')
    *   **Pedagang Keliling** (id: 'traveling_merchant')
3.  **Isi Inventaris Toko**: Untuk setiap toko, buat 3-5 item yang relevan. **SETIAP ITEM HARUS MEMILIKI STATISTIK YANG MENDETAIL** (damage untuk senjata, armorClass untuk zirah, statBonuses untuk aksesoris, dll). Pastikan untuk memberikan ID unik (UUID) untuk setiap item.
4.  **Format JSON**: Pastikan output Anda sesuai dengan skema JSON yang diberikan.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: worldGenerationSchema }
        });
        return JSON.parse(response.text);
    }

    async generateCharacter(characterData: { concept: string; background: string; }, worldContext: string): Promise<{ character: Omit<Character, 'id'>; initialScene: Scene; introStory: string; }> {
        const prompt = `Anda adalah seorang Dungeon Master AI. Ciptakan karakter yang hidup di dalam dunia yang sudah ada.

Konteks Dunia: "${worldContext}"
Masukan Pemain:
- Konsep Inti: "${characterData.concept}"
- Latar Belakang & Pengalaman: "${characterData.background}"

Tugas Anda:
1.  **Integrasi Dunia**: Karakter harus terasa seperti bagian dari dunia ini.
2.  **Tentukan Level Awal & Statistik Dasar**: Analisis latar belakang untuk menentukan level (1-5) dan alokasikan \`baseStats\` yang sesuai.
3.  **Perlengkapan Awal (Equipment)**: Berikan karakter perlengkapan awal yang logis di slot \`equipment\`.
4.  **Inventaris Awal (Inventory)**: Berikan beberapa item tambahan di \`inventory\`.
5.  **STATISTIK ITEM**: Semua item di \`equipment\` dan \`inventory\` HARUS memiliki statistik yang mendetail (damage, armorClass, dll.) dan ID unik (UUID).
6.  **Adegan Awal**: Ciptakan \`initialScene\` dan \`introStory\` yang relevan. Tentukan \`availableShopIds\` secara logis berdasarkan lokasi.
7.  **Format JSON**: Pastikan output sesuai dengan skema.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: characterGenerationSchema }
        });
        return JSON.parse(response.text);
    }

    async generateNextScene(character: Character, party: Character[], scene: Scene, history: StoryEntry[], longTermMemory: string[], notes: string, quests: Quest[], worldEvents: WorldEvent[], turnCount: number, playerAction: string, transactionLog: TransactionLogEntry[]): Promise<GameTurnResponse> {
        const prompt = `Anda adalah Dungeon Master AI. Lanjutkan cerita.

Giliran Saat Ini: ${turnCount}
Konteks Dunia:
- LOG TRANSAKSI TERBARU: ${transactionLog.length > 0 ? transactionLog.map(t => `- Giliran ${t.turn}: ${t.type === 'buy' ? 'Membeli' : 'Menjual'} ${t.itemName} (x${t.quantity}) seharga ${Math.abs(t.goldAmount)} emas.`).join('\n') : 'Tidak ada.'}
- CATATAN PEMAIN: ${notes || 'Tidak ada.'}
- ... (dan data lainnya seperti memori, misi, dll.)

Kondisi Saat Ini:
- Karakter Pemain (termasuk perlengkapan): ${JSON.stringify(character, null, 2)}
- Adegan: ${JSON.stringify(scene, null, 2)}
- Aksi Pemain: "${playerAction}"

Tugas Anda:
1.  **Analisis Kontekstual**: Baca SEMUA informasi. Narasi Anda harus mencerminkan perlengkapan karakter. Jika AC-nya tinggi, sebutkan bagaimana serangan meleset. Jika senjatanya magis, deskripsikan efeknya. Gunakan log transaksi untuk kesadaran ekonomi.
2.  **Proses Aksi**: Narasikan hasil aksi. Lakukan 'Pemeriksaan Keterampilan' (skillCheck) jika perlu. Tangani aksi "Periksa" NPC dengan detail.
3.  **Perbarui Status**: Perbarui SEMUA field di \`karakterTerbaru\`, termasuk \`inventory\` dan \`equipment\` jika mereka menemukan loot. Loot HARUS memiliki statistik mendetail dan ID unik. Sikap NPC harus diperbarui secara dinamis.
4.  **Ketersediaan Toko**: Berdasarkan \`sceneUpdate.location\` yang baru, tentukan \`availableShopIds\` secara realistis.
5.  **Manajemen Pasar**: Setiap 20-25 giliran, segarkan inventaris 'traveling_merchant' di \`marketplaceUpdate\`.
6.  **Manajemen Misi & Dunia**: Perbarui misi dan peristiwa dunia seperti biasa.
7.  **Format Respons**: Pastikan output sesuai dengan skema JSON.`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: gameTurnSchema }
        });
        return JSON.parse(response.text) as GameTurnResponse;
    }

    async askOOCQuestion(history: StoryEntry[], longTermMemory: string[], question: string): Promise<string> {
        const prompt = `Anda adalah seorang Game Master (GM) yang membantu. Jawab pertanyaan OOC pemain dengan jelas dan singkat, berdasarkan konteks cerita yang ada.

Konteks Cerita:
- Memori Jangka Panjang: ${longTermMemory.join('\n- ')}
- Dialog Terbaru: ${history.slice(-10).map(e => `${e.type}: ${e.content}`).join('\n')}
- Pertanyaan OOC Pemain: "${question}"

Jawaban Anda (sebagai GM):`;

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
        });
        return response.text;
    }
}

export const geminiProvider = new GeminiDungeonMaster();
