
import { useState, useCallback, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { BusinessIdea, Trend, Language, AIService } from '../types';

export const useIdeaEngine = (aiService: AIService, language: Language) => {
  const [ideas, setIdeas] = useState<BusinessIdea[]>([]);

  const mutation = useMutation({
    mutationFn: async (variables: { niche: string, selectedTrends: Trend[] }) => {
      return await aiService.generateBusinessIdeas(variables.niche, variables.selectedTrends, language);
    },
    onSuccess: (data) => {
      setIdeas(data);
    }
  });

  const generateIdeas = useCallback(async (niche: string, selectedTrends: Trend[]) => {
    return await mutation.mutateAsync({ niche, selectedTrends });
  }, [mutation]);

  const clearIdeas = useCallback(() => {
    setIdeas([]);
    mutation.reset();
  }, [mutation]);

  return useMemo(() => ({
    ideas,
    setIdeas,
    isGeneratingIdeas: mutation.isPending,
    generateIdeas,
    clearIdeas,
    error: mutation.error
  }), [ideas, mutation.isPending, generateIdeas, clearIdeas, mutation.error]);
};
