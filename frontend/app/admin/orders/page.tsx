"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/axios";

type OrderItem = {
  id: string;
  sizeId: string;
  quantity: number;
  price: number;
  imageUrl?: string | null;
  mockupUrl?: string | null;
  vendorId?: string | null;
  vendor?: Vendor | null;
};

type Order = {
  id: string;
  userId: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
};

type Vendor = { id: string; name: string; email: string };

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [oRes, vRes] = await Promise.all([
          api.get("/admin/orders"),
          api.get("/admin/vendors"),
        ]);

        setOrders(oRes.data.data || []);
        setVendors(vRes.data.data || []);
      } catch (err) {
        console.error("Failed to load admin orders/vendors", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const handleAssign = async (orderItemId: string, vendorId: string) => {
    try {
      setAssigning(orderItemId);
      await api.post(`/admin/orders/assign/${orderItemId}`, { vendorId });
      // refresh
      const res = await api.get("/admin/orders");
      setOrders(res.data.data || []);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to assign vendor");
    } finally {
      setAssigning(null);
    }
  };

  const ORDER_STATUSES = [
    'PLACED', 'CONFIRMED', 'ASSIGNED', 'PRINTING', 'SHIPPED', 'DELIVERED', 'CANCELLED'
  ] as const;

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await api.patch(`/admin/orders/${orderId}/status`, { status });
      const updated: any = res.data?.data;
      if (updated) {
        setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update order status');
    }
  };

  if (loading) return <div className="p-10">Loading orders…</div>;

  return (
    <div className="max-w-5xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Orders</h1>
      {orders.length === 0 && <div>No orders found.</div>}
      <div className="space-y-6">
        {orders.map(order => (
          <div key={order.id} className="border rounded-xl p-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs text-gray-500 mb-1">Order ID: {order.id}</div>
                <div className="mb-2">User: {order.userId}</div>
                <div className="mb-2">Total: ₹{order.totalAmount}</div>
                <div className="text-xs text-gray-400">Placed: {new Date(order.createdAt).toLocaleString()}</div>
              </div>
              <div className="text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    {ORDER_STATUSES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <span className="text-xs text-gray-500">(Order status)</span>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {order.items.map(item => (
                <div key={item.id} className="border p-3 rounded flex items-center gap-4">
                  <div className="w-24">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} className="w-24 h-24 object-contain" alt="design" />
                    ) : (
                      <div className="w-24 h-24 bg-gray-100 flex items-center justify-center text-xs">No Image</div>
                    )}
                    <div className="text-xs mt-1">Qty: {item.quantity}</div>
                  </div>

                  <div className="flex-1">
                    <div className="text-sm font-medium">Size ID: {item.sizeId}</div>
                    <div className="text-xs text-gray-500">Price: ₹{item.price}</div>

                    <div className="mt-2 flex items-center gap-2">
                      <select defaultValue={item.vendorId || ""} className="input-light" onChange={(e) => handleAssign(item.id, e.target.value)}>
                        <option value="">Assign vendor...</option>
                        {vendors.map(v => (
                          <option key={v.id} value={v.id}>{v.name} — {v.email}</option>
                        ))}
                      </select>
                      {assigning === item.id && <div className="text-sm">Assigning…</div>}

                      {item.vendor && (
                        <Link href={`/admin/vendors/${item.vendor.id}`} className="ml-3 text-sm text-blue-600 hover:underline">
                          View vendor: {item.vendor.name}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
