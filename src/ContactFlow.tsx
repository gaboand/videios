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
import "@fontsource/montserrat/500.css";
import "@fontsource/montserrat/700.css";
import "@fontsource/montserrat/800.css";
import { z } from "zod";
import { FondoAbstracto } from "./FondoAbstracto";
import { Dispositivo, exteriorDe, pantallaDe } from "./Dispositivos";

// Contact Flow (automatic dialer) on a straight landscape tablet (16:9, 30s):
// the home with the call room where a campaign starts and seats change
// state, the flow editor building a contact strategy, the campaign detail
// dialing, the case segmentation with its drill-down (category, outcome and
// list of cases), performance by time slot and the dashboard.

export const contactFlowSchema = z.object({
  fondo: z.enum(["ondas", "red", "aurora", "geometrico"]),
  paleta: z.enum(["azul", "gris"]),
});

export const CONTACTFLOW_FRAMES = 900;

const FUENTE = "Montserrat, sans-serif";
const NAVY = "#14284b";
const NAVY_SIDE = "#121a2e";
const TINTA = "#1f2430";
const TINTA_2 = "#6b7280";
const BORDE = "#e1e5ec";
const VERDE = "#1e8a4c";
const PW = 1180;
const PH = 820;
const HEADER = 50;
const SIDE = 50;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const ESC = {
  home: [0, 150],
  flujo: [146, 290],
  campana: [286, 420],
  segmentacion: [416, 600],
  franja: [596, 740],
  dashboard: [736, CONTACTFLOW_FRAMES + 10],
} as const;
type Escena = keyof typeof ESC;
const INICIO_CAMPANA = 10;
const TAP_ESTRATEGIAS = 134;
const TAP_CAMPANAS = 276;
const TAP_REPORTES = 406;
const TAP_CATEGORIA = 470;
const TAP_DESENLACE = 520;
const TAP_FRANJA = 584;
const TAP_DASH = 724;
const TAPS = [TAP_ESTRATEGIAS, TAP_CAMPANAS, TAP_REPORTES, TAP_CATEGORIA, TAP_DESENLACE, TAP_FRANJA, TAP_DASH];

const num = (n: number) => n.toLocaleString("es-AR");
const pesos = (n: number) => `$ ${n.toLocaleString("es-AR")}`;
const pct = (n: number, d = 1) => `${n.toFixed(d).replace(".", ",")}%`;
const pulsado = (frame: number, f: number) => interpolate(frame, [f, f + 4, f + 12], [0, 1, 0], clamp);
const sube = (frame: number, desde: number, dur = 30) => interpolate(frame, [desde, desde + dur], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });

