import React, { useState, useCallback, useEffect } from 'react';
import { GameState, Character, StoryEntry, Scene, AppNotification, SavedGame } from './types';
import StartScreen from './components/StartScreen';
import CharacterCreationScreen from './components/CharacterCreationScreen';
import GameScreen from './components/GameScreen';
import GameOverScreen from './components/GameOverScreen';
import NotificationContainer from './components/NotificationContainer';
import CharacterSelectionScreen from './components/CharacterSelectionScreen';
import DungeonMaster from './services/aiService';
import * as storageService from './services/storageService';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [character, setCharacter] = useState<Character | null>(null);
  const [scene, setScene] = useState<Scene | null>(null);
  const [storyHistory, setStoryHistory] = useState<StoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [savedGames, setSavedGames] = useState<SavedGame[]>([]);

  useEffect(() => {
    setSavedGames(storageService.loadGames());
  }, []);

  const addNotification = useCallback((message: string) => {
    const id = Date.now();
    setNotifications(prev => [...prev, {id, message}]);
    setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  const resetGameState = () => {
    setCharacter(null);
    setScene(null);
    setStoryHistory([]);
    setError(null);
    setIsLoading(false);
  };

  const handleStartNewGame = () => {
    setGameState(GameState.CREATING_CHARACTER);
  };
  
  const handleContinueGame = () => {
    setGameState(GameState.CHARACTER_SELECTION);
  };

  const handleBackToStart = () => {
    resetGameState();
    setGameState(GameState.START);
  };

  const handleRestartFromGameOver = useCallback(() => {
      if (character) {
        storageService.deleteGame(character.name);
        setSavedGames(storageService.loadGames());
      }
      resetGameState();
      setGameState(GameState.START);
  }, [character]);

  const handleCharacterCreate = useCallback(async (characterData: { concept: string; background: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const { character: newCharacter, initialScene, introStory } = await DungeonMaster.generateCharacter(characterData);
      
      const introStoryEntry: StoryEntry = {
        type: 'narrative',
        content: introStory,
      };

      const newGame: SavedGame = {
        id: newCharacter.name,
        character: newCharacter,
        scene: initialScene,
        storyHistory: [introStoryEntry],
      };

      storageService.saveGame(newGame);
      setSavedGames(storageService.loadGames());
      
      setCharacter(newCharacter);
      setScene(initialScene);
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
    
    const playerActionEntry: StoryEntry = { type: 'action', content: action };
    const currentHistory = [...storyHistory, playerActionEntry];
    setStoryHistory(currentHistory);
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await DungeonMaster.generateNextScene(character, scene, storyHistory, action);
      
      const newEntries: StoryEntry[] = [];
      if(response.skillCheck) {
          newEntries.push({ type: 'dice_roll', content: '', rollDetails: response.skillCheck });
      }
      newEntries.push({ type: 'narrative', content: response.narasiBaru });

      const updatedHistory = [...currentHistory, ...newEntries];
      setStoryHistory(updatedHistory);
      setCharacter(response.karakterTerbaru);
      setScene(response.sceneUpdate);
      
      // Simpan kemajuan secara otomatis
      const updatedGame: SavedGame = {
        id: response.karakterTerbaru.name,
        character: response.karakterTerbaru,
        scene: response.sceneUpdate,
        storyHistory: updatedHistory,
      };
      storageService.saveGame(updatedGame);
      setSavedGames(storageService.loadGames());

      if (response.notifications && response.notifications.length > 0) {
        response.notifications.forEach(addNotification);
      }

      if (response.karakterTerbaru.stats.health <= 0) {
        setGameState(GameState.GAME_OVER);
      }

    } catch (err) {
      setError('Alur takdir sedang kusut. Sang AI Dungeon Master bingung. Silakan coba aksi yang berbeda.');
      console.error(err);
      setStoryHistory(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }, [character, scene, storyHistory, addNotification]);
  
  const handleLoadGame = useCallback((game: SavedGame) => {
    setCharacter(game.character);
    setScene(game.scene);
    setStoryHistory(game.storyHistory);
    setGameState(GameState.PLAYING);
  }, []);
  
  const handleDeleteGame = useCallback((gameId: string) => {
    storageService.deleteGame(gameId);
    setSavedGames(storageService.loadGames());
  }, []);
  
  const handleSaveAndExit = useCallback(() => {
    if (!character) return;
    // Kemajuan sudah disimpan otomatis di setiap aksi,
    // jadi fungsi ini hanya perlu kembali ke menu utama.
    addNotification(`Permainan "${character.name}" disimpan!`);
    resetGameState();
    setGameState(GameState.START);
  }, [character, addNotification]);


  const renderContent = () => {
    switch (gameState) {
      case GameState.START:
        return <StartScreen onStartNew={handleStartNewGame} onContinue={handleContinueGame} hasSavedGames={savedGames.length > 0} />;
      case GameState.CREATING_CHARACTER:
        return <CharacterCreationScreen onCreate={handleCharacterCreate} isLoading={isLoading} error={error} />;
      case GameState.CHARACTER_SELECTION:
        return <CharacterSelectionScreen savedGames={savedGames} onLoad={handleLoadGame} onDelete={handleDeleteGame} onBack={handleBackToStart} />;
      case GameState.PLAYING:
        if (character && scene) {
          return <GameScreen 
            character={character}
            scene={scene} 
            storyHistory={storyHistory} 
            onPlayerAction={handlePlayerAction} 
            onSaveAndExit={handleSaveAndExit}
            isLoading={isLoading} 
            error={error} 
          />;
        }
        // Fallback
        handleBackToStart();
        return null;
      case GameState.GAME_OVER:
        return <GameOverScreen onRestart={handleRestartFromGameOver} finalStory={storyHistory.slice(-1)[0]?.content} />;
      default:
        return <StartScreen onStartNew={handleStartNewGame} onContinue={handleContinueGame} hasSavedGames={savedGames.length > 0} />;
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
