"use client";

import { useCallback, useMemo, useState } from "react";
import { nanoid } from "nanoid";

import EditorCanvas from "./EditorCanvas";
import LeftPanel from "./LeftPanel";
import RightPanel from "./RightPanel";

import {
  EditorLayer,
  Side,
  TextLayer,
  ImageLayer,
} from "@/types/editor";

import { TextOptions } from "@/types/editor-options";
import type { ProductVariantImage } from "@/types/product";

/* ================= HELPERS ================= */

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
  const [layers, setLayers] = useState<EditorLayer[]>([]);
  const [activeSide, setActiveSide] = useState<Side>("front");
  const [selectedLayerId, setSelectedLayerId] =
    useState<string | null>(null);

  const selectedColor = variant.color ?? "default";

  const editorImages = useMemo(
    () => buildEditorImages(variant.images),
    [variant.images]
  );

  const selectedLayer = useMemo(
    () => layers.find(l => l.id === selectedLayerId) ?? null,
    [layers, selectedLayerId]
  );

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
    src,
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

  /* ================= AI GENERATE ================= */

  const onGenerateAIImage = useCallback(
    async (prompt: string): Promise<string> => {
      const response = await fetch("http://localhost:5000/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!data.success || !data.url) {
        throw new Error(data.error || "Failed to generate image");
      }

      // Add the generated image to canvas
      onAddImage(data.url);

      return data.url;
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

  /* ================= DELETE ================= */

  const deleteLayer = useCallback((id: string) => {
    setLayers(prev => prev.filter(l => l.id !== id));
    setSelectedLayerId(null);
  }, []);

  /* ================= UI ================= */

  return (
    <div className="h-screen flex bg-[#f4f5f7] overflow-hidden relative">
      <LeftPanel
        selectedLayer={selectedLayer}
        onAddText={onAddText}
        onUpdateText={onUpdateText}
        onAddImage={onAddImage}
        onUpdateImage={onUpdateImage}
        onGenerateAIImage={onGenerateAIImage}
      />

      <EditorCanvas
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
      />

      <RightPanel
        product={{ images: editorImages }}
        selectedColor={selectedColor}
        activeSide={activeSide}
        setActiveSide={setActiveSide}
        layerCount={layers.length}
        selectedLayerId={selectedLayerId}
      />
    </div>
  );
}
