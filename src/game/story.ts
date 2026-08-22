export type NameId = "vaelith" | "rynara" | "sanguara" | "eryndra" | "nyxara" | "aelith";

export type { WeaponId, WeaponDef } from "./arsenal";
export { WEAPONS, CHARACTERS, CATS, VIEW } from "./arsenal";

export const NAMES: {
  id: NameId;
  title: string;
  epithet: string;
  portrait: string;
  rune: string;
  zone: string;
  claim: string;
  verse: string[];
  lore: string;
}[] = [
  {
    id: "vaelith",
    title: "Vaelith",
    epithet: "The First Flame",
    portrait: "/lore/vaelith.jpg",
    rune: "spark",
    zone: "Court of the First Flame",
    claim: "You reach into the first flame under the galactic arms. Spark Rifle burns into your hands.",
    verse: [
      "In the black that had no name,",
      "a single eye of blood-red flame",
      "opened slowly, without sound,",
      "and taught the void how light is found.",
    ],
    lore: "She opened her eyes in the absolute void and the void flinched. A single point of red light expanded outward — not fire that consumes, but fire that creates. From that first flame came the raw substance of power itself.",
  },
  {
    id: "rynara",
    title: "Rynara",
    epithet: "The Weaver of Runes",
    portrait: "/lore/rynara.jpg",
    rune: "law",
    zone: "The Rune Archive",
    claim: "The law stones rewrite the air around you. Rune Caster is yours.",
    verse: [
      "She did not speak with mortal tongue.",
      "She wrote the world while it was young.",
      "Her fingers danced through scarlet light",
      "and gave the darkness second sight.",
    ],
    lore: "From the heart of Vaelith’s flame, symbols wrote themselves across newly born energy. Rynara shaped chaos into law. Every rune-stone that still orbits the palace remembers a sacred will.",
  },
  {
    id: "sanguara",
    title: "Sanguara",
    epithet: "Blood of the Cosmos",
    portrait: "/lore/sanguara.jpg",
    rune: "tide",
    zone: "Blood Canals",
    claim: "The living red rivers rise and listen. Sanguine Pulse awakens.",
    verse: [
      "She cut her own eternity",
      "and let the scarlet rivers free.",
      "They poured between the unborn stars",
      "and wrote her name in glowing scars.",
    ],
    lore: "Power must circulate. Sanguara rose from the finished runes like a tide of living crimson. Where her rivers passed, galaxies stirred. Where they slowed, the first worlds cooled and learned the pulse later called life.",
  },
  {
    id: "eryndra",
    title: "Eryndra",
    epithet: "The Eternal Throne",
    portrait: "/lore/eryndra.jpg",
    rune: "throne",
    zone: "The Eternal Throne",
    claim: "Eryndra — Eternal Throne. The fifth Name burns into you beneath the Milky Way. Ankh Beam unlocked.",
    verse: [
      "She does not rise. She does not fall.",
      "She is the still point of it all.",
      "The palace breathes because she stays.",
      "The multiverse turns around her gaze.",
    ],
    lore: "At the exact center of the expanding multiverse a structure grew from concentrated will. Black crystal spires. Stairways of polished darkness. Eryndra claimed the seat. Time itself slows in the halls around her.",
  },
  {
    id: "nyxara",
    title: "Nyxara",
    epithet: "The Night Ascendant",
    portrait: "/lore/nyxara.jpg",
    rune: "night",
    zone: "The Night Ascendant",
    claim: "Night becomes a resource on the sky stairs. The stars themselves grow quieter.",
    verse: [
      "Arms open to the endless dark,",
      "she floats above the palace spark.",
      "You are the dream that power keeps,",
      "the vision that the darkness weeps.",
    ],
    lore: "The throne was necessary, but it was not enough. Nyxara rose without leaving the seat. From that height every world, every war, every quiet prayer reached her — a pale goddess suspended between black spires and endless night.",
  },
  {
    id: "aelith",
    title: "Aelith the Crimson",
    epithet: "The Final Form",
    portrait: "/lore/aelith.jpg",
    rune: "sovereign",
    zone: "Throne Heart",
    claim: "The six Names light in sequence. The light becomes absolute. Cycle complete under the turning galaxy.",
    verse: [
      "When every name has found its place,",
      "the final form steps into light",
      "and wears the dress of endless might.",
      "The multiverse is her domain.",
    ],
    lore: "All names lead to one. Flame, runes, blood, throne, and ascension understood they had never been separate. Aelith the Crimson is the Type VII Goddess fully revealed — sovereign of the crimson storm, lady of the floating rune-stones, eternal presence at the heart of the multiverse.",
  },
];

