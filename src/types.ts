/**
 * Core domain types for the North Indian chart.
 *
 * Indexing convention (IMPORTANT):
 * - `RashiNumber` is 1-based: 1 = Aries (Mesha) ... 12 = Pisces (Meena).
 * - `HouseNumber` is 1-based: house 1 is always the top-centre diamond and
 *   always holds the ascendant sign (`ascendantRashi`).
 *
 * The chart is "house fixed, sign rotating": the twelve house cells never move,
 * while the sign shown in each cell is derived from `ascendantRashi`.
 */

/** A zodiac sign, 1 = Aries (Mesha) through 12 = Pisces (Meena). */
export type RashiNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

/** A bhava (house), 1 through 12. House 1 is the ascendant house. */
export type HouseNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

/** The nine classical grahas (navagraha). Custom bodies are allowed as `string`. */
export type PlanetId =
  'sun' | 'moon' | 'mars' | 'mercury' | 'jupiter' | 'venus' | 'saturn' | 'rahu' | 'ketu';

/**
 * A planet's dignity in its current sign. Drives optional colouring.
 * Only a subset is coloured by the default themes (exalted / debilitated /
 * ownSign / combust); the rest fall back to the default text colour.
 */
export type Dignity =
  | 'exalted'
  | 'debilitated'
  | 'ownSign'
  | 'moolatrikona'
  | 'friendly'
  | 'neutral'
  | 'enemy'
  | 'combust';

/** SVG text-anchor values. */
export type SvgTextAnchor = 'start' | 'middle' | 'end';

/** SVG font-weight values accepted by react-native-svg. */
export type SvgFontWeight =
  'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';

/** A point in the fixed 300x300 chart coordinate space. */
export interface Point {
  readonly x: number;
  readonly y: number;
}

/**
 * A single planet placed in the chart.
 * `id` may be one of the {@link PlanetId} values or any custom string
 * (e.g. `'uranus'`, `'gulika'`); custom ids fall back to a two-letter label.
 */
export interface PlanetPlacement {
  /** Planet identifier. Matched case-insensitively against label maps. */
  id: PlanetId | (string & {});
  /** Sign the planet occupies, 1 = Aries ... 12 = Pisces. */
  rashi: RashiNumber;
  /** Whether the planet is retrograde (renders a superscript marker). */
  isRetrograde?: boolean;
  /** Optional dignity, used for colouring when the theme defines a colour. */
  dignity?: Dignity;
  /** Optional longitude within the sign (0-30). Unused by rendering; handy for tooltips. */
  degree?: number;
  /** Explicit label override; wins over every abbreviation lookup. */
  label?: string;
}

/** Payload passed to {@link NorthIndianChartProps.onPressHouse}. */
export interface HousePressInfo {
  house: HouseNumber;
  /** Sign occupying the house for the current ascendant. */
  sign: RashiNumber;
  /** Planets currently in the house (input order preserved). */
  planets: PlanetPlacement[];
}
