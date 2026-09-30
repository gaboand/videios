import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import "@fontsource/montserrat/500.css";
import "@fontsource/montserrat/700.css";
import "@fontsource/montserrat/800.css";
import { z } from "zod";
import { FondoAbstracto } from "./FondoAbstracto";

// Risk matrix (score x income) on the animated background, 1080x1920, 9s.
// The matrix builds in, then three policy adjustments each flip a small
// group of adjacent cells one risk level down at a color boundary
// (D->C, then C->B, then B->A) while the estimated approval rate rises.

export const matrizSchema = z.object({
  fondo: z.enum(["ondas", "red", "aurora", "geometrico"]),
  paleta: z.enum(["azul", "gris"]),
});

const FUENTE = "Montserrat, sans-serif";
const ACENTO = "#FF8C42";
const TEXTO_2 = "#b8bcc4";

type Nivel = "A" | "B" | "C" | "D";
// Status colors for risk levels; each cell also shows its letter, so the
// level never depends on color alone.
const COLOR: Record<Nivel, { fondo: string; texto: string }> = {
  A: { fondo: "#2e9e4a", texto: "#ffffff" },
  B: { fondo: "#f2c230", texto: "#1f2227" },
  C: { fondo: "#f08a2c", texto: "#1f2227" },
  D: { fondo: "#e0493f", texto: "#ffffff" },
};

const SCORES = [
  "1-100",
  "101-200",
  "201-300",
  "301-400",
  "401-500",
  "501-600",
  "601-700",
  "701-800",
  "801-900",
  "901-1000",
];
// Income bands, highest to lowest (they replace the NSE classes A..D2 of
// the original matrix, so risk still grows to the right). M = miles,
// MM = millones.
const INGRESOS = [
  "> 6 MM",
  "> 4 MM",
  "> 2 MM",
  "> 1 MM",
  "> 700M",
  "> 500M",
  "> 100M",
];

// Starting matrix, transcribed from the original (rows = score bands).
const INICIAL: Nivel[][] = [
  ["D", "D", "D", "D", "D", "D", "D"],
  ["D", "D", "D", "D", "D", "D", "D"],
  ["C", "C", "C", "C", "D", "D", "D"],
  ["B", "C", "C", "C", "C", "D", "D"],
  ["B", "B", "C", "C", "C", "C", "D"],
  ["B", "B", "B", "C", "C", "C", "C"],
  ["A", "B", "B", "B", "C", "C", "C"],
  ["A", "A", "B", "B", "B", "C", "C"],
  ["A", "A", "A", "B", "B", "B", "C"],
  ["A", "A", "A", "A", "B", "B", "B"],
];

// Each adjustment: adjacent cells [row, column] that move one level down.
const AJUSTES = [
  {
    desde: 80,
    a: "C" as Nivel,
    celdas: [
      [2, 4],
      [2, 5],
      [3, 5],
    ],
    aprobacion: 48.5,
  },
  {
    desde: 135,
    a: "B" as Nivel,
    celdas: [
      [4, 2],
      [4, 3],
      [5, 3],
    ],
    aprobacion: 56.0,
  },
  {
    desde: 190,
    a: "A" as Nivel,
    celdas: [
      [6, 1],
      [6, 2],
      [7, 2],
    ],
    aprobacion: 63.5,
  },
];
const APROBACION_INICIAL = 42.0;
const ESCALON_CELDA = 6;
const GIRO = 16;

// Grid geometry.
const CELDA = 86;
const GAP = 6;
const ETIQUETA_W = 130;
const GRILLA_W = INGRESOS.length * (CELDA + GAP) - GAP;
const GRILLA_H = SCORES.length * (CELDA + GAP) - GAP;
const CARD_PAD = 36;
const CARD_W = ETIQUETA_W + GRILLA_W + CARD_PAD * 2 + 40;
const CARD_X = (1080 - CARD_W) / 2;
const CARD_Y = 440;
const ENCAB_H = 110;

const Celda: React.FC<{ fila: number; col: number }> = ({ fila, col }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Build-in: cells cascade diagonally from the top-left corner.
  const entrada = spring({
    frame: frame - 20 - (fila + col) * 2,
    fps,
    config: { damping: 14, stiffness: 160 },
  });

  // Find whether (and when) this cell changes level.
  let nivel = INICIAL[fila][col];
  let escalaX = 1;
  let destello = 0;
  for (const aj of AJUSTES) {
    const i = aj.celdas.findIndex(([f, c]) => f === fila && c === col);
    if (i === -1) {
      continue;
    }
    const t0 = aj.desde + i * ESCALON_CELDA;
    const t = interpolate(frame, [t0, t0 + GIRO], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.sin),
    });
    // Card flip: shrink to an edge, swap level at the midpoint, open again.
    escalaX = Math.abs(Math.cos(t * Math.PI));
    if (t >= 0.5) {
      nivel = aj.a;
    }
    destello = interpolate(
      frame,
      [t0 + GIRO / 2, t0 + GIRO, t0 + GIRO + 30],
      [0, 1, 0],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      },
    );
  }
  const c = COLOR[nivel];

  return (
    <div
      style={{
        position: "absolute",
        left: ETIQUETA_W + col * (CELDA + GAP),
        top: fila * (CELDA + GAP),
        width: CELDA,
        height: CELDA,
        borderRadius: 12,
        background: c.fondo,
        color: c.texto,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FUENTE,
        fontWeight: 800,
        fontSize: 34,
        opacity: entrada,
        transform: `scale(${(0.5 + entrada * 0.5) * 1}) scaleX(${escalaX})`,
        boxShadow: `0 0 0 ${destello * 4}px rgba(255,255,255,${destello * 0.9}), 0 0 ${destello * 30}px rgba(255,255,255,${destello * 0.6})`,
        zIndex: destello > 0 ? 2 : 1,
      }}
    >
      {nivel}
    </div>
  );
};

