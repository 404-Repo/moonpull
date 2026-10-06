  const sand = M(0xc6a888, 'stone', 0.88);
  const sandDk = M(0xa98a6a, 'stone', 0.85);
  const wet = M(0x6e6a55, 'stone', 0.6);
  const kelp = M(0x4f5a2c, 'foliage', 0.8, { side: THREE.DoubleSide });
  const cream = M(0xd9cfb6, 'stone', 0.85, { side: THREE.DoubleSide });
  const water = M(0x3f8290, null, 0.15, { metalness: 0.0 });
  const rocks = [];
  // layout shared by all three: main rock with the pool, a back rock, a small front rock
  const R = { main: { x: -0.35, z: 0.15, rx: 1.15, rz: 1.1, h: 2.2 }, back: { x: 0.85, z: -0.75, rx: 0.95, rz: 0.85, h: 1.9 }, front: { x: 1.15, z: 0.75, rx: 0.72, rz: 0.62, h: 1.15 } };
  const dress = () => {
    g.updateMatrixWorld(true);
    const shoot = (r, ang, y) => hitOn(rocks, new THREE.Vector3(r.x + Math.cos(ang) * 6, y, r.z + Math.sin(ang) * 6), new THREE.Vector3(-Math.cos(ang), 0, -Math.sin(ang)));
    const barnGeo = new THREE.CylinderGeometry(0.035, 0.065, 0.07, 5, 1, true);
    const barn = (s, n) => { if (!s) return; for (let i = 0; i < n; i++) { const t = new THREE.Vector3(rr(-1, 1), rr(-1, 1), rr(-1, 1)).cross(s.n).normalize().multiplyScalar(rr(0.04, 0.2)); onSurface({ p: s.p.clone().add(t), n: s.n }, barnGeo, cream, 0.015).scale.setScalar(rr(0.8, 1.5)); } };
    const patch = (s, w, d) => { if (!s) return; const m = onSurface(s, new THREE.SphereGeometry(0.5, 6, 2, 0, Math.PI * 2, 0, Math.PI / 2), kelp, -0.04, rr(0, 6)); m.scale.set(w, 0.12, d); };
    const frond = (len, w) => { const geo = new THREE.PlaneGeometry(w, len, 1, 5); const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i) + len / 2, t = y / len; p.setXYZ(i, p.getX(i) * (1 - t * 0.55) + Math.sin(t * 5) * 0.05, y, t * t * len * 0.4); } geo.computeVertexNormals(); return geo; };
    for (const k of ['main', 'back', 'front']) {
      const r = R[k], n = k === 'front' ? 4 : 5;
      for (let i = 0; i < n; i++) barn(shoot(r, rr(0, Math.PI * 2), rr(0.12, 0.6)), 3 + Math.floor(rr(0, 3)));
      for (let i = 0; i < n * 0.8; i++) { const s = shoot(r, rr(0, Math.PI * 2), rr(0.45, 0.95)); patch(s, rr(0.35, 0.6), rr(0.25, 0.45)); }
      for (let i = 0; i < (k === 'front' ? 3 : 5); i++) {
        const a = rr(0, Math.PI * 2), s = shoot(r, a, 0.2); if (!s) continue;
        for (let j = 0; j < 3; j++) { const m = mesh(frond(rr(0.5, 0.9), rr(0.08, 0.13)), kelp, s.p.x + s.n.x * 0.05 + rr(-0.1, 0.1), 0, s.p.z + s.n.z * 0.05 + rr(-0.1, 0.1), 0, 0, 0); m.rotation.order = 'YXZ'; m.rotation.y = Math.atan2(s.n.x, s.n.z) + rr(-0.6, 0.6); m.rotation.x = rr(-0.15, 0.1); }
      }
    }
  };
