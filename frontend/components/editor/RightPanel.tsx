"use client";

import { Side } from "@/types/editor";

/* ================= PROPS ================= */

interface RightPanelProps {
  product: {
    images?: string[];
  };

  selectedColor: string;
  activeSide: Side;
  setActiveSide: (side: Side) => void;
}

/* ================= CONSTANTS ================= */

const SIDES: Side[] = ["front", "back", "right", "left"];
const API_URL = "http://localhost:5000";

/* ================= IMAGE RESOLVER ================= */

/**
 * Matches images like:
 * green-front.png
 * green-back.jpg
 */
function resolvePreviewImage(
  images: string[] | undefined,
  color: string,
  side: Side
): string | null {
  if (!images?.length) return null;

  const lc = color.toLowerCase();

  const match =
    images.find((img) =>
      img.toLowerCase().includes(`${lc}-${side}`)
    ) ||
    images.find((img) =>
      img.toLowerCase().startsWith(lc)
    ) ||
    images.find((img) =>
      img.toLowerCase().includes(`-${side}`)
    );

  if (!match) return null;

  return match.startsWith("http")
    ? match
    : `${API_URL}/uploads/${match}`;
}

/* ================= COMPONENT ================= */

export default function RightPanel({
  product,
  selectedColor,
  activeSide,
  setActiveSide,
}: RightPanelProps) {
  return (
    <aside className="w-80 bg-white border-l p-5 flex flex-col justify-between">
      {/* TOP */}
      <div>
        <h3 className="font-semibold text-lg mb-1">
          Product View
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
                className={`relative border rounded-xl p-3 transition
                  ${
                    isActive
                      ? "ring-2 ring-teal-600 border-teal-600"
                      : "hover:bg-gray-50"
                  }`}
              >
                <div className="h-24 bg-gray-100 rounded mb-2 flex items-center justify-center overflow-hidden">
                  {img ? (
                    <img
                      src={img}
                      alt={`${selectedColor} ${side}`}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-gray-400">
                      No image
                    </span>
                  )}
                </div>

                <span className="block text-center font-medium capitalize">
                  {side}
                </span>

                {isActive && (
                  <span className="absolute top-2 right-2 text-[10px] bg-teal-600 text-white px-2 py-0.5 rounded">
                    Active
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600 space-y-1">
          <p>
            ✔ Design applies only to{" "}
            <b>{activeSide}</b>
          </p>
          <p>✔ Keep elements inside print area</p>
          <p>
            ✔ Color: <b>{selectedColor}</b>
          </p>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="space-y-3">
        <button className="w-full bg-pink-600 text-white py-3 rounded-xl font-semibold">
          Choose size & quantity
        </button>

        <button className="w-full border py-2 rounded-lg text-sm">
          Preview mockup
        </button>
      </div>
    </aside>
  );
}
