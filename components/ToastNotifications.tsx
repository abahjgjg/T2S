
import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { UI_TIMING, ANIMATION_TIMING, ANIMATION_EASING } from '../constants/uiConfig';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  exiting?: boolean;
}

// Event Bus for Toasts
const TOAST_EVENT = 'trendventures_toast_event';

export const toast = {
  success: (message: string) => dispatchToast(message, 'success'),
  error: (message: string) => dispatchToast(message, 'error'),
  info: (message: string) => dispatchToast(message, 'info'),
  warning: (message: string) => dispatchToast(message, 'warning'),
};

const dispatchToast = (message: string, type: ToastType) => {
  const event = new CustomEvent(TOAST_EVENT, { detail: { message, type } });
  window.dispatchEvent(event);
};

export const ToastNotifications: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const pausedToastsRef = useRef<Set<string>>(new Set());
  const timeoutMapRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    const handleToast = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, ...detail }]);

      // Auto dismiss with pause support
      const dismissTimeout = setTimeout(() => {
        if (!pausedToastsRef.current.has(id)) {
          removeToast(id);
        }
      }, UI_TIMING.TOAST_DURATION);

      // Store timeout ID for cleanup using Map (not on the string itself)
      timeoutMapRef.current.set(id, dismissTimeout);
    };

    window.addEventListener(TOAST_EVENT, handleToast);
    return () => window.removeEventListener(TOAST_EVENT, handleToast);
  }, []);

  const removeToast = (id: string) => {
    // Clear the timeout for this toast
    const timeoutId = timeoutMapRef.current.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutMapRef.current.delete(id);
    }
    
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    // Actually remove after animation completes
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, UI_TIMING.TOAST_ANIMATION);
  };

  const handleMouseEnter = (id: string) => {
    pausedToastsRef.current.add(id);
  };

  const handleMouseLeave = (id: string) => {
    pausedToastsRef.current.delete(id);
    // Resume dismissal after a short delay
    setTimeout(() => {
      if (!pausedToastsRef.current.has(id)) {
        removeToast(id);
      }
    }, UI_TIMING.TOAST_DURATION / 2);
  };

  return (
    <>
      {/* Accessibility: Announces toasts to screen readers */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {toasts[toasts.length - 1]?.message}
      </div>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-md px-4 pointer-events-none">
        {toasts.map((t) => (
        <div
          key={t.id}
          onMouseEnter={() => handleMouseEnter(t.id)}
          onMouseLeave={() => handleMouseLeave(t.id)}
          className={`
            pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md transition-all hover:scale-[1.02]
            ${t.exiting ? `animate-[slideDown_${ANIMATION_TIMING.SLIDE_DOWN}s_${ANIMATION_EASING.EXIT}_forwards]` : `animate-[slideUp_${ANIMATION_TIMING.SLIDE_UP}s_${ANIMATION_EASING.DEFAULT}]`}
            ${t.type === 'success' ? 'bg-emerald-900/90 border-emerald-500/50 text-emerald-100' : ''}
            ${t.type === 'error' ? 'bg-red-900/90 border-red-500/50 text-red-100' : ''}
            ${t.type === 'info' ? 'bg-slate-800/90 border-slate-600/50 text-slate-100' : ''}
            ${t.type === 'warning' ? 'bg-amber-900/90 border-amber-500/50 text-amber-100' : ''}
          `}
        >
          {t.type === 'success' && <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" />}
          {t.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />}
          {t.type === 'info' && <Info className="w-5 h-5 shrink-0 text-blue-400" />}
          {t.type === 'warning' && <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />}
          
          <p className="text-sm font-medium flex-1">{t.message}</p>
          
          <button 
            onClick={() => removeToast(t.id)}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4 opacity-70" />
          </button>
        </div>
      ))}
      </div>
    </>
  );
};
