// @ts-nocheck
import * as THREE from "three";
import { Input } from "./input";
import { GameAudio } from "./audio";
import { World, circleHitsAABB } from "./world";
import { SpatialHash, sweepSphereAABB, ENGINE as ENGINE_VER } from "./phys";
import { GATE_MOMENT, NAMES, WEAPONS, VIEW, CHARACTERS, nameById } from "./story";
import { buildProfile, padCode, mulberry32, streamSeed } from "./codes";
import { useGame } from "./store";
import { buildHunter, poseHunter, buildEnemyFigure } from "./hunter";
import { OpenWorldMomentSystem } from "./world-moments";
import { modsFrom, skillById } from "./skills";
import { MAP_LANDMARKS } from "./map-art";
import { C, colourShift, mixHex } from "./palette";
import { createCrystalMaterial, tickCrystal, setCrystalQuality, crystalBlade, crystalMetal, disposeCrystal, procCrystalCanvas } from "./crystal";
import { THRESHOLD_NPCS, FIGURE_LINES } from "./figures";
import { RecoilSim } from "./recoil";

const EYE = 1.58;
const RADIUS = .38;
const HEIGHT = 1.72;
const WEAPON_LAYER = 1;
function warmPixel() {
	const c = document.createElement("canvas");
	c.width = c.height = 1;
	const g = c.getContext("2d");
	g.fillStyle = "#1a080c";
	g.fillRect(0, 0, 1, 1);
	return c;
}
function loadTexture(loader, url, repeat = 1) {
	const kind = url.includes("wall") ? "wall" : url.includes("column") ? "column" : url.includes("energy") ? "ember" : "floor";
	const t = new THREE.CanvasTexture(procCrystalCanvas(kind));
	t.colorSpace = THREE.SRGBColorSpace;
	t.wrapS = t.wrapT = THREE.RepeatWrapping;
	t.repeat.set(repeat, repeat);
	t.anisotropy = 8;
	t.generateMipmaps = true;
	t.minFilter = THREE.LinearMipmapLinearFilter;
	t.magFilter = THREE.LinearFilter;
	loader.load(url, (loaded) => {
		if (!loaded?.image) return;
		t.image = loaded.image;
		t.needsUpdate = true;
		loaded.dispose();
	});
	return t;
}
export class CrimsonGame {
	canvas;
	renderer;
	scene = new THREE.Scene();
	camera;
	weaponCam;
	yawObj = new THREE.Object3D();
	input = new Input();
	audio = new GameAudio();
	world;
	profile;
	timer = new THREE.Timer();
	acc = 0;
	running = true;
	disposed = false;
	_cleaned = false;
	_probe = null;
	paused = false;
	simReady = false;
	_booted = false;
	hash = new SpatialHash(8);
	recoilSim = new RecoilSim();
	jumpWasHeld = false;
	engine = ENGINE_VER;
	yaw = 0;
	pitch = 0;
	px = 0;
	py = 0;
	pz = 48;
	vx = 0;
	vy = 0;
	vz = 0;
	grounded = true;
	coyote = 0;
	jumpBuf = 0;
	freeze = 0;
	health = 100;
	weapon = 0;
	mag = WEAPONS.map((w) => w.mag);
	reserve = WEAPONS.map((w) => w.reserve);
	lastShot = WEAPONS.map(() => 0);
	reloadT = 0;
	charge = 0;
	runes = /* @__PURE__ */ new Set();
	kills = 0;
	time = 0;
	bob = 0;
	trauma = 0;
	hitmarker = 0;
	dmgFlash = 0;
	msg = "";
	msgT = 0;
	stepT = 0;
	viewmodel = new THREE.Group();
	weapons = [];
	muzzle;
	muzzleT = 0;
	swayX = 0;
	swayY = 0;
	_vmRest = { x: .3, y: -.28, z: -.58 };
	enemies = [];
	nextId = 1;
	projectiles = [];
	projPool = [];
	particles = [];
	partPool = [];
	partGeo = new THREE.SphereGeometry(1, 6, 6);
	partMat = new THREE.MeshBasicMaterial({
		color: 16724821,
		transparent: true,
		opacity: 1
	});
	ray = new THREE.Raycaster();
	ndc = new THREE.Vector2(0, 0);
	_f = new THREE.Vector3();
	_r = new THREE.Vector3();
	_up = new THREE.Vector3(0, 1, 0);
	_q = new THREE.Quaternion();
	_origin = new THREE.Vector3();
	_dir = new THREE.Vector3();
	hudAcc = 0;
	boss = null;
	ended = false;
	mats = {};
	textures = [];
	locked = false;
	fill;
	lance;
	lanceMat;
	lanceT = 0;
	chargeGlow;
	moments = [];
	momentT = 0;
	currentMoment = null;
	npcs = [];
	npcLine = 0;
	constructor(canvas) {
		this.canvas = canvas;
		this.renderer = new THREE.WebGLRenderer({
			canvas,
			antialias: true,
			alpha: false,
			powerPreference: "high-performance",
			preserveDrawingBuffer: true,
			failIfMajorPerformanceCaveat: false,
		});
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.matchMedia("(pointer: coarse)").matches ? 1.25 : 2));
		this.renderer.setSize(canvas.clientWidth || window.innerWidth, canvas.clientHeight || window.innerHeight, false);
		this.renderer.outputColorSpace = THREE.SRGBColorSpace;
		this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
		this.renderer.toneMappingExposure = 1.35;
		this.renderer.autoClear = false;
		this.renderer.info.autoReset = false;
		this.renderer.setClearColor(0x1a080c, 1);
		this.renderer.debug.checkShaderErrors = true;
		this.renderer.debug.onShaderError = (gl, program, vs, fs) => {
			const vlog = gl.getShaderInfoLog(vs) || "";
			const flog = gl.getShaderInfoLog(fs) || "";
			const plog = gl.getProgramInfoLog(program) || "";
			this.lastErr = `${vlog} ${flog} ${plog}`.trim().slice(0, 280);
			console.warn("[crimson shader]", this.lastErr);
		};
		this.camera = new THREE.PerspectiveCamera(78, 1, .08, 900);
		this.weaponCam = new THREE.PerspectiveCamera(68, 1, .04, 4);
		this.weaponCam.layers.set(WEAPON_LAYER);
		this.camera.layers.enable(0);
		this.yawObj.add(this.camera);
		this.scene.add(this.yawObj);
		this.muzzle = new THREE.PointLight(16737860, 0, 6, 2);
		this.muzzle.layers.enable(0);
		this.muzzle.layers.enable(WEAPON_LAYER);
		this.camera.add(this.muzzle);
		this.fill = new THREE.PointLight(16763060, .55, 3, 2);
		this.fill.position.set(.1, .1, .2);
		this.fill.layers.enable(0);
		this.fill.layers.enable(WEAPON_LAYER);
		this.camera.add(this.fill);
		this.chargeGlow = new THREE.PointLight(16729190, 0, 8, 2);
		this.chargeGlow.position.set(.2, -.1, -.6);
		this.chargeGlow.layers.enable(0);
		this.chargeGlow.layers.enable(WEAPON_LAYER);
		this.camera.add(this.chargeGlow);
		this.viewmodel.layers.set(WEAPON_LAYER);
		this.camera.add(this.viewmodel);
		this.lanceMat = new THREE.MeshBasicMaterial({
			color: 16733559,
			transparent: true,
			opacity: 0,
			blending: THREE.AdditiveBlending,
			depthWrite: false
		});
		const lanceGeo = new THREE.CylinderGeometry(.05, .16, 1, 8);
		this.lance = new THREE.Mesh(lanceGeo, this.lanceMat);
		this.lance.visible = false;
		this.scene.add(this.lance);
		this.resize();
	}
	async start() {
		if (this.disposed) return;
		this.profile = buildProfile(useGame.getState().seed);
		this.input.attach(this.canvas);
		this.audio.unlock();
		const st = useGame.getState().settings;
		this.audio.setVolume(st.volume);
		this.audio.setMuted(st.muted);
		this.audio.setDrone(this.profile.droneHz);
		this._unlockAudio = () => this.audio.unlock();
		window.addEventListener("pointerdown", this._unlockAudio);
		window.addEventListener("keydown", this._unlockAudio);
		window.addEventListener("touchend", this._unlockAudio);
		this.bootVisual();
		this.resize();
		this.render();
		this.timer.reset();
		this.timer.update();
		this.renderer.setAnimationLoop(() => this.frame());
		this.exposeControls();
		window.__crimsonInput = {
			fire: (v) => this.input.ui.fire(v),
			ads: (v) => this.input.ui.ads(v),
			jump: () => this.input.ui.jump(),
			reload: () => this.input.ui.reload(),
			nextWeapon: () => this.input.ui.cycle(1),
			prevWeapon: () => this.input.ui.cycle(-1),
			sprint: (v) => this.input.ui.sprint(v),
			interact: () => this.input.ui.interact(),
			pause: () => this.input.ui.pause(),
			arm: (slot) => this.input.ui.arm(slot),
			camera: () => this.cycleCam(),
			bag: () => this.input.ui.bag(),
			map: () => this.input.ui.map(),
			skill: () => this.input.ui.skill(),
			tree: () => this.input.ui.tree(),
			move: (x, y) => this.input.ui.move?.(x, y),
			buySkill: (id) => this.buySkill(id),
			bindSkill: (id) => this.bindSkill(id),
			gyro: (v) => {
				this.input.setGyroAllowed?.(v);
				if (v) this.input.enableGyro?.();
			},
			pairDualSense: () => this.input.pairDualSense?.(),
			status: () => this.input.status?.(),
		};
		await new Promise((r) => requestAnimationFrame(() => r(null)));
		if (this.disposed) return;
		try {
			this.loadWorld();
		} catch (err) {
			console.warn("loadWorld", err);
			this.lastErr = String(err?.message || err);
		}
		if (this.disposed) return;
		this.setQuality(st.quality);
		this.buildWeapons();
		this.spawnEnemies();
		this.bindLock();
		this.onResize = () => this.resize();
		window.addEventListener("resize", this.onResize);
		document.addEventListener("visibilitychange", this.onVis);
		this.owm = new OpenWorldMomentSystem(this.profile.code, {
			announce: (m) => {
				this.msg = `${m.name} — ${m.description}`;
				this.msgT = 4.4;
				this.audio.thunder();
			},
			spawn: (kind, x, z) => this.makeEnemy(kind, x, 0, z, false),
			gift: (kind, x, z) => this.world.gift(kind, x, z),
			heal: (n) => { this.health = Math.min(this.maxHealth || 100, this.health + n); },
			stagger: () => { this.staggerT = 1.15; this.trauma = 1; },
			chargeAnkh: (n) => { this.charge = Math.max(this.charge, n); },
			gateBite: () => { this.trauma = 0.6; },
			shove: () => { this.vx += (Math.random() - 0.5) * 8; this.vz += (Math.random() - 0.5) * 8; this.trauma = 0.8; },
			pos: () => ({ x: this.px, z: this.pz }),
		});
		if (this.disposed) {
			this.renderer.setAnimationLoop(null);
			return;
		}
		this.simReady = true;
		this.tell("You stand on the Threshold under the arms of the galaxy. The runes are watching. Claim the Six Names.");
		this.pushHud();
	}
	bootVisual() {
		if (this._booted) return;
		this._booted = true;
		this.scene.background = new THREE.Color(0x14080c);
		this.scene.fog = new THREE.Fog(0x14080c, 70, 340);
		const hemi = new THREE.HemisphereLight(0xffc8b0, 0x2a0810, 1.15);
		const dir = new THREE.DirectionalLight(0xffd0a8, 1.45);
		dir.position.set(-18, 90, 36);
		const fill = new THREE.PointLight(0xff2244, 4.8, 120, 1.4);
		fill.position.set(0, 16, 28);
		const moonLight = new THREE.PointLight(0xff3355, 6.5, 180, 1.2);
		moonLight.position.set(-48, 58, -70);
		hemi.layers.enable(0);
		hemi.layers.enable(WEAPON_LAYER);
		dir.layers.enable(0);
		dir.layers.enable(WEAPON_LAYER);
		this.scene.add(hemi, dir, fill, moonLight);
		const skyMat = new THREE.MeshBasicMaterial({
			color: 0x4a1822,
			side: THREE.BackSide,
			depthWrite: false,
			fog: false,
			toneMapped: false,
		});
		const sky = new THREE.Mesh(new THREE.SphereGeometry(620, 24, 16), skyMat);
		sky.renderOrder = -10;
		sky.name = "boot-sky";
		this.scene.add(sky);
		this.bootSkyMat = skyMat;
		const failsafe = new THREE.Mesh(
			new THREE.PlaneGeometry(280, 280),
			new THREE.MeshBasicMaterial({ color: 0x4a2018, toneMapped: false, fog: true }),
		);
		failsafe.rotation.x = -Math.PI / 2;
		failsafe.position.y = -0.04;
		failsafe.name = "boot-floor";
		this.scene.add(failsafe);
		this.px = 0;
		this.py = 0.35;
		this.pz = 68;
		this.yaw = 0;
		this.pitch = -0.08;
		this.yawObj.rotation.y = 0;
		this.camera.rotation.set(-0.08, 0, 0);
		this.yawObj.position.set(0, EYE, 68);
	}
	onResize = () => {};
	onVis = () => {
		this.audio.resume();
		if (document.hidden) this.input.keys.clear();
	};
	loadWorld() {
		const loader = new THREE.TextureLoader();
		loader.setCrossOrigin("anonymous");
		const floorT = loadTexture(loader, "/textures/floor.jpg", 28);
		const wallT = loadTexture(loader, "/textures/wall.jpg", 3);
		const colT = loadTexture(loader, "/textures/column.jpg", 2);
		const energyT = loadTexture(loader, "/textures/energy.jpg", 2);
		const waterT = loadTexture(loader, "/textures/water.jpg", 18);
		this.textures.push(floorT, wallT, colT, energyT, waterT);
		this.mats.floor = createCrystalMaterial({
			kind: "floor",
			map: floorT,
			color: 0xc8b4b0,
			glow: 1.55,
			scale: 3.1,
		});
		this.mats.wall = createCrystalMaterial({
			kind: "wall",
			map: wallT,
			color: 0xb8a8a4,
			glow: 1.35,
			scale: 4.2,
		});
		this.mats.column = createCrystalMaterial({
			kind: "column",
			map: colT,
			color: 0xc4b0aa,
			glow: 1.7,
			scale: 5.0,
		});
		this.mats.energy = new THREE.MeshBasicMaterial({
			map: energyT,
			color: 0xff2244,
			transparent: true,
			opacity: .95,
			blending: THREE.AdditiveBlending,
			depthWrite: false,
			toneMapped: false,
		});
		this.mats.water = new THREE.MeshStandardMaterial({
			map: waterT,
			color: C.blood,
			roughness: 0.28,
			metalness: 0.45,
			emissive: C.blood,
			emissiveIntensity: 0.55,
			transparent: true,
			opacity: 0.92,
		});
		this.mats.ember = createCrystalMaterial({
			kind: "ember",
			color: C.ember,
			crack: colourShift(C.ember, this.profile.code, 0.04),
			glow: 2.4 + this.profile.glow * .35,
			scale: 6.2,
		});
		this.mats.body = createCrystalMaterial({
			kind: "armor",
			color: C.void,
			glow: 1.6,
			scale: 7.4,
		});
		const card = (url, fog = true) => {
			const t = new THREE.CanvasTexture(procCrystalCanvas("wall"));
			t.colorSpace = THREE.SRGBColorSpace;
			t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
			t.anisotropy = 8;
			this.textures.push(t);
			loader.load(url, (loaded) => {
				if (!loaded?.image) return;
				t.image = loaded.image;
				t.needsUpdate = true;
				loaded.dispose();
			});
			return new THREE.MeshBasicMaterial({ map: t, fog, side: THREE.DoubleSide, toneMapped: false, color: 0xffffff });
		};
		this.mats.cardStairs = card("/lore/palace-stairs.jpg", false);
		this.mats.cardVaelith = card("/lore/vaelith-field.jpg", false);
		this.mats.cardRynara = card("/lore/rynara-basin.jpg", false);
		this.mats.cardSanguara = card("/lore/sanguara-pool.jpg", false);
		this.mats.cardNyxara = card("/lore/nyxara-isles.jpg", false);
		this.mats.cardThrone = card("/lore/throne-hall.jpg");
		this.mats.cardApproach = card("/lore/palace-approach.jpg", false);
		this.mats.portraitSentinel = card("/lore/sentinel.jpg");
		this.mats.portraitShade = card("/lore/shade.jpg");
		this.mats.portraitConstruct = card("/lore/construct.jpg");
		this.mats.portraitHood = card("/lore/hunter-hood.jpg");
		this.mats.portraitVaelith = card("/lore/vaelith.jpg");
		this.mats.portraitRynara = card("/lore/rynara.jpg");
		this.mats.portraitSanguara = card("/lore/sanguara.jpg");
		this.mats.portraitNyxara = card("/lore/nyxara.jpg");
		this.mats.portraitEryndra = card("/lore/eryndra.jpg");
		this.mats.portraitAelith = card("/lore/aelith.jpg");
		this.mats.portraitBoss = card("/lore/aelith-boss.jpg");
		this.mats.portraitKnight = card("/lore/knight.jpg");
		this.mats.portraitTitan = card("/lore/construct-titan.jpg");
		this.mats.portraitAnkh = card("/lore/aelith-ankh.jpg");
		this.mats.portraitNyxStand = card("/lore/nyxara-stand.jpg");
		this.mats.portraitOrigin = card("/lore/aelith-origin.png");
		this.mats.portraitWarden = card("/lore/char-warden.jpg");
		this.mats.portraitReaver = card("/lore/char-reaver.jpg");
		this.mats.portraitGunner = card("/lore/char-gunner.jpg");
		this.mats.portraitWeaver = card("/lore/char-weaver.jpg");
		loader.load("/textures/sky.jpg", (tex) => {
			if (!tex?.image) return;
			tex.colorSpace = THREE.SRGBColorSpace;
			tex.mapping = THREE.EquirectangularReflectionMapping;
			if (this.bootSkyMat) {
				this.bootSkyMat.map = tex;
				this.bootSkyMat.color.set(0xffffff);
				this.bootSkyMat.needsUpdate = true;
			}
			this.textures.push(tex);
			try {
				const pmrem = new THREE.PMREMGenerator(this.renderer);
				this.scene.environment = pmrem.fromEquirectangular(tex).texture;
			} catch {
				this.scene.environment = tex;
			}
		});
		try {
			const pmrem = new THREE.PMREMGenerator(this.renderer);
			const envScene = new THREE.Scene();
			envScene.background = new THREE.Color(0x3a1018);
			this.scene.environment = pmrem.fromScene(envScene, 0.04).texture;
		} catch {
			/* env is optional */
		}
		this.world = new World(this.mats, this.profile);
		this.world.build();
		this.world.setGateOpen(false);
		this.scene.add(this.world.group);
		this.rebuildHash();
		this.px = 0;
		this.py = 0.35;
		this.pz = 68;
		this.yaw = 0;
		this.pitch = -0.08;
		this.yawObj.rotation.y = 0;
		this.camera.rotation.set(-0.08, 0, 0);
		this.yawObj.position.set(0, EYE, 68);
		this.owned = new Set(["ember-fortitude"]);
		this.skillPts = 2;
		this.activeSkill = "ember-fortitude";
		this.treeOpen = false;
		this.bagOpen = false;
		this.atlasOpen = false;
		this.fortitudeT = 0;
		this.coilT = 0;
		this.skillCd = 0;
		this.skillCastT = 0;
		this.skillCast = null;
		this.grace = 0.45;
		this.maxHealth = 100;
		this.staggerT = 0;
		this.nearPrompt = "";
		this.nearKey = "F";
		const ch = CHARACTERS.find((c) => c.id === useGame.getState().settings.character) || CHARACTERS[0];
		const faceT = loader.load(ch.portrait);
		faceT.colorSpace = THREE.SRGBColorSpace;
		const dressT = loader.load("/lore/hunter-body.jpg");
		dressT.colorSpace = THREE.SRGBColorSpace;
		this.textures.push(faceT, dressT);
		this.hunter = buildHunter(faceT, dressT, this.profile.ember);
		this.hunter.root.visible = false;
		this.scene.add(this.hunter.root);
		this.charId = ch.id;
		this.spawnNpcs();
		this.applyCloudSave();
		this.yawObj.position.set(this.px, this.py + EYE, this.pz);
		this.render();
	}
	rebuildHash() {
		if (this.world) this.hash.rebuild(this.world.colliders);
	}
	nearBoxes(x, z, r) {
		if (this.hash.all.length) return this.hash.query(x, z, r);
		return this.world?.colliders || [];
	}
	buildWeapons() {
		const mk = (fn) => {
			const g = new THREE.Group();
			fn(g);
			g.traverse((o) => o.layers.set(WEAPON_LAYER));
			g.visible = false;
			this.viewmodel.add(g);
			this.weapons.push(g);
		};
		const dark = crystalMetal({ ember: 0x220008, glow: 0.9 });
		const glow = crystalBlade(this.profile.ember);
		const brass = new THREE.MeshStandardMaterial({
			color: 11569738,
			metalness: .85,
			roughness: .28,
			emissive: 3809800,
			emissiveIntensity: .25
		});
		mk((g) => {
			g.add(mesh(new THREE.BoxGeometry(.08, .12, .42), dark, 0, -.02, 0));
			const bar = new THREE.CylinderGeometry(.03, .035, .55, 8);
			bar.rotateX(Math.PI / 2);
			g.add(mesh(bar, dark, 0, .02, -.38));
			g.add(mesh(new THREE.BoxGeometry(.06, .14, .08), dark, .02, -.12, .06));
			g.add(mesh(new THREE.BoxGeometry(.04, .04, .08), glow, 0, .04, -.62));
		});
		mk((g) => {
			const staff = new THREE.CylinderGeometry(.025, .03, .7, 8);
			staff.rotateX(Math.PI / 2);
			g.add(mesh(staff, dark, .02, -.04, -.2));
			g.add(mesh(new THREE.OctahedronGeometry(.09, 0), glow, .02, .02, -.58));
			g.add(mesh(new THREE.TorusGeometry(.13, .015, 6, 16), brass, .02, .02, -.58));
		});
		mk((g) => {
			g.add(mesh(new THREE.BoxGeometry(.14, .14, .32), dark, 0, -.02, -.1));
			const b1 = new THREE.CylinderGeometry(.02, .022, .28, 6);
			b1.rotateX(Math.PI / 2);
			g.add(mesh(b1, dark, -.04, .02, -.32));
			g.add(mesh(b1.clone(), dark, .04, .02, -.32));
			g.add(mesh(new THREE.BoxGeometry(.1, .16, .08), glow, 0, -.08, .02));
		});
		mk((g) => {
			g.add(mesh(new THREE.BoxGeometry(.06, .22, .06), brass, 0, 0, -.2));
			g.add(mesh(new THREE.TorusGeometry(.1, .018, 8, 16), brass, 0, .16, -.2));
			g.add(mesh(new THREE.BoxGeometry(.18, .05, .05), brass, 0, -.02, -.2));
			const beam = new THREE.CylinderGeometry(.02, .035, .4, 8);
			beam.rotateX(Math.PI / 2);
			g.add(mesh(beam, glow, 0, .04, -.48));
		});
		this.weapons[0].visible = true;
		this.viewmodel.position.set(.3, -.28, -.58);
		const extra = (fn) => {
			const g = new THREE.Group();
			fn(g);
			g.traverse((o) => o.layers.set(WEAPON_LAYER));
			g.visible = false;
			this.viewmodel.add(g);
			this.weapons.push(g);
		};
		extra((g) => {
			const barrel = new THREE.CylinderGeometry(0.018, 0.022, 0.95, 8);
			barrel.rotateX(Math.PI / 2);
			g.add(mesh(barrel, dark, 0.02, 0.02, -0.52));
			g.add(mesh(new THREE.BoxGeometry(0.07, 0.11, 0.28), dark, 0.02, -0.04, 0.04));
		});
		extra((g) => {
			g.add(mesh(new THREE.BoxGeometry(0.12, 0.1, 0.36), dark, 0, -0.02, -0.08));
			const r1 = new THREE.CylinderGeometry(0.012, 0.012, 0.62, 6);
			r1.rotateX(Math.PI / 2);
			g.add(mesh(r1, glow, -0.035, 0.03, -0.42));
			g.add(mesh(r1.clone(), glow, 0.035, 0.03, -0.42));
		});
		extra((g) => {
			g.add(mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.72, 8), dark, 0.12, -0.08, -0.22));
			g.add(mesh(new THREE.BoxGeometry(0.42, 0.08, 0.04), glow, 0.12, 0.22, -0.22));
		});
		extra((g) => {
			g.add(mesh(new THREE.BoxGeometry(0.04, 0.08, 0.62), glow, 0.14, -0.02, -0.28));
			g.add(mesh(new THREE.BoxGeometry(0.05, 0.12, 0.1), dark, 0.14, -0.06, 0.08));
		});
		extra((g) => {
			g.add(mesh(new THREE.CylinderGeometry(0.016, 0.02, 0.85, 8), dark, 0.1, -0.12, -0.18));
			g.add(mesh(new THREE.TorusGeometry(0.16, 0.02, 6, 14, Math.PI * 1.2), glow, 0.1, 0.28, -0.18));
		});
		extra((g) => {
			const shaft = new THREE.CylinderGeometry(0.016, 0.02, 0.95, 8);
			shaft.rotateX(Math.PI / 2);
			g.add(mesh(shaft, dark, 0.08, -0.04, -0.28));
			g.add(mesh(new THREE.ConeGeometry(0.05, 0.18, 8), glow, 0.08, -0.02, -0.78));
		});
		extra((g) => {
			g.add(mesh(new THREE.CylinderGeometry(0.02, 0.024, 0.7, 8), dark, 0.14, -0.1, -0.18));
			g.add(mesh(new THREE.BoxGeometry(0.22, 0.22, 0.14), glow, 0.14, 0.28, -0.18));
		});
		extra((g) => {
			g.add(mesh(new THREE.BoxGeometry(0.08, 0.08, 0.18), glow, 0.16, -0.08, -0.22));
			g.add(mesh(new THREE.BoxGeometry(0.08, 0.08, 0.18), glow, -0.08, -0.08, -0.18));
		});
	}
	spawnEnemies() {
		for (const s of this.world.spawns) if (s.kind === "construct" && !this.world.gateOpen) this.makeEnemy(s.kind, s.x, 0, s.z, true);
		else this.makeEnemy(s.kind, s.x, 0, s.z, false);
	}
	makeEnemy(kind, x, y, z, dormant) {
		const st = {
			wraith: { hp: 42, speed: 4.6, range: 2.1, cd: .85, dmg: 9, r: .45, h: 1.8 },
			sentinel: { hp: 70, speed: 2.4, range: 18, cd: 1.35, dmg: 12, r: .55, h: 1.9 },
			construct: { hp: 150, speed: 1.7, range: 2.6, cd: 1.2, dmg: 16, r: .7, h: 2.4 },
			shade: { hp: 48, speed: 5.4, range: 2, cd: .7, dmg: 11, r: .4, h: 1.6 },
			boss: { hp: 720, speed: 3.2, range: 22, cd: .9, dmg: 18, r: 1.1, h: 4.4 }
		}[kind];
		const hpMul = kind === "boss" ? 1 + (this.profile.enemyHpMul - 1) * .5 : this.profile.enemyHpMul;
		const root = new THREE.Group();
		root.position.set(x, y, z);
		const body = this.enemyMesh(kind);
		root.add(body);
		body.userData.kind = kind === "boss" ? "boss" : "enemy";
		body.userData.eid = this.nextId;
		this.scene.add(root);
		const e = {
			id: this.nextId++,
			kind,
			root,
			hp: Math.round(st.hp * hpMul),
			max: Math.round(st.hp * hpMul),
			speed: st.speed * this.profile.enemySpdMul,
			range: st.range,
			cooldown: st.cd,
			cd: Math.random() * st.cd,
			damage: st.dmg,
			radius: st.r,
			height: st.h,
			alive: !dormant,
			flash: 0,
			hit: body,
			homeX: x,
			homeZ: z,
			aware: false,
			state: "idle",
			stateT: Math.random() * 2,
			windup: 0,
			lastX: x,
			lastZ: z,
			chargeT: 0,
			strafe: Math.random() < 0.5 ? 1 : -1,
			level: Math.max(1, Math.round((this.profile.bossLevel || 1) * (kind === "boss" ? 1 : 0.08 + Math.random() * 0.12))),
		};
		root.traverse((o) => {
			o.userData.eid = e.id;
			o.userData.kind = e.kind === "boss" ? "boss" : "enemy";
		});
		if (dormant) root.visible = false;
		this.enemies.push(e);
		return e;
	}
	enemyMesh(kind) {
		const g = new THREE.Group();
		const faceMap = {
			wraith: this.mats.portraitHood || this.mats.portraitShade,
			sentinel: this.mats.portraitKnight || this.mats.portraitSentinel,
			construct: this.mats.portraitTitan || this.mats.portraitConstruct,
			shade: this.mats.portraitShade,
			boss: this.mats.portraitBoss || this.mats.portraitAelith,
		}[kind];
		const faceTex = faceMap && faceMap.map ? faceMap.map : null;
		const figure = buildEnemyFigure(kind, faceTex);
		g.add(figure.root);
		g.userData.rig = figure;
		const h = kind === "boss" ? 5.6 : kind === "construct" ? 3.4 : kind === "sentinel" ? 2.8 : 2.35;
		const hit = new THREE.Mesh(
			new THREE.CapsuleGeometry(kind === "boss" ? 0.7 : 0.38, h * 0.55, 4, 8),
			new THREE.MeshBasicMaterial({ visible: false }),
		);
		hit.position.y = h * 0.42;
		g.add(hit);
		const disc = new THREE.Mesh(
			new THREE.CircleGeometry(0.42, 12),
			new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.5, depthWrite: false }),
		);
		disc.rotation.x = -Math.PI / 2;
		disc.position.y = 0.03;
		g.add(disc);
		return g;
	}
	spawnBoss() {
		if (this.boss) return;
		this.boss = this.makeEnemy("boss", 0, 0, -8, false);
		this.queueMoment({
			title: NAMES[5].title,
			epithet: NAMES[5].epithet,
			verse: NAMES[5].verse.slice(0, 2),
			body: "Aelith the Crimson takes form. Unmake her — or be written into her runes."
		});
		this.audio.bossRoar();
		this.audio.explode();
		this.trauma = Math.min(1, this.trauma + .7);
	}
	bindLock() {
		const onChange = () => {
			this.locked = document.pointerLockElement === this.canvas;
		};
		document.addEventListener("pointerlockchange", onChange);
		this.canvas.addEventListener("click", () => {
			if (useGame.getState().screen !== "playing") return;
			if (this.overlayOpen()) return;
			this.audio.unlock();
			this.locked = true;
			if (this.input.isCoarse) return;
			const p = this.canvas.requestPointerLock({ unadjustedMovement: true });
			if (p && typeof p.catch === "function") p.catch(() => this.canvas.requestPointerLock());
		});
		this._lockOff = () => document.removeEventListener("pointerlockchange", onChange);
	}
	_lockOff = () => {};
	_unlockAudio = () => {};
	setPaused(p) {
		this.paused = p;
		if (!p) this.audio.unlock();
		if (p && document.pointerLockElement) document.exitPointerLock();
	}
	frame() {
		if (!this.running || this.disposed) return;
		this.timer.update();
		const dt = Math.min(this.timer.getDelta(), .08);
		if (useGame.getState().screen === "playing" && !this.paused && !this.ended) {
			if (this.input.hasActivity() || this.input.padConnected || this.input.firePressed) this.locked = true;
			if (this.simReady) {
				this.acc += dt;
				const step = 1 / 60;
				let guard = 0;
				while (this.acc >= step && guard++ < 6) {
					this.fixed(step);
					this.acc -= step;
				}
			}
			this.visual(dt);
		} else {
			this.acc = 0;
			this.input.poll();
			if (this.paused && this.input.pausePressed && useGame.getState().screen === "paused") {
				useGame.getState().setScreen("playing");
				this.setPaused(false);
			}
			this.visual(dt);
		}
		this.render();
		this.hudAcc += dt;
		if (this.hudAcc > .08) {
			this.hudAcc = 0;
			if (this.simReady) this.pushHud();
		}
		this.input.endFrame();
	}
	fixed(dt) {
		this.time += dt;
		this.input.poll();
		if (this.grace > 0) this.grace = Math.max(0, this.grace - dt);
		if (this.fortitudeT > 0) this.fortitudeT = Math.max(0, this.fortitudeT - dt);
		if (this.coilT > 0) this.coilT = Math.max(0, this.coilT - dt);
		if (this.skillCd > 0) this.skillCd = Math.max(0, this.skillCd - dt);
		if (this.skillCastT > 0) {
			this.skillCastT = Math.max(0, this.skillCastT - dt);
			if (this.skillCastT <= 0) this.skillCast = null;
		}
		if (this.staggerT > 0) this.staggerT = Math.max(0, this.staggerT - dt);
		if (this.owm) this.owm.update(dt);
		this.applyWorldMoments(dt);
		if (this.input.pausePressed && useGame.getState().screen === "playing" && (this.grace || 0) <= 0) {
			useGame.getState().setScreen("paused");
			this.setPaused(true);
		}
		if (this.input.bagPressed) this.toggleBag();
		if (this.input.mapPressed) this.toggleAtlas();
		if (this.input.treePressed) this.toggleTree();
		if (this.input.cameraPressed) this.cycleCam();
		if (this.input.skillPressed) this.triggerSkill();
		if (this.momentT > 0) {
			this.momentT -= dt;
			if (this.momentT <= 0) this.showNextMoment();
		}
		if (this.freeze > 0) {
			this.freeze -= dt;
			this.look(dt);
			this.visualJuice(dt);
			return;
		}
		this.look(dt);
		this.move(dt);
		this.weaponsTick(dt);
		this.pickups();
		this.enemiesTick(dt);
		this.projectilesTick(dt);
		this.particlesTick(dt);
		this.world.update(this.time);
		if (this.msgT > 0) this.msgT -= dt;
		this.hitmarker = Math.max(0, this.hitmarker - dt * 4);
		this.dmgFlash = Math.max(0, this.dmgFlash - dt * 2.2);
		this.trauma = Math.max(0, this.trauma - dt * 1.6);
		this.muzzleT = Math.max(0, this.muzzleT - dt);
		this.muzzle.intensity = this.muzzleT > 0 ? 8 : 0;
		this.lanceT = Math.max(0, this.lanceT - dt);
		if (this.health <= 0 && !this.ended) {
			this.ended = true;
			this.audio.playerDeath();
			useGame.getState().setScreen("dead");
			if (document.pointerLockElement) document.exitPointerLock();
		}
	}
	visualJuice(dt) {
		this.muzzleT = Math.max(0, this.muzzleT - dt);
		this.muzzle.intensity = this.muzzleT > 0 ? 8 : 0;
		this.lanceT = Math.max(0, this.lanceT - dt);
	}
	overlayOpen() {
		return this.bagOpen || this.atlasOpen || this.treeOpen;
	}
	spawnNpcs() {
		this.npcs = [];
		for (const spec of THRESHOLD_NPCS) {
			const fig = buildEnemyFigure(spec.kind);
			fig.root.position.set(spec.x, spec.y, spec.z);
			fig.root.rotation.y = Math.atan2(this.px - spec.x, this.pz - spec.z);
			this.scene.add(fig.root);
			this.npcs.push({ spec, rig: fig, line: 0 });
			poseHunter(fig, 0, true, 0, 0, 0, 0.4, 0);
		}
	}
	applyCloudSave() {
		const save = useGame.getState().cloudSave;
		if (!save) return;
		this.owned = new Set(save.skills.length ? save.skills : ["ember-fortitude"]);
		this.skillPts = save.skillPts ?? 2;
		if (save.characterId) this.applyCharacter(save.characterId);
		for (const id of save.runes || []) {
			this.runes.add(id);
			const p = this.world.pickups.find((x) => x.kind === "rune" && x.name === id);
			if (p) {
				p.taken = true;
				p.mesh.visible = false;
			}
			this.world.quenchRune?.(id);
		}
		if ([...this.runes].filter((id) => id !== "eryndra" && id !== "aelith").length >= 4) {
			this.world.setGateOpen(true);
			this.rebuildHash();
			this.tell("The gate remembers your oath.");
		}
	}
	hearNpcs() {
		let nearest = null;
		let best = 2.6;
		for (const n of this.npcs) {
			const dx = n.rig.root.position.x - this.px;
			const dz = n.rig.root.position.z - this.pz;
			const d = Math.hypot(dx, dz);
			if (d < best) {
				best = d;
				nearest = n;
			}
			const look = Math.atan2(this.px - n.rig.root.position.x, this.pz - n.rig.root.position.z);
			n.rig.root.rotation.y = look;
			poseHunter(n.rig, this.time * 1.4, true, 0, 0, 0, this.time, 0);
		}
		if (!nearest) return;
		this.nearPrompt = `Hear ${nearest.spec.name}`;
		this.nearKey = this.input.interactGlyph?.() || "F";
		if (this.input.interactPressed) {
			const lines = nearest.spec.lines || FIGURE_LINES[nearest.spec.kind] || [];
			const line = lines[nearest.line % Math.max(1, lines.length)] || `${nearest.spec.name} keeps the silence.`;
			nearest.line += 1;
			this.tell(line);
			this.audio.ui?.("equip");
			this.queueMoment({
				title: nearest.spec.name,
				epithet: nearest.spec.epithet,
				verse: [line],
				body: line,
			});
		}
	}
	applyWorldMoments(dt) {
		const f = this.owm?.flags;
		if (!f || !this.world) return;
		this.world.syncMoment({
			ember: !!f.emberFloor,
			jump: f.jumpMul || 1,
			night: f.night || 1,
			tide: f.bloodPull || 0,
			resist: f.resist || 0,
		});
		this.world.skySpin = f.skySpin || 1;
		if (this.scene.fog && this.scene.fog.isFog) {
			const n = Math.max(1, f.night || 1);
			this.scene.fog.near = 48 / n;
			this.scene.fog.far = 220 / Math.sqrt(n);
			this.scene.fog.color.setHex(C.void);
			this.scene.background = new THREE.Color(C.void);
		}
		if (f.regen > 0) this.health = Math.min(this.maxHealth || 100, this.health + f.regen * dt);
		if (f.magnet) {
			for (const p of this.world.pickups) {
				if (p.taken || p.kind === "rune") continue;
				const dx = this.px - p.mesh.position.x;
				const dz = this.pz - p.mesh.position.z;
				const d = Math.hypot(dx, dz);
				if (d < 14 && d > 0.2) {
					p.mesh.position.x += (dx / d) * 9 * dt;
					p.mesh.position.z += (dz / d) * 9 * dt;
				}
			}
		}
		if (f.emberFloor && this.grounded && !useGame.getState().settings.immortal) {
			this.health = Math.max(1, this.health - 4 * dt);
		}
	}
	toggleBag() {
		this.atlasOpen = false;
		this.treeOpen = false;
		this.bagOpen = !this.bagOpen;
		if (this.bagOpen) {
			if (document.pointerLockElement) document.exitPointerLock();
			this.audio.ui("bag");
			this.tell("The crimson bag opens. Choose an arm.");
		} else {
			this.audio.ui("close");
			this.canvas.requestPointerLock();
			this.locked = true;
		}
	}
	toggleAtlas() {
		this.bagOpen = false;
		this.treeOpen = false;
		this.atlasOpen = !this.atlasOpen;
		if (this.atlasOpen) {
			if (document.pointerLockElement) document.exitPointerLock();
			this.audio.ui("map");
			this.tell("The Pulse map unfolds.");
		} else {
			this.audio.ui("close");
			this.canvas.requestPointerLock();
			this.locked = true;
		}
	}
	toggleTree() {
		this.bagOpen = false;
		this.atlasOpen = false;
		this.treeOpen = !this.treeOpen;
		if (this.treeOpen) {
			if (document.pointerLockElement) document.exitPointerLock();
			this.audio.ui("tree");
			this.tell("The four branches open. Strength. Magic. Attack. Minerals.");
		} else {
			this.audio.ui("close");
			this.canvas.requestPointerLock();
			this.locked = true;
		}
	}
	cycleCam() {
		const order = ["fps", "tps", "spec"];
		const cur = useGame.getState().settings.cam || "fps";
		const next = order[(order.indexOf(cur) + 1) % 3];
		useGame.getState().patchSettings({ cam: next });
		this.tell(next === "fps" ? "View · First eye" : next === "tps" ? "View · Over shoulder" : "View · Spectator");
		this.pushHud();
	}
	mods() {
		return modsFrom([...(this.owned || [])]);
	}
	bindSkill(id) {
		const s = skillById(id);
		if (!s?.active || !this.owned?.has(id)) return;
		this.activeSkill = id;
		this.tell(`${s.name} bound to Q.`);
	}
	buySkill(id) {
		const s = skillById(id);
		if (!s) return;
		if (this.owned?.has(id)) {
			if (s.active) this.bindSkill(id);
			return;
		}
		if (s.requires && !this.owned.has(s.requires)) {
			this.audio.ui("deny");
			this.tell("A deeper Name is required.");
			return;
		}
		if ((this.skillPts ?? 0) < s.cost) {
			this.audio.ui("deny");
			this.tell("The tree is hungry. Claim Names. Spill blood.");
			return;
		}
		this.skillPts -= s.cost;
		this.owned.add(id);
		this.maxHealth = 100 + this.mods().life;
		this.health = Math.min(this.maxHealth, this.health + (s.life || 0));
		if (s.active) this.activeSkill = id;
		this.tell(`${s.name} takes root.`);
		this.audio.skill(s.active || "fortitude", s.id);
	}
	triggerSkill() {
		if (this.overlayOpen() || this.ended) return;
		if ((this.skillCd || 0) > 0) {
			this.audio.skillFail();
			this.tell("The branch is still cooling.");
			return;
		}
		const s = skillById(this.activeSkill || "ember-fortitude");
		const kind = s?.active || "fortitude";
		const at = this.yawObj.position.clone().add(new THREE.Vector3(0, 1.1, 0));
		if (kind === "fortitude") {
			if (this.fortitudeT > 0) {
				this.audio.skillFail();
				return;
			}
			this.fortitudeT = 8;
			this.tell("Ember Fortitude — in crimson flame, we endure.");
		} else if (kind === "surge") {
			this.fortitudeT = 5;
			if (s?.id === "dual-surge") {
				const fx = -Math.sin(this.yaw);
				const fz = -Math.cos(this.yaw);
				this.dashToward(fx, fz, 6);
				this.melee?.(48, 4.4);
				this.tell("Crimson Surge + Shadow Lunge.");
			} else {
				this.tell("Crimson Surge.");
			}
		} else if (kind === "lunge") {
			const fx = -Math.sin(this.yaw);
			const fz = -Math.cos(this.yaw);
			this.dashToward(fx, fz, 6);
			this.melee?.(40, 4);
			this.tell("Shadow Lunge.");
		} else if (kind === "tide") {
			this.health = Math.min(this.maxHealth || 100, this.health + 28);
			this.tell("Tide Invocation.");
		} else if (kind === "carapace") {
			this.fortitudeT = 10;
			this.tell("Night Carapace.");
		} else if (kind === "coil") {
			this.coilT = 6;
			this.tell("Precision Coil.");
		} else if (kind === "whisper") {
			for (const e of this.enemies) {
				if (!e.alive) continue;
				const d = Math.hypot(e.root.position.x - this.px, e.root.position.z - this.pz);
				if (d < 18) e.cd = Math.max(e.cd, s?.id === "final-whisper" ? 2.6 : 1.6);
			}
			this.tell(s?.id === "final-whisper" ? "Final Form Whisper." : "Void Whisper.");
		} else if (kind === "ritual") {
			this.blast(at, 9, 42);
			this.tell("Circle of Four.");
			this.trauma = 0.5;
		}
		this.skillCd = kind === "ritual" || kind === "whisper" ? 8 : 5;
		this.skillCastT = 1.55;
		this.skillCast = s ? { id: s.id, name: s.name, art: s.art || s.icon, kind } : null;
		this.spark(at, kind === "ritual" ? 3.2 : 2);
		this.audio.skill(kind, s?.id || "");
		this.trauma = Math.min(1, this.trauma + 0.25);
	}
	dashToward(fx, fz, dist) {
		const len = Math.hypot(fx, fz) || 1;
		const ux = fx / len;
		const uz = fz / len;
		const steps = 10;
		const step = dist / steps;
		for (let i = 0; i < steps; i++) {
			const nx = this.px + ux * step;
			const nz = this.pz + uz * step;
			const y = Math.max(this.py, this.stepFloor(nx, nz, this.py, 0.65));
			if (this.solidAt(nx, y, nz)) break;
			this.px = nx;
			this.pz = nz;
			this.py = y;
		}
	}
	remain() {
		this.ended = false;
		this.tell("The palace grows quiet. You may walk the grounds again.");
	}
	setQuality(q) {
		this.quality = q || 1080;
		const dpr = window.devicePixelRatio || 1;
		const coarse = window.matchMedia("(pointer: coarse)").matches;
		const pr = this.quality >= 1080 ? Math.min(coarse ? 1.5 : 2, dpr) : this.quality >= 720 ? Math.min(1.25, dpr) : 0.7;
		this.renderer.setPixelRatio(pr);
		this.renderer.toneMapping = this.quality >= 720 ? THREE.ACESFilmicToneMapping : THREE.NoToneMapping;
		this.renderer.toneMappingExposure = this.quality >= 1080 ? 1.38 : 1.22;
		const aniso = this.quality >= 1080 ? 8 : this.quality >= 720 ? 4 : 1;
		for (const t of this.textures) {
			if (!t || !t.image) continue;
			t.anisotropy = aniso;
			t.needsUpdate = true;
		}
		if (this.world?.setDetail) this.world.setDetail(this.quality >= 720);
		setCrystalQuality(this.quality);
		this.resize();
	}
	look(dt) {
		if (this.overlayOpen()) {
			this.input.consumeLook();
			this.yawObj.rotation.y = this.yaw;
			this.camera.rotation.set(this.pitch + this.recoilSim.camPitch + this.recoilSim.camTr, this.recoilSim.camYaw, this.recoilSim.camRoll);
			return;
		}
		const s = useGame.getState().settings;
		const look = this.input.consumeLook();
		const adsMul = this.ads() ? .55 : 1;
		const sens = s.sensitivity * adsMul;
		this.yaw -= look.x * sens;
		this.pitch -= look.y * sens * (s.invertY ? -1 : 1);
		this.yaw -= this.input.lookStickX * 2.6 * dt * adsMul;
		this.pitch -= this.input.lookStickY * 2.2 * dt * adsMul * (s.invertY ? -1 : 1);
		const lim = Math.PI / 2 - .02;
		if (this.pitch > lim) this.pitch = lim;
		if (this.pitch < -lim) this.pitch = -lim;
		this.yawObj.rotation.y = this.yaw;
		this.camera.rotation.set(this.pitch + this.recoilSim.camPitch + this.recoilSim.camTr, this.recoilSim.camYaw, this.recoilSim.camRoll);
	}
	ads() {
		const w = WEAPONS[this.weapon];
		if (!w || w.fire === "melee") return false;
		if (w.view === VIEW.smg || w.view === VIEW.fist) return false;
		return this.input.adsHeld;
	}
	move(dt) {
		const fx = -Math.sin(this.yaw);
		const fz = -Math.cos(this.yaw);
		const rx = Math.cos(this.yaw);
		const rz = -Math.sin(this.yaw);
		const mx = this.input.moveX;
		const my = this.input.moveY;
		let ax = rx * mx + fx * my;
		let az = rz * mx + fz * my;
		const len = Math.hypot(ax, az);
		if (len > 1) {
			ax /= len;
			az /= len;
		}
		const sprint = this.input.sprintHeld && len > .1 && this.grounded;
		let speed = (sprint ? 10.4 : 6.3) * (this.mods().speed || 1);
		if (this.staggerT > 0) speed *= 0.38;
		const wishX = ax * speed;
		const wishZ = az * speed;
		const rate = this.grounded ? 16 : 3.6;
		const lerpAmt = 1 - Math.exp(-rate * dt);
		this.vx += (wishX - this.vx) * lerpAmt;
		this.vz += (wishZ - this.vz) * lerpAmt;
		if (this.input.jumpPressed) this.jumpBuf = .12;
		else this.jumpBuf = Math.max(0, this.jumpBuf - dt);
		const wasGrounded = this.grounded;
		const fall = this.vy;
		if (this.jumpBuf > 0 && (this.grounded || this.coyote > 0)) {
			const jumpMul = this.owm?.flags?.jumpMul || 1;
			this.vy = 8.1 * jumpMul;
			this.grounded = false;
			this.coyote = 0;
			this.jumpBuf = 0;
			this.jumpWasHeld = !!this.input.jumpHeld;
			this.audio.jump();
		}
		if (this.input.jumpHeld) this.jumpWasHeld = true;
		if (this.jumpWasHeld && !this.input.jumpHeld && this.vy > 2.4 && !this.grounded) {
			this.vy *= 0.45;
			this.jumpWasHeld = false;
		}
		const travel = Math.hypot(this.vx, this.vz) * dt + Math.abs(this.vy) * dt;
		const steps = Math.max(1, Math.min(6, Math.ceil(travel / 0.28)));
		const sdt = dt / steps;
		for (let i = 0; i < steps; i++) this.slide(sdt);
		if (!wasGrounded && this.grounded) {
			this.audio.land(Math.min(1, Math.abs(fall) / 14));
			if (fall < -18 && !useGame.getState().settings.immortal) {
				this.hurtPlayer(Math.min(36, (-fall - 18) * 3.5));
			}
		}
		if (this.grounded) {
			this.coyote = .11;
			this.jumpWasHeld = false;
		} else this.coyote = Math.max(0, this.coyote - dt);
		this.resolveBodies();
		const hsp = Math.hypot(this.vx, this.vz);
		if (this.grounded && hsp > 2.2) {
			this.bob += hsp * dt * 1.7;
			this.stepT -= dt;
			if (this.stepT <= 0) {
				this.audio.step();
				this.stepT = sprint ? .28 : .42;
			}
		}
		this._f.set(fx, 0, fz);
		this._r.set(rx, 0, rz);
	}
	resolveBodies() {
		for (const e of this.enemies) {
			if (!e.alive) continue;
			const dx = this.px - e.root.position.x;
			const dz = this.pz - e.root.position.z;
			const d = Math.hypot(dx, dz);
			const min = RADIUS + e.radius * 0.82;
			if (d >= min || d < 0.001) continue;
			const nx = dx / d;
			const nz = dz / d;
			const push = (min - d) * 0.7;
			const px = this.px + nx * push;
			const pz = this.pz + nz * push;
			if (!this.solidAt(px, this.py, pz)) {
				this.px = px;
				this.pz = pz;
			}
		}
	}
	slide(dt) {
		const STEP = 0.65;
		let y = Math.max(this.py, this.stepFloor(this.px, this.pz, this.py, STEP));
		let nx = this.px + this.vx * dt;
		let nz = this.pz + this.vz * dt;
		const stepOrBlock = (x, z, axis) => {
			const at = Math.max(y, this.stepFloor(x, z, y, STEP));
			if (!this.solidAt(x, at, z)) return { x, z, y: at };
			if (!this.solidAt(x, y + STEP, z)) {
				return { x, z, y: this.stepFloor(x, z, y + STEP, 0.08) };
			}
			if (axis === "x") this.vx = 0;
			else this.vz = 0;
			return null;
		};
		const rx = stepOrBlock(nx, this.pz, "x");
		if (rx) {
			nx = rx.x;
			y = rx.y;
		} else nx = this.px;
		const rz = stepOrBlock(nx, nz, "z");
		if (rz) {
			nz = rz.z;
			y = rz.y;
		} else nz = this.pz;
		this.vy -= 22 * dt;
		if (this.vy < -28) this.vy = -28;
		let ny = y + this.vy * dt;
		if (this.vy > 0 && this.solidAt(nx, ny, nz)) {
			this.vy = 0;
			ny = y;
		}
		this.grounded = false;
		const floor = this.floorBelow(nx, nz, Math.max(ny, y) + 0.04);
		if (this.vy <= 0 && ny <= floor + 0.02) {
			ny = floor;
			this.vy = 0;
			this.grounded = true;
		}
		if (ny < 0) {
			ny = 0;
			this.vy = 0;
			this.grounded = true;
		}
		this.px = nx;
		this.py = ny;
		this.pz = nz;
	}
	solidAt(x, y, z) {
		const feet = y + 0.02;
		const head = y + HEIGHT - 0.02;
		for (const b of this.nearBoxes(x, z, RADIUS + 0.2)) {
			if (b.maxY - b.minY <= 0.72) continue;
			if (head <= b.minY || feet >= b.maxY) continue;
			if (circleHitsAABB(x, z, RADIUS, b)) return true;
		}
		return false;
	}
	stepFloor(x, z, y, step) {
		let g = y;
		for (const b of this.nearBoxes(x, z, RADIUS + 0.2)) {
			if (!circleHitsAABB(x, z, RADIUS * 0.92, b)) continue;
			const top = b.maxY;
			if (top > y + step + 0.01) continue;
			if (top < y - 0.02) continue;
			g = Math.max(g, top);
		}
		return g;
	}
	floorBelow(x, z, y) {
		let g = 0;
		for (const b of this.nearBoxes(x, z, RADIUS + 0.2)) {
			if (!circleHitsAABB(x, z, RADIUS * 0.92, b)) continue;
			if (b.maxY > y) continue;
			g = Math.max(g, b.maxY);
		}
		return g;
	}
	weaponsTick(dt) {
		if (this.overlayOpen()) {
			if (this.input.weaponSlot !== null) this.equip(this.input.weaponSlot);
			return;
		}
		if (this.input.weaponSlot !== null) this.equip(this.input.weaponSlot);
		if (this.input.weaponDelta) {
			const nWeap = WEAPONS.length;
			const dir = this.input.weaponDelta > 0 ? 1 : nWeap - 1;
			let n = this.weapon;
			for (let k = 0; k < nWeap; k++) {
				n = (n + dir) % nWeap;
				if (this.canEquip(n)) break;
			}
			this.equip(n);
		}
		if (this.reloadT > 0) {
			this.reloadT -= dt;
			if (this.reloadT <= 0) this.finishReload();
			return;
		}
		if (this.input.reloadPressed) this.startReload();
		const w = WEAPONS[this.weapon];
		if (!w) return;
		this.input.setAnkhCharge(this.charge, w.fire === "beam");
		if (w.fire === "beam") {
			if (this.input.fireHeld && this.mag[this.weapon] > 0) this.charge = Math.min(1, this.charge + dt / .72);
			else if (this.charge > .25 && this.mag[this.weapon] > 0) {
				this.shoot();
				this.charge = 0;
			} else this.charge = Math.max(0, this.charge - dt * 1.4);
		} else {
			this.charge = 0;
			if (w.automatic ? this.input.fireHeld : this.input.firePressed || w.automatic && this.input.fireHeld) this.shoot();
		}
	}
	canEquip(id) {
		const w = WEAPONS[id];
		if (!w) return false;
		if (w.unlock === "eryndra" && !this.runes.has("eryndra")) return false;
		if (w.unlock === "aelith" && !this.runes.has("aelith")) return false;
		return true;
	}
	showView(view) {
		for (let i = 0; i < this.weapons.length; i++) this.weapons[i].visible = i === view;
	}
	equip(i) {
		const n = WEAPONS.length;
		const id = ((i % n) + n) % n;
		if (!this.canEquip(id)) {
			this.audio.ui("deny");
			this.tell("That arm waits on a Name.");
			return;
		}
		if (this.weapon !== id) this.audio.ui("equip");
		this.weapon = id;
		this.showView(WEAPONS[id].view ?? 0);
		this.reloadT = 0;
		this.charge = 0;
		this.recoilSim.reset();
		this.recoilSim.weaponId = id;
	}
	magCap(i) {
		const w = WEAPONS[i];
		if (!w) return 1;
		if (w.fire === "melee") return w.mag;
		return Math.max(1, Math.round(w.mag * (this.mods().mag || 1)));
	}
	startReload() {
		const w = WEAPONS[this.weapon];
		if (this.mag[this.weapon] >= this.magCap(this.weapon)) return;
		if (this.reserve[this.weapon] <= 0) return;
		this.reloadT = w.reload;
		this.audio.reload();
	}
	finishReload() {
		const need = this.magCap(this.weapon) - this.mag[this.weapon];
		const take = Math.min(need, this.reserve[this.weapon]);
		this.mag[this.weapon] += take;
		this.reserve[this.weapon] -= take;
	}
	shoot() {
		const w = WEAPONS[this.weapon];
		let cd = w.cooldown * (w.fire === "hitscan" ? lerp(1, this.profile.spreadMul, .15) : 1);
		if (this.owm?.flags?.pulseRate && (w.view === VIEW.smg || w.nameKey === "pulse")) cd /= this.owm.flags.pulseRate;
		if (this.time - this.lastShot[this.weapon] < cd) return;
		if (this.mag[this.weapon] <= 0) {
			this.audio.empty();
			this.startReload();
			return;
		}
		this.lastShot[this.weapon] = this.time;
		const f = this.owm?.flags;
		const inf =
			(f?.sparkInfinite && (w.view === VIEW.rifle || w.nameKey === "spark")) ||
			(f?.pulseInfinite && (w.view === VIEW.smg || w.nameKey === "pulse"));
		if (w.fire !== "melee" && !inf) this.mag[this.weapon]--;
		this.audio.fireWeapon(w.view ?? 0, w.fire, !!w.automatic);
		const ads = this.ads();
		const shake = useGame.getState().settings.shake;
		this.recoilSim.fire(w, {
			ads,
			mul: this.profile.recoilMul,
			charge: w.fire === "beam" ? this.charge : 0,
			shake,
		});
		this.trauma = Math.min(1, this.trauma + (shake ? w.recoil * 4 : 0));
		this.muzzleT = .05;
		const mods = this.mods();
		const forti = this.fortitudeT > 0 ? 1.35 : 1;
		const crit = (this.coilT > 0 || Math.random() < mods.crit) ? 1.6 : 1;
		let dmg = w.damage * this.profile.damageMul * mods.dmg * forti * crit;
		if (f?.pulseDmg && (w.view === VIEW.smg || w.nameKey === "pulse")) dmg *= f.pulseDmg;
		if (f?.ankhMul && w.fire === "beam") dmg *= f.ankhMul;
		if (w.fire === "melee") this.melee(dmg, w.range);
		else if (w.fire === "projectile") this.spawnProj(false, 22, dmg, .22, void 0, void 0, true);
		else if (w.fire === "rail") {
			this.hitscan(dmg, w.spread * this.profile.spreadMul * this.recoilSim.spreadMul(), w.range);
			this.flashLance(w.range * 0.55);
		} else {
			const spread = w.spread * this.profile.spreadMul * this.recoilSim.spreadMul();
			const charged = w.fire === "beam" ? .7 + this.charge * .8 : 1;
			this.hitscan(dmg * charged, spread, w.range);
			if (w.fire === "beam") this.flashLance(w.range * (.35 + this.charge * .65));
		}
		if (w.fire !== "melee" && this.mag[this.weapon] <= 0) this.startReload();
	}
	melee(dmg, range) {
		this.camera.updateMatrixWorld();
		this.camera.getWorldPosition(this._origin);
		this._dir.set(0, 0, -1).applyQuaternion(this.camera.getWorldQuaternion(this._q));
		this.flashLance(range * 1.4);
		for (const e of this.enemies) {
			if (!e.alive) continue;
			const dx = e.root.position.x - this._origin.x;
			const dy = e.root.position.y + 1.1 - this._origin.y;
			const dz = e.root.position.z - this._origin.z;
			const dist = Math.hypot(dx, dy, dz);
			if (dist > range + e.radius) continue;
			const aligned = (dx * this._dir.x + dy * this._dir.y + dz * this._dir.z) / (dist || 1);
			if (aligned < 0.35) continue;
			this.hurtEnemy(e.id, dmg, e.root.position);
		}
	}
	flashLance(dist) {
		this.camera.updateMatrixWorld();
		this.camera.getWorldPosition(this._origin);
		this._dir.set(0, 0, -1).applyQuaternion(this.camera.getWorldQuaternion(this._q));
		const len = Math.max(8, dist * .45);
		this.lance.visible = true;
		this.lance.quaternion.setFromUnitVectors(this._up, this._dir);
		this.lance.scale.set(1 + this.charge * 1.4, len, 1 + this.charge * 1.4);
		this.lance.position.copy(this._origin).addScaledVector(this._dir, len * .5);
		this.lanceMat.opacity = .85;
		this.lanceT = .16;
	}
	hitscan(dmg, spread, range) {
		this.camera.updateMatrixWorld();
		this.ray.setFromCamera(this.ndc, this.camera);
		if (spread > 0) {
			this.ray.ray.direction.x += (Math.random() - .5) * spread;
			this.ray.ray.direction.y += (Math.random() - .5) * spread;
			this.ray.ray.direction.normalize();
		}
		this.ray.far = range;
		const targets = [];
		for (const e of this.enemies) if (e.alive) targets.push(e.hit);
		for (const m of this.world.hitMeshes) if (m.visible) targets.push(m);
		const hits = this.ray.intersectObjects(targets, true);
		if (hits.length === 0) {
			this.spark(this.ray.ray.at(40, this._origin), .4);
			return;
		}
		const h = hits[0];
		this.spark(h.point, 1);
		let obj = h.object;
		while (obj) {
			if (obj.userData.eid) {
				const head = h.point.y > (obj.parent?.position?.y || 0) + 1.55;
				this.hurtEnemy(obj.userData.eid, dmg * (head ? 1.35 : 1), h.point);
				return;
			}
			obj = obj.parent;
		}
	}
	spawnProj(fromEnemy, speed, dmg, radius, origin, dir, grav = false) {
		let p = this.projPool.pop();
		if (!p) {
			const m = new THREE.Mesh(new THREE.SphereGeometry(.12, 8, 8), this.mats.ember || new THREE.MeshBasicMaterial({ color: 0xff3311 }));
			p = {
				mesh: m,
				vx: 0,
				vy: 0,
				vz: 0,
				life: 0,
				dmg: 0,
				fromEnemy: false,
				radius,
				active: false,
				grav: false
			};
			this.scene.add(m);
		}
		const o = origin ?? this.rayOrigin();
		const d = dir ?? this.fwd();
		p.mesh.position.copy(o);
		p.mesh.visible = true;
		p.vx = d.x * speed;
		p.vy = d.y * speed + (grav ? 4.2 : 0);
		p.vz = d.z * speed;
		p.life = grav ? 2.8 : 2.4;
		p.dmg = dmg;
		p.fromEnemy = fromEnemy;
		p.radius = radius;
		p.active = true;
		p.grav = grav;
		this.projectiles.push(p);
	}
	rayOrigin() {
		this.camera.getWorldPosition(this._origin);
		return this._origin.clone();
	}
	fwd() {
		this._dir.set(0, 0, -1).applyQuaternion(this.camera.getWorldQuaternion(this._q));
		return this._dir.clone();
	}
	projectilesTick(dt) {
		for (let i = this.projectiles.length - 1; i >= 0; i--) {
			const p = this.projectiles[i];
			if (p.grav) p.vy -= 16 * dt;
			const ox = p.mesh.position.x;
			const oy = p.mesh.position.y;
			const oz = p.mesh.position.z;
			const nx = ox + p.vx * dt;
			const ny = oy + p.vy * dt;
			const nz = oz + p.vz * dt;
			p.life -= dt;
			let dead = p.life <= 0;
			let hitAt = null;
			if (!dead) {
				const boxes = this.hash.querySegment(ox, oz, nx, nz, p.radius + 0.4);
				let bestT = 1;
				for (const b of boxes) {
					if (b.maxY < 0.2 && b.minY < -0.5) continue;
					const t = sweepSphereAABB(ox, oy, oz, nx, ny, nz, p.radius, b);
					if (t != null && t < bestT) {
						bestT = t;
						hitAt = { x: lerp(ox, nx, t), y: lerp(oy, ny, t), z: lerp(oz, nz, t) };
					}
				}
				if (hitAt) {
					if (p.grav && !p.fromEnemy) this.blast(new THREE.Vector3(hitAt.x, hitAt.y, hitAt.z), 3.6, p.dmg * .7);
					else this.spark(new THREE.Vector3(hitAt.x, hitAt.y, hitAt.z), .8);
					dead = true;
				}
			}
			if (!dead) {
				p.mesh.position.set(nx, ny, nz);
				if (p.grav && ny < .12) {
					this.blast(p.mesh.position, 3.6, p.dmg * .7);
					dead = true;
				} else if (ny < 0) dead = true;
			}
			if (!dead && !p.fromEnemy) for (const e of this.enemies) {
				if (!e.alive) continue;
				const dx = p.mesh.position.x - e.root.position.x;
				const dz = p.mesh.position.z - e.root.position.z;
				const dy = p.mesh.position.y - (e.root.position.y + e.height * .5);
				if (dx * dx + dz * dz < (e.radius + p.radius) ** 2 && Math.abs(dy) < e.height) {
					this.hurtEnemy(e.id, p.dmg, p.mesh.position);
					this.blast(e.root.position, 3.2, p.dmg * .45);
					dead = true;
					break;
				}
			}
			if (!dead && p.fromEnemy) {
				const dx = p.mesh.position.x - this.px;
				const dz = p.mesh.position.z - this.pz;
				const dy = p.mesh.position.y - (this.py + EYE);
				if (dx * dx + dz * dz < (RADIUS + p.radius) ** 2 && Math.abs(dy) < 1.2) {
					this.hurtPlayer(p.dmg);
					dead = true;
				}
			}
			if (dead) {
				p.mesh.visible = false;
				p.active = false;
				this.projPool.push(p);
				this.projectiles.splice(i, 1);
			}
		}
	}
	blast(at, r, dmg) {
		for (const e of this.enemies) {
			if (!e.alive) continue;
			const d = e.root.position.distanceTo(at);
			if (d < r && d > .2) this.hurtEnemy(e.id, dmg * (1 - d / r), at);
		}
		this.spark(at, 2);
		this.audio.explode();
	}
	hurtEnemy(id, dmg, at) {
		const e = this.enemies.find((x) => x.id === id);
		if (!e || !e.alive) return;
		e.hp -= dmg;
		e.flash = .12;
		this.hitmarker = 1;
		const kx = e.root.position.x - this.px;
		const kz = e.root.position.z - this.pz;
		const kd = Math.hypot(kx, kz) || 1;
		e.root.position.x += (kx / kd) * 0.42;
		e.root.position.z += (kz / kd) * 0.42;
		this.audio.at(e.root.position.x, e.root.position.z);
		this.audio.enemyHit(e.kind);
		this.audio.clearAt();
		this.spark(at, 1.2);
		if (e.hp <= 0) {
			e.alive = false;
			e.root.visible = false;
			this.kills += 1;
			if (this.kills % 5 === 0) {
				this.skillPts = (this.skillPts || 0) + 1;
				this.tell("A Sovereign Stone falls. The tree drinks.");
			}
			this.spark(e.root.position.clone().add(new THREE.Vector3(0, 1, 0)), 3);
			this.audio.at(e.root.position.x, e.root.position.z);
			this.audio.enemyDeath(e.kind);
			this.audio.clearAt();
			this.trauma = Math.min(1, this.trauma + .28);
			this.freeze = e.kind === "boss" ? .09 : .045;
			if (e.kind === "boss") {
				this.runes.add("aelith");
				this.ended = true;
				this.queueMoment({
					title: nameById("aelith").title,
					epithet: nameById("aelith").epithet,
					verse: nameById("aelith").verse.slice(2),
					body: nameById("aelith").claim,
					portrait: nameById("aelith").portrait,
				});
				this.tell("The six names are one.");
				setTimeout(() => useGame.getState().setScreen("victory"), 1600);
				if (document.pointerLockElement) document.exitPointerLock();
			}
		}
	}
	hurtPlayer(dmg) {
		if ((this.grace || 0) > 0 || useGame.getState().settings.immortal) return;
		const resist = Math.min(0.8, (this.mods().resist || 0) + (this.owm?.flags?.resist || 0));
		const mul = (this.fortitudeT > 0 ? 0.55 : 1) * (1 - resist);
		const taken = dmg * mul;
		this.health = Math.max(0, this.health - taken);
		this.dmgFlash = 1;
		this.trauma = Math.min(1, this.trauma + .45);
		this.audio.playerHurt(taken);
	}
	enemiesTick(dt) {
		let near = 0;
		const slow = this.owm?.flags?.slow || 1;
		const confuse = !!this.owm?.flags?.confuse;
		const edt = dt * slow;
		for (const e of this.enemies) {
			if (!e.alive) continue;
			if (e.kind === "construct" && !this.world.gateOpen) continue;
			e.cd -= edt * (e.kind === "sentinel" ? (this.owm?.flags?.sentinelCd || 1) : 1);
			e.flash = Math.max(0, e.flash - dt);
			if (e.windup > 0) e.windup = Math.max(0, e.windup - edt);
			if (e.chargeT > 0) e.chargeT = Math.max(0, e.chargeT - edt);
			e.stateT = (e.stateT || 0) + edt;
			let dx = this.px - e.root.position.x;
			let dz = this.pz - e.root.position.z;
			if (confuse) { dx = -dx; dz = -dz; }
			const dist = Math.hypot(dx, dz) || 0.001;
			const aggro = e.kind === "boss" ? 90 : e.kind === "sentinel" ? 40 : e.kind === "construct" ? 22 : 30;
			const lose = aggro * 1.7;
			if (dist < aggro) {
				e.aware = true;
				e.lastX = this.px;
				e.lastZ = this.pz;
				if (dist < 22) near += e.kind === "boss" ? 1 : 0.35;
			} else if (dist > lose) e.aware = false;
			if (e.aware) this.alertNeighbors(e);
			e.root.lookAt(this.px, e.root.position.y, this.pz);
			const rig = e.hit?.userData?.rig;
			if (rig && dist < 42) poseHunter(rig, this.time * (e.kind === "shade" ? 3 : 1.6) + e.id, true, e.aware ? e.speed : 0, 0, 0, this.time, 0);
			if (e.kind === "boss") {
				e.root.position.y = 0.4 + Math.sin(this.time * 1.4) * 0.35;
				this.bossAi(e, edt, dist, dx, dz);
				continue;
			}
			if (!e.aware) {
				this.enemyIdle(e, edt);
				continue;
			}
			if (e.kind === "sentinel") this.enemySentinel(e, edt, dist, dx, dz);
			else if (e.kind === "shade") this.enemyShade(e, edt, dist, dx, dz);
			else if (e.kind === "construct") this.enemyConstruct(e, edt, dist, dx, dz);
			else this.enemyWraith(e, edt, dist, dx, dz);
			e.root.position.y = e.kind === "shade" || e.kind === "sentinel" ? 0.2 + Math.sin(this.time * 3 + e.id) * 0.15 : 0;
		}
		this.audio.setCombat(Math.min(1, near));
	}
	alertNeighbors(src) {
		for (const o of this.enemies) {
			if (o === src || !o.alive || o.aware) continue;
			const d = Math.hypot(o.root.position.x - src.root.position.x, o.root.position.z - src.root.position.z);
			if (d < 14) {
				o.aware = true;
				o.lastX = src.lastX;
				o.lastZ = src.lastZ;
			}
		}
	}
	enemyIdle(e, dt) {
		e.state = "idle";
		const hx = (e.homeX ?? e.root.position.x) - e.root.position.x;
		const hz = (e.homeZ ?? e.root.position.z) - e.root.position.z;
		const hd = Math.hypot(hx, hz);
		if (hd > 1.4) this.enemySteer(e, hx / hd, hz / hd, e.speed * 0.35, dt);
		else {
			const a = this.time * 0.4 + e.id;
			this.enemySteer(e, Math.cos(a), Math.sin(a), e.speed * 0.12, dt);
		}
		e.root.position.y = e.kind === "shade" || e.kind === "sentinel" ? 0.15 : 0;
	}
	enemyWraith(e, dt, dist, dx, dz) {
		const sep = this.enemySep(e);
		if (dist > e.range) {
			this.enemySteer(e, dx / dist + sep.x * 0.6, dz / dist + sep.z * 0.6, e.speed, dt);
		} else if (e.cd <= 0) {
			if (e.windup <= 0 && e.state !== "strike") {
				e.state = "strike";
				e.windup = 0.22;
				this.audio.at(e.root.position.x, e.root.position.z);
				this.audio.enemyAttack("wraith");
				this.audio.clearAt();
			} else if (e.windup <= 0) {
				e.cd = e.cooldown;
				e.state = "chase";
				if (dist < e.range + 0.5) this.hurtPlayer(e.damage);
			}
		} else this.enemySteer(e, -dz / dist + sep.x, dx / dist + sep.z, e.speed * 0.4, dt);
	}
	enemyShade(e, dt, dist, dx, dz) {
		const side = e.strafe || 1;
		const fx = dx / dist;
		const fz = dz / dist;
		const px = -fz * side;
		const pz = fx * side;
		if (dist > 10) {
			this.enemySteer(e, fx * 0.45 + px, fz * 0.45 + pz, e.speed * 1.15, dt);
		} else if (dist > e.range) {
			this.enemySteer(e, fx * 0.8 + px * 0.7, fz * 0.8 + pz * 0.7, e.speed, dt);
			if (Math.random() < dt * 0.55) {
				this.enemySteer(e, fx, fz, e.speed * 8, 0.12);
				this.audio.at(e.root.position.x, e.root.position.z);
				this.audio.enemyAttack("shade");
				this.audio.clearAt();
			}
		} else if (e.cd <= 0) {
			e.cd = e.cooldown;
			this.audio.at(e.root.position.x, e.root.position.z);
			this.audio.enemyAttack("shade");
			this.audio.clearAt();
			if (dist < e.range + 0.45) this.hurtPlayer(e.damage);
			e.strafe = -side;
		} else this.enemySteer(e, px, pz, e.speed * 0.7, dt);
	}
	enemySentinel(e, dt, dist, dx, dz) {
		const fx = dx / dist;
		const fz = dz / dist;
		const side = e.strafe || 1;
		if (dist < 9) this.enemySteer(e, -fx, -fz, e.speed * 1.3, dt);
		else if (dist > 20) this.enemySteer(e, fx, fz, e.speed, dt);
		else this.enemySteer(e, -fz * side, fx * side, e.speed * 0.9, dt);
		if (e.cd <= 0 && dist < 32 && dist > 6) {
			e.cd = e.cooldown;
			const origin = e.root.position.clone().add(new THREE.Vector3(0, 1.3, 0));
			const lead = dist / 18;
			const dir = new THREE.Vector3(this.px + this.vx * lead - origin.x, this.py + EYE - origin.y, this.pz + this.vz * lead - origin.z).normalize();
			this.spawnProj(true, 18, e.damage, 0.16, origin, dir, false);
			this.audio.at(e.root.position.x, e.root.position.z);
			this.audio.enemyAttack("sentinel");
			this.audio.clearAt();
			if (Math.random() < 0.3) e.strafe = -side;
		}
	}
	enemyConstruct(e, dt, dist, dx, dz) {
		const fx = dx / dist;
		const fz = dz / dist;
		if (e.chargeT > 0.15 && e.state === "charge") {
			this.enemySteer(e, fx, fz, e.speed * 3.4, dt);
			if (dist < e.range + 0.6) {
				this.audio.at(e.root.position.x, e.root.position.z);
				this.audio.enemyAttack("construct");
				this.audio.clearAt();
				this.hurtPlayer(e.damage * 1.4);
				this.trauma = Math.min(1, this.trauma + 0.5);
				e.state = "recover";
				e.chargeT = 0;
				e.cd = e.cooldown * 1.3;
			}
			return;
		}
		if (dist > 5.5) {
			this.enemySteer(e, fx, fz, e.speed, dt);
			if (dist < 11 && e.cd <= 0 && e.state !== "charge") {
				e.state = "charge";
				e.chargeT = 0.55;
				e.cd = e.cooldown;
				this.audio.at(e.root.position.x, e.root.position.z);
				this.audio.enemyAttack("construct");
				this.audio.clearAt();
			}
		} else if (e.cd <= 0) {
			e.cd = e.cooldown;
			this.audio.at(e.root.position.x, e.root.position.z);
			this.audio.enemyAttack("construct");
			this.audio.clearAt();
			this.hurtPlayer(e.damage);
		}
	}
	enemySep(e) {
		let sx = 0, sz = 0;
		for (const o of this.enemies) {
			if (o === e || !o.alive) continue;
			const dx = e.root.position.x - o.root.position.x;
			const dz = e.root.position.z - o.root.position.z;
			const d = Math.hypot(dx, dz);
			if (d < 2.4 && d > 0.01) {
				sx += dx / d;
				sz += dz / d;
			}
		}
		return { x: sx, z: sz };
	}
	enemySteer(e, wx, wz, speed, dt) {
		const len = Math.hypot(wx, wz) || 1;
		let nx = e.root.position.x + (wx / len) * speed * dt;
		let nz = e.root.position.z + (wz / len) * speed * dt;
		const r = e.radius || 0.45;
		for (const b of this.nearBoxes(nx, e.root.position.z, r + 0.4)) {
			if (b.maxY < 1.3 || b.minY > 1.7) continue;
			if (circleHitsAABB(nx, e.root.position.z, r, b)) nx = e.root.position.x;
		}
		for (const b of this.nearBoxes(nx, nz, r + 0.4)) {
			if (b.maxY < 1.3 || b.minY > 1.7) continue;
			if (circleHitsAABB(nx, nz, r, b)) nz = e.root.position.z;
		}
		e.root.position.x = nx;
		e.root.position.z = nz;
	}
	bossAi(e, dt, dist, dx, dz) {
		const ratio = e.hp / e.max;
		const phase = ratio < 0.33 ? 3 : ratio < 0.66 ? 2 : 1;
		const spd = e.speed * (0.85 + phase * 0.28);
		if (dist > 12) this.enemySteer(e, dx / dist, dz / dist, spd, dt);
		else if (dist < 6) this.enemySteer(e, -dx / dist, -dz / dist, spd * 0.7, dt);
		else this.enemySteer(e, -dz / dist, dx / dist, spd * 0.5, dt);
		if (e.cd > 0) return;
		e.cd = (e.cooldown / (0.75 + phase * 0.25));
		const origin = e.root.position.clone().add(new THREE.Vector3(0, 2.4, 0));
		const mode = Math.floor(this.time * (1 + phase * 0.35) + e.id) % (phase >= 3 ? 4 : 3);
		this.audio.at(e.root.position.x, e.root.position.z);
		if (mode === 0) {
			const fan = phase >= 2 ? 4 : 2;
			for (let i = -fan; i <= fan; i++) {
				const dir = new THREE.Vector3(this.px - origin.x, this.py + EYE - origin.y, this.pz - origin.z).normalize();
				const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), i * (0.1 - phase * 0.01));
				dir.applyQuaternion(q);
				this.spawnProj(true, 14 + phase * 4, e.damage, 0.2, origin, dir, false);
			}
			this.audio.enemyAttack("boss");
			this.audio.fireWeapon(VIEW.beam, "beam");
		} else if (mode === 1) {
			const a = Math.random() * Math.PI * 2;
			const rad = 9 + Math.random() * 5;
			e.root.position.x = this.px + Math.cos(a) * rad;
			e.root.position.z = this.pz + Math.sin(a) * rad;
			e.root.position.x = Math.max(-22, Math.min(22, e.root.position.x));
			e.root.position.z = Math.max(-18, Math.min(24, e.root.position.z));
			this.spark(e.root.position, 2.4);
			this.audio.skill("lunge");
		} else if (mode === 2) {
			for (let i = 0; i < 6 + phase * 2; i++) {
				const a = (i / (6 + phase * 2)) * Math.PI * 2 + this.time;
				const dir = new THREE.Vector3(Math.cos(a), 0.05, Math.sin(a));
				this.spawnProj(true, 10 + phase * 3, e.damage * 0.8, 0.18, origin, dir, false);
			}
			this.audio.explode();
		} else if (dist < 7) {
			this.audio.enemyAttack("construct");
			this.hurtPlayer(18 + phase * 6);
			this.trauma = 1;
			this.spark(this.yawObj.position, 2);
		}
		this.audio.clearAt();
		if (phase >= 3 && !e.summoned) {
			e.summoned = true;
			this.makeEnemy("wraith", e.root.position.x + 4, 0, e.root.position.z + 2, false);
			this.makeEnemy("shade", e.root.position.x - 4, 0, e.root.position.z - 2, false);
			this.tell("Aelith writes two lesser names into the hall.");
			this.audio.rune();
		}
	}
	pickups() {
		this.nearPrompt = "";
		this.nearKey = this.input.interactGlyph?.() || "F";
		const want = this.input.interactPressed;
		for (const p of this.world.pickups) {
			if (p.taken) continue;
			const d = Math.hypot(p.mesh.position.x - this.px, p.mesh.position.z - this.pz);
			const dy = Math.abs(p.mesh.position.y - (this.py + 1));
			if (d > 2.1 || dy > 2.4) continue;
			if (p.kind === "rune" && p.name) {
				if (p.name === "eryndra" && [...this.runes].filter((id) => id !== "eryndra" && id !== "aelith").length < 4) {
					this.nearPrompt = "The throne remains sealed. Four Names first.";
					if (want) this.audio.ui("deny");
					continue;
				}
				this.nearPrompt = `Claim ${nameById(p.name).title}`;
				if (!want) continue;
				p.taken = true;
				p.mesh.visible = false;
				this.runes.add(p.name);
				this.skillPts = (this.skillPts || 0) + 2;
				this.audio.rune();
				this.audio.thunder();
				const n = nameById(p.name);
				this.queueMoment({
					title: n.title,
					epithet: n.epithet,
					verse: n.verse.slice(0, 2),
					body: n.claim,
					portrait: n.portrait,
				});
				this.tell(`${n.title} — ${n.rune} is yours.`);
				this.trauma = .5;
				if ([...this.runes].filter((id) => id !== "eryndra" && id !== "aelith").length >= 4 && !this.world.gateOpen) {
					this.world.setGateOpen(true);
					this.rebuildHash();
					this.queueMoment(GATE_MOMENT);
					for (const e of this.enemies) if (e.kind === "construct" && !e.root.visible) {
						e.alive = true;
						e.root.visible = true;
					}
				}
				if (p.name === "eryndra") this.spawnBoss();
			} else if (p.kind === "ammo") {
				p.taken = true;
				p.mesh.visible = false;
				this.reserve[this.weapon] = WEAPONS[this.weapon].reserve;
				this.audio.pickupKind("ammo");
				this.tell("Reserves restored.");
			} else if (p.kind === "health") {
				const cap = this.maxHealth || 100;
				if (this.health >= cap) continue;
				p.taken = true;
				p.mesh.visible = false;
				this.health = Math.min(cap, this.health + 32);
				this.audio.pickupKind("health");
			}
		}
		if (!this.nearPrompt) this.hearNpcs();
	}
	queueMoment(m) {
		this.moments.push(m);
		if (this.momentT <= 0) this.showNextMoment();
	}
	showNextMoment() {
		const m = this.moments.shift();
		if (!m) {
			this.currentMoment = null;
			this.momentT = 0;
			return;
		}
		this.currentMoment = m;
		this.momentT = 5.2;
	}
	spark(at, n) {
		const count = Math.min(12, Math.ceil(n * 4));
		if (this.particles.length > 72) return;
		for (let i = 0; i < count; i++) {
			let p = this.partPool.pop();
			if (!p) {
				const mat = this.partMat.clone();
				const m = new THREE.Mesh(this.partGeo, mat);
				p = {
					m,
					mat,
					vx: 0,
					vy: 0,
					vz: 0,
					life: 0
				};
				this.scene.add(m);
			}
			p.m.visible = true;
			p.m.position.copy(at);
			p.m.scale.setScalar(.04 + Math.random() * .05);
			p.mat.opacity = 1;
			p.vx = (Math.random() - .5) * 6;
			p.vy = Math.random() * 5;
			p.vz = (Math.random() - .5) * 6;
			p.life = .35 + Math.random() * .25;
			this.particles.push(p);
		}
	}
	particlesTick(dt) {
		for (let i = this.particles.length - 1; i >= 0; i--) {
			const p = this.particles[i];
			p.life -= dt;
			p.m.position.x += p.vx * dt;
			p.m.position.y += p.vy * dt;
			p.m.position.z += p.vz * dt;
			p.vy -= 9 * dt;
			p.mat.opacity = Math.max(0, p.life * 3);
			if (p.life <= 0) {
				p.m.visible = false;
				this.partPool.push(p);
				this.particles.splice(i, 1);
			}
		}
	}
	visual(dt) {
		try {
			this._visualInner(dt);
		} catch (err) {
			this.lastErr = String(err?.message || err);
		}
	}
	_visualInner(dt) {
		const bobY = this.grounded && Math.hypot(this.vx, this.vz) > 1.4 ? Math.sin(this.bob) * .045 : 0;
		const shake = useGame.getState().settings.shake ? this.trauma * this.trauma : 0;
		const sx = (Math.random() - .5) * shake * .18;
		const sy = (Math.random() - .5) * shake * .18;
		this.yawObj.position.set(this.px + sx, this.py + EYE + bobY + sy, this.pz);
		this.audio.setListener(this.px, this.py + EYE, this.pz, -Math.sin(this.yaw), -Math.cos(this.yaw));
		const w = WEAPONS[this.weapon];
		this.audio.chargeHum(w?.fire === "beam" ? this.charge : 0);
		const cam = useGame.getState().settings.cam || "fps";
		if (this.charId !== useGame.getState().settings.character) this.applyCharacter(useGame.getState().settings.character);
		const fps = cam === "fps";
		this.viewmodel.visible = fps;
		if (this.hunter) {
			this.hunter.root.visible = !fps;
			this.hunter.root.position.set(this.px, this.py, this.pz);
			this.hunter.root.rotation.y = this.yaw + Math.PI;
			poseHunter(this.hunter, this.bob, this.grounded, Math.hypot(this.vx, this.vz), this.pitch, w?.view ?? 0, this.time, 0);
		}
		tickCrystal(this.time, this.scene.fog);
		this.world?.flashLightning?.(this.time);
		if (fps) this.camera.position.set(0, 0, 0);
		else if (cam === "tps") this.camera.position.set(0.55, 0.22, 2.6);
		else this.camera.position.set(0.15, 0.55, 5.4);
		if (!fps && this.pitch < -0.35) this.pitch = -0.35;
		const ads = this.ads();
		const targetFov = ads ? (w?.zoom || 48) : 78;
		this.camera.fov += (targetFov + this.recoilSim.fov - this.camera.fov) * (1 - Math.exp(-10 * dt));
		this.camera.updateProjectionMatrix();
		this.recoilSim.tick(dt, w, { charge: this.charge, time: this.time, ads });
		const shakeOn = useGame.getState().settings.shake;
		const roll = shakeOn ? this.recoilSim.camRoll : this.recoilSim.camRoll * 0.25;
		this.camera.rotation.set(this.pitch + this.recoilSim.camPitch + this.recoilSim.camTr, this.recoilSim.camYaw, roll);
		const tx = ads ? 0 : .3;
		const ty = ads ? -.2 : -.28 + Math.sin(this.bob) * .02;
		const tz = ads ? -.48 : -.58;
		const k = 1 - Math.exp(-12 * dt);
		this._vmRest.x += (tx - this._vmRest.x) * k;
		this._vmRest.y += (ty - this._vmRest.y) * k;
		this._vmRest.z += (tz - this._vmRest.z) * k;
		this.viewmodel.position.set(
			this._vmRest.x + this.recoilSim.vmX + this.recoilSim.trX,
			this._vmRest.y + this.recoilSim.vmY + this.recoilSim.trY,
			this._vmRest.z + this.recoilSim.vmZ,
		);
		this.viewmodel.rotation.set(this.recoilSim.vmPitch + this.recoilSim.trPitch, this.recoilSim.vmYaw, this.recoilSim.vmRoll);
		this.chargeGlow.intensity = this.charge * 6;
		if (this.lanceT > 0) {
			this.lance.visible = true;
			this.lanceMat.opacity = Math.max(0, this.lanceT * 5);
		} else {
			this.lance.visible = false;
			this.lanceMat.opacity = 0;
		}
		for (const e of this.enemies) {
			if (e.flash > 0 || e._lit) {
				e.hit.traverse((o) => {
					const mat = o.material;
					if (mat && mat.emissive) mat.emissiveIntensity = e.flash > 0 ? 2.8 : kindGlow(e.kind);
				});
				e._lit = e.flash > 0;
			}
		}
	}
	applyCharacter(id) {
		this.charId = id;
		const ch = CHARACTERS.find((c) => c.id === id);
		if (!ch || !this.hunter?.faceMat) return;
		const loader = new THREE.TextureLoader();
		const t = loader.load(ch.portrait);
		t.colorSpace = THREE.SRGBColorSpace;
		t.anisotropy = 8;
		t.minFilter = THREE.LinearMipmapLinearFilter;
		t.magFilter = THREE.LinearFilter;
		this.textures.push(t);
		this.hunter.faceMat.map = t;
		this.hunter.faceMat.toneMapped = false;
		this.hunter.faceMat.needsUpdate = true;
	}
	tell(s) {
		this.msg = s;
		this.msgT = 3.6;
	}
	objective() {
		if (this.runes.has("aelith")) return "The cycle is complete.";
		if (this.boss) return "Unmake Aelith the Crimson — or be written into her runes.";
		if (this.runes.has("eryndra")) return "The throne is claimed. Face the Final Form.";
		if (this.runes.size >= 4) return "The gate is open. Sit the Eternal Throne.";
		return `Claim the outer Names — ${this.runes.size}/4`;
	}
	pushHud() {
		const w = WEAPONS[this.weapon];
		const zone = this.world ? this.world.getZone(this.px, this.py, this.pz) : { name: "The Threshold" };
		useGame.getState().setHud({
			health: this.health,
			maxHealth: this.maxHealth || 100,
			ammo: this.reserve[this.weapon],
			mag: this.mag[this.weapon],
			weapon: `${w.name} · ${this.profile.flavor}`,
			weaponId: this.weapon,
			charging: this.charge,
			reloading: this.reloadT > 0,
			zone: zone.name,
			objective: this.objective(),
			message: this.msgT > 0 ? this.msg : "",
			runes: [...this.runes],
			kills: this.kills,
			hitmarker: this.hitmarker,
			damageFlash: this.dmgFlash,
			locked: this.locked || this.input.isCoarse || this.overlayOpen(),
			boss: this.boss && this.boss.alive ? {
				name: "Aelith the Crimson",
				hp: this.boss.hp,
				max: this.boss.max,
				level: this.profile.bossLevel || 1
			} : null,
			moment: this.currentMoment,
			code: this.profile.padded,
			prompt: this.nearPrompt || "",
			promptKey: this.nearKey || "F",
			pad: this.input.padName || "",
			event: this.owm?.banner?.() ?? null,
			ads: this.ads(),
			scoped: this.ads() && (WEAPONS[this.weapon]?.view === VIEW.sniper),
			cam: useGame.getState().settings.cam,
			bag: this.bagOpen,
			atlas: this.atlasOpen,
			tree: this.treeOpen,
			fortitude: this.fortitudeT || 0,
			skillPts: this.skillPts || 0,
			skills: [...(this.owned || [])],
			activeSkill: this.activeSkill || "ember-fortitude",
			skillCd: this.skillCd || 0,
			skillCast: this.skillCastT > 0 ? this.skillCast : null,
			recoilHeat: this.recoilSim.heat01(),
			map: {
				x: this.px,
				z: this.pz,
				yaw: this.yaw,
				marks: [
					...this.enemies.filter((e) => e.alive).map((e) => ({ x: e.root.position.x, z: e.root.position.z, kind: "foe" })),
					...(this.world?.pickups || []).filter((p) => !p.taken && p.kind !== "rune").map((p) => ({
						x: p.mesh.position.x,
						z: p.mesh.position.z,
						kind: p.kind === "ammo" ? "ammo" : "health",
					})),
				],
				runes: [...this.runes],
				gateOpen: !!this.world?.gateOpen,
			},
		});
	}
	render() {
		const w = this.canvas.clientWidth || window.innerWidth;
		const h = this.canvas.clientHeight || window.innerHeight;
		if (this.canvas.width !== Math.floor(w * this.renderer.getPixelRatio()) || this.canvas.height !== Math.floor(h * this.renderer.getPixelRatio())) this.resize();
		this.renderer.setClearColor(0x1a080c, 1);
		this.renderer.info.reset();
		this.renderer.clear();
		this.camera.layers.set(0);
		this.renderer.render(this.scene, this.camera);
		this.worldCalls = this.renderer.info.render.calls;
		this.worldTris = this.renderer.info.render.triangles;
		const fps = (useGame.getState().settings.cam || "fps") === "fps";
		if (fps && this.viewmodel.children.length) {
			const bg = this.scene.background;
			this.scene.background = null;
			this.renderer.clearDepth();
			this.weaponCam.aspect = this.camera.aspect;
			this.weaponCam.fov = Math.min(68, this.camera.fov);
			this.weaponCam.updateProjectionMatrix();
			this.weaponCam.matrixWorld.copy(this.camera.matrixWorld);
			this.weaponCam.matrixWorldInverse.copy(this.camera.matrixWorldInverse);
			this.renderer.render(this.scene, this.weaponCam);
			this.scene.background = bg;
		}
		this.lastCalls = this.renderer.info.render.calls;
		this.lastTris = this.renderer.info.render.triangles;
	}
	resize() {
		const w = this.canvas.clientWidth || window.innerWidth;
		const h = this.canvas.clientHeight || window.innerHeight;
		this.renderer.setSize(w, h, false);
		this.camera.aspect = w / Math.max(1, h);
		this.camera.updateProjectionMatrix();
		this.weaponCam.aspect = this.camera.aspect;
		this.weaponCam.updateProjectionMatrix();
	}
	exposeControls() {
		if (this.disposed) return;
		const probe = {
			engine: ENGINE_VER,
			getYaw: () => this.yaw,
			getSpeed: () => Math.hypot(this.vx, this.vz),
			getGrounded: () => this.grounded,
			getHealth: () => this.health,
			getPos: () => ({
				x: this.px,
				y: this.py,
				z: this.pz
			}),
			setKeys: (codes) => this.input.setKeys(codes),
			setSteer: () => {},
			jump: () => this.input.ui.jump(),
			fire: (v = true) => this.input.ui.fire(v),
			setYaw: (y) => {
				this.yaw = y;
				this.yawObj.rotation.y = y;
			},
			setPos: (x, z) => {
				this.px = x;
				this.pz = z;
				this.py = this.world ? this.floorBelow(x, z, 14) : 0;
				this.vx = 0;
				this.vz = 0;
				this.vy = 0;
				this.grounded = true;
			},
			dump: () => ({
				engine: ENGINE_VER,
				simReady: this.simReady,
				paused: this.paused,
				running: this.running,
				ended: this.ended,
				freeze: this.freeze,
				grace: this.grace,
				overlay: this.overlayOpen(),
				screen: useGame.getState().screen,
				moveX: this.input.moveX,
				moveY: this.input.moveY,
				keys: [...this.input.keys],
				vx: this.vx,
				vz: this.vz,
				speed: Math.hypot(this.vx, this.vz),
				py: this.py,
				grounded: this.grounded,
				isCoarse: this.input.isCoarse,
				pad: this.input.padConnected,
				calls: this.lastCalls || this.renderer.info.render.calls,
				worldCalls: this.worldCalls || 0,
				tris: this.lastTris || this.renderer.info.render.triangles,
				err: this.lastErr || "",
				kids: this.scene.children.length,
				progs: this.renderer.info.programs?.length || 0,
				cw: this.canvas.clientWidth,
				ch: this.canvas.clientHeight,
				bw: this.canvas.width,
				bh: this.canvas.height,
				recoil: this.recoilSim.dump(),
			}),
		};
		this._probe = probe;
		window.__controlsTest = probe;
		window.__crimsonQa = {
			seed: () => this.profile.code,
			runes: () => [...this.runes],
			padded: () => padCode(this.profile.code)
		};
		window.__crimsonAudio = this.audio;
	}
	dispose() {
		this.disposed = true;
		this.running = false;
		this.renderer.setAnimationLoop(null);
		if (this._cleaned) return;
		this._cleaned = true;
		this.input.dispose();
		this.audio.dispose();
		this._lockOff();
		window.removeEventListener("pointerdown", this._unlockAudio);
		window.removeEventListener("keydown", this._unlockAudio);
		window.removeEventListener("touchend", this._unlockAudio);
		window.removeEventListener("resize", this.onResize);
		document.removeEventListener("visibilitychange", this.onVis);
		if (document.pointerLockElement) document.exitPointerLock();
		this.world?.dispose();
		disposeCrystal();
		this.scene.traverse((o) => {
			const m = o;
			if (m.geometry && m.geometry !== this.partGeo && m.geometry !== this.lance.geometry) m.geometry.dispose();
		});
		for (const t of this.textures) t.dispose();
		this.partGeo.dispose();
		this.partMat.dispose();
		this.lance.geometry.dispose();
		this.lanceMat.dispose();
		this.renderer.dispose();
		if (window.__controlsTest === this._probe) delete window.__controlsTest;
		if (window.__crimsonAudio === this.audio) {
			delete window.__crimsonInput;
			delete window.__crimsonQa;
			delete window.__crimsonAudio;
		}
	}
}
function mesh(geo, mat, x, y, z) {
	const m = new THREE.Mesh(geo, mat);
	m.position.set(x, y, z);
	return m;
}
function kindGlow(kind) {
	if (kind === "boss") return 1.4;
	if (kind === "shade") return 1.1;
	return .4;
}
function lerp(a, b, t) {
	return a + (b - a) * t;
}
