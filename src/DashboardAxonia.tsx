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

// Credit dashboard on the animated background (1080x1920, 10s).
// Cards slide in and their charts grow to a first set of values; at CAMBIO
// the data updates (more approvals, less delinquency) and every chart
// animates to the second set.

export const dashboardSchema = z.object({
  fondo: z.enum(["ondas", "red", "aurora", "geometrico"]),
  paleta: z.enum(["azul", "gris"]),
});

const FUENTE = "Montserrat, sans-serif";
const TEXTO = "#ffffff";
const TEXTO_2 = "#b8bcc4";
const TEXTO_3 = "#8a8f98";
const GRILLA = "rgba(255,255,255,0.08)";
// Data marks: validated dark-surface steps (blue, orange) and the status
// palette for ordered risk / delinquency states, always shown with labels.
const SERIE_AZUL = "#3987e5";
const SERIE_NARANJA = "#d95926";
const NEUTRO = "#5b606b";
const ESTADO = {
  bueno: "#0ca30c",
  alerta: "#fab219",
  serio: "#ec835a",
  critico: "#e66767",
};

const CAMBIO = 165;
// Scale applied to the whole dashboard to leave margins around it.
const ESCALA = 0.74;
// Content moves down under the title block.
const BAJADA = 90;
const ACENTO = "#FF8C42";
const MARGEN = 40;
const ANCHO = 1080 - MARGEN * 2;
const GAP = 24;
const MITAD = (ANCHO - GAP) / 2;

// Progress 0..1 of an animation that starts at `desde` and lasts `dur`.
const avance = (frame: number, desde: number, dur: number) =>
  interpolate(frame, [desde, desde + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

// Value that grows from 0 to v1 when the card appears and moves to v2 at
// the data update.
const valor = (frame: number, v1: number, v2: number, desde: number) =>
  v1 * avance(frame, desde, 45) +
  (v2 - v1) *
    interpolate(frame, [CAMBIO, CAMBIO + 50], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.cubic),
    });

const miles = (n: number) => Math.round(n).toLocaleString("es-AR");
const decimal = (n: number, d = 1) =>
  n.toLocaleString("es-AR", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });

const Tarjeta: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  titulo: string;
  retraso: number;
  children: React.ReactNode;
}> = ({ x, y, w, h, titulo, retraso, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entrada = spring({
    frame: frame - retraso,
    fps,
    config: { damping: 16, stiffness: 90 },
  });
  // Border glow in the brand orange (#FF8C42) when the data updates.
  const destello = interpolate(
    frame,
    [CAMBIO, CAMBIO + 10, CAMBIO + 45],
    [0, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: 22,
        background: "rgba(22,24,29,0.62)",
        border: `2px solid rgba(255,255,255,${0.14 + destello * 0.2})`,
        boxShadow: `0 10px 30px rgba(0,0,0,0.35), 0 0 ${destello * 28}px rgba(255,140,66,${destello * 0.45})`,
        backdropFilter: "blur(16px)",
        opacity: entrada,
        transform: `translateY(${(1 - entrada) * 80}px) scale(${0.94 + entrada * 0.06})`,
        fontFamily: FUENTE,
        color: TEXTO,
        padding: "22px 26px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: 1.5,
          color: TEXTO_2,
          textTransform: "uppercase",
        }}
      >
        {titulo}
      </div>
      {children}
    </div>
  );
};

const Kpi: React.FC<{
  x: number;
  y: number;
  retraso: number;
  titulo: string;
  v1: number;
  v2: number;
  formato: (n: number) => string;
  variacion: string;
}> = ({ x, y, retraso, titulo, v1, v2, formato, variacion }) => {
  const frame = useCurrentFrame();
  const v = valor(frame, v1, v2, retraso + 10);
  const badge = avance(frame, CAMBIO + 30, 20);
  return (
    <Tarjeta x={x} y={y} w={MITAD} h={150} titulo={titulo} retraso={retraso}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginTop: 14,
        }}
      >
        <div style={{ fontSize: 54, fontWeight: 800, letterSpacing: -1 }}>
          {formato(v)}
        </div>
        {/* Change badge: arrow + text + status color, never color alone */}
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: ESTADO.bueno,
            background: "rgba(12,163,12,0.14)",
            borderRadius: 999,
            padding: "6px 14px",
            opacity: badge,
            transform: `translateY(${(1 - badge) * 10}px)`,
          }}
        >
          {variacion}
        </div>
      </div>
    </Tarjeta>
  );
};

