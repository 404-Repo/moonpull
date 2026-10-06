// anchor_c: a different reading. The anchor rests the way a stock anchor really falls: on its
// crown, one fluke and one end of the stock, so the whole thing leans back and the shank rises
// at a low angle. Shank and arms are tapered tube sweeps (one continuous curve for the arms),
// flukes are hand-built faceted spades, links are stadium-shaped tube loops (instanced).
export default function (THREE) {
  const g = new THREE.Group();
  const mk = (hex, name, r = 0.85, extra = {}) => { const q = new THREE.MeshStandardMaterial({ color: hex, roughness: r, ...extra }); if (name) q.name = name; return q; };
  const rust = mk(0x7a4a30, 'metal', 0.85, { metalness: 0.2, flatShading: true });
  const rustDk = mk(0x5e3826, 'metal', 0.85, { metalness: 0.2 });
  const iron = mk(0x3a3d40, 'metal', 0.7, { metalness: 0.3 });
  const kelp = mk(0x4f5a2c, 'foliage', 0.6, { side: THREE.DoubleSide });
  const barn = mk(0xd9cfb6, 'stone', 0.9);
  const V = (x, y, z = 0) => new THREE.Vector3(x, y, z);

  // tube along a curve with radius r(s), s in 0..1, capped at both ends
  const taper = (curve, segs, rad, rf) => {
    const geo = new THREE.TubeGeometry(curve, segs, 1, rad, false);
    const pos = geo.attributes.position, fr = curve.computeFrenetFrames(segs, false), p = new THREE.Vector3();
    for (let i = 0; i <= segs; i++) {
      const c = curve.getPointAt(i / segs), r = rf(i / segs);
      for (let j = 0; j <= rad; j++) { const k = i * (rad + 1) + j; p.fromBufferAttribute(pos, k).sub(c).multiplyScalar(r).add(c); pos.setXYZ(k, p.x, p.y, p.z); }
    }
    geo.computeVertexNormals();
    return geo;
  };

  const A = new THREE.Group();
  // shank: crown to head, swelling slightly at the crown
  const shankC = new THREE.LineCurve3(V(0, 0.1), V(0, 1.9));
  A.add(new THREE.Mesh(taper(shankC, 6, 7, (s) => 0.115 - 0.04 * s), rust));
  // arms: one curve, tip to crown to tip, thick at the crown and thinning out
  const armC = new THREE.CatmullRomCurve3([V(-0.74, 0.78), V(-0.62, 0.36), V(-0.36, 0.1), V(0, 0.02), V(0.36, 0.1), V(0.62, 0.36), V(0.74, 0.78)]);
  A.add(new THREE.Mesh(taper(armC, 16, 7, (s) => 0.06 + 0.06 * Math.pow(1 - Math.abs(2 * s - 1), 1.2)), rust));
  // crown knuckle
  const kn = new THREE.Mesh(new THREE.IcosahedronGeometry(0.15, 0), rust); kn.position.set(0, 0.08, 0); A.add(kn);
  // flukes: faceted spades (a thick diamond with a ridge on both faces), wide across Z
  const spade = () => {
    const P = [[0, -0.12, 0], [0, 0.34, 0], [0, 0.0, 0.24], [0, 0.0, -0.24], [0.07, 0.06, 0], [-0.07, 0.06, 0], [0, -0.2, 0.15], [0, -0.2, -0.15]];
    const F = [[0, 2, 4], [2, 1, 4], [1, 3, 4], [3, 0, 4], [2, 0, 5], [1, 2, 5], [3, 1, 5], [0, 3, 5], [0, 6, 2], [0, 2, 6], [0, 3, 7], [0, 7, 3]];
    const pos = [];
    for (const f of F) for (const k of f) pos.push(...P[k]);
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.computeVertexNormals();
    return geo;
  };
  const spadeMat = mk(0x7a4a30, 'metal', 0.85, { metalness: 0.2, flatShading: true, side: THREE.DoubleSide });
  for (const s of [-1, 1]) {
    const tip = armC.getPointAt(s > 0 ? 1 : 0), tan = armC.getTangentAt(s > 0 ? 1 : 0).multiplyScalar(s > 0 ? 1 : -1);
    const f = new THREE.Mesh(spade(), spadeMat);
    f.quaternion.setFromUnitVectors(V(0, 1, 0), tan.normalize());
    f.position.copy(tip).addScaledVector(tan, 0.04); f.scale.setScalar(1.15); A.add(f);
    const bill = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.14, 5), rustDk); bill.quaternion.copy(f.quaternion); bill.position.copy(tip).addScaledVector(tan, 0.44); A.add(bill);
  }
  // head: block with a ring
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.2, 0.17), rust); head.position.set(0, 1.92, 0); A.add(head);
  // stock: tapered sweep along Z with knobs
  const stockC = new THREE.LineCurve3(V(0, 1.72, -0.74), V(0, 1.72, 0.74));
  A.add(new THREE.Mesh(taper(stockC, 6, 7, (s) => 0.05 + 0.035 * (1 - Math.abs(2 * s - 1))), rust));
  for (const s of [-1, 1]) { const k = new THREE.Mesh(new THREE.IcosahedronGeometry(0.075, 0), rustDk); k.position.set(0, 1.72, s * 0.76); A.add(k); }
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.04, 6, 14), iron); ring.position.set(0, 2.15, 0); ring.rotation.y = Math.PI / 2; A.add(ring);
  // barnacles + kelp
  for (const [x, y, z] of [[0.08, 0.55, 0.06], [-0.08, 0.7, 0.05], [0.09, 1.3, 0.04], [0.5, 0.2, 0.07], [-0.55, 0.3, 0.06], [0.0, 0.1, 0.13], [0.06, 1.72, 0.35], [0.06, 1.72, -0.3]]) {
    const b = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.045, 5), barn); b.rotation.x = Math.PI / 2; b.position.set(x, y, z + 0.02); A.add(b);
  }
  const tuft = (x, y, z, len, rz) => { const t = new THREE.Mesh(new THREE.ConeGeometry(0.055, len, 3, 1, true), kelp); t.position.set(x, y - len / 2, z); t.rotation.z = rz; t.scale.z = 0.4; A.add(t); };
  tuft(0.0, 1.45, 0.1, 0.3, 0.1); tuft(0.05, 0.95, 0.1, 0.22, -0.15); tuft(-0.5, 0.42, 0.08, 0.24, 0.2); tuft(0.0, 1.72, -0.5, 0.22, 0);

  // rest pose: the plane through crown underside, +X bill tip and the +Z stock knob becomes the ground
  const tipR = armC.getPointAt(1).addScaledVector(armC.getTangentAt(1).normalize(), 0.5);
  const P1 = V(0, -0.06), P2 = tipR, P3 = V(0, 1.72 - 0.07, 0.8);
  const nrm = new THREE.Vector3().crossVectors(P2.clone().sub(P1), P3.clone().sub(P1)).normalize();
  if (nrm.dot(V(0, 2, 0).sub(P1)) < 0) nrm.negate();
  const q = new THREE.Quaternion().setFromUnitVectors(nrm, V(0, 1, 0));
  const yaw = new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), THREE.MathUtils.degToRad(-30));
  A.quaternion.copy(yaw.multiply(q));
  g.add(A);
  g.updateMatrixWorld(true);
  const ground = measure(THREE, A, (n) => n.material !== kelp).min.y;
  const ringPt = V(0, 2.15 + 0.17, 0).applyMatrix4(A.matrixWorld);
  // heap sits under and beside the head, toward the viewer
  g.add(chain(THREE, rustDk, ringPt, V(ringPt.x + 0.1, ground, ringPt.z + 0.45), ground));
  place(THREE, g);
  return g;
}

