// player_girl, candidate B: profiles. Head, hood, tunic, capelet, sleeves, trousers and boots are
// Lathe sweeps; feet, backpack and satchel are Extrudes. 1.45 m, front +Z, jointed.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, rough = 0.85, extra = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: rough, ...extra });
    if (name) m.name = name;
    return m;
  };
  const skin = M(0xe7b48f, null, 0.8);
  const hoodC = M(0x8a5636, 'fabric', 0.9, { side: THREE.DoubleSide });
  const hoodIn = M(0x5c3622, 'fabric', 0.9, { side: THREE.DoubleSide });
  const patch = M(0xa9714a, 'fabric', 0.9);
  const tunic = M(0x4c7d74, 'fabric', 0.88);
  const tunicDk = M(0x3d675f, 'fabric', 0.9);
  const pants = M(0x7a4a32, 'fabric', 0.9);
  const leather = M(0x8c5a34, 'fabric', 0.75);
  const leatherDk = M(0x6e4428, 'fabric', 0.8);
  const dark = M(0x2b1d16, null, 0.6);
  const white = M(0xf4eee2, null, 0.6);
  const hair = M(0x5a3826, 'fabric', 0.85);
  const blush = M(0xe59c86, null, 0.85);
  const mouth = M(0x8e4a3c, null, 0.8);
  const pack = M(0xb79773, 'fabric', 0.9);
  const roll = M(0x55703c, 'fabric', 0.9);
  const rollDk = M(0x3f5a2e, 'fabric', 0.9);
  const iron = M(0x3a3d40, 'metal', 0.6, { metalness: 0.4 });
  const moon = M(0x9fd8ff, null, 0.3, { emissive: 0x9fd8ff, emissiveIntensity: 1.3 });
  moon.name = 'moonstone';

  const add = (parent, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.scale.set(sx, sy, sz);
    m.castShadow = true; parent.add(m); return m;
  };
  const J = (parent, x, y, z) => { const j = new THREE.Group(); j.position.set(x, y, z); parent.add(j); return j; };
  const lathe = (pts, seg = 14, p0 = 0, pl = Math.PI * 2) =>
    new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg, p0, pl);
  const sph = (r, w = 10, h = 8) => new THREE.SphereGeometry(r, w, h);
  // rounded-rectangle extrude, bevel subtracted from the profile so the size is what is asked
  const rbox = (w, h, d, r, bev = 0.012) => {
    const s = new THREE.Shape(); const x = w / 2 - bev, y = h / 2 - bev, rr = Math.min(r, x, y);
    s.moveTo(-x + rr, -y); s.lineTo(x - rr, -y); s.quadraticCurveTo(x, -y, x, -y + rr);
    s.lineTo(x, y - rr); s.quadraticCurveTo(x, y, x - rr, y); s.lineTo(-x + rr, y);
    s.quadraticCurveTo(-x, y, -x, y - rr); s.lineTo(-x, -y + rr); s.quadraticCurveTo(-x, -y, -x + rr, -y);
    const geo = new THREE.ExtrudeGeometry(s, { depth: d - 2 * bev, bevelEnabled: true, bevelSize: bev, bevelThickness: bev, bevelSegments: 1, curveSegments: 3 });
    geo.translate(0, 0, -(d - 2 * bev) / 2); return geo;
  };

  // ---- hips, world y 0.64
  const hips = J(g, 0, 0.64, 0);
  add(hips, lathe([[0, -0.1], [0.1, -0.09], [0.14, -0.04], [0.145, 0.03], [0.14, 0.08], [0, 0.08]], 16), pants, 0, 0, 0, 0, 0, 0, 1, 1, 0.8);
  add(hips, lathe([[0.138, 0.03], [0.145, 0.04], [0.145, 0.08], [0.138, 0.09]], 16), leather, 0, 0, 0, 0, 0, 0, 1, 1, 0.82);

  // ---- legs: puffy trouser sweep, blousy cuff, boot shaft sweep, extruded foot
  const footShape = new THREE.Shape();
  footShape.moveTo(-0.055, 0); footShape.lineTo(0.1, 0); footShape.quadraticCurveTo(0.135, 0, 0.13, 0.035);
  footShape.quadraticCurveTo(0.12, 0.075, 0.05, 0.08); footShape.lineTo(-0.055, 0.085); footShape.lineTo(-0.055, 0);
  const footGeo = new THREE.ExtrudeGeometry(footShape, { depth: 0.1, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 1, curveSegments: 5 });
  footGeo.translate(0, 0.012, -0.05); footGeo.rotateY(-Math.PI / 2);
  const legs = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? 'left' : 'right';
    const ul = J(hips, 0.075 * s, -0.03, 0);
    add(ul, lathe([[0, 0.04], [0.06, 0.03], [0.08, -0.04], [0.082, -0.14], [0.072, -0.25], [0.06, -0.3], [0, -0.31]], 12), pants);
    if (s > 0) add(ul, rbox(0.075, 0.07, 0.03, 0.01, 0.006), patch, 0.03, -0.16, 0.07, 0, 0.35, 0.2);
    const ll = J(ul, 0, -0.29, 0);
    add(ll, lathe([[0, 0.02], [0.062, 0.01], [0.07, -0.06], [0.08, -0.12], [0.074, -0.155], [0.05, -0.17], [0, -0.17]], 12), pants);
    add(ll, lathe([[0.058, -0.15], [0.074, -0.155], [0.078, -0.18], [0.068, -0.19], [0.066, -0.27], [0.07, -0.29], [0, -0.3]], 12), leather);
    add(ll, footGeo, leather, 0, -0.355, -0.0);
    add(ll, new THREE.BoxGeometry(0.12, 0.03, 0.2), dark, 0, -0.34, 0.035);
    legs[side + 'UpperLeg'] = ul; legs[side + 'LowerLeg'] = ll;
  }

  // ---- spine, world y 0.70
  const spine = J(hips, 0, 0.06, 0);
  add(spine, lathe([[0, -0.12], [0.18, -0.13], [0.182, -0.1], [0.15, 0.02], [0.14, 0.13], [0.155, 0.22], [0.13, 0.29], [0.06, 0.32], [0, 0.32]], 18), tunic, 0, 0, 0, 0, 0, 0, 1, 1, 0.78);
  // capelet: a draped sweep whose hem is pushed up and down per vertex so it hangs ragged
  const capeGeo = lathe([[0.25, 0.1], [0.245, 0.13], [0.215, 0.2], [0.16, 0.27], [0.11, 0.315], [0.085, 0.33]], 20);
  { const p = capeGeo.attributes.position; const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); if (v.y < 0.12) { const a = Math.atan2(v.x, v.z); p.setY(i, v.y + 0.022 * Math.sin(a * 5) + 0.01 * Math.cos(a * 3)); } }
    capeGeo.computeVertexNormals(); }
  add(spine, capeGeo, hoodC, 0, 0, 0, 0, 0, 0, 1, 1, 0.84);
  add(spine, rbox(0.075, 0.065, 0.02, 0.012, 0.005), patch, 0.12, 0.21, 0.16, -0.5, 0.55, 0.2);
  add(spine, rbox(0.065, 0.06, 0.02, 0.012, 0.005), patch, -0.19, 0.17, -0.07, 0, -1.4, 0);
  add(spine, rbox(0.07, 0.06, 0.02, 0.012, 0.005), patch, 0.05, 0.2, -0.19, 0.4, Math.PI, 0);
  for (const r of [0.7, -0.7]) add(spine, new THREE.BoxGeometry(0.06, 0.014, 0.014), leatherDk, 0, 0.3, 0.115, -0.6, 0, r);
  // shoulder strap over the capelet, buckle, satchel at the right hip
  add(spine, new THREE.BoxGeometry(0.045, 0.44, 0.025), leather, -0.02, 0.12, 0.17, 0.2, 0, -0.75);
  add(spine, rbox(0.06, 0.055, 0.03, 0.01, 0.005), iron, 0.045, 0.19, 0.18, 0.2, 0, -0.75);
  add(spine, rbox(0.17, 0.14, 0.08, 0.03), leather, -0.19, -0.05, 0.06, 0, 0.5, 0);
  add(spine, rbox(0.175, 0.07, 0.088, 0.02), leatherDk, -0.19, -0.005, 0.062, 0, 0.5, 0);
  // backpack: rounded extrude, front pocket, bedroll with spiral ends and two straps
  add(spine, rbox(0.27, 0.29, 0.14, 0.06), pack, 0, 0.15, -0.18);
  add(spine, rbox(0.18, 0.13, 0.05, 0.03), M(0x9a7c58, 'fabric', 0.9), 0, 0.08, -0.26);
  add(spine, new THREE.CylinderGeometry(0.075, 0.075, 0.34, 14), roll, 0, 0.35, -0.19, 0, 0, Math.PI / 2);
  for (const s of [1, -1]) {
    add(spine, new THREE.TorusGeometry(0.045, 0.014, 5, 12), rollDk, 0.17 * s, 0.35, -0.19, 0, Math.PI / 2, 0);
    add(spine, new THREE.TorusGeometry(0.077, 0.012, 5, 14), leather, 0.09 * s, 0.35, -0.19, 0, Math.PI / 2, 0);
  }

  // ---- head (neck at world y 1.02)
  const head = J(spine, 0, 0.32, 0);
  add(head, new THREE.CylinderGeometry(0.045, 0.05, 0.08, 10), skin, 0, 0.02, 0);
  const H = new THREE.Group(); H.position.set(0, 0.17, 0.01); head.add(H);
  add(H, lathe([[0, -0.15], [0.065, -0.145], [0.115, -0.11], [0.143, -0.045], [0.15, 0.03], [0.14, 0.095], [0.105, 0.14], [0.055, 0.162], [0, 0.166]], 18), skin, 0, 0, 0, 0, 0, 0, 1, 1, 0.97);
  // eyes as extruded ovals (sclera, iris), brows, nose, mouth, cheeks
  const oval = (rx, ry, d) => { const s = new THREE.Shape(); s.absellipse(0, 0, rx, ry, 0, Math.PI * 2); return new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: true, bevelSize: 0.004, bevelThickness: 0.004, bevelSegments: 1, curveSegments: 10 }); };
  for (const s of [1, -1]) {
    add(H, oval(0.028, 0.034, 0.008), white, 0.056 * s, -0.002, 0.124, 0, 0.32 * s, 0);
    add(H, oval(0.021, 0.027, 0.008), dark, 0.057 * s, -0.007, 0.132, 0, 0.32 * s, 0);
    add(H, new THREE.CapsuleGeometry(0.009, 0.04, 2, 6), hair, 0.058 * s, 0.056, 0.128, 0, 0.3 * s, Math.PI / 2 - 0.15 * s);
    add(H, sph(0.03, 8, 6), blush, 0.088 * s, -0.055, 0.1, 0, 0, 0, 1, 0.6, 0.4);
  }
  add(H, sph(0.022, 10, 8), skin, 0, -0.035, 0.15);
  add(H, new THREE.CapsuleGeometry(0.009, 0.03, 2, 6), mouth, 0, -0.088, 0.125, 0, 0, Math.PI / 2, 1, 1, 0.6);
  // hair: skull cap + fringe sweep + side locks
  add(H, new THREE.SphereGeometry(0.156, 16, 6, 0, Math.PI * 2, 0, 1.2), hair, 0, 0.012, -0.004);
  add(H, sph(0.055, 10, 8), hair, -0.045, 0.075, 0.115, 0.4, 0, 0.6, 1.5, 0.6, 0.55);
  add(H, sph(0.05, 10, 8), hair, 0.065, 0.075, 0.11, 0.4, 0, -0.5, 1.3, 0.6, 0.55);
  for (const s of [1, -1]) add(H, lathe([[0, 0.05], [0.03, 0.04], [0.035, -0.02], [0.02, -0.07], [0, -0.08]], 8), hair, 0.128 * s, -0.04, 0.05, 0.1, 0, 0.15 * s);
  // hood: lathe opened over the face (phi 0 = +Z), outer and lining, a soft point at the back
  const hoodPts = [[0.12, -0.24], [0.16, -0.17], [0.188, -0.07], [0.195, 0.03], [0.18, 0.12], [0.135, 0.19], [0.07, 0.225], [0.01, 0.23]];
  add(H, lathe(hoodPts, 18, 0.95, Math.PI * 2 - 1.9), hoodC, 0, 0.0, -0.02);
  add(H, lathe(hoodPts.map(([r, y]) => [r * 0.93, y]), 18, 0.95, Math.PI * 2 - 1.9), hoodIn, 0, 0.0, -0.02);
  add(H, new THREE.ConeGeometry(0.06, 0.1, 8), hoodC, 0, 0.11, -0.2, -1.3);
  add(H, rbox(0.07, 0.06, 0.02, 0.012, 0.005), patch, 0.09, 0.13, -0.13, -0.7, 0.6, 0);
  add(H, rbox(0.06, 0.05, 0.02, 0.012, 0.005), patch, -0.17, 0.0, 0.0, 0, -1.4, 0);

  // ---- arms (shoulders at world y 0.97), splayed ~20 degrees
  const arms = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? 'left' : 'right';
    const ua = J(spine, 0.165 * s, 0.26, 0);
    ua.rotation.z = 0.36 * s;
    add(ua, lathe([[0, 0.05], [0.05, 0.04], [0.06, 0.0], [0.052, -0.1], [0.048, -0.2], [0, -0.21]], 10), tunic);
    const la = J(ua, 0, -0.2, 0);
    add(la, lathe([[0, 0.02], [0.047, 0.01], [0.044, -0.08], [0.052, -0.12], [0.055, -0.14], [0.03, -0.145], [0, -0.145]], 10), tunic);
    add(la, sph(0.042, 10, 8), skin, 0, -0.19, 0.005, 0, 0, 0, 0.8, 1.1, 0.95);
    add(la, new THREE.CapsuleGeometry(0.016, 0.03, 2, 6), skin, -0.03 * s, -0.17, 0.03, 0.5, 0, 0.4 * s);
    arms[side + 'UpperArm'] = ua; arms[side + 'LowerArm'] = la;
  }

  // ---- lantern from the right hand: lathe body, moonstone glass, wire cage
  const lantern = J(arms.rightLowerArm, 0, -0.2, 0.01);
  lantern.rotation.z = 0.36;
  add(lantern, new THREE.TorusGeometry(0.03, 0.008, 5, 10, Math.PI), iron, 0, -0.03, 0, 0, 0, Math.PI);
  add(lantern, lathe([[0, -0.04], [0.058, -0.075], [0.058, -0.085], [0.015, -0.035], [0, -0.03]], 12), iron);
  add(lantern, lathe([[0, -0.09], [0.04, -0.09], [0.05, -0.12], [0.05, -0.17], [0.04, -0.195], [0, -0.195]], 12), moon);
  add(lantern, lathe([[0, -0.19], [0.055, -0.19], [0.055, -0.215], [0, -0.22]], 12), iron);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    add(lantern, new THREE.BoxGeometry(0.012, 0.11, 0.012), iron, Math.cos(a) * 0.055, -0.14, Math.sin(a) * 0.055);
  }

  g.userData.joints = { hips, spine, head, ...arms, ...legs, lantern };

  const box = new THREE.Box3(), v = new THREE.Vector3(), m = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => {
    const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(m.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld);
  });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  return g;
}
