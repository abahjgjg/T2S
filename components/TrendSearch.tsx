
import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Mic, Activity, Radio, MapPin, Clock4, X, Globe, Zap, Cpu, ArrowRight, Clock, TrendingUp, Hash, BrainCircuit, Sparkles, Image as ImageIcon, ShoppingCart, Leaf, Smartphone, DollarSign, Heart, Trash2, Newspaper, AlertCircle } from 'lucide-react';
import { sanitizeInput, validateInput } from '../utils/securityUtils';
import { SearchRegion, SearchTimeframe, IWindow, ISpeechRecognition } from '../types';
import { toast } from './ToastNotifications';
import { REGIONS, TIMEFRAMES } from '../constants/searchConfig';
import { getAIService } from '../services/aiRegistry';
import { usePreferences } from '../contexts/PreferencesContext';
import { indexedDBService } from '../utils/storageUtils';
import { useAsset } from '../hooks/useAsset';
import { STORAGE_KEYS, ASSET_CONFIG } from '../constants/storageConfig';
import { UI_TIMING, ANIMATION_TIMING, ANIMATION_EASING } from '../constants/uiConfig';
import { getCategoryIconConfig } from '../constants/iconConfig';
import { detectSearchRegion } from '../constants/dateTimeConfig';
import { Z_INDEX } from '../constants/zIndex';
import { SPEECH_CONFIG } from '../constants/apiConfig';
import { STORAGE_CONFIG, ASSET_ID_PREFIX } from '../constants/appConfig';
import { DATE_FORMATS, formatDate } from '../constants/dateTimeConfig';
import { DISPLAY_LIMITS } from '../constants/displayConfig';

interface Props {
  onSearch: (niche: string, region: SearchRegion, timeframe: SearchTimeframe, deepMode: boolean, image?: string) => void;
  isLoading: boolean;
  initialNiche?: string;
  initialRegion?: SearchRegion;
  initialTimeframe?: SearchTimeframe;
  initialDeepMode?: boolean;
  initialImage?: string;
  savedNiches?: string[];
}

const HISTORY_KEY = STORAGE_KEYS.SEARCH_HISTORY;

const getCategoryIcon = (category: string) => {
  const config = getCategoryIconConfig(category);
  const IconComponent = config.icon;
  return <IconComponent className={`w-5 h-5 ${config.color}`} />;
};

// Flexy hates hardcoded region detection! Using modular detectSearchRegion from dateTimeConfig
const detectRegion = detectSearchRegion;

