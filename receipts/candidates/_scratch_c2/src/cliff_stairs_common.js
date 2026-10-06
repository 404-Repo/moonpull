  const step = M(0x6c6a64, 'stone', 0.8);
  const stepLt = M(0x85827a, 'stone', 0.85);
  const rock = M(0xc6a888, 'stone', 0.88);
  const rockDk = M(0x8e8170, 'stone', 0.85);
  const moss = M(0x4f5a2c, 'foliage', 0.9);
  const wood = M(0x7b5a3e, 'timber', 0.85);
  // walk plan (rises toward -Z): flight 1 = 9 steps over z +4.5..+0.75, landing z +0.75..-0.75 at 2.5 m,
  // flight 2 = 10 steps over z -0.75..-4.5 up to 5.0 m. Tops are exact; nothing jitters a tread.
  const W = 1.8, HW = W / 2;
  const STEPS = [];
  for (let i = 0; i < 9; i++) STEPS.push({ z0: 4.5 - i * (3.75 / 9), z1: 4.5 - (i + 1) * (3.75 / 9), top: 0.25 * (i + 1) });
  const LANDING = { z0: 0.75, z1: -0.75, top: 2.5 };
  for (let i = 0; i < 10; i++) STEPS.push({ z0: -0.75 - i * 0.375, z1: -0.75 - (i + 1) * 0.375, top: 2.5 + 0.25 * (i + 1) });
  const topAt = (z) => { if (z <= LANDING.z0 && z >= LANDING.z1) return LANDING.top; for (const s of STEPS) if (z <= s.z0 && z >= s.z1) return s.top; return z > 0 ? 0 : 5; };
  // handrail on the +x side: posts at edges of the walk, rails follow the pitch line
  const beam = (a, b, t, mat) => { const len = a.distanceTo(b); const m = mesh(new THREE.BoxGeometry(t, t, len + t * 0.5), mat, (a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2); m.lookAt(b.x, b.y, b.z); return m; };
  const rail = (x) => {
    const PZ = [4.3, 2.95, 1.6, 0.6, -0.6, -1.7, -2.85, -4.3];
    const H = 0.95, base = (z) => topAt(z);
    for (const z of PZ) mesh(new THREE.BoxGeometry(0.13, H + 0.12, 0.13), wood, x, base(z) + (H + 0.12) / 2 - 0.02, z);
    for (let i = 0; i < PZ.length - 1; i++) {
      const a = PZ[i], b = PZ[i + 1];
      // pitch line: smooth line between post tops
      const A = new THREE.Vector3(x, base(a) + H, a), B = new THREE.Vector3(x, base(b) + H, b);
      beam(A, B, 0.09, wood);
      beam(A.clone().setY(A.y - 0.45), B.clone().setY(B.y - 0.45), 0.06, wood);
    }
  };
  // rock courses: faceted boulders stacked up to height h at (x, z), wider at the foot
  const ico = new THREE.IcosahedronGeometry(1, 0);
  const rockStack = (x, z, h, out, zmax = 0.5) => {
    let y = 0, k = 0; const n = Math.max(1, Math.round(h / rr(0.8, 1.2)));
    const lh = h / n;
    for (let i = 0; i < n; i++) {
      const r = (0.34 + (n - i) * 0.04) * rr(0.85, 1.25), geo = jitter(ico.clone().toNonIndexed(), 0.35);
      geo.scale(r, lh * 0.62, Math.min(zmax, 0.55) / 1.25);
      if (i === 0) { const q = geo.attributes.position; for (let k = 0; k < q.count; k++) if (q.getY(k) < -lh / 2) q.setY(k, -lh / 2); geo.computeVertexNormals(); } const m = mesh(geo, rnd() < 0.7 ? rock : rockDk, x + out * (n - i - 1) * 0.08 + rr(-0.05, 0.05), y + lh / 2, z, 0, rr(-0.3, 0.3), 0);
      y += lh; k++;
    }
    return y;
  };
  const mossCap = (x, y, z, r) => mesh(new THREE.SphereGeometry(0.5, 6, 2, 0, Math.PI * 2, 0, Math.PI / 2), moss, x, y - 0.06, z, 0, rr(0, 6), 0).scale.set(r, 0.15, r * 0.7);
  const flanks = (hiL, hiR) => {
    for (const side of [-1, 1]) for (let z = 4.15; z >= -4.2; z -= rr(0.55, 0.9)) {
      const r = 0.5, h = topAt(z) + (side < 0 ? hiL : hiR) + rr(-0.08, 0.12), x = side * (HW + 0.28);
      const top = rockStack(x, z, h, side, Math.min(0.5, 4.5 - Math.abs(z) - 0.05));
      if (rnd() < 0.55) mossCap(x, top, z, 0.5);
    }
    // back: the top flight's end face gets rock courses too (it sits against the cliff top in a level)
    for (let x = -1.0; x <= 1.01; x += 0.66) rockStack(x, -4.15, 4.7 + rr(-0.2, 0.05), 0, 0.38);
  };
  g.userData.mounts = 'back';
