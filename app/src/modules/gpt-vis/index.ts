/**
 * @fileoverview GPT-Vis Controller (Elysia routes)
 * Handles HTTP routing, request validation, and response mapping
 */
import { Elysia } from "elysia";

import { ChartBodySchema, GptVisModel, type ChartBody } from "./model";
import { ChartService } from "./service";
import { errorHandlerPlugin } from "../../plugins/errorHandler.plugin";

/**
 * GPT-Vis Module - Chart Generation Controller
 *
 * Routes:
 * - POST / - Generate chart image
 * - GET /images/:id - Retrieve chart image
 * - DELETE /images/:id - Delete chart image
 */
export const gptVisModule = new Elysia({
  name: "GptVis.Module",
  prefix: "/generate-chart",
})
  // Use global error handler plugin
  .use(errorHandlerPlugin)

  // POST / - Generate chart image
  .post(
    "/",
    async ({ body }): Promise<{ success: boolean; resultObj: string }> => {
      return ChartService.generateChart(body as ChartBody);
    },
    {
      body: ChartBodySchema,
      detail: {
        summary: "Generate chart image",
        description:
          "Renders a chart from the provided data and returns the image URL. Results are cached.",
        tags: ["generate-chart"],
      },
    }
  )

  // GET /images/:id - Retrieve chart image
  .get(
    "/images/:id",
    async ({ params: { id } }) => {
      const { buffer, mimeType } = await ChartService.getImage(id);

      return new Response(buffer, {
        headers: {
          "Content-Type": mimeType,
          "Content-Length": buffer.byteLength.toString(),
          "Cache-Control": "public, max-age=86400",
        },
      });
    },
    {
      params: GptVisModel.imageIdParam,
      detail: {
        summary: "Retrieve chart image",
        description: "Returns the generated chart image by ID",
        tags: ["generate-chart"],
      },
    }
  )

  // DELETE /images/:id - Delete chart image
  .delete(
    "/images/:id",
    async ({ params: { id } }) => {
      return ChartService.deleteImage(id);
    },
    {
      params: GptVisModel.imageIdParam,
      detail: {
        summary: "Delete chart image",
        description: "Removes the chart image and its metadata",
        tags: ["generate-chart"],
      },
    }
  );
