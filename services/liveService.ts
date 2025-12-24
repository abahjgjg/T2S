
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { Blueprint, BusinessIdea } from "../types";
import { decodeAudioData, float32ToPcm16Base64 } from "../utils/audioUtils";
import { GEMINI_MODELS } from "../constants/aiConfig";
import { promptService } from "./promptService";
import { PromptKey } from "../constants/systemPrompts";

export interface LiveSessionCallbacks {
  onConnect: () => void;
  onDisconnect: () => void;
  onError: (error: string) => void;
  onAudioData: (visualizerData: number) => void; // Normalized 0-1 for UI visualizer
  onTranscript?: (text: string, isUser: boolean) => void;
}

export interface PitchPersona {
  id: string;
  name: string;
  role: string;
  description: string;
  icon: string; // Lucide icon name or emoji
  voiceName: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
  promptKey: PromptKey;
}

export const PITCH_PERSONAS: PitchPersona[] = [
  {
    id: 'vc_skeptic',
    name: 'Marcus',
    role: 'Skeptical VC',
    description: 'Hard-nosed investor focused on ROI, moats, and revenue.',
    icon: 'Briefcase',
    voiceName: 'Fenrir',
    promptKey: 'PERSONA_VC_SKEPTIC'
  },
  {
    id: 'customer_curious',
    name: 'Sarah',
    role: 'Potential Customer',
    description: 'Curious but budget-conscious buyer looking for value.',
    icon: 'User',
    voiceName: 'Kore',
    promptKey: 'PERSONA_CUSTOMER_CURIOUS'
  },
  {
    id: 'tech_cto',
    name: 'Alex',
    role: 'Technical Co-founder',
    description: 'Senior engineer focused on scalability, stack, and feasibility.',
    icon: 'Cpu',
    voiceName: 'Puck', // Deeper, calm voice
    promptKey: 'PERSONA_TECH_CTO'
  }
];

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
      if (!process.env.API_KEY) {
        throw new Error("API Key is missing in environment variables.");
      }

      // 0. Initialize AI Client (Fresh instance to ensure Key validity)
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      // 1. Setup Audio Contexts
      this.inputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      this.outputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      this.outputNode = this.outputContext.createGain();
      this.outputNode.connect(this.outputContext.destination);

      // 2. Get Microphone Stream
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // 3. Prepare System Instruction
      const personaInstruction = promptService.getTemplate(persona.promptKey);
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
    this.processor = this.inputContext.createScriptProcessor(4096, 1, 1);

    this.processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      
      // Calculate volume for visualizer
      let sum = 0;
      for (let i = 0; i < inputData.length; i++) {
        sum += inputData[i] * inputData[i];
      }
      const rms = Math.sqrt(sum / inputData.length);
      onAudioData(rms * 5); // Scale up for UI

      // Encode and send
      const b64Data = float32ToPcm16Base64(inputData);
      
      sessionPromise.then(session => {
        session.sendRealtimeInput({
          media: {
            mimeType: 'audio/pcm;rate=16000',
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
        const buffer = await decodeAudioData(audioData, this.outputContext, 24000);
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
