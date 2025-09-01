

import React, { useState, useCallback, useEffect } from 'react';
import { GameState, Character, StoryEntry, Scene, AppNotification, World, SavedCharacter, Quest, WorldEvent, Marketplace, ShopItem, InventoryItem, TransactionLogEntry, ItemSlot, AnyItem, EquippableItem, CharacterUpdatePayload, WorldMemory, WorldMap, Stats, Residence } from './types';
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
        const loadedWorlds: World[] = JSON.parse(savedData);
        // Migrasi data lama ke struktur memori baru untuk kompatibilitas mundur
        const migratedWorlds = loadedWorlds.map(world => {
          let migratedWorld = { ...world };
          if (Array.isArray(world.longTermMemory) || typeof world.longTermMemory !== 'object') {
            console.log(`Migrasi memori untuk dunia: ${world.name}`);
            migratedWorld.longTermMemory = {
                keyEvents: Array.isArray(world.longTermMemory) ? world.longTermMemory : [],
                keyCharacters: [],
                worldStateSummary: world.description || "Sejarah dunia ini diselimuti misteri."
            };
          }
          if (!world.worldMap) {
             console.log(`Migrasi peta untuk dunia: ${world.name}`);
             migratedWorld.worldMap = { nodes: [], edges: [] };
          }
           migratedWorld.characters = (migratedWorld.characters || []).map(char => {
              if (!char.character.residences) {
                  char.character.residences = [];
              }
              return char;
           });
          return migratedWorld;
        });
        setWorlds(migratedWorlds);
      }
    } catch (e) {
      console.error("Gagal memuat dunia yang tersimpan:", e);
      addNotification("Gagal memuat dunia yang tersimpan.");
    }
  }, []);

  useEffect(() => {
    const theme = activeWorld?.theme || 'dark_fantasy';
    document.body.setAttribute('data-theme', theme);
  }, [activeWorld]);


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
        const { name, description, marketplace, theme, worldMap } = await DungeonMaster.generateWorld(worldData);
        const newWorld: World = {
            id: crypto.randomUUID(),
            name,
            description,
            theme,
            longTermMemory: {
              keyEvents: [`Dunia ${name} diciptakan.`],
              keyCharacters: [],
              worldStateSummary: description
            },
            worldEvents: [],
            quests: [],
            characters: [],
            marketplace,
            worldMap,
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
      
      const newSavedCharacter: SavedCharacter = {
        character: { ...newCharacterData, id: crypto.randomUUID() },
        party: [],
        scene: initialScene,
        storyHistory: [{ type: 'narrative', content: introStory }],
        notes: '',
        turnCount: 0,
        lastPlayed: new Date().toISOString(),
        transactionLog: [],
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

  const updateActiveCharacterAndWorld = (updatedCharacter: SavedCharacter, updatedWorld?: World) => {
    const finalWorld = updatedWorld || activeWorld;
    if (!finalWorld) return;

    const newWorldState = {
        ...finalWorld,
        characters: finalWorld.characters.map(c => c.character.id === updatedCharacter.character.id ? updatedCharacter : c)
    };
    persistWorlds(worlds.map(w => w.id === newWorldState.id ? newWorldState : w));
    setActiveWorld(newWorldState);
    setActiveCharacter(updatedCharacter);
  }

  const handleNotesChange = useCallback((newNotes: string) => {
      if (!activeCharacter) return;
      const updatedCharacter = { ...activeCharacter, notes: newNotes };
      updateActiveCharacterAndWorld(updatedCharacter);
  }, [activeCharacter, activeWorld, worlds]);
  
  const handleBuyItem = useCallback((item: ShopItem, shopId: string) => {
      if (!activeCharacter || !activeWorld) return;
      if (activeCharacter.character.gold < item.item.value) {
          addNotification("Emas tidak cukup!");
          return;
      }

      // Optimistic update
      const updatedCharacterState = { ...activeCharacter };
      const updatedWorldState = { ...activeWorld };

      // Kurangi emas
      updatedCharacterState.character = { ...updatedCharacterState.character, gold: updatedCharacterState.character.gold - item.item.value };

      // Tambah item ke inventaris
      const newInventory = [...updatedCharacterState.character.inventory];
      const existingItemIndex = newInventory.findIndex(i => i.item.id === item.item.id);
      if (existingItemIndex > -1) {
          newInventory[existingItemIndex] = { ...newInventory[existingItemIndex], quantity: newInventory[existingItemIndex].quantity + item.quantity };
      } else {
          newInventory.push({ ...item });
      }
      updatedCharacterState.character.inventory = newInventory;
      
      // Hapus item dari toko
      const shop = updatedWorldState.marketplace.shops.find(s => s.id === shopId);
      if (shop) {
        const newShopInventory = [...shop.inventory];
        const shopItemIndex = newShopInventory.findIndex(i => i.item.id === item.item.id);
        if(shopItemIndex > -1) {
            if(newShopInventory[shopItemIndex].quantity > item.quantity) {
                newShopInventory[shopItemIndex].quantity -= item.quantity;
            } else {
                newShopInventory.splice(shopItemIndex, 1);
            }
            shop.inventory = newShopInventory;
        }
      }
      
      // Tambah log transaksi
      const newLogEntry: TransactionLogEntry = {
        turn: activeCharacter.turnCount,
        type: 'buy',
        itemName: item.item.name,
        quantity: item.quantity,
        goldAmount: -item.item.value
      };
      updatedCharacterState.transactionLog = [...updatedCharacterState.transactionLog, newLogEntry];

      updateActiveCharacterAndWorld(updatedCharacterState, updatedWorldState);
      addNotification(`Membeli: ${item.item.name}`, 'item');
  }, [activeCharacter, activeWorld, worlds, addNotification]);

  const handleSellItem = useCallback((item: InventoryItem, shopId: string) => {
      if (!activeCharacter || !activeWorld) return;
      const sellValue = Math.floor(item.item.value / 2);

      const updatedCharacterState = { ...activeCharacter };
      const updatedWorldState = { ...activeWorld };

      // Tambah emas
      updatedCharacterState.character = { ...updatedCharacterState.character, gold: updatedCharacterState.character.gold + sellValue };
      
      // Kurangi item dari inventaris
      const newInventory = [...updatedCharacterState.character.inventory];
      const itemToSellIndex = newInventory.findIndex(i => i.item.id === item.item.id);
      if (itemToSellIndex > -1) {
          if (newInventory[itemToSellIndex].quantity > 1) {
              newInventory[itemToSellIndex].quantity -= 1;
          } else {
              newInventory.splice(itemToSellIndex, 1);
          }
      }
      updatedCharacterState.character.inventory = newInventory;

      // Tambah item ke toko
      const shop = updatedWorldState.marketplace.shops.find(s => s.id === shopId);
      if (shop) {
          const newShopInventory = [...shop.inventory];
          const existingShopItemIndex = newShopInventory.findIndex(i => i.item.id === item.item.id);
          if (existingShopItemIndex > -1) {
              newShopInventory[existingShopItemIndex].quantity += 1;
          } else {
              newShopInventory.push({ item: item.item, quantity: 1 });
          }
          shop.inventory = newShopInventory;
      }

      // Tambah log transaksi
      const newLogEntry: TransactionLogEntry = {
        turn: activeCharacter.turnCount,
        type: 'sell',
        itemName: item.item.name,
        quantity: 1,
        goldAmount: sellValue
      };
      updatedCharacterState.transactionLog = [...updatedCharacterState.transactionLog, newLogEntry];

      updateActiveCharacterAndWorld(updatedCharacterState, updatedWorldState);
      addNotification(`Menjual: ${item.item.name} (+${sellValue} Emas)`, 'gold');
  }, [activeCharacter, activeWorld, worlds, addNotification]);

  const handleEquipItem = useCallback((itemId: string) => {
    if (!activeCharacter) return;
    const { character } = activeCharacter;
    
    const itemIndex = character.inventory.findIndex(invItem => invItem.item.id === itemId);
    if (itemIndex === -1) return;

    const inventoryItem = character.inventory[itemIndex];
    if (!inventoryItem.item.slot) return;
    const itemToEquip = inventoryItem.item as EquippableItem;
    const slotToEquip = itemToEquip.slot;

    const newEquipment = { ...character.equipment };
    const newInventory = [...character.inventory];

    const currentlyEquipped = newEquipment[slotToEquip];
    if (currentlyEquipped) {
      const existingInvItemIndex = newInventory.findIndex(i => i.item.id === currentlyEquipped.id);
      if (existingInvItemIndex > -1) {
        newInventory[existingInvItemIndex].quantity += 1;
      } else {
        newInventory.push({ item: currentlyEquipped, quantity: 1 });
      }
    }

    newEquipment[slotToEquip] = itemToEquip;
    if (inventoryItem.quantity > 1) {
      newInventory[itemIndex] = { ...inventoryItem, quantity: inventoryItem.quantity - 1 };
    } else {
      newInventory.splice(itemIndex, 1);
    }
    
    const updatedChar = { ...character, equipment: newEquipment, inventory: newInventory };

    updateActiveCharacterAndWorld({ ...activeCharacter, character: updatedChar });
    addNotification(`Memakai: ${itemToEquip.name}`, 'item');
  }, [activeCharacter, addNotification]);

  const handleUnequipItem = useCallback((slot: ItemSlot) => {
    if (!activeCharacter) return;
    const { character } = activeCharacter;

    const itemToUnequip = character.equipment[slot];
    if (!itemToUnequip) return;

    const newEquipment = { ...character.equipment };
    delete newEquipment[slot];

    const newInventory = [...character.inventory];
    const existingInvItemIndex = newInventory.findIndex(i => i.item.id === itemToUnequip.id);
    if (existingInvItemIndex > -1) {
      newInventory[existingInvItemIndex].quantity += 1;
    } else {
      newInventory.push({ item: itemToUnequip, quantity: 1 });
    }

    const updatedChar = { ...character, equipment: newEquipment, inventory: newInventory };

    updateActiveCharacterAndWorld({ ...activeCharacter, character: updatedChar });
    addNotification(`Melepas: ${itemToUnequip.name}`, 'item');
  }, [activeCharacter, addNotification]);

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
        updateActiveCharacterAndWorld(finalCharacter);
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
          activeWorld.longTermMemory, activeCharacter.notes, activeWorld.quests, activeWorld.worldEvents, 
          newTurnCount, action, activeCharacter.transactionLog, activeWorld.marketplace, activeWorld.worldMap
      );
      
      const newEntries: StoryEntry[] = [];
      if(response.skillCheck) {
          newEntries.push({ type: 'dice_roll', content: '', rollDetails: response.skillCheck });
      }
      newEntries.push({ type: 'narrative', content: response.narasiBaru });

      const finalHistory = [...currentHistory, ...newEntries];
      
      let updatedCharacter = { ...activeCharacter.character };
      const updates = response.pembaruanKarakter;

      if (updates) {
        if (updates.perubahanHp) {
            updatedCharacter.stats.health = Math.max(0, Math.min(updatedCharacter.stats.maxHealth, updatedCharacter.stats.health + updates.perubahanHp));
        }
        if (updates.perubahanMana) {
            updatedCharacter.stats.mana = Math.max(0, Math.min(updatedCharacter.stats.maxMana, updatedCharacter.stats.mana + updates.perubahanMana));
        }
        if (updates.perubahanEmas) {
            updatedCharacter.gold = Math.max(0, updatedCharacter.gold + updates.perubahanEmas);
        }
        if (updates.itemDiterima) {
            const newInventory = [...updatedCharacter.inventory];
            updates.itemDiterima.forEach(newItem => {
                const existingItem = newInventory.find(i => i.item.name.toLowerCase() === newItem.item.name.toLowerCase());
                if (existingItem) {
                    existingItem.quantity += newItem.quantity;
                } else {
                    newItem.item.id = newItem.item.id || crypto.randomUUID();
                    newInventory.push(newItem);
                }
            });
            updatedCharacter.inventory = newInventory;
        }
        if (updates.itemDihapus) {
            let inventoryAfterRemoval = [...updatedCharacter.inventory];
            updates.itemDihapus.forEach(itemToRemove => {
                const itemIndex = inventoryAfterRemoval.findIndex(i => i.item.name.toLowerCase() === itemToRemove.name.toLowerCase());
                if (itemIndex > -1) {
                    inventoryAfterRemoval[itemIndex].quantity -= itemToRemove.quantity;
                    if (inventoryAfterRemoval[itemIndex].quantity <= 0) {
                        inventoryAfterRemoval = inventoryAfterRemoval.filter((_, index) => index !== itemIndex);
                    }
                }
            });
            updatedCharacter.inventory = inventoryAfterRemoval;
        }
        if (updates.keluargaDiperbarui) {
            updatedCharacter.family = updates.keluargaDiperbarui;
            addNotification('Hubungan keluarga diperbarui.', 'event');
        }
        if (updates.residenceGained) {
          updatedCharacter.residences = [...updatedCharacter.residences, updates.residenceGained];
          addNotification(`Properti Diperoleh: ${updates.residenceGained.name}`, 'event');
        }
      }

      let updatedParty = [...activeCharacter.party];
        if (response.partyUpdate) {
            if (response.partyUpdate.join) {
                const joinData = response.partyUpdate.join;
                const defaultStats: Stats = {
                    level: 1, health: 10, maxHealth: 10, mana: 0, maxMana: 0,
                    strength: 10, dexterity: 10, constitution: 10,
                    intelligence: 10, wisdom: 10, charisma: 10,
                };

                const newMember: Character = {
                    id: crypto.randomUUID(),
                    name: joinData.name,
                    race: joinData.race,
                    characterClass: joinData.characterClass,
                    stats: { ...defaultStats, ...joinData.stats },
                    age: 30,
                    height: "Rata-rata",
                    appearance: "Penampilan belum dideskripsikan.",
                    backstory: "Seorang teman seperjalanan yang misterius bergabung.",
                    inventory: [],
                    equipment: {},
                    reputation: 0,
                    gold: 0,
                    family: [],
                    residences: [],
                };
                updatedParty.push(newMember);
                addNotification(`${newMember.name} telah bergabung dengan party!`, 'event');
            }
            if (response.partyUpdate.leave) {
                const leftMemberName = response.partyUpdate.leave;
                updatedParty = updatedParty.filter(p => p.name !== leftMemberName);
                addNotification(`${leftMemberName} telah meninggalkan party.`, 'event');
            }
        }


      let updatedWorld = { ...activeWorld };
      if (response.memoryUpdate) {
          updatedWorld.longTermMemory = response.memoryUpdate;
      }
      
      if (response.mapUpdate) {
        const oldNodeIds = new Set(activeWorld.worldMap.nodes.map(n => n.id));
        const newNodes = response.mapUpdate.nodes.filter(n => !oldNodeIds.has(n.id));
        newNodes.forEach(node => {
          addNotification(`Peta Diperbarui: Lokasi '${node.name}' ditambahkan`, 'event');
        });
        updatedWorld.worldMap = response.mapUpdate;
      }

      if (response.marketplaceUpdate) {
        updatedWorld.marketplace = response.marketplaceUpdate;
      }

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
        character: updatedCharacter,
        party: updatedParty,
        scene: response.sceneUpdate,
        storyHistory: finalHistory,
        turnCount: newTurnCount,
        lastPlayed: new Date().toISOString(),
        transactionLog: [], // Hapus log setelah AI melihatnya
      };
      
      updateActiveCharacterAndWorld(updatedSavedCharacter, updatedWorld);
      
      if (updatedCharacter.stats.health <= 0) {
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
            onBuyItem={handleBuyItem}
            onSellItem={handleSellItem}
            onEquipItem={handleEquipItem}
            onUnequipItem={handleUnequipItem}
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
        <div className="min-h-screen flex flex-col items-center justify-center">
            {renderContent()}
        </div>
    </div>
  );
};

export default App;