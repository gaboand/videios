import {
  AbsoluteFill,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Animated abstract background: drifting blurred blobs, flowing lines,
// particles rising and a vignette. Two palettes share the same motion.
const PALETAS = {
  azul: {
    base: "#0b2560",
    blobs: ["#1d4ed8", "#0ea5e9", "#3b82f6", "#1e3a8a", "#38bdf8"],
    lineas: "#93c5fd",
    particula: "#e0f2fe",
    brilloParticula: "#7dd3fc",
    vineta: "rgba(3,10,40,0.6)",
  },
  gris: {
    base: "#1f2227",
    blobs: ["#4b5563", "#9ca3af", "#6b7280", "#374151", "#6b7280"],
    lineas: "#d1d5db",
    particula: "#f3f4f6",
    brilloParticula: "rgba(255,255,255,0.6)",
    vineta: "rgba(8,8,10,0.6)",
  },
};

const BLOBS = [
  { size: 900, x: 200, y: 400, speed: 0.013, phase: 0 },
  { size: 700, x: 850, y: 700, speed: 0.017, phase: 2 },
  { size: 800, x: 300, y: 1450, speed: 0.011, phase: 4 },
  { size: 1000, x: 900, y: 1700, speed: 0.009, phase: 1 },
  { size: 500, x: 540, y: 1000, speed: 0.02, phase: 3 },
];

export const FondoAbstracto: React.FC<{ paleta: keyof typeof PALETAS }> = ({
  paleta,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const p = PALETAS[paleta];

  return (
    <AbsoluteFill style={{ backgroundColor: p.base, overflow: "hidden" }}>
      {BLOBS.map((b, i) => {
        const x = b.x + Math.sin(frame * b.speed + b.phase) * 180;
        const y = b.y + Math.cos(frame * b.speed * 0.8 + b.phase) * 220;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - b.size / 2,
              top: y - b.size / 2,
              width: b.size,
              height: b.size,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${p.blobs[i]} 0%, transparent 65%)`,
              opacity: 0.95,
              filter: "blur(40px)",
            }}
          />
        );
      })}
      {/* Flowing lines */}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ position: "absolute", inset: 0, opacity: 0.35 }}
      >
        {Array.from({ length: 9 }).map((_, i) => {
          const y0 = 300 + i * 170;
          const t = frame * 0.03 + i * 0.7;
          const d = `M -100 ${y0 + Math.sin(t) * 80} C 300 ${y0 - 200 + Math.cos(t) * 120}, 700 ${y0 + 220 + Math.sin(t * 1.3) * 120}, 1180 ${y0 + Math.cos(t) * 80}`;
          return (
            <path
              key={i}
              d={d}
              stroke={p.lineas}
              strokeWidth={i % 3 === 0 ? 3 : 1.5}
              fill="none"
            />
          );
        })}
      </svg>
      {/* Particles drifting upward */}
      {Array.from({ length: 40 }).map((_, i) => {
        const x = random(`x${i}`) * width;
        const speed = 0.6 + random(`s${i}`) * 1.8;
        const y = (random(`y${i}`) * height - frame * speed + height) % height;
        const r = 2 + random(`r${i}`) * 4;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: r,
              height: r,
              borderRadius: "50%",
              background: p.particula,
              opacity: 0.25 + random(`o${i}`) * 0.5,
              boxShadow: `0 0 8px ${p.brilloParticula}`,
            }}
          />
        );
      })}
      {/* Vignette */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 50%, transparent 50%, ${p.vineta} 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};
