import { SavedGame } from '../types';

const STORAGE_KEY = 'gemini-rpg-saved-games';

// Memuat semua game yang tersimpan dari localStorage.
export const loadGames = (): SavedGame[] => {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            return JSON.parse(savedData);
        }
    } catch (error) {
        console.error("Gagal memuat game:", error);
        // Jika terjadi kesalahan parsing, hapus data yang rusak
        localStorage.removeItem(STORAGE_KEY);
    }
    return [];
};

// Menyimpan satu sesi permainan. Jika sudah ada, akan diperbarui.
export const saveGame = (gameToSave: SavedGame): void => {
    const games = loadGames();
    const gameIndex = games.findIndex(g => g.id === gameToSave.id);

    if (gameIndex > -1) {
        // Perbarui game yang sudah ada
        games[gameIndex] = gameToSave;
    } else {
        // Tambahkan game baru
        games.push(gameToSave);
    }

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
    } catch (error) {
        console.error("Gagal menyimpan game:", error);
    }
};

// Menghapus game berdasarkan ID (nama karakter).
export const deleteGame = (gameId: string): void => {
    let games = loadGames();
    games = games.filter(g => g.id !== gameId);

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
    } catch (error) {
        console.error("Gagal menghapus game:", error);
    }
};
