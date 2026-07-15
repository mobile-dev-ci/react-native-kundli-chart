/**
 * Interactive showcase for react-native-kundli-chart.
 *
 * Runs on iOS, Android and web (Expo). It consumes the library straight from
 * `../src`, so editing the library hot-reloads here.
 */

import React, { useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

import {
  ChartLegendBottomSheet,
  FullscreenChartModal,
  NorthIndianChart,
  RASHI_GLYPHS,
  RASHI_NAMES,
  darkChartTheme,
  lightChartTheme,
  type HouseNumber,
  type HousePressInfo,
  type PlanetPlacement,
  type RashiNumber,
} from '../src';

const ASCENDANT: RashiNumber = 5; // Leo

const PLANETS: PlanetPlacement[] = [
  { id: 'sun', rashi: 5, dignity: 'ownSign', degree: 12.4 },
  { id: 'moon', rashi: 2, dignity: 'exalted', degree: 3.1 },
  { id: 'mars', rashi: 10, dignity: 'exalted', degree: 27.8 },
  { id: 'mercury', rashi: 6, dignity: 'ownSign', degree: 18.0 },
  { id: 'jupiter', rashi: 10, dignity: 'debilitated', degree: 5.5 },
  { id: 'venus', rashi: 6, dignity: 'debilitated', isRetrograde: true, degree: 21.9 },
  { id: 'saturn', rashi: 1, isRetrograde: true, degree: 9.2 },
  { id: 'rahu', rashi: 11, degree: 14.7 },
  { id: 'ketu', rashi: 5, dignity: 'combust', degree: 14.7 },
];

export default function App() {
  const scheme = useColorScheme();
  const [forcedDark, setForcedDark] = useState<boolean | null>(null);
  const isDark = forcedDark ?? scheme === 'dark';
  const theme = isDark ? darkChartTheme : lightChartTheme;

  const [useGlyphs, setUseGlyphs] = useState(true);
  const [selectedHouse, setSelectedHouse] = useState<HouseNumber | null>(null);
  const [selectedInfo, setSelectedInfo] = useState<HousePressInfo | null>(null);
  const [legendOpen, setLegendOpen] = useState(false);
  const [fullOpen, setFullOpen] = useState(false);

  const c = theme.colors;

  const renderRashiLabel = useMemo(
    () => (useGlyphs ? (sign: RashiNumber) => RASHI_GLYPHS[sign] : undefined),
    [useGlyphs],
  );

  const handleHousePress = (info: HousePressInfo) => {
    setSelectedHouse(info.house);
    setSelectedInfo(info);
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.h1, { color: c.text }]}>North Indian chart</Text>
        <Text style={[styles.sub, { color: c.textSecondary }]}>
          Ascendant: {RASHI_NAMES[ASCENDANT]} · tap a house
        </Text>

        <View style={styles.toolbar}>
          <Toggle
            label={isDark ? 'Dark' : 'Light'}
            active={isDark}
            theme={theme}
            onPress={() => setForcedDark(!isDark)}
          />
          <Toggle
            label={useGlyphs ? 'Glyphs' : 'Numbers'}
            active={useGlyphs}
            theme={theme}
            onPress={() => setUseGlyphs((v) => !v)}
          />
        </View>

        <View style={styles.chartWrap}>
          <NorthIndianChart
            ascendantRashi={ASCENDANT}
            planets={PLANETS}
            size={330}
            theme={theme}
            renderRashiLabel={renderRashiLabel}
            onPressInfo={() => setLegendOpen(true)}
            onPressHouse={handleHousePress}
            houseFill={(house) => (house === selectedHouse ? withAlpha(c.accent, 0.12) : undefined)}
          />
        </View>

        <SelectionCard info={selectedInfo} theme={theme} />

        <View style={styles.buttonRow}>
          <Button label="Open legend" theme={theme} onPress={() => setLegendOpen(true)} />
          <Button label="Fullscreen" theme={theme} primary onPress={() => setFullOpen(true)} />
        </View>

        <Text style={[styles.caption, { color: c.textSecondary }]}>Small sizes stay crisp:</Text>
        <View style={styles.thumbRow}>
          {[80, 120, 160].map((s) => (
            <NorthIndianChart
              key={s}
              ascendantRashi={ASCENDANT}
              planets={PLANETS}
              size={s}
              theme={theme}
              showAscLabel={s >= 120}
            />
          ))}
        </View>
      </ScrollView>

      <ChartLegendBottomSheet
        visible={legendOpen}
        onClose={() => setLegendOpen(false)}
        theme={theme}
      />

      <FullscreenChartModal
        visible={fullOpen}
        onClose={() => setFullOpen(false)}
        theme={theme}
        title="Sample Kundli"
        subtitle={`Ascendant: ${RASHI_NAMES[ASCENDANT]}`}
        chartProps={{
          ascendantRashi: ASCENDANT,
          planets: PLANETS,
          renderRashiLabel,
        }}
      />
    </SafeAreaView>
  );
}

