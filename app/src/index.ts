/**
 * @fileoverview Main application entry point
 * GPT-Vis Chart Generation Server
 */
import { Elysia } from "elysia";

import { appConfig } from "./config/app";
import { errorHandlerPlugin } from "./plugins/errorHandler.plugin";
import { swaggerPlugin } from "./plugins/swagger.plugin";
import { gptVisModule } from "./modules/gpt-vis";

const app = new Elysia()
  // Global error handler (must be registered before routes)
  .use(errorHandlerPlugin)

  // Swagger documentation (at /docs)
  .use(swaggerPlugin)

  // Health check
  .get(
    "/",
    () => ({
      service: "sdp-chart-generate",
      status: "healthy",
      timestamp: new Date().toISOString(),
    }),
    {
      detail: {
        summary: "Health check",
        description: "Returns service health status",
        tags: ["health"],
      },
    }
  )

  // Mount gpt-vis module under /api/v1
  .group("/api/v1", (app) => app.use(gptVisModule))

  .listen(appConfig.port);

console.log(
  `🦊 GPT-Vis Chart Server running at ${app.server?.hostname}:${app.server?.port}`
);
console.log(`📊 API Docs: http://localhost:${appConfig.port}/docs`);
