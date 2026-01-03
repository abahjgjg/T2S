
import { CompetitorAnalysis, LocationAnalysis, Language } from "../../types";
import { cleanJsonOutput } from "../../utils/textUtils";
import { callOpenAI } from "./shared";
import { getLanguageInstruction } from "../../utils/promptUtils";
import { OPENAI_MODELS } from "../../constants/aiConfig";
import { promptService } from "../promptService";

export const analyzeCompetitor = async (name: string, niche: string, lang: Language): Promise<CompetitorAnalysis> => {
  const langInstruction = getLanguageInstruction(lang);
  
  const prompt = promptService.build('OPENAI_ANALYZE_COMPETITOR', {
    name,
    niche,
    langInstruction
  });

  const response = await callOpenAI([{ role: "user", content: prompt }], OPENAI_MODELS.BASIC);
  return JSON.parse(cleanJsonOutput(response.content || "{}"));
};

export const scoutLocation = async (businessType: string, location: string, lang: Language): Promise<LocationAnalysis> => {
  const langInstruction = getLanguageInstruction(lang);
  
  const prompt = promptService.build('OPENAI_SCOUT_LOCATION', {
    businessType,
    location,
    langInstruction
  });

  const response = await callOpenAI([{ role: "user", content: prompt }], OPENAI_MODELS.BASIC);
  return JSON.parse(cleanJsonOutput(response.content || "{}"));
};
