# MOONPULL (working title)

> A tide in your hand. You carry the fallen moon's pull in a lantern and move the whole sea up and
> down to cross a coast, wake a dark lighthouse and face what took the light.

## The pitch in one frame

`ref/concept/c1_tide_village.png` (low tide) next to `ref/concept/c2_harbour_high.png` (high tide):
the same cove, the same causeway, two different places. The sea level is the one variable the
player owns, and every authored place is built so that both states are worth seeing.

## The verb, and why it is new in this field

- Hold the PULL (right thumb drags a tide dial up or down; keys Q/E or mouse wheel) and the sea
  level of the whole coast rises or falls, up to a limited range around its rest level.
- Let go and the sea drifts back toward rest. "The sea always wants to come home." That gives
  every crossing a clock the player set themselves.
- Whatever floats (rafts, boats, crates, the boss's boat shell) rides the surface; whatever is
  heavy stays put. Deep water blocks you; shallow water slows you; dry seabed opens new routes.
- Lock gates hold water: raise the sea, shut a gate, lower the sea, and that basin keeps its
  level. That turns one global dial into stepped, local puzzles (the sea caves).
- Creatures care about the waterline: shore crabs swarm the sand at low tide and flee rising
  water, so the tide is also how you clear a path.

No entry in jam 001 used water level as the player's tool (field read from RANKING.md and the
25 entry files). Bellkeeper carries wind, Farseek steers sunlight, Sundrift trades drifts for
time of day. A global, physical, visible state the player holds in one thumb is the same class
of idea that won, without copying any of them.

## The journey (four authored places along one coast, about 420 x 160 m)

| # | place | what the tide does there | leaves with |
|---|---|---|---|
| 1 | Gullwick Harbour: stilt village on terraces, boathouse, causeway to a well islet | lower to walk the causeway; raise to float a stranded boat and lift the well bucket-raft | the Pull, first moon shard |
| 2 | The Shellflats: kilometre-feel sand flats, tide pools, the wreck of the Marguerite | drain the bay to walk the seabed; push crabs back with rising water; float a hull section into a ramp | the lighthouse lens |
| 3 | Gull Head sea caves: flooded shafts with lock gates and a raft | raise, shut gate, lower, repeat: climb a 15 m shaft by locks | second shard, the keeper's journal, clifftop path |
| 4 | The Stack: lighthouse on a sea stack, a tidal basin arena | stepping stones at low tide; the boss | the light, the moon, the ending |

Boss: the Undertow, a giant hermit crab wearing an overturned fishing boat as its shell. No
weapon: strand it at low tide, float its shell off at high tide, three times, with its attacks
tied to the waterline.

People: Nell the old tidekeeper (gives the Pull, frames the story), Tam the fisherman whose boat
is stranded (harbour side quest that opens the flats), and the keeper's voice in his journal.

Target length: 15 to 25 minutes for a first play, about 16 objective steps, one boss.

## Camera and scale

Human scale, a third-person follow camera modelled on Bellkeeper's (exact params from the
measured winners research, `research/winners/WINNERS.md`): the character is small in the lower
middle of the frame, the place fills the rest, the horizon and the lighthouse are visible most of
the time as the journey's goal. Drag on empty screen to orbit on phone.

## Phone-first controls

- Left thumb: floating stick (walk; push to the rim to run).
- Right thumb: the tide dial (vertical drag on a lantern-shaped control; shows the sea level and
  how far it can go here), and one context button (talk, grab, shut gate, climb).
- Desktop: WASD/arrows, Shift run, Q/E or wheel for tide, Space context, mouse drag orbit.

## Why this concept over the others considered

| candidate | why not |
|---|---|
| Courier across a hill town (deliver letters, clues as addresses) | journey and NPCs are natural, but the verb is walking; nothing nobody else tried |
| Shadow-walker in a sun-baked town (move only through shade) | strong, but it leans on sunlight and time of day, the two lanes Farseek and Sundrift already own |
| Moonpull (this) | one new verb that reshapes an expansive, authored world at character scale; every area shows it; reads instantly in a single frame pair; phone controls are one stick and one dial |

## Risks, said early

- Water is most of many frames. If the water and the wet sand do not look made, the game does
  not look made (GAME.md's "the ground is most of the screen" trap, transposed). Shoreline foam
  and wet-sand darkening from the heightfield are first-pass work, not polish.
- A global sea level means every area must be authored for both states; content cost is real.
- The boss is the riskiest system; it is scheduled after the four places exist.
