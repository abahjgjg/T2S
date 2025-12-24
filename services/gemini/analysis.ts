
import { CompetitorAnalysis, LocationAnalysis, PlaceInfo, Language } from "../../types";
import { cleanJsonOutput } from "../../utils/textUtils";
import { retryOperation } from "../../utils/retryUtils";
import { getGeminiClient, getLanguageInstruction } from "./shared";
import { GEMINI_MODELS } from "../../constants/aiConfig";

export const analyzeCompetitor = async (name: string, niche: string, lang: Language): Promise<CompetitorAnalysis> => {
  return retryOperation(async () => {
    try {
      const ai = getGeminiClient();
      const langInstruction = getLanguageInstruction(lang);
      const prompt = `
        Research the company/competitor "${name}" in the "${niche}" market.
        Find their official website if possible.
        Analyze their Strengths, Weaknesses, Pricing Strategy, and Market Position.

        ${langInstruction}

        Output strictly valid JSON:
        {
          "name": "${name}",
          "website": "URL or null",
          "marketPosition": "Brief description, e.g. 'Premium Incumbent' or 'Low-cost Challenger'",
          "pricingStrategy": "Brief description of their pricing model",
          "strengths": ["Strength 1", "Strength 2"],
          "weaknesses": ["Weakness 1", "Weakness 2"]
        }
      `;

      const response = await ai.models.generateContent({
        model: GEMINI_MODELS.BASIC,
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text;
      if (!text) throw new Error("No competitor data generated");

      return JSON.parse(cleanJsonOutput(text)) as CompetitorAnalysis;

    } catch (error) {
      console.error("Error analyzing competitor:", error);
      throw error;
    }
  });
};

export const scoutLocation = async (businessType: string, location: string, lang: Language): Promise<LocationAnalysis> => {
  return retryOperation(async () => {
    try {
      const ai = getGeminiClient();
      const langInstruction = getLanguageInstruction(lang);
      
      const prompt = `
        Find top rated "${businessType}" competitors or potential locations in "${location}".
        List 5 specific places.
        For each place, analyze why it is successful or suitable (location, ratings, vibe).
        
        ${langInstruction}

        Finally, write a brief summary of the location market density for this business type in this area.
      `;

      const response = await ai.models.generateContent({
        model: GEMINI_MODELS.BASIC,
        contents: prompt,
        config: {
          tools: [{ googleMaps: {} }],
        },
      });

      const text = response.text || "";
      const places: PlaceInfo[] = [];

      // Extract Map Grounding Data
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      chunks.forEach(chunk => {
        if (chunk.maps) {
          places.push({
            title: chunk.maps.title || "Unknown Place",
            address: chunk.maps.placeId || "Location on Map", 
            uri: chunk.maps.uri || "#"
          });
        }
      });
      
      return {
        summary: text,
        places: places
      };

    } catch (error) {
      console.error("Error scouting location:", error);
      throw error;
    }
  });
};
