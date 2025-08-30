import React, { useState, useCallback, useEffect } from 'react';
import { GameState, Character, StoryEntry, Scene, AppNotification, World, SavedCharacter, Quest, WorldEvent } from './types';
import StartScreen from './components/StartScreen';
import WorldCreationScreen from './components/WorldCreationScreen';
import WorldLobbyScreen from './components/WorldLobbyScreen';
import CharacterCreationScreen from './components/CharacterCreationScreen';
import GameScreen from './components/GameScreen';
import GameOverScreen from './components/GameOverScreen';
import NotificationContainer from './components/NotificationContainer';
import DungeonMaster from './services/aiService';

const SAVE_GAME_KEY = 'gemini-rpg-worlds';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [worlds, setWorlds] = useState<World[]>([]);
  const [activeWorld, setActiveWorld] = useState<World | null>(null);
  const [activeCharacter, setActiveCharacter] = useState<SavedCharacter | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    try {
      const savedData = localStorage.getItem(SAVE_GAME_KEY);
      if (savedData) {
        setWorlds(JSON.parse(savedData));
      }
    } catch (e) {
      console.error("Gagal memuat dunia yang tersimpan:", e);
      addNotification("Gagal memuat dunia yang tersimpan.");
    }
  }, []);

  const persistWorlds = (updatedWorlds: World[]) => {
    try {
      localStorage.setItem(SAVE_GAME_KEY, JSON.stringify(updatedWorlds));
      setWorlds(updatedWorlds);
    } catch (e) {
      console.error("Gagal menyimpan dunia:", e);
      addNotification("Gagal menyimpan progres. Penyimpanan mungkin penuh.");
    }
  };

  const addNotification = useCallback((message: string, type?: 'quest' | 'event' | 'item' | 'gold' | 'reputation') => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, {id, message}]);
    setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  const handleGoToStart = () => {
    setGameState(GameState.START);
    setActiveWorld(null);
    setActiveCharacter(null);
    setError(null);
  };

  const handleNewWorld = () => setGameState(GameState.CREATING_WORLD);

  const handleWorldCreate = async (worldData: { concept: string, factions: string, conflict: string }) => {
    setIsLoading(true);
    setError(null);
    try {
        const { name, description } = await DungeonMaster.generateWorld(worldData);
        const newWorld: World = {
            id: crypto.randomUUID(),
            name,
            description,
            longTermMemory: [],
            worldEvents: [],
            quests: [],
            characters: [],
        };
        const updatedWorlds = [...worlds, newWorld];
        persistWorlds(updatedWorlds);
        setActiveWorld(newWorld);
        setGameState(GameState.WORLD_LOBBY);
    } catch (err) {
        setError('Gagal menciptakan dunia. Para dewa sedang murka. Coba lagi.');
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  };

  const handleSelectWorld = (worldId: string) => {
    const world = worlds.find(w => w.id === worldId);
    if (world) {
        setActiveWorld(world);
        setGameState(GameState.WORLD_LOBBY);
    }
  };
  
  const handleDeleteWorld = (worldId: string) => {
     if (window.confirm("Apakah Anda yakin ingin menghapus dunia ini dan semua karakternya? Aksi ini tidak dapat dibatalkan.")) {
      const newWorlds = worlds.filter(w => w.id !== worldId);
      persistWorlds(newWorlds);
    }
  }

  const handleNewCharacter = () => setGameState(GameState.CREATING_CHARACTER);

  const handleCharacterCreate = useCallback(async (characterData: { concept: string; background: string }) => {
    if (!activeWorld) return;
    setIsLoading(true);
    setError(null);
    try {
      const { character: newCharacterData, initialScene, introStory } = await DungeonMaster.generateCharacter(characterData, activeWorld.description);
      
      const newCharacter: Character = { ...newCharacterData, id: crypto.randomUUID() };
      const newSavedCharacter: SavedCharacter = {
        character: newCharacter,
        party: [],
        scene: initialScene,
        storyHistory: [{ type: 'narrative', content: introStory }],
        notes: '',
        turnCount: 0,
        lastPlayed: new Date().toISOString(),
      };

      const updatedWorld = { ...activeWorld, characters: [...activeWorld.characters, newSavedCharacter] };
      const newWorlds = worlds.map(w => w.id === activeWorld.id ? updatedWorld : w);
      persistWorlds(newWorlds);

      setActiveWorld(updatedWorld);
      setActiveCharacter(newSavedCharacter);
      setGameState(GameState.PLAYING);
    } catch (err) {
      setError('Gagal menciptakan karakter. Sang AI Dungeon Master sedang tertidur. Silakan coba lagi.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [activeWorld, worlds]);

  const handleContinueCharacter = (characterId: string) => {
    if (!activeWorld) return;
    const characterToLoad = activeWorld.characters.find(c => c.character.id === characterId);
    if (characterToLoad) {
      setActiveCharacter(characterToLoad);
      setGameState(GameState.PLAYING);
    }
  };
  
   const handleDeleteCharacter = (characterId: string) => {
    if (!activeWorld) return;
    if (window.confirm("Apakah Anda yakin ingin menghapus karakter ini? Aksi ini tidak dapat dibatalkan.")) {
      const updatedCharacters = activeWorld.characters.filter(c => c.character.id !== characterId);
      const updatedWorld = {...activeWorld, characters: updatedCharacters};
      const newWorlds = worlds.map(w => w.id === activeWorld.id ? updatedWorld : w);
      persistWorlds(newWorlds);
      setActiveWorld(updatedWorld);
    }
  }

  const handleNotesChange = useCallback((newNotes: string) => {
      if (!activeWorld || !activeCharacter) return;
      
      const updatedCharacter = { ...activeCharacter, notes: newNotes };
      setActiveCharacter(updatedCharacter);

      const updatedWorld = {
          ...activeWorld,
          characters: activeWorld.characters.map(c => c.character.id === activeCharacter.character.id ? updatedCharacter : c)
      };
      
      const newWorlds = worlds.map(w => w.id === activeWorld.id ? updatedWorld : w);
      persistWorlds(newWorlds);
  }, [activeWorld, activeCharacter, worlds]);

  const handlePlayerAction = useCallback(async (action: string) => {
    if (!activeWorld || !activeCharacter) return;

    setIsLoading(true);
    setError(null);
    
    let currentHistory = activeCharacter.storyHistory;

    if (action.toLowerCase().startsWith('/ooc ')) {
      const question = action.substring(5);
      const oocQueryEntry: StoryEntry = { type: 'ooc_query', content: question };
      currentHistory = [...currentHistory, oocQueryEntry];
      setActiveCharacter(prev => prev ? { ...prev, storyHistory: currentHistory } : null);

      try {
        const gmResponse = await DungeonMaster.askOOCQuestion(currentHistory, activeWorld.longTermMemory, question);
        const oocResponseEntity: StoryEntry = { type: 'ooc_response', content: gmResponse };
        currentHistory = [...currentHistory, oocResponseEntity];
      } catch (err) {
         setError('GM sedang sibuk bermeditasi dan tidak dapat menjawab pertanyaan OOC Anda saat ini.');
         console.error(err);
         currentHistory = currentHistory.slice(0, -1);
      } finally {
        const finalCharacter = { ...activeCharacter, storyHistory: currentHistory };
        const finalWorld = { ...activeWorld, characters: activeWorld.characters.map(c => c.character.id === activeCharacter.character.id ? finalCharacter : c) };
        persistWorlds(worlds.map(w => w.id === activeWorld.id ? finalWorld : w));
        setActiveCharacter(finalCharacter);
        setActiveWorld(finalWorld);
        setIsLoading(false);
      }
      return;
    }

    const newTurnCount = activeCharacter.turnCount + 1;
    const playerActionEntry: StoryEntry = { type: 'action', content: action };
    currentHistory = [...currentHistory, playerActionEntry];
    setActiveCharacter(prev => prev ? { ...prev, storyHistory: currentHistory, turnCount: newTurnCount } : null);
    
    try {
      const response = await DungeonMaster.generateNextScene(
          activeCharacter.character, activeCharacter.party, activeCharacter.scene, currentHistory,
          activeWorld.longTermMemory, activeCharacter.notes, activeWorld.quests, activeWorld.worldEvents, newTurnCount, action
      );
      
      const newEntries: StoryEntry[] = [];
      if(response.skillCheck) {
          newEntries.push({ type: 'dice_roll', content: '', rollDetails: response.skillCheck });
      }
      newEntries.push({ type: 'narrative', content: response.narasiBaru });

      const finalHistory = [...currentHistory, ...newEntries];
      const updatedCharacterData: Character = { ...response.karakterTerbaru, id: activeCharacter.character.id };
      
      const existingPartyIds = new Map(activeCharacter.party.map(p => [p.name, p.id]));
      const updatedParty: Character[] = (response.partyTerbaru || []).map(companion => ({
          ...companion, id: existingPartyIds.get(companion.name) || crypto.randomUUID() 
      }));

      let updatedWorld = { ...activeWorld };
      updatedWorld.longTermMemory = response.memorySummary ? [...updatedWorld.longTermMemory, response.memorySummary] : updatedWorld.longTermMemory;

      if (response.questsUpdate?.length) {
        let currentQuests = [...updatedWorld.quests];
        response.questsUpdate.forEach(updatedQuest => {
          const idx = currentQuests.findIndex(q => q.title.toLowerCase() === updatedQuest.title.toLowerCase());
          if (idx > -1) {
            if (currentQuests[idx].status === 'Aktif' && updatedQuest.status === 'Selesai') addNotification(`Misi Selesai: ${updatedQuest.title}`, 'quest');
            else if (currentQuests[idx].status !== updatedQuest.status) addNotification(`Misi Diperbarui: ${updatedQuest.title}`, 'quest');
            currentQuests[idx] = { ...updatedQuest, id: currentQuests[idx].id };
          } else {
            currentQuests.push({ ...updatedQuest, id: crypto.randomUUID() });
            addNotification(`Misi Baru: ${updatedQuest.title}`, 'quest');
          }
        });
        updatedWorld.quests = currentQuests;
      }

      if (response.worldEventsUpdate?.length) {
        response.worldEventsUpdate.forEach(newEventData => {
            const newEvent: WorldEvent = { ...newEventData, id: crypto.randomUUID(), turn: newTurnCount };
            updatedWorld.worldEvents.push(newEvent);
            addNotification(`Kabar Dunia (${newEvent.type}): ${newEvent.title}`, 'event');
        });
       }
      
      const updatedSavedCharacter: SavedCharacter = {
        ...activeCharacter,
        character: updatedCharacterData,
        party: updatedParty,
        scene: response.sceneUpdate,
        storyHistory: finalHistory,
        turnCount: newTurnCount,
        lastPlayed: new Date().toISOString(),
      };
      
      updatedWorld.characters = updatedWorld.characters.map(c => c.character.id === updatedSavedCharacter.character.id ? updatedSavedCharacter : c);

      persistWorlds(worlds.map(w => w.id === updatedWorld.id ? updatedWorld : w));
      setActiveWorld(updatedWorld);
      setActiveCharacter(updatedSavedCharacter);

      if (updatedCharacterData.stats.health <= 0) {
        setGameState(GameState.GAME_OVER);
      }

    } catch (err) {
      setError('Alur takdir sedang kusut. Sang AI Dungeon Master bingung. Silakan coba aksi yang berbeda.');
      console.error(err);
      setActiveCharacter(prev => prev ? { ...prev, storyHistory: prev.storyHistory.slice(0, -1), turnCount: prev.turnCount -1 } : null);
    } finally {
      setIsLoading(false);
    }
  }, [activeWorld, activeCharacter, worlds, addNotification]);
  
  const renderContent = () => {
    switch (gameState) {
      case GameState.START:
        return <StartScreen worlds={worlds} onNewWorld={handleNewWorld} onSelectWorld={handleSelectWorld} onDeleteWorld={handleDeleteWorld} />;
      case GameState.CREATING_WORLD:
        return <WorldCreationScreen onCreate={handleWorldCreate} onBack={handleGoToStart} isLoading={isLoading} error={error} />;
      case GameState.WORLD_LOBBY:
        if (activeWorld) {
          return <WorldLobbyScreen world={activeWorld} onNewCharacter={handleNewCharacter} onContinueCharacter={handleContinueCharacter} onDeleteCharacter={handleDeleteCharacter} onBack={handleGoToStart} />;
        }
        break;
      case GameState.CREATING_CHARACTER:
        if (activeWorld) {
          return <CharacterCreationScreen worldContext={activeWorld.description} onCreate={handleCharacterCreate} isLoading={isLoading} error={error} onBack={() => setGameState(GameState.WORLD_LOBBY)} />;
        }
        break;
      case GameState.PLAYING:
        if (activeWorld && activeCharacter) {
          return <GameScreen 
            world={activeWorld}
            savedCharacter={activeCharacter}
            onPlayerAction={handlePlayerAction} 
            isLoading={isLoading} 
            error={error} 
            onNotesChange={handleNotesChange}
          />;
        }
        break;
      case GameState.GAME_OVER:
        if (activeWorld && activeCharacter) {
            const finalWorld = {
                ...activeWorld,
                characters: activeWorld.characters.filter(c => c.character.id !== activeCharacter.character.id)
            };
            persistWorlds(worlds.map(w => w.id === finalWorld.id ? finalWorld : w));

            return <GameOverScreen onRestart={handleGoToStart} finalStory={activeCharacter.storyHistory.slice(-1)[0]?.content} />;
        }
        break;
    }
    // Fallback to start screen
    handleGoToStart();
    return null;
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-300">
        <NotificationContainer notifications={notifications} />
        <div className="min-h-screen flex flex-col items-center justify-center p-2 sm:p-4">
            {renderContent()}
        </div>
    </div>
  );
};

export default App;