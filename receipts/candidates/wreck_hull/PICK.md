# wreck_hull: picked B (primitives, 16,458 tris, verify ok, 12.3 x 8.6 x 26.9 m incl. sand mound and bowsprit)

Orientation: STERN at local -Z (stern cabin end), BOW at +Z (bowsprit). Hull is ~22 m keel to stem
plus a 4 m bowsprit, heeled 25 degrees: high side +X (shows the exposed ribs), low side -X (deck faces
-X and up). It sits in a 0.75 m sand mound whose bottom is y = 0.

Stern cabin floor (for the game): centre at local (x, y, z) = (-0.748, 4.100, -9.937), also published on
g.userData.cabinFloor after recentring. The floor is LEVEL in world space (the cabin is built un-heeled
on the heeled hull). Walkable interior 3.2 m (X) x 2.8 m (Z). Doorway 1.0 m wide x 2.05 m tall in the
+Z wall, i.e. the door FACES +Z (towards the bow). Outside it a level landing at the same y = 4.1,
1.7 m wide, from z = -8.34 to -7.24, then three steps down towards the main deck.
Note: game/src/flats.js currently assumes cabinTop = 2.2; the asset's floor is 4.1 as briefed.

Why B: all three share the same hull lines, outfit (cabin, masts, snapped yard to the sand, bowsprit,
deck, ribs, barnacles, weed) and differ in how the planking is built. B lays every plank as its own box
on the hull surface with staggered butt joints, so the plank courses read at game distance the way they
do in the reference, and the broken edges around the rib gap are real plank ends with thickness.
A (one hand-built skin surface with clinker lips, inner skin and cap faces, 13,774) reads as a smooth
painted shell; C (LatheGeometry strake sectors, 13,506) has the nicest round belly and the most open rib
cage but its planking also reads smooth. B costs ~2.7k more tris and stays well under the 20k budget.
closeup_abc.png: A, B, C left to right, from the +X high side and from the -X deck side at the cabin.

Known weakness: the hull is one dark tone, so at distance the weed and barnacles are faint; the cabin
is a simpler box-and-gable than the reference's projecting cabin with brackets and dormer windows.
