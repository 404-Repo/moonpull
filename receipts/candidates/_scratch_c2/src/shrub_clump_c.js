// shrub_clump C (different reading): gorse as spiky shells. Each mound is a subdivided icosahedron
// whose vertices are alternately pushed out into short spines, so it reads as prickly gorse rather
// than a soft hedge; fewer, bigger mounds; flowers raycast on.
  for (const [x, z, r, h] of MOUNDS) {
    const geo = new THREE.IcosahedronGeometry(1, 1), p = geo.attributes.position, v = V(0, 0, 0);
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const sp = 1 + (hash(v.x, v.y, v.z) > 0.55 ? 0.28 : 0) + (hash(v.z, v.x, v.y) - 0.5) * 0.15; v.multiplyScalar(sp); if (v.y < -0.3) v.y = -0.3; p.setXYZ(i, v.x * r * 1.05, (v.y + 0.3) * h * 0.72, v.z * r * 1.05); }
    geo.computeVertexNormals();
    const m = mesh(geo, rnd() < 0.5 ? gorse : gorseDk, x, 0.03, z, 0, rr(0, 6), 0); bushes.push(m);
    const in2 = new THREE.IcosahedronGeometry(1, 0); in2.scale(r * 0.8, h * 0.4, r * 0.8); mesh(in2, gorseDk, x, h * 0.4, z);
  }
  flowers(90);
