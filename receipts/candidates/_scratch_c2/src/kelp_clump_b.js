// kelp_clump B (sweeps): pebble stone as a LatheGeometry; every ribbon strand is a thin flat
// rectangle extruded along a CatmullRom drape path (ExtrudeGeometry with extrudePath), so the
// strands have real thickness and edges; bladderwrack fronds as before.
  { const prof = []; for (let i = 0; i <= 8; i++) { const t = i / 8, a = -Math.PI / 2 + t * Math.PI; prof.push(new THREE.Vector2(Math.max(Math.cos(a), 0.001), Math.sin(a))); }
    const geo = new THREE.LatheGeometry(prof, 12); geo.scale(S.a, S.b, S.c); const ng = jitter(geo.toNonIndexed(), 0.07); mesh(ng, stoneM, S.x, S.cy, 0); }
  const strand = (pts, w, th) => {
    const sh = new THREE.Shape(); sh.moveTo(-th / 2, -w / 2); sh.lineTo(th / 2, -w / 2); sh.lineTo(th / 2, w / 2); sh.lineTo(-th / 2, w / 2); sh.closePath();
    const geo = new THREE.ExtrudeGeometry(sh, { steps: 8, bevelEnabled: false, extrudePath: new THREE.CatmullRomCurve3(pts) });
    return geo;
  };
  for (let i = 0; i < 16; i++) {
    const main = i < 11, ang = main ? Math.PI * 0.75 + rr(-0.9, 0.9) : rr(0, Math.PI * 2);
    mesh(strand(drape(S.x + rr(-0.15, 0.12), rr(-0.12, 0.1), ang, main ? rr(0.75, 1.0) : rr(0.45, 0.65), rr(0.1, 0.22), 8), rr(0.07, 0.1), 0.012), rnd() < 0.55 ? kelpOl : kelpDk);
  }
  for (let i = 0; i < 8; i++) { const a = -Math.PI * 0.25 + rr(-1.1, 1.1), r = rr(0.05, 0.3); wrackFrond(S.x + Math.cos(a) * r, Math.sin(a) * r * 0.8, -a + Math.PI / 2, rr(0.12, 0.16), rr(0.35, 0.9)); }
