
import React, { useState, useMemo, useCallback } from 'react';
import { Blueprint, BusinessIdea, AIProvider, CompetitorAnalysis } from '../types';
import { getAIService } from '../services/aiRegistry';
import { supabaseService } from '../services/supabaseService';
import { toast } from './ToastNotifications'; 
import { Check, Copy } from 'lucide-react';

// Hooks
import { useVoiceSummary } from '../hooks/useVoiceSummary';
import { useBlueprintMedia } from '../hooks/useBlueprintMedia';

// Components
import { BlueprintChat } from './BlueprintChat';
import { LivePitchModal } from './LivePitchModal';
import { SwotAnalysis } from './SwotAnalysis';
import { LocationScoutModal } from './LocationScoutModal';
import { BlueprintHeader } from './BlueprintHeader';
import { BlueprintHero } from './BlueprintHero';
import { BlueprintVisuals } from './BlueprintVisuals';
import { BlueprintAgents } from './BlueprintAgents';
import { CompetitorAnalysisModal } from './CompetitorAnalysisModal';
import { BlueprintRoadmap } from './BlueprintRoadmap';
import { BlueprintRevenue } from './BlueprintRevenue';
import { SafeMarkdown } from './SafeMarkdown';

// New Atomic Components
import { BlueprintCompetitors } from './blueprint/BlueprintCompetitors';
import { BlueprintAffiliates } from './blueprint/BlueprintAffiliates';
import { BlueprintStrategies } from './blueprint/BlueprintStrategies';

interface Props {
  idea: BusinessIdea;
  blueprint: Blueprint;
  onBack: () => void;
  onSaveToLibrary: () => void;
  onUpdateBlueprint: (updates: Partial<Blueprint>) => void;
  isSaved: boolean;
  uiText: any;
  publishedUrl: string | null;
  provider: AIProvider;
}

