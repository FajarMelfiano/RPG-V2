import React from 'react';
import { Character } from '../types';
import { HeartIcon, ManaIcon, UsersIcon } from './icons';

interface CompanionCardProps {
    companion: Character;
}

const CompanionCard: React.FC<CompanionCardProps> = ({ companion }) => {
    const { name, characterClass, stats } = companion;
    const healthPercentage = stats.maxHealth > 0 ? (stats.health / stats.maxHealth) * 100 : 0;
    const manaPercentage = stats.maxMana > 0 ? (stats.mana / stats.maxMana) * 100 : 0;

    return (
        <div className="bg-stone-950/40 p-3 rounded-md border border-stone-700/50">
            <div className="flex justify-between items-center mb-2">
                <p className="font-bold text-stone-200">{name}</p>
                <p className="text-xs text-stone-400">{characterClass}</p>
            </div>
            
            <div className="flex items-center text-xs mb-1">
                <HeartIcon className="w-3 h-3 mr-1.5 text-red-500 flex-shrink-0" />
                <div className="w-full bg-black/50 rounded-full h-2 flex-grow shadow-inner border border-stone-900">
                    <div className="bg-gradient-to-r from-red-800 to-red-500 h-full rounded-full" style={{ width: `${healthPercentage}%` }} title={`${stats.health} / ${stats.maxHealth}`}></div>
                </div>
            </div>

            {stats.maxMana > 0 && (
                <div className="flex items-center text-xs">
                    <ManaIcon className="w-3 h-3 mr-1.5 text-blue-500 flex-shrink-0" />
                    <div className="w-full bg-black/50 rounded-full h-2 flex-grow shadow-inner border border-stone-900">
                        <div className="bg-gradient-to-r from-blue-800 to-blue-500 h-full rounded-full" style={{ width: `${manaPercentage}%` }} title={`${stats.mana} / ${stats.maxMana}`}></div>
                    </div>
                </div>
            )}
        </div>
    );
};


const PartySheet: React.FC<{ party: Character[] }> = ({ party }) => {
    if (party.length === 0) {
        return null;
    }

    return (
        <div className="p-1">
            <h3 className="font-cinzel text-xl text-amber-300 mb-3 border-b-2 border-amber-900/50 pb-2 flex items-center gap-2 text-glow">
                <UsersIcon className="w-5 h-5" />
                <span>Party</span>
            </h3>
            <div className="space-y-2 overflow-y-auto pr-1">
                {party.map((companion) => (
                    <CompanionCard key={companion.id} companion={companion} />
                ))}
            </div>
        </div>
    );
};

export default PartySheet;