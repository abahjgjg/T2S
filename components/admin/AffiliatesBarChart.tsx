import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { CHART_COLORS } from '../../constants/chartConfig';

interface Props {
  data: any[];
}

export const AffiliatesBarChart: React.FC<Props> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.elements.grid} vertical={false} />
        <XAxis dataKey="name" stroke={CHART_COLORS.elements.axis} fontSize={10} tickLine={false} axisLine={false} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: CHART_COLORS.elements.tooltipBg, 
            borderColor: CHART_COLORS.elements.tooltipBorder, 
            color: CHART_COLORS.elements.tooltipText 
          }} 
        />
        <Bar dataKey="clicks" radius={[4, 4, 0, 0]} barSize={30}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={CHART_COLORS.cells.primary} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default AffiliatesBarChart;
