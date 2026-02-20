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
  } catch (error: any) {
    console.error("[AI Generation Error]", error);

    // Handle Gemini API quota/billing errors
    if (error?.status === 429 || error?.message?.includes("quota") || error?.message?.includes("RESOURCE_EXHAUSTED")) {
      const errorMessage = error?.error?.message || error?.message || "";
      
      if (errorMessage.includes("limit: 0") || errorMessage.includes("free_tier")) {
        return res.status(429).json({
          success: false,
          error: "Image generation quota limit is 0. This usually means Vertex AI API is not enabled or billing hasn't propagated yet.",
          details: [
            "1. Enable Vertex AI API: https://console.cloud.google.com/apis/library (search 'Vertex AI API')",
            "2. Ensure billing is enabled: https://console.cloud.google.com/billing",
            "3. Wait 5-10 minutes for changes to propagate",
            "4. See backend/docs/GEMINI_TROUBLESHOOTING.md for detailed steps"
          ],
          helpUrl: "https://ai.google.dev/gemini-api/docs/image-generation",
        });
      }
      
      return res.status(429).json({
        success: false,
        error: "Rate limit exceeded. Please try again later.",
        retryAfter: error?.error?.details?.[0]?.retryDelay || "60s",
      });
    }

    // Handle API key errors
    if (error?.message?.includes("API key") || error?.message?.includes("Invalid") || error?.status === 401) {
      return res.status(401).json({
        success: false,
        error: "Invalid API key. Please check your GEMINI_API_KEY in .env",
      });
    }

    // Handle other errors
    res.status(500).json({
      success: false,
      error: error?.message || "Failed to generate image. Please try again.",
    });
  }
}
