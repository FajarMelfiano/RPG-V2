
import React, { useState } from 'react';
import { World } from '../types';
import { BookIcon, GlobeIcon, UsersIcon, XIcon } from './icons';

interface WorldCodexProps {
    world: World;
    isOpen: boolean;
    onClose: () => void;
}

type CodexTab = 'summary' | 'events' | 'characters' | 'rules';

const WorldCodex: React.FC<WorldCodexProps> = ({ world, isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<CodexTab>('summary');

    const renderTabContent = () => {
        const { longTermMemory, description } = world;
        switch (activeTab) {
            case 'summary':
                return (
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-cinzel text-lg text-[var(--color-text-header)] mb-2">Konsep Dunia</h4>
                            <p className="text-sm text-stone-300 italic bg-black/20 p-2 rounded-md">{description}</p>
                        </div>
                        <div>
                            <h4 className="font-cinzel text-lg text-[var(--color-text-header)] mb-2">Status Dunia Saat Ini</h4>
                            <p className="text-sm text-stone-300 italic bg-black/20 p-2 rounded-md">{longTermMemory.worldStateSummary}</p>
                        </div>
                    </div>
                );
            case 'events':
                return (
                    <ul className="space-y-2">
                        {longTermMemory.keyEvents.map((event, index) => (
                            <li key={index} className="text-sm text-stone-300 italic bg-black/20 p-2 rounded-md border-l-2 border-[var(--color-primary-dark)]">
                                {event}
                            </li>
                        ))}
                        {longTermMemory.keyEvents.length === 0 && <li className="text-stone-500 italic">Belum ada peristiwa penting yang tercatat.</li>}
                    </ul>
                );
            case 'characters':
                return (
                    <ul className="space-y-2">
                        {longTermMemory.keyCharacters.map((character, index) => (
                            <li key={index} className="text-sm text-stone-300 italic bg-black/20 p-2 rounded-md border-l-2 border-[var(--color-primary-dark)]">
                                {character}
                            </li>
                        ))}
                        {longTermMemory.keyCharacters.length === 0 && <li className="text-stone-500 italic">Belum ada tokoh kunci yang tercatat.</li>}
                    </ul>
                );
            case 'rules':
                return (
                    <div className="text-sm text-stone-300 space-y-3">
                        <p>Dunia ini hidup dan bereaksi terhadap Anda, tetapi aturannya mungkin tidak selalu jelas.</p>
                        <p>Sebagai pemain, Anda memiliki kemampuan untuk bertanya kepada AI Dungeon Master tentang dunia di luar karakter Anda.</p>
                        <div className="bg-black/30 p-3 rounded-lg border border-[var(--border-color-soft)]">
                            <p>Gunakan perintah <code className="font-mono bg-[var(--color-bg-primary)] px-1 py-0.5 rounded text-[var(--color-accent)]">/ooc [pertanyaanmu]</code> di kotak input aksi.</p>
                        </div>
                        <p className="font-bold text-[var(--color-text-header)]">Contoh pertanyaan yang bisa Anda ajukan:</p>
                        <ul className="list-disc list-inside space-y-1 pl-2 text-stone-400">
                            <li>/ooc apa mata uang yang berlaku di sini?</li>
                            <li>/ooc ceritakan lebih banyak tentang Kekaisaran Naga.</li>
                            <li>/ooc apakah ada hukum tentang penggunaan sihir di kota ini?</li>
                            <li>/ooc siapa pemimpin faksi pemberontak?</li>
                        </ul>
                    </div>
                );
        }
    };
    
    const getTabClass = (tabName: CodexTab) => {
        return `flex-shrink-0 py-2 px-3 text-xs font-bold rounded-md flex items-center justify-center gap-1.5 transition-all duration-300 transform border-2 min-w-[100px] ${
            activeTab === tabName 
            ? 'bg-[var(--color-primary-dark)]/50 text-[var(--color-text-header)] border-[var(--color-primary-hover)] shadow-lg scale-105' 
            : 'bg-stone-950/50 hover:bg-stone-900/70 text-stone-300 border-transparent hover:border-[var(--color-primary-dark)]'
        }`;
    }

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="journal-panel w-full max-w-2xl h-full max-h-[90vh] p-6 relative animate-zoomIn flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-stone-400 hover:text-white transition-colors z-10"
                    aria-label="Tutup Codex"
                >
                    <XIcon className="w-6 h-6" />
                </button>

                <h2 className="font-cinzel text-2xl text-[var(--color-text-header)] mb-4 text-glow flex items-center gap-3 flex-shrink-0">
                    <GlobeIcon className="w-6 h-6" />
                    Codex: {world.name}
                </h2>
                <div className="flex-shrink-0 bg-black/20 rounded-lg p-1 border border-stone-700 overflow-hidden mb-4">
                    <div className="flex gap-1 overflow-x-auto pb-1 -mb-1">
                        <button onClick={() => setActiveTab('summary')} className={getTabClass('summary')}>Ringkasan</button>
                        <button onClick={() => setActiveTab('events')} className={getTabClass('events')}>Peristiwa</button>
                        <button onClick={() => setActiveTab('characters')} className={getTabClass('characters')}>Tokoh</button>
                        <button onClick={() => setActiveTab('rules')} className={getTabClass('rules')}>Aturan Dunia</button>
                    </div>
                </div>
                <div className="flex-grow min-h-0 overflow-y-auto pr-2">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};

export default WorldCodex;