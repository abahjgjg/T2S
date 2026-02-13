
import React, { useState, useEffect } from 'react';
import { promptService } from '../../services/promptService';
import { PromptKey, DEFAULT_PROMPTS } from '../../constants/systemPrompts';
import { Save, RotateCcw, MessageSquareCode, Info, Cloud, Check } from 'lucide-react';
import { toast } from '../ToastNotifications';
import { supabaseService } from '../../services/supabaseService';
import { useConfirm } from '../../contexts/ConfirmContext';
import { DIMENSIONS } from '../../constants/dimensionConfig';

export const AdminPrompts: React.FC = () => {
  const [prompts, setPrompts] = useState<Record<string, string>>({});
  const [selectedKey, setSelectedKey] = useState<PromptKey>('GENERATE_BLUEPRINT');
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCloudEnabled, setIsCloudEnabled] = useState(false);
  const { confirm } = useConfirm();

  useEffect(() => {
    loadPrompts();
    setIsCloudEnabled(supabaseService.isConfigured());
  }, []);

  const loadPrompts = () => {
    const all = promptService.getAll();
    setPrompts(all);
    setHasChanges(false);
  };

  const handlePromptChange = (val: string) => {
    setPrompts(prev => ({ ...prev, [selectedKey]: val }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await promptService.saveTemplate(selectedKey, prompts[selectedKey]);
      setHasChanges(false);
      toast.success("System Prompt Updated & Synced");
    } catch (e) {
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    const confirmed = await confirm({
      title: 'Reset to Default?',
      message: 'Reset this prompt to system default? All custom changes will be lost.',
      confirmText: 'Reset',
      cancelText: 'Keep Changes',
      variant: 'warning',
    });
    if (confirmed) {
      setIsSaving(true);
      try {
        await promptService.resetTemplate(selectedKey);
        loadPrompts();
        toast.info("Restored to Default");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const variablesMap: Record<PromptKey, string[]> = {
    FETCH_TRENDS: ['niche', 'langInstruction', 'region', 'timeframe', 'currentDate', 'visualContext'],
    OPENAI_FETCH_TRENDS: ['niche', 'langInstruction', 'region', 'timeframe', 'currentDate', 'visualContext'],
    TREND_DEEP_DIVE: ['trend', 'niche', 'langInstruction'],
    OPENAI_DEEP_DIVE: ['trend', 'niche', 'langInstruction'],
    GENERATE_IDEAS: ['niche', 'trendsContext', 'langInstruction'],
    OPENAI_GENERATE_IDEAS: ['niche', 'trendsContext', 'langInstruction'],
    GENERATE_BLUEPRINT: ['name', 'type', 'description', 'monetizationModel', 'langInstruction'],
    OPENAI_GENERATE_BLUEPRINT: ['name', 'type', 'description', 'langInstruction'],
    GENERATE_AGENTS: ['executiveSummary', 'techStack', 'roadmap', 'langInstruction'],
    CHAT_SYSTEM: ['executiveSummary', 'techStack', 'revenueStreams', 'langInstruction'],
    RESEARCH_ANALYST: ['niche', 'trendsContext', 'langInstruction'],
    PERSONA_VC_SKEPTIC: [],
    PERSONA_CUSTOMER_CURIOUS: [],
    PERSONA_TECH_CTO: [],
    PERSONA_GENERATED: ['name', 'bio', 'age', 'occupation', 'painPoints', 'goals'],
    PITCH_SESSION_MASTER: ['personaInstruction', 'name', 'type', 'summary', 'monetization', 'techStack'],
    GENERATE_LAUNCH_ASSETS: ['name', 'type', 'audience', 'summary', 'langInstruction'],
    VIABILITY_AUDIT: ['name', 'type', 'summary', 'techStack', 'revenue', 'langInstruction'],
    GENERATE_CODE: ['name', 'type', 'headline', 'subheadline', 'cta', 'benefits', 'langInstruction'],
    GENERATE_CONTENT_CALENDAR: ['name', 'audience', 'market', 'langInstruction'],
    GENERATE_PERSONAS: ['name', 'audience', 'summary', 'langInstruction'],
    GENERATE_BMC: ['name', 'summary', 'langInstruction'],
    GENERATE_BRAND_IDENTITY: ['name', 'type', 'audience', 'summary', 'langInstruction'],
    ANALYZE_PITCH: ['transcript', 'name', 'summary', 'role', 'langInstruction'],
    GENERATE_IMAGE_PROMPT: ['name', 'description', 'style'],
    GENERATE_VIDEO_PROMPT: ['name', 'description'],
    OPENAI_ANALYZE_COMPETITOR: ['name', 'niche', 'langInstruction'],
    OPENAI_SCOUT_LOCATION: ['businessType', 'location', 'langInstruction']
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-[fadeIn_0.3s_ease-out]">
      {/* Sidebar List */}
      <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-4 h-fit overflow-y-auto custom-scrollbar" style={{ maxHeight: DIMENSIONS.admin.promptsMaxHeight }}>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <MessageSquareCode className="w-4 h-4" /> Prompts
        </h3>
        <div className="flex flex-col gap-2">
          {Object.keys(DEFAULT_PROMPTS).map((key) => (
            <button
              key={key}
              onClick={async () => {
                if (hasChanges) {
                  const discard = await confirm({
                    title: 'Discard Changes?',
                    message: 'You have unsaved changes. Discard them and switch prompts?',
                    confirmText: 'Discard',
                    cancelText: 'Stay Here',
                    variant: 'warning',
                  });
                  if (!discard) return;
                }
                setSelectedKey(key as PromptKey);
                setHasChanges(false);
              }}
              className={`text-left px-3 py-2 rounded-lg text-xs font-mono transition-colors truncate ${
                selectedKey === key 
                ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/30' 
                : 'text-slate-400 hover:bg-slate-800'
              }`}
              title={key}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="lg:col-span-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col" style={{ height: DIMENSIONS.admin.editorHeight }}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{selectedKey}</h2>
                {isCloudEnabled && (
                  <span className="text-[10px] flex items-center gap-1 bg-blue-900/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20" title="Syncs to Cloud">
                    <Cloud className="w-3 h-3" /> Cloud
                  </span>
                )}
              </div>
              <div className="flex gap-2 mt-1 flex-wrap">
                {variablesMap[selectedKey]?.map(v => (
                   <span key={v} className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-mono">
                     {`{{${v}}}`}
                   </span>
                ))}
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                 onClick={handleReset}
                 disabled={isSaving}
                 className="p-2 text-slate-500 hover:text-white bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
                 title="Reset to Default"
                 aria-label="Reset to default"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                 onClick={handleSave}
                 disabled={!hasChanges || isSaving}
                 className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? <span className="animate-pulse">Saving...</span> : <><Save className="w-4 h-4" /> Save Changes</>}
              </button>
            </div>
          </div>

          <textarea
            className="flex-1 w-full bg-slate-950 border border-slate-700 rounded-lg p-4 font-mono text-sm text-slate-300 focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
            value={prompts[selectedKey] || ''}
            onChange={(e) => handlePromptChange(e.target.value)}
          />

          <div className="mt-4 flex items-start gap-2 text-[11px] text-slate-500 bg-slate-950/50 p-3 rounded border border-slate-800">
            <Info className="w-4 h-4 shrink-0 text-blue-400" />
            <p>
              Modifying system prompts affects how the AI generates content. 
              Ensure you keep the JSON structure instructions intact. 
              {isCloudEnabled ? "Changes are synced to the cloud DB." : "Changes are saved locally only."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
