import { Request, Response, NextFunction } from "express";
import { generateImage, generateImageSDXL } from "./ai.generate.service";

/* ======================================================
   AI IMAGE GENERATION CONTROLLER
====================================================== */

/**
 * POST /api/ai/generate
 * Generate an AI image from a text prompt
 */
export async function generateAIImage(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { prompt, model } = req.body;

    // Validate prompt
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({
        success: false,
        error: "Prompt is required",
      });
    }

    if (prompt.trim().length < 3) {
      return res.status(400).json({
        success: false,
        error: "Prompt must be at least 3 characters",
      });
    }

    if (prompt.length > 1000) {
      return res.status(400).json({
        success: false,
        error: "Prompt must be less than 1000 characters",
      });
    }

    // Generate image based on model selection
    const result =
      model === "sdxl"
        ? await generateImageSDXL({ prompt })
        : await generateImage({ prompt });

    res.json(result);
  } catch (error) {
    console.error("[AI Generation Error]", error);

    // Handle specific Replicate errors
    if (error instanceof Error) {
      if (error.message.includes("Invalid API token")) {
        return res.status(401).json({
          success: false,
          error: "Invalid API configuration",
        });
      }

      if (error.message.includes("rate limit")) {
        return res.status(429).json({
          success: false,
          error: "Rate limit exceeded. Please try again later.",
        });
      }

      if (error.message.includes("NSFW")) {
        return res.status(400).json({
          success: false,
          error: "Content policy violation. Please modify your prompt.",
        });
      }
    }

    res.status(500).json({
      success: false,
      error: "Failed to generate image. Please try again.",
    });
  }
}
