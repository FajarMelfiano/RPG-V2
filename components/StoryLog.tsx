import React, { useEffect, useRef } from 'react';
import { StoryEntry, SkillCheckResult, Scene, NPC } from '../types';
import { DiceIcon, EyeIcon } from './icons';

const getAttitudeColor = (attitude: NPC['attitude']) => {
    switch (attitude) {
        case 'Ramah': return 'text-green-400';
        case 'Netral': return 'text-stone-400';
        case 'Curiga': return 'text-yellow-400';
        case 'Bermusuhan': return 'text-red-400';
        default: return 'text-stone-500';
    }
}

const getAttitudeTooltip = (attitude: NPC['attitude']): string => {
    switch (attitude) {
        case 'Ramah': return 'NPC ini bersahabat dan kemungkinan besar akan membantu Anda.';
        case 'Netral': return 'NPC ini tidak memiliki pendapat kuat tentang Anda. Interaksi akan menentukan sikap mereka.';
        case 'Curiga': return 'NPC ini waspada terhadap Anda. Pilihlah kata-kata Anda dengan hati-hati.';
        case 'Bermusuhan': return 'NPC ini secara aktif menentang Anda dan mungkin akan menyerang.';
        default: return '';
    }
}

const NpcCard: React.FC<{ npc: NPC; onInteract: (name: string) => void; onInspect: (name: string) => void }> = ({ npc, onInteract, onInspect }) => {
    const attitudeColor = getAttitudeColor(npc.attitude);
    const attitudeTooltip = getAttitudeTooltip(npc.attitude);

    return (
        <div className="bg-stone-950/40 p-3 rounded-lg border border-stone-700/50 flex-grow basis-full md:basis-[48%] transition-all duration-300 hover:border-amber-600 hover:shadow-lg hover:shadow-amber-900/20">
            <div className="flex justify-between items-start gap-2">
                <div className="flex-grow">
                    <button onClick={() => onInteract(npc.name)} className="font-bold text-amber-300 text-left hover:underline text-glow">
                        {npc.name}
                    </button>
                    <p className="text-xs text-stone-400 italic mt-1">{npc.description}</p>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span 
                        className={`text-xs font-bold py-1 px-2 rounded-md border bg-black/30 ${attitudeColor} border-current`}
                        title={attitudeTooltip}
                    >
                        {npc.attitude}
                    </span>
                    <button 
                        onClick={() => onInspect(npc.name)}
                        className="text-stone-400 hover:text-amber-300 transition-colors"
                        title={`Periksa ${npc.name}`}
                        aria-label={`Periksa ${npc.name}`}
                    >
                        <EyeIcon className="w-5 h-5"/>
                    </button>
                </div>
            </div>
        </div>
    );
};


const StoryHeader: React.FC<{ scene: Scene; onNpcInteract: (npcName: string) => void; onNpcInspect: (npcName: string) => void; }> = ({ scene, onNpcInteract, onNpcInspect }) => (
    <div className="p-4 border-b-2 border-amber-900/50 bg-black/20 flex-shrink-0 sticky top-0 z-10 backdrop-blur-sm">
      <h2 className="text-xl font-cinzel text-amber-300 text-glow">{scene.location}</h2>
      <p className="text-sm text-stone-400 italic mb-3">{scene.description}</p>
      {scene.npcs.length > 0 && (
          <div className="flex flex-wrap gap-2">
              {scene.npcs.map((npc) => (
                  <NpcCard 
                    key={npc.name} 
                    npc={npc}
                    onInteract={onNpcInteract}
                    onInspect={onNpcInspect}
                  />
              ))}
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
                    <p className="font-bold text-amber-300 text-glow">
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
  onNpcInteract: (npcName: string) => void;
  onNpcInspect: (npcName: string) => void;
}> = ({ storyHistory, scene, onNpcInteract, onNpcInspect }) => {
  const endOfLogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfLogRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [storyHistory]);

  return (
    <div className="world-panel flex-grow h-full flex flex-col min-h-0 relative">
        <StoryHeader scene={scene} onNpcInteract={onNpcInteract} onNpcInspect={onNpcInspect}/>
        <div className="flex-grow p-4 overflow-y-auto min-h-0" style={{ scrollbarGutter: 'stable' }}>
          <div className="space-y-4">
            {storyHistory.map((entry, index) => {
              if (entry.type === 'dice_roll' && entry.rollDetails) {
                return <div key={index}>{renderSkillCheck(entry.rollDetails)}</div>;
              }

              if (entry.type === 'action') {
                return (
                  <div key={index} className="pt-4 mt-4 border-t border-amber-900/30">
                     <p className="text-amber-200 italic font-handwriting text-2xl text-center">{entry.content}</p>
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
                    <div key={index} className="bg-stone-950/30 rounded-lg p-3 border-l-2 border-amber-700">
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