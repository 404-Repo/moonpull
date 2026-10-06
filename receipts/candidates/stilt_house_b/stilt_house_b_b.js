// stilt_house_b B: profiles. Every wall is an ExtrudeGeometry of its outline with the openings cut as Shape holes,
// tile courses are extruded notched strips (one per row), the chimney is a stack of extruded wobbly
// rounded-square courses with bevelled joints, stair stringers are extruded saw-tooth profiles.
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
  const K = makeKit(THREE, 41);
  const { cyl, put, T, V, frame, jit, rnd } = K;
  // chamfer only chunky parts: thin members stay 12-triangle boxes (budget)
  const cc = (c, ...d) => (Math.min(...d) < 0.16 ? 0 : c);
  const box = (k, w, h, d, x, y, z, rx = 0, ry = 0, rz = 0, c = 0.03) => K.box(k, w, h, d, x, y, z, rx, ry, rz, cc(c, w, h, d));
  const boxB = (k, w, h, d, x, y, z, ry = 0, c = 0.03) => K.boxB(k, w, h, d, x, y, z, ry, cc(c, w, h, d));
  const beam = (k, a, b, w, d, c = 0.03) => K.beam(k, a, b, w, d, cc(c, w, d));
  const HX = 2.0, ZF = 1.4, ZB = -2.0, FY = 1.9, EY = 4.9, WT = 0.22;
  const PA = 54 * Math.PI / 180, TA = Math.tan(PA), CA = Math.cos(PA), SA = Math.sin(PA);
  const RY = EY + HX * TA;                 // roof underside at x=0 (wall plane line)
  const DK = 0.12;                         // roof deck thickness
  const roofTop = (x) => RY + DK - Math.abs(x) * TA;
  const basis = (xl, zl, o) => new THREE.Matrix4().makeBasis(xl, V(0, 1, 0), zl).setPosition(o);
  const slope = (o, X, Z) => { const Y = Z.clone().cross(X); return new THREE.Matrix4().makeBasis(X, Y, Z).setPosition(o); };

  // ---------- wall slabs with holes ----------
  function subtract(segs, a, b) { const out = []; for (const [s, e] of segs) { if (b <= s || a >= e) out.push([s, e]); else { if (a > s) out.push([s, a]); if (b < e) out.push([b, e]); } } return out; }
  function wall(mat, len, h, holes, widthAt, apex, step = 0.1) {
    const ys = new Set([0, h]); holes.forEach((o) => { ys.add(o.y); ys.add(o.y + o.h); });
    let top = h; if (widthAt) { top = apex; for (let y = h; y < top; y += step) ys.add(+y.toFixed(4)); ys.add(top); }
    const arr = [...ys].filter((y) => y >= 0 && y <= top + 1e-6).sort((a, b) => a - b);
    for (let i = 0; i < arr.length - 1; i++) {
      const ya = arr[i], yb = arr[i + 1]; if (yb - ya < 0.004) continue;
      let hw = len / 2; if (widthAt && ya >= h - 1e-6) hw = Math.min(hw, widthAt(ya)); if (hw <= 0.03) continue;
      let segs = [[-hw, hw]];
      for (const o of holes) if (o.y <= ya + 1e-6 && o.y + o.h >= yb - 1e-6) segs = subtract(segs, o.x - o.w / 2, o.x + o.w / 2);
      for (const [a, b] of segs) if (b - a > 0.01) box(mat, b - a, yb - ya, WT, (a + b) / 2, (ya + yb) / 2, -WT / 2, 0, 0, 0, 0);
    }
  }
  function windowUnit(o, cross = true) {
    const { x, y, w, h } = o, f = 0.11;
    box('timber', w + 2 * f, f + 0.02, 0.14, x, y + h + f / 2, 0, 0, 0, 0, 0.025);
    box('timber', f, h, 0.13, x - w / 2 - f / 2, y + h / 2, 0, 0, 0, 0, 0.02);
    box('timber', f, h, 0.13, x + w / 2 + f / 2, y + h / 2, 0, 0, 0, 0, 0.02);
    box('timber', w + 0.36, 0.1, 0.24, x, y - 0.05, 0.04, 0, 0, 0, 0.025);
    box('window', w, h, 0.04, x, y + h / 2, -WT * 0.62, 0, 0, 0, 0);
    if (cross) {
      box('timber', 0.06, h, 0.06, x, y + h / 2, -WT * 0.5, 0, 0, 0, 0);
      box('timber', w, 0.06, 0.06, x, y + h * 0.55, -WT * 0.5, 0, 0, 0, 0);
    }
  }
  function doorUnit(o) {
    const { x, y, w, h } = o, f = 0.12;
    box('timber', w + 2 * f + 0.1, 0.16, 0.18, x, y + h + 0.08, 0.02, 0, 0, 0, 0.03);
    box('timber', f, h, 0.15, x - w / 2 - f / 2, y + h / 2, 0, 0, 0, 0, 0.02);
    box('timber', f, h, 0.15, x + w / 2 + f / 2, y + h / 2, 0, 0, 0, 0, 0.02);
    const n = 4, pw = w / n;
    for (let i = 0; i < n; i++) box('drift', pw - 0.025, h - 0.02, 0.06, x - w / 2 + pw * (i + 0.5), y + h / 2, -0.12, 0, 0, 0, 0.012);
    for (const yy of [0.3, h - 0.35]) box('drift', w - 0.12, 0.12, 0.05, x, y + yy, -0.07, 0, 0, 0, 0.015);
    box('drift', 0.09, h * 0.62, 0.04, x, y + h / 2 - 0.02, -0.07, 0, 0, Math.atan2(w - 0.12, h - 0.65), 0);
    box('iron', 0.06, 0.16, 0.05, x + w / 2 - 0.15, y + h * 0.5, -0.03, 0, 0, 0, 0.01);
    for (const yy of [0.3, h - 0.35]) box('iron', 0.28, 0.05, 0.03, x - w / 2 + 0.16, y + yy, -0.035, 0, 0, 0, 0);
  }

  // ---------- walls ----------
  const zc = (ZF + ZB) / 2, LZ = ZF - ZB, RH = EY - FY;
  const gw = (ly) => (RY - FY - ly + 0.01) / TA, apex = RY - FY + 0.06;
  const W = {
    front: { m: basis(V(1, 0, 0), V(0, 0, 1), V(0, FY, ZF)), len: 2 * HX, gable: true,
      doors: [{ x: 0.35, y: 0.02, w: 0.95, h: 1.98 }, { x: 0.3, y: 2.72, w: 0.88, h: 1.72 }], wins: [] },
    back: { m: basis(V(-1, 0, 0), V(0, 0, -1), V(0, FY, ZB)), len: 2 * HX, gable: true,
      doors: [], wins: [{ x: -0.7, y: 0.85, w: 0.75, h: 1.0 }, { x: 0.9, y: 0.85, w: 0.6, h: 0.8 }, { x: 0, y: 3.3, w: 0.62, h: 0.75 }] },
    left: { m: basis(V(0, 0, 1), V(-1, 0, 0), V(-HX, FY, zc)), len: LZ,
      doors: [], wins: [{ x: 0.75, y: 0.8, w: 0.78, h: 1.05 }] },
    right: { m: basis(V(0, 0, -1), V(1, 0, 0), V(HX, FY, zc)), len: LZ,
      doors: [], wins: [{ x: -0.75, y: 0.8, w: 0.78, h: 1.05 }, { x: 1.0, y: 0.9, w: 0.6, h: 0.8 }] },
  };
  function wallX(len, holes, gable) {
    const L2 = len / 2, pts = gable ? [[-L2, 0], [L2, 0], [L2, RH + 0.05], [0, RY - FY + 0.05], [-L2, RH + 0.05]] : [[-L2, 0], [L2, 0], [L2, RH], [-L2, RH]];
    const sh = new THREE.Shape(pts.map((p) => new THREE.Vector2(p[0], p[1])));
    for (const o of holes) { const hp = new THREE.Path(); hp.moveTo(o.x - o.w / 2, o.y + 0.001); hp.lineTo(o.x - o.w / 2, o.y + o.h); hp.lineTo(o.x + o.w / 2, o.y + o.h); hp.lineTo(o.x + o.w / 2, o.y + 0.001); hp.lineTo(o.x - o.w / 2, o.y + 0.001); sh.holes.push(hp); }
    const geo = new THREE.ExtrudeGeometry(sh, { depth: WT, bevelEnabled: false, curveSegments: 1 }); geo.translate(0, 0, -WT);
    put('plaster', geo);
  }
  for (const k of Object.keys(W)) {
    const w = W[k];
    frame(w.m, () => {
      wallX(w.len, [...w.doors, ...w.wins], w.gable);
      w.wins.forEach((o) => windowUnit(o));
      w.doors.forEach((o) => doorUnit(o));
      // plinth trim where wall meets the floor
      box('timber', w.len + 0.08, 0.14, 0.1, 0, 0.07, 0.04, 0, 0, 0, 0.02);
    });
  }
  // soft corner posts of plaster (rounded corners)
  for (const sx of [-1, 1]) for (const z of [ZF, ZB]) cyl('plaster', 0.12, 0.13, RH, 6, sx * (HX - 0.06), FY + RH / 2, z - Math.sign(z - zc) * 0.06);

  // ---------- floor platform and substructure ----------
  const X0 = -HX - 0.14, X1 = HX + 0.14, Z0 = ZB - 0.14, Z1 = ZF + 0.14;
  box('timber', X1 - X0, 0.22, 0.24, 0, FY - 0.11, Z1 - 0.12, 0, 0, 0, 0.04);
  box('timber', X1 - X0, 0.22, 0.24, 0, FY - 0.11, Z0 + 0.12, 0, 0, 0, 0.04);
  box('timber', 0.24, 0.22, Z1 - Z0 - 0.48, X0 + 0.12, FY - 0.11, (Z0 + Z1) / 2, 0, 0, 0, 0.04);
  box('timber', 0.24, 0.22, Z1 - Z0 - 0.48, X1 - 0.12, FY - 0.11, (Z0 + Z1) / 2, 0, 0, 0, 0.04);
  box('wet', X1 - X0 - 0.3, 0.2, Z1 - Z0 - 0.3, 0, FY - 0.32, (Z0 + Z1) / 2, 0, 0, 0, 0.03);
  for (let z = ZB + 0.25; z < ZF; z += 0.62) for (const sx of [-1, 1]) box('wet', 0.2, 0.16, 0.14, sx * (HX + 0.12), FY - 0.32, z, 0, 0, 0, 0.03);
  const PY = FY - 0.42;
  const posts = [[-1.85, ZF - 0.05], [1.85, ZF - 0.05], [-1.85, ZB + 0.12], [1.85, ZB + 0.12], [1.85, -0.3], [-1.85, 0.25]];
  for (const [x, z] of posts) { boxB('wet', 0.27, PY, 0.27, x, 0, z, jit(0.05), 0.04); boxB('stone', 0.42, 0.14, 0.42, x, 0, z, 0.3, 0.04); }
  // stone piers (ashlar)
  for (const [px, pz] of [[0.1, ZF - 0.4], [0.1, ZB + 0.45]]) {
    const n = 4, ch = PY / n;
    for (let i = 0; i < n; i++) {
      const rot = i % 2;
      for (let j = 0; j < 2; j++) {
        const off = (j - 0.5) * 0.36;
        if (rot) box('stone', 0.36 - 0.03, ch - 0.03, 0.72 + jit(0.03), px + off, ch * (i + 0.5), pz, 0, jit(0.04), 0, 0.045);
        else box('stone', 0.72 + jit(0.03), ch - 0.03, 0.36 - 0.03, px, ch * (i + 0.5), pz + off, 0, jit(0.04), 0, 0.045);
      }
    }
  }
  // cross braces between stilts on the two long sides and back
  for (const sx of [-1, 1]) {
    beam('wet', [sx * 1.92, 0.25, ZB + 0.15], [sx * 1.92, PY - 0.1, sx < 0 ? 0.2 : -0.35], 0.09, 0.16, 0.02);
    beam('wet', [sx * 1.92, 0.25, ZF - 0.08], [sx * 1.92, PY - 0.1, sx < 0 ? 0.2 : -0.35], 0.09, 0.16, 0.02);
  }
  beam('wet', [-1.85, 0.3, ZB + 0.02], [1.85, PY - 0.1, ZB + 0.02], 0.16, 0.09, 0.02);
  beam('wet', [1.85, 0.3, ZB + 0.02], [-1.85, PY - 0.1, ZB + 0.02], 0.16, 0.09, 0.02);
  beam('wet', [-1.85, 0.45, ZF + 0.1], [-0.25, PY - 0.15, ZF + 0.1], 0.16, 0.09, 0.02);

  // ---------- roof ----------
  const ZRF = ZF + 0.55, ZRB = ZB - 0.42, RW = ZRF - ZRB, EX = HX + 0.55, RL = EX / CA;
  // one extruded strip per course; the butt edge is notched into tile tabs. Hidden underside cap dropped.
  const SM = new THREE.Matrix4().makeBasis(V(1, 0, 0), V(0, 0, -1), V(0, 1, 0)); // shape y -> -z (so butt edge drawn at -y), extrude -> +y
  function dropDown(geo, both) { const g2 = geo.index ? geo.toNonIndexed() : geo; const p = g2.attributes.position, keep = [];
    const A = V(0, 0, 0), B = V(0, 0, 0), C = V(0, 0, 0);
    for (let i = 0; i < p.count; i += 3) { A.fromBufferAttribute(p, i); B.fromBufferAttribute(p, i + 1); C.fromBufferAttribute(p, i + 2);
      const n = B.clone().sub(A).cross(C.clone().sub(A)); const zz = (A.z + B.z + C.z) / 3;
      if (Math.abs(n.x) + Math.abs(n.y) < 1e-6 && ((n.z < -1e-9 && zz < 1e-4) || (both && n.z > 1e-9))) continue; for (const q of [A, B, C]) keep.push(q.x, q.y, q.z); }
    const o = new THREE.BufferGeometry(); o.setAttribute('position', new THREE.Float32BufferAttribute(keep, 3)); o.computeVertexNormals(); return o; }
  function myTiles(Wd, L, tw, tl, th, lift) {
    const step = tl * 0.6, rows = Math.ceil((L - tl * 0.4) / step), nd = tl * 0.2, gp = 0.035;
    for (let r = 0; r < rows; r++) {
      const zc2 = L - tl / 2 - r * step; if (zc2 < tl * 0.3) break;
      const off = (r % 2) * tw * 0.5, h2 = tl / 2;
      const pts = [[0, -h2], [Wd, -h2]];
      const xs = []; for (let x0 = -tw / 2 + off; x0 < Wd; x0 += tw) xs.push(x0);
      // butt edge from right to left
      for (let i = xs.length - 1; i >= 0; i--) {
        const a = Math.max(xs[i] + gp, 0), b = Math.min(xs[i] + tw - gp, Wd); if (b - a < 0.06) continue;
        const dz = jit(0.03);
        pts.push([b, h2 - nd], [b, h2 + dz], [a, h2 + dz], [a, h2 - nd]);
      }
      if (pts[pts.length - 1][0] > 0.001) pts.push([0, h2 - nd]);
      if (pts[2][0] < Wd - 0.001) pts.splice(2, 0, [Wd, h2 - nd]);
      const sh = new THREE.Shape(pts.map((p) => new THREE.Vector2(p[0], -p[1])));
      const geo = dropDown(new THREE.ExtrudeGeometry(sh, { depth: th, bevelEnabled: false, curveSegments: 1 }));
      put('tile', geo, T(jit(0.01), lift * 0.5, zc2, -Math.atan2(lift, tl) + jit(0.012), 0, jit(0.01)).multiply(SM));
    }
  }
  const slopes = [
    slope(V(0, RY + DK, ZRF), V(0, 0, -1), V(CA, -SA, 0)),
    slope(V(0, RY + DK, ZRB), V(0, 0, 1), V(-CA, -SA, 0)),
  ];
  for (const m of slopes) frame(m, () => {
    box('timber', RW, DK, RL, RW / 2, -DK / 2, RL / 2, 0, 0, 0, 0.02);
    myTiles(RW, RL, 0.52, 0.66, 0.075, 0.12);
    box('timber', RW, 0.18, 0.1, RW / 2, -0.1, RL - 0.02, 0, 0, 0, 0.02); // fascia
  });
  // ridge cap
  for (let z = ZRB - 0.05; z < ZRF + 0.05; z += 0.42) cyl('tile', 0.15, 0.15, 0.46, 7, 0, RY + DK + 0.1, z + 0.2, Math.PI / 2, 0, 0);
  box('timber', 0.24, 0.28, RW + 0.5, 0, RY - 0.12, (ZRF + ZRB) / 2, 0, 0, 0, 0.04); // ridge beam, ends show
  // barge boards
  for (const z of [ZRF + 0.05, ZRB - 0.05]) for (const sx of [-1, 1])
    beam('timber', [sx * (EX + 0.08), roofTop(EX + 0.08) + 0.02, z], [0, roofTop(0) + 0.12, z], 0.3, 0.13, 0.035);
  // rafter ends under the eaves
  for (let z = ZRB + 0.1; z <= ZRF - 0.05; z += 0.55) for (const sx of [-1, 1]) {
    const x1 = HX - 0.3, x2 = EX - 0.04;
    beam('timber', [sx * x1, RY - x1 * TA - 0.08, z], [sx * x2, RY - x2 * TA - 0.08, z], 0.15, 0.12, 0.025);
  }

  // ---------- dormer on the left slope ----------
  const DZ = 0.35, DXF = -1.86, DTOP = 6.32, DR = 6.95, DHW = 0.62;
  frame(basis(V(0, 0, 1), V(-1, 0, 0), V(DXF, 0, DZ)), () => {
    // local: x across (world z), z outward (-X), front face z=0
    const depth = 1.25;
    for (const s of [-1, 1]) box('plaster', 0.12, DTOP - 5.1, depth, s * (DHW - 0.06), (DTOP + 5.1) / 2, -depth / 2, 0, 0, 0, 0.02);
    // front face with window opening
    const win = { x: 0, y: 5.5, w: 0.62, h: 0.62 };
    box('plaster', 2 * DHW, win.y - 5.3, 0.12, 0, (win.y + 5.3) / 2, -0.06, 0, 0, 0, 0);
    box('plaster', 2 * DHW, DTOP - win.y - win.h, 0.12, 0, (DTOP + win.y + win.h) / 2, -0.06, 0, 0, 0, 0);
    for (const s of [-1, 1]) box('plaster', DHW - win.w / 2, win.h, 0.12, s * (DHW + win.w / 2) / 2, win.y + win.h / 2, -0.06, 0, 0, 0, 0);
    for (let y = DTOP; y < DR; y += 0.08) { const hw = Math.max(0.02, DHW + 0.06 - (y - DTOP)); box('plaster', 2 * hw, 0.08, 0.12, 0, y + 0.04, -0.06, 0, 0, 0, 0); }
    box('timber', win.w + 0.22, 0.11, 0.14, 0, win.y + win.h + 0.055, 0.02, 0, 0, 0, 0.02);
    for (const s of [-1, 1]) box('timber', 0.11, win.h, 0.13, s * (win.w / 2 + 0.055), win.y + win.h / 2, 0.02, 0, 0, 0, 0.02);
    box('timber', win.w + 0.34, 0.1, 0.22, 0, win.y - 0.05, 0.05, 0, 0, 0, 0.02);
    box('window', win.w, win.h, 0.04, 0, win.y + win.h / 2, -0.09, 0, 0, 0, 0);
    box('timber', 0.07, win.h, 0.06, 0, win.y + win.h / 2, -0.04, 0, 0, 0, 0);
    box('timber', 0.07, Math.hypot(win.w / 2, win.h) - 0.04, 0.05, win.w / 4, win.y + win.h / 2, -0.03, 0, 0, Math.atan2(win.w / 2, win.h), 0);
    // little gable roof (ridge along local z)
    const dpa = Math.PI / 4, rl = (DHW + 0.25) / Math.cos(dpa), rw = depth + 0.35;
    for (const s of [-1, 1]) {
      const X = V(0, 0, s < 0 ? 1 : -1), Z = V(s * Math.cos(dpa), -Math.sin(dpa), 0);
      const o = V(0, DR + 0.06, s < 0 ? -depth : 0.3);
      frame(slope(o, X, Z), () => {
        box('timber', rw, 0.08, rl, rw / 2, -0.04, rl / 2, 0, 0, 0, 0.015);
        myTiles(rw, rl, 0.36, 0.42, 0.06, 0.08);
      });
      beam('timber', [s * (DHW + 0.27), DR + 0.06 - (DHW + 0.27) + 0.02, 0.33], [0, DR + 0.16, 0.33], 0.22, 0.1, 0.03);
    }
    cyl('tile', 0.1, 0.1, rw + 0.05, 6, 0, DR + 0.12, 0.3 - rw / 2, Math.PI / 2, 0, 0);
  });

  // ---------- chimney: stacked extruded courses with bevelled joints ----------
  const CZ = -1.1, CTOP = 8.75;
  const cw = (y) => 1.12 - 0.3 * Math.min(1, y / CTOP);
  const cd = (y) => 0.98 - 0.25 * Math.min(1, y / CTOP);
  const XM = new THREE.Matrix4().makeBasis(V(1, 0, 0), V(0, 0, -1), V(0, 1, 0)); // shape (x,y) -> world (x,-z), extrude -> +y
  for (let y = 0.0, k = 0; y < CTOP - 0.05; k++) {
    const ch = 0.38 + rnd() * 0.08, yc = y + ch / 2, w = cw(yc) - 0.08, d = cd(yc) - 0.08, r = 0.16;
    // wobbly rounded rectangle: cobbles bulge at random along the course
    const pts = []; const N = 4;
    const corner = (cx, cy, a0) => { for (let i = 0; i <= 1; i++) { const a = a0 + i * Math.PI / 2; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
    const side = (x0, y0, x1, y1, nx, ny) => { for (let i = 1; i < N; i++) { const t = i / N, b = (i % 2 ? 0.035 : -0.01) + jit(0.02); pts.push([x0 + (x1 - x0) * t + nx * b, y0 + (y1 - y0) * t + ny * b]); } };
    const hx = d / 2 - r, hz = w / 2 - r;
    corner(hx, -hz, -Math.PI / 2); side(d / 2, -hz, d / 2, hz, 1, 0);
    corner(hx, hz, 0); side(hx, w / 2, -hx, w / 2, 0, 1);
    corner(-hx, hz, Math.PI / 2); side(-d / 2, hz, -d / 2, -hz, -1, 0);
    corner(-hx, -hz, Math.PI); side(-hx, -w / 2, hx, -w / 2, 0, -1);
    const sh = new THREE.Shape(pts.map((p) => new THREE.Vector2(p[0], p[1])));
    const geo = new THREE.ExtrudeGeometry(sh, { depth: ch - 0.08, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 1, curveSegments: 1 });
    geo.translate(0, 0, 0.04);
    const top = y + ch >= CTOP - 0.05;
    put('stone', top ? geo : dropDown(geo, true), T(-HX - cd(yc) / 2 + 0.05, y, CZ, 0, (k % 2 ? 0.04 : -0.04)).multiply(XM));
    y += ch;
  }
  const tw = cw(CTOP), td = cd(CTOP), tcx = -HX - td / 2 + 0.05;
  box('stone', td + 0.16, 0.16, tw + 0.16, tcx, CTOP + 0.08, CZ, 0, 0, 0, 0.05);
  box('iron', 0.26, 0.12, 0.26, tcx, CTOP + 0.22, CZ, 0, 0, 0, 0.02);
  for (const s of [-1, 1]) box('iron', 0.05, 0.38, 0.05, tcx + s * 0.18, CTOP + 0.35, CZ, 0, 0, 0, 0);
  box('iron', 0.5, 0.05, 0.42, tcx, CTOP + 0.56, CZ, 0, 0, 0.18, 0.01);

  // ---------- lower deck, stair, balcony ----------
  const DX0 = -0.3, DX1 = 2.6, DZ1 = ZF + 1.25;
  for (let x = DX0 + 0.13; x < DX1; x += 0.27) box('timber', 0.24, 0.07, DZ1 - ZF + 0.08, x, FY - 0.035, (DZ1 + ZF) / 2 + 0.02, 0, jit(0.015), 0, 0.012);
  box('wet', DX1 - DX0, 0.2, 0.16, (DX0 + DX1) / 2, FY - 0.17, DZ1 - 0.08, 0, 0, 0, 0.03);
  for (const x of [DX0 + 0.1, 1.1, DX1 - 0.1]) box('wet', 0.14, 0.2, DZ1 - ZF, x, FY - 0.17, (DZ1 + ZF) / 2, 0, 0, 0, 0.02);
  for (const x of [DX0 + 0.1, 1.05, DX1 - 0.1]) boxB('wet', 0.22, FY - 0.07, 0.22, x, 0, DZ1 - 0.1, jit(0.04), 0.03);
  beam('wet', [DX0 + 0.1, 0.3, DZ1 - 0.1], [1.05, FY - 0.3, DZ1 - 0.1], 0.14, 0.08, 0.02);
  beam('wet', [DX1 - 0.1, 0.3, DZ1 - 0.1], [1.05, FY - 0.3, DZ1 - 0.1], 0.14, 0.08, 0.02);
  // deck railing (right side and front right)
  const RLY = FY + 0.95;
  boxB('timber', 0.13, 1.0, 0.13, DX1 - 0.07, FY, ZF + 0.08, 0, 0.02);
  boxB('timber', 0.13, 1.0, 0.13, 1.05, FY, DZ1 - 0.07, 0, 0.02);
  box('timber', 0.1, 0.1, DZ1 - ZF, DX1 - 0.07, RLY, (DZ1 + ZF) / 2, 0, 0, 0, 0.02);
  box('timber', DX1 - 1.0, 0.1, 0.1, (DX1 + 1.0) / 2, RLY, DZ1 - 0.07, 0, 0, 0, 0.02);
  box('timber', 0.07, 0.07, DZ1 - ZF, DX1 - 0.07, FY + 0.48, (DZ1 + ZF) / 2, 0, 0, 0, 0);
  box('timber', DX1 - 1.0, 0.07, 0.07, (DX1 + 1.0) / 2, FY + 0.48, DZ1 - 0.07, 0, 0, 0, 0);
  // stair down to -X
  const NS = 8, RS = FY / NS, GS = 0.26, SZ0 = ZF + 0.28, SZ1 = DZ1 - 0.02;
  for (let i = 1; i < NS; i++) box('timber', 0.31, 0.06, SZ1 - SZ0 - 0.1, DX0 - (NS - i) * GS + GS / 2, i * RS - 0.03, (SZ0 + SZ1) / 2, 0, jit(0.02), 0, 0.012);
  {
    const pts = [[0, 0], [0.28, 0]]; // saw-tooth stringer in (x from bottom, y)
    for (let i = 1; i <= NS; i++) { pts.push([0.28 + (i - 1) * GS, i * RS - 0.06]); pts.push([0.28 + (i - 1) * GS + GS, i * RS - 0.06]); }
    pts.push([NS * GS + 0.12, FY - 0.32]);
    for (const z of [SZ0, SZ1]) K.extrude('wet', pts, 0.07, T(DX0 - NS * GS - 0.26 + 0.02, 0, z));
  }
  const HZ = SZ1 + 0.06;
  for (const [x, yb] of [[DX0 - NS * GS + 0.12, 0], [DX0 - NS * GS / 2, FY / 2 - 0.1]]) boxB('timber', 0.11, 1.0 + (yb ? 0.05 : 0.15), 0.11, x, yb, HZ, 0, 0.02);
  boxB('timber', 0.13, 1.0, 0.13, DX0 + 0.06, FY, HZ, 0, 0.02);
  beam('timber', [DX0 - NS * GS + 0.12, 1.05, HZ], [DX0 + 0.06, FY + 0.97, HZ], 0.1, 0.1, 0.02);
  // tall post from deck to balcony, rope wrapped
  const BY = 4.55;
  boxB('wet', 0.2, BY - FY - 0.15, 0.2, DX1 - 0.12, FY, DZ1 - 0.12, 0, 0.03);
  for (let i = 0; i < 4; i++) put('rope', new THREE.TorusGeometry(0.14, 0.035, 3, 8), T(DX1 - 0.12, 2.9 + i * 0.07, DZ1 - 0.12, Math.PI / 2, 0, 0));
  // balcony
  const BZ1 = ZF + 1.2;
  for (let x = DX0 + 0.13; x < DX1; x += 0.27) box('timber', 0.24, 0.07, BZ1 - ZF + 0.06, x, BY - 0.035, (BZ1 + ZF) / 2 + 0.03, 0, jit(0.015), 0, 0.012);
  for (const x of [DX0 + 0.1, 1.1, DX1 - 0.12]) box('timber', 0.15, 0.2, BZ1 - ZF + 0.05, x, BY - 0.17, (BZ1 + ZF) / 2, 0, 0, 0, 0.025);
  box('timber', DX1 - DX0, 0.2, 0.15, (DX0 + DX1) / 2, BY - 0.17, BZ1 - 0.08, 0, 0, 0, 0.025);
  for (const x of [DX0 + 0.1, 1.1]) { beam('timber', [x, BY - 1.05, ZF + 0.05], [x, BY - 0.25, BZ1 - 0.35], 0.14, 0.12, 0.025); box('timber', 0.16, 0.3, 0.1, x, BY - 1.05, ZF + 0.04, 0, 0, 0, 0.02); }
  const BRY = BY + 0.95;
  const railPosts = [[DX0 + 0.06, BZ1 - 0.06], [DX1 - 0.06, BZ1 - 0.06], [DX1 - 0.06, ZF + 0.06], [DX0 + 0.06, ZF + 0.06], [1.1, BZ1 - 0.06]];
  for (const [x, z] of railPosts) boxB('timber', 0.13, 1.02, 0.13, x, BY, z, 0, 0.02);
  box('timber', DX1 - DX0, 0.1, 0.12, (DX0 + DX1) / 2, BRY, BZ1 - 0.06, 0, 0, 0, 0.025);
  for (const x of [DX0 + 0.06, DX1 - 0.06]) box('timber', 0.12, 0.1, BZ1 - ZF, x, BRY, (BZ1 + ZF) / 2, 0, 0, 0, 0.025);
  for (let x = DX0 + 0.35; x < DX1 - 0.2; x += 0.3) box('timber', 0.06, 0.82, 0.06, x, BY + 0.43, BZ1 - 0.06, 0, 0, 0, 0);
  for (const x of [DX0 + 0.06, DX1 - 0.06]) for (let z = ZF + 0.35; z < BZ1 - 0.2; z += 0.3) box('timber', 0.06, 0.82, 0.06, x, BY + 0.43, z, 0, 0, 0, 0);
  // props: barrels, rope coils, a lantern
  function barrel(x, y, z, h = 0.82) {
    K.lathe('timber', [[0, 0], [0.27, 0], [0.32, h * 0.25], [0.34, h * 0.5], [0.32, h * 0.75], [0.27, h], [0, h]], 10, T(x, y, z));
    for (const t of [0.2, 0.8]) put('iron', new THREE.TorusGeometry(0.315, 0.025, 3, 10), T(x, y + h * t, z, Math.PI / 2, 0, 0));
  }
  barrel(1.75, FY, DZ1 - 0.45); barrel(2.25, FY, ZF + 0.45); barrel(2.15, BY, ZF + 0.42, 0.7);
  put('rope', new THREE.TorusGeometry(0.24, 0.05, 4, 12), T(1.32, FY + 1.1, ZF + 0.06));
  put('rope', new THREE.TorusGeometry(0.16, 0.045, 4, 10), T(1.32, FY + 1.1, ZF + 0.08));
  put('rope', new THREE.TorusGeometry(0.22, 0.06, 4, 12), T(0.0, BY + 0.06, BZ1 - 0.4, Math.PI / 2, 0, 0));
  cyl('iron', 0.09, 0.11, 0.06, 6, DX1 - 0.06, BRY + 0.08, BZ1 - 0.06);
  cyl('window', 0.08, 0.08, 0.2, 6, DX1 - 0.06, BRY + 0.21, BZ1 - 0.06);
  put('iron', new THREE.ConeGeometry(0.12, 0.14, 6), T(DX1 - 0.06, BRY + 0.38, BZ1 - 0.06));
  // ground rocks around the piers
  for (const [x, z, s] of [[-1.5, ZF + 0.35, 0.32], [0.55, ZF - 0.1, 0.24], [-2.9, -0.2, 0.3], [1.4, ZB + 0.1, 0.26]])
    put('stone', new THREE.DodecahedronGeometry(s, 0), T(x, s * 0.45, z, jit(0.5), rnd() * 3, jit(0.5), 1, 0.7, 1));

  K.finish(g);
  return recentre(THREE, g);
}
