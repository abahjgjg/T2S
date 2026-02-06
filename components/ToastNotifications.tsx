
import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { UI_TIMING } from '../constants/uiConfig';

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

  useEffect(() => {
    const handleToast = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const id = Math.random().toString(36).substring(7);
      setToasts((prev) => [...prev, { id, ...detail }]);

      // Auto dismiss
      setTimeout(() => {
        removeToast(id);
      }, UI_TIMING.TOAST_DURATION);
    };

    window.addEventListener(TOAST_EVENT, handleToast);
    return () => window.removeEventListener(TOAST_EVENT, handleToast);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    // Actually remove after animation completes
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, UI_TIMING.TOAST_ANIMATION);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-md px-4 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`
            pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md
            ${t.exiting ? 'animate-[slideDown_0.3s_ease-in_forwards]' : 'animate-[slideUp_0.3s_ease-out]'}
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
          >
            <X className="w-4 h-4 opacity-70" />
          </button>
        </div>
      ))}
    </div>
  );
};
