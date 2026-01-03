
import { AIService } from "../types";
import { fetchMarketTrends, getTrendDeepDive, extractTopicFromImage } from "./gemini/trends";
import { generateBusinessIdeas, generateSystemBlueprint, sendBlueprintChat, generateTeamOfAgents, chatWithAgent, chatWithResearchAnalyst, generateLaunchAssets, conductViabilityAudit, generateBMC, generateLandingPageCode, generateContentCalendar, generateBrandIdentity, generatePersonas, analyzePitchTranscript } from "./gemini/core";
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
  generateBrandIdentity,
  generatePersonas,
  extractTopicFromImage,
  analyzePitchTranscript
};
