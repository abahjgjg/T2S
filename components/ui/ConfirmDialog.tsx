import React, { useEffect, useRef } from 'react';
import { AlertTriangle, Trash2, RefreshCw, LogOut, UserX, Save } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { ANIMATION_TIMING, ANIMATION_EASING, UI_TIMING } from '../../constants/uiConfig';

export type ConfirmVariant = 'danger' | 'warning' | 'info' | 'success';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  description?: string;
  showCloseButton?: boolean;
}

interface ConfirmDialogProps extends ConfirmOptions {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const variantConfig = {
  danger: {
    icon: Trash2,
    iconColor: 'text-red-500',
    iconBg: 'bg-red-500/10',
    buttonVariant: 'danger' as const,
    borderColor: 'border-red-500/20',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-500/10',
    buttonVariant: 'primary' as const,
    borderColor: 'border-amber-500/20',
  },
  info: {
    icon: RefreshCw,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-500/10',
    buttonVariant: 'primary' as const,
    borderColor: 'border-blue-500/20',
  },
  success: {
    icon: Save,
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-500/10',
    buttonVariant: 'primary' as const,
    borderColor: 'border-emerald-500/20',
  },
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
  showCloseButton = false,
  onConfirm,
  onCancel,
}) => {
  const config = variantConfig[variant];
  const Icon = config.icon;
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const iconContainerRef = useRef<HTMLDivElement>(null);

  // Auto-focus cancel button for destructive actions (prevents accidental confirmations)
  // This is a critical accessibility feature for dangerous operations
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure modal is mounted and focus trap is set up
      const focusTimer = setTimeout(() => {
        // For danger/warning variants, focus cancel button to prevent accidental confirms
        // For info/success variants, focus the confirm button as these are safe actions
        const buttonToFocus = (variant === 'danger' || variant === 'warning') 
          ? cancelButtonRef.current 
          : document.querySelector('[data-confirm-button]') as HTMLButtonElement;
        
        buttonToFocus?.focus();
      }, UI_TIMING.FOCUS_DELAY);

      return () => clearTimeout(focusTimer);
    }
  }, [isOpen, variant]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      className="max-w-md"
      hideCloseButton={!showCloseButton}
    >
      <div className="p-6">
        <div className="flex flex-col items-center text-center">
          {/* Icon with subtle entrance animation */}
          <div 
            ref={iconContainerRef}
            className={`w-16 h-16 rounded-full ${config.iconBg} flex items-center justify-center mb-4 animate-[scaleIn_${ANIMATION_TIMING.FADE_FAST}s_${ANIMATION_EASING.DEFAULT}]`}
          >
            <Icon 
              className={`w-8 h-8 ${config.iconColor} animate-[fadeIn_${ANIMATION_TIMING.FADE_FAST}s_${ANIMATION_EASING.DEFAULT}]`} 
              aria-hidden="true" 
            />
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-white mb-2" id="confirm-dialog-title">
            {title}
          </h3>

          {/* Description */}
          <div className="space-y-2 mb-6">
            <p className="text-slate-300 text-base" id="confirm-dialog-message">
              {message}
            </p>
            {description && (
              <p className="text-slate-400 text-sm">{description}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 w-full">
            <Button
              ref={cancelButtonRef}
              variant="outline"
              onClick={onCancel}
              fullWidth
              className="order-2 sm:order-1"
            >
              {cancelText}
            </Button>
            <Button
              variant={config.buttonVariant}
              onClick={onConfirm}
              fullWidth
              className="order-1 sm:order-2"
              data-confirm-button
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
