// The sea. One number the whole coast reads, which the player moves and which always wants to
// go home.
export const tide = {
  level: 0, target: 0, rest: 0,
  lo: -1.3, hi: 1.8,            // what the lantern can do right now (grows with moon shards)
  wet: 0.6,                     // the highest the sea has been lately
  holdT: 0,                     // seconds since the player last touched the sea
  locked: true,                 // no lantern yet
  speed: 0,                     // m/s, signed
  RELAX: 0.085,                 // m/s back toward rest once let go
  GRACE: 2.2,                   // seconds the sea waits before it starts home
  MOVE: 0.95,                   // m/s, the fastest the sea follows the lantern
};

export function updateTide(dt, input) {
  const t = tide;
  if (!t.locked) {
    if (input.dialHeld) {
      const v = input.dialValue;
      t.target = v >= 0 ? t.rest + v * (t.hi - t.rest) : t.rest + -v * (t.lo - t.rest);
      t.holdT = 0;
    } else if (input.tide) {
      t.target += input.tide * 1.4 * dt;
      t.target = Math.max(t.lo, Math.min(t.hi, t.target));
      t.holdT = 0;
    } else {
      t.holdT += dt;
      if (t.holdT > t.GRACE) {
        const d = t.rest - t.target;
        t.target += Math.sign(d) * Math.min(Math.abs(d), t.RELAX * dt);
      }
    }
  } else {
    t.target += (t.rest - t.target) * Math.min(1, dt * 0.5);
  }
  const d = t.target - t.level;
  const step = Math.sign(d) * Math.min(Math.abs(d), t.MOVE * dt * Math.min(1, 0.35 + Math.abs(d) * 1.2));
  t.level += step;
  t.speed = step / Math.max(dt, 1e-4);
  t.wet = Math.max(t.level + 0.05, t.wet - 0.018 * dt);
}

// where the dial knob sits, -1..1, for the HUD
export function dialPos() {
  const t = tide;
  return t.level >= t.rest ? (t.level - t.rest) / Math.max(0.01, t.hi - t.rest) : -(t.level - t.rest) / Math.min(-0.01, t.lo - t.rest);
}
