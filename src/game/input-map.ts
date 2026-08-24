/**
 * CORE INPUT MAP — Crimson Sovereign
 * One action layer. Every device writes the same actions.
 *
 * MOVE_FORWARD          = W / LeftStick.Y+ / VirtualStick.Up
 * MOVE_BACKWARD         = S / LeftStick.Y- / VirtualStick.Down
 * MOVE_LEFT             = A / LeftStick.X- / VirtualStick.Left
 * MOVE_RIGHT            = D / LeftStick.X+ / VirtualStick.Right
 * LOOK_HORIZONTAL       = Mouse.X / RightStick.X / TouchDrag.X / Gyro.Yaw
 * LOOK_VERTICAL         = Mouse.Y / RightStick.Y / TouchDrag.Y / Gyro.Pitch
 * FIRE                  = LMB / RT / R2 / Touch.Fire
 * ADS                   = RMB / LT / L2 / Touch.ADS   (disabled on Sanguine Pulse)
 * SPRINT                = LeftShift / B / Circle / Hold VirtualStick
 * JUMP                  = Space / A / Cross / Touch.Jump
 * RELOAD                = R / Y / Triangle / Touch.Reload
 * ARM_1_SPARK           = 1 / DPad.Up / Touch.Arm1
 * ARM_2_RUNE            = 2 / DPad.Right / Touch.Arm2
 * ARM_3_SANGUINE        = 3 / DPad.Down / Touch.Arm3
 * ARM_4_ANKH            = 4 / DPad.Left / Touch.Arm4
 * ARM_5_NEEDLE          = 5 / Touch.Arm5
 * ARM_6_RAIL            = 6 / Touch.Arm6
 * CYCLE_ARM_NEXT        = MouseWheel.Up / RB / R1 / SwipeRight
 * CYCLE_ARM_PREV        = MouseWheel.Down / LB / L1 / SwipeLeft
 * INTERACT_RUNE         = F / X / Square / Touch.Interact
 * PAUSE                 = ESC / Menu / Options / Touch.Pause
 */

export type InputAction =
  | "MOVE_FORWARD"
  | "MOVE_BACKWARD"
  | "MOVE_LEFT"
  | "MOVE_RIGHT"
  | "LOOK_HORIZONTAL"
  | "LOOK_VERTICAL"
  | "FIRE"
  | "ADS"
  | "SPRINT"
  | "JUMP"
  | "RELOAD"
  | "ARM_1_SPARK"
  | "ARM_2_RUNE"
  | "ARM_3_SANGUINE"
  | "ARM_4_ANKH"
  | "ARM_5_NEEDLE"
  | "ARM_6_RAIL"
  | "CYCLE_ARM_NEXT"
  | "CYCLE_ARM_PREV"
  | "INTERACT_RUNE"
  | "PAUSE";

export type DeviceKind = "kbm" | "pad" | "touch";

/** Standard Gamepad mapping (W3C). Do not cache the Gamepad object — poll each frame. */
export const PAD = {
  JUMP: 0, // A / Cross
  SPRINT: 1, // B / Circle
  INTERACT: 2, // X / Square
  RELOAD: 3, // Y / Triangle
  CYCLE_PREV: 4, // LB / L1
  CYCLE_NEXT: 5, // RB / R1
  ADS: 6, // LT / L2 (analog .value)
  FIRE: 7, // RT / R2 (analog .value)
  SELECT: 8,
  PAUSE: 9, // Menu / Options
  LS: 10,
  RS: 11,
  DPAD_UP: 12, // ARM 1 Spark
  DPAD_DOWN: 13, // ARM 3 Sanguine
  DPAD_LEFT: 14, // ARM 4 Ankh
  DPAD_RIGHT: 15, // ARM 2 Rune
} as const;

export const KEY = {
  MOVE_FORWARD: ["KeyW", "ArrowUp"],
  MOVE_BACKWARD: ["KeyS", "ArrowDown"],
  MOVE_LEFT: ["KeyA", "ArrowLeft"],
  MOVE_RIGHT: ["KeyD", "ArrowRight"],
  SPRINT: ["ShiftLeft", "ShiftRight"],
  JUMP: ["Space"],
  RELOAD: ["KeyR"],
  ARM_1: ["Digit1", "Numpad1"],
  ARM_2: ["Digit2", "Numpad2"],
  ARM_3: ["Digit3", "Numpad3"],
  ARM_4: ["Digit4", "Numpad4"],
  ARM_5: ["Digit5", "Numpad5"],
  ARM_6: ["Digit6", "Numpad6"],
  CAMERA: ["KeyV"],
  BAG: ["KeyI", "KeyTab", "KeyX", "KeyB"],
  MAP: ["KeyM"],
  INTERACT: ["KeyF"],
  SKILL: ["KeyQ", "KeyG"],
  TREE: ["KeyK"],
  PAUSE: ["Escape"],
} as const;

