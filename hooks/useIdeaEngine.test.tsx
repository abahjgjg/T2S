// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useIdeaEngine } from './useIdeaEngine';
import { AIService, BusinessIdea } from '../types';
import { createWrapper } from './test-utils';

// Mock Data
const mockIdeas: BusinessIdea[] = [
  {
    id: 'idea-1',
    name: 'AI Bakery',
    type: 'SaaS',
    description: 'AI for baking',
    monetizationModel: 'Subscription',
    difficulty: 'Medium',
    potentialRevenue: '$5k/mo',
    rationale: 'High demand',
    competitors: ['BakeBot']
  }
];

const mockTrends = [{ title: 'Baking Tech', description: '', relevanceScore: 100, triggerEvent: '', sources: [] }];

// Mock Service
const mockAIService = {
  generateBusinessIdeas: vi.fn(),
} as unknown as AIService;

describe('useIdeaEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty ideas', () => {
    const { result } = renderHook(() => useIdeaEngine(mockAIService, 'en'), { wrapper: createWrapper() });
    expect(result.current.ideas).toEqual([]);
    expect(result.current.isGeneratingIdeas).toBe(false);
  });

  it('should generate ideas successfully', async () => {
    (mockAIService.generateBusinessIdeas as any).mockResolvedValue(mockIdeas);

    const { result } = renderHook(() => useIdeaEngine(mockAIService, 'en'), { wrapper: createWrapper() });

    let generated;
    await act(async () => {
      generated = await result.current.generateIdeas('Baking', mockTrends);
    });

    expect(mockAIService.generateBusinessIdeas).toHaveBeenCalledWith('Baking', mockTrends, 'en');
    expect(result.current.ideas).toEqual(mockIdeas);
    expect(generated).toEqual(mockIdeas);
    expect(result.current.isGeneratingIdeas).toBe(false);
  });

  it('should handle loading state correctly', async () => {
    // Delay resolution to check loading state
    (mockAIService.generateBusinessIdeas as any).mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockIdeas), 100)));

    const { result } = renderHook(() => useIdeaEngine(mockAIService, 'en'), { wrapper: createWrapper() });

    act(() => {
      result.current.generateIdeas('Baking', mockTrends);
    });

    await waitFor(() => expect(result.current.isGeneratingIdeas).toBe(true));

    await waitFor(() => expect(result.current.isGeneratingIdeas).toBe(false));
    expect(result.current.ideas).toEqual(mockIdeas);
  });

  it('should clear ideas', async () => {
    (mockAIService.generateBusinessIdeas as any).mockResolvedValue(mockIdeas);
    const { result } = renderHook(() => useIdeaEngine(mockAIService, 'en'), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.generateIdeas('Baking', mockTrends);
    });

    expect(result.current.ideas).toHaveLength(1);

    act(() => {
      result.current.clearIdeas();
    });

    expect(result.current.ideas).toEqual([]);
  });
  
  it('should handle errors gracefully', async () => {
     (mockAIService.generateBusinessIdeas as any).mockRejectedValue(new Error('AI Error'));
     const { result } = renderHook(() => useIdeaEngine(mockAIService, 'en'), { wrapper: createWrapper() });
     
     try {
       await act(async () => {
         await result.current.generateIdeas('Baking', mockTrends);
       });
     } catch (e) {
       // Error bubbles up from hook, handled by component/parent
     }
     
     expect(result.current.isGeneratingIdeas).toBe(false);
     expect(result.current.ideas).toEqual([]);
  });
});
