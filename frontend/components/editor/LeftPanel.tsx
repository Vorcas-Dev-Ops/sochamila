"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FONT_GROUPS, type FontGroup } from "@/fonts/fontCatalog";
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
  const [fontFamily, setFontFamily] = useState("Inter");
  const [fontSize, setFontSize] = useState(48);
  const [fontWeight, setFontWeight] = useState(400);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [lineHeight, setLineHeight] = useState(1.2);
  const [color, setColor] = useState("#111827");
  const [opacity, setOpacity] = useState(1);
  const [textStyle, setTextStyle] = useState<TextStyle>("normal");
  
  // Text decorations
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  
  // Shadow effects
  const [shadowColor, setShadowColor] = useState("#000000");
  const [shadowOffsetX, setShadowOffsetX] = useState(2);
  const [shadowOffsetY, setShadowOffsetY] = useState(2);
  const [shadowBlur, setShadowBlur] = useState(4);
  
  // 3D effects
  const [depth3d, setDepth3d] = useState(5);
  const [angle3d, setAngle3d] = useState(45);
  
  // Glow effects
  const [glowColor, setGlowColor] = useState("#FF00FF");
  const [glowSize, setGlowSize] = useState(5);
  
  // Gradient text
  const [gradientStart, setGradientStart] = useState("#FF0000");
  const [gradientEnd, setGradientEnd] = useState("#0000FF");
  const [gradientAngle, setGradientAngle] = useState(0);

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
    return FONT_GROUPS;
  }, []);

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
              const inputText = e.target.value;
              setText(inputText);
              onUpdateText({ text: inputText });
            }}
          />


          <div>
            <label className="text-xs block mb-1 font-semibold">Font Family</label>
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
          </div>

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

          {/* Text Decorations */}
          <div className="space-y-2">
            <label className="text-xs block font-semibold">Text Decorations</label>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsItalic(!isItalic);
                  onUpdateText({ isItalic: !isItalic });
                }}
                className={`flex-1 py-2 text-xs rounded font-italic ${
                  isItalic ? "bg-indigo-600 text-white" : "border"
                }`}
                title="Italic"
              >
                <em>Italic</em>
              </button>
              <button
                onClick={() => {
                  setIsUnderline(!isUnderline);
                  onUpdateText({ isUnderline: !isUnderline });
                }}
                className={`flex-1 py-2 text-xs rounded ${
                  isUnderline ? "bg-indigo-600 text-white" : "border"
                }`}
                title="Underline"
              >
                <u>Under</u>
              </button>
              <button
                onClick={() => {
                  setIsStrikethrough(!isStrikethrough);
                  onUpdateText({ isStrikethrough: !isStrikethrough });
                }}
                className={`flex-1 py-2 text-xs rounded ${
                  isStrikethrough ? "bg-indigo-600 text-white" : "border"
                }`}
                title="Strikethrough"
              >
                <s>Strike</s>
              </button>
            </div>
          </div>

          {/* Text Styles */}
          <div className="space-y-2">
            <label className="text-xs block font-semibold">Text Style</label>
            <div className="grid grid-cols-3 gap-2">
              {(["normal", "shadow", "outline", "3d", "glow", "emboss", "neon", "gradient", "chrome", "glass", "fire", "wave", "blur", "marble", "plasma", "hologram"] as TextStyle[]).map(s => (
                <button
                  key={s}
                  onClick={() => {
                    setTextStyle(s);
                    onUpdateText({ textStyle: s });
                  }}
                  className={`py-2 px-1 text-xs rounded font-semibold transition whitespace-nowrap overflow-hidden ${
                    textStyle === s
                      ? "bg-indigo-600 text-white"
                      : "border hover:bg-gray-50"
                  }`}
                  title={s}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Shadow Controls - shown when shadow or 3d style */}
          {(textStyle === "shadow" || textStyle === "3d") && (
            <div className="space-y-3 border-t pt-3 mt-3">
              <label className="text-xs block font-semibold">Shadow Effects</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={shadowColor}
                  onChange={e => {
                    setShadowColor(e.target.value);
                    onUpdateText({ shadowColor: e.target.value });
                  }}
                  className="w-12 h-8 rounded cursor-pointer"
                  title="Shadow color"
                />
                <span className="text-xs text-gray-600">Color</span>
              </div>
              <Range label="Offset X" min={-10} max={10} value={shadowOffsetX}
                onChange={v => {
                  setShadowOffsetX(v);
                  onUpdateText({ shadowOffsetX: v });
                }}
              />
              <Range label="Offset Y" min={-10} max={10} value={shadowOffsetY}
                onChange={v => {
                  setShadowOffsetY(v);
                  onUpdateText({ shadowOffsetY: v });
                }}
              />
              <Range label="Blur" min={0} max={20} value={shadowBlur}
                onChange={v => {
                  setShadowBlur(v);
                  onUpdateText({ shadowBlur: v });
                }}
              />
            </div>
          )}

          {/* 3D Controls - shown when 3d style */}
          {textStyle === "3d" && (
            <div className="space-y-3 border-t pt-3">
              <label className="text-xs block font-semibold">3D Effects</label>
              <Range label="Depth" min={0} max={50} value={depth3d}
                onChange={v => {
                  setDepth3d(v);
                  onUpdateText({ depth3d: v });
                }}
              />
              <Range label="Angle" min={0} max={360} step={15} value={angle3d}
                onChange={v => {
                  setAngle3d(v);
                  onUpdateText({ angle3d: v });
                }}
              />
            </div>
          )}

          {/* Glow Controls - shown when glow style */}
          {textStyle === "glow" && (
            <div className="space-y-3 border-t pt-3">
              <label className="text-xs block font-semibold">Glow Effects</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={glowColor}
                  onChange={e => {
                    setGlowColor(e.target.value);
                    onUpdateText({ glowColor: e.target.value });
                  }}
                  className="w-12 h-8 rounded cursor-pointer"
                  title="Glow color"
                />
                <span className="text-xs text-gray-600">Glow Color</span>
              </div>
              <Range label="Glow Size" min={0} max={20} value={glowSize}
                onChange={v => {
                  setGlowSize(v);
                  onUpdateText({ glowSize: v });
                }}
              />
            </div>
          )}

          {/* Gradient Controls - shown when gradient style */}
          {textStyle === "gradient" && (
            <div className="space-y-3 border-t pt-3">
              <label className="text-xs block font-semibold">Gradient Effects</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={gradientStart}
                  onChange={e => {
                    setGradientStart(e.target.value);
                    onUpdateText({ gradientStart: e.target.value });
                  }}
                  className="w-12 h-8 rounded cursor-pointer"
                  title="Gradient start"
                />
                <span className="text-xs text-gray-600">Start</span>
              </div>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={gradientEnd}
                  onChange={e => {
                    setGradientEnd(e.target.value);
                    onUpdateText({ gradientEnd: e.target.value });
                  }}
                  className="w-12 h-8 rounded cursor-pointer"
                  title="Gradient end"
                />
                <span className="text-xs text-gray-600">End</span>
              </div>
              <Range label="Angle" min={0} max={360} step={15} value={gradientAngle}
                onChange={v => {
                  setGradientAngle(v);
                  onUpdateText({ gradientAngle: v });
                }}
              />
            </div>
          )}

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
