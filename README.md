# react-native-north-indian-chart

[![npm version](https://img.shields.io/npm/v/react-native-north-indian-chart.svg)](https://www.npmjs.com/package/react-native-north-indian-chart)
[![CI](https://github.com/mobile-dev-ci/react-native-north-indian-chart/actions/workflows/ci.yml/badge.svg)](https://github.com/mobile-dev-ci/react-native-north-indian-chart/actions/workflows/ci.yml)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![types: TypeScript](https://img.shields.io/badge/types-TypeScript-3178c6.svg)](https://www.typescriptlang.org/)

A fully-typed, dependency-light **North Indian (diamond) Vedic astrology chart** for React Native, drawn as crisp SVG at any size. Ships three composable pieces:

- **`NorthIndianChart`** — the diamond Lagna/Kundli chart.
- **`ChartLegendBottomSheet`** — a themeable legend (planets, signs, dignity colours).
- **`FullscreenChartModal`** — a full-screen, pinch-to-zoom presentation with header + legend.

Everything is themeable and localisable. No hard-coded strings, colours, or sizes. No runtime dependency beyond `react`, `react-native`, and `react-native-svg`.

---

## Install

```sh
npm install react-native-north-indian-chart react-native-svg
# or
yarn add react-native-north-indian-chart react-native-svg
```

`react-native-svg` is a peer dependency — install and link it per its own instructions (autolinking on RN ≥ 0.60).

## Quick start

```tsx
import { NorthIndianChart, type PlanetPlacement } from 'react-native-north-indian-chart';

const planets: PlanetPlacement[] = [
  { id: 'sun', rashi: 5, dignity: 'ownSign' },
  { id: 'moon', rashi: 2, dignity: 'exalted' },
  { id: 'saturn', rashi: 1, isRetrograde: true },
  // ...
];

<NorthIndianChart ascendantRashi={5 /* Leo */} planets={planets} size={320} />;
```

## Indexing convention

- **`RashiNumber`** is `1..12` where `1 = Aries (Mesha)` … `12 = Pisces (Meena)`.
- **`HouseNumber`** is `1..12`. House 1 is the top-centre diamond and always holds `ascendantRashi`.
- The chart is **house-fixed, sign-rotating**: cells never move; the sign shown in each cell is derived from the ascendant.

## Core props (`NorthIndianChart`)

| Prop                        | Type                              | Default          | Notes                                     |
| --------------------------- | --------------------------------- | ---------------- | ----------------------------------------- |
| `ascendantRashi`            | `RashiNumber`                     | —                | Sign in house 1.                          |
| `planets`                   | `PlanetPlacement[]`               | —                | See below.                                |
| `size`                      | `number`                          | `300`            | Rendered edge length (px).                |
| `theme`                     | `ChartTheme \| PartialChartTheme` | light            | Partial is merged over the light default. |
| `renderRashiLabel`          | `(sign, house) => string`         | numeric          | e.g. return `RASHI_GLYPHS[sign]`.         |
| `planetAbbreviations`       | `Record<string,string>`           | built-in         | Localise glyphs.                          |
| `showRashiNumbers`          | `boolean`                         | `true`           |                                           |
| `showHouseNumbers`          | `boolean`                         | `false`          |                                           |
| `showAscLabel` / `ascLabel` | `boolean` / `string`              | `true` / `"Asc"` |                                           |
| `houseFill`                 | `(house) => string \| undefined`  | —                | Highlight cells.                          |
| `onPressHouse`              | `(info: HousePressInfo) => void`  | —                | Enables tap regions.                      |
| `onPressInfo`               | `() => void`                      | —                | Shows an info button.                     |

`PlanetPlacement`:

```ts
interface PlanetPlacement {
  id: PlanetId | string; // 'sun'..'ketu' or any custom body
  rashi: RashiNumber; // 1..12
  isRetrograde?: boolean; // appends 'ᴿ'
  dignity?: Dignity; // 'exalted' | 'debilitated' | 'ownSign' | 'combust' | ...
  degree?: number; // optional, for your own tooltips
  label?: string; // hard override of the glyph
}
```

## Legend + fullscreen

```tsx
const [legend, setLegend] = useState(false);
const [full, setFull] = useState(false);

<NorthIndianChart {...chart} onPressInfo={() => setLegend(true)} />

<ChartLegendBottomSheet visible={legend} onClose={() => setLegend(false)} />

<FullscreenChartModal
  visible={full}
  onClose={() => setFull(false)}
  title="Kundli"
  subtitle="Ascendant: Leo"
  chartProps={{ ascendantRashi: 5, planets }}
/>
```

## Theming

```tsx
import { darkChartTheme, mergeTheme } from 'react-native-north-indian-chart';

// Full theme:
<NorthIndianChart {...chart} theme={darkChartTheme} />

// Partial merged over light:
<NorthIndianChart {...chart} theme={{ colors: { frame: '#B8860B' } }} />

// Partial merged over dark:
<NorthIndianChart {...chart} theme={mergeTheme({ colors: { frame: '#B8860B' } }, darkChartTheme)} />
```

## Also exported

Pure helpers (`signInHouse`, `houseOfPlanet`, `groupPlanetsByHouse`, `planetsPerRow`, `chunk`), the render hook `useChartLayout`, all geometry constants (`HOUSE_LAYOUT`, `HOUSE_POLYGONS`, …), and reference data (`RASHI_NAMES`, `RASHI_LORDS`, `RASHI_GLYPHS`, `PLANET_NAMES`, …). See [`docs/USAGE.md`](docs/USAGE.md).

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — how the library is built, end to end.
- [`docs/GEOMETRY.md`](docs/GEOMETRY.md) — the coordinate system and every constant, derived.
- [`docs/USAGE.md`](docs/USAGE.md) — recipes (glyphs, i18n, dignity, highlighting, custom sheets).

## License

MIT
