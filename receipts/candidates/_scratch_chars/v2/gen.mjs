import fs from 'fs';
const OUT = '/Users/atlas/astrocade-game4/receipts/candidates/player_girl_v2';
const body = fs.readFileSync(new URL('./body.js', import.meta.url), 'utf8');
const base = {
  cloak: 0x5c3423, rim: 0xc08a55, drapeR: 0.21, patch: 0xa0683f, tunic: 0x13807a, tunicDk: 0x0d5f5a, pants: 0x4e3a30,
  boot: 0x6b4128, cuff: 0xe0cfa8, cuffR: 0.08, scarf: 0xc8322a, scarfDk: 0x8e2019, pack: 0xc9ad7c, packDk: 0x9c7f55,
  roll: 0x4f7d2e, capeR: 0.24, moonR: 0.047, hoodR: 0.19, hoodSY: 1.05, headS: 0.92, peak: null, hole: 0.85, rimT: 0.022,
  packY: 0.1, packW: 0.32, packH: 0.34, rollW: 0.46, rollTop: false, cupSide: 1, cupY: -0.04,
  scarfX: 0.05, tails: [[0.38, 1.1, 0.8, 0.1], [0.3, 0.55, 1.3, 0.09]],
  tufts: [[0.125, -0.04, 0.085, 0.35, 0, 0.09], [0.14, -0.1, 0.0, 0.6, 0.2, 0.08], [0.08, -0.14, -0.1, 0.4, 0.5, 0.08]],
  tip: null, peak: [[0, 0.62, -0.78], 0.26, 3], headS: 0.92, braids: null,
};
const C = {
  a: { ...base },
  b: { ...base, cloak: 0x553020, scarf: 0xe8a823, scarfDk: 0xb37a12, rollTop: true, rollW: 0.5, packY: 0.08, packH: 0.32,
       scarfX: -0.06, tails: [[0.42, -1.1, 0.7, 0.1]], peak: [[0, 0.92, -0.38], 0.24, 4], cupSide: -1, cupY: -0.06,
       tufts: [[0.125, -0.04, 0.085, 0.35, 0, 0.09], [0.14, -0.1, 0.0, 0.6, 0.2, 0.08]], braids: [1] },
  d: { ...base, cloak: 0x553020, scarf: 0xd03a2a, scarfDk: 0x8e2019, rollTop: true, rollW: 0.5, packY: 0.08, packH: 0.32,
       scarfX: -0.06, tails: [[0.42, -1.1, 0.7, 0.1], [0.3, -0.6, 1.2, 0.09]], peak: [[0, 0.9, -0.42], 0.13, 3], hole: 1.0, cupSide: -1, cupY: -0.06,
       tufts: [[0.125, -0.04, 0.085, 0.35, 0, 0.09], [0.14, -0.1, 0.0, 0.6, 0.2, 0.08]], braids: [1] },
  c: { ...base, rim: 0xe2cfa6, rimT: 0.03, scarf: 0xd2402a, rollTop: true, packY: 0.08, packH: 0.32, rollW: 0.48, tip: null, peak: null, headS: 1,
       braids: [1, -1], tufts: [[0.125, -0.04, 0.085, 0.35, 0, 0.09]] },
};
const notes = {
  d: 'B refined after the first pick: the peak cut from 0.24 to 0.13 and the face opening widened from 49 to 57 degrees so she reads as a hooded girl and not a gnome (and loses less height to the 1.45 m fit), scarf switched to red with a second tail, since red is the one hue the sand, cobbles, grass and sea never use.',
  a: 'reading A, "wayfarer in the wind": a long pointed liripipe hood that curls back, red scarf with two tails streaming off the left shoulder, bedroll slung UNDER a big two-tone pack, tin cup on the left.',
  b: 'reading B, "tall peak": an upright pointed hood, one long mustard scarf tail streaming right, a single braid over the left shoulder, bedroll wide on TOP of the pack as in the reference.',
  c: 'reading C, "colour block only": the round hood kept but with a thick cream rim and dark lining, twin braids over both shoulders, red scarf, bedroll on top. Tests whether colour alone fixes the read.',
};
const hex = (o) => JSON.stringify(o, (k, v) => (typeof v === 'number' && v > 0xffff ? '0x' + v.toString(16) : v)).replace(/"(0x[0-9a-f]+)"/g, '$1');
for (const [k, o] of Object.entries(C)) {
  const src = `// player_girl v2, ${notes[k]}\n// 1.45 m, front +Z. Jointed on g.userData.joints, each joint a Group AT its pivot with geometry offset inside.\n// Joints: hips spine head left/right Upper/Lower Arm and Leg, lantern (moonstone emissive), scarf (tails, pivot at the back of the neck).\n` +
    body.replace('export default function (THREE) {', `export default function (THREE) {\n  const O = ${hex(o)};`);
  fs.writeFileSync(`${OUT}/player_girl_v2_${k}.js`, src);
  fs.writeFileSync(`${OUT}/player_girl_v2_${k}.expect.json`, JSON.stringify({ height: 1.45, tolerance: 0.08 }) + '\n');
}
