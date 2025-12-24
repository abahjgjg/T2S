
import React from 'react';
import { Globe, ExternalLink, Search, Newspaper, Zap, CheckCircle2, AlertTriangle, Radio } from 'lucide-react';
import { AIProvider } from '../types';

interface Props {
  sources: { title: string; url: string }[];
  provider: AIProvider;
}

export const NewsWire: React.FC<Props> = ({ sources, provider }) => {
  const isGroundingActive = provider === 'gemini';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden animate-[fadeIn_0.3s_ease-out] flex flex-col h-full">
       <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
         <div className="flex items-center gap-2">
           <Newspaper className="w-5 h-5 text-blue-400" />
           <h4 className="font-bold text-white">Intelligence Wire</h4>
         </div>
         
         {/* Live Status Badge */}
         <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
           isGroundingActive 
             ? 'bg-emerald-950/50 text-emerald-400 border-emerald-500/30' 
             : 'bg-blue-900/20 text-blue-400 border-blue-500/20'
         }`}>
           {isGroundingActive ? (
             <>
               <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
               </span>
               Google Grounding
             </>
           ) : (
             <>
               <CheckCircle2 className="w-3 h-3" /> OpenAI Knowledge
             </>
           )}
         </div>
       </div>
       
       {sources.length > 0 ? (
         <div className="divide-y divide-slate-800 max-h-[500px] overflow-y-auto custom-scrollbar bg-slate-950/30">
           <div className="px-4 py-2 bg-slate-900/50 text-[10px] text-slate-500 font-mono flex items-center justify-between border-b border-slate-800/50">
              <span>DETECTED SIGNALS: {sources.length}</span>
              <span>{new Date().toLocaleDateString()}</span>
           </div>
           
           {sources.map((source, i) => {
             // Basic favicon fallback
             const domain = new URL(source.url).hostname;
             const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

             return (
               <a 
                 key={i} 
                 href={source.url} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="block p-4 hover:bg-slate-800/50 transition-colors group relative border-l-2 border-transparent hover:border-blue-500"
               >
                 <div className="flex items-start gap-4">
                   <div className="w-8 h-8 rounded bg-white flex items-center justify-center shrink-0 overflow-hidden relative shadow-sm mt-1">
                      <img 
                        src={faviconUrl} 
                        alt="icon" 
                        className="w-5 h-5 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <Globe className="w-4 h-4 text-slate-400 absolute z-0" />
                   </div>
                   
                   <div className="flex-1 min-w-0">
                     <div className="flex items-center gap-2 mb-0.5">
                        <h5 className="text-sm font-bold text-slate-200 group-hover:text-blue-400 transition-colors line-clamp-1">
                          {source.title || domain}
                        </h5>
                        <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                     </div>
                     <p className="text-xs text-slate-500 truncate font-mono opacity-60 group-hover:opacity-90 transition-opacity">
                       {source.url}
                     </p>
                     
                     <div className="mt-2 flex items-center gap-2">
                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 font-medium">News</span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-emerald-900/20 text-emerald-500/80 rounded font-medium">Relevance: High</span>
                     </div>
                   </div>
                 </div>
               </a>
             );
           })}
         </div>
       ) : (
         <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center h-full min-h-[300px]">
           <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 relative">
             <Radio className="w-8 h-8 text-slate-600 opacity-50" />
             {isGroundingActive && (
               <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-slate-900"></div>
             )}
           </div>
           
           <h3 className="text-lg font-bold text-slate-300 mb-2">
             {isGroundingActive ? "Scanning Live Feeds..." : "Knowledge Base Only"}
           </h3>
           
           <p className="text-sm max-w-xs leading-relaxed mb-6 text-slate-400">
             {isGroundingActive 
               ? "No direct source links returned yet. The AI is synthesizing data from the internal Google Search cache." 
               : "OpenAI is using its internal training data (cutoff date applies). Switch to Gemini for live web grounding."}
           </p>

           {!isGroundingActive && (
             <div className="text-xs text-emerald-400 bg-emerald-900/20 px-4 py-3 rounded-lg border border-emerald-500/20 flex items-start gap-2 text-left max-w-xs">
               <Zap className="w-4 h-4 shrink-0 mt-0.5" />
               <p><strong>Pro Tip:</strong> Switch to <strong>Gemini</strong> in Admin settings to enable real-time Google Search integration.</p>
             </div>
           )}
         </div>
       )}
    </div>
  );
};
