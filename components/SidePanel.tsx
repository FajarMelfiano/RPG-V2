

import React, { useState, useRef } from 'react';
import { Character, Quest, WorldEvent, Marketplace, Scene, ShopItem, InventoryItem, ItemSlot } from '../types';
import CharacterSheet from './CharacterSheet';
import PartySheet from './PartySheet';
import NotesPanel from './NotesPanel';
import InventorySheet from './InventorySheet';
import QuestLog from './QuestLog';
import MarketplaceScreen from './MarketplaceScreen';
import { ShieldIcon, UsersIcon, FileTextIcon, XIcon, ChestIcon, ScrollIcon, StoreIcon, HelmetIcon } from './icons';
import EquipmentSheet from './EquipmentSheet';

interface SidePanelProps {
    character: Character;
    party: Character[];
    notes: string;
    onNotesChange: (notes: string) => void;
    quests: Quest[];
    worldEvents: WorldEvent[];
    isOpen: boolean;
    onClose: () => void;
    marketplace: Marketplace;
    scene: Scene;
    onBuyItem: (item: ShopItem, shopName: string) => void;
    onSellItem: (item: InventoryItem, shopName: string) => void;
    isLoading: boolean;
    onEquipItem: (itemId: string) => void;
    onUnequipItem: (slot: ItemSlot) => void;
}

type ActiveTab = 'character' | 'equipment' | 'inventory' | 'quests' | 'marketplace' | 'party' | 'notes';

const PanelContent: React.FC<Omit<SidePanelProps, 'isOpen' | 'onClose'>> = (props) => {
    const { character, party, notes, onNotesChange, quests, worldEvents, marketplace, scene, onBuyItem, onSellItem, isLoading, onEquipItem, onUnequipItem } = props;
    const [activeTab, setActiveTab] = useState<ActiveTab>('character');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'character':
                return <CharacterSheet character={character} />;
            case 'equipment':
                return <EquipmentSheet equipment={character.equipment} onUnequipItem={onUnequipItem} />;
            case 'party':
                return party.length > 0 ? <PartySheet party={party} /> : (
                    <div className="p-4 text-center text-stone-400 mt-4 h-full flex items-center justify-center">
                        <p>Anda sedang bertualang sendirian.</p>
                    </div>
                );
            case 'inventory':
                return <InventorySheet character={character} onEquipItem={onEquipItem} />;
            case 'quests':
                return <QuestLog quests={quests} worldEvents={worldEvents} />;
            case 'notes':
                return <NotesPanel notes={notes} onNotesChange={onNotesChange} />;
            case 'marketplace':
                return <MarketplaceScreen marketplace={marketplace} scene={scene} character={character} onBuyItem={onBuyItem} onSellItem={onSellItem} isLoading={isLoading} />;
            default:
                return null;
        }
    }

    const getTabClass = (tabName: ActiveTab) => {
        return `flex-shrink-0 py-2 px-3 text-xs font-bold rounded-md flex items-center justify-center gap-1.5 transition-all duration-300 transform border-2 min-w-[100px] ${
            activeTab === tabName 
            ? 'bg-amber-800/50 text-amber-200 border-amber-600 shadow-lg scale-105' 
            : 'bg-stone-950/50 hover:bg-stone-900/70 text-stone-300 border-transparent hover:border-amber-800'
        }`;
    }
    
    const tabsRef = useRef<HTMLDivElement>(null);
    const handleWheel = (e: React.WheelEvent) => {
        if (tabsRef.current) {
            tabsRef.current.scrollLeft += e.deltaY;
        }
    };

    return (
        <div className="flex flex-col gap-4 h-full">
            <div className="flex-shrink-0 bg-black/20 rounded-lg p-1 border border-stone-700 overflow-hidden">
                <div ref={tabsRef} onWheel={handleWheel} className="flex gap-1 overflow-x-auto pb-1 -mb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}>
                    <button onClick={() => setActiveTab('character')} className={getTabClass('character')} title="Karakter">
                        <ShieldIcon className="w-5 h-5" /> <span>Karakter</span>
                    </button>
                    <button onClick={() => setActiveTab('equipment')} className={getTabClass('equipment')} title="Perlengkapan">
                        <HelmetIcon className="w-5 h-5" /> <span>Perlengkapan</span>
                    </button>
                    <button onClick={() => setActiveTab('inventory')} className={getTabClass('inventory')} title="Inventaris">
                        <ChestIcon className="w-5 h-5" /> <span>Inventaris</span>
                    </button>
                    <button onClick={() => setActiveTab('quests')} className={getTabClass('quests')} title="Misi">
                        <ScrollIcon className="w-5 h-5" /> <span>Misi</span>
                    </button>
                    <button onClick={() => setActiveTab('marketplace')} className={getTabClass('marketplace')} title="Pasar">
                        <StoreIcon className="w-5 h-5" /> <span>Pasar</span>
                    </button>
                    <button onClick={() => setActiveTab('party')} className={getTabClass('party')} title="Party">
                    <UsersIcon className="w-5 h-5" /> <span>Party ({party.length})</span>
                    </button>
                    <button onClick={() => setActiveTab('notes')} className={getTabClass('notes')} title="Catatan">
                        <FileTextIcon className="w-5 h-5" /> <span>Catatan</span>
                    </button>
                </div>
            </div>
            <div className="flex-grow min-h-0 overflow-y-auto pr-1">
                {renderTabContent()}
            </div>
        </div>
    );
};

const SidePanel: React.FC<SidePanelProps> = (props) => {
    const { isOpen, onClose } = props;

    // Mobile & Tablet: Full-screen overlay
    const MobileJournal = (
        <div
            className={`lg:hidden fixed inset-0 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            aria-hidden={!isOpen}
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={onClose} />
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
                <div className="h-full pt-8">
                    <PanelContent {...props} />
                </div>
            </aside>
        </div>
    );

    // Desktop: Static side panel
    const DesktopJournal = (
        <aside className="hidden lg:block md:w-2/5 lg:w-1/3 xl:w-[450px] flex-shrink-0 h-full journal-panel p-4">
             <div className="h-full">
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