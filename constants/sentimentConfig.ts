/**
 * Sentiment Configuration
 * Centralized configuration for sentiment analysis colors, icons, and thresholds
 * Flexy: Eliminating hardcoded sentiment values throughout the application
 * All values can be overridden via environment variables.
 */

import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';

// Helper to safely get env var with fallback
const getEnv = (key: string, defaultValue: string): string => {
  const value = (import.meta as unknown as Record<string, Record<string, string>>)?.env?.[key] 
    ?? (typeof process !== 'undefined' ? process.env?.[key] : undefined);
  return value || defaultValue;
};

const getEnvNumber = (key: string, defaultValue: number): number => {
  const value = getEnv(key, String(defaultValue));
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

export type SentimentType = 'Positive' | 'Negative' | 'Neutral' | string;

export const SENTIMENT_COLORS = {
  Positive: {
    text: getEnv('VITE_SENTIMENT_POSITIVE_TEXT_CLASS', 'text-emerald-400'),
    bg: getEnv('VITE_SENTIMENT_POSITIVE_BG_CLASS', 'bg-emerald-950/30'),
    border: getEnv('VITE_SENTIMENT_POSITIVE_BORDER_CLASS', 'border-emerald-500/20'),
    solid: getEnv('VITE_SENTIMENT_POSITIVE_SOLID', '#10b981'),
    hex: getEnv('VITE_SENTIMENT_POSITIVE_HEX', '#10b981'),
  },
  Negative: {
    text: getEnv('VITE_SENTIMENT_NEGATIVE_TEXT_CLASS', 'text-red-400'),
    bg: getEnv('VITE_SENTIMENT_NEGATIVE_BG_CLASS', 'bg-red-950/30'),
    border: getEnv('VITE_SENTIMENT_NEGATIVE_BORDER_CLASS', 'border-red-500/20'),
    solid: getEnv('VITE_SENTIMENT_NEGATIVE_SOLID', '#ef4444'),
    hex: getEnv('VITE_SENTIMENT_NEGATIVE_HEX', '#ef4444'),
  },
  Neutral: {
    text: getEnv('VITE_SENTIMENT_NEUTRAL_TEXT_CLASS', 'text-blue-400'),
    bg: getEnv('VITE_SENTIMENT_NEUTRAL_BG_CLASS', 'bg-blue-950/30'),
    border: getEnv('VITE_SENTIMENT_NEUTRAL_BORDER_CLASS', 'border-blue-500/20'),
    solid: getEnv('VITE_SENTIMENT_NEUTRAL_SOLID', '#3b82f6'),
    hex: getEnv('VITE_SENTIMENT_NEUTRAL_HEX', '#3b82f6'),
  },
  Default: {
    text: getEnv('VITE_SENTIMENT_DEFAULT_TEXT_CLASS', 'text-slate-500'),
    bg: getEnv('VITE_SENTIMENT_DEFAULT_BG_CLASS', 'bg-slate-950'),
    border: getEnv('VITE_SENTIMENT_DEFAULT_BORDER_CLASS', 'border-slate-700'),
    solid: getEnv('VITE_SENTIMENT_DEFAULT_SOLID', '#64748b'),
    hex: getEnv('VITE_SENTIMENT_DEFAULT_HEX', '#64748b'),
  },
} as const;

export const SENTIMENT_ICONS: Record<string, { icon: LucideIcon; color: string }> = {
  Positive: { icon: TrendingUp, color: getEnv('VITE_SENTIMENT_POSITIVE_ICON_COLOR', 'text-emerald-400') },
  Negative: { icon: TrendingDown, color: getEnv('VITE_SENTIMENT_NEGATIVE_ICON_COLOR', 'text-red-400') },
  Neutral: { icon: Minus, color: getEnv('VITE_SENTIMENT_NEUTRAL_ICON_COLOR', 'text-blue-400') },
  Default: { icon: Minus, color: getEnv('VITE_SENTIMENT_DEFAULT_ICON_COLOR', 'text-slate-400') },
} as const;

export const SENTIMENT_THRESHOLDS = {
  HotTrend: getEnvNumber('VITE_SENTIMENT_THRESHOLD_HOT_TREND', 80),
  HighRelevance: getEnvNumber('VITE_SENTIMENT_THRESHOLD_HIGH_RELEVANCE', 70),
  MediumRelevance: getEnvNumber('VITE_SENTIMENT_THRESHOLD_MEDIUM_RELEVANCE', 40),
} as const;

export const getSentimentColor = (sentiment?: SentimentType): string => {
  switch(sentiment) {
    case 'Positive': return SENTIMENT_COLORS.Positive.hex;
    case 'Negative': return SENTIMENT_COLORS.Negative.hex;
    case 'Neutral': return SENTIMENT_COLORS.Neutral.hex;
    default: return SENTIMENT_COLORS.Neutral.hex;
  }
};

export const getSentimentStyle = (sentiment?: SentimentType) => {
  const key = sentiment || 'Default';
  return SENTIMENT_COLORS[key as keyof typeof SENTIMENT_COLORS] || SENTIMENT_COLORS.Default;
};

export const getSentimentIconConfig = (sentiment?: SentimentType) => {
  const key = sentiment || 'Default';
  return SENTIMENT_ICONS[key] || SENTIMENT_ICONS.Default;
};

export type SentimentColors = typeof SENTIMENT_COLORS;
export type SentimentThresholds = typeof SENTIMENT_THRESHOLDS;

// Default export for convenience
export default {
  SENTIMENT_COLORS,
  SENTIMENT_ICONS,
  SENTIMENT_THRESHOLDS,
  getSentimentColor,
  getSentimentStyle,
  getSentimentIconConfig,
};
