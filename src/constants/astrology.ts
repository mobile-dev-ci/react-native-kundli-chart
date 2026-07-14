/**
 * Astrological reference data: sign names, sign lords, planet names and default
 * two-letter abbreviations. All of this is overridable at the component level
 * for localisation, so treat these as English defaults only.
 */

import type { PlanetId, RashiNumber } from '../types';

/** Default two-letter planet abbreviations rendered inside house cells. */
export const PLANET_ABBREVIATIONS: Readonly<Record<PlanetId, string>> = {
  sun: 'Su',
  moon: 'Mo',
  mars: 'Ma',
  mercury: 'Me',
  jupiter: 'Ju',
  venus: 'Ve',
  saturn: 'Sa',
  rahu: 'Ra',
  ketu: 'Ke',
};

/** Full English planet names. */
export const PLANET_NAMES: Readonly<Record<PlanetId, string>> = {
  sun: 'Sun',
  moon: 'Moon',
  mars: 'Mars',
  mercury: 'Mercury',
  jupiter: 'Jupiter',
  venus: 'Venus',
  saturn: 'Saturn',
  rahu: 'Rahu',
  ketu: 'Ketu',
};

/** Sanskrit planet names. */
export const PLANET_NAMES_SANSKRIT: Readonly<Record<PlanetId, string>> = {
  sun: 'Surya',
  moon: 'Chandra',
  mars: 'Mangala',
  mercury: 'Budha',
  jupiter: 'Guru',
  venus: 'Shukra',
  saturn: 'Shani',
  rahu: 'Rahu',
  ketu: 'Ketu',
};

/** Canonical navagraha ordering, useful for stable legends / sorting. */
export const PLANET_ORDER: readonly PlanetId[] = [
  'sun',
  'moon',
  'mars',
  'mercury',
  'jupiter',
  'venus',
  'saturn',
  'rahu',
  'ketu',
];

/** English zodiac sign names, keyed by 1-based sign number. */
export const RASHI_NAMES: Readonly<Record<RashiNumber, string>> = {
  1: 'Aries',
  2: 'Taurus',
  3: 'Gemini',
  4: 'Cancer',
  5: 'Leo',
  6: 'Virgo',
  7: 'Libra',
  8: 'Scorpio',
  9: 'Sagittarius',
  10: 'Capricorn',
  11: 'Aquarius',
  12: 'Pisces',
};

/** Sanskrit zodiac sign names, keyed by 1-based sign number. */
export const RASHI_NAMES_SANSKRIT: Readonly<Record<RashiNumber, string>> = {
  1: 'Mesha',
  2: 'Vrishabha',
  3: 'Mithuna',
  4: 'Karka',
  5: 'Simha',
  6: 'Kanya',
  7: 'Tula',
  8: 'Vrishchika',
  9: 'Dhanu',
  10: 'Makara',
  11: 'Kumbha',
  12: 'Meena',
};

/** Unicode zodiac glyphs, keyed by 1-based sign number. */
export const RASHI_GLYPHS: Readonly<Record<RashiNumber, string>> = {
  1: '♈',
  2: '♉',
  3: '♊',
  4: '♋',
  5: '♌',
  6: '♍',
  7: '♎',
  8: '♏',
  9: '♐',
  10: '♑',
  11: '♒',
  12: '♓',
};

/** Ruling planet (lord) of each sign, keyed by 1-based sign number. */
export const RASHI_LORDS: Readonly<Record<RashiNumber, PlanetId>> = {
  1: 'mars',
  2: 'venus',
  3: 'mercury',
  4: 'moon',
  5: 'sun',
  6: 'mercury',
  7: 'venus',
  8: 'mars',
  9: 'jupiter',
  10: 'saturn',
  11: 'saturn',
  12: 'jupiter',
};

/** Default superscript marker appended to retrograde planets. */
export const RETROGRADE_MARKER = 'ᴿ';
