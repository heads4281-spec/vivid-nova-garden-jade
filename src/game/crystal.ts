import * as THREE from "three";

type CrystalKind = "floor" | "wall" | "column" | "armor" | "blade" | "ember";

type CrystalOpts = {
  kind: CrystalKind;
  map?: THREE.Texture | null;
  color?: number;
  crack?: number;
  glow?: number;
  scale?: number;
  octaves?: number;
  displace?: number;
};

const clock = { value: 0 };
const octaves = { value: 4 };

const KIND_DEFAULTS: Record<
  CrystalKind,
  { color: number; crack: number; glow: number; scale: number; displace: number; metal: number; rough: number; emis: number }
> = {
  floor: { color: 0xc8b4a8, crack: 0xff1a1a, glow: 1.55, scale: 2.6, displace: 0, metal: 0.18, rough: 0.68, emis: 0.38 },
  wall: { color: 0xb8a49c, crack: 0xff2233, glow: 1.35, scale: 3.4, displace: 0, metal: 0.22, rough: 0.58, emis: 0.32 },
  column: { color: 0xd0b8b0, crack: 0xff3344, glow: 1.65, scale: 4.2, displace: 0.004, metal: 0.28, rough: 0.48, emis: 0.4 },
  armor: { color: 0x2a181c, crack: 0xff1a2a, glow: 1.9, scale: 6.4, displace: 0.006, metal: 0.78, rough: 0.28, emis: 0.55 },
  blade: { color: 0x3a0a10, crack: 0xff0033, glow: 2.6, scale: 8.2, displace: 0.003, metal: 0.84, rough: 0.18, emis: 1.05 },
  ember: { color: 0xff4400, crack: 0xff6622, glow: 2.8, scale: 5.4, displace: 0.005, metal: 0.22, rough: 0.28, emis: 1.5 },
};

const CRACK_GLSL = /* glsl */ `
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
export function procCrystalCanvas(kind: CrystalKind): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  if (!g) return c;
  const dark = kind === "armor" || kind === "blade" ? "#14080a" : kind === "ember" ? "#3a0c08" : "#2a1614";
  const mid = kind === "armor" || kind === "blade" ? "#1c0c10" : "#4a2a24";
  g.fillStyle = dark;
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 48; i++) {
    const x = (i * 47) % 256;
    const y = (i * 89) % 256;
    g.fillStyle = mid;
    g.globalAlpha = 0.18 + (i % 5) * 0.04;
    g.fillRect(x, y, 18 + (i % 12), 10 + (i % 8));
  }
  g.globalAlpha = 1;
  g.strokeStyle = kind === "ember" ? "#ff6622" : "#ff1a2a";
  g.lineWidth = kind === "blade" ? 1.4 : 2.2;
  g.globalCompositeOperation = "lighter";
  for (let i = 0; i < 14; i++) {
    g.beginPath();
    const x0 = (i * 37) % 256;
    let x = x0;
    let y = 0;
    g.moveTo(x, y);
    while (y < 256) {
      x += Math.sin((i + 1) * 1.7 + y * 0.04) * 18;
      y += 18;
      g.lineTo(x, y);
    }
    g.stroke();
  }
  g.globalCompositeOperation = "source-over";
  g.globalAlpha = 0.35;
  g.fillStyle = "#0a0406";
  for (let i = 0; i < 30; i++) {
    g.fillRect((i * 53) % 256, (i * 97) % 256, 6, 6);
  }
  return c;
}

export function createCrystalMaterial(opts: CrystalOpts): THREE.MeshStandardMaterial {
  const d = KIND_DEFAULTS[opts.kind];
  const mat = new THREE.MeshStandardMaterial({
    color: opts.color ?? d.color,
    map: opts.map ?? null,
    roughness: d.rough,
    metalness: d.metal,
    emissive: new THREE.Color(opts.crack ?? d.crack),
    emissiveIntensity: d.emis,
    envMapIntensity: 0.7,
    fog: true,
  });
  const crack = new THREE.Color(opts.crack ?? d.crack);
  const glow = opts.glow ?? d.glow;
  const scale = opts.scale ?? d.scale;
  const disp = opts.displace ?? d.displace;

  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = clock;
    shader.uniforms.uCrackScale = { value: scale };
    shader.uniforms.uOctaves = octaves;
    shader.uniforms.uCrackColor = { value: crack };
    shader.uniforms.uGlowIntensity = { value: glow };

    shader.vertexShader = shader.vertexShader.replace(
      "#include <common>",
      `#include <common>
      uniform float uTime;
      varying vec3 vCrystalPos;`,
    );
    // Do NOT read `worldPosition` — it is #if-guarded and missing without env/shadows.
    if (shader.vertexShader.includes("#include <begin_vertex>")) {
      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        transformed += objectNormal * (sin(position.x * 11.0 + position.y * 7.0 + uTime * 0.45) * ${disp.toFixed(5)});
        vec4 crystalWorld = vec4(transformed, 1.0);
        #ifdef USE_BATCHING
          crystalWorld = batchingMatrix * crystalWorld;
        #endif
        #ifdef USE_INSTANCING
          crystalWorld = instanceMatrix * crystalWorld;
        #endif
        vCrystalPos = (modelMatrix * crystalWorld).xyz;`,
      );
    }

    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <common>",
      `#include <common>
      ${CRACK_GLSL}`,
    );
    if (shader.fragmentShader.includes("#include <opaque_fragment>")) {
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <opaque_fragment>",
        `#include <opaque_fragment>
        vec3 crPos = vCrystalPos * uCrackScale;
        float warp = fbmCr(crPos * 0.55 + uTime * 0.05);
        float crN = fbmCr(crPos + warp * 1.8 + vec3(0.0, uTime * 0.07, 0.0));
        float cracks = pow(smoothstep(0.40, 0.62, crN), 2.4);
        float pulse = 0.62 + 0.38 * sin(uTime * 2.6);
        gl_FragColor.rgb = mix(gl_FragColor.rgb, uCrackColor, cracks * 0.45);
        gl_FragColor.rgb += uCrackColor * cracks * uGlowIntensity * pulse * 0.38;`,
      );
    }
  };
  mat.customProgramCacheKey = () => `crystal-v3-${opts.kind}-${disp}`;
  return mat;
}

export function tickCrystal(time: number, _fog?: THREE.Fog | THREE.FogExp2 | null) {
  clock.value = time;
}

export function setCrystalQuality(q: 360 | 720 | 1080) {
  octaves.value = q >= 1080 ? 3 : q >= 720 ? 2 : 1;
}

export function crystalMetal(opts?: { ember?: number; glow?: number }) {
  return createCrystalMaterial({
    kind: "armor",
    color: 0x2a181c,
    crack: opts?.ember ?? 0xff1a1a,
    glow: opts?.glow ?? 1.8,
  });
}

export function crystalBlade(ember = 0xff1a1a) {
  return createCrystalMaterial({
    kind: "blade",
    crack: ember,
    glow: 2.5,
  });
}

export function disposeCrystal() {
  clock.value = 0;
}
