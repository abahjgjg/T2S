
import { SearchRegion, SearchTimeframe } from '../types';

export const REGIONS: SearchRegion[] = ['Global', 'USA', 'Indonesia', 'Europe', 'Asia'];

export const TIMEFRAMES: { label: string, value: SearchTimeframe }[] = [
  { label: '24 Hours', value: '24h' },
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '90 Days', value: '90d' }
];

export const getDynamicTopics = (): string[] => {
  const now = new Date();
  const year = now.getFullYear();
  const nextYear = year + 1;

  return [
    // Tech & AI
    `AI Regulation ${year}`, 
    `Generative AI Copyright`, 
    `Tech IPOs ${nextYear}`, 
    `Quantum Computing ${year}`, 
    "Semiconductor Supply Chain",
    // Finance & Crypto
    "Crypto Market Shifts", 
    "Central Bank Digital Currencies", 
    "Fintech Lending Regulations", 
    "Global Inflation Trends",
    // Business & Work
    "Remote Work Laws", 
    "SaaS Pricing Trends", 
    "Corporate ESG Mandates", 
    "Gig Economy Labor Laws",
    // Sustainability & Science
    "Green Energy Policy", 
    "Biotech Breakthroughs", 
    "EV Market Saturation", 
    "Carbon Credit Markets"
  ];
};
