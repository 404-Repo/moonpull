// anchor_b: profiles. The arms, crown and spade flukes are ONE crescent Shape extruded and
// bevelled; the shank is a tapered extruded Shape with a real eye hole; the stock is a lathe
// (tapered bar with knob ends). Tilted so crown and the +X fluke rest on the ground; an
// instanced chain runs from the ring into a conical heap.
export default function (THREE) {
  const g = new THREE.Group();
  const mk = (hex, name, r = 0.85, extra = {}) => { const q = new THREE.MeshStandardMaterial({ color: hex, roughness: r, ...extra }); if (name) q.name = name; return q; };
  const rust = mk(0x7a4a30, 'metal', 0.85, { metalness: 0.2 });
  const rustDk = mk(0x5e3826, 'metal', 0.85, { metalness: 0.2 });
  const iron = mk(0x3a3d40, 'metal', 0.7, { metalness: 0.3 });
  const kelp = mk(0x4f5a2c, 'foliage', 0.6, { side: THREE.DoubleSide });
  const barn = mk(0xd9cfb6, 'stone', 0.9);

  const A = new THREE.Group();
  const bev = 0.022; // bevel grows the outline by this much; profiles below are drawn inset by it
  const extr = (shape, depth) => {
    const geo = new THREE.ExtrudeGeometry(shape, { depth: depth - 2 * bev, bevelEnabled: true, bevelSize: bev, bevelThickness: bev, bevelSegments: 2, curveSegments: 10 });
    geo.translate(0, 0, -(depth - 2 * bev) / 2);
    return geo;
  };

  // crescent: arms + crown + flukes in the XY plane, centre of curvature above the crown
  const Ro = 0.66 - bev, Ri = 0.49 + bev, Cy = 0.66;
  const a0 = THREE.MathUtils.degToRad(-172), a1 = THREE.MathUtils.degToRad(-8);
  const P = (r, a) => new THREE.Vector2(r * Math.cos(a), Cy + r * Math.sin(a));
  const sh = new THREE.Shape();
  const o0 = P(Ro, a0); sh.moveTo(o0.x, o0.y);
  sh.absarc(0, Cy, Ro, a0, a1, false);
  const fluke = (a, sgn, fromOuter) => {
    // sgn=+1 at a1 (outward = increasing angle), -1 at a0
    const t = new THREE.Vector2(-Math.sin(a) * sgn, Math.cos(a) * sgn);
    const n = new THREE.Vector2(Math.cos(a), Math.sin(a));
    const po = P(Ro, a), pi = P(Ri, a), mid = po.clone().add(pi).multiplyScalar(0.5);
    const barbO = po.clone().addScaledVector(n, 0.13).addScaledVector(t, -0.16);
    const shO = po.clone().addScaledVector(n, 0.16).addScaledVector(t, 0.12);
    const tip = mid.clone().addScaledVector(t, 0.42);
    const shI = pi.clone().addScaledVector(n, -0.16).addScaledVector(t, 0.12);
    const barbI = pi.clone().addScaledVector(n, -0.13).addScaledVector(t, -0.16);
    const seq = fromOuter ? [barbO, shO, tip, shI, barbI, pi] : [barbI, shI, tip, shO, barbO, po];
    for (const q of seq) sh.lineTo(q.x, q.y);
  };
  fluke(a1, 1, true);
  sh.absarc(0, Cy, Ri, a1, a0, true);
  fluke(a0, -1, false);
  A.add(new THREE.Mesh(extr(sh, 0.17), rust));

  // shank with a flared head and an eye hole
  const s2 = new THREE.Shape();
  s2.moveTo(-0.1, 0.12); s2.lineTo(0.1, 0.12); s2.lineTo(0.07, 1.8); s2.lineTo(0.1, 1.86);
  s2.quadraticCurveTo(0.12, 2.04, 0, 2.06); s2.quadraticCurveTo(-0.12, 2.04, -0.1, 1.86); s2.lineTo(-0.07, 1.8); s2.lineTo(-0.1, 0.12);
  const hole = new THREE.Path(); hole.absarc(0, 1.95, 0.045, 0, Math.PI * 2, true); s2.holes.push(hole);
  A.add(new THREE.Mesh(extr(s2, 0.15), rust));
  // crown boss
  const boss = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.22, 8), rustDk); boss.rotation.x = Math.PI / 2; boss.position.y = 0.12; A.add(boss);

  // stock: lathe bar along Z with knob ends
  const pr = [];
  const prof = [[0, -0.78], [0.06, -0.78], [0.085, -0.73], [0.07, -0.66], [0.055, -0.6], [0.08, -0.1], [0.1, -0.06], [0.1, 0.06], [0.08, 0.1], [0.055, 0.6], [0.07, 0.66], [0.085, 0.73], [0.06, 0.78], [0, 0.78]];
  for (const [r, y] of prof) pr.push(new THREE.Vector2(r, y));
  const stock = new THREE.Mesh(new THREE.LatheGeometry(pr, 8), rust); stock.rotation.x = Math.PI / 2; stock.position.y = 1.7; A.add(stock);
  // ring through the eye, in the plane of the stock
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.04, 6, 14), iron); ring.rotation.y = Math.PI / 2; ring.position.set(0, 1.95 + 0.17 - 0.045, 0); A.add(ring);

  // barnacle clusters and kelp
  const rm = (Ro + Ri) / 2, onArc = (deg) => { const q = P(rm, THREE.MathUtils.degToRad(deg)); return [q.x, q.y, 0.08]; };
  const bAt = [[0.02, 0.5, 0.08], [-0.03, 0.62, 0.08], [0.03, 1.2, 0.08], onArc(-50), onArc(-42), onArc(-135), onArc(-150), [0.0, 1.7, 0.4], [0.05, 0.14, 0.12]];
  for (const [x, y, z] of bAt) { const b = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.045, 5), barn); b.rotation.x = Math.PI / 2; b.position.set(x, y, z + 0.015); A.add(b); }
  const tuft = (x, y, z, len, rz) => { const t = new THREE.Mesh(new THREE.ConeGeometry(0.055, len, 3, 1, true), kelp); t.position.set(x, y - len / 2, z); t.rotation.z = rz; t.scale.z = 0.4; A.add(t); };
  tuft(0.0, 1.5, 0.09, 0.3, 0.1); tuft(0.04, 0.9, 0.09, 0.22, -0.15); { const q = P(rm, THREE.MathUtils.degToRad(-160)); tuft(q.x, q.y + 0.05, 0.09, 0.24, 0.2); } tuft(0.0, 1.7, 0.55, 0.2, 0);

  // roll so the crown underside and the +X fluke tip share the ground
  const tA = new THREE.Vector2(-Math.sin(a1), Math.cos(a1));
  const tip = P((Ro + Ri) / 2, a1).addScaledVector(tA, 0.42);
  const crown = new THREE.Vector2(0, Cy - Ro - bev);
  const yr = (p, th) => p.x * Math.sin(th) + p.y * Math.cos(th);
  let lo = -1.4, hi = -0.2;
  for (let i = 0; i < 40; i++) { const md = (lo + hi) / 2; if (yr(crown, md) - yr(tip, md) > 0) lo = md; else hi = md; }
  A.rotation.z = (lo + hi) / 2 + 0.03;
  A.rotation.y = THREE.MathUtils.degToRad(-8);
  g.add(A);
  g.updateMatrixWorld(true);
  const ground = measure(THREE, A, (n) => n.material !== kelp).min.y;
  const ringPt = new THREE.Vector3(0, 1.95 + 0.17 * 2 - 0.045 - 0.04, 0).applyMatrix4(A.matrixWorld);
  g.add(chain(THREE, rustDk, ringPt, new THREE.Vector3(ringPt.x + 0.12, ground, ringPt.z + 0.38), ground));

  place(THREE, g);
  return g;
}

