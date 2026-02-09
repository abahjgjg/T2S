import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { BarChart as BarChartIcon, RefreshCcw, Save, Calculator } from 'lucide-react';
import { Blueprint } from '../types';
import { usePreferences } from '../contexts/PreferencesContext';
import { CHART_COLORS } from '../constants/chartConfig';
import { SLIDER_RANGES } from '../constants/displayLimits';

interface Props {
  revenueStreams: Blueprint['revenueStreams'];
  onUpdate?: (streams: Blueprint['revenueStreams']) => void;
}

export const BlueprintRevenue: React.FC<Props> = ({ revenueStreams, onUpdate }) => {
  const { uiText } = usePreferences();
  const [trafficMultiplier, setTrafficMultiplier] = useState(1);
  const [pricingMultiplier, setPricingMultiplier] = useState(1);
  const [isSimulating, setIsSimulating] = useState(false);
  // Note: streams parameter is used in simulationData useMemo

  // Memoize simulated data to avoid recalcs on every render
  const simulationData = useMemo(() => {
    return revenueStreams.map(stream => {
      const simulated = Math.round(stream.projected * trafficMultiplier * pricingMultiplier);
      return {
        name: stream.name,
        Base: stream.projected,
        Simulated: simulated,
        growth: Math.round(((simulated - stream.projected) / stream.projected) * 100) || 0
      };
    });
  }, [revenueStreams, trafficMultiplier, pricingMultiplier]);

  const totalBase = useMemo(() => revenueStreams.reduce((acc, s) => acc + s.projected, 0), [revenueStreams]);
  const totalSimulated = useMemo(() => simulationData.reduce((acc, s) => acc + s.Simulated, 0), [simulationData]);
  const totalGrowth = totalBase === 0 ? 0 : Math.round(((totalSimulated - totalBase) / totalBase) * 100);

  const handleApply = () => {
    if (onUpdate) {
      const updatedStreams = simulationData.map(d => ({
        name: d.name,
        projected: d.Simulated
      }));
      onUpdate(updatedStreams);
      handleReset();
    }
  };

  const handleReset = () => {
    setTrafficMultiplier(1);
    setPricingMultiplier(1);
    setIsSimulating(false);
  };

  const toggleSimulation = () => {
    if (isSimulating) {
      handleReset();
    } else {
      setIsSimulating(true);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8 print:break-inside-avoid transition-all">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <BarChartIcon className="w-5 h-5 text-emerald-400" /> 
          {isSimulating ? "Revenue Simulator" : uiText.revProject}
        </h3>
        
        <div className="flex items-center gap-2">
          {isSimulating && (
            <button 
              onClick={handleApply}
              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors animate-[fadeIn_0.2s_ease-out]"
            >
              <Save className="w-3 h-3" /> Apply Scenario
            </button>
          )}
          <button 
            onClick={toggleSimulation}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
              isSimulating 
              ? 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white' 
              : 'bg-indigo-900/20 text-indigo-400 border-indigo-500/30 hover:bg-indigo-900/40'
            }`}
          >
            {isSimulating ? <RefreshCcw className="w-3 h-3" /> : <Calculator className="w-3 h-3" />}
            {isSimulating ? "Reset" : "Simulate Growth"}
          </button>
        </div>
      </div>

      {isSimulating && (
        <div className="mb-6 bg-slate-950/50 p-4 rounded-xl border border-indigo-500/20 animate-[slideUp_0.2s_ease-out]">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
               <div>
                 <label className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                   <span>Traffic / Volume</span>
                   <span className="text-indigo-400">{Math.round(trafficMultiplier * 100)}%</span>
                 </label>
                 <input 
                   type="range" 
                   min={SLIDER_RANGES.conversion.min}
                   max={SLIDER_RANGES.conversion.max}
                   step={SLIDER_RANGES.conversion.step}
                   value={trafficMultiplier}
                   onChange={(e) => setTrafficMultiplier(parseFloat(e.target.value))}
                   className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                 />
               </div>
               <div>
                 <label className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                   <span>Pricing / Conversion</span>
                   <span className="text-emerald-400">{Math.round(pricingMultiplier * 100)}%</span>
                 </label>
                 <input 
                   type="range" 
                   min={SLIDER_RANGES.price.min}
                   max={SLIDER_RANGES.price.max}
                   step={SLIDER_RANGES.price.step}
                   value={pricingMultiplier}
                   onChange={(e) => setPricingMultiplier(parseFloat(e.target.value))}
                   className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                 />
               </div>
           </div>
           
           <div className="flex justify-between items-center pt-2 border-t border-slate-800">
              <div className="text-xs text-slate-500">
                Baseline: <span className="font-mono text-slate-300">${totalBase.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="text-sm font-bold text-white">
                   Projected: <span className="font-mono text-emerald-400">${totalSimulated.toLocaleString()}</span>
                 </div>
                 <div className={`text-xs px-2 py-0.5 rounded font-mono ${totalGrowth >= 0 ? 'bg-emerald-900/30 text-emerald-400' : 'bg-red-900/30 text-red-400'}`}>
                   {totalGrowth >= 0 ? '+' : ''}{totalGrowth}%
                 </div>
              </div>
           </div>
        </div>
      )}

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={simulationData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
             <XAxis 
               dataKey="name" 
               stroke={CHART_COLORS.elements.axis}
               fontSize={12} 
               tickMargin={10} 
               angle={-15} 
               textAnchor="end"
               interval={0}
             />
             <YAxis stroke={CHART_COLORS.elements.axis} fontSize={12} tickFormatter={(value) => `$${value}`} />
             <Tooltip 
               contentStyle={{ 
                 backgroundColor: CHART_COLORS.elements.tooltipBg, 
                 borderColor: CHART_COLORS.elements.tooltipBorder, 
                 color: CHART_COLORS.elements.tooltipText 
               }}
               formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name]}
               cursor={{ fill: 'rgba(255,255,255,0.05)' }}
             />
             <Legend verticalAlign="top" height={36} iconType="circle" />
             
             <Bar dataKey="Base" name={isSimulating ? "Original" : "Revenue"} fill={CHART_COLORS.bars.primary} radius={[4, 4, 0, 0]} barSize={isSimulating ? 15 : 30}>
                {/* Apply color pattern only when not simulating for cleaner look */}
                {!isSimulating && simulationData.map((entry, index) => (
                   <Cell key={`cell-${index}`} fill={CHART_COLORS.bars.alternate[index % 2]} />
                ))}
             </Bar>
             
             {isSimulating && (
               <Bar dataKey="Simulated" name="Forecast" fill={CHART_COLORS.bars.secondary} radius={[4, 4, 0, 0]} barSize={15} />
             )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};