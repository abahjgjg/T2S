
import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { Trend, BusinessIdea } from '../types';
import { TrendingUp, BarChart3, Newspaper, Download, Headphones, StopCircle, Loader2, Sparkles } from 'lucide-react';
// Lazy load heavy components to reduce initial bundle size
const TrendAnalysis = lazy(() => import('./TrendAnalysis').then(m => ({ default: m.TrendAnalysis })));
const ResearchChat = lazy(() => import('./ResearchChat').then(m => ({ default: m.ResearchChat })));
const NewsWire = lazy(() => import('./NewsWire').then(m => ({ default: m.NewsWire })));
const BusinessOpportunities = lazy(() => import('./BusinessOpportunities').then(m => ({ default: m.BusinessOpportunities })));
import { useVoiceSummary } from '../hooks/useVoiceSummary';
import { usePreferences } from '../contexts/PreferencesContext';
import { Z_INDEX } from '../constants/zIndex';
import { ANIMATION_CLASSES } from '../constants/animationConfig';

interface Props {
  niche: string;
  trends: Trend[];
  ideas: BusinessIdea[];
  onSelectIdea: (_idea: BusinessIdea) => void;
  onGenerateIdeas: (selectedTrends: Trend[]) => void;
  isGeneratingBlueprint: boolean;
  isGeneratingIdeas: boolean;
  onAnalyzeTrendDeepDive: (index: number) => Promise<void>;
}

