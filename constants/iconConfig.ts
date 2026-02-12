/**
 * Icon Configuration for Category Mappings
 * Flexy: Uses centralized env utilities for modularity
 */

import React from 'react';
import { Cpu, Heart, DollarSign, Leaf, ShoppingCart, Smartphone, Activity, LucideIcon } from 'lucide-react';
import { getEnv } from '../utils/envUtils';

export interface CategoryIconConfig {
  icon: LucideIcon;
  color: string;
  keywords: string[];
}

export const CATEGORY_ICON_MAP: Record<string, CategoryIconConfig> = {
  tech: {
    icon: Cpu,
    color: getEnv('VITE_ICON_COLOR_TECH', 'text-blue-400'),
    keywords: getEnv('VITE_ICON_KEYWORDS_TECH', 'tech,teknologi,technology').split(','),
  },
  health: {
    icon: Heart,
    color: getEnv('VITE_ICON_COLOR_HEALTH', 'text-red-400'),
    keywords: getEnv('VITE_ICON_KEYWORDS_HEALTH', 'health,kesehatan,bio').split(','),
  },
  finance: {
    icon: DollarSign,
    color: getEnv('VITE_ICON_COLOR_FINANCE', 'text-emerald-400'),
    keywords: getEnv('VITE_ICON_KEYWORDS_FINANCE', 'finance,keuangan').split(','),
  },
  green: {
    icon: Leaf,
    color: getEnv('VITE_ICON_COLOR_GREEN', 'text-green-400'),
    keywords: getEnv('VITE_ICON_KEYWORDS_GREEN', 'green,energi,sustainability,hijau').split(','),
  },
  commerce: {
    icon: ShoppingCart,
    color: getEnv('VITE_ICON_COLOR_COMMERCE', 'text-orange-400'),
    keywords: getEnv('VITE_ICON_KEYWORDS_COMMERCE', 'commerce,e-commerce,shopping').split(','),
  },
  saas: {
    icon: Smartphone,
    color: getEnv('VITE_ICON_COLOR_SAAS', 'text-purple-400'),
    keywords: getEnv('VITE_ICON_KEYWORDS_SAAS', 'saas,digital,software').split(','),
  },
  default: {
    icon: Activity,
    color: getEnv('VITE_ICON_COLOR_DEFAULT', 'text-slate-400'),
    keywords: [],
  },
};

/**
 * Get icon configuration for a category
 * Flexy loves this modular approach!
 */
export const getCategoryIconConfig = (category: string): CategoryIconConfig => {
  const lower = category.toLowerCase();
  
  for (const config of Object.values(CATEGORY_ICON_MAP)) {
    if (config.keywords.some(keyword => lower.includes(keyword.toLowerCase()))) {
      return config;
    }
  }
  
  return CATEGORY_ICON_MAP.default;
};

export default {
  CATEGORY_ICON_MAP,
  getCategoryIconConfig,
};
