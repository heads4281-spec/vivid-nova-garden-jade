import * as THREE from "three";
import { crystalBlade, crystalMetal } from "./crystal";
import type { FigureKind } from "./figures";

export type HunterRig = {
  root: THREE.Group;
  head: THREE.Object3D;
  chest: THREE.Object3D;
  hips: THREE.Object3D;
  leftArm: THREE.Object3D;
  rightArm: THREE.Object3D;
  leftLeg: THREE.Object3D;
  rightLeg: THREE.Object3D;
  hand: THREE.Object3D;
  visor: THREE.Object3D;
  cape: THREE.Object3D[];
  worldGuns: THREE.Group[];
  faceMat: THREE.MeshBasicMaterial;
  armor: THREE.Material[];
};

type KnightOpts = {
  face?: THREE.Texture | null;
  ember?: number;
  scale?: number;
  weapon?: "greatsword" | "hammer" | "staff" | "scythe" | "rifle" | "none";
  cape?: boolean;
  crown?: boolean;
  detail?: "high" | "low";
  kind?: FigureKind;
};

const matCache = new Map<string, ReturnType<typeof makeMats>>();

function makeMats(ember: number) {
  const plate = crystalMetal({ ember, glow: 1.7 });
  const dark = crystalMetal({ ember: 0x220008, glow: 0.8 });
  const glow = crystalBlade(ember);
  const gold = new THREE.MeshStandardMaterial({
    color: 0xb08a4a,
    metalness: 0.88,
    roughness: 0.28,
    emissive: 0x3a1808,
    emissiveIntensity: 0.45,
  });
  const visorGlow = new THREE.MeshStandardMaterial({
    color: ember,
    emissive: ember,
    emissiveIntensity: 1.8,
    roughness: 0.22,
    metalness: 0.4,
  });
  const cloth = new THREE.MeshStandardMaterial({
    color: 0x1a0508,
    roughness: 0.72,
    metalness: 0.08,
    emissive: ember,
    emissiveIntensity: 0.22,
  });
  return { plate, dark, glow, gold, visorGlow, cloth };
}

function matsFor(ember: number) {
  const key = String(ember >>> 0);
  let m = matCache.get(key);
  if (!m) {
    m = makeMats(ember);
    matCache.set(key, m);
  }
  return m;
}

function kindTint(kind?: FigureKind): number {
  if (kind === "vaelith" || kind === "wraith") return 0xff4400;
  if (kind === "rynara") return 0xd4a017;
  if (kind === "sanguara") return 0x8b0000;
  if (kind === "nyxara" || kind === "shade") return 0x6633aa;
  if (kind === "eryndra") return 0xc41e3a;
  if (kind === "aelith" || kind === "boss") return 0xff1144;
  if (kind === "construct") return 0x884444;
  return 0xff1a1a;
}

