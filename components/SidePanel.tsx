import React, { useState } from 'react';
import { Character } from '../types';
import CharacterSheet from './CharacterSheet';
import PartySheet from './PartySheet';
import NotesPanel from './NotesPanel';
import { ShieldIcon, UsersIcon, FileTextIcon, XIcon } from './icons';

interface SidePanelProps {
    character: Character;
    party: Character[];
    notes: string;
    onNotesChange: (notes: string) => void;
    isOpen: boolean;
    onClose: () => void;
}

type ActiveTab = 'character' | 'party' | 'notes';

// The actual panel content, extracted to avoid duplication
const PanelContent: React.FC<Omit<SidePanelProps, 'isOpen' | 'onClose'>> = ({ character, party, notes, onNotesChange }) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('character');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'character':
                return <CharacterSheet character={character} />;
            case 'party':
                return party.length > 0 ? <PartySheet party={party} /> : (
                    <div className="bg-slate-800/70 rounded-xl p-4 text-center text-slate-400 mt-4">
                        Anda sedang bertualang sendirian.
                    </div>
                );
            case 'notes':
                return <NotesPanel notes={notes} onNotesChange={onNotesChange} />;
            default:
                return null;
        }
    }

    const getTabClass = (tabName: ActiveTab) => {
        return `flex-1 py-2 px-4 text-sm font-bold rounded-md flex items-center justify-center gap-2 transition-colors ${
            activeTab === tabName 
            ? 'bg-amber-600 text-white' 
            : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
        }`;
    }

    return (
        <div className="flex flex-col gap-4 h-full">
            <div className="flex-shrink-0 bg-slate-800/70 rounded-xl p-1 flex gap-1 border border-slate-700">
                <button onClick={() => setActiveTab('character')} className={getTabClass('character')}>
                    <ShieldIcon className="w-4 h-4" /> Karakter
                </button>
                <button onClick={() => setActiveTab('party')} className={getTabClass('party')} disabled={party.length === 0}>
                   <UsersIcon className="w-4 h-4" /> Party ({party.length})
                </button>
                <button onClick={() => setActiveTab('notes')} className={getTabClass('notes')}>
                    <FileTextIcon className="w-4 h-4" /> Catatan
                </button>
            </div>
            <div className="flex-grow min-h-0">
                {renderTabContent()}
            </div>
        </div>
    );
};

const SidePanel: React.FC<SidePanelProps> = (props) => {
    const { isOpen, onClose } = props;

    // Mobile Drawer: a fixed container with an overlay
    const MobileDrawer = (
        <div
            className={`md:hidden fixed inset-0 z-40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            aria-hidden={!isOpen}
        >
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />
            <aside
                className={`relative z-10 bg-slate-900 w-[90vw] max-w-sm h-full p-4 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
                aria-label="Panel Samping"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white"
                    aria-label="Tutup panel"
                >
                    <XIcon className="w-6 h-6" />
                </button>
                <div className="h-full overflow-y-auto">
                    <PanelContent {...props} />
                </div>
            </aside>
        </div>
    );

    // Desktop Panel: a static container that fits into the flex layout
    const DesktopPanel = (
        <aside className="hidden md:block md:w-1/3 lg:w-[350px] flex-shrink-0 h-full">
             <div className="h-full overflow-y-auto">
                <PanelContent {...props} />
            </div>
        </aside>
    );

    return (
        <>
            {MobileDrawer}
            {DesktopPanel}
        </>
    );
};

export default SidePanel;
