export type ThemeType = "dark" | "light" | "sunset" | "ocean" | "forest";

export interface Theme {
  id: ThemeType;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
}

export const THEMES: Record<ThemeType, Theme> = {
  dark: {
    id: "dark",
    name: "Dark Mode",
    description: "The default immersive travel theme.",
    colors: {
      primary: "#0B1F3A",
      secondary: "#11243A",
      accent: "#D4AF37",
      background: "#0B1F3A",
      text: "#F8F9FB",
    },
  },
  light: {
    id: "light",
    name: "Light Mode",
    description: "Clean and bright interface.",
    colors: {
      primary: "#FFFFFF",
      secondary: "#F8F9FA",
      accent: "#007BFF",
      background: "#FFFFFF",
      text: "#212529",
    },
  },
  sunset: {
    id: "sunset",
    name: "Sunset Glow",
    description: "Warm amber tones for a cozy experience.",
    colors: {
      primary: "#2C1D0E",
      secondary: "#3D2B1F",
      accent: "#FF6B35",
      background: "#2C1D0E",
      text: "#FFF8E1",
    },
  },
  ocean: {
    id: "ocean",
    name: "Ocean Blue",
    description: "Calming blue tones inspired by the sea.",
    colors: {
      primary: "#0A1929",
      secondary: "#1A365D",
      accent: "#00D4FF",
      background: "#0A1929",
      text: "#E2E8F0",
    },
  },
  forest: {
    id: "forest",
    name: "Forest Green",
    description: "Natural green tones for an earthy feel.",
    colors: {
      primary: "#0F1419",
      secondary: "#1A2E1F",
      accent: "#22C55E",
      background: "#0F1419",
      text: "#F0F9FF",
    },
  },
};

export const DEFAULT_THEME: ThemeType = "dark";

export function getThemeFromStorage(): ThemeType {
  if (typeof window === "undefined") return DEFAULT_THEME;
  return (localStorage.getItem("appTheme") as ThemeType) || DEFAULT_THEME;
}

export function saveThemeToStorage(theme: ThemeType): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("appTheme", theme);
}

export function applyThemeToDOM(theme: Theme): void {
  if (typeof window === "undefined") return;

  const root = document.documentElement;
  root.style.setProperty("--theme-primary", theme.colors.primary);
  root.style.setProperty("--theme-secondary", theme.colors.secondary);
  root.style.setProperty("--theme-accent", theme.colors.accent);
  root.style.setProperty("--theme-background", theme.colors.background);
  root.style.setProperty("--theme-text", theme.colors.text);

  // Apply to body for immediate effect
  document.body.style.backgroundColor = theme.colors.background;
  document.body.style.color = theme.colors.text;
}
