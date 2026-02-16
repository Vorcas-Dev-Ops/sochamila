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

type Tab = "text" | "image" | "ai" | "graphics" | "stickers";

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
   COLLAPSIBLE SECTION COMPONENT
====================================================== */

interface CollapsibleSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function CollapsibleSection({
  title,
  isOpen,
  onToggle,
  children,
}: CollapsibleSectionProps) {
  return (
    <div className="border rounded overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100 flex items-center justify-between transition font-semibold text-sm"
      >
        <span>{title}</span>
        <span className={`transform transition-transform ${isOpen ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>
      {isOpen && (
        <div className="p-3 space-y-3 bg-white">
          {children}
        </div>
      )}
    </div>
  );
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

  /* ================= DROPDOWN/COLLAPSIBLE STATE ================= */

  const [expandedSections, setExpandedSections] = useState({
    fonts: true,
    sizing: true,
    styling: true,
    decorations: true,
    effects: true,
    textStyles: true,
    rotation: false,
    upload: true,
    imageProps: true,
  });

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

  /* ================= GRAPHICS & STICKERS STATE ================= */

  const [graphics, setGraphics] = useState<any[]>([]);
  const [stickers, setStickers] = useState<any[]>([]);
  const [graphicsLoading, setGraphicsLoading] = useState(false);
  const [stickersLoading, setStickersLoading] = useState(false);

  /* ================= PATTERNS STATE ================= */

  const [patternType, setPatternType] = useState<string>("stripes");
  const [patternColor1, setPatternColor1] = useState("#000000");
  const [patternColor2, setPatternColor2] = useState("#FFFFFF");
  const [patternScale, setPatternScale] = useState(1);
  const [patternRotation, setPatternRotation] = useState(0);
  const [patternOpacity, setPatternOpacity] = useState(1);

  const patternTypes = [
    { id: "stripes", name: "Stripes", icon: "||||" },
    { id: "dots", name: "Dots", icon: "•••" },
    { id: "grid", name: "Grid", icon: "▦" },
    { id: "diagonal", name: "Diagonal", icon: "///" },
    { id: "checkerboard", name: "Checkerboard", icon: "▦▦" },
    { id: "waves", name: "Waves", icon: "∿∿" },
    { id: "hexagon", name: "Hexagon", icon: "⬡⬡" },
    { id: "triangle", name: "Triangle", icon: "▲▲" },
  ];

  /* ================= IMAGE UPLOAD STATE ================= */

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const dragRef = useRef<HTMLDivElement>(null);

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

  /* ================= FETCH GRAPHICS ================= */

  useEffect(() => {
    if (activeTab !== "graphics") return;

    async function fetchGraphics() {
      try {
        setGraphicsLoading(true);
        const response = await fetch("http://localhost:5000/api/graphics");
        
        if (!response.ok) {
          console.error("Failed to fetch graphics. Status:", response.status);
          setGraphics([]);
          return;
        }
        
        const data = await response.json();
        setGraphics(Array.isArray(data) ? data : data.data || []);
      } catch (error) {
        console.error("Failed to fetch graphics:", error);
        setGraphics([]);
      } finally {
        setGraphicsLoading(false);
      }
    }

    fetchGraphics();
  }, [activeTab]);



  /* ================= FETCH STICKERS ================= */

  useEffect(() => {
    if (activeTab !== "stickers") return;

    async function fetchStickers() {
      try {
        setStickersLoading(true);
        const response = await fetch("http://localhost:5000/api/stickers");
        
        if (!response.ok) {
          console.error("Failed to fetch stickers. Status:", response.status);
          setStickers([]);
          return;
        }
        
        const data = await response.json();
        setStickers(Array.isArray(data) ? data : data.data || []);
      } catch (error) {
        console.error("Failed to fetch stickers:", error);
        setStickers([]);
      } finally {
        setStickersLoading(false);
      }
    }

    fetchStickers();
  }, [activeTab]);

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

  /* ================= IMAGE UPLOAD HANDLER ================= */

  async function handleImageUpload(file: File) {
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Image size must be less than 10MB");
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      setUploadProgress(30);

      const formData = new FormData();
      formData.append("file", file);

      const backendURL = "http://localhost:5000/api/uploads";
      
      console.log("[UPLOAD] Sending file to backend:", {
        url: backendURL,
        name: file.name,
        size: file.size,
        type: file.type,
      });

      // Use the backend upload endpoint
      const response = await fetch(backendURL, {
        method: "POST",
        body: formData,
      });

      console.log("[UPLOAD] Response status:", response.status);
      
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("[UPLOAD] Failed to parse response as JSON:", parseError);
        console.error("[UPLOAD] Response text:", await response.text());
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      if (!response.ok) {
        console.error("[UPLOAD] Upload error response:", {
          status: response.status,
          data,
        });
        throw new Error(data.message || `Upload failed (${response.status})`);
      }

      setUploadProgress(100);
      
      // Add image to canvas
      if (data.url) {
        onAddImage(data.url);
      } else {
        throw new Error("No URL returned from upload");
      }
      
      // Reset after a brief delay
      setTimeout(() => {
        setUploadProgress(0);
      }, 500);
    } catch (error) {
      console.error("[UPLOAD] Full error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to upload image";
      setUploadError(errorMessage);
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  }

  /* ================= DRAG AND DROP HANDLERS ================= */

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragRef.current) {
      dragRef.current.classList.add("ring-2", "ring-indigo-500", "bg-indigo-50");
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragRef.current) {
      dragRef.current.classList.remove("ring-2", "ring-indigo-500", "bg-indigo-50");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragRef.current) {
      dragRef.current.classList.remove("ring-2", "ring-indigo-500", "bg-indigo-50");
    }

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageUpload(files[0]);
    }
  }

  /* ======================================================
     UI
  ====================================================== */

  return (
    <aside className="w-[320px] h-full border-r bg-white p-4 overflow-y-auto space-y-5">

      <h2 className="text-lg font-semibold">Design Tools</h2>

      {/* TABS */}
      <div className="grid grid-cols-5 gap-2 text-xs">
        {(["text", "image", "graphics", "stickers", "ai"] as Tab[]).map(t => (
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
        <section className="space-y-2">

          {/* Text Input */}
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

          {/* ========== FONTS SECTION ========== */}
          <CollapsibleSection
            title="Fonts"
            isOpen={expandedSections.fonts}
            onToggle={() =>
              setExpandedSections(s => ({ ...s, fonts: !s.fonts }))
            }
          >
            <div className="space-y-2">
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
          </CollapsibleSection>

          {/* ========== SIZING SECTION ========== */}
          <CollapsibleSection
            title="Sizing"
            isOpen={expandedSections.sizing}
            onToggle={() =>
              setExpandedSections(s => ({ ...s, sizing: !s.sizing }))
            }
          >
            <div className="space-y-3">
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
            </div>
          </CollapsibleSection>

          {/* ========== STYLING SECTION ========== */}
          <CollapsibleSection
            title="Styling"
            isOpen={expandedSections.styling}
            onToggle={() =>
              setExpandedSections(s => ({ ...s, styling: !s.styling }))
            }
          >
            <div className="space-y-3">
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={color}
                  onChange={e => {
                    setColor(e.target.value);
                    onUpdateText({ color: e.target.value });
                  }}
                  className="w-12 h-8 rounded cursor-pointer"
                  title="Text color"
                />
                <Range label="Opacity" min={0} max={1} step={0.05} value={opacity}
                  onChange={v => {
                    setOpacity(v);
                    onUpdateText({ opacity: v });
                  }}
                />
              </div>
            </div>
          </CollapsibleSection>

          {/* ========== TEXT DECORATIONS ========== */}
          <CollapsibleSection
            title="Decorations"
            isOpen={expandedSections.decorations}
            onToggle={() =>
              setExpandedSections(s => ({ ...s, decorations: !s.decorations }))
            }
          >
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsItalic(!isItalic);
                  onUpdateText({ isItalic: !isItalic });
                }}
                className={`flex-1 py-2 text-xs rounded font-italic transition ${
                  isItalic ? "bg-indigo-600 text-white" : "border hover:bg-slate-50"
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
                className={`flex-1 py-2 text-xs rounded transition ${
                  isUnderline ? "bg-indigo-600 text-white" : "border hover:bg-slate-50"
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
                className={`flex-1 py-2 text-xs rounded transition ${
                  isStrikethrough ? "bg-indigo-600 text-white" : "border hover:bg-slate-50"
                }`}
                title="Strikethrough"
              >
                <s>Strike</s>
              </button>
            </div>
          </CollapsibleSection>

          {/* ========== TEXT STYLES ========== */}
          <CollapsibleSection
            title="Text Styles"
            isOpen={expandedSections.textStyles}
            onToggle={() =>
              setExpandedSections(s => ({ ...s, textStyles: !s.textStyles }))
            }
          >
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
                      : "border hover:bg-slate-100"
                  }`}
                  title={s}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </CollapsibleSection>

          {/* ========== SHADOW/GLOW EFFECTS ========== */}
          {(textStyle === "shadow" || textStyle === "3d") && (
            <CollapsibleSection
              title="Shadow Effects"
              isOpen={expandedSections.effects}
              onToggle={() =>
                setExpandedSections(s => ({ ...s, effects: !s.effects }))
              }
            >
              <div className="space-y-3">
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={shadowColor}
                    onChange={e => {
                      setShadowColor(e.target.value);
                      onUpdateText({ shadowColor: e.target.value });
                    }}
                    className="w-10 h-8 rounded cursor-pointer"
                    title="Shadow color"
                  />
                  <span className="text-xs text-gray-600 flex-1">Color</span>
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
            </CollapsibleSection>
          )}

          {/* ========== 3D EFFECTS ========== */}
          {textStyle === "3d" && (
            <CollapsibleSection
              title="3D Effects"
              isOpen={expandedSections.effects}
              onToggle={() =>
                setExpandedSections(s => ({ ...s, effects: !s.effects }))
              }
            >
              <div className="space-y-3">
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
            </CollapsibleSection>
          )}

          {/* ========== GLOW EFFECTS ========== */}
          {textStyle === "glow" && (
            <CollapsibleSection
              title="Glow Effects"
              isOpen={expandedSections.effects}
              onToggle={() =>
                setExpandedSections(s => ({ ...s, effects: !s.effects }))
              }
            >
              <div className="space-y-3">
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={glowColor}
                    onChange={e => {
                      setGlowColor(e.target.value);
                      onUpdateText({ glowColor: e.target.value });
                    }}
                    className="w-10 h-8 rounded cursor-pointer"
                    title="Glow color"
                  />
                  <span className="text-xs text-gray-600 flex-1">Glow Color</span>
                </div>
                <Range label="Glow Size" min={0} max={20} value={glowSize}
                  onChange={v => {
                    setGlowSize(v);
                    onUpdateText({ glowSize: v });
                  }}
                />
              </div>
            </CollapsibleSection>
          )}

          {/* ========== GRADIENT EFFECTS ========== */}
          {textStyle === "gradient" && (
            <CollapsibleSection
              title="Gradient Effects"
              isOpen={expandedSections.effects}
              onToggle={() =>
                setExpandedSections(s => ({ ...s, effects: !s.effects }))
              }
            >
              <div className="space-y-3">
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={gradientStart}
                    onChange={e => {
                      setGradientStart(e.target.value);
                      onUpdateText({ gradientStart: e.target.value });
                    }}
                    className="w-10 h-8 rounded cursor-pointer"
                    title="Gradient start"
                  />
                  <span className="text-xs text-gray-600 flex-1">Start</span>
                </div>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={gradientEnd}
                    onChange={e => {
                      setGradientEnd(e.target.value);
                      onUpdateText({ gradientEnd: e.target.value });
                    }}
                    className="w-10 h-8 rounded cursor-pointer"
                    title="Gradient end"
                  />
                  <span className="text-xs text-gray-600 flex-1">End</span>
                </div>
                <Range label="Angle" min={0} max={360} step={15} value={gradientAngle}
                  onChange={v => {
                    setGradientAngle(v);
                    onUpdateText({ gradientAngle: v });
                  }}
                />
              </div>
            </CollapsibleSection>
          )}

          {/* ========== ROTATION ========== */}
          {selectedLayer && selectedLayer.type === "text" && (
            <CollapsibleSection
              title="Rotation"
              isOpen={expandedSections.rotation}
              onToggle={() =>
                setExpandedSections(s => ({ ...s, rotation: !s.rotation }))
              }
            >
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-gray-900">
                  {selectedLayer.rotation || 0}°
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
                    className="flex-1 bg-slate-200 hover:bg-slate-300 py-1 rounded text-center transition"
                    title="Rotate -45°"
                  >
                    ↺ -45°
                  </button>
                  <button
                    onClick={() => onUpdateText({ rotation: 0 })}
                    className="flex-1 bg-slate-200 hover:bg-slate-300 py-1 rounded text-center transition"
                    title="Reset rotation"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => onUpdateText({ rotation: ((selectedLayer.rotation || 0) + 45) % 360 })}
                    className="flex-1 bg-slate-200 hover:bg-slate-300 py-1 rounded text-center transition"
                    title="Rotate +45°"
                  >
                    +45° ↻
                  </button>
                </div>
              </div>
            </CollapsibleSection>
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
            className="w-full bg-indigo-600 text-white py-2 rounded font-semibold hover:bg-indigo-700 transition"
          >
            ➕ Add Text
          </button>
        </section>
      )}

      {/* ================= IMAGE ================= */}
      {activeTab === "image" && (
        <section className="space-y-2">

          {/* ========== UPLOAD SECTION ========== */}
          <CollapsibleSection
            title="Upload Image"
            isOpen={expandedSections.upload}
            onToggle={() =>
              setExpandedSections(s => ({ ...s, upload: !s.upload }))
            }
          >
            <div className="space-y-3">
              {/* Drag and Drop Zone */}
              <div
                ref={dragRef}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center transition-all cursor-pointer hover:border-indigo-500"
              >
                <input
                  ref={uploadRef}
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      handleImageUpload(e.target.files[0]);
                    }
                  }}
                />

                <div className="space-y-2">
                  <div className="text-3xl">📸</div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Drag and drop image</p>
                    <p className="text-xs text-slate-500">or click to browse</p>
                  </div>
                  <p className="text-xs text-slate-400">Max 10MB • PNG, JPG, GIF</p>
                </div>
              </div>

              {/* Upload Button */}
              <button
                onClick={() => uploadRef.current?.click()}
                disabled={isUploading}
                className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isUploading ? "Uploading..." : "📤 Choose Image"}
              </button>

              {/* Progress Bar */}
              {isUploading && uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-center text-slate-600">{uploadProgress}%</p>
                </div>
              )}

              {/* Error Message */}
              {uploadError && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <p className="text-xs text-red-700 font-semibold mb-1">Upload Error:</p>
                  <p className="text-xs text-red-600 break-all">{uploadError}</p>
                  <p className="text-xs text-red-500 mt-2">Check the browser console for more details.</p>
                </div>
              )}
            </div>
          </CollapsibleSection>

          {/* ========== IMAGE PROPERTIES ========== */}
          {selectedLayer?.type === "image" && (
            <CollapsibleSection
              title="Image Properties"
              isOpen={expandedSections.imageProps}
              onToggle={() =>
                setExpandedSections(s => ({ ...s, imageProps: !s.imageProps }))
              }
            >
              <div className="space-y-3">
                <Range
                  label="Opacity"
                  min={0}
                  max={1}
                  step={0.05}
                  value={(selectedLayer as ImageLayer).opacity ?? 1}
                  onChange={v => onUpdateImage({ opacity: v })}
                />

                {selectedLayer && (
                  <div className="space-y-3">
                    <label className="block text-xs font-semibold text-gray-900">
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
                        className="flex-1 bg-slate-200 hover:bg-slate-300 py-1 rounded text-center transition"
                        title="Rotate -45°"
                      >
                        ↺ -45°
                      </button>
                      <button
                        onClick={() => {
                          onUpdateImage({ rotation: 0 });
                        }}
                        className="flex-1 bg-slate-200 hover:bg-slate-300 py-1 rounded text-center transition"
                        title="Reset rotation"
                      >
                        Reset
                      </button>
                      <button
                        onClick={() => {
                          const rotation = ((selectedLayer.rotation || 0) + 45) % 360;
                          onUpdateImage({ rotation });
                        }}
                        className="flex-1 bg-slate-200 hover:bg-slate-300 py-1 rounded text-center transition"
                        title="Rotate +45°"
                      >
                        +45° ↻
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleSection>
          )}
        </section>
      )}

      {/* ================= AI ================= */}
      {activeTab === "ai" && (
        <section className="space-y-2">

          {/* ========== AI GENERATION ========== */}
          <CollapsibleSection
            title="AI Image Generation"
            isOpen={expandedSections.fonts}
            onToggle={() =>
              setExpandedSections(s => ({ ...s, fonts: !s.fonts }))
            }
          >
            <div className="space-y-3">
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
                className="w-full bg-indigo-600 text-white py-2 rounded disabled:opacity-50 hover:bg-indigo-700 transition"
              >
                {aiLoading ? "Generating..." : "✨ Generate Image"}
              </button>
            </div>
          </CollapsibleSection>

          {/* ========== GENERATED IMAGES ========== */}
          <CollapsibleSection
            title="Generated Images"
            isOpen={expandedSections.sizing}
            onToggle={() =>
              setExpandedSections(s => ({ ...s, sizing: !s.sizing }))
            }
          >
            <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
              {aiImages.length === 0 && (
                <p className="col-span-2 text-xs text-slate-400 text-center py-8">
                  Generated images will appear here
                </p>
              )}

              {aiImages.map((src, i) => (
                <button
                  key={i}
                  onClick={() => onAddImage(src)}
                  className="border rounded overflow-hidden hover:ring-2 ring-indigo-500 transition"
                >
                  <img
                    src={src}
                    alt="AI generated"
                    className="w-full h-24 object-cover"
                  />
                </button>
              ))}
            </div>
          </CollapsibleSection>
        </section>
      )}

      {/* ================= GRAPHICS ================= */}
      {activeTab === "graphics" && (
        <section className="space-y-2">

          {/* ========== PATTERNS SECTION ========== */}
          <CollapsibleSection
            title="Patterns"
            isOpen={expandedSections.fonts}
            onToggle={() =>
              setExpandedSections(s => ({ ...s, fonts: !s.fonts }))
            }
          >
            <div className="space-y-4">
              {/* Pattern Type Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold block">Pattern Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {patternTypes.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setPatternType(p.id)}
                      className={`py-2 px-1 text-xs rounded border transition ${
                        patternType === p.id
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "border-slate-300 hover:border-indigo-500"
                      }`}
                      title={p.name}
                    >
                      <div className="text-lg mb-1">{p.icon}</div>
                      <div className="text-[10px]">{p.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pattern Colors */}
              <div className="space-y-2">
                <label className="text-xs font-semibold block">Colors</label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-slate-600 block mb-1">Color 1</label>
                    <input
                      type="color"
                      value={patternColor1}
                      onChange={e => setPatternColor1(e.target.value)}
                      className="w-full h-8 rounded cursor-pointer"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-slate-600 block mb-1">Color 2</label>
                    <input
                      type="color"
                      value={patternColor2}
                      onChange={e => setPatternColor2(e.target.value)}
                      className="w-full h-8 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Pattern Scale */}
              <Range
                label="Scale"
                min={0.5}
                max={5}
                step={0.5}
                value={patternScale}
                onChange={setPatternScale}
              />

              {/* Pattern Rotation */}
              <Range
                label="Rotation"
                min={0}
                max={360}
                step={15}
                value={patternRotation}
                onChange={setPatternRotation}
              />

              {/* Pattern Opacity */}
              <Range
                label="Opacity"
                min={0}
                max={1}
                step={0.1}
                value={patternOpacity}
                onChange={setPatternOpacity}
              />

              {/* Preview */}
              <div className="border rounded-lg p-3 bg-slate-50 space-y-2">
                <p className="text-xs font-semibold text-slate-700">Preview</p>
                <div
                  className="w-full h-24 rounded border border-slate-300 bg-white"
                  style={{
                    backgroundImage: `url("${generatePatternSVG(patternType, patternColor1, patternColor2, patternScale, patternRotation)}")`,
                    // tile size inversely related to scale
                    backgroundSize: `${Math.max(8, Math.round(100 / Math.max(0.01, patternScale)))}px ${Math.max(8, Math.round(100 / Math.max(0.01, patternScale)))}px`,
                    opacity: patternOpacity,
                    backgroundRepeat: 'repeat',
                    backgroundPosition: 'center',
                  }}
                />
              </div>

              {/* Add Pattern Button */}
              <button
                onClick={() => {
                  const svgData = generatePatternSVG(patternType, patternColor1, patternColor2, patternScale, patternRotation);
                  const tile = Math.max(8, Math.round(100 / Math.max(0.01, patternScale)));

                  // Create a canvas sized to one tile and draw the SVG into it
                  const canvas = document.createElement('canvas');
                  canvas.width = tile;
                  canvas.height = tile;
                  const ctx = canvas.getContext('2d')!;

                  const img = new Image();
                  img.crossOrigin = 'anonymous';
                  img.onload = () => {
                    // Create a larger canvas and fill it with the repeating tile
                    const repeat = 8;
                    const size = tile * repeat;
                    canvas.width = size;
                    canvas.height = size;
                    ctx.clearRect(0, 0, size, size);
                    ctx.globalAlpha = patternOpacity;
                    const patternFill = ctx.createPattern(img, 'repeat');
                    if (patternFill) {
                      ctx.fillStyle = patternFill;
                      ctx.fillRect(0, 0, size, size);
                    } else {
                      // Fallback: draw tiled manually
                      for (let x = 0; x < repeat; x++) {
                        for (let y = 0; y < repeat; y++) {
                          ctx.drawImage(img, x * tile, y * tile, tile, tile);
                        }
                      }
                    }
                    ctx.globalAlpha = 1;
                    onAddImage(canvas.toDataURL());
                  };
                  img.onerror = (err) => {
                    console.error('Failed to load pattern SVG image', err);
                  };
                  img.src = svgData;
                }}
                className="w-full bg-indigo-600 text-white py-2 rounded font-semibold hover:bg-indigo-700 transition"
              >
                ➕ Add Pattern
              </button>
            </div>
          </CollapsibleSection>

          {/* ========== GRAPHICS LIBRARY ========== */}
          <CollapsibleSection
            title={`Graphics (${graphics.length})`}
            isOpen={expandedSections.styling}
            onToggle={() =>
              setExpandedSections(s => ({ ...s, styling: !s.styling }))
            }
          >
            <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
              {graphicsLoading && (
                <p className="col-span-2 text-sm text-center text-slate-500 py-8">
                  Loading graphics...
                </p>
              )}

              {!graphicsLoading && graphics.length === 0 && (
                <p className="col-span-2 text-xs text-slate-400 text-center py-8">
                  No graphics available
                </p>
              )}

              {graphics.map((graphic: any) => {
                const imageUrl = graphic.imageUrl.startsWith('http') 
                  ? graphic.imageUrl 
                  : `http://localhost:5000${graphic.imageUrl}`;
                return (
                  <button
                    key={graphic.id}
                    onClick={() => onAddImage(graphic.imageUrl)}
                    className="border rounded overflow-hidden hover:ring-2 ring-indigo-500 transition"
                    title={graphic.id}
                  >
                    <img
                      src={imageUrl}
                      alt={graphic.id}
                      className="w-full h-24 object-cover"
                    />
                  </button>
                );
              })}
            </div>
          </CollapsibleSection>
        </section>
      )}

      {/* ================= STICKERS ================= */}
      {activeTab === "stickers" && (
        <section className="space-y-2">

          {/* ========== STICKERS LIBRARY ========== */}
          <CollapsibleSection
            title={`Stickers (${stickers.length})`}
            isOpen={expandedSections.decorations}
            onToggle={() =>
              setExpandedSections(s => ({ ...s, decorations: !s.decorations }))
            }
          >
            <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
              {stickersLoading && (
                <p className="col-span-2 text-sm text-center text-slate-500 py-8">
                  Loading stickers...
                </p>
              )}

              {!stickersLoading && stickers.length === 0 && (
                <p className="col-span-2 text-xs text-slate-400 text-center py-8">
                  No stickers available
                </p>
              )}

              {stickers.map((sticker: any) => {
                const imageUrl = sticker.imageUrl.startsWith('http') 
                  ? sticker.imageUrl 
                  : `http://localhost:5000${sticker.imageUrl}`;
                return (
                  <button
                    key={sticker.id}
                    onClick={() => onAddImage(sticker.imageUrl)}
                    className="border rounded overflow-hidden hover:ring-2 ring-indigo-500 transition"
                    title={sticker.name}
                  >
                    <img
                      src={imageUrl}
                      alt={sticker.name}
                      className="w-full h-24 object-cover"
                    />
                  </button>
                );
              })}
            </div>
          </CollapsibleSection>
        </section>
      )}
    </aside>
  );
}

