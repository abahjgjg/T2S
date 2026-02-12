
import React, { useRef } from 'react';
import { Sparkles, Bot, ShieldCheck, ShieldAlert, Database, Upload, Download, AlertTriangle } from 'lucide-react';
import { toast } from '../ToastNotifications';
import { indexedDBService } from '../../utils/storageUtils';
import { AIProvider } from '../../types';
import { DEV_CONFIG } from '../../constants/appConfig';
import { useConfirm } from '../../contexts/ConfirmContext';
import { COLORS } from '../../constants/theme';

interface Props {
  provider: AIProvider;
  setProvider: (provider: AIProvider) => void;
  ownerEmail: string | null;
  onResetOwnership: () => void;
}

export const AdminSettings: React.FC<Props> = ({ provider, setProvider, ownerEmail, onResetOwnership }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { confirm } = useConfirm();

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
      toast.success("Database Exported");
    } catch (e) {
      console.error(e);
      toast.error("Export Failed");
    }
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const confirmed = await confirm({
      title: 'Restore Database?',
      message: 'This will overwrite all current local data with the backup file. This action cannot be undone.',
      confirmText: 'Restore',
      cancelText: 'Cancel',
      variant: 'danger',
    });

    if (!confirmed) {
      return;
    }

    try {
      const text = await file.text();
      await indexedDBService.importDatabase(text);
      toast.success("Database Restored. Reloading...");
      setTimeout(() => window.location.reload(), DEV_CONFIG.RELOAD_DELAY_MS);
    } catch (e) {
      console.error(e);
      toast.error("Import Failed: Invalid File");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-[fadeIn_0.3s_ease-out]">
      {/* AI Provider Config */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-full">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <Bot className="w-5 h-5 text-emerald-400" /> AI Provider
        </h3>
        
        <div className="space-y-4">
          <div 
            onClick={() => setProvider('gemini')}
            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-4 ${
              provider === 'gemini' 
              ? `bg-emerald-900/20 border-emerald-500/50 shadow-[0_0_20px_-5px_${COLORS.shadow.emerald}]` 
              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className={`mt-1 p-2 rounded-lg ${provider === 'gemini' ? 'bg-emerald-500 text-slate-900' : 'bg-slate-800 text-slate-500'}`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className={`font-bold ${provider === 'gemini' ? 'text-white' : 'text-slate-300'}`}>Google Gemini</h4>
              <p className="text-xs text-slate-500 mt-1">Recommended. Supports Live Search Grounding, Deep Research, and Veo Video.</p>
            </div>
          </div>

          <div 
            onClick={() => setProvider('openai')}
            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-4 ${
              provider === 'openai' 
              ? `bg-blue-900/20 border-blue-500/50 shadow-[0_0_20px_-5px_${COLORS.shadow.blue}]` 
              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className={`mt-1 p-2 rounded-lg ${provider === 'openai' ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h4 className={`font-bold ${provider === 'openai' ? 'text-white' : 'text-slate-300'}`}>OpenAI</h4>
              <p className="text-xs text-slate-500 mt-1">Uses GPT-4o. Good for reasoning. No live search or video generation.</p>
            </div>
          </div>
        </div>
      </div>

      {/* System Admin */}
      <div className="space-y-6">
        {/* Ownership */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" /> Access Control
          </h3>
          
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 mb-4">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Current Admin Owner</p>
            <p className="text-white font-mono break-all">{ownerEmail}</p>
          </div>

          <button 
            onClick={onResetOwnership}
            className="w-full py-3 border border-red-500/30 text-red-400 hover:bg-red-900/10 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <ShieldAlert className="w-4 h-4" /> Reset Ownership
          </button>
          <p className="text-[10px] text-slate-500 mt-2 text-center">
            <AlertTriangle className="w-3 h-3 inline mr-1" />
            Warning: This releases the lock. Anyone can claim admin rights.
          </p>
        </div>

        {/* Database Management */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" /> Data Management
          </h3>
          
          <div className="flex gap-3">
            <button 
              onClick={handleBackup}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors border border-slate-700"
            >
              <Download className="w-4 h-4" /> Backup
            </button>
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors border border-slate-700"
            >
              <Upload className="w-4 h-4" /> Restore
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleRestore} 
              accept=".json" 
              className="hidden" 
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-3 text-center">
            Backups include local history, prompts, and settings. Cloud data remains on Supabase.
          </p>
        </div>
      </div>
    </div>
  );
};
