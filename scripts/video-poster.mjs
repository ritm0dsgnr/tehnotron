import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const video = resolve(root, process.argv[2] || "public/video/hero.mp4");
const out = resolve(root, process.argv[3] || "public/img/40.png");
const seek = process.argv[4] || "00:00:01";

let ffmpeg = "ffmpeg";
try {
  const py = execFileSync(
    "python",
    ["-c", "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())"],
    { encoding: "utf8" },
  ).trim();
  if (py) ffmpeg = py;
} catch {
  /* use PATH ffmpeg */
}

mkdirSync(dirname(out), { recursive: true });

const result = spawnSync(
  ffmpeg,
  ["-y", "-ss", seek, "-i", video, "-frames:v", "1", "-update", "1", out],
  { stdio: "inherit" },
);

if (result.status !== 0) {
  console.error("video-poster: ffmpeg failed");
  process.exit(result.status || 1);
}

console.log(`video-poster: ${video} @ ${seek} -> ${out}`);
