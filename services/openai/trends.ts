
import { Trend, TrendDeepDive, Language, SearchRegion, SearchTimeframe } from "../../types";
import { cleanJsonOutput } from "../../utils/textUtils";
import { callOpenAI } from "./shared";
import { getLanguageInstruction } from "../../utils/promptUtils";
import { OPENAI_MODELS } from "../../constants/aiConfig";
import { promptService } from "../promptService";

export const fetchMarketTrends = async (niche: string, lang: Language, region: SearchRegion = 'Global', timeframe: SearchTimeframe = '30d', deepMode: boolean = false): Promise<Trend[]> => {
  // OpenAI Standard API does not have real-time Google Search tools built-in without extensions.
  // We simulate this by asking the model to use its internal knowledge base.
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const langInstruction = getLanguageInstruction(lang);
  
  const prompt = promptService.build('OPENAI_FETCH_TRENDS', {
    niche,
    region,
    timeframe,
    currentDate,
    langInstruction
  });

  // Use Complex model if Deep Mode is enabled, otherwise Basic (Mini)
  const model = deepMode ? OPENAI_MODELS.COMPLEX : OPENAI_MODELS.BASIC;

  const response = await callOpenAI([{ role: "user", content: prompt }], model);
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
  const prompt = `
    Identify the MAIN SUBJECT, NICHE, or TREND topic represented in this image.
    Return ONLY a short, searchable string (max 5 words).
    ${lang === 'id' ? 'Output in Indonesian.' : 'Output in English.'}
  `;

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
