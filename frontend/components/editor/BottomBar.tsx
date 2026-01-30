"use client";

type Side = "front" | "back" | "left" | "right";

interface BottomBarProps {
  activeSide: Side;
  setActiveSide: (s: Side) => void;
}

export default function BottomBar({
  activeSide,
  setActiveSide,
}: BottomBarProps) {
  return (
    <div className="h-14 bg-white border-t flex items-center justify-between px-6">

      <div className="flex gap-2">
        {(["front", "back", "left", "right"] as Side[]).map((side) => (
          <button
            key={side}
            onClick={() => setActiveSide(side)}
            className={`px-4 py-1 rounded text-sm border ${
              activeSide === side
                ? "bg-teal-600 text-white"
                : "hover:bg-gray-100"
            }`}
          >
            {side}
          </button>
        ))}
      </div>

      <button className="bg-teal-600 text-white px-6 py-2 rounded">
        Save & Continue
      </button>
    </div>
  );
}
