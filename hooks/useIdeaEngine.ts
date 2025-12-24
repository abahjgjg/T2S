import { useState } from 'react';
import { BusinessIdea, Trend, Language, AIService } from '../types';

export const useIdeaEngine = (aiService: AIService, language: Language) => {
  const [ideas, setIdeas] = useState<BusinessIdea[]>([]);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);

  const generateIdeas = async (niche: string, selectedTrends: Trend[]) => {
    setIsGeneratingIdeas(true);
    try {
      const results = await aiService.generateBusinessIdeas(niche, selectedTrends, language);
      setIdeas(results);
      return results;
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  const clearIdeas = () => setIdeas([]);

  return {
    ideas,
    setIdeas,
    isGeneratingIdeas,
    generateIdeas,
    clearIdeas
  };
};