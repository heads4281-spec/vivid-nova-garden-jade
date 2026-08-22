import { mulberry32, streamSeed } from "./codes";
import { getWorldMoment, padMoment, type MomentFx, type WorldMoment } from "./moments";

export type MomentFlags = {
  jumpMul: number;
  emberFloor: boolean;
  night: number;
  sentinelCd: number;
  sparkInfinite: boolean;
  pulseDmg: number;
  pulseRate: number;
  pulseInfinite: boolean;
  ankhMul: number;
  confuse: boolean;
  slow: number;
  healthMul: number;
  resist: number;
  sparkExplode: boolean;
  chainBeam: boolean;
  pullLance: boolean;
  skySpin: number;
  regen: number;
  magnet: boolean;
  bloodPull: number;
  chainDeath: boolean;
};

export function defaultFlags(): MomentFlags {
  return {
    jumpMul: 1,
    emberFloor: false,
    night: 1,
    sentinelCd: 1,
    sparkInfinite: false,
    pulseDmg: 1,
    pulseRate: 1,
    pulseInfinite: false,
    ankhMul: 1,
    confuse: false,
    slow: 1,
    healthMul: 1,
    resist: 0,
    sparkExplode: false,
    chainBeam: false,
    pullLance: false,
    skySpin: 1,
    regen: 0,
    magnet: false,
    bloodPull: 0,
    chainDeath: false,
  };
}

export type MomentHost = {
  announce: (m: WorldMoment) => void;
  spawn: (kind: "wraith" | "sentinel" | "construct" | "shade", x: number, z: number) => void;
  gift: (kind: "ammo" | "health", x: number, z: number) => void;
  heal: (n: number) => void;
  stagger: () => void;
  chargeAnkh: (n: number) => void;
  gateBite: () => void;
  shove: () => void;
  pos: () => { x: number; z: number };
};

type Kind = "wraith" | "sentinel" | "construct" | "shade";

/** Compact palace script for named moments 0001–0100. */
type Spec = {
  ember?: 1;
  jump?: number;
  night?: number;
  sent?: number;
  sparkInf?: 1;
  pulseDmg?: number;
  pulseRate?: number;
  pulseInf?: 1;
  ankhMul?: number;
  confuse?: 1;
  slow?: number;
  hpMul?: number;
  resist?: number;
  sparkX?: 1;
  chain?: 1;
  pull?: 1;
  sky?: number;
  regen?: number;
  magnet?: 1;
  tide?: number;
  chainDeath?: 1;
  spawn?: [Kind, number, number, number];
  gifts?: number;
  heal?: number;
  stagger?: 1;
  ankh?: number;
  bite?: 1;
  shove?: 1;
};

