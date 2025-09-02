import React from 'react';
import { World } from '../types';

interface StartScreenProps {
  worlds: World[];
  onNewWorld: () => void;
  onSelectWorld: (worldId: string) => void;
  onDeleteWorld: (worldId: string) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ worlds, onNewWorld, onSelectWorld, onDeleteWorld }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-5xl mx-auto">
        <header className="text-center mb-8 md:mb-12">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-[var(--color-text-header)] mb-3 tracking-wider text-glow font-cinzel">
            Gemini RPG
          </h1>
          <h2 className="text-lg sm:text-xl text-stone-300 font-cinzel">
            Tawarikh Sang AI Dungeon Master
          </h2>
        </header>

        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          {/* Create World Panel */}
          <div className="md:w-1/3 flex flex-col items-center text-center p-6 world-panel hover:border-[var(--color-primary)] transition-all duration-300">
            <h3 className="font-cinzel text-2xl text-[var(--color-text-header)] mb-4 text-glow">Mulai Bab Baru</h3>
            <p className="text-stone-400 text-sm mb-6 flex-grow">
              Tempa sebuah realitas dari imajinasimu. Ciptakan daratan, faksi, dan konflik yang akan menjadi panggung bagi para pahlawan.
            </p>
            <button
              onClick={onNewWorld}
              className="thematic-button text-white font-bold py-3 px-8 rounded-lg text-lg font-cinzel tracking-widest w-full"
            >
              Tempa Dunia Baru
            </button>
          </div>

          {/* Worlds List Panel */}
          <div className="md:w-2/3 flex-grow flex flex-col">
            <h3 className="font-cinzel text-2xl text-[var(--color-text-header)] mb-4 text-glow text-center md:text-left">Tawarikh yang Ada</h3>
            {worlds && worlds.length > 0 ? (
              <div className="space-y-4 overflow-y-auto pr-2 flex-grow max-h-[50vh] md:max-h-full journal-panel p-4">
                {worlds.map(world => (
                  <div key={world.id} className="bg-stone-950/40 p-4 rounded-lg text-left border border-stone-700 hover:border-[var(--color-primary)] transition-all shadow-md hover:shadow-[var(--color-primary)]/10 flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex-grow">
                      <h4 className="font-bold text-xl text-stone-200 font-cinzel">{world.name}</h4>
                      <p className="text-sm text-stone-400 italic clamp-2 mt-1" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{world.description}</p>
                      <p className="text-xs text-stone-500 mt-2">
                        {world.characters.length} petualang | {world.worldEvents.length} peristiwa dunia
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto">
                      <button
                        onClick={(e) => { e.stopPropagation(); onDeleteWorld(world.id); }}
                        className="bg-red-900/70 hover:bg-red-800 text-red-100 font-bold p-3 rounded-md transition-colors border-b-4 border-red-950/80 flex-shrink-0"
                        aria-label={`Hapus dunia ${world.name}`}
                      >
                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                      </button>
                      <button
                        onClick={() => onSelectWorld(world.id)}
                        className="thematic-button bg-green-800 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors w-full border-b-4 border-green-900"
                      >
                        Masuk
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-grow flex items-center justify-center text-center journal-panel p-8">
                <p className="text-stone-500 italic">Belum ada dunia yang tercipta.<br/>Kisah pertama menanti untuk ditulis.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartScreen;
