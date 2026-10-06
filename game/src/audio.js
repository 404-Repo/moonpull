// Sound, synthesised: the sea's wash (louder at the waterline and when it moves), gulls, the
// lantern's chime. No files.
let ctx = null, master = null, wash = null, washGain = null, swellGain = null, swellOsc = null;

export function initAudio() {
  if (ctx) { ctx.resume(); return; }
  try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { return; }
  master = ctx.createGain(); master.gain.value = 0.8; master.connect(ctx.destination);
  // brown noise through a breathing low-pass = surf
  const len = ctx.sampleRate * 4, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
  let last = 0; for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 3.2; }
  wash = ctx.createBufferSource(); wash.buffer = buf; wash.loop = true;
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700;
  washGain = ctx.createGain(); washGain.gain.value = 0.0;
  wash.connect(lp); lp.connect(washGain); washGain.connect(master); wash.start();
  sfx._lp = lp;
  // the swell when the sea moves
  swellOsc = ctx.createBufferSource(); swellOsc.buffer = buf; swellOsc.loop = true; swellOsc.playbackRate.value = 0.5;
  const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 180; bp.Q.value = 0.7;
  swellGain = ctx.createGain(); swellGain.gain.value = 0; swellOsc.connect(bp); bp.connect(swellGain); swellGain.connect(master); swellOsc.start();
  sfx._bp = bp;
}

function tone(freq, t0, dur, type = 'sine', vol = 0.18) {
  if (!ctx) return;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.015); g.gain.exponentialRampToValueAtTime(0.0008, t0 + dur);
  o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + dur + 0.05);
}

let gullT = 3;
export const sfx = {
  chime() { if (!ctx) return; const t = ctx.currentTime; [784, 988, 1319].forEach((f, i) => tone(f, t + i * 0.09, 1.6, 'sine', 0.12)); },
  shard() { if (!ctx) return; const t = ctx.currentTime; [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, t + i * 0.11, 2.4, 'triangle', 0.09)); },
  splash() { if (!ctx) return; const t = ctx.currentTime; tone(140, t, 0.6, 'sine', 0.2); },
  step() {},
  gull() {
    if (!ctx) return; const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sawtooth'; const f = 900 + Math.random() * 500;
    o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 1.6, t + 0.08); o.frequency.exponentialRampToValueAtTime(f * 0.7, t + 0.35);
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1800; bp.Q.value = 3;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.035, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0005, t + 0.4);
    o.connect(bp); bp.connect(g); g.connect(master); o.start(t); o.stop(t + 0.45);
  },
  update(dt, shoreDist, tideSpeed) {
    if (!ctx) return;
    const near = Math.max(0, 1 - shoreDist / 40);
    const breathe = 0.6 + 0.4 * Math.sin(ctx.currentTime * 0.55) * Math.sin(ctx.currentTime * 0.23 + 1);
    washGain.gain.setTargetAtTime(0.05 + near * 0.32 * breathe, ctx.currentTime, 0.3);
    sfx._lp.frequency.setTargetAtTime(400 + near * 900 * breathe, ctx.currentTime, 0.3);
    const sw = Math.min(1, Math.abs(tideSpeed) / 0.9);
    swellGain.gain.setTargetAtTime(sw * 0.5, ctx.currentTime, 0.15);
    sfx._bp.frequency.setTargetAtTime(tideSpeed > 0 ? 220 + sw * 120 : 160 - sw * 50, ctx.currentTime, 0.2);
    gullT -= dt; if (gullT < 0) { gullT = 4 + Math.random() * 9; sfx.gull(); if (Math.random() < 0.5) setTimeout(() => sfx.gull(), 220); }
  },
};

// Music: short scored pieces (Atlas, MiniMax Music) played with breathing room between plays,
// so a 20 s cue does not loop into wallpaper. One cue per place; crossfade on change.
const cues = {};
let current = null, gapT = 0;
function cue(name) {
  if (!cues[name]) { const a = new Audio(`./audio/${name}.mp3`); a.preload = 'auto'; a.volume = 0; cues[name] = a; }
  return cues[name];
}
export const music = {
  want: null, vol: 0.42, gap: 14, have: new Set(['harbour', 'flats', 'boss', 'finale']),
  play(name, gap = 14) { if (!this.have.has(name)) return; if (this.want === name) return; this.want = name; this.gap = gap; gapT = 0; },
  update(dt) {
    for (const [n, a] of Object.entries(cues)) {
      const target = n === this.want && !a.paused ? this.vol : 0;
      a.volume = Math.max(0, Math.min(1, a.volume + Math.sign(target - a.volume) * Math.min(Math.abs(target - a.volume), dt * 0.35)));
      if (n !== this.want && a.volume <= 0.001 && !a.paused) a.pause();
    }
    if (!this.want) return;
    const a = cue(this.want);
    if (a.paused || a.ended) {
      gapT -= dt;
      if (gapT <= 0) { a.currentTime = 0; a.volume = Math.max(a.volume, 0.01); a.play().catch(() => {}); gapT = this.gap; }
    }
  },
};