export const TrendSearch: React.FC<Props> = ({ 
  onSearch, 
  isLoading,
  initialNiche = '',
  initialRegion,
  initialTimeframe = '7d', // Default to 7 days for better news currency
  initialDeepMode = false,
  initialImage,
  savedNiches = []
}) => {
  const [input, setInput] = useState(initialNiche);
  // Auto-detect region if not provided
  const [region, setRegion] = useState<SearchRegion>(initialRegion || detectRegion());
  const [timeframe, setTimeframe] = useState<SearchTimeframe>(initialTimeframe);
  const [deepMode, setDeepMode] = useState(initialDeepMode);
  
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [focusedHistoryIndex, setFocusedHistoryIndex] = useState<number>(-1);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  
  const { language, uiText, provider } = usePreferences();
  
  const [loadingText, setLoadingText] = useState(uiText.scanning);
  const [isListening, setIsListening] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { url: previewUrl } = useAsset(selectedImage);
  const [currentDate, setCurrentDate] = useState('');
  const [allTickerTopics, setAllTickerTopics] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const historyItemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const historyContainerRef = useRef<HTMLDivElement>(null);
  
  // Sync state if props change (e.g. from engine restoration)
  useEffect(() => {
    if (initialNiche) setInput(initialNiche);
    if (initialRegion) setRegion(initialRegion);
    if (initialTimeframe) setTimeframe(initialTimeframe);
    if (initialDeepMode !== undefined) setDeepMode(initialDeepMode);
    if (initialImage) setSelectedImage(initialImage);
  }, [initialNiche, initialRegion, initialTimeframe, initialDeepMode, initialImage]);

  // Close history when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (historyContainerRef.current && !historyContainerRef.current.contains(event.target as Node)) {
        setIsHistoryVisible(false);
        setFocusedHistoryIndex(-1);
      }
    };

    if (isHistoryVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isHistoryVisible]);

  useEffect(() => {
    // Load History
    const saved = localStorage.getItem(HISTORY_KEY);
    let loadedHistory: string[] = [];
    if (saved) {
      try {
        loadedHistory = JSON.parse(saved);
        setRecentSearches(loadedHistory);
      } catch (e) {
        console.error("Failed to parse search history");
      }
    }
    
    // Set Date
    setCurrentDate(formatDate(new Date(), 'COMPACT'));

    // Initialize Ticker (Default Topics + Recent History + Saved Niches)
    const dynamicPool = uiText.tickerTopics || ["AI Trends", "Market Shifts"];
    // Prioritize recent searches and saved projects in the ticker to make it feel personalized
    const combinedTopics = [...new Set([...loadedHistory, ...savedNiches, ...dynamicPool])];
    setAllTickerTopics([...combinedTopics, ...combinedTopics]); // Duplicate for seamless marquee
    
    // Auto-focus input on mount
    if (!isLoading && !initialNiche && inputRef.current) {
      inputRef.current.focus();
    }
  }, [uiText, isLoading, initialNiche]);

  // Cycle loading text to show AI reasoning steps
  useEffect(() => {
    if (isLoading) {
      const texts = uiText.searchSteps || [uiText.scanning];
      let i = 0;
      setLoadingText(texts[0]);
      const interval = setInterval(() => {
        i = (i + 1) % texts.length;
        setLoadingText(texts[i]);
      }, UI_TIMING.LOADING_TEXT_ROTATION);
      return () => clearInterval(interval);
    } else {
      setLoadingText(uiText.scanning);
    }
  }, [isLoading, uiText]);

  const addToHistory = (term: string) => {
    const cleanTerm = term.trim();
    if (!cleanTerm) return;
    
    // Add to front, remove duplicates, limit to max history
    const updated = [cleanTerm, ...recentSearches.filter(s => s !== cleanTerm)].slice(0, DISPLAY_LIMITS.SEARCH_HISTORY_MAX);
    setRecentSearches(updated);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  };

  const clearHistory = () => {
    setRecentSearches([]);
    localStorage.removeItem(HISTORY_KEY);
    setFocusedHistoryIndex(-1);
  };

  const handleHistoryKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    const visibleItems = recentSearches.slice(0, DISPLAY_LIMITS.SEARCH_HISTORY_DROPDOWN);
    
    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        const nextIndex = currentIndex < visibleItems.length - 1 ? currentIndex + 1 : 0;
        setFocusedHistoryIndex(nextIndex);
        historyItemRefs.current[nextIndex]?.focus();
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        if (currentIndex === 0) {
          setFocusedHistoryIndex(-1);
          inputRef.current?.focus();
        } else {
          const prevIndex = currentIndex - 1;
          setFocusedHistoryIndex(prevIndex);
          historyItemRefs.current[prevIndex]?.focus();
        }
        break;
      }
      case 'Home': {
        e.preventDefault();
        setFocusedHistoryIndex(0);
        historyItemRefs.current[0]?.focus();
        break;
      }
      case 'End': {
        e.preventDefault();
        const lastIndex = visibleItems.length - 1;
        setFocusedHistoryIndex(lastIndex);
        historyItemRefs.current[lastIndex]?.focus();
        break;
      }
      case 'Escape': {
        e.preventDefault();
        setFocusedHistoryIndex(-1);
        setIsHistoryVisible(false);
        inputRef.current?.focus();
        break;
      }
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    const visibleItems = recentSearches.slice(0, DISPLAY_LIMITS.SEARCH_HISTORY_DROPDOWN);
    
    if (recentSearches.length > 0 && isHistoryVisible) {
      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          setFocusedHistoryIndex(0);
          historyItemRefs.current[0]?.focus();
          break;
        }
        case 'Escape': {
          setIsHistoryVisible(false);
          break;
        }
      }
    }
  };

  const handleSearchTrigger = (term: string, img?: string) => {
    // Allow empty term ONLY if image is present
    if (!term.trim() && !img) {
      setValidationError(uiText.validationEmptySearch || "Please enter a topic or upload an image.");
      inputRef.current?.focus();
      return;
    }

    if (term.trim()) {
      const validation = validateInput(term);
      if (!validation.isValid) {
        setValidationError(validation.error || uiText.invalidInput || "Invalid input");
        inputRef.current?.focus();
        return;
      }
    }
    
    setValidationError(null);
    setIsHistoryVisible(false);
    setFocusedHistoryIndex(-1);

    const cleanTerm = sanitizeInput(term);
    if (cleanTerm) addToHistory(cleanTerm);
    
    onSearch(cleanTerm, region, timeframe, deepMode, img);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearchTrigger(input, selectedImage || undefined);
  };

  const handleGlobalPulse = () => {
    const topic = uiText.globalPulseQuery || "Latest Breaking Business News";
    setInput(topic);
    handleSearchTrigger(topic, undefined);
  };

  const startListening = () => {
    const SpeechRecognition = (window as unknown as IWindow).webkitSpeechRecognition || (window as unknown as IWindow).SpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition() as ISpeechRecognition;
      recognition.lang = SPEECH_CONFIG.DEFAULT_LANG; 
      recognition.start();
      setIsListening(true);
      
      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setInput(text);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
    } else {
      toast.info(uiText.voiceSearchNotSupported || "Voice search is not supported in this browser. Try Chrome or Edge.");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > STORAGE_CONFIG.MAX_FILE_SIZE_BYTES) {
        toast.error((uiText.imageTooLarge || "Image too large (max {size}MB)").replace('{size}', String(ASSET_CONFIG.MAX_SIZE_MB)));
        return;
      }

      try {
        const assetId = `${ASSET_ID_PREFIX.SEARCH}${Date.now()}`;
        await indexedDBService.saveAsset(assetId, file);
        setSelectedImage(`asset://${assetId}`);
        toast.success(uiText.imageAttached || "Image attached");
      } catch (err) {
        console.error("Failed to save image asset", err);
        // Fallback to base64 if IDB fails for some reason
        const reader = new FileReader();
        reader.onloadend = () => {
          setSelectedImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className={`w-full max-w-5xl mx-auto text-center mt-8 md:mt-12 px-4`}>
      
      {/* Background Market Ticker (Subtle) */}
      {!isLoading && (
        <div className="w-full overflow-hidden opacity-30 hover:opacity-60 transition-opacity mb-8 border-y border-white/5 py-1.5 absolute top-20 left-0 right-0 pointer-events-none select-none">
           {allTickerTopics.length > 0 ? (
             <div className="flex animate-marquee whitespace-nowrap gap-12">
                {allTickerTopics.map((topic, i) => (
                   <span key={i} className="text-[10px] font-mono text-slate-400 flex items-center gap-2 uppercase tracking-wider">
                       <TrendingUp className="w-3 h-3 text-emerald-400" /> {topic}
                   </span>
                ))}
             </div>
           ) : (
             <div className="h-4 w-full bg-slate-900/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent animate-shimmer"></div>
             </div>
           )}
        </div>
      )}

      {/* Live Data Badge */}
       <div className={`inline-flex flex-wrap justify-center items-center gap-2 mb-6 animate-[fadeIn_${ANIMATION_TIMING.TREND_FADE}_${ANIMATION_EASING.DEFAULT}] relative ${Z_INDEX.CONTENT}`}>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)] backdrop-blur-sm">
           <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
           </span>
           <Globe className="w-3 h-3" />
           Live Intelligence
           <span className="w-px h-3 bg-emerald-500/30 mx-1"></span>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              {currentDate}
            </span>
        </div>
        
         <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/50 border border-slate-700 text-slate-300 text-[10px] font-bold uppercase tracking-wider">
           <Cpu className="w-3 h-3" />
           {uiText.modelDisplay?.[provider] || (provider === 'gemini' ? 'Gemini 3' : 'OpenAI GPT-4o')}
        </div>
      </div>

      <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 mb-6 leading-tight tracking-tight relative z-10">
        {uiText.heroTitle}
      </h2>
      <p className="text-slate-300 text-base md:text-lg mb-10 max-w-lg mx-auto leading-relaxed relative z-10">
        {uiText.heroDesc}
      </p>
      
      {/* Search Configuration */}
      <div className={`flex flex-col sm:flex-row justify-center items-center gap-3 mb-6 relative ${Z_INDEX.CONTENT}`}>
         {/* Region Selector */}
         <div className={`bg-slate-900/80 backdrop-blur-md border border-slate-800 p-1 rounded-xl flex gap-1 shadow-xl overflow-x-auto no-scrollbar relative ${Z_INDEX.CONTENT} shrink-0`} role="group" aria-label="Select Region">
            {REGIONS.map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setRegion(r)}
                aria-pressed={region === r}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  region === r 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {region === r && <MapPin className="w-3 h-3" />}
                {r}
              </button>
            ))}
         </div>

         {/* Timeframe Selector */}
         <div className={`bg-slate-900/80 backdrop-blur-md border border-slate-800 p-1 rounded-xl flex gap-1 shadow-xl overflow-x-auto no-scrollbar relative ${Z_INDEX.CONTENT} shrink-0`} role="group" aria-label="Select Timeframe">
            {TIMEFRAMES.map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTimeframe(t.value)}
                aria-pressed={timeframe === t.value}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  timeframe === t.value 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {timeframe === t.value && <Clock4 className="w-3 h-3" />}
                {uiText.timeframes?.[t.value] || t.label}
              </button>
            ))}
         </div>

         {/* Deep Mode Toggle */}
          <button 
            onClick={() => setDeepMode(!deepMode)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all shadow-xl ${
              deepMode 
              ? 'bg-indigo-600 border-indigo-500 text-white shadow-indigo-900/50' 
              : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white hover:border-slate-600'
            }`}
            title="Deep Research Mode: Uses Reasoning Model (Slower but detailed)"
          >
           {deepMode ? <BrainCircuit className="w-4 h-4 animate-pulse" /> : <Zap className="w-4 h-4" />}
           {deepMode ? "Deep Research" : "Fast Scan"}
         </button>
      </div>

      <form onSubmit={handleSubmit} className={`relative group mb-12 max-w-2xl mx-auto ${Z_INDEX.CONTENT}`}>
        <div className={`absolute -inset-0.5 bg-gradient-to-r ${validationError ? 'from-red-500 to-orange-500' : 'from-emerald-500 via-blue-500 to-purple-500'} rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-500`}></div>
        <div className={`relative flex items-center bg-slate-950 rounded-2xl border ${validationError ? 'border-red-500/50' : 'border-slate-800'} p-2 shadow-2xl`}>
          <Search className={`w-6 h-6 ml-3 shrink-0 ${validationError ? 'text-red-400' : 'text-slate-300'}`} aria-hidden="true" />
          
          {/* Attached Image Preview */}
          {previewUrl && (
            <div className="relative ml-2 w-10 h-10 shrink-0 group/img">
              <img src={previewUrl} alt="Context" className="w-full h-full object-cover rounded-lg border border-slate-700" />
              <button 
                type="button"
                onClick={clearImage}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/img:opacity-100 transition-opacity"
              >
                <X className="w-2 h-2" />
              </button>
            </div>
          )}

          <input
            ref={inputRef}
            type="text"
            role="combobox"
            className="flex-1 bg-transparent border-none outline-none text-white px-4 py-3 placeholder:text-slate-600 text-base md:text-lg w-full min-w-0"
            placeholder={selectedImage ? "Describe what to look for in this image..." : uiText.placeholder}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (validationError) setValidationError(null);
            }}
            onFocus={() => setIsHistoryVisible(true)}
            onKeyDown={handleInputKeyDown}
            disabled={isLoading}
            aria-label="Search topics"
            aria-expanded={isHistoryVisible && recentSearches.length > 0}
            aria-controls="search-history-list"
            aria-activedescendant={focusedHistoryIndex >= 0 ? `history-item-${focusedHistoryIndex}` : undefined}
          />

          {/* Clear Input Button */}
          {input && !isLoading && (
            <button
              type="button"
              onClick={() => {
                setInput('');
                inputRef.current?.focus();
              }}
              className="mr-2 p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full transition-all"
              title="Clear search"
              aria-label="Clear search input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          
          {/* Visual Search (Image Attachment) */}
          {!isLoading && !selectedImage && (
            <>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mr-2 p-2 hover:bg-slate-800 text-slate-300 hover:text-blue-400 rounded-full transition-all"
                title="Search with Image (Visual Intelligence)"
                aria-label="Upload Image"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageUpload} 
              />
            </>
          )}

          {/* Voice Input */}
          {!isLoading && (
            <button
              type="button"
              onClick={startListening}
              className={`mr-2 p-2 rounded-full transition-all ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'hover:bg-slate-800 text-slate-300 hover:text-white'}`}
              title="Voice Search"
              aria-label="Start Voice Search"
            >
              <Mic className="w-5 h-5" />
            </button>
          )}

          <button
            type="submit"
            disabled={isLoading || (!input.trim() && !selectedImage)}
            className={`font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0 whitespace-nowrap shadow-lg ${
              deepMode 
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/30'
              : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-emerald-900/20'
            }`}
            aria-label={isLoading ? "Analyzing..." : "Start Analysis"}
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : uiText.analyzeBtn}
          </button>
        </div>
      </form>

      {validationError && (
        <div className={`flex items-center justify-center gap-2 text-red-400 text-sm mb-6 animate-[fadeIn_${ANIMATION_TIMING.FADE_NORMAL}s_${ANIMATION_EASING.DEFAULT}]`} role="alert">
          <AlertCircle className="w-4 h-4" aria-hidden="true" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Discovery Grid Categories (Localized) */}
      {!isLoading && !selectedImage && uiText.searchCategories && (
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-10 relative ${Z_INDEX.CONTENT} animate-[fadeIn_${ANIMATION_TIMING.FADE_SLOW}s_${ANIMATION_EASING.DEFAULT}]`}>
          {/* Main "Headlines" Card */}
          <button 
             onClick={handleGlobalPulse}
             className="col-span-2 md:col-span-1 md:row-span-2 flex flex-col items-center justify-center p-6 bg-blue-900/20 border border-blue-500/30 hover:border-blue-400 rounded-xl transition-all group hover:bg-blue-900/30 shadow-lg shadow-blue-900/10"
             title="Scan latest global headlines instantly"
          >
             <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Newspaper className="w-6 h-6 text-blue-400" />
             </div>
             <span className="text-sm font-black text-white uppercase tracking-wider">{uiText.headlines || "Global Headlines"}</span>
             <span className="text-[10px] text-blue-300 mt-1 opacity-70">Real-time Pulse</span>
          </button>
          
          {/* Category Cards */}
          {uiText.searchCategories.slice(0, DISPLAY_LIMITS.CATEGORY_GRID_MAX).map((cat: string, i: number) => (
             <button
               key={i}
               onClick={() => {
                 const query = `Latest trends in ${cat}`;
                 setInput(query);
                 handleSearchTrigger(query, undefined);
               }}
               className="flex flex-col items-center justify-center p-4 bg-slate-900/50 border border-slate-800 hover:border-emerald-500/50 rounded-xl transition-all group hover:bg-slate-900 h-32"
             >
               <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform group-hover:bg-emerald-900/20">
                  {getCategoryIcon(cat)}
               </div>
                <span className="text-xs font-bold text-slate-300 group-hover:text-white uppercase tracking-wider text-center">{cat}</span>
             </button>
          ))}
        </div>
      )}

      {/* Recent Searches */}
      {!isLoading && !selectedImage && recentSearches.length > 0 && isHistoryVisible && (
        <div 
          ref={historyContainerRef}
          id="search-history-list"
          role="listbox"
          aria-label="Recent searches"
          className={`flex flex-col items-center gap-3 animate-[fadeIn_${ANIMATION_TIMING.FADE_NORMAL}s_${ANIMATION_EASING.DEFAULT}] border-t border-slate-900 pt-6 max-w-sm mx-auto relative ${Z_INDEX.CONTENT}`}
        >
           <div className="flex items-center gap-2 text-[10px] text-slate-600 uppercase font-bold tracking-widest w-full justify-between px-2">
              <span>{uiText.recent}</span>
              <button 
                onClick={clearHistory} 
                className="hover:text-red-400 transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-red-400/50 rounded px-1" 
                title={uiText.clearHistory} 
                aria-label="Clear history"
              >
                 <X className="w-3 h-3" /> {uiText.clear || "Clear"}
              </button>
           </div>
           <div className="flex flex-col gap-2 w-full">
             {recentSearches.slice(0, DISPLAY_LIMITS.SEARCH_HISTORY_DROPDOWN).map((term, idx) => (
               <button
                 key={idx}
                 ref={(el) => { historyItemRefs.current[idx] = el; }}
                 id={`history-item-${idx}`}
                 role="option"
                 aria-selected={focusedHistoryIndex === idx}
                 tabIndex={-1}
                 onClick={() => {
                   setInput(term);
                   handleSearchTrigger(term, undefined);
                 }}
                 onKeyDown={(e) => handleHistoryKeyDown(e, idx)}
                 className={`flex items-center justify-between px-4 py-2 bg-slate-900/50 text-slate-300 rounded-lg text-sm font-medium border transition-all group w-full text-left focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-slate-800 focus:text-white hover:bg-slate-800 hover:text-white hover:border-slate-700 ${
                   focusedHistoryIndex === idx ? 'bg-slate-800 text-white border-slate-700 ring-2 ring-emerald-500/30' : 'border-transparent'
                 }`}
               >
                 <div className="flex items-center gap-2">
                   <Clock className="w-3 h-3 text-slate-600 group-hover:text-emerald-500 transition-colors" />
                   {term}
                 </div>
                 <ArrowRight className={`w-3 h-3 transition-all -translate-x-2 ${focusedHistoryIndex === idx ? 'opacity-100 translate-x-0' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`} />
               </button>
             ))}
           </div>
              <div className="text-[10px] text-slate-600 flex items-center gap-1">
              <span className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300">↑</span>
              <span className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300">↓</span>
             <span>to navigate</span>
              <span className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 ml-1">Enter</span>
              <span>to select</span>
              <span className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 ml-1">Esc</span>
             <span>to close</span>
           </div>
         </div>
       )}
      
      {(isLoading) && (
        <div className={`mt-8 flex flex-col items-center animate-[fadeIn_${ANIMATION_TIMING.FADE_SLOW}s_${ANIMATION_EASING.EXIT}] relative ${Z_INDEX.CONTENT}`} role="status">
          <div className={`text-sm font-bold font-mono mb-3 flex items-center gap-2 px-4 py-1.5 rounded-full border ${
            deepMode 
            ? 'text-indigo-400 bg-indigo-950/30 border-indigo-500/20' 
            : 'text-emerald-400 bg-emerald-950/30 border-emerald-500/20'
          }`}>
            {deepMode ? <BrainCircuit className="w-3.5 h-3.5 animate-pulse" /> : <Zap className="w-3.5 h-3.5 animate-bounce" />}
            <span className="animate-pulse">{loadingText}</span>
          </div>
          <div className="w-64 h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className={`h-full w-1/3 animate-[shimmer_2s_infinite_linear] ${
              deepMode ? 'bg-indigo-500' : 'bg-emerald-500'
            }`}></div>
          </div>
          <div className="flex items-center gap-4 mt-3">
             <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
               <MapPin className="w-3 h-3" /> {region.toUpperCase()}
             </div>
             <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
               <Clock4 className="w-3 h-3" /> {uiText.timeframes?.[timeframe] || timeframe}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
