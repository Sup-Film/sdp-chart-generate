/**
 * @fileoverview File-based image cache system
 * Stores images with JSON metadata files for caching and expiry
 */
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile, unlink, readdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { createHash } from "node:crypto";
import { appConfig } from "../config/app";

export interface ImageMetadata {
  id: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  createdAt: string;
  expiredAt: string;
  chartType: string;
  cacheKey: string;
}

/**
 * Creates cache key from chart data using SHA256 hash
 * @param data - Chart data to hash
 * @returns Hash string
 */
export function createCacheKey(data: unknown): string {
  return createHash("sha256").update(JSON.stringify(data)).digest("hex");
}

/**
 * Ensures storage directory exists
 */
async function ensureStorageDir(): Promise<void> {
  const dir = appConfig.storageDir;
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
}

/**
 * Gets metadata file path for an image
 */
function getMetadataPath(imageId: string): string {
  return join(appConfig.storageDir, `${imageId}.json`);
}

/**
 * Gets image file path
 */
function getImagePath(imageId: string): string {
  return join(appConfig.storageDir, `${imageId}.png`);
}

/**
 * File-based image cache service
 */
export abstract class ImageCache {
  /**
   * Find cached image by cache key
   * @param cacheKey - Hash of chart data
   * @returns Image metadata if found and not expired
   */
  static async findByCacheKey(cacheKey: string): Promise<ImageMetadata | null> {
    await ensureStorageDir();

    try {
      const files = await readdir(appConfig.storageDir);
      const metaFiles = files.filter((f) => f.endsWith(".json"));

      for (const file of metaFiles) {
        const metaPath = join(appConfig.storageDir, file);
        const content = await readFile(metaPath, "utf-8");
        const meta: ImageMetadata = JSON.parse(content);

        if (meta.cacheKey === cacheKey) {
          // Check expiry
          if (new Date() > new Date(meta.expiredAt)) {
            // Expired, clean up
            await ImageCache.delete(meta.id);
            return null;
          }
          return meta;
        }
      }
    } catch {
      // No cache found
    }

    return null;
  }

  /**
   * Find image metadata by ID
   */
  static async findById(imageId: string): Promise<ImageMetadata | null> {
    const metaPath = getMetadataPath(imageId);

    if (!existsSync(metaPath)) {
      return null;
    }

    try {
      const content = await readFile(metaPath, "utf-8");
      return JSON.parse(content) as ImageMetadata;
    } catch {
      return null;
    }
  }

  /**
   * Save image and metadata
   */
  static async save(
    imageId: string,
    buffer: Buffer,
    chartType: string,
    cacheKey: string
  ): Promise<ImageMetadata> {
    await ensureStorageDir();

    const imagePath = getImagePath(imageId);
    const metaPath = getMetadataPath(imageId);

    // Calculate expiry date
    const expiredAt = new Date();
    expiredAt.setDate(expiredAt.getDate() + appConfig.imageExpiryDays);

    const metadata: ImageMetadata = {
      id: imageId,
      fileName: `${imageId}.png`,
      filePath: imagePath,
      mimeType: "image/png",
      createdAt: new Date().toISOString(),
      expiredAt: expiredAt.toISOString(),
      chartType,
      cacheKey,
    };

    // Save image file
    await Bun.write(imagePath, buffer);

    // Save metadata file
    await writeFile(metaPath, JSON.stringify(metadata, null, 2), "utf-8");

    return metadata;
  }

  /**
   * Delete image and metadata
   */
  static async delete(imageId: string): Promise<boolean> {
    const imagePath = getImagePath(imageId);
    const metaPath = getMetadataPath(imageId);

    let deleted = false;

    try {
      if (existsSync(imagePath)) {
        await unlink(imagePath);
        deleted = true;
      }
    } catch {
      // Ignore file deletion errors
    }

    try {
      if (existsSync(metaPath)) {
        await unlink(metaPath);
        deleted = true;
      }
    } catch {
      // Ignore metadata deletion errors
    }

    return deleted;
  }

  /**
   * Check if image file exists on disk
   */
  static imageExists(imageId: string): boolean {
    return existsSync(getImagePath(imageId));
  }

  /**
   * Get image file path
   */
  static getFilePath(imageId: string): string {
    return getImagePath(imageId);
  }
}
