import React from 'react';
import { World } from '../types';
import { UsersIcon } from './icons';

interface WorldLobbyScreenProps {
  world: World;
  onNewCharacter: () => void;
  onContinueCharacter: (characterId: string) => void;
  onDeleteCharacter: (characterId: string) => void;
  onBack: () => void;
}

const WorldLobbyScreen: React.FC<WorldLobbyScreenProps> = ({ world, onNewCharacter, onContinueCharacter, onDeleteCharacter, onBack }) => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl w-full mx-auto journal-panel">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--color-text-header)] mb-4 text-center tracking-wider text-glow">
        {world.name}
      </h1>
      <div className="mb-8 p-4 bg-black/20 rounded-lg border border-[var(--border-color-strong)]/50 max-h-40 overflow-y-auto">
        <p className="text-stone-300 italic text-center">{world.description}</p>
      </div>

      <div className="text-center mb-10">
        <button
          onClick={onNewCharacter}
          className="thematic-button text-white font-bold py-3 px-8 rounded-lg text-lg sm:text-xl font-cinzel tracking-widest"
        >
          Ciptakan Petualang Baru
        </button>
      </div>
      
      {world.characters && world.characters.length > 0 && (
        <div className="pt-8 border-t-2 border-[var(--border-color-strong)]/50">
          <h3 className="text-2xl sm:text-3xl font-cinzel text-[var(--color-text-header)] mb-6 text-glow flex items-center justify-center gap-3">
            <UsersIcon className="w-8 h-8"/>
            <span>Para Petualang</span>
          </h3>
          <div className="space-y-4 max-h-[30vh] overflow-y-auto pr-2">
            {world.characters
              .sort((a, b) => new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime())
              .map(savedChar => (
                <div key={savedChar.character.id} className="bg-stone-950/30 p-4 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4 text-left border border-stone-700 hover:border-[var(--color-primary)] transition-all shadow-md hover:shadow-[var(--color-primary)]/10">
                  <div className="flex-grow">
                    <p className="font-bold text-lg sm:text-xl text-stone-200">{savedChar.character.name}</p>
                    <p className="text-sm text-stone-400">
                      Level {savedChar.character.stats.level} {savedChar.character.race} {savedChar.character.characterClass}
                    </p>
                     <p className="text-xs text-stone-500 mt-1">
                      Terakhir dimainkan: {new Date(savedChar.lastPlayed).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0 w-full md:w-auto">
                    <button
                      onClick={() => onContinueCharacter(savedChar.character.id)}
                      className="bg-green-800 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors w-1/2 md:w-auto border-b-4 border-green-900"
                    >
                      Lanjutkan
                    </button>
                    <button
                      onClick={() => onDeleteCharacter(savedChar.character.id)}
                      className="bg-red-900 hover:bg-red-800 text-white font-bold py-2 px-4 rounded-md transition-colors w-1/2 md:w-auto border-b-4 border-red-950"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10 text-center">
         <button onClick={onBack} className="text-stone-400 hover:text-[var(--color-accent)] transition-colors">
            &larr; Kembali ke Daftar Dunia
         </button>
      </div>
    </div>
  );
};

export default WorldLobbyScreen;