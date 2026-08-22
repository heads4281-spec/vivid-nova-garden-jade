export type Branch = "strength" | "magic" | "attack" | "minerals";
export type ActiveKind = "fortitude" | "surge" | "lunge" | "tide" | "carapace" | "coil" | "whisper" | "ritual";

export type SkillDef = {
  id: string;
  name: string;
  branch: Branch;
  tier: 1 | 2 | 3 | 4;
  cost: number;
  requires?: string;
  active?: ActiveKind;
  dmg?: number;
  resist?: number;
  speed?: number;
  crit?: number;
  mag?: number;
  life?: number;
  icon: string;
  art: string;
  desc: string;
};

const SHEET = "/ui/skill-sheet.jpg";
const TREE = "/ui/skill-tree.jpg";
const CARD = "/ui/ember-fortitude.jpg";

export const BRANCHES: { id: Branch; label: string; line: string }[] = [
  { id: "strength", label: "Strength", line: "Power. Dominion. Endurance." },
  { id: "magic", label: "Magic", line: "Reality. Will. Domination." },
  { id: "attack", label: "Attack", line: "Cruelty. Precision. Execution." },
  { id: "minerals", label: "Minerals", line: "Wealth. Essence. Ascension." },
];

export const SKILLS: SkillDef[] = [
  { id: "ember-fortitude", name: "Ember Fortitude", branch: "strength", tier: 1, cost: 0, active: "fortitude", resist: 0.06, icon: CARD, art: CARD, desc: "Fists of crystal. Channel to endure." },
  { id: "night-carapace", name: "Night Carapace", branch: "strength", tier: 1, cost: 1, requires: "ember-fortitude", active: "carapace", resist: 0.05, icon: "/lore/skill-carapace.jpg", art: "/lore/skill-carapace.jpg", desc: "Black crystal plates the blood." },
  { id: "blood-endurance", name: "Blood Endurance", branch: "strength", tier: 1, cost: 1, life: 18, icon: "/lore/skill-vial.jpg", art: "/lore/skill-vial.jpg", desc: "The vial drinks hurt and returns it as heat." },
  { id: "crystal-hide", name: "Crystal Hide", branch: "strength", tier: 2, cost: 1, requires: "night-carapace", resist: 0.08, icon: "/lore/skill-hide.jpg", art: "/lore/skill-hide.jpg", desc: "Hide thickens. Lesser souls glance off." },
  { id: "iron-pulse", name: "Iron Pulse", branch: "strength", tier: 2, cost: 1, requires: "blood-endurance", life: 12, resist: 0.04, icon: "/lore/skill-vial.jpg", art: "/lore/skill-vial.jpg", desc: "Heartbeat hammers the palace floor." },
  { id: "throne-guard", name: "Throne Guard", branch: "strength", tier: 2, cost: 1, requires: "ember-fortitude", resist: 0.07, icon: "/lore/skill-colossus.jpg", art: "/lore/skill-colossus.jpg", desc: "The gate's oath sits on your shoulders." },
  { id: "dominion-stance", name: "Dominion Stance", branch: "strength", tier: 3, cost: 2, requires: "crystal-hide", dmg: 0.08, resist: 0.06, icon: "/lore/skill-hide.jpg", art: "/lore/skill-hide.jpg", desc: "Feet planted. The world yields." },
  { id: "colossus-step", name: "Colossus Step", branch: "strength", tier: 3, cost: 2, requires: "iron-pulse", speed: 0.08, icon: "/lore/skill-colossus.jpg", art: "/lore/skill-colossus.jpg", desc: "Each stride cracks the canals." },
  { id: "sovereign-aegis", name: "Sovereign Aegis", branch: "strength", tier: 4, cost: 2, requires: "dominion-stance", resist: 0.12, life: 20, icon: "/lore/skill-carapace.jpg", art: "/lore/skill-carapace.jpg", desc: "The crown's last wall." },

  { id: "tide-invocation", name: "Tide Invocation", branch: "magic", tier: 1, cost: 1, active: "tide", icon: "/lore/skill-tide.jpg", art: "/lore/skill-tide.jpg", desc: "Red water rises and answers." },
  { id: "law-script", name: "Law Script", branch: "magic", tier: 1, cost: 1, mag: 0.1, icon: "/lore/skill-glyphs.jpg", art: "/lore/skill-glyphs.jpg", desc: "Runes rewrite the magazine." },
  { id: "rune-orbit", name: "Rune Orbit", branch: "magic", tier: 1, cost: 1, dmg: 0.06, icon: "/lore/skill-glyphs.jpg", art: "/lore/skill-glyphs.jpg", desc: "Living glyphs circle the barrel." },
  { id: "night-veil", name: "Night Veil", branch: "magic", tier: 2, cost: 1, requires: "tide-invocation", speed: 0.06, icon: "/lore/skill-whisper.jpg", art: "/lore/skill-whisper.jpg", desc: "The dark forgets you for a breath." },
  { id: "blood-tide", name: "Blood Tide", branch: "magic", tier: 2, cost: 1, requires: "tide-invocation", life: 10, icon: "/lore/skill-tide.jpg", art: "/lore/skill-tide.jpg", desc: "Canals feed the hunter." },
  { id: "glyph-storm", name: "Glyph Storm", branch: "magic", tier: 2, cost: 1, requires: "rune-orbit", dmg: 0.08, icon: "/lore/skill-glyphs.jpg", art: "/lore/skill-glyphs.jpg", desc: "Law falls like red hail." },
  { id: "dominion-mind", name: "Dominion Mind", branch: "magic", tier: 3, cost: 2, requires: "law-script", mag: 0.12, icon: "/lore/rynara.jpg", art: "/lore/rynara.jpg", desc: "The staff thinks with you." },
  { id: "void-whisper", name: "Void Whisper", branch: "magic", tier: 3, cost: 2, requires: "night-veil", active: "whisper", icon: "/lore/skill-whisper.jpg", art: "/lore/skill-whisper.jpg", desc: "A word that unmakes knees." },
  { id: "final-whisper", name: "Final Form Whisper", branch: "magic", tier: 4, cost: 2, requires: "void-whisper", active: "whisper", dmg: 0.1, icon: "/lore/aelith-ankh-queen.jpg", art: "/lore/aelith-ankh-queen.jpg", desc: "Aelith's last syllable." },

  { id: "precision-coil", name: "Precision Coil", branch: "attack", tier: 1, cost: 1, active: "coil", crit: 0.08, icon: "/lore/skill-coil.jpg", art: "/lore/skill-coil.jpg", desc: "The next round finds the Name." },
  { id: "shadow-lunge", name: "Shadow Lunge", branch: "attack", tier: 1, cost: 1, active: "lunge", icon: "/lore/skill-dash.jpg", art: "/lore/skill-dash.jpg", desc: "Close the dark in one stride." },
  { id: "crimson-surge", name: "Crimson Surge", branch: "attack", tier: 1, cost: 1, active: "surge", dmg: 0.06, icon: "/lore/skill-surge.jpg", art: "/lore/skill-surge.jpg", desc: "Blood leaps the barrel." },
  { id: "ankh-strike", name: "Ankh Strike", branch: "attack", tier: 2, cost: 1, requires: "precision-coil", dmg: 0.08, icon: "/lore/skill-coil.jpg", art: "/lore/skill-coil.jpg", desc: "The mark of life cuts both ways." },
  { id: "wraith-cleave", name: "Wraith Cleave", branch: "attack", tier: 2, cost: 1, requires: "shadow-lunge", dmg: 0.07, icon: "/lore/skill-dash.jpg", art: "/lore/skill-dash.jpg", desc: "Steel through smoke." },
  { id: "coil-critical", name: "Coil Critical", branch: "attack", tier: 2, cost: 1, requires: "precision-coil", crit: 0.12, icon: "/lore/skill-coil.jpg", art: "/lore/skill-coil.jpg", desc: "The pin remembers the heart." },
  { id: "execution-mark", name: "Execution Mark", branch: "attack", tier: 3, cost: 2, requires: "coil-critical", crit: 0.1, dmg: 0.06, icon: "/lore/skill-coil.jpg", art: "/lore/skill-coil.jpg", desc: "A Name written on the target." },
  { id: "dual-surge", name: "Crimson Surge + Shadow Lunge", branch: "attack", tier: 3, cost: 2, requires: "crimson-surge", active: "surge", dmg: 0.1, speed: 0.08, icon: "/lore/skill-lunge.jpg", art: "/lore/skill-lunge.jpg", desc: "Two skills, one red hour." },
  { id: "blood-repeater", name: "Blood Repeater", branch: "attack", tier: 4, cost: 2, requires: "execution-mark", mag: 0.15, icon: "/lore/hunter-hood.jpg", art: "/lore/hunter-hood.jpg", desc: "The SMG drinks faster." },

  { id: "ankh-alloy", name: "Ankh Alloy Shield", branch: "minerals", tier: 1, cost: 1, resist: 0.06, icon: "/lore/skill-forge.jpg", art: "/lore/skill-forge.jpg", desc: "Life-metal beaten on the sky anvil." },
  { id: "ember-ore", name: "Ember Ore", branch: "minerals", tier: 1, cost: 1, dmg: 0.05, icon: "/lore/vaelith-field.jpg", art: "/lore/vaelith-field.jpg", desc: "Vaelith's first stone." },
  { id: "void-crystals", name: "Void Crystals", branch: "minerals", tier: 1, cost: 1, mag: 0.08, icon: "/lore/construct.jpg", art: "/lore/construct.jpg", desc: "Purple glass from the rift." },
  { id: "blood-minerals", name: "Blood Minerals", branch: "minerals", tier: 2, cost: 1, requires: "ember-ore", life: 14, icon: "/lore/skill-vial.jpg", art: "/lore/skill-vial.jpg", desc: "Ore that still remembers veins." },
  { id: "sovereign-stones", name: "Sovereign Stones", branch: "minerals", tier: 2, cost: 1, requires: "ankh-alloy", dmg: 0.07, icon: "/lore/skill-forge.jpg", art: "/lore/skill-forge.jpg", desc: "The palace's own teeth." },
  { id: "pylon-heart", name: "Pylon Heart", branch: "minerals", tier: 2, cost: 1, requires: "void-crystals", mag: 0.1, icon: "/lore/vaelith-field.jpg", art: "/lore/vaelith-field.jpg", desc: "A stolen ember core." },
  { id: "crystal-well", name: "Crystal Well", branch: "minerals", tier: 3, cost: 2, requires: "blood-minerals", life: 16, resist: 0.05, icon: "/lore/skill-forge.jpg", art: "/lore/skill-forge.jpg", desc: "Drink from the red well." },
  { id: "alloy-crown", name: "Alloy Crown", branch: "minerals", tier: 4, cost: 2, requires: "sovereign-stones", resist: 0.1, dmg: 0.08, icon: TREE, art: TREE, desc: "The four branches close." },
  { id: "blood-rite", name: "Circle of Four", branch: "minerals", tier: 3, cost: 2, requires: "pylon-heart", active: "ritual", icon: "/lore/skill-ritual.jpg", art: "/lore/skill-ritual.jpg", desc: "Four blades. One red law." },
];

