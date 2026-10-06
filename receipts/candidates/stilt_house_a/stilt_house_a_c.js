// stilt_house_a C: different reading. Round log stilts with log X-braces on rough stacked stone pads,
// solid plaster masses with deep projecting window/door casings, jettied plank gables, and a storybook
// SAGGING ridge: every tile row and the roof slab follow a sag curve. Front deck only, as the ref.
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
  const K = makeKit(THREE, 57);
  const { boxB, frame, T, put, jit } = K;
  // thin parts (< 9 cm) get plain boxes: a 1.5 cm chamfer on a slat is invisible and costs 32 tris
  const box = (k, w, h, d, x, y, z, rx = 0, ry = 0, rz = 0, c = 0.03) => K.box(k, w, h, d, x, y, z, rx, ry, rz, Math.min(w, h, d) < 0.135 ? 0 : c);
  const beam = (k, a, b, w, d, c = 0.03) => K.beam(k, a, b, w, d, Math.min(w, d) < 0.135 ? 0 : c);
  const HX = 2.3, HZ = 2.2, FL = 2.55, TOP = 5.0, PT = 1.25, OV = 0.6, OZ = 0.6;
  const PC = 1 / Math.hypot(1, PT); // cos of pitch
  const R = TOP + 0.12 + 0.12 / PC + HX * PT;

  // ---------- helpers ----------
  // C: plaster walls are solid slabs set back 0.12; casings project in front so openings read deep
  function solid(key, x0, x1, y0, y1, t, holes) {
    box(key, x1 - x0, y1 - y0, t, (x0 + x1) / 2, (y0 + y1) / 2, -0.12 - t / 2, 0, 0, 0, 0);
    for (const h of holes) {
      const w = h.x1 - h.x0, cx = (h.x0 + h.x1) / 2;
      box('timber', 0.12, h.y1 - h.y0, 0.24, h.x0 - 0.06, (h.y0 + h.y1) / 2, 0.0, 0, 0, 0, 0.02);
      box('timber', 0.12, h.y1 - h.y0, 0.24, h.x1 + 0.06, (h.y0 + h.y1) / 2, 0.0, 0, 0, 0, 0.02);
      box('wet', w, h.y1 - h.y0, 0.04, cx, (h.y0 + h.y1) / 2, -0.1, 0, 0, 0, 0);
    }
  }
  function wallHoles(key, x0, x1, y0, y1, t, holes, z = 0) {
    const xs = [x0, x1]; holes.forEach((h) => xs.push(h.x0, h.x1));
    const u = [...new Set(xs)].filter((x) => x >= x0 && x <= x1).sort((a, b) => a - b);
    for (let i = 0; i < u.length - 1; i++) {
      const a = u[i], b = u[i + 1]; if (b - a < 0.005) continue;
      const hs = holes.filter((h) => h.x0 <= a + 1e-6 && h.x1 >= b - 1e-6).sort((p, q) => p.y0 - q.y0);
      let y = y0;
      for (const h of hs) { if (h.y0 > y + 0.005) box(key, b - a, h.y0 - y, t, (a + b) / 2, (y + h.y0) / 2, z - t / 2, 0, 0, 0, 0); y = Math.max(y, h.y1); }
      if (y1 > y + 0.005) box(key, b - a, y1 - y, t, (a + b) / 2, (y + y1) / 2, z - t / 2, 0, 0, 0, 0);
    }
  }
  // window in local wall frame (face z=0, wall t deep). shut: 'closed' | 'open' | 'one'
  function win(cx, y0, w, h, t, shut) {
    const fz = 0.03;
    box('timber', w + 0.26, 0.13, 0.16, cx, y0 + h + 0.065, fz, 0, 0, 0, 0.025);
    box('timber', w + 0.32, 0.09, 0.24, cx, y0 - 0.045, fz + 0.04, 0, 0, 0, 0.025);
    box('timber', 0.11, h, 0.14, cx - w / 2 - 0.055, y0 + h / 2, fz, 0, 0, 0, 0.02);
    box('timber', 0.11, h, 0.14, cx + w / 2 + 0.055, y0 + h / 2, fz, 0, 0, 0, 0.02);
    box('wet', w + 0.02, h + 0.02, 0.04, cx, y0 + h / 2, -t + 0.05, 0, 0, 0, 0);
    if (shut !== 'closed') {
      box('window', w, h, 0.03, cx, y0 + h / 2, -t + 0.08, 0, 0, 0, 0);
      box('timber', 0.05, h, 0.06, cx, y0 + h / 2, -t + 0.11, 0, 0, 0, 0);
      box('timber', w, 0.05, 0.06, cx, y0 + h * 0.5, -t + 0.11, 0, 0, 0, 0);
    }
    const leaf = (x, ww, z, ry) => {
      const n = 3, bw = ww / n;
      for (let i = 0; i < n; i++) box('drift', bw - 0.015, h - 0.04, 0.05, x - ww / 2 + bw * (i + 0.5), y0 + h / 2, z, 0, ry, 0, 0.012);
      box('drift', ww - 0.04, 0.07, 0.04, x, y0 + h * 0.22, z + 0.045, 0, ry, 0, 0.01);
      box('drift', ww - 0.04, 0.07, 0.04, x, y0 + h * 0.78, z + 0.045, 0, ry, 0, 0.01);
    };
    if (shut === 'closed') { leaf(cx - w / 4, w / 2, -0.06, 0); leaf(cx + w / 4, w / 2, -0.06, 0); }
    else if (shut === 'open') { leaf(cx - w / 2 - 0.12 - w / 4, w / 2, 0.06, 0); leaf(cx + w / 2 + 0.12 + w / 4, w / 2, 0.06, 0); }
    else if (shut === 'one') { leaf(cx - w / 2 - 0.12 - w / 4, w / 2, 0.06, 0); }
  }
  function door(cx, y0, w, h, t) {
    box('timber', w + 0.32, 0.16, 0.18, cx, y0 + h + 0.08, 0.04, 0, 0, 0, 0.03);
    box('timber', 0.13, h, 0.16, cx - w / 2 - 0.065, y0 + h / 2, 0.03, 0, 0, 0, 0.025);
    box('timber', 0.13, h, 0.16, cx + w / 2 + 0.065, y0 + h / 2, 0.03, 0, 0, 0, 0.025);
    const n = 4, bw = w / n;
    for (let i = 0; i < n; i++) box('timber', bw - 0.02, h - 0.02, 0.06, cx - w / 2 + bw * (i + 0.5), y0 + h / 2, -t + 0.1, 0, 0, 0, 0.012);
    for (const yy of [0.25, 0.8]) box('iron', w * 0.8, 0.07, 0.03, cx - w * 0.08, y0 + h * yy, -t + 0.145, 0, 0, 0, 0);
    K.cyl('iron', 0.035, 0.035, 0.05, 6, cx + w * 0.32, y0 + h * 0.5, -t + 0.15, Math.PI / 2, 0, 0);
  }
  // gable planks: x0..x1 under the roof line ytop(x); holes cut out
  function gablePlanks(y0, holes, t) {
    const ytop = (x) => R - Math.abs(x) * PT - 0.14 / PC;
    const pw = 0.29;
    for (let x = -HX + pw / 2; x < HX; x += pw) {
      const yt = Math.min(ytop(x - pw / 2), ytop(x + pw / 2)) + 0.12;
      if (yt <= y0 + 0.1) continue;
      const hs = holes.filter((h) => x + pw / 2 > h.x0 && x - pw / 2 < h.x1);
      let y = y0;
      const segs = [];
      for (const h of hs.sort((p, q) => p.y0 - q.y0)) { if (h.y0 > y) segs.push([y, h.y0]); y = h.y1; }
      if (yt > y) segs.push([y, yt]);
      for (const [a, b] of segs) box('timber', pw - 0.03, b - a, 0.06, x + jit(0.005), (a + b) / 2, 0.03 + jit(0.008), 0, 0, jit(0.006), 0.015);
    }
    // backing so the seams read dark
    const sh = new THREE.Shape([new THREE.Vector2(-HX, y0), new THREE.Vector2(HX, y0), new THREE.Vector2(0, ytop(0))]);
    holes.forEach((h) => sh.holes.push(new THREE.Path([new THREE.Vector2(h.x0, h.y0), new THREE.Vector2(h.x0, h.y1), new THREE.Vector2(h.x1, h.y1), new THREE.Vector2(h.x1, h.y0)])));
    const geo = new THREE.ExtrudeGeometry(sh, { depth: t, bevelEnabled: false, curveSegments: 1 });
    put('wet', geo, T(0, 0, -t));
    // centre post + base beam
    box('timber', 0.24, ytop(0) - y0, 0.14, 0, (y0 + ytop(0)) / 2, 0.06, 0, 0, 0, 0.03);
  }
  // tiles in local slope frame: x 0..W, z 0..L (down slope), y normal
  let SAG = 0, SAGW = 1;
  const sagAt = (x) => { const t = x / SAGW * 2 - 1; return -SAG * (1 - t * t); };
  function tileField(W, L, tw, tl, lap, th, lift) {
    const step = tl * lap; const rows = Math.floor((L - tl) / step) + 1;
    for (let r = rows - 1; r >= 0; r--) {
      const zc = L - tl / 2 - r * step;
      const off = (r % 2) * tw * 0.5; const n = Math.ceil((W + tw) / tw);
      for (let i = 0; i < n; i++) {
        let x0 = -tw / 2 + off + i * tw, x1 = x0 + tw * 0.93; x0 = Math.max(x0, 0); x1 = Math.min(x1, W);
        if (x1 - x0 < 0.1) continue;
        box('tile', x1 - x0, th, tl, (x0 + x1) / 2 + jit(0.012), th / 2 + lift * 0.45 + jit(0.01) + sagAt((x0 + x1) / 2), zc, -Math.atan2(lift, tl) + jit(0.035), jit(0.05), jit(0.04), 0);
      }
    }
  }
  // a gabled roof, ridge along local Z at height ry, slopes +-x down to x=+-run at 45deg
  function gableRoof(ry, run, z0, z1, opts = {}) {
    SAG = opts.sag || 0;
    const pt = opts.pitch || 1, c = 1 / Math.hypot(1, pt), sn = pt * c, L = run / c, W = z1 - z0;
    for (const sx of [1, -1]) {
      const ez = new THREE.Vector3(sx * c, -sn, 0), ex = new THREE.Vector3(0, 0, -sx), ey = new THREE.Vector3().crossVectors(ez, ex);
      const m = new THREE.Matrix4().makeBasis(ex, ey, ez).setPosition(0, ry, sx > 0 ? z1 : z0);
      frame(m, () => {
        SAGW = W; const nseg = opts.sag ? 6 : 1;
        for (let i = 0; i < nseg; i++) { const xa = W * i / nseg, xb = W * (i + 1) / nseg; box('timber', xb - xa + 0.02, 0.12, L, (xa + xb) / 2, -0.06 + sagAt((xa + xb) / 2), L / 2, 0, 0, 0, 0); }
        tileField(W, L - 0.02, opts.tw || 0.56, opts.tl || 0.58, 0.62, 0.06, 0.1);
        // barge boards both ends
        box('timber', 0.14, 0.32, L + 0.05, -0.05, 0.02, L / 2, 0, 0, 0, 0.03);
        box('timber', 0.14, 0.32, L + 0.05, W + 0.05, 0.02, L / 2, 0, 0, 0, 0.03);
        // rafter tails under the eave
        if (opts.rafters) for (let x = 0.3; x < W - 0.2; x += 0.62) box('timber', 0.13, 0.16, 0.9, x, -0.2 + sagAt(x), L - 0.45, 0, 0, 0, 0.025);
        // little brackets under the barge boards (the ref's rafter ends along the gable)
        if (opts.brackets) for (let zz = 0.5; zz < L - 0.2; zz += 0.6) { box('timber', 0.1, 0.12, 0.16, 0.12, -0.16, zz, 0, 0, 0, 0.015); box('timber', 0.1, 0.12, 0.16, W - 0.12, -0.16, zz, 0, 0, 0, 0.015); }
      });
    }
    // ridge cap
    if (SAG) { const n = 6; for (let i = 0; i < n; i++) { const za = z0 - 0.12 + (z1 - z0 + 0.24) * i / n, zb = z0 - 0.12 + (z1 - z0 + 0.24) * (i + 1) / n; const sg = (z) => { const t = (z - z0) / (z1 - z0) * 2 - 1; return -SAG * 1.25 * Math.max(0, 1 - t * t); }; beam('timber', [0, ry + 0.12 + sg(za), za], [0, ry + 0.12 + sg(zb), zb], 0.3, 0.26, 0.04); } }
    else beam('timber', [0, ry + 0.12, z0 - 0.12], [0, ry + 0.12, z1 + 0.12], 0.3, 0.26, 0.04);
    if (opts.ridgeEnds) { box('timber', 0.36, 0.36, 0.3, 0, ry + 0.14, z1 + 0.18, 0, 0, 0, 0.05); box('timber', 0.36, 0.36, 0.3, 0, ry + 0.14, z0 - 0.18, 0, 0, 0, 0.05); }
  }

  // ---------- log stilts on stacked stone pads ----------
  const posts = [];
  for (const x of [-2.1, 0, 2.1]) for (const z of [-2.0, 0, 2.0]) if (!(x === 0 && z === 0)) posts.push([x, z]);
  const deckPosts = [[-0.95, 3.45], [1.05, 3.45], [2.95, 3.45], [2.95, 2.35]];
  const logs = (a, b, r) => K.log('timber', a, b, r, 7);
  for (const [x, z] of posts.concat(deckPosts)) {
    boxB('stone', 0.62, 0.18, 0.58, x + jit(0.04), 0, z + jit(0.04), jit(0.4), 0.05);
    boxB('stone', 0.46, 0.16, 0.44, x, 0.18, z, jit(0.4), 0);
    logs([x + jit(0.03), 0.3, z + jit(0.03)], [x, FL - 0.25, z], 0.16 + jit(0.015));
  }
  const brace = (a, b) => K.log('timber', a, b, 0.075, 6);
  for (const z of [-2.0]) for (const [xa, xb] of [[-2.1, 0], [0, 2.1]]) { brace([xa, 0.45, z - 0.17], [xb, 2.15, z - 0.17]); brace([xb, 0.45, z - 0.17], [xa, 2.15, z - 0.17]); }
  for (const x of [-2.1, 2.1]) for (const [za, zb] of [[-2.0, 0], [0, 2.0]]) { brace([x + 0.17 * Math.sign(x), 0.45, za], [x + 0.17 * Math.sign(x), 2.15, zb]); brace([x + 0.17 * Math.sign(x), 0.45, zb], [x + 0.17 * Math.sign(x), 2.15, za]); }
  for (const [xa, xb] of [[-2.1, 0], [0, 2.1]]) { brace([xa, 0.6, 2.17], [(xa + xb) / 2, 2.2, 2.17]); brace([xb, 0.6, 2.17], [(xa + xb) / 2, 2.2, 2.17]); }
  brace([1.05, 1.0, 3.45], [1.05, 2.25, 2.4]); brace([2.95, 1.0, 3.45], [2.95, 2.25, 2.4]); brace([-0.95, 1.0, 3.45], [-0.95, 2.25, 2.4]);
  // floor platform: rim beams + joist ends
  box('timber', 2 * HX + 0.3, 0.3, 2 * HZ + 0.3, 0, FL - 0.15, 0, 0, 0, 0, 0.05);
  for (let z = -1.8; z <= 1.81; z += 0.6) for (const sx of [-1, 1]) box('timber', 0.3, 0.18, 0.16, sx * (HX + 0.25), FL - 0.2, z, 0, 0, 0, 0.03);

  // ---------- deck ----------
  const dz0 = HZ + 0.15, dz1 = 3.6, dx0 = -1.15, dx1 = 3.15, DT = FL;
  box('timber', dx1 - dx0, 0.24, 0.2, (dx0 + dx1) / 2, DT - 0.2, dz1 - 0.1, 0, 0, 0, 0.04);
  box('timber', 0.2, 0.24, dz1 - dz0 + 0.3, dx1 - 0.1, DT - 0.2, (dz0 + dz1) / 2 - 0.15, 0, 0, 0, 0.04);
  box('timber', 0.2, 0.24, dz1 - dz0, dx0 + 0.1, DT - 0.2, (dz0 + dz1) / 2, 0, 0, 0, 0.04);
  for (let x = dx0 + 0.12; x < dx1 - 0.05; x += 0.24) box(K.rnd() < 0.3 ? 'drift' : 'timber', 0.21, 0.07, dz1 - dz0 + 0.12 + jit(0.06), x, DT - 0.035, (dz0 + dz1) / 2 + 0.02, 0, jit(0.01), 0, 0);
  boxB('timber', 0.28, DT - 0.55, 0.28, dx1 - 0.15, 0.3, dz0 + 0.1, 0, 0.04);
  // railing: front right part and right side
  const rail = (a, b, n) => {
    for (let i = 0; i <= n; i++) { const t = i / n; boxB('drift', 0.12, 1.05, 0.12, a[0] + (b[0] - a[0]) * t, DT, a[1] + (b[1] - a[1]) * t, 0, 0.02); }
    beam('drift', [a[0], DT + 1.0, a[1]], [b[0], DT + 1.0, b[1]], 0.12, 0.14, 0.025);
    beam('drift', [a[0], DT + 0.55, a[1]], [b[0], DT + 0.55, b[1]], 0.08, 0.08, 0.015);
  };
  frame(T(), () => {
    const railZ = dz1 - 0.08;
    rail([0.25, railZ], [dx1 - 0.08, railZ], 5);
    rail([dx1 - 0.08, railZ], [dx1 - 0.08, dz0 + 0.05], 2);
  });
  beam('drift', [0.25, DT + 1.0, dz1 - 0.08], [0.25, DT + 1.0, dz1 - 0.08 + 0.001], 0.1, 0.1);
  // ladder from deck front edge down to the ground
  const lx = -0.4, ltz = dz1 + 0.05, lbz = dz1 + 1.0;
  for (const sx of [-0.3, 0.3]) beam('timber', [lx + sx, 0, lbz], [lx + sx, DT + 0.25, ltz], 0.09, 0.15, 0.02);
  for (let i = 1; i <= 8; i++) { const t = i / 9.2; box('timber', 0.62, 0.07, 0.11, lx, t * (DT + 0.25), lbz + (ltz - lbz) * t, 0, 0, 0, 0.012); }

  // ---------- ground storey walls (ochre infill, timber frame) ----------
  const WT = 0.12; // C: inner faces sit on the set-back plaster plane
  // front
  frame(T(0, 0, HZ), () => {
    const holes = [{ x0: -1.25, x1: -0.3, y0: FL, y1: FL + 2.0 }, { x0: 0.25, x1: 0.95, y0: FL + 0.95, y1: FL + 1.95 }, { x0: 1.35, x1: 2.05, y0: FL + 0.95, y1: FL + 1.95 }];
    solid('ochre', -HX, HX, FL, TOP, WT, holes);
    door(-0.775, FL, 0.95, 2.0, WT);
    win(0.6, FL + 0.95, 0.7, 1.0, WT, 'closed'); win(1.7, FL + 0.95, 0.7, 1.0, WT, 'closed');
    for (const x of [-1.85, 0.0, 1.15]) box('timber', 0.2, TOP - FL, 0.1, x, (FL + TOP) / 2, 0.05, 0, 0, 0, 0.025);
    box('timber', 0.95, 0.14, 0.09, -1.85 + 0.0, FL + 0.8, 0.05, 0, 0, 0, 0.02);
    box('timber', 2 * HX + 0.36, 0.28, 0.3, 0, TOP - 0.02, 0.1, 0, 0, 0, 0.05);
  });
  // back
  frame(T(0, 0, -HZ, 0, Math.PI, 0), () => {
    const holes = [{ x0: -0.4, x1: 0.4, y0: FL + 0.95, y1: FL + 1.95 }];
    solid('ochre', -HX, HX, FL, TOP, WT, holes);
    win(0, FL + 0.95, 0.8, 1.0, WT, 'open');
    for (const x of [-1.15, 1.15]) box('timber', 0.2, TOP - FL, 0.1, x, (FL + TOP) / 2, 0.05, 0, 0, 0, 0.025);
    for (const s of [-1, 1]) { beam('timber', [s * 1.15, FL + 0.1, 0.05], [s * 2.15, TOP - 0.15, 0.05], 0.16, 0.08, 0.02); }
    box('timber', 2 * HX + 0.36, 0.28, 0.3, 0, TOP - 0.02, 0.1, 0, 0, 0, 0.05);
    box('timber', 2 * HX, 0.14, 0.09, 0, FL + 0.85, 0.05, 0, 0, 0, 0.02);
  });
  // left side: half-timber X braces (as ref)
  frame(T(-HX, 0, 0, 0, -Math.PI / 2, 0), () => {
    const holes = [{ x0: 0.75, x1: 1.45, y0: FL + 0.95, y1: FL + 1.95 }];
    solid('ochre', -HZ, HZ, FL, TOP, WT, holes);
    win(1.1, FL + 0.95, 0.7, 1.0, WT, 'open');
    for (const x of [-0.75, 0.45]) box('timber', 0.2, TOP - FL, 0.1, x, (FL + TOP) / 2, 0.05, 0, 0, 0, 0.025);
    box('timber', 2 * HZ, 0.14, 0.09, 0, FL + 0.85, 0.06, 0, 0, 0, 0.02);
    for (const [a, b] of [[-2.1, -0.75], [-0.75, 0.45]]) { beam('timber', [a + 0.1, FL + 0.1, 0.07], [b - 0.1, TOP - 0.15, 0.07], 0.16, 0.08, 0.02); beam('timber', [b - 0.1, FL + 0.1, 0.07], [a + 0.1, TOP - 0.15, 0.07], 0.16, 0.08, 0.02); }
  });
  // right side
  frame(T(HX, 0, 0, 0, Math.PI / 2, 0), () => {
    const holes = [{ x0: -0.5, x1: 0.5, y0: FL, y1: FL + 2.0 }, { x0: 1.0, x1: 1.7, y0: FL + 0.95, y1: FL + 1.95 }];
    solid('ochre', -HZ, HZ, FL, TOP, WT, holes);
    door(0, FL, 0.95, 2.0, WT);
    win(1.35, FL + 0.95, 0.7, 1.0, WT, 'closed');
    for (const x of [-1.3, 0.75]) box('timber', 0.2, TOP - FL, 0.1, x, (FL + TOP) / 2, 0.05, 0, 0, 0, 0.025);
    beam('timber', [-2.1, FL + 0.1, 0.07], [-1.4, TOP - 0.15, 0.07], 0.16, 0.08, 0.02);
  });
  // corner posts
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) boxB('timber', 0.28, TOP - FL + 0.1, 0.28, sx * (HX + 0.02), FL - 0.02, sz * (HZ + 0.02), 0, 0.04);
  // eave plates on the sides
  for (const sx of [-1, 1]) box('timber', 0.3, 0.24, 2 * HZ + 0.3, sx * (HX + 0.03), TOP - 0.2, 0, 0, 0, 0, 0.05);

  // ---------- gables (planked) ----------
  const gh = [{ x0: -1.15, x1: -0.5, y0: 5.55, y1: 6.25 }, { x0: 0.5, x1: 1.15, y0: 5.55, y1: 6.25 }];
  frame(T(0, 0, HZ + 0.16), () => {
    gablePlanks(TOP + 0.12, gh, 0.2);
    win(-0.825, 5.55, 0.65, 0.7, 0.2, 'one'); win(0.825, 5.55, 0.65, 0.7, 0.2, 'one');
  });
  frame(T(0, 0, -HZ - 0.16, 0, Math.PI, 0), () => {
    const bh = [{ x0: -0.35, x1: 0.35, y0: 5.6, y1: 6.4 }];
    gablePlanks(TOP + 0.12, bh, 0.2);
    win(0, 5.6, 0.7, 0.8, 0.2, 'open');
  });

  // ---------- roof ----------
  gableRoof(R, HX + OV, -HZ - OZ, HZ + OZ, { pitch: PT, rafters: true, brackets: true, ridgeEnds: true, sag: 0.16 });
  // dormer on the left slope, window facing -X
  frame(T(-2.0, 0, -0.6, 0, -Math.PI / 2, 0), () => {
    // local: x along world z, z outward (-X). front face at z=0
    const dw = 1.2, dy0 = 5.45, dy1 = 6.35;
    for (const s of [-1, 1]) box('timber', 0.12, dy1 - dy0 + 0.3, 1.6, s * dw / 2, (dy0 + dy1) / 2 + 0.1, -0.8, 0, 0, 0, 0.02);
    wallHoles('timber', -dw / 2, dw / 2, dy0, dy1, 0.12, [{ x0: -0.25, x1: 0.25, y0: dy0 + 0.15, y1: dy1 - 0.15 }]);
    win(0, dy0 + 0.15, 0.5, dy1 - dy0 - 0.3, 0.12, 'none');
    frame(T(0, 0, 0.0, 0, 0, 0), () => {
      // tiny gable roof: ridge along local z
      const run = dw / 2 + 0.25;
      frame(new THREE.Matrix4(), () => gableRoof(dy1 + run - 0.08, run, -1.6, 0.3, { tw: 0.36, tl: 0.42, sag: 0.0 }));
    });
    // dormer gable infill
    const sh = new THREE.Shape([new THREE.Vector2(-dw / 2, dy1), new THREE.Vector2(dw / 2, dy1), new THREE.Vector2(0, dy1 + dw / 2)]);
    put('timber', new THREE.ExtrudeGeometry(sh, { depth: 0.1, bevelEnabled: false }), T(0, 0, -0.1));
  });
  // chimney (stone) at back right
  const cx = 1.0, cz = -1.5;
  boxB('stone', 0.62, 2.1, 0.62, cx, 6.25, cz, 0, 0.05);
  boxB('stone', 0.76, 0.14, 0.76, cx, 8.25, cz, 0, 0.03);
  boxB('stone', 0.5, 0.1, 0.5, cx, 8.39, cz, 0, 0.02);
  for (let y = 6.6; y < 8.2; y += 0.35) box('stone', 0.66, 0.05, 0.66, cx, y, cz, 0, 0, 0, 0);

  K.finish(g);
  return recentre(THREE, g);
}