function SelectionCard({
  info,
  theme,
}: {
  info: HousePressInfo | null;
  theme: typeof lightChartTheme;
}) {
  const c = theme.colors;
  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
      {info ? (
        <>
          <Text style={[styles.cardTitle, { color: c.text }]}>
            House {info.house} · {RASHI_NAMES[info.sign]}
          </Text>
          <Text style={[styles.cardBody, { color: c.textSecondary }]}>
            {info.planets.length > 0
              ? info.planets.map((p) => String(p.id)).join(', ')
              : 'No planets'}
          </Text>
        </>
      ) : (
        <Text style={[styles.cardBody, { color: c.textSecondary }]}>
          Tap any house to inspect it.
        </Text>
      )}
    </View>
  );
}

function Toggle({
  label,
  active,
  onPress,
  theme,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  theme: typeof lightChartTheme;
}) {
  const c = theme.colors;
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.toggle,
        {
          borderColor: c.border,
          backgroundColor: active ? withAlpha(c.accent, 0.12) : 'transparent',
        },
      ]}
    >
      <Text style={[styles.toggleText, { color: active ? c.accent : c.textSecondary }]}>
        {label}
      </Text>
    </Pressable>
  );
}

function Button({
  label,
  onPress,
  theme,
  primary,
}: {
  label: string;
  onPress: () => void;
  theme: typeof lightChartTheme;
  primary?: boolean;
}) {
  const c = theme.colors;
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.button,
        primary
          ? { backgroundColor: c.accent }
          : { backgroundColor: 'transparent', borderWidth: 1, borderColor: c.border },
      ]}
    >
      <Text style={[styles.buttonText, { color: primary ? '#fff' : c.text }]}>{label}</Text>
    </Pressable>
  );
}

/** Append an alpha channel to a #rrggbb colour. */
function withAlpha(hex: string, alpha: number): string {
  const a = Math.round(clamp(alpha, 0, 1) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${a}`;
}
function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 20, paddingBottom: 48, alignItems: 'center' },
  h1: { fontSize: 24, fontWeight: '700', alignSelf: 'flex-start' },
  sub: { fontSize: 14, alignSelf: 'flex-start', marginTop: 2, marginBottom: 16 },
  toolbar: { flexDirection: 'row', gap: 10, alignSelf: 'flex-start', marginBottom: 12 },
  chartWrap: { marginVertical: 8 },
  toggle: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1 },
  toggleText: { fontSize: 14, fontWeight: '600' },
  card: {
    width: '100%',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  cardBody: { fontSize: 14 },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 16, width: '100%' },
  button: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: { fontSize: 15, fontWeight: '700' },
  caption: { fontSize: 13, alignSelf: 'flex-start', marginTop: 28, marginBottom: 10 },
  thumbRow: { flexDirection: 'row', gap: 16, alignItems: 'flex-end', alignSelf: 'flex-start' },
});
