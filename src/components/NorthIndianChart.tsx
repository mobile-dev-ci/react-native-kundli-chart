/**
 * NorthIndianChart — a diamond-style Vedic birth (Lagna) chart.
 *
 * Renders on a fixed 300x300 SVG canvas scaled to `size` via the viewBox, so
 * text and strokes stay crisp and proportional at any size. The chart is
 * "house fixed, sign rotating": the twelve cells never move; the sign in each
 * cell is derived from `ascendantRashi`.
 */

import React, { memo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Svg, { Circle, G, Line, Polygon, Rect, Text as SvgText } from 'react-native-svg';

import { ASC_LABEL_POINT, DIAMOND_POINTS, VIEWBOX } from '../constants/geometry';
import { lightChartTheme, mergeTheme, type ChartTheme, type PartialChartTheme } from '../theme';
import type { HouseNumber, HousePressInfo, PlanetPlacement, RashiNumber } from '../types';
import { useChartLayout } from '../hooks/useChartLayout';
import { houseAtPoint } from '../utils/placement';

export interface NorthIndianChartProps {
  /** Ascendant sign (1 = Aries ... 12 = Pisces). Occupies house 1. */
  ascendantRashi: RashiNumber;
  /** Planets to place. See {@link PlanetPlacement}. */
  planets: PlanetPlacement[];
  /** Rendered edge length in px. Default 300. */
  size?: number;
  /**
   * Theme. Pass a full {@link ChartTheme} or a partial that is merged over the
   * light default. To base a partial on the dark theme, merge it yourself with
   * `mergeTheme(overrides, darkChartTheme)` and pass the result.
   */
  theme?: ChartTheme | PartialChartTheme;
  /** Text of the ascendant marker. Default "Asc". */
  ascLabel?: string;
  /** Show the "Asc" marker at the top of house 1. Default true. */
  showAscLabel?: boolean;
  /** Show the sign number/label in each house. Default true. */
  showRashiNumbers?: boolean;
  /** Show the house number (1-12) in each house. Default false. */
  showHouseNumbers?: boolean;
  /** Customise the per-house sign label (e.g. glyphs or names). Default: number. */
  renderRashiLabel?: (sign: RashiNumber, house: HouseNumber) => string;
  /** Override planet abbreviations, keyed by lowercased planet id. */
  planetAbbreviations?: Partial<Record<string, string>>;
  /** Marker appended to retrograde planets. Default "ᴿ". */
  retrogradeMarker?: string;
  /** Optional per-house background fill (e.g. to highlight a house). */
  houseFill?: (house: HouseNumber) => string | undefined;
  /** Called when a house cell is tapped. Enables transparent hit regions. */
  onPressHouse?: (info: HousePressInfo) => void;
  /** Show an info button (top-right) and call this when tapped. */
  onPressInfo?: () => void;
  /** Accessibility label for the info button. Default "Show chart legend". */
  infoAccessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  /** Accessibility label for the chart image. */
  accessibilityLabel?: string;
}

function NorthIndianChartBase(props: NorthIndianChartProps) {
  const {
    ascendantRashi,
    planets,
    size = 300,
    theme: themeProp,
    ascLabel = 'Asc',
    showAscLabel = true,
    showRashiNumbers = true,
    showHouseNumbers = false,
    renderRashiLabel,
    planetAbbreviations,
    retrogradeMarker,
    houseFill,
    onPressHouse,
    onPressInfo,
    infoAccessibilityLabel = 'Show chart legend',
    style,
    testID,
    accessibilityLabel = 'North Indian birth chart',
  } = props;

  const theme: ChartTheme = isFullTheme(themeProp)
    ? themeProp
    : mergeTheme(themeProp, lightChartTheme);

  const layout = useChartLayout({
    ascendantRashi,
    planets,
    theme,
    planetAbbreviations,
    retrogradeMarker,
    renderRashiLabel,
  });

  const handlePress = useCallback(
    (event: GestureResponderEvent) => {
      if (!onPressHouse) return;
      const ne = event.nativeEvent as {
        locationX?: number;
        locationY?: number;
        offsetX?: number;
        offsetY?: number;
      };
      const lx = ne.locationX ?? ne.offsetX;
      const ly = ne.locationY ?? ne.offsetY;
      if (lx == null || ly == null || size <= 0) return;
      const house = houseAtPoint((lx / size) * VIEWBOX, (ly / size) * VIEWBOX);
      if (house == null) return;
      const rh = layout.houses.find((h) => h.house === house);
      if (!rh) return;
      onPressHouse({ house, sign: rh.sign, planets: rh.placements });
    },
    [onPressHouse, layout.houses, size],
  );

  const c = theme.colors;
  const fontFamily = theme.fontFamily;

  const chart = (
    <Svg width={size} height={size} viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}>
      {/* Frame: rounded border, inner diamond, two diagonals. */}
      <Rect
        x={1}
        y={1}
        width={298}
        height={298}
        rx={2}
        fill="transparent"
        stroke={c.frame}
        strokeWidth={theme.strokeWidth.frame}
        opacity={theme.opacity.frame}
      />
      <Polygon
        points={DIAMOND_POINTS}
        fill="transparent"
        stroke={c.frame}
        strokeWidth={theme.strokeWidth.diamond}
        opacity={theme.opacity.diamond}
      />
      <Line
        x1={0}
        y1={0}
        x2={300}
        y2={300}
        stroke={c.frame}
        strokeWidth={theme.strokeWidth.diagonals}
        opacity={theme.opacity.diagonals}
      />
      <Line
        x1={300}
        y1={0}
        x2={0}
        y2={300}
        stroke={c.frame}
        strokeWidth={theme.strokeWidth.diagonals}
        opacity={theme.opacity.diagonals}
      />

      {layout.houses.map((h) => {
        const fill = houseFill?.(h.house);
        return (
          <G key={h.house}>
            {fill != null ? <Polygon points={h.polygon} fill={fill} /> : null}

            {showHouseNumbers ? (
              <SvgText
                x={h.houseNumber.x}
                y={h.houseNumber.y}
                fontSize={theme.fontSizes.houseNumber}
                fill={c.textSecondary}
                textAnchor={h.houseNumber.anchor}
                fontWeight={theme.fontWeights.houseNumber}
                fontFamily={fontFamily}
                opacity={0.5}
              >
                {String(h.house)}
              </SvgText>
            ) : null}

            {showRashiNumbers ? (
              <SvgText
                x={h.rashi.x}
                y={h.rashi.y}
                fontSize={theme.fontSizes.rashi}
                fill={c.textSecondary}
                textAnchor={h.rashi.anchor}
                fontWeight={theme.fontWeights.rashi}
                fontFamily={fontFamily}
                opacity={theme.opacity.rashi}
              >
                {h.signLabel}
              </SvgText>
            ) : null}

            {h.planets.map((p) => (
              <SvgText
                key={p.key}
                x={p.x}
                y={p.y}
                fontSize={p.fontSize}
                fill={p.color}
                textAnchor="middle"
                fontWeight={theme.fontWeights.planet}
                fontFamily={fontFamily}
              >
                {p.text}
              </SvgText>
            ))}
          </G>
        );
      })}

      {showAscLabel ? (
        <SvgText
          x={ASC_LABEL_POINT.x}
          y={ASC_LABEL_POINT.y}
          fontSize={theme.fontSizes.asc}
          fill={c.accent}
          textAnchor="middle"
          fontWeight={theme.fontWeights.asc}
          fontFamily={fontFamily}
          opacity={theme.opacity.asc}
        >
          {ascLabel}
        </SvgText>
      ) : null}
    </Svg>
  );

  return (
    <View
      style={[styles.container, { width: size, height: size }, style]}
      testID={testID}
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
    >
      {onPressHouse ? (
        <Pressable onPress={handlePress} accessibilityRole="none">
          {chart}
        </Pressable>
      ) : (
        chart
      )}

      {onPressInfo ? (
        <Pressable
          style={styles.infoButton}
          onPress={onPressInfo}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={infoAccessibilityLabel}
        >
          <Svg width={20} height={20} viewBox="0 0 20 20">
            <Circle
              cx={10}
              cy={10}
              r={8.5}
              fill="transparent"
              stroke={c.accent}
              strokeWidth={1.2}
            />
            <SvgText
              x={10}
              y={14}
              fontSize={11}
              fill={c.accent}
              textAnchor="middle"
              fontWeight="700"
              fontFamily={fontFamily}
            >
              i
            </SvgText>
          </Svg>
        </Pressable>
      ) : null}
    </View>
  );
}

/** Type guard: a full ChartTheme has all top-level groups present. */
function isFullTheme(theme: NorthIndianChartProps['theme']): theme is ChartTheme {
  return (
    theme != null &&
    'colors' in theme &&
    'opacity' in theme &&
    'strokeWidth' in theme &&
    'fontSizes' in theme &&
    'lineHeights' in theme &&
    'fontWeights' in theme
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    position: 'relative',
  },
  infoButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    padding: 4,
    zIndex: 10,
  },
});

export const NorthIndianChart = memo(NorthIndianChartBase);
NorthIndianChart.displayName = 'NorthIndianChart';