export const IdeaSelection: React.FC<Props> = ({ 
  niche, 
  trends, 
  ideas, 
  onSelectIdea, 
  onGenerateIdeas,
  isGeneratingBlueprint, 
  isGeneratingIdeas,
  onAnalyzeTrendDeepDive
}) => {
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'trends' | 'news'>('trends');
  
  // Selection State
  const [selectedTrendIndices, setSelectedTrendIndices] = useState<Set<number>>(new Set());

  // Deep Dive State
  const [expandedTrendIndex, setExpandedTrendIndex] = useState<number | null>(null);
  const [isLoadingDeepDive, setIsLoadingDeepDive] = useState(false);
  
  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatTriggerMessage, setChatTriggerMessage] = useState<string | null>(null);

  // Use Context
  const { provider, language, uiText } = usePreferences();

  // Audio Hook
  const { play: playBriefing, stop: stopBriefing, isPlaying: isBriefingPlaying, isLoading: isBriefingLoading } = useVoiceSummary(provider, language);

  // Initialize selection when trends load
  useEffect(() => {
    if (trends.length > 0 && selectedTrendIndices.size === 0 && ideas.length === 0) {
      setSelectedTrendIndices(new Set(trends.map((_, i) => i)));
    }
  }, [trends]);

  // Loading Steps
  useEffect(() => {
    if (isGeneratingBlueprint) {
      const interval = setInterval(() => {
        setLoadingStepIndex((prev) => (prev + 1) % uiText.loadingSteps.length);
      }, 3500); 
      return () => clearInterval(interval);
    } else {
      setLoadingStepIndex(0);
    }
  }, [isGeneratingBlueprint, uiText.loadingSteps.length]);

  const toggleTrendSelection = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const newSet = new Set(selectedTrendIndices);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setSelectedTrendIndices(newSet);
  };

  const handleDeepDive = async (trend: Trend, index: number) => {
    if (expandedTrendIndex === index) {
      setExpandedTrendIndex(null);
      return;
    }

    setExpandedTrendIndex(index);
    
    if (trend.deepDive) {
      return;
    }

    setIsLoadingDeepDive(true);

    try {
      await onAnalyzeTrendDeepDive(index);
    } catch (e) {
      console.error("Deep dive trigger failed", e);
    } finally {
      setIsLoadingDeepDive(false);
    }
  };

  const handleDeepDiveQuestion = (question: string) => {
    setExpandedTrendIndex(null);
    setIsChatOpen(true);
    setChatTriggerMessage(question);
  };

  const handlePlayBriefing = () => {
    if (isBriefingPlaying) {
      stopBriefing();
      return;
    }

    let script = "";
    if (language === 'id') {
      script = `Laporan Intelijen Pasar untuk topik: ${niche}. Berdasarkan analisis real-time, kami mendeteksi ${trends.length} sinyal pasar utama. `;
      trends.forEach((t, i) => {
        script += `Tren nomor ${i + 1}: ${t.title}. ${t.description}. `;
      });
    } else {
      script = `Market Intelligence Briefing for: ${niche}. Based on real-time analysis, we have detected ${trends.length} key market signals. `;
      trends.forEach((t, i) => {
        script += `Trend number ${i + 1}: ${t.title}. ${t.description}. `;
      });
    }

    playBriefing(script, "Failed to play briefing.");
  };

  const handleExportReport = () => {
    const date = new Date().toLocaleDateString();
    let md = `# Market Research Report: ${niche}\nDate: ${date}\n\n`;
    
    md += `## Market Trends\n\n`;
    trends.forEach(t => {
      md += `### ${t.title} (${t.relevanceScore}% Relevance)\n`;
      md += `**Trigger:** ${t.triggerEvent}\n`;
      md += `${t.description}\n`;
      if(t.sources && t.sources.length) {
        md += `**Sources:**\n${t.sources.map(s => `- [${s.title}](${s.url})`).join('\n')}\n`;
      }
      md += `\n---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Market_Report_${niche.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const allNewsSources = useMemo(() => {
    const map = new Map<string, { title: string; url: string }>();
    trends.forEach(t => {
      if (t.sources) {
        t.sources.forEach(s => map.set(s.url, s));
      }
    });
    return Array.from(map.values());
  }, [trends]);

  const handleGenerateClick = () => {
    const selected = trends.filter((_, i) => selectedTrendIndices.has(i));
    onGenerateIdeas(selected);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-12 animate-[fadeIn_0.5s_ease-out]">
      
      {/* Research Chat Integration */}
      {trends.length > 0 && (
         <div className="relative">
            {!isChatOpen && (
              <button 
                onClick={() => setIsChatOpen(true)}
                 className={`fixed ${Z_INDEX.OVERLAY} bottom-6 left-6 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg hover:scale-105 transition-all flex items-center gap-2 border border-indigo-500/50 print:hidden ${ANIMATION_CLASSES.fadeIn.slow}`}
                aria-label="Ask AI Analyst"
              >
                <Sparkles className="w-5 h-5" />
                <span className="font-bold text-sm">Ask AI Analyst</span>
              </button>
            )}

            <Suspense fallback={null}>
              <ResearchChat
                niche={niche}
                trends={trends}
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                externalMessage={chatTriggerMessage}
                onClearExternalMessage={() => setChatTriggerMessage(null)}
              />
            </Suspense>
         </div>
      )}

      {/* Trends Section */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
           <div className="flex flex-col">
             <h3 className="text-xl font-bold text-slate-300 flex items-center gap-2">
               <TrendingUp className="text-emerald-400" />
               <span>{uiText.marketIntel}: {niche}</span>
             </h3>
             {ideas.length === 0 && (
               <p className="text-xs text-slate-500 mt-1">
                 Select the trends relevant to your business goals below.
               </p>
             )}
           </div>
           
           <div className="flex gap-2 items-center flex-wrap">
             <button
               onClick={handlePlayBriefing}
               disabled={isBriefingLoading}
               className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all border ${
                 isBriefingPlaying
                 ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                 : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:border-emerald-500/50'
               }`}
             >
               {isBriefingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : isBriefingPlaying ? <StopCircle className="w-4 h-4" /> : <Headphones className="w-4 h-4" />}
               <span className="hidden sm:inline">{isBriefingPlaying ? 'Stop Briefing' : 'Audio Briefing'}</span>
             </button>

             <div className="w-px h-6 bg-slate-700 mx-1 hidden sm:block"></div>

             <button
               onClick={() => setActiveTab('trends')}
               className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'trends' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
             >
               <BarChart3 className="w-4 h-4" /> {uiText.trendAnalysis || "Analysis"}
             </button>
             <button
               onClick={() => setActiveTab('news')}
               className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'news' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
             >
               <Newspaper className="w-4 h-4" /> News Wire <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px]">{allNewsSources.length}</span>
             </button>
              <button
                onClick={handleExportReport}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-emerald-400 rounded-lg border border-slate-700 transition-colors ml-2"
                aria-label="Export report"
              >
                <Download className="w-4 h-4" />
              </button>
           </div>
        </div>

        {activeTab === 'trends' ? (
          <Suspense fallback={
            <div className="py-12 flex justify-center">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
          }>
            <TrendAnalysis
              trends={trends}
              selectedTrendIndices={selectedTrendIndices}
              expandedTrendIndex={expandedTrendIndex}
              isLoadingDeepDive={isLoadingDeepDive}
              ideasLength={ideas.length}
              onToggleSelection={toggleTrendSelection}
              onToggleExpand={handleDeepDive}
              onAskQuestion={handleDeepDiveQuestion}
            />
          </Suspense>
        ) : (
          <Suspense fallback={
            <div className="py-12 flex justify-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          }>
            <NewsWire
              sources={allNewsSources}
              provider={provider}
            />
          </Suspense>
        )}
      </div>

      {/* Ideas Section */}
      <Suspense fallback={
        <div className="py-12 flex justify-center">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        </div>
      }>
        <BusinessOpportunities 
          ideas={ideas}
          isGeneratingIdeas={isGeneratingIdeas}
          isGeneratingBlueprint={isGeneratingBlueprint}
          loadingStepIndex={loadingStepIndex}
          hasSelection={selectedTrendIndices.size > 0}
          onGenerate={handleGenerateClick}
          onSelectIdea={onSelectIdea}
        />
      </Suspense>
    </div>
  );
};
