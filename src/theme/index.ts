/**
 * Theming for the chart. Everything visual is driven by a {@link ChartTheme},
 * so the component itself carries no hard-coded colours or sizes. Two ready-made
 * themes are provided ({@link lightChartTheme}, {@link darkChartTheme}); merge
 * your own with {@link mergeTheme}.
 */

import type { SvgFontWeight } from '../types';

/** Colours used across the chart. Dignity colours are optional; when omitted,
 *  the corresponding planets fall back to `text`. */
export interface ChartColors {
  /** Frame: outer border, inner diamond and diagonals. */
  frame: string;
  /** Planet glyph colour (default, i.e. no dignity colour applies). */
  text: string;
  /** Sign numbers and house numbers. */
  textSecondary: string;
  /** "Asc" marker. */
  accent: string;
  /** Optional background for containers that render one (modal/sheet). */
  background: string;
  /** Surface colour for the legend sheet / modal cards. */
  surface: string;
  /** Hairline / divider colour. */
  border: string;
  /** Dignity colours (optional). */
  exalted?: string;
  debilitated?: string;
  ownSign?: string;
  combust?: string;
  /** Optional override colour for retrograde planets (marker is always shown). */
  retrograde?: string;
}

export interface ChartOpacity {
  frame: number;
  diamond: number;
  diagonals: number;
  rashi: number;
  asc: number;
}

export interface ChartStrokeWidth {
  frame: number;
  diamond: number;
  diagonals: number;
}

export interface ChartFontSizes {
  /** Sign number / label. */
  rashi: number;
  /** "Asc" marker. */
  asc: number;
  /** Planet glyph when the house has <= 2 planet rows. */
  planet: number;
  /** Planet glyph when the house has > 2 planet rows (denser). */
  planetCompact: number;
  /** House number. */
  houseNumber: number;
}

export interface ChartLineHeights {
  /** Vertical step between planet rows when the house has <= 2 rows. */
  planet: number;
  /** Vertical step between planet rows when the house has > 2 rows. */
  planetCompact: number;
}

export interface ChartFontWeights {
  rashi: SvgFontWeight;
  asc: SvgFontWeight;
  planet: SvgFontWeight;
  houseNumber: SvgFontWeight;
}

/** The complete visual contract for the chart. */
export interface ChartTheme {
  colors: ChartColors;
  opacity: ChartOpacity;
  strokeWidth: ChartStrokeWidth;
  fontSizes: ChartFontSizes;
  lineHeights: ChartLineHeights;
  fontWeights: ChartFontWeights;
  /** Optional font family applied to all SVG text. */
  fontFamily?: string;
}

/** A deeply-partial theme, for overrides. */
export type PartialChartTheme = {
  [K in keyof ChartTheme]?: ChartTheme[K] extends object ? Partial<ChartTheme[K]> : ChartTheme[K];
};

const BASE_OPACITY: ChartOpacity = {
  frame: 0.5,
  diamond: 0.5,
  diagonals: 0.3,
  rashi: 0.8,
  asc: 0.6,
};

const BASE_STROKE: ChartStrokeWidth = {
  frame: 1.5,
  diamond: 1.5,
  diagonals: 0.8,
};

const BASE_FONT_SIZES: ChartFontSizes = {
  rashi: 9,
  asc: 8,
  planet: 10,
  planetCompact: 8,
  houseNumber: 8,
};

const BASE_LINE_HEIGHTS: ChartLineHeights = {
  planet: 11,
  planetCompact: 9,
};

const BASE_FONT_WEIGHTS: ChartFontWeights = {
  rashi: '600',
  asc: '700',
  planet: '700',
  houseNumber: '500',
};

/** Default light theme. */
export const lightChartTheme: ChartTheme = {
  colors: {
    frame: '#6D5AE6',
    text: '#1B1B2F',
    textSecondary: '#6B6B80',
    accent: '#6D5AE6',
    background: '#FFFFFF',
    surface: '#F6F5FB',
    border: '#E4E2F0',
    exalted: '#2E9E6B',
    debilitated: '#D8503C',
    ownSign: '#3B7DD8',
    combust: '#C98A1B',
  },
  opacity: BASE_OPACITY,
  strokeWidth: BASE_STROKE,
  fontSizes: BASE_FONT_SIZES,
  lineHeights: BASE_LINE_HEIGHTS,
  fontWeights: BASE_FONT_WEIGHTS,
};

/** Default dark theme. */
export const darkChartTheme: ChartTheme = {
  colors: {
    frame: '#8B7DF0',
    text: '#ECEBF7',
    textSecondary: '#A6A4C0',
    accent: '#8B7DF0',
    background: '#101018',
    surface: '#1C1B27',
    border: '#2E2C3D',
    exalted: '#49C48C',
    debilitated: '#F0705C',
    ownSign: '#5C9BEA',
    combust: '#E0A63E',
  },
  opacity: BASE_OPACITY,
  strokeWidth: BASE_STROKE,
  fontSizes: BASE_FONT_SIZES,
  lineHeights: BASE_LINE_HEIGHTS,
  fontWeights: BASE_FONT_WEIGHTS,
};

/**
 * Shallow-merge a partial theme over a base (default: light). Each top-level
 * group (colors, opacity, ...) is merged one level deep, which is all the theme
 * structure requires.
 */
export function mergeTheme(
  overrides?: PartialChartTheme,
  base: ChartTheme = lightChartTheme,
): ChartTheme {
  if (!overrides) return base;
  return {
    colors: { ...base.colors, ...overrides.colors },
    opacity: { ...base.opacity, ...overrides.opacity },
    strokeWidth: { ...base.strokeWidth, ...overrides.strokeWidth },
    fontSizes: { ...base.fontSizes, ...overrides.fontSizes },
    lineHeights: { ...base.lineHeights, ...overrides.lineHeights },
    fontWeights: { ...base.fontWeights, ...overrides.fontWeights },
    fontFamily: overrides.fontFamily ?? base.fontFamily,
  };
}
