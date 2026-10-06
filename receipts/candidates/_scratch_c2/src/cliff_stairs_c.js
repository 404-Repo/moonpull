// cliff_stairs C (different reading, as the ref's ridge): the flight sits on top of a lofted rock
// ridge whose cross-section slopes away on both sides below step level; each tread is one big
// chunky cut stone the full width; the ridge is jittered and banded wet-grey at the foot.
  // loft: cross-section at each z, from the left foot up under the walk and down to the right foot
  {
    const prof = (z, t) => { const f = 0.9 + Math.min(t, 3) * 0.25; return [[-HW - f, 0], [-HW - f * 0.55, t * 0.45], [-HW - 0.15, t - 0.1], [HW + 0.15, t - 0.1], [HW + f * 0.55, t * 0.45], [HW + f, 0]]; };
    const zs = []; for (let z = 4.45; z >= -4.46; z -= 0.45) zs.push(z);
    const pos = [];
    for (let i = 0; i < zs.length - 1; i++) {
      const A = prof(zs[i], topAt(zs[i] - 0.01)), B = prof(zs[i + 1], topAt(zs[i + 1] + 0.01));
      for (let j = 0; j < A.length - 1; j++) { const a = [A[j][0], A[j][1], zs[i]], b = [A[j + 1][0], A[j + 1][1], zs[i]], c = [B[j + 1][0], B[j + 1][1], zs[i + 1]], d = [B[j][0], B[j][1], zs[i + 1]]; pos.push(...a, ...b, ...c, ...a, ...c, ...d); }
    }
    // end caps
    for (const [zz, flip] of [[zs[0], 1], [zs[zs.length - 1], -1]]) { const P = prof(zz, topAt(zz)); for (let j = 1; j < P.length - 1; j++) { const t = [[P[0][0], P[0][1], zz], [P[j][0], P[j][1], zz], [P[j + 1][0], P[j + 1][1], zz]]; if (flip < 0) t.reverse(); pos.push(...t.flat()); } }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    const p = geo.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); if (Math.abs(v.x) > HW + 0.2) { v.x += (hash(v.x, v.y, v.z) - 0.5) * 0.45; v.y = Math.max(0, v.y + (hash(v.z, v.x, v.y) - 0.5) * 0.3); } p.setXYZ(i, v.x, v.y, v.z); }
    geo.computeVertexNormals();
    splitMesh(geo, (c) => (c.y < 0.6 ? 0 : (hash(Math.round(c.z * 2), Math.round(c.y * 2), c.x > 0 ? 1 : 0) < 0.3 ? 1 : 2)), [rockDk, step, rock]);
  }
  // treads: one chunky stone each, full width, plus riser block under it
  STEPS.forEach((st, k) => { const d = st.z0 - st.z1; mesh(rbox(W + 0.1, 0.3, d + 0.03, 0.06, 1), k % 2 ? step : stepLt, (hash(k, 2, 3) - 0.5) * 0.06, st.top - 0.15, (st.z0 + st.z1) / 2); mesh(new THREE.BoxGeometry(W, Math.max(st.top - 0.3, 0.02), d), rockDk, 0, Math.max(st.top - 0.3, 0.02) / 2, (st.z0 + st.z1) / 2); });
  { const L = LANDING; for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) mesh(rbox(W / 2 - 0.03, 0.3, (L.z0 - L.z1) / 2 - 0.03, 0.06, 1), (i + j) % 2 ? step : stepLt, -HW / 2 + i * HW, L.top - 0.15, L.z0 - (L.z0 - L.z1) * (j + 0.5) / 2); mesh(new THREE.BoxGeometry(W, L.top - 0.3, L.z0 - L.z1), rockDk, 0, (L.top - 0.3) / 2, 0); }
  // back face rock courses + moss tufts on the ridge
  for (let x = -1.0; x <= 1.01; x += 0.66) rockStack(x, -4.15, 4.6, 0, 0.38);
  for (let z = 4.0; z >= -4.0; z -= 0.9) for (const side of [-1, 1]) if (rnd() < 0.6) mossCap(side * (HW + 0.45), topAt(z) - 0.25, z, 0.5);
  rail(HW - 0.1);
