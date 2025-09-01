
import React from 'react';
import { XIcon } from './icons';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Ya', cancelText = 'Tidak' }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
            onClick={onCancel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirmation-title"
        >
            <div
                className="journal-panel w-full max-w-md p-6 relative animate-zoomIn"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 text-stone-400 hover:text-white transition-colors"
                    aria-label="Tutup Konfirmasi"
                >
                    <XIcon className="w-6 h-6" />
                </button>

                <div className="text-center">
                    <h2 id="confirmation-title" className="text-2xl font-cinzel text-[var(--color-text-header)] text-glow mb-4">{title}</h2>
                    <p className="text-stone-300 mb-6">{message}</p>
                </div>

                <div className="flex justify-center gap-4">
                    <button
                        onClick={onCancel}
                        className="bg-stone-700 hover:bg-stone-600 text-white font-bold py-2 px-8 rounded-lg transition-colors border-b-4 border-stone-800"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="thematic-button text-white font-bold py-2 px-8 rounded-lg"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
