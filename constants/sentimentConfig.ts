
/**
 * Sentiment Configuration
 * Centralized configuration for sentiment analysis colors, icons, and thresholds
 * Flexy: Eliminating hardcoded sentiment values throughout the application
 */

import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';

export type SentimentType = 'Positive' | 'Negative' | 'Neutral' | string;

export const SENTIMENT_COLORS = {
  Positive: {
    text: 'text-emerald-400',
    bg: 'bg-emerald-950/30',
    border: 'border-emerald-500/20',
    solid: '#10b981',
    hex: '#10b981',
  },
  Negative: {
    text: 'text-red-400',
    bg: 'bg-red-950/30',
    border: 'border-red-500/20',
    solid: '#ef4444',
    hex: '#ef4444',
  },
  Neutral: {
    text: 'text-blue-400',
    bg: 'bg-blue-950/30',
    border: 'border-blue-500/20',
    solid: '#3b82f6',
    hex: '#3b82f6',
  },
  Default: {
    text: 'text-slate-500',
    bg: 'bg-slate-950',
    border: 'border-slate-700',
    solid: '#64748b',
    hex: '#64748b',
  },
} as const;

export const SENTIMENT_ICONS: Record<string, { icon: LucideIcon; color: string }> = {
  Positive: { icon: TrendingUp, color: 'text-emerald-400' },
  Negative: { icon: TrendingDown, color: 'text-red-400' },
  Neutral: { icon: Minus, color: 'text-blue-400' },
  Default: { icon: Minus, color: 'text-slate-400' },
} as const;

export const SENTIMENT_THRESHOLDS = {
  HotTrend: 80,
  HighRelevance: 70,
  MediumRelevance: 40,
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
