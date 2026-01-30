/* =========================================================
   COMMON
========================================================= */

/** Product sides */
export type Side = "front" | "back" | "left" | "right";

/* =========================================================
   CORE LAYER BASE
========================================================= */

/**
 * Shared properties for all editor layers.
 * This is the single source of truth for positioning & state.
 */
export interface BaseLayer {
  /** Unique layer id */
  readonly id: string;

  /** Discriminant for union narrowing */
  readonly type: LayerType;

  /** Product side */
  side: Side;

  /** Canvas position */
  x: number;
  y: number;

  /** Dimensions */
  width: number;
  height: number;

  /** Transform */
  rotation: number; // degrees
  opacity: number;  // 0 → 1

  /** State */
  locked: boolean;
  visible: boolean;

  /** Render order (higher = top) */
  zIndex: number;
}

/* =========================================================
   LAYER TYPES
========================================================= */

export type LayerType = "text" | "image" | "sticker";

/* =========================================================
   TEXT LAYER
========================================================= */

export type TextAlign = "left" | "center" | "right";
export type TextStyle = "normal" | "shadow" | "outline" | "3d";

export interface TextLayer extends BaseLayer {
  readonly type: "text";

  /* ---------- Content ---------- */
  text: string;

  /* ---------- Typography ---------- */
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  color: string;

  /* ---------- Layout ---------- */
  textAlign: TextAlign;
  letterSpacing: number; // px
  lineHeight: number;    // unitless (1.2, 1.5...)

  /* ---------- Effects ---------- */
  textStyle: TextStyle;
  curve: number; // -180 → 180 (SVG arc / warp)
}

/* =========================================================
   IMAGE LAYER
========================================================= */

export interface ImageLayer extends BaseLayer {
  readonly type: "image";

  /** Image URL (upload / AI / CDN) */
  src: string;

  /** True if generated via AI */
  isAI?: boolean;
}

/* =========================================================
   STICKER LAYER
========================================================= */

export interface StickerLayer extends BaseLayer {
  readonly type: "sticker";

  /** Sticker image source */
  src: string;

  /** Reference to sticker database */
  stickerId?: string;
}

/* =========================================================
   DISCRIMINATED UNION (EDITOR CORE)
========================================================= */

export type EditorLayer =
  | TextLayer
  | ImageLayer
  | StickerLayer;

/* =========================================================
   TYPE GUARDS (SAFE NARROWING)
========================================================= */

export const isTextLayer = (layer: EditorLayer): layer is TextLayer =>
  layer.type === "text";

export const isImageLayer = (layer: EditorLayer): layer is ImageLayer =>
  layer.type === "image";

export const isStickerLayer = (layer: EditorLayer): layer is StickerLayer =>
  layer.type === "sticker";

/* =========================================================
   DESIGN MODEL (SAVE / LOAD)
========================================================= */

/**
 * Represents a saved editor design.
 * Can be persisted to DB or exported.
 */
export interface Design {
  readonly id: string;

  productId: string;
  variantId: string;

  /** All layers across all sides */
  layers: EditorLayer[];

  createdAt?: string;
  updatedAt?: string;
}
