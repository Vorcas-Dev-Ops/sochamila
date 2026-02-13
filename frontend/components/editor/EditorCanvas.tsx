"use client";

import React, { useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Rnd } from "react-rnd";

import {
  EditorLayer,
  Side,
  TextLayer,
  isTextLayer,
} from "@/types/editor";

import { loadGoogleFont } from "@/utils/loadGoogleFont";
import { PRINT_PROFILES } from "@/config/printProfiles";

/* ======================================================
   TYPES
====================================================== */

type ImageWithView = { image: string; view?: string };

interface EditorCanvasProps {
  product: {
    type?: keyof typeof PRINT_PROFILES;
    images: string[] | ImageWithView[];
    imagesWithView?: ImageWithView[];
  };
  side: Side;
  selectedColor: string;

  layers: EditorLayer[];
  selectedLayerId: string | null;
  setSelectedLayerId: (id: string | null) => void;

  updateLayer: <T extends EditorLayer["type"]>(
    id: string,
    type: T,
    patch: Omit<
      Partial<Extract<EditorLayer, { type: T }>>,
      "type"
    >
  ) => void;

  deleteLayer: (id: string) => void;
}

/* ======================================================
   CONSTANTS
====================================================== */

const API_URL = "http://localhost:5000";
const CANVAS_SIZE = { w: 420, h: 520 };
const DEFAULT_TEXT_SIZE = { w: 200, h: 80 };

/* ======================================================
   HELPERS
====================================================== */

function toFullUrl(path: string): string {
  if (path.startsWith("http")) return path;
  if (path.startsWith("/uploads/")) return `${API_URL}${path}`;
  if (path.startsWith("/")) return `${API_URL}${path}`;
  return `${API_URL}/uploads/${path}`;
}

function resolveProductImage(
  imagesWithView: ImageWithView[] | undefined,
  fallbackImages: string[] | ImageWithView[],
  side: Side
): string | null {
  // Prefer images with view (front, back, left, right) from API
  if (imagesWithView?.length) {
    const sideUpper = side.toUpperCase();
    const match = imagesWithView.find(
      (img) => img.view?.toUpperCase() === sideUpper
    );
    if (match?.image) return toFullUrl(match.image);
    // Fallback: use sort order 0=front, 1=back, 2=left, 3=right
    const order = ["front", "back", "left", "right"].indexOf(side);
    if (order >= 0 && imagesWithView[order]?.image) {
      return toFullUrl(imagesWithView[order].image);
    }
    if (imagesWithView[0]?.image) return toFullUrl(imagesWithView[0].image);
  }

  // Legacy: no view info, use first image for all sides
  const flat = Array.isArray(fallbackImages) ? fallbackImages : [];
  if (!flat.length) return null;
  const first = flat[0];
  const path = typeof first === "string" ? first : (first as ImageWithView).image;
  return path ? toFullUrl(path) : null;
}

/* ======================================================
   COMPONENT
====================================================== */

