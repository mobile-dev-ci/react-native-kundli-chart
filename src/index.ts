/**
 * react-native-north-indian-chart
 *
 * Public API. Import components, hooks, pure helpers, theming, constants and
 * types from here.
 */

// Components
export { NorthIndianChart } from './components/NorthIndianChart';
export type { NorthIndianChartProps } from './components/NorthIndianChart';

export { ChartLegendBottomSheet } from './components/ChartLegendBottomSheet';
export type {
  ChartLegendBottomSheetProps,
  DignityLegendItem,
} from './components/ChartLegendBottomSheet';

export { FullscreenChartModal } from './components/FullscreenChartModal';
export type { FullscreenChartModalProps } from './components/FullscreenChartModal';

export { BottomSheet } from './components/BottomSheet';
export type { BottomSheetProps } from './components/BottomSheet';

// Hook + render model
export { buildChartLayout, useChartLayout } from './hooks/useChartLayout';
export type {
  ChartLayout,
  RenderedHouse,
  RenderedPlanet,
  UseChartLayoutArgs,
} from './hooks/useChartLayout';

// Pure placement helpers
export {
  chunk,
  groupPlanetsByHouse,
  houseAtPoint,
  houseOfPlanet,
  parsePolygonPoints,
  planetColor,
  planetsPerRow,
  pointInPolygon,
  resolvePlanetAbbreviation,
  signInHouse,
} from './utils/placement';

// Theme
export { darkChartTheme, lightChartTheme, mergeTheme } from './theme';
export type {
  ChartColors,
  ChartFontSizes,
  ChartFontWeights,
  ChartLineHeights,
  ChartOpacity,
  ChartStrokeWidth,
  ChartTheme,
  PartialChartTheme,
} from './theme';

// Constants / reference data
export {
  ALL_HOUSES,
  ASC_LABEL_POINT,
  DIAMOND_POINTS,
  HOUSE_LAYOUT,
  HOUSE_POLYGONS,
  KENDRA_HOUSES,
  PLANET_ROW_NUDGE,
  PLANET_SPACING,
  VIEWBOX,
} from './constants/geometry';
export type { HouseLayout } from './constants/geometry';
export {
  PLANET_ABBREVIATIONS,
  PLANET_NAMES,
  PLANET_NAMES_SANSKRIT,
  PLANET_ORDER,
  RASHI_GLYPHS,
  RASHI_LORDS,
  RASHI_NAMES,
  RASHI_NAMES_SANSKRIT,
  RETROGRADE_MARKER,
} from './constants/astrology';

// Types
export type {
  Dignity,
  HouseNumber,
  HousePressInfo,
  PlanetId,
  PlanetPlacement,
  Point,
  RashiNumber,
  SvgFontWeight,
  SvgTextAnchor,
} from './types';
