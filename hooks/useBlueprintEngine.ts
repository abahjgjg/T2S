import { useState } from 'react';
import { BusinessIdea, Blueprint, Language, AIService } from '../types';
import { supabaseService } from '../services/supabaseService';

export const useBlueprintEngine = (aiService: AIService, language: Language, userId?: string) => {
  const [selectedIdea, setSelectedIdea] = useState<BusinessIdea | null>(null);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [currentBlueprintId, setCurrentBlueprintId] = useState<string | null>(null);

  const createBlueprint = async (idea: BusinessIdea, niche: string) => {
    setSelectedIdea(idea);
    setCurrentBlueprintId(null);
    
    let finalBlueprint: Blueprint;
    let publishedId: string | null = null;

    if (idea.cachedBlueprint) {
      finalBlueprint = idea.cachedBlueprint;
      publishedId = idea.id;
      // UI smoothness delay
      await new Promise(r => setTimeout(r, 500));
    } else {
      finalBlueprint = await aiService.generateSystemBlueprint(idea, language);
      try {
        publishedId = await supabaseService.publishBlueprint(niche, idea, finalBlueprint, userId);
      } catch (publishErr) {
        console.warn("Auto-publish failed", publishErr);
      }
    }

    setBlueprint(finalBlueprint);
    if (publishedId) setCurrentBlueprintId(publishedId);
    
    return publishedId;
  };

  const updateBlueprint = (updates: Partial<Blueprint>) => {
    setBlueprint(prev => prev ? { ...prev, ...updates } : null);
  };

  const clearBlueprint = () => {
    setSelectedIdea(null);
    setBlueprint(null);
    setCurrentBlueprintId(null);
  };

  return {
    selectedIdea,
    setSelectedIdea,
    blueprint,
    setBlueprint,
    currentBlueprintId,
    setCurrentBlueprintId,
    createBlueprint,
    updateBlueprint,
    clearBlueprint
  };
};