const MESES = [
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
];
const ALTAS_1 = [40, 55, 70, 60, 85, 120, 160, 260, 420, 650, 1080, 880];
const ALTAS_2 = [40, 55, 70, 60, 85, 120, 160, 260, 420, 720, 1180, 1340];

const AltasPorMes: React.FC<{ y: number; retraso: number }> = ({
  y,
  retraso,
}) => {
  const frame = useCurrentFrame();
  const W = ANCHO - 52;
  const H = 280;
  const IZQ = 64;
  const MAX = 1500;
  const ancho = (W - IZQ) / MESES.length;
  const yDe = (v: number) => H - (v / MAX) * H;
  const ultimo = valor(frame, ALTAS_1[11], ALTAS_2[11], retraso + 12 + 11 * 3);

  return (
    <Tarjeta
      x={MARGEN}
      y={y}
      w={ANCHO}
      h={420}
      titulo="Altas por mes · operaciones"
      retraso={retraso}
    >
      <svg
        width={W}
        height={H + 44}
        style={{ marginTop: 20, overflow: "visible" }}
      >
        {[0, 500, 1000, 1500].map((t) => (
          <g key={t}>
            <line
              x1={IZQ}
              x2={W}
              y1={yDe(t)}
              y2={yDe(t)}
              stroke={GRILLA}
              strokeWidth={1.5}
            />
            <text
              x={IZQ - 12}
              y={yDe(t) + 6}
              fill={TEXTO_3}
              fontSize={17}
              textAnchor="end"
            >
              {miles(t)}
            </text>
          </g>
        ))}
        {MESES.map((m, i) => {
          const v = valor(frame, ALTAS_1[i], ALTAS_2[i], retraso + 12 + i * 3);
          const x = IZQ + i * ancho + 3;
          const w = ancho - 6;
          const top = yDe(v);
          const r = Math.min(4, H - top);
          return (
            <g key={m}>
              {/* 4px rounded top, square at the baseline */}
              <path
                d={`M ${x} ${H} L ${x} ${top + r} Q ${x} ${top} ${x + r} ${top} L ${x + w - r} ${top} Q ${x + w} ${top} ${x + w} ${top + r} L ${x + w} ${H} Z`}
                fill={SERIE_AZUL}
                opacity={i === 11 ? 1 : 0.75}
              />
              <text
                x={x + w / 2}
                y={H + 30}
                fill={TEXTO_3}
                fontSize={17}
                textAnchor="middle"
              >
                {m}
              </text>
            </g>
          );
        })}
        {/* Direct label on the latest month only */}
        <text
          x={IZQ + 11 * ancho + ancho / 2}
          y={yDe(ultimo) - 12}
          fill={TEXTO}
          fontSize={22}
          fontWeight={700}
          textAnchor="middle"
          opacity={avance(frame, retraso + 40, 15)}
        >
          {miles(ultimo)}
        </text>
      </svg>
    </Tarjeta>
  );
};

const BarrasHorizontales: React.FC<{
  x: number;
  y: number;
  retraso: number;
  titulo: string;
  filas: { etiqueta: string; v1: number; v2: number; color: string }[];
  max: number;
  formato: (n: number) => string;
  h: number;
}> = ({ x, y, retraso, titulo, filas, max, formato, h }) => {
  const frame = useCurrentFrame();
  const W = MITAD - 52;
  const ETQ = 110;
  const VAL = 80;
  const pista = W - ETQ - VAL;
  return (
    <Tarjeta x={x} y={y} w={MITAD} h={h} titulo={titulo} retraso={retraso}>
      <div
        style={{
          marginTop: 34,
          display: "flex",
          flexDirection: "column",
          gap: 30,
        }}
      >
        {filas.map((f, i) => {
          const v = valor(frame, f.v1, f.v2, retraso + 12 + i * 4);
          return (
            <div
              key={f.etiqueta}
              style={{ display: "flex", alignItems: "center" }}
            >
              <div
                style={{
                  width: ETQ,
                  fontSize: 20,
                  fontWeight: 500,
                  color: TEXTO_2,
                }}
              >
                {f.etiqueta}
              </div>
              <div
                style={{
                  width: pista,
                  height: 26,
                  borderRadius: 6,
                  background: GRILLA,
                }}
              >
                <div
                  style={{
                    width: `${(v / max) * 100}%`,
                    height: "100%",
                    borderRadius: 6,
                    background: f.color,
                  }}
                />
              </div>
              <div
                style={{
                  width: VAL,
                  textAlign: "right",
                  fontSize: 21,
                  fontWeight: 700,
                }}
              >
                {formato(v)}
              </div>
            </div>
          );
        })}
      </div>
    </Tarjeta>
  );
};

