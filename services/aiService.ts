import { Character, GameTurnResponse, Scene, StoryEntry } from '../types';
import { geminiProvider } from './providers/geminiProvider';
import { openAiProvider } from './providers/openAIProvider';
import { mainDocsProvider } from './providers/mainDocsProvider';

// "Kontrak" yang harus dipatuhi oleh setiap penyedia AI.
// Ini memastikan bahwa aplikasi dapat berinteraksi dengan AI apa pun
// dengan cara yang konsisten.
export interface IAiDungeonMasterService {
  generateCharacter(characterData: { concept: string; background: string }): Promise<{
    character: Character;
    initialScene: Scene;
    introStory: string;
  }>;

  generateNextScene(
    character: Character,
    scene: Scene,
    history: StoryEntry[],
    playerAction: string
  ): Promise<GameTurnResponse>;
}

// Enum untuk mendefinisikan penyedia AI yang tersedia.
// Untuk menambahkan AI baru, tambahkan nilainya di sini.
enum AiProvider {
    GEMINI = 'GEMINI',
    OPENAI = 'OPENAI',
    MAIN_DOCS = 'MAIN_DOCS',
}

// Konfigurasi pusat. Developer hanya perlu mengubah string di sini
// untuk mengganti model AI yang digunakan di seluruh aplikasi.
const aiConfig = {
    provider: AiProvider.GEMINI // Ubah ke AiProvider.GEMINI atau AiProvider.OPENAI untuk mengganti
};

let DungeonMaster: IAiDungeonMasterService;

// Pabrik (Factory) yang memilih implementasi AI yang benar
// berdasarkan konfigurasi.
switch (aiConfig.provider) {
    case AiProvider.GEMINI:
        DungeonMaster = geminiProvider;
        break;
    case AiProvider.OPENAI:
        DungeonMaster = openAiProvider;
        break;
    case AiProvider.MAIN_DOCS:
        DungeonMaster = mainDocsProvider;
        break;
    default:
        throw new Error(`Penyedia AI tidak dikenal: ${aiConfig.provider}`);
}

export default DungeonMaster;
