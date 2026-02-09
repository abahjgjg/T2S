
import React, { useState } from 'react';
import { CustomerPersona, Blueprint, BusinessIdea } from '../types';
import { getAIService } from '../services/aiRegistry';
import { Users, Loader2, RefreshCcw, User, Target, HeartCrack, MessageSquare, Image as ImageIcon } from 'lucide-react';
import { toast } from './ToastNotifications';
import { useBlueprintMedia } from '../hooks/useBlueprintMedia';
import { useAsset } from '../hooks/useAsset';
import { usePreferences } from '../contexts/PreferencesContext';
import { EmptyState } from './ui/EmptyState';
import { SmartImage } from './ui/SmartImage';

interface Props {
  idea: BusinessIdea;
  blueprint: Blueprint;
  personas?: CustomerPersona[];
  onUpdateBlueprint: (_updates: Partial<Blueprint>) => void;
}

const PersonaCard: React.FC<{ 
  persona: CustomerPersona, 
  idx: number,
  onGenerateAvatar: (name: string, bio: string, idx: number) => void,
  isGeneratingAvatar: boolean 
}> = ({ persona, idx, onGenerateAvatar, isGeneratingAvatar }) => {
  const { url: avatarUrl, isLoading } = useAsset(persona.avatarUrl);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col hover:border-blue-500/30 transition-all group">
      <div className="flex items-start gap-4 mb-4">
         <div className="relative w-16 h-16 shrink-0 bg-slate-900 rounded-full border border-slate-700 flex items-center justify-center overflow-hidden">
            {avatarUrl ? (
              <SmartImage 
                src={avatarUrl} 
                alt={persona.name} 
                className="w-full h-full object-cover"
                containerClassName="w-full h-full"
                fallbackIcon={<User className="w-8 h-8 text-slate-600" />}
              />
            ) : isLoading ? (
              <Loader2 className="w-6 h-6 text-slate-500 animate-spin" />
            ) : (
              <User className="w-8 h-8 text-slate-600" />
            )}
           {!avatarUrl && !isLoading && (
             <button 
               onClick={() => onGenerateAvatar(persona.name, persona.bio, idx)}
               disabled={isGeneratingAvatar}
               className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
               title="Generate AI Avatar"
             >
               {isGeneratingAvatar ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <ImageIcon className="w-4 h-4 text-white" />}
             </button>
           )}
        </div>
        <div>
          <h4 className="font-bold text-white text-lg">{persona.name}</h4>
          <p className="text-xs text-slate-400 font-mono">{persona.age} • {persona.occupation}</p>
        </div>
      </div>
      <div className="mb-6 space-y-3 flex-grow">
         <p className="text-xs text-slate-300 italic leading-relaxed border-l-2 border-blue-500/50 pl-3">"{persona.quote}"</p>
         <p className="text-sm text-slate-400 leading-relaxed">{persona.bio}</p>
      </div>
      <div className="space-y-4">
         <div>
            <h5 className="text-[10px] uppercase font-bold text-red-400 tracking-wider mb-2 flex items-center gap-1"><HeartCrack className="w-3 h-3" /> Pain Points</h5>
            <div className="flex flex-wrap gap-1.5">
              {persona.painPoints.map((pt, i) => <span key={i} className="text-[10px] bg-red-900/10 text-red-300 px-2 py-1 rounded border border-red-500/20">{pt}</span>)}
            </div>
         </div>
         <div>
            <h5 className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider mb-2 flex items-center gap-1"><Target className="w-3 h-3" /> Goals</h5>
            <div className="flex flex-wrap gap-1.5">
              {persona.goals.map((g, i) => <span key={i} className="text-[10px] bg-emerald-900/10 text-emerald-300 px-2 py-1 rounded border border-emerald-500/20">{g}</span>)}
            </div>
         </div>
         <div className="pt-2 border-t border-slate-800">
            <h5 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2 flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Hangout Channels</h5>
            <div className="flex flex-wrap gap-2 text-xs text-slate-400">{persona.channels.join(' • ')}</div>
         </div>
      </div>
    </div>
  );
};

export const CustomerPersonas: React.FC<Props> = ({ idea, blueprint, personas, onUpdateBlueprint }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingAvatarIdx, setGeneratingAvatarIdx] = useState<number | null>(null);
  const { provider, language } = usePreferences();

  const { generateAvatar } = useBlueprintMedia(provider, language, () => {});

  const handleGenerateAvatar = async (name: string, bio: string, idx: number) => {
    if (!personas) return;
    setGeneratingAvatarIdx(idx);
    
    try {
      const assetUrl = await generateAvatar(name, bio);
      if (assetUrl) {
        const newPersonas = [...personas];
        newPersonas[idx] = { ...newPersonas[idx], avatarUrl: assetUrl };
        onUpdateBlueprint({ personas: newPersonas });
        toast.success("Avatar generated");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate avatar");
    } finally {
      setGeneratingAvatarIdx(null);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const aiService = getAIService(provider);
      const newPersonas = await aiService.generatePersonas(idea, blueprint, language);
      onUpdateBlueprint({ personas: newPersonas });
      toast.success("Customer Personas Generated!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate personas.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <EmptyState
        icon={<Loader2 className="w-12 h-12 text-blue-400 animate-spin" />}
        title="Analyzing Audience..."
        description="Identifying key demographics, psychographics, and pain points for your ideal customers."
        className="mb-8"
      />
    );
  }

  if (!personas) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 mb-8 text-center animate-[fadeIn_0.3s_ease-out] print:break-inside-avoid">
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700"><Users className="w-8 h-8 text-blue-400" /></div>
        <h3 className="text-2xl font-bold text-white mb-2">Customer Personas</h3>
        <p className="text-slate-400 max-w-md mx-auto mb-6">Deep dive into your target audience. Generate detailed profiles to understand who you are building for.</p>
        <button onClick={handleGenerate} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all hover:scale-105 flex items-center gap-2 mx-auto shadow-lg shadow-blue-900/20"><Users className="w-5 h-5" /> Identify Personas</button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8 print:break-inside-avoid animate-[fadeIn_0.3s_ease-out]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2"><Users className="w-5 h-5 text-blue-400" /> Ideal Customer Profiles (ICP)</h3>
        <button onClick={handleGenerate} className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800"><RefreshCcw className="w-3 h-3" /> Regenerate</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {personas.map((persona, i) => (
          <PersonaCard key={i} persona={persona} idx={i} onGenerateAvatar={handleGenerateAvatar} isGeneratingAvatar={generatingAvatarIdx === i} />
        ))}
      </div>
    </div>
  );
};
