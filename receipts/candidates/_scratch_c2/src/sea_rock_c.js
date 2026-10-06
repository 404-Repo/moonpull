// sea_rock C (different breakdown): each rock is one subdivided rounded cube (a box pushed toward a
// superellipsoid), with strata carved as horizontal grooves by a stepped radial displacement and
// the pool pressed down into the top of the main rock. One mesh per rock, colour by height groups.
  const blob = (r, h, nGroove, pool) => {
    const geo = new THREE.BoxGeometry(2, 2, 2, 8, 8, 8); const p = geo.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      // rounded cube: blend between cube and sphere
      const s = v.clone().normalize().multiplyScalar(1.15); v.lerp(s, 0.55);
      v.x = THREE.MathUtils.clamp(v.x, -1, 1); v.z = THREE.MathUtils.clamp(v.z, -1, 1); v.y = THREE.MathUtils.clamp(v.y, -1, 1);
      const yy = (v.y + 1) / 2; // 0..1
      // stratum grooves: radius pinches near each boundary
      const f = (yy * nGroove) % 1, groove = 1 - 0.07 * Math.exp(-Math.pow((f < 0.5 ? f : 1 - f) / 0.12, 2));
      const taper = 1 - 0.12 * yy * yy;
      let x = v.x * r.rx * groove * taper, z = v.z * r.rz * groove * taper, y = yy * h;
      if (pool) { const d = Math.hypot(v.x, v.z); if (v.y > 0.6 && d < 0.6) y -= 0.28 * Math.cos((d / 0.6) * Math.PI / 2); }
      p.setXYZ(i, x, y, z);
    }
    const ng = geo.toNonIndexed(); jitter(ng, 0.06, 0);
    const ms = splitMesh(ng, (c) => (c.y < 0.7 ? 0 : c.y < 1.15 ? 1 : 2), [wet, sandDk, sand], r.x, 0, r.z, rr(-0.3, 0.3)); rocks.push(...ms); return ms;
  };
  const main = blob(R.main, 2.2, 5, true);
  blob(R.back, 1.9, 4);
  blob(R.front, 1.15, 3);
  {
    const w = new THREE.CircleGeometry(0.62, 10); w.rotateX(-Math.PI / 2); w.scale(R.main.rx * 0.85, 1, R.main.rz * 0.85);
    const wm = new THREE.Mesh(w, water); wm.position.y = 2.2 - 0.17; main[main.length - 1].add(wm);
    for (const [dx, dz, s] of [[0.42, -0.3, 0.14], [-0.45, 0.2, 0.1], [0.05, 0.4, 0.08]]) { const st = new THREE.Mesh(jitter(new THREE.IcosahedronGeometry(s, 0), 0.03), dx > 0.3 ? sandDk : cream); st.position.set(dx * R.main.rx, 2.2 - 0.12, dz * R.main.rz); st.scale.y = 0.55; main[main.length - 1].add(st); }
  }
  dress();
