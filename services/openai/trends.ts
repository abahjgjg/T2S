
import { Trend, TrendDeepDive, Language, SearchRegion, SearchTimeframe } from "../../types";
import { cleanJsonOutput } from "../../utils/textUtils";
import { callOpenAI, getLanguageInstruction } from "./shared";
import { OPENAI_MODELS } from "../../constants/aiConfig";

export const fetchMarketTrends = async (niche: string, lang: Language, region: SearchRegion = 'Global', timeframe: SearchTimeframe = '30d'): Promise<Trend[]> => {
  // OpenAI Standard API does not have real-time Google Search tools built-in without extensions.
  // We simulate this by asking the model to use its internal knowledge base.
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const langInstruction = getLanguageInstruction(lang);
  const prompt = `
    Act as a senior market analyst.
    Current Date: ${currentDate}
    
    Identify 5 breaking news or emerging trends in the niche: "${niche}".
    Focus on the most recent developments you are aware of (Breaking News) in the region: ${region} within the timeframe: ${timeframe}.
    For each, identify a specific news headline or recent event that represents this trend.
    Determine the sentiment (Positive/Negative/Neutral).
    
    ${langInstruction}
    
    Return ONLY a raw JSON array:
    [
      {
        "title": "Name",
        "description": "Why it is trending in ${region}",
        "relevanceScore": 85,
        "growthScore": 90, 
        "impactScore": 75,
        "sentiment": "Positive" | "Negative" | "Neutral",
        "triggerEvent": "Breaking news headline or event",
        "date": "YYYY-MM-DD"
      }
    ]

    metric_definitions:
    - relevanceScore: How closely this matches the "${niche}" search (0-100).
    - growthScore: The velocity/hype of this trend right now (0-100).
    - impactScore: The potential market size or financial impact (0-100).
    - sentiment: The overall mood of the news.
    - date: The approximate date of the trigger event.
  `;

  // Uses OPENAI_MODELS.BASIC default
  const response = await callOpenAI([{ role: "user", content: prompt }]);
  const rawTrends = JSON.parse(cleanJsonOutput(response.content || "[]"));
  
  // Map to new interface, adding empty sources
  return rawTrends.map((t: any) => ({
    ...t,
    sources: []
  }));
};

export const getTrendDeepDive = async (trend: string, niche: string, lang: Language): Promise<TrendDeepDive> => {
   const langInstruction = getLanguageInstruction(lang);
   const prompt = `
      Provide a detailed news analysis of the trend "${trend}" in "${niche}".
      Use your internal knowledge to estimate the current sentiment, key recent events (approximate dates), and future outlook.
      
      ${langInstruction}

      Return strictly valid JSON:
      {
        "summary": "Detailed summary...",
        "sentiment": "Positive" | "Negative" | "Neutral",
        "keyEvents": [
           { "date": "YYYY-MM-DD", "title": "Event description", "url": "" }
        ],
        "futureOutlook": "Prediction for next 3-6 months...",
        "actionableTips": ["Tip 1", "Tip 2", "Tip 3"]
      }
   `;
   const response = await callOpenAI([{ role: "user", content: prompt }], OPENAI_MODELS.BASIC);
   return JSON.parse(cleanJsonOutput(response.content || "{}"));
};