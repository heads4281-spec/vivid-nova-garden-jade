import { VIEW, type WeaponDef } from "./arsenal";
import { mulberry32, streamSeed } from "./codes";

const PATTERN_SHOTS = 36;
const CAM_PITCH_MAX = 0.22;
const CAM_YAW_MAX = 0.16;
const CAM_ROLL_MAX = 0.08;

export type RecoilProfile = {
  id: number;
  /** Interleaved [pitch01, yawSigned] per shot. Pitch is 0..1, yaw is ~-1..1. */
  pattern: Float32Array;
  kickPitch: number;
  kickYaw: number;
  kickRoll: number;
  firstShot: number;
  ads: number;
  camStiff: number;
  camDamp: number;
  vmStiff: number;
  vmDamp: number;
  snap: number;
  idleReset: number;
  heatPerShot: number;
  heatDecay: number;
  spreadHeat: number;
  vmKickZ: number;
  vmKickY: number;
  vmKickX: number;
  vmPitch: number;
  vmYaw: number;
  vmRoll: number;
  fovPunch: number;
  melee: boolean;
};

type Archetype = {
  pitch: number;
  yaw: number;
  roll: number;
  first: number;
  ads: number;
  camStiff: number;
  vmStiff: number;
  snap: number;
  idle: number;
  heat: number;
  heatDecay: number;
  spreadHeat: number;
  vmZ: number;
  vmY: number;
  vmX: number;
  vmPitch: number;
  vmYaw: number;
  vmRoll: number;
  fov: number;
  melee: boolean;
  vertHold: number;
  yawFreq: number;
  yawAmp: number;
};

