
import React, { useState, useEffect } from 'react';
import { Search, Loader2, Mic, Activity, Radio, MapPin, Clock4, X, Globe, Zap, Cpu, ArrowRight, Clock, TrendingUp } from 'lucide-react';
import { sanitizeInput, validateInput } from '../utils/securityUtils';
import { SearchRegion, SearchTimeframe, AIProvider } from '../types';
import { toast } from './ToastNotifications';
import { REGIONS, TIMEFRAMES, getDynamicTopics } from '../constants/searchConfig';

interface Props {
  onSearch: (niche: string, region: SearchRegion, timeframe: SearchTimeframe) => void;
  isLoading: boolean;
  uiText: any;
  provider: AIProvider;
}

const HISTORY_KEY = 'trendventures_search_history';

export const TrendSearch: React.FC<Props> = ({ onSearch, isLoading, uiText, provider }) => {
  const [input, setInput] = useState('');
  const [region, setRegion] = useState<SearchRegion>('Global');
  const [timeframe, setTimeframe] = useState<SearchTimeframe>('30d');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState(uiText.scanning);
  const [isListening, setIsListening] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);
  const [allTickerTopics, setAllTickerTopics] = useState<string[]>([]);
  
  useEffect(() => {
    // Load History
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse search history");
      }
    }
    
    // Set Date & Dynamic Topics
    const now = new Date();
    setCurrentDate(now.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }));

    // Get topics from config
    const DYNAMIC_POOL = getDynamicTopics();
    const shuffled = [...DYNAMIC_POOL].sort(() => 0.5 - Math.random());
    setSuggestedTopics(shuffled.slice(0, 6));
    setAllTickerTopics([...DYNAMIC_POOL, ...DYNAMIC_POOL]); // Duplicate for seamless marquee
  }, []);

  // Cycle loading text to show AI reasoning steps
  useEffect(() => {
    if (isLoading) {
      const texts = uiText.searchSteps || [uiText.scanning];
      // Start with the dynamic region text if desired, or just cycle the list.
      // For consistency, we cycle the localized list.
      let i = 0;
      setLoadingText(texts[0]);
      const interval = setInterval(() => {
        i = (i + 1) % texts.length;
        setLoadingText(texts[i]);
      }, 2500);
      return () => clearInterval(interval);
    } else {
      setLoadingText(uiText.scanning);
    }
  }, [isLoading, uiText]);

  const addToHistory = (term: string) => {
    const cleanTerm = term.trim();
    if (!cleanTerm) return;
    
    // Add to front, remove duplicates, limit to 5
    const updated = [cleanTerm, ...recentSearches.filter(s => s !== cleanTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  };

  const clearHistory = () => {
    setRecentSearches([]);
    localStorage.removeItem(HISTORY_KEY);
  };

  const handleSearchTrigger = (term: string) => {
    const validation = validateInput(term);
    if (!validation.isValid) {
      setValidationError(validation.error || "Invalid input");
      return;
    }
    setValidationError(null);

    const cleanTerm = sanitizeInput(term);
    addToHistory(cleanTerm);
    onSearch(cleanTerm, region, timeframe);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) handleSearchTrigger(input);
  };

  const handleGlobalPulse = () => {
    const topic = uiText.globalPulseQuery || "Latest Breaking Business News";
    setInput(topic);
    handleSearchTrigger(topic);
  };

  const startListening = () => {
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US'; 
      recognition.start();
      setIsListening(true);
      
      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setInput(text);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
    } else {
      toast.error("Voice search requires a Chrome-based browser.");
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto text-center mt-8 md:mt-12 px-4 animate-[fadeIn_0.5s_ease-out]">
      
      {/* Background Market Ticker (Subtle) */}
      {!isLoading && (
        <div className="w-full overflow-hidden opacity-30 hover:opacity-60 transition-opacity mb-8 border-y border-white/5 py-1.5 absolute top-20 left-0 right-0 pointer-events-none select-none">
           <div className="flex animate-marquee whitespace-nowrap gap-12">
              {allTickerTopics.map((topic, i) => (
                 <span key={i} className="text-[10px] font-mono text-slate-400 flex items-center gap-2 uppercase tracking-wider">
                    <TrendingUp className="w-3 h-3 text-emerald-500/70" /> {topic}
                 </span>
              ))}
           </div>
        </div>
      )}

      {/* Live Data Badge */}
      <div className="inline-flex flex-wrap justify-center items-center gap-2 mb-6 animate-[fadeIn_1s_ease-out] relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)] backdrop-blur-sm">
           <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
           </span>
           <Globe className="w-3 h-3" />
           Live Intelligence
           <span className="w-px h-3 bg-emerald-500/30 mx-1"></span>
           <span className="text-[10px] text-emerald-500/70 font-mono flex items-center gap-1">
             {currentDate}
           </span>
        </div>
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/50 border border-slate-700 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
           <Cpu className="w-3 h-3" />
           {uiText.modelDisplay?.[provider] || (provider === 'gemini' ? 'Gemini 3 Pro' : 'OpenAI GPT-4o')}
        </div>
      </div>

      <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 mb-6 leading-tight tracking-tight relative z-10">
        {uiText.heroTitle}
      </h2>
      <p className="text-slate-400 text-base md:text-lg mb-10 max-w-lg mx-auto leading-relaxed relative z-10">
        {uiText.heroDesc}
      </p>
      
      {/* Search Configuration */}
      <div className="flex flex-col sm:flex-row justify-center gap-3 mb-6 relative z-10">
         {/* Region Selector */}
         <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 p-1 rounded-xl flex gap-1 shadow-xl overflow-x-auto no-scrollbar relative z-10 shrink-0" role="group" aria-label="Select Region">
            {REGIONS.map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setRegion(r)}
                aria-pressed={region === r}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  region === r 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50' 
                  : 'text-slate-500 hover:text-white hover:bg-slate-800'
                }`}
              >
                {region === r && <MapPin className="w-3 h-3" />}
                {r}
              </button>
            ))}
         </div>

         {/* Timeframe Selector */}
         <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 p-1 rounded-xl flex gap-1 shadow-xl overflow-x-auto no-scrollbar relative z-10 shrink-0" role="group" aria-label="Select Timeframe">
            {TIMEFRAMES.map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTimeframe(t.value)}
                aria-pressed={timeframe === t.value}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  timeframe === t.value 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                  : 'text-slate-500 hover:text-white hover:bg-slate-800'
                }`}
              >
                {timeframe === t.value && <Clock4 className="w-3 h-3" />}
                {t.label}
              </button>
            ))}
         </div>
      </div>

      <form onSubmit={handleSubmit} className="relative group mb-12 max-w-2xl mx-auto z-10">
        <div className={`absolute -inset-0.5 bg-gradient-to-r ${validationError ? 'from-red-500 to-orange-500' : 'from-emerald-500 via-blue-500 to-purple-500'} rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-500`}></div>
        <div className={`relative flex items-center bg-slate-950 rounded-2xl border ${validationError ? 'border-red-500/50' : 'border-slate-800'} p-2 shadow-2xl`}>
          <Search className={`w-6 h-6 ml-3 shrink-0 ${validationError ? 'text-red-400' : 'text-slate-400'}`} aria-hidden="true" />
          <input
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-white px-4 py-3 placeholder:text-slate-600 text-base md:text-lg w-full min-w-0"
            placeholder={uiText.placeholder}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (validationError) setValidationError(null);
            }}
            disabled={isLoading}
            aria-label="Search topics"
          />
          
          {/* Voice Input */}
          {!isLoading && (
            <button
              type="button"
              onClick={startListening}
              className={`mr-2 p-2 rounded-full transition-all ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'hover:bg-slate-800 text-slate-500 hover:text-white'}`}
              title="Voice Search"
              aria-label="Start Voice Search"
            >
              <Mic className="w-5 h-5" />
            </button>
          )}

          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0 whitespace-nowrap shadow-lg shadow-emerald-900/20"
            aria-label={isLoading ? "Analyzing..." : "Start Analysis"}
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : uiText.analyzeBtn}
          </button>
        </div>
      </form>

      {validationError && (
        <div className="flex items-center justify-center gap-2 text-red-400 text-sm mb-6 animate-[fadeIn_0.3s_ease-out]" role="alert">
          <Zap className="w-4 h-4" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Suggested Topics Chips */}
      {!isLoading && (
        <div className="flex flex-wrap justify-center gap-2 mb-10 max-w-2xl mx-auto relative z-10">
          {suggestedTopics.map((topic, i) => (
             <button
               key={i}
               onClick={() => {
                 setInput(topic);
                 handleSearchTrigger(topic);
               }}
               className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-medium hover:border-emerald-500/50 hover:text-emerald-400 hover:bg-slate-800 transition-all flex items-center gap-1.5"
             >
               <Radio className="w-3 h-3 text-orange-500/70" /> {topic}
             </button>
          ))}
          <button 
             onClick={handleGlobalPulse}
             className="px-3 py-1.5 rounded-full bg-blue-900/20 border border-blue-500/30 text-blue-400 text-xs font-medium hover:bg-blue-900/40 transition-all flex items-center gap-1.5"
             title="Scan latest global headlines"
          >
             <Activity className="w-3 h-3" /> {uiText.headlines || "Headlines"}
          </button>
        </div>
      )}

      {/* Recent Searches */}
      {!isLoading && recentSearches.length > 0 && (
        <div className="flex flex-col items-center gap-3 animate-[fadeIn_0.3s_ease-out] border-t border-slate-900 pt-6 max-w-sm mx-auto relative z-10">
          <div className="flex items-center gap-2 text-[10px] text-slate-600 uppercase font-bold tracking-widest w-full justify-between px-2">
             <span>{uiText.recent}</span>
             <button onClick={clearHistory} className="hover:text-red-400 transition-colors flex items-center gap-1" title={uiText.clearHistory} aria-label="Clear history">
               <X className="w-3 h-3" /> Clear
             </button>
          </div>
          <div className="flex flex-col gap-2 w-full">
            {recentSearches.slice(0, 3).map((term, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInput(term);
                  handleSearchTrigger(term);
                }}
                className="flex items-center justify-between px-4 py-2 bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg text-sm font-medium border border-transparent hover:border-slate-700 transition-all group w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-slate-600 group-hover:text-emerald-500 transition-colors" />
                  {term}
                </div>
                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
              </button>
            ))}
          </div>
        </div>
      )}
      
      {isLoading && (
        <div className="mt-8 flex flex-col items-center animate-[fadeIn_0.5s_ease-in] relative z-10" role="status">
          <div className="text-emerald-400 text-sm font-bold font-mono mb-3 flex items-center gap-2 bg-emerald-950/30 px-4 py-1.5 rounded-full border border-emerald-500/20">
            <Zap className="w-3.5 h-3.5 animate-bounce" />
            <span className="animate-pulse">{loadingText}</span>
          </div>
          <div className="w-64 h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-1/3 animate-[shimmer_2s_infinite_linear]"></div>
          </div>
          <div className="flex items-center gap-4 mt-3">
             <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
               <MapPin className="w-3 h-3" /> {region.toUpperCase()}
             </div>
             <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
               <Clock4 className="w-3 h-3" /> {timeframe}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
