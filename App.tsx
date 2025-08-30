import React, { useState, useCallback } from 'react';
import { GameState, Character, StoryEntry, Scene, AppNotification } from './types';
import StartScreen from './components/StartScreen';
import CharacterCreationScreen from './components/CharacterCreationScreen';
import GameScreen from './components/GameScreen';
import GameOverScreen from './components/GameOverScreen';
import NotificationContainer from './components/NotificationContainer';
import DungeonMaster from './services/aiService';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [character, setCharacter] = useState<Character | null>(null);
  const [scene, setScene] = useState<Scene | null>(null);
  const [storyHistory, setStoryHistory] = useState<StoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const addNotification = useCallback((message: string) => {
    const id = Date.now();
    setNotifications(prev => [...prev, {id, message}]);
    setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000); // Notifikasi hilang setelah 5 detik
  }, []);

  const handleStart = () => {
    setGameState(GameState.CREATING_CHARACTER);
  };

  const handleRestart = () => {
      setCharacter(null);
      setScene(null);
      setStoryHistory([]);
      setError(null);
      setGameState(GameState.START);
  };

  const handleCharacterCreate = useCallback(async (characterData: { concept: string; background: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const { character: newCharacter, initialScene, introStory } = await DungeonMaster.generateCharacter(characterData);
      setCharacter(newCharacter);
      setScene(initialScene);
      
      const introStoryEntry: StoryEntry = {
        type: 'narrative',
        content: introStory,
      };
      setStoryHistory([introStoryEntry]);
      setGameState(GameState.PLAYING);
    } catch (err) {
      setError('Gagal menciptakan karakter. Sang AI Dungeon Master sedang tertidur. Silakan coba lagi.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handlePlayerAction = useCallback(async (action: string) => {
    if (!character || !scene) return;
    
    const playerActionEntry: StoryEntry = {
        type: 'action',
        content: action
    };

    const currentHistory = [...storyHistory, playerActionEntry];
    setStoryHistory(currentHistory);
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await DungeonMaster.generateNextScene(character, scene, storyHistory, action);
      
      const newEntries: StoryEntry[] = [];
      if(response.skillCheck) {
          newEntries.push({
              type: 'dice_roll',
              content: '', // Konten akan dirender secara khusus di komponen
              rollDetails: response.skillCheck
          });
      }
      newEntries.push({
          type: 'narrative',
          content: response.narasiBaru
      });

      setStoryHistory(prev => [...prev, ...newEntries]);
      setCharacter(response.karakterTerbaru);
      setScene(response.sceneUpdate);
      
      if (response.notifications && response.notifications.length > 0) {
        response.notifications.forEach(addNotification);
      }

      if (response.karakterTerbaru.stats.health <= 0) {
        setGameState(GameState.GAME_OVER);
      }

    } catch (err) {
      setError('Alur takdir sedang kusut. Sang AI Dungeon Master bingung. Silakan coba aksi yang berbeda.');
      console.error(err);
      // Revert player action on error
      setStoryHistory(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }, [character, scene, storyHistory, addNotification]);

  const renderContent = () => {
    switch (gameState) {
      case GameState.START:
        return <StartScreen onStart={handleStart} />;
      case GameState.CREATING_CHARACTER:
        return <CharacterCreationScreen onCreate={handleCharacterCreate} isLoading={isLoading} error={error} />;
      case GameState.PLAYING:
        if (character && scene) {
          return <GameScreen 
            character={character}
            scene={scene} 
            storyHistory={storyHistory} 
            onPlayerAction={handlePlayerAction} 
            isLoading={isLoading} 
            error={error} 
          />;
        }
        // Fallback
        handleRestart();
        return null;
      case GameState.GAME_OVER:
        return <GameOverScreen onRestart={handleRestart} finalStory={storyHistory.slice(-1)[0]?.content} />;
      default:
        return <StartScreen onStart={handleStart} />;
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed" style={{backgroundImage: "url('https://picsum.photos/seed/rpgbg/1920/1080')"}}>
        <NotificationContainer notifications={notifications} />
        <div className="min-h-screen bg-slate-900 bg-opacity-80 backdrop-blur-sm flex flex-col items-center justify-center p-2 md:p-4">
            {renderContent()}
        </div>
    </div>
  );
};

export default App;