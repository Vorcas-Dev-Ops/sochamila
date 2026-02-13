"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import api from "@/lib/axios";

export default function CheckoutPage() {
  const params = useSearchParams();
  const router = useRouter();

  // These would be passed via query or state in a real app
  const imageUrl = params.get("image");
  const mockupUrl = params.get("mockup");
  const productId = params.get("product");
  const variantId = params.get("variant");

  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  async function handlePlaceOrder() {
    setPlacing(true);
    setError("");
    try {
      await api.post("/orders", {
        productId,
        variantId,
        imageUrl,
        mockupUrl,
      });
      router.push("/order-success");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Order Preview</h1>
      <div className="mb-6">
        <div className="mb-2">Your Design:</div>
        {imageUrl && <img src={imageUrl} alt="Design" className="w-48 border rounded mb-4" />}
        <div className="mb-2">Mockup Preview:</div>
        {mockupUrl && <img src={mockupUrl} alt="Mockup" className="w-48 border rounded" />}
      </div>
      <button
        className="bg-teal-600 text-white px-6 py-2 rounded font-semibold"
        onClick={handlePlaceOrder}
        disabled={placing}
      >
        {placing ? "Placing Order..." : "Place Order"}
      </button>
      {error && <div className="text-red-600 mt-4">{error}</div>}
    </div>
  );
}
