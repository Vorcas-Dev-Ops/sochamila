"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/axios";
import {
  Search,
  Eye,
  EyeOff,
  Plus,
  TrendingUp,
} from "lucide-react";

/* ================= TYPES ================= */

interface Category {
  id: string;
  name: string;
  _count?: { stickers: number };
}

interface Sticker {
  id: string;
  name: string;
  imageUrl: string;
  usageCount: number;
  isActive: boolean;
  category: Category;
}

/* ================= API PATHS ================= */

const API = {
  stickers: "/api/admin/stickers",
  upload: "/api/admin/stickers/upload",
  toggle: (id: string) => `/api/admin/stickers/${id}/toggle`,
  delete: (id: string) => `/api/admin/stickers/${id}`,
  move: (id: string) => `/api/admin/stickers/${id}/category`,

  categories: "/api/admin/sticker-categories",
  createCategory: "/api/admin/sticker-categories",
  updateCategory: (id: string) =>
    `/api/admin/sticker-categories/${id}`,
  deleteCategory: (id: string) =>
    `/api/admin/sticker-categories/${id}`,
};

/* ================= HELPERS ================= */

const resolveImage = (url: string) =>
  url.startsWith("http")
    ? url
    : `http://localhost:5000${url}`;

/* ================= PAGE ================= */

export default function AdminStickersPage() {
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");

  const [loading, setLoading] = useState(false);

  /* ================= LOAD DATA ================= */

  const loadAll = async () => {
    try {
      setLoading(true);

      const [stickersRes, categoriesRes] = await Promise.all([
        api.get(API.stickers),
        api.get(API.categories),
      ]);

      setStickers(stickersRes.data || []);
      setCategories(categoriesRes.data || []);

      if (
        !selectedCategoryId &&
        categoriesRes.data?.length
      ) {
        setSelectedCategoryId(categoriesRes.data[0].id);
      }
    } catch (error) {
      console.error("Failed to load stickers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  /* ================= CATEGORY ================= */

  const createCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;

    if (
      categories.some(
        (c) => c.name.toLowerCase() === name.toLowerCase()
      )
    ) {
      alert("Category already exists");
      return;
    }

    try {
      const res = await api.post(API.createCategory, {
        name,
      });

      setCategories((p) => [...p, res.data]);
      setSelectedCategoryId(res.data.id);
      setNewCategoryName("");
    } catch (error) {
      console.error("Create category failed:", error);
    }
  };

  /* ================= STICKERS ================= */

  const toggleSticker = async (id: string) => {
    try {
      await api.patch(API.toggle(id));
      setStickers((p) =>
        p.map((s) =>
          s.id === id
            ? { ...s, isActive: !s.isActive }
            : s
        )
      );
    } catch (error) {
      console.error("Toggle sticker failed:", error);
    }
  };

  const moveSticker = async (
    stickerId: string,
    categoryId: string
  ) => {
    try {
      await api.patch(API.move(stickerId), {
        categoryId,
      });

      setStickers((p) =>
        p.map((s) =>
          s.id === stickerId
            ? {
                ...s,
                category: {
                  ...s.category,
                  id: categoryId,
                },
              }
            : s
        )
      );
    } catch (error) {
      console.error("Move sticker failed:", error);
    }
  };

  /* ================= FILTERS ================= */

  const filteredStickers = useMemo(() => {
    return stickers.filter(
      (s) =>
        s.name
          .toLowerCase()
          .includes(search.toLowerCase()) &&
        (!selectedCategoryId ||
          s.category.id === selectedCategoryId)
    );
  }, [stickers, search, selectedCategoryId]);

  const trending = useMemo(() => {
    return [...stickers]
      .filter((s) => s.isActive)
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 5);
  }, [stickers]);

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        Sticker Manager
      </h1>

      {/* SEARCH + FILTER */}
      <div className="flex gap-3 items-center">
        <div className="relative w-60">
          <Search
            size={16}
            className="absolute left-3 top-2.5 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stickers"
            className="pl-9 pr-3 py-2 border rounded-lg w-full text-sm"
          />
        </div>

        <select
          value={selectedCategoryId}
          onChange={(e) =>
            setSelectedCategoryId(e.target.value)
          }
          className="border rounded-lg px-3 py-2 text-sm"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          value={newCategoryName}
          onChange={(e) =>
            setNewCategoryName(e.target.value)
          }
          placeholder="New category"
          className="border px-3 py-2 rounded-lg w-44 text-sm"
        />

        <button
          onClick={createCategory}
          className="bg-indigo-600 text-white px-3 py-2 rounded-lg"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* TRENDING */}
      <div>
        <h3 className="flex items-center gap-2 font-semibold">
          <TrendingUp size={16} />
          Trending Stickers
        </h3>

        <div className="flex gap-4 mt-2">
          {trending.map((s) => (
            <img
              key={s.id}
              src={resolveImage(s.imageUrl)}
              className="h-16 w-16 object-contain border rounded"
            />
          ))}
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-6 gap-4">
        {loading && (
          <p className="text-sm text-gray-500">
            Loading stickers...
          </p>
        )}

        {!loading &&
          filteredStickers.map((sticker) => (
            <div
              key={sticker.id}
              className={`border rounded-xl p-3 relative ${
                !sticker.isActive ? "opacity-50" : ""
              }`}
            >
              <img
                src={resolveImage(sticker.imageUrl)}
                className="h-24 mx-auto object-contain"
              />

              <select
                value={sticker.category.id}
                onChange={(e) =>
                  moveSticker(
                    sticker.id,
                    e.target.value
                  )
                }
                className="mt-2 w-full border rounded text-xs"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() =>
                  toggleSticker(sticker.id)
                }
                className="absolute top-2 right-2"
              >
                {sticker.isActive ? (
                  <EyeOff size={14} />
                ) : (
                  <Eye size={14} />
                )}
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}
