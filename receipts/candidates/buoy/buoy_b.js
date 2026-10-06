// buoy_b: swept profiles. One LatheGeometry profile (flat seat, full belly, shoulder rising
// into a collar) is cut into eight gores with phiStart/phiLength, gores meeting edge to edge;
// Lathe cap and bung, iron ring on a shackle, a rope lashed
// round the collar that drops down the side and lies in a loose loop, extruded kelp fronds.
export default function (THREE) {
  const g = new THREE.Group();
  const mk = (hex, name, r = 0.85, extra = {}) => { const q = new THREE.MeshStandardMaterial({ color: hex, roughness: r, ...extra }); if (name) q.name = name; return q; };
  const red = mk(0xb5543a, 'plaster', 0.8), white = mk(0xe9d6b8, 'plaster', 0.85);
  const wood = mk(0x7b5a3e, 'timber', 0.85), iron = mk(0x3a3d40, 'metal', 0.7, { metalness: 0.3 });
  const hemp = mk(0xa58a5c, 'fabric', 0.95), kelp = mk(0x4f5a2c, 'foliage', 0.8, { side: THREE.DoubleSide });
  const barn = mk(0xd9cfb6, 'stone', 0.9);

  // profile (r, y): widest at y = 0.3
  const prof = [[0.0, 0.0], [0.1, 0.0], [0.16, 0.012], [0.225, 0.05], [0.275, 0.12], [0.303, 0.21], [0.31, 0.3], [0.302, 0.39], [0.275, 0.47], [0.225, 0.54], [0.16, 0.6], [0.11, 0.625], [0.0, 0.628]];
  const WY = 0.3, N = 8;
  for (let i = 0; i < N; i++) {
    const k = 1;
    const pts = prof.map(([r, y]) => new THREE.Vector2(r * k, y));
    g.add(new THREE.Mesh(new THREE.LatheGeometry(pts, 3, (i / N) * Math.PI * 2, (Math.PI * 2) / N), i % 2 ? white : red));
  }
  const capP = [[0, 0.6], [0.125, 0.6], [0.13, 0.63], [0.125, 0.66], [0.105, 0.675], [0.09, 0.69], [0.0, 0.69]].map(([r, y]) => new THREE.Vector2(r, y));
  g.add(new THREE.Mesh(new THREE.LatheGeometry(capP, 10), wood));
  // shackle staple and ring
  const st = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.014, 5, 8, Math.PI), iron); st.rotation.y = Math.PI / 2; st.position.y = 0.69; g.add(st);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.02, 5, 10), iron); ring.position.set(0, 0.79 - 0.065 - 0.02 + 0.01, 0); ring.rotation.z = 0.25; g.add(ring);

  // rope lashing round the collar
  const lash = new THREE.Mesh(new THREE.TorusGeometry(0.135, 0.022, 4, 14), hemp); lash.rotation.x = Math.PI / 2; lash.position.y = 0.615; g.add(lash);
  const P = (x, y, z) => new THREE.Vector3(x, y, z);
  const rope = new THREE.CatmullRomCurve3([P(0.13, 0.62, 0.05), P(0.2, 0.57, 0.12), P(0.26, 0.47, 0.16), P(0.29, 0.33, 0.17), P(0.27, 0.18, 0.19),
    P(0.25, 0.06, 0.26), P(0.3, 0.023, 0.38), P(0.46, 0.023, 0.44), P(0.56, 0.023, 0.34), P(0.48, 0.023, 0.24), P(0.4, 0.023, 0.3)]);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(rope, 30, 0.023, 5, false), hemp));
  const knot = new THREE.Mesh(new THREE.SphereGeometry(0.036, 6, 4), hemp); knot.position.set(0.14, 0.615, 0.06); g.add(knot);
  // kelp fronds: extruded leaf outline
  const leaf = new THREE.Shape(); leaf.moveTo(0, 0); leaf.quadraticCurveTo(0.05, -0.06, 0.02, -0.2); leaf.quadraticCurveTo(-0.01, -0.12, -0.025, -0.05); leaf.lineTo(0, 0);
  const lg = new THREE.ShapeGeometry(leaf, 3);
  for (const [t, a] of [[0.12, 0.2], [0.18, -0.5], [0.3, 0.4], [0.36, -0.2]]) {
    const p = rope.getPoint(t); const f = new THREE.Mesh(lg, kelp); f.position.set(p.x + 0.02, p.y, p.z + 0.02); f.rotation.set(0.2, 0.9 + a, a); g.add(f);
  }
  // barnacles: little volcano lathes, clustered low on the front-left
  const bp = [[0.026, 0], [0.024, 0.02], [0.016, 0.04], [0.009, 0.04], [0.008, 0.03]].map(([r, y]) => new THREE.Vector2(r, y));
  const bg = new THREE.LatheGeometry(bp, 5);
  const up = new THREE.Vector3(0, 1, 0);
  const surf = (y) => { for (let i = 1; i < prof.length; i++) if (prof[i][1] >= y) { const [r0, y0] = prof[i - 1], [r1, y1] = prof[i]; return r0 + (r1 - r0) * (y - y0) / (y1 - y0); } return 0; };
  for (let k = 0; k < 8; k++) {
    const y = 0.07 + (k % 4) * 0.035 + ((k * 13) % 5) * 0.004, a = -0.7 + Math.floor(k / 4) * 0.2 + (k % 2) * 0.07;
    const r = surf(y), n = new THREE.Vector3(Math.sin(a), (surf(y - 0.01) - surf(y + 0.01)) / 0.02, Math.cos(a)).normalize();
    const b = new THREE.Mesh(bg, barn); b.position.set(Math.sin(a) * r, y, Math.cos(a) * r); b.quaternion.setFromUnitVectors(up, n); g.add(b);
  }

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
  g.userData.waterline = WY - box.min.y;
  return g;
}
