import { getLength, getPointAtLength } from "@remotion/paths";
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

// Decision-engine workflow (1080x1920, 12s): the nodes of a credit
// origination strategy appear one by one while their connections draw,
// then a request (orange dot) runs through the approved path, lighting up
// each node it passes, and the final node reports the decision time.

export const workflowSchema = z.object({
  fondo: z.enum(["ondas", "red", "aurora", "geometrico"]),
  paleta: z.enum(["azul", "gris"]),
});

const FUENTE = "Montserrat, sans-serif";
const ACENTO = "#FF8C42";
const LINEA = "#9aa3ad";
const TIPOS = {
  inicio: { franja: "#22c55e", etiqueta: "Inicio" },
  funcion: { franja: "#8b5cf6", etiqueta: "Función" },
  calculo: { franja: "#8b5cf6", etiqueta: "Cálculo" },
  matriz: { franja: "#8b5cf6", etiqueta: "Matriz" },
  gate: { franja: ACENTO, etiqueta: "Gate manual" },
  finOk: { franja: "#22c55e", etiqueta: "Fin" },
  finNo: { franja: "#e66767", etiqueta: "Fin" },
  decision: { franja: "#2f6f95", etiqueta: "Decisión" },
};

type Nodo = {
  id: string;
  tipo: keyof typeof TIPOS;
  x: number;
  y: number;
  w: number;
  texto: string;
  aparece: number;
};

const CX = 540;
// The diagram is drawn at full size in 1080x1920 coordinates and shown at
// ESCALA. Title + scaled diagram (320 to ~1770, i.e. ~870px at 60%) form one
// block centered vertically.
const ESCALA = 0.6;
const TITULO_TOP = 435;
const DIAGRAMA_TOP = 615;
const NODOS: Nodo[] = [
  {
    id: "inicio",
    tipo: "inicio",
    x: CX,
    y: 360,
    w: 320,
    texto: "Nueva solicitud",
    aparece: 10,
  },
  {
    id: "consulta",
    tipo: "funcion",
    x: CX,
    y: 540,
    w: 450,
    texto: "Consultas Bases y Bureau",
    aparece: 40,
  },
  {
    id: "dec1",
    tipo: "decision",
    x: CX,
    y: 760,
    w: 240,
    texto: "Situación\n< 2",
    aparece: 70,
  },
  {
    id: "rechazo",
    tipo: "finNo",
    x: 855,
    y: 760,
    w: 230,
    texto: "Rechazo\nautomático",
    aparece: 100,
  },
  {
    id: "score",
    tipo: "calculo",
    x: CX,
    y: 980,
    w: 400,
    texto: "Score de riesgo",
    aparece: 115,
  },
  {
    id: "dec2",
    tipo: "decision",
    x: CX,
    y: 1200,
    w: 240,
    texto: "¿Score\n≥ 650?",
    aparece: 145,
  },
  {
    id: "revision",
    tipo: "gate",
    x: 225,
    y: 1200,
    w: 230,
    texto: "Revisión\nanalista",
    aparece: 175,
  },
  {
    id: "matriz",
    tipo: "matriz",
    x: CX,
    y: 1420,
    w: 400,
    texto: "Asignar límite y TNA",
    aparece: 190,
  },
  {
    id: "aprobado",
    tipo: "finOk",
    x: CX,
    y: 1620,
    w: 400,
    texto: "Aprobado · Oferta enviada",
    aparece: 225,
  },
];
const RECT_H = 100;
const ROMBO = 240;

type Arista = {
  d: string;
  desde: number;
  flecha: "abajo" | "derecha" | "izquierda";
  rotulo?: { texto: string; x: number; y: number };
};

// Orthogonal connections between node edges (rect half-height 50,
// diamond half-diagonal 120).
const ARISTAS: Arista[] = [
  { d: `M ${CX} 400 L ${CX} 490`, desde: 25, flecha: "abajo" },
  { d: `M ${CX} 590 L ${CX} 640`, desde: 55, flecha: "abajo" },
  {
    d: `M 660 760 L 740 760`,
    desde: 85,
    flecha: "derecha",
    rotulo: { texto: "No", x: 700, y: 728 },
  },
  {
    d: `M ${CX} 880 L ${CX} 930`,
    desde: 100,
    flecha: "abajo",
    rotulo: { texto: "Sí", x: 580, y: 905 },
  },
  { d: `M ${CX} 1030 L ${CX} 1080`, desde: 130, flecha: "abajo" },
  {
    d: `M 420 1200 L 340 1200`,
    desde: 160,
    flecha: "izquierda",
    rotulo: { texto: "No", x: 380, y: 1168 },
  },
  {
    d: `M ${CX} 1320 L ${CX} 1370`,
    desde: 175,
    flecha: "abajo",
    rotulo: { texto: "Sí", x: 580, y: 1345 },
  },
  {
    d: `M 225 1250 L 225 1420 L 340 1420`,
    desde: 190,
    flecha: "derecha",
    rotulo: { texto: "Aprueba", x: 225, y: 1335 },
  },
  { d: `M ${CX} 1470 L ${CX} 1570`, desde: 210, flecha: "abajo" },
];
const DUR_ARISTA = 15;

