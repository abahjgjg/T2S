
import { SearchRegion, SearchTimeframe } from '../types';

export const REGIONS: SearchRegion[] = ['Global', 'USA', 'Indonesia', 'Europe', 'Asia'];

export const TIMEFRAMES: { label: string, value: SearchTimeframe }[] = [
  { label: '24 Hours', value: '24h' },
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '90 Days', value: '90d' }
];
