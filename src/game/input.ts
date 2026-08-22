import { DualSenseFx, hidAvailable, isDualSensePad } from "./dualsense";
import {
  ARM_FROM_DPAD,
  DEADZONE,
  INTERACT_GLYPH,
  KEY,
  PAD,
  STICK_SPRINT,
  SWIPE_MS,
  SWIPE_PX,
  TRIGGER_GATE,
  anyCode,
  emptyActions,
  radialDeadzone,
  type ActionState,
  type DeviceKind,
} from "./input-map";

type GyroOrient = {
  requestPermission?: () => Promise<"granted" | "denied">;
};

export class Input {
  keys = new Set<string>();
  lookX = 0;
  lookY = 0;
  lookStickX = 0;
  lookStickY = 0;
  moveX = 0;
  moveY = 0;
  fireHeld = false;
  firePressed = false;
  adsHeld = false;
  jumpPressed = false;
  jumpHeld = false;
  reloadPressed = false;
  weaponDelta = 0;
  weaponSlot: number | null = null;
  interactPressed = false;
  interactHeld = false;
  pausePressed = false;
  cameraPressed = false;
  bagPressed = false;
  mapPressed = false;
  skillPressed = false;
  treePressed = false;
  sprintHeld = false;
  touchMoveX = 0;
  touchMoveY = 0;
  touchLookActive = false;
  isCoarse = false;
  activeDevice: DeviceKind = "kbm";
  padConnected = false;
  padName = "";
  isDualSense = false;
  gyroAllowed = false;
  ds = new DualSenseFx();
  ankhCharge = 0;
  ankhEquipped = false;

  private lookTouch: number | null = null;
  private lastLookX = 0;
  private lastLookY = 0;
  private moveTouch: number | null = null;
  private moveOriginX = 0;
  private moveOriginY = 0;
  private swipeX = 0;
  private swipeY = 0;
  private swipeT = 0;
  private mouseFire = false;
  private mouseAds = false;
  private uiFire = false;
  private uiAds = false;
  private uiSprint = false;
  private uiInteract = false;
  private uiMoveX = 0;
  private uiMoveY = 0;
  private padPrev = new Array<boolean>(16).fill(false);
  private padPrevInit = false;
  private lastBeta: number | null = null;
  private lastGamma: number | null = null;
  private gyroHooked = false;
  private el: HTMLElement | null = null;

