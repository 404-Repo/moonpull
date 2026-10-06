  const lathe = (pts, sides, x, z, sx, sz, lean, mat, ry, amt) => {
    const geo = new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), sides);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const y = p.getY(i); p.setXYZ(i, p.getX(i) * sx + y * lean, y, p.getZ(i) * sz); }
    geo.rotateY(ry); const g2 = geo.toNonIndexed(); jitter(g2, amt, 0.0);
    const m = mesh(g2, mat, x, 0, z); rocks.push(m); return m;
  };
  // spire: brown footing, grey stacked upper with ledges
  lathe([[0, 0], [1.5, 0], [1.58, 0.45], [1.42, 1.05], [1.2, 1.3], [0.0, 1.32]], 7, 0.3, -0.5, 1.0, 0.85, 0.0, brown, 0.3, 0.16);
  lathe([[0, 1.0], [1.25, 1.0], [1.28, 1.6], [1.12, 2.25], [0.95, 2.4], [0.92, 2.9], [0.75, 3.1], [0.66, 3.55], [0.42, 3.95], [0.2, 4.12], [0, 4.18]], 7, 0.3, -0.5, 1.0, 0.92, -0.06, grey, 1.0, 0.2);
  // shoulders
  lathe([[0, 0], [0.85, 0], [0.9, 0.6], [0.7, 1.35], [0.3, 1.6], [0, 1.62]], 6, 1.4, -0.2, 1.0, 0.85, 0.08, brown, 0.5, 0.16);
  lathe([[0, 0.9], [0.62, 0.9], [0.66, 1.5], [0.5, 2.05], [0.2, 2.2], [0, 2.2]], 6, -0.6, -0.45, 1.0, 1.0, -0.05, grey, 0.2, 0.14);
  lathe([[0, 0], [0.95, 0], [0.95, 0.5], [0.6, 0.95], [0, 1.0]], 6, 0.6, -1.6, 1.0, 0.75, 0.0, brown, 0.9, 0.16);
  // the two low rocks in front: domed, with a step on top
  lathe([[0, 0], [1.15, 0], [1.2, 0.35], [1.05, 0.8], [0.6, 0.95], [0.55, 1.15], [0.25, 1.25], [0, 1.25]], 7, -1.9, 0.5, 1.0, 0.85, 0.0, brown, 0.6, 0.16);
  lathe([[0, 0], [0.9, 0], [0.92, 0.3], [0.75, 0.62], [0.4, 0.8], [0, 0.82]], 6, -0.2, 1.5, 1.0, 0.8, 0.0, brown, 2.0, 0.14);
  lathe([[0, 0.6], [0.45, 0.6], [0.42, 0.85], [0.2, 0.92], [0, 0.92]], 6, -0.2, 1.45, 1.0, 0.8, 0.0, grey, 1.0, 0.08);
