import React from 'react';
import { Character } from '../types';
import { ChestIcon, CoinIcon } from './icons';

const InventorySheet: React.FC<{ character: Character }> = ({ character }) => {
    const { inventory, gold } = character;

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
            <div className="flex-grow flex flex-col min-h-0">
                <ul className="space-y-2 text-sm overflow-y-auto flex-grow pr-1">
                    {inventory.map((item, index) => (
                        <li key={index} className="bg-stone-950/40 p-2 rounded-md border border-stone-700/50">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-stone-200">{item.name} (x{item.quantity})</span>
                                <span className="text-xs text-yellow-400 flex items-center gap-1"><CoinIcon className="w-3 h-3"/>{item.value}</span>
                            </div>
                            <p className="text-xs text-stone-400 italic mt-1 break-words">{item.description}</p>
                        </li>
                    ))}
                    {inventory.length === 0 && <li className="text-stone-500 italic text-center py-4">Kantongmu kosong.</li>}
                </ul>
            </div>
        </div>
    );
};

export default InventorySheet;