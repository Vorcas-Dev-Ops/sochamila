
"use client";
import React from "react";

import { useCallback, useMemo, useState } from "react";
import { nanoid } from "nanoid";

import EditorCanvas from "./EditorCanvas";
import html2canvas from "html2canvas";
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

    console.log("📷 getPreviewImages called, canvasRef:", canvasRef.current);

    // Helper to wait for images to load in element
    const waitForImages = async (element: HTMLElement | null, timeout = 2000) => {
      if (!element) return;
      const images = element.querySelectorAll("img");
      const count = images.length;
      if (!count) {
        console.log("✓ No product images to wait for");
        return;
      }
      
      console.log(`⏳ Waiting for ${count} image(s) to load...`);

      const promises = Array.from(images).map(
        (img, idx) =>
          new Promise<void>((resolve) => {
            if (img.complete) {
              console.log(`  ✓ Image ${idx + 1}/${count} already complete`);
              resolve();
            } else {
              img.onload = () => {
                console.log(`  ✓ Image ${idx + 1}/${count} loaded`);
                resolve();
              };
              img.onerror = () => {
                console.log(`  ⚠ Image ${idx + 1}/${count} failed to load`);
                resolve();
              };
              setTimeout(() => {
                console.log(`  ⚠ Image ${idx + 1}/${count} timeout`);
                resolve();
              }, timeout);
            }
          })
      );

      await Promise.all(promises);
      console.log("✓ All images ready");
    };

    try {
      for (const side of sides) {
        console.log(`\n🔄 Capturing ${side} side...`);
        
        // Switch to this side
        setActiveSide(side);
        
        // Wait for the canvas to re-render and images to load
        await new Promise((resolve) => setTimeout(resolve, 300));
        await waitForImages(canvasRef.current);

        if (!canvasRef.current) {
          console.warn(`  ⚠ Canvas ref is null for ${side}`);
          continue;
        }

        try {
          const element = canvasRef.current;
          console.log(`  📐 Capturing element:`, {
            tag: element.tagName,
            width: element.offsetWidth,
            height: element.offsetHeight,
            hasChildren: element.children.length,
          });

          const canvas = await html2canvas(element, {
            backgroundColor: "#ffffff",
            scale: 2,
            useCORS: true,
            allowTaint: true,
            imageTimeout: 5000,
            logging: false,
          });
          
          const dataUrl = canvas.toDataURL("image/png");
          previews[side] = dataUrl;
          
          console.log(`  ✅ Successfully captured ${side} (${dataUrl.length} bytes)`);
        } catch (err) {
          console.error(`  ❌ Failed to capture ${side}:`, err);
          previews[side] = null;
        }
      }
    } catch (err) {
      console.error("❌ Preview capture error:", err);
    }

    // Switch back to front side
    console.log("\n↩️  Switching back to front side");
    setActiveSide("front");

    console.log("📊 Final previews:", {
      front: previews.front ? `${previews.front.length} bytes` : "null",
      back: previews.back ? `${previews.back.length} bytes` : "null",
      left: previews.left ? `${previews.left.length} bytes` : "null",
      right: previews.right ? `${previews.right.length} bytes` : "null",
    });

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