const ARCH: Record<number, Partial<Archetype>> = {
  [VIEW.rifle]: {
    pitch: 1,
    yaw: 0.38,
    roll: 0.22,
    first: 1.18,
    ads: 0.48,
    camStiff: 92,
    vmStiff: 78,
    snap: 0.42,
    idle: 0.28,
    heat: 0.16,
    heatDecay: 1.35,
    spreadHeat: 0.85,
    vmZ: 0.055,
    vmY: 0.018,
    vmPitch: 0.11,
    vmRoll: 0.07,
    fov: 2.4,
    vertHold: 0.22,
    yawFreq: 0.72,
    yawAmp: 0.72,
  },
  [VIEW.smg]: {
    pitch: 0.72,
    yaw: 0.92,
    roll: 0.34,
    first: 0.92,
    ads: 0.62,
    camStiff: 118,
    vmStiff: 108,
    snap: 0.55,
    idle: 0.16,
    heat: 0.11,
    heatDecay: 2.1,
    spreadHeat: 1.15,
    vmZ: 0.038,
    vmY: 0.012,
    vmPitch: 0.08,
    vmRoll: 0.1,
    fov: 1.6,
    vertHold: 0.12,
    yawFreq: 1.15,
    yawAmp: 1,
  },
  [VIEW.sniper]: {
    pitch: 1.85,
    yaw: 0.16,
    roll: 0.12,
    first: 1.05,
    ads: 0.28,
    camStiff: 52,
    vmStiff: 46,
    snap: 0.28,
    idle: 0.55,
    heat: 0.55,
    heatDecay: 0.7,
    spreadHeat: 0.35,
    vmZ: 0.1,
    vmY: 0.04,
    vmPitch: 0.2,
    vmRoll: 0.05,
    fov: 5.2,
    vertHold: 0.55,
    yawFreq: 0.4,
    yawAmp: 0.28,
  },
  [VIEW.rail]: {
    pitch: 1.35,
    yaw: 0.28,
    roll: 0.2,
    first: 1.1,
    ads: 0.42,
    camStiff: 74,
    vmStiff: 64,
    snap: 0.38,
    idle: 0.34,
    heat: 0.28,
    heatDecay: 1.05,
    spreadHeat: 0.55,
    vmZ: 0.072,
    vmY: 0.022,
    vmPitch: 0.14,
    vmRoll: 0.06,
    fov: 3.4,
    vertHold: 0.3,
    yawFreq: 0.55,
    yawAmp: 0.5,
  },
  [VIEW.beam]: {
    pitch: 1.55,
    yaw: 0.22,
    roll: 0.16,
    first: 1,
    ads: 0.4,
    camStiff: 58,
    vmStiff: 52,
    snap: 0.3,
    idle: 0.48,
    heat: 0.4,
    heatDecay: 0.85,
    spreadHeat: 0.2,
    vmZ: 0.09,
    vmY: 0.03,
    vmPitch: 0.16,
    vmRoll: 0.05,
    fov: 4.4,
    vertHold: 0.4,
    yawFreq: 0.35,
    yawAmp: 0.32,
  },
  [VIEW.caster]: {
    pitch: 1.42,
    yaw: 0.44,
    roll: 0.28,
    first: 1.08,
    ads: 0.55,
    camStiff: 64,
    vmStiff: 58,
    snap: 0.34,
    idle: 0.4,
    heat: 0.32,
    heatDecay: 0.95,
    spreadHeat: 0.4,
    vmZ: 0.08,
    vmY: 0.028,
    vmPitch: 0.15,
    vmRoll: 0.08,
    fov: 3.8,
    vertHold: 0.35,
    yawFreq: 0.5,
    yawAmp: 0.62,
  },
  [VIEW.axe]: {
    pitch: 0.7,
    yaw: 0.55,
    roll: 0.45,
    first: 1,
    ads: 1,
    camStiff: 70,
    vmStiff: 62,
    snap: 0.36,
    idle: 0.32,
    heat: 0.2,
    heatDecay: 1.6,
    spreadHeat: 0,
    vmZ: 0.06,
    vmY: 0.04,
    vmX: 0.08,
    vmPitch: 0.28,
    vmYaw: 0.22,
    vmRoll: 0.32,
    fov: 2.2,
    melee: true,
    vertHold: 0.15,
    yawAmp: 0.8,
  },
  [VIEW.sword]: {
    pitch: 0.45,
    yaw: 0.4,
    roll: 0.38,
    first: 1,
    ads: 1,
    camStiff: 88,
    vmStiff: 84,
    snap: 0.5,
    idle: 0.2,
    heat: 0.12,
    heatDecay: 2.2,
    spreadHeat: 0,
    vmZ: 0.035,
    vmY: 0.02,
    vmX: 0.07,
    vmPitch: 0.18,
    vmYaw: 0.28,
    vmRoll: 0.24,
    fov: 1.4,
    melee: true,
    yawAmp: 0.7,
  },
  [VIEW.scythe]: {
    pitch: 0.55,
    yaw: 0.62,
    roll: 0.5,
    first: 1,
    ads: 1,
    camStiff: 66,
    vmStiff: 58,
    snap: 0.34,
    idle: 0.3,
    heat: 0.18,
    heatDecay: 1.5,
    spreadHeat: 0,
    vmZ: 0.05,
    vmY: 0.03,
    vmX: 0.1,
    vmPitch: 0.22,
    vmYaw: 0.32,
    vmRoll: 0.38,
    fov: 2,
    melee: true,
    yawAmp: 0.9,
  },
  [VIEW.lance]: {
    pitch: 0.78,
    yaw: 0.18,
    roll: 0.14,
    first: 1,
    ads: 1,
    camStiff: 80,
    vmStiff: 72,
    snap: 0.4,
    idle: 0.26,
    heat: 0.16,
    heatDecay: 1.7,
    spreadHeat: 0,
    vmZ: 0.11,
    vmY: 0.01,
    vmX: 0.02,
    vmPitch: 0.12,
    vmYaw: 0.06,
    vmRoll: 0.08,
    fov: 1.8,
    melee: true,
    yawAmp: 0.25,
  },
  [VIEW.hammer]: {
    pitch: 1.05,
    yaw: 0.32,
    roll: 0.28,
    first: 1,
    ads: 1,
    camStiff: 48,
    vmStiff: 42,
    snap: 0.26,
    idle: 0.42,
    heat: 0.3,
    heatDecay: 1.1,
    spreadHeat: 0,
    vmZ: 0.09,
    vmY: 0.05,
    vmX: 0.04,
    vmPitch: 0.32,
    vmYaw: 0.12,
    vmRoll: 0.18,
    fov: 3.2,
    melee: true,
    yawAmp: 0.45,
  },
  [VIEW.fist]: {
    pitch: 0.38,
    yaw: 0.42,
    roll: 0.3,
    first: 1,
    ads: 1,
    camStiff: 110,
    vmStiff: 120,
    snap: 0.62,
    idle: 0.14,
    heat: 0.1,
    heatDecay: 2.6,
    spreadHeat: 0,
    vmZ: 0.07,
    vmY: 0.015,
    vmX: 0.05,
    vmPitch: 0.1,
    vmYaw: 0.16,
    vmRoll: 0.14,
    fov: 1.1,
    melee: true,
    yawAmp: 0.55,
  },
};

