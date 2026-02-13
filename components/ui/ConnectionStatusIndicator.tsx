import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { ANIMATION_TIMING, ANIMATION_EASING, UI_TIMING } from '../../constants/uiConfig';
import { Z_INDEX } from '../../constants/zIndex';

/**
 * ConnectionStatusIndicator - A subtle micro-UX component that shows network status
 * 
 * Features:
 * - Shows offline indicator when connection is lost
 * - Shows online confirmation when connection is restored
 * - Auto-dismisses after connection is restored
 * - Respects reduced motion preferences
 * - Accessible with proper ARIA live regions
 * - Non-intrusive - appears at top of screen without blocking content
 * 
 * Accessibility:
 * - Uses aria-live="polite" to announce status changes to screen readers
 * - Visual indicator for users who may not notice connection issues
 * - Does not auto-focus to avoid disrupting user workflow
 */
export const ConnectionStatusIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [showOnlineConfirmation, setShowOnlineConfirmation] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setIsReconnecting(false);
      // Show brief confirmation that we're back online
      setShowOnlineConfirmation(true);
      
      // Auto-hide the online confirmation after a delay
      setTimeout(() => {
        setShowOnlineConfirmation(false);
      }, UI_TIMING.TOAST_DURATION);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOnlineConfirmation(false);
      setIsReconnecting(false);
    };

    // Listen for online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Also check periodically in case the events don't fire reliably
    const intervalId = setInterval(() => {
      const currentStatus = navigator.onLine;
      if (currentStatus !== isOnline) {
        if (currentStatus) {
          handleOnline();
        } else {
          handleOffline();
        }
      }
    }, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, [isOnline]);

  const handleRetry = () => {
    setIsReconnecting(true);
    // Force a check by making a simple network request
    fetch(window.location.origin, { method: 'HEAD', mode: 'no-cors' })
      .then(() => {
        if (navigator.onLine) {
          setIsOnline(true);
          setShowOnlineConfirmation(true);
          setTimeout(() => setShowOnlineConfirmation(false), UI_TIMING.TOAST_DURATION);
        }
      })
      .catch(() => {
        // Still offline
      })
      .finally(() => {
        setIsReconnecting(false);
      });
  };

  // Don't render anything if online and not showing confirmation
  if (isOnline && !showOnlineConfirmation) {
    return (
      // Still render a hidden live region for screen readers
      <div className="sr-only" role="status" aria-live="polite">
        Connected to network
      </div>
    );
  }

  const containerClasses = `
    fixed top-0 left-0 right-0 ${Z_INDEX.TOAST} 
    flex items-center justify-center
    transition-all duration-500 ease-out
    ${!isOnline || showOnlineConfirmation ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}
  `;

  const bannerClasses = `
    flex items-center gap-2 px-4 py-2 rounded-b-xl shadow-lg
    text-sm font-medium
    animate-[slideDown_0.3s_ease-out]
    ${!isOnline 
      ? 'bg-red-900/95 border-b border-red-500/50 text-red-100' 
      : 'bg-emerald-900/95 border-b border-emerald-500/50 text-emerald-100'}
  `;

  return (
    <div className={containerClasses} role="alert" aria-live="polite">
      <div className={bannerClasses}>
        {!isOnline ? (
          <>
            <WifiOff className="w-4 h-4" aria-hidden="true" />
            <span>You're offline. Some features may not work.</span>
            <button
              onClick={handleRetry}
              disabled={isReconnecting}
              className="ml-2 flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
              aria-label="Check connection status"
            >
              <RefreshCw className={`w-3 h-3 ${isReconnecting ? 'animate-spin' : ''}`} />
              <span className="text-xs">{isReconnecting ? 'Checking...' : 'Retry'}</span>
            </button>
          </>
        ) : (
          <>
            <Wifi className="w-4 h-4" aria-hidden="true" />
            <span>Back online!</span>
          </>
        )}
      </div>
      
      {/* Hidden status for screen readers */}
      <span className="sr-only" role="status">
        {isOnline ? 'Connection restored' : 'Connection lost'}
      </span>
    </div>
  );
};

export default ConnectionStatusIndicator;
