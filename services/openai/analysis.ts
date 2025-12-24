
import { CompetitorAnalysis, LocationAnalysis, Language } from "../../types";
import { cleanJsonOutput } from "../../utils/textUtils";
import { callOpenAI, getLanguageInstruction } from "./shared";
import { OPENAI_MODELS } from "../../constants/aiConfig";

export const analyzeCompetitor = async (name: string, niche: string, lang: Language): Promise<CompetitorAnalysis> => {
  const langInstruction = getLanguageInstruction(lang);
  const prompt = `
    Analyze the competitor "${name}" in the "${niche}" market.
    Estimate their Strengths, Weaknesses, Pricing Strategy, and Market Position based on your knowledge.

    ${langInstruction}

    Output strictly valid JSON:
    {
      "name": "${name}",
      "website": null,
      "marketPosition": "Brief description",
      "pricingStrategy": "Brief description",
      "strengths": ["Strength 1", "Strength 2"],
      "weaknesses": ["Weakness 1", "Weakness 2"]
    }
  `;

  const response = await callOpenAI([{ role: "user", content: prompt }], OPENAI_MODELS.BASIC);
  return JSON.parse(cleanJsonOutput(response.content || "{}"));
};

export const scoutLocation = async (businessType: string, location: string, lang: Language): Promise<LocationAnalysis> => {
  const langInstruction = getLanguageInstruction(lang);
  const prompt = `
    You are a location scout for a business idea.
    The user wants to start a "${businessType}" in "${location}".
    
    Since you do not have real-time access to Google Maps, use your internal knowledge of the city/area to suggest 5 specific, popular neighborhoods, districts, or streets that are suitable for this business type.
    Explain WHY each location is good (foot traffic, demographics, vibe).
    
    ${langInstruction}

    Output strictly valid JSON:
    {
      "summary": "A brief analysis of the location strategy for this business type in this city.",
      "places": [
         { 
           "title": "Neighborhood/District Name", 
           "address": "Brief description of the area", 
           "uri": "#" 
         }
      ]
    }
  `;

  const response = await callOpenAI([{ role: "user", content: prompt }], OPENAI_MODELS.BASIC);
  return JSON.parse(cleanJsonOutput(response.content || "{}"));
};
