/** Open-world moment catalog. Named 0001–0100; seed-written 0101–10000. */

export type MomentFx =
  | "emberFloor"
  | "slowEnemies"
  | "jumpBoost"
  | "sentinelHaste"
  | "nightfall"
  | "spawnShades"
  | "spawnConstructs"
  | "healPulse"
  | "infiniteSpark"
  | "confuseAi"
  | "pulseDouble"
  | "ankhHaste"
  | "stagger"
  | "healthBloom"
  | "runeEcho"
  | "spawnWraiths"
  | "infinitePulse"
  | "sparkExplode"
  | "playerDome"
  | "chainBeam"
  | "gatePulse"
  | "heartbeat"
  | "pullLance"
  | "skySpin";

export type WorldMoment = {
  id: number;
  name: string;
  description: string;
  duration: number;
  fx: MomentFx;
};

const FX: MomentFx[] = [
  "emberFloor",
  "slowEnemies",
  "jumpBoost",
  "sentinelHaste",
  "nightfall",
  "spawnShades",
  "spawnConstructs",
  "healPulse",
  "infiniteSpark",
  "confuseAi",
  "pulseDouble",
  "ankhHaste",
  "stagger",
  "healthBloom",
  "runeEcho",
  "spawnWraiths",
  "infinitePulse",
  "sparkExplode",
  "playerDome",
  "chainBeam",
  "gatePulse",
  "heartbeat",
  "pullLance",
  "skySpin",
];

const ZONES = [
  "Vaelith", "Rynara", "Sanguara", "Nyxara", "Eryndra", "Aelith", "Palace", "Threshold",
  "Ember Court", "Law Archive", "Blood Canal", "Sky Stair", "Gate", "Core", "Spire", "Rift",
] as const;
const VERBS = [
  "Storm", "Surge", "Collapse", "Awakening", "Pulse", "Cascade", "Frenzy", "Rift", "Bloom", "Silence",
  "Inferno", "Flood", "Vortex", "Siege", "Echo", "Fracture", "Overdrive", "Singularity", "Tide", "Quake",
  "Breath", "Veil", "Howl", "Crown", "Hymn", "Ash", "Orbit", "Mirror", "Lance", "Dirge",
] as const;
const DETAILS = [
  "under the galactic arms",
  "across the Threshold",
  "between the black spires",
  "while the palace breathes",
  "along the living canals",
  "on the sky stairs",
  "at the still point of the throne",
  "as the first flame remembers",
  "through rewritten law",
  "in the red dark",
] as const;

