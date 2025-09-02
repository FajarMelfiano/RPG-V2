import React from 'react';
import { WorldTheme } from '../types';
import { XIcon, SettingsIcon } from './icons';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentTheme: WorldTheme;
    onThemeChange: (theme: WorldTheme) => void;
}

const THEMES: { id: WorldTheme; name: string; }[] = [
    { id: 'dark_fantasy', name: 'Fantasi Gelap' },
    { id: 'high_fantasy', name: 'Fantasi Tinggi' },
    { id: 'cyberpunk', name: 'Cyberpunk' },
    { id: 'steampunk', name: 'Steampunk' },
    { id: 'lovecraftian_horror', name: 'Horor Lovecraftian' },
    { id: 'solarpunk', name: 'Solarpunk' },
];

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentTheme, onThemeChange }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
        >
            <div
                className="journal-panel w-full max-w-lg p-6 relative animate-zoomIn"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-stone-400 hover:text-white transition-colors"
                    aria-label="Tutup Pengaturan"
                >
                    <XIcon className="w-6 h-6" />
                </button>

                <div className="text-center mb-6">
                    <h2 id="settings-title" className="text-3xl font-cinzel text-[var(--color-text-header)] text-glow flex items-center justify-center gap-3">
                        <SettingsIcon className="w-7 h-7" />
                        Pengaturan
                    </h2>
                </div>
                
                <div className="space-y-4">
                    <label className="block text-stone-300 font-bold mb-2">Tema Visual Dunia</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {THEMES.map(theme => (
                            <button
                                key={theme.id}
                                onClick={() => onThemeChange(theme.id)}
                                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                                    currentTheme === theme.id 
                                    ? 'border-[var(--color-accent)] bg-[var(--color-primary-dark)]/50 shadow-[0_0_10px_var(--color-accent-glow)]' 
                                    : 'border-stone-600 bg-stone-800/50 hover:border-stone-500'
                                }`}
                            >
                                <span className={`font-bold font-cinzel ${currentTheme === theme.id ? 'text-[var(--color-text-header)]' : 'text-stone-300'}`}>{theme.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                 <div className="mt-8 text-center">
                    <button
                        onClick={onClose}
                        className="bg-stone-700 hover:bg-stone-600 text-white font-bold py-2 px-6 rounded-lg transition-colors border-b-4 border-stone-800"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;