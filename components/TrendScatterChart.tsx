import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Label } from 'recharts';
import { COLORS } from '../constants/theme';
import { CHART_RANGES, CHART_MARGINS, CHART_GRID, CHART_AXIS } from '../constants/chartConfig';

interface ScatterDataItem {
  name: string;
  x: number;
  y: number;
  z: number;
  sentiment?: string;
}

interface Props {
  data: ScatterDataItem[];
  getSentimentColor: (sentiment?: string) => string;
}

export const TrendScatterChart: React.FC<Props> = ({ data, getSentimentColor }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={CHART_MARGINS.SCATTER}>
        <CartesianGrid strokeDasharray={CHART_GRID.strokeDasharray} stroke={COLORS.chart.grid} />
        <XAxis type="number" dataKey="x" name="Relevance" unit="%" stroke={COLORS.chart.axis} domain={[CHART_RANGES.SCORE.min, CHART_RANGES.SCORE.max]}>
          <Label value="Relevance" offset={-10} position="insideBottom" fill={COLORS.chart.axisLabel} fontSize={10} />
        </XAxis>
        <YAxis type="number" dataKey="y" name="Growth" unit="%" stroke={COLORS.chart.axis} domain={[CHART_RANGES.GROWTH.min, CHART_RANGES.GROWTH.max]}>
          <Label value="Growth/Hype" angle={-90} position="insideLeft" fill={COLORS.chart.axisLabel} fontSize={10} />
        </YAxis>
        <ZAxis type="number" dataKey="z" range={[CHART_RANGES.IMPACT_SIZE.min, CHART_RANGES.IMPACT_SIZE.max]} name="Impact" />
        <Tooltip contentStyle={{ backgroundColor: COLORS.chart.tooltipBg, borderColor: COLORS.chart.tooltipBorder, color: COLORS.chart.tooltipText }} />
        <Scatter name="Trends" data={data} fill={COLORS.sentiment.positive}>
          {data.map((entry, index) => <Cell key={`cell-${index}`} fill={getSentimentColor(entry.sentiment)} />)}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export default TrendScatterChart;
