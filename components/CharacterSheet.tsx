import React from 'react';
import { Character } from '../types';
import { SwordIcon, ShieldIcon, BookIcon, HeartIcon, ManaIcon, ReputationIcon } from './icons';

interface StatDisplayProps {
    label: string;
    value: number | string;
    icon?: React.ReactNode;
}

const StatDisplay: React.FC<StatDisplayProps> = ({ label, value, icon }) => (
  <div className="flex justify-between items-center bg-stone-950/40 py-1 px-2 rounded">
    <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-bold text-stone-300">{label}</span>
    </div>
    <span className="text-lg font-bold text-amber-300 font-cinzel">{value}</span>
  </div>
);

const DecorativeSeparator: React.FC = () => (
    <div className="w-full h-[1px] my-4 bg-gradient-to-r from-transparent via-amber-900 to-transparent" />
);


const CharacterSheet: React.FC<{ character: Character }> = ({ character }) => {
    const { name, race, characterClass, stats, backstory, reputation } = character;
    const healthPercentage = stats.maxHealth > 0 ? (stats.health / stats.maxHealth) * 100 : 0;
    const manaPercentage = stats.maxMana > 0 ? (stats.mana / stats.maxMana) * 100 : 0;

    return (
    <div className="p-1">
      <div className="text-center mb-4">
        <h2 className="text-3xl font-cinzel text-amber-300 text-glow">{name}</h2>
        <p className="text-stone-400">{`Level ${stats.level} ${race} ${characterClass}`}</p>
        <div className="inline-flex items-center gap-2 mt-2 bg-stone-950/50 px-3 py-1 rounded-full border border-stone-700" title="Reputasi">
            <ReputationIcon className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-lg text-stone-200">{reputation}</span>
        </div>
      </div>

      <div className="mb-2">
        <div className="flex justify-between items-center mb-1 text-xs text-stone-300">
            <span className="font-bold flex items-center gap-1"><HeartIcon className="w-4 h-4 text-red-500" /> Kesehatan</span>
            <span>{stats.health} / {stats.maxHealth}</span>
        </div>
        <div className="w-full bg-black/50 rounded-full h-2.5 shadow-inner border border-stone-900">
          <div className="bg-gradient-to-r from-red-800 to-red-500 h-full rounded-full" style={{ width: `${healthPercentage}%` }}></div>
        </div>
      </div>
      
      {stats.maxMana > 0 && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1 text-xs text-stone-300">
                <span className="font-bold flex items-center gap-1"><ManaIcon className="w-4 h-4 text-blue-500" /> Mana</span>
                <span>{stats.mana} / {stats.maxMana}</span>
            </div>
            <div className="w-full bg-black/50 rounded-full h-2.5 shadow-inner border border-stone-900">
              <div className="bg-gradient-to-r from-blue-800 to-blue-500 h-full rounded-full" style={{ width: `${manaPercentage}%` }}></div>
            </div>
          </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
        <StatDisplay label="KEK" value={stats.strength} icon={<SwordIcon className="w-4 h-4 text-red-400" />} />
        <StatDisplay label="TKS" value={stats.dexterity} icon={<ShieldIcon className="w-4 h-4 text-green-400" />} />
        <StatDisplay label="KON" value={stats.constitution} icon={<HeartIcon className="w-4 h-4 text-yellow-400" />} />
        <StatDisplay label="KCR" value={stats.intelligence} icon={<BookIcon className="w-4 h-4 text-blue-400" />} />
        <StatDisplay label="KBJ" value={stats.wisdom} icon={<BookIcon className="w-4 h-4 text-purple-400" />} />
        <StatDisplay label="KRM" value={stats.charisma} icon={<ShieldIcon className="w-4 h-4 text-amber-400 opacity-0" />} /> 
      </div>
      <div className="col-span-2 sm:col-span-1 sm:col-start-2">
         <StatDisplay label="KRM" value={stats.charisma} icon={<ReputationIcon className="w-4 h-4 text-amber-400" />} />
      </div>
      
      
      <DecorativeSeparator />
      
      <div className="flex-grow min-h-0">
        <h3 className="font-cinzel text-xl text-amber-300 mb-2 text-glow">Latar Belakang</h3>
        <div className="bg-stone-950/30 rounded-md p-3 border border-stone-700">
            <p className="text-sm italic text-stone-300">
                {backstory}
            </p>
        </div>
      </div>
    </div>
    );
};

export default CharacterSheet;