

import { AIService } from "../types";
import { fetchMarketTrends, getTrendDeepDive } from "./openai/trends";
import { generateBusinessIdeas, generateSystemBlueprint, sendBlueprintChat, generateTeamOfAgents, chatWithAgent, chatWithResearchAnalyst } from "./openai/core";
import { generateVoiceSummary, generateBrandImage, generateMarketingVideo } from "./openai/media";
import { analyzeCompetitor, scoutLocation } from "./openai/analysis";

export const openaiService: AIService = {
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
