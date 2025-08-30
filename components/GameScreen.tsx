import React from 'react';
import { Character, StoryEntry, Scene } from '../types';
import CharacterSheet from './CharacterSheet';
import StoryLog from './StoryLog';
import ActionInput from './ActionInput';
import SceneDisplay from './SceneDisplay';

interface GameScreenProps {
  character: Character;
  scene: Scene;
  storyHistory: StoryEntry[];
  onPlayerAction: (action: string) => void;
  isLoading: boolean;
  error: string | null;
}

const GameScreen: React.FC<GameScreenProps> = ({ character, scene, storyHistory, onPlayerAction, isLoading, error }) => {
  return (
    <div className="w-full max-w-7xl mx-auto h-[95vh] flex flex-col md:flex-row gap-4 p-1">
      <div className="w-full md:w-1/3 lg:w-1/4 h-full">
        <CharacterSheet character={character} />
      </div>
      <div className="w-full md:w-2/3 lg:w-3/4 h-full flex flex-col min-h-0 bg-slate-800/70 rounded-xl shadow-lg border border-slate-700 backdrop-blur-sm">
        <SceneDisplay scene={scene} />
        <StoryLog storyHistory={storyHistory} />
        <ActionInput onAction={onPlayerAction} isLoading={isLoading} />
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