/**
 * Design tokens â€?single source of truth for all visual values.
 *
 * Hard rules enforced project-wide:
 *   1. NO emoji or symbolic characters (âœ?â€?â€?etc.) allowed in UI. Use Lucide icons only.
 *   2. Semantic colors for intent are fixed:
 *        - destructive / delete -> red
 *        - edit / info          -> blue
 *        - success              -> green
 *        - warning              -> orange
 *   3. Inside a button, the icon MUST share the same color as the text (use `currentColor`).
 *
 * Consumers:
 *   - TS code imports from `@guiling/core/tokens`.
 *   - CSS / SCSS reads them via the generated CSS custom properties (see `cssVariables`).
 */

export const palette = {
  // Surface & background
  bgAppBlack: "#000000",
  bgElevated: "#0a0a0b",
  surfaceCard: "rgba(24, 24, 27, 0.72)",
  surfaceCardSoft: "rgba(24, 24, 27, 0.52)",
  surfaceInset: "rgba(10, 10, 11, 0.34)",
  borderCard: "rgba(63, 63, 70, 0.64)",
  borderSubtle: "rgba(39, 39, 42, 0.72)",
  borderFaint: "rgba(24, 24, 27, 1)",

  // Text
  textMain: "#f5f5f5",
  textSoft: "#d4d4d8",
  textMuted: "#a1a1aa",
  textFaint: "#71717a",
  textDisabled: "#52525b",

  // Brand / primary (green)
  brand: "#34d399",
  brandStrong: "#10b981",
  brandDeep: "#047857",
  brandBg: "rgba(6, 95, 70, 0.28)",
  brandBgSoft: "rgba(6, 95, 70, 0.18)",
  brandBorder: "rgba(16, 185, 129, 0.24)",
  brandText: "#d1fae5",

  // Semantic â€?success == brand green intentionally
  success: "#34d399",
  successBg: "rgba(6, 95, 70, 0.28)",
  successBorder: "rgba(16, 185, 129, 0.24)",
  successText: "#d1fae5",

  // Semantic â€?edit / info (blue)
  info: "#60a5fa",
  infoBg: "rgba(30, 58, 138, 0.28)",
  infoBorder: "rgba(96, 165, 250, 0.28)",
  infoText: "#dbeafe",

  // Semantic â€?warning (orange)
  warning: "#fb923c",
  warningBg: "rgba(124, 45, 18, 0.35)",
  warningBorder: "rgba(251, 146, 60, 0.25)",
  warningText: "#fed7aa",

  // Semantic â€?destructive / delete (red)
  danger: "#f87171",
  dangerBg: "rgba(127, 29, 29, 0.28)",
  dangerBorder: "rgba(248, 113, 113, 0.28)",
  dangerText: "#fecaca",
} as const;

export type PaletteKey = keyof typeof palette;

/** Semantic roles â€?always prefer these over raw palette keys in components. */
export const semanticColors = {
  // Button intents
  primary: {
    fg: palette.brandDeep,   // "dark green" on green pill for AA contrast
    bg: palette.brand,
    border: palette.brand,
  },
  ghost: {
    fg: palette.textSoft,
    bg: "rgba(17, 24, 39, 0.22)",
    border: palette.borderCard,
  },
  destructive: {
    fg: palette.dangerText,
    bg: palette.dangerBg,
    border: palette.dangerBorder,
    icon: palette.danger,
  },
  edit: {
    fg: palette.infoText,
    bg: palette.infoBg,
    border: palette.infoBorder,
    icon: palette.info,
  },
  success: {
    fg: palette.successText,
    bg: palette.successBg,
    border: palette.successBorder,
    icon: palette.success,
  },
  warning: {
    fg: palette.warningText,
    bg: palette.warningBg,
    border: palette.warningBorder,
    icon: palette.warning,
  },
} as const;

export const spacing = {
  px: "1px",
  xs: "4px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "24px",
  "2xl": "32px",
  "3xl": "48px",
} as const;

export const radius = {
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "20px",
  "2xl": "24px",
  pill: "999px",
} as const;

export const typography = {
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif',
  sizes: {
    xs: "11px",
    sm: "12px",
    base: "13px",
    md: "14px",
    lg: "16px",
    xl: "20px",
    "2xl": "24px",
    "3xl": "32px",
    "4xl": "44px",
    hero: "56px",
  },
  weights: {
    regular: 400,
    medium: 500,
    semibold: 600,
  },
  lineHeights: {
    tight: 1.2,
    snug: 1.35,
    normal: 1.55,
    relaxed: 1.72,
  },
} as const;

/** Standard icon sizes in pixels. Use these instead of passing arbitrary sizes. */
export const iconSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
} as const;

/** Standard icon stroke width â€?keeps Lucide icons visually consistent. */
export const iconStrokeWidth = 1.75;

/**
 * Flattens tokens into CSS custom properties so SCSS / plain CSS can consume them.
 * Keys use kebab-case and are prefixed with `--si-`.
 */
export function buildCssVariables(): Record<string, string> {
  const out: Record<string, string> = {};

  for (const [key, value] of Object.entries(palette)) {
    out[`--si-color-${kebab(key)}`] = value;
  }
  for (const [key, value] of Object.entries(spacing)) {
    out[`--si-space-${key}`] = value;
  }
  for (const [key, value] of Object.entries(radius)) {
    out[`--si-radius-${key}`] = value;
  }
  for (const [key, value] of Object.entries(typography.sizes)) {
    out[`--si-font-${key}`] = value;
  }
  out["--si-font-family"] = typography.fontFamily;
  for (const [key, value] of Object.entries(typography.weights)) {
    out[`--si-weight-${key}`] = String(value);
  }
  for (const [key, value] of Object.entries(typography.lineHeights)) {
    out[`--si-line-${key}`] = String(value);
  }

  return out;
}

function kebab(input: string): string {
  return input.replace(/[A-Z0-9]/g, (m, i) => (i === 0 ? m.toLowerCase() : `-${m.toLowerCase()}`));
}
