import React, { useState, useEffect } from 'react';
import { World, SavedCharacter, ShopItem, InventoryItem, ItemSlot, NPC } from '../types';
import StoryLog from './StoryLog';
import ActionInput from './ActionInput';
import SidePanel from './SidePanel';
import { BookOpenIcon, GlobeIcon, QuestionMarkCircleIcon } from './icons';
import WorldCodex from './WorldCodex';
import NpcDetailModal from './NpcDetailModal';
import GuidebookModal from './GuidebookModal';

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

const GameScreen: React.FC<GameScreenProps> = (props) => {
  const { world, savedCharacter, onPlayerAction, isLoading, error, onNotesChange, onBuyItem, onSellItem, onEquipItem, onUnequipItem, onMarkGuidebookAsRead } = props;
  
  const [actionText, setActionText] = useState('');
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [isCodexOpen, setIsCodexOpen] = useState(false);
  const [isGuidebookOpen, setIsGuidebookOpen] = useState(false);
  const [directShopId, setDirectShopId] = useState<string | null>(null);
  const [selectedNpc, setSelectedNpc] = useState<NPC | null>(null);

  useEffect(() => {
    // Tampilkan buku panduan secara otomatis jika ini adalah pertama kalinya
    if (!savedCharacter.hasSeenGuidebook) {
      setIsGuidebookOpen(true);
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
      // Buka jurnal di perangkat seluler untuk menampilkan toko secara otomatis
      if (window.innerWidth < 768) {
          setIsJournalOpen(true);
      }
    }
    setSelectedNpc(null); // Tutup modal setelah interaksi dimulai
  };

  const { character, party, scene, storyHistory, notes } = savedCharacter;

  return (
    <div className="w-full max-w-[1600px] mx-auto h-full p-2 sm:p-4 md:grid md:grid-cols-[420px,1fr] md:gap-6">
      
      {selectedNpc && (
        <NpcDetailModal 
            npc={selectedNpc}
            onClose={() => setSelectedNpc(null)}
            onInteract={handleNpcInteraction}
        />
      )}

      <WorldCodex 
        world={world}
        isOpen={isCodexOpen}
        onClose={() => setIsCodexOpen(false)}
      />

      {/* FIX: Removed the `world` prop as it is not defined on GuidebookModalProps. */}
      <GuidebookModal 
        isOpen={isGuidebookOpen}
        onClose={handleCloseGuidebook}
      />

      <SidePanel
        world={world}
        character={character}
        party={party}
        notes={notes}
        onNotesChange={onNotesChange}
        quests={world.quests}
        worldEvents={world.worldEvents}
        isOpen={isJournalOpen}
        onClose={() => setIsJournalOpen(false)}
        marketplace={world.marketplace}
        scene={scene}
        onBuyItem={onBuyItem}
        onSellItem={onSellItem}
        isLoading={isLoading}
        onEquipItem={onEquipItem}
        onUnequipItem={onUnequipItem}
        directShopId={directShopId}
        setDirectShopId={setDirectShopId}
      />
      
      {/* Container utama untuk StoryLog dan ActionInput */}
      {/* Pada layar kecil, ini adalah satu-satunya elemen dalam flow. Pada desktop, ini adalah kolom grid kedua. */}
      <main className="flex-1 flex flex-col min-h-0 relative h-full md:h-auto">
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

       <button
        onClick={() => setIsGuidebookOpen(true)}
        className="fixed top-4 left-4 z-30 bg-stone-800/80 text-[var(--color-accent)] p-3 rounded-full shadow-lg backdrop-blur-sm border border-[var(--border-color-medium)]/50 hover:scale-110 hover:shadow-[var(--color-primary)]/30 transition-all"
        aria-label="Buka Buku Panduan"
      >
        <QuestionMarkCircleIcon className="w-6 h-6" />
      </button>

      <button
        onClick={() => setIsCodexOpen(true)}
        className="fixed bottom-4 left-4 z-30 bg-stone-800/80 text-[var(--color-accent)] p-3 rounded-full shadow-lg backdrop-blur-sm border border-[var(--border-color-medium)]/50 hover:scale-110 hover:shadow-[var(--color-primary)]/30 transition-all"
        aria-label="Buka Codex Dunia"
      >
        <GlobeIcon className="w-6 h-6" />
      </button>

      <button
        onClick={() => setIsJournalOpen(true)}
        className="md:hidden fixed top-4 right-4 z-30 bg-stone-800/80 text-[var(--color-accent)] p-3 rounded-full shadow-lg backdrop-blur-sm border border-[var(--border-color-medium)]/50"
        aria-label="Buka Jurnal"
      >
        <BookOpenIcon className="w-6 h-6" />
      </button>

    </div>
  );
};

export default GameScreen;