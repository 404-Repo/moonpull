// anchor_a: primitives. Tapered cylinder shank, torus-arc arms, flattened 4-sided cone flukes,
// cylinder stock with ball ends, torus ring. Tilted so the crown and one fluke rest on the ground,
// with an instanced torus chain running from the ring down into a two-turn coil beside it.
export default function (THREE) {
  const g = new THREE.Group();
  const mk = (hex, name, r = 0.85, extra = {}) => { const q = new THREE.MeshStandardMaterial({ color: hex, roughness: r, ...extra }); if (name) q.name = name; return q; };
  const rust = mk(0x7a4a30, 'metal', 0.85, { metalness: 0.2 });
  const rustDk = mk(0x5e3826, 'metal', 0.85, { metalness: 0.2 });
  const iron = mk(0x3a3d40, 'metal', 0.7, { metalness: 0.3 });
  const kelp = mk(0x4f5a2c, 'foliage', 0.6, { side: THREE.DoubleSide });
  const barn = mk(0xd9cfb6, 'stone', 0.9);

  // ---- the anchor, upright in its own plane (XY), crown at origin, shank up +Y ----
  const A = new THREE.Group();
  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0, par = A) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); par.add(m); return m; };
  // shank
  add(new THREE.CylinderGeometry(0.08, 0.11, 1.75, 8), rust, 0, 0.95, 0);
  // eye block at the head
  add(new THREE.BoxGeometry(0.2, 0.22, 0.17), rust, 0, 1.88, 0);
  // crown boss
  add(new THREE.SphereGeometry(0.15, 8, 6), rust, 0, 0.1, 0);
  // arms: a torus arc centred above the crown
  const R = 0.58, arc = THREE.MathUtils.degToRad(160);
  const arm = add(new THREE.TorusGeometry(R, 0.09, 6, 14, arc), rust, 0, R + 0.02, 0);
  arm.rotation.z = -Math.PI / 2 - arc / 2;
  // flukes at both arm tips: flattened 4-sided cones (spade palms) pointing along the arm tangent
  for (const s of [-1, 1]) {
    const a = -Math.PI / 2 + s * arc / 2;               // tip angle on the circle
    const tx = R * Math.cos(a), ty = R + 0.02 + R * Math.sin(a);
    const tang = new THREE.Vector2(-Math.sin(a) * s, Math.cos(a) * s); // pointing out of the arm
    const f = new THREE.Group(); f.position.set(tx, ty, 0); A.add(f);
    f.rotation.z = Math.atan2(tang.y, tang.x) - Math.PI / 2;
    const palm = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.46, 4), rust);
    palm.scale.set(0.35, 1, 1); palm.position.y = -0.02;
    palm.rotation.x = 0; f.add(palm);
    // bill (pointed tip)
    const bill = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 5), rustDk); bill.position.y = 0.26; f.add(bill);
    // palm leans inward toward the shank like a real fluke
    f.rotation.x = 0;
  }
  // stock: crossbar through the head, perpendicular to the arms, with ball ends
  add(new THREE.CylinderGeometry(0.055, 0.075, 1.5, 7), rust, 0, 1.68, 0, Math.PI / 2, 0, 0);
  for (const s of [-1, 1]) add(new THREE.SphereGeometry(0.085, 7, 5), rustDk, 0, 1.68, s * 0.76);
  // collar bands on the stock
  for (const s of [-1, 1]) add(new THREE.CylinderGeometry(0.09, 0.09, 0.06, 8), rustDk, 0, 1.68, s * 0.14, Math.PI / 2, 0, 0);
  // ring through the eye
  const ring = add(new THREE.TorusGeometry(0.17, 0.04, 6, 14), iron, 0, 2.06, 0, 0, Math.PI / 2, 0);
  // barnacles and kelp on the upper faces
  const barnAt = [[0.04, 0.6, 0.07], [-0.05, 0.75, 0.06], [0.07, 1.1, 0.04], [0.45, 0.25, 0.06], [-0.5, 0.3, 0.07], [0.0, 0.16, 0.12], [0.0, 1.68, 0.3]];
  for (const [x, y, z] of barnAt) { const b = add(new THREE.CylinderGeometry(0.02, 0.035, 0.04, 5), barn, x, y, z, Math.PI / 2, 0, 0); }
  const tuft = (x, y, z, len, rz) => { const t = new THREE.Mesh(new THREE.ConeGeometry(0.05, len, 3, 1, true), kelp); t.position.set(x, y - len / 2, z); t.rotation.z = rz; t.scale.z = 0.4; A.add(t); };
  tuft(0.0, 1.5, 0.08, 0.28, 0.1); tuft(0.06, 0.95, 0.09, 0.22, -0.15); tuft(-0.42, 0.42, 0.08, 0.24, 0.2); tuft(0.0, 1.68, 0.5, 0.2, 0);

  // ---- tilt: shank up to +X at ~38 deg, the +X arm along the ground ----
  // solve the roll so the crown underside and the +X bill tip touch the same ground plane
  const aTip = -Math.PI / 2 + arc / 2;
  const tip = new THREE.Vector3(R * Math.cos(aTip) - Math.sin(aTip) * 0.42, R + 0.02 + R * Math.sin(aTip) + Math.cos(aTip) * 0.42, 0);
  const crown = new THREE.Vector3(0, -0.03, 0);
  const rot = (p, th) => p.x * Math.sin(th) + p.y * Math.cos(th); // world y after rotation.z = th
  let lo = -1.4, hi = -0.2;
  for (let i = 0; i < 40; i++) { const md = (lo + hi) / 2; if (rot(crown, md) - rot(tip, md) > 0) lo = md; else hi = md; }
  A.rotation.z = (lo + hi) / 2 + 0.03;
  A.rotation.y = THREE.MathUtils.degToRad(-8);
  g.add(A);
  g.updateMatrixWorld(true);
  const ground = measure(THREE, A, (n) => n.material !== kelp).min.y;
  const ringPt = new THREE.Vector3(0, 2.06 - 0.17, 0).applyMatrix4(ring.parent.matrixWorld);

  // ---- chain: coil on the ground under the ring, then up to the ring ----
  g.add(chain(THREE, rustDk, ringPt, new THREE.Vector3(ringPt.x + 0.15, ground, ringPt.z + 0.55), ground));

  place(THREE, g);
  return g;
}