const EstadoMora: React.FC<{ x: number; y: number; retraso: number }> = ({
  x,
  y,
  retraso,
}) => {
  const frame = useCurrentFrame();
  const barras = [
    { etiqueta: "Al día", v1: 70.1, v2: 81.6, color: ESTADO.bueno },
    { etiqueta: "1-30", v1: 14.8, v2: 10.2, color: ESTADO.alerta },
    { etiqueta: "31-90", v1: 9.4, v2: 5.3, color: ESTADO.serio },
    { etiqueta: "90+", v1: 5.7, v2: 2.9, color: ESTADO.critico },
  ];
  const W = MITAD - 52;
  const H = 230;
  const ancho = W / barras.length;
  return (
    <Tarjeta
      x={x}
      y={y}
      w={MITAD}
      h={390}
      titulo="Estado de mora · %"
      retraso={retraso}
    >
      <svg
        width={W}
        height={H + 40}
        style={{ marginTop: 24, overflow: "visible" }}
      >
        <line x1={0} x2={W} y1={H} y2={H} stroke={GRILLA} strokeWidth={1.5} />
        {barras.map((b, i) => {
          const v = valor(frame, b.v1, b.v2, retraso + 12 + i * 4);
          const h = (v / 100) * (H - 36);
          const bx = i * ancho + 14;
          const bw = ancho - 28;
          const r = Math.min(4, h);
          return (
            <g key={b.etiqueta}>
              <path
                d={`M ${bx} ${H} L ${bx} ${H - h + r} Q ${bx} ${H - h} ${bx + r} ${H - h} L ${bx + bw - r} ${H - h} Q ${bx + bw} ${H - h} ${bx + bw} ${H - h + r} L ${bx + bw} ${H} Z`}
                fill={b.color}
              />
              <text
                x={bx + bw / 2}
                y={H - h - 10}
                fill={TEXTO}
                fontSize={20}
                fontWeight={700}
                textAnchor="middle"
              >
                {decimal(v)}
              </text>
              <text
                x={bx + bw / 2}
                y={H + 30}
                fill={TEXTO_2}
                fontSize={18}
                textAnchor="middle"
              >
                {b.etiqueta}
              </text>
            </g>
          );
        })}
      </svg>
    </Tarjeta>
  );
};

const Aprobacion: React.FC<{ x: number; y: number; retraso: number }> = ({
  x,
  y,
  retraso,
}) => {
  const frame = useCurrentFrame();
  const pct = valor(frame, 63.0, 71.8, retraso + 12);
  const R = 105;
  const C = 2 * Math.PI * R;
  const W = MITAD - 52;
  return (
    <Tarjeta
      x={x}
      y={y}
      w={MITAD}
      h={340}
      titulo="Tasa de aprobación"
      retraso={retraso}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 4,
        }}
      >
        <svg width={W} height={260}>
          <g transform={`translate(${W / 2 - 60} 130) rotate(-90)`}>
            <circle r={R} fill="none" stroke={NEUTRO} strokeWidth={26} />
            <circle
              r={R}
              fill="none"
              stroke={SERIE_AZUL}
              strokeWidth={26}
              strokeDasharray={`${(pct / 100) * C} ${C}`}
            />
          </g>
          <text
            x={W / 2 - 60}
            y={140}
            fill={TEXTO}
            fontSize={46}
            fontWeight={800}
            textAnchor="middle"
          >
            {decimal(pct)}%
          </text>
          {/* Legend: two series, color swatch + label */}
          {[
            { etiqueta: "Aprobados", color: SERIE_AZUL },
            { etiqueta: "Rechazados", color: NEUTRO },
          ].map((l, i) => (
            <g
              key={l.etiqueta}
              transform={`translate(${W / 2 + 80} ${105 + i * 40})`}
            >
              <rect width={16} height={16} rx={4} fill={l.color} />
              <text x={26} y={14} fill={TEXTO_2} fontSize={18}>
                {l.etiqueta}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </Tarjeta>
  );
};

const Titulo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = spring({ frame, fps, config: { damping: 18 } });
  return (
    <div
      style={{
        position: "absolute",
        top: 190,
        width: "100%",
        textAlign: "center",
        fontFamily: FUENTE,
        opacity: t,
        transform: `translateY(${(1 - t) * -30}px)`,
      }}
    >
      <div style={{ fontSize: 62, fontWeight: 800, color: "white" }}>
        Dashboard y KPIs
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
        En tiempo real
      </div>
    </div>
  );
};

