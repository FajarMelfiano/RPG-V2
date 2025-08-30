import React, { useState } from 'react';
import { World, SavedCharacter } from '../types';
import StoryLog from './StoryLog';
import ActionInput from './ActionInput';
import SidePanel from './SidePanel';
import { BookOpenIcon } from './icons';

interface GameScreenProps {
  world: World;
  savedCharacter: SavedCharacter;
  onPlayerAction: (action: string) => void;
  isLoading: boolean;
  error: string | null;
  onNotesChange: (notes: string) => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ world, savedCharacter, onPlayerAction, isLoading, error, onNotesChange }) => {
  const [actionText, setActionText] = useState('');
  const [isJournalOpen, setIsJournalOpen] = useState(false);

  const handleNpcInteract = (npcName: string) => {
    setActionText(`Bicara dengan ${npcName}`);
  };

  const { character, party, scene, storyHistory, notes } = savedCharacter;
  const { quests, worldEvents } = world;

  return (
    <div className="w-full max-w-[1600px] mx-auto h-[95vh] flex flex-row gap-4 sm:gap-6 p-1 sm:p-2">
      
      <SidePanel
        character={character}
        party={party}
        notes={notes}
        onNotesChange={onNotesChange}
        quests={quests}
        worldEvents={worldEvents}
        isOpen={isJournalOpen}
        onClose={() => setIsJournalOpen(false)}
      />
      
      <main className="flex-1 h-full flex flex-col min-h-0 relative">
        <StoryLog 
          storyHistory={storyHistory} 
          scene={scene}
          onNpcInteract={handleNpcInteract}
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
        onClick={() => setIsJournalOpen(true)}
        className="md:hidden fixed top-4 right-4 z-30 bg-stone-800/80 text-amber-300 p-3 rounded-full shadow-lg backdrop-blur-sm border border-amber-800/50"
        aria-label="Buka Jurnal"
      >
        <BookOpenIcon className="w-6 h-6" />
      </button>

    </div>
  );
};

export default GameScreen;