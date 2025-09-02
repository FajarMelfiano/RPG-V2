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
    <div className="w-full h-full flex flex-col items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-3xl mx-auto world-panel p-6 sm:p-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-text-header)] mb-3 tracking-wider text-glow font-cinzel">
            Meja Sang Arsitek
          </h1>
          <p className="text-stone-300 text-sm sm:text-base italic">
            Berikan AI tiga pilar untuk membangun fondasi duniamu. Semakin menarik idemu, semakin kaya dunia yang akan tercipta.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="concept" className="block text-xl text-[var(--color-text-header)] font-bold mb-2 font-cinzel text-glow">Langkah 1: Konsep Inti</label>
            <p className="text-sm text-stone-400 mb-3 italic">Apa gagasan utama duniamu? Fantasi gelap, cyberpunk, steampunk?</p>
            <input
              id="concept"
              name="concept"
              type="text"
              value={formData.concept}
              onChange={handleInputChange}
              placeholder="Contoh: Dunia fantasi gelap di mana sihir sekarat"
              className="w-full p-3 bg-stone-950/70 border border-stone-600 rounded-lg text-stone-200 focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none transition-all focus:border-[var(--color-primary)] focus:shadow-[0_0_10px_var(--color-accent-glow)]"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="factions" className="block text-xl text-[var(--color-text-header)] font-bold mb-2 font-cinzel text-glow">Langkah 2: Faksi & Kekuatan</label>
            <p className="text-sm text-stone-400 mb-3 italic">Siapa pemain kunci di duniamu? Kerajaan, korporasi, guild?</p>
            <textarea
              id="factions"
              name="factions"
              value={formData.factions}
              onChange={handleInputChange}
              placeholder="Contoh: Kekaisaran Naga yang kejam vs. Aliansi Penyihir pemberontak"
              className="w-full h-24 p-3 bg-stone-950/70 border border-stone-600 rounded-lg text-stone-200 focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none transition-all resize-none focus:border-[var(--color-primary)] focus:shadow-[0_0_10px_var(--color-accent-glow)]"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="conflict" className="block text-xl text-[var(--color-text-header)] font-bold mb-2 font-cinzel text-glow">Langkah 3: Konflik Utama</label>
            <p className="text-sm text-stone-400 mb-3 italic">Apa masalah terbesar yang sedang dihadapi dunia ini?</p>
            <textarea
              id="conflict"
              name="conflict"
              value={formData.conflict}
              onChange={handleInputChange}
              placeholder="Contoh: Wabah magis menyebar dari utara, mengubah makhluk hidup menjadi monster kristal"
              className="w-full h-24 p-3 bg-stone-950/70 border border-stone-600 rounded-lg text-stone-200 focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none transition-all resize-none focus:border-[var(--color-primary)] focus:shadow-[0_0_10px_var(--color-accent-glow)]"
              disabled={isLoading}
            />
          </div>
          
          <div className="pt-6 border-t-2 border-[var(--border-color-strong)]/50 flex flex-col sm:flex-row-reverse gap-4 items-center">
            <button type="submit" disabled={isLoading || !isFormValid} className="thematic-button text-white font-bold py-3 px-8 rounded-lg text-lg sm:text-xl font-cinzel tracking-widest flex items-center justify-center w-full sm:flex-grow">
              {isLoading ? <LoadingSpinner /> : 'Tempa Dunia'}
            </button>
            <button type="button" onClick={onBack} disabled={isLoading} className="bg-stone-700 hover:bg-stone-600 text-white font-bold py-3 px-6 rounded-lg transition-colors w-full sm:w-auto">
              Kembali
            </button>
          </div>
        </form>

        {error && <p className="text-red-400 mt-6 text-center bg-red-900/50 p-3 rounded-lg">{error}</p>}
      </div>
    </div>
  );
};

export default WorldCreationScreen;
