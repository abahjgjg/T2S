
import { Language } from "../../types";
import { retryOperation } from "../../utils/retryUtils";
import { OPENAI_MODELS, MEDIA_CONFIG } from "../../constants/aiConfig";
import { API_ENDPOINTS, VOICE_NAMES, IMAGE_SIZES, RESPONSE_FORMATS } from "../../constants/apiConfig";
import { promptService } from "../promptService";

export const generateVoiceSummary = async (text: string, lang: Language): Promise<string | null> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;

  return retryOperation(async () => {
    const response = await fetch(API_ENDPOINTS.OPENAI.SPEECH, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: OPENAI_MODELS.TTS,
        input: text.slice(0, MEDIA_CONFIG.TTS_MAX_CHARS),
        voice: VOICE_NAMES.DEFAULT
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
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not configured");

  return retryOperation(async () => {
    // Flexy loves modular prompts! Using centralized prompt service instead of hardcoded string.
    const prompt = promptService.build('GENERATE_IMAGE_PROMPT', {
      name: ideaName,
      description: description,
      style: style
    });

    const response = await fetch(API_ENDPOINTS.OPENAI.IMAGES, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: OPENAI_MODELS.IMAGE,
        prompt: prompt,
        n: 1,
        size: IMAGE_SIZES.SQUARE,
        response_format: RESPONSE_FORMATS.BASE64
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