function chain(THREE, mat, ringPt, c, ground) {
  const pts = [];
  const turns = 3.2, n = 90;
  for (let i = 0; i <= n; i++) {
    const s = i / n, a = s * turns * Math.PI * 2;
    const r = 0.4 - 0.24 * s + 0.03 * Math.sin(a * 2.3);
    pts.push(new THREE.Vector3(c.x + r * Math.cos(a), ground + 0.035 + 0.16 * Math.pow(s, 0.8) + 0.02 * Math.sin(a * 1.7), c.z + r * Math.sin(a)));
  }
  const last = pts[pts.length - 1];
  const mid = new THREE.Vector3((last.x + ringPt.x) / 2, (last.y + ringPt.y) / 2 + 0.05, (last.z + ringPt.z) / 2);
  pts.push(mid, ringPt.clone());
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  const pitch = 0.13, N = Math.floor(curve.getLength() / pitch);
  const geo = new THREE.TorusGeometry(0.058, 0.022, 3, 6);
  const im = new THREE.InstancedMesh(geo, mat, N);
  const up = new THREE.Vector3(0, 1, 0), M = new THREE.Matrix4(), S = new THREE.Matrix4().makeScale(1.45, 1, 1);
  for (let i = 0; i < N; i++) {
    const u = (i + 0.5) / N, p = curve.getPointAt(u), t = curve.getTangentAt(u).normalize();
    let nrm = new THREE.Vector3().crossVectors(t, up); if (nrm.lengthSq() < 1e-4) nrm.set(1, 0, 0); nrm.normalize();
    const b = new THREE.Vector3().crossVectors(t, nrm).normalize();
    if (i % 2) M.makeBasis(t, b, nrm.clone().negate()); else M.makeBasis(t, nrm, b);
    M.multiply(S); M.setPosition(p);
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
