import React, { useState, useEffect, useRef } from 'react';
import { Character, Quest, WorldEvent, Marketplace, Scene, ShopItem, InventoryItem, ItemSlot, World } from '../types';
import CharacterSheet from './CharacterSheet';
import PartySheet from './PartySheet';
import NotesPanel from './NotesPanel';
import InventorySheet from './InventorySheet';
import QuestLog from './QuestLog';
import MarketplaceScreen from './MarketplaceScreen';
import { ShieldIcon, UsersIcon, FileTextIcon, ChestIcon, ScrollIcon, StoreIcon, HelmetIcon, HeartIcon, MapIcon, HomeIcon, GlobeIcon, QuestionMarkCircleIcon, ChevronsRightIcon } from './icons';
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

const AccordionItem: React.FC<{
    title: string;
    icon: React.FC<any>;
    count?: number;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    panelRef?: React.RefObject<HTMLDivElement>;
}> = ({ title, icon: Icon, count, isOpen, onToggle, children, panelRef }) => {
    return (
        <div ref={panelRef} className="sidebar-accordion-item border-b border-[var(--border-color-soft)]">
            <button
                onClick={onToggle}
                aria-expanded={isOpen}
                className="sidebar-accordion-header"
            >
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-[var(--color-primary)]" />
                        <span className="font-bold font-cinzel text-stone-200">{title}</span>
                         {count !== undefined && count > 0 && (
                            <span className="text-xs bg-[var(--color-primary-dark)] text-white rounded-full w-5 h-5 flex items-center justify-center">{count}</span>
                        )}
                    </div>
                     <ChevronsRightIcon className="w-5 h-5 text-stone-400 sidebar-accordion-chevron" />
                </div>
            </button>
            <div className="sidebar-accordion-content" aria-hidden={!isOpen}>
                <div className="p-2">
                   {children}
                </div>
            </div>
        </div>
    );
};


const SidePanel: React.FC<SidePanelProps> = (props) => {
    const { 
        character, party, notes, onNotesChange, quests, worldEvents, 
        marketplace, scene, onBuyItem, onSellItem, isLoading, onEquipItem, 
        onUnequipItem, world, directShopId, setDirectShopId
    } = props;

    const [openSections, setOpenSections] = useState<Set<string>>(new Set(['character']));
    const marketplaceRef = useRef<HTMLDivElement>(null);
    
    const toggleSection = (sectionId: string) => {
        setOpenSections(prev => {
            const newSet = new Set(prev);
            if (newSet.has(sectionId)) {
                newSet.delete(sectionId);
            } else {
                newSet.add(sectionId);
            }
            return newSet;
        });
    };

    useEffect(() => {
        if (directShopId) {
            setOpenSections(prev => new Set(prev).add('marketplace'));
             setTimeout(() => {
                marketplaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }, [directShopId]);
    
    const panels = [
        { id: 'character', title: 'Karakter', icon: ShieldIcon, content: <CharacterSheet character={character} /> },
        { id: 'equipment', title: 'Perlengkapan', icon: HelmetIcon, content: <EquipmentSheet equipment={character.equipment} onUnequipItem={onUnequipItem} /> },
        { id: 'inventory', title: 'Inventaris', icon: ChestIcon, content: <InventorySheet character={character} onEquipItem={onEquipItem} /> },
        { id: 'map', title: 'Peta', icon: MapIcon, content: <MapView worldMap={world.worldMap} currentLocationName={scene.location} /> },
        { id: 'residence', title: 'Properti', icon: HomeIcon, count: character.residences.length, content: <ResidenceSheet residences={character.residences} /> },
        { id: 'family', title: 'Keluarga', icon: HeartIcon, content: <FamilySheet family={character.family} /> },
        { id: 'quests', title: 'Misi & Tawarikh', icon: ScrollIcon, content: <QuestLog quests={quests} worldEvents={worldEvents} /> },
        { id: 'marketplace', title: 'Pasar', icon: StoreIcon, content: <MarketplaceScreen marketplace={marketplace} scene={scene} character={character} onBuyItem={onBuyItem} onSellItem={onSellItem} isLoading={isLoading} directShopId={directShopId} setDirectShopId={setDirectShopId} />, ref: marketplaceRef },
        { id: 'party', title: 'Party', icon: UsersIcon, count: party.length, content: <PartySheet party={party} /> },
        { id: 'notes', title: 'Catatan', icon: FileTextIcon, content: <NotesPanel notes={notes} onNotesChange={onNotesChange} /> },
        { id: 'codex', title: 'Codex Dunia', icon: GlobeIcon, content: <WorldCodex world={world} isSheet={true} /> },
        { id: 'guidebook', title: 'Buku Panduan', icon: QuestionMarkCircleIcon, content: <GuidebookModal onClose={() => {}} isSheet /> },
    ];


    return (
        <aside className="hidden md:w-[450px] md:flex flex-shrink-0 journal-panel p-2">
            <div className="w-full h-full overflow-y-auto pr-2 sidebar-accordion">
                {panels.map(panel => (
                    <AccordionItem
                        key={panel.id}
                        title={panel.title}
                        icon={panel.icon}
                        count={panel.count}
                        isOpen={openSections.has(panel.id)}
                        onToggle={() => toggleSection(panel.id)}
                        panelRef={panel.ref}
                    >
                        {panel.content}
                    </AccordionItem>
                ))}
            </div>
        </aside>
    );
};

export default SidePanel;