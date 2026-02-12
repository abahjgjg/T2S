import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { CHART_COLORS, CHART_RANGES } from '../constants/chartConfig';

interface Props {
  data: any[];
}

export const DashboardChart: React.FC<Props> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.elements.grid} horizontal={true} vertical={false} />
        <XAxis type="number" stroke={CHART_COLORS.elements.axis} fontSize={12} tickLine={false} axisLine={false} />
        <YAxis dataKey="name" type="category" width={100} stroke={CHART_COLORS.elements.axis} fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: CHART_COLORS.elements.tooltipBg, 
            borderColor: CHART_COLORS.elements.tooltipBorder, 
            color: CHART_COLORS.elements.tooltipText 
          }}
          cursor={{ fill: CHART_COLORS.elements.cursor }}
        />
        <Bar dataKey="votes" radius={[0, 4, 4, 0]} barSize={CHART_RANGES.BAR_SIZE}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={CHART_COLORS.cells.primary} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default DashboardChart;
