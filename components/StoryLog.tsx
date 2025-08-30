import React, { useEffect, useRef, useState } from 'react';
import { StoryEntry, SkillCheckResult, Scene, NPC } from '../types';
import { DiceIcon } from './icons';

// Merged SceneDisplay Logic
const getAttitudeColor = (attitude: NPC['attitude']) => {
    switch (attitude) {
        case 'Ramah': return 'text-green-400';
        case 'Netral': return 'text-stone-400';
        case 'Curiga': return 'text-yellow-400';
        case 'Bermusuhan': return 'text-red-400';
        default: return 'text-stone-500';
    }
}

const StoryHeader: React.FC<{ scene: Scene; onNpcInteract: (npcName: string) => void; }> = ({ scene, onNpcInteract }) => (
    <div className="p-4 border-b-2 border-amber-900/50 bg-black/20 flex-shrink-0 sticky top-0 z-10 backdrop-blur-sm">
      <h2 className="text-xl font-cinzel text-amber-300 text-glow">{scene.location}</h2>
      <p className="text-sm text-stone-400 italic mb-3">{scene.description}</p>
      {scene.npcs.length > 0 && (
          <div className="flex flex-wrap gap-2">
              {scene.npcs.map((npc) => (
                  <button 
                    key={npc.name} 
                    onClick={() => onNpcInteract(npc.name)}
                    className={`text-xs py-1 px-2 rounded-full border transition-all ${getAttitudeColor(npc.attitude)} border-current bg-stone-950/50 hover:bg-stone-900 hover:shadow-lg`}
                    title={npc.description}
                  >
                    {npc.name}
                  </button>
              ))}
          </div>
      )}
    </div>
);


const renderSkillCheck = (details: SkillCheckResult) => {
    const [rolled, setRolled] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => setRolled(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const successClass = details.success ? "text-green-400 border-green-700" : "text-red-400 border-red-700";
    return (
        <div className="bg-stone-950/50 rounded-lg p-3 my-2 text-sm border border-stone-700 shadow-lg">
            <div className="flex justify-between items-center gap-4">
                <div className="flex-grow">
                    <p className="font-bold text-amber-300 text-glow">
                        Pemeriksaan {details.skill} ({details.attribute})
                    </p>
                    <p className="text-xs text-stone-400">
                        Total <span className="font-bold text-lg text-white">{details.total}</span> vs Kesulitan <span className="font-bold">{details.dc}</span>
                    </p>
                </div>
                <div className="flex-shrink-0 w-16 h-16 bg-stone-900 rounded-full flex items-center justify-center border-2 border-stone-600 shadow-inner">
                    <span className={`font-cinzel text-3xl text-stone-200 transition-all duration-500 ease-out ${rolled ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                        {details.diceRoll}
                    </span>
                </div>
                 <div className={`font-cinzel text-lg font-bold p-2 rounded-md border-2 bg-black/30 ${successClass}`}>
                    {details.success ? "BERHASIL" : "GAGAL"}
                </div>
            </div>
        </div>
    )
}


const StoryLog: React.FC<{
  storyHistory: StoryEntry[];
  scene: Scene;
  onNpcInteract: (npcName: string) => void;
}> = ({ storyHistory, scene, onNpcInteract }) => {
  const endOfLogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfLogRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [storyHistory]);

  return (
    <div className="world-panel flex-grow h-full flex flex-col min-h-0 relative">
        <StoryHeader scene={scene} onNpcInteract={onNpcInteract}/>
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