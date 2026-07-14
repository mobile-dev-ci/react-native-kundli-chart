# Architecture — how this library is built

This document explains **how** the North Indian chart is constructed so any
engineer can extend or debug it later. It is implementation-oriented; for the
raw coordinate numbers see [`GEOMETRY.md`](GEOMETRY.md), and for API recipes see
[`USAGE.md`](USAGE.md).

---

## 1. The mental model: house-fixed, sign-rotating

A North Indian chart looks like a square with an inscribed diamond and both
diagonals, carving the square into **twelve cells**. The single most important
fact about it:

> The twelve **house** cells are always in the same place. Only the **sign**
> (rashi) shown inside each cell changes, and it changes as a function of the
> ascendant.

- **House 1** is the top-centre diamond and always holds the ascendant sign.
- Moving anticlockwise, each subsequent house holds the next sign.
- A **planet** is drawn in whichever house its sign currently occupies.

This is the opposite of the South Indian chart (where signs are fixed and the
ascendant marker moves). Because houses are fixed, the entire layout can be
precomputed as a static table, and only text content is dynamic. That is the
key design decision the whole library rests on.

Two pure formulas encode the model (`src/utils/placement.ts`):

```
signInHouse(asc, house)      = wrap12(asc + (house - 1))
houseOfPlanet(rashi, asc)    = ((rashi - asc + 12) % 12) + 1
```

with `wrap12` mapping any integer back into `1..12`. Both use 1-based indices
(`1 = Aries`), so `houseOfPlanet(asc, asc) === 1` — a planet in the ascendant
sign is in house 1, as expected.

---

## 2. Layering

The code is deliberately split so that **all maths is pure and testable**, and
the React layer is a thin projection of a precomputed model.

```
constants/         pure data: geometry table, polygons, astrology reference
   geometry.ts     VIEWBOX, DIAMOND_POINTS, HOUSE_LAYOUT, HOUSE_POLYGONS, KENDRA_HOUSES
   astrology.ts    names, lords, glyphs, abbreviations
utils/placement.ts pure functions: signInHouse, houseOfPlanet, chunk, colour, abbrev
theme/index.ts     ChartTheme contract + light/dark defaults + mergeTheme
hooks/useChartLayout.ts   props -> fully-positioned, memoised render model
components/
   NorthIndianChart.tsx     render model -> SVG nodes (thin)
   BottomSheet.tsx          dependency-free sheet primitive
   ChartLegendBottomSheet.tsx  legend content inside the sheet
   FullscreenChartModal.tsx    full-screen presentation
index.ts           public barrel
```

Data flows **one way**: `props → useChartLayout → render model → SVG`. The
component holds almost no logic; if a label is in the wrong place, the bug is in
the hook or the geometry table, never in JSX.

---

## 3. The coordinate space and scaling

Everything is authored in a fixed **300 × 300** space (`VIEWBOX = 300`). The
SVG is rendered with `width={size} height={size} viewBox="0 0 300 300"`, so the
platform scales _all_ geometry — positions, strokes, and font sizes — uniformly
by `size / 300`. There is no manual multiplication by a scale factor anywhere.

This matters and is a deliberate correctness choice: font sizes are given in
**user-space units** (e.g. `9`) and inherit viewBox scaling automatically.
Multiplying them by a scale factor as well would double-scale text and make it
grow faster than the chart. Keeping a single scaling authority (the viewBox)
means the chart is pixel-crisp and proportionally correct at `size = 120`
(a list thumbnail) and at `size = 900` (fullscreen) alike.

---

## 4. The frame — four primitives

The visible skeleton is just four SVG nodes (`NorthIndianChart.tsx`):

1. **Rounded border** — `Rect x=1 y=1 w=298 h=298 rx=2`.
2. **Inner diamond** — `Polygon points="150,0 300,150 150,300 0,150"`
   (connects the four side-midpoints).
3. **Two diagonals** — `Line 0,0→300,300` and `Line 300,0→0,300`.

