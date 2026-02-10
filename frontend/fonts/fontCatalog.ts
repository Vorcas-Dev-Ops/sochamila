export const FONT_GROUPS = {
  Sans: [
    "Inter",
    "Poppins",
    "Montserrat",
    "Roboto",
    "Open Sans",
    "Lato",
    "Nunito",
    "Manrope",
    "DM Sans",
    "Work Sans",
  ],
  Serif: [
    "Playfair Display",
    "Merriweather",
    "Libre Baskerville",
    "Crimson Text",
    "Cormorant",
    "EB Garamond",
    "Spectral",
    "Source Serif 4",
  ],
  Display: [
    "Bebas Neue",
    "Anton",
    "Oswald",
    "Raleway",
    "Abril Fatface",
    "Pacifico",
    "Lobster",
    "Fredoka",
  ],
  Mono: [
    "JetBrains Mono",
    "Fira Code",
    "IBM Plex Mono",
    "Source Code Pro",
  ],
  Hindi: [
    "Noto Sans Devanagari",
    "Noto Serif Devanagari",
    "Poppins",
    "Roboto",
  ],
  Tamil: [
    "Noto Sans Tamil",
    "Noto Serif Tamil",
    "Mukta Vaani",
  ],
  Telugu: [
    "Noto Sans Telugu",
    "Noto Serif Telugu",
  ],
  Kannada: [
    "Noto Sans Kannada",
    "Noto Serif Kannada",
  ],
  Malayalam: [
    "Noto Sans Malayalam",
    "Noto Serif Malayalam",
  ],
  Gujarati: [
    "Noto Sans Gujarati",
    "Noto Serif Gujarati",
  ],
  Bengali: [
    "Noto Sans Bengali",
    "Noto Serif Bengali",
  ],
  Punjabi: [
    "Noto Sans Gurmukhi",
    "Noto Sans Siyaq Numbers",
  ],
  Marathi: [
    "Noto Sans Devanagari",
    "Noto Serif Devanagari",
  ],
  Japanese: [
    "Noto Sans JP",
    "Noto Serif JP",
  ],
  Chinese: [
    "Noto Sans SC",
    "Noto Serif SC",
  ],
  Korean: [
    "Noto Sans KR",
    "Noto Serif KR",
  ],
  Arabic: [
    "Noto Sans Arabic",
    "Noto Serif Arabic",
    "Cairo",
  ],
  Thai: [
    "Noto Sans Thai",
    "Noto Serif Thai",
  ],
} as const;

export type FontGroup = keyof typeof FONT_GROUPS;
export type FontName =
  (typeof FONT_GROUPS)[FontGroup][number];

export const LANGUAGE_GROUPS = {
  "Latin": ["Sans", "Serif", "Display", "Mono"],
  "Indic": ["Hindi", "Tamil", "Telugu", "Kannada", "Malayalam", "Gujarati", "Bengali", "Punjabi", "Marathi"],
  "East Asian": ["Japanese", "Chinese", "Korean"],
  "Middle East": ["Arabic", "Thai"],
} as const;

export type LanguageCategory = keyof typeof LANGUAGE_GROUPS;
