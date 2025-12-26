import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBlueprintEngine } from './useBlueprintEngine';
import { AIService, BusinessIdea, Blueprint } from '../types';
import { supabaseService } from '../services/supabaseService';

// Mock Dependencies
vi.mock('../services/supabaseService', () => ({
  supabaseService: {
    publishBlueprint: vi.fn(),
  }
}));

const mockBlueprint: Blueprint = {
  executiveSummary: 'Summary',
  targetAudience: 'Everyone',
  technicalStack: ['React'],
  marketingStrategy: ['Ads'],
  revenueStreams: [{ name: 'Sub', projected: 100 }],
  roadmap: [{ phase: '1', tasks: ['Build'] }],
  swot: { strengths: [], weaknesses: [], opportunities: [], threats: [] },
  fullContentMarkdown: '# Title',
};

const mockIdea: BusinessIdea = {
  id: 'idea-1',
  name: 'Test Idea',
  type: 'SaaS',
  description: 'Desc',
  monetizationModel: 'Sub',
  difficulty: 'Medium',
  potentialRevenue: '1M',
  rationale: 'Why not',
};

const mockAIService = {
  generateSystemBlueprint: vi.fn(),
} as unknown as AIService;

describe('useBlueprintEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useBlueprintEngine(mockAIService, 'en'));
    
    expect(result.current.selectedIdea).toBeNull();
    expect(result.current.blueprint).toBeNull();
    expect(result.current.currentBlueprintId).toBeNull();
  });

  it('should generate a fresh blueprint and publish it', async () => {
    (mockAIService.generateSystemBlueprint as any).mockResolvedValue(mockBlueprint);
    (supabaseService.publishBlueprint as any).mockResolvedValue('pub-123');

    const { result } = renderHook(() => useBlueprintEngine(mockAIService, 'en', 'user-1'));

    await act(async () => {
      await result.current.createBlueprint(mockIdea, 'Test Niche');
    });

    expect(result.current.selectedIdea).toEqual(mockIdea);
    expect(mockAIService.generateSystemBlueprint).toHaveBeenCalledWith(mockIdea, 'en');
    expect(supabaseService.publishBlueprint).toHaveBeenCalledWith('Test Niche', mockIdea, mockBlueprint, 'user-1');
    expect(result.current.blueprint).toEqual(mockBlueprint);
    expect(result.current.currentBlueprintId).toBe('pub-123');
  });

  it('should use cached blueprint if available', async () => {
    const cachedIdea = { ...mockIdea, cachedBlueprint: mockBlueprint };
    const { result } = renderHook(() => useBlueprintEngine(mockAIService, 'en'));

    await act(async () => {
      await result.current.createBlueprint(cachedIdea, 'Test Niche');
    });

    expect(result.current.selectedIdea).toEqual(cachedIdea);
    expect(mockAIService.generateSystemBlueprint).not.toHaveBeenCalled(); // Should assume cache
    expect(result.current.blueprint).toEqual(mockBlueprint);
    expect(result.current.currentBlueprintId).toBe(cachedIdea.id); // Published ID should be the cached idea's ID
  });

  it('should update blueprint state manually', async () => {
    const { result } = renderHook(() => useBlueprintEngine(mockAIService, 'en'));
    
    // Set initial state
    act(() => {
        result.current.setBlueprint(mockBlueprint);
    });

    act(() => {
      result.current.updateBlueprint({ executiveSummary: 'Updated Summary' });
    });

    expect(result.current.blueprint?.executiveSummary).toBe('Updated Summary');
    // Ensure other fields remain
    expect(result.current.blueprint?.technicalStack).toEqual(mockBlueprint.technicalStack);
  });

  it('should clear blueprint state', async () => {
    const { result } = renderHook(() => useBlueprintEngine(mockAIService, 'en'));

    act(() => {
      result.current.setBlueprint(mockBlueprint);
      result.current.setSelectedIdea(mockIdea);
      result.current.setCurrentBlueprintId('123');
    });

    act(() => {
      result.current.clearBlueprint();
    });

    expect(result.current.blueprint).toBeNull();
    expect(result.current.selectedIdea).toBeNull();
    expect(result.current.currentBlueprintId).toBeNull();
  });
});