export const DashboardAxonia: React.FC<z.infer<typeof dashboardSchema>> = ({
  fondo,
  paleta,
}) => {
  // Rows: 2 KPI rows (150), monthly chart (420), two chart rows (390, 340),
  // 24px gaps, centered vertically.
  const y0 = 187;
  const col2 = MARGEN + MITAD + GAP;
  return (
    <AbsoluteFill>
      <FondoAbstracto paleta={paleta} estilo={fondo} />
      <Titulo />
      {/* Content scaled around the center (and moved down under the title)
          for wide margins on all sides. */}
      <AbsoluteFill
        style={{
          transform: `translateY(${BAJADA}px) scale(${ESCALA})`,
          transformOrigin: "50% 50%",
        }}
      >
        <Kpi
          x={MARGEN}
          y={y0}
          retraso={0}
          titulo="Total evaluados"
          v1={4783}
          v2={6120}
          formato={miles}
          variacion="▲ 28%"
        />
        <Kpi
          x={col2}
          y={y0}
          retraso={5}
          titulo="Tasa de aprobación"
          v1={63}
          v2={71.8}
          formato={(n) => `${decimal(n)}%`}
          variacion="▲ 8,8 pp"
        />
        <Kpi
          x={MARGEN}
          y={y0 + 174}
          retraso={10}
          titulo="Capital otorgado"
          v1={594.1}
          v2={712.6}
          formato={(n) => `$${decimal(n)} M`}
          variacion="▲ 20%"
        />
        <Kpi
          x={col2}
          y={y0 + 174}
          retraso={15}
          titulo="Cartera en mora"
          v1={29.9}
          v2={18.4}
          formato={(n) => `${decimal(n)}%`}
          variacion="▼ 11,5 pp"
        />
        <AltasPorMes y={y0 + 348} retraso={22} />
        <BarrasHorizontales
          x={MARGEN}
          y={y0 + 792}
          retraso={30}
          titulo="Distribución por riesgo · %"
          filas={[
            { etiqueta: "A", v1: 8, v2: 18, color: ESTADO.bueno },
            { etiqueta: "B", v1: 15, v2: 27, color: ESTADO.alerta },
            { etiqueta: "C", v1: 22, v2: 25, color: ESTADO.serio },
            { etiqueta: "D", v1: 55, v2: 30, color: ESTADO.critico },
          ]}
          max={60}
          h={390}
          formato={(n) => `${Math.round(n)}%`}
        />
        <EstadoMora x={col2} y={y0 + 792} retraso={36} />
        <Aprobacion x={MARGEN} y={y0 + 1206} retraso={44} />
        <BarrasHorizontales
          x={col2}
          y={y0 + 1206}
          retraso={50}
          titulo="Rechazos por servicio"
          filas={[
            { etiqueta: "BCRA", v1: 793, v2: 520, color: SERIE_NARANJA },
            { etiqueta: "Nosis", v1: 631, v2: 410, color: SERIE_NARANJA },
            { etiqueta: "Bases", v1: 343, v2: 260, color: SERIE_NARANJA },
          ]}
          max={850}
          h={340}
          formato={miles}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
