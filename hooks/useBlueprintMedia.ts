
import { useState } from 'react';
import { AIProvider, Blueprint, Language } from '../types';
import { getAIService } from '../services/aiRegistry';
import { toast } from '../components/ToastNotifications';
import { indexedDBService } from '../utils/storageUtils';

interface UseBlueprintMediaReturn {
  generateLogo: (ideaName: string, description: string, style: string) => Promise<void>;
  generateVideo: (ideaName: string, description: string) => Promise<void>;
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

  const generateLogo = async (ideaName: string, description: string, style: string) => {
    setIsGeneratingLogo(true);
    try {
      const aiService = getAIService(provider);
      // Generate using first 200 chars of summary as context
      const imageBase64 = await aiService.generateBrandImage(ideaName, description.slice(0, 200), style);
      
      if (imageBase64) {
        // Convert Base64 to Blob for efficient storage
        const response = await fetch(`data:image/png;base64,${imageBase64}`);
        const blob = await response.blob();
        
        // Save to IndexedDB assets store
        const assetId = crypto.randomUUID();
        const assetKey = `img_${assetId}`;
        await indexedDBService.saveAsset(assetKey, blob);

        // Update Blueprint with lightweight reference
        onUpdateBlueprint({ brandImageUrl: `asset://${assetKey}` });
        toast.success("Brand Image Generated");
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
        // Persist Blob to IndexedDB
        const assetId = crypto.randomUUID();
        const assetKey = `video_${assetId}`;
        await indexedDBService.saveAsset(assetKey, videoBlob);
        
        // Save using custom protocol to Blueprint state
        onUpdateBlueprint({ marketingVideoUrl: `asset://${assetKey}` });
        toast.success("Marketing Teaser Generated!");
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
    isGeneratingLogo,
    isGeneratingVideo
  };
};
