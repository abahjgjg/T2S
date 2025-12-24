

import { AIService } from "../types";
import { fetchMarketTrends, getTrendDeepDive } from "./gemini/trends";
import { generateBusinessIdeas, generateSystemBlueprint, sendBlueprintChat, generateTeamOfAgents, chatWithAgent, chatWithResearchAnalyst } from "./gemini/core";
import { generateBrandImage, generateMarketingVideo, generateVoiceSummary } from "./gemini/media";
import { analyzeCompetitor, scoutLocation } from "./gemini/analysis";

export const geminiService: AIService = {
  fetchMarketTrends,
  getTrendDeepDive,
  generateBusinessIdeas,
  generateSystemBlueprint,
  generateVoiceSummary,
  sendBlueprintChat,
  generateTeamOfAgents,
  chatWithAgent, 
  chatWithResearchAnalyst, // Exported
  generateBrandImage,
  generateMarketingVideo,
  analyzeCompetitor,
  scoutLocation
};
