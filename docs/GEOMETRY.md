# Geometry — the coordinate system, derived

Every coordinate in the library lives in a fixed **300 × 300** space and is
scaled to the rendered `size` by the SVG `viewBox`. This document derives the
frame, the twelve cell polygons, and explains the label table.

---

## 1. Key points of the frame

Take the 300 × 300 square. Label the corners, the midpoints of each side
(the diamond vertices), the centre, and the four points where the diagonals
cross the diamond edges:

```
Corners:        TL(0,0)     TR(300,0)     BR(300,300)   BL(0,300)
Side midpoints: T(150,0)    R(300,150)    B(150,300)    L(0,150)
Centre:         C(150,150)
Diagonal×diamond crossings:
                (75,75)  (225,75)  (225,225)  (75,225)
```

The two diagonals are `y = x` (TL→BR) and `x + y = 300` (TR→BL). The diamond
edges are the four lines `x + y = 150`, `x − y = 150`, `y − x = 150`,
`x + y = 450`. Intersecting a diagonal with a diamond edge gives the crossing
points above. Example: `y = x` with `x + y = 150` ⟹ `(75, 75)`.

The visible frame is drawn with only three shape types:

| Element    | Definition                                      |
| ---------- | ----------------------------------------------- |
| Border     | `Rect x=1 y=1 w=298 h=298 rx=2`                 |
| Diamond    | `Polygon 150,0 300,150 150,300 0,150` (T R B L) |
| Diagonal 1 | `Line 0,0 → 300,300`                            |
| Diagonal 2 | `Line 300,0 → 0,300`                            |

---

## 2. The twelve cells

The frame carves the square into twelve regions. The four **kendra** houses are
the large central diamonds (top, right, bottom, left); the eight others are the
corner triangles, two per corner, split by a diagonal.

| House | Kind              | Polygon (`HOUSE_POLYGONS`)       |
| ----- | ----------------- | -------------------------------- |
| 1     | kendra (top)      | `150,0 225,75 150,150 75,75`     |
| 2     | corner (TL upper) | `0,0 150,0 75,75`                |
| 3     | corner (TL lower) | `0,0 75,75 0,150`                |
| 4     | kendra (left)     | `0,150 75,75 150,150 75,225`     |
| 5     | corner (BL upper) | `0,300 0,150 75,225`             |
| 6     | corner (BL lower) | `0,300 75,225 150,300`           |
| 7     | kendra (bottom)   | `150,300 75,225 150,150 225,225` |
| 8     | corner (BR lower) | `300,300 225,225 150,300`        |
| 9     | corner (BR upper) | `300,300 300,150 225,225`        |
| 10    | kendra (right)    | `300,150 225,75 150,150 225,225` |
| 11    | corner (TR lower) | `300,0 225,75 300,150`           |
| 12    | corner (TR upper) | `300,0 150,0 225,75`             |

Reading the house order: house 1 is top-centre, then the sequence runs
**anticlockwise** — 2 and 3 fill the top-left corner, 4 is the left diamond,
5 and 6 the bottom-left corner, 7 the bottom diamond, 8 and 9 the bottom-right
corner, 10 the right diamond, 11 and 12 the top-right corner.

These polygons are exact and are used for optional cell shading (`houseFill`)
and for tap detection: `houseAtPoint(x, y)` runs a point-in-polygon test against
them to resolve `onPressHouse` from a tap coordinate (a single `Pressable` over
the chart, no per-shape SVG press). See `ARCHITECTURE.md` §8a.

---

## 3. The label table (`HOUSE_LAYOUT`)

Where the frame polygons are _geometric_, the label anchors are _typographic_ —
hand-tuned so the sign number, planet block, and house number sit legibly inside
each cell. Each house stores three points and their text anchors:

| House | rashi (anchor)   | planets (anchor) | houseNum (anchor) |
| ----- | ---------------- | ---------------- | ----------------- |
| 1     | 150,18 (middle)  | 150,70 (middle)  | 150,135 (middle)  |
| 2     | 40,18 (middle)   | 75,35 (middle)   | 75,65 (middle)    |
| 3     | 15,45 (start)    | 30,75 (start)    | 65,78 (end)       |
| 4     | 15,150 (start)   | 75,150 (middle)  | 130,153 (end)     |
| 5     | 15,265 (start)   | 30,225 (start)   | 65,228 (end)      |
| 6     | 40,290 (middle)  | 75,265 (middle)  | 75,242 (middle)   |
| 7     | 150,290 (middle) | 150,230 (middle) | 150,172 (middle)  |
| 8     | 260,290 (middle) | 225,265 (middle) | 225,242 (middle)  |
| 9     | 285,265 (end)    | 270,225 (end)    | 235,228 (start)   |
| 10    | 285,150 (end)    | 225,150 (middle) | 170,153 (start)   |
| 11    | 285,45 (end)     | 270,75 (end)     | 235,78 (start)    |
| 12    | 260,18 (middle)  | 225,35 (middle)  | 225,65 (middle)   |

Notes:

- **Corner cells use `start`/`end` anchors** so a wide sign name doesn't run off
  the narrow triangle; kendra cells use `middle`.
- **`planets` is a centre**, not a top-left — the render pipeline lays rows out
  symmetrically around it (see `ARCHITECTURE.md` §6).
- The **house number** anchors sit nearer the cell interior; they are only drawn
  when `showHouseNumbers` is enabled (off by default, matching the common
  convention of showing sign numbers, not house numbers).

---

## 4. Planet block metrics

| Constant                   | Value    | Meaning                                  |
| -------------------------- | -------- | ---------------------------------------- |
| `PLANET_SPACING`           | `16`     | horizontal gap between glyphs in a row   |
| `PLANET_ROW_NUDGE`         | `0.35`   | optical downward nudge, × font size      |
| kendra rows-per            | `3`      | houses 1/4/7/10 fit three glyphs per row |
| other rows-per             | `2`      | all other houses fit two                 |
| font (≤2 rows / >2 rows)   | `10 / 8` | `fontSizes.planet` / `planetCompact`     |
| line height (≤2 / >2 rows) | `11 / 9` | `lineHeights.planet` / `planetCompact`   |

Vertical placement of a house's planet block:

```
baseY = planets.y − (rows − 1) · rowStep / 2 + fontSize · 0.35
rowY  = baseY + rowIndex · rowStep
```

Horizontal placement within a row of `n` glyphs:

```
rowStartX = planets.x − (n − 1) · 16 / 2
glyphX    = rowStartX + colIndex · 16
```

All glyphs render with `textAnchor="middle"`.

---

## 5. Other fixed points

| Constant          | Value                         | Use                         |
| ----------------- | ----------------------------- | --------------------------- |
| `VIEWBOX`         | `300`                         | authoring space edge        |
| `ASC_LABEL_POINT` | `(150, 32)`                   | the "Asc" marker in house 1 |
| `DIAMOND_POINTS`  | `150,0 300,150 150,300 0,150` | inner diamond               |
