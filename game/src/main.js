// MOONPULL: boot, world, loop, telemetry.
import * as THREE from 'three';
import { ASSET, bakeStatic } from '../assetlib.js';
import { createRig } from '../rig.js';
import { buildGrid, makeSampler, heightTexture, buildGroundMesh, WORLD } from './terrain.js';
import { groundMaterial, seaMaterial, SEA } from './materials.js';
import { tide, updateTide } from './tide.js';
import { input, initInput, pollKeys, isTouch } from './input.js';
import { hud, sayAdvance } from './hud.js';
import { World } from './world.js';
import { Player } from './player.js';
import { FollowCam } from './camera.js';
import { Story } from './story.js';
import { initAudio, sfx } from './audio.js';
import { buildHarbour, HARBOUR } from './harbour.js';
import { buildFlats, FLATS } from './flats.js';
import { buildScenery } from './scenery.js';

const $ = (id) => document.getElementById(id);
const Q = new URLSearchParams(location.search);
const progress = (p, msg) => { $('barf').style.width = Math.round(p * 100) + '%'; if (msg) $('loadmsg').textContent = msg; };

window.__GAME__ = { pos: [0, 0], fps: 0, speed: 0, score: 0, over: false, draws: 0, tris: 0 };

const canvas = $('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setSize(innerWidth, innerHeight, false);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.3, 900);
const rig = createRig(THREE, renderer, scene, { hour: 17.25, azimuth: 288, camera, fogStart: 70, fogDensity: 0.0011, tier: Q.get('q') || 'auto' });

// --- the coast ---------------------------------------------------------------------------
progress(0.05, 'raising the coast');
const grid = buildGrid();
const terrainH = makeSampler(grid);
SEA.uHeight.value = heightTexture(grid);
SEA.uWorld.value.set(WORLD.x0, WORLD.z0, 1 / (WORLD.x1 - WORLD.x0 + WORLD.step), 1 / (WORLD.z1 - WORLD.z0 + WORLD.step));
// texel centres: the grid has nx samples spanning (x1-x0); map world -> [0.5/nx, 1-0.5/nx]
{
  const sx = (grid.nx - 1) / grid.nx / (WORLD.x1 - WORLD.x0), sz = (grid.nz - 1) / grid.nz / (WORLD.z1 - WORLD.z0);
  SEA.uWorld.value.set(WORLD.x0 - 0.5 / grid.nx / sx, WORLD.z0 - 0.5 / grid.nz / sz, sx, sz);
}
const ground = buildGroundMesh(grid, groundMaterial());
scene.add(ground);
const sea = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1200, 1, 1), seaMaterial());
sea.rotation.x = -Math.PI / 2; sea.position.set(0, 0, -200); sea.renderOrder = 2; sea.receiveShadow = true;
scene.add(sea);

const world = new World(terrainH);

// --- assets -------------------------------------------------------------------------------
let AVAIL = new Set();
try { AVAIL = new Set(await (await fetch('./assets/index.json')).json()); } catch { /* none yet */ }
async function put(slug, x, z, o = {}) {
  if (!AVAIL.has(slug)) return null;
  const obj = await ASSET(`./assets/${slug}.js`, { surfaces: true, height: o.height });
  let gy = terrainH(x, z);
  if (o.foot) for (let a = 0; a < 8; a++) gy = Math.min(gy, terrainH(x + Math.cos(a * 0.785) * o.foot, z + Math.sin(a * 0.785) * o.foot));
  obj.position.set(x, o.raw ? 0 : gy + (o.y || 0), z);
  obj.rotation.y = o.rot || 0;
  (o.raw ? scene : statics).add(obj);
  return obj;
}
const statics = new THREE.Group();
const people = [];
async function person(slug, x, z, yaw, o = {}) {
  let model;
  if (AVAIL.has(slug)) model = await ASSET(`./assets/${slug}.js`, { keepHierarchy: true, surfaces: true });
  else { model = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 1.0, 4, 8), new THREE.MeshStandardMaterial({ color: 0x334455 })); model.position.y = 0.8; const g = new THREE.Group(); g.add(model); model = g; }
  const root = new THREE.Group(); root.add(model);
  root.position.set(x, terrainH(x, z), z); root.rotation.y = yaw; scene.add(root);
  world.solid({ x, z, r: 0.45 });
  const p = { root, model, joints: model.userData.joints || {}, x, z, phase: Math.random() * 5 };
  people.push(p);
  return p;
}
function anim(f, to, secs) {
  const from = { x: f.x, z: f.z }; let t = 0;
  world.tick((dt) => { if (t >= 1) return; t = Math.min(1, t + dt / secs); const e = t * t * (3 - 2 * t); f.x = from.x + (to.x - from.x) * e; f.z = from.z + (to.z - from.z) * e; });
}

