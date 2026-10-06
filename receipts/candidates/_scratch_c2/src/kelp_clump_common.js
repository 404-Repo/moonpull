  const stoneM = M(0x6c6a64, 'stone', 0.6);
  const kelpDk = M(0x4f5a2c, 'foliage', 0.75, { side: THREE.DoubleSide });
  const kelpOl = M(0x6f5c2b, 'foliage', 0.7, { side: THREE.DoubleSide });
  const wrack = M(0x5c6630, 'foliage', 0.7, { side: THREE.DoubleSide });
  const blad = M(0x7b8442, 'foliage', 0.65);
  // stone, approximated as an ellipsoid for draping: centre y = S.cy, radii a (x), b (y), c (z)
  const S = { a: 0.44, b: 0.3, c: 0.36, cy: 0.13, x: 0.18 };
  const surf = (x, z) => { const q = 1 - ((x - S.x) / S.a) ** 2 - (z / S.c) ** 2; return q > 0 ? S.cy + S.b * Math.sqrt(q) : 0; };
  // drape path from a start point on the stone, heading horizontally along ang
  const drape = (x0, z0, ang, reach, lift, n = 10, wig = 0.08) => {
    const pts = []; const dx = Math.cos(ang), dz = Math.sin(ang), lx = -dz, lz = dx; const ph = rr(0, 6);
    for (let k = 0; k <= n; k++) {
      const t = k / n, x = x0 + dx * reach * t + lx * Math.sin(t * 4 + ph) * wig * t, z = z0 + dz * reach * t + lz * Math.sin(t * 4 + ph) * wig * t;
      const y = Math.max(surf(x, z), 0) + 0.025 + lift * Math.sin(Math.PI * Math.min(t * 2.2, 1)) * (1 - t * 0.5) + (t > 0.9 ? (t - 0.9) * 0.4 : 0);
      pts.push(new THREE.Vector3(x, y, z));
    }
    return pts;
  };
  // flat ribbon along a path: width tapers, twists a little; one quad per segment
  const ribbon = (pts, w0, w1, twist = 0.6) => {
    const pos = [], idx = [], up = new THREE.Vector3(0, 1, 0), T = new THREE.Vector3(), Sd = new THREE.Vector3(), Nn = new THREE.Vector3();
    pts.forEach((p, k) => {
      const a = pts[Math.max(k - 1, 0)], b = pts[Math.min(k + 1, pts.length - 1)]; T.subVectors(b, a).normalize();
      Sd.crossVectors(T, up).normalize(); Nn.crossVectors(Sd, T).normalize();
      const t = k / (pts.length - 1), w = (w0 + (w1 - w0) * t) * (t > 0.92 ? 0.6 : 1) / 2, th = Math.sin(t * 3) * twist;
      const side = Sd.clone().multiplyScalar(Math.cos(th)).addScaledVector(Nn, Math.sin(th));
      pos.push(p.x + side.x * w, p.y + side.y * w, p.z + side.z * w, p.x - side.x * w, p.y - side.y * w, p.z - side.z * w);
      if (k) { const i = k * 2; idx.push(i - 2, i - 1, i, i - 1, i + 1, i); }
    });
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals(); return geo;
  };
  // bladderwrack: a forked stem with paired oval bladders, standing from a point on the stone
  const bladGeo = new THREE.OctahedronGeometry(1, 0);
  const wrackFrond = (x, z, ang, len, tiltOut) => {
    const base = new THREE.Group(); base.position.set(x, surf(x, z) - 0.02, z); base.rotation.order = 'YXZ'; base.rotation.y = ang; base.rotation.x = tiltOut; g.add(base);
    const branch = (parent, l, depth, spread) => {
      const st = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.016, l, 4, 1), wrack); st.position.y = l / 2; parent.add(st);
      const tip = new THREE.Group(); tip.position.y = l; parent.add(tip);
      for (const f of [0.35, 0.7]) for (const sd of [-1, 1]) { const b = new THREE.Mesh(bladGeo, blad); b.scale.set(0.026, 0.042, 0.022).multiplyScalar(rr(0.9, 1.3)); b.position.set(sd * 0.03, l * f, 0); b.rotation.z = -sd * 0.6; parent.add(b); }
      if (depth > 0) for (const sd of [-1, 1]) { const c = new THREE.Group(); c.rotation.z = sd * spread; c.rotation.x = rr(-0.3, 0.3); tip.add(c); branch(c, l * 0.72, depth - 1, spread * 0.9); }
      else { const b = new THREE.Mesh(bladGeo, blad); b.scale.set(0.028, 0.04, 0.024); b.position.y = 0.02; tip.add(b); }
    };
    branch(base, len, 1, 0.55);
  };
