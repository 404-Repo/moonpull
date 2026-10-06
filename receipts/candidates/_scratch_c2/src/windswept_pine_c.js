// windswept_pine C (different reading): each pad is a flat scalloped cloud, a lobed outline
// extruded thin with a bevel (like the ref's layered needle shelves seen from the side), two or
// three stacked with the lower one wider and darker; lobes droop at the rim. Rocks are faceted
// dodecahedra.
  trunkAndBranches();
  roots();
  const lobed = (r, lobes, k) => { const s = new THREE.Shape(); const n = lobes * 4; for (let i = 0; i <= n; i++) { const a = (i / n) * Math.PI * 2, rad = r * (0.82 + 0.18 * Math.abs(Math.sin(a * lobes / 2 * 2 / 2 * 2))) * (1 + (hash(i, k, 1) - 0.5) * 0.12); i ? s.lineTo(Math.cos(a) * rad, Math.sin(a) * rad) : s.moveTo(Math.cos(a) * rad, Math.sin(a) * rad); } return s; };
  for (const pd of PADS) {
    for (let L = 0; L < pd.n; L++) {
      const rL = pd.r * (1 - L * 0.3), y = pd.c.y + L * 0.22, top = L === pd.n - 1;
      const geo = new THREE.ExtrudeGeometry(lobed(rL, 7, L + pd.t * 10), { depth: 0.12, bevelEnabled: true, bevelThickness: 0.07, bevelSize: 0.09, bevelSegments: 1, curveSegments: 1 });
      geo.rotateX(-Math.PI / 2);
      const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const d = Math.hypot(p.getX(i), p.getZ(i)) / rL; p.setY(i, p.getY(i) - 0.22 * d * d); }
      geo.computeVertexNormals();
      mesh(geo, top ? needleHi : needle, pd.c.x, y, pd.c.z, 0, rr(0, 6), 0);
    }
  }
  for (const [x, z, s, h, ry] of [[-0.6, 0.4, 0.75, 0.85, 0.3], [0.6, 0.45, 0.7, 0.7, -0.4], [0.1, -0.65, 0.85, 0.95, 0.1], [-1.1, -0.55, 0.55, 0.5, 0.8], [1.25, -0.4, 0.5, 0.45, 0.5], [0.0, 1.05, 0.55, 0.4, 0.2], [-1.2, 0.75, 0.4, 0.3, 1.1]]) {
    const geo = jitter(new THREE.DodecahedronGeometry(1, 0).toNonIndexed(), 0.15); geo.scale(s, h / 2, s * 0.85); geo.translate(0, h / 2, 0);
    const p = geo.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) < 0) p.setY(i, 0); geo.computeVertexNormals();
    mesh(geo, rockM, x, 0, z, 0, ry, 0);
    mesh(new THREE.SphereGeometry(0.5, 6, 2, 0, Math.PI * 2, 0, Math.PI / 2), moss, x, h - 0.06, z, 0, ry, 0).scale.set(s * 1.1, 0.14, s * 0.9);
  }
