
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Blueprint, BusinessIdea, PitchAnalysis } from '../types';
import { livePitchService, PITCH_PERSONAS, PitchPersona } from '../services/liveService';
import { Mic, MicOff, Loader2, MessageSquare, Briefcase, User, Cpu, Settings, Sparkles, Zap, Check, Save } from 'lucide-react';
import { getAIService } from '../services/aiRegistry';
import { toast } from './ToastNotifications';
import { Modal } from './ui/Modal';
import { usePreferences } from '../contexts/PreferencesContext';
import { LIVE_AUDIO_CONFIG } from '../constants/appConfig';
import { AUDIO_VISUALIZER_CONFIG, PERSONA_VOICE_CONFIG, PERSONA_ID_PREFIX } from '../constants/audioVisualizerConfig';
import { TEXT_TRUNCATION } from '../constants/displayConfig';
import { COLORS } from '../constants/theme';

interface Props {
  blueprint: Blueprint;
  idea: BusinessIdea;
  onClose: () => void;
  onUpdateBlueprint?: (_updates: Partial<Blueprint>) => void;
}

interface TranscriptItem {
  text: string;
  isUser: boolean;
  timestamp: number;
}

  const IconMap: Record<string, React.ReactNode> = {
  'Briefcase': <Briefcase className="w-5 h-5" />,
  'User': <User className="w-5 h-5" />,
  'Cpu': <Cpu className="w-5 h-5" />,
  'Sparkles': <Sparkles className="w-5 h-5" />
};
  // Note: IconMap is used in renderSetup

