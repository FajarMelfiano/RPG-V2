import React from 'react';
import { SavedGame } from '../types';

interface CharacterSelectionScreenProps {
  savedGames: SavedGame[];
  onLoad: (game: SavedGame) => void;
  onDelete: (gameId: string) => void;
  onBack: () => void;
}

const CharacterSelectionScreen: React.FC<CharacterSelectionScreenProps> = ({ savedGames, onLoad, onDelete, onBack }) => {
  
  const handleDelete = (gameId: string, characterName: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus petualangan ${characterName}? Tindakan ini tidak dapat diurungkan.`)) {
      onDelete(gameId);
    }
  };

  return (
    <div className="p-8 max-w-4xl w-full mx-auto bg-slate-800/70 rounded-xl shadow-lg border border-slate-700 backdrop-blur-sm">
      <h1 className="text-4xl font-bold text-amber-300 mb-6 text-center">
        Lanjutkan Petualangan
      </h1>
      
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        {savedGames.length > 0 ? (
          savedGames.map(game => (
            <div key={game.id} className="bg-slate-900/50 p-4 rounded-lg border border-slate-600 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-amber-200">{game.character.name}</h2>
                <p className="text-slate-400 text-sm">{`Level ${game.character.stats.level} ${game.character.race} ${game.character.characterClass}`}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => onLoad(game)}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-4 rounded-md transition-colors"
                >
                  Lanjutkan
                </button>
                <button
                  onClick={() => handleDelete(game.id, game.character.name)}
                  className="bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-slate-400 text-center italic py-8">Tidak ada petualangan yang tersimpan.</p>
        )}
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={onBack}
          className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all duration-300"
        >
          Kembali
        </button>
      </div>
    </div>
  );
};

export default CharacterSelectionScreen;
