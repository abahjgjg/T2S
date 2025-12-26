
import React from 'react';
import { X, TrendingUp, Calendar, ExternalLink, Loader2, Newspaper, ArrowRight, Share2, Copy, Telescope, Lightbulb, Target, Sparkles, MessageSquare, Globe, Link as LinkIcon, Bot, CheckCircle2 } from 'lucide-react';
import { Trend, TrendDeepDive } from '../types';
import { toast } from './ToastNotifications';

interface Props {
  trend: Trend;
  onClose: () => void;
  isLoading: boolean;
  uiText: any;
  onAskQuestion?: (question: string) => void;
}

export const TrendDeepDiveModal: React.FC<Props> = ({ trend, onClose, isLoading, uiText, onAskQuestion }) => {
  const deepDive = trend.deepDive;

  const handleCopySummary = () => {
    if (deepDive?.summary) {
      navigator.clipboard.writeText(`${trend.title}\n\n${deepDive.summary}`);
      toast.success("Summary copied to clipboard");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col relative max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-950">
          <div className="flex justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-900/30 text-emerald-400 border border-emerald-500/30">
                  {uiText.marketIntel}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-mono text-slate-500">
                  <TrendingUp className="w-3 h-3" />
                  {trend.relevanceScore}% Relevance
                </span>
              </div>
              <h2 className="text-2xl font-black text-white leading-tight mb-1">{trend.title}</h2>
              <p className="text-slate-400 text-sm line-clamp-1">{trend.triggerEvent}</p>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {!deepDive && isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full"></div>
                <Loader2 className="w-12 h-12 text-emerald-400 animate-spin relative z-10" />
              </div>
              <div className="text-center">
                <p className="text-white font-bold animate-pulse">{uiText.analyzingNews}</p>
                <p className="text-slate-500 text-xs mt-1">Cross-referencing global sources...</p>
              </div>
            </div>
          ) : deepDive ? (
            <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
              
              {/* Summary Section */}
              <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-800">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Newspaper className="w-4 h-4 text-emerald-400" /> Executive Summary
                  </h3>
                  <button 
                    onClick={handleCopySummary}
                    className="text-xs flex items-center gap-1 text-slate-500 hover:text-emerald-400 transition-colors"
                  >
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                </div>
                <p className="text-lg text-slate-200 leading-relaxed">
                  {deepDive.summary}
                </p>
                
                {/* Sentiment Badge */}
                <div className="mt-6 flex items-center gap-3">
                  <span className="text-xs text-slate-500 uppercase font-bold">{uiText.sentiment}:</span>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${
                    deepDive.sentiment === 'Positive' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                    deepDive.sentiment === 'Negative' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                    'bg-slate-700/50 border-slate-600 text-slate-300'
                  }`}>
                    {deepDive.sentiment === 'Positive' && <TrendingUp className="w-3.5 h-3.5" />}
                    {deepDive.sentiment === 'Negative' && <TrendingUp className="w-3.5 h-3.5 rotate-180" />}
                    {deepDive.sentiment === 'Neutral' && <ArrowRight className="w-3.5 h-3.5" />}
                    {deepDive.sentiment} Market Outlook
                  </div>
                </div>
              </div>

              {/* Primary Sources (NEW) */}
              {trend.sources && trend.sources.length > 0 && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
                   <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Globe className="w-4 h-4" /> Primary Sources
                   </h3>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {trend.sources.slice(0, 4).map((source, i) => (
                        <a 
                          key={i}
                          href={source.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-lg hover:border-blue-500/30 hover:bg-slate-800 transition-all group"
                        >
                           <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center shrink-0 text-slate-500 border border-slate-700 group-hover:text-blue-400 group-hover:border-blue-500/30">
                             <LinkIcon className="w-4 h-4" />
                           </div>
                           <div className="min-w-0">
                             <p className="text-sm text-slate-300 font-medium truncate group-hover:text-white">{source.title}</p>
                             <p className="text-[10px] text-slate-500 truncate font-mono">{new URL(source.url).hostname}</p>
                           </div>
                        </a>
                      ))}
                   </div>
                </div>
              )}

              {/* Follow-up Questions (AI Analyst Integration) */}
              {onAskQuestion && deepDive.suggestedQuestions && deepDive.suggestedQuestions.length > 0 && (
                <div>
                   <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> Ask Research Analyst
                   </h3>
                   <div className="flex flex-wrap gap-2">
                      {deepDive.suggestedQuestions.map((q, i) => (
                        <button
                          key={i}
                          onClick={() => onAskQuestion(q)}
                          className="text-left bg-indigo-900/20 hover:bg-indigo-900/40 border border-indigo-500/30 hover:border-indigo-500/50 text-indigo-200 rounded-lg px-4 py-3 text-sm transition-all flex items-start gap-2 group w-full sm:w-auto"
                        >
                           <MessageSquare className="w-4 h-4 mt-0.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                           {q}
                        </button>
                      ))}
                   </div>
                </div>
              )}

              {/* Actionable Tips */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Future Outlook */}
                 <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-xl p-5">
                    <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                       <Telescope className="w-4 h-4" /> Future Outlook
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                       {deepDive.futureOutlook}
                    </p>
                 </div>

                 {/* Strategy Tips */}
                 <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
                    <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                       <Lightbulb className="w-4 h-4" /> Strategic Moves
                    </h3>
                    <ul className="space-y-2">
                       {deepDive.actionableTips?.map((tip, i) => (
                          <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                             <Target className="w-3.5 h-3.5 text-yellow-500/70 mt-1 shrink-0" />
                             {tip}
                          </li>
                       ))}
                    </ul>
                 </div>
              </div>

              {/* Timeline Section */}
              <div>
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-6 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400" /> {uiText.keyEvents}
                </h3>
                
                <div className="relative pl-4 space-y-8">
                  {/* Vertical Line */}
                  <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-blue-500/50 via-slate-700 to-transparent"></div>
                  
                  {deepDive.keyEvents.map((event, idx) => (
                    <div key={idx} className="relative pl-6 group">
                      {/* Dot */}
                      <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-slate-900 border-2 border-blue-500 group-hover:bg-blue-500 transition-colors z-10 shadow-[0_0_10px_rgba(59,130,246,0.3)]"></div>
                      
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-blue-900/20 text-blue-400 border border-blue-500/20 mb-1">
                        {event.date}
                      </span>
                      <h4 className="text-white font-medium text-base mb-1 group-hover:text-blue-300 transition-colors">
                        {event.title}
                      </h4>
                      {event.url && (
                        <a 
                          href={event.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-emerald-400 transition-colors"
                        >
                          Read Source <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
               <div className="text-center p-6 bg-red-900/10 border border-red-500/20 rounded-xl">
                 <p className="text-red-400 font-bold mb-2">Analysis Failed</p>
                 <p className="text-xs text-slate-500">Could not retrieve deep dive data. Please try again.</p>
                 <button 
                   onClick={onClose}
                   className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs"
                 >
                   Close
                 </button>
               </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        {deepDive && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-between items-center text-xs text-slate-500">
            <span>AI-generated analysis based on {deepDive.provider === 'gemini' ? 'live' : 'internal'} data.</span>
            <div className="flex gap-2">
               {deepDive.provider === 'gemini' ? (
                 <span className="px-2 py-1 bg-emerald-950/50 border border-emerald-500/20 text-emerald-400 rounded flex items-center gap-1">
                   <Sparkles className="w-3 h-3" /> Gemini Grounding
                 </span>
               ) : (
                 <span className="px-2 py-1 bg-blue-950/50 border border-blue-500/20 text-blue-400 rounded flex items-center gap-1">
                   <Bot className="w-3 h-3" /> OpenAI Knowledge
                 </span>
               )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};