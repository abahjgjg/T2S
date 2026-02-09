import React from 'react';

interface ProjectCardSkeletonProps {
  count?: number;
}

export const ProjectCardSkeleton: React.FC<ProjectCardSkeletonProps> = ({ count = 3 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div 
          key={index}
          className="bg-slate-950 border border-slate-800 rounded-xl p-4 relative overflow-hidden"
          aria-busy="true"
          aria-label="Loading project..."
        >
          <div className="absolute inset-0 overflow-hidden">
            <div className="h-full w-1/3 animate-[shimmer_2s_infinite_linear] bg-gradient-to-r from-transparent via-slate-700/30 to-transparent" />
          </div>
          
          <div className="flex justify-between items-start gap-4 relative">
            <div className="flex-1 space-y-3">
              <div className="h-6 bg-slate-800 rounded w-3/4" />
              
              <div className="flex flex-wrap items-center gap-3">
                <div className="h-5 bg-slate-800 rounded w-16" />
                <div className="h-5 bg-slate-800 rounded w-20" />
                <div className="h-4 bg-slate-800 rounded w-24" />
              </div>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <div className="h-8 bg-slate-800 rounded-lg w-20" />
              <div className="h-8 bg-slate-800 rounded-lg w-8" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
