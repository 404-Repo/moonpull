// rope post A: primitives. Cylinder post with a half-sphere crown, proud grain ridges, two torus rope wraps and a tube tail, flattened-cone kelp blades and cone barnacles round the foot.
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
  add(new THREE.CylinderGeometry(R, R * 1.04, 1.03, 14), wood, 0, 1.03 / 2, 0);
  const cap = new THREE.SphereGeometry(R, 14, 4, 0, Math.PI * 2, 0, Math.PI / 2); cap.scale(1, 0.7, 1); add(cap, wood, 0, 1.03, 0);
  // grain ridges
  for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2 + 0.2, h = 0.3 + ((k * 37) % 5) * 0.08, y = 0.45 + ((k * 13) % 4) * 0.08; const r = new THREE.Mesh(new THREE.BoxGeometry(0.04, Math.min(h, 1.0 - y + 0.4), 0.02), k % 2 ? drift : wet); r.position.set(Math.sin(a) * (R - 0.004), Math.min(y, 1.0 - r.geometry.parameters.height / 2), Math.cos(a) * (R - 0.004)); r.rotation.y = a; g.add(r); }
  // wet foot
  add(new THREE.CylinderGeometry(R * 1.05, R * 1.08, 0.34, 14), wet, 0, 0.17, 0);
  // kelp blades
  for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2 + (k % 3) * 0.2, h = 0.16 + (k % 4) * 0.05; const b = new THREE.Mesh(new THREE.ConeGeometry(0.035, h, 4), kelp); b.scale.set(1, 1, 0.35); b.position.set(Math.sin(a) * (R + 0.012), 0.2 + h / 2, Math.cos(a) * (R + 0.012)); b.rotation.y = a; b.rotation.x = 0.12; const p = new THREE.Group(); g.add(p); p.add(b); }
  // moss lumps
  for (let k = 0; k < 9; k++) { const a = (k / 9) * Math.PI * 2; add(new THREE.SphereGeometry(0.04, 6, 4), kelp, Math.sin(a) * R, 0.06 + (k % 3) * 0.08, Math.cos(a) * R).scale.set(1, 0.7, 0.6); }
  for (let k = 0; k < 16; k++) barnacle((k / 16) * Math.PI * 2 * 1.3 + k * 0.4, 0.05 + ((k * 7) % 6) * 0.045, R * 1.06, 0.9 + (k % 3) * 0.2);
  // rope: double wrap
  for (const y of [0.8, 0.855]) { const t = new THREE.TorusGeometry(R + 0.018, 0.024, 5, 18); t.rotateX(Math.PI / 2); add(t, rope, 0, y, 0); }
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
