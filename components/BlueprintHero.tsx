import React from 'react';
import { Layers, Mic, Loader2, StopCircle, Volume2 } from 'lucide-react';
import { BusinessIdea, Blueprint } from '../types';
import { usePreferences } from '../contexts/PreferencesContext';

interface Props {
  idea: BusinessIdea;
  blueprint: Blueprint;
  isGemini: boolean;
  onPitch: () => void;
  onPlaySummary: () => void;
  audioState: {
    isPlaying: boolean;
    isLoading: boolean;
    error: string | null;
  };
}

export const BlueprintHero: React.FC<Props> = ({ 
  idea, 
  blueprint, 
  isGemini, 
  onPitch, 
  onPlaySummary, 
  audioState 
}) => {
  const { uiText } = usePreferences();

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between h-full print:bg-none print:border-slate-200 print:text-black print:shadow-none">
      <div className="absolute top-0 right-0 p-4 opacity-10 print:hidden">
        <Layers className="w-32 h-32 text-emerald-500" />
      </div>
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-emerald-400 font-mono text-sm tracking-wider uppercase mb-2 block print:text-black print:font-bold">{idea.type}</span>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight print:text-black">{idea.name}</h1>
            <div className="flex flex-wrap gap-2 text-sm text-slate-400 print:text-slate-600">
              <span className="bg-slate-800/50 px-2 py-1 rounded print:bg-slate-100 print:border print:border-slate-300">{idea.monetizationModel}</span>
              <span className="bg-slate-800/50 px-2 py-1 rounded print:bg-slate-100 print:border print:border-slate-300">{idea.potentialRevenue}</span>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-3 print:hidden">
            {isGemini && (
              <button onClick={onPitch} className="flex items-center gap-2 px-4 py-2 rounded-full border bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20 transition-all"><Mic className="w-4 h-4" /><span className="text-xs font-bold uppercase tracking-wider">Pitch</span></button>
            )}
            <button onClick={onPlaySummary} disabled={audioState.isLoading} className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${audioState.isPlaying ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'}`}>
              {audioState.isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : audioState.isPlaying ? <StopCircle className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span className="text-xs font-bold uppercase tracking-wider">{audioState.isLoading ? uiText.loadingAudio : audioState.isPlaying ? uiText.stopAudio : uiText.playSummary}</span>
            </button>
          </div>
        </div>
        {audioState.error && <p className="text-red-400 text-xs mt-2 text-right print:hidden">{audioState.error}</p>}
        <div className="prose prose-invert max-w-none mt-6 print:prose-black">
          <h3 className="text-slate-200 font-bold mb-2 print:text-black">Executive Summary</h3>
          <p className="text-slate-300 leading-relaxed text-lg print:text-slate-800">{blueprint.executiveSummary}</p>
        </div>
      </div>
    </div>
  );
};