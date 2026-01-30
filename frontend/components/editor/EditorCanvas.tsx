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

interface EditorCanvasProps {
  product: {
    type?: keyof typeof PRINT_PROFILES;
    images: string[];
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

function resolveSide(side: Side): Side {
  if (side === "left") return "right";
  if (side === "right") return "left";
  return side;
}

function resolveProductImage(
  images: string[],
  color: string,
  side: Side
): string | null {
  if (!images.length || !color) return null;

  const lc = color.toLowerCase();
  const s = resolveSide(side);

  const match =
    images.find((img: string) =>
      img.toLowerCase().includes(`${lc}-${s}`)
    ) ||
    images.find((img: string) =>
      img.toLowerCase().startsWith(lc)
    ) ||
    images.find((img: string) =>
      img.toLowerCase().includes(`-${s}`)
    );

  if (!match) return null;

  return match.startsWith("http")
    ? match
    : `${API_URL}/uploads/${match}`;
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
        product.images,
        selectedColor,
        side
      ),
    [product.images, selectedColor, side]
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
        {productImage && (
          <img
            src={productImage}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            draggable={false}
          />
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
                >
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
