export type FireKind = "hitscan" | "projectile" | "beam" | "rail" | "melee";
export type WeaponId = number;
export type Unlock = "vaelith" | "rynara" | "sanguara" | "nyxara" | "eryndra" | "aelith" | null;

export const VIEW = {
  rifle: 0,
  caster: 1,
  smg: 2,
  beam: 3,
  sniper: 4,
  rail: 5,
  axe: 6,
  sword: 7,
  scythe: 8,
  lance: 9,
  hammer: 10,
  fist: 11,
} as const;

export type WeaponDef = {
  id: WeaponId;
  name: string;
  nameKey: string;
  fire: FireKind;
  view: number;
  automatic: boolean;
  cooldown: number;
  damage: number;
  mag: number;
  reserve: number;
  reload: number;
  spread: number;
  recoil: number;
  range: number;
  zoom: number;
  icon: string;
  desc: string;
  unlock: Unlock;
  cat: "axe" | "blade" | "pole" | "gun" | "exotic";
};

const AXE = "/arms/sovereign-axe.jpg";
const SWORD = "/arms/sovereign-sword.jpg";
const SCYTHE = "/arms/war-scythe.jpg";
const LANCE = "/arms/rune-lance.jpg";
const HAMMER = "/arms/ember-hammer.jpg";
const SPARK = "/arms/spark.jpg";
const RUNE = "/arms/rune.jpg";
const PULSE = "/arms/pulse.jpg";
const ANKH = "/arms/ankh.jpg";
const NEEDLE = "/arms/needle.jpg";
const RAIL = "/arms/rail.jpg";
const FIST = "/ui/ember-fortitude.jpg";

function w(
  id: number,
  name: string,
  nameKey: string,
  fire: FireKind,
  view: number,
  cat: WeaponDef["cat"],
  icon: string,
  stats: Partial<WeaponDef> & Pick<WeaponDef, "damage" | "cooldown">,
): WeaponDef {
  const melee = fire === "melee";
  return {
    id,
    name,
    nameKey,
    fire,
    view,
    cat,
    icon,
    automatic: stats.automatic ?? false,
    cooldown: stats.cooldown,
    damage: stats.damage,
    mag: stats.mag ?? (melee ? 1 : 16),
    reserve: stats.reserve ?? (melee ? 1 : 64),
    reload: stats.reload ?? (melee ? 0.08 : 1.7),
    spread: stats.spread ?? (melee ? 0.08 : 0.01),
    recoil: stats.recoil ?? (melee ? 0.03 : 0.02),
    range: stats.range ?? (melee ? 3.6 : 140),
    zoom: stats.zoom ?? 62,
    desc: stats.desc ?? name,
    unlock: stats.unlock ?? null,
  };
}

