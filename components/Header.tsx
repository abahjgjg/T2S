
import React, { useEffect, useCallback, useState } from 'react';
import { TrendingUp, RotateCcw, BookMarked, Compass, LogIn, LayoutDashboard, Shield, Keyboard } from 'lucide-react';
import { usePreferences } from '../contexts/PreferencesContext';
import { useAuth } from '../contexts/AuthContext';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { Tooltip } from './ui/Tooltip';
import { BRAND_CONFIG, KEYBOARD_SHORTCUTS, matchesShortcut, isInputElement, formatShortcut, FONT_SIZES } from '../config';

interface Props {
  onReset: () => void;
  showReset: boolean;
  onOpenLibrary: () => void;
  onOpenDirectory: () => void;
  onOpenAdmin: () => void;
  onLogin: () => void;
}

export const Header: React.FC<Props> = ({ 
  onReset, showReset, onOpenLibrary, onOpenDirectory, onOpenAdmin, onLogin 
}) => {
  const { language, setLanguage, uiText } = usePreferences();
  const { user } = useAuth();
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  // Keyboard shortcuts handler - Flexy loves modular shortcuts!
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // New Research shortcut (Ctrl/Cmd + R)
    if (matchesShortcut(e, KEYBOARD_SHORTCUTS.navigation.newResearch) && showReset) {
      e.preventDefault();
      onReset();
    }
    
    // Open Library shortcut (Ctrl/Cmd + L)
    if (matchesShortcut(e, KEYBOARD_SHORTCUTS.navigation.openLibrary)) {
      e.preventDefault();
      onOpenLibrary();
    }
    
    // Open Directory shortcut (Ctrl/Cmd + D)
    if (matchesShortcut(e, KEYBOARD_SHORTCUTS.navigation.openDirectory)) {
      e.preventDefault();
      onOpenDirectory();
    }
    
    // Show keyboard shortcuts help (not when typing in inputs)
    if (matchesShortcut(e, KEYBOARD_SHORTCUTS.help.showShortcuts)) {
      if (!isInputElement(document.activeElement)) {
        e.preventDefault();
        setShowShortcutsModal(prev => !prev);
      }
    }
  }, [onReset, showReset, onOpenLibrary, onOpenDirectory]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <header className="w-full py-4 px-4 md:px-8 flex flex-col md:flex-row justify-between items-center border-b border-white/5 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 gap-4 md:gap-0 transition-all duration-300">
      
      {/* Brand Logo */}
      <div 
        className="flex items-center gap-2 text-emerald-400 cursor-pointer group" 
        onClick={onReset}
        role="button"
        tabIndex={0}
        aria-label="TrendVenturesAI - Go to Home / Reset"
        onKeyDown={(e) => e.key === 'Enter' && onReset()}
      >
        <div className="bg-slate-900/50 p-2 rounded-lg border border-white/5 group-hover:border-emerald-500/30 transition-colors">
           <TrendingUp className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold tracking-tighter text-white">
          {BRAND_CONFIG.NAME}<span className="text-emerald-400">{BRAND_CONFIG.NAME_HIGHLIGHT}</span>
        </h1>
      </div>

      {/* Navigation Groups */}
      <div className="flex flex-wrap justify-center items-center gap-3">
        
        {/* Group 1: Core Navigation */}
        <nav className="flex items-center gap-1 bg-slate-900/50 p-1 rounded-xl border border-white/5">
          <Tooltip content={`${uiText.discover || "Discover"} (${formatShortcut(KEYBOARD_SHORTCUTS.navigation.openDirectory)})`} position="bottom">
            <button
              onClick={onOpenDirectory}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-blue-400 transition-all text-xs font-bold"
              aria-label={`${uiText.discover || "Discover Blueprints"} (${formatShortcut(KEYBOARD_SHORTCUTS.navigation.openDirectory)})`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{uiText.discover || "Discover"}</span>
            </button>
          </Tooltip>

          <Tooltip content={`${uiText.library} (${formatShortcut(KEYBOARD_SHORTCUTS.navigation.openLibrary)})`} position="bottom">
            <button
              onClick={onOpenLibrary}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-emerald-400 transition-all text-xs font-bold"
              aria-label={`${uiText.library} (${formatShortcut(KEYBOARD_SHORTCUTS.navigation.openLibrary)})`}
            >
              <BookMarked className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{uiText.library}</span>
            </button>
          </Tooltip>
        </nav>

        {/* Group 2: Actions & User */}
        <div className="flex items-center gap-3">
          {showReset && (
            <button 
              onClick={onReset}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-xs font-bold border border-slate-700 shadow-sm group"
              aria-label="Start New Research (Ctrl+R)"
              title="New Research (Ctrl+R)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{uiText.newResearch}</span>
              <kbd className={`hidden md:inline-flex items-center gap-0.5 ml-1 px-1.5 py-0.5 ${FONT_SIZES['2xs']} font-mono bg-slate-900 rounded text-slate-400 group-hover:text-slate-300 transition-colors`}>
                <span className={FONT_SIZES['3xs']}>Ctrl</span>+
                <span>R</span>
              </kbd>
            </button>
          )}

          {/* User Controls Group */}
          <div className="flex items-center bg-slate-900/50 p-1 rounded-xl border border-white/5 gap-1">
            {/* Admin */}
            <Tooltip content="Admin Panel" position="bottom">
              <button
                onClick={onOpenAdmin}
                className="p-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                aria-label="Open Admin Panel"
              >
                <Shield className="w-3.5 h-3.5" />
              </button>
            </Tooltip>

            {/* Auth / Dashboard */}
            <button 
              onClick={onLogin}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-xs font-bold ${
                user 
                ? 'bg-indigo-900/30 text-indigo-300 hover:bg-indigo-900/50' 
                : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
              title={user ? "Go to Dashboard" : "Log In"}
              aria-label={user ? "Open Dashboard" : "Log In"}
            >
              {user ? <LayoutDashboard className="w-3.5 h-3.5" /> : <LogIn className="w-3.5 h-3.5" />}
              {user ? <span className="max-w-[80px] truncate hidden sm:inline">{uiText.dashboard || "Dashboard"}</span> : <span className="hidden sm:inline">{uiText.login || "Login"}</span>}
            </button>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center bg-slate-900/50 border border-white/5 rounded-xl p-1" role="group" aria-label="Language Selection">
               <button
                 onClick={() => setLanguage('id')}
                 className={`w-8 h-7 flex items-center justify-center rounded-lg ${FONT_SIZES['2xs']} font-black transition-all ${language === 'id' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-300 hover:text-white'}`}
                 aria-label="ID - Switch to Indonesian"
                 aria-pressed={language === 'id'}
               >
                 ID
               </button>
               <button
                 onClick={() => setLanguage('en')}
                 className={`w-8 h-7 flex items-center justify-center rounded-lg ${FONT_SIZES['2xs']} font-black transition-all ${language === 'en' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-300 hover:text-white'}`}
                 aria-label="Switch to English"
                 aria-pressed={language === 'en'}
               >
                 EN
               </button>
            </div>

          {/* Keyboard Shortcuts Button */}
          <Tooltip content={language === 'id' ? 'Pintasan Keyboard (?)' : 'Keyboard Shortcuts (?)'} position="bottom">
            <button
              onClick={() => setShowShortcutsModal(true)}
              className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
              aria-label={language === 'id' ? 'Buka bantuan pintasan keyboard' : 'Open keyboard shortcuts help'}
            >
              <Keyboard className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>

      </div>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal 
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
        language={language}
      />
    </header>
  );
};
