"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Rnd } from "react-rnd";

import {
  EditorLayer,
  Side,
  TextLayer,
  isTextLayer,
} from "@/types/editor";

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

export default function EditorCanvas({
  product,
  side,
  selectedColor,
  layers,
  selectedLayerId,
  setSelectedLayerId,
  updateLayer,
  deleteLayer,
}: EditorCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] =
    useState(CANVAS_SIZE);

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

/* ======================================================
   TEXT
====================================================== */

function EnhancedText({ layer }: { layer: TextLayer }) {
  const style: React.CSSProperties = {
    fontFamily: layer.fontFamily,
    fontSize: `${layer.fontSize}px`,
    fontWeight: layer.fontWeight,
    letterSpacing: `${layer.letterSpacing ?? 0}px`,
    lineHeight: layer.lineHeight ?? 1.2,
    textAlign: layer.textAlign || "center",
    whiteSpace: "pre-wrap",
    color: layer.color,
    opacity: layer.opacity ?? 1,
  };

  if (layer.textStyle === "shadow") {
    style.textShadow = "3px 3px 6px rgba(0,0,0,0.4)";
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
    style.textShadow = `
      1px 1px 0 #222,
      2px 2px 0 #333,
      3px 3px 0 #444
    `;
  }

  return <div style={style}>{layer.text}</div>;
}