// stadium links: a tube swept round a rounded-rectangle loop, instanced along a heap curve
function chain(THREE, mat, ringPt, c, ground) {
  const L = 0.055, Rr = 0.05, loop = [];
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; loop.push(new THREE.Vector3(Math.cos(a) * Rr + Math.sign(Math.cos(a)) * L * (Math.abs(Math.cos(a)) > 0.1 ? 1 : 0), Math.sin(a) * Rr, 0)); }
  const lgeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(loop, true), 8, 0.021, 3, true);
  const pts = [];
  const turns = 3.0, n = 90;
  for (let i = 0; i <= n; i++) {
    const s = i / n, a = s * turns * Math.PI * 2;
    const r = 0.42 - 0.22 * s + 0.04 * Math.sin(a * 3.1);
    pts.push(new THREE.Vector3(c.x + r * Math.cos(a), ground + 0.03 + 0.18 * s, c.z + r * Math.sin(a)));
  }
  const last = pts[pts.length - 1];
  pts.push(new THREE.Vector3((last.x + ringPt.x) / 2, (last.y + ringPt.y) / 2, (last.z + ringPt.z) / 2), ringPt.clone());
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  const pitch = 0.135, N = Math.floor(curve.getLength() / pitch);
  const im = new THREE.InstancedMesh(lgeo, mat, N);
  const up = new THREE.Vector3(0, 1, 0), M = new THREE.Matrix4();
  for (let i = 0; i < N; i++) {
    const u = (i + 0.5) / N, p = curve.getPointAt(u), t = curve.getTangentAt(u).normalize();
    const nrm = new THREE.Vector3().crossVectors(t, up); if (nrm.lengthSq() < 1e-4) nrm.set(1, 0, 0); nrm.normalize();
    const b = new THREE.Vector3().crossVectors(t, nrm).normalize();
    if (i % 2) M.makeBasis(t, b, nrm.clone().negate()); else M.makeBasis(t, nrm, b);
    M.setPosition(p);
    im.setMatrixAt(i, M);
  }
  im.instanceMatrix.needsUpdate = true;
  return im;
}

function measure(THREE, g, keep = () => true) {
  const box = new THREE.Box3(), v = new THREE.Vector3(), m = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => {
    const p = n.isMesh && keep(n) && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(m.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld);
  });
  return box;
}

function place(THREE, g) {
  const box = measure(THREE, g);
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
}
