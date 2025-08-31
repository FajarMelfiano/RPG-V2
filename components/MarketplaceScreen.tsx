import React, { useState } from 'react';
import { Marketplace, Scene, Character, ShopItem, InventoryItem, ItemRarity } from '../types';
import { StoreIcon, CoinIcon } from './icons';

interface MarketplaceScreenProps {
    marketplace: Marketplace;
    scene: Scene;
    character: Character;
    onBuyItem: (item: ShopItem, shopId: string) => void;
    onSellItem: (item: InventoryItem, shopId: string) => void;
    isLoading: boolean;
    directShopId: string | null;
    setDirectShopId: (id: string | null) => void;
}

const getRarityColor = (rarity: ItemRarity) => {
    switch(rarity) {
        case ItemRarity.TIDAK_BIASA: return 'text-green-400';
        case ItemRarity.LANGKA: return 'text-blue-400';
        case ItemRarity.EPIK: return 'text-purple-400';
        default: return 'text-stone-300';
    }
}

const MarketplaceScreen: React.FC<MarketplaceScreenProps> = ({ marketplace, scene, character, onBuyItem, onSellItem, isLoading, directShopId, setDirectShopId }) => {
    const [mode, setMode] = useState<'buy' | 'sell'>('buy');

    const availableShops = marketplace.shops.filter(shop => scene.availableShopIds?.includes(shop.id));
    const activeShop = directShopId ? marketplace.shops.find(shop => shop.id === directShopId) : null;
    
    const renderItemList = () => {
        if (!activeShop) return null;
        
        const itemsToDisplay = mode === 'buy' ? activeShop.inventory : character.inventory;
        if (!itemsToDisplay || itemsToDisplay.length === 0) {
            return <li className="text-stone-500 italic text-center py-4">{mode === 'buy' ? 'Toko ini kehabisan stok.' : 'Anda tidak punya apa-apa untuk dijual.'}</li>;
        }

        return itemsToDisplay.map((inventoryItem) => {
            const { item, quantity } = inventoryItem;
            const price = mode === 'buy' ? item.value : Math.floor(item.value / 2);
            return (
                <li key={`${item.id}-${mode}`} className="bg-stone-950/40 p-2 rounded-md border border-stone-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex-grow">
                        <p className={`font-bold ${getRarityColor(item.rarity)}`}>{item.name} (x{quantity})</p>
                        <p className="text-xs text-stone-400 italic mt-1 break-words">{item.description}</p>
                    </div>
                    <div className="flex-shrink-0 ml-2">
                       {mode === 'buy' ? (
                            <button 
                                onClick={() => onBuyItem(inventoryItem as ShopItem, activeShop!.id)} 
                                disabled={character.gold < price || isLoading}
                                className="thematic-button text-xs py-1 px-3 rounded-md flex items-center gap-1"
                            >
                                <CoinIcon className="w-3 h-3"/> {price}
                            </button>
                       ) : (
                            <button 
                                onClick={() => onSellItem(inventoryItem, activeShop!.id)}
                                disabled={isLoading}
                                className="bg-green-800 hover:bg-green-700 border-b-2 border-green-900 text-white text-xs py-1 px-3 rounded-md flex items-center gap-1"
                            >
                               <CoinIcon className="w-3 h-3"/> {price}
                            </button>
                       )}
                    </div>
                </li>
            );
        });
    }

    return (
        <div className="p-1 flex flex-col h-full">
            <h3 className="font-cinzel text-xl text-[var(--color-text-header)] mb-3 border-b-2 border-[var(--border-color-strong)]/50 pb-2 flex items-center gap-2 text-glow">
                <StoreIcon className="w-5 h-5" />
                <span>Pasar</span>
            </h3>
            
            {activeShop ? (
                <div>
                    <div className="mb-4 text-center">
                        <button onClick={() => setDirectShopId(null)} disabled={isLoading} className="text-xs text-stone-400 hover:text-[var(--color-accent)] mb-2 disabled:opacity-50">&larr; Kembali ke Daftar Toko</button>
                        <h4 className="font-cinzel text-lg text-[var(--color-text-header)]">{activeShop.name}</h4>
                        <p className="text-xs text-stone-400 italic">{activeShop.description}</p>
                    </div>

                    <div className="flex bg-stone-950/50 rounded-lg p-1 mb-4 border border-stone-700">
                        <button onClick={() => setMode('buy')} disabled={isLoading} className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${mode === 'buy' ? 'bg-[var(--color-primary-dark)]/70 text-white' : 'hover:bg-stone-800/50 text-stone-300'} disabled:opacity-50`}>Beli</button>
                        <button onClick={() => setMode('sell')} disabled={isLoading} className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${mode === 'sell' ? 'bg-[var(--color-primary-dark)]/70 text-white' : 'hover:bg-stone-800/50 text-stone-300'} disabled:opacity-50`}>Jual</button>
                    </div>

                    <div className="flex justify-end items-center text-[var(--color-accent)] mb-2" title="Emas Anda">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-stone-300">Emas Anda:</span>
                            <CoinIcon className="w-5 h-5" />
                            <span className="font-bold text-lg">{character.gold}</span>
                        </div>
                    </div>

                    <ul className="space-y-2 text-sm overflow-y-auto max-h-[50vh] pr-1">
                        {renderItemList()}
                    </ul>
                </div>
            ) : (
                availableShops.length > 0 ? (
                    <div className="space-y-2">
                        {availableShops.map(shop => (
                            <button 
                                key={shop.id}
                                onClick={() => {
                                    setDirectShopId(shop.id);
                                    setMode('buy');
                                }}
                                disabled={isLoading}
                                className="w-full text-left bg-stone-950/40 p-3 rounded-md border border-stone-700/50 hover:bg-stone-800/70 hover:border-[var(--color-primary-hover)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <p className="font-bold text-stone-200">{shop.name}</p>
                                <p className="text-xs text-stone-400 italic">{shop.description}</p>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-stone-500 italic pt-10">
                        <p>Tidak ada pedagang di sini.</p>
                    </div>
                )
            )}
        </div>
    );
};

export default MarketplaceScreen;