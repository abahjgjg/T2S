import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, Undo2 } from 'lucide-react';
import { UI_TIMING, ANIMATION_TIMING, ANIMATION_EASING } from '../constants/uiConfig';
import { TOAST_CONFIG } from '../constants/appConfig';
import { Z_INDEX } from '../constants/zIndex';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'undo';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  exiting?: boolean;
  /** Callback when undo is triggered - only for 'undo' type toasts */
  onUndo?: () => void;
  /** Custom undo button text */
  undoText?: string;
}

// Duration configuration by toast type
// Error toasts persist until manually dismissed (accessibility improvement)
// Undo toasts have extended duration to give users time to react
const getToastDuration = (type: ToastType): number | null => {
  switch (type) {
    case 'error':
      return null; // Persistent - no auto-dismiss
    case 'undo':
      return UI_TIMING.TOAST_DURATION * 1.5; // 6 seconds - more time for undo
    case 'warning':
      return UI_TIMING.TOAST_DURATION * 1.5; // 6 seconds
    case 'success':
    case 'info':
    default:
      return UI_TIMING.TOAST_DURATION; // 4 seconds
  }
};

// Event Bus for Toasts
const TOAST_EVENT = TOAST_CONFIG.EVENT_NAME;

export interface ToastOptions {
  onUndo?: () => void;
  undoText?: string;
}

export const toast = {
  success: (message: string) => dispatchToast(message, 'success'),
  error: (message: string) => dispatchToast(message, 'error'),
  info: (message: string) => dispatchToast(message, 'info'),
  warning: (message: string) => dispatchToast(message, 'warning'),
  /**
   * Shows a toast with undo action - delays the actual deletion
   * @param message - The toast message (e.g., "Item deleted")
   * @param onUndo - Callback when user clicks undo
   * @param undoText - Custom text for undo button (default: "Undo")
   */
  undo: (message: string, onUndo: () => void, undoText: string = 'Undo') => 
    dispatchToast(message, 'undo', { onUndo, undoText }),
};

const dispatchToast = (message: string, type: ToastType, options?: ToastOptions) => {
  const event = new CustomEvent(TOAST_EVENT, { 
    detail: { 
      message, 
      type, 
      onUndo: options?.onUndo,
      undoText: options?.undoText 
    } 
  });
  window.dispatchEvent(event);
};