/** id, name, description, duration — fx derived from id */
const NAMED: [number, string, string, number][] = [
  [1, "Vaelith Ember Storm", "Pylons erupt. The north floor burns.", 25],
  [2, "Rynara Script Collapse", "Monoliths rewrite the air. Enemies drag.", 20],
  [3, "Sanguara Tide Surge", "Rivers reverse. Shades leap from the canals.", 18],
  [4, "Nyxara Gravity Well", "Jump height triples while the stairs tilt.", 20],
  [5, "Palace Breath", "Red tendrils spin the floating runes.", 30],
  [6, "Sentinel Overcharge", "Sentinels fire faster for a short storm.", 15],
  [7, "Rune Echo", "The last claimed Name echoes as a floating gift.", 40],
  [8, "Nightfall Pulse", "The grounds go black. Only runes remain.", 25],
  [9, "Construct Awakening", "Sleeping constructs rise near the gate.", 0],
  [10, "Aelith Whisper", "A verse plays. Vital returns.", 8],
  [11, "Spark Cascade", "Spark Rifle drinks infinite coil.", 20],
  [12, "Law Rewrite", "Enemy pathing fractures. They wander.", 10],
  [13, "Blood Rain", "Sanguine Pulse deals double.", 18],
  [14, "Ankh Resonance", "The Ankh charges twice as fast.", 25],
  [15, "Threshold Quake", "The plaza staggers every living thing.", 0],
  [16, "Spire Realignment", "Distant spires turn. The sky writes cover.", 35],
  [17, "Shade Swarm", "Twelve shades claw out of the canals.", 0],
  [18, "Vital Bloom", "Health orbs double their gift.", 30],
  [19, "Rune Storm", "Temporary runes rain across the grounds.", 22],
  [20, "Palace Heartbeat", "The map pulses. Enemies reel.", 12],
  [21, "Ember Cascade", "Vaelith pylons throw fire across the north.", 18],
  [22, "Hieroglyph Flood", "Rynara scripts slow every hunter.", 15],
  [23, "Crimson Undertow", "Canals pull bodies toward the east.", 20],
  [24, "Eclipse Fracture", "Zero-gravity pockets open in the sky stairs.", 22],
  [25, "Tendril Grasp", "Red energy flings the nearest shade.", 8],
  [26, "Sentinel Cascade", "Sentinels overcharge until they burst.", 0],
  [27, "Echo Cascade", "Claimed Names echo as floating orbs.", 35],
  [28, "Absolute Dark", "Total blackout. Rune glow only.", 25],
  [29, "Gate Pulse", "The palace gate flashes and bites nearby constructs.", 6],
  [30, "Verse Regen", "Aelith’s verse restores you once.", 5],
  [31, "Spark Overload", "Spark rounds detonate on impact.", 20],
  [32, "Path Inversion", "Hunters reverse and hunt each other.", 12],
  [33, "Pulse Frenzy", "Sanguine Pulse triples its rate.", 15],
  [34, "Beam Singularity", "The Ankh lance pulls what it touches.", 20],
  [35, "North Rift", "A new gift appears beyond Vaelith.", 0],
  [36, "Spire Collapse", "A distant spire falls into cover.", 0],
  [37, "Canal Breach", "Shades erupt from the east canals.", 0],
  [38, "Orb Storm", "Health orbs rain across the Threshold.", 25],
  [39, "Temporary Name", "A sixth rune appears, then vanishes.", 40],
  [40, "Heartbeat Slam", "A map-wide pulse staggers everyone.", 4],
  [41, "Ember Bridge", "Fire walks between the northern pylons.", 30],
  [42, "Law Cage", "Monoliths trap nearby hunters.", 15],
  [43, "Blood Mirror", "A dome turns their fire aside.", 18],
  [44, "Ascendant Lift", "Nyxara jump becomes flight.", 25],
  [45, "Breath Wall", "Red energy walls the east canal.", 20],
  [46, "Overcharge Chain", "A sentinel death wakes two more.", 0],
  [47, "Rune Magnet", "Unclaimed runes drift toward you.", 30],
  [48, "Starless Night", "Darkness. Shade spawn rises.", 40],
  [49, "Construct March", "Sleeping constructs walk the gate.", 0],
  [50, "Whisper Barrage", "Five verses. Slow vital return.", 12],
  [51, "Infinite Coil", "Spark Rifle never reloads.", 30],
  [52, "AI Fracture", "Enemies strike each other.", 8],
  [53, "Double Pulse", "Sanguine Pulse splits its stream.", 18],
  [54, "Charged Lance", "The Ankh begins already hungry.", 25],
  [55, "Quake Path", "The north floor cracks and burns.", 0],
  [56, "Bridge Network", "Sky runes spin into bridges.", 40],
  [57, "Shade Tide", "Waves of shades from the canals.", 0],
  [58, "Vital Overflow", "The next health gift triples.", 20],
  [59, "Sky Runes", "Falling runes bless the arms.", 25],
  [60, "Pulse Silence", "The heartbeat stuns the hunt.", 15],
  [61, "Vaelith Inferno", "The entire north court is fire.", 22],
  [62, "Script Barricade", "Law slows everything that walks.", 0],
  [63, "Reverse Current", "Canals boil. Shades climb.", 18],
  [64, "Gravity Spike", "Jump ×5, then the drop.", 12],
  [65, "Tendril Highway", "Floating runes race the grounds.", 35],
  [66, "Sentinel Rain", "Sentinels fall already overcharged.", 0],
  [67, "Echo Legion", "Copies of the last Name appear.", 30],
  [68, "Rune Vision Only", "Everything but runes and hunters goes black.", 20],
  [69, "Awakened Horde", "Every construct on the map stands.", 0],
  [70, "Full Verse", "The Six Names poem. Full heal.", 10],
  [71, "Explosive Spark", "Spark rounds explode on impact.", 20],
  [72, "Enemy Confusion", "They forget you and wander.", 15],
  [73, "Blood Overflow", "Sanguine Pulse never empties.", 25],
  [74, "Instant Beam", "The Ankh charges in a breath.", 20],
  [75, "Rift Gate", "A gift tears open near the gate.", 15],
  [76, "Spire Dance", "Spires rotate. Cover moves.", 40],
  [77, "Canal Eruption", "Water explodes. Shades launch.", 0],
  [78, "Health Rain", "Vital rainfall across the plaza.", 45],
  [79, "Name Cascade", "Temporary runes fall at once.", 20],
  [80, "Heartbeat Frenzy", "Pulses stun the hunt.", 18],
  [81, "Ember Vortex", "Northern pylons become a fire storm.", 25],
  [82, "Law Storm", "Hieroglyphs slow every hunter.", 20],
  [83, "Crimson Flood", "East canals overflow with shades.", 30],
  [84, "Night Platform", "Darkness. The stairs lift you.", 35],
  [85, "Breath Cage", "A red dome around you.", 15],
  [86, "Chain Reaction", "Killing a sentinel detonates others.", 0],
  [87, "Rune Orbit", "Claimed Names bless the arms.", 40],
  [88, "Total Eclipse", "Long night. The hunt sees you.", 60],
  [89, "Construct Siege", "Constructs wall the gate.", 0],
  [90, "Divine Regen", "Slow vital return.", 30],
  [91, "Spark Nova", "Spark becomes an area blast.", 25],
  [92, "Path Chaos", "Enemy pathing randomizes.", 12],
  [93, "Pulse Overdrive", "Sanguine Pulse explodes.", 20],
  [94, "Beam Chain", "The Ankh chains to nearby hunters.", 25],
  [95, "Threshold Split", "The plaza splits and burns.", 0],
  [96, "Sky Network", "Floating runes lock into a sky net.", 0],
  [97, "Shade Apocalypse", "The canals empty their dead.", 0],
  [98, "Orb Singularity", "Health orbs pull toward you.", 20],
  [99, "Rune Apocalypse", "Temporary runes with wild gifts.", 25],
  [100, "Palace Awakening", "The house shifts and reconfigures.", 0],
];

