/**
 * Generates the reference images used in the README and docs.
 *
 * It reuses the library's own pure layout builder (`buildChartLayout`) to emit
 * an SVG that mirrors what <NorthIndianChart> renders, then rasterises it to PNG
 * with ImageMagick (if available). This keeps the images faithful and lets
 * anyone regenerate them: `npm run build && npm run screenshots`.
 *
 * Output: assets/chart-light.(svg|png), assets/chart-dark.(svg|png)
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const dist = path.resolve(__dirname, '..', 'dist');
if (!fs.existsSync(path.join(dist, 'index.js'))) {
  console.error('dist/ not found — run `npm run build` first.');
  process.exit(1);
}

const { buildChartLayout } = require(path.join(dist, 'hooks/useChartLayout.js'));
const { lightChartTheme, darkChartTheme } = require(path.join(dist, 'theme/index.js'));
const { DIAMOND_POINTS, ASC_LABEL_POINT } = require(path.join(dist, 'constants/geometry.js'));
const { RASHI_GLYPHS } = require(path.join(dist, 'constants/astrology.js'));

// Sample chart — a Leo ascendant with every graha placed and a spread of
// dignities / retrogrades, so the image exercises the colouring rules.
const ASCENDANT = 5;
const PLANETS = [
  { id: 'sun', rashi: 5, dignity: 'ownSign' },
  { id: 'moon', rashi: 2, dignity: 'exalted' },
  { id: 'mars', rashi: 10, dignity: 'exalted' },
  { id: 'mercury', rashi: 6, dignity: 'ownSign' },
  { id: 'jupiter', rashi: 10, dignity: 'debilitated' },
  { id: 'venus', rashi: 6, dignity: 'debilitated', isRetrograde: true },
  { id: 'saturn', rashi: 1, isRetrograde: true },
  { id: 'rahu', rashi: 11 },
  { id: 'ketu', rashi: 5, dignity: 'combust' },
];

const FONT = "'Helvetica Neue', 'Arial Unicode MS', Arial, sans-serif";
const PAD = 24;
const SIZE = 300 + PAD * 2;

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function chartInner(theme) {
  const layout = buildChartLayout({
    ascendantRashi: ASCENDANT,
    planets: PLANETS,
    theme,
    renderRashiLabel: (sign) => RASHI_GLYPHS[sign],
  });
  const c = theme.colors;
  const sw = theme.strokeWidth;
  const op = theme.opacity;
  const fs2 = theme.fontSizes;
  const fw = theme.fontWeights;

  const parts = [];
  parts.push(
    `<rect x="1" y="1" width="298" height="298" rx="2" fill="none" stroke="${c.frame}" stroke-width="${sw.frame}" opacity="${op.frame}"/>`,
    `<polygon points="${DIAMOND_POINTS}" fill="none" stroke="${c.frame}" stroke-width="${sw.diamond}" opacity="${op.diamond}"/>`,
    `<line x1="0" y1="0" x2="300" y2="300" stroke="${c.frame}" stroke-width="${sw.diagonals}" opacity="${op.diagonals}"/>`,
    `<line x1="300" y1="0" x2="0" y2="300" stroke="${c.frame}" stroke-width="${sw.diagonals}" opacity="${op.diagonals}"/>`,
  );

  for (const h of layout.houses) {
    parts.push(
      `<text x="${h.rashi.x}" y="${h.rashi.y}" font-size="${fs2.rashi}" fill="${c.textSecondary}" ` +
        `text-anchor="${h.rashi.anchor}" font-weight="${fw.rashi}" font-family="${FONT}" opacity="${op.rashi}">${esc(h.signLabel)}</text>`,
    );
    for (const p of h.planets) {
      parts.push(
        `<text x="${p.x}" y="${p.y}" font-size="${p.fontSize}" fill="${p.color}" ` +
          `text-anchor="middle" font-weight="${fw.planet}" font-family="${FONT}">${esc(p.text)}</text>`,
      );
    }
  }

  parts.push(
    `<text x="${ASC_LABEL_POINT.x}" y="${ASC_LABEL_POINT.y}" font-size="${fs2.asc}" fill="${c.accent}" ` +
      `text-anchor="middle" font-weight="${fw.asc}" font-family="${FONT}" opacity="${op.asc}">Asc</text>`,
  );

  return parts.join('\n    ');
}

function svgFor(theme) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <rect x="0" y="0" width="${SIZE}" height="${SIZE}" rx="16" fill="${theme.colors.background}"/>
  <g transform="translate(${PAD},${PAD})">
    ${chartInner(theme)}
  </g>
</svg>
`;
}

const PNG_SIZE = 800;

function has(bin) {
  try {
    execFileSync('sh', ['-c', `command -v ${bin}`], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Rasterise an SVG to PNG using the best backend available:
 *   1. rsvg-convert  (cross-platform, librsvg — best & most portable)
 *   2. qlmanage      (macOS Quick Look / WebKit — great font + glyph support)
 *   3. ImageMagick   (degraded: no CSS font lists, glyphs may be missing)
 * Returns the backend used, or null if none produced a PNG.
 */
function rasterize(svgPath, pngPath) {
  if (has('rsvg-convert')) {
    execFileSync('rsvg-convert', ['-w', String(PNG_SIZE), '-h', String(PNG_SIZE), '-o', pngPath, svgPath], {
      stdio: 'ignore',
    });
    return 'rsvg-convert';
  }
  if (process.platform === 'darwin' && has('qlmanage')) {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'nic-ql-'));
    execFileSync('qlmanage', ['-t', '-s', String(PNG_SIZE), '-o', tmp, svgPath], { stdio: 'ignore' });
    const produced = path.join(tmp, `${path.basename(svgPath)}.png`);
    let backend = null;
    if (fs.existsSync(produced)) {
      fs.copyFileSync(produced, pngPath);
      backend = 'qlmanage';
    }
    fs.rmSync(tmp, { recursive: true, force: true });
    if (backend) return backend;
  }
  const im = has('magick') ? 'magick' : has('convert') ? 'convert' : null;
  if (im) {
    execFileSync(im, ['-density', '288', '-background', 'none', svgPath, '-resize', `${PNG_SIZE}x${PNG_SIZE}`, pngPath], {
      stdio: 'ignore',
    });
    return im;
  }
  return null;
}

const outDir = path.resolve(__dirname, '..', 'assets');
fs.mkdirSync(outDir, { recursive: true });

const targets = [
  { name: 'chart-light', theme: lightChartTheme },
  { name: 'chart-dark', theme: darkChartTheme },
];

let anyPng = false;
let backendUsed = null;
for (const { name, theme } of targets) {
  const svgPath = path.join(outDir, `${name}.svg`);
  fs.writeFileSync(svgPath, svgFor(theme));
  console.log(`wrote ${path.relative(process.cwd(), svgPath)}`);

  const pngPath = path.join(outDir, `${name}.png`);
  const backend = rasterize(svgPath, pngPath);
  if (backend) {
    anyPng = true;
    backendUsed = backend;
    console.log(`wrote ${path.relative(process.cwd(), pngPath)}  (via ${backend})`);
  }
}

if (!anyPng) {
  console.warn('\nNo SVG rasteriser found (rsvg-convert / qlmanage / ImageMagick) — wrote SVGs only.');
} else if (backendUsed === 'magick' || backendUsed === 'convert') {
  console.warn('\nUsed ImageMagick: astrological glyphs may not render. Install librsvg for best results.');
}
