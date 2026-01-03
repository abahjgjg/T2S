
import { useState } from 'react';
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

  const generateIdeas = async (niche: string, selectedTrends: Trend[]) => {
    return await mutation.mutateAsync({ niche, selectedTrends });
  };

  const clearIdeas = () => {
    setIdeas([]);
    mutation.reset();
  };

  return {
    ideas,
    setIdeas,
    isGeneratingIdeas: mutation.isPending,
    generateIdeas,
    clearIdeas,
    error: mutation.error
  };
};
