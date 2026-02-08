
import React, { useState, useMemo } from 'react';
import { Trend } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  ScatterChart, Scatter, ZAxis, ReferenceLine, Label, Cell 
} from 'recharts';
import { BarChart3, List, LayoutGrid, CheckSquare, Square, Newspaper, Activity, Radio, TrendingUp, TrendingDown, Minus, Calendar, Clock, Globe, Flame } from 'lucide-react';
import { TrendDeepDiveModal } from './TrendDeepDiveModal';
import { usePreferences } from '../contexts/PreferencesContext';
import { COLORS } from '../constants/theme';
import { TEXT_TRUNCATION, DISPLAY_LIMITS } from '../constants/displayConfig';

interface Props {
  trends: Trend[];
  selectedTrendIndices: Set<number>;
  expandedTrendIndex: number | null;
  isLoadingDeepDive: boolean;
  ideasLength: number;
  onToggleSelection: (e: React.MouseEvent, index: number) => void;
  onToggleExpand: (trend: Trend, index: number) => void;
  onAskQuestion?: (question: string) => void;
}

const getSentimentColor = (sentiment?: string) => {
  switch(sentiment) {
    case 'Positive': return COLORS.sentiment.positive;
    case 'Negative': return COLORS.sentiment.negative;
    default: return COLORS.sentiment.neutral;
  }
};

const getSentimentIcon = (sentiment?: string) => {
  switch(sentiment) {
    case 'Positive': return <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />;
    case 'Negative': return <TrendingDown className="w-3.5 h-3.5 text-red-400" />;
    default: return <Minus className="w-3.5 h-3.5 text-blue-400" />;
  }
};

