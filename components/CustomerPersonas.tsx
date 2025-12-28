
import React, { useState } from 'react';
import { CustomerPersona, Blueprint, BusinessIdea, Language, AIProvider } from '../types';
import { getAIService } from '../services/aiRegistry';
import { Users, Loader2, RefreshCcw, User, Target, HeartCrack, MessageSquare, Image as ImageIcon, Briefcase } from 'lucide-react';
import { toast } from './ToastNotifications';
import { useBlueprintMedia } from '../hooks/useBlueprintMedia';
import { useAsset } from '../hooks/useAsset';

interface Props {
  idea: BusinessIdea;
  blueprint: Blueprint;
  personas?: CustomerPersona[];
  onUpdateBlueprint: (updates: Partial<Blueprint>) => void;
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
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="relative w-16 h-16 shrink-0 bg-slate-900 rounded-full border border-slate-700 flex items-center justify-center overflow-hidden">
           {avatarUrl ? (
             <img src={avatarUrl} alt={persona.name} className="w-full h-full object-cover" />
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

      {/* Bio & Quote */}
      <div className="mb-6 space-y-3 flex-grow">
         <p className="text-xs text-slate-300 italic leading-relaxed border-l-2 border-blue-500/50 pl-3">
           "{persona.quote}"
         </p>
         <p className="text-sm text-slate-400 leading-relaxed">
           {persona.bio}
         </p>
      </div>

      {/* Details Grid */}
      <div className="space-y-4">
         <div>
            <h5 className="text-[10px] uppercase font-bold text-red-400 tracking-wider mb-2 flex items-center gap-1">
              <HeartCrack className="w-3 h-3" /> Pain Points
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {persona.painPoints.map((pt, i) => (
                <span key={i} className="text-[10px] bg-red-900/10 text-red-300 px-2 py-1 rounded border border-red-500/20">
                  {pt}
                </span>
              ))}
            </div>
         </div>

         <div>
            <h5 className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider mb-2 flex items-center gap-1">
              <Target className="w-3 h-3" /> Goals
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {persona.goals.map((g, i) => (
                <span key={i} className="text-[10px] bg-emerald-900/10 text-emerald-300 px-2 py-1 rounded border border-emerald-500/20">
                  {g}
                </span>
              ))}
            </div>
         </div>

         <div className="pt-2 border-t border-slate-800">
            <h5 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2 flex items-center gap-1">
              <MessageSquare className="w-3 h-3" /> Hangout Channels
            </h5>
            <div className="flex flex-wrap gap-2 text-xs text-slate-400">
               {persona.channels.join(' • ')}
            </div>
         </div>
      </div>
    </div>
  );
};

export const CustomerPersonas: React.FC<Props> = ({ idea, blueprint, personas, onUpdateBlueprint }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingAvatarIdx, setGeneratingAvatarIdx] = useState<number | null>(null);

  // Use the existing hook, but adapting it for avatars
  const { generateLogo } = useBlueprintMedia(
    (localStorage.getItem('trendventures_provider') as AIProvider) || 'gemini',
    (localStorage.getItem('trendventures_lang') as Language) || 'id',
    // We override update logic locally
    (updates) => {
       // This callback is used by the hook for logo/video updates. 
       // For personas, we handle state update manually below.
    }
  );

  // Custom handler for Avatar generation leveraging existing services
  const handleGenerateAvatar = async (name: string, bio: string, idx: number) => {
    if (!personas) return;
    setGeneratingAvatarIdx(idx);
    
    try {
      const provider = (localStorage.getItem('trendventures_provider') as AIProvider) || 'gemini';
      const aiService = getAIService(provider);
      
      const prompt = `Create a realistic, professional headshot avatar for a customer persona.
      Description: ${bio.slice(0, 150)}.
      Style: High quality photography portrait, neutral background.`;
      
      const imageBase64 = await aiService.generateBrandImage(name, prompt, "Realistic Portrait");
      
      if (imageBase64) {
        // Since we can't easily upload to cloud via the service directly without duplicating logic,
        // we'll stick to data URI for now for individual personas (or implement full asset pipeline if strict).
        // Given Phase 1 constraints, let's use Data URI for simplicity, or try to piggyback.
        // Actually, let's persist it to IndexedDB manually to be safe.
        // Importing indexedDBService would be cleaner.
        
        // For now, let's just use Data URI to keep it simple and functional.
        // A data URI is fine for 3 small images.
        const dataUri = `data:image/png;base64,${imageBase64}`;
        
        const newPersonas = [...personas];
        newPersonas[idx] = { ...newPersonas[idx], avatarUrl: dataUri };
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
      const provider = (localStorage.getItem('trendventures_provider') as AIProvider) || 'gemini';
      const lang = (localStorage.getItem('trendventures_lang') as Language) || 'id';
      const aiService = getAIService(provider);
      
      const newPersonas = await aiService.generatePersonas(idea, blueprint, lang);
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
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[300px] mb-8 animate-[fadeIn_0.3s_ease-out]">
        <Loader2 className="w-12 h-12 text-blue-400 animate-spin mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Analyzing Audience...</h3>
        <p className="text-slate-400 max-w-sm text-sm">
          Identifying key demographics, psychographics, and pain points for your ideal customers.
        </p>
      </div>
    );
  }

  if (!personas) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 mb-8 text-center animate-[fadeIn_0.3s_ease-out] print:break-inside-avoid">
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
          <Users className="w-8 h-8 text-blue-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Customer Personas</h3>
        <p className="text-slate-400 max-w-md mx-auto mb-6">
          Deep dive into your target audience. Generate detailed profiles to understand who you are building for.
        </p>
        <button 
          onClick={handleGenerate}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all hover:scale-105 flex items-center gap-2 mx-auto shadow-lg shadow-blue-900/20"
        >
          <Users className="w-5 h-5" /> Identify Personas
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8 print:break-inside-avoid animate-[fadeIn_0.3s_ease-out]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-400" /> Ideal Customer Profiles (ICP)
        </h3>
        <button 
          onClick={handleGenerate}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800"
        >
          <RefreshCcw className="w-3 h-3" /> Regenerate
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {personas.map((persona, i) => (
          <PersonaCard 
            key={i} 
            persona={persona} 
            idx={i}
            onGenerateAvatar={handleGenerateAvatar} 
            isGeneratingAvatar={generatingAvatarIdx === i}
          />
        ))}
      </div>
    </div>
  );
};
