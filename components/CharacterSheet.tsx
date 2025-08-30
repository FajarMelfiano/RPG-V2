import React from 'react';
import { Character } from '../types';
import { SwordIcon, ShieldIcon, BookIcon, CoinIcon, HeartIcon, ManaIcon, ReputationIcon } from './icons';

interface StatDisplayProps {
    label: string;
    value: number | string;
    icon?: React.ReactNode;
}

const StatDisplay: React.FC<StatDisplayProps> = ({ label, value, icon }) => (
  <div className="flex justify-between items-center bg-slate-800/50 p-2 rounded-md">
    <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">{label}</span>
    </div>
    <span className="text-lg font-bold text-amber-300">{value}</span>
  </div>
);


const CharacterSheet: React.FC<{ character: Character }> = ({ character }) => {
    const { name, race, characterClass, stats, inventory, backstory, reputation, gold } = character;
    const healthPercentage = stats.maxHealth > 0 ? (stats.health / stats.maxHealth) * 100 : 0;
    const manaPercentage = stats.maxMana > 0 ? (stats.mana / stats.maxMana) * 100 : 0;

    return (
    <div className="bg-slate-800/70 rounded-xl shadow-lg border border-slate-700 backdrop-blur-sm p-4 flex flex-col">
      <div className="text-center mb-4">
        <h2 className="text-3xl font-cinzel text-amber-300">{name}</h2>
        <p className="text-slate-400">{`Level ${stats.level} ${race} ${characterClass}`}</p>
        <div className="flex items-center justify-center gap-4 mt-2">
            <div className="flex items-center gap-2 text-amber-200" title="Reputasi">
                <ReputationIcon className="w-5 h-5" />
                <span className="font-bold text-lg">{reputation}</span>
            </div>
            <div className="flex items-center gap-2 text-yellow-400" title="Emas">
                <CoinIcon className="w-5 h-5" />
                <span className="font-bold text-lg">{gold}</span>
            </div>
        </div>
      </div>

      <div className="mb-2">
        <div className="flex justify-between items-center mb-1 text-sm">
            <span className="font-bold text-red-400 flex items-center gap-1"><HeartIcon className="w-4 h-4" /> Kesehatan</span>
            <span>{stats.health} / {stats.maxHealth}</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2.5">
          <div className="bg-red-600 h-2.5 rounded-full" style={{ width: `${healthPercentage}%` }}></div>
        </div>
      </div>
      
      {stats.maxMana > 0 && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1 text-sm">
                <span className="font-bold text-blue-400 flex items-center gap-1"><ManaIcon className="w-4 h-4" /> Mana</span>
                <span>{stats.mana} / {stats.maxMana}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2.5">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${manaPercentage}%` }}></div>
            </div>
          </div>
      )}

      <div className="grid grid-cols-2 gap-2 mb-4">
        <StatDisplay label="KEK" value={stats.strength} icon={<SwordIcon className="w-4 h-4 text-red-400" />} />
        <StatDisplay label="TKS" value={stats.dexterity} icon={<ShieldIcon className="w-4 h-4 text-green-400" />} />
        <StatDisplay label="KON" value={stats.constitution} icon={<HeartIcon className="w-4 h-4 text-yellow-400" />} />
        <StatDisplay label="KCR" value={stats.intelligence} icon={<BookIcon className="w-4 h-4 text-blue-400" />} />
        <StatDisplay label="KBJ" value={stats.wisdom} icon={<BookIcon className="w-4 h-4 text-purple-400" />} />
        <StatDisplay label="KRM" value={stats.charisma} icon={<CoinIcon className="w-4 h-4 text-amber-400" />} />
      </div>
      
      <div className="mb-4">
        <h3 className="font-cinzel text-xl text-amber-300 mb-2 border-b-2 border-slate-700 pb-1">Latar Belakang</h3>
        <p className="text-sm text-slate-300 italic">
            {backstory}
        </p>
      </div>
      
      <div>
        <h3 className="font-cinzel text-xl text-amber-300 mb-2 border-b-2 border-slate-700 pb-1">Inventaris</h3>
        <ul className="space-y-2 text-sm">
          {inventory.map((item, index) => (
            <li key={index} className="bg-slate-800/50 p-2 rounded-md">
                <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-200">{item.name} (x{item.quantity})</span>
                    <span className="text-xs text-yellow-400 flex items-center gap-1"><CoinIcon className="w-3 h-3"/>{item.value}</span>
                </div>
              <div className="text-xs text-slate-400 italic mt-1">{item.description}</div>
            </li>
          ))}
           {inventory.length === 0 && <li className="text-slate-500 italic">Kantongmu kosong.</li>}
        </ul>
      </div>
    </div>
    );
};

export default CharacterSheet;