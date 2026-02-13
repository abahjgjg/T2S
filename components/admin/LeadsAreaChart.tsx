import React from 'react';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
import { CHART_COLORS } from '../../constants/chartConfig';
import { GRADIENT_OFFSETS } from '../../constants/displayLimits';

interface Props {
  data: any[];
}

export const LeadsAreaChart: React.FC<Props> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
            <stop offset={GRADIENT_OFFSETS.start} stopColor={CHART_COLORS.area.stroke} stopOpacity={CHART_COLORS.area.fillOpacity.start}/>
            <stop offset={GRADIENT_OFFSETS.end} stopColor={CHART_COLORS.area.stroke} stopOpacity={CHART_COLORS.area.fillOpacity.end}/>
          </linearGradient>
        </defs>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: CHART_COLORS.elements.tooltipBg, 
            borderColor: CHART_COLORS.elements.tooltipBorder, 
            color: CHART_COLORS.elements.tooltipText 
          }} 
        />
        <Area type="monotone" dataKey="count" stroke={CHART_COLORS.area.stroke} fillOpacity={1} fill="url(#colorCount)" />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default LeadsAreaChart;
