import {
  AbsoluteFill,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Animated abstract backgrounds for the 9:16 videos. Every style shares the
// palettes below. "ondas": drifting blurred blobs, flowing lines, rising
// particles. "red": a slowly drifting network of connected nodes.
// "aurora": wide soft light bands. "geometrico": rotating concentric rings
// and a dot grid.
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

type Paleta = keyof typeof PALETAS;

const FondoOndas: React.FC<{ paleta: Paleta }> = ({ paleta }) => {
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

// Soft base shared by the new styles: palette base plus two slow blobs.
const Base: React.FC<{ paleta: Paleta; children?: React.ReactNode }> = ({
  paleta,
  children,
}) => {
  const frame = useCurrentFrame();
  const p = PALETAS[paleta];
  const blob = (x: number, y: number, size: number, color: string) => (
    <div
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color} 0%, transparent 65%)`,
        filter: "blur(50px)",
        opacity: 0.8,
      }}
    />
  );
  return (
    <AbsoluteFill style={{ backgroundColor: p.base, overflow: "hidden" }}>
      {blob(250 + Math.sin(frame * 0.01) * 120, 500, 1100, p.blobs[0])}
      {blob(850 + Math.cos(frame * 0.012) * 120, 1500, 1000, p.blobs[3])}
      {children}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 50%, transparent 50%, ${p.vineta} 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

const FondoRed: React.FC<{ paleta: Paleta }> = ({ paleta }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const p = PALETAS[paleta];
  const DISTANCIA = 280;

  const nodos = Array.from({ length: 56 }).map((_, i) => {
    const vx = (random(`vx${i}`) - 0.5) * 1.2;
    const vy = (random(`vy${i}`) - 0.5) * 1.2;
    return {
      x:
        random(`nx${i}`) * width + vx * frame + Math.sin(frame * 0.02 + i) * 20,
      y:
        random(`ny${i}`) * height +
        vy * frame +
        Math.cos(frame * 0.02 + i) * 20,
      r: 5 + random(`nr${i}`) * 6,
      pulso: 0.5 + 0.5 * Math.sin(frame * 0.08 + i * 1.7),
    };
  });

  const lineas: React.ReactNode[] = [];
  for (let a = 0; a < nodos.length; a++) {
    for (let b = a + 1; b < nodos.length; b++) {
      const d = Math.hypot(nodos[a].x - nodos[b].x, nodos[a].y - nodos[b].y);
      if (d < DISTANCIA) {
        lineas.push(
          <line
            key={`${a}-${b}`}
            x1={nodos[a].x}
            y1={nodos[a].y}
            x2={nodos[b].x}
            y2={nodos[b].y}
            stroke={p.lineas}
            strokeWidth={2.5}
            opacity={(1 - d / DISTANCIA) * 0.8}
          />,
        );
      }
    }
  }

  return (
    <Base paleta={paleta}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ position: "absolute", inset: 0 }}
      >
        {lineas}
        {nodos.map((n, i) => (
          <circle
            key={i}
            cx={n.x}
            cy={n.y}
            r={n.r}
            fill={p.particula}
            opacity={0.45 + n.pulso * 0.5}
            style={{
              filter: `drop-shadow(0 0 ${6 + n.pulso * 8}px ${p.brilloParticula})`,
            }}
          />
        ))}
      </svg>
    </Base>
  );
};

const FondoAurora: React.FC<{ paleta: Paleta }> = ({ paleta }) => {
  const frame = useCurrentFrame();
  const p = PALETAS[paleta];
  const bandas = [
    { y: 350, giro: -20, color: p.blobs[1], vel: 0.012 },
    { y: 900, giro: 15, color: p.blobs[4], vel: 0.009 },
    { y: 1450, giro: -10, color: p.blobs[2], vel: 0.014 },
  ];
  return (
    <Base paleta={paleta}>
      {bandas.map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: -400,
            top: b.y - 170 + Math.sin(frame * b.vel + i * 2) * 120,
            width: 1880,
            height: 340,
            borderRadius: "50%",
            background: `linear-gradient(90deg, transparent 0%, ${b.color} 30%, ${p.particula} 50%, ${b.color} 70%, transparent 100%)`,
            opacity: 0.5,
            filter: "blur(60px)",
            transform: `rotate(${b.giro + Math.sin(frame * b.vel * 1.3 + i) * 12}deg) translateX(${Math.cos(frame * b.vel + i) * 200}px) scaleY(${1 + Math.sin(frame * b.vel * 2 + i) * 0.35})`,
          }}
        />
      ))}
    </Base>
  );
};

const FondoGeometrico: React.FC<{ paleta: Paleta }> = ({ paleta }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const p = PALETAS[paleta];
  const anillos = (cx: number, cy: number, sentido: number) =>
    [220, 340, 460, 580, 700].map((r, i) => (
      <circle
        key={`${cx}-${r}`}
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={p.lineas}
        strokeWidth={i % 2 ? 3 : 5}
        strokeDasharray={i % 2 ? "4 14" : `${r * 1.2} ${r * 0.8}`}
        opacity={0.7 - i * 0.08}
        transform={`rotate(${sentido * frame * (0.4 + i * 0.15)} ${cx} ${cy})`}
      />
    ));
  return (
    <Base paleta={paleta}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ position: "absolute", inset: 0 }}
      >
        {Array.from({ length: 12 }).flatMap((_, fila) =>
          Array.from({ length: 7 }).map((_, col) => {
            const x = 90 + col * 150;
            const y = 90 + fila * 160;
            const onda = Math.sin(frame * 0.06 - (x + y) / 260);
            return (
              <circle
                key={`${fila}-${col}`}
                cx={x}
                cy={y}
                r={4 + onda * 2}
                fill={p.particula}
                opacity={0.15 + (onda + 1) * 0.2}
              />
            );
          }),
        )}
        {anillos(width, 0, 1)}
        {anillos(0, height, -1)}
      </svg>
    </Base>
  );
};

export type EstiloFondo = "ondas" | "red" | "aurora" | "geometrico";

export const FondoAbstracto: React.FC<{
  paleta: Paleta;
  estilo?: EstiloFondo;
}> = ({ paleta, estilo = "ondas" }) => {
  switch (estilo) {
    case "red":
      return <FondoRed paleta={paleta} />;
    case "aurora":
      return <FondoAurora paleta={paleta} />;
    case "geometrico":
      return <FondoGeometrico paleta={paleta} />;
    default:
      return <FondoOndas paleta={paleta} />;
  }
};
