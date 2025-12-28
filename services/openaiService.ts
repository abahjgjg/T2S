


import { AIService } from "../types";
import { fetchMarketTrends, getTrendDeepDive } from "./openai/trends";
import { generateBusinessIdeas, generateSystemBlueprint, sendBlueprintChat, generateTeamOfAgents, chatWithAgent, chatWithResearchAnalyst, generateLaunchAssets, conductViabilityAudit, generateBMC, generateLandingPageCode, generateContentCalendar, generateBrandIdentity, generatePersonas } from "./openai/core";
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
  chatWithResearchAnalyst,
  generateBrandImage,
  generateMarketingVideo,
  analyzeCompetitor,
  scoutLocation,
  generateLaunchAssets,
  conductViabilityAudit,
  generateBMC,
  generateLandingPageCode,
  generateContentCalendar,
  generateBrandIdentity,
  generatePersonas
};