import React from 'react';
import { Modal } from './ui/Modal';
import { Keyboard, RotateCcw, X, ArrowLeft, ArrowRight, Slash } from 'lucide-react';

interface Shortcut {
  keys: string[];
  description: string;
  icon?: React.ReactNode;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language: 'id' | 'en';
}

const getShortcuts = (language: 'id' | 'en'): Shortcut[] => {
  const isID = language === 'id';
  
  return [
    {
      keys: ['Ctrl', 'R'],
      description: isID ? 'Riset Baru' : 'New Research',
      icon: <RotateCcw className="w-4 h-4" />
    },
    {
      keys: ['?'],
      description: isID ? 'Bantuan Shortcut' : 'Show Shortcuts Help',
      icon: <Keyboard className="w-4 h-4" />
    },
    {
      keys: ['Esc'],
      description: isID ? 'Tutup Modal / Batalkan' : 'Close Modal / Cancel',
      icon: <X className="w-4 h-4" />
    },
    {
      keys: ['Tab'],
      description: isID ? 'Navigasi ke elemen berikutnya' : 'Navigate to next element',
      icon: <ArrowRight className="w-4 h-4" />
    },
    {
      keys: ['Shift', 'Tab'],
      description: isID ? 'Navigasi ke elemen sebelumnya' : 'Navigate to previous element',
      icon: <ArrowLeft className="w-4 h-4" />
    },
    {
      keys: ['Enter'],
      description: isID ? 'Aktifkan tombol / Kirim form' : 'Activate button / Submit form',
      icon: <Slash className="w-4 h-4" />
    }
  ];
};

const KeyBadge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <kbd className="inline-flex items-center justify-center min-w-[28px] px-2 py-1 text-xs font-mono font-bold text-slate-300 bg-slate-800 border border-slate-700 rounded-md shadow-sm">
    {children}
  </kbd>
);

export const KeyboardShortcutsModal: React.FC<Props> = ({ isOpen, onClose, language }) => {
  const shortcuts = getShortcuts(language);
  const isID = language === 'id';

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Keyboard className="w-5 h-5 text-emerald-400" />
          <span>{isID ? 'Pintasan Keyboard' : 'Keyboard Shortcuts'}</span>
        </div>
      }
      className="max-w-md"
    >
      <div className="p-6 space-y-6">
        {/* Description */}
        <p className="text-sm text-slate-400">
          {isID 
            ? 'Gunakan pintasan keyboard ini untuk navigasi lebih cepat. Pintasan bekerja di seluruh aplikasi.'
            : 'Use these keyboard shortcuts for faster navigation. Shortcuts work throughout the application.'}
        </p>

        {/* Shortcuts List */}
        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-3 bg-slate-950/50 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-slate-500 group-hover:text-emerald-400 transition-colors">
                  {shortcut.icon}
                </div>
                <span className="text-sm text-slate-300">{shortcut.description}</span>
              </div>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, keyIndex) => (
                  <React.Fragment key={keyIndex}>
                    <KeyBadge>{key}</KeyBadge>
                    {keyIndex < shortcut.keys.length - 1 && (
                      <span className="text-slate-600 mx-0.5">+</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer tip */}
        <div className="pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {isID 
                ? 'Tip: Tekan ? kapan saja untuk membuka bantuan ini'
                : 'Tip: Press ? anytime to open this help'}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
};
