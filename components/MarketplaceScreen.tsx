
import React, { useState, useEffect } from 'react';
import { Marketplace, Scene, Character, Shop, ShopItem, InventoryItem } from '../types';
import { StoreIcon, CoinIcon } from './icons';

interface MarketplaceScreenProps {
    marketplace: Marketplace;
    scene: Scene;
    character: Character;
    onBuyItem: (item: ShopItem, shopId: string) => void;
    onSellItem: (item: InventoryItem, shopId: string) => void;
    isLoading: boolean;
}

const MarketplaceScreen: React.FC<MarketplaceScreenProps> = ({ marketplace, scene, character, onBuyItem, onSellItem, isLoading }) => {
    const [activeShopId, setActiveShopId] = useState<string | null>(null);
    const [mode, setMode] = useState<'buy' | 'sell'>('buy');

    const availableShops = marketplace.shops.filter(shop => scene.availableShopIds?.includes(shop.id));
    const activeShop = activeShopId ? marketplace.shops.find(shop => shop.id === activeShopId) : null;

    // Efek ini akan mereset tampilan jika toko yang aktif tidak lagi tersedia (misalnya karena pemain pindah lokasi)
    // Ini memperbaiki bug layar kosong di beberapa perangkat.
    useEffect(() => {
        if (activeShopId && !availableShops.some(shop => shop.id === activeShopId)) {
            setActiveShopId(null);
        }
    }, [availableShops, activeShopId]);

    const handleSelectShop = (shopId: string) => {
        setActiveShopId(shopId);
        setMode('buy'); // Selalu reset ke mode beli saat memilih toko baru
    }

    return (
        <div className="p-1 flex flex-col h-full">
            <h3 className="font-cinzel text-xl text-amber-300 mb-3 border-b-2 border-amber-900/50 pb-2 flex items-center gap-2 text-glow">
                <StoreIcon className="w-5 h-5" />
                <span>Pasar</span>
            </h3>
            
            {activeShop ? (
                // Tampilan Antarmuka Toko
                <div>
                    <div className="mb-4 text-center">
                        <button onClick={() => setActiveShopId(null)} disabled={isLoading} className="text-xs text-stone-400 hover:text-amber-300 mb-2 disabled:opacity-50">&larr; Kembali ke Daftar Toko</button>
                        <h4 className="font-cinzel text-lg text-amber-200">{activeShop.name}</h4>
                        <p className="text-xs text-stone-400 italic">{activeShop.description}</p>
                    </div>

                    <div className="flex bg-stone-950/50 rounded-lg p-1 mb-4 border border-stone-700">
                        <button onClick={() => setMode('buy')} disabled={isLoading} className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${mode === 'buy' ? 'bg-amber-800/70 text-white' : 'hover:bg-stone-800/50 text-stone-300'} disabled:opacity-50`}>Beli</button>
                        <button onClick={() => setMode('sell')} disabled={isLoading} className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${mode === 'sell' ? 'bg-amber-800/70 text-white' : 'hover:bg-stone-800/50 text-stone-300'} disabled:opacity-50`}>Jual</button>
                    </div>

                    <div className="flex justify-end items-center text-yellow-400 mb-2" title="Emas Anda">
                        <div className="flex items-center gap-2">
                            <span className="text-sm">Emas Anda:</span>
                            <CoinIcon className="w-5 h-5" />
                            <span className="font-bold text-lg">{character.gold}</span>
                        </div>
                    </div>

                    <ul className="space-y-2 text-sm overflow-y-auto max-h-[50vh] pr-1">
                        {mode === 'buy' && (activeShop.inventory.map((item, index) => (
                            <li key={index} className="bg-stone-950/40 p-2 rounded-md border border-stone-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex-grow">
                                    <p className="font-bold text-stone-200">{item.name} (x{item.quantity})</p>
                                    <p className="text-xs text-stone-400 italic mt-1 break-words">{item.description}</p>
                                </div>
                                <button 
                                    onClick={() => onBuyItem(item, activeShop.id)} 
                                    disabled={character.gold < item.value || isLoading}
                                    className="thematic-button text-xs py-1 px-3 rounded-md flex-shrink-0 disabled:opacity-50 flex items-center gap-1"
                                >
                                    <CoinIcon className="w-3 h-3"/> {item.value}
                                </button>
                            </li>
                        )))}
                        {mode === 'buy' && activeShop.inventory.length === 0 && <li className="text-stone-500 italic text-center py-4">Toko ini kehabisan stok.</li>}
                        
                        {mode === 'sell' && (character.inventory.map((item, index) => (
                            <li key={index} className="bg-stone-950/40 p-2 rounded-md border border-stone-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex-grow">
                                    <p className="font-bold text-stone-200">{item.name} (x{item.quantity})</p>
                                     <p className="text-xs text-stone-400 italic mt-1 break-words">{item.description}</p>
                                </div>
                                <button 
                                    onClick={() => onSellItem(item, activeShop.id)}
                                    disabled={isLoading}
                                    className="bg-green-800 hover:bg-green-700 border-b-2 border-green-900 text-white text-xs py-1 px-3 rounded-md flex-shrink-0 flex items-center gap-1 disabled:bg-gray-600 disabled:border-gray-800"
                                >
                                   <CoinIcon className="w-3 h-3"/> {Math.floor(item.value / 2)}
                                </button>
                            </li>
                        )))}
                        {mode === 'sell' && character.inventory.length === 0 && <li className="text-stone-500 italic text-center py-4">Anda tidak punya apa-apa untuk dijual.</li>}
                    </ul>
                </div>
            ) : (
                 // Tampilan Daftar Toko
                availableShops.length > 0 ? (
                    <div className="space-y-2">
                        {availableShops.map(shop => (
                            <button 
                                key={shop.id}
                                onClick={() => handleSelectShop(shop.id)}
                                disabled={isLoading}
                                className="w-full text-left bg-stone-950/40 p-3 rounded-md border border-stone-700/50 hover:bg-stone-800/70 hover:border-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
