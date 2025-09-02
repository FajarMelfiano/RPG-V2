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
    <div className="w-full h-full flex flex-col items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-5xl mx-auto flex flex-col h-full md:h-auto md:max-h-[90vh]">
        <header className="text-center mb-6 flex-shrink-0">
          <button onClick={onBack} className="text-stone-400 hover:text-[var(--color-accent)] transition-colors text-sm mb-4">
            &larr; Kembali ke Daftar Dunia
          </button>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--color-text-header)] mb-3 tracking-wider text-glow font-cinzel">
            Tawarikh {world.name}
          </h1>
          <div className="max-w-3xl mx-auto p-3 bg-black/20 rounded-lg border border-[var(--border-color-strong)]/50 max-h-24 overflow-y-auto">
            <p className="text-stone-300 italic text-sm">{world.description}</p>
          </div>
        </header>
        
        <div className="flex-grow flex flex-col md:flex-row gap-8 md:gap-12 min-h-0">
          {/* Create Character Panel */}
          <div className="md:w-1/3 flex flex-col items-center text-center p-6 world-panel hover:border-[var(--color-primary)] transition-all duration-300">
            <h3 className="font-cinzel text-2xl text-[var(--color-text-header)] mb-4 text-glow">Panggil Pahlawan</h3>
            <p className="text-stone-400 text-sm mb-6 flex-grow">
              Sebuah dunia membutuhkan pahlawan. Ciptakan seorang petualang yang akan mengukir nama mereka dalam sejarah tawarikh ini.
            </p>
            <button
              onClick={onNewCharacter}
              className="thematic-button text-white font-bold py-3 px-8 rounded-lg text-lg font-cinzel tracking-widest w-full"
            >
              Ciptakan Petualang
            </button>
          </div>

          {/* Characters List Panel */}
          <div className="md:w-2/3 flex-grow flex flex-col min-h-0">
            <h3 className="font-cinzel text-2xl text-[var(--color-text-header)] mb-4 text-glow text-center md:text-left flex items-center justify-center md:justify-start gap-3">
              <UsersIcon className="w-8 h-8"/>
              <span>Para Petualang</span>
            </h3>
            {world.characters && world.characters.length > 0 ? (
              <div className="space-y-4 overflow-y-auto pr-2 flex-grow journal-panel p-4">
                {world.characters
                  .sort((a, b) => new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime())
                  .map(savedChar => (
                    <div key={savedChar.character.id} className="bg-stone-950/40 p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4 text-left border border-stone-700 hover:border-[var(--color-primary)] transition-all shadow-md hover:shadow-[var(--color-primary)]/10">
                      <div className="flex-grow">
                        <p className="font-bold text-xl text-stone-200 font-cinzel">{savedChar.character.name}</p>
                        <p className="text-sm text-stone-400">
                          Level {savedChar.character.stats.level} {savedChar.character.race} {savedChar.character.characterClass}
                        </p>
                        <p className="text-xs text-stone-500 mt-1">
                          Terakhir dimainkan: {new Date(savedChar.lastPlayed).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto">
                        <button
                          onClick={() => onDeleteCharacter(savedChar.character.id)}
                          className="bg-red-900/70 hover:bg-red-800 text-red-100 font-bold p-3 rounded-md transition-colors border-b-4 border-red-950/80"
                          aria-label={`Hapus karakter ${savedChar.character.name}`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                        <button
                          onClick={() => onContinueCharacter(savedChar.character.id)}
                          className="thematic-button bg-green-800 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors w-full border-b-4 border-green-900"
                        >
                          Lanjutkan
                        </button>
                      </div>
                    </div>
                ))}
              </div>
            ) : (
               <div className="flex-grow flex items-center justify-center text-center journal-panel p-8">
                <p className="text-stone-500 italic">Dunia ini sunyi... belum ada pahlawan yang menjawab panggilannya.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorldLobbyScreen;
