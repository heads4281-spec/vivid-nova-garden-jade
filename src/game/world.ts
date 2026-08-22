import * as THREE from "three";
import { mulberry32, streamSeed, type CodeProfile } from "./codes";
import type { NameId } from "./story";
import { C as PAL, NAME_COLOR } from "./palette";

export type AABB = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
  id?: string;
};

export type Pickup = {
  id: string;
  kind: "rune" | "ammo" | "health";
  name?: NameId;
  mesh: THREE.Object3D;
  taken: boolean;
  light?: THREE.PointLight;
};

export type Spawn = {
  x: number;
  z: number;
  kind: "wraith" | "sentinel" | "construct" | "shade";
  y?: number;
};

export type Guardian = { name: NameId; x: number; y: number; z: number };

function aabb(x: number, y: number, z: number, w: number, h: number, d: number, id?: string): AABB {
  return {
    minX: x - w / 2,
    maxX: x + w / 2,
    minY: y,
    maxY: y + h,
    minZ: z - d / 2,
    maxZ: z + d / 2,
    id,
  };
}

export function circleHitsAABB(x: number, z: number, r: number, b: AABB) {
  const cx = Math.max(b.minX, Math.min(x, b.maxX));
  const cz = Math.max(b.minZ, Math.min(z, b.maxZ));
  const dx = x - cx;
  const dz = z - cz;
  return dx * dx + dz * dz < r * r;
}

export class World {
  group = new THREE.Group();
  colliders: AABB[] = [];
  hitMeshes: THREE.Object3D[] = [];
  pickups: Pickup[] = [];
  spawns: Spawn[] = [];
  guardians: Guardian[] = [];
  gateCollider: AABB | null = null;
  gateMesh: THREE.Object3D | null = null;
  gateOpen = false;
  private energyMats: THREE.MeshBasicMaterial[] = [];
  private bobbers: { o: THREE.Object3D; y: number; p: number }[] = [];
  private rng: () => number;
  private swarms: {
    pts: THREE.Points;
    vel: Float32Array;
    origin: THREE.Vector3;
    alive: boolean;
    id: string;
  }[] = [];
  private swarmMat: THREE.PointsMaterial | null = null;
  private skyPts: THREE.Points | null = null;
  private galaxyPts: THREE.Points | null = null;
  private emberField: THREE.Mesh | null = null;
  private wellField: THREE.Mesh | null = null;
  private domeHint: THREE.Mesh | null = null;
  private floatInst: THREE.InstancedMesh | null = null;
  private moon: THREE.Mesh | null = null;
  private bolts: THREE.Mesh[] = [];
  private boltT = 0;
  tide = 1;
  emberOn = false;
  skySpin = 1;