// conical heap: rings shrinking and rising, then the hanging run up to the ring
function chain(THREE, mat, ringPt, c, ground) {
  const pts = [];
  const turns = 3.5, n = 100;
  for (let i = 0; i <= n; i++) {
    const s = i / n, a = s * turns * Math.PI * 2;
    const r = 0.44 * (1 - 0.7 * s);
    pts.push(new THREE.Vector3(c.x + r * Math.cos(a), ground + 0.035 + 0.22 * s, c.z + r * Math.sin(a)));
  }
  const last = pts[pts.length - 1];
  pts.push(new THREE.Vector3(last.x * 0.6 + ringPt.x * 0.4, last.y * 0.5 + ringPt.y * 0.5, last.z * 0.6 + ringPt.z * 0.4), ringPt.clone());
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  const pitch = 0.13, N = Math.floor(curve.getLength() / pitch);
  const geo = new THREE.TorusGeometry(0.058, 0.022, 3, 6);
  const im = new THREE.InstancedMesh(geo, mat, N);
  const up = new THREE.Vector3(0, 1, 0), M = new THREE.Matrix4(), S = new THREE.Matrix4().makeScale(1.45, 1, 1);
  for (let i = 0; i < N; i++) {
    const u = (i + 0.5) / N, p = curve.getPointAt(u), t = curve.getTangentAt(u).normalize();
    const nrm = new THREE.Vector3().crossVectors(t, up); if (nrm.lengthSq() < 1e-4) nrm.set(1, 0, 0); nrm.normalize();
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
