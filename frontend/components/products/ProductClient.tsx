"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/types/product";

/* ======================================================
   CONFIG
====================================================== */

const API_URL = "http://localhost:5000";

/* IMAGE URL HELPER */
const getImageUrl = (imagePath: string | null | undefined): string | null => {
  if (!imagePath) return null;
  
  let p = String(imagePath).replace(/\\/g, "/").trim();
  p = p.replace(/^[A-Za-z]:\//, "");
  if (p.startsWith("uploads/")) p = "/" + p;
  
  if (p.startsWith("http")) return p;
  if (p.startsWith("/uploads/")) return `${API_URL}${p}`;
  if (p.startsWith("/")) return `${API_URL}${p}`;
  return `${API_URL}/uploads/${p}`;
};

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

  useEffect(() => {
    console.log('[ProductClient] Product loaded:', {
      id: product.id,
      name: product.name,
      variantCount: variants.length,
      variants: variants.slice(0, 3).map(v => ({
        color: v.color,
        size: v.size,
        imageCount: v.images?.length || 0,
        firstImage: v.images?.[0]?.image
      }))
    });
  }, [product, variants]);

  /* ================= COLORS ================= */

  const colors = useMemo(
    () =>
      Array.from(
        new Set(
          variants.map(v => v.color.toLowerCase())
        )
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

  const [imageRotation, setImageRotation] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const handleImageError = (imagePath: string) => {
    setFailedImages(prev => new Set(prev).add(imagePath));
    console.error('[ProductClient] Image failed to load:', imagePath, {
      normalizedUrl: getImageUrl(imagePath),
      timestamp: new Date().toISOString()
    });
  };

  useEffect(() => {
    if (images.length) {
      setActiveImage(images[0].image);
      setImageRotation(0);
      setFailedImages(new Set());
      console.log('[ProductClient] Images for selected variant:', {
        selectedColor,
        selectedSize,
        imageCount: images.length,
        images: images.map(img => ({
          original: img.image,
          normalized: getImageUrl(img.image)
        }))
      });
    } else {
      setActiveImage(null);
      setImageRotation(0);
      console.log('[ProductClient] No images for variant:', {
        selectedColor,
        selectedSize,
        allVariants: product.variants.map(v => ({
          color: v.color,
          size: v.size,
          imageCount: v.images?.length || 0
        }))
      });
    }
  }, [images]);

  // Description toggle for long product descriptions
  const [showFullDescription, setShowFullDescription] = useState(false);
  const MAX_DESC_LENGTH = 300;

  /* ================= QUANTITY ================= */

  const [qty, setQty] = useState(1);

  /* ================= PRICE ================= */

  const unitPrice =
    selectedVariant?.price ??
    product.minPrice ??
    0;

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
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-12 md:h-[600px]">

        {/* LEFT - IMAGE GALLERY */}
        <div className="flex gap-4 sticky top-12 h-fit">
          {/* THUMBNAILS */}
          <div className="flex flex-col gap-3 max-h-[550px] overflow-y-auto">
            {images.length > 0 ? (
              images.map((img, i) => {
                const imageUrl = getImageUrl(img.image);
                return (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img.image)}
                    className={`border-2 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md ${
                      activeImage === img.image
                        ? "ring-2 ring-teal-600 border-teal-600 shadow-lg"
                        : "border-gray-300 hover:border-teal-400"
                    }`}
                  >
                    <img
                      src={imageUrl || undefined}
                      className="w-24 h-24 object-cover"
                      alt={`Variant ${i + 1}`}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><rect width='100%' height='100%' fill='%23f3f4f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='12'>No Image</text></svg>";
                      }}
                    />
                  </button>
                );
              })
            ) : (
              <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-xs text-center">
                No images
              </div>
            )}
          </div>

          {/* MAIN IMAGE */}
          <div className="flex-1 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-gray-200 shadow-lg h-[500px]">
            {activeImage ? (
              <img
                src={getImageUrl(activeImage) || undefined}
                className="max-h-[380px] max-w-full object-contain p-4"
                alt="Product"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><rect width='100%' height='100%' fill='%23f3f4f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='20'>No Image Available</text></svg>";
                }}
              />
            ) : (
              <div className="text-center text-gray-500">
                <div className="text-5xl mb-3">📷</div>
                <div className="text-lg">Select a variant to view images</div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT - PRODUCT INFO */}
        <div className="space-y-6 overflow-y-auto pr-4 max-h-[600px]">
          {/* TITLE & PRICE */}
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>
            <div className="text-4xl font-bold text-teal-600 mb-2">
              ₹{totalPrice.toLocaleString()}
            </div>
            {qty > 1 && (
              <div className="text-sm text-gray-600">
                ₹{unitPrice.toLocaleString()} × {qty}
              </div>
            )}
          </div>

          {/* QUANTITY */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <p className="font-semibold text-gray-900 mb-3">
              Quantity
            </p>
            <div className="flex gap-4 items-center">
              <button
                onClick={() =>
                  setQty(q => Math.max(1, q - 1))
                }
                className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg font-bold text-lg hover:border-teal-600 hover:bg-teal-50 transition-colors"
              >
                −
              </button>
              <span className="w-12 text-center text-lg font-bold text-gray-900">
                {qty}
              </span>
              <button
                onClick={() => setQty(q => q + 1)}
                className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg font-bold text-lg hover:border-teal-600 hover:bg-teal-50 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* COLOR SELECTION */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <p className="font-semibold text-gray-900 mb-3">
              Color: <span className="capitalize text-teal-600">{selectedColor || 'Select'}</span>
            </p>
            <div className="flex gap-3 flex-wrap">
              {colors.map(color => (
                <button
                  key={color}
                  onClick={() => {
                    setSelectedColor(color);
                    setSelectedSize(null);
                  }}
                  className={`w-8 h-8 rounded-full border-2 transition-transform duration-200 transform hover:scale-110 ${
                    selectedColor === color
                      ? "ring-4 ring-teal-400 border-teal-600"
                      : "border-gray-300 hover:border-teal-500"
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* SIZE SELECTION */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <p className="font-semibold text-gray-900 mb-3">
              Size: <span className="text-teal-600">{selectedSize || 'Select'}</span>
            </p>
            <div className="flex gap-2 flex-wrap">
              {sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-5 py-2.5 border-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
                    selectedSize === size
                      ? "bg-gradient-to-r from-teal-600 to-teal-500 text-white border-teal-700 shadow-md"
                      : "border-gray-300 text-gray-700 hover:border-teal-500 hover:bg-gray-100"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* CTA BUTTON */}
          <button
            disabled={!selectedVariant}
            onClick={handleCreate}
            className={`w-full py-4 rounded-xl text-lg font-bold transition-all duration-200 transform active:scale-95 shadow-lg ${
              selectedVariant
                ? "bg-gradient-to-r from-teal-600 to-teal-500 text-white hover:from-teal-700 hover:to-teal-600 hover:shadow-xl"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {selectedVariant ? "🎨 Create Now" : "Select Size & Color"}
          </button>

          {/* DESCRIPTION */}
          {product.description && (
            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mt-6">
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">
                {product.description.length > MAX_DESC_LENGTH && !showFullDescription
                  ? `${product.description.slice(0, MAX_DESC_LENGTH).trim()}...`
                  : product.description}
              </p>

              {product.description.length > MAX_DESC_LENGTH && (
                <div className="mt-3">
                  <button
                    onClick={() => setShowFullDescription((s) => !s)}
                    className="text-sm font-semibold text-teal-600 hover:underline"
                  >
                    {showFullDescription ? 'Show less' : 'Read more'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SHIPPING POLICY */}
          <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">🚚 Shipping Policy</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>✓ Free shipping on orders above ₹500</li>
              <li>✓ Standard delivery: 5-7 business days</li>
              <li>✓ Express delivery: 2-3 business days (extra charges apply)</li>
              <li>✓ Orders are shipped Monday-Friday</li>
              <li>✓ We ship to all major cities across India</li>
              <li>✓ Track your order in real-time</li>
            </ul>
          </div>

          {/* RETURN POLICY */}
          <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">↩️ Return & Exchange Policy</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>✓ 30-day return window from delivery date</li>
              <li>✓ Product must be unused and in original packaging</li>
              <li>✓ Free return shipping for defective items</li>
              <li>✓ Exchange available for size or color variations</li>
              <li>✓ Refunds processed within 7-10 business days</li>
              <li>✓ Contact our support team for return authorization</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
