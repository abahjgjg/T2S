
import { DEFAULT_PROMPTS, PromptKey } from '../constants/systemPrompts';
import { interpolate } from '../utils/promptUtils';
import { safeLocalStorage } from '../utils/storageUtils';

const STORAGE_KEY = 'trendventures_prompts_v1';

export const promptService = {
  /**
   * Get the raw template string.
   * Priority: 1. LocalStorage (Admin Override) -> 2. Default Constants
   */
  getTemplate: (key: PromptKey): string => {
    const saved = safeLocalStorage.getItem<Record<string, string>>(STORAGE_KEY, {});
    return saved[key] || DEFAULT_PROMPTS[key];
  },

  /**
   * Returns the final interpolated prompt ready to send to AI.
   */
  build: (key: PromptKey, variables: Record<string, any>): string => {
    const template = promptService.getTemplate(key);
    return interpolate(template, variables);
  },

  /**
   * Save a new template override (Admin function).
   */
  saveTemplate: (key: PromptKey, template: string) => {
    const saved = safeLocalStorage.getItem<Record<string, string>>(STORAGE_KEY, {});
    saved[key] = template;
    safeLocalStorage.setItem(STORAGE_KEY, saved);
  },
  
  /**
   * Reset a specific prompt to default.
   */
  resetTemplate: (key: PromptKey) => {
    const saved = safeLocalStorage.getItem<Record<string, string>>(STORAGE_KEY, {});
    delete saved[key];
    safeLocalStorage.setItem(STORAGE_KEY, saved);
  },

  /**
   * Reset all prompts to defaults.
   */
  resetAll: () => {
    safeLocalStorage.removeItem(STORAGE_KEY);
  },
  
  /**
   * Get all current templates (for Admin UI).
   */
  getAll: () => {
    const saved = safeLocalStorage.getItem<Record<string, string>>(STORAGE_KEY, {});
    // Merge defaults with saved to ensure all keys exist
    return { ...DEFAULT_PROMPTS, ...saved };
  }
};
