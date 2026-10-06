// boathouse B: profiles. Same plan as the reference (gable doors on +Z, length along Z), but built from
// sweeps: every wall is one ExtrudeGeometry slab with its door and window holes cut as Shape paths and
// board-and-batten strips over it; tile courses are extruded strips with notched tongues; piles and barrels
// are lathes; bargeboards are extruded profiles with a curled foot.
// ---- MOONPULL build kit (inlined; no imports). Palette and names per STYLE_LOCK.md ----
function makeKit(THREE, seed) {
  let s = (seed >>> 0) || 7;
  const rnd = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
  const jit = (a) => (rnd() * 2 - 1) * a;
  const mk = (color, rough, name, extra) => {
    const m = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: rough, metalness: 0 }, extra || {}));
    if (name) m.name = name; return m;
  };
  const mats = {
    timber: mk(0x7b5a3e, 0.85, 'timber'), wet: mk(0x4a3426, 0.55, 'timber'), drift: mk(0xb79773, 0.85, 'timber'),
    tile: mk(0xb5543a, 0.8, 'tile'), plaster: mk(0xe9d6b8, 0.9, 'plaster'), ochre: mk(0xc99a5c, 0.9, 'plaster'),
    stone: mk(0x6c6a64, 0.9, 'stone'), sand: mk(0xc6a888, 0.9, 'stone'), kelp: mk(0x4f5a2c, 0.9, 'foliage'),
    cream: mk(0xd9cfb6, 0.85, 'stone'), rope: mk(0xa58a5c, 0.9, 'fabric'), iron: mk(0x3a3d40, 0.6, 'metal'),
    window: mk(0xffb560, 0.7, null, { emissive: 0xffb560, emissiveIntensity: 0.55 }),
    moonstone: mk(0x9fd8ff, 0.4, 'moonstone', { emissive: 0x9fd8ff, emissiveIntensity: 1.0 }),
    lampglow: mk(0xffb560, 0.5, 'lampglow', { emissive: 0xffb560, emissiveIntensity: 1.2 }),
  };
  const buckets = {};
  const stack = [new THREE.Matrix4()];
  const cur = () => stack[stack.length - 1];
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  function T(x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) {
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ'));
    return new THREE.Matrix4().compose(V(x, y, z), q, V(sx, sy, sz));
  }
  function frame(m, fn) { stack.push(cur().clone().multiply(m)); fn(); stack.pop(); }
  const va = new THREE.Vector3(), vb = new THREE.Vector3();
  function put(key, geo, m) {
    if (!mats[key]) throw new Error('no material ' + key);
    const g = geo.index ? geo.toNonIndexed() : geo;
    if (!g.attributes.normal) g.computeVertexNormals();
    const M = cur().clone(); if (m) M.multiply(m);
    const N = new THREE.Matrix3().getNormalMatrix(M);
    const p = g.attributes.position, n = g.attributes.normal;
    const b = buckets[key] || (buckets[key] = { pos: [], nrm: [] });
    const ord = M.determinant() < 0 ? [0, 2, 1] : [0, 1, 2];
    for (let i = 0; i < p.count; i += 3) for (const j of ord) {
      va.fromBufferAttribute(p, i + j).applyMatrix4(M); b.pos.push(va.x, va.y, va.z);
      vb.fromBufferAttribute(n, i + j).applyMatrix3(N).normalize(); b.nrm.push(vb.x, vb.y, vb.z);
    }
  }
  // chamfered box, centred, flat shaded. c = chamfer in metres.
  const cache = new Map();
  function cboxGeo(w, h, d, c) {
    c = Math.min(c || 0, w * 0.45, h * 0.45, d * 0.45);
    const key = [w, h, d, c].map((x) => x.toFixed(4)).join(',');
    if (cache.has(key)) return cache.get(key);
    let geo;
    if (c <= 0.002) geo = new THREE.BoxGeometry(w, h, d).toNonIndexed();
    else {
      const hx = w / 2, hy = h / 2, hz = d / 2;
      const P = (sx, sy, sz, ax) => ax === 0 ? [sx * hx, sy * (hy - c), sz * (hz - c)] : ax === 1 ? [sx * (hx - c), sy * hy, sz * (hz - c)] : [sx * (hx - c), sy * (hy - c), sz * hz];
      const tris = [];
      const quad = (a, b, cc, d2) => { tris.push([a, b, cc], [a, cc, d2]); };
      const S = [-1, 1];
      for (const t of S) {
        quad(P(t, -1, -1, 0), P(t, 1, -1, 0), P(t, 1, 1, 0), P(t, -1, 1, 0));
        quad(P(-1, t, -1, 1), P(1, t, -1, 1), P(1, t, 1, 1), P(-1, t, 1, 1));
        quad(P(-1, -1, t, 2), P(1, -1, t, 2), P(1, 1, t, 2), P(-1, 1, t, 2));
      }
      for (const a of S) for (const b2 of S) {
        quad(P(-1, a, b2, 1), P(1, a, b2, 1), P(1, a, b2, 2), P(-1, a, b2, 2));
        quad(P(a, -1, b2, 0), P(a, 1, b2, 0), P(a, 1, b2, 2), P(a, -1, b2, 2));
        quad(P(a, b2, -1, 0), P(a, b2, 1, 0), P(a, b2, 1, 1), P(a, b2, -1, 1));
      }
      for (const x of S) for (const y of S) for (const z of S) tris.push([P(x, y, z, 0), P(x, y, z, 1), P(x, y, z, 2)]);
      const pos = [];
      const A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3(), nn = new THREE.Vector3(), cen = new THREE.Vector3();
      for (const t of tris) {
        A.fromArray(t[0]); B.fromArray(t[1]); C.fromArray(t[2]);
        nn.subVectors(B, A).cross(C.clone().sub(A)); cen.copy(A).add(B).add(C);
        if (nn.dot(cen) < 0) pos.push(...t[0], ...t[2], ...t[1]); else pos.push(...t[0], ...t[1], ...t[2]);
      }
      geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      geo.computeVertexNormals();
    }
    cache.set(key, geo); return geo;
  }
  // box: size w,h,d at x,y,z (centre) with rotation; c chamfer (default 0.03)
  function box(key, w, h, d, x, y, z, rx = 0, ry = 0, rz = 0, c = 0.03) { put(key, cboxGeo(w, h, d, c), T(x, y, z, rx, ry, rz)); }
  // box whose base sits at y (bottom), convenience
  function boxB(key, w, h, d, x, y, z, ry = 0, c = 0.03) { box(key, w, h, d, x, y + h / 2, z, 0, ry, 0, c); }
  function cyl(key, rt, rb, h, seg, x, y, z, rx = 0, ry = 0, rz = 0) {
    put(key, new THREE.CylinderGeometry(rt, rb, h, seg || 8, 1), T(x, y, z, rx, ry, rz));
  }
  // beam between points a and b (arrays), cross section w x d, roll about its axis
  function beam(key, a, b, w, d, c = 0.03, roll = 0, geoFn) {
    const A = V(...a), B = V(...b); const dir = B.clone().sub(A); const L = dir.length(); dir.normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), dir);
    if (roll) q.multiply(new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), roll));
    const m = new THREE.Matrix4().compose(A.clone().add(B).multiplyScalar(0.5), q, V(1, 1, 1));
    put(key, geoFn ? geoFn(L) : cboxGeo(w, L, d, c), m);
  }
  function log(key, a, b, r, seg = 7) { beam(key, a, b, 0, 0, 0, 0, (L) => new THREE.CylinderGeometry(r, r, L, seg, 1)); }
  // roof tiles in a local frame: x along ridge 0..W, z down-slope 0..L, y = slope normal (surface at y=0)
  function tiles(key, W, L, tw = 0.42, tl = 0.5, th = 0.06, lap = 0.62, lift = 0.09) {
    const step = tl * lap; const rows = Math.ceil(L / step);
    for (let r = 0; r < rows; r++) {
      const zc = L - tl / 2 - r * step; if (zc - tl / 2 < -0.02) break;
      const off = (r % 2) * tw * 0.5; const n = Math.ceil((W + tw) / tw);
      for (let i = 0; i < n; i++) {
        let x0 = -tw / 2 + off + i * tw, x1 = x0 + tw * 0.94; x0 = Math.max(x0, 0); x1 = Math.min(x1, W);
        if (x1 - x0 < 0.08) continue;
        box(key, x1 - x0, th, tl, (x0 + x1) / 2 + jit(0.01), th / 2 + lift * 0.5 + jit(0.008), zc, -Math.atan2(lift, tl) + jit(0.03), jit(0.04), jit(0.03), 0.018);
      }
    }
  }
  function lathe(key, pts, seg, m) { put(key, new THREE.LatheGeometry(pts.map((p) => new THREE.Vector2(p[0], p[1])), seg || 12), m); }
  function extrude(key, pts, depth, m, bevel) {
    const sh = new THREE.Shape(pts.map((p) => new THREE.Vector2(p[0], p[1])));
    const geo = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: !!bevel, bevelSize: bevel || 0, bevelThickness: bevel || 0, bevelSegments: 1, curveSegments: 4 });
    geo.translate(0, 0, -depth / 2); put(key, geo, m);
  }
  function finish(g) {
    let tris = 0;
    for (const key of Object.keys(buckets)) {
      const b = buckets[key]; if (!b.pos.length) continue;
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(b.pos, 3));
      geo.setAttribute('normal', new THREE.Float32BufferAttribute(b.nrm, 3));
      geo.computeBoundingBox();
      const bb = geo.boundingBox, sz = bb.getSize(V()); const W = Math.max(sz.x, sz.z, 1e-3), H = Math.max(sz.y, 1e-3);
      const p = geo.attributes.position, n = geo.attributes.normal, uv = [];
      for (let i = 0; i < p.count; i++) {
        const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i));
        const x = (p.getX(i) - bb.min.x) / W, y = (p.getY(i) - bb.min.y) / H, z = (p.getZ(i) - bb.min.z) / W;
        if (ay >= ax && ay >= az) uv.push(x, z); else if (ax >= az) uv.push(z, y); else uv.push(x, y);
      }
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      const mesh = new THREE.Mesh(geo, mats[key]); mesh.name = key; mesh.castShadow = true; mesh.receiveShadow = true;
      g.add(mesh); tris += p.count / 3;
    }
    g.userData.tris = tris;
    return g;
  }
  return { THREE, mats, rnd, jit, T, V, frame, put, cboxGeo, box, boxB, cyl, beam, log, tiles, lathe, extrude, finish };
}
function recentre(THREE, g) {
  const box = new THREE.Box3(), v = new THREE.Vector3(), m = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => {
    const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(m.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld);
  });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  return g;
}
// ---- end kit ----

