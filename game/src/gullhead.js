// Gull Head: the Needle Run. Tam sails you round the headland through its sea arches and over its
// reefs. Too low a sea and the keel strikes a reef; too high and the mast strikes an arch. You
// keep the sea inside a window that moves with every gate. Nothing kills you: a strike stops the
// boat, Tam backs her off, and you try that gate again.
import * as THREE from 'three';
import { tide } from './tide.js';
import { hud } from './hud.js';

// the course, landing to landing
const PATH = [[101, -10], [108, -26], [120, -44], [138, -60], [158, -64], [176, -54], [188, -36], [193, -18], [194, -8]];
// gates: where along the course (0..1), and the sea window that clears them
const GATES = [
  { t: 0.14, lo: -2.6, hi: 0.6, arch: true, reef: false },
  { t: 0.27, lo: -0.6, hi: 2.6, arch: false, reef: true },
  { t: 0.41, lo: -0.2, hi: 1.2, arch: true, reef: true },
  { t: 0.55, lo: -1.9, hi: -0.6, arch: true, reef: true },
  { t: 0.70, lo: 1.0, hi: 2.4, arch: true, reef: true },
  { t: 0.84, lo: -1.2, hi: 0.2, arch: true, reef: true },
];
const MAST = 4.9, KEEL = 0.4, ARCH_UNDER = 9.45;

export const HEAD = { landing: { x: 101, z: -6 }, end: { x: 195, z: -4 }, tam: { x: 99, z: -3 } };

