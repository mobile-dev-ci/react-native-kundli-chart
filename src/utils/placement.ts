/**
 * Pure placement logic for the North Indian chart.
 *
 * These functions contain the entire "house fixed, sign rotating" model and no
 * rendering concerns, so they are trivially unit-testable.
 */

import { PLANET_ABBREVIATIONS } from '../constants/astrology';
import { ALL_HOUSES, HOUSE_POLYGONS, KENDRA_HOUSES } from '../constants/geometry';
import type { Dignity, HouseNumber, PlanetId, PlanetPlacement, RashiNumber } from '../types';
import type { ChartTheme } from '../theme';

/** Wrap any integer into the 1..12 range. */
function wrap12(value: number): RashiNumber {
  return (((((value - 1) % 12) + 12) % 12) + 1) as RashiNumber;
}

/**
 * The sign occupying a given house for a given ascendant.
 * House 1 always holds `ascendantRashi`; each subsequent house advances by one
 * sign. Example: ascendant Leo (5) => house 1 = Leo, house 2 = Virgo, ...
 */
export function signInHouse(ascendantRashi: RashiNumber, house: HouseNumber): RashiNumber {
  return wrap12(ascendantRashi + (house - 1));
}

/**
 * The house a planet falls into, given the ascendant.
 * A planet in the ascendant sign is in house 1.
 */
export function houseOfPlanet(planetRashi: RashiNumber, ascendantRashi: RashiNumber): HouseNumber {
  return (((((planetRashi - ascendantRashi) % 12) + 12) % 12) + 1) as HouseNumber;
}

/** Kendra (angular) houses fit three planets per row; others fit two. */
export function planetsPerRow(house: HouseNumber): number {
  return KENDRA_HOUSES.includes(house) ? 3 : 2;
}

/** Split an array into fixed-size chunks (last chunk may be shorter). */
export function chunk<T>(items: readonly T[], size: number): T[][] {
  if (size <= 0) return [items.slice()];
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

/** Group placements by their house for a given ascendant, preserving order. */
export function groupPlanetsByHouse(
  planets: readonly PlanetPlacement[],
  ascendantRashi: RashiNumber,
): Record<HouseNumber, PlanetPlacement[]> {
  const out = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
    7: [],
    8: [],
    9: [],
    10: [],
    11: [],
    12: [],
  } as Record<HouseNumber, PlanetPlacement[]>;
  for (const p of planets) {
    out[houseOfPlanet(p.rashi, ascendantRashi)].push(p);
  }
  return out;
}

function capitalize(value: string): string {
  return value.length === 0 ? value : value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Resolve the short label for a planet.
 * Priority: explicit `label` on the placement -> caller-supplied abbreviation
 * map -> built-in navagraha map -> capitalised first two characters of the id.
 */
export function resolvePlanetAbbreviation(
  placement: PlanetPlacement,
  abbreviations?: Partial<Record<string, string>>,
): string {
  if (placement.label != null && placement.label !== '') return placement.label;
  const key = String(placement.id).toLowerCase();
  const override = abbreviations?.[key];
  if (override != null && override !== '') return override;
  const builtin = (PLANET_ABBREVIATIONS as Record<string, string>)[key as PlanetId];
  if (builtin != null) return builtin;
  return capitalize(key.slice(0, 2));
}

/** Colour for a planet glyph given its dignity/retrograde state and the theme. */
export function planetColor(placement: PlanetPlacement, theme: ChartTheme): string {
  const c = theme.colors;
  const dignity: Dignity | undefined = placement.dignity;
  switch (dignity) {
    case 'exalted':
      if (c.exalted) return c.exalted;
      break;
    case 'debilitated':
      if (c.debilitated) return c.debilitated;
      break;
    case 'ownSign':
    case 'moolatrikona':
      if (c.ownSign) return c.ownSign;
      break;
    case 'combust':
      if (c.combust) return c.combust;
      break;
    default:
      break;
  }
  if (placement.isRetrograde && c.retrograde) return c.retrograde;
  return c.text;
}

/** Parse an SVG `points` string ("x,y x,y ...") into an array of [x, y] pairs. */
export function parsePolygonPoints(points: string): Array<[number, number]> {
  return points
    .trim()
    .split(/\s+/)
    .map((pair) => {
      const [x, y] = pair.split(',');
      return [Number(x), Number(y)] as [number, number];
    });
}

/** Precomputed, parsed house outlines, so hit-testing never re-parses strings. */
const PARSED_HOUSE_POLYGONS: Record<HouseNumber, Array<[number, number]>> = (() => {
  const out = {} as Record<HouseNumber, Array<[number, number]>>;
  for (const h of ALL_HOUSES) out[h] = parsePolygonPoints(HOUSE_POLYGONS[h]);
  return out;
})();

/** Ray-casting point-in-polygon test. */
export function pointInPolygon(
  x: number,
  y: number,
  polygon: ReadonlyArray<[number, number]>,
): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const pi = polygon[i];
    const pj = polygon[j];
    if (!pi || !pj) continue;
    const [xi, yi] = pi;
    const [xj, yj] = pj;
    const intersects = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

/**
 * Which house contains a point given in the fixed 300x300 chart space.
 * Returns null if the point falls outside every cell. Cross-platform — used for
 * tap handling instead of per-shape SVG press (which react-native-svg does not
 * support uniformly on web).
 */
export function houseAtPoint(x: number, y: number): HouseNumber | null {
  for (const h of ALL_HOUSES) {
    if (pointInPolygon(x, y, PARSED_HOUSE_POLYGONS[h])) return h;
  }
  return null;
}
