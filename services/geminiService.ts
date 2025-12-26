
import { AIService } from "../types";
import { fetchMarketTrends, getTrendDeepDive } from "./gemini/trends";
import { generateBusinessIdeas, generateSystemBlueprint, sendBlueprintChat, generateTeamOfAgents, chatWithAgent, chatWithResearchAnalyst, generateLaunchAssets, conductViabilityAudit, generateBMC, generateLandingPageCode, generateContentCalendar, generateBrandIdentity } from "./gemini/core";
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
  generateBrandIdentity
};
