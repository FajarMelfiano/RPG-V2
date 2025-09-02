import React, { useState, useEffect, useRef } from 'react';
import { SavedCharacter, World, ShopItem, InventoryItem, ItemSlot } from '../types';
import CharacterSheet from './CharacterSheet';
import PartySheet from './PartySheet';
import InventorySheet from './InventorySheet';
import QuestLog from './QuestLog';
import MarketplaceScreen from './MarketplaceScreen';
import { ShieldIcon, UsersIcon, ChestIcon, ScrollIcon, StoreIcon, HelmetIcon, HeartIcon, MapIcon, HomeIcon, CoinIcon, ManaIcon, SettingsIcon, BookOpenIcon } from './icons';
import EquipmentSheet from './EquipmentSheet';
import FamilySheet from './FamilySheet';
import MapView from './MapView';
import ResidenceSheet from './ResidenceSheet';
import { ActiveTab } from './MobileSheet';
import TransactionLedger from './TransactionLedger';

interface SidePanelProps {
    savedCharacter: SavedCharacter;
    world: World;
    onBuyItem: (item: ShopItem, shopName: string) => void;
    onSellItem: (item: InventoryItem, shopName: string) => void;
    isLoading: boolean;
    onEquipItem: (itemId: string) => void;
    onUnequipItem: (slot: ItemSlot) => void;
    directShopId: string | null;
    setDirectShopId: (id: string | null) => void;
    onOpenSettings: () => void;
    onTravelClick: (destinationName: string) => void;
}

const SidePanelHeader: React.FC<{ character: SavedCharacter['character'] }> = ({ character }) => {
    const { name, stats, gold, race, characterClass } = character;
    const healthPercentage = stats.maxHealth > 0 ? (stats.health / stats.maxHealth) * 100 : 0;
    const manaPercentage = stats.maxMana > 0 ? (stats.mana / stats.maxMana) * 100 : 0;

    return (
        <div className="flex-shrink-0 p-2 border-b-2 border-[var(--border-color-strong)]/50">
            <h2 className="font-cinzel text-xl text-center text-[var(--color-text-header)] text-glow truncate">{name}</h2>
            <p className="text-center text-sm text-stone-400 mb-3">{`Level ${stats.level} ${race} ${characterClass}`}</p>
            <div className="space-y-2">
                 <div className="flex items-center gap-2">
                    <HeartIcon className="w-4 h-4 text-red-500 flex-shrink-0"/>
                    <div className="w-full bg-black/50 rounded-full h-2 shadow-inner border border-stone-900">
                        <div className="bg-gradient-to-r from-red-800 to-red-500 h-full rounded-full" style={{ width: `${healthPercentage}%` }} title={`${stats.health} / ${stats.maxHealth} HP`}></div>
                    </div>
                </div>
                 {stats.maxMana > 0 && (
                     <div className="flex items-center gap-2">
                        <ManaIcon className="w-4 h-4 text-blue-500 flex-shrink-0"/>
                        <div className="w-full bg-black/50 rounded-full h-2 shadow-inner border border-stone-900">
                            <div className="bg-gradient-to-r from-blue-800 to-blue-500 h-full rounded-full" style={{ width: `${manaPercentage}%` }} title={`${stats.mana} / ${stats.maxMana} MP`}></div>
                        </div>
                    </div>
                )}
                 <div className="flex items-center justify-center gap-2 bg-stone-950/50 px-3 py-1 rounded-full border border-stone-700 w-fit mx-auto">
                    <CoinIcon className="w-5 h-5 text-[var(--color-accent)]" />
                    <span className="font-bold text-lg text-stone-200">{gold}</span>
                </div>
            </div>
        </div>
    );
};


