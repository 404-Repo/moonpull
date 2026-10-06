  // chamfered prism: rows remapped so the top edge has a real bevel
  const prism = (rb, rt, h, sides, ch, x, y, z, rx, ry, rz, mat, sz = 1, amt = 0.12) => {
    const geo = new THREE.CylinderGeometry(rt, rb, h, sides, 2);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      let px = p.getX(i), py = p.getY(i), pz = p.getZ(i);
      if (Math.abs(py) < 1e-4) { py = h / 2 - ch; const k = (rt + (rb - rt) * (ch / h)) / ((rt + rb) / 2); px *= k; pz *= k; }
      else if (py > 0) { const k = Math.max(rt - ch, 0.05) / Math.max(rt, 1e-4); px *= k; pz *= k; }
      p.setXYZ(i, px, py + h / 2, pz * sz);
    }
    const g2 = geo.toNonIndexed(); jitter(g2, amt, 0.0);
    const m = mesh(g2, mat, x, y, z, rx, ry, rz); rocks.push(m); return m;
  };
  // spire stack: wide footing, three cleaved blocks each on its own bedding plane, blunt crown
  prism(1.5, 1.35, 1.25, 6, 0.2, 0.3, -0.05, -0.5, 0.0, 0.3, 0.03, brown, 0.85, 0.16);
  prism(1.25, 1.1, 1.15, 6, 0.18, 0.2, 1.05, -0.5, 0.06, 1.0, -0.06, grey, 0.9, 0.18);
  prism(1.0, 0.82, 1.0, 5, 0.16, 0.05, 2.1, -0.5, -0.05, 0.4, 0.08, grey, 0.95, 0.16);
  prism(0.78, 0.3, 1.2, 5, 0.1, -0.05, 2.95, -0.48, 0.04, 1.5, -0.06, grey, 1.0, 0.16);
  // a cleaved slab leaning on the right flank, as in the ref
  prism(0.6, 0.42, 1.5, 5, 0.12, 1.05, 1.0, -0.2, 0, 0.7, -0.22, grey, 0.8, 0.12);
  // shoulders and back block
  prism(0.85, 0.65, 1.55, 5, 0.14, 1.4, -0.05, -0.25, 0, 0.2, 0.1, brown, 0.9, 0.14);
  prism(0.6, 0.45, 0.9, 5, 0.12, -0.6, 1.0, -0.4, 0, 0.9, -0.12, grey, 1.0, 0.1);
  prism(0.65, 0.55, 1.0, 6, 0.12, -0.55, -0.05, -0.4, 0, 0.5, 0, brown, 1.0, 0.12);
  prism(1.0, 0.75, 0.95, 6, 0.16, 0.6, -0.05, -1.55, 0, 0.1, 0, brown, 0.75, 0.14);
  // low rocks in front
  prism(1.15, 0.95, 0.85, 6, 0.2, -1.9, -0.05, 0.5, 0, 0.6, 0, brown, 0.85, 0.16);
  prism(0.6, 0.45, 0.45, 5, 0.12, -1.8, 0.72, 0.4, 0.06, 0.2, 0.05, grey, 0.9, 0.08);
  prism(0.9, 0.7, 0.7, 6, 0.18, -0.2, -0.05, 1.5, 0, 1.9, 0, brown, 0.8, 0.14);
