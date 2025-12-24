
import { Modality } from "@google/genai";
import { Language } from "../../types";
import { retryOperation } from "../../utils/retryUtils";
import { getGeminiClient } from "./shared";
import { GEMINI_MODELS } from "../../constants/aiConfig";

export const generateVoiceSummary = async (text: string, lang: Language): Promise<string | null> => {
  return retryOperation(async () => {
    try {
      const ai = getGeminiClient();
      // Increased limit to 3000 chars to allow for detailed market briefings
      const response = await ai.models.generateContent({
        model: GEMINI_MODELS.TTS,
        contents: { parts: [{ text: text.slice(0, 3000) }] },
        config: {
          responseModalities: [Modality.AUDIO], 
          speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Kore' },
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
  }, 2, 500);
};

export const generateBrandImage = async (ideaName: string, description: string, style: string): Promise<string | null> => {
  return retryOperation(async () => {
    try {
      const ai = getGeminiClient();
      const prompt = `
        Create a professional, modern logo concept for a business named "${ideaName}".
        Business Description: ${description}
        Visual Style: ${style || "Minimalist, Tech-focused, Clean lines, Vector art style"}.
        Aspect Ratio: 1:1.
        Do not include text other than the logo mark itself.
      `;

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
      const prompt = `
        Create a cinematic, futuristic marketing teaser video for a business idea named "${ideaName}".
        Concept: ${description.slice(0, 150)}.
        Style: Professional, high-tech, inspiring, fast-paced.
        Resolution: 720p. Aspect Ratio: 16:9.
      `;

      let operation = await ai.models.generateVideos({
        model: GEMINI_MODELS.VIDEO,
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!downloadLink) throw new Error("No video URI generated");

      const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      if (!response.ok) throw new Error(`Failed to download video: ${response.statusText}`);

      const blob = await response.blob();
      return blob;

    } catch (error) {
      console.error("Error generating marketing video:", error);
      throw error;
    }
  }, 1, 1000);
};