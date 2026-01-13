/**
 * @fileoverview Swagger Plugin Configuration
 * Following Elysia Swagger documentation patterns
 * @see https://elysiajs.com/plugins/swagger
 */
import { swagger } from "@elysiajs/swagger";

/**
 * Swagger Plugin for GPT-Vis API Documentation
 *
 * Usage: .use(swaggerPlugin) in main app
 */
export const swaggerPlugin = swagger({
  path: "/docs",
  documentation: {
    info: {
      title: "GPT-Vis Chart Generation API",
      version: "1.0.0",
      description:
        "Server-side rendering for GPT-Vis charts with caching and validation",
    },
    tags: [
      {
        name: "generate-chart",
        description: "Chart generation, retrieval, and deletion endpoints",
      },
      {
        name: "health",
        description: "Health check endpoint",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Bearer token authentication",
        },
      },
    },
  },
});
