// undertow_crab, candidate C: the shore crab's giant cousin wearing the fishing boat.
// Crab: hand-built faceted carapace lofted from a crenellated outline (shore_crab C's method),
// flat-shaded hex leg segments with knuckles and spikes, faceted chelae with toothed fingers,
// and a soft curled abdomen lofted along a spiral curve. Shell: the fishing boat's clinker hull
// (vertex-built strakes) turned keel up, crusted with barnacles, weed, kelp, coral and a
// snapped rudder. ~9 m tall, ~12 m long, front +Z, crab's left = +X.
// Joints (Groups at their pivots): body, shell (top-level, lift it off), clawL/clawR at the
// shoulder, clawLPincer/clawRPincer at the dactyl hinge, eyeL/eyeR at the stalk base,
// legL0..2/legR0..2 at the body.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, rough = 0.78, extra = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: rough, flatShading: true, ...extra }); if (name) m.name = name; return m; };
  const D = THREE.DoubleSide;
  const red = M(0xc9602f, null, 0.72);
  const redDark = M(0xa8462a, null, 0.72);
  const tan = M(0xd99a6c, null, 0.8);
  const tip = M(0x7a3a22, null, 0.7);
  const pink = M(0xe8b3a1, null, 0.85);
  const eyeM = new THREE.MeshStandardMaterial({ color: 0x7ff6ff, emissive: 0x7ff6ff, emissiveIntensity: 1.3, roughness: 0.3 });
  eyeM.name = 'bosseye';
  const hullBlue = M(0x55687a, 'timber', 0.85, { side: D, flatShading: false });
  const hullRed = M(0xb5543a, 'timber', 0.8, { side: D, flatShading: false });
  const wet = M(0x4a3426, 'timber', 0.6, { side: D, flatShading: false });
  const wood = M(0x7b5a3e, 'timber', 0.85);
  const cream = M(0xd9cfb6, 'stone', 0.85);
  const kelp = M(0x4f5a2c, 'foliage', 0.9, { side: D });
  const rope = M(0xa58a5c, 'fabric', 0.95);
  const coralB = M(0x3f6fa8, null, 0.8);

  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const Y = V(0, 1, 0);
  const add = (parent, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.scale.set(sx, sy, sz); parent.add(m); return m;
  };
  const seg = (parent, a, b, r0, r1, mat, flat = 0.82, sides = 6) => {
    const d = b.clone().sub(a); const L = d.length();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, L, sides, 1), mat);
    m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(Y, d.normalize());
    m.scale.set(1, 1, flat); parent.add(m); return m;
  };
  const spike = (parent, p, dir, r, h, mat = tip) => {
    const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 4), mat);
    const n = dir.clone().normalize(); m.position.copy(p).addScaledVector(n, h * 0.4); m.quaternion.setFromUnitVectors(Y, n); parent.add(m); return m;
  };
  // loft a closed tube along a curve with a radius function (faceted, capped)
  const loft = (curve, rad, segs, sides, sqx = 1) => {
    const fr = curve.computeFrenetFrames(segs, false); const pos = [], idx = [];
    for (let i = 0; i <= segs; i++) {
      const t = i / segs, c = curve.getPointAt(t), r = rad(t);
      for (let j = 0; j < sides; j++) {
        const a = (j / sides) * Math.PI * 2;
        const o = fr.normals[i].clone().multiplyScalar(Math.cos(a) * r * sqx).addScaledVector(fr.binormals[i], Math.sin(a) * r);
        pos.push(c.x + o.x, c.y + o.y, c.z + o.z);
      }
    }
    for (let i = 0; i < segs; i++) for (let j = 0; j < sides; j++) {
      const a = i * sides + j, b = i * sides + (j + 1) % sides, c = a + sides, d = b + sides; idx.push(a, c, b, b, c, d);
    }
    for (const [i, flip] of [[0, true], [segs, false]]) {
      const ci = pos.length / 3, p = curve.getPointAt(i / segs); pos.push(p.x, p.y, p.z);
      for (let j = 0; j < sides; j++) { const a = i * sides + j, b = i * sides + (j + 1) % sides; if (flip) idx.push(ci, a, b); else idx.push(ci, b, a); }
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
    return geo;
  };

  // ================= BODY =================
  const body = new THREE.Group(); body.position.set(0, 2.55, 0.9); body.scale.setScalar(1.22); g.add(body);
  const joints = { body };
  // carapace: crenellated outline lofted through rings (shore crab method, hermit proportions)
  {
    const K = 24, RX = 1.45, RZ = 1.35, cz = 1.85;
    const outline = [];
    for (let k = 0; k < K; k++) {
      const t = (k / K) * Math.PI * 2, sx = Math.sin(t), czz = Math.cos(t);
      let f = 1; if (czz > 0 && Math.abs(sx) > 0.3) f = k % 2 ? 1.07 : 0.97;
      if (czz > 0.92) f = 0.86;
      outline.push([sx * RX * f, czz * RZ * f * (czz > 0 ? 1.05 : 0.9)]);
    }
    const rings = [[-0.62, 0.78], [-0.25, 0.98], [0.12, 1.0], [0.5, 0.86], [0.78, 0.58]];
    const pos = [];
    const P = (r, k) => { const [x, z] = outline[k % K]; const [y, s] = rings[r]; return [x * s, y, z * s + cz]; };
    const tri = (a, b, c) => pos.push(...a, ...b, ...c);
    for (let r = 0; r < rings.length - 1; r++) for (let k = 0; k < K; k++) { const a = P(r, k), b = P(r, k + 1), c = P(r + 1, k + 1), d = P(r + 1, k); tri(a, c, b); tri(a, d, c); }
    const top = [0, 0.9, cz - 0.1], bot = [0, -0.7, cz];
    for (let k = 0; k < K; k++) { tri(P(rings.length - 1, k), top, P(rings.length - 1, k + 1)); tri(P(0, k + 1), bot, P(0, k)); }
    const cg = new THREE.BufferGeometry(); cg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); cg.computeVertexNormals();
    // make sure the top faces outward
    { const n = new THREE.Vector3(); const a = V(...P(4, 0)), b = V(...top), c = V(...P(4, 1)); n.copy(b.sub(a)).cross(c.sub(a)); if (n.y < 0) { const p = cg.attributes.position; for (let i = 0; i < p.count; i += 3) { const x = p.getX(i + 1), y = p.getY(i + 1), z = p.getZ(i + 1); p.setXYZ(i + 1, p.getX(i + 2), p.getY(i + 2), p.getZ(i + 2)); p.setXYZ(i + 2, x, y, z); } cg.computeVertexNormals(); } }
    add(body, cg, red);
    // rim band, grooves and lobes
    add(body, new THREE.CylinderGeometry(1, 1, 0.16, 24, 1, true), redDark, 0, -0.1, cz, 0, 0, 0, RX * 1.0, 1, RZ * 0.98).material.side = D;
    for (const s of [1, -1]) {
      add(body, new THREE.DodecahedronGeometry(1, 0), red, 0.55 * s, 0.68, cz + 0.2, 0, 0.4 * s, 0, 0.5, 0.22, 0.55);
      add(body, new THREE.DodecahedronGeometry(1, 0), redDark, 0.85 * s, 0.35, cz + 0.75, 0, 0.3 * s, 0, 0.35, 0.2, 0.3);
      for (let i = 0; i < 4; i++) spike(body, V((0.5 + i * 0.22) * s, 0.55 - i * 0.12, cz + 0.9 + i * 0.05), V(0.3 * s, 1, 0.6), 0.07, 0.22, tan);
    }
    add(body, new THREE.DodecahedronGeometry(1, 0), redDark, 0, 0.82, cz + 0.55, 0, 0, 0, 0.32, 0.12, 0.3);
    // pale underside / sternum
    add(body, new THREE.CylinderGeometry(1.15, 0.9, 0.3, 8), tan, 0, -0.6, cz - 0.1, 0, 0, 0, 1, 1, 1.0);
    // face plate (rostrum and mouthparts)
    add(body, new THREE.DodecahedronGeometry(1, 0), tan, 0, -0.05, cz + 1.25, 0, 0, 0, 0.6, 0.45, 0.3);
    for (const s of [1, -1]) {
      const a = V(0.22 * s, -0.25, cz + 1.35), b = V(0.32 * s, -0.75, cz + 1.65), c = V(0.25 * s, -1.05, cz + 1.55);
      seg(body, a, b, 0.11, 0.1, tan); add(body, new THREE.DodecahedronGeometry(0.12, 0), red, b.x, b.y, b.z); seg(body, b, c, 0.1, 0.05, tan);
      // antennae: long whips forward and out
      const r0 = V(0.15 * s, 0.25, cz + 1.3), r1 = V(0.75 * s, 0.85, cz + 2.0), r2 = V(1.9 * s, 1.0, cz + 2.6);
      seg(body, r0, r1, 0.06, 0.045, red, 1, 5); seg(body, r1, r2, 0.045, 0.02, redDark, 1, 5);
      seg(body, V(0.08 * s, 0.1, cz + 1.35), V(0.3 * s, 0.7, cz + 1.75), 0.05, 0.035, tan, 1, 5);
    }
  }
  // abdomen: soft, pale pink, curling up and back into the shell, banded segments
  {
    const curve = new THREE.CatmullRomCurve3([V(0, -0.1, 1.2), V(0.05, 0.25, -0.2), V(0.2, 0.9, -1.6), V(0.35, 1.7, -2.7), V(0.45, 2.45, -3.1), V(0.4, 2.9, -2.6), V(0.25, 2.85, -1.8)]);
    const rad = (t) => { const base = t < 0.12 ? 1.0 + t * 3 : 1.4 - (t - 0.12) * 1.25; const band = 1 + 0.07 * Math.cos(t * Math.PI * 2 * 7); return Math.max(0.25, base) * band; };
    add(body, loft(curve, rad, 42, 10, 1.15), pink);
    // dorsal plates on the abdomen, a few darker bands
    for (const t of [0.1, 0.24, 0.38]) {
      const p = curve.getPointAt(t), tg = curve.getTangentAt(t);
      const m = add(body, new THREE.TorusGeometry(rad(t) * 0.98, 0.07, 4, 12), tan, p.x, p.y, p.z);
      m.quaternion.setFromUnitVectors(V(0, 0, 1), tg); m.scale.set(1.12, 1, 1);
    }
    // tail fan (uropods) at the curled tip
    const pe = curve.getPointAt(1);
    for (const s of [1, -1]) add(body, new THREE.DodecahedronGeometry(1, 0), redDark, pe.x + 0.25 * s, pe.y - 0.1, pe.z + 0.25, 0.3, 0, 0.3 * s, 0.32, 0.12, 0.42);
  }
  // eyes on stalks
  for (const s of [1, -1]) {
    const e = new THREE.Group(); e.position.set(0.38 * s, 0.75, 3.05); body.add(e);
    const top = V(0.26 * s, 1.15, 0.35);
    seg(e, V(0, 0, 0), V(0.1 * s, 0.6, 0.15), 0.22, 0.19, red, 1);
    seg(e, V(0.1 * s, 0.6, 0.15), top, 0.19, 0.16, tan, 1);
    add(e, new THREE.TorusGeometry(0.2, 0.07, 4, 8), redDark, top.x, top.y + 0.02, top.z, Math.PI / 2 - 0.2, 0, 0);
    add(e, new THREE.SphereGeometry(0.3, 10, 8), eyeM, top.x, top.y + 0.3, top.z + 0.05, 0, 0, 0, 0.85, 1.2, 0.85);
    joints[s > 0 ? 'eyeL' : 'eyeR'] = e;
  }

  // ================= LEGS =================
  const knuck = new THREE.DodecahedronGeometry(1, 0);
  const legZ = [1.95, 1.15, 0.35], legFwd = [0.6, 0.1, -0.45];
  for (const s of [1, -1]) for (let i = 0; i < 3; i++) {
    const j = new THREE.Group(); j.position.set(1.15 * s, -0.25, legZ[i]); j.rotation.y = -s * legFwd[i]; body.add(j);
    const k = 1 - i * 0.07;
    const p0 = V(0, 0, 0), p1 = V(0.95 * s * k, 0.4, 0), p2 = V(1.85 * s * k, 0.6, 0), p3 = V(2.75 * s * k, -0.85, 0), p4 = V(3.1 * s * k, -1.85, 0);
    seg(j, p0, p1, 0.42, 0.38, red);
    add(j, knuck, red, p1.x, p1.y, p1.z, 0, 0, 0, 0.36, 0.34, 0.3);
    seg(j, p1, p2, 0.38, 0.36, red);
    add(j, knuck, redDark, p2.x, p2.y, p2.z, 0, 0, 0, 0.38, 0.36, 0.32);
    seg(j, p2, p3, 0.34, 0.27, red);
    add(j, knuck, redDark, p3.x, p3.y, p3.z, 0, 0, 0, 0.25, 0.24, 0.21);
    seg(j, p3, p4, 0.25, 0.05, tip);
    spike(j, p1.clone().lerp(p2, 0.5), V(0, 1, 0), 0.07, 0.22);
    spike(j, p2.clone().lerp(p3, 0.35), V(0.4 * s, 1, 0), 0.06, 0.2);
    spike(j, p2.clone().lerp(p3, 0.7), V(0.4 * s, 1, 0), 0.05, 0.18);
    joints[(s > 0 ? 'legL' : 'legR') + i] = j;
  }

  // ================= CLAWS =================
  // claw-local frame: arm runs out and forward, hand points +Z; pincer (dactyl) hinged on top,
  // opens with rotation.x < 0.
  const finger = (parent, pts, r0, mat) => {
    for (let i = 0; i < pts.length - 1; i++) seg(parent, pts[i], pts[i + 1], r0 * (1 - i / (pts.length - 1)) + 0.03, r0 * (1 - (i + 1) / (pts.length - 1)) + 0.02, mat, 0.75, 5);
  };
  for (const s of [1, -1]) {
    const big = s < 0, k = big ? 1.15 : 0.7;
    const j = new THREE.Group(); j.position.set(1.05 * s, -0.25, 2.45); body.add(j);
    const p1 = V(0.85 * s, -0.3, 0.25), p2 = V(1.25 * s * (big ? 1.1 : 1), -0.35, 0.6);
    seg(j, V(0, 0, 0), p1, 0.38, 0.36, red);
    add(j, knuck, red, p1.x, p1.y, p1.z, 0, 0, 0, 0.42, 0.4, 0.38);
    seg(j, p1, p2, 0.38, 0.42 * k, red);
    spike(j, p1.clone().lerp(p2, 0.5), V(0.3 * s, 1, 0.2), 0.08, 0.25);
    const hand = new THREE.Group(); hand.position.copy(p2); hand.rotation.set(0.15, -(big ? 0.5 : 0.4) * s, 0); hand.scale.setScalar(k); j.add(hand);
    // palm: faceted hex prism, swollen, pale inner face
    add(hand, new THREE.CylinderGeometry(0.5, 0.58, 1.5, 6), red, 0, 0, 0.7, Math.PI / 2, 0, 0, 0.8, 1, 1.05);
    add(hand, new THREE.DodecahedronGeometry(1, 0), tan, -0.22 * s, -0.05, 0.75, 0, 0, 0, 0.3, 0.5, 0.65);
    add(hand, new THREE.DodecahedronGeometry(1, 0), red, 0, 0.05, 0.05, 0, 0, 0, 0.45, 0.5, 0.35);
    for (let i = 0; i < 4; i++) spike(hand, V(0.2 * s, 0.45, 0.25 + i * 0.32), V(0.3 * s, 1, 0.3), 0.07, 0.2);
    for (let i = 0; i < 3; i++) add(hand, knuck, cream, 0.38 * s, 0.1 - i * 0.18, 0.5 + i * 0.3, 0, i, 0, 0.07, 0.06, 0.07);
    // fixed finger (pollex): from the lower front of the palm, curving up
    const fx = [V(0, -0.3, 1.35), V(0, -0.38, 1.9), V(0, -0.28, 2.45), V(0, -0.05, 2.85)];
    finger(hand, fx, 0.42, red);
    add(hand, knuck, tip, 0, -0.05, 2.85, 0, 0, 0, 0.08, 0.08, 0.08);
    for (let i = 0; i < 4; i++) spike(hand, fx[0].clone().lerp(fx[2], 0.1 + i * 0.27).add(V(0, 0.22, 0)), V(0, 1, 0.15), 0.09, 0.26, cream);
    // dactyl (the moving pincer), hinged on the upper front of the palm
    const pin = new THREE.Group(); pin.position.set(0, 0.3, 1.35); hand.add(pin);
    const dx = [V(0, 0, 0), V(0, 0.1, 0.6), V(0, -0.02, 1.15), V(0, -0.3, 1.5)];
    finger(pin, dx, 0.38, redDark);
    add(pin, knuck, red, 0, 0, 0, 0, 0, 0, 0.3, 0.28, 0.28);
    for (let i = 0; i < 4; i++) spike(pin, dx[0].clone().lerp(dx[2], 0.2 + i * 0.25).add(V(0, -0.2, 0)), V(0, -1, 0.15), 0.09, 0.24, cream);
    joints[big ? 'clawR' : 'clawL'] = j;
    joints[big ? 'clawRPincer' : 'clawLPincer'] = pin;
  }

  // ================= SHELL: the overturned fishing boat =================
  const shell = new THREE.Group(); shell.position.set(0, 3.75, 0.45); shell.rotation.x = -0.26; g.add(shell);
  joints.shell = shell;
  const H = clinkerHull(THREE, {
    L: 7.4, B: 5.4, H: 3.3, riseBow: 0.4, riseStern: 0.15, rocker: 0.35, rockerS: 0.08,
    bowPow: 2, bowFull: 0.6, sternW: 0.7, sternPow: 2.4, secX: 0.95, secY: 1.15, flare: 0.0,
    N: 6, sub: 3, lipPow: 2.2, cols: 16, bowBias: true, lap: 0.11, innerOff: 0.12,
    strakeMat: (k) => (k < 2 ? wet : k === 5 ? hullRed : hullBlue),
    innerMat: wet, transomMat: hullBlue, railMat: hullRed, railR: 0.11, railSegs: 40,
    keelMat: wet, keelR: 0.12, stemTop: 0.25,
  });
  // keel up: flip about Z, then lift so the gunwale sits at the shell origin
  const flip = new THREE.Group(); flip.rotation.z = Math.PI; flip.position.y = 3.3; shell.add(flip);
  flip.add(H.g);
  for (const u of [-0.55, -0.1, 0.35]) flip.add(H.rib(u, 0.09, wood));
  // thwart remnants (now hanging under the keel, inside)
  for (const u of [-0.3, 0.2]) { const w = 2 * H.xAtY(u, 2.2) - 0.3; add(flip, new THREE.BoxGeometry(w, 0.14, 0.45), wood, 0, 2.2, u * H.half); }
  // surface helpers in hull-local space: point + outward normal on the planking
  const surf = (u, t, s) => { const a = H.pt(u, t, H.lap ?? 0.11), b = H.pt(u, t, 0.4); const p = V(a[0] * s, a[1], a[2]); const n = V((b[0] - a[0]) * s, b[1] - a[1], 0).normalize(); return [p, n]; };
  const onHull = (geo, mat, u, t, s, lift = 0, spin = 0, sc = [1, 1, 1]) => {
    const [p, n] = surf(u, t, s); const m = new THREE.Mesh(geo, mat); m.position.copy(p).addScaledVector(n, lift);
    m.quaternion.setFromUnitVectors(Y, n); m.rotateY(spin); m.scale.set(...sc); flip.add(m); return m;
  };
  // barnacle clusters: truncated cones with a dark mouth
  const barn = new THREE.CylinderGeometry(0.09, 0.24, 0.28, 6, 1);
  let rnd = 7; const R = () => ((rnd = (rnd * 16807) % 2147483647) / 2147483647);
  const clusters = [[0.3, 0.05, 1], [0.55, 0.3, 1], [-0.2, 0.25, -1], [-0.6, 0.15, 1], [0.1, 0.5, -1], [-0.45, 0.55, 1], [0.7, 0.55, -1], [-0.8, 0.4, -1], [0.0, 0.08, -1], [0.4, 0.75, 1]];
  for (const [u, t, s] of clusters) for (let i = 0; i < 4; i++) {
    const sc = 0.7 + R() * 0.7; onHull(barn, cream, u + (R() - 0.5) * 0.08, Math.max(0.02, t + (R() - 0.5) * 0.12), s, 0.06, 0, [sc, sc, sc]);
  }
  // weed patches: flattened faceted blobs draped on the planks
  const blob = new THREE.IcosahedronGeometry(1, 0);
  for (const [u, t, s, w] of [[0.15, 0.1, 1, 0.8], [-0.35, 0.35, -1, 0.7], [0.5, 0.45, -1, 0.6], [-0.65, 0.05, 1, 0.75], [0.0, 0.7, 1, 0.55], [-0.1, 0.0, 1, 0.6], [0.75, 0.2, 1, 0.5]]) {
    onHull(blob, kelp, u, t, s, 0.02, R() * 3, [w, 0.1, w * 1.4]);
  }
  // kelp ribbons standing off the keel line and trailing off the gunwale
  const ribbon = (len, w) => { const geo = new THREE.PlaneGeometry(w, len, 1, 6); const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i) + len / 2; p.setXYZ(i, p.getX(i) * (1 - 0.6 * y / len), y, Math.sin(y * 2.2) * 0.18 * y / len + 0.1 * y * y / len); } geo.computeVertexNormals(); return geo; };
  for (const [u, t, s, len] of [[0.25, 0.02, 1, 1.9], [0.32, 0.03, -1, 1.4], [-0.5, 0.04, 1, 1.6], [0.6, 0.12, -1, 1.2], [-0.15, 0.02, -1, 1.1]]) {
    const m = onHull(ribbon(len, 0.32), kelp, u, t, s, 0.05, R() * 3); m.rotateX(0.15);
    const m2 = onHull(ribbon(len * 0.75, 0.26), kelp, u + 0.03, t, s, 0.05, R() * 3 + 1.2); m2.rotateZ(0.25);
  }
  // weed hanging off the rim (hull-local the rim is at y = sheer; it hangs toward the ground = +y here)
  for (const [u, s] of [[0.1, 1], [-0.5, -1], [-0.2, 1], [0.45, -1]]) {
    const [p] = surf(u, 1, s); const m = new THREE.Mesh(ribbon(1.5, 0.35), kelp); m.position.copy(p); m.rotation.set(0, 0, s * 0.2); flip.add(m);
  }
  // coral tufts: branching faceted sticks
  const coral = (u, t, s, mat) => {
    const [p, n] = surf(u, t, s); const grp = new THREE.Group(); grp.position.copy(p); grp.quaternion.setFromUnitVectors(Y, n); flip.add(grp);
    seg(grp, V(0, 0, 0), V(0, 0.45, 0), 0.07, 0.06, mat, 1, 5);
    for (const [x, z] of [[0.25, 0.05], [-0.2, 0.15], [0.05, -0.25]]) { seg(grp, V(0, 0.3, 0), V(x, 0.65, z), 0.055, 0.045, mat, 1, 5); add(grp, knuck, mat, x, 0.66, z, 0, 0, 0, 0.07, 0.07, 0.07); }
  };
  coral(0.42, 0.06, 1, hullRed); coral(0.47, 0.12, 1, coralB); coral(-0.75, 0.3, -1, hullRed); coral(-0.3, 0.12, -1, coralB);
  // broken rudder: hull-local the transom is at z = -half; keel up means the blade sticks up
  {
    const rg = new THREE.Group(); rg.position.set(0, 0.25, -H.half - 0.2); flip.add(rg);
    add(rg, new THREE.BoxGeometry(0.14, 1.3, 0.75), wood, 0, -0.45, -0.15, 0.12, 0, 0);
    // snapped top: a jagged wedge
    add(rg, new THREE.ConeGeometry(0.4, 0.5, 4), wood, 0.0, -1.25, -0.05, Math.PI, Math.PI / 4, 0.3, 0.35, 1, 1.2);
    add(rg, new THREE.CylinderGeometry(0.08, 0.08, 1.0, 6), wet, 0, -0.3, 0.2);
    for (const y of [0.0, -0.8]) add(rg, new THREE.BoxGeometry(0.2, 0.1, 0.3), wet, 0, y, 0.1);
  }
  // rope draped over the hull
  {
    const pts = []; for (let i = 0; i <= 8; i++) { const t = i / 8; const [p, n] = surf(-0.05 + 0.1 * Math.sin(t * 3), 1 - t, 1); pts.push(p.addScaledVector(n, 0.08)); }
    for (let i = 1; i <= 8; i++) { const t = i / 8; const [p, n] = surf(-0.05 + 0.1 * Math.sin(t * 3), t, -1); pts.push(p.addScaledVector(n, 0.08)); }
    flip.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.07, 5, false), rope));
    const [pe] = surf(-0.05, 1, -1); const hang = new THREE.CatmullRomCurve3([pe, pe.clone().add(V(-0.25, 0.8, 0.2)), pe.clone().add(V(-0.1, 1.6, -0.15))]);
    flip.add(new THREE.Mesh(new THREE.TubeGeometry(hang, 8, 0.07, 5, false), rope));
  }

  g.userData.joints = joints;

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

