// The Shellflats: a bay that only exists at low tide. Sand ripples, kelp rocks, the wreck of the
// Marguerite on its side, and crabs that own the sand whenever the sea is away.
import * as THREE from 'three';
import { tide } from './tide.js';
import { hud } from './hud.js';

export const FLATS = {
  wreck: { x: 46, z: -46, rot: -0.5 },
  stern: { x: 52.5, z: -50.5 },
  raft: { x: 48.8, z: -52.6 },
  holes: [[30, -38], [38, -58], [58, -36], [62, -56], [24, -50], [44, -30], [70, -46], [20, -64]],
};

export async function buildFlats(ctx) {
  const { put, world, scene, sfx, player } = ctx;
  const F = FLATS;

  // dressing: kelp rocks scattered on the bed, thicker toward the wreck
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 26; i++) {
    const a = rnd() * Math.PI * 2, r = 12 + rnd() * 55;
    const x = 30 + Math.cos(a) * r * 1.3, z = -45 + Math.sin(a) * r * 0.7;
    if (Math.hypot(x - F.wreck.x, z - F.wreck.z) < 12) continue;
    const big = rnd() < 0.35;
    const o = await put(big ? 'sea_rock' : 'kelp_clump', x, z, { rot: rnd() * 6 });
    if (o && big) world.solid({ x, z, r: 1.6 });
  }

  // the wreck: solid hull, a stern you can only reach from a raft at high water
  const wr = await put('wreck_hull', F.wreck.x, F.wreck.z, { rot: F.wreck.rot });
  world.solid({ x: F.wreck.x, z: F.wreck.z, hw: 3.2, hd: 11, rot: F.wreck.rot, y1: 6 });
  // the stern cabin floor: a platform up at +2.2
  const cabinTop = 2.2;
  world.plat({ x: F.stern.x, z: F.stern.z, hw: 1.6, hd: 1.6, rot: F.wreck.rot, top: cabinTop });
  world.solid({ x: F.stern.x, z: F.stern.z, hw: 1.7, hd: 1.7, rot: F.wreck.rot, y1: cabinTop });

  // the hatch-cover raft, tied to the hull so the sea can only lift it, not take it
  const raftO = await put('raft', F.raft.x, F.raft.z, { rot: F.wreck.rot, raw: true });
  const rf = world.floater(raftO || new THREE.Group(), { x: F.raft.x, z: F.raft.z, draft: 0.18, rot: F.wreck.rot, deck: { hw: 1.25, hd: 1.25, top: 0.45 } });

  // the lens, glinting in the cabin
  const lens = new THREE.Group();
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.18, 24), new THREE.MeshStandardMaterial({ color: 0xffe3b0, emissive: 0xffc070, emissiveIntensity: 1.6, roughness: 0.1, metalness: 0.2 }));
  glass.rotation.x = Math.PI / 2; lens.add(glass);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.05, 8, 24), new THREE.MeshStandardMaterial({ color: 0xb08a3c, metalness: 0.8, roughness: 0.35 }));
  lens.add(ring);
  const lensLight = new THREE.PointLight(0xffc070, 5, 8, 2); lens.add(lensLight);
  lens.position.set(F.stern.x, cabinTop + 0.7, F.stern.z); scene.add(lens);
  world.tick((dt, t) => { lens.rotation.y = t * 0.8; });

  // --- crabs -----------------------------------------------------------------------------
  const crabs = [];
  for (const [hx, hz] of F.holes) {
    let o = await put('shore_crab', hx, hz, { raw: true });
    if (!o) { o = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 6), new THREE.MeshStandardMaterial({ color: 0xc8502e })); o.scale.y = 0.5; scene.add(o); }
    crabs.push({ o, hx, hz, x: hx, z: hz, state: 'hid', t: Math.random() * 2, y: -5, cool: 0 });
  }
  let pinched = 0;
  world.tick((dt, t) => {
    const low = tide.level;
    for (const c of crabs) {
      const g = world.terrain(c.x, c.z);
      const wet = low - g;          // water over the crab
      const pd = Math.hypot(player.pos.x - c.x, player.pos.z - c.z);
      c.cool -= dt;
      if (c.state === 'hid') { if (wet < -0.15 && pd < 26) { c.t -= dt; if (c.t < 0) c.state = 'out'; } }
      else if (wet > 0.25) c.state = 'flee';
      if (c.state === 'out') {
        if (pd < 14) {
          const dx = player.pos.x - c.x, dz = player.pos.z - c.z, sp = 2.6;
          c.x += dx / pd * sp * dt; c.z += dz / pd * sp * dt;
          if (pd < 0.9 && c.cool < 0) {
            c.cool = 1.6; pinched++;
            player.vel.x += dx / pd * 7; player.vel.z += dz / pd * 7;
            sfx.pinch && sfx.pinch(); ctx.cam.shake = 0.25;
            if (pinched === 1) hud.toast('Crabs own the sand at low water. Bring the sea back and they run.', 4.5);
          }
        } else { c.x += Math.sin(t * 0.7 + c.hx) * dt * 0.6; c.z += Math.cos(t * 0.5 + c.hz) * dt * 0.6; }
      }
      if (c.state === 'flee') {
        const dx = c.hx - c.x, dz = c.hz - c.z, d = Math.hypot(dx, dz);
        if (d < 0.4) { c.state = 'hid'; c.t = 1 + Math.random() * 2; }
        else { c.x += dx / d * 4 * dt; c.z += dz / d * 4 * dt; }
      }
      const target = c.state === 'hid' ? g - 0.4 : world.terrain(c.x, c.z);
      c.y += (target - c.y) * Math.min(1, dt * 6);
      c.o.position.set(c.x, c.y, c.z);
      if (c.state !== 'hid') c.o.rotation.y = Math.atan2(player.pos.x - c.x, player.pos.z - c.z) + Math.sin(t * 9 + c.hx) * 0.15;
      c.o.visible = c.y > g - 0.35;
    }
  });

  // --- the story of this place --------------------------------------------------------------
  const S = ctx.story, P = 'The Shellflats';
  const near = (p, r) => Math.hypot(player.pos.x - p.x, player.pos.z - p.z) < r;
  S.step({ place: P, text: 'Find the wreck of the Marguerite out on the flats',
    enter: () => hud.toast('The sea will try to come home. Keep it away.', 4),
    check: () => near(F.wreck, 16) });
  S.step({ place: P, text: 'The lens is in the stern cabin. Ride the raft up to it',
    check: () => player.pos.y > cabinTop - 0.1 && near(F.stern, 2.4) });
  S.step({ place: P, text: 'Take the keeper\'s lens',
    use: { x: F.stern.x, z: F.stern.z, r: 2.4, label: 'Take' },
    onUse(done) { scene.remove(lens); sfx.shard(); hud.toast('The lens is heavy and warm, as if it remembers the light.', 4); ctx.inv.lens = true; done(); } });
  S.step({ place: P, text: 'Carry the lens east to Gull Head',
    check: () => player.pos.x > 96 });
  return { crabs, raft: rf };
}
