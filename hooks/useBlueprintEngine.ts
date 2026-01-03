
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { BusinessIdea, Blueprint, Language, AIService } from '../types';
import { supabaseService } from '../services/supabaseService';
import { affiliateService } from '../services/affiliateService';

export const useBlueprintEngine = (aiService: AIService, language: Language, userId?: string) => {
  const [selectedIdea, setSelectedIdea] = useState<BusinessIdea | null>(null);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [currentBlueprintId, setCurrentBlueprintId] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (variables: { idea: BusinessIdea, niche: string }) => {
      // Check cache first
      if (variables.idea.cachedBlueprint) {
        return {
          blueprint: variables.idea.cachedBlueprint,
          publishedId: variables.idea.id,
          isCached: true
        };
      }

      // 1. Generate Raw Blueprint via AI (Pure Generation)
      let finalBlueprint = await aiService.generateSystemBlueprint(variables.idea, language);
      
      // 2. Enrich with Business Logic (Affiliates)
      finalBlueprint = await affiliateService.enrichBlueprint(finalBlueprint);

      let publishedId: string | null = null;
      
      // 3. Publish / Persist
      try {
        publishedId = await supabaseService.publishBlueprint(variables.niche, variables.idea, finalBlueprint, userId);
      } catch (publishErr) {
        console.warn("Auto-publish failed", publishErr);
      }

      return {
        blueprint: finalBlueprint,
        publishedId,
        isCached: false
      };
    },
    onSuccess: (data, variables) => {
      setBlueprint(data.blueprint);
      if (data.publishedId) setCurrentBlueprintId(data.publishedId);
      // If cached, we simulate a small delay in UI elsewhere, or just set immediately here.
    }
  });

  const createBlueprint = async (idea: BusinessIdea, niche: string) => {
    setSelectedIdea(idea);
    setCurrentBlueprintId(null);
    const result = await mutation.mutateAsync({ idea, niche });
    
    // Simulate UI delay for cached items for smoothness if needed, 
    // or rely on the natural async tick.
    if (result.isCached) {
        await new Promise(r => setTimeout(r, 500));
    }
    
    return result.publishedId;
  };

  const updateBlueprint = (updates: Partial<Blueprint>) => {
    setBlueprint(prev => prev ? { ...prev, ...updates } : null);
  };

  const clearBlueprint = () => {
    setSelectedIdea(null);
    setBlueprint(null);
    setCurrentBlueprintId(null);
    mutation.reset();
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
    clearBlueprint,
    isGeneratingBlueprint: mutation.isPending,
    error: mutation.error
  };
};
