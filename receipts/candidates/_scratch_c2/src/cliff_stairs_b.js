// cliff_stairs B (profiles): the whole flight is one side profile (steps, landing, steps) drawn as a
// Shape and extruded across the 1.8 m width with a soft bevel; tread lines are shallow joint
// grooves (dark inset strips). Flanks are extruded rock walls whose top follows the flight, in two
// strata (darker outer foot, sandstone upper), jittered; timber rail on +x.
  const bev = 0.04;
  { const s = new THREE.Shape(); s.moveTo(-4.5 + bev, bev);
    let y = bev;
    for (const st of [...STEPS.slice(0, 9), { z0: LANDING.z0, z1: LANDING.z1, top: LANDING.top }, ...STEPS.slice(9)]) { s.lineTo(-st.z0 + bev, st.top - bev); s.lineTo(-st.z1 + bev, st.top - bev); }
    s.lineTo(4.5 - bev, bev); s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth: W - 2 * bev, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 1 });
    geo.rotateY(Math.PI / 2); geo.translate(-HW + bev, 0, 0);
    mesh(geo, step);
    // joints: thin lighter tread caps per step (split in two along x), so treads read as laid stones
    STEPS.forEach((st, k) => { const cut = -HW + W * (0.38 + (k % 3) * 0.12); for (const [xa, xb] of [[-HW, cut], [cut, HW]]) mesh(new THREE.BoxGeometry(xb - xa - 0.05, 0.04, st.z0 - st.z1 - 0.05), (k + (xa < 0 ? 0 : 1)) % 3 ? stepLt : step, (xa + xb) / 2, st.top + 0.005, (st.z0 + st.z1) / 2); });
  }
  const wall = (side, hi, out, th, mat, frac) => {
    const s = new THREE.Shape(); s.moveTo(-4.45, 0);
    for (let z = 4.45; z >= -4.45; z -= 0.45) s.lineTo(-z, (topAt(z) + hi) * frac + (hash(z, side, out) - 0.5) * 0.3);
    s.lineTo(4.45, 0); s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth: th, bevelEnabled: true, bevelThickness: 0.14, bevelSize: 0.12, bevelSegments: 2, curveSegments: 1 });
    geo.rotateY(Math.PI / 2); jitter(geo, 0.12, 0);
    const p = geo.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) < 0) p.setY(i, 0); geo.computeVertexNormals();
    mesh(geo, mat, side > 0 ? HW + out : -HW - out - th, 0, 0);
  };
  for (const side of [-1, 1]) { wall(side, side < 0 ? 0.35 : 0.05, 0.02, 0.45, rock, 1); wall(side, 0.2, 0.4, 0.35, rockDk, 0.6); }
  for (const side of [-1, 1]) for (let z = 4.0; z >= -4.0; z -= 1.1) if (rnd() < 0.7) mossCap(side * (HW + 0.3), topAt(z) + (side < 0 ? 0.35 : 0.05), z, 0.45);
  rail(HW - 0.1);
