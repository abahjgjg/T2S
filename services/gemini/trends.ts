
import { Trend, TrendDeepDive, Language, SearchRegion, SearchTimeframe } from "../../types";
import { cleanJsonOutput } from "../../utils/textUtils";
import { retryOperation } from "../../utils/retryUtils";
import { getLanguageInstruction } from "../../utils/promptUtils";
import { getGeminiClient } from "./shared";
import { GEMINI_MODELS } from "../../constants/aiConfig";
import { TrendListSchema, TrendDeepDiveSchema } from "../../utils/schemas";
import { promptService } from "../promptService";
import { Type } from "@google/genai";
import { indexedDBService } from "../../utils/storageUtils";

export const fetchMarketTrends = async (niche: string, lang: Language, region: SearchRegion = 'Global', timeframe: SearchTimeframe = '30d', deepMode: boolean = false, image?: string): Promise<Trend[]> => {
  return retryOperation(async () => {
    try {
      const ai = getGeminiClient();
      const langInstruction = getLanguageInstruction(lang);
      
      // Reinforce "Latest" context if timeframe is short
      const urgencyInstruction = (timeframe === '24h' || timeframe === '7d')
        ? "CRITICAL PRIORITY: YOU ARE A REAL-TIME NEWS SCANNER. The user wants to know what is happening RIGHT NOW. Prioritize BREAKING NEWS, LIVE EVENTS, and DEVELOPING STORIES from the last 24-48 hours. IGNORE general knowledge or outdated trends. If no breaking news exists for this niche, find the most recent relevant update from this week. Do not hallucinate dates."
        : "Focus on established market shifts and emerging patterns from the last month.";

      const visualContext = image 
        ? "VISUAL CONTEXT PROVIDED: An image has been attached. Analyze the image contents and identify trends related to the objects, style, or data visible in the image. Combine this visual insight with the search query."
        : "";

      const prompt = promptService.build('FETCH_TRENDS', {
        niche,
        langInstruction: `${langInstruction} ${urgencyInstruction}`,
        region,
        timeframe,
        visualContext,
        currentDate: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
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
          ...(deepMode ? { thinkingConfig: { thinkingBudget: 1024 } } : {})
        },
      };

      // Add image part if present (Multimodal)
      if (image) {
        let cleanBase64 = "";
        let mimeType = "image/jpeg";

        if (image.startsWith('asset://')) {
           const assetId = image.replace('asset://', '');
           const blob = await indexedDBService.getAsset(assetId);
           if (blob) {
              mimeType = blob.type;
              cleanBase64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                  const base64 = reader.result as string;
                  resolve(base64.replace(/^data:image\/\w+;base64,/, ""));
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
              });
           }
        } else {
           // Simple MIME type detection from base64 header
           const mimeMatch = image.match(/^data:(image\/[a-zA-Z+]+);base64,/);
           mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
           cleanBase64 = image.replace(/^data:image\/\w+;base64,/, "");
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
          thinkingConfig: { thinkingBudget: 2048 }, // Enable reasoning for deeper analysis
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
      let mimeType = "image/png";

      if (base64Image.startsWith('asset://')) {
         const assetId = base64Image.replace('asset://', '');
         const blob = await indexedDBService.getAsset(assetId);
         if (blob) {
            mimeType = blob.type;
            cleanBase64 = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                const base64 = reader.result as string;
                resolve(base64.replace(/^data:image\/\w+;base64,/, ""));
              };
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
         }
      } else {
         // Remove header if present
         const mimeMatch = base64Image.match(/^data:(image\/[a-zA-Z+]+);base64,/);
         mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
         cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");
      }
      
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