export default function (THREE) {
  const g = new THREE.Group();
  const K = makeKit(THREE, 21);
  const { box, boxB, cyl, beam, log, put, T, frame, jit, rnd, lathe } = K;
  const F = 1.2, E = 4.3, R = 6.15;               // deck top, eave (wall top), ridge
  const X0 = -3.0, X1 = 2.0, CX = -0.5, HW = 2.5;  // hall in x
  const Z0 = -5.4, Z1 = 2.6, CZ = -1.4, HL = 4.0;  // hall in z
  const k = (R - E) / HW, OV = 0.55, OVG = 0.6;     // roof slope, eave overhang, gable overhang
  const DX0 = -3.5, DX1 = 3.6, DZ0 = -5.9, DZ1 = 5.0;

  // ---------- helpers in wall-local frames (u along wall, z outward, y up) ----------
  function cutSegs(um, y0, top, holes) {
    let segs = [[y0, top]];
    for (const h of holes) if (um > h.u0 && um < h.u1) segs = segs.flatMap(([s, e]) => { const o = []; if (h.y0 > s) o.push([s, Math.min(e, h.y0)]); if (h.y1 < e) o.push([Math.max(s, h.y1), e]); return o; });
    return segs;
  }
  function vPlanks(halfLen, y0, topFn, holes, mat = 'timber', pw = 0.3, depth = 0.07) {
    const n = Math.max(1, Math.round(2 * halfLen / pw)), w = 2 * halfLen / n;
    for (let i = 0; i < n; i++) {
      const ua = -halfLen + i * w + 0.008, ub = ua + w - 0.016, proud = (i % 2) * 0.022, tilt = jit(0.006);
      const cuts = [ua, ub]; for (const h of holes) for (const e of [h.u0, h.u1]) if (e > ua && e < ub) cuts.push(e);
      cuts.sort((a, b) => a - b);
      for (let q = 0; q < cuts.length - 1; q++) {
        const a = cuts[q], b = cuts[q + 1]; if (b - a < 0.02) continue; const um = (a + b) / 2;
        for (const [s, e] of cutSegs(um, y0, topFn(um), holes)) if (e - s > 0.04) box(mat, b - a, e - s, depth, um, (s + e) / 2, -depth / 2 + proud, 0, 0, tilt, 0);
      }
    }
  }
  function hBoards(u0, u1, y0, y1, holes, mat = 'timber', bh = 0.3) {
    const n = Math.max(1, Math.round((y1 - y0) / bh)), h = (y1 - y0) / n;
    for (let r = 0; r < n; r++) {
      const ya = y0 + r * h, yb = ya + h, ym = (ya + yb) / 2;
      let spans = [[u0, u1]];
      for (const ho of holes) if (ym > ho.y0 && ym < ho.y1) spans = spans.flatMap(([a, b]) => { const o = []; if (ho.u0 > a) o.push([a, Math.min(b, ho.u0)]); if (ho.u1 < b) o.push([Math.max(a, ho.u1), b]); return o; });
      for (const [a, b] of spans) if (b - a > 0.05) box(mat, b - a, h + 0.02, 0.07, (a + b) / 2, ym, -0.04 + jit(0.006), -0.09 + jit(0.03), 0, jit(0.008), 0);
    }
  }
  function windowAt(u, yc, w, h) {
    // recessed glass, chunky frame, cross mullion, sill
    box('window', w, h, 0.04, u, yc, -0.16, 0, 0, 0, 0);
    box('wet', w, 0.05, 0.2, u, yc - h / 2 + 0.02, -0.08, 0, 0, 0, 0);
    box('drift', 0.06, h, 0.06, u, yc, -0.11, 0, 0, 0, 0);
    box('drift', w, 0.06, 0.06, u, yc + 0.04, -0.11, 0, 0, 0, 0);
    box('drift', 0.12, h + 0.24, 0.12, u - w / 2 - 0.06, yc, 0.03, 0, 0, jit(0.02), 0);
    box('drift', 0.12, h + 0.24, 0.12, u + w / 2 + 0.06, yc, 0.03, 0, 0, jit(0.02), 0);
    box('drift', w + 0.42, 0.14, 0.14, u, yc + h / 2 + 0.07, 0.04, 0, 0, jit(0.03), 0);
    box('drift', w + 0.5, 0.12, 0.22, u, yc - h / 2 - 0.06, 0.07, 0, 0, jit(0.02), 0);
  }
  const wallFrame = (x, z, ry) => T(x, 0, z, 0, ry, 0);

  // ---- profile helpers (B) ----
  function slabWall(pts, holes, depth = 0.12, mat = 'timber') {
    const sh = new THREE.Shape(pts.map((p) => new THREE.Vector2(p[0], p[1])));
    for (const h of holes) sh.holes.push(new THREE.Path([new THREE.Vector2(h.u0, h.y0), new THREE.Vector2(h.u0, h.y1), new THREE.Vector2(h.u1, h.y1), new THREE.Vector2(h.u1, h.y0)]));
    const geo = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false, curveSegments: 1 });
    put(mat, geo, T(0, 0, -depth - 0.01));
  }
  function battens(halfLen, y0, topFn, holes, step = 0.42) {
    const n = Math.round(2 * halfLen / step), w = 2 * halfLen / n;
    for (let i = 0; i <= n; i++) {
      const u = -halfLen + i * w; const ua = u - 0.05, ub = u + 0.05;
      if (holes.some((h) => ub > h.u0 - 0.02 && ua < h.u1 + 0.02 && false)) continue;
      for (const [s, e] of cutSegs(u, y0, topFn(u), holes.map((h) => ({ u0: h.u0 - 0.06, u1: h.u1 + 0.06, y0: h.y0 - 0.06, y1: h.y1 + 0.06 })))) if (e - s > 0.06) box('timber', 0.1, e - s, 0.05, u, (s + e) / 2, 0.015, 0, 0, jit(0.006), 0);
    }
  }
  const lathePile = (x, z, r, top) => {
    lathe('wet', [[r * 1.08, 0], [r * 1.04, 0.5], [r, 1.02]], 6, T(x, 0, z, 0, rnd() * 3, 0));
    lathe('timber', [[r * 0.98, 0.98], [r * 0.96, top - 0.12], [r * 0.6, top], [0, top]], 6, T(x, 0, z, 0, rnd() * 3, 0));
  };
  function tileStrip(W, zc, tl, tw, off, sag, Ls) {
    const nSeg = 3, yb = zc + tl / 2, yt = zc - tl / 2;
    for (let sg = 0; sg < nSeg; sg++) {
      const xa = W * sg / nSeg, xb = W * (sg + 1) / nSeg - 0.03;
      const pts = [[xa, yt], [xb, yt]];
      // tongues right-to-left
      const b = [];
      for (let i = Math.ceil((xb - off) / tw); i >= Math.floor((xa - off) / tw) - 1; i--) {
        const t0 = off + i * tw, t1 = t0 + tw - 0.05;
        const c0 = Math.max(t0, xa), c1 = Math.min(t1, xb); if (c1 - c0 < 0.12) continue;
        if (c1 === t1) b.push([c1, yb - 0.13], [c1 - 0.1, yb]); else b.push([c1, yb]); b.push([c0, yb - (c0 === t0 ? 0.04 : 0)]);
      }
      const all = pts.concat(b).filter((p, i, arr) => i === 0 || Math.hypot(p[0] - arr[i - 1][0], p[1] - arr[i - 1][1]) > 1e-3);
      const sh = new THREE.Shape(all.map((p) => new THREE.Vector2(p[0], p[1])));
      const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.08, bevelEnabled: false, curveSegments: 1 });
      const xm = (xa + xb) / 2, s = -sag * Math.sin(Math.PI * xm / W) * (1 - 0.55 * zc / Ls);
      const m = T(0, 0.08 + s + jit(0.012), zc, -0.13 + jit(0.03), 0, jit(0.015)).multiply(T(0, 0, -zc)).multiply(T(0, 0, 0, Math.PI / 2, 0, 0));
      put('tile', geo, m);
    }
  }
  function board(a, b, h, d, curl) {
    // extruded bargeboard along a->b (in a vertical plane), lower edge scalloped near the foot
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), L = A.distanceTo(B);
    const pts = [[0, h / 2], [L, h / 2], [L + curl, h / 2 - 0.08], [L + curl * 0.6, -h / 2 - 0.12], [L - 0.25, -h / 2], [0, -h / 2]];
    const sh = new THREE.Shape(pts.map((p) => new THREE.Vector2(p[0], p[1])));
    const geo = new THREE.ExtrudeGeometry(sh, { depth: d, bevelEnabled: false, curveSegments: 1 }); geo.translate(0, 0, -d / 2);
    const dir = B.clone().sub(A).normalize(), q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), dir);
    put('timber', geo, new THREE.Matrix4().compose(A, q, new THREE.Vector3(1, 1, 1)));
  }


  // ---------- piles, under-deck frame, deck ----------
  const piles = [];
  const nx = 5, nz = 6;
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
    const x = DX0 + 0.15 + i * (DX1 - DX0 - 0.3) / (nx - 1), z = DZ0 + 0.15 + j * (DZ1 - DZ0 - 0.3) / (nz - 1);
    const edge = i === 0 || i === nx - 1 || j === 0 || j === nz - 1;
    const outer = edge && (i === nx - 1 || j === nz - 1 || (i === 0 && j >= nz - 2));
    piles.push([x, z, edge, outer]);
  }
  for (const [x, z, edge, outer] of piles) {
    const top = outer ? F + 0.55 + jit(0.15) : F - 0.12;
    const r = 0.19 + jit(0.02);
    if (!edge) continue;
    lathePile(x, z, r, top);
    
    if (outer && rnd() < 0.25) { put('rope', new THREE.TorusGeometry(r + 0.03, 0.05, 3, 7), T(x, top - 0.28, z, Math.PI / 2, 0, 0)); }
  }
  // stringer beams along x on each pile row, and diagonal braces on the outside faces
  for (let j = 0; j < nz; j++) { const z = DZ0 + 0.15 + j * (DZ1 - DZ0 - 0.3) / (nz - 1); box('wet', DX1 - DX0, 0.26, 0.2, (DX0 + DX1) / 2, F - 0.22, z, 0, 0, 0, 0); }
  for (const x of [DX0 + 0.15, DX1 - 0.15]) box('wet', 0.2, 0.26, DZ1 - DZ0, x, F - 0.47, (DZ0 + DZ1) / 2, 0, 0, 0, 0.03);
  for (let j = 0; j < nz - 1; j++) {
    const za = DZ0 + 0.15 + j * (DZ1 - DZ0 - 0.3) / (nz - 1), zb = DZ0 + 0.15 + (j + 1) * (DZ1 - DZ0 - 0.3) / (nz - 1);
    for (const x of [DX0 + 0.15, DX1 - 0.15]) { const s = x > 0 ? 0.24 : -0.24; beam('wet', [x + s, 0.25, j % 2 ? za : zb], [x + s, F - 0.35, j % 2 ? zb : za], 0.1, 0.15, 0); }
  }
  for (let i = 0; i < nx - 1; i++) {
    const xa = DX0 + 0.15 + i * (DX1 - DX0 - 0.3) / (nx - 1), xb = DX0 + 0.15 + (i + 1) * (DX1 - DX0 - 0.3) / (nx - 1);
    for (const z of [DZ0 + 0.15, DZ1 - 0.15]) { const s = z > 0 ? 0.24 : -0.24; beam('wet', [i % 2 ? xa : xb, 0.25, z + s], [i % 2 ? xb : xa, F - 0.35, z + s], 0.15, 0.1, 0); }
  }
  // deck planks run along z, so the plank ends show on the front edge like the reference
  box('timber', X1 - X0, 0.1, Z1 - Z0, CX, F - 0.05, CZ, 0, 0, 0, 0);         // hall floor
  {
    const pw = 0.36; const n = Math.round((DX1 - DX0) / pw), w = (DX1 - DX0) / n;
    for (let i = 0; i < n; i++) {
      const x = DX0 + (i + 0.5) * w; const inHall = x > X0 + 0.05 && x < X1 - 0.05;
      const spans = inHall ? [[Z1, DZ1]] : [[DZ0, DZ1]];
      if (!inHall && x > X1 && true) { /* full length side deck */ }
      for (const [a, b] of spans) {
        // break long planks into two staggered boards
        const mid = a + (b - a) * (0.4 + 0.2 * rnd()); const parts = (b - a) > 7 ? [[a, mid], [mid, b]] : [[a, b]];
        for (const [s, e] of parts) box('timber', w - 0.03, 0.08, e - s - 0.03, x + jit(0.01), F - 0.04 + jit(0.008), (s + e) / 2, jit(0.008), 0, jit(0.01), 0);
      }
    }
    // rim boards
    box('timber', DX1 - DX0 + 0.1, 0.22, 0.08, (DX0 + DX1) / 2, F - 0.17, DZ1 + 0.03, 0, 0, 0, 0.02);
    box('timber', 0.08, 0.22, DZ1 - DZ0, DX1 + 0.03, F - 0.17, (DZ0 + DZ1) / 2, 0, 0, 0, 0.02);
    box('timber', 0.08, 0.22, DZ1 - DZ0, DX0 - 0.03, F - 0.17, (DZ0 + DZ1) / 2, 0, 0, 0, 0.02);
    box('timber', DX1 - DX0 + 0.1, 0.22, 0.08, (DX0 + DX1) / 2, F - 0.17, DZ0 - 0.03, 0, 0, 0, 0.02);
  }
  // ramp down off the front deck
  {
    const rx = -2.0, rz0 = DZ1, rz1 = DZ1 + 2.5, a = Math.atan2(F - 0.15, rz1 - rz0), L = Math.hypot(F - 0.15, rz1 - rz0);
    for (const sx of [-0.85, 0.85]) beam('wet', [rx + sx, F - 0.2, rz0], [rx + sx, 0.1, rz1], 0.14, 0.22, 0.03);
    const n = 8;
    for (let i = 0; i < n; i++) { const t = (i + 0.5) / n; box('timber', 2.0 + jit(0.06), 0.08, L / n - 0.04, rx + jit(0.04), F - 0.04 - t * (F - 0.15), rz0 + t * (rz1 - rz0), a + jit(0.02), jit(0.03), jit(0.015), 0); }
    for (const sx of [-1.05, 1.05]) cyl('wet', 0.14, 0.15, 0.55, 7, rx + sx, 0.275, rz1 - 0.1);
  }

  // ---------- hall frame ----------
  for (const [x, z] of [[X0, Z0], [X1, Z0], [X0, Z1], [X1, Z1]]) boxB('timber', 0.34, E - F + 0.05, 0.34, x, F, z, jit(0.02), 0.05);
  for (const z of [CZ - 1.3, CZ + 1.3]) for (const x of [X0, X1]) boxB('timber', 0.26, E - F, 0.26, x + (x > 0 ? 0.04 : -0.04), F, z, 0, 0.04);
  for (const x of [X0, X1]) { box('timber', 0.3, 0.3, Z1 - Z0 + 0.7, x, E - 0.05, CZ, 0, 0, 0, 0.05); box('timber', 0.24, 0.2, Z1 - Z0, x + (x > 0 ? 0.03 : -0.03), F + 0.1, CZ, 0, 0, 0, 0.04); }
  for (const z of [Z0, Z1]) box('timber', X1 - X0 + 0.5, 0.28, 0.28, CX, E - 0.05, z + (z > 0 ? 0.02 : -0.02), 0, 0, 0, 0.05);

  // ---------- walls ----------
  const gableTop = (u) => R - Math.abs(u) * k - 0.04;
  // front gable (+Z): open double doors and a loft window
  frame(wallFrame(CX, Z1, 0), () => {
    const door = { u0: -1.3, u1: 1.3, y0: F, y1: F + 2.65 }, loft = { u0: -0.4, u1: 0.4, y0: E + 0.25, y1: E + 1.0 };
    slabWall([[-HW, F], [HW, F], [HW, E], [0, R - 0.04], [-HW, E]], [door, loft]); battens(HW, F, (u) => (Math.abs(u) < 2.3 ? gableTop(u) : E), [door, loft]);
    windowAt(0, E + 0.625, 0.8, 0.75);
    // door jambs and lintel
    for (const s of [-1, 1]) boxB('timber', 0.24, 2.75, 0.24, s * 1.42, F, 0.06, 0, 0.04);
    box('timber', 3.4, 0.28, 0.3, 0, F + 2.8, 0.08, 0, 0, jit(0.02), 0.05);
    // dark recess inside the doors: back, sides, ceiling, shelves, oars
    box('wet', 2.7, 2.7, 0.1, 0, F + 1.35, -1.7, 0, 0, 0, 0);
    for (const s of [-1, 1]) box('wet', 0.1, 2.7, 1.7, s * 1.35, F + 1.35, -0.85, 0, 0, 0, 0);
    box('wet', 2.7, 0.1, 1.7, 0, F + 2.7, -0.85, 0, 0, 0, 0);
    for (const y of [0.9, 1.6, 2.2]) box('drift', 1.2, 0.06, 0.35, -0.6, F + y, -1.45, 0, 0, 0, 0);
    for (const [y, x] of [[0.98, -0.85], [1.68, -0.4], [2.28, -0.75]]) box('timber', 0.3, 0.14, 0.25, x, F + y, -1.45, 0, 0, 0, 0);
    beam('drift', [0.6, F + 0.05, -1.4], [0.9, F + 2.3, -1.55], 0.06, 0.06, 0.01);
    box('drift', 0.16, 0.42, 0.05, 0.6, F + 0.3, -1.35, 0, 0, 0.12, 0.01);
    beam('drift', [0.95, F + 0.05, -1.3], [1.15, F + 2.2, -1.55], 0.06, 0.06, 0.01);
    // net inside, barrel inside
    for (let i = 0; i < 4; i++) beam('rope', [0.3 + i * 0.18, F + 2.3, -1.6], [0.45 + i * 0.12, F + 1.5, -1.55], 0.04, 0.04, 0);
    cyl('timber', 0.28, 0.25, 0.7, 10, -0.6, F + 0.35, -1.0);
    // open leaves: built hinge-local, x from hinge, planks + battens + Z brace on both faces
    const leaf = (hx, ry, zz) => frame(T(hx, F + 0.05, 0.1, 0, ry, 0), () => {
      const lw = 1.28, lh = 2.55, n = 4;
      for (let i = 0; i < n; i++) box('timber', lw / n - 0.02, lh + jit(0.04), 0.07, (i + 0.5) * lw / n, lh / 2, (i % 2) * 0.012, 0, 0, jit(0.01), 0);
      {
        for (const y of [0.35, lh - 0.35]) box('drift', lw - 0.06, 0.2, 0.06, lw / 2, y, zz, 0, 0, 0, 0);
        beam('drift', [0.15, 0.4, zz], [lw - 0.15, lh - 0.4, zz], 0.18, 0.06, 0.02);
        for (const y of [0.35, lh - 0.35]) box('iron', 0.4, 0.06, 0.03, 0.2, y, zz * 1.55, 0, 0, 0, 0);
      }
    });
    leaf(-1.3, -Math.PI + 0.75, -0.07);   // left leaf swung outward toward -x/+z
    leaf(1.3, -0.75, 0.07);              // right leaf
  });
  // back gable (-Z): small window high, plain planks
  frame(wallFrame(CX, Z0, Math.PI), () => {
    const w1 = { u0: -0.4, u1: 0.4, y0: E + 0.2, y1: E + 0.9 }, w2 = { u0: -1.6, u1: -0.8, y0: F + 1.0, y1: F + 1.8 };
    slabWall([[-HW, F], [HW, F], [HW, E], [0, R - 0.04], [-HW, E]], [w1, w2]); battens(HW, F, (u) => (Math.abs(u) < 2.3 ? gableTop(u) : E), [w1, w2]);
    windowAt(0, E + 0.55, 0.8, 0.7); windowAt(-1.2, F + 1.4, 0.8, 0.8);
  });
  // side walls: horizontal boards between posts
  frame(wallFrame(X1, CZ, Math.PI / 2), () => {   // +X, u -> world z = CZ - u
    const wa = { u0: -2.75, u1: -1.95, y0: F + 0.95, y1: F + 1.95 }, wb = { u0: -0.85, u1: -0.05, y0: F + 0.95, y1: F + 1.95 };
    slabWall([[-HL, F], [HL, F], [HL, E], [-HL, E]], [wa, wb]); battens(HL, F + 0.2, () => E - 0.15, [wa, wb], 0.5);
    windowAt(-2.35, F + 1.45, 0.8, 1.0); windowAt(-0.45, F + 1.45, 0.8, 1.0);
  });
  frame(wallFrame(X0, CZ, -Math.PI / 2), () => {  // -X, u -> world z = CZ + u
    const wa = { u0: -1.9, u1: -1.1, y0: F + 0.95, y1: F + 1.95 }, wb = { u0: 0.8, u1: 1.6, y0: F + 0.95, y1: F + 1.95 };
    slabWall([[-HL, F], [HL, F], [HL, E], [-HL, E]], [wa, wb]); battens(HL, F + 0.2, () => E - 0.15, [wa, wb], 0.5);
    windowAt(-1.5, F + 1.45, 0.8, 1.0); windowAt(1.2, F + 1.45, 0.8, 1.0);
  });

  // ---------- roof ----------
  const a = Math.atan(k), Ls = (HW + OV) / Math.cos(a) + 0.05;
  const zf = Z1 + OVG, zb = Z0 - OVG, W = zf - zb;
  const sag = 0.16;
  function slope(sign) {
    // local: x along ridge, z down slope, y out of the roof
    const d = new THREE.Vector3(sign * Math.cos(a), -Math.sin(a), 0), n = new THREE.Vector3(sign * Math.sin(a), Math.cos(a), 0);
    const xl = new THREE.Vector3().crossVectors(n, d);
    const m = new THREE.Matrix4().makeBasis(xl, n, d); m.setPosition(CX, R + 0.33, xl.z < 0 ? zf : zb);
    frame(m, () => {
      box('timber', W, 0.12, Ls, W / 2, -0.24, Ls / 2, 0, 0, 0, 0.03);
      // rafter tails under the eave
      for (let x = 0.25; x < W; x += 0.95) box('timber', 0.14, 0.18, 1.2, x, -0.36, Ls - 0.5, 0, 0, 0, 0);
      // purlins showing under the gable overhangs
      for (const zz of [1.1, 2.4]) box('timber', W + 0.3, 0.2, 0.2, W / 2, -0.38, zz, 0, 0, 0, 0);
      // tiles, rows from the eave up so upper rows lap over lower ones
      const tw = 0.8, tl = 0.8, step = 0.48; const rows = Math.ceil((Ls - 0.1) / step);
      for (let r = 0; r < rows; r++) {
        const zc = Ls - tl / 2 - r * step; if (zc < tl / 2 - 0.15) break;
        tileStrip(W, zc, tl, tw, (r % 2) * tw / 2 - tw, sag, Ls);
      }
    });
  }
  slope(1); slope(-1);
  // ridge cap (diamond section) following the sag, ridge beam with chunky ends
  {
    const n = 14;
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n, z = zf - t * W, s = -sag * Math.sin(Math.PI * t);
      box('tile', 0.32, 0.32, W / n + 0.03, CX, R + 0.36 + s, z, 0, 0, Math.PI / 4, 0);
    }
    for (const [z0, z1] of [[zf + 0.35, zf - 0.6], [zb - 0.35, zb + 0.6]]) box('timber', 0.36, 0.42, Math.abs(z1 - z0), CX, R + 0.4, (z0 + z1) / 2, 0, 0, 0, 0.07);
  }
  // bargeboards crossing at the peak
  for (const zz of [zf - 0.08, zb + 0.08]) for (const s of [-1, 1]) {
    const run = HW + OV + 0.05;
    board([CX - s * 0.4, R + 0.3 + 0.4 * k, zz], [CX + s * run, R + 0.3 - run * k, zz], 0.32, 0.16, 0.2);
  }
  // king post + collar in the front gable
  box('timber', 0.2, R - E - 0.5, 0.18, CX - 1.15, (E + R) / 2 - 0.4, Z1 + 0.06, 0, 0, 0.05, 0.03);

  // ---------- chimney (behind the ridge, left slope) ----------
  {
    const cx = CX - 0.85, cz = CZ - 0.6, base = R - 0.85 * k - 0.2;
    let y = base;
    for (let i = 0; i < 4; i++) { const h = 0.42; box('stone', 0.72 + jit(0.04), h, 0.72 + jit(0.04), cx + jit(0.02), y + h / 2, cz, 0, jit(0.08), 0, 0.06); y += h; }
    box('stone', 0.9, 0.14, 0.9, cx, y + 0.07, cz, 0, 0.05, 0, 0.04);
    for (const s of [-1, 1]) box('stone', 0.24, 0.22, 0.4, cx + s * 0.2, y + 0.25, cz, 0, 0, 0, 0.04);
    box('kelp', 0.5, 0.05, 0.4, cx - 0.1, y + 0.165, cz + 0.1, 0, 0.3, 0, 0.02);
  }

  // ---------- porch wing at the back on +X: open cross gable on posts ----------
  {
    const wz0 = Z0 + 0.1, wz1 = CZ - 0.7, wcz = (wz0 + wz1) / 2, whw = (wz1 - wz0) / 2, wx = 3.45;
    const Ew = 3.75, Rw = 5.05, kw = (Rw - Ew) / whw, b = Math.atan(kw);
    for (const z of [wz0 + 0.1, wz1 - 0.1]) boxB('timber', 0.28, Ew - F, 0.28, wx, F, z, 0, 0.04);
    box('timber', 0.28, 0.28, wz1 - wz0 + 0.4, wx, Ew - 0.05, wcz, 0, 0, 0, 0.05);
    for (const z of [wz0 + 0.1, wz1 - 0.1]) box('timber', wx - X1 + 0.2, 0.26, 0.24, (wx + X1) / 2, Ew - 0.05, z, 0, 0, 0, 0.04);
    // truss in the gable: king post and X braces
    boxB('timber', 0.2, Rw - Ew - 0.1, 0.2, wx, Ew, wcz, 0, 0.03);
    for (const s of [-1, 1]) beam('timber', [wx, Ew + 0.1, wcz + s * (whw - 0.3)], [wx, Rw - 0.35, wcz], 0.16, 0.16, 0.03);
    for (const s of [-1, 1]) beam('timber', [wx, F + 0.1 + 1.6, wz0 + 0.1 + (s > 0 ? 0 : 0) + (s > 0 ? 0.15 : whw * 2 - 0.35)], [wx, Ew - 0.2, s > 0 ? wz0 + 0.8 : wz1 - 0.8], 0.14, 0.14, 0.02);
    // knee braces
    for (const z of [wz0 + 0.1, wz1 - 0.1]) beam('timber', [wx, Ew - 0.75, z], [wx - 0.6, Ew - 0.12, z], 0.14, 0.14, 0.02);
    const xs = X1 - 0.9, xe = wx + 0.5, Lw = (whw + 0.45) / Math.cos(b) + 0.05, Ww = xe - xs;
    for (const sign of [1, -1]) {
      const d = new THREE.Vector3(0, -Math.sin(b), sign * Math.cos(b)), n = new THREE.Vector3(0, Math.cos(b), sign * Math.sin(b));
      const xl = new THREE.Vector3().crossVectors(n, d);
      const m = new THREE.Matrix4().makeBasis(xl, n, d); m.setPosition(xl.x > 0 ? xs : xe, Rw + 0.25, wcz);
      frame(m, () => {
        box('timber', Ww, 0.12, Lw, Ww / 2, -0.16, Lw / 2, 0, 0, 0, 0.03);
        for (let x = 1.0; x < Ww; x += 0.75) box('timber', 0.13, 0.17, 0.9, xl.x > 0 ? x : Ww - x, -0.3, Lw - 0.35, 0, 0, 0, 0);
        const tw = 0.8, tl = 0.8, step = 0.48; const rows = Math.ceil(Lw / step);
        for (let r = 0; r < rows; r++) {
          const zc = Lw - tl / 2 - r * step; if (zc < tl / 2 - 0.15) break;
          tileStrip(Ww, zc, tl, tw, (r % 2) * tw / 2 - tw, 0.08, Lw);
        }
      });
    }
    for (let i = 0; i < 5; i++) { const t = (i + 0.5) / 5; box('tile', (xe - xs) / 5 + 0.03, 0.26, 0.26, xs + t * (xe - xs), Rw + 0.27, wcz, Math.PI / 4, 0, 0, 0); }
    box('timber', 0.4, 0.4, 0.34, xe + 0.15, Rw + 0.32, wcz, 0, 0, 0, 0.06);
    for (const s of [-1, 1]) beam('timber', [xe - 0.05, Rw + 0.22 + 0.35 * kw, wcz - s * 0.35], [xe - 0.05, Rw + 0.22 - (whw + 0.5) * kw, wcz + s * (whw + 0.5)], 0.3, 0.15, 0.05);
    // little awning on the wing front corner
    frame(T(wx + 0.05, Ew - 0.45, wz1 + 0.35, 0, 0, 0), () => {
      box('tile', 0.9, 0.08, 0.9, 0.35, 0, 0, 0, 0, -0.45, 0.02);
      for (let i = 0; i < 3; i++) box('tile', 0.3, 0.06, 0.9, 0.1 + i * 0.3, 0.2 - i * 0.14, 0, 0, 0, -0.45, 0.015);
      beam('timber', [0, -0.7, 0], [0.55, -0.08, 0], 0.1, 0.1, 0.02);
    });
    // barrel and crates under the porch
    cyl('timber', 0.3, 0.27, 0.8, 10, 2.85, F + 0.4, wz0 + 0.7);
    for (const y of [0.15, 0.65]) cyl('iron', 0.31, 0.31, 0.06, 10, 2.85, F + y, wz0 + 0.7);
    box('timber', 0.6, 0.6, 0.6, 2.75, F + 0.3, wcz + 0.3, 0, 0.3, 0, 0.05);
  }

  // ---------- props ----------
  const barrel = (x, z, ry) => {
    lathe('timber', [[0, 0], [0.26, 0], [0.3, 0.22], [0.315, 0.425], [0.3, 0.63], [0.26, 0.85], [0, 0.85]], 10, T(x, F, z, 0, ry, 0));
    for (const y of [0.14, 0.71]) put('iron', new THREE.CylinderGeometry(0.31, 0.31, 0.06, 8, 1, true), T(x, F + y, z));
    cyl('wet', 0.26, 0.26, 0.04, 10, x, F + 0.85, z);
  };
  barrel(-3.0, Z1 + 0.6, 0); barrel(-2.35, Z1 + 0.45, 1);
  // rope coil on the deck
  for (let i = 0; i < 2; i++) put('rope', new THREE.TorusGeometry(0.32 - i * 0.04, 0.05, 3, 9), T(2.9, F + 0.05 + i * 0.08, DZ1 - 0.7, Math.PI / 2, 0, 0));
  // lantern on a bracket off the front-left corner
  {
    const lx = X0 - 0.75, ly = E - 1.25, lz = Z1 + 0.1;
    box('timber', 0.95, 0.18, 0.18, X0 - 0.4, E - 0.55, lz, 0, 0, 0, 0.03);
    beam('timber', [X0 - 0.1, E - 1.15, lz], [X0 - 0.55, E - 0.6, lz], 0.12, 0.12, 0.02);
    for (let i = 0; i < 2; i++) put('iron', new THREE.TorusGeometry(0.05, 0.015, 4, 8), T(lx, E - 0.7 - i * 0.09, lz, 0, i * Math.PI / 2, 0));
    cyl('iron', 0.06, 0.16, 0.12, 6, lx, ly + 0.42, lz);
    cyl('lampglow', 0.12, 0.12, 0.32, 6, lx, ly + 0.2, lz);
    cyl('iron', 0.16, 0.13, 0.07, 6, lx, ly + 0.02, lz);
    for (let i = 0; i < 3; i++) { const q = i / 3 * Math.PI * 2; box('iron', 0.03, 0.34, 0.03, lx + Math.cos(q) * 0.13, ly + 0.2, lz + Math.sin(q) * 0.13, 0, 0, 0, 0); }
  }
  // net hanging on the front wall left of the doors
  {
    const nx0 = X0 + 0.35, nx1 = X0 + 1.1, ny0 = F + 0.9, ny1 = F + 2.5, z = Z1 + 0.12;
    for (let i = 0; i <= 4; i++) { const t = i / 4; beam('rope', [nx0 + t * (nx1 - nx0), ny1, z], [nx0 + 0.15 + t * (nx1 - nx0 - 0.3), ny0, z + 0.06], 0.03, 0.03, 0); }
    for (let j = 0; j <= 4; j++) { const t = j / 4, y = ny1 - t * (ny1 - ny0); box('rope', (nx1 - nx0) - t * 0.3, 0.03, 0.03, (nx0 + nx1) / 2, y, z + t * 0.06, 0, 0, 0, 0); }
    put('iron', new THREE.CylinderGeometry(0.04, 0.04, 0.2, 5), T(nx0, ny1, z - 0.05, Math.PI / 2, 0, 0));
  }
  // rope swags from the gable to the corner, and a rope rail on the left front piles
  const swag = (p, q, drop, n = 5) => { let prev = p; for (let i = 1; i <= n; i++) { const t = i / n; const pt = [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t - drop * Math.sin(Math.PI * t), p[2] + (q[2] - p[2]) * t]; beam('rope', prev, pt, 0, 0, 0, 0, (L) => new THREE.CylinderGeometry(0.04, 0.04, L + 0.03, 5, 1, true)); prev = pt; } };
  swag([CX - 0.9, R - 0.4, Z1 + 0.15], [X0 + 0.2, E - 0.4, Z1 + 0.25], 0.6);
  swag([CX - 1.4, R - 0.8, Z1 + 0.15], [X0 + 0.25, F + 2.6, Z1 + 0.25], 0.4);
  {
    const fr = piles.filter((p) => p[3] && Math.abs(p[1] - (DZ1 - 0.15)) < 0.01 && p[0] < -1).sort((a, b) => a[0] - b[0]);
    const lf = piles.filter((p) => p[3] && Math.abs(p[0] - (DX0 + 0.15)) < 0.01).sort((a, b) => a[1] - b[1]);
    const chain = [...lf.slice(0, -1), ...fr];
    for (let i = 0; i < chain.length - 1; i++) swag([chain[i][0], F + 0.45, chain[i][1]], [chain[i + 1][0], F + 0.45, chain[i + 1][1]], 0.18, 4);
  }

  K.finish(g);
  return recentre(THREE, g);
}