function add(mesh: THREE.Mesh, parent: THREE.Object3D) {
  mesh.castShadow = false;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

export function buildKnight(opts: KnightOpts = {}): HunterRig {
  const ember = opts.ember ?? kindTint(opts.kind);
  const detail = opts.detail ?? "high";
  const segs = detail === "high" ? 8 : 5;
  const root = new THREE.Group();
  root.scale.setScalar(opts.scale ?? 1);

  const { plate, dark, glow, gold, visorGlow, cloth } = matsFor(ember);

  const hips = new THREE.Group();
  hips.position.y = 0.92;
  root.add(hips);
  add(new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.22, 0.22), plate), hips).position.y = 0.02;
  add(new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.08, 0.26), gold), hips).position.y = 0.14;
  const skirt = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.42, 0.18), cloth);
  skirt.position.set(0, -0.28, -0.04);
  hips.add(skirt);

  const chest = new THREE.Group();
  chest.position.y = 1.28;
  root.add(chest);
  add(new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.48, 0.28), plate), chest);
  add(new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.34, 0.06), glow), chest).position.set(0, 0.02, 0.16);
  add(new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.08, 0.3), gold), chest).position.y = 0.22;
  if (detail === "high") {
    add(new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.2, 0.08), plate), chest).position.set(-0.16, -0.02, 0.14);
    add(new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.2, 0.08), plate), chest).position.set(0.16, -0.02, 0.14);
    add(new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.32), plate), chest).position.y = -0.22;
    const sternum = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.36, 0.04), visorGlow);
    sternum.position.set(0, 0.02, 0.17);
    chest.add(sternum);
  }

  const makeArm = (side: number) => {
    const g = new THREE.Group();
    g.position.set(side * 0.3, 1.42, 0);
    const pauldron = new THREE.Mesh(new THREE.SphereGeometry(0.13, segs, 6, 0, Math.PI * 2, 0, Math.PI * 0.7), plate);
    pauldron.scale.set(1.15, 0.7, 1.05);
    pauldron.position.set(side * 0.04, 0.02, 0);
    g.add(pauldron);
    const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.07, 0.32, segs), plate);
    upper.position.y = -0.2;
    g.add(upper);
    const lower = new THREE.Group();
    lower.position.y = -0.36;
    const gaunt = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.3, segs), plate);
    gaunt.position.y = -0.14;
    lower.add(gaunt);
    g.add(lower);
    root.add(g);
    return { g, lower };
  };
  const left = makeArm(-1);
  const right = makeArm(1);
  const hand = new THREE.Object3D();
  hand.position.set(0, -0.3, -0.02);
  right.lower.add(hand);

  const makeLeg = (side: number) => {
    const g = new THREE.Group();
    g.position.set(side * 0.12, 0.78, 0);
    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.38, segs), plate);
    thigh.position.y = -0.18;
    g.add(thigh);
    const shin = new THREE.Group();
    shin.position.y = -0.38;
    const greave = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.07, 0.4, segs), plate);
    greave.position.y = -0.18;
    shin.add(greave);
    const boot = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.22), dark);
    boot.position.set(0, -0.4, 0.04);
    shin.add(boot);
    g.add(shin);
    root.add(g);
    return { g, shin };
  };
  const leftLeg = makeLeg(-1);
  const rightLeg = makeLeg(1);

  const head = new THREE.Group();
  head.position.y = 1.62;
  root.add(head);
  add(new THREE.Mesh(new THREE.SphereGeometry(0.145, segs + 2, segs), plate), head);
  const helm = new THREE.Mesh(new THREE.SphereGeometry(0.16, segs + 2, 8, 0, Math.PI * 2, 0, Math.PI * 0.58), plate);
  helm.position.y = 0.02;
  head.add(helm);
  const visor = new THREE.Group();
  visor.position.set(0, 0.0, 0.12);
  head.add(visor);
  add(new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.07, 0.04), visorGlow), visor);
  const slit = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.03, 0.02),
    new THREE.MeshBasicMaterial({ color: ember, toneMapped: false }),
  );
  slit.position.set(0, 0, 0.03);
  visor.add(slit);
  const faceMat = new THREE.MeshBasicMaterial({
    map: opts.face ?? null,
    color: opts.face ? 0xffffff : ember,
    toneMapped: false,
    transparent: true,
    opacity: opts.face ? 0.92 : 0.35,
  });
  if (opts.face) {
    opts.face.colorSpace = THREE.SRGBColorSpace;
    opts.face.wrapS = opts.face.wrapT = THREE.ClampToEdgeWrapping;
    opts.face.anisotropy = 8;
  }
  const faceMesh = new THREE.Mesh(new THREE.CircleGeometry(0.07, 16), faceMat);
  faceMesh.position.set(0, 0.01, 0.03);
  visor.add(faceMesh);

  if (opts.crown !== false && detail === "high") {
    for (let i = 0; i < 7; i++) {
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.016, 0.14 + (i === 3 ? 0.12 : i % 2 ? 0.04 : 0), 5), glow);
      const a = (i / 6) * 1.0 - 0.5;
      spike.position.set(Math.sin(a) * 0.11, 0.16, Math.cos(a) * 0.09);
      spike.rotation.z = -a * 0.55;
      head.add(spike);
    }
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.018, 6, 12), visorGlow);
    band.rotation.x = Math.PI / 2;
    band.position.y = 0.08;
    head.add(band);
  }

  const cape: THREE.Object3D[] = [];
  if (opts.cape !== false && detail === "high") {
    for (let i = 0; i < 6; i++) {
      const ribbon = new THREE.Mesh(new THREE.BoxGeometry(0.14 - i * 0.008, 0.92, 0.028), cloth);
      ribbon.position.set((i - 2.5) * 0.07, 1.02, -0.2);
      ribbon.userData.baseY = ribbon.position.y;
      root.add(ribbon);
      cape.push(ribbon);
    }
  }

  const weapon = opts.weapon ?? "greatsword";
  if (weapon === "greatsword") {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.05, 1.12), glow);
    blade.position.set(0, 0, -0.58);
    hand.add(blade);
    const crack = new THREE.Mesh(
      new THREE.BoxGeometry(0.018, 0.018, 1.08),
      new THREE.MeshBasicMaterial({ color: ember, toneMapped: false }),
    );
    crack.position.set(0, 0.03, -0.58);
    hand.add(crack);
    const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.028, 0.18, 6), gold);
    hilt.rotation.x = Math.PI / 2;
    hilt.position.set(0, 0, 0.06);
    hand.add(hilt);
    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.04, 0.045), gold);
    guard.position.set(0, 0, -0.04);
    hand.add(guard);
  } else if (weapon === "hammer") {
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.024, 0.7, 6), dark);
    shaft.rotation.x = Math.PI / 2;
    shaft.position.z = -0.28;
    hand.add(shaft);
    const headM = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.16), glow);
    headM.position.set(0, 0.02, -0.62);
    hand.add(headM);
  } else if (weapon === "staff") {
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 1.05, 6), gold);
    shaft.rotation.x = Math.PI / 2;
    shaft.position.z = -0.4;
    hand.add(shaft);
    hand.add(new THREE.Mesh(new THREE.OctahedronGeometry(0.09, 0), glow)).position.set(0, 0.02, -0.88);
  } else if (weapon === "scythe") {
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.02, 1.05, 6), dark);
    shaft.rotation.x = Math.PI / 2;
    shaft.position.z = -0.4;
    hand.add(shaft);
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.04, 0.1), glow);
    blade.position.set(0.16, 0.08, -0.88);
    blade.rotation.y = 0.4;
    hand.add(blade);
  } else if (weapon === "rifle") {
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.48), dark);
    body.position.z = -0.22;
    hand.add(body);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.024, 0.4, 6), plate);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.z = -0.52;
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
    armor: [plate, dark, glow, visorGlow, cloth, gold],
  };
}

