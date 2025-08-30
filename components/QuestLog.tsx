import React from 'react';
import { Quest, WorldEvent } from '../types';
import { ScrollIcon } from './icons';

const QuestLog: React.FC<{ quests: Quest[]; worldEvents: WorldEvent[]; }> = ({ quests, worldEvents }) => {
    const activeQuests = quests.filter(q => q.status === 'Aktif');
    const completedQuests = quests.filter(q => q.status === 'Selesai');
    const sortedWorldEvents = [...worldEvents].sort((a, b) => b.turn - a.turn);

    const getEventTypeColor = (type: WorldEvent['type']) => {
        switch (type) {
            case 'Sejarah': return 'border-amber-700 text-amber-300';
            case 'Berita': return 'border-sky-700 text-sky-300';
            case 'Ramalan': return 'border-purple-700 text-purple-300';
            default: return 'border-stone-700 text-stone-300';
        }
    }

    return (
        <div className="p-1 flex flex-col h-full">
            <h3 className="font-cinzel text-xl text-amber-300 mb-3 border-b-2 border-amber-900/50 pb-2 flex items-center gap-2 text-glow">
                <ScrollIcon className="w-5 h-5" />
                <span>Misi & Tawarikh</span>
            </h3>
            <div className="flex-grow flex flex-col min-h-0 overflow-y-auto pr-1 space-y-4">
                
                <div>
                    <h4 className="font-cinzel text-lg text-amber-200 mb-2">Misi Aktif</h4>
                    <ul className="space-y-2 text-sm">
                        {activeQuests.map(quest => (
                            <li key={quest.id} className="bg-stone-950/40 p-2 rounded-md border border-stone-700">
                                <p className="font-bold text-stone-200">{quest.title}</p>
                                <p className="text-xs text-stone-400 italic mt-1">{quest.description}</p>
                            </li>
                        ))}
                        {activeQuests.length === 0 && <li className="text-stone-500 italic text-center py-2">Tidak ada misi aktif.</li>}
                    </ul>
                </div>
                
                <div>
                     <h4 className="font-cinzel text-lg text-amber-200 mb-2">Tawarikh Dunia</h4>
                     <ul className="space-y-2 text-sm">
                        {sortedWorldEvents.map(event => (
                             <li key={event.id} className={`bg-stone-950/40 p-2 rounded-md border-l-4 ${getEventTypeColor(event.type)}`}>
                                <div className="flex justify-between items-center">
                                    <p className={`font-bold text-sm`}>{event.title} <span className="text-xs font-normal text-stone-500">({event.type})</span></p>
                                    <p className="text-xs text-stone-600">Giliran {event.turn}</p>
                                </div>
                                <p className="text-xs text-stone-400 italic mt-1">{event.description}</p>
                            </li>
                        ))}
                        {worldEvents.length === 0 && <li className="text-stone-500 italic text-center py-2">Dunia masih sunyi...</li>}
                     </ul>
                </div>
                
                {completedQuests.length > 0 && (
                    <div>
                        <details>
                            <summary className="font-cinzel text-lg text-stone-500 hover:text-stone-400 cursor-pointer">Misi Selesai</summary>
                            <ul className="space-y-2 text-sm mt-2">
                                {completedQuests.map(quest => (
                                    <li key={quest.id} className="bg-black/30 p-2 rounded-md border border-stone-800 opacity-70">
                                        <p className="font-bold text-stone-400 line-through">{quest.title}</p>
                                        <p className="text-xs text-stone-500 italic mt-1">{quest.description}</p>
                                    </li>
                                ))}
                            </ul>
                        </details>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuestLog;