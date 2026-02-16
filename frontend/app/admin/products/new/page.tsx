"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

/* ======================================================
   TYPES
====================================================== */

type Size = {
  size: string;
  mrp: number;
  price: number;
  stock: number;
};

type ColorVariant = {
  name: string;
  sizes: Size[];
};

/* ======================================================
   CONSTANTS
====================================================== */

const AUDIENCES = ["MEN", "WOMEN", "KIDS"];
const PRODUCT_CATEGORIES = ["REGULAR", "GEAR", "ACCESSORIES"];
const PRODUCT_TYPES = ["TSHIRT", "SHIRT", "HOODIE", "SWEATSHIRT", "CAP"];

// Comprehensive color palette with hex values
const COLORS = [
  // Reds
  { name: "Red", hex: "#EF4444" },
  { name: "Crimson", hex: "#DC2626" },
  { name: "Maroon", hex: "#7F1D1D" },
  { name: "Dark Red", hex: "#991B1B" },
  { name: "Deep Red", hex: "#5A1515" },
  
  // Pinks
  { name: "Hot Pink", hex: "#EC4899" },
  { name: "Pink", hex: "#EC4899" },
  { name: "Light Pink", hex: "#FBB6CE" },
  { name: "Rose", hex: "#F43F5E" },
  
  // Purples
  { name: "Magenta", hex: "#D946EF" },
  { name: "Purple", hex: "#A855F7" },
  { name: "Dark Purple", hex: "#6B21A8" },
  { name: "Indigo", hex: "#4F46E5" },
  { name: "Lavender", hex: "#E9D5FF" },
  { name: "Light Purple", hex: "#DDD6FE" },
  
  // Blues  
  { name: "Light Blue", hex: "#93C5FD" },
  { name: "Sky Blue", hex: "#38BDF8" },
  { name: "Blue", hex: "#3B82F6" },
  { name: "Dark Blue", hex: "#1E40AF" },
  { name: "Navy", hex: "#001F3F" },
  { name: "Cobalt", hex: "#0338EE" },
  
  // Cyans/Teals
  { name: "Cyan", hex: "#06B6D4" },
  { name: "Teal", hex: "#14B8A6" },
  { name: "Dark Teal", hex: "#0D9488" },
  { name: "Turquoise", hex: "#20C997" },
  { name: "Light Cyan", hex: "#A5F3FC" },
  
  // Greens
  { name: "Lime", hex: "#84CC16" },
  { name: "Green", hex: "#22C55E" },
  { name: "Dark Green", hex: "#166534" },
  { name: "Forest Green", hex: "#15803D" },
  { name: "Olive", hex: "#6B7280" },
  { name: "Light Green", hex: "#BBF7D0" },
  { name: "Sea Green", hex: "#20B2AA" },
  
  // Yellows/Golds
  { name: "Yellow", hex: "#EAB308" },
  { name: "Gold", hex: "#FBBF24" },
  { name: "Light Yellow", hex: "#FEFCE8" },
  { name: "Amber", hex: "#FCD34D" },
  
  // Oranges
  { name: "Orange", hex: "#FB923C" },
  { name: "Dark Orange", hex: "#EA580C" },
  { name: "Rust", hex: "#CC5500" },
  
  // Browns/Tans
  { name: "Tan", hex: "#D2B48C" },
  { name: "Beige", hex: "#F5F5DC" },
  { name: "Brown", hex: "#92400E" },
  { name: "Dark Brown", hex: "#5A3A1A" },
  { name: "Chocolate", hex: "#6B3410" },
  { name: "Khaki", hex: "#C3B091" },
  
  // Grays
  { name: "Light Gray", hex: "#D1D5DB" },
  { name: "Gray", hex: "#9CA3AF" },
  { name: "Dark Gray", hex: "#4B5563" },
  { name: "Charcoal", hex: "#36454F" },
  { name: "Slate", hex: "#64748B" },
  
  // Neutrals
  { name: "White", hex: "#FFFFFF" },
  { name: "Black", hex: "#000000" },
  { name: "Off-White", hex: "#F9FAFB" },
];

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

