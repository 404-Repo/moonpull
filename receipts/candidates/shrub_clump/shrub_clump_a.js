// shrub_clump A (primitives): each gorse mound is a cluster of faceted icosahedron lumps piled into
// a dome (dark inner, lighter outer), yellow octahedron flower dots raycast onto the lumps.
export default function (THREE) {
  const g = new THREE.Group();
  let seed = 47;
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
    const geo = new THREE.ExtrudeGeometry(s, { depth: Math.max(h - 2 * r, 0.001), bevelEnabled: true, bevelThickness: r, bevelSize: r * 0.6, bevelSegments: segs, curveSegments: 2 });
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
  const gorse = M(0x5f6d2d, 'foliage', 0.9);
  const gorseDk = M(0x48532a, 'foliage', 0.9);
  const flower = M(0xe9b82c, 'foliage', 0.7);
  const grass = M(0x77803c, 'foliage', 0.85, { side: THREE.DoubleSide });
  const seedM = M(0xa58a5c, 'foliage', 0.85);
  const stoneM = M(0x7d7c76, 'stone', 0.8);
  const dirt = M(0x8f7a5c, 'ground', 0.95);
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  // mounds: x, z, radius, height
  const MOUNDS = [[-0.3, 0.05, 0.42, 0.85], [0.25, -0.15, 0.45, 1.0], [0.42, 0.28, 0.32, 0.65], [-0.35, -0.35, 0.33, 0.7], [0.0, 0.35, 0.3, 0.55]];
  const bushes = [];
  // dirt pad, low stones, twigs
  { const geo = new THREE.CylinderGeometry(0.62, 0.68, 0.06, 12); jitter(geo.toNonIndexed(), 0.03); mesh(geo, dirt, 0, 0.03, 0); }
  for (const [x, z, s] of [[0.15, 0.62, 0.12], [-0.55, 0.45, 0.09], [0.6, -0.2, 0.08], [-0.05, 0.7, 0.06]]) { const geo = jitter(new THREE.DodecahedronGeometry(s, 0).toNonIndexed(), s * 0.3); mesh(geo, stoneM, x, s * 0.45, z).scale.y = 0.65; }
  for (let i = 0; i < 4; i++) { const a = rr(0, 6.28); mesh(new THREE.CylinderGeometry(0.012, 0.018, 0.32, 4), seedM, Math.cos(a) * 0.45, 0.07, Math.sin(a) * 0.45, 0, -a, Math.PI / 2); }
  // grass tuft: a fan of blades, plus seed heads on tall stalks
  const blade = (h, w, bend) => { const geo = new THREE.PlaneGeometry(w, h, 1, 3); const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const t = (p.getY(i) + h / 2) / h; p.setXYZ(i, p.getX(i) * (1 - t * 0.9), t * h, t * t * bend); } geo.computeVertexNormals(); return geo; };
  const tuft = (x, z, n, h) => {
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + rr(-0.3, 0.3); const m = mesh(blade(h * rr(0.6, 1.0), 0.06, h * rr(0.15, 0.35)), grass, x, 0.04, z, 0, 0, 0); m.rotation.order = 'YXZ'; m.rotation.y = a; m.rotation.x = rr(0, 0.2); }
    for (let i = 0; i < 2; i++) { const a = rr(0, 6.28), lean = rr(0.1, 0.35), H = h * rr(1.15, 1.35); const st = new THREE.Group(); st.position.set(x, 0.04, z); st.rotation.set(Math.cos(a) * lean, 0, Math.sin(a) * lean); g.add(st);
      const s = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.01, H, 3), seedM); s.position.y = H / 2; st.add(s);
      const hd = new THREE.Mesh(new THREE.OctahedronGeometry(1, 0), seedM); hd.scale.set(0.025, 0.09, 0.025); hd.position.y = H + 0.06; st.add(hd); }
  };
  for (const [x, z, n, h] of [[-0.55, 0.05, 8, 0.75], [0.05, 0.5, 7, 0.6], [0.55, -0.05, 7, 0.7], [-0.15, -0.52, 7, 0.65], [0.4, 0.45, 5, 0.45], [-0.4, 0.42, 5, 0.5]]) tuft(x, z, n, h);
  // flowers: raycast down/outward onto the gorse, small yellow pea-flower dots
  const flowers = (n) => {
    g.updateMatrixWorld(true);
    const fg = new THREE.OctahedronGeometry(0.045, 0);
    let made = 0;
    for (let i = 0; i < n * 3 && made < n; i++) {
      const a = rr(0, 6.28), el = rr(0.15, 1.3), d = V(-Math.cos(a) * Math.cos(el), -Math.sin(el), -Math.sin(a) * Math.cos(el));
      const s = hitOn(bushes, V(-d.x * 3, 0.45 - d.y * 3, -d.z * 3), d); if (!s || s.p.y < 0.2) continue;
      const m = onSurface(s, fg, flower, 0.02, rr(0, 6)); m.scale.set(1, 0.6, 1); made++;
    }
  };
  const lump = new THREE.IcosahedronGeometry(1, 0);
  for (const [x, z, r, h] of MOUNDS) {
    const core = mesh(lump, gorseDk, x, h * 0.42, z); core.scale.set(r * 0.85, h * 0.42, r * 0.85); bushes.push(core);
    const n = Math.round(r * 22);
    for (let i = 0; i < n; i++) { const a = rr(0, 6.28), el = rr(-0.1, 1.2), rad = r * rr(0.25, 0.4);
      const px = x + Math.cos(a) * Math.cos(el) * r * 0.7, py = h * 0.42 + Math.sin(el) * h * 0.45, pz = z + Math.sin(a) * Math.cos(el) * r * 0.7;
      const m = mesh(lump, rnd() < 0.7 ? gorse : gorseDk, px, Math.max(py, rad * 0.6), pz, rr(0, 6), rr(0, 6), 0); m.scale.setScalar(rad); bushes.push(m); }
  }
  flowers(90);
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
