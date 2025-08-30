import React from 'react';
import { SavedGame } from '../types';

interface StartScreenProps {
  onStart: () => void;
  savedGames: SavedGame[];
  onLoadGame: (gameId: string) => void;
  onDeleteGame: (gameId: string) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart, savedGames, onLoadGame, onDeleteGame }) => {
  return (
    <div className="text-center p-4 sm:p-8 max-w-4xl w-full mx-auto bg-black bg-opacity-60 rounded-xl shadow-lg border border-slate-700 backdrop-blur-sm">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-amber-300 mb-4 tracking-wider">
        Gemini RPG
      </h1>
      <h2 className="text-lg sm:text-xl md:text-2xl text-slate-300 mb-8 font-cinzel">
        Tawarikh Sang AI Dungeon Master
      </h2>
      <p className="text-slate-400 mb-10 text-base sm:text-lg max-w-2xl mx-auto">
        Selamat datang, petualang. Dunia penuh sihir, monster, dan misteri menanti. Setiap pilihan ada di tanganmu, dan setiap kisah bersifat unik, diciptakan oleh AI Dungeon Master yang tak pernah tidur. Siapkah Anda menorehkan legenda?
      </p>
      <button
        onClick={onStart}
        className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-8 rounded-lg text-lg sm:text-xl transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-amber-400/30 font-cinzel tracking-widest"
      >
        Mulai Petualangan Baru
      </button>

      {savedGames && savedGames.length > 0 && (
        <div className="mt-12 pt-8 border-t border-slate-600">
          <h3 className="text-2xl sm:text-3xl font-cinzel text-amber-300 mb-6">Muat Petualangan</h3>
          <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
            {savedGames
              .sort((a, b) => new Date(b.lastSaved).getTime() - new Date(a.lastSaved).getTime())
              .map(game => (
                <div key={game.id} className="bg-slate-800/60 p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4 text-left border border-slate-700 hover:border-amber-500 transition-colors">
                  <div className="flex-grow">
                    <p className="font-bold text-lg sm:text-xl text-slate-200">{game.character.name}</p>
                    <p className="text-sm text-slate-400">
                      Level {game.character.stats.level} {game.character.race} {game.character.characterClass}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Terakhir disimpan: {new Date(game.lastSaved).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto">
                    <button
                      onClick={() => onLoadGame(game.id)}
                      className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-md transition-colors w-1/2 sm:w-auto"
                    >
                      Lanjutkan
                    </button>
                    <button
                      onClick={() => onDeleteGame(game.id)}
                      className="bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition-colors w-1/2 sm:w-auto"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StartScreen;