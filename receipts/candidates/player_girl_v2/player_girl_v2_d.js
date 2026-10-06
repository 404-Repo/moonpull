// player_girl v2, B refined after the first pick: the peak cut from 0.24 to 0.13 and the face opening widened from 49 to 57 degrees so she reads as a hooded girl and not a gnome (and loses less height to the 1.45 m fit), scarf switched to red with a second tail, since red is the one hue the sand, cobbles, grass and sea never use.
// 1.45 m, front +Z. Jointed on g.userData.joints, each joint a Group AT its pivot with geometry offset inside.
// Joints: hips spine head left/right Upper/Lower Arm and Leg, lantern (moonstone emissive), scarf (tails, pivot at the back of the neck).
export default function (THREE) {
  const O = {"cloak":0x553020,"rim":0xc08a55,"drapeR":0.21,"patch":0xa0683f,"tunic":0x13807a,"tunicDk":0xd5f5a,"pants":0x4e3a30,"boot":0x6b4128,"cuff":0xe0cfa8,"cuffR":0.08,"scarf":0xd03a2a,"scarfDk":0x8e2019,"pack":0xc9ad7c,"packDk":0x9c7f55,"roll":0x4f7d2e,"capeR":0.24,"moonR":0.047,"hoodR":0.19,"hoodSY":1.05,"headS":0.92,"peak":[[0,0.9,-0.42],0.13,3],"hole":1,"rimT":0.022,"packY":0.08,"packW":0.32,"packH":0.32,"rollW":0.5,"rollTop":true,"cupSide":-1,"cupY":-0.06,"scarfX":-0.06,"tails":[[0.42,-1.1,0.7,0.1],[0.3,-0.6,1.2,0.09]],"tufts":[[0.125,-0.04,0.085,0.35,0,0.09],[0.14,-0.1,0,0.6,0.2,0.08]],"tip":null,"braids":[1]};
  const g = new THREE.Group();
  const M = (color, name, rough = 0.85, extra = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: rough, ...extra });
    if (name) m.name = name;
    return m;
  };
  const skin = M(0xe7b48f, null, 0.8);
  const cloak = M(O.cloak, 'fabric', 0.9);
  const rimM = M(O.rim, 'fabric', 0.9);
  const lining = M(0x33201a, 'fabric', 0.95, { side: THREE.DoubleSide });
  const patch = M(O.patch, 'fabric', 0.9);
  const tunic = M(O.tunic, 'fabric', 0.88);
  const tunicDk = M(O.tunicDk, 'fabric', 0.9);
  const pants = M(O.pants, 'fabric', 0.9);
  const leather = M(0x6b4128, 'fabric', 0.75);
  const boot = M(O.boot, 'fabric', 0.75);
  const cuff = M(O.cuff, 'fabric', 0.85);
  const dark = M(0x2b1d16, null, 0.6);
  const white = M(0xf4eee2, null, 0.6);
  const hair = M(0x4a2c1c, 'fabric', 0.85);
  const scarfM = M(O.scarf, 'fabric', 0.88);
  const scarfDk = M(O.scarfDk, 'fabric', 0.9);
  const pack = M(O.pack, 'fabric', 0.9);
  const packDk = M(O.packDk, 'fabric', 0.9);
  const roll = M(O.roll, 'fabric', 0.9);
  const rollDk = M(0x34501f, 'fabric', 0.9);
  const iron = M(0x3a3d40, 'metal', 0.6, { metalness: 0.4 });
  const tin = M(0xa9aeb0, 'metal', 0.45, { metalness: 0.5 });
  const moon = M(0x9fd8ff, null, 0.3, { emissive: 0x9fd8ff, emissiveIntensity: 1.3 });
  moon.name = 'moonstone';

  const add = (parent, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.scale.set(sx, sy, sz);
    m.castShadow = true; parent.add(m); return m;
  };
  const J = (parent, x, y, z) => { const j = new THREE.Group(); j.position.set(x, y, z); parent.add(j); return j; };
  const sph = (r, w = 10, h = 7) => new THREE.SphereGeometry(r, w, h);
  const cap = (r, len, rs = 8) => new THREE.CapsuleGeometry(r, len, 2, rs);
  const cyl = (rt, rb, h, s = 12, open = false) => new THREE.CylinderGeometry(rt, rb, h, s, 1, open);
  const rbox = (w, h, d, r = 0.02) => { // bevelled box: a box with chamfered vertical edges via an extruded rounded rect
    const s = new THREE.Shape(); const x = w / 2 - r, y = h / 2 - r;
    s.moveTo(-x, -h / 2); s.lineTo(x, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -y); s.lineTo(w / 2, y);
    s.quadraticCurveTo(w / 2, h / 2, x, h / 2); s.lineTo(-x, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, y);
    s.lineTo(-w / 2, -y); s.quadraticCurveTo(-w / 2, -h / 2, -x, -h / 2);
    const e = new THREE.ExtrudeGeometry(s, { depth: d - 2 * r, bevelEnabled: true, bevelThickness: r, bevelSize: r * 0.6, bevelSegments: 1, curveSegments: 2 });
    e.translate(0, 0, -(d - 2 * r) / 2); return e;
  };
  // a sphere with a round hole cut around `axis` (the face opening of a hood)
  const holed = (r, ws, hs, thetaLen, axis, cosHole, peak) => {
    const s = new THREE.SphereGeometry(r, ws, hs, 0, Math.PI * 2, 0, thetaLen);
    if (peak) { // pull the crown out into a point: a smooth teardrop, not a ball
      const [dir, len, pw] = peak, d = dir.clone().normalize(), q = s.attributes.position, u = new THREE.Vector3();
      for (let i = 0; i < q.count; i++) {
        u.fromBufferAttribute(q, i); const w = Math.pow(Math.max(0, u.clone().normalize().dot(d)), pw);
        u.addScaledVector(d, w * len); q.setXYZ(i, u.x, u.y, u.z);
      }
      s.computeVertexNormals();
    }
    s.copy(s.toNonIndexed());
    const p = s.attributes.position, keep = [], ax = axis.clone().normalize(), c = new THREE.Vector3(), v = new THREE.Vector3();
    const o = new THREE.SphereGeometry(r, ws, hs, 0, Math.PI * 2, 0, thetaLen).toNonIndexed().attributes.position; // undeformed, for the cut
    for (let i = 0; i < p.count; i += 3) {
      c.set(0, 0, 0); for (let k = 0; k < 3; k++) c.add(v.fromBufferAttribute(o, i + k));
      if (c.normalize().dot(ax) > cosHole) continue;
      for (let k = 0; k < 3; k++) keep.push(i + k);
    }
    const out = new THREE.BufferGeometry();
    for (const name of ['position', 'normal', 'uv']) {
      const a = s.attributes[name], n = a.itemSize, arr = new Float32Array(keep.length * n);
      keep.forEach((src, d) => { for (let k = 0; k < n; k++) arr[d * n + k] = a.array[src * n + k]; });
      out.setAttribute(name, new THREE.BufferAttribute(arr, n));
    }
    return out;
  };
  // a cone whose axis bends backwards (-Z) along an arc: the hood's point
  const bentCone = (r, len, bend, rs = 10, hs = 6) => {
    const c = new THREE.ConeGeometry(r, len, rs, hs, true); c.translate(0, len / 2, 0);
    const p = c.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i), t = y / len, a = bend * t;
      const cy = Math.abs(bend) < 1e-4 ? y : (len * Math.sin(a)) / bend;
      const cz = Math.abs(bend) < 1e-4 ? 0 : (-len * (1 - Math.cos(a))) / bend;
      p.setXYZ(i, x, cy + z * Math.sin(a), cz + z * Math.cos(a));
    }
    c.computeVertexNormals(); return c;
  };

  // ---- hips (pelvis), world y 0.64
  const hips = J(g, 0, 0.64, 0);
  add(hips, sph(0.14, 12, 8), pants, 0, 0.0, 0, 0, 0, 0, 1, 0.75, 0.8);
  add(hips, cyl(0.135, 0.14, 0.05, 14), leather, 0, 0.05, 0, 0, 0, 0, 1, 1, 0.8);

  // ---- legs
  const legs = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? 'left' : 'right';
    const ul = J(hips, 0.075 * s, -0.03, 0);
    add(ul, cap(0.072, 0.14), pants, 0, -0.13, 0);
    if (s > 0) add(ul, new THREE.BoxGeometry(0.07, 0.07, 0.02), patch, 0.03, -0.16, 0.068, 0, 0.3, 0.2);
    const ll = J(ul, 0, -0.29, 0);
    add(ll, cap(0.064, 0.08), pants, 0, -0.06, 0);
    add(ll, cyl(0.068, 0.064, 0.15, 12), boot, 0, -0.23, 0);
    add(ll, cyl(O.cuffR, O.cuffR - 0.004, 0.055, 12), cuff, 0, -0.15, 0); // turned-down boot cuff, light so it reads mid-stride
    add(ll, cap(0.06, 0.1, 10), boot, 0, -0.3, 0.035, Math.PI / 2, 0, 0, 1.05, 1, 0.9);
    add(ll, new THREE.BoxGeometry(0.13, 0.04, 0.22), dark, 0, -0.335, 0.035);
    legs[side + 'UpperLeg'] = ul; legs[side + 'LowerLeg'] = ll;
  }

  // ---- spine, world y 0.70
  const spine = J(hips, 0, 0.06, 0);
  add(spine, cyl(0.135, 0.18, 0.22, 14), tunic, 0, 0.0, 0, 0, 0, 0, 1, 1, 0.8);
  add(spine, cyl(0.15, 0.135, 0.16, 14), tunic, 0, 0.18, 0, 0, 0, 0, 1, 1, 0.78);
  add(spine, cyl(0.181, 0.181, 0.03, 14), tunicDk, 0, -0.1, 0, 0, 0, 0, 1, 1, 0.8); // hem band
  // capelet
  add(spine, cyl(0.1, O.capeR - 0.005, 0.2, 16, true), lining, 0, 0.23, 0, 0, 0, 0, 1, 1, 0.82);
  add(spine, cyl(0.105, O.capeR, 0.2, 16, true), cloak, 0, 0.23, 0.002, 0, 0, 0, 1.02, 1, 0.84);
  add(spine, new THREE.TorusGeometry(O.capeR, 0.022, 4, 18), rimM, 0, 0.13, 0.002, Math.PI / 2, 0, 0, 1.02, 0.84, 1);
  add(spine, new THREE.BoxGeometry(0.07, 0.06, 0.02), patch, 0.12, 0.2, 0.15, -0.4, 0.5, 0.2);
  add(spine, new THREE.BoxGeometry(0.07, 0.06, 0.02), patch, -0.13, 0.19, -0.16, 0.4, 2.6, 0);
  // strap left shoulder to right hip, satchel
  add(spine, new THREE.BoxGeometry(0.045, 0.44, 0.025), leather, -0.02, 0.12, 0.165, 0.18, 0, -0.75);
  add(spine, new THREE.BoxGeometry(0.055, 0.05, 0.03), iron, 0.04, 0.19, 0.17, 0.18, 0, -0.75);
  add(spine, rbox(0.16, 0.13, 0.08, 0.02), leather, -0.18, -0.06, 0.06, 0, 0.5, 0);

  // ---- backpack: big, two-tone, with a bedroll and a hanging tin cup
  const P = new THREE.Group(); P.position.set(0, O.packY, -0.2); spine.add(P);
  add(P, rbox(O.packW, O.packH, 0.17, 0.035), pack, 0, 0, -0.02);
  add(P, new THREE.CylinderGeometry(0.09, 0.09, O.packW + 0.01, 10, 1, false, 0, Math.PI), packDk, 0, O.packH / 2 - 0.01, -0.02, 0, 0, Math.PI / 2, 1, 1, 1); // top flap
  add(P, rbox(O.packW * 0.62, O.packH * 0.42, 0.06, 0.02), packDk, 0, -O.packH * 0.14, -0.12); // front pocket
  for (const s of [1, -1]) add(P, new THREE.BoxGeometry(0.035, O.packH * 0.75, 0.02), leather, 0.07 * s, 0.02, -0.115); // buckled straps
  for (const s of [1, -1]) add(spine, new THREE.BoxGeometry(0.04, 0.3, 0.02), leather, 0.09 * s, 0.17, 0.12, -0.25, 0, 0); // shoulder straps, front
  const rollY = O.rollTop ? O.packH / 2 + 0.07 : -O.packH / 2 - 0.05;
  add(P, cyl(0.08, 0.08, O.rollW, 12), roll, 0, rollY, -0.03, 0, 0, Math.PI / 2);
  for (const s of [1, -1]) {
    add(P, new THREE.CylinderGeometry(0.05, 0.05, 0.02, 10), rollDk, (O.rollW / 2 + 0.002) * s, rollY, -0.03, 0, 0, Math.PI / 2);
    add(P, new THREE.TorusGeometry(0.082, 0.012, 4, 12), leather, 0.11 * s, rollY, -0.03, 0, Math.PI / 2, 0);
  }
  // tin cup on a hook at the pack's side
  const cupX = (O.packW / 2 + 0.03) * O.cupSide;
  add(P, new THREE.TorusGeometry(0.022, 0.006, 4, 8), iron, cupX, O.cupY + 0.06, -0.03, 0, Math.PI / 2, 0);
  add(P, cyl(0.045, 0.038, 0.07, 10), tin, cupX, O.cupY, -0.03);
  add(P, new THREE.TorusGeometry(0.022, 0.007, 4, 8), tin, cupX + 0.048 * O.cupSide, O.cupY, -0.03);

  // ---- scarf: a ring at the neck plus trailing tails on their own joint so the game can sway them
  add(spine, new THREE.TorusGeometry(0.085, 0.04, 6, 14), scarfM, 0, 0.33, 0.0, Math.PI / 2 + 0.15, 0, 0, 1, 0.92, 1);
  const scarf = J(spine, O.scarfX, 0.33, -0.085);
  add(scarf, sph(0.045, 8, 6), scarfM, 0, 0, 0, 0, 0, 0, 1.1, 0.9, 0.8); // knot
  for (const [len, rz, rx, w] of O.tails) {
    const tg = new THREE.BoxGeometry(w, len, 0.028); tg.translate(0, -len / 2, 0);
    const t = add(scarf, tg, scarfM, 0, 0, 0, rx, 0, rz);
    const fg = new THREE.BoxGeometry(w + 0.01, 0.04, 0.032); fg.translate(0, -len + 0.02, 0);
    add(t, fg, scarfDk); // darker fringed end
  }

  // ---- head, neck at world y 1.02
  const head = J(spine, 0, 0.32, 0);
  add(head, cyl(0.045, 0.05, 0.08, 10), skin, 0, 0.02, 0);
  const H = new THREE.Group(); H.position.set(0, 0.17 - (1 - O.headS) * 0.15, 0.01); H.scale.setScalar(O.headS); head.add(H);
  add(H, sph(0.15, 16, 11), skin, 0, 0, 0, 0, 0, 0, 1, 1.03, 0.97);
  for (const s of [1, -1]) {
    add(H, sph(0.037, 10, 6), white, 0.056 * s, 0.0, 0.126, 0, 0, 0, 0.9, 1.1, 0.5);
    add(H, sph(0.028, 8, 6), dark, 0.057 * s, -0.006, 0.14, 0, 0, 0, 0.9, 1.15, 0.45);
    add(H, new THREE.BoxGeometry(0.055, 0.014, 0.02), hair, 0.057 * s, 0.055, 0.13, 0, 0, -0.15 * s);
    add(H, sph(0.03, 8, 6), M(0xe59c86, null, 0.85), 0.085 * s, -0.055, 0.105, 0, 0, 0, 1, 0.6, 0.4);
  }
  add(H, sph(0.022, 8, 6), skin, 0, -0.035, 0.152, 0, 0, 0, 1, 1, 0.9);
  add(H, cap(0.009, 0.03, 6), M(0x8e4a3c, null, 0.8), 0, -0.088, 0.128, 0, 0, Math.PI / 2, 1, 1, 0.6);
  // hair: cap, fringe, side locks
  add(H, new THREE.SphereGeometry(0.155, 14, 6, 0, Math.PI * 2, 0, 1.2), hair, 0, 0.012, -0.004);
  add(H, sph(0.055, 10, 8), hair, -0.045, 0.075, 0.115, 0.4, 0, 0.6, 1.5, 0.6, 0.55);
  add(H, sph(0.05, 10, 8), hair, 0.065, 0.075, 0.11, 0.4, 0, -0.5, 1.3, 0.6, 0.55);
  // tufts escaping the hood at the cheeks and nape: dark wisps that break the hood's outline
  for (const s of [1, -1]) for (const [x, y, z, rz, rx, l] of O.tufts) {
    const tg = new THREE.ConeGeometry(0.03, l, 6); tg.translate(0, -l / 2, 0);
    add(H, tg, hair, x * s, y, z, rx, 0, rz * s);
  }
  // braids (optional): beads of hair from under the hood down over the shoulders, tied in scarf colour
  if (O.braids) for (const s of O.braids) {
    for (let i = 0; i < 4; i++) add(H, sph(0.034 - i * 0.003, 8, 6), hair, (0.135 + i * 0.012) * s, -0.11 - i * 0.055, 0.03 - i * 0.012, 0, 0, 0, 1, 1.25, 1);
    add(H, sph(0.022, 6, 5), scarfM, 0.183 * s, -0.33, -0.018);
    add(H, new THREE.ConeGeometry(0.026, 0.06, 6), hair, 0.185 * s, -0.37, -0.02, Math.PI);
  }

  // hood: a shell with the face cut out, dark lining inside (the inner shadow), a light rolled rim
  const R = O.hoodR, hc = new THREE.Vector3(0, 0.02, -0.015);
  const axis = new THREE.Vector3(0, -0.12, 1).normalize(), ang = O.hole;
  const hood = new THREE.Group(); hood.position.copy(hc); hood.scale.set(1, O.hoodSY, 1); H.add(hood);
  const pk = O.peak && [new THREE.Vector3(...O.peak[0]), O.peak[1], O.peak[2]];
  const pkIn = pk && [pk[0], pk[1] * 0.85, pk[2]];
  add(hood, holed(R, 18, 13, 2.3, axis, Math.cos(ang), pk), cloak);
  add(hood, holed(R - 0.012, 16, 11, 2.3, axis, Math.cos(ang), pkIn), lining);
  add(hood, new THREE.TorusGeometry(R * Math.sin(ang) - 0.004, O.rimT, 6, 18), rimM,
    axis.x * R * Math.cos(ang), axis.y * R * Math.cos(ang), axis.z * R * Math.cos(ang), Math.asin(0.12), 0, 0);
  // the point of the hood
  if (O.tip) {
    const [len, bend, tilt, r0, ty, tz] = O.tip;
    add(hood, bentCone(r0, len, bend), cloak, 0, ty, tz, tilt);
  } else if (!O.peak) add(hood, new THREE.ConeGeometry(0.055, 0.085, 8), cloak, 0, 0.1, -0.16, -0.75);
  add(hood, new THREE.BoxGeometry(0.07, 0.06, 0.02), patch, 0.09, 0.11, -0.13, -0.7, 0.6, 0);
  // hood drape down the back of the neck
  add(H, cyl(0.13, O.drapeR, 0.16, 14, true), cloak, 0, -0.18, -0.03, 0, 0, 0, 1, 1, 0.9);

  // ---- arms, shoulders at world y 0.97
  const arms = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? 'left' : 'right';
    const ua = J(spine, 0.165 * s, 0.26, 0);
    ua.rotation.z = 0.36 * s;
    add(ua, sph(0.06, 10, 8), tunic, 0, -0.01, 0);
    add(ua, cap(0.048, 0.13), tunic, 0, -0.1, 0);
    const la = J(ua, 0, -0.2, 0);
    add(la, cap(0.044, 0.1), tunic, 0, -0.06, 0);
    add(la, cyl(0.05, 0.05, 0.04, 10), tunicDk, 0, -0.13, 0);
    add(la, sph(0.042, 10, 8), skin, 0, -0.19, 0.005, 0, 0, 0, 0.8, 1.1, 0.95);
    add(la, cap(0.016, 0.03, 6), skin, -0.03 * s, -0.17, 0.03, 0.5, 0, 0.4 * s);
    arms[side + 'UpperArm'] = ua; arms[side + 'LowerArm'] = la;
  }

  // ---- lantern from the right hand
  const lantern = J(arms.rightLowerArm, 0, -0.2, 0.01);
  lantern.rotation.z = 0.36;
  add(lantern, new THREE.TorusGeometry(0.03, 0.008, 6, 12, Math.PI), iron, 0, -0.03, 0, 0, 0, Math.PI);
  add(lantern, cyl(0.012, 0.05, 0.04, 10), iron, 0, -0.07, 0);
  add(lantern, cyl(0.055, 0.055, 0.015, 12), iron, 0, -0.095, 0);
  add(lantern, cyl(O.moonR, O.moonR, 0.09, 12), moon, 0, -0.145, 0);
  add(lantern, cyl(0.055, 0.05, 0.03, 12), iron, 0, -0.2, 0);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    add(lantern, new THREE.BoxGeometry(0.012, 0.1, 0.012), iron, Math.cos(a) * 0.05, -0.145, Math.sin(a) * 0.05);
  }

  g.userData.joints = { hips, spine, head, ...arms, ...legs, lantern, scarf };

  // contract recentring: move root children only so the joint hierarchy stays intact
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
  // scale to exactly 1.45 m about the ground point, so the hood's point does not make her taller
  const k = 1.45 / (box.max.y - box.min.y);
  g.children.forEach((o) => { o.position.multiplyScalar(k); o.scale.multiplyScalar(k); });
  g.userData.fitScale = k;
  return g;
}
