/**
 * DualSense extras: adaptive-trigger resistance + sixaxis gyro fine-aim.
 * HID is optional (Chrome + user pair). trigger-rumble is the no-permission fallback
 * (DualSense + Xbox impulse triggers).
 */

const SONY = 0x054c;
const PID_DS5 = 0x0ce6;
const PID_DS5_EDGE = 0x0df2;

export type TriggerPath = "hid" | "rumble" | "off";

type TriggerRumbleParams = {
  duration: number;
  startDelay?: number;
  strongMagnitude?: number;
  weakMagnitude?: number;
  leftTrigger?: number;
  rightTrigger?: number;
};

type HidLike = {
  vendorId: number;
  productId: number;
  opened: boolean;
  open: () => Promise<void>;
  close: () => Promise<void>;
  sendReport: (reportId: number, data: BufferSource) => Promise<void>;
  addEventListener: (type: "inputreport", fn: (ev: HidInput) => void) => void;
  removeEventListener: (type: "inputreport", fn: (ev: HidInput) => void) => void;
};

type HidInput = {
  reportId: number;
  data: DataView;
};

function hidApi() {
  return (navigator as Navigator & { hid?: {
    getDevices: () => Promise<HidLike[]>;
    requestDevice: (opt: { filters: { vendorId: number; productId?: number }[] }) => Promise<HidLike[]>;
  } }).hid;
}

export function isDualSensePad(pad: Gamepad | null | undefined) {
  if (!pad) return false;
  const id = pad.id.toLowerCase();
  return id.includes("dualsense") || id.includes("dual sense") || (id.includes("054c") && (id.includes("0ce6") || id.includes("0df2") || id.includes("ce6")));
}

export class DualSenseFx {
  hidReady = false;
  gyroLive = false;
  path: TriggerPath = "off";
  gyroX = 0;
  gyroY = 0;
  private device: HidLike | null = null;
  private lastForce = -1;
  private lastSend = 0;
  private rumbleLock = false;
  private onReport = (ev: HidInput) => this.readGyro(ev);

  async restore() {
    const hid = hidApi();
    if (!hid) return;
    try {
      const list = await hid.getDevices();
      const ds = list.find((d) => d.vendorId === SONY && (d.productId === PID_DS5 || d.productId === PID_DS5_EDGE));
      if (ds) await this.use(ds);
    } catch {
      /* no prior grant */
    }
  }

  async pair() {
    const hid = hidApi();
    if (!hid) return false;
    try {
      const list = await hid.requestDevice({
        filters: [
          { vendorId: SONY, productId: PID_DS5 },
          { vendorId: SONY, productId: PID_DS5_EDGE },
          { vendorId: SONY },
        ],
      });
      const ds = list[0];
      if (!ds) return false;
      await this.use(ds);
      return this.hidReady;
    } catch {
      return false;
    }
  }

  private async use(dev: HidLike) {
    if (!dev.opened) await dev.open();
    if (this.device) {
      try {
        this.device.removeEventListener("inputreport", this.onReport);
      } catch {
        /* ignore */
      }
    }
    this.device = dev;
    this.hidReady = true;
    this.path = "hid";
    dev.addEventListener("inputreport", this.onReport);
  }

  /** charge 0–1 while Ankh is equipped; 0 otherwise. Resistance ramps with charge. */
  apply(charge: number, ankh: boolean, pad: Gamepad | null) {
    const force = ankh ? Math.max(0, Math.min(1, charge)) : 0;
    if (pad) this.pulseRumble(pad, ankh ? 0.12 + 0.88 * force : 0);
    if (this.hidReady) this.sendHid(force, ankh);
  }

  consumeGyro(scale: number) {
    if (!this.gyroLive) return { x: 0, y: 0 };
    const dead = 18;
    const gx = Math.abs(this.gyroX) < dead ? 0 : this.gyroX;
    const gy = Math.abs(this.gyroY) < dead ? 0 : this.gyroY;
    return { x: gx * scale, y: gy * scale };
  }

  private pulseRumble(pad: Gamepad, force: number) {
    const act = pad.vibrationActuator;
    if (!act || this.rumbleLock) return;
    if (force < 0.04) {
      this.path = this.hidReady ? "hid" : "off";
      return;
    }
    this.rumbleLock = true;
    const params: TriggerRumbleParams = {
      duration: 80,
      strongMagnitude: 0,
      weakMagnitude: 0,
      leftTrigger: 0,
      rightTrigger: Math.min(1, force),
    };
    const play = act.playEffect("trigger-rumble" as GamepadHapticEffectType, params as GamepadEffectParameters);
    const done = () => {
      this.rumbleLock = false;
    };
    if (play && typeof play.then === "function") {
      play.then(done).catch(done);
      if (!this.hidReady) this.path = "rumble";
    } else {
      this.rumbleLock = false;
    }
  }

  private sendHid(force: number, ankh: boolean) {
    const now = performance.now();
    const q = ankh ? Math.round(force * 32) : 0;
    if (q === this.lastForce && now - this.lastSend < 120) return;
    this.lastForce = q;
    this.lastSend = now;
    const payload = this.buildReport(force, ankh);
    const dev = this.device;
    if (!dev) return;
    void dev.sendReport(0x02, payload).catch(() => {
      const bt = new Uint8Array(payload.length + 1);
      bt[0] = 0x02;
      bt.set(payload, 1);
      void dev.sendReport(0x31, bt).catch(() => {
        this.hidReady = false;
        this.path = "rumble";
      });
    });
  }

  /**
   * USB output 0x02 common block (report id passed separately).
   * valid_flag0 bit2 = R2 effect, bit3 = L2 effect.
   * right_trigger_effect[11] starts at byte 11; left at 22.
   * Mode 0x21 = rigid feedback (resistance). Strength follows Ankh charge.
   */
  private buildReport(force: number, ankh: boolean) {
    const payload = new Uint8Array(47);
    payload[0] = 0x0c;
    const on = ankh && force > 0.02;
    payload[11] = on ? 0x21 : 0x05;
    payload[12] = on ? Math.round(36 - force * 28) : 0;
    payload[13] = on ? Math.round(40 + force * 215) : 0;
    payload[22] = 0x05;
    return payload;
  }

  private readGyro(ev: HidInput) {
    const base = ev.reportId === 0x31 ? 1 : 0;
    if (ev.data.byteLength < base + 22) return;
    const pitch = ev.data.getInt16(base + 16, true);
    const yaw = ev.data.getInt16(base + 18, true);
    this.gyroY = pitch;
    this.gyroX = yaw;
    this.gyroLive = true;
  }

  async reset() {
    this.apply(0, false, null);
    if (this.device) {
      try {
        this.device.removeEventListener("inputreport", this.onReport);
        const off = this.buildReport(0, false);
        await this.device.sendReport(0x02, off).catch(() => {});
      } catch {
        /* ignore */
      }
    }
    this.gyroLive = false;
    this.hidReady = false;
    this.device = null;
    this.path = "off";
  }
}

export function hidAvailable() {
  return Boolean(hidApi());
}
