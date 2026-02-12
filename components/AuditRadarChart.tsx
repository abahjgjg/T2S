import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { CHART_COLORS } from '../constants/chartConfig';

interface Props {
  data: any[];
}

export const AuditRadarChart: React.FC<Props> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
        <PolarGrid stroke={CHART_COLORS.stroke.grid} />
        <PolarAngleAxis dataKey="subject" tick={{ fill: CHART_COLORS.stroke.axis, fontSize: 10, fontWeight: 'bold' }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
        <Radar
          name="Score"
          dataKey="A"
          stroke={CHART_COLORS.cells.primary}
          fill={CHART_COLORS.cells.primary}
          fillOpacity={0.4}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: CHART_COLORS.elements.tooltipBg, 
            borderColor: CHART_COLORS.elements.tooltipBorder, 
            color: CHART_COLORS.elements.tooltipText 
          }}
          itemStyle={{ color: CHART_COLORS.cells.secondary }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default AuditRadarChart;
