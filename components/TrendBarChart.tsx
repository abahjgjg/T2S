import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { COLORS } from '../constants/theme';
import { CHART_RANGES, CHART_MARGINS, CHART_AXIS, CHART_GRID } from '../constants/chartConfig';

interface ChartDataItem {
  name: string;
  fullName: string;
  score: number;
  sentiment?: string;
}

interface Props {
  data: ChartDataItem[];
  getSentimentColor: (sentiment?: string) => string;
}

export const TrendBarChart: React.FC<Props> = ({ data, getSentimentColor }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={CHART_MARGINS.DEFAULT}>
        <CartesianGrid strokeDasharray={CHART_GRID.strokeDasharray} stroke={COLORS.chart.grid} horizontal={CHART_GRID.horizontal} vertical={CHART_GRID.vertical} />
        <XAxis type="number" domain={[CHART_RANGES.SCORE.min, CHART_RANGES.SCORE.max]} stroke={COLORS.chart.axis} fontSize={CHART_AXIS.fontSize} tickLine={CHART_AXIS.tickLine} axisLine={CHART_AXIS.axisLine} />
        <YAxis dataKey="name" type="category" width={120} stroke={COLORS.slate[400]} fontSize={CHART_AXIS.fontSize} tickLine={CHART_AXIS.tickLine} axisLine={CHART_AXIS.axisLine} />
        <Tooltip contentStyle={{ backgroundColor: COLORS.chart.tooltipBg, borderColor: COLORS.chart.tooltipBorder, color: COLORS.chart.tooltipText }} />
        <Bar dataKey="score" radius={CHART_RANGES.BAR_RADIUS} barSize={CHART_RANGES.BAR_SIZE}>
          {data.map((entry, index) => <Cell key={`cell-${index}`} fill={getSentimentColor(entry.sentiment)} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TrendBarChart;