const FALLBACK: Archetype = {
  pitch: 1,
  yaw: 0.4,
  roll: 0.22,
  first: 1.1,
  ads: 0.5,
  camStiff: 86,
  vmStiff: 74,
  snap: 0.4,
  idle: 0.28,
  heat: 0.18,
  heatDecay: 1.4,
  spreadHeat: 0.7,
  vmZ: 0.05,
  vmY: 0.016,
  vmX: 0.012,
  vmPitch: 0.1,
  vmYaw: 0.05,
  vmRoll: 0.07,
  fov: 2.2,
  melee: false,
  vertHold: 0.2,
  yawFreq: 0.7,
  yawAmp: 0.7,
};

const cache = new Map<number, RecoilProfile>();

function dampFor(stiff: number, punchy: boolean) {
  const critical = 2 * Math.sqrt(Math.max(1, stiff));
  return critical * (punchy ? 0.58 : 0.78);
}

function hash01(seed: number, shot: number) {
  const rng = mulberry32(streamSeed((seed + shot * 7919) >>> 0, "recoil-j"));
  return rng();
}

function makePattern(weaponId: number, arch: Archetype): Float32Array {
  const rng = mulberry32(streamSeed(weaponId, "recoil-pattern"));
  const freq1 = arch.yawFreq * (0.75 + rng() * 0.55);
  const freq2 = 0.17 + rng() * 0.28;
  const phase = rng() * Math.PI * 2;
  const lean = (rng() - 0.5) * 0.42;
  const jitter = 0.07 + rng() * 0.1;
  const out = new Float32Array(PATTERN_SHOTS * 2);
  for (let i = 0; i < PATTERN_SHOTS; i++) {
    const t = i / (PATTERN_SHOTS - 1);
    const climb = 1 - t * (1 - arch.vertHold);
    const fan = Math.min(1, i / 5.5);
    const yaw =
      (Math.sin(i * freq1 + phase) * arch.yawAmp * fan +
        Math.sin(i * freq2 * 2.1 + phase * 0.4) * arch.yawAmp * 0.35 * fan +
        lean * fan +
        (hash01(weaponId, i) - 0.5) * jitter * fan);
    out[i * 2] = climb;
    out[i * 2 + 1] = Math.max(-1.35, Math.min(1.35, yaw));
  }
  return out;
}

export function profileFor(w: WeaponDef): RecoilProfile {
  const hit = cache.get(w.id);
  if (hit) return hit;
  const arch: Archetype = { ...FALLBACK, ...(ARCH[w.view] ?? {}) };
  if (w.fire === "melee") arch.melee = true;
  if (w.automatic && !arch.melee) {
    arch.camStiff *= 1.08;
    arch.heat *= 0.85;
    arch.idle *= 0.85;
  }
  const mag = Math.max(0.006, w.recoil);
  const p: RecoilProfile = {
    id: w.id,
    pattern: makePattern(w.id, arch),
    kickPitch: mag * 1.85 * arch.pitch,
    kickYaw: mag * 1.15 * arch.yaw,
    kickRoll: mag * 0.95 * arch.roll,
    firstShot: arch.first,
    ads: arch.ads,
    camStiff: arch.camStiff,
    camDamp: dampFor(arch.camStiff, false),
    vmStiff: arch.vmStiff,
    vmDamp: dampFor(arch.vmStiff, true),
    snap: arch.snap,
    idleReset: arch.idle,
    heatPerShot: arch.heat,
    heatDecay: arch.heatDecay,
    spreadHeat: arch.spreadHeat,
    vmKickZ: arch.vmZ * (0.7 + mag * 12),
    vmKickY: arch.vmY * (0.7 + mag * 10),
    vmKickX: arch.vmX * (0.7 + mag * 10),
    vmPitch: arch.vmPitch * (0.75 + mag * 8),
    vmYaw: arch.vmYaw * (0.75 + mag * 8),
    vmRoll: arch.vmRoll * (0.75 + mag * 8),
    fovPunch: arch.fov * (0.6 + mag * 8),
    melee: arch.melee,
  };
  cache.set(w.id, p);
  return p;
}

