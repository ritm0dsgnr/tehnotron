import { mkdir, readdir, rename, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMG_DIR = path.resolve(__dirname, "../public/img");
const SVG_DIR = path.resolve(__dirname, "../public/svg");
const PHOTO_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif"]);
const SVG_EXTS = new Set([".svg"]);

const isNumbered = (name) => /^\d{2}\.[a-z0-9]+$/i.test(name);
const keepPhoto = (name) => isNumbered(name);
const keepSvg = (name) => /^[a-z0-9][a-z0-9_-]*\.svg$/i.test(name);

async function listFiles(dir, exts) {
  await mkdir(dir, { recursive: true });
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (entry.name.startsWith(".") || entry.name.startsWith("_")) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (!exts.has(ext)) continue;
    const full = path.join(dir, entry.name);
    const info = await stat(full);
    files.push({ name: entry.name, full, mtime: info.mtimeMs, ext });
  }
  files.sort((a, b) => a.mtime - b.mtime || a.name.localeCompare(b.name));
  return files;
}

async function numberPhotos() {
  const files = await listFiles(IMG_DIR, PHOTO_EXTS);
  const used = new Set(files.map((f) => f.name.toLowerCase()));
  let next = 1;
  for (const file of files) {
    if (!isNumbered(file.name)) continue;
    const n = Number(file.name.slice(0, 2));
    if (Number.isFinite(n) && n >= next) next = n + 1;
  }

  let changed = 0;
  for (const file of files) {
    if (keepPhoto(file.name)) continue;
    while (used.has(`${String(next).padStart(2, "0")}${file.ext}`.toLowerCase())) next += 1;
    const target = `${String(next).padStart(2, "0")}${file.ext}`;
    next += 1;
    await rename(file.full, path.join(IMG_DIR, target));
    used.delete(file.name.toLowerCase());
    used.add(target.toLowerCase());
    console.log(`[img] ${file.name} -> ${target}`);
    changed += 1;
  }
  return changed;
}

async function moveLooseSvg() {
  const loose = await listFiles(IMG_DIR, SVG_EXTS);
  let changed = 0;
  for (const file of loose) {
    const destDir = SVG_DIR;
    await mkdir(destDir, { recursive: true });
    let target = file.name;
    if (!keepSvg(file.name)) {
      const base = path
        .basename(file.name, file.ext)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "icon";
      target = `${base}.svg`;
    }
    let dest = path.join(destDir, target);
    let i = 2;
    while (await exists(dest)) {
      dest = path.join(destDir, `${path.basename(target, ".svg")}-${i}.svg`);
      i += 1;
    }
    await rename(file.full, dest);
    console.log(`[svg] img/${file.name} -> svg/${path.basename(dest)}`);
    changed += 1;
  }
  return changed;
}

async function exists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

async function tidySvgNames() {
  const files = await listFiles(SVG_DIR, SVG_EXTS);
  let changed = 0;
  for (const file of files) {
    if (keepSvg(file.name)) continue;
    const base = path
      .basename(file.name, file.ext)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "icon";
    let target = `${base}.svg`;
    let dest = path.join(SVG_DIR, target);
    let i = 2;
    while ((await exists(dest)) && path.basename(dest) !== file.name) {
      target = `${base}-${i}.svg`;
      dest = path.join(SVG_DIR, target);
      i += 1;
    }
    if (path.basename(dest) === file.name) continue;
    await rename(file.full, dest);
    console.log(`[svg] ${file.name} -> ${path.basename(dest)}`);
    changed += 1;
  }
  return changed;
}

const a = await moveLooseSvg();
const b = await numberPhotos();
const c = await tidySvgNames();
if (!(a + b + c)) console.log("[assets] уже ок");
