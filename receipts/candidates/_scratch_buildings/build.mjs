// usage: node build.mjs src/<slug>_<x>.src.js ...   -> writes ../<slug>/<slug>_<x>.js with the kit inlined
import fs from 'fs'; import path from 'path';
const here = path.dirname(new URL(import.meta.url).pathname);
const kit = fs.readFileSync(path.join(here, 'kit.js'), 'utf8');
for (const src of process.argv.slice(2)) {
  const base = path.basename(src).replace('.src.js', '');
  const slug = base.replace(/_[a-z]$/, '');
  const outDir = path.join(here, '..', slug); fs.mkdirSync(outDir, { recursive: true });
  const out = fs.readFileSync(src, 'utf8').replace('//@@KIT', kit);
  fs.writeFileSync(path.join(outDir, base + '.js'), out);
  console.log('built', path.join(outDir, base + '.js'));
}
