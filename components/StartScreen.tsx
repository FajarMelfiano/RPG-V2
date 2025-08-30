import React from 'react';

interface StartScreenProps {
  onStartNew: () => void;
  onContinue: () => void;
  hasSavedGames: boolean;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStartNew, onContinue, hasSavedGames }) => {
  return (
    <div className="text-center p-8 max-w-2xl mx-auto bg-black bg-opacity-50 rounded-xl shadow-lg border border-slate-700">
      <h1 className="text-5xl md:text-6xl font-bold text-amber-300 mb-4 tracking-wider">
        Gemini RPG
      </h1>
      <h2 className="text-xl md:text-2xl text-slate-300 mb-8 font-cinzel">
        Tawarikh Sang AI Dungeon Master
      </h2>
      <p className="text-slate-400 mb-10 text-lg">
        Selamat datang, petualang. Dunia penuh sihir, monster, dan misteri menanti. Setiap pilihan ada di tanganmu, dan setiap kisah bersifat unik, diciptakan oleh AI Dungeon Master yang tak pernah tidur. Siapkah Anda menorehkan legenda?
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button
            onClick={onStartNew}
            className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-8 rounded-lg text-xl transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-amber-400/30 font-cinzel tracking-widest"
        >
            Petualangan Baru
        </button>
        <button
            onClick={onContinue}
            disabled={!hasSavedGames}
            className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 px-8 rounded-lg text-xl transition-all duration-300 transform hover:scale-105 shadow-md disabled:bg-slate-700 disabled:cursor-not-allowed disabled:scale-100 disabled:opacity-50 font-cinzel tracking-widest"
        >
            Lanjutkan Petualangan
        </button>
      </div>
    </div>
  );
};

export default StartScreen;
