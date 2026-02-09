
import React, { useState, useEffect, useCallback } from 'react';
import { Blueprint, BusinessIdea } from '../types';
import { X, ChevronLeft, ChevronRight, Maximize2, Minimize2, Palette, TrendingUp, Target, Layers, ShieldCheck, Share2, DollarSign } from 'lucide-react';
import { SafeMarkdown } from './SafeMarkdown';
import { SmartImage } from './ui/SmartImage';

interface Props {
  idea: BusinessIdea;
  blueprint: Blueprint;
  onClose: () => void;
}

export const PresentationMode: React.FC<Props> = ({ idea, blueprint, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const slides = [
    { type: 'COVER', title: 'Vision' },
    { type: 'EXECUTIVE', title: 'Executive Summary' },
    { type: 'MARKET', title: 'Market & Strategy' },
    { type: 'MODEL', title: 'Business Model' },
    { type: 'EXECUTION', title: 'Execution Roadmap' },
    { type: 'SWOT', title: 'Strategic Analysis' },
  ];

  const handleNext = useCallback(() => {
    setCurrentSlide(prev => Math.min(prev + 1, slides.length - 1));
  }, [slides.length]);

  const handlePrev = useCallback(() => {
    setCurrentSlide(prev => Math.max(prev - 1, 0));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, onClose]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const renderSlideContent = () => {
    const slide = slides[currentSlide];

    switch (slide.type) {
       case 'COVER':
         return (
           <div className="flex flex-col items-center justify-center h-full text-center px-8 animate-[fadeIn_0.5s_ease-out]">
             {blueprint.brandImageUrl ? (
               <SmartImage 
                 src={blueprint.brandImageUrl} 
                 alt="Logo" 
                 className="w-48 h-48 object-contain mb-8 drop-shadow-2xl rounded-2xl bg-white/5 p-4 border border-white/10"
                 containerClassName="w-48 h-48 mb-8"
                 fallbackIcon={<div className="w-32 h-32 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30"><Palette className="w-16 h-16 text-emerald-400" /></div>}
               />
             ) : (
               <div className="w-32 h-32 bg-emerald-500/20 rounded-full flex items-center justify-center mb-8 border border-emerald-500/30"><Palette className="w-16 h-16 text-emerald-400" /></div>
             )}
            <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-200 to-emerald-400 mb-6 tracking-tight">{idea.name}</h1>
            <p className="text-2xl text-slate-300 font-light max-w-3xl leading-relaxed">{idea.description}</p>
            <div className="mt-12 flex gap-4">
               <span className="px-4 py-2 bg-white/10 rounded-full text-sm font-bold uppercase tracking-wider text-white border border-white/10">{idea.type}</span>
               <span className="px-4 py-2 bg-white/10 rounded-full text-sm font-bold uppercase tracking-wider text-white border border-white/10">{idea.monetizationModel}</span>
            </div>
          </div>
        );
      case 'EXECUTIVE':
        return (
          <div className="flex flex-col h-full px-12 py-10 animate-[slideUp_0.4s_ease-out]">
            <div className="flex items-center gap-4 mb-12 border-b border-white/10 pb-6"><div className="p-3 bg-blue-500/20 rounded-xl"><TrendingUp className="w-8 h-8 text-blue-400" /></div><h2 className="text-4xl font-bold text-white">Executive Summary</h2></div>
            <div className="prose prose-invert prose-xl max-w-none leading-loose text-slate-200"><SafeMarkdown content={blueprint.executiveSummary} /></div>
          </div>
        );
      case 'MARKET':
        return (
          <div className="flex flex-col h-full px-12 py-10 animate-[slideUp_0.4s_ease-out]">
            <div className="flex items-center gap-4 mb-12 border-b border-white/10 pb-6"><div className="p-3 bg-purple-500/20 rounded-xl"><Target className="w-8 h-8 text-purple-400" /></div><h2 className="text-4xl font-bold text-white">Market & Strategy</h2></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 h-full">
               <div className="bg-white/5 p-8 rounded-2xl border border-white/10"><h3 className="text-2xl font-bold text-purple-300 mb-6">Target Audience</h3><div className="prose prose-invert prose-lg text-slate-300"><SafeMarkdown content={blueprint.targetAudience} /></div></div>
               <div className="bg-white/5 p-8 rounded-2xl border border-white/10"><h3 className="text-2xl font-bold text-blue-300 mb-6">Marketing Channels</h3><ul className="space-y-4">{blueprint.marketingStrategy.map((strat, i) => (<li key={i} className="flex items-start gap-4 text-xl text-slate-200"><div className="w-2 h-2 bg-blue-400 rounded-full mt-2.5 shrink-0" />{strat}</li>))}</ul></div>
            </div>
          </div>
        );
      case 'MODEL':
        return (
          <div className="flex flex-col h-full px-12 py-10 animate-[slideUp_0.4s_ease-out]">
            <div className="flex items-center gap-4 mb-12 border-b border-white/10 pb-6"><div className="p-3 bg-emerald-500/20 rounded-xl"><DollarSign className="w-8 h-8 text-emerald-400" /></div><h2 className="text-4xl font-bold text-white">Business Model</h2></div>
            <div className="grid grid-cols-1 gap-6">{blueprint.revenueStreams.map((stream, i) => (<div key={i} className="flex items-center justify-between p-8 bg-gradient-to-r from-emerald-900/20 to-slate-900 border border-emerald-500/30 rounded-2xl"><div className="text-3xl font-bold text-white">{stream.name}</div><div className="text-4xl font-mono text-emerald-400 font-bold">${stream.projected.toLocaleString()}<span className="text-xl text-slate-500 font-sans font-normal ml-2">/mo</span></div></div>))}</div>
            <div className="mt-auto bg-slate-800/50 p-6 rounded-xl border border-slate-700 text-center"><p className="text-slate-400 uppercase font-bold tracking-widest text-sm mb-2">Total Projected Revenue</p><p className="text-6xl font-black text-white">${blueprint.revenueStreams.reduce((acc, s) => acc + s.projected, 0).toLocaleString()}<span className="text-2xl text-slate-500 font-normal ml-2">MRR</span></p></div>
          </div>
        );
      case 'EXECUTION':
        return (
          <div className="flex flex-col h-full px-12 py-10 animate-[slideUp_0.4s_ease-out]">
            <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6"><div className="p-3 bg-orange-500/20 rounded-xl"><Layers className="w-8 h-8 text-orange-400" /></div><h2 className="text-4xl font-bold text-white">Execution Roadmap</h2></div>
            <div className="grid grid-cols-3 gap-6 h-full overflow-hidden">
               <div className="col-span-1 bg-slate-900/50 p-6 rounded-2xl border border-slate-800 flex flex-col"><h3 className="text-xl font-bold text-blue-400 mb-6 uppercase tracking-wider">Tech Stack</h3><div className="flex flex-wrap gap-2">{blueprint.technicalStack.map((t, i) => (<span key={i} className="px-3 py-2 bg-slate-800 rounded-lg text-slate-200 font-mono text-sm border border-slate-700">{t}</span>))}</div></div>
               <div className="col-span-2 space-y-4 overflow-y-auto custom-scrollbar pr-2">{blueprint.roadmap.map((phase, i) => (<div key={i} className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700/50"><h4 className="text-2xl font-bold text-white mb-4">{phase.phase}</h4><ul className="space-y-2">{phase.tasks.map((task, t) => (<li key={t} className="flex items-start gap-3 text-lg text-slate-300"><div className="w-2 h-2 bg-orange-500 rounded-full mt-2.5 shrink-0" />{task}</li>))}</ul></div>))}</div>
            </div>
          </div>
        );
      case 'SWOT':
        return (
          <div className="flex flex-col h-full px-12 py-10 animate-[slideUp_0.4s_ease-out]">
            <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6"><div className="p-3 bg-red-500/20 rounded-xl"><ShieldCheck className="w-8 h-8 text-red-400" /></div><h2 className="text-4xl font-bold text-white">Strategic Analysis (SWOT)</h2></div>
            <div className="grid grid-cols-2 grid-rows-2 gap-6 h-full">
               <div className="bg-emerald-900/20 p-8 rounded-2xl border border-emerald-500/20"><h3 className="text-2xl font-bold text-emerald-400 mb-4">Strengths</h3><ul className="space-y-2">{blueprint.swot.strengths.map((s, i) => <li key={i} className="text-lg text-slate-200">• {s}</li>)}</ul></div>
               <div className="bg-yellow-900/20 p-8 rounded-2xl border border-yellow-500/20"><h3 className="text-2xl font-bold text-yellow-400 mb-4">Weaknesses</h3><ul className="space-y-2">{blueprint.swot.weaknesses.map((s, i) => <li key={i} className="text-lg text-slate-200">• {s}</li>)}</ul></div>
               <div className="bg-blue-900/20 p-8 rounded-2xl border border-blue-500/20"><h3 className="text-2xl font-bold text-blue-400 mb-4">Opportunities</h3><ul className="space-y-2">{blueprint.swot.opportunities.map((s, i) => <li key={i} className="text-lg text-slate-200">• {s}</li>)}</ul></div>
               <div className="bg-red-900/20 p-8 rounded-2xl border border-red-500/20"><h3 className="text-2xl font-bold text-red-400 mb-4">Threats</h3><ul className="space-y-2">{blueprint.swot.threats.map((s, i) => <li key={i} className="text-lg text-slate-200">• {s}</li>)}</ul></div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col text-white animate-[fadeIn_0.3s_ease-out]">
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-50 bg-gradient-to-b from-black/50 to-transparent hover:opacity-100 transition-opacity">
         <div className="flex items-center gap-4"><button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-300 hover:text-white"><X className="w-6 h-6" /></button><div className="text-sm font-bold text-slate-400 uppercase tracking-widest">{idea.name} • {slides[currentSlide].title}</div></div>
         <button onClick={toggleFullscreen} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-300 hover:text-white">{isFullscreen ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}</button>
      </div>
      <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-slate-950"><div className="w-full h-full max-w-[1600px] mx-auto aspect-video relative">{renderSlideContent()}</div></div>
      <div className="h-16 border-t border-white/10 bg-slate-900 flex items-center justify-between px-8 z-50">
         <div className="text-slate-500 font-mono text-sm">Slide {currentSlide + 1} / {slides.length}</div>
         <div className="flex items-center gap-6"><button onClick={handlePrev} disabled={currentSlide === 0} className="p-3 rounded-full hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"><ChevronLeft className="w-6 h-6" /></button><div className="flex gap-2">{slides.map((_, i) => (<button key={i} onClick={() => setCurrentSlide(i)} className={`w-2.5 h-2.5 rounded-full transition-all ${currentSlide === i ? 'bg-emerald-500 scale-125' : 'bg-slate-700 hover:bg-slate-500'}`} />))}</div><button onClick={handleNext} disabled={currentSlide === slides.length - 1} className="p-3 rounded-full hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"><ChevronRight className="w-6 h-6" /></button></div>
         <div className="w-24 text-right"><span className="text-emerald-500 font-bold text-sm tracking-widest">TV.AI</span></div>
      </div>
    </div>
  );
};
