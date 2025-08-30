import React from 'react';

interface GameOverScreenProps {
  onRestart: () => void;
  finalStory: string;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ onRestart, finalStory }) => {
  return (
    <div className="text-center p-8 max-w-2xl mx-auto journal-panel border-red-800">
      <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-red-500 mb-4 tracking-wider font-cinzel" style={{textShadow: '0 0 15px rgba(239, 68, 68, 0.7)'}}>
        ANDA TELAH GUGUR
      </h1>
      <p className="text-stone-300 mb-8 text-base sm:text-lg italic">
        "{finalStory || 'Kisahmu telah berakhir dalam keheningan...'}"
      </p>
      <p className="text-stone-400 mb-10 text-sm sm:text-base">
        Meskipun perjalananmu telah berakhir, legenda tentang keberanian (atau kebodohanmu) akan tetap dikenang. Dunia terus berputar, menunggu pahlawan baru untuk bangkit.
      </p>
      <button
        onClick={onRestart}
        className="thematic-button text-white font-bold py-3 px-8 rounded-lg text-lg sm:text-xl font-cinzel tracking-widest"
      >
        Mulai Petualangan Baru
      </button>
    </div>
  );
};

export default GameOverScreen;