"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/types/product";
import api from "@/lib/axios";
import { useAuth } from "@/lib/useAuth";
import { useCart } from "@/lib/cart";

/* ======================================================
   CONFIG
====================================================== */

const API_URL = "http://localhost:5000";

/* IMAGE URL HELPER */
const getImageUrl = (imagePath: string | null | undefined): string | undefined => {
  if (!imagePath) return undefined;
  
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
  const [imageLoading, setImageLoading] = useState<Set<string>>(new Set());
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [imageMetadata, setImageMetadata] = useState<Map<string, any>>(new Map());
  const [showImageDetails, setShowImageDetails] = useState(false);

  // Navigation functions for zoom modal
  const navigateZoomImage = (direction: 'prev' | 'next') => {
    if (!zoomImage || images.length <= 1) return;
    const currentIndex = images.findIndex(img => img.image === zoomImage);
    if (currentIndex === -1) return;

    let newIndex;
    if (direction === 'prev') {
      newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    } else {
      newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    }
    setZoomImage(images[newIndex].image);
  };

  // Load image metadata
  const loadImageMetadata = async (imagePath: string) => {
    try {
      const img = new Image();
      img.onload = () => {
        setImageMetadata(prev => new Map(prev).set(imagePath, {
          width: img.naturalWidth,
          height: img.naturalHeight,
          aspectRatio: (img.naturalWidth / img.naturalHeight).toFixed(2),
          fileSize: 'Unknown', // Would need server-side info for this
          format: imagePath.split('.').pop()?.toUpperCase() || 'Unknown'
        }));
      };
      img.src = getImageUrl(imagePath) || '';
    } catch (error) {
      console.error('Failed to load image metadata:', error);
    }
  };

  // Keyboard navigation for zoom modal
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!zoomImage) return;

      if (e.key === 'Escape') {
        setZoomImage(null);
      } else if (e.key === 'ArrowLeft') {
        navigateZoomImage('prev');
      } else if (e.key === 'ArrowRight') {
        navigateZoomImage('next');
      }
    };

    if (zoomImage) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [zoomImage, images]);

  const handleImageError = (imagePath: string) => {
    setFailedImages(prev => new Set(prev).add(imagePath));
    setImageLoading(prev => {
      const newSet = new Set(prev);
      newSet.delete(imagePath);
      return newSet;
    });
    console.error('[ProductClient] Image failed to load:', imagePath, {
      normalizedUrl: getImageUrl(imagePath),
      timestamp: new Date().toISOString()
    });
  };

  const handleImageLoad = (imagePath: string) => {
    setImageLoading(prev => {
      const newSet = new Set(prev);
      newSet.delete(imagePath);
      return newSet;
    });
  };

  const handleImageLoadStart = (imagePath: string) => {
    setImageLoading(prev => new Set(prev).add(imagePath));
  };

  useEffect(() => {
    if (images.length) {
      setActiveImage(images[0].image);
      setImageRotation(0);
      setFailedImages(new Set());
      setImageLoading(new Set());
      setZoomImage(null);

      // Load metadata for all images
      images.forEach(img => {
        if (!imageMetadata.has(img.image)) {
          loadImageMetadata(img.image);
        }
      });

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
      setZoomImage(null);
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

  const { user, loading: authLoading } = useAuth();
  const { addToCart } = useCart();
  const [addingToCart, setAddingToCart] = useState(false);

  const handleCreate = () => {
    if (!selectedVariant) return;

    router.push(
      `/editor?product=${product.id}&variant=${selectedVariant.id}`
    );
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) return;

    try {
      setAddingToCart(true);

      // Add item to cart context
      addToCart({
        productId: product.id,
        variantId: selectedVariant.id,
        quantity: qty,
        price: selectedVariant.price || 0,
        name: product.name,
        size: selectedVariant.size,
        color: selectedVariant.color,
        imageUrl: getImageUrl(selectedVariant.images?.[0]?.image),
      });

      // Show success message or navigate to checkout
      // For now, we'll just add to cart and stay on the page
      // You could add a toast notification here
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Error adding to cart. Please try again.");
    } finally {
      setAddingToCart(false);
    }
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
                const isLoading = imageLoading.has(img.image);
                const hasFailed = failedImages.has(img.image);
                const viewLabel = img.view ? img.view.charAt(0).toUpperCase() + img.view.slice(1).toLowerCase() : `View ${i + 1}`;
                const altText = `${product.name} - ${selectedColor ? selectedColor.charAt(0).toUpperCase() + selectedColor.slice(1) : 'Product'} - ${viewLabel}`;
                const metadata = imageMetadata.get(img.image);
                const isHighRes = metadata && metadata.width >= 1000;

                return (
                  <div key={i} className="relative group">
                    <button
                      onClick={() => {
                        setActiveImage(img.image);
                        setZoomImage(null);
                      }}
                      className={`border-2 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md relative ${
                        activeImage === img.image
                          ? "ring-2 ring-teal-600 border-teal-600 shadow-lg"
                          : "border-gray-300 hover:border-teal-400"
                      }`}
                      title={`${viewLabel} view - Click to view details`}
                    >
                      {isLoading && (
                        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center z-10">
                          <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                      {!hasFailed ? (
                        <img
                          src={imageUrl || undefined}
                          className={`w-24 h-24 object-cover transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                          alt={altText}
                          onLoad={() => handleImageLoad(img.image)}
                          onLoadStart={() => handleImageLoadStart(img.image)}
                          onError={() => handleImageError(img.image)}
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gray-200 flex items-center justify-center">
                          <div className="text-xs text-gray-500 text-center p-1">
                            Image<br/>Failed
                          </div>
                        </div>
                      )}

                      {/* Hover Details */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="text-center">
                          {metadata ? `${metadata.width}×${metadata.height}` : 'Loading...'}
                        </div>
                      </div>
                    </button>

                    {/* View Label with Details */}
                    <div className="text-xs text-gray-600 text-center mt-1 font-medium">
                      {viewLabel}
                      {metadata && (
                        <div className="text-gray-500 text-xs">
                          {metadata.width}×{metadata.height}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-xs text-center">
                No images
              </div>
            )}

            {/* Image Details Toggle */}
            {images.length > 0 && (
              <button
                onClick={() => setShowImageDetails(!showImageDetails)}
                className="mt-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors duration-200 flex items-center gap-2"
              >
                <span>📊</span>
                <span>{showImageDetails ? 'Hide' : 'Show'} Image Details</span>
              </button>
            )}

            {/* IMAGE DETAILS PANEL */}
            {showImageDetails && images.length > 0 && (
              <div className="mt-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span>🖼️</span>
                  Product Image Details
                </h3>

                <div className="space-y-3">
                  {images.map((img, i) => {
                    const metadata = imageMetadata.get(img.image);
                    const viewLabel = img.view ? img.view.charAt(0).toUpperCase() + img.view.slice(1).toLowerCase() : `View ${i + 1}`;
                    const isHighRes = metadata && metadata.width >= 1000;

                    return (
                      <div key={i} className={`p-3 rounded-lg border transition-colors ${
                        activeImage === img.image
                          ? 'bg-teal-50 border-teal-300'
                          : 'bg-white border-gray-200'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 mb-1">
                              {viewLabel} View
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              {metadata ? (
                                <>
                                  <div className="flex items-center gap-4">
                                    <span>📐 {metadata.width} × {metadata.height} px</span>
                                    <span>📏 Ratio: {metadata.aspectRatio}</span>
                                    <span>📁 Format: {metadata.format}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      isHighRes
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-blue-100 text-blue-800'
                                    }`}>
                                      {isHighRes ? 'High Resolution' : 'Standard Resolution'}
                                    </span>
                                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                      {metadata.width * metadata.height > 1000000 ? 'Large' : 'Medium'} Size
                                    </span>
                                  </div>
                                </>
                              ) : (
                                <div className="text-gray-500">Loading image metadata...</div>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => setActiveImage(img.image)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                              activeImage === img.image
                                ? 'bg-teal-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {activeImage === img.image ? 'Active' : 'View'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Summary Stats */}
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-900">Total Images:</span>
                      <span className="ml-2 text-gray-700">{images.length}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">High Res:</span>
                      <span className="ml-2 text-gray-700">
                        {images.filter(img => {
                          const metadata = imageMetadata.get(img.image);
                          return metadata && metadata.width >= 1000;
                        }).length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* MAIN IMAGE */}
          <div className="flex-1 bg-linear-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-gray-200 shadow-lg h-[500px] relative">
            {activeImage ? (
              <>
                {(() => {
                  const activeImageData = images.find(img => img.image === activeImage);
                  const imageUrl = getImageUrl(activeImage);
                  const isLoading = imageLoading.has(activeImage);
                  const hasFailed = failedImages.has(activeImage);
                  const viewLabel = activeImageData?.view ? activeImageData.view.charAt(0).toUpperCase() + activeImageData.view.slice(1).toLowerCase() : 'Product';
                  const altText = `${product.name} - ${selectedColor ? selectedColor.charAt(0).toUpperCase() + selectedColor.slice(1) : 'Product'} - ${viewLabel} view`;
                  const metadata = imageMetadata.get(activeImage);
                  const isHighRes = metadata && metadata.width >= 1000;

                  return (
                    <div className="relative w-full h-full flex items-center justify-center group cursor-zoom-in"
                         onClick={() => setZoomImage(activeImage)}>
                      {isLoading && (
                        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center z-10">
                          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                      {!hasFailed ? (
                        <img
                          src={imageUrl || undefined}
                          className={`max-h-[380px] max-w-full object-contain p-4 transition-all duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'} group-hover:scale-105`}
                          alt={altText}
                          onLoad={() => handleImageLoad(activeImage)}
                          onLoadStart={() => handleImageLoadStart(activeImage)}
                          onError={() => handleImageError(activeImage)}
                        />
                      ) : (
                        <div className="text-center text-gray-500 p-8">
                          <div className="text-6xl mb-4">📷</div>
                          <div className="text-lg font-medium">Image Failed to Load</div>
                          <div className="text-sm text-gray-400 mt-2">Please try refreshing the page</div>
                        </div>
                      )}

                      {/* Resolution Badge */}
                      {metadata && (
                        <>
                          <div className="absolute top-4 left-4">
                            <div className="bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm font-medium">
                              {metadata.width}×{metadata.height}
                            </div>
                          </div>

                          {/* Image Info Overlay */}
                          <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-80 text-white p-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <div className="flex justify-between items-center text-sm">
                              <div>
                                <div className="font-medium">{viewLabel} View</div>
                                <div className="text-gray-300">
                                  {metadata.format} • {metadata.aspectRatio} ratio • {
                                    metadata.width * metadata.height > 1000000 ? 'Large' : 'Medium'
                                  } size
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-gray-300">Click to zoom</div>
                                <div className="text-lg">🔍</div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Zoom Indicator */}
                      <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1">
                        <span>🔍</span>
                        <span>Click to zoom</span>
                      </div>

                      {/* View Label */}
                      <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 text-gray-800 px-3 py-1 rounded-lg text-sm font-medium shadow-md">
                        {viewLabel} View
                      </div>
                    </div>
                  );
                })()}
              </>
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
                      ? "bg-linear-to-r from-teal-600 to-teal-500 text-white border-teal-700 shadow-md"
                      : "border-gray-300 text-gray-700 hover:border-teal-500 hover:bg-gray-100"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* CTA BUTTONS */}
          <div className={`grid gap-3 ${user ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'}`}>
            {/* CREATE NOW BUTTON */}
            <button
              disabled={!selectedVariant}
              onClick={handleCreate}
              className={`py-4 rounded-xl text-lg font-bold transition-all duration-200 transform active:scale-95 shadow-lg ${
                selectedVariant
                  ? "bg-linear-to-r from-teal-600 to-teal-500 text-white hover:from-teal-700 hover:to-teal-600 hover:shadow-xl"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {selectedVariant ? "🎨 Create Now" : "Select Size"}
            </button>

            {/* CART/CHECKOUT BUTTONS - Only show if size selected */}
            {selectedVariant && (
              <>
                {user ? (
                  // Logged in: Show only Checkout button
                  <button
                    disabled={addingToCart}
                    onClick={handleAddToCart}
                    className="py-4 rounded-xl text-lg font-bold transition-all duration-200 transform active:scale-95 shadow-lg bg-linear-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 hover:shadow-xl disabled:opacity-60"
                  >
                    {addingToCart ? (
                      <span>⏳ Adding...</span>
                    ) : (
                      <span>🛒 Add to Cart</span>
                    )}
                  </button>
                ) : (
                  // Not logged in: Show both Login and Checkout buttons
                  <>
                    <button
                      onClick={() => router.push("/login")}
                      className="py-4 rounded-xl text-lg font-bold transition-all duration-200 transform active:scale-95 shadow-lg bg-linear-to-r from-gray-600 to-gray-500 text-white hover:from-gray-700 hover:to-gray-600 hover:shadow-xl"
                    >
                      <span>🔑 Login</span>
                    </button>
                    <button
                      onClick={handleAddToCart}
                      className="py-4 rounded-xl text-lg font-bold transition-all duration-200 transform active:scale-95 shadow-lg bg-linear-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 hover:shadow-xl"
                    >
                      <span>🛒 Add to Cart</span>
                    </button>
                  </>
                )}
              </>
            )}
          </div>

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
            <div className="text-sm text-gray-700 space-y-1 whitespace-pre-line">
              {product.shippingPolicy || "Free shipping on orders above ₹500\nStandard delivery: 5-7 business days\nExpress delivery: 2-3 business days (extra charges apply)"}
            </div>
          </div>

          {/* RETURN POLICY */}
          <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">↩️ Return & Exchange Policy</h3>
            <div className="text-sm text-gray-700 space-y-1 whitespace-pre-line">
              {product.returnPolicy || "30-day return window from delivery date\nProduct must be unused and in original packaging\nFree return shipping for defective items"}
            </div>
          </div>
        </div>
      </div>

      {/* ZOOM MODAL */}
      {zoomImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setZoomImage(null)}
        >
          <div className="relative max-w-4xl max-h-full flex items-center">
            {/* Previous Button */}
            {images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateZoomImage('prev');
                }}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-70 text-white p-3 rounded-full hover:bg-opacity-90 transition-all duration-200 text-2xl z-10"
              >
                ‹
              </button>
            )}

            <div className="relative">
              <button
                onClick={() => setZoomImage(null)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 text-2xl font-bold z-20"
              >
                ✕
              </button>
              {(() => {
                const zoomImageData = images.find(img => img.image === zoomImage);
                const imageUrl = getImageUrl(zoomImage);
                const currentIndex = images.findIndex(img => img.image === zoomImage) + 1;
                const viewLabel = zoomImageData?.view ? zoomImageData.view.charAt(0).toUpperCase() + zoomImageData.view.slice(1).toLowerCase() : 'Product';
                const altText = `${product.name} - ${selectedColor ? selectedColor.charAt(0).toUpperCase() + selectedColor.slice(1) : 'Product'} - ${viewLabel} view (zoomed)`;
                const metadata = imageMetadata.get(zoomImage);
                const isHighRes = metadata && metadata.width >= 1000;

                return (
                  <div className="relative">
                    <img
                      src={imageUrl || undefined}
                      alt={altText}
                      className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                      onClick={(e) => e.stopPropagation()}
                    />

                    {/* Enhanced Zoom Info */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                      <div className="flex gap-2">
                        <div className="bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm font-medium">
                          {currentIndex} of {images.length}
                        </div>
                      </div>
                      <button
                        onClick={() => setZoomImage(null)}
                        className="text-white hover:text-gray-300 text-2xl font-bold bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Detailed Image Info */}
                    {metadata && (
                      <div className="absolute bottom-4 left-4 bg-black bg-opacity-80 text-white p-4 rounded-lg max-w-md">
                        <div className="font-medium text-lg mb-2">{viewLabel} View</div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Resolution:</span>
                            <span className="font-medium">{metadata.width} × {metadata.height} px</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Aspect Ratio:</span>
                            <span className="font-medium">{metadata.aspectRatio}:1</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Format:</span>
                            <span className="font-medium">{metadata.format}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Quality:</span>
                            <span className={`font-medium ${isHighRes ? 'text-green-400' : 'text-blue-400'}`}>
                              {isHighRes ? 'High Resolution' : 'Standard Resolution'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Zoom Instructions */}
                    <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg text-sm text-center max-w-xs">
                      <div>Click outside or press ESC to close</div>
                      {images.length > 1 && <div className="mt-1">Use arrow keys to navigate</div>}
                      {metadata && (
                        <div className="mt-2 text-xs text-gray-300">
                          {metadata.width > 1920 ? 'Ultra HD' : metadata.width > 1280 ? 'Full HD' : 'HD'} • {metadata.format}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Next Button */}
            {images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateZoomImage('next');
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-70 text-white p-3 rounded-full hover:bg-opacity-90 transition-all duration-200 text-2xl z-10"
              >
                ›
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
