
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart as BarChartIcon } from 'lucide-react';
import { Blueprint } from '../types';

interface Props {
  revenueStreams: Blueprint['revenueStreams'];
  uiText: any;
}

export const BlueprintRevenue: React.FC<Props> = ({ revenueStreams, uiText }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8 print:break-inside-avoid">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <BarChartIcon className="w-5 h-5 text-emerald-400" /> {uiText.revProject}
      </h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={revenueStreams} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
            <XAxis 
              dataKey="name" 
              stroke="#64748b" 
              fontSize={12} 
              tickMargin={10} 
              angle={-15} 
              textAnchor="end"
              interval={0}
            />
            <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `$${value}`} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, uiText.projected]}
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
            />
            <Bar dataKey="projected" radius={[4, 4, 0, 0]}>
              {revenueStreams.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#10b981' : '#3b82f6'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
