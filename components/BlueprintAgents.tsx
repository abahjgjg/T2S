
import React, { useState } from 'react';
import { Bot, Cpu, Terminal, Copy, Check, MessageSquare } from 'lucide-react';
import { AgentProfile, Language, AIProvider } from '../types';
import { toast } from './ToastNotifications';
import { AgentChatModal } from './AgentChatModal';

interface Props {
  agents: AgentProfile[];
  isGenerating: boolean;
  onGenerate: () => void;
  uiText: any;
}

export const BlueprintAgents: React.FC<Props> = ({ agents, isGenerating, onGenerate, uiText }) => {
  const [copiedAgentIndex, setCopiedAgentIndex] = useState<number | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentProfile | null>(null);

  // Get global settings (could be passed as props, but localStorage is consistent with App.tsx pattern)
  const provider = (localStorage.getItem('trendventures_provider') as AIProvider) || 'gemini';
  const language = (localStorage.getItem('trendventures_lang') as Language) || 'id';

  const handleCopySystemPrompt = (prompt: string, index: number) => {
    navigator.clipboard.writeText(prompt);
    setCopiedAgentIndex(index);
    toast.info(uiText.copied || "Copied to clipboard");
    setTimeout(() => setCopiedAgentIndex(null), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8 print:break-inside-avoid">
      <div className="flex justify-between items-center mb-6">
         <h3 className="text-xl font-bold text-white flex items-center gap-2">
           <Bot className="w-5 h-5 text-pink-400" /> {uiText.aiTeam}
         </h3>
         {!agents.length && !isGenerating && (
           <button 
             onClick={onGenerate}
             className="flex items-center gap-2 px-4 py-2 bg-pink-600/20 hover:bg-pink-600/30 text-pink-400 hover:text-pink-300 border border-pink-500/50 rounded-lg transition-colors text-sm font-bold"
           >
             <Cpu className="w-4 h-4" /> {uiText.generateAgents}
           </button>
         )}
      </div>

      {selectedAgent && (
        <AgentChatModal 
          agent={selectedAgent}
          isOpen={!!selectedAgent}
          onClose={() => setSelectedAgent(null)}
          uiText={uiText}
          provider={provider}
          language={language}
        />
      )}

      {isGenerating ? (
        <div className="flex flex-col items-center justify-center py-12 bg-slate-950/30 rounded-lg border border-slate-800 border-dashed">
          <Cpu className="w-8 h-8 text-pink-500 animate-spin mb-3" />
          <p className="text-slate-400 text-sm animate-pulse">{uiText.generatingAgents}</p>
        </div>
      ) : agents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent, index) => (
            <div key={index} className="bg-slate-950 border border-slate-800 rounded-xl p-5 hover:border-pink-500/30 transition-all flex flex-col group">
              <div className="flex justify-between items-start mb-3">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:border-pink-500/50 transition-colors">
                      <Bot className="w-5 h-5 text-pink-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{agent.name}</h4>
                      <p className="text-xs text-slate-500 font-mono">{agent.role}</p>
                    </div>
                 </div>
                 <button 
                   onClick={() => handleCopySystemPrompt(agent.systemPrompt, index)}
                   className="text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                   title={uiText.copyPrompt}
                 >
                   {copiedAgentIndex === index ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                 </button>
              </div>
              
              <p className="text-sm text-slate-400 mb-4 line-clamp-2 min-h-[40px]">
                {agent.objective}
              </p>

              <div className="mb-4">
                <p className="text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-wider flex items-center gap-1">
                  <Terminal className="w-3 h-3" /> {uiText.agentTools}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {agent.recommendedTools.map((tool, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-auto pt-3 border-t border-slate-900 flex justify-between items-center gap-2">
                <div className="bg-slate-900 rounded p-2 text-[10px] font-mono text-slate-500 truncate group-hover:text-slate-400 transition-colors cursor-pointer flex-1" onClick={() => handleCopySystemPrompt(agent.systemPrompt, index)}>
                  {agent.systemPrompt.slice(0, 40)}...
                </div>
                <button
                  onClick={() => setSelectedAgent(agent)}
                  className="px-2 py-1.5 bg-pink-600/10 hover:bg-pink-600/20 text-pink-400 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 border border-pink-500/20"
                >
                  <MessageSquare className="w-3 h-3" /> Test
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-slate-950/30 rounded-lg border border-slate-800 border-dashed">
          <p className="text-slate-500 text-sm mb-4 max-w-md mx-auto">{uiText.agentsDesc}</p>
          <button 
             onClick={onGenerate}
             className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm font-bold border border-slate-700"
           >
             <Cpu className="w-4 h-4" /> {uiText.generateAgents}
           </button>
        </div>
      )}
    </div>
  );
};
