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
    <div className="text-center p-4 sm:p-6 lg:p-8 max-w-4xl w-full mx-auto journal-panel flex flex-col max-h-[95vh]">
      <div className="flex-shrink-0">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[var(--color-text-header)] mb-4 tracking-wider text-glow">
          Gemini RPG
        </h1>
        <h2 className="text-lg sm:text-xl md:text-2xl text-stone-300 mb-8 font-cinzel">
          Tawarikh Sang AI Dungeon Master
        </h2>
        <p className="text-stone-300 mb-10 text-base sm:text-lg max-w-2xl mx-auto italic">
          Sebelum ada pahlawan, harus ada dunia. Tempa sebuah realitas baru dari imajinasimu, lalu masuki dunia itu sebagai seorang petualang yang akan membentuk takdirnya.
        </p>
        <button
          onClick={onNewWorld}
          className="thematic-button text-white font-bold py-3 px-8 rounded-lg text-lg sm:text-xl font-cinzel tracking-widest"
        >
          Ciptakan Dunia Baru
        </button>
      </div>

      {worlds && worlds.length > 0 && (
        <div className="mt-12 pt-8 border-t-2 border-[var(--border-color-strong)]/50 flex-grow min-h-0 flex flex-col">
          <h3 className="flex-shrink-0 text-2xl sm:text-3xl font-cinzel text-[var(--color-text-header)] mb-6 text-glow">Pilih Dunia</h3>
          <div className="space-y-4 overflow-y-auto pr-2">
            {worlds.map(world => (
                <div key={world.id} className="bg-stone-950/30 p-4 rounded-lg text-left border border-stone-700 hover:border-[var(--color-primary)] transition-all shadow-md hover:shadow-[var(--color-primary)]/10 flex flex-col md:flex-row items-center gap-4">
                  <div className="flex-grow">
                    <p className="font-bold text-lg sm:text-xl text-stone-200 font-cinzel">{world.name}</p>
                    <p className="text-sm text-stone-400 italic clamp-2">{world.description}</p>
                     <p className="text-xs text-stone-500 mt-2">
                      {world.characters.length} petualang | {world.worldEvents.length} peristiwa dunia
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0 w-full md:w-auto">
                    <button
                      onClick={() => onSelectWorld(world.id)}
                      className="bg-green-800 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors w-1/2 md:w-auto border-b-4 border-green-900"
                    >
                      Masuk
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteWorld(world.id); }}
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
    </div>
  );
};

export default StartScreen;