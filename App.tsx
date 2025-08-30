import React, { useState, useCallback, useEffect } from 'react';
import { GameState, Character, StoryEntry, Scene, AppNotification, SavedGame } from './types';
import StartScreen from './components/StartScreen';
import CharacterCreationScreen from './components/CharacterCreationScreen';
import GameScreen from './components/GameScreen';
import GameOverScreen from './components/GameOverScreen';
import NotificationContainer from './components/NotificationContainer';
import DungeonMaster from './services/aiService';

const SAVE_GAME_KEY = 'gemini-rpg-saves';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [character, setCharacter] = useState<Character | null>(null);
  const [party, setParty] = useState<Character[]>([]);
  const [scene, setScene] = useState<Scene | null>(null);
  const [storyHistory, setStoryHistory] = useState<StoryEntry[]>([]);
  const [longTermMemory, setLongTermMemory] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [savedGames, setSavedGames] = useState<SavedGame[]>([]);

  useEffect(() => {
    try {
      const savedData = localStorage.getItem(SAVE_GAME_KEY);
      if (savedData) {
        setSavedGames(JSON.parse(savedData));
      }
    } catch (e) {
      console.error("Gagal memuat game yang tersimpan:", e);
      addNotification("Gagal memuat karakter yang tersimpan.");
    }
  }, []);

  const persistSaves = (games: SavedGame[]) => {
    try {
      localStorage.setItem(SAVE_GAME_KEY, JSON.stringify(games));
      setSavedGames(games);
    } catch (e) {
      console.error("Gagal menyimpan game:", e);
      addNotification("Gagal menyimpan progres. Penyimpanan mungkin penuh.");
    }
  };

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

  const handleGoToStart = () => {
      setCharacter(null);
      setParty([]);
      setScene(null);
      setStoryHistory([]);
      setLongTermMemory([]);
      setNotes('');
      setError(null);
      setGameState(GameState.START);
  };

  const handleLoadGame = useCallback((gameId: string) => {
    const gameToLoad = savedGames.find(g => g.id === gameId);
    if (gameToLoad) {
      setCharacter(gameToLoad.character);
      setParty(gameToLoad.party || []);
      setScene(gameToLoad.scene);
      setStoryHistory(gameToLoad.storyHistory);
      setLongTermMemory(gameToLoad.longTermMemory || []);
      setNotes(gameToLoad.notes || '');
      setGameState(GameState.PLAYING);
      setError(null);
    } else {
      setError("Gagal memuat permainan. File tidak ditemukan.");
    }
  }, [savedGames]);

  const handleDeleteGame = useCallback((gameId: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus karakter ini? Aksi ini tidak dapat dibatalkan.")) {
      const newSaves = savedGames.filter(g => g.id !== gameId);
      persistSaves(newSaves);
    }
  }, [savedGames]);


  const handleCharacterCreate = useCallback(async (characterData: { concept: string; background: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const { character: newCharacterData, initialScene, introStory } = await DungeonMaster.generateCharacter(characterData);
      
      const newCharacter: Character = { ...newCharacterData, id: crypto.randomUUID() };

      const introStoryEntry: StoryEntry = {
        type: 'narrative',
        content: introStory,
      };
      const newHistory = [introStoryEntry];

      const newSave: SavedGame = {
        id: newCharacter.id,
        character: newCharacter,
        party: [],
        scene: initialScene,
        storyHistory: newHistory,
        longTermMemory: [],
        notes: '',
        lastSaved: new Date().toISOString(),
      };
      persistSaves([...savedGames, newSave]);

      setCharacter(newCharacter);
      setParty([]);
      setScene(initialScene);
      setStoryHistory(newHistory);
      setLongTermMemory([]);
      setNotes('');
      setGameState(GameState.PLAYING);
    } catch (err) {
      setError('Gagal menciptakan karakter. Sang AI Dungeon Master sedang tertidur. Silakan coba lagi.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [savedGames]);

  const handleNotesChange = useCallback((newNotes: string) => {
      setNotes(newNotes);
      if (character) {
          const currentSave = savedGames.find(g => g.id === character.id);
          if (currentSave) {
              const updatedSave: SavedGame = { ...currentSave, notes: newNotes, lastSaved: new Date().toISOString() };
              const newSaves = savedGames.map(g => g.id === character.id ? updatedSave : g);
              persistSaves(newSaves);
          }
      }
  }, [character, savedGames]);

  const handlePlayerAction = useCallback(async (action: string) => {
    if (!character || !scene) return;

    setIsLoading(true);
    setError(null);
    
    // Handle OOC Chat
    if (action.toLowerCase().startsWith('/ooc ')) {
      const question = action.substring(5);
      const oocQueryEntry: StoryEntry = { type: 'ooc_query', content: question };
      
      setStoryHistory(prev => [...prev, oocQueryEntry]);

      try {
        const gmResponse = await DungeonMaster.askOOCQuestion(storyHistory, longTermMemory, question);
        const oocResponseEntity: StoryEntry = { type: 'ooc_response', content: gmResponse };
        setStoryHistory(prev => [...prev, oocResponseEntity]);
      } catch (err) {
         setError('GM sedang sibuk bermeditasi dan tidak dapat menjawab pertanyaan OOC Anda saat ini.');
         console.error(err);
         // Hapus query OOC jika gagal
         setStoryHistory(prev => prev.slice(0, -1));
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Handle normal action
    const playerActionEntry: StoryEntry = {
        type: 'action',
        content: action
    };
    const currentHistory = [...storyHistory, playerActionEntry];
    setStoryHistory(currentHistory);
    
    try {
      const response = await DungeonMaster.generateNextScene(character, party, scene, storyHistory, longTermMemory, notes, action);
      
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

      const finalHistory = [...currentHistory, ...newEntries];
      const updatedCharacter: Character = { ...response.karakterTerbaru, id: character.id };
      
      // Mengelola pembaruan party dan memastikan ID tetap ada
      const existingPartyIds = new Map(party.map(p => [p.name, p.id]));
      const updatedParty: Character[] = (response.partyTerbaru || []).map(companion => {
          const existingId = existingPartyIds.get(companion.name);
          return {
              ...companion,
              id: existingId || crypto.randomUUID()
          };
      });

      const newLongTermMemory = response.memorySummary 
        ? [...longTermMemory, response.memorySummary] 
        : longTermMemory;

      setCharacter(updatedCharacter);
      setParty(updatedParty);
      setScene(response.sceneUpdate);
      setStoryHistory(finalHistory);
      setLongTermMemory(newLongTermMemory);
      
      const updatedSave: SavedGame = {
        id: character.id,
        character: updatedCharacter,
        party: updatedParty,
        scene: response.sceneUpdate,
        storyHistory: finalHistory,
        longTermMemory: newLongTermMemory,
        notes: notes,
        lastSaved: new Date().toISOString(),
      };
      const newSaves = savedGames.map(g => g.id === character.id ? updatedSave : g);
      persistSaves(newSaves);

      if (response.notifications && response.notifications.length > 0) {
        response.notifications.forEach(addNotification);
      }

      if (updatedCharacter.stats.health <= 0) {
        const finalSaves = savedGames.filter(g => g.id !== character.id);
        persistSaves(finalSaves);
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
  }, [character, scene, storyHistory, party, longTermMemory, notes, addNotification, savedGames]);

  const renderContent = () => {
    switch (gameState) {
      case GameState.START:
        return <StartScreen onStart={handleStart} savedGames={savedGames} onLoadGame={handleLoadGame} onDeleteGame={handleDeleteGame} />;
      case GameState.CREATING_CHARACTER:
        return <CharacterCreationScreen onCreate={handleCharacterCreate} isLoading={isLoading} error={error} />;
      case GameState.PLAYING:
        if (character && scene) {
          return <GameScreen 
            character={character}
            party={party}
            scene={scene} 
            storyHistory={storyHistory} 
            onPlayerAction={handlePlayerAction} 
            isLoading={isLoading} 
            error={error} 
            notes={notes}
            onNotesChange={handleNotesChange}
          />;
        }
        // Fallback
        handleGoToStart();
        return null;
      case GameState.GAME_OVER:
        return <GameOverScreen onRestart={handleGoToStart} finalStory={storyHistory.slice(-1)[0]?.content} />;
      default:
        return <StartScreen onStart={handleStart} savedGames={savedGames} onLoadGame={handleLoadGame} onDeleteGame={handleDeleteGame} />;
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