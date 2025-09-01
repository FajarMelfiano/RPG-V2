import React, { useState, useEffect } from 'react';
import { World, SavedCharacter, ShopItem, InventoryItem, ItemSlot, NPC, Character } from '../types';
import StoryLog from './StoryLog';
import ActionInput from './ActionInput';
import SidePanel from './SidePanel';
import { BookOpenIcon, GlobeIcon, QuestionMarkCircleIcon, HeartIcon, ManaIcon, CoinIcon, ShieldIcon } from './icons';
import WorldCodex from './WorldCodex';
import NpcDetailModal from './NpcDetailModal';
import GuidebookModal from './GuidebookModal';
import MobileSheet, { ActiveTab } from './MobileSheet';
import BottomNavBar from './BottomNavBar';
import CharacterSheet from './CharacterSheet';
import EquipmentSheet from './EquipmentSheet';
import InventorySheet from './InventorySheet';
import MapView from './MapView';
import ResidenceSheet from './ResidenceSheet';
import FamilySheet from './FamilySheet';
import QuestLog from './QuestLog';
import MarketplaceScreen from './MarketplaceScreen';
import PartySheet from './PartySheet';
// FIX: Import NotesPanel component to resolve 'Cannot find name' error.
import NotesPanel from './NotesPanel';

interface GameScreenProps {
  world: World;
  savedCharacter: SavedCharacter;
  onPlayerAction: (action: string) => void;
  isLoading: boolean;
  error: string | null;
  onNotesChange: (notes: string) => void;
  onBuyItem: (item: ShopItem, shopName: string) => void;
  onSellItem: (item: InventoryItem, shopName: string) => void;
  onEquipItem: (itemId: string) => void;
  onUnequipItem: (slot: ItemSlot) => void;
  onMarkGuidebookAsRead: () => void;
}

const MobileHeader: React.FC<{ character: Character }> = ({ character }) => {
  const { name, stats } = character;
  const healthPercentage = stats.maxHealth > 0 ? (stats.health / stats.maxHealth) * 100 : 0;
  const manaPercentage = stats.maxMana > 0 ? (stats.mana / stats.maxMana) * 100 : 0;
  return (
    <div className="md:hidden p-2 bg-black/30 backdrop-blur-sm border-b border-[var(--border-color-strong)]/50 flex-shrink-0">
      <div className="flex justify-between items-center gap-4">
        <div className="flex-grow">
          <h1 className="font-cinzel text-lg text-[var(--color-text-header)] truncate">{name}</h1>
          <div className="flex items-center gap-2">
              <div className="w-full bg-black/50 rounded-full h-1.5 shadow-inner border border-stone-900">
                <div className="bg-gradient-to-r from-red-800 to-red-500 h-full rounded-full" style={{ width: `${healthPercentage}%` }}></div>
              </div>
              {stats.maxMana > 0 && (
                <div className="w-full bg-black/50 rounded-full h-1.5 shadow-inner border border-stone-900">
                  <div className="bg-gradient-to-r from-blue-800 to-blue-500 h-full rounded-full" style={{ width: `${manaPercentage}%` }}></div>
                </div>
              )}
          </div>
        </div>
        <div className="flex items-center gap-2 bg-stone-950/50 px-2 py-1 rounded-full border border-stone-700 flex-shrink-0">
            <CoinIcon className="w-4 h-4 text-[var(--color-accent)]" />
            <span className="font-bold text-sm text-stone-200">{character.gold}</span>
        </div>
      </div>
    </div>
  );
};


