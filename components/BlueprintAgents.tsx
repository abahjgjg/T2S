
import React, { useState } from 'react';
import { Bot, Copy, Edit2, Trash2, Plus, Check, MessageSquare, Save, Cpu, PlayCircle } from 'lucide-react';
import { AgentProfile, Blueprint } from '../types';
import { toast } from './ToastNotifications';
import { usePreferences } from '../contexts/PreferencesContext';
import { useConfirm } from '../contexts/ConfirmContext';
import { UI_TIMING } from '../constants/uiConfig';
import { AgentChatModal } from './AgentChatModal';

interface Props {
  agents: AgentProfile[];
  isGenerating: boolean;
  onGenerate: () => void;
  onUpdateBlueprint: (_updates: Partial<Blueprint>) => void;
}

export const BlueprintAgents: React.FC<Props> = ({ agents, isGenerating, onGenerate, onUpdateBlueprint }) => {
  const [copiedAgentIndex, setCopiedAgentIndex] = useState<number | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentProfile | null>(null);
  const [initialTask, setInitialTask] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<AgentProfile>>({});
  const [isAdding, setIsAdding] = useState(false);
  const { uiText } = usePreferences();
  const { confirm } = useConfirm();

  const handleCopySystemPrompt = (prompt: string, index: number) => {
    navigator.clipboard.writeText(prompt);
    setCopiedAgentIndex(index);
    toast.info(uiText.copied || "Copied to clipboard");
    setTimeout(() => setCopiedAgentIndex(null), UI_TIMING.COPY_FEEDBACK_DURATION);
  };

  const handleDeleteAgent = async (index: number) => {
    const confirmed = await confirm({
      title: 'Remove Agent?',
      message: 'Remove this agent from your team?',
      confirmText: 'Remove',
      cancelText: 'Keep',
      variant: 'warning',
    });
    if (confirmed) {
      const newAgents = [...agents];
      newAgents.splice(index, 1);
      onUpdateBlueprint({ agents: newAgents });
      toast.success("Agent removed");
    }
  };

  const handleStartEdit = (agent: AgentProfile, index: number) => {
    setEditingIndex(index);
    setEditForm({ ...agent });
    setIsAdding(false);
  };

  const handleSaveEdit = () => {
    if (!editForm.name || !editForm.role) return;
    
    const newAgents = [...agents];
    const updatedAgent = {
      role: editForm.role || 'Agent',
      name: editForm.name || 'New Agent',
      objective: editForm.objective || '',
      systemPrompt: editForm.systemPrompt || '',
      recommendedTools: editForm.recommendedTools || [],
      suggestedTasks: editForm.suggestedTasks || []
    };

    if (isAdding) {
      newAgents.push(updatedAgent);
    } else if (editingIndex !== null) {
      newAgents[editingIndex] = updatedAgent;
    }

    onUpdateBlueprint({ agents: newAgents });
    setEditingIndex(null);
    setIsAdding(false);
    setEditForm({});
    toast.success(isAdding ? "Agent hired" : "Agent updated");
  };

  const handleAddAgent = () => {
    setEditForm({
      name: '',
      role: '',
      objective: '',
      systemPrompt: 'You are a helpful assistant specialized in...',
      recommendedTools: [],
      suggestedTasks: []
    });
    setIsAdding(true);
    setEditingIndex(null);
  };

  const startTask = (agent: AgentProfile, task: string) => {
    setInitialTask(task);
    setSelectedAgent(agent);
  };

  const renderEditor = () => (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl p-6 relative">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">{isAdding ? <Plus className="w-5 h-5 text-emerald-400" /> : <Edit2 className="w-5 h-5 text-blue-400" />} {isAdding ? "Hire Custom Agent" : "Edit Agent Profile"}</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs text-slate-500 uppercase font-bold">Name</label><input type="text" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-sm" /></div>
            <div><label className="text-xs text-slate-500 uppercase font-bold">Role</label><input type="text" value={editForm.role || ''} onChange={e => setEditForm({...editForm, role: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-sm" /></div>
          </div>
          <div><label className="text-xs text-slate-500 uppercase font-bold">Objective</label><input type="text" value={editForm.objective || ''} onChange={e => setEditForm({...editForm, objective: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-sm" /></div>
          <div><label className="text-xs text-slate-500 uppercase font-bold">System Prompt</label><textarea value={editForm.systemPrompt || ''} onChange={e => setEditForm({...editForm, systemPrompt: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-sm h-32 font-mono" /></div>
          <div className="flex justify-end gap-2 pt-2"><button onClick={() => { setIsAdding(false); setEditingIndex(null); }} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">Cancel</button><button onClick={handleSaveEdit} className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded font-bold transition-colors flex items-center gap-2"><Save className="w-4 h-4" /> Save</button></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8 print:break-inside-avoid">
      <div className="flex justify-between items-center mb-6">
         <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-white flex items-center gap-2"><Bot className="w-5 h-5 text-pink-400" /> {uiText.aiTeam}</h3>
            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{agents.length} Agents</span>
         </div>
         <div className="flex gap-2">
           <button onClick={handleAddAgent} className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition-colors text-xs font-bold"><Plus className="w-3 h-3" /> Hire Custom</button>
           {!agents.length && !isGenerating && (
             <button onClick={onGenerate} className="flex items-center gap-2 px-4 py-2 bg-pink-600/20 hover:bg-pink-600/30 text-pink-400 hover:text-pink-300 border border-pink-500/50 rounded-lg transition-colors text-sm font-bold"><Cpu className="w-4 h-4" /> {uiText.generateAgents}</button>
           )}
         </div>
      </div>
      {(isAdding || editingIndex !== null) && renderEditor()}
      {selectedAgent && (
        <AgentChatModal agent={selectedAgent} isOpen={!!selectedAgent} onClose={() => { setSelectedAgent(null); setInitialTask(null); }} initialMessage={initialTask} />
      )}
      {isGenerating ? (
        <div className="flex flex-col items-center justify-center py-12 bg-slate-950/30 rounded-lg border border-slate-800 border-dashed">
          <Cpu className="w-8 h-8 text-pink-500 animate-spin mb-3" />
          <p className="text-slate-400 text-sm animate-pulse">{uiText.generatingAgents}</p>
        </div>
      ) : agents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent, index) => (
            <div key={index} className="bg-slate-950 border border-slate-800 rounded-xl p-5 hover:border-pink-500/30 transition-all flex flex-col group relative">
              <div className="flex justify-between items-start mb-3">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:border-pink-500/50 transition-colors"><Bot className="w-5 h-5 text-pink-500" /></div>
                    <div><h4 className="font-bold text-white text-sm">{agent.name}</h4><p className="text-xs text-slate-500 font-mono">{agent.role}</p></div>
                 </div>
                 <div className="flex gap-1"><button onClick={() => handleStartEdit(agent, index)} className="p-1.5 text-slate-500 hover:text-blue-400 transition-colors"><Edit2 className="w-3 h-3" /></button><button onClick={() => handleDeleteAgent(index)} className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"><Trash2 className="w-3 h-3" /></button></div>
              </div>
              <p className="text-sm text-slate-400 mb-4 line-clamp-2 min-h-[40px]">{agent.objective}</p>
              {agent.suggestedTasks && agent.suggestedTasks.length > 0 && (
                <div className="mb-4 space-y-2">
                   <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1"><PlayCircle className="w-3 h-3" /> Action Items</p>
                   <div className="flex flex-col gap-1.5">
                     {agent.suggestedTasks.slice(0, 3).map((task, t) => (
                       <button key={t} onClick={() => startTask(agent, task)} className="text-left text-[10px] px-2 py-1.5 bg-slate-900 hover:bg-pink-900/20 hover:text-pink-300 border border-slate-800 rounded transition-colors text-slate-300 truncate">• {task}</button>
                     ))}
                   </div>
                </div>
              )}
              <div className="mt-auto"><div className="flex flex-wrap gap-1.5">{agent.recommendedTools.slice(0, 3).map((tool, i) => (<span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-500">{tool}</span>))}</div></div>
              <div className="mt-4 pt-3 border-t border-slate-900 flex justify-between items-center gap-2">
                <button onClick={() => handleCopySystemPrompt(agent.systemPrompt, index)} className="text-[10px] text-slate-500 hover:text-white flex items-center gap-1 transition-colors">{copiedAgentIndex === index ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} System Prompt</button>
                <button onClick={() => setSelectedAgent(agent)} className="px-3 py-1.5 bg-pink-600/10 hover:bg-pink-600/20 text-pink-400 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 border border-pink-500/20"><MessageSquare className="w-3 h-3" /> Chat</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-slate-950/30 rounded-lg border border-slate-800 border-dashed">
          <p className="text-slate-500 text-sm mb-4 max-w-md mx-auto">{uiText.agentsDesc}</p>
          <button onClick={onGenerate} className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm font-bold border border-slate-700"><Cpu className="w-4 h-4" /> {uiText.generateAgents}</button>
        </div>
      )}
    </div>
  );
};
