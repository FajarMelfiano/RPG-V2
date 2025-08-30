import { Character, GameTurnResponse, Scene, StoryEntry, Quest, WorldEvent } from '../types';
import { geminiProvider } from './providers/geminiProvider';
import { openAiProvider } from './providers/openAIProvider';

export interface IAiDungeonMasterService {
  generateWorld(worldData: { concept: string; factions: string; conflict: string }): Promise<{
    name: string;
    description: string;
  }>;

  generateCharacter(
    characterData: { concept: string; background: string },
    worldContext: string
  ): Promise<{
    character: Omit<Character, 'id'>;
    initialScene: Scene;
    introStory: string;
  }>;

  generateNextScene(
    character: Character,
    party: Character[],
    scene: Scene,
    history: StoryEntry[],
    longTermMemory: string[],
    notes: string,
    quests: Quest[],
    worldEvents: WorldEvent[],
    turnCount: number,
    playerAction: string
  ): Promise<GameTurnResponse>;

  askOOCQuestion(
    history: StoryEntry[],
    longTermMemory: string[],
    question: string
  ): Promise<string>;
}

enum AiProvider {
    GEMINI = 'GEMINI',
    OPENAI = 'OPENAI',
}

const aiConfig = {
    provider: AiProvider.GEMINI
};

let DungeonMaster: IAiDungeonMasterService;

switch (aiConfig.provider) {
    case AiProvider.GEMINI:
        DungeonMaster = geminiProvider;
        break;
    case AiProvider.OPENAI:
        DungeonMaster = openAiProvider;
        break;
    default:
        console.warn(`Penyedia AI tidak dikenal: ${aiConfig.provider}. Menggunakan Gemini sebagai default.`);
        DungeonMaster = geminiProvider;
        break;
}

export default DungeonMaster;