export enum GameState {
  START,
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

export interface GameTurnResponse {
    narasiBaru: string;
    karakterTerbaru: Omit<Character, 'id'>;
    partyTerbaru?: Omit<Character, 'id'>[];
    sceneUpdate: Scene;
    skillCheck?: SkillCheckResult;
    notifications?: string[];
    memorySummary?: string; // Ringkasan satu kalimat untuk ingatan jangka panjang AI
}

export interface AppNotification {
    id: number;
    message: string;
}

export interface SavedGame {
  id: string;
  character: Character;
  party: Character[];
  scene: Scene;
  storyHistory: StoryEntry[];
  longTermMemory: string[]; // Menyimpan memori jangka panjang AI
  notes: string; // Menyimpan catatan pemain
  lastSaved: string; // ISO Date string
}