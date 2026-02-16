/**
 * RGB Color Configuration
 * Flexy: Centralized RGB/RGBA color values for consistent theming
 * All values can be overridden via environment variables.
 * 
 * These colors match Tailwind's default palette for consistency.
 */

import { getEnv } from '../utils/envUtils';

// Emerald colors (primary brand color)
export const RGB_EMERALD = {
  300: getEnv('VITE_RGB_EMERALD_300', '110, 231, 183'),
  400: getEnv('VITE_RGB_EMERALD_400', '52, 211, 153'),
  500: getEnv('VITE_RGB_EMERALD_500', '16, 185, 129'),
  600: getEnv('VITE_RGB_EMERALD_600', '5, 150, 105'),
} as const;

// Blue colors
export const RGB_BLUE = {
  300: getEnv('VITE_RGB_BLUE_300', '147, 197, 253'),
  400: getEnv('VITE_RGB_BLUE_400', '96, 165, 250'),
  500: getEnv('VITE_RGB_BLUE_500', '59, 130, 246'),
  600: getEnv('VITE_RGB_BLUE_600', '37, 99, 235'),
} as const;

// Purple colors
export const RGB_PURPLE = {
  300: getEnv('VITE_RGB_PURPLE_300', '216, 180, 254'),
  400: getEnv('VITE_RGB_PURPLE_400', '192, 132, 252'),
  500: getEnv('VITE_RGB_PURPLE_500', '168, 85, 247'),
  600: getEnv('VITE_RGB_PURPLE_600', '147, 51, 234'),
} as const;

// Indigo colors
export const RGB_INDIGO = {
  300: getEnv('VITE_RGB_INDIGO_300', '165, 180, 252'),
  400: getEnv('VITE_RGB_INDIGO_400', '129, 140, 248'),
  500: getEnv('VITE_RGB_INDIGO_500', '99, 102, 241'),
} as const;

// Orange colors
export const RGB_ORANGE = {
  400: getEnv('VITE_RGB_ORANGE_400', '251, 146, 60'),
  500: getEnv('VITE_RGB_ORANGE_500', '249, 115, 22'),
} as const;

// Red colors
export const RGB_RED = {
  400: getEnv('VITE_RGB_RED_400', '248, 113, 113'),
  500: getEnv('VITE_RGB_RED_500', '239, 68, 68'),
} as const;

// Slate colors (grays)
export const RGB_SLATE = {
  300: getEnv('VITE_RGB_SLATE_300', '203, 213, 225'),
  400: getEnv('VITE_RGB_SLATE_400', '148, 163, 184'),
  500: getEnv('VITE_RGB_SLATE_500', '100, 116, 139'),
  600: getEnv('VITE_RGB_SLATE_600', '71, 85, 105'),
  700: getEnv('VITE_RGB_SLATE_700', '51, 65, 85'),
  800: getEnv('VITE_RGB_SLATE_800', '30, 41, 59'),
  900: getEnv('VITE_RGB_SLATE_900', '15, 23, 42'),
  950: getEnv('VITE_RGB_SLATE_950', '2, 6, 23'),
} as const;

// White with opacity variants
export const RGB_WHITE = {
  full: getEnv('VITE_RGB_WHITE', '255, 255, 255'),
  5: getEnv('VITE_RGB_WHITE_5', '255, 255, 255'),
  10: getEnv('VITE_RGB_WHITE_10', '255, 255, 255'),
  20: getEnv('VITE_RGB_WHITE_20', '255, 255, 255'),
} as const;

// Black with opacity variants
export const RGB_BLACK = {
  full: getEnv('VITE_RGB_BLACK', '0, 0, 0'),
  50: getEnv('VITE_RGB_BLACK_50', '0, 0, 0'),
  60: getEnv('VITE_RGB_BLACK_60', '0, 0, 0'),
} as const;

// Helper function to create RGBA string
export const rgba = (rgb: string, alpha: number): string => `rgba(${rgb}, ${alpha})`;

// Helper function to create RGB string
export const rgb = (rgb: string): string => `rgb(${rgb})`;

// Predefined shadow colors with opacity
export const SHADOW_COLORS = {
  emerald: {
    light: rgba(RGB_EMERALD[500], 0.2),
    medium: rgba(RGB_EMERALD[500], 0.3),
    strong: rgba(RGB_EMERALD[500], 0.5),
  },
  blue: {
    light: rgba(RGB_BLUE[500], 0.2),
    medium: rgba(RGB_BLUE[500], 0.3),
    strong: rgba(RGB_BLUE[500], 0.5),
  },
  purple: {
    light: rgba(RGB_PURPLE[500], 0.2),
    medium: rgba(RGB_PURPLE[500], 0.3),
    strong: rgba(RGB_PURPLE[500], 0.5),
  },
  white: {
    5: rgba(RGB_WHITE.full, 0.05),
    10: rgba(RGB_WHITE.full, 0.10),
    20: rgba(RGB_WHITE.full, 0.20),
  },
} as const;

// Default export
export default {
  RGB_EMERALD,
  RGB_BLUE,
  RGB_PURPLE,
  RGB_INDIGO,
  RGB_ORANGE,
  RGB_RED,
  RGB_SLATE,
  RGB_WHITE,
  RGB_BLACK,
  SHADOW_COLORS,
  rgba,
  rgb,
};
