// windswept_pine B (sweeps): same tube skeleton; each needle tier is a LatheGeometry mushroom cap
// (flat top, rolled drooping edge) jittered and squashed oval, tiers stacked and shrinking; the
// rock base is a set of low extruded slabs with chunky bevels.
  trunkAndBranches();
  roots();
  const capProf = [V(0.001, 0.22, 0), V(0.55, 0.2, 0), V(0.9, 0.08, 0), V(1.0, -0.06, 0), V(0.85, -0.16, 0), V(0.4, -0.1, 0), V(0.001, -0.08, 0)].map((p) => new THREE.Vector2(p.x, p.y));
  for (const pd of PADS) {
    for (let L = 0; L < pd.n; L++) {
      const rL = pd.r * (1 - L * 0.3), y = pd.c.y + L * 0.24;
      const geo = new THREE.LatheGeometry(capProf, 12); geo.scale(rL, 1.1, rL * rr(0.75, 0.95));
      const ng = jitter(geo.toNonIndexed(), 0.12);
      const top = L === pd.n - 1;
      mesh(ng, top ? needleHi : needle, pd.c.x + rr(-0.08, 0.08), y, pd.c.z + rr(-0.08, 0.08), 0, rr(0, 6), 0);
    }
  }
  for (const [x, z, w, h, d, ry] of [[-0.6, 0.35, 1.0, 0.75, 0.9, 0.3], [0.55, 0.4, 0.95, 0.6, 0.8, -0.4], [0.1, -0.6, 1.2, 0.85, 0.8, 0.1], [-0.95, -0.5, 0.7, 0.45, 0.6, 0.8], [1.1, -0.35, 0.65, 0.4, 0.6, 0.5], [0.0, 0.95, 0.7, 0.35, 0.5, 0.2]]) {
    const pts = []; for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; pts.push(new THREE.Vector2(Math.cos(a) * w / 2 * rr(0.8, 1.1), Math.sin(a) * d / 2 * rr(0.8, 1.1))); }
    const geo = new THREE.ExtrudeGeometry(new THREE.Shape(pts), { depth: h - 0.24, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.1, bevelSegments: 1 });
    geo.rotateX(-Math.PI / 2); geo.translate(0, 0.12, 0); jitter(geo, 0.06, 0); mesh(geo, rockM, x, 0, z, 0, ry, 0);
    mesh(new THREE.SphereGeometry(0.5, 6, 2, 0, Math.PI * 2, 0, Math.PI / 2), moss, x, h - 0.04, z, 0, ry, 0).scale.set(w * 0.6, 0.14, d * 0.5);
  }