const NAMED_FX: MomentFx[] = [
  "emberFloor", "slowEnemies", "spawnShades", "jumpBoost", "skySpin",
  "sentinelHaste", "runeEcho", "nightfall", "spawnConstructs", "healPulse",
  "infiniteSpark", "confuseAi", "pulseDouble", "ankhHaste", "stagger",
  "skySpin", "spawnShades", "healthBloom", "runeEcho", "heartbeat",
  "emberFloor", "slowEnemies", "spawnShades", "jumpBoost", "stagger",
  "sentinelHaste", "runeEcho", "nightfall", "gatePulse", "healPulse",
  "sparkExplode", "confuseAi", "pulseDouble", "pullLance", "runeEcho",
  "skySpin", "spawnShades", "healthBloom", "runeEcho", "heartbeat",
  "emberFloor", "slowEnemies", "playerDome", "jumpBoost", "playerDome",
  "spawnConstructs", "runeEcho", "nightfall", "spawnConstructs", "healPulse",
  "infiniteSpark", "confuseAi", "pulseDouble", "ankhHaste", "emberFloor",
  "skySpin", "spawnShades", "healthBloom", "infiniteSpark", "heartbeat",
  "emberFloor", "slowEnemies", "spawnShades", "jumpBoost", "skySpin",
  "spawnWraiths", "runeEcho", "nightfall", "spawnConstructs", "healPulse",
  "sparkExplode", "confuseAi", "infinitePulse", "ankhHaste", "healthBloom",
  "skySpin", "spawnShades", "healthBloom", "runeEcho", "heartbeat",
  "emberFloor", "slowEnemies", "spawnShades", "jumpBoost", "playerDome",
  "gatePulse", "ankhHaste", "nightfall", "spawnConstructs", "healPulse",
  "sparkExplode", "confuseAi", "pulseDouble", "chainBeam", "emberFloor",
  "skySpin", "spawnShades", "healthBloom", "runeEcho", "skySpin",
];

export const MOMENT_COUNT = 10000;

export function getWorldMoment(id: number): WorldMoment {
  const n = ((Math.floor(id) - 1) % MOMENT_COUNT + MOMENT_COUNT) % MOMENT_COUNT + 1;
  if (n <= 100) {
    const row = NAMED[n - 1]!;
    return { id: n, name: row[1], description: row[2], duration: row[3], fx: NAMED_FX[n - 1]! };
  }
  const z = ZONES[n % ZONES.length]!;
  const v = VERBS[(n * 7) % VERBS.length]!;
  const fx = FX[(n * 13) % FX.length]!;
  return {
    id: n,
    name: `${z} ${v}`,
    description: `${describeFx(fx)} ${DETAILS[n % DETAILS.length]}.`,
    duration: 8 + (n % 40),
    fx,
  };
}

export function describeFx(fx: MomentFx): string {
  const map: Record<MomentFx, string> = {
    emberFloor: "the north court burns",
    slowEnemies: "hunters drag through law",
    jumpBoost: "the stairs lift you",
    sentinelHaste: "sentinels overcharge",
    nightfall: "the grounds go black",
    spawnShades: "shades leap from water",
    spawnConstructs: "constructs awaken",
    healPulse: "vital returns",
    infiniteSpark: "Spark drinks infinite coil",
    confuseAi: "the hunt forgets its path",
    pulseDouble: "Sanguine Pulse doubles",
    ankhHaste: "the Ankh hungers faster",
    stagger: "a heartbeat staggers the map",
    healthBloom: "health gifts overflow",
    runeEcho: "a Name echoes as a gift",
    spawnWraiths: "wraiths tear the fog",
    infinitePulse: "Sanguine never empties",
    sparkExplode: "Spark rounds detonate",
    playerDome: "a red dome holds you",
    chainBeam: "the Ankh chains its prey",
    gatePulse: "the gate bites the courtyard",
    heartbeat: "the palace pulse stuns",
    pullLance: "the lance pulls what it touches",
    skySpin: "floating runes race the sky",
  };
  return map[fx];
}

export function padMoment(id: number) {
  return id.toString().padStart(4, "0");
}
