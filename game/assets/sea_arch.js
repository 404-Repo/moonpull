// sea_arch, candidate B: profiles. Each stratum is its own plan outline (a jittered rounded
// superellipse) extruded up by its thickness with a chunky bevel, so every layer is a soft
// pillow of stone with its own overhang. Legs pinch at the waist and flare at the sand;
// the bridge is a run of long pillows. Legs centred x = -6 and x = +6, passage open along Z.
export default function (THREE) {
  const g = new THREE.Group();
  const K = archKit(THREE, 4242);
  const { rnd, jit, T, put } = K;
  const BS = 0.22, BT = 0.16; // bevel size / thickness, subtracted from what is drawn
  function plan(a, b, n = 16, p = 3.2, j = 0.06, pinch = 0) {
    const sh = new THREE.Shape();
    for (let i = 0; i < n; i++) {
      const t = (i / n) * Math.PI * 2, c = Math.cos(t), s = Math.sin(t);
      const r = Math.pow(Math.pow(Math.abs(c), p) + Math.pow(Math.abs(s), p), -1 / p) * (1 + jit(j));
      const x = c * r * (a - BS), y = s * r * (b - BS) * (1 - pinch * Math.exp(-c * c * 6));
      if (i === 0) sh.moveTo(x, y); else sh.lineTo(x, y);
    }
    sh.closePath(); return sh;
  }
  // stratum with base at y0, thickness h, centred (cx, cz), half sizes a (x) and b (z)
  function stratum(key, y0, h, cx, cz, a, b, ry = 0, opt = {}) {
    const geo = new THREE.ExtrudeGeometry(plan(a, b, opt.n, opt.p, opt.j, opt.pinch), { depth: Math.max(0.05, h - 2 * BT), bevelEnabled: true, bevelSize: BS, bevelThickness: BT, bevelSegments: 1, curveSegments: 1, steps: 1 });
    put(key, geo, T(cx, y0 + BT, cz, -Math.PI / 2, ry, 0));
  }
  const UNDER = 9.5;
  const key = (y, i) => (y < 3.0 ? 'wet' : (i % 2 ? 'sand2' : 'sand'));
  // leg half-width (x) over height: big foot, waist at ~5 m, widening into the haunch
  const halfX = (y) => y < 2.5 ? 2.55 - y * 0.18 : y < 6 ? 2.1 - (y - 2.5) * 0.04 : 1.96 + (y - 6) * 0.1;
  const halfZ = (y) => y < 2.5 ? 3.6 - y * 0.12 : 3.25 + jit(0.12);
  for (const sx of [-1, 1]) {
    let y = 0, i = 0;
    while (y < UNDER - 0.1) {
      let h = Math.min(1.3 + rnd() * 0.7, UNDER - y); if (UNDER - y - h < 0.8) h = UNDER - y;
      const a = halfX(y + h / 2) + jit(0.12), b = halfZ(y + h / 2);
      // the foot spreads outward more than into the channel
      const cx = sx * (6 + (a - 2) * 0.55) + jit(0.12);
      stratum(key(y, i), y, h, cx, jit(0.25), a, b, jit(0.12), { n: 18 });
      if (y > 3 && rnd() < 0.6) // a lumpy shelf stuck on the outer flank
        stratum('sand', y + h * 0.15, h * 0.7, sx * (7.5 + rnd() * 0.2), jit(1.6), 0.9, 1.3 + rnd() * 0.5, rnd() * 3, { n: 10, p: 2.4, j: 0.12 });
      y += h; i++;
    }
    // haunch where the leg grows into the bridge
    stratum('sand2', UNDER - 1.2, 1.25, sx * 4.4, 0, 1.3, 3.2, 0, { n: 12, p: 2.6 });
  }
  // the bridge: long pillows, the lowest one slightly narrower so the next overhangs it
  let y = UNDER, i = 0;
  for (const [h, ext, depth] of [[1.5, 7.9, 3.1], [1.4, 8.25, 3.4], [1.2, 7.9, 3.2]]) {
    stratum(key(y, i + 1), y, h, jit(0.3), jit(0.2), ext + jit(0.2), depth + jit(0.15), jit(0.03), { n: 22, p: 3.6, j: 0.04, pinch: 0.06 });
    y += h; i++;
  }
  // raised pillows on top, as in the reference, where the grass gathers
  stratum('sand', y - 0.12, 0.6, -5.0, -0.5, 2.3, 2.0, 0.3, { n: 12, p: 2.4 });
  stratum('sand2', y - 0.12, 0.5, 5.3, 0.6, 1.9, 1.8, -0.4, { n: 12, p: 2.4 });
  stratum('sand', y - 0.12, 0.4, 0.6, -0.9, 1.6, 1.3, 0.8, { n: 10, p: 2.2 });
  K.wobble(['sand', 'sand2', 'wet'], 0.12);
  const rock = K.meshes(g, ['sand', 'sand2', 'wet']);
  K.dress(g, rock, [{ x: -6.5, z: 0 }, { x: 6.5, z: 0 }]);
  K.meshes(g, ['cream', 'kelp', 'grass']);
  return K.recentre(g);
}