export const LivePitchModal: React.FC<Props> = ({ blueprint, idea, onClose, onUpdateBlueprint }) => {
  const [status, setStatus] = useState<'setup' | 'connecting' | 'connected' | 'error' | 'disconnected' | 'analyzing' | 'results'>('setup');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [volume, setVolume] = useState(0);
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<PitchPersona>(PITCH_PERSONAS[0]);
  const [pitchAnalysis, setPitchAnalysis] = useState<PitchAnalysis | null>(null);
  const [appliedSections, setAppliedSections] = useState<Set<string>>(new Set());
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const { provider, language } = usePreferences();

  const availablePersonas = useMemo(() => {
    const dynamicPersonas: PitchPersona[] = (blueprint.personas || []).map((p, index) => ({
      id: `${PERSONA_ID_PREFIX.GENERATED}${index}`,
      name: p.name,
      role: p.occupation,
      description: `Generated Persona: ${p.age}. ${p.bio.slice(0, TEXT_TRUNCATION.BIO_PREVIEW)}...`,
      icon: 'Sparkles',
      voiceName: PERSONA_VOICE_CONFIG.VOICES[index % PERSONA_VOICE_CONFIG.VOICES.length] as PitchPersona['voiceName'],
      promptKey: 'PERSONA_GENERATED',
      customData: {
        name: p.name,
        bio: p.bio,
        age: p.age,
        occupation: p.occupation,
        painPoints: p.painPoints.join(', '),
        goals: p.goals.join(', ')
      }
    }));

    return [...dynamicPersonas, ...PITCH_PERSONAS];
  }, [blueprint.personas]);

  useEffect(() => {
    if (blueprint.personas && blueprint.personas.length > 0 && selectedPersona.id === PITCH_PERSONAS[0].id) {
        const match = availablePersonas.find(p => p.id === `${PERSONA_ID_PREFIX.GENERATED}0`);
        if (match) setSelectedPersona(match);
    }
  }, [availablePersonas]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  useEffect(() => {
    return () => {
      livePitchService.disconnect();
    };
  }, []);

  const handleConnect = () => {
    setStatus('connecting');
    setErrorMsg(null);
    setTranscripts([]);
    
    livePitchService.connect(blueprint, idea, selectedPersona, {
      onConnect: () => setStatus('connected'),
      onDisconnect: () => {
         if (status === 'connected') setStatus('disconnected');
      },
      onError: (msg) => {
        setStatus('error');
        setErrorMsg(msg);
      },
      onAudioData: (vol) => {
        setVolume(prev => prev * AUDIO_VISUALIZER_CONFIG.SMOOTHING.PRIMARY + vol * AUDIO_VISUALIZER_CONFIG.SMOOTHING.SECONDARY);
      },
      onTranscript: (text, isUser) => {
        setTranscripts(prev => {
           const last = prev[prev.length - 1];
            if (last && last.isUser === isUser && Date.now() - last.timestamp < LIVE_AUDIO_CONFIG.MERGE_WINDOW_MS) {
             const updated = [...prev];
             updated[updated.length - 1].text += " " + text;
             updated[updated.length - 1].timestamp = Date.now();
             return updated;
           }
           return [...prev, { text, isUser, timestamp: Date.now() }];
        });
      }
    });
  };

  const handleEndAndAnalyze = async () => {
    livePitchService.disconnect();
    
    if (transcripts.length < 2) {
      toast.info("Not enough conversation to analyze.");
      onClose();
      return;
    }

    setStatus('analyzing');
    try {
      const fullTranscript = transcripts.map(t => `${t.isUser ? 'Founder' : selectedPersona.role}: ${t.text}`).join('\n');
      const aiService = getAIService(provider);

      const analysis = await aiService.analyzePitchTranscript(fullTranscript, idea, blueprint, selectedPersona.role, language);
      setPitchAnalysis(analysis);
      setStatus('results');
    } catch (e) {
      console.error(e);
      toast.error("Analysis failed. Please try again.");
      setStatus('disconnected');
    }
  };

  const handleApplyUpdate = (pivot: PitchAnalysis['suggestedPivots'][0]) => {
    if (!onUpdateBlueprint) return;
    
    let valueToUpdate = pivot.proposedValue;
    if (typeof valueToUpdate === 'string' && (pivot.section === 'revenueStreams' || pivot.section === 'technicalStack' || pivot.section === 'marketingStrategy')) {
       try {
         if (valueToUpdate.startsWith('[') || valueToUpdate.startsWith('{')) {
            valueToUpdate = JSON.parse(valueToUpdate);
         }
        } catch (e) { 
          // Silent fail - value is not JSON, keep as string
        }
    }

    onUpdateBlueprint({ [pivot.section]: valueToUpdate });
    setAppliedSections(prev => new Set(prev).add(pivot.section));
    toast.success("Blueprint updated!");
  };

  useEffect(() => {
    if (!canvasRef.current || status !== 'connected') return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = COLORS.primary.emerald;
      const barCount = AUDIO_VISUALIZER_CONFIG.BAR_COUNT;
      const barWidth = width / barCount;
      const center = height / 2;
      for (let i = 0; i < barCount; i++) {
        const wave = Math.sin((Date.now() / AUDIO_VISUALIZER_CONFIG.WAVE_SPEED_DIVISOR) + i) * 0.5 + 0.5;
        const h = Math.max(2, volume * height * wave);
        ctx.fillRect(i * barWidth + AUDIO_VISUALIZER_CONFIG.BAR_SPACING, center - h / 2, barWidth - AUDIO_VISUALIZER_CONFIG.BAR_WIDTH_PADDING, h);
      }
      animationId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animationId);
  }, [volume, status]);

  const renderSetup = () => (
    <div className="flex flex-col h-full animate-[fadeIn_0.3s_ease-out]">
       <div className="text-center mb-6">
         <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
           <Settings className="w-8 h-8 text-emerald-400" />
         </div>
         <h2 className="text-2xl font-bold text-white mb-2">Configure Session</h2>
         <p className="text-slate-400 text-sm">Choose who you want to pitch your idea to.</p>
       </div>
       <div className="flex-1 overflow-y-auto space-y-3 mb-6 pr-2 custom-scrollbar">
         {availablePersonas.map(persona => (
           <div key={persona.id} onClick={() => setSelectedPersona(persona)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setSelectedPersona(persona)} className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-4 ${selectedPersona.id === persona.id ? 'bg-emerald-900/20 border-emerald-500 ring-1 ring-emerald-500/50' : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${selectedPersona.id === persona.id ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'}`}>{IconMap[persona.icon] || <User className="w-5 h-5" />}</div>
              <div className="flex-1">
                 <div className="flex justify-between items-center mb-1"><div className="flex items-center gap-2"><h3 className={`font-bold ${selectedPersona.id === persona.id ? 'text-white' : 'text-slate-300'}`}>{persona.name}</h3>{persona.customData && (<span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30 font-mono">GENERATED</span>)}</div><span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">{persona.role}</span></div>
                 <p className="text-xs text-slate-500 leading-relaxed">{persona.description}</p>
              </div>
           </div>
         ))}
       </div>
       <button onClick={handleConnect} className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"><Mic className="w-5 h-5" /> Start Live Session</button>
    </div>
  );

  const renderActiveSession = () => (
    <div className="flex flex-col h-full animate-[fadeIn_0.3s_ease-out]">
        <div className="flex flex-col items-center mb-6 shrink-0">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-all duration-500 ${status === 'connected' ? `bg-emerald-500/20 shadow-[0_0_30px_${COLORS.shadow.emerald}]` : 'bg-slate-800'}`}>
             {status === 'connecting' ? <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" /> : status === 'error' ? <MicOff className="w-6 h-6 text-red-500" /> : <Mic className="w-6 h-6 text-emerald-400" />}
          </div>
          <h2 className="text-xl font-bold text-white mb-1">{status === 'connecting' ? 'Connecting...' : status === 'error' ? 'Connection Failed' : `Speaking with ${selectedPersona.name}`}</h2>
          <p className="text-xs text-slate-400 text-center max-w-xs">{status === 'error' ? errorMsg : `Role: ${selectedPersona.role}. Speak clearly to begin.`}</p>
        </div>
        <canvas ref={canvasRef} width={300} height={60} className="w-full h-[60px] rounded-lg bg-slate-950/50 mb-4 border border-slate-800 shrink-0" />
        <div className="flex-1 bg-slate-950/50 border border-slate-800 rounded-xl p-4 overflow-y-auto mb-4 min-h-[150px] relative scrollbar-thin scrollbar-thumb-slate-700">
           {transcripts.length === 0 ? <div className="h-full flex flex-col items-center justify-center text-slate-600"><MessageSquare className="w-8 h-8 mb-2 opacity-20" /><p className="text-xs">Waiting for audio...</p></div> : (
             <div className="space-y-3">{transcripts.map((t, i) => (<div key={i} className={`flex ${t.isUser ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed shadow-sm ${t.isUser ? 'bg-blue-900/40 text-blue-100 border border-blue-500/20' : 'bg-emerald-900/30 text-emerald-100 border border-emerald-500/20'}`}><span className={`block font-bold opacity-50 text-[10px] mb-0.5 uppercase tracking-wide ${t.isUser ? 'text-blue-300' : 'text-emerald-300'}`}>{t.isUser ? 'You' : selectedPersona.name}</span>{t.text}</div></div>))}<div ref={transcriptEndRef} /></div>
           )}
        </div>
        <div className="flex gap-3 w-full shrink-0">
           <button onClick={handleEndAndAnalyze} disabled={status !== 'connected' || transcripts.length < 2} className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"><Zap className="w-4 h-4" /> End & Analyze</button>
           {(status === 'disconnected' || status === 'error') && (<button onClick={handleConnect} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors">Retry</button>)}
        </div>
    </div>
  );

  const renderAnalyzing = () => (
    <div className="flex flex-col items-center justify-center h-full animate-[fadeIn_0.5s_ease-out] text-center">
       <div className="relative mb-6"><div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl animate-pulse"></div><Loader2 className="w-16 h-16 text-purple-400 animate-spin relative z-10" /></div>
       <h3 className="text-xl font-bold text-white mb-2">Analyzing Pitch...</h3>
       <p className="text-slate-400 text-sm max-w-xs">Reviewing feedback from {selectedPersona.name} to identify strategic gaps.</p>
    </div>
  );

  const renderResults = () => {
    if (!pitchAnalysis) return null;
    return (
      <div className="flex flex-col h-full animate-[slideUp_0.4s_ease-out]">
         <div className="text-center mb-6 shrink-0"><h2 className="text-2xl font-bold text-white mb-1">Pitch Analysis</h2><p className="text-xs text-slate-400">Feedback from {selectedPersona.role}</p></div>
         <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800"><h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Summary</h4><p className="text-sm text-slate-300 leading-relaxed">{pitchAnalysis.feedbackSummary}</p></div>
            <div className="bg-red-900/10 p-4 rounded-xl border border-red-500/20"><h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-2"><MicOff className="w-3 h-3" /> Key Concerns</h4><ul className="space-y-1">{pitchAnalysis.criticisms.map((crit, i) => (<li key={i} className="text-sm text-slate-300 flex items-start gap-2"><span className="text-red-500 mt-1.5">•</span> {crit}</li>))}</ul></div>
            <div className="space-y-3"><h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2"><Zap className="w-3 h-3" /> Recommended Blueprint Updates</h4>{pitchAnalysis.suggestedPivots.map((pivot, i) => (<div key={i} className="bg-emerald-900/10 border border-emerald-500/20 p-4 rounded-xl"><div className="flex justify-between items-start mb-2"><span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-700 font-mono">{pivot.section}</span>{onUpdateBlueprint && (<button onClick={() => handleApplyUpdate(pivot)} disabled={appliedSections.has(pivot.section)} className={`text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors font-bold ${appliedSections.has(pivot.section) ? 'bg-emerald-500/20 text-emerald-400 cursor-default' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}>{appliedSections.has(pivot.section) ? <Check className="w-3 h-3" /> : <Save className="w-3 h-3" />}{appliedSections.has(pivot.section) ? 'Applied' : 'Apply Fix'}</button>)}</div><p className="text-sm font-bold text-white mb-1">{pivot.suggestion}</p><p className="text-xs text-slate-400 italic">"{pivot.reason}"</p></div>))}</div>
         </div>
         <div className="mt-4 pt-4 border-t border-slate-800 shrink-0"><button onClick={onClose} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors">Close & Continue</button></div>
      </div>
    );
  };

  return (
    <Modal isOpen={true} onClose={onClose} className="max-w-md h-[600px]" hideCloseButton={status !== 'analyzing' && status !== 'results'}>
      <div className="p-6 h-full flex flex-col relative">
        {status === 'setup' && renderSetup()}
        {(status === 'connecting' || status === 'connected' || status === 'error' || status === 'disconnected') && renderActiveSession()}
        {status === 'analyzing' && renderAnalyzing()}
        {status === 'results' && renderResults()}
      </div>
    </Modal>
  );
};
