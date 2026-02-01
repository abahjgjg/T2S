
import { useEffect, useRef } from 'react';
import { AppState, Trend, BusinessIdea, Blueprint, SearchRegion, SearchTimeframe } from '../types';
import { indexedDBService } from '../utils/storageUtils';

const STORAGE_KEY = 'trendventures_state_v1';
const ASSET_KEY_PREFIX = 'search_image_';
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

// Helper: Convert Base64 to Blob
const base64ToBlob = (base64: string): Blob => {
  const byteString = atob(base64.split(',')[1] || base64);
  const mimeString = base64.split(',')[0]?.split(':')[1]?.split(';')[0] || 'image/jpeg';
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
};

// Helper: Convert Blob to Base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

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
          // Restore image from asset store if asset key exists
          if (parsed.imageAssetKey) {
            try {
              const imageBlob = await indexedDBService.getAsset(parsed.imageAssetKey);
              if (imageBlob) {
                parsed.image = await blobToBase64(imageBlob);
              }
              delete parsed.imageAssetKey; // Clean up temp key
            } catch (e) {
              console.warn("[Persistence] Failed to restore image asset", e);
            }
          }
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
      try {
        // Handle image asset separately to avoid Base64 bloat in state
        const stateToSave: any = { ...state };
        
        if (state.image && state.image.startsWith('data:')) {
          // Convert Base64 to Blob and save to asset store
          const assetKey = `${ASSET_KEY_PREFIX}${Date.now()}`;
          const imageBlob = base64ToBlob(state.image);
          await indexedDBService.saveAsset(assetKey, imageBlob);
          
          // Replace image with asset key reference
          stateToSave.imageAssetKey = assetKey;
          delete stateToSave.image;
        }
        
        await indexedDBService.setItem(STORAGE_KEY, stateToSave);
      } catch (e) {
        console.error("[Persistence] Failed to save state", e);
      }
    }, SAVE_DELAY_MS);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [state, isRestoring]);
};
