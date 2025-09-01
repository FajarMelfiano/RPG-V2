

import React, { useEffect, useRef } from 'react';
import { StoryEntry, SkillCheckResult, Scene, NPC } from '../types';
import { CoinIcon } from './icons';

const NpcPill: React.FC<{ npc: NPC; onClick: (npc: NPC) => void }> = ({ npc, onClick }) => {
    return (
        <button 
            onClick={() => onClick(npc)} 
            className="flex items-center gap-2 bg-stone-950/60 py-2 px-3 rounded-lg border border-stone-700 hover:border-[var(--color-primary)] transition-all shadow-md hover:shadow-[var(--color-primary)]/10 text-left"
            title={npc.shopId ? `Lihat detail ${npc.name} (Pedagang)` : `Lihat detail ${npc.name}`}
        >
            {npc.shopId && <CoinIcon className="w-4 h-4 text-yellow-400 flex-shrink-0" />}
            <div className="overflow-hidden">
                <p className="font-bold text-sm text-stone-200 truncate">{npc.name}</p>
                <p className="text-xs text-stone-400 italic truncate">{npc.description}</p>
            </div>
        </button>
    );
};


const StoryHeader: React.FC<{ scene: Scene; onNpcClick: (npc: NPC) => void; }> = ({ scene, onNpcClick }) => (
    <div className="p-4 border-b-2 border-[var(--border-color-strong)]/50 bg-black/20 flex-shrink-0 sticky top-0 z-10 backdrop-blur-sm">
      <h2 className="text-xl font-cinzel text-[var(--color-text-header)] text-glow">{scene.location}</h2>
      <p className="text-sm text-stone-400 italic mb-4">{scene.description}</p>
      {scene.npcs.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-2">Terlihat di Sekitar:</h3>
            <div className="grid gap-2 grid-cols-[repeat(auto-fill,minmax(180px,1fr))]">
                {scene.npcs.map((npc) => (
                    <NpcPill
                      key={npc.name} 
                      npc={npc}
                      onClick={onNpcClick}
                    />
                ))}
            </div>
          </div>
      )}
    </div>
);


const renderSkillCheck = (details: SkillCheckResult) => {
    const successClass = details.success ? "text-green-400 border-green-700" : "text-red-400 border-red-700";
    return (
        <div className="bg-stone-950/50 rounded-lg p-3 my-2 text-sm border border-stone-700 shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="flex-grow w-full">
                    <p className="font-bold text-[var(--color-text-header)] text-glow">
                        Pemeriksaan {details.skill} ({details.attribute})
                    </p>
                    <p className="text-xs text-stone-400">
                        Total <span className="font-bold text-lg text-white">{details.total}</span> vs Kesulitan <span className="font-bold">{details.dc}</span>
                    </p>
                </div>
                <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                    <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 bg-stone-900 rounded-full flex items-center justify-center border-2 border-stone-600 shadow-inner overflow-hidden">
                        <span className="font-cinzel text-2xl sm:text-3xl text-stone-200 dice-animation">
                            {details.diceRoll}
                        </span>
                    </div>
                     <div className={`font-cinzel text-base sm:text-lg font-bold p-2 rounded-md border-2 bg-black/30 ${successClass}`}>
                        {details.success ? "BERHASIL" : "GAGAL"}
                    </div>
                </div>
            </div>
        </div>
    )
}


const StoryLog: React.FC<{
  storyHistory: StoryEntry[];
  scene: Scene;
  onNpcClick: (npc: NPC) => void;
}> = ({ storyHistory, scene, onNpcClick }) => {
  const endOfLogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfLogRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [storyHistory]);

  return (
    <div className="world-panel flex-grow h-full flex flex-col min-h-0 relative">
        <StoryHeader scene={scene} onNpcClick={onNpcClick}/>
        <div className="flex-grow p-4 overflow-y-auto min-h-0" style={{ scrollbarGutter: 'stable' }}>
          <div className="space-y-4">
            {storyHistory.map((entry, index) => {
              if (entry.type === 'dice_roll' && entry.rollDetails) {
                return <div key={index}>{renderSkillCheck(entry.rollDetails)}</div>;
              }

              if (entry.type === 'action') {
                return (
                  <div key={index} className="pt-4 mt-4 border-t border-[var(--border-color-strong)]/30">
                     <p className="text-[var(--color-accent)] italic font-handwriting text-2xl text-center">{entry.content}</p>
                  </div>
                );
              }
              
              if (entry.type === 'narrative') {
                return (
                    <p key={index} className="leading-relaxed text-stone-300 whitespace-pre-wrap">
                        {entry.content}
                    </p>
                );
              }
              
              if (entry.type === 'ooc_query') {
                return (
                  <div key={index} className="pt-4 mt-4 border-t border-stone-700/60">
                    <p className="text-stone-400 italic text-sm">
                      <span className="font-semibold">[OOC] Anda bertanya:</span> {entry.content}
                    </p>
                  </div>
                );
              }
              
              if (entry.type === 'ooc_response') {
                return (
                    <div key={index} className="bg-stone-950/30 rounded-lg p-3 border-l-2 border-[var(--color-primary-dark)]">
                        <p className="text-sm italic text-stone-400 whitespace-pre-wrap">
                        <span className="font-semibold">[GM]:</span> {entry.content}
                        </p>
                    </div>
                );
              }

              return null;
            })}
          </div>
          <div ref={endOfLogRef} />
        </div>
    </div>
  );
};

export default StoryLog;