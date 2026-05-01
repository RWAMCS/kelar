import React from 'react';

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon, title, subtitle, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center w-full">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
        <span className="text-3xl">{icon}</span>
      </div>
      <p className="text-gray-500 font-medium">{title}</p>
      <p className="text-sm text-gray-400 mt-1 mb-4">{subtitle}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="border border-primary text-primary px-5 py-2 rounded-full text-sm font-bold hover:bg-primary hover:text-white transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
