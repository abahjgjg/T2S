import React from 'react';
import { ANIMATION_TIMING, ANIMATION_EASING } from '../../constants/uiConfig';
import { ANIMATION_DELAYS, SPIN_DURATION } from '../../constants/animationConfig';
import { Lightbulb, Sparkles } from 'lucide-react';
import { TYPOGRAPHY_PRESETS, FONT_SIZES, FONT_WEIGHTS, TEXT_COLORS } from '../../constants/typography';

interface Tip {
  icon?: React.ReactNode;
  text: string;
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  tips?: Tip[];
  variant?: 'default' | 'generating' | 'creative';
}

const AnimatedBackground: React.FC<{ variant: 'default' | 'generating' | 'creative' }> = ({ variant }) => {
  const colors = {
    default: 'bg-blue-500/10',
    generating: 'bg-emerald-500/10',
    creative: 'bg-pink-500/10'
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated gradient orbs */}
      <div className={`absolute -top-20 -left-20 w-40 h-40 rounded-full ${colors[variant]} blur-3xl animate-pulse`} />
      <div className={`absolute -bottom-20 -right-20 w-40 h-40 rounded-full ${colors[variant]} blur-3xl animate-pulse`} style={{ animationDelay: ANIMATION_DELAYS.normal }} />
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 rounded-full ${colors[variant]} blur-3xl animate-pulse`} style={{ animationDelay: ANIMATION_DELAYS.fast }} />
    </div>
  );
};

const FloatingParticles: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(6)].map((_, i) => (
      <div
        key={i}
        className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
        style={{
          left: `${20 + i * 15}%`,
          top: `${30 + (i % 3) * 20}%`,
          animationDelay: ANIMATION_DELAYS.particle(i),
          animationDuration: `${3 + i * 0.5}s`
        }}
      />
    ))}
  </div>
);

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = "",
  tips,
  variant = 'default'
}) => {
  const iconColors = {
    default: 'text-blue-400',
    generating: 'text-emerald-400',
    creative: 'text-pink-400'
  };

  return (
    <div 
      className={`relative bg-slate-900 border border-slate-800 rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[300px] animate-[fadeIn_${ANIMATION_TIMING.FADE_NORMAL}s_${ANIMATION_EASING.DEFAULT}] overflow-hidden ${className}`}
    >
      <AnimatedBackground variant={variant} />
      <FloatingParticles />
      
      <div className="relative z-10">
        {icon && (
          <div className="mb-6 relative">
            {/* Animated ring around icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`w-20 h-20 rounded-full border-2 border-dashed ${iconColors[variant]} opacity-30 animate-spin-slow`} style={{ animationDuration: SPIN_DURATION.slow }} />
            </div>
            <div className="relative w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center border border-slate-700/50 backdrop-blur-sm">
              {icon}
            </div>
          </div>
        )}
        
        <h3 className={TYPOGRAPHY_PRESETS.h4}>{title}</h3>
        
        {description && (
          <p className={`${TEXT_COLORS.slate[300]} max-w-md mx-auto mb-6`}>{description}</p>
        )}
        
        {action && <div className="mb-6">{action}</div>}
        
        {/* Contextual Tips Section */}
        {tips && tips.length > 0 && (
          <div className="mt-4 p-4 bg-slate-950/50 rounded-lg border border-slate-800/50 max-w-md mx-auto">
            <div className="flex items-center gap-2 mb-3 text-left">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span className={`${FONT_SIZES.xs} ${FONT_WEIGHTS.bold} ${TEXT_COLORS.slate[400]} uppercase tracking-wider`}>Pro Tips</span>
            </div>
            <ul className="space-y-2 text-left">
              {tips.map((tip, index) => (
                <li key={index} className={`flex items-start gap-2 ${FONT_SIZES.sm} ${TEXT_COLORS.slate[400]}`}>
                  {tip.icon || <Sparkles className="w-3 h-3 text-slate-500 mt-1 shrink-0" />}
                  <span>{tip.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
