import React, { useEffect, useRef } from 'react';
import { StoryEntry, SkillCheckResult } from '../types';
import { DiceIcon } from './icons';

interface StoryLogProps {
  storyHistory: StoryEntry[];
}

const renderSkillCheck = (details: SkillCheckResult) => {
    const successClass = details.success ? "text-green-400" : "text-red-400";
    return (
        <div className="border border-slate-600 bg-slate-900/50 rounded-lg p-3 my-2 text-sm">
            <div className="flex items-center gap-2 font-bold mb-2 text-amber-300">
                <DiceIcon className="w-5 h-5"/>
                <span>Pemeriksaan Keterampilan: {details.skill} ({details.attribute})</span>
            </div>
            <div className="flex justify-between items-center">
                <p>Lemparan Dadu (d20): <span className="font-bold">{details.diceRoll}</span> + <span className="font-bold">{details.bonus}</span> (Bonus) = <span className="font-bold text-lg text-white">{details.total}</span></p>
                <p>Tingkat Kesulitan (DC): <span className="font-bold">{details.dc}</span></p>
            </div>
            <div className={`mt-2 text-center font-bold text-lg ${successClass}`}>
                {details.success ? "BERHASIL" : "GAGAL"}
            </div>
        </div>
    )
}


const StoryLog: React.FC<StoryLogProps> = ({ storyHistory }) => {
  const endOfLogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfLogRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [storyHistory]);

  return (
    <div className="flex-grow p-4 overflow-y-auto min-h-0" style={{ scrollbarGutter: 'stable' }}>
      <div className="space-y-4">
        {storyHistory.map((entry, index) => {
          if (entry.type === 'dice_roll' && entry.rollDetails) {
            return <div key={index}>{renderSkillCheck(entry.rollDetails)}</div>;
          }

          if (entry.type === 'action') {
            return (
              <div key={index} className="pt-4 mt-4 border-t border-slate-700/60">
                <div className="flex gap-3 items-start">
                  <span className="font-bold text-xl text-amber-400 flex-shrink-0 -mt-1"> &gt; </span>
                  <p className="text-amber-300 font-semibold">{entry.content}</p>
                </div>
              </div>
            );
          }
          
          if (entry.type === 'narrative') {
            return (
                <p key={index} className="leading-relaxed text-slate-300 italic whitespace-pre-wrap">
                    {entry.content}
                </p>
            );
          }

          return null;
        })}
      </div>
      <div ref={endOfLogRef} />
    </div>
  );
};

export default StoryLog;