// The Stack: stepping stones that only show at low water, a tidal basin under the dark lighthouse,
// and the Undertow, a giant hermit crab that wears a capsized boat. It is fought with the sea and
// nothing else: bring the sea up to lure it in, drop it fast to strand it on the sand, then raise it
// hard so its boat floats off its back, and shine the lantern on it while it is bare. Three times.
import * as THREE from 'three';
import { tide } from './tide.js';
import { hud } from './hud.js';
import { mergePerJoint } from './rigmerge.js';

export const STACK = {
  stones: { x: 215, z: -43 }, arena: { x: 218, z: -42 }, ledge: { x: 220, z: -56 },
  door: { x: 220, z: -62.5 }, lair: { x: 232, z: -18 },
};

export async function buildStack(ctx) {
  const { world, scene, sfx, player } = ctx;
  const T = world.terrain;
  const S = STACK;

  // --- the Undertow ---------------------------------------------------------------------------
  const B = { hp: 3, phase: 0, state: 'asleep', x: S.lair.x, z: S.lair.z, yaw: Math.PI, t: 0, strandT: 0, exposedT: 0,
    rise0: 0, riseT: 0, attackT: 0, active: false, y: -12, lives: 3, shellAway: 0 };
  let crab = null, J = {}, shell = null, shellFloat = null;
  if (ctx.has('undertow_crab')) {
    crab = await ctx.asset('undertow_crab', { keepHierarchy: true });
    mergePerJoint(crab);
    J = crab.userData.joints || {};
    shell = J.shell;
    crab.position.set(B.x, B.y, B.z);
    scene.add(crab);
    crab.traverse((o) => { if (o.material && o.material.name === 'bosseye') B.eye = o.material; });
  }
  ctx.boss = B;
  const hearts = document.createElement('div'); hearts.id = 'hearts'; document.getElementById('hud').appendChild(hearts);
  const bar = document.createElement('div'); bar.id = 'bossbar'; bar.innerHTML = '<div class="nm">The Undertow</div><div class="pips"><i></i><i></i><i></i></div>'; document.getElementById('hud').appendChild(bar);
  const drawHud = () => {
    hearts.innerHTML = B.active ? '<span>' + '&#9679;'.repeat(B.lives) + '<em>' + '&#9679;'.repeat(3 - B.lives) + '</em></span>' : '';
    bar.classList.toggle('on', B.active);
    bar.querySelectorAll('i').forEach((p, k) => p.classList.toggle('gone', k >= B.hp));
  };

  const inArena = (x, z) => Math.hypot(x - S.arena.x, z - S.arena.z) < 17;
  const dryAt = (x, z) => tide.level < T(x, z) + 0.15;
  const say = (who, line) => hud.say([[who, line]]);
  let shineReady = false;

  world.tick((dt, t) => {
    if (!crab) return;
    B.t += dt;
    const px = player.pos.x, pz = player.pos.z;
    const ground = T(B.x, B.z);
    const water = tide.level - ground;
    let speed = 0, tx = B.x, tz = B.z;
    // the sea it needs: phase 1 comes in at any useful water, later phases need more bait
    const lure = [0.3, 0.3, 1.0, 1.4][B.phase];
    if (B.state === 'asleep') { B.y += (-12 - B.y) * dt; }
    else if (B.state === 'rise') {
      B.y += (T(B.x, B.z) + 0.2 - B.y) * Math.min(1, dt * 0.8);
      if (B.t > 4.5) { B.state = 'lurk'; B.t = 0; }
    } else if (B.state === 'lurk') {
      // circles out in the deep until the sea is high enough to hunt in
      const a = t * 0.25; tx = S.lair.x + Math.cos(a) * 9; tz = S.lair.z + Math.sin(a) * 6; speed = 2.5;
      if (tide.level > lure) { B.state = 'hunt'; B.t = 0; say('Nell', B.phase === 1 ? 'It comes with the high water. Let it come, then take the water away.' : 'It is warier now. It wants deeper water before it trusts you.'); }
    } else if (B.state === 'hunt') {
      tx = px; tz = pz; speed = water > 0.6 ? 5.2 + B.phase * 0.6 : 1.6;
      // it will not leave the water to chase you up the ledge
      if (T(px, pz) > tide.level - 0.3) { tx = (px + S.arena.x) / 2; tz = (pz + S.arena.z) / 2; }
      if (tide.level < lure - 1.6 && !inArena(B.x, B.z)) { B.state = 'lurk'; }
      if (inArena(B.x, B.z) && dryAt(B.x, B.z)) { B.state = 'stranded'; B.t = 0; sfx.splash(); say('Nell', 'It is stuck on the sand! Now bring the sea back, fast, all at once!'); }
      // claw strike when it reaches you in the water
      B.attackT -= dt;
      const d = Math.hypot(px - B.x, pz - B.z);
      if (d < 5.0 && B.attackT <= 0) {
        B.attackT = 2.2;
        B.slam = 0.6;
        if (player.depth > 0.05 || d < 3.5) {
          const k = 9 / Math.max(0.5, d);
          player.vel.x += (px - B.x) * k; player.vel.z += (pz - B.z) * k;
          ctx.cam.shake = 0.8; sfx.splash();
          B.lives--; if (B.lives <= 0) { B.lives = 3; hud.fade(true); setTimeout(() => hud.fade(false), 900); player.place(S.ledge.x, S.ledge.z, player.yaw); say('Nell', 'Up on the ledge, child. Let the sea do the fighting.'); }
        }
      }
    } else if (B.state === 'stranded') {
      // drags itself toward the water; a fast rise lifts the boat off its back
      speed = 0.5; tx = S.lair.x; tz = S.lair.z;
      if (tide.speed > 0.5) { if (B.riseT <= 0) B.rise0 = tide.level; B.riseT += dt; } else B.riseT = 0;
      if (B.riseT > 0 && tide.level - B.rise0 > 1.6) { B.state = 'exposed'; B.t = 0; sfx.chime(); say('Nell', 'The boat lifted off! Shine the lantern on it, now!'); shellFloat = { y: 0, vx: (Math.random() - 0.5) * 2, vz: 2.2 }; }
      if (!dryAt(B.x, B.z) && B.t > 1.5 && tide.speed <= 0.5) { B.state = 'hunt'; B.t = 0; }
    } else if (B.state === 'exposed') {
      speed = 0.2; tx = S.lair.x; tz = S.lair.z;
      shineReady = Math.hypot(px - B.x, pz - B.z) < 26;
      if (B.t > 8) { B.state = 'regain'; B.t = 0; say('Nell', 'Too slow. It has its boat back.'); }
    } else if (B.state === 'hit') {
      if (B.t > 2.5) { B.state = 'regain'; B.t = 0; }
    } else if (B.state === 'regain') {
      if (shellFloat) { shellFloat.y *= 0.9; }
      if (B.t > 2.0) { shellFloat = null; B.state = B.hp > 0 ? 'lurk' : 'beaten'; B.t = 0; if (B.hp <= 0) ctx.onBossBeaten && ctx.onBossBeaten(); }
    } else if (B.state === 'beaten') {
      tx = S.lair.x + 20; tz = S.lair.z + 40; speed = 2; B.y += (-12 - B.y) * dt * 0.2;
    }
    if (B.state !== 'exposed') shineReady = false;
    // move and settle
    if (speed > 0) {
      const dx = tx - B.x, dz = tz - B.z, d = Math.hypot(dx, dz);
      if (d > 0.5) { B.x += dx / d * Math.min(d, speed * dt); B.z += dz / d * Math.min(d, speed * dt); B.yaw += Math.atan2(Math.sin(Math.atan2(dx, dz) - B.yaw), Math.cos(Math.atan2(dx, dz) - B.yaw)) * Math.min(1, dt * 2); }
    }
    if (B.state !== 'asleep' && B.state !== 'rise' && B.state !== 'beaten') {
      const floorY = T(B.x, B.z), swim = tide.level - 3.5;
      B.y += (Math.max(floorY, swim) - B.y) * Math.min(1, dt * 2);
    }
    crab.position.set(B.x, B.y, B.z); crab.rotation.y = B.yaw;
    // the body moves: legs walk, claws threaten, eyes sway
    const walk = Math.sin(t * (speed > 1 ? 7 : 2.5)) * Math.min(1, speed / 2) * 0.35;
    ['legL0', 'legL1', 'legL2', 'legR0', 'legR1', 'legR2'].forEach((k, i) => { const j = J[k]; if (j) { j.userData.r0 ??= j.rotation.clone(); j.rotation.y = j.userData.r0.y + walk * (i % 2 ? 1 : -1); j.rotation.z = j.userData.r0.z + Math.max(0, walk) * 0.3 * (i < 3 ? 1 : -1); } });
    if (B.slam > 0) B.slam -= dt;
    const raise = B.slam > 0 ? -1.1 : B.state === 'exposed' ? -0.8 + Math.sin(t * 9) * 0.3 : -0.2 + Math.sin(t * 1.3) * 0.1;
    for (const k of ['clawL', 'clawR']) { const j = J[k]; if (j) { j.userData.r0 ??= j.rotation.clone(); j.rotation.x = j.userData.r0.x + raise; } }
    for (const k of ['clawLPincer', 'clawRPincer']) { const j = J[k]; if (j) { j.userData.r0 ??= j.rotation.clone(); j.rotation.x = j.userData.r0.x - (0.3 + 0.3 * Math.sin(t * 4)); } }
    for (const k of ['eyeL', 'eyeR']) { const j = J[k]; if (j) { j.userData.r0 ??= j.rotation.clone(); j.rotation.z = j.userData.r0.z + Math.sin(t * 2 + (k === 'eyeL' ? 0 : 1)) * 0.15; } }
    if (B.eye) B.eye.emissiveIntensity = B.state === 'exposed' ? 3 + Math.sin(t * 12) : 1.4;
    // the shell: on its back, or floating off on the sea
    if (shell) {
      shell.userData.p0 ??= shell.position.clone();
      if (shellFloat) {
        shellFloat.y = Math.min(shellFloat.y + dt * 1.2, 2.2);
        shell.position.set(shell.userData.p0.x + shellFloat.vx * Math.min(B.t, 3) * 0.6, shell.userData.p0.y + shellFloat.y + Math.sin(t * 1.5) * 0.2, shell.userData.p0.z - shellFloat.vz * Math.min(B.t, 3) * 0.6);
        shell.rotation.z = Math.sin(t) * 0.1;
      } else { shell.position.lerp(shell.userData.p0, Math.min(1, dt * 3)); shell.rotation.z *= 0.9; }
    }
    drawHud();
  });

  // the Shine: a context action while it is bare
  world.usable({ id: 'shine', x: 0, z: 0, r: 0, label: 'Shine', when: () => shineReady,
    use: () => {
      B.hp--; B.state = 'hit'; B.t = 0; sfx.shard(); ctx.cam.shake = 0.5; ctx.flash && ctx.flash();
      ctx.story.bossHit && ctx.story.bossHit();
    } });
  // usable radius follows the crab
  world.tick(() => { const u = world.uses.find((u) => u.id === 'shine'); if (u) { u.x = B.x; u.z = B.z; u.r = shineReady ? 30 : 0; } });

  // --- the story of this place ----------------------------------------------------------------
  const St = ctx.story, P = 'The Stack';
  const near = (p, r) => Math.hypot(player.pos.x - p.x, player.pos.z - p.z) < r;
  St.step({ place: P, text: 'Pull the sea down and cross the stepping stones to the Stack', check: () => near(S.stones, 5) });
  St.step({ place: P, text: 'Climb up onto the ledge under the lighthouse',
    check: () => near(S.ledge, 9) && player.pos.y > 2,
    leave() {
      B.state = 'rise'; B.t = 0; B.active = true; B.phase = 1; B.x = S.lair.x; B.z = S.lair.z; B.y = T(B.x, B.z) - 8;
      ctx.cam.shake = 1.2; sfx.splash(); ctx.music && ctx.music.play('boss', 2);
      hud.say([['Nell', 'That is no rock. That is the Undertow. It took the keeper\'s boat for a shell, and the light with it.'],
        ['Nell', 'You cannot fight it. But you can move the sea, and it is a creature of the sea.']]);
    } });
  const hitStep = (n) => ({ place: 'The Undertow', text: n === 1 ? 'Lure it in with high water, strand it with low water, then raise the sea hard' : n === 2 ? 'Again: it wants deeper water now before it comes' : 'Once more. The ledge is safe; the sand is not',
    check: () => B.hp <= 3 - n,
    leave() { B.phase = n + 1; } });
  St.step(hitStep(1)); St.step(hitStep(2)); St.step(hitStep(3));
  St.step({ place: P, text: 'The Undertow lets go. Go to the lighthouse door',
    enter() { B.active = false; drawHud(); hud.say([['Nell', 'It is going home. So should the sea. Light the lamp, child.']]); },
    use: { x: S.door.x, z: S.door.z, r: 3.5, label: 'Climb' },
    onUse(done) { ctx.finale(); done(); } });
  St.step({ place: P, text: 'Light the lamp', check: () => ctx.finaleDone });
}
