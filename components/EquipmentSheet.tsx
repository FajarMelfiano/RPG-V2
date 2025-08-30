
import React from 'react';
import { Equipment, ItemSlot, EquippableItem } from '../types';
import { HelmetIcon, ShirtIcon, ShieldIcon, SwordIcon, ChevronsRightIcon } from './icons';

interface EquipmentSheetProps {
    equipment: Equipment;
    onUnequipItem: (slot: ItemSlot) => void;
}

const formatSlotName = (slot: ItemSlot) => {
    const names: Record<ItemSlot, string> = {
        [ItemSlot.MAIN_HAND]: 'Tangan Utama',
        [ItemSlot.OFF_HAND]: 'Tangan Samping',
        [ItemSlot.HEAD]: 'Kepala',
        [ItemSlot.CHEST]: 'Dada',
        [ItemSlot.LEGS]: 'Kaki',
        [ItemSlot.FEET]: 'Alas Kaki',
        [ItemSlot.NECK]: 'Leher',
        [ItemSlot.RING]: 'Cincin',
    };
    return names[slot] || slot;
};

const SlotDisplay: React.FC<{
    slot: ItemSlot;
    item?: EquippableItem;
    onUnequip: (slot: ItemSlot) => void;
}> = ({ slot, item, onUnequip }) => {
    return (
        <div className="flex items-center justify-between bg-stone-950/40 p-2 rounded-md border border-stone-700/50 min-h-[50px]">
            <span className="text-sm font-bold text-stone-400 w-24">{formatSlotName(slot)}</span>
            {item ? (
                <div className="flex-grow flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-stone-200">{item.name}</span>
                    <button
                        onClick={() => onUnequip(slot)}
                        className="bg-stone-600 hover:bg-stone-500 text-white text-xs py-1 px-3 rounded-md flex-shrink-0"
                    >
                        Lepas
                    </button>
                </div>
            ) : (
                <span className="text-sm text-stone-500 italic">Kosong</span>
            )}
        </div>
    );
};

const EquipmentSheet: React.FC<EquipmentSheetProps> = ({ equipment, onUnequipItem }) => {
    const slots: ItemSlot[] = [
        ItemSlot.MAIN_HAND, ItemSlot.OFF_HAND,
        ItemSlot.HEAD, ItemSlot.CHEST,
        ItemSlot.LEGS, ItemSlot.FEET,
        ItemSlot.NECK, ItemSlot.RING
    ];

    return (
        <div className="p-1">
            <h3 className="font-cinzel text-xl text-amber-300 mb-3 border-b-2 border-amber-900/50 pb-2 flex items-center gap-2 text-glow">
                <HelmetIcon className="w-5 h-5" />
                <span>Perlengkapan</span>
            </h3>
            <div className="space-y-2">
                {slots.map(slot => (
                    <SlotDisplay
                        key={slot}
                        slot={slot}
                        item={equipment[slot]}
                        onUnequip={onUnequipItem}
                    />
                ))}
            </div>
        </div>
    );
};

export default EquipmentSheet;