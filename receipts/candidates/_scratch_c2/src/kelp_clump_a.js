// kelp_clump A (primitives + strips): jittered icosahedron stone; ribbon kelp as bent flat strips
// that arch off the top and drape down one side onto the ground (like the ref), with bladderwrack
// fronds standing on the other half of the stone.
  { const geo = new THREE.IcosahedronGeometry(1, 2); geo.scale(S.a, S.b, S.c); const ng = jitter(geo.toNonIndexed(), 0.06, -S.cy + 0.0); mesh(ng, stoneM, S.x, S.cy, 0); }
  // ribbon kelp: rooted on the top, mostly flowing toward -x/+z (front-left) but some all round
  for (let i = 0; i < 20; i++) {
    const main = i < 15, ang = main ? Math.PI * 0.75 + rr(-0.9, 0.9) : rr(0, Math.PI * 2);
    const x0 = S.x + rr(-0.15, 0.12), z0 = rr(-0.12, 0.1);
    mesh(ribbon(drape(x0, z0, ang, main ? rr(0.75, 1.0) : rr(0.45, 0.65), rr(0.15, 0.28)), rr(0.09, 0.13), 0.06), rnd() < 0.55 ? kelpOl : kelpDk);
  }
  // bladderwrack on the back-right half
  for (let i = 0; i < 8; i++) { const a = -Math.PI * 0.25 + rr(-1.1, 1.1), r = rr(0.05, 0.3); wrackFrond(S.x + Math.cos(a) * r, Math.sin(a) * r * 0.8, -a + Math.PI / 2, rr(0.15, 0.19), rr(0.3, 0.8)); }
