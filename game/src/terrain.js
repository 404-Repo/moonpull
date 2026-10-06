// The coast: one authored heightfield for the whole journey, sampled once into a grid that the
// mesh, the water shader and the physics all read, so the three can never disagree.
//
// Axes: +X runs east along the coast (harbour -> flats -> Gull Head -> the Stack), +Z is inland,
// the open sea is toward -Z. Heights are metres above the sea's REST level (y = 0).
import * as THREE from 'three';

export const WORLD = { x0: -340, x1: 340, z0: -230, z1: 150, step: 1.25 };

const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;

// --- small deterministic value noise -------------------------------------------------------
function hash(ix, iz) { let h = ix * 374761393 + iz * 668265263; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; }
function vnoise(x, z) {
  const ix = Math.floor(x), iz = Math.floor(z), fx = x - ix, fz = z - iz;
  const u = fx * fx * (3 - 2 * fx), v = fz * fz * (3 - 2 * fz);
  return lerp(lerp(hash(ix, iz), hash(ix + 1, iz), u), lerp(hash(ix, iz + 1), hash(ix + 1, iz + 1), u), v) * 2 - 1;
}
export function fbm(x, z, oct = 4) { let a = 0, f = 1, s = 0.5; for (let i = 0; i < oct; i++) { a += s * vnoise(x * f, z * f); f *= 2.03; s *= 0.5; } return a; }

// --- the shoreline, as control points along x ---------------------------------------------
const SHORE = [
  [-300, 18], [-230, 22], [-185, 30], [-150, 32], [-115, 30], [-80, 22], [-55, 6],
  [-30, 14], [10, 30], [60, 32], [95, 20], [120, -14], [148, -34], [172, -12], [200, 6], [240, 12], [300, 10],
];
function shoreZ(x) {
  for (let i = 0; i < SHORE.length - 1; i++) {
    const [xa, za] = SHORE[i], [xb, zb] = SHORE[i + 1];
    if (x >= xa && x <= xb) { const t = (x - xa) / (xb - xa); return lerp(za, zb, t * t * (3 - 2 * t)); }
  }
  return 12;
}

// Area weights along the coast. Each returns 0..1 and they overlap in the transitions.
const wHarbour = (x) => 1 - sstep(-70, -40, x);
const wFlats = (x) => sstep(-70, -40, x) * (1 - sstep(95, 120, x));
const wHead = (x) => sstep(95, 120, x) * (1 - sstep(170, 195, x));
const wStack = (x) => sstep(170, 195, x);

function landProfile(d, x) {
  // harbour and stack: beach, a village bench, an upper bench, cliffs
  const beach = lerp(0.35, 1.7, sstep(0, 9, d));
  const bench1 = 3.2 * sstep(9, 13, d);
  const bench2 = 4.7 * sstep(24, 29, d);
  const cliff = 19 * sstep(41, 50, d) + 7 * sstep(58, 100, d);
  const village = beach + bench1 + bench2 + cliff;
  // flats: low dunes and marram, then a rising moor
  const dunes = lerp(0.3, 2.2, sstep(0, 14, d)) + 1.2 * sstep(20, 40, d) + 9 * sstep(60, 110, d);
  // Gull Head: cliffs straight out of the sea
  const head = 1.0 + 21 * sstep(1, 12, d) + 6 * sstep(20, 60, d);
  return village * (wHarbour(x) + wStack(x)) + dunes * wFlats(x) + head * wHead(x);
}

function seaProfile(d, x) {
  // d < 0. Harbour: a shelving bay. Flats: wide shallow sand that only a low tide gives back.
  const harbour = Math.max(-7, 0.35 + d * 0.1);
  const flats = d > -6 ? lerp(0.3, -1.4, sstep(0, -6, d)) : Math.max(-9, -1.4 - 0.008 * (-d - 6) - (d < -120 ? (-d - 120) * 0.12 : 0));
  const head = Math.max(-9, -1.5 + d * 0.3);
  const stack = Math.max(-8, 0.35 + d * 0.12);
  return harbour * wHarbour(x) + flats * wFlats(x) + head * wHead(x) + stack * wStack(x);
}

// --- authored features -----------------------------------------------------------------------
// Segments: from a to b, top height ha -> hb, half width w, side falloff f. mode: set | raise | cut
export const FEATURES = [];
const seg = (ax, az, bx, bz, ha, hb, w, f, mode = 'set', path = 0) => FEATURES.push({ k: 'seg', ax, az, bx, bz, ha, hb, w, f, mode, path });
const disc = (x, z, r, h, f, mode = 'set', path = 0) => FEATURES.push({ k: 'disc', x, z, r, h, f, mode, path });
const mound = (x, z, r, h) => FEATURES.push({ k: 'mound', x, z, r, h });

