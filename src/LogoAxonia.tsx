import {
  AbsoluteFill,
  Img,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Logo reveal on an animated abstract blue background, 1080x1920 (9:16).
// The logo is split into two layers generated from the original PNG:
// white letters and the blue symbol, so the symbol can spin on its own.

// Size of the layer PNGs and the center of the symbol's ring inside them.
const LOGO_W = 2028;
const LOGO_H = 693;
const ICON_CENTER = { x: 921, y: 325 };
const LOGO_DISPLAY_W = 900;

const BLOBS = [
  { color: "#1d4ed8", size: 900, x: 200, y: 400, speed: 0.013, phase: 0 },
  { color: "#0ea5e9", size: 700, x: 850, y: 700, speed: 0.017, phase: 2 },
  { color: "#3b82f6", size: 800, x: 300, y: 1450, speed: 0.011, phase: 4 },
  { color: "#1e3a8a", size: 1000, x: 900, y: 1700, speed: 0.009, phase: 1 },
  { color: "#38bdf8", size: 500, x: 540, y: 1000, speed: 0.02, phase: 3 },
];

const Fondo: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "#0b2560", overflow: "hidden" }}>
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
              background: `radial-gradient(circle, ${b.color} 0%, transparent 65%)`,
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
              stroke="#93c5fd"
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
              background: "#e0f2fe",
              opacity: 0.25 + random(`o${i}`) * 0.5,
              boxShadow: "0 0 8px #7dd3fc",
            }}
          />
        );
      })}
      {/* Vignette */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(3,10,40,0.6) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

export const LogoAxonia: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();

  // The logo comes from deep in the background: tiny and blurred, it grows
  // past its final size and settles back (zoom in, then out).
  const llegada = spring({
    frame: frame - 12,
    fps,
    config: { damping: 11, stiffness: 70, mass: 1 },
  });
  const entrada = interpolate(frame, [12, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // After landing, a slow continuous push keeps the shot alive.
  const empuje = interpolate(frame, [60, durationInFrames], [1, 1.05], {
    extrapolateLeft: "clamp",
  });
  const escala = interpolate(llegada, [0, 1], [0.08, 1]) * empuje;
  const desenfoque = interpolate(entrada, [0, 1], [18, 0]);

  // The symbol spins in as it arrives; the letters fade in slightly later.
  const giro = interpolate(llegada, [0, 1], [-540, 0]);
  const letras = interpolate(frame, [30, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Light ring bursting from the symbol when the logo lands.
  const onda = interpolate(frame, [38, 80], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Glow pulse on the symbol after landing.
  const brillo = 12 + Math.max(0, Math.sin((frame - 60) / 12)) * 18;

  const escalaLogo = LOGO_DISPLAY_W / LOGO_W;
  const iconoX = width / 2 + (ICON_CENTER.x - LOGO_W / 2) * escalaLogo * escala;
  const iconoY =
    height / 2 + (ICON_CENTER.y - LOGO_H / 2) * escalaLogo * escala;

  const capa: React.CSSProperties = {
    position: "absolute",
    left: 0,
    top: 0,
    width: LOGO_W,
    height: LOGO_H,
  };

  return (
    <AbsoluteFill>
      <Fondo />
      {onda > 0 && onda < 1 ? (
        <div
          style={{
            position: "absolute",
            left: iconoX,
            top: iconoY,
            width: onda * 1400,
            height: onda * 1400,
            borderRadius: "50%",
            border: "4px solid #bae6fd",
            transform: "translate(-50%, -50%)",
            opacity: (1 - onda) * 0.8,
            boxShadow: "0 0 20px #7dd3fc",
          }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          left: width / 2,
          top: height / 2,
          width: LOGO_W,
          height: LOGO_H,
          transform: `translate(-50%, -50%) scale(${escalaLogo * escala})`,
          opacity: entrada,
          filter: `blur(${desenfoque / (escalaLogo * escala)}px)`,
        }}
      >
        <Img
          src={staticFile("axonia-letras.png")}
          style={{
            ...capa,
            opacity: letras,
            filter: "drop-shadow(0 0 18px rgba(147,197,253,0.55))",
          }}
        />
        <Img
          src={staticFile("axonia-icono.png")}
          style={{
            ...capa,
            transformOrigin: `${ICON_CENTER.x}px ${ICON_CENTER.y}px`,
            transform: `rotate(${giro}deg)`,
            filter: `drop-shadow(0 0 ${brillo}px rgba(125,211,252,0.9))`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
