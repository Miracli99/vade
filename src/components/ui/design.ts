export const modernColors = {
  page: "#05080d",
  shell: "#071018",
  shellMuted: "#0a121b",
  panel: "#0c1620",
  panelElevated: "#111d29",
  panelSoft: "rgba(12, 22, 32, 0.86)",
  panelGlass: "rgba(9, 18, 27, 0.76)",
  border: "rgba(148, 163, 184, 0.16)",
  borderStrong: "rgba(214, 161, 58, 0.28)",
  text: "#f5f1e8",
  textSoft: "#d8deea",
  muted: "#98a6b5",
  faint: "#657386",
  accent: "#d6a13a",
  accentText: "#2c1b05",
  accentSoft: "rgba(214, 161, 58, 0.12)",
  crimson: "#d95d56",
  crimsonSoft: "rgba(217, 93, 86, 0.14)",
  azure: "#5d9dff",
  azureSoft: "rgba(93, 157, 255, 0.14)",
  emerald: "#62b87b",
  emeraldSoft: "rgba(98, 184, 123, 0.14)",
} as const;

export const modernRadii = {
  sm: 6,
  md: 8,
  lg: 10,
  xl: 14,
} as const;

export const modernSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
} as const;

export const modernType = {
  labelSpacing: 0.8,
  labelSize: 11,
  bodySize: 14,
  titleSize: 22,
  screenTitleSize: 30,
} as const;

export type ModernTone = "accent" | "crimson" | "azure" | "emerald";

export function getToneColor(tone: ModernTone) {
  if (tone === "crimson") {
    return modernColors.crimson;
  }

  if (tone === "azure") {
    return modernColors.azure;
  }

  if (tone === "emerald") {
    return modernColors.emerald;
  }

  return modernColors.accent;
}

export function getToneSoftColor(tone: ModernTone) {
  if (tone === "crimson") {
    return modernColors.crimsonSoft;
  }

  if (tone === "azure") {
    return modernColors.azureSoft;
  }

  if (tone === "emerald") {
    return modernColors.emeraldSoft;
  }

  return modernColors.accentSoft;
}
