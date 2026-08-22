import type { NameId } from "./story";

export type FigureKind =
  | "nave"
  | "warden"
  | "reaver"
  | "gunner"
  | "weaver"
  | "hunter"
  | "wraith"
  | "sentinel"
  | "construct"
  | "shade"
  | "boss"
  | NameId;

export type FigureSpec = {
  id: string;
  kind: FigureKind;
  name: string;
  epithet: string;
  x: number;
  y: number;
  z: number;
  weapon: "greatsword" | "hammer" | "staff" | "scythe" | "rifle" | "none";
  lines: string[];
  scale?: number;
};

export const FIGURE_LINES: Record<string, string[]> = {
  nave: [
    "I am the Nave Knight. The visor wakes when blood is near.",
    "The palace drinks names. Offer yours, or be unwritten.",
    "Hold the oath. The crimson crown still remembers the first cut.",
  ],
  sentinel: [
    "The nave holds. Speak, and we will hear.",
    "Cathedral steel does not sleep. The visor is already watching.",
    "Walk the Threshold. The Six Names still hunger.",
  ],
  vaelith: [
    "The first flame remembers every oath, child of ash.",
    "Draw near. I will teach the void how light is found.",
    "Spark still lives in the pylons. Take it, and burn true.",
  ],
  rynara: [
    "Law is a living script. I write while you still breathe.",
    "The stones orbit because I asked them to. Hear the clause.",
    "A name claimed without law is a wound that never closes.",
  ],
  sanguara: [
    "The canals are silent until you listen with the blood.",
    "I cut eternity so the rivers could learn pulse.",
    "Drink, or drown. The tide does not negotiate.",
  ],
  nyxara: [
    "Night is not empty. It is thicker than the storm.",
    "Climb. The stairs appear only for those who look correctly.",
    "I drink the light so the visor may wake.",
  ],
  eryndra: [
    "I do not rise. I do not fall. Sit, if you dare the still point.",
    "The throne is a wound that learned to be a seat.",
    "Time slows here because I asked it to wait.",
  ],
  aelith: [
    "All names lead to one. You already know the last syllable.",
    "Unmake me, or be written into the runes.",
    "The crown is cracked because it was born that way.",
  ],
};

export const THRESHOLD_NPCS: FigureSpec[] = [
  {
    id: "nave",
    kind: "nave",
    name: "Nave Knight",
    epithet: "Oath of the Threshold",
    x: 3.8,
    y: 0,
    z: 54,
    weapon: "greatsword",
    lines: FIGURE_LINES.nave ?? [],
    scale: 1.12,
  },
  {
    id: "oath-left",
    kind: "sentinel",
    name: "Oathbound",
    epithet: "Cathedral Knight",
    x: -7.2,
    y: 0,
    z: 58,
    weapon: "rifle",
    lines: FIGURE_LINES.sentinel ?? [],
    scale: 1.08,
  },
  {
    id: "oath-right",
    kind: "sentinel",
    name: "Oathbound",
    epithet: "Blood-Crown Guard",
    x: 8.4,
    y: 0,
    z: 50,
    weapon: "greatsword",
    lines: FIGURE_LINES.sentinel ?? [],
    scale: 1.05,
  },
  {
    id: "vaelith-oath",
    kind: "vaelith",
    name: "Vaelith",
    epithet: "The First Flame",
    x: 6,
    y: 0,
    z: -78,
    weapon: "hammer",
    lines: FIGURE_LINES.vaelith ?? [],
  },
  {
    id: "rynara-oath",
    kind: "rynara",
    name: "Rynara",
    epithet: "Weaver of Runes",
    x: -72,
    y: 0,
    z: 8,
    weapon: "staff",
    lines: FIGURE_LINES.rynara ?? [],
  },
  {
    id: "sanguara-oath",
    kind: "sanguara",
    name: "Sanguara",
    epithet: "Blood of the Cosmos",
    x: 74,
    y: 0,
    z: 10,
    weapon: "scythe",
    lines: FIGURE_LINES.sanguara ?? [],
  },
  {
    id: "nyxara-oath",
    kind: "nyxara",
    name: "Nyxara",
    epithet: "Night Ascendant",
    x: -46,
    y: 8.4,
    z: -48,
    weapon: "rifle",
    lines: FIGURE_LINES.nyxara ?? [],
  },
  {
    id: "eryndra-oath",
    kind: "eryndra",
    name: "Eryndra",
    epithet: "Eternal Throne",
    x: 4.2,
    y: 0,
    z: -10,
    weapon: "staff",
    lines: FIGURE_LINES.eryndra ?? [],
  },
];