  constructor(
    private mats: Record<string, THREE.Material>,
    private profile: CodeProfile,
  ) {
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

  private box(
    mat: THREE.Material,
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    solid = true,
    id?: string,
  ) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
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

  private cyl(mat: THREE.Material, x: number, y: number, z: number, rTop: number, rBot: number, h: number, seg = 8) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, seg), mat);
    mesh.position.set(x, y + h / 2, z);
    this.group.add(mesh);
    this.colliders.push(aabb(x, y, z, rBot * 1.7, h, rBot * 1.7));
    this.hitMeshes.push(mesh);
    return mesh;
  }

  private ground() {
    const geo = new THREE.PlaneGeometry(280, 280, 48, 48);
    const pos = geo.attributes.position;
    if (pos) {
      for (let i = 0; i < pos.count; i++) {
        pos.setZ(i, Math.sin(pos.getX(i) * 0.03) * 0.12 + Math.sin(pos.getY(i) * 0.03) * 0.08);
      }
      pos.needsUpdate = true;
      geo.computeVertexNormals();
    }
    const floor = new THREE.Mesh(geo, this.mats.floor);
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
      id: "ground",
    });
  }

  private outerRing() {
    const h = 18;
    const t = 4;
    const s = 236;
    this.box(this.mats.wall, 0, 0, -118, s, h, t);
    this.box(this.mats.wall, 0, 0, 118, s, h, t);
    this.box(this.mats.wall, -118, 0, 0, t, h, s);
    this.box(this.mats.wall, 118, 0, 0, t, h, s);
  }

  private plaza() {
    const col = this.mats.column;
    const dummy = new THREE.Object3D();
    const geo = new THREE.CylinderGeometry(0.85, 1.05, 9, 8);
    const inst = new THREE.InstancedMesh(geo, col, 28);
    let n = 0;
    const spots: [number, number][] = [
      [-14, 68], [14, 68], [-22, 78], [22, 78], [-8, 88], [8, 88],
      [-32, 58], [32, 58], [-40, 72], [40, 72],
      [-18, 48], [18, 48],
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
      const flame = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 8, 6),
        new THREE.MeshBasicMaterial({ color: 0xff4422, toneMapped: false }),
      );
      flame.position.set(x, 9.2, z);
      this.group.add(flame);
      const lamp = new THREE.PointLight(0xff3311, 3.4, 22, 2);
      lamp.position.set(x, 8.6, z);
      this.group.add(lamp);
    }
    for (const [x, z] of [
      [-14, 68], [14, 68],
    ] as [number, number][]) {
      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.9, 1.1, 9, 8),
        new THREE.MeshBasicMaterial({ color: 0x3a201c, toneMapped: false }),
      );
      shaft.position.set(x, 4.5, z);
      this.group.add(shaft);
    }

    for (const [x, z] of [
      [-6, 72], [6, 72], [0, 62],
    ] as [number, number][]) {
      this.runeCircle(x, z, 3.2);
    }

    this.energyRiver(0, 88, 0, 24, 2.2);
    this.energyRiver(-88, 8, -24, 16, 1.8);
    this.energyRiver(88, 8, 24, 16, 1.8);
    this.energyRiver(0, -22, 0, -70, 1.8);
    this.energyRiver(-70, 8, -52, -40, 1.4);
  }

  private thresholdRift() {
    const wall = this.box(this.mats.body, 0, 0, 96, 40, 16, 3.2);
    wall.visible = false;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(6.5, 0.22, 8, 32), this.mats.energy);
    ring.position.set(0, 4.2, 88);
    this.group.add(ring);
    const veil = new THREE.Mesh(
      new THREE.CircleGeometry(6.2, 24),
      new THREE.MeshBasicMaterial({
        color: PAL.arterial,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    veil.position.set(0, 4.2, 88);
    this.group.add(veil);
    const lamp = new THREE.PointLight(PAL.crimson, 7, 28, 2);
    lamp.position.set(0, 5, 86);
    this.group.add(lamp);
  }

  private pathVeins() {
    this.energyRiver(0, 68, -70, 8, 1.15);
    this.energyRiver(0, 68, 70, 8, 1.15);
    this.energyRiver(0, 68, -40, -18, 0.9);
    this.box(this.mats.wall, -34, 0, 28, 18, 2.4, 4.5);
    this.box(this.mats.wall, -38, 0, 12, 10, 3.2, 8);
    const path = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 90),
      new THREE.MeshBasicMaterial({
        color: 0xff1133,
        transparent: true,
        opacity: 0.42,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    );
    path.rotation.x = -Math.PI / 2;
    path.position.set(0, 0.08, 28);
    this.group.add(path);
  }

  private grandStair() {
    const W = this.mats.wall;
    const E = this.mats.energy;
    this.box(W, 0, 0, 72, 22, 0.35, 22);
    const tiers: [number, number, number][] = [
      [62, 0.35, 18],
      [52, 0.8, 16],
      [42, 1.35, 15],
      [32, 1.9, 14],
    ];
    for (const [z, y, w] of tiers) {
      this.box(W, 0, y, z, w, 0.42, 10);
      this.box(E, 0, y + 0.42, z, 1.4, 0.06, 10, false);
    }
    for (const x of [-9, 9]) {
      this.box(W, x, 0, 48, 1.2, 1.6, 40, false);
    }
    const lamp = new THREE.PointLight(PAL.ember, 8, 36, 2);
    lamp.position.set(0, 8, 50);
    this.group.add(lamp);
    const lamp2 = new THREE.PointLight(PAL.ember, 5, 28, 2);
    lamp2.position.set(0, 6, 36);
    this.group.add(lamp2);
  }

  private horizonArt() {
    const skyline = this.mats.cardApproach ?? this.mats.cardStairs;
    if (skyline) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(110, 52), skyline);
      m.position.set(0, 20, -42);
      this.group.add(m);
    }
    if (this.mats.cardStairs) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(42, 26), this.mats.cardStairs);
      m.position.set(0, 13, -28);
      this.group.add(m);
    }
    if (this.mats.portraitAnkh) {
      const a = new THREE.Mesh(new THREE.PlaneGeometry(6, 8), this.mats.portraitAnkh);
      a.position.set(-11, 8, 20.6);
      this.group.add(a);
      const b = a.clone();
      b.position.set(11, 8, 20.6);
      this.group.add(b);
    }
  }

  private runeCircle(x: number, z: number, r: number) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.08, 8, 32), this.mats.energy);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(x, 0.08, z);
    this.group.add(ring);
  }

  private energyRiver(x1: number, z1: number, x2: number, z2: number, w: number) {
    const dx = x2 - x1;
    const dz = z2 - z1;
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, Math.hypot(dx, dz)), this.mats.energy);
    mesh.rotation.x = -Math.PI / 2;
    mesh.rotation.z = Math.atan2(dx, dz);
    mesh.position.set((x1 + x2) / 2, 0.06, (z1 + z2) / 2);
    this.group.add(mesh);
    if (this.mats.energy instanceof THREE.MeshBasicMaterial) this.energyMats.push(this.mats.energy);
  }

  private palace() {
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
    const gate = this.box(E, 0, 0, 22, 8.5, 11, 0.6, true, "gate");
    this.gateMesh = gate;
    this.gateCollider = this.colliders[this.colliders.length - 1] ?? null;
    const beacon = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 14),
      new THREE.MeshBasicMaterial({
        color: PAL.arterial,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    beacon.position.set(0, 7, 22.4);
    this.group.add(beacon);
    for (const [x, z] of [
      [-18, 22], [18, 22], [-18, -20], [18, -20],
    ] as [number, number][]) {
      this.cyl(Col, x, 0, z, 1.6, 2.0, 22, 8);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(3.2, 6, 8), this.mats.ember);
      roof.position.set(x, 25, z);
      this.group.add(roof);
    }
    this.box(W, 0, 0, 22.4, 9.4, 1.2, 2.4, false);
    const archL = new THREE.Mesh(new THREE.TorusGeometry(5.2, 0.45, 8, 18, Math.PI), this.mats.ember);
    archL.position.set(0, 10.4, 22);
    archL.rotation.z = Math.PI;
    this.group.add(archL);
    for (const x of [-10, 0, 10]) this.cyl(Col, x, 0, -4, 0.7, 0.85, 12, 8);
    this.box(Col, 0, 0, -16.5, 7, 1.1, 4.2);
    this.box(Col, 0, 1.1, -17.6, 4.4, 3.4, 1.2);
    this.runeCircle(0, -14, 4.5);
    this.billboard("cardThrone", 0, 8, -19.2, 12, 10, 0);
    this.billboard("portraitOrigin", -8, 6.2, -18.4, 4.2, 6.2, 0);
    const innerLight = new THREE.PointLight(PAL.crimson, 5.5, 42, 2);
    innerLight.position.set(0, 7, -8);
    this.group.add(innerLight);
    const gateLight = new THREE.PointLight(PAL.arterial, 7, 48, 2);
    gateLight.position.set(0, 8, 22);
    this.group.add(gateLight);
  }

  private silhouette() {
    const n = this.profile.spireCount;
    const crystal = this.mats.body;
    for (let i = 0; i < n; i++) {
      const h = 14 + this.rng() * 24;
      const segs = 5 + Math.floor(this.rng() * 3);
      const a = (i / n) * Math.PI * 2 + this.rng() * 0.4;
      const r = 20 + this.rng() * 16;
      const x = Math.cos(a) * r;
      const z = -42 + Math.sin(a) * r * 0.28 - this.rng() * 10;
      const spire = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5 + this.rng() * 0.8, 1.3 + this.rng() * 1.3, h, segs),
        crystal,
      );
      spire.position.set(x, h / 2, z);
      spire.rotation.y = this.rng() * Math.PI;
      this.group.add(spire);
    }
    const glow = new THREE.PointLight(PAL.arterial, 3.8 + this.profile.glow, 90, 2);
    glow.position.set(0, 22, -28);
    this.group.add(glow);
  }

  private floatRunes() {
    const dummy = new THREE.Object3D();
    const n = this.profile.floatRunes;
    const geo = new THREE.OctahedronGeometry(0.35, 0);
    const inst = new THREE.InstancedMesh(geo, this.mats.ember, n);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + this.rng();
      const r = 20 + this.rng() * 48;
      dummy.position.set(Math.cos(a) * r, 4 + this.rng() * 14, Math.sin(a) * r * 0.7 + 8);
      dummy.rotation.set(this.rng() * 0.6, this.rng() * Math.PI, this.rng() * 0.4);
      dummy.scale.setScalar(0.5 + this.rng() * this.profile.runeScale);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    }
    inst.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.group.add(inst);
    this.floatInst = inst;
  }

  private vaelithCourt() {
    const E = this.mats.ember;
    const pylons: [number, number, number][] = [
      [0, -82, 14], [12, -74, 9], [-14, -76, 10], [18, -90, 8],
      [-16, -92, 11], [8, -96, 7], [-6, -70, 8], [22, -82, 9],
    ];
    for (const [x, z, h] of pylons) {
      this.cyl(E, x, 0, z, 0.45, 1.1, h, 6);
      const flame = new THREE.PointLight(PAL.ember, 2.2, 16, 2);
      flame.position.set(x, h * 0.7, z);
      this.group.add(flame);
    }
    this.runeCircle(0, -82, 6);
    const flame = new THREE.PointLight(PAL.ember, 6, 28, 2);
    flame.position.set(0, 4, -82);
    this.group.add(flame);
    const emberMat = new THREE.MeshBasicMaterial({
      color: PAL.ember,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.emberField = new THREE.Mesh(new THREE.PlaneGeometry(34, 34), emberMat);
    this.emberField.rotation.x = -Math.PI / 2;
    this.emberField.position.set(0, 0.14, -82);
    this.emberField.visible = false;
    this.group.add(this.emberField);
    this.billboard("cardVaelith", 0, 10, -96, 16, 10, 0);
    this.billboard("portraitVaelith", 6, 4.2, -80, 3.2, 5.4, 0);
    for (const [x, z] of [
      [8, -68], [-10, -64], [16, -86], [-20, -78],
    ] as [number, number][]) {
      this.box(this.mats.column, x, 0, z, 2.4, 1.1, 3.2);
    }
  }

  private rynaraArchive() {
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const r = 11 + (i % 3) * 3;
      const x = -78 + Math.cos(a) * r;
      const z = Math.sin(a) * r;
      const h = 7 + (i % 4) * 2.4;
      this.box(this.mats.column, x, 0, z, 2, h, 2);
      const glow = new THREE.Mesh(new THREE.PlaneGeometry(1.3, h * 0.7), this.mats.energy);
      glow.position.set(x + 1.1, h * 0.45, z);
      glow.rotation.y = a + Math.PI / 2;
      this.group.add(glow);
    }
    this.box(this.mats.body, -78, 1.4, 0, 3.6, 2.2, 3.6, false);
    this.runeCircle(-78, 0, 5);
    const l = new THREE.PointLight(PAL.crimson, 3.4, 24, 2);
    l.position.set(-78, 5, 0);
    this.group.add(l);
    this.billboard("cardRynara", -96, 9, 0, 14, 10, Math.PI / 2);
    this.billboard("portraitRynara", -76, 4.4, 8, 3.2, 5.4, Math.PI / 2);
  }

  private sanguaraCanals() {
    this.energyRiver(52, -18, 96, -18, 4.2);
    this.energyRiver(52, 18, 96, 18, 4.2);
    this.energyRiver(74, -22, 74, 26, 3.4);
    this.energyRiver(58, 0, 92, 0, 3);
    const water = new THREE.Mesh(new THREE.PlaneGeometry(48, 48), this.mats.water);
    water.rotation.x = -Math.PI / 2;
    water.position.set(76, 0.04, 2);
    this.group.add(water);
    for (const z of [-18, 18, 0]) this.box(this.mats.wall, 64, 0, z, 16, 0.5, 1.4, false);
    this.box(this.mats.body, 80, 0, 4, 8, 0.55, 8);
    this.box(this.mats.wall, 72, 0.2, -8, 10, 0.35, 1.6);
    this.box(this.mats.wall, 88, 0.2, 14, 10, 0.35, 1.6);
    for (const [x, z] of [
      [68, -10], [90, 16], [70, 14],
    ] as [number, number][]) {
      this.cyl(this.mats.ember, x, 0, z, 0.18, 0.35, 2.4, 4);
    }
    this.runeCircle(80, 4, 5);
    const l = new THREE.PointLight(0xe25a4a, 4, 26, 2);
    l.position.set(80, 4, 4);
    this.group.add(l);
    this.billboard("cardSanguara", 98, 8, 4, 14, 10, -Math.PI / 2);
    this.billboard("portraitSanguara", 78, 4.2, 12, 3.2, 5.4, -Math.PI / 2);
  }

  private nyxaraRise() {
    for (const [x, y, z, s] of [
      [-40, 1.2, -18, 8],
      [-48, 3.4, -30, 7],
      [-58, 5.8, -40, 7],
      [-52, 8.4, -52, 9],
      [-42, 6.6, -44, 6],
      [-62, 7.2, -28, 5],
    ] as [number, number, number, number][]) {
      this.box(this.mats.wall, x, y, z, s, 0.5, s);
      this.runeCircle(x, z, s * 0.35);
    }
    for (const [x1, y1, z1, x2, y2, z2] of [
      [-40, 1.7, -18, -48, 3.9, -30],
      [-48, 3.9, -30, -58, 6.3, -40],
      [-58, 6.3, -40, -52, 8.9, -52],
      [-52, 8.9, -52, -42, 7.1, -44],
    ] as [number, number, number, number, number, number][]) {
      const dx = x2 - x1;
      const dz = z2 - z1;
      const len = Math.hypot(dx, dz);
      const m = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.18, len), this.mats.energy);
      m.position.set((x1 + x2) / 2, (y1 + y2) / 2, (z1 + z2) / 2);
      m.rotation.y = Math.atan2(dx, dz);
      m.rotation.x = Math.atan2(y2 - y1, len) * 0.4;
      this.group.add(m);
      this.colliders.push(aabb((x1 + x2) / 2, (y1 + y2) / 2 - 0.2, (z1 + z2) / 2, 1.6, 0.5, len));
    }
    const l = new THREE.PointLight(0x8844ff, 3.6, 22, 2);
    l.position.set(-52, 12, -52);
    this.group.add(l);
    const wellMat = new THREE.MeshBasicMaterial({
      color: 0x6611ff,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    this.wellField = new THREE.Mesh(new THREE.CircleGeometry(7, 24), wellMat);
    this.wellField.rotation.x = -Math.PI / 2;
    this.wellField.position.set(-52, 8.95, -52);
    this.wellField.visible = false;
    this.group.add(this.wellField);
    this.billboard("cardNyxara", -52, 14, -62, 14, 10, 0);
    this.billboard("portraitNyxara", -48, 11.2, -50, 3, 5.2, 0);
    this.billboard("portraitNyxStand", -62, 10.4, -36, 3.2, 5.4, Math.PI / 3);
  }

  private billboard(key: string, x: number, y: number, z: number, w: number, h: number, rotY = Math.PI) {
    const mat = this.mats[key];
    if (!mat) return;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    m.position.set(x, y, z);
    m.rotation.y = rotY;
    this.group.add(m);
  }

  private pickupsAndSpawns() {
    this.addRune("vaelith", 0, 1.15, -82);
    this.addRune("rynara", -78, 1.15, 0);
    this.addRune("sanguara", 80, 1.15, 4);
    this.addRune("nyxara", -52, 9.6, -52);
    this.addRune("eryndra", 0, 2.3, -15.2);
    this.guardians = [
      { name: "vaelith", x: 6, y: 0, z: -78 },
      { name: "rynara", x: -72, y: 0, z: 8 },
      { name: "sanguara", x: 74, y: 0, z: 10 },
      { name: "nyxara", x: -46, y: 8.4, z: -48 },
      { name: "eryndra", x: 0, y: 0, z: -10 },
      { name: "aelith", x: 0, y: 0, z: -8 },
    ];
    for (const [x, y, z] of [
      [10, 0.5, 70], [-12, 0.5, 64], [40, 0.5, 10], [-44, 0.5, -8],
      [6, 0.5, -50], [24, 0.5, -30], [-48, 4, -30], [64, 0.5, -18],
      [12, 0.5, -90], [-16, 0.5, -90], [90, 0.5, -16], [8, 1.4, 52],
      [-8, 1.4, 42], [-70, 0.5, 8],
    ] as [number, number, number][]) this.addCrate("ammo", x, y, z);
    for (const [x, y, z] of [
      [0, 0.5, 62], [-30, 0.5, 20], [28, 0.5, -12], [0, 1.6, -12],
      [-52, 9, -52], [80, 1.1, 4], [0, 0.5, -82], [-78, 0.5, 4],
    ] as [number, number, number][]) this.addCrate("health", x, y, z);
    const ring = (cx: number, cz: number, r: number, n: number, kind: Spawn["kind"]) => {
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + 0.4;
        this.spawns.push({
          x: cx + Math.cos(a) * r + (this.rng() - 0.5) * 3.2,
          z: cz + Math.sin(a) * r + (this.rng() - 0.5) * 3.2,
          kind,
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
    this.spawns.push({ x: 18, z: 68, kind: "shade" }, { x: -20, z: 66, kind: "shade" });
    this.spawns.push({ x: 8, z: 36, kind: "wraith" }, { x: -8, z: 36, kind: "wraith" });
    for (let i = 0; i < this.profile.extraWraiths; i++) {
      const a = this.rng() * Math.PI * 2;
      const r = 16 + this.rng() * 22;
      this.spawns.push({ x: Math.cos(a) * r, z: 8 + Math.sin(a) * r * 0.5, kind: "wraith" });
    }
    for (let i = 0; i < this.profile.extraShades; i++) {
      const a = this.rng() * Math.PI * 2;
      this.spawns.push({ x: Math.cos(a) * 22, z: Math.sin(a) * 18, kind: "shade" });
    }
  }

  private addRune(name: NameId, x: number, y: number, z: number) {
    const len = Math.hypot(x, z) || 1;
    this.livingPillar(x + (x / len) * 2.15, z + (z / len) * 2.15, Math.max(0, y - 1.15), name);
    const g = new THREE.Group();
    const s = this.profile.runeScale;
    const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.55 * s, 0), this.mats.ember);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.8 * s, 0.06, 6, 20), this.mats.energy);
    ring.rotation.x = Math.PI / 2;
    g.add(core, ring);
    g.position.set(x, y, z);
    this.group.add(g);
    const light = new THREE.PointLight(NAME_COLOR[name] ?? PAL.crimson, 1.6 + this.profile.glow, 10, 2);
    g.add(light);
    this.bobbers.push({ o: g, y, p: this.rng() * Math.PI * 2 });
    this.pickups.push({ id: `rune-${name}`, kind: "rune", name, mesh: g, taken: false, light });
    this.emberSwarm(x, y, z, `rune-${name}`, 96 + Math.floor(this.profile.glow * 55));
  }

  private livingPillar(x: number, z: number, y: number, name: NameId) {
    const h = 7.6 + this.rng() * 1.4;
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.85, h, 1.85), this.mats.body);
    body.position.set(x, y + h / 2, z);
    this.group.add(body);
    this.hitMeshes.push(body);
    this.colliders.push(aabb(x, y, z, 1.9, h, 1.9));
    const key = `portrait${name[0]!.toUpperCase()}${name.slice(1)}`;
    const faceMat = this.mats[key] ?? this.mats.energy;
    const face = new THREE.Mesh(new THREE.PlaneGeometry(1.45, h * 0.78), faceMat);
    face.position.set(x, y + h * 0.48, z + 0.96);
    this.group.add(face);
    const light = new THREE.PointLight(NAME_COLOR[name] ?? PAL.arterial, 1.4 + this.profile.glow * 0.6, 14, 2);
    light.position.set(x, y + h * 0.6, z);
    this.group.add(light);
    this.bobbers.push({ o: body, y: y + h / 2, p: this.rng() * Math.PI * 2 });
    this.bobbers.push({ o: face, y: y + h * 0.48, p: this.rng() * Math.PI * 2 });
  }

  private addCrate(kind: "ammo" | "health", x: number, y: number, z: number) {
    const mat = kind === "ammo" ? this.mats.ember : this.mats.column;
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.45, 0.7), mat);
    mesh.position.set(x, y, z);
    this.group.add(mesh);
    this.bobbers.push({ o: mesh, y, p: this.rng() * 6 });
    this.pickups.push({ id: `${kind}-${x}-${z}`, kind, mesh, taken: false });
  }

  private emberSwarm(x: number, y: number, z: number, id: string, count: number) {
    if (!this.swarmMat) {
      this.swarmMat = new THREE.PointsMaterial({
        color: PAL.arterial,
        size: 0.18 + this.profile.glow * 0.08,
        transparent: true,
        opacity: 0.88,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      });
    }
    const positions = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (this.rng() - 0.5) * 4.6;
      positions[i * 3 + 1] = this.rng() * 11;
      positions[i * 3 + 2] = (this.rng() - 0.5) * 4.6;
      vel[i * 3] = (this.rng() - 0.5) * 0.42;
      vel[i * 3 + 1] = 0.62 + this.rng() * 0.9;
      vel[i * 3 + 2] = (this.rng() - 0.5) * 0.42;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const pts = new THREE.Points(geo, this.swarmMat);
    pts.position.set(x, y - 0.4, z);
    this.group.add(pts);
    this.swarms.push({ pts, vel, origin: new THREE.Vector3(x, y, z), alive: true, id });
  }

  private skyVeins() {
    const n = 240;
    const positions = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      positions[i * 3] = (this.rng() - 0.5) * 180;
      positions[i * 3 + 1] = 18 + this.rng() * 55;
      positions[i * 3 + 2] = (this.rng() - 0.5) * 180 - 20;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    this.skyPts = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        color: PAL.ankh,
        size: 0.32,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      }),
    );
    this.group.add(this.skyPts);
  }

  private bloodMoon() {
    const mat = new THREE.MeshBasicMaterial({ color: 0xff2244, fog: false, toneMapped: false });
    const moon = new THREE.Mesh(new THREE.SphereGeometry(32, 28, 18), mat);
    moon.position.set(-48, 58, -72);
    this.group.add(moon);
    const haze = new THREE.Mesh(
      new THREE.SphereGeometry(36, 16, 12),
      new THREE.MeshBasicMaterial({
        color: 0xff0033,
        transparent: true,
        opacity: 0.18,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        fog: false,
        side: THREE.BackSide,
      }),
    );
    haze.position.copy(moon.position);
    this.group.add(haze);
    this.moon = moon;
  }

  private lightningBolts() {
    this.bolts = [];
    for (let i = 0; i < 3; i++) {
      const geo = new THREE.PlaneGeometry(1.4, 48);
      const mat = new THREE.MeshBasicMaterial({
        color: 0xff6688,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        fog: false,
        side: THREE.DoubleSide,
      });
      const m = new THREE.Mesh(geo, mat);
      m.position.set((i - 1) * 28, 36, -70 - i * 18);
      m.rotation.z = (i - 1) * 0.12;
      this.group.add(m);
      this.bolts.push(m);
    }
  }

  flashLightning(t: number) {
    this.boltT -= 1 / 60;
    if (this.boltT <= 0 && Math.random() < 0.012) {
      this.boltT = 0.12 + Math.random() * 0.1;
      const b = this.bolts[Math.floor(Math.random() * this.bolts.length)];
      if (b) {
        b.position.x = (Math.random() - 0.5) * 90;
        b.position.z = -40 - Math.random() * 80;
        b.rotation.y = Math.random() * 0.4;
        (b.material as THREE.MeshBasicMaterial).opacity = 0.85;
      }
    }
    for (const b of this.bolts) {
      const mat = b.material as THREE.MeshBasicMaterial;
      if (mat.opacity > 0) mat.opacity = Math.max(0, mat.opacity - 0.08);
    }
    if (this.moon) {
      const s = 1 + Math.sin(t * 0.35) * 0.03;
      this.moon.scale.setScalar(s);
    }
  }

  private milkyWay() {
    const n = this.profile.galaxyCount;
    const positions = new Float32Array(n * 3);
    const colors = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const r = 90 + this.rng() * 240;
      const theta = this.rng() * Math.PI * 2;
      const arm = Math.floor(this.rng() * 3);
      const a = theta + arm * 2.1 + r * 0.012;
      const phi = (this.rng() - 0.5) * 0.55;
      positions[i * 3] = Math.cos(a) * r * Math.cos(phi);
      positions[i * 3 + 1] = 72 + Math.sin(phi) * r * 0.28 + this.rng() * 40;
      positions[i * 3 + 2] = Math.sin(a) * r * Math.cos(phi) - 40;
      const hot = this.rng();
      colors[i * 3] = 1;
      colors[i * 3 + 1] = hot < 0.7 ? 0.02 + hot * 0.12 : 0.55;
      colors[i * 3 + 2] = hot < 0.7 ? 0.14 + hot * 0.12 : 0.04;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    this.galaxyPts = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        vertexColors: true,
        size: Math.min(0.38, this.profile.galaxySize * 0.45),
        transparent: true,
        opacity: 0.42,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      }),
    );
    this.group.add(this.galaxyPts);
  }

  quenchRune(name: NameId) {
    const id = `rune-${name}`;
    for (const s of this.swarms) if (s.id === id) s.alive = false;
  }

  gift(kind: "ammo" | "health", x: number, z: number) {
    this.addCrate(kind, x, 0.5, z);
  }

  setDetail(high: boolean) {
    if (this.skyPts) this.skyPts.visible = high;
    if (this.galaxyPts) this.galaxyPts.visible = high;
  }

  syncMoment(opts: { ember: boolean; jump: number; night: number; tide: number; resist: number }) {
    this.emberOn = opts.ember;
    this.tide = opts.tide > 0 ? -1.8 : 1;
    if (this.emberField) this.emberField.visible = opts.ember;
    if (this.wellField) this.wellField.visible = opts.jump > 1.4;
    if (this.domeHint) this.domeHint.visible = opts.resist > 0;
    const e = this.mats.energy;
    if (e instanceof THREE.MeshBasicMaterial) e.opacity = opts.night > 1.8 ? 0.45 : 0.92;
  }

  setGateOpen(open: boolean) {
    this.gateOpen = open;
    if (this.gateMesh) this.gateMesh.visible = !open;
    if (this.gateCollider) {
      this.gateCollider.maxY = open ? -1 : 11;
    }
  }

  getZone(x: number, y: number, z: number) {
    if (y > 4 && x < -32 && z < -18) return { id: "nyxara", name: "The Night Ascendant" };
    if (Math.abs(x) < 20 && z > -22 && z < 24) return { id: "eryndra", name: "The Eternal Throne" };
    if (z < -60) return { id: "vaelith", name: "Court of the First Flame" };
    if (x < -58) return { id: "rynara", name: "The Rune Archive" };
    if (x > 58) return { id: "sanguara", name: "Blood Canals" };
    if (z > 50) return { id: "plaza", name: "The Threshold" };
    if (z > 22) return { id: "stair", name: "Grand Staircase" };
    return { id: "approach", name: "Palace Approach" };
  }

  update(t: number) {
    for (const b of this.bobbers) {
      b.o.position.y = b.y + Math.sin(t * 1.6 + b.p) * 0.16;
      b.o.rotation.y = t * 0.7 + b.p;
    }
    const e = this.mats.energy;
    if (e instanceof THREE.MeshBasicMaterial && e.map) e.map.offset.y = (t * 0.12 * this.tide) % 1;
    if (this.emberField) {
      const mat = this.emberField.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.28 + Math.sin(t * 6) * 0.14;
    }
    if (this.wellField) {
      this.wellField.rotation.z = t * 0.7;
      const mat = this.wellField.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.18 + Math.sin(t * 2.2) * 0.1;
    }
    if (this.floatInst) this.floatInst.rotation.y = t * 0.04 * this.skySpin;
    if (this.skyPts) {
      this.skyPts.rotation.y = t * 0.012;
      const mat = this.skyPts.material as THREE.PointsMaterial;
      mat.opacity = 0.4 + Math.sin(t * 1.3) * 0.18;
    }
    if (this.galaxyPts) this.galaxyPts.rotation.y = t * 0.008 * this.skySpin;
    const dt = 1 / 60;
    for (const s of this.swarms) {
      const pos = s.pts.geometry.getAttribute("position");
      const arr = pos.array as Float32Array;
      const mat = s.pts.material as THREE.PointsMaterial;
      if (!s.alive) {
        mat.opacity = Math.max(0, mat.opacity - 0.02);
        s.pts.visible = mat.opacity > 0.02;
        continue;
      }
      for (let i = 0; i < pos.count; i++) {
        const i3 = i * 3;
        arr[i3] = (arr[i3] ?? 0) + (s.vel[i3] ?? 0) * dt + Math.sin(t * 2 + i) * 0.008;
        arr[i3 + 1] = (arr[i3 + 1] ?? 0) + (s.vel[i3 + 1] ?? 0) * dt;
        arr[i3 + 2] = (arr[i3 + 2] ?? 0) + (s.vel[i3 + 2] ?? 0) * dt + Math.cos(t * 1.7 + i) * 0.008;
        if ((arr[i3 + 1] ?? 0) > 12) {
          arr[i3] = (this.rng() - 0.5) * 4.6;
          arr[i3 + 1] = 0;
          arr[i3 + 2] = (this.rng() - 0.5) * 4.6;
        }
      }
      pos.needsUpdate = true;
    }
  }

  dispose() {
    this.group.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
    });
  }
}
