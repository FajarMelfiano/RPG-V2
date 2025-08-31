import React from 'react';
import { FamilyMember, FamilyStatus } from '../types';
import { HeartIcon } from './icons';

interface FamilySheetProps {
    family: FamilyMember[];
}

const getStatusStyles = (status: FamilyStatus): { borderColor: string, textColor: string, text: string } => {
    switch (status) {
        case 'Hidup':
            return { borderColor: 'border-green-600', textColor: 'text-green-400', text: 'Hidup' };
        case 'Dalam bahaya':
            return { borderColor: 'border-red-600', textColor: 'text-red-400', text: 'Dalam Bahaya' };
        case 'Hilang':
            return { borderColor: 'border-yellow-600', textColor: 'text-yellow-400', text: 'Hilang' };
        case 'Meninggal':
            return { borderColor: 'border-stone-600', textColor: 'text-stone-500', text: 'Meninggal' };
        default:
            return { borderColor: 'border-stone-700', textColor: 'text-stone-400', text: 'Tidak Diketahui' };
    }
}

const FamilyMemberCard: React.FC<{ member: FamilyMember }> = ({ member }) => {
    const { borderColor, textColor, text } = getStatusStyles(member.status);
    return (
        <li className={`bg-stone-950/40 p-3 rounded-md border-l-4 ${borderColor}`}>
            <div className="flex justify-between items-start gap-2">
                <div>
                    <p className="font-bold text-stone-200">{member.name}</p>
                    <p className="text-xs text-stone-400">{member.relationship}</p>
                </div>
                <span className={`text-xs font-bold py-1 px-2 rounded-full bg-black/30 ${textColor}`}>
                    {text}
                </span>
            </div>
            <p className="text-sm text-stone-300 italic mt-2">{member.description}</p>
        </li>
    );
};

const FamilySheet: React.FC<FamilySheetProps> = ({ family }) => {
    return (
        <div className="p-1">
            <h3 className="font-cinzel text-xl text-[var(--color-text-header)] mb-3 border-b-2 border-[var(--border-color-strong)]/50 pb-2 flex items-center gap-2 text-glow">
                <HeartIcon className="w-5 h-5" />
                <span>Keluarga & Relasi</span>
            </h3>
            {family && family.length > 0 ? (
                <ul className="space-y-3">
                    {family.map(member => <FamilyMemberCard key={member.name} member={member} />)}
                </ul>
            ) : (
                <div className="text-center text-stone-500 italic pt-10">
                    <p>Anda tidak memiliki keluarga yang tercatat, atau mungkin Anda seorang yatim piatu yang sendirian di dunia ini.</p>
                </div>
            )}
        </div>
    );
};

export default FamilySheet;
