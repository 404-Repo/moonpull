// cliff_stairs C (different reading, as the ref's ridge): the flight sits on top of a lofted rock
// ridge whose cross-section slopes away on both sides below step level; each tread is one big
// chunky cut stone the full width; the ridge is jittered and banded wet-grey at the foot.
export default function (THREE) {
  const g = new THREE.Group();
  let seed = 53;
  const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const rr = (a, b) => a + (b - a) * rnd();
  const M = (color, name, rough, extra = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: rough, ...extra }); if (name) m.name = name; return m; };
  // position-hash noise: coincident vertices move together, so seams never crack
  const hash = (x, y, z, s = 0) => { const q = Math.sin(Math.round(x * 997) * 12.9898 + Math.round(y * 991) * 78.233 + Math.round(z * 983) * 37.719 + 41 + s) * 43758.5453; return q - Math.floor(q); };
  const jitter = (geo, amt, floorY) => {
    const p = geo.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const a = hash(v.x, v.y, v.z), b = hash(v.z + 3.1, v.x - 1.7, v.y + 0.3), c = hash(v.y - 5.3, v.z + 2.9, v.x + 7.7);
      v.x += (a - 0.5) * amt; v.y += (b - 0.5) * amt * 0.7; v.z += (c - 0.5) * amt;
      if (floorY !== undefined && v.y < floorY) v.y = floorY;
      p.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals(); return geo;
  };
  const mesh = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, parent = g) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.castShadow = m.receiveShadow = true; parent.add(m); return m; };
  // rounded box (bevelled) via extrude of a rounded rect
  const rbox = (w, h, d, r, segs = 2) => {
    const s = new THREE.Shape(); const x = -w / 2 + r, y = -d / 2 + r, W = w - 2 * r, D = d - 2 * r;
    s.moveTo(x, -d / 2); s.lineTo(x + W, -d / 2); s.quadraticCurveTo(w / 2, -d / 2, w / 2, y); s.lineTo(w / 2, y + D); s.quadraticCurveTo(w / 2, d / 2, x + W, d / 2);
    s.lineTo(x, d / 2); s.quadraticCurveTo(-w / 2, d / 2, -w / 2, y + D); s.lineTo(-w / 2, y); s.quadraticCurveTo(-w / 2, -d / 2, x, -d / 2);
    const geo = new THREE.ExtrudeGeometry(s, { depth: Math.max(h - 2 * r, 0.001), bevelEnabled: true, bevelThickness: r, bevelSize: r * 0.6, bevelSegments: segs, curveSegments: segs });
    geo.rotateX(-Math.PI / 2); geo.translate(0, r, 0); geo.computeBoundingBox(); const bb = geo.boundingBox; geo.translate(0, -bb.min.y - h / 2, 0);
    return geo; // centred on origin, height h
  };
  const rc = new THREE.Raycaster(); const nm3 = new THREE.Matrix3(); const UP = new THREE.Vector3(0, 1, 0);
  const hitOn = (targets, o, d) => { rc.set(o, d.clone().normalize()); const h = rc.intersectObjects(targets, false)[0]; if (!h) return null; nm3.getNormalMatrix(h.object.matrixWorld); return { p: h.point, n: h.face.normal.clone().applyMatrix3(nm3).normalize() }; };
  const onSurface = (s, geo, mat, lift = 0, spin = 0) => { const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.quaternion.setFromUnitVectors(UP, s.n); m.rotateY(spin); m.position.copy(s.p).addScaledVector(s.n, lift); g.add(m); return m; };
  // split a non-indexed geometry into one single-material mesh per class (classify by triangle centroid)
  const splitMesh = (ng, cls, mats, x = 0, y = 0, z = 0, ry = 0) => {
    const pos = ng.attributes.position, nor = ng.attributes.normal, buckets = mats.map(() => ({ p: [], n: [] }));
    const c = new THREE.Vector3();
    for (let t = 0; t < pos.count / 3; t++) {
      c.set(0, 0, 0); for (let k = 0; k < 3; k++) c.x += pos.getX(t * 3 + k) / 3, c.y += pos.getY(t * 3 + k) / 3, c.z += pos.getZ(t * 3 + k) / 3;
      const b = buckets[cls(c)];
      for (let k = 0; k < 3; k++) { const i = t * 3 + k; b.p.push(pos.getX(i), pos.getY(i), pos.getZ(i)); b.n.push(nor.getX(i), nor.getY(i), nor.getZ(i)); }
    }
    const out = [];
    buckets.forEach((b, i) => { if (!b.p.length) return; const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(b.p, 3)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(b.n, 3)); out.push(mesh(geo, mats[i], x, y, z, 0, ry, 0)); });
    return out;
  };
  const step = M(0x6c6a64, 'stone', 0.8);
  const stepLt = M(0x85827a, 'stone', 0.85);
  const rock = M(0xc6a888, 'stone', 0.88);
  const rockDk = M(0x8e8170, 'stone', 0.85);
  const moss = M(0x4f5a2c, 'foliage', 0.9);
  const wood = M(0x7b5a3e, 'timber', 0.85);
  // walk plan (rises toward -Z): flight 1 = 9 steps over z +4.5..+0.75, landing z +0.75..-0.75 at 2.5 m,
  // flight 2 = 10 steps over z -0.75..-4.5 up to 5.0 m. Tops are exact; nothing jitters a tread.
  const W = 1.8, HW = W / 2;
  const STEPS = [];
  for (let i = 0; i < 9; i++) STEPS.push({ z0: 4.5 - i * (3.75 / 9), z1: 4.5 - (i + 1) * (3.75 / 9), top: 0.25 * (i + 1) });
  const LANDING = { z0: 0.75, z1: -0.75, top: 2.5 };
  for (let i = 0; i < 10; i++) STEPS.push({ z0: -0.75 - i * 0.375, z1: -0.75 - (i + 1) * 0.375, top: 2.5 + 0.25 * (i + 1) });
  const topAt = (z) => { if (z <= LANDING.z0 && z >= LANDING.z1) return LANDING.top; for (const s of STEPS) if (z <= s.z0 && z >= s.z1) return s.top; return z > 0 ? 0 : 5; };
  // handrail on the +x side: posts at edges of the walk, rails follow the pitch line
  const beam = (a, b, t, mat) => { const len = a.distanceTo(b); const m = mesh(new THREE.BoxGeometry(t, t, len + t * 0.5), mat, (a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2); m.lookAt(b.x, b.y, b.z); return m; };
  const rail = (x) => {
    const PZ = [4.3, 2.95, 1.6, 0.6, -0.6, -1.7, -2.85, -4.3];
    const H = 0.95, base = (z) => topAt(z);
    for (const z of PZ) mesh(new THREE.BoxGeometry(0.13, H + 0.12, 0.13), wood, x, base(z) + (H + 0.12) / 2 - 0.02, z);
    for (let i = 0; i < PZ.length - 1; i++) {
      const a = PZ[i], b = PZ[i + 1];
      // pitch line: smooth line between post tops
      const A = new THREE.Vector3(x, base(a) + H, a), B = new THREE.Vector3(x, base(b) + H, b);
      beam(A, B, 0.09, wood);
      beam(A.clone().setY(A.y - 0.45), B.clone().setY(B.y - 0.45), 0.06, wood);
    }
  };
  // rock courses: faceted boulders stacked up to height h at (x, z), wider at the foot
  const ico = new THREE.IcosahedronGeometry(1, 0);
  const rockStack = (x, z, h, out, zmax = 0.5) => {
    let y = 0, k = 0; const n = Math.max(1, Math.round(h / 0.95));
    const lh = h / n;
    for (let i = 0; i < n; i++) {
      const r = 0.38 + (n - i) * 0.04, geo = jitter(ico.clone().toNonIndexed(), 0.35);
      geo.scale(r, lh * 0.62, Math.min(zmax, 0.55) / 1.25);
      if (i === 0) { const q = geo.attributes.position; for (let k = 0; k < q.count; k++) if (q.getY(k) < -lh / 2) q.setY(k, -lh / 2); geo.computeVertexNormals(); } const m = mesh(geo, rnd() < 0.7 ? rock : rockDk, x + out * (n - i - 1) * 0.08 + rr(-0.05, 0.05), y + lh / 2, z, 0, rr(-0.3, 0.3), 0);
      y += lh; k++;
    }
    return y;
  };
  const mossCap = (x, y, z, r) => mesh(new THREE.SphereGeometry(0.5, 6, 2, 0, Math.PI * 2, 0, Math.PI / 2), moss, x, y - 0.06, z, 0, rr(0, 6), 0).scale.set(r, 0.15, r * 0.7);
  const flanks = (hiL, hiR) => {
    for (const side of [-1, 1]) for (let z = 4.15; z >= -4.2; z -= 0.72) {
      const r = 0.5, h = topAt(z) + (side < 0 ? hiL : hiR) + rr(-0.08, 0.12), x = side * (HW + 0.28);
      const top = rockStack(x, z, h, side, Math.min(0.5, 4.5 - Math.abs(z) - 0.05));
      if (rnd() < 0.55) mossCap(x, top, z, 0.5);
    }
    // back: the top flight's end face gets rock courses too (it sits against the cliff top in a level)
    for (let x = -1.0; x <= 1.01; x += 0.66) rockStack(x, -4.15, 4.7 + rr(-0.2, 0.05), 0, 0.38);
  };
  g.userData.mounts = 'back';
  // loft: cross-section at each z, from the left foot up under the walk and down to the right foot
  {
    const prof = (z, t) => { const f = 0.9 + Math.min(t, 3) * 0.25; return [[-HW - f, 0], [-HW - f * 0.55, t * 0.45], [-HW - 0.15, t - 0.1], [HW + 0.15, t - 0.1], [HW + f * 0.55, t * 0.45], [HW + f, 0]]; };
    const zs = []; for (let z = 4.45; z >= -4.46; z -= 0.45) zs.push(z);
    const pos = [];
    for (let i = 0; i < zs.length - 1; i++) {
      const A = prof(zs[i], topAt(zs[i] - 0.01)), B = prof(zs[i + 1], topAt(zs[i + 1] + 0.01));
      for (let j = 0; j < A.length - 1; j++) { const a = [A[j][0], A[j][1], zs[i]], b = [A[j + 1][0], A[j + 1][1], zs[i]], c = [B[j + 1][0], B[j + 1][1], zs[i + 1]], d = [B[j][0], B[j][1], zs[i + 1]]; pos.push(...a, ...b, ...c, ...a, ...c, ...d); }
    }
    // end caps
    for (const [zz, flip] of [[zs[0], 1], [zs[zs.length - 1], -1]]) { const P = prof(zz, topAt(zz)); for (let j = 1; j < P.length - 1; j++) { const t = [[P[0][0], P[0][1], zz], [P[j][0], P[j][1], zz], [P[j + 1][0], P[j + 1][1], zz]]; if (flip < 0) t.reverse(); pos.push(...t.flat()); } }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    const p = geo.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); if (Math.abs(v.x) > HW + 0.2) { v.x += (hash(v.x, v.y, v.z) - 0.5) * 0.45; v.y = Math.max(0, v.y + (hash(v.z, v.x, v.y) - 0.5) * 0.3); } p.setXYZ(i, v.x, v.y, v.z); }
    geo.computeVertexNormals();
    splitMesh(geo, (c) => (c.y < 0.6 ? 0 : (hash(Math.round(c.z * 2), Math.round(c.y * 2), c.x > 0 ? 1 : 0) < 0.3 ? 1 : 2)), [rockDk, step, rock]);
  }
  // treads: one chunky stone each, full width, plus riser block under it
  STEPS.forEach((st, k) => { const d = st.z0 - st.z1; mesh(rbox(W + 0.1, 0.3, d + 0.03, 0.06, 1), k % 2 ? step : stepLt, (hash(k, 2, 3) - 0.5) * 0.06, st.top - 0.15, (st.z0 + st.z1) / 2); mesh(new THREE.BoxGeometry(W, Math.max(st.top - 0.3, 0.02), d), rockDk, 0, Math.max(st.top - 0.3, 0.02) / 2, (st.z0 + st.z1) / 2); });
  { const L = LANDING; for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) mesh(rbox(W / 2 - 0.03, 0.3, (L.z0 - L.z1) / 2 - 0.03, 0.06, 1), (i + j) % 2 ? step : stepLt, -HW / 2 + i * HW, L.top - 0.15, L.z0 - (L.z0 - L.z1) * (j + 0.5) / 2); mesh(new THREE.BoxGeometry(W, L.top - 0.3, L.z0 - L.z1), rockDk, 0, (L.top - 0.3) / 2, 0); }
  // back face rock courses + moss tufts on the ridge
  for (let x = -1.0; x <= 1.01; x += 0.66) rockStack(x, -4.15, 4.6, 0, 0.38);
  for (let z = 4.0; z >= -4.0; z -= 0.9) for (const side of [-1, 1]) if (rnd() < 0.6) mossCap(side * (HW + 0.45), topAt(z) - 0.25, z, 0.5);
  rail(HW - 0.1);
  // contract recentring (vertex-measured)
  {
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
  }
  return g;
}
