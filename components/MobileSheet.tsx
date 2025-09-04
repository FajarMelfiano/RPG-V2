import React, { useState, useRef, useEffect, useCallback } from 'react';
// FIX: Imported ActiveTab from central types file and removed local definition.
import { World, SavedCharacter, ShopItem, InventoryItem, ItemSlot, WorldTheme, NPC, ActiveTab } from '../types';
import { 
    XIcon, ShieldIcon, HelmetIcon, ChestIcon, MapIcon, HomeIcon, 
    HeartIcon, ScrollIcon, StoreIcon, UsersIcon, FileTextIcon, GlobeIcon, 
    QuestionMarkCircleIcon, MoreHorizontalIcon, BookOpenIcon, SettingsIcon,
    CoinIcon, ManaIcon
} from './icons';
import CharacterSheet from './CharacterSheet';
import EquipmentSheet from './EquipmentSheet';
import InventorySheet from './InventorySheet';
import MapView from './MapView';
import ResidenceSheet from './ResidenceSheet';
import FamilySheet from './FamilySheet';
import QuestLog from './QuestLog';
import MarketplaceScreen from './MarketplaceScreen';
import PartySheet from './PartySheet';
import NotesPanel from './NotesPanel';
import WorldCodex from './WorldCodex';
import GuidebookModal from './GuidebookModal';
import TransactionLedger from './TransactionLedger';
import SettingsModal from './SettingsModal';

interface MobileSheetProps {
    world: World;
    savedCharacter: SavedCharacter;
    isLoading: boolean;
    onNotesChange: (notes: string) => void;
    onBuyItem: (item: ShopItem, shopId: string) => void;
    onSellItem: (item: InventoryItem, shopId: string) => void;
    onEquipItem: (itemId: string) => void;
    onUnequipItem: (slot: ItemSlot) => void;
    onMarkGuidebookAsRead: () => void;
    onThemeChange: (theme: WorldTheme) => void;
    setActionText: (text: string) => void;
    onTravelClick: (destinationName: string) => void;
    directShopId: string | null;
    setDirectShopId: (id: string | null) => void;
    onShowGuidebookRequest: () => void;
}

const COLLAPSED_HEIGHT = 72;
const HALF_HEIGHT = window.innerHeight * 0.5;
const FULL_HEIGHT = window.innerHeight - 80;


