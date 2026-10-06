// Gullwick Harbour: the first place. A stilt village on two benches above a cove, a boathouse,
// a jetty, a causeway the sea hides, and the drowned well on its islet.
import * as THREE from 'three';
import { tide } from './tide.js';
import { hud } from './hud.js';

export const HARBOUR = {
  start: { x: -146, z: 44, yaw: Math.PI * 0.1 },
  nell: { x: -152, z: 50.5 },
  tam: { x: -160, z: 29 },
  well: { x: -100, z: -40 },
  islet: { x: -100, z: -40, r: 10 },
  boat: { x: -166, z: 18 },
};

export async function buildHarbour(ctx) {
  const { put, world, scene, sfx } = ctx;
  const H = HARBOUR;

  // --- the village: houses face the sea (-Z), so they turn half a circle ----------------
  const houses = [];
  const A = 'stilt_house_a', B = 'stilt_house_b';
  // bench 1, behind the street (the square and Nell's yard stay open at -160..-140)
  [[-189, 56, A], [-178, 55.5, B], [-168, 56.5, A], [-133, 56, B], [-123.5, 55.5, A], [-114, 56.5, B]].forEach(([x, z, k], i) => houses.push([k, x, z, (i % 3 - 1) * 0.09]));
  // bench 2, the upper lane
  [[-186, 67, B], [-175, 68, A], [-163, 67.5, B], [-151, 68.5, A], [-139, 67, B], [-127, 68, A], [-116, 67.5, B]].forEach(([x, z, k], i) => houses.push([k, x, z, ((i + 1) % 3 - 1) * 0.1]));
  // at the waterline, on stilts the high tide runs under
  [[-187, 29, A, 0.25], [-178, 27.5, B, 0.3], [-131, 30, A, -0.2], [-122, 31.5, B, -0.25]].forEach(([x, z, k, r]) => houses.push([k, x, z, r]));
  for (const [slug, x, z, r] of houses) {
    const o = await put(slug, x, z, { rot: Math.PI + r, foot: 2.6 });
    if (o) world.solid({ x, z, hw: 2.9, hd: 2.5, rot: Math.PI + r, y1: world.terrain(x, z) + 6 });
  }
  // Nell's house is the boathouse at the top of the slip
  const bh = await put('boathouse', -110, 25, { rot: Math.PI - 0.08 });
  if (bh) world.solid({ x: -110, z: 25, hw: 4.1, hd: 7.0, rot: Math.PI - 0.08 });

  // the jetty: three sections from the street out over the beach to the water
  for (let i = 0; i < 3; i++) {
    const z = 38 - i * 8;
    // stretch the piles down to the lowest ground under the section, deck top stays at 2.6
    let gmin = 9; for (let k = -4; k <= 4; k += 1) gmin = Math.min(gmin, world.terrain(-141, z + k));
    const jt = await put('jetty', -141, z, { raw: true });
    if (jt) { jt.position.y = gmin; jt.scale.y = (2.6 - gmin) / 2.6; }
    world.plat({ x: -141, z, hw: 1.25, hd: 4.0, top: 2.6 });
  }
  world.plat({ x: -141, z: 43.5, hw: 1.3, hd: 1.6, top: (lx, lz) => 2.6 + (lz / 1.6 + 1) * 0.0 });

  // well and shrine on the islet
  await put('well_islet', H.well.x, H.well.z, { rot: 0.4 });
  world.solid({ x: H.well.x, z: H.well.z, r: 1.15 });
  await put('moon_shrine', H.well.x + 4.5, H.well.z - 3.5, { rot: -0.6 });
  world.solid({ x: H.well.x + 4.5, z: H.well.z - 3.5, r: 0.7 });

  // lamp posts along the street and the causeway head
  for (const [x, z] of [[-175, 50], [-158, 47], [-139, 47], [-124, 45], [-121, 30], [-150, 37]]) {
    await put('lamp_post', x, z, { rot: Math.random() * 6 });
    world.solid({ x, z, r: 0.25 });
  }
  // rope posts marking the causeway, so the hidden path has a line you can read under water
  for (let i = 0; i <= 9; i++) {
    const t = i / 9, x = -120 + (16 * t), z = 26 - 54 * t;
    for (const s of [-1, 1]) {
      const px = x + s * 2.7 * 0.96, pz = z + s * 2.7 * 0.28;
      await put('rope_post', px, pz, { rot: i * 1.3 });
    }
  }
  // props
  const props = [
    ['barrel', -147, 47], ['barrel', -146.2, 47.6], ['crate', -153, 46.5], ['crate', -153.4, 47.3, 0.8], ['lobster_pot', -144, 41],
    ['lobster_pot', -137.5, 33.2], ['crate', -119, 36], ['barrel', -118, 37], ['barrel', -171, 47], ['lobster_pot', -172, 46],
    ['crate', -128, 47.5], ['barrel', -103, -35.5], ['lobster_pot', -96, -37],
  ];
  for (const [slug, x, z, r] of props) { await put(slug, x, z, { rot: r ?? Math.random() * 6 }); world.solid({ x, z, r: 0.4, y1: world.terrain(x, z) + 0.9 }); }

  // rowboats pulled up on the beach (they float when the sea comes up)
  const rbs = [];
  for (const [x, z, r] of [[-152, 27, 0.4], [-128, 22, -0.6], [-96, -30, 1.2]]) {
    const o = await put('rowboat', x, z, { rot: r, raw: true });
    if (o) rbs.push(world.floater(o, { x, z, draft: 0.14, rot: r, tiltWhenGrounded: 0.12 }));
  }

  // Tam's boat, stranded in its scrape
  const tamBoat = await put('fishing_boat', H.boat.x, H.boat.z, { rot: 0.7, raw: true });
  const boat = tamBoat ? world.floater(tamBoat, { x: H.boat.x, z: H.boat.z, draft: 1.25, rot: 0.7, tiltWhenGrounded: 0.16 }) : null;
  const boatSolid = world.solid({ x: H.boat.x, z: H.boat.z, hw: 1.3, hd: 3.6, rot: 0.7 });

  // a raft tied under the jetty end
  const raftO = await put('raft', -137, 14, { rot: 0.2, raw: true });
  if (raftO) world.floater(raftO, { x: -137, z: 14, draft: 0.18, rot: 0.2, deck: { hw: 1.25, hd: 1.25, top: 0.49 } });

  // --- the drowned well: its water is the sea's, and the bucket rides it ------------------
  const wellWater = new THREE.Mesh(new THREE.CircleGeometry(0.8, 24), new THREE.MeshStandardMaterial({ color: 0x1b5a64, roughness: 0.1 }));
  wellWater.rotation.x = -Math.PI / 2; scene.add(wellWater);
  const islH = world.terrain(H.well.x, H.well.z);
  const bucket = new THREE.Group();
  const shard = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), new THREE.MeshStandardMaterial({ color: 0x9fd8ff, emissive: 0x9fd8ff, emissiveIntensity: 2.4, roughness: 0.2 }));
  shard.name = 'shard'; shard.position.y = 0.35; bucket.add(shard);
  const shardLight = new THREE.PointLight(0x9fd8ff, 6, 7, 2); shardLight.position.y = 0.5; bucket.add(shardLight);
  scene.add(bucket);
  const wellFloor = islH - 2.6, wellRim = islH - 0.4;
  world.tick((dt, t) => {
    const y = Math.max(wellFloor, Math.min(wellRim, tide.level));
    wellWater.position.set(H.well.x, y + 0.01, H.well.z);
    bucket.position.set(H.well.x, y, H.well.z);
    shard.rotation.y = t * 1.2; shard.position.y = 0.35 + Math.sin(t * 2) * 0.05;
  });

  // --- people -------------------------------------------------------------------------------
  const nell = await ctx.person('nell_tidekeeper', H.nell.x, H.nell.z, Math.PI * 0.85);
  const tam = await ctx.person('tam_fisherman', H.tam.x, H.tam.z, -0.6);

  // --- the story of this place --------------------------------------------------------------
  const S = ctx.story;
  const near = (p, r) => Math.hypot(ctx.player.pos.x - p.x, ctx.player.pos.z - p.z) < r;
  const P = 'Gullwick Harbour';

  S.step({ place: P, text: 'Find old Nell in the square above the slipway',
    use: { x: H.nell.x, z: H.nell.z, r: 3.2, label: 'Talk' },
    onUse(done) {
      hud.say([
        ['Nell', 'There you are. Since the light on the Stack went out, the sea has forgotten its way home. It just sits there, sulking.'],
        ['Nell', 'This lantern was the keeper\'s. There is still a little of the moon\'s pull in it. Hold it, and the sea will follow your hand.'],
        ['Nell', 'The old well on the islet holds a shard of the moon. The causeway out is under water. Pull the sea down, and walk.'],
      ], () => { tide.locked = false; sfx.chime(); hud.toast(ctx.touch ? 'Drag the lantern down to pull the sea away' : 'Hold Q to pull the sea down, E to raise it', 5); done(); });
    } });

  S.step({ place: P, text: 'Pull the sea down and cross the causeway to the well islet',
    check: () => near(H.islet, H.islet.r) });

  S.step({ place: P, text: 'Raise the sea until the well fills and lifts the bucket',
    enter: () => hud.toast('The well is joined to the sea. Bring the sea up.', 4),
    check: () => tide.level > wellRim - 0.15 && near(H.well, 8) });

  S.step({ place: P, text: 'Take the moon shard from the bucket',
    use: { x: H.well.x, z: H.well.z, r: 3.2, label: 'Take', when: () => tide.level > wellRim - 0.4 },
    onUse(done) {
      bucket.remove(shard); shardLight.intensity = 0;
      tide.lo = -2.4; tide.hi = 2.4; sfx.shard();
      hud.toast('The lantern pulls harder now: the sea will go further both ways.', 4.5);
      done();
    } });

  S.step({ place: P, text: 'Head back to the harbour. Mind the sea behind you.',
    check: () => ctx.player.pos.z > 20 && ctx.player.pos.x < -105 });

  S.step({ place: P, text: 'Tam is waving from his stranded boat',
    use: { x: H.tam.x, z: H.tam.z, r: 3.2, label: 'Talk' },
    onUse(done) {
      hud.say([
        ['Tam', 'You have the keeper\'s lantern! The sea dropped my boat in the mud a month ago and never came back for her.'],
        ['Tam', 'Bring it up high, higher than any tide I remember, and I will float her off.'],
        ['Tam', 'But get yourself up on the wall first. That much sea will take you off your feet.'],
      ], done);
    } });

  S.step({ place: P, text: 'Raise the sea high enough to float Tam\'s boat',
    check: () => boat && boat.afloat && tide.level > 1.6,
    leave() {
      boatSolid.off = true; sfx.chime();
      hud.say([
        ['Tam', 'She floats! Thank you. Listen: the keeper\'s lens went down with the Marguerite, out on the Shellflats.'],
        ['Tam', 'There is a sand bar east of the point. It only shows at the lowest tide there ever was. Which is yours now.'],
      ]);
      // Tam takes his boat round to the jetty
      ctx.anim(boat, { x: -137, z: 6 }, 12);
      tam.root.visible = false;
    } });

  S.step({ place: P, text: 'Pull the sea right down and cross the sand bar east',
    check: () => ctx.player.pos.x > -36 });

  return { bucket, boat, nell, tam };
}
