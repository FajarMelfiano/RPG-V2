import React, { useState } from 'react';
import { Character, AnyItem, EquippableItem, ItemRarity, InventoryItem } from '../types';
import { ChestIcon, CoinIcon } from './icons';

const getRarityColor = (rarity: ItemRarity) => {
    switch(rarity) {
        case ItemRarity.TIDAK_BIASA: return 'text-green-400';
        case ItemRarity.LANGKA: return 'text-blue-400';
        case ItemRarity.EPIK: return 'text-purple-400';
        default: return 'text-stone-300';
    }
}

const ItemDetails: React.FC<{ item: AnyItem }> = ({ item }) => (
    <div className="p-2 mt-2 bg-black/20 rounded-md border-t border-stone-700 space-y-2 text-xs">
        <p><span className="font-bold text-stone-300">Deskripsi:</span> <span className="text-stone-400 italic">{item.description}</span></p>
        <p><span className="font-bold text-stone-300">Kegunaan:</span> <span className="text-stone-400">{item.usageNotes}</span></p>
        <div className="flex justify-between items-center pt-2 border-t border-stone-800/50">
            <p><span className="font-bold text-stone-300">Tipe:</span> <span className="text-stone-400">{item.type}</span></p>
            <p className="flex items-center gap-1"><span className="font-bold text-stone-300">Nilai Jual:</span> <CoinIcon className="w-3 h-3 text-[var(--color-accent)]"/> <span className="text-[var(--color-accent)]">{Math.floor(item.value / 2)}</span></p>
        </div>
    </div>
);


const InventorySheet: React.FC<{
    character: Character;
    onEquipItem: (itemId: string) => void;
}> = ({ character, onEquipItem }) => {
    const { inventory, gold } = character;
    const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

    const isEquippable = (item: AnyItem): item is EquippableItem => {
        return !!item.slot;
    }

    const groupedInventory = inventory.reduce((acc, invItem) => {
        const category = invItem.item.category || 'Lain-lain';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(invItem);
        return acc;
    }, {} as Record<string, InventoryItem[]>);

    return (
        <div className="p-1 flex flex-col h-full">
            <h3 className="font-cinzel text-xl text-[var(--color-text-header)] mb-3 border-b-2 border-[var(--border-color-strong)]/50 pb-2 flex items-center gap-2 text-glow">
                <ChestIcon className="w-5 h-5" />
                <span>Inventaris</span>
            </h3>
            <div className="flex justify-between items-center bg-stone-950/40 p-2 rounded-md border border-stone-700/50 mb-4">
                <span className="text-sm font-bold text-stone-300 uppercase tracking-wider">Emas</span>
                <div className="flex items-center gap-2 text-[var(--color-accent)]" title="Emas">
                    <CoinIcon className="w-5 h-5" />
                    <span className="font-bold text-lg">{gold}</span>
                </div>
            </div>

            <div className="flex-grow flex flex-col min-h-0">
                <h4 className="font-cinzel text-lg text-[var(--color-text-header)] mb-2">Kantong</h4>
                <div className="space-y-4 text-sm overflow-y-auto flex-grow pr-1">
                    {Object.keys(groupedInventory).length > 0 ? (
                        Object.entries(groupedInventory).map(([category, items]) => (
                             <details key={category} open className="group">
                                <summary className="font-bold text-stone-400 uppercase tracking-wider text-xs mb-1 pl-1 border-b border-[var(--border-color-soft)] cursor-pointer list-none group-open:mb-2 hover:text-stone-200 transition-colors">
                                    <div className="flex items-center gap-1">
                                        <svg className="w-3 h-3 transition-transform duration-200 group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                        {category}
                                    </div>
                                </summary>
                                <ul className="space-y-2 pl-2 animate-[fadeIn_0.3s_ease-out]">
                                    {items.map((invItem) => {
                                        const isExpanded = expandedItemId === invItem.item.id;
                                        return (
                                            <li key={invItem.item.id} className="bg-stone-950/40 p-2 rounded-md border border-stone-700/50">
                                                <div className="flex justify-between items-start cursor-pointer" onClick={() => setExpandedItemId(isExpanded ? null : invItem.item.id)}>
                                                    <div className="flex-grow pr-2">
                                                        <p className={`font-bold ${getRarityColor(invItem.item.rarity)}`}>{invItem.item.name} (x{invItem.quantity})</p>
                                                    </div>
                                                    <div className="flex items-center gap-1 flex-shrink-0 text-xs text-[var(--color-accent)]" title="Nilai Beli">
                                                        <CoinIcon className="w-3 h-3"/>
                                                        <span>{invItem.item.value}</span>
                                                    </div>
                                                </div>
                                                
                                                {isExpanded && (
                                                    <div className="animate-[fadeIn_0.5s_ease-out]">
                                                        <ItemDetails item={invItem.item} />
                                                        <div className="flex justify-end items-center mt-2">
                                                            {isEquippable(invItem.item) && (
                                                                <button 
                                                                    onClick={() => onEquipItem(invItem.item.id)}
                                                                    className="bg-green-800 hover:bg-green-700 text-white text-xs py-1 px-3 rounded-md border-b-2 border-green-900 transition-colors"
                                                                >
                                                                    Pakai
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </details>
                        ))
                    ) : (
                        <div className="text-stone-500 italic text-center py-4">Kantongmu kosong.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InventorySheet;