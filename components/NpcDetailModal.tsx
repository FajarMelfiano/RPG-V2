import React from 'react';
import { NPC } from '../types';
import { XIcon, CoinIcon } from './icons';

interface NpcDetailModalProps {
    npc: NPC;
    onClose: () => void;
    onInteract: (npc: NPC) => void;
}

const getAttitudeStyles = (attitude: NPC['attitude']): { borderColor: string, textColor: string, text: string } => {
    switch (attitude) {
        case 'Ramah':
            return { borderColor: 'border-green-600', textColor: 'text-green-400', text: 'Ramah' };
        case 'Bermusuhan':
            return { borderColor: 'border-red-600', textColor: 'text-red-400', text: 'Bermusuhan' };
        case 'Curiga':
            return { borderColor: 'border-yellow-600', textColor: 'text-yellow-400', text: 'Curiga' };
        case 'Netral':
        default:
            return { borderColor: 'border-stone-600', textColor: 'text-stone-400', text: 'Netral' };
    }
}

const NpcDetailModal: React.FC<NpcDetailModalProps> = ({ npc, onClose, onInteract }) => {
    const attitudeStyle = getAttitudeStyles(npc.attitude);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="npc-detail-title"
        >
            <div
                className="journal-panel w-full max-w-lg p-6 relative animate-zoomIn"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-stone-400 hover:text-white transition-colors"
                    aria-label="Tutup Detail NPC"
                >
                    <XIcon className="w-6 h-6" />
                </button>

                <div className="text-center mb-4">
                    <h2 id="npc-detail-title" className="text-3xl font-cinzel text-[var(--color-text-header)] text-glow">{npc.name}</h2>
                    <span className={`text-sm font-bold py-1 px-3 mt-2 inline-block rounded-full bg-black/30 ${attitudeStyle.textColor} border ${attitudeStyle.borderColor}`}>
                        {attitudeStyle.text}
                    </span>
                </div>

                <div className="bg-stone-950/30 rounded-md p-4 border border-stone-700 max-h-[40vh] overflow-y-auto mb-6">
                    <p className="text-stone-300 italic whitespace-pre-wrap">{npc.description}</p>
                </div>

                <div className="text-center">
                    <button
                        onClick={() => onInteract(npc)}
                        className="thematic-button text-white font-bold py-3 px-8 rounded-lg text-lg font-cinzel tracking-widest flex items-center justify-center mx-auto gap-2"
                    >
                        {npc.shopId ? (
                            <>
                                <CoinIcon className="w-5 h-5" />
                                <span>Bicara / Berdagang</span>
                            </>
                        ) : (
                            <span>Bicara</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NpcDetailModal;
