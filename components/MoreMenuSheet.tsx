import React from 'react';
import { ActiveTab } from './MobileSheet';
import { Character } from '../types';
import { 
    HelmetIcon, 
    HomeIcon, 
    HeartIcon, 
    StoreIcon, 
    UsersIcon, 
    FileTextIcon, 
    GlobeIcon, 
    QuestionMarkCircleIcon,
    BookOpenIcon,
    SettingsIcon
} from './icons';

interface MoreMenuSheetProps {
    onSelectTab: (tab: ActiveTab) => void;
    character: Character;
    party: Character[];
}

const MoreMenuSheet: React.FC<MoreMenuSheetProps> = ({ onSelectTab, character, party }) => {
    
    const menuItems: { tab: ActiveTab; label: string; icon: React.ReactNode; count?: number }[] = [
        { tab: 'equipment', label: 'Perlengkapan', icon: <HelmetIcon className="w-6 h-6" /> },
        { tab: 'residence', label: 'Properti', icon: <HomeIcon className="w-6 h-6" />, count: character.residences.length },
        { tab: 'family', label: 'Keluarga', icon: <HeartIcon className="w-6 h-6" /> },
        { tab: 'marketplace', label: 'Pasar', icon: <StoreIcon className="w-6 h-6" /> },
        { tab: 'party', label: 'Party', icon: <UsersIcon className="w-6 h-6" />, count: party.length },
        { tab: 'notes', label: 'Catatan', icon: <FileTextIcon className="w-6 h-6" /> },
        { tab: 'codex', label: 'Codex Dunia', icon: <GlobeIcon className="w-6 h-6" /> },
        { tab: 'guidebook', label: 'Buku Panduan', icon: <QuestionMarkCircleIcon className="w-6 h-6" /> },
        { tab: 'ledger', label: 'Buku Besar', icon: <BookOpenIcon className="w-6 h-6" /> },
        { tab: 'settings', label: 'Pengaturan', icon: <SettingsIcon className="w-6 h-6" /> },
    ];

    return (
        <div className="p-1">
            <div className="grid grid-cols-2 gap-4">
                {menuItems.map(item => (
                    <button 
                        key={item.tab}
                        onClick={() => onSelectTab(item.tab)}
                        className="flex flex-col items-center justify-center p-4 bg-stone-950/40 rounded-lg border border-stone-700/50 hover:bg-stone-800/70 hover:border-[var(--color-primary-hover)] transition-all text-stone-300 hover:text-[var(--color-accent)]"
                    >
                        <div className="relative mb-2">
                           {item.icon}
                           {item.count !== undefined && item.count > 0 && (
                                <span className="absolute -top-2 -right-2 text-xs bg-[var(--color-primary)] text-white rounded-full w-5 h-5 flex items-center justify-center">{item.count}</span>
                           )}
                        </div>
                        <span className="text-sm font-semibold">{item.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default MoreMenuSheet;