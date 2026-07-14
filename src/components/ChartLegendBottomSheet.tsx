/**
 * ChartLegendBottomSheet — explains the glyphs used by {@link NorthIndianChart}:
 * planet abbreviations, sign numbers, and (optionally) dignity colours.
 *
 * Renders inside the bundled {@link BottomSheet}. Everything is themeable and
 * localisable; nothing here is hard-coded to a language.
 */

import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  PLANET_ABBREVIATIONS,
  PLANET_NAMES,
  PLANET_ORDER,
  RASHI_LORDS,
  RASHI_NAMES,
} from '../constants/astrology';
import { lightChartTheme, mergeTheme, type ChartTheme, type PartialChartTheme } from '../theme';
import type { Dignity, PlanetId, RashiNumber } from '../types';
import { BottomSheet } from './BottomSheet';

export interface DignityLegendItem {
  dignity: Dignity;
  label: string;
  color: string;
}

export interface ChartLegendBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  theme?: ChartTheme | PartialChartTheme;
  /** Sheet title. Default "Chart legend". */
  title?: string;
  /** Section headings. */
  planetsHeading?: string;
  signsHeading?: string;
  dignityHeading?: string;
  /** Override planet abbreviations, keyed by lowercased id. */
  planetAbbreviations?: Partial<Record<string, string>>;
  /** Override full planet names, keyed by lowercased id. */
  planetNames?: Partial<Record<string, string>>;
  /** Which planets to list, in order. Default: the nine navagraha. */
  planets?: PlanetId[];
  /** Override sign names, keyed by 1-based sign number. */
  rashiNames?: Partial<Record<RashiNumber, string>>;
  /** Show each sign's ruling planet. Default true. */
  showSignLords?: boolean;
  /**
   * Dignity legend rows. Pass `false` to hide. When omitted, a default legend is
   * built from whichever dignity colours the theme defines.
   */
  dignityLegend?: DignityLegendItem[] | false;
  testID?: string;
}

const DEFAULT_DIGNITY_LABELS: Record<'exalted' | 'debilitated' | 'ownSign' | 'combust', string> = {
  exalted: 'Exalted',
  debilitated: 'Debilitated',
  ownSign: 'Own sign',
  combust: 'Combust',
};

function buildDefaultDignityLegend(theme: ChartTheme): DignityLegendItem[] {
  const c = theme.colors;
  const items: DignityLegendItem[] = [];
  if (c.exalted)
    items.push({ dignity: 'exalted', label: DEFAULT_DIGNITY_LABELS.exalted, color: c.exalted });
  if (c.debilitated)
    items.push({
      dignity: 'debilitated',
      label: DEFAULT_DIGNITY_LABELS.debilitated,
      color: c.debilitated,
    });
  if (c.ownSign)
    items.push({ dignity: 'ownSign', label: DEFAULT_DIGNITY_LABELS.ownSign, color: c.ownSign });
  if (c.combust)
    items.push({ dignity: 'combust', label: DEFAULT_DIGNITY_LABELS.combust, color: c.combust });
  return items;
}

const ALL_SIGNS: RashiNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export function ChartLegendBottomSheet(props: ChartLegendBottomSheetProps) {
  const {
    visible,
    onClose,
    theme: themeProp,
    title = 'Chart legend',
    planetsHeading = 'Planets',
    signsHeading = 'Signs',
    dignityHeading = 'Dignity',
    planetAbbreviations,
    planetNames,
    planets = PLANET_ORDER as PlanetId[],
    rashiNames,
    showSignLords = true,
    dignityLegend,
    testID,
  } = props;

  const theme = isFullTheme(themeProp) ? themeProp : mergeTheme(themeProp, lightChartTheme);
  const c = theme.colors;

  const dignityItems = useMemo<DignityLegendItem[]>(() => {
    if (dignityLegend === false) return [];
    if (Array.isArray(dignityLegend)) return dignityLegend;
    return buildDefaultDignityLegend(theme);
  }, [dignityLegend, theme]);

  const abbr = (id: PlanetId) =>
    planetAbbreviations?.[id] ?? PLANET_ABBREVIATIONS[id] ?? id.slice(0, 2);
  const name = (id: PlanetId) => planetNames?.[id] ?? PLANET_NAMES[id] ?? id;
  const signName = (n: RashiNumber) => rashiNames?.[n] ?? RASHI_NAMES[n];

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      backgroundColor={c.background}
      handleColor={c.border}
      testID={testID}
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: c.text }]}>{title}</Text>

        <Text style={[styles.heading, { color: c.textSecondary }]}>{planetsHeading}</Text>
        <View style={styles.grid}>
          {planets.map((id) => (
            <View
              key={id}
              style={[styles.pill, { backgroundColor: c.surface, borderColor: c.border }]}
            >
              <Text style={[styles.pillGlyph, { color: c.text }]}>{abbr(id)}</Text>
              <Text style={[styles.pillLabel, { color: c.textSecondary }]}>{name(id)}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.heading, { color: c.textSecondary }]}>{signsHeading}</Text>
        <View style={styles.grid}>
          {ALL_SIGNS.map((n) => (
            <View
              key={n}
              style={[styles.pill, { backgroundColor: c.surface, borderColor: c.border }]}
            >
              <Text style={[styles.pillGlyph, { color: c.text }]}>{n}</Text>
              <Text style={[styles.pillLabel, { color: c.textSecondary }]} numberOfLines={1}>
                {signName(n)}
                {showSignLords ? ` · ${PLANET_NAMES[RASHI_LORDS[n]]}` : ''}
              </Text>
            </View>
          ))}
        </View>

        {dignityItems.length > 0 ? (
          <>
            <Text style={[styles.heading, { color: c.textSecondary }]}>{dignityHeading}</Text>
            <View style={styles.dignityWrap}>
              {dignityItems.map((item) => (
                <View key={item.dignity} style={styles.dignityRow}>
                  <View style={[styles.swatch, { backgroundColor: item.color }]} />
                  <Text style={[styles.dignityLabel, { color: c.text }]}>{item.label}</Text>
                </View>
              ))}
            </View>
          </>
        ) : null}
      </ScrollView>
    </BottomSheet>
  );
}

function isFullTheme(theme: ChartLegendBottomSheetProps['theme']): theme is ChartTheme {
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
  content: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  heading: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 6,
  },
  pillGlyph: {
    fontSize: 14,
    fontWeight: '700',
    minWidth: 20,
    textAlign: 'center',
  },
  pillLabel: {
    fontSize: 13,
  },
  dignityWrap: {
    gap: 10,
  },
  dignityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  swatch: {
    width: 14,
    height: 14,
    borderRadius: 4,
  },
  dignityLabel: {
    fontSize: 14,
  },
});
