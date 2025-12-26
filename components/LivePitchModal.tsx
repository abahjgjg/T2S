
import React, { useEffect, useState, useRef } from 'react';
import { Blueprint, BusinessIdea } from '../types';
import { livePitchService, PITCH_PERSONAS, PitchPersona } from '../services/liveService';
import { Mic, MicOff, X, Loader2, MessageSquare, Briefcase, User, Cpu, Play, Settings } from 'lucide-react';

interface Props {
  blueprint: Blueprint;
  idea: BusinessIdea;
  onClose: () => void;
  uiText: any;
}

interface TranscriptItem {
  text: string;
  isUser: boolean;
  timestamp: number;
}

const IconMap: Record<string, React.ReactNode> = {
  'Briefcase': <Briefcase className="w-5 h-5" />,
  'User': <User className="w-5 h-5" />,
  'Cpu': <Cpu className="w-5 h-5" />
};

export const LivePitchModal: React.FC<Props> = ({ blueprint, idea, onClose, uiText }) => {
  const [status, setStatus] = useState<'setup' | 'connecting' | 'connected' | 'error' | 'disconnected'>('setup');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [volume, setVolume] = useState(0);
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<PitchPersona>(PITCH_PERSONAS[0]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  // Cleanup on unmount
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
      onDisconnect: () => setStatus('disconnected'),
      onError: (msg) => {
        setStatus('error');
        setErrorMsg(msg);
      },
      onAudioData: (vol) => {
        setVolume(prev => prev * 0.8 + vol * 0.2); // Smooth dampening
      },
      onTranscript: (text, isUser) => {
        setTranscripts(prev => {
           // Combine if same speaker continues (rough heuristic)
           const last = prev[prev.length - 1];
           if (last && last.isUser === isUser && Date.now() - last.timestamp < 3000) {
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

  // Visualizer Loop
  useEffect(() => {
    if (!canvasRef.current || status !== 'connected') return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#10b981'; // Emerald 500
      
      const barCount = 30;
      const barWidth = width / barCount;
      const center = height / 2;

      for (let i = 0; i < barCount; i++) {
        const wave = Math.sin((Date.now() / 200) + i) * 0.5 + 0.5;
        const h = Math.max(2, volume * height * wave);
        ctx.fillRect(i * barWidth + 2, center - h / 2, barWidth - 4, h);
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
         {PITCH_PERSONAS.map(persona => (
           <div 
             key={persona.id}
             onClick={() => setSelectedPersona(persona)}
             role="button"
             tabIndex={0}
             onKeyDown={(e) => e.key === 'Enter' && setSelectedPersona(persona)}
             className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-4 ${
               selectedPersona.id === persona.id 
               ? 'bg-emerald-900/20 border-emerald-500 ring-1 ring-emerald-500/50' 
               : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
             }`}
           >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                selectedPersona.id === persona.id ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {IconMap[persona.icon]}
              </div>
              <div className="flex-1">
                 <div className="flex justify-between items-center mb-1">
                   <h3 className={`font-bold ${selectedPersona.id === persona.id ? 'text-white' : 'text-slate-300'}`}>
                     {persona.name}
                   </h3>
                   <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                     {persona.role}
                   </span>
                 </div>
                 <p className="text-xs text-slate-500 leading-relaxed">
                   {persona.description}
                 </p>
              </div>
           </div>
         ))}
       </div>

       <button 
         onClick={handleConnect}
         className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
       >
         <Mic className="w-5 h-5" /> Start Live Session
       </button>
    </div>
  );

  const renderActiveSession = () => (
    <div className="flex flex-col h-full animate-[fadeIn_0.3s_ease-out]">
        <div className="flex flex-col items-center mb-6 shrink-0">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-all duration-500 ${
            status === 'connected' ? 'bg-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.3)]' : 'bg-slate-800'
          }`}>
             {status === 'connecting' ? (
               <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
             ) : status === 'error' ? (
               <MicOff className="w-6 h-6 text-red-500" />
             ) : (
               <Mic className="w-6 h-6 text-emerald-400" />
             )}
          </div>
          <h2 className="text-xl font-bold text-white mb-1">
             {status === 'connecting' ? 'Connecting...' : status === 'error' ? 'Connection Failed' : `Speaking with ${selectedPersona.name}`}
          </h2>
          <p className="text-xs text-slate-400 text-center max-w-xs">
            {status === 'error' 
              ? errorMsg 
              : `Role: ${selectedPersona.role}. Speak clearly to begin.`}
          </p>
        </div>

        {/* Visualizer Canvas */}
        <canvas 
          ref={canvasRef} 
          width={300} 
          height={60} 
          className="w-full h-[60px] rounded-lg bg-slate-950/50 mb-4 border border-slate-800 shrink-0"
        />

        {/* Transcript Area */}
        <div className="flex-1 bg-slate-950/50 border border-slate-800 rounded-xl p-4 overflow-y-auto mb-4 min-h-[150px] relative scrollbar-thin scrollbar-thumb-slate-700">
           {transcripts.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-slate-600">
               <MessageSquare className="w-8 h-8 mb-2 opacity-20" />
               <p className="text-xs">Waiting for audio...</p>
             </div>
           ) : (
             <div className="space-y-3">
               {transcripts.map((t, i) => (
                 <div key={i} className={`flex ${t.isUser ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed shadow-sm ${
                     t.isUser ? 'bg-blue-900/40 text-blue-100 border border-blue-500/20' : 'bg-emerald-900/30 text-emerald-100 border border-emerald-500/20'
                   }`}>
                     <span className={`block font-bold opacity-50 text-[10px] mb-0.5 uppercase tracking-wide ${t.isUser ? 'text-blue-300' : 'text-emerald-300'}`}>
                       {t.isUser ? 'You' : selectedPersona.name}
                     </span>
                     {t.text}
                   </div>
                 </div>
               ))}
               <div ref={transcriptEndRef} />
             </div>
           )}
        </div>

        <div className="flex gap-3 w-full shrink-0">
           <button 
             onClick={onClose}
             className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors border border-slate-700"
           >
             End Session
           </button>
           {(status === 'disconnected' || status === 'error') && (
             <button 
               onClick={handleConnect}
               className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors"
             >
               Retry
             </button>
           )}
        </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-[fadeIn_0.3s_ease-out]">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col p-6 relative h-[600px] max-h-[90vh]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white rounded-full hover:bg-slate-800 transition-colors z-10"
          aria-label="Close Live Session"
        >
          <X className="w-5 h-5" />
        </button>

        {status === 'setup' ? renderSetup() : renderActiveSession()}
      </div>
    </div>
  );
};
