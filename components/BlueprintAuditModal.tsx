
import React from 'react';
import { ViabilityAudit } from '../types';
import { X, Target, Zap, AlertTriangle, ArrowRight, ShieldCheck, CheckCircle2, RefreshCcw } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';

interface Props {
  audit: ViabilityAudit;
  isOpen: boolean;
  onClose: () => void;
  onApplyPivot: (pivot: string) => void;
  isPivoting: boolean;
}

export const BlueprintAuditModal: React.FC<Props> = ({ audit, isOpen, onClose, onApplyPivot, isPivoting }) => {
  if (!isOpen) return null;

  // Prepare data for Radar Chart
  const radarData = audit.dimensions.map(d => ({
    subject: d.name,
    A: d.score,
    fullMark: 100,
  }));

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col relative max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
               <ShieldCheck className="w-6 h-6 text-purple-500" />
             </div>
             <div>
               <h2 className="text-xl font-bold text-white">Viability Audit</h2>
               <p className="text-xs text-slate-400">AI Venture Capitalist Assessment</p>
             </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white p-2 hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
           
           {/* Top Section: Score & Chart */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="flex flex-col items-center justify-center text-center p-6 bg-slate-950 border border-slate-800 rounded-xl">
                 <div className={`text-6xl font-black mb-2 ${getScoreColor(audit.overallScore)}`}>
                   {audit.overallScore}
                 </div>
                 <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Overall Viability</div>
                 <div className="text-sm text-slate-400 italic max-w-xs">
                   "A weighted analysis of market fit, tech feasibility, and monetization potential."
                 </div>
              </div>

              <div className="h-[250px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar
                        name="Score"
                        dataKey="A"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.4}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                        itemStyle={{ color: '#a78bfa' }}
                      />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* Hard Truths */}
           <div className="bg-red-900/10 border border-red-500/20 rounded-xl p-6">
              <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Hard Truths
              </h3>
              <ul className="space-y-3">
                {audit.hardTruths.map((truth, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0"></div>
                    {truth}
                  </li>
                ))}
              </ul>
           </div>

           {/* Dimensions Detail */}
           <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" /> Dimension Analysis
              </h3>
              <div className="grid grid-cols-1 gap-3">
                 {audit.dimensions.map((dim, i) => (
                   <div key={i} className="bg-slate-950 border border-slate-800 p-4 rounded-lg flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                      <div className="w-full sm:w-32 shrink-0">
                         <div className="flex justify-between items-center mb-1">
                           <span className="text-xs font-bold text-slate-400 uppercase">{dim.name}</span>
                           <span className={`text-xs font-bold ${getScoreColor(dim.score)}`}>{dim.score}</span>
                         </div>
                         <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                           <div className={`h-full ${dim.score >= 80 ? 'bg-emerald-500' : dim.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${dim.score}%` }}></div>
                         </div>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed border-l border-slate-800 pl-4">
                        {dim.comment}
                      </p>
                   </div>
                 ))}
              </div>
           </div>

           {/* Pivot Suggestions */}
           <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-6">
              <h3 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5" /> Recommended Pivots
              </h3>
              <div className="space-y-3">
                {audit.pivotSuggestions.map((pivot, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-emerald-950/30 rounded-lg border border-emerald-500/10 group">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <p className="text-slate-300 text-sm italic">"{pivot}"</p>
                    </div>
                    <button 
                      onClick={() => onApplyPivot(pivot)}
                      disabled={isPivoting}
                      className="ml-4 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-50"
                    >
                      {isPivoting ? <RefreshCcw className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                      Apply Pivot
                    </button>
                  </div>
                ))}
              </div>
           </div>

        </div>
      </div>
    </div>
  );
};
