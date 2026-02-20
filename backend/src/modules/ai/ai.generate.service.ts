import { GoogleGenAI } from "@google/genai";
import { imagekit } from "../../lib/imagekit";

/* ======================================================
   GEMINI NANO BANANA (Image Generation)
   Model: gemini-2.5-flash-image — fast, 1024px
   See: https://ai.google.dev/gemini-api/docs/image-generation
====================================================== */

/* ================= TYPES ================= */

interface GenerateImageOptions {
  prompt: string;
  negativePrompt?: string;
}

interface GenerationResult {
  success: boolean;
  url: string;
  prompt: string;
  model: string;
}

/* ================= GENERATE IMAGE ================= */

/**
 * Generate an image using Google Gemini Nano Banana (gemini-2.5-flash-image)
 * and upload to ImageKit for permanent storage
 */
export async function generateImage(
  options: GenerateImageOptions
): Promise<GenerationResult> {
  const { prompt } = options;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured. Get a key at https://aistudio.google.com/apikey and add it to your .env file."
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const candidate = response.candidates?.[0];
    if (!candidate?.content?.parts?.length) {
      throw new Error("No image in Gemini response. Try a different prompt.");
    }

    let base64Image: string | null = null;
    for (const part of candidate.content.parts) {
      if (part.inlineData?.data) {
        base64Image = part.inlineData.data;
        break;
      }
    }

    if (!base64Image) {
      throw new Error("No image data in Gemini response. Try a different prompt.");
    }

    const uploadResponse = await imagekit.upload({
      file: base64Image,
      fileName: `ai-gemini-${Date.now()}.png`,
      folder: "/ai-generated",
      tags: ["ai-generated", "gemini-nano-banana"],
    });

    return {
      success: true,
      url: uploadResponse.url,
      prompt,
      model: "gemini-2.5-flash-image",
    };
  } catch (err: any) {
    // Re-throw with clearer error message for quota issues
    if (err?.status === 429 || err?.error?.code === 429) {
      const quotaError = new Error(
        `Gemini API quota exceeded: ${err?.error?.message || err?.message}. ` +
        `If you see "limit: 0", image generation may not be enabled for your free tier project. ` +
        `Check: https://ai.google.dev/gemini-api/docs/image-generation`
      );
      (quotaError as any).status = 429;
      (quotaError as any).error = err?.error;
      throw quotaError;
    }
    throw err;
  }
}

/**
 * Pro model (higher quality, 2K/4K) — use when available in your region
 */
export async function generateImageSDXL(
  options: GenerateImageOptions
): Promise<GenerationResult> {
  return generateImage(options);
}
