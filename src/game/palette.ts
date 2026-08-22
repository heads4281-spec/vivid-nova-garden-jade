/** Exact ratios from the generated art. Intensity may shift; hue stays in-bounds. */
export const C = {
  void: 0x020008,
  crimson: 0xc41e3a,
  arterial: 0xff0033,
  ember: 0xff4400,
  gold: 0xd4a017,
  blood: 0x8b0000,
  night: 0x0a0015,
  ankh: 0xff1144,
} as const;

export const RATIO = {
  void: 0.42,
  crimson: 0.18,
  arterial: 0.15,
  ember: 0.08,
  gold: 0.06,
  blood: 0.05,
  night: 0.04,
  ankh: 0.02,
} as const;

export const NAME_COLOR: Record<string, number> = {
  vaelith: C.ember,
  rynara: C.gold,
  sanguara: C.blood,
  nyxara: C.night,
  eryndra: C.crimson,
  aelith: C.ankh,
};

export function hexRgb(hex: number) {
  return { r: (hex >> 16) & 255, g: (hex >> 8) & 255, b: hex & 255 };
}

export function mixHex(a: number, b: number, t: number) {
  const A = hexRgb(a);
  const B = hexRgb(b);
  const r = Math.round(A.r + (B.r - A.r) * t);
  const g = Math.round(A.g + (B.g - A.g) * t);
  const bl = Math.round(A.b + (B.b - A.b) * t);
  return (r << 16) | (g << 8) | bl;
}

/** Seed-driven hue jitter that never leaves the art ratios. */
export function colourShift(base: number, seed: number, amount = 0.04) {
  const r = ((base >> 16) & 255) / 255;
  const g = ((base >> 8) & 255) / 255;
  const b = (base & 255) / 255;
  const n = Math.sin(base * 12.9898 + seed * 78.233) * 43758.5453;
  const shift = (n - Math.floor(n) - 0.5) * amount;
  const rr = Math.min(1, Math.max(0, r + shift));
  const gg = Math.min(1, Math.max(0, g + shift * 0.6));
  const bb = Math.min(1, Math.max(0, b + shift * 0.3));
  return (Math.round(rr * 255) << 16) | (Math.round(gg * 255) << 8) | Math.round(bb * 255);
}
