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
        <div className="bg-slate-800/50 p-3 rounded-md">
            <div className="flex justify-between items-center mb-2">
                <p className="font-bold text-slate-200">{name}</p>
                <p className="text-xs text-slate-400">{characterClass}</p>
            </div>
            
            <div className="flex items-center text-xs mb-1">
                <HeartIcon className="w-3 h-3 mr-1.5 text-red-400 flex-shrink-0" />
                <div className="w-full bg-slate-700 rounded-full h-2 flex-grow">
                    <div className="bg-red-600 h-2 rounded-full" style={{ width: `${healthPercentage}%` }} title={`${stats.health} / ${stats.maxHealth}`}></div>
                </div>
            </div>

            {stats.maxMana > 0 && (
                <div className="flex items-center text-xs">
                    <ManaIcon className="w-3 h-3 mr-1.5 text-blue-400 flex-shrink-0" />
                    <div className="w-full bg-slate-700 rounded-full h-2 flex-grow">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${manaPercentage}%` }} title={`${stats.mana} / ${stats.maxMana}`}></div>
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
        <div className="bg-slate-800/70 rounded-xl shadow-lg border border-slate-700 backdrop-blur-sm p-4 flex flex-col">
            <h3 className="font-cinzel text-xl text-amber-300 mb-3 border-b-2 border-slate-700 pb-2 flex items-center gap-2">
                <UsersIcon className="w-5 h-5" />
                <span>Party</span>
            </h3>
            <div className="space-y-2">
                {party.map((companion) => (
                    <CompanionCard key={companion.id} companion={companion} />
                ))}
            </div>
        </div>
    );
};

export default PartySheet;