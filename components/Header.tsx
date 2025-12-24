
import React from 'react';
import { TrendingUp, RotateCcw, BookMarked, Compass, User, LogIn, LayoutDashboard, Shield, MoreHorizontal } from 'lucide-react';
import { Language, UserProfile } from '../types';

interface Props {
  language: Language;
  setLanguage: (lang: Language) => void;
  onReset: () => void;
  showReset: boolean;
  onOpenLibrary: () => void;
  onOpenDirectory: () => void;
  onOpenAdmin: () => void;
  onLogin: () => void;
  user: UserProfile | null;
  uiText: any;
}

export const Header: React.FC<Props> = ({ language, setLanguage, onReset, showReset, onOpenLibrary, onOpenDirectory, onOpenAdmin, onLogin, user, uiText }) => {
  return (
    <header className="w-full py-4 px-4 md:px-8 flex flex-col md:flex-row justify-between items-center border-b border-white/5 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 gap-4 md:gap-0 transition-all duration-300">
      
      {/* Brand Logo */}
      <div 
        className="flex items-center gap-2 text-emerald-400 cursor-pointer group" 
        onClick={onReset}
      >
        <div className="bg-slate-900/50 p-2 rounded-lg border border-white/5 group-hover:border-emerald-500/30 transition-colors">
           <TrendingUp className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold tracking-tighter text-white">
          Trend<span className="text-emerald-400">Ventures</span> AI
        </h1>
      </div>

      {/* Navigation Groups */}
      <div className="flex flex-wrap justify-center items-center gap-3">
        
        {/* Group 1: Core Navigation */}
        <nav className="flex items-center gap-1 bg-slate-900/50 p-1 rounded-xl border border-white/5">
          <button 
            onClick={onOpenDirectory}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-blue-400 transition-all text-xs font-bold"
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{uiText.discover || "Discover"}</span>
          </button>

          <button 
            onClick={onOpenLibrary}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition-all text-xs font-bold"
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{uiText.library}</span>
          </button>
        </nav>

        {/* Group 2: Actions & User */}
        <div className="flex items-center gap-3">
          {showReset && (
            <button 
              onClick={onReset}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-xs font-bold border border-slate-700 shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{uiText.newResearch}</span>
            </button>
          )}

          {/* User Controls Group */}
          <div className="flex items-center bg-slate-900/50 p-1 rounded-xl border border-white/5 gap-1">
            {/* Admin */}
            <button
              onClick={onOpenAdmin}
              className="p-2 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
              title="Admin Panel"
            >
              <Shield className="w-3.5 h-3.5" />
            </button>

            {/* Auth / Dashboard */}
            <button 
              onClick={onLogin}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-xs font-bold ${
                user 
                ? 'bg-indigo-900/30 text-indigo-300 hover:bg-indigo-900/50' 
                : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
              title={user ? "Go to Dashboard" : "Log In"}
            >
              {user ? <LayoutDashboard className="w-3.5 h-3.5" /> : <LogIn className="w-3.5 h-3.5" />}
              {user ? <span className="max-w-[80px] truncate hidden sm:inline">Dashboard</span> : <span className="hidden sm:inline">Login</span>}
            </button>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center bg-slate-900/50 border border-white/5 rounded-xl p-1">
            <button 
              onClick={() => setLanguage('id')}
              className={`w-8 h-7 flex items-center justify-center rounded-lg text-[10px] font-black transition-all ${language === 'id' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500 hover:text-white'}`}
            >
              ID
            </button>
            <button 
              onClick={() => setLanguage('en')}
              className={`w-8 h-7 flex items-center justify-center rounded-lg text-[10px] font-black transition-all ${language === 'en' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500 hover:text-white'}`}
            >
              EN
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};
