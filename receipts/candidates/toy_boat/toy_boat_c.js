// toy_boat, candidate C: a different reading. A chunky whittled tub of a boat, the kind a child
// carves from one block: a deep rounded hull (a squashed half sphere drawn out to a bow), a
// painted blue gunwale and white deck, a square lug sail hung from a yard (cloth, slightly bowed),
// and a pull string curling off the bow to a wooden bead. 0.45 m long, bow toward +Z, base y = 0.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, r = 0.85, extra = {}) => { const x = new THREE.MeshStandardMaterial({ color, roughness: r, ...extra }); if (name) x.name = name; return x; };
  const hullC = M(0xb08050, 'timber', 0.8), blue = M(0x46679a, 'timber', 0.7), deckC = M(0xe9d6b8, 'timber', 0.85), dark = M(0x4a3426, 'timber', 0.6);
  const sail = M(0xb5543a, 'fabric', 0.95, { side: THREE.DoubleSide }), stripe = M(0xe9d6b8, 'fabric', 0.95, { side: THREE.DoubleSide });
  const mast = M(0x7b5a3e, 'timber', 0.8), rope = M(0xa58a5c, 'fabric', 0.95);
  const add = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); o.castShadow = true; g.add(o); return o; };
  // hull: lower half sphere, vertices drawn forward into a bow
  const hg = new THREE.SphereGeometry(0.1, 14, 7, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
  { const p = hg.attributes.position; for (let i = 0; i < p.count; i++) { let x = p.getX(i), y = p.getY(i), z = p.getZ(i); z = z > 0 ? z * 1.9 : z * 1.25; x *= 0.85 * (1 - Math.max(0, z) / 0.4); p.setXYZ(i, x, y * 0.8, z); } hg.computeVertexNormals(); }
  add(hg, hullC, 0, 0.082, 0);
  // gunwale band and deck
  const rim = new THREE.SphereGeometry(0.1, 14, 1, 0, Math.PI * 2, Math.PI / 2 - 0.12, 0.12);
  { const p = rim.attributes.position; for (let i = 0; i < p.count; i++) { let x = p.getX(i), z = p.getZ(i); z = z > 0 ? z * 1.9 : z * 1.25; x *= 0.85 * (1 - Math.max(0, z) / 0.4); p.setX(i, x * 1.06); p.setZ(i, z * 1.03); } rim.computeVertexNormals(); }
  add(rim, blue, 0, 0.07, 0);
  const deck = new THREE.CircleGeometry(0.1, 14); deck.rotateX(-Math.PI / 2);
  { const p = deck.attributes.position; for (let i = 0; i < p.count; i++) { let x = p.getX(i), z = p.getZ(i); z = z > 0 ? z * 1.9 : z * 1.25; x *= 0.85 * (1 - Math.max(0, z) / 0.4); p.setX(i, x * 0.96); p.setZ(i, z * 0.96); } }
  add(deck, deckC, 0, 0.088, 0);
  // flat foot so it stands
  add(new THREE.CylinderGeometry(0.035, 0.04, 0.03, 8), dark, 0, 0.015, 0.0).scale.set(0.7, 1, 1.8);
  // mast and a yard with a square lug sail
  add(new THREE.CylinderGeometry(0.011, 0.013, 0.33, 7), mast, 0, 0.25, 0.01);
  add(new THREE.CylinderGeometry(0.008, 0.008, 0.2, 6), mast, 0, 0.38, -0.01, Math.PI / 2 + 0.25, 0, 0);
  const sg = new THREE.PlaneGeometry(0.18, 0.22, 4, 4);
  { const p = sg.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); p.setZ(i, 0.03 * Math.cos(x / 0.18 * Math.PI) * Math.cos(y / 0.22 * Math.PI)); } sg.computeVertexNormals(); }
  add(sg, sail, 0.015, 0.26, -0.01, 0.12, Math.PI / 2, 0);
  add(new THREE.PlaneGeometry(0.18, 0.04), stripe, 0.032, 0.26, -0.01, 0.12, Math.PI / 2, 0);
  // pull string from the bow to a bead
  const pts = [new THREE.Vector3(0, 0.08, 0.2), new THREE.Vector3(0.02, 0.03, 0.25), new THREE.Vector3(0.06, 0.01, 0.24), new THREE.Vector3(0.1, 0.01, 0.18)];
  add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 10, 0.005, 4, false), rope);
  add(new THREE.SphereGeometry(0.02, 8, 6), mast, 0.11, 0.02, 0.17);
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
