import React from 'react';
import { WorldMap, MapNode, MapEdge } from '../types';
import { MapIcon } from './icons';

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
                <p className="text-lg font-bold text-[var(--color-accent)] bg-stone-950/40 p-2 rounded-md border border-[var(--border-color-soft)]">{currentLocationName}</p>
            </div>
            
            <div>
                <h4 className="font-semibold text-stone-300 mb-2">Lokasi yang Diketahui:</h4>
                <ul className="space-y-3">
                    {nodes.map(node => {
                        const isCurrent = node.name === currentLocationName;
                        const nodeEdges = edges.filter(edge => edge.fromNodeId === node.id);

                        return (
                            <li key={node.id} className={`bg-stone-950/40 p-3 rounded-md border-l-4 transition-all ${isCurrent ? 'border-[var(--color-accent)] shadow-lg shadow-[var(--color-accent-glow)]/20' : 'border-stone-700'}`}>
                                <p className={`font-bold ${isCurrent ? 'text-[var(--color-accent)]' : 'text-stone-200'}`}>{node.name}</p>
                                <p className="text-xs text-stone-400 italic mt-1">{node.description}</p>
                                {nodeEdges.length > 0 && (
                                    <ul className="mt-2 pl-4 text-xs space-y-1">
                                        {nodeEdges.map(edge => {
                                            const targetNode = getNodeById(edge.toNodeId);
                                            return (
                                                <li key={`${edge.fromNodeId}-${edge.toNodeId}`} className="text-stone-300">
                                                    <span className="font-semibold text-[var(--color-primary)]">{edge.direction}:</span> {targetNode?.name || 'Lokasi tidak diketahui'}
                                                    <em className="text-stone-500 ml-1">({edge.description})</em>
                                                </li>
                                            )
                                        })}
                                    </ul>
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
