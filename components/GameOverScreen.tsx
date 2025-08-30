import React from 'react';

interface GameOverScreenProps {
  onRestart: () => void;
  finalStory: string;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ onRestart, finalStory }) => {
  return (
    <div className="text-center p-8 max-w-2xl mx-auto bg-black bg-opacity-70 rounded-xl shadow-lg border border-red-700">
      <h1 className="text-6xl md:text-7xl font-bold text-red-500 mb-4 tracking-wider font-cinzel">
        ANDA TELAH GUGUR
      </h1>
      <p className="text-slate-300 mb-8 text-lg italic">
        "{finalStory || 'Kisahmu telah berakhir dalam keheningan...'}"
      </p>
      <p className="text-slate-400 mb-10">
        Meskipun perjalananmu telah berakhir, legenda tentang keberanian (atau kebodohanmu) akan tetap dikenang. Dunia terus berputar, menunggu pahlawan baru untuk bangkit.
      </p>
      <button
        onClick={onRestart}
        className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-8 rounded-lg text-xl transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-amber-400/30 font-cinzel tracking-widest"
      >
        Mulai Petualangan Baru
      </button>
    </div>
  );
};

export default GameOverScreen;
