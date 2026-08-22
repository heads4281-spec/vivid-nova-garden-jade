import { NAMES, WEAPONS } from "./story";
import { SKILLS, SHEET_ART, TREE_ART } from "./skills";

export const ART_URLS: string[] = [
  ...NAMES.map((n) => n.portrait),
  ...WEAPONS.map((w) => w.icon),
  ...SKILLS.map((s) => s.art),
  SHEET_ART,
  TREE_ART,
  "/lore/title-wide.jpg",
  "/lore/palace-approach.jpg",
  "/lore/aelith-monolith.png",
  "/lore/aelith-origin.png",
  "/lore/hunter-face.jpg",
  "/lore/hunter-body.jpg",
  "/ui/pulse-frame.png",
  "/ui/weapon-bag.png",
  "/ui/world-map.jpg",
  "/ui/ember-fortitude.jpg",
  "/arms/arsenal-sheet.jpg",
  "/arms/sovereign-axe.jpg",
  "/arms/sovereign-sword.jpg",
  "/arms/war-scythe.jpg",
  "/arms/rune-lance.jpg",
  "/arms/ember-hammer.jpg",
  "/lore/char-warden.jpg",
  "/lore/char-reaver.jpg",
  "/lore/char-gunner.jpg",
  "/lore/char-weaver.jpg",
  "/lore/construct-titan.jpg",
  "/lore/hunter-hood.jpg",
  "/lore/vaelith-field.jpg",
  "/lore/rynara-basin.jpg",
  "/lore/sanguara-pool.jpg",
  "/lore/nyxara-isles.jpg",
  "/lore/throne-hall.jpg",
  "/lore/palace-stairs.jpg",
  "/lore/sentinel.jpg",
  "/lore/shade.jpg",
  "/lore/construct.jpg",
  "/lore/aelith-ankh-queen.jpg",
  "/lore/aelith-boss.jpg",
  "/lore/knight.jpg",
  "/lore/ankh-gunner.jpg",
  "/textures/floor.jpg",
  "/textures/wall.jpg",
  "/textures/column.jpg",
  "/textures/energy.jpg",
  "/textures/water.jpg",
  "/textures/sky.jpg",
];

const CRITICAL = [
  "/lore/title-wide.jpg",
  "/lore/knight.jpg",
  "/lore/char-warden.jpg",
  "/ui/world-map.jpg",
];

function loadOne(url: string, ms: number): Promise<void> {
  return new Promise((resolve) => {
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.onload = done;
    img.onerror = done;
    img.src = url;
    window.setTimeout(done, ms);
  });
}

export function preloadArt(onProgress?: (p: number) => void): Promise<void> {
  const list = [...new Set(ART_URLS)];
  if (list.length === 0) {
    onProgress?.(1);
    return Promise.resolve();
  }
  onProgress?.(0.08);
  const critical = CRITICAL.filter((u) => list.includes(u));
  const rest = list.filter((u) => !critical.includes(u));
  let done = 0;
  const mark = () => {
    done += 1;
    onProgress?.(Math.min(1, 0.08 + (done / list.length) * 0.92));
  };

  const run = async () => {
    await Promise.all(critical.map((url) => loadOne(url, 1600).then(mark)));
    onProgress?.(Math.max(0.55, done / list.length));
    const batch = 6;
    for (let i = 0; i < rest.length; i += batch) {
      await Promise.all(rest.slice(i, i + batch).map((url) => loadOne(url, 1400).then(mark)));
    }
    onProgress?.(1);
  };

  return Promise.race([
    run(),
    new Promise<void>((resolve) => {
      window.setTimeout(() => {
        onProgress?.(1);
        resolve();
      }, 2800);
    }),
  ]);
}