/* ======================================================
   PATTERN GENERATOR
====================================================== */

function generatePatternSVG(
  type: string,
  color1: string,
  color2: string,
  scale: number,
  rotation: number
): string {
  // Treat scale as an inverse multiplier: larger scale -> smaller tile.
  const base = 100;
  const tile = Math.max(8, Math.round(base / Math.max(0.01, scale)));

  let pattern = "";
  switch (type) {
    case "stripes":
      pattern = `
        <pattern id="p" x="0" y="0" width="${tile}" height="${tile}" patternUnits="userSpaceOnUse" patternTransform="rotate(${rotation})">
          <rect width="${tile / 2}" height="${tile}" fill="${color1}"/>
          <rect x="${tile / 2}" width="${tile / 2}" height="${tile}" fill="${color2}"/>
        </pattern>`;
      break;
    case "dots":
      pattern = `
        <pattern id="p" x="0" y="0" width="${tile}" height="${tile}" patternUnits="userSpaceOnUse" patternTransform="rotate(${rotation})">
          <rect width="${tile}" height="${tile}" fill="${color2}"/>
          <circle cx="${tile / 2}" cy="${tile / 2}" r="${Math.max(2, tile / 4)}" fill="${color1}"/>
        </pattern>`;
      break;
    case "grid":
      pattern = `
        <pattern id="p" x="0" y="0" width="${tile}" height="${tile}" patternUnits="userSpaceOnUse" patternTransform="rotate(${rotation})">
          <rect width="${tile}" height="${tile}" fill="${color2}"/>
          <path d="M ${tile} 0 L 0 0 0 ${tile}" fill="none" stroke="${color1}" stroke-width="${Math.max(1, tile/25)}"/>
        </pattern>`;
      break;
    case "diagonal":
      pattern = `
        <pattern id="p" x="0" y="0" width="${tile}" height="${tile}" patternUnits="userSpaceOnUse" patternTransform="rotate(${rotation})">
          <rect width="${tile}" height="${tile}" fill="${color2}"/>
          <path d="M-${tile},0 l${tile * 2},${tile * 2} M0,-${tile} l${tile * 2},${tile * 2}" stroke="${color1}" stroke-width="${Math.max(1, tile/25)}"/>
        </pattern>`;
      break;
    case "checkerboard":
      pattern = `
        <pattern id="p" x="0" y="0" width="${tile}" height="${tile}" patternUnits="userSpaceOnUse" patternTransform="rotate(${rotation})">
          <rect width="${tile/2}" height="${tile/2}" fill="${color1}"/>
          <rect x="${tile/2}" y="${tile/2}" width="${tile/2}" height="${tile/2}" fill="${color1}"/>
          <rect x="${tile/2}" width="${tile/2}" height="${tile/2}" fill="${color2}"/>
          <rect y="${tile/2}" width="${tile/2}" height="${tile/2}" fill="${color2}"/>
        </pattern>`;
      break;
    case "waves":
      pattern = `
        <pattern id="p" x="0" y="0" width="${tile}" height="${tile}" patternUnits="userSpaceOnUse" patternTransform="rotate(${rotation})">
          <rect width="${tile}" height="${tile}" fill="${color2}"/>
          <path d="M0,${tile / 2} Q${tile / 4},${tile / 4} ${tile / 2},${tile / 2} T${tile},${tile / 2}" stroke="${color1}" stroke-width="${Math.max(1, tile/20)}" fill="none"/>
        </pattern>`;
      break;
    case "hexagon":
      pattern = `
        <pattern id="p" x="0" y="0" width="${tile}" height="${tile}" patternUnits="userSpaceOnUse" patternTransform="rotate(${rotation})">
          <rect width="${tile}" height="${tile}" fill="${color2}"/>
          <polygon points="${tile/2},${tile/6} ${tile*5/6},${tile/3} ${tile*5/6},${tile*2/3} ${tile/2},${tile*5/6} ${tile/6},${tile*2/3} ${tile/6},${tile/3}" fill="none" stroke="${color1}" stroke-width="${Math.max(1, tile/25)}"/>
        </pattern>`;
      break;
    case "triangle":
      pattern = `
        <pattern id="p" x="0" y="0" width="${tile}" height="${tile}" patternUnits="userSpaceOnUse" patternTransform="rotate(${rotation})">
          <rect width="${tile}" height="${tile}" fill="${color2}"/>
          <polygon points="${tile/2},${tile/4} ${tile*3/4},${tile*3/4} ${tile/4},${tile*3/4}" fill="${color1}"/>
        </pattern>`;
      break;
    default:
      pattern = `
        <pattern id="p" x="0" y="0" width="${tile}" height="${tile}" patternUnits="userSpaceOnUse">
          <rect width="${tile}" height="${tile}" fill="${color1}"/>
        </pattern>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${tile}" height="${tile}">${pattern}<rect width="${tile}" height="${tile}" fill="url(#p)"/></svg>`;
  const encoded = encodeURIComponent(svg);
  return `data:image/svg+xml;utf8,${encoded}`;
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