progress(0.2, 'calling the traveller');
let heroModel;
if (AVAIL.has('player_girl')) heroModel = await ASSET('./assets/player_girl.js', { keepHierarchy: true, surfaces: true });
else { heroModel = new THREE.Group(); const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 0.85, 4, 8), new THREE.MeshStandardMaterial({ color: 0x2f7f86 })); m.position.y = 0.72; m.castShadow = true; heroModel.add(m); }
const player = new Player(heroModel, world);
scene.add(player.root);
// the lantern's own light
const lanternLight = new THREE.PointLight(0x9fd8ff, 2.2, 6, 2);
scene.add(lanternLight);

const story = new Story(world);
const ctx = { put, person, anim, world, scene, sfx, story, player, touch: isTouch, inv: {}, cam: null };
progress(0.35, 'building Gullwick');
await buildHarbour(ctx);
progress(0.6, 'draining the flats');
await buildFlats(ctx);
await buildScenery(ctx);
progress(0.9, 'the tide is turning');
// static scenery merged by material: one bake per area keeps culling useful
{
  const areas = [[-1e9, -45], [-45, 100], [100, 1e9]];
  for (const [a, b] of areas) {
    const g = new THREE.Group();
    for (const c of [...statics.children]) { if (c.position.x >= a && c.position.x < b) g.add(c); }
    if (g.children.length) { g.updateMatrixWorld(true); scene.add(Q.has('nobake') ? g : bakeStatic(g)); }
  }
}

player.place(HARBOUR.start.x, HARBOUR.start.z, HARBOUR.start.yaw);
player.onSwept = () => { hud.fade(true); sfx.splash(); hud.toast('The sea carried you back to dry ground.', 3); setTimeout(() => hud.fade(false), 900); };
const cam = new FollowCam(camera, terrainH);
ctx.cam = cam;
cam.resize(innerWidth, innerHeight);
cam.snap(player.pos, Math.PI * 0.08);

// --- resize --------------------------------------------------------------------------------
function resize() {
  renderer.setSize(innerWidth, innerHeight, false);
  cam.resize(innerWidth, innerHeight);
  rig.resize(innerWidth, innerHeight);
}
addEventListener('resize', resize);

initInput(canvas);

// --- start ---------------------------------------------------------------------------------
let playing = false;
function start() {
  if (playing) return;
  playing = true;
  initAudio();
  $('title').classList.remove('on'); $('hud').classList.add('on');
  // dev only: ?step=n&at=x,z jumps ahead for my own testing (gates never use it)
  const st = +(Q.get('step') || 0);
  if (st > 0) { tide.locked = false; if (st > 3) { tide.lo = -2.4; tide.hi = 2.4; } }
  if (Q.get('at')) { const [x, z] = Q.get('at').split(',').map(Number); player.place(x, z, player.yaw); cam.snap(player.pos, cam.yaw); }
  story.begin(st);
}
window.__START__ = start;
$('startb').addEventListener('click', start);
$('startb').addEventListener('touchend', (e) => { e.preventDefault(); start(); });