export const FEATURED_SKILLS = [
  "ember-fortitude",
  "night-carapace",
  "tide-invocation",
  "precision-coil",
  "ankh-alloy",
  "final-whisper",
  "dual-surge",
  "blood-rite",
] as const;

export const SHEET_ART = SHEET;
export const TREE_ART = TREE;

export function skillById(id: string) {
  return SKILLS.find((s) => s.id === id);
}

export function modsFrom(owned: string[]) {
  const m = { dmg: 1, resist: 0, speed: 1, crit: 0, mag: 1, life: 0 };
  for (const id of owned) {
    const s = skillById(id);
    if (!s) continue;
    m.dmg += s.dmg ?? 0;
    m.resist += s.resist ?? 0;
    m.speed += s.speed ?? 0;
    m.crit += s.crit ?? 0;
    m.mag += s.mag ?? 0;
    m.life += s.life ?? 0;
  }
  return m;
}

export function skillHash(id: string) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function skillStatLine(s: SkillDef) {
  const bits: string[] = [];
  if (s.dmg) bits.push(`+${Math.round(s.dmg * 100)}% dmg`);
  if (s.resist) bits.push(`+${Math.round(s.resist * 100)}% resist`);
  if (s.speed) bits.push(`+${Math.round(s.speed * 100)}% stride`);
  if (s.crit) bits.push(`+${Math.round(s.crit * 100)}% crit`);
  if (s.mag) bits.push(`+${Math.round(s.mag * 100)}% mag`);
  if (s.life) bits.push(`+${s.life} vital`);
  if (s.active) bits.push("active · Q");
  else bits.push("passive");
  return bits.join(" · ");
}
