
import { useEffect, useRef } from 'react';
import { AppState, Trend, BusinessIdea, Blueprint, SearchRegion, SearchTimeframe } from '../types';
import { indexedDBService } from '../utils/storageUtils';

const STORAGE_KEY = 'trendventures_state_v1';
const SAVE_DELAY_MS = 3000;

interface PersistenceState {
  appState: AppState;
  niche: string;
  region: SearchRegion;
  timeframe: SearchTimeframe;
  deepMode: boolean;
  image?: string;
  trends: Trend[];
  ideas: BusinessIdea[];
  selectedIdea: BusinessIdea | null;
  blueprint: Blueprint | null;
}

export const useResearchPersistence = (
  state: PersistenceState,
  isRestoring: boolean,
  onHydrate: (data: any) => void,
  setIsRestoring: (val: boolean) => void
) => {
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Load on Mount ---
  useEffect(() => {
    const hydrate = async () => {
      try {
        let parsed = await indexedDBService.getItem<any>(STORAGE_KEY);

        // Migration Fallback
        if (!parsed) {
          const localData = localStorage.getItem(STORAGE_KEY);
          if (localData) {
            parsed = JSON.parse(localData);
            await indexedDBService.setItem(STORAGE_KEY, parsed);
            localStorage.removeItem(STORAGE_KEY);
          }
        }

        if (parsed && parsed.appState) {
          onHydrate(parsed);
        }
      } catch (e) {
        console.warn("[Persistence] State restoration failed", e);
      } finally {
        setIsRestoring(false);
      }
    };

    hydrate();
  }, []);

  // --- Save on Change ---
  useEffect(() => {
    if (isRestoring) return;

    const { appState } = state;
    if (appState === 'IDLE' || appState === 'VIEWING_PUBLIC' || appState === 'DIRECTORY' || appState === 'ADMIN' || appState === 'DASHBOARD') {
      return;
    }

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      await indexedDBService.setItem(STORAGE_KEY, state);
    }, SAVE_DELAY_MS);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [state, isRestoring]);
};
