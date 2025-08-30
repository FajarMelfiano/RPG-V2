import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface CharacterCreationScreenProps {
  onCreate: (data: { concept: string; background: string }) => void;
  isLoading: boolean;
  error: string | null;
}

const CharacterCreationScreen: React.FC<CharacterCreationScreenProps> = ({ onCreate, isLoading, error }) => {
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
  
  const suggestions = [
      { concept: "Seorang ksatria naga bernama Ignis", background: "Dikenal di seluruh kerajaan karena pernah menunggangi naga perunggu untuk mengalahkan seorang lich. Membawa 'Tombak Naga' warisan keluarganya." },
      { concept: "Pencuri bayangan dari kota pelabuhan", background: "Anak yatim piatu yang dibesarkan oleh serikat pencuri. Tidak ada yang mengenalnya, reputasinya nol, tapi dia memiliki satu set 'Alat Pencuri Ahli'." },
      { concept: "Dukun rawa misterius", background: "Hidup terasing di Rawa Berkabut, penduduk desa sekitar menghormatinya karena pengetahuannya tentang ramuan penyembuh. Reputasinya sedikit positif di kalangan penduduk lokal." },
      { concept: "Gladiator juara, Valerius", background: "Seorang mantan budak yang memenangkan kebebasannya di arena. Namanya dielu-elukan di ibu kota, memberinya reputasi yang signifikan." },
  ];
  
  const templates = [
    {
      archetype: "Ranger Penuh Dendam",
      concept: "Seorang Ranger Elf Kayu yang sendirian",
      background: "Keluargaku dibantai oleh sekelompok orc yang dipimpin oleh seorang kepala suku bermata satu. Aku telah menghabiskan bertahun-tahun melacak mereka di alam liar, menjadi seorang pemburu dan penyintas yang ahli. Aku membawa busur milik ibuku dan dendam yang membara di hatiku."
    },
    {
      archetype: "Pengrajin Rune yang Diasingkan",
      concept: "Seorang Pengrajin Rune Kurcaci yang diasingkan",
      background: "Aku pernah menjadi pengrajin rune yang dihormati di benteng gunungku, sampai sebuah eksperimen yang salah menyebabkan bencana. Dipermalukan, aku diasingkan. Sekarang aku mengembara, mencari pengetahuan yang hilang untuk memulihkan kehormatanku, hanya dengan palu rune dan pengetahuanku."
    },
    {
      archetype: "Penyair Karismatik",
      concept: "Penyair Tiefling dengan masa lalu yang kelam",
      background: "Aku menggunakan kecapi dan kata-kataku yang manis untuk bertahan hidup, tampil di kedai minum dan istana. Tapi di balik senyumanku, aku melarikan diri dari kesepakatan ceroboh yang dibuat dengan iblis. Warisan infernalku memberiku bakat, tetapi juga menarik perhatian yang tidak diinginkan."
    },
    {
      archetype: "Penyihir yang Ingin Tahu",
      concept: "Penyihir Manusia yang dikeluarkan dari akademi",
      background: "Aku dikeluarkan dari Akademi Sihir bergengsi karena mempraktikkan sihir terlarang. Rasa hausku akan pengetahuan tidak mengenal batas. Aku percaya sihir yang hebat membutuhkan pengorbanan, dan aku berkelana mencari artefak kuno untuk membuktikan bahwa para mentorku salah."
    }
  ];

  return (
    <div className="p-4 sm:p-8 max-w-3xl w-full mx-auto bg-slate-800/70 rounded-xl shadow-lg border border-slate-700 backdrop-blur-sm">
      <h1 className="text-3xl md:text-4xl font-bold text-amber-300 mb-4 text-center">
        Ciptakan Pahlawanmu
      </h1>
      <p className="text-slate-400 mb-8 text-center text-sm sm:text-base">
        Berikan AI Dungeon Master fondasi untuk pahlawanmu. Semakin detail, semakin unik karakter yang akan tercipta.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
            <label htmlFor="concept" className="block text-amber-300 font-bold mb-2">Konsep Inti</label>
            <input
              id="concept"
              name="concept"
              type="text"
              value={formData.concept}
              onChange={handleInputChange}
              placeholder="Contoh: Prajurit kurcaci tangguh dengan kapak raksasa"
              className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg text-slate-200 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
              disabled={isLoading}
            />
        </div>
        <div>
            <label htmlFor="background" className="block text-amber-300 font-bold mb-2">Latar Belakang & Pengalaman</label>
            <textarea
              id="background"
              name="background"
              value={formData.background}
              onChange={handleInputChange}
              placeholder="Contoh: Dikenal sebagai 'Pahlawan Grimsbane' setelah mengusir kultus dari desaku. Aku selalu membawa belati perak milik ibuku untuk keberuntungan."
              className="w-full h-32 p-3 bg-slate-900 border border-slate-600 rounded-lg text-slate-200 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
              disabled={isLoading}
            />
        </div>
        
        <div className="pt-6 mt-6 border-t border-slate-700">
            <h3 className="text-amber-300 font-bold mb-4 text-center">Atau, Pilih Arketipe</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template, i) => (
                    <button 
                        key={i} 
                        type="button"
                        onClick={() => setFormData({concept: template.concept, background: template.background})}
                        disabled={isLoading}
                        className="text-left bg-slate-700 hover:bg-slate-600 hover:border-amber-500 border border-slate-600 text-slate-300 p-4 rounded-lg transition-all"
                    >
                        <span className="font-bold font-cinzel text-amber-400">{template.archetype}</span>
                        <p className="text-xs text-slate-400 mt-2 italic">{template.background}</p>
                    </button>
                ))}
            </div>
        </div>

        <div className="mt-6 text-center">
          <button
            type="submit"
            disabled={isLoading || !formData.concept.trim()}
            className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-8 rounded-lg text-lg sm:text-xl transition-all duration-300 transform hover:scale-105 shadow-md disabled:bg-slate-600 disabled:cursor-not-allowed disabled:scale-100 font-cinzel tracking-widest flex items-center justify-center w-full md:w-auto mx-auto"
          >
            {isLoading ? <LoadingSpinner /> : 'Ciptakan Karakter'}
          </button>
        </div>
      </form>

      {error && <p className="text-red-400 mt-6 text-center bg-red-900/50 p-3 rounded-lg">{error}</p>}
    </div>
  );
};

export default CharacterCreationScreen;