const MobileSheet: React.FC<MobileSheetProps> = (props) => {
    const { savedCharacter, world, directShopId, setDirectShopId, onMarkGuidebookAsRead } = props;
    const { character, party } = savedCharacter;

    const [height, setHeight] = useState(COLLAPSED_HEIGHT);
    const [activeTab, setActiveTab] = useState<ActiveTab>('character');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    
    const dragStartY = useRef(0);
    const initialHeight = useRef(height);

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        dragStartY.current = e.touches[0].clientY;
        initialHeight.current = height;
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        const currentY = e.touches[0].clientY;
        const deltaY = dragStartY.current - currentY;
        let newHeight = initialHeight.current + deltaY;
        newHeight = Math.max(COLLAPSED_HEIGHT, Math.min(FULL_HEIGHT, newHeight));
        setHeight(newHeight);
    };

    const handleTouchEnd = () => {
        if (height > HALF_HEIGHT + 100) {
            setHeight(FULL_HEIGHT);
        } else if (height > COLLAPSED_HEIGHT + 100) {
            setHeight(HALF_HEIGHT);
        } else {
            setHeight(COLLAPSED_HEIGHT);
        }
    };

    useEffect(() => {
        if (directShopId) {
            setActiveTab('marketplace');
            setHeight(FULL_HEIGHT);
        }
    }, [directShopId]);

    useEffect(() => {
        if (!savedCharacter.hasSeenGuidebook) {
            setActiveTab('guidebook');
            setHeight(FULL_HEIGHT);
        }
    }, [savedCharacter.hasSeenGuidebook]);

    const handleTabSelect = (tab: ActiveTab) => {
        if (tab === 'settings') {
            setIsSettingsOpen(true);
            return;
        }
        setActiveTab(tab);
        if (height < HALF_HEIGHT) {
            setHeight(HALF_HEIGHT);
        }
    };

    // FIX: Explicitly type the initial array before filtering to prevent TypeScript from widening the 'id' property to 'string' instead of 'ActiveTab'.
    const allTabs: { id: ActiveTab; title: string; icon: React.FC<any>; count?: number, hasContent?: boolean }[] = [
        { id: 'character', title: 'Karakter', icon: ShieldIcon, hasContent: true },
        { id: 'equipment', title: 'Perlengkapan', icon: HelmetIcon, hasContent: true },
        { id: 'inventory', title: 'Inventaris', icon: ChestIcon, hasContent: true },
        { id: 'map', title: 'Peta', icon: MapIcon, hasContent: true },
        { id: 'quests', title: 'Misi', icon: ScrollIcon, hasContent: true },
        { id: 'party', title: 'Party', icon: UsersIcon, count: party.length, hasContent: true },
        { id: 'family', title: 'Keluarga', icon: HeartIcon, hasContent: true },
        { id: 'residence', title: 'Properti', icon: HomeIcon, count: character.residences.length, hasContent: true },
        { id: 'marketplace', title: 'Pasar', icon: StoreIcon, hasContent: true },
        { id: 'notes', title: 'Catatan', icon: FileTextIcon, hasContent: true },
        { id: 'ledger', title: 'Buku Besar', icon: BookOpenIcon, hasContent: true },
        { id: 'codex', title: 'Codex', icon: GlobeIcon, hasContent: true },
        { id: 'guidebook', title: 'Panduan', icon: QuestionMarkCircleIcon, hasContent: true },
        { id: 'settings', title: 'Pengaturan', icon: SettingsIcon, hasContent: true },
    ];
    
    const TABS = allTabs.filter(tab => tab.hasContent);


    const renderContent = () => {
        switch (activeTab) {
            case 'character': return <CharacterSheet character={character} />;
            case 'equipment': return <EquipmentSheet equipment={character.equipment} onUnequipItem={props.onUnequipItem} />;
            case 'inventory': return <InventorySheet character={character} onEquipItem={props.onEquipItem} />;
            case 'map': return <MapView worldMap={world.worldMap} currentLocationName={savedCharacter.scene.location} onTravelClick={props.onTravelClick} />;
            case 'residence': return <ResidenceSheet residences={character.residences} />;
            case 'family': return <FamilySheet family={character.family} />;
            case 'quests': return <QuestLog quests={world.quests} worldEvents={world.worldEvents} />;
            case 'marketplace': return <MarketplaceScreen marketplace={world.marketplace} scene={savedCharacter.scene} character={character} onBuyItem={props.onBuyItem} onSellItem={props.onSellItem} isLoading={props.isLoading} directShopId={directShopId} setDirectShopId={setDirectShopId} />;
            case 'party': return <PartySheet party={party} />;
            case 'notes': return <NotesPanel notes={savedCharacter.notes} onNotesChange={props.onNotesChange} />;
            case 'codex': return <WorldCodex world={world} isSheet={true}/>;
            case 'guidebook': return <GuidebookModal onClose={() => {
                if (!savedCharacter.hasSeenGuidebook) onMarkGuidebookAsRead();
                setHeight(COLLAPSED_HEIGHT);
            }} isSheet={true}/>;
            case 'ledger': return <TransactionLedger log={savedCharacter.transactionLog} />;
            default: return null;
        }
    };
    
    const { stats, gold } = character;
    const healthPercentage = stats.maxHealth > 0 ? (stats.health / stats.maxHealth) * 100 : 0;
    const manaPercentage = stats.maxMana > 0 ? (stats.mana / stats.maxMana) * 100 : 0;

    return (
        <>
        <div
            style={{ 
                height: `${height}px`,
                transform: `translateY(${height === COLLAPSED_HEIGHT ? 0 : 0})`,
                transition: 'height 0.2s ease-out'
            }}
            className="fixed bottom-0 left-0 right-0 journal-panel z-20 flex flex-col border-t-4 border-[var(--border-color-strong)] shadow-2xl shadow-black"
        >
            <div
                className="w-full flex-shrink-0 cursor-grab"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div className="w-16 h-1.5 bg-stone-500 rounded-full mx-auto my-2"></div>
                {height < HALF_HEIGHT && (
                     <div className="p-2 animate-fadeIn" style={{ animationDuration: '0.5s'}}>
                        <div className="flex justify-between items-center gap-4">
                            <div className="flex-grow">
                                <div className="flex items-center gap-2">
                                    <div className="w-full bg-black/50 rounded-full h-2 shadow-inner border border-stone-900">
                                        <div className="bg-gradient-to-r from-red-800 to-red-500 h-full rounded-full" style={{ width: `${healthPercentage}%` }} title={`HP: ${stats.health}/${stats.maxHealth}`}></div>
                                    </div>
                                    {stats.maxMana > 0 && (
                                    <div className="w-full bg-black/50 rounded-full h-2 shadow-inner border border-stone-900">
                                        <div className="bg-gradient-to-r from-blue-800 to-blue-500 h-full rounded-full" style={{ width: `${manaPercentage}%` }} title={`Mana: ${stats.mana}/${stats.maxMana}`}></div>
                                    </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-stone-950/50 px-2 py-1 rounded-full border border-stone-700 flex-shrink-0">
                                <CoinIcon className="w-4 h-4 text-[var(--color-accent)]" />
                                <span className="font-bold text-sm text-stone-200">{gold}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className={`flex-grow flex flex-col min-h-0 transition-opacity duration-300 ${height < COLLAPSED_HEIGHT + 20 ? 'opacity-0' : 'opacity-100'}`}>
                <div className="flex-shrink-0 border-b-2 border-t-2 border-[var(--border-color-strong)]/50 py-2 px-2">
                     <div className="flex gap-2 overflow-x-auto side-panel-tab-nav">
                        {TABS.map(tab => {
                            const TabIcon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabSelect(tab.id)}
                                    className={`side-panel-tab relative flex-shrink-0 p-2 rounded-lg ${activeTab === tab.id ? 'active' : ''}`}
                                    title={tab.title}
                                >
                                    <TabIcon className="w-6 h-6" />
                                    {tab.count !== undefined && tab.count > 0 && (
                                        <span className="absolute -top-2 -right-2 text-xs bg-[var(--color-primary)] text-white rounded-full w-5 h-5 flex items-center justify-center border-2 border-[var(--color-bg-panel)]">{tab.count}</span>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div className="flex-grow min-h-0 overflow-y-auto px-1">
                    {renderContent()}
                </div>
            </div>
        </div>
        <SettingsModal 
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            currentTheme={world.theme}
            onThemeChange={props.onThemeChange}
        />
        </>
    );
};

export default MobileSheet;