// Optimization: Memoized Markdown Viewer to prevent re-parsing on every audio tick
const BlueprintMarkdownViewer = React.memo(({ content, affiliateMap, onAffiliateClick, uiText }: {
  content: string, 
  affiliateMap: Map<string, string>,
  onAffiliateClick: (id: string) => void,
  uiText: any
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyMarkdown = useCallback(() => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.info("Full guide copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }, [content]);

  // Handler for link clicks passed to SafeMarkdown
  const handleLinkClick = useCallback((href: string) => {
    if (affiliateMap.has(href)) {
      onAffiliateClick(affiliateMap.get(href)!);
    }
  }, [affiliateMap, onAffiliateClick]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-10 mb-20 print:border-none print:bg-white print:text-black">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h3 className="text-xl font-bold text-white">Full Implementation Guide</h3>
        <button 
          onClick={handleCopyMarkdown}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? uiText.copied : uiText.copy}
        </button>
      </div>
      <article className="prose prose-invert prose-emerald max-w-none print:prose-black">
        <SafeMarkdown 
           content={content}
           onLinkClick={handleLinkClick}
           components={{
             a: ({node, href, ...props}) => {
               // We override 'a' here just to add the specific styling, 
               // SafeMarkdown wrapper still enforces protocol safety in its own implementation 
               // via the onLinkClick or its internal logic if we didn't fully replace it.
               // However, SafeMarkdown's internal 'a' takes precedence for safety logic.
               // To allow styling + safety, we rely on SafeMarkdown's default 'a' renderer 
               // which accepts className. We don't need to override 'a' here unless we want 
               // completely custom rendering. SafeMarkdown adds 'text-blue-400' by default.
               // Let's rely on SafeMarkdown's styling but we can pass a className to the container 
               // or just let SafeMarkdown handle it. 
               // Actually, for this specific view, we want specific styling:
               return (
                 <a 
                   href={href} 
                   className="text-emerald-400 hover:text-emerald-300 font-bold" 
                   target="_blank"
                   rel="noopener noreferrer"
                   {...props} 
                 />
               );
             }
           }}
        />
      </article>
    </div>
  );
});

export const BlueprintView: React.FC<Props> = ({ idea, blueprint, onBack, onSaveToLibrary, onUpdateBlueprint, isSaved, uiText, publishedUrl, provider }) => {
  const [showPitchModal, setShowPitchModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showCompetitorModal, setShowCompetitorModal] = useState(false);

  // Agent State
  const agents = blueprint.agents || [];
  const [isGeneratingAgents, setIsGeneratingAgents] = useState(false);

  // Competitor Analysis State
  const [analyzingCompetitor, setAnalyzingCompetitor] = useState<string | null>(null);
  const [competitorData, setCompetitorData] = useState<CompetitorAnalysis | null>(null);

  // Derived Values
  const language = (localStorage.getItem('trendventures_lang') as 'id' | 'en') || 'id';
  const isGemini = provider === 'gemini';

  // --- Custom Hooks ---
  
  // 1. Audio Logic
  const { 
    play: playSummary, 
    stop: stopAudio,
    isPlaying: isAudioPlaying, 
    isLoading: isAudioLoading, 
    error: audioError 
  } = useVoiceSummary(provider, language);

  const handlePlaySummary = () => {
    if (isAudioPlaying) {
      stopAudio();
    } else {
      playSummary(blueprint.executiveSummary, uiText.audioError);
    }
  };

  // 2. Media Generation Logic (Logo & Video)
  const {
    generateLogo,
    generateVideo,
    isGeneratingLogo,
    isGeneratingVideo
  } = useBlueprintMedia(provider, language, onUpdateBlueprint);

  // --- Handlers ---

  const handleGenerateAgents = async () => {
    setIsGeneratingAgents(true);
    try {
      const aiService = getAIService(provider);
      const generatedAgents = await aiService.generateTeamOfAgents(blueprint, language);
      onUpdateBlueprint({ agents: generatedAgents });
      toast.success("AI Agents Generated Successfully");
    } catch (e) {
      console.error("Failed to generate agents", e);
      toast.error("Failed to generate agents. Please try again.");
    } finally {
      setIsGeneratingAgents(false);
    }
  };

  const handleAnalyzeCompetitor = async (compName: string) => {
    setAnalyzingCompetitor(compName);
    setShowCompetitorModal(true);
    setCompetitorData(null); 

    try {
      const aiService = getAIService(provider);
      const nicheContext = idea.type + " " + idea.description.slice(0, 50);
      const analysis = await aiService.analyzeCompetitor(compName, nicheContext, language);
      setCompetitorData(analysis);
    } catch (e) {
      console.error("Failed to analyze competitor", e);
      toast.error("Analysis failed. Try again.");
      setShowCompetitorModal(false);
    } finally {
      setAnalyzingCompetitor(null);
    }
  };

  const handleToggleTask = (taskName: string) => {
    const currentProgress = blueprint.roadmapProgress || {};
    const newStatus = !currentProgress[taskName];
    
    onUpdateBlueprint({
      roadmapProgress: {
        ...currentProgress,
        [taskName]: newStatus
      }
    });

    if (newStatus) {
      toast.success("Task completed!");
    }
  };

  // --- Strategic Data Integration Handlers ---

  const handleSaveLocationStrategy = (strategy: string) => {
    const currentStrategies = blueprint.marketingStrategy || [];
    onUpdateBlueprint({
      marketingStrategy: [...currentStrategies, strategy]
    });
  };

  const handleSaveCompetitorInsights = (newThreats: string[], newOpportunities: string[]) => {
    const currentSWOT = blueprint.swot || {
      strengths: [],
      weaknesses: [],
      opportunities: [],
      threats: []
    };

    onUpdateBlueprint({
      swot: {
        ...currentSWOT,
        // Append unique items
        threats: [...currentSWOT.threats, ...newThreats.filter(t => !currentSWOT.threats.includes(t))],
        opportunities: [...currentSWOT.opportunities, ...newOpportunities.filter(o => !currentSWOT.opportunities.includes(o))]
      }
    });
  };

  const handlePrint = () => window.print();

  const handleDownloadJSON = () => {
    const data = JSON.stringify({ idea, blueprint }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${idea.name.replace(/\s+/g, '_')}_Blueprint.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("JSON Exported");
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([blueprint.fullContentMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${idea.name.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Markdown Exported");
  };

  // Memoized Handler for Affiliate Click
  const handleAffiliateClick = useCallback((id: string) => {
    supabaseService.incrementAffiliateClick(id);
  }, []);

  const affiliateMap = useMemo(() => {
    const map = new Map<string, string>();
    if (blueprint.affiliateRecommendations) {
      blueprint.affiliateRecommendations.forEach(p => {
        map.set(p.affiliateUrl, p.id);
      });
    }
    return map;
  }, [blueprint.affiliateRecommendations]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 animate-[slideUp_0.4s_ease-out]">
      
      {showPitchModal && (
        <LivePitchModal 
          blueprint={blueprint} 
          idea={idea}
          onClose={() => setShowPitchModal(false)}
          uiText={uiText}
        />
      )}

      {showLocationModal && (
        <LocationScoutModal
          isOpen={showLocationModal}
          onClose={() => setShowLocationModal(false)}
          idea={idea}
          uiText={uiText}
          provider={provider}
          onSaveToBlueprint={handleSaveLocationStrategy}
        />
      )}

      <CompetitorAnalysisModal 
        isOpen={showCompetitorModal}
        onClose={() => setShowCompetitorModal(false)}
        analyzingCompetitor={analyzingCompetitor}
        competitorData={competitorData}
        uiText={uiText}
        onSaveToSWOT={handleSaveCompetitorInsights}
      />

      {/* Header Actions */}
      <BlueprintHeader 
        onBack={onBack}
        onSave={onSaveToLibrary}
        onExportJSON={handleDownloadJSON}
        onExportMD={handleDownloadMarkdown}
        onPrint={handlePrint}
        publishedUrl={publishedUrl}
        isSaved={isSaved}
        uiText={uiText}
      />

      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <BlueprintHero 
            idea={idea} 
            blueprint={blueprint} 
            uiText={uiText} 
            isGemini={isGemini}
            onPitch={() => setShowPitchModal(true)}
            onPlaySummary={handlePlaySummary}
            audioState={{ 
              isPlaying: isAudioPlaying, 
              isLoading: isAudioLoading, 
              error: audioError 
            }}
          />
        </div>

        {/* Visual Identity & Media Card */}
        <div className="lg:col-span-1">
          <BlueprintVisuals 
             blueprint={blueprint}
             ideaName={idea.name}
             uiText={uiText}
             provider={provider}
             isGeneratingLogo={isGeneratingLogo}
             isGeneratingVideo={isGeneratingVideo}
             onGenerateLogo={(style) => generateLogo(idea.name, blueprint.executiveSummary, style)}
             onGenerateVideo={() => generateVideo(idea.name, blueprint.executiveSummary)}
          />
        </div>
      </div>

      {/* Competitor Analysis Section */}
      <BlueprintCompetitors 
        competitors={idea.competitors || []}
        onAnalyze={handleAnalyzeCompetitor}
        onScoutLocation={() => setShowLocationModal(true)}
        uiText={uiText}
      />

      {/* Recommended Tools (Affiliate Injection) */}
      <BlueprintAffiliates 
        products={blueprint.affiliateRecommendations || []}
        onAffiliateClick={handleAffiliateClick}
      />

      {/* Strategic Details (Tech & Marketing) */}
      <BlueprintStrategies 
        technicalStack={blueprint.technicalStack} 
        marketingStrategy={blueprint.marketingStrategy}
        uiText={uiText}
      />

      {/* Agents Section */}
      <BlueprintAgents 
        agents={agents}
        isGenerating={isGeneratingAgents}
        onGenerate={handleGenerateAgents}
        uiText={uiText}
      />

      {/* Revenue Chart */}
      <BlueprintRevenue revenueStreams={blueprint.revenueStreams} uiText={uiText} />

      {/* SWOT Analysis */}
      {blueprint.swot && (
         <SwotAnalysis data={blueprint.swot} uiText={uiText} />
      )}

      {/* Roadmap */}
      <BlueprintRoadmap 
        roadmap={blueprint.roadmap} 
        progress={blueprint.roadmapProgress}
        onToggleTask={handleToggleTask}
        uiText={uiText} 
      />

      {/* Full Markdown Content (Memoized) */}
      <BlueprintMarkdownViewer 
        content={blueprint.fullContentMarkdown} 
        affiliateMap={affiliateMap}
        onAffiliateClick={handleAffiliateClick}
        uiText={uiText}
      />

      {/* Floating Chat Assistant */}
      <BlueprintChat 
        blueprint={blueprint} 
        language={language} 
        uiText={uiText} 
        onUpdateBlueprint={onUpdateBlueprint}
      />
    </div>
  );
};