export const WEAPONS: WeaponDef[] = [
  w(0, "Spark Rifle", "Vaelith", "hitscan", VIEW.rifle, "gun", SPARK, { damage: 28, cooldown: 0.16, mag: 22, reserve: 88, reload: 1.55, spread: 0.006, recoil: 0.018, range: 180, zoom: 52, desc: "First-flame coil. Precise crimson pulse." }),
  w(1, "Rune Caster", "Rynara", "projectile", VIEW.caster, "gun", RUNE, { damage: 54, cooldown: 0.62, mag: 6, reserve: 24, reload: 2.1, spread: 0, recoil: 0.04, range: 90, desc: "Living-law grenade. Arcs and detonates." }),
  w(2, "Sanguine Pulse", "Sanguara", "hitscan", VIEW.smg, "gun", PULSE, { damage: 12, cooldown: 0.068, automatic: true, mag: 38, reserve: 152, reload: 1.7, spread: 0.018, recoil: 0.01, range: 90, zoom: 70, desc: "Blood-tide SMG. Hold to flood the dark." }),
  w(3, "Ankh Beam", "Aelith", "beam", VIEW.beam, "gun", ANKH, { damage: 96, cooldown: 0.9, mag: 8, reserve: 24, reload: 2.4, spread: 0, recoil: 0.05, range: 200, zoom: 48, unlock: "eryndra", desc: "Hold to charge five Names into a Type VII lance." }),
  w(4, "Night Needle", "Nyxara", "hitscan", VIEW.sniper, "gun", NEEDLE, { damage: 96, cooldown: 0.95, mag: 4, reserve: 20, reload: 2.25, spread: 0.024, recoil: 0.058, range: 280, zoom: 22, desc: "Nyxara's night pin. Hold ADS. One shot, one Name." }),
  w(5, "Eclipse Rail", "Type VII", "rail", VIEW.rail, "gun", RAIL, { damage: 46, cooldown: 0.48, mag: 10, reserve: 40, reload: 1.9, spread: 0.004, recoil: 0.032, range: 220, zoom: 44, desc: "Twin plasma rails pierce every wraith in line." }),
  w(6, "Crimson Sovereign Axe", "Blood Crown", "melee", VIEW.axe, "axe", AXE, { damage: 62, cooldown: 0.52, desc: "Ankh-crowned greataxe. Cleaves lesser souls." }),
  w(7, "Ember Cleaver", "Vaelith", "melee", VIEW.axe, "axe", AXE, { damage: 48, cooldown: 0.42 }),
  w(8, "Bloodfang Greataxe", "Sanguara", "melee", VIEW.axe, "axe", AXE, { damage: 74, cooldown: 0.7 }),
  w(9, "Nightfall Axe", "Nyxara", "melee", VIEW.axe, "axe", AXE, { damage: 58, cooldown: 0.55 }),
  w(10, "Pylon Breaker", "Vaelith", "melee", VIEW.axe, "axe", AXE, { damage: 80, cooldown: 0.82 }),
  w(11, "Ember Warhammer", "Vaelith", "melee", VIEW.hammer, "axe", HAMMER, { damage: 88, cooldown: 0.9, desc: "Crystal-core maul. Shatters constructs." }),
  w(12, "Crystal Maul", "Rynara", "melee", VIEW.hammer, "axe", HAMMER, { damage: 70, cooldown: 0.78 }),
  w(13, "Throne Crusher", "Eryndra", "melee", VIEW.hammer, "axe", HAMMER, { damage: 96, cooldown: 1.05, unlock: "eryndra" }),
  w(14, "Rune Sledge", "Rynara", "melee", VIEW.hammer, "axe", HAMMER, { damage: 64, cooldown: 0.72 }),
  w(15, "Crimson Sovereign Sword", "Blood Crown", "melee", VIEW.sword, "blade", SWORD, { damage: 44, cooldown: 0.34, desc: "Blood reigns. Souls obey." }),
  w(16, "Spark Longsword", "Vaelith", "melee", VIEW.sword, "blade", SWORD, { damage: 38, cooldown: 0.3 }),
  w(17, "Lawblade", "Rynara", "melee", VIEW.sword, "blade", SWORD, { damage: 42, cooldown: 0.36 }),
  w(18, "Sanguine Saber", "Sanguara", "melee", VIEW.sword, "blade", SWORD, { damage: 36, cooldown: 0.26 }),
  w(19, "Night Reaver", "Nyxara", "melee", VIEW.sword, "blade", SWORD, { damage: 50, cooldown: 0.4 }),
  w(20, "Ankh Edge", "Aelith", "melee", VIEW.sword, "blade", SWORD, { damage: 56, cooldown: 0.44, unlock: "eryndra" }),
  w(21, "Shadow Dagger", "Nyxara", "melee", VIEW.sword, "blade", SWORD, { damage: 22, cooldown: 0.16, range: 2.4 }),
  w(22, "Twin Rune Blades", "Rynara", "melee", VIEW.sword, "blade", SWORD, { damage: 28, cooldown: 0.2, automatic: true }),
  w(23, "Wraithfang", "Nyxara", "melee", VIEW.sword, "blade", SWORD, { damage: 34, cooldown: 0.28 }),
  w(24, "Construct Slicer", "Type VII", "melee", VIEW.sword, "blade", SWORD, { damage: 40, cooldown: 0.32 }),
  w(25, "Rune Lance", "Rynara", "melee", VIEW.lance, "pole", LANCE, { damage: 60, cooldown: 0.58, range: 5.2, desc: "Law written on a spear-point." }),
  w(26, "Sanguine Scythe", "Sanguara", "melee", VIEW.scythe, "pole", SCYTHE, { damage: 68, cooldown: 0.64, range: 4.4, desc: "He who rules in blood reaps in eternity." }),
  w(27, "Night Halberd", "Nyxara", "melee", VIEW.lance, "pole", LANCE, { damage: 54, cooldown: 0.6, range: 4.8 }),
  w(28, "Blood Spear", "Sanguara", "melee", VIEW.lance, "pole", LANCE, { damage: 46, cooldown: 0.48, range: 5.0 }),
  w(29, "Ember Pike", "Vaelith", "melee", VIEW.lance, "pole", LANCE, { damage: 52, cooldown: 0.55, range: 5.4 }),
  w(30, "Throne Glaive", "Eryndra", "melee", VIEW.scythe, "pole", SCYTHE, { damage: 72, cooldown: 0.7, unlock: "eryndra" }),
  w(31, "Ankh Partisan", "Aelith", "melee", VIEW.lance, "pole", LANCE, { damage: 64, cooldown: 0.62, unlock: "eryndra" }),
  w(32, "Precision Coil Rifle", "Vaelith", "hitscan", VIEW.rifle, "gun", SPARK, { damage: 34, cooldown: 0.2, mag: 18, reserve: 72, spread: 0.004, recoil: 0.016, range: 200, zoom: 44 }),
  w(33, "Sanguine Pulse SMG", "Sanguara", "hitscan", VIEW.smg, "gun", PULSE, { damage: 10, cooldown: 0.055, automatic: true, mag: 44, reserve: 176, spread: 0.022, recoil: 0.011, range: 80 }),
  w(34, "Ankh Beam Lance", "Aelith", "beam", VIEW.beam, "gun", ANKH, { damage: 110, cooldown: 1.0, mag: 6, reserve: 18, unlock: "eryndra", range: 220, recoil: 0.055 }),
  w(35, "Rune Caster Launcher", "Rynara", "projectile", VIEW.caster, "gun", RUNE, { damage: 70, cooldown: 0.78, mag: 4, reserve: 16, recoil: 0.048 }),
  w(36, "Ember Sidearm", "Vaelith", "hitscan", VIEW.rifle, "gun", SPARK, { damage: 22, cooldown: 0.22, mag: 12, reserve: 60, spread: 0.012, recoil: 0.03, range: 70 }),
  w(37, "Night Sniper", "Nyxara", "hitscan", VIEW.sniper, "gun", NEEDLE, { damage: 120, cooldown: 1.15, mag: 3, reserve: 15, spread: 0.02, recoil: 0.072, range: 320, zoom: 18 }),
  w(38, "Blood Repeater", "Sanguara", "hitscan", VIEW.smg, "gun", PULSE, { damage: 16, cooldown: 0.09, automatic: true, mag: 28, reserve: 112, recoil: 0.014 }),
  w(39, "Law Disruptor", "Rynara", "projectile", VIEW.caster, "gun", RUNE, { damage: 40, cooldown: 0.5, mag: 8, reserve: 32, recoil: 0.036 }),
  w(40, "Crystal Carbine", "Rynara", "hitscan", VIEW.rifle, "gun", SPARK, { damage: 24, cooldown: 0.14, automatic: true, mag: 26, reserve: 104, spread: 0.01, recoil: 0.015 }),
  w(41, "Wraith Pistol", "Nyxara", "hitscan", VIEW.rifle, "gun", SPARK, { damage: 18, cooldown: 0.18, mag: 10, reserve: 50, spread: 0.014, recoil: 0.032, range: 60 }),
  w(42, "Sentinel Lance Gun", "Type VII", "rail", VIEW.rail, "gun", RAIL, { damage: 38, cooldown: 0.4, mag: 12, reserve: 48, recoil: 0.028 }),
  w(43, "Glyph Chakram", "Rynara", "projectile", VIEW.caster, "exotic", RUNE, { damage: 32, cooldown: 0.36, mag: 10, reserve: 40, desc: "Returning law-disc." }),
  w(44, "Living Blood Whip", "Sanguara", "melee", VIEW.scythe, "exotic", SCYTHE, { damage: 30, cooldown: 0.28, range: 6.2, automatic: true }),
  w(45, "Shadow Claws", "Nyxara", "melee", VIEW.fist, "exotic", FIST, { damage: 26, cooldown: 0.18, range: 2.6, automatic: true }),
  w(46, "Pylon Gauntlets", "Vaelith", "melee", VIEW.fist, "exotic", FIST, { damage: 40, cooldown: 0.4, range: 2.8 }),
  w(47, "Ankh Shield Blade", "Aelith", "melee", VIEW.sword, "exotic", SWORD, { damage: 48, cooldown: 0.5, unlock: "eryndra" }),
  w(48, "Rune Orb Staff", "Rynara", "projectile", VIEW.caster, "exotic", RUNE, { damage: 58, cooldown: 0.7, mag: 5, reserve: 20 }),
  w(49, "Canal Trident", "Sanguara", "melee", VIEW.lance, "exotic", LANCE, { damage: 50, cooldown: 0.5, range: 5.6 }),
  w(50, "Night Bow", "Nyxara", "hitscan", VIEW.sniper, "exotic", NEEDLE, { damage: 64, cooldown: 0.7, mag: 1, reserve: 30, spread: 0.008, recoil: 0.042, range: 160, zoom: 36 }),
  w(51, "Ember Greatbow", "Vaelith", "hitscan", VIEW.sniper, "exotic", NEEDLE, { damage: 84, cooldown: 0.95, mag: 1, reserve: 24, recoil: 0.052, range: 200, zoom: 32 }),
  w(52, "Construct Breaker Cannon", "Type VII", "rail", VIEW.rail, "exotic", RAIL, { damage: 90, cooldown: 1.2, mag: 3, reserve: 12, recoil: 0.08 }),
  w(53, "Sovereign Residue Blade", "Blood Crown", "melee", VIEW.sword, "exotic", SWORD, { damage: 55, cooldown: 0.38 }),
  w(54, "Final Form Edge", "Aelith", "melee", VIEW.scythe, "exotic", SCYTHE, { damage: 120, cooldown: 0.55, range: 5.5, unlock: "aelith", desc: "Unlocked when Aelith falls." }),
  w(55, "Ember Fortitude", "Sovereign", "melee", VIEW.fist, "exotic", FIST, { damage: 34, cooldown: 0.32, range: 2.5, desc: "Crystal fists. Channel Q for Ember Resilience." }),
];

export const CHARACTERS = [
  { id: "warden", name: "Ankh Warden", epithet: "Threshold oath", portrait: "/lore/char-warden.jpg" },
  { id: "reaver", name: "Night Reaver", epithet: "Dual-blade storm", portrait: "/lore/char-reaver.jpg" },
  { id: "gunner", name: "Void Gunner", epithet: "Coil and lightning", portrait: "/lore/char-gunner.jpg" },
  { id: "weaver", name: "Blood Weaver", epithet: "Canal tide", portrait: "/lore/char-weaver.jpg" },
  { id: "hunter", name: "Hooded Hunter", epithet: "First eye", portrait: "/lore/hunter-hood.jpg" },
] as const;

export type CharacterId = (typeof CHARACTERS)[number]["id"];

export const CATS: { id: WeaponDef["cat"]; label: string }[] = [
  { id: "gun", label: "Arms" },
  { id: "axe", label: "Axes" },
  { id: "blade", label: "Blades" },
  { id: "pole", label: "Poles" },
  { id: "exotic", label: "Exotic" },
];