export const TrendAnalysis: React.FC<Props> = ({
  trends,
  selectedTrendIndices,
  expandedTrendIndex,
  isLoadingDeepDive,
  ideasLength,
  onToggleSelection,
  onToggleExpand,
  onAskQuestion
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'matrix' | 'timeline'>('list');
  const { uiText } = usePreferences();
  
  const chartData = useMemo(() => {
    return [...trends]
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, DISPLAY_LIMITS.TRENDS_MAX_ITEMS)
      .map(t => ({
        name: t.title.length > TEXT_TRUNCATION.TITLE_SHORT ? t.title.slice(0, TEXT_TRUNCATION.TITLE_SHORT) + '...' : t.title,
        fullName: t.title,
        score: t.relevanceScore,
        sentiment: t.sentiment
      }));
  }, [trends]);

  const scatterData = useMemo(() => {
    return trends.map(t => ({
      name: t.title,
      x: t.relevanceScore,
      y: t.growthScore || 50,
      z: t.impactScore || 50,
      sentiment: t.sentiment
    }));
  }, [trends]);

  const timelineData = useMemo(() => {
    return [...trends].sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA; 
    });
  }, [trends]);

  const avgGrowth = useMemo(() => {
    if (scatterData.length === 0) return 0;
    return Math.round(scatterData.reduce((acc, curr) => acc + curr.y, 0) / scatterData.length);
  }, [scatterData]);

  const activeTrend = expandedTrendIndex !== null ? trends[expandedTrendIndex] : null;

  return (
    <div className="animate-[fadeIn_0.3s_ease-out]">
      {activeTrend && (
        <TrendDeepDiveModal 
          trend={activeTrend}
          isLoading={isLoadingDeepDive}
          onClose={() => onToggleExpand(activeTrend, expandedTrendIndex!)}
          onAskQuestion={onAskQuestion}
        />
      )}

      {/* Live News Ticker */}
      <div className="w-full bg-slate-900 border-y border-slate-800 mb-8 overflow-hidden py-2 relative flex items-center group">
        <div className="absolute left-0 z-10 bg-slate-900 px-3 py-1 flex items-center gap-2 border-r border-slate-800 h-full shadow-xl">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Live Signals</span>
        </div>
        
        <div className="whitespace-nowrap flex animate-marquee group-hover:[animation-play-state:paused] items-center">
          {trends.concat(trends).map((trend, i) => (
             <button 
               key={i} 
               onClick={() => onToggleExpand(trend, i % trends.length)}
               className="mx-6 flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer focus:outline-none focus:text-emerald-400"
             >
               <Radio className="w-3 h-3 text-slate-600" />
               <span className="font-bold">{trend.title.toUpperCase()}</span>: {trend.triggerEvent}
               <span className={`text-[10px] px-1.5 rounded border ${
                 trend.sentiment === 'Positive' ? 'text-emerald-400 border-emerald-500/30' :
                 trend.sentiment === 'Negative' ? 'text-red-400 border-red-500/30' :
                 'text-slate-500 border-slate-700'
               }`}>
                 {trend.sentiment || 'NEWS'}
               </span>
               <span className="text-slate-700 ml-4">///</span>
             </button>
          ))}
        </div>
        <div className="absolute right-0 z-10 bg-gradient-to-l from-slate-900 to-transparent w-16 h-full pointer-events-none"></div>
      </div>

      {/* Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
         <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-center">
            <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> Market Intelligence
            </h4>
            <p className="text-sm text-slate-500 mb-6">
              AI-driven analysis of {trends.length} identified market shifts.
            </p>
            
            <div className="bg-slate-900 p-1 rounded-lg border border-slate-800 flex gap-1 mb-4">
               <button onClick={() => setViewMode('list')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}><List className="w-3 h-3" /></button>
               <button onClick={() => setViewMode('matrix')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-xs font-bold transition-all ${viewMode === 'matrix' ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}><LayoutGrid className="w-3 h-3" /></button>
               <button onClick={() => setViewMode('timeline')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-xs font-bold transition-all ${viewMode === 'timeline' ? 'bg-slate-800 text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}><Calendar className="w-3 h-3" /></button>
            </div>

            <div className="mt-auto">
              <div className="flex gap-4">
                 <div>
                    <div className="text-2xl font-black text-white">{trends.length}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Signals</div>
                 </div>
                 {scatterData.length > 0 && scatterData[0].y !== 50 && (
                   <div>
                      <div className="text-2xl font-black text-emerald-500">{avgGrowth}%</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">Avg Velocity</div>
                   </div>
                 )}
              </div>
            </div>
         </div>
         
          <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-4 h-[300px] relative overflow-hidden">
             {viewMode === 'list' && (
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                   <CartesianGrid strokeDasharray="3 3" stroke={COLORS.chart.grid} horizontal={true} vertical={false} />
                   <XAxis type="number" domain={[0, 100]} stroke={COLORS.chart.axis} fontSize={12} tickLine={false} axisLine={false} />
                   <YAxis dataKey="name" type="category" width={120} stroke={COLORS.slate[400]} fontSize={12} tickLine={false} axisLine={false} />
                   <Tooltip contentStyle={{ backgroundColor: COLORS.chart.tooltipBg, borderColor: COLORS.chart.tooltipBorder, color: COLORS.chart.tooltipText }} />
                   <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={20}>
                     {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={getSentimentColor(entry.sentiment)} />)}
                   </Bar>
                 </BarChart>
               </ResponsiveContainer>
             )}
             
             {viewMode === 'matrix' && (
               <ResponsiveContainer width="100%" height="100%">
                 <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                   <CartesianGrid strokeDasharray="3 3" stroke={COLORS.chart.grid} />
                   <XAxis type="number" dataKey="x" name="Relevance" unit="%" stroke={COLORS.chart.axis} domain={[0, 100]}><Label value="Relevance" offset={-10} position="insideBottom" fill={COLORS.chart.axisLabel} fontSize={10} /></XAxis>
                   <YAxis type="number" dataKey="y" name="Growth" unit="%" stroke={COLORS.chart.axis} domain={[0, 100]}><Label value="Growth/Hype" angle={-90} position="insideLeft" fill={COLORS.chart.axisLabel} fontSize={10} /></YAxis>
                   <ZAxis type="number" dataKey="z" range={[50, 400]} name="Impact" />
                   <Tooltip contentStyle={{ backgroundColor: COLORS.chart.tooltipBg, borderColor: COLORS.chart.tooltipBorder, color: COLORS.chart.tooltipText }} />
                   <Scatter name="Trends" data={scatterData} fill={COLORS.sentiment.positive}>
                     {scatterData.map((entry, index) => <Cell key={`cell-${index}`} fill={getSentimentColor(entry.sentiment)} />)}
                   </Scatter>
                 </ScatterChart>
               </ResponsiveContainer>
             )}

            {viewMode === 'timeline' && (
              <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-2">
                 <div className="relative pl-4 space-y-4">
                    <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-blue-500/20 via-slate-800 to-transparent"></div>
                    {timelineData.map((trend, i) => (
                      <div key={i} className="relative pl-6 group cursor-pointer animate-[fadeIn_0.3s_ease-out]" onClick={() => { const originalIdx = trends.findIndex(t => t.title === trend.title); onToggleExpand(trend, originalIdx); }}>
                         <div className="absolute left-0 top-3 w-4 h-4 rounded-full bg-slate-900 border-2 border-slate-700 group-hover:border-blue-400 group-hover:bg-blue-900/30 transition-colors z-10"></div>
                         <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 group-hover:border-blue-500/30 hover:bg-slate-800/50 transition-all">
                            <div className="flex justify-between items-start mb-1">
                               <span className="text-[10px] font-mono text-blue-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {trend.date || 'Recent Update'}</span>
                               <span className={`text-[10px] font-bold ${trend.sentiment === 'Positive' ? 'text-emerald-400' : trend.sentiment === 'Negative' ? 'text-red-400' : 'text-slate-500'}`}>{trend.sentiment}</span>
                            </div>
                            <h5 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">{trend.title}</h5>
                            <p className="text-xs text-slate-400 line-clamp-1 mt-1">{trend.triggerEvent}</p>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            )}
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trends.map((trend, idx) => {
          const isHot = (trend.growthScore || 0) > 80;
          const sourceCount = trend.sources?.length || 0;
          
          return (
            <div key={idx} className={`bg-slate-900 border rounded-xl p-5 transition-all relative overflow-hidden flex flex-col group cursor-pointer ${selectedTrendIndices.has(idx) ? 'border-emerald-500/50 shadow-[0_0_15px_-5px_rgba(16,185,129,0.2)]' : 'border-slate-800 opacity-70 hover:opacity-100'}`} onClick={(e) => ideasLength === 0 && onToggleSelection(e, idx)}>
              {ideasLength === 0 && (
                <div className="absolute top-4 right-4 text-emerald-500 z-10 transition-transform hover:scale-110">
                  {selectedTrendIndices.has(idx) ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5 text-slate-600" />}
                </div>
              )}
              
              <div className="mb-4 pr-8">
                {isHot && (
                  <div className="inline-flex items-center gap-1 mb-2 px-2 py-0.5 rounded-full bg-orange-950/40 border border-orange-500/30 text-[10px] font-bold text-orange-400 uppercase tracking-wider animate-pulse">
                    <Flame className="w-3 h-3" /> Trending Now
                  </div>
                )}
                <h4 className="font-bold text-white text-lg leading-tight group-hover:text-emerald-400 transition-colors">{trend.title}</h4>
                <div className="flex flex-wrap items-center gap-2 mt-2 mb-3">
                   <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border ${trend.sentiment === 'Positive' ? 'bg-emerald-950/30 text-emerald-400 border-emerald-500/20' : trend.sentiment === 'Negative' ? 'bg-red-950/30 text-red-400 border-red-500/20' : 'bg-blue-950/30 text-blue-400 border-blue-500/20'}`}>
                      {getSentimentIcon(trend.sentiment)} {trend.sentiment || 'News'} Signal
                   </div>
                   {trend.date && (
                     <div className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-slate-950 border border-slate-800 flex items-center gap-1">
                       <Clock className="w-3 h-3" /> {trend.date}
                     </div>
                   )}
                </div>
                <div className="bg-slate-950/50 border-l-2 border-slate-700 pl-3 py-1.5 my-3">
                   <p className="text-sm text-slate-300 font-medium italic leading-snug line-clamp-2">"{trend.triggerEvent}"</p>
                </div>
              </div>
              
              <p className="text-sm text-slate-400 mb-4 flex-grow leading-relaxed line-clamp-3">{trend.description}</p>
              
              {/* Data Footer */}
              <div className="mt-auto pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono" title="Relevance Score">
                    <Activity className="w-3.5 h-3.5" /> {trend.relevanceScore}%
                  </div>
                  {sourceCount > 0 && (
                    <div className="flex items-center gap-1 text-[10px] text-slate-500" title="News Sources">
                      <Globe className="w-3 h-3" /> {sourceCount} Srcs
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={(e) => { e.stopPropagation(); onToggleExpand(trend, idx); }} 
                  className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors font-bold border border-slate-700 shadow-sm"
                >
                  <Newspaper className="w-3.5 h-3.5" /> {uiText.deepDive}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