  attach(el: HTMLElement) {
    this.el = el;
    this.isCoarse = window.matchMedia("(pointer: coarse)").matches;
    if (this.isCoarse) this.activeDevice = "touch";

    const kd = (e: KeyboardEvent) => {
      if (e.repeat) return;
      this.keys.add(e.code);
      this.activeDevice = "kbm";
      if (KEY.JUMP.includes(e.code as (typeof KEY.JUMP)[number])) {
        e.preventDefault();
        this.jumpPressed = true;
      }
      if (KEY.RELOAD.includes(e.code as (typeof KEY.RELOAD)[number])) this.reloadPressed = true;
      if (KEY.INTERACT.includes(e.code as (typeof KEY.INTERACT)[number])) this.interactPressed = true;
      if (KEY.PAUSE.includes(e.code as (typeof KEY.PAUSE)[number])) this.pausePressed = true;
      if (KEY.CAMERA.includes(e.code as (typeof KEY.CAMERA)[number])) this.cameraPressed = true;
      if (KEY.BAG.includes(e.code as (typeof KEY.BAG)[number])) {
        e.preventDefault();
        this.bagPressed = true;
      }
      if (KEY.MAP.includes(e.code as (typeof KEY.MAP)[number])) this.mapPressed = true;
      if (KEY.SKILL.includes(e.code as (typeof KEY.SKILL)[number])) this.skillPressed = true;
      if (KEY.TREE.includes(e.code as (typeof KEY.TREE)[number])) this.treePressed = true;
      if (KEY.ARM_1.includes(e.code as (typeof KEY.ARM_1)[number])) this.weaponSlot = 0;
      if (KEY.ARM_2.includes(e.code as (typeof KEY.ARM_2)[number])) this.weaponSlot = 1;
      if (KEY.ARM_3.includes(e.code as (typeof KEY.ARM_3)[number])) this.weaponSlot = 2;
      if (KEY.ARM_4.includes(e.code as (typeof KEY.ARM_4)[number])) this.weaponSlot = 3;
      if (KEY.ARM_5.includes(e.code as (typeof KEY.ARM_5)[number])) this.weaponSlot = 4;
      if (KEY.ARM_6.includes(e.code as (typeof KEY.ARM_6)[number])) this.weaponSlot = 5;
      if (e.code === "ArrowUp" || e.code === "ArrowDown" || e.code === "ArrowLeft" || e.code === "ArrowRight") {
        e.preventDefault();
      }
    };
    const ku = (e: KeyboardEvent) => {
      this.keys.delete(e.code);
    };
    const md = (e: MouseEvent) => {
      this.activeDevice = "kbm";
      if (document.pointerLockElement !== el) return;
      if (e.button === 0) {
        this.mouseFire = true;
        this.firePressed = true;
      }
      if (e.button === 2) this.mouseAds = true;
    };
    const mu = (e: MouseEvent) => {
      if (e.button === 0) this.mouseFire = false;
      if (e.button === 2) this.mouseAds = false;
    };
    const mm = (e: MouseEvent) => {
      if (document.pointerLockElement !== el) return;
      this.lookX += e.movementX;
      this.lookY += e.movementY;
      this.activeDevice = "kbm";
    };
    const wh = (e: WheelEvent) => {
      // Wheel.Up (deltaY < 0) = next · Wheel.Down = prev
      this.weaponDelta += e.deltaY < 0 ? 1 : -1;
      this.activeDevice = "kbm";
    };
    const blur = () => {
      this.keys.clear();
      this.mouseFire = false;
      this.mouseAds = false;
      this.uiFire = false;
      this.uiAds = false;
      this.uiSprint = false;
      this.uiInteract = false;
      this.uiMoveX = 0;
      this.uiMoveY = 0;
      this.fireHeld = false;
      this.adsHeld = false;
      this.sprintHeld = false;
      this.interactHeld = false;
    };
    const ts = (e: TouchEvent) => {
      this.activeDevice = "touch";
      for (const t of Array.from(e.changedTouches)) {
        if (t.clientX < window.innerWidth * 0.42 && this.moveTouch === null) {
          this.moveTouch = t.identifier;
          this.moveOriginX = t.clientX;
          this.moveOriginY = t.clientY;
        } else if (this.lookTouch === null) {
          this.lookTouch = t.identifier;
          this.lastLookX = t.clientX;
          this.lastLookY = t.clientY;
          this.swipeX = t.clientX;
          this.swipeY = t.clientY;
          this.swipeT = performance.now();
          this.touchLookActive = true;
        }
      }
    };
    const tm = (e: TouchEvent) => {
      e.preventDefault();
      for (const t of Array.from(e.touches)) {
        if (t.identifier === this.moveTouch) {
          const dx = t.clientX - this.moveOriginX;
          const dy = t.clientY - this.moveOriginY;
          const max = 54;
          this.touchMoveX = Math.max(-1, Math.min(1, dx / max));
          this.touchMoveY = Math.max(-1, Math.min(1, -dy / max));
        } else if (t.identifier === this.lookTouch) {
          this.lookX += t.clientX - this.lastLookX;
          this.lookY += t.clientY - this.lastLookY;
          this.lastLookX = t.clientX;
          this.lastLookY = t.clientY;
        }
      }
    };
    const te = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier === this.moveTouch) {
          this.moveTouch = null;
          this.touchMoveX = 0;
          this.touchMoveY = 0;
        }
        if (t.identifier === this.lookTouch) {
          this.lookTouch = null;
          this.touchLookActive = false;
          const dt = performance.now() - this.swipeT;
          const dx = t.clientX - this.swipeX;
          const dy = t.clientY - this.swipeY;
          if (dt < SWIPE_MS && Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy) * 1.55) {
            this.weaponDelta += dx > 0 ? 1 : -1;
          }
        }
      }
    };
    const ctx = (e: Event) => e.preventDefault();
    const onVis = () => {
      if (document.hidden) blur();
    };
    const padOn = (e: GamepadEvent) => {
      this.padConnected = true;
      this.padName = e.gamepad.id;
      this.isDualSense = isDualSensePad(e.gamepad);
      this.activeDevice = "pad";
      void this.ds.restore();
    };
    const padOff = () => {
      this.padConnected = navigator.getGamepads?.().some(Boolean) ?? false;
      if (!this.padConnected) this.padName = "";
    };

    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    window.addEventListener("blur", blur);
    document.addEventListener("visibilitychange", onVis);
    el.addEventListener("mousedown", md);
    window.addEventListener("mouseup", mu);
    window.addEventListener("mousemove", mm);
    el.addEventListener("wheel", wh, { passive: true });
    el.addEventListener("contextmenu", ctx);
    el.addEventListener("touchstart", ts, { passive: true });
    el.addEventListener("touchmove", tm, { passive: false });
    el.addEventListener("touchend", te);
    el.addEventListener("touchcancel", te);
    window.addEventListener("gamepadconnected", padOn);
    window.addEventListener("gamepaddisconnected", padOff);

    this._off = () => {
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
      window.removeEventListener("blur", blur);
      document.removeEventListener("visibilitychange", onVis);
      el.removeEventListener("mousedown", md);
      window.removeEventListener("mouseup", mu);
      window.removeEventListener("mousemove", mm);
      el.removeEventListener("wheel", wh);
      el.removeEventListener("contextmenu", ctx);
      el.removeEventListener("touchstart", ts);
      el.removeEventListener("touchmove", tm);
      el.removeEventListener("touchend", te);
      el.removeEventListener("touchcancel", te);
      window.removeEventListener("gamepadconnected", padOn);
      window.removeEventListener("gamepaddisconnected", padOff);
      this.unhookGyro();
      void this.ds.reset();
    };
    void this.ds.restore();
  }

  enableGyro() {
    if (this.gyroHooked) return;
    const DOE = window.DeviceOrientationEvent as unknown as GyroOrient | undefined;
    if (DOE && typeof DOE.requestPermission === "function") {
      void DOE.requestPermission()
        .then((s) => {
          if (s === "granted") this.hookGyro();
        })
        .catch(() => {});
    } else if (window.DeviceOrientationEvent) {
      this.hookGyro();
    }
  }

  private hookGyro() {
    if (this.gyroHooked) return;
    this.gyroHooked = true;
    this.gyroAllowed = true;
    window.addEventListener("deviceorientation", this.onOrient, true);
  }

  private unhookGyro() {
    if (!this.gyroHooked) return;
    window.removeEventListener("deviceorientation", this.onOrient, true);
    this.gyroHooked = false;
    this.lastBeta = null;
    this.lastGamma = null;
  }

  private onOrient = (e: DeviceOrientationEvent) => {
    if (!this.gyroAllowed || this.isCoarse) return;
    if (this.ds.gyroLive && this.padConnected) return;
    if (e.beta == null || e.gamma == null) return;
    if (this.lastBeta == null || this.lastGamma == null) {
      this.lastBeta = e.beta;
      this.lastGamma = e.gamma;
      return;
    }
    let dG = e.gamma - this.lastGamma;
    let dB = e.beta - this.lastBeta;
    if (dG > 180) dG -= 360;
    if (dG < -180) dG += 360;
    if (dB > 180) dB -= 360;
    if (dB < -180) dB += 360;
    if (Math.abs(dG) > 40 || Math.abs(dB) > 40) {
      this.lastBeta = e.beta;
      this.lastGamma = e.gamma;
      return;
    }
    this.lookX += dG * 3.2;
    this.lookY += dB * 3.2;
    this.lastBeta = e.beta;
    this.lastGamma = e.gamma;
    if (Math.abs(dG) + Math.abs(dB) > 0.12) this.activeDevice = "touch";
  };

  setGyroAllowed(on: boolean) {
    this.gyroAllowed = on;
    if (!on) {
      this.lastBeta = null;
      this.lastGamma = null;
    }
  }

  poll() {
    let mx = 0;
    let my = 0;
    if (anyCode(this.keys, KEY.MOVE_FORWARD)) my += 1;
    if (anyCode(this.keys, KEY.MOVE_BACKWARD)) my -= 1;
    if (anyCode(this.keys, KEY.MOVE_RIGHT)) mx += 1;
    if (anyCode(this.keys, KEY.MOVE_LEFT)) mx -= 1;
    mx += this.touchMoveX;
    my += this.touchMoveY;
    mx += this.uiMoveX;
    my += this.uiMoveY;

    const stickSprint = Math.hypot(this.touchMoveX + this.uiMoveX, this.touchMoveY + this.uiMoveY) >= STICK_SPRINT;
    this.sprintHeld = anyCode(this.keys, KEY.SPRINT) || this.uiSprint || stickSprint;
    this.jumpHeld = anyCode(this.keys, KEY.JUMP);

    this.lookStickX = 0;
    this.lookStickY = 0;
    this.pollPad();
    if (this.gyroAllowed) {
      const g = this.ds.consumeGyro(0.011);
      this.lookX += g.x;
      this.lookY += g.y;
    }
    this.ds.apply(this.ankhCharge, this.ankhEquipped, this.lastPad);

    mx += this.padMoveX;
    my += this.padMoveY;

    const len = Math.hypot(mx, my);
    if (len > 1) {
      mx /= len;
      my /= len;
    }
    this.moveX = mx;
    this.moveY = my;
    this.fireHeld = this.mouseFire || this.uiFire || this.padFire;
    this.adsHeld = this.mouseAds || this.uiAds || this.padAds;
    this.interactHeld = anyCode(this.keys, KEY.INTERACT) || this.padInteract || this.uiInteract;
    this.syncActions();
  }

  /** Frozen action frame for this tick — all devices already merged. */
  actions: ActionState = emptyActions();

  private syncActions() {
    this.actions = {
      moveX: this.moveX,
      moveY: this.moveY,
      lookStickX: this.lookStickX,
      lookStickY: this.lookStickY,
      fireHeld: this.fireHeld,
      firePressed: this.firePressed,
      adsHeld: this.adsHeld,
      sprintHeld: this.sprintHeld,
      jumpPressed: this.jumpPressed,
      reloadPressed: this.reloadPressed,
      interactHeld: this.interactHeld,
      interactPressed: this.interactPressed,
      pausePressed: this.pausePressed,
      weaponSlot: this.weaponSlot,
      weaponDelta: this.weaponDelta,
    };
  }

  private padFire = false;
  private padAds = false;
  private padInteract = false;
  private padMoveX = 0;
  private padMoveY = 0;
  private lastPad: Gamepad | null = null;

  private pollPad() {
    this.padFire = false;
    this.padAds = false;
    this.padInteract = false;
    this.padMoveX = 0;
    this.padMoveY = 0;
    this.lastPad = null;
    const pads = navigator.getGamepads?.() ?? [];
    let live = false;
    for (const pad of pads) {
      if (!pad) continue;
      live = true;
      this.lastPad = pad;
      this.padName = pad.id;
      this.isDualSense = isDualSensePad(pad);
      const ax = pad.axes;
      const left = radialDeadzone(ax[0] ?? 0, ax[1] ?? 0, DEADZONE);
      // LeftStick.Y+ is stick-forward. Standard mapping: axis Y −1 is up.
      this.padMoveX += left.x;
      this.padMoveY += -left.y;
      const right = radialDeadzone(ax[2] ?? 0, ax[3] ?? 0, DEADZONE);
      this.lookStickX += right.x;
      this.lookStickY += right.y;

      const btn = (i: number) => pad.buttons[i];
      const pressed = (i: number) => {
        const b = btn(i);
        if (!b) return false;
        return b.pressed || b.value > TRIGGER_GATE;
      };
      const edge = (i: number) => {
        const now = pressed(i);
        const was = this.padPrev[i] ?? false;
        this.padPrev[i] = now;
        if (!this.padPrevInit) return false;
        return now && !was;
      };

      this.padFire = this.padFire || pressed(PAD.FIRE);
      this.padAds = this.padAds || pressed(PAD.ADS);
      this.padInteract = this.padInteract || pressed(PAD.INTERACT);
      if (pressed(PAD.SPRINT) || Math.hypot(left.x, left.y) >= STICK_SPRINT) this.sprintHeld = true;

      if (edge(PAD.FIRE)) this.firePressed = true;
      if (edge(PAD.JUMP)) this.jumpPressed = true;
      if (edge(PAD.RELOAD)) this.reloadPressed = true;
      if (edge(PAD.INTERACT)) this.interactPressed = true;
      if (edge(PAD.PAUSE)) this.pausePressed = true;
      if (edge(PAD.LS)) this.cameraPressed = true;
      if (edge(PAD.SELECT)) this.bagPressed = true;
      if (edge(PAD.CYCLE_NEXT)) this.weaponDelta += 1;
      if (edge(PAD.CYCLE_PREV)) this.weaponDelta -= 1;
      for (const [b, slot] of Object.entries(ARM_FROM_DPAD)) {
        if (edge(Number(b))) this.weaponSlot = slot;
      }

      if (
        pressed(PAD.FIRE) ||
        pressed(PAD.JUMP) ||
        Math.abs(left.x) + Math.abs(left.y) + Math.abs(right.x) + Math.abs(right.y) > 0.2
      ) {
        this.activeDevice = "pad";
      }

      // Only the first live pad writes prev-state edges; skip remaining pads' edge tracking.
      break;
    }
    this.padConnected = live;
    if (!live) {
      this.padPrev.fill(false);
      this.padPrevInit = false;
    } else {
      this.padPrevInit = true;
    }
  }

  consumeLook() {
    const x = this.lookX;
    const y = this.lookY;
    this.lookX = 0;
    this.lookY = 0;
    return { x, y };
  }

  interactGlyph() {
    return INTERACT_GLYPH[this.activeDevice];
  }

  hasActivity() {
    return (
      this.fireHeld ||
      this.firePressed ||
      this.touchLookActive ||
      this.keys.size > 0 ||
      Math.abs(this.moveX) + Math.abs(this.moveY) > 0.04 ||
      Math.abs(this.lookStickX) + Math.abs(this.lookStickY) > 0.04 ||
      this.jumpPressed ||
      this.interactPressed
    );
  }

  endFrame() {
    this.firePressed = false;
    this.jumpPressed = false;
    this.reloadPressed = false;
    this.interactPressed = false;
    this.pausePressed = false;
    this.cameraPressed = false;
    this.bagPressed = false;
    this.mapPressed = false;
    this.skillPressed = false;
    this.treePressed = false;
    this.weaponDelta = 0;
    this.weaponSlot = null;
  }

  setAnkhCharge(charge: number, equipped: boolean) {
    this.ankhCharge = charge;
    this.ankhEquipped = equipped;
  }

  pairDualSense() {
    return this.ds.pair();
  }

  hidSupported() {
    return hidAvailable();
  }

  status() {
    return {
      padName: this.padName,
      connected: this.padConnected,
      dualsense: this.isDualSense,
      hid: this.ds.hidReady,
      path: this.ds.path,
      gyro: this.ds.gyroLive,
    };
  }

  setKeys(codes: string[]) {
    this.keys = new Set(codes);
  }

  ui = {
    fire: (v: boolean) => {
      this.uiFire = v;
      if (v) {
        this.firePressed = true;
        this.activeDevice = "touch";
      }
    },
    ads: (v: boolean) => {
      this.uiAds = v;
      this.activeDevice = "touch";
    },
    jump: () => {
      this.jumpPressed = true;
      this.activeDevice = "touch";
    },
    reload: () => {
      this.reloadPressed = true;
      this.activeDevice = "touch";
    },
    sprint: (v: boolean) => {
      this.uiSprint = v;
      this.activeDevice = "touch";
    },
    interact: () => {
      this.interactPressed = true;
      this.activeDevice = "touch";
    },
    pause: () => {
      this.pausePressed = true;
    },
    arm: (slot: number) => {
      this.weaponSlot = slot;
      this.activeDevice = "touch";
    },
    cycle: (dir: 1 | -1) => {
      this.weaponDelta += dir;
      this.activeDevice = "touch";
    },
    camera: () => {
      this.cameraPressed = true;
      this.activeDevice = "touch";
    },
    bag: () => {
      this.bagPressed = true;
      this.activeDevice = "touch";
    },
    map: () => {
      this.mapPressed = true;
      this.activeDevice = "touch";
    },
    skill: () => {
      this.skillPressed = true;
      this.activeDevice = "touch";
    },
    tree: () => {
      this.treePressed = true;
      this.activeDevice = "touch";
    },
    move: (x: number, y: number) => {
      this.uiMoveX = Math.abs(x) < 0.12 ? 0 : x;
      this.uiMoveY = Math.abs(y) < 0.12 ? 0 : y;
      this.activeDevice = "touch";
    },
  };

  dispose() {
    this._off();
    this.el = null;
    void this.ds.reset();
  }

  private _off: () => void = () => {};
}

declare global {
  interface Window {
    __crimsonInput?: {
      fire: (v: boolean) => void;
      ads: (v: boolean) => void;
      jump: () => void;
      reload: () => void;
      nextWeapon: () => void;
      prevWeapon: () => void;
      sprint: (v: boolean) => void;
      interact: () => void;
      pause: () => void;
      arm: (slot: number) => void;
      camera?: () => void;
      bag?: () => void;
      map?: () => void;
      skill?: () => void;
      tree?: () => void;
      buySkill?: (id: string) => void;
      bindSkill?: (id: string) => void;
      move?: (x: number, y: number) => void;
      gyro?: (v: boolean) => void;
      pairDualSense?: () => Promise<boolean>;
      status?: () => { padName: string; connected: boolean; dualsense: boolean; hid: boolean; path: string; gyro: boolean };
    };
    __crimsonRemain?: () => void;
    __controlsTest?: Record<string, unknown>;
  }
}
