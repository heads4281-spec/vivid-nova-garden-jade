import { o as __toESM } from "../_runtime.mjs";
import { B as require_react, _ as Link, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as getServerFnById, i as TSS_SERVER_FUNCTION, r as createServerFn, s as __exportAll } from "./ssr.mjs";
import { Ht as array, Jt as object, Zt as string, qt as number } from "../_libs/@better-auth/core+[...].mjs";
import { i as signOut, t as authClient } from "./client-B40BzJxt.mjs";
import { t as authMiddleware } from "./middleware-RLHmpgbK.mjs";
import { t as create } from "../_libs/zustand.mjs";
import { a as ChevronRight, i as Pause, n as Volume2, o as ChevronLeft, t as VolumeX } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-D-O12Ul1.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Standard Gamepad mapping (W3C). Do not cache the Gamepad object — poll each frame. */
var PAD = {
	JUMP: 0,
	SPRINT: 1,
	INTERACT: 2,
	RELOAD: 3,
	CYCLE_PREV: 4,
	CYCLE_NEXT: 5,
	ADS: 6,
	FIRE: 7,
	SELECT: 8,
	PAUSE: 9,
	LS: 10,
	RS: 11,
	DPAD_UP: 12,
	DPAD_DOWN: 13,
	DPAD_LEFT: 14,
	DPAD_RIGHT: 15
};
var KEY = {
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
	BAG: [
		"KeyI",
		"KeyTab",
		"KeyX",
		"KeyB"
	],
	MAP: ["KeyM"],
	INTERACT: ["KeyF"],
	SKILL: ["KeyQ", "KeyG"],
	TREE: ["KeyK"],
	PAUSE: ["Escape"]
};
var ARM_FROM_DPAD = {
	[PAD.DPAD_UP]: 0,
	[PAD.DPAD_RIGHT]: 1,
	[PAD.DPAD_DOWN]: 2,
	[PAD.DPAD_LEFT]: 3
};
var DEADZONE = .16;
var STICK_SPRINT = .88;
var CONTROL_LEGEND = [
	{
		action: "Move",
		kbm: "WASD",
		pad: "Left stick",
		touch: "Virtual stick"
	},
	{
		action: "Look",
		kbm: "Mouse",
		pad: "Right stick",
		touch: "Drag"
	},
	{
		action: "Fine aim",
		kbm: "—",
		pad: "Gyro (optional)",
		touch: "Gyro"
	},
	{
		action: "Fire / charge Ankh",
		kbm: "LMB",
		pad: "RT / R2",
		touch: "Fire"
	},
	{
		action: "ADS",
		kbm: "RMB",
		pad: "LT / L2",
		touch: "ADS"
	},
	{
		action: "Sprint",
		kbm: "Shift",
		pad: "B / Circle",
		touch: "Hold stick"
	},
	{
		action: "Jump",
		kbm: "Space",
		pad: "A / Cross",
		touch: "Jump"
	},
	{
		action: "Reload",
		kbm: "R",
		pad: "Y / Triangle",
		touch: "Reload"
	},
	{
		action: "Arm select",
		kbm: "1–6",
		pad: "D-Pad / LB RB",
		touch: "Arm 1–6"
	},
	{
		action: "Cycle arm",
		kbm: "Wheel",
		pad: "LB / RB",
		touch: "Swipe"
	},
	{
		action: "Claim rune",
		kbm: "F",
		pad: "X / Square",
		touch: "Claim"
	},
	{
		action: "Camera",
		kbm: "V",
		pad: "L3",
		touch: "View"
	},
	{
		action: "Weapon bag",
		kbm: "I / X / Tab",
		pad: "Select",
		touch: "Bag"
	},
	{
		action: "Open map",
		kbm: "M",
		pad: "Touch pad",
		touch: "Map"
	},
	{
		action: "Active skill",
		kbm: "Q",
		pad: "—",
		touch: "Ember"
	},
	{
		action: "Skill tree",
		kbm: "K",
		pad: "—",
		touch: "Tree"
	},
	{
		action: "Ankh resistance",
		kbm: "—",
		pad: "R2 adaptive",
		touch: "—"
	}
];
var PAD_BLURB = "Left stick move · Right stick look · RT fire · LT ADS · A jump · B sprint · Y reload · X claim · LB/RB cycle · D-Pad arms · Menu pause · Gyro fine aim";
var INTERACT_GLYPH = {
	kbm: "F",
	pad: "X",
	touch: "CLAIM"
};
function radialDeadzone(x, y, dz = DEADZONE) {
	const m = Math.hypot(x, y);
	if (m < dz) return {
		x: 0,
		y: 0
	};
	const scale = (m - dz) / (1 - dz) / m;
	return {
		x: x * scale,
		y: y * scale
	};
}
function emptyActions() {
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
		weaponDelta: 0
	};
}
function anyCode(keys, codes) {
	for (const c of codes) if (keys.has(c)) return true;
	return false;
}
/** Exact ratios from the generated art. Intensity may shift; hue stays in-bounds. */
var C = {
	void: 131080,
	crimson: 12852794,
	arterial: 16711731,
	ember: 16729088,
	gold: 13934615,
	blood: 9109504,
	night: 655381,
	ankh: 16716100
};
var NAME_COLOR = {
	vaelith: C.ember,
	rynara: C.gold,
	sanguara: C.blood,
	nyxara: C.night,
	eryndra: C.crimson,
	aelith: C.ankh
};
function hexRgb(hex) {
	return {
		r: hex >> 16 & 255,
		g: hex >> 8 & 255,
		b: hex & 255
	};
}
function mixHex(a, b, t) {
	const A = hexRgb(a);
	const B = hexRgb(b);
	const r = Math.round(A.r + (B.r - A.r) * t);
	const g = Math.round(A.g + (B.g - A.g) * t);
	const bl = Math.round(A.b + (B.b - A.b) * t);
	return r << 16 | g << 8 | bl;
}
/** Seed-driven hue jitter that never leaves the art ratios. */
function colourShift(base, seed, amount = .04) {
	const r = (base >> 16 & 255) / 255;
	const g = (base >> 8 & 255) / 255;
	const b = (base & 255) / 255;
	const n = Math.sin(base * 12.9898 + seed * 78.233) * 43758.5453;
	const shift = (n - Math.floor(n) - .5) * amount;
	const rr = Math.min(1, Math.max(0, r + shift));
	const gg = Math.min(1, Math.max(0, g + shift * .6));
	const bb = Math.min(1, Math.max(0, b + shift * .3));
	return Math.round(rr * 255) << 16 | Math.round(gg * 255) << 8 | Math.round(bb * 255);
}
var MAX_CODES = 1e5;
var CODE_KEY = "crimson-sovereign-code-v1";
var SAVE_VERSION = 1;
var GLYPHS = "CRIMSONVAELYTHDQFK";
var THREATS = [
	"hushed",
	"stirring",
	"violent",
	"sovereign"
];
var FLAVORS = [
	"ash-veined",
	"code-burnt",
	"rift-tempered",
	"void-etched",
	"blood-quenched",
	"rune-forged"
];
function mulberry32(seed) {
	let s = seed >>> 0;
	return () => {
		s = s + 1831565813 | 0;
		let t = Math.imul(s ^ s >>> 15, 1 | s);
		t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}
function xmur3(str) {
	let h = 1779033703 ^ str.length;
	for (let i = 0; i < str.length; i++) {
		h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
		h = h << 13 | h >>> 19;
	}
	return () => {
		h = Math.imul(h ^ h >>> 16, 2246822507);
		h = Math.imul(h ^ h >>> 13, 3266489909);
		return (h ^= h >>> 16) >>> 0;
	};
}
function streamSeed(code, name) {
	return xmur3(`${code >>> 0}:${name}`)();
}
function padCode(n) {
	const v = (n % MAX_CODES + MAX_CODES) % MAX_CODES;
	return String(v).padStart(5, "0");
}
function parseCode(raw) {
	const s = raw.trim().replace(/[^\d]/g, "");
	if (!s || s.length > 5) return null;
	const n = Number(s);
	if (!Number.isInteger(n) || n < 0 || n >= 1e5) return null;
	return n;
}
function randomCode() {
	return Math.floor(Math.random() * MAX_CODES);
}
function pick(rng, arr) {
	return arr[Math.floor(rng() * arr.length)];
}
function lerp(a, b, t) {
	return a + (b - a) * t;
}
function buildProfile(code) {
	const n = (code % MAX_CODES + MAX_CODES) % MAX_CODES;
	const rng = mulberry32(streamSeed(n, "profile"));
	const threat = pick(rng, THREATS);
	const flavor = pick(rng, FLAVORS);
	let glyphs = "";
	for (let i = 0; i < 6; i++) glyphs += GLYPHS[Math.floor(rng() * 18)];
	const ember = mixHex(C.ember, C.arterial, rng() * .35);
	const fogColor = C.void;
	const violent = threat === "violent" || threat === "sovereign";
	return {
		code: n,
		padded: padCode(n),
		glyphs,
		threat,
		fogDensity: lerp(.0048, .0085, rng()),
		fogColor,
		ember,
		glow: lerp(.9, 1.8, rng()),
		droneHz: lerp(40, 58, rng()),
		enemyHpMul: lerp(.88, violent ? 1.28 : 1.12, rng()),
		enemySpdMul: lerp(.92, violent ? 1.22 : 1.08, rng()),
		extraWraiths: Math.floor(rng() * (violent ? 5 : 3)),
		extraShades: Math.floor(rng() * (violent ? 3 : 2)),
		recoilMul: lerp(.86, 1.22, rng()),
		spreadMul: lerp(.8, 1.35, rng()),
		damageMul: lerp(.94, 1.12, rng()),
		runeScale: lerp(.9, 1.25, rng()),
		spireCount: 9 + Math.floor(rng() * 8),
		floatRunes: 14 + Math.floor(rng() * 14),
		galaxyCount: 1400 + Math.floor(rng() * 1400),
		galaxySize: lerp(.38, .72, rng()),
		flavor,
		blurb: {
			hushed: "This code stills the fog. The galaxy turns slow and polite.",
			stirring: "This code wakes the archive. Star-arms kick harder. Shades listen.",
			violent: "This code thickens blood in the canals. The Milky Way hungers with the palace.",
			sovereign: "This code is close to her true name. The galactic core will not be kind."
		}[threat],
		bossLevel: zoneBossLevel(n, 5)
	};
}
function zoneBossLevel(code, zone) {
	const n = (code % MAX_CODES + MAX_CODES) % MAX_CODES;
	return 1 + (Math.imul(n + 1, 7919) + Math.imul(zone + 1, 104729) >>> 0) % 1e4;
}
function persistCode(seed) {
	try {
		localStorage.setItem(CODE_KEY, JSON.stringify({
			version: SAVE_VERSION,
			seed: (seed % MAX_CODES + MAX_CODES) % MAX_CODES
		}));
	} catch {}
}
function shareCodeUrl(seed) {
	try {
		const u = new URL(window.location.href);
		u.searchParams.set("code", padCode(seed));
		window.history.replaceState(null, "", `${u.pathname}${u.search}${u.hash}`);
	} catch {}
}
function cycleLink(seed) {
	try {
		const u = new URL(window.location.href);
		u.searchParams.set("code", padCode(seed));
		return u.toString();
	} catch {
		return `?code=${padCode(seed)}`;
	}
}
function loadSavedCode() {
	try {
		const q = new URLSearchParams(window.location.search);
		const fromUrl = parseCode(q.get("code") || q.get("seed") || "");
		if (fromUrl !== null) {
			persistCode(fromUrl);
			shareCodeUrl(fromUrl);
			return fromUrl;
		}
	} catch {}
	try {
		const raw = localStorage.getItem(CODE_KEY);
		if (!raw) {
			const n = 63821;
			persistCode(n);
			shareCodeUrl(n);
			return n;
		}
		const parsed = JSON.parse(raw);
		if (parsed.version === SAVE_VERSION && typeof parsed.seed === "number") {
			const n = parseCode(String(parsed.seed));
			if (n !== null) {
				shareCodeUrl(n);
				return n;
			}
		}
	} catch {}
	const n = 63821;
	persistCode(n);
	shareCodeUrl(n);
	return n;
}
var VIEW = {
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
	fist: 11
};
var AXE = "/arms/sovereign-axe.jpg";
var SWORD = "/arms/sovereign-sword.jpg";
var SCYTHE = "/arms/war-scythe.jpg";
var LANCE = "/arms/rune-lance.jpg";
var HAMMER = "/arms/ember-hammer.jpg";
var SPARK = "/arms/spark.jpg";
var RUNE = "/arms/rune.jpg";
var PULSE = "/arms/pulse.jpg";
var ANKH = "/arms/ankh.jpg";
var NEEDLE = "/arms/needle.jpg";
var RAIL = "/arms/rail.jpg";
var FIST = "/ui/ember-fortitude.jpg";
function w(id, name, nameKey, fire, view, cat, icon, stats) {
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
		reload: stats.reload ?? (melee ? .08 : 1.7),
		spread: stats.spread ?? (melee ? .08 : .01),
		recoil: stats.recoil ?? (melee ? .03 : .02),
		range: stats.range ?? (melee ? 3.6 : 140),
		zoom: stats.zoom ?? 62,
		desc: stats.desc ?? name,
		unlock: stats.unlock ?? null
	};
}
var WEAPONS = [
	w(0, "Spark Rifle", "Vaelith", "hitscan", VIEW.rifle, "gun", SPARK, {
		damage: 28,
		cooldown: .16,
		mag: 22,
		reserve: 88,
		reload: 1.55,
		spread: .006,
		recoil: .018,
		range: 180,
		zoom: 52,
		desc: "First-flame coil. Precise crimson pulse."
	}),
	w(1, "Rune Caster", "Rynara", "projectile", VIEW.caster, "gun", RUNE, {
		damage: 54,
		cooldown: .62,
		mag: 6,
		reserve: 24,
		reload: 2.1,
		spread: 0,
		recoil: .04,
		range: 90,
		desc: "Living-law grenade. Arcs and detonates."
	}),
	w(2, "Sanguine Pulse", "Sanguara", "hitscan", VIEW.smg, "gun", PULSE, {
		damage: 12,
		cooldown: .068,
		automatic: true,
		mag: 38,
		reserve: 152,
		reload: 1.7,
		spread: .018,
		recoil: .01,
		range: 90,
		zoom: 70,
		desc: "Blood-tide SMG. Hold to flood the dark."
	}),
	w(3, "Ankh Beam", "Aelith", "beam", VIEW.beam, "gun", ANKH, {
		damage: 96,
		cooldown: .9,
		mag: 8,
		reserve: 24,
		reload: 2.4,
		spread: 0,
		recoil: .05,
		range: 200,
		zoom: 48,
		unlock: "eryndra",
		desc: "Hold to charge five Names into a Type VII lance."
	}),
	w(4, "Night Needle", "Nyxara", "hitscan", VIEW.sniper, "gun", NEEDLE, {
		damage: 96,
		cooldown: .95,
		mag: 4,
		reserve: 20,
		reload: 2.25,
		spread: .024,
		recoil: .058,
		range: 280,
		zoom: 22,
		desc: "Nyxara's night pin. Hold ADS. One shot, one Name."
	}),
	w(5, "Eclipse Rail", "Type VII", "rail", VIEW.rail, "gun", RAIL, {
		damage: 46,
		cooldown: .48,
		mag: 10,
		reserve: 40,
		reload: 1.9,
		spread: .004,
		recoil: .032,
		range: 220,
		zoom: 44,
		desc: "Twin plasma rails pierce every wraith in line."
	}),
	w(6, "Crimson Sovereign Axe", "Blood Crown", "melee", VIEW.axe, "axe", AXE, {
		damage: 62,
		cooldown: .52,
		desc: "Ankh-crowned greataxe. Cleaves lesser souls."
	}),
	w(7, "Ember Cleaver", "Vaelith", "melee", VIEW.axe, "axe", AXE, {
		damage: 48,
		cooldown: .42
	}),
	w(8, "Bloodfang Greataxe", "Sanguara", "melee", VIEW.axe, "axe", AXE, {
		damage: 74,
		cooldown: .7
	}),
	w(9, "Nightfall Axe", "Nyxara", "melee", VIEW.axe, "axe", AXE, {
		damage: 58,
		cooldown: .55
	}),
	w(10, "Pylon Breaker", "Vaelith", "melee", VIEW.axe, "axe", AXE, {
		damage: 80,
		cooldown: .82
	}),
	w(11, "Ember Warhammer", "Vaelith", "melee", VIEW.hammer, "axe", HAMMER, {
		damage: 88,
		cooldown: .9,
		desc: "Crystal-core maul. Shatters constructs."
	}),
	w(12, "Crystal Maul", "Rynara", "melee", VIEW.hammer, "axe", HAMMER, {
		damage: 70,
		cooldown: .78
	}),
	w(13, "Throne Crusher", "Eryndra", "melee", VIEW.hammer, "axe", HAMMER, {
		damage: 96,
		cooldown: 1.05,
		unlock: "eryndra"
	}),
	w(14, "Rune Sledge", "Rynara", "melee", VIEW.hammer, "axe", HAMMER, {
		damage: 64,
		cooldown: .72
	}),
	w(15, "Crimson Sovereign Sword", "Blood Crown", "melee", VIEW.sword, "blade", SWORD, {
		damage: 44,
		cooldown: .34,
		desc: "Blood reigns. Souls obey."
	}),
	w(16, "Spark Longsword", "Vaelith", "melee", VIEW.sword, "blade", SWORD, {
		damage: 38,
		cooldown: .3
	}),
	w(17, "Lawblade", "Rynara", "melee", VIEW.sword, "blade", SWORD, {
		damage: 42,
		cooldown: .36
	}),
	w(18, "Sanguine Saber", "Sanguara", "melee", VIEW.sword, "blade", SWORD, {
		damage: 36,
		cooldown: .26
	}),
	w(19, "Night Reaver", "Nyxara", "melee", VIEW.sword, "blade", SWORD, {
		damage: 50,
		cooldown: .4
	}),
	w(20, "Ankh Edge", "Aelith", "melee", VIEW.sword, "blade", SWORD, {
		damage: 56,
		cooldown: .44,
		unlock: "eryndra"
	}),
	w(21, "Shadow Dagger", "Nyxara", "melee", VIEW.sword, "blade", SWORD, {
		damage: 22,
		cooldown: .16,
		range: 2.4
	}),
	w(22, "Twin Rune Blades", "Rynara", "melee", VIEW.sword, "blade", SWORD, {
		damage: 28,
		cooldown: .2,
		automatic: true
	}),
	w(23, "Wraithfang", "Nyxara", "melee", VIEW.sword, "blade", SWORD, {
		damage: 34,
		cooldown: .28
	}),
	w(24, "Construct Slicer", "Type VII", "melee", VIEW.sword, "blade", SWORD, {
		damage: 40,
		cooldown: .32
	}),
	w(25, "Rune Lance", "Rynara", "melee", VIEW.lance, "pole", LANCE, {
		damage: 60,
		cooldown: .58,
		range: 5.2,
		desc: "Law written on a spear-point."
	}),
	w(26, "Sanguine Scythe", "Sanguara", "melee", VIEW.scythe, "pole", SCYTHE, {
		damage: 68,
		cooldown: .64,
		range: 4.4,
		desc: "He who rules in blood reaps in eternity."
	}),
	w(27, "Night Halberd", "Nyxara", "melee", VIEW.lance, "pole", LANCE, {
		damage: 54,
		cooldown: .6,
		range: 4.8
	}),
	w(28, "Blood Spear", "Sanguara", "melee", VIEW.lance, "pole", LANCE, {
		damage: 46,
		cooldown: .48,
		range: 5
	}),
	w(29, "Ember Pike", "Vaelith", "melee", VIEW.lance, "pole", LANCE, {
		damage: 52,
		cooldown: .55,
		range: 5.4
	}),
	w(30, "Throne Glaive", "Eryndra", "melee", VIEW.scythe, "pole", SCYTHE, {
		damage: 72,
		cooldown: .7,
		unlock: "eryndra"
	}),
	w(31, "Ankh Partisan", "Aelith", "melee", VIEW.lance, "pole", LANCE, {
		damage: 64,
		cooldown: .62,
		unlock: "eryndra"
	}),
	w(32, "Precision Coil Rifle", "Vaelith", "hitscan", VIEW.rifle, "gun", SPARK, {
		damage: 34,
		cooldown: .2,
		mag: 18,
		reserve: 72,
		spread: .004,
		recoil: .016,
		range: 200,
		zoom: 44
	}),
	w(33, "Sanguine Pulse SMG", "Sanguara", "hitscan", VIEW.smg, "gun", PULSE, {
		damage: 10,
		cooldown: .055,
		automatic: true,
		mag: 44,
		reserve: 176,
		spread: .022,
		recoil: .011,
		range: 80
	}),
	w(34, "Ankh Beam Lance", "Aelith", "beam", VIEW.beam, "gun", ANKH, {
		damage: 110,
		cooldown: 1,
		mag: 6,
		reserve: 18,
		unlock: "eryndra",
		range: 220,
		recoil: .055
	}),
	w(35, "Rune Caster Launcher", "Rynara", "projectile", VIEW.caster, "gun", RUNE, {
		damage: 70,
		cooldown: .78,
		mag: 4,
		reserve: 16,
		recoil: .048
	}),
	w(36, "Ember Sidearm", "Vaelith", "hitscan", VIEW.rifle, "gun", SPARK, {
		damage: 22,
		cooldown: .22,
		mag: 12,
		reserve: 60,
		spread: .012,
		recoil: .03,
		range: 70
	}),
	w(37, "Night Sniper", "Nyxara", "hitscan", VIEW.sniper, "gun", NEEDLE, {
		damage: 120,
		cooldown: 1.15,
		mag: 3,
		reserve: 15,
		spread: .02,
		recoil: .072,
		range: 320,
		zoom: 18
	}),
	w(38, "Blood Repeater", "Sanguara", "hitscan", VIEW.smg, "gun", PULSE, {
		damage: 16,
		cooldown: .09,
		automatic: true,
		mag: 28,
		reserve: 112,
		recoil: .014
	}),
	w(39, "Law Disruptor", "Rynara", "projectile", VIEW.caster, "gun", RUNE, {
		damage: 40,
		cooldown: .5,
		mag: 8,
		reserve: 32,
		recoil: .036
	}),
	w(40, "Crystal Carbine", "Rynara", "hitscan", VIEW.rifle, "gun", SPARK, {
		damage: 24,
		cooldown: .14,
		automatic: true,
		mag: 26,
		reserve: 104,
		spread: .01,
		recoil: .015
	}),
	w(41, "Wraith Pistol", "Nyxara", "hitscan", VIEW.rifle, "gun", SPARK, {
		damage: 18,
		cooldown: .18,
		mag: 10,
		reserve: 50,
		spread: .014,
		recoil: .032,
		range: 60
	}),
	w(42, "Sentinel Lance Gun", "Type VII", "rail", VIEW.rail, "gun", RAIL, {
		damage: 38,
		cooldown: .4,
		mag: 12,
		reserve: 48,
		recoil: .028
	}),
	w(43, "Glyph Chakram", "Rynara", "projectile", VIEW.caster, "exotic", RUNE, {
		damage: 32,
		cooldown: .36,
		mag: 10,
		reserve: 40,
		desc: "Returning law-disc."
	}),
	w(44, "Living Blood Whip", "Sanguara", "melee", VIEW.scythe, "exotic", SCYTHE, {
		damage: 30,
		cooldown: .28,
		range: 6.2,
		automatic: true
	}),
	w(45, "Shadow Claws", "Nyxara", "melee", VIEW.fist, "exotic", FIST, {
		damage: 26,
		cooldown: .18,
		range: 2.6,
		automatic: true
	}),
	w(46, "Pylon Gauntlets", "Vaelith", "melee", VIEW.fist, "exotic", FIST, {
		damage: 40,
		cooldown: .4,
		range: 2.8
	}),
	w(47, "Ankh Shield Blade", "Aelith", "melee", VIEW.sword, "exotic", SWORD, {
		damage: 48,
		cooldown: .5,
		unlock: "eryndra"
	}),
	w(48, "Rune Orb Staff", "Rynara", "projectile", VIEW.caster, "exotic", RUNE, {
		damage: 58,
		cooldown: .7,
		mag: 5,
		reserve: 20
	}),
	w(49, "Canal Trident", "Sanguara", "melee", VIEW.lance, "exotic", LANCE, {
		damage: 50,
		cooldown: .5,
		range: 5.6
	}),
	w(50, "Night Bow", "Nyxara", "hitscan", VIEW.sniper, "exotic", NEEDLE, {
		damage: 64,
		cooldown: .7,
		mag: 1,
		reserve: 30,
		spread: .008,
		recoil: .042,
		range: 160,
		zoom: 36
	}),
	w(51, "Ember Greatbow", "Vaelith", "hitscan", VIEW.sniper, "exotic", NEEDLE, {
		damage: 84,
		cooldown: .95,
		mag: 1,
		reserve: 24,
		recoil: .052,
		range: 200,
		zoom: 32
	}),
	w(52, "Construct Breaker Cannon", "Type VII", "rail", VIEW.rail, "exotic", RAIL, {
		damage: 90,
		cooldown: 1.2,
		mag: 3,
		reserve: 12,
		recoil: .08
	}),
	w(53, "Sovereign Residue Blade", "Blood Crown", "melee", VIEW.sword, "exotic", SWORD, {
		damage: 55,
		cooldown: .38
	}),
	w(54, "Final Form Edge", "Aelith", "melee", VIEW.scythe, "exotic", SCYTHE, {
		damage: 120,
		cooldown: .55,
		range: 5.5,
		unlock: "aelith",
		desc: "Unlocked when Aelith falls."
	}),
	w(55, "Ember Fortitude", "Sovereign", "melee", VIEW.fist, "exotic", FIST, {
		damage: 34,
		cooldown: .32,
		range: 2.5,
		desc: "Crystal fists. Channel Q for Ember Resilience."
	})
];
var CHARACTERS = [
	{
		id: "warden",
		name: "Ankh Warden",
		epithet: "Threshold oath",
		portrait: "/lore/char-warden.jpg"
	},
	{
		id: "reaver",
		name: "Night Reaver",
		epithet: "Dual-blade storm",
		portrait: "/lore/char-reaver.jpg"
	},
	{
		id: "gunner",
		name: "Void Gunner",
		epithet: "Coil and lightning",
		portrait: "/lore/char-gunner.jpg"
	},
	{
		id: "weaver",
		name: "Blood Weaver",
		epithet: "Canal tide",
		portrait: "/lore/char-weaver.jpg"
	},
	{
		id: "hunter",
		name: "Hooded Hunter",
		epithet: "First eye",
		portrait: "/lore/hunter-hood.jpg"
	}
];
var CATS = [
	{
		id: "gun",
		label: "Arms"
	},
	{
		id: "axe",
		label: "Axes"
	},
	{
		id: "blade",
		label: "Blades"
	},
	{
		id: "pole",
		label: "Poles"
	},
	{
		id: "exotic",
		label: "Exotic"
	}
];
var NAMES = [
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
			"and taught the void how light is found."
		],
		lore: "She opened her eyes in the absolute void and the void flinched. A single point of red light expanded outward — not fire that consumes, but fire that creates. From that first flame came the raw substance of power itself."
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
			"and gave the darkness second sight."
		],
		lore: "From the heart of Vaelith’s flame, symbols wrote themselves across newly born energy. Rynara shaped chaos into law. Every rune-stone that still orbits the palace remembers a sacred will."
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
			"and wrote her name in glowing scars."
		],
		lore: "Power must circulate. Sanguara rose from the finished runes like a tide of living crimson. Where her rivers passed, galaxies stirred. Where they slowed, the first worlds cooled and learned the pulse later called life."
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
			"The multiverse turns around her gaze."
		],
		lore: "At the exact center of the expanding multiverse a structure grew from concentrated will. Black crystal spires. Stairways of polished darkness. Eryndra claimed the seat. Time itself slows in the halls around her."
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
			"the vision that the darkness weeps."
		],
		lore: "The throne was necessary, but it was not enough. Nyxara rose without leaving the seat. From that height every world, every war, every quiet prayer reached her — a pale goddess suspended between black spires and endless night."
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
			"The multiverse is her domain."
		],
		lore: "All names lead to one. Flame, runes, blood, throne, and ascension understood they had never been separate. Aelith the Crimson is the Type VII Goddess fully revealed — sovereign of the crimson storm, lady of the floating rune-stones, eternal presence at the heart of the multiverse."
	}
];
var GATE_MOMENT = {
	title: "The Crimson Gate",
	epithet: "Four Names",
	verse: ["The outer cycle is complete.", "A long-held breath finally released."],
	body: "The crimson gate opens. Red light spills like a held breath finally released. The galaxy watches. Eryndra waits beyond.",
	portrait: "/lore/palace-approach.jpg"
};
var TITLE_LEAD = ["You were never meant to cross the rift.", "The wound sang in the language of dying stars and living blood."];
var OPENING = [
	"You were never meant to cross the rift. Type VI scouts are trained for edges. None of them prepared you for the wound that sang. Red light poured out in slow arterial pulses. A single harmonic translated, against every safety protocol, as a voice: Come home.",
	"The Threshold received you like a held breath. Polished black crystal. A palace of impossible spires. Lightning the colour of arterial blood. A moon the size of a dying sun scarred with glowing runes.",
	"Your HUD lights without being asked. Six empty pips. Zone: THRESHOLD. Objective: Claim the Six Names. Complete the Cycle. Become the Key—or the Offering."
];
var BRIEFING_BEATS = [
	"Black crystal drinks the light. Above you the palace claws at a vault of crimson storm that is itself only the nearest arm of the Milky Way. Lightning the colour of arterial blood forks between spires while entire star fields turn slowly behind them.",
	"No corridors. No rails. The grounds are open under the galactic arms. The only limit is the gate that seals the inner throne — and that gate does not open until four of the Six Names have been taken.",
	"North — Vaelith, First Flame, ember pylons, Spark Rifle. West — Rynara, Weaver of Runes, floating law stones, Rune Caster. East — Sanguara, Blood of the Cosmos, living red canals, Sanguine Pulse. Sky stairs — Nyxara, Night Ascendant, night rune.",
	"The gate opens after four outer Names. Inside: Eryndra. Final: Aelith under the galactic core. The palace that walks."
];
var CODEX_SECTIONS = [
	{
		heading: "Colour Doctrine",
		body: [
			"Every surface, spark and glyph in the palace is bound to the ratios extracted from the generated art: void black 42 %, crimson 18 %, arterial 15 %, ember 8 %, gold 6 %, blood 5 %, night 4 %, ankh 2 %. These ratios never change; only their intensity and seed-driven hue shift within safe bounds so the world stays recognisable while remaining infinite.",
			"Deep Void #020008 · Crimson Core #c41e3a · Arterial Glow #ff0033 · Ember Hot #ff4400 · Gold Rune #d4a017 · Blood Canal #8b0000 · Night Void #0a0015 · Ankh Pure #ff1144.",
			"Vaelith locks ember. Rynara locks gold. Sanguara locks blood. Nyxara locks night. Eryndra locks crimson. Aelith locks ankh. Claim a Name and the colour burns into the arm."
		]
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
			"You did not know then that the palace was not a structure. You did not know that Aelith the Crimson was not a ruler who lived inside a fortress. You learned both truths the way all Type VI scouts learn the deepest truths: by walking forward until the ground itself began to speak."
		]
	},
	{
		heading: "The Open Palace Grounds",
		body: ["There are no corridors here. No loading screens. No polite sequence of rooms that force you along a narrative rail. The palace floats between realities the way a thought floats between one mind and another—partially present, partially elsewhere, entirely hungry. You may walk any direction the moment you arrive. The only limit is the gate that seals the inner throne, and that gate does not open until four of the Six Names have been taken and the runes that form them have been burned into your weapons, your blood, and the memory of the place that watches you.", "The grounds themselves are vast. North of the main staircase the crystal plain rises into a field of ember pylons—tall, cracked monoliths that leak sparks of pure first-fire. West, beyond a low ridge of black glass, lies an archive of floating hieroglyph stones that rotate slowly in the air, each face covered in law-runes that rewrite themselves when no one is looking. East, the canals begin: wide, silent channels of liquid crimson that reflect the storm above and sometimes, when the light is wrong, reflect faces that are not yours. Skyward, platforms of dark stone hang without support, connected by bridges of frozen lightning, climbing toward the western rise where night itself seems thicker."]
	},
	{
		heading: "Vaelith — First Flame",
		body: ["North, beyond the spires. The pylons are older than the palace. When you approach the first of them, the air grows hot enough to make your suit’s cooling systems complain. Sparks leap from the cracked stone and try to climb your arms like living things. The spark rune sits in the heart of the central pylon. Taking it is not a matter of pressing a button. You must reach into the flame. The flame reaches back.", "For a moment you are elsewhere—standing on a plain of ash under a sky the colour of fresh blood, watching a woman with hair of living fire speak the first word that ever meant I am. When the vision releases you, the spark rune is burned into the receiver of the weapon that will become the Spark Rifle. Hitscan. Precise. Every shot a fragment of that first word."]
	},
	{
		heading: "Rynara — Weaver of Runes",
		body: ["West archive. The hieroglyph monoliths float in slow orbits around a central black stone that is not a stone at all. It is a knot of pure law. The law rune sits at the heart of that knot. To claim it you must walk the spiral path between the floating stones while the runes on their surfaces attempt to rewrite your suit’s code, your neural implant, your sense of which way is up. Rynara’s voice is the softest of the six. She does not shout. She suggests. The Rune Caster is the reward: a slow, heavy weapon that lobs glowing glyphs which detonate in wide, burning circles of rewritten law."]
	},
	{
		heading: "Sanguara — Blood of the Cosmos",
		body: ["East canals. The red rivers are not water. They are the cooled and still-living blood of something that was once large enough to have veins the size of canyons. The tide rune floats at the confluence of three canals. Claiming it requires you to stand in the centre of that platform while the rivers rise. The blood climbs your legs, your waist, your chest. It does not drown you. It listens. When the vision ends, the Sanguine Pulse is yours: a full-auto SMG that fires compressed bolts of the same living red."]
	},
	{
		heading: "Nyxara — Night Ascendant",
		body: ["Sky stairs / platforms. The western rise is a vertical maze of floating platforms connected by bridges of solidified lightning. Night is thicker here. The night rune waits at the highest platform, a single dark glyph that drinks light rather than emitting it. Reaching it is a test of movement and nerve. The night rune changes the way your existing arms behave. After Nyxara, nothing is ever fully bright again."]
	},
	{
		heading: "The Interior — Eryndra",
		body: ["Crossing the threshold of the gate is like stepping into a living throat. The air is warmer. The walls pulse. The floor is no longer simple crystal; it is a mosaic of interlocking runes that shift under your boots. The throne itself sits at the centre of a vast circular chamber. It is not a chair. It is a complicated knot of black crystal and living red light. The Eryndra rune floats above it. To claim it you must survive the chamber’s defenders. When the last construct falls, the Eryndra rune descends and burns itself into you. The fifth pip is full and the final arm unlocks: the Ankh Beam."]
	},
	{
		heading: "Aelith — Final Form",
		body: [
			"She does not appear all at once. First the light changes. The red becomes deeper, almost black at the edges. The floating ankh-stones align themselves into a circle around the throne. Then the throne itself unfolds. What steps out of it is the sum of every image you have seen. Tall. Elegant. Skin the colour of polished night or of living blood. Hair of pure white that moves as if underwater. Eyes that hold the same red as the storm outside. She wears a gown that is part armour, part living rune-script, part the memory of every sacrifice that fed this place.",
			"This is Aelith the Crimson. Type VII. Sovereign of living runes. The palace that walks. The cycle that ends only by beginning again.",
			"The fight is not a simple exchange of damage. She teleports in bursts of red lightning. She calls down pillars of pure first-fire. She opens temporary rifts that spill additional wraiths. When her health finally breaks, she unfolds. The six Names light up in sequence. The light becomes absolute.",
			"When it fades, you are standing on the Threshold again. The palace is quiet. The storm has gentled. The six pips on your HUD are full and steady. A new objective line has appeared: Cycle complete. The Key is turned. The Offering is accepted. Walk the grounds again, or leave while the door still remembers your name."
		]
	},
	{
		heading: "The Six Names Codex",
		body: [
			"Vaelith — First Flame. She was the spark that remembered it had once been a star. Her rune is the simplest and the most dangerous.",
			"Rynara — Weaver of Runes. She is the quiet one. The one who sits in the dark and writes the rules that later become the world.",
			"Sanguara — Blood of the Cosmos. She is the river that learned to think. The red canals are her veins. Her gift is volume and hunger.",
			"Nyxara — Night Ascendant. She is the silence between heartbeats. Her rune does not shine; it subtracts.",
			"Eryndra — Eternal Throne. She is the gathering place. The knot where the previous four are bound and made ready.",
			"Aelith — Final Form. She is the sum. The palace that walks. The myth that learned to wear a face. Defeating her does not end the story. It completes one turn of an infinite wheel."
		]
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
			"The Arsenal of the Blood Crown holds fifty more: axes, blades, poles, hammers, and exotics. Open the bag. The runes keep count."
		]
	},
	{
		heading: "Four Branches — The Skill Tree",
		body: ["The hunter is not only arms. Under the blood-crown four branches drink Sovereign Stones: Strength (power, dominion, endurance), Magic (reality, will, domination), Attack (cruelty, precision, execution), Minerals (wealth, essence, ascension).", "Ember Fortitude is the oath you already carry — fists of crystal, channel to endure. Night Carapace plates the blood. Tide Invocation raises the canals. Precision Coil writes the next round onto a Name. Ankh Alloy is life-metal beaten on the sky anvil. Final Form Whisper is Aelith’s last syllable. Bind an active to Q. The tree opens on K."]
	},
	{
		heading: "Final Note from the Threshold",
		body: ["The palace is still there. The storm still turns. The six Names still wait to be spoken in the correct order by the correct voice. You crossed a rift that should not exist. You walked the open grounds of a being that is also a place. You took the fire, the law, the blood, the night, the throne, and finally the sovereign herself. The cycle is complete for this turn of the wheel. The next turn is already beginning somewhere in the red dark.", "Walk carefully, Type VI. The door remembers your name. And Aelith is patient. She has all the time in the world. And the world, in this place, is made of her."]
	}
];
function nameById(id) {
	return NAMES.find((n) => n.id === id);
}
var SETTINGS_KEY = "crimson-sovereign-settings-v3";
function defaultSettings() {
	return {
		sensitivity: .0024,
		invertY: false,
		shake: true,
		volume: .72,
		muted: false,
		gyro: false,
		quality: typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches ? 720 : 1080,
		immortal: true,
		cam: "fps",
		character: "warden"
	};
}
var emptyHud = () => ({
	health: 100,
	maxHealth: 100,
	ammo: 22,
	mag: 22,
	weapon: "Spark Rifle",
	weaponId: 0,
	charging: 0,
	reloading: false,
	zone: "The Threshold",
	objective: "Claim the outer Names",
	message: "",
	runes: [],
	kills: 0,
	hitmarker: 0,
	damageFlash: 0,
	locked: false,
	boss: null,
	moment: null,
	code: "63821",
	prompt: "",
	promptKey: "F",
	pad: "",
	event: null,
	ads: false,
	scoped: false,
	cam: "fps",
	bag: false,
	atlas: false,
	tree: false,
	map: {
		x: 0,
		z: 68,
		yaw: 0,
		marks: [],
		runes: [],
		gateOpen: false
	},
	fortitude: 0,
	skillPts: 2,
	skills: ["ember-fortitude"],
	activeSkill: "ember-fortitude",
	skillCd: 0,
	skillCast: null,
	recoilHeat: 0
});
function applySeed(seed) {
	persistCode(seed);
	shareCodeUrl(seed);
	return {
		seed,
		profile: buildProfile(seed)
	};
}
var useGame = create((set, get) => ({
	screen: "title",
	settingsTo: "title",
	runId: 0,
	seed: 63821,
	profile: buildProfile(63821),
	hud: emptyHud(),
	settings: defaultSettings(),
	cloudSave: null,
	setScreen: (screen) => set({ screen }),
	startRun: () => set({
		screen: "playing",
		runId: get().runId + 1,
		hud: emptyHud()
	}),
	openSettings: (from) => set({
		screen: "settings",
		settingsTo: from
	}),
	openCodex: (from) => set({
		screen: "codex",
		settingsTo: from
	}),
	setHud: (h) => set({ hud: {
		...get().hud,
		...h
	} }),
	patchSettings: (s) => {
		const settings = {
			...get().settings,
			...s
		};
		set({ settings });
		try {
			localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
		} catch {}
	},
	setSeed: (n) => set(applySeed(n)),
	rollSeed: () => set(applySeed(randomCode())),
	loadCode: (raw) => {
		const n = parseCode(raw);
		if (n === null) return false;
		set(applySeed(n));
		return true;
	},
	setCharacter: (id) => get().patchSettings({ character: id }),
	setCloudSave: (cloudSave) => set({ cloudSave })
}));
var SHEET = "/ui/skill-sheet.jpg";
var TREE = "/ui/skill-tree.jpg";
var CARD = "/ui/ember-fortitude.jpg";
var BRANCHES = [
	{
		id: "strength",
		label: "Strength",
		line: "Power. Dominion. Endurance."
	},
	{
		id: "magic",
		label: "Magic",
		line: "Reality. Will. Domination."
	},
	{
		id: "attack",
		label: "Attack",
		line: "Cruelty. Precision. Execution."
	},
	{
		id: "minerals",
		label: "Minerals",
		line: "Wealth. Essence. Ascension."
	}
];
var SKILLS = [
	{
		id: "ember-fortitude",
		name: "Ember Fortitude",
		branch: "strength",
		tier: 1,
		cost: 0,
		active: "fortitude",
		resist: .06,
		icon: CARD,
		art: CARD,
		desc: "Fists of crystal. Channel to endure."
	},
	{
		id: "night-carapace",
		name: "Night Carapace",
		branch: "strength",
		tier: 1,
		cost: 1,
		requires: "ember-fortitude",
		active: "carapace",
		resist: .05,
		icon: "/lore/skill-carapace.jpg",
		art: "/lore/skill-carapace.jpg",
		desc: "Black crystal plates the blood."
	},
	{
		id: "blood-endurance",
		name: "Blood Endurance",
		branch: "strength",
		tier: 1,
		cost: 1,
		life: 18,
		icon: "/lore/skill-vial.jpg",
		art: "/lore/skill-vial.jpg",
		desc: "The vial drinks hurt and returns it as heat."
	},
	{
		id: "crystal-hide",
		name: "Crystal Hide",
		branch: "strength",
		tier: 2,
		cost: 1,
		requires: "night-carapace",
		resist: .08,
		icon: "/lore/skill-hide.jpg",
		art: "/lore/skill-hide.jpg",
		desc: "Hide thickens. Lesser souls glance off."
	},
	{
		id: "iron-pulse",
		name: "Iron Pulse",
		branch: "strength",
		tier: 2,
		cost: 1,
		requires: "blood-endurance",
		life: 12,
		resist: .04,
		icon: "/lore/skill-vial.jpg",
		art: "/lore/skill-vial.jpg",
		desc: "Heartbeat hammers the palace floor."
	},
	{
		id: "throne-guard",
		name: "Throne Guard",
		branch: "strength",
		tier: 2,
		cost: 1,
		requires: "ember-fortitude",
		resist: .07,
		icon: "/lore/skill-colossus.jpg",
		art: "/lore/skill-colossus.jpg",
		desc: "The gate's oath sits on your shoulders."
	},
	{
		id: "dominion-stance",
		name: "Dominion Stance",
		branch: "strength",
		tier: 3,
		cost: 2,
		requires: "crystal-hide",
		dmg: .08,
		resist: .06,
		icon: "/lore/skill-hide.jpg",
		art: "/lore/skill-hide.jpg",
		desc: "Feet planted. The world yields."
	},
	{
		id: "colossus-step",
		name: "Colossus Step",
		branch: "strength",
		tier: 3,
		cost: 2,
		requires: "iron-pulse",
		speed: .08,
		icon: "/lore/skill-colossus.jpg",
		art: "/lore/skill-colossus.jpg",
		desc: "Each stride cracks the canals."
	},
	{
		id: "sovereign-aegis",
		name: "Sovereign Aegis",
		branch: "strength",
		tier: 4,
		cost: 2,
		requires: "dominion-stance",
		resist: .12,
		life: 20,
		icon: "/lore/skill-carapace.jpg",
		art: "/lore/skill-carapace.jpg",
		desc: "The crown's last wall."
	},
	{
		id: "tide-invocation",
		name: "Tide Invocation",
		branch: "magic",
		tier: 1,
		cost: 1,
		active: "tide",
		icon: "/lore/skill-tide.jpg",
		art: "/lore/skill-tide.jpg",
		desc: "Red water rises and answers."
	},
	{
		id: "law-script",
		name: "Law Script",
		branch: "magic",
		tier: 1,
		cost: 1,
		mag: .1,
		icon: "/lore/skill-glyphs.jpg",
		art: "/lore/skill-glyphs.jpg",
		desc: "Runes rewrite the magazine."
	},
	{
		id: "rune-orbit",
		name: "Rune Orbit",
		branch: "magic",
		tier: 1,
		cost: 1,
		dmg: .06,
		icon: "/lore/skill-glyphs.jpg",
		art: "/lore/skill-glyphs.jpg",
		desc: "Living glyphs circle the barrel."
	},
	{
		id: "night-veil",
		name: "Night Veil",
		branch: "magic",
		tier: 2,
		cost: 1,
		requires: "tide-invocation",
		speed: .06,
		icon: "/lore/skill-whisper.jpg",
		art: "/lore/skill-whisper.jpg",
		desc: "The dark forgets you for a breath."
	},
	{
		id: "blood-tide",
		name: "Blood Tide",
		branch: "magic",
		tier: 2,
		cost: 1,
		requires: "tide-invocation",
		life: 10,
		icon: "/lore/skill-tide.jpg",
		art: "/lore/skill-tide.jpg",
		desc: "Canals feed the hunter."
	},
	{
		id: "glyph-storm",
		name: "Glyph Storm",
		branch: "magic",
		tier: 2,
		cost: 1,
		requires: "rune-orbit",
		dmg: .08,
		icon: "/lore/skill-glyphs.jpg",
		art: "/lore/skill-glyphs.jpg",
		desc: "Law falls like red hail."
	},
	{
		id: "dominion-mind",
		name: "Dominion Mind",
		branch: "magic",
		tier: 3,
		cost: 2,
		requires: "law-script",
		mag: .12,
		icon: "/lore/rynara.jpg",
		art: "/lore/rynara.jpg",
		desc: "The staff thinks with you."
	},
	{
		id: "void-whisper",
		name: "Void Whisper",
		branch: "magic",
		tier: 3,
		cost: 2,
		requires: "night-veil",
		active: "whisper",
		icon: "/lore/skill-whisper.jpg",
		art: "/lore/skill-whisper.jpg",
		desc: "A word that unmakes knees."
	},
	{
		id: "final-whisper",
		name: "Final Form Whisper",
		branch: "magic",
		tier: 4,
		cost: 2,
		requires: "void-whisper",
		active: "whisper",
		dmg: .1,
		icon: "/lore/aelith-ankh-queen.jpg",
		art: "/lore/aelith-ankh-queen.jpg",
		desc: "Aelith's last syllable."
	},
	{
		id: "precision-coil",
		name: "Precision Coil",
		branch: "attack",
		tier: 1,
		cost: 1,
		active: "coil",
		crit: .08,
		icon: "/lore/skill-coil.jpg",
		art: "/lore/skill-coil.jpg",
		desc: "The next round finds the Name."
	},
	{
		id: "shadow-lunge",
		name: "Shadow Lunge",
		branch: "attack",
		tier: 1,
		cost: 1,
		active: "lunge",
		icon: "/lore/skill-dash.jpg",
		art: "/lore/skill-dash.jpg",
		desc: "Close the dark in one stride."
	},
	{
		id: "crimson-surge",
		name: "Crimson Surge",
		branch: "attack",
		tier: 1,
		cost: 1,
		active: "surge",
		dmg: .06,
		icon: "/lore/skill-surge.jpg",
		art: "/lore/skill-surge.jpg",
		desc: "Blood leaps the barrel."
	},
	{
		id: "ankh-strike",
		name: "Ankh Strike",
		branch: "attack",
		tier: 2,
		cost: 1,
		requires: "precision-coil",
		dmg: .08,
		icon: "/lore/skill-coil.jpg",
		art: "/lore/skill-coil.jpg",
		desc: "The mark of life cuts both ways."
	},
	{
		id: "wraith-cleave",
		name: "Wraith Cleave",
		branch: "attack",
		tier: 2,
		cost: 1,
		requires: "shadow-lunge",
		dmg: .07,
		icon: "/lore/skill-dash.jpg",
		art: "/lore/skill-dash.jpg",
		desc: "Steel through smoke."
	},
	{
		id: "coil-critical",
		name: "Coil Critical",
		branch: "attack",
		tier: 2,
		cost: 1,
		requires: "precision-coil",
		crit: .12,
		icon: "/lore/skill-coil.jpg",
		art: "/lore/skill-coil.jpg",
		desc: "The pin remembers the heart."
	},
	{
		id: "execution-mark",
		name: "Execution Mark",
		branch: "attack",
		tier: 3,
		cost: 2,
		requires: "coil-critical",
		crit: .1,
		dmg: .06,
		icon: "/lore/skill-coil.jpg",
		art: "/lore/skill-coil.jpg",
		desc: "A Name written on the target."
	},
	{
		id: "dual-surge",
		name: "Crimson Surge + Shadow Lunge",
		branch: "attack",
		tier: 3,
		cost: 2,
		requires: "crimson-surge",
		active: "surge",
		dmg: .1,
		speed: .08,
		icon: "/lore/skill-lunge.jpg",
		art: "/lore/skill-lunge.jpg",
		desc: "Two skills, one red hour."
	},
	{
		id: "blood-repeater",
		name: "Blood Repeater",
		branch: "attack",
		tier: 4,
		cost: 2,
		requires: "execution-mark",
		mag: .15,
		icon: "/lore/hunter-hood.jpg",
		art: "/lore/hunter-hood.jpg",
		desc: "The SMG drinks faster."
	},
	{
		id: "ankh-alloy",
		name: "Ankh Alloy Shield",
		branch: "minerals",
		tier: 1,
		cost: 1,
		resist: .06,
		icon: "/lore/skill-forge.jpg",
		art: "/lore/skill-forge.jpg",
		desc: "Life-metal beaten on the sky anvil."
	},
	{
		id: "ember-ore",
		name: "Ember Ore",
		branch: "minerals",
		tier: 1,
		cost: 1,
		dmg: .05,
		icon: "/lore/vaelith-field.jpg",
		art: "/lore/vaelith-field.jpg",
		desc: "Vaelith's first stone."
	},
	{
		id: "void-crystals",
		name: "Void Crystals",
		branch: "minerals",
		tier: 1,
		cost: 1,
		mag: .08,
		icon: "/lore/construct.jpg",
		art: "/lore/construct.jpg",
		desc: "Purple glass from the rift."
	},
	{
		id: "blood-minerals",
		name: "Blood Minerals",
		branch: "minerals",
		tier: 2,
		cost: 1,
		requires: "ember-ore",
		life: 14,
		icon: "/lore/skill-vial.jpg",
		art: "/lore/skill-vial.jpg",
		desc: "Ore that still remembers veins."
	},
	{
		id: "sovereign-stones",
		name: "Sovereign Stones",
		branch: "minerals",
		tier: 2,
		cost: 1,
		requires: "ankh-alloy",
		dmg: .07,
		icon: "/lore/skill-forge.jpg",
		art: "/lore/skill-forge.jpg",
		desc: "The palace's own teeth."
	},
	{
		id: "pylon-heart",
		name: "Pylon Heart",
		branch: "minerals",
		tier: 2,
		cost: 1,
		requires: "void-crystals",
		mag: .1,
		icon: "/lore/vaelith-field.jpg",
		art: "/lore/vaelith-field.jpg",
		desc: "A stolen ember core."
	},
	{
		id: "crystal-well",
		name: "Crystal Well",
		branch: "minerals",
		tier: 3,
		cost: 2,
		requires: "blood-minerals",
		life: 16,
		resist: .05,
		icon: "/lore/skill-forge.jpg",
		art: "/lore/skill-forge.jpg",
		desc: "Drink from the red well."
	},
	{
		id: "alloy-crown",
		name: "Alloy Crown",
		branch: "minerals",
		tier: 4,
		cost: 2,
		requires: "sovereign-stones",
		resist: .1,
		dmg: .08,
		icon: TREE,
		art: TREE,
		desc: "The four branches close."
	},
	{
		id: "blood-rite",
		name: "Circle of Four",
		branch: "minerals",
		tier: 3,
		cost: 2,
		requires: "pylon-heart",
		active: "ritual",
		icon: "/lore/skill-ritual.jpg",
		art: "/lore/skill-ritual.jpg",
		desc: "Four blades. One red law."
	}
];
var SHEET_ART = SHEET;
var TREE_ART = TREE;
function skillById(id) {
	return SKILLS.find((s) => s.id === id);
}
function modsFrom(owned) {
	const m = {
		dmg: 1,
		resist: 0,
		speed: 1,
		crit: 0,
		mag: 1,
		life: 0
	};
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
function skillHash(id) {
	let h = 2166136261;
	for (let i = 0; i < id.length; i++) {
		h ^= id.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return h >>> 0;
}
function skillStatLine(s) {
	const bits = [];
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
var BRANCH_HUE = {
	strength: "currentColor",
	magic: "currentColor",
	attack: "currentColor",
	minerals: "currentColor"
};
function SkillMark({ id, branch, className }) {
	const h = skillHash(id);
	const n = 5 + h % 3;
	const pts = [];
	for (let i = 0; i < n; i++) {
		const a = (h >>> i * 3) % 360 * (Math.PI / 180);
		const r = 5.4 + (h >>> i * 2) % 5;
		pts.push(`${12 + Math.cos(a) * r},${12 + Math.sin(a) * r}`);
	}
	const inner = 2 + h % 3;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 24 24",
		className,
		"aria-hidden": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "12",
				cy: "12",
				r: "10.2",
				fill: "none",
				stroke: BRANCH_HUE[branch ?? "strength"],
				strokeWidth: "1.15"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
				points: pts.join(" "),
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.05"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "12",
				cy: "12",
				r: inner,
				fill: "currentColor"
			}),
			(h & 1) === 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "12",
				cy: "12",
				r: "7.2",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "0.7",
				opacity: "0.7"
			}) : null
		]
	});
}
var ART_URLS = [
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
	"/textures/sky.jpg"
];
var CRITICAL = [
	"/lore/title-wide.jpg",
	"/lore/knight.jpg",
	"/lore/char-warden.jpg",
	"/ui/world-map.jpg"
];
function loadOne(url, ms) {
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
function preloadArt(onProgress) {
	const list = [...new Set(ART_URLS)];
	if (list.length === 0) {
		onProgress?.(1);
		return Promise.resolve();
	}
	onProgress?.(.08);
	const critical = CRITICAL.filter((u) => list.includes(u));
	const rest = list.filter((u) => !critical.includes(u));
	let done = 0;
	const mark = () => {
		done += 1;
		onProgress?.(Math.min(1, .08 + done / list.length * .92));
	};
	const run = async () => {
		await Promise.all(critical.map((url) => loadOne(url, 1600).then(mark)));
		onProgress?.(Math.max(.55, done / list.length));
		const batch = 6;
		for (let i = 0; i < rest.length; i += batch) await Promise.all(rest.slice(i, i + batch).map((url) => loadOne(url, 1400).then(mark)));
		onProgress?.(1);
	};
	return Promise.race([run(), new Promise((resolve) => {
		window.setTimeout(() => {
			onProgress?.(1);
			resolve();
		}, 2800);
	})]);
}
var MAP_LANDMARKS = [
	{
		id: "vaelith",
		x: 0,
		z: -82,
		kind: "rune",
		label: "Vaelith"
	},
	{
		id: "rynara",
		x: -78,
		z: 0,
		kind: "rune",
		label: "Rynara"
	},
	{
		id: "sanguara",
		x: 80,
		z: 4,
		kind: "rune",
		label: "Sanguara"
	},
	{
		id: "nyxara",
		x: -52,
		z: -52,
		kind: "rune",
		label: "Nyxara"
	},
	{
		id: "eryndra",
		x: 0,
		z: -15,
		kind: "rune",
		label: "Eryndra"
	},
	{
		id: "gate",
		x: 0,
		z: 22,
		kind: "gate",
		label: "Gate"
	},
	{
		id: "palace",
		x: 0,
		z: -8,
		kind: "palace",
		label: "Palace"
	},
	{
		id: "spawn",
		x: 0,
		z: 68,
		kind: "palace",
		label: "Threshold"
	}
];
/**
* Painted atlas landmarks (world-map.jpg):
* Nyxara top, palace center, Threshold bottom, Vaelith left, Sanguara right, Rynara lower-left.
* Inverse-distance maps live world coords onto that painting.
*/
var CAL = [
	{
		x: 0,
		z: 68,
		u: .5,
		v: .9
	},
	{
		x: 0,
		z: 48,
		u: .5,
		v: .8
	},
	{
		x: 0,
		z: 22,
		u: .5,
		v: .66
	},
	{
		x: 0,
		z: -8,
		u: .5,
		v: .48
	},
	{
		x: 0,
		z: -15,
		u: .5,
		v: .4
	},
	{
		x: 0,
		z: -82,
		u: .2,
		v: .4
	},
	{
		x: -78,
		z: 0,
		u: .2,
		v: .78
	},
	{
		x: 80,
		z: 4,
		u: .84,
		v: .46
	},
	{
		x: -52,
		z: -52,
		u: .42,
		v: .1
	},
	{
		x: 40,
		z: 10,
		u: .7,
		v: .52
	},
	{
		x: -40,
		z: 10,
		u: .32,
		v: .58
	}
];
var atlas = null;
var atlasWaiters = [];
function ensureMapArt() {
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
function onMapArtReady(fn) {
	const img = ensureMapArt();
	if (img.complete && img.naturalWidth > 0) fn();
	else atlasWaiters.push(fn);
}
function worldToMapUV(x, z) {
	let wu = 0;
	let wv = 0;
	let w = 0;
	for (const c of CAL) {
		const dx = x - c.x;
		const dz = z - c.z;
		const d2 = dx * dx + dz * dz;
		if (d2 < .25) return {
			u: c.u,
			v: c.v
		};
		const wt = 1 / (d2 * d2);
		wu += c.u * wt;
		wv += c.v * wt;
		w += wt;
	}
	return {
		u: Math.min(.98, Math.max(.02, wu / w)),
		v: Math.min(.98, Math.max(.02, wv / w))
	};
}
/** Canvas heading so the pip points the way the hunter is actually walking on the painting. */
function headingOnMap(x, z, yaw) {
	const here = worldToMapUV(x, z);
	const ahead = worldToMapUV(x - Math.sin(yaw) * 10, z - Math.cos(yaw) * 10);
	return Math.atan2(ahead.u - here.u, -(ahead.v - here.v));
}
function drawSatNav(ctx, w, h, frame) {
	if (!frame || !w || !h) return;
	ensureMapArt();
	const cx = w / 2;
	const cy = h / 2;
	const r = Math.min(w, h) * .48;
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
	const pip = (x, z) => {
		const uv = worldToMapUV(x, z);
		return {
			sx: cx + (uv.u - you.u) * w * zoom,
			sy: cy + (uv.v - you.v) * h * zoom
		};
	};
	for (const mark of MAP_LANDMARKS) {
		if (mark.kind !== "rune") continue;
		const p = pip(mark.x, mark.z);
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
	ctx.restore();
}
/**
* Current user + loading state. Same behavior in live preview and when deployed:
*   - Auth enabled -> the real signed-in user; `user` is `null` while
*                            the session resolves (`isPending: true`) and when
*                            signed out (`isPending: false`). Session comes from
*                            Better Auth `useSession()` → `/api/auth/get-session`
*                            (cookie when deployed; bearer in live preview).
*   - Auth disabled (`VITE_AUTH_ENABLED=false`) -> `DEV_USER`, never pending.
*
* Protect a route by waiting out `isPending` before acting on `user` —
* redirecting on `user: null` alone bounces signed-in visitors to sign-in on
* every hard reload:
*
*   import { RedirectToSignIn } from "@/lib/auth/gates";
*   const { user, isPending } = useCurrentUserState();
*   if (isPending) return null;              // still resolving — don't redirect yet
*   if (!user) return <RedirectToSignIn />;  // definitely signed out
*
* `authEnabled` is a module-level constant fixed at load, so the guarded hook
* call keeps a stable hook order across every render of a given component.
*/
function useCurrentUserState() {
	const { data, isPending } = authClient.useSession();
	const user = data?.user;
	return {
		user: user ? {
			id: user.id,
			displayName: user.name ?? null,
			primaryEmail: user.email ?? null,
			profileImageUrl: user.image ?? null,
			isDevFallback: false
		} : null,
		isPending
	};
}
/**
* Convenience view of `useCurrentUserState().user` for display (e.g.
* `user?.displayName ?? "Guest"`). NOTE: `null` means *loading OR signed out* —
* for redirects/guards use `useCurrentUserState()` and check `isPending`.
*/
function useCurrentUser() {
	return useCurrentUserState().user;
}
/**
* Minimal signed-in identity chip + sign-out. Restyle freely (see the
* `design-ui` skill). Sign-out is only shown when auth is enabled (the
* disabled-auth dev user has nothing to sign out of).
*/
function UserButton() {
	const user = useCurrentUser();
	const [signingOut, setSigningOut] = (0, import_react.useState)(false);
	if (!user) return null;
	const label = user.displayName ?? user.primaryEmail ?? "Account";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [
			user.profileImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: user.profileImageUrl,
				alt: "",
				className: "h-8 w-8 rounded-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid h-8 w-8 place-items-center rounded-full bg-black/10 text-sm font-medium dark:bg-white/20",
				children: label.charAt(0).toUpperCase()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-medium",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: signingOut,
				onClick: () => {
					setSigningOut(true);
					signOut().catch(() => setSigningOut(false));
				},
				className: "cursor-pointer text-sm underline-offset-4 opacity-70 hover:underline disabled:cursor-wait disabled:no-underline",
				children: signingOut ? "Signing out…" : "Sign out"
			})
		]
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var saveSchema = object({
	code: string().min(1).max(8),
	runes: array(string()).max(8),
	skills: array(string()).max(32),
	skillPts: number().int().min(0).max(99),
	characterId: string().min(1).max(32)
});
var loadProgress = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("2e8bfa3424627069191a5f8f1408a3a1bf063549e46ba15a7b3ea6db6eeb01cb"));
var saveProgress = createServerFn({ method: "POST" }).validator((input) => saveSchema.parse(input)).middleware([authMiddleware]).handler(createSsrRpc("5b2cc19255520ee706791ab651ff042d4b843eab0a79e7a4342205a4fe9de600"));
function GameApp() {
	const screen = useGame((s) => s.screen);
	const runId = useGame((s) => s.runId);
	const playing = screen === "playing" || screen === "paused" || screen === "dead" || screen === "victory" || runId > 0 && (screen === "codex" || screen === "settings");
	(0, import_react.useEffect)(() => {
		try {
			const raw = localStorage.getItem("crimson-sovereign-settings-v3");
			if (raw) useGame.getState().patchSettings(JSON.parse(raw));
		} catch {}
		if (window.matchMedia("(pointer: coarse)").matches) useGame.getState().patchSettings({ gyro: false });
		useGame.getState().setSeed(loadSavedCode());
		preloadArt().catch(() => void 0);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative h-dvh w-full overflow-hidden bg-bg font-sans text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudSync, {}),
			playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayView, {}, runId) : null,
			screen === "title" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Title, {}) : null,
			screen === "briefing" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Briefing, {}) : null,
			screen === "codex" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Codex, {}) : null,
			screen === "settings" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, {}) : null,
			screen === "paused" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PauseMenu, {}) : null,
			screen === "dead" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(End, { kind: "dead" }) : null,
			screen === "victory" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(End, { kind: "victory" }) : null
		]
	});
}
function CloudSync() {
	const { user, isPending } = useCurrentUserState();
	const hud = useGame((s) => s.hud);
	const seed = useGame((s) => s.seed);
	const character = useGame((s) => s.settings.character);
	const screen = useGame((s) => s.screen);
	(0, import_react.useEffect)(() => {
		if (isPending || !user || false) return;
		loadProgress().then((save) => {
			if (!save) return;
			useGame.getState().setCloudSave(save);
			if (save.code) useGame.getState().loadCode(save.code);
			if (save.characterId) useGame.getState().setCharacter(save.characterId);
		}).catch(() => void 0);
	}, [user, isPending]);
	(0, import_react.useEffect)(() => {
		if (!user || false) return;
		if (screen !== "playing" && screen !== "paused" && screen !== "victory") return;
		const t = window.setTimeout(() => {
			saveProgress({ data: {
				code: padCode(seed),
				runes: hud.runes,
				skills: hud.skills,
				skillPts: hud.skillPts,
				characterId: character
			} }).catch(() => void 0);
		}, 800);
		return () => window.clearTimeout(t);
	}, [
		user,
		hud.runes,
		hud.skills,
		hud.skillPts,
		seed,
		character,
		screen
	]);
	return null;
}
function AuthSlot() {
	const { user, isPending } = useCurrentUserState();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-36 animate-pulse rounded-md bg-raised" });
	if (user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rounded-md border border-border bg-bg/70 px-3 py-1.5",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/login",
		className: "rounded-md border border-crimson bg-crimson/20 px-4 py-2 font-display text-xs tracking-[0.22em] text-fg hover:bg-crimson hover:text-bg",
		children: "Sign in"
	});
}
function PlayView() {
	const canvasRef = (0, import_react.useRef)(null);
	const gameRef = (0, import_react.useRef)(null);
	const [ready, setReady] = (0, import_react.useState)(false);
	const screen = useGame((s) => s.screen);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		let dead = false;
		let game = null;
		import("./engine-CuI-n80f.mjs").then(({ CrimsonGame }) => {
			if (dead || !canvas) return;
			game = new CrimsonGame(canvas);
			gameRef.current = game;
			game.start().catch((err) => {
				console.warn("start", err);
			}).finally(() => {
				if (!dead) setReady(true);
			});
		});
		const fail = window.setTimeout(() => {
			if (!dead) setReady(true);
		}, 280);
		return () => {
			dead = true;
			window.clearTimeout(fail);
			game?.dispose();
			gameRef.current = null;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (!ready) return;
		gameRef.current?.setPaused(screen !== "playing");
	}, [screen, ready]);
	(0, import_react.useEffect)(() => {
		return useGame.subscribe((s, p) => {
			if (s.settings.volume !== p.settings.volume || s.settings.muted !== p.settings.muted) {
				gameRef.current?.audio.setVolume(s.settings.volume);
				gameRef.current?.audio.setMuted(s.settings.muted);
			}
			if (s.settings.quality !== p.settings.quality) gameRef.current?.setQuality(s.settings.quality);
		});
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
			ref: canvasRef,
			className: "absolute inset-0 z-0 h-full w-full touch-none bg-raised"
		}),
		!ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "pointer-events-none absolute left-1/2 top-8 z-20 -translate-x-1/2 rounded-md border border-border bg-bg/50 px-4 py-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-[0.65rem] tracking-[0.3em] text-muted",
				children: "THRESHOLD LIVE"
			})
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hud, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WeaponBag, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AtlasMap, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkillTree, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MobileControls, {})
	] });
}
function Hud() {
	const hud = useGame((s) => s.hud);
	const screen = useGame((s) => s.screen);
	const setScreen = useGame((s) => s.setScreen);
	if (screen !== "playing") return null;
	const hp = Math.max(0, hud.health / hud.maxHealth);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none absolute inset-0 z-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0",
				style: { boxShadow: `inset 0 0 ${80 + hud.damageFlash * 120}px rgba(196,30,58,${.12 + hud.damageFlash * .45})` }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
				children: hud.scoped ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "size-3 rounded-full border-[1.5px] border-crimson shadow-[0_0_12px_#c41e3a]",
						style: {
							transform: `scale(${1 + hud.recoilHeat * .35})`,
							opacity: .85 + hud.recoilHeat * .15
						}
					}),
					[
						0,
						90,
						180,
						270
					].map((deg) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute left-1/2 top-1/2 h-2 w-px bg-crimson/80",
						style: { transform: `translate(-50%,-50%) rotate(${deg}deg) translateY(${-10 - hud.recoilHeat * 16}px)` }
					}, deg)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-fg/70",
						style: {
							opacity: hud.hitmarker * .85,
							transform: `translate(-50%,-50%) rotate(45deg) scale(${1 + hud.hitmarker * .35})`
						}
					})
				] })
			}),
			hud.scoped ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-none absolute inset-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-0",
						style: { background: "radial-gradient(circle at 50% 50%, transparent 16%, rgba(6,0,2,0.55) 28%, rgba(0,0,0,0.92) 48%)" }
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute left-1/2 top-[18%] h-[64%] w-px -translate-x-1/2 bg-crimson/50" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute left-[18%] top-1/2 h-px w-[64%] -translate-y-1/2 bg-crimson/50" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-crimson/70" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-crimson" })
				]
			}) : null,
			!hud.locked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 grid place-items-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg border border-border bg-bg/80 px-6 py-4 text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-sm tracking-[0.25em] text-fg",
						children: "CLICK TO PLAY"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted",
						children: "WASD · V camera · I bag · M map · K tree · Q skill · 1–6 arms · F claim"
					})]
				})
			}) : null,
			hud.prompt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute left-1/2 top-[58%] flex -translate-x-1/2 items-center gap-2 rounded-md border border-border bg-bg/80 px-3 py-2",
				children: [hud.promptKey ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "grid min-w-8 place-items-center rounded-sm border border-crimson bg-raised px-2 py-0.5 font-display text-xs tracking-widest text-fg",
					children: hud.promptKey
				}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-xs tracking-wide text-fg",
					children: hud.prompt
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "absolute left-0 right-0 top-0 flex items-start justify-between gap-3 p-3 pt-[max(2.6rem,env(safe-area-inset-top))] font-display text-[0.7rem] tracking-[0.08em] [text-shadow:0_0_10px_#000] sm:p-4 sm:text-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-w-[46vw] sm:max-w-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["Zone · ", hud.zone] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm font-sans tracking-normal text-fg/85",
							children: hud.objective
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 font-mono text-[0.65rem] tracking-widest text-subtle",
							children: ["CODE ", hud.code]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 tracking-[0.18em] text-ember",
							children: ["VIEW · ", hud.cam === "fps" ? "FIRST EYE" : hud.cam === "tps" ? "SHOULDER" : "SPECTATE"]
						}),
						hud.pad ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 tracking-[0.18em] text-ember",
							children: hud.pad.toUpperCase()
						}) : null
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mr-28 flex items-start gap-2 sm:mr-64",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "pointer-events-auto grid size-11 place-items-center rounded-md border border-border bg-surface/80 text-fg",
						onClick: () => setScreen("paused"),
						"aria-label": "Pause",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" })
					})
				})]
			}),
			hud.event ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: `absolute left-1/2 w-[min(440px,88vw)] -translate-x-1/2 text-center ${hud.boss ? "top-24" : "top-[4.6rem]"}`,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-display text-xs tracking-[0.32em] text-crimson",
						children: ["MOMENT ", hud.event.id]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 font-display text-sm text-fg",
						children: hud.event.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs italic text-muted",
						children: hud.event.desc
					})
				]
			}) : null,
			hud.boss ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute left-1/2 top-16 w-[min(420px,86vw)] -translate-x-1/2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mb-1 text-center font-display text-xs tracking-[0.25em] text-ember",
					children: [
						hud.boss.name,
						" · LV ",
						hud.boss.level
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-1.5 overflow-hidden rounded-full bg-raised",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-full bg-crimson",
						style: { width: `${100 * hud.boss.hp / hud.boss.max}%` }
					})
				})]
			}) : null,
			hud.moment ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute left-1/2 top-[18%] w-[min(520px,92vw)] -translate-x-1/2 text-center",
				children: [
					hud.moment.portrait ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: hud.moment.portrait,
						alt: hud.moment.title,
						width: 320,
						height: 400,
						decoding: "async",
						fetchPriority: "high",
						className: "mx-auto mb-4 h-44 w-32 rounded-md border border-crimson object-cover shadow-[0_0_40px_#c41e3a88] sm:h-56 sm:w-40"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-xs tracking-[0.32em] text-crimson",
						children: hud.moment.epithet.toUpperCase()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 font-display text-2xl text-fg",
						children: hud.moment.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm italic leading-relaxed text-fg/90",
						children: hud.moment.verse.join(" ")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm leading-relaxed text-muted",
						children: hud.moment.body
					})
				]
			}) : hud.skillCast ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute left-1/2 top-[16%] w-[min(360px,82vw)] -translate-x-1/2 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: hud.skillCast.art,
						alt: "",
						decoding: "async",
						className: "mx-auto h-36 w-24 rounded-md border border-crimson object-cover shadow-[0_0_48px_#c41e3a99] sm:h-44 sm:w-28"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 font-display text-xs tracking-[0.32em] text-ember",
						children: "SKILL BOUND"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 font-display text-lg text-fg",
						children: hud.skillCast.name
					})
				]
			}) : hud.message ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "absolute bottom-36 left-1/2 w-[min(520px,90vw)] -translate-x-1/2 text-center text-sm italic leading-relaxed text-fg [text-shadow:0_0_20px_#000] sm:bottom-24 sm:text-lg",
				children: hud.message
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute bottom-0 left-0 right-0 flex items-end justify-between p-4 pb-[max(1rem,env(safe-area-inset-bottom))]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-end gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkillSlot, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "w-44",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-1 flex justify-between text-xs tracking-[0.2em] text-muted",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "VITAL" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "tabular-nums text-fg",
										children: Math.ceil(hud.health)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-2 overflow-hidden rounded-full bg-raised",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-full bg-crimson",
										style: { width: `${hp * 100}%` }
									})
								}),
								hud.fortitude > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1 h-1 overflow-hidden rounded-full bg-raised",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-full bg-ember",
										style: { width: `${hud.fortitude / 8 * 100}%` }
									})
								}) : null
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute bottom-28 left-1/2 flex -translate-x-1/2 gap-2 pb-[env(safe-area-inset-bottom)] sm:bottom-5",
						children: NAMES.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `size-3.5 rounded-full border-[1.5px] border-crimson transition-all duration-[var(--motion-fast)] ${hud.runes.includes(n.id) ? "bg-crimson shadow-[0_0_18px_#c41e3a]" : "bg-transparent"}`,
							title: n.title
						}, n.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "hidden text-right lg:block",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: WEAPONS[hud.weaponId]?.icon,
								alt: "",
								width: 96,
								height: 96,
								decoding: "async",
								className: "ml-auto mb-2 h-16 w-16 rounded-md border border-border object-cover"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-xs tracking-[0.2em] text-muted",
								children: WEAPONS[hud.weaponId]?.nameKey
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-lg text-fg",
								children: WEAPONS[hud.weaponId]?.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-subtle",
								children: hud.weapon.includes("·") ? hud.weapon.split("·")[1] : ""
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "tabular-nums text-sm text-fg",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xl",
									children: hud.reloading ? "—" : hud.mag
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-muted",
									children: [" / ", hud.ammo]
								})]
							}),
							hud.charging > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 ml-auto h-1 w-24 overflow-hidden rounded-full bg-raised",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-full bg-ember",
									style: { width: `${hud.charging * 100}%` }
								})
							}) : null
						]
					})
				]
			}),
			hud.scoped ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PulseMap, {})
		]
	});
}
function SkillSlot() {
	const activeId = useGame((s) => s.hud.activeSkill);
	const cd = useGame((s) => s.hud.skillCd);
	const forti = useGame((s) => s.hud.fortitude);
	const pts = useGame((s) => s.hud.skillPts);
	const skill = skillById(activeId) ?? SKILLS[0];
	const cooling = cd > .05;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		className: `pointer-events-auto relative h-[4.4rem] w-12 overflow-hidden rounded-md border sm:h-20 sm:w-14 ${forti > 0 ? "border-ember shadow-[0_0_18px_#c41e3a88]" : "border-crimson/70"}`,
		onClick: () => window.__crimsonInput?.skill?.(),
		"aria-label": `${skill.name} · Q`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: skill.art,
				alt: "",
				decoding: "async",
				className: "h-full w-full object-cover"
			}),
			cooling ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute inset-0 grid place-items-center bg-bg/70 font-display text-sm tabular-nums text-fg",
				children: Math.ceil(cd)
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute bottom-0 left-0 right-0 bg-bg/80 py-0.5 text-center font-display text-[0.55rem] tracking-widest text-ember",
				children: "Q"
			}),
			pts > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute right-0.5 top-0.5 grid size-4 place-items-center rounded-full bg-crimson font-display text-[0.55rem] text-fg",
				children: pts
			}) : null
		]
	});
}
function PulseMap() {
	const map = useGame((s) => s.hud.map);
	const scoped = useGame((s) => s.hud.scoped);
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const paint = () => {
			const c = ref.current;
			if (!c) return;
			const ctx = c.getContext("2d");
			if (!ctx) return;
			drawSatNav(ctx, c.width, c.height, map);
		};
		onMapArtReady(paint);
		paint();
	}, [map]);
	if (scoped) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "absolute top-[4.6rem] right-2 z-10 size-[8.2rem] sm:top-3 sm:right-3 sm:size-[15.5rem]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
			ref,
			width: 512,
			height: 512,
			className: "absolute inset-[18%] h-[64%] w-[64%] rounded-full",
			"aria-label": "Pulse sat-nav"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: "/ui/pulse-frame.png",
			alt: "",
			decoding: "async",
			className: "pointer-events-none absolute inset-0 h-full w-full object-contain"
		})]
	});
}
function WeaponBag() {
	const bag = useGame((s) => s.hud.bag);
	const weaponId = useGame((s) => s.hud.weaponId);
	const runes = useGame((s) => s.hud.runes);
	const mag = useGame((s) => s.hud.mag);
	const ammo = useGame((s) => s.hud.ammo);
	const [cat, setCat] = (0, import_react.useState)("gun");
	if (!bag) return null;
	const pick = (id) => {
		window.__crimsonInput?.arm(id);
		window.__crimsonInput?.bag?.();
	};
	const list = WEAPONS.filter((w) => w.cat === cat);
	const equipped = WEAPONS[weaponId];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-30 grid place-items-center bg-bg/80 p-3",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative w-[min(960px,96vw)] max-h-[92dvh] overflow-hidden rounded-md border border-border bg-surface",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: "/ui/weapon-bag.png",
					alt: "",
					decoding: "async",
					className: "pointer-events-none absolute inset-0 h-full w-full object-cover opacity-25"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: "/arms/arsenal-sheet.jpg",
					alt: "",
					decoding: "async",
					className: "relative h-28 w-full object-cover object-top opacity-90"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "absolute right-2 top-2 rounded-md border border-border bg-bg/80 px-3 py-1 font-display text-xs tracking-widest text-fg",
					onClick: () => window.__crimsonInput?.bag?.(),
					children: "Close · I / X"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "absolute left-3 top-3 font-display text-xs tracking-[0.3em] text-ember",
					children: "ARSENAL OF THE BLOOD CROWN"
				}),
				equipped ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "absolute left-3 top-10 font-display text-[0.7rem] tracking-widest text-fg",
					children: [
						"Equipped · ",
						equipped.name,
						" · mag ",
						mag,
						" · reserve ",
						ammo
					]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "relative flex flex-wrap gap-1 p-2",
					children: CATS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setCat(c.id),
						className: `rounded-sm border px-3 py-1 font-display text-[0.65rem] tracking-widest ${cat === c.id ? "border-crimson bg-crimson/30 text-fg" : "border-border text-muted"}`,
						children: c.label
					}, c.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "relative grid max-h-[55dvh] grid-cols-2 gap-2 overflow-y-auto p-3 sm:grid-cols-4",
					children: list.map((w) => {
						const locked = w.unlock === "eryndra" && !runes.includes("eryndra") || w.unlock === "aelith" && !runes.includes("aelith");
						const on = weaponId === w.id;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							disabled: locked,
							onClick: () => pick(w.id),
							className: `rounded-md border p-1.5 text-left ${on ? "border-crimson bg-crimson/30" : "border-border bg-bg/80"} ${locked ? "opacity-40" : ""}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: w.icon,
									alt: "",
									decoding: "async",
									className: "h-20 w-full rounded-sm object-cover"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 font-display text-[0.65rem] tracking-widest text-fg",
									children: w.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-[0.6rem] uppercase tracking-widest text-subtle",
									children: [
										w.fire,
										" · ",
										w.damage,
										" dmg · ",
										locked ? "sealed" : on ? "in hand" : "ready"
									]
								})
							]
						}, w.id);
					})
				})
			]
		})
	});
}
function AtlasMap() {
	const atlas = useGame((s) => s.hud.atlas);
	const map = useGame((s) => s.hud.map);
	if (!atlas || !map) return null;
	const you = worldToMapUV(map.x, map.z);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-30 grid place-items-center bg-bg/80 p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative w-[min(920px,96vw)]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: "/ui/world-map.jpg",
					alt: "Crimson Sovereign open world",
					className: "w-full rounded-md border border-crimson/40"
				}),
				MAP_LANDMARKS.filter((m) => m.kind === "rune").map((m) => {
					const uv = worldToMapUV(m.x, m.z);
					const on = map.runes.includes(m.id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: `absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-ember ${on ? "bg-crimson" : "bg-ember"}`,
						style: {
							left: `${uv.u * 100}%`,
							top: `${uv.v * 100}%`
						},
						title: m.label || m.id
					}, m.id);
				}),
				(map.marks || []).filter((m) => m.kind === "foe").slice(0, 24).map((m, i) => {
					const uv = worldToMapUV(m.x, m.z);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "absolute size-1.5 -translate-x-1/2 -translate-y-1/2 bg-crimson",
						style: {
							left: `${uv.u * 100}%`,
							top: `${uv.v * 100}%`
						}
					}, `foe-${i}`);
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "absolute size-0 border-x-[7px] border-b-[12px] border-x-transparent border-b-crimson -translate-x-1/2 -translate-y-full",
					style: {
						left: `${you.u * 100}%`,
						top: `${you.v * 100}%`
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "absolute right-2 top-2 rounded-md border border-border bg-bg/80 px-3 py-1 font-display text-xs tracking-widest text-fg",
					onClick: () => window.__crimsonInput?.map?.(),
					children: "Close · M"
				})
			]
		})
	});
}
function MobileControls() {
	const coarse = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
	const screen = useGame((s) => s.screen);
	const prompt = useGame((s) => s.hud.prompt);
	if (!coarse || screen !== "playing") return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none absolute inset-0 z-20",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stick, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "absolute bottom-6 right-2 flex flex-col items-end gap-1.5 pointer-events-auto pb-[max(0.5rem,env(safe-area-inset-bottom))]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HoldBtn, {
					label: "FIRE",
					big: true,
					onHold: (v) => window.__crimsonInput?.fire(v)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TapBtn, {
						label: "JUMP",
						onTap: () => window.__crimsonInput?.jump()
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HoldBtn, {
						label: "SPRINT",
						onHold: (v) => window.__crimsonInput?.sprint(v)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TapBtn, {
							label: "HEAR",
							hot: Boolean(prompt),
							onTap: () => window.__crimsonInput?.interact()
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TapBtn, {
							label: "EMBER",
							hot: Boolean(prompt),
							onTap: () => window.__crimsonInput?.skill?.()
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TapBtn, {
							label: "RELOAD",
							onTap: () => window.__crimsonInput?.reload()
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TapBtn, {
							label: "BAG",
							onTap: () => window.__crimsonInput?.bag?.()
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TapBtn, {
							label: "MAP",
							onTap: () => window.__crimsonInput?.map?.()
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TapBtn, {
							label: "VIEW",
							onTap: () => window.__crimsonInput?.camera?.()
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-1.5",
					children: [
						0,
						1,
						2,
						3,
						4,
						5
					].map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TapBtn, {
						label: String(id + 1),
						onTap: () => window.__crimsonInput?.arm(id)
					}, id))
				})
			]
		})]
	});
}
function Stick() {
	const ref = (0, import_react.useRef)(null);
	const [knob, setKnob] = (0, import_react.useState)({
		x: 0,
		y: 0
	});
	const pid = (0, import_react.useRef)(null);
	const origin = (0, import_react.useRef)({
		x: 0,
		y: 0
	});
	const apply = (clientX, clientY) => {
		const max = 46;
		const dx = clientX - origin.current.x;
		const dy = clientY - origin.current.y;
		const len = Math.hypot(dx, dy);
		const s = len > max ? max / len : 1;
		const x = dx * s / max;
		const y = -dy * s / max;
		setKnob({
			x: dx * s,
			y: dy * s
		});
		window.__crimsonInput?.move?.(x, y);
	};
	const down = (e) => {
		pid.current = e.pointerId;
		origin.current = {
			x: e.clientX,
			y: e.clientY
		};
		e.currentTarget.setPointerCapture(e.pointerId);
		apply(e.clientX, e.clientY);
	};
	const move = (e) => {
		if (pid.current !== e.pointerId) return;
		apply(e.clientX, e.clientY);
	};
	const up = (e) => {
		if (pid.current !== e.pointerId) return;
		pid.current = null;
		setKnob({
			x: 0,
			y: 0
		});
		window.__crimsonInput?.move?.(0, 0);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref,
		className: "pointer-events-auto absolute bottom-24 left-5 size-32 rounded-full border border-crimson/50 bg-surface/40",
		onPointerDown: down,
		onPointerMove: move,
		onPointerUp: up,
		onPointerCancel: up,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute left-1/2 top-1/2 size-14 -translate-x-1/2 -translate-y-1/2 rounded-full border border-crimson bg-crimson/70",
			style: { transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }
		})
	});
}
function HoldBtn({ label, onHold, big }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		className: `grid place-items-center rounded-full border border-crimson/60 bg-crimson/80 font-display tracking-widest text-fg ${big ? "size-16 text-xs" : "size-12 text-[10px]"}`,
		onPointerDown: (e) => {
			e.preventDefault();
			e.currentTarget.setPointerCapture(e.pointerId);
			onHold(true);
		},
		onPointerUp: () => onHold(false),
		onPointerCancel: () => onHold(false),
		onLostPointerCapture: () => onHold(false),
		children: label
	});
}
function TapBtn({ label, onTap, hot }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		className: `grid min-w-11 place-items-center rounded-full border font-display text-[10px] tracking-widest ${hot ? "size-12 border-crimson bg-crimson/80 text-fg" : "size-11 border-border bg-surface/80 text-fg"}`,
		onPointerDown: (e) => {
			e.preventDefault();
			onTap();
		},
		children: label
	});
}
function Title() {
	const startRun = useGame((s) => s.startRun);
	const setScreen = useGame((s) => s.setScreen);
	const openSettings = useGame((s) => s.openSettings);
	const openCodex = useGame((s) => s.openCodex);
	const seed = useGame((s) => s.seed);
	const profile = useGame((s) => s.profile);
	const rollSeed = useGame((s) => s.rollSeed);
	const loadCode = useGame((s) => s.loadCode);
	const [draft, setDraft] = (0, import_react.useState)(() => padCode(seed));
	const [codeErr, setCodeErr] = (0, import_react.useState)(false);
	const [fading, setFading] = (0, import_react.useState)(false);
	const [copied, setCopied] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setDraft(padCode(seed));
	}, [seed]);
	const enter = (to) => {
		if (!loadCode(draft)) {
			setCodeErr(true);
			return;
		}
		setFading(true);
		if (to === "play") startRun();
		else setScreen("briefing");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `absolute inset-0 z-30 overflow-y-auto overscroll-y-contain transition-opacity duration-[1200ms] ${fading ? "pointer-events-none opacity-0" : "opacity-100"}`,
		style: { touchAction: "pan-y" },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 bg-cover bg-center opacity-35",
				style: { backgroundImage: "url(/lore/title-wide.jpg)" }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0",
				style: { background: "radial-gradient(ellipse at 50% 30%, #2a0505 0%, #0a0000 52%, #000 100%)" }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative flex min-h-dvh flex-col items-center px-6 pb-16 pt-14 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute right-4 top-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthSlot, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-[0.85rem] tracking-[0.45em] text-crimson/80",
						children: "TYPE VII · FULL COLOUR CYCLE"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-4 font-display text-[clamp(2.8rem,8vw,5.2rem)] leading-none tracking-[0.12em] text-crimson",
						style: { textShadow: "0 0 60px #ff0033, 0 0 120px #ff0033" },
						children: "CRIMSON SOVEREIGN"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-8 max-w-[540px] text-[1.05rem] leading-relaxed text-fg/90",
						children: [
							TITLE_LEAD[0],
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							TITLE_LEAD[1],
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { children: "Come home." })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gate, {
								onClick: () => enter("briefing"),
								children: "ENTER THE PALACE"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gate, {
								onClick: () => openCodex("title"),
								children: "FULL LORE CODEX"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gate, {
								onClick: () => enter("briefing"),
								children: "THRESHOLD BRIEFING"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-10 font-display text-xs tracking-[0.08em] text-muted",
						children: [
							"Code",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: draft,
								onChange: (e) => {
									setDraft(e.target.value);
									setCodeErr(false);
								},
								onKeyDown: (e) => {
									if (e.key === "Enter") enter("briefing");
								},
								maxLength: 5,
								inputMode: "numeric",
								"aria-label": "Rune code",
								className: "mx-2 h-9 w-[90px] border border-[#660000] bg-[#1a0505] text-center font-mono tracking-[0.2em] text-fg caret-crimson"
							}),
							"· 100 000 galactic myth cycles"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 font-display text-xs tracking-[0.22em] text-crimson/70",
						children: [
							profile.glyphs,
							" · SOVEREIGN LV ",
							profile.bossLevel,
							" · 10 000 OPEN-WORLD MOMENTS"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-md text-sm text-subtle",
						children: profile.blurb
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 flex flex-wrap items-center justify-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "px-3 py-1 font-display text-xs tracking-[0.2em] text-muted hover:text-fg",
								onClick: () => rollSeed(),
								children: "New code"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "px-3 py-1 font-display text-xs tracking-[0.2em] text-muted hover:text-fg",
								onClick: () => {
									const link = cycleLink(seed);
									navigator.clipboard?.writeText(link).then(() => {
										setCopied(true);
										setTimeout(() => setCopied(false), 1800);
									}).catch(() => {
										window.prompt("Copy this cycle code", link);
									});
								},
								children: copied ? "Link copied" : "Share cycle"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "px-3 py-1 font-display text-xs tracking-[0.2em] text-muted hover:text-fg",
								onClick: () => openSettings("title"),
								children: "Settings"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CharacterPick, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeaturedSkills, {}),
					codeErr ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-crimson",
						children: "Enter a code from 00000 to 99999."
					}) : null
				]
			})
		]
	});
}
function CharacterPick() {
	const character = useGame((s) => s.settings.character);
	const setCharacter = useGame((s) => s.setCharacter);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-6 flex max-w-xl flex-wrap justify-center gap-2",
		children: CHARACTERS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: () => setCharacter(c.id),
			className: `w-16 overflow-hidden rounded-md border ${character === c.id ? "border-crimson shadow-[0_0_18px_#c41e3a]" : "border-border"}`,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: c.portrait,
				alt: c.name,
				decoding: "async",
				className: "h-20 w-full object-cover"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "bg-bg/80 px-0.5 py-0.5 font-display text-[0.55rem] tracking-widest text-fg",
				children: c.name
			})]
		}, c.id))
	});
}
function FeaturedSkills() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-5 mb-4 flex max-w-xl justify-center gap-2",
		children: [
			"night-carapace",
			"tide-invocation",
			"precision-coil",
			"ankh-alloy"
		].map((id) => {
			const s = skillById(id);
			if (!s) return null;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-16 overflow-hidden rounded-md border border-border sm:w-[4.6rem]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: s.art,
					alt: s.name,
					decoding: "async",
					className: "h-20 w-full object-cover sm:h-24"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "truncate bg-bg/85 px-0.5 py-0.5 text-center font-display text-[0.5rem] tracking-widest text-muted",
					children: s.branch
				})]
			}, id);
		})
	});
}
function SkillTree() {
	const tree = useGame((s) => s.hud.tree);
	const pts = useGame((s) => s.hud.skillPts);
	const owned = useGame((s) => s.hud.skills);
	const active = useGame((s) => s.hud.activeSkill);
	const [branch, setBranch] = (0, import_react.useState)("strength");
	const [picked, setPicked] = (0, import_react.useState)(active || "ember-fortitude");
	if (!tree) return null;
	const list = SKILLS.filter((s) => s.branch === branch);
	const selected = skillById(picked) ?? list[0];
	const haveSel = owned.includes(selected.id);
	const lockedSel = !haveSel && selected.requires && !owned.includes(selected.requires);
	const canBuy = !haveSel && !lockedSel && pts >= selected.cost;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-30 grid place-items-center bg-bg/85 p-3",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative w-[min(980px,96vw)] max-h-[92dvh] overflow-hidden rounded-lg border border-border bg-surface pointer-events-auto",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: TREE_ART,
					alt: "",
					decoding: "async",
					className: "h-24 w-full object-cover object-center opacity-90 sm:h-32"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: SHEET_ART,
					alt: "",
					decoding: "async",
					className: "h-20 w-full object-cover object-top opacity-95 sm:h-28"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "absolute left-3 top-3 font-display text-xs tracking-[0.35em] text-ember",
					children: [
						"FOUR BRANCHES · ",
						pts,
						" STONES"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "absolute right-2 top-2 rounded-md border border-border bg-bg/80 px-3 py-1 font-display text-xs tracking-widest text-fg",
					onClick: () => window.__crimsonInput?.tree?.(),
					children: "Close · K"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-1 p-2",
					children: BRANCHES.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => {
							setBranch(b.id);
							const first = SKILLS.find((s) => s.branch === b.id);
							if (first) setPicked(first.id);
						},
						className: `rounded-sm border px-3 py-1 font-display text-[0.65rem] tracking-widest ${branch === b.id ? "border-crimson bg-crimson/30 text-fg" : "border-border text-muted"}`,
						children: b.label
					}, b.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-3 pb-1 text-xs italic text-muted",
					children: BRANCHES.find((b) => b.id === branch)?.line
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid max-h-[58dvh] gap-3 overflow-y-auto p-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "overflow-hidden rounded-md border border-crimson/40 bg-bg/80",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: selected.art,
							alt: "",
							decoding: "async",
							className: "h-44 w-full object-cover object-top sm:h-56"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkillMark, {
										id: selected.id,
										branch: selected.branch,
										className: "size-7 text-crimson"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-display text-sm tracking-widest text-fg",
										children: selected.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-[0.6rem] uppercase tracking-widest text-subtle",
										children: [
											"T",
											selected.tier,
											" · ",
											skillStatLine(selected)
										]
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-relaxed text-muted",
									children: selected.desc
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									disabled: !!lockedSel || !haveSel && !canBuy,
									onClick: () => {
										if (haveSel && selected.active) window.__crimsonInput?.bindSkill?.(selected.id);
										else window.__crimsonInput?.buySkill?.(selected.id);
									},
									className: "mt-3 w-full rounded-md border border-crimson bg-crimson/20 px-3 py-2 font-display text-xs tracking-widest text-fg disabled:opacity-40",
									children: haveSel ? selected.active ? active === selected.id ? "Bound to Q" : "Bind to Q" : "Rooted" : lockedSel ? "A deeper Name is required" : selected.cost ? `Spend ${selected.cost} stone` : "Swear the oath"
								})
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-3",
						children: [
							1,
							2,
							3,
							4
						].map((tier) => {
							const row = list.filter((s) => s.tier === tier);
							if (!row.length) return null;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mb-1 font-display text-[0.6rem] tracking-[0.28em] text-subtle",
								children: ["TIER ", tier]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid grid-cols-3 gap-1.5",
								children: row.map((s) => {
									const have = owned.includes(s.id);
									const locked = !have && s.requires && !owned.includes(s.requires);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => {
											setPicked(s.id);
											if (have && s.active) window.__crimsonInput?.bindSkill?.(s.id);
										},
										className: `overflow-hidden rounded-md border text-left ${picked === s.id ? "border-ember ring-1 ring-ember" : have ? "border-crimson" : "border-border"} ${locked ? "opacity-40" : ""} ${active === s.id ? "bg-crimson/20" : "bg-bg/80"}`,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "relative",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
													src: s.art,
													alt: "",
													decoding: "async",
													className: "h-16 w-full object-cover"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkillMark, {
													id: s.id,
													branch: s.branch,
													className: "absolute right-1 top-1 size-5 text-ember drop-shadow"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "truncate px-1.5 pt-1 font-display text-[0.58rem] tracking-widest text-fg",
												children: s.name
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "px-1.5 pb-1.5 text-[0.5rem] uppercase tracking-widest text-subtle",
												children: [
													s.active ? "active" : "passive",
													" · ",
													s.cost ? `${s.cost}` : "oath"
												]
											})
										]
									}, s.id);
								})
							})] }, tier);
						})
					})]
				})
			]
		})
	});
}
function Briefing() {
	const startRun = useGame((s) => s.startRun);
	const setScreen = useGame((s) => s.setScreen);
	const profile = useGame((s) => s.profile);
	const [i, setI] = (0, import_react.useState)(0);
	const n = NAMES[i];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-30 overflow-y-auto",
		style: { background: "radial-gradient(ellipse at 50% 30%, #2a0505 0%, #0a0000 55%, #000 100%)" },
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex min-h-dvh max-w-3xl flex-col justify-center px-5 py-12",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-center font-display text-xs tracking-[0.4em] text-crimson",
					children: "THRESHOLD BRIEFING"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-3 text-center font-display text-3xl tracking-[0.08em] text-crimson md:text-4xl",
					children: "THE OPEN PALACE UNDER THE MILKY WAY"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-center font-mono text-xs tracking-widest text-subtle",
					children: [
						"CODE ",
						profile.padded,
						" · ",
						profile.glyphs,
						" · SOVEREIGN LV ",
						profile.bossLevel
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 space-y-4 text-[1.02rem] leading-relaxed text-fg/90",
					children: [BRIEFING_BEATS.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: b }, b.slice(0, 24))), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "italic text-muted",
						children: OPENING[2]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 flex items-center justify-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: n.portrait,
						alt: n.title,
						decoding: "async",
						className: "h-28 w-20 rounded-md border border-border object-cover"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-lg text-fg",
							children: n.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs tracking-[0.22em] text-crimson",
							children: n.epithet.toUpperCase()
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm italic text-muted",
							children: n.zone
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ghost, {
								aria: "Previous name",
								onClick: () => setI((v) => (v + 5) % 6),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-4" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ghost, {
								aria: "Next name",
								onClick: () => setI((v) => (v + 1) % 6),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4" })
							})]
						})
					] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 flex flex-col items-center gap-2 sm:flex-row sm:justify-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primary, {
						onClick: () => startRun(),
						children: "Deploy"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ghost, {
						onClick: () => setScreen("title"),
						children: "Return"
					})]
				})
			]
		})
	});
}
function Codex() {
	const setScreen = useGame((s) => s.setScreen);
	const startRun = useGame((s) => s.startRun);
	const to = useGame((s) => s.settingsTo);
	const profile = useGame((s) => s.profile);
	const fromRun = to === "paused" || to === "playing";
	const [tab, setTab] = (0, import_react.useState)("lore");
	const [branch, setBranch] = (0, import_react.useState)("strength");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-30 overflow-y-auto overscroll-y-contain",
		style: {
			background: "radial-gradient(ellipse at 50% 20%, #2a0505 0%, #0a0000 60%, #000 100%)",
			touchAction: "pan-y"
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-3xl px-5 py-10 md:px-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-xs tracking-[0.3em] text-crimson",
					children: "EXPANDED LORE CODEX"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-2 font-display text-3xl text-fg",
					children: "Codex of the Crimson Sovereign"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-sm leading-relaxed text-muted",
					children: [
						"Code ",
						profile.padded,
						" · ",
						profile.glyphs,
						" · 100 000 myth cycles. Words only ever touch the outer edges."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-5 flex gap-1",
					children: [
						["lore", "Names"],
						["arms", "Arms"],
						["skills", "Four Branches"]
					].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setTab(id),
						className: `rounded-sm border px-3 py-1.5 font-display text-[0.65rem] tracking-widest ${tab === id ? "border-crimson bg-crimson/25 text-fg" : "border-border text-muted"}`,
						children: label
					}, id))
				}),
				tab === "lore" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 flex gap-2 overflow-x-auto pb-2",
					children: NAMES.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: n.portrait,
						alt: n.title,
						title: n.title,
						decoding: "async",
						className: "h-24 w-16 shrink-0 rounded-sm border border-border object-cover"
					}, n.id))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-8 space-y-8",
					children: CODEX_SECTIONS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-xl text-crimson",
						children: s.heading
					}), s.body.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-[1.02rem] leading-relaxed text-fg/90",
						children: p
					}, p.slice(0, 32)))] }, s.heading))
				})] }) : null,
				tab === "arms" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-xs tracking-[0.3em] text-muted",
						children: "ARMS OF THE CYCLE"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 grid gap-3 sm:grid-cols-2",
						children: WEAPONS.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "rounded-md border border-border bg-raised p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: w.icon,
									alt: w.name,
									decoding: "async",
									className: "mb-3 h-28 w-full rounded-sm object-cover"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-fg",
									children: w.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-crimson",
									children: w.nameKey
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-muted",
									children: w.desc
								})
							]
						}, w.id))
					})]
				}) : null,
				tab === "skills" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: TREE_ART,
							alt: "Four branches of the Crimson Sovereign",
							decoding: "async",
							className: "mt-5 h-36 w-full rounded-md border border-crimson/40 object-cover object-center sm:h-48"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-sm leading-relaxed text-muted",
							children: "Thirty-five roots under four crowns. Strength plates the blood. Magic rewrites the magazine. Attack writes a Name on the target. Minerals beat life-metal on the sky anvil. Spend Sovereign Stones. Bind an active to Q."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 flex flex-wrap gap-1",
							children: BRANCHES.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setBranch(b.id),
								className: `rounded-sm border px-3 py-1 font-display text-[0.65rem] tracking-widest ${branch === b.id ? "border-crimson bg-crimson/30 text-fg" : "border-border text-muted"}`,
								children: b.label
							}, b.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs italic text-muted",
							children: BRANCHES.find((b) => b.id === branch)?.line
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-4 grid gap-3 sm:grid-cols-2",
							children: SKILLS.filter((s) => s.branch === branch).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "overflow-hidden rounded-md border border-border bg-raised",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: s.art,
									alt: s.name,
									decoding: "async",
									className: "h-32 w-full object-cover object-top"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkillMark, {
											id: s.id,
											branch: s.branch,
											className: "size-6 shrink-0 text-crimson"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-display text-sm text-fg",
											children: s.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-[0.6rem] uppercase tracking-widest text-subtle",
											children: [
												"T",
												s.tier,
												" · ",
												skillStatLine(s)
											]
										})] })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-sm leading-snug text-muted",
										children: s.desc
									})]
								})]
							}, s.id))
						})
					]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 flex flex-col gap-2 sm:flex-row",
					children: [fromRun ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primary, {
						onClick: () => startRun(),
						children: "Deploy"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ghost, {
						onClick: () => setScreen(fromRun ? "paused" : to === "title" ? "title" : "title"),
						children: fromRun ? "Resume" : "Close Codex"
					})]
				})
			]
		})
	});
}
function Settings() {
	const settings = useGame((s) => s.settings);
	const patch = useGame((s) => s.patchSettings);
	const to = useGame((s) => s.settingsTo);
	const setScreen = useGame((s) => s.setScreen);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-40 grid place-items-center bg-bg/90 p-5",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md rounded-lg border border-border bg-surface p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl text-fg",
					children: "Settings"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "mt-6 block text-xs tracking-[0.2em] text-muted",
					children: "LOOK SENSITIVITY"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "range",
					min: 8e-4,
					max: .005,
					step: 1e-4,
					value: settings.sensitivity,
					onChange: (e) => patch({ sensitivity: Number(e.target.value) }),
					className: "mt-2 w-full accent-crimson"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-5 flex items-center justify-between text-sm text-fg",
					children: ["Invert Y", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked: settings.invertY,
						onChange: (e) => patch({ invertY: e.target.checked })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-3 flex items-center justify-between text-sm text-fg",
					children: ["Screen shake", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked: settings.shake,
						onChange: (e) => patch({ shake: e.target.checked })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-3 flex items-center justify-between text-sm text-fg",
					children: ["Immortal (beta)", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked: settings.immortal,
						onChange: (e) => patch({ immortal: e.target.checked })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-3 flex items-center justify-between text-sm text-fg",
					children: ["Gyro fine aim", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked: settings.gyro,
						onChange: (e) => {
							patch({ gyro: e.target.checked });
							window.__crimsonInput?.gyro?.(e.target.checked);
						}
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6 font-display text-xs tracking-[0.2em] text-muted",
					children: "CAMERA"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 flex gap-2",
					children: [
						["fps", "Eye"],
						["tps", "Shoulder"],
						["spec", "Spectate"]
					].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => patch({ cam: id }),
						className: `flex-1 rounded-md border px-2 py-2 font-display text-xs tracking-widest ${settings.cam === id ? "border-crimson bg-crimson/20 text-fg" : "border-border bg-raised text-muted"}`,
						children: label
					}, id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-subtle",
					children: "V cycles first eye · over shoulder · spectator"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6 font-display text-xs tracking-[0.2em] text-muted",
					children: "RESOLUTION"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 flex gap-2",
					children: [
						360,
						720,
						1080
					].map((q) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => patch({ quality: q }),
						className: `flex-1 rounded-md border px-2 py-2 font-display text-xs tracking-widest ${settings.quality === q ? "border-crimson bg-crimson/20 text-fg" : "border-border bg-raised text-muted"}`,
						children: [q, "p"]
					}, q))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-subtle",
					children: "360p performance · 720p balanced · 1080p the palace as painted"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PadStatus, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "mt-5 block text-xs tracking-[0.2em] text-muted",
					children: "VOLUME"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => patch({ muted: !settings.muted }),
						"aria-label": "Mute",
						children: settings.muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "range",
						min: 0,
						max: 1,
						step: .01,
						value: settings.volume,
						onChange: (e) => patch({
							volume: Number(e.target.value),
							muted: false
						}),
						className: "w-full accent-crimson"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6 font-display text-xs tracking-[0.2em] text-muted",
					children: "CORE INPUT"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 max-h-44 space-y-1 overflow-y-auto text-xs text-subtle",
					children: CONTROL_LEGEND.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-fg/80",
							children: row.action
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-right font-mono",
							children: [
								row.kbm,
								" · ",
								row.pad
							]
						})]
					}, row.action))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-8",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primary, {
						onClick: () => setScreen(to),
						children: "Done"
					})
				})
			]
		})
	});
}
function PadStatus() {
	const [info, setInfo] = (0, import_react.useState)(() => window.__crimsonInput?.status?.());
	const [msg, setMsg] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		const t = window.setInterval(() => setInfo(window.__crimsonInput?.status?.()), 500);
		return () => window.clearInterval(t);
	}, []);
	const hid = typeof navigator !== "undefined" && "hid" in navigator;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4 rounded-md border border-border bg-raised p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-xs tracking-[0.2em] text-muted",
				children: "DUALSENSE"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-subtle",
				children: info?.connected ? `${info.dualsense ? "DualSense" : "Gamepad"} · ${info.path === "hid" ? "adaptive R2" : info.path === "rumble" ? "impulse R2" : "mapped"}` : "Wake a pad — DualSense R2 hardens as Ankh charges."
			}),
			hid ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "mt-2 rounded-md border border-border bg-surface px-3 py-2 font-display text-xs tracking-widest text-fg",
				onClick: () => {
					window.__crimsonInput?.pairDualSense?.().then((ok) => {
						setMsg(ok ? "Adaptive triggers paired." : "Pair cancelled.");
						setInfo(window.__crimsonInput?.status?.());
					});
				},
				children: "Pair DualSense"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs text-subtle",
				children: "Adaptive HID needs Chrome. Impulse rumble still works."
			}),
			msg ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-crimson",
				children: msg
			}) : null
		]
	});
}
function PauseMenu() {
	const setScreen = useGame((s) => s.setScreen);
	const openSettings = useGame((s) => s.openSettings);
	const openCodex = useGame((s) => s.openCodex);
	const hud = useGame((s) => s.hud);
	const profile = useGame((s) => s.profile);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-30 grid place-items-center bg-bg/70 p-5",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-sm rounded-lg border border-border bg-surface p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-display text-xs tracking-[0.3em] text-crimson",
					children: ["PAUSED · CODE ", profile.padded]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-1 font-display text-2xl text-fg",
					children: "The palace waits"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-sm text-muted",
					children: [
						"Names ",
						hud.runes.length,
						"/6 · ",
						profile.glyphs
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-col gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primary, {
							onClick: () => setScreen("playing"),
							children: "Resume"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ghost, {
							onClick: () => openCodex("paused"),
							children: "Codex"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ghost, {
							onClick: () => {
								setScreen("playing");
								window.__crimsonInput?.tree?.();
							},
							children: "Skill tree · K"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ghost, {
							onClick: () => openSettings("paused"),
							children: "Settings"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ghost, {
							onClick: () => setScreen("title"),
							children: "Quit to title"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-5 text-xs leading-relaxed text-subtle",
					children: PAD_BLURB
				})
			]
		})
	});
}
function End({ kind }) {
	const startRun = useGame((s) => s.startRun);
	const setScreen = useGame((s) => s.setScreen);
	const hud = useGame((s) => s.hud);
	const profile = useGame((s) => s.profile);
	const win = kind === "victory";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-30 grid place-items-center bg-bg/80 p-5",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md rounded-lg border border-border bg-surface p-6 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-xs tracking-[0.3em] text-crimson",
					children: win ? "CYCLE COMPLETE" : "UNWRITTEN"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-2 font-display text-3xl text-fg",
					children: win ? "The Key is turned" : "The runes close"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm leading-relaxed text-muted",
					children: win ? "The Offering is accepted under the turning arms of the galaxy. Walk the grounds again, or leave while the door still remembers your name." : "A Type VII will does not forgive trespass. Deploy again. The Names still wait."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-4 text-xs tabular-nums text-subtle",
					children: [
						"Code ",
						profile.padded,
						" · Names ",
						hud.runes.length,
						"/6 · Kills ",
						hud.kills
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-col gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primary, {
							onClick: () => {
								if (win) window.__crimsonRemain?.();
								setScreen(win ? "playing" : "title");
								if (!win) startRun();
							},
							children: win ? "Remain on the grounds" : "Deploy again"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ghost, {
							onClick: () => win ? startRun() : setScreen("title"),
							children: win ? "Walk the palace again" : "Return to threshold"
						}),
						win ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ghost, {
							onClick: () => setScreen("title"),
							children: "Leave through the rift"
						}) : null
					]
				})
			]
		})
	});
}
function Gate({ onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: "border border-crimson bg-transparent px-8 py-3.5 font-display text-[1rem] tracking-[0.18em] text-fg transition-all duration-[var(--motion-medium)] hover:bg-crimson hover:text-bg hover:shadow-[0_0_40px_#ff0033]",
		children
	});
}
function Primary({ onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: "rounded-md bg-fg px-5 py-3 font-display text-sm tracking-[0.12em] text-bg transition-transform duration-[var(--motion-quick)] hover:opacity-90 active:scale-[0.98]",
		children
	});
}
function Ghost({ onClick, children, aria }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": aria,
		onClick,
		className: "inline-flex items-center justify-center gap-2 rounded-md border border-border bg-raised px-5 py-3 font-display text-sm tracking-[0.12em] text-fg transition-opacity duration-[var(--motion-quick)] hover:bg-surface",
		children
	});
}
var routes_exports = /* @__PURE__ */ __exportAll({ component: () => Home });
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GameApp, {});
}
//#endregion
export { STICK_SPRINT as C, radialDeadzone as D, emptyActions as E, PAD as S, anyCode as T, colourShift as _, GATE_MOMENT as a, INTERACT_GLYPH as b, CHARACTERS as c, buildProfile as d, mulberry32 as f, NAME_COLOR as g, C as h, useGame as i, VIEW as l, streamSeed as m, modsFrom as n, NAMES as o, padCode as p, skillById as r, nameById as s, routes_exports as t, WEAPONS as u, ARM_FROM_DPAD as v, KEY as x, DEADZONE as y };
