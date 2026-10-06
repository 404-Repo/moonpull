import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// ---------- helpers ----------
const $ = (id) => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
function ss(a, b, x) { x = clamp((x - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); }
function hash(i, j) { const h = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return h - Math.floor(h); }
function vnoise(x, z) {
  const i = Math.floor(x), j = Math.floor(z), fx = x - i, fz = z - j;
  const u = fx * fx * (3 - 2 * fx), v = fz * fz * (3 - 2 * fz);
  return lerp(lerp(hash(i, j), hash(i + 1, j), u), lerp(hash(i, j + 1), hash(i + 1, j + 1), u), v);
}
function fbm(x, z) { return vnoise(x, z) * 0.5 + vnoise(x * 2.03 + 5.2, z * 2.03 + 1.3) * 0.3 + vnoise(x * 4.1 + 9, z * 4.1 + 3) * 0.2; }
let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

// ---------- world layout ----------
const SEA_MIN = -2.2, SEA_MAX = 2.0;
const WELL = { x: 42, z: 0 };
const TAM = { x: 85, z: -2 };
const BOAT0 = { x: 81, z: -7 };
const STACK = { x: 119, z: 0 };
const JETTY = { x: 108.5, z: 0 };

function causewayZ(x) { return 0.7 * Math.sin(x * 0.09); }
function terr(x, z) {
  const n = fbm(x * 0.08, z * 0.08);
  let h = -3.4 + n * 0.9;
  // village shore and hill (west)
  const shore = 14 + 2 * Math.sin(x * 0.13);
  const land = -3.2 + 5.8 * ss(shore - 7, shore + 2, z) + 4.5 * ss(shore + 9, shore + 34, z) + (n - 0.45) * 1.4;
  h = Math.max(h, lerp(-4, land, 1 - ss(-6, 8, x)));
  // far northern hills as backdrop
  h = Math.max(h, -3 + 11 * ss(40, 70, z) + n * 4);
  // causeway
  const ax = Math.abs(z - causewayZ(x));
  const cm = ss(-15, -12, x) * (1 - ss(33, 36, x));
  const cw = -0.9 + (vnoise(x * 1.3, z * 1.3) - 0.5) * 0.14 - 3 * ss(2.0, 4.2, ax);
  h = Math.max(h, lerp(-4, cw, cm));
  // islet (only above water at low tide)
  const di = Math.hypot(x - WELL.x, z - WELL.z) / 10;
  const isl = di < 1 ? -0.3 - 0.25 * di * di + (n - 0.45) * 0.25 : -0.55 - 3.5 * ss(1, 1.6, di);
  h = Math.max(h, isl);
  // sand bar to flats
  const bm = ss(48, 51, x) * (1 - ss(57, 60, x));
  h = Math.max(h, lerp(-4, -0.95 - 3 * ss(2.5, 5, Math.abs(z)), bm));
  // sand flats
  const df = Math.hypot((x - 77) / 21, z / 15);
  const ripple = 0.06 * Math.sin(x * 1.3 + Math.sin(z * 0.35) * 2.5);
  const fl = df < 1 ? -0.85 + ripple + (n - 0.45) * 0.4 : -0.85 - 3 * ss(1, 1.4, df);
  h = Math.max(h, fl);
  // sea stack
  const dsk = Math.hypot(x - STACK.x, z - STACK.z) / 7;
  const sk = dsk < 1 ? 5.6 + n * 0.5 : 5.6 - 10 * ss(1, 1.22, dsk) + (n - 0.5) * 1.5;
  h = Math.max(h, sk);
  return h;
}

// walkable platforms (boardwalks, ramp, plinth, jetty); rafts are appended at runtime
const platforms = [
  { x0: -51, x1: -9, z0: 4, z1: 8, y: 2.5 },            // main boardwalk
  { x0: -44, x1: -41, z0: 7, z1: 19, y: 2.5 },          // pier to shore
  { x0: -25, x1: -22, z0: 7, z1: 19, y: 2.5 },          // pier to shore
  { x0: -49, x1: -41, z0: -4, z1: 5, y: 2.5 },          // house platforms
  { x0: -36, x1: -28, z0: -5, z1: 5, y: 2.5 },
  { x0: -23, x1: -15, z0: -3, z1: 5, y: 2.5 },
  { x0: -13.5, x1: -9.5, z0: -0.8, z1: 5, y: -0.85, y2: 2.5 }, // ramp down to causeway
  { circle: true, x: WELL.x, z: WELL.z, r: 2.8, y: 0.25 },     // well plinth
  { x0: 105, x1: 112.5, z0: -1.6, z1: 1.6, y: 1.4 },     // jetty
];
function platAt(p, x, z) {
  if (p.circle) return Math.hypot(x - p.x, z - p.z) < p.r ? p.y : -99;
  if (x < p.x0 || x > p.x1 || z < p.z0 || z > p.z1) return -99;
  if (p.y2 !== undefined) return lerp(p.y, p.y2, (z - p.z0) / (p.z1 - p.z0));
  return p.y;
}
function groundAt(x, z) {
  let g = terr(x, z);
  for (const p of platforms) g = Math.max(g, platAt(p, x, z));
  return g;
}
const colliders = []; // {x,z,r}

// ---------- renderer / scene ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
document.body.prepend(renderer.domElement);

const scene = new THREE.Scene();
const FOG = new THREE.Color(0xd9b9b0);
scene.fog = new THREE.Fog(FOG, 45, 190);
const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 600);

const SUN_DIR = new THREE.Vector3(-0.75, 0.42, 0.5).normalize();
const hemi = new THREE.HemisphereLight(0xbcc8ff, 0x8a6a50, 1.1);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffc690, 2.6);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
const sc = sun.shadow.camera; sc.left = -28; sc.right = 28; sc.top = 28; sc.bottom = -28; sc.near = 1; sc.far = 120;
sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03;
scene.add(sun, sun.target);

