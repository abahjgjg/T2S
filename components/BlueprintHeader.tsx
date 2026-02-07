import React, { useState } from 'react';
import { ArrowLeft, Check, Link as LinkIcon, CheckCircle2, BookmarkPlus, FileJson, FileText, Printer, Presentation } from 'lucide-react';
import { toast } from './ToastNotifications';
import { usePreferences } from '../contexts/PreferencesContext';
import { copyWithFeedback } from '../utils/clipboardUtils';

interface Props {
  onBack: () => void;
  onSave: () => void;
  onExportJSON: () => void;
  onExportMD: () => void;
  onPrint: () => void;
  onPresent: () => void;
  publishedUrl: string | null;
  isSaved: boolean;
}

export const BlueprintHeader: React.FC<Props> = ({ 
  onBack, 
  onSave, 
  onExportJSON, 
  onExportMD, 
  onPrint, 
  onPresent,
  publishedUrl, 
  isSaved
}) => {
  const { uiText } = usePreferences();
  const [linkCopied, setLinkCopied] = useState(false);

  const handleCopyLink = () => {
    if (publishedUrl) {
      copyWithFeedback(publishedUrl, setLinkCopied);
      toast.success(uiText.publicLinkCopied);
    }
  };

  const handleSaveWrapper = () => {
    onSave();
    if (!isSaved) toast.success(uiText.saved);
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-semibold group print:hidden"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        {uiText.back}
      </button>

      <div className="flex flex-wrap items-center gap-2 print:hidden">
        {publishedUrl && (
          <button 
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors text-sm font-bold"
            title="Copy Public Link"
          >
            {linkCopied ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
            {linkCopied ? uiText.copied : uiText.copyLink}
          </button>
        )}

        <button 
          onClick={onPresent}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm font-bold border border-slate-700"
        >
          <Presentation className="w-4 h-4 text-emerald-400" />
          {uiText.presentDeck}
        </button>

        <button 
          onClick={handleSaveWrapper}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-bold border ${isSaved ? 'bg-emerald-900/20 border-emerald-500/50 text-emerald-400' : 'bg-slate-800 border-slate-700 hover:border-emerald-500/50 text-slate-300'}`}
        >
          {isSaved ? <CheckCircle2 className="w-4 h-4" /> : <BookmarkPlus className="w-4 h-4" />}
          {isSaved ? uiText.saved : uiText.saveToLib}
        </button>
        
        <button 
          onClick={onExportJSON}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
          title={uiText.exportJson}
        >
          <FileJson className="w-4 h-4" />
        </button>
        <button 
          onClick={onExportMD}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
          title={uiText.exportMd}
        >
          <FileText className="w-4 h-4" />
        </button>
        <button 
          onClick={onPrint}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
          title={uiText.export}
        >
          <Printer className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};