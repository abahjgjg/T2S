
import { useState, useEffect } from 'react';
import { indexedDBService } from '../utils/storageUtils';

export const useAsset = (assetUrl: string | null | undefined) => {
  const [state, setState] = useState<{ url: string | null, isLoading: boolean, error: string | null }>({
    url: null,
    isLoading: false,
    error: null
  });

  useEffect(() => {
    if (!assetUrl) {
      setState({ url: null, isLoading: false, error: null });
      return;
    }

    if (!assetUrl.startsWith('asset://')) {
      setState({ url: assetUrl, isLoading: false, error: null });
      return;
    }

    let currentUrl: string | null = null;
    let isMounted = true;

    const load = async () => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      try {
        const assetId = assetUrl.replace('asset://', '');
        const blob = await indexedDBService.getAsset(assetId);

        if (!isMounted) return;

        if (blob) {
          currentUrl = URL.createObjectURL(blob);
          setState({ url: currentUrl, isLoading: false, error: null });
        } else {
          setState({ url: null, isLoading: false, error: "Asset not found" });
        }
      } catch (err) {
        if (!isMounted) return;
        setState({ url: null, isLoading: false, error: "Failed to load asset" });
      }
    };

    load();

    return () => {
      isMounted = false;
      if (currentUrl) URL.revokeObjectURL(currentUrl);
    };
  }, [assetUrl]);

  return state;
};
