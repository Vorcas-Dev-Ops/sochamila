"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FONT_GROUPS, LANGUAGE_GROUPS, type LanguageCategory, type FontGroup } from "@/fonts/fontCatalog";
import { loadGoogleFont } from "@/utils/loadGoogleFont";

import {
  EditorLayer,
  TextLayer,
  ImageLayer,
  TextStyle,
} from "@/types/editor";

import { TextOptions } from "@/types/editor-options";

/* ======================================================
   TYPES
====================================================== */

type Tab = "text" | "image" | "ai";

/* ======================================================
   PROPS
====================================================== */

interface LeftPanelProps {
  selectedLayer: EditorLayer | null;

  onAddText: (text: string, options: TextOptions) => void;
  onUpdateText: (patch: Partial<TextLayer>) => void;

  onAddImage: (src: string) => void;
  onUpdateImage: (patch: Partial<ImageLayer>) => void;

  onGenerateAIImage: (prompt: string) => Promise<string>;
}

/* ======================================================
   COMPONENT
====================================================== */

export default function LeftPanel({
  selectedLayer,
  onAddText,
  onUpdateText,
  onAddImage,
  onUpdateImage,
  onGenerateAIImage,
}: LeftPanelProps) {
  const uploadRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<Tab>("text");

  /* ================= LOCAL UI STATE ================= */

  const [text, setText] = useState("Your Text");
  const [language, setLanguage] = useState<LanguageCategory>("Latin");
  const [fontFamily, setFontFamily] = useState("Inter");
  const [fontSize, setFontSize] = useState(48);
  const [fontWeight, setFontWeight] = useState(400);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [lineHeight, setLineHeight] = useState(1.2);
  const [color, setColor] = useState("#111827");
  const [opacity, setOpacity] = useState(1);
  const [textStyle, setTextStyle] = useState<TextStyle>("normal");

  /* ================= AI STATE ================= */

  const [aiPrompt, setAiPrompt] = useState("");
  const [aiImages, setAiImages] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  /* ================= SYNC SELECTED LAYER ================= */

  useEffect(() => {
    if (!selectedLayer || selectedLayer.type !== "text") return;

    const l = selectedLayer as TextLayer;

    loadGoogleFont(l.fontFamily);

    setText(l.text);
    setFontFamily(l.fontFamily);
    setFontSize(l.fontSize);
    setFontWeight(l.fontWeight);
    setLetterSpacing(l.letterSpacing);
    setLineHeight(l.lineHeight);
    setColor(l.color);
    setOpacity(l.opacity ?? 1);
    setTextStyle(l.textStyle);
  }, [selectedLayer]);

  const fonts = useMemo(() => {
    const selectedGroups = LANGUAGE_GROUPS[language];
    return selectedGroups.reduce((acc, group) => {
      acc[group as FontGroup] = FONT_GROUPS[group as FontGroup];
      return acc;
    }, {} as Record<FontGroup, readonly string[]>);
  }, [language]);

  /* ================= AI HANDLER ================= */

  async function handleGenerateAIImage() {
    if (!aiPrompt.trim()) return;

    try {
      setAiLoading(true);
      const imageUrl = await onGenerateAIImage(aiPrompt);
      setAiImages(prev => [imageUrl, ...prev]);
    } finally {
      setAiLoading(false);
    }
  }

  /* ======================================================
     UI
  ====================================================== */

  return (
    <aside className="w-[320px] h-full border-r bg-white p-4 overflow-y-auto space-y-5">

      <h2 className="text-lg font-semibold">Design Tools</h2>

      {/* TABS */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        {(["text", "image", "ai"] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`py-2 rounded font-semibold ${
              activeTab === t
                ? "bg-indigo-600 text-white"
                : "bg-slate-100"
            }`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* ================= TEXT ================= */}
      {activeTab === "text" && (
        <section className="space-y-4">

          <textarea
            rows={2}
            value={text}
            className="w-full border rounded p-2 text-sm"
            onChange={e => {
              setText(e.target.value);
              onUpdateText({ text: e.target.value });
            }}
          />

          <div>
            <label className="text-xs block mb-1 font-semibold">Language</label>
            <select
              value={language}
              className="w-full border rounded p-2 text-sm"
              onChange={e => {
                setLanguage(e.target.value as LanguageCategory);
              }}
            >
              {(Object.keys(LANGUAGE_GROUPS) as LanguageCategory[]).map(lang => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          <select
            value={fontFamily}
            className="w-full border rounded p-2 text-sm"
            onChange={e => {
              loadGoogleFont(e.target.value);
              setFontFamily(e.target.value);
              onUpdateText({ fontFamily: e.target.value });
            }}
          >
            {Object.entries(fonts).map(([g, list]) => (
              <optgroup key={g} label={g}>
                {list.map(f => (
                  <option key={f}>{f}</option>
                ))}
              </optgroup>
            ))}
          </select>

          <Range label="Font Size" min={12} max={200} value={fontSize}
            onChange={v => {
              setFontSize(v);
              onUpdateText({ fontSize: v });
            }}
          />

          <Range label="Font Weight" min={100} max={900} step={100} value={fontWeight}
            onChange={v => {
              setFontWeight(v);
              onUpdateText({ fontWeight: v });
            }}
          />

          <Range label="Letter Spacing" min={-5} max={20} value={letterSpacing}
            onChange={v => {
              setLetterSpacing(v);
              onUpdateText({ letterSpacing: v });
            }}
          />

          <Range label="Line Height" min={0.8} max={3} step={0.1} value={lineHeight}
            onChange={v => {
              setLineHeight(v);
              onUpdateText({ lineHeight: v });
            }}
          />

          <div className="flex gap-3 items-center">
            <input
              type="color"
              value={color}
              onChange={e => {
                setColor(e.target.value);
                onUpdateText({ color: e.target.value });
              }}
            />
            <Range label="Opacity" min={0} max={1} step={0.05} value={opacity}
              onChange={v => {
                setOpacity(v);
                onUpdateText({ opacity: v });
              }}
            />
          </div>

          <div className="grid grid-cols-4 gap-2">
            {(["normal", "shadow", "outline", "3d"] as TextStyle[]).map(s => (
              <button
                key={s}
                onClick={() => {
                  setTextStyle(s);
                  onUpdateText({ textStyle: s });
                }}
                className={`py-2 text-xs rounded ${
                  textStyle === s
                    ? "bg-black text-white"
                    : "border"
                }`}
              >
                {s.toUpperCase()}
              </button>
            ))}
          </div>

          {selectedLayer && selectedLayer.type === "text" && (
            <div className="space-y-3 border-t pt-4">
              <label className="block text-sm font-semibold text-gray-900">
                Rotation: {selectedLayer.rotation || 0}°
              </label>
              <input
                type="range"
                min={0}
                max={360}
                step={1}
                value={selectedLayer.rotation || 0}
                onChange={e => {
                  const rotation = parseInt(e.target.value, 10);
                  onUpdateText({ rotation });
                }}
                className="w-full"
              />
              <div className="flex gap-2 text-xs">
                <button
                  onClick={() => onUpdateText({ rotation: ((selectedLayer.rotation || 0) - 45 + 360) % 360 })}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 py-1 rounded text-center transition"
                  title="Rotate -45°"
                >
                  ↺ -45°
                </button>
                <button
                  onClick={() => onUpdateText({ rotation: 0 })}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 py-1 rounded text-center transition"
                  title="Reset rotation"
                >
                  Reset
                </button>
                <button
                  onClick={() => onUpdateText({ rotation: ((selectedLayer.rotation || 0) + 45) % 360 })}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 py-1 rounded text-center transition"
                  title="Rotate +45°"
                >
                  +45° ↻
                </button>
              </div>
            </div>
          )}

          <button
            onClick={() =>
              onAddText(text || "Your Text", {
                fontSize,
                fontFamily,
                fontWeight,
                letterSpacing,
                lineHeight,
                color,
                opacity,
                textStyle,
                curve: 0,
              })
            }
            className="w-full bg-indigo-600 text-white py-2 rounded"
          >
            ➕ Add Text
          </button>
        </section>
      )}

      {/* ================= IMAGE ================= */}
      {activeTab === "image" && (
        <section className="space-y-4">
          <input
            ref={uploadRef}
            hidden
            type="file"
            accept="image/*"
            onChange={e => {
              if (!e.target.files) return;
              onAddImage(URL.createObjectURL(e.target.files[0]));
            }}
          />

          <button
            onClick={() => uploadRef.current?.click()}
            className="w-full border py-2 rounded"
          >
            Upload Image
          </button>

          {selectedLayer?.type === "image" && (
            <>
              <Range
                label="Opacity"
                min={0}
                max={1}
                step={0.05}
                value={(selectedLayer as ImageLayer).opacity ?? 1}
                onChange={v => onUpdateImage({ opacity: v })}
              />

              {selectedLayer && (
                <div className="space-y-3 border-t pt-4">
                  <label className="block text-sm font-semibold text-gray-900">
                    Rotation: {selectedLayer.rotation || 0}°
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    step={1}
                    value={selectedLayer.rotation || 0}
                    onChange={e => {
                      const rotation = parseInt(e.target.value, 10);
                      onUpdateImage({ rotation });
                    }}
                    className="w-full"
                  />
                  <div className="flex gap-2 text-xs">
                    <button
                      onClick={() => {
                        const rotation = ((selectedLayer.rotation || 0) - 45 + 360) % 360;
                        onUpdateImage({ rotation });
                      }}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 py-1 rounded text-center transition"
                      title="Rotate -45°"
                    >
                      ↺ -45°
                    </button>
                    <button
                      onClick={() => {
                        onUpdateImage({ rotation: 0 });
                      }}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 py-1 rounded text-center transition"
                      title="Reset rotation"
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => {
                        const rotation = ((selectedLayer.rotation || 0) + 45) % 360;
                        onUpdateImage({ rotation });
                      }}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 py-1 rounded text-center transition"
                      title="Rotate +45°"
                    >
                      +45° ↻
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* ================= AI ================= */}
      {activeTab === "ai" && (
        <section className="space-y-4">
          <textarea
            rows={3}
            value={aiPrompt}
            className="w-full border rounded p-2 text-sm"
            placeholder="Describe your design"
            onChange={e => setAiPrompt(e.target.value)}
          />

          <button
            onClick={handleGenerateAIImage}
            disabled={aiLoading}
            className="w-full bg-indigo-600 text-white py-2 rounded disabled:opacity-50"
          >
            {aiLoading ? "Generating..." : "✨ Generate Image"}
          </button>

          <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto border rounded p-2">
            {aiImages.length === 0 && (
              <p className="col-span-2 text-xs text-slate-400 text-center">
                Generated images will appear here
              </p>
            )}

            {aiImages.map((src, i) => (
              <button
                key={i}
                onClick={() => onAddImage(src)}
                className="border rounded overflow-hidden hover:ring-2 ring-indigo-500"
              >
                <img
                  src={src}
                  alt="AI generated"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </section>
      )}
    </aside>
  );
}

/* ======================================================
   RANGE
====================================================== */

function Range({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="text-xs">{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(+e.target.value)}
        className="w-full accent-indigo-600"
      />
    </div>
  );
}
