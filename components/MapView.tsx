

import React from 'react';
import { WorldMap, MapNode } from '../types';
import { MapIcon, ChevronsRightIcon } from './icons';

interface MapViewProps {
    worldMap: WorldMap;
    currentLocationName: string;
}

const MapView: React.FC<MapViewProps> = ({ worldMap, currentLocationName }) => {
    if (!worldMap || !worldMap.nodes || worldMap.nodes.length === 0) {
        return (
            <div className="p-1 text-center text-stone-500 italic pt-10">
                <p>Peta untuk dunia ini belum terungkap.</p>
                <p>Mulailah bertualang untuk memetakannya!</p>
            </div>
        );
    }
    
    const { nodes, edges } = worldMap;

    const getNodeById = (id: string): MapNode | undefined => nodes.find(n => n.id === id);

    return (
        <div className="p-1">
            <h3 className="font-cinzel text-xl text-[var(--color-text-header)] mb-3 border-b-2 border-[var(--border-color-strong)]/50 pb-2 flex items-center gap-2 text-glow">
                <MapIcon className="w-5 h-5" />
                <span>Peta Dunia</span>
            </h3>

            <div className="mb-4">
                <h4 className="font-semibold text-stone-300 mb-1">Lokasi Saat Ini:</h4>
                 <div className="p-3 bg-gradient-to-r from-[var(--color-primary-dark)]/50 via-stone-950/40 to-stone-950/40 rounded-lg border-2 border-[var(--color-accent)] shadow-lg shadow-[var(--color-accent-glow)]/20">
                    <p className="text-xl font-bold text-[var(--color-accent)] font-cinzel">{currentLocationName}</p>
                 </div>
            </div>
            
            <div>
                <h4 className="font-semibold text-stone-300 mb-2">Lokasi yang Diketahui:</h4>
                <ul className="space-y-3">
                    {nodes.map(node => {
                        const nodeEdges = edges.filter(edge => edge.fromNodeId === node.id);

                        return (
                            <li key={node.id} className="bg-stone-950/40 p-3 rounded-md border border-stone-700/50 transition-all">
                                <p className="font-bold text-stone-200 font-cinzel">{node.name}</p>
                                <p className="text-xs text-stone-400 italic mt-1">{node.description}</p>
                                
                                {nodeEdges.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-[var(--border-color-soft)]">
                                        <ul className="space-y-2 text-xs">
                                            {nodeEdges.map(edge => {
                                                const targetNode = getNodeById(edge.toNodeId);
                                                return (
                                                    <li key={`${edge.fromNodeId}-${edge.toNodeId}`} className="flex items-start gap-2">
                                                        <ChevronsRightIcon className="w-4 h-4 text-stone-500 mt-0.5 flex-shrink-0" />
                                                        <div className="flex-grow">
                                                            <span className="font-semibold text-[var(--color-primary)]">{edge.direction}:</span>
                                                            <span className="font-semibold text-stone-300 ml-1">{targetNode?.name || 'Lokasi tidak diketahui'}</span>
                                                            <em className="text-stone-500 ml-1">({edge.description})</em>
                                                        </div>
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};

export default MapView;