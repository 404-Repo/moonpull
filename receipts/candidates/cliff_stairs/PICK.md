# cliff_stairs: picked A (primitives), 4,768 tris, verify ok, 3.90 x 6.05 x 9.05 m, back flat by declaration
A won by eye: treads of two bevelled grey stone slabs with staggered joints on solid riser bodies, a paved landing (3 x 3 flags), both flanks built as courses of faceted sandstone boulders that step up with the flight (left flank stands 0.35 m above the treads, right flank about level), moss caps, and a timber handrail (8 posts, top rail and mid rail along the pitch) on the +x side. Closest to the ref's stepped block stairs on rock.
B (one extruded stepped profile with extruded rock walls, 2,344) is clean and cheap but the walls read as smooth sandstone ramps, not rock. C (treads on a lofted rock ridge, 2,662) has the ref's ridge reading but the loft facets are large shards and it is 5.4 m wide.

## Walk plan (measured, not just planned)
Measured by raycasting the built module after recentring (../_scratch_c2/measure_stairs.mjs, needs `three` resolvable; run from the scratchpad copy).
Rises toward -Z. Bottom step at the +Z end, top step at the -Z end.
- Bottom step: top at y = 0.25 m, front edge z = +4.48 (tread z +4.50 to +4.08).
- Flight 1: 9 steps, rise 0.25 m, tread 0.417 m, tops 0.25 to 2.25.
- Mid landing: y = 2.50 m, z +0.75 to -0.75 (1.5 m deep).
- Flight 2: 10 steps, rise 0.25 m, tread 0.375 m, tops 2.75 to 5.00.
- Top step: top at y = 5.00 m, z -4.12 to -4.50 (back edge z = -4.50). Top step ends flush at the back face, which mounts against the cliff top, hence `mounts: 'back'`.
- Measured tops match the plan to 0.003 m; a few rows read 0.017 m low only because the probe hit a bevelled nosing.
- Stair centreline x = 0.0 (bbox x -1.99 to +1.99). Clear walk: flank rocks at x <= -0.87 on the left at 0.15 m above tread; handrail inner face at x = +0.71; right flank rocks at x >= +0.97. So the clear walk is about 1.6 m between the left rocks and the rail.
- Overall height 6.05 m is the rail top over the top step (5.0 + 0.95 + post cap).
Known weakness: the back face is a flat 5 m wall (declared flush; rock courses only at its edges); flank boulders are still fairly uniform in size and read as a pattern from the side; no vegetation tufts in the joints like the ref.
