import React from 'react';
import { ANIMATION_TIMING, ANIMATION_EASING } from '../../constants/uiConfig';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = ""
}) => {
  return (
    <div 
      className={`bg-slate-900 border border-slate-800 rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[300px] animate-[fadeIn_${ANIMATION_TIMING.FADE_NORMAL}s_${ANIMATION_EASING.DEFAULT}] ${className}`}
    >
      {icon && <div className="mb-4">{icon}</div>}
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      {description && <p className="text-slate-300 max-w-md">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};
