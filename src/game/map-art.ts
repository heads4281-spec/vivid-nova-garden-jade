export const MAP_LANDMARKS: { id: string; x: number; z: number; kind: "rune" | "gate" | "palace" | "extra"; label?: string }[] = [
  { id: "vaelith", x: 0, z: -82, kind: "rune", label: "Vaelith" },
  { id: "rynara", x: -78, z: 0, kind: "rune", label: "Rynara" },
  { id: "sanguara", x: 80, z: 4, kind: "rune", label: "Sanguara" },
  { id: "nyxara", x: -52, z: -52, kind: "rune", label: "Nyxara" },
  { id: "eryndra", x: 0, z: -15, kind: "rune", label: "Eryndra" },
  { id: "gate", x: 0, z: 22, kind: "gate", label: "Gate" },
  { id: "palace", x: 0, z: -8, kind: "palace", label: "Palace" },
  { id: "spawn", x: 0, z: 68, kind: "palace", label: "Threshold" },
  { id: "kaelith", x: 78, z: 68, kind: "extra", label: "Kaelith Forge" },
  { id: "vespera", x: -78, z: 68, kind: "extra", label: "Vespera Hollow" },
  { id: "ankh-spire", x: 78, z: -72, kind: "extra", label: "Ankh Spire" },
];

export type MapMark = { x: number; z: number; kind: "foe" | "ammo" | "health" };

export type MapFrame = {
  x: number;
  z: number;
  yaw: number;
  marks: MapMark[];
  runes: string[];
  gateOpen: boolean;
};

type Cal = { x: number; z: number; u: number; v: number };

/**
 * Painted atlas landmarks (world-map.jpg):
 * Nyxara top, palace center, Threshold bottom, Vaelith left, Sanguara right, Rynara lower-left.
 * Inverse-distance maps live world coords onto that painting.
 */
const CAL: Cal[] = [
  { x: 0, z: 68, u: 0.5, v: 0.9 },
  { x: 0, z: 48, u: 0.5, v: 0.8 },
  { x: 0, z: 22, u: 0.5, v: 0.66 },
  { x: 0, z: -8, u: 0.5, v: 0.48 },
  { x: 0, z: -15, u: 0.5, v: 0.4 },
  { x: 0, z: -82, u: 0.2, v: 0.4 },
  { x: -78, z: 0, u: 0.2, v: 0.78 },
  { x: 80, z: 4, u: 0.84, v: 0.46 },
  { x: -52, z: -52, u: 0.42, v: 0.1 },
  { x: 40, z: 10, u: 0.7, v: 0.52 },
  { x: -40, z: 10, u: 0.32, v: 0.58 },
  { x: 78, z: 68, u: 0.86, v: 0.86 },
  { x: -78, z: 68, u: 0.14, v: 0.86 },
  { x: 78, z: -72, u: 0.86, v: 0.18 },
];

let atlas: HTMLImageElement | null = null;
const atlasWaiters: Array<() => void> = [];

export function ensureMapArt() {
  if (!atlas) {
    atlas = new Image();
    atlas.crossOrigin = "anonymous";
    atlas.decoding = "async";
    atlas.onload = () => {
      for (const fn of atlasWaiters.splice(0)) fn();
    };
    atlas.src = "/ui/world-map.jpg";
  }
  return atlas;
}

export function onMapArtReady(fn: () => void) {
  const img = ensureMapArt();
  if (img.complete && img.naturalWidth > 0) fn();
  else atlasWaiters.push(fn);
}

export function worldToMapUV(x: number, z: number) {
  let wu = 0;
  let wv = 0;
  let w = 0;
  for (const c of CAL) {
    const dx = x - c.x;
    const dz = z - c.z;
    const d2 = dx * dx + dz * dz;
    if (d2 < 0.25) return { u: c.u, v: c.v };
    const wt = 1 / (d2 * d2);
    wu += c.u * wt;
    wv += c.v * wt;
    w += wt;
  }
  return {
    u: Math.min(0.98, Math.max(0.02, wu / w)),
    v: Math.min(0.98, Math.max(0.02, wv / w)),
  };
}

/** Canvas heading so the pip points the way the hunter is actually walking on the painting. */
export function headingOnMap(x: number, z: number, yaw: number) {
  const here = worldToMapUV(x, z);
  const ahead = worldToMapUV(x - Math.sin(yaw) * 10, z - Math.cos(yaw) * 10);
  return Math.atan2(ahead.u - here.u, -(ahead.v - here.v));
}

export function drawSatNav(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  frame: MapFrame | null | undefined,
  waypoint?: { x: number; z: number } | null,
) {
  if (!frame || !w || !h) return;
  ensureMapArt();
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) * 0.48;
  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();

  const you = worldToMapUV(frame.x, frame.z);
  const zoom = 2.35;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(zoom, zoom);
  ctx.translate(-you.u * w, -you.v * h);
  if (atlas && atlas.complete && atlas.naturalWidth > 0) {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(atlas, 0, 0, w, h);
  } else {
    ctx.fillStyle = "#140308";
    ctx.fillRect(0, 0, w, h);
  }
  ctx.restore();
  ctx.fillStyle = "rgba(8,0,2,0.12)";
  ctx.fillRect(0, 0, w, h);

  const pip = (x: number, z: number) => {
    const uv = worldToMapUV(x, z);
    return {
      sx: cx + (uv.u - you.u) * w * zoom,
      sy: cy + (uv.v - you.v) * h * zoom,
    };
  };

  for (const mark of MAP_LANDMARKS) {
    const p = pip(mark.x, mark.z);
    if (mark.kind === "extra") {
      ctx.save();
      ctx.translate(p.sx, p.sy);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = "#ff8844";
      ctx.strokeStyle = "#ffe0c0";
      ctx.lineWidth = 1.2;
      ctx.fillRect(-3.5, -3.5, 7, 7);
      ctx.strokeRect(-3.5, -3.5, 7, 7);
      ctx.restore();
      continue;
    }
    if (mark.kind !== "rune") continue;
    const claimed = (frame.runes || []).includes(mark.id);
    ctx.fillStyle = claimed ? "#c41e3a" : "#e8c070";
    ctx.strokeStyle = claimed ? "#ff6688" : "#fff4c8";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(p.sx, p.sy, claimed ? 6 : 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  const gate = pip(0, 22);
  ctx.fillStyle = frame.gateOpen ? "#44dd88" : "#c41e3a";
  ctx.fillRect(gate.sx - 4, gate.sy - 4, 8, 8);

  for (const m of frame.marks || []) {
    const p = pip(m.x, m.z);
    if (m.kind === "foe") {
      ctx.fillStyle = "#ff3355";
      ctx.fillRect(p.sx - 2, p.sy - 2, 4, 4);
    } else if (m.kind === "ammo") {
      ctx.fillStyle = "#88ccee";
      ctx.fillRect(p.sx - 1.5, p.sy - 1.5, 3, 3);
    } else {
      ctx.fillStyle = "#44dd88";
      ctx.beginPath();
      ctx.arc(p.sx, p.sy, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(headingOnMap(frame.x, frame.z, frame.yaw));
  ctx.fillStyle = "#ff4466";
  ctx.beginPath();
  ctx.moveTo(0, -9);
  ctx.lineTo(5.5, 7);
  ctx.lineTo(0, 3);
  ctx.lineTo(-5.5, 7);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#e8d5c4";
  ctx.lineWidth = 1.3;
  ctx.stroke();
  ctx.restore();

  if (waypoint) {
    const p = pip(waypoint.x, waypoint.z);
    ctx.strokeStyle = "#7df9ff";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(p.sx, p.sy, 8, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}
