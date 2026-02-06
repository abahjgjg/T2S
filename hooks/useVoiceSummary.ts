
import { useState, useRef, useEffect, useCallback } from 'react';
import { AIProvider, Language } from '../types';
import { getAIService } from '../services/aiRegistry';
import { decodeAudioData } from '../utils/audioUtils';
import { MEDIA_CONFIG } from '../constants/aiConfig';

interface UseVoiceSummaryReturn {
  play: (text: string, errorMessage?: string) => Promise<void>;
  stop: () => void;
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useVoiceSummary = (
  provider: AIProvider,
  language: Language
): UseVoiceSummaryReturn => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  // Ensure AudioContext is closed when component unmounts
  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, []);

  const cleanupAudio = useCallback(() => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch (e) {
        // Ignore errors if already stopped
      }
      sourceNodeRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ 
        sampleRate: MEDIA_CONFIG.AUDIO.SAMPLE_RATE
      });
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  };

  const stop = useCallback(() => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch (e) {
        // Ignore
      }
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const play = useCallback(async (text: string, errorMessage: string = "Failed to play audio.") => {
    if (isPlaying) {
      stop();
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const aiService = getAIService(provider);
      
      const base64Audio = await aiService.generateVoiceSummary(text, language);
      
      if (!base64Audio) {
        throw new Error("Voice synthesis is not supported for this provider.");
      }

      const ctx = getAudioContext();
      const buffer = await decodeAudioData(base64Audio, ctx);
      
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      
      source.onended = () => {
        setIsPlaying(false);
        sourceNodeRef.current = null;
      };

      sourceNodeRef.current = source;
      source.start();
      setIsPlaying(true);

    } catch (err: any) {
      console.error("Audio playback error:", err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isPlaying, language, provider, stop]);

  return { play, stop, isPlaying, isLoading, error };
};
