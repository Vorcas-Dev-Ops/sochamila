"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/axios";

export default function CheckoutPage() {
  const params = useSearchParams();
  const router = useRouter();

  // Query parameters from product page or editor
  const imageUrl = params.get("image");
  const mockupUrl = params.get("mockup");
  const pdfUrl = params.get("pdf");
  const productId = params.get("product");
  const variantId = params.get("variant");
  const quantityParam = params.get("quantity");

  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(parseInt(quantityParam || "1"));
  const [variantData, setVariantData] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Check if this is a custom design order or plain product order
  const isCustomDesign = !!(imageUrl || mockupUrl || pdfUrl);

  // Fetch variant details and user info on mount
  useEffect(() => {
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
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [variantId]);

  async function handlePlaceOrder() {
    if (!variantId || !userId) {
      setError("Missing variant or user information");
      return;
    }

    if (!variantData?.sizeId) {
      setError("Missing size information for this variant");
      return;
    }

    setPlacing(true);
    setError("");
    try {
      // Build items array in the format the backend expects
      const items = [
        {
          sizeId: variantData.sizeId,
          quantity,
          price: variantData.price || 0,
          imageUrl: imageUrl || undefined,
          mockupUrl: mockupUrl || undefined,
          pdfUrl: pdfUrl || undefined,
        },
      ];

      // Calculate total amount
      const totalAmount = (variantData.price || 0) * quantity;

      await api.post("/orders", {
        userId,
        totalAmount,
        items,
      });

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
      <h1 className="text-3xl font-bold mb-8">Order Review</h1>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 font-semibold">Error</p>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* ORDER PREVIEW */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
        {/* DESIGN PREVIEW - Only show if custom design */}
        {isCustomDesign && (
          <>
            <h2 className="text-lg font-semibold mb-4">Your Design</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {imageUrl && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Design Upload:</p>
                  <img
                    src={imageUrl}
                    alt="Design"
                    className="w-full border rounded-lg object-cover max-h-48"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect width='100%' height='100%' fill='%23f3f4f6'/></svg>";
                    }}
                  />
                </div>
              )}
              {mockupUrl && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Mockup Preview:</p>
                  <img
                    src={mockupUrl}
                    alt="Mockup"
                    className="w-full border rounded-lg object-cover max-h-48"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect width='100%' height='100%' fill='%23f3f4f6'/></svg>";
                    }}
                  />
                </div>
              )}
            </div>
            <hr className="my-6" />
          </>
        )}

        {/* ORDER DETAILS */}
        <h2 className="text-lg font-semibold mb-4">Order Details</h2>
        <div className="space-y-3 mb-6">
          <div className="flex justify-between">
            <span className="text-gray-600">Product ID:</span>
            <span className="font-mono text-sm">{productId || "N/A"}</span>
          </div>
          {variantData && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-600">Price:</span>
                <span className="font-semibold">₹{variantData.price || 0}</span>
              </div>
            </>
          )}
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Quantity:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-1 border rounded hover:bg-gray-100"
              >
                -
              </button>
              <span className="px-4 py-1 border rounded bg-white">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-1 border rounded hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>
          <div className="flex justify-between pt-3 border-t text-lg font-bold">
            <span>Total:</span>
            <span>₹{((variantData?.price || 0) * quantity).toFixed(2)}</span>
          </div>
        </div>
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
          disabled={placing || !variantData || !userId}
          className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {placing ? "Placing Order..." : "Place Order"}
        </button>
      </div>
    </div>
  );
}
