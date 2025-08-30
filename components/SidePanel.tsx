import React, { useState } from 'react';
import { Character, Quest, WorldEvent } from '../types';
import CharacterSheet from './CharacterSheet';
import PartySheet from './PartySheet';
import NotesPanel from './NotesPanel';
import InventorySheet from './InventorySheet';
import QuestLog from './QuestLog';
import { ShieldIcon, UsersIcon, FileTextIcon, XIcon, ChestIcon, ScrollIcon } from './icons';

interface SidePanelProps {
    character: Character;
    party: Character[];
    notes: string;
    onNotesChange: (notes: string) => void;
    quests: Quest[];
    worldEvents: WorldEvent[];
    isOpen: boolean;
    onClose: () => void;
}

type ActiveTab = 'character' | 'party' | 'inventory' | 'quests' | 'notes';

const PanelContent: React.FC<Omit<SidePanelProps, 'isOpen' | 'onClose'>> = ({ character, party, notes, onNotesChange, quests, worldEvents }) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('character');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'character':
                return <CharacterSheet character={character} />;
            case 'party':
                return party.length > 0 ? <PartySheet party={party} /> : (
                    <div className="p-4 text-center text-stone-400 mt-4 h-full flex items-center justify-center">
                        <p>Anda sedang bertualang sendirian.</p>
                    </div>
                );
            case 'inventory':
                return <InventorySheet character={character} />;
            case 'quests':
                return <QuestLog quests={quests} worldEvents={worldEvents} />;
            case 'notes':
                return <NotesPanel notes={notes} onNotesChange={onNotesChange} />;
            default:
                return null;
        }
    }

    const getTabClass = (tabName: ActiveTab) => {
        return `flex-1 py-2 px-1 text-xs font-bold rounded-md flex flex-col items-center justify-center gap-1 transition-all duration-300 transform border-2 ${
            activeTab === tabName 
            ? 'bg-amber-800/50 text-amber-200 border-amber-600 shadow-lg scale-105' 
            : 'bg-stone-950/50 hover:bg-stone-900/70 text-stone-300 border-transparent hover:border-amber-800'
        }`;
    }

    return (
        <div className="flex flex-col gap-4 h-full">
            <div className="flex-shrink-0 bg-black/20 rounded-lg p-1 flex gap-1 border border-stone-700">
                <button onClick={() => setActiveTab('character')} className={getTabClass('character')} title="Karakter">
                    <ShieldIcon className="w-5 h-5" /> <span className="hidden sm:inline">Karakter</span>
                </button>
                <button onClick={() => setActiveTab('inventory')} className={getTabClass('inventory')} title="Inventaris">
                    <ChestIcon className="w-5 h-5" /> <span className="hidden sm:inline">Inventaris</span>
                </button>
                 <button onClick={() => setActiveTab('quests')} className={getTabClass('quests')} title="Misi">
                    <ScrollIcon className="w-5 h-5" /> <span className="hidden sm:inline">Misi</span>
                </button>
                 <button onClick={() => setActiveTab('party')} className={getTabClass('party')} title="Party">
                   <UsersIcon className="w-5 h-5" /> <span className="hidden sm:inline">Party ({party.length})</span>
                </button>
                <button onClick={() => setActiveTab('notes')} className={getTabClass('notes')} title="Catatan">
                    <FileTextIcon className="w-5 h-5" /> <span className="hidden sm:inline">Catatan</span>
                </button>
            </div>
            <div className="flex-grow min-h-0">
                {renderTabContent()}
            </div>
        </div>
    );
};

const SidePanel: React.FC<SidePanelProps> = (props) => {
    const { isOpen, onClose } = props;

    // Mobile: Full-screen overlay
    const MobileJournal = (
        <div
            className={`md:hidden fixed inset-0 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            aria-hidden={!isOpen}
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <aside
                className={`relative z-10 journal-panel w-full h-full p-4 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
                aria-label="Jurnal"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-stone-400 hover:text-white"
                    aria-label="Tutup Jurnal"
                >
                    <XIcon className="w-6 h-6" />
                </button>
                <div className="h-full overflow-y-auto pt-8">
                    <PanelContent {...props} />
                </div>
            </aside>
        </div>
    );

    // Desktop: Static side panel
    const DesktopJournal = (
        <aside className="hidden md:block md:w-1/3 lg:w-[450px] flex-shrink-0 h-full journal-panel p-4">
             <div className="h-full overflow-y-auto">
                <PanelContent {...props} />
            </div>
        </aside>
    );

    return (
        <>
            {MobileJournal}
            {DesktopJournal}
        </>
    );
};

export default SidePanel;