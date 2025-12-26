
import { Trend, TrendDeepDive, Language, SearchRegion, SearchTimeframe } from "../../types";
import { cleanJsonOutput } from "../../utils/textUtils";
import { retryOperation } from "../../utils/retryUtils";
import { getGeminiClient, getLanguageInstruction } from "./shared";
import { GEMINI_MODELS } from "../../constants/aiConfig";
import { TrendListSchema, TrendDeepDiveSchema } from "../../utils/schemas";
import { promptService } from "../promptService";

export const fetchMarketTrends = async (niche: string, lang: Language, region: SearchRegion = 'Global', timeframe: SearchTimeframe = '30d'): Promise<Trend[]> => {
  return retryOperation(async () => {
    try {
      const ai = getGeminiClient();
      const langInstruction = getLanguageInstruction(lang);
      
      const prompt = promptService.build('FETCH_TRENDS', {
        niche,
        langInstruction,
        region,
        timeframe,
        currentDate: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      });

      const response = await ai.models.generateContent({
        model: GEMINI_MODELS.BASIC,
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text;
      if (!text) throw new Error("No response from AI");

      // Validate base trends before injecting sources
      const rawData = JSON.parse(cleanJsonOutput(text));
      const validatedTrends = TrendListSchema.parse(rawData);
      
      // Extract sources from Grounding Metadata
      const sources: { title: string; url: string }[] = [];
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      
      if (groundingChunks) {
        groundingChunks.forEach(chunk => {
          if (chunk.web?.uri) {
            const url = chunk.web.uri;
            const title = chunk.web.title || new URL(url).hostname;
            if (!sources.find(s => s.url === url)) {
              sources.push({ title, url });
            }
          }
        });
      } else {
        console.warn("No grounding chunks returned from Google Search tool.");
      }
      
      return validatedTrends.map(t => ({
        ...t,
        sources: sources
      })) as Trend[];

    } catch (error) {
      console.error("Error inside fetchMarketTrends attempt:", error);
      throw error;
    }
  });
};

export const getTrendDeepDive = async (trend: string, niche: string, lang: Language): Promise<TrendDeepDive> => {
  return retryOperation(async () => {
    try {
      const ai = getGeminiClient();
      const langInstruction = getLanguageInstruction(lang);
      
      const prompt = promptService.build('TREND_DEEP_DIVE', {
        trend,
        niche,
        langInstruction
      });

      // Use COMPLEX model (Gemini 3 Pro) with Thinking for deep dives
      const response = await ai.models.generateContent({
        model: GEMINI_MODELS.COMPLEX,
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          thinkingConfig: { thinkingBudget: 2048 }, // Enable reasoning for deeper analysis
        },
      });

      const text = response.text;
      if (!text) throw new Error("No deep dive response");

      const rawData = JSON.parse(cleanJsonOutput(text));
      const result = TrendDeepDiveSchema.parse(rawData) as TrendDeepDive;
      
      // Inject Provider
      return { ...result, provider: 'gemini' };

    } catch (error) {
      console.error("Error inside getTrendDeepDive attempt:", error);
      throw error;
    }
  });
};