export const MatrizRiesgo: React.FC<z.infer<typeof matrizSchema>> = ({
  fondo,
  paleta,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titulo = spring({ frame, fps, config: { damping: 18 } });
  const card = spring({
    frame: frame - 8,
    fps,
    config: { damping: 16, stiffness: 90 },
  });

  // Estimated approval: steps up as each adjustment lands.
  let aprobacion = APROBACION_INICIAL;
  let previo = APROBACION_INICIAL;
  for (const aj of AJUSTES) {
    const t = interpolate(frame, [aj.desde, aj.desde + 30], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
    aprobacion += (aj.aprobacion - previo) * t;
    previo = aj.aprobacion;
  }

  return (
    <AbsoluteFill style={{ fontFamily: FUENTE }}>
      <FondoAbstracto paleta={paleta} estilo={fondo} />
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 180,
          width: "100%",
          textAlign: "center",
          opacity: titulo,
          transform: `translateY(${(1 - titulo) * -30}px)`,
        }}
      >
        <div style={{ fontSize: 62, fontWeight: 800, color: "white" }}>
          Matriz de Riesgo
        </div>
        <div
          style={{
            fontSize: 26,
            fontWeight: 500,
            letterSpacing: 4,
            color: ACENTO,
            textTransform: "uppercase",
            marginTop: 6,
          }}
        >
          Score × Ingresos
        </div>
      </div>
      {/* Matrix card */}
      <div
        style={{
          position: "absolute",
          left: CARD_X,
          top: CARD_Y,
          width: CARD_W,
          height: ENCAB_H + GRILLA_H + CARD_PAD * 2,
          borderRadius: 26,
          background: "rgba(22,24,29,0.62)",
          border: "2px solid rgba(255,255,255,0.14)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
          backdropFilter: "blur(16px)",
          opacity: card,
          transform: `translateY(${(1 - card) * 80}px)`,
        }}
      >
        {/* Axis title: Score, rotated along the row labels */}
        <div
          style={{
            position: "absolute",
            left: CARD_PAD - 6,
            top: CARD_PAD + ENCAB_H + GRILLA_H / 2,
            transform: "translate(-50%, -50%) rotate(-90deg) translateY(20px)",
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: 4,
            color: TEXTO_2,
            textTransform: "uppercase",
          }}
        >
          Score
        </div>
        <div
          style={{
            position: "absolute",
            left: CARD_PAD + 40,
            top: CARD_PAD,
            width: ETIQUETA_W + GRILLA_W,
            height: ENCAB_H + GRILLA_H,
          }}
        >
          {/* Axis title: Ingresos, over the column labels */}
          <div
            style={{
              position: "absolute",
              left: ETIQUETA_W,
              width: GRILLA_W,
              top: 0,
              textAlign: "center",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 4,
              color: TEXTO_2,
              textTransform: "uppercase",
            }}
          >
            Ingresos ($)
          </div>
          {INGRESOS.map((ing, col) => (
            <div
              key={ing}
              style={{
                position: "absolute",
                left: ETIQUETA_W + col * (CELDA + GAP),
                top: 52,
                width: CELDA,
                textAlign: "center",
                fontSize: 15,
                fontWeight: 700,
                color: "white",
                whiteSpace: "nowrap",
              }}
            >
              {ing}
            </div>
          ))}
          <div style={{ position: "absolute", left: 0, top: ENCAB_H }}>
            {SCORES.map((s, fila) => (
              <div
                key={s}
                style={{
                  position: "absolute",
                  left: 0,
                  top: fila * (CELDA + GAP),
                  width: ETIQUETA_W - 16,
                  height: CELDA,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  fontSize: 20,
                  fontWeight: 700,
                  color: "white",
                }}
              >
                {s}
              </div>
            ))}
            {SCORES.map((_, fila) =>
              INGRESOS.map((__, col) => (
                <Celda key={`${fila}-${col}`} fila={fila} col={col} />
              )),
            )}
          </div>
        </div>
      </div>
      {/* Estimated approval */}
      <div
        style={{
          position: "absolute",
          top: CARD_Y + ENCAB_H + GRILLA_H + CARD_PAD * 2 + 40,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "baseline",
          gap: 18,
          opacity: card,
        }}
      >
        <div
          style={{
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: 3,
            color: TEXTO_2,
            textTransform: "uppercase",
          }}
        >
          Aprobación estimada
        </div>
        <div style={{ fontSize: 56, fontWeight: 800, color: "white" }}>
          {aprobacion.toLocaleString("es-AR", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          })}
          %
        </div>
      </div>
    </AbsoluteFill>
  );
};
