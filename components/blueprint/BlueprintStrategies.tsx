
import React from 'react';
import { Layers, Globe, CheckCircle2 } from 'lucide-react';

interface Props {
  technicalStack: string[];
  marketingStrategy: string[];
  uiText: any;
}

export const BlueprintStrategies: React.FC<Props> = ({ technicalStack, marketingStrategy, uiText }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Tech Stack */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-400" /> {uiText.techStack}
        </h3>
        <div className="flex flex-wrap gap-2">
          {technicalStack.map((tech, i) => (
            <span key={i} className="px-3 py-1 bg-slate-800 text-blue-200 rounded-full text-sm border border-slate-700">
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Marketing Strategy */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-purple-400" /> Marketing Strategy
        </h3>
        <ul className="space-y-2">
          {marketingStrategy.map((strategy, i) => (
            <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
              <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
              {strategy}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
