/**
 * Geometry of the North Indian chart.
 *
 * The chart is authored in a fixed 300x300 coordinate space and scaled to the
 * requested `size` purely through the SVG `viewBox`. Every coordinate below is
 * in that 300x300 space; nothing here depends on the rendered pixel size.
 *
 * See `docs/GEOMETRY.md` for the full derivation of these numbers.
 */

import type { HouseNumber, Point, SvgTextAnchor } from '../types';

/** The side length of the authoring coordinate space. */
export const VIEWBOX = 300;

/** Points for the inner diamond (connects the midpoints of the four sides). */
export const DIAMOND_POINTS = '150,0 300,150 150,300 0,150';

/** The four kendra (angular) houses. They occupy the large central diamonds
 *  and therefore fit three planets per row instead of two. */
export const KENDRA_HOUSES: readonly HouseNumber[] = [1, 4, 7, 10];

/** Horizontal gap between two planet glyphs on the same row (300-space units). */
export const PLANET_SPACING = 16;

/** Small optical downward nudge applied to a house's planet block, expressed
 *  as a fraction of the planet font size. */
export const PLANET_ROW_NUDGE = 0.35;

/** Label placement inside a single house cell. */
export interface HouseLayout {
  /** Anchor point for the sign number / label. */
  readonly rashi: Point;
  readonly rashiAnchor: SvgTextAnchor;
  /** Centre point around which the planet block is laid out. */
  readonly planets: Point;
  readonly planetAnchor: SvgTextAnchor;
  /** Anchor point for the (optional) house number. */
  readonly houseNum: Point;
  readonly numAnchor: SvgTextAnchor;
}

/**
 * Per-house label anchor points, keyed by 1-based house number.
 *
 * Each house stores three anchors: the sign label, the planet block centre,
 * and the house number. Text anchors (`start`/`middle`/`end`) keep labels
 * from spilling out of the narrow corner cells.
 */
// prettier-ignore
export const HOUSE_LAYOUT: Readonly<Record<HouseNumber, HouseLayout>> = {
  1: { rashi: { x: 150, y: 18 }, rashiAnchor: 'middle', planets: { x: 150, y: 70 }, planetAnchor: 'middle', houseNum: { x: 150, y: 135 }, numAnchor: 'middle' },
  2: { rashi: { x: 40, y: 18 }, rashiAnchor: 'middle', planets: { x: 75, y: 35 }, planetAnchor: 'middle', houseNum: { x: 75, y: 65 }, numAnchor: 'middle' },
  3: { rashi: { x: 15, y: 45 }, rashiAnchor: 'start', planets: { x: 30, y: 75 }, planetAnchor: 'start', houseNum: { x: 65, y: 78 }, numAnchor: 'end' },
  4: { rashi: { x: 15, y: 150 }, rashiAnchor: 'start', planets: { x: 75, y: 150 }, planetAnchor: 'middle', houseNum: { x: 130, y: 153 }, numAnchor: 'end' },
  5: { rashi: { x: 15, y: 265 }, rashiAnchor: 'start', planets: { x: 30, y: 225 }, planetAnchor: 'start', houseNum: { x: 65, y: 228 }, numAnchor: 'end' },
  6: { rashi: { x: 40, y: 290 }, rashiAnchor: 'middle', planets: { x: 75, y: 265 }, planetAnchor: 'middle', houseNum: { x: 75, y: 242 }, numAnchor: 'middle' },
  7: { rashi: { x: 150, y: 290 }, rashiAnchor: 'middle', planets: { x: 150, y: 230 }, planetAnchor: 'middle', houseNum: { x: 150, y: 172 }, numAnchor: 'middle' },
  8: { rashi: { x: 260, y: 290 }, rashiAnchor: 'middle', planets: { x: 225, y: 265 }, planetAnchor: 'middle', houseNum: { x: 225, y: 242 }, numAnchor: 'middle' },
  9: { rashi: { x: 285, y: 265 }, rashiAnchor: 'end', planets: { x: 270, y: 225 }, planetAnchor: 'end', houseNum: { x: 235, y: 228 }, numAnchor: 'start' },
  10: { rashi: { x: 285, y: 150 }, rashiAnchor: 'end', planets: { x: 225, y: 150 }, planetAnchor: 'middle', houseNum: { x: 170, y: 153 }, numAnchor: 'start' },
  11: { rashi: { x: 285, y: 45 }, rashiAnchor: 'end', planets: { x: 270, y: 75 }, planetAnchor: 'end', houseNum: { x: 235, y: 78 }, numAnchor: 'start' },
  12: { rashi: { x: 260, y: 18 }, rashiAnchor: 'middle', planets: { x: 225, y: 35 }, planetAnchor: 'middle', houseNum: { x: 225, y: 65 }, numAnchor: 'middle' },
};

/**
 * Exact polygon outline of each house cell, as an SVG `points` string.
 *
 * Used for hit-testing (`onPressHouse`) and optional per-house shading.
 * Derived from the frame geometry: square corners, the four side-midpoints
 * (diamond vertices), the centre, and the four points where the diagonals
 * cross the diamond edges (75,75 / 225,75 / 225,225 / 75,225).
 */
export const HOUSE_POLYGONS: Readonly<Record<HouseNumber, string>> = {
  1: '150,0 225,75 150,150 75,75',
  2: '0,0 150,0 75,75',
  3: '0,0 75,75 0,150',
  4: '0,150 75,75 150,150 75,225',
  5: '0,300 0,150 75,225',
  6: '0,300 75,225 150,300',
  7: '150,300 75,225 150,150 225,225',
  8: '300,300 225,225 150,300',
  9: '300,300 300,150 225,225',
  10: '300,150 225,75 150,150 225,225',
  11: '300,0 225,75 300,150',
  12: '300,0 150,0 225,75',
};

/** All house numbers in order, as a convenience for iteration. */
export const ALL_HOUSES: readonly HouseNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

/** Anchor point of the "Asc" marker (top-centre of house 1). */
export const ASC_LABEL_POINT: Point = { x: 150, y: 32 };
