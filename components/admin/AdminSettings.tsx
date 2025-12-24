
import React from 'react';
import { Sparkles, Bot, ShieldCheck, ShieldAlert } from 'lucide-react';
import { AIProvider } from '../../types';
import { toast } from '../ToastNotifications';

interface Props {
  provider: AIProvider;
  setProvider: (p: AIProvider) => void;
  ownerEmail: string | null;
  onResetOwnership: () => void;
}

export const AdminSettings: React.FC<Props> = ({ provider, setProvider, ownerEmail, onResetOwnership }) => {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-[fadeIn_0.3s_ease-out]">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" /> AI Provider Configuration
        </h3>
        
        <div className="space-y-4">
          <div 
            onClick={() => { setProvider('gemini'); toast.success('Switched to Gemini'); }}
            className={`p-4 rounded-lg border cursor-pointer transition-all flex items-start gap-4 ${
              provider === 'gemini' 
              ? 'bg-emerald-900/20 border-emerald-500/50' 
              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              provider === 'gemini' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'
            }`}>
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-white">Google Gemini (Recommended)</h4>
              <p className="text-xs text-slate-400 mt-1">
                Best for: Live Audio, Search Grounding, Deep Thinking Models.
                <br/>
                <span className="text-emerald-400">Supports: gemini-3-pro-preview, native-audio-preview</span>
              </p>
            </div>
          </div>

          <div 
            onClick={() => { setProvider('openai'); toast.success('Switched to OpenAI'); }}
            className={`p-4 rounded-lg border cursor-pointer transition-all flex items-start gap-4 ${
              provider === 'openai' 
              ? 'bg-blue-900/20 border-blue-500/50' 
              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              provider === 'openai' ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-500'
            }`}>
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-white">OpenAI</h4>
              <p className="text-xs text-slate-400 mt-1">
                Best for: GPT-4o Reasoning, DALL-E 3 Images.
                <br/>
                <span className="text-blue-400">Supports: gpt-4o, tts-1, dall-e-3</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
           <ShieldCheck className="w-5 h-5 text-emerald-400" /> Admin Access
        </h3>
        <p className="text-sm text-slate-400 mb-6">
          Current Owner: <span className="font-mono text-white bg-slate-950 px-2 py-1 rounded">{ownerEmail}</span>
        </p>
        <button 
          onClick={onResetOwnership}
          className="w-full py-3 bg-red-900/20 hover:bg-red-900/30 text-red-400 border border-red-500/30 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
        >
          <ShieldAlert className="w-4 h-4" /> Reset Owner
        </button>
      </div>
    </div>
  );
};