// The fishing boat's clinker hull, built vertex by vertex (same construction as fishing_boat.js).
// u runs stern (-1) to bow (+1) along Z, t runs keel (0) to sheer (1) around the section.
function clinkerHull(THREE, P) {
  const half = P.L / 2;
  const halfB = (u) => (u >= 0
    ? (P.B / 2) * Math.pow(Math.max(0, 1 - Math.pow(u, P.bowPow)), P.bowFull)
    : (P.B / 2) * (1 - (1 - P.sternW) * Math.pow(-u, P.sternPow)));
  const keelY = (u) => (u >= 0 ? P.rocker * Math.pow(u, 3) : P.rockerS * Math.pow(-u, 3));
  const sheerY = (u) => P.H + (u >= 0 ? P.riseBow : P.riseStern) * u * u;
  const sec = (u, t) => {
    const th = t * Math.PI / 2, b = halfB(u), k = keelY(u);
    return [b * Math.pow(Math.sin(th), P.secX) + P.flare * b * t * t * t, k + (sheerY(u) - k) * Math.pow(1 - Math.cos(th), P.secY)];
  };
  const pt = (u, t, off) => {
    const e = 1e-3, a = sec(u, Math.max(0, t - e)), c = sec(u, Math.min(1, t + e));
    let nx = c[1] - a[1], ny = -(c[0] - a[0]);
    const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
    const p = sec(u, t);
    return [p[0] + nx * off, p[1] + ny * off, u * half];
  };
  const xAtY = (u, y) => { let lo = 0, hi = 1; for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (sec(u, m)[1] < y) lo = m; else hi = m; } return sec(u, (lo + hi) / 2)[0]; };
  const us = [];
  for (let j = 0; j < P.cols; j++) { const s = j / (P.cols - 1); us.push(-1 + 2 * (P.bowBias ? 1 - Math.pow(1 - s, 1.25) : s)); }
  function grid(rows, mat) {
    const pos = [], idx = [], C = us.length, R = rows.length;
    for (const s of [1, -1]) {
      const base = pos.length / 3;
      for (const [t, off] of rows) for (const u of us) { const p = pt(u, t, off); pos.push(p[0] * s, p[1], p[2]); }
      for (let r = 0; r < R - 1; r++) for (let j = 0; j < C - 1; j++) {
        const a = base + r * C + j, b = a + 1, c = a + C, d = c + 1;
        if (s > 0) idx.push(a, c, b, b, c, d); else idx.push(a, b, c, b, d, c);
      }
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
    return new THREE.Mesh(geo, mat);
  }
  const g = new THREE.Group();
  const N = P.N, lap = P.lap, sub = P.sub || 2;
  for (let k = 0; k < N; k++) {
    const t0 = k / N, t1 = (k + 1) / N, m = P.strakeMat(k), rows = [];
    for (let i = 0; i <= sub; i++) { const f = i / sub; rows.push([t0 + (t1 - t0) * f, lap * Math.pow(1 - f, P.lipPow || 1)]); }
    g.add(grid(rows, m));
    if (k > 0) g.add(grid([[t0, 0], [t0, lap]], m));
  }
  if (P.innerMat) { const rows = []; for (let i = 0; i <= 6; i++) rows.push([i / 6, -P.innerOff]); g.add(grid(rows, P.innerMat)); }
  if (P.transomMat) {
    const ring = []; for (let i = 0; i <= 10; i++) ring.push(pt(-1, i / 10, lap));
    const sh = new THREE.Shape();
    const outl = ring.slice().reverse().map((p) => [p[0], p[1]]).concat(ring.slice(1).map((p) => [-p[0], p[1]]));
    sh.moveTo(outl[0][0], outl[0][1]); for (let i = 1; i < outl.length; i++) sh.lineTo(outl[i][0], outl[i][1]);
    const tm = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.1, bevelEnabled: false }), P.transomMat); tm.position.z = -half - 0.03; g.add(tm);
  }
  if (P.railMat) {
    const off = -P.innerOff / 2, pts = [];
    for (const u of us) { const p = pt(u, 1, off); pts.push(new THREE.Vector3(p[0], p[1] + P.railR * 0.4, p[2])); }
    for (let j = us.length - 2; j >= 0; j--) { const p = pt(us[j], 1, off); pts.push(new THREE.Vector3(-p[0], p[1] + P.railR * 0.4, p[2])); }
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true, 'centripetal'), P.railSegs || 48, P.railR, 5, true), P.railMat));
  }
  if (P.keelMat) {
    const pts = [];
    for (let i = 0; i <= 8; i++) { const u = -1 + (i / 8) * 1.9; const p = pt(u, 0, lap + P.keelR * 0.6); pts.push(new THREE.Vector3(0, p[1], p[2])); }
    for (let i = 0; i <= 5; i++) { const t = i / 5; const p = sec(1, t); pts.push(new THREE.Vector3(0, p[1] + (i === 5 ? P.stemTop : 0), half + P.keelR * 0.5)); }
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, 'centripetal'), 30, P.keelR, 5, false), P.keelMat));
  }
  const rib = (u, r, mat) => {
    const pts = [];
    for (let i = 8; i >= 0; i--) { const p = pt(u, i / 8, -P.innerOff - r); pts.push(new THREE.Vector3(-p[0], p[1], p[2])); }
    for (let i = 1; i <= 8; i++) { const p = pt(u, i / 8, -P.innerOff - r); pts.push(new THREE.Vector3(p[0], p[1], p[2])); }
    return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 14, r, 4, false), mat);
  };
  return { g, pt, sec, halfB, keelY, sheerY, xAtY, half, rib, lap };
}
