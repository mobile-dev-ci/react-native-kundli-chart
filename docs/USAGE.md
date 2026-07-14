# Usage & recipes

Assumes `react-native-svg` is installed and linked. Import from
`react-native-north-indian-chart`.

---

## 1. Minimal chart

```tsx
import { NorthIndianChart, type PlanetPlacement } from 'react-native-north-indian-chart';

const planets: PlanetPlacement[] = [
  { id: 'sun', rashi: 5 },
  { id: 'moon', rashi: 2 },
  { id: 'saturn', rashi: 1, isRetrograde: true },
];

<NorthIndianChart ascendantRashi={5} planets={planets} size={300} />;
```

## 2. Glyphs or names instead of sign numbers

`renderRashiLabel` controls the per-house sign label.

```tsx
import { NorthIndianChart, RASHI_GLYPHS, RASHI_NAMES } from 'react-native-north-indian-chart';

// Zodiac glyphs (♈ ♉ …)
<NorthIndianChart {...chart} renderRashiLabel={(sign) => RASHI_GLYPHS[sign]} />

// Three-letter names
<NorthIndianChart {...chart} renderRashiLabel={(sign) => RASHI_NAMES[sign].slice(0, 3)} />
```

## 3. Localisation (i18n)

Everything textual is injectable — wire it to your translation function.

```tsx
<NorthIndianChart
  {...chart}
  ascLabel={t('chart.asc')}
  planetAbbreviations={{
    sun: t('planet_abbr.sun'),
    moon: t('planet_abbr.moon'),
    // ...
  }}
  renderRashiLabel={(sign) => t(`rashi.short.${sign}`)}
/>

<ChartLegendBottomSheet
  visible={open}
  onClose={close}
  title={t('chart.legend')}
  planetsHeading={t('chart.planets')}
  signsHeading={t('chart.signs')}
  dignityHeading={t('chart.dignity')}
  planetNames={{ sun: t('planet.sun') /* ... */ }}
  rashiNames={{ 1: t('rashi.1') /* ... */ }}
/>
```

## 4. Dignity colouring

Add a `dignity` to a placement; the default themes colour exalted / debilitated
/ ownSign (or moolatrikona) / combust. Undefined dignities use the text colour.

```tsx
const planets = [
  { id: 'sun', rashi: 1, dignity: 'exalted' }, // green
  { id: 'saturn', rashi: 1, dignity: 'debilitated' }, // red
  { id: 'mercury', rashi: 6, dignity: 'ownSign' }, // blue
];
```

Customise the colours via the theme:

```tsx
<NorthIndianChart {...chart} theme={{ colors: { exalted: '#1B8A5A', debilitated: '#C0392B' } }} />
```

## 5. Tap handling & highlighting

```tsx
<NorthIndianChart
  {...chart}
  onPressHouse={({ house, sign, planets }) => openHouseDetail(house, sign, planets)}
  houseFill={(house) => (house === selectedHouse ? 'rgba(109,90,230,0.10)' : undefined)}
/>
```

`onPressHouse` hit-tests each tap against the exact cell outlines (works on web
and native). `houseFill` shades a cell (return `undefined` for no fill).

## 6. Legend bottom sheet

```tsx
const [legend, setLegend] = useState(false);

<NorthIndianChart {...chart} onPressInfo={() => setLegend(true)} />
<ChartLegendBottomSheet visible={legend} onClose={() => setLegend(false)} theme={theme} />
```

Hide the dignity section, or supply custom rows:

```tsx
<ChartLegendBottomSheet {...props} dignityLegend={false} />

<ChartLegendBottomSheet
  {...props}
  dignityLegend={[
    { dignity: 'exalted', label: 'Uccha', color: '#1B8A5A' },
    { dignity: 'debilitated', label: 'Neecha', color: '#C0392B' },
  ]}
/>
```

## 7. Fullscreen modal

```tsx
const [full, setFull] = useState(false);

<FullscreenChartModal
  visible={full}
  onClose={() => setFull(false)}
  theme={theme}
  title="Rahul's Kundli"
  subtitle="Ascendant: Leo · 14 Mar 1990"
  chartProps={{ ascendantRashi: 5, planets, renderRashiLabel: (s) => RASHI_GLYPHS[s] }}
/>;
```

The modal ignores `chartProps.size` (it sizes to the viewport), embeds a legend
button, and lets the user pinch-to-zoom.

## 8. Dark mode

```tsx
import { darkChartTheme, lightChartTheme } from 'react-native-north-indian-chart';
const theme = useColorScheme() === 'dark' ? darkChartTheme : lightChartTheme;
<NorthIndianChart {...chart} theme={theme} />;
```

## 9. Using your own bottom sheet

Skip the bundled sheet and render legend content in your own (`@gorhom/bottom-sheet`,
a nav modal, etc.). The reference data you need is exported:

```tsx
import {
  PLANET_NAMES,
  PLANET_ABBREVIATIONS,
  RASHI_NAMES,
  RASHI_LORDS,
} from 'react-native-north-indian-chart';
```

## 10. Custom bodies

`id` accepts any string; unknown ids get a two-letter fallback unless you provide
a `label` or an abbreviation entry.

```tsx
const planets = [
  { id: 'gulika', rashi: 8, label: 'Gk' },
  { id: 'uranus', rashi: 3 }, // renders "Ur"
];
```

## 11. Headless layout (no rendering)

Need positions for a canvas/native renderer or tests? Use the pure hook/helpers:

```tsx
import { useChartLayout, signInHouse, houseOfPlanet } from 'react-native-north-indian-chart';

houseOfPlanet(5, 5); // 1
signInHouse(5, 10); // 2  (Taurus is the 10th sign from Leo)
```

`useChartLayout` returns `{ houses: RenderedHouse[] }`, each with resolved sign
labels and absolutely-positioned `RenderedPlanet[]` in 300-space.

## 12. Sizing guidance

- List thumbnail: `size={96–140}` (sign numbers stay legible; consider hiding
  the asc label).
- Detail screen: `size={300–360}`.
- Fullscreen: use `FullscreenChartModal` (auto-sizes) or `size={min(width,height)*0.9}`.
