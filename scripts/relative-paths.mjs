// GitHub Pages serves the demo from a sub-folder (https://<user>.github.io/<repo>/).
// Astro writes root-absolute asset URLs (/_astro/…); this one-page build rewrites them to relative ones
// so dist/ works from any folder. Runs after `astro build` (npm postbuild).
import fs from "node:fs";
import path from "node:path";

const dist = path.resolve(process.cwd(), "dist");
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
let changed = 0;
for (const file of walk(dist)) {
  const ext = path.extname(file);
  if (![".html", ".css", ".js"].includes(ext)) continue;
  const src = fs.readFileSync(file, "utf8");
  const depth = path.relative(dist, path.dirname(file)).split(path.sep).filter(Boolean).length;
  let out;
  if (ext === ".html") {
    const prefix = depth ? "../".repeat(depth) : "./";
    out = src.replace(/(?<=[\s"'(,=])\/(_astro\/|favicon\.svg)/g, `${prefix}$1`);
  } else {
    // CSS/JS live in dist/_astro: sibling assets are referenced relative to that folder.
    out = src.replace(/(?<=[\s"'(,=])\/_astro\//g, "./");
  }
  if (out !== src) { fs.writeFileSync(file, out); changed++; }
}
console.log(`relative-paths: ${changed} file(s) rewritten`);
