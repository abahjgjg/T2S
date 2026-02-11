import React, { useState, useCallback } from 'react';
import { ImageOff, Loader2, RefreshCw } from 'lucide-react';
import { MEDIA_CONFIG } from '../../constants/aiConfig';
import { ANIMATION_DURATION } from '../../constants/animationConfig';

interface SmartImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  fallbackIcon?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
  maxRetries?: number;
}

export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  className = '',
  containerClassName = '',
  fallbackIcon,
  onLoad,
  onError,
  maxRetries = MEDIA_CONFIG.RETRY.DEFAULT_MAX_RETRIES
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setIsLoading(false);
    setHasError(false);
    setRetryCount(0);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);
    setIsRetrying(false);
    onError?.();
  }, [onError]);

  const handleRetry = useCallback(() => {
    if (retryCount >= maxRetries) return;
    
    setIsRetrying(true);
    setHasError(false);
    setIsLoading(true);
    setRetryCount(prev => prev + 1);
    
    // Force re-render by updating the key
    setTimeout(() => {
      setIsRetrying(false);
    }, ANIMATION_DURATION.micro.fast);
  }, [retryCount, maxRetries]);

  if (hasError) {
    const canRetry = retryCount < maxRetries;
    
    return (
      <div 
        className={`flex flex-col items-center justify-center bg-slate-800/50 text-slate-500 ${containerClassName}`}
        role="img"
        aria-label={`Failed to load: ${alt}`}
      >
        {fallbackIcon || <ImageOff className="w-8 h-8 opacity-50 mb-2" />}
        
        {canRetry ? (
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-emerald-400 hover:bg-slate-700/50 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed group"
            aria-label={`Retry loading image. Attempt ${retryCount + 1} of ${maxRetries}`}
            title="Click to retry loading image"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            <span>Retry</span>
            <span className="text-[10px] text-slate-500">({retryCount}/{maxRetries})</span>
          </button>
        ) : (
          <span className="text-[10px] text-slate-600">Failed to load</span>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${containerClassName}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800/30 animate-pulse">
          <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
        </div>
      )}
      <img
        key={`${src}-${retryCount}`}
        src={src}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-500 ease-out ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        loading="lazy"
      />
    </div>
  );
};
