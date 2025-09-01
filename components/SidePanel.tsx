import React, { useState, useEffect } from 'react';
import { Character, Quest, WorldEvent, Marketplace, Scene, ShopItem, InventoryItem, ItemSlot, World } from '../types';
import CharacterSheet from './CharacterSheet';
import PartySheet from './PartySheet';
import NotesPanel from './NotesPanel';
import InventorySheet from './InventorySheet';
import QuestLog from './QuestLog';
import MarketplaceScreen from './MarketplaceScreen';
import { ShieldIcon, UsersIcon, FileTextIcon, ChestIcon, ScrollIcon, StoreIcon, HelmetIcon, HeartIcon, MapIcon, HomeIcon, BookOpenIcon, GlobeIcon, QuestionMarkCircleIcon } from './icons';
import EquipmentSheet from './EquipmentSheet';
import FamilySheet from './FamilySheet';
import MapView from './MapView';
import ResidenceSheet from './ResidenceSheet';
import { ActiveTab } from './MobileSheet';
import WorldCodex from './WorldCodex';
import GuidebookModal from './GuidebookModal';

interface SidePanelProps {
    character: Character;
    party: Character[];
    notes: string;
    onNotesChange: (notes: string) => void;
    quests: Quest[];
    worldEvents: WorldEvent[];
    marketplace: Marketplace;
    scene: Scene;
    onBuyItem: (item: ShopItem, shopName: string) => void;
    onSellItem: (item: InventoryItem, shopName: string) => void;
    isLoading: boolean;
    onEquipItem: (itemId: string) => void;
    onUnequipItem: (slot: ItemSlot) => void;
    world: World;
    directShopId: string | null;
    setDirectShopId: (id: string | null) => void;
}


const SidePanel: React.FC<SidePanelProps> = (props) => {
    const { 
        character, party, notes, onNotesChange, quests, worldEvents, 
        marketplace, scene, onBuyItem, onSellItem, isLoading, onEquipItem, 
        onUnequipItem, world, directShopId, setDirectShopId
    } = props;

    const [activeTab, setActiveTab] = useState<ActiveTab>('character');

    useEffect(() => {
        if (directShopId) {
            setActiveTab('marketplace');
        }
    }, [directShopId]);

    const getTabClass = (tabName: ActiveTab) => {
        return `flex items-center justify-center w-14 aspect-square flex-shrink-0 rounded-lg transition-all transform ${
            activeTab === tabName 
            ? 'bg-[var(--color-primary-dark)]/50 text-[var(--color-text-header)]' 
            : 'hover:bg-stone-900/70 text-stone-300'
        }`;
    }
    
    const tabs: { id: ActiveTab; label: string; icon: React.ReactNode; count?: number }[] = [
        { id: 'character', label: 'Karakter', icon: <ShieldIcon className="w-6 h-6" /> },
        { id: 'equipment', label: 'Perlengkapan', icon: <HelmetIcon className="w-6 h-6" /> },
        { id: 'inventory', label: 'Inventaris', icon: <ChestIcon className="w-6 h-6" /> },
        { id: 'map', label: 'Peta', icon: <MapIcon className="w-6 h-6" /> },
        { id: 'residence', label: 'Rumah', icon: <HomeIcon className="w-6 h-6" />, count: character.residences.length },
        { id: 'family', label: 'Keluarga', icon: <HeartIcon className="w-6 h-6" /> },
        { id: 'quests', label: 'Misi', icon: <ScrollIcon className="w-6 h-6" /> },
        { id: 'marketplace', label: 'Pasar', icon: <StoreIcon className="w-6 h-6" /> },
        { id: 'party', label: 'Party', icon: <UsersIcon className="w-6 h-6" />, count: party.length },
        { id: 'notes', label: 'Catatan', icon: <FileTextIcon className="w-6 h-6" /> },
        { id: 'codex', label: 'Codex', icon: <GlobeIcon className="w-6 h-6" /> },
        { id: 'guidebook', label: 'Panduan', icon: <QuestionMarkCircleIcon className="w-6 h-6" /> },
    ];


    const renderTabContent = () => {
        switch (activeTab) {
            case 'character': return <CharacterSheet character={character} />;
            case 'equipment': return <EquipmentSheet equipment={character.equipment} onUnequipItem={onUnequipItem} />;
            case 'inventory': return <InventorySheet character={character} onEquipItem={onEquipItem} />;
            case 'map': return <MapView worldMap={world.worldMap} currentLocationName={scene.location} />;
            case 'residence': return <ResidenceSheet residences={character.residences} />;
            case 'family': return <FamilySheet family={character.family} />;
            case 'quests': return <QuestLog quests={quests} worldEvents={worldEvents} />;
            case 'party': return <PartySheet party={party} />;
            case 'notes': return <NotesPanel notes={notes} onNotesChange={onNotesChange} />;
            case 'marketplace': return <MarketplaceScreen marketplace={marketplace} scene={scene} character={character} onBuyItem={onBuyItem} onSellItem={onSellItem} isLoading={isLoading} directShopId={directShopId} setDirectShopId={setDirectShopId} />;
            case 'codex': return <WorldCodex world={world} isSheet={true} />;
            case 'guidebook': return <GuidebookModal onClose={() => {}} isSheet />;
            default: return null;
        }
    }

    return (
        <aside className="hidden md:w-[450px] md:flex flex-shrink-0 journal-panel p-4 gap-4">
            <nav className="flex flex-col gap-2 bg-black/20 rounded-lg p-2 border border-stone-700 overflow-y-auto">
                 {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={getTabClass(tab.id)} title={tab.label}>
                        <div className="relative">
                            {tab.icon}
                            {tab.count !== undefined && tab.count > 0 && (
                                <span className="absolute -top-1 -right-1 text-xs bg-[var(--color-primary)] text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">{tab.count}</span>
                            )}
                        </div>
                    </button>
                 ))}
            </nav>
            <div className="flex-grow min-h-0 overflow-y-auto pr-1">
                {renderTabContent()}
            </div>
        </aside>
    );
};

export default SidePanel;