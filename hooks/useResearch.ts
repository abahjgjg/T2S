
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { AppState, Trend, BusinessIdea, Blueprint, Language, AIService, SearchRegion, SearchTimeframe } from '../types';
import { supabaseService } from '../services/supabaseService';
import { indexedDBService } from '../utils/storageUtils';
import { useTrendEngine } from './useTrendEngine';
import { useIdeaEngine } from './useIdeaEngine';
import { useBlueprintEngine } from './useBlueprintEngine';
import { useResearchPersistence } from './useResearchPersistence';
import { STORAGE_KEYS } from '../constants/storageConfig';
import { DEFAULT_SEARCH_CONFIG, STANDARD_SEARCH_CONFIG } from '../constants/searchConfig';

export const useResearch = (aiService: AIService, language: Language, userId?: string) => {
  // --- Engines ---
  const trendEngine = useTrendEngine(aiService, language);
  const ideaEngine = useIdeaEngine(aiService, language);
  const blueprintEngine = useBlueprintEngine(aiService, language, userId);

  // --- Coordination State ---
  const [appState, setAppState] = useState<AppState>('IDLE');
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const [isRestoring, setIsRestoring] = useState(true);

  const persistenceState = useMemo(() => ({
    appState,
    niche: trendEngine.niche,
    region: trendEngine.region,
    timeframe: trendEngine.timeframe,
    deepMode: trendEngine.deepMode,
    image: trendEngine.image,
    trends: trendEngine.trends,
    ideas: ideaEngine.ideas,
    selectedIdea: blueprintEngine.selectedIdea,
    blueprint: blueprintEngine.blueprint
  }), [
    appState, 
    trendEngine.niche, 
    trendEngine.region,
    trendEngine.timeframe,
    trendEngine.deepMode,
    trendEngine.image,
    trendEngine.trends, 
    ideaEngine.ideas, 
    blueprintEngine.selectedIdea, 
    blueprintEngine.blueprint
  ]);

  // --- Persistence ---
  useResearchPersistence(
    persistenceState,
    isRestoring,
    (parsed) => {
      setAppState(parsed.appState);
      if (parsed.niche) {
        trendEngine.setSearchContext(
          parsed.niche,
          parsed.region || DEFAULT_SEARCH_CONFIG.REGION,
          parsed.timeframe || DEFAULT_SEARCH_CONFIG.TIMEFRAME,
          parsed.deepMode ?? DEFAULT_SEARCH_CONFIG.DEEP_MODE,
          parsed.image
        );
      }
      if (parsed.trends) trendEngine.setTrends(parsed.trends);
      if (parsed.ideas) ideaEngine.setIdeas(parsed.ideas);
      if (parsed.selectedIdea) blueprintEngine.setSelectedIdea(parsed.selectedIdea);
      if (parsed.blueprint) blueprintEngine.setBlueprint(parsed.blueprint);
    },
    setIsRestoring
  );

  // Sync Engine Errors to Main UI
  useEffect(() => {
    const errors: string[] = [];
    if (trendEngine.error) errors.push((trendEngine.error as any).message || "Market research failed.");
    if (ideaEngine.error) errors.push((ideaEngine.error as any).message || "Idea generation failed.");
    if (blueprintEngine.error) errors.push((blueprintEngine.error as any).message || "Blueprint generation failed.");
    
    // Set the most recent error, or clear if none
    if (errors.length > 0) {
      setError(errors[0]);
    }
  }, [trendEngine.error, ideaEngine.error, blueprintEngine.error]);

  // --- Actions ---

  const executeFreshAIResearch = useCallback(async (searchTerm: string, region: SearchRegion = DEFAULT_SEARCH_CONFIG.REGION, timeframe: SearchTimeframe = DEFAULT_SEARCH_CONFIG.TIMEFRAME, deepMode: boolean = DEFAULT_SEARCH_CONFIG.DEEP_MODE, image?: string) => {
    setAppState('RESEARCHING');
    setIsFromCache(false);
    setError(null);
    
    ideaEngine.clearIdeas();
    blueprintEngine.clearBlueprint();

    try {
      await trendEngine.fetchTrends(searchTerm, region, timeframe, deepMode, image);
      setAppState('ANALYZING');
    } catch (e: any) {
      console.error(e);
      setError(e.message || "An unexpected error occurred during research.");
      setAppState('IDLE');
    }
  }, [trendEngine, ideaEngine, blueprintEngine]);

  const generateIdeasFromTrends = useCallback(async (selectedTrends: Trend[]) => {
    if (selectedTrends.length === 0) {
      setError("Please select at least one trend.");
      return;
    }
    setError(null);
    // Error handling is managed by useEffect listener on engine.error
    await ideaEngine.generateIdeas(trendEngine.niche, selectedTrends);
  }, [ideaEngine, trendEngine.niche]);

  const executeSearchSequence = useCallback(async (searchTerm: string, region: SearchRegion = DEFAULT_SEARCH_CONFIG.REGION, timeframe: SearchTimeframe = DEFAULT_SEARCH_CONFIG.TIMEFRAME, deepMode: boolean = DEFAULT_SEARCH_CONFIG.DEEP_MODE, image?: string) => {
    try {
      // Check Cache (Only if no image, as image search is too specific)
      const isStandardSearch = region === STANDARD_SEARCH_CONFIG.REGION && timeframe === STANDARD_SEARCH_CONFIG.TIMEFRAME && !deepMode && !image;
      const cachedIdeas = isStandardSearch ? await supabaseService.findBlueprintsByNiche(searchTerm) : [];

      if (cachedIdeas.length > 0) {
        trendEngine.setSearchContext(searchTerm, region, timeframe, deepMode, image);
        trendEngine.setTrends([{
          title: "Community Data",
          description: `Found ${cachedIdeas.length} existing business blueprints for '${searchTerm}'.`,
          relevanceScore: 100,
          triggerEvent: "Community Database Match",
          sources: []
        }]);
        ideaEngine.setIdeas(cachedIdeas);
        setIsFromCache(true);
        setAppState('ANALYZING');
      } else {
        await executeFreshAIResearch(searchTerm, region, timeframe, deepMode, image);
      }
    } catch (e: any) {
      console.error("Cache check failed", e);
      await executeFreshAIResearch(searchTerm, region, timeframe, deepMode, image);
    }
  }, [executeFreshAIResearch, trendEngine, ideaEngine]);

  const handleSelectIdea = useCallback(async (idea: BusinessIdea) => {
    setError(null);
    setAppState('BLUEPRINTING');

    try {
      const publishedId = await blueprintEngine.createBlueprint(idea, trendEngine.niche);
      setAppState('VIEWING');
      return publishedId;
    } catch (e: any) {
      // Error is also caught in useEffect, but we handle state transition here
      setAppState('ANALYZING');
      return null;
    }
  }, [blueprintEngine, trendEngine.niche]);

  const handleBackToIdeas = useCallback(() => {
    blueprintEngine.clearBlueprint();
    setError(null);
    if (ideaEngine.ideas.length > 0) {
      setAppState('ANALYZING');
    } else {
      setAppState('IDLE');
    }
  }, [blueprintEngine, ideaEngine.ideas.length]);

  const resetResearch = useCallback(() => {
    setAppState('IDLE');
    trendEngine.clearTrends();
    ideaEngine.clearIdeas();
    blueprintEngine.clearBlueprint();
    setError(null);
    setIsFromCache(false);
    indexedDBService.removeItem(STORAGE_KEYS.RESEARCH_STATE);
  }, [trendEngine, ideaEngine, blueprintEngine]);

  const loadProject = useCallback((project: { niche: string, idea: BusinessIdea, blueprint: Blueprint }) => {
    trendEngine.setSearchContext(project.niche, DEFAULT_SEARCH_CONFIG.REGION, DEFAULT_SEARCH_CONFIG.TIMEFRAME, DEFAULT_SEARCH_CONFIG.DEEP_MODE, undefined);
    trendEngine.setTrends([]);
    ideaEngine.setIdeas([]);
    blueprintEngine.setSelectedIdea(project.idea);
    blueprintEngine.setBlueprint(project.blueprint);
    setAppState('VIEWING');
  }, [trendEngine, ideaEngine, blueprintEngine]);

  const state = useMemo(() => ({
    appState,
    niche: trendEngine.niche,
    region: trendEngine.region,
    timeframe: trendEngine.timeframe,
    deepMode: trendEngine.deepMode,
    image: trendEngine.image,
    trends: trendEngine.trends,
    ideas: ideaEngine.ideas,
    selectedIdea: blueprintEngine.selectedIdea,
    blueprint: blueprintEngine.blueprint,
    error,
    isFromCache,
    currentBlueprintId: blueprintEngine.currentBlueprintId,
    isGeneratingIdeas: ideaEngine.isGeneratingIdeas,
    isGeneratingBlueprint: blueprintEngine.isGeneratingBlueprint,
    isRestoring
  }), [
    appState, trendEngine.niche, trendEngine.region, trendEngine.timeframe,
    trendEngine.deepMode, trendEngine.image, trendEngine.trends, ideaEngine.ideas,
    blueprintEngine.selectedIdea, blueprintEngine.blueprint, error,
    isFromCache, blueprintEngine.currentBlueprintId, ideaEngine.isGeneratingIdeas,
    blueprintEngine.isGeneratingBlueprint, isRestoring
  ]);

  const setters = useMemo(() => ({
    setAppState,
    setNiche: trendEngine.setNiche,
    setTrends: trendEngine.setTrends,
    setIdeas: ideaEngine.setIdeas,
    setSelectedIdea: blueprintEngine.setSelectedIdea,
    setBlueprint: blueprintEngine.setBlueprint,
    setError,
    setCurrentBlueprintId: blueprintEngine.setCurrentBlueprintId
  }), [
    trendEngine.setNiche, trendEngine.setTrends, ideaEngine.setIdeas,
    blueprintEngine.setSelectedIdea, blueprintEngine.setBlueprint,
    blueprintEngine.setCurrentBlueprintId
  ]);

  const actions = useMemo(() => ({
    executeSearchSequence,
    executeFreshAIResearch,
    generateIdeasFromTrends,
    handleSelectIdea,
    updateBlueprint: blueprintEngine.updateBlueprint,
    updateIdea: blueprintEngine.updateIdea,
    handleBackToIdeas,
    resetResearch,
    loadProject,
    dismissError: () => setError(null),
    updateTrend: trendEngine.updateTrend,
    analyzeTrendDeepDive: trendEngine.analyzeTrendDeepDive
  }), [
    executeSearchSequence, executeFreshAIResearch, generateIdeasFromTrends,
    handleSelectIdea, blueprintEngine.updateBlueprint, blueprintEngine.updateIdea,
    handleBackToIdeas, resetResearch, loadProject, trendEngine.updateTrend,
    trendEngine.analyzeTrendDeepDive
  ]);

  return useMemo(() => ({ state, setters, actions }), [state, setters, actions]);
};
