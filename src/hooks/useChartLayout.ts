/**
 * Computes the fully-positioned render model for the chart. All maths happens
 * here (memoised); the component is a thin mapping from this model to SVG nodes.
 */

import { useMemo } from 'react';

import {
  ALL_HOUSES,
  HOUSE_LAYOUT,
  HOUSE_POLYGONS,
  PLANET_ROW_NUDGE,
  PLANET_SPACING,
} from '../constants/geometry';
import { RETROGRADE_MARKER } from '../constants/astrology';
import type { ChartTheme } from '../theme';
import type { Dignity, HouseNumber, PlanetPlacement, RashiNumber, SvgTextAnchor } from '../types';
import {
  chunk,
  groupPlanetsByHouse,
  planetColor,
  planetsPerRow,
  resolvePlanetAbbreviation,
  signInHouse,
} from '../utils/placement';

/** A single planet glyph resolved to an absolute position in 300-space. */
export interface RenderedPlanet {
  key: string;
  id: string;
  /** Rendered text, including any retrograde marker. */
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  dignity?: Dignity;
  isRetrograde: boolean;
  source: PlanetPlacement;
}

/** Everything needed to render one house cell. */
export interface RenderedHouse {
  house: HouseNumber;
  sign: RashiNumber;
  signLabel: string;
  rashi: { x: number; y: number; anchor: SvgTextAnchor };
  houseNumber: { x: number; y: number; anchor: SvgTextAnchor };
  /** SVG points string outlining the house cell (for hit-testing / shading). */
  polygon: string;
  planets: RenderedPlanet[];
  /** Raw placements in this house (input order), for press callbacks. */
  placements: PlanetPlacement[];
}

export interface ChartLayout {
  houses: RenderedHouse[];
}

export interface UseChartLayoutArgs {
  ascendantRashi: RashiNumber;
  planets: readonly PlanetPlacement[];
  theme: ChartTheme;
  planetAbbreviations?: Partial<Record<string, string>>;
  retrogradeMarker?: string;
  /** Render the sign label for a house. Defaults to the numeric sign (1-12). */
  renderRashiLabel?: (sign: RashiNumber, house: HouseNumber) => string;
}

/**
 * Lay out a single house's planet block: chunk into rows, pick font size / line
 * height by density, then centre each row horizontally and the block vertically.
 */
function layoutHousePlanets(
  house: HouseNumber,
  placements: PlanetPlacement[],
  theme: ChartTheme,
  planetAbbreviations: Partial<Record<string, string>> | undefined,
  retrogradeMarker: string,
): RenderedPlanet[] {
  if (placements.length === 0) return [];

  const anchor = HOUSE_LAYOUT[house].planets;
  const perRow = planetsPerRow(house);
  const rows = chunk(placements, perRow);
  const compact = rows.length > 2;

  const fontSize = compact ? theme.fontSizes.planetCompact : theme.fontSizes.planet;
  const rowStep = compact ? theme.lineHeights.planetCompact : theme.lineHeights.planet;

  const baseY = anchor.y - ((rows.length - 1) * rowStep) / 2 + fontSize * PLANET_ROW_NUDGE;

  const out: RenderedPlanet[] = [];
  rows.forEach((row, rowIndex) => {
    const y = baseY + rowIndex * rowStep;
    const rowStartX = anchor.x - ((row.length - 1) * PLANET_SPACING) / 2;
    row.forEach((placement, colIndex) => {
      const abbr = resolvePlanetAbbreviation(placement, planetAbbreviations);
      const isRetrograde = placement.isRetrograde === true;
      const text = isRetrograde ? abbr + retrogradeMarker : abbr;
      out.push({
        key: `${house}-${placement.id}-${rowIndex}-${colIndex}`,
        id: String(placement.id),
        text,
        x: rowStartX + colIndex * PLANET_SPACING,
        y,
        fontSize,
        color: planetColor(placement, theme),
        dignity: placement.dignity,
        isRetrograde,
        source: placement,
      });
    });
  });
  return out;
}

/** Build the memoised render model for the whole chart. */
export function useChartLayout(args: UseChartLayoutArgs): ChartLayout {
  const {
    ascendantRashi,
    planets,
    theme,
    planetAbbreviations,
    retrogradeMarker = RETROGRADE_MARKER,
    renderRashiLabel,
  } = args;

  return useMemo<ChartLayout>(() => {
    const grouped = groupPlanetsByHouse(planets, ascendantRashi);

    const houses = ALL_HOUSES.map((house): RenderedHouse => {
      const layout = HOUSE_LAYOUT[house];
      const sign = signInHouse(ascendantRashi, house);
      const signLabel = renderRashiLabel ? renderRashiLabel(sign, house) : String(sign);
      const placements = grouped[house];
      return {
        house,
        sign,
        signLabel,
        rashi: { x: layout.rashi.x, y: layout.rashi.y, anchor: layout.rashiAnchor },
        houseNumber: { x: layout.houseNum.x, y: layout.houseNum.y, anchor: layout.numAnchor },
        polygon: HOUSE_POLYGONS[house],
        placements,
        planets: layoutHousePlanets(
          house,
          placements,
          theme,
          planetAbbreviations,
          retrogradeMarker,
        ),
      };
    });

    return { houses };
  }, [ascendantRashi, planets, theme, planetAbbreviations, retrogradeMarker, renderRashiLabel]);
}
