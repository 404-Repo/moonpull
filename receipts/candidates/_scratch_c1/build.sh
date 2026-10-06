#!/bin/bash
# assemble candidate modules: kit + extras + body. usage: build.sh [slug]
cd "$(dirname "$0")"
for f in src/${1:-*}_?.js; do
  b=$(basename "$f" .js); slug=${b%_?}
  out=../$slug/$b.js
  { head -3 "$f"; cat kit.js kit2.js; tail -n +4 "$f"; } > "$out"
  node --check "$out" || echo "SYNTAX FAIL $out"
done
