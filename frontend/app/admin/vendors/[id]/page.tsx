"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/axios";

export default function VendorDetailPage() {
  const params = useParams();
  const id = (params as any)?.id;
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    (async () => {
      try {
        const res = await api.get(`/admin/vendors/${id}`);
        if (!mounted) return;
        setVendor(res.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <div className="p-10">Loading vendor…</div>;
  if (!vendor) return <div className="p-10">Vendor not found</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Vendor: {vendor.name}</h1>
      <p className="text-sm text-gray-600 mb-2">Email: {vendor.email}</p>
      <p className="text-sm text-gray-600 mb-2">KYC: {vendor.kycStatus}</p>
      <p className="text-sm text-gray-600 mb-6">Registered: {new Date(vendor.createdAt).toLocaleString()}</p>

      <h2 className="text-lg font-semibold mb-2">Assigned Order Items</h2>
      {vendor.assignedOrderItems?.length ? (
        <div className="space-y-2">
          {vendor.assignedOrderItems.map((it: any) => (
            <div key={it.id} className="border rounded p-3">
              <div className="text-sm">Order: {it.orderId}</div>
              <div className="text-xs text-gray-500">Size: {it.size?.size} — Qty: {it.quantity}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-gray-500">No assigned items</div>
      )}
    </div>
  );
}
