export enum GameState {
  START,
  CREATING_WORLD,
  WORLD_LOBBY,
  CREATING_CHARACTER,
  PLAYING,
  GAME_OVER,
}

export interface Stats {
  level: number;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  armorClass: number; // AC dihitung
}

export enum ItemSlot {
  MAIN_HAND = 'mainHand',
  OFF_HAND = 'offHand',
  HEAD = 'head',
  CHEST = 'chest',
  LEGS = 'legs',
  FEET = 'feet',
  NECK = 'neck',
  RING = 'ring',
}

export enum ItemRarity {
  BIASA = 'Biasa',
  TIDAK_BIASA = 'Tidak Biasa',
  LANGKA = 'Langka',
  EPIK = 'Epik',
}

export interface BaseItem {
  id: string;
  name: string;
  description: string;
  value: number;
  rarity: ItemRarity;
  type: 'Weapon' | 'Armor' | 'Accessory' | 'Consumable' | 'Misc';
  slot?: ItemSlot; // Hanya untuk item yang bisa dikenakan
}

export interface Weapon extends BaseItem {
  type: 'Weapon';
  damage: string; // misal: "1d8 + KEK"
  properties?: string[];
  slot: ItemSlot.MAIN_HAND | ItemSlot.OFF_HAND;
}

export interface Armor extends BaseItem {
  type: 'Armor';
  armorClass: number;
  slot: ItemSlot.HEAD | ItemSlot.CHEST | ItemSlot.LEGS | ItemSlot.FEET | ItemSlot.OFF_HAND; // Off-hand untuk perisai
}

export interface Accessory extends BaseItem {
  type: 'Accessory';
  statBonuses?: Partial<Omit<Stats, 'health' | 'maxHealth' | 'mana' | 'maxMana' | 'armorClass' | 'level'>>;
  slot: ItemSlot.NECK | ItemSlot.RING;
}

export interface MiscItem extends BaseItem {
  type: 'Consumable' | 'Misc';
  slot?: undefined;
}

export type EquippableItem = Weapon | Armor | Accessory;
export type AnyItem = EquippableItem | MiscItem;

export interface InventoryItem {
  item: AnyItem;
  quantity: number;
}

// Item yang dijual di toko
export type ShopItem = InventoryItem;

export type Equipment = {
  [key in ItemSlot]?: EquippableItem;
};

export interface Character {
  id: string;
  name: string;
  race: string;
  characterClass: string;
  backstory: string;
  stats: Stats;
  baseStats: Omit<Stats, 'armorClass'>; // Stats tanpa modifikasi item
  inventory: InventoryItem[];
  equipment: Equipment;
  reputation: number;
  gold: number;
}

export interface SkillCheckResult {
  skill: string;
  attribute: string;
  diceRoll: number;
  bonus: number;
  total: number;
  dc: number;
  success: boolean;
}

export interface NPC {
    name: string;
    description: string;
    attitude: 'Ramah' | 'Netral' | 'Curiga' | 'Bermusuhan';
}

export interface Scene {
    location: string;
    description: string;
    npcs: NPC[];
    availableShopIds?: string[];
}

export interface StoryEntry {
    type: 'narrative' | 'action' | 'system' | 'dice_roll' | 'ooc_query' | 'ooc_response';
    content: string;
    rollDetails?: SkillCheckResult;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  status: 'Aktif' | 'Selesai';
}

export interface WorldEvent {
  id: string;
  turn: number;
  title: string;
  description: string;
  type: 'Sejarah' | 'Berita' | 'Ramalan';
}

export interface Shop {
  id: string;
  name: string;
  description: string;
  inventory: ShopItem[];
}

export interface Marketplace {
  shops: Shop[];
}

export interface GameTurnResponse {
    narasiBaru: string;
    karakterTerbaru: Omit<Character, 'id'>;
    partyTerbaru?: Omit<Character, 'id'>[];
    sceneUpdate: Scene;
    skillCheck?: SkillCheckResult;
    memorySummary?: string; 
    questsUpdate?: Quest[];
    worldEventsUpdate?: Omit<WorldEvent, 'id' | 'turn'>[];
    marketplaceUpdate?: Marketplace;
}

export interface AppNotification {
    id: number;
    message: string;
}

export interface TransactionLogEntry {
  turn: number;
  type: 'buy' | 'sell';
  itemName: string;
  quantity: number;
  goldAmount: number;
}

export interface SavedCharacter {
  character: Character;
  party: Character[];
  scene: Scene;
  storyHistory: StoryEntry[];
  notes: string;
  turnCount: number;
  lastPlayed: string;
  transactionLog: TransactionLogEntry[];
}

export interface World {
  id: string;
  name: string;
  description: string;
  longTermMemory: string[];
  worldEvents: WorldEvent[];
  quests: Quest[];
  characters: SavedCharacter[];
  marketplace: Marketplace;
}