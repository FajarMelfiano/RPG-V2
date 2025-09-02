import React from 'react';
import { Residence } from '../types';
import { HomeIcon } from './icons';

interface ResidenceSheetProps {
    residences: Residence[];
}

const ResidenceCard: React.FC<{ residence: Residence }> = ({ residence }) => {
    return (
        <li className="bg-stone-950/40 p-3 rounded-md border border-stone-700/50">
            <p className="font-bold text-stone-200">{residence.name}</p>
            <p className="text-xs text-stone-500 mb-2">{residence.location}</p>
            <p className="text-sm text-stone-300 italic">{residence.description}</p>
            {/* Fitur penyimpanan dapat ditambahkan di sini di masa mendatang */}
        </li>
    );
};

const ResidenceSheet: React.FC<ResidenceSheetProps> = ({ residences }) => {
    return (
        <div className="p-1">
            <h3 className="font-cinzel text-xl text-[var(--color-text-header)] mb-3 border-b-2 border-[var(--border-color-strong)]/50 pb-2 flex items-center gap-2 text-glow">
                <HomeIcon className="w-5 h-5" />
                <span>Properti & Rumah</span>
            </h3>
            {residences && residences.length > 0 ? (
                <ul className="space-y-3">
                    {residences.map(res => <ResidenceCard key={res.id} residence={res} />)}
                </ul>
            ) : (
                <div className="text-center text-stone-500 italic pt-10">
                    <p>Anda tidak memiliki rumah. Mungkin sudah waktunya untuk menetap?</p>
                </div>
            )}
        </div>
    );
};

export default ResidenceSheet;