// HARBOUR (Gullwick). Village bench sits about +4.9; beach 0.4..1.7.
disc(-150, 48.5, 8, 4.9, 5, 'set', 0.8);                                  // Nell's yard and the square
seg(-192, 48, -110, 47, 4.9, 4.9, 6, 5, 'set', 3.2);                      // the village street along the bench
seg(-150, 40, -150, 31, 4.9, 1.6, 2.2, 3, 'set', 2.2);                    // stair-ramp from the square to the beach
seg(-118, 42, -112, 31, 4.9, 1.5, 2.0, 3, 'set', 2.0);                    // second ramp by the boathouse
seg(-190, 62, -112, 62, 9.6, 9.6, 5, 5, 'set', 2.4);                      // upper lane (bench 2)
seg(-145, 61, -145, 51, 9.6, 4.9, 2, 3, 'set', 0);                      // lane down to the street
seg(-120, 26, -104, -28, -0.9, -0.9, 2.2, 2.5, 'set', 2.2);               // THE CAUSEWAY: dry only when the sea is pulled down
disc(-100, -40, 9, 2.2, 7);                                   // the well islet
mound(-97, -46, 6, 0.8);
seg(-168, 28, -162, 18, 1.4, 0.6, 3.5, 3);                    // the mud scrape Tam's boat lies in
disc(-165, 17, 5, 0.5, 4, 'cut');
seg(-72, 6, -34, 2, -1.5, -1.5, 3.0, 4);                      // the sand bar east: needs a deep low tide
disc(-52, -6, 7, 2.4, 6);                                     // headland rocks between harbour and flats
mound(-60, 2, 9, 1.8);

// FLATS. A sand ridge path, tide pools, the Marguerite's bed.
seg(-30, 4, 40, -40, -1.1, -1.7, 3, 6, 'raise');
disc(46, -46, 16, -1.9, 10);                                  // the wreck bed
mound(20, -70, 10, 0.8); mound(-10, -55, 7, 0.6); mound(70, -20, 8, 0.9);
seg(55, -40, 98, -6, -1.7, -0.8, 3, 5, 'raise');              // ridge on toward Gull Head

// GULL HEAD. A ledge at the cliff foot into the sea cave mouth.
seg(96, 4, 118, -18, -0.6, -1.0, 2.5, 3);
disc(124, -26, 6, -1.0, 4);

// THE STACK. Stepping stones to the sea stack, the stack itself, the tidal basin arena.
for (let i = 0; i < 7; i++) disc(196 + i * 3.2, -6 - i * 6.2, 1.8, -1.2 + (i % 2) * 0.3, 1.2);
disc(220, -60, 13, 3.0, 6);                                    // basin floor around the stack foot
FEATURES.push({ k: 'stack', x: 220, z: -72, r: 7.5, h: 27 });          // the stack
disc(218, -50, 18, -0.6, 8, 'raise');                          // the arena sand at low tide

function applyFeature(f, x, z, h) {
  if (f.k === 'stack') {
    const dx = x - f.x, dz = z - f.z, a = Math.atan2(dz, dx), d = Math.hypot(dx, dz);
    const rr = f.r * (1 + 0.16 * Math.sin(a * 3 + 1) + 0.09 * Math.sin(a * 7)) ;
    const k = 1 - sstep(rr - 1.0, rr + 7, d);           // 1 inside, falling off over the skirt
    if (k <= 0) return h;
    const ledges = Math.floor(k * 5) / 5 * 0.35 + k * 0.65; // stepped flanks
    const top = f.h * Math.pow(Math.max(0, ledges), 0.55) + fbm(x * 0.3, z * 0.3, 2) * 1.2 * k;
    return Math.max(h, lerp(h, top, Math.min(1, k * 3)));
  }
  if (f.k === 'mound') { const r2 = ((x - f.x) ** 2 + (z - f.z) ** 2) / (f.r * f.r); return h + f.h * Math.exp(-r2 * 2.2); }
  let dist, top;
  if (f.k === 'disc') { dist = Math.hypot(x - f.x, z - f.z) - f.r; top = f.h; }
  else {
    const vx = f.bx - f.ax, vz = f.bz - f.az, L2 = vx * vx + vz * vz;
    const t = Math.min(1, Math.max(0, ((x - f.ax) * vx + (z - f.az) * vz) / L2));
    dist = Math.hypot(x - (f.ax + vx * t), z - (f.az + vz * t)) - f.w; top = lerp(f.ha, f.hb, t);
  }
  const w = 1 - sstep(0, f.f, dist);
  if (w <= 0) return h;
  if (f.mode === 'raise') return Math.max(h, lerp(h, top, w));
  if (f.mode === 'cut') return Math.min(h, lerp(h, top, w));
  return lerp(h, top, w);
}

