import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface CharacterCreationScreenProps {
  worldContext: string;
  onCreate: (data: { concept: string; background: string }) => void;
  isLoading: boolean;
  error: string | null;
  onBack: () => void;
}

const CharacterCreationScreen: React.FC<CharacterCreationScreenProps> = ({ worldContext, onCreate, isLoading, error, onBack }) => {
  const [formData, setFormData] = useState({
    concept: '',
    background: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.concept.trim() && !isLoading) {
      onCreate(formData);
    }
  };
  
  const templates = [
    { archetype: "Ranger Penuh Dendam", concept: "Seorang Ranger Elf Kayu yang sendirian", background: "Keluargaku dibantai oleh sekelompok orc yang dipimpin oleh seorang kepala suku bermata satu. Aku telah menghabiskan bertahun-tahun melacak mereka di alam liar, menjadi seorang pemburu dan penyintas yang ahli. Aku membawa busur milik ibuku dan dendam yang membara di hatiku." },
    { archetype: "Pengrajin Rune yang Diasingkan", concept: "Seorang Pengrajin Rune Kurcaci yang diasingkan", background: "Aku pernah menjadi pengrajin rune yang dihormati di benteng gunungku, sampai sebuah eksperimen yang salah menyebabkan bencana. Dipermalukan, aku diasingkan. Sekarang aku mengembara, mencari pengetahuan yang hilang untuk memulihkan kehormatanku, hanya dengan palu rune dan pengetahuanku." },
    { archetype: "Penyair Karismatik", concept: "Penyair Tiefling dengan masa lalu yang kelam", background: "Aku menggunakan kecapi dan kata-kataku yang manis untuk bertahan hidup, tampil di kedai minum dan istana. Tapi di balik senyumanku, aku melarikan diri dari kesepakatan ceroboh yang dibuat dengan iblis. Warisan infernalku memberiku bakat, tetapi juga menarik perhatian yang tidak diinginkan." },
    { archetype: "Penyihir yang Ingin Tahu", concept: "Penyihir Manusia yang dikeluarkan dari akademi", background: "Aku dikeluarkan dari Akademi Sihir bergengsi karena mempraktikkan sihir terlarang. Rasa hausku akan pengetahuan tidak mengenal batas. Aku percaya sihir yang hebat membutuhkan pengorbanan, dan aku berkelana mencari artefak kuno untuk membuktikan bahwa para mentorku salah." }
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-4xl mx-auto world-panel p-6 sm:p-8 flex flex-col max-h-[95vh]">
        <header className="text-center mb-6 flex-shrink-0">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-text-header)] mb-3 tracking-wider text-glow font-cinzel">Gulungan Sang Pahlawan</h1>
          <p className="text-stone-400 text-xs sm:text-sm italic">Anda sedang menciptakan karakter di dunia ini. Konteks dunia:</p>
          <div className="mt-2 max-w-2xl mx-auto p-2 bg-black/20 rounded-lg border border-[var(--border-color-strong)]/50 max-h-20 overflow-y-auto">
            <p className="text-sm text-stone-300 italic">"{worldContext}"</p>
          </div>
        </header>

        <div className="flex-grow min-h-0 overflow-y-auto pr-2">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Form Section */}
            <div className="lg:w-1/2 flex-shrink-0">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="concept" className="block text-xl text-[var(--color-text-header)] font-bold mb-2 font-cinzel text-glow">Konsep Inti</label>
                    <p className="text-sm text-stone-400 mb-3 italic">Siapakah karaktermu dalam satu kalimat?</p>
                    <input id="concept" name="concept" type="text" value={formData.concept} onChange={handleInputChange} placeholder="Contoh: Prajurit kurcaci tangguh dengan kapak raksasa" className="w-full p-3 bg-stone-950/70 border border-stone-600 rounded-lg text-stone-200 focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none transition-all focus:border-[var(--color-primary)] focus:shadow-[0_0_10px_var(--color-accent-glow)]" disabled={isLoading} />
                </div>
                <div>
                    <label htmlFor="background" className="block text-xl text-[var(--color-text-header)] font-bold mb-2 font-cinzel text-glow">Latar Belakang</label>
                    <p className="text-sm text-stone-400 mb-3 italic">Apa saja pengalaman penting yang membentuk mereka?</p>
                    <textarea id="background" name="background" value={formData.background} onChange={handleInputChange} placeholder="Contoh: Dikenal sebagai 'Pahlawan Grimsbane' setelah mengusir kultus dari desaku. Aku selalu membawa belati perak milik ibuku untuk keberuntungan." className="w-full h-32 p-3 bg-stone-950/70 border border-stone-600 rounded-lg text-stone-200 focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none transition-all resize-none focus:border-[var(--color-primary)] focus:shadow-[0_0_10px_var(--color-accent-glow)]" disabled={isLoading} />
                </div>
              </form>
            </div>
            
            {/* Templates Section */}
            <div className="lg:w-1/2 flex flex-col">
              <div className="text-center lg:text-left">
                <h3 className="text-xl text-[var(--color-text-header)] font-bold mb-2 font-cinzel text-glow">Butuh Inspirasi?</h3>
                <p className="text-sm text-stone-400 mb-3 italic">Pilih salah satu arketipe ini sebagai titik awal.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {templates.map((template, i) => (
                      <button key={i} type="button" onClick={() => setFormData({concept: template.concept, background: template.background})} disabled={isLoading} className="text-left bg-stone-950/40 hover:bg-stone-900/60 h-full hover:border-[var(--color-primary)] border border-stone-700 text-stone-300 p-4 rounded-lg transition-all transform hover:scale-105 shadow-lg flex flex-col">
                          <span className="font-bold font-cinzel text-[var(--color-accent)]">{template.archetype}</span>
                          <p className="text-xs text-stone-400 mt-2 italic flex-grow">{template.background}</p>
                      </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t-2 border-[var(--border-color-strong)]/50 flex flex-col sm:flex-row-reverse gap-4 items-center flex-shrink-0">
            <button type="submit" onClick={handleSubmit} disabled={isLoading || !formData.concept.trim()} className="thematic-button text-white font-bold py-3 px-8 rounded-lg text-lg sm:text-xl font-cinzel tracking-widest flex items-center justify-center w-full sm:flex-grow">
                {isLoading ? <LoadingSpinner /> : 'Ciptakan Karakter'}
            </button>
            <button type="button" onClick={onBack} disabled={isLoading} className="bg-stone-700 hover:bg-stone-600 text-white font-bold py-3 px-6 rounded-lg transition-colors w-full sm:w-auto">
                Kembali
            </button>
        </div>
        {error && <p className="text-red-400 mt-4 text-center bg-red-900/50 p-3 rounded-lg flex-shrink-0">{error}</p>}
      </div>
    </div>
  );
};

export default CharacterCreationScreen;
