

import React, { useState, useMemo, useCallback } from 'react';
import { Blueprint, BusinessIdea, AIProvider, CompetitorAnalysis, ViabilityAudit, Language } from '../types';
import { getAIService } from '../services/aiRegistry';
import { supabaseService } from '../services/supabaseService';
import { toast } from './ToastNotifications'; 
import { Check, Copy, ShieldCheck, Loader2 } from 'lucide-react';

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
import { BlueprintLaunchpad } from './BlueprintLaunchpad';
import { BlueprintAuditModal } from './BlueprintAuditModal';
import { BusinessModelCanvas } from './BusinessModelCanvas';
import { BrandStudio } from './BrandStudio';
import { PresentationMode } from './PresentationMode'; // New Import

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
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showPresentation, setShowPresentation] = useState(false); // New State

  // Agent State
  const agents = blueprint.agents || [];
  const [isGeneratingAgents, setIsGeneratingAgents] = useState(false);

  // Audit State
  const [isAuditing, setIsAuditing] = useState(false);
  const [isPivoting, setIsPivoting] = useState(false);

  // Competitor Analysis State
  const [analyzingCompetitor, setAnalyzingCompetitor] = useState<string | null>(null);
  const [competitorData, setCompetitorData] = useState<CompetitorAnalysis | null>(null);

  // Derived Values
  const language = (localStorage.getItem('trendventures_lang') as Language) || 'id';
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

  const handleRunAudit = async () => {
    if (blueprint.viabilityAudit) {
      setShowAuditModal(true);
      return;
    }

    setIsAuditing(true);
    try {
      const aiService = getAIService(provider);
      const auditResult = await aiService.conductViabilityAudit(idea, blueprint, language);
      onUpdateBlueprint({ viabilityAudit: auditResult });
      setShowAuditModal(true);
      toast.success("Viability Audit Completed");
    } catch (e) {
      console.error(e);
      toast.error("Audit failed. Try again.");
    } finally {
      setIsAuditing(false);
    }
  };

  const handleApplyPivot = async (pivot: string) => {
    setIsPivoting(true);
    try {
      const aiService = getAIService(provider);
      const prompt = `Pivot Strategy: "${pivot}". 
      ACTION REQUIRED: Completely rewrite the Executive Summary, Revenue Streams, and Roadmap to reflect this new strategic direction. 
      Ensure the technical stack and marketing strategy align with this pivot.`;
      
      const { updates } = await aiService.sendBlueprintChat([], prompt, blueprint, language);
      
      if (updates) {
        onUpdateBlueprint(updates);
        toast.success(`Pivot Applied: ${pivot}`);
        setShowAuditModal(false);
      } else {
        toast.error("AI could not generate pivot updates.");
      }
    } catch (e) {
      console.error("Pivot failed", e);
      toast.error("Pivot execution failed. Please try again.");
    } finally {
      setIsPivoting(false);
    }
  };

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

  const handleUpdateRevenue = (newStreams: Blueprint['revenueStreams']) => {
    onUpdateBlueprint({ revenueStreams: newStreams });
    toast.success("Revenue projections updated");
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
      
      {/* Modals */}
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

      {showAuditModal && blueprint.viabilityAudit && (
        <BlueprintAuditModal 
          audit={blueprint.viabilityAudit}
          isOpen={showAuditModal}
          onClose={() => setShowAuditModal(false)}
          onApplyPivot={handleApplyPivot}
          isPivoting={isPivoting}
        />
      )}

      {showPresentation && (
        <PresentationMode 
          idea={idea}
          blueprint={blueprint}
          onClose={() => setShowPresentation(false)}
          uiText={uiText}
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
        onPresent={() => setShowPresentation(true)}
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
        <div className="lg:col-span-1 flex flex-col gap-4">
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
          
          {/* Audit Button */}
          <button 
            onClick={handleRunAudit}
            disabled={isAuditing}
            className="w-full bg-purple-900/20 border border-purple-500/30 hover:bg-purple-900/30 text-purple-300 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {isAuditing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            {isAuditing ? "Analyzing..." : "Run Viability Audit"}
          </button>
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

      {/* Brand Studio (NEW) */}
      <BrandStudio 
        idea={idea} 
        blueprint={blueprint} 
        brandIdentity={blueprint.brandIdentity}
        onUpdateBlueprint={onUpdateBlueprint}
      />

      {/* Launchpad (New Feature) */}
      <BlueprintLaunchpad 
        idea={idea} 
        blueprint={blueprint} 
        assets={blueprint.launchAssets}
        onUpdateBlueprint={onUpdateBlueprint}
        uiText={uiText}
      />

      {/* Business Model Canvas (NEW) */}
      <BusinessModelCanvas 
        idea={idea} 
        blueprint={blueprint} 
        bmc={blueprint.bmc}
        onUpdateBlueprint={onUpdateBlueprint}
        uiText={uiText}
      />

      {/* Agents Section */}
      <BlueprintAgents 
        agents={agents}
        isGenerating={isGeneratingAgents}
        onGenerate={handleGenerateAgents}
        onUpdateBlueprint={onUpdateBlueprint}
        uiText={uiText}
      />

      {/* Revenue Chart (Enhanced) */}
      <BlueprintRevenue 
        revenueStreams={blueprint.revenueStreams} 
        onUpdate={handleUpdateRevenue}
        uiText={uiText} 
      />

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