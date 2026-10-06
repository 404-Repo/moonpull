// Named places, announced as you arrive, the way a storybook turns a page.
const ZONES = [
  { n: 'Gullwick Harbour', s: 'where the sea forgot its way home', x: -150, z: 50, r: 30 },
  { n: 'The Causeway', s: 'a road the sea keeps for itself', x: -112, z: 0, r: 12 },
  { n: 'Well Islet', s: 'the drowned well', x: -100, z: -40, r: 11 },
  { n: 'The Sand Bar', s: 'only the lowest tide gives it back', x: -52, z: 3, r: 14 },
  { n: 'The Shellflats', s: 'a bay that is only a bay sometimes', x: 15, z: -30, r: 25 },
  { n: 'The Marguerite', s: 'fifty years on her side', x: 46, z: -46, r: 16 },
  { n: 'Gull Head', s: 'the landing under the cliffs', x: 101, z: -6, r: 12 },
  { n: 'The Needles', s: 'arches over, reefs under', x: 138, z: -60, r: 22 },
  { n: 'The Stack', s: 'the old light', x: 206, z: -22, r: 16 },
  { n: 'The Basin', s: 'where the Undertow waits', x: 220, z: -50, r: 12 },
];
export function initZones(player) {
  const el = document.getElementById('zone'); let shown = new Set(), t = 0, cur = null;
  return (dt) => {
    t -= dt; if (t <= 0) el.classList.remove('on');
    for (const z of ZONES) {
      if (shown.has(z.n)) continue;
      if (Math.hypot(player.pos.x - z.x, player.pos.z - z.z) < z.r) {
        shown.add(z.n); cur = z; el.querySelector('.zn').textContent = z.n; el.querySelector('.zs').textContent = z.s; el.classList.add('on'); t = 3.5; break;
      }
    }
    return shown.size;
  };
}
export const ZONE_COUNT = ZONES.length;
