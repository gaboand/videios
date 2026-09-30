// Generates a video with Google Veo through the Gemini API.
// Usage: node scripts/veo.mjs <prompt.txt> <output.mp4> [--fast] [--first img] [--last img]
// Requires GEMINI_API_KEY in the environment.
import { readFileSync, writeFileSync } from "node:fs";

const API = "https://generativelanguage.googleapis.com/v1beta";
const key = process.env.GEMINI_API_KEY;
if (!key) {
  console.error("Missing GEMINI_API_KEY.");
  process.exit(1);
}

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args[i + 1];
};
const [promptFile, output] = args;
const model = args.includes("--fast")
  ? "veo-3.1-fast-generate-preview"
  : "veo-3.1-generate-preview";

const image = (path) =>
  path && {
    bytesBase64Encoded: readFileSync(path).toString("base64"),
    mimeType: path.endsWith(".png") ? "image/png" : "image/jpeg",
  };

const instance = { prompt: readFileSync(promptFile, "utf8").trim() };
if (flag("--first")) instance.image = image(flag("--first"));
if (flag("--last")) instance.lastFrame = image(flag("--last"));

const headers = { "x-goog-api-key": key, "Content-Type": "application/json" };
const start = await fetch(`${API}/models/${model}:predictLongRunning`, {
  method: "POST",
  headers,
  body: JSON.stringify({
    instances: [instance],
    parameters: { aspectRatio: "9:16", durationSeconds: 8 },
  }),
});
let op = await start.json();
if (!start.ok) {
  console.error(JSON.stringify(op, null, 2));
  process.exit(1);
}
console.log(`Started ${op.name} with ${model}`);

while (!op.done) {
  await new Promise((r) => setTimeout(r, 10000));
  op = await (await fetch(`${API}/${op.name}`, { headers })).json();
  process.stdout.write(".");
}
console.log();
if (op.error) {
  console.error(JSON.stringify(op.error, null, 2));
  process.exit(1);
}

const sample = op.response?.generateVideoResponse?.generatedSamples?.[0];
if (!sample) {
  console.error(JSON.stringify(op.response, null, 2));
  process.exit(1);
}
const video = await fetch(sample.video.uri, { headers });
writeFileSync(output, Buffer.from(await video.arrayBuffer()));
console.log(`Wrote ${output}`);
