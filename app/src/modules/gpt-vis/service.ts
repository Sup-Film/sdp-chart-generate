/**
 * @fileoverview GPT-Vis Chart Service
 * Business logic decoupled from Elysia controller
 */
import { render } from "@antv/gpt-vis-ssr";
import { nanoid } from "nanoid";
import { existsSync } from "node:fs";

import {
  ImageCache,
  createCacheKey,
  type ImageMetadata,
} from "../../cache/imageCache";
import { ErrorResponse } from "../../errors";
import { SUPPORTED_CHART_TYPES, UNSUPPORTED_SSR_TYPES } from "./constants";
import type { ChartBody, DistributionData } from "./model";
import { logger } from "../../plugins/logger.plugin";

/**
 * Validates distribution charts have sufficient data points
 */
function validateDistributionChart(
  type: string,
  data: DistributionData[]
): string | null {
  if (!["boxplot", "violin"].includes(type)) {
    return null;
  }

  const categoryCounts = data.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const invalidCategories = Object.entries(categoryCounts)
    .filter(([, count]) => count < 2)
    .map(([cat]) => cat);

  if (invalidCategories.length > 0) {
    return (
      `Chart type '${type}' requires multiple values per category. ` +
      `Categories with insufficient data: ${invalidCategories.join(", ")}. ` +
      `Use 'bar' chart for single values per category.`
    );
  }

  return null;
}

/**
 * Gets appropriate error message for chart rendering failures
 */
function getChartErrorMessage(type: string): string {
  if (
    UNSUPPORTED_SSR_TYPES.includes(
      type as (typeof UNSUPPORTED_SSR_TYPES)[number]
    )
  ) {
    return (
      `Chart type '${type}' is not supported in SSR. ` +
      `Use frontend @antv/gpt-vis instead.`
    );
  }

  if (
    SUPPORTED_CHART_TYPES.includes(
      type as (typeof SUPPORTED_CHART_TYPES)[number]
    )
  ) {
    return `Cannot render ${type} chart with the provided data structure.`;
  }

  return `Unsupported chart type: '${type}'. Supported: ${SUPPORTED_CHART_TYPES.join(
    ", "
  )}`;
}

/**
 * Validates image ID format
 */
function isValidImageId(id: string): boolean {
  return /^img_[a-zA-Z0-9_-]+$/.test(id);
}

export interface GenerateChartResult {
  success: boolean;
  resultObj: string;
}

export interface GetImageResult {
  buffer: ArrayBuffer;
  mimeType: string;
}

/**
 * Chart generation service (abstract class - no instance allocation)
 */
export abstract class ChartService {
  /**
   * Generate chart image from data
   */
  static async generateChart(body: ChartBody): Promise<GenerateChartResult> {
    const { type } = body;

    // Check cache first
    const cacheKey = createCacheKey(body);
    const cachedImage = await ImageCache.findByCacheKey(cacheKey);

    if (cachedImage) {
      logger.debug("Cache hit", { imageId: cachedImage.id, chartType: type });
      return {
        success: true,
        resultObj: `/api/v1/generate-chart/images/${cachedImage.id}`,
      };
    }

    // Validate distribution charts
    const data = "data" in body ? body.data : undefined;
    if (["boxplot", "violin"].includes(type) && Array.isArray(data)) {
      const validationError = validateDistributionChart(
        type,
        data as DistributionData[]
      );
      if (validationError) {
        throw new ErrorResponse({
          name: "BAD_REQUEST",
          message: validationError,
        });
      }
    }

    // Render chart
    const renderOptions = body as Parameters<typeof render>[0];
    const result = await render(renderOptions);

    if (!result) {
      logger.error("Chart rendering failed", { chartType: type });
      throw new ErrorResponse({
        name: "BAD_REQUEST",
        message: getChartErrorMessage(type),
      });
    }

    // Save image
    const buffer = result.toBuffer();
    const imageId = `img_${nanoid()}`;

    const metadata = await ImageCache.save(imageId, buffer, type, cacheKey);
    logger.info("Chart generated", { imageId, chartType: type });

    return {
      success: true,
      resultObj: `/api/v1/generate-chart/images/${imageId}`,
    };
  }

  /**
   * Retrieve cached image by ID
   */
  static async getImage(imageId: string): Promise<GetImageResult> {
    if (!isValidImageId(imageId)) {
      throw new ErrorResponse({
        name: "BAD_REQUEST",
        message: "Invalid image ID format",
      });
    }

    const metadata = await ImageCache.findById(imageId);

    if (!metadata) {
      throw new ErrorResponse({
        name: "NOT_FOUND",
        message: "Image not found",
      });
    }

    if (!ImageCache.imageExists(imageId)) {
      logger.error("Image file missing", { imageId });
      throw new ErrorResponse({
        name: "NOT_FOUND",
        message: "Image file not found on disk",
      });
    }

    // Check expiry
    if (new Date() > new Date(metadata.expiredAt)) {
      await ImageCache.delete(imageId);
      throw new ErrorResponse({ name: "GONE", message: "Image has expired" });
    }

    const file = Bun.file(metadata.filePath);
    const buffer = await file.arrayBuffer();

    return {
      buffer,
      mimeType: metadata.mimeType,
    };
  }

  /**
   * Delete image by ID
   */
  static async deleteImage(
    imageId: string
  ): Promise<{ success: boolean; message: string }> {
    if (!isValidImageId(imageId)) {
      throw new ErrorResponse({
        name: "BAD_REQUEST",
        message: "Invalid image ID format",
      });
    }

    const metadata = await ImageCache.findById(imageId);

    if (!metadata) {
      throw new ErrorResponse({
        name: "NOT_FOUND",
        message: "Image not found",
      });
    }

    const deleted = await ImageCache.delete(imageId);

    if (!deleted) {
      throw new ErrorResponse({
        name: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete image",
      });
    }

    logger.info("Image deleted", { imageId });

    return {
      success: true,
      message: "Image deleted successfully",
    };
  }
}
