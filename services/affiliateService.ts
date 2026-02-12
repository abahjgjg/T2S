
import { Blueprint, AffiliateProduct } from '../types';
import { supabaseService } from './supabaseService';

/**
 * Service to handle Affiliate Link Injection logic.
 * Scans the generated blueprint for keywords matching configured affiliate products.
 */
export const affiliateService = {

  enrichBlueprint: async (blueprint: Blueprint): Promise<Blueprint> => {
    const products = await supabaseService.getAffiliateProducts();
    
    if (products.length === 0) return blueprint;

    const recommendations: AffiliateProduct[] = [];
    let updatedMarkdown = blueprint.fullContentMarkdown;
    const updatedSummary = blueprint.executiveSummary;
    const updatedTechStack = [...blueprint.technicalStack];

    // Helper to escape regex special characters
    const escapeRegExp = (string: string) => {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
    };

    products.forEach(product => {
      let isMatch = false;

      // 1. Check Keywords against Tech Stack & Content
      const allKeywords = [product.name, ...product.keywords];

      allKeywords.forEach(keyword => {
        if (!keyword) return;
        
        const regex = new RegExp(`\\b${escapeRegExp(keyword)}\\b`, 'gi');

        // Check Markdown content
        if (regex.test(updatedMarkdown)) {
          isMatch = true;
          // Replace plain text mention with Markdown Link
          // Avoid double linking if it's already a link
          updatedMarkdown = updatedMarkdown.replace(
            new RegExp(`(?<!\\[)\\b${escapeRegExp(keyword)}\\b(?!\\])`, 'gi'),
            `[${keyword} (Recommended)](${product.affiliateUrl})`
          );
        }

        // Check Tech Stack
        const stackIndex = updatedTechStack.findIndex(tech => tech.toLowerCase().includes(keyword.toLowerCase()));
        if (stackIndex !== -1) {
          isMatch = true;
          // We don't change the string in the array (keep it clean), but we flag it as a match
        }
      });

      if (isMatch) {
        // Prevent duplicates in recommendations
        if (!recommendations.find(r => r.id === product.id)) {
          recommendations.push(product);
        }
      }
    });

    return {
      ...blueprint,
      fullContentMarkdown: updatedMarkdown,
      executiveSummary: updatedSummary, // Optional: could also replace links here
      technicalStack: updatedTechStack,
      affiliateRecommendations: recommendations
    };
  }
};
