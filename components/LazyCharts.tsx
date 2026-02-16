/**
 * Lazy Chart Components
 * BroCula: Wraps recharts components to prevent eager loading
 * Reduces initial bundle size by ~94KB
 */

import React, { Suspense } from 'react';


// Full screen loader for charts
const ChartLoader = () => (
  <div className="w-full h-full flex items-center justify-center bg-slate-800/50 rounded-lg">
    <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

// Lazy load chart components
const LazyTrendBarChart = React.lazy(() => import('./TrendBarChart'));
const LazyTrendScatterChart = React.lazy(() => import('./TrendScatterChart'));
const LazyAuditRadarChart = React.lazy(() => import('./AuditRadarChart'));
const LazyDashboardChart = React.lazy(() => import('./DashboardChart'));
const LazyRevenueChartComponents = React.lazy(() => import('./RevenueChartComponents'));

// Admin charts
const LazyAffiliatesBarChart = React.lazy(() => import('./admin/AffiliatesBarChart'));
const LazyLeadsAreaChart = React.lazy(() => import('./admin/LeadsAreaChart'));

// Wrapper components with Suspense
export const TrendBarChart: React.FC<any> = (props) => (
  <Suspense fallback={<ChartLoader />}>
    <LazyTrendBarChart {...props} />
  </Suspense>
);

export const TrendScatterChart: React.FC<any> = (props) => (
  <Suspense fallback={<ChartLoader />}>
    <LazyTrendScatterChart {...props} />
  </Suspense>
);

export const AuditRadarChart: React.FC<any> = (props) => (
  <Suspense fallback={<ChartLoader />}>
    <LazyAuditRadarChart {...props} />
  </Suspense>
);

export const DashboardChart: React.FC<any> = (props) => (
  <Suspense fallback={<ChartLoader />}>
    <LazyDashboardChart {...props} />
  </Suspense>
);

export const RevenueChartComponents: React.FC<any> = (props) => (
  <Suspense fallback={<ChartLoader />}>
    <LazyRevenueChartComponents {...props} />
  </Suspense>
);

// Admin chart wrappers
export const AffiliatesBarChart: React.FC<any> = (props) => (
  <Suspense fallback={<ChartLoader />}>
    <LazyAffiliatesBarChart {...props} />
  </Suspense>
);

export const LeadsAreaChart: React.FC<any> = (props) => (
  <Suspense fallback={<ChartLoader />}>
    <LazyLeadsAreaChart {...props} />
  </Suspense>
);
