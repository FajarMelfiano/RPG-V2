export enum GameState {
  START,
  CREATING_CHARACTER,
  PLAYING,
  GAME_OVER,
  CHARACTER_SELECTION,
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
    type: 'narrative' | 'action' | 'system' | 'dice_roll';
    content: string;
    rollDetails?: SkillCheckResult;
}

export interface GameTurnResponse {
    narasiBaru: string;
    karakterTerbaru: Character;
    sceneUpdate: Scene;
    skillCheck?: SkillCheckResult;
    notifications?: string[];
}

export interface AppNotification {
    id: number;
    message: string;
}

export interface SavedGame {
  id: string; // Menggunakan nama karakter sebagai ID unik
  character: Character;
  scene: Scene;
  storyHistory: StoryEntry[];
}