const EditorCanvas = React.forwardRef<HTMLDivElement, EditorCanvasProps>(
  function EditorCanvas({
    product,
    side,
    selectedColor,
    layers,
    selectedLayerId,
    setSelectedLayerId,
    updateLayer,
    deleteLayer,
  }, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] =
    useState(CANVAS_SIZE);

  /* ================= FORWARD REF ================= */
  useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

  /* ================= DELETE KEY ================= */

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedLayerId
      ) {
        deleteLayer(selectedLayerId);
      }
    };

    window.addEventListener("keydown", handler);
    return () =>
      window.removeEventListener("keydown", handler);
  }, [selectedLayerId, deleteLayer]);

  /* ================= PROFILE ================= */

  const profile =
    PRINT_PROFILES[product.type ?? "tshirt"];

  const ratio = profile.printAreaRatio[side];
  const maskSrc = profile.masks[side];

  const printArea = useMemo(
    () => ({
      x: containerSize.w * ratio.x,
      y: containerSize.h * ratio.y,
      w: containerSize.w * ratio.w,
      h: containerSize.h * ratio.h,
    }),
    [containerSize, ratio]
  );

  /* ================= PRODUCT IMAGE ================= */

  const productImage = useMemo(
    () =>
      resolveProductImage(
        product.imagesWithView,
        product.images,
        side
      ),
    [product.imagesWithView, product.images, side]
  );

  /* ================= VISIBLE LAYERS ================= */

  const visibleLayers = useMemo(
    () =>
      layers
        .filter(
          (layer: EditorLayer) =>
            layer.side === side &&
            layer.visible !== false
        )
        .sort(
          (a: EditorLayer, b: EditorLayer) =>
            a.zIndex - b.zIndex
        ),
    [layers, side]
  );

  /* ================= RESIZE OBSERVER ================= */

  useEffect(() => {
    if (!containerRef.current) return;

    const el = containerRef.current;
    const ro = new ResizeObserver(() => {
      setContainerSize({
        w: el.clientWidth,
        h: el.clientHeight,
      });
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* ======================================================
     UI
  ====================================================== */

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-100 px-8 sticky top-0">
      <div
        ref={containerRef}
        className="relative w-[420px] h-[520px] bg-white rounded-2xl shadow-xl"
        onMouseDown={() => setSelectedLayerId(null)}
      >
        {/* PRODUCT IMAGE */}
        {productImage ? (
          <img
            src={productImage}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            draggable={false}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500 text-sm">
            No product image - Design with AI
          </div>
        )}

        {/* MASK */}
        <div
          className="absolute inset-0"
          style={{
            WebkitMaskImage: `url(${maskSrc})`,
            maskImage: `url(${maskSrc})`,
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskSize: "contain",
            maskSize: "contain",
            WebkitMaskPosition: "center",
            maskPosition: "center",
          }}
        >
          <div
            className="absolute"
            style={{
              left: printArea.x,
              top: printArea.y,
              width: printArea.w,
              height: printArea.h,
            }}
          >
            {visibleLayers.map((layer: EditorLayer) => {
              const selected =
                layer.id === selectedLayerId;

              const width =
                layer.width ?? DEFAULT_TEXT_SIZE.w;
              const height =
                layer.height ?? DEFAULT_TEXT_SIZE.h;

              const x =
                layer.x ?? (printArea.w - width) / 2;
              const y =
                layer.y ?? (printArea.h - height) / 2;

              return (
                <Rnd
                  key={layer.id}
                  bounds="parent"
                  size={{ width, height }}
                  position={{ x, y }}
                  onMouseDown={e => {
                    e.stopPropagation();
                    setSelectedLayerId(layer.id);
                  }}
                  onDragStop={(_, d) =>
                    updateLayer(layer.id, layer.type, {
                      x: d.x,
                      y: d.y,
                    })
                  }
                  onResizeStop={(_, __, ref, ___, pos) =>
                    updateLayer(layer.id, layer.type, {
                      width: ref.offsetWidth,
                      height: ref.offsetHeight,
                      x: pos.x,
                      y: pos.y,
                    })
                  }
                  style={{
                    outline: selected
                      ? "2px solid #6366f1"
                      : "none",
                    zIndex: selected
                      ? 999
                      : layer.zIndex,
                  }}
                  className={`${selected ? "shadow-lg ring-2 ring-indigo-500" : ""}`}
                >
                  {selected && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none z-50">
                      {layer.type === "text" ? "TEXT" : "IMAGE"} · {layer.rotation || 0}°
                    </div>
                  )}
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{
                      transform: `rotate(${layer.rotation || 0}deg)`,
                    }}
                  >
                    {isTextLayer(layer) ? (
                      <EnhancedText layer={layer} />
                    ) : (
                      <img
                        src={layer.src}
                        className="w-full h-full object-contain"
                        style={{
                          opacity: layer.opacity ?? 1,
                        }}
                        draggable={false}
                      />
                    )}
                  </div>
                </Rnd>
              );
            })}
          </div>
        </div>

        <span className="absolute top-4 right-4 bg-black text-white text-[10px] px-3 py-1 rounded-full">
          {selectedColor.toUpperCase()} · {side.toUpperCase()}
        </span>
              {!selectedLayerId && (
                <span className="absolute bottom-4 left-4 bg-gray-800 text-white text-[11px] px-3 py-1.5 rounded-lg max-w-xs">
                  Click to select layer • Delete key to remove • Use left panel to edit
                </span>
              )}
              {selectedLayerId && (
                <span className="absolute bottom-4 left-4 bg-indigo-600 text-white text-[11px] px-3 py-1.5 rounded-lg">
                  Drag to move • Drag edges to resize • Use left panel to rotate
                </span>
              )}
      </div>
    </div>
  );
  }
);