// Progress bar component for auto-dismissing toasts
interface ProgressBarProps {
  duration: number;
  toastId: string;
  pausedRef: React.MutableRefObject<Set<string>>;
  type: ToastType;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ duration, toastId, pausedRef, type }) => {
  const [progress, setProgress] = useState(100);
  const animationRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number>(Date.now());
  const pausedTimeRef = useRef<number>(0);

  useEffect(() => {
    const animate = () => {
      if (pausedRef.current.has(toastId)) {
        // Track how long we've been paused
        if (pausedTimeRef.current === 0) {
          pausedTimeRef.current = Date.now();
        }
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      
      // Adjust start time for pause duration
      if (pausedTimeRef.current > 0) {
        const pauseDuration = Date.now() - pausedTimeRef.current;
        startTimeRef.current += pauseDuration;
        pausedTimeRef.current = 0;
      }

      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      
      setProgress(remaining);
      
      if (remaining > 0) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [duration, toastId, pausedRef]);

  const getProgressColor = () => {
    switch (type) {
      case 'success': return 'bg-emerald-400';
      case 'warning': return 'bg-amber-400';
      case 'undo': return 'bg-purple-400';
      case 'info': return 'bg-blue-400';
      default: return 'bg-slate-400';
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 overflow-hidden rounded-b-xl">
      <div 
        className={`h-full ${getProgressColor()} transition-none`}
        style={{ 
          width: `${progress}%`,
          transformOrigin: 'left'
        }}
      />
    </div>
  );
};

export const ToastNotifications: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const pausedToastsRef = useRef<Set<string>>(new Set());
  const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    const handleToast = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const id = crypto.randomUUID();
      const toastType = detail.type as ToastType;
      const duration = getToastDuration(toastType);
      
      setToasts((prev) => [...prev, { id, ...detail }]);

      // Auto dismiss with pause support (error toasts don't auto-dismiss)
      if (duration !== null) {
        const dismissTimeout = setTimeout(() => {
          if (!pausedToastsRef.current.has(id)) {
            removeToast(id);
          }
        }, duration);

        timeoutsRef.current.set(id, dismissTimeout);
      }
    };

    window.addEventListener(TOAST_EVENT, handleToast);
    return () => {
      window.removeEventListener(TOAST_EVENT, handleToast);
      // Clear all timeouts on unmount
      timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  const removeToast = (id: string) => {
    // Clear the timeout for this toast
    const timeout = timeoutsRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(id);
    }
    
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    
    // Actually remove after animation completes
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, UI_TIMING.TOAST_ANIMATION);
  };

  const handleMouseEnter = (id: string, type: ToastType) => {
    pausedToastsRef.current.add(id);
  };

  const handleMouseLeave = (id: string, type: ToastType) => {
    pausedToastsRef.current.delete(id);
    const duration = getToastDuration(type);
    
    // Resume dismissal after a short delay (only for non-error toasts)
    if (duration !== null) {
      const resumeTimeout = setTimeout(() => {
        if (!pausedToastsRef.current.has(id)) {
          removeToast(id);
        }
      }, duration / 2);
      
      timeoutsRef.current.set(id, resumeTimeout);
    }
  };

  return (
    <>
      {/* Accessibility: Announces toasts to screen readers */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {toasts[toasts.length - 1]?.message}
        {toasts[toasts.length - 1]?.type === 'undo' ? ' - Press undo button to revert this action' : ''}
      </div>
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 ${Z_INDEX.TOAST} flex flex-col gap-2 w-full max-w-md px-4 pointer-events-none`}>
        {toasts.map((t) => (
        <div
          key={t.id}
          onMouseEnter={() => handleMouseEnter(t.id, t.type)}
          onMouseLeave={() => handleMouseLeave(t.id, t.type)}
          className={`
            pointer-events-auto relative flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md transition-all hover:scale-[1.02]
            ${t.exiting ? `animate-[slideDown_${ANIMATION_TIMING.SLIDE_DOWN}s_${ANIMATION_EASING.EXIT}_forwards]` : `animate-[slideUp_${ANIMATION_TIMING.SLIDE_UP}s_${ANIMATION_EASING.DEFAULT}]`}
            ${t.type === 'success' ? 'bg-emerald-900/90 border-emerald-500/50 text-emerald-100' : ''}
            ${t.type === 'error' ? 'bg-red-900/90 border-red-500/50 text-red-100' : ''}
            ${t.type === 'info' ? 'bg-slate-800/90 border-slate-600/50 text-slate-100' : ''}
            ${t.type === 'warning' ? 'bg-amber-900/90 border-amber-500/50 text-amber-100' : ''}
            ${t.type === 'undo' ? 'bg-purple-900/90 border-purple-500/50 text-purple-100' : ''}
          `}
        >
          {/* Progress bar for auto-dismissing toasts */}
          {getToastDuration(t.type) !== null && !t.exiting && (
            <ProgressBar
              duration={getToastDuration(t.type)!}
              toastId={t.id}
              pausedRef={pausedToastsRef}
              type={t.type}
            />
          )}

          {t.type === 'success' && <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" />}
          {t.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />}
          {t.type === 'info' && <Info className="w-5 h-5 shrink-0 text-blue-400" />}
          {t.type === 'warning' && <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />}
          {t.type === 'undo' && <Undo2 className="w-5 h-5 shrink-0 text-purple-400" />}

          <p className="text-sm font-medium flex-1">{t.message}</p>

          {/* Undo button for undo-type toasts */}
          {t.type === 'undo' && t.onUndo && (
            <button
              onClick={() => {
                t.onUndo?.();
                removeToast(t.id);
              }}
              className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              aria-label={t.undoText || 'Undo action'}
            >
              {t.undoText || 'Undo'}
            </button>
          )}

          <button
            onClick={() => removeToast(t.id)}
            className="p-1 hover:bg-white/10 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/30"
            aria-label={t.type === 'error' ? 'Dismiss error message' : 'Dismiss notification'}
          >
            <X className="w-4 h-4 opacity-70" />
          </button>
        </div>
      ))}
      </div>
    </>
  );
};