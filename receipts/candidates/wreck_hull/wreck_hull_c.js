// wreck_hull C: profile sweep. Strakes are LatheGeometry sectors around the keel axis, warped for the sheer.
// Layout: hull along Z, STERN at local -Z (stern cabin end), BOW at +Z (bowsprit).
// The hull is heeled 25 degrees (high side +X, low side -X) and sunk into a sand mound.
// The stern cabin is built LEVEL in world space on the heeled hull: its floor is flat,
// and g.userData.cabinFloor = [x, y, z] is the centre of that floor after recentring.
// The cabin doorway faces +Z (towards the bow), with a landing and steps down to the deck.
export default function (THREE) {
  const g = new THREE.Group();
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  let seed = 37;
  const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const jit = (a) => (rnd() * 2 - 1) * a;

  // ---- materials (style lock palette, few of them; the loader merges by material value)
  const mk = (color, rough, name, extra) => {
    const m = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: rough, metalness: 0 }, extra || {}));
    if (name) m.name = name; return m;
  };
  const mats = {
    wet: mk(0x4a3426, 0.55, 'timber', { side: THREE.DoubleSide }),
    timber: mk(0x7b5a3e, 0.8, 'timber'),
    kelp: mk(0x4f5a2c, 0.85, 'foliage', { side: THREE.DoubleSide }),
    cream: mk(0xd9cfb6, 0.85, 'stone'),
    iron: mk(0x3a3d40, 0.6, 'metal', { metalness: 0.3 }),
    sand: mk(0xc6a888, 0.95, 'ground'),
    tile: mk(0xb5543a, 0.8, 'tile'),
    ochre: mk(0xc99a5c, 0.9, 'plaster'),
    glass: mk(0x2a2420, 0.6, null),
  };

  // ---- merge kit: everything is baked into one mesh per material
  const B = {};
  const stack = [new THREE.Matrix4()];
  const cur = () => stack[stack.length - 1];
  const frame = (m, fn) => { stack.push(cur().clone().multiply(m)); fn(); stack.pop(); };
  const _v = new THREE.Vector3();
  function put(key, geo, m) {
    const gg = geo.index ? geo.toNonIndexed() : geo;
    const M = cur().clone(); if (m) M.multiply(m);
    const p = gg.attributes.position; const b = B[key] || (B[key] = []);
    const o = M.determinant() < 0 ? [0, 2, 1] : [0, 1, 2];
    for (let i = 0; i < p.count; i += 3) for (const j of o) { _v.fromBufferAttribute(p, i + j).applyMatrix4(M); b.push(_v.x, _v.y, _v.z); }
  }
  function tri(key, a, b2, c) { const M = cur(); const bb = B[key] || (B[key] = []); for (const q of [a, b2, c]) { _v.copy(q).applyMatrix4(M); bb.push(_v.x, _v.y, _v.z); } }
  const quad = (key, a, b2, c, d) => { tri(key, a, b2, c); tri(key, a, c, d); };
  function T(x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) {
    return new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), V(sx, sy, sz));
  }
  const box = (key, w, h, d, x, y, z, rx = 0, ry = 0, rz = 0) => put(key, new THREE.BoxGeometry(w, h, d), T(x, y, z, rx, ry, rz));
  // a box from a to b; w across (perpendicular to up), h along up
  function beam(key, a, b2, w, h, up, ext = 0) {
    const d = new THREE.Vector3().subVectors(b2, a); const L = d.length(); d.normalize();
    const s = new THREE.Vector3().crossVectors(up || V(0, 1, 0), d); if (s.lengthSq() < 1e-8) s.set(1, 0, 0); s.normalize();
    const u = new THREE.Vector3().crossVectors(d, s);
    const M = new THREE.Matrix4().makeBasis(s, u, d); M.setPosition(new THREE.Vector3().addVectors(a, b2).multiplyScalar(0.5));
    put(key, new THREE.BoxGeometry(w, h, L + ext), M);
  }
  // an octagonal log from a to b (tapering r0 -> r1)
  function log(key, a, b2, r0, r1, seg = 8) {
    const d = new THREE.Vector3().subVectors(b2, a); const L = d.length();
    const q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), d.clone().normalize());
    put(key, new THREE.CylinderGeometry(r1, r0, L, seg), new THREE.Matrix4().compose(new THREE.Vector3().addVectors(a, b2).multiplyScalar(0.5), q, V(1, 1, 1)));
  }

  // ---- hull shape (hull frame: upright, keel at y=0, stern -Z, bow +Z)
  const HEEL = 25 * Math.PI / 180, LIFT = 0.45;
  const ZS = -11, ZB = 11;
  const SH0 = 3.8;
  const sheer = (z) => SH0 + (z < -4 ? 0.9 * Math.pow((-4 - z) / 7, 1.6) : 0) + (z > 4 ? 1.0 * Math.pow((z - 4) / 7, 2) : 0);
  const keelY = (z) => (z > 5 ? 1.7 * Math.pow((z - 5) / 6, 2) : 0);
  const beamW = (z) => (z <= -1 ? 3.0 - 0.75 * Math.pow((-1 - z) / 10, 2) : 3.0 * Math.pow(Math.max(0, 1 - Math.pow((z + 1) / 12, 2.2)), 0.55));
  const deckY = (z) => sheer(z) - 0.65;
  // where the planking is gone: rows of the side, as z ranges (high side +X mostly)
  const NT = 10;
  const holeA = [], holeB = [];
  for (let j = 0; j < NT; j++) {
    const e = Math.sin(Math.PI * Math.max(0, Math.min(1, (j - 0.6) / 8.3)));
    if (e <= 0.05) { holeA[j] = 99; holeB[j] = -99; continue; }
    holeA[j] = 0.4 - 6.2 * Math.sqrt(e) + jit(0.9); holeB[j] = 0.8 + 6.0 * Math.sqrt(e) + jit(0.9);
  }
  const isHole = (s, j, z) => (s > 0 && z > holeA[j] && z < holeB[j]) || (s < 0 && j >= 7 && j <= 8 && z > 3.4 && z < 5.4 + (j - 7) * 0.7);

  // ---- HULL C: profile sweep. Each strake is a LatheGeometry sector revolved around the keel
  // axis (elliptical section), then warped after construction to lift the sheer at stern and bow.
  // Missing planks split a strake into separate lathes. An inner lathe shell gives the thickness.
  const AY = 3.6, KV = 1.2, TH0 = -Math.PI / 2, TH1 = 0.15;
  const rise = (z) => sheer(z) - SH0;
  const surfP = (s, z, t, off = 0) => {
    const th = TH0 + t * (TH1 - TH0), R = Math.max(0, beamW(z) + off);
    return V(s * R * Math.cos(th), AY + KV * R * Math.sin(th) + rise(z) * Math.min(1, Math.max(0, t)), z);
  };
  const inner = (s, z, t, ins) => surfP(s, z, t, -ins);
  const halfAt = (z, y) => { let lo = 0, hi = 1.05; for (let k = 0; k < 22; k++) { const mid = (lo + hi) / 2; if (surfP(1, z, mid).y < y) lo = mid; else hi = mid; } return surfP(1, z, lo).x; };
  const keelLine = (z) => AY - KV * beamW(z);
  function lathePush(key, s, j, za, zb, off) {
    const pts = []; const n = Math.max(1, Math.round((zb - za) / 0.66));
    for (let k = 0; k <= n; k++) { const z = za + (zb - za) * k / n; pts.push(new THREE.Vector2(Math.max(0.001, beamW(z) + off), z)); }
    const th0 = TH0 + (j / NT) * (TH1 - TH0), dth = (TH1 - TH0) / NT;
    const geo = new THREE.LatheGeometry(pts, 1, th0, dth).toNonIndexed();
    const p = geo.attributes.position, out = [];
    for (let i = 0; i < p.count; i++) {
      const lx = p.getX(i), ly = p.getY(i), lz = p.getZ(i);
      const th = Math.atan2(lx, lz); const t = (th - TH0) / (TH1 - TH0);
      out.push(V(s * lz, AY + KV * lx + rise(ly) * Math.min(1, Math.max(0, t)), ly));
    }
    for (let i = 0; i < out.length; i += 3) tri(key, out[i], out[i + 1], out[i + 2]);
  }
  function buildHull() {
    const ZN = 34, zs = []; for (let i = 0; i <= ZN; i++) zs.push(ZS + (ZB - ZS) * i / ZN);
    for (const s of [1, -1]) for (let j = 0; j < NT; j++) {
      let run = null; const runs = [];
      for (let i = 0; i < ZN; i++) {
        const hole = isHole(s, j, (zs[i] + zs[i + 1]) / 2);
        if (!hole && run === null) run = zs[i];
        if (hole && run !== null) { runs.push([run, zs[i]]); run = null; }
      }
      if (run !== null) runs.push([run, ZB]);
      const lip = (j % 2) * 0.05;
      for (const [za, zb] of runs) {
        lathePush((j === 2 || j === 3) && rnd() < 0.3 ? 'kelp' : 'wet', s, j, za, zb, lip);
        lathePush('wet', s, j, za, zb, -0.13);
      }
    }
    // thick top edge (the sheer strake cap) and transom
    for (const s of [1, -1]) for (let i = 0; i < ZN; i++) {
      const z0 = zs[i], z1 = zs[i + 1];
      quad('wet', surfP(s, z0, 1, 0.03), surfP(s, z1, 1, 0.03), surfP(s, z1, 1, -0.13), surfP(s, z0, 1, -0.13));
    }
    const sh = new THREE.Shape();
    for (let k = 0; k <= 10; k++) { const p = surfP(-1, ZS, 1 - k / 10); k ? sh.lineTo(p.x, p.y) : sh.moveTo(p.x, p.y); }
    for (let k = 1; k <= 10; k++) { const p = surfP(1, ZS, k / 10); sh.lineTo(p.x, p.y); }
    put('wet', new THREE.ExtrudeGeometry(sh, { depth: 0.3, bevelEnabled: false }), T(0, 0, ZS - 0.12));
    for (let k = 1; k < 6; k++) { const y = AY - KV * beamW(ZS) + 0.6 * k; const hw = halfAt(ZS, y); box('timber', hw * 2 + 0.06, 0.1, 0.08, 0, y, ZS - 0.15); }
  }


  const HF = T(0, LIFT, 0, 0, 0, HEEL); // hull frame -> world

  frame(HF, () => {
    buildHull();

    // keel and stem
    const kp = [];
    for (let z = ZS; z <= ZB + 0.01; z += 1.1) kp.push(V(0, keelLine(z) - 0.12, z));
    for (let i = 0; i < kp.length - 1; i++) beam('wet', kp[i], kp[i + 1], 0.34, 0.4, V(1, 0, 0), 0.1);
    const stemTop = V(0, sheer(ZB) + 0.35, ZB + 0.25);
    beam('wet', V(0, keelLine(ZB) - 0.1, ZB), stemTop, 0.34, 0.4, V(1, 0, 0), 0.1);

    // ribs: curved frames following the inside of the skin, visible where planking is gone
    const ribZ = [];
    for (let z = -6.4; z <= 7.4; z += 0.78) ribZ.push([1, z]);
    for (let z = 3.3; z <= 6.4; z += 0.82) ribZ.push([-1, z]);
    for (const [s, z] of ribZ) {
      const top = 1.0 + (s > 0 ? 0.06 + rnd() * 0.08 : 0.04);
      const pts = [];
      for (let k = 0; k <= 8; k++) pts.push(inner(s, z, (k / 8) * top, 0.16));
      for (let k = 0; k < 8; k++) beam('wet', pts[k], pts[k + 1], 0.26, 0.22, V(0, 0, 1), 0.06);
    }

    // gunwale rail on both sides, broken once on the high side
    for (const s of [1, -1]) {
      let prev = null;
      for (let z = ZS + 0.15; z <= ZB - 0.2; z += 0.9) {
        const p = surfP(s, z, 1.0); p.y += 0.1; p.x -= s * 0.06;
        if (prev && !(s > 0 && z > 1.4 && z < 3.2)) beam('timber', prev, p, 0.28, 0.2, V(0, 1, 0), 0.12);
        prev = p;
      }
      // stanchion knees on top of the rail (the bulwark posts)
      for (let z = -6.5; z <= 9; z += 2.1) {
        if (s > 0 && z > 1.2 && z < 3.4) continue;
        const p = surfP(s, z, 1.0); p.x -= s * 0.06;
        beam('timber', V(p.x, p.y + 0.1, p.z), V(p.x, p.y + 0.55, p.z), 0.18, 0.18, V(0, 0, 1));
      }
      // upper rail on the stern and bow rises
      let pv = null;
      for (let z = ZS + 0.15; z <= -5.6; z += 0.9) { const p = surfP(s, z, 1.0); p.x -= s * 0.06; p.y += 0.6; if (pv) beam('timber', pv, p, 0.16, 0.14, V(0, 1, 0), 0.1); pv = p; }
      pv = null;
      for (let z = 6.4; z <= ZB - 0.4; z += 0.9) { const p = surfP(s, z, 1.0); p.x -= s * 0.06; p.y += 0.6; if (pv) beam('timber', pv, p, 0.16, 0.14, V(0, 1, 0), 0.1); pv = p; }
    }

    // deck: lengthwise planks, broken through in the waist
    const PW = 0.42;
    for (let px = -2.7; px <= 2.71; px += PW) {
      let z0 = null;
      const segs = [];
      for (let z = -6.6; z <= 9.8; z += 0.2) {
        const inside = halfAt(z, deckY(z)) > Math.abs(px) + 0.18;
        if (inside && z0 === null) z0 = z;
        if ((!inside || z > 9.6) && z0 !== null) { segs.push([z0, z]); z0 = null; }
      }
      for (const [a, b2] of segs) {
        for (let z = a; z < b2 - 0.3; z += 2.2) {
          const ze = Math.min(b2, z + 2.15);
          const mid = (z + ze) / 2;
          if (mid > -3.2 && mid < 4.6 && rnd() < 0.55) continue;
          if (px > 0.8 && mid > -4 && mid < 6 && rnd() < 0.6) continue;
          const y0 = deckY(z), y1 = deckY(ze);
          beam('timber', V(px, y0, z), V(px, y1, ze), PW - 0.04, 0.14, V(0, 1, 0));
        }
      }
    }
    // deck beams across the waist where the planks are gone
    for (let z = -3.2; z <= 4.6; z += 1.64) {
      const y = deckY(z) - 0.16, hw = halfAt(z, y) - 0.1;
      beam('wet', V(-hw, y, z), V(hw, y, z), 0.24, 0.22, V(0, 1, 0));
    }

    // masts: main and fore, both snapped
    const mast = (z, top, r, lean) => {
      const base = V(0, deckY(z) - 0.4, z), tip = V(lean, top, z + lean * 0.4);
      log('timber', base, tip, r, r * 0.86, 9);
      for (const f of [0.25, 0.5, 0.78]) {
        const p = base.clone().lerp(tip, f);
        log('iron', p.clone().add(V(0, -0.07, 0)), p.clone().add(V(0, 0.07, 0)), r * 1.12, r * 1.1, 9);
      }
      // splintered break
      for (let k = 0; k < 4; k++) {
        const a = (k / 4) * Math.PI * 2 + 0.4;
        const h = 0.35 + rnd() * 0.55;
        const p = V(tip.x + Math.cos(a) * r * 0.45, tip.y, tip.z + Math.sin(a) * r * 0.45);
        beam('timber', p, p.clone().add(V(Math.cos(a) * 0.08, h, Math.sin(a) * 0.08)), 0.12, 0.09, V(0, 0, 1));
      }
      return { base, tip };
    };
    const main = mast(0.9, 7.9, 0.4, 0.25);
    mast(7.3, 6.4, 0.32, -0.15);
    // the snapped yard: hangs from the main mast, over the low side, down to the sand
    const ya = main.base.clone().lerp(main.tip, 0.72).add(V(-0.3, 0, 0));
    const yb = V(-4.7, 2.75, -4.2);
    log('timber', ya, yb, 0.2, 0.16, 8);
    for (const f of [0.15, 0.55]) { const p = ya.clone().lerp(yb, f); const d = yb.clone().sub(ya).normalize().multiplyScalar(0.07); log('iron', p.clone().sub(d), p.clone().add(d), 0.23, 0.23, 8); }
    // rope from the yard to the rail
    log('timber', ya.clone().lerp(yb, 0.3), surfP(-1, -1.5, 1.0), 0.05, 0.05, 5);
    // bowsprit, broken at its tip
    const bs0 = V(0, sheer(9.4) - 0.2, 9.4), bs1 = V(0, sheer(9.4) + 1.4, 13.5);
    log('timber', bs0, bs1, 0.24, 0.17, 8);
    log('iron', bs0.clone().lerp(bs1, 0.45).add(V(0, -0.04, -0.1)), bs0.clone().lerp(bs1, 0.45).add(V(0, 0.04, 0.1)), 0.27, 0.27, 8);
    for (let k = 0; k < 3; k++) beam('timber', bs1.clone().add(V(jit(0.08), 0, 0)), bs1.clone().add(V(jit(0.12), 0.16 + rnd() * 0.2, 0.4 + rnd() * 0.3)), 0.09, 0.08, V(1, 0, 0));

    // barnacles on the low hull, both sides
    const bgeo = new THREE.SphereGeometry(1, 6, 3, 0, Math.PI * 2, 0, Math.PI / 2);
    for (let i = 0; i < 70; i++) {
      const s = rnd() < 0.55 ? -1 : 1;
      const z = -10.4 + rnd() * 18.5, t = 0.12 + rnd() * 0.3;
      const p = surfP(s, z, t, 0.02);
      const r = 0.07 + rnd() * 0.06;
      const n = V(s, -0.25, 0).normalize();
      const q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), n);
      put('cream', bgeo, new THREE.Matrix4().compose(p, q, V(r, r * 0.8, r)));
    }
    // weed hanging on the hull: strands draped down the planking from a mossy pad
    for (let i = 0; i < 14; i++) {
      const s = i % 3 === 0 ? 1 : -1;
      const z = -10 + rnd() * 18;
      const t = 0.3 + rnd() * 0.18;
      for (let k = 0; k < 3; k++) {
        const zz = z + (k - 1) * 0.22 + jit(0.06);
        let prev = surfP(s, zz, t, 0.07);
        for (let q = 1; q <= 3; q++) {
          const nx = surfP(s, zz + jit(0.08), t - q * (0.05 + 0.02 * k), 0.07);
          beam('kelp', prev, nx, 0.16 - q * 0.025, 0.05, V(s, 0, 0), 0.04); prev = nx;
        }
      }
    }
  });

  // ---- stern cabin: LEVEL in world space, floor top at y = FLOOR
  const FLOOR = 4.1;
  const CZ = -9.2;
  const hullCentreAtFloor = (FLOOR - LIFT) / Math.cos(HEEL);
  const CX = -hullCentreAtFloor * Math.sin(HEEL) + 0.25;
  const CW = 3.6, CD = 3.2, WH = 2.4, WT = 0.2;
  frame(T(CX, FLOOR, CZ), () => {
    // floor slab and the planked bulk under it, down into the hull
    box('timber', CW + 0.1, 0.24, CD + 0.1, 0, -0.12, 0);
    box('wet', CW - 0.2, 2.6, CD - 0.1, 0, -1.55, -0.05);
    for (let k = 0; k < 5; k++) {
      const y = -0.45 - k * 0.45;
      box('wet', CW - 0.1, 0.12, 0.06, 0, y, -CD / 2 + 0.02);
      for (const s of [1, -1]) box('wet', 0.06, 0.12, CD - 0.05, s * (CW / 2 - 0.08), y, -0.05);
    }
    // brackets under the overhang (low side)
    for (const z of [-1.1, 0, 1.1]) beam('timber', V(-CW / 2 + 0.05, -0.2, z), V(-CW / 2 + 0.55, -1.15, z), 0.2, 0.2, V(0, 0, 1));
    // walls
    const wy = WH / 2;
    box('ochre', WT, WH, CD, -CW / 2 + WT / 2, wy, 0);
    box('ochre', WT, WH, CD, CW / 2 - WT / 2, wy, 0);
    box('ochre', CW, WH, WT, 0, wy, -CD / 2 + WT / 2);
    // front wall with a real doorway (0.95 x 2.0), facing +Z
    const DW = 1.0, DH = 2.05, side = (CW - DW) / 2;
    box('ochre', side, WH, WT, -(DW / 2 + side / 2), wy, CD / 2 - WT / 2);
    box('ochre', side, WH, WT, DW / 2 + side / 2, wy, CD / 2 - WT / 2);
    box('ochre', DW, WH - DH, WT, 0, DH + (WH - DH) / 2, CD / 2 - WT / 2);
    // door frame and an open door leaf
    for (const s of [1, -1]) box('timber', 0.14, DH, 0.3, s * (DW / 2 + 0.03), DH / 2, CD / 2 - 0.08);
    box('timber', DW + 0.36, 0.18, 0.32, 0, DH + 0.06, CD / 2 - 0.08);
    frame(T(-DW / 2, 0, CD / 2 + 0.02, 0, -1.9, 0), () => {
      box('timber', 0.92, 1.95, 0.08, 0.47, 0.99, 0.04);
      for (const y of [0.4, 1.55]) box('iron', 0.7, 0.07, 0.04, 0.4, y, 0.1);
    });
    // timber corner posts and sill beam
    for (const sx of [1, -1]) for (const sz of [1, -1]) box('timber', 0.26, WH + 0.1, 0.26, sx * (CW / 2 - 0.05), WH / 2, sz * (CD / 2 - 0.05));
    for (const sx of [1, -1]) box('timber', 0.18, 0.2, CD + 0.1, sx * (CW / 2 + 0.02), WH - 0.1, 0);
    box('timber', CW + 0.1, 0.2, 0.18, 0, WH - 0.1, -CD / 2 - 0.02);
    // small arched windows (sides and stern)
    const win = (x, y, z, ry) => frame(T(x, y, z, 0, ry, 0), () => {
      box('timber', 0.7, 0.95, 0.12, 0, 0, 0.05);
      box('glass', 0.46, 0.55, 0.1, 0, -0.08, 0.08);
      put('glass', new THREE.CylinderGeometry(0.23, 0.23, 0.1, 8, 1, false, -Math.PI / 2, Math.PI), T(0, 0.2, 0.08, Math.PI / 2, 0, 0));
      box('timber', 0.06, 0.75, 0.06, 0, 0, 0.14);
      box('timber', 0.8, 0.12, 0.2, 0, -0.52, 0.1);
    });
    for (const z of [-0.75, 0.75]) { win(CW / 2, 1.35, z, Math.PI / 2); win(-CW / 2, 1.35, z, -Math.PI / 2); }
    for (const x of [-0.8, 0.8]) win(x, 1.35, -CD / 2, Math.PI);
    // gable ends and a red tile roof, ridge along Z
    const RISE = 1.3, RUN = CW / 2, OVH = 0.45;
    const gs = new THREE.Shape(); gs.moveTo(-RUN, 0); gs.lineTo(RUN, 0); gs.lineTo(0, RISE); gs.closePath();
    const gg = new THREE.ExtrudeGeometry(gs, { depth: WT, bevelEnabled: false });
    put('ochre', gg, T(0, WH, CD / 2 - WT));
    put('ochre', gg, T(0, WH, -CD / 2));
    const a = Math.atan2(RISE, RUN), Ls = (RUN + OVH) / Math.cos(a);
    for (const s of [1, -1]) {
      frame(T(0, WH + RISE + 0.1, 0, 0, 0, -s * a), () => {
        box('tile', Ls, 0.2, CD + 0.7, s * Ls / 2, 0, 0);
        const n = 6;
        for (let k = 0; k < n; k++) {
          const u = (k + 0.7) / n * Ls;
          box('tile', 0.24, 0.1, CD + 0.72, s * u, 0.13, 0);
        }
      });
    }
    put('tile', new THREE.CylinderGeometry(0.17, 0.17, CD + 0.8, 8), T(0, WH + RISE + 0.18, 0, Math.PI / 2, 0, 0));
    // landing outside the door and steps down towards the deck
    box('timber', 1.7, 0.24, 1.1, 0, -0.12, CD / 2 + 0.55);
    for (let k = 0; k < 3; k++) box('timber', 1.4, 0.24, 0.42, 0, -0.42 - k * 0.32, CD / 2 + 1.3 + k * 0.4);
    for (const s of [1, -1]) beam('timber', V(s * 0.72, -0.2, CD / 2 + 1.05), V(s * 0.72, -1.4, CD / 2 + 2.3), 0.14, 0.14, V(1, 0, 0));
    for (const s of [1, -1]) box('wet', 0.2, 1.4, 0.2, s * 0.7, -0.9, CD / 2 + 0.95);
  });

  // ---- sand mound and debris (world frame)
  const mound = new THREE.SphereGeometry(1, 30, 6, 0, Math.PI * 2, 0, Math.PI / 2);
  { const p = mound.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const ang = Math.atan2(z, x);
      const r = 1 + 0.06 * Math.sin(ang * 5 + 1.3) + 0.04 * Math.sin(ang * 11);
      p.setXYZ(i, x * r, y * (1 + 0.12 * Math.sin(ang * 3)), z * r);
    } }
  put('sand', mound, T(-0.9, 0, 0.6, 0, 0, 0, 6.0, 0.75, 13.0));
  box('timber', 0.4, 0.12, 2.4, -5.0, 0.55, 4.5, 0, 0.4, 0.12);
  box('timber', 0.35, 0.12, 1.8, 3.6, 0.6, -5.5, 0, -0.7, -0.15);
  box('wet', 0.3, 0.12, 1.6, -4.4, 0.65, -7.2, 0, 1.2, 0.1);
  // kelp clumps growing out of the sand around the hull
  for (let i = 0; i < 11; i++) {
    const side = i % 3 === 0 ? 1 : -1;
    const z = -10 + rnd() * 19;
    const x = side > 0 ? 1.6 + rnd() * 1.2 : -3.4 - rnd() * 1.4;
    const nx = (x + 0.9) / 6.0, nz = (z - 0.6) / 13.0;
    const y0 = 0.75 * Math.sqrt(Math.max(0, 1 - nx * nx - nz * nz)) - 0.1;
    for (let b = 0; b < 3; b++) {
      const ang = rnd() * Math.PI * 2, h = 0.9 + rnd() * 0.9;
      let p = V(x + jit(0.2), y0, z + jit(0.2));
      const segs = 3;
      for (let k = 0; k < segs; k++) {
        const bend = (k + 1) * 0.18;
        const q = p.clone().add(V(Math.cos(ang) * bend, h / segs, Math.sin(ang) * bend));
        beam('kelp', p, q, 0.2 - k * 0.04, 0.05, V(Math.cos(ang), 0, Math.sin(ang)), 0.05);
        p = q;
      }
    }
  }

  // ---- build the meshes
  // anything buried below the sand bed is flattened onto it, so the base is the mound at y = 0
  for (const key of Object.keys(B)) { const a = B[key]; for (let i = 1; i < a.length; i += 3) if (a[i] < 0) a[i] = 0; }
  for (const key of Object.keys(B)) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(B[key], 3));
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, mats[key]);
    mesh.name = 'wreck_' + key; mesh.castShadow = true; mesh.receiveShadow = true;
    g.add(mesh);
  }
  // a marker at the centre of the cabin floor; it moves with the recentring
  const marker = new THREE.Group(); marker.name = 'cabinFloor';
  marker.position.set(CX, FLOOR, CZ); g.add(marker);

  // contract recentring (vertex-measured)
  const bx = new THREE.Box3(), v = new THREE.Vector3(), m = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => {
    const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const putb = (mat) => { for (let i = 0; i < p.count; i++) bx.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); putb(m.multiplyMatrices(n.matrixWorld, im)); } return; }
    putb(n.matrixWorld);
  });
  const c = bx.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= bx.min.y; o.position.z -= c.z; });
  g.userData.cabinFloor = [+marker.position.x.toFixed(3), +marker.position.y.toFixed(3), +marker.position.z.toFixed(3)];
  g.userData.cabinFloorSize = [CW - 2 * WT, CD - 2 * WT];
  g.userData.cabinDoor = '+Z';
  g.userData.stern = '-Z';
  return g;
}
