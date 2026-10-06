// Objective card, toasts, dialogue, the tide dial readout and the context button.
import { tide, dialPos } from './tide.js';
const $ = (id) => document.getElementById(id);

let toastT = 0, sayQ = null, sayDone = null, sayT = 0;
export const hud = {
  talking: false,
  objective(place, text) {
    $('objplace').textContent = place; $('objtext').textContent = text;
    const o = $('obj'); o.classList.add('flash'); setTimeout(() => o.classList.remove('flash'), 400);
  },
  toast(text, secs = 3.2) { const t = $('toast'); t.textContent = text; t.classList.add('on'); toastT = secs; },
  say(lines, done) {
    sayQ = lines.slice(); sayDone = done || null; hud.talking = true; next();
  },
  fade(on) { $('fade').classList.toggle('on', on); },
  update(dt, use) {
    if (toastT > 0) { toastT -= dt; if (toastT <= 0) $('toast').classList.remove('on'); }
    if (hud.talking) { sayT -= dt; if (sayT <= 0) next(); }
    // tide dial
    const tr = $('tidetrack'), h = tr.clientHeight;
    const span = 5.0; // metres shown: -2.5 .. +2.5
    const toPx = (lv) => Math.max(0, Math.min(h, (lv + span / 2) / span * h));
    $('tidelevel').style.height = toPx(tide.level) + 'px';
    $('tiderest').style.bottom = toPx(tide.rest) + 'px';
    $('tiderange').style.bottom = toPx(tide.lo) + 'px'; $('tiderange').style.height = (toPx(tide.hi) - toPx(tide.lo)) + 'px';
    const knobY = 10 + (h - toPx(tide.level));
    $('tideknob').style.top = knobY + 'px';
    $('tide').classList.toggle('locked', tide.locked);
    const a = $('act');
    if (use && !hud.talking) { a.textContent = use.label; a.classList.add('on'); } else a.classList.remove('on');
  },
};
function next() {
  if (!sayQ || !sayQ.length) {
    $('say').classList.remove('on'); hud.talking = false; const d = sayDone; sayDone = null; sayQ = null;
    if (d) d(); return;
  }
  const [name, text] = sayQ.shift();
  $('sayname').textContent = name; $('saytext').textContent = text; $('say').classList.add('on');
  sayT = 2.2 + text.length * 0.055;
}
export function sayAdvance() { if (hud.talking) next(); }
$('say').addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); sayAdvance(); });
export function dialKnob() { return dialPos(); }