const SPEC: Spec[] = [
  { ember: 1 },
  { slow: 0.55 },
  { spawn: ["shade", 70, 0, 5], tide: 4 },
  { jump: 3 },
  { sky: 7 },
  { sent: 0.42 },
  { gifts: 2 },
  { night: 2.5 },
  { spawn: ["construct", 0, -20, 3] },
  { heal: 28 },
  { sparkInf: 1 },
  { confuse: 1 },
  { pulseDmg: 2 },
  { ankhMul: 2 },
  { stagger: 1 },
  { sky: 5 },
  { spawn: ["shade", 80, 4, 6] },
  { hpMul: 2 },
  { gifts: 3, sky: 4 },
  { stagger: 1 },
  { ember: 1 },
  { slow: 0.5 },
  { spawn: ["shade", 70, -16, 4], tide: 5 },
  { jump: 3, night: 1.7 },
  { shove: 1 },
  { sent: 0.35, spawn: ["sentinel", 8, -40, 2] },
  { gifts: 4 },
  { night: 3 },
  { bite: 1 },
  { heal: 32 },
  { sparkX: 1 },
  { confuse: 1 },
  { pulseRate: 3 },
  { pull: 1 },
  { gifts: 2 },
  { stagger: 1, sky: 5 },
  { spawn: ["shade", 80, 16, 5] },
  { gifts: 4, hpMul: 2 },
  { magnet: 1, gifts: 2 },
  { stagger: 1 },
  { ember: 1, sky: 4 },
  { slow: 0.4 },
  { resist: 0.55 },
  { jump: 3.6 },
  { resist: 0.5, sky: 3 },
  { spawn: ["construct", 4, -18, 3], chainDeath: 1 },
  { magnet: 1 },
  { night: 2.8, spawn: ["shade", 70, 0, 4] },
  { spawn: ["construct", 0, -22, 4] },
  { heal: 20, regen: 2 },
  { sparkInf: 1 },
  { confuse: 1 },
  { pulseDmg: 2 },
  { ankhMul: 2, ankh: 0.75 },
  { ember: 1, stagger: 1 },
  { sky: 8 },
  { spawn: ["shade", 80, 4, 6] },
  { hpMul: 3 },
  { sparkInf: 1, sky: 5 },
  { stagger: 1 },
  { ember: 1 },
  { slow: 0.45 },
  { spawn: ["shade", 70, 0, 5], tide: 6 },
  { jump: 5 },
  { sky: 9 },
  { spawn: ["wraith", 0, -82, 4] },
  { gifts: 3 },
  { night: 3.2 },
  { spawn: ["construct", 0, -16, 5] },
  { heal: 100 },
  { sparkX: 1 },
  { confuse: 1 },
  { pulseInf: 1 },
  { ankhMul: 4 },
  { gifts: 2 },
  { sky: 7 },
  { spawn: ["shade", 80, 0, 6] },
  { gifts: 4, hpMul: 2 },
  { magnet: 1, gifts: 3 },
  { stagger: 1 },
  { ember: 1 },
  { slow: 0.5 },
  { spawn: ["shade", 78, 4, 6], tide: 5 },
  { jump: 3, night: 2.2 },
  { resist: 0.6 },
  { bite: 1, chainDeath: 1 },
  { ankhMul: 2, gifts: 2 },
  { night: 3.2 },
  { spawn: ["construct", 0, -20, 4] },
  { regen: 2.4 },
  { sparkX: 1 },
  { confuse: 1 },
  { pulseDmg: 2, pulseRate: 2 },
  { chain: 1 },
  { ember: 1, stagger: 1 },
  { sky: 8 },
  { spawn: ["shade", 76, 8, 8] },
  { magnet: 1, hpMul: 2 },
  { magnet: 1, gifts: 4 },
  { sky: 8, stagger: 1, night: 1.5 },
];

if (SPEC.length !== 100) {
  throw new Error(`Named moment specs must be 100, got ${SPEC.length}`);
}

export class OpenWorldMomentSystem {
  static Instance: OpenWorldMomentSystem | null = null;

  flags = defaultFlags();
  current: WorldMoment | null = null;
  private remain = 0;
  private tickAt = 48;
  private spawned = 0;
  private rng: () => number;

  constructor(
    code: number,
    private host: MomentHost,
  ) {
    OpenWorldMomentSystem.Instance = this;
    this.rng = mulberry32(streamSeed(code, "owm"));
  }

  TriggerMoment(id: number) {
    if (this.current && this.remain > 0) this.clearFlags();
    const m = getWorldMoment(id);
    this.current = m;
    this.remain = m.duration > 0 ? m.duration : 3.2;
    this.flags = defaultFlags();
    if (m.id <= 100) this.applySpec(SPEC[m.id - 1] ?? {}, m);
    else this.applyFx(m.fx, m);
    this.host.announce(m);
  }

  TriggerRandomMoment() {
    const id = 1 + Math.floor(this.rng() * 10000);
    this.TriggerMoment(id);
  }

  TickOpenWorld() {
    if (this.rng() < 0.35) this.TriggerRandomMoment();
  }

  update(dt: number) {
    this.tickAt -= dt;
    if (this.tickAt <= 0) {
      this.TickOpenWorld();
      this.tickAt = 30;
    }
    if (!this.current) return;
    this.remain -= dt;
    if (this.remain <= 0) this.end();
  }

  banner() {
    if (!this.current) return null;
    return {
      id: padMoment(this.current.id),
      name: this.current.name,
      desc: this.current.description,
    };
  }

  dispose() {
    if (OpenWorldMomentSystem.Instance === this) OpenWorldMomentSystem.Instance = null;
  }

  private end() {
    this.clearFlags();
    this.current = null;
    this.remain = 0;
    this.spawned = 0;
  }

  private clearFlags() {
    this.flags = defaultFlags();
  }

