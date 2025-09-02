import React from 'react';
import { XIcon, ShieldIcon, HelmetIcon, ChestIcon, MapIcon, HomeIcon, HeartIcon, ScrollIcon, StoreIcon, UsersIcon, FileTextIcon, GlobeIcon, QuestionMarkCircleIcon, MoreHorizontalIcon, BookOpenIcon, SettingsIcon } from './icons';

export type ActiveTab = 'character' | 'equipment' | 'inventory' | 'quests' | 'marketplace' | 'party' | 'notes' | 'family' | 'map' | 'residence' | 'codex' | 'guidebook' | 'more_menu' | 'ledger' | 'settings';

interface MobileSheetProps {
    activeTab: ActiveTab | null;
    onClose: () => void;
    children: React.ReactNode;
}

const tabsConfig: Record<ActiveTab, { title: string; icon: React.ReactNode }> = {
    character: { title: 'Karakter', icon: <ShieldIcon className="w-6 h-6" /> },
    equipment: { title: 'Perlengkapan', icon: <HelmetIcon className="w-6 h-6" /> },
    inventory: { title: 'Inventaris', icon: <ChestIcon className="w-6 h-6" /> },
    map: { title: 'Peta', icon: <MapIcon className="w-6 h-6" /> },
    residence: { title: 'Properti', icon: <HomeIcon className="w-6 h-6" /> },
    family: { title: 'Keluarga', icon: <HeartIcon className="w-6 h-6" /> },
    quests: { title: 'Misi & Tawarikh', icon: <ScrollIcon className="w-6 h-6" /> },
    marketplace: { title: 'Pasar', icon: <StoreIcon className="w-6 h-6" /> },
    party: { title: 'Party', icon: <UsersIcon className="w-6 h-6" /> },
    notes: { title: 'Catatan', icon: <FileTextIcon className="w-6 h-6" /> },
    codex: { title: 'Codex Dunia', icon: <GlobeIcon className="w-6 h-6" /> },
    guidebook: { title: 'Buku Panduan', icon: <QuestionMarkCircleIcon className="w-6 h-6" /> },
    ledger: { title: 'Buku Besar', icon: <BookOpenIcon className="w-6 h-6" /> },
    settings: { title: 'Pengaturan', icon: <SettingsIcon className="w-6 h-6" /> },
    more_menu: { title: 'Menu Lainnya', icon: <MoreHorizontalIcon className="w-6 h-6" /> },
};


const MobileSheet: React.FC<MobileSheetProps> = ({ activeTab, onClose, children }) => {
    const isOpen = activeTab !== null;
    const config = activeTab ? tabsConfig[activeTab] : null;

    return (
        <div
            className={`md:hidden fixed inset-0 z-40 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
            aria-hidden={!isOpen}
        >
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />
            <div
                className="relative z-10 journal-panel w-full h-full p-4 flex flex-col"
                aria-label="Jurnal"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex-shrink-0 flex items-center justify-between pb-2 border-b-2 border-[var(--border-color-strong)]/50 mb-4">
                     <div className="flex items-center gap-3 text-[var(--color-text-header)] text-glow">
                        {config?.icon}
                        <h2 className="font-cinzel text-xl">{config?.title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-stone-400 hover:text-white"
                        aria-label="Tutup Panel"
                    >
                        <XIcon className="w-6 h-6" />
                    </button>
                </header>
                <div className="flex-grow min-h-0 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default MobileSheet;