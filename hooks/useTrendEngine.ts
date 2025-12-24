
import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Trend, Language, AIService, SearchRegion, SearchTimeframe } from '../types';

export const useTrendEngine = (aiService: AIService, language: Language) => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useState<{
    niche: string; 
    region: SearchRegion; 
    timeframe: SearchTimeframe;
  } | null>(null);

  // Use React Query for fetching trends
  const { data: trends = [], refetch, isFetching } = useQuery({
    queryKey: ['marketTrends', searchParams?.niche, searchParams?.region, searchParams?.timeframe, language],
    queryFn: async () => {
      if (!searchParams) return [];
      return await aiService.fetchMarketTrends(
        searchParams.niche, 
        language, 
        searchParams.region, 
        searchParams.timeframe
      );
    },
    enabled: false, // Triggered manually via fetchTrends
    staleTime: 1000 * 60 * 15, // 15 minutes cache
    gcTime: 1000 * 60 * 60, // Keep unused data for 1 hour
  });

  const fetchTrends = async (searchTerm: string, region: SearchRegion = 'Global', timeframe: SearchTimeframe = '30d') => {
    setSearchParams({ niche: searchTerm, region, timeframe });
    
    // We explicitly trigger the refetch after setting params to ensure the query runs
    // Note: In a real-world scenario with 'enabled: true', setting params would auto-trigger.
    // However, we want strict control for the 'Analyze' button click.
    setTimeout(() => {
        // Small tick to allow state to propagate if needed, though react-query handles keys well.
    }, 0);
    
    const result = await queryClient.fetchQuery({
      queryKey: ['marketTrends', searchTerm, region, timeframe, language],
      queryFn: () => aiService.fetchMarketTrends(searchTerm, language, region, timeframe),
      staleTime: 1000 * 60 * 15
    });
    
    return result;
  };

  // Support manual hydration from IDB or Deep Dive updates
  const setTrends = useCallback((newTrends: Trend[] | ((prev: Trend[]) => Trend[])) => {
    // We use a generic key for the "current" trends in view, or we update the specific query if we knew it.
    // Since this is a "Selection" engine, we can treat the current data as the active state.
    // However, React Query's `data` is read-only. We must update the cache.
    
    // Strategy: We update the cache for the *current* search params if they exist, 
    // or just rely on a local override if we are restoring from IDB without a search context.
    
    if (typeof newTrends === 'function') {
        // Functional update logic requires reading current data
        queryClient.setQueryData(['marketTrends', searchParams?.niche, searchParams?.region, searchParams?.timeframe, language], (old: Trend[] | undefined) => {
            return newTrends(old || []);
        });
    } else {
        // Direct set (used by IDB restore)
        // If we are restoring, we might not have searchParams set yet. 
        // We set the data for the *current* active key context.
        queryClient.setQueryData(['marketTrends', searchParams?.niche, searchParams?.region, searchParams?.timeframe, language], newTrends);
    }
  }, [queryClient, searchParams, language]);

  const updateTrend = (index: number, updates: Partial<Trend>) => {
    setTrends(prev => {
      const newTrends = [...prev];
      if (newTrends[index]) {
        newTrends[index] = { ...newTrends[index], ...updates };
      }
      return newTrends;
    });
  };

  const analyzeTrendDeepDive = async (index: number) => {
    // Access current data synchronously from cache or hook
    const currentTrends = queryClient.getQueryData<Trend[]>(['marketTrends', searchParams?.niche, searchParams?.region, searchParams?.timeframe, language]) || trends;
    const trend = currentTrends[index];
    
    if (!trend) return;
    if (trend.deepDive) return;

    try {
      const data = await aiService.getTrendDeepDive(trend.title, searchParams?.niche || '', language);
      updateTrend(index, { deepDive: data });
    } catch (error) {
      console.error("Deep dive analysis failed:", error);
      throw error;
    }
  };

  const clearTrends = () => {
    setSearchParams(null);
    queryClient.removeQueries({ queryKey: ['marketTrends'] });
  };

  return {
    niche: searchParams?.niche || '',
    setNiche: (n: string) => setSearchParams(prev => ({ ...prev!, niche: n })), // Simple setter for compatibility
    trends,
    setTrends,
    fetchTrends,
    updateTrend,
    analyzeTrendDeepDive,
    clearTrends,
    isLoading: isFetching
  };
};
