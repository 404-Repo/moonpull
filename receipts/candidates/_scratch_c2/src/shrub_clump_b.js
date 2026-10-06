// shrub_clump B (sweep): each gorse mound is one lathe dome whose profile is lumpy, then pushed by a
// cell-ish noise into knobbly bumps; flowers raycast on.
  const prof = []; for (let i = 0; i <= 7; i++) { const t = i / 7, a = t * Math.PI / 2; prof.push(new THREE.Vector2(Math.max(Math.cos(a) * (1 + 0.08 * Math.sin(t * 9)), 0.001), Math.sin(a))); }
  prof.unshift(new THREE.Vector2(0.75, 0)); prof.unshift(new THREE.Vector2(0.001, 0));
  for (const [x, z, r, h] of MOUNDS) {
    const geo = new THREE.LatheGeometry(prof, 12); geo.scale(r, h, r);
    const ng = geo.toNonIndexed(), p = ng.attributes.position, v = V(0, 0, 0);
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const k = 1 + (hash(v.x * 4, v.y * 4, v.z * 4) - 0.5) * 0.35; if (v.y > 0.02) { v.x *= k; v.z *= k; v.y *= 1 + (k - 1) * 0.5; } p.setXYZ(i, v.x, v.y, v.z); }
    ng.computeVertexNormals();
    const m = mesh(ng, rnd() < 0.5 ? gorse : gorseDk, x, 0.03, z, 0, rr(0, 6), 0); bushes.push(m);
  }
  flowers(90);
