"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";

/* ================= TYPES ================= */

interface Graphic {
  id: string;
  imageUrl: string;
  createdAt: string;
}

/* ================= PAGE ================= */

export default function AdminGraphicsPage() {
  const [files, setFiles] = useState<Graphic[]>([]);
  const [loading, setLoading] = useState(false);

  /* ================= HELPERS ================= */

  const resolveImage = (url: string) =>
    url.startsWith("http")
      ? url
      : `http://localhost:5000${url}`;

  /* ================= LOAD ================= */

  const loadGraphics = async () => {
    try {
      const res = await api.get("/api/graphics");
      setFiles(res.data || []);
    } catch (err) {
      console.error("Load graphics failed", err);
    }
  };

  useEffect(() => {
    loadGraphics();
  }, []);

  /* ================= UPLOAD ================= */

  const upload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files?.length) return;

    const form = new FormData();
    Array.from(e.target.files).forEach((file) =>
      form.append("files", file)
    );

    try {
      setLoading(true);

      await api.post(
        "/api/admin/graphics/upload",
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      await loadGraphics();
      e.target.value = "";
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-bold">
        Graphics Library
      </h1>

      {/* UPLOAD */}
      <input
        type="file"
        multiple
        accept="image/*,.svg"
        onChange={upload}
        className="border p-2 rounded"
      />

      {loading && (
        <p className="text-sm text-gray-500">
          Uploading graphics...
        </p>
      )}

      {/* GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        {files.map((file) => (
          <div
            key={file.id}
            className="border rounded-lg p-2 hover:shadow-sm transition"
          >
            <img
              src={resolveImage(file.imageUrl)}
              alt="graphic"
              className="h-24 w-full object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
