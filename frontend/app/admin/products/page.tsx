"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import { Pencil, Trash2, Plus } from "lucide-react";

const API_URL = "http://localhost:5000";

type Product = {
  id: string;
  name: string;
  audience: string;
  productType: string;
  isActive: boolean;
  thumbnail?: string | null;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/admin/products");
      setProducts(res.data?.data || []);
    } catch (err) {
      console.error("FETCH PRODUCTS ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const toggleStatus = async (id: string, current: boolean) => {
    await api.patch(`/admin/products/${id}/status`, {
      isActive: !current,
    });

    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, isActive: !current } : p
      )
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;

    await api.delete(`/admin/products/${id}`);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  if (loading) {
    return (
      <p className="py-20 text-center text-gray-500">
        Loading products…
      </p>
    );
  }

  return (
    <div className="space-y-8">

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-sm text-gray-500">
            Manage all products on Sochamila
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl"
        >
          <Plus size={18} />
          Add Product
        </Link>
      </div>

      <div className="bg-white rounded-2xl border shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left">Product</th>
              <th className="px-6 py-4 text-center">Audience</th>
              <th className="px-6 py-4 text-center">Type</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">

            {products.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-16 text-center text-gray-500"
                >
                  No products found
                </td>
              </tr>
            )}

            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">

                <td className="px-6 py-4 flex items-center gap-4">
                  {product.thumbnail ? (
                    <img
                      src={`${API_URL}/uploads/${product.thumbnail}`}
                      className="w-14 h-14 rounded-lg object-cover border"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-gray-200 rounded-lg flex items-center justify-center text-xs">
                      No Image
                    </div>
                  )}

                  <div>
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-xs text-gray-400">
                      {product.id.slice(0, 8)}…
                    </p>
                  </div>
                </td>

                <td className="px-6 py-4 text-center">
                  {product.audience}
                </td>

                <td className="px-6 py-4 text-center">
                  {product.productType}
                </td>

                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() =>
                      toggleStatus(product.id, product.isActive)
                    }
                    className={`px-4 py-1 rounded-full text-xs font-semibold ${
                      product.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {product.isActive ? "Active" : "Inactive"}
                  </button>
                </td>

                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-4">
                    <Link href={`/admin/products/${product.id}`}>
                      <Pencil size={16} />
                    </Link>

                    <button onClick={() => handleDelete(product.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>

              </tr>
            ))}

          </tbody>
        </table>
      </div>
    </div>
  );
}
