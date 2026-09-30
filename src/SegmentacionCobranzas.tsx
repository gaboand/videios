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

// Collections segmentation (1080x1920, 9s): a 5x5x3 voxel cube (X debt
// balance, Y days past due, Z score), already built, slowly turns, opens up
// by segment, and each segment in turn lights up while a card with the
// client segment to manage peels off the cube into a 2x2 grid.

export const segmentacionSchema = z.object({
  fondo: z.enum(["ondas", "red", "aurora", "geometrico"]),
  paleta: z.enum(["azul", "gris"]),
});

const FUENTE = "Montserrat, sans-serif";
const ACENTO = "#FF8C42";
const TEXTO_2 = "#b8bcc4";

type SegId = "S1" | "S2" | "S3" | "S4";
const SEGMENTOS: Record<
  SegId,
  {
    color: string;
    nombre: string;
    perfil: string;
    accion: string;
    celdas: number;
    // Offset when the cube opens up (x, y, z in px; y down, z toward viewer).
    apertura: [number, number, number];
    // Where the card starts, roughly over the segment on screen.
    origen: [number, number];
  }
> = {
  S1: {
    color: "#2f6fe0",
    nombre: "Preventivo",
    perfil: "Mora 0-30 días · saldo bajo",
    accion: "Recordatorio por WhatsApp",
    celdas: 24,
    apertura: [0, 0, 70],
    origen: [500, 760],
  },
  S2: {
    color: "#2e9e4a",
    nombre: "Prioritario",
    perfil: "Saldo alto · buen score",
    accion: "Ejecutivo de cuenta asignado",
    celdas: 1,
    apertura: [40, -90, 130],
    origen: [640, 560],
  },
  S3: {
    color: "#f08a2c",
    nombre: "Mora temprana",
    perfil: "31-90 días de atraso",
    accion: "Propuesta de refinanciación",
    celdas: 10,
    apertura: [110, 0, 0],
    origen: [720, 700],
  },
  S4: {
    color: "#e0493f",
    nombre: "Mora avanzada",
    perfil: "+90 días · score bajo",
    accion: "Gestión intensiva y agencia externa",
    celdas: 40,
    apertura: [-30, -40, -110],
    origen: [470, 560],
  },
};
const ORDEN: SegId[] = ["S1", "S2", "S3", "S4"];

const LADO = 74;
const CUBO_Y = 730;

// Segment of each voxel: front layer blue with one green corner, middle
// layer orange on the right two columns and red elsewhere, back layer red.
const segmentoDe = (x: number, y: number, z: number): SegId => {
  if (z === 0) {
    return x === 4 && y === 4 ? "S2" : "S1";
  }
  if (z === 1 && x >= 3) {
    return "S3";
  }
  return "S4";
};

const VOXELES = Array.from({ length: 3 }).flatMap((_, z) =>
  Array.from({ length: 5 }).flatMap((__, y) =>
    Array.from({ length: 5 }).map((___, x) => ({
      x,
      y,
      z,
      seg: segmentoDe(x, y, z),
    })),
  ),
);

// Timeline (frames).
const APERTURA = 30;
const PRIMERA_CARD = 60;
const ESCALON_CARD = 38;
const FIN_FOCO = PRIMERA_CARD + ESCALON_CARD * 4;

const aclarar = (hex: string, f: number) => {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) =>
    Math.round(f >= 1 ? v + (255 - v) * (f - 1) : v * f),
  );
  return `rgb(${c.join(",")})`;
};

const Voxel: React.FC<{
  x: number;
  y: number;
  z: number;
  seg: SegId;
  apertura: number;
  foco: SegId | null;
}> = ({ x, y, z, seg, apertura, foco }) => {
  const s = SEGMENTOS[seg];
  const [ox, oy, oz] = s.apertura;
  const px = (x - 2) * LADO + ox * apertura;
  const py = -(y - 2) * LADO + oy * apertura;
  const pz = -(z - 1) * LADO + oz * apertura;
  // Other segments dim while one is in focus.
  const filtro =
    foco && foco !== seg ? "saturate(0.25) brightness(0.45)" : "none";
  const cara = (transform: string, f: number): React.CSSProperties => ({
    position: "absolute",
    width: LADO,
    height: LADO,
    left: -LADO / 2,
    top: -LADO / 2,
    background: aclarar(s.color, f),
    border: "1px solid rgba(0,0,0,0.18)",
    boxSizing: "border-box",
    transform,
    filter: filtro,
  });
  return (
    <div
      style={{
        position: "absolute",
        transformStyle: "preserve-3d",
        transform: `translate3d(${px}px, ${py}px, ${pz}px)`,
      }}
    >
      <div style={cara(`translateZ(${LADO / 2}px)`, 1)} />
      <div style={cara(`rotateY(90deg) translateZ(${LADO / 2}px)`, 0.72)} />
      <div style={cara(`rotateY(-90deg) translateZ(${LADO / 2}px)`, 0.72)} />
      <div style={cara(`rotateX(90deg) translateZ(${LADO / 2}px)`, 1.25)} />
    </div>
  );
};

