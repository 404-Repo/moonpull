# 404 jam podium: what we have to beat

Researched 2026-10-06. Sources: shallow clones in `src/`, live play on a 390x844 touch phone viewport (headful Chrome, GPU, CDP touch), frames and play logs in `bellkeeper/`, `farseek/`, `sundrift/`.
Tags: **[M]** = measured (in code with file:line, or read live from the game's own telemetry); **[I]** = inferred or estimated.
Caveats:
- The CEO judge pass (RANKING.md) put Bellkeeper 1st, SUNDRIFT 4th and Farseek 5th. This file treats the three as the podium, as the brief says.
- SUNDRIFT HEAD is 31d94de (Oct 3), which is after judging (the judged commit was 4d76a03). Bellkeeper (Sep 25) and Farseek (Sep 26) are as judged.
- Bellkeeper `docs/main.js` is byte-identical to `game/main.js` [M].

## 1. The Last Bellkeeper (cel-shaded 3rd-person puzzle adventure)

| Fact | Value |
|---|---|
| World | One vertical tree village. Radius about 46 m (diameter about 92 m), about 28 m tall, from well floor y -14 to top ledge y 13.6 [M] `bellhollow/world.js:117,422,484,566`. Target was "~90x90 m, ~30 m tall" `REDESIGN.md:36` |
| Areas | 8 code zones: terrace, loft, sails, pipes, ladders, skybridge, hollow, well [M] `world.js:1201-1210`. The HUD shows 3 names: Canopy Terrace / Windmill Branches / The Hollow [M] `main.js:55` |
| Player | Height 1.60 x 1.0845 scale, about 1.74 m; walk 1.65, run 5.8 m/s, accel 12 [M] `main.js:514`. Jump 6.1 m/s at g 19 (about 1 m apex) [M] `movement.js:16` |
| Objectives | About 35 distinct objective strings [I, tally of `quest.js:361-380`]. 13 base steps plus 3 windmill branches you can do in any order (6 / 5 / 4 steps), a 3-phase fight, a 2-bell finale and "Ring the morning bell with Mara". I reached 6 in order on the phone in 75 s [M, playlog] |
| NPCs | Mara is the only speaker: 10 lines. 4 silent villagers who react. About 50 caption strings in total [M] |
| Climax | Guardian boss at the bottom of the well: 3 phases. You dodge its sweeps (2 s telegraphs), catch its breath and feed the coloured vane. 3 lives [M] `guardian.js:24-36`. Then a 16 s crane-shot finale [M] `quest.js:62` |
| Assets | 14 shipped code builders (bh-*.js, hero, staff), plus a 6-file world kit and 10 render/FX modules. 0 GLBs; the build rejects them [M] `tools/build.mjs:2-3` |
| Perf (live) | 249-309 draws, 0.56-0.67 M tris, 71-73 fps on the phone viewport [M, __GAME__]. Logged peak is 345 draws / 736k tris [M] `evidence/gate-2026-09-25` |
| Audio | All Web Audio: a 48 s synthesized title score, a phase-driven boss score and an ambient soundscape [M] |
| Touch | Stick bottom-left, Jump, and a context button whose label changes ("Ring the morning bell", "Take the bell staff from Mara", "Catch the gust"). Touch always runs. Drag the screen to orbit yaw [M] `main.js:148,163` |
| Framing | Painted title, 3 illustrated prologue cards (7 s each), a 20 s 5-shot intro that moving skips, autosave every 12 s, and an ending card with "Keep exploring" [M] |
| Length | Design target 12-15 min first time [M] `REDESIGN.md:51-73`. 10-15 min [I] |

**Camera (exact)** [M] `main.js:28,418-421,267,443-451`:
- **Lens:** `PerspectiveCamera(42, aspect, 0.1, 400)`.
- **Angle:** pitch atan(0.48) = 25.6 deg down. Default yaw atan2(.615,.788) = 38 deg, which puts the view at the south-east.
- **Arm:** 10.8 m landscape, 11.5 m portrait (aspect < 0.85).
- **Focus:** hero + 1.0 m up, 0.8 m toward the camera, followed at exp rate 7. Pitch damps at 12 rising and 2.4 falling; the arm at 12 shortening and 2 lengthening.
- **Updraft:** pitch -0.07 and arm +2.6 while riding a column.
- **Collision:** first raises pitch to at most 0.96 rad, then shortens the arm to 6.5, then 2.5. A 7x3 ray fan auto-swings yaw away from clutter.
- **Player control:** yaw only (drag 0.006 rad/px, Q/E 0.13). No zoom and no pitch control.
- **Portrait:** `setViewOffset` shifts the view up 14%.
- **Boss:** arm 6.5 (6.2 portrait), pitch 0.3 (0.36).

**Feel on the phone** [I, frames 04-14]:
- The hero is about 1/8 of screen height, seen from above and behind. You see the plaza, the bell, Mara's workshop and the gate as one connected place.
- Every step is spoken by a person ("Mara: Morning round, apprentice..."), and each action visibly changes the world ("The gate swings open, laundry lifts, pinwheels turn").
- In tight corners by the gate the camera sometimes went into walls. Part of that is my bot's random orbit drags.

## 2. Farseek (Tomb-Raider-like platform puzzler, 4 worlds)

| Fact | Value |
|---|---|
| World | 4 playable levels joined by ring portals: Sunken Court (30x44 m ruin, heights -8 to 16) `court.js:1`; Checkpoint (about 32x70 m) `world-two.js:286`; Dawn Isles (17 isles about 200 m long) `isles.js:25-75`; Frozen Reach (20x162 m) `frozen.js:25-60`. Plus 2 worlds you only see, in the finale (forest castle, drowned city) [M] |
| Player | 1.75 m; run 5.6, walk 2.1; jump 7.4 at g 21 (reaches a 3 m ledge) [M] `hero.js:7-15`. Verbs: hang, climb, shimmy, vault, push/pull, turn mirror, throw disc, roll |
| Objectives | About 34 steps across 4 levels: L1 11, L2 about 8, L3 9, L4 5 [M per string lists, total I]. Puzzles: 3 stelae, 3 plates, 1 lamp, 6 pylons, 3 glyphs. 5 optional relics [M] `relics.js:9-70`. Live I reached step 3 of L1 in 60 s [M] |
| NPCs | 3 Wardens + 1 clerk (L2 only); 30 Warden barks + about 22 clerk lines. About 23 narration subtitles. 2 note sheets (9 diary days). Mira is present only through her notes [M] |
| Climax | No boss. You free the third glyph (3 disc strikes), then a 37 s flight through the ring to a castle and the sea city, then credits [M] `main.js:1080-1096` |
| Assets | 59 code asset modules + about 13 world builders [M] `game/assets/` |
| Perf (live) | 340-451 draws, 0.31-0.38 M tris, 70-73 fps [M, __GAME__] |
| Audio | Synth; one theme re-voiced per world [M] `sound.js:83-104` |
| Touch | Stick (inner 75% walks, and walking never steps off an edge), drag to look, Jump + Use. Hang, Throw and Roll appear only when they apply [M] `touch.js:7-156` |
| Framing | Loading bar with flavour text, a full menu (New/Levels/Relics/Settings/Controls/Credits), a 9.6 s intro cinematic, "Level N" cards, a finale and credits [M] |
| Length | 25-35 min [I] |

**Camera** [M] `main.js:90-95,1482`, `follow-camera.js:8-138`:
- **Lens:** fov 58, but in portrait it is min(80, 58+(1-aspect)·40), so about 80 at 390x844.
- **Ground framing:** arm 5.6, lift 1.55, base pitch 0.2 rad.
- **Mirror-turning framing:** arm 8.8, pitch +0.42.
- **Player control:** full user orbit. Auto-recenter only after 1.1 s without input.
- **Collision:** 4 probe rays; minimum 1.1 m.

**Feel on the phone** [I]:
- The hero is about 1/3 of screen height. The temple facade, the ring door and the statues fill the rest, so it reads as a real ruin at human scale.
- An on-screen waypoint diamond with metres ("2 m", "9 m") plus a parchment field-notes sheet give a clear goal.
- Weakness reproduced from the judge notes: against walls the camera collapses onto a close-up of the wall and the hero's arm (frames 08-15).

## 3. SUNDRIFT (night touge drift, endless road)

| Fact | Value |
|---|---|
| World | No fixed map. A seeded endless road streams in 120 m chunks (5 ahead, 2 behind) [M] `track.js:2`, `config.js:33-35`. 2 maps (Yozakura Pass, Neo Tokyo) x 2 difficulties = 4 courses. Roadside set pieces repeat (busstop, tunnel, conbini, vista, shrine, hut) [M] |
| Vehicle | 1240 kg, 9600 N, terminal about 190 km/h, boost to 245; 0-100 in 5.0 s [M] `car.js:15-62`. Car is about 1.72x4.45 m at scale 0.62 |
| Objective | One goal: drive from 17:18 until 06:00. The clock advances +1 min per 280 drift points and +1 h per 10 km, and reaches dawn on its own after at most 15 real minutes [M] `config.js:79-82`. Live: 17:21 to 20:22 in 200 s, score 2455 [M, frames] |
| NPCs | No traffic and no dialogue. Parked cars, billboard people and a train in the city [M] |
| Climax | "SUNRISE!", then the DAWN results card, then Keep driving / New run / Share [M] `main.js:1368-1376` |
| Assets | 33 asset modules + about 12 city prop builders + landmarks [M] |
| Perf | 455-590 draws, 0.72-1.04 M tris (NOTES gate) [M, author log]; 73 fps live [M] |
| Audio | Synth engine in an AudioWorklet; 2 procedural songs; drift arpeggio [M] |
| Touch | Left half: hold = gas, slide = steer, pull down = brake. Right: big HANDBRAKE [M] `input.js:142-209` |
| Length | 4.5-13 min per run, 4 courses [M+I] |

**Camera** [M] `config.js:40-45`, `camera.js:80-146`:
- **Chase:** distance 3.55 m (plus speed, boost and slide terms) x portrait factor 1+0.55(1-aspect), so about 4.6 m on a phone. Height 1.28 m. Look-at 3 m ahead and 0.6 m up.
- **FOV:** 58, rising by +6 with speed and +10 under boost.
- **Player control:** mouse orbit and wheel zoom on desktop only.

**Feel on the phone** [I]:
- The car is about 40% of screen width. The road, the sunset-to-night sky and the HUD (score, combo, clock) tell you the goal at a glance.
- Leaving the road is never fatal: a magnet carries the car back (seen live, frames 06, 09).

## Why they won

1. **One authored, named place you learn.** Bellkeeper builds a single vertical village with 8 zones, each with a job (bell plaza, gate, loft, 3 windmills, sky bridge, hollow, well) [M]. Farseek gives each of its 4 levels a distinct biome and a puzzle idea [M]. SUNDRIFT is the exception: its sense of place comes from a strong art direction (cel cars, sakura, CRT frame), not from authored geography [I].
2. **A goal on screen at every moment.** All three show it:
   - Bellkeeper: an objective line plus a person telling you why.
   - Farseek: an objective, a sub-step and a waypoint with metres.
   - SUNDRIFT: a clock racing toward 06:00 [M].
3. **A journey with an ending.** Bellkeeper goes from the bell, through the windmills, down the well to the guardian, back to the bells and ends with Mara. Farseek goes through 4 worlds to the finale flight and credits. SUNDRIFT runs dusk to dawn to a results card. All three have a title, an intro and an end card [M].
4. **Nuance in the verbs.**
   - Bellkeeper's wind is a tool (catch, give, push, ride), and every use changes the place you can see.
   - Farseek has light-relay puzzles and climbing.
   - SUNDRIFT's drift points move the sun [M].
5. **Forgiving on a phone.**
   - Bellkeeper has a context button and knock-back instead of death.
   - Farseek's walk zone never steps off an edge.
   - SUNDRIFT has the magnet [M].
6. **Craft with no external files.** All three run on code-built meshes and synth audio and hold about 72 fps on the phone [M].

## Bar to beat (minimums for a challenger)

| Metric | Bar | From |
|---|---|---|
| Authored zones | >= 8 named, each with a job | BK 8 [M] |
| Walkable footprint | >= 90 m across, plus vertical layers (>= 25 m) | BK [M] |
| Objective steps | >= 35 distinct, with at least 1 branch you can do in any order | BK ~35, FS ~34 [I] |
| Speaking NPC | >= 1 named guide with >= 10 lines | BK [M] |
| Climax | Telegraphed set piece (>= 3 phases) + finale shot + end card | BK [M] |
| Code asset modules | >= 15 bespoke (FS 59, SD 33) | [M] |
| First-play length | >= 12 min | BK target, FS 25+ [I] |
| Intro | Title + story cards + skippable in-engine intro | all [M] |
| Camera | Above-and-behind, 25-30 deg pitch, arm about 11 m, fov 42 portrait; yaw drag; collision that never ends on a wall close-up | BK [M]; FS failure [M] |
| Hero on screen | 1/8 (BK) to 1/3 (FS) of height | [I] |
| Phone perf | >= 60 fps, <= 450 draws, <= 0.75 M tris | all [M] |
| Touch | Stick + Jump + one context button labelled with the verb | BK [M] |
| Goal readout | Objective line + world marker or chart, always visible | all [M] |
| Audio | Title theme + ambient bed + climax music, all synth | BK [M] |

**What would change this** [I]:
- A full human first-play time for any of the three. No timed run exists; the Bellkeeper target is marked UNVERIFIED in its own ACCEPTANCE.md.
- I did not reach Bellkeeper's windmills or boss, or Farseek past L1 step 3, so those were judged from code only.
