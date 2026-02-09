
import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { ANIMATION_TIMING, ANIMATION_EASING } from '../../constants/uiConfig';
import { Z_INDEX } from '../../constants/zIndex';

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
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);
  
  // Close on Escape key and handle focus trap
  useEffect(() => {
    if (isOpen) {
      // Store the element that was focused before opening the modal
      previousActiveElement.current = document.activeElement;
      
      // Focus the modal container or first focusable element
      setTimeout(() => {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements && focusableElements.length > 0) {
          (focusableElements[0] as HTMLElement).focus();
        } else if (modalRef.current) {
          modalRef.current.focus();
        }
      }, 0);
    } else if (previousActiveElement.current) {
      // Restore focus when modal closes
      (previousActiveElement.current as HTMLElement)?.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      
      // Focus trap: Tab navigation
      if (e.key === 'Tab' && isOpen && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
        
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 ${Z_INDEX.MODAL} flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-[fadeIn_${ANIMATION_TIMING.FADE_FAST}s_${ANIMATION_EASING.DEFAULT}]`}>
      <div 
        ref={modalRef}
        tabIndex={-1}
        className={`bg-slate-900 border border-slate-700 w-full rounded-2xl shadow-2xl flex flex-col relative max-h-[90vh] overflow-hidden outline-none ${className}`}
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
                className="text-slate-300 hover:text-white p-2 hover:bg-slate-800 rounded-full transition-colors"
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
