import React from 'react';
import { FileTextIcon } from './icons';

interface NotesPanelProps {
    notes: string;
    onNotesChange: (newNotes: string) => void;
}

const NotesPanel: React.FC<NotesPanelProps> = ({ notes, onNotesChange }) => {
    return (
        <div className="p-1 flex flex-col h-full">
            <h3 className="font-cinzel text-xl text-amber-300 mb-3 border-b-2 border-amber-900/50 pb-2 flex items-center gap-2 text-glow">
                <FileTextIcon className="w-5 h-5" />
                <span>Catatan Petualang</span>
            </h3>
            <textarea
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
                placeholder="Tuliskan petunjuk, nama-nama penting, atau rencana Anda di sini..."
                className="w-full h-full flex-grow p-3 bg-stone-950/70 border border-stone-600 rounded-lg text-stone-200 focus:ring-1 focus:ring-amber-500 focus:outline-none transition-all resize-none focus:border-amber-500 focus:shadow-[0_0_10px_rgba(253,224,71,0.3)]"
            />
        </div>
    );
};

export default NotesPanel;