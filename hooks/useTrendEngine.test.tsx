// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTrendEngine } from './useTrendEngine';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { AIService, Trend } from '../types';

// Mock AIService
const mockAIService: AIService = {
  fetchMarketTrends: vi.fn(),
  getTrendDeepDive: vi.fn(),
  generateBusinessIdeas: vi.fn(),
  generateSystemBlueprint: vi.fn(),
  generateVoiceSummary: vi.fn(),
  sendBlueprintChat: vi.fn(),
  generateTeamOfAgents: vi.fn(),
  chatWithAgent: vi.fn(),
  chatWithResearchAnalyst: vi.fn(),
  generateBrandImage: vi.fn(),
  generateMarketingVideo: vi.fn(),
  analyzeCompetitor: vi.fn(),
  scoutLocation: vi.fn(),
  generateLaunchAssets: vi.fn(),
  conductViabilityAudit: vi.fn(),
  generateBMC: vi.fn(),
  generateLandingPageCode: vi.fn(),
  generateContentCalendar: vi.fn(),
  generateBrandIdentity: vi.fn(),
  generatePersonas: vi.fn(),
  extractTopicFromImage: vi.fn(),
  analyzePitchTranscript: vi.fn()
};

// Wrapper for React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries for testing
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useTrendEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useTrendEngine(mockAIService, 'en'), { wrapper: createWrapper() });
    
    expect(result.current.trends).toEqual([]);
    expect(result.current.niche).toBe('');
    expect(result.current.isLoading).toBe(false);
  });

  it('should fetch trends and update state', async () => {
    const mockTrends: Trend[] = [
      { 
        title: 'AI Boom', 
        description: 'AI is growing', 
        relevanceScore: 90, 
        triggerEvent: 'GPT-5 Release', 
        sources: [] 
      }
    ];

    // Setup Mock Return
    (mockAIService.fetchMarketTrends as any).mockResolvedValue(mockTrends);

    const { result } = renderHook(() => useTrendEngine(mockAIService, 'en'), { wrapper: createWrapper() });

    // Trigger Fetch
    let fetchResult;
    await waitFor(async () => {
      fetchResult = await result.current.fetchTrends('Artificial Intelligence', 'USA', '7d');
    });

    // Check Calls
    expect(mockAIService.fetchMarketTrends).toHaveBeenCalledWith('Artificial Intelligence', 'en', 'USA', '7d', false, undefined);
    
    // Check State Update
    await waitFor(() => expect(result.current.niche).toBe('Artificial Intelligence'));
    // Note: react-query updates are async, result.current tracks the hook state. 
    // fetchResult returns the promise data directly.
    expect(fetchResult).toEqual(mockTrends);
    
    // Check if trends state in hook updated
    await waitFor(() => {
        expect(result.current.trends).toHaveLength(1);
        expect(result.current.trends[0].title).toBe('AI Boom');
    });
  });

  it('should handle deep dive analysis updates', async () => {
    const initialTrends: Trend[] = [{ 
      title: 'Crypto', 
      description: 'Up', 
      relevanceScore: 80, 
      triggerEvent: 'Halving', 
      sources: [] 
    }];

    // Pre-load cache via manual set for testing
    const { result } = renderHook(() => useTrendEngine(mockAIService, 'en'), { wrapper: createWrapper() });
    
    // Manually set trends to simulate loaded state
    // We need to trigger a fetch context first or the setter might not target the right query key
    // For testing setTrends logic directly:
    result.current.setTrends(initialTrends);

    await waitFor(() => expect(result.current.trends).toHaveLength(1));

    // Mock Deep Dive
    const mockDeepDive = {
      summary: 'Deep analysis...',
      sentiment: 'Positive' as const,
      keyEvents: [],
      futureOutlook: 'Good',
      actionableTips: []
    };
    (mockAIService.getTrendDeepDive as any).mockResolvedValue(mockDeepDive);

    // Trigger Deep Dive
    await result.current.analyzeTrendDeepDive(0);

    // Verify Service Call
    expect(mockAIService.getTrendDeepDive).toHaveBeenCalledWith('Crypto', '', 'en');

    // Verify State Update
    await waitFor(() => {
      expect(result.current.trends[0].deepDive).toBeDefined();
      expect(result.current.trends[0].deepDive?.summary).toBe('Deep analysis...');
    });
  });

  it('should clear trends correctly', async () => {
    const { result } = renderHook(() => useTrendEngine(mockAIService, 'en'), { wrapper: createWrapper() });
    
    // Set niche first so query key is stable
    result.current.setNiche('Test Niche');
    await waitFor(() => expect(result.current.niche).toBe('Test Niche'));

    result.current.setTrends([{ title: 'Test', description: '', relevanceScore: 10, triggerEvent: '', sources: [] }]);

    await waitFor(() => expect(result.current.trends).toHaveLength(1));

    result.current.clearTrends();

    await waitFor(() => {
      expect(result.current.trends).toEqual([]);
      expect(result.current.niche).toBe(''); // searchParams becomes null, returns ''
    });
  });
});
