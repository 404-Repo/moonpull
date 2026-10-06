// windswept_pine A (primitives): tapered-tube trunk and branches; each needle pad is two or three
// stacked rings of flattened faceted icosahedra (dark under, light on top); base rocks are
// jittered bevelled boxes with moss caps.
  trunkAndBranches();
  roots();
  const blobGeo = new THREE.IcosahedronGeometry(1, 0);
  for (const pd of PADS) {
    for (let L = 0; L < pd.n; L++) {
      const rL = pd.r * (1 - L * 0.28), y = pd.c.y + L * 0.22, k = L === pd.n - 1 ? 1 : 0, cnt = Math.max(4, Math.round(rL * 7));
      mesh(blobGeo, k ? needleHi : needle, pd.c.x, y, pd.c.z).scale.set(rL * 0.55, 0.2, rL * 0.55);
      for (let i = 0; i < cnt; i++) { const a = (i / cnt) * Math.PI * 2 + rr(-0.2, 0.2), d = rL * rr(0.55, 0.7); const b = mesh(blobGeo, k ? needleHi : needle, pd.c.x + Math.cos(a) * d, y + rr(-0.05, 0.05) - 0.03, pd.c.z + Math.sin(a) * d, 0, -a, 0); b.scale.set(rL * 0.42, 0.17, rL * 0.3); }
    }
  }
  // rocks
  for (const [x, z, w, h, d, ry] of [[-0.6, 0.35, 1.0, 0.75, 0.9, 0.3], [0.55, 0.4, 0.95, 0.6, 0.8, -0.4], [0.1, -0.6, 1.2, 0.85, 0.8, 0.1], [-0.95, -0.5, 0.7, 0.45, 0.6, 0.8], [1.1, -0.35, 0.65, 0.4, 0.6, 0.5], [0.0, 0.95, 0.7, 0.35, 0.5, 0.2]]) {
    const geo = jitter(rbox(w, h, d, 0.1, 1).toNonIndexed(), 0.08); mesh(geo, rockM, x, h / 2, z, 0, ry, 0);
    mesh(new THREE.SphereGeometry(0.5, 6, 2, 0, Math.PI * 2, 0, Math.PI / 2), moss, x + rr(-0.1, 0.1), h - 0.04, z + rr(-0.1, 0.1), 0, ry, 0).scale.set(w * 0.7, 0.15, d * 0.6);
  }
