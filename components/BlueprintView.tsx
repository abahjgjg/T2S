import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Blueprint, BusinessIdea, CompetitorAnalysis } from '../types';
import { getAIService } from '../services/aiRegistry';
import { supabaseService } from '../services/supabaseService';
import { toast } from './ToastNotifications'; 
import { ShieldCheck, Loader2, TrendingUp, ArrowUp } from 'lucide-react';
import { useVoiceSummary } from '../hooks/useVoiceSummary';
import { useBlueprintMedia } from '../hooks/useBlueprintMedia';
import { usePreferences } from '../contexts/PreferencesContext';
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
import { BlueprintLaunchpad } from './BlueprintLaunchpad';
import { BlueprintAuditModal } from './BlueprintAuditModal';
import { BusinessModelCanvas } from './BusinessModelCanvas';
import { BrandStudio } from './BrandStudio';
import { CustomerPersonas } from './CustomerPersonas'; 
import { PresentationMode } from './PresentationMode'; 
import { BlueprintCompetitors } from './blueprint/BlueprintCompetitors';
import { BlueprintAffiliates } from './blueprint/BlueprintAffiliates';
import { BlueprintStrategies } from './blueprint/BlueprintStrategies';
import { BlueprintMarkdownViewer } from './blueprint/BlueprintMarkdownViewer';

interface Props {
  idea: BusinessIdea;
  blueprint: Blueprint;
  onBack: () => void;
  onSaveToLibrary: () => void;
  onUpdateBlueprint: (updates: Partial<Blueprint>) => void;
  onUpdateIdea: (updates: Partial<BusinessIdea>) => void;
  isSaved: boolean;
  publishedUrl: string | null;
}