export function buildHunter(face: THREE.Texture, _dress: THREE.Texture, ember: number): HunterRig {
  return buildKnight({ face, ember, weapon: "greatsword", cape: true, crown: true, detail: "high", kind: "nave" });
}

export function buildEnemyFigure(kind: FigureKind, face?: THREE.Texture | null): HunterRig {
  const map: Record<string, KnightOpts> = {
    wraith: { weapon: "none", cape: true, crown: false, detail: "low", scale: 0.95 },
    sentinel: { weapon: "rifle", cape: false, crown: true, detail: "low", scale: 1.12 },
    construct: { weapon: "hammer", cape: false, crown: false, detail: "low", scale: 1.35 },
    shade: { weapon: "none", cape: true, crown: false, detail: "low", scale: 0.88 },
    boss: { weapon: "greatsword", cape: true, crown: true, detail: "high", scale: 1.85 },
    nave: { weapon: "greatsword", cape: true, crown: true, detail: "high", scale: 1.08 },
    vaelith: { weapon: "hammer", cape: true, crown: true, detail: "high" },
    rynara: { weapon: "staff", cape: true, crown: true, detail: "high" },
    sanguara: { weapon: "scythe", cape: true, crown: true, detail: "high" },
    nyxara: { weapon: "rifle", cape: true, crown: true, detail: "high" },
    eryndra: { weapon: "staff", cape: true, crown: true, detail: "high" },
    aelith: { weapon: "greatsword", cape: true, crown: true, detail: "high", scale: 1.2 },
  };
  const spec = map[kind] ?? { weapon: "greatsword" as const, detail: "low" as const };
  return buildKnight({ ...spec, face: face ?? null, ember: kindTint(kind), kind });
}

export function poseHunter(
  rig: HunterRig,
  bob: number,
  grounded: boolean,
  speed: number,
  pitch: number,
  view: number,
  time = bob,
  lookYaw = 0,
) {
  const moving = Math.min(1, speed / 6.5);
  const idle = 1 - moving;
  const breath = Math.sin(time * 2.15) * 0.018 * (0.45 + idle);
  const shift = Math.sin(time * 0.85) * 0.03 * idle;
  if (rig.chest) {
    rig.chest.position.y = 1.28 + breath;
    rig.chest.scale.set(1, 1 + breath * 1.4, 1);
  }
  if (rig.hips) {
    rig.hips.rotation.z = shift;
    rig.hips.position.y = 0.92 + Math.abs(shift) * 0.1;
  }
  const swing = Math.sin(bob) * moving * 0.55;
  rig.leftArm.rotation.x = swing + breath * 0.4;
  rig.rightArm.rotation.x = -swing * 0.55 - 0.35 + breath * 0.2;
  rig.leftArm.rotation.z = 0.12 + shift;
  rig.rightArm.rotation.z = -0.12 + shift;
  rig.leftLeg.rotation.x = grounded ? -swing : -0.45;
  rig.rightLeg.rotation.x = grounded ? swing : 0.28;
  rig.head.rotation.x = THREE.MathUtils.clamp(pitch * 0.28 + breath * 0.4, -0.5, 0.5);
  rig.head.rotation.y = THREE.MathUtils.damp(rig.head.rotation.y, THREE.MathUtils.clamp(lookYaw, -0.55, 0.55), 6, 0.016);
  if (rig.visor) {
    const wake = 0.7 + 0.3 * Math.sin(time * 3.1);
    rig.visor.scale.set(1, 0.85 + wake * 0.15, 1);
  }
  if (rig.cape) {
    for (let i = 0; i < rig.cape.length; i++) {
      const c = rig.cape[i];
      if (!c) continue;
      const flutter = Math.sin(time * (1.6 + i * 0.35) + i) * (0.08 + moving * 0.22);
      c.rotation.x = 0.18 + moving * 0.35 + flutter;
      c.rotation.z = (i - 2.5) * 0.035 + shift * 0.4;
    }
  }
  if (rig.worldGuns) {
    for (let i = 0; i < rig.worldGuns.length; i++) rig.worldGuns[i]!.visible = i === view;
  }
}