function spring(pos: number, vel: number, stiff: number, damp: number, dt: number) {
  vel += (-stiff * pos - damp * vel) * dt;
  pos += vel * dt;
  if (Math.abs(pos) < 1e-5 && Math.abs(vel) < 1e-4) return [0, 0] as const;
  return [pos, vel] as const;
}

export class RecoilSim {
  camPitch = 0;
  camYaw = 0;
  camRoll = 0;
  vPitch = 0;
  vYaw = 0;
  vRoll = 0;
  vmX = 0;
  vmY = 0;
  vmZ = 0;
  vmVX = 0;
  vmVY = 0;
  vmVZ = 0;
  vmPitch = 0;
  vmYaw = 0;
  vmRoll = 0;
  vmVPitch = 0;
  vmVYaw = 0;
  vmVRoll = 0;
  fov = 0;
  vFov = 0;
  trX = 0;
  trY = 0;
  trPitch = 0;
  camTr = 0;
  shot = 0;
  idle = 0;
  heat = 0;
  weaponId = -1;
  private _p: RecoilProfile | null = null;

  profile(w: WeaponDef | undefined | null) {
    if (!w) return this._p;
    if (!this._p || this._p.id !== w.id) this._p = profileFor(w);
    return this._p;
  }

  fire(
    w: WeaponDef,
    opts: { ads?: boolean; mul?: number; charge?: number; shake?: boolean } = {},
  ) {
    const p = this.profile(w)!;
    if (this.weaponId !== w.id) {
      this.reset();
      this.weaponId = w.id;
    }
    if (this.idle > p.idleReset) this.shot = 0;

    const idx = this.shot % PATTERN_SHOTS;
    const pitchN = p.pattern[idx * 2] ?? 1;
    const yawN = p.pattern[idx * 2 + 1] ?? 0;
    const first = this.shot === 0 ? p.firstShot : 1;
    const ads = opts.ads && !p.melee ? p.ads : 1;
    const ch = opts.charge ?? 0;
    const charge = ch > 0 ? 0.62 + ch * 0.7 : 1;
    const shake = opts.shake === false ? 0.55 : 1;
    const mul = (opts.mul ?? 1) * first * ads * charge;

    const impP = p.kickPitch * pitchN * mul;
    const impY = p.kickYaw * yawN * mul;
    const impR = p.kickRoll * -yawN * mul * shake;

    const snap = p.snap;
    this.camPitch += impP * snap;
    this.camYaw += impY * snap;
    this.camRoll += impR * snap;
    this.vPitch += impP * (12 + (1 - snap) * 10);
    this.vYaw += impY * (10 + (1 - snap) * 8);
    this.vRoll += impR * (14 + (1 - snap) * 8);

    const side = yawN === 0 ? (this.shot % 2 === 0 ? 1 : -1) : Math.sign(yawN) || 1;
    this.vmZ += p.vmKickZ * mul * 0.35;
    this.vmVZ += p.vmKickZ * mul * 18;
    this.vmY += p.vmKickY * mul * 0.3;
    this.vmVY += p.vmKickY * mul * 16;
    this.vmX += p.vmKickX * side * mul * 0.35;
    this.vmVX += p.vmKickX * side * mul * 14;
    this.vmPitch += p.vmPitch * pitchN * mul * 0.4;
    this.vmVPitch += p.vmPitch * pitchN * mul * 16;
    this.vmYaw += p.vmYaw * side * mul * 0.35;
    this.vmVYaw += p.vmYaw * side * mul * 14;
    this.vmRoll += p.vmRoll * -side * mul * 0.4;
    this.vmVRoll += p.vmRoll * -side * mul * 16;

    this.fov += p.fovPunch * mul * 0.25;
    this.vFov += p.fovPunch * mul * 10;

    this.shot += 1;
    this.idle = 0;
    this.heat = Math.min(1, this.heat + p.heatPerShot * (0.65 + ads * 0.35));
  }

