import { Side, EditorLayer } from "@/types/editor";

export type PrintProfile = {
  id: string;
  label: string;
  sides: Side[];
  masks: Record<Side, string>;
  printAreaRatio: Record<
    Side,
    { x: number; y: number; w: number; h: number }
  >;
  canvasDimensions: { width: number; height: number };
  minFontSize?: number;
  maxFontSize?: number;
  safetyMargin?: number;
};

export const PRINT_PROFILES: Record<string, PrintProfile> = {
  tshirt: {
    id: "tshirt",
    label: "T-Shirt",
    sides: ["front", "back", "left", "right"],
    canvasDimensions: { width: 800, height: 1000 },
    minFontSize: 12,
    maxFontSize: 120,
    safetyMargin: 20,

    masks: {
      front: "/masks/tshirt/front.png",
      back: "/masks/tshirt/back.png",
      left: "/masks/tshirt/left.png",
      right: "/masks/tshirt/right.png",
    },

    printAreaRatio: {
      /* Main body */
      front: { x: 0.24, y: 0.22, w: 0.52, h: 0.64 },
      back:  { x: 0.24, y: 0.22, w: 0.52, h: 0.64 },

      /* Sleeves */
      left:  { x: 0.30, y: 0.30, w: 0.40, h: 0.40 },
      right: { x: 0.30, y: 0.30, w: 0.40, h: 0.40 },
    },
  },

  jersey: {
    id: "jersey",
    label: "Jersey",
    sides: ["front", "back"],
    canvasDimensions: { width: 800, height: 1000 },
    minFontSize: 14,
    maxFontSize: 130,
    safetyMargin: 15,

    masks: {
      front: "/masks/jersey/front.webp",
      back: "/masks/jersey/back.webp",
      left: "/masks/jersey/left.webp",
      right: "/masks/jersey/right.webp",
    },

    printAreaRatio: {
      front: { x: 0.20, y: 0.18, w: 0.60, h: 0.70 },
      back:  { x: 0.20, y: 0.18, w: 0.60, h: 0.70 },

      left:  { x: 0.32, y: 0.32, w: 0.36, h: 0.36 },
      right: { x: 0.32, y: 0.32, w: 0.36, h: 0.36 },
    },
  },

  hoodie: {
    id: "hoodie",
    label: "Hoodie",
    sides: ["front", "back", "left", "right"],
    canvasDimensions: { width: 800, height: 1000 },
    minFontSize: 10,
    maxFontSize: 110,
    safetyMargin: 25,

    masks: {
      front: "/masks/hoodie/front.png",
      back: "/masks/hoodie/back.png",
      left: "/masks/hoodie/left.png",
      right: "/masks/hoodie/right.png",
    },

    printAreaRatio: {
      front: { x: 0.26, y: 0.28, w: 0.48, h: 0.50 },
      back:  { x: 0.26, y: 0.28, w: 0.48, h: 0.50 },

      left:  { x: 0.34, y: 0.34, w: 0.32, h: 0.32 },
      right: { x: 0.34, y: 0.34, w: 0.32, h: 0.32 },
    },
  },
};

/* =========================================================
   AUTO-ADJUSTMENT UTILITIES
========================================================= */

/**
 * Get absolute print area dimensions for a product and side
 */
export function getPrintArea(
  profileId: string,
  side: Side
): { x: number; y: number; w: number; h: number } | null {
  const profile = PRINT_PROFILES[profileId];
  if (!profile) return null;

  const ratio = profile.printAreaRatio[side];
  if (!ratio) return null;

  const { width, height } = profile.canvasDimensions;
  return {
    x: ratio.x * width,
    y: ratio.y * height,
    w: ratio.w * width,
    h: ratio.h * height,
  };
}

/**
 * Check if a layer fits within the print area
 */
export function isLayerInPrintArea(
  profileId: string,
  side: Side,
  layer: { x: number; y: number; width: number; height: number }
): boolean {
  const printArea = getPrintArea(profileId, side);
  if (!printArea) return false;

  const margin = PRINT_PROFILES[profileId]?.safetyMargin || 0;

  return (
    layer.x >= printArea.x + margin &&
    layer.y >= printArea.y + margin &&
    layer.x + layer.width <= printArea.x + printArea.w - margin &&
    layer.y + layer.height <= printArea.y + printArea.h - margin
  );
}

/**
 * Auto-adjust layer to fit within print area
 */
export function autoAdjustLayer(
  profileId: string,
  side: Side,
  layer: { x: number; y: number; width: number; height: number }
): { x: number; y: number; width: number; height: number } {
  const profile = PRINT_PROFILES[profileId];
  const printArea = getPrintArea(profileId, side);

  if (!profile || !printArea) return layer;

  const margin = profile.safetyMargin || 0;
  const minX = printArea.x + margin;
  const minY = printArea.y + margin;
  const maxX = printArea.x + printArea.w - margin;
  const maxY = printArea.y + printArea.h - margin;

  let { x, y, width, height } = layer;

  // If layer is too wide, scale it down
  if (width > maxX - minX) {
    const scale = (maxX - minX) / width;
    width *= scale;
    height *= scale;
  }

  // If layer is too tall, scale it down
  if (height > maxY - minY) {
    const scale = (maxY - minY) / height;
    width *= scale;
    height *= scale;
  }

  // Clamp position to bounds
  x = Math.max(minX, Math.min(x, maxX - width));
  y = Math.max(minY, Math.min(y, maxY - height));

  return { x, y, width, height };
}

/**
 * Center layer within print area
 */
export function centerLayerInPrintArea(
  profileId: string,
  side: Side,
  layer: { x: number; y: number; width: number; height: number }
): { x: number; y: number } {
  const printArea = getPrintArea(profileId, side);
  if (!printArea) return { x: layer.x, y: layer.y };

  const centerX = printArea.x + printArea.w / 2 - layer.width / 2;
  const centerY = printArea.y + printArea.h / 2 - layer.height / 2;

  return { x: centerX, y: centerY };
}

/**
 * Validate and clamp text font size for product
 */
export function getOptimalFontSize(
  profileId: string,
  requestedSize: number
): number {
  const profile = PRINT_PROFILES[profileId];
  if (!profile) return requestedSize;

  const min = profile.minFontSize || 8;
  const max = profile.maxFontSize || 200;

  return Math.max(min, Math.min(requestedSize, max));
}

/**
 * Get product by ID
 */
export function getProfile(profileId: string): PrintProfile | null {
  return PRINT_PROFILES[profileId] || null;
}