// sky dome
{
  const g = new THREE.SphereGeometry(400, 32, 16);
  const m = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { sunDir: { value: SUN_DIR } },
    vertexShader: `varying vec3 vd; void main(){ vd = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `varying vec3 vd; uniform vec3 sunDir;
      void main(){ float y = vd.y;
        vec3 hor = vec3(0.98,0.76,0.62), mid = vec3(0.62,0.62,0.82), top = vec3(0.16,0.22,0.46);
        vec3 c = mix(hor, mid, smoothstep(0.0,0.22,y)); c = mix(c, top, smoothstep(0.22,0.8,y));
        c = mix(c, vec3(0.55,0.5,0.6), smoothstep(0.0,-0.2,y));
        float s = max(dot(vd, sunDir),0.); c += vec3(1.0,0.6,0.3)*pow(s,8.)*0.45 + vec3(1.,.85,.6)*pow(s,200.)*1.5;
        gl_FragColor = vec4(c,1.); }`
  });
  scene.add(new THREE.Mesh(g, m));
}
// moon + stars
function glowTex(inner, outer) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d'); const gr = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, inner); gr.addColorStop(0.35, inner); gr.addColorStop(0.42, outer); gr.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = gr; x.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('rgba(250,248,240,1)', 'rgba(210,225,255,0.35)'), fog: false, depthWrite: false }));
moon.scale.set(70, 70, 1); moon.position.set(330, 95, -60); scene.add(moon);
{
  const n = 400, p = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const a = rnd() * Math.PI * 2, y = 0.35 + rnd() * 0.65, r = Math.sqrt(1 - y * y); p.set([Math.cos(a) * r * 380, y * 380, Math.sin(a) * r * 380], i * 3); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 1.3, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.55 })));
}

// ---------- static batching ----------
const batches = {};
const mats = {
  std: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, metalness: 0 }),
  rock: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, flatShading: true }),
  glow: new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }),
};
const _c = new THREE.Color();
function addG(geo, color, m, key = 'std', jitter = 0.06) {
  const g = geo.index ? geo.toNonIndexed() : geo.clone();
  for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal') g.deleteAttribute(k);
  g.applyMatrix4(m);
  const n = g.attributes.position.count, c = new Float32Array(n * 3);
  _c.set(color); const j = 1 + (rnd() - 0.5) * jitter * 2;
  for (let i = 0; i < n; i++) c.set([_c.r * j, _c.g * j, _c.b * j], i * 3);
  g.setAttribute('color', new THREE.BufferAttribute(c, 3));
  (batches[key] ||= []).push(g);
}
const _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3(), _s = new THREE.Vector3();
function M(x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) {
  return new THREE.Matrix4().compose(_v.set(x, y, z), _q.setFromEuler(_e.set(rx, ry, rz)), _s.set(sx, sy, sz));
}
const BOX = new THREE.BoxGeometry(1, 1, 1);
const CYL = new THREE.CylinderGeometry(0.5, 0.5, 1, 8);
const CYL12 = new THREE.CylinderGeometry(0.5, 0.5, 1, 14);
const ROCK = new THREE.IcosahedronGeometry(1, 1);
{ const p = ROCK.attributes.position; for (let i = 0; i < p.count; i++) { const f = 0.75 + hash(Math.round(p.getX(i) * 50), Math.round(p.getZ(i) * 50 + p.getY(i) * 31)) * 0.5; p.setXYZ(i, p.getX(i) * f, p.getY(i) * f, p.getZ(i) * f); } }
function box(x, y, z, w, h, d, col, ry = 0, rx = 0, rz = 0) { addG(BOX, col, M(x, y, z, rx, ry, rz, w, h, d)); }
function post(x, y0, y1, r, col) { addG(CYL, col, M(x, (y0 + y1) / 2, 0, 0, 0, 0, r * 2, y1 - y0, r * 2).premultiply(new THREE.Matrix4().makeTranslation(0, 0, 0)), 'std'); }
function postAt(x, z, y0, y1, r, col) { addG(CYL, col, M(x, (y0 + y1) / 2, z, 0, 0, 0, r * 2, y1 - y0, r * 2)); }
function rock(x, z, s, col = 0x77706c, sy = 0.7) { addG(ROCK, col, M(x, terr(x, z) + s * 0.2, z, rnd() * 3, rnd() * 3, 0, s, s * sy, s * 1.1), 'rock', 0.12); colliders.push({ x, z, r: s * 0.8 }); }

// ---------- terrain mesh ----------
const TX0 = -95, TX1 = 150, TZ0 = -70, TZ1 = 80;
{
  const W = TX1 - TX0, D = TZ1 - TZ0;
  const g = new THREE.PlaneGeometry(W, D, 245, 150);
  g.rotateX(-Math.PI / 2);
  const p = g.attributes.position, n = p.count, col = new Float32Array(n * 3);
  const sand = new THREE.Color(0xe2c896), wet = new THREE.Color(0xa88e68), bed = new THREE.Color(0x6f7a68), grass = new THREE.Color(0x7c8f4a),
    dgrass = new THREE.Color(0x56693a), stone = new THREE.Color(0x8d877f), cliff = new THREE.Color(0x7a6d62), weed = new THREE.Color(0x4f6a45), c = new THREE.Color();
  for (let i = 0; i < n; i++) {
    const x = p.getX(i) + TX0 + W / 2, z = p.getZ(i) + TZ0 + D / 2;
    const h = terr(x, z); p.setXYZ(i, x, h, z);
    const nn = fbm(x * 0.3, z * 0.3);
    if (h > 3.2) c.copy(grass).lerp(dgrass, nn);
    else if (h > 1.4) c.copy(sand).lerp(grass, ss(1.8, 3.2, h) * (0.6 + nn * 0.4));
    else if (h > -0.2) c.copy(sand).lerp(wet, ss(1.4, -0.2, h));
    else if (h > -1.6) c.copy(wet).lerp(bed, ss(-0.6, -1.6, h)).lerp(weed, (nn > 0.62 ? 0.5 : 0) * ss(-0.4, -1.2, h));
    else c.copy(bed).multiplyScalar(0.8 + nn * 0.3);
    // causeway stones
    const ax = Math.abs(z - causewayZ(x));
    if (x > -14 && x < 35 && ax < 2.3) { const t = (Math.floor(x * 1.1) + Math.floor(z * 1.4)) & 1; c.copy(stone).multiplyScalar(t ? 0.92 : 1.05).lerp(weed, nn > 0.6 ? 0.35 : 0); }
    if (Math.hypot(x - STACK.x, z - STACK.z) < 8.5 && h > -2) c.copy(cliff).multiplyScalar(0.85 + nn * 0.3).lerp(grass, ss(5.2, 5.8, h));
    c.offsetHSL(0, 0, (hash(Math.floor(x * 2), Math.floor(z * 2)) - 0.5) * 0.03);
    col.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 }));
  m.receiveShadow = true; scene.add(m);
}

// ---------- village ----------
const WOOD = 0x7b5a3f, WOOD2 = 0x5d4330, DECK = 0x9a7550;
function deckRect(x0, x1, z0, z1, y, y2) {
  const along = (x1 - x0) > (z1 - z0) || y2 !== undefined ? 'x' : 'z';
  if (y2 !== undefined) {
    const len = Math.hypot(z1 - z0, y2 - y), ang = Math.atan2(y2 - y, z1 - z0);
    for (let x = x0 + 0.25; x < x1; x += 0.52) addG(BOX, DECK, M(x, (y + y2) / 2 - 0.08, (z0 + z1) / 2, -ang, 0, 0, 0.48, 0.16, len));
    for (let z = z0; z <= z1; z += 2.2) { const yy = lerp(y, y2, (z - z0) / (z1 - z0)); postAt(x0 + 0.2, z, -4, yy + 0.9, 0.12, WOOD2); postAt(x1 - 0.2, z, -4, yy + 0.9, 0.12, WOOD2); }
    return;
  }
  if (along === 'x') for (let z = z0 + 0.25; z < z1; z += 0.52) addG(BOX, DECK, M((x0 + x1) / 2, y - 0.08, z, 0, 0, 0, x1 - x0, 0.16, 0.48));
  else for (let x = x0 + 0.25; x < x1; x += 0.52) addG(BOX, DECK, M(x, y - 0.08, (z0 + z1) / 2, 0, 0, 0, 0.48, 0.16, z1 - z0));
  for (let x = x0 + 0.3; x <= x1; x += 3.2) for (const z of [z0 + 0.3, z1 - 0.3]) if (terr(x, z) < y - 0.3) postAt(x, z, terr(x, z) - 0.5, y - 0.15, 0.17, WOOD2);
  for (let z = z0 + 0.3; z <= z1; z += 3.2) for (const x of [x0 + 0.3, x1 - 0.3]) if (terr(x, z) < y - 0.3) postAt(x, z, terr(x, z) - 0.5, y - 0.15, 0.17, WOOD2);
}
for (const p of platforms) if (!p.circle && p.x1 < 0) deckRect(p.x0, p.x1, p.z0, p.z1, p.y, p.y2);
// rails along the seaward edge of the boardwalk
for (let x = -50; x < -14; x += 2) { postAt(x, 4.15, 2.5, 3.4, 0.06, WOOD2); }
box(-32.5, 3.3, 4.15, 36, 0.08, 0.08, WOOD2);

function house(cx, cz, w, d, wall, roof, ry = 0) {
  const y = 2.5, h = 3.0;
  const R = new THREE.Matrix4().makeRotationY(ry), T = new THREE.Matrix4().makeTranslation(cx, 0, cz);
  const P = (m) => m.premultiply(R).premultiply(T);
  // plank walls
  for (let i = 0; i < 6; i++) addG(BOX, wall, P(M(0, y + 0.25 + i * 0.5, 0, 0, 0, 0, w, 0.48, d)), 'std', 0.1);
  // corner posts
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) addG(CYL, WOOD2, P(M(sx * w / 2, y + h / 2, sz * d / 2, 0, 0, 0, 0.3, h, 0.3)));
  // pitched roof: two slabs
  const rw = d / 2 + 0.6, ang = 0.6;
  for (const s of [-1, 1]) addG(BOX, roof, P(M(0, y + h + Math.sin(ang) * rw / 2 - 0.05, s * Math.cos(ang) * rw / 2, s * ang, 0, 0, w + 0.9, 0.18, rw + 0.1)), 'std', 0.08);
  // gable ends
  const sh = new THREE.Shape(); sh.moveTo(-d / 2, 0); sh.lineTo(d / 2, 0); sh.lineTo(0, Math.tan(ang) * d / 2 * 0.97); sh.closePath();
  const prism = new THREE.ExtrudeGeometry(sh, { depth: w, bevelEnabled: false }); prism.translate(0, 0, -w / 2); prism.rotateY(Math.PI / 2);
  addG(prism, wall, P(M(0, y + h - 0.02, 0)));
  // door + windows (glow)
  addG(BOX, 0x3a2a20, P(M(0, y + 1.0, d / 2 + 0.03, 0, 0, 0, 0.9, 1.9, 0.06)));
  for (const s of [-1, 1]) { addG(BOX, 0xffb35c, P(M(s * w * 0.3, y + 1.7, d / 2 + 0.04, 0, 0, 0, 0.7, 0.6, 0.05)), 'glow'); addG(BOX, WOOD2, P(M(s * w * 0.3, y + 1.7, d / 2 + 0.06, 0, 0, 0, 0.08, 0.66, 0.05))); }
  addG(BOX, 0xffb35c, P(M(w / 2 + 0.04, y + 1.7, 0, 0, 0, 0, 0.05, 0.6, 0.7)), 'glow');
  // chimney
  addG(BOX, 0x6c625a, P(M(w * 0.3, y + h + 1.2, -d * 0.15, 0, 0, 0, 0.5, 1.4, 0.5)));
  colliders.push({ x: cx, z: cz, r: Math.max(w, d) * 0.55 });
}
house(-45, 0, 5, 4.4, 0x5f7f8f, 0x8a3b2e, 0);
house(-32, -1, 5.4, 4.6, 0xb98f5a, 0x3f5a6e, 0);
house(-19, 1, 4.6, 4.0, 0xc7c0a8, 0x6d3a3a, 0);
house(-57, 23, 5, 4.4, 0x8d6f8a, 0x45534a, 0.2);
house(-30, 26, 5.6, 4.6, 0x6f8f72, 0x8a4a2e, -0.15);
house(-46, 31, 5, 4.4, 0xa77d5a, 0x3e4f6a, 0.1);
// fishing props: barrels, crates, nets, drying racks, lamps
function barrel(x, z, y) { addG(CYL12, 0x6e4c32, M(x, y + 0.45, z, 0, rnd(), 0, 0.7, 0.9, 0.7)); addG(CYL12, 0x3a3a3a, M(x, y + 0.65, z, 0, 0, 0, 0.73, 0.06, 0.73)); addG(CYL12, 0x3a3a3a, M(x, y + 0.25, z, 0, 0, 0, 0.73, 0.06, 0.73)); }
for (const [x, z] of [[-40, 5], [-39.3, 5.6], [-27, 4.8], [-16, 6.8], [-48, 6.5]]) barrel(x, z, 2.5);
for (const [x, z, r] of [[-36, 7, 0.3], [-21, 5.2, 1], [-47, 2.6, 0.2]]) box(x, 2.85, z, 0.8, 0.7, 0.8, 0x8b6a45, r);
function rack(x, z, y, ry) {
  const R = new THREE.Matrix4().makeRotationY(ry), T = new THREE.Matrix4().makeTranslation(x, y, z);
  for (const s of [-1.4, 1.4]) addG(CYL, WOOD2, M(s, 1, 0, 0, 0, 0, 0.12, 2, 0.12).premultiply(R).premultiply(T));
  addG(CYL, WOOD2, M(0, 1.95, 0, 0, 0, Math.PI / 2, 0.08, 3, 0.08).premultiply(R).premultiply(T));
  addG(BOX, 0x5f6e5a, M(0, 1.35, 0, 0.05, 0, 0, 2.6, 1.2, 0.03).premultiply(R).premultiply(T), 'std', 0.15); // net
  for (let i = -1; i < 2; i++) addG(BOX, 0xb7b8b0, M(i * 0.7, 1.55, 0.06, 0, 0, 0.1, 0.12, 0.6, 0.05).premultiply(R).premultiply(T)); // fish
}
rack(-38, 21, terr(-38, 21), 0.1); rack(-52, 18.5, terr(-52, 18.5), -0.3); rack(-28.5, 6.7, 2.5, 0);
function lampPost(x, z, y) { postAt(x, z, y, y + 2.6, 0.07, 0x2c2c30); addG(BOX, 0xffd08a, M(x, y + 2.7, z, 0, 0, 0, 0.3, 0.35, 0.3), 'glow'); addG(BOX, 0x2c2c30, M(x, y + 2.95, z, 0, 0.78, 0, 0.45, 0.1, 0.45)); }
lampPost(-41.5, 7.6, 2.5); lampPost(-22.5, 7.6, 2.5); lampPost(-11, 7.6, 2.5); lampPost(-50, 7.6, 2.5);
// pulled-up beach boats
// trees on the hill
function pine(x, z, s) {
  const y = terr(x, z); addG(CYL, 0x5a3e2a, M(x, y + 1.0 * s, z, 0, 0, 0, 0.35 * s, 2 * s, 0.35 * s));
  for (let i = 0; i < 3; i++) addG(new THREE.ConeGeometry(1, 1, 7), i ? 0x3f5a35 : 0x354d2e, M(x, y + (2 + i * 1.1) * s, z, 0, rnd(), 0, (1.9 - i * 0.45) * s, 2 * s, (1.9 - i * 0.45) * s), 'std', 0.1);
  colliders.push({ x, z, r: 0.6 * s });
}
for (let i = 0; i < 46; i++) { const x = -90 + rnd() * 90, z = 22 + rnd() * 50; if (terr(x, z) > 3 && Math.abs(x + 42) + Math.abs(z - 24) > 6 && x < -8) pine(x, z, 0.8 + rnd() * 0.7); }
// grass tufts (instanced)
{
  const cone = new THREE.ConeGeometry(0.07, 0.42, 3); cone.translate(0, 0.21, 0);
  const im = new THREE.InstancedMesh(cone, new THREE.MeshStandardMaterial({ color: 0x6f8a44, roughness: 1 }), 2200);
  let k = 0; const m = new THREE.Matrix4();
  for (let i = 0; i < 9000 && k < 2200; i++) {
    const x = -90 + rnd() * 100, z = 12 + rnd() * 50, h = terr(x, z);
    if (h < 2.0 || h > 9) continue;
    m.compose(_v.set(x, h - 0.05, z), _q.setFromEuler(_e.set((rnd() - 0.5) * 0.5, rnd() * 3, (rnd() - 0.5) * 0.5)), _s.setScalar(0.6 + rnd()));
    im.setMatrixAt(k++, m);
  }
  im.count = k; scene.add(im);
}
// shore rocks + seaweed rocks along causeway
for (let i = 0; i < 26; i++) { const x = -10 + rnd() * 44, s = 0.4 + rnd() * 0.7, side = rnd() < 0.5 ? -1 : 1; rock(x, causewayZ(x) + side * (2.6 + rnd() * 1.5), s, 0x6f6a62); }
for (let i = 0; i < 18; i++) { const a = rnd() * 6.28, r = 7 + rnd() * 3; rock(STACK.x + Math.cos(a) * r, STACK.z + Math.sin(a) * r, 0.8 + rnd() * 1.4, 0x6d625a); }
for (let i = 0; i < 12; i++) { const a = rnd() * 6.28, r = 8 + rnd() * 3, x = WELL.x + Math.cos(a) * r, z = WELL.z + Math.sin(a) * r; if (Math.abs(z) < 4.5) continue; rock(x, z, 0.4 + rnd() * 0.8, 0x6f6a62); }
for (let i = 0; i < 16; i++) { const x = -70 + rnd() * 60, z = 11 + rnd() * 4; rock(x, z, 0.4 + rnd() * 0.6, 0x7b746b); }
// causeway marker posts (old tide poles)
for (let x = -8; x < 34; x += 6) { const z = causewayZ(x) + 2.4; postAt(x, z, terr(x, z) - 0.3, 1.6, 0.1, WOOD2); addG(BOX, 0xd6d0bf, M(x, 1.35, z, 0, 0, 0, 0.24, 0.18, 0.24)); }

// ---------- well islet ----------
{
  const y = 0.25;
  addG(CYL12, 0x8f877b, M(WELL.x, y - 0.6, WELL.z, 0, 0, 0, 5.6, 1.2, 5.6)); // plinth
  const ring = 14;
  for (let i = 0; i < ring; i++) {
    const a = (i / ring) * Math.PI * 2;
    for (let k = 0; k < 3; k++) addG(BOX, k % 2 ? 0x9a9184 : 0x857c70, M(WELL.x + Math.cos(a + k * 0.11) * 1.15, y + 0.2 + k * 0.33, WELL.z + Math.sin(a + k * 0.11) * 1.15, 0, -a, 0, 0.4, 0.32, 0.6), 'rock', 0.1);
  }
  // shaft (dark inside)
  addG(new THREE.CylinderGeometry(0.95, 0.95, 4, 14, 1, true), 0x2b2a2a, M(WELL.x, y - 1.5, WELL.z, 0, 0, 0, 1, 1, -1));
  // winch frame
  for (const s of [-1, 1]) addG(CYL, WOOD2, M(WELL.x + s * 1.3, y + 1.4, WELL.z, 0, 0, 0, 0.16, 2.4, 0.16));
  addG(CYL, WOOD, M(WELL.x, y + 2.3, WELL.z, 0, 0, Math.PI / 2, 0.22, 2.8, 0.22));
  addG(CYL, 0xc9b98f, M(WELL.x, y + 1.6, WELL.z, 0, 0, 0, 0.03, 1.4, 0.03));
  colliders.push({ x: WELL.x, z: WELL.z, r: 1.5 });
  // little stone arch / ruins on islet
  for (const [dx, dz] of [[-6, 4], [-5, 5.5], [5, -5], [6.5, 3]]) { const x = WELL.x + dx, z = WELL.z + dz; addG(BOX, 0x8a8277, M(x, terr(x, z) + 0.5, z, 0, rnd(), 0.1, 0.8, 1.4, 0.8), 'rock', 0.12); colliders.push({ x, z, r: 0.6 }); }
}

// ---------- shipwreck on flats ----------
function hullGeo(len, w, h, segX = 10) {
  const g = new THREE.BoxGeometry(len, h, w, segX, 2, 4);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i); const t = x / (len / 2);
    const taper = 1 - Math.pow(Math.abs(t), 2.2) * 0.92;
    const bot = (0.5 - y / h); // 0 at top, 1 at bottom
    z *= taper * (1 - bot * 0.45);
    y += Math.pow(Math.abs(t), 2) * h * 0.35 * (1 - bot * 0.3);
    p.setXYZ(i, x, y, z);
  }
  g.computeVertexNormals(); return g;
}
{
  const wx = 69, wz = 9, base = terr(wx, wz);
  const T = M(wx, base + 0.6, wz, 0.32, 0.5, 0.12);
  addG(hullGeo(13, 4.4, 2.6, 14), 0x4f3a2a, M(0, 0, 0, 0, 0, 0).premultiply(T), 'std', 0.05);
  addG(BOX, 0x3d2c20, M(-1, 1.25, 0, 0, 0, 0, 8, 0.15, 3.0).premultiply(T)); // deck remnant
  for (let i = -5; i <= 5; i += 1.2) addG(new THREE.TorusGeometry(2.0, 0.12, 5, 10, Math.PI), 0x3b2b1f, M(i + 6.5, 0.8, 0, 0, Math.PI / 2, Math.PI, 1, 1, 1).premultiply(T)); // exposed ribs beyond stern break
  addG(CYL, 0x4a3524, M(0.5, 4.0, 0, 0, 0, 0.35, 0.35, 6.5, 0.35).premultiply(T));
  addG(CYL, 0x4a3524, M(0.9, 5.2, 0, 0, 0, 1.6, 0.18, 3.5, 0.18).premultiply(T));
  addG(BOX, 0x8a8478, M(1.5, 4.4, 0.2, 0, 0, 0.2, 0.05, 2.6, 2.0).premultiply(T), 'std', 0.1); // torn sail
  colliders.push({ x: wx, z: wz, r: 3.4 }, { x: wx - 4, z: wz - 2, r: 2.2 }, { x: wx + 4, z: wz + 2, r: 2.2 });
  for (let i = 0; i < 9; i++) rock(wx + (rnd() - 0.5) * 22, wz + (rnd() - 0.5) * 18, 0.3 + rnd() * 0.5, 0x5f6650);
}
// half-buried anchor + crab pots on the flats
addG(new THREE.TorusGeometry(0.8, 0.12, 6, 12, Math.PI), 0x4a4440, M(60, terr(60, -8) + 0.2, -8, 0, 0.4, Math.PI));
addG(CYL, 0x4a4440, M(60, terr(60, -8) + 0.9, -8, 0, 0.4, 0, 0.18, 1.8, 0.18));
for (const [x, z] of [[88, 7], [74, -10], [91, -9]]) { addG(BOX, 0x6c5a40, M(x, terr(x, z) + 0.3, z, 0, rnd(), 0, 0.8, 0.6, 0.8), 'std', 0.1); }

// ---------- lighthouse ----------
const lampMat = new THREE.MeshBasicMaterial({ color: 0x665c40, toneMapped: false });
let beam;
{
  const top = terr(STACK.x, STACK.z), bx = STACK.x, bz = STACK.z;
  const h = 10, g = new THREE.CylinderGeometry(1.05, 1.6, h, 18, 6);
  // stripe colors per band
  const gn = g.toNonIndexed(), p = gn.attributes.position, c = new Float32Array(p.count * 3), a = new THREE.Color(0xeee7da), b = new THREE.Color(0xb23a32);
  for (let i = 0; i < p.count; i += 3) { const yy = (p.getY(i) + p.getY(i + 1) + p.getY(i + 2)) / 3; const col = Math.floor((yy + h / 2) / (h / 5)) % 2 ? b : a; for (let k = 0; k < 3; k++) c.set([col.r, col.g, col.b], (i + k) * 3); }
  gn.setAttribute('color', new THREE.BufferAttribute(c, 3)); gn.deleteAttribute('uv'); gn.applyMatrix4(M(bx, top + h / 2, bz));
  (batches.std ||= []).push(gn);
  addG(CYL12, 0x3a3a40, M(bx, top + h + 0.1, bz, 0, 0, 0, 3.2, 0.25, 3.2));
  for (let i = 0; i < 12; i++) { const an = i / 12 * 6.28; addG(CYL, 0x2a2a30, M(bx + Math.cos(an) * 1.55, top + h + 0.6, bz + Math.sin(an) * 1.55, 0, 0, 0, 0.06, 0.9, 0.06)); }
  addG(new THREE.ConeGeometry(1.3, 1.5, 12), 0x2d3440, M(bx, top + h + 2.6, bz));
  const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 1.6, 12), lampMat); lamp.position.set(bx, top + h + 1.1, bz); scene.add(lamp);
  addG(new THREE.CylinderGeometry(1.5, 2.2, 1.6, 10), 0xd8d2c4, M(bx + 3.2, top + 0.8, bz + 1, 0, 0.3, 0)); // keeper hut
  addG(new THREE.ConeGeometry(2.2, 1.2, 10), 0x7d3a30, M(bx + 3.2, top + 2.2, bz + 1));
  const bg = new THREE.ConeGeometry(4, 40, 16, 1, true); bg.translate(0, -20, 0); bg.rotateZ(Math.PI / 2);
  beam = new THREE.Mesh(bg, new THREE.MeshBasicMaterial({ color: 0xfff0c0, transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
  beam.position.copy(lamp.position); scene.add(beam);
  // jetty
  deckJetty();
  function deckJetty() {
    for (let z = -1.35; z < 1.6; z += 0.52) addG(BOX, DECK, M(108.75, 1.32, z, 0, 0, 0, 7.5, 0.16, 0.48));
    for (const x of [105.3, 108.5, 112]) for (const z of [-1.4, 1.4]) postAt(x, z, -3.5, 1.9, 0.17, WOOD2);
    // steps up the stack
    for (let i = 0; i < 9; i++) addG(BOX, 0x8a8277, M(112.5 + i * 0.6, 1.6 + i * 0.5, 0, 0, 0, 0, 0.7, 0.5, 1.6), 'rock');
  }
}

// finalize static batches
for (const [k, list] of Object.entries(batches)) {
  const m = new THREE.Mesh(mergeGeometries(list), mats[k]);
  m.castShadow = k !== 'glow'; m.receiveShadow = true; scene.add(m);
}

// ---------- water ----------
const water = (() => {
  const W = 360, D = 220, g = new THREE.PlaneGeometry(W, D, 150, 92); g.rotateX(-Math.PI / 2); g.translate(30, 0, 5);
  const p = g.attributes.position, n = p.count; const th = new Float32Array(n);
  for (let i = 0; i < n; i++) th[i] = terr(p.getX(i), p.getZ(i));
  const col = new Float32Array(n * 4); g.setAttribute('color', new THREE.BufferAttribute(col, 4));
  const mat = new THREE.MeshPhongMaterial({ vertexColors: true, transparent: true, shininess: 90, specular: 0xffe6c8, depthWrite: false });
  const mesh = new THREE.Mesh(g, mat); mesh.receiveShadow = true; mesh.renderOrder = 2; scene.add(mesh);
  const deep = new THREE.Color(0x1f5470), mid = new THREE.Color(0x2f8a95), shal = new THREE.Color(0x7ec9c0), foam = new THREE.Color(0xf4f6f2), c = new THREE.Color();
  return {
    mesh, update(sea, t) {
      for (let i = 0; i < n; i++) {
        const x = p.getX(i), z = p.getZ(i);
        const w = Math.sin(x * 0.35 + t * 1.3) * 0.07 + Math.sin(z * 0.5 - t * 1.1 + x * 0.1) * 0.06 + Math.sin((x + z) * 0.9 + t * 2.1) * 0.025;
        p.setY(i, sea + w);
        const d = sea - th[i];
        let a;
        if (d < 0.25) { c.copy(foam).lerp(shal, ss(0.05, 0.25, d)); a = d < -0.3 ? 0 : 0.85; }
        else if (d < 1.5) { c.copy(shal).lerp(mid, ss(0.25, 1.5, d)); a = lerp(0.45, 0.78, ss(0.25, 1.5, d)); }
        else { c.copy(mid).lerp(deep, ss(1.5, 5, d)); a = 0.86; }
        col[i * 4] = c.r; col[i * 4 + 1] = c.g; col[i * 4 + 2] = c.b; col[i * 4 + 3] = a;
      }
      p.needsUpdate = true; g.attributes.color.needsUpdate = true; g.computeVertexNormals();
    }
  };
})();

// ---------- characters ----------
function person(o) {
  const g = new THREE.Group();
  const m = (c, r = 0.8) => new THREE.MeshStandardMaterial({ color: c, roughness: r });
  const skin = m(o.skin || 0xe8b896), cloth = m(o.cloth), cloth2 = m(o.cloth2 || o.cloth), hairM = m(o.hair, 0.9), shoe = m(0x3a2c26);
  const mk = (geo, mat, x, y, z, parent = g) => { const me = new THREE.Mesh(geo, mat); me.position.set(x, y, z); me.castShadow = true; parent.add(me); return me; };
  const legs = [];
  for (const s of [-1, 1]) {
    const hip = new THREE.Group(); hip.position.set(0, 0.78, s * 0.1); g.add(hip);
    mk(new THREE.CylinderGeometry(0.065, 0.055, 0.72, 7), o.legs ? m(o.legs) : skin, 0, -0.38, 0, hip);
    mk(new THREE.BoxGeometry(0.22, 0.1, 0.12), o.boots ? m(o.boots) : shoe, 0.04, -0.74, 0, hip);
    legs.push(hip);
  }
  // body: coat (cone flare) + torso
  mk(new THREE.CylinderGeometry(0.17, o.skirt || 0.3, 0.55, 10), cloth, 0, 0.92, 0);
  mk(new THREE.CylinderGeometry(0.15, 0.17, 0.42, 10), cloth, 0, 1.28, 0);
  if (o.collar) mk(new THREE.TorusGeometry(0.12, 0.04, 6, 12), cloth2, 0, 1.48, 0).rotation.x = Math.PI / 2;
  mk(new THREE.CylinderGeometry(0.05, 0.06, 0.1, 8), skin, 0, 1.52, 0);
  const head = mk(new THREE.SphereGeometry(0.13, 14, 10), skin, 0, 1.66, 0);
  head.scale.set(1, 1.08, 0.95);
  const hair = mk(new THREE.SphereGeometry(0.142, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.62), hairM, -0.01, 1.68, 0);
  hair.rotation.z = 0.25;
  if (o.pony) { const pt = mk(new THREE.SphereGeometry(0.07, 8, 6), hairM, -0.17, 1.6, 0); pt.scale.set(1, 1.8, 1); }
  if (o.bun) mk(new THREE.SphereGeometry(0.075, 8, 6), hairM, -0.1, 1.79, 0);
  if (o.cap) { mk(new THREE.CylinderGeometry(0.145, 0.15, 0.08, 12), m(o.cap), 0, 1.78, 0); mk(new THREE.BoxGeometry(0.14, 0.02, 0.2), m(o.cap), 0.15, 1.75, 0); }
  if (o.hood) { const hd = mk(new THREE.SphereGeometry(0.16, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), cloth2, -0.03, 1.67, 0); hd.rotation.z = 0.5; }
  // eyes
  for (const s of [-1, 1]) mk(new THREE.SphereGeometry(0.018, 6, 4), m(0x222222), 0.115, 1.68, s * 0.045);
  const arms = [];
  for (const s of [-1, 1]) {
    const sh = new THREE.Group(); sh.position.set(0, 1.44, s * 0.2); g.add(sh);
    mk(new THREE.CylinderGeometry(0.05, 0.045, 0.56, 7), cloth2, 0, -0.27, 0, sh);
    mk(new THREE.SphereGeometry(0.05, 6, 5), skin, 0, -0.57, 0, sh);
    arms.push(sh);
  }
  if (o.shawl) { const sw = mk(new THREE.CylinderGeometry(0.2, 0.28, 0.25, 10), m(o.shawl), 0, 1.38, 0); }
  g.scale.setScalar(o.scale || 1);
  return { g, legs, arms, head };
}

// Mira
const mira = person({ cloth: 0xe0b43a, cloth2: 0xd9a52c, hair: 0x3a2318, legs: 0x2f3d5c, boots: 0x7a3b2a, pony: true, hood: false, collar: true, skirt: 0.3 });
scene.add(mira.g);
// lantern in right hand
const lantern = new THREE.Group();
{
  const frame = new THREE.MeshStandardMaterial({ color: 0x2e2a26, metalness: 0.6, roughness: 0.4 });
  const cage = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.2, 6, 1, true), new THREE.MeshStandardMaterial({ color: 0x777777, wireframe: true }));
  lantern.add(cage);
  const top = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.07, 6), frame); top.position.y = 0.13; lantern.add(top);
  const bot = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.03, 6), frame); bot.position.y = -0.11; lantern.add(bot);
  const orb = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 8), new THREE.MeshBasicMaterial({ color: 0xdfeaff, toneMapped: false })); lantern.add(orb);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('rgba(220,235,255,0.9)', 'rgba(150,190,255,0.25)'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  halo.scale.set(0.7, 0.7, 1); lantern.add(halo); lantern.userData.halo = halo;
  const L = new THREE.PointLight(0xc4dcff, 6, 14, 1.6); L.position.y = 0.02; lantern.add(L); lantern.userData.light = L;
  lantern.position.set(0, -0.68, 0);
}
mira.arms[1].add(lantern);

const nell = person({ cloth: 0x5a4a6a, cloth2: 0x4a3c58, hair: 0xcfcac2, shawl: 0x8a3e5a, bun: true, scale: 0.92, skirt: 0.36, legs: 0x3a3030 });
nell.g.position.set(-32, 2.5, 6.4); nell.g.rotation.y = -Math.PI / 2; scene.add(nell.g);
const tam = person({ cloth: 0x3b5f8a, cloth2: 0xcfc3a8, hair: 0x6b4a2a, cap: 0x8a2f2a, legs: 0x3b5f8a, scale: 1.04, skirt: 0.2 });
scene.add(tam.g);

// ---------- boats & rafts ----------
function makeBoat(len, w, hullCol, trim) {
  const g = new THREE.Group();
  const hm = new THREE.MeshStandardMaterial({ color: hullCol, roughness: 0.7 });
  const hull = new THREE.Mesh(hullGeo(len, w, 0.8, 10), hm); hull.position.y = 0.4; hull.castShadow = true; g.add(hull);
  const inner = new THREE.Mesh(new THREE.BoxGeometry(len * 0.72, 0.06, w * 0.62), new THREE.MeshStandardMaterial({ color: 0x8a6a48 })); inner.position.y = 0.62; g.add(inner);
  const stripe = new THREE.Mesh(hullGeo(len * 1.01, w * 1.02, 0.12, 10), new THREE.MeshStandardMaterial({ color: trim })); stripe.position.y = 0.86; g.add(stripe);
  for (const x of [-len * 0.2, len * 0.15]) { const th = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.06, w * 0.8), new THREE.MeshStandardMaterial({ color: 0x9a7a52 })); th.position.set(x, 0.8, 0); g.add(th); }
  return g;
}
const tamBoat = makeBoat(4.6, 1.8, 0x2f6a6a, 0xe6d8b0);
{ const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 3.2), new THREE.MeshStandardMaterial({ color: 0x6b4a30 })); mast.position.set(0.6, 2.2, 0); tamBoat.add(mast);
  const sail = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 2.2), new THREE.MeshStandardMaterial({ color: 0xe8dcc0, side: THREE.DoubleSide })); sail.position.set(0, 2.3, 0); sail.rotation.y = 0.15; tamBoat.add(sail); tamBoat.userData.sail = sail; sail.visible = false; }
scene.add(tamBoat);
const boats = [
  { obj: tamBoat, x: BOAT0.x, z: BOAT0.z, ry: 0.5, draft: 0.45, tam: true },
];
for (const [x, z, ry, c, t] of [[-36, -9, 0.3, 0x8a3a2e, 0xf0e2c0], [-14, -8, -0.8, 0x3a5a8a, 0xf0e2c0], [-55, -4, 1.4, 0x6a7a3a, 0xe0c060], [-62, 14.5, 0.2, 0xc8b89a, 0x4a6a8a]]) {
  const b = makeBoat(3.8, 1.5, c, t); scene.add(b); boats.push({ obj: b, x, z, ry, draft: 0.45 });
}
const rafts = [];
for (const [x, z] of [[-28, -12], [-8, -5], [22, 6]]) {
  const g = new THREE.Group();
  for (let i = 0; i < 6; i++) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 2.6, 8), new THREE.MeshStandardMaterial({ color: 0x8a6a42 })); l.rotation.x = Math.PI / 2; l.position.x = (i - 2.5) * 0.42; l.castShadow = true; g.add(l); }
  scene.add(g);
  const pl = { x0: x - 1.3, x1: x + 1.3, z0: z - 1.3, z1: z + 1.3, y: 0, raft: true };
  platforms.push(pl); rafts.push({ obj: g, x, z, pl });
}

// ---------- glowing things: pearls, shard, marker ----------
const pearlGeo = new THREE.SphereGeometry(0.16, 12, 8);
const pearlMat = new THREE.MeshBasicMaterial({ color: 0xfff4e0, toneMapped: false });
const pearls = [[-2, 0], [12, 1.3], [26, -0.5], [37, 5], [47, -5], [54, 0.5], [64, -6], [73, 2], [64, 13], [92, 6], [77, -12], [96, -3]].map(([x, z]) => {
  const m = new THREE.Mesh(pearlGeo, pearlMat); const y = groundAt(x, z) + 0.25; m.position.set(x, y, z);
  const shell = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xd8b8b0, side: THREE.DoubleSide })); shell.scale.y = 0.35; shell.position.set(x, y - 0.18, z); scene.add(shell);
  const h = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('rgba(255,250,230,0.8)', 'rgba(255,220,180,0.2)'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); h.scale.set(1.2, 1.2, 1); m.add(h);
  scene.add(m); return { m, shell, x, z, got: false };
});
const shard = new THREE.Mesh(new THREE.OctahedronGeometry(0.35, 0), new THREE.MeshBasicMaterial({ color: 0xcfe3ff, toneMapped: false }));
shard.scale.y = 1.7;
{ const h = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('rgba(210,230,255,0.95)', 'rgba(150,190,255,0.3)'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); h.scale.set(2.4, 1.4, 1); shard.add(h); }
scene.add(shard);
const marker = new THREE.Group();
{
  const b = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 30, 8, 1, true), new THREE.MeshBasicMaterial({ color: 0xbfd8ff, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  b.position.y = 15; marker.add(b);
  const r = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.05, 6, 32), new THREE.MeshBasicMaterial({ color: 0xdfeaff, transparent: true, opacity: 0.7, toneMapped: false }));
  r.rotation.x = Math.PI / 2; marker.add(r); marker.userData.ring = r;
}
scene.add(marker);

// ---------- game state ----------
const S = {
  started: false, sea: 0.9, seaTarget: 0.9, x: -46, z: 22, y: 2.6, vy: 0, heading: 0, speed: 0, obj: 0, score: 0, pearls: 0, over: false,
  lastSafe: { x: -46, z: 22 }, shardY: -3, shardGot: false, boatFloat: false, sailing: false, sailT: 0, tamDone: false, onBoat: false, t: 0, yaw: 0.28, walkPhase: 0,
  tamSeen: false, isletSeen: false, toastT: 0,
};
S.y = groundAt(S.x, S.z);
const OBJ = [
  { text: 'Talk to old Nell on the boardwalk', at: () => [nell.g.position.x, nell.g.position.z] },
  { text: 'Lower the sea and cross the causeway to the well islet', at: () => [WELL.x - 3, WELL.z] },
  { text: 'Raise the sea to lift the moon shard out of the well', at: () => [WELL.x, WELL.z] },
  { text: "Lower the sea, find Tam on the flats, then raise it to float his boat", at: () => [TAM.x, TAM.z] },
  { text: "Board Tam's boat and cross east to the lighthouse", at: () => [tamBoat.position.x, tamBoat.position.z] },
  { text: 'The lighthouse burns with the moon shard', at: () => [STACK.x, STACK.z] },
];
function setObj(i) { S.obj = i; $('objt').textContent = OBJ[i].text; }
let sayT = 0;
function say(name, text, dur = 6) { const e = $('say'); e.innerHTML = `<i>${name}</i>${text}`; e.classList.add('on'); sayT = dur; }
function toast(t) { const e = $('toast'); e.textContent = t; e.classList.add('on'); S.toastT = 1.8; }
function addScore(n) { S.score += n; $('score').textContent = `Pearls ${S.pearls} · Score ${S.score}`; }
setObj(0);

// ---------- input ----------
const input = { mx: 0, mz: 0, kx: 0, kz: 0, seaKey: 0 };
const stick = $('stick'), knob = $('knob');
let stickId = null, stickC = { x: 0, y: 0 }, seaId = null, seaLast = { x: 0, y: 0 };
const R = 52;
function stickMove(x, y) {
  let dx = x - stickC.x, dy = y - stickC.y; const l = Math.hypot(dx, dy);
  if (l > R) { dx *= R / l; dy *= R / l; }
  knob.style.transform = `translate(${dx}px,${dy}px)`;
  input.mx = dx / R; input.mz = dy / R;
}
function stickCenter() { const r = stick.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
addEventListener('touchstart', (e) => {
  if (!S.started) return;
  for (const t of e.changedTouches) {
    if (t.clientX < innerWidth * 0.45 && stickId === null) {
      stickId = t.identifier;
      const onStick = t.target === stick || t.target === knob;
      if (!onStick) { stick.style.left = (t.clientX - 59) + 'px'; stick.style.top = (t.clientY - 59) + 'px'; stick.style.bottom = 'auto'; }
      stickC = stickCenter(); stickMove(t.clientX, t.clientY);
    } else if (t.clientX >= innerWidth * 0.45 && seaId === null) { seaId = t.identifier; seaLast = { x: t.clientX, y: t.clientY }; }
  }
  e.preventDefault();
}, { passive: false });
addEventListener('touchmove', (e) => {
  for (const t of e.changedTouches) {
    if (t.identifier === stickId) stickMove(t.clientX, t.clientY);
    else if (t.identifier === seaId) {
      const dy = t.clientY - seaLast.y, dx = t.clientX - seaLast.x;
      S.seaTarget = clamp(S.seaTarget - dy * 0.016, SEA_MIN, SEA_MAX);
      S.yaw += dx * 0.004;
      seaLast = { x: t.clientX, y: t.clientY };
    }
  }
  e.preventDefault();
}, { passive: false });
function touchEnd(e) {
  for (const t of e.changedTouches) {
    if (t.identifier === stickId) { stickId = null; input.mx = input.mz = 0; knob.style.transform = ''; stick.style.left = '40px'; stick.style.top = ''; stick.style.bottom = '34px'; }
    if (t.identifier === seaId) seaId = null;
  }
}
addEventListener('touchend', touchEnd); addEventListener('touchcancel', touchEnd);
const keys = {};
addEventListener('keydown', (e) => { keys[e.code] = true; });
addEventListener('keyup', (e) => { keys[e.code] = false; });
// mouse drag on right side for desktop
let mDown = false, mLast = 0;
addEventListener('mousedown', (e) => { if (S.started && e.clientX > innerWidth * 0.45) { mDown = true; mLast = e.clientY; } });
addEventListener('mousemove', (e) => { if (mDown) { S.seaTarget = clamp(S.seaTarget - (e.clientY - mLast) * 0.016, SEA_MIN, SEA_MAX); mLast = e.clientY; } });
addEventListener('mouseup', () => { mDown = false; });

$('startb').addEventListener('click', () => {
  $('start').style.display = 'none'; stick.style.display = 'block'; S.started = true;
  say('Mira', 'Nell said to come find her on the boardwalk. The lantern feels heavy tonight.', 5);
});

// ---------- simulation ----------
const WADE = 0.75, SWIM = 1.0;
function blocked(x, z) {
  for (const c of colliders) { const dx = x - c.x, dz = z - c.z; if (dx * dx + dz * dz < (c.r + 0.3) * (c.r + 0.3)) return true; }
  if (x < TX0 + 5 || x > TX1 - 5 || z < TZ0 + 5 || z > TZ1 - 8) return true;
  return false;
}
function tryMove(nx, nz) {
  if (blocked(nx, nz)) return false;
  const gN = groundAt(nx, nz), gC = groundAt(S.x, S.z);
  const feet = Math.max(gC, S.sea - SWIM);
  if (gN - feet > 0.6) { if (gN > S.sea + 0.2) return false; }
  const dN = S.sea - gN, dC = S.sea - gC;
  if (dN > WADE && dN > dC + 0.12) { if (S.toastT <= 0) toast(S.obj === 1 || S.obj === 3 ? 'Too deep. Drag the right side DOWN to lower the sea.' : 'Too deep to wade.'); return false; }
  S.x = nx; S.z = nz; return true;
}

function updateBoats(dt) {
  for (const b of boats) {
    if (b.tam && (S.sailing || S.arrived)) continue;
    const bed = terr(b.x, b.z);
    const floatY = S.sea - b.draft, restY = bed - 0.05;
    const y = Math.max(floatY, restY);
    const floating = floatY > restY + 0.05;
    const o = b.obj;
    o.position.set(b.x, lerp(o.position.y || y, y, Math.min(1, dt * 4)), b.z);
    o.rotation.set(floating ? Math.sin(S.t * 1.3 + b.x) * 0.05 : 0.04, b.ry + (floating ? Math.sin(S.t * 0.4 + b.z) * 0.08 : 0), floating ? Math.sin(S.t * 1.1 + b.z) * 0.05 : 0.18);
    if (b.tam) S.boatFloat = floating;
  }
  for (const r of rafts) {
    const y = Math.max(S.sea, terr(r.x, r.z) + 0.2);
    r.obj.position.set(r.x, y + 0.05, r.z); r.obj.rotation.set(Math.sin(S.t + r.x) * 0.04, 0.3, Math.sin(S.t * 1.2 + r.z) * 0.04);
    r.pl.y = y + 0.25;
  }
}

function talkLogic() {
  const dN = Math.hypot(S.x - nell.g.position.x, S.z - nell.g.position.z);
  if (S.obj === 0 && dN < 3.2) {
    say('Nell', "There you are, Mira. The moon dropped its pull into your lantern. Drag it down and the whole sea runs out; drag it up and it comes home. Lower it, and walk the causeway to the old well.", 8);
    setObj(1); addScore(25);
  }
  if (S.obj === 1 && Math.hypot(S.x - WELL.x, S.z - WELL.z) < 9.5) {
    say('Mira', "The well is bone dry. Something glints at the bottom. If I bring the sea back, the water should lift it.", 6);
    setObj(2); addScore(50);
  }
  if (S.obj === 2) {
    const dW = Math.hypot(S.x - WELL.x, S.z - WELL.z);
    if (S.shardY > 1.35 && dW < 4.5) {
      S.shardGot = true; setObj(3); addScore(150);
      say('Nell', "(far off) The shard! Your lantern's singing now. Tam's boat is stuck out on the flats past the old wreck. Help him, lass.", 7);
    } else if (S.shardY > 1.35 && dW >= 4.5 && S.toastT <= 0) toast('The shard is up. Get close to the well to take it.');
  }
  const dT = Math.hypot(S.x - TAM.x, S.z - TAM.z);
  if (S.obj === 3 && dT < 7 && !S.tamSeen) { S.tamSeen = true; say('Tam', "My boat's been sat in the mud since the tide ran off. Can you bring the water back? Gently now.", 6); }
  if (S.obj === 3 && dT < 12 && S.boatFloat && S.sea > 0.1) {
    setObj(4); addScore(150); say('Tam', "She floats! Climb in and I'll sail you east to the lighthouse. Keep the sea up for us.", 7);
  }
  if (S.obj === 4 && !S.sailing && Math.hypot(S.x - tamBoat.position.x, S.z - tamBoat.position.z) < 4.5 && S.boatFloat) {
    S.sailing = true; S.sailT = 0; S.sailFrom = { x: tamBoat.position.x, z: tamBoat.position.z }; tamBoat.userData.sail.visible = true;
  }
}

function sail(dt) {
  const canFloat = S.sea - 0.45 > terr(tamBoat.position.x, tamBoat.position.z) + 0.05 || terr(tamBoat.position.x, tamBoat.position.z) < -2.5;
  if (!canFloat) { if (S.toastT <= 0) toast('Grounded! Raise the sea.'); return; }
  S.sailT = Math.min(1, S.sailT + dt / 9);
  const t = ss(0, 1, S.sailT);
  const via = { x: 98, z: -4 };
  const a = S.sailFrom, x = lerp(lerp(a.x, via.x, t), lerp(via.x, JETTY.x - 5, t), t), z = lerp(lerp(a.z, via.z, t), lerp(via.z, JETTY.z, t), t);
  const dx = x - tamBoat.position.x, dz = z - tamBoat.position.z;
  tamBoat.position.set(x, S.sea - 0.45, z);
  if (Math.hypot(dx, dz) > 1e-4) tamBoat.rotation.set(Math.sin(S.t * 1.5) * 0.05, -Math.atan2(dz, dx), Math.sin(S.t * 1.2) * 0.06);
  S.x = x; S.z = z; S.speed = Math.hypot(dx, dz) / Math.max(dt, 1e-3);
  if (S.sailT >= 1) {
    S.sailing = false; S.arrived = true; S.x = JETTY.x; S.z = 0; S.over = true; setObj(5);
    addScore(300 + Math.max(0, Math.round(600 - S.t)));
    say('Tam', 'There she is. Put the shard in the lamp, Mira.', 6);
    setTimeout(() => { $('end').style.display = 'flex'; $('endt').textContent = `Score ${S.score} · Pearls ${S.pearls}/12`; }, 3500);
  }
}

// ---------- loop ----------
const clock = new THREE.Clock();
let fpsAcc = 0, fpsN = 0, fps = 60;
const camPos = new THREE.Vector3(), camLook = new THREE.Vector3();
window.__GAME__ = { pos: [S.x, S.z], fps: 60, speed: 0, score: 0, over: false, draws: 0, tris: 0 };
window.__DEBUG__ = {
  tp(x, z) { S.x = x; S.z = z; S.y = groundAt(x, z); S.lastSafe = { x, z }; },
  sea(v) { S.sea = S.seaTarget = v; },
  obj(i) { setObj(i); if (i >= 3) S.shardGot = true; },
  yaw(v) { S.yaw = v; },
  state: () => ({ ...S }),
};

function frame() {
  const dt = Math.min(0.05, clock.getDelta());
  S.t += dt;
  fpsAcc += dt; fpsN++; if (fpsAcc > 0.5) { fps = fpsN / fpsAcc; fpsAcc = 0; fpsN = 0; }

  // sea
  const kSea = (keys.KeyE || keys.ArrowUp && keys.ShiftLeft ? 1 : 0) - (keys.KeyQ ? 1 : 0);
  if (kSea) S.seaTarget = clamp(S.seaTarget + kSea * dt * 1.5, SEA_MIN, SEA_MAX);
  const prevSea = S.sea;
  S.sea = lerp(S.sea, S.seaTarget, Math.min(1, dt * 2.5));
  const seaVel = (S.sea - prevSea) / Math.max(dt, 1e-3);

  // move
  let ix = input.mx, iz = input.mz;
  if (keys.KeyA || keys.ArrowLeft) ix -= 1; if (keys.KeyD || keys.ArrowRight) ix += 1;
  if (keys.KeyW || keys.ArrowUp) iz -= 1; if (keys.KeyS || keys.ArrowDown) iz += 1;
  const il = Math.hypot(ix, iz); if (il > 1) { ix /= il; iz /= il; }
  const f = { x: Math.cos(S.yaw), z: Math.sin(S.yaw) }, r = { x: -Math.sin(S.yaw), z: Math.cos(S.yaw) };
  const g0 = groundAt(S.x, S.z), depth = S.sea - g0;
  const swimming = depth > SWIM;
  let spd = 0;
  if (S.started && !S.sailing && !S.arrived) {
    const max = swimming ? 1.6 : depth > 0.35 ? 2.6 : 4.4;
    let vx = (f.x * -iz + r.x * ix) * max, vz = (f.z * -iz + r.z * ix) * max;
    const ox = S.x, oz = S.z;
    if (il > 0.05) {
      if (!tryMove(S.x + vx * dt, S.z + vz * dt)) { tryMove(S.x + vx * dt, S.z) || tryMove(S.x, S.z + vz * dt); }
      S.heading = Math.atan2(vz, vx);
    }
    // deep water current drags you back to safe ground
    if (S.sea - groundAt(S.x, S.z) > 1.5) {
      const dx = S.lastSafe.x - S.x, dz = S.lastSafe.z - S.z, l = Math.hypot(dx, dz);
      if (l > 0.2) { S.x += dx / l * Math.min(l, 2.2 * dt); S.z += dz / l * Math.min(l, 2.2 * dt); }
      if (S.toastT <= 0 && l > 0.5) toast('The current pulls you back.');
    } else if (S.sea - groundAt(S.x, S.z) < WADE) S.lastSafe = { x: S.x, z: S.z };
    spd = Math.hypot(S.x - ox, S.z - oz) / Math.max(dt, 1e-3);
  }
  if (!S.sailing) S.speed = spd;
  if (S.sailing) sail(dt);
  const g = groundAt(S.x, S.z);
  const targetY = S.sailing ? S.sea + 0.15 : S.arrived ? 1.4 : Math.max(g, S.sea - SWIM);
  S.y = lerp(S.y, targetY, Math.min(1, dt * 12));
  if (S.arrived) { S.x = JETTY.x; S.z = 0; }

  // character anim
  mira.g.position.set(S.x, S.y, S.z);
  let dh = -S.heading - mira.g.rotation.y; dh = Math.atan2(Math.sin(dh), Math.cos(dh));
  mira.g.rotation.y += dh * Math.min(1, dt * 10);
  S.walkPhase += S.speed * dt * 2.4;
  const sw = Math.sin(S.walkPhase) * Math.min(1, S.speed / 3) * 0.7;
  mira.legs[0].rotation.z = sw; mira.legs[1].rotation.z = -sw;
  mira.arms[0].rotation.z = -sw * 0.8;
  mira.arms[1].rotation.z = 0.25 + sw * 0.25; mira.arms[1].rotation.x = -0.15;
  if (S.sailing) { mira.legs[0].rotation.z = mira.legs[1].rotation.z = 0; }
  // lantern responds to pulling
  const pull = Math.min(1, Math.abs(seaVel) * 0.8);
  lantern.userData.light.intensity = 5 + pull * 14 + (S.shardGot ? 4 : 0) + Math.sin(S.t * 3) * 0.6;
  lantern.userData.halo.scale.setScalar(0.6 + pull * 0.9 + (S.shardGot ? 0.3 : 0));
  lantern.rotation.z = -sw * 0.3;

  // NPCs
  nell.g.rotation.y = lerp(nell.g.rotation.y, -Math.atan2(S.z - nell.g.position.z, S.x - nell.g.position.x), 0.05);
  nell.arms[0].rotation.x = Math.sin(S.t * 1.3) * 0.08;
  if (!S.sailing && !S.arrived) {
    tam.g.position.set(TAM.x, Math.max(terr(TAM.x, TAM.z), S.sea - SWIM), TAM.z);
    tam.g.rotation.y = -Math.atan2(S.z - TAM.z, S.x - TAM.x);
    tam.arms[0].rotation.z = S.obj === 3 ? -2.6 + Math.sin(S.t * 6) * 0.4 : 0; // waves
  } else {
    tam.g.position.copy(tamBoat.position).add(new THREE.Vector3(-1.2 * Math.cos(-tamBoat.rotation.y), 0.6, -1.2 * Math.sin(-tamBoat.rotation.y)));
    tam.g.rotation.y = tamBoat.rotation.y; tam.arms[0].rotation.z = 0;
  }

  updateBoats(dt);
  water.update(S.sea, S.t);

  // shard in the well: floats on the well water level
  if (!S.shardGot) {
    const wl = Math.max(-2.6, S.sea);
    S.shardY = lerp(S.shardY, Math.min(wl, 1.3) + 0.3, Math.min(1, dt * 3));
    shard.position.set(WELL.x, S.shardY, WELL.z); shard.rotation.y += dt * 1.2;
  } else {
    // shard orbits the lantern
    const lp = new THREE.Vector3(); lantern.getWorldPosition(lp);
    shard.position.set(lp.x + Math.cos(S.t * 2) * 0.5, lp.y + 0.5, lp.z + Math.sin(S.t * 2) * 0.5); shard.scale.set(0.4, 0.7, 0.4); shard.rotation.y += dt * 3;
    if (S.arrived) { shard.position.set(STACK.x, terr(STACK.x, STACK.z) + 11.1, STACK.z); shard.scale.set(1, 1.7, 1); }
  }
  // pearls
  for (const p of pearls) {
    if (p.got) continue;
    p.m.position.y = groundAt(p.x, p.z) + 0.3 + Math.sin(S.t * 2 + p.x) * 0.05;
    if (Math.hypot(S.x - p.x, S.z - p.z) < 1.4 && Math.abs(S.y - groundAt(p.x, p.z)) < 0.8) { p.got = true; p.m.visible = false; S.pearls++; addScore(20); toast(`Moon pearl ${S.pearls}/12`); }
  }
  talkLogic();

  // lighthouse
  if (S.arrived) { lampMat.color.setRGB(3, 2.6, 1.6); beam.material.opacity = Math.min(0.22, beam.material.opacity + dt * 0.1); }
  else { beam.material.opacity = 0.0; }
  beam.rotation.y = S.t * 0.8;

  // marker
  const [mx, mz] = OBJ[S.obj].at();
  marker.position.set(mx, groundAt(mx, mz) + 0.1, mz);
  marker.visible = !S.over && Math.hypot(S.x - mx, S.z - mz) > 4;
  marker.userData.ring.scale.setScalar(1 + Math.sin(S.t * 3) * 0.15);

  // camera (third person, yaw controlled by right-drag horizontal)
  const dist = 8.5, hgt = 4.2;
  camPos.set(S.x - f.x * dist, S.y + hgt, S.z - f.z * dist);
  const gc = groundAt(camPos.x, camPos.z); if (camPos.y < gc + 1.2) camPos.y = gc + 1.2;
  camera.position.lerp(camPos, Math.min(1, dt * 5));
  camLook.set(S.x + f.x * 3, S.y + 1.3, S.z + f.z * 3);
  camera.lookAt(camLook);
  sun.position.set(S.x + SUN_DIR.x * 60, S.y + SUN_DIR.y * 60, S.z + SUN_DIR.z * 60); sun.target.position.set(S.x, S.y, S.z);

  // HUD
  $('lvl').style.top = `${(1 - (S.sea - SEA_MIN) / (SEA_MAX - SEA_MIN)) * 100}%`;
  if (sayT > 0) { sayT -= dt; if (sayT <= 0) $('say').classList.remove('on'); }
  if (S.toastT > 0) { S.toastT -= dt; if (S.toastT <= 0) $('toast').classList.remove('on'); }

  renderer.render(scene, camera);
  const G = window.__GAME__;
  G.pos = [+S.x.toFixed(2), +S.z.toFixed(2)]; G.fps = Math.round(fps); G.speed = +S.speed.toFixed(2); G.score = S.score; G.over = S.over;
  G.draws = renderer.info.render.calls; G.tris = renderer.info.render.triangles; G.sea = +S.sea.toFixed(2); G.obj = S.obj;
  requestAnimationFrame(frame);
}
addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); });
camera.position.set(S.x - 8, S.y + 4, S.z);
requestAnimationFrame(frame);
window.__READY__ = true;