export default EditorCanvas;

/* ======================================================
   TEXT
====================================================== */

function EnhancedText({ layer }: { layer: TextLayer }) {
  const [fontLoaded, setFontLoaded] = useState(true);

  useEffect(() => {
    setFontLoaded(false);
    loadGoogleFont(layer.fontFamily);
    
    // Force re-render after font loads to apply new font
    const timer = setTimeout(() => {
      setFontLoaded(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [layer.fontFamily]);

  // Properly format the CSS font family string with quotes for multi-word fonts
  const fontFamilyCSS = layer.fontFamily.includes(" ") 
    ? `"${layer.fontFamily}", "Noto Sans", sans-serif`
    : `${layer.fontFamily}, "Noto Sans", sans-serif`;

  const style: React.CSSProperties = {
    fontFamily: fontFamilyCSS,
    fontSize: `${layer.fontSize}px`,
    fontWeight: layer.fontWeight,
    fontStyle: layer.isItalic ? "italic" : "normal",
    textDecoration: [
      layer.isUnderline ? "underline" : "",
      layer.isStrikethrough ? "line-through" : ""
    ].filter(Boolean).join(" ") || "none",
    letterSpacing: `${layer.letterSpacing ?? 0}px`,
    lineHeight: layer.lineHeight ?? 1.2,
    textAlign: layer.textAlign || "center",
    whiteSpace: "pre-wrap",
    color: layer.color,
    opacity: layer.opacity ?? 1,
    WebkitFontSmoothing: "antialiased",
    MozOsxFontSmoothing: "grayscale",
  };

  // Apply text style effects
  if (layer.textStyle === "shadow") {
    const offsetX = layer.shadowOffsetX ?? 2;
    const offsetY = layer.shadowOffsetY ?? 2;
    const blur = layer.shadowBlur ?? 4;
    const shadowCol = layer.shadowColor ?? "#000000";
    style.textShadow = `${offsetX}px ${offsetY}px ${blur}px ${shadowCol}`;
  }

  if (layer.textStyle === "outline") {
    style.color = "#fff";
    style.textShadow = `
      -1px -1px 0 #000,
       1px -1px 0 #000,
      -1px  1px 0 #000,
       1px  1px 0 #000
    `;
  }

  if (layer.textStyle === "3d") {
    const depth = layer.depth3d ?? 5;
    const angle = (layer.angle3d ?? 45) * Math.PI / 180;
    const offsetX = Math.round(Math.cos(angle) * depth);
    const offsetY = Math.round(Math.sin(angle) * depth);
    const shadowCol = layer.shadowColor ?? "#222";
    
    let shadows = [];
    for (let i = 1; i <= depth; i++) {
      shadows.push(`${i}px ${i}px 0 rgba(0,0,0,${0.3 * (i/depth)})`);
    }
    style.textShadow = shadows.join(", ");
  }

  if (layer.textStyle === "glow") {
    const glowCol = layer.glowColor ?? "#FF00FF";
    const glowSz = layer.glowSize ?? 5;
    style.textShadow = `0 0 ${glowSz}px ${glowCol}, 0 0 ${glowSz * 2}px ${glowCol}`;
    style.color = "#fff";
  }

  if (layer.textStyle === "emboss") {
    style.textShadow = `
      -2px -2px 2px rgba(255,255,255,0.5),
       2px  2px 2px rgba(0,0,0,0.5)
    `;
    style.fontWeight = 700;
  }

  if (layer.textStyle === "neon") {
    const glowCol = layer.glowColor ?? "#FF00FF";
    style.textShadow = `
      0 0 10px ${glowCol},
      0 0 20px ${glowCol},
      0 0 30px ${glowCol}
    `;
    style.color = "#fff";
    style.fontWeight = 700;
  }

  if (layer.textStyle === "gradient") {
    const startCol = layer.gradientStart ?? "#FF0000";
    const endCol = layer.gradientEnd ?? "#0000FF";
    const angle = layer.gradientAngle ?? 0;
    
    style.backgroundImage = `linear-gradient(${angle}deg, ${startCol}, ${endCol})`;
    style.backgroundClip = "text";
    style.WebkitBackgroundClip = "text";
    style.WebkitTextFillColor = "transparent";
    style.color = "transparent" as any;
  }

  if (layer.textStyle === "chrome") {
    style.backgroundImage = "linear-gradient(45deg, #C0C0C0, #E8E8E8, #C0C0C0, #E8E8E8)";
    style.backgroundClip = "text";
    style.WebkitBackgroundClip = "text";
    style.WebkitTextFillColor = "transparent";
    style.textShadow = "2px 2px 4px rgba(0,0,0,0.3)";
    style.fontWeight = 700;
  }

  if (layer.textStyle === "glass") {
    style.color = "rgba(255,255,255,0.8)";
    style.textShadow = `
      0 0 20px rgba(255,255,255,0.5),
      inset 0 0 20px rgba(255,255,255,0.2)
    `;
    style.backdropFilter = "blur(10px)" as any;
    style.fontWeight = 300;
    style.letterSpacing = "2px";
  }

  if (layer.textStyle === "fire") {
    const glowCol1 = "#FF0000";
    const glowCol2 = "#FF7F00";
    style.color = "#FFF";
    style.textShadow = `
      0 0 10px ${glowCol1},
      0 0 20px ${glowCol1},
      0 0 30px ${glowCol2},
      0 0 40px ${glowCol2}
    `;
    style.fontWeight = 700;
  }

  if (layer.textStyle === "wave") {
    style.textShadow = `
      0 2px 0 #999,
      0 4px 0 #888,
      0 6px 0 #777,
      0 8px 0 #666,
      0 10px 0 #555,
      0 12px 15px rgba(0,0,0,0.5)
    `;
    style.color = layer.color;
    style.fontWeight = 700;
  }

  if (layer.textStyle === "blur") {
    style.filter = "blur(1px)";
    style.textShadow = "0 0 10px rgba(0,0,0,0.3)";
    style.opacity = 0.85;
  }

  if (layer.textStyle && String(layer.textStyle) === "marble") {
    style.backgroundImage = "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)";
    style.backgroundClip = "text";
    style.WebkitBackgroundClip = "text";
    style.WebkitTextFillColor = "transparent";
    style.textShadow = "2px 2px 8px rgba(0,0,0,0.2)";
    style.fontWeight = 700;
  }

  if (layer.textStyle && String(layer.textStyle) === "plasma") {
    const glowCol = "#FF00FF";
    style.color = "#00FFFF";
    style.textShadow = `
      0 0 5px #00FFFF,
      0 0 10px ${glowCol},
      0 0 15px #00FF00,
      0 0 20px #FF00FF,
      0 0 30px #00FFFF
    `;
    style.fontWeight = 700;
    style.letterSpacing = "2px";
  }

  if (layer.textStyle && String(layer.textStyle) === "hologram") {
    style.color = "#0FF";
    style.textShadow = `
      0 0 10px #0FF,
      0 0 20px #0FF,
      -2px -2px 5px #FF00FF,
      2px 2px 5px #FF00FF
    `;
    style.fontWeight = 500;
    style.letterSpacing = "3px";
  }

  return (
    <div style={style} key={`${layer.fontFamily}-${fontLoaded}`}>
      {layer.text}
    </div>
  );
}
