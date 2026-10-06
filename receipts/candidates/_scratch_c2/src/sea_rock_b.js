// sea_rock B (sweep): each rock is one LatheGeometry whose profile steps in and out at every
// stratum (soft ledges), squashed to an oval plan and noise-jittered; the main rock's profile
// turns down into a bowl at the top, so the tide pool hollow is part of the same sweep.
  const lathe = (r, strata, mats, pool) => {
    // profile: list of [radius, y] walking up the outside, ledges between strata
    const pts = []; let y = 0;
    pts.push(new THREE.Vector2(0.001, 0));
    strata.forEach(([th, rad], i) => {
      pts.push(new THREE.Vector2(rad * 0.93, y + 0.02));
      pts.push(new THREE.Vector2(rad, y + th * 0.3));
      pts.push(new THREE.Vector2(rad * 0.98, y + th * 0.75));
      pts.push(new THREE.Vector2(rad * 0.9, y + th));
      y += th;
    });
    const top = y;
    if (pool) { pts.push(new THREE.Vector2(pool * 1.12, top + 0.02)); pts.push(new THREE.Vector2(pool, top - 0.05)); pts.push(new THREE.Vector2(pool * 0.75, top - 0.22)); pts.push(new THREE.Vector2(0.001, top - 0.26)); }
    else { pts.push(new THREE.Vector2(strata[strata.length - 1][1] * 0.6, top + 0.08)); pts.push(new THREE.Vector2(0.001, top + 0.1)); }
    const geo = new THREE.LatheGeometry(pts, 11);
    // squash to oval plan, then jitter; split colours by height using groups
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i) * r.rx, p.getY(i), p.getZ(i) * r.rz);
    const ng = geo.toNonIndexed(); jitter(ng, 0.06, 0);
    // material per triangle by centroid height
    const ms = splitMesh(ng, (c) => (c.y < 0.75 ? 0 : c.y < 1.2 ? 1 : 2), [wet, sandDk, sand], r.x, 0, r.z, rr(0, 6)); rocks.push(...ms); return { m: ms[0], ms, top };
  };
  const main = lathe(R.main, [[0.45, 1.0], [0.45, 1.04], [0.45, 0.99], [0.45, 0.95], [0.4, 0.86]], 0, 0.5);
  lathe(R.back, [[0.48, 1.0], [0.48, 1.02], [0.46, 0.95], [0.38, 0.82]]);
  lathe(R.front, [[0.4, 1.0], [0.36, 0.98], [0.29, 0.85]]);
  {
    const w = new THREE.CircleGeometry(0.5 * 0.95, 10); w.rotateX(-Math.PI / 2); w.scale(R.main.rx, 1, R.main.rz);
    const wm = new THREE.Mesh(w, water); wm.position.y = main.top - 0.1; main.ms[main.ms.length - 1].add(wm);
    for (const [dx, dz, s] of [[0.4, -0.25, 0.14], [-0.42, 0.2, 0.1], [0.05, 0.38, 0.08]]) { const st = new THREE.Mesh(jitter(new THREE.IcosahedronGeometry(s, 0), 0.03), dx > 0.3 ? sandDk : cream); st.position.set(dx * R.main.rx, main.top - 0.1, dz * R.main.rz); st.scale.y = 0.55; main.ms[main.ms.length - 1].add(st); }
  }
  dress();
