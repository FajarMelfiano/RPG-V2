import React from 'react';
import { DiceIcon } from './icons';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center gap-2">
      <DiceIcon className="animate-spin h-5 w-5 text-white" />
      <span className="text-white">Berpikir...</span>
    </div>
  );
};

export default LoadingSpinner;