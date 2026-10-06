// A follow camera at character scale, matched to The Last Bellkeeper's measured rig
// (research/winners/WINNERS.md): fov 42, pitch atan(0.48) = 25.6 degrees down, arm 10.8 m in
// landscape and 11.5 m in portrait, focus 1.0 m above the hero and 0.8 m toward the camera,
// followed at rate 7, portrait view shifted up 14%. The player swings yaw only. When ground or
// a solid gets between, the pitch rises first and the arm shortens only after that.
import * as THREE from 'three';

const PITCH = Math.atan(0.48);

export class FollowCam {
  constructor(camera, ground) {
    this.cam = camera; this.ground = ground;
    this.yaw = 0; this.pitch = PITCH; this.arm = 10.8; this.baseArm = 10.8;
    this.manualT = 99; this.focus = new THREE.Vector3(); this.shake = 0;
    this.extraPitch = 0; this.extraArm = 0;   // set by set pieces (boat, boss)
    this.blockers = null;                      // optional fn(x, z) -> top height of a solid there
  }
  resize(w, h) {
    this.portrait = w / h < 0.85;
    this.cam.aspect = w / h;
    this.cam.fov = 42;
    this.baseArm = this.portrait ? 11.5 : 10.8;
    if (this.portrait) this.cam.setViewOffset(w, h, 0, -h * 0.14, w, h); else this.cam.clearViewOffset();
    this.cam.updateProjectionMatrix();
  }
  snap(target, yaw) { this.yaw = yaw; this.update(0, target, null, { dx: 0, dy: 0 }, true); }
  clearance(fx, fy, fz, pitch, arm) {
    // the worst intrusion of ground along the boom, in metres
    const cp = Math.cos(pitch), sp = Math.sin(pitch);
    let worst = 0;
    for (let k = 0.3; k <= 1.0001; k += 0.06) {
      const x = fx + Math.sin(this.yaw) * cp * arm * k, z = fz + Math.cos(this.yaw) * cp * arm * k, y = fy + sp * arm * k;
      let g = this.ground(x, z);
      if (this.blockers) g = Math.max(g, this.blockers(x, z));
      worst = Math.max(worst, g + 0.8 - y);
    }
    return worst;
  }
  update(dt, target, vel, look, instant = false) {
    if (look.dx) { this.yaw -= look.dx * 0.006; this.manualT = 0; }
    look.dx = 0; look.dy = 0;
    this.manualT += dt;
    // a set piece can name something to keep in frame: the camera swings to put it beyond the hero
    if (this.aim && this.manualT > 1.2) {
      const want = Math.atan2(target.x - this.aim.x, target.z - this.aim.z);
      let d = want - this.yaw; d = Math.atan2(Math.sin(d), Math.cos(d));
      this.yaw += d * Math.min(1, dt * 1.5);
    } else if (vel && this.manualT > 2.0) {
      const sp = Math.hypot(vel.x, vel.z);
      if (sp > 1.4) {
        const want = Math.atan2(-vel.x, -vel.z);
        let d = want - this.yaw; d = Math.atan2(Math.sin(d), Math.cos(d));
        if (Math.abs(d) < 2.0) this.yaw += d * Math.min(1, dt * 0.7 * Math.min(1, sp / 3.5));
      }
    }
    const f = target.clone(); f.y += 1.0;
    f.x += Math.sin(this.yaw) * 0.8; f.z += Math.cos(this.yaw) * 0.8;
    if (instant) this.focus.copy(f); else this.focus.lerp(f, 1 - Math.exp(-7 * dt));

    // keep the ground and solids out of the lens: swing yaw a little first (cheap and keeps the
    // framing), then raise the pitch, then shorten the arm
    let wantPitch = PITCH + this.extraPitch, wantArm = this.baseArm + this.extraArm;
    const blocked = () => this.clearance(this.focus.x, this.focus.y, this.focus.z, wantPitch, wantArm) > 0;
    if (blocked()) {
      const y0 = this.yaw; let best = null;
      for (const off of [0.3, -0.3, 0.6, -0.6, 0.9, -0.9]) { this.yaw = y0 + off; if (!blocked()) { best = off; break; } }
      this.yaw = y0;
      if (best !== null) this.yaw = y0 + best * Math.min(1, dt * 3);
    }
    for (let i = 0; i < 6 && blocked(); i++) wantPitch = Math.min(0.96, wantPitch + 0.08);
    for (let i = 0; i < 8 && blocked() && wantArm > 4.5; i++) wantArm = Math.max(4.5, wantArm - 1.0);
    if (instant) { this.pitch = wantPitch; this.arm = wantArm; }
    else {
      this.pitch += (wantPitch - this.pitch) * (1 - Math.exp(-(wantPitch > this.pitch ? 12 : 2.4) * dt));
      this.arm += (wantArm - this.arm) * (1 - Math.exp(-(wantArm < this.arm ? 12 : 2) * dt));
    }
    const cp = Math.cos(this.pitch), sp2 = Math.sin(this.pitch);
    const pos = new THREE.Vector3(
      this.focus.x + Math.sin(this.yaw) * cp * this.arm,
      this.focus.y + sp2 * this.arm,
      this.focus.z + Math.cos(this.yaw) * cp * this.arm);
    const gh = this.ground(pos.x, pos.z) + 0.8;
    if (pos.y < gh) pos.y = gh;
    if (this.shake > 0.002) { pos.x += (Math.random() - 0.5) * this.shake; pos.y += (Math.random() - 0.5) * this.shake; this.shake *= Math.pow(0.02, dt); }
    this.cam.position.copy(pos);
    this.cam.lookAt(this.focus);
  }
}