  tick(dt: number, w: WeaponDef | undefined | null, extra?: { charge?: number; time?: number; ads?: boolean }) {
    const p = this.profile(w);
    const stiff = p?.camStiff ?? 86;
    const damp = p?.camDamp ?? dampFor(86, false);
    const vs = p?.vmStiff ?? 74;
    const vd = p?.vmDamp ?? dampFor(74, true);
    const heatDecay = p?.heatDecay ?? 1.4;

    this.idle += dt;
    if (p && this.idle > p.idleReset && this.shot > 0 && Math.abs(this.vPitch) < 0.05) {
      this.shot = 0;
    }
    this.heat = Math.max(0, this.heat - dt * heatDecay * (this.idle > 0.08 ? 1 : 0.35));

    let a, b;
    [a, b] = spring(this.camPitch, this.vPitch, stiff, damp, dt);
    this.camPitch = a;
    this.vPitch = b;
    [a, b] = spring(this.camYaw, this.vYaw, stiff, damp, dt);
    this.camYaw = a;
    this.vYaw = b;
    [a, b] = spring(this.camRoll, this.vRoll, stiff * 1.15, damp, dt);
    this.camRoll = a;
    this.vRoll = b;
    [a, b] = spring(this.vmX, this.vmVX, vs, vd, dt);
    this.vmX = a;
    this.vmVX = b;
    [a, b] = spring(this.vmY, this.vmVY, vs, vd, dt);
    this.vmY = a;
    this.vmVY = b;
    [a, b] = spring(this.vmZ, this.vmVZ, vs, vd, dt);
    this.vmZ = a;
    this.vmVZ = b;
    [a, b] = spring(this.vmPitch, this.vmVPitch, vs, vd, dt);
    this.vmPitch = a;
    this.vmVPitch = b;
    [a, b] = spring(this.vmYaw, this.vmVYaw, vs, vd, dt);
    this.vmYaw = a;
    this.vmVYaw = b;
    [a, b] = spring(this.vmRoll, this.vmVRoll, vs, vd, dt);
    this.vmRoll = a;
    this.vmVRoll = b;
    [a, b] = spring(this.fov, this.vFov, 70, dampFor(70, false), dt);
    this.fov = a;
    this.vFov = b;

    this.camPitch = clamp(this.camPitch, -CAM_PITCH_MAX, CAM_PITCH_MAX);
    this.camYaw = clamp(this.camYaw, -CAM_YAW_MAX, CAM_YAW_MAX);
    this.camRoll = clamp(this.camRoll, -CAM_ROLL_MAX, CAM_ROLL_MAX);

    const charge = extra?.charge ?? 0;
    if (charge > 0.04) {
      const t = (extra?.time ?? 0) * 36;
      const s = charge * charge;
      this.trX = Math.sin(t * 1.73) * 0.01 * s;
      this.trY = Math.sin(t * 2.21) * 0.008 * s;
      this.trPitch = Math.sin(t * 1.11) * 0.018 * s;
      this.camTr = Math.sin(t * 0.9) * 0.004 * s;
    } else {
      this.trX = 0;
      this.trY = 0;
      this.trPitch = 0;
      this.camTr = 0;
    }
  }

  spreadMul() {
    const p = this._p;
    const heat = this.heat;
    const climb = Math.min(1, this.shot / 10);
    return 1 + heat * (p?.spreadHeat ?? 0.7) + climb * 0.12;
  }

  heat01() {
    return Math.max(this.heat, Math.min(1, Math.abs(this.camPitch) * 6 + Math.abs(this.vmZ) * 8));
  }

  reset() {
    this.camPitch = this.camYaw = this.camRoll = 0;
    this.vPitch = this.vYaw = this.vRoll = 0;
    this.vmX = this.vmY = this.vmZ = 0;
    this.vmVX = this.vmVY = this.vmVZ = 0;
    this.vmPitch = this.vmYaw = this.vmRoll = 0;
    this.vmVPitch = this.vmVYaw = this.vmVRoll = 0;
    this.fov = this.vFov = 0;
    this.trX = this.trY = this.trPitch = this.camTr = 0;
    this.shot = 0;
    this.idle = 0;
    this.heat = 0;
  }

  dump() {
    return {
      shot: this.shot,
      heat: +this.heat.toFixed(3),
      cam: [+this.camPitch.toFixed(4), +this.camYaw.toFixed(4), +this.camRoll.toFixed(4)],
      vm: [+this.vmX.toFixed(3), +this.vmY.toFixed(3), +this.vmZ.toFixed(3)],
    };
  }
}

function clamp(n: number, a: number, b: number) {
  return n < a ? a : n > b ? b : n;
}
