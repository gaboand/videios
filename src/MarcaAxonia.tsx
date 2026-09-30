import { getLength, getPointAtLength } from "@remotion/paths";
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
import { z } from "zod";
import { FondoAbstracto } from "./FondoAbstracto";

// Brand piece (1080x1920): the white Axonia logo on the animated
// background with two crossed axons beneath it. The logo comes in, the
// axons draw out from the crossing, their endpoints light up, and light
// pulses then travel along them like signals.

export const marcaSchema = z.object({
  fondo: z.enum(["ondas", "red", "aurora", "geometrico"]),
  paleta: z.enum(["azul", "gris"]),
  // "zoom": the whole logo springs in. "ola": the letters come in from the
  // right one behind the other, riding a wave in depth, and settle.
  entrada: z.enum(["zoom", "ola"]),
});

// Logo layers (see LogoAxonia) and their size.
const LOGO_W = 2028;
const LOGO_H = 693;
const LOGO_ANCHO = 620;
const LOGO_Y = 880;

// Crossed axons: two S-curves that cross at the center, drawn in a box of
// AXON_W x AXON_H centered under the logo.
const AXON_W = 440;
const AXON_H = 187;
// The whole axon drawing (lines, dots, stroke) is shown at AXON_ESCALA,
// centered at AXON_Y, keeping the same gap below the logo.
const AXON_ESCALA = 0.5;
const AXON_Y = 1098;
// Each axon reaches past its endpoints: from the crossing it sweeps out
// to its highest (or lowest) point, then curls back inward to an endpoint
// that sits lower (top ends) or higher (bottom ends) than the line itself.
// The shape is point-symmetric around the crossing; the second axon is
// the first one mirrored vertically.
const W = AXON_W;
const H = AXON_H;
const PICO = 5; // distance of the line's extreme from the box edge
const FIN_X = 18; // endpoints pulled inward
const FIN_Y = 32; // endpoints below the top extreme (above the bottom one)
// Endpoints nudged outward (top ones up, bottom ones down); the lines end
// exactly at the center of each endpoint dot.
const AJUSTE_PUNTO = 13;
const axon = (y: (v: number) => number) =>
  [
    `M ${FIN_X} ${y(FIN_Y - AJUSTE_PUNTO)}`,
    `C 4 ${y(16)}, 24 ${y(PICO)}, 70 ${y(PICO)}`,
    `C 170 ${y(PICO)}, ${W - 170} ${y(H - PICO)}, ${W - 70} ${y(H - PICO)}`,
    `C ${W - 24} ${y(H - PICO)}, ${W - 4} ${y(H - 16)}, ${W - FIN_X} ${y(H - FIN_Y + AJUSTE_PUNTO)}`,
  ].join(" ");
const AXONES = [axon((v) => v), axon((v) => H - v)];
const EXTREMOS = [
  [FIN_X, FIN_Y - AJUSTE_PUNTO],
  [W - FIN_X, H - FIN_Y + AJUSTE_PUNTO],
  [FIN_X, H - FIN_Y + AJUSTE_PUNTO],
  [W - FIN_X, FIN_Y - AJUSTE_PUNTO],
];
const COLOR_AXON = "#dbe4ee";

// Logo pieces for the "ola" entrance: x range of each letter in the logo
// layers (public/letras/*.png are these crops at full logo height). The
// "O" is the neuron symbol.
const LETRAS = [
  { id: "A1", x: 0, w: 411 },
  { id: "X", x: 411, w: 335 },
  { id: "O", x: 640, w: 572 },
  { id: "N", x: 1190, w: 326 },
  { id: "I", x: 1516, w: 110 },
  { id: "A2", x: 1626, w: 402 },
];
// Wave the word rides on its way in. It is fixed in screen space, so each
// letter goes through the same crests the letter before it went through,
// while the whole word keeps its spacing. It fades out near the end.
const OLA = {
  desde: 4, // frame the word starts moving
  duracion: 100, // frames until it settles
  recorrido: 1350, // start offset to the right, in screen px
  largo: 520, // wavelength in screen px
  alto: 70, // vertical amplitude in screen px
  profundidad: 0.38, // scale swing: away (smaller) and back (bigger)
  giro: 0.35, // neuron spin, degrees per screen px still to travel
};

// Timeline (frames).
const LOGO_DESDE = 6;
const AXON_DUR = 26;
const PULSO_DUR = 40;

