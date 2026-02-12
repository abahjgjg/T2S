import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { CHART_COLORS } from '../constants/chartConfig';

interface Props {
  data: any[];
  isSimulating: boolean;
}

export const RevenueChartComponents: React.FC<Props> = ({ data, isSimulating }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
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
          {!isSimulating && data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={CHART_COLORS.bars.alternate[index % 2]} />
          ))}
        </Bar>
        
        {isSimulating && (
          <Bar dataKey="Simulated" name="Forecast" fill={CHART_COLORS.bars.secondary} radius={[4, 4, 0, 0]} barSize={15} />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default RevenueChartComponents;
