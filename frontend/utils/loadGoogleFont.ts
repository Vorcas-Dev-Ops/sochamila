const loadedFonts = new Set<string>();

export function loadGoogleFont(fontFamily: string) {
  if (loadedFonts.has(fontFamily)) return;

  const link = document.createElement("link");
  link.rel = "stylesheet";

  const family = fontFamily.replace(/ /g, "+");
  link.href = `https://fonts.googleapis.com/css2?family=${family}:wght@300;400;500;600;700;800;900&display=swap`;

  document.head.appendChild(link);
  loadedFonts.add(fontFamily);
}
