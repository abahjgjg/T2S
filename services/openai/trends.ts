
import { Trend, TrendDeepDive, Language, SearchRegion, SearchTimeframe } from "../../types";
import { cleanJsonOutput } from "../../utils/textUtils";
import { callOpenAI } from "./shared";
import { getLanguageInstruction } from "../../utils/promptUtils";
import { OPENAI_MODELS } from "../../constants/aiConfig";
import { promptService } from "../promptService";
import { DATE_CONFIG, AI_INSTRUCTIONS, CONTENT_LIMITS } from "../../constants/contentConfig";

export const fetchMarketTrends = async (niche: string, lang: Language, region: SearchRegion = 'Global', timeframe: SearchTimeframe = '30d', deepMode: boolean = false, image?: string): Promise<Trend[]> => {
  // OpenAI Standard API does not have real-time Google Search tools built-in without extensions.
  // We simulate this by asking the model to use its internal knowledge base.
  const currentDate = new Date().toLocaleDateString(DATE_CONFIG.DEFAULT_LOCALE, DATE_CONFIG.FORMAT_OPTIONS.full);
  const langInstruction = getLanguageInstruction(lang);
  
  const visualContext = image 
        ? AI_INSTRUCTIONS.VISUAL_CONTEXT
        : "";

  const prompt = promptService.build('OPENAI_FETCH_TRENDS', {
    niche,
    region,
    timeframe,
    currentDate,
    langInstruction,
    visualContext
  });

  // Use Complex model if Deep Mode or Image is enabled (Need Vision), otherwise Basic (Mini)
  const model = (deepMode || image) ? OPENAI_MODELS.COMPLEX : OPENAI_MODELS.BASIC;

  const contentPayload: any = [{ type: "text", text: prompt }];
  
  if (image) {
    contentPayload.push({
      type: "image_url",
      image_url: {
        url: image // OpenAI accepts full data URI
      }
    });
  }

  const response = await callOpenAI([{ role: "user", content: contentPayload }], model);
  const rawTrends = JSON.parse(cleanJsonOutput(response.content || "[]"));
  
  // Map to new interface, adding empty sources
  return rawTrends.map((t: any) => ({
    ...t,
    sources: []
  }));
};

export const getTrendDeepDive = async (trend: string, niche: string, lang: Language): Promise<TrendDeepDive> => {
   const langInstruction = getLanguageInstruction(lang);
   
   const prompt = promptService.build('OPENAI_DEEP_DIVE', {
     trend,
     niche,
     langInstruction
   });

   const response = await callOpenAI([{ role: "user", content: prompt }], OPENAI_MODELS.BASIC);
   const result = JSON.parse(cleanJsonOutput(response.content || "{}"));
   
   return { ...result, provider: 'openai' };
};

export const extractTopicFromImage = async (base64Image: string, lang: Language): Promise<string> => {
  const langInstruction = lang === 'id' ? AI_INSTRUCTIONS.LANGUAGE_OUTPUT.id : AI_INSTRUCTIONS.LANGUAGE_OUTPUT.en;
  const prompt = AI_INSTRUCTIONS.TOPIC_EXTRACTION_SIMPLE
    .replace('{{maxWords}}', String(CONTENT_LIMITS.TOPIC_EXTRACTION_MAX_WORDS))
    .replace('{{langInstruction}}', langInstruction);

  const response = await callOpenAI(
    [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          {
            type: "image_url",
            image_url: {
              url: base64Image // Must be full data URL
            }
          }
        ]
      }
    ],
    OPENAI_MODELS.COMPLEX // Use GPT-4o for Vision
  );

  const text = response.content?.trim() || "";
  return text.replace(/["\.]/g, "");
};
