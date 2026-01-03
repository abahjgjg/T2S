
import { Trend, TrendDeepDive, Language, SearchRegion, SearchTimeframe } from "../../types";
import { cleanJsonOutput } from "../../utils/textUtils";
import { retryOperation } from "../../utils/retryUtils";
import { getLanguageInstruction } from "../../utils/promptUtils";
import { getGeminiClient } from "./shared";
import { GEMINI_MODELS } from "../../constants/aiConfig";
import { TrendListSchema, TrendDeepDiveSchema } from "../../utils/schemas";
import { promptService } from "../promptService";

export const fetchMarketTrends = async (niche: string, lang: Language, region: SearchRegion = 'Global', timeframe: SearchTimeframe = '30d', deepMode: boolean = false): Promise<Trend[]> => {
  return retryOperation(async () => {
    try {
      const ai = getGeminiClient();
      const langInstruction = getLanguageInstruction(lang);
      
      // Reinforce "Latest" context if timeframe is short
      const urgencyInstruction = (timeframe === '24h' || timeframe === '7d')
        ? "CRITICAL: You are a Real-Time News Scanner. Prioritize BREAKING NEWS, LIVE EVENTS, and DEVELOPING STORIES from the last few hours. IGNORE outdated trends. If no breaking news exists, find the most recent relevant update."
        : "Focus on established market shifts and emerging patterns from the last month.";

      const prompt = promptService.build('FETCH_TRENDS', {
        niche,
        langInstruction: `${langInstruction} ${urgencyInstruction}`,
        region,
        timeframe,
        currentDate: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      });

      // Select Model based on mode
      // Basic: Flash (Fast, Cheap)
      // Deep: Pro (Reasoning, Comprehensive)
      const model = deepMode ? GEMINI_MODELS.COMPLEX : GEMINI_MODELS.BASIC;

      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          // If Deep Mode, enable Thinking for better analysis
          ...(deepMode ? { thinkingConfig: { thinkingBudget: 1024 } } : {})
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

export const extractTopicFromImage = async (base64Image: string, lang: Language): Promise<string> => {
  return retryOperation(async () => {
    try {
      const ai = getGeminiClient();
      
      // Remove header if present
      const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");
      
      const prompt = `
        Analyze this image. It could be a chart, a product photo, a screenshot of a news article, or a real-world scene.
        Identify the MAIN SUBJECT, NICHE, or TREND topic represented in this image.
        Return ONLY a short, searchable string (max 5 words) describing this topic.
        Example: "AI Semiconductor Market", "Sustainable Sneaker Trends", "EV Battery Tech".
        Do not explain. Just return the topic string.
        ${lang === 'id' ? 'Output in Indonesian.' : 'Output in English.'}
      `;

      const response = await ai.models.generateContent({
        model: GEMINI_MODELS.BASIC, // Flash supports vision
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/png', data: cleanBase64 } },
            { text: prompt }
          ]
        }
      });

      const text = response.text?.trim() || "";
      // Remove any quotes or periods
      return text.replace(/["\.]/g, "");

    } catch (error) {
      console.error("Error extracting topic from image:", error);
      throw error;
    }
  });
};
