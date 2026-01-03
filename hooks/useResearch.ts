
import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, Trend, BusinessIdea, Blueprint, Language, AIService, SearchRegion, SearchTimeframe } from '../types';
import { supabaseService } from '../services/supabaseService';
import { indexedDBService } from '../utils/storageUtils';
import { useTrendEngine } from './useTrendEngine';
import { useIdeaEngine } from './useIdeaEngine';
import { useBlueprintEngine } from './useBlueprintEngine';

const STORAGE_KEY = 'trendventures_state_v1';
const SAVE_DELAY_MS = 1000;

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
  
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync Engine Errors to Main UI
  useEffect(() => {
    if (ideaEngine.error) setError(ideaEngine.error.message || "Idea generation failed.");
    if (blueprintEngine.error) setError(blueprintEngine.error.message || "Blueprint generation failed.");
  }, [ideaEngine.error, blueprintEngine.error]);

  // --- Persistence: Load on Mount (Async) ---
  useEffect(() => {
    const hydrate = async () => {
      try {
        let parsed = await indexedDBService.getItem<any>(STORAGE_KEY);
        
        // Migration Fallback
        if (!parsed) {
          const localData = localStorage.getItem(STORAGE_KEY);
          if (localData) {
            parsed = JSON.parse(localData);
            await indexedDBService.setItem(STORAGE_KEY, parsed);
            localStorage.removeItem(STORAGE_KEY);
          }
        }

        if (parsed && parsed.appState) {
          setAppState(parsed.appState);
          
          if (parsed.niche) {
            trendEngine.setSearchContext(
              parsed.niche, 
              parsed.region || 'Global', 
              parsed.timeframe || '30d', 
              parsed.deepMode || false
            );
          }
          if (parsed.trends) trendEngine.setTrends(parsed.trends);
          if (parsed.ideas) ideaEngine.setIdeas(parsed.ideas);
          if (parsed.selectedIdea) blueprintEngine.setSelectedIdea(parsed.selectedIdea);
          if (parsed.blueprint) blueprintEngine.setBlueprint(parsed.blueprint);
        }
      } catch (e) {
        console.warn("State restoration failed", e);
      } finally {
        setIsRestoring(false);
      }
    };

    hydrate();
  }, []);

  // --- Persistence: Save on Change (Async) ---
  useEffect(() => {
    if (isRestoring) return;
    if (appState === 'IDLE' || appState === 'VIEWING_PUBLIC' || appState === 'DIRECTORY' || appState === 'ADMIN' || appState === 'DASHBOARD') {
      return;
    }

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      const stateToSave = {
        appState,
        niche: trendEngine.niche,
        region: trendEngine.region,
        timeframe: trendEngine.timeframe,
        deepMode: trendEngine.deepMode,
        trends: trendEngine.trends,
        ideas: ideaEngine.ideas,
        selectedIdea: blueprintEngine.selectedIdea,
        blueprint: blueprintEngine.blueprint
      };
      
      await indexedDBService.setItem(STORAGE_KEY, stateToSave);
      
    }, SAVE_DELAY_MS);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [
    isRestoring,
    appState, 
    trendEngine.niche, 
    trendEngine.region,
    trendEngine.timeframe,
    trendEngine.deepMode,
    trendEngine.trends, 
    ideaEngine.ideas, 
    blueprintEngine.selectedIdea, 
    blueprintEngine.blueprint
  ]);

  // --- Actions ---

  const executeFreshAIResearch = async (searchTerm: string, region: SearchRegion = 'Global', timeframe: SearchTimeframe = '30d', deepMode: boolean = false) => {
    setAppState('RESEARCHING');
    setIsFromCache(false);
    setError(null);
    
    ideaEngine.clearIdeas();
    blueprintEngine.clearBlueprint();

    try {
      await trendEngine.fetchTrends(searchTerm, region, timeframe, deepMode);
      setAppState('ANALYZING');
    } catch (e: any) {
      console.error(e);
      setError(e.message || "An unexpected error occurred during research.");
      setAppState('IDLE');
    }
  };

  const generateIdeasFromTrends = async (selectedTrends: Trend[]) => {
    if (selectedTrends.length === 0) {
      setError("Please select at least one trend.");
      return;
    }
    setError(null);
    // Error handling is managed by useEffect listener on engine.error
    await ideaEngine.generateIdeas(trendEngine.niche, selectedTrends);
  };

  const executeSearchSequence = useCallback(async (searchTerm: string, region: SearchRegion = 'Global', timeframe: SearchTimeframe = '30d', deepMode: boolean = false) => {
    try {
      // Check Cache
      const isStandardSearch = region === 'Global' && timeframe === '30d' && !deepMode;
      const cachedIdeas = isStandardSearch ? await supabaseService.findBlueprintsByNiche(searchTerm) : [];

      if (cachedIdeas.length > 0) {
        trendEngine.setSearchContext(searchTerm, region, timeframe, deepMode);
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
        await executeFreshAIResearch(searchTerm, region, timeframe, deepMode);
      }
    } catch (e: any) {
      console.error("Cache check failed", e);
      await executeFreshAIResearch(searchTerm, region, timeframe, deepMode);
    }
  }, [language]); 

  const handleSelectIdea = async (idea: BusinessIdea) => {
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
  };

  const handleBackToIdeas = () => {
    blueprintEngine.clearBlueprint();
    setError(null);
    if (ideaEngine.ideas.length > 0) {
      setAppState('ANALYZING');
    } else {
      setAppState('IDLE');
    }
  };

  const resetResearch = () => {
    setAppState('IDLE');
    trendEngine.clearTrends();
    ideaEngine.clearIdeas();
    blueprintEngine.clearBlueprint();
    setError(null);
    setIsFromCache(false);
    indexedDBService.removeItem(STORAGE_KEY);
  };

  const loadProject = (project: { niche: string, idea: BusinessIdea, blueprint: Blueprint }) => {
    trendEngine.setSearchContext(project.niche, 'Global', '30d', false);
    trendEngine.setTrends([]);
    ideaEngine.setIdeas([]);
    blueprintEngine.setSelectedIdea(project.idea);
    blueprintEngine.setBlueprint(project.blueprint);
    setAppState('VIEWING');
  };

  return {
    state: {
      appState,
      niche: trendEngine.niche,
      region: trendEngine.region,
      timeframe: trendEngine.timeframe,
      deepMode: trendEngine.deepMode,
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
    },
    setters: {
      setAppState,
      setNiche: trendEngine.setNiche,
      setTrends: trendEngine.setTrends,
      setIdeas: ideaEngine.setIdeas,
      setSelectedIdea: blueprintEngine.setSelectedIdea,
      setBlueprint: blueprintEngine.setBlueprint,
      setError,
      setCurrentBlueprintId: blueprintEngine.setCurrentBlueprintId
    },
    actions: {
      executeSearchSequence,
      executeFreshAIResearch,
      generateIdeasFromTrends,
      handleSelectIdea,
      updateBlueprint: blueprintEngine.updateBlueprint,
      handleBackToIdeas,
      resetResearch,
      loadProject,
      dismissError: () => setError(null),
      updateTrend: trendEngine.updateTrend,
      analyzeTrendDeepDive: trendEngine.analyzeTrendDeepDive
    }
  };
};
