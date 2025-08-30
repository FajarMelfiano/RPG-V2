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
    <div className="p-4 sm:p-8 max-w-3xl w-full mx-auto journal-panel">
      <h1 className="text-3xl md:text-4xl font-bold text-amber-300 mb-2 text-center text-glow">Ciptakan Pahlawanmu</h1>
      <p className="text-stone-400 mb-4 text-center text-xs sm:text-sm italic">
        Anda sedang menciptakan karakter di dunia ini.
      </p>
      <div className="mb-6 p-3 bg-black/20 rounded-lg border border-amber-900/50 max-h-24 overflow-y-auto">
        <p className="text-sm text-stone-300 italic">"{worldContext}"</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
            <label htmlFor="concept" className="block text-amber-300 font-bold mb-2 text-glow">Konsep Inti</label>
            <input id="concept" name="concept" type="text" value={formData.concept} onChange={handleInputChange} placeholder="Contoh: Prajurit kurcaci tangguh dengan kapak raksasa" className="w-full p-3 bg-stone-950/70 border border-stone-600 rounded-lg text-stone-200 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all focus:border-amber-500 focus:shadow-[0_0_10px_rgba(253,224,71,0.3)]" disabled={isLoading} />
        </div>
        <div>
            <label htmlFor="background" className="block text-amber-300 font-bold mb-2 text-glow">Latar Belakang & Pengalaman</label>
            <textarea id="background" name="background" value={formData.background} onChange={handleInputChange} placeholder="Contoh: Dikenal sebagai 'Pahlawan Grimsbane' setelah mengusir kultus dari desaku. Aku selalu membawa belati perak milik ibuku untuk keberuntungan." className="w-full h-32 p-3 bg-stone-950/70 border border-stone-600 rounded-lg text-stone-200 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all resize-none focus:border-amber-500 focus:shadow-[0_0_10px_rgba(253,224,71,0.3)]" disabled={isLoading} />
        </div>
        
        <div className="pt-6 mt-6 border-t-2 border-amber-900/50">
            <h3 className="text-amber-300 font-bold mb-4 text-center text-glow">Atau, Pilih Arketipe</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template, i) => (
                    <button key={i} type="button" onClick={() => setFormData({concept: template.concept, background: template.background})} disabled={isLoading} className="text-left bg-stone-800/50 hover:bg-stone-800/90 hover:border-amber-500 border border-stone-700 text-stone-300 p-4 rounded-lg transition-all transform hover:scale-105 shadow-lg">
                        <span className="font-bold font-cinzel text-amber-400">{template.archetype}</span>
                        <p className="text-xs text-stone-400 mt-2 italic">{template.background}</p>
                    </button>
                ))}
            </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center">
            <button type="button" onClick={onBack} disabled={isLoading} className="bg-stone-700 hover:bg-stone-600 text-white font-bold py-3 px-6 rounded-lg transition-colors w-full sm:w-auto">
                Kembali
            </button>
            <button type="submit" disabled={isLoading || !formData.concept.trim()} className="thematic-button text-white font-bold py-3 px-8 rounded-lg text-lg sm:text-xl font-cinzel tracking-widest flex items-center justify-center w-full sm:flex-grow">
                {isLoading ? <LoadingSpinner /> : 'Ciptakan Karakter'}
            </button>
        </div>
      </form>

      {error && <p className="text-red-400 mt-6 text-center bg-red-900/50 p-3 rounded-lg">{error}</p>}
    </div>
  );
};

export default CharacterCreationScreen;