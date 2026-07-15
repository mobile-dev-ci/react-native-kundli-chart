# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-07-13

### Added

- `NorthIndianChart` — diamond-style Lagna/Kundli chart rendered with
  `react-native-svg`, scaled from a fixed 300×300 space via the SVG viewBox.
- `ChartLegendBottomSheet` — themeable legend (planets, signs with lords,
  dignity colours) in a dependency-free bottom sheet.
- `FullscreenChartModal` — full-screen, pinch-to-zoom presentation with header
  and legend.
- `BottomSheet` — self-contained sheet primitive (Modal + Animated + PanResponder).
- Cross-platform tap handling via coordinate hit-testing (`houseAtPoint`),
  working identically on web and native.
- Theming (`lightChartTheme`, `darkChartTheme`, `mergeTheme`), full i18n hooks,
  dignity colouring, retrograde markers, optional house numbers.
- Pure, exported helpers (`signInHouse`, `houseOfPlanet`, `groupPlanetsByHouse`,
  `pointInPolygon`, …) and the `useChartLayout` render hook.
- Documentation (`README`, `docs/ARCHITECTURE`, `docs/GEOMETRY`, `docs/USAGE`),
  an Expo example app, and a Jest test suite.

[Unreleased]: https://github.com/mobile-dev-ci/react-native-kundli-chart/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/mobile-dev-ci/react-native-kundli-chart/releases/tag/v1.0.0
