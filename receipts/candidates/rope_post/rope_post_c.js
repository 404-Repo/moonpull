// rope post C: a hewn reading. Octagonal adzed post with a chamfered crown, dark tide-soaked lower third, a ragged kelp skirt (open cylinder with a torn top edge), barnacle clusters, two rope turns finished with a knot.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, r = 0.85, side) => { const x = new THREE.MeshStandardMaterial({ color, roughness: r, side: side || THREE.FrontSide }); if (name) x.name = name; return x; };
  const wood = M(0x7b5a3e, 'timber'), drift = M(0xb79773, 'timber', 0.9), wet = M(0x4a3426, 'timber', 0.55), kelp = M(0x4f5a2c, 'foliage', 0.75, THREE.DoubleSide), barn = M(0xd9cfb6, 'stone', 0.9), rope = M(0xa58a5c, 'fabric', 0.95);
  const H = 1.1, R = 0.11;
  const add = (geo, mat, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); g.add(o); return o; };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  // the hanging tail: drops from the wraps down the right side, swings out toward the front at the bottom
  const tail = () => { const c = new THREE.CatmullRomCurve3([V(R + 0.01, 0.84, 0.04), V(R + 0.035, 0.76, 0.06), V(R + 0.045, 0.6, 0.09), V(R + 0.04, 0.45, 0.12), V(R + 0.03, 0.32, 0.15), V(R + 0.01, 0.24, 0.19), V(R + 0.02, 0.29, 0.23)]); add(new THREE.TubeGeometry(c, 24, 0.022, 5, false), rope); add(new THREE.SphereGeometry(0.03, 6, 4), rope, R + 0.02, 0.29, 0.23); };
  // barnacles: little truncated cones set into the surface, opening outward
  const barnacle = (a, y, r0, s = 1) => { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.012 * s, 0.026 * s, 0.028 * s, 6), barn); b.position.set(Math.sin(a) * r0, y, Math.cos(a) * r0); b.quaternion.setFromUnitVectors(V(0, 1, 0), V(Math.sin(a), 0, Math.cos(a))); g.add(b); };
  add(new THREE.CylinderGeometry(R, R, 0.98, 8), wood, 0, 0.49, 0).rotation.y = Math.PI / 8;
  // rounded crown: an octagonal dome with a weathered, lighter top
  const cap = new THREE.SphereGeometry(R, 8, 4, Math.PI / 8, Math.PI * 2, 0, Math.PI / 2); cap.scale(1, 1.1, 1); add(cap, wood, 0, 0.98, 0);
  const top = new THREE.SphereGeometry(R * 0.62, 8, 2, Math.PI / 8, Math.PI * 2, 0, Math.PI / 2); top.scale(1, 0.5, 1); add(top, drift, 0, 1.03, 0);
  // adze facets: shallow raised planks on alternate faces
  for (let k = 0; k < 8; k += 2) { const a = (k / 8) * Math.PI * 2 + Math.PI / 8 + Math.PI / 8; const r = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.4, 0.02), drift); r.position.set(Math.sin(a) * (R * 0.92), 0.6 + (k % 4) * 0.05, Math.cos(a) * (R * 0.92)); r.rotation.y = a; g.add(r); }
  add(new THREE.CylinderGeometry(R * 1.05, R * 1.08, 0.38, 8), wet, 0, 0.19, 0).rotation.y = Math.PI / 8;
  // kelp skirt with a torn top
  const sk = new THREE.CylinderGeometry(R * 1.12, R * 1.14, 0.3, 16, 2, true), sp = sk.attributes.position;
  for (let i = 0; i < sp.count; i++) { if (sp.getY(i) > 0.1) { const a = Math.atan2(sp.getX(i), sp.getZ(i)); sp.setY(i, 0.15 + 0.07 * Math.sin(a * 5) + 0.05 * Math.sin(a * 11 + 1)); } }
  sk.computeVertexNormals(); add(sk, kelp, 0, 0.17, 0);
  for (let k = 0; k < 6; k++) { const a = k * 1.1; const b = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.18, 4), kelp); b.scale.set(1, 1, 0.35); b.position.set(Math.sin(a) * R * 1.15, 0.38, Math.cos(a) * R * 1.15); b.rotation.y = a; g.add(b); }
  // barnacle clusters of three
  for (let k = 0; k < 6; k++) { const a = k * 1.05 + 0.4, y = 0.08 + (k % 3) * 0.09; barnacle(a, y, R * 1.15, 1.1); barnacle(a + 0.3, y + 0.03, R * 1.15, 0.85); barnacle(a + 0.12, y - 0.04, R * 1.15, 0.9); }
  // rope turns and knot
  for (const y of [0.8, 0.855]) { const t = new THREE.TorusGeometry(R + 0.02, 0.024, 5, 16); t.rotateX(Math.PI / 2); add(t, rope, 0, y, 0); }
  add(new THREE.SphereGeometry(0.042, 7, 5), rope, 0.105, 0.83, 0.04);
  tail();
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