const LOGO_W = 2028;
const LOGO_H = 693;
const Logo: React.FC<{ w: number }> = ({ w }) => (
  <div style={{ position: "relative", width: w, height: (w * LOGO_H) / LOGO_W }}>
    {["axonia-letras.png", "axonia-icono.png"].map((f) => (
      <Img key={f} src={staticFile(f)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    ))}
  </div>
);
const Icono: React.FC<{ d: string; s?: number; c?: string; w?: number }> = ({ d, s = 18, c = "white", w = 1.9 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24">
    <path d={d} fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const I_CAMPANA = "M12 9 A3 3 0 1 1 12 15 A3 3 0 1 1 12 9 M7 7 A7 7 0 0 0 7 17 M17 7 A7 7 0 0 1 17 17 M4 4 A11 11 0 0 0 4 20 M20 4 A11 11 0 0 1 20 20";
const I_FLUJO = "M4 5 H10 V9 H4 Z M14 15 H20 V19 H14 Z M14 5 H20 V9 H14 Z M10 7 H14 M7 9 V17 H14";
const I_REPORTE = "M12 3 A9 9 0 1 0 21 12 H12 Z M15 3.5 A9 9 0 0 1 20.5 9 H15 Z";
const I_SISTEMA = "M12 8 A4 4 0 1 1 12 16 A4 4 0 1 1 12 8 M12 2 V5 M12 19 V22 M2 12 H5 M19 12 H22";
const SIDE_ICONOS = [
  "M4 11 L12 4 L20 11 V20 H14 V14 H10 V20 H4 Z",
  I_CAMPANA,
  I_FLUJO,
  "M4 5 H20 V16 H9 L5 20 V16 H4 Z",
  "M4 16 A8 8 0 1 1 20 16 M12 16 L16 10",
  I_REPORTE,
  "M12 3 A9 9 0 1 1 12 21 A9 9 0 1 1 12 3 M12 7 V12 L15 14",
  "M9 7 A3 3 0 1 1 9 13 A3 3 0 1 1 9 7 M3 20 C4 16 14 16 15 20 M16 8 A2.5 2.5 0 1 1 16 13 M15 20 C16 17 20 17 21 20",
  "M12 8 V12 L15 15 M4 12 A8 8 0 1 0 6.5 6.3 M4 4 V8 H8",
  "M4 7 H20 M4 12 H20 M4 17 H20 M8 5 V9 M15 10 V14 M10 15 V19",
];
const ACTIVO: Record<Escena, number> = { home: 0, flujo: 2, campana: 1, segmentacion: 5, franja: 6, dashboard: 4 };

// ---------- Home: call room ----------
const ESTADOS = [
  { n: "Llamando", c: "#3b82f6" },
  { n: "En conversación", c: "#4ade80" },
  { n: "Agendado", c: "#15803d" },
  { n: "Reintento", c: "#fbbf24" },
  { n: "A búsqueda", c: "#f97316" },
];
// Seat states: -1 idle (gray), 0 calling (blue), 1 in conversation
// (green). Fixed during the shot except for two seats: one green goes idle
// and one idle starts calling.
const BASE_ASIENTOS = [
  -1, 0, 1, -1, -1, 1, 0, -1, 1, -1, -1, 1, 0, -1, 1,
  1, -1, -1, 0, 1, -1, 1, -1, -1, 0, 1, -1, -1, 1, -1,
  -1, 1, 0, -1, 1, -1, -1, 0,
  1, -1, -1, 1, 0, -1, 1, -1,
];
const CAMBIOS_ASIENTOS: Record<number, [number, number]> = { 8: [70, -1], 16: [104, 0] };
const estadoAsiento = (i: number, frame: number) =>
  i in CAMBIOS_ASIENTOS && frame >= CAMBIOS_ASIENTOS[i][0] ? CAMBIOS_ASIENTOS[i][1] : BASE_ASIENTOS[i];
const colorAsiento = (i: number, frame: number) => {
  const e = estadoAsiento(i, frame);
  return e < 0 ? null : ESTADOS[e].c;
};
// Desk with a monitor and a chair. Top-row desks have the chair above, the
// lower row below; side desks are the same desk turned 90 degrees.
// Desk with a monitor and a chair, filled with the color of its state (gray
// when idle). Top-row desks have the chair above, the lower row below; side
// desks are the same desk turned 90 degrees.
const Puesto: React.FC<{ color: string | null; giro?: number; arriba?: boolean }> = ({ color, giro = 0, arriba }) => {
  const fondo = color ?? "#b6bcc6";
  return (
    <div style={{ width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={44} height={44} viewBox="0 0 44 44" style={{ transform: `rotate(${giro}deg)` }}>
        {arriba ? <rect x={11} y={1} width={22} height={7} rx={3.5} fill="#d6dbe2" /> : <rect x={11} y={36} width={22} height={7} rx={3.5} fill="#d6dbe2" />}
        <rect x={2} y={arriba ? 9 : 7} width={40} height={27} rx={5} fill={fondo} stroke="rgba(0,0,0,0.18)" />
        <rect x={11} y={arriba ? 13 : 11} width={22} height={12} rx={2} fill="rgba(255,255,255,0.85)" />
        <rect x={16} y={arriba ? 28 : 26} width={12} height={3} rx={1.5} fill="rgba(255,255,255,0.7)" />
      </svg>
    </div>
  );
};

const Home: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const panel = spring({ frame: frame - INICIO_CAMPANA, fps, config: { damping: 16 } });
  const tiles: [string, string, string][] = [
    ["Campañas", "Gestión y seguimiento de campañas de llamadas", I_CAMPANA],
    ["Estrategias", "Flujos de contacto y plantillas de mensajes", I_FLUJO],
    ["Reportes", "Segmentación de casos e indicadores de gestión", I_REPORTE],
    ["Sistemas", "Usuarios, permisos, parámetros y control de cambios", I_SISTEMA],
  ];
  const fila = (y: number, desde: number, arriba: boolean) =>
    [0, 1, 2].map((g) => (
      <div key={`${y}-${g}`} style={{ position: "absolute", left: 119 + g * 290, top: y, display: "flex", gap: 8 }}>
        {[0, 1, 2, 3, 4].map((k) => {
          const i = desde + g * 5 + k;
          return <Puesto key={k} arriba={arriba} color={colorAsiento(i, frame)} />;
        })}
      </div>
    ));
  return (
    <div style={{ position: "absolute", left: SIDE, top: HEADER, right: 0, bottom: 0, background: "#eef1f5" }}>
      <div style={{ position: "absolute", left: 28, top: 18, fontSize: 21, fontWeight: 800, color: TINTA, borderLeft: `3px solid ${TINTA}`, paddingLeft: 10 }}>Contact Flow</div>
      {tiles.map(([t, d, ic], i) => (
        <div key={t} style={{ position: "absolute", left: 60 + i * 258, top: 62, width: 242, height: 96, background: "white", borderRadius: 10, boxShadow: "0 2px 8px rgba(20,30,50,0.06)", padding: "12px 14px", boxSizing: "border-box", transform: `scale(${i === 1 ? 1 - pulsado(frame, TAP_ESTRATEGIAS) * 0.04 : 1})` }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: NAVY, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icono d={ic} s={17} />
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 800, color: TINTA, marginTop: 8 }}>{t}</div>
          <div style={{ fontSize: 9.5, color: TINTA_2, marginTop: 3 }}>{d}</div>
        </div>
      ))}
      {/* Room */}
      <div style={{ position: "absolute", left: 30, top: 186, width: 1070, height: 424, background: "#6b7280", borderRadius: 16 }}>
        {fila(18, 0, true)}
        {[0, 1, 2].map((g) => (
          <div key={g} style={{ position: "absolute", left: 119 + g * 290, top: 70, width: 252, height: 3, background: "#1f2937", borderRadius: 2 }} />
        ))}
        {fila(84, 15, false)}
        {[0, 1].map((lado) => (
          <div key={lado} style={{ position: "absolute", left: lado ? 958 : 24, top: 156, display: "flex", gap: 22 }}>
            {[0, 1].map((col) => (
              <div key={col} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[0, 1, 2, 3].map((r) => {
                  const i = 30 + lado * 8 + col * 4 + r;
                  return <Puesto key={r} giro={col === 0 ? -90 : 90} arriba color={colorAsiento(i, frame)} />;
                })}
              </div>
            ))}
            <div style={{ position: "absolute", left: 53, top: 0, width: 3, height: 212, background: "#1f2937", borderRadius: 2 }} />
          </div>
        ))}
        {/* Center panel */}
        <div style={{ position: "absolute", left: 160, top: 152, width: 750, height: 236, background: "#4b5563", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ position: "absolute", right: 14, top: 10, fontSize: 9, color: "#d1d5db", display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80" }} />
            Estado en vivo · Actualizado 10:{String(15 + Math.floor(frame / 30)).padStart(2, "0")}
          </div>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: 1 - panel }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "white" }}>Sin campañas activas</div>
            <div style={{ fontSize: 11, color: "#d1d5db", marginTop: 4 }}>Contact Flow está en reposo</div>
          </div>
          {panel > 0.01 ? (
            <div style={{ position: "absolute", inset: 0, padding: "24px 30px", opacity: panel }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 9.5, fontWeight: 800, color: "#052e16", background: "#4ade80", borderRadius: 10, padding: "3px 9px" }}>EN CURSO</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: "white" }}>MORA TEMPRANA NOVIEMBRE</span>
              </div>
              <div style={{ display: "flex", gap: 14, marginTop: 20 }}>
                {[
                  ["Llamados", num(1248)],
                  ["En conversación", "15"],
                  ["Llamando", "8"],
                  ["Contactabilidad", pct(21.3)],
                ].map(([k, v]) => (
                  <div key={k} style={{ flex: 1, background: "rgba(255,255,255,0.08)", borderRadius: 9, padding: "12px 14px" }}>
                    <div style={{ fontSize: 9.5, color: "#d1d5db" }}>{k}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "white", marginTop: 4 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 18, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.12)" }}>
                <div style={{ width: "38%", height: "100%", borderRadius: 4, background: "#3b82f6" }} />
              </div>
              <div style={{ fontSize: 9.5, color: "#d1d5db", marginTop: 6 }}>Avance de la campaña · 46 agentes virtuales</div>
            </div>
          ) : null}
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 628, display: "flex", justifyContent: "center", gap: 22 }}>
        {[{ n: "Disponible", c: "#b6bcc6" }, ...ESTADOS].map((e) => (
          <div key={e.n} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10.5, color: TINTA }}>
            <div style={{ width: 14, height: 12, borderRadius: 3, background: e.c }} />
            {e.n}
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------- Flow editor ----------
type NodoFlujo = { t: string; x: number; y: number; w: number; h: number; tipo: "inicio" | "accion" | "decision" | "fin" | "rombo"; c?: string };
const NF: NodoFlujo[] = [
  { t: "Inicio", x: 300, y: 330, w: 96, h: 78, tipo: "inicio" },
  { t: "Primer llamado", x: 440, y: 344, w: 130, h: 50, tipo: "accion", c: "#3b82f6" },
  { t: "¿Cómo salió?", x: 610, y: 340, w: 130, h: 58, tipo: "decision", c: "#8b5cf6" },
  { t: "Contactado", x: 770, y: 210, w: 130, h: 48, tipo: "fin" },
  { t: "¿Tiene email?", x: 780, y: 300, w: 140, h: 140, tipo: "rombo" },
  { t: "Cerrado", x: 790, y: 470, w: 130, h: 48, tipo: "fin" },
  { t: "Link al bot", x: 950, y: 290, w: 120, h: 46, tipo: "accion", c: "#fbbf24" },
  { t: "Reintento", x: 960, y: 410, w: 120, h: 46, tipo: "accion", c: "#3b82f6" },
];
const AF: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [2, 4],
  [2, 5],
  [4, 6],
  [4, 7],
];
const anclaDer = (n: NodoFlujo) => ({ x: n.x + n.w, y: n.y + n.h / 2 });
const anclaIzq = (n: NodoFlujo) => ({ x: n.x, y: n.y + n.h / 2 });
const NODOS_PALETA: [string, string][] = [
  ["Inicio", "M7 5 L19 12 L7 19 Z"],
  ["Llamar", "M5 4 L9 4 L11 9 L8.5 10.5 C9.5 13 11 14.5 13.5 15.5 L15 13 L20 15 L20 19 C12 19 5 12 5 4 Z"],
  ["Según el resultado", "M6 6 A2 2 0 1 1 6 10 A2 2 0 1 1 6 6 M18 4 A2 2 0 1 1 18 8 M18 16 A2 2 0 1 1 18 20 M8 8 L16 6 M8 8 L16 18"],
  ["Decisión", "M6 4 V12 M6 12 C6 16 12 16 18 12 M18 4 V12"],
  ["Etiquetar", "M4 4 H12 L20 12 L12 20 L4 12 Z"],
  ["Comentario", "M4 5 H20 V16 H9 L5 20 V16 H4 Z"],
  ["Fin", "M5 4 V20 M5 4 H17 L14 8 L17 12 H5"],
  ["Enviar SMS", "M4 5 H20 V16 H9 L5 20 V16 H4 Z M8 10 H16"],
  ["Enviar email", "M3 6 H21 V18 H3 Z M3 6 L12 13 L21 6"],
  ["Link al bot de chat", "M5 6 H15 V13 H9 L6 16 V13 H5 Z M17 9 H20 V16 H19 V19 L16 16 H11"],
];
const Flujo: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const f0 = ESC.flujo[0];
  const aparece = (i: number) => spring({ frame: frame - f0 - 10 - i * 9, fps, config: { damping: 14, stiffness: 140 } });
  return (
    <div style={{ position: "absolute", left: SIDE, top: HEADER, right: 0, bottom: 0, background: "#eef1f5" }}>
      <div style={{ position: "absolute", left: 14, top: 14, width: 220, bottom: 14, background: "white", borderRadius: 8, padding: 12, boxSizing: "border-box" }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: TINTA }}>Nodos del flujo</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 10 }}>
          {NODOS_PALETA.map(([n, d]) => (
            <div key={n} style={{ height: 36, borderRadius: 6, background: "#dbeafe", display: "flex", alignItems: "center", gap: 6, padding: "0 7px", fontSize: 9, fontWeight: 700, color: TINTA, lineHeight: 1.1 }}>
              <Icono d={d} s={14} c="#1d4ed8" w={2} />
              {n}
            </div>
          ))}
        </div>
        {[
          ["Nuevo flujo", "#15803d"],
          ["Guardar", "#2563eb"],
          ["Publicar", "#15803d"],
          ["Limpiar canvas", "#6b7280"],
        ].map(([t, c]) => (
          <div key={t} style={{ height: 30, borderRadius: 6, background: c, color: "white", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 8 }}>
            {t}
          </div>
        ))}
        <div style={{ marginTop: 14, padding: 10, background: "#f6f7fa", borderRadius: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: TINTA }}>Flujo activo</div>
          <div style={{ fontSize: 10, color: TINTA, marginTop: 4 }}>Llamado + link al bot de chat</div>
          <div style={{ fontSize: 9.5, color: TINTA_2 }}>v1 publicado</div>
          <div style={{ marginTop: 8, fontSize: 10, fontWeight: 700, color: VERDE, border: "1px solid #b9e0c8", background: "#eef8f1", borderRadius: 6, padding: "6px 8px", opacity: interpolate(frame, [f0 + 90, f0 + 100], [0, 1], clamp) }}>✓ El flujo está completo</div>
        </div>
      </div>
      {/* Canvas */}
      <div style={{ position: "absolute", left: 248, top: 14, right: 14, bottom: 14, borderRadius: 8, background: "#a3a8b0", backgroundImage: "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)", backgroundSize: "18px 18px", overflow: "hidden" }}>
        <svg width={PW} height={PH} style={{ position: "absolute", left: -248 - SIDE + SIDE, top: -14, overflow: "visible" }}>
          {AF.map(([a, b], k) => {
            const p = interpolate(frame, [f0 + 18 + b * 9, f0 + 30 + b * 9], [0, 1], clamp);
            const A = anclaDer(NF[a]);
            const B = anclaIzq(NF[b]);
            const mx = (A.x + B.x) / 2;
            return <path key={k} d={`M ${A.x} ${A.y} C ${mx} ${A.y} ${mx} ${B.y} ${B.x} ${B.y}`} fill="none" stroke="#3f4652" strokeWidth={2} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />;
          })}
        </svg>
        {NF.map((n, i) => {
          const t = aparece(i);
          const base: React.CSSProperties = { position: "absolute", left: n.x - 248, top: n.y - 14, width: n.w, height: n.h, opacity: Math.min(1, t * 1.4), transform: `scale(${0.7 + 0.3 * t})`, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 10.5, fontWeight: 700, boxSizing: "border-box" };
          if (n.tipo === "inicio") {
            return <div key={n.t} style={{ ...base, borderRadius: "50%", background: "#15803d", border: "2px solid #14532d" }}>{n.t}</div>;
          }
          if (n.tipo === "rombo") {
            return (
              <div key={n.t} style={base}>
                <div style={{ position: "absolute", width: n.w * 0.7, height: n.h * 0.7, background: "#215d7a", border: "2px solid #1e3a8a", transform: "rotate(45deg)" }} />
                <span style={{ position: "relative" }}>{n.t}</span>
              </div>
            );
          }
          return (
            <div key={n.t} style={{ ...base, borderRadius: 6, background: n.tipo === "fin" ? "#374151" : "#2b2f36", overflow: "hidden", boxShadow: "0 4px 10px rgba(0,0,0,0.25)" }}>
              {n.c ? <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 12, background: n.c }} /> : null}
              <span style={{ paddingLeft: n.c ? 10 : 0 }}>{n.t}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------- Campaign detail ----------
const RESULTADOS: [string, string, number, string, number][] = [
  ["Compromiso logrado", "#16a34a", 41, "Agendado", 26],
  ["Contacto sin cierre", "#22c55e", 18, "Conversación completa", 11],
  ["Se dejó mensaje", "#8b5cf6", 1018, "Se dejó mensaje", 1018],
  ["Negativa del deudor", "#f97316", 52, "Rechazó la gestión", 41],
  ["Contacto con tercero", "#3b82f6", 6, "Atendió un tercero", 6],
  ["No contesta", "#fbbf24", 214, "Sin respuesta de la red", 92],
  ["Búsqueda de datos", "#ef4444", 712, "Apagado o sin señal", 668],
  ["Errores técnicos", "#6b7280", 39, "Sin clasificar", 39],
];
const TOTAL_CAMPANA = 2100;
const Campana: React.FC<{ frame: number }> = ({ frame }) => {
  const f0 = ESC.campana[0];
  const avance = sube(frame, f0 + 14, 70);
  return (
    <div style={{ position: "absolute", left: SIDE, top: HEADER, right: 0, bottom: 0, background: "#eef1f5" }}>
      <div style={{ position: "absolute", left: 90, top: 16, fontSize: 11, color: TINTA_2 }}>← Volver a campañas</div>
      <div style={{ position: "absolute", left: 90, top: 36, fontSize: 22, fontWeight: 800, color: TINTA }}>MORA TEMPRANA NOVIEMBRE</div>
      <div style={{ position: "absolute", left: 90, top: 70, display: "flex", gap: 10, alignItems: "center" }}>
        <span style={{ fontSize: 10, fontWeight: 800, color: avance >= 1 ? VERDE : "#1d4ed8", background: avance >= 1 ? "#dcf3e3" : "#dbeafe", borderRadius: 9, padding: "3px 9px" }}>{avance >= 1 ? "TERMINADA" : "EN CURSO"}</span>
        <span style={{ fontSize: 11, color: TINTA_2 }}>· Intervalo 15 s</span>
      </div>
      <div style={{ position: "absolute", right: 70, top: 34, border: `1px solid ${BORDE}`, background: "white", borderRadius: 7, fontSize: 12, fontWeight: 700, color: TINTA, padding: "9px 14px" }}>Métricas</div>
      <div style={{ position: "absolute", left: 90, right: 70, top: 104, height: 52, background: "#f0f7ff", border: "1px solid #bfdbfe", borderRadius: 9, display: "flex", alignItems: "center", gap: 12, padding: "0 14px" }}>
        <div style={{ width: 30, height: 30, borderRadius: 7, background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icono d="M12 4 A8 8 0 1 1 12 20 A8 8 0 1 1 12 4 M12 8 V12 L15 14" s={17} />
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#1e3a8a" }}>Programación activa</div>
          <div style={{ fontSize: 10.5, color: "#1e40af" }}>Lun a Vie 09:00–20:00 · Sáb 09:00–13:00 (AR)</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 90, right: 70, top: 168, height: 82, background: "white", borderRadius: 10, padding: "12px 18px", boxSizing: "border-box" }}>
        <div style={{ display: "flex" }}>
          {[
            ["Casos en campaña", num(TOTAL_CAMPANA), ""],
            ["Discados", num(Math.round(TOTAL_CAMPANA * avance)), pct(100 * avance, 0)],
            ["Pendientes", num(Math.round(TOTAL_CAMPANA * (1 - avance))), pct(100 * (1 - avance), 0)],
            ["Sin datos", "0", "0%"],
            ["En curso", num(avance < 1 ? 46 : 0), ""],
          ].map(([k, v, s]) => (
            <div key={k} style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: TINTA_2 }}>{k}</div>
              <div style={{ fontSize: 19, fontWeight: 800, color: TINTA }}>
                {v} <span style={{ fontSize: 10, fontWeight: 500, color: TINTA_2 }}>{s}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ height: 7, borderRadius: 4, background: "#e5e7eb", marginTop: 8 }}>
          <div style={{ width: `${avance * 100}%`, height: "100%", borderRadius: 4, background: "#1f6f86" }} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 90, top: 266, fontSize: 14, fontWeight: 800, color: TINTA }}>Resultados</div>
      <div style={{ position: "absolute", left: 90, right: 70, top: 292, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {RESULTADOS.map(([n, c, v, sub, sv], i) => {
          const t = sube(frame, f0 + 20 + i * 3, 60) * avance;
          return (
            <div key={n} style={{ height: 150, background: "white", borderRadius: 10, border: `1px solid ${BORDE}`, padding: "12px 14px", boxSizing: "border-box", opacity: interpolate(frame, [f0 + 8 + i * 3, f0 + 16 + i * 3], [0, 1], clamp) }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 800, color: TINTA }}>
                <div style={{ width: 7, height: 7, borderRadius: 2, background: c }} />
                {n}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 6 }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: TINTA }}>{num(Math.round(v * t))}</span>
                <span style={{ fontSize: 11, color: TINTA_2 }}>{pct((v / TOTAL_CAMPANA) * 100)}</span>
              </div>
              <div style={{ height: 4, borderRadius: 2, background: "#e5e7eb", marginTop: 6 }}>
                <div style={{ width: `${(v / TOTAL_CAMPANA) * 100 * t}%`, minWidth: 4, height: "100%", borderRadius: 2, background: "#1f6f86" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: TINTA, marginTop: 10 }}>
                <span>{sub}</span>
                <b>{num(Math.round(sv * t))}</b>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------- Segmentation with drill-down ----------
const CATEGORIAS: [string, string, number, string, number][] = [
  ["Compromiso logrado", "#16a34a", 357, "Agendado", 257],
  ["Contacto sin cierre", "#22c55e", 594, "Conversación completa", 411],
  ["Se dejó mensaje", "#8b5cf6", 15170, "Se dejó mensaje", 15170],
  ["Negativa del deudor", "#f97316", 1025, "Rechazó la gestión", 969],
  ["Contacto con tercero", "#3b82f6", 108, "Atendió un tercero", 108],
  ["No contesta", "#fbbf24", 7676, "Sin respuesta de la red", 5337],
  ["Búsqueda de datos", "#ef4444", 23961, "Apagado o sin señal", 19275],
  ["Errores técnicos", "#6b7280", 1118, "Falla técnica", 684],
];
const TOTAL_SEG = 50009;
const DESENLACES: [string, number][] = [
  ["Agendado", 257],
  ["Promesa de pago", 62],
  ["Transferido a un representante", 23],
  ["Dice que ya pagó", 15],
];
const CASOS: [string, string, string, string, number, number, string, number][] = [
  ["10/11/2026 17:31", "20518734", "Lucía Fernanda Paz", "+54935185XXXXX", 1283772, 400, "25/11/2026", 1283772],
  ["10/11/2026 17:14", "31846290", "Tomás Ignacio Ríos", "+54935134XXXXX", 120440, 118, "20/11/2026", 120440],
  ["10/11/2026 12:56", "27405816", "Carla Daniela Ortiz", "+54935175XXXXX", 153054, 72, "17/11/2026", 153054],
  ["10/11/2026 12:53", "35627409", "Federico Martín Sosa", "+54935484XXXXX", 305020, 365, "21/11/2026", 305020],
  ["10/11/2026 11:56", "38902154", "Micaela Belén Acosta", "+54938045XXXXX", 15097, 173, "10/11/2026", 15097],
  ["10/11/2026 11:22", "29176433", "Hernán Pablo Medina", "+54926170XXXXX", 1320260, 89, "10/11/2026", 1320260],
  ["10/11/2026 10:42", "42316587", "Agustina Sol Ferreyra", "+54938553XXXXX", 77917, 103, "20/11/2026", 77917],
  ["10/11/2026 10:40", "40287915", "Ezequiel Andrés Peralta", "+54935173XXXXX", 51512, 168, "15/11/2026", 51512],
  ["09/11/2026 14:30", "33781246", "Romina Paola Cabrera", "+54938042XXXXX", 47189, 103, "20/11/2026", 47189],
  ["09/11/2026 14:03", "36550918", "Gonzalo Iván Navarro", "+54938041XXXXX", 44763, 161, "13/11/2026", 44763],
];
const Segmentacion: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const f0 = ESC.segmentacion[0];
  const modal = spring({ frame: frame - TAP_CATEGORIA - 4, fps, config: { damping: 18, stiffness: 140 } });
  const tabla = frame >= TAP_DESENLACE + 4;
  const tablaT = spring({ frame: frame - TAP_DESENLACE - 4, fps, config: { damping: 18, stiffness: 140 } });
  const cierre = interpolate(frame, [TAP_FRANJA - 8, TAP_FRANJA], [0, 1], clamp);
  const vModal = modal * (1 - cierre);
  const KP: [string, string, string, string][] = [
    ["Casos en campaña", num(Math.round(130473 * sube(frame, f0 + 4))), "", "M3 6 H10 L12 8 H21 V19 H3 Z"],
    ["Casos gestionados", num(Math.round(TOTAL_SEG * sube(frame, f0 + 6))), "38,3% gestionados", "M4 20 V4 M4 20 H20 M8 16 V11 M12 16 V8 M16 16 V13"],
    ["Ratio de contacto", pct(34.5 * sube(frame, f0 + 8)), "17.254 contactados", "M5 4 L9 4 L11 9 L8.5 10.5 C9.5 13 11 14.5 13.5 15.5 L15 13 L20 15 L20 19 C12 19 5 12 5 4 Z"],
    ["A búsqueda de datos", num(Math.round(23961 * sube(frame, f0 + 10))), "teléfono inválido", "M12 4 A4 4 0 1 1 12 12 A4 4 0 1 1 12 4 M4 21 C5 15 19 15 20 21"],
    ["Deuda alcanzada", `$ ${num(Math.round(62833 * sube(frame, f0 + 12)))} MM`, "", "M12 3 V21 M16 7 C16 5 8 5 8 8 C8 11 16 11 16 15 C16 18 8 18 8 16"],
  ];
  return (
    <div style={{ position: "absolute", left: SIDE, top: HEADER, right: 0, bottom: 0, background: "#eef1f5" }}>
      <div style={{ position: "absolute", left: 30, top: 12, fontSize: 10.5, color: TINTA_2 }}>← Volver al inicio</div>
      <div style={{ position: "absolute", left: 30, top: 28, fontSize: 20, fontWeight: 800, color: TINTA }}>Segmentación de casos</div>
      <div style={{ position: "absolute", left: 30, top: 54, fontSize: 11, color: TINTA_2 }}>Distribución de los casos gestionados por Contact Flow</div>
      <div style={{ position: "absolute", right: 30, top: 24, width: 230, height: 34, background: "white", borderRadius: 7, border: `1px solid ${BORDE}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px", fontSize: 11.5, color: TINTA }}>
        Todas las campañas <span style={{ fontSize: 9 }}>▾</span>
      </div>
      <div style={{ position: "absolute", left: 30, right: 30, top: 80, display: "flex", gap: 10 }}>
        {KP.map(([k, v, s, ic]) => (
          <div key={k} style={{ flex: 1, height: 66, background: "white", borderRadius: 10, display: "flex", alignItems: "center", gap: 10, padding: "0 12px" }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "#f1f3f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icono d={ic} s={17} c={TINTA} w={2} />
            </div>
            <div>
              <div style={{ fontSize: 9.5, color: TINTA_2 }}>{k}</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: TINTA }}>{v}</div>
              {s ? <div style={{ fontSize: 8.5, color: TINTA_2 }}>{s}</div> : null}
            </div>
          </div>
        ))}
      </div>
      {/* Distribution bar */}
      <div style={{ position: "absolute", left: 30, right: 30, top: 158, height: 104, background: "white", borderRadius: 10, padding: "12px 16px", boxSizing: "border-box" }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: TINTA }}>Distribución de resultados</div>
        {(() => {
          const orden = [6, 2, 5, 3, 1, 0, 4, 7];
          const colores = ["#a8d5df", "#1f6f86", "#8ec5d3", "#2b88a3", "#145b70", "#0c3f50", "#3fa0bb", "#c7e6ee"];
          const anchoT = sube(frame, f0 + 14, 40);
          return (
            <div style={{ display: "flex", gap: 3, marginTop: 10, height: 12 }}>
              {orden.map((k, j) => (
                <div key={k} style={{ width: `${(CATEGORIAS[k][2] / TOTAL_SEG) * 100 * anchoT}%`, minWidth: 6 * anchoT, background: colores[j], borderRadius: 2 }} />
              ))}
            </div>
          );
        })()}
        <div style={{ display: "flex", gap: 14, marginTop: 10, fontSize: 9.5, color: TINTA_2 }}>
          {[6, 2, 5, 3, 1, 0, 4, 7].map((k) => (
            <div key={k} style={{ display: "flex", gap: 4, alignItems: "baseline" }}>
              <div style={{ width: 6, height: 6, borderRadius: 1.5, background: CATEGORIAS[k][1] }} />
              <b style={{ color: TINTA }}>{pct((CATEGORIAS[k][2] / TOTAL_SEG) * 100)}</b>
              {CATEGORIAS[k][0]}
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", left: 30, top: 276, fontSize: 13, fontWeight: 800, color: TINTA }}>Detalle por categoría</div>
      <div style={{ position: "absolute", left: 30, right: 30, top: 300, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {CATEGORIAS.map(([n, c, v, sub, sv], i) => {
          const t = sube(frame, f0 + 16 + i * 3, 40);
          return (
            <div key={n} style={{ height: 120, background: "white", borderRadius: 10, border: `1px solid ${BORDE}`, padding: "10px 12px", boxSizing: "border-box", transform: `scale(${i === 0 ? 1 - pulsado(frame, TAP_CATEGORIA) * 0.04 : 1})` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 800, color: TINTA }}>
                <div style={{ width: 7, height: 7, borderRadius: 2, background: c }} />
                {n}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
                <span style={{ fontSize: 19, fontWeight: 800, color: TINTA }}>{num(Math.round(v * t))}</span>
                <span style={{ fontSize: 10.5, color: TINTA_2 }}>{pct((v / TOTAL_SEG) * 100)}</span>
              </div>
              <div style={{ height: 4, borderRadius: 2, background: "#e5e7eb", marginTop: 5 }}>
                <div style={{ width: `${(v / TOTAL_SEG) * 100 * t}%`, minWidth: 4, height: "100%", borderRadius: 2, background: "#1f6f86" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: TINTA, marginTop: 9 }}>
                <span>{sub}</span>
                <b>{num(Math.round(sv * t))}</b>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 30, right: 30, top: 570, height: 60, background: "white", borderRadius: 10, display: "flex", alignItems: "center", gap: 12, padding: "0 16px" }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: "#e0edff", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icono d="M9 18 H15 M10 21 H14 M12 3 A6 6 0 0 1 16 13.5 C15 14.5 15 15 15 16 H9 C9 15 9 14.5 8 13.5 A6 6 0 0 1 12 3 Z" s={16} c="#2563eb" w={2} />
        </div>
        <div>
          <div style={{ fontSize: 11.5, fontWeight: 800, color: TINTA }}>Lectura</div>
          <div style={{ fontSize: 10.5, color: TINTA }}>La categoría más frecuente es “Búsqueda de datos” con 23.961 casos (47,9%). Le sigue “Se dejó mensaje” con 30,3%.</div>
        </div>
      </div>
      {/* Drill-down modal */}
      {vModal > 0.001 ? (
        <>
          <div style={{ position: "absolute", inset: 0, background: `rgba(30,34,42,${0.45 * vModal})` }} />
          <div style={{ position: "absolute", left: 60, right: 60, top: tabla ? 14 : 150, height: tabla ? 690 : 400, background: "white", borderRadius: 14, boxShadow: "0 24px 60px rgba(0,0,0,0.3)", opacity: vModal, transform: `scale(${0.94 + 0.06 * vModal})`, overflow: "hidden" }}>
            <div style={{ position: "absolute", right: 16, top: 14, display: "flex", gap: 8 }}>
              {["CSV", "Excel", "JSON", "×"].map((b) => (
                <div key={b} style={{ height: 30, minWidth: 30, padding: b === "×" ? 0 : "0 12px", border: `1px solid ${BORDE}`, borderRadius: 7, fontSize: b === "×" ? 18 : 11, fontWeight: 700, color: TINTA, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {b}
                </div>
              ))}
            </div>
            {!tabla ? (
              <>
                <div style={{ position: "absolute", left: 22, top: 16, display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 800, color: TINTA }}>
                  <div style={{ width: 7, height: 7, borderRadius: 2, background: "#16a34a" }} /> Compromiso logrado
                </div>
                <div style={{ position: "absolute", left: 22, top: 40, fontSize: 10.5, color: TINTA_2 }}>357 casos · 0,7% del total — El caso avanza: acordó, pagó o pasó a una persona.</div>
                <div style={{ position: "absolute", left: 22, right: 22, top: 70, display: "flex", fontSize: 10, fontWeight: 700, color: TINTA, borderBottom: `1px solid ${BORDE}`, paddingBottom: 6 }}>
                  <span style={{ flex: 1 }}>Desenlace</span>
                  <span style={{ width: 80, textAlign: "right" }}>Casos</span>
                  <span style={{ width: 110, textAlign: "right" }}>% de la categoría</span>
                </div>
                {DESENLACES.map(([n, v], i) => {
                  const t = sube(frame, TAP_CATEGORIA + 10 + i * 4, 24);
                  return (
                    <div key={n} style={{ position: "absolute", left: 22, right: 22, top: 96 + i * 62, height: 56, borderBottom: `1px solid ${BORDE}`, background: i === 1 && frame >= TAP_DESENLACE - 10 ? "#f0f7ff" : "white", transform: `scale(${i === 1 ? 1 - pulsado(frame, TAP_DESENLACE) * 0.02 : 1})` }}>
                      <div style={{ display: "flex", fontSize: 12.5, color: TINTA, paddingTop: 10, paddingLeft: 6, paddingRight: 6 }}>
                        <span style={{ flex: 1, fontWeight: 700 }}>{n}</span>
                        <span style={{ width: 80, textAlign: "right" }}>{v}</span>
                        <span style={{ width: 110, textAlign: "right", color: TINTA_2 }}>{pct((v / 357) * 100)}</span>
                      </div>
                      <div style={{ margin: "8px 6px 0", height: 8, borderRadius: 4, background: "#eef1f5" }}>
                        <div style={{ width: `${(v / 257) * 100 * t}%`, height: "100%", borderRadius: 4, background: "#0f4c5c" }} />
                      </div>
                    </div>
                  );
                })}
                <div style={{ position: "absolute", left: 22, bottom: 18, border: `1px solid ${BORDE}`, borderRadius: 7, fontSize: 11, fontWeight: 700, color: TINTA, padding: "8px 12px" }}>Ver todos los casos de la categoría →</div>
              </>
            ) : (
              <div style={{ opacity: tablaT }}>
                <div style={{ position: "absolute", left: 22, top: 14, fontSize: 10.5, color: TINTA_2 }}>← Compromiso logrado</div>
                <div style={{ position: "absolute", left: 22, top: 30, display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 800, color: TINTA }}>
                  <div style={{ width: 7, height: 7, borderRadius: 2, background: "#16a34a" }} /> Promesa de pago
                </div>
                <div style={{ position: "absolute", left: 22, top: 52, fontSize: 10.5, color: TINTA_2 }}>62 casos</div>
                <div style={{ position: "absolute", left: 22, right: 22, top: 80 }}>
                  <div style={{ display: "flex", height: 36, alignItems: "center", background: "#2f7de1", color: "white", fontSize: 9.5, fontWeight: 700, padding: "0 10px", borderRadius: "6px 6px 0 0" }}>
                    {[
                      ["Fecha y hora", 110],
                      ["DNI", 74],
                      ["Nombre", 180],
                      ["Teléfono", 120],
                      ["Deuda", 90],
                      ["DPD", 46],
                      ["Desenlace", 110],
                      ["Fecha promesa", 90],
                      ["Monto promesa", 90],
                    ].map(([t, w]) => (
                      <div key={t as string} style={{ width: w as number }}>
                        {t}
                      </div>
                    ))}
                  </div>
                  {CASOS.map((c, i) => (
                    <div key={c[1]} style={{ display: "flex", height: 52, alignItems: "center", fontSize: 10.5, color: TINTA, padding: "0 10px", borderBottom: `1px solid ${BORDE}`, opacity: interpolate(frame, [TAP_DESENLACE + 8 + i * 2, TAP_DESENLACE + 16 + i * 2], [0, 1], clamp) }}>
                      <div style={{ width: 110 }}>{c[0]}</div>
                      <div style={{ width: 74 }}>{c[1]}</div>
                      <div style={{ width: 180, fontWeight: 700 }}>{c[2]}</div>
                      <div style={{ width: 120 }}>{c[3]}</div>
                      <div style={{ width: 90 }}>{pesos(c[4])}</div>
                      <div style={{ width: 46 }}>{c[5]}</div>
                      <div style={{ width: 110 }}>Promesa de pago</div>
                      <div style={{ width: 90 }}>{c[6]}</div>
                      <div style={{ width: 90 }}>{pesos(c[7])}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
};

// ---------- Performance by time slot ----------
const FRANJAS: [string, number, number, number, number, number][] = [
  ["08–09 h", 249, 37, 37, 1, 0],
  ["09–10 h", 4829, 2639, 868, 21, 2],
  ["10–11 h", 6486, 3549, 1391, 31, 7],
  ["11–12 h", 7506, 3871, 1603, 40, 7],
  ["12–13 h", 8583, 4239, 1880, 59, 12],
  ["13–14 h", 9120, 4409, 2023, 62, 9],
  ["14–15 h", 8528, 4268, 1955, 53, 5],
  ["15–16 h", 7998, 3841, 1682, 49, 7],
  ["16–17 h", 8609, 4400, 1769, 67, 2],
];
const Franja: React.FC<{ frame: number }> = ({ frame }) => {
  const f0 = ESC.franja[0];
  const max = 9120;
  return (
    <div style={{ position: "absolute", left: SIDE, top: HEADER, right: 0, bottom: 0, background: "#eef1f5" }}>
      <div style={{ position: "absolute", left: 30, top: 12, fontSize: 10.5, color: TINTA_2 }}>← Volver al inicio</div>
      <div style={{ position: "absolute", left: 30, top: 28, fontSize: 20, fontWeight: 800, color: TINTA }}>Performance por franja horaria</div>
      <div style={{ position: "absolute", left: 30, top: 54, fontSize: 11, color: TINTA_2 }}>Llamados de 08 a 22 h agrupados por la hora en que salieron</div>
      <div style={{ position: "absolute", left: 30, right: 30, top: 80, display: "flex", gap: 10 }}>
        {[
          ["Total llamados", num(Math.round(86128 * sube(frame, f0 + 4))), "2.463 fuera de 08–22 h"],
          ["Contacto efectivo", pct(21.3 * sube(frame, f0 + 6)), "18.353 llamados"],
          ["Contacto positivo", num(Math.round(535 * sube(frame, f0 + 8))), "0,6% de los llamados"],
          ["Promesas", num(Math.round(67 * sube(frame, f0 + 10))), "0,1% de los llamados"],
          ["Mejor franja", "20–21 h", "24,2% de contacto efectivo"],
        ].map(([k, v, s]) => (
          <div key={k} style={{ flex: 1, height: 66, background: "white", borderRadius: 10, padding: "10px 14px", boxSizing: "border-box" }}>
            <div style={{ fontSize: 9.5, color: TINTA_2 }}>{k}</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: TINTA }}>{v}</div>
            <div style={{ fontSize: 8.5, color: TINTA_2 }}>{s}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 30, right: 30, top: 160, background: "white", borderRadius: 10, padding: "12px 16px", boxSizing: "border-box" }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: TINTA }}>Resultados por franja</div>
        <div style={{ display: "flex", fontSize: 10, fontWeight: 700, color: TINTA, marginTop: 12, paddingBottom: 6, borderBottom: `1px solid ${BORDE}` }}>
          {[
            ["Franja", "", 80],
            ["Total llamados", "#6b7280", 160],
            ["Contacto", "#2563eb", 160],
            ["Contacto efectivo", "#22c55e", 160],
            ["Contacto positivo", "#16a34a", 150],
            ["Promesas", "#0f172a", 120],
            ["No contacto", "#ef4444", 160],
          ].map(([t, c, w]) => (
            <div key={t as string} style={{ width: w as number, display: "flex", alignItems: "center", gap: 5 }}>
              {c ? <div style={{ width: 7, height: 7, borderRadius: 2, background: c as string }} /> : null}
              {t}
            </div>
          ))}
        </div>
        {FRANJAS.map(([f, tot, con, efe, pos, pro], i) => {
          const t = sube(frame, f0 + 14 + i * 4, 26);
          const cel = (v: number, p: number, c: string, w: number) => (
            <div style={{ width: w, paddingRight: 14, boxSizing: "border-box" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5 }}>
                <b>{num(Math.round(v * t))}</b>
                <span style={{ color: TINTA_2, fontSize: 9.5 }}>{p >= 0 ? pct(p * 100) : ""}</span>
              </div>
              <div style={{ height: 4, borderRadius: 2, background: "#eef1f5", marginTop: 4 }}>
                <div style={{ width: `${Math.max(2, (p >= 0 ? p : v / max) * 100) * t}%`, height: "100%", borderRadius: 2, background: c }} />
              </div>
            </div>
          );
          return (
            <div key={f} style={{ display: "flex", alignItems: "center", height: 44, color: TINTA, borderBottom: `1px solid ${BORDE}`, opacity: interpolate(frame, [f0 + 10 + i * 4, f0 + 18 + i * 4], [0, 1], clamp) }}>
              <div style={{ width: 80, fontSize: 11, fontWeight: 700 }}>{f}</div>
              {cel(tot, -1, "#6b7280", 160)}
              {cel(con, con / tot, "#1f6f86", 160)}
              {cel(efe, efe / tot, "#0f4c5c", 160)}
              {cel(pos, pos / tot, "#16a34a", 150)}
              {cel(pro, pro / tot, "#0f172a", 120)}
              {cel(tot - con, (tot - con) / tot, "#ef4444", 160)}
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 30, right: 30, top: 640, height: 52, background: "white", borderRadius: 10, display: "flex", alignItems: "center", gap: 12, padding: "0 16px", fontSize: 10.5, color: TINTA }}>
        <b>Lectura</b> La franja con mejor contacto efectivo es 20–21 h (24,2%). La de más volumen es 13–14 h con 9.120 llamados.
      </div>
    </div>
  );
};

// ---------- Dashboard ----------
const Dashboard: React.FC<{ frame: number }> = ({ frame }) => {
  const f0 = ESC.dashboard[0];
  const PANEL = "#151d30";
  const LINEA = "#26314a";
  const kpi = (k: string, v: string, s: string, borde: string, i: number) => (
    <div key={k} style={{ flex: 1, height: 74, background: PANEL, borderRadius: 10, borderTop: `2px solid ${borde}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, opacity: interpolate(frame, [f0 + i * 3, f0 + 10 + i * 3], [0, 1], clamp) }}>
      <div style={{ fontSize: 9.5, letterSpacing: 0.6, color: "#c9d0da" }}>{k}</div>
      <div style={{ fontSize: 21, fontWeight: 800 }}>{v}</div>
      {s ? <div style={{ fontSize: 9, color: "#aab3c0" }}>{s}</div> : null}
    </div>
  );
  const lista = (titulo: string, filas: [string, number, number][], d: number) => (
    <div style={{ flex: 1, background: PANEL, borderRadius: 10, border: `1px solid ${LINEA}`, padding: "12px 16px", boxSizing: "border-box" }}>
      <div style={{ fontSize: 11, fontWeight: 700, textAlign: "center", borderBottom: `1px solid ${LINEA}`, paddingBottom: 8 }}>{titulo}</div>
      {filas.map(([k, v, p], i) => (
        <div key={k} style={{ marginTop: 11 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5 }}>
            <b>{k}</b>
            <span style={{ color: "#aab3c0" }}>
              {num(Math.round(v * sube(frame, f0 + d + i * 4)))} · {pct(p * 100)}
            </span>
          </div>
          <div style={{ height: 4, borderRadius: 2, background: LINEA, marginTop: 5 }}>
            <div style={{ width: `${p * 100 * sube(frame, f0 + d + i * 4)}%`, height: "100%", borderRadius: 2, background: "#5b84b8" }} />
          </div>
        </div>
      ))}
    </div>
  );
  return (
    <div style={{ position: "absolute", left: SIDE, top: HEADER, right: 0, bottom: 0, background: "#0d1424", color: "white" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 14, textAlign: "center", fontSize: 18, fontWeight: 800 }}>Dashboard de Contact Flow</div>
      <div style={{ position: "absolute", left: 30, right: 30, top: 48, height: 40, background: PANEL, borderRadius: 8, display: "flex", alignItems: "center", gap: 6, padding: "0 10px" }}>
        {["Hoy", "Ayer", "Esta semana", "Semana anterior", "Mes actual", "Mes anterior", "Este año", "Todo"].map((b) => (
          <div key={b} style={{ fontSize: 9.5, fontWeight: 700, padding: "5px 9px", borderRadius: 6, border: `1px solid ${b === "Mes actual" ? "#3b82f6" : LINEA}`, background: b === "Mes actual" ? "#2563eb" : "transparent" }}>
            {b}
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 9.5, border: `1px solid ${LINEA}`, borderRadius: 6, padding: "5px 10px" }}>Todas las campañas ▾</div>
        <div style={{ fontSize: 9.5, fontWeight: 700, padding: "5px 12px", borderRadius: 6, background: "#22a35a" }}>Aplicar</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 102, textAlign: "center", fontSize: 12, fontWeight: 700 }}>VOLUMEN DE GESTIÓN</div>
      <div style={{ position: "absolute", left: 30, right: 30, top: 124, display: "flex", gap: 12 }}>
        {kpi("LLAMADOS", num(Math.round(29581 * sube(frame, f0 + 4))), "", "#5b84b8", 0)}
        {kpi("ATENDIDOS POR UNA PERSONA", num(Math.round(1201 * sube(frame, f0 + 6))), "", "#4f9c7a", 1)}
        {kpi("CASOS ALCANZADOS", num(Math.round(29579 * sube(frame, f0 + 8))), "", "#5b84b8", 2)}
        {kpi("CAMPAÑAS ACTIVAS", "3", "", "#c98a4b", 3)}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 214, textAlign: "center", fontSize: 12, fontWeight: 700 }}>EFECTIVIDAD</div>
      <div style={{ position: "absolute", left: 30, right: 30, top: 236, display: "flex", gap: 12 }}>
        {kpi("% CONTACTABILIDAD", pct(21.3 * sube(frame, f0 + 10)), "Atendió una persona", "#4f9c7a", 4)}
        {kpi("% GESTIÓN EFECTIVA", pct(6.8 * sube(frame, f0 + 12)), "El caso avanzó", "#4f9c7a", 5)}
        {kpi("% BUZÓN DE VOZ", pct(43.9 * sube(frame, f0 + 14)), "Se dejó mensaje", "#c98a4b", 6)}
        {kpi("% TELÉFONO INVÁLIDO", pct(14.2 * sube(frame, f0 + 16)), "A búsqueda de datos", "#b85b5b", 7)}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 328, textAlign: "center", fontSize: 12, fontWeight: 700 }}>CÓMO TERMINARON LOS LLAMADOS</div>
      <div style={{ position: "absolute", left: 30, right: 30, top: 352, display: "flex", gap: 12 }}>
        {lista(
          "POR GRUPO",
          [
            ["Reintento con contacto", 14252, 0.482],
            ["Teléfono inválido", 4200, 0.142],
            ["Reintento sin contacto", 4448, 0.15],
            ["Gestión efectiva", 2012, 0.068],
          ],
          20,
        )}
        {lista(
          "POR DESENLACE",
          [
            ["Se dejó mensaje", 12997, 0.439],
            ["Apagado o sin señal", 8972, 0.303],
            ["Sin respuesta de la red", 3998, 0.135],
            ["Promesa de pago", 1214, 0.041],
          ],
          26,
        )}
        {lista(
          "POR CARTERA",
          [
            ["Mora temprana", 15120, 0.511],
            ["Mora media", 9874, 0.334],
            ["Preventiva", 4587, 0.155],
          ],
          32,
        )}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 568, textAlign: "center", fontSize: 12, fontWeight: 700 }}>LLAMADOS POR DÍA</div>
      <div style={{ position: "absolute", left: 30, right: 30, top: 590, height: 170, background: PANEL, borderRadius: 10, border: `1px solid ${LINEA}`, padding: "14px 18px", boxSizing: "border-box" }}>
        <div style={{ display: "flex", gap: 16, fontSize: 9.5, color: "#c9d0da", marginBottom: 8 }}>
          {[
            ["Llamados", "#5b84b8"],
            ["Atendidos", "#4f9c7a"],
          ].map(([t, c]) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 9, height: 9, borderRadius: 2, background: c }} />
              {t}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 104 }}>
          {[1820, 2410, 2265, 2630, 2980, 1150, 0, 2540, 2760, 2895, 3120, 2870, 1210, 0].map((v, i) => {
            const t = sube(frame, f0 + 36 + i * 2, 24);
            const a = Math.round(v * 0.041);
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ width: "100%", height: 88, display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 3 }}>
                  <div style={{ width: "45%", height: `${(v / 3200) * 100 * t}%`, background: "#5b84b8", borderRadius: "3px 3px 0 0" }} />
                  <div style={{ width: "45%", height: `${(a / 3200) * 100 * t * 6}%`, background: "#4f9c7a", borderRadius: "3px 3px 0 0" }} />
                </div>
                <div style={{ fontSize: 8.5, color: "#aab3c0" }}>{String(i + 1).padStart(2, "0")}/11</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ---------- Page ----------
const DEDO: [number, number, number][] = [
  [0, 700, 700],
  [TAP_ESTRATEGIAS - 2, SIDE + 60 + 258 + 121, HEADER + 110],
  [TAP_CAMPANAS - 2, SIDE / 2, HEADER + 22 + 1 * 40 + 9],
  [TAP_REPORTES - 2, SIDE / 2, HEADER + 22 + 5 * 40 + 9],
  [TAP_CATEGORIA - 2, SIDE + 30 + 128, HEADER + 360],
  [TAP_DESENLACE - 2, SIDE + 400, HEADER + 150 + 96 + 62 + 22],
  [TAP_FRANJA - 2, SIDE / 2, HEADER + 22 + 6 * 40 + 9],
  [TAP_DASH - 2, SIDE / 2, HEADER + 22 + 4 * 40 + 9],
  [TAP_DASH + 40, 700, 720],
];
const posDedo = (frame: number) => {
  let p = { x: DEDO[0][1], y: DEDO[0][2] };
  for (let i = 1; i < DEDO.length; i++) {
    const [f, x, y] = DEDO[i];
    const desde = Math.max(DEDO[i - 1][0], f - 18);
    if (frame >= f) {
      p = { x, y };
      continue;
    }
    if (frame > desde) {
      const t = interpolate(frame, [desde, f], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
      p = { x: p.x + (x - p.x) * t, y: p.y + (y - p.y) * t };
    }
    break;
  }
  return p;
};

const Pagina: React.FC<{ frame: number }> = ({ frame }) => {
  const escenas: [Escena, React.FC<{ frame: number }>][] = [
    ["home", Home],
    ["flujo", Flujo],
    ["campana", Campana],
    ["segmentacion", Segmentacion],
    ["franja", Franja],
    ["dashboard", Dashboard],
  ];
  const actual = (Object.keys(ESC) as Escena[]).filter((e) => frame >= ESC[e][0]).pop() ?? "home";
  const dedo = posDedo(frame);
  const tap = TAPS.find((f) => frame >= f && frame < f + 16);
  const onda = tap === undefined ? 0 : (frame - tap) / 16;
  const presion = tap === undefined ? 0 : interpolate(frame - tap, [0, 3, 8], [0, 1, 0], clamp);
  const dedoVis = interpolate(frame, [96, 110], [0, 1], clamp) * interpolate(frame, [TAP_DASH + 30, TAP_DASH + 44], [1, 0], clamp);
  return (
    <div style={{ position: "relative", width: PW, height: PH, background: "#4a4a4a", fontFamily: FUENTE, overflow: "hidden" }}>
      {escenas.map(([e, C]) => {
        const [a, b] = ESC[e];
        const v = interpolate(frame, [a, a + 6, b - 6, b], [0, 1, 1, 0], clamp);
        if (v <= 0.001) {
          return null;
        }
        return (
          <div key={e} style={{ position: "absolute", inset: 0, opacity: v }}>
            <C frame={frame} />
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 0, top: 0, width: PW, height: HEADER, background: "#4a4a4a", display: "flex", alignItems: "center", zIndex: 5 }}>
        <div style={{ marginLeft: 18 }}>
          <Logo w={96} />
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 22 }}>
          <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#9aa3b2", color: "#4a4a4a", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>?</div>
          <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#e5e7eb" }} />
          <div style={{ fontSize: 11, fontWeight: 700, color: "white" }}>Delfina Martinez - DMARTINEZ</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, top: HEADER, width: SIDE, bottom: 0, background: NAVY_SIDE, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 22, gap: 22, zIndex: 5 }}>
        {SIDE_ICONOS.map((d, i) => {
          const tapIdx: Record<number, number> = { 1: TAP_CAMPANAS, 5: TAP_REPORTES, 6: TAP_FRANJA, 4: TAP_DASH };
          return (
            <div key={i} style={{ transform: `scale(${i in tapIdx ? 1 - pulsado(frame, tapIdx[i]) * 0.2 : 1})` }}>
              <Icono d={d} s={18} c={i === ACTIVO[actual] ? "#FF8C42" : "#e5e7eb"} />
            </div>
          );
        })}
      </div>
      {tap !== undefined ? (
        <div style={{ position: "absolute", left: dedo.x, top: dedo.y, width: 18 + onda * 54, height: 18 + onda * 54, transform: "translate(-50%, -50%)", borderRadius: "50%", border: `3px solid rgba(255,140,66,${1 - onda})`, background: `rgba(255,140,66,${(1 - onda) * 0.2})`, zIndex: 8 }} />
      ) : null}
      <div style={{ position: "absolute", left: dedo.x, top: dedo.y, width: 36, height: 36, transform: `translate(-50%, -50%) scale(${1 - presion * 0.2})`, borderRadius: "50%", background: "rgba(255,255,255,0.55)", border: "2px solid rgba(40,48,64,0.35)", boxShadow: "0 4px 10px rgba(0,0,0,0.2)", opacity: dedoVis * 0.9, zIndex: 9 }} />
    </div>
  );
};

export const ContactFlow: React.FC<z.infer<typeof contactFlowSchema>> = ({ fondo, paleta }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const { w, h } = pantallaDe("tablet", false);
  const { W: EW, H: EH } = exteriorDe("tablet", w, h);
  const esc = Math.min((width * 0.86) / EW, (height * 0.9) / EH);
  const t = spring({ frame, fps, config: { damping: 18, stiffness: 80 } });
  return (
    <AbsoluteFill style={{ fontFamily: FUENTE }}>
      <FondoAbstracto paleta={paleta} estilo={fondo} />
      <div style={{ position: "absolute", left: width / 2, top: height / 2, opacity: t, transform: `translate(-50%, -50%) scale(${esc})` }}>
        <Dispositivo tipo="tablet" w={w} h={h}>
          <Pagina frame={frame} />
        </Dispositivo>
      </div>
    </AbsoluteFill>
  );
};
