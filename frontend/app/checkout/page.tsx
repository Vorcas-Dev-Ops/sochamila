"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import api from "@/lib/axios";
import { useCart } from "@/lib/cart";

function CheckoutPageContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { items: cartItems, totalPrice: cartTotal, clearCart, updateQuantity, removeFromCart, addToCart } = useCart();

  // Query parameters from product page or editor (for direct checkout)
  const imageUrl = params.get("image");
  const mockupUrl = params.get("mockup");
  const pdfUrl = params.get("pdf");
  const productId = params.get("product");
  const variantId = params.get("variant");
  const quantityParam = params.get("quantity");

  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showLoginNotification, setShowLoginNotification] = useState(false);
  const [quantity, setQuantity] = useState(parseInt(quantityParam || "1"));
  const [variantData, setVariantData] = useState<any>(null);
  const [productData, setProductData] = useState<any>(null);
  const [productError, setProductError] = useState<string | null>(null);
  const [productDataMap, setProductDataMap] = useState<Map<string, any>>(new Map());
  const [userId, setUserId] = useState<string | null>(null);

  // Check if this is a direct checkout (from product page) or cart checkout
  const isDirectCheckout = !!(productId && variantId);
  const isCartCheckout = cartItems.length > 0 && !isDirectCheckout;

  // Check if this is a custom design order or plain product order
  const isCustomDesign = !!(imageUrl || mockupUrl || pdfUrl);

  // Fetch variant details and user info on mount (only for direct checkout)
  useEffect(() => {
    // If this is cart checkout, we don't need to fetch variant data
    if (isCartCheckout) {
      setLoading(false);
      return;
    }

    const init = async () => {
      try {
        // Get user from token
        const token = sessionStorage.getItem("token") || localStorage.getItem("token");
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            setUserId(payload.id);
          } catch (e) {
            console.error("Failed to decode token:", e);
          }
        }

        // Fetch size details if we have variantId
        if (variantId) {
          try {
            const res = await api.get(`/products/size/${variantId}`);
            setVariantData(res.data?.data || res.data?.size);
          } catch (e) {
            console.error("Failed to fetch size:", e);
          }
        }

        // Fetch product details if we have productId
        if (productId) {
          try {
            console.log("Fetching product with ID:", productId);
            const res = await api.get(`/products/${productId}`);
            console.log("Product API response:", res.data);
            console.log("Product data structure:", res.data?.data);
            if (res.data?.success && res.data?.data) {
              setProductData(res.data.data);
              setProductError(null);
              console.log("Set productData to:", res.data.data);
            } else {
              throw new Error("Invalid response format");
            }
          } catch (e: any) {
            console.error("Failed to fetch product:", e);
            console.error("Error details:", e.response?.data || e.message);
            setProductError(e.response?.data?.message || e.message || "Failed to load product details");
          }
        }
      } finally {
        setLoading(false);
      }
    };

    if (isDirectCheckout) {
      init();
    } else {
      setLoading(false);
    }
  }, [variantId || null, productId || null, isDirectCheckout, isCartCheckout]);

  // Fetch product data for cart items
  useEffect(() => {
    if (isCartCheckout && cartItems.length > 0) {
      const fetchProductData = async () => {
        const newProductDataMap = new Map();
        for (const item of cartItems) {
          if (!newProductDataMap.has(item.productId)) {
            try {
              const res = await api.get(`/products/${item.productId}`);
              if (res.data?.success && res.data?.data) {
                newProductDataMap.set(item.productId, res.data.data);
              }
            } catch (e) {
              console.error(`Failed to fetch product ${item.productId}:`, e);
            }
          }
        }
        setProductDataMap(newProductDataMap);
      };
      fetchProductData();
    }
  }, [cartItems, isCartCheckout]);

  const handleSizeChange = (itemId: string, newSize: string) => {
    const item = cartItems.find(i => i.id === itemId);
    if (!item) return;

    const product = productDataMap.get(item.productId);
    if (!product) return;

    // Find the variant with the new size
    const newVariant = product.variants?.find((v: any) => v.size === newSize);
    if (!newVariant) return;

    // Check if an item with the new size already exists in cart
    const existingItemWithNewSize = cartItems.find(
      i => i.productId === item.productId && i.variantId === newVariant.id
    );

    if (existingItemWithNewSize && existingItemWithNewSize.id !== itemId) {
      // If the new size already exists, merge quantities and remove the old item
      updateQuantity(existingItemWithNewSize.id, existingItemWithNewSize.quantity + item.quantity);
      removeFromCart(itemId);
    } else {
      // Otherwise, just update the size of the current item
      removeFromCart(itemId);
      addToCart({
        productId: item.productId,
        variantId: newVariant.id,
        quantity: item.quantity,
        price: newVariant.price,
        name: item.name,
        size: newSize,
        color: item.color,
        imageUrl: item.imageUrl
      });
    }
  };

  const handleAddAnotherSize = (itemId: string) => {
    const item = cartItems.find(i => i.id === itemId);
    if (!item) return;

    const product = productDataMap.get(item.productId);
    if (!product || !product.variants) return;

    // Find available sizes that are not already in cart for this product
    const cartVariantIds = cartItems
      .filter(i => i.productId === item.productId)
      .map(i => i.variantId);
    
    const availableVariants = product.variants.filter(
      (v: any) => !cartVariantIds.includes(v.id)
    );

    if (availableVariants.length === 0) {
      setError("All available sizes for this product are already in your cart.");
      setTimeout(() => setError(""), 3000);
      return;
    }

    // Add the first available size with quantity 1
    const newVariant = availableVariants[0];
    addToCart({
      productId: item.productId,
      variantId: newVariant.id,
      quantity: 1,
      price: newVariant.price,
      name: item.name,
      size: newVariant.size,
      color: item.color,
      imageUrl: item.imageUrl
    });
  };

  const getAvailableSizesForProduct = (productId: string) => {
    const product = productDataMap.get(productId);
    if (!product || !product.variants) return [];

    const cartVariantIds = cartItems
      .filter(i => i.productId === productId)
      .map(i => i.variantId);

    return product.variants.filter((v: any) => !cartVariantIds.includes(v.id));
  };

  async function handlePlaceOrder() {
    // Get user from token
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    if (!token) {
      setShowLoginNotification(true);
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserId(payload.id);
    } catch {
      setError("Invalid session. Please login again.");
      return;
    }

    setPlacing(true);
    setError("");

    try {
      let items: any[] = [];
      let totalAmount = 0;

      if (isCartCheckout) {
        // Handle cart checkout
        items = cartItems.map(cartItem => ({
          sizeId: cartItem.variantId, // Assuming variantId maps to sizeId for now
          quantity: cartItem.quantity,
          price: cartItem.price,
          imageUrl: cartItem.imageUrl || undefined,
          // For cart items, we don't have mockupUrl or pdfUrl from the cart context
        }));
        totalAmount = cartTotal;
      } else if (isDirectCheckout) {
        // Handle direct checkout
        if (!variantData?.sizeId) {
          setError("Missing size information for this variant");
          return;
        }

        items = [
          {
            sizeId: variantData.sizeId,
            quantity,
            price: variantData.price || 0,
            imageUrl: imageUrl || undefined,
            mockupUrl: mockupUrl || undefined,
            pdfUrl: pdfUrl || undefined,
          },
        ];
        totalAmount = (variantData.price || 0) * quantity;
      }

      await api.post("/orders", {
        userId,
        totalAmount,
        items,
      });

      // Clear cart after successful order
      if (isCartCheckout) {
        clearCart();
      }

      router.push("/order-success");
    } catch (err: any) {
      console.error("Order error:", err);
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to place order"
      );
    } finally {
      setPlacing(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center">
        <p className="text-gray-600">Loading checkout...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">
        {isCartCheckout ? "Cart Checkout" : "Order Review"}
      </h1>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 font-semibold">Error</p>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* LOGIN NOTIFICATION */}
      {showLoginNotification && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-blue-500 text-xl">🔒</div>
            <div className="flex-1">
              <p className="text-blue-800 font-semibold mb-1">Login Required</p>
              <p className="text-blue-600 text-sm mb-3">Please login to your account to place an order and complete your purchase.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => router.push("/login")}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
                >
                  Login
                </button>
                <button
                  onClick={() => setShowLoginNotification(false)}
                  className="px-4 py-2 border border-blue-300 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-100 transition"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ORDER PREVIEW */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
        {isCartCheckout ? (
          /* CART CHECKOUT */
          <>
            <h2 className="text-lg font-semibold mb-4">Your Cart</h2>
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-start gap-4 p-4 bg-white rounded-lg border hover:shadow-md transition-shadow">
                  <div className="relative group">
                    {item.imageUrl ? (
                      <div className="relative">
                        <img
                          src={item.imageUrl}
                          alt={`${item.name} - ${item.color}`}
                          className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 hover:border-teal-400 transition-colors cursor-zoom-in"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><rect width='100%' height='100%' fill='%23f3f4f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='10'>No Image</text></svg>";
                          }}
                          onClick={() => {
                            // Simple zoom modal for cart items
                            const modal = document.createElement('div');
                            modal.className = 'fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4';
                            modal.innerHTML = `
                              <div class="relative max-w-md max-h-full">
                                <button class="absolute -top-12 right-0 text-white hover:text-gray-300 text-2xl font-bold">✕</button>
                                <img src="${item.imageUrl}" alt="${item.name}" class="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl" />
                                <div class="absolute bottom-4 left-4 bg-black bg-opacity-80 text-white p-3 rounded-lg">
                                  <div class="font-medium">${item.name}</div>
                                  <div class="text-sm text-gray-300">${item.color} • ${item.size}</div>
                                </div>
                              </div>
                            `;
                            modal.onclick = (e) => {
                              if (e.target === modal || (e.target as HTMLElement).textContent === '✕') {
                                document.body.removeChild(modal);
                              }
                            };
                            document.body.appendChild(modal);
                          }}
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 text-center opacity-0 group-hover:opacity-100 transition-opacity rounded-b-lg">
                          Click to zoom
                        </div>
                      </div>
                    ) : (
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-gray-300">
                        <span className="text-gray-500 text-xs text-center">No<br/>Image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 text-lg">{item.name}</h3>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                        title="Remove item"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color.toLowerCase() }}></span>
                          {item.color}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Qty:</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 text-sm"
                            >
                              -
                            </button>
                            <span className="px-2 py-1 border border-gray-300 rounded bg-white text-sm min-w-[40px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 text-sm"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Size:</span>
                          <select
                            value={item.size}
                            onChange={(e) => handleSizeChange(item.id, e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded bg-white text-sm"
                          >
                            {productDataMap.get(item.productId)?.variants?.map((variant: any) => (
                              <option key={variant.id} value={variant.size}>
                                {variant.size}
                              </option>
                            )) || (
                              <option value={item.size}>{item.size}</option>
                            )}
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        ₹{item.price.toLocaleString()} each
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900 text-lg">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </div>
                        {item.quantity > 1 && (
                          <div className="text-xs text-gray-500">
                            {item.quantity} × ₹{item.price.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Add Another Size Button */}
                    {getAvailableSizesForProduct(item.productId).length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => handleAddAnotherSize(item.id)}
                          className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                          Add another size ({getAvailableSizesForProduct(item.productId).length} available)
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between pt-4 border-t text-lg font-bold">
              <span>Total:</span>
              <span>₹{cartTotal.toLocaleString()}</span>
            </div>

            {/* ORDER SUMMARY */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>📋</span>
                Order Summary
              </h3>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-sm text-gray-700 mb-2">
                  <span className="font-semibold">Items:</span> {cartItems.length} product{cartItems.length !== 1 ? 's' : ''} in cart
                </p>
                <p className="text-sm text-gray-700 mb-2">
                  <span className="font-semibold">Total Quantity:</span> {cartItems.reduce((sum, item) => sum + item.quantity, 0)} units
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Total Amount:</span> ₹{cartTotal.toLocaleString()}
                </p>
              </div>
            </div>
          </>
        ) : (
          /* DIRECT CHECKOUT */
          <>
            {/* DESIGN PREVIEW - Only show if custom design */}
            {isCustomDesign && (
              <>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span>🎨</span>
                  Your Custom Design
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {imageUrl && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-700">Your Design Upload</p>
                        <div className="flex gap-2">
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">HD Quality</span>
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">Custom</span>
                        </div>
                      </div>
                      <div className="relative group">
                        <img
                          src={imageUrl}
                          alt="Your Custom Design"
                          className="w-full border-2 border-gray-200 rounded-lg object-cover max-h-64 hover:border-teal-400 transition-colors cursor-zoom-in"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><rect width='100%' height='100%' fill='%23f3f4f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='14'>Design Image Failed to Load</text></svg>";
                          }}
                          onClick={() => {
                            const modal = document.createElement('div');
                            modal.className = 'fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4';
                            modal.innerHTML = `
                              <div class="relative max-w-2xl max-h-full">
                                <button class="absolute -top-12 right-0 text-white hover:text-gray-300 text-2xl font-bold">✕</button>
                                <img src="${imageUrl}" alt="Your Custom Design" class="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl" />
                                <div class="absolute bottom-4 left-4 bg-black bg-opacity-80 text-white p-4 rounded-lg">
                                  <div class="font-medium text-lg mb-1">Your Custom Design</div>
                                  <div class="text-sm text-gray-300">High-quality print-ready design</div>
                                </div>
                              </div>
                            `;
                            modal.onclick = (e) => {
                              if (e.target === modal || (e.target as HTMLElement).textContent === '✕') {
                                document.body.removeChild(modal);
                              }
                            };
                            document.body.appendChild(modal);
                          }}
                        />
                        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                          Click to zoom
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 text-center">
                        Your uploaded design will be printed exactly as shown
                      </div>
                    </div>
                  )}
                  {mockupUrl && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-700">Product Preview</p>
                        <div className="flex gap-2">
                          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-medium">Mockup</span>
                          <span className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full font-medium">Preview</span>
                        </div>
                      </div>
                      <div className="relative group">
                        <img
                          src={mockupUrl}
                          alt="Product Mockup Preview"
                          className="w-full border-2 border-gray-200 rounded-lg object-cover max-h-64 hover:border-teal-400 transition-colors cursor-zoom-in"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><rect width='100%' height='100%' fill='%23f3f4f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='14'>Mockup Failed to Load</text></svg>";
                          }}
                          onClick={() => {
                            const modal = document.createElement('div');
                            modal.className = 'fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4';
                            modal.innerHTML = `
                              <div class="relative max-w-2xl max-h-full">
                                <button class="absolute -top-12 right-0 text-white hover:text-gray-300 text-2xl font-bold">✕</button>
                                <img src="${mockupUrl}" alt="Product Mockup Preview" class="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl" />
                                <div class="absolute bottom-4 left-4 bg-black bg-opacity-80 text-white p-4 rounded-lg">
                                  <div class="font-medium text-lg mb-1">Product Preview</div>
                                  <div class="text-sm text-gray-300">How your design will look on the final product</div>
                                </div>
                              </div>
                            `;
                            modal.onclick = (e) => {
                              if (e.target === modal || (e.target as HTMLElement).textContent === '✕') {
                                document.body.removeChild(modal);
                              }
                            };
                            document.body.appendChild(modal);
                          }}
                        />
                        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                          Click to zoom
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 text-center">
                        Preview of your design on the actual product
                      </div>
                    </div>
                  )}
                </div>
                <hr className="my-6" />
              </>
            )}

            {/* ORDER DETAILS */}
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>📋</span>
              Order Details
            </h2>
            <div className="space-y-4 mb-6">
              {/* Product Information Card */}
              {productError ? (
                <div className="flex items-center justify-center p-8 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-center">
                    <div className="text-red-600 mb-2">⚠️</div>
                    <p className="text-red-700 font-medium">Failed to load product details</p>
                    <p className="text-red-600 text-sm mt-1">{productError}</p>
                    <p className="text-xs text-gray-400 mt-2">Please try refreshing the page</p>
                  </div>
                </div>
              ) : productData ? (
                <div className="flex items-start gap-4 p-4 bg-white rounded-lg border hover:shadow-md transition-shadow">
                  <div className="relative group">
                    {productData?.images?.[0]?.image ? (
                      <div className="relative">
                        <img
                          src={productData.images[0].image}
                          alt={productData.name || "Product"}
                          className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 hover:border-teal-400 transition-colors cursor-zoom-in"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><rect width='100%' height='100%' fill='%23f3f4f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='10'>No Image</text></svg>";
                          }}
                          onClick={() => {
                            const modal = document.createElement('div');
                            modal.className = 'fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4';
                            modal.innerHTML = `
                              <div class="relative max-w-2xl max-h-full">
                                <button class="absolute -top-12 right-0 text-white hover:text-gray-300 text-2xl font-bold">✕</button>
                                <img src="${productData.images[0].image}" alt="${productData.name || 'Product'}" class="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl" />
                                <div class="absolute bottom-4 left-4 bg-black bg-opacity-80 text-white p-4 rounded-lg">
                                  <div class="font-medium text-lg mb-1">${productData.name || 'Product'}</div>
                                  <div class="text-sm text-gray-300">High-quality product image</div>
                                </div>
                              </div>
                            `;
                            modal.onclick = (e) => {
                              if (e.target === modal || (e.target as HTMLElement).textContent === '✕') {
                                document.body.removeChild(modal);
                              }
                            };
                            document.body.appendChild(modal);
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {productData?.name || "Product"}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          {variantData?.color && (
                            <div className="flex items-center gap-1">
                              <div
                                className="w-3 h-3 rounded-full border border-gray-300"
                                style={{ backgroundColor: variantData.color.toLowerCase() }}
                              ></div>
                              <span className="text-sm text-gray-600 capitalize">{variantData.color}</span>
                            </div>
                          )}
                          {variantData?.size && (
                            <span className="text-sm text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                              Size: {variantData.size}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {isCustomDesign && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">Custom Design</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-lg">₹{variantData?.price || 0}</div>
                        <div className="text-sm text-gray-500">per item</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Quantity:</span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="px-2 py-1 border rounded hover:bg-gray-100 text-sm"
                          >
                            -
                          </button>
                          <span className="px-3 py-1 border rounded bg-white text-sm min-w-[40px] text-center">{quantity}</span>
                          <button
                            onClick={() => setQuantity(quantity + 1)}
                            className="px-2 py-1 border rounded hover:bg-gray-100 text-sm"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="font-bold text-lg">
                        ₹{((variantData?.price || 0) * quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center p-8 bg-white rounded-lg border">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-2"></div>
                    <p className="text-gray-600">Loading product details...</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {variantData?.color && variantData?.size 
                        ? `${variantData.color} ${variantData.size} variant`
                        : 'Fetching product information'
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* PRODUCT DETAILS SUMMARY */}
            {productData && variantData && (
              <div className="mt-6 pt-6 border-t">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span>ℹ️</span>
                  Product Details
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-600 font-semibold mb-1">Product Name</p>
                    <p className="text-sm text-gray-900 font-medium">{productData.name}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-600 font-semibold mb-1">Color</p>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: variantData.color.toLowerCase() }}
                      ></div>
                      <p className="text-sm text-gray-900 font-medium capitalize">{variantData.color}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-600 font-semibold mb-1">Size</p>
                    <p className="text-sm text-gray-900 font-medium">{variantData.size}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-600 font-semibold mb-1">Unit Price</p>
                    <p className="text-sm text-gray-900 font-medium">₹{variantData.price?.toLocaleString() || 0}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-600 font-semibold mb-1">Quantity</p>
                    <p className="text-sm text-gray-900 font-medium">{quantity} unit{quantity !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="bg-teal-50 p-4 rounded-lg border-2 border-teal-200">
                    <p className="text-xs text-teal-700 font-semibold mb-1">Total Price</p>
                    <p className="text-lg text-teal-900 font-bold">₹{((variantData.price || 0) * quantity).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* PLACE ORDER */}
      <div className="flex gap-3">
        <button
          onClick={() => router.back()}
          className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
        >
          Back
        </button>
        <button
          onClick={handlePlaceOrder}
          disabled={placing || (isDirectCheckout && (!variantData || !userId)) || (isCartCheckout && cartItems.length === 0)}
          className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {placing ? "Placing Order..." : "Place Order"}
        </button>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto px-4 py-10 text-center">
        <p className="text-gray-600">Loading checkout...</p>
      </div>
    }>
      <CheckoutPageContent />
    </Suspense>
  );
}