  private applySpec(s: Spec, m: WorldMoment) {
    if (s.ember) this.flags.emberFloor = true;
    if (s.jump) this.flags.jumpMul = s.jump;
    if (s.night) this.flags.night = s.night;
    if (s.sent) this.flags.sentinelCd = s.sent;
    if (s.sparkInf) this.flags.sparkInfinite = true;
    if (s.pulseDmg) this.flags.pulseDmg = s.pulseDmg;
    if (s.pulseRate) this.flags.pulseRate = s.pulseRate;
    if (s.pulseInf) this.flags.pulseInfinite = true;
    if (s.ankhMul) this.flags.ankhMul = s.ankhMul;
    if (s.confuse) this.flags.confuse = true;
    if (s.slow) this.flags.slow = s.slow;
    if (s.hpMul) this.flags.healthMul = s.hpMul;
    if (s.resist) this.flags.resist = s.resist;
    if (s.sparkX) this.flags.sparkExplode = true;
    if (s.chain) this.flags.chainBeam = true;
    if (s.pull) this.flags.pullLance = true;
    if (s.sky) this.flags.skySpin = s.sky;
    if (s.regen) this.flags.regen = s.regen;
    if (s.magnet) this.flags.magnet = true;
    if (s.tide) this.flags.bloodPull = s.tide;
    if (s.chainDeath) this.flags.chainDeath = true;
    if (s.spawn) this.burst(s.spawn[0], s.spawn[1], s.spawn[2], s.spawn[3]);
    if (s.gifts) this.rainGifts(s.gifts);
    if (s.heal) this.host.heal(s.heal);
    if (s.stagger) this.host.stagger();
    if (s.ankh) this.host.chargeAnkh(s.ankh);
    if (s.bite) this.host.gateBite();
    if (s.shove) this.host.shove();
    void m;
  }

  private applyFx(fx: MomentFx, m: WorldMoment) {
    const p = this.host.pos();
    switch (fx) {
      case "emberFloor":
        this.flags.emberFloor = true;
        break;
      case "slowEnemies":
        this.flags.slow = 0.6;
        break;
      case "jumpBoost":
        this.flags.jumpMul = 3;
        break;
      case "sentinelHaste":
        this.flags.sentinelCd = 0.45;
        break;
      case "nightfall":
        this.flags.night = 2.5;
        break;
      case "spawnShades":
        this.burst("shade", 80, 4, 5);
        break;
      case "spawnConstructs":
        this.burst("construct", 0, -18, 3);
        break;
      case "spawnWraiths":
        this.burst("wraith", 0, -82, 4);
        break;
      case "healPulse":
        this.host.heal(28);
        this.flags.regen = m.duration > 10 ? 2.2 : 0;
        break;
      case "infiniteSpark":
        this.flags.sparkInfinite = true;
        break;
      case "confuseAi":
        this.flags.confuse = true;
        break;
      case "pulseDouble":
        this.flags.pulseDmg = 2;
        break;
      case "ankhHaste":
        this.flags.ankhMul = 2;
        break;
      case "stagger":
      case "heartbeat":
        this.host.stagger();
        break;
      case "healthBloom":
        this.flags.healthMul = 2;
        this.rainGifts(3);
        break;
      case "runeEcho":
        this.host.gift("health", p.x + 2, p.z - 1);
        this.host.gift("ammo", p.x - 2, p.z + 1);
        break;
      case "infinitePulse":
        this.flags.pulseInfinite = true;
        break;
      case "sparkExplode":
        this.flags.sparkExplode = true;
        break;
      case "playerDome":
        this.flags.resist = 0.55;
        break;
      case "chainBeam":
        this.flags.chainBeam = true;
        break;
      case "pullLance":
        this.flags.pullLance = true;
        break;
      case "gatePulse":
        this.host.gateBite();
        break;
      case "skySpin":
        this.flags.skySpin = 6;
        break;
      default:
        break;
    }
  }

  private rainGifts(n: number) {
    const p = this.host.pos();
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const kind = i % 2 === 0 ? "health" : "ammo";
      this.host.gift(kind, p.x + Math.cos(a) * 5, p.z + Math.sin(a) * 5);
    }
  }

  private burst(kind: Kind, x: number, z: number, n: number) {
    const count = Math.min(n, 12 - this.spawned);
    for (let i = 0; i < count; i++) {
      const a = (i / Math.max(1, count)) * Math.PI * 2;
      this.host.spawn(kind, x + Math.cos(a) * 6, z + Math.sin(a) * 6);
      this.spawned += 1;
    }
  }
}
