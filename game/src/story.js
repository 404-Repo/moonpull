// One objective at a time. A step either waits for something to become true (check) or for the
// player to use something (use + onUse). Steps can say things when they start and end.
import { hud } from './hud.js';

export class Story {
  constructor(world) { this.world = world; this.steps = []; this.i = -1; this.done = false; this.count = 0; }
  step(s) { this.steps.push(s); return s; }
  begin(i = 0) { this.i = i - 1; this.advance(); }
  advance() {
    const prev = this.steps[this.i];
    if (prev) { if (prev._u) prev._u.done = true; if (prev.leave) prev.leave(); this.count++; }
    this.i++;
    const s = this.steps[this.i];
    if (!s) { this.done = true; if (this.onDone) this.onDone(); return; }
    hud.objective(s.place, s.text);
    if (s.enter) s.enter();
    if (s.use) {
      s._u = this.world.usable({ ...s.use, use: () => { s._u.busy = true; s.onUse(() => this.advance()); } });
    }
  }
  update() {
    const s = this.steps[this.i];
    if (!s) return;
    if (s.check && s.check()) this.advance();
  }
  get current() { return this.steps[this.i]; }
}
