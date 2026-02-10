import React from 'react';
import { Check } from 'lucide-react';

interface SegmentedProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
  showStepNumbers?: boolean;
  className?: string;
}

export const SegmentedProgressBar: React.FC<SegmentedProgressBarProps> = ({
  currentStep,
  totalSteps,
  stepLabels,
  showStepNumbers = true,
  className = ''
}) => {
  const progress = Math.min(((currentStep + 1) / totalSteps) * 100, 100);
  
  return (
    <div className={`w-full max-w-md ${className}`}>
      {/* Progress bar container */}
      <div className="relative">
        {/* Background track */}
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          {/* Progress fill */}
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Progress: Step ${currentStep + 1} of ${totalSteps}`}
          />
        </div>
        
        {/* Step indicators */}
        <div className="flex justify-between mt-3">
          {Array.from({ length: totalSteps }, (_, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isPending = index > currentStep;
            
            return (
              <div 
                key={index}
                className={`flex flex-col items-center transition-all duration-300 ${
                  isCurrent ? 'scale-110' : ''
                }`}
              >
                {/* Step dot */}
                <div 
                  className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-emerald-500 border-emerald-500' 
                      : isCurrent 
                        ? 'bg-emerald-400 border-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)] animate-pulse'
                        : 'bg-slate-800 border-slate-600'
                  }`}
                >
                  {isCompleted && (
                    <Check className="w-2 h-2 text-slate-950 absolute -mt-0.5 -ml-0.5" strokeWidth={4} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Step counter and label */}
      <div className="flex flex-col items-center mt-4 space-y-2">
        {showStepNumbers && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-emerald-400 font-mono font-bold">
              Step {currentStep + 1}
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-500 font-mono">
              {totalSteps}
            </span>
          </div>
        )}
        
        {stepLabels && stepLabels[currentStep] && (
          <p className="text-emerald-400 font-mono text-sm animate-[fadeIn_0.3s_ease-in-out] text-center">
            {stepLabels[currentStep]}
          </p>
        )}
      </div>
    </div>
  );
};
