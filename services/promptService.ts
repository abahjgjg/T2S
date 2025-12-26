
import { DEFAULT_PROMPTS, PromptKey } from '../constants/systemPrompts';
import { interpolate } from '../utils/promptUtils';
import { safeLocalStorage } from '../utils/storageUtils';
import { supabaseService } from './supabaseService';

const STORAGE_KEY = 'trendventures_prompts_v1';

export const promptService = {
  /**
   * Get the raw template string.
   * Priority: 1. LocalStorage (Cache) -> 2. Default Constants
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
   * Updates Local Cache immediately, then attempts Cloud Sync.
   */
  saveTemplate: async (key: PromptKey, template: string) => {
    // 1. Update Local
    const saved = safeLocalStorage.getItem<Record<string, string>>(STORAGE_KEY, {});
    saved[key] = template;
    safeLocalStorage.setItem(STORAGE_KEY, saved);

    // 2. Update Cloud
    if (supabaseService.isConfigured()) {
      await supabaseService.saveRemotePrompt(key, template);
    }
  },
  
  /**
   * Reset a specific prompt to default.
   */
  resetTemplate: async (key: PromptKey) => {
    // 1. Update Local
    const saved = safeLocalStorage.getItem<Record<string, string>>(STORAGE_KEY, {});
    delete saved[key];
    safeLocalStorage.setItem(STORAGE_KEY, saved);

    // 2. Update Cloud
    if (supabaseService.isConfigured()) {
      await supabaseService.deleteRemotePrompt(key);
    }
  },

  /**
   * Reset all prompts to defaults locally.
   */
  resetAll: () => {
    safeLocalStorage.removeItem(STORAGE_KEY);
  },
  
  /**
   * Get all current templates (for Admin UI).
   */
  getAll: () => {
    const saved = safeLocalStorage.getItem<Record<string, string>>(STORAGE_KEY, {});
    return { ...DEFAULT_PROMPTS, ...saved };
  },

  /**
   * Syncs local cache with remote DB.
   * Remote DB is the source of truth for "Overrides".
   * This is called on App Mount.
   */
  syncWithCloud: async () => {
    if (!supabaseService.isConfigured()) return;

    try {
      const remotePrompts = await supabaseService.getRemotePrompts();
      if (Object.keys(remotePrompts).length > 0) {
        // Merge remote prompts into local storage
        // Remote overwrites local if key exists
        const currentLocal = safeLocalStorage.getItem<Record<string, string>>(STORAGE_KEY, {});
        const merged = { ...currentLocal, ...remotePrompts };
        safeLocalStorage.setItem(STORAGE_KEY, merged);
        console.debug('[PromptService] Synced with cloud configuration');
      }
    } catch (e) {
      console.warn('[PromptService] Sync failed', e);
    }
  }
};
