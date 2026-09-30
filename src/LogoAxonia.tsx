import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/500.css";

// Logo reveal on an animated abstract gray background, 1080x1920 (9:16).
// The logo is split into two layers generated from the original PNG:
// white letters and the light-blue symbol (the only colored element), so the symbol can spin on its own.

// Size of the layer PNGs and the center of the symbol's ring inside them.
const LOGO_W = 2028;
const LOGO_H = 693;
const ICON_CENTER = { x: 921, y: 325 };
const LOGO_DISPLAY_W = 900;

// Where the logo moves up to, making room for the call to action below it.
const LOGO_Y_FINAL = 800;
const INICIO_SUBIDA = 80;
// Call to action: two lines, each sliding in after the previous one.
const LINEAS = [
  { texto: "TE PODEMOS AYUDAR,", peso: 300 },
  { texto: "CONTACTANOS", peso: 500 },
];
const TEXTO_TOP = 1070;
const INICIO_TEXTO = 100;
const ESCALON_TEXTO = 12;

const Llamado: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        top: TEXTO_TOP,
        bottom: "auto",
        alignItems: "center",
        fontFamily: "Roboto, sans-serif",
        color: "white",
        fontSize: 64,
        lineHeight: 1.35,
        textAlign: "center",
      }}
    >
      {LINEAS.map(({ texto, peso }, i) => {
        const aparicion = spring({
          frame: frame - INICIO_TEXTO - i * ESCALON_TEXTO,
          fps,
          config: { damping: 18, stiffness: 90 },
        });
        return (
          <div
            key={texto}
            style={{
              fontWeight: peso,
              // Wide tracking that tightens slightly as the line settles.
              letterSpacing: `${0.22 - aparicion * 0.08}em`,
              opacity: aparicion,
              transform: `translateY(${(1 - aparicion) * 40}px)`,
            }}
          >
            {texto}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const BLOBS = [
  { color: "#4b5563", size: 900, x: 200, y: 400, speed: 0.013, phase: 0 },
  { color: "#9ca3af", size: 700, x: 850, y: 700, speed: 0.017, phase: 2 },
  { color: "#6b7280", size: 800, x: 300, y: 1450, speed: 0.011, phase: 4 },
  { color: "#374151", size: 1000, x: 900, y: 1700, speed: 0.009, phase: 1 },
  { color: "#6b7280", size: 500, x: 540, y: 1000, speed: 0.02, phase: 3 },
];

const Fondo: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "#1f2227", overflow: "hidden" }}>
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
              stroke="#d1d5db"
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
              background: "#f3f4f6",
              opacity: 0.25 + random(`o${i}`) * 0.5,
              boxShadow: "0 0 8px rgba(255,255,255,0.6)",
            }}
          />
        );
      })}
      {/* Vignette */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(8,8,10,0.6) 100%)",
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
  const empuje = interpolate(frame, [60, durationInFrames], [1, 1.04], {
    extrapolateLeft: "clamp",
  });
  // Once landed, the logo rises and shrinks a little to make room for the pills.
  const subida = interpolate(
    frame,
    [INICIO_SUBIDA, INICIO_SUBIDA + 30],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.cubic),
    },
  );
  const logoY = interpolate(subida, [0, 1], [height / 2, LOGO_Y_FINAL]);
  const escala =
    interpolate(llegada, [0, 1], [0.08, 1]) *
    empuje *
    interpolate(subida, [0, 1], [1, 0.85]);
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
  const iconoY = logoY + (ICON_CENTER.y - LOGO_H / 2) * escalaLogo * escala;

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
            border: "4px solid #e5e7eb",
            transform: "translate(-50%, -50%)",
            opacity: (1 - onda) * 0.8,
            boxShadow: "0 0 20px rgba(255,255,255,0.5)",
          }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          left: width / 2,
          top: logoY,
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
            filter: "drop-shadow(0 0 18px rgba(255,255,255,0.3))",
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
      <Llamado />
    </AbsoluteFill>
  );
};