export const BlueprintView: React.FC<Props> = ({ idea, blueprint, onBack, onSaveToLibrary, onUpdateBlueprint, onUpdateIdea, isSaved, publishedUrl }) => {
  const [showPitchModal, setShowPitchModal] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showCompetitorModal, setShowCompetitorModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showPresentation, setShowPresentation] = useState(false); 

  const agents = blueprint.agents || [];
  const [isGeneratingAgents, setIsGeneratingAgents] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isPivoting, setIsPivoting] = useState(false);
  const [analyzingCompetitor, setAnalyzingCompetitor] = useState<string | null>(null);
  const [competitorData, setCompetitorData] = useState<CompetitorAnalysis | null>(null);

  const { provider, language, uiText } = usePreferences();
  const isGemini = provider === 'gemini';

  const { 
    play: playSummary, 
    stop: stopAudio,
    isPlaying: isAudioPlaying, 
    isLoading: isAudioLoading, 
    error: audioError 
  } = useVoiceSummary(provider, language);

  const handlePlaySummary = useCallback(() => {
    if (isAudioPlaying) {
      stopAudio();
    } else {
      playSummary(blueprint.executiveSummary, uiText.audioError);
    }
  }, [isAudioPlaying, playSummary, stopAudio, blueprint.executiveSummary, uiText.audioError]);

  const {
    generateLogo,
    generateVideo,
    isGeneratingLogo,
    isGeneratingVideo
  } = useBlueprintMedia(provider, language, onUpdateBlueprint);

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

  const handleToggleTask = useCallback((taskName: string) => {
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
  }, [blueprint.roadmapProgress, onUpdateBlueprint]);

  const handleSaveLocationStrategy = useCallback((strategy: string) => {
    const currentStrategies = blueprint.marketingStrategy || [];
    onUpdateBlueprint({
      marketingStrategy: [...currentStrategies, strategy]
    });
  }, [blueprint.marketingStrategy, onUpdateBlueprint]);

  const handleSaveCompetitorInsights = useCallback((newThreats: string[], newOpportunities: string[]) => {
    const currentSWOT = blueprint.swot || {
      strengths: [],
      weaknesses: [],
      opportunities: [],
      threats: []
    };

    onUpdateBlueprint({
      swot: {
        ...currentSWOT,
        threats: [...currentSWOT.threats, ...newThreats.filter(t => !currentSWOT.threats.includes(t))],
        opportunities: [...currentSWOT.opportunities, ...newOpportunities.filter(o => !currentSWOT.opportunities.includes(o))]
      }
    });
  }, [blueprint.swot, onUpdateBlueprint]);

  const handleUpdateRevenue = useCallback((newStreams: Blueprint['revenueStreams']) => {
    onUpdateBlueprint({ revenueStreams: newStreams });
    toast.success("Revenue projections updated");
  }, [onUpdateBlueprint]);

  const handlePrint = useCallback(() => window.print(), []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDownloadJSON = useCallback(() => {
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
  }, [idea, blueprint]);

  const handleDownloadMarkdown = useCallback(() => {
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
  }, [blueprint.fullContentMarkdown, idea.name]);

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
      
      {/* Print-Only Cover Page */}
      <div className="hidden print:flex flex-col items-center justify-center h-screen text-center print:break-after-page">
         <div className="flex items-center gap-2 mb-8">
            <TrendingUp className="w-10 h-10 text-emerald-600" />
            <h1 className="text-3xl font-bold tracking-tighter text-slate-900">
              Trend<span className="text-emerald-600">Ventures</span> AI
            </h1>
         </div>
         <h1 className="text-6xl font-black text-slate-900 mb-4">{idea.name}</h1>
         <p className="text-2xl text-slate-600 mb-12">{idea.description}</p>
         <div className="text-sm text-slate-400 font-mono">
            Generated on {new Date().toLocaleDateString()}
         </div>
         <div className="mt-8 text-xs text-slate-400">
            Confidential Business Blueprint
         </div>
      </div>

      {showPitchModal && (
        <LivePitchModal 
          blueprint={blueprint} 
          idea={idea}
          onClose={() => setShowPitchModal(false)}
          onUpdateBlueprint={onUpdateBlueprint}
        />
      )}

      {showLocationModal && (
        <LocationScoutModal
          isOpen={showLocationModal}
          onClose={() => setShowLocationModal(false)}
          idea={idea}
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
        />
      )}

      <CompetitorAnalysisModal 
        isOpen={showCompetitorModal}
        onClose={() => setShowCompetitorModal(false)}
        analyzingCompetitor={analyzingCompetitor}
        competitorData={competitorData}
        onSaveToSWOT={handleSaveCompetitorInsights}
      />

      <div className="print:hidden">
        <BlueprintHeader 
          onBack={onBack}
          onSave={onSaveToLibrary}
          onExportJSON={handleDownloadJSON}
          onExportMD={handleDownloadMarkdown}
          onPrint={handlePrint}
          onPresent={() => setShowPresentation(true)}
          publishedUrl={publishedUrl}
          isSaved={isSaved}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 print:block print:space-y-8">
        <div className="lg:col-span-2 print:break-inside-avoid">
          <BlueprintHero 
            idea={idea} 
            blueprint={blueprint} 
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

        <div className="lg:col-span-1 flex flex-col gap-4 print:break-inside-avoid">
          <BlueprintVisuals 
             blueprint={blueprint}
             ideaName={idea.name}
             isGeneratingLogo={isGeneratingLogo}
             isGeneratingVideo={isGeneratingVideo}
             onGenerateLogo={(style) => generateLogo(idea.name, blueprint.executiveSummary, style)}
             onGenerateVideo={() => generateVideo(idea.name, blueprint.executiveSummary)}
          />
          <button 
            onClick={handleRunAudit}
            disabled={isAuditing}
            className="w-full bg-purple-900/20 border border-purple-500/30 hover:bg-purple-900/30 text-purple-300 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 print:hidden"
          >
            {isAuditing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            {isAuditing ? "Analyzing..." : "Run Viability Audit"}
          </button>
        </div>
      </div>

      <div className="print:break-inside-avoid">
        <BlueprintCompetitors 
          competitors={idea.competitors || []}
          onAnalyze={handleAnalyzeCompetitor}
          onScoutLocation={() => setShowLocationModal(true)}
        />
      </div>

      <div className="print:hidden">
        <BlueprintAffiliates 
          products={blueprint.affiliateRecommendations || []}
          onAffiliateClick={handleAffiliateClick}
        />
      </div>

      <div className="print:break-inside-avoid">
        <BlueprintStrategies 
          technicalStack={blueprint.technicalStack} 
          marketingStrategy={blueprint.marketingStrategy}
        />
      </div>

      <div className="print:break-inside-avoid">
        <BrandStudio 
          idea={idea} 
          blueprint={blueprint} 
          brandIdentity={blueprint.brandIdentity}
          onUpdateBlueprint={onUpdateBlueprint}
          onUpdateIdea={onUpdateIdea}
        />
      </div>

      <div className="print:break-inside-avoid">
        <CustomerPersonas 
          idea={idea}
          blueprint={blueprint}
          personas={blueprint.personas}
          onUpdateBlueprint={onUpdateBlueprint}
        />
      </div>

      <div className="print:break-inside-avoid">
        <BlueprintLaunchpad 
          idea={idea} 
          blueprint={blueprint} 
          assets={blueprint.launchAssets}
          onUpdateBlueprint={onUpdateBlueprint}
        />
      </div>

      <div className="print:break-inside-avoid">
        <BusinessModelCanvas 
          idea={idea} 
          blueprint={blueprint} 
          bmc={blueprint.bmc}
          onUpdateBlueprint={onUpdateBlueprint}
        />
      </div>

      <div className="print:break-inside-avoid">
        <BlueprintAgents 
          agents={agents}
          isGenerating={isGeneratingAgents}
          onGenerate={handleGenerateAgents}
          onUpdateBlueprint={onUpdateBlueprint}
        />
      </div>

      <div className="print:break-inside-avoid">
        <BlueprintRevenue 
          revenueStreams={blueprint.revenueStreams} 
          onUpdate={handleUpdateRevenue}
        />
      </div>

      {blueprint.swot && (
         <div className="print:break-inside-avoid">
           <SwotAnalysis data={blueprint.swot} />
         </div>
      )}

      <div className="print:break-inside-avoid">
        <BlueprintRoadmap 
          roadmap={blueprint.roadmap} 
          progress={blueprint.roadmapProgress}
          onToggleTask={handleToggleTask}
        />
      </div>

      <div className="print:break-before-page">
        <BlueprintMarkdownViewer 
          content={blueprint.fullContentMarkdown} 
          affiliateMap={affiliateMap}
          onAffiliateClick={handleAffiliateClick}
        />
      </div>

      <BlueprintChat 
        blueprint={blueprint} 
        onUpdateBlueprint={onUpdateBlueprint}
      />

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 left-8 p-3 bg-emerald-600/80 hover:bg-emerald-500 text-white rounded-full shadow-lg transition-all transform z-[45] backdrop-blur-sm border border-emerald-400/20 group print:hidden ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        aria-label="Back to Top"
      >
        <ArrowUp className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
      </button>
    </div>
  );
};