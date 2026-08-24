import { MAP_LANDMARKS, type MapFrame, worldToMapUV } from "./map-art";

export const GITHUB_PROFILE = "https://github.com/heads4281-spec";
export const GITHUB_REPO = "https://github.com/heads4281-spec/vivid-nova-garden-jade";
export const HOLO_ATLAS_HREF = "/html5/holographic-atlas.html";
export const EXTRA_MAPS_HREF = "/html5/extra-maps.html";

export type ExtraMap = {
  id: string;
  x: number;
  z: number;
  label: string;
  epithet: string;
};

/** Extra open-world courts beyond the Six Names cycle. */
export const EXTRA_MAPS: ExtraMap[] = [
  { id: "kaelith", x: 78, z: 68, label: "Kaelith Forge", epithet: "Ember Anvil" },
  { id: "vespera", x: -78, z: 68, label: "Vespera Hollow", epithet: "Whisper Well" },
  { id: "ankh-spire", x: 78, z: -72, label: "Ankh Spire", epithet: "Climb of Law" },
];

export type Waypoint = { id: string; x: number; z: number; label: string };

let waypoint: Waypoint | null = null;

export function getWaypoint() {
  return waypoint;
}

export function setWaypoint(next: Waypoint | null) {
  waypoint = next;
}

export function pickHoloTarget(nx: number, ny: number): Waypoint | null {
  const x = nx * 220 - 110;
  const z = ny * 220 - 110;
  let best: Waypoint | null = null;
  let d0 = 18;
  for (const m of [...MAP_LANDMARKS, ...EXTRA_MAPS]) {
    const d = Math.hypot(m.x - x, m.z - z);
    if (d < d0) {
      d0 = d;
      best = { id: m.id, x: m.x, z: m.z, label: m.label || m.id };
    }
  }
  waypoint = best;
  return best;
}

export function lockWaypoint(id: string): Waypoint | null {
  const m = [...MAP_LANDMARKS, ...EXTRA_MAPS].find((n) => n.id === id);
  if (!m) {
    waypoint = null;
    return null;
  }
  waypoint = { id: m.id, x: m.x, z: m.z, label: m.label || m.id };
  return waypoint;
}

export function toggleFullscreen(el?: HTMLElement | null) {
  const node = el ?? document.documentElement;
  if (!document.fullscreenElement) void node.requestFullscreen?.();
  else void document.exitFullscreen?.();
}

function worldToHolo(x: number, z: number, w: number, h: number) {
  return {
    sx: ((x + 110) / 220) * w,
    sy: ((z + 110) / 220) * h,
  };
}

function holoNoise(x: number, y: number, t: number) {
  const n = Math.sin(x * 12.9898 + y * 78.233 + t * 0.0015) * 43758.5453;
  return n - Math.floor(n);
}

