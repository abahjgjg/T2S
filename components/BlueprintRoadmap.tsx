import React, { useMemo } from 'react';
import { Share2, CheckSquare, Square, CheckCircle2 } from 'lucide-react';
import { Blueprint } from '../types';
import { usePreferences } from '../contexts/PreferencesContext';

interface Props {
  roadmap: Blueprint['roadmap'];
  progress?: Record<string, boolean>;
  onToggleTask?: (task: string) => void;
}

export const BlueprintRoadmap: React.FC<Props> = ({ roadmap, progress = {}, onToggleTask }) => {
  const { uiText } = usePreferences();
  
  // Calculate completion stats
  const stats = useMemo(() => {
    let total = 0;
    let completed = 0;
    roadmap.forEach(phase => {
      phase.tasks.forEach(task => {
        total++;
        if (progress[task]) completed++;
      });
    });
    return { total, completed, percentage: total === 0 ? 0 : Math.round((completed / total) * 100) };
  }, [roadmap, progress]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8 print:break-inside-avoid">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Share2 className="w-5 h-5 text-orange-400" /> {uiText.roadmap}
        </h3>
        
        {/* Progress Bar */}
        {onToggleTask && (
          <div className="flex items-center gap-3 w-full md:w-auto min-w-[200px]">
            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-500 ease-out" 
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
            <span className="text-xs font-bold font-mono text-emerald-400 min-w-[3rem] text-right">
              {stats.percentage}%
            </span>
          </div>
        )}
      </div>

      <div className="space-y-8">
        {roadmap.map((phase, i) => {
          // Check phase completion for styling
          const isPhaseComplete = phase.tasks.every(t => progress[t]);

          return (
            <div key={i} className={`relative pl-8 border-l-2 transition-colors ${isPhaseComplete ? 'border-emerald-500' : 'border-slate-800'}`}>
              <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 transition-colors flex items-center justify-center ${
                isPhaseComplete 
                ? 'bg-emerald-500 border-emerald-500' 
                : 'bg-slate-900 border-emerald-500'
              }`}>
                {isPhaseComplete && <CheckCircle2 className="w-3 h-3 text-slate-900" />}
              </div>
              
              <h4 className={`text-lg font-bold mb-3 transition-colors ${isPhaseComplete ? 'text-emerald-400' : 'text-white'}`}>
                {phase.phase}
              </h4>
              
              <ul className="space-y-3">
                {phase.tasks.map((task, t) => {
                  const isDone = !!progress[task];
                  
                  return (
                    <li 
                      key={t} 
                      className={`group flex items-start gap-3 text-sm transition-all ${
                        isDone ? 'text-slate-500' : 'text-slate-300'
                      } ${onToggleTask ? 'cursor-pointer hover:bg-slate-800/50 p-2 rounded-lg -ml-2' : ''}`}
                      onClick={() => onToggleTask && onToggleTask(task)}
                    >
                      {onToggleTask ? (
                        <div className={`mt-0.5 shrink-0 transition-colors ${isDone ? 'text-emerald-500' : 'text-slate-600 group-hover:text-emerald-400'}`}>
                          {isDone ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                        </div>
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-1.5 shrink-0" />
                      )}
                      
                      <span className={`${isDone ? 'line-through decoration-slate-600' : ''} leading-relaxed`}>
                        {task}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};