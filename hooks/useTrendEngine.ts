
import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Trend, Language, AIService, SearchRegion, SearchTimeframe } from '../types';

export const useTrendEngine = (aiService: AIService, language: Language) => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useState<{
    niche: string; 
    region: SearchRegion; 
    timeframe: SearchTimeframe;
    deepMode: boolean; 
  } | null>(null);

  // Use React Query for fetching trends
  const { data: trends = [], refetch, isFetching } = useQuery({
    queryKey: ['marketTrends', searchParams?.niche, searchParams?.region, searchParams?.timeframe, searchParams?.deepMode, language],
    queryFn: async () => {
      if (!searchParams) return [];
      return await aiService.fetchMarketTrends(
        searchParams.niche, 
        language, 
        searchParams.region, 
        searchParams.timeframe,
        searchParams.deepMode
      );
    },
    enabled: false, // Triggered manually via fetchTrends
    staleTime: 1000 * 60 * 15, // 15 minutes cache
    gcTime: 1000 * 60 * 60, // Keep unused data for 1 hour
  });

  const fetchTrends = async (searchTerm: string, region: SearchRegion = 'Global', timeframe: SearchTimeframe = '30d', deepMode: boolean = false) => {
    setSearchParams({ niche: searchTerm, region, timeframe, deepMode });
    
    // We explicitly trigger the refetch after setting params to ensure the query runs
    setTimeout(() => {
        // Small tick to allow state to propagate if needed
    }, 0);
    
    const result = await queryClient.fetchQuery({
      queryKey: ['marketTrends', searchTerm, region, timeframe, deepMode, language],
      queryFn: () => aiService.fetchMarketTrends(searchTerm, language, region, timeframe, deepMode),
      staleTime: 1000 * 60 * 15
    });
    
    return result;
  };

  // Support manual hydration from IDB or Deep Dive updates
  const setTrends = useCallback((newTrends: Trend[] | ((prev: Trend[]) => Trend[])) => {
    if (typeof newTrends === 'function') {
        queryClient.setQueryData(['marketTrends', searchParams?.niche, searchParams?.region, searchParams?.timeframe, searchParams?.deepMode, language], (old: Trend[] | undefined) => {
            return newTrends(old || []);
        });
    } else {
        queryClient.setQueryData(['marketTrends', searchParams?.niche, searchParams?.region, searchParams?.timeframe, searchParams?.deepMode, language], newTrends);
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
    const currentTrends = queryClient.getQueryData<Trend[]>(['marketTrends', searchParams?.niche, searchParams?.region, searchParams?.timeframe, searchParams?.deepMode, language]) || trends;
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

  const setSearchContext = (niche: string, region: SearchRegion, timeframe: SearchTimeframe, deepMode: boolean) => {
    setSearchParams({ niche, region, timeframe, deepMode });
  };

  return {
    niche: searchParams?.niche || '',
    region: searchParams?.region || 'Global',
    timeframe: searchParams?.timeframe || '30d',
    deepMode: searchParams?.deepMode || false,
    setNiche: (n: string) => setSearchParams(prev => ({ 
      ...prev, 
      niche: n, 
      region: prev?.region || 'Global',
      timeframe: prev?.timeframe || '30d',
      deepMode: prev?.deepMode || false 
    })),
    setSearchContext, // Helper for bulk restoration
    trends,
    setTrends,
    fetchTrends,
    updateTrend,
    analyzeTrendDeepDive,
    clearTrends,
    isLoading: isFetching
  };
};
