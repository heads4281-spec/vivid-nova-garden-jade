/** Offline-first run save. Cloud auth is optional; this always writes locally. */

export type Checkpoint = {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  yaw: number;
};

export type RunSave = {
  version: 4;
  code: string;
  runes: string[];
  skills: string[];
  skillPts: number;
  characterId: string;
  checkpoint: Checkpoint | null;
  pity: Record<string, number>;
  kills: number;
};

const KEY = "crimson-sovereign-run-v4";

export const CHECKPOINTS: Checkpoint[] = [
  { id: "threshold", name: "The Threshold", x: 0, y: 0, z: 68, yaw: 0 },
  { id: "vaelith", name: "Court of the First Flame", x: 6, y: 0, z: -78, yaw: Math.PI },
  { id: "rynara", name: "The Rune Archive", x: -72, y: 0, z: 8, yaw: Math.PI / 2 },
  { id: "sanguara", name: "Blood Canals", x: 74, y: 0, z: 10, yaw: -Math.PI / 2 },
  { id: "nyxara", name: "The Night Ascendant", x: -46, y: 8.4, z: -48, yaw: 0.4 },
  { id: "gate", name: "Palace Gate", x: 0, y: 0, z: -38, yaw: 0 },
  { id: "throne", name: "Throne Approach", x: 0, y: 0, z: -8, yaw: 0 },
  { id: "kaelith", name: "Kaelith Forge", x: 78, y: 0, z: 68, yaw: -Math.PI / 2 },
  { id: "vespera", name: "Vespera Hollow", x: -78, y: 0, z: 68, yaw: Math.PI / 2 },
  { id: "ankh-spire", name: "Ankh Spire", x: 78, y: 0, z: -72, yaw: Math.PI },
];

export function emptySave(code = "63821"): RunSave {
  return {
    version: 4,
    code,
    runes: [],
    skills: ["ember-fortitude"],
    skillPts: 2,
    characterId: "warden",
    checkpoint: CHECKPOINTS[0] ?? null,
    pity: {},
    kills: 0,
  };
}

export function loadRun(): RunSave | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RunSave;
    if (parsed?.version !== 4) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveRun(save: RunSave) {
  try {
    localStorage.setItem(KEY, JSON.stringify(save));
    window.dispatchEvent(new CustomEvent("crimson-run-save"));
  } catch {
    /* quota / ssr */
  }
}

export function nearestCheckpoint(x: number, z: number, max = 4.2): Checkpoint | null {
  let best: Checkpoint | null = null;
  let d0 = max;
  for (const c of CHECKPOINTS) {
    const d = Math.hypot(c.x - x, c.z - z);
    if (d < d0) {
      d0 = d;
      best = c;
    }
  }
  return best;
}
