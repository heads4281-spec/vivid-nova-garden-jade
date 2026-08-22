/** Procedural SFX mixer — layered transients, body, tails, formants, palace reverb. */

type Osc = OscillatorType;

export class GameAudio {
  ctx: AudioContext | null = null;
  master: GainNode | null = null;
  sfx: GainNode | null = null;
  music: GainNode | null = null;
  verb: GainNode | null = null;
  muted = false;
  volume = 0.7;
  private drone: OscillatorNode | null = null;
  private drone2: OscillatorNode | null = null;
  private tension: OscillatorNode | null = null;
  private tensionG: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private chargeOsc: OscillatorNode | null = null;
  private chargeG: GainNode | null = null;
  private chargeOn = false;
  private voices = 0;
  private readonly maxVoices = 18;
  private lx = 0;
  private ly = 1.6;
  private lz = 0;
  private lfx = 0;
  private lfz = -1;
  private pan = 0;
  private dist = 1;
  private combat = 0;
  private lastStep = 0;
  private lastHit = 0;
  private lastHurt = 0;

  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AC({ latencyHint: "interactive" });
      this.master = this.ctx.createGain();
      this.sfx = this.ctx.createGain();
      this.music = this.ctx.createGain();
      this.verb = this.ctx.createGain();
      this.verb.gain.value = 0.22;
      this.buildReverb();
      this.sfx.connect(this.master);
      this.music.connect(this.master);
      this.verb.connect(this.master);
      this.master.connect(this.ctx.destination);
      this.applyVolume();
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    this.startDrone();
  }

  setVolume(v: number) {
    this.volume = v;
    this.applyVolume();
  }

  setMuted(m: boolean) {
    this.muted = m;
    this.applyVolume();
  }

  setDrone(hz: number) {
    if (!this.drone || !this.drone2 || !this.ctx) return;
    const t = this.ctx.currentTime;
    this.drone.frequency.setTargetAtTime(hz, t, 0.12);
    this.drone2.frequency.setTargetAtTime(hz * 2.01, t, 0.12);
  }

  setListener(x: number, y: number, z: number, fx: number, fz: number) {
    this.lx = x;
    this.ly = y;
    this.lz = z;
    const len = Math.hypot(fx, fz) || 1;
    this.lfx = fx / len;
    this.lfz = fz / len;
    if (this.ctx?.listener) {
      const L = this.ctx.listener;
      try {
        L.positionX.setTargetAtTime(x, this.ctx.currentTime, 0.02);
        L.positionY.setTargetAtTime(y, this.ctx.currentTime, 0.02);
        L.positionZ.setTargetAtTime(z, this.ctx.currentTime, 0.02);
        L.forwardX.setTargetAtTime(this.lfx, this.ctx.currentTime, 0.02);
        L.forwardZ.setTargetAtTime(this.lfz, this.ctx.currentTime, 0.02);
        L.forwardY.setTargetAtTime(0, this.ctx.currentTime, 0.02);
        L.upY.setTargetAtTime(1, this.ctx.currentTime, 0.02);
      } catch {
        /* older Safari */
      }
    }
  }

  at(sx: number, sz: number) {
    const dx = sx - this.lx;
    const dz = sz - this.lz;
    const dist = Math.hypot(dx, dz) || 1;
    const rx = -this.lfz;
    const rz = this.lfx;
    this.pan = Math.max(-0.95, Math.min(0.95, (dx * rx + dz * rz) / dist));
    this.dist = dist;
  }

  clearAt() {
    this.pan = 0;
    this.dist = 1;
  }

  setCombat(n: number) {
    this.combat += (n - this.combat) * 0.08;
    if (!this.ctx || !this.tensionG) return;
    const t = this.ctx.currentTime;
    this.tensionG.gain.setTargetAtTime(this.combat * 0.07, t, 0.4);
    this.music?.gain.setTargetAtTime(0.18 + this.combat * 0.06, t, 0.4);
    if (this.filter) this.filter.frequency.setTargetAtTime(160 + this.combat * 220, t, 0.5);
  }

  private applyVolume() {
    const g = this.muted ? 0 : this.volume * this.volume;
    const t = this.ctx?.currentTime ?? 0;
    this.master?.gain.setTargetAtTime(g, t, 0.03);
    this.sfx?.gain.setTargetAtTime(0.95, t, 0.03);
    this.music?.gain.setTargetAtTime(0.2, t, 0.05);
  }

  private buildReverb() {
    if (!this.ctx || !this.verb) return;
    const delays = [0.037, 0.053, 0.079];
    for (const d of delays) {
      const del = this.ctx.createDelay(0.2);
      del.delayTime.value = d;
      const fb = this.ctx.createGain();
      fb.gain.value = 0.28;
      const lp = this.ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 2400;
      this.verb.connect(del);
      del.connect(lp);
      lp.connect(fb);
      fb.connect(del);
      lp.connect(this.master!);
    }
  }

  private startDrone() {
    if (!this.ctx || !this.music || this.drone) return;
    const f = this.ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 180;
    f.Q.value = 0.7;
    f.connect(this.music);
    this.filter = f;
    const o1 = this.ctx.createOscillator();
    const o2 = this.ctx.createOscillator();
    const g1 = this.ctx.createGain();
    g1.gain.value = 0.16;
    o1.type = "sawtooth";
    o2.type = "sine";
    o1.frequency.value = 46;
    o2.frequency.value = 92.3;
    o1.connect(g1);
    o2.connect(g1);
    g1.connect(f);
    o1.start();
    o2.start();
    this.drone = o1;
    this.drone2 = o2;

    const ten = this.ctx.createOscillator();
    ten.type = "triangle";
    ten.frequency.value = 55;
    const tg = this.ctx.createGain();
    tg.gain.value = 0;
    ten.connect(tg);
    tg.connect(this.music);
    ten.start();
    this.tension = ten;
    this.tensionG = tg;

    this.windLoop();
  }

  private windLoop() {
    if (!this.ctx || !this.music) return;
    const n = this.noiseBuf(2.4);
    const src = this.ctx.createBufferSource();
    src.buffer = n;
    src.loop = true;
    const f = this.ctx.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = 380;
    f.Q.value = 0.5;
    const g = this.ctx.createGain();
    g.gain.value = 0.045;
    src.connect(f);
    f.connect(g);
    g.connect(this.music);
    src.start();
  }

  private noiseBuf(dur: number, color: "white" | "pink" | "brown" = "white") {
    const sr = this.ctx!.sampleRate;
    const n = this.ctx!.createBuffer(1, Math.max(1, Math.floor(sr * dur)), sr);
    const d = n.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < d.length; i++) {
      const w = Math.random() * 2 - 1;
      if (color === "white") d[i] = w;
      else if (color === "pink") {
        b0 = 0.99765 * b0 + w * 0.099046;
        b1 = 0.963 * b1 + w * 0.2965164;
        b2 = 0.57 * b2 + w * 1.052691;
        d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.22;
      } else {
        b0 = (b0 + 0.02 * w) / 1.02;
        d[i] = b0 * 3.5;
      }
    }
    return n;
  }

  private out(node: AudioNode, peak: number, attack: number, dur: number, sendVerb = true) {
    if (!this.ctx || !this.sfx) return null;
    if (this.voices >= this.maxVoices) return null;
    this.voices++;
    const now = this.ctx.currentTime;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), now + Math.max(0.004, attack));
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    const panner = this.ctx.createStereoPanner();
    panner.pan.value = this.pan;
    const distGain = this.ctx.createGain();
    const att = this.dist > 2 ? Math.max(0.18, 1 / (1 + (this.dist - 2) * 0.045)) : 1;
    distGain.gain.value = att;
    node.connect(g);
    g.connect(panner);
    panner.connect(distGain);
    distGain.connect(this.sfx);
    if (sendVerb && this.verb) {
      const vg = this.ctx.createGain();
      vg.gain.value = 0.35 * att;
      distGain.connect(vg);
      vg.connect(this.verb);
    }
    setTimeout(() => {
      try {
        node.disconnect();
        g.disconnect();
        panner.disconnect();
        distGain.disconnect();
      } catch { /* already gone */ }
      this.voices = Math.max(0, this.voices - 1);
    }, (dur + 0.08) * 1000);
    return { g, now, dur };
  }

  private osc(freq: number, type: Osc, dur: number, peak: number, slide?: number, attack = 0.01) {
    if (!this.ctx) return;
    const o = this.ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, this.ctx.currentTime);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq * slide), this.ctx.currentTime + dur);
    this.out(o, peak, attack, dur);
    o.start();
    o.stop(this.ctx.currentTime + dur + 0.04);
  }

  private noise(dur: number, peak: number, freq: number, type: BiquadFilterType = "bandpass", q = 1.2, color: "white" | "pink" | "brown" = "white") {
    if (!this.ctx) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuf(Math.max(dur, 0.05), color);
    const f = this.ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    src.connect(f);
    this.out(f, peak, 0.006, dur);
    src.start();
    src.stop(this.ctx.currentTime + dur + 0.03);
  }

  private click(freq = 2400, peak = 0.28) {
    this.noise(0.018, peak, freq, "highpass", 0.7);
  }

  private thump(freq = 62, peak = 0.34, dur = 0.18) {
    this.osc(freq, "sine", dur, peak, 0.45, 0.004);
  }

  private formant(f1: number, f2: number, peak: number, dur: number, base = 110) {
    if (!this.ctx || !this.sfx) return;
    const o = this.ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.value = base * (0.94 + Math.random() * 0.12);
    const bp1 = this.ctx.createBiquadFilter();
    bp1.type = "bandpass";
    bp1.frequency.value = f1;
    bp1.Q.value = 6;
    const bp2 = this.ctx.createBiquadFilter();
    bp2.type = "bandpass";
    bp2.frequency.value = f2;
    bp2.Q.value = 5;
    o.connect(bp1);
    o.connect(bp2);
    this.out(bp1, peak, 0.02, dur);
    this.out(bp2, peak * 0.7, 0.025, dur * 1.05);
    o.start();
    o.stop(this.ctx.currentTime + dur + 0.05);
  }

  private r() {
    return 0.92 + Math.random() * 0.16;
  }

  /* ── Weapons ─────────────────────────────────────────── */

  fire(id: number) {
    this.fireKind(id % 12, "hitscan");
  }

  fireWeapon(view: number, kind: string, automatic = false) {
    this.fireKind(view, kind, automatic);
  }

  private fireKind(view: number, kind: string, automatic = false) {
    const r = this.r();
    if (kind === "melee") {
      this.meleeSwing(view);
      return;
    }
    if (kind === "projectile" || view === 1) {
      this.casterFire(r);
      return;
    }
    if (kind === "beam" || view === 3) {
      this.beamFire(r);
      return;
    }
    if (kind === "rail" || view === 5) {
      this.railFire(r);
      return;
    }
    if (view === 4) {
      this.sniperFire(r);
      return;
    }
    if (view === 2 || automatic) {
      this.smgFire(r);
      return;
    }
    this.rifleFire(r);
  }

  private rifleFire(r: number) {
    this.click(3200 * r, 0.42);
    this.noise(0.07, 0.5, 1800 * r, "bandpass", 0.9);
    this.thump(78 * r, 0.38, 0.14);
    this.osc(210 * r, "square", 0.055, 0.1, 0.4);
    this.noise(0.16, 0.12, 420, "lowpass", 0.6, "brown");
  }

  private smgFire(r: number) {
    this.click(2800 * r, 0.22);
    this.noise(0.035, 0.32, 2200 * r, "bandpass", 1.4);
    this.thump(90 * r, 0.16, 0.06);
    this.osc(340 * r, "square", 0.03, 0.06);
  }

  private sniperFire(r: number) {
    this.click(4200 * r, 0.55);
    this.noise(0.12, 0.62, 1400 * r, "bandpass", 0.7);
    this.thump(48 * r, 0.55, 0.32);
    this.osc(160 * r, "sawtooth", 0.18, 0.16, 0.35);
    this.noise(0.4, 0.18, 280, "lowpass", 0.5, "pink");
    this.osc(980 * r, "sine", 0.22, 0.08, 1.6);
  }

  private railFire(r: number) {
    this.osc(80 * r, "sawtooth", 0.22, 0.22, 3.2, 0.008);
    this.osc(640 * r, "square", 0.16, 0.14, 0.3);
    this.noise(0.18, 0.36, 2600 * r, "highpass", 0.8);
    this.thump(55, 0.28, 0.2);
  }

  private beamFire(r: number) {
    this.osc(90, "sawtooth", 0.35, 0.28, 4.5, 0.02);
    this.osc(520 * r, "sine", 0.4, 0.2, 2.2);
    this.noise(0.28, 0.3, 1800 * r, "bandpass", 0.5);
    this.thump(40, 0.32, 0.28);
    this.osc(1480 * r, "triangle", 0.18, 0.1);
  }

  private casterFire(r: number) {
    this.osc(140 * r, "sine", 0.28, 0.24, 0.5, 0.03);
    this.osc(420 * r, "triangle", 0.22, 0.16, 1.8);
    this.noise(0.2, 0.22, 480, "bandpass", 2.2, "pink");
    this.osc(90, "sine", 0.16, 0.12);
  }

  meleeSwing(view: number) {
    const r = this.r();
    if (view === 6) {
      this.noise(0.14, 0.28, 220 * r, "bandpass", 0.8, "pink");
      this.osc(70, "sine", 0.12, 0.1);
    } else if (view === 10) {
      this.noise(0.16, 0.22, 160, "lowpass", 0.5, "brown");
      this.thump(48, 0.18, 0.14);
    } else if (view === 8) {
      this.noise(0.18, 0.26, 900 * r, "bandpass", 1.6, "pink");
      this.osc(480 * r, "triangle", 0.14, 0.08, 0.4);
    } else if (view === 9) {
      this.noise(0.1, 0.2, 1400 * r, "highpass", 0.7);
      this.osc(240, "sine", 0.08, 0.08);
    } else if (view === 11) {
      this.noise(0.06, 0.18, 700, "bandpass", 1.1);
    } else {
      this.noise(0.1, 0.24, 1100 * r, "bandpass", 1.2, "pink");
      this.osc(880 * r, "triangle", 0.08, 0.07);
    }
  }

  strike(kind: "flesh" | "crystal" | "heavy" | "blade") {
    const r = this.r();
    if (kind === "heavy") {
      this.thump(42, 0.5, 0.28);
      this.noise(0.16, 0.4, 180, "lowpass", 0.6, "brown");
      this.click(900, 0.18);
    } else if (kind === "crystal") {
      this.click(3400 * r, 0.4);
      this.osc(1480 * r, "sine", 0.22, 0.16, 0.7);
      this.osc(2200 * r, "triangle", 0.14, 0.1);
      this.noise(0.08, 0.22, 2800, "highpass", 0.8);
    } else if (kind === "blade") {
      this.noise(0.07, 0.34, 2400 * r, "bandpass", 1.8);
      this.osc(1760 * r, "triangle", 0.12, 0.12, 0.55);
      this.thump(90, 0.16, 0.08);
    } else {
      this.thump(70, 0.28, 0.12);
      this.noise(0.08, 0.32, 900 * r, "bandpass", 1.1, "pink");
      this.click(1600, 0.16);
    }
  }

  empty() {
    this.click(1400, 0.12);
    this.osc(90, "square", 0.06, 0.07);
  }

  reload() {
    this.noise(0.05, 0.16, 1800, "highpass", 0.8);
    this.osc(190, "triangle", 0.07, 0.1);
    setTimeout(() => {
      this.osc(260, "triangle", 0.09, 0.09);
      this.click(2100, 0.1);
    }, 90);
    setTimeout(() => {
      this.thump(110, 0.1, 0.08);
      this.click(900, 0.08);
    }, 220);
  }

  /* ── Hits / hurt / death ──────────────────────────────── */

  hit() {
    const now = performance.now();
    if (now - this.lastHit < 40) return;
    this.lastHit = now;
    this.strike("flesh");
  }

  enemyHit(kind: string) {
    if (kind === "construct" || kind === "sentinel") this.strike("crystal");
    else if (kind === "boss") {
      this.strike("crystal");
      this.thump(38, 0.22, 0.16);
    } else this.strike("flesh");
  }

  hurt() {
    this.playerHurt(14);
  }

  playerHurt(amount: number) {
    const now = performance.now();
    if (now - this.lastHurt < 80) return;
    this.lastHurt = now;
    const sev = Math.min(1, amount / 28);
    this.thump(52, 0.22 + sev * 0.22, 0.16 + sev * 0.08);
    this.noise(0.16 + sev * 0.1, 0.28 + sev * 0.2, 240, "lowpass", 0.7, "pink");
    this.formant(620 + sev * 80, 1180, 0.14 + sev * 0.12, 0.22 + sev * 0.12, 95 + Math.random() * 30);
    if (sev > 0.55) this.formant(480, 900, 0.12, 0.28, 80);
  }

  playerDeath() {
    this.formant(400, 780, 0.22, 0.7, 70);
    this.osc(60, "sawtooth", 0.8, 0.24, 0.3, 0.04);
    this.noise(0.7, 0.28, 180, "lowpass", 0.5, "brown");
    this.thump(36, 0.4, 0.5);
  }

  enemyDeath(kind: string) {
    this.atClearLater();
    if (kind === "wraith") {
      this.formant(780, 1600, 0.16, 0.45, 180);
      this.osc(420, "sine", 0.5, 0.14, 0.25);
      this.noise(0.4, 0.22, 700, "bandpass", 0.8, "pink");
    } else if (kind === "sentinel") {
      this.osc(880, "square", 0.22, 0.14, 0.2);
      this.noise(0.3, 0.28, 2200, "highpass", 0.7);
      this.osc(140, "sawtooth", 0.28, 0.12, 0.4);
    } else if (kind === "construct") {
      this.thump(32, 0.5, 0.45);
      this.noise(0.4, 0.4, 140, "lowpass", 0.5, "brown");
      this.click(600, 0.2);
      this.osc(90, "sawtooth", 0.3, 0.16, 0.4);
    } else if (kind === "shade") {
      this.noise(0.35, 0.24, 320, "bandpass", 1.4, "pink");
      this.osc(210, "sine", 0.4, 0.12, 0.2);
      this.formant(900, 1900, 0.1, 0.3, 240);
    } else {
      this.bossRoar();
      this.thump(28, 0.6, 0.7);
      this.noise(0.8, 0.45, 90, "lowpass", 0.4, "brown");
      this.osc(55, "sawtooth", 0.9, 0.28, 0.25);
    }
  }

  enemyAttack(kind: string) {
    if (kind === "wraith") {
      this.noise(0.08, 0.22, 1100, "bandpass", 1.2, "pink");
      this.formant(700, 1400, 0.1, 0.16, 160);
    } else if (kind === "sentinel") {
      this.osc(540, "square", 0.08, 0.14);
      this.noise(0.07, 0.22, 1900, "bandpass", 1);
      this.click(2600, 0.16);
    } else if (kind === "construct") {
      this.thump(40, 0.42, 0.22);
      this.noise(0.14, 0.3, 200, "lowpass", 0.6, "brown");
    } else if (kind === "shade") {
      this.noise(0.09, 0.2, 1600, "highpass", 0.8, "pink");
      this.osc(880, "sine", 0.1, 0.08, 0.5);
    } else {
      this.bossRoar();
    }
  }

  bossRoar() {
    this.formant(320, 640, 0.22, 0.7, 55);
    this.osc(48, "sawtooth", 0.8, 0.28, 0.7, 0.05);
    this.noise(0.7, 0.3, 180, "lowpass", 0.5, "brown");
  }

  explode() {
    this.thump(38, 0.55, 0.42);
    this.noise(0.38, 0.5, 180, "lowpass", 0.55, "brown");
    this.noise(0.18, 0.28, 1400, "highpass", 0.7);
    this.osc(70, "sawtooth", 0.3, 0.16, 0.4);
    this.duck(0.12, 0.18);
  }

  /* ── Movement / items / UI ────────────────────────────── */

  step() {
    const now = performance.now();
    if (now - this.lastStep < 90) return;
    this.lastStep = now;
    const r = this.r();
    this.noise(0.045, 0.07 + Math.random() * 0.03, 170 * r, "lowpass", 0.8, "brown");
    this.click(900 + Math.random() * 400, 0.04);
  }

  jump() {
    this.thump(90, 0.12, 0.08);
    this.noise(0.08, 0.1, 400, "bandpass", 0.8, "pink");
  }

  land(force = 0.5) {
    this.thump(58, 0.12 + force * 0.28, 0.12 + force * 0.1);
    this.noise(0.08 + force * 0.08, 0.1 + force * 0.18, 220, "lowpass", 0.6, "brown");
    if (force > 0.6) this.click(700, 0.08);
  }

  pickup() {
    this.pickupKind("ammo");
  }

  pickupKind(kind: "ammo" | "health") {
    if (kind === "health") {
      this.osc(392, "sine", 0.16, 0.14);
      this.osc(523, "sine", 0.22, 0.12);
      this.osc(659, "triangle", 0.28, 0.1);
    } else {
      this.osc(520, "sine", 0.1, 0.12);
      this.osc(780, "sine", 0.16, 0.1);
      this.click(2400, 0.08);
    }
  }

  rune() {
    this.osc(196, "sine", 0.4, 0.16);
    this.osc(247, "sine", 0.5, 0.12);
    this.osc(392, "triangle", 0.62, 0.1);
    this.osc(523, "sine", 0.7, 0.08);
    this.noise(0.5, 0.1, 480, "bandpass", 2, "pink");
  }

  thunder() {
    this.thump(28, 0.4, 0.7);
    this.noise(0.9, 0.32, 90, "lowpass", 0.4, "brown");
    this.noise(0.25, 0.16, 1800, "highpass", 0.5);
  }

  ui(kind: "bag" | "equip" | "map" | "tree" | "deny" | "claim" | "open" | "close") {
    if (kind === "deny") {
      this.osc(110, "square", 0.1, 0.08);
      this.osc(90, "square", 0.14, 0.06);
      return;
    }
    if (kind === "claim") {
      this.rune();
      return;
    }
    if (kind === "equip") {
      this.click(1800, 0.1);
      this.osc(240, "triangle", 0.08, 0.08);
      return;
    }
    if (kind === "bag" || kind === "open") {
      this.noise(0.12, 0.12, 280, "bandpass", 0.8, "pink");
      this.osc(160, "sine", 0.1, 0.06);
      return;
    }
    if (kind === "close") {
      this.click(900, 0.07);
      return;
    }
    this.osc(kind === "map" ? 330 : 196, "sine", 0.14, 0.08);
    this.osc(kind === "tree" ? 262 : 392, "triangle", 0.18, 0.06);
  }

  /* ── Skills — each branch a different body ────────────── */

  skill(kind: string, id = "") {
    const k = id || kind;
    if (kind === "fortitude" || k.includes("fortitude")) this.skillFortitude();
    else if (kind === "carapace" || k.includes("carapace")) this.skillCarapace();
    else if (kind === "surge" || k.includes("surge")) this.skillSurge(k.includes("dual"));
    else if (kind === "lunge" || k.includes("lunge") || k.includes("dash")) this.skillLunge();
    else if (kind === "tide" || k.includes("tide")) this.skillTide();
    else if (kind === "coil" || k.includes("coil")) this.skillCoil();
    else if (kind === "whisper" || k.includes("whisper")) this.skillWhisper(k.includes("final"));
    else if (kind === "ritual" || k.includes("rite") || k.includes("ritual")) this.skillRitual();
    else this.rune();
  }

  private skillFortitude() {
    this.thump(48, 0.32, 0.4);
    this.osc(98, "sawtooth", 0.5, 0.16, 1.4, 0.04);
    this.noise(0.4, 0.18, 220, "lowpass", 0.7, "brown");
    this.osc(196, "sine", 0.6, 0.1);
  }

  private skillCarapace() {
    this.click(2200, 0.22);
    this.osc(880, "triangle", 0.28, 0.14);
    this.osc(1320, "sine", 0.22, 0.1);
    this.thump(70, 0.2, 0.18);
    this.noise(0.2, 0.16, 2600, "highpass", 0.8);
  }

  private skillSurge(dual: boolean) {
    this.noise(0.16, 0.32, 600, "bandpass", 0.7, "pink");
    this.osc(80, "sawtooth", 0.22, 0.2, 2.4);
    this.thump(55, 0.28, 0.18);
    if (dual) {
      this.noise(0.12, 0.22, 1400, "highpass", 0.7);
      this.osc(240, "sine", 0.16, 0.12, 0.4);
    }
  }

  private skillLunge() {
    this.noise(0.14, 0.28, 900, "bandpass", 0.9, "pink");
    this.osc(180, "sine", 0.18, 0.14, 0.35);
    this.click(1900, 0.12);
  }

  private skillTide() {
    this.noise(0.5, 0.28, 180, "lowpass", 0.5, "pink");
    this.osc(110, "sine", 0.55, 0.16, 0.7, 0.06);
    this.osc(220, "triangle", 0.45, 0.1, 1.3);
    this.osc(330, "sine", 0.4, 0.08);
  }

  private skillCoil() {
    this.osc(740, "square", 0.12, 0.12);
    this.osc(1480, "sine", 0.22, 0.14, 1.8);
    this.click(3200, 0.16);
    this.noise(0.1, 0.12, 2400, "bandpass", 2);
  }

  private skillWhisper(finalForm: boolean) {
    this.formant(finalForm ? 280 : 420, finalForm ? 560 : 880, 0.18, 0.7, finalForm ? 48 : 70);
    this.osc(finalForm ? 36 : 52, "sine", 0.8, 0.16, 0.6, 0.08);
    this.noise(0.7, 0.16, 240, "bandpass", 0.8, "pink");
    if (finalForm) this.osc(98, "sawtooth", 0.9, 0.12, 0.4);
  }

  private skillRitual() {
    this.osc(65, "sawtooth", 0.7, 0.24, 0.5, 0.06);
    this.osc(130, "sine", 0.8, 0.16);
    this.osc(196, "triangle", 0.9, 0.1);
    this.osc(392, "sine", 1.0, 0.08);
    this.thump(32, 0.4, 0.5);
    this.noise(0.6, 0.22, 140, "lowpass", 0.5, "brown");
    this.thunder();
  }

  skillFail() {
    this.ui("deny");
  }

  chargeHum(level: number) {
    if (!this.ctx || !this.sfx) return;
    if (level <= 0.02) {
      if (this.chargeOn && this.chargeG) {
        this.chargeG.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.04);
        this.chargeOn = false;
      }
      return;
    }
    if (!this.chargeOsc) {
      const o = this.ctx.createOscillator();
      o.type = "sawtooth";
      o.frequency.value = 70;
      const g = this.ctx.createGain();
      g.gain.value = 0.0001;
      const f = this.ctx.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.value = 800;
      o.connect(f);
      f.connect(g);
      g.connect(this.sfx);
      o.start();
      this.chargeOsc = o;
      this.chargeG = g;
    }
    this.chargeOn = true;
    const t = this.ctx.currentTime;
    this.chargeOsc.frequency.setTargetAtTime(70 + level * 220, t, 0.05);
    this.chargeG?.gain.setTargetAtTime(0.04 + level * 0.14, t, 0.05);
  }

  resume() {
    if (this.ctx?.state === "suspended") void this.ctx.resume();
  }

  dispose() {
    try {
      this.drone?.stop();
      this.drone2?.stop();
      this.tension?.stop();
      this.chargeOsc?.stop();
    } catch {
      /* already stopped */
    }
    void this.ctx?.close();
    this.ctx = null;
    this.drone = null;
    this.drone2 = null;
    this.tension = null;
    this.chargeOsc = null;
    this.chargeOn = false;
  }

  private duck(amount: number, dur: number) {
    if (!this.music || !this.ctx) return;
    const t = this.ctx.currentTime;
    this.music.gain.setTargetAtTime(Math.max(0.04, 0.2 - amount), t, 0.02);
    this.music.gain.setTargetAtTime(0.2, t + dur, 0.12);
  }

  private atClearLater() {
    setTimeout(() => this.clearAt(), 80);
  }
}
