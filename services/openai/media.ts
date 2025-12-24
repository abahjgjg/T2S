
import { Language } from "../../types";
import { retryOperation } from "../../utils/retryUtils";
import { API_KEY } from "./shared";
import { OPENAI_MODELS } from "../../constants/aiConfig";

export const generateVoiceSummary = async (text: string, lang: Language): Promise<string | null> => {
  if (!API_KEY) return null;

  return retryOperation(async () => {
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: OPENAI_MODELS.TTS,
        input: text.slice(0, 3000), // Increased limit for briefings
        voice: "alloy"
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI TTS Error: ${response.statusText}`);
    }

    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    // Convert to Base64 for consistency with app architecture
    let binary = '';
    const bytes = new Uint8Array(arrayBuffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  });
};

export const generateBrandImage = async (ideaName: string, description: string, style: string): Promise<string | null> => {
  if (!API_KEY) throw new Error("API Key not configured");

  return retryOperation(async () => {
    const prompt = `Professional logo design for "${ideaName}". ${description}. Style: ${style}. Vector flat design.`;

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: OPENAI_MODELS.IMAGE,
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        response_format: "b64_json"
      })
    });

    if (!response.ok) {
      const err = await response.json();
      const errorObj = new Error(`OpenAI Image Error: ${err.error?.message || response.statusText}`);
      throw errorObj;
    }

    const data = await response.json();
    return data.data[0]?.b64_json || null;
  });
};

export const generateMarketingVideo = async (ideaName: string, description: string, lang: Language): Promise<Blob | null> => {
  console.warn("Marketing video generation is not supported for OpenAI provider.");
  return null;
};