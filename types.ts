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

export interface InventoryItem {
  name: string;
  quantity: number;
  description: string;
  value: number; // Nilai dasar dalam keping emas
}

export interface Character {
  id: string;
  name: string;
  race: string;
  characterClass: string;
  backstory: string;
  stats: Stats;
  inventory: InventoryItem[];
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
    inventory?: InventoryItem[]; // Inventaris barang dagangan NPC
}

export interface Scene {
    location: string;
    description: string;
    npcs: NPC[];
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

export interface GameTurnResponse {
    narasiBaru: string;
    karakterTerbaru: Omit<Character, 'id'>;
    partyTerbaru?: Omit<Character, 'id'>[];
    sceneUpdate: Scene;
    skillCheck?: SkillCheckResult;
    notifications?: string[];
    memorySummary?: string; // Ringkasan satu kalimat untuk ingatan jangka panjang AI
    questsUpdate?: Quest[]; // Pembaruan atau penambahan misi
    worldEventsUpdate?: Omit<WorldEvent, 'id' | 'turn'>[]; // Penambahan peristiwa dunia baru
}

export interface AppNotification {
    id: number;
    message: string;
}

// Menyimpan data progres spesifik untuk satu karakter di dalam sebuah dunia
export interface SavedCharacter {
  character: Character;
  party: Character[];
  scene: Scene;
  storyHistory: StoryEntry[];
  notes: string;
  turnCount: number;
  lastPlayed: string; // ISO Date string
}

// Entitas penyimpanan utama yang baru
export interface World {
  id: string;
  name: string;
  description: string;
  longTermMemory: string[];
  worldEvents: WorldEvent[];
  quests: Quest[];
  characters: SavedCharacter[];
}