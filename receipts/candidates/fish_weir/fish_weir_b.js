// fish_weir_b: profiles. Stakes are ExtrudeGeometry of a split-top silhouette (a V notch where
// the top has checked open), bevelled, with a dark wet band low down. Wattle is a hand-built
// BufferGeometry: each withy is a lens-section band swept along the curve, weaving front/back of
// the stakes, bands separated by a small gap so each reads as its own rod. Kelp caught low.
// Runs along local X, bowing toward +Z.
export default function (THREE) {
  const g = new THREE.Group();
  const mk = (hex, name, r = 0.85, extra = {}) => { const q = new THREE.MeshStandardMaterial({ color: hex, roughness: r, ...extra }); if (name) q.name = name; return q; };
  const wet = mk(0x4a3426, 'timber', 0.55);
  const wood = mk(0x7b5a3e, 'timber', 0.88);
  const drift = mk(0xb79773, 'timber', 0.9);
  const withy = mk(0x6a4c33, 'timber', 0.85, { side: THREE.DoubleSide });
  const withyWet = mk(0x4a3426, 'timber', 0.6, { side: THREE.DoubleSide });
  const kelp = mk(0x4f5a2c, 'foliage', 0.6, { side: THREE.DoubleSide });

  let seed = 29; const R = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const BOW = 0.75, HALF = 5;
  const zc = (x) => BOW * (1 - (x / HALF) ** 2);
  const dz = (x) => -2 * BOW * x / (HALF * HALF);
  const nrm = (x) => { const a = -dz(x), l = Math.hypot(a, 1); return [a / l, 1 / l]; };

  const N = 14, xs = [], hs = [];
  for (let i = 0; i < N; i++) { xs.push(-4.72 + 9.44 * i / (N - 1) + (R() - 0.5) * 0.14); hs.push(0.9 + 0.5 * R()); }
  hs[2] = 1.4; hs[10] = 1.36; hs[13] = 0.94;

  const BV = 0.014;
  const stakeGeo = (h, w, d, kind) => {
    const hw = w / 2 - BV, H = h - BV, s = new THREE.Shape();
    s.moveTo(-hw, BV); s.lineTo(hw, BV);
    if (kind === 0) { // split: two teeth with a notch
      s.lineTo(hw, H - 0.05); s.lineTo(0.025, H); s.lineTo(0.0, H - 0.08); s.lineTo(-0.03, H - 0.015); s.lineTo(-hw, H - 0.07);
    } else if (kind === 1) { // slanted cut
      s.lineTo(hw, H); s.lineTo(-hw, H - 0.1);
    } else { // broken, stepped
      s.lineTo(hw, H - 0.03); s.lineTo(0.01, H - 0.06); s.lineTo(0.0, H); s.lineTo(-hw, H - 0.02);
    }
    s.lineTo(-hw, BV);
    const geo = new THREE.ExtrudeGeometry(s, { depth: d - 2 * BV, bevelEnabled: true, bevelSize: BV, bevelThickness: BV, bevelSegments: 1 });
    geo.translate(0, 0, -(d - 2 * BV) / 2);
    return geo;
  };

  for (let i = 0; i < N; i++) {
    const s = new THREE.Group();
    const h = hs[i], w = 0.14 + R() * 0.04, d = 0.12 + R() * 0.03;
    s.add(new THREE.Mesh(stakeGeo(h, w, d, i % 3), i % 2 ? drift : wood));
    const bh = 0.36 + R() * 0.14;
    const band = new THREE.Mesh(new THREE.BoxGeometry(w + 0.016, bh, d + 0.016), wet); band.position.y = bh / 2; s.add(band);
    s.position.set(xs[i], 0, zc(xs[i]));
    s.rotation.set((R() - 0.5) * 0.12, -Math.atan(dz(xs[i])) + (R() - 0.5) * 0.3, (R() - 0.5) * 0.1);
    g.add(s);
  }

  // woven bands, one BufferGeometry per run per material
  const runs = [[0, 3], [6, 10]];
  const BANDS = 11, A = 0.088, T = 0.022, EDGE = 0.004;
  for (const [a, b] of runs) {
    let top = 9; for (let k = a; k <= b; k++) top = Math.min(top, hs[k]);
    top = Math.min(top - 0.12, 0.84);
    const y0 = 0.06, bh = (top - y0) / BANDS, gap = 0.008;
    const xa = xs[a] - 0.12, xb = xs[b] + 0.12, C = (b - a) * 4 + 3;
    const phaseAt = (x) => {
      if (x <= xs[a]) return a + (x - xs[a]) / (xs[a + 1] - xs[a]);
      for (let k = a; k < b; k++) if (x <= xs[k + 1]) return k + (x - xs[k]) / (xs[k + 1] - xs[k]);
      return b + (x - xs[b]) / (xs[b] - xs[b - 1]);
    };
    for (const wetPart of [true, false]) {
      const pos = [], idx = [];
      for (let r = 0; r < BANDS; r++) {
        if ((r < 4) !== wetPart) continue;
        const yb = y0 + r * bh, yt = yb + bh - gap, ym = (yb + yt) / 2;
        // cross-section: [y, normal offset magnitude] around a lens: bottom edge, front mid, top edge, back mid
        const ring = [[yb, 0, 0], [ym, 1, T], [yt, 0, 0], [ym, -1, T]];
        const base = pos.length / 3;
        for (let j = 0; j <= C; j++) {
          const x = xa + (xb - xa) * j / C, n = nrm(x);
          const off = A * Math.cos(Math.PI * phaseAt(x) + r * Math.PI) + 0.01 * Math.sin(x * 5 + r * 2);
          for (const [y, sg, t] of ring) {
            const o = off + sg * t + (sg === 0 ? 0 : 0) + (y === yb ? 0 : 0);
            pos.push(x + n[0] * o, y + 0.01 * Math.sin(x * 2.3 + r), zc(x) + n[1] * o);
          }
        }
        for (let j = 0; j < C; j++) for (let q = 0; q < 4; q++) {
          const q2 = (q + 1) % 4, a0 = base + j * 4 + q, a1 = base + j * 4 + q2, b0 = a0 + 4, b1 = a1 + 4;
          idx.push(a0, b0, a1, a1, b0, b1);
        }
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
      g.add(new THREE.Mesh(geo, wetPart ? withyWet : withy));
    }
    // binding twist along the top: a slightly thicker rod
    const pts = [];
    for (let j = 0; j <= C; j++) { const x = xa + (xb - xa) * j / C; pts.push(new THREE.Vector3(x, top + 0.03 + 0.01 * Math.sin(x * 4), zc(x))); }
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), C, 0.03, 4, false), wood));
  }

  // kelp: flat leaf blades in clumps, at stake feet and draped over low bands
  const blade = (x, y, z, len, tilt, yaw, down) => {
    const s = new THREE.Shape(); s.moveTo(-0.02, 0); s.quadraticCurveTo(-0.07, len * 0.5, 0, len); s.quadraticCurveTo(0.06, len * 0.45, 0.02, 0); s.lineTo(-0.02, 0);
    const geo = new THREE.ShapeGeometry(s, 2); if (down) geo.rotateZ(Math.PI);
    const m = new THREE.Mesh(geo, kelp); m.position.set(x, y, z); m.rotation.set(tilt, yaw, 0, 'YXZ'); g.add(m);
  };
  for (let i = 0; i < N; i++) {
    if (i % 3 === 2) continue;
    const n = nrm(xs[i]);
    for (let q = 0; q < 3; q++) {
      const side = q % 2 ? -1 : 1;
      blade(xs[i] + (R() - 0.5) * 0.14 + n[0] * 0.1 * side, 0.0, zc(xs[i]) + n[1] * 0.1 * side, 0.26 + R() * 0.16, side * (0.3 + R() * 0.4), R() * 6, false);
    }
  }
  for (const [a, b] of runs) for (let k = a; k < b; k++) {
    if (k % 2) continue;
    const x = xs[k] + (xs[k + 1] - xs[k]) * (0.35 + R() * 0.3), n = nrm(x);
    for (let q = 0; q < 3; q++) blade(x + (R() - 0.5) * 0.15 + n[0] * 0.12, 0.36 + R() * 0.06, zc(x) + n[1] * 0.12, 0.22 + R() * 0.1, 0.25, -Math.atan(dz(x)) + (R() - 0.5) * 0.5, true);
  }

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
