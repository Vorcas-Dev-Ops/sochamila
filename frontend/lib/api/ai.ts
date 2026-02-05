import api from "../axios";

/* ======================================================
   AI IMAGE GENERATION API
====================================================== */

interface GenerateImageRequest {
  prompt: string;
  aspectRatio?: "1:1" | "16:9" | "9:16" | "4:3" | "3:4";
  model?: "flux" | "sdxl";
}

interface GenerateImageResponse {
  success: boolean;
  url: string;
  prompt: string;
  model: string;
  error?: string;
}

/**
 * Generate an AI image from a text prompt
 * Calls backend which uses Replicate FLUX.1 model
 */
export async function generateAIImage(
  options: GenerateImageRequest
): Promise<GenerateImageResponse> {
  const response = await api.post<GenerateImageResponse>(
    "/ai/generate",
    options
  );
  return response.data;
}

/**
 * Generate image with default options (1:1, FLUX)
 */
export async function generateImage(prompt: string): Promise<string> {
  const result = await generateAIImage({ prompt });
  
  if (!result.success) {
    throw new Error(result.error || "Failed to generate image");
  }
  
  return result.url;
}