// --- loop ------------------------------------------------------------------------------------
const clock = new THREE.Clock();
let fpsAcc = 0, fpsN = 0, fpsT = 0, t = 0, shoreProbe = 0, shoreDist = 30;
function frame() {
  requestAnimationFrame(frame);
  const raw = clock.getDelta();
  const dt = Math.min(raw, 1 / 20);
  fpsAcc += raw; fpsN++; if (fpsAcc > 0.5) { fpsT = fpsN / fpsAcc; fpsAcc = 0; fpsN = 0; }
  t += dt;
  pollKeys();
  if (playing) {
    if (input.act) { input.act = false; if (hud.talking) sayAdvance(); else { const u = world.nearestUse(player.pos.x, player.pos.z); if (u && !u.busy) u.use(); } }
    updateTide(dt, input);
    player.update(dt, input, cam.yaw);
    story.update();
  } else { input.act = false; }
  world.update(dt, t);
  // people breathe and look at you when you are near
  for (const p of people) {
    const j = p.joints; const d = Math.hypot(player.pos.x - p.x, player.pos.z - p.z);
    if (j.spine) j.spine.rotation.x = Math.sin(t * 1.4 + p.phase) * 0.02;
    if (j.head) { const want = d < 7 ? Math.atan2(player.pos.x - p.x, player.pos.z - p.z) - p.root.rotation.y : 0; const a = Math.atan2(Math.sin(want), Math.cos(want)); j.head.rotation.y += (THREE.MathUtils.clamp(a, -0.9, 0.9) - j.head.rotation.y) * Math.min(1, dt * 3); }
  }
  lanternLight.position.set(player.pos.x + Math.sin(player.yaw) * 0.25, player.pos.y + 0.9, player.pos.z + Math.cos(player.yaw) * 0.25);
  lanternLight.intensity = tide.locked ? 0 : 1.6 + Math.min(2.5, Math.abs(tide.speed) * 3);
  SEA.uSea.value = tide.level; SEA.uWet.value = tide.wet; SEA.uTime.value = t;
  sea.position.y = tide.level;
  cam.update(dt, player.pos, player.vel, input.look);
  if (window.__VIEW__) { const v = window.__VIEW__; camera.position.set(v[0], v[1], v[2]); camera.lookAt(v[3], v[4], v[5]); }
  if (window.__TIDE__ !== undefined) { tide.level = tide.target = window.__TIDE__; }
  // how far to the waterline, for the surf
  if ((shoreProbe += dt) > 0.25) {
    shoreProbe = 0; let best = 60;
    for (let a = 0; a < 12; a++) for (const r of [4, 10, 20, 35]) { const x = player.pos.x + Math.cos(a * 0.52) * r, z = player.pos.z + Math.sin(a * 0.52) * r; if (terrainH(x, z) < tide.level) { best = Math.min(best, r); break; } }
    shoreDist = best;
  }
  sfx.update(dt, shoreDist, tide.speed);
  hud.update(dt, playing ? world.nearestUse(player.pos.x, player.pos.z) : null);
  rig.render(camera, dt);
  const G = window.__GAME__;
  G.pos = [+player.pos.x.toFixed(2), +player.pos.z.toFixed(2)];
  G.fps = Math.round(fpsT); G.speed = +player.speed.toFixed(2); G.score = story.count;
  G.draws = renderer.info.render.calls; G.tris = renderer.info.render.triangles;
  G.tide = +tide.level.toFixed(2); G.step = story.i; G.objective = story.current ? story.current.text : 'done';
  G.depth = +player.depth.toFixed(2); G.heading = +player.yaw.toFixed(2); G.camYaw = +cam.yaw.toFixed(3); G.mv = [+input.move.x.toFixed(2), +input.move.y.toFixed(2)]; G.vel = [+player.vel.x.toFixed(2), +player.vel.z.toFixed(2)]; G.talking = hud.talking; G.use = (world.nearestUse(player.pos.x, player.pos.z) || {}).label || null; G.y = +player.pos.y.toFixed(2);
}

progress(1, 'ready');
$('load').style.display = 'none';
$('title').classList.add('on');
if (Q.has('autostart')) start();
window.__READY__ = true;
requestAnimationFrame(frame);
// dev hooks for my own testing only (never used by a gate)
window.__DEV__ = { tide, player, story, world, cam, THREE, scene, rig, FLATS };
