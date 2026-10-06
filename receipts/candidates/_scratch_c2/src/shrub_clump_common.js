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
