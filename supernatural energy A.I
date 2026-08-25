<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Holographic Atlas — CRIMSON SOVEREIGN | Type VII Palace</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    overflow: hidden;
    background: #050008;
    font-family: 'Segoe UI', system-ui, sans-serif;
    color: #ff6b6b;
    user-select: none;
  }
  #container { width: 100vw; height: 100vh; position: relative; }
  canvas { display: block; }

  /* Overlay UI */
  #ui {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 10;
  }
  #header {
    position: absolute;
    top: 24px;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    pointer-events: none;
  }
  #header h1 {
    font-size: 1.8rem;
    letter-spacing: 4px;
    color: #ff3333;
    text-shadow: 0 0 20px #ff0000, 0 0 40px #ff000080;
  }
  #header p {
    font-size: 0.85rem;
    color: #ff9999;
    opacity: 0.8;
    margin-top: 4px;
  }

  #panel {
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(20, 0, 10, 0.85);
    border: 1px solid #ff3333;
    border-radius: 12px;
    padding: 18px 28px;
    min-width: 340px;
    text-align: center;
    pointer-events: auto;
    box-shadow: 0 0 30px #ff000040;
  }
  #panel h2 {
    font-size: 1.1rem;
    color: #ff5555;
    margin-bottom: 8px;
  }
  #coords {
    font-family: monospace;
    font-size: 1rem;
    color: #0ff;
    margin: 6px 0 12px;
  }
  #status {
    font-size: 0.9rem;
    color: #ffaa88;
    margin-bottom: 14px;
  }
  .btn {
    display: inline-block;
    margin: 4px 6px;
    padding: 8px 18px;
    background: linear-gradient(135deg, #4a0000, #2a0000);
    border: 1px solid #ff4444;
    color: #ffcccc;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.85rem;
    transition: all 0.2s;
  }
  .btn:hover {
    background: linear-gradient(135deg, #6a0000, #3a0000);
    box-shadow: 0 0 12px #ff000080;
  }
  .btn.active {
    background: linear-gradient(135deg, #880000, #440000);
    border-color: #ffaa00;
    color: #ffeeaa;
  }

  #legend {
    position: absolute;
    top: 90px;
    left: 24px;
    background: rgba(10, 0, 5, 0.75);
    border: 1px solid #ff333366;
    border-radius: 8px;
    padding: 12px 16px;
    font-size: 0.8rem;
    line-height: 1.6;
    pointer-events: none;
  }
  #legend span { color: #ff8888; }

  #close {
    position: absolute;
    top: 20px;
    right: 24px;
    background: rgba(40,0,0,0.7);
    border: 1px solid #ff4444;
    color: #ffaaaa;
    padding: 8px 14px;
    border-radius: 6px;
    cursor: pointer;
    pointer-events: auto;
    font-size: 0.85rem;
  }
  #close:hover { background: #4a0000; }

  #hint {
    position: absolute;
    bottom: 110px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.75rem;
    color: #ff6666aa;
    pointer-events: none;
  }
</style>
</head>
<body>
<div id="container">
  <div id="ui">
    <div id="header">
      <h1>HOLOGRAPHIC ATLAS</h1>
      <p>Type VII Palace • Living Runes • Threshold Cycle</p>
    </div>

    <div id="legend">
      <div><span>●</span> Kaelith Forge — Ember Anvil</div>
      <div><span>●</span> Vespera Hollow — Whisper Well</div>
      <div><span>●</span> Ankh Spire — Climb of Law</div>
      <div style="margin-top:8px;opacity:0.7">Click marker to lock waypoint</div>
    </div>

    <button id="close">✕ Close Atlas (Esc)</button>

    <div id="panel">
      <h2 id="courtName">Select a Court</h2>
      <div id="coords">— , —</div>
      <div id="status">No waypoint locked</div>
      <button class="btn" id="btnKaelith">Kaelith Forge</button>
      <button class="btn" id="btnVespera">Vespera Hollow</button>
      <button class="btn" id="btnAnkh">Ankh Spire</button>
      <button class="btn" id="btnClear" style="margin-top:8px;border-color:#666">Clear Waypoint</button>
    </div>

    <div id="hint">Drag to rotate • Scroll to zoom • M opens atlas in main game</div>
  </div>
</div>

<script type="importmap">
{
  "imports": {
    "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
    "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/"
  }
}
</script>

<script type="module">
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ---------- Court Data (from repo lore) ----------
const COURTS = {
  kaelith: {
    name: "Kaelith Forge",
    subtitle: "Ember Anvil",
    x: 78,
    z: 68,
    color: 0xff4422,
    desc: "SE of spawn • Forge of living flame"
  },
  vespera: {
    name: "Vespera Hollow",
    subtitle: "Whisper Well",
    x: -78,
    z: 68,
    color: 0xaa44ff,
    desc: "SW of spawn • Echoes of the deep"
  },
  ankh: {
    name: "Ankh Spire",
    subtitle: "Climb of Law",
    x: 78,
    z: -72,
    color: 0x44aaff,
    desc: "NE of Vaelith • Ascension path"
  }
};

// ---------- Scene ----------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050008);
scene.fog = new THREE.FogExp2(0x0a0010, 0.015);

const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 500);
camera.position.set(0, 45, 70);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
document.getElementById('container').appendChild(renderer.domElement);

// Soft ambient + red accent
scene.add(new THREE.AmbientLight(0x331122, 0.6));
const accent = new THREE.PointLight(0xff2233, 1.8, 120);
accent.position.set(0, 30, 0);
scene.add(accent);