/* ======================================================
   PAGE
====================================================== */

export default function AddProductPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const [product, setProduct] = useState({
    name: "",
    description: "",
    audience: "",
    productType: "",
    productCategory: "REGULAR",
  });

  const [colors, setColors] = useState<ColorVariant[]>([
    {
      name: "",
      sizes: [{ size: "", mrp: 0, price: 0, stock: 1 }],
    },
  ]);

  /* ======================================================
     IMAGE HANDLING
  ====================================================== */

  const handleImages = (files: FileList | null) => {
    if (!files) return;

    const list = Array.from(files);

    setImages(prev => [...prev, ...list]);
    setPreviews(prev => [
      ...prev,
      ...list.map(file => URL.createObjectURL(file)),
    ]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  /* ======================================================
     VARIANTS
  ====================================================== */

  const updateColor = (ci: number, value: string) => {
    const updated = [...colors];
    updated[ci].name = value;
    setColors(updated);
  };

  const updateSize = (
    ci: number,
    si: number,
    field: keyof Size,
    value: number | string
  ) => {
    const updated = [...colors];
    updated[ci].sizes[si] = {
      ...updated[ci].sizes[si],
      [field]: value,
    };
    setColors(updated);
  };

  const addColor = () => {
    setColors(prev => [
      ...prev,
      { name: "", sizes: [{ size: "", mrp: 0, price: 0, stock: 1 }] },
    ]);
  };

  const addSize = (ci: number) => {
    const updated = [...colors];
    updated[ci].sizes.push({
      size: "",
      mrp: 0,
      price: 0,
      stock: 1,
    });
    setColors(updated);
  };

  /* ======================================================
     VALIDATION
  ====================================================== */

  const validate = () => {
    if (!product.name.trim()) return "Product name is required";
    if (!product.audience) return "Audience is required";
    if (!product.productType) return "Category is required";
    if (images.length === 0) return "At least one product image is required";

    for (const color of colors) {
      if (!color.name) return "Select color";
      for (const size of color.sizes) {
        if (!size.size) return "Select size";
        if (size.price <= 0) return "Price must be greater than 0";
        if (size.stock < 0) return "Stock cannot be negative";
      }
    }

    return null;
  };

  /* ======================================================
     SUBMIT (🔥 FIXED)
  ====================================================== */

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const form = new FormData();

      form.append("name", product.name);
      form.append("description", product.description);
      form.append("audience", product.audience);
      form.append("productType", product.productType);
      form.append("productCategory", product.productCategory);

      // REQUIRED BY BACKEND
      form.append("productImageCount", images.length.toString());
      form.append("colors", JSON.stringify(colors));

      // 🔥 CORRECT FIELD NAME (THIS FIXES 500 ERROR)
      images.forEach(img => {
        form.append("productImages", img);
      });

      await api.post("/admin/products", form);

      router.push("/admin/products");
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Failed to create product"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ======================================================
     UI
  ====================================================== */

  return (
    <div className="max-w-6xl mx-auto pb-24 space-y-10">

      <div>
        <h1 className="text-3xl font-bold">Add product</h1>
        <p className="text-sm text-gray-500">
          Create product with variants and pricing
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* BASIC INFO */}
      <section className="bg-white border rounded-2xl p-8 space-y-5">
        <input
          className="input text-lg font-semibold"
          placeholder="Product title"
          value={product.name}
          onChange={e =>
            setProduct({ ...product, name: e.target.value })
          }
        />

        <textarea
          rows={5}
          className="input"
          placeholder="Product description"
          value={product.description}
          onChange={e =>
            setProduct({ ...product, description: e.target.value })
          }
        />
      </section>

      {/* IMAGES */}
      <section className="bg-white border rounded-2xl p-8">
        <h3 className="font-semibold mb-4">Product images</h3>

        <div className="grid grid-cols-5 gap-4">
          {previews.map((img, i) => (
            <div key={i} className="relative border rounded-xl overflow-hidden">
              <img
                src={img}
                alt="preview"
                className="h-32 w-auto mx-auto object-cover"
              />
              <button
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>
          ))}

          <label className="h-32 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer text-gray-500 hover:bg-gray-50">
            + Upload
            <input
              hidden
              multiple
              type="file"
              accept="image/*"
              onChange={e => handleImages(e.target.files)}
            />
          </label>
        </div>
      </section>

      {/* ORGANIZATION */}
      <section className="bg-white border rounded-2xl p-8 grid grid-cols-3 gap-6">
        <select
          className="input"
          value={product.audience}
          onChange={e =>
            setProduct({ ...product, audience: e.target.value })
          }
        >
          <option value="">Audience</option>
          {AUDIENCES.map(a => (
            <option key={a}>{a}</option>
          ))}
        </select>

        <select
          className="input"
          value={product.productType}
          onChange={e =>
            setProduct({ ...product, productType: e.target.value })
          }
        >
          <option value="">Type</option>
          {PRODUCT_TYPES.map(p => (
            <option key={p}>{p}</option>
          ))}
        </select>

        <select
          className="input"
          value={product.productCategory}
          onChange={e =>
            setProduct({ ...product, productCategory: e.target.value })
          }
        >
          <option value="">Category</option>
          {PRODUCT_CATEGORIES.map(c => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </section>

      {/* VARIANTS */}
      <section className="bg-white border rounded-2xl p-8 space-y-6">
        <h3 className="font-semibold">Variants</h3>

        {colors.map((color, ci) => (
          <div key={ci} className="border rounded-xl p-5 space-y-3">
            {/* COLOR PICKER */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold">Select Color</label>
              {color.name && (
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-6 h-6 rounded-full border-2 border-gray-300 shadow-sm"
                    style={{
                      backgroundColor: COLORS.find(c => c.name === color.name)?.hex || "#000",
                    }}
                    title={color.name}
                  />
                  <span className="text-xs font-medium">{color.name}</span>
                </div>
              )}

              <div className="grid grid-cols-10 gap-2 bg-gray-50 p-3 rounded-lg">
                {COLORS.map(c => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => updateColor(ci, c.name)}
                    className={`w-7 h-7 rounded-full transition-all border-2 ${
                      color.name === c.name
                        ? "border-indigo-600 ring-2 ring-indigo-400 scale-110"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>

              {!color.name && (
                <p className="text-xs text-red-500">Please select a color</p>
              )}
            </div>

            {color.sizes.map((s, si) => (
              <div key={si} className="grid grid-cols-4 gap-4">
                <select
                  className="input"
                  value={s.size}
                  onChange={e =>
                    updateSize(ci, si, "size", e.target.value)
                  }
                >
                  <option value="">Size</option>
                  {SIZES.map(sz => (
                    <option key={sz}>{sz}</option>
                  ))}
                </select>

                <input
                  type="number"
                  className="input"
                  placeholder="MRP"
                  value={s.mrp}
                  onChange={e =>
                    updateSize(ci, si, "mrp", Number(e.target.value))
                  }
                />

                <input
                  type="number"
                  className="input"
                  placeholder="Price"
                  value={s.price}
                  onChange={e =>
                    updateSize(ci, si, "price", Number(e.target.value))
                  }
                />

                <input
                  type="number"
                  className="input"
                  placeholder="Stock"
                  value={s.stock}
                  onChange={e =>
                    updateSize(ci, si, "stock", Number(e.target.value))
                  }
                />
              </div>
            ))}

            <button
              onClick={() => addSize(ci)}
              className="text-indigo-600 text-sm"
            >
              + Add size
            </button>
          </div>
        ))}

        <button
          onClick={addColor}
          className="text-indigo-600 text-sm"
        >
          + Add color
        </button>
      </section>

      {/* SAVE */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-indigo-600 text-white px-10 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
      >
        {loading ? "Saving..." : "Save product"}
      </button>
    </div>
  );
}
