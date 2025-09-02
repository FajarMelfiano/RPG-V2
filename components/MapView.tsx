import React, { useState, useMemo } from 'react';
import { WorldMap, MapNode } from '../types';
import { CastleIcon, BuildingIcon, TreeIcon, MountainIcon, LandmarkIcon, TentIcon, UserIcon, MapIcon } from './icons';

interface MapViewProps {
    worldMap: WorldMap;
    currentLocationName: string;
    onTravelClick: (destinationName: string) => void;
}

const getLocationIcon = (type: string) => {
    const lowerType = type ? type.toLowerCase() : '';
    if (lowerType.includes('city') || lowerType.includes('keep')) return CastleIcon;
    if (lowerType.includes('town') || lowerType.includes('village') || lowerType.includes('outpost')) return BuildingIcon;
    if (lowerType.includes('forest') || lowerType.includes('woods') || lowerType.includes('swamp')) return TreeIcon;
    if (lowerType.includes('mountain') || lowerType.includes('peak')) return MountainIcon;
    if (lowerType.includes('ruins') || lowerType.includes('dungeon') || lowerType.includes('tomb')) return LandmarkIcon;
    if (lowerType.includes('camp')) return TentIcon;
    return LandmarkIcon;
};

const MapView: React.FC<MapViewProps> = ({ worldMap, currentLocationName, onTravelClick }) => {
    const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);

    const { nodes, edges } = worldMap;

    const nodePositions = useMemo(() => {
        if (!nodes || nodes.length === 0) return new Map();

        const positions = new Map<string, { x: number; y: number }>();
        const velocities = new Map<string, { x: number; y: number }>();

        const width = 500;
        const height = 450;
        const center = { x: width / 2, y: height / 2 };

        // 1. Initialize positions near the center to start the simulation
        nodes.forEach(node => {
            positions.set(node.id, {
                x: center.x + (Math.random() - 0.5) * 20,
                y: center.y + (Math.random() - 0.5) * 20,
            });
            velocities.set(node.id, { x: 0, y: 0 });
        });

        // 2. Simulation parameters
        const iterations = 300;
        const k = Math.sqrt((width * height) / nodes.length) * 1.4; // Optimal distance
        const repulsionStrength = 12000;
        const springStiffness = 0.08;
        const damping = 0.9;
        const dt = 0.05; // Time step

        // 3. Run simulation
        for (let iter = 0; iter < iterations; iter++) {
            const forces = new Map<string, { x: number; y: number }>();
            nodes.forEach(node => forces.set(node.id, { x: 0, y: 0 }));

            // Repulsion forces (nodes push each other away)
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const nodeA = nodes[i];
                    const nodeB = nodes[j];
                    const posA = positions.get(nodeA.id)!;
                    const posB = positions.get(nodeB.id)!;

                    const dx = posA.x - posB.x;
                    const dy = posA.y - posB.y;
                    const distanceSq = dx * dx + dy * dy;
                    if (distanceSq < 1) continue;
                    
                    const distance = Math.sqrt(distanceSq);
                    const forceMag = repulsionStrength / distanceSq;
                    const forceX = (dx / distance) * forceMag;
                    const forceY = (dy / distance) * forceMag;
                    
                    const forceA = forces.get(nodeA.id)!;
                    forces.set(nodeA.id, { x: forceA.x + forceX, y: forceA.y + forceY });
                    const forceB = forces.get(nodeB.id)!;
                    forces.set(nodeB.id, { x: forceB.x - forceX, y: forceB.y - forceY });
                }
            }

            // Spring forces (connected nodes attract)
            edges.forEach(edge => {
                if (!positions.has(edge.fromNodeId) || !positions.has(edge.toNodeId)) return;
                const fromPos = positions.get(edge.fromNodeId)!;
                const toPos = positions.get(edge.toNodeId)!;
                
                const dx = toPos.x - fromPos.x;
                const dy = toPos.y - fromPos.y;
                const distance = Math.max(1, Math.sqrt(dx*dx + dy*dy));
                
                const displacement = distance - k;
                const forceMag = springStiffness * displacement;
                
                const forceX = (dx / distance) * forceMag;
                const forceY = (dy / distance) * forceMag;
                
                const forceFrom = forces.get(edge.fromNodeId)!;
                forces.set(edge.fromNodeId, { x: forceFrom.x + forceX, y: forceFrom.y + forceY });
                const forceTo = forces.get(edge.toNodeId)!;
                forces.set(edge.toNodeId, { x: forceTo.x - forceX, y: forceTo.y - forceY });
            });
            
            // Update velocities and positions
            nodes.forEach(node => {
                const force = forces.get(node.id)!;
                const velocity = velocities.get(node.id)!;
                const position = positions.get(node.id)!;

                velocity.x = (velocity.x + force.x * dt) * damping;
                velocity.y = (velocity.y + force.y * dt) * damping;

                position.x += velocity.x * dt;
                position.y += velocity.y * dt;

                // Boundary check to keep nodes within the view
                position.x = Math.max(30, Math.min(width - 30, position.x));
                position.y = Math.max(30, Math.min(height - 30, position.y));

                velocities.set(node.id, velocity);
                positions.set(node.id, position);
            });
        }

        return positions;
    }, [nodes, edges]);


    if (!nodes || nodes.length === 0) {
        return (
             <div className="p-1 text-center text-stone-500 italic pt-10">
                <p>Peta untuk dunia ini belum terungkap.</p>
                <p>Mulailah bertualang untuk memetakannya!</p>
            </div>
        );
    }
    
    const connectedEdges = useMemo(() => {
        if (!selectedNode) return [];
        return edges.filter(edge => edge.fromNodeId === selectedNode.id);
    }, [selectedNode, edges]);

    return (
        <div className="p-1 flex flex-col">
            <h3 className="font-cinzel text-xl text-[var(--color-text-header)] mb-3 border-b-2 border-[var(--border-color-strong)]/50 pb-2 flex items-center gap-2 text-glow">
                <MapIcon className="w-5 h-5" />
                <span>Peta Dunia</span>
            </h3>

            <div className="relative w-full aspect-square max-w-[500px] mx-auto bg-cover bg-center rounded-lg shadow-inner overflow-hidden border-4 border-amber-900/50" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/old-map.png')", backgroundColor: '#D7C7A9' }}>
                <svg viewBox="0 0 500 450" className="w-full h-full">
                    {edges.map((edge, i) => {
                        const fromPos = nodePositions.get(edge.fromNodeId);
                        const toPos = nodePositions.get(edge.toNodeId);
                        if (!fromPos || !toPos) return null;
                        return (
                            <line key={i} x1={fromPos.x} y1={fromPos.y} x2={toPos.x} y2={toPos.y}
                                stroke="rgba(75, 53, 31, 0.6)" strokeWidth="2" strokeDasharray="4,4" />
                        );
                    })}
                    {nodes.map(node => {
                        const pos = nodePositions.get(node.id);
                        if (!pos) return null;
                        const isCurrent = node.name === currentLocationName;
                        const IconComponent = isCurrent ? UserIcon : getLocationIcon(node.type);
                        
                        return (
                            <g key={node.id} transform={`translate(${pos.x}, ${pos.y})`}
                                onClick={() => setSelectedNode(node)}
                                className="cursor-pointer group"
                            >
                                <rect x="-22" y="-22" width="44" height="44" fill="transparent" />
                                <g style={{ filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.5))' }}>
                                    <IconComponent 
                                        x={-16} y={-16}
                                        className={`w-8 h-8 transition-transform duration-200 group-hover:scale-125 ${isCurrent ? 'text-yellow-400 animate-pulse' : 'text-amber-900'}`} 
                                        stroke={isCurrent ? 'white' : 'black'}
                                        strokeWidth={isCurrent ? "1.5" : "1"}
                                    />
                                </g>
                                <text x="0" y="24" textAnchor="middle" fill="#422006"
                                    className="text-[10px] font-bold select-none pointer-events-none font-cinzel"
                                    style={{ paintOrder: 'stroke', stroke: 'rgba(215, 199, 169, 0.8)', strokeWidth: '3px', strokeLinecap: 'butt', strokeLinejoin: 'miter' }}
                                >
                                    {node.name}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>

            <div className={`mt-4 p-3 bg-stone-950/40 rounded-lg border border-stone-700/50 transition-all duration-300 overflow-hidden ${selectedNode ? 'opacity-100' : 'opacity-0 h-0 p-0 m-0 border-0'}`} style={{ minHeight: selectedNode ? '100px' : '0' }}>
                {selectedNode && (
                    <div className="animate-fadeIn">
                        <h4 className="font-bold text-[var(--color-accent)]">{selectedNode.name}</h4>
                        <p className="text-xs text-stone-400 italic mb-2">{selectedNode.description}</p>
                        {connectedEdges.length > 0 && (
                             <ul className="text-xs text-stone-300 space-y-1">
                                {connectedEdges.map(edge => {
                                    const toNode = nodes.find(n => n.id === edge.toNodeId);
                                    return toNode ? <li key={edge.toNodeId}>&rarr; {edge.description} ke <span className="font-semibold">{toNode.name}</span></li> : null;
                                })}
                            </ul>
                        )}
                        {selectedNode.name !== currentLocationName && (
                            <button 
                                onClick={() => onTravelClick(selectedNode.name)}
                                className="thematic-button text-white font-bold text-xs py-1 px-3 rounded-md mt-3 w-full"
                            >
                                Pergi ke {selectedNode.name}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MapView;