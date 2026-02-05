"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import type { Product } from "@/types/product";

/* ================= CONFIG ================= */

const API_URL = "http://localhost:5000";

/* ================= CONSTANTS ================= */

const AUDIENCES = ["MEN", "WOMEN", "KIDS", "ACCESSORIES"];
const PRODUCT_TYPES = ["TSHIRT", "SHIRT", "HOODIE", "SWEATSHIRT", "CAP"];
const COLORS = ["Black", "White", "Red", "Blue", "Green", "Yellow"];

const COLOR_MAP: Record<string, string> = {
  black: "#000000",
  white: "#ffffff",
  red: "#ef4444",
  blue: "#3b82f6",
  green: "#22c55e",
  yellow: "#eab308",
};

/* ================= PAGE ================= */

export default function ProductsList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  /* FILTER STATE */
  const [audience, setAudience] = useState<string | null>(null);
  const [productType, setProductType] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState<"" | "price-asc" | "price-desc">("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  /* ================= FETCH ================= */

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch(`${API_URL}/api/products`, {
          cache: "no-store",
        });
        const json = await res.json();

        // backend returns { success, data }
        setProducts(Array.isArray(json?.data) ? json.data : []);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  /* ================= FILTER + SORT ================= */

  const filteredProducts = useMemo(() => {
    let list = [...products];

    list = list.filter((p) => {
      if (audience && p.audience !== audience) return false;
      if (productType && p.productType !== productType) return false;

      if (
        search &&
        !p.name.toLowerCase().includes(search.toLowerCase())
      )
        return false;

      if (
        color &&
        !p.variants.some(
          (v) => v.color.toLowerCase() === color.toLowerCase()
        )
      )
        return false;

      if (
        inStockOnly &&
        !p.variants.some((v) => v.stock > 0)
      )
        return false;

      const prices = p.variants.map((v) => v.price);
      const min = Math.min(...prices);
      const max = Math.max(...prices);

      if (minPrice && min < Number(minPrice)) return false;
      if (maxPrice && max > Number(maxPrice)) return false;

      return true;
    });

    if (sort === "price-asc") {
      list.sort((a, b) => a.minPrice - b.minPrice);
    }

    if (sort === "price-desc") {
      list.sort((a, b) => b.minPrice - a.minPrice);
    }

    return list;
  }, [
    products,
    audience,
    productType,
    color,
    search,
    inStockOnly,
    sort,
    minPrice,
    maxPrice,
  ]);

  if (loading) {
    return <p className="py-20 text-center">Loading products…</p>;
  }

  return (
    <section className="px-6 py-6">

      {/* ================= FILTER BAR ================= */}
      <div className="bg-white border rounded-xl p-4 mb-6 flex flex-wrap gap-3 items-center">

        <input
          placeholder="Search products"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-4 py-2 rounded-full w-64"
        />

        <select
          value={color ?? ""}
          onChange={(e) => setColor(e.target.value || null)}
          className="border px-4 py-2 rounded-full"
        >
          <option value="">All Colors</option>
          {COLORS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Min ₹"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="border px-4 py-2 rounded-full w-28"
        />

        <input
          type="number"
          placeholder="Max ₹"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="border px-4 py-2 rounded-full w-28"
        />

        <select
          value={sort}
          onChange={(e) =>
            setSort(e.target.value as "price-asc" | "price-desc" | "")
          }
          className="border px-4 py-2 rounded-full"
        >
          <option value="">Sort by price</option>
          <option value="price-asc">Low → High</option>
          <option value="price-desc">High → Low</option>
        </select>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={() => setInStockOnly((v) => !v)}
          />
          In stock
        </label>

        <button
          onClick={() => {
            setAudience(null);
            setProductType(null);
            setColor(null);
            setSearch("");
            setSort("");
            setMinPrice("");
            setMaxPrice("");
            setInStockOnly(false);
          }}
          className="ml-auto text-sm text-red-600 flex items-center gap-1"
        >
          <X size={14} /> Reset
        </button>
      </div>

      {/* ================= LAYOUT ================= */}
      <div className="flex gap-6">

        {/* SIDEBAR */}
        <aside className="w-64 shrink-0 hidden lg:block space-y-6">
          <FilterBlock title="Audience">
            {AUDIENCES.map((a) => (
              <FilterButton
                key={a}
                active={audience === a}
                onClick={() => setAudience(a)}
              >
                {a}
              </FilterButton>
            ))}
          </FilterBlock>

          <FilterBlock title="Product Type">
            {PRODUCT_TYPES.map((p) => (
              <FilterButton
                key={p}
                active={productType === p}
                onClick={() => setProductType(p)}
              >
                {p}
              </FilterButton>
            ))}
          </FilterBlock>
        </aside>

        {/* GRID */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full py-32 text-center text-gray-500">
              No products found
            </div>
          ) : (
            filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}

/* ================= UI HELPERS ================= */

function FilterBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`block w-full text-left px-3 py-2 rounded ${
        active ? "bg-teal-600 text-white" : "hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}

/* ================= PRODUCT CARD ================= */

/* IMAGE URL HELPER - handles Windows paths, backslashes, etc. */
const getImageUrl = (imagePath: string | null | undefined): string | null => {
  if (!imagePath) return null;
  
  // Normalize: replace backslashes, trim, remove Windows drive letters
  let p = String(imagePath).replace(/\\/g, "/").trim();
  p = p.replace(/^[A-Za-z]:\//, "");
  
  // Ensure uploads/ paths have leading slash
  if (p.startsWith("uploads/")) p = "/" + p;
  
  // Build full URL
  if (p.startsWith("http")) return p;
  if (p.startsWith("/uploads/")) return `${API_URL}${p}`;
  if (p.startsWith("/")) return `${API_URL}${p}`;
  return `${API_URL}/uploads/${p}`;
};

function ProductCard({ product }: { product: Product }) {
  const images: string[] = [];

  // Try thumbnail first
  if (product.thumbnail) {
    const url = getImageUrl(product.thumbnail);
    if (url) images.push(url);
  }
  
  // Then add variant images
  product.variants?.forEach((v) => {
    v.images?.forEach((img) => {
      const url = getImageUrl(img.image);
      if (url && !images.includes(url)) {
        images.push(url);
      }
    });
  });

  const [activeIndex, setActiveIndex] = useState(0);

  const colors = Array.from(
    new Set(product.variants.map((v) => v.color.toLowerCase()))
  );

  return (
    <div
      className="bg-white border rounded-xl p-3 hover:shadow-lg transition"
      onMouseEnter={() => {
        if (images.length > 1) {
          let i = 0;
          const id = setInterval(() => {
            i = (i + 1) % images.length;
            setActiveIndex(i);
          }, 1200);
          (window as any).__slider = id;
        }
      }}
      onMouseLeave={() => {
        clearInterval((window as any).__slider);
        setActiveIndex(0);
      }}
    >
      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
        {images.length ? (
          <img
            src={images[activeIndex]}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23e5e7eb' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239ca3af' font-family='system-ui' font-size='14'%3EImage not found%3C/text%3E%3C/svg%3E";
            }}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-xs">
            No Image
          </div>
        )}
      </div>

      <h3 className="mt-2 text-sm font-semibold line-clamp-2">
        {product.name}
      </h3>

      <p className="text-sm font-bold">₹{product.minPrice}</p>

      {colors.length > 0 && (
        <div className="mt-2 flex gap-1">
          {colors.slice(0, 5).map((c) => (
            <span
              key={c}
              className="w-4 h-4 rounded-full border"
              style={{ backgroundColor: COLOR_MAP[c] }}
            />
          ))}
        </div>
      )}

      <Link href={`/products/${product.id}`} className="mt-3 block">
        <button className="w-full bg-teal-600 text-white py-2 rounded-md text-sm hover:bg-teal-700">
          View Details
        </button>
      </Link>
    </div>
  );
}