const SidePanel: React.FC<SidePanelProps> = (props) => {
    const { 
        savedCharacter, world, onBuyItem, onSellItem, isLoading, 
        onEquipItem, onUnequipItem, directShopId, setDirectShopId, onOpenSettings,
        onTravelClick
    } = props;
    const { character, party, transactionLog, scene } = savedCharacter;
    const { quests, worldEvents, marketplace } = world;

    const [activeTab, setActiveTab] = useState<ActiveTab>('character');
    
    const navRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);
    const [showScrollIndicator, setShowScrollIndicator] = useState(false);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!navRef.current) return;
        isDragging.current = true;
        document.body.style.cursor = 'grabbing';
        document.body.style.userSelect = 'none';
        startX.current = e.pageX - navRef.current.offsetLeft;
        scrollLeft.current = navRef.current.scrollLeft;
    };

    const handleMouseUpAndLeave = () => {
        if (!isDragging.current) return;
        isDragging.current = false;
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current || !navRef.current) return;
        e.preventDefault();
        const x = e.pageX - navRef.current.offsetLeft;
        const walk = (x - startX.current) * 2; // scroll-fast factor
        navRef.current.scrollLeft = scrollLeft.current - walk;
    };

    useEffect(() => {
        const navElement = navRef.current;
        if (!navElement) return;

        const checkForOverflow = () => {
            const isOverflowing = navElement.scrollWidth > navElement.clientWidth;
            const isAtEnd = Math.ceil(navElement.scrollLeft + navElement.clientWidth) >= navElement.scrollWidth;
            setShowScrollIndicator(isOverflowing && !isAtEnd);
        };
        
        checkForOverflow();
        
        navElement.addEventListener('scroll', checkForOverflow, { passive: true });
        const resizeObserver = new ResizeObserver(checkForOverflow);
        resizeObserver.observe(navElement);
        const mutationObserver = new MutationObserver(checkForOverflow);
        mutationObserver.observe(navElement, { childList: true, subtree: true });

        document.addEventListener('mouseup', handleMouseUpAndLeave);

        return () => {
            navElement.removeEventListener('scroll', checkForOverflow);
            resizeObserver.disconnect();
            mutationObserver.disconnect();
            document.removeEventListener('mouseup', handleMouseUpAndLeave);
        };
    }, []);
    
    useEffect(() => {
        if (directShopId) {
            setActiveTab('marketplace');
        }
    }, [directShopId]);
    
    const tabsConfig: { id: ActiveTab; title: string; icon: React.FC<any>; count?: number; hasContent: boolean }[] = [
        { id: 'character', title: 'Karakter', icon: ShieldIcon, hasContent: true },
        { id: 'equipment', title: 'Perlengkapan', icon: HelmetIcon, hasContent: true },
        { id: 'inventory', title: 'Inventaris', icon: ChestIcon, hasContent: true },
        { id: 'map', title: 'Peta', icon: MapIcon, hasContent: true },
        { id: 'residence', title: 'Properti', icon: HomeIcon, count: character.residences.length, hasContent: character.residences.length > 0 },
        { id: 'family', title: 'Keluarga', icon: HeartIcon, hasContent: true },
        { id: 'quests', title: 'Misi & Tawarikh', icon: ScrollIcon, hasContent: true },
        { id: 'marketplace', title: 'Pasar', icon: StoreIcon, hasContent: scene.availableShopIds && scene.availableShopIds.length > 0 },
        { id: 'ledger', title: 'Buku Besar', icon: BookOpenIcon, hasContent: transactionLog.length > 0 },
        { id: 'party', title: 'Party', icon: UsersIcon, count: party.length, hasContent: party.length > 0 },
    ];

    const tabs = tabsConfig.filter(tab => tab.hasContent);

     const renderContent = () => {
        switch (activeTab) {
            case 'character': return <CharacterSheet character={character} />;
            case 'equipment': return <EquipmentSheet equipment={character.equipment} onUnequipItem={onUnequipItem} />;
            case 'inventory': return <InventorySheet character={character} onEquipItem={onEquipItem} />;
            case 'map': return <MapView worldMap={world.worldMap} currentLocationName={scene.location} onTravelClick={onTravelClick} />;
            case 'residence': return <ResidenceSheet residences={character.residences} />;
            case 'family': return <FamilySheet family={character.family} />;
            case 'quests': return <QuestLog quests={quests} worldEvents={worldEvents} />;
            case 'marketplace': return <MarketplaceScreen marketplace={marketplace} scene={scene} character={character} onBuyItem={onBuyItem} onSellItem={onSellItem} isLoading={isLoading} directShopId={directShopId} setDirectShopId={setDirectShopId} />;
            case 'party': return <PartySheet party={party} />;
            case 'ledger': return <TransactionLedger log={transactionLog} />;
            default: return null;
        }
    };


    return (
        <aside className="hidden md:w-[450px] md:flex flex-col flex-shrink-0 journal-panel p-2 space-y-2">
            <SidePanelHeader character={character} />
            
            <div className="flex-shrink-0 border-b-2 border-t-2 border-[var(--border-color-strong)]/50 py-2 relative">
                <div
                    ref={navRef}
                    className="side-panel-tab-nav pb-2 -mb-2 cursor-grab"
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseUpAndLeave}
                    onMouseMove={handleMouseMove}
                >
                     <div className="flex gap-2 px-1">
                        {tabs.map(tab => {
                             const TabIcon = tab.icon;
                             return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
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
                         <button
                            onClick={onOpenSettings}
                            className="side-panel-tab relative flex-shrink-0 p-2 rounded-lg"
                            title="Pengaturan"
                        >
                            <SettingsIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
                 <div className={`absolute top-0 right-0 h-full w-12 bg-gradient-to-l from-[var(--color-bg-panel)] via-[var(--color-bg-panel)]/80 to-transparent pointer-events-none transition-opacity duration-300 ${showScrollIndicator ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[var(--color-accent)] animate-pulse shadow-[0_0_8px_var(--color-accent-glow)]"></div>
                </div>
            </div>

            <div className="flex-grow min-h-0 overflow-y-auto pr-1">
                {renderContent()}
            </div>
        </aside>
    );
};

export default SidePanel;