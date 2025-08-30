import { Character, GameTurnResponse, Scene, StoryEntry } from '../types';
import { geminiProvider } from './providers/geminiProvider';
import { openAiProvider } from './providers/openAIProvider';

// "Kontrak" yang harus dipatuhi oleh setiap penyedia AI.
// Ini memastikan bahwa aplikasi dapat berinteraksi dengan AI apa pun
// dengan cara yang konsisten.
export interface IAiDungeonMasterService {
  generateCharacter(characterData: { concept: string; background: string }): Promise<{
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
    playerAction: string
  ): Promise<GameTurnResponse>;

  askOOCQuestion(
    history: StoryEntry[],
    longTermMemory: string[],
    question: string
  ): Promise<string>;
}

// Enum untuk mendefinisikan penyedia AI yang tersedia.
// Untuk menambahkan AI baru, tambahkan nilainya di sini.
enum AiProvider {
    GEMINI = 'GEMINI',
    OPENAI = 'OPENAI',
}

// Konfigurasi pusat. Developer hanya perlu mengubah string di sini
// untuk mengganti model AI yang digunakan di seluruh aplikasi.
const aiConfig = {
    provider: AiProvider.GEMINI // Ubah ke AiProvider.OPENAI untuk menggunakan OpenAI
};

let DungeonMaster: IAiDungeonMasterService;

// Berdasarkan konfigurasi, pilih penyedia AI yang sesuai.
// Pola ini memungkinkan untuk menukar "otak" AI dengan mudah
// tanpa mengubah kode aplikasi lainnya.
switch (aiConfig.provider) {
    case AiProvider.GEMINI:
        DungeonMaster = geminiProvider;
        break;
    case AiProvider.OPENAI:
        DungeonMaster = openAiProvider;
        break;
    default:
        // Jika penyedia tidak dikonfigurasi dengan benar, gunakan Gemini sebagai default
        // dan berikan peringatan di konsol.
        console.warn(`Penyedia AI tidak dikenal: ${aiConfig.provider}. Menggunakan Gemini sebagai default.`);
        DungeonMaster = geminiProvider;
        break;
}

export default DungeonMaster;