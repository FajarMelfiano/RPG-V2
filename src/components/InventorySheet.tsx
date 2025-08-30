
import React from 'react';
import { Character, ItemSlot, AnyItem, EquippableItem } from '../types';
import { ChestIcon, CoinIcon } from './icons';

// A helper to format slot names
const formatSlotName = (slot: ItemSlot) => {
    return slot.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};

interface InventorySheetProps {
    character: Character;
    onEquipItem: (itemId: string) => void;
    onUnequipItem: (slot: ItemSlot) => void;
}

const InventorySheet: React.FC<InventorySheetProps> = ({ character, onEquipItem, onUnequipItem }) => {
    const { inventory, equipment, gold } = character;

    const isEquippable = (item: AnyItem): item is EquippableItem => {
        return ['Weapon', 'Armor', 'Accessory'].includes(item.type);
    }

    return (
        <div className="p-1 flex flex-col h-full">
            <h3 className="font-cinzel text-xl text-amber-300 mb-3 border-b-2 border-amber-900/50 pb-2 flex items-center gap-2 text-glow">
                <ChestIcon className="w-5 h-5" />
                <span>Inventaris</span>
            </h3>
            <div className="flex justify-between items-center bg-stone-950/40 p-2 rounded-md border border-stone-700/50 mb-4">
                <span className="text-sm font-bold text-stone-300 uppercase tracking-wider">Emas</span>
                <div className="flex items-center gap-2 text-yellow-400" title="Emas">
                    <CoinIcon className="w-5 h-5" />
                    <span className="font-bold text-lg">{gold}</span>
                </div>
            </div>

            <div className="flex-grow flex flex-col min-h-0 space-y-4">
                {/* Equipment Section */}
                <div>
                    <h4 className="font-cinzel text-lg text-amber-200 mb-2">Perlengkapan</h4>
                    <ul className="space-y-2 text-sm">
                        {/* FIX: Replaced Object.entries with Object.keys for better type safety. This resolves an error where `item` was inferred as `unknown`. */}
                        {(Object.keys(equipment) as ItemSlot[]).map((slot) => {
                            const item = equipment[slot];
                            return (
                                item && (
                                <li key={slot} className="bg-stone-950/40 p-2 rounded-md border border-stone-700/50 flex justify-between items-center gap-2">
                                    <div className="flex-grow">
                                        <p className="font-bold text-stone-200">{item.name}</p>
                                        <p className="text-xs text-stone-500">{formatSlotName(slot)}</p>
                                    </div>
                                    <button
                                        onClick={() => onUnequipItem(slot)}
                                        className="bg-stone-600 hover:bg-stone-500 text-white text-xs py-1 px-3 rounded-md"
                                    >
                                        Lepas
                                    </button>
                                </li>
                                )
                            );
                        })}
                         {Object.keys(equipment).length === 0 && <li className="text-stone-500 italic text-center py-2">Tidak ada yang dipakai.</li>}
                    </ul>
                </div>
                
                {/* Inventory Section */}
                <div>
                    <h4 className="font-cinzel text-lg text-amber-200 mb-2">Kantong</h4>
                    <ul className="space-y-2 text-sm overflow-y-auto flex-grow pr-1 max-h-[35vh]">
                        {inventory.map((invItem) => (
                            <li key={invItem.item.id} className="bg-stone-950/40 p-2 rounded-md border border-stone-700/50 flex justify-between items-center gap-2">
                                <div className="flex-grow">
                                    {/* FIX: Access item properties via invItem.item */}
                                    <span className="font-bold text-stone-200">{invItem.item.name} (x{invItem.quantity})</span>
                                    {/* FIX: Access item properties via invItem.item */}
                                    <p className="text-xs text-stone-400 italic mt-1 break-words">{invItem.item.description}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                     {/* FIX: Access item properties via invItem.item */}
                                    <span className="text-xs text-yellow-400 flex items-center gap-1"><CoinIcon className="w-3 h-3"/>{invItem.item.value}</span>
                                    {isEquippable(invItem.item) && (
                                        <button 
                                            onClick={() => onEquipItem(invItem.item.id)}
                                            className="bg-green-800 hover:bg-green-700 text-white text-xs py-1 px-3 rounded-md"
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
        </div>
    );
};

export default InventorySheet;
