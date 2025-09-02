import React, { useState, useEffect } from 'react';
import { World, SavedCharacter, ShopItem, InventoryItem, ItemSlot, NPC, Character, WorldTheme } from '../types';
import StoryLog from './StoryLog';
import ActionInput from './ActionInput';
import SidePanel from './SidePanel';
import { FileTextIcon, GlobeIcon, QuestionMarkCircleIcon, XIcon, SettingsIcon } from './icons';
import WorldCodex from './WorldCodex';
import NpcDetailModal from './NpcDetailModal';
import GuidebookModal from './GuidebookModal';
import MobileSheet from './MobileSheet';
import NotesPanel from './NotesPanel';
import SettingsModal from './SettingsModal';

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
  onThemeChange: (theme: WorldTheme) => void;
}

const GameScreen: React.FC<GameScreenProps> = (props) => {
  const { world, savedCharacter, onPlayerAction, isLoading, error, onMarkGuidebookAsRead, onThemeChange } = props;
  
  const [actionText, setActionText] = useState('');
  const [selectedNpc, setSelectedNpc] = useState<NPC | null>(null);
  const [directShopId, setDirectShopId] = useState<string | null>(null);

  const [isCodexOpen, setIsCodexOpen] = useState(false);
  const [isGuidebookOpen, setIsGuidebookOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (!savedCharacter.hasSeenGuidebook) {
      if (window.innerWidth >= 768) { // md breakpoint
        setIsGuidebookOpen(true);
      }
    }
  }, [savedCharacter.hasSeenGuidebook]);

  const handleCloseGuidebook = () => {
    if (!savedCharacter.hasSeenGuidebook) {
      onMarkGuidebookAsRead();
    }
    setIsGuidebookOpen(false);
  };

  const handleShowNpcDetails = (npc: NPC) => {
    setSelectedNpc(npc);
  };

  const handleNpcInteraction = (npc: NPC) => {
    setActionText(`Bicara dengan ${npc.name}`);
    if (npc.shopId) {
      setDirectShopId(npc.shopId);
    }
    setSelectedNpc(null);
  };

  const handleTravelClick = (destinationName: string) => {
    setActionText(`Pergi ke ${destinationName}`);
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row md:gap-6 md:p-4 max-h-screen overflow-hidden">
      
      {selectedNpc && (
        <NpcDetailModal 
            npc={selectedNpc}
            onClose={() => setSelectedNpc(null)}
            onInteract={handleNpcInteraction}
        />
      )}
      
      <div className="hidden md:flex flex-col gap-4 fixed top-1/2 -translate-y-1/2 right-6 z-30">
        <button onClick={() => setIsCodexOpen(true)} className="floating-button" title="Codex Dunia">
          <GlobeIcon className="w-7 h-7" />
        </button>
        <button onClick={() => setIsNotesOpen(true)} className="floating-button" title="Catatan">
          <FileTextIcon className="w-7 h-7" />
        </button>
        <button onClick={() => setIsGuidebookOpen(true)} className="floating-button" title="Buku Panduan">
          <QuestionMarkCircleIcon className="w-7 h-7" />
        </button>
        <button onClick={() => setIsSettingsOpen(true)} className="floating-button" title="Pengaturan">
          <SettingsIcon className="w-7 h-7" />
        </button>
      </div>

      <WorldCodex world={world} isOpen={isCodexOpen} onClose={() => setIsCodexOpen(false)} />
      <GuidebookModal isOpen={isGuidebookOpen} onClose={handleCloseGuidebook} />
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentTheme={world.theme}
        onThemeChange={onThemeChange}
      />

      {isNotesOpen && (
          <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
              onClick={() => setIsNotesOpen(false)}
              role="dialog"
              aria-modal="true"
          >
              <div
                  className="journal-panel w-full max-w-2xl h-full max-h-[70vh] p-4 sm:p-6 relative animate-zoomIn flex flex-col"
                  onClick={(e) => e.stopPropagation()}
              >
                  <button
                      onClick={() => setIsNotesOpen(false)}
                      className="absolute top-4 right-4 text-stone-400 hover:text-white transition-colors z-10"
                      aria-label="Tutup Catatan"
                  >
                      <XIcon className="w-6 h-6" />
                  </button>
                  <div className="h-full">
                      <NotesPanel notes={savedCharacter.notes} onNotesChange={props.onNotesChange} />
                  </div>
              </div>
          </div>
      )}

      <SidePanel
        {...props}
        directShopId={directShopId}
        setDirectShopId={setDirectShopId}
        onTravelClick={handleTravelClick}
      />
      
      <main className="flex-1 flex flex-col min-h-0 relative">
        <StoryLog 
          storyHistory={savedCharacter.storyHistory} 
          scene={savedCharacter.scene}
          onNpcClick={handleShowNpcDetails}
        />
        <ActionInput 
          onAction={onPlayerAction} 
          isLoading={isLoading} 
          actionText={actionText}
          setActionText={setActionText}
        />
      </main>

      <div className="md:hidden">
        <MobileSheet 
          {...props}
          setActionText={setActionText}
          directShopId={directShopId}
          setDirectShopId={setDirectShopId}
          onTravelClick={handleTravelClick}
          onShowGuidebookRequest={() => setIsGuidebookOpen(true)}
        />
      </div>

    </div>
  );
};

export default GameScreen;