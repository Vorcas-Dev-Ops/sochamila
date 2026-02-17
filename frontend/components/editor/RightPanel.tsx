"use client";

import { Side } from "@/types/editor";

/* ================= PROPS ================= */

type ImageWithView = { image: string; view?: string };

interface RightPanelProps {
  product: {
    images?: string[] | ImageWithView[];
  };
  selectedColor: string;
  activeSide: Side;
  setActiveSide: (side: Side) => void;
  layerCount?: number;
  selectedLayerId?: string | null;
  getPreviewImages?: () => Promise<Record<Side, string | null>>;
}

/* ================= CONSTANTS ================= */

const SIDES: Side[] = ["front", "back", "right", "left"];
const API_URL = "http://localhost:5000";

function toFullUrl(path: string): string {
  let p = String(path).replace(/\\/g, "/").trim();
  p = p.replace(/^[A-Za-z]:\//, "");
  if (p.startsWith("uploads/")) p = "/" + p;
  if (p.startsWith("http")) return p;
  if (p.startsWith("/uploads/")) return `${API_URL}${p}`;
  if (p.startsWith("/")) return `${API_URL}${p}`;
  return `${API_URL}/uploads/${p}`;
}

/* ================= IMAGE RESOLVER ================= */

function resolvePreviewImage(
  images: string[] | ImageWithView[] | undefined,
  _color: string,
  side: Side
): string | null {
  if (!images?.length) return null;

  const withView = images as ImageWithView[];
  const first = withView[0];
  const hasView = first && typeof first === "object" && "view" in first;

  if (hasView) {
    const sideUpper = side.toUpperCase();
    const match = withView.find(
      (img) => (img as ImageWithView).view?.toUpperCase() === sideUpper
    );
    if (match?.image) return toFullUrl(match.image);
    const order = ["front", "back", "left", "right"].indexOf(side);
    if (order >= 0 && withView[order]?.image) {
      return toFullUrl(withView[order].image);
    }
    if (withView[0]?.image) return toFullUrl(withView[0].image);
  }

  // Legacy: plain string array
  const path = typeof first === "string" ? first : (first as ImageWithView).image;
  return path ? toFullUrl(path) : null;
}

/* ================= COMPONENT ================= */

import { useState } from "react";

export default function RightPanel({
  product,
  selectedColor,
  activeSide,
  setActiveSide,
  layerCount = 0,
  selectedLayerId,
  getPreviewImages,
}: RightPanelProps) {
  const sideLabels: Record<Side, string> = {
    front: "👕 Front",
    back: "🔄 Back",
    left: "⬅ Left",
    right: "➡ Right",
  };

  const fallbackImg =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100%25' height='100%25' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='12'%3ENo Image%3C/text%3E%3C/svg%3E";

  const [showPreview, setShowPreview] = useState(false);
  const [previewImages, setPreviewImages] = useState<Record<Side, string | null>>({
    front: null,
    back: null,
    left: null,
    right: null,
  });
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const handlePreview = async () => {
    setPreviewError(null);
    setLoadingPreview(true);
    setShowPreview(true);
    try {
      if (getPreviewImages) {
        console.log("🎬 Starting preview capture...");
        const images = await getPreviewImages();
        console.log("📸 Preview capture complete:", images);
        
        // Show images regardless - user can see what captured and what didn't
        setPreviewImages(images);
      } else {
        throw new Error("Preview not available");
      }
    } catch (err: any) {
      console.error("❌ Preview error:", err);
      setPreviewError(err?.message || "Failed to generate preview");
    } finally {
      setLoadingPreview(false);
    }
  };

  return (
    <>
      <aside className="w-80 bg-white border-l border-gray-200 p-5 flex flex-col justify-between h-screen overflow-y-auto">
      {/* TOP */}
      <div>
        <h3 className="font-bold text-lg mb-1 text-gray-900">
          Product Design
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Select the side you want to design
        </p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {SIDES.map((side) => {
            const img = resolvePreviewImage(
              product.images,
              selectedColor,
              side
            );

            const isActive = activeSide === side;

            return (
              <button
                key={side}
                onClick={() => setActiveSide(side)}
                className={`relative border-2 rounded-xl p-3 transition-all duration-200 transform hover:scale-105 ${
                  isActive
                    ? "ring-2 ring-teal-600 border-teal-600 shadow-lg bg-teal-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="h-24 bg-gray-100 rounded-lg mb-2 flex items-center justify-center overflow-hidden border border-gray-200">
                  {img ? (
                    <img
                      src={img}
                      alt={`${selectedColor} ${side}`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = fallbackImg;
                      }}
                    />
                  ) : (
                    <span className="text-xs text-gray-400 text-center">
                      No image
                    </span>
                  )}
                </div>

                <span className="block text-center font-semibold text-sm capitalize text-gray-900">
                  {sideLabels[side as Side]}
                </span>

                {isActive && (
                  <span className="absolute top-2 right-2 text-[10px] bg-teal-600 text-white px-2 py-1 rounded-full font-semibold shadow-md">
                    ✓ Active
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="space-y-3 mb-4">
          <div className="rounded-xl bg-blue-50 border-2 border-blue-200 p-5 text-xs text-blue-900 space-y-3">
            <p className="font-bold text-base flex items-center gap-2">
              <span>ℹ️</span> Design Info
            </p>
            <div className="space-y-2 ml-5">
              <p>
                📍 <span className="font-semibold">Side:</span>{" "}
                <span className="text-blue-700 font-bold text-sm uppercase bg-blue-200 px-2 py-0.5 rounded">{activeSide}</span>
              </p>
              <p>
                🎨 <span className="font-semibold">Color:</span>{" "}
                <span className="text-blue-700 font-bold text-sm capitalize bg-blue-200 px-2 py-0.5 rounded">{selectedColor}</span>
              </p>
              <p>
                📦 <span className="font-semibold">Layers:</span>{" "}
                <span className="text-blue-700 font-bold inline-block bg-blue-200 px-2 py-0.5 rounded">{layerCount}</span>
              </p>
              {selectedLayerId && (
                <p className="text-blue-700 font-semibold bg-blue-200 px-2 py-1.5 rounded inline-block mt-2">✓ Layer selected</p>
              )}
            </div>
          </div>

          <div className="rounded-xl bg-amber-50 border-2 border-amber-200 p-4 text-xs text-amber-900">
            <p className="font-bold text-sm flex items-center gap-2 mb-3">
              <span>💡</span> Quick Tips
            </p>
            <ul className="space-y-2 ml-5">
              <li className="flex gap-2"><span>•</span> <span>Drag layers to move</span></li>
              <li className="flex gap-2"><span>•</span> <span>Drag edges to resize</span></li>
              <li className="flex gap-2"><span>•</span> <span>Press Delete to remove layer</span></li>
              <li className="flex gap-2"><span>•</span> <span>Use Left panel to customize</span></li>
            </ul>
          </div>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="space-y-3 border-t border-gray-200 pt-4">
        <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition-all duration-200 transform active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-base" title="Export your design as an image">
          <span>✨</span> Export Design
        </button>

        <button className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-xl font-bold transition-all duration-200 transform active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-base" title="Add this design to your cart">
          <span>🛍️</span> Add to Cart
        </button>

        <button
          className="w-full border-2 border-teal-500 bg-teal-50 hover:bg-teal-100 py-3 rounded-xl text-sm font-bold text-teal-700 hover:border-teal-600 transition-all duration-200 transform active:scale-95 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
          onClick={handlePreview}
          disabled={loadingPreview}
        >
          <span>👁️</span> Preview Mockup
          {loadingPreview && <span className="animate-spin">⟳</span>}
        </button>

        <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-200">
          <p>
            Press{" "}
            <kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono border border-gray-300">
              Delete
            </kbd>{" "}
            to remove layer
          </p>
        </div>
      </div>
    </aside>

    {/* Preview Modal */}
    {showPreview && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 relative w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Close Button */}
          <button
            className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200 text-2xl font-bold"
            onClick={() => {
              setShowPreview(false);
              setPreviewError(null);
              setLoadingPreview(false);
            }}
            aria-label="Close"
            title="Close preview"
          >
            ✕
          </button>

          {/* Header */}
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Preview Mockup</h2>
            <p className="text-gray-500">Your edits applied to each side — use Download to save images</p>
          </div>
          
          {/* Loading State */}
          {loadingPreview && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-teal-600 mb-4" aria-hidden />
              <p className="text-gray-600 font-medium">Capturing your edits on each side…</p>
              <p className="text-sm text-gray-400 mt-2">This may take a few seconds</p>
            </div>
          )}
          
          {/* Error State */}
          {previewError && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-red-700 text-center">
              <p className="font-semibold text-lg mb-1">⚠️ Preview Failed</p>
              <p className="text-sm">{previewError}</p>
            </div>
          )}
          
          {/* Preview Grid */}
          {!loadingPreview && !previewError && (
            <div className="space-y-6">
              {/* Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(["front", "back", "left", "right"] as Side[]).map((side) => (
                  <div 
                    key={side} 
                    className="border-2 border-gray-200 rounded-xl overflow-hidden bg-gray-50 p-4 hover:border-teal-500 hover:shadow-lg transition-all duration-200"
                  >
                    {/* Side Label + Download */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-gray-900 capitalize text-lg">
                        {side === "front" && "👕"}
                        {side === "back" && "🔄"}
                        {side === "left" && "⬅️"}
                        {side === "right" && "➡️"}
                        {" "}{side}
                      </span>
                      <div className="flex items-center gap-2">
                        {previewImages[side] && (
                          <>
                            <span className="text-xs bg-green-100 text-green-700 font-semibold px-3 py-1 rounded-full">
                              ✓ Designed
                            </span>
                            <button
                              type="button"
                              className="text-xs bg-teal-100 hover:bg-teal-200 text-teal-800 font-semibold px-2 py-1 rounded"
                              onClick={() => {
                                const link = document.createElement("a");
                                link.href = previewImages[side]!;
                                link.download = `mockup-${side}-${Date.now()}.png`;
                                link.click();
                              }}
                            >
                              Download
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Image Container */}
                    <div className="relative bg-white rounded-lg border border-gray-300 overflow-hidden aspect-square flex items-center justify-center min-h-64">
                      {previewImages[side] ? (
                        <img
                          src={previewImages[side]!}
                          alt={`${side} side design`}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = 
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='14'%3EFailed to load%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400 py-16">
                          <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-sm font-medium">Not designed</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mt-6">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">Designed Sides:</span> {
                    Object.entries(previewImages)
                      .filter(([_, img]) => img !== null)
                      .map(([side]) => side.charAt(0).toUpperCase() + side.slice(1))
                      .join(", ") || "None"
                  }
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button
                  className="flex-1 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold transition-all duration-200 transform active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  onClick={() => {
                    const timestamp = Date.now();
                    const entries = (Object.entries(previewImages) as [Side, string | null][]).filter(
                      (entry): entry is [Side, string] => entry[1] != null
                    );
                    if (entries.length === 0) return;
                    entries.forEach(([side, img], index) => {
                      setTimeout(() => {
                        const link = document.createElement("a");
                        link.href = img;
                        link.download = `mockup-${side}-${timestamp}.png`;
                        link.click();
                      }, index * 300);
                    });
                  }}
                  disabled={!Object.values(previewImages).some(Boolean)}
                >
                  <span>⬇️</span> Download all sides
                </button>
                <button
                  className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-semibold transition-all duration-200 transform active:scale-95"
                  onClick={() => setShowPreview(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )}
    </>
  );
}