const GameScreen: React.FC<GameScreenProps> = (props) => {
  const { world, savedCharacter, onPlayerAction, isLoading, error, onNotesChange, onBuyItem, onSellItem, onEquipItem, onUnequipItem, onMarkGuidebookAsRead } = props;
  
  const [actionText, setActionText] = useState('');
  const [activeSheet, setActiveSheet] = useState<ActiveTab | null>(null);
  const [directShopId, setDirectShopId] = useState<string | null>(null);
  const [selectedNpc, setSelectedNpc] = useState<NPC | null>(null);

  useEffect(() => {
    if (!savedCharacter.hasSeenGuidebook) {
      setActiveSheet('guidebook');
    }
  }, [savedCharacter.hasSeenGuidebook]);

  const handleCloseGuidebook = () => {
    if (!savedCharacter.hasSeenGuidebook) {
      onMarkGuidebookAsRead();
    }
    setActiveSheet(null);
  };

  const handleShowNpcDetails = (npc: NPC) => {
    setSelectedNpc(npc);
  };

  const handleNpcInteraction = (npc: NPC) => {
    setActionText(`Bicara dengan ${npc.name}`);
    if (npc.shopId) {
      setDirectShopId(npc.shopId);
      setActiveSheet('marketplace');
    }
    setSelectedNpc(null);
  };

  const handleTabSelect = (tab: ActiveTab) => {
    setActiveSheet(tab);
  }

  const { character, party, scene, storyHistory, notes } = savedCharacter;

  const renderSheetContent = () => {
    if (!activeSheet) return null;
    switch (activeSheet) {
      case 'character': return <CharacterSheet character={character} />;
      case 'equipment': return <EquipmentSheet equipment={character.equipment} onUnequipItem={onUnequipItem} />;
      case 'inventory': return <InventorySheet character={character} onEquipItem={onEquipItem} />;
      case 'map': return <MapView worldMap={world.worldMap} currentLocationName={scene.location} />;
      case 'residence': return <ResidenceSheet residences={character.residences} />;
      case 'family': return <FamilySheet family={character.family} />;
      case 'quests': return <QuestLog quests={world.quests} worldEvents={world.worldEvents} />;
      case 'party': return <PartySheet party={party} />;
      case 'notes': return <NotesPanel notes={notes} onNotesChange={onNotesChange} />;
      case 'marketplace': return <MarketplaceScreen marketplace={world.marketplace} scene={scene} character={character} onBuyItem={onBuyItem} onSellItem={onSellItem} isLoading={isLoading} directShopId={directShopId} setDirectShopId={setDirectShopId} />;
      case 'codex': return <WorldCodex world={world} />;
      case 'guidebook': return <GuidebookModal onClose={handleCloseGuidebook} isSheet={true}/>;
      default: return null;
    }
  }

  return (
    <div className="w-full h-full flex flex-col">
      
      {selectedNpc && (
        <NpcDetailModal 
            npc={selectedNpc}
            onClose={() => setSelectedNpc(null)}
            onInteract={handleNpcInteraction}
        />
      )}

      <MobileHeader character={character} />

      <div className="w-full max-w-screen-2xl mx-auto flex-1 flex flex-col md:flex-row md:gap-6 md:p-4 min-h-0">
        {/* FIX: Pass all required props to SidePanel instead of using spread, which caused a type error. */}
        <SidePanel
          character={character}
          party={party}
          notes={notes}
          onNotesChange={onNotesChange}
          quests={world.quests}
          worldEvents={world.worldEvents}
          marketplace={world.marketplace}
          scene={scene}
          onBuyItem={onBuyItem}
          onSellItem={onSellItem}
          isLoading={isLoading}
          onEquipItem={onEquipItem}
          onUnequipItem={onUnequipItem}
          world={world}
          onTabSelect={handleTabSelect}
          directShopId={directShopId}
          setDirectShopId={setDirectShopId}
        />
        
        <main className="flex-1 flex flex-col min-h-0 relative">
          <StoryLog 
            storyHistory={storyHistory} 
            scene={scene}
            onNpcClick={handleShowNpcDetails}
          />
          <ActionInput 
            onAction={onPlayerAction} 
            isLoading={isLoading} 
            actionText={actionText}
            setActionText={setActionText}
          />
          {error && (
              <div className="absolute bottom-24 left-4 right-4 p-2 text-center text-red-300 bg-red-900/80 rounded-lg text-sm shadow-lg backdrop-blur-sm border border-red-700">
                  {error}
              </div>
          )}
        </main>
      </div>

      <MobileSheet 
        activeTab={activeSheet}
        onClose={() => setActiveSheet(null)}
      >
        {renderSheetContent()}
      </MobileSheet>
      
      <BottomNavBar onTabSelect={handleTabSelect} />
    </div>
  );
};

export default GameScreen;