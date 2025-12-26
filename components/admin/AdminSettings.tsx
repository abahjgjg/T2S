
import React, { useRef } from 'react';
import { Sparkles, Bot, ShieldCheck, ShieldAlert, Database, Upload, Download, AlertTriangle } from 'lucide-react';
import { AIProvider } from '../../types';
import { toast } from '../ToastNotifications';
import { indexedDBService } from '../../utils/storageUtils';

interface Props {
  provider: AIProvider;
  setProvider: (p: AIProvider) => void;
  ownerEmail: string | null;
  onResetOwnership: () => void;
}

export const AdminSettings: React.FC<Props> = ({ provider, setProvider, ownerEmail, onResetOwnership }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBackup = async () => {
    try {
      const json = await indexedDBService.exportDatabase();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `trendventures_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("System backup created");
    } catch (e) {
      console.error(e);
      toast.error("Failed to create backup");
    }
  };

  const handleImportClick = () => {
    if (window.confirm("Restoring a backup will merge old projects into your current library. Overwriting may occur. Continue?")) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      await indexedDBService.importDatabase(text);
      toast.success("Database restored successfully");
      // Optional: Reload to reflect changes
      setTimeout(() => window.location.reload(), 1500);
    } catch (e) {
      console.error(e);
      toast.error("Failed to restore database. Invalid file.");
    } finally {
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-[fadeIn_0.3s_ease-out]">
      
      {/* AI Provider Section */}
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

      {/* Data Management Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
           <Database className="w-5 h-5 text-blue-400" /> Data Management
        </h3>
        <p className="text-sm text-slate-400 mb-6">
          Backup your local library, custom prompts, and settings. 
          Useful for migrating between devices without a cloud account.
        </p>
        
        <div className="grid grid-cols-2 gap-4">
           <button 
             onClick={handleBackup}
             className="flex flex-col items-center justify-center p-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 rounded-xl transition-all group"
           >
             <Download className="w-6 h-6 text-slate-500 group-hover:text-blue-400 mb-2" />
             <span className="text-sm font-bold text-slate-300 group-hover:text-white">Backup Data</span>
             <span className="text-[10px] text-slate-500">Export JSON</span>
           </button>

           <button 
             onClick={handleImportClick}
             className="flex flex-col items-center justify-center p-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 rounded-xl transition-all group"
           >
             <Upload className="w-6 h-6 text-slate-500 group-hover:text-emerald-400 mb-2" />
             <span className="text-sm font-bold text-slate-300 group-hover:text-white">Restore Data</span>
             <span className="text-[10px] text-slate-500">Import JSON</span>
           </button>
           <input 
             type="file" 
             ref={fileInputRef} 
             className="hidden" 
             accept=".json" 
             onChange={handleFileChange} 
           />
        </div>
      </div>

      {/* Admin Access Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
           <ShieldCheck className="w-5 h-5 text-emerald-400" /> Admin Access
        </h3>
        <p className="text-sm text-slate-400 mb-6">
          Current Owner: <span className="font-mono text-white bg-slate-950 px-2 py-1 rounded">{ownerEmail}</span>
        </p>
        
        <div className="bg-red-900/10 border border-red-500/20 p-4 rounded-lg flex items-start gap-3 mb-4">
           <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
           <div className="text-xs text-red-400">
             <span className="font-bold">Danger Zone:</span> Resetting ownership allows any authenticated user to claim Admin rights. 
             Only do this if you are transferring ownership.
           </div>
        </div>

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
