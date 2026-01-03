
import { useCallback, useEffect } from 'react';

export const useRouter = () => {
  const pushState = useCallback((url: string) => {
    try {
      if (window.location.pathname + window.location.search !== url) {
        window.history.pushState({ path: url }, '', url);
      }
    } catch (e) {
      console.warn("URL update blocked by environment:", e);
    }
  }, []);

  const getParams = useCallback(() => {
    return new URLSearchParams(window.location.search);
  }, []);

  const getPath = useCallback(() => {
    return window.location.pathname;
  }, []);

  return { pushState, getParams, getPath };
};
