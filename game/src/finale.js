// The ending: the lamp is lit, its beam turns, the sun goes down behind the Stack, the moon rises
// out of the sea, and the sea finally goes home. A crane shot, then the end card.
import * as THREE from 'three';
import { tide } from './tide.js';
import { hud } from './hud.js';

export function makeFinale(ctx, { rig, camera, scene, stats }) {
  const top = new THREE.Vector3(220, ctx.world.terrain(220, -72) + 21.5, -72);
  // the beam: two long soft cones, additive, turning
  const beam = new THREE.Group(); beam.position.copy(top); beam.visible = false; scene.add(beam);
  const coneMat = new THREE.MeshBasicMaterial({ color: 0xffe6b0, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  for (const s of [1, -1]) {
    const c = new THREE.Mesh(new THREE.ConeGeometry(7, 90, 24, 1, true), coneMat);
    c.rotation.z = s * Math.PI / 2; c.position.x = s * 45; beam.add(c);
  }
  // the moon
  const moon = new THREE.Mesh(new THREE.SphereGeometry(9, 32, 16), new THREE.MeshBasicMaterial({ color: 0xeef6ff, fog: false }));
  moon.position.set(420, -30, -420); scene.add(moon); moon.visible = false;
  const moonLight = new THREE.DirectionalLight(0x9fc8ff, 0); moonLight.position.set(1, 1, -1); scene.add(moonLight);

  let t = -1;
  ctx.finale = () => {
    t = 0; ctx.player.riding = true; ctx.finaleRunning = true; hud.fade(true);
    ctx.music && ctx.music.play('finale', 999);
    setTimeout(() => hud.fade(false), 900);
    tide.locked = true;
  };
  ctx.finaleUpdate = (dt) => {
    if (t < 0) return false;
    t += dt;
    const k = Math.min(1, t / 14);
    // lamp on at 1.5 s
    if (t > 1.5) {
      beam.visible = true; beam.rotation.y += dt * 0.7;
      if (ctx.beacon) ctx.beacon.emissiveIntensity = Math.min(4, (t - 1.5) * 2);
      if (ctx.beaconLight) ctx.beaconLight.intensity = Math.min(900, (t - 1.5) * 400);
      if (t - dt <= 1.5) ctx.sfx.shard();
    }
    // the day goes; the moon comes
    rig.setTime({ hour: 17.65 + k * 1.15 });
    moon.visible = true; moon.position.y = -30 + k * 120; moonLight.intensity = k * 0.6;
    // crane: from the lamp gallery, out and up round the Stack
    const a = 2.2 + t * 0.12, r = 18 + k * 45, h = top.y - 4 + k * 25;
    camera.position.set(top.x + Math.cos(a) * r, h, top.z + Math.sin(a) * r);
    camera.lookAt(top.x - 30 * k, top.y - 8 * k, top.z + 20 * k);
    if (t > 16 && !ctx.finaleDone) { ctx.finaleDone = true; endCard(); }
    return true;
  };
  function endCard() {
    const s = stats();
    document.getElementById('endtext').innerHTML =
      `The lamp on the Stack burns again, and the sea has found its way home.<br><br>` +
      `<span class="st">${s.time}</span> on the coast &middot; <span class="st">${s.sea}</span> of sea moved by hand<br>` +
      `<span class="st">${s.knocks}</span> knocks in the Needles &middot; <span class="st">${s.found}</span> of ${s.of} lost things found`;
    document.getElementById('end').classList.add('on');
  }
  document.getElementById('again').addEventListener('click', () => location.reload());
  const keep = document.getElementById('keep');
  if (keep) keep.addEventListener('click', () => { document.getElementById('end').classList.remove('on'); t = -1; ctx.player.riding = false; tide.locked = false; ctx.finaleRunning = false; });
}
