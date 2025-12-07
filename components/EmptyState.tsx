import React from 'react';
import { ShirtIcon } from './Icons';

interface EmptyStateProps {
  message: string;
  subMessage?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message, subMessage }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="bg-indigo-50 p-4 rounded-full mb-4">
        <ShirtIcon className="w-8 h-8 text-indigo-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{message}</h3>
      {subMessage && <p className="text-sm text-gray-500 max-w-xs">{subMessage}</p>}
    </div>
  );
};