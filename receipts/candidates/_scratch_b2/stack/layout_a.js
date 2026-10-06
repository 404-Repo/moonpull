  const rock = (x, y, z, hx, hy, hz, mat, ry = 0, rz = 0, amt = 0.22) => {
    const geo = new THREE.IcosahedronGeometry(1, 1); geo.scale(hx, hy, hz);
    jitter(geo, amt * Math.min(hx, hy, hz) * 1.6, -y); const m = mesh(geo, mat, x, y, z, 0, ry, rz); rocks.push(m); return m;
  };
  rock(0.3, 0.85, -0.5, 1.25, 0.95, 1.05, brown, 0.4);
  rock(0.15, 1.95, -0.55, 0.95, 0.85, 0.85, grey, 1.1, 0.06);
  rock(0.05, 3.1, -0.5, 0.62, 1.0, 0.6, grey, 0.3, -0.05);
  rock(1.35, 0.8, -0.2, 0.8, 0.85, 0.75, brown, 0.9);
  rock(-0.6, 1.4, -0.4, 0.62, 0.75, 0.62, grey, 2.0, 0.1);
  rock(0.6, 0.5, -1.6, 0.95, 0.55, 0.7, brown, 0.2);
  rock(-1.9, 0.55, 0.5, 1.1, 0.62, 0.95, brown, 0.6);
  rock(-1.8, 1.0, 0.4, 0.55, 0.32, 0.5, grey, 1.3);
  rock(-0.2, 0.4, 1.5, 0.85, 0.45, 0.7, brown, 2.4);
  rock(-0.15, 0.78, 1.45, 0.5, 0.2, 0.42, grey, 0.4);
