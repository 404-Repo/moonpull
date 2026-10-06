// toy_boat, candidate B: profiles. The hull is one extrusion of the deck plan (pointed bow, flat
// transom) run downward and tapered toward the keel; the red strake and deck are thin extrusions
// of the same plan; the mast is a lathe; the sails are billowed planes with their vertices bowed
// into a curve. A child's carved sailboat, 0.45 m long, bow toward +Z, base y = 0.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, r = 0.85, extra = {}) => { const x = new THREE.MeshStandardMaterial({ color, roughness: r, ...extra }); if (name) x.name = name; return x; };
  const hullC = M(0x9a7048, 'timber', 0.8), deck = M(0xb79773, 'timber', 0.85), red = M(0xb5543a, 'timber', 0.7), keelC = M(0x4a3426, 'timber', 0.6);
  const sail = M(0xe9d6b8, 'fabric', 0.95, { side: THREE.DoubleSide }), patch = M(0xc99a5c, 'fabric', 0.95, { side: THREE.DoubleSide }), mast = M(0x7b5a3e, 'timber', 0.8);
  const add = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); o.castShadow = true; g.add(o); return o; };
  // deck plan in (x, z): transom at z = -0.17, bow point at z = 0.28
  const plan = (k = 1) => { const s = new THREE.Shape(); s.moveTo(-0.055 * k, -0.17); s.lineTo(0.055 * k, -0.17); s.quadraticCurveTo(0.085 * k, 0.0, 0.07 * k, 0.12); s.quadraticCurveTo(0.05 * k, 0.23, 0, 0.28 * (0.9 + 0.1 * k)); s.quadraticCurveTo(-0.05 * k, 0.23, -0.07 * k, 0.12); s.quadraticCurveTo(-0.085 * k, 0.0, -0.055 * k, -0.17); return s; };
  // hull: extrude the plan 0.08 downward with 4 steps, then pull each ring in toward the keel
  const H = 0.08;
  const hull = new THREE.ExtrudeGeometry(plan(), { depth: H, steps: 4, bevelEnabled: false, curveSegments: 6 });
  { const p = hull.attributes.position; for (let i = 0; i < p.count; i++) { const d = p.getZ(i) / H; const k = 1 - 0.7 * d * d; p.setX(i, p.getX(i) * k); p.setY(i, p.getY(i) * (1 - 0.12 * d) + 0.012 * d); } hull.computeVertexNormals(); }
  // plan y is model z; extrude z is downward depth -> rotate so depth runs down
  add(hull, hullC, 0, 0.1, 0, Math.PI / 2, 0, 0);
  // keel fin
  add(new THREE.BoxGeometry(0.018, 0.035, 0.22), keelC, 0, 0.018, 0.02);
  // red strake: thin band of the plan just under the deck edge
  add(new THREE.ExtrudeGeometry(plan(1.04), { depth: 0.016, bevelEnabled: false, curveSegments: 6 }), red, 0, 0.098, 0, Math.PI / 2, 0, 0);
  // deck inset
  add(new THREE.ExtrudeGeometry(plan(0.85), { depth: 0.012, bevelEnabled: false, curveSegments: 6 }), deck, 0, 0.108, 0, Math.PI / 2, 0, 0);
  add(new THREE.BoxGeometry(0.06, 0.02, 0.06), keelC, 0, 0.11, -0.1);
  // mast: lathe with a knob, and a boom
  const V2 = (x, y) => new THREE.Vector2(x, y);
  add(new THREE.LatheGeometry([V2(0, 0), V2(0.012, 0), V2(0.009, 0.33), V2(0.014, 0.345), V2(0, 0.36)], 7), mast, 0, 0.1, 0.04);
  add(new THREE.CylinderGeometry(0.007, 0.007, 0.18, 6), mast, 0, 0.14, -0.045, Math.PI / 2, 0, 0);
  // billowed sail: a triangle of a segmented plane, bulged sideways by a sine across it
  const billow = (w, h, bulge) => {
    const geo = new THREE.BufferGeometry(), pos = [], idx = [], n = 6;
    // rows from foot (y=0) to head (y=h); each row runs from the luff (z=0) aft to the leech
    for (let r = 0; r <= n; r++) for (let c = 0; c <= n; c++) {
      const v = r / n, u = c / n, len = w * (1 - v);
      pos.push(Math.sin(Math.PI * u) * bulge * (1 - v * 0.6) * (len / w), v * h, -u * len);
    }
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) { const a = r * (n + 1) + c, b = a + 1, d = a + n + 1, e = d + 1; idx.push(a, b, d, b, e, d); }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals(); return geo;
  };
  add(billow(0.17, 0.27, 0.035), sail, 0, 0.15, 0.03);
  const jib = add(billow(0.15, 0.2, 0.025), sail, 0, 0.13, 0.22); jib.rotation.y = 0.0;
  // a stitched patch on the main
  add(new THREE.PlaneGeometry(0.04, 0.04), patch, 0.03, 0.2, -0.05, 0, Math.PI / 2, 0);
  // pennant
  add(new THREE.ConeGeometry(0.016, 0.07, 3), red, 0, 0.44, 0.0, -Math.PI / 2, 0, 0).scale.set(0.3, 1, 1);
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
