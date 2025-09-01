
import React from 'react';
import { XIcon, BookOpenIcon } from './icons';

interface GuidebookModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const GuidebookModal: React.FC<GuidebookModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="guidebook-title"
        >
            <div
                className="journal-panel w-full max-w-3xl h-full max-h-[90vh] p-6 relative animate-zoomIn flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-stone-400 hover:text-white transition-colors z-10"
                    aria-label="Tutup Buku Panduan"
                >
                    <XIcon className="w-6 h-6" />
                </button>

                <h2 id="guidebook-title" className="font-cinzel text-3xl text-[var(--color-text-header)] mb-4 text-glow flex items-center gap-3 flex-shrink-0">
                    <BookOpenIcon className="w-8 h-8" />
                    Buku Panduan Petualang
                </h2>
                
                <div className="flex-grow min-h-0 overflow-y-auto pr-3 text-stone-300 space-y-6">
                    <section>
                        <h3 className="font-cinzel text-xl text-[var(--color-primary)] mb-2">Selamat Datang, Petualang!</h3>
                        <p>Dunia ini ditenagai oleh AI Dungeon Master (DM) yang canggih. Ia menciptakan cerita, NPC, dan konsekuensi berdasarkan aksi Anda. Semakin baik Anda berkomunikasi dengannya, semakin kaya dan imersif petualangan Anda. Panduan ini akan mengajarkan Anda caranya.</p>
                    </section>

                    <section>
                        <h3 className="font-cinzel text-xl text-[var(--color-primary)] mb-2">Dasar-Dasar Aksi</h3>
                        <p>Anda bermain dengan mengetikkan apa yang ingin karakter Anda lakukan. Pikirkan seperti Anda sedang menulis sebuah buku. Anda bisa:</p>
                        <ul className="list-disc list-inside mt-2 pl-4 space-y-1 text-stone-400">
                            <li>Berinteraksi dengan objek: <code className="code-snippet">buka peti kayu itu</code></li>
                            <li>Bergerak: <code className="code-snippet">berjalan perlahan menyusuri lorong yang gelap</code></li>
                            <li>Berbicara dengan NPC: <code className="code-snippet">tanya penjaga kedai tentang rumor terbaru</code></li>
                            <li>Melakukan aksi tempur: <code className="code-snippet">serang goblin dengan pedangku</code></li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="font-cinzel text-xl text-[var(--color-primary)] mb-2">Menulis Aksi yang Efektif: Kunci Petualangan Hebat</h3>
                        <p>Untuk mendapatkan hasil terbaik dari AI, berikan detail. Gunakan formula sederhana: <strong className="text-[var(--color-text-header)]">Perintah + Target + Niat</strong>.</p>
                        
                        <div className="mt-4 space-y-4">
                            <div>
                                <p><strong className="text-red-400">Contoh Buruk:</strong> <code className="code-snippet">Aku menyerang goblin.</code></p>
                                <p className="text-xs text-stone-500 italic pl-2">Ini terlalu umum. AI akan membuat banyak asumsi tentang bagaimana Anda menyerang.</p>
                            </div>
                            <div>
                                <p><strong className="text-green-400">Contoh Bagus:</strong> <code className="code-snippet">Aku mengayunkan kapakku dengan sekuat tenaga, mengarah ke kepala goblin terdekat.</code></p>
                                <p className="text-xs text-stone-500 italic pl-2">Ini jauh lebih baik! Ini memberi tahu AI <strong className="text-stone-400">apa</strong> yang Anda lakukan (mengayunkan kapak), <strong className="text-stone-400">targetnya</strong> (kepala goblin), dan <strong className="text-stone-400">niatnya</strong> (dengan sekuat tenaga).</p>
                            </div>
                             <div>
                                <p><strong className="text-red-400">Contoh Buruk:</strong> <code className="code-snippet">Aku bicara dengan raja.</code></p>
                                <p className="text-xs text-stone-500 italic pl-2">Bicara tentang apa? Bagaimana nadamu?</p>
                            </div>
                            <div>
                                <p><strong className="text-green-400">Contoh Bagus:</strong> <code className="code-snippet">Aku membungkuk hormat kepada Raja Theron dan bertanya dengan nada mendesak, "Yang Mulia, apa yang Anda ketahui tentang artefak yang hilang itu?"</code></p>
                                <p className="text-xs text-stone-500 italic pl-2">Ini menetapkan nada, aksi, dan tujuan percakapan, menghasilkan respons yang jauh lebih menarik.</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="font-cinzel text-xl text-[var(--color-primary)] mb-2">Berbicara dengan GM (Out-of-Character)</h3>
                        <p>Terkadang Anda mungkin bingung atau butuh klarifikasi tentang dunia. Anda bisa bertanya langsung kepada AI DM tanpa karakter Anda yang berbicara. Gunakan perintah <code className="code-snippet">/ooc</code>.</p>
                        <ul className="list-disc list-inside mt-2 pl-4 space-y-1 text-stone-400">
                            <li><code className="code-snippet">/ooc apa yang aku tahu tentang kota ini?</code></li>
                            <li><code className="code-snippet">/ooc bisakah kau jelaskan lagi siapa Elara itu?</code></li>
                            <li><code className="code-snippet">/ooc apakah sihir dianggap ilegal di sini?</code></li>
                        </ul>
                        <p className="text-sm mt-2">Gunakan ini untuk memahami dunia dengan lebih baik dan membuat keputusan yang lebih cerdas.</p>
                    </section>
                    
                    <section>
                        <h3 className="font-cinzel text-xl text-[var(--color-primary)] mb-2">Tips Lanjutan</h3>
                         <ul className="list-disc list-inside mt-2 pl-4 space-y-1 text-stone-400">
                            <li><strong className="text-stone-300">Periksa Segalanya:</strong> Coba <code className="code-snippet">periksa meja</code>, <code className="code-snippet">lihat ke bawah tempat tidur</code>, atau <code className="code-snippet">inspeksi simbol aneh di dinding</code>. Detail tersembunyi mungkin terungkap.</li>
                            <li><strong className="text-stone-300">Gunakan Jurnal Anda:</strong> Panel di sisi (atau dapat diakses melalui ikon di seluler) adalah sumber daya terpenting Anda. Periksa status karakter, inventaris, misi, dan peta secara teratur.</li>
                            <li><strong className="text-stone-300">Jadilah Kreatif:</strong> Jangan hanya bertarung. Coba untuk <code className="code-snippet">mengalihkan perhatian penjaga</code>, <code className="code-snippet">bernegosiasi dengan bandit</code>, atau <code className="code-snippet">menggunakan mantra untuk membuat jembatan es</code>. AI akan merespons kreativitas Anda.</li>
                        </ul>
                    </section>
                    
                    <div className="text-center pt-4 border-t border-[var(--border-color-soft)]">
                        <p className="font-bold text-[var(--color-text-header)]">Sekarang pergilah, petualang. Sebuah kisah menanti untuk ditulis!</p>
                        <button onClick={onClose} className="thematic-button text-white font-bold py-2 px-8 rounded-lg mt-4">
                           Mulai Petualangan
                        </button>
                    </div>
                </div>
            </div>
            {/* FIX: Removed the 'jsx' prop from the <style> tag. This prop is part of styled-jsx (used in frameworks like Next.js) and is not standard in this React project, causing a type error. */}
            <style>{`
                .code-snippet {
                    background-color: var(--color-bg-primary);
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-family: monospace;
                    color: var(--color-accent);
                    border: 1px solid var(--border-color-soft);
                }
            `}</style>
        </div>
    );
};

export default GuidebookModal;
