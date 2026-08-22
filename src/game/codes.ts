import { C, mixHex } from "./palette";

export const MAX_CODES = 100_000;
export const CODE_KEY = "crimson-sovereign-code-v1";
const SAVE_VERSION = 1;

const GLYPHS = "CRIMSONVAELYTHDQFK";
const THREATS = ["hushed", "stirring", "violent", "sovereign"] as const;
const FLAVORS = ["ash-veined", "code-burnt", "rift-tempered", "void-etched", "blood-quenched", "rune-forged"];

export type Threat = (typeof THREATS)[number];

export type CodeProfile = {
  code: number;
  padded: string;
  glyphs: string;
  threat: Threat;
  fogDensity: number;
  fogColor: number;
  ember: number;
  glow: number;
  droneHz: number;
  enemyHpMul: number;
  enemySpdMul: number;
  extraWraiths: number;
  extraShades: number;
  recoilMul: number;
  spreadMul: number;
  damageMul: number;
  runeScale: number;
  spireCount: number;
  floatRunes: number;
  galaxyCount: number;
  galaxySize: number;
  flavor: string;
  blurb: string;
  bossLevel: number;
};

export function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function xmur3(str: string) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

export function streamSeed(code: number, name: string): number {
  return xmur3(`${code >>> 0}:${name}`)();
}

export function padCode(n: number): string {
  const v = ((n % MAX_CODES) + MAX_CODES) % MAX_CODES;
  return String(v).padStart(5, "0");
}

export function parseCode(raw: string): number | null {
  const s = raw.trim().replace(/[^\d]/g, "");
  if (!s || s.length > 5) return null;
  const n = Number(s);
  if (!Number.isInteger(n) || n < 0 || n >= MAX_CODES) return null;
  return n;
}

export function randomCode(): number {
  return Math.floor(Math.random() * MAX_CODES);
}

function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]!;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function buildProfile(code: number): CodeProfile {
  const n = ((code % MAX_CODES) + MAX_CODES) % MAX_CODES;
  const rng = mulberry32(streamSeed(n, "profile"));
  const threat = pick(rng, THREATS);
  const flavor = pick(rng, FLAVORS);
  let glyphs = "";
  for (let i = 0; i < 6; i++) glyphs += GLYPHS[Math.floor(rng() * GLYPHS.length)]!;

  const ember = mixHex(C.ember, C.arterial, rng() * 0.35);
  const fogColor = C.void;

  const violent = threat === "violent" || threat === "sovereign";
  const blurbs: Record<Threat, string> = {
    hushed: "This code stills the fog. The galaxy turns slow and polite.",
    stirring: "This code wakes the archive. Star-arms kick harder. Shades listen.",
    violent: "This code thickens blood in the canals. The Milky Way hungers with the palace.",
    sovereign: "This code is close to her true name. The galactic core will not be kind.",
  };

  return {
    code: n,
    padded: padCode(n),
    glyphs,
    threat,
    fogDensity: lerp(0.0048, 0.0085, rng()),
    fogColor,
    ember,
    glow: lerp(0.9, 1.8, rng()),
    droneHz: lerp(40, 58, rng()),
    enemyHpMul: lerp(0.88, violent ? 1.28 : 1.12, rng()),
    enemySpdMul: lerp(0.92, violent ? 1.22 : 1.08, rng()),
    extraWraiths: Math.floor(rng() * (violent ? 5 : 3)),
    extraShades: Math.floor(rng() * (violent ? 3 : 2)),
    recoilMul: lerp(0.86, 1.22, rng()),
    spreadMul: lerp(0.8, 1.35, rng()),
    damageMul: lerp(0.94, 1.12, rng()),
    runeScale: lerp(0.9, 1.25, rng()),
    spireCount: 9 + Math.floor(rng() * 8),
    floatRunes: 14 + Math.floor(rng() * 14),
    galaxyCount: 1400 + Math.floor(rng() * 1400),
    galaxySize: lerp(0.38, 0.72, rng()),
    flavor,
    blurb: blurbs[threat],
    bossLevel: zoneBossLevel(n, 5),
  };
}

export function zoneBossLevel(code: number, zone: number): number {
  const n = ((code % MAX_CODES) + MAX_CODES) % MAX_CODES;
  return 1 + ((Math.imul(n + 1, 7919) + Math.imul(zone + 1, 104729)) >>> 0) % 10000;
}

export function describeCode(code: number): string {
  const p = buildProfile(code);
  return `${p.threat} · ${p.flavor} · ${p.glyphs}`;
}

export function persistCode(seed: number) {
  try {
    localStorage.setItem(CODE_KEY, JSON.stringify({ version: SAVE_VERSION, seed: ((seed % MAX_CODES) + MAX_CODES) % MAX_CODES }));
  } catch {
    /* ignore */
  }
}

export function shareCodeUrl(seed: number) {
  try {
    const u = new URL(window.location.href);
    u.searchParams.set("code", padCode(seed));
    window.history.replaceState(null, "", `${u.pathname}${u.search}${u.hash}`);
  } catch {
    /* ignore */
  }
}

export function cycleLink(seed: number): string {
  try {
    const u = new URL(window.location.href);
    u.searchParams.set("code", padCode(seed));
    return u.toString();
  } catch {
    return `?code=${padCode(seed)}`;
  }
}

export function loadSavedCode(): number {
  try {
    const q = new URLSearchParams(window.location.search);
    const fromUrl = parseCode(q.get("code") || q.get("seed") || "");
    if (fromUrl !== null) {
      persistCode(fromUrl);
      shareCodeUrl(fromUrl);
      return fromUrl;
    }
  } catch {
    /* ignore */
  }
  try {
    const raw = localStorage.getItem(CODE_KEY);
    if (!raw) {
      const n = 63821;
      persistCode(n);
      shareCodeUrl(n);
      return n;
    }
    const parsed = JSON.parse(raw) as { version?: number; seed?: number };
    if (parsed.version === SAVE_VERSION && typeof parsed.seed === "number") {
      const n = parseCode(String(parsed.seed));
      if (n !== null) {
        shareCodeUrl(n);
        return n;
      }
    }
  } catch {
    /* ignore */
  }
  const n = 63821;
  persistCode(n);
  shareCodeUrl(n);
  return n;
}
