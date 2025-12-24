
import React, { useState } from 'react';
import { BusinessIdea } from '../types';
import { Briefcase, Loader2, Play, Database, Swords, DollarSign, Target, ArrowRight, Zap, LayoutGrid, Table } from 'lucide-react';

interface Props {
  ideas: BusinessIdea[];
  isGeneratingIdeas: boolean;
  isGeneratingBlueprint: boolean;
  loadingStepIndex: number;
  hasSelection: boolean;
  onGenerate: () => void;
  onSelectIdea: (idea: BusinessIdea) => void;
  uiText: any;
}

export const BusinessOpportunities: React.FC<Props> = ({
  ideas,
  isGeneratingIdeas,
  isGeneratingBlueprint,
  loadingStepIndex,
  hasSelection,
  onGenerate,
  onSelectIdea,
  uiText
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'compare'>('grid');

  return (
    <div className="space-y-6">
      
      {/* Empty State: GENERATE CTA */}
      {ideas.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border border-slate-800">
           {isGeneratingIdeas ? (
             <div className="flex flex-col items-center animate-[fadeIn_0.5s_ease-out]">
               <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mb-4" />
               <h3 className="text-xl font-bold text-white mb-2">Generating Opportunities...</h3>
               <p className="text-slate-400 text-sm">Synthesizing selected trends into business models.</p>
             </div>
           ) : (
             <div className="flex flex-col items-center text-center max-w-lg px-4 animate-[slideUp_0.4s_ease-out]">
               <div className="w-16 h-16 bg-emerald-900/20 rounded-full flex items-center justify-center mb-6">
                 <Briefcase className="w-8 h-8 text-emerald-400" />
               </div>
               <h3 className="text-2xl font-bold text-white mb-3">Ready to Build?</h3>
               <p className="text-slate-400 mb-8">
                 Review the trends above. Deselect any that don't fit your vision. 
                 When ready, click below to generate tailored business opportunities.
               </p>
               <button
                 onClick={onGenerate}
                 disabled={!hasSelection}
                 className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-lg shadow-lg shadow-emerald-900/20 transition-all hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
               >
                 <Play className="w-5 h-5 fill-current" />
                 Generate Opportunities
               </button>
               {!hasSelection && (
                 <p className="text-red-400 text-xs mt-3">Please select at least one trend.</p>
               )}
             </div>
           )}
        </div>
      )}

      {/* Ideas Grid (Only if populated) */}
      {ideas.length > 0 && (
        <>
          <div className="flex justify-between items-center mb-8">
             <h3 className="text-3xl font-bold text-white">{uiText.opportunities}</h3>
             
             {/* View Toggle */}
             {!isGeneratingBlueprint && (
               <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
                 <button 
                   onClick={() => setViewMode('grid')}
                   className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                   title="Grid View"
                 >
                   <LayoutGrid className="w-4 h-4" />
                 </button>
                 <button 
                   onClick={() => setViewMode('compare')}
                   className={`p-2 rounded-md transition-all ${viewMode === 'compare' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                   title="Comparison Table"
                 >
                   <Table className="w-4 h-4" />
                 </button>
               </div>
             )}
          </div>
          
          {isGeneratingBlueprint ? (
             <div className="flex flex-col items-center justify-center py-20 bg-slate-900/30 rounded-2xl border border-slate-800/50">
               <div className="relative w-24 h-24 mb-8">
                 <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full"></div>
                 <div className="absolute inset-0 border-4 border-t-emerald-500 rounded-full animate-spin"></div>
                 <Briefcase className="absolute inset-0 m-auto text-emerald-400 w-10 h-10 animate-pulse" />
               </div>
               
               <div className="flex flex-col items-center h-20">
                  <h4 className="text-xl font-bold text-white mb-2 animate-[fadeIn_0.5s_ease-in-out]">
                    {uiText.building}
                  </h4>
                  <p className="text-emerald-400 font-mono text-sm animate-[pulse_2s_infinite]">
                    {uiText.loadingSteps[loadingStepIndex]}
                  </p>
               </div>
               
               <p className="text-slate-500 text-xs mt-8 max-w-xs text-center">
                 {uiText.buildingDesc}
               </p>
             </div>
          ) : viewMode === 'compare' ? (
             /* Comparison View */
             <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 animate-[fadeIn_0.3s_ease-out]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider">
                      <th className="p-4 font-bold border-b border-slate-800">Idea</th>
                      <th className="p-4 font-bold border-b border-slate-800">Model</th>
                      <th className="p-4 font-bold border-b border-slate-800">Difficulty</th>
                      <th className="p-4 font-bold border-b border-slate-800">Revenue</th>
                      <th className="p-4 font-bold border-b border-slate-800">Rationale</th>
                      <th className="p-4 font-bold border-b border-slate-800">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {ideas.map((idea) => (
                       <tr key={idea.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="p-4">
                             <div className="font-bold text-white">{idea.name}</div>
                             <div className="text-[10px] text-slate-500 mt-1">{idea.type}</div>
                          </td>
                          <td className="p-4 text-sm text-slate-300">{idea.monetizationModel}</td>
                          <td className="p-4">
                             <span className={`text-xs px-2 py-1 rounded border ${
                               idea.difficulty === 'Low' ? 'bg-emerald-900/20 text-emerald-400 border-emerald-500/20' :
                               idea.difficulty === 'Medium' ? 'bg-yellow-900/20 text-yellow-400 border-yellow-500/20' :
                               'bg-red-900/20 text-red-400 border-red-500/20'
                             }`}>
                               {idea.difficulty}
                             </span>
                          </td>
                          <td className="p-4 text-sm text-slate-300 font-mono">{idea.potentialRevenue}</td>
                          <td className="p-4 text-xs text-slate-400 max-w-xs">{idea.rationale}</td>
                          <td className="p-4">
                             <button
                               onClick={() => onSelectIdea(idea)}
                               className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold whitespace-nowrap"
                             >
                               Build
                             </button>
                          </td>
                       </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-[fadeIn_0.5s_ease-out]">
              {ideas.map((idea) => {
                const isCached = !!idea.cachedBlueprint;
                return (
                  <div key={idea.id} className={`group relative bg-slate-900 border rounded-2xl p-6 transition-all hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.2)] flex flex-col ${isCached ? 'border-indigo-500/30 hover:border-indigo-500/60' : 'border-slate-800 hover:border-emerald-500/50'}`}>
                    
                    <div className="absolute top-4 right-4 flex gap-2">
                      {isCached && (
                         <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 px-2 py-1 rounded flex items-center gap-1">
                           <Database className="w-3 h-3" /> Cached
                         </span>
                      )}
                      <span className="text-[10px] font-mono text-slate-500 border border-slate-800 px-2 py-1 rounded">
                        {idea.type}
                      </span>
                    </div>
                    
                    <h4 className={`text-xl font-bold mb-2 transition-colors ${isCached ? 'text-indigo-100 group-hover:text-indigo-300' : 'text-white group-hover:text-emerald-400'}`}>
                      {idea.name}
                    </h4>
                    <p className="text-slate-400 text-sm mb-4 flex-grow">
                      {idea.description}
                    </p>
                    
                    {/* Competitor Analysis */}
                    {idea.competitors && idea.competitors.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2 font-bold uppercase tracking-wider">
                          <Swords className="w-3 h-3" /> Challengers
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {idea.competitors.map((comp, idx) => (
                            <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-400 border border-slate-700/50">
                              {comp}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <DollarSign className={`w-4 h-4 ${isCached ? 'text-indigo-500' : 'text-emerald-500'}`} />
                        <span>{idea.potentialRevenue}</span>
                      </div>
                       <div className="flex items-center gap-2 text-sm text-slate-300">
                        <Target className="w-4 h-4 text-blue-500" />
                        <span>{uiText.model}: {idea.monetizationModel}</span>
                      </div>
                    </div>

                    <div className="bg-slate-950/50 p-3 rounded-lg mb-6 border border-slate-800/50">
                      <p className="text-xs text-slate-400 italic">"{idea.rationale}"</p>
                    </div>

                    <button
                      onClick={() => onSelectIdea(idea)}
                      className={`w-full py-3 font-bold rounded-lg transition-colors flex justify-center items-center gap-2 mt-auto ${
                        isCached 
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white' 
                        : 'bg-white text-slate-950 hover:bg-emerald-400'
                      }`}
                    >
                      {isCached ? (
                        <>
                           {uiText.viewBlueprint} <ArrowRight className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          {uiText.buildBlueprint} <Zap className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};