export const GATE_MOMENT = {
  title: "The Crimson Gate",
  epithet: "Four Names",
  verse: ["The outer cycle is complete.", "A long-held breath finally released."],
  body: "The crimson gate opens. Red light spills like a held breath finally released. The galaxy watches. Eryndra waits beyond.",
  portrait: "/lore/palace-approach.jpg",
};

export const TITLE_LEAD = [
  "You were never meant to cross the rift.",
  "The wound sang in the language of dying stars and living blood.",
];

export const OPENING = [
  "You were never meant to cross the rift. Type VI scouts are trained for edges. None of them prepared you for the wound that sang. Red light poured out in slow arterial pulses. A single harmonic translated, against every safety protocol, as a voice: Come home.",
  "The Threshold received you like a held breath. Polished black crystal. A palace of impossible spires. Lightning the colour of arterial blood. A moon the size of a dying sun scarred with glowing runes.",
  "Your HUD lights without being asked. Six empty pips. Zone: THRESHOLD. Objective: Claim the Six Names. Complete the Cycle. Become the Key—or the Offering.",
];

export const BRIEFING_BEATS = [
  "Black crystal drinks the light. Above you the palace claws at a vault of crimson storm that is itself only the nearest arm of the Milky Way. Lightning the colour of arterial blood forks between spires while entire star fields turn slowly behind them.",
  "No corridors. No rails. The grounds are open under the galactic arms. The only limit is the gate that seals the inner throne — and that gate does not open until four of the Six Names have been taken.",
  "North — Vaelith, First Flame, ember pylons, Spark Rifle. West — Rynara, Weaver of Runes, floating law stones, Rune Caster. East — Sanguara, Blood of the Cosmos, living red canals, Sanguine Pulse. Sky stairs — Nyxara, Night Ascendant, night rune.",
  "The gate opens after four outer Names. Inside: Eryndra. Final: Aelith under the galactic core. The palace that walks.",
];