export const ARM_FROM_DPAD: Record<number, number> = {
  [PAD.DPAD_UP]: 0,
  [PAD.DPAD_RIGHT]: 1,
  [PAD.DPAD_DOWN]: 2,
  [PAD.DPAD_LEFT]: 3,
};

export const DEADZONE = 0.16;
export const TRIGGER_GATE = 0.32;
export const STICK_SPRINT = 0.88;
export const SWIPE_PX = 72;
export const SWIPE_MS = 280;

export const CONTROL_LEGEND: { action: string; kbm: string; pad: string; touch: string }[] = [
  { action: "Move", kbm: "WASD", pad: "Left stick", touch: "Virtual stick" },
  { action: "Look", kbm: "Mouse", pad: "Right stick", touch: "Drag" },
  { action: "Fine aim", kbm: "—", pad: "Gyro (optional)", touch: "Gyro" },
  { action: "Fire / charge Ankh", kbm: "LMB", pad: "RT / R2", touch: "Fire" },
  { action: "ADS", kbm: "RMB", pad: "LT / L2", touch: "ADS" },
  { action: "Sprint", kbm: "Shift", pad: "B / Circle", touch: "Hold stick" },
  { action: "Jump", kbm: "Space", pad: "A / Cross", touch: "Jump" },
  { action: "Backflip", kbm: "S + Space / Ctrl + Space", pad: "Back + A", touch: "Pull stick + Jump" },
  { action: "Reload", kbm: "R", pad: "Y / Triangle", touch: "Reload" },
  { action: "Arm select", kbm: "1–6", pad: "D-Pad / LB RB", touch: "Arm 1–6" },
  { action: "Cycle arm", kbm: "Wheel", pad: "LB / RB", touch: "Swipe" },
  { action: "Claim rune", kbm: "F", pad: "X / Square", touch: "Claim" },
  { action: "Camera", kbm: "V", pad: "L3", touch: "View" },
  { action: "Weapon bag", kbm: "I / X / Tab", pad: "Select", touch: "Bag" },
  { action: "Open map", kbm: "M", pad: "Touch pad", touch: "Map" },
  { action: "Holo waypoint", kbm: "M · click court", pad: "Touch pad", touch: "Map · tap court" },
  { action: "Fullscreen", kbm: "Title / atlas", pad: "—", touch: "Title / atlas" },
  { action: "Active skill", kbm: "Q", pad: "—", touch: "Ember" },
  { action: "Skill tree", kbm: "K", pad: "—", touch: "Tree" },
  { action: "Ankh resistance", kbm: "—", pad: "R2 adaptive", touch: "—" },
];

export const PAD_BLURB =
  "Left stick move · Right stick look · RT fire · LT ADS · A jump · B sprint · Y reload · X claim · LB/RB cycle · D-Pad arms · Menu pause · Gyro fine aim";

export const INTERACT_GLYPH: Record<DeviceKind, string> = {
  kbm: "F",
  pad: "X",
  touch: "CLAIM",
};

export function radialDeadzone(x: number, y: number, dz = DEADZONE): { x: number; y: number } {
  const m = Math.hypot(x, y);
  if (m < dz) return { x: 0, y: 0 };
  const scale = (m - dz) / (1 - dz) / m;
  return { x: x * scale, y: y * scale };
}

export type ActionState = {
  moveX: number;
  moveY: number;
  lookStickX: number;
  lookStickY: number;
  fireHeld: boolean;
  firePressed: boolean;
  adsHeld: boolean;
  sprintHeld: boolean;
  jumpPressed: boolean;
  reloadPressed: boolean;
  interactHeld: boolean;
  interactPressed: boolean;
  pausePressed: boolean;
  weaponSlot: number | null;
  weaponDelta: number;
};

export function emptyActions(): ActionState {
  return {
    moveX: 0,
    moveY: 0,
    lookStickX: 0,
    lookStickY: 0,
    fireHeld: false,
    firePressed: false,
    adsHeld: false,
    sprintHeld: false,
    jumpPressed: false,
    reloadPressed: false,
    interactHeld: false,
    interactPressed: false,
    pausePressed: false,
    weaponSlot: null,
    weaponDelta: 0,
  };
}

export function anyCode(keys: Set<string>, codes: readonly string[]) {
  for (const c of codes) if (keys.has(c)) return true;
  return false;
}

