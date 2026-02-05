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

export default function RightPanel({
  product,
  selectedColor,
  activeSide,
  setActiveSide,
  layerCount = 0,
  selectedLayerId,
}: RightPanelProps) {
  const sideLabels: Record<Side, string> = {
    front: "👕 Front",
    back: "🔄 Back",
    left: "⬅ Left",
    right: "➡ Right",
  };

  const fallbackImg =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100%25' height='100%25' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='12'%3ENo Image%3C/text%3E%3C/svg%3E";

  return (
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
                <div className="h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-2 flex items-center justify-center overflow-hidden border border-gray-200">
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
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-xs text-blue-900 space-y-2">
            <p className="font-semibold flex items-center gap-2">
              <span>ℹ️</span> Design Info
            </p>
            <p>
              📍 Side:{" "}
              <b className="text-blue-700 text-sm uppercase">{activeSide}</b>
            </p>
            <p>
              🎨 Color:{" "}
              <b className="text-blue-700 text-sm capitalize">{selectedColor}</b>
            </p>
            <p>
              📦 Layers:{" "}
              <b className="text-blue-700 text-sm font-mono">{layerCount}</b>
            </p>
            {selectedLayerId && (
              <p className="text-blue-600 font-medium">✓ Layer selected</p>
            )}
          </div>

          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 space-y-1">
            <p className="font-semibold flex items-center gap-2">
              <span>💡</span> Quick Tips
            </p>
            <ul className="space-y-1 ml-2">
              <li>• Drag layers to move</li>
              <li>• Drag edges to resize</li>
              <li>• Delete key to remove</li>
              <li>• Use Left panel to edit</li>
            </ul>
          </div>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="space-y-3 border-t border-gray-200 pt-4">
        <button className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white py-3 rounded-xl font-semibold transition-all duration-200 transform active:scale-95 shadow-md hover:shadow-lg">
          <span className="inline-block mr-2">✨</span> Export Design
        </button>

        <button className="w-full bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white py-3 rounded-xl font-semibold transition-all duration-200 transform active:scale-95 shadow-md hover:shadow-lg">
          <span className="inline-block mr-2">🛍️</span> Add to Cart
        </button>

        <button className="w-full border-2 border-gray-300 hover:border-teal-500 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-teal-50 transition-all duration-200">
          <span className="inline-block mr-2">👁️</span> Preview Mockup
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
  );
}