/** Crimson holographic atlas — scanlines, grid, extra maps, live player. */
export function drawHoloAtlas(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  frame: MapFrame | null | undefined,
  t: number,
) {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#050010";
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.translate(w * 0.5, h * 0.58);
  ctx.scale(1, 0.62);
  ctx.rotate((-8 * Math.PI) / 180);
  ctx.translate(-w * 0.5, -h * 0.5);

  ctx.strokeStyle = "rgba(255,0,51,0.12)";
  ctx.lineWidth = 1;
  const step = Math.max(18, Math.floor(w / 22));
  for (let x = 0; x <= w; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y <= h; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(196,30,58,0.85)";
  ctx.lineWidth = 2;
  ctx.shadowColor = "#ff0033";
  ctx.shadowBlur = 14;
  ctx.strokeRect(w * 0.04, h * 0.04, w * 0.92, h * 0.92);
  ctx.shadowBlur = 0;

  const pulse = 0.45 + Math.sin(t * 0.004) * 0.12;
  for (const m of MAP_LANDMARKS) {
    const p = worldToHolo(m.x, m.z, w, h);
    const claimed = Boolean(frame?.runes?.includes(m.id));
    const r = m.kind === "palace" ? 10 : m.kind === "gate" ? 7 : m.kind === "extra" ? 0 : 8;
    if (m.kind === "extra") continue;
    ctx.beginPath();
    ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2);
    ctx.fillStyle = claimed ? `rgba(196,30,58,${0.55 + pulse})` : "rgba(232,197,112,0.45)";
    ctx.fill();
    ctx.strokeStyle = claimed ? "#ff6688" : "#e8c070";
    ctx.lineWidth = 1.4;
    ctx.stroke();
  }

  for (const m of EXTRA_MAPS) {
    const p = worldToHolo(m.x, m.z, w, h);
    ctx.save();
    ctx.translate(p.sx, p.sy);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = `rgba(255,68,0,${0.4 + pulse})`;
    ctx.strokeStyle = "#ff8844";
    ctx.lineWidth = 1.5;
    ctx.fillRect(-6, -6, 12, 12);
    ctx.strokeRect(-6, -6, 12, 12);
    ctx.restore();
  }

  if (frame) {
    const you = worldToHolo(frame.x, frame.z, w, h);
    ctx.save();
    ctx.translate(you.sx, you.sy);
    ctx.rotate(frame.yaw);
    ctx.fillStyle = "#ff4466";
    ctx.beginPath();
    ctx.moveTo(0, -11);
    ctx.lineTo(6, 8);
    ctx.lineTo(0, 4);
    ctx.lineTo(-6, 8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    for (const mark of frame.marks || []) {
      if (mark.kind !== "foe") continue;
      const p = worldToHolo(mark.x, mark.z, w, h);
      ctx.fillStyle = "rgba(255,51,85,0.85)";
      ctx.fillRect(p.sx - 2, p.sy - 2, 4, 4);
    }
  }

  const wp = waypoint;
  if (wp) {
    const p = worldToHolo(wp.x, wp.z, w, h);
    const ring = 10 + Math.sin(t * 0.006) * 4;
    ctx.strokeStyle = "#7df9ff";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(p.sx, p.sy, ring, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();

  const scanY = ((t * 0.08) % (h + 40)) - 20;
  const grad = ctx.createLinearGradient(0, scanY - 18, 0, scanY + 18);
  grad.addColorStop(0, "rgba(0,229,255,0)");
  grad.addColorStop(0.5, "rgba(0,229,255,0.18)");
  grad.addColorStop(1, "rgba(255,0,51,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, scanY - 18, w, 36);

  ctx.globalAlpha = 0.08;
  for (let y = 0; y < h; y += 3) {
    ctx.fillStyle = y % 6 === 0 ? "#00e5ff" : "#ff0033";
    ctx.fillRect(0, y, w, 1);
  }
  ctx.globalAlpha = 1;

  ctx.fillStyle = "rgba(232,213,196,0.88)";
  ctx.font = "11px ui-monospace, SF Mono, Menlo, monospace";
  ctx.fillText("HOLO ATLAS · TYPE VII GROUNDS", 14, 20);
  ctx.fillStyle = "rgba(125,249,255,0.8)";
  ctx.fillText("Kaelith · Vespera · Ankh Spire live", 14, 36);

  if (frame) {
    const uv = worldToMapUV(frame.x, frame.z);
    ctx.fillStyle = "rgba(196,30,58,0.9)";
    ctx.fillText(`FIX ${uv.u.toFixed(2)} / ${uv.v.toFixed(2)}`, 14, h - 16);
  }
}

export function paintHoloNoise(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  const img = ctx.getImageData(0, 0, Math.min(w, 64), 1);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = holoNoise(i, t, t);
    d[i] = 255;
    d[i + 1] = 0;
    d[i + 2] = 40 + n * 40;
    d[i + 3] = 18;
  }
  ctx.putImageData(img, 0, 0);
}
