// rope post B: lathe profile. One lathe with a domed crown, slight waist and ragged foot, its rim pushed in along grain grooves; a two-turn helix rope, extruded kelp leaves, lathed barnacles with pits.
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
  const prof = [V(0, 0, 0), V(R * 1.02, 0, 0), V(R * 1.04, 0.15, 0), V(R, 0.45, 0), V(R * 0.98, 0.75, 0), V(R, 0.98, 0), V(R * 0.92, 1.05, 0), V(R * 0.6, 1.09, 0), V(0, H, 0)].map((p) => new THREE.Vector2(p.x, p.y));
  const SEG = 24, lg = new THREE.LatheGeometry(prof, SEG), pp = lg.attributes.position;
  for (let i = 0; i < pp.count; i++) {
    const x = pp.getX(i), y = pp.getY(i), z = pp.getZ(i), r = Math.hypot(x, z); if (r < 1e-4) continue;
    const a = Math.atan2(x, z), seg = Math.round(((a + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2) * SEG) % SEG;
    let k = 1; if (seg % 3 === 0 && y > 0.02 && y < 1.06) k = 0.9; if (y === 0) k *= 0.9 + 0.1 * ((seg * 7) % 3) / 2;
    pp.setXYZ(i, x * k, y, z * k);
  }
  lg.computeVertexNormals();
  add(lg, wood);
  // wet foot band: a short lathe shell
  const wp = [V(R * 1.06, 0, 0), V(R * 1.06, 0.32, 0), V(R * 1.0, 0.36, 0)].map((p) => new THREE.Vector2(p.x, p.y));
  add(new THREE.LatheGeometry(wp, 18), wet);
  // kelp: extruded leaf shapes standing round the foot
  const leaf = (h, w) => { const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.quadraticCurveTo(-w * 0.9, h * 0.5, 0, h); s.quadraticCurveTo(w * 0.7, h * 0.55, w / 2, 0); s.closePath(); const e = new THREE.ExtrudeGeometry(s, { depth: 0.012, bevelEnabled: false, curveSegments: 4 }); e.translate(0, 0, -0.006); return e; };
  for (let k = 0; k < 11; k++) { const a = (k / 11) * Math.PI * 2 + (k % 2) * 0.25, h = 0.17 + (k % 4) * 0.05; const p = new THREE.Group(); p.rotation.y = a; g.add(p); const l = new THREE.Mesh(leaf(h, 0.06), kelp); l.position.set(0, 0.16, R * 1.06 + 0.008); l.rotation.x = 0.15 + (k % 3) * 0.05; l.rotation.z = (k % 2 ? 1 : -1) * 0.15; p.add(l); }
  // barnacles: lathe cone with a pit
  const bp = [V(0.027, 0, 0), V(0.014, 0.03, 0), V(0.008, 0.03, 0), V(0.006, 0.012, 0)].map((p) => new THREE.Vector2(p.x, p.y));
  const bg = new THREE.LatheGeometry(bp, 7);
  for (let k = 0; k < 16; k++) { const a = k * 0.83, y = 0.04 + ((k * 7) % 7) * 0.04, r0 = R * 1.05; const b = new THREE.Mesh(bg, barn); b.position.set(Math.sin(a) * r0, y, Math.cos(a) * r0); b.quaternion.setFromUnitVectors(V(0, 1, 0), V(Math.sin(a), 0, Math.cos(a))); b.scale.setScalar(0.9 + (k % 3) * 0.2); g.add(b); }
  barn.side = THREE.DoubleSide;
  // rope: a two-turn helix round the post
  const hp = []; for (let i = 0; i <= 40; i++) { const t = i / 40, a = t * Math.PI * 4 + 0.3; hp.push(V(Math.sin(a) * (R + 0.02), 0.79 + t * 0.07, Math.cos(a) * (R + 0.02))); }
  add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(hp), 48, 0.024, 5, false), rope);
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
