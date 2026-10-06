// The traveller: walks, runs, wades, is turned back by deep water, rides whatever floats, and
// is carried home by a sea that rises over her head.
import * as THREE from 'three';
import { tide } from './tide.js';

const WALK = 3.3, RUN = 5.8, STEP = 0.6, WADE_MAX = 0.78, SWEPT = 1.0;

export class Player {
  constructor(model, world) {
    this.model = model; this.world = world;
    this.root = new THREE.Group(); this.root.add(model); this.root.name = 'player';
    this.pos = new THREE.Vector3(); this.vel = new THREE.Vector3();
    this.yaw = 0; this.phase = 0; this.speed = 0; this.depth = 0;
    this.safe = new THREE.Vector3(); this.safeT = 0;
    this.swept = 0; this.onPlat = null; this.frozen = false;
    this.travelled = 0;
    const j = model.userData.joints || {};
    this.j = j;
    this.rest = {};
    for (const [k, v] of Object.entries(j)) if (v && v.rotation) this.rest[k] = v.rotation.clone();
  }

  place(x, z, yaw = 0) {
    const g = this.world.groundAt(x, z, 99);
    this.pos.set(x, g.h, z); this.yaw = yaw; this.safe.copy(this.pos);
    this.root.position.copy(this.pos); this.root.rotation.y = yaw;
  }

  update(dt, input, camYaw) {
    const w = this.world;
    let mx = input.move.x, my = input.move.y;
    if (this.frozen || this.swept > 0) { mx = 0; my = 0; }
    const mag = Math.min(1, Math.hypot(mx, my));
    // camera-relative: forward is away from the camera
    const fx = -Math.sin(camYaw), fz = -Math.cos(camYaw);
    const rx = Math.cos(camYaw), rz = -Math.sin(camYaw);
    let dx = fx * my + rx * mx, dz = fz * my + rz * mx;
    const dl = Math.hypot(dx, dz);
    if (dl > 1e-4) { dx /= dl; dz /= dl; }

    this.depth = Math.max(0, tide.level - this.pos.y);
    let top = (input.run ? RUN : WALK) * (mag > 0.15 ? mag : 0);
    if (this.depth > 0.18) top *= 1 - 0.55 * Math.min(1, (this.depth - 0.18) / 0.6);
    const want = new THREE.Vector3(dx * top, 0, dz * top);
    const acc = mag > 0.15 ? 14 : 18;
    this.vel.x += (want.x - this.vel.x) * Math.min(1, acc * dt);
    this.vel.z += (want.z - this.vel.z) * Math.min(1, acc * dt);

    // ride a moving platform
    if (this.onPlat && this.onPlat.vel) { this.pos.x += this.onPlat.vel.x * dt; this.pos.z += this.onPlat.vel.z * dt; }

    const nx = this.pos.x + this.vel.x * dt, nz = this.pos.z + this.vel.z * dt;
    const ok = (x, z) => {
      const g = w.groundAt(x, z, this.pos.y);
      if (g.h - this.pos.y > STEP) return false;                      // a wall or a ledge
      if (!g.plat && tide.level - g.h > WADE_MAX && tide.level - g.h > this.depth) return false; // deep water
      return true;
    };
    let px = this.pos.x, pz = this.pos.z;
    if (ok(nx, nz)) { px = nx; pz = nz; }
    else if (ok(nx, this.pos.z)) { px = nx; this.vel.z *= 0.5; }
    else if (ok(this.pos.x, nz)) { pz = nz; this.vel.x *= 0.5; }
    else { this.vel.x *= 0.2; this.vel.z *= 0.2; }
    // solid things
    const r = w.collide(px, pz, 0.32, this.pos.y);
    px = r.x; pz = r.z;
    this.travelled += Math.hypot(px - this.pos.x, pz - this.pos.z);
    this.pos.x = px; this.pos.z = pz;

    const g = w.groundAt(px, pz, this.pos.y);
    this.onPlat = g.plat || null;
    // fall or settle onto the surface
    const ty = g.h;
    if (ty < this.pos.y) this.pos.y = Math.max(ty, this.pos.y - 9 * dt);
    else this.pos.y += (ty - this.pos.y) * Math.min(1, dt * 18);

    this.speed = Math.hypot(this.vel.x, this.vel.z);
    if (this.speed > 0.3) {
      const targetYaw = Math.atan2(this.vel.x, this.vel.z);
      let d = targetYaw - this.yaw; d = Math.atan2(Math.sin(d), Math.cos(d));
      this.yaw += d * Math.min(1, dt * 12);
    }

    // the sea comes over her head: carried back to the last dry place
    this.depth = Math.max(0, tide.level - this.pos.y);
    if (this.swept <= 0 && !this.onPlat && this.depth > SWEPT) { this.swept = 1.6; if (this.onSwept) this.onSwept(); }
    if (this.swept > 0) {
      this.swept -= dt;
      if (this.swept <= 0.8 && !this._moved) { this.pos.copy(this.safe); this.vel.set(0, 0, 0); this._moved = true; }
      if (this.swept <= 0) this._moved = false;
    } else if (this.depth < 0.05) {
      this.safeT += dt;
      if (this.safeT > 0.6) { this.safe.copy(this.pos); this.safeT = 0; }
    } else this.safeT = 0;

    this.root.position.copy(this.pos);
    this.root.rotation.y = this.yaw;
    this.animate(dt);
  }

  animate(dt) {
    const j = this.j, s = this.speed;
    const run = s > 4.2;
    this.phase += dt * (s > 0.2 ? (run ? 11.5 : 4.4 + s * 1.4) : 0);
    const a = Math.min(1, s / 2.5) * (run ? 0.95 : 0.62);
    const sw = Math.sin(this.phase), cw = Math.cos(this.phase);
    const t = performance.now() / 1000;
    const set = (k, x, y = 0, z = 0) => { const n = j[k], r = this.rest[k]; if (!n || !r) return; n.rotation.set(r.x + x, r.y + y, r.z + z); };
    set('leftUpperLeg', sw * a); set('rightUpperLeg', -sw * a);
    set('leftLowerLeg', Math.max(0, -cw) * a * 1.2); set('rightLowerLeg', Math.max(0, cw) * a * 1.2);
    set('leftUpperArm', -sw * a * 0.8); set('rightUpperArm', sw * a * 0.35 - 0.15);
    set('leftLowerArm', -0.25 - a * 0.3); set('rightLowerArm', -0.35);
    set('spine', (run ? 0.18 : 0.05) * Math.min(1, s / 3) + Math.sin(t * 1.6) * 0.012);
    set('head', -0.05 * Math.min(1, s / 3) + Math.sin(t * 0.7) * 0.03, Math.sin(t * 0.37) * 0.12 * (s < 0.3 ? 1 : 0));
    if (j.lantern) set('lantern', Math.sin(this.phase * 2) * 0.25 * a + Math.sin(t * 2.1) * 0.05, 0, Math.cos(this.phase) * 0.12 * a);
    if (j.hips) { const n = j.hips; n.position.y = (this._hy ??= n.position.y) + Math.abs(sw) * 0.045 * a; }
  }
}