// The request's path through the approved branch, and when it runs.
const RECORRIDO = `M ${CX} 360 L ${CX} 1620`;
const RECORRIDO_DESDE = 250;
const RECORRIDO_DUR = 70;
const BADGE = RECORRIDO_DESDE + RECORRIDO_DUR + 5;

const Punta: React.FC<{ x: number; y: number; dir: Arista["flecha"] }> = ({
  x,
  y,
  dir,
}) => {
  const giro = { abajo: 90, derecha: 0, izquierda: 180 }[dir];
  return (
    <path
      d="M 0 -9 L 14 0 L 0 9 Z"
      fill={LINEA}
      transform={`translate(${x} ${y}) rotate(${giro}) translate(-12 0)`}
    />
  );
};

const NodoVista: React.FC<{ n: Nodo; brillo: number }> = ({ n, brillo }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = TIPOS[n.tipo];
  const entrada = spring({
    frame: frame - n.aparece,
    fps,
    config: { damping: 13, stiffness: 120 },
  });
  const halo = `0 0 ${brillo * 34}px rgba(255,140,66,${brillo * 0.8})`;
  const texto: React.CSSProperties = {
    fontFamily: FUENTE,
    fontWeight: 700,
    fontSize: 27,
    lineHeight: 1.2,
    color: "white",
    textAlign: "center",
    whiteSpace: "pre-line",
  };
  const comun: React.CSSProperties = {
    position: "absolute",
    opacity: entrada,
    transform: `translate(-50%, -50%) scale(${0.6 + entrada * 0.4})`,
  };

  if (n.tipo === "decision") {
    const lado = ROMBO / Math.SQRT2;
    return (
      <div
        style={{ ...comun, left: n.x, top: n.y, width: ROMBO, height: ROMBO }}
      >
        <div
          style={{
            position: "absolute",
            left: (ROMBO - lado) / 2,
            top: (ROMBO - lado) / 2,
            width: lado,
            height: lado,
            transform: "rotate(45deg)",
            borderRadius: 14,
            background: "linear-gradient(135deg, #2f6f95, #1d4a66)",
            border: `2px solid ${brillo > 0.05 ? ACENTO : "rgba(255,255,255,0.25)"}`,
            boxShadow: `0 10px 30px rgba(0,0,0,0.4), ${halo}`,
          }}
        />
        <div
          style={{
            ...texto,
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
          }}
        >
          {n.texto}
        </div>
      </div>
    );
  }

  if (n.tipo === "inicio") {
    return (
      <div
        style={{
          ...comun,
          left: n.x,
          top: n.y,
          width: n.w,
          height: 80,
          borderRadius: 40,
          background: "linear-gradient(135deg, #22c55e, #15803d)",
          border: `2px solid ${brillo > 0.05 ? ACENTO : "rgba(255,255,255,0.25)"}`,
          boxShadow: `0 10px 30px rgba(0,0,0,0.4), ${halo}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          ...texto,
        }}
      >
        {n.texto}
      </div>
    );
  }

  return (
    <div
      style={{
        ...comun,
        left: n.x,
        top: n.y,
        width: n.w,
        height: RECT_H,
        borderRadius: 16,
        background: "rgba(22,24,29,0.85)",
        border: `2px solid ${brillo > 0.05 ? ACENTO : "rgba(255,255,255,0.16)"}`,
        boxShadow: `0 10px 30px rgba(0,0,0,0.4), ${halo}`,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 10,
          background: t.franja,
        }}
      />
      <div
        style={{
          fontFamily: FUENTE,
          fontWeight: 700,
          fontSize: 15,
          letterSpacing: 1.5,
          textTransform: "uppercase",
          color: "#8a8f98",
        }}
      >
        {t.etiqueta}
      </div>
      <div style={{ ...texto, fontSize: n.texto.includes("\n") ? 22 : 26 }}>
        {n.texto}
      </div>
    </div>
  );
};

export const WorkflowAxonia: React.FC<z.infer<typeof workflowSchema>> = ({
  fondo,
  paleta,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titulo = spring({ frame, fps, config: { damping: 18 } });

  // Request position along the approved path.
  const avance = interpolate(
    frame,
    [RECORRIDO_DESDE, RECORRIDO_DESDE + RECORRIDO_DUR],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.sin),
    },
  );
  const largo = getLength(RECORRIDO);
  const punto = getPointAtLength(RECORRIDO, avance * largo) ?? {
    x: CX,
    y: 360,
  };
  const enCurso = frame >= RECORRIDO_DESDE && avance < 1;
  // A node glows while the request is at (or just past) it.
  const brillo = (n: Nodo) => {
    if (n.x !== CX || frame < RECORRIDO_DESDE) {
      return 0;
    }
    const d = Math.abs(punto.y - n.y);
    const cerca = Math.max(0, 1 - d / 110);
    return n.id === "aprobado" && avance >= 1 ? 1 : cerca;
  };
  const badge = spring({ frame: frame - BADGE, fps, config: { damping: 14 } });

  return (
    <AbsoluteFill>
      <FondoAbstracto paleta={paleta} estilo={fondo} />
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: TITULO_TOP,
          width: "100%",
          textAlign: "center",
          fontFamily: FUENTE,
          opacity: titulo,
          transform: `translateY(${(1 - titulo) * -30}px)`,
        }}
      >
        <div style={{ fontSize: 62, fontWeight: 800, color: "white" }}>
          Motor de Decisión
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
          Estrategia de originación
        </div>
      </div>
      {/* Diagram at ESCALA, centered horizontally; its top (the start node,
          y = 360 - 40) is moved to DIAGRAMA_TOP, just under the title. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformOrigin: `${CX}px 320px`,
          transform: `translateY(${DIAGRAMA_TOP - 320}px) scale(${ESCALA})`,
        }}
      >
        {/* Connections */}
        <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
          {ARISTAS.map((a, i) => {
            const p = interpolate(
              frame,
              [a.desde, a.desde + DUR_ARISTA],
              [0, 1],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            );
            const l = getLength(a.d);
            const fin = getPointAtLength(a.d, l);
            return (
              <g key={i}>
                <path
                  d={a.d}
                  stroke={LINEA}
                  strokeWidth={3}
                  fill="none"
                  strokeDasharray={`${l} ${l}`}
                  strokeDashoffset={l * (1 - p)}
                />
                {p >= 1 && fin ? (
                  <Punta x={fin.x} y={fin.y} dir={a.flecha} />
                ) : null}
                {a.rotulo ? (
                  <g opacity={p}>
                    <rect
                      x={a.rotulo.x - (a.rotulo.texto.length * 9 + 22) / 2}
                      y={a.rotulo.y - 17}
                      width={a.rotulo.texto.length * 9 + 22}
                      height={34}
                      rx={17}
                      fill="rgba(22,24,29,0.9)"
                      stroke="rgba(255,255,255,0.2)"
                    />
                    <text
                      x={a.rotulo.x}
                      y={a.rotulo.y + 7}
                      fill="white"
                      fontFamily={FUENTE}
                      fontWeight={700}
                      fontSize={18}
                      textAnchor="middle"
                    >
                      {a.rotulo.texto}
                    </text>
                  </g>
                ) : null}
              </g>
            );
          })}
        </svg>
        {/* The request running through the flow, behind the nodes */}
        {enCurso ? (
          <div
            style={{
              position: "absolute",
              left: punto.x,
              top: punto.y,
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: ACENTO,
              transform: "translate(-50%, -50%)",
              boxShadow: `0 0 24px 8px rgba(255,140,66,0.7)`,
            }}
          />
        ) : null}
        {NODOS.map((n) => (
          <NodoVista key={n.id} n={n} brillo={brillo(n)} />
        ))}
        {/* Decision time badge */}
        <div
          style={{
            position: "absolute",
            left: CX,
            top: 1712,
            transform: `translate(-50%, 0) scale(${badge})`,
            opacity: badge,
            fontFamily: FUENTE,
            fontWeight: 700,
            fontSize: 26,
            color: ACENTO,
            background: "rgba(255,140,66,0.12)",
            border: `2px solid rgba(255,140,66,0.5)`,
            borderRadius: 999,
            padding: "10px 26px",
            whiteSpace: "nowrap",
          }}
        >
          Decisión en 0,8 segundos
        </div>
      </div>
    </AbsoluteFill>
  );
};
