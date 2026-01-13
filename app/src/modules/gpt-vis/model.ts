/**
 * @fileoverview Chart validation schemas (DTOs)
 * Uses Elysia's t (TypeBox) for validation
 * Based on original sdp-ai/src/handlers/gpt-vis/types.ts
 */
import { t } from "elysia";

// Array-based charts (bar, line, pie, etc.)
export const ChartWithArrayData = t.Object({
  type: t.String(),
  data: t.Array(t.Record(t.String(), t.Any())),
});

// Object-based charts (networks, trees, diagrams)
export const ChartWithObjectData = t.Object({
  type: t.String(),
  data: t.Object({}, { additionalProperties: true }),
});

// Liquid chart (percent-based)
export const LiquidChart = t.Object({
  type: t.Literal("liquid"),
  percent: t.Number({ minimum: 0, maximum: 1 }),
});

// Text chart
export const VisTextChart = t.Object({
  type: t.Literal("vis-text"),
  children: t.Optional(t.String()),
});

// Dual Axes chart series item
export const DualAxesSeriesItem = t.Object({
  type: t.Union([t.Literal("column"), t.Literal("line")]),
  data: t.Array(t.Number()),
  axisYTitle: t.Optional(t.String()),
});

// Dual Axes chart
export const DualAxesChart = t.Object({
  type: t.Literal("dual-axes"),
  categories: t.Array(t.String()),
  series: t.Array(DualAxesSeriesItem),
  title: t.Optional(t.String()),
  axisXTitle: t.Optional(t.String()),
  legendTypeList: t.Optional(t.Array(t.String())),
  style: t.Optional(
    t.Object({
      backgroundColor: t.Optional(t.String()),
      palette: t.Optional(t.Array(t.String())),
      texture: t.Optional(t.Union([t.Literal("rough"), t.Literal("default")])),
      startAtZero: t.Optional(t.Boolean()),
    })
  ),
});

// Boxplot data item
export const DistributionDataItem = t.Object({
  category: t.String(),
  value: t.Number(),
  group: t.Optional(t.String()),
});

// Distribution chart (boxplot, violin) - requires multiple values per category
export const DistributionChart = t.Object({
  type: t.Union([t.Literal("boxplot"), t.Literal("violin")]),
  data: t.Array(DistributionDataItem),
  title: t.Optional(t.String()),
  axisXTitle: t.Optional(t.String()),
  axisYTitle: t.Optional(t.String()),
});

// Histogram chart
export const HistogramChart = t.Object({
  type: t.Literal("histogram"),
  data: t.Array(t.Number()),
  binNumber: t.Optional(t.Number()),
});

// Main schema - union of all chart types
export const ChartBodySchema = t.Union([
  DistributionChart,
  DualAxesChart,
  LiquidChart,
  VisTextChart,
  HistogramChart,
  ChartWithObjectData,
  ChartWithArrayData,
]);

// Type exports using typeof schema.static
export type ChartBody = typeof ChartBodySchema.static;
export type DistributionData = typeof DistributionDataItem.static;

/**
 * Response schemas
 */
export namespace GptVisModel {
  export const generateResponse = t.Object({
    success: t.Boolean(),
    resultObj: t.String(),
  });
  export type GenerateResponse = typeof generateResponse.static;

  export const deleteResponse = t.Object({
    success: t.Boolean(),
    message: t.String(),
  });
  export type DeleteResponse = typeof deleteResponse.static;

  export const imageIdParam = t.Object({
    id: t.String({
      pattern: "^img_[a-zA-Z0-9_-]+$",
      error: "Image ID must start with 'img_'",
    }),
  });
  export type ImageIdParam = typeof imageIdParam.static;
}
