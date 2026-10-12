/**
 * `color-mix(in oklab, a p%, b)` for React Native, which has no CSS color-mix.
 * Results are cached — routine colors come from a small fixed palette.
 */

type Rgb = [number, number, number];

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toSrgb = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

const parseHex = (hex: string): Rgb => {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => toLinear(v / 255)) as Rgb;
};

const toOklab = ([r, g, b]: Rgb): Rgb => {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
};

const fromOklab = ([L, a, b]: Rgb): Rgb => {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
};

const toHex = (rgb: Rgb) =>
  '#' +
  rgb
    .map((c) => Math.round(Math.min(1, Math.max(0, toSrgb(c))) * 255))
    .map((v) => v.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();

const cache = new Map<string, string>();

/** Mix `pct` (0–1) of color `a` into color `b`, in oklab space. */
export const mixOklab = (a: string, pct: number, b: string) => {
  const key = `${a}|${pct}|${b}`;
  let hit = cache.get(key);
  if (!hit) {
    const A = toOklab(parseHex(a));
    const B = toOklab(parseHex(b));
    hit = toHex(fromOklab(A.map((v, i) => v * pct + B[i] * (1 - pct)) as Rgb));
    cache.set(key, hit);
  }
  return hit;
};

/** Checklist screen background: routine color 18% into the kid ground. */
export const routineTint = (color: string) => mixOklab(color, 0.18, '#FFF6EA');

/** Done step row background: routine color 55% into white. */
export const doneTint = (color: string) => mixOklab(color, 0.55, '#FFFFFF');
