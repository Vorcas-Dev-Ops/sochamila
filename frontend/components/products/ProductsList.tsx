"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

/* ======================================================
   CONFIG
====================================================== */

const API_URL = "http://localhost:5000";

/* ======================================================
   TYPES
====================================================== */

type Variant = {
  color: string;
};

type Product = {
  id: string;
  name: string;
  audience: string;
  productType: string;
  thumbnail: string | null;
  minPrice: number;
  variants: Variant[];
};

/* ======================================================
   CONSTANTS
====================================================== */

const GENDERS = ["MEN", "WOMEN", "KIDS", "ACCESSORIES"];

const CATEGORIES = [
  "TSHIRT",
  "SHIRT",
  "HOODIE",
  "SWEATSHIRT",
  "JACKET",
  "CAP",
];

const COLORS = [
  { name: "Black", value: "black", hex: "#000000" },
  { name: "White", value: "white", hex: "#ffffff" },
  { name: "Red", value: "red", hex: "#ef4444" },
  { name: "Blue", value: "blue", hex: "#3b82f6" },
  { name: "Green", value: "green", hex: "#22c55e" },
];

/* ======================================================
   PAGE
====================================================== */

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [gender, setGender] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [sort, setSort] = useState("");

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  /* ================= FETCH ================= */

  useEffect(() => {
    fetch(`${API_URL}/api/products`, { cache: "no-store" })
      .then(res => res.json())
      .then(res => setProducts(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  /* ================= FILTER ================= */

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (gender)
      list = list.filter(p => p.audience === gender);

    if (category)
      list = list.filter(p => p.productType === category);

    if (color) {
      list = list.filter(p =>
        p.variants?.some(
          v => v.color.toLowerCase() === color
        )
      );
    }

    if (minPrice)
      list = list.filter(p => p.minPrice >= Number(minPrice));

    if (maxPrice)
      list = list.filter(p => p.minPrice <= Number(maxPrice));

    if (sort === "price-asc")
      list.sort((a, b) => a.minPrice - b.minPrice);

    if (sort === "price-desc")
      list.sort((a, b) => b.minPrice - a.minPrice);

    return list;
  }, [
    products,
    gender,
    category,
    color,
    minPrice,
    maxPrice,
    sort,
  ]);

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="py-24 text-center text-gray-500">
        Loading products...
      </div>
    );
  }

  /* ======================================================
     UI
  ====================================================== */

  return (
    <section className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* HEADER */}
        <div className="mb-5">
          <h1 className="text-2xl font-semibold">Shop</h1>
          <p className="text-sm text-gray-500">
            {filteredProducts.length} Products
          </p>
        </div>

        {/* FILTER BAR */}
        <div className="border rounded-xl p-4 mb-6 flex flex-wrap gap-3 bg-gray-50">

          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="">Sort</option>
            <option value="price-asc">Price ↑</option>
            <option value="price-desc">Price ↓</option>
          </select>

          <input
            placeholder="Min ₹"
            className="border rounded-lg px-3 py-2 w-24 text-sm"
            value={minPrice}
            onChange={e => setMinPrice(e.target.value)}
          />

          <input
            placeholder="Max ₹"
            className="border rounded-lg px-3 py-2 w-24 text-sm"
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
          />

          {/* COLORS */}
          <div className="flex gap-2 items-center">
            {COLORS.map(c => (
              <button
                key={c.value}
                onClick={() =>
                  setColor(color === c.value ? null : c.value)
                }
                title={c.name}
                className={`w-7 h-7 rounded-full border-2 ${
                  color === c.value
                    ? "ring-2 ring-black"
                    : ""
                }`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>

          <button
            onClick={() => {
              setGender(null);
              setCategory(null);
              setColor(null);
              setMinPrice("");
              setMaxPrice("");
              setSort("");
            }}
            className="ml-auto text-sm text-red-600"
          >
            Clear
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex gap-8">

          {/* SIDEBAR */}
          <aside className="hidden lg:block w-64 border-r pr-6">
            <SidebarBlock
              title="Gender"
              list={GENDERS}
              value={gender}
              onChange={setGender}
            />
            <SidebarBlock
              title="Category"
              list={CATEGORIES}
              value={category}
              onChange={setCategory}
            />
          </aside>

          {/* PRODUCTS GRID */}
          <div
            className="
              grid
              flex-1
              gap-6
              justify-items-center
              grid-cols-2
              sm:grid-cols-3
              md:grid-cols-4
              lg:grid-cols-5
              xl:grid-cols-6
            "
          >
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ======================================================
   COMPONENTS
====================================================== */

function SidebarBlock({ title, list, value, onChange }: any) {
  return (
    <div className="mb-8">
      <h4 className="font-medium mb-3">{title}</h4>

      <div className="space-y-2">
        {list.map((item: string) => (
          <label
            key={item}
            className="flex gap-2 text-sm cursor-pointer"
          >
            <input
              type="radio"
              checked={value === item}
              onChange={() =>
                onChange(value === item ? null : item)
              }
            />
            {item}
          </label>
        ))}
      </div>
    </div>
  );
}

/* ======================================================
   PRODUCT CARD
====================================================== */

function ProductCard({ product }: { product: Product }) {
  const image = product.thumbnail
    ? `${API_URL}/uploads/${product.thumbnail}`
    : "/placeholder.png";

  const colors = Array.from(
    new Set(
      product.variants.map(v =>
        v.color.toLowerCase()
      )
    )
  );

  return (
    <Link href={`/products/${product.id}`}>
      <div className="w-[180px] sm:w-[190px] bg-white border rounded-xl overflow-hidden hover:shadow-lg transition cursor-pointer">

        <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition"
          />

          <span className="absolute bottom-2 left-2 bg-white px-2 py-1 text-xs font-semibold rounded">
            ₹{product.minPrice}
          </span>
        </div>

        <div className="p-2">
          <p className="text-sm font-medium line-clamp-2">
            {product.name}
          </p>

          <div className="flex gap-1 mt-2">
            {colors.slice(0, 5).map(c => (
              <span
                key={c}
                className="w-3.5 h-3.5 rounded-full border"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
