/**
 * @fileoverview MCP-compatible Error Handler Plugin
 * For chart generation endpoints that need MCP response format
 */
import { Elysia, ValidationError } from "elysia";
import { appConfig } from "../config/app";
import { logger } from "./logger.plugin";

// Define types for safe casting
interface AppError extends Error {
  status?: number;
  statusCode?: number;
}

// Define the shape of a single validation error item
interface ValidatorErrorItem {
  path: string;
  message: string;
  summary?: string;
  type?: string;
}

export const mcpErrorHandlerPlugin = (app: Elysia) =>
  app.onError((handler) => {
    const { error, set, code, request } = handler;

    // Default error values
    let statusCode = 500;
    let message = "Internal server error";
    let stack: string | undefined;

    // ---------------------------------------------------------
    // 1. Handle Elysia Validation Errors
    // ---------------------------------------------------------
    if (code === "VALIDATION") {
      statusCode = 400;
      message = "Validation failed";

      // Explicitly cast to ValidationError
      const elysiaError = error as ValidationError;

      if (elysiaError.all) {
        const validationErrors = (
          elysiaError.all as unknown as ValidatorErrorItem[]
        ).map((err) => {
          const rawPath = err.path || "";
          const field = rawPath.startsWith("/")
            ? rawPath.slice(1).replace(/\//g, ".")
            : rawPath;

          let msg = err.message || err.summary || "Invalid value";
          if (msg.includes("Expected union value")) {
            msg = "Invalid data format for the specified type";
          }

          return { field: field || "unknown", message: msg };
        });

        if (validationErrors.length > 0) {
          message = `${validationErrors[0].field}: ${validationErrors[0].message}`;
        }
      }
    }
    // ---------------------------------------------------------
    // 2. Handle Custom AppError
    // ---------------------------------------------------------
    else if (
      typeof error === "object" &&
      error !== null &&
      ("status" in error || "statusCode" in error)
    ) {
      const appErr = error as AppError;
      statusCode = appErr.status || appErr.statusCode || 500;
      message = appErr.message || "Unknown Application Error";
    }
    else if (error instanceof Error) {
      message = error.message;
      stack = error.stack;
    }
    else {
      message = String(error) || "Unknown Error";
    }

    // Always return HTTP 200 with MCP format (MCP clients expect 200)
    set.status = 200;

    const logContext = {
      method: request?.method,
      path: request?.url,
      statusCode,
      message,
      stack,
    };

    if (statusCode >= 500) {
      logger.error("Server Error", logContext);
    } else {
      logger.warn("Client Error", logContext);
    }

    // MCP-compatible response format
    return {
      success: false,
      resultObj: "",
      errorMessage: message,
    };
  });