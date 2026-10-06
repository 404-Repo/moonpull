// A follow camera at character scale: Bellkeeper's framing (about 42 degrees vertical field of
// view, 25 degrees down, about 11 m back) in landscape, widened for a portrait phone so the girl
// stays small and the place stays big. Swings itself behind her when she walks; a drag takes over.
import * as THREE from 'three';

export class FollowCam {
  constructor(camera, ground) {
    this.cam = camera; this.ground = ground;
    this.yaw = Math.PI;            // looking toward -Z... set by caller
    this.pitch = THREE.MathUtils.degToRad(25.6);
    this.arm = 10.8; this.manualT = 99; this.focus = new THREE.Vector3(); this.shake = 0;
    this.zoomBias = 0; this.lookAhead = new THREE.Vector3();
  }
  resize(w, h) {
    const portrait = h > w;
    this.portrait = portrait;
    this.cam.aspect = w / h;
    this.cam.fov = portrait ? 60 : 42;
    this.baseArm = portrait ? 11.5 : 10.8;
    this.cam.updateProjectionMatrix();
  }
  snap(target, yaw) { this.yaw = yaw; this.focus.copy(target); this.update(0, target, null, { dx: 0, dy: 0 }, true); }
  update(dt, target, vel, look, instant = false) {
    if (look.dx || look.dy) {
      this.yaw -= look.dx * 0.0062;
      this.pitch = THREE.MathUtils.clamp(this.pitch + look.dy * 0.004, 0.12, 0.95);
      look.dx = 0; look.dy = 0; this.manualT = 0;
    } else this.manualT += dt;
    // swing behind the direction of travel once the player has let go of the camera
    if (vel && this.manualT > 1.6) {
      const sp = Math.hypot(vel.x, vel.z);
      if (sp > 1.2) {
        const want = Math.atan2(-vel.x, -vel.z);
        let d = want - this.yaw; d = Math.atan2(Math.sin(d), Math.cos(d));
        // only follow gentle turns: walking toward the camera should not spin it
        if (Math.abs(d) < 2.2) this.yaw += d * Math.min(1, dt * 0.9 * Math.min(1, sp / 3));
      }
    }
    if (vel) this.lookAhead.lerp(new THREE.Vector3(vel.x * 0.35, 0, vel.z * 0.35), Math.min(1, dt * 2));
    const f = target.clone().add(this.lookAhead); f.y += 1.15;
    if (instant) this.focus.copy(f); else this.focus.lerp(f, Math.min(1, dt * 6));
    const arm = (this.baseArm || this.arm) + this.zoomBias;
    const cp = Math.cos(this.pitch), sp2 = Math.sin(this.pitch);
    const pos = new THREE.Vector3(
      this.focus.x + Math.sin(this.yaw) * cp * arm,
      this.focus.y + sp2 * arm,
      this.focus.z + Math.cos(this.yaw) * cp * arm);
    const gh = this.ground(pos.x, pos.z) + 1.0;
    if (pos.y < gh) pos.y = gh;
    if (this.shake > 0) { pos.x += (Math.random() - 0.5) * this.shake; pos.y += (Math.random() - 0.5) * this.shake; this.shake *= Math.pow(0.02, dt); }
    this.cam.position.copy(pos);
    this.cam.lookAt(this.focus);
  }
}
