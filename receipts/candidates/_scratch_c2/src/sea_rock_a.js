// sea_rock A (profiles): every stratum is its own irregular plan outline, extruded with a soft bevel,
// stacked with small overhangs; the main rock's top stratum is cut by a hole for the tide pool.
  const outline = (rx, rz, k, n = 9) => {
    const pts = [];
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, f = 1 + (hash(i, k, 3) - 0.5) * 0.26; pts.push(new THREE.Vector3(Math.cos(a) * rx * f, Math.sin(a) * rz * f, 0)); }
    return new THREE.CatmullRomCurve3(pts, true).getSpacedPoints(14).slice(0, 14).map((p) => new THREE.Vector2(p.x, p.y));
  };
  const layer = (r, y0, th, sc, mat, k, hole) => {
    const s = new THREE.Shape(outline(r.rx * sc, r.rz * sc, k));
    if (hole) s.holes.push(new THREE.Path(outline(r.rx * hole, r.rz * hole * 0.9, k + 50, 8).reverse()));
    const bev = Math.min(0.2, th * 0.34);
    const geo = new THREE.ExtrudeGeometry(s, { depth: th - 2 * bev, bevelEnabled: true, bevelThickness: bev, bevelSize: bev * 0.9, bevelSegments: 2, curveSegments: 2 });
    geo.rotateX(-Math.PI / 2); geo.translate(0, bev, 0);
    jitter(geo, 0.05);
    const m = mesh(geo, mat, r.x, y0, r.z, 0, (hash(k, 1, 1) - 0.5) * 0.5, 0); rocks.push(m);
    if (hole) {
      const w = new THREE.ShapeGeometry(new THREE.Shape(outline(r.rx * hole * 1.1, r.rz * hole * 0.99, k + 50, 8)), 4); w.rotateX(-Math.PI / 2);
      const wm = new THREE.Mesh(w, water); wm.position.y = th - 0.13; m.add(wm);
      for (const [dx, dz, s] of [[0.42, -0.3, 0.15], [-0.5, 0.2, 0.11], [0.1, 0.4, 0.09], [-0.15, -0.2, 0.07]]) { const st = new THREE.Mesh(jitter(new THREE.IcosahedronGeometry(s, 0), 0.03), dx > 0.3 ? sandDk : cream); st.position.set(dx * r.rx, th - 0.13, dz * r.rz); st.scale.y = 0.55; m.add(st); }
    }
    return m;
  };
  const stack = (r, ths, scs, mats, kb, poolHole) => {
    let y = 0;
    ths.forEach((th, i) => { layer(r, y, th + 0.04, scs[i], mats[i], kb + i, poolHole && i === ths.length - 1 ? poolHole : 0); y += th; });
  };
  stack(R.main, [0.6, 0.56, 0.54, 0.5], [1.0, 1.04, 0.99, 0.88], [wet, sandDk, sand, sand], 10, 0.52);
  stack(R.back, [0.62, 0.66, 0.62], [1.0, 1.03, 0.86], [wet, sandDk, sand], 30);
  stack(R.front, [0.58, 0.57], [1.0, 0.9], [wet, sand], 40);
  dress();
