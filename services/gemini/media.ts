

import { Modality } from "@google/genai";
import { Language } from "../../types";
import { retryOperation } from "../../utils/retryUtils";
import { getGeminiClient } from "./shared";
import { AUDIO_PROCESSING_CONFIG } from "../../constants/audioVisualizerConfig";
import { GEMINI_MODELS, MEDIA_CONFIG } from "../../constants/aiConfig";
import { promptService } from "../promptService";

export const generateVoiceSummary = async (text: string, lang: Language): Promise<string | null> => {
  return retryOperation(async () => {
    try {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: GEMINI_MODELS.TTS,
        contents: { parts: [{ text: text.slice(0, MEDIA_CONFIG.TTS_MAX_CHARS) }] },
        config: {
          responseModalities: [Modality.AUDIO], 
          speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: MEDIA_CONFIG.DEFAULT_VOICE },
              },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) {
        throw new Error("No audio content generated");
      }

      return base64Audio;
    } catch (error) {
       console.error("Error generating voice summary:", error);
       throw error;
    }
  }, MEDIA_CONFIG.RETRY.DEFAULT_MAX_RETRIES - 1, MEDIA_CONFIG.RETRY.DEFAULT_DELAY_MS);
};

export const generateBrandImage = async (ideaName: string, description: string, style: string): Promise<string | null> => {
  return retryOperation(async () => {
    try {
      const ai = getGeminiClient();
      
      const prompt = promptService.build('GENERATE_IMAGE_PROMPT', {
        name: ideaName,
        description,
        style: style || MEDIA_CONFIG.DEFAULT_IMAGE_STYLE
      });

      const response = await ai.models.generateContent({
        model: GEMINI_MODELS.IMAGE,
        contents: {
          parts: [{ text: prompt }],
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return part.inlineData.data;
        }
      }
      
      console.warn("No image data found in response");
      return null;

    } catch (error) {
      console.error("Error generating brand image:", error);
      throw error;
    }
  });
};

export const generateMarketingVideo = async (ideaName: string, description: string, lang: Language): Promise<Blob | null> => {
  // Use fresh client for Veo to ensure key is valid
  const ai = getGeminiClient();
  
  return retryOperation(async () => {
    try {
      const prompt = promptService.build('GENERATE_VIDEO_PROMPT', {
        name: ideaName,
        description: description.slice(0, MEDIA_CONFIG.VIDEO_DESC_MAX_CHARS)
      });

      let operation = await ai.models.generateVideos({
        model: GEMINI_MODELS.VIDEO,
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: MEDIA_CONFIG.VIDEO_RESOLUTION,
          aspectRatio: MEDIA_CONFIG.VIDEO_ASPECT_RATIO
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, MEDIA_CONFIG.VIDEO_POLL_INTERVAL_MS));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!downloadLink) throw new Error("No video URI generated");

      // SECURITY WARNING: API key in URL is exposed in browser logs.
      // This is a temporary measure until Secure API Proxy is implemented (BLOCKED).
      const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      if (!response.ok) throw new Error(`Failed to download video: ${response.statusText}`);

      const blob = await response.blob();
      return blob;

    } catch (error) {
      console.error("Error generating marketing video:", error);
      throw error;
    }
  }, MEDIA_CONFIG.RETRY.DEFAULT_MAX_RETRIES, MEDIA_CONFIG.RETRY.LONG_DELAY_MS);
};
