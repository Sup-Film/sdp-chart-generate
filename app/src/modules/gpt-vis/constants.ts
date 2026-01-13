/**
 * @fileoverview Chart constants and configuration
 */

/**
 * Chart types supported by the SSR renderer
 */
export const SUPPORTED_CHART_TYPES = [
  "bar",
  "line",
  "pie",
  "area",
  "scatter",
  "column",
  "boxplot",
  "waterfall",
  "treemap",
  "liquid",
  "dual-axes",
  "histogram",
  "network-graph",
  "flow-diagram",
  "mind-map",
  "fishbone-diagram",
  "organization-chart",
] as const;

/**
 * Chart types NOT supported in SSR (require frontend @antv/gpt-vis)
 */
export const UNSUPPORTED_SSR_TYPES = [
  "indented-tree",
  "vis-text",
  "violin",
] as const;

/**
 * All known chart types
 */
export const ALL_CHART_TYPES = [
  ...SUPPORTED_CHART_TYPES,
  ...UNSUPPORTED_SSR_TYPES,
] as const;

// Type exports
export type SupportedChartType = (typeof SUPPORTED_CHART_TYPES)[number];
export type UnsupportedSSRType = (typeof UNSUPPORTED_SSR_TYPES)[number];
export type ChartType = (typeof ALL_CHART_TYPES)[number];
