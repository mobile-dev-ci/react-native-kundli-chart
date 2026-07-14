import {
  chunk,
  groupPlanetsByHouse,
  houseAtPoint,
  houseOfPlanet,
  parsePolygonPoints,
  planetColor,
  planetsPerRow,
  pointInPolygon,
  resolvePlanetAbbreviation,
  signInHouse,
} from '../src/utils/placement';
import { lightChartTheme } from '../src/theme';
import { ALL_HOUSES, HOUSE_POLYGONS } from '../src/constants/geometry';
import type { HouseNumber, PlanetPlacement, RashiNumber } from '../src/types';

const ALL: RashiNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

describe('signInHouse', () => {
  it('places the ascendant sign in house 1', () => {
    for (const asc of ALL) expect(signInHouse(asc, 1)).toBe(asc);
  });

  it('advances one sign per house and wraps at 12', () => {
    expect(signInHouse(5, 2)).toBe(6);
    expect(signInHouse(5, 9)).toBe(1); // Leo asc -> house 9 = Aries
    expect(signInHouse(12, 2)).toBe(1); // Pisces asc -> house 2 = Aries
    expect(signInHouse(11, 3)).toBe(1); // Aquarius asc -> house 3 = Aries
  });

  it('produces a full permutation of all 12 signs across the 12 houses', () => {
    for (const asc of ALL) {
      const signs = ALL_HOUSES.map((h) => signInHouse(asc, h));
      expect(new Set(signs).size).toBe(12);
    }
  });
});

describe('houseOfPlanet', () => {
  it('is house 1 when the planet is in the ascendant sign', () => {
    for (const asc of ALL) expect(houseOfPlanet(asc, asc)).toBe(1);
  });

  it('matches known placements for a Leo ascendant', () => {
    expect(houseOfPlanet(2, 5)).toBe(10); // Taurus is 10th from Leo
    expect(houseOfPlanet(11, 5)).toBe(7); // Aquarius is 7th from Leo
    expect(houseOfPlanet(6, 5)).toBe(2); // Virgo is 2nd from Leo
  });

  it('is the exact inverse of signInHouse', () => {
    for (const asc of ALL) {
      for (const h of ALL_HOUSES) {
        expect(houseOfPlanet(signInHouse(asc, h), asc)).toBe(h);
      }
    }
  });
});

describe('planetsPerRow', () => {
  it('gives 3 for kendra houses and 2 otherwise', () => {
    for (const h of [1, 4, 7, 10] as HouseNumber[]) expect(planetsPerRow(h)).toBe(3);
    for (const h of [2, 3, 5, 6, 8, 9, 11, 12] as HouseNumber[]) expect(planetsPerRow(h)).toBe(2);
  });
});

describe('chunk', () => {
  it('splits into fixed-size groups, last shorter', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    expect(chunk([1, 2, 3], 3)).toEqual([[1, 2, 3]]);
    expect(chunk([], 2)).toEqual([]);
  });
});

describe('groupPlanetsByHouse', () => {
  it('buckets planets into the correct houses and preserves order', () => {
    const planets: PlanetPlacement[] = [
      { id: 'sun', rashi: 5 },
      { id: 'ketu', rashi: 5 },
      { id: 'moon', rashi: 2 },
    ];
    const grouped = groupPlanetsByHouse(planets, 5);
    expect(grouped[1].map((p) => p.id)).toEqual(['sun', 'ketu']);
    expect(grouped[10].map((p) => p.id)).toEqual(['moon']);
    expect(grouped[3]).toEqual([]);
  });
});

describe('resolvePlanetAbbreviation', () => {
  it('prefers explicit label, then override map, then builtin, then first two chars', () => {
    expect(resolvePlanetAbbreviation({ id: 'sun', rashi: 1, label: 'S' })).toBe('S');
    expect(resolvePlanetAbbreviation({ id: 'sun', rashi: 1 }, { sun: 'Su.' })).toBe('Su.');
    expect(resolvePlanetAbbreviation({ id: 'jupiter', rashi: 1 })).toBe('Ju');
    expect(resolvePlanetAbbreviation({ id: 'uranus', rashi: 1 })).toBe('Ur');
  });
});

describe('planetColor', () => {
  it('uses dignity colours when present, else the default text colour', () => {
    const c = lightChartTheme.colors;
    expect(planetColor({ id: 'sun', rashi: 1, dignity: 'exalted' }, lightChartTheme)).toBe(
      c.exalted,
    );
    expect(planetColor({ id: 'sun', rashi: 1, dignity: 'debilitated' }, lightChartTheme)).toBe(
      c.debilitated,
    );
    expect(planetColor({ id: 'sun', rashi: 1, dignity: 'ownSign' }, lightChartTheme)).toBe(
      c.ownSign,
    );
    expect(planetColor({ id: 'sun', rashi: 1 }, lightChartTheme)).toBe(c.text);
  });
});

describe('parsePolygonPoints', () => {
  it('parses an SVG points string into coordinate pairs', () => {
    expect(parsePolygonPoints('150,0 300,150 0,150')).toEqual([
      [150, 0],
      [300, 150],
      [0, 150],
    ]);
  });
});

describe('pointInPolygon', () => {
  const square: Array<[number, number]> = [
    [0, 0],
    [10, 0],
    [10, 10],
    [0, 10],
  ];
  it('detects inside and outside points', () => {
    expect(pointInPolygon(5, 5, square)).toBe(true);
    expect(pointInPolygon(15, 5, square)).toBe(false);
    expect(pointInPolygon(-1, -1, square)).toBe(false);
  });
});

describe('houseAtPoint', () => {
  it('maps representative interior points to the right house', () => {
    expect(houseAtPoint(150, 75)).toBe(1); // top diamond
    expect(houseAtPoint(10, 10)).toBe(2); // top-left upper corner
    expect(houseAtPoint(150, 225)).toBe(7); // bottom diamond
    expect(houseAtPoint(290, 150)).toBe(10); // right diamond
    expect(houseAtPoint(290, 290)).toBe(9); // bottom-right corner
  });

  it('returns a valid house for the centroid of every cell', () => {
    for (const h of ALL_HOUSES) {
      const pts = parsePolygonPoints(HOUSE_POLYGONS[h]);
      const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
      const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
      expect(houseAtPoint(cx, cy)).toBe(h);
    }
  });

  it('returns null for points outside the chart', () => {
    expect(houseAtPoint(-5, -5)).toBeNull();
    expect(houseAtPoint(400, 400)).toBeNull();
  });
});
