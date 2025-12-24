
import { useState, useEffect } from 'react';
import { indexedDBService } from '../utils/storageUtils';

export const useAsset = (sourceUrl?: string | null) => {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    let objectUrl: string | null = null;

    const resolve = async () => {
      if (!sourceUrl) {
        setResolvedUrl(null);
        return;
      }

      // Check if it is a persistent asset protocol
      if (sourceUrl.startsWith('asset://')) {
        setIsLoading(true);
        const assetId = sourceUrl.replace('asset://', '');
        try {
          const blob = await indexedDBService.getAsset(assetId);
          if (blob && isActive) {
            objectUrl = URL.createObjectURL(blob);
            setResolvedUrl(objectUrl);
          } else if (isActive) {
            setError("Asset not found in local storage.");
          }
        } catch (e) {
          if (isActive) setError("Failed to load asset.");
        } finally {
          if (isActive) setIsLoading(false);
        }
      } else {
        // Standard URL (http, data:base64, or existing blob:)
        setResolvedUrl(sourceUrl);
      }
    };

    resolve();

    return () => {
      isActive = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [sourceUrl]);

  return { url: resolvedUrl, isLoading, error };
};
