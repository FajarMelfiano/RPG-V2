import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface WorldCreationScreenProps {
  onCreate: (data: { concept: string; factions: string; conflict: string }) => void;
  onBack: () => void;
  isLoading: boolean;
  error: string | null;
}

const WorldCreationScreen: React.FC<WorldCreationScreenProps> = ({ onCreate, onBack, isLoading, error }) => {
  const [formData, setFormData] = useState({
    concept: '',
    factions: '',
    conflict: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.concept.trim() && formData.factions.trim() && formData.conflict.trim() && !isLoading) {
      onCreate(formData);
    }
  };

  const isFormValid = formData.concept.trim() && formData.factions.trim() && formData.conflict.trim();

  return (
    <div className="p-4 sm:p-8 max-w-3xl w-full mx-auto journal-panel">
      <h1 className="text-3xl md:text-4xl font-bold text-amber-300 mb-4 text-center text-glow">
        Tempa Duniamu
      </h1>
      <p className="text-stone-300 mb-8 text-center text-sm sm:text-base italic">
        Berikan AI tiga pilar untuk membangun fondasi duniamu. Semakin menarik idemu, semakin kaya dunia yang akan tercipta.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
            <label htmlFor="concept" className="block text-amber-300 font-bold mb-2 text-glow">Konsep Inti Dunia</label>
            <input
              id="concept"
              name="concept"
              type="text"
              value={formData.concept}
              onChange={handleInputChange}
              placeholder="Contoh: Dunia fantasi gelap di mana sihir sekarat"
              className="w-full p-3 bg-stone-950/70 border border-stone-600 rounded-lg text-stone-200 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
              disabled={isLoading}
            />
        </div>
        <div>
            <label htmlFor="factions" className="block text-amber-300 font-bold mb-2 text-glow">Faksi & Kekuatan Utama</label>
            <textarea
              id="factions"
              name="factions"
              value={formData.factions}
              onChange={handleInputChange}
              placeholder="Contoh: Kekaisaran Naga yang kejam vs. Aliansi Penyihir pemberontak"
              className="w-full h-24 p-3 bg-stone-950/70 border border-stone-600 rounded-lg text-stone-200 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all resize-none"
              disabled={isLoading}
            />
        </div>
        <div>
            <label htmlFor="conflict" className="block text-amber-300 font-bold mb-2 text-glow">Konflik Saat Ini</label>
            <textarea
              id="conflict"
              name="conflict"
              value={formData.conflict}
              onChange={handleInputChange}
              placeholder="Contoh: Wabah magis menyebar dari utara, mengubah makhluk hidup menjadi monster kristal"
              className="w-full h-24 p-3 bg-stone-950/70 border border-stone-600 rounded-lg text-stone-200 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all resize-none"
              disabled={isLoading}
            />
        </div>
        
        <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center">
            <button type="button" onClick={onBack} disabled={isLoading} className="bg-stone-700 hover:bg-stone-600 text-white font-bold py-3 px-6 rounded-lg transition-colors w-full sm:w-auto">
                Kembali
            </button>
            <button type="submit" disabled={isLoading || !isFormValid} className="thematic-button text-white font-bold py-3 px-8 rounded-lg text-lg sm:text-xl font-cinzel tracking-widest flex items-center justify-center w-full sm:flex-grow">
                {isLoading ? <LoadingSpinner /> : 'Tempa Dunia'}
            </button>
        </div>
      </form>

      {error && <p className="text-red-400 mt-6 text-center bg-red-900/50 p-3 rounded-lg">{error}</p>}
    </div>
  );
};

export default WorldCreationScreen;