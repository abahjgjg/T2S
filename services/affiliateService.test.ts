
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { affiliateService } from './affiliateService';
import { supabaseService } from './supabaseService';
import { Blueprint, AffiliateProduct } from '../types';

// Mock Supabase Service to isolate logic
vi.mock('./supabaseService', () => ({
  supabaseService: {
    getAffiliateProducts: vi.fn()
  }
}));

describe('affiliateService', () => {
  const mockBlueprint: Blueprint = {
    executiveSummary: 'This blueprint covers Hosting and VPS strategies.',
    targetAudience: 'Developers',
    technicalStack: ['React', 'Node.js'],
    marketingStrategy: ['SEO'],
    revenueStreams: [],
    roadmap: [],
    swot: { strengths: [], weaknesses: [], opportunities: [], threats: [] },
    fullContentMarkdown: 'We recommend using a robust VPS for deployment. Also, check out cloud hosting solutions.',
    affiliateRecommendations: []
  };

  const mockProduct: AffiliateProduct = {
    id: 'prod_1',
    name: 'SuperHost',
    affiliateUrl: 'https://superhost.com?ref=me',
    description: 'Best VPS',
    keywords: ['VPS', 'Hosting'],
    clicks: 0
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return original blueprint if no products configured', async () => {
    // @ts-ignore
    supabaseService.getAffiliateProducts.mockResolvedValue([]);
    
    const result = await affiliateService.enrichBlueprint(mockBlueprint);
    
    expect(result).toEqual(mockBlueprint);
    expect(result.affiliateRecommendations).toHaveLength(0);
  });

  it('should inject links into Markdown content based on keyword matching', async () => {
    // @ts-ignore
    supabaseService.getAffiliateProducts.mockResolvedValue([mockProduct]);

    const result = await affiliateService.enrichBlueprint(mockBlueprint);

    // Check if "VPS" was replaced with a markdown link
    expect(result.fullContentMarkdown).toContain(`[VPS (Recommended)](${mockProduct.affiliateUrl})`);
    
    // Check if matched product was added to recommendations array
    expect(result.affiliateRecommendations).toBeDefined();
    expect(result.affiliateRecommendations?.length).toBe(1);
    expect(result.affiliateRecommendations?.[0].id).toBe(mockProduct.id);
  });

  it('should match keywords case-insensitively', async () => {
    const lowerCaseBlueprint = { ...mockBlueprint, fullContentMarkdown: 'this vps is great.' };
    // @ts-ignore
    supabaseService.getAffiliateProducts.mockResolvedValue([mockProduct]);

    const result = await affiliateService.enrichBlueprint(lowerCaseBlueprint);

    // Regex global insensitive match check
    expect(result.fullContentMarkdown).toContain(`[VPS (Recommended)](${mockProduct.affiliateUrl})`);
  });

  it('should not break if keywords are missing in product', async () => {
    const badProduct = { ...mockProduct, keywords: [] };
    // @ts-ignore
    supabaseService.getAffiliateProducts.mockResolvedValue([badProduct]);

    const result = await affiliateService.enrichBlueprint(mockBlueprint);

    // Should only match on Name if keywords empty
    // "SuperHost" is not in text, so no match expected
    expect(result.fullContentMarkdown).toBe(mockBlueprint.fullContentMarkdown);
    expect(result.affiliateRecommendations?.length).toBe(0);
  });

  it('should avoid double linking existing links', async () => {
    const linkedBlueprint = { 
      ...mockBlueprint, 
      fullContentMarkdown: 'Check out [VPS](https://other.com).' 
    };
    // @ts-ignore
    supabaseService.getAffiliateProducts.mockResolvedValue([mockProduct]);

    const result = await affiliateService.enrichBlueprint(linkedBlueprint);

    // Should NOT replace the inside of the existing markdown link
    // Note: The simple regex in service might struggle with complex cases, 
    // but the negative lookbehind (?<!\[) attempts to prevent this.
    // Let's verify expectations of current logic.
    expect(result.fullContentMarkdown).toBe('Check out [VPS](https://other.com).');
  });
});
