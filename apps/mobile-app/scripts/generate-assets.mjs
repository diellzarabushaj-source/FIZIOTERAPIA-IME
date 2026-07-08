import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const source = path.join(root, "assets", "source");
const generated = path.join(root, "assets", "generated");

await fs.mkdir(generated, { recursive: true });

const jobs = [
  {
    input: "app-icon.svg",
    output: "app-icon.png",
    width: 1024,
    height: 1024,
  },
  {
    input: "adaptive-icon-foreground.svg",
    output: "adaptive-icon-foreground.png",
    width: 1024,
    height: 1024,
  },
  {
    input: "splash.svg",
    output: "splash.png",
    width: 1242,
    height: 2688,
  },
];

for (const job of jobs) {
  const inputPath = path.join(source, job.input);
  const outputPath = path.join(generated, job.output);
  await sharp(inputPath)
    .resize(job.width, job.height, { fit: "cover" })
    .png({ compressionLevel: 9 })
    .toFile(outputPath);
  console.log(`Generated ${path.relative(root, outputPath)}`);
}

console.log("Mobile store assets generated successfully.");