export async function buildGullHead(ctx) {
  const { put, world, scene, sfx, player } = ctx;
  const curve = new THREE.CatmullRomCurve3(PATH.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, 'centripetal');
  const L = curve.getLength();

  // the obstacles, built from the asset set: an arch whose underside sits at hi + mast,
  // a reef whose crown sits at lo - keel
  for (const g of GATES) {
    const p = curve.getPointAt(g.t), d = curve.getTangentAt(g.t);
    const rot = Math.atan2(d.x, d.z);
    g.p = p;
    if (g.arch) {
      const o = await put('sea_arch', p.x, p.z, { rot, raw: true });
      if (o) o.position.y = g.hi + MAST - ARCH_UNDER;
      g.archObj = o;
    }
    if (g.reef) {
      const o = await put('sea_stack_rocks', p.x, p.z, { rot: rot + 1.1, raw: true, scale: 1.25 });
      if (o) o.position.y = g.lo - KEEL - 4.3 * 1.25 + 0.15;
      // marker reefs either side, so the line reads from above
      for (const s of [-1, 1]) {
        const q = new THREE.Vector3(d.z, 0, -d.x).multiplyScalar(s * 9).add(p);
        const r = await put('sea_stack_rocks', q.x, q.z, { rot: rot * s, raw: true });
        if (r) r.position.y = g.lo - KEEL - 2.6;
      }
    }
  }

  // Tam's boat waits at the landing
  const boat = await put('fishing_boat', HEAD.landing.x, HEAD.landing.z, { raw: true, rot: 2.6 });
  const tam = await ctx.person('tam_fisherman', HEAD.tam.x, HEAD.tam.z, 2.4);
  tam.root.visible = false;
  const run = { on: false, s: 0, speed: 0, bumps: 0, gate: 0, back: 0, done: false };
  if (boat) boat.visible = false;
  const tamSeat = new THREE.Vector3();

  function windowNow() {
    const g = GATES[run.gate];
    return g ? [g.lo, g.hi] : null;
  }
  ctx.tideWindow = () => (run.on ? windowNow() : null);

  world.tick((dt, t) => {
    if (!boat || !boat.visible) return;
    if (!run.on) {
      boat.position.set(HEAD.landing.x, tide.level - KEEL + Math.sin(t * 1.2) * 0.05, HEAD.landing.z);
      return;
    }
    // advance, unless the next gate would strike
    const g = GATES[run.gate];
    let target = 7.0;
    if (run.back > 0) { run.back -= dt; target = -3.5; }
    run.speed += (target - run.speed) * Math.min(1, dt * 1.6);
    let next = run.s + run.speed * dt / L;
    if (g && run.s < g.t && next >= g.t && run.back <= 0) {
      const ok = tide.level >= g.lo && tide.level <= g.hi;
      if (ok) { run.gate++; sfx.chime(); if (run.gate === 1) hud.toast('Through! Watch the next one.', 2.5); }
      else {
        run.bumps++; next = g.t - 0.002; run.speed = 0; run.back = 0.9; ctx.cam.shake = 0.6; sfx.splash();
        const lines = tide.level < g.lo ? ['Tam', 'Keel on the rocks! More water under us!'] : ['Tam', 'Mind the mast! Bring her down, the arch is low!'];
        hud.say([lines]);
      }
    }
    run.s = Math.max(0, Math.min(1, next));
    const p = curve.getPointAt(run.s), d = curve.getTangentAt(run.s);
    boat.position.set(p.x, tide.level - KEEL + Math.sin(t * 1.4) * 0.06, p.z);
    boat.rotation.set(Math.sin(t * 1.1) * 0.03, Math.atan2(d.x, d.z), Math.sin(t * 0.9) * 0.04 + run.speed * 0.004);
    // the girl and Tam ride on the deck
    tamSeat.set(-0.5, 0.95, -2.2).applyEuler(boat.rotation).add(boat.position);
    tam.root.position.copy(tamSeat); tam.root.rotation.y = boat.rotation.y;
    const me = new THREE.Vector3(0.3, 0.95, 1.2).applyEuler(boat.rotation).add(boat.position);
    player.pos.copy(me); player.root.position.copy(me); player.yaw = boat.rotation.y; player.root.rotation.y = player.yaw;
    if (run.s >= 0.999 && !run.done) {
      run.done = true; run.on = false; player.riding = false; ctx.cam.extraArm = 0; ctx.cam.extraPitch = 0;
      player.place(HEAD.end.x, HEAD.end.z, player.yaw); player.vel.set(0, 0, 0);
      boat.position.set(HEAD.end.x - 3, tide.level - KEEL, HEAD.end.z - 6);
      tam.root.position.set(HEAD.end.x - 1.5, world.terrain(HEAD.end.x - 1.5, HEAD.end.z + 1.5), HEAD.end.z + 1.5);
      ctx.headDone = { bumps: run.bumps };
    }
  });

  // --- the story of this place ----------------------------------------------------------------
  const S = ctx.story, P = 'Gull Head';
  S.step({ place: P, text: 'Tam has sailed round to the Gull Head landing. Meet him',
    enter: () => { if (boat) boat.visible = true; tam.root.visible = true; tam.root.position.set(HEAD.tam.x, world.terrain(HEAD.tam.x, HEAD.tam.z), HEAD.tam.z); },
    use: { x: HEAD.tam.x, z: HEAD.tam.z, r: 3.5, label: 'Talk' },
    onUse(done) {
      hud.say([
        ['Tam', 'The only way to the Stack is round the Head, through the Needles. Arches over us, reefs under us.'],
        ['Tam', 'Too little sea and we hit the reefs. Too much and the mast hits the arch. You keep her in between. I will steer.'],
      ], done);
    } });
  S.step({ place: P, text: 'Climb aboard Tam\'s boat',
    use: { x: HEAD.landing.x, z: HEAD.landing.z, r: 5, label: 'Board' },
    onUse(done) {
      run.on = true; run.s = 0; run.speed = 0; player.riding = true; ctx.cam.extraArm = 5; ctx.cam.extraPitch = 0.05;
      hud.toast('Keep the sea inside the bright band on the lantern', 5);
      done();
    } });
  S.step({ place: P, text: 'Thread the Needles: keep the sea between reef and arch',
    check: () => run.done,
    leave() {
      const b = ctx.headDone ? ctx.headDone.bumps : 0;
      hud.say([['Tam', b === 0 ? 'Not a scratch on her. Your grandmother could not have done that.' : `Only ${b} knock${b === 1 ? '' : 's'}. She has had worse from me.`],
        ['Tam', 'There is the Stack. Mind the old stepping stones; they only show when the sea is low.']]);
    } });
  return { curve, gates: GATES, run };
}
