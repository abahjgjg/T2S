
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: React.ReactNode;
  className?: string; // Additional classes for the container
  hideCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  children, 
  title, 
  className = "max-w-2xl",
  hideCloseButton = false
}) => {
  
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
      <div 
        className={`bg-slate-900 border border-slate-700 w-full rounded-2xl shadow-2xl flex flex-col relative max-h-[90vh] overflow-hidden ${className}`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        {(title || !hideCloseButton) && (
          <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center shrink-0">
            <div className="font-bold text-white text-lg flex items-center gap-2">
              {title}
            </div>
            {!hideCloseButton && (
              <button 
                onClick={onClose} 
                className="text-slate-500 hover:text-white p-2 hover:bg-slate-800 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          {children}
        </div>
      </div>
    </div>
  );
};
