/**
 * @fileoverview Application configuration
 */

export const appConfig = {
  port: Number(process.env.PORT) || 3000,
  storageDir: process.env.STORAGE_DIR || "./storage/images",
  imageExpiryDays: Number(process.env.IMAGE_EXPIRY_DAYS) || 30,
  baseUrl: process.env.BASE_URL || "http://localhost:3000",

  isDevelopment: () => process.env.NODE_ENV !== "production",
  isProduction: () => process.env.NODE_ENV === "production",
};

export type AppConfig = typeof appConfig;
