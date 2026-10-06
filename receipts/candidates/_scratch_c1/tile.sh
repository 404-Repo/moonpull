#!/bin/bash
# tile.sh <candidate.js> <len> : writes tile/<name>_x3.js placing three copies end to end along X
f=$1; L=$2; b=$(basename "$f" .js)
sed 's/^export default function (THREE) {/function one(THREE) {/' "$f" > tile/${b}_x3.js
cat >> tile/${b}_x3.js <<EOT
export default function (THREE) { const g = new THREE.Group(); for (const k of [-1, 0, 1]) { const o = one(THREE); o.position.x = k * $L; g.add(o); } return g; }
EOT
