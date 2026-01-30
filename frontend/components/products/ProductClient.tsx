"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

/* ======================================================
   TYPES
====================================================== */

type VariantImage = {
  image: string;
  view: "FRONT" | "BACK" | "LEFT" | "RIGHT";
};

type Variant = {
  id: string;
  color: string;
  size: string;
  price: number;
  images: VariantImage[];
};

type Product = {
  id: string;
  name: string;
  description?: string;
  variants: Variant[];
};

/* ======================================================
   CONFIG
====================================================== */

const API_URL = "http://localhost:5000";

/* ======================================================
   COMPONENT
====================================================== */

export default function ProductClient({
  product,
}: {
  product: Product;
}) {
  const router = useRouter();
  const variants = product.variants ?? [];

  /* ================= COLORS ================= */

  const colors = useMemo(
    () =>
      Array.from(
        new Set(variants.map(v => v.color.toLowerCase()))
      ),
    [variants]
  );

  const [selectedColor, setSelectedColor] =
    useState<string | null>(null);

  useEffect(() => {
    if (!selectedColor && colors.length) {
      setSelectedColor(colors[0]);
    }
  }, [colors, selectedColor]);

  /* ================= SIZES ================= */

  const sizes = useMemo(() => {
    if (!selectedColor) return [];
    return variants
      .filter(v => v.color.toLowerCase() === selectedColor)
      .map(v => v.size);
  }, [variants, selectedColor]);

  const [selectedSize, setSelectedSize] =
    useState<string | null>(null);

  /* ================= VARIANT ================= */

  const selectedVariant = useMemo(() => {
    if (!selectedColor || !selectedSize) return null;
    return variants.find(
      v =>
        v.color.toLowerCase() === selectedColor &&
        v.size === selectedSize
    );
  }, [variants, selectedColor, selectedSize]);

  /* ================= IMAGES ================= */

  const images = useMemo(() => {
    if (selectedVariant?.images?.length) {
      return selectedVariant.images;
    }

    if (!selectedColor) return [];

    return (
      variants.find(
        v => v.color.toLowerCase() === selectedColor
      )?.images ?? []
    );
  }, [variants, selectedVariant, selectedColor]);

  const [activeImage, setActiveImage] =
    useState<string | null>(null);

  useEffect(() => {
    if (images.length) {
      setActiveImage(images[0].image);
    } else {
      setActiveImage(null);
    }
  }, [images]);

  /* ================= QUANTITY ================= */

  const [qty, setQty] = useState(1);

  /* ================= PRICE ================= */

  const unitPrice =
    selectedVariant?.price ?? variants[0]?.price ?? 0;

  const totalPrice = unitPrice * qty;

  /* ================= CTA ================= */

  const handleCreate = () => {
    if (!selectedVariant) return;

    router.push(
      `/editor?product=${product.id}&variant=${selectedVariant.id}`
    );
  };

  /* ======================================================
     UI
  ====================================================== */

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-10">

      {/* ================= LEFT ================= */}
      <div className="flex gap-4">

        {/* THUMBNAILS */}
        <div className="flex flex-col gap-3">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveImage(img.image)}
              className={`border rounded-md p-1 ${
                activeImage === img.image
                  ? "ring-2 ring-black"
                  : ""
              }`}
            >
              <img
                src={`${API_URL}/uploads/${encodeURIComponent(
                  img.image
                )}`}
                className="w-20 h-20 object-cover"
                alt=""
              />
            </button>
          ))}
        </div>

        {/* MAIN IMAGE */}
        <div className="flex-1 bg-gray-100 rounded-xl flex items-center justify-center">
          {activeImage && (
            <img
              src={`${API_URL}/uploads/${encodeURIComponent(
                activeImage
              )}`}
              className="max-h-[520px] object-contain"
              alt=""
            />
          )}
        </div>
      </div>

      {/* ================= RIGHT ================= */}
      <div>
        <h1 className="text-3xl font-bold">{product.name}</h1>

        <p className="text-2xl font-semibold mt-4">
          ₹{totalPrice}
        </p>

        {/* QUANTITY */}
        <div className="mt-6">
          <p className="font-medium mb-2">Quantity</p>
          <div className="flex gap-3 items-center">
            <button
              onClick={() =>
                setQty(q => Math.max(1, q - 1))
              }
              className="border px-3 py-1 rounded"
            >
              −
            </button>
            <span className="w-10 text-center">{qty}</span>
            <button
              onClick={() => setQty(q => q + 1)}
              className="border px-3 py-1 rounded"
            >
              +
            </button>
          </div>
        </div>

        {/* COLOR */}
        <div className="mt-6">
          <p className="font-medium mb-2">
            Color: {selectedColor}
          </p>
          <div className="flex gap-3">
            {colors.map(color => (
              <button
                key={color}
                onClick={() => {
                  setSelectedColor(color);
                  setSelectedSize(null);
                }}
                className={`w-9 h-9 rounded-full border-2 ${
                  selectedColor === color
                    ? "ring-2 ring-black"
                    : ""
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* SIZE */}
        <div className="mt-6">
          <p className="font-medium mb-2">Size</p>
          <div className="flex gap-3 flex-wrap">
            {sizes.map(size => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-4 py-2 border rounded-lg ${
                  selectedSize === size
                    ? "bg-black text-white"
                    : ""
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          disabled={!selectedVariant}
          onClick={handleCreate}
          className="mt-8 w-full bg-teal-600 text-white py-3 rounded-xl text-lg font-semibold hover:bg-teal-700 transition disabled:opacity-50"
        >
          Create Now
        </button>
      </div>
    </div>
  );
}
