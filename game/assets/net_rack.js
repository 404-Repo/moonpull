// net_rack B: profiles. Legs are an extruded hewn (irregular octagon) section swept along each leg, top
// bar a lathed pole with tapered ends. Net = flat cord ribbons laid in a draped surface (custom geometry,
// DoubleSide), folded over the bar: two separate nets, each with a long front fall and a short back fall.
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
// ---- C1 extras (inlined; no imports) ----
function addMat(K, key, color, rough, name, extra) {
  const m = new K.THREE.MeshStandardMaterial(Object.assign({ color, roughness: rough, metalness: 0 }, extra || {}));
  if (name) m.name = name; K.mats[key] = m; return m;
}
// tube along a smooth curve through points
function tube(K, key, pts, r, radial = 5, segs = 0) {
  const THREE = K.THREE;
  const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
  const n = segs || Math.max(4, Math.round(curve.getLength() / 0.12));
  K.put(key, new THREE.TubeGeometry(curve, n, r, radial, false));
}
// polyline of straight cylinders (cheap rope / strand)
function strand(K, key, pts, r, radial = 4) {
  for (let i = 0; i < pts.length - 1; i++) K.beam(key, pts[i], pts[i + 1], 0, 0, 0, 0, (L) => new K.THREE.CylinderGeometry(r, r, L + r * 0.6, radial, 1, true));
}
// catenary-ish sag between a and b, n points
function sag(a, b, d, n) {
  const out = [];
  for (let i = 0; i <= n; i++) { const t = i / n; out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - d * 4 * t * (1 - t), a[2] + (b[2] - a[2]) * t]); }
  return out;
}
// ---- end extras ----
export default function (THREE) {
  const g = new THREE.Group();
  const K = makeKit(THREE, 23);
  const { box, beam, put, T, jit, rnd } = K;
  addMat(K, 'net', 0xa58a5c, 0.95, 'fabric', { side: THREE.DoubleSide });
  addMat(K, 'netd', 0x7f6844, 0.95, 'fabric', { side: THREE.DoubleSide });
  addMat(K, 'cork', 0x9a5a32, 0.8, 'timber');
  addMat(K, 'fish', 0x8a9aa2, 0.5, null);
  const hewn = (w, d) => { const a = w / 2, b = d / 2, c = Math.min(a, b) * 0.35; return new THREE.Shape([[-a + c, -b], [a - c, -b], [a, -b + c], [a, b - c], [a - c, b], [-a + c, b], [-a, b - c], [-a, -b + c]].map((p) => new THREE.Vector2(p[0] + jit(0.006), p[1] + jit(0.006)))); };
  const sweep = (key, a, b, w, d) => beam(key, a, b, 0, 0, 0, 0, (L) => { const geo = new THREE.ExtrudeGeometry(hewn(w, d), { depth: L, bevelEnabled: false }); geo.translate(0, 0, -L / 2); geo.rotateX(-Math.PI / 2); return geo; });
  const FX = 1.45;
  for (const sx of [-1, 1]) {
    const x = sx * FX;
    sweep('timber', [x - 0.075, 0, -0.62], [x - 0.075, 1.86, 0.12], 0.15, 0.13);
    sweep('timber', [x + 0.075, 0, 0.62], [x + 0.075, 1.86, -0.12], 0.15, 0.13);
    sweep('drift', [x + sx * 0.18, 0.5, -0.55], [x + sx * 0.18, 0.6, 0.55], 0.07, 0.17);
    sweep('drift', [x - sx * 0.155, 1.15, -0.32], [x - sx * 0.155, 1.18, 0.32], 0.06, 0.14);
    for (const z of [-0.4, 0.4]) K.cyl('iron', 0.025, 0.025, 0.04, 6, x + sx * 0.23, 0.55 + z * 0.09, z, 0, 0, Math.PI / 2);
  }
  K.lathe('timber', [[0, -1.76], [0.06, -1.76], [0.085, -1.66], [0.09, 0], [0.085, 1.66], [0.06, 1.76], [0, 1.76]], 8, T(0, 1.665, 0, 0, 0, Math.PI / 2));
  sweep('timber', [-1.4, 0.48, -0.47], [1.4, 0.5, -0.47], 0.1, 0.13);
  // ribbon net builder over a surface P(u,v)
  function net(key, P, NU, NV, w) {
    const pos = [];
    const add = (pa, pb) => {
      const A = new THREE.Vector3(...pa), B = new THREE.Vector3(...pb);
      const d = B.clone().sub(A); const n = new THREE.Vector3(0, 0, 1);
      const s = d.clone().cross(n).normalize().multiplyScalar(w / 2);
      const a0 = A.clone().sub(s), a1 = A.clone().add(s), b0 = B.clone().sub(s), b1 = B.clone().add(s);
      pos.push(...a0.toArray(), ...b0.toArray(), ...b1.toArray(), ...a0.toArray(), ...b1.toArray(), ...a1.toArray());
    };
    for (let i = 0; i < NU; i++) for (let j = 0; j < NV; j++) {
      // diamond cell: centre-of-edge points
      const pl = P(i / NU, (j + 0.5) / NV), pr = P((i + 1) / NU, (j + 0.5) / NV), pt = P((i + 0.5) / NU, j / NV), pb = P((i + 0.5) / NU, (j + 1) / NV);
      add(pl, pt); add(pt, pr); add(pr, pb); add(pb, pl);
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.computeVertexNormals();
    put(key, geo);
  }
  const corkGeo = new THREE.LatheGeometry([[0, -0.05], [0.042, -0.03], [0.042, 0.03], [0, 0.05]].map((p) => new THREE.Vector2(p[0], p[1])), 6);
  function fall(key, x0, x1, top, len, zc, side, wav, hemCork) {
    const P = (u, v) => {
      const x = x0 + (x1 - x0) * u + 0.05 * Math.sin(v * 4 + u * 11) * v;
      const L = len(u);
      return [x, top(u) - L * v, zc + side * (0.02 + 0.09 * v * v + wav * Math.sin(u * 19 + 1) * v)];
    };
    const NU = Math.max(3, Math.round((x1 - x0) / 0.19)), NV = 6;
    net(key, P, NU, NV, 0.03);
    const hem = []; for (let i = 0; i <= NU; i++) hem.push(P(i / NU, 1));
    strand(K, "rope", hem, 0.016, 3);
    if (hemCork) for (let i = 0; i <= NU; i += 2) { const p = P(i / NU, 1); put('cork', corkGeo, T(p[0], p[1] - 0.03, p[2] + side * 0.02)); }
    return P;
  }
  // left net: long front fall, mid swag on its right edge
  const PL = fall('net', -1.2, -0.05, (u) => 1.62 - 0.35 * Math.max(0, u - 0.7) / 0.3, (u) => 1.1 - 0.25 * u + 0.08 * Math.sin(u * 8), 0.1, 1, 0.07, true);
  fall('net', -1.2, -0.35, () => 1.66, (u) => 0.35 + 0.06 * Math.sin(u * 9), -0.1, -1, 0.03, false);
  // right net: hangs from the right, its left part a sagging swag
  const PR = fall('netd', -0.15, 1.25, (u) => 1.62 - 0.6 * Math.max(0, 1 - u / 0.4) ** 2, (u) => 0.55 + 0.6 * Math.min(1, u / 0.45) + 0.05 * Math.sin(u * 10), 0.13, 1, 0.08, true);
  fall('netd', 0.45, 1.25, () => 1.66, (u) => 0.45 + 0.05 * Math.sin(u * 7), -0.1, -1, 0.03, true);
  for (const P of [PL, PR]) for (const v of [0.35, 0.7]) for (const u of [0, 1]) { const p = P(u, v); put('cork', corkGeo, T(p[0], p[1], p[2] + 0.02)); }
  // basket with fish + coiled rope
  K.lathe('rope', [[0.0, 0], [0.2, 0.0], [0.26, 0.08], [0.28, 0.24], [0.3, 0.26], [0.27, 0.26], [0.25, 0.1], [0, 0.04]], 10, T(0.4, 0, 0.6));
  for (const y of [0.09, 0.17]) put('timber', new THREE.TorusGeometry(0.275, 0.015, 3, 12), T(0.4, y, 0.6, Math.PI / 2));
  for (let i = 0; i < 6; i++) put('fish', new THREE.SphereGeometry(0.05, 5, 3), T(0.4 + jit(0.13), 0.27 + rnd() * 0.06, 0.6 + jit(0.12), jit(0.6), rnd() * 3, 0.7 + jit(0.3), 1, 3.2, 1));
  put('rope', new THREE.TorusGeometry(0.16, 0.025, 4, 12), T(0.82, 0.03, 0.66, Math.PI / 2));
  K.finish(g);
  return recentre(THREE, g);
}