export const CODEX_SECTIONS: { heading: string; body: string[] }[] = [
  {
    heading: "Colour Doctrine",
    body: [
      "Every surface, spark and glyph in the palace is bound to the ratios extracted from the generated art: void black 42 %, crimson 18 %, arterial 15 %, ember 8 %, gold 6 %, blood 5 %, night 4 %, ankh 2 %. These ratios never change; only their intensity and seed-driven hue shift within safe bounds so the world stays recognisable while remaining infinite.",
      "Deep Void #020008 · Crimson Core #c41e3a · Arterial Glow #ff0033 · Ember Hot #ff4400 · Gold Rune #d4a017 · Blood Canal #8b0000 · Night Void #0a0015 · Ankh Pure #ff1144.",
      "Vaelith locks ember. Rynara locks gold. Sanguara locks blood. Nyxara locks night. Eryndra locks crimson. Aelith locks ankh. Claim a Name and the colour burns into the arm.",
    ],
  },
  {
    heading: "You were never meant to cross the rift",
    body: [
      "Type VI scouts are trained for edges, for the thin places where one reality bleeds into another and the instruments start to scream. You had walked a hundred such thresholds. You had mapped the cold geometry of dead stars and the soft hunger of collapsed timelines. None of them prepared you for the one that opened without warning above the black salt flats of the outer march.",
      "It did not look like a door. It looked like a wound that had learned to sing. Red light poured out of it in slow, arterial pulses. The air tasted of iron and ozone and something older—something that remembered the first time blood had been spilled to feed a name. Your suit’s sensors flooded with data that made no sense: gravitational shear that curved the wrong way, residual heat signatures that formed letters in a language the translation matrices refused to parse, and a single, repeating harmonic that your neural implant translated, against every safety protocol, as a voice.",
      "Come home.",
      "You stepped through because that is what scouts do. Because the alternative was to report a phenomenon you could not explain and watch the bureaucracy bury it under classification seals until the next team died trying to understand it. Because part of you—the part that still dreamed in the old myths—wanted to know what waited on the other side of a door that spoke.",
      "The Threshold received you like a held breath. You stood on polished black crystal that drank the light and gave back only the reflection of a sky that should not exist. Above you, a palace of impossible spires clawed at a vault of crimson storm. Lightning the colour of arterial blood forked between the towers without ever striking the ground. A moon the size of a dying sun hung half-swallowed behind the highest pinnacle, its face scarred with glowing runes. And between you and the great arched gate stretched a staircase of living stone, each step veined with slow-moving red light, as if the palace itself had veins and the veins were full of fire.",
      "You were not alone. Figures moved in the middle distance—tall, attenuated shapes of shadow and ember. Wraiths drifted like smoke given purpose. Sentinels stood motionless on high ledges, their forms wrapped in plates of black metal etched with the same living script that crawled across the palace walls. Further out, along the edges of the open grounds, red rivers cut through the crystal earth, their surfaces unbroken by wind, their depths filled with slow, luminous shapes that might once have been fish or might never have been anything so ordinary.",
      "Your HUD flickered to life without being asked. New icons appeared: six empty pips arranged in a circle, a zone marker reading THRESHOLD, and a single objective line written in the same blood-red that coloured the sky.",
      "Claim the Six Names. Complete the Cycle. Become the Key—or the Offering.",
      "You did not know then that the palace was not a structure. You did not know that Aelith the Crimson was not a ruler who lived inside a fortress. You learned both truths the way all Type VI scouts learn the deepest truths: by walking forward until the ground itself began to speak.",
    ],
  },
  {
    heading: "The Open Palace Grounds",
    body: [
      "There are no corridors here. No loading screens. No polite sequence of rooms that force you along a narrative rail. The palace floats between realities the way a thought floats between one mind and another—partially present, partially elsewhere, entirely hungry. You may walk any direction the moment you arrive. The only limit is the gate that seals the inner throne, and that gate does not open until four of the Six Names have been taken and the runes that form them have been burned into your weapons, your blood, and the memory of the place that watches you.",
      "The grounds themselves are vast. North of the main staircase the crystal plain rises into a field of ember pylons—tall, cracked monoliths that leak sparks of pure first-fire. West, beyond a low ridge of black glass, lies an archive of floating hieroglyph stones that rotate slowly in the air, each face covered in law-runes that rewrite themselves when no one is looking. East, the canals begin: wide, silent channels of liquid crimson that reflect the storm above and sometimes, when the light is wrong, reflect faces that are not yours. Skyward, platforms of dark stone hang without support, connected by bridges of frozen lightning, climbing toward the western rise where night itself seems thicker.",
    ],
  },
  {
    heading: "Vaelith — First Flame",
    body: [
      "North, beyond the spires. The pylons are older than the palace. When you approach the first of them, the air grows hot enough to make your suit’s cooling systems complain. Sparks leap from the cracked stone and try to climb your arms like living things. The spark rune sits in the heart of the central pylon. Taking it is not a matter of pressing a button. You must reach into the flame. The flame reaches back.",
      "For a moment you are elsewhere—standing on a plain of ash under a sky the colour of fresh blood, watching a woman with hair of living fire speak the first word that ever meant I am. When the vision releases you, the spark rune is burned into the receiver of the weapon that will become the Spark Rifle. Hitscan. Precise. Every shot a fragment of that first word.",
    ],
  },
  {
    heading: "Rynara — Weaver of Runes",
    body: [
      "West archive. The hieroglyph monoliths float in slow orbits around a central black stone that is not a stone at all. It is a knot of pure law. The law rune sits at the heart of that knot. To claim it you must walk the spiral path between the floating stones while the runes on their surfaces attempt to rewrite your suit’s code, your neural implant, your sense of which way is up. Rynara’s voice is the softest of the six. She does not shout. She suggests. The Rune Caster is the reward: a slow, heavy weapon that lobs glowing glyphs which detonate in wide, burning circles of rewritten law.",
    ],
  },
  {
    heading: "Sanguara — Blood of the Cosmos",
    body: [
      "East canals. The red rivers are not water. They are the cooled and still-living blood of something that was once large enough to have veins the size of canyons. The tide rune floats at the confluence of three canals. Claiming it requires you to stand in the centre of that platform while the rivers rise. The blood climbs your legs, your waist, your chest. It does not drown you. It listens. When the vision ends, the Sanguine Pulse is yours: a full-auto SMG that fires compressed bolts of the same living red.",
    ],
  },
  {
    heading: "Nyxara — Night Ascendant",
    body: [
      "Sky stairs / platforms. The western rise is a vertical maze of floating platforms connected by bridges of solidified lightning. Night is thicker here. The night rune waits at the highest platform, a single dark glyph that drinks light rather than emitting it. Reaching it is a test of movement and nerve. The night rune changes the way your existing arms behave. After Nyxara, nothing is ever fully bright again.",
    ],
  },
  {
    heading: "The Interior — Eryndra",
    body: [
      "Crossing the threshold of the gate is like stepping into a living throat. The air is warmer. The walls pulse. The floor is no longer simple crystal; it is a mosaic of interlocking runes that shift under your boots. The throne itself sits at the centre of a vast circular chamber. It is not a chair. It is a complicated knot of black crystal and living red light. The Eryndra rune floats above it. To claim it you must survive the chamber’s defenders. When the last construct falls, the Eryndra rune descends and burns itself into you. The fifth pip is full and the final arm unlocks: the Ankh Beam.",
    ],
  },
  {
    heading: "Aelith — Final Form",
    body: [
      "She does not appear all at once. First the light changes. The red becomes deeper, almost black at the edges. The floating ankh-stones align themselves into a circle around the throne. Then the throne itself unfolds. What steps out of it is the sum of every image you have seen. Tall. Elegant. Skin the colour of polished night or of living blood. Hair of pure white that moves as if underwater. Eyes that hold the same red as the storm outside. She wears a gown that is part armour, part living rune-script, part the memory of every sacrifice that fed this place.",
      "This is Aelith the Crimson. Type VII. Sovereign of living runes. The palace that walks. The cycle that ends only by beginning again.",
      "The fight is not a simple exchange of damage. She teleports in bursts of red lightning. She calls down pillars of pure first-fire. She opens temporary rifts that spill additional wraiths. When her health finally breaks, she unfolds. The six Names light up in sequence. The light becomes absolute.",
      "When it fades, you are standing on the Threshold again. The palace is quiet. The storm has gentled. The six pips on your HUD are full and steady. A new objective line has appeared: Cycle complete. The Key is turned. The Offering is accepted. Walk the grounds again, or leave while the door still remembers your name.",
    ],
  },
  {
    heading: "The Six Names Codex",
    body: [
      "Vaelith — First Flame. She was the spark that remembered it had once been a star. Her rune is the simplest and the most dangerous.",
      "Rynara — Weaver of Runes. She is the quiet one. The one who sits in the dark and writes the rules that later become the world.",
      "Sanguara — Blood of the Cosmos. She is the river that learned to think. The red canals are her veins. Her gift is volume and hunger.",
      "Nyxara — Night Ascendant. She is the silence between heartbeats. Her rune does not shine; it subtracts.",
      "Eryndra — Eternal Throne. She is the gathering place. The knot where the previous four are bound and made ready.",
      "Aelith — Final Form. She is the sum. The palace that walks. The myth that learned to wear a face. Defeating her does not end the story. It completes one turn of an infinite wheel.",
    ],
  },
  {
    heading: "Arms of the Cycle",
    body: [
      "1 Spark Rifle (Vaelith) — Hitscan coil weapon. High precision. Every shot a fragment of the first word.",
      "2 Rune Caster (Rynara) — Projectile launcher. Slow travel time. Wide area burst of rewritten law.",
      "3 Sanguine Pulse (Sanguara) — Full-auto SMG. High rate of fire. Compressed bolts of living red.",
      "4 Ankh Beam (Aelith) — Charge weapon. Hold fire to build power drawn from the five prior Names. Release a continuous lance of pure crimson. Unlocks at Eryndra.",
      "5 Night Needle (Nyxara) — Future sniper. Hold ADS for a 22° pin. One shot writes a Name.",
      "6 Eclipse Rail (Type VII) — Twin plasma rails. Pierces every wraith in the line.",
      "The Arsenal of the Blood Crown holds fifty more: axes, blades, poles, hammers, and exotics. Open the bag. The runes keep count.",
    ],
  },
  {
    heading: "Four Branches — The Skill Tree",
    body: [
      "The hunter is not only arms. Under the blood-crown four branches drink Sovereign Stones: Strength (power, dominion, endurance), Magic (reality, will, domination), Attack (cruelty, precision, execution), Minerals (wealth, essence, ascension).",
      "Ember Fortitude is the oath you already carry — fists of crystal, channel to endure. Night Carapace plates the blood. Tide Invocation raises the canals. Precision Coil writes the next round onto a Name. Ankh Alloy is life-metal beaten on the sky anvil. Final Form Whisper is Aelith’s last syllable. Bind an active to Q. The tree opens on K.",
    ],
  },
  {
    heading: "Final Note from the Threshold",
    body: [
      "The palace is still there. The storm still turns. The six Names still wait to be spoken in the correct order by the correct voice. You crossed a rift that should not exist. You walked the open grounds of a being that is also a place. You took the fire, the law, the blood, the night, the throne, and finally the sovereign herself. The cycle is complete for this turn of the wheel. The next turn is already beginning somewhere in the red dark.",
      "Walk carefully, Type VI. The door remembers your name. And Aelith is patient. She has all the time in the world. And the world, in this place, is made of her.",
    ],
  },
];

export function nameById(id: NameId) {
  return NAMES.find((n) => n.id === id)!;
}