// ---------- Holographic base platform ----------
const baseGeo = new THREE.CylinderGeometry(38, 42, 1.5, 64);
const baseMat = new THREE.MeshStandardMaterial({
  color: 0x1a0008,
  emissive: 0x330011,
  emissiveIntensity: 0.4,
  roughness: 0.7,
  metalness: 0.3,
  transparent: true,
  opacity: 0.9
});
const base = new THREE.Mesh(baseGeo, baseMat);
base.position.y = -1;
scene.add(base);

// Outer ring
const ring = new THREE.Mesh(
  new THREE.TorusGeometry(40, 0.6, 16, 100),
  new THREE.MeshStandardMaterial({
    color: 0xff3333,
    emissive: 0xff0000,
    emissiveIntensity: 0.8,
    transparent: true,
    opacity: 0.7
  })
);
ring.rotation.x = Math.PI / 2;
ring.position.y = 0.2;
scene.add(ring);

// ---------- Grid / Rune floor ----------
const gridHelper = new THREE.GridHelper(80, 20, 0xff2244, 0x441122);
gridHelper.position.y = 0.05;
scene.add(gridHelper);

// ---------- Court Markers ----------
const markers = {};
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function createMarker(key, data) {
  const group = new THREE.Group();

  // Glowing sphere
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.8, 24, 24),
    new THREE.MeshStandardMaterial({
      color: data.color,
      emissive: data.color,
      emissiveIntensity: 1.4,
      transparent: true,
      opacity: 0.9
    })
  );
  group.add(sphere);

  // Vertical beam
  const beam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.15, 18, 8),
    new THREE.MeshBasicMaterial({
      color: data.color,
      transparent: true,
      opacity: 0.35
    })
  );
  beam.position.y = 9;
  group.add(beam);

  // Scale coordinates to map space (rough visual mapping)
  const scale = 0.28;
  group.position.set(data.x * scale, 1.5, data.z * scale);
  group.userData = { key, data };

  scene.add(group);
  markers[key] = group;
  return group;
}

Object.entries(COURTS).forEach(([key, data]) => createMarker(key, data));

// ---------- Spawn indicator ----------
const spawn = new THREE.Mesh(
  new THREE.OctahedronGeometry(1.2, 0),
  new THREE.MeshStandardMaterial({
    color: 0xffaa00,
    emissive: 0xff6600,
    emissiveIntensity: 1.2
  })
);
spawn.position.set(0, 1.5, 0);
scene.add(spawn);

// ---------- Controls ----------
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 25;
controls.maxDistance = 120;
controls.maxPolarAngle = Math.PI * 0.48;

// ---------- UI Logic ----------
let lockedKey = localStorage.getItem('atlas_waypoint') || null;

function updateUI(key) {
  const nameEl = document.getElementById('courtName');
  const coordsEl = document.getElementById('coords');
  const statusEl = document.getElementById('status');

  // Reset buttons
  document.querySelectorAll('.btn').forEach(b => b.classList.remove('active'));

  if (!key) {
    nameEl.textContent = 'Select a Court';
    coordsEl.textContent = '— , —';
    statusEl.textContent = 'No waypoint locked';
    return;
  }

  const data = COURTS[key];
  nameEl.textContent = data.name + ' — ' + data.subtitle;
  coordsEl.textContent = `${data.x} , ${data.z}`;
  statusEl.textContent = lockedKey === key ? '✓ Waypoint Locked' : 'Click again or use button to lock';
  statusEl.style.color = lockedKey === key ? '#0f0' : '#ffaa88';

  const btn = document.getElementById('btn' + key.charAt(0).toUpperCase() + key.slice(1));
  if (btn) btn.classList.add('active');
}

function lockWaypoint(key) {
  lockedKey = key;
  localStorage.setItem('atlas_waypoint', key);
  updateUI(key);

  // Visual feedback – pulse the marker
  const m = markers[key];
  if (m) {
    m.scale.set(1.4, 1.4, 1.4);
    setTimeout(() => m.scale.set(1, 1, 1), 300);
  }
}

function clearWaypoint() {
  lockedKey = null;
  localStorage.removeItem('atlas_waypoint');
  updateUI(null);
}

// Button events
document.getElementById('btnKaelith').onclick = () => lockWaypoint('kaelith');
document.getElementById('btnVespera').onclick = () => lockWaypoint('vespera');
document.getElementById('btnAnkh').onclick = () => lockWaypoint('ankh');
document.getElementById('btnClear').onclick = clearWaypoint;

document.getElementById('close').onclick = () => {
  // In full game this would close the atlas overlay
  // For standalone we just show a message
  if (confirm('Close Holographic Atlas?\n(In the main game this returns to play)')) {
    window.history.back();
  }
};

// Click markers
renderer.domElement.addEventListener('pointerdown', (event) => {
  mouse.x = (event.clientX / innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(Object.values(markers), true);
  if (intersects.length > 0) {
    let obj = intersects[0].object;
    while (obj && !obj.userData.key) obj = obj.parent;
    if (obj && obj.userData.key) {
      lockWaypoint(obj.userData.key);
    }
  }
});

// Keyboard
window.addEventListener('keydown', (e) => {
  if (e.code === 'Escape') document.getElementById('close').click();
});

// Init UI
if (lockedKey) updateUI(lockedKey);
else updateUI(null);

// ---------- Animation ----------
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  // Rotate ring slowly
  ring.rotation.z = t * 0.15;

  // Pulse markers
  Object.values(markers).forEach((m, i) => {
    const s = 1 + Math.sin(t * 2 + i) * 0.08;
    m.children[0].scale.set(s, s, s);
  });

  // Spawn pulse
  spawn.rotation.y = t * 0.8;
  spawn.position.y = 1.5 + Math.sin(t * 3) * 0.3;

  controls.update();
  renderer.render(scene, camera);
}
animate();

// Resize
window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
</script>
</body>
</html>