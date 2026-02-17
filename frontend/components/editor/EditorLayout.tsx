
"use client";
import React from "react";

import { useCallback, useMemo, useState } from "react";
import { nanoid } from "nanoid";

import EditorCanvas from "./EditorCanvas";
import html2canvas from "html2canvas-pro";
import LeftPanel from "./LeftPanel";
import RightPanel from "./RightPanel";

import {
  EditorLayer,
  Side,
  TextLayer,
  ImageLayer,
  PatternLayer,
} from "@/types/editor";

import { TextOptions } from "@/types/editor-options";
import type { ProductVariantImage } from "@/types/product";
import { generateImage } from "@/lib/api/ai";

/* ================= HELPERS ================= */

// Convert relative URLs to absolute
function toFullUrl(path: string): string {
  if (path.startsWith("http")) return path;
  if (path.startsWith("/uploads/")) return `http://localhost:5000${path}`;
  if (path.startsWith("/")) return `http://localhost:5000${path}`;
  return `http://localhost:5000/uploads/${path}`;
}

// Pass through images with view so editor can show correct image per side
function buildEditorImages(
  images: ProductVariantImage[] = []
): ProductVariantImage[] {
  return images.filter(i => !!i.image);
}

/* ================= COMPONENT ================= */

export default function EditorLayout({
  product,
  variant,
}: {
  product: { id: string; type?: string };
  variant: {
    id: string;
    color?: string;
    images?: ProductVariantImage[];
  };
}) {
  const canvasRef = React.useRef<HTMLDivElement>(null);
  const [layers, setLayers] = useState<EditorLayer[]>([]);
  const [activeSide, setActiveSide] = useState<Side>("front");
  const [selectedLayerId, setSelectedLayerId] =
    useState<string | null>(null);
  const [isCapturingPreview, setCapturingPreview] = useState(false);

  const selectedColor = variant.color ?? "default";

  const editorImages = useMemo(
    () => buildEditorImages(variant.images),
    [variant.images]
  );

  const selectedLayer = useMemo(
    () => layers.find(l => l.id === selectedLayerId) ?? null,
    [layers, selectedLayerId]
  );

  const lastPatternId = useMemo(() => {
    for (let i = layers.length - 1; i >= 0; i--) {
      if (layers[i].type === "pattern") return layers[i].id;
    }
    return null;
  }, [layers]);

  const nextZIndex = useMemo(
    () =>
      layers.length
        ? Math.max(...layers.map(l => l.zIndex)) + 1
        : 1,
    [layers]
  );

  /* ================= FACTORIES ================= */

  const createTextLayer = (
    text: string,
    opts: TextOptions
  ): TextLayer => ({
    id: nanoid(),
    type: "text",
    side: activeSide,
    text,
    textAlign: "center",
    fontSize: opts.fontSize,
    fontFamily: opts.fontFamily,
    fontWeight: opts.fontWeight,
    color: opts.color,
    letterSpacing: opts.letterSpacing,
    lineHeight: opts.lineHeight,
    textStyle: opts.textStyle,
    curve: opts.curve,
    x: 40,
    y: 40,
    width: 240,
    height: 80,
    rotation: 0,
    opacity: opts.opacity,
    locked: false,
    visible: true,
    zIndex: nextZIndex,
  });

  const createImageLayer = (src: string): ImageLayer => ({
    id: nanoid(),
    type: "image",
    side: activeSide,
    // Preserve data URLs (generated patterns / AI images) as-is, otherwise
    // convert relative paths to full URLs for server-hosted images.
    src: src.startsWith("data:") ? src : toFullUrl(src),
    x: 60,
    y: 60,
    width: 200,
    height: 200,
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    zIndex: nextZIndex,
  });

  const createPatternLayer = (opts: {
    patternType: PatternLayer["patternType"];
    color1: string;
    color2: string;
    scale: number;
    rotation: number;
    opacity?: number;
  }): PatternLayer => ({
    id: nanoid(),
    type: "pattern",
    side: activeSide,
    patternType: opts.patternType,
    color1: opts.color1,
    color2: opts.color2,
    scale: opts.scale,
    rotation: opts.rotation,
    x: 60,
    y: 60,
    width: 200,
    height: 200,
    opacity: opts.opacity ?? 1,
    locked: false,
    visible: true,
    zIndex: nextZIndex,
  });

  /* ================= ADD ================= */

  const onAddText = useCallback(
    (text: string, opts: TextOptions) => {
      const layer = createTextLayer(text, opts);
      setLayers(prev => [...prev, layer]);
      setSelectedLayerId(layer.id);
    },
    [activeSide, nextZIndex]
  );

  const onAddImage = useCallback(
    (src: string) => {
      const layer = createImageLayer(src);
      setLayers(prev => [...prev, layer]);
      setSelectedLayerId(layer.id);
    },
    [activeSide, nextZIndex]
  );

  const onAddPattern = useCallback(
    (opts: {
      patternType: PatternLayer["patternType"];
      color1: string;
      color2: string;
      scale: number;
      rotation: number;
      opacity?: number;
    }) => {
      const layer = createPatternLayer(opts);
      setLayers(prev => [...prev, layer]);
      setSelectedLayerId(layer.id);
    },
    [activeSide, nextZIndex]
  );

  /* ================= AI GENERATE ================= */

  const onGenerateAIImage = useCallback(
    async (prompt: string): Promise<string> => {
      const url = await generateImage(prompt);
      onAddImage(url);
      return url;
    },
    [onAddImage]
  );

  /* ================= UPDATE ================= */

  const updateLayer = <
    T extends EditorLayer["type"]
  >(
    id: string,
    type: T,
    patch: Omit<
      Partial<Extract<EditorLayer, { type: T }>>,
      "type"
    >
  ) => {
    setLayers(prev =>
      prev.map(layer =>
        layer.id === id && layer.type === type
          ? { ...layer, ...patch }
          : layer
      )
    );
  };

  const onUpdateText = useCallback(
    (patch: Partial<TextLayer>) => {
      if (!selectedLayerId) return;

      setLayers(prev =>
        prev.map(l =>
          l.id === selectedLayerId && l.type === "text"
            ? { ...l, ...patch }
            : l
        )
      );
    },
    [selectedLayerId]
  );

  const onUpdateImage = useCallback(
    (patch: Partial<ImageLayer>) => {
      if (!selectedLayerId) return;

      setLayers(prev =>
        prev.map(l =>
          l.id === selectedLayerId && l.type === "image"
            ? { ...l, ...patch }
            : l
        )
      );
    },
    [selectedLayerId]
  );

  const onUpdatePattern = useCallback(
    (patch: Partial<PatternLayer>) => {
      if (!selectedLayerId) return;

      setLayers(prev =>
        prev.map(l =>
          l.id === selectedLayerId && l.type === "pattern"
            ? { ...l, ...patch }
            : l
        )
      );
    },
    [selectedLayerId]
  );

  const onUpdatePatternById = useCallback(
    (id: string, patch: Partial<PatternLayer>) => {
      setLayers(prev =>
        prev.map(l =>
          l.id === id && l.type === "pattern"
            ? { ...l, ...patch }
            : l
        )
      );
    },
    []
  );

  /* ================= DELETE ================= */

  const deleteLayer = useCallback((id: string) => {
    setLayers(prev => prev.filter(l => l.id !== id));
    setSelectedLayerId(null);
  }, []);

  /* ================= PREVIEW ================= */

  // Function to capture all sides as images
  const getPreviewImages = async (): Promise<Record<Side, string | null>> => {
    const sides: Side[] = ["front", "back", "left", "right"];
    const previews: Record<Side, string | null> = {
      front: null,
      back: null,
      left: null,
      right: null,
    };

    setCapturingPreview(true);
    await new Promise((r) => setTimeout(r, 250));

    const waitForPaint = () =>
      new Promise<void>((r) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => r());
        });
      });

    const waitForImages = async (element: HTMLElement | null, timeout = 3000) => {
      if (!element) return;
      const images = element.querySelectorAll("img");
      if (!images.length) return;
      await Promise.all(
        Array.from(images).map(
          (img) =>
            new Promise<void>((resolve) => {
              if (img.complete) resolve();
              else {
                img.onload = () => resolve();
                img.onerror = () => resolve();
                setTimeout(resolve, timeout);
              }
            })
        )
      );
    };

    let lastError: string | null = null;

    try {
      for (const side of sides) {
        setActiveSide(side);
        await waitForPaint();
        await new Promise((r) => setTimeout(r, 400));
        await waitForImages(canvasRef.current);

        if (!canvasRef.current) continue;

        try {
          const element = canvasRef.current;
          const canvas = await html2canvas(element, {
            backgroundColor: "#ffffff",
            scale: 2,
            useCORS: true,
            allowTaint: false,
            imageTimeout: 8000,
            logging: false,
          });
          const dataUrl = canvas.toDataURL("image/png");
          previews[side] = dataUrl;
        } catch (err) {
          lastError = err instanceof Error ? err.message : String(err);
          previews[side] = null;
        }
      }
    } finally {
      setCapturingPreview(false);
      setActiveSide("front");
    }

    if (lastError && !Object.values(previews).some(Boolean)) {
      throw new Error(`Preview failed: ${lastError}`);
    }
    return previews;
  };

  return (
    <div className="h-screen flex bg-[#f4f5f7] overflow-hidden relative">
      <LeftPanel
        selectedLayer={selectedLayer}
        onAddText={onAddText}
        onUpdateText={onUpdateText}
        onAddImage={onAddImage}
        onUpdateImage={onUpdateImage}
        onAddPattern={onAddPattern}
        onUpdatePattern={onUpdatePattern}
        lastPatternId={lastPatternId}
        onUpdatePatternById={onUpdatePatternById}
        onGenerateAIImage={onGenerateAIImage}
      />

      <EditorCanvas
        ref={canvasRef}
        product={{
          type: product.type,
          images: editorImages,
          imagesWithView: editorImages,
        }}
        side={activeSide}
        selectedColor={selectedColor}
        layers={layers}
        updateLayer={updateLayer}
        deleteLayer={deleteLayer}
        selectedLayerId={selectedLayerId}
        setSelectedLayerId={setSelectedLayerId}
        captureMode={isCapturingPreview}
      />

      <RightPanel
        product={{ images: editorImages }}
        selectedColor={selectedColor}
        activeSide={activeSide}
        setActiveSide={setActiveSide}
        layerCount={layers.length}
        selectedLayerId={selectedLayerId}
        getPreviewImages={getPreviewImages}
      />
    </div>
  );
}
