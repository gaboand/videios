import { getLength, getPointAtLength } from "@remotion/paths";
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
  // "revelado", "enfoque", "neurona", "escaneo": see EntradaVariante.
  entrada: z.enum([
    "zoom",
    "ola",
    "revelado",
    "enfoque",
    "neurona",
    "escaneo",
    "giro",
    "iris",
    "ensamble",
    "expansiva",
  ]),
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
  entradaX: 1100, // screen x where letters come in from the back
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
  // 0 while moving, then 0 -> 1 right after the word settles.
  const asentado = interpolate(
    frame,
    [OLA.desde + OLA.duracion, OLA.desde + OLA.duracion + 20],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const envolvente = interpolate(resta, [0, 420], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });

  return (
    <>
      {LETRAS.map((l) => {
        // Where this letter is on screen right now.
        const xFinal = 540 + (l.x + l.w / 2 - LOGO_W / 2) * escala;
        // Phase is set so a letter is at the back of the wave (smallest)
        // as it crosses the right edge of the screen.
        const fase =
          ((xFinal + resta - OLA.entradaX) / OLA.largo) * Math.PI * 2 + Math.PI;
        const y = Math.sin(fase) * OLA.alto * envolvente;
        const s = 1 + Math.cos(fase) * OLA.profundidad * envolvente;
        const lejos = Math.max(0, 1 - s);
        // See-through while travelling: 70% transparent at the back of the
        // wave, 40% at the front; 40% as the wave fades, then solid once
        // the word has settled.
        const enViaje = interpolate(Math.cos(fase), [-1, 1], [0.3, 0.6]);
        const opacidad =
          (0.6 + (enViaje - 0.6) * envolvente) * (1 - asentado) + asentado;
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
              opacity: opacidad,
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

// Letters' baseline and the neuron's center, in logo layer pixels.
const BASE_Y = 535;
const NEURONA = { x: 921, y: 325 };

// Frame each short entrance has the logo fully in place.
const ASENTADO: Record<string, number> = {
  revelado: 58,
  enfoque: 62,
  neurona: 62,
  escaneo: 52,
  giro: 58,
  iris: 48,
  ensamble: 60,
  expansiva: 66,
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Four short, minimal entrances built from the same letter pieces:
// - revelado: a light line draws across the baseline and the letters rise
//   from behind it one after another; the neuron spins in last.
// - enfoque: letters start spread apart, blurred and faint, and close in
//   to their spacing while coming into focus.
// - neurona: the neuron appears first with a flash, then the letters slide
//   out from behind it to both sides.
// - escaneo: a vertical beam sweeps left to right and the letters
//   materialise as it passes, with a bright edge.
// - giro: letters flip in on their horizontal axis, left to right.
// - iris: the neuron pulses and a circle of light opens from it,
//   revealing the whole logo.
// - ensamble: letters fly in from scattered places in space (depth,
//   rotation, blur) and converge together.
// - expansiva: the neuron appears and sends out a ring; each letter pops
//   in as the ring reaches it.
const EntradaVariante: React.FC<{
  variante:
    | "revelado"
    | "enfoque"
    | "neurona"
    | "escaneo"
    | "giro"
    | "iris"
    | "ensamble"
    | "expansiva";
  brillo: number;
}> = ({ variante, brillo }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const glow = (id: string) =>
    id === "O" ? ` drop-shadow(0 0 ${brillo}px rgba(125,211,252,0.85))` : "";
  const pieza = (l: (typeof LETRAS)[number], extra: React.CSSProperties) => (
    <Img
      key={l.id}
      src={staticFile(`letras/${l.id}.png`)}
      style={{
        position: "absolute",
        left: l.x,
        top: 0,
        width: l.w,
        height: LOGO_H,
        transformOrigin: "50% 50%",
        ...extra,
      }}
    />
  );

  if (variante === "revelado") {
    const linea = interpolate(frame, [0, 16], [0, 1], {
      ...clamp,
      easing: Easing.out(Easing.cubic),
    });
    const lineaFuera = interpolate(frame, [44, 60], [1, 0], clamp);
    const orden = ["A1", "X", "N", "I", "A2"];
    return (
      <>
        {/* Light line along the baseline */}
        <div
          style={{
            position: "absolute",
            left: LOGO_W / 2 - (LOGO_W / 2) * linea,
            top: BASE_Y + 14,
            width: LOGO_W * linea,
            height: 10,
            borderRadius: 5,
            background:
              "linear-gradient(90deg, transparent, #ffffff, transparent)",
            opacity: lineaFuera,
            boxShadow: "0 0 40px rgba(255,255,255,0.8)",
          }}
        />
        {/* Letters rise from behind the baseline */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: LOGO_W,
            height: BASE_Y + 12,
            overflow: "hidden",
          }}
        >
          {LETRAS.filter((l) => l.id !== "O").map((l) => {
            const i = orden.indexOf(l.id);
            const t = spring({
              frame: frame - 12 - i * 4,
              fps,
              config: { damping: 13, stiffness: 150 },
            });
            return pieza(l, {
              transform: `translateY(${(1 - t) * (BASE_Y + 40)}px)`,
            });
          })}
        </div>
        {(() => {
          const l = LETRAS.find((p) => p.id === "O")!;
          const t = spring({
            frame: frame - 34,
            fps,
            config: { damping: 11, stiffness: 140 },
          });
          return pieza(l, {
            opacity: Math.min(1, t * 1.5),
            transform: `scale(${t}) rotate(${(1 - t) * -200}deg)`,
            transformOrigin: `${NEURONA.x - l.x}px ${NEURONA.y}px`,
            filter: glow("O"),
          });
        })()}
      </>
    );
  }

  if (variante === "enfoque") {
    const t = interpolate(frame, [0, 60], [0, 1], {
      ...clamp,
      easing: Easing.bezier(0.33, 0, 0.2, 1),
    });
    return (
      <>
        {LETRAS.map((l) => {
          const centro = l.x + l.w / 2 - LOGO_W / 2;
          return pieza(l, {
            opacity: interpolate(t, [0, 0.6], [0, 1], clamp),
            transform: `translateX(${centro * 0.9 * (1 - t)}px) scale(${1.25 - 0.25 * t}) rotate(${
              l.id === "O" ? (1 - t) * -90 : 0
            }deg)`,
            filter: `blur(${(1 - t) * 40}px)${glow(l.id)}`,
          });
        })}
      </>
    );
  }

  if (variante === "neurona") {
    const n = spring({ frame, fps, config: { damping: 10, stiffness: 120 } });
    const destello = interpolate(frame, [6, 14, 34], [0, 1, 0], clamp);
    const salida = interpolate(frame, [20, 58], [0, 1], {
      ...clamp,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    });
    const o = LETRAS.find((p) => p.id === "O")!;
    return (
      <>
        {LETRAS.filter((l) => l.id !== "O").map((l) => {
          // Start hidden behind the neuron, slide out to its place.
          const desde = NEURONA.x - (l.x + l.w / 2);
          return pieza(l, {
            opacity: interpolate(salida, [0, 0.25], [0, 1], clamp),
            transform: `translateX(${desde * (1 - salida)}px) scale(${0.6 + 0.4 * salida})`,
          });
        })}
        {pieza(o, {
          transform: `scale(${n}) rotate(${(1 - n) * 180}deg)`,
          transformOrigin: `${NEURONA.x - o.x}px ${NEURONA.y}px`,
          filter: `drop-shadow(0 0 ${brillo + destello * 60}px rgba(125,211,252,${0.85 + destello * 0.15}))`,
        })}
      </>
    );
  }

  if (variante === "giro") {
    return (
      <>
        {LETRAS.map((l, i) => {
          const t = spring({
            frame: frame - 6 - i * 5,
            fps,
            config: { damping: 14, stiffness: 120 },
          });
          return pieza(l, {
            opacity: Math.min(1, t * 2),
            transformOrigin: `50% ${BASE_Y}px`,
            transform: `perspective(1600px) rotateX(${(1 - t) * -100}deg) translateY(${(1 - t) * -80}px)`,
            filter: glow(l.id),
          });
        })}
      </>
    );
  }

  if (variante === "iris") {
    const r = interpolate(frame, [8, 42], [0, 1300], {
      ...clamp,
      easing: Easing.bezier(0.5, 0, 0.2, 1),
    });
    const anillo = interpolate(r, [0, 200, 1300], [0, 1, 0], clamp);
    const pulso = spring({
      frame,
      fps,
      config: { damping: 12, stiffness: 160 },
    });
    return (
      <>
        <div
          style={{
            position: "absolute",
            inset: 0,
            clipPath: `circle(${r}px at ${NEURONA.x}px ${NEURONA.y}px)`,
            transform: `scale(${1.06 - 0.06 * interpolate(r, [0, 1300], [0, 1], clamp)})`,
            transformOrigin: `${NEURONA.x}px ${NEURONA.y}px`,
          }}
        >
          {LETRAS.filter((l) => l.id !== "O").map((l) => pieza(l, {}))}
        </div>
        {pieza(LETRAS.find((p) => p.id === "O")!, {
          transform: `scale(${pulso})`,
          transformOrigin: `${NEURONA.x - 640}px ${NEURONA.y}px`,
          filter: glow("O"),
        })}
        <div
          style={{
            position: "absolute",
            left: NEURONA.x - r,
            top: NEURONA.y - r,
            width: r * 2,
            height: r * 2,
            borderRadius: "50%",
            border: "12px solid rgba(255,255,255,0.95)",
            boxShadow:
              "0 0 50px rgba(125,211,252,0.8), inset 0 0 50px rgba(125,211,252,0.5)",
            opacity: anillo,
          }}
        />
      </>
    );
  }

  if (variante === "ensamble") {
    return (
      <>
        {LETRAS.map((l, i) => {
          const t = interpolate(frame, [4 + i * 2, 52 + i * 2], [0, 1], {
            ...clamp,
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          });
          const dx = (random(`dx${l.id}`) - 0.5) * 1800;
          const dy = (random(`dy${l.id}`) - 0.5) * 1100;
          const esc = 0.3 + random(`s${l.id}`) * 2.2;
          const rot = (random(`r${l.id}`) - 0.5) * 120;
          return pieza(l, {
            opacity: interpolate(t, [0, 0.3], [0, 1], clamp),
            transform: `translate(${dx * (1 - t)}px, ${dy * (1 - t)}px) scale(${esc + (1 - esc) * t}) rotate(${rot * (1 - t)}deg)`,
            filter: `blur(${(1 - t) * 30}px)${glow(l.id)}`,
          });
        })}
      </>
    );
  }

  if (variante === "expansiva") {
    const onda = interpolate(frame, [14, 46], [0, 1300], {
      ...clamp,
      easing: Easing.out(Easing.quad),
    });
    const n = spring({ frame, fps, config: { damping: 10, stiffness: 150 } });
    return (
      <>
        {LETRAS.map((l) => {
          if (l.id === "O") {
            return pieza(l, {
              transform: `scale(${n})`,
              transformOrigin: `${NEURONA.x - l.x}px ${NEURONA.y}px`,
              filter: glow("O"),
            });
          }
          // Pops when the ring reaches the letter's center.
          const d = Math.abs(l.x + l.w / 2 - NEURONA.x);
          // Inverse of the ring's ease-out, so the pop matches the ring.
          const llega = 14 + 32 * (1 - Math.sqrt(1 - d / 1300));
          const t = spring({
            frame: frame - llega,
            fps,
            config: { damping: 9, stiffness: 170 },
          });
          return pieza(l, {
            opacity: Math.min(1, t * 3),
            transform: `scale(${t})`,
            transformOrigin: `50% ${BASE_Y - 180}px`,
          });
        })}
        <div
          style={{
            position: "absolute",
            left: NEURONA.x - onda,
            top: NEURONA.y - onda,
            width: onda * 2,
            height: onda * 2,
            borderRadius: "50%",
            border: "12px solid rgba(125,211,252,0.95)",
            boxShadow: "0 0 40px rgba(125,211,252,0.7)",
            opacity: interpolate(onda, [0, 150, 1300], [0, 1, 0], clamp),
          }}
        />
      </>
    );
  }

  // escaneo
  const haz = interpolate(frame, [4, 46], [-120, LOGO_W + 120], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const hazFuera = interpolate(frame, [44, 54], [1, 0], clamp);
  return (
    <>
      {LETRAS.map((l) => {
        // Portion of this letter the beam has already passed.
        const visto = Math.min(l.w, Math.max(0, haz - l.x));
        const borde = interpolate(
          haz - (l.x + l.w),
          [-l.w, 0, 120],
          [0.6, 1, 0],
          clamp,
        );
        return pieza(l, {
          clipPath: `inset(-50% ${l.w - visto}px -50% 0)`,
          filter: `brightness(${1 + borde * 1.5})${glow(l.id)}`,
        });
      })}
      {/* The beam */}
      <div
        style={{
          position: "absolute",
          left: haz - 6,
          top: -120,
          width: 12,
          height: LOGO_H + 240,
          borderRadius: 6,
          background:
            "linear-gradient(180deg, transparent, #ffffff 30%, #ffffff 70%, transparent)",
          boxShadow: "0 0 60px 18px rgba(125,211,252,0.6)",
          opacity: hazFuera,
        }}
      />
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
  const AXON_DESDE =
    entrada === "ola"
      ? OLA.desde + OLA.duracion - 4
      : entrada === "zoom"
        ? 28
        : ASENTADO[entrada] - 4;
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
          opacity: entrada === "zoom" ? logo : 1,
          transform: `translate(-50%, -50%) scale(${
            escalaLogo * (entrada === "zoom" ? 0.8 + logo * 0.2 : 1)
          })`,
        }}
      >
        {entrada === "ola" ? (
          <Letras escala={escalaLogo} brillo={brillo} />
        ) : entrada !== "zoom" ? (
          <EntradaVariante variante={entrada} brillo={brillo} />
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
