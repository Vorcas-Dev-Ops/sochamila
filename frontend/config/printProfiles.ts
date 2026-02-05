import { Side } from "@/types/editor";

export type PrintProfile = {
  id: string;
  label: string;
  sides: Side[];
  masks: Record<Side, string>;
  printAreaRatio: Record<
    Side,
    { x: number; y: number; w: number; h: number }
  >;
};

export const PRINT_PROFILES: Record<string, PrintProfile> = {
  tshirt: {
    id: "tshirt",
    label: "T-Shirt",
    sides: ["front", "back", "left", "right"],

    masks: {
      front: "/masks/tshirt/front.png",
      back: "/masks/tshirt/back.png",
      left: "/masks/tshirt/left.png",
      right: "/masks/tshirt/right.png",
    },

    printAreaRatio: {
      /* Main body */
      front: { x: 0.24, y: 0.22, w: 0.52, h: 0.64 },
      back:  { x: 0.24, y: 0.22, w: 0.52, h: 0.64 },

      /* Sleeves */
      left:  { x: 0.30, y: 0.30, w: 0.40, h: 0.40 },
      right: { x: 0.30, y: 0.30, w: 0.40, h: 0.40 },
    },
  },

  jersey: {
    id: "jersey",
    label: "Jersey",
    sides: ["front", "back", "left", "right"],

    masks: {
      front: "/masks/jersey/front.png",
      back: "/masks/jersey/back.png",
      left: "/masks/jersey/left.png",
      right: "/masks/jersey/right.png",
    },

    printAreaRatio: {
      front: { x: 0.20, y: 0.18, w: 0.60, h: 0.70 },
      back:  { x: 0.20, y: 0.18, w: 0.60, h: 0.70 },

      left:  { x: 0.32, y: 0.32, w: 0.36, h: 0.36 },
      right: { x: 0.32, y: 0.32, w: 0.36, h: 0.36 },
    },
  },

  hoodie: {
    id: "hoodie",
    label: "Hoodie",
    sides: ["front", "back", "left", "right"],

    masks: {
      front: "/masks/hoodie/front.png",
      back: "/masks/hoodie/back.png",
      left: "/masks/hoodie/left.png",
      right: "/masks/hoodie/right.png",
    },

    printAreaRatio: {
      front: { x: 0.26, y: 0.28, w: 0.48, h: 0.50 },
      back:  { x: 0.26, y: 0.28, w: 0.48, h: 0.50 },

      left:  { x: 0.34, y: 0.34, w: 0.32, h: 0.32 },
      right: { x: 0.34, y: 0.34, w: 0.32, h: 0.32 },
    },
  },
};
