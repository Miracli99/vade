const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.resolve(__dirname, "..");
const ASSETS = path.join(ROOT, "assets");
const APPLY = process.argv.includes("--apply");
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".json"]);
const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg"]);
const EXCLUDED = new Set([path.join(ASSETS, "vade-retro-logo.png")]);

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}

async function run() {
  const sources = walk(ASSETS).filter(
    (file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()) && !EXCLUDED.has(file),
  );
  const before = sources.reduce((sum, file) => sum + fs.statSync(file).size, 0);
  if (!APPLY) {
    console.log(`Dry run: ${sources.length} images, ${Math.round(before / 1024 / 1024)} MiB. Use --apply.`);
    return;
  }

  const replacements = new Map();
  let after = 0;
  for (const source of sources) {
    const target = source.replace(/\.(png|jpe?g)$/i, ".webp");
    const temporary = `${target}.tmp`;
    await sharp(source)
      .rotate()
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82, alphaQuality: 90, effort: 4 })
      .toFile(temporary);
    fs.renameSync(temporary, target);
    after += fs.statSync(target).size;
    replacements.set(path.relative(ROOT, source).replace(/\\/g, "/"), path.relative(ROOT, target).replace(/\\/g, "/"));
    fs.unlinkSync(source);
  }

  const codeFiles = walk(ROOT).filter((file) => {
    const relative = path.relative(ROOT, file);
    return !relative.startsWith("node_modules") && !relative.startsWith(".git") && !relative.startsWith("dist") && SOURCE_EXTENSIONS.has(path.extname(file));
  });
  for (const file of codeFiles) {
    let content = fs.readFileSync(file, "utf8");
    let changed = false;
    for (const [from, to] of replacements) {
      const fromBase = path.basename(from);
      if (!content.includes(fromBase)) continue;
      content = content.replaceAll(fromBase, path.basename(to));
      changed = true;
    }
    if (changed) fs.writeFileSync(file, content);
  }

  console.log(`Optimized ${sources.length} images: ${(before / 1024 / 1024).toFixed(1)} -> ${(after / 1024 / 1024).toFixed(1)} MiB (${Math.round((1 - after / before) * 100)}% smaller).`);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
