import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface ActionInputProps {
  onAction: (action: string) => void;
  isLoading: boolean;
}

const ActionInput: React.FC<ActionInputProps> = ({ onAction, isLoading }) => {
  const [action, setAction] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (action.trim() && !isLoading) {
      onAction(action.trim());
      setAction('');
    }
  };

  return (
    <div className="p-4 border-t border-slate-700">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={action}
          onChange={(e) => setAction(e.target.value)}
          placeholder="Apa yang akan kamu lakukan selanjutnya?"
          className="flex-grow bg-slate-900 border border-slate-600 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all disabled:bg-slate-800"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !action.trim()}
          className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
        >
          {isLoading ? <LoadingSpinner /> : 'Kirim'}
        </button>
      </form>
    </div>
  );
};

export default ActionInput;
