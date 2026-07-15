# Contributing

Thanks for your interest in improving `react-native-north-indian-chart`.

## Getting started

```sh
git clone https://github.com/mobile-dev-ci/react-native-north-indian-chart.git
cd react-native-north-indian-chart
npm install
```

Run the checks the CI runs:

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

## Running the example

The Expo example consumes the library source directly (`../src`), so your edits
hot-reload.

```sh
cd example
npm install
npm run web      # or: npm run ios / npm run android
```

## Project layout

```
src/
  components/   NorthIndianChart, ChartLegendBottomSheet, FullscreenChartModal, BottomSheet
  constants/    geometry (layout table, polygons) + astrology reference data
  hooks/        useChartLayout (props -> render model)
  theme/        ChartTheme contract + light/dark defaults
  utils/        pure placement + hit-testing logic
test/           Jest unit tests for the pure logic
scripts/        generate-screenshots.js (renders assets/ from the layout)
assets/         generated reference images (README/docs)
docs/           ARCHITECTURE, GEOMETRY, USAGE
example/        Expo app
```

Regenerate the reference images after a visual change:

```sh
npm run build && npm run screenshots
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) before making structural changes.

## Guidelines

- **Keep logic pure and tested.** Anything that can live in `utils/` (no React,
  no rendering) should, and should come with tests in `test/`.
- **Type strictly.** The project uses `strict` + `noUncheckedIndexedAccess`. No
  `// @ts-ignore` without a comment explaining why.
- **Match the existing style.** Run `npm run format` (Prettier) before committing.
- **No new runtime dependencies** without discussion — the library intentionally
  depends only on `react`, `react-native`, and `react-native-svg`.
- **Cross-platform.** Changes must work on iOS, Android, and web. Prefer
  coordinate/logic solutions over platform-specific SVG event behaviour.

## Commits & PRs

- Write focused commits with clear messages.
- Update `CHANGELOG.md` under `## [Unreleased]`.
- Add or update tests and docs for user-facing changes.
- Open the PR against `main`; CI must pass.

## Reporting bugs

Open an issue with a minimal reproduction: ascendant, planet placements, the
props you passed, expected vs actual, and platform (iOS/Android/web) + versions.
