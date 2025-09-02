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

export interface AnyItem {
  id: string;
  name: string;
  description: string;
  value: number;
  rarity: ItemRarity;
  type: 'Weapon' | 'Armor' | 'Accessory' | 'Consumable' | 'Misc';
  category: string; // e.g., 'Potion', 'Scroll', 'Key', 'Material', 'Junk'
  usageNotes: string; // e.g., 'Drink to restore health.' or 'Unlocks the old cellar door.'
  slot?: ItemSlot;
}

export type EquippableItem = AnyItem & { slot: ItemSlot };

export interface InventoryItem {
  item: AnyItem;
  quantity: number;
}

export type ShopItem = InventoryItem;

export type Equipment = {
  [key in ItemSlot]?: EquippableItem;
};

export type FamilyStatus = 'Hidup' | 'Hilang' | 'Meninggal' | 'Dalam bahaya';

export interface FamilyMember {
  name: string;
  relationship: string;
  status: FamilyStatus;
  description: string;
}

export interface Residence {
  id: string;
  name: string;
  description: string;
  location: string;
  storage: InventoryItem[];
}

export interface Character {
  id: string;
  name: string;
  race: string;
  characterClass: string;
  age: number;
  height: string;
  appearance: string;
  backstory: string;
  stats: Stats;
  inventory: InventoryItem[];
  equipment: Equipment;
  reputation: number;
  gold: number;
  family: FamilyMember[];
  residences: Residence[];
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
    shopId?: string;
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

export interface CharacterUpdatePayload {
  perubahanHp?: number;
  perubahanMana?: number;
  perubahanEmas?: number;
  itemDiterima?: InventoryItem[];
  itemDihapus?: {
    name: string;
    quantity: number;
  }[];
  keluargaDiperbarui?: FamilyMember[];
  residenceGained?: Residence;
}

export interface WorldMemory {
  keyEvents: string[];
  keyCharacters: string[];
  worldStateSummary: string;
}

export interface MapNode {
  id: string;
  name: string;
  description: string;
  type: string;
}

export interface MapEdge {
  fromNodeId: string;
  toNodeId: string;
  direction: string;
  description: string;
}

export interface WorldMap {
  nodes: MapNode[];
  edges: MapEdge[];
}

export interface GameTurnResponse {
    narasiBaru: string;
    pembaruanKarakter?: CharacterUpdatePayload;
    sceneUpdate: Scene;
    skillCheck?: SkillCheckResult;
    memoryUpdate?: WorldMemory;
    questsUpdate?: Quest[];
    worldEventsUpdate?: Omit<WorldEvent, 'id' | 'turn'>[];
    marketplaceUpdate?: Marketplace;
    mapUpdate?: WorldMap;
    partyUpdate?: {
        join?: Omit<Character, 'id'>;
        leave?: string; // name of character leaving
    };
    gmInterventionOoc?: string;
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
  hasSeenGuidebook: boolean;
}

export type WorldTheme = 'dark_fantasy' | 'cyberpunk' | 'steampunk' | 'high_fantasy';

export interface World {
  id: string;
  name: string;
  description: string;
  theme: WorldTheme;
  longTermMemory: WorldMemory;
  worldEvents: WorldEvent[];
  quests: Quest[];
  characters: SavedCharacter[];
  marketplace: Marketplace;
  worldMap: WorldMap;
}