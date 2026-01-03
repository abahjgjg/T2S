
import React from 'react';
import { SWOTAnalysis } from '../types';
import { Shield, Zap, TrendingUp, AlertTriangle, Target } from 'lucide-react';
import { usePreferences } from '../contexts/PreferencesContext';

interface Props {
  data: SWOTAnalysis;
}

export const SwotAnalysis: React.FC<Props> = ({ data }) => {
  const { uiText } = usePreferences();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8 print:break-inside-avoid">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Target className="w-5 h-5 text-blue-400" /> {uiText.swotTitle || "Strategic Analysis"}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Strengths */}
        <div className="bg-slate-950/50 border border-emerald-500/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3 text-emerald-400 font-bold uppercase tracking-wider text-sm">
            <Shield className="w-4 h-4" /> {uiText.strengths || "Strengths"}
          </div>
          <ul className="space-y-2">
            {data.strengths.map((item, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="bg-slate-950/50 border border-orange-500/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3 text-orange-400 font-bold uppercase tracking-wider text-sm">
            <AlertTriangle className="w-4 h-4" /> {uiText.weaknesses || "Weaknesses"}
          </div>
          <ul className="space-y-2">
            {data.weaknesses.map((item, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0"></div>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Opportunities */}
        <div className="bg-slate-950/50 border border-blue-500/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3 text-blue-400 font-bold uppercase tracking-wider text-sm">
            <Zap className="w-4 h-4" /> {uiText.swotOpportunities || "Opportunities"}
          </div>
          <ul className="space-y-2">
            {data.opportunities.map((item, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Threats */}
        <div className="bg-slate-950/50 border border-red-500/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3 text-red-400 font-bold uppercase tracking-wider text-sm">
            <TrendingUp className="w-4 h-4" /> {uiText.threats || "Threats"}
          </div>
          <ul className="space-y-2">
            {data.threats.map((item, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></div>
                {item}
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
};
