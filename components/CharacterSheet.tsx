import React from 'react';
import { Character } from '../types';
import { SwordIcon, ShieldIcon, BookIcon, HeartIcon, ManaIcon, ReputationIcon, CoinIcon, SparklesIcon, ChevronsRightIcon } from './icons';

interface StatDisplayProps {
    label: string;
    value: number | string;
    icon?: React.ReactNode;
}

const StatDisplay: React.FC<StatDisplayProps> = ({ label, value, icon }) => (
  <div className="flex justify-between items-center bg-stone-950/40 py-1 px-2 rounded flex-1 min-w-[120px]">
    <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-bold text-stone-300">{label}</span>
    </div>
    <span className="text-lg font-bold text-[var(--color-primary)] font-cinzel">{value}</span>
  </div>
);

const DecorativeSeparator: React.FC = () => (
    <div className="w-full h-[1px] my-4 bg-gradient-to-r from-transparent via-[var(--border-color-strong)] to-transparent" />
);


const CharacterSheet: React.FC<{ character: Character }> = ({ character }) => {
    const { name, race, characterClass, stats, backstory, gold, age, height, appearance } = character;
    const healthPercentage = stats.maxHealth > 0 ? (stats.health / stats.maxHealth) * 100 : 0;
    const manaPercentage = stats.maxMana > 0 ? (stats.mana / stats.maxMana) * 100 : 0;
    
    const getModifier = (score: number) => {
        const modifier = Math.floor((score - 10) / 2);
        return modifier >= 0 ? `+${modifier}` : `${modifier}`;
    };

    const dexModifierValue = Math.floor((stats.dexterity - 10) / 2);

    return (
    <div className="p-1">
      <div className="text-center mb-4">
        <h2 className="text-3xl font-cinzel text-[var(--color-text-header)] text-glow">{name}</h2>
        <p className="text-stone-400">{`Level ${stats.level} ${race} ${characterClass}`}</p>
        <p className="text-sm text-stone-500">{`${age ? `${age} tahun` : 'tidak diketahui'}, Tinggi ${height || 'tidak diketahui'}`}</p>
        <div className="inline-flex items-center gap-2 mt-2 bg-stone-950/50 px-3 py-1 rounded-full border border-stone-700">
            <CoinIcon className="w-5 h-5 text-[var(--color-accent)]" />
            <span className="font-bold text-lg text-stone-200">{gold}</span>
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
      
      <DecorativeSeparator />
      
      <div>
        <h3 className="font-cinzel text-xl text-[var(--color-text-header)] mb-3 text-glow">Penampilan & Latar Belakang</h3>
        <div className="bg-stone-950/30 rounded-md p-3 border border-stone-700 space-y-3 text-sm italic text-stone-300">
            <p>{appearance}</p>
            <p>{backstory}</p>
        </div>
      </div>

      <DecorativeSeparator />

      <h3 className="font-cinzel text-xl text-[var(--color-text-header)] mb-3 text-glow">Atribut Utama</h3>
      <div className="flex flex-wrap gap-2 mb-4">
        <StatDisplay label="KEK" value={`${stats.strength} (${getModifier(stats.strength)})`} icon={<SwordIcon className="w-4 h-4 text-red-400" />} />
        <StatDisplay label="TKS" value={`${stats.dexterity} (${getModifier(stats.dexterity)})`} icon={<ShieldIcon className="w-4 h-4 text-green-400" />} />
        <StatDisplay label="KON" value={`${stats.constitution} (${getModifier(stats.constitution)})`} icon={<HeartIcon className="w-4 h-4 text-yellow-400" />} />
        <StatDisplay label="KCR" value={`${stats.intelligence} (${getModifier(stats.intelligence)})`} icon={<BookIcon className="w-4 h-4 text-blue-400" />} />
        <StatDisplay label="KBJ" value={`${stats.wisdom} (${getModifier(stats.wisdom)})`} icon={<BookIcon className="w-4 h-4 text-purple-400" />} />
        <StatDisplay label="KRM" value={`${stats.charisma} (${getModifier(stats.charisma)})`} icon={<ReputationIcon className="w-4 h-4 text-pink-400" />} />
      </div>

      <DecorativeSeparator />

      <h3 className="font-cinzel text-xl text-[var(--color-text-header)] mb-3 text-glow">Statistik Tempur</h3>
      <div className="flex flex-wrap gap-2 mb-4">
        <StatDisplay label="Armor Class" value={10 + dexModifierValue} icon={<ShieldIcon className="w-4 h-4 text-stone-400" />} />
        <StatDisplay label="Inisiatif" value={getModifier(stats.dexterity)} icon={<SparklesIcon className="w-4 h-4 text-yellow-400" />} />
        <StatDisplay label="Srgn. Melee" value={getModifier(stats.strength)} icon={<SwordIcon className="w-4 h-4 text-red-500" />} />
        <StatDisplay label="Srgn. Jauh" value={getModifier(stats.dexterity)} icon={<ChevronsRightIcon className="w-4 h-4 text-green-500" />} />
      </div>

    </div>
    );
};

export default CharacterSheet;