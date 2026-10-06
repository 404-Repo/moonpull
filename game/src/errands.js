// Errands: three people with something the sea took, each solved with the tide, in any order,
// alongside the main road. Shown as a second line under the objective card.
import * as THREE from 'three';
import { tide } from './tide.js';
import { hud } from './hud.js';

export async function buildErrands(ctx) {
  const { put, world, player, sfx } = ctx;
  const list = [];
  const near = (p, r) => Math.hypot(player.pos.x - p.x, player.pos.z - p.z) < r;
  const ui = document.createElement('div'); ui.id = 'errands'; document.getElementById('obj').appendChild(ui);
  const draw = () => {
    const live = list.filter((e) => e.state > 0 && e.state < e.steps.length);
    ui.innerHTML = live.map((e) => `<div>&middot; ${e.steps[e.state]}</div>`).join('');
  };
  const errand = (e) => { e.state = 0; list.push(e); return e; };
  const advance = (e) => { e.state++; ctx.errandSteps = (ctx.errandSteps || 0) + 1; draw(); };
  ctx.foundOf = 5;
  // a glint that says "something is here" without being a 3D object
  const glint = (x, z, y) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0xbfeaff, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    s.scale.set(1.2, 1.2, 1); s.position.set(x, y, z); ctx.scene.add(s);
    world.tick((dt, t) => { s.material.opacity = 0.45 + 0.4 * Math.sin(t * 3 + x); s.scale.setScalar(0.9 + 0.3 * Math.sin(t * 2 + z)); });
    return s;
  };

  // --- Marta's pots: on the bottom off the jetty, only reachable at a deep low tide -----------
  const marta = await ctx.person('marta_fishwife', -136.5, 44.5, Math.PI * 0.9);
  const M = errand({ name: 'Marta', steps: ['', 'Find Marta\'s three lost pots off the jetty (0 of 3)', 'Bring the pots back to Marta'], got: 0 });
  world.usable({ x: -136.5, z: 44.5, r: 3, label: 'Talk', when: () => M.state === 0 || (M.state === 2),
    use: () => {
      if (M.state === 0) { hud.say([['Marta', 'The last real tide took three of my pots off the end of the jetty. They are down there on the bottom still.'], ['Marta', 'If that lantern of yours can empty the harbour, I will have them back, please.']]); advance(M); }
      else { hud.say([['Marta', 'All three! I will put a crab on your plate tonight. Not one of those big ones.']]); advance(M); ctx.found += 3; sfx.chime(); }
    } });
  for (const [x, z] of [[-147, 5], [-131, 3], [-160, 5]]) {
    const o = await put('lobster_pot_lost', x, z, { rot: x, raw: true }); if (o) o.position.y = world.terrain(x, z) - 0.05;
    const g = glint(x, z, world.terrain(x, z) + 0.8);
    const u = world.usable({ x, z, r: 2.2, label: 'Take', when: () => M.state === 1 && tide.level < world.terrain(x, z) + 0.6,
      use: () => { u.done = true; if (o) o.visible = false; g.visible = false; M.got++; sfx.chime(); M.steps[1] = `Find Marta's three lost pots off the jetty (${M.got} of 3)`; if (M.got >= 3) advance(M); else draw(); } });
  }

  // --- Pip's boat: drifted out; only a high sea carries it home, a low one sets it down --------
  const pip = await ctx.person('pip_child', -126, 37.5, Math.PI * 1.1);
  const P = errand({ name: 'Pip', steps: ['', 'Bring Pip\'s toy boat in: high water carries it to the beach', 'Let the sea down and pick up the boat', 'Give Pip back his boat'] });
  const home = { x: -146, z: 27 };
  const boatObj = await put('toy_boat', -104, 4, { raw: true });
  const tb = boatObj ? world.floater(boatObj, { x: -104, z: 4, draft: 0.05, bob: 3, tiltWhenGrounded: 0.4 }) : null;
  world.usable({ x: -126, z: 37.5, r: 3, label: 'Talk', when: () => P.state === 0 || P.state === 3,
    use: () => {
      if (P.state === 0) { hud.say([['Pip', 'My boat sailed off on its own! It is out there, bobbing. It will not come back.'], ['Pip', 'Grandad says only a big sea brings things home.']]); advance(P); }
      else { hud.say([['Pip', 'She came home! Thank you, thank you!']]); advance(P); ctx.found += 1; sfx.chime(); }
    } });
  if (tb) world.tick((dt) => {
    // an onshore drift while the sea is high and the boat floats
    if (P.state >= 1 && tb.afloat && tide.level > 1.0) {
      const dx = home.x - tb.x, dz = home.z - tb.z, d = Math.hypot(dx, dz);
      if (d > 0.5) { tb.x += dx / d * dt * 1.6; tb.z += dz / d * dt * 1.6; }
    }
    if (P.state === 1 && Math.hypot(tb.x - home.x, tb.z - home.z) < 4) { advance(P); hud.toast('Pip\'s boat is in. Now let the sea go.', 3); }
  });
  if (tb) world.usable({ x: 0, z: 0, r: 0, label: 'Take', id: 'toyboat', when: () => P.state === 2 && !tb.afloat,
    use: () => { boatObj.visible = false; advance(P); sfx.chime(); } });
  if (tb) world.tick(() => { const u = world.uses.find((u) => u.id === 'toyboat'); if (u) { u.x = tb.x; u.z = tb.z; u.r = 2.4; } });

  // --- Bram's spade: lost by the far weir, under water except at the lowest tide -------------
  const bram = await ctx.person('bram_cocklepicker', 12, -18, Math.PI * 0.8);
  const Br = errand({ name: 'Bram', steps: ['', 'Find Bram\'s spade by the far fish weir', 'Take the spade back to Bram'] });
  world.usable({ x: 12, z: -18, r: 3, label: 'Talk', when: () => Br.state === 0 || Br.state === 2,
    use: () => {
      if (Br.state === 0) { hud.say([['Bram', 'Forty years I have dug these flats. Lost my spade by the far weir when the sea turned. It has not gone out that far since.']]); advance(Br); }
      else { hud.say([['Bram', 'That is her. Here, have a cockle. Go on.']]); advance(Br); ctx.found += 1; sfx.chime(); }
    } });
  const sx = 34, sz = -78;
  const sp = await put('cockle_spade', sx, sz, { rot: 1.2, raw: true }); if (sp) sp.position.y = world.terrain(sx, sz) - 0.02;
  const sg = glint(sx, sz, world.terrain(sx, sz) + 0.6);
  const su = world.usable({ x: sx, z: sz, r: 2.2, label: 'Take', when: () => Br.state === 1 && tide.level < world.terrain(sx, sz) + 0.5,
    use: () => { su.done = true; if (sp) sp.visible = false; sg.visible = false; advance(Br); sfx.chime(); } });

  draw();
  return list;
}
