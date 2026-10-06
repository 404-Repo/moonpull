# MOONPULL: the locked style

> Chunky hand-painted storybook coastal fishing village: weathered timber, whitewashed and
> ochre plaster, red clay tile and wet grey stone, built from soft bevelled solid shapes with
> slightly exaggerated proportions (thick posts, deep eaves, sagging ridgelines), flat matte
> colours with gentle roughness, no glyphs or printed text anywhere.

Reference frames: `ref/concept/c1_tide_village.png` (harbour, low tide), `c2_harbour_high.png`
(harbour, high tide), `c3_flats_wreck.png` (flats and wreck), `c4_seacave.png` (sea caves),
`c5_stack_boss.png` (stack and boss at dusk).

| role | hex | where it belongs |
|---|---|---|
| weathered timber | `0x7b5a3e` | posts, planks, boat hulls, stilts, crates |
| dark wet timber | `0x4a3426` | anything below the high-tide line, piles, pier legs |
| bleached driftwood | `0xb79773` | railings, rope posts tops, shutters, raft deck |
| roof clay red | `0xb5543a` | roof tiles, awnings, the boat hull stripe |
| warm plaster | `0xe9d6b8` | house walls (whitewash in sun) |
| ochre plaster | `0xc99a5c` | alternate house walls, chapel |
| wet stone grey | `0x6c6a64` | cobbles, quay walls, well, lighthouse base |
| cliff sandstone | `0xc6a888` | cliffs, sea stack, cave mouths |
| kelp green | `0x4f5a2c` | seaweed, moss on rocks, rope weed |
| barnacle cream | `0xd9cfb6` | barnacles, shells, foam accents |
| rope hemp | `0xa58a5c` | ropes, nets, lashings |
| iron dark | `0x3a3d40` | anchors, chains, lamp frames, hinges |
| moon glow | `0x9fd8ff` | moon-stone, the lantern, shrines (emissive) |
| warm window | `0xffb560` | lit windows, torches (emissive) |
| sea teal (deep) | `0x0e4854` | water body (shader, not assets) |

## Fixed decisions

- Metres. Player character 1.45 m tall (a young traveller). Adult NPC 1.75 m. Door 2.0 m tall,
  0.95 m wide. Stilt house: footprint 6 x 5 m, 7 to 9 m to the ridge including 2.5 m stilts.
  Fishing boat 7 m long, 2.4 m beam. Rowboat 3.6 m. Raft 2.6 x 2.6 m, 0.35 m thick. Crate 0.6 m.
  Barrel 0.9 m tall. Lobster pot 0.6 m. Rope post 1.1 m tall, 0.22 m across. Lamp post 3.2 m.
  Lighthouse 24 m tall. Shore crab 0.5 m across. The Undertow (boss) 9 m tall with its shell.
- Base at y = 0, centred on x and z, front faces +Z.
- Flat colours with sensible roughness (0.7 to 0.95; wet timber 0.55); surfaces are applied at
  load time.
- Material names from the contract's list (`plaster | stone | timber | tile | metal | fabric |
  foliage | ground`) on every material where one applies.
- Bevel or chamfer visible edges; no razor-thin boxes; nothing smaller than 4 cm.
- No glyphs, letters, numbers or logos on anything. Boat names and signs are carried as colour
  and shape only.
- Triangle budget per asset: props under 3,000; houses under 12,000; characters under 8,000;
  the boss under 20,000.
- Anything that moves (characters, crab, boss legs, lock gates, boat rudder) names its joints on
  `userData.joints`, each with its pivot at the joint.
