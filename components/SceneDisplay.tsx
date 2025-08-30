import React from 'react';
import { Scene, NPC } from '../types';
import { CoinIcon } from './icons';

interface SceneDisplayProps {
  scene: Scene;
  onNpcInteract: (npcName: string) => void;
}

const getAttitudeColor = (attitude: NPC['attitude']) => {
    switch (attitude) {
        case 'Ramah': return 'text-green-400';
        case 'Netral': return 'text-slate-400';
        case 'Curiga': return 'text-yellow-400';
        case 'Bermusuhan': return 'text-red-400';
        default: return 'text-slate-500';
    }
}

const SceneDisplay: React.FC<SceneDisplayProps> = ({ scene, onNpcInteract }) => {
  return (
    <div className="p-4 border-b border-slate-700 bg-slate-900/50 rounded-t-xl overflow-y-auto flex-shrink-0">
      <h2 className="text-xl font-cinzel text-amber-300">{scene.location}</h2>
      <p className="text-sm text-slate-400 italic mb-3">{scene.description}</p>
      {scene.npcs.length > 0 && (
          <div>
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-1">Terlihat:</h3>
              <ul className="text-sm text-slate-300 space-y-2">
                  {scene.npcs.map((npc, index) => (
                      <li key={index} className="bg-slate-800/50 p-2 rounded-md">
                          <div className="flex justify-between items-start">
                              <div>
                                <button 
                                  onClick={() => onNpcInteract(npc.name)}
                                  className="font-bold text-amber-300 hover:text-amber-200 hover:underline transition-colors text-left"
                                >
                                  {npc.name}
                                </button> - <i className="text-slate-400 text-xs">{npc.description}</i>
                              </div>
                              <span className={`font-bold text-xs py-0.5 px-1.5 rounded-full bg-slate-900 ${getAttitudeColor(npc.attitude)}`}>{npc.attitude}</span>
                          </div>
                          {npc.inventory && npc.inventory.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-slate-700">
                                <h4 className="text-xs font-bold text-amber-300 mb-1">Barang Dagangan:</h4>
                                <ul className="text-xs grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                                    {npc.inventory.map(item => (
                                        <li key={item.name} className="flex justify-between">
                                            <span>{item.name} (x{item.quantity})</span>
                                            <span className="text-yellow-400 flex items-center gap-1">{item.value} <CoinIcon className="w-3 h-3" /></span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                          )}
                      </li>
                  ))}
              </ul>
          </div>
      )}
    </div>
  );
};

export default SceneDisplay;