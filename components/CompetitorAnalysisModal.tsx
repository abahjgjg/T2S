
import React, { useState } from 'react';
import { Swords, Loader2, Globe, Activity, AlertTriangle, CheckCircle2, ShieldPlus, Check, X } from 'lucide-react';
import { CompetitorAnalysis } from '../types';
import { toast } from './ToastNotifications';
import { Modal } from './ui/Modal';
import { usePreferences } from '../contexts/PreferencesContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  analyzingCompetitor: string | null;
  competitorData: CompetitorAnalysis | null;
  onSaveToSWOT: (strengths: string[], weaknesses: string[]) => void;
}

export const CompetitorAnalysisModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  analyzingCompetitor, 
  competitorData, 
  onSaveToSWOT
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const { uiText } = usePreferences();

  const handleAddToSWOT = () => {
    if (!competitorData) return;
    const mappedThreats = competitorData.strengths.map(s => `${competitorData.name}: ${s}`);
    const mappedOpportunities = competitorData.weaknesses.map(w => `${competitorData.name} gap: ${w}`);
    
    onSaveToSWOT(mappedThreats, mappedOpportunities);
    setIsSaved(true);
    toast.success("SWOT Analysis Updated");
  };

  const Header = (
    <h3 className="text-xl font-bold text-white flex items-center gap-2">
      <Swords className="w-5 h-5 text-orange-500" />
      {analyzingCompetitor ? `Analyzing: ${analyzingCompetitor}` : competitorData?.name}
    </h3>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={Header}>
      <div className="p-6">
          {analyzingCompetitor ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-3" />
              <p className="text-slate-400 animate-pulse">{uiText.analyzingComp}</p>
            </div>
          ) : competitorData ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800"><div className="text-xs text-slate-500 uppercase font-bold mb-1">{uiText.marketPosition}</div><div className="text-sm font-semibold text-white">{competitorData.marketPosition}</div></div>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800"><div className="text-xs text-slate-500 uppercase font-bold mb-1">{uiText.pricingStrategy}</div><div className="text-sm font-semibold text-white">{competitorData.pricingStrategy}</div></div>
              </div>
              {competitorData.website && (<a href={competitorData.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm"><Globe className="w-4 h-4" /> {competitorData.website}</a>)}
              <div><h4 className="flex items-center gap-2 text-emerald-400 font-bold mb-2 text-sm uppercase tracking-wider"><Activity className="w-4 h-4" /> {uiText.strengths}</h4><ul className="space-y-1">{competitorData.strengths.map((s, i) => (<li key={i} className="text-sm text-slate-300 flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-emerald-500" /> {s}</li>))}</ul></div>
              <div><h4 className="flex items-center gap-2 text-red-400 font-bold mb-2 text-sm uppercase tracking-wider"><AlertTriangle className="w-4 h-4" /> {uiText.weaknesses}</h4><ul className="space-y-1">{competitorData.weaknesses.map((w, i) => (<li key={i} className="text-sm text-slate-300 flex items-start gap-2"><X className="w-3.5 h-3.5 mt-0.5 text-red-500" /> {w}</li>))}</ul></div>
              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button onClick={handleAddToSWOT} disabled={isSaved} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${isSaved ? 'bg-emerald-900/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'}`}>{isSaved ? <Check className="w-4 h-4" /> : <ShieldPlus className="w-4 h-4" />}{isSaved ? "Insights Added" : "Add Insights to SWOT"}</button>
              </div>
            </div>
          ) : (
            <div className="text-center text-red-400">Analysis failed.</div>
          )}
      </div>
    </Modal>
  );
};
