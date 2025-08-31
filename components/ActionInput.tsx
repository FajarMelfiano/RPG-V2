import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface ActionInputProps {
  onAction: (action: string) => void;
  isLoading: boolean;
  actionText: string;
  setActionText: (text: string) => void;
}

const ActionInput: React.FC<ActionInputProps> = ({ onAction, isLoading, actionText, setActionText }) => {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (actionText.trim() && !isLoading) {
      onAction(actionText.trim());
      setActionText('');
    }
  };

  return (
    <div className="p-4 border-t-2 border-[var(--border-color-strong)]/50 bg-stone-950/50 flex-shrink-0">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={actionText}
          onChange={(e) => setActionText(e.target.value)}
          placeholder="Apa yang akan kamu lakukan selanjutnya?"
          className="flex-grow bg-stone-950/70 border border-stone-600 rounded-lg p-3 text-stone-200 focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none transition-all disabled:bg-stone-800 focus:border-[var(--color-primary)] focus:shadow-[0_0_10px_var(--color-accent-glow)]"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !actionText.trim()}
          className="thematic-button text-white font-bold py-3 px-6 rounded-lg transition-all duration-150 flex items-center justify-center min-w-[100px]"
        >
          {isLoading ? <LoadingSpinner /> : 'Kirim'}
        </button>
      </form>
      <p className="text-xs text-stone-500 mt-2 text-center">
        Gunakan <code>/ooc [pertanyaanmu]</code> untuk bertanya pada GM di luar karakter.
      </p>
    </div>
  );
};

export default ActionInput;