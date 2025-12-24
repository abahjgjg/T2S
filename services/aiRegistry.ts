import { AIProvider, AIService } from "../types";
import { geminiService } from "./geminiService";
import { openaiService } from "./openaiService";

export const getAIService = (provider: AIProvider): AIService => {
  switch (provider) {
    case 'openai':
      return openaiService;
    case 'gemini':
    default:
      return geminiService;
  }
};