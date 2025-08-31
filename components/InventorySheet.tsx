import React from 'react';
import { Character, AnyItem, EquippableItem, ItemRarity } from '../types';
import { ChestIcon, CoinIcon } from './icons';

interface InventorySheetProps {
    character: Character;
    onEquipItem: (itemId: string) => void;
}

const getRarityColor = (rarity: ItemRarity) => {
    switch(rarity) {
        case ItemRarity.TIDAK_BIASA: return 'text-green-400';
        case ItemRarity.LANGKA: return 'text-blue-400';
        case ItemRarity.EPIK: return 'text-purple-400';
        default: return 'text-stone-300';
    }
}

const InventorySheet: React.FC<InventorySheetProps> = ({ character, onEquipItem }) => {
    const { inventory, gold } = character;

    const isEquippable = (item: AnyItem): item is EquippableItem => {
        return !!item.slot;
    }

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
                <ul className="space-y-2 text-sm overflow-y-auto flex-grow pr-1">
                    {inventory.map((invItem) => (
                        <li key={invItem.item.id} className="bg-stone-950/40 p-2 rounded-md border border-stone-700/50 flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                                <div className="flex-grow">
                                    <p className={`font-bold ${getRarityColor(invItem.item.rarity)}`}>{invItem.item.name} (x{invItem.quantity})</p>
                                    <p className="text-xs text-stone-400 italic mt-1 break-words">{invItem.item.description}</p>
                                </div>
                                <span className="text-xs text-[var(--color-accent)] flex items-center gap-1 flex-shrink-0 ml-2" title="Nilai"><CoinIcon className="w-3 h-3"/>{invItem.item.value}</span>
                            </div>
                            <div className="flex justify-end items-center mt-1">
                                {isEquippable(invItem.item) && (
                                    <button 
                                        onClick={() => onEquipItem(invItem.item.id)}
                                        className="bg-green-800 hover:bg-green-700 text-white text-xs py-1 px-3 rounded-md border-b-2 border-green-900"
                                    >
                                        Pakai
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                    {inventory.length === 0 && <li className="text-stone-500 italic text-center py-4">Kantongmu kosong.</li>}
                </ul>
            </div>
        </div>
    );
};

export default InventorySheet;