/* ================= IMAGE VIEW ================= */

export type VariantImageView = "FRONT" | "BACK" | "LEFT" | "RIGHT";

/* ================= VARIANT IMAGE ================= */

export interface ProductVariantImage {
  id: string;
  view: VariantImageView;
  image: string; // filename only
}

/* ================= PRODUCT VARIANT ================= */

export interface ProductVariant {
  id: string;
  color: string;
  size: string;
  price: number;
  stock: number;

  images: ProductVariantImage[]; // ✅ FIXED
}

/* ================= PRODUCT ================= */

export interface Product {
  id: string;
  name: string;
  description?: string;

  audience: "MEN" | "WOMEN" | "KIDS" | "ACCESSORIES";
  productType:
    | "TSHIRT"
    | "SHIRT"
    | "HOODIE"
    | "SWEATSHIRT"
    | "JACKET"
    | "CAP"
    | "MUG"
    | "BAG"
    | "PHONE_CASE";

  basePrice: number;
  isActive: boolean;
  isAvailable: boolean;

  variants: ProductVariant[];
}
