// shrub_clump A (primitives): each gorse mound is a cluster of faceted icosahedron lumps piled into
// a dome (dark inner, lighter outer), yellow octahedron flower dots raycast onto the lumps.
  const lump = new THREE.IcosahedronGeometry(1, 0);
  for (const [x, z, r, h] of MOUNDS) {
    const core = mesh(lump, gorseDk, x, h * 0.42, z); core.scale.set(r * 0.85, h * 0.42, r * 0.85); bushes.push(core);
    const n = Math.round(r * 22);
    for (let i = 0; i < n; i++) { const a = rr(0, 6.28), el = rr(-0.1, 1.2), rad = r * rr(0.25, 0.4);
      const px = x + Math.cos(a) * Math.cos(el) * r * 0.7, py = h * 0.42 + Math.sin(el) * h * 0.45, pz = z + Math.sin(a) * Math.cos(el) * r * 0.7;
      const m = mesh(lump, rnd() < 0.7 ? gorse : gorseDk, px, Math.max(py, rad * 0.6), pz, rr(0, 6), rr(0, 6), 0); m.scale.setScalar(rad); bushes.push(m); }
  }
  flowers(90);