The intersections of the diamond edges with the diagonals fall at
`(75,75) (225,75) (225,225) (75,225)`; together with the corners, side-midpoints
and centre they define the twelve cells. Stroke colour is `theme.colors.frame`;
per-element opacity and width come from the theme.

---

## 5. The house layout table

Rather than compute cell centroids at runtime, label positions are a static,
hand-tuned table (`HOUSE_LAYOUT`, keyed by house `1..12`). Each entry stores
three anchor points and their text anchors:

- **`rashi` / `rashiAnchor`** — where the sign label sits.
- **`planets` / `planetAnchor`** — the centre the planet block is laid out around.
- **`houseNum` / `numAnchor`** — where the optional house number sits.

Corner cells are narrow triangles, so their anchors use `start` / `end` text
alignment to keep labels from spilling out; the big central diamonds use
`middle`. These numbers are tuned for legibility, not derived from a formula —
that is why they live in a table.

Separately, `HOUSE_POLYGONS` gives the **exact outline** of each cell as an SVG
`points` string. These are geometric (derived, see `GEOMETRY.md`) and power two
optional features: per-cell background fills via `houseFill`, and tap detection
for `onPressHouse` (see §8a).

---

## 6. The render pipeline (`useChartLayout`)

The hook turns props into a `ChartLayout` — an array of `RenderedHouse`, each
with its resolved sign label and a list of absolutely-positioned
`RenderedPlanet`s. It is wrapped in `useMemo` keyed on the inputs, so scrolling
a list of charts doesn't recompute layout unnecessarily.

Per house:

1. **Sign** = `signInHouse(asc, house)`; **label** = `renderRashiLabel(sign,
house)` or the number.
2. **Planets in house** = filtered by `houseOfPlanet`.
3. **Planet block layout** (the only non-trivial part):
   - Planets are chunked into **rows**. Kendra houses (`1, 4, 7, 10` — the large
     diamonds) fit **3** per row; all others fit **2** (`planetsPerRow`).
   - If there are **more than 2 rows**, the block is "compact": smaller font
     (`fontSizes.planetCompact`) and tighter line height
     (`lineHeights.planetCompact`).
   - The block is **vertically centred** on the house's `planets.y`:
     `baseY = planets.y − (rows−1)·rowStep/2 + fontSize·0.35`. The
     `fontSize·0.35` is a small optical nudge so text sits on its visual centre
     rather than its baseline.
   - Each row is **horizontally centred** on `planets.x` with a fixed
     `PLANET_SPACING = 16` between glyphs; each glyph is drawn with
     `textAnchor="middle"`. (The table's `planetAnchor` is intentionally _not_
     used for planets — glyph positions are computed — but is retained for
     completeness and potential future use.)
4. **Planet label** = `resolvePlanetAbbreviation` (`label` override → caller map
   → built-in navagraha map → first two letters), plus the retrograde marker
   (`ᴿ`) when applicable.
5. **Planet colour** = `planetColor` — dignity-driven when the theme defines a
   colour for that dignity, otherwise the default text colour.

Finally the component maps each `RenderedHouse` to a `<G>` containing an
optional hit polygon, the optional house number, the sign label, and the planet
glyphs — then draws the single "Asc" marker at `(150, 32)`.

---

## 7. Theming

`ChartTheme` is the entire visual contract: `colors`, `opacity`, `strokeWidth`,
`fontSizes`, `lineHeights`, `fontWeights`, and an optional `fontFamily`. The
component contains no literal colour or size. `lightChartTheme` and
`darkChartTheme` ship as defaults; `mergeTheme(partial, base)` does a
one-level-deep merge so callers can override, say, only `colors.frame`.

Components accept either a full `ChartTheme` or a `PartialChartTheme`; a type
guard (`isFullTheme`) decides whether to merge over the light default. This lets
consumers wire the chart into their own design system with a single prop.

---

## 8a. Tap handling — coordinate hit-testing, not SVG press

