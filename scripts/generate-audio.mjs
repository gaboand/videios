// Generates public/transicion.wav: a soft ambient pad plus a "whoosh"
// that peaks during the image crossfade. No dependencies, just Node.
// Usage: node scripts/generate-audio.mjs
import { writeFileSync } from "node:fs";

const SAMPLE_RATE = 48000;
const DURATION = 6;
const N = SAMPLE_RATE * DURATION;
const left = new Float32Array(N);
const right = new Float32Array(N);

const smooth = (x) => x * x * (3 - 2 * x);
const clamp01 = (x) => Math.min(1, Math.max(0, x));

// Pad: A major add9 chord, slightly detuned per channel for width.
const notes = [110, 164.81, 220, 277.18, 329.63, 493.88];
for (let i = 0; i < N; i++) {
  const t = i / SAMPLE_RATE;
  const env = smooth(clamp01(t / 1.2)) * smooth(clamp01((DURATION - t) / 1.5));
  let l = 0;
  let r = 0;
  notes.forEach((f, k) => {
    const amp = 0.05 / (1 + k * 0.35);
    const vib = 1 + 0.002 * Math.sin(2 * Math.PI * (0.2 + k * 0.07) * t);
    l += amp * Math.sin(2 * Math.PI * f * vib * t);
    r += amp * Math.sin(2 * Math.PI * f * 1.003 * vib * t + k);
  });
  left[i] = l * env;
  right[i] = r * env;
}

// Whoosh: noise through a one-pole low-pass whose cutoff sweeps up and down,
// centered on the crossfade (~1.0s to ~3.2s), panned slightly left to right.
let seed = 12345;
const rand = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 2 ** 32 - 0.5;
};
let lpA = 0;
let lpB = 0;
const start = 0.8;
const peak = 2.0;
const end = 3.6;
for (let i = 0; i < N; i++) {
  const t = i / SAMPLE_RATE;
  if (t < start || t > end) continue;
  const x = t < peak ? (t - start) / (peak - start) : (end - t) / (end - peak);
  const shape = smooth(clamp01(x));
  const cutoff = 200 + 3800 * shape;
  const a = 1 - Math.exp((-2 * Math.PI * cutoff) / SAMPLE_RATE);
  lpA += a * (rand() - lpA);
  lpB += a * (lpA - lpB);
  const s = lpB * 1.6 * shape;
  const pan = clamp01((t - start) / (end - start));
  left[i] += s * (1 - pan * 0.6);
  right[i] += s * (0.4 + pan * 0.6);
}

// Normalize to -1 dBFS and write 16-bit stereo WAV.
let max = 0;
for (let i = 0; i < N; i++) max = Math.max(max, Math.abs(left[i]), Math.abs(right[i]));
const gain = 0.89 / max;
const buf = Buffer.alloc(44 + N * 4);
buf.write("RIFF", 0);
buf.writeUInt32LE(36 + N * 4, 4);
buf.write("WAVEfmt ", 8);
buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SAMPLE_RATE, 24);
buf.writeUInt32LE(SAMPLE_RATE * 4, 28);
buf.writeUInt16LE(4, 32);
buf.writeUInt16LE(16, 34);
buf.write("data", 36);
buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  buf.writeInt16LE(Math.round(left[i] * gain * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(right[i] * gain * 32767), 46 + i * 4);
}
writeFileSync(new URL("../public/transicion.wav", import.meta.url), buf);
console.log("Wrote public/transicion.wav");
