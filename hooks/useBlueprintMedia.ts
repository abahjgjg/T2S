
import { useState } from 'react';
import { AIProvider, Blueprint, Language } from '../types';
import { getAIService } from '../services/aiRegistry';
import { toast } from '../components/ToastNotifications';
import { indexedDBService } from '../utils/storageUtils';
import { supabaseService } from '../services/supabaseService';
import { MEDIA_CONFIG } from '../constants/aiConfig';

interface UseBlueprintMediaReturn {
  generateLogo: (ideaName: string, description: string, style: string) => Promise<void>;
  generateVideo: (ideaName: string, description: string) => Promise<void>;
  generateAvatar: (name: string, bio: string) => Promise<string | null>; // Returns the Asset URL directly
  isGeneratingLogo: boolean;
  isGeneratingVideo: boolean;
}

export const useBlueprintMedia = (
  provider: AIProvider,
  language: Language,
  onUpdateBlueprint: (updates: Partial<Blueprint>) => void
): UseBlueprintMediaReturn => {
  const [isGeneratingLogo, setIsGeneratingLogo] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);

  // Helper to handle asset persistence (Cloud First -> Local Fallback)
  const persistAsset = async (blob: Blob, type: 'images' | 'videos', ext: string): Promise<string> => {
    // 1. Try Cloud Upload (if configured)
    if (supabaseService.isConfigured()) {
      const publicUrl = await supabaseService.uploadPublicAsset(blob, type, ext);
      if (publicUrl) return publicUrl;
    }

    // 2. Fallback to Local IndexedDB
    const assetId = crypto.randomUUID();
    const assetKey = `${type === 'images' ? 'img' : 'vid'}_${assetId}`;
    await indexedDBService.saveAsset(assetKey, blob);
    
    // Return protocol url for useAsset hook
    return `asset://${assetKey}`;
  };

  const generateLogo = async (ideaName: string, description: string, style: string) => {
    setIsGeneratingLogo(true);
    try {
      const aiService = getAIService(provider);
      // Generate using truncated description as context
      const imageBase64 = await aiService.generateBrandImage(ideaName, description.slice(0, MEDIA_CONFIG.TEXT_TRUNCATION.BRAND_IMAGE_DESC), style);
      
      if (imageBase64) {
        // Convert Base64 to Blob for efficient storage
        const response = await fetch(`data:image/png;base64,${imageBase64}`);
        const blob = await response.blob();
        
        const assetUrl = await persistAsset(blob, 'images', 'png');

        // Update Blueprint
        onUpdateBlueprint({ brandImageUrl: assetUrl });
        
        const storageType = assetUrl.startsWith('http') ? 'Cloud' : 'Local';
        toast.success(`Brand Image Generated (${storageType} Storage)`);
      } else {
        toast.error("Failed to generate image.");
      }
    } catch (e) {
      console.error("Failed to generate logo", e);
      toast.error("Failed to generate logo. Please try again later.");
    } finally {
      setIsGeneratingLogo(false);
    }
  };

  const generateAvatar = async (name: string, bio: string): Promise<string | null> => {
    try {
      const aiService = getAIService(provider);
      const prompt = `Create a realistic, professional headshot avatar for a customer persona.
      Description: ${bio.slice(0, MEDIA_CONFIG.TEXT_TRUNCATION.PERSONA_BIO)}.
      Style: High quality photography portrait, neutral background.`;
      
      const imageBase64 = await aiService.generateBrandImage(name, prompt, "Realistic Portrait");
      
      if (imageBase64) {
        const response = await fetch(`data:image/png;base64,${imageBase64}`);
        const blob = await response.blob();
        return await persistAsset(blob, 'images', 'png');
      }
      return null;
    } catch (e) {
      console.error("Failed to generate avatar", e);
      return null;
    }
  };

  const generateVideo = async (ideaName: string, description: string) => {
    if (provider === 'openai') {
      toast.info("Video generation requires Gemini Veo.");
      return;
    }

    setIsGeneratingVideo(true);
    try {
      // Check for Google AI Studio Key (Specific to Veo/Gemini)
      // @ts-ignore
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        // @ts-ignore
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          // @ts-ignore
          await window.aistudio.openSelectKey();
        }
      }

      const aiService = getAIService(provider);
      const videoBlob = await aiService.generateMarketingVideo(ideaName, description, language);
      
      if (videoBlob) {
        const assetUrl = await persistAsset(videoBlob, 'videos', 'mp4');
        
        // Update Blueprint
        onUpdateBlueprint({ marketingVideoUrl: assetUrl });
        
        const storageType = assetUrl.startsWith('http') ? 'Cloud' : 'Local';
        toast.success(`Marketing Teaser Generated (${storageType} Storage)`);
      } else {
        toast.error("Failed to generate video.");
      }
    } catch (e) {
      console.error("Failed to generate video", e);
      toast.error("Video generation failed. Please check your API key/credits.");
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  return {
    generateLogo,
    generateVideo,
    generateAvatar,
    isGeneratingLogo,
    isGeneratingVideo
  };
};
