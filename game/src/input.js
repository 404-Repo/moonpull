// Input: a floating left stick, the tide dial under the right thumb, one context button, and
// a drag anywhere else to swing the camera. Keyboard and mouse on desktop. All real events.
export const input = {
  move: { x: 0, y: 0 },        // stick or keys, y forward
  run: false,
  tide: 0,                     // -1..1 from keys or wheel (rate), when not dragging the dial
  dialHeld: false, dialValue: 0, // dial: absolute -1..1 position while held
  look: { dx: 0, dy: 0 },      // accumulated camera drag in pixels
  act: false,                  // edge-triggered
  any: false,
};

const keys = new Set();
const touchDev = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
if (touchDev) document.body.classList.add('touchdev');

export function initInput(canvas) {
  addEventListener('keydown', (e) => {
    if (e.repeat) return;
    keys.add(e.code); input.any = true;
    if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyF') { input.act = true; e.preventDefault(); }
  });
  addEventListener('keyup', (e) => keys.delete(e.code));
  addEventListener('blur', () => keys.clear());

  // --- stick: floats to wherever the left thumb lands inside its zone --------------------
  const zone = document.getElementById('stickzone'), stick = document.getElementById('stick'), nub = document.getElementById('nub');
  let sId = null, sx = 0, sy = 0, home = null;
  const R = 52;
  const sDown = (e) => {
    if (sId !== null) return;
    sId = e.pointerId; zone.setPointerCapture(e.pointerId);
    const zr = zone.getBoundingClientRect(), r = stick.getBoundingClientRect();
    home = home || { left: stick.style.left, bottom: stick.style.bottom };
    const inStick = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if (!inStick) { stick.style.left = (e.clientX - zr.left - r.width / 2) + 'px'; stick.style.bottom = (zr.bottom - e.clientY - r.height / 2) + 'px'; sx = e.clientX; sy = e.clientY; }
    else { sx = r.left + r.width / 2; sy = r.top + r.height / 2; }
    sMove(e); input.any = true; e.preventDefault();
  };
  const sMove = (e) => {
    if (e.pointerId !== sId) return;
    let dx = e.clientX - sx, dy = e.clientY - sy; const l = Math.hypot(dx, dy);
    if (l > R) { dx *= R / l; dy *= R / l; }
    nub.style.transform = `translate(${dx}px,${dy}px)`;
    const m = Math.min(1, l / R);
    input.move.x = (dx / R); input.move.y = (-dy / R);
    input.run = m > 0.92;
  };
  const sUp = (e) => {
    if (e.pointerId !== sId) return;
    sId = null; input.move.x = 0; input.move.y = 0; input.run = false; nub.style.transform = '';
    if (home) { stick.style.left = home.left; stick.style.bottom = home.bottom; }
  };
  zone.addEventListener('pointerdown', sDown); zone.addEventListener('pointermove', sMove);
  zone.addEventListener('pointerup', sUp); zone.addEventListener('pointercancel', sUp);

  // --- the tide dial ------------------------------------------------------------------
  const dial = document.getElementById('tide'), track = document.getElementById('tidetrack');
  let dId = null;
  const dialAt = (e) => {
    const r = track.getBoundingClientRect();
    const t = 1 - (e.clientY - r.top) / r.height;      // 0 bottom .. 1 top
    input.dialValue = Math.max(-1, Math.min(1, t * 2 - 1));
  };
  dial.addEventListener('pointerdown', (e) => { dId = e.pointerId; dial.setPointerCapture(e.pointerId); input.dialHeld = true; dialAt(e); input.any = true; e.preventDefault(); });
  dial.addEventListener('pointermove', (e) => { if (e.pointerId === dId) dialAt(e); });
  const dUp = (e) => { if (e.pointerId === dId) { dId = null; input.dialHeld = false; } };
  dial.addEventListener('pointerup', dUp); dial.addEventListener('pointercancel', dUp);

  // --- context button -------------------------------------------------------------------
  const act = document.getElementById('act');
  act.addEventListener('pointerdown', (e) => { input.act = true; input.any = true; e.preventDefault(); e.stopPropagation(); });

  // --- look: drag on the canvas -----------------------------------------------------------
  let lId = null, lx = 0, ly = 0;
  canvas.addEventListener('pointerdown', (e) => { if (lId !== null) return; lId = e.pointerId; lx = e.clientX; ly = e.clientY; canvas.setPointerCapture(e.pointerId); input.any = true; });
  canvas.addEventListener('pointermove', (e) => { if (e.pointerId !== lId) return; input.look.dx += e.clientX - lx; input.look.dy += e.clientY - ly; lx = e.clientX; ly = e.clientY; });
  const lUp = (e) => { if (e.pointerId === lId) lId = null; };
  canvas.addEventListener('pointerup', lUp); canvas.addEventListener('pointercancel', lUp);
  addEventListener('wheel', (e) => { input.wheel = (input.wheel || 0) + Math.sign(e.deltaY); }, { passive: true });
}

export function pollKeys() {
  const k = (c) => keys.has(c);
  let x = (k('KeyD') || k('ArrowRight') ? 1 : 0) - (k('KeyA') || k('ArrowLeft') ? 1 : 0);
  let y = (k('KeyW') || k('ArrowUp') ? 1 : 0) - (k('KeyS') || k('ArrowDown') ? 1 : 0);
  const keyed = x !== 0 || y !== 0;
  if (keyed) { const l = Math.hypot(x, y); input.move.x = x / l; input.move.y = y / l; input.run = k('ShiftLeft') || k('ShiftRight'); input._keyed = true; }
  else if (input._keyed) { input.move.x = 0; input.move.y = 0; input.run = false; input._keyed = false; }
  let t = (k('KeyE') || k('PageUp') ? 1 : 0) - (k('KeyQ') || k('PageDown') ? 1 : 0);
  if (input.wheel) { t -= Math.sign(input.wheel) * 3; input.wheel = 0; }
  input.tide = t;
}
export const isTouch = touchDev;
