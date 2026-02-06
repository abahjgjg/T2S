
import React, { useState } from 'react';
import { BrandIdentity, Blueprint, BusinessIdea } from '../types';
import { getAIService } from '../services/aiRegistry';
import { Palette, Loader2, RefreshCcw, Tag, Type, Hash, Check, Copy } from 'lucide-react';
import { toast } from './ToastNotifications';
import { usePreferences } from '../contexts/PreferencesContext';
import { EmptyState } from './ui/EmptyState';

interface Props {
  idea: BusinessIdea;
  blueprint: Blueprint;
  brandIdentity?: BrandIdentity;
  onUpdateBlueprint: (updates: Partial<Blueprint>) => void;
  onUpdateIdea: (updates: Partial<BusinessIdea>) => void;
}

export const BrandStudio: React.FC<Props> = ({ idea, blueprint, brandIdentity, onUpdateBlueprint, onUpdateIdea }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  
  const { provider, language } = usePreferences();

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const aiService = getAIService(provider);
      const identity = await aiService.generateBrandIdentity(idea, blueprint, language);
      onUpdateBlueprint({ brandIdentity: identity });
      toast.success("Brand Identity Generated!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate brand identity.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyName = (name: string) => {
    if (window.confirm(`Update business name to "${name}"? This will affect the entire blueprint.`)) {
        setSelectedName(name);
        onUpdateIdea({ name });
        toast.info(`Selected "${name}" as preferred brand.`);
    }
  };

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    toast.success(`Hex code ${hex} copied!`);
  };

  if (isGenerating) {
    return (
      <EmptyState
        icon={<Loader2 className="w-12 h-12 text-pink-400 animate-spin" />}
        title="Crafting Brand Identity..."
        description="Brainstorming creative names, slogans, and color palettes that resonate with your target audience."
        className="mb-8"
      />
    );
  }

  if (!brandIdentity) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 mb-8 text-center animate-[fadeIn_0.3s_ease-out] print:break-inside-avoid">
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
          <Palette className="w-8 h-8 text-pink-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Brand Studio</h3>
        <p className="text-slate-400 max-w-md mx-auto mb-6">
          Establish a strong visual and verbal identity. Generate professional names, slogans, and color schemes.
        </p>
        <button 
          onClick={handleGenerate}
          className="px-6 py-3 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl transition-all hover:scale-105 flex items-center gap-2 mx-auto shadow-lg shadow-pink-900/20"
        >
          <Palette className="w-5 h-5" /> Generate Identity
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8 print:break-inside-avoid animate-[fadeIn_0.3s_ease-out]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Palette className="w-5 h-5 text-pink-400" /> Brand Identity
        </h3>
        <button 
          onClick={handleGenerate}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800"
        >
          <RefreshCcw className="w-3 h-3" /> Regenerate
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
           <div className="bg-slate-950/50 rounded-xl p-5 border border-slate-800">
              <h4 className="text-sm font-bold text-pink-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Type className="w-4 h-4" /> Naming Options
              </h4>
              <div className="space-y-2">
                {brandIdentity.names.map((name, i) => (
                  <div key={i} className="flex items-center justify-between p-2 hover:bg-slate-800 rounded-lg group transition-colors cursor-pointer" onClick={() => handleApplyName(name)}>
                     <span className={`text-slate-200 font-medium ${selectedName === name ? 'text-pink-400' : ''}`}>{name}</span>
                     {selectedName === name && <Check className="w-4 h-4 text-pink-400" />}
                  </div>
                ))}
              </div>
           </div>

           <div className="bg-slate-950/50 rounded-xl p-5 border border-slate-800">
              <h4 className="text-sm font-bold text-blue-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4" /> Slogans
              </h4>
              <ul className="space-y-2">
                {brandIdentity.slogans.map((slogan, i) => (
                  <li key={i} className="text-sm text-slate-400 italic">"{slogan}"</li>
                ))}
              </ul>
           </div>
        </div>

        <div className="space-y-6">
           <div className="bg-slate-950/50 rounded-xl p-5 border border-slate-800">
              <h4 className="text-sm font-bold text-emerald-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Palette className="w-4 h-4" /> Color Palette
              </h4>
              <div className="flex flex-col gap-3">
                 {brandIdentity.colors.map((color, i) => (
                   <div key={i} className="flex items-center justify-between p-2 hover:bg-slate-800 rounded-lg group transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg shadow-sm border border-white/10 shrink-0" style={{ backgroundColor: color.hex }}></div>
                        <div>
                           <p className="text-slate-200 font-bold text-sm">{color.name}</p>
                           <p className="text-slate-500 text-xs font-mono uppercase">{color.hex}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleCopyHex(color.hex)}
                        className="p-2 opacity-0 group-hover:opacity-100 hover:text-emerald-400 transition-all"
                        title="Copy Hex Code"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-slate-950/50 rounded-xl p-5 border border-slate-800">
              <h4 className="text-sm font-bold text-purple-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Hash className="w-4 h-4" /> Core Values & Tone
              </h4>
              <p className="text-sm text-slate-300 mb-4">
                <span className="text-slate-500 font-bold uppercase text-xs mr-2">Voice:</span> 
                {brandIdentity.tone}
              </p>
              <div className="flex flex-wrap gap-2">
                 {brandIdentity.brandValues.map((val, i) => (
                   <span key={i} className="px-3 py-1 bg-slate-800 rounded-full text-xs text-slate-300 border border-slate-700">
                     {val}
                   </span>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
