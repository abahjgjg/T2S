import React from 'react';
import { Swords, Map as MapIcon, ArrowLeft } from 'lucide-react';
import { usePreferences } from '../../contexts/PreferencesContext';

interface Props {
  competitors: string[];
  onAnalyze: (name: string) => void;
  onScoutLocation: () => void;
}

export const BlueprintCompetitors: React.FC<Props> = ({ competitors, onAnalyze, onScoutLocation }) => {
  const { uiText } = usePreferences();
  
  if (!competitors || competitors.length === 0) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8 print:break-inside-avoid">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 text-white font-bold text-lg">
          <Swords className="w-5 h-5 text-orange-400" />
          <h3>{uiText.competitors || "Competitor Landscape"}</h3>
        </div>
        
        <button 
          onClick={onScoutLocation}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-900/20 hover:bg-blue-900/30 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-bold transition-colors"
        >
          <MapIcon className="w-4 h-4" /> {uiText.locationScout}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {competitors.map((comp, idx) => (
          <div 
            key={idx} 
            onClick={() => onAnalyze(comp)}
            className="bg-slate-950 border border-slate-800 hover:border-orange-500/50 p-4 rounded-lg cursor-pointer transition-all group relative overflow-hidden"
          >
            <div className="flex justify-between items-center mb-1">
              <h4 className="font-bold text-slate-200 group-hover:text-orange-400">{comp}</h4>
              <ArrowLeft className="w-4 h-4 text-slate-600 rotate-180 group-hover:text-orange-400 transition-colors" />
            </div>
            <p className="text-xs text-slate-500">{uiText.analyze || "Analyze"}</p>
          </div>
        ))}
      </div>
    </div>
  );
};