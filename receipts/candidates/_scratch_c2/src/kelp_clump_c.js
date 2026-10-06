// kelp_clump C (different reading): a mop. Strands radiate from a crown on top evenly in every
// direction, so it reads the same from all sides; a crown of bladderwrack stands up through the
// middle; the stone is a low faceted dodecahedron peeking out between strands.
  { const geo = new THREE.DodecahedronGeometry(1, 1); geo.scale(S.a, S.b, S.c); const ng = jitter(geo.toNonIndexed(), 0.08); mesh(ng, stoneM, S.x, S.cy, 0); }
  const N = 24;
  for (let i = 0; i < N; i++) {
    const ang = (i / N) * Math.PI * 2 + rr(-0.12, 0.12);
    mesh(ribbon(drape(S.x + Math.cos(ang) * 0.06, Math.sin(ang) * 0.06, ang, rr(0.55, 0.75), rr(0.08, 0.18)), rr(0.07, 0.1), 0.05), i % 2 ? kelpOl : kelpDk);
  }
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + rr(-0.3, 0.3), r = rr(0.04, 0.14); wrackFrond(S.x + Math.cos(a) * r, Math.sin(a) * r, -a + Math.PI / 2, rr(0.12, 0.16), rr(0.2, 0.6)); }
