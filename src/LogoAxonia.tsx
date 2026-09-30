import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FondoAbstracto } from "./FondoAbstracto";
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
      <FondoAbstracto paleta="gris" />
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
