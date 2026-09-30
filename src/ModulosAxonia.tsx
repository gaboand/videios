import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import "@fontsource/montserrat/700.css";
import "@fontsource/montserrat/800.css";
import { z } from "zod";
import { FondoAbstracto } from "./FondoAbstracto";

export const modulosSchema = z.object({
  fondo: z.enum(["ondas", "red", "aurora", "geometrico"]),
  paleta: z.enum(["azul", "gris"]),
});

// "Suite Modular" (originally "Suite de Módulos") rebuilt for the animated blue background: white logo,
// title, and eight glass cards that fly in and land in the same grid as the
// original design (public/modulos/original.webp, scaled to 1080 wide).
// Icons come from scripts/extraer-iconos.py, shown at half their size in
// the original design.

const FUENTE = "Montserrat, sans-serif";
const CELESTE = "#38bdf8";

const COLUMNAS = [
  { x: 86, w: 442 },
  { x: 552, w: 441 },
];
// Four rows packed into the height the top three rows used to take
// (592 to 1540), leaving a wide margin below the grid.
const FILA_TOP = 592;
const FILA_H = 222;
const FILA_GAP = 20;
const FILAS = [0, 1, 2, 3].map((i) => ({
  y: FILA_TOP + i * (FILA_H + FILA_GAP),
  h: FILA_H,
}));
const MODULOS = [
  "Gestión del\nRiesgo",
  "BPM de\nCobranzas",
  "Core Lending",
  "Onboarding\nMultiflow",
  "Automatizaciones",
  "Champion\nChallenger",
  "Evolución\nContinúa",
  "Multi Agentes\ncon IA",
];

// Icon circle and icon, half of the original design's size.
const CIRCULO = 84;
const ICONO = 50;

// Frames: first card starts, delay between cards, flight duration.
// The last card lands at 6 + 7 * 7 + 30 = frame 85 (2.8s).
const INICIO = 6;
const ESCALON = 7;
const VUELO = 30;

// Logo layers (see LogoAxonia) and their size.
const LOGO_W = 2028;
const LOGO_H = 693;
const LOGO_ANCHO = 500;

const Encabezado: React.FC = () => {
  const escala = LOGO_ANCHO / LOGO_W;
  const capa: React.CSSProperties = {
    position: "absolute",
    left: 0,
    top: 0,
    width: LOGO_W,
    height: LOGO_H,
  };
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 540,
          top: 212,
          width: LOGO_W,
          height: LOGO_H,
          transform: `translate(-50%, -50%) scale(${escala})`,
        }}
      >
        <Img src={staticFile("axonia-letras.png")} style={capa} />
        <Img
          src={staticFile("axonia-icono.png")}
          style={{
            ...capa,
            filter: "drop-shadow(0 0 24px rgba(125,211,252,0.8))",
          }}
        />
      </div>
      {/* Divider with dots, as in the original design */}
      <svg
        viewBox="0 0 1080 20"
        style={{ position: "absolute", left: 0, top: 322, width: 1080 }}
      >
        <line
          x1={425}
          y1={10}
          x2={655}
          y2={10}
          stroke={CELESTE}
          strokeWidth={3}
        />
        {[425, 502, 578, 655].map((x) => (
          <circle key={x} cx={x} cy={10} r={6} fill={CELESTE} />
        ))}
      </svg>
      <div
        style={{
          position: "absolute",
          top: 414,
          width: "100%",
          textAlign: "center",
          fontFamily: FUENTE,
          fontWeight: 800,
          fontSize: 92,
          lineHeight: 1.05,
          letterSpacing: -1,
        }}
      >
        <span style={{ color: "white" }}>Suite </span>
        <span style={{ color: CELESTE }}>Modular</span>
      </div>
    </>
  );
};

export const ModulosAxonia: React.FC<z.infer<typeof modulosSchema>> = ({
  fondo,
  paleta,
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      <FondoAbstracto paleta={paleta} estilo={fondo} />
      <Encabezado />
      {MODULOS.map((texto, i) => {
        const col = COLUMNAS[i % 2];
        const fila = FILAS[Math.floor(i / 2)];
        const t = interpolate(
          frame,
          [INICIO + i * ESCALON, INICIO + i * ESCALON + VUELO],
          [0, 1],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.back(1.3)),
          },
        );
        // Left column enters from the left edge, right column from the right.
        const lado = i % 2 === 0 ? -1 : 1;
        const desde = lado === -1 ? -(col.x + col.w + 40) : 1080 - col.x + 40;
        const x = interpolate(t, [0, 1], [desde, 0]);
        const giro = interpolate(t, [0, 1], [lado * 8, 0]);
        const opacidad = interpolate(t, [0, 0.3], [0, 1], {
          extrapolateRight: "clamp",
        });

        return (
          <div
            key={texto}
            style={{
              position: "absolute",
              left: col.x,
              top: fila.y,
              width: col.w,
              height: fila.h,
              borderRadius: 24,
              background: "rgba(255,255,255,0.08)",
              border: "2px solid rgba(255,255,255,0.22)",
              boxShadow:
                "0 10px 30px rgba(3,10,40,0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
              backdropFilter: "blur(16px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 18,
              opacity: opacidad,
              transform: `translateX(${x}px) rotate(${giro}deg)`,
            }}
          >
            <div
              style={{
                width: CIRCULO,
                height: CIRCULO,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.10)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Img
                src={staticFile(`modulos/iconos/icono-${i + 1}.png`)}
                style={{ width: ICONO, height: ICONO }}
              />
            </div>
            <div
              style={{
                fontFamily: FUENTE,
                fontWeight: 700,
                fontSize: 36,
                lineHeight: 1.2,
                color: "white",
                textAlign: "center",
                whiteSpace: "pre-line",
              }}
            >
              {texto}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
