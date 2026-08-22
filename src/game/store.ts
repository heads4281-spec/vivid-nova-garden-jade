import { create } from "zustand";
import { buildProfile, persistCode, randomCode, parseCode, shareCodeUrl, type CodeProfile } from "./codes";
import type { NameId } from "./story";
import type { MapFrame } from "./map-art";
import type { CharacterId } from "./arsenal";

export type Screen = "title" | "briefing" | "playing" | "paused" | "dead" | "victory" | "codex" | "settings";

export type StoryMoment = {
  title: string;
  epithet: string;
  verse: string[];
  body: string;
  portrait?: string;
};

export type SkillCast = {
  id: string;
  name: string;
  art: string;
  kind: string;
};

export type HudSnapshot = {
  health: number;
  maxHealth: number;
  ammo: number;
  mag: number;
  weapon: string;
  weaponId: number;
  charging: number;
  reloading: boolean;
  zone: string;
  objective: string;
  message: string;
  runes: NameId[];
  kills: number;
  hitmarker: number;
  damageFlash: number;
  locked: boolean;
  boss: { name: string; hp: number; max: number; level: number } | null;
  moment: StoryMoment | null;
  code: string;
  prompt: string;
  promptKey: string;
  pad: string;
  event: { id: string; name: string; desc: string } | null;
  ads: boolean;
  scoped: boolean;
  cam: CamMode;
  bag: boolean;
  atlas: boolean;
  tree: boolean;
  map: MapFrame;
  fortitude: number;
  skillPts: number;
  skills: string[];
  activeSkill: string;
  skillCd: number;
  skillCast: SkillCast | null;
  recoilHeat: number;
};

export type CamMode = "fps" | "tps" | "spec";
export type Quality = 360 | 720 | 1080;

export type CloudSave = {
  code: string;
  runes: string[];
  skills: string[];
  skillPts: number;
  characterId: string;
};

export type Settings = {
  sensitivity: number;
  invertY: boolean;
  shake: boolean;
  volume: number;
  muted: boolean;
  gyro: boolean;
  quality: Quality;
  immortal: boolean;
  cam: CamMode;
  character: CharacterId;
};

const SETTINGS_KEY = "crimson-sovereign-settings-v3";

function defaultSettings(): Settings {
  const coarse = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  return {
    sensitivity: 0.0024,
    invertY: false,
    shake: true,
    volume: 0.72,
    muted: false,
    gyro: false,
    quality: coarse ? 720 : 1080,
    immortal: true,
    cam: "fps",
    character: "warden",
  };
}

const emptyHud = (): HudSnapshot => ({
  health: 100,
  maxHealth: 100,
  ammo: 22,
  mag: 22,
  weapon: "Spark Rifle",
  weaponId: 0,
  charging: 0,
  reloading: false,
  zone: "The Threshold",
  objective: "Claim the outer Names",
  message: "",
  runes: [],
  kills: 0,
  hitmarker: 0,
  damageFlash: 0,
  locked: false,
  boss: null,
  moment: null,
  code: "63821",
  prompt: "",
  promptKey: "F",
  pad: "",
  event: null,
  ads: false,
  scoped: false,
  cam: "fps",
  bag: false,
  atlas: false,
  tree: false,
  map: { x: 0, z: 68, yaw: 0, marks: [], runes: [], gateOpen: false },
  fortitude: 0,
  skillPts: 2,
  skills: ["ember-fortitude"],
  activeSkill: "ember-fortitude",
  skillCd: 0,
  skillCast: null,
  recoilHeat: 0,
});

type GameStore = {
  screen: Screen;
  settingsTo: Screen;
  runId: number;
  seed: number;
  profile: CodeProfile;
  hud: HudSnapshot;
  settings: Settings;
  cloudSave: CloudSave | null;
  setScreen: (s: Screen) => void;
  startRun: () => void;
  openSettings: (from: Screen) => void;
  openCodex: (from: Screen) => void;
  setHud: (h: Partial<HudSnapshot>) => void;
  patchSettings: (s: Partial<Settings>) => void;
  setSeed: (n: number) => void;
  rollSeed: () => void;
  loadCode: (raw: string) => boolean;
  setCharacter: (id: CharacterId) => void;
  setCloudSave: (s: CloudSave | null) => void;
};

function applySeed(seed: number) {
  persistCode(seed);
  shareCodeUrl(seed);
  return { seed, profile: buildProfile(seed) };
}

export const useGame = create<GameStore>((set, get) => ({
  screen: "title",
  settingsTo: "title",
  runId: 0,
  seed: 63821,
  profile: buildProfile(63821),
  hud: emptyHud(),
  settings: defaultSettings(),
  cloudSave: null,
  setScreen: (screen) => set({ screen }),
  startRun: () => set({ screen: "playing", runId: get().runId + 1, hud: emptyHud() }),
  openSettings: (from) => set({ screen: "settings", settingsTo: from }),
  openCodex: (from) => set({ screen: "codex", settingsTo: from }),
  setHud: (h) => set({ hud: { ...get().hud, ...h } }),
  patchSettings: (s) => {
    const settings = { ...get().settings, ...s };
    set({ settings });
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      /* ignore */
    }
  },
  setSeed: (n) => set(applySeed(n)),
  rollSeed: () => set(applySeed(randomCode())),
  loadCode: (raw) => {
    const n = parseCode(raw);
    if (n === null) return false;
    set(applySeed(n));
    return true;
  },
  setCharacter: (id) => get().patchSettings({ character: id }),
  setCloudSave: (cloudSave) => set({ cloudSave }),
}));