const Letras: React.FC<{ escala: number; brillo: number }> = ({
  escala,
  brillo,
}) => {
  const frame = useCurrentFrame();
  const avance = interpolate(
    frame,
    [OLA.desde, OLA.desde + OLA.duracion],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.3, 0.1, 0.25, 1),
    },
  );
  // Screen px the word still has to travel, and how much wave is left.
  const resta = OLA.recorrido * (1 - avance);
  const envolvente = interpolate(resta, [0, 420], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });

  return (
    <>
      {LETRAS.map((l) => {
        // Where this letter is on screen right now.
        const xFinal = 540 + (l.x + l.w / 2 - LOGO_W / 2) * escala;
        const fase = ((xFinal + resta) / OLA.largo) * Math.PI * 2;
        const y = Math.sin(fase) * OLA.alto * envolvente;
        const s = 1 + Math.cos(fase) * OLA.profundidad * envolvente;
        const lejos = Math.max(0, 1 - s);
        return (
          <Img
            key={l.id}
            src={staticFile(`letras/${l.id}.png`)}
            style={{
              position: "absolute",
              left: l.x,
              top: 0,
              width: l.w,
              height: LOGO_H,
              zIndex: Math.round(s * 100),
              transformOrigin: "50% 50%",
              transform: `translate(${resta / escala}px, ${y / escala}px) scale(${s}) rotate(${
                l.id === "O" ? -resta * OLA.giro : 0
              }deg)`,
              // Farther letters look dimmer and softer.
              filter: `blur(${lejos * 10}px) brightness(${1 - lejos * 0.6})${
                l.id === "O"
                  ? ` drop-shadow(0 0 ${brillo}px rgba(125,211,252,0.85))`
                  : ""
              }`,
            }}
          />
        );
      })}
    </>
  );
};

export const MarcaAxonia: React.FC<z.infer<typeof marcaSchema>> = ({
  fondo,
  paleta,
  entrada,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // The axons start once the logo is in place.
  const AXON_DESDE = entrada === "ola" ? OLA.desde + OLA.duracion - 4 : 28;
  const PULSOS_DESDE = AXON_DESDE + 32;

  const logo = spring({
    frame: frame - LOGO_DESDE,
    fps,
    config: { damping: 14, stiffness: 90 },
  });
  const escalaLogo = LOGO_ANCHO / LOGO_W;
  const capa: React.CSSProperties = {
    position: "absolute",
    left: 0,
    top: 0,
    width: LOGO_W,
    height: LOGO_H,
  };
  // Soft glow pulse on the symbol once everything is in.
  const brillo = 18 + Math.max(0, Math.sin((frame - PULSOS_DESDE) / 14)) * 16;

  // Axons draw out from the crossing towards both ends.
  const trazo = interpolate(
    frame,
    [AXON_DESDE, AXON_DESDE + AXON_DUR],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.cubic),
    },
  );
  const puntos = spring({
    frame: frame - (AXON_DESDE + AXON_DUR - 4),
    fps,
    config: { damping: 10, stiffness: 160 },
  });

  return (
    <AbsoluteFill>
      <FondoAbstracto paleta={paleta} estilo={fondo} />
      {/* Logo */}
      <div
        style={{
          position: "absolute",
          left: 540,
          top: LOGO_Y,
          width: LOGO_W,
          height: LOGO_H,
          opacity: entrada === "ola" ? 1 : logo,
          transform: `translate(-50%, -50%) scale(${
            escalaLogo * (entrada === "ola" ? 1 : 0.8 + logo * 0.2)
          })`,
        }}
      >
        {entrada === "ola" ? (
          <Letras escala={escalaLogo} brillo={brillo} />
        ) : (
          <>
            <Img src={staticFile("axonia-letras.png")} style={capa} />
            <Img
              src={staticFile("axonia-icono.png")}
              style={{
                ...capa,
                filter: `drop-shadow(0 0 ${brillo}px rgba(125,211,252,0.85))`,
              }}
            />
          </>
        )}
      </div>
      {/* Crossed axons */}
      <svg
        width={AXON_W + 40}
        height={AXON_H + 40}
        viewBox={`-20 -20 ${AXON_W + 40} ${AXON_H + 40}`}
        style={{
          position: "absolute",
          left: 540 - (AXON_W + 40) / 2,
          top: AXON_Y - (AXON_H + 40) / 2,
          overflow: "visible",
          transform: `scale(${AXON_ESCALA})`,
        }}
      >
        <defs>
          <filter id="brilloAxon" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {AXONES.map((d, i) => {
          const l = getLength(d);
          // Reveal symmetric around the middle of each curve (the crossing).
          const visible = l * trazo;
          return (
            <path
              key={i}
              d={d}
              fill="none"
              stroke={COLOR_AXON}
              strokeWidth={4}
              strokeLinecap="round"
              strokeDasharray={`0 ${(l - visible) / 2} ${visible} ${l}`}
              filter="url(#brilloAxon)"
            />
          );
        })}
        {EXTREMOS.map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={8 * puntos}
            fill={COLOR_AXON}
            filter="url(#brilloAxon)"
          />
        ))}
        {/* Signals travelling along the axons, alternating directions */}
        {frame >= PULSOS_DESDE
          ? AXONES.map((d, i) => {
              const ciclo =
                ((frame - PULSOS_DESDE + i * (PULSO_DUR / 2)) % PULSO_DUR) /
                PULSO_DUR;
              const t = i % 2 === 0 ? ciclo : 1 - ciclo;
              const p = getPointAtLength(d, getLength(d) * t);
              if (!p) {
                return null;
              }
              const alfa = Math.sin(ciclo * Math.PI);
              return (
                <circle
                  key={`p${i}`}
                  cx={p.x}
                  cy={p.y}
                  r={7}
                  fill="#7dd3fc"
                  opacity={alfa}
                  style={{ filter: "drop-shadow(0 0 10px #7dd3fc)" }}
                />
              );
            })
          : null}
      </svg>
    </AbsoluteFill>
  );
};
