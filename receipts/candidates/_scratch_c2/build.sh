#!/bin/bash
# build.sh <slug> <letter> <seed> : header comments + kit + [src/<slug>_common.js] + src/<slug>_<letter>.js + tail
cd "$(dirname "$0")"
s=$1; l=$2; seed=${3:-17}; out=../$s/${s}_$l.js
{ grep '^//' src/${s}_$l.js ; echo 'export default function (THREE) {'; sed "s/SEED/$seed/" src/kit.js; [ -f src/${s}_common.js ] && grep -v '^//' src/${s}_common.js; grep -v '^//' src/${s}_$l.js; cat src/tail.js; } > $out
node --check $out && echo "built $out"
