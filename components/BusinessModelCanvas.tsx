
import React, { useState } from 'react';
import { BMC, Blueprint, BusinessIdea } from '../types';
import { getAIService } from '../services/aiRegistry';
import { Loader2, LayoutGrid, Users, Link, Activity, Box, Heart, Megaphone, Wallet, CreditCard } from 'lucide-react';
import { toast } from './ToastNotifications';
import { usePreferences } from '../contexts/PreferencesContext';
import { EmptyState } from './ui/EmptyState';

interface Props {
  idea: BusinessIdea;
  blueprint: Blueprint;
  bmc?: BMC;
  onUpdateBlueprint: (_updates: Partial<Blueprint>) => void;
}

export const BusinessModelCanvas: React.FC<Props> = ({ idea, blueprint, bmc, onUpdateBlueprint }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { provider, language, uiText } = usePreferences();

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const aiService = getAIService(provider);
      const newBMC = await aiService.generateBMC(idea, blueprint, language);
      onUpdateBlueprint({ bmc: newBMC });
      toast.success("Business Model Canvas Generated!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate BMC.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <EmptyState
        variant="generating"
        icon={<Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />}
        title="Structuring Business Model..."
        description="Mapping relationships, resources, and revenue streams."
        className="mb-8"
      />
    );
  }

  if (!bmc) {
    return (
      <EmptyState
        variant="default"
        icon={<LayoutGrid className="w-8 h-8 text-indigo-400" />}
        title="Business Model Canvas"
        description="Generate a strategic 9-block visual overview of your entire business model."
        action={
          <button
            onClick={handleGenerate}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all hover:scale-105 shadow-lg shadow-indigo-500/20"
          >
            Generate Canvas
          </button>
        }
        tips={[
          { text: "Standard 9-block framework used by Fortune 500 companies" },
          { text: "Clarifies your value proposition, customer segments, and cost structure" },
          { text: "Helps identify critical assumptions and dependencies" }
        ]}
        className="mb-8"
      />
    );
  }

  const renderBlock = (title: string, icon: React.ReactNode, items: string[], className: string) => (
    <div className={`bg-slate-950/50 p-4 border border-slate-800 flex flex-col h-full ${className}`}>
      <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
        {icon} {title}
      </h4>
      <ul className="space-y-2 flex-1">
        {items.map((item, i) => (
          <li key={i} className="text-xs text-slate-300 leading-relaxed pl-2 border-l border-slate-800">{item}</li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="mb-10 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-indigo-400" /> Strategic Canvas
        </h3>
        <button onClick={handleGenerate} className="text-xs text-slate-400 hover:text-white underline">Regenerate</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-0 rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900">
        <div className="md:col-span-1 md:row-span-2 min-h-[300px]">{renderBlock('Key Partners', <Link className="w-3 h-3" />, bmc.keyPartners, 'border-r border-b md:border-b-0')}</div>
        <div className="md:col-span-1 md:row-span-1 min-h-[150px]">{renderBlock('Key Activities', <Activity className="w-3 h-3" />, bmc.keyActivities, 'border-r border-b')}</div>
        <div className="md:col-span-1 md:row-span-2 min-h-[300px]">{renderBlock('Value Propositions', <Box className="w-3 h-3 text-indigo-400" />, bmc.valuePropositions, 'border-r border-b md:border-b-0 bg-indigo-900/10')}</div>
        <div className="md:col-span-1 md:row-span-1 min-h-[150px]">{renderBlock('Relationships', <Heart className="w-3 h-3" />, bmc.customerRelationships, 'border-r border-b')}</div>
        <div className="md:col-span-1 md:row-span-2 min-h-[300px]">{renderBlock('Customer Segments', <Users className="w-3 h-3" />, bmc.customerSegments, 'border-b md:border-b-0')}</div>
        <div className="md:col-span-1 md:col-start-2 md:row-start-2 min-h-[150px]">{renderBlock('Key Resources', <Box className="w-3 h-3" />, bmc.keyResources, 'border-r border-b md:border-b-0')}</div>
        <div className="md:col-span-1 md:col-start-4 md:row-start-2 min-h-[150px]">{renderBlock('Channels', <Megaphone className="w-3 h-3" />, bmc.channels, 'border-r border-b md:border-b-0')}</div>
        <div className="md:col-span-2 md:row-start-3 min-h-[120px]">{renderBlock('Cost Structure', <CreditCard className="w-3 h-3 text-red-400" />, bmc.costStructure, 'border-r border-t bg-slate-900')}</div>
        <div className="md:col-span-3 md:col-start-3 md:row-start-3 min-h-[120px]">{renderBlock('Revenue Streams', <Wallet className="w-3 h-3 text-emerald-400" />, bmc.revenueStreams, 'border-t bg-emerald-900/5')}</div>
      </div>
    </div>
  );
};
