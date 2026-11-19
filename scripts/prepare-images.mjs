// Crops the client's original photos (src/assets/originals, downloaded from the client's site)
// into the frames used on the homepage (src/assets/photos). Run once: `node scripts/prepare-images.mjs`.
// Astro <Picture> then produces AVIF/WebP + srcset from these crops at build time.
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = (f) => path.join(root, "src/assets/originals", f);
const out = (f) => path.join(root, "src/assets/photos", f);

/** [output, original, left, top, width, height] in original pixels */
const crops = [
  ["hero-wide.jpg", "JD9A7200-2--scaled.jpg", 0, 190, 1707, 1138],
  ["hero-tall.jpg", "JD9A7200-2--scaled.jpg", 0, 120, 1707, 2134],
  // Plastic surgery: a different real photo (client alt: «Світлана Работенко підвищила кваліфікацію з ендоскопії обличчя у Стамбулі»),
  // so the index does not repeat the hero scene. Original: 2026/07/Istanbul.International-Facial-Endoscopy-Course-…jpg
  ["dir-plastic.jpg", "endoface-istanbul.jpg", 105, 0, 960, 1200],
  ["dir-dental.jpg", "IMG_0227_1-scaled.jpg", 0, 220, 1707, 2134],
  ["dir-laser.jpg", "IY7A9353_1-scaled.jpg", 0, 260, 1707, 2134],
  ["dir-medcos.jpg", "IY7A9788_1-scaled.jpg", 330, 720, 1300, 1625],
  ["dir-gyn.jpg", "IMG_5818-scaled.jpg", 0, 60, 1920, 2400],
  ["dir-doctors.jpg", "MG_7062-scaled.jpg", 560, 0, 1366, 1707],
  ["doctors.jpg", "JD9A7781-1--scaled.jpg", 0, 180, 1707, 2134],
];

for (const [name, file, left, top, width, height] of crops) {
  await sharp(src(file)).rotate().extract({ left, top, width, height })
    .modulate({ saturation: 0.97 }).jpeg({ quality: 88, mozjpeg: true }).toFile(out(name));
  console.log("ok", name, `${width}x${height}`);
}
await sharp(src("MG_5958-1.png")).png().toFile(out("eq-microscope.png"));
await sharp(src("Group-48096086-1.jpg")).jpeg({ quality: 90 }).toFile(out("eq-fotona.jpg"));
await sharp(src("choose.webp")).png().toFile(out("award.png"));
console.log("done");
