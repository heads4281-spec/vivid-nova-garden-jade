import { C as STICK_SPRINT, D as radialDeadzone, E as emptyActions, S as PAD, T as anyCode, _ as colourShift, a as GATE_MOMENT, b as INTERACT_GLYPH, c as CHARACTERS, d as buildProfile, f as mulberry32, g as NAME_COLOR, h as C, i as useGame, l as VIEW, m as streamSeed, n as modsFrom, o as NAMES, p as padCode, r as skillById, s as nameById, u as WEAPONS, v as ARM_FROM_DPAD, x as KEY, y as DEADZONE } from "./routes-D-O12Ul1.mjs";
import { A as Points, B as TorusGeometry, C as MeshBasicMaterial, D as PerspectiveCamera, E as OctahedronGeometry, F as SRGBColorSpace, H as Vector3, I as Scene, L as SphereGeometry, M as Quaternion, N as Raycaster, O as PlaneGeometry, P as RepeatWrapping, R as TextureLoader, S as Mesh, T as Object3D, V as Vector2, _ as HemisphereLight, a as BufferGeometry, b as LinearMipmapLinearFilter, c as CircleGeometry, d as ConeGeometry, f as CylinderGeometry, g as Group, h as Fog, i as BufferAttribute, j as PointsMaterial, k as PointLight, l as ClampToEdgeWrapping, m as DynamicDrawUsage, n as WebGLRenderer, o as CanvasTexture, p as DirectionalLight, r as BoxGeometry, s as CapsuleGeometry, t as PMREMGenerator, u as Color, v as InstancedMesh, w as MeshStandardMaterial, x as MathUtils, y as LinearFilter, z as Timer } from "../_libs/three.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/engine-CuI-n80f.js
/**
* DualSense extras: adaptive-trigger resistance + sixaxis gyro fine-aim.
* HID is optional (Chrome + user pair). trigger-rumble is the no-permission fallback
* (DualSense + Xbox impulse triggers).
*/
var SONY = 1356;
var PID_DS5 = 3302;
var PID_DS5_EDGE = 3570;
function hidApi() {
	return navigator.hid;
}
function isDualSensePad(pad) {
	if (!pad) return false;
	const id = pad.id.toLowerCase();
	return id.includes("dualsense") || id.includes("dual sense") || id.includes("054c") && (id.includes("0ce6") || id.includes("0df2") || id.includes("ce6"));
}
var DualSenseFx = class {
	hidReady = false;
	gyroLive = false;
	path = "off";
	gyroX = 0;
	gyroY = 0;
	device = null;
	lastForce = -1;
	lastSend = 0;
	rumbleLock = false;
	onReport = (ev) => this.readGyro(ev);
	async restore() {
		const hid = hidApi();
		if (!hid) return;
		try {
			const ds = (await hid.getDevices()).find((d) => d.vendorId === SONY && (d.productId === PID_DS5 || d.productId === PID_DS5_EDGE));
			if (ds) await this.use(ds);
		} catch {}
	}
	async pair() {
		const hid = hidApi();
		if (!hid) return false;
		try {
			const ds = (await hid.requestDevice({ filters: [
				{
					vendorId: SONY,
					productId: PID_DS5
				},
				{
					vendorId: SONY,
					productId: PID_DS5_EDGE
				},
				{ vendorId: SONY }
			] }))[0];
			if (!ds) return false;
			await this.use(ds);
			return this.hidReady;
		} catch {
			return false;
		}
	}
	async use(dev) {
		if (!dev.opened) await dev.open();
		if (this.device) try {
			this.device.removeEventListener("inputreport", this.onReport);
		} catch {}
		this.device = dev;
		this.hidReady = true;
		this.path = "hid";
		dev.addEventListener("inputreport", this.onReport);
	}
	/** charge 0–1 while Ankh is equipped; 0 otherwise. Resistance ramps with charge. */
	apply(charge, ankh, pad) {
		const force = ankh ? Math.max(0, Math.min(1, charge)) : 0;
		if (pad) this.pulseRumble(pad, ankh ? .12 + .88 * force : 0);
		if (this.hidReady) this.sendHid(force, ankh);
	}
	consumeGyro(scale) {
		if (!this.gyroLive) return {
			x: 0,
			y: 0
		};
		const dead = 18;
		const gx = Math.abs(this.gyroX) < dead ? 0 : this.gyroX;
		const gy = Math.abs(this.gyroY) < dead ? 0 : this.gyroY;
		return {
			x: gx * scale,
			y: gy * scale
		};
	}
	pulseRumble(pad, force) {
		const act = pad.vibrationActuator;
		if (!act || this.rumbleLock) return;
		if (force < .04) {
			this.path = this.hidReady ? "hid" : "off";
			return;
		}
		this.rumbleLock = true;
		const params = {
			duration: 80,
			strongMagnitude: 0,
			weakMagnitude: 0,
			leftTrigger: 0,
			rightTrigger: Math.min(1, force)
		};
		const play = act.playEffect("trigger-rumble", params);
		const done = () => {
			this.rumbleLock = false;
		};
		if (play && typeof play.then === "function") {
			play.then(done).catch(done);
			if (!this.hidReady) this.path = "rumble";
		} else this.rumbleLock = false;
	}
	sendHid(force, ankh) {
		const now = performance.now();
		const q = ankh ? Math.round(force * 32) : 0;
		if (q === this.lastForce && now - this.lastSend < 120) return;
		this.lastForce = q;
		this.lastSend = now;
		const payload = this.buildReport(force, ankh);
		const dev = this.device;
		if (!dev) return;
		dev.sendReport(2, payload).catch(() => {
			const bt = new Uint8Array(payload.length + 1);
			bt[0] = 2;
			bt.set(payload, 1);
			dev.sendReport(49, bt).catch(() => {
				this.hidReady = false;
				this.path = "rumble";
			});
		});
	}
	/**
	* USB output 0x02 common block (report id passed separately).
	* valid_flag0 bit2 = R2 effect, bit3 = L2 effect.
	* right_trigger_effect[11] starts at byte 11; left at 22.
	* Mode 0x21 = rigid feedback (resistance). Strength follows Ankh charge.
	*/
	buildReport(force, ankh) {
		const payload = /* @__PURE__ */ new Uint8Array(47);
		payload[0] = 12;
		const on = ankh && force > .02;
		payload[11] = on ? 33 : 5;
		payload[12] = on ? Math.round(36 - force * 28) : 0;
		payload[13] = on ? Math.round(40 + force * 215) : 0;
		payload[22] = 5;
		return payload;
	}
	readGyro(ev) {
		const base = ev.reportId === 49 ? 1 : 0;
		if (ev.data.byteLength < base + 22) return;
		const pitch = ev.data.getInt16(base + 16, true);
		const yaw = ev.data.getInt16(base + 18, true);
		this.gyroY = pitch;
		this.gyroX = yaw;
		this.gyroLive = true;
	}
	async reset() {
		this.apply(0, false, null);
		if (this.device) try {
			this.device.removeEventListener("inputreport", this.onReport);
			const off = this.buildReport(0, false);
			await this.device.sendReport(2, off).catch(() => {});
		} catch {}
		this.gyroLive = false;
		this.hidReady = false;
		this.device = null;
		this.path = "off";
	}
};
function hidAvailable() {
	return Boolean(hidApi());
}
var Input = class {
	keys = /* @__PURE__ */ new Set();
	lookX = 0;
	lookY = 0;
	lookStickX = 0;
	lookStickY = 0;
	moveX = 0;
	moveY = 0;
	fireHeld = false;
	firePressed = false;
	adsHeld = false;
	jumpPressed = false;
	jumpHeld = false;
	reloadPressed = false;
	weaponDelta = 0;
	weaponSlot = null;
	interactPressed = false;
	interactHeld = false;
	pausePressed = false;
	cameraPressed = false;
	bagPressed = false;
	mapPressed = false;
	skillPressed = false;
	treePressed = false;
	sprintHeld = false;
	touchMoveX = 0;
	touchMoveY = 0;
	touchLookActive = false;
	isCoarse = false;
	activeDevice = "kbm";
	padConnected = false;
	padName = "";
	isDualSense = false;
	gyroAllowed = false;
	ds = new DualSenseFx();
	ankhCharge = 0;
	ankhEquipped = false;
	lookTouch = null;
	lastLookX = 0;
	lastLookY = 0;
	moveTouch = null;
	moveOriginX = 0;
	moveOriginY = 0;
	swipeX = 0;
	swipeY = 0;
	swipeT = 0;
	mouseFire = false;
	mouseAds = false;
	uiFire = false;
	uiAds = false;
	uiSprint = false;
	uiInteract = false;
	uiMoveX = 0;
	uiMoveY = 0;
	padPrev = new Array(16).fill(false);
	padPrevInit = false;
	lastBeta = null;
	lastGamma = null;
	gyroHooked = false;
	el = null;
	attach(el) {
		this.el = el;
		this.isCoarse = window.matchMedia("(pointer: coarse)").matches;
		if (this.isCoarse) this.activeDevice = "touch";
		const kd = (e) => {
			if (e.repeat) return;
			this.keys.add(e.code);
			this.activeDevice = "kbm";
			if (KEY.JUMP.includes(e.code)) {
				e.preventDefault();
				this.jumpPressed = true;
			}
			if (KEY.RELOAD.includes(e.code)) this.reloadPressed = true;
			if (KEY.INTERACT.includes(e.code)) this.interactPressed = true;
			if (KEY.PAUSE.includes(e.code)) this.pausePressed = true;
			if (KEY.CAMERA.includes(e.code)) this.cameraPressed = true;
			if (KEY.BAG.includes(e.code)) {
				e.preventDefault();
				this.bagPressed = true;
			}
			if (KEY.MAP.includes(e.code)) this.mapPressed = true;
			if (KEY.SKILL.includes(e.code)) this.skillPressed = true;
			if (KEY.TREE.includes(e.code)) this.treePressed = true;
			if (KEY.ARM_1.includes(e.code)) this.weaponSlot = 0;
			if (KEY.ARM_2.includes(e.code)) this.weaponSlot = 1;
			if (KEY.ARM_3.includes(e.code)) this.weaponSlot = 2;
			if (KEY.ARM_4.includes(e.code)) this.weaponSlot = 3;
			if (KEY.ARM_5.includes(e.code)) this.weaponSlot = 4;
			if (KEY.ARM_6.includes(e.code)) this.weaponSlot = 5;
			if (e.code === "ArrowUp" || e.code === "ArrowDown" || e.code === "ArrowLeft" || e.code === "ArrowRight") e.preventDefault();
		};
		const ku = (e) => {
			this.keys.delete(e.code);
		};
		const md = (e) => {
			this.activeDevice = "kbm";
			if (document.pointerLockElement !== el) return;
			if (e.button === 0) {
				this.mouseFire = true;
				this.firePressed = true;
			}
			if (e.button === 2) this.mouseAds = true;
		};
		const mu = (e) => {
			if (e.button === 0) this.mouseFire = false;
			if (e.button === 2) this.mouseAds = false;
		};
		const mm = (e) => {
			if (document.pointerLockElement !== el) return;
			this.lookX += e.movementX;
			this.lookY += e.movementY;
			this.activeDevice = "kbm";
		};
		const wh = (e) => {
			this.weaponDelta += e.deltaY < 0 ? 1 : -1;
			this.activeDevice = "kbm";
		};
		const blur = () => {
			this.keys.clear();
			this.mouseFire = false;
			this.mouseAds = false;
			this.uiFire = false;
			this.uiAds = false;
			this.uiSprint = false;
			this.uiInteract = false;
			this.uiMoveX = 0;
			this.uiMoveY = 0;
			this.fireHeld = false;
			this.adsHeld = false;
			this.sprintHeld = false;
			this.interactHeld = false;
		};
		const ts = (e) => {
			this.activeDevice = "touch";
			for (const t of Array.from(e.changedTouches)) if (t.clientX < window.innerWidth * .42 && this.moveTouch === null) {
				this.moveTouch = t.identifier;
				this.moveOriginX = t.clientX;
				this.moveOriginY = t.clientY;
			} else if (this.lookTouch === null) {
				this.lookTouch = t.identifier;
				this.lastLookX = t.clientX;
				this.lastLookY = t.clientY;
				this.swipeX = t.clientX;
				this.swipeY = t.clientY;
				this.swipeT = performance.now();
				this.touchLookActive = true;
			}
		};
		const tm = (e) => {
			e.preventDefault();
			for (const t of Array.from(e.touches)) if (t.identifier === this.moveTouch) {
				const dx = t.clientX - this.moveOriginX;
				const dy = t.clientY - this.moveOriginY;
				const max = 54;
				this.touchMoveX = Math.max(-1, Math.min(1, dx / max));
				this.touchMoveY = Math.max(-1, Math.min(1, -dy / max));
			} else if (t.identifier === this.lookTouch) {
				this.lookX += t.clientX - this.lastLookX;
				this.lookY += t.clientY - this.lastLookY;
				this.lastLookX = t.clientX;
				this.lastLookY = t.clientY;
			}
		};
		const te = (e) => {
			for (const t of Array.from(e.changedTouches)) {
				if (t.identifier === this.moveTouch) {
					this.moveTouch = null;
					this.touchMoveX = 0;
					this.touchMoveY = 0;
				}
				if (t.identifier === this.lookTouch) {
					this.lookTouch = null;
					this.touchLookActive = false;
					const dt = performance.now() - this.swipeT;
					const dx = t.clientX - this.swipeX;
					const dy = t.clientY - this.swipeY;
					if (dt < 280 && Math.abs(dx) > 72 && Math.abs(dx) > Math.abs(dy) * 1.55) this.weaponDelta += dx > 0 ? 1 : -1;
				}
			}
		};
		const ctx = (e) => e.preventDefault();
		const onVis = () => {
			if (document.hidden) blur();
		};
		const padOn = (e) => {
			this.padConnected = true;
			this.padName = e.gamepad.id;
			this.isDualSense = isDualSensePad(e.gamepad);
			this.activeDevice = "pad";
			this.ds.restore();
		};
		const padOff = () => {
			this.padConnected = navigator.getGamepads?.().some(Boolean) ?? false;
			if (!this.padConnected) this.padName = "";
		};
		window.addEventListener("keydown", kd);
		window.addEventListener("keyup", ku);
		window.addEventListener("blur", blur);
		document.addEventListener("visibilitychange", onVis);
		el.addEventListener("mousedown", md);
		window.addEventListener("mouseup", mu);
		window.addEventListener("mousemove", mm);
		el.addEventListener("wheel", wh, { passive: true });
		el.addEventListener("contextmenu", ctx);
		el.addEventListener("touchstart", ts, { passive: true });
		el.addEventListener("touchmove", tm, { passive: false });
		el.addEventListener("touchend", te);
		el.addEventListener("touchcancel", te);
		window.addEventListener("gamepadconnected", padOn);
		window.addEventListener("gamepaddisconnected", padOff);
		this._off = () => {
			window.removeEventListener("keydown", kd);
			window.removeEventListener("keyup", ku);
			window.removeEventListener("blur", blur);
			document.removeEventListener("visibilitychange", onVis);
			el.removeEventListener("mousedown", md);
			window.removeEventListener("mouseup", mu);
			window.removeEventListener("mousemove", mm);
			el.removeEventListener("wheel", wh);
			el.removeEventListener("contextmenu", ctx);
			el.removeEventListener("touchstart", ts);
			el.removeEventListener("touchmove", tm);
			el.removeEventListener("touchend", te);
			el.removeEventListener("touchcancel", te);
			window.removeEventListener("gamepadconnected", padOn);
			window.removeEventListener("gamepaddisconnected", padOff);
			this.unhookGyro();
			this.ds.reset();
		};
		this.ds.restore();
	}
	enableGyro() {
		if (this.gyroHooked) return;
		const DOE = window.DeviceOrientationEvent;
		if (DOE && typeof DOE.requestPermission === "function") DOE.requestPermission().then((s) => {
			if (s === "granted") this.hookGyro();
		}).catch(() => {});
		else if (window.DeviceOrientationEvent) this.hookGyro();
	}
	hookGyro() {
		if (this.gyroHooked) return;
		this.gyroHooked = true;
		this.gyroAllowed = true;
		window.addEventListener("deviceorientation", this.onOrient, true);
	}
	unhookGyro() {
		if (!this.gyroHooked) return;
		window.removeEventListener("deviceorientation", this.onOrient, true);
		this.gyroHooked = false;
		this.lastBeta = null;
		this.lastGamma = null;
	}
	onOrient = (e) => {
		if (!this.gyroAllowed || this.isCoarse) return;
		if (this.ds.gyroLive && this.padConnected) return;
		if (e.beta == null || e.gamma == null) return;
		if (this.lastBeta == null || this.lastGamma == null) {
			this.lastBeta = e.beta;
			this.lastGamma = e.gamma;
			return;
		}
		let dG = e.gamma - this.lastGamma;
		let dB = e.beta - this.lastBeta;
		if (dG > 180) dG -= 360;
		if (dG < -180) dG += 360;
		if (dB > 180) dB -= 360;
		if (dB < -180) dB += 360;
		if (Math.abs(dG) > 40 || Math.abs(dB) > 40) {
			this.lastBeta = e.beta;
			this.lastGamma = e.gamma;
			return;
		}
		this.lookX += dG * 3.2;
		this.lookY += dB * 3.2;
		this.lastBeta = e.beta;
		this.lastGamma = e.gamma;
		if (Math.abs(dG) + Math.abs(dB) > .12) this.activeDevice = "touch";
	};
	setGyroAllowed(on) {
		this.gyroAllowed = on;
		if (!on) {
			this.lastBeta = null;
			this.lastGamma = null;
		}
	}
	poll() {
		let mx = 0;
		let my = 0;
		if (anyCode(this.keys, KEY.MOVE_FORWARD)) my += 1;
		if (anyCode(this.keys, KEY.MOVE_BACKWARD)) my -= 1;
		if (anyCode(this.keys, KEY.MOVE_RIGHT)) mx += 1;
		if (anyCode(this.keys, KEY.MOVE_LEFT)) mx -= 1;
		mx += this.touchMoveX;
		my += this.touchMoveY;
		mx += this.uiMoveX;
		my += this.uiMoveY;
		const stickSprint = Math.hypot(this.touchMoveX + this.uiMoveX, this.touchMoveY + this.uiMoveY) >= STICK_SPRINT;
		this.sprintHeld = anyCode(this.keys, KEY.SPRINT) || this.uiSprint || stickSprint;
		this.jumpHeld = anyCode(this.keys, KEY.JUMP);
		this.lookStickX = 0;
		this.lookStickY = 0;
		this.pollPad();
		if (this.gyroAllowed) {
			const g = this.ds.consumeGyro(.011);
			this.lookX += g.x;
			this.lookY += g.y;
		}
		this.ds.apply(this.ankhCharge, this.ankhEquipped, this.lastPad);
		mx += this.padMoveX;
		my += this.padMoveY;
		const len = Math.hypot(mx, my);
		if (len > 1) {
			mx /= len;
			my /= len;
		}
		this.moveX = mx;
		this.moveY = my;
		this.fireHeld = this.mouseFire || this.uiFire || this.padFire;
		this.adsHeld = this.mouseAds || this.uiAds || this.padAds;
		this.interactHeld = anyCode(this.keys, KEY.INTERACT) || this.padInteract || this.uiInteract;
		this.syncActions();
	}
	/** Frozen action frame for this tick — all devices already merged. */
	actions = emptyActions();
	syncActions() {
		this.actions = {
			moveX: this.moveX,
			moveY: this.moveY,
			lookStickX: this.lookStickX,
			lookStickY: this.lookStickY,
			fireHeld: this.fireHeld,
			firePressed: this.firePressed,
			adsHeld: this.adsHeld,
			sprintHeld: this.sprintHeld,
			jumpPressed: this.jumpPressed,
			reloadPressed: this.reloadPressed,
			interactHeld: this.interactHeld,
			interactPressed: this.interactPressed,
			pausePressed: this.pausePressed,
			weaponSlot: this.weaponSlot,
			weaponDelta: this.weaponDelta
		};
	}
	padFire = false;
	padAds = false;
	padInteract = false;
	padMoveX = 0;
	padMoveY = 0;
	lastPad = null;
	pollPad() {
		this.padFire = false;
		this.padAds = false;
		this.padInteract = false;
		this.padMoveX = 0;
		this.padMoveY = 0;
		this.lastPad = null;
		const pads = navigator.getGamepads?.() ?? [];
		let live = false;
		for (const pad of pads) {
			if (!pad) continue;
			live = true;
			this.lastPad = pad;
			this.padName = pad.id;
			this.isDualSense = isDualSensePad(pad);
			const ax = pad.axes;
			const left = radialDeadzone(ax[0] ?? 0, ax[1] ?? 0, DEADZONE);
			this.padMoveX += left.x;
			this.padMoveY += -left.y;
			const right = radialDeadzone(ax[2] ?? 0, ax[3] ?? 0, DEADZONE);
			this.lookStickX += right.x;
			this.lookStickY += right.y;
			const btn = (i) => pad.buttons[i];
			const pressed = (i) => {
				const b = btn(i);
				if (!b) return false;
				return b.pressed || b.value > .32;
			};
			const edge = (i) => {
				const now = pressed(i);
				const was = this.padPrev[i] ?? false;
				this.padPrev[i] = now;
				if (!this.padPrevInit) return false;
				return now && !was;
			};
			this.padFire = this.padFire || pressed(PAD.FIRE);
			this.padAds = this.padAds || pressed(PAD.ADS);
			this.padInteract = this.padInteract || pressed(PAD.INTERACT);
			if (pressed(PAD.SPRINT) || Math.hypot(left.x, left.y) >= .88) this.sprintHeld = true;
			if (edge(PAD.FIRE)) this.firePressed = true;
			if (edge(PAD.JUMP)) this.jumpPressed = true;
			if (edge(PAD.RELOAD)) this.reloadPressed = true;
			if (edge(PAD.INTERACT)) this.interactPressed = true;
			if (edge(PAD.PAUSE)) this.pausePressed = true;
			if (edge(PAD.LS)) this.cameraPressed = true;
			if (edge(PAD.SELECT)) this.bagPressed = true;
			if (edge(PAD.CYCLE_NEXT)) this.weaponDelta += 1;
			if (edge(PAD.CYCLE_PREV)) this.weaponDelta -= 1;
			for (const [b, slot] of Object.entries(ARM_FROM_DPAD)) if (edge(Number(b))) this.weaponSlot = slot;
			if (pressed(PAD.FIRE) || pressed(PAD.JUMP) || Math.abs(left.x) + Math.abs(left.y) + Math.abs(right.x) + Math.abs(right.y) > .2) this.activeDevice = "pad";
			break;
		}
		this.padConnected = live;
		if (!live) {
			this.padPrev.fill(false);
			this.padPrevInit = false;
		} else this.padPrevInit = true;
	}
	consumeLook() {
		const x = this.lookX;
		const y = this.lookY;
		this.lookX = 0;
		this.lookY = 0;
		return {
			x,
			y
		};
	}
	interactGlyph() {
		return INTERACT_GLYPH[this.activeDevice];
	}
	hasActivity() {
		return this.fireHeld || this.firePressed || this.touchLookActive || this.keys.size > 0 || Math.abs(this.moveX) + Math.abs(this.moveY) > .04 || Math.abs(this.lookStickX) + Math.abs(this.lookStickY) > .04 || this.jumpPressed || this.interactPressed;
	}
	endFrame() {
		this.firePressed = false;
		this.jumpPressed = false;
		this.reloadPressed = false;
		this.interactPressed = false;
		this.pausePressed = false;
		this.cameraPressed = false;
		this.bagPressed = false;
		this.mapPressed = false;
		this.skillPressed = false;
		this.treePressed = false;
		this.weaponDelta = 0;
		this.weaponSlot = null;
	}
	setAnkhCharge(charge, equipped) {
		this.ankhCharge = charge;
		this.ankhEquipped = equipped;
	}
	pairDualSense() {
		return this.ds.pair();
	}
	hidSupported() {
		return hidAvailable();
	}
	status() {
		return {
			padName: this.padName,
			connected: this.padConnected,
			dualsense: this.isDualSense,
			hid: this.ds.hidReady,
			path: this.ds.path,
			gyro: this.ds.gyroLive
		};
	}
	setKeys(codes) {
		this.keys = new Set(codes);
	}
	ui = {
		fire: (v) => {
			this.uiFire = v;
			if (v) {
				this.firePressed = true;
				this.activeDevice = "touch";
			}
		},
		ads: (v) => {
			this.uiAds = v;
			this.activeDevice = "touch";
		},
		jump: () => {
			this.jumpPressed = true;
			this.activeDevice = "touch";
		},
		reload: () => {
			this.reloadPressed = true;
			this.activeDevice = "touch";
		},
		sprint: (v) => {
			this.uiSprint = v;
			this.activeDevice = "touch";
		},
		interact: () => {
			this.interactPressed = true;
			this.activeDevice = "touch";
		},
		pause: () => {
			this.pausePressed = true;
		},
		arm: (slot) => {
			this.weaponSlot = slot;
			this.activeDevice = "touch";
		},
		cycle: (dir) => {
			this.weaponDelta += dir;
			this.activeDevice = "touch";
		},
		camera: () => {
			this.cameraPressed = true;
			this.activeDevice = "touch";
		},
		bag: () => {
			this.bagPressed = true;
			this.activeDevice = "touch";
		},
		map: () => {
			this.mapPressed = true;
			this.activeDevice = "touch";
		},
		skill: () => {
			this.skillPressed = true;
			this.activeDevice = "touch";
		},
		tree: () => {
			this.treePressed = true;
			this.activeDevice = "touch";
		},
		move: (x, y) => {
			this.uiMoveX = Math.abs(x) < .12 ? 0 : x;
			this.uiMoveY = Math.abs(y) < .12 ? 0 : y;
			this.activeDevice = "touch";
		}
	};
	dispose() {
		this._off();
		this.el = null;
		this.ds.reset();
	}
	_off = () => {};
};
var GameAudio = class {
	ctx = null;
	master = null;
	sfx = null;
	music = null;
	verb = null;
	muted = false;
	volume = .7;
	drone = null;
	drone2 = null;
	tension = null;
	tensionG = null;
	filter = null;
	chargeOsc = null;
	chargeG = null;
	chargeOn = false;
	voices = 0;
	maxVoices = 18;
	lx = 0;
	ly = 1.6;
	lz = 0;
	lfx = 0;
	lfz = -1;
	pan = 0;
	dist = 1;
	combat = 0;
	lastStep = 0;
	lastHit = 0;
	lastHurt = 0;
	unlock() {
		if (!this.ctx) {
			const AC = window.AudioContext || window.webkitAudioContext;
			this.ctx = new AC({ latencyHint: "interactive" });
			this.master = this.ctx.createGain();
			this.sfx = this.ctx.createGain();
			this.music = this.ctx.createGain();
			this.verb = this.ctx.createGain();
			this.verb.gain.value = .22;
			this.buildReverb();
			this.sfx.connect(this.master);
			this.music.connect(this.master);
			this.verb.connect(this.master);
			this.master.connect(this.ctx.destination);
			this.applyVolume();
		}
		if (this.ctx.state === "suspended") this.ctx.resume();
		this.startDrone();
	}
	setVolume(v) {
		this.volume = v;
		this.applyVolume();
	}
	setMuted(m) {
		this.muted = m;
		this.applyVolume();
	}
	setDrone(hz) {
		if (!this.drone || !this.drone2 || !this.ctx) return;
		const t = this.ctx.currentTime;
		this.drone.frequency.setTargetAtTime(hz, t, .12);
		this.drone2.frequency.setTargetAtTime(hz * 2.01, t, .12);
	}
	setListener(x, y, z, fx, fz) {
		this.lx = x;
		this.ly = y;
		this.lz = z;
		const len = Math.hypot(fx, fz) || 1;
		this.lfx = fx / len;
		this.lfz = fz / len;
		if (this.ctx?.listener) {
			const L = this.ctx.listener;
			try {
				L.positionX.setTargetAtTime(x, this.ctx.currentTime, .02);
				L.positionY.setTargetAtTime(y, this.ctx.currentTime, .02);
				L.positionZ.setTargetAtTime(z, this.ctx.currentTime, .02);
				L.forwardX.setTargetAtTime(this.lfx, this.ctx.currentTime, .02);
				L.forwardZ.setTargetAtTime(this.lfz, this.ctx.currentTime, .02);
				L.forwardY.setTargetAtTime(0, this.ctx.currentTime, .02);
				L.upY.setTargetAtTime(1, this.ctx.currentTime, .02);
			} catch {}
		}
	}
	at(sx, sz) {
		const dx = sx - this.lx;
		const dz = sz - this.lz;
		const dist = Math.hypot(dx, dz) || 1;
		const rx = -this.lfz;
		const rz = this.lfx;
		this.pan = Math.max(-.95, Math.min(.95, (dx * rx + dz * rz) / dist));
		this.dist = dist;
	}
	clearAt() {
		this.pan = 0;
		this.dist = 1;
	}
	setCombat(n) {
		this.combat += (n - this.combat) * .08;
		if (!this.ctx || !this.tensionG) return;
		const t = this.ctx.currentTime;
		this.tensionG.gain.setTargetAtTime(this.combat * .07, t, .4);
		this.music?.gain.setTargetAtTime(.18 + this.combat * .06, t, .4);
		if (this.filter) this.filter.frequency.setTargetAtTime(160 + this.combat * 220, t, .5);
	}
	applyVolume() {
		const g = this.muted ? 0 : this.volume * this.volume;
		const t = this.ctx?.currentTime ?? 0;
		this.master?.gain.setTargetAtTime(g, t, .03);
		this.sfx?.gain.setTargetAtTime(.95, t, .03);
		this.music?.gain.setTargetAtTime(.2, t, .05);
	}
	buildReverb() {
		if (!this.ctx || !this.verb) return;
		for (const d of [
			.037,
			.053,
			.079
		]) {
			const del = this.ctx.createDelay(.2);
			del.delayTime.value = d;
			const fb = this.ctx.createGain();
			fb.gain.value = .28;
			const lp = this.ctx.createBiquadFilter();
			lp.type = "lowpass";
			lp.frequency.value = 2400;
			this.verb.connect(del);
			del.connect(lp);
			lp.connect(fb);
			fb.connect(del);
			lp.connect(this.master);
		}
	}
	startDrone() {
		if (!this.ctx || !this.music || this.drone) return;
		const f = this.ctx.createBiquadFilter();
		f.type = "lowpass";
		f.frequency.value = 180;
		f.Q.value = .7;
		f.connect(this.music);
		this.filter = f;
		const o1 = this.ctx.createOscillator();
		const o2 = this.ctx.createOscillator();
		const g1 = this.ctx.createGain();
		g1.gain.value = .16;
		o1.type = "sawtooth";
		o2.type = "sine";
		o1.frequency.value = 46;
		o2.frequency.value = 92.3;
		o1.connect(g1);
		o2.connect(g1);
		g1.connect(f);
		o1.start();
		o2.start();
		this.drone = o1;
		this.drone2 = o2;
		const ten = this.ctx.createOscillator();
		ten.type = "triangle";
		ten.frequency.value = 55;
		const tg = this.ctx.createGain();
		tg.gain.value = 0;
		ten.connect(tg);
		tg.connect(this.music);
		ten.start();
		this.tension = ten;
		this.tensionG = tg;
		this.windLoop();
	}
	windLoop() {
		if (!this.ctx || !this.music) return;
		const n = this.noiseBuf(2.4);
		const src = this.ctx.createBufferSource();
		src.buffer = n;
		src.loop = true;
		const f = this.ctx.createBiquadFilter();
		f.type = "bandpass";
		f.frequency.value = 380;
		f.Q.value = .5;
		const g = this.ctx.createGain();
		g.gain.value = .045;
		src.connect(f);
		f.connect(g);
		g.connect(this.music);
		src.start();
	}
	noiseBuf(dur, color = "white") {
		const sr = this.ctx.sampleRate;
		const n = this.ctx.createBuffer(1, Math.max(1, Math.floor(sr * dur)), sr);
		const d = n.getChannelData(0);
		let b0 = 0, b1 = 0, b2 = 0;
		for (let i = 0; i < d.length; i++) {
			const w = Math.random() * 2 - 1;
			if (color === "white") d[i] = w;
			else if (color === "pink") {
				b0 = .99765 * b0 + w * .099046;
				b1 = .963 * b1 + w * .2965164;
				b2 = .57 * b2 + w * 1.052691;
				d[i] = (b0 + b1 + b2 + w * .1848) * .22;
			} else {
				b0 = (b0 + .02 * w) / 1.02;
				d[i] = b0 * 3.5;
			}
		}
		return n;
	}
	out(node, peak, attack, dur, sendVerb = true) {
		if (!this.ctx || !this.sfx) return null;
		if (this.voices >= this.maxVoices) return null;
		this.voices++;
		const now = this.ctx.currentTime;
		const g = this.ctx.createGain();
		g.gain.setValueAtTime(1e-4, now);
		g.gain.exponentialRampToValueAtTime(Math.max(2e-4, peak), now + Math.max(.004, attack));
		g.gain.exponentialRampToValueAtTime(1e-4, now + dur);
		const panner = this.ctx.createStereoPanner();
		panner.pan.value = this.pan;
		const distGain = this.ctx.createGain();
		const att = this.dist > 2 ? Math.max(.18, 1 / (1 + (this.dist - 2) * .045)) : 1;
		distGain.gain.value = att;
		node.connect(g);
		g.connect(panner);
		panner.connect(distGain);
		distGain.connect(this.sfx);
		if (sendVerb && this.verb) {
			const vg = this.ctx.createGain();
			vg.gain.value = .35 * att;
			distGain.connect(vg);
			vg.connect(this.verb);
		}
		setTimeout(() => {
			try {
				node.disconnect();
				g.disconnect();
				panner.disconnect();
				distGain.disconnect();
			} catch {}
			this.voices = Math.max(0, this.voices - 1);
		}, (dur + .08) * 1e3);
		return {
			g,
			now,
			dur
		};
	}
	osc(freq, type, dur, peak, slide, attack = .01) {
		if (!this.ctx) return;
		const o = this.ctx.createOscillator();
		o.type = type;
		o.frequency.setValueAtTime(freq, this.ctx.currentTime);
		if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq * slide), this.ctx.currentTime + dur);
		this.out(o, peak, attack, dur);
		o.start();
		o.stop(this.ctx.currentTime + dur + .04);
	}
	noise(dur, peak, freq, type = "bandpass", q = 1.2, color = "white") {
		if (!this.ctx) return;
		const src = this.ctx.createBufferSource();
		src.buffer = this.noiseBuf(Math.max(dur, .05), color);
		const f = this.ctx.createBiquadFilter();
		f.type = type;
		f.frequency.value = freq;
		f.Q.value = q;
		src.connect(f);
		this.out(f, peak, .006, dur);
		src.start();
		src.stop(this.ctx.currentTime + dur + .03);
	}
	click(freq = 2400, peak = .28) {
		this.noise(.018, peak, freq, "highpass", .7);
	}
	thump(freq = 62, peak = .34, dur = .18) {
		this.osc(freq, "sine", dur, peak, .45, .004);
	}
	formant(f1, f2, peak, dur, base = 110) {
		if (!this.ctx || !this.sfx) return;
		const o = this.ctx.createOscillator();
		o.type = "sawtooth";
		o.frequency.value = base * (.94 + Math.random() * .12);
		const bp1 = this.ctx.createBiquadFilter();
		bp1.type = "bandpass";
		bp1.frequency.value = f1;
		bp1.Q.value = 6;
		const bp2 = this.ctx.createBiquadFilter();
		bp2.type = "bandpass";
		bp2.frequency.value = f2;
		bp2.Q.value = 5;
		o.connect(bp1);
		o.connect(bp2);
		this.out(bp1, peak, .02, dur);
		this.out(bp2, peak * .7, .025, dur * 1.05);
		o.start();
		o.stop(this.ctx.currentTime + dur + .05);
	}
	r() {
		return .92 + Math.random() * .16;
	}
	fire(id) {
		this.fireKind(id % 12, "hitscan");
	}
	fireWeapon(view, kind, automatic = false) {
		this.fireKind(view, kind, automatic);
	}
	fireKind(view, kind, automatic = false) {
		const r = this.r();
		if (kind === "melee") {
			this.meleeSwing(view);
			return;
		}
		if (kind === "projectile" || view === 1) {
			this.casterFire(r);
			return;
		}
		if (kind === "beam" || view === 3) {
			this.beamFire(r);
			return;
		}
		if (kind === "rail" || view === 5) {
			this.railFire(r);
			return;
		}
		if (view === 4) {
			this.sniperFire(r);
			return;
		}
		if (view === 2 || automatic) {
			this.smgFire(r);
			return;
		}
		this.rifleFire(r);
	}
	rifleFire(r) {
		this.click(3200 * r, .42);
		this.noise(.07, .5, 1800 * r, "bandpass", .9);
		this.thump(78 * r, .38, .14);
		this.osc(210 * r, "square", .055, .1, .4);
		this.noise(.16, .12, 420, "lowpass", .6, "brown");
	}
	smgFire(r) {
		this.click(2800 * r, .22);
		this.noise(.035, .32, 2200 * r, "bandpass", 1.4);
		this.thump(90 * r, .16, .06);
		this.osc(340 * r, "square", .03, .06);
	}
	sniperFire(r) {
		this.click(4200 * r, .55);
		this.noise(.12, .62, 1400 * r, "bandpass", .7);
		this.thump(48 * r, .55, .32);
		this.osc(160 * r, "sawtooth", .18, .16, .35);
		this.noise(.4, .18, 280, "lowpass", .5, "pink");
		this.osc(980 * r, "sine", .22, .08, 1.6);
	}
	railFire(r) {
		this.osc(80 * r, "sawtooth", .22, .22, 3.2, .008);
		this.osc(640 * r, "square", .16, .14, .3);
		this.noise(.18, .36, 2600 * r, "highpass", .8);
		this.thump(55, .28, .2);
	}
	beamFire(r) {
		this.osc(90, "sawtooth", .35, .28, 4.5, .02);
		this.osc(520 * r, "sine", .4, .2, 2.2);
		this.noise(.28, .3, 1800 * r, "bandpass", .5);
		this.thump(40, .32, .28);
		this.osc(1480 * r, "triangle", .18, .1);
	}
	casterFire(r) {
		this.osc(140 * r, "sine", .28, .24, .5, .03);
		this.osc(420 * r, "triangle", .22, .16, 1.8);
		this.noise(.2, .22, 480, "bandpass", 2.2, "pink");
		this.osc(90, "sine", .16, .12);
	}
	meleeSwing(view) {
		const r = this.r();
		if (view === 6) {
			this.noise(.14, .28, 220 * r, "bandpass", .8, "pink");
			this.osc(70, "sine", .12, .1);
		} else if (view === 10) {
			this.noise(.16, .22, 160, "lowpass", .5, "brown");
			this.thump(48, .18, .14);
		} else if (view === 8) {
			this.noise(.18, .26, 900 * r, "bandpass", 1.6, "pink");
			this.osc(480 * r, "triangle", .14, .08, .4);
		} else if (view === 9) {
			this.noise(.1, .2, 1400 * r, "highpass", .7);
			this.osc(240, "sine", .08, .08);
		} else if (view === 11) this.noise(.06, .18, 700, "bandpass", 1.1);
		else {
			this.noise(.1, .24, 1100 * r, "bandpass", 1.2, "pink");
			this.osc(880 * r, "triangle", .08, .07);
		}
	}
	strike(kind) {
		const r = this.r();
		if (kind === "heavy") {
			this.thump(42, .5, .28);
			this.noise(.16, .4, 180, "lowpass", .6, "brown");
			this.click(900, .18);
		} else if (kind === "crystal") {
			this.click(3400 * r, .4);
			this.osc(1480 * r, "sine", .22, .16, .7);
			this.osc(2200 * r, "triangle", .14, .1);
			this.noise(.08, .22, 2800, "highpass", .8);
		} else if (kind === "blade") {
			this.noise(.07, .34, 2400 * r, "bandpass", 1.8);
			this.osc(1760 * r, "triangle", .12, .12, .55);
			this.thump(90, .16, .08);
		} else {
			this.thump(70, .28, .12);
			this.noise(.08, .32, 900 * r, "bandpass", 1.1, "pink");
			this.click(1600, .16);
		}
	}
	empty() {
		this.click(1400, .12);
		this.osc(90, "square", .06, .07);
	}
	reload() {
		this.noise(.05, .16, 1800, "highpass", .8);
		this.osc(190, "triangle", .07, .1);
		setTimeout(() => {
			this.osc(260, "triangle", .09, .09);
			this.click(2100, .1);
		}, 90);
		setTimeout(() => {
			this.thump(110, .1, .08);
			this.click(900, .08);
		}, 220);
	}
	hit() {
		const now = performance.now();
		if (now - this.lastHit < 40) return;
		this.lastHit = now;
		this.strike("flesh");
	}
	enemyHit(kind) {
		if (kind === "construct" || kind === "sentinel") this.strike("crystal");
		else if (kind === "boss") {
			this.strike("crystal");
			this.thump(38, .22, .16);
		} else this.strike("flesh");
	}
	hurt() {
		this.playerHurt(14);
	}
	playerHurt(amount) {
		const now = performance.now();
		if (now - this.lastHurt < 80) return;
		this.lastHurt = now;
		const sev = Math.min(1, amount / 28);
		this.thump(52, .22 + sev * .22, .16 + sev * .08);
		this.noise(.16 + sev * .1, .28 + sev * .2, 240, "lowpass", .7, "pink");
		this.formant(620 + sev * 80, 1180, .14 + sev * .12, .22 + sev * .12, 95 + Math.random() * 30);
		if (sev > .55) this.formant(480, 900, .12, .28, 80);
	}
	playerDeath() {
		this.formant(400, 780, .22, .7, 70);
		this.osc(60, "sawtooth", .8, .24, .3, .04);
		this.noise(.7, .28, 180, "lowpass", .5, "brown");
		this.thump(36, .4, .5);
	}
	enemyDeath(kind) {
		this.atClearLater();
		if (kind === "wraith") {
			this.formant(780, 1600, .16, .45, 180);
			this.osc(420, "sine", .5, .14, .25);
			this.noise(.4, .22, 700, "bandpass", .8, "pink");
		} else if (kind === "sentinel") {
			this.osc(880, "square", .22, .14, .2);
			this.noise(.3, .28, 2200, "highpass", .7);
			this.osc(140, "sawtooth", .28, .12, .4);
		} else if (kind === "construct") {
			this.thump(32, .5, .45);
			this.noise(.4, .4, 140, "lowpass", .5, "brown");
			this.click(600, .2);
			this.osc(90, "sawtooth", .3, .16, .4);
		} else if (kind === "shade") {
			this.noise(.35, .24, 320, "bandpass", 1.4, "pink");
			this.osc(210, "sine", .4, .12, .2);
			this.formant(900, 1900, .1, .3, 240);
		} else {
			this.bossRoar();
			this.thump(28, .6, .7);
			this.noise(.8, .45, 90, "lowpass", .4, "brown");
			this.osc(55, "sawtooth", .9, .28, .25);
		}
	}
	enemyAttack(kind) {
		if (kind === "wraith") {
			this.noise(.08, .22, 1100, "bandpass", 1.2, "pink");
			this.formant(700, 1400, .1, .16, 160);
		} else if (kind === "sentinel") {
			this.osc(540, "square", .08, .14);
			this.noise(.07, .22, 1900, "bandpass", 1);
			this.click(2600, .16);
		} else if (kind === "construct") {
			this.thump(40, .42, .22);
			this.noise(.14, .3, 200, "lowpass", .6, "brown");
		} else if (kind === "shade") {
			this.noise(.09, .2, 1600, "highpass", .8, "pink");
			this.osc(880, "sine", .1, .08, .5);
		} else this.bossRoar();
	}
	bossRoar() {
		this.formant(320, 640, .22, .7, 55);
		this.osc(48, "sawtooth", .8, .28, .7, .05);
		this.noise(.7, .3, 180, "lowpass", .5, "brown");
	}
	explode() {
		this.thump(38, .55, .42);
		this.noise(.38, .5, 180, "lowpass", .55, "brown");
		this.noise(.18, .28, 1400, "highpass", .7);
		this.osc(70, "sawtooth", .3, .16, .4);
		this.duck(.12, .18);
	}
	step() {
		const now = performance.now();
		if (now - this.lastStep < 90) return;
		this.lastStep = now;
		const r = this.r();
		this.noise(.045, .07 + Math.random() * .03, 170 * r, "lowpass", .8, "brown");
		this.click(900 + Math.random() * 400, .04);
	}
	jump() {
		this.thump(90, .12, .08);
		this.noise(.08, .1, 400, "bandpass", .8, "pink");
	}
	land(force = .5) {
		this.thump(58, .12 + force * .28, .12 + force * .1);
		this.noise(.08 + force * .08, .1 + force * .18, 220, "lowpass", .6, "brown");
		if (force > .6) this.click(700, .08);
	}
	pickup() {
		this.pickupKind("ammo");
	}
	pickupKind(kind) {
		if (kind === "health") {
			this.osc(392, "sine", .16, .14);
			this.osc(523, "sine", .22, .12);
			this.osc(659, "triangle", .28, .1);
		} else {
			this.osc(520, "sine", .1, .12);
			this.osc(780, "sine", .16, .1);
			this.click(2400, .08);
		}
	}
	rune() {
		this.osc(196, "sine", .4, .16);
		this.osc(247, "sine", .5, .12);
		this.osc(392, "triangle", .62, .1);
		this.osc(523, "sine", .7, .08);
		this.noise(.5, .1, 480, "bandpass", 2, "pink");
	}
	thunder() {
		this.thump(28, .4, .7);
		this.noise(.9, .32, 90, "lowpass", .4, "brown");
		this.noise(.25, .16, 1800, "highpass", .5);
	}
	ui(kind) {
		if (kind === "deny") {
			this.osc(110, "square", .1, .08);
			this.osc(90, "square", .14, .06);
			return;
		}
		if (kind === "claim") {
			this.rune();
			return;
		}
		if (kind === "equip") {
			this.click(1800, .1);
			this.osc(240, "triangle", .08, .08);
			return;
		}
		if (kind === "bag" || kind === "open") {
			this.noise(.12, .12, 280, "bandpass", .8, "pink");
			this.osc(160, "sine", .1, .06);
			return;
		}
		if (kind === "close") {
			this.click(900, .07);
			return;
		}
		this.osc(kind === "map" ? 330 : 196, "sine", .14, .08);
		this.osc(kind === "tree" ? 262 : 392, "triangle", .18, .06);
	}
	skill(kind, id = "") {
		const k = id || kind;
		if (kind === "fortitude" || k.includes("fortitude")) this.skillFortitude();
		else if (kind === "carapace" || k.includes("carapace")) this.skillCarapace();
		else if (kind === "surge" || k.includes("surge")) this.skillSurge(k.includes("dual"));
		else if (kind === "lunge" || k.includes("lunge") || k.includes("dash")) this.skillLunge();
		else if (kind === "tide" || k.includes("tide")) this.skillTide();
		else if (kind === "coil" || k.includes("coil")) this.skillCoil();
		else if (kind === "whisper" || k.includes("whisper")) this.skillWhisper(k.includes("final"));
		else if (kind === "ritual" || k.includes("rite") || k.includes("ritual")) this.skillRitual();
		else this.rune();
	}
	skillFortitude() {
		this.thump(48, .32, .4);
		this.osc(98, "sawtooth", .5, .16, 1.4, .04);
		this.noise(.4, .18, 220, "lowpass", .7, "brown");
		this.osc(196, "sine", .6, .1);
	}
	skillCarapace() {
		this.click(2200, .22);
		this.osc(880, "triangle", .28, .14);
		this.osc(1320, "sine", .22, .1);
		this.thump(70, .2, .18);
		this.noise(.2, .16, 2600, "highpass", .8);
	}
	skillSurge(dual) {
		this.noise(.16, .32, 600, "bandpass", .7, "pink");
		this.osc(80, "sawtooth", .22, .2, 2.4);
		this.thump(55, .28, .18);
		if (dual) {
			this.noise(.12, .22, 1400, "highpass", .7);
			this.osc(240, "sine", .16, .12, .4);
		}
	}
	skillLunge() {
		this.noise(.14, .28, 900, "bandpass", .9, "pink");
		this.osc(180, "sine", .18, .14, .35);
		this.click(1900, .12);
	}
	skillTide() {
		this.noise(.5, .28, 180, "lowpass", .5, "pink");
		this.osc(110, "sine", .55, .16, .7, .06);
		this.osc(220, "triangle", .45, .1, 1.3);
		this.osc(330, "sine", .4, .08);
	}
	skillCoil() {
		this.osc(740, "square", .12, .12);
		this.osc(1480, "sine", .22, .14, 1.8);
		this.click(3200, .16);
		this.noise(.1, .12, 2400, "bandpass", 2);
	}
	skillWhisper(finalForm) {
		this.formant(finalForm ? 280 : 420, finalForm ? 560 : 880, .18, .7, finalForm ? 48 : 70);
		this.osc(finalForm ? 36 : 52, "sine", .8, .16, .6, .08);
		this.noise(.7, .16, 240, "bandpass", .8, "pink");
		if (finalForm) this.osc(98, "sawtooth", .9, .12, .4);
	}
	skillRitual() {
		this.osc(65, "sawtooth", .7, .24, .5, .06);
		this.osc(130, "sine", .8, .16);
		this.osc(196, "triangle", .9, .1);
		this.osc(392, "sine", 1, .08);
		this.thump(32, .4, .5);
		this.noise(.6, .22, 140, "lowpass", .5, "brown");
		this.thunder();
	}
	skillFail() {
		this.ui("deny");
	}
	chargeHum(level) {
		if (!this.ctx || !this.sfx) return;
		if (level <= .02) {
			if (this.chargeOn && this.chargeG) {
				this.chargeG.gain.setTargetAtTime(1e-4, this.ctx.currentTime, .04);
				this.chargeOn = false;
			}
			return;
		}
		if (!this.chargeOsc) {
			const o = this.ctx.createOscillator();
			o.type = "sawtooth";
			o.frequency.value = 70;
			const g = this.ctx.createGain();
			g.gain.value = 1e-4;
			const f = this.ctx.createBiquadFilter();
			f.type = "lowpass";
			f.frequency.value = 800;
			o.connect(f);
			f.connect(g);
			g.connect(this.sfx);
			o.start();
			this.chargeOsc = o;
			this.chargeG = g;
		}
		this.chargeOn = true;
		const t = this.ctx.currentTime;
		this.chargeOsc.frequency.setTargetAtTime(70 + level * 220, t, .05);
		this.chargeG?.gain.setTargetAtTime(.04 + level * .14, t, .05);
	}
	resume() {
		if (this.ctx?.state === "suspended") this.ctx.resume();
	}
	dispose() {
		try {
			this.drone?.stop();
			this.drone2?.stop();
			this.tension?.stop();
			this.chargeOsc?.stop();
		} catch {}
		this.ctx?.close();
		this.ctx = null;
		this.drone = null;
		this.drone2 = null;
		this.tension = null;
		this.chargeOsc = null;
		this.chargeOn = false;
	}
	duck(amount, dur) {
		if (!this.music || !this.ctx) return;
		const t = this.ctx.currentTime;
		this.music.gain.setTargetAtTime(Math.max(.04, .2 - amount), t, .02);
		this.music.gain.setTargetAtTime(.2, t + dur, .12);
	}
	atClearLater() {
		setTimeout(() => this.clearAt(), 80);
	}
};
function aabb(x, y, z, w, h, d, id) {
	return {
		minX: x - w / 2,
		maxX: x + w / 2,
		minY: y,
		maxY: y + h,
		minZ: z - d / 2,
		maxZ: z + d / 2,
		id
	};
}
function circleHitsAABB(x, z, r, b) {
	const cx = Math.max(b.minX, Math.min(x, b.maxX));
	const cz = Math.max(b.minZ, Math.min(z, b.maxZ));
	const dx = x - cx;
	const dz = z - cz;
	return dx * dx + dz * dz < r * r;
}
var World = class {
	mats;
	profile;
	group = new Group();
	colliders = [];
	hitMeshes = [];
	pickups = [];
	spawns = [];
	guardians = [];
	gateCollider = null;
	gateMesh = null;
	gateOpen = false;
	energyMats = [];
	bobbers = [];
	rng;
	swarms = [];
	swarmMat = null;
	skyPts = null;
	galaxyPts = null;
	emberField = null;
	wellField = null;
	domeHint = null;
	floatInst = null;
	moon = null;
	bolts = [];
	boltT = 0;
	tide = 1;
	emberOn = false;
	skySpin = 1;
	constructor(mats, profile) {
		this.mats = mats;
		this.profile = profile;
		this.rng = mulberry32(streamSeed(profile.code, "world"));
	}
	build() {
		this.ground();
		this.outerRing();
		this.plaza();
		this.grandStair();
		this.thresholdRift();
		this.pathVeins();
		this.palace();
		this.silhouette();
		this.horizonArt();
		this.floatRunes();
		this.vaelithCourt();
		this.rynaraArchive();
		this.sanguaraCanals();
		this.nyxaraRise();
		this.pickupsAndSpawns();
		this.skyVeins();
		this.milkyWay();
		this.bloodMoon();
		this.lightningBolts();
		return this;
	}
	box(mat, x, y, z, w, h, d, solid = true, id) {
		const mesh = new Mesh(new BoxGeometry(w, h, d), mat);
		mesh.position.set(x, y + h / 2, z);
		mesh.castShadow = false;
		mesh.receiveShadow = true;
		this.group.add(mesh);
		if (solid) {
			this.colliders.push(aabb(x, y, z, w, h, d, id));
			this.hitMeshes.push(mesh);
		}
		return mesh;
	}
	cyl(mat, x, y, z, rTop, rBot, h, seg = 8) {
		const mesh = new Mesh(new CylinderGeometry(rTop, rBot, h, seg), mat);
		mesh.position.set(x, y + h / 2, z);
		this.group.add(mesh);
		this.colliders.push(aabb(x, y, z, rBot * 1.7, h, rBot * 1.7));
		this.hitMeshes.push(mesh);
		return mesh;
	}
	ground() {
		const geo = new PlaneGeometry(280, 280, 48, 48);
		const pos = geo.attributes.position;
		if (pos) {
			for (let i = 0; i < pos.count; i++) pos.setZ(i, Math.sin(pos.getX(i) * .03) * .12 + Math.sin(pos.getY(i) * .03) * .08);
			pos.needsUpdate = true;
			geo.computeVertexNormals();
		}
		const floor = new Mesh(geo, this.mats.floor);
		floor.rotation.x = -Math.PI / 2;
		floor.receiveShadow = true;
		this.group.add(floor);
		this.colliders.push({
			minX: -140,
			maxX: 140,
			minY: -2,
			maxY: 0,
			minZ: -140,
			maxZ: 140,
			id: "ground"
		});
	}
	outerRing() {
		const h = 18;
		const t = 4;
		const s = 236;
		this.box(this.mats.wall, 0, 0, -118, s, h, t);
		this.box(this.mats.wall, 0, 0, 118, s, h, t);
		this.box(this.mats.wall, -118, 0, 0, t, h, s);
		this.box(this.mats.wall, 118, 0, 0, t, h, s);
	}
	plaza() {
		const col = this.mats.column;
		const dummy = new Object3D();
		const geo = new CylinderGeometry(.85, 1.05, 9, 8);
		const inst = new InstancedMesh(geo, col, 28);
		let n = 0;
		const spots = [
			[-14, 68],
			[14, 68],
			[-22, 78],
			[22, 78],
			[-8, 88],
			[8, 88],
			[-32, 58],
			[32, 58],
			[-40, 72],
			[40, 72],
			[-18, 48],
			[18, 48]
		];
		for (const [x, z] of spots) {
			dummy.position.set(x, 4.5, z);
			dummy.updateMatrix();
			inst.setMatrixAt(n++, dummy.matrix);
			this.colliders.push(aabb(x, 0, z, 2.1, 9, 2.1));
		}
		inst.count = n;
		this.group.add(inst);
		for (const [x, z] of spots.slice(0, 6)) {
			const flame = new Mesh(new SphereGeometry(.35, 8, 6), new MeshBasicMaterial({
				color: 16729122,
				toneMapped: false
			}));
			flame.position.set(x, 9.2, z);
			this.group.add(flame);
			const lamp = new PointLight(16724753, 3.4, 22, 2);
			lamp.position.set(x, 8.6, z);
			this.group.add(lamp);
		}
		for (const [x, z] of [[-14, 68], [14, 68]]) {
			const shaft = new Mesh(new CylinderGeometry(.9, 1.1, 9, 8), new MeshBasicMaterial({
				color: 3809308,
				toneMapped: false
			}));
			shaft.position.set(x, 4.5, z);
			this.group.add(shaft);
		}
		for (const [x, z] of [
			[-6, 72],
			[6, 72],
			[0, 62]
		]) this.runeCircle(x, z, 3.2);
		this.energyRiver(0, 88, 0, 24, 2.2);
		this.energyRiver(-88, 8, -24, 16, 1.8);
		this.energyRiver(88, 8, 24, 16, 1.8);
		this.energyRiver(0, -22, 0, -70, 1.8);
		this.energyRiver(-70, 8, -52, -40, 1.4);
	}
	thresholdRift() {
		const wall = this.box(this.mats.body, 0, 0, 96, 40, 16, 3.2);
		wall.visible = false;
		const ring = new Mesh(new TorusGeometry(6.5, .22, 8, 32), this.mats.energy);
		ring.position.set(0, 4.2, 88);
		this.group.add(ring);
		const veil = new Mesh(new CircleGeometry(6.2, 24), new MeshBasicMaterial({
			color: C.arterial,
			transparent: true,
			opacity: .35,
			blending: 2,
			depthWrite: false,
			side: 2
		}));
		veil.position.set(0, 4.2, 88);
		this.group.add(veil);
		const lamp = new PointLight(C.crimson, 7, 28, 2);
		lamp.position.set(0, 5, 86);
		this.group.add(lamp);
	}
	pathVeins() {
		this.energyRiver(0, 68, -70, 8, 1.15);
		this.energyRiver(0, 68, 70, 8, 1.15);
		this.energyRiver(0, 68, -40, -18, .9);
		this.box(this.mats.wall, -34, 0, 28, 18, 2.4, 4.5);
		this.box(this.mats.wall, -38, 0, 12, 10, 3.2, 8);
		const path = new Mesh(new PlaneGeometry(3.6, 90), new MeshBasicMaterial({
			color: 16716083,
			transparent: true,
			opacity: .42,
			blending: 2,
			depthWrite: false,
			toneMapped: false
		}));
		path.rotation.x = -Math.PI / 2;
		path.position.set(0, .08, 28);
		this.group.add(path);
	}
	grandStair() {
		const W = this.mats.wall;
		const E = this.mats.energy;
		this.box(W, 0, 0, 72, 22, .35, 22);
		for (const [z, y, w] of [
			[
				62,
				.35,
				18
			],
			[
				52,
				.8,
				16
			],
			[
				42,
				1.35,
				15
			],
			[
				32,
				1.9,
				14
			]
		]) {
			this.box(W, 0, y, z, w, .42, 10);
			this.box(E, 0, y + .42, z, 1.4, .06, 10, false);
		}
		for (const x of [-9, 9]) this.box(W, x, 0, 48, 1.2, 1.6, 40, false);
		const lamp = new PointLight(C.ember, 8, 36, 2);
		lamp.position.set(0, 8, 50);
		this.group.add(lamp);
		const lamp2 = new PointLight(C.ember, 5, 28, 2);
		lamp2.position.set(0, 6, 36);
		this.group.add(lamp2);
	}
	horizonArt() {
		const skyline = this.mats.cardApproach ?? this.mats.cardStairs;
		if (skyline) {
			const m = new Mesh(new PlaneGeometry(110, 52), skyline);
			m.position.set(0, 20, -42);
			this.group.add(m);
		}
		if (this.mats.cardStairs) {
			const m = new Mesh(new PlaneGeometry(42, 26), this.mats.cardStairs);
			m.position.set(0, 13, -28);
			this.group.add(m);
		}
		if (this.mats.portraitAnkh) {
			const a = new Mesh(new PlaneGeometry(6, 8), this.mats.portraitAnkh);
			a.position.set(-11, 8, 20.6);
			this.group.add(a);
			const b = a.clone();
			b.position.set(11, 8, 20.6);
			this.group.add(b);
		}
	}
	runeCircle(x, z, r) {
		const ring = new Mesh(new TorusGeometry(r, .08, 8, 32), this.mats.energy);
		ring.rotation.x = Math.PI / 2;
		ring.position.set(x, .08, z);
		this.group.add(ring);
	}
	energyRiver(x1, z1, x2, z2, w) {
		const dx = x2 - x1;
		const dz = z2 - z1;
		const mesh = new Mesh(new PlaneGeometry(w, Math.hypot(dx, dz)), this.mats.energy);
		mesh.rotation.x = -Math.PI / 2;
		mesh.rotation.z = Math.atan2(dx, dz);
		mesh.position.set((x1 + x2) / 2, .06, (z1 + z2) / 2);
		this.group.add(mesh);
		if (this.mats.energy instanceof MeshBasicMaterial) this.energyMats.push(this.mats.energy);
	}
	palace() {
		const W = this.mats.wall;
		const Col = this.mats.column;
		const E = this.mats.energy;
		const wallH = 16;
		const thick = 3.2;
		this.box(W, -18, 0, 1, thick, wallH, 46);
		this.box(W, 18, 0, 1, thick, wallH, 46);
		this.box(W, 0, 0, -20, 39, wallH, thick);
		this.box(W, -12.5, 0, 22, 14, wallH, thick);
		this.box(W, 12.5, 0, 22, 14, wallH, thick);
		const gate = this.box(E, 0, 0, 22, 8.5, 11, .6, true, "gate");
		this.gateMesh = gate;
		this.gateCollider = this.colliders[this.colliders.length - 1] ?? null;
		const beacon = new Mesh(new PlaneGeometry(10, 14), new MeshBasicMaterial({
			color: C.arterial,
			transparent: true,
			opacity: .55,
			blending: 2,
			depthWrite: false,
			side: 2
		}));
		beacon.position.set(0, 7, 22.4);
		this.group.add(beacon);
		for (const [x, z] of [
			[-18, 22],
			[18, 22],
			[-18, -20],
			[18, -20]
		]) {
			this.cyl(Col, x, 0, z, 1.6, 2, 22, 8);
			const roof = new Mesh(new ConeGeometry(3.2, 6, 8), this.mats.ember);
			roof.position.set(x, 25, z);
			this.group.add(roof);
		}
		this.box(W, 0, 0, 22.4, 9.4, 1.2, 2.4, false);
		const archL = new Mesh(new TorusGeometry(5.2, .45, 8, 18, Math.PI), this.mats.ember);
		archL.position.set(0, 10.4, 22);
		archL.rotation.z = Math.PI;
		this.group.add(archL);
		for (const x of [
			-10,
			0,
			10
		]) this.cyl(Col, x, 0, -4, .7, .85, 12, 8);
		this.box(Col, 0, 0, -16.5, 7, 1.1, 4.2);
		this.box(Col, 0, 1.1, -17.6, 4.4, 3.4, 1.2);
		this.runeCircle(0, -14, 4.5);
		this.billboard("cardThrone", 0, 8, -19.2, 12, 10, 0);
		this.billboard("portraitOrigin", -8, 6.2, -18.4, 4.2, 6.2, 0);
		const innerLight = new PointLight(C.crimson, 5.5, 42, 2);
		innerLight.position.set(0, 7, -8);
		this.group.add(innerLight);
		const gateLight = new PointLight(C.arterial, 7, 48, 2);
		gateLight.position.set(0, 8, 22);
		this.group.add(gateLight);
	}
	silhouette() {
		const n = this.profile.spireCount;
		const crystal = this.mats.body;
		for (let i = 0; i < n; i++) {
			const h = 14 + this.rng() * 24;
			const segs = 5 + Math.floor(this.rng() * 3);
			const a = i / n * Math.PI * 2 + this.rng() * .4;
			const r = 20 + this.rng() * 16;
			const x = Math.cos(a) * r;
			const z = -42 + Math.sin(a) * r * .28 - this.rng() * 10;
			const spire = new Mesh(new CylinderGeometry(.5 + this.rng() * .8, 1.3 + this.rng() * 1.3, h, segs), crystal);
			spire.position.set(x, h / 2, z);
			spire.rotation.y = this.rng() * Math.PI;
			this.group.add(spire);
		}
		const glow = new PointLight(C.arterial, 3.8 + this.profile.glow, 90, 2);
		glow.position.set(0, 22, -28);
		this.group.add(glow);
	}
	floatRunes() {
		const dummy = new Object3D();
		const n = this.profile.floatRunes;
		const geo = new OctahedronGeometry(.35, 0);
		const inst = new InstancedMesh(geo, this.mats.ember, n);
		for (let i = 0; i < n; i++) {
			const a = i / n * Math.PI * 2 + this.rng();
			const r = 20 + this.rng() * 48;
			dummy.position.set(Math.cos(a) * r, 4 + this.rng() * 14, Math.sin(a) * r * .7 + 8);
			dummy.rotation.set(this.rng() * .6, this.rng() * Math.PI, this.rng() * .4);
			dummy.scale.setScalar(.5 + this.rng() * this.profile.runeScale);
			dummy.updateMatrix();
			inst.setMatrixAt(i, dummy.matrix);
		}
		inst.instanceMatrix.setUsage(DynamicDrawUsage);
		this.group.add(inst);
		this.floatInst = inst;
	}
	vaelithCourt() {
		const E = this.mats.ember;
		for (const [x, z, h] of [
			[
				0,
				-82,
				14
			],
			[
				12,
				-74,
				9
			],
			[
				-14,
				-76,
				10
			],
			[
				18,
				-90,
				8
			],
			[
				-16,
				-92,
				11
			],
			[
				8,
				-96,
				7
			],
			[
				-6,
				-70,
				8
			],
			[
				22,
				-82,
				9
			]
		]) {
			this.cyl(E, x, 0, z, .45, 1.1, h, 6);
			const flame = new PointLight(C.ember, 2.2, 16, 2);
			flame.position.set(x, h * .7, z);
			this.group.add(flame);
		}
		this.runeCircle(0, -82, 6);
		const flame = new PointLight(C.ember, 6, 28, 2);
		flame.position.set(0, 4, -82);
		this.group.add(flame);
		const emberMat = new MeshBasicMaterial({
			color: C.ember,
			transparent: true,
			opacity: .42,
			blending: 2,
			depthWrite: false
		});
		this.emberField = new Mesh(new PlaneGeometry(34, 34), emberMat);
		this.emberField.rotation.x = -Math.PI / 2;
		this.emberField.position.set(0, .14, -82);
		this.emberField.visible = false;
		this.group.add(this.emberField);
		this.billboard("cardVaelith", 0, 10, -96, 16, 10, 0);
		this.billboard("portraitVaelith", 6, 4.2, -80, 3.2, 5.4, 0);
		for (const [x, z] of [
			[8, -68],
			[-10, -64],
			[16, -86],
			[-20, -78]
		]) this.box(this.mats.column, x, 0, z, 2.4, 1.1, 3.2);
	}
	rynaraArchive() {
		for (let i = 0; i < 10; i++) {
			const a = i / 10 * Math.PI * 2;
			const r = 11 + i % 3 * 3;
			const x = -78 + Math.cos(a) * r;
			const z = Math.sin(a) * r;
			const h = 7 + i % 4 * 2.4;
			this.box(this.mats.column, x, 0, z, 2, h, 2);
			const glow = new Mesh(new PlaneGeometry(1.3, h * .7), this.mats.energy);
			glow.position.set(x + 1.1, h * .45, z);
			glow.rotation.y = a + Math.PI / 2;
			this.group.add(glow);
		}
		this.box(this.mats.body, -78, 1.4, 0, 3.6, 2.2, 3.6, false);
		this.runeCircle(-78, 0, 5);
		const l = new PointLight(C.crimson, 3.4, 24, 2);
		l.position.set(-78, 5, 0);
		this.group.add(l);
		this.billboard("cardRynara", -96, 9, 0, 14, 10, Math.PI / 2);
		this.billboard("portraitRynara", -76, 4.4, 8, 3.2, 5.4, Math.PI / 2);
	}
	sanguaraCanals() {
		this.energyRiver(52, -18, 96, -18, 4.2);
		this.energyRiver(52, 18, 96, 18, 4.2);
		this.energyRiver(74, -22, 74, 26, 3.4);
		this.energyRiver(58, 0, 92, 0, 3);
		const water = new Mesh(new PlaneGeometry(48, 48), this.mats.water);
		water.rotation.x = -Math.PI / 2;
		water.position.set(76, .04, 2);
		this.group.add(water);
		for (const z of [
			-18,
			18,
			0
		]) this.box(this.mats.wall, 64, 0, z, 16, .5, 1.4, false);
		this.box(this.mats.body, 80, 0, 4, 8, .55, 8);
		this.box(this.mats.wall, 72, .2, -8, 10, .35, 1.6);
		this.box(this.mats.wall, 88, .2, 14, 10, .35, 1.6);
		for (const [x, z] of [
			[68, -10],
			[90, 16],
			[70, 14]
		]) this.cyl(this.mats.ember, x, 0, z, .18, .35, 2.4, 4);
		this.runeCircle(80, 4, 5);
		const l = new PointLight(14834250, 4, 26, 2);
		l.position.set(80, 4, 4);
		this.group.add(l);
		this.billboard("cardSanguara", 98, 8, 4, 14, 10, -Math.PI / 2);
		this.billboard("portraitSanguara", 78, 4.2, 12, 3.2, 5.4, -Math.PI / 2);
	}
	nyxaraRise() {
		for (const [x, y, z, s] of [
			[
				-40,
				1.2,
				-18,
				8
			],
			[
				-48,
				3.4,
				-30,
				7
			],
			[
				-58,
				5.8,
				-40,
				7
			],
			[
				-52,
				8.4,
				-52,
				9
			],
			[
				-42,
				6.6,
				-44,
				6
			],
			[
				-62,
				7.2,
				-28,
				5
			]
		]) {
			this.box(this.mats.wall, x, y, z, s, .5, s);
			this.runeCircle(x, z, s * .35);
		}
		for (const [x1, y1, z1, x2, y2, z2] of [
			[
				-40,
				1.7,
				-18,
				-48,
				3.9,
				-30
			],
			[
				-48,
				3.9,
				-30,
				-58,
				6.3,
				-40
			],
			[
				-58,
				6.3,
				-40,
				-52,
				8.9,
				-52
			],
			[
				-52,
				8.9,
				-52,
				-42,
				7.1,
				-44
			]
		]) {
			const dx = x2 - x1;
			const dz = z2 - z1;
			const len = Math.hypot(dx, dz);
			const m = new Mesh(new BoxGeometry(1.4, .18, len), this.mats.energy);
			m.position.set((x1 + x2) / 2, (y1 + y2) / 2, (z1 + z2) / 2);
			m.rotation.y = Math.atan2(dx, dz);
			m.rotation.x = Math.atan2(y2 - y1, len) * .4;
			this.group.add(m);
			this.colliders.push(aabb((x1 + x2) / 2, (y1 + y2) / 2 - .2, (z1 + z2) / 2, 1.6, .5, len));
		}
		const l = new PointLight(8930559, 3.6, 22, 2);
		l.position.set(-52, 12, -52);
		this.group.add(l);
		const wellMat = new MeshBasicMaterial({
			color: 6689279,
			transparent: true,
			opacity: .28,
			blending: 2,
			depthWrite: false,
			side: 2
		});
		this.wellField = new Mesh(new CircleGeometry(7, 24), wellMat);
		this.wellField.rotation.x = -Math.PI / 2;
		this.wellField.position.set(-52, 8.95, -52);
		this.wellField.visible = false;
		this.group.add(this.wellField);
		this.billboard("cardNyxara", -52, 14, -62, 14, 10, 0);
		this.billboard("portraitNyxara", -48, 11.2, -50, 3, 5.2, 0);
		this.billboard("portraitNyxStand", -62, 10.4, -36, 3.2, 5.4, Math.PI / 3);
	}
	billboard(key, x, y, z, w, h, rotY = Math.PI) {
		const mat = this.mats[key];
		if (!mat) return;
		const m = new Mesh(new PlaneGeometry(w, h), mat);
		m.position.set(x, y, z);
		m.rotation.y = rotY;
		this.group.add(m);
	}
	pickupsAndSpawns() {
		this.addRune("vaelith", 0, 1.15, -82);
		this.addRune("rynara", -78, 1.15, 0);
		this.addRune("sanguara", 80, 1.15, 4);
		this.addRune("nyxara", -52, 9.6, -52);
		this.addRune("eryndra", 0, 2.3, -15.2);
		this.guardians = [
			{
				name: "vaelith",
				x: 6,
				y: 0,
				z: -78
			},
			{
				name: "rynara",
				x: -72,
				y: 0,
				z: 8
			},
			{
				name: "sanguara",
				x: 74,
				y: 0,
				z: 10
			},
			{
				name: "nyxara",
				x: -46,
				y: 8.4,
				z: -48
			},
			{
				name: "eryndra",
				x: 0,
				y: 0,
				z: -10
			},
			{
				name: "aelith",
				x: 0,
				y: 0,
				z: -8
			}
		];
		for (const [x, y, z] of [
			[
				10,
				.5,
				70
			],
			[
				-12,
				.5,
				64
			],
			[
				40,
				.5,
				10
			],
			[
				-44,
				.5,
				-8
			],
			[
				6,
				.5,
				-50
			],
			[
				24,
				.5,
				-30
			],
			[
				-48,
				4,
				-30
			],
			[
				64,
				.5,
				-18
			],
			[
				12,
				.5,
				-90
			],
			[
				-16,
				.5,
				-90
			],
			[
				90,
				.5,
				-16
			],
			[
				8,
				1.4,
				52
			],
			[
				-8,
				1.4,
				42
			],
			[
				-70,
				.5,
				8
			]
		]) this.addCrate("ammo", x, y, z);
		for (const [x, y, z] of [
			[
				0,
				.5,
				62
			],
			[
				-30,
				.5,
				20
			],
			[
				28,
				.5,
				-12
			],
			[
				0,
				1.6,
				-12
			],
			[
				-52,
				9,
				-52
			],
			[
				80,
				1.1,
				4
			],
			[
				0,
				.5,
				-82
			],
			[
				-78,
				.5,
				4
			]
		]) this.addCrate("health", x, y, z);
		const ring = (cx, cz, r, n, kind) => {
			for (let i = 0; i < n; i++) {
				const a = i / n * Math.PI * 2 + .4;
				this.spawns.push({
					x: cx + Math.cos(a) * r + (this.rng() - .5) * 3.2,
					z: cz + Math.sin(a) * r + (this.rng() - .5) * 3.2,
					kind
				});
			}
		};
		ring(0, 12, 14, 3, "wraith");
		ring(0, -82, 14, 5, "wraith");
		ring(-78, 0, 12, 4, "sentinel");
		ring(80, 4, 12, 4, "sentinel");
		ring(-10, -40, 6, 2, "shade");
		ring(-52, -48, 8, 3, "shade");
		ring(0, -6, 8, 3, "construct");
		ring(0, 48, 10, 2, "shade");
		this.spawns.push({
			x: 18,
			z: 68,
			kind: "shade"
		}, {
			x: -20,
			z: 66,
			kind: "shade"
		});
		this.spawns.push({
			x: 8,
			z: 36,
			kind: "wraith"
		}, {
			x: -8,
			z: 36,
			kind: "wraith"
		});
		for (let i = 0; i < this.profile.extraWraiths; i++) {
			const a = this.rng() * Math.PI * 2;
			const r = 16 + this.rng() * 22;
			this.spawns.push({
				x: Math.cos(a) * r,
				z: 8 + Math.sin(a) * r * .5,
				kind: "wraith"
			});
		}
		for (let i = 0; i < this.profile.extraShades; i++) {
			const a = this.rng() * Math.PI * 2;
			this.spawns.push({
				x: Math.cos(a) * 22,
				z: Math.sin(a) * 18,
				kind: "shade"
			});
		}
	}
	addRune(name, x, y, z) {
		const len = Math.hypot(x, z) || 1;
		this.livingPillar(x + x / len * 2.15, z + z / len * 2.15, Math.max(0, y - 1.15), name);
		const g = new Group();
		const s = this.profile.runeScale;
		const core = new Mesh(new OctahedronGeometry(.55 * s, 0), this.mats.ember);
		const ring = new Mesh(new TorusGeometry(.8 * s, .06, 6, 20), this.mats.energy);
		ring.rotation.x = Math.PI / 2;
		g.add(core, ring);
		g.position.set(x, y, z);
		this.group.add(g);
		const light = new PointLight(NAME_COLOR[name] ?? C.crimson, 1.6 + this.profile.glow, 10, 2);
		g.add(light);
		this.bobbers.push({
			o: g,
			y,
			p: this.rng() * Math.PI * 2
		});
		this.pickups.push({
			id: `rune-${name}`,
			kind: "rune",
			name,
			mesh: g,
			taken: false,
			light
		});
		this.emberSwarm(x, y, z, `rune-${name}`, 96 + Math.floor(this.profile.glow * 55));
	}
	livingPillar(x, z, y, name) {
		const h = 7.6 + this.rng() * 1.4;
		const body = new Mesh(new BoxGeometry(1.85, h, 1.85), this.mats.body);
		body.position.set(x, y + h / 2, z);
		this.group.add(body);
		this.hitMeshes.push(body);
		this.colliders.push(aabb(x, y, z, 1.9, h, 1.9));
		const key = `portrait${name[0].toUpperCase()}${name.slice(1)}`;
		const faceMat = this.mats[key] ?? this.mats.energy;
		const face = new Mesh(new PlaneGeometry(1.45, h * .78), faceMat);
		face.position.set(x, y + h * .48, z + .96);
		this.group.add(face);
		const light = new PointLight(NAME_COLOR[name] ?? C.arterial, 1.4 + this.profile.glow * .6, 14, 2);
		light.position.set(x, y + h * .6, z);
		this.group.add(light);
		this.bobbers.push({
			o: body,
			y: y + h / 2,
			p: this.rng() * Math.PI * 2
		});
		this.bobbers.push({
			o: face,
			y: y + h * .48,
			p: this.rng() * Math.PI * 2
		});
	}
	addCrate(kind, x, y, z) {
		const mat = kind === "ammo" ? this.mats.ember : this.mats.column;
		const mesh = new Mesh(new BoxGeometry(.7, .45, .7), mat);
		mesh.position.set(x, y, z);
		this.group.add(mesh);
		this.bobbers.push({
			o: mesh,
			y,
			p: this.rng() * 6
		});
		this.pickups.push({
			id: `${kind}-${x}-${z}`,
			kind,
			mesh,
			taken: false
		});
	}
	emberSwarm(x, y, z, id, count) {
		if (!this.swarmMat) this.swarmMat = new PointsMaterial({
			color: C.arterial,
			size: .18 + this.profile.glow * .08,
			transparent: true,
			opacity: .88,
			blending: 2,
			depthWrite: false,
			sizeAttenuation: true
		});
		const positions = new Float32Array(count * 3);
		const vel = new Float32Array(count * 3);
		for (let i = 0; i < count; i++) {
			positions[i * 3] = (this.rng() - .5) * 4.6;
			positions[i * 3 + 1] = this.rng() * 11;
			positions[i * 3 + 2] = (this.rng() - .5) * 4.6;
			vel[i * 3] = (this.rng() - .5) * .42;
			vel[i * 3 + 1] = .62 + this.rng() * .9;
			vel[i * 3 + 2] = (this.rng() - .5) * .42;
		}
		const geo = new BufferGeometry();
		geo.setAttribute("position", new BufferAttribute(positions, 3));
		const pts = new Points(geo, this.swarmMat);
		pts.position.set(x, y - .4, z);
		this.group.add(pts);
		this.swarms.push({
			pts,
			vel,
			origin: new Vector3(x, y, z),
			alive: true,
			id
		});
	}
	skyVeins() {
		const n = 240;
		const positions = /* @__PURE__ */ new Float32Array(720);
		for (let i = 0; i < n; i++) {
			positions[i * 3] = (this.rng() - .5) * 180;
			positions[i * 3 + 1] = 18 + this.rng() * 55;
			positions[i * 3 + 2] = (this.rng() - .5) * 180 - 20;
		}
		const geo = new BufferGeometry();
		geo.setAttribute("position", new BufferAttribute(positions, 3));
		this.skyPts = new Points(geo, new PointsMaterial({
			color: C.ankh,
			size: .32,
			transparent: true,
			opacity: .55,
			blending: 2,
			depthWrite: false,
			sizeAttenuation: true
		}));
		this.group.add(this.skyPts);
	}
	bloodMoon() {
		const mat = new MeshBasicMaterial({
			color: 16720452,
			fog: false,
			toneMapped: false
		});
		const moon = new Mesh(new SphereGeometry(32, 28, 18), mat);
		moon.position.set(-48, 58, -72);
		this.group.add(moon);
		const haze = new Mesh(new SphereGeometry(36, 16, 12), new MeshBasicMaterial({
			color: 16711731,
			transparent: true,
			opacity: .18,
			blending: 2,
			depthWrite: false,
			fog: false,
			side: 1
		}));
		haze.position.copy(moon.position);
		this.group.add(haze);
		this.moon = moon;
	}
	lightningBolts() {
		this.bolts = [];
		for (let i = 0; i < 3; i++) {
			const geo = new PlaneGeometry(1.4, 48);
			const mat = new MeshBasicMaterial({
				color: 16737928,
				transparent: true,
				opacity: 0,
				blending: 2,
				depthWrite: false,
				fog: false,
				side: 2
			});
			const m = new Mesh(geo, mat);
			m.position.set((i - 1) * 28, 36, -70 - i * 18);
			m.rotation.z = (i - 1) * .12;
			this.group.add(m);
			this.bolts.push(m);
		}
	}
	flashLightning(t) {
		this.boltT -= 1 / 60;
		if (this.boltT <= 0 && Math.random() < .012) {
			this.boltT = .12 + Math.random() * .1;
			const b = this.bolts[Math.floor(Math.random() * this.bolts.length)];
			if (b) {
				b.position.x = (Math.random() - .5) * 90;
				b.position.z = -40 - Math.random() * 80;
				b.rotation.y = Math.random() * .4;
				b.material.opacity = .85;
			}
		}
		for (const b of this.bolts) {
			const mat = b.material;
			if (mat.opacity > 0) mat.opacity = Math.max(0, mat.opacity - .08);
		}
		if (this.moon) {
			const s = 1 + Math.sin(t * .35) * .03;
			this.moon.scale.setScalar(s);
		}
	}
	milkyWay() {
		const n = this.profile.galaxyCount;
		const positions = new Float32Array(n * 3);
		const colors = new Float32Array(n * 3);
		for (let i = 0; i < n; i++) {
			const r = 90 + this.rng() * 240;
			const a = this.rng() * Math.PI * 2 + Math.floor(this.rng() * 3) * 2.1 + r * .012;
			const phi = (this.rng() - .5) * .55;
			positions[i * 3] = Math.cos(a) * r * Math.cos(phi);
			positions[i * 3 + 1] = 72 + Math.sin(phi) * r * .28 + this.rng() * 40;
			positions[i * 3 + 2] = Math.sin(a) * r * Math.cos(phi) - 40;
			const hot = this.rng();
			colors[i * 3] = 1;
			colors[i * 3 + 1] = hot < .7 ? .02 + hot * .12 : .55;
			colors[i * 3 + 2] = hot < .7 ? .14 + hot * .12 : .04;
		}
		const geo = new BufferGeometry();
		geo.setAttribute("position", new BufferAttribute(positions, 3));
		geo.setAttribute("color", new BufferAttribute(colors, 3));
		this.galaxyPts = new Points(geo, new PointsMaterial({
			vertexColors: true,
			size: Math.min(.38, this.profile.galaxySize * .45),
			transparent: true,
			opacity: .42,
			blending: 2,
			depthWrite: false,
			sizeAttenuation: true
		}));
		this.group.add(this.galaxyPts);
	}
	quenchRune(name) {
		const id = `rune-${name}`;
		for (const s of this.swarms) if (s.id === id) s.alive = false;
	}
	gift(kind, x, z) {
		this.addCrate(kind, x, .5, z);
	}
	setDetail(high) {
		if (this.skyPts) this.skyPts.visible = high;
		if (this.galaxyPts) this.galaxyPts.visible = high;
	}
	syncMoment(opts) {
		this.emberOn = opts.ember;
		this.tide = opts.tide > 0 ? -1.8 : 1;
		if (this.emberField) this.emberField.visible = opts.ember;
		if (this.wellField) this.wellField.visible = opts.jump > 1.4;
		if (this.domeHint) this.domeHint.visible = opts.resist > 0;
		const e = this.mats.energy;
		if (e instanceof MeshBasicMaterial) e.opacity = opts.night > 1.8 ? .45 : .92;
	}
	setGateOpen(open) {
		this.gateOpen = open;
		if (this.gateMesh) this.gateMesh.visible = !open;
		if (this.gateCollider) this.gateCollider.maxY = open ? -1 : 11;
	}
	getZone(x, y, z) {
		if (y > 4 && x < -32 && z < -18) return {
			id: "nyxara",
			name: "The Night Ascendant"
		};
		if (Math.abs(x) < 20 && z > -22 && z < 24) return {
			id: "eryndra",
			name: "The Eternal Throne"
		};
		if (z < -60) return {
			id: "vaelith",
			name: "Court of the First Flame"
		};
		if (x < -58) return {
			id: "rynara",
			name: "The Rune Archive"
		};
		if (x > 58) return {
			id: "sanguara",
			name: "Blood Canals"
		};
		if (z > 50) return {
			id: "plaza",
			name: "The Threshold"
		};
		if (z > 22) return {
			id: "stair",
			name: "Grand Staircase"
		};
		return {
			id: "approach",
			name: "Palace Approach"
		};
	}
	update(t) {
		for (const b of this.bobbers) {
			b.o.position.y = b.y + Math.sin(t * 1.6 + b.p) * .16;
			b.o.rotation.y = t * .7 + b.p;
		}
		const e = this.mats.energy;
		if (e instanceof MeshBasicMaterial && e.map) e.map.offset.y = t * .12 * this.tide % 1;
		if (this.emberField) {
			const mat = this.emberField.material;
			mat.opacity = .28 + Math.sin(t * 6) * .14;
		}
		if (this.wellField) {
			this.wellField.rotation.z = t * .7;
			const mat = this.wellField.material;
			mat.opacity = .18 + Math.sin(t * 2.2) * .1;
		}
		if (this.floatInst) this.floatInst.rotation.y = t * .04 * this.skySpin;
		if (this.skyPts) {
			this.skyPts.rotation.y = t * .012;
			const mat = this.skyPts.material;
			mat.opacity = .4 + Math.sin(t * 1.3) * .18;
		}
		if (this.galaxyPts) this.galaxyPts.rotation.y = t * .008 * this.skySpin;
		const dt = 1 / 60;
		for (const s of this.swarms) {
			const pos = s.pts.geometry.getAttribute("position");
			const arr = pos.array;
			const mat = s.pts.material;
			if (!s.alive) {
				mat.opacity = Math.max(0, mat.opacity - .02);
				s.pts.visible = mat.opacity > .02;
				continue;
			}
			for (let i = 0; i < pos.count; i++) {
				const i3 = i * 3;
				arr[i3] = (arr[i3] ?? 0) + (s.vel[i3] ?? 0) * dt + Math.sin(t * 2 + i) * .008;
				arr[i3 + 1] = (arr[i3 + 1] ?? 0) + (s.vel[i3 + 1] ?? 0) * dt;
				arr[i3 + 2] = (arr[i3 + 2] ?? 0) + (s.vel[i3 + 2] ?? 0) * dt + Math.cos(t * 1.7 + i) * .008;
				if ((arr[i3 + 1] ?? 0) > 12) {
					arr[i3] = (this.rng() - .5) * 4.6;
					arr[i3 + 1] = 0;
					arr[i3 + 2] = (this.rng() - .5) * 4.6;
				}
			}
			pos.needsUpdate = true;
		}
	}
	dispose() {
		this.group.traverse((o) => {
			const m = o;
			if (m.geometry) m.geometry.dispose();
		});
	}
};
var SpatialHash = class {
	cell;
	map = /* @__PURE__ */ new Map();
	all = [];
	constructor(cell = 8) {
		this.cell = cell;
	}
	rebuild(list) {
		this.all = list;
		this.map.clear();
		const c = this.cell;
		for (const b of list) {
			const x0 = Math.floor(b.minX / c);
			const x1 = Math.floor(b.maxX / c);
			const z0 = Math.floor(b.minZ / c);
			const z1 = Math.floor(b.maxZ / c);
			for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) {
				const k = `${x},${z}`;
				let arr = this.map.get(k);
				if (!arr) {
					arr = [];
					this.map.set(k, arr);
				}
				arr.push(b);
			}
		}
	}
	query(x, z, r) {
		const c = this.cell;
		const x0 = Math.floor((x - r) / c);
		const x1 = Math.floor((x + r) / c);
		const z0 = Math.floor((z - r) / c);
		const z1 = Math.floor((z + r) / c);
		const seen = /* @__PURE__ */ new Set();
		const out = [];
		for (let ix = x0; ix <= x1; ix++) for (let iz = z0; iz <= z1; iz++) {
			const arr = this.map.get(`${ix},${iz}`);
			if (!arr) continue;
			for (const b of arr) {
				if (seen.has(b)) continue;
				seen.add(b);
				out.push(b);
			}
		}
		return out;
	}
	querySegment(x0, z0, x1, z1, r) {
		const mx = (x0 + x1) * .5;
		const mz = (z0 + z1) * .5;
		const span = Math.max(Math.abs(x1 - x0), Math.abs(z1 - z0)) * .5 + r;
		return this.query(mx, mz, span);
	}
};
/** First hit t in [0,1] of a moving sphere vs an AABB, or null. */
function sweepSphereAABB(x0, y0, z0, x1, y1, z1, r, b) {
	const minX = b.minX - r;
	const maxX = b.maxX + r;
	const minY = b.minY - r;
	const maxY = b.maxY + r;
	const minZ = b.minZ - r;
	const maxZ = b.maxZ + r;
	const dx = x1 - x0;
	const dy = y1 - y0;
	const dz = z1 - z0;
	let tmin = 0;
	let tmax = 1;
	const slabs = [
		[
			minX,
			maxX,
			x0,
			dx
		],
		[
			minY,
			maxY,
			y0,
			dy
		],
		[
			minZ,
			maxZ,
			z0,
			dz
		]
	];
	for (const [mn, mx, p, d] of slabs) {
		if (Math.abs(d) < 1e-8) {
			if (p < mn || p > mx) return null;
			continue;
		}
		let t1 = (mn - p) / d;
		let t2 = (mx - p) / d;
		if (t1 > t2) {
			const tmp = t1;
			t1 = t2;
			t2 = tmp;
		}
		tmin = Math.max(tmin, t1);
		tmax = Math.min(tmax, t2);
		if (tmin > tmax) return null;
	}
	return tmin;
}
var clock = { value: 0 };
var octaves = { value: 4 };
var KIND_DEFAULTS = {
	floor: {
		color: 13153448,
		crack: 16718362,
		glow: 1.55,
		scale: 2.6,
		displace: 0,
		metal: .18,
		rough: .68,
		emis: .38
	},
	wall: {
		color: 12100764,
		crack: 16720435,
		glow: 1.35,
		scale: 3.4,
		displace: 0,
		metal: .22,
		rough: .58,
		emis: .32
	},
	column: {
		color: 13678768,
		crack: 16724804,
		glow: 1.65,
		scale: 4.2,
		displace: .004,
		metal: .28,
		rough: .48,
		emis: .4
	},
	armor: {
		color: 2758684,
		crack: 16718378,
		glow: 1.9,
		scale: 6.4,
		displace: .006,
		metal: .78,
		rough: .28,
		emis: .55
	},
	blade: {
		color: 3803664,
		crack: 16711731,
		glow: 2.6,
		scale: 8.2,
		displace: .003,
		metal: .84,
		rough: .18,
		emis: 1.05
	},
	ember: {
		color: 16729088,
		crack: 16737826,
		glow: 2.8,
		scale: 5.4,
		displace: .005,
		metal: .22,
		rough: .28,
		emis: 1.5
	}
};
var CRACK_GLSL = `
uniform float uTime;
uniform float uCrackScale;
uniform float uOctaves;
uniform vec3 uCrackColor;
uniform float uGlowIntensity;
varying vec3 vCrystalPos;

float hashCr(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453123); }
float noiseCr(vec3 p) {
  vec3 i = floor(p); vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hashCr(i), hashCr(i + vec3(1,0,0)), f.x),
                 mix(hashCr(i + vec3(0,1,0)), hashCr(i + vec3(1,1,0)), f.x), f.y),
            mix(mix(hashCr(i + vec3(0,0,1)), hashCr(i + vec3(1,0,1)), f.x),
                 mix(hashCr(i + vec3(0,1,1)), hashCr(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float fbmCr(vec3 p) {
  float v = 0.0; float a = 0.5;
  for (int i = 0; i < 5; i++) {
    if (float(i) >= uOctaves) break;
    v += a * noiseCr(p); p = p * 2.11 + 1.7; a *= 0.5;
  }
  return v;
}
`;
/** Immediate canvas so materials never upload an empty image. */
function procCrystalCanvas(kind) {
	const c = document.createElement("canvas");
	c.width = c.height = 256;
	const g = c.getContext("2d");
	if (!g) return c;
	const dark = kind === "armor" || kind === "blade" ? "#14080a" : kind === "ember" ? "#3a0c08" : "#2a1614";
	const mid = kind === "armor" || kind === "blade" ? "#1c0c10" : "#4a2a24";
	g.fillStyle = dark;
	g.fillRect(0, 0, 256, 256);
	for (let i = 0; i < 48; i++) {
		const x = i * 47 % 256;
		const y = i * 89 % 256;
		g.fillStyle = mid;
		g.globalAlpha = .18 + i % 5 * .04;
		g.fillRect(x, y, 18 + i % 12, 10 + i % 8);
	}
	g.globalAlpha = 1;
	g.strokeStyle = kind === "ember" ? "#ff6622" : "#ff1a2a";
	g.lineWidth = kind === "blade" ? 1.4 : 2.2;
	g.globalCompositeOperation = "lighter";
	for (let i = 0; i < 14; i++) {
		g.beginPath();
		let x = i * 37 % 256;
		let y = 0;
		g.moveTo(x, y);
		while (y < 256) {
			x += Math.sin((i + 1) * 1.7 + y * .04) * 18;
			y += 18;
			g.lineTo(x, y);
		}
		g.stroke();
	}
	g.globalCompositeOperation = "source-over";
	g.globalAlpha = .35;
	g.fillStyle = "#0a0406";
	for (let i = 0; i < 30; i++) g.fillRect(i * 53 % 256, i * 97 % 256, 6, 6);
	return c;
}
function createCrystalMaterial(opts) {
	const d = KIND_DEFAULTS[opts.kind];
	const mat = new MeshStandardMaterial({
		color: opts.color ?? d.color,
		map: opts.map ?? null,
		roughness: d.rough,
		metalness: d.metal,
		emissive: new Color(opts.crack ?? d.crack),
		emissiveIntensity: d.emis,
		envMapIntensity: .7,
		fog: true
	});
	const crack = new Color(opts.crack ?? d.crack);
	const glow = opts.glow ?? d.glow;
	const scale = opts.scale ?? d.scale;
	const disp = opts.displace ?? d.displace;
	mat.onBeforeCompile = (shader) => {
		shader.uniforms.uTime = clock;
		shader.uniforms.uCrackScale = { value: scale };
		shader.uniforms.uOctaves = octaves;
		shader.uniforms.uCrackColor = { value: crack };
		shader.uniforms.uGlowIntensity = { value: glow };
		shader.vertexShader = shader.vertexShader.replace("#include <common>", `#include <common>
      uniform float uTime;
      varying vec3 vCrystalPos;`);
		if (shader.vertexShader.includes("#include <begin_vertex>")) shader.vertexShader = shader.vertexShader.replace("#include <begin_vertex>", `#include <begin_vertex>
        transformed += objectNormal * (sin(position.x * 11.0 + position.y * 7.0 + uTime * 0.45) * ${disp.toFixed(5)});
        vec4 crystalWorld = vec4(transformed, 1.0);
        #ifdef USE_BATCHING
          crystalWorld = batchingMatrix * crystalWorld;
        #endif
        #ifdef USE_INSTANCING
          crystalWorld = instanceMatrix * crystalWorld;
        #endif
        vCrystalPos = (modelMatrix * crystalWorld).xyz;`);
		shader.fragmentShader = shader.fragmentShader.replace("#include <common>", `#include <common>
      ${CRACK_GLSL}`);
		if (shader.fragmentShader.includes("#include <opaque_fragment>")) shader.fragmentShader = shader.fragmentShader.replace("#include <opaque_fragment>", `#include <opaque_fragment>
        vec3 crPos = vCrystalPos * uCrackScale;
        float warp = fbmCr(crPos * 0.55 + uTime * 0.05);
        float crN = fbmCr(crPos + warp * 1.8 + vec3(0.0, uTime * 0.07, 0.0));
        float cracks = pow(smoothstep(0.40, 0.62, crN), 2.4);
        float pulse = 0.62 + 0.38 * sin(uTime * 2.6);
        gl_FragColor.rgb = mix(gl_FragColor.rgb, uCrackColor, cracks * 0.45);
        gl_FragColor.rgb += uCrackColor * cracks * uGlowIntensity * pulse * 0.38;`);
	};
	mat.customProgramCacheKey = () => `crystal-v3-${opts.kind}-${disp}`;
	return mat;
}
function tickCrystal(time, _fog) {
	clock.value = time;
}
function setCrystalQuality(q) {
	octaves.value = q >= 1080 ? 2 : 1;
}
function crystalMetal(opts) {
	return createCrystalMaterial({
		kind: "armor",
		color: 2758684,
		crack: opts?.ember ?? 16718362,
		glow: opts?.glow ?? 1.8
	});
}
function crystalBlade(ember = 16718362) {
	return createCrystalMaterial({
		kind: "blade",
		crack: ember,
		glow: 2.5
	});
}
function disposeCrystal() {
	clock.value = 0;
}
var matCache = /* @__PURE__ */ new Map();
function makeMats(ember) {
	return {
		plate: crystalMetal({
			ember,
			glow: 1.7
		}),
		dark: crystalMetal({
			ember: 2228232,
			glow: .8
		}),
		glow: crystalBlade(ember),
		gold: new MeshStandardMaterial({
			color: 11569738,
			metalness: .88,
			roughness: .28,
			emissive: 3807240,
			emissiveIntensity: .45
		}),
		visorGlow: new MeshStandardMaterial({
			color: ember,
			emissive: ember,
			emissiveIntensity: 1.8,
			roughness: .22,
			metalness: .4
		}),
		cloth: new MeshStandardMaterial({
			color: 1705224,
			roughness: .72,
			metalness: .08,
			emissive: ember,
			emissiveIntensity: .22
		})
	};
}
function matsFor(ember) {
	const key = String(ember >>> 0);
	let m = matCache.get(key);
	if (!m) {
		m = makeMats(ember);
		matCache.set(key, m);
	}
	return m;
}
function kindTint(kind) {
	if (kind === "vaelith" || kind === "wraith") return 16729088;
	if (kind === "rynara") return 13934615;
	if (kind === "sanguara") return 9109504;
	if (kind === "nyxara" || kind === "shade") return 6697898;
	if (kind === "eryndra") return 12852794;
	if (kind === "aelith" || kind === "boss") return 16716100;
	if (kind === "construct") return 8930372;
	return 16718362;
}
function add(mesh, parent) {
	mesh.castShadow = false;
	mesh.receiveShadow = true;
	parent.add(mesh);
	return mesh;
}
function buildKnight(opts = {}) {
	const ember = opts.ember ?? kindTint(opts.kind);
	const detail = opts.detail ?? "high";
	const segs = detail === "high" ? 8 : 5;
	const root = new Group();
	root.scale.setScalar(opts.scale ?? 1);
	const { plate, dark, glow, gold, visorGlow, cloth } = matsFor(ember);
	const hips = new Group();
	hips.position.y = .92;
	root.add(hips);
	add(new Mesh(new BoxGeometry(.38, .22, .22), plate), hips).position.y = .02;
	add(new Mesh(new BoxGeometry(.46, .08, .26), gold), hips).position.y = .14;
	const skirt = new Mesh(new BoxGeometry(.5, .42, .18), cloth);
	skirt.position.set(0, -.28, -.04);
	hips.add(skirt);
	const chest = new Group();
	chest.position.y = 1.28;
	root.add(chest);
	add(new Mesh(new BoxGeometry(.46, .48, .28), plate), chest);
	add(new Mesh(new BoxGeometry(.18, .34, .06), glow), chest).position.set(0, .02, .16);
	add(new Mesh(new BoxGeometry(.52, .08, .3), gold), chest).position.y = .22;
	if (detail === "high") {
		add(new Mesh(new BoxGeometry(.12, .2, .08), plate), chest).position.set(-.16, -.02, .14);
		add(new Mesh(new BoxGeometry(.12, .2, .08), plate), chest).position.set(.16, -.02, .14);
		add(new Mesh(new BoxGeometry(.5, .06, .32), plate), chest).position.y = -.22;
		const sternum = new Mesh(new BoxGeometry(.06, .36, .04), visorGlow);
		sternum.position.set(0, .02, .17);
		chest.add(sternum);
	}
	const makeArm = (side) => {
		const g = new Group();
		g.position.set(side * .3, 1.42, 0);
		const pauldron = new Mesh(new SphereGeometry(.13, segs, 6, 0, Math.PI * 2, 0, Math.PI * .7), plate);
		pauldron.scale.set(1.15, .7, 1.05);
		pauldron.position.set(side * .04, .02, 0);
		g.add(pauldron);
		const upper = new Mesh(new CylinderGeometry(.055, .07, .32, segs), plate);
		upper.position.y = -.2;
		g.add(upper);
		const lower = new Group();
		lower.position.y = -.36;
		const gaunt = new Mesh(new CylinderGeometry(.045, .055, .3, segs), plate);
		gaunt.position.y = -.14;
		lower.add(gaunt);
		g.add(lower);
		root.add(g);
		return {
			g,
			lower
		};
	};
	const left = makeArm(-1);
	const right = makeArm(1);
	const hand = new Object3D();
	hand.position.set(0, -.3, -.02);
	right.lower.add(hand);
	const makeLeg = (side) => {
		const g = new Group();
		g.position.set(side * .12, .78, 0);
		const thigh = new Mesh(new CylinderGeometry(.07, .08, .38, segs), plate);
		thigh.position.y = -.18;
		g.add(thigh);
		const shin = new Group();
		shin.position.y = -.38;
		const greave = new Mesh(new CylinderGeometry(.055, .07, .4, segs), plate);
		greave.position.y = -.18;
		shin.add(greave);
		const boot = new Mesh(new BoxGeometry(.12, .08, .22), dark);
		boot.position.set(0, -.4, .04);
		shin.add(boot);
		g.add(shin);
		root.add(g);
		return {
			g,
			shin
		};
	};
	const leftLeg = makeLeg(-1);
	const rightLeg = makeLeg(1);
	const head = new Group();
	head.position.y = 1.62;
	root.add(head);
	add(new Mesh(new SphereGeometry(.145, segs + 2, segs), plate), head);
	const helm = new Mesh(new SphereGeometry(.16, segs + 2, 8, 0, Math.PI * 2, 0, Math.PI * .58), plate);
	helm.position.y = .02;
	head.add(helm);
	const visor = new Group();
	visor.position.set(0, 0, .12);
	head.add(visor);
	add(new Mesh(new BoxGeometry(.2, .07, .04), visorGlow), visor);
	const slit = new Mesh(new BoxGeometry(.22, .03, .02), new MeshBasicMaterial({
		color: ember,
		toneMapped: false
	}));
	slit.position.set(0, 0, .03);
	visor.add(slit);
	const faceMat = new MeshBasicMaterial({
		map: opts.face ?? null,
		color: opts.face ? 16777215 : ember,
		toneMapped: false,
		transparent: true,
		opacity: opts.face ? .92 : .35
	});
	if (opts.face) {
		opts.face.colorSpace = SRGBColorSpace;
		opts.face.wrapS = opts.face.wrapT = ClampToEdgeWrapping;
		opts.face.anisotropy = 8;
	}
	const faceMesh = new Mesh(new CircleGeometry(.07, 16), faceMat);
	faceMesh.position.set(0, .01, .03);
	visor.add(faceMesh);
	if (opts.crown !== false && detail === "high") {
		for (let i = 0; i < 7; i++) {
			const spike = new Mesh(new ConeGeometry(.016, .14 + (i === 3 ? .12 : i % 2 ? .04 : 0), 5), glow);
			const a = i / 6 * 1 - .5;
			spike.position.set(Math.sin(a) * .11, .16, Math.cos(a) * .09);
			spike.rotation.z = -a * .55;
			head.add(spike);
		}
		const band = new Mesh(new TorusGeometry(.13, .018, 6, 12), visorGlow);
		band.rotation.x = Math.PI / 2;
		band.position.y = .08;
		head.add(band);
	}
	const cape = [];
	if (opts.cape !== false && detail === "high") for (let i = 0; i < 6; i++) {
		const ribbon = new Mesh(new BoxGeometry(.14 - i * .008, .92, .028), cloth);
		ribbon.position.set((i - 2.5) * .07, 1.02, -.2);
		ribbon.userData.baseY = ribbon.position.y;
		root.add(ribbon);
		cape.push(ribbon);
	}
	const weapon = opts.weapon ?? "greatsword";
	if (weapon === "greatsword") {
		const blade = new Mesh(new BoxGeometry(.045, .05, 1.12), glow);
		blade.position.set(0, 0, -.58);
		hand.add(blade);
		const crack = new Mesh(new BoxGeometry(.018, .018, 1.08), new MeshBasicMaterial({
			color: ember,
			toneMapped: false
		}));
		crack.position.set(0, .03, -.58);
		hand.add(crack);
		const hilt = new Mesh(new CylinderGeometry(.022, .028, .18, 6), gold);
		hilt.rotation.x = Math.PI / 2;
		hilt.position.set(0, 0, .06);
		hand.add(hilt);
		const guard = new Mesh(new BoxGeometry(.26, .04, .045), gold);
		guard.position.set(0, 0, -.04);
		hand.add(guard);
	} else if (weapon === "hammer") {
		const shaft = new Mesh(new CylinderGeometry(.02, .024, .7, 6), dark);
		shaft.rotation.x = Math.PI / 2;
		shaft.position.z = -.28;
		hand.add(shaft);
		const headM = new Mesh(new BoxGeometry(.22, .22, .16), glow);
		headM.position.set(0, .02, -.62);
		hand.add(headM);
	} else if (weapon === "staff") {
		const shaft = new Mesh(new CylinderGeometry(.018, .022, 1.05, 6), gold);
		shaft.rotation.x = Math.PI / 2;
		shaft.position.z = -.4;
		hand.add(shaft);
		hand.add(new Mesh(new OctahedronGeometry(.09, 0), glow)).position.set(0, .02, -.88);
	} else if (weapon === "scythe") {
		const shaft = new Mesh(new CylinderGeometry(.016, .02, 1.05, 6), dark);
		shaft.rotation.x = Math.PI / 2;
		shaft.position.z = -.4;
		hand.add(shaft);
		const blade = new Mesh(new BoxGeometry(.42, .04, .1), glow);
		blade.position.set(.16, .08, -.88);
		blade.rotation.y = .4;
		hand.add(blade);
	} else if (weapon === "rifle") {
		const body = new Mesh(new BoxGeometry(.08, .1, .48), dark);
		body.position.z = -.22;
		hand.add(body);
		const barrel = new Mesh(new CylinderGeometry(.02, .024, .4, 6), plate);
		barrel.rotation.x = Math.PI / 2;
		barrel.position.z = -.52;
		hand.add(barrel);
	}
	return {
		root,
		head,
		chest,
		hips,
		leftArm: left.g,
		rightArm: right.g,
		leftLeg: leftLeg.g,
		rightLeg: rightLeg.g,
		hand,
		visor,
		cape,
		worldGuns: [],
		faceMat,
		armor: [
			plate,
			dark,
			glow,
			visorGlow,
			cloth,
			gold
		]
	};
}
function buildHunter(face, _dress, ember) {
	return buildKnight({
		face,
		ember,
		weapon: "greatsword",
		cape: true,
		crown: true,
		detail: "high",
		kind: "nave"
	});
}
function buildEnemyFigure(kind, face) {
	return buildKnight({
		...{
			wraith: {
				weapon: "none",
				cape: true,
				crown: false,
				detail: "low",
				scale: .95
			},
			sentinel: {
				weapon: "rifle",
				cape: false,
				crown: true,
				detail: "low",
				scale: 1.12
			},
			construct: {
				weapon: "hammer",
				cape: false,
				crown: false,
				detail: "low",
				scale: 1.35
			},
			shade: {
				weapon: "none",
				cape: true,
				crown: false,
				detail: "low",
				scale: .88
			},
			boss: {
				weapon: "greatsword",
				cape: true,
				crown: true,
				detail: "high",
				scale: 1.85
			},
			nave: {
				weapon: "greatsword",
				cape: true,
				crown: true,
				detail: "high",
				scale: 1.08
			},
			vaelith: {
				weapon: "hammer",
				cape: true,
				crown: true,
				detail: "high"
			},
			rynara: {
				weapon: "staff",
				cape: true,
				crown: true,
				detail: "high"
			},
			sanguara: {
				weapon: "scythe",
				cape: true,
				crown: true,
				detail: "high"
			},
			nyxara: {
				weapon: "rifle",
				cape: true,
				crown: true,
				detail: "high"
			},
			eryndra: {
				weapon: "staff",
				cape: true,
				crown: true,
				detail: "high"
			},
			aelith: {
				weapon: "greatsword",
				cape: true,
				crown: true,
				detail: "high",
				scale: 1.2
			}
		}[kind] ?? {
			weapon: "greatsword",
			detail: "low"
		},
		face: face ?? null,
		ember: kindTint(kind),
		kind
	});
}
function poseHunter(rig, bob, grounded, speed, pitch, view, time = bob, lookYaw = 0) {
	const moving = Math.min(1, speed / 6.5);
	const idle = 1 - moving;
	const breath = Math.sin(time * 2.15) * .018 * (.45 + idle);
	const shift = Math.sin(time * .85) * .03 * idle;
	if (rig.chest) {
		rig.chest.position.y = 1.28 + breath;
		rig.chest.scale.set(1, 1 + breath * 1.4, 1);
	}
	if (rig.hips) {
		rig.hips.rotation.z = shift;
		rig.hips.position.y = .92 + Math.abs(shift) * .1;
	}
	const swing = Math.sin(bob) * moving * .55;
	rig.leftArm.rotation.x = swing + breath * .4;
	rig.rightArm.rotation.x = -swing * .55 - .35 + breath * .2;
	rig.leftArm.rotation.z = .12 + shift;
	rig.rightArm.rotation.z = -.12 + shift;
	rig.leftLeg.rotation.x = grounded ? -swing : -.45;
	rig.rightLeg.rotation.x = grounded ? swing : .28;
	rig.head.rotation.x = MathUtils.clamp(pitch * .28 + breath * .4, -.5, .5);
	rig.head.rotation.y = MathUtils.damp(rig.head.rotation.y, MathUtils.clamp(lookYaw, -.55, .55), 6, .016);
	if (rig.visor) {
		const wake = .7 + .3 * Math.sin(time * 3.1);
		rig.visor.scale.set(1, .85 + wake * .15, 1);
	}
	if (rig.cape) for (let i = 0; i < rig.cape.length; i++) {
		const c = rig.cape[i];
		if (!c) continue;
		const flutter = Math.sin(time * (1.6 + i * .35) + i) * (.08 + moving * .22);
		c.rotation.x = .18 + moving * .35 + flutter;
		c.rotation.z = (i - 2.5) * .035 + shift * .4;
	}
	if (rig.worldGuns) for (let i = 0; i < rig.worldGuns.length; i++) rig.worldGuns[i].visible = i === view;
}
var FX = [
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
	"skySpin"
];
var ZONES = [
	"Vaelith",
	"Rynara",
	"Sanguara",
	"Nyxara",
	"Eryndra",
	"Aelith",
	"Palace",
	"Threshold",
	"Ember Court",
	"Law Archive",
	"Blood Canal",
	"Sky Stair",
	"Gate",
	"Core",
	"Spire",
	"Rift"
];
var VERBS = [
	"Storm",
	"Surge",
	"Collapse",
	"Awakening",
	"Pulse",
	"Cascade",
	"Frenzy",
	"Rift",
	"Bloom",
	"Silence",
	"Inferno",
	"Flood",
	"Vortex",
	"Siege",
	"Echo",
	"Fracture",
	"Overdrive",
	"Singularity",
	"Tide",
	"Quake",
	"Breath",
	"Veil",
	"Howl",
	"Crown",
	"Hymn",
	"Ash",
	"Orbit",
	"Mirror",
	"Lance",
	"Dirge"
];
var DETAILS = [
	"under the galactic arms",
	"across the Threshold",
	"between the black spires",
	"while the palace breathes",
	"along the living canals",
	"on the sky stairs",
	"at the still point of the throne",
	"as the first flame remembers",
	"through rewritten law",
	"in the red dark"
];
/** id, name, description, duration — fx derived from id */
var NAMED = [
	[
		1,
		"Vaelith Ember Storm",
		"Pylons erupt. The north floor burns.",
		25
	],
	[
		2,
		"Rynara Script Collapse",
		"Monoliths rewrite the air. Enemies drag.",
		20
	],
	[
		3,
		"Sanguara Tide Surge",
		"Rivers reverse. Shades leap from the canals.",
		18
	],
	[
		4,
		"Nyxara Gravity Well",
		"Jump height triples while the stairs tilt.",
		20
	],
	[
		5,
		"Palace Breath",
		"Red tendrils spin the floating runes.",
		30
	],
	[
		6,
		"Sentinel Overcharge",
		"Sentinels fire faster for a short storm.",
		15
	],
	[
		7,
		"Rune Echo",
		"The last claimed Name echoes as a floating gift.",
		40
	],
	[
		8,
		"Nightfall Pulse",
		"The grounds go black. Only runes remain.",
		25
	],
	[
		9,
		"Construct Awakening",
		"Sleeping constructs rise near the gate.",
		0
	],
	[
		10,
		"Aelith Whisper",
		"A verse plays. Vital returns.",
		8
	],
	[
		11,
		"Spark Cascade",
		"Spark Rifle drinks infinite coil.",
		20
	],
	[
		12,
		"Law Rewrite",
		"Enemy pathing fractures. They wander.",
		10
	],
	[
		13,
		"Blood Rain",
		"Sanguine Pulse deals double.",
		18
	],
	[
		14,
		"Ankh Resonance",
		"The Ankh charges twice as fast.",
		25
	],
	[
		15,
		"Threshold Quake",
		"The plaza staggers every living thing.",
		0
	],
	[
		16,
		"Spire Realignment",
		"Distant spires turn. The sky writes cover.",
		35
	],
	[
		17,
		"Shade Swarm",
		"Twelve shades claw out of the canals.",
		0
	],
	[
		18,
		"Vital Bloom",
		"Health orbs double their gift.",
		30
	],
	[
		19,
		"Rune Storm",
		"Temporary runes rain across the grounds.",
		22
	],
	[
		20,
		"Palace Heartbeat",
		"The map pulses. Enemies reel.",
		12
	],
	[
		21,
		"Ember Cascade",
		"Vaelith pylons throw fire across the north.",
		18
	],
	[
		22,
		"Hieroglyph Flood",
		"Rynara scripts slow every hunter.",
		15
	],
	[
		23,
		"Crimson Undertow",
		"Canals pull bodies toward the east.",
		20
	],
	[
		24,
		"Eclipse Fracture",
		"Zero-gravity pockets open in the sky stairs.",
		22
	],
	[
		25,
		"Tendril Grasp",
		"Red energy flings the nearest shade.",
		8
	],
	[
		26,
		"Sentinel Cascade",
		"Sentinels overcharge until they burst.",
		0
	],
	[
		27,
		"Echo Cascade",
		"Claimed Names echo as floating orbs.",
		35
	],
	[
		28,
		"Absolute Dark",
		"Total blackout. Rune glow only.",
		25
	],
	[
		29,
		"Gate Pulse",
		"The palace gate flashes and bites nearby constructs.",
		6
	],
	[
		30,
		"Verse Regen",
		"Aelith’s verse restores you once.",
		5
	],
	[
		31,
		"Spark Overload",
		"Spark rounds detonate on impact.",
		20
	],
	[
		32,
		"Path Inversion",
		"Hunters reverse and hunt each other.",
		12
	],
	[
		33,
		"Pulse Frenzy",
		"Sanguine Pulse triples its rate.",
		15
	],
	[
		34,
		"Beam Singularity",
		"The Ankh lance pulls what it touches.",
		20
	],
	[
		35,
		"North Rift",
		"A new gift appears beyond Vaelith.",
		0
	],
	[
		36,
		"Spire Collapse",
		"A distant spire falls into cover.",
		0
	],
	[
		37,
		"Canal Breach",
		"Shades erupt from the east canals.",
		0
	],
	[
		38,
		"Orb Storm",
		"Health orbs rain across the Threshold.",
		25
	],
	[
		39,
		"Temporary Name",
		"A sixth rune appears, then vanishes.",
		40
	],
	[
		40,
		"Heartbeat Slam",
		"A map-wide pulse staggers everyone.",
		4
	],
	[
		41,
		"Ember Bridge",
		"Fire walks between the northern pylons.",
		30
	],
	[
		42,
		"Law Cage",
		"Monoliths trap nearby hunters.",
		15
	],
	[
		43,
		"Blood Mirror",
		"A dome turns their fire aside.",
		18
	],
	[
		44,
		"Ascendant Lift",
		"Nyxara jump becomes flight.",
		25
	],
	[
		45,
		"Breath Wall",
		"Red energy walls the east canal.",
		20
	],
	[
		46,
		"Overcharge Chain",
		"A sentinel death wakes two more.",
		0
	],
	[
		47,
		"Rune Magnet",
		"Unclaimed runes drift toward you.",
		30
	],
	[
		48,
		"Starless Night",
		"Darkness. Shade spawn rises.",
		40
	],
	[
		49,
		"Construct March",
		"Sleeping constructs walk the gate.",
		0
	],
	[
		50,
		"Whisper Barrage",
		"Five verses. Slow vital return.",
		12
	],
	[
		51,
		"Infinite Coil",
		"Spark Rifle never reloads.",
		30
	],
	[
		52,
		"AI Fracture",
		"Enemies strike each other.",
		8
	],
	[
		53,
		"Double Pulse",
		"Sanguine Pulse splits its stream.",
		18
	],
	[
		54,
		"Charged Lance",
		"The Ankh begins already hungry.",
		25
	],
	[
		55,
		"Quake Path",
		"The north floor cracks and burns.",
		0
	],
	[
		56,
		"Bridge Network",
		"Sky runes spin into bridges.",
		40
	],
	[
		57,
		"Shade Tide",
		"Waves of shades from the canals.",
		0
	],
	[
		58,
		"Vital Overflow",
		"The next health gift triples.",
		20
	],
	[
		59,
		"Sky Runes",
		"Falling runes bless the arms.",
		25
	],
	[
		60,
		"Pulse Silence",
		"The heartbeat stuns the hunt.",
		15
	],
	[
		61,
		"Vaelith Inferno",
		"The entire north court is fire.",
		22
	],
	[
		62,
		"Script Barricade",
		"Law slows everything that walks.",
		0
	],
	[
		63,
		"Reverse Current",
		"Canals boil. Shades climb.",
		18
	],
	[
		64,
		"Gravity Spike",
		"Jump ×5, then the drop.",
		12
	],
	[
		65,
		"Tendril Highway",
		"Floating runes race the grounds.",
		35
	],
	[
		66,
		"Sentinel Rain",
		"Sentinels fall already overcharged.",
		0
	],
	[
		67,
		"Echo Legion",
		"Copies of the last Name appear.",
		30
	],
	[
		68,
		"Rune Vision Only",
		"Everything but runes and hunters goes black.",
		20
	],
	[
		69,
		"Awakened Horde",
		"Every construct on the map stands.",
		0
	],
	[
		70,
		"Full Verse",
		"The Six Names poem. Full heal.",
		10
	],
	[
		71,
		"Explosive Spark",
		"Spark rounds explode on impact.",
		20
	],
	[
		72,
		"Enemy Confusion",
		"They forget you and wander.",
		15
	],
	[
		73,
		"Blood Overflow",
		"Sanguine Pulse never empties.",
		25
	],
	[
		74,
		"Instant Beam",
		"The Ankh charges in a breath.",
		20
	],
	[
		75,
		"Rift Gate",
		"A gift tears open near the gate.",
		15
	],
	[
		76,
		"Spire Dance",
		"Spires rotate. Cover moves.",
		40
	],
	[
		77,
		"Canal Eruption",
		"Water explodes. Shades launch.",
		0
	],
	[
		78,
		"Health Rain",
		"Vital rainfall across the plaza.",
		45
	],
	[
		79,
		"Name Cascade",
		"Temporary runes fall at once.",
		20
	],
	[
		80,
		"Heartbeat Frenzy",
		"Pulses stun the hunt.",
		18
	],
	[
		81,
		"Ember Vortex",
		"Northern pylons become a fire storm.",
		25
	],
	[
		82,
		"Law Storm",
		"Hieroglyphs slow every hunter.",
		20
	],
	[
		83,
		"Crimson Flood",
		"East canals overflow with shades.",
		30
	],
	[
		84,
		"Night Platform",
		"Darkness. The stairs lift you.",
		35
	],
	[
		85,
		"Breath Cage",
		"A red dome around you.",
		15
	],
	[
		86,
		"Chain Reaction",
		"Killing a sentinel detonates others.",
		0
	],
	[
		87,
		"Rune Orbit",
		"Claimed Names bless the arms.",
		40
	],
	[
		88,
		"Total Eclipse",
		"Long night. The hunt sees you.",
		60
	],
	[
		89,
		"Construct Siege",
		"Constructs wall the gate.",
		0
	],
	[
		90,
		"Divine Regen",
		"Slow vital return.",
		30
	],
	[
		91,
		"Spark Nova",
		"Spark becomes an area blast.",
		25
	],
	[
		92,
		"Path Chaos",
		"Enemy pathing randomizes.",
		12
	],
	[
		93,
		"Pulse Overdrive",
		"Sanguine Pulse explodes.",
		20
	],
	[
		94,
		"Beam Chain",
		"The Ankh chains to nearby hunters.",
		25
	],
	[
		95,
		"Threshold Split",
		"The plaza splits and burns.",
		0
	],
	[
		96,
		"Sky Network",
		"Floating runes lock into a sky net.",
		0
	],
	[
		97,
		"Shade Apocalypse",
		"The canals empty their dead.",
		0
	],
	[
		98,
		"Orb Singularity",
		"Health orbs pull toward you.",
		20
	],
	[
		99,
		"Rune Apocalypse",
		"Temporary runes with wild gifts.",
		25
	],
	[
		100,
		"Palace Awakening",
		"The house shifts and reconfigures.",
		0
	]
];
var NAMED_FX = [
	"emberFloor",
	"slowEnemies",
	"spawnShades",
	"jumpBoost",
	"skySpin",
	"sentinelHaste",
	"runeEcho",
	"nightfall",
	"spawnConstructs",
	"healPulse",
	"infiniteSpark",
	"confuseAi",
	"pulseDouble",
	"ankhHaste",
	"stagger",
	"skySpin",
	"spawnShades",
	"healthBloom",
	"runeEcho",
	"heartbeat",
	"emberFloor",
	"slowEnemies",
	"spawnShades",
	"jumpBoost",
	"stagger",
	"sentinelHaste",
	"runeEcho",
	"nightfall",
	"gatePulse",
	"healPulse",
	"sparkExplode",
	"confuseAi",
	"pulseDouble",
	"pullLance",
	"runeEcho",
	"skySpin",
	"spawnShades",
	"healthBloom",
	"runeEcho",
	"heartbeat",
	"emberFloor",
	"slowEnemies",
	"playerDome",
	"jumpBoost",
	"playerDome",
	"spawnConstructs",
	"runeEcho",
	"nightfall",
	"spawnConstructs",
	"healPulse",
	"infiniteSpark",
	"confuseAi",
	"pulseDouble",
	"ankhHaste",
	"emberFloor",
	"skySpin",
	"spawnShades",
	"healthBloom",
	"infiniteSpark",
	"heartbeat",
	"emberFloor",
	"slowEnemies",
	"spawnShades",
	"jumpBoost",
	"skySpin",
	"spawnWraiths",
	"runeEcho",
	"nightfall",
	"spawnConstructs",
	"healPulse",
	"sparkExplode",
	"confuseAi",
	"infinitePulse",
	"ankhHaste",
	"healthBloom",
	"skySpin",
	"spawnShades",
	"healthBloom",
	"runeEcho",
	"heartbeat",
	"emberFloor",
	"slowEnemies",
	"spawnShades",
	"jumpBoost",
	"playerDome",
	"gatePulse",
	"ankhHaste",
	"nightfall",
	"spawnConstructs",
	"healPulse",
	"sparkExplode",
	"confuseAi",
	"pulseDouble",
	"chainBeam",
	"emberFloor",
	"skySpin",
	"spawnShades",
	"healthBloom",
	"runeEcho",
	"skySpin"
];
var MOMENT_COUNT = 1e4;
function getWorldMoment(id) {
	const n = ((Math.floor(id) - 1) % MOMENT_COUNT + MOMENT_COUNT) % MOMENT_COUNT + 1;
	if (n <= 100) {
		const row = NAMED[n - 1];
		return {
			id: n,
			name: row[1],
			description: row[2],
			duration: row[3],
			fx: NAMED_FX[n - 1]
		};
	}
	const z = ZONES[n % ZONES.length];
	const v = VERBS[n * 7 % VERBS.length];
	const fx = FX[n * 13 % FX.length];
	return {
		id: n,
		name: `${z} ${v}`,
		description: `${describeFx(fx)} ${DETAILS[n % DETAILS.length]}.`,
		duration: 8 + n % 40,
		fx
	};
}
function describeFx(fx) {
	return {
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
		skySpin: "floating runes race the sky"
	}[fx];
}
function padMoment(id) {
	return id.toString().padStart(4, "0");
}
function defaultFlags() {
	return {
		jumpMul: 1,
		emberFloor: false,
		night: 1,
		sentinelCd: 1,
		sparkInfinite: false,
		pulseDmg: 1,
		pulseRate: 1,
		pulseInfinite: false,
		ankhMul: 1,
		confuse: false,
		slow: 1,
		healthMul: 1,
		resist: 0,
		sparkExplode: false,
		chainBeam: false,
		pullLance: false,
		skySpin: 1,
		regen: 0,
		magnet: false,
		bloodPull: 0,
		chainDeath: false
	};
}
var SPEC = [
	{ ember: 1 },
	{ slow: .55 },
	{
		spawn: [
			"shade",
			70,
			0,
			5
		],
		tide: 4
	},
	{ jump: 3 },
	{ sky: 7 },
	{ sent: .42 },
	{ gifts: 2 },
	{ night: 2.5 },
	{ spawn: [
		"construct",
		0,
		-20,
		3
	] },
	{ heal: 28 },
	{ sparkInf: 1 },
	{ confuse: 1 },
	{ pulseDmg: 2 },
	{ ankhMul: 2 },
	{ stagger: 1 },
	{ sky: 5 },
	{ spawn: [
		"shade",
		80,
		4,
		6
	] },
	{ hpMul: 2 },
	{
		gifts: 3,
		sky: 4
	},
	{ stagger: 1 },
	{ ember: 1 },
	{ slow: .5 },
	{
		spawn: [
			"shade",
			70,
			-16,
			4
		],
		tide: 5
	},
	{
		jump: 3,
		night: 1.7
	},
	{ shove: 1 },
	{
		sent: .35,
		spawn: [
			"sentinel",
			8,
			-40,
			2
		]
	},
	{ gifts: 4 },
	{ night: 3 },
	{ bite: 1 },
	{ heal: 32 },
	{ sparkX: 1 },
	{ confuse: 1 },
	{ pulseRate: 3 },
	{ pull: 1 },
	{ gifts: 2 },
	{
		stagger: 1,
		sky: 5
	},
	{ spawn: [
		"shade",
		80,
		16,
		5
	] },
	{
		gifts: 4,
		hpMul: 2
	},
	{
		magnet: 1,
		gifts: 2
	},
	{ stagger: 1 },
	{
		ember: 1,
		sky: 4
	},
	{ slow: .4 },
	{ resist: .55 },
	{ jump: 3.6 },
	{
		resist: .5,
		sky: 3
	},
	{
		spawn: [
			"construct",
			4,
			-18,
			3
		],
		chainDeath: 1
	},
	{ magnet: 1 },
	{
		night: 2.8,
		spawn: [
			"shade",
			70,
			0,
			4
		]
	},
	{ spawn: [
		"construct",
		0,
		-22,
		4
	] },
	{
		heal: 20,
		regen: 2
	},
	{ sparkInf: 1 },
	{ confuse: 1 },
	{ pulseDmg: 2 },
	{
		ankhMul: 2,
		ankh: .75
	},
	{
		ember: 1,
		stagger: 1
	},
	{ sky: 8 },
	{ spawn: [
		"shade",
		80,
		4,
		6
	] },
	{ hpMul: 3 },
	{
		sparkInf: 1,
		sky: 5
	},
	{ stagger: 1 },
	{ ember: 1 },
	{ slow: .45 },
	{
		spawn: [
			"shade",
			70,
			0,
			5
		],
		tide: 6
	},
	{ jump: 5 },
	{ sky: 9 },
	{ spawn: [
		"wraith",
		0,
		-82,
		4
	] },
	{ gifts: 3 },
	{ night: 3.2 },
	{ spawn: [
		"construct",
		0,
		-16,
		5
	] },
	{ heal: 100 },
	{ sparkX: 1 },
	{ confuse: 1 },
	{ pulseInf: 1 },
	{ ankhMul: 4 },
	{ gifts: 2 },
	{ sky: 7 },
	{ spawn: [
		"shade",
		80,
		0,
		6
	] },
	{
		gifts: 4,
		hpMul: 2
	},
	{
		magnet: 1,
		gifts: 3
	},
	{ stagger: 1 },
	{ ember: 1 },
	{ slow: .5 },
	{
		spawn: [
			"shade",
			78,
			4,
			6
		],
		tide: 5
	},
	{
		jump: 3,
		night: 2.2
	},
	{ resist: .6 },
	{
		bite: 1,
		chainDeath: 1
	},
	{
		ankhMul: 2,
		gifts: 2
	},
	{ night: 3.2 },
	{ spawn: [
		"construct",
		0,
		-20,
		4
	] },
	{ regen: 2.4 },
	{ sparkX: 1 },
	{ confuse: 1 },
	{
		pulseDmg: 2,
		pulseRate: 2
	},
	{ chain: 1 },
	{
		ember: 1,
		stagger: 1
	},
	{ sky: 8 },
	{ spawn: [
		"shade",
		76,
		8,
		8
	] },
	{
		magnet: 1,
		hpMul: 2
	},
	{
		magnet: 1,
		gifts: 4
	},
	{
		sky: 8,
		stagger: 1,
		night: 1.5
	}
];
if (SPEC.length !== 100) throw new Error(`Named moment specs must be 100, got ${SPEC.length}`);
var OpenWorldMomentSystem = class OpenWorldMomentSystem {
	host;
	static Instance = null;
	flags = defaultFlags();
	current = null;
	remain = 0;
	tickAt = 48;
	spawned = 0;
	rng;
	constructor(code, host) {
		this.host = host;
		OpenWorldMomentSystem.Instance = this;
		this.rng = mulberry32(streamSeed(code, "owm"));
	}
	TriggerMoment(id) {
		if (this.current && this.remain > 0) this.clearFlags();
		const m = getWorldMoment(id);
		this.current = m;
		this.remain = m.duration > 0 ? m.duration : 3.2;
		this.flags = defaultFlags();
		if (m.id <= 100) this.applySpec(SPEC[m.id - 1] ?? {}, m);
		else this.applyFx(m.fx, m);
		this.host.announce(m);
	}
	TriggerRandomMoment() {
		const id = 1 + Math.floor(this.rng() * 1e4);
		this.TriggerMoment(id);
	}
	TickOpenWorld() {
		if (this.rng() < .35) this.TriggerRandomMoment();
	}
	update(dt) {
		this.tickAt -= dt;
		if (this.tickAt <= 0) {
			this.TickOpenWorld();
			this.tickAt = 30;
		}
		if (!this.current) return;
		this.remain -= dt;
		if (this.remain <= 0) this.end();
	}
	banner() {
		if (!this.current) return null;
		return {
			id: padMoment(this.current.id),
			name: this.current.name,
			desc: this.current.description
		};
	}
	dispose() {
		if (OpenWorldMomentSystem.Instance === this) OpenWorldMomentSystem.Instance = null;
	}
	end() {
		this.clearFlags();
		this.current = null;
		this.remain = 0;
		this.spawned = 0;
	}
	clearFlags() {
		this.flags = defaultFlags();
	}
	applySpec(s, m) {
		if (s.ember) this.flags.emberFloor = true;
		if (s.jump) this.flags.jumpMul = s.jump;
		if (s.night) this.flags.night = s.night;
		if (s.sent) this.flags.sentinelCd = s.sent;
		if (s.sparkInf) this.flags.sparkInfinite = true;
		if (s.pulseDmg) this.flags.pulseDmg = s.pulseDmg;
		if (s.pulseRate) this.flags.pulseRate = s.pulseRate;
		if (s.pulseInf) this.flags.pulseInfinite = true;
		if (s.ankhMul) this.flags.ankhMul = s.ankhMul;
		if (s.confuse) this.flags.confuse = true;
		if (s.slow) this.flags.slow = s.slow;
		if (s.hpMul) this.flags.healthMul = s.hpMul;
		if (s.resist) this.flags.resist = s.resist;
		if (s.sparkX) this.flags.sparkExplode = true;
		if (s.chain) this.flags.chainBeam = true;
		if (s.pull) this.flags.pullLance = true;
		if (s.sky) this.flags.skySpin = s.sky;
		if (s.regen) this.flags.regen = s.regen;
		if (s.magnet) this.flags.magnet = true;
		if (s.tide) this.flags.bloodPull = s.tide;
		if (s.chainDeath) this.flags.chainDeath = true;
		if (s.spawn) this.burst(s.spawn[0], s.spawn[1], s.spawn[2], s.spawn[3]);
		if (s.gifts) this.rainGifts(s.gifts);
		if (s.heal) this.host.heal(s.heal);
		if (s.stagger) this.host.stagger();
		if (s.ankh) this.host.chargeAnkh(s.ankh);
		if (s.bite) this.host.gateBite();
		if (s.shove) this.host.shove();
	}
	applyFx(fx, m) {
		const p = this.host.pos();
		switch (fx) {
			case "emberFloor":
				this.flags.emberFloor = true;
				break;
			case "slowEnemies":
				this.flags.slow = .6;
				break;
			case "jumpBoost":
				this.flags.jumpMul = 3;
				break;
			case "sentinelHaste":
				this.flags.sentinelCd = .45;
				break;
			case "nightfall":
				this.flags.night = 2.5;
				break;
			case "spawnShades":
				this.burst("shade", 80, 4, 5);
				break;
			case "spawnConstructs":
				this.burst("construct", 0, -18, 3);
				break;
			case "spawnWraiths":
				this.burst("wraith", 0, -82, 4);
				break;
			case "healPulse":
				this.host.heal(28);
				this.flags.regen = m.duration > 10 ? 2.2 : 0;
				break;
			case "infiniteSpark":
				this.flags.sparkInfinite = true;
				break;
			case "confuseAi":
				this.flags.confuse = true;
				break;
			case "pulseDouble":
				this.flags.pulseDmg = 2;
				break;
			case "ankhHaste":
				this.flags.ankhMul = 2;
				break;
			case "stagger":
			case "heartbeat":
				this.host.stagger();
				break;
			case "healthBloom":
				this.flags.healthMul = 2;
				this.rainGifts(3);
				break;
			case "runeEcho":
				this.host.gift("health", p.x + 2, p.z - 1);
				this.host.gift("ammo", p.x - 2, p.z + 1);
				break;
			case "infinitePulse":
				this.flags.pulseInfinite = true;
				break;
			case "sparkExplode":
				this.flags.sparkExplode = true;
				break;
			case "playerDome":
				this.flags.resist = .55;
				break;
			case "chainBeam":
				this.flags.chainBeam = true;
				break;
			case "pullLance":
				this.flags.pullLance = true;
				break;
			case "gatePulse":
				this.host.gateBite();
				break;
			case "skySpin": this.flags.skySpin = 6;
		}
	}
	rainGifts(n) {
		const p = this.host.pos();
		for (let i = 0; i < n; i++) {
			const a = i / n * Math.PI * 2;
			const kind = i % 2 === 0 ? "health" : "ammo";
			this.host.gift(kind, p.x + Math.cos(a) * 5, p.z + Math.sin(a) * 5);
		}
	}
	burst(kind, x, z, n) {
		const count = Math.min(n, 12 - this.spawned);
		for (let i = 0; i < count; i++) {
			const a = i / Math.max(1, count) * Math.PI * 2;
			this.host.spawn(kind, x + Math.cos(a) * 6, z + Math.sin(a) * 6);
			this.spawned += 1;
		}
	}
};
var FIGURE_LINES = {
	nave: [
		"I am the Nave Knight. The visor wakes when blood is near.",
		"The palace drinks names. Offer yours, or be unwritten.",
		"Hold the oath. The crimson crown still remembers the first cut."
	],
	sentinel: [
		"The nave holds. Speak, and we will hear.",
		"Cathedral steel does not sleep. The visor is already watching.",
		"Walk the Threshold. The Six Names still hunger."
	],
	vaelith: [
		"The first flame remembers every oath, child of ash.",
		"Draw near. I will teach the void how light is found.",
		"Spark still lives in the pylons. Take it, and burn true."
	],
	rynara: [
		"Law is a living script. I write while you still breathe.",
		"The stones orbit because I asked them to. Hear the clause.",
		"A name claimed without law is a wound that never closes."
	],
	sanguara: [
		"The canals are silent until you listen with the blood.",
		"I cut eternity so the rivers could learn pulse.",
		"Drink, or drown. The tide does not negotiate."
	],
	nyxara: [
		"Night is not empty. It is thicker than the storm.",
		"Climb. The stairs appear only for those who look correctly.",
		"I drink the light so the visor may wake."
	],
	eryndra: [
		"I do not rise. I do not fall. Sit, if you dare the still point.",
		"The throne is a wound that learned to be a seat.",
		"Time slows here because I asked it to wait."
	],
	aelith: [
		"All names lead to one. You already know the last syllable.",
		"Unmake me, or be written into the runes.",
		"The crown is cracked because it was born that way."
	]
};
var THRESHOLD_NPCS = [
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
		scale: 1.12
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
		scale: 1.08
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
		scale: 1.05
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
		lines: FIGURE_LINES.vaelith ?? []
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
		lines: FIGURE_LINES.rynara ?? []
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
		lines: FIGURE_LINES.sanguara ?? []
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
		lines: FIGURE_LINES.nyxara ?? []
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
		lines: FIGURE_LINES.eryndra ?? []
	}
];
var PATTERN_SHOTS = 36;
var CAM_PITCH_MAX = .22;
var CAM_YAW_MAX = .16;
var CAM_ROLL_MAX = .08;
var ARCH = {
	[VIEW.rifle]: {
		pitch: 1,
		yaw: .38,
		roll: .22,
		first: 1.18,
		ads: .48,
		camStiff: 92,
		vmStiff: 78,
		snap: .42,
		idle: .28,
		heat: .16,
		heatDecay: 1.35,
		spreadHeat: .85,
		vmZ: .055,
		vmY: .018,
		vmPitch: .11,
		vmRoll: .07,
		fov: 2.4,
		vertHold: .22,
		yawFreq: .72,
		yawAmp: .72
	},
	[VIEW.smg]: {
		pitch: .72,
		yaw: .92,
		roll: .34,
		first: .92,
		ads: .62,
		camStiff: 118,
		vmStiff: 108,
		snap: .55,
		idle: .16,
		heat: .11,
		heatDecay: 2.1,
		spreadHeat: 1.15,
		vmZ: .038,
		vmY: .012,
		vmPitch: .08,
		vmRoll: .1,
		fov: 1.6,
		vertHold: .12,
		yawFreq: 1.15,
		yawAmp: 1
	},
	[VIEW.sniper]: {
		pitch: 1.85,
		yaw: .16,
		roll: .12,
		first: 1.05,
		ads: .28,
		camStiff: 52,
		vmStiff: 46,
		snap: .28,
		idle: .55,
		heat: .55,
		heatDecay: .7,
		spreadHeat: .35,
		vmZ: .1,
		vmY: .04,
		vmPitch: .2,
		vmRoll: .05,
		fov: 5.2,
		vertHold: .55,
		yawFreq: .4,
		yawAmp: .28
	},
	[VIEW.rail]: {
		pitch: 1.35,
		yaw: .28,
		roll: .2,
		first: 1.1,
		ads: .42,
		camStiff: 74,
		vmStiff: 64,
		snap: .38,
		idle: .34,
		heat: .28,
		heatDecay: 1.05,
		spreadHeat: .55,
		vmZ: .072,
		vmY: .022,
		vmPitch: .14,
		vmRoll: .06,
		fov: 3.4,
		vertHold: .3,
		yawFreq: .55,
		yawAmp: .5
	},
	[VIEW.beam]: {
		pitch: 1.55,
		yaw: .22,
		roll: .16,
		first: 1,
		ads: .4,
		camStiff: 58,
		vmStiff: 52,
		snap: .3,
		idle: .48,
		heat: .4,
		heatDecay: .85,
		spreadHeat: .2,
		vmZ: .09,
		vmY: .03,
		vmPitch: .16,
		vmRoll: .05,
		fov: 4.4,
		vertHold: .4,
		yawFreq: .35,
		yawAmp: .32
	},
	[VIEW.caster]: {
		pitch: 1.42,
		yaw: .44,
		roll: .28,
		first: 1.08,
		ads: .55,
		camStiff: 64,
		vmStiff: 58,
		snap: .34,
		idle: .4,
		heat: .32,
		heatDecay: .95,
		spreadHeat: .4,
		vmZ: .08,
		vmY: .028,
		vmPitch: .15,
		vmRoll: .08,
		fov: 3.8,
		vertHold: .35,
		yawFreq: .5,
		yawAmp: .62
	},
	[VIEW.axe]: {
		pitch: .7,
		yaw: .55,
		roll: .45,
		first: 1,
		ads: 1,
		camStiff: 70,
		vmStiff: 62,
		snap: .36,
		idle: .32,
		heat: .2,
		heatDecay: 1.6,
		spreadHeat: 0,
		vmZ: .06,
		vmY: .04,
		vmX: .08,
		vmPitch: .28,
		vmYaw: .22,
		vmRoll: .32,
		fov: 2.2,
		melee: true,
		vertHold: .15,
		yawAmp: .8
	},
	[VIEW.sword]: {
		pitch: .45,
		yaw: .4,
		roll: .38,
		first: 1,
		ads: 1,
		camStiff: 88,
		vmStiff: 84,
		snap: .5,
		idle: .2,
		heat: .12,
		heatDecay: 2.2,
		spreadHeat: 0,
		vmZ: .035,
		vmY: .02,
		vmX: .07,
		vmPitch: .18,
		vmYaw: .28,
		vmRoll: .24,
		fov: 1.4,
		melee: true,
		yawAmp: .7
	},
	[VIEW.scythe]: {
		pitch: .55,
		yaw: .62,
		roll: .5,
		first: 1,
		ads: 1,
		camStiff: 66,
		vmStiff: 58,
		snap: .34,
		idle: .3,
		heat: .18,
		heatDecay: 1.5,
		spreadHeat: 0,
		vmZ: .05,
		vmY: .03,
		vmX: .1,
		vmPitch: .22,
		vmYaw: .32,
		vmRoll: .38,
		fov: 2,
		melee: true,
		yawAmp: .9
	},
	[VIEW.lance]: {
		pitch: .78,
		yaw: .18,
		roll: .14,
		first: 1,
		ads: 1,
		camStiff: 80,
		vmStiff: 72,
		snap: .4,
		idle: .26,
		heat: .16,
		heatDecay: 1.7,
		spreadHeat: 0,
		vmZ: .11,
		vmY: .01,
		vmX: .02,
		vmPitch: .12,
		vmYaw: .06,
		vmRoll: .08,
		fov: 1.8,
		melee: true,
		yawAmp: .25
	},
	[VIEW.hammer]: {
		pitch: 1.05,
		yaw: .32,
		roll: .28,
		first: 1,
		ads: 1,
		camStiff: 48,
		vmStiff: 42,
		snap: .26,
		idle: .42,
		heat: .3,
		heatDecay: 1.1,
		spreadHeat: 0,
		vmZ: .09,
		vmY: .05,
		vmX: .04,
		vmPitch: .32,
		vmYaw: .12,
		vmRoll: .18,
		fov: 3.2,
		melee: true,
		yawAmp: .45
	},
	[VIEW.fist]: {
		pitch: .38,
		yaw: .42,
		roll: .3,
		first: 1,
		ads: 1,
		camStiff: 110,
		vmStiff: 120,
		snap: .62,
		idle: .14,
		heat: .1,
		heatDecay: 2.6,
		spreadHeat: 0,
		vmZ: .07,
		vmY: .015,
		vmX: .05,
		vmPitch: .1,
		vmYaw: .16,
		vmRoll: .14,
		fov: 1.1,
		melee: true,
		yawAmp: .55
	}
};
var FALLBACK = {
	pitch: 1,
	yaw: .4,
	roll: .22,
	first: 1.1,
	ads: .5,
	camStiff: 86,
	vmStiff: 74,
	snap: .4,
	idle: .28,
	heat: .18,
	heatDecay: 1.4,
	spreadHeat: .7,
	vmZ: .05,
	vmY: .016,
	vmX: .012,
	vmPitch: .1,
	vmYaw: .05,
	vmRoll: .07,
	fov: 2.2,
	melee: false,
	vertHold: .2,
	yawFreq: .7,
	yawAmp: .7
};
var cache = /* @__PURE__ */ new Map();
function dampFor(stiff, punchy) {
	return 2 * Math.sqrt(Math.max(1, stiff)) * (punchy ? .58 : .78);
}
function hash01(seed, shot) {
	return mulberry32(streamSeed(seed + shot * 7919 >>> 0, "recoil-j"))();
}
function makePattern(weaponId, arch) {
	const rng = mulberry32(streamSeed(weaponId, "recoil-pattern"));
	const freq1 = arch.yawFreq * (.75 + rng() * .55);
	const freq2 = .17 + rng() * .28;
	const phase = rng() * Math.PI * 2;
	const lean = (rng() - .5) * .42;
	const jitter = .07 + rng() * .1;
	const out = /* @__PURE__ */ new Float32Array(72);
	for (let i = 0; i < PATTERN_SHOTS; i++) {
		const climb = 1 - i / 35 * (1 - arch.vertHold);
		const fan = Math.min(1, i / 5.5);
		const yaw = Math.sin(i * freq1 + phase) * arch.yawAmp * fan + Math.sin(i * freq2 * 2.1 + phase * .4) * arch.yawAmp * .35 * fan + lean * fan + (hash01(weaponId, i) - .5) * jitter * fan;
		out[i * 2] = climb;
		out[i * 2 + 1] = Math.max(-1.35, Math.min(1.35, yaw));
	}
	return out;
}
function profileFor(w) {
	const hit = cache.get(w.id);
	if (hit) return hit;
	const arch = {
		...FALLBACK,
		...ARCH[w.view] ?? {}
	};
	if (w.fire === "melee") arch.melee = true;
	if (w.automatic && !arch.melee) {
		arch.camStiff *= 1.08;
		arch.heat *= .85;
		arch.idle *= .85;
	}
	const mag = Math.max(.006, w.recoil);
	const p = {
		id: w.id,
		pattern: makePattern(w.id, arch),
		kickPitch: mag * 1.85 * arch.pitch,
		kickYaw: mag * 1.15 * arch.yaw,
		kickRoll: mag * .95 * arch.roll,
		firstShot: arch.first,
		ads: arch.ads,
		camStiff: arch.camStiff,
		camDamp: dampFor(arch.camStiff, false),
		vmStiff: arch.vmStiff,
		vmDamp: dampFor(arch.vmStiff, true),
		snap: arch.snap,
		idleReset: arch.idle,
		heatPerShot: arch.heat,
		heatDecay: arch.heatDecay,
		spreadHeat: arch.spreadHeat,
		vmKickZ: arch.vmZ * (.7 + mag * 12),
		vmKickY: arch.vmY * (.7 + mag * 10),
		vmKickX: arch.vmX * (.7 + mag * 10),
		vmPitch: arch.vmPitch * (.75 + mag * 8),
		vmYaw: arch.vmYaw * (.75 + mag * 8),
		vmRoll: arch.vmRoll * (.75 + mag * 8),
		fovPunch: arch.fov * (.6 + mag * 8),
		melee: arch.melee
	};
	cache.set(w.id, p);
	return p;
}
function spring(pos, vel, stiff, damp, dt) {
	vel += (-stiff * pos - damp * vel) * dt;
	pos += vel * dt;
	if (Math.abs(pos) < 1e-5 && Math.abs(vel) < 1e-4) return [0, 0];
	return [pos, vel];
}
var RecoilSim = class {
	camPitch = 0;
	camYaw = 0;
	camRoll = 0;
	vPitch = 0;
	vYaw = 0;
	vRoll = 0;
	vmX = 0;
	vmY = 0;
	vmZ = 0;
	vmVX = 0;
	vmVY = 0;
	vmVZ = 0;
	vmPitch = 0;
	vmYaw = 0;
	vmRoll = 0;
	vmVPitch = 0;
	vmVYaw = 0;
	vmVRoll = 0;
	fov = 0;
	vFov = 0;
	trX = 0;
	trY = 0;
	trPitch = 0;
	camTr = 0;
	shot = 0;
	idle = 0;
	heat = 0;
	weaponId = -1;
	_p = null;
	profile(w) {
		if (!w) return this._p;
		if (!this._p || this._p.id !== w.id) this._p = profileFor(w);
		return this._p;
	}
	fire(w, opts = {}) {
		const p = this.profile(w);
		if (this.weaponId !== w.id) {
			this.reset();
			this.weaponId = w.id;
		}
		if (this.idle > p.idleReset) this.shot = 0;
		const idx = this.shot % PATTERN_SHOTS;
		const pitchN = p.pattern[idx * 2] ?? 1;
		const yawN = p.pattern[idx * 2 + 1] ?? 0;
		const first = this.shot === 0 ? p.firstShot : 1;
		const ads = opts.ads && !p.melee ? p.ads : 1;
		const charge = (opts.charge ?? 0) > 0 ? .62 + opts.charge * .7 : 1;
		const shake = opts.shake === false ? .55 : 1;
		const mul = (opts.mul ?? 1) * first * ads * charge;
		const impP = p.kickPitch * pitchN * mul;
		const impY = p.kickYaw * yawN * mul;
		const impR = p.kickRoll * -yawN * mul * shake;
		const snap = p.snap;
		this.camPitch += impP * snap;
		this.camYaw += impY * snap;
		this.camRoll += impR * snap;
		this.vPitch += impP * (12 + (1 - snap) * 10);
		this.vYaw += impY * (10 + (1 - snap) * 8);
		this.vRoll += impR * (14 + (1 - snap) * 8);
		const side = yawN === 0 ? this.shot % 2 === 0 ? 1 : -1 : Math.sign(yawN) || 1;
		this.vmZ += p.vmKickZ * mul * .35;
		this.vmVZ += p.vmKickZ * mul * 18;
		this.vmY += p.vmKickY * mul * .3;
		this.vmVY += p.vmKickY * mul * 16;
		this.vmX += p.vmKickX * side * mul * .35;
		this.vmVX += p.vmKickX * side * mul * 14;
		this.vmPitch += p.vmPitch * pitchN * mul * .4;
		this.vmVPitch += p.vmPitch * pitchN * mul * 16;
		this.vmYaw += p.vmYaw * side * mul * .35;
		this.vmVYaw += p.vmYaw * side * mul * 14;
		this.vmRoll += p.vmRoll * -side * mul * .4;
		this.vmVRoll += p.vmRoll * -side * mul * 16;
		this.fov += p.fovPunch * mul * .25;
		this.vFov += p.fovPunch * mul * 10;
		this.shot += 1;
		this.idle = 0;
		this.heat = Math.min(1, this.heat + p.heatPerShot * (.65 + ads * .35));
	}
	tick(dt, w, extra) {
		const p = this.profile(w);
		const stiff = p?.camStiff ?? 86;
		const damp = p?.camDamp ?? dampFor(86, false);
		const vs = p?.vmStiff ?? 74;
		const vd = p?.vmDamp ?? dampFor(74, true);
		const heatDecay = p?.heatDecay ?? 1.4;
		this.idle += dt;
		if (p && this.idle > p.idleReset && this.shot > 0 && Math.abs(this.vPitch) < .05) this.shot = 0;
		this.heat = Math.max(0, this.heat - dt * heatDecay * (this.idle > .08 ? 1 : .35));
		let a, b;
		[a, b] = spring(this.camPitch, this.vPitch, stiff, damp, dt);
		this.camPitch = a;
		this.vPitch = b;
		[a, b] = spring(this.camYaw, this.vYaw, stiff, damp, dt);
		this.camYaw = a;
		this.vYaw = b;
		[a, b] = spring(this.camRoll, this.vRoll, stiff * 1.15, damp, dt);
		this.camRoll = a;
		this.vRoll = b;
		[a, b] = spring(this.vmX, this.vmVX, vs, vd, dt);
		this.vmX = a;
		this.vmVX = b;
		[a, b] = spring(this.vmY, this.vmVY, vs, vd, dt);
		this.vmY = a;
		this.vmVY = b;
		[a, b] = spring(this.vmZ, this.vmVZ, vs, vd, dt);
		this.vmZ = a;
		this.vmVZ = b;
		[a, b] = spring(this.vmPitch, this.vmVPitch, vs, vd, dt);
		this.vmPitch = a;
		this.vmVPitch = b;
		[a, b] = spring(this.vmYaw, this.vmVYaw, vs, vd, dt);
		this.vmYaw = a;
		this.vmVYaw = b;
		[a, b] = spring(this.vmRoll, this.vmVRoll, vs, vd, dt);
		this.vmRoll = a;
		this.vmVRoll = b;
		[a, b] = spring(this.fov, this.vFov, 70, dampFor(70, false), dt);
		this.fov = a;
		this.vFov = b;
		this.camPitch = clamp(this.camPitch, -.22, CAM_PITCH_MAX);
		this.camYaw = clamp(this.camYaw, -.16, CAM_YAW_MAX);
		this.camRoll = clamp(this.camRoll, -.08, CAM_ROLL_MAX);
		const charge = extra?.charge ?? 0;
		if (charge > .04) {
			const t = (extra?.time ?? 0) * 36;
			const s = charge * charge;
			this.trX = Math.sin(t * 1.73) * .01 * s;
			this.trY = Math.sin(t * 2.21) * .008 * s;
			this.trPitch = Math.sin(t * 1.11) * .018 * s;
			this.camTr = Math.sin(t * .9) * .004 * s;
		} else {
			this.trX = 0;
			this.trY = 0;
			this.trPitch = 0;
			this.camTr = 0;
		}
	}
	spreadMul() {
		const p = this._p;
		const heat = this.heat;
		const climb = Math.min(1, this.shot / 10);
		return 1 + heat * (p?.spreadHeat ?? .7) + climb * .12;
	}
	heat01() {
		return Math.max(this.heat, Math.min(1, Math.abs(this.camPitch) * 6 + Math.abs(this.vmZ) * 8));
	}
	reset() {
		this.camPitch = this.camYaw = this.camRoll = 0;
		this.vPitch = this.vYaw = this.vRoll = 0;
		this.vmX = this.vmY = this.vmZ = 0;
		this.vmVX = this.vmVY = this.vmVZ = 0;
		this.vmPitch = this.vmYaw = this.vmRoll = 0;
		this.vmVPitch = this.vmVYaw = this.vmVRoll = 0;
		this.fov = this.vFov = 0;
		this.trX = this.trY = this.trPitch = this.camTr = 0;
		this.shot = 0;
		this.idle = 0;
		this.heat = 0;
	}
	dump() {
		return {
			shot: this.shot,
			heat: +this.heat.toFixed(3),
			cam: [
				+this.camPitch.toFixed(4),
				+this.camYaw.toFixed(4),
				+this.camRoll.toFixed(4)
			],
			vm: [
				+this.vmX.toFixed(3),
				+this.vmY.toFixed(3),
				+this.vmZ.toFixed(3)
			]
		};
	}
};
function clamp(n, a, b) {
	return n < a ? a : n > b ? b : n;
}
var EYE = 1.58;
var RADIUS = .38;
var HEIGHT = 1.72;
var WEAPON_LAYER = 1;
function loadTexture(loader, url, repeat = 1) {
	const kind = url.includes("wall") ? "wall" : url.includes("column") ? "column" : url.includes("energy") ? "ember" : "floor";
	const t = new CanvasTexture(procCrystalCanvas(kind));
	t.colorSpace = SRGBColorSpace;
	t.wrapS = t.wrapT = RepeatWrapping;
	t.repeat.set(repeat, repeat);
	t.anisotropy = 8;
	t.generateMipmaps = true;
	t.minFilter = LinearMipmapLinearFilter;
	t.magFilter = LinearFilter;
	loader.load(url, (loaded) => {
		if (!loaded?.image) return;
		t.image = loaded.image;
		t.needsUpdate = true;
		loaded.dispose();
	});
	return t;
}
var CrimsonGame = class {
	canvas;
	renderer;
	scene = new Scene();
	camera;
	weaponCam;
	yawObj = new Object3D();
	input = new Input();
	audio = new GameAudio();
	world;
	profile;
	timer = new Timer();
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
	engine = 5;
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
	viewmodel = new Group();
	weapons = [];
	muzzle;
	muzzleT = 0;
	swayX = 0;
	swayY = 0;
	_vmRest = {
		x: .3,
		y: -.28,
		z: -.58
	};
	enemies = [];
	nextId = 1;
	projectiles = [];
	projPool = [];
	particles = [];
	partPool = [];
	partGeo = new SphereGeometry(1, 6, 6);
	partMat = new MeshBasicMaterial({
		color: 16724821,
		transparent: true,
		opacity: 1
	});
	ray = new Raycaster();
	ndc = new Vector2(0, 0);
	_f = new Vector3();
	_r = new Vector3();
	_up = new Vector3(0, 1, 0);
	_q = new Quaternion();
	_origin = new Vector3();
	_dir = new Vector3();
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
		this.renderer = new WebGLRenderer({
			canvas,
			antialias: true,
			alpha: false,
			powerPreference: "high-performance",
			preserveDrawingBuffer: true,
			failIfMajorPerformanceCaveat: false
		});
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.matchMedia("(pointer: coarse)").matches ? 1.25 : 2));
		this.renderer.setSize(canvas.clientWidth || window.innerWidth, canvas.clientHeight || window.innerHeight, false);
		this.renderer.outputColorSpace = SRGBColorSpace;
		this.renderer.toneMapping = 4;
		this.renderer.toneMappingExposure = 1.35;
		this.renderer.autoClear = false;
		this.renderer.info.autoReset = false;
		this.renderer.setClearColor(1705996, 1);
		this.renderer.debug.checkShaderErrors = true;
		this.renderer.debug.onShaderError = (gl, program, vs, fs) => {
			const vlog = gl.getShaderInfoLog(vs) || "";
			const flog = gl.getShaderInfoLog(fs) || "";
			const plog = gl.getProgramInfoLog(program) || "";
			this.lastErr = `${vlog} ${flog} ${plog}`.trim().slice(0, 280);
			console.warn("[crimson shader]", this.lastErr);
		};
		this.camera = new PerspectiveCamera(78, 1, .08, 900);
		this.weaponCam = new PerspectiveCamera(68, 1, .04, 4);
		this.weaponCam.layers.set(WEAPON_LAYER);
		this.camera.layers.enable(0);
		this.yawObj.add(this.camera);
		this.scene.add(this.yawObj);
		this.muzzle = new PointLight(16737860, 0, 6, 2);
		this.muzzle.layers.enable(0);
		this.muzzle.layers.enable(WEAPON_LAYER);
		this.camera.add(this.muzzle);
		this.fill = new PointLight(16763060, .55, 3, 2);
		this.fill.position.set(.1, .1, .2);
		this.fill.layers.enable(0);
		this.fill.layers.enable(WEAPON_LAYER);
		this.camera.add(this.fill);
		this.chargeGlow = new PointLight(16729190, 0, 8, 2);
		this.chargeGlow.position.set(.2, -.1, -.6);
		this.chargeGlow.layers.enable(0);
		this.chargeGlow.layers.enable(WEAPON_LAYER);
		this.camera.add(this.chargeGlow);
		this.viewmodel.layers.set(WEAPON_LAYER);
		this.camera.add(this.viewmodel);
		this.lanceMat = new MeshBasicMaterial({
			color: 16733559,
			transparent: true,
			opacity: 0,
			blending: 2,
			depthWrite: false
		});
		const lanceGeo = new CylinderGeometry(.05, .16, 1, 8);
		this.lance = new Mesh(lanceGeo, this.lanceMat);
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
			status: () => this.input.status?.()
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
			heal: (n) => {
				this.health = Math.min(this.maxHealth || 100, this.health + n);
			},
			stagger: () => {
				this.staggerT = 1.15;
				this.trauma = 1;
			},
			chargeAnkh: (n) => {
				this.charge = Math.max(this.charge, n);
			},
			gateBite: () => {
				this.trauma = .6;
			},
			shove: () => {
				this.vx += (Math.random() - .5) * 8;
				this.vz += (Math.random() - .5) * 8;
				this.trauma = .8;
			},
			pos: () => ({
				x: this.px,
				z: this.pz
			})
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
		this.scene.background = new Color(1312780);
		this.scene.fog = new Fog(1312780, 70, 340);
		const hemi = new HemisphereLight(16763056, 2754576, 1.15);
		const dir = new DirectionalLight(16765096, 1.45);
		dir.position.set(-18, 90, 36);
		const fill = new PointLight(16720452, 4.8, 120, 1.4);
		fill.position.set(0, 16, 28);
		const moonLight = new PointLight(16724821, 6.5, 180, 1.2);
		moonLight.position.set(-48, 58, -70);
		hemi.layers.enable(0);
		hemi.layers.enable(WEAPON_LAYER);
		dir.layers.enable(0);
		dir.layers.enable(WEAPON_LAYER);
		this.scene.add(hemi, dir, fill, moonLight);
		const skyMat = new MeshBasicMaterial({
			color: 4855842,
			side: 1,
			depthWrite: false,
			fog: false,
			toneMapped: false
		});
		const sky = new Mesh(new SphereGeometry(620, 24, 16), skyMat);
		sky.renderOrder = -10;
		sky.name = "boot-sky";
		this.scene.add(sky);
		this.bootSkyMat = skyMat;
		const failsafe = new Mesh(new PlaneGeometry(280, 280), new MeshBasicMaterial({
			color: 4857880,
			toneMapped: false,
			fog: true
		}));
		failsafe.rotation.x = -Math.PI / 2;
		failsafe.position.y = -.04;
		failsafe.name = "boot-floor";
		this.scene.add(failsafe);
		this.px = 0;
		this.py = .35;
		this.pz = 68;
		this.yaw = 0;
		this.pitch = -.08;
		this.yawObj.rotation.y = 0;
		this.camera.rotation.set(-.08, 0, 0);
		this.yawObj.position.set(0, EYE, 68);
	}
	onResize = () => {};
	onVis = () => {
		this.audio.resume();
		if (document.hidden) this.input.keys.clear();
	};
	loadWorld() {
		const loader = new TextureLoader();
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
			color: 13153456,
			glow: 1.55,
			scale: 3.1
		});
		this.mats.wall = createCrystalMaterial({
			kind: "wall",
			map: wallT,
			color: 12101796,
			glow: 1.35,
			scale: 4.2
		});
		this.mats.column = createCrystalMaterial({
			kind: "column",
			map: colT,
			color: 12890282,
			glow: 1.7,
			scale: 5
		});
		this.mats.energy = new MeshBasicMaterial({
			map: energyT,
			color: 16720452,
			transparent: true,
			opacity: .95,
			blending: 2,
			depthWrite: false,
			toneMapped: false
		});
		this.mats.water = new MeshStandardMaterial({
			map: waterT,
			color: C.blood,
			roughness: .28,
			metalness: .45,
			emissive: C.blood,
			emissiveIntensity: .55,
			transparent: true,
			opacity: .92
		});
		this.mats.ember = createCrystalMaterial({
			kind: "ember",
			color: C.ember,
			crack: colourShift(C.ember, this.profile.code, .04),
			glow: 2.4 + this.profile.glow * .35,
			scale: 6.2
		});
		this.mats.body = createCrystalMaterial({
			kind: "armor",
			color: C.void,
			glow: 1.6,
			scale: 7.4
		});
		const card = (url, fog = true) => {
			const t = new CanvasTexture(procCrystalCanvas("wall"));
			t.colorSpace = SRGBColorSpace;
			t.wrapS = t.wrapT = ClampToEdgeWrapping;
			t.anisotropy = 8;
			this.textures.push(t);
			loader.load(url, (loaded) => {
				if (!loaded?.image) return;
				t.image = loaded.image;
				t.needsUpdate = true;
				loaded.dispose();
			});
			return new MeshBasicMaterial({
				map: t,
				fog,
				side: 2,
				toneMapped: false,
				color: 16777215
			});
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
			tex.colorSpace = SRGBColorSpace;
			tex.mapping = 303;
			if (this.bootSkyMat) {
				this.bootSkyMat.map = tex;
				this.bootSkyMat.color.set(16777215);
				this.bootSkyMat.needsUpdate = true;
			}
			this.textures.push(tex);
			try {
				const pmrem = new PMREMGenerator(this.renderer);
				this.scene.environment = pmrem.fromEquirectangular(tex).texture;
			} catch {
				this.scene.environment = tex;
			}
		});
		try {
			const pmrem = new PMREMGenerator(this.renderer);
			const envScene = new Scene();
			envScene.background = new Color(3805208);
			this.scene.environment = pmrem.fromScene(envScene, .04).texture;
		} catch {}
		this.world = new World(this.mats, this.profile);
		this.world.build();
		this.world.setGateOpen(false);
		this.scene.add(this.world.group);
		this.rebuildHash();
		this.px = 0;
		this.py = .35;
		this.pz = 68;
		this.yaw = 0;
		this.pitch = -.08;
		this.yawObj.rotation.y = 0;
		this.camera.rotation.set(-.08, 0, 0);
		this.yawObj.position.set(0, EYE, 68);
		this.owned = /* @__PURE__ */ new Set(["ember-fortitude"]);
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
		this.grace = .45;
		this.maxHealth = 100;
		this.staggerT = 0;
		this.nearPrompt = "";
		this.nearKey = "F";
		const ch = CHARACTERS.find((c) => c.id === useGame.getState().settings.character) || CHARACTERS[0];
		const faceT = loader.load(ch.portrait);
		faceT.colorSpace = SRGBColorSpace;
		const dressT = loader.load("/lore/hunter-body.jpg");
		dressT.colorSpace = SRGBColorSpace;
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
			const g = new Group();
			fn(g);
			g.traverse((o) => o.layers.set(WEAPON_LAYER));
			g.visible = false;
			this.viewmodel.add(g);
			this.weapons.push(g);
		};
		const dark = crystalMetal({
			ember: 2228232,
			glow: .9
		});
		const glow = crystalBlade(this.profile.ember);
		const brass = new MeshStandardMaterial({
			color: 11569738,
			metalness: .85,
			roughness: .28,
			emissive: 3809800,
			emissiveIntensity: .25
		});
		mk((g) => {
			g.add(mesh(new BoxGeometry(.08, .12, .42), dark, 0, -.02, 0));
			const bar = new CylinderGeometry(.03, .035, .55, 8);
			bar.rotateX(Math.PI / 2);
			g.add(mesh(bar, dark, 0, .02, -.38));
			g.add(mesh(new BoxGeometry(.06, .14, .08), dark, .02, -.12, .06));
			g.add(mesh(new BoxGeometry(.04, .04, .08), glow, 0, .04, -.62));
		});
		mk((g) => {
			const staff = new CylinderGeometry(.025, .03, .7, 8);
			staff.rotateX(Math.PI / 2);
			g.add(mesh(staff, dark, .02, -.04, -.2));
			g.add(mesh(new OctahedronGeometry(.09, 0), glow, .02, .02, -.58));
			g.add(mesh(new TorusGeometry(.13, .015, 6, 16), brass, .02, .02, -.58));
		});
		mk((g) => {
			g.add(mesh(new BoxGeometry(.14, .14, .32), dark, 0, -.02, -.1));
			const b1 = new CylinderGeometry(.02, .022, .28, 6);
			b1.rotateX(Math.PI / 2);
			g.add(mesh(b1, dark, -.04, .02, -.32));
			g.add(mesh(b1.clone(), dark, .04, .02, -.32));
			g.add(mesh(new BoxGeometry(.1, .16, .08), glow, 0, -.08, .02));
		});
		mk((g) => {
			g.add(mesh(new BoxGeometry(.06, .22, .06), brass, 0, 0, -.2));
			g.add(mesh(new TorusGeometry(.1, .018, 8, 16), brass, 0, .16, -.2));
			g.add(mesh(new BoxGeometry(.18, .05, .05), brass, 0, -.02, -.2));
			const beam = new CylinderGeometry(.02, .035, .4, 8);
			beam.rotateX(Math.PI / 2);
			g.add(mesh(beam, glow, 0, .04, -.48));
		});
		this.weapons[0].visible = true;
		this.viewmodel.position.set(.3, -.28, -.58);
		const extra = (fn) => {
			const g = new Group();
			fn(g);
			g.traverse((o) => o.layers.set(WEAPON_LAYER));
			g.visible = false;
			this.viewmodel.add(g);
			this.weapons.push(g);
		};
		extra((g) => {
			const barrel = new CylinderGeometry(.018, .022, .95, 8);
			barrel.rotateX(Math.PI / 2);
			g.add(mesh(barrel, dark, .02, .02, -.52));
			g.add(mesh(new BoxGeometry(.07, .11, .28), dark, .02, -.04, .04));
		});
		extra((g) => {
			g.add(mesh(new BoxGeometry(.12, .1, .36), dark, 0, -.02, -.08));
			const r1 = new CylinderGeometry(.012, .012, .62, 6);
			r1.rotateX(Math.PI / 2);
			g.add(mesh(r1, glow, -.035, .03, -.42));
			g.add(mesh(r1.clone(), glow, .035, .03, -.42));
		});
		extra((g) => {
			g.add(mesh(new CylinderGeometry(.018, .022, .72, 8), dark, .12, -.08, -.22));
			g.add(mesh(new BoxGeometry(.42, .08, .04), glow, .12, .22, -.22));
		});
		extra((g) => {
			g.add(mesh(new BoxGeometry(.04, .08, .62), glow, .14, -.02, -.28));
			g.add(mesh(new BoxGeometry(.05, .12, .1), dark, .14, -.06, .08));
		});
		extra((g) => {
			g.add(mesh(new CylinderGeometry(.016, .02, .85, 8), dark, .1, -.12, -.18));
			g.add(mesh(new TorusGeometry(.16, .02, 6, 14, Math.PI * 1.2), glow, .1, .28, -.18));
		});
		extra((g) => {
			const shaft = new CylinderGeometry(.016, .02, .95, 8);
			shaft.rotateX(Math.PI / 2);
			g.add(mesh(shaft, dark, .08, -.04, -.28));
			g.add(mesh(new ConeGeometry(.05, .18, 8), glow, .08, -.02, -.78));
		});
		extra((g) => {
			g.add(mesh(new CylinderGeometry(.02, .024, .7, 8), dark, .14, -.1, -.18));
			g.add(mesh(new BoxGeometry(.22, .22, .14), glow, .14, .28, -.18));
		});
		extra((g) => {
			g.add(mesh(new BoxGeometry(.08, .08, .18), glow, .16, -.08, -.22));
			g.add(mesh(new BoxGeometry(.08, .08, .18), glow, -.08, -.08, -.18));
		});
	}
	spawnEnemies() {
		for (const s of this.world.spawns) if (s.kind === "construct" && !this.world.gateOpen) this.makeEnemy(s.kind, s.x, 0, s.z, true);
		else this.makeEnemy(s.kind, s.x, 0, s.z, false);
	}
	makeEnemy(kind, x, y, z, dormant) {
		const st = {
			wraith: {
				hp: 42,
				speed: 4.6,
				range: 2.1,
				cd: .85,
				dmg: 9,
				r: .45,
				h: 1.8
			},
			sentinel: {
				hp: 70,
				speed: 2.4,
				range: 18,
				cd: 1.35,
				dmg: 12,
				r: .55,
				h: 1.9
			},
			construct: {
				hp: 150,
				speed: 1.7,
				range: 2.6,
				cd: 1.2,
				dmg: 16,
				r: .7,
				h: 2.4
			},
			shade: {
				hp: 48,
				speed: 5.4,
				range: 2,
				cd: .7,
				dmg: 11,
				r: .4,
				h: 1.6
			},
			boss: {
				hp: 720,
				speed: 3.2,
				range: 22,
				cd: .9,
				dmg: 18,
				r: 1.1,
				h: 4.4
			}
		}[kind];
		const hpMul = kind === "boss" ? 1 + (this.profile.enemyHpMul - 1) * .5 : this.profile.enemyHpMul;
		const root = new Group();
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
			strafe: Math.random() < .5 ? 1 : -1,
			level: Math.max(1, Math.round((this.profile.bossLevel || 1) * (kind === "boss" ? 1 : .08 + Math.random() * .12)))
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
		const g = new Group();
		const faceMap = {
			wraith: this.mats.portraitHood || this.mats.portraitShade,
			sentinel: this.mats.portraitKnight || this.mats.portraitSentinel,
			construct: this.mats.portraitTitan || this.mats.portraitConstruct,
			shade: this.mats.portraitShade,
			boss: this.mats.portraitBoss || this.mats.portraitAelith
		}[kind];
		const figure = buildEnemyFigure(kind, faceMap && faceMap.map ? faceMap.map : null);
		g.add(figure.root);
		g.userData.rig = figure;
		const h = kind === "boss" ? 5.6 : kind === "construct" ? 3.4 : kind === "sentinel" ? 2.8 : 2.35;
		const hit = new Mesh(new CapsuleGeometry(kind === "boss" ? .7 : .38, h * .55, 4, 8), new MeshBasicMaterial({ visible: false }));
		hit.position.y = h * .42;
		g.add(hit);
		const disc = new Mesh(new CircleGeometry(.42, 12), new MeshBasicMaterial({
			color: 0,
			transparent: true,
			opacity: .5,
			depthWrite: false
		}));
		disc.rotation.x = -Math.PI / 2;
		disc.position.y = .03;
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
			this.npcs.push({
				spec,
				rig: fig,
				line: 0
			});
			poseHunter(fig, 0, true, 0, 0, 0, .4, 0);
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
				body: line
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
			resist: f.resist || 0
		});
		this.world.skySpin = f.skySpin || 1;
		if (this.scene.fog && this.scene.fog.isFog) {
			const n = Math.max(1, f.night || 1);
			this.scene.fog.near = 48 / n;
			this.scene.fog.far = 220 / Math.sqrt(n);
			this.scene.fog.color.setHex(C.void);
			this.scene.background = new Color(C.void);
		}
		if (f.regen > 0) this.health = Math.min(this.maxHealth || 100, this.health + f.regen * dt);
		if (f.magnet) for (const p of this.world.pickups) {
			if (p.taken || p.kind === "rune") continue;
			const dx = this.px - p.mesh.position.x;
			const dz = this.pz - p.mesh.position.z;
			const d = Math.hypot(dx, dz);
			if (d < 14 && d > .2) {
				p.mesh.position.x += dx / d * 9 * dt;
				p.mesh.position.z += dz / d * 9 * dt;
			}
		}
		if (f.emberFloor && this.grounded && !useGame.getState().settings.immortal) this.health = Math.max(1, this.health - 4 * dt);
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
		const order = [
			"fps",
			"tps",
			"spec"
		];
		const cur = useGame.getState().settings.cam || "fps";
		const next = order[(order.indexOf(cur) + 1) % 3];
		useGame.getState().patchSettings({ cam: next });
		this.tell(next === "fps" ? "View · First eye" : next === "tps" ? "View · Over shoulder" : "View · Spectator");
		this.pushHud();
	}
	mods() {
		return modsFrom([...this.owned || []]);
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
		const at = this.yawObj.position.clone().add(new Vector3(0, 1.1, 0));
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
			} else this.tell("Crimson Surge.");
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
				if (Math.hypot(e.root.position.x - this.px, e.root.position.z - this.pz) < 18) e.cd = Math.max(e.cd, s?.id === "final-whisper" ? 2.6 : 1.6);
			}
			this.tell(s?.id === "final-whisper" ? "Final Form Whisper." : "Void Whisper.");
		} else if (kind === "ritual") {
			this.blast(at, 9, 42);
			this.tell("Circle of Four.");
			this.trauma = .5;
		}
		this.skillCd = kind === "ritual" || kind === "whisper" ? 8 : 5;
		this.skillCastT = 1.55;
		this.skillCast = s ? {
			id: s.id,
			name: s.name,
			art: s.art || s.icon,
			kind
		} : null;
		this.spark(at, kind === "ritual" ? 3.2 : 2);
		this.audio.skill(kind, s?.id || "");
		this.trauma = Math.min(1, this.trauma + .25);
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
			const y = Math.max(this.py, this.stepFloor(nx, nz, this.py, .65));
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
		const pr = this.quality >= 1080 ? Math.min(coarse ? 1.5 : 2, dpr) : this.quality >= 720 ? Math.min(1.25, dpr) : .7;
		this.renderer.setPixelRatio(pr);
		this.renderer.toneMapping = this.quality >= 720 ? 4 : 0;
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
		if (this.staggerT > 0) speed *= .38;
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
			this.vy *= .45;
			this.jumpWasHeld = false;
		}
		const travel = Math.hypot(this.vx, this.vz) * dt + Math.abs(this.vy) * dt;
		const steps = Math.max(1, Math.min(6, Math.ceil(travel / .28)));
		const sdt = dt / steps;
		for (let i = 0; i < steps; i++) this.slide(sdt);
		if (!wasGrounded && this.grounded) {
			this.audio.land(Math.min(1, Math.abs(fall) / 14));
			if (fall < -18 && !useGame.getState().settings.immortal) this.hurtPlayer(Math.min(36, (-fall - 18) * 3.5));
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
			const min = RADIUS + e.radius * .82;
			if (d >= min || d < .001) continue;
			const nx = dx / d;
			const nz = dz / d;
			const push = (min - d) * .7;
			const px = this.px + nx * push;
			const pz = this.pz + nz * push;
			if (!this.solidAt(px, this.py, pz)) {
				this.px = px;
				this.pz = pz;
			}
		}
	}
	slide(dt) {
		const STEP = .65;
		let y = Math.max(this.py, this.stepFloor(this.px, this.pz, this.py, STEP));
		let nx = this.px + this.vx * dt;
		let nz = this.pz + this.vz * dt;
		const stepOrBlock = (x, z, axis) => {
			const at = Math.max(y, this.stepFloor(x, z, y, STEP));
			if (!this.solidAt(x, at, z)) return {
				x,
				z,
				y: at
			};
			if (!this.solidAt(x, y + STEP, z)) return {
				x,
				z,
				y: this.stepFloor(x, z, y + STEP, .08)
			};
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
		const floor = this.floorBelow(nx, nz, Math.max(ny, y) + .04);
		if (this.vy <= 0 && ny <= floor + .02) {
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
		const feet = y + .02;
		const head = y + HEIGHT - .02;
		for (const b of this.nearBoxes(x, z, .5800000000000001)) {
			if (b.maxY - b.minY <= .72) continue;
			if (head <= b.minY || feet >= b.maxY) continue;
			if (circleHitsAABB(x, z, RADIUS, b)) return true;
		}
		return false;
	}
	stepFloor(x, z, y, step) {
		let g = y;
		for (const b of this.nearBoxes(x, z, .5800000000000001)) {
			if (!circleHitsAABB(x, z, RADIUS * .92, b)) continue;
			const top = b.maxY;
			if (top > y + step + .01) continue;
			if (top < y - .02) continue;
			g = Math.max(g, top);
		}
		return g;
	}
	floorBelow(x, z, y) {
		let g = 0;
		for (const b of this.nearBoxes(x, z, .5800000000000001)) {
			if (!circleHitsAABB(x, z, RADIUS * .92, b)) continue;
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
		const id = (i % n + n) % n;
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
		const inf = f?.sparkInfinite && (w.view === VIEW.rifle || w.nameKey === "spark") || f?.pulseInfinite && (w.view === VIEW.smg || w.nameKey === "pulse");
		if (w.fire !== "melee" && !inf) this.mag[this.weapon]--;
		this.audio.fireWeapon(w.view ?? 0, w.fire, !!w.automatic);
		const ads = this.ads();
		const shake = useGame.getState().settings.shake;
		this.recoilSim.fire(w, {
			ads,
			mul: this.profile.recoilMul,
			charge: w.fire === "beam" ? this.charge : 0,
			shake
		});
		this.trauma = Math.min(1, this.trauma + (shake ? w.recoil * 4 : 0));
		this.muzzleT = .05;
		const mods = this.mods();
		const forti = this.fortitudeT > 0 ? 1.35 : 1;
		const crit = this.coilT > 0 || Math.random() < mods.crit ? 1.6 : 1;
		let dmg = w.damage * this.profile.damageMul * mods.dmg * forti * crit;
		if (f?.pulseDmg && (w.view === VIEW.smg || w.nameKey === "pulse")) dmg *= f.pulseDmg;
		if (f?.ankhMul && w.fire === "beam") dmg *= f.ankhMul;
		if (w.fire === "melee") this.melee(dmg, w.range);
		else if (w.fire === "projectile") this.spawnProj(false, 22, dmg, .22, void 0, void 0, true);
		else if (w.fire === "rail") {
			this.hitscan(dmg, w.spread * this.profile.spreadMul * this.recoilSim.spreadMul(), w.range);
			this.flashLance(w.range * .55);
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
			if ((dx * this._dir.x + dy * this._dir.y + dz * this._dir.z) / (dist || 1) < .35) continue;
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
			const m = new Mesh(new SphereGeometry(.12, 8, 8), this.mats.ember || new MeshBasicMaterial({ color: 16724753 }));
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
				const boxes = this.hash.querySegment(ox, oz, nx, nz, p.radius + .4);
				let bestT = 1;
				for (const b of boxes) {
					if (b.maxY < .2 && b.minY < -.5) continue;
					const t = sweepSphereAABB(ox, oy, oz, nx, ny, nz, p.radius, b);
					if (t != null && t < bestT) {
						bestT = t;
						hitAt = {
							x: lerp(ox, nx, t),
							y: lerp(oy, ny, t),
							z: lerp(oz, nz, t)
						};
					}
				}
				if (hitAt) {
					if (p.grav && !p.fromEnemy) this.blast(new Vector3(hitAt.x, hitAt.y, hitAt.z), 3.6, p.dmg * .7);
					else this.spark(new Vector3(hitAt.x, hitAt.y, hitAt.z), .8);
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
		e.root.position.x += kx / kd * .42;
		e.root.position.z += kz / kd * .42;
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
			this.spark(e.root.position.clone().add(new Vector3(0, 1, 0)), 3);
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
					portrait: nameById("aelith").portrait
				});
				this.tell("The six names are one.");
				setTimeout(() => useGame.getState().setScreen("victory"), 1600);
				if (document.pointerLockElement) document.exitPointerLock();
			}
		}
	}
	hurtPlayer(dmg) {
		if ((this.grace || 0) > 0 || useGame.getState().settings.immortal) return;
		const resist = Math.min(.8, (this.mods().resist || 0) + (this.owm?.flags?.resist || 0));
		const taken = dmg * ((this.fortitudeT > 0 ? .55 : 1) * (1 - resist));
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
			e.cd -= edt * (e.kind === "sentinel" ? this.owm?.flags?.sentinelCd || 1 : 1);
			e.flash = Math.max(0, e.flash - dt);
			if (e.windup > 0) e.windup = Math.max(0, e.windup - edt);
			if (e.chargeT > 0) e.chargeT = Math.max(0, e.chargeT - edt);
			e.stateT = (e.stateT || 0) + edt;
			let dx = this.px - e.root.position.x;
			let dz = this.pz - e.root.position.z;
			if (confuse) {
				dx = -dx;
				dz = -dz;
			}
			const dist = Math.hypot(dx, dz) || .001;
			const aggro = e.kind === "boss" ? 90 : e.kind === "sentinel" ? 40 : e.kind === "construct" ? 22 : 30;
			const lose = aggro * 1.7;
			if (dist < aggro) {
				e.aware = true;
				e.lastX = this.px;
				e.lastZ = this.pz;
				if (dist < 22) near += e.kind === "boss" ? 1 : .35;
			} else if (dist > lose) e.aware = false;
			if (e.aware) this.alertNeighbors(e);
			e.root.lookAt(this.px, e.root.position.y, this.pz);
			const rig = e.hit?.userData?.rig;
			if (rig && dist < 42) poseHunter(rig, this.time * (e.kind === "shade" ? 3 : 1.6) + e.id, true, e.aware ? e.speed : 0, 0, 0, this.time, 0);
			if (e.kind === "boss") {
				e.root.position.y = .4 + Math.sin(this.time * 1.4) * .35;
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
			e.root.position.y = e.kind === "shade" || e.kind === "sentinel" ? .2 + Math.sin(this.time * 3 + e.id) * .15 : 0;
		}
		this.audio.setCombat(Math.min(1, near));
	}
	alertNeighbors(src) {
		for (const o of this.enemies) {
			if (o === src || !o.alive || o.aware) continue;
			if (Math.hypot(o.root.position.x - src.root.position.x, o.root.position.z - src.root.position.z) < 14) {
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
		if (hd > 1.4) this.enemySteer(e, hx / hd, hz / hd, e.speed * .35, dt);
		else {
			const a = this.time * .4 + e.id;
			this.enemySteer(e, Math.cos(a), Math.sin(a), e.speed * .12, dt);
		}
		e.root.position.y = e.kind === "shade" || e.kind === "sentinel" ? .15 : 0;
	}
	enemyWraith(e, dt, dist, dx, dz) {
		const sep = this.enemySep(e);
		if (dist > e.range) this.enemySteer(e, dx / dist + sep.x * .6, dz / dist + sep.z * .6, e.speed, dt);
		else if (e.cd <= 0) {
			if (e.windup <= 0 && e.state !== "strike") {
				e.state = "strike";
				e.windup = .22;
				this.audio.at(e.root.position.x, e.root.position.z);
				this.audio.enemyAttack("wraith");
				this.audio.clearAt();
			} else if (e.windup <= 0) {
				e.cd = e.cooldown;
				e.state = "chase";
				if (dist < e.range + .5) this.hurtPlayer(e.damage);
			}
		} else this.enemySteer(e, -dz / dist + sep.x, dx / dist + sep.z, e.speed * .4, dt);
	}
	enemyShade(e, dt, dist, dx, dz) {
		const side = e.strafe || 1;
		const fx = dx / dist;
		const fz = dz / dist;
		const px = -fz * side;
		const pz = fx * side;
		if (dist > 10) this.enemySteer(e, fx * .45 + px, fz * .45 + pz, e.speed * 1.15, dt);
		else if (dist > e.range) {
			this.enemySteer(e, fx * .8 + px * .7, fz * .8 + pz * .7, e.speed, dt);
			if (Math.random() < dt * .55) {
				this.enemySteer(e, fx, fz, e.speed * 8, .12);
				this.audio.at(e.root.position.x, e.root.position.z);
				this.audio.enemyAttack("shade");
				this.audio.clearAt();
			}
		} else if (e.cd <= 0) {
			e.cd = e.cooldown;
			this.audio.at(e.root.position.x, e.root.position.z);
			this.audio.enemyAttack("shade");
			this.audio.clearAt();
			if (dist < e.range + .45) this.hurtPlayer(e.damage);
			e.strafe = -side;
		} else this.enemySteer(e, px, pz, e.speed * .7, dt);
	}
	enemySentinel(e, dt, dist, dx, dz) {
		const fx = dx / dist;
		const fz = dz / dist;
		const side = e.strafe || 1;
		if (dist < 9) this.enemySteer(e, -fx, -fz, e.speed * 1.3, dt);
		else if (dist > 20) this.enemySteer(e, fx, fz, e.speed, dt);
		else this.enemySteer(e, -fz * side, fx * side, e.speed * .9, dt);
		if (e.cd <= 0 && dist < 32 && dist > 6) {
			e.cd = e.cooldown;
			const origin = e.root.position.clone().add(new Vector3(0, 1.3, 0));
			const lead = dist / 18;
			const dir = new Vector3(this.px + this.vx * lead - origin.x, this.py + EYE - origin.y, this.pz + this.vz * lead - origin.z).normalize();
			this.spawnProj(true, 18, e.damage, .16, origin, dir, false);
			this.audio.at(e.root.position.x, e.root.position.z);
			this.audio.enemyAttack("sentinel");
			this.audio.clearAt();
			if (Math.random() < .3) e.strafe = -side;
		}
	}
	enemyConstruct(e, dt, dist, dx, dz) {
		const fx = dx / dist;
		const fz = dz / dist;
		if (e.chargeT > .15 && e.state === "charge") {
			this.enemySteer(e, fx, fz, e.speed * 3.4, dt);
			if (dist < e.range + .6) {
				this.audio.at(e.root.position.x, e.root.position.z);
				this.audio.enemyAttack("construct");
				this.audio.clearAt();
				this.hurtPlayer(e.damage * 1.4);
				this.trauma = Math.min(1, this.trauma + .5);
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
				e.chargeT = .55;
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
			if (d < 2.4 && d > .01) {
				sx += dx / d;
				sz += dz / d;
			}
		}
		return {
			x: sx,
			z: sz
		};
	}
	enemySteer(e, wx, wz, speed, dt) {
		const len = Math.hypot(wx, wz) || 1;
		let nx = e.root.position.x + wx / len * speed * dt;
		let nz = e.root.position.z + wz / len * speed * dt;
		const r = e.radius || .45;
		for (const b of this.nearBoxes(nx, e.root.position.z, r + .4)) {
			if (b.maxY < 1.3 || b.minY > 1.7) continue;
			if (circleHitsAABB(nx, e.root.position.z, r, b)) nx = e.root.position.x;
		}
		for (const b of this.nearBoxes(nx, nz, r + .4)) {
			if (b.maxY < 1.3 || b.minY > 1.7) continue;
			if (circleHitsAABB(nx, nz, r, b)) nz = e.root.position.z;
		}
		e.root.position.x = nx;
		e.root.position.z = nz;
	}
	bossAi(e, dt, dist, dx, dz) {
		const ratio = e.hp / e.max;
		const phase = ratio < .33 ? 3 : ratio < .66 ? 2 : 1;
		const spd = e.speed * (.85 + phase * .28);
		if (dist > 12) this.enemySteer(e, dx / dist, dz / dist, spd, dt);
		else if (dist < 6) this.enemySteer(e, -dx / dist, -dz / dist, spd * .7, dt);
		else this.enemySteer(e, -dz / dist, dx / dist, spd * .5, dt);
		if (e.cd > 0) return;
		e.cd = e.cooldown / (.75 + phase * .25);
		const origin = e.root.position.clone().add(new Vector3(0, 2.4, 0));
		const mode = Math.floor(this.time * (1 + phase * .35) + e.id) % (phase >= 3 ? 4 : 3);
		this.audio.at(e.root.position.x, e.root.position.z);
		if (mode === 0) {
			const fan = phase >= 2 ? 4 : 2;
			for (let i = -fan; i <= fan; i++) {
				const dir = new Vector3(this.px - origin.x, this.py + EYE - origin.y, this.pz - origin.z).normalize();
				const q = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), i * (.1 - phase * .01));
				dir.applyQuaternion(q);
				this.spawnProj(true, 14 + phase * 4, e.damage, .2, origin, dir, false);
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
				const a = i / (6 + phase * 2) * Math.PI * 2 + this.time;
				const dir = new Vector3(Math.cos(a), .05, Math.sin(a));
				this.spawnProj(true, 10 + phase * 3, e.damage * .8, .18, origin, dir, false);
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
					portrait: n.portrait
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
				const m = new Mesh(this.partGeo, mat);
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
		else if (cam === "tps") this.camera.position.set(.55, .22, 2.6);
		else this.camera.position.set(.15, .55, 5.4);
		if (!fps && this.pitch < -.35) this.pitch = -.35;
		const ads = this.ads();
		const targetFov = ads ? w?.zoom || 48 : 78;
		this.camera.fov += (targetFov + this.recoilSim.fov - this.camera.fov) * (1 - Math.exp(-10 * dt));
		this.camera.updateProjectionMatrix();
		this.recoilSim.tick(dt, w, {
			charge: this.charge,
			time: this.time,
			ads
		});
		const roll = useGame.getState().settings.shake ? this.recoilSim.camRoll : this.recoilSim.camRoll * .25;
		this.camera.rotation.set(this.pitch + this.recoilSim.camPitch + this.recoilSim.camTr, this.recoilSim.camYaw, roll);
		const tx = ads ? 0 : .3;
		const ty = ads ? -.2 : -.28 + Math.sin(this.bob) * .02;
		const tz = ads ? -.48 : -.58;
		const k = 1 - Math.exp(-12 * dt);
		this._vmRest.x += (tx - this._vmRest.x) * k;
		this._vmRest.y += (ty - this._vmRest.y) * k;
		this._vmRest.z += (tz - this._vmRest.z) * k;
		this.viewmodel.position.set(this._vmRest.x + this.recoilSim.vmX + this.recoilSim.trX, this._vmRest.y + this.recoilSim.vmY + this.recoilSim.trY, this._vmRest.z + this.recoilSim.vmZ);
		this.viewmodel.rotation.set(this.recoilSim.vmPitch + this.recoilSim.trPitch, this.recoilSim.vmYaw, this.recoilSim.vmRoll);
		this.chargeGlow.intensity = this.charge * 6;
		if (this.lanceT > 0) {
			this.lance.visible = true;
			this.lanceMat.opacity = Math.max(0, this.lanceT * 5);
		} else {
			this.lance.visible = false;
			this.lanceMat.opacity = 0;
		}
		for (const e of this.enemies) if (e.flash > 0 || e._lit) {
			e.hit.traverse((o) => {
				const mat = o.material;
				if (mat && mat.emissive) mat.emissiveIntensity = e.flash > 0 ? 2.8 : kindGlow(e.kind);
			});
			e._lit = e.flash > 0;
		}
	}
	applyCharacter(id) {
		this.charId = id;
		const ch = CHARACTERS.find((c) => c.id === id);
		if (!ch || !this.hunter?.faceMat) return;
		const t = new TextureLoader().load(ch.portrait);
		t.colorSpace = SRGBColorSpace;
		t.anisotropy = 8;
		t.minFilter = LinearMipmapLinearFilter;
		t.magFilter = LinearFilter;
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
			scoped: this.ads() && WEAPONS[this.weapon]?.view === VIEW.sniper,
			cam: useGame.getState().settings.cam,
			bag: this.bagOpen,
			atlas: this.atlasOpen,
			tree: this.treeOpen,
			fortitude: this.fortitudeT || 0,
			skillPts: this.skillPts || 0,
			skills: [...this.owned || []],
			activeSkill: this.activeSkill || "ember-fortitude",
			skillCd: this.skillCd || 0,
			skillCast: this.skillCastT > 0 ? this.skillCast : null,
			recoilHeat: this.recoilSim.heat01(),
			map: {
				x: this.px,
				z: this.pz,
				yaw: this.yaw,
				marks: [...this.enemies.filter((e) => e.alive).map((e) => ({
					x: e.root.position.x,
					z: e.root.position.z,
					kind: "foe"
				})), ...(this.world?.pickups || []).filter((p) => !p.taken && p.kind !== "rune").map((p) => ({
					x: p.mesh.position.x,
					z: p.mesh.position.z,
					kind: p.kind === "ammo" ? "ammo" : "health"
				}))],
				runes: [...this.runes],
				gateOpen: !!this.world?.gateOpen
			}
		});
	}
	render() {
		const w = this.canvas.clientWidth || window.innerWidth;
		const h = this.canvas.clientHeight || window.innerHeight;
		if (this.canvas.width !== Math.floor(w * this.renderer.getPixelRatio()) || this.canvas.height !== Math.floor(h * this.renderer.getPixelRatio())) this.resize();
		this.renderer.setClearColor(1705996, 1);
		this.renderer.info.reset();
		this.renderer.clear();
		this.camera.layers.set(0);
		this.renderer.render(this.scene, this.camera);
		this.worldCalls = this.renderer.info.render.calls;
		this.worldTris = this.renderer.info.render.triangles;
		if ((useGame.getState().settings.cam || "fps") === "fps" && this.viewmodel.children.length) {
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
			engine: 5,
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
				engine: 5,
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
				recoil: this.recoilSim.dump()
			})
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
};
function mesh(geo, mat, x, y, z) {
	const m = new Mesh(geo, mat);
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
//#endregion
export { CrimsonGame };
