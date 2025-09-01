import React from 'react';
import { ActiveTab } from './MobileSheet';
import { ShieldIcon, ChestIcon, MapIcon, ScrollIcon, BookOpenIcon } from './icons';

interface BottomNavBarProps {
    onTabSelect: (tab: ActiveTab) => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ onTabSelect }) => {
    
    const navItems: { tab: ActiveTab; label: string; icon: React.ReactNode }[] = [
        { tab: 'character', label: 'Karakter', icon: <ShieldIcon className="w-6 h-6" /> },
        { tab: 'inventory', label: 'Inventaris', icon: <ChestIcon className="w-6 h-6" /> },
        { tab: 'map', label: 'Peta', icon: <MapIcon className="w-6 h-6" /> },
        { tab: 'quests', label: 'Misi', icon: <ScrollIcon className="w-6 h-6" /> },
        { tab: 'codex', label: 'Codex', icon: <BookOpenIcon className="w-6 h-6" /> },
    ];
    
    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black/50 backdrop-blur-lg border-t border-[var(--border-color-strong)]/50 z-20 flex justify-around">
            {navItems.map(item => (
                 <button 
                    key={item.tab} 
                    onClick={() => onTabSelect(item.tab)}
                    className="flex flex-col items-center justify-center text-stone-400 hover:text-[var(--color-accent)] transition-colors py-2 px-1 w-full"
                    aria-label={item.label}
                 >
                    {item.icon}
                    <span className="text-xs mt-1">{item.label}</span>
                 </button>
            ))}
        </nav>
    );
};

export default BottomNavBar;
