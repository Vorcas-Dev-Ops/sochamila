"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FONT_GROUPS } from "@/fonts/fontCatalog";
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

  onGenerateAIImage: (prompt: string) => void;
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
  const [fontFamily, setFontFamily] = useState("Inter");
  const [fontSize, setFontSize] = useState(48);
  const [fontWeight, setFontWeight] = useState(400);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [lineHeight, setLineHeight] = useState(1.2);
  const [color, setColor] = useState("#111827");
  const [opacity, setOpacity] = useState(1);
  const [textStyle, setTextStyle] =
    useState<TextStyle>("normal");

  /* ================= SYNC SELECTED LAYER ================= */

  useEffect(() => {
    if (!selectedLayer || selectedLayer.type !== "text")
      return;

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

  const fonts = useMemo(() => FONT_GROUPS, []);

  /* ======================================================
     UI
  ====================================================== */

  return (
    <aside className="w-[320px] h-full border-r bg-white p-4 overflow-y-auto space-y-5">

      {/* HEADER */}
      <h2 className="text-lg font-semibold">
        Design Tools
      </h2>

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

      {/* ======================================================
         TEXT
      ====================================================== */}
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

          <select
            value={fontFamily}
            className="w-full border rounded p-2 text-sm"
            onChange={e => {
              loadGoogleFont(e.target.value);
              setFontFamily(e.target.value);
              onUpdateText({
                fontFamily: e.target.value,
              });
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

          <Range
            label="Font Size"
            min={12}
            max={200}
            value={fontSize}
            onChange={v => {
              setFontSize(v);
              onUpdateText({ fontSize: v });
            }}
          />

          <Range
            label="Font Weight"
            min={100}
            max={900}
            step={100}
            value={fontWeight}
            onChange={v => {
              setFontWeight(v);
              onUpdateText({ fontWeight: v });
            }}
          />

          <Range
            label="Letter Spacing"
            min={-5}
            max={20}
            value={letterSpacing}
            onChange={v => {
              setLetterSpacing(v);
              onUpdateText({ letterSpacing: v });
            }}
          />

          <Range
            label="Line Height"
            min={0.8}
            max={3}
            step={0.1}
            value={lineHeight}
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

            <Range
              label="Opacity"
              min={0}
              max={1}
              step={0.05}
              value={opacity}
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

      {/* ======================================================
         IMAGE
      ====================================================== */}
      {activeTab === "image" && (
        <section className="space-y-4">
          <input
            ref={uploadRef}
            hidden
            type="file"
            accept="image/*"
            onChange={e => {
              if (!e.target.files) return;
              onAddImage(
                URL.createObjectURL(e.target.files[0])
              );
            }}
          />

          <button
            onClick={() => uploadRef.current?.click()}
            className="w-full border py-2 rounded"
          >
            Upload Image
          </button>

          {selectedLayer?.type === "image" && (
            <Range
              label="Opacity"
              min={0}
              max={1}
              step={0.05}
              value={
                (selectedLayer as ImageLayer).opacity ??
                1
              }
              onChange={v =>
                onUpdateImage({ opacity: v })
              }
            />
          )}
        </section>
      )}

      {/* ======================================================
         AI
      ====================================================== */}
      {activeTab === "ai" && (
        <section className="space-y-4">
          <textarea
            rows={3}
            className="w-full border rounded p-2 text-sm"
            placeholder="Describe design"
            onBlur={e =>
              onGenerateAIImage(e.target.value)
            }
          />
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