`onPressHouse` does **not** rely on per-shape SVG `onPress`. That path is
unreliable across platforms — `react-native-svg` silently ignores press
handlers on shapes under `react-native-web`, and transparent-fill hit regions
behave inconsistently. Instead the chart wraps the SVG in a single `Pressable`
and does the hit-testing itself:

1. Read the tap's `locationX/locationY` (falling back to web's `offsetX/offsetY`).
2. Scale from rendered pixels back into the 300x300 space (`x * 300 / size`).
3. `houseAtPoint(x, y)` runs a ray-casting point-in-polygon test against the
   twelve `HOUSE_POLYGONS` (parsed once, memoised) and returns the house.

This is one handler regardless of house count, and it behaves **identically on
iOS, Android and web** because it depends only on coordinates, not on the SVG
event system. The parsed polygons and `pointInPolygon` / `houseAtPoint` helpers
are exported for reuse (custom overlays, tests, canvas renderers).

## 8. The bottom sheet — why it is hand-rolled

`ChartLegendBottomSheet` needs a sheet, but taking a dependency on a sheet
library would force that choice on every consumer. Instead `BottomSheet` is a
~120-line primitive built only on `Modal`, `Animated`, and `PanResponder`:

- `Modal` (transparent) hosts the sheet and handles the hardware back button.
- The sheet's mounted state is decoupled from `visible` so the **exit animation
  can finish before unmount** (`animateOut` calls `setMounted(false)` only in
  its completion callback).
- It measures its own height with `onLayout`, so the slide distance is exact.
- `PanResponder` implements swipe-to-dismiss with a distance/velocity threshold.
- Backdrop opacity is animated separately and taps dismiss.

If an app already standardises on `@gorhom/bottom-sheet`, it can ignore this
primitive and render the legend content inside its own sheet.

---

## 9. Fullscreen presentation

`FullscreenChartModal` is a slide-up `Modal` that sizes the chart to
`min(width, height) · sizeRatio` via `useWindowDimensions`, wraps it in a
zoomable `ScrollView` (`maximumZoomScale`), and provides a header with title,
subtitle, an optional legend button, and a close button. It reuses
`NorthIndianChart` and `ChartLegendBottomSheet` — it adds presentation, not
chart logic.

---

## 10. Accessibility

- The chart container is `accessibilityRole="image"` with a caption label, so it
  is announced as a single element rather than a spray of loose SVG text nodes.
- Icon-only controls (info, close, legend) carry `accessibilityRole="button"`
  and explicit `accessibilityLabel`s, and use `hitSlop` for comfortable targets.
- Colour is never the _only_ signal: retrograde is also marked with `ᴿ`, and the
  legend spells out dignity colours.

---

## 11. Build & types

- Authored in strict TypeScript (`strict`, `noUncheckedIndexedAccess`,
  `noImplicitOverride`, `noFallthroughCasesInSwitch`).
- `RashiNumber` / `HouseNumber` are literal unions (`1..12`), so out-of-range
  values are compile errors, and `Record<RashiNumber, …>` tables are provably
  exhaustive.
- `tsc` emits JS + `.d.ts` + source maps to `dist/`. The package points `types`
  at the declarations; `source` at the TS entry for Metro/monorepo consumers.
- The only peers are `react`, `react-native`, `react-native-svg`.

---

## 12. Extending it

- **South Indian chart** — add a `SouthIndianChart` with its own fixed 4×4 grid
  layout table; reuse `placement.ts` unchanged (the sign/house maths is shared).
- **Divisional charts (vargas)** — compute a divisional `rashi` per planet
  upstream and pass the result as `planets`; the chart is agnostic to how a sign
  was derived.
- **Aspects / lines** — add SVG `Line`s between house centres (derivable from
  `HOUSE_POLYGONS` centroids) behind the labels.
- **Per-planet tooltips** — use `onPressHouse` (coordinate hit-testing already
  in place) or extend `houseAtPoint` with a finer glyph-level test using the
  `RenderedPlanet` positions and `source` back-reference.
- **New themes** — build on `mergeTheme`; nothing else needs to change.
