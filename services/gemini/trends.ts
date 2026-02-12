
import { Trend, TrendDeepDive, Language, SearchRegion, SearchTimeframe } from "../../types";
import { cleanJsonOutput } from "../../utils/textUtils";
import { retryOperation } from "../../utils/retryUtils";
import { getLanguageInstruction } from "../../utils/promptUtils";
import { getGeminiClient } from "./shared";
import { GEMINI_MODELS } from "../../constants/aiConfig";
import { THINKING_BUDGETS } from "../../constants/apiConfig";
import { TrendListSchema, TrendDeepDiveSchema } from "../../utils/schemas";
import { promptService } from "../promptService";
import { Type } from "@google/genai";
import { indexedDBService } from "../../utils/storageUtils";
import { DATE_CONFIG, AI_INSTRUCTIONS, MIME_TYPES, CONTENT_LIMITS } from "../../constants/contentConfig";

export const fetchMarketTrends = async (niche: string, lang: Language, region: SearchRegion = 'Global', timeframe: SearchTimeframe = '30d', deepMode: boolean = false, image?: string): Promise<Trend[]> => {
  return retryOperation(async () => {
    try {
      const ai = getGeminiClient();
      const langInstruction = getLanguageInstruction(lang);
      
      // Reinforce "Latest" context if timeframe is short
      const urgencyInstruction = (timeframe === '24h' || timeframe === '7d')
        ? AI_INSTRUCTIONS.URGENCY_SHORT_TIMEFRAME
        : AI_INSTRUCTIONS.URGENCY_STANDARD_TIMEFRAME;

      const visualContext = image 
        ? AI_INSTRUCTIONS.VISUAL_CONTEXT
        : "";

      const prompt = promptService.build('FETCH_TRENDS', {
        niche,
        langInstruction: `${langInstruction} ${urgencyInstruction}`,
        region,
        timeframe,
        visualContext,
        currentDate: new Date().toLocaleDateString(DATE_CONFIG.DEFAULT_LOCALE, DATE_CONFIG.FORMAT_OPTIONS.fullWithTime)
      });

      // Select Model based on mode
      // Basic: Flash (Fast, Cheap)
      // Deep: Pro (Reasoning, Comprehensive)
      const model = deepMode ? GEMINI_MODELS.COMPLEX : GEMINI_MODELS.BASIC;

      const contentsPayload: any = {
        model: model,
        contents: {
          parts: [{ text: prompt }]
        },
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Headline or Trend Name" },
                description: { type: Type.STRING, description: "Brief explanation of the news/trend and why it matters" },
                relevanceScore: { type: Type.NUMBER, description: "Match score 0-100" },
                growthScore: { type: Type.NUMBER, description: "Velocity/Hype 0-100" },
                impactScore: { type: Type.NUMBER, description: "Market Impact 0-100" },
                sentiment: { type: Type.STRING, enum: ["Positive", "Negative", "Neutral"] },
                triggerEvent: { type: Type.STRING, description: "Specific recent news headline or event driving this" },
                date: { type: Type.STRING, description: "YYYY-MM-DD" },
              },
              required: ["title", "description", "relevanceScore", "triggerEvent"]
            }
          },
          // If Deep Mode, enable Thinking for better analysis
          ...(deepMode ? { thinkingConfig: { thinkingBudget: THINKING_BUDGETS.FAST } } : {})
        },
      };

      // Add image part if present (Multimodal)
      if (image) {
        let cleanBase64 = "";
        let mimeType = MIME_TYPES.DEFAULT_IMAGE;

        if (image.startsWith('asset://')) {
           const assetId = image.replace(MIME_TYPES.PATTERNS.ASSET_PROTOCOL, '');
           const blob = await indexedDBService.getAsset(assetId);
           if (blob) {
              mimeType = blob.type;
              cleanBase64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                  const base64 = reader.result as string;
                  resolve(base64.replace(MIME_TYPES.PATTERNS.BASE64_HEADER, ""));
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
              });
           }
        } else {
           // Simple MIME type detection from base64 header
           const mimeMatch = image.match(MIME_TYPES.PATTERNS.BASE64_HEADER);
           mimeType = mimeMatch ? mimeMatch[1] : MIME_TYPES.DEFAULT_IMAGE;
           cleanBase64 = image.replace(MIME_TYPES.PATTERNS.BASE64_HEADER, "");
        }
        
        if (cleanBase64) {
          contentsPayload.contents.parts.unshift({
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64
            }
          });
        }
      }

      const response = await ai.models.generateContent(contentsPayload);

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
          thinkingConfig: { thinkingBudget: THINKING_BUDGETS.STANDARD }, // Enable reasoning for deeper analysis
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              sentiment: { type: Type.STRING, enum: ["Positive", "Negative", "Neutral"] },
              keyEvents: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    date: { type: Type.STRING },
                    title: { type: Type.STRING },
                    url: { type: Type.STRING }
                  },
                  required: ["date", "title"]
                }
              },
              futureOutlook: { type: Type.STRING },
              actionableTips: { type: Type.ARRAY, items: { type: Type.STRING } },
              suggestedQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
              keyPlayers: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["summary", "sentiment", "keyEvents", "futureOutlook", "actionableTips"]
          }
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
      
      let cleanBase64 = "";
      let mimeType = MIME_TYPES.DEFAULT_IMAGE;

      if (base64Image.startsWith('asset://')) {
         const assetId = base64Image.replace(MIME_TYPES.PATTERNS.ASSET_PROTOCOL, '');
         const blob = await indexedDBService.getAsset(assetId);
         if (blob) {
            mimeType = blob.type;
            cleanBase64 = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                const base64 = reader.result as string;
                resolve(base64.replace(MIME_TYPES.PATTERNS.BASE64_HEADER, ""));
              };
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
         }
      } else {
         // Remove header if present
         const mimeMatch = base64Image.match(MIME_TYPES.PATTERNS.BASE64_HEADER);
         mimeType = mimeMatch ? mimeMatch[1] : MIME_TYPES.DEFAULT_IMAGE;
         cleanBase64 = base64Image.replace(MIME_TYPES.PATTERNS.BASE64_HEADER, "");
      }
      
      const langInstruction = lang === 'id' ? AI_INSTRUCTIONS.LANGUAGE_OUTPUT.id : AI_INSTRUCTIONS.LANGUAGE_OUTPUT.en;
      const prompt = AI_INSTRUCTIONS.TOPIC_EXTRACTION
        .replace('{{maxWords}}', String(CONTENT_LIMITS.TOPIC_EXTRACTION_MAX_WORDS))
        .replace('{{langInstruction}}', langInstruction);

      const response = await ai.models.generateContent({
        model: GEMINI_MODELS.BASIC, // Flash supports vision
        contents: {
          parts: [
            { inlineData: { mimeType: mimeType, data: cleanBase64 } },
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
