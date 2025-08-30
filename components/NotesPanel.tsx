import React from 'react';
import { FileTextIcon } from './icons';

interface NotesPanelProps {
    notes: string;
    onNotesChange: (newNotes: string) => void;
}

const NotesPanel: React.FC<NotesPanelProps> = ({ notes, onNotesChange }) => {
    return (
        <div className="bg-slate-800/70 rounded-xl shadow-lg border border-slate-700 backdrop-blur-sm p-4 flex flex-col h-full">
            <h3 className="font-cinzel text-xl text-amber-300 mb-3 border-b-2 border-slate-700 pb-2 flex items-center gap-2">
                <FileTextIcon className="w-5 h-5" />
                <span>Catatan Petualang</span>
            </h3>
            <textarea
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
                placeholder="Tuliskan petunjuk, nama-nama penting, atau rencana Anda di sini..."
                className="w-full h-full flex-grow p-3 bg-slate-900 border border-slate-600 rounded-lg text-slate-200 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all resize-none"
            />
        </div>
    );
};

export default NotesPanel;