// ---- sea arch kit (inlined so the module has no imports). Palette per STYLE_LOCK.md ----
function archKit(THREE, seed) {
  let s = (seed >>> 0) || 7;
  const rnd = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
  const jit = (a) => (rnd() * 2 - 1) * a;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const mk = (color, rough, name, extra) => {
    const m = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: rough, metalness: 0, flatShading: true }, extra || {}));
    m.name = name; return m;
  };
  const mats = {
    sand: mk(0xc6a888, 0.92, 'stone'),         // cliff sandstone
    sand2: mk(0xb4936f, 0.92, 'stone'),        // darker stratum
    wet: mk(0x6c6a64, 0.8, 'stone'),           // wet stone grey, the tide band
    kelp: mk(0x4f5a2c, 0.85, 'foliage', { side: THREE.DoubleSide }),
    grass: mk(0x7a8a3c, 0.9, 'foliage', { side: THREE.DoubleSide }),
    cream: mk(0xd9cfb6, 0.85, 'stone'),        // barnacles
  };
  const buckets = {};
  const va = new THREE.Vector3();
  function put(key, geo, M) {
    const g = geo.index ? geo.toNonIndexed() : geo;
    const p = g.attributes.position;
    const b = buckets[key] || (buckets[key] = []);
    const flip = M && M.determinant() < 0;
    for (let i = 0; i < p.count; i += 3) {
      const ord = flip ? [0, 2, 1] : [0, 1, 2];
      for (const j of ord) { va.fromBufferAttribute(p, i + j); if (M) va.applyMatrix4(M); b.push(va.x, va.y, va.z); }
    }
  }
  const T = (x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) =>
    new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), V(sx, sy, sz));
  // smooth position noise: continuous, so shared vertices of a welded-looking surface never tear
  const ph = [rnd() * 9, rnd() * 9, rnd() * 9, rnd() * 9, rnd() * 9, rnd() * 9];
  const noise = (x, y, z) =>
    Math.sin(x * 0.9 + ph[0] + Math.sin(z * 0.7 + ph[1])) * 0.5 + Math.sin(y * 1.3 + ph[2] + x * 0.4) * 0.3 +
    Math.sin(z * 1.1 + ph[3] + y * 0.5) * 0.4 + Math.sin((x + z) * 2.1 + ph[4]) * 0.15 + Math.sin((y - x) * 2.6 + ph[5]) * 0.12;
  function wobble(keys, amt) {
    for (const k of keys) {
      const a = buckets[k]; if (!a) continue;
      for (let i = 0; i < a.length; i += 3) {
        const x = a[i], y = a[i + 1], z = a[i + 2];
        a[i] += noise(x, y, z) * amt; a[i + 2] += noise(z + 3.1, y, x - 1.7) * amt;
        if (y > 0.05) a[i + 1] += noise(y, x + 5, z) * amt * 0.5;
      }
    }
  }
  // chamfered box, centred (convex: 26 faces)
  function cboxGeo(w, h, d, c) {
    c = Math.min(c, w * 0.45, h * 0.45, d * 0.45);
    const hx = w / 2, hy = h / 2, hz = d / 2;
    const P = (sx, sy, sz, ax) => ax === 0 ? [sx * hx, sy * (hy - c), sz * (hz - c)] : ax === 1 ? [sx * (hx - c), sy * hy, sz * (hz - c)] : [sx * (hx - c), sy * (hy - c), sz * hz];
    const tris = []; const quad = (a, b, cc, d2) => { tris.push([a, b, cc], [a, cc, d2]); }; const S = [-1, 1];
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
    const pos = []; const A = V(0, 0, 0), B = V(0, 0, 0), C = V(0, 0, 0), nn = V(0, 0, 0), cen = V(0, 0, 0);
    for (const t of tris) {
      A.fromArray(t[0]); B.fromArray(t[1]); C.fromArray(t[2]);
      nn.subVectors(B, A).cross(C.clone().sub(A)); cen.copy(A).add(B).add(C);
      if (nn.dot(cen) < 0) pos.push(...t[0], ...t[2], ...t[1]); else pos.push(...t[0], ...t[1], ...t[2]);
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); return geo;
  }
  function meshes(g, keys) {
    const out = [];
    for (const k of keys) {
      const a = buckets[k]; if (!a || !a.length) continue;
      for (let i = 1; i < a.length; i += 3) if (a[i] < 0) a[i] = 0; // nothing hangs below the sand
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(a, 3));
      geo.computeVertexNormals();
      const m = new THREE.Mesh(geo, mats[k]); m.name = k; m.castShadow = true; m.receiveShadow = true; g.add(m); out.push(m);
      delete buckets[k];
    }
    return out;
  }
  // ---- dressing, placed by casting rays at the finished rock ----
  const up = V(0, 1, 0);
  const orient = (p, n, spin, sx = 1, sy = 1, sz = 1) => {
    const q = new THREE.Quaternion().setFromUnitVectors(up, n);
    q.multiply(new THREE.Quaternion().setFromAxisAngle(up, spin));
    return new THREE.Matrix4().compose(p, q, V(sx, sy, sz));
  };
  const barnGeo = new THREE.CylinderGeometry(0.035, 0.075, 0.08, 5, 1);
  const icoGeo = new THREE.IcosahedronGeometry(1, 0);
  const bladeGeo = new THREE.ConeGeometry(0.05, 1, 3, 1, true).translate(0, 0.5, 0);
  function tangents(n) { const t = Math.abs(n.y) < 0.9 ? V(0, 1, 0) : V(1, 0, 0); const a = t.clone().cross(n).normalize(); return [a, n.clone().cross(a).normalize()]; }
  function barnacles(p, n) {
    const [a, b] = tangents(n); const k = 3 + Math.floor(rnd() * 3);
    for (let i = 0; i < k; i++) {
      const q = p.clone().addScaledVector(a, jit(0.22)).addScaledVector(b, jit(0.22)).addScaledVector(n, 0.02);
      const sc = 0.8 + rnd() * 0.7; put('cream', barnGeo, orient(q, n, rnd() * 6, sc, sc, sc));
    }
  }
  function patch(key, p, n, size) {
    put(key, icoGeo, orient(p.clone().addScaledVector(n, 0.02), n, rnd() * 6, size * (0.8 + rnd() * 0.6), 0.12, size * (0.5 + rnd() * 0.5)));
  }
  function frond(p, n) {
    // a kelp blade: strip of 4 segments that leans out from the rock and curls
    const L = 1.1 + rnd() * 1.3, w = 0.2 + rnd() * 0.12, segs = 4; const pos = [];
    const lean = n.clone().setY(0).normalize(); const side = V(-lean.z, 0, lean.x); const tw = jit(0.6);
    const pt = (i, sgn) => { const t = i / segs; const y = t * L; const out = 0.1 + t * t * L * 0.16; const wd = w * (1 - t * 0.7) * sgn;
      return p.clone().add(V(0, y, 0)).addScaledVector(lean, out).addScaledVector(side, wd + Math.sin(t * 3 + tw) * 0.12); };
    for (let i = 0; i < segs; i++) { const a = pt(i, -1), b = pt(i, 1), c = pt(i + 1, 1), d = pt(i + 1, -1); pos.push(...a.toArray(), ...b.toArray(), ...c.toArray(), ...a.toArray(), ...c.toArray(), ...d.toArray()); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); put('kelp', geo);
  }
  function tuft(p) {
    const k = 5 + Math.floor(rnd() * 3);
    for (let i = 0; i < k; i++) { const h = 0.35 + rnd() * 0.4; put('grass', bladeGeo, T(p.x + jit(0.12), p.y - 0.03, p.z + jit(0.12), jit(0.5), rnd() * 6, jit(0.5), 1, h, 1)); }
  }
  function shrub(p) {
    const k = 3 + Math.floor(rnd() * 3);
    for (let i = 0; i < k; i++) { const r = 0.25 + rnd() * 0.22; put('kelp', icoGeo, T(p.x + jit(0.35), p.y + r * 0.55, p.z + jit(0.35), rnd() * 3, rnd() * 3, 0, r, r * 0.85, r)); }
  }
  const rc = new THREE.Raycaster();
  function hit(rock, o, d) {
    rc.set(o, d.normalize()); const h = rc.intersectObjects(rock, false)[0]; if (!h) return null;
    return { p: h.point.clone(), n: h.face.normal.clone().normalize() };
  }
  // legs: [{x, z}] centres; tops: [x0,x1,z0,z1] box for downward rays
  function dress(g, rock, legs, opt = {}) {
    g.updateMatrixWorld(true);
    const nB = opt.barn ?? 20, nM = opt.moss ?? 44, nF = opt.fronds ?? 30, nT = opt.tufts ?? 24, nS = opt.shrubs ?? 9, nG = opt.topMoss ?? 12;
    const legRay = (yLo, yHi) => {
      const L = legs[Math.floor(rnd() * legs.length)]; const a = rnd() * Math.PI * 2; const y = yLo + rnd() * (yHi - yLo);
      return hit(rock, V(L.x + Math.cos(a) * 5.5, y, L.z + Math.sin(a) * 5.5), V(-Math.cos(a), 0, -Math.sin(a)));
    };
    for (let i = 0; i < nB; i++) { const h = legRay(0.25, 2.8); if (h) barnacles(h.p, h.n); }
    for (let i = 0; i < nM; i++) { const h = legRay(0.2, 3.0); if (h) patch('kelp', h.p, h.n, 0.7 + rnd() * 0.45); }
    for (let i = 0; i < nF; i++) { const h = legRay(0.05, 0.45); if (h) frond(h.p.setY(Math.max(0, h.p.y - 0.1)), h.n); }
    const [x0, x1, z0, z1] = opt.tops || [-9, 9, -4, 4];
    const topRay = () => { for (let t = 0; t < 12; t++) { const h = hit(rock, V(x0 + rnd() * (x1 - x0), 30, z0 + rnd() * (z1 - z0)), V(0, -1, 0)); if (h && h.n.y > 0.8 && h.p.y > 4) return h; } return null; };
    for (let i = 0; i < nT; i++) { const h = topRay(); if (h) tuft(h.p); }
    for (let i = 0; i < nS; i++) { const h = topRay(); if (h) shrub(h.p); }
    for (let i = 0; i < nG; i++) { const h = topRay(); if (h && Math.abs(h.p.z) < 2.4) patch('grass', h.p, h.n, 0.5 + rnd() * 0.5); }
  }
  function recentre(g) {
    const box = new THREE.Box3(), v = new THREE.Vector3(), m = new THREE.Matrix4(), im = new THREE.Matrix4();
    g.updateMatrixWorld(true);
    g.traverse((n) => {
      const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
      const putp = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
      if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); putp(m.multiplyMatrices(n.matrixWorld, im)); } return; }
      putp(n.matrixWorld);
    });
    const c = box.getCenter(new THREE.Vector3());
    g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
    return g;
  }
  return { rnd, jit, V, T, mats, put, cboxGeo, wobble, meshes, dress, recentre, buckets };
}
