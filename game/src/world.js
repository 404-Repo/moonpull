// What stands on the coast and what the player can touch: platforms, solids, things that float,
// and the places where the context button means something.
import * as THREE from 'three';
import { tide } from './tide.js';

export class World {
  constructor(heightFn) {
    this.terrain = heightFn;
    this.plats = [];      // { x, z, hw, hd, rot, top: number | () => number, vel? }
    this.solids = [];     // { x, z, r } circles or { x, z, hw, hd, rot } boxes; y1 = top
    this.floaters = [];
    this.uses = [];       // { id, x, z, r, label, when(), use() }
    this.tickers = [];
  }
  plat(p) { p.rot = p.rot || 0; this.plats.push(p); return p; }
  solid(s) { s.rot = s.rot || 0; this.solids.push(s); return s; }
  usable(u) { this.uses.push(u); return u; }
  tick(fn) { this.tickers.push(fn); }

  groundAt(x, z, y = 0) {
    let h = this.terrain(x, z), plat = null;
    for (const p of this.plats) {
      if (p.off) continue;
      const c = Math.cos(-p.rot), s = Math.sin(-p.rot);
      const lx = (x - p.x) * c - (z - p.z) * s, lz = (x - p.x) * s + (z - p.z) * c;
      if (Math.abs(lx) > p.hw || Math.abs(lz) > p.hd) continue;
      const top = typeof p.top === 'function' ? p.top(lx, lz) : p.top;
      if (top > h && top <= y + 0.65) { h = top; plat = p; }
    }
    return { h, plat };
  }

  collide(x, z, r, y) {
    for (const s of this.solids) {
      if (s.off) continue;
      if (s.y1 !== undefined && y >= s.y1 - 0.05) continue;
      if (s.y0 !== undefined && y + 1.4 < s.y0) continue;
      if (s.r !== undefined) {
        const dx = x - s.x, dz = z - s.z, d = Math.hypot(dx, dz), m = s.r + r;
        if (d < m && d > 1e-5) { x = s.x + dx / d * m; z = s.z + dz / d * m; }
      } else {
        const c = Math.cos(-s.rot), sn = Math.sin(-s.rot);
        let lx = (x - s.x) * c - (z - s.z) * sn, lz = (x - s.x) * sn + (z - s.z) * c;
        const ex = s.hw + r, ez = s.hd + r;
        if (Math.abs(lx) < ex && Math.abs(lz) < ez) {
          const px = ex - Math.abs(lx), pz = ez - Math.abs(lz);
          if (px < pz) lx = Math.sign(lx) * ex; else lz = Math.sign(lz) * ez;
          const c2 = Math.cos(s.rot), s2 = Math.sin(s.rot);
          x = s.x + lx * c2 - lz * s2; z = s.z + lx * s2 + lz * c2;
        }
      }
    }
    return { x, z };
  }

  // Something that floats: sits on the ground until the sea lifts it by its draft.
  floater(obj, { x, z, draft = 0.4, rot = 0, bob = 1, tiltWhenGrounded = 0, deck = null, maxY = Infinity, minY = -Infinity }) {
    const f = { obj, x, z, draft, rot, bob, tilt: tiltWhenGrounded, y: 0, afloat: false, deck, maxY, minY, phase: Math.random() * 6 };
    f.ground = () => this.terrain(f.x, f.z);
    f.y = Math.max(f.ground(), tide.level - draft);
    if (deck) {
      f.plat = this.plat({ x, z, hw: deck.hw, hd: deck.hd, rot, top: () => f.y + deck.top, vel: new THREE.Vector3() });
    }
    this.floaters.push(f);
    return f;
  }

  update(dt, t) {
    for (const f of this.floaters) {
      const g = f.ground();
      const want = Math.min(f.maxY, Math.max(g, f.minY, tide.level - f.draft));
      f.afloat = tide.level - f.draft > g + 0.02;
      f.y += (want - f.y) * Math.min(1, dt * 3);
      const bob = f.afloat ? Math.sin(t * 1.3 + f.phase) * 0.05 * f.bob : 0;
      f.obj.position.set(f.x, f.y + bob, f.z);
      const tl = f.afloat ? 0 : f.tilt;
      f.obj.rotation.set(f.afloat ? Math.sin(t * 0.9 + f.phase) * 0.025 * f.bob : 0, f.rot, THREE.MathUtils.lerp(f.obj.rotation.z, tl, Math.min(1, dt * 2)) + (f.afloat ? Math.sin(t * 1.1 + f.phase) * 0.03 * f.bob : 0));
      if (f.plat) { f.plat.x = f.x; f.plat.z = f.z; }
    }
    for (const fn of this.tickers) fn(dt, t);
  }

  nearestUse(x, z) {
    let best = null, bd = 1e9;
    for (const u of this.uses) {
      if (u.done || (u.when && !u.when())) continue;
      const d = Math.hypot(x - u.x, z - u.z);
      if (d < u.r && d < bd) { bd = d; best = u; }
    }
    return best;
  }
}
