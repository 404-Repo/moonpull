  const bark = M(0x5e4130, 'timber', 0.9);
  const needle = M(0x3e5a2c, 'foliage', 0.85);
  const needleHi = M(0x58773a, 'foliage', 0.85);
  const rockM = M(0x5f6266, 'stone', 0.75);
  const moss = M(0x4f5a2c, 'foliage', 0.9);
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  // trunk: rises out of the rocks, leans to +x with an S-bend, crown at ~5.3 m
  const trunkC = new THREE.CatmullRomCurve3([V(0, 0.5, 0), V(0.25, 1.4, 0.05), V(0.85, 2.3, 0.0), V(0.7, 3.2, -0.1), V(0.15, 4.1, 0.0), V(0.3, 4.8, -0.05), V(0.5, 5.25, 0)]);
  // pads: centre, radius, layer count; branches run from trunk param to the pad's underside
  const PADS = [
    { c: V(0.45, 5.45, 0), r: 1.25, n: 3, t: 0.97 },
    { c: V(-1.55, 4.15, 0.25), r: 1.0, n: 2, t: 0.72 },
    { c: V(1.85, 3.55, 0.35), r: 0.95, n: 2, t: 0.55 },
    { c: V(1.55, 2.75, -0.55), r: 0.75, n: 2, t: 0.42 },
    { c: V(-0.35, 4.75, -1.25), r: 0.85, n: 2, t: 0.8 },
    { c: V(0.35, 4.3, 1.15), r: 0.7, n: 2, t: 0.7 },
  ];
  const branchCurve = (pd) => {
    const a = trunkC.getPointAt(pd.t), b = pd.c.clone().setY(pd.c.y - 0.15);
    const m = a.clone().lerp(b, 0.5); m.y = Math.max(a.y, b.y) - 0.25 + (pd.t < 0.6 ? 0.1 : -0.1);
    return new THREE.CatmullRomCurve3([a, a.clone().lerp(m, 0.6).setY(a.y + 0.15), m, b]);
  };
  // tapered tube: TubeGeometry rings rescaled from r0 to r1 along the curve
  const tube = (curve, r0, r1, segs = 10, rad = 6) => {
    const geo = new THREE.TubeGeometry(curve, segs, 1, rad, false), p = geo.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i <= segs; i++) { const P = curve.getPointAt(i / segs), r = r0 + (r1 - r0) * (i / segs); for (let j = 0; j <= rad; j++) { const k = i * (rad + 1) + j; v.fromBufferAttribute(p, k).sub(P).multiplyScalar(r).add(P); p.setXYZ(k, v.x, v.y, v.z); } }
    geo.computeVertexNormals(); return geo;
  };
  const roots = () => {
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + rr(-0.3, 0.3), s = V(Math.cos(a) * 0.15, 0.9, Math.sin(a) * 0.15);
      const e = V(Math.cos(a) * rr(1.0, 1.25), 0.02, Math.sin(a) * rr(0.9, 1.15));
      const m = V(Math.cos(a) * 0.65, 0.85, Math.sin(a) * 0.6);
      mesh(tube(new THREE.CatmullRomCurve3([s, m, e]), 0.17, 0.05, 8, 5), bark);
    }
  };
  const trunkAndBranches = (rad = 7) => {
    mesh(tube(trunkC, 0.36, 0.13, 16, rad), bark);
    // flared base, sunk into the rocks
    mesh(new THREE.CylinderGeometry(0.34, 0.55, 0.7, rad), bark, 0, 0.6, 0);
    for (const pd of PADS) if (pd.t < 0.95) mesh(tube(branchCurve(pd), 0.12, 0.05, 6, 5), bark);
  };