export function pathAt(x, z) {
  let p = 0;
  for (const f of FEATURES) {
    if (!f.path) continue;
    let dist;
    if (f.k === 'disc') dist = Math.hypot(x - f.x, z - f.z) - f.r * f.path;
    else {
      const vx = f.bx - f.ax, vz = f.bz - f.az, L2 = vx * vx + vz * vz;
      const t = Math.min(1, Math.max(0, ((x - f.ax) * vx + (z - f.az) * vz) / L2));
      dist = Math.hypot(x - (f.ax + vx * t), z - (f.az + vz * t)) - f.path;
    }
    p = Math.max(p, 1 - sstep(-0.4, 0.8, dist + fbm(x * 0.5, z * 0.5, 2) * 0.8));
  }
  return p;
}

export function heightAt(x, z) {
  const d = z - shoreZ(x);
  let h = d >= 0 ? landProfile(d, x) : seaProfile(d, x);
  // ripple and rock noise, gentle on paths
  const n = fbm(x * 0.045, z * 0.045);
  h += n * (d > 50 ? 2.2 : d > 0 ? 0.35 : 0.3);
  h += vnoise(x * 0.6, z * 0.6) * 0.04;
  for (const f of FEATURES) h = applyFeature(f, x, z, h);
  return h;
}

// --- the grid -----------------------------------------------------------------------------
export function buildGrid() {
  const { x0, x1, z0, z1, step } = WORLD;
  const nx = Math.round((x1 - x0) / step) + 1, nz = Math.round((z1 - z0) / step) + 1;
  const H = new Float32Array(nx * nz);
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) H[j * nx + i] = heightAt(x0 + i * step, z0 + j * step);
  return { nx, nz, H, ...WORLD };
}

export function makeSampler(grid) {
  const { nx, nz, H, x0, z0, step } = grid;
  return function h(x, z) {
    const fx = (x - x0) / step, fz = (z - z0) / step;
    const i = Math.max(0, Math.min(nx - 2, Math.floor(fx))), j = Math.max(0, Math.min(nz - 2, Math.floor(fz)));
    const u = Math.min(1, Math.max(0, fx - i)), v = Math.min(1, Math.max(0, fz - j));
    const a = H[j * nx + i], b = H[j * nx + i + 1], c = H[(j + 1) * nx + i], d = H[(j + 1) * nx + i + 1];
    return lerp(lerp(a, b, u), lerp(c, d, u), v);
  };
}

// A half-float height texture the water and ground shaders read for depth, foam and wetness.
export function heightTexture(grid) {
  const { nx, nz, H } = grid;
  const data = new Uint16Array(nx * nz * 2);
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const k = j * nx + i;
    data[k * 2] = THREE.DataUtils.toHalfFloat(H[k]);
    data[k * 2 + 1] = THREE.DataUtils.toHalfFloat(pathAt(grid.x0 + i * grid.step, grid.z0 + j * grid.step));
  }
  const tex = new THREE.DataTexture(data, nx, nz, THREE.RGFormat, THREE.HalfFloatType);
  tex.magFilter = THREE.LinearFilter; tex.minFilter = THREE.LinearFilter; tex.needsUpdate = true;
  return tex;
}

// --- the ground mesh, in tiles so the frustum culls what is behind you -----------------------
export function buildGroundMesh(grid, material, tiles = [6, 4]) {
  const { nx, nz, H, x0, z0, step } = grid;
  const group = new THREE.Group(); group.name = 'ground';
  const tx = tiles[0], tz = tiles[1];
  const ci = Math.ceil((nx - 1) / tx), cj = Math.ceil((nz - 1) / tz);
  for (let ty = 0; ty < tz; ty++) for (let txi = 0; txi < tx; txi++) {
    const i0 = txi * ci, i1 = Math.min(nx - 1, i0 + ci), j0 = ty * cj, j1 = Math.min(nz - 1, j0 + cj);
    const w = i1 - i0 + 1, d = j1 - j0 + 1;
    const pos = new Float32Array(w * d * 3), nor = new Float32Array(w * d * 3);
    for (let j = 0; j < d; j++) for (let i = 0; i < w; i++) {
      const gi = i0 + i, gj = j0 + j, k = (j * w + i) * 3;
      pos[k] = x0 + gi * step; pos[k + 1] = H[gj * nx + gi]; pos[k + 2] = z0 + gj * step;
      const hl = H[gj * nx + Math.max(0, gi - 1)], hr = H[gj * nx + Math.min(nx - 1, gi + 1)];
      const hd = H[Math.max(0, gj - 1) * nx + gi], hu = H[Math.min(nz - 1, gj + 1) * nx + gi];
      const n = new THREE.Vector3(hl - hr, 2 * step, hd - hu).normalize();
      nor[k] = n.x; nor[k + 1] = n.y; nor[k + 2] = n.z;
    }
    const idx = [];
    for (let j = 0; j < d - 1; j++) for (let i = 0; i < w - 1; i++) {
      const a = j * w + i, b = a + 1, c = a + w, e = c + 1;
      idx.push(a, c, b, b, c, e);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    g.setIndex(idx);
    g.computeBoundingSphere(); g.computeBoundingBox();
    const m = new THREE.Mesh(g, material);
    m.receiveShadow = true; m.castShadow = false;
    group.add(m);
  }
  return group;
}
