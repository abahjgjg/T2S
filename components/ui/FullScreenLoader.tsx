import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Sparkles, Zap, Brain, Rocket } from 'lucide-react';
import { UI_TIMING, ANIMATION_TIMING, ANIMATION_EASING } from '../../constants/uiConfig';
import { ANIMATION_DURATION } from '../../constants/animationConfig';

interface FullScreenLoaderProps {
  /** Text to display below the loader */
  text?: string;
  /** Optional subtext for additional context */
  subtext?: string;
  /** Variant of the loader */
  variant?: 'default' | 'thinking' | 'launching' | 'analyzing';
  /** Whether to show a progress bar */
  showProgress?: boolean;
  /** Optional progress percentage (0-100) */
  progress?: number;
  /** Estimated time remaining in seconds */
  estimatedTime?: number;
}

/**
 * FullScreenLoader - A delightful micro-UX loading component
 * 
 * Features:
 * - Animated icon morphing between different states
 * - Shimmer progress bar with gradient
 * - Floating particles for visual delight
 * - Smart time estimation display
 * - Respects reduced motion preferences
 * - Accessible with proper ARIA attributes
 */
export const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({
  text = 'Loading...',
  subtext,
  variant = 'default',
  showProgress = true,
  progress,
  estimatedTime,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Animate through loading steps
  useEffect(() => {
    if (prefersReducedMotion) return;

    intervalRef.current = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % 4);
    }, UI_TIMING.LOADING_STEP_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [prefersReducedMotion]);

  // Track elapsed time for estimation
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const variants = {
    default: {
      icons: [Loader2, Sparkles, Zap, Sparkles],
      colors: ['text-emerald-500', 'text-blue-500', 'text-purple-500', 'text-pink-500'],
      bgGradient: 'from-emerald-500/20 via-blue-500/20 to-purple-500/20',
    },
    thinking: {
      icons: [Brain, Sparkles, Brain, Sparkles],
      colors: ['text-purple-500', 'text-pink-500', 'text-purple-500', 'text-pink-500'],
      bgGradient: 'from-purple-500/20 via-pink-500/20 to-rose-500/20',
    },
    launching: {
      icons: [Rocket, Sparkles, Zap, Rocket],
      colors: ['text-orange-500', 'text-amber-500', 'text-yellow-500', 'text-orange-500'],
      bgGradient: 'from-orange-500/20 via-amber-500/20 to-yellow-500/20',
    },
    analyzing: {
      icons: [Zap, Brain, Sparkles, Zap],
      colors: ['text-cyan-500', 'text-blue-500', 'text-indigo-500', 'text-cyan-500'],
      bgGradient: 'from-cyan-500/20 via-blue-500/20 to-indigo-500/20',
    },
  };

  const currentVariant = variants[variant];
  const CurrentIcon = currentVariant.icons[currentStep];
  const currentColor = currentVariant.colors[currentStep];

  // Format estimated time
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Calculate estimated time remaining
  const getEstimatedRemaining = () => {
    if (estimatedTime && progress !== undefined && progress > 0) {
      const remaining = Math.max(0, Math.round((elapsedTime / progress) * (100 - progress)));
      return remaining;
    }
    return null;
  };

  const remainingTime = getEstimatedRemaining();

  return (
    <div 
      className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-6 relative overflow-hidden"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={text}
    >
      {/* Animated background gradient orbs */}
      {!prefersReducedMotion && (
        <>
          <div 
            className={`absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-gradient-to-br ${currentVariant.bgGradient} blur-3xl opacity-50 animate-pulse`}
            style={{ animationDuration: '4s' }}
          />
          <div 
            className={`absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-gradient-to-br ${currentVariant.bgGradient} blur-3xl opacity-50 animate-pulse`}
            style={{ animationDuration: '4s', animationDelay: '2s' }}
          />
        </>
      )}

      {/* Floating particles */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
              style={{
                left: `${15 + i * 10}%`,
                top: `${20 + (i % 4) * 15}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: `${3 + i * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Icon with animated ring */}
        <div className="relative">
          {/* Animated ring */}
          {!prefersReducedMotion && (
            <div 
              className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${currentColor}`}
              style={{
                animation: 'spin 8s linear infinite',
              }}
            >
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-current opacity-30" />
            </div>
          )}
          
          {/* Icon container */}
          <div 
            className={`
              relative w-20 h-20 rounded-2xl bg-slate-900/80 backdrop-blur-sm 
              flex items-center justify-center border border-slate-700/50
              transition-all duration-300
              ${prefersReducedMotion ? '' : 'animate-pulse'}
            `}
            style={{
              boxShadow: `0 0 40px -10px var(--tw-shadow-color)`,
              '--tw-shadow-color': 'rgb(16 185 129 / 0.3)',
            } as React.CSSProperties}
          >
            <CurrentIcon 
              className={`
                w-10 h-10 transition-all duration-300
                ${currentColor}
                ${prefersReducedMotion ? '' : 'animate-pulse'}
              `}
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Text content */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-white">
            {text}
          </h2>
          {subtext && (
            <p className="text-slate-400 text-sm max-w-xs">
              {subtext}
            </p>
          )}
        </div>

        {/* Progress bar */}
        {showProgress && (
          <div className="w-64 space-y-2">
            {/* Progress track */}
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              {/* Progress fill with shimmer */}
              <div 
                className={`
                  h-full rounded-full bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500
                  ${prefersReducedMotion ? '' : 'animate-[shimmer_2s_infinite_linear]'}
                  ${progress !== undefined ? 'transition-all duration-300 ease-out' : 'animate-[loading_2s_ease-in-out_infinite]'}
                `}
                style={{
                  width: progress !== undefined ? `${progress}%` : '60%',
                  backgroundSize: '200% 100%',
                }}
              />
            </div>
            
            {/* Progress text */}
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>{progress !== undefined ? `${Math.round(progress)}%` : 'Loading...'}</span>
              {remainingTime !== null && (
                <span className="text-slate-400">
                  ~{formatTime(remainingTime)} remaining
                </span>
              )}
            </div>
          </div>
        )}

        {/* Loading dots animation */}
        {!prefersReducedMotion && (
          <div className="flex items-center gap-1" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"
                style={{
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: '0.6s',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Visually hidden status for screen readers */}
      <span className="sr-only" role="status">
        {text}. {progress !== undefined ? `${Math.round(progress)} percent complete.` : ''}
        {remainingTime !== null ? `Approximately ${formatTime(remainingTime)} remaining.` : ''}
      </span>

      <style>{`
        @keyframes loading {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

export default FullScreenLoader;