const Card: React.FC<{ id: SegId; i: number }> = ({ id, i }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = SEGMENTOS[id];
  const t = spring({
    frame: frame - (PRIMERA_CARD + i * ESCALON_CARD),
    fps,
    config: { damping: 16, stiffness: 90 },
  });
  const W = 428;
  const H = 250;
  const fx = 100 + (i % 2) * (W + 24);
  const fy = 1090 + Math.floor(i / 2) * (H + 24);
  // Fly from over the segment on the cube to its slot.
  const x = interpolate(t, [0, 1], [s.origen[0] - W / 2, fx]);
  const y = interpolate(t, [0, 1], [s.origen[1] - H / 2, fy]);
  const escala = interpolate(t, [0, 1], [0.15, 1]);
  const conteo = Math.round(
    s.celdas *
      interpolate(t, [0.4, 1], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
  );
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: W,
        height: H,
        transform: `scale(${escala})`,
        opacity: interpolate(t, [0, 0.15], [0, 1], {
          extrapolateRight: "clamp",
        }),
        borderRadius: 22,
        background: "rgba(22,24,29,0.72)",
        border: "2px solid rgba(255,255,255,0.14)",
        boxShadow: `0 10px 30px rgba(0,0,0,0.35)`,
        backdropFilter: "blur(16px)",
        padding: "24px 26px",
        boxSizing: "border-box",
        fontFamily: FUENTE,
        color: "white",
        overflow: "hidden",
      }}
    >
      {/* Segment color bar: identity is also carried by the S# label */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 10,
          background: s.color,
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            fontSize: 18,
            fontWeight: 800,
            background: s.color,
            borderRadius: 8,
            padding: "3px 10px",
          }}
        >
          {id}
        </div>
        <div style={{ fontSize: 28, fontWeight: 800 }}>{s.nombre}</div>
      </div>
      <div
        style={{ fontSize: 19, fontWeight: 500, color: TEXTO_2, marginTop: 10 }}
      >
        {s.perfil}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 10,
          marginTop: 14,
        }}
      >
        <div style={{ fontSize: 46, fontWeight: 800 }}>{conteo}</div>
        <div style={{ fontSize: 19, fontWeight: 500, color: TEXTO_2 }}>
          {s.celdas === 1 ? "celda" : "celdas"}
        </div>
      </div>
      <div
        style={{ fontSize: 18, fontWeight: 700, color: ACENTO, marginTop: 6 }}
      >
        {s.accion}
      </div>
    </div>
  );
};

export const SegmentacionCobranzas: React.FC<
  z.infer<typeof segmentacionSchema>
> = ({ fondo, paleta }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titulo = spring({ frame, fps, config: { damping: 18 } });
  const apertura = interpolate(frame, [APERTURA, APERTURA + 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  // Slow continuous turn.
  const giroY = -32 + Math.sin(frame / 55) * 12;
  const giroX = -20 + Math.sin(frame / 80) * 3;

  // Segment in focus while its card peels off.
  const indiceFoco = Math.floor((frame - PRIMERA_CARD + 6) / ESCALON_CARD);
  const foco =
    frame >= PRIMERA_CARD - 6 && frame < FIN_FOCO
      ? (ORDEN[indiceFoco] ?? null)
      : null;

  const leyenda = interpolate(frame, [20, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ fontFamily: FUENTE }}>
      <FondoAbstracto paleta={paleta} estilo={fondo} />
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 150,
          width: "100%",
          textAlign: "center",
          opacity: titulo,
          transform: `translateY(${(1 - titulo) * -30}px)`,
        }}
      >
        <div style={{ fontSize: 58, fontWeight: 800, color: "white" }}>
          Segmentación de Cobranzas
        </div>
        <div
          style={{
            fontSize: 24,
            fontWeight: 500,
            letterSpacing: 4,
            color: ACENTO,
            textTransform: "uppercase",
            marginTop: 6,
          }}
        >
          Saldo × Mora × Score
        </div>
      </div>
      {/* Axes legend */}
      <div
        style={{
          position: "absolute",
          left: 100,
          top: 330,
          opacity: leyenda,
          fontSize: 18,
          fontWeight: 500,
          color: TEXTO_2,
          lineHeight: 1.7,
          background: "rgba(22,24,29,0.6)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 14,
          padding: "10px 16px",
        }}
      >
        <div>X → Saldo de deuda</div>
        <div>Y ↑ Días de mora</div>
        <div>Z ⊙ Score</div>
      </div>
      {/* Cube */}
      <div
        style={{
          position: "absolute",
          left: 540,
          top: CUBO_Y,
          perspective: 1800,
          transformStyle: "preserve-3d",
        }}
      >
        <div
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateX(${giroX}deg) rotateY(${giroY}deg)`,
          }}
        >
          {VOXELES.map((v) => (
            <Voxel
              key={`${v.x}-${v.y}-${v.z}`}
              {...v}
              apertura={apertura}
              foco={foco}
            />
          ))}
        </div>
      </div>
      {ORDEN.map((id, i) => (
        <Card key={id} id={id} i={i} />
      ))}
    </AbsoluteFill>
  );
};
