


import { LiveServerMessage, Modality } from "@google/genai";
import { Blueprint, BusinessIdea } from "../types";
import { decodeAudioData, float32ToPcm16Base64 } from "../utils/audioUtils";
import { GEMINI_MODELS } from "../constants/aiConfig";
import { promptService } from "./promptService";
import { PromptKey } from "../constants/systemPrompts";
import { getGeminiClient } from "./gemini/shared";
import { interpolate } from "../utils/promptUtils";
import { AUDIO_PROCESSING_CONFIG } from "../constants/audioVisualizerConfig";
import { PITCH_PERSONAS, LIVE_AUDIO_CONFIG, PitchPersona } from "../constants/liveConfig";

export interface LiveSessionCallbacks {
  onConnect: () => void;
  onDisconnect: () => void;
  onError: (error: string) => void;
  onAudioData: (visualizerData: number) => void; // Normalized 0-1 for UI visualizer
  onTranscript?: (text: string, isUser: boolean) => void;
}

export { PITCH_PERSONAS, type PitchPersona };

export class LivePitchService {
  private inputContext: AudioContext | null = null;
  private outputContext: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private outputNode: GainNode | null = null;
  private nextStartTime = 0;
  private session: any = null;
  private activeSources = new Set<AudioBufferSourceNode>();
  private isConnected = false;

  async connect(blueprint: Blueprint, idea: BusinessIdea, persona: PitchPersona, callbacks: LiveSessionCallbacks) {
    if (this.isConnected) return;

    try {
      // 0. Initialize AI Client using standard factory (Validates Key)
      const ai = getGeminiClient();

      // 1. Setup Audio Contexts
      this.inputContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: LIVE_AUDIO_CONFIG.SAMPLE_RATE_INPUT
      });
      this.outputContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: LIVE_AUDIO_CONFIG.SAMPLE_RATE_OUTPUT
      });
      
      // Hardening: Resume contexts if suspended (Browser Autoplay Policy)
      if (this.inputContext.state === 'suspended') await this.inputContext.resume();
      if (this.outputContext.state === 'suspended') await this.outputContext.resume();

      this.outputNode = this.outputContext.createGain();
      this.outputNode.connect(this.outputContext.destination);

      // 2. Get Microphone Stream
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (e) {
        throw new Error("Microphone access denied. Please allow audio permissions.");
      }

      // 3. Prepare System Instruction
      let personaInstruction = promptService.getTemplate(persona.promptKey);
      
      // If Custom Data is present (Dynamic Persona), interpolate it first
      if (persona.customData) {
        personaInstruction = interpolate(personaInstruction, persona.customData);
      }

      const systemInstruction = promptService.build('PITCH_SESSION_MASTER', {
        personaInstruction,
        name: idea.name,
        type: idea.type,
        summary: blueprint.executiveSummary,
        monetization: blueprint.revenueStreams.map(r => r.name).join(', '),
        techStack: blueprint.technicalStack.join(', ')
      });

      // 4. Initialize Live Session
      const sessionPromise = ai.live.connect({
        model: GEMINI_MODELS.LIVE,
        callbacks: {
          onopen: () => {
            this.isConnected = true;
            callbacks.onConnect();
            this.startAudioInputStream(sessionPromise, callbacks.onAudioData);
          },
          onmessage: async (message: LiveServerMessage) => {
             // Handle Transcript
             if (message.serverContent?.outputTranscription?.text) {
               callbacks.onTranscript?.(message.serverContent.outputTranscription.text, false);
             } else if (message.serverContent?.inputTranscription?.text) {
               callbacks.onTranscript?.(message.serverContent.inputTranscription.text, true);
             }

             // Handle Audio
             await this.handleServerMessage(message);
             
             // Visualizer jitter for output
             if (message.serverContent?.modelTurn) {
               callbacks.onAudioData(Math.random() * 0.5 + 0.3); 
             }
          },
          onclose: () => {
            this.disconnect();
            callbacks.onDisconnect();
          },
          onerror: (e: any) => {
            console.error("Live API Error:", e);
            // Friendly error mapping
            let msg = "Connection error occurred.";
            if (e.message?.includes("403")) msg = "API Key invalid or quota exceeded.";
            if (e.message?.includes("404")) msg = "Model not found or unavailable.";
            if (e.message?.includes("503")) msg = "Service overloaded. Retry shortly.";
            
            callbacks.onError(msg);
            this.disconnect();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          // Enable transcription with default configs as per SDK
          inputAudioTranscription: {}, 
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: persona.voiceName } },
          },
          systemInstruction: systemInstruction,
        },
      });

      this.session = await sessionPromise;

    } catch (error: any) {
      console.error("Failed to connect live session:", error);
      callbacks.onError(error.message || "Failed to access microphone or connect.");
      this.disconnect();
    }
  }

  private startAudioInputStream(sessionPromise: Promise<any>, onAudioData: (val: number) => void) {
    if (!this.inputContext || !this.stream) return;

    this.source = this.inputContext.createMediaStreamSource(this.stream);
    this.processor = this.inputContext.createScriptProcessor(LIVE_AUDIO_CONFIG.BUFFER_SIZE, 1, 1);

    this.processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      
      // Calculate volume for visualizer
      let sum = 0;
      for (let i = 0; i < inputData.length; i++) {
        sum += inputData[i] * inputData[i];
      }
      const rms = Math.sqrt(sum / inputData.length);
      onAudioData(rms * AUDIO_PROCESSING_CONFIG.VOLUME_UI_SCALE); // Scale up for UI

      // Encode and send
      const b64Data = float32ToPcm16Base64(inputData);
      
      sessionPromise.then(session => {
        session.sendRealtimeInput({
          media: {
            mimeType: LIVE_AUDIO_CONFIG.MIME_TYPE,
            data: b64Data
          }
        });
      });
    };

    this.source.connect(this.processor);
    this.processor.connect(this.inputContext.destination);
  }

  private async handleServerMessage(message: LiveServerMessage) {
    const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    
    if (audioData && this.outputContext && this.outputNode) {
      // Handle interruption
      if (message.serverContent?.interrupted) {
        this.activeSources.forEach(s => s.stop());
        this.activeSources.clear();
        this.nextStartTime = 0;
      }

      // Schedule playback
      this.nextStartTime = Math.max(this.nextStartTime, this.outputContext.currentTime);
      
      try {
        const buffer = await decodeAudioData(audioData, this.outputContext, LIVE_AUDIO_CONFIG.SAMPLE_RATE_OUTPUT);
        const source = this.outputContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.outputNode);
        
        source.onended = () => this.activeSources.delete(source);
        source.start(this.nextStartTime);
        
        this.activeSources.add(source);
        this.nextStartTime += buffer.duration;
      } catch (e) {
        console.error("Error decoding audio chunk", e);
      }
    }
  }

  disconnect() {
    this.isConnected = false;
    
    // Stop audio tracks
    this.stream?.getTracks().forEach(track => track.stop());
    
    // Disconnect nodes
    this.source?.disconnect();
    this.processor?.disconnect();
    
    // Close contexts
    this.inputContext?.close();
    this.outputContext?.close();
    
    // Reset state
    this.inputContext = null;
    this.outputContext = null;
    this.stream = null;
    this.processor = null;
    this.source = null;
    this.activeSources.clear();
    this.nextStartTime = 0;
  }
}

export const livePitchService = new LivePitchService();