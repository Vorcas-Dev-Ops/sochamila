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
} as const;

export type FontGroup = keyof typeof FONT_GROUPS;
export type FontName =
  (typeof FONT_GROUPS)[FontGroup][number];
