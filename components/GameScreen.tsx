import React, { useState } from 'react';
import { Character, StoryEntry, Scene } from '../types';
import StoryLog from './StoryLog';
import ActionInput from './ActionInput';
import SceneDisplay from './SceneDisplay';
import SidePanel from './SidePanel';
import { ShieldIcon } from './icons';

interface GameScreenProps {
  character: Character;
  party: Character[];
  scene: Scene;
  storyHistory: StoryEntry[];
  onPlayerAction: (action: string) => void;
  isLoading: boolean;
  error: string | null;
  notes: string;
  onNotesChange: (notes: string) => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ character, party, scene, storyHistory, onPlayerAction, isLoading, error, notes, onNotesChange }) => {
  const [actionText, setActionText] = useState('');
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  const handleNpcInteract = (npcName: string) => {
    setActionText(`Bicara dengan ${npcName}`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto h-[95vh] flex flex-row gap-4 p-1">
      {/* Mobile drawer toggle */}
      <button
        onClick={() => setIsSidePanelOpen(true)}
        className="md:hidden fixed top-4 right-4 z-30 bg-amber-600/90 text-white p-3 rounded-full shadow-lg backdrop-blur-sm"
        aria-label="Tampilkan panel karakter"
      >
        <ShieldIcon className="w-6 h-6" />
      </button>

      <SidePanel
        character={character}
        party={party}
        notes={notes}
        onNotesChange={onNotesChange}
        isOpen={isSidePanelOpen}
        onClose={() => setIsSidePanelOpen(false)}
      />
      
      <div className="flex-1 h-full flex flex-col min-h-0 bg-slate-800/70 rounded-xl shadow-lg border border-slate-700 backdrop-blur-sm">
        <SceneDisplay scene={scene} onNpcInteract={handleNpcInteract} />
        <StoryLog storyHistory={storyHistory} />
        <ActionInput 
          onAction={onPlayerAction} 
          isLoading={isLoading} 
          actionText={actionText}
          setActionText={setActionText}
        />
        {error && (
            <div className="p-2 text-center text-red-300 bg-red-900/60 rounded-b-xl text-sm">
                {error}
            </div>
        )}
      </div>
    </div>
  );
};

export default GameScreen;