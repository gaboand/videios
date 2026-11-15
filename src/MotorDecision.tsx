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

// Decision engine (dynamic camera, 40s), tablet in 16:9 and phone in 9:16:
// the credit bureau variables setup, the workflow editor building the
// evaluation flow, the risk matrix and the risk pricing model. Data and
// bureau names are made up ("Bureau A", "Central de Deudores").

export const motorSchema = z.object({
  fondo: z.enum(["ondas", "red", "aurora", "geometrico"]),
  paleta: z.enum(["azul", "gris"]),
});

export const MOTOR_FRAMES = 1200;

const FUENTE = "Montserrat, sans-serif";
const HEADER_BG = "#4b4d52";
const SIDE_BG = "#17191d";
const NAVY = "#1c3a5e";
const AZUL = "#2f5d8f";
const TINTA = "#1f2430";
const TINTA_2 = "#6b7280";
const BORDE = "#dfe3ea";
const PANEL = "#ebecef";
const VERDE = "#1e6b3a";
const PW = 1180;
const PH = 820;
const HEADER = 50;
const SIDE = 46;
const MW = 390;
const MH = 844;
const M_HEADER = 92;
const M_TABS = 64;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ---------- Timeline ----------
const ESC = {
  variables: [0, 256],
  workflow: [252, 648],
  matriz: [644, 930],
  pricing: [926, MOTOR_FRAMES + 10],
} as const;
type Escena = keyof typeof ESC;
const TAP_SCORE = 70;
const TIPEO_SCORE = [76, 92];
const TAP_TOGGLE = 112;
const TIPEO_CONS = [118, 128];
const TAP_GUARDAR_CFG = 160;
const TAP_NAV_WF = 244;
const NODO_0 = 292;
const NODO_PASO = 13;
const TAP_GUARDAR_WF = 590;
const TAP_NAV_MAT = 636;
const TAP_GENERAR = 676;
const TAP_CELDA = 800;
const TAP_ACTUALIZAR = 846;
const TAP_NAV_PR = 918;
const TAP_MONTO = 962;
const TIPEO_MONTO = [968, 990];
const TAP_GUARDAR_PR = 1030;
const TAPS = [TAP_SCORE, TAP_TOGGLE, TAP_GUARDAR_CFG, TAP_NAV_WF, TAP_GUARDAR_WF, TAP_NAV_MAT, TAP_GENERAR, TAP_CELDA, TAP_ACTUALIZAR, TAP_NAV_PR, TAP_MONTO, TAP_GUARDAR_PR];

const pulsado = (frame: number, f: number) => interpolate(frame, [f, f + 4, f + 12], [0, 1, 0], clamp);
const aparece = (frame: number, desde: number, dur = 10) => interpolate(frame, [desde, desde + dur], [0, 1], clamp);
const tipeo = (frame: number, texto: string, [a, b]: readonly number[]) => texto.slice(0, Math.round(interpolate(frame, [a, b], [0, texto.length], clamp)));

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
const I = {
  casa: "M4 11 L12 4 L20 11 V20 H14 V14 H10 V20 H4 Z",
  variables: "M4 7 H14 M18 7 H20 M4 17 H8 M12 17 H20 M16 5 V9 M10 15 V19",
  lupa: "M10.5 4 A6.5 6.5 0 1 1 10.5 17 A6.5 6.5 0 1 1 10.5 4 M15.5 15.5 L20 20",
  barras: "M4 20 V10 M9 20 V4 M14 20 V13 M19 20 V8",
  base: "M5 6 C5 3 19 3 19 6 V18 C19 21 5 21 5 18 Z M5 6 C5 9 19 9 19 6 M5 12 C5 15 19 15 19 12",
  flujo: "M4 5 H10 V9 H4 Z M14 15 H20 V19 H14 Z M14 5 H20 V9 H14 Z M10 7 H14 M7 9 V17 H14",
  lista: "M4 6 H6 M4 12 H6 M4 18 H6 M9 6 H20 M9 12 H20 M9 18 H20",
  capas: "M12 3 L21 8 L12 13 L3 8 Z M3 12 L12 17 L21 12 M3 16 L12 21 L21 16",
  sliders: "M4 7 H20 M4 12 H20 M4 17 H20 M8 5 V9 M15 10 V14 M10 15 V19",
  doc: "M6 3 H14 L18 7 V21 H6 Z M9 12 H15 M9 16 H13",
  pulso: "M3 12 H7 L9 7 L13 17 L15 12 H21",
  persona: "M12 4 A4 4 0 1 1 12 12 A4 4 0 1 1 12 4 M4 21 C5 15 19 15 20 21",
  editar: "M4 20 H8 L19 9 L15 5 L4 16 Z",
  cruz: "M6 6 L18 18 M18 6 L6 18",
  mas: "M12 5 V19 M5 12 H19",
  libro: "M5 4 H11 V20 H5 Z M13 4 H19 V20 H13 Z",
};
const SIDE_ICONOS = [I.casa, I.variables, I.lupa, I.barras, I.base, I.flujo, I.lista, I.capas, I.sliders, I.doc, I.pulso, I.persona];
const SIDE_ACTIVO: Record<Escena, number> = { variables: 1, workflow: 5, matriz: 7, pricing: 8 };
const SIDE_TAP: Record<number, number> = { 5: TAP_NAV_WF, 7: TAP_NAV_MAT, 8: TAP_NAV_PR };

const Toast: React.FC<{ frame: number; desde: number; hasta: number; titulo: string; sub: string; chico?: boolean }> = ({ frame, desde, hasta, titulo, sub, chico }) => {
  if (frame < desde || frame >= hasta) {
    return null;
  }
  const t = spring({ frame: frame - desde, fps: 30, config: { damping: 16 } }) * interpolate(frame, [hasta - 10, hasta], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", right: chico ? 12 : 24, left: chico ? 12 : undefined, top: chico ? M_HEADER + 10 : HEADER + 16, zIndex: 7, background: "white", borderLeft: `4px solid ${VERDE}`, borderRadius: 10, boxShadow: "0 10px 26px rgba(20,30,50,0.22)", padding: chico ? "10px 14px" : "12px 18px", opacity: Math.min(1, t * 1.5), transform: `translateY(${(1 - t) * -16}px)` }}>
      <div style={{ fontSize: chico ? 12 : 13, fontWeight: 800, color: VERDE }}>✓ {titulo}</div>
      <div style={{ fontSize: chico ? 10.5 : 11, color: TINTA_2, marginTop: 3 }}>{sub}</div>
    </div>
  );
};
const Toggle: React.FC<{ on: number; s?: number }> = ({ on, s = 1 }) => (
  <div style={{ width: 32 * s, height: 18 * s, borderRadius: 9 * s, background: on > 0.5 ? NAVY : "#e3e6eb", border: `1px solid ${on > 0.5 ? NAVY : "#cfd4dc"}`, position: "relative", flexShrink: 0 }}>
    <div style={{ position: "absolute", top: 2 * s, left: (2 + 14 * on) * s, width: 12 * s, height: 12 * s, borderRadius: "50%", background: "white", boxShadow: "0 1px 2px rgba(0,0,0,0.25)" }} />
  </div>
);
const Campo: React.FC<{ v: string; w: number; h?: number; sel?: boolean; foco?: boolean; fs?: number; cursor?: boolean }> = ({ v, w, h = 26, sel, foco, fs = 11.5, cursor }) => (
  <div style={{ width: w, height: h, borderRadius: 5, background: "white", border: `1.3px solid ${foco ? AZUL : "#cfd4dc"}`, display: "flex", alignItems: "center", justifyContent: sel ? "space-between" : "center", padding: sel ? "0 8px" : 0, boxSizing: "border-box", fontSize: fs, color: TINTA, flexShrink: 0 }}>
    <span>
      {v}
      {cursor ? <span style={{ display: "inline-block", width: 1.3, height: fs + 2, background: TINTA, marginLeft: 1, verticalAlign: "middle" }} /> : null}
    </span>
    {sel ? <span style={{ fontSize: 8 }}>▾</span> : null}
  </div>
);

// ---------- Variables setup ----------
type Var = { t: string; v?: string; on?: boolean; sel?: boolean; id?: "score" | "cons3" };
type Seccion = { t: string; vars: Var[] };
const COLUMNAS: Seccion[][] = [
  [
    { t: "DATOS PERSONALES", vars: [{ t: "Edad Mayor a:", v: "21", on: true }, { t: "Edad Menor a:", v: "75", on: true }, { t: "Fallecido:", v: "NO", on: true, sel: true }, { t: "% Coinc. (Nombre):", v: "" }, { t: "Rechazar provincias:", v: "1 selecc.", on: true, sel: true }] },
    { t: "OCUPACIÓN / LABORAL", vars: [{ t: "Jubilado:", sel: true }, { t: "Monotributo:", sel: true }, { t: "Cat. Monotributo:", sel: true }, { t: "Autónomo:", sel: true }, { t: "Empleada Doméstica:", sel: true }] },
  ],
  [
    { t: "OCUPACIÓN / LABORAL (CONT.)", vars: [{ t: "Rel. Dependencia:", sel: true }] },
    { t: "ANTIGÜEDAD LABORAL", vars: [{ t: "Ant. Monotributo:" }, { t: "Ant. Autónomo:" }, { t: "Antig. Laboral:" }, { t: "Ant. Empleo Actual:" }] },
    { t: "SITUACIÓN CREDITICIA", vars: [{ t: "Peor Sit. Vigente:", v: "1", on: true }, { t: "Bancarizado:", sel: true }, { t: "Antig. Bancarizado:" }, { t: "Peor Sit. 6M:", v: "2", on: true }] },
  ],
  [
    { t: "SITUACIÓN CREDITICIA (CONT.)", vars: [{ t: "Peor Sit. 12M:", v: "3", on: true }, { t: "Compromiso Mensual:" }] },
    { t: "MOROSIDAD Y LEGALES", vars: [{ t: "Cheques Rechazados:", v: "0", on: true }, { t: "Juicio 12M:", v: "0", on: true }, { t: "Conc. y Quiebra 12M:", v: "0", on: true }, { t: "Ref. Comerciales:", sel: true }] },
    { t: "SCORE / NSE", vars: [{ t: "Score:", v: "350", on: true, id: "score" }, { t: "Nivel Socioeconómico:", sel: true }, { t: "Percentil NSE:" }, { t: "Consultas Financ. 1M:", v: "3", on: true }, { t: "Consultas Financ. 3M:", v: "", id: "cons3" }] },
  ],
];
const CONFIGS = ["Bureau A - Alto Riesgo", "Bureau A - Básica", "Bureau A - Inicial", "Bureau A - Básica Apert."];
const valorVar = (v: Var, frame: number) => {
  if (v.id === "score") {
    return frame >= TIPEO_SCORE[0] ? tipeo(frame, "420", TIPEO_SCORE) : v.v ?? "";
  }
  if (v.id === "cons3") {
    return tipeo(frame, "5", TIPEO_CONS);
  }
  return v.v ?? "";
};
const encendida = (v: Var, frame: number) => (v.id === "cons3" ? interpolate(frame, [TAP_TOGGLE + 1, TAP_TOGGLE + 6], [0, 1], clamp) : v.on ? 1 : 0);
const focoVar = (v: Var, frame: number) => (v.id === "score" ? frame >= TAP_SCORE && frame < TAP_TOGGLE : v.id === "cons3" ? frame >= TAP_TOGGLE + 4 && frame < TAP_GUARDAR_CFG : false);

// Tablet layout of the setup panel (content coords).
const SETUP = { x: 360, y: 70, w: 752, h: 690, colW: 232, gap: 12, top: 52, sec: 28, fila: 36, sep: 6 };
const posVar = (id: "score" | "cons3") => {
  for (let c = 0; c < COLUMNAS.length; c++) {
    let y = SETUP.top;
    for (const s of COLUMNAS[c]) {
      y += SETUP.sec;
      for (const v of s.vars) {
        if (v.id === id) {
          return { c, y };
        }
        y += SETUP.fila + SETUP.sep;
      }
    }
  }
  return { c: 0, y: 0 };
};

const VariablesTab: React.FC<{ frame: number }> = ({ frame }) => (
  <div style={{ position: "absolute", left: SIDE, top: HEADER, right: 0, bottom: 0, background: "white" }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 26, textAlign: "center", fontSize: 15, color: "#4b5563" }}>Configuración de variables para evaluación Bureau A</div>
    <div style={{ position: "absolute", left: 70, top: 70, width: 272, height: 286, background: PANEL, borderRadius: 12, padding: 16, boxSizing: "border-box" }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>Configuraciones</div>
      <div style={{ marginTop: 12, background: "white", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ display: "flex", height: 30, background: NAVY, color: "white", fontSize: 11, fontWeight: 600, alignItems: "center" }}>
          <div style={{ flex: 1, textAlign: "center", borderRight: "1px solid rgba(255,255,255,0.3)" }}>Nombre</div>
          <div style={{ width: 84, textAlign: "center" }}>Acciones</div>
        </div>
        {CONFIGS.map((n, i) => (
          <div key={n} style={{ display: "flex", height: 46, alignItems: "center", borderTop: `1px solid ${BORDE}`, fontSize: 11, color: TINTA, background: i === 1 ? "#eef4fb" : "white", opacity: aparece(frame, 6 + i * 3) }}>
            <div style={{ flex: 1, textAlign: "center", fontWeight: i === 1 ? 700 : 500 }}>{n}</div>
            <div style={{ width: 84, display: "flex", justifyContent: "center", gap: 14 }}>
              <div style={{ width: 16, height: 16, borderRadius: 3, background: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icono d={I.editar} s={11} w={2.4} />
              </div>
              <div style={{ width: 16, height: 16, borderRadius: 3, border: "1.6px solid #dc2626", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icono d={I.cruz} s={10} c="#dc2626" w={3} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    <div style={{ position: "absolute", left: SETUP.x, top: SETUP.y, width: SETUP.w, height: SETUP.h, background: PANEL, borderRadius: 12 }}>
      <div style={{ position: "absolute", left: 18, top: 16, fontSize: 14, fontWeight: 700, color: NAVY }}>Setup de Variables</div>
      <div style={{ position: "absolute", right: 18, top: 12, height: 28, padding: "0 16px", borderRadius: 6, background: NAVY, color: "white", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", transform: `scale(${1 - pulsado(frame, TAP_GUARDAR_CFG) * 0.07})` }}>Guardar</div>
      {COLUMNAS.map((col, c) => {
        let y = SETUP.top;
        const piezas: React.ReactNode[] = [];
        col.forEach((s, si) => {
          piezas.push(
            <div key={`s${si}`} style={{ position: "absolute", left: 0, top: y, width: SETUP.colW, height: SETUP.sec - 4, borderBottom: `2px solid ${NAVY}`, fontSize: 9.5, fontWeight: 700, letterSpacing: 0.6, color: NAVY, display: "flex", alignItems: "center", paddingLeft: 8, boxSizing: "border-box" }}>
              {s.t}
            </div>,
          );
          y += SETUP.sec;
          s.vars.forEach((v, vi) => {
            const valor = valorVar(v, frame);
            piezas.push(
              <div key={`v${si}-${vi}`} style={{ position: "absolute", left: 0, top: y, width: SETUP.colW, height: SETUP.fila, background: "white", borderRadius: 4, display: "flex", alignItems: "center", padding: "0 8px", gap: 8, boxSizing: "border-box", fontSize: 10.5, color: TINTA, opacity: aparece(frame, 10 + c * 4 + vi * 2) }}>
                <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden" }}>{v.t}</span>
                <Campo v={valor} w={64} h={24} sel={v.sel} foco={focoVar(v, frame)} fs={10.5} cursor={focoVar(v, frame) && Math.floor(frame / 8) % 2 === 0} />
                <div style={{ transform: `scale(${v.id === "cons3" ? 1 - pulsado(frame, TAP_TOGGLE) * 0.12 : 1})` }}>
                  <Toggle on={encendida(v, frame)} />
                </div>
              </div>,
            );
            y += SETUP.fila + SETUP.sep;
          });
        });
        return (
          <div key={c} style={{ position: "absolute", left: 16 + c * (SETUP.colW + SETUP.gap), top: 0 }}>
            {piezas}
          </div>
        );
      })}
    </div>
  </div>
);

// ---------- Workflow editor ----------
type Nodo = { id: string; t: string; x: number; y: number; tipo: "inicio" | "decision" | "fin" | "accion"; franja?: string };
// Workflow coordinates (1300 x 500 canvas), in build order.
const NODOS: Nodo[] = [
  { id: "inicio", t: "Score", x: 60, y: 350, tipo: "inicio" },
  { id: "sb", t: "Score Bureau A", x: 200, y: 350, tipo: "decision" },
  { id: "manual", t: "Score Manual", x: 350, y: 410, tipo: "accion" },
  { id: "vendedor", t: "Rechazado por Vendedor", x: 540, y: 420, tipo: "fin" },
  { id: "sit", t: "Sit. Deudores", x: 445, y: 290, tipo: "decision" },
  { id: "problema", t: "Problema en Deudores", x: 610, y: 340, tipo: "fin" },
  { id: "monto", t: "Monto Deudores", x: 530, y: 175, tipo: "decision" },
  { id: "mayor", t: "Monto mayor en Deudores", x: 670, y: 245, tipo: "fin" },
  { id: "auto", t: "Posee Auto?", x: 630, y: 85, tipo: "decision" },
  { id: "noauto", t: "No posee auto", x: 760, y: 145, tipo: "fin" },
  { id: "edad", t: "Edad", x: 775, y: 30, tipo: "accion", franja: "#10b981" },
  { id: "menor", t: "Es menor de edad", x: 885, y: 290, tipo: "decision" },
  { id: "menorfin", t: "Menor de edad", x: 1015, y: 350, tipo: "fin" },
  { id: "minimo", t: "Score mínimo", x: 1005, y: 225, tipo: "accion", franja: "#8b5cf6" },
  { id: "ajustado", t: "Score ajustado", x: 1115, y: 135, tipo: "decision" },
  { id: "bajo", t: "Score bajo", x: 1240, y: 215, tipo: "fin" },
  { id: "tendencia", t: "Tendencia Score", x: 1245, y: 65, tipo: "accion", franja: "#f59e0b" },
];
const ARISTAS: [string, string, "arriba" | "abajo" | "der"][] = [
  ["inicio", "sb", "der"],
  ["sb", "manual", "abajo"],
  ["manual", "vendedor", "der"],
  ["sb", "sit", "arriba"],
  ["manual", "sit", "arriba"],
  ["sit", "problema", "abajo"],
  ["sit", "monto", "arriba"],
  ["monto", "mayor", "abajo"],
  ["monto", "auto", "arriba"],
  ["auto", "noauto", "abajo"],
  ["auto", "edad", "arriba"],
  ["edad", "menor", "der"],
  ["menor", "menorfin", "abajo"],
  ["menor", "minimo", "arriba"],
  ["minimo", "ajustado", "der"],
  ["ajustado", "bajo", "abajo"],
  ["ajustado", "tendencia", "arriba"],
];
const DIAG = 70; // half diagonal of the decision diamonds
const RECT = { w: 128, h: 44 };
const nodo = (id: string) => NODOS.find((n) => n.id === id) as Nodo;
const idxNodo = (id: string) => NODOS.findIndex((n) => n.id === id);
const salida = (n: Nodo, lado: "arriba" | "abajo" | "der") => {
  if (n.tipo === "decision") {
    return lado === "arriba" ? { x: n.x + DIAG * 0.62, y: n.y - DIAG * 0.38 } : lado === "abajo" ? { x: n.x + DIAG * 0.62, y: n.y + DIAG * 0.38 } : { x: n.x + DIAG, y: n.y };
  }
  if (n.tipo === "inicio") {
    return { x: n.x + 42, y: n.y };
  }
  return lado === "arriba" ? { x: n.x + RECT.w / 2, y: n.y - 6 } : lado === "abajo" ? { x: n.x + RECT.w / 2, y: n.y + 6 } : { x: n.x + RECT.w / 2, y: n.y };
};
const entrada = (n: Nodo) => (n.tipo === "decision" ? { x: n.x - DIAG, y: n.y } : { x: n.x - RECT.w / 2, y: n.y });
const nodoVis = (frame: number, k: number) => aparece(frame, NODO_0 + k * NODO_PASO, 10);

const Workflow: React.FC<{ frame: number; fs?: number }> = ({ frame, fs = 12 }) => (
  <svg width={1300} height={500} style={{ overflow: "visible" }}>
    {ARISTAS.map(([a, b, lado]) => {
      const p = salida(nodo(a), lado);
      const q = entrada(nodo(b));
      const t = interpolate(frame, [NODO_0 + idxNodo(b) * NODO_PASO - 6, NODO_0 + idxNodo(b) * NODO_PASO + 6], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
      const dx = Math.max(30, Math.abs(q.x - p.x) * 0.5);
      const d = `M ${p.x} ${p.y} C ${p.x + dx} ${p.y} ${q.x - dx} ${q.y} ${q.x} ${q.y}`;
      return (
        <g key={`${a}-${b}`} opacity={t > 0 ? 1 : 0}>
          <path d={d} fill="none" stroke="#4b5563" strokeWidth={1.8} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - t} />
          <circle cx={p.x} cy={p.y} r={4} fill="#111" />
          <circle cx={q.x} cy={q.y} r={4} fill="#111" opacity={t > 0.95 ? 1 : 0} />
        </g>
      );
    })}
    {NODOS.map((n, k) => {
      const v = nodoVis(frame, k);
      if (v <= 0.001) {
        return null;
      }
      const s = 0.7 + 0.3 * v;
      const texto = (w: number) => (
        <foreignObject x={-w / 2} y={-20} width={w} height={40}>
          <div style={{ width: w, height: 40, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontSize: fs, fontWeight: 700, color: "white", lineHeight: 1.15, fontFamily: FUENTE }}>{n.t}</div>
        </foreignObject>
      );
      return (
        <g key={n.id} transform={`translate(${n.x} ${n.y}) scale(${s})`} opacity={v}>
          {n.tipo === "inicio" ? (
            <>
              <ellipse rx={42} ry={33} fill="#22c55e" stroke="#15803d" strokeWidth={1.5} />
              {texto(80)}
            </>
          ) : n.tipo === "decision" ? (
            <>
              <rect x={-DIAG / Math.SQRT2} y={-DIAG / Math.SQRT2} width={(DIAG * 2) / Math.SQRT2} height={(DIAG * 2) / Math.SQRT2} transform="rotate(45)" fill="#245e80" stroke="#1d4ed8" strokeWidth={1.5} />
              {texto(96)}
            </>
          ) : (
            <>
              <rect x={-RECT.w / 2} y={-RECT.h / 2} width={RECT.w} height={RECT.h} rx={5} fill={n.tipo === "accion" ? "#2f3237" : "#3a4254"} stroke="rgba(0,0,0,0.25)" />
              {n.franja ? <rect x={-RECT.w / 2} y={-RECT.h / 2} width={10} height={RECT.h} rx={2} fill={n.franja} /> : null}
              {texto(RECT.w - 12)}
            </>
          )}
        </g>
      );
    })}
  </svg>
);

const PALETA: [string, string][] = [
  ["Comentario", "M4 5 H20 V16 H9 L5 20 V16 H4 Z"],
  ["Cálculo", "M6 3 H18 V21 H6 Z M9 7 H15 M9 12 H10 M14 12 H15 M9 16 H10 M14 16 H15"],
  ["Decisión", "M6 12 A2 2 0 1 1 6 12.01 M18 6 A2 2 0 1 1 18 6.01 M18 18 A2 2 0 1 1 18 18.01 M8 11 L16 7 M8 13 L16 17"],
  ["Fecha", "M4 6 H20 V20 H4 Z M4 10 H20 M8 3 V7 M16 3 V7"],
  ["Fin", "M6 6 H18 V18 H6 Z"],
  ["Función", "M9 20 V5 H17 M9 12 H15"],
  ["Gate Manual", I.persona],
  ["Inicio", "M7 5 L19 12 L7 19 Z"],
  ["Matrix", "M4 5 H20 V19 H4 Z M4 10 H20 M4 14.5 H20 M10 5 V19"],
];
const CANVAS = { x: 262, y: 20, w: 852, h: 730, gx: 14, gy: 54, gw: 824, gh: 660 };
const WF_ESC_TAB = 0.62;

const WorkflowTab: React.FC<{ frame: number }> = ({ frame }) => {
  const f0 = ESC.workflow[0];
  const boton = (t: string, bg: string, c = "white", press = 0) => (
    <div key={t} style={{ height: 32, borderRadius: 6, background: bg, color: c, fontSize: 11.5, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 10, transform: `scale(${1 - press * 0.06})` }}>{t}</div>
  );
  return (
    <div style={{ position: "absolute", left: SIDE, top: HEADER, right: 0, bottom: 0, background: "white" }}>
      <div style={{ position: "absolute", left: 20, top: 20, width: 228 }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: TINTA }}>Nodos de Decisión</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
          {PALETA.map(([n, d], i) => (
            <div key={n} style={{ height: 38, borderRadius: 6, background: "#d7ebf5", display: "flex", alignItems: "center", gap: 7, padding: "0 10px", fontSize: 10, color: TINTA, gridColumn: i === 8 ? "1 / span 2" : undefined, width: i === 8 ? 104 : undefined, justifySelf: i === 8 ? "center" : undefined, opacity: aparece(frame, f0 + 6 + i * 2) }}>
              <Icono d={d} s={15} c="#1d4ed8" w={2.2} /> {n}
            </div>
          ))}
        </div>
        <div style={{ borderTop: `1px solid ${BORDE}`, marginTop: 14, paddingTop: 4 }}>
          {boton("Nuevo Workflow", "#15803d")}
          {boton("Guardar", "#0d6efd", "white", pulsado(frame, TAP_GUARDAR_WF))}
          {boton("Limpiar Canvas", "#6b7280")}
          {boton("Eliminar (0)", "#e5e7eb", "#9ca3af")}
        </div>
        <div style={{ display: "flex", justifyContent: "space-around", marginTop: 16, fontSize: 16, color: TINTA }}>
          <span>+</span>
          <span>−</span>
          <span>⛶</span>
          <span>🔒</span>
        </div>
        <div style={{ marginTop: 16, background: "#f6f7f9", borderRadius: 8, padding: "12px 14px" }}>
          <div style={{ fontSize: 12.5, color: TINTA }}>Workflow Activo:</div>
          <div style={{ fontSize: 11, color: TINTA_2, marginTop: 4 }}>wf-Evaluacion</div>
          <div style={{ marginTop: 12, height: 32, borderRadius: 6, background: "#6d5dfc", color: "white", fontSize: 11.5, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Icono d={I.libro} s={14} w={2.2} /> Explicar workflow
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: CANVAS.x, top: CANVAS.y, width: CANVAS.w, height: CANVAS.h, background: "#eef0f2", borderRadius: 4 }}>
        <div style={{ position: "absolute", right: 14, top: 12, height: 28, padding: "0 14px", borderRadius: 5, border: "1px solid #93c5fd", background: "#eff6ff", color: AZUL, fontSize: 11, display: "flex", alignItems: "center" }}>Workflows Guardados</div>
        <div style={{ position: "absolute", left: CANVAS.gx, top: CANVAS.gy, width: CANVAS.gw, height: CANVAS.gh, background: "#a3a3a3", backgroundImage: "linear-gradient(rgba(0,0,0,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.08) 1px, transparent 1px)", backgroundSize: "16px 16px", overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 14, top: 160, transform: `scale(${WF_ESC_TAB})`, transformOrigin: "0 0" }}>
            <Workflow frame={frame} fs={14.5} />
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- Risk matrix ----------
const COLS_M = ["A", "B", "C1", "C2", "C3", "D1", "D2"];
const FILAS_M = ["1-100", "101-200", "201-300", "301-400", "401-500", "501-600", "601-700", "701-800", "801-900", "901-1000"];
const MATRIZ = ["DDDDDDD", "CCCCDDD", "BBBBCDD", "ABBBBCD", "AABBBBC", "AAAABBB", "AAAABBB", "AAAAABB", "AAAAAAB", "AAAAAAA"];
const CELDA_EDIT = { r: 4, c: 4 }; // 401-500 x C3: B -> C on tap
const COLOR_RIESGO: Record<string, string> = { A: "#4caf50", B: "#ffeb3b", C: "#ff9800", D: "#f44336" };
const valorCelda = (r: number, c: number, frame: number) => (r === CELDA_EDIT.r && c === CELDA_EDIT.c && frame >= TAP_CELDA + 2 ? "C" : MATRIZ[r][c]);
const llenado = (frame: number, r: number, c: number) => aparece(frame, TAP_GENERAR + 6 + (9 - r) * 3 + c * 2, 8);

const Grilla: React.FC<{ frame: number; cw: number; ch: number; lw: number; gap: number; fs: number }> = ({ frame, cw, ch, lw, gap, fs }) => (
  <div style={{ position: "relative" }}>
    <div style={{ display: "flex", gap, marginLeft: lw + gap }}>
      {COLS_M.map((c) => (
        <div key={c} style={{ width: cw, height: ch, borderRadius: 4, background: NAVY, color: "white", fontSize: fs, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {c}
        </div>
      ))}
    </div>
    {FILAS_M.map((f, r) => (
      <div key={f} style={{ display: "flex", gap, marginTop: gap }}>
        <div style={{ width: lw, height: ch, borderRadius: 4, background: NAVY, color: "white", fontSize: fs - 0.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{f}</div>
        {COLS_M.map((c, ci) => {
          const t = llenado(frame, r, ci);
          const v = valorCelda(r, ci, frame);
          const edit = r === CELDA_EDIT.r && ci === CELDA_EDIT.c;
          const press = edit ? pulsado(frame, TAP_CELDA) : 0;
          return (
            <div key={c} style={{ width: cw, height: ch, borderRadius: 4, background: t > 0.5 ? COLOR_RIESGO[v] : "white", border: `1px solid ${t > 0.5 ? "rgba(0,0,0,0.08)" : BORDE}`, boxSizing: "border-box", fontSize: fs, fontWeight: 600, color: "#1f2937", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${(0.85 + 0.15 * t) * (1 + press * 0.15)})`, boxShadow: press > 0 ? "0 0 0 2px #1d4ed8" : "none" }}>
              {t > 0.5 ? v : ""}
            </div>
          );
        })}
      </div>
    ))}
  </div>
);

const MATRIZ_BOX = { x: 330, y: 40, w: 780, h: 690, bx: 24, by: 56, bw: 732, bh: 520 };
const GRILLA_TAB = { cw: 52, ch: 30, lw: 70, gap: 4 };
const grillaOrigenTab = () => {
  const ancho = GRILLA_TAB.lw + GRILLA_TAB.gap + 7 * (GRILLA_TAB.cw + GRILLA_TAB.gap);
  const alto = 11 * (GRILLA_TAB.ch + GRILLA_TAB.gap);
  return { x: MATRIZ_BOX.x + MATRIZ_BOX.bx + (MATRIZ_BOX.bw - ancho) / 2 + 10, y: MATRIZ_BOX.y + MATRIZ_BOX.by + (MATRIZ_BOX.bh - alto) / 2 - 14, ancho, alto };
};

const ParametroFila: React.FC<{ k: string; v: string; w?: number }> = ({ k, v, w = 100 }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11, color: TINTA, marginTop: 8 }}>
    {k}
    <Campo v={v} w={w} h={28} fs={11} />
  </div>
);
const MatrizTab: React.FC<{ frame: number }> = ({ frame }) => {
  const o = grillaOrigenTab();
  return (
    <div style={{ position: "absolute", left: SIDE, top: HEADER, right: 0, bottom: 0, background: "white" }}>
      <div style={{ position: "absolute", left: 40, top: 40, width: 270, height: 690, background: PANEL, borderRadius: 12, padding: "18px 20px", boxSizing: "border-box" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>Parámetros</div>
        <div style={{ background: "white", borderRadius: 8, padding: "6px 12px 12px", marginTop: 14 }}>
          <ParametroFila k="Nombre:" v="Riesgo Medio" />
        </div>
        <div style={{ background: "white", borderRadius: 8, padding: "12px 12px", marginTop: 12 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: NAVY, letterSpacing: 0.4 }}>EJE X (COLUMNAS)</div>
          <div style={{ marginTop: 8 }}>
            <Campo v="NSE Bureau A" w={206} h={30} sel fs={11} />
          </div>
          <div style={{ fontSize: 9.5, color: TINTA_2, marginTop: 8 }}>Categorías: A, B, C1, C2, C3, D1, D2</div>
        </div>
        <div style={{ background: "white", borderRadius: 8, padding: "12px 12px", marginTop: 12 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: NAVY, letterSpacing: 0.4 }}>EJE Y (FILAS)</div>
          <div style={{ marginTop: 8 }}>
            <Campo v="Score Bureau A" w={206} h={30} sel fs={11} />
          </div>
          <ParametroFila k="Mínimo:" v="1" />
          <ParametroFila k="Máximo:" v="1000" />
          <ParametroFila k="# segmentos:" v="10" />
        </div>
        <div style={{ marginTop: 16, height: 34, borderRadius: 6, background: NAVY, color: "white", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 - pulsado(frame, TAP_GENERAR) * 0.06})` }}>Generar Matriz</div>
        <div style={{ marginTop: 10, height: 34, borderRadius: 6, background: "#e8f3fc", border: "1px solid #bfdbfe", color: NAVY, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>Configuraciones</div>
      </div>
      <div style={{ position: "absolute", left: MATRIZ_BOX.x, top: MATRIZ_BOX.y, width: MATRIZ_BOX.w, height: MATRIZ_BOX.h, background: PANEL, borderRadius: 12 }}>
        <div style={{ position: "absolute", left: 24, top: 20, fontSize: 14, fontWeight: 700, color: NAVY }}>Matriz de Riesgo</div>
        <div style={{ position: "absolute", left: MATRIZ_BOX.bx, top: MATRIZ_BOX.by, width: MATRIZ_BOX.bw, height: MATRIZ_BOX.bh, borderRadius: 12, border: `1.5px solid ${NAVY}`, background: "#eef4fb", backgroundImage: "radial-gradient(#cdd9e8 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
        <div style={{ position: "absolute", left: o.x - MATRIZ_BOX.x - 34, top: o.y - MATRIZ_BOX.y + o.alto / 2, transform: "rotate(-90deg) translateX(-50%)", transformOrigin: "0 0", fontSize: 10.5, fontWeight: 700, letterSpacing: 1, color: NAVY, whiteSpace: "nowrap" }}>SCORE BUREAU A</div>
        <div style={{ position: "absolute", left: o.x - MATRIZ_BOX.x + GRILLA_TAB.lw, width: o.ancho - GRILLA_TAB.lw, top: o.y - MATRIZ_BOX.y + o.alto + 10, textAlign: "center", fontSize: 10.5, fontWeight: 700, letterSpacing: 1, color: NAVY }}>NSE BUREAU A</div>
        <div style={{ position: "absolute", left: o.x - MATRIZ_BOX.x, top: o.y - MATRIZ_BOX.y }}>
          <Grilla frame={frame} {...GRILLA_TAB} fs={11} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 594, textAlign: "center", fontSize: 10.5, color: TINTA_2 }}>
          <b style={{ color: AZUL, fontWeight: 600 }}>Click</b> cicla A → B → C → D · <b style={{ color: AZUL, fontWeight: 600 }}>Arrastrar</b> pinta con la categoría de la celda donde arrancaste
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 626, display: "flex", justifyContent: "center", gap: 12 }}>
          <div style={{ height: 34, padding: "0 22px", borderRadius: 6, background: "#e8f3fc", border: "1px solid #bfdbfe", color: NAVY, fontSize: 12, display: "flex", alignItems: "center" }}>Limpiar</div>
          <div style={{ height: 34, padding: "0 22px", borderRadius: 6, background: NAVY, color: "white", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", transform: `scale(${1 - pulsado(frame, TAP_ACTUALIZAR) * 0.06})` }}>Actualizar</div>
        </div>
      </div>
    </div>
  );
};

// ---------- Risk pricing ----------
type FilaPrecio = [string, number, number, number, number];
const TABLAS: { t: string; filas: FilaPrecio[] }[] = [
  { t: "Estrategia de Riesgos - Primarios", filas: [["A", 15, 7, 291, 215000], ["B", 15, 7, 291, 172000], ["C", 10, 7, 291, 143000], ["D", 10, 7, 291, 115000]] },
  { t: "Estrategia de Riesgos - Renovados", filas: [["A", 25, 7, 234, 215000], ["B", 20, 7, 252, 215000], ["C", 15, 7, 257, 215000], ["D", 10, 7, 291, 215000]] },
  { t: "Estrategia de Riesgos - Renovados 1", filas: [["A", 35, 7, 234, 350000], ["B", 30, 7, 252, 300000], ["C", 25, 7, 257, 250000], ["D", 15, 7, 291, 215000]] },
  { t: "Estrategia de Riesgos - Renovados 2", filas: [["A", 35, 7, 234, 350000], ["B", 30, 7, 252, 300000], ["C", 25, 7, 257, 250000], ["D", 15, 7, 291, 215000]] },
];
const COLOR_NIVEL: Record<string, string> = { A: "#16a34a", B: "#eab308", C: "#f97316", D: "#dc2626" };
const montoTxt = (n: number) => `$ ${n.toLocaleString("es-AR")}`;
const montoEditado = (frame: number) => {
  if (frame < TIPEO_MONTO[0]) {
    return montoTxt(215000);
  }
  return `$ ${tipeo(frame, "230.000", TIPEO_MONTO)}`;
};
const TablaPrecio: React.FC<{ frame: number; k: number; w: number; fila: number; fs: number; chico?: boolean }> = ({ frame, k, w, fila, fs, chico }) => {
  const tabla = TABLAS[k];
  const cols = chico ? [44, 52, 50, 52, w - 198] : [56, 126, 126, 126, w - 434];
  const cab = ["NIVEL", "RCI (%)", "PLAZO", "TNA (%)", "MONTO MÁX."];
  const t0 = ESC.pricing[0] + 6 + k * 5;
  return (
    <div style={{ width: w, background: "white", borderRadius: 8, boxShadow: "0 2px 10px rgba(20,30,50,0.10)", overflow: "hidden", opacity: aparece(frame, t0), transform: `translateY(${(1 - aparece(frame, t0)) * 10}px)` }}>
      <div style={{ height: chico ? 30 : 34, display: "flex", alignItems: "center", justifyContent: "center", fontSize: fs + 1.5, fontWeight: 600, color: TINTA, background: "#f8f9fb" }}>{tabla.t}</div>
      <div style={{ display: "flex", height: chico ? 28 : 34, background: NAVY, color: "white", fontSize: fs - 0.5, fontWeight: 600, alignItems: "center" }}>
        {cab.map((c, i) => (
          <div key={c} style={{ width: cols[i], textAlign: "center" }}>
            {c}
          </div>
        ))}
      </div>
      {tabla.filas.map(([n, rci, plazo, tna, monto]) => {
        const edit = k === 0 && n === "A";
        const foco = edit && frame >= TAP_MONTO && frame < TAP_GUARDAR_PR;
        const vals = [String(rci), String(plazo), String(tna), edit ? montoEditado(frame) : montoTxt(monto)];
        return (
          <div key={n} style={{ display: "flex", height: fila, alignItems: "center", borderTop: `1px solid ${BORDE}` }}>
            <div style={{ width: cols[0], display: "flex", justifyContent: "center" }}>
              <div style={{ width: chico ? 18 : 22, height: chico ? 18 : 22, borderRadius: "50%", background: COLOR_NIVEL[n], color: "white", fontSize: fs, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{n}</div>
            </div>
            {vals.map((v, i) => (
              <div key={i} style={{ width: cols[i + 1], display: "flex", justifyContent: "center" }}>
                <Campo v={v} w={cols[i + 1] - (chico ? 8 : 20)} h={chico ? 26 : 34} fs={fs} foco={i === 3 && foco} cursor={i === 3 && foco && Math.floor(frame / 8) % 2 === 0} />
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};
const PRECIO_TAB = { x: [30, 584], y: [118, 398], w: 520, fila: 44 };
const PricingTab: React.FC<{ frame: number }> = ({ frame }) => (
  <div style={{ position: "absolute", left: SIDE, top: HEADER, right: 0, bottom: 0, background: "white" }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 26, textAlign: "center", fontSize: 16, fontWeight: 600, color: TINTA }}>Configuración de Risk Pricing Model</div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 54, textAlign: "center", fontSize: 12, color: TINTA_2 }}>Define los parámetros de tasa, plazo y montos por nivel de riesgo.</div>
    <div style={{ position: "absolute", left: 30, top: 76, height: 30, padding: "0 16px", borderRadius: 6, background: NAVY, color: "white", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
      <Icono d={I.mas} s={12} w={2.6} /> Crear tabla
    </div>
    <div style={{ position: "absolute", right: 30, top: 76, height: 30, padding: "0 16px", borderRadius: 6, background: VERDE, color: "white", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", transform: `scale(${1 - pulsado(frame, TAP_GUARDAR_PR) * 0.07})` }}>Guardar cambios</div>
    {TABLAS.map((_, k) => (
      <div key={k} style={{ position: "absolute", left: PRECIO_TAB.x[k % 2], top: PRECIO_TAB.y[Math.floor(k / 2)] }}>
        <TablaPrecio frame={frame} k={k} w={PRECIO_TAB.w} fila={PRECIO_TAB.fila} fs={11} />
      </div>
    ))}
  </div>
);

// ---------- Finger ----------
const posDedo = (frame: number, camino: [number, number, number][]) => {
  let p = { x: camino[0][1], y: camino[0][2] };
  for (let i = 1; i < camino.length; i++) {
    const [f, x, y] = camino[i];
    const desde = Math.max(camino[i - 1][0], f - 18);
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
const Dedo: React.FC<{ frame: number; camino: [number, number, number][] }> = ({ frame, camino }) => {
  const dedo = posDedo(frame, camino);
  const tap = TAPS.find((f) => frame >= f && frame < f + 16);
  const onda = tap === undefined ? 0 : (frame - tap) / 16;
  const presion = tap === undefined ? 0 : interpolate(frame - tap, [0, 3, 8], [0, 1, 0], clamp);
  // Hidden while the workflow builds itself.
  const vis = interpolate(frame, [44, 58], [0, 1], clamp) * (1 - interpolate(frame, [TAP_NAV_WF + 14, TAP_NAV_WF + 26, TAP_GUARDAR_WF - 30, TAP_GUARDAR_WF - 16], [0, 1, 1, 0], clamp)) * interpolate(frame, [TAP_GUARDAR_PR + 30, TAP_GUARDAR_PR + 44], [1, 0], clamp);
  return (
    <>
      {tap !== undefined ? (
        <div style={{ position: "absolute", left: dedo.x, top: dedo.y, width: 18 + onda * 52, height: 18 + onda * 52, transform: "translate(-50%, -50%)", borderRadius: "50%", border: `3px solid rgba(255,140,66,${1 - onda})`, background: `rgba(255,140,66,${(1 - onda) * 0.2})`, zIndex: 8 }} />
      ) : null}
      <div style={{ position: "absolute", left: dedo.x, top: dedo.y, width: 34, height: 34, transform: `translate(-50%, -50%) scale(${1 - presion * 0.2})`, borderRadius: "50%", background: "rgba(255,255,255,0.55)", border: "2px solid rgba(40,48,64,0.35)", boxShadow: "0 4px 10px rgba(0,0,0,0.2)", opacity: vis * 0.9, zIndex: 9 }} />
    </>
  );
};

const actualDe = (frame: number) => (Object.keys(ESC) as Escena[]).filter((e) => frame >= ESC[e][0]).pop() ?? "variables";
const visEscena = (frame: number, e: Escena) => {
  const [a, b] = ESC[e];
  return interpolate(frame, [a, a + 6, b - 6, b], [0, 1, 1, 0], clamp);
};

const sideY = (i: number) => HEADER + 24 + i * 44 + 9;
const pScore = posVar("score");
const pCons = posVar("cons3");
const xCampoTab = (c: number) => SIDE + SETUP.x + 16 + c * (SETUP.colW + SETUP.gap) + SETUP.colW - 8 - 32 - 8 - 32;
const xToggleTab = (c: number) => SIDE + SETUP.x + 16 + c * (SETUP.colW + SETUP.gap) + SETUP.colW - 8 - 16;
const celdaTab = () => {
  const o = grillaOrigenTab();
  return { x: SIDE + o.x + GRILLA_TAB.lw + GRILLA_TAB.gap + CELDA_EDIT.c * (GRILLA_TAB.cw + GRILLA_TAB.gap) + GRILLA_TAB.cw / 2, y: HEADER + o.y + (CELDA_EDIT.r + 1) * (GRILLA_TAB.ch + GRILLA_TAB.gap) + GRILLA_TAB.ch / 2 };
};
const DEDO_TAB: [number, number, number][] = [
  [0, 700, 700],
  [TAP_SCORE - 2, xCampoTab(pScore.c), HEADER + SETUP.y + pScore.y + SETUP.fila / 2],
  [TAP_TOGGLE - 2, xToggleTab(pCons.c), HEADER + SETUP.y + pCons.y + SETUP.fila / 2],
  [TAP_GUARDAR_CFG - 2, SIDE + SETUP.x + SETUP.w - 18 - 34, HEADER + SETUP.y + 26],
  [TAP_NAV_WF - 2, SIDE / 2, sideY(5)],
  [TAP_GUARDAR_WF - 2, SIDE + 20 + 114, HEADER + 20 + 26 + 10 + 4 * 46 + 15 + 4 + 42 + 16],
  [TAP_NAV_MAT - 2, SIDE / 2, sideY(7)],
  [TAP_GENERAR - 2, SIDE + 40 + 135, HEADER + 40 + 520],
  [TAP_CELDA - 2, celdaTab().x, celdaTab().y],
  [TAP_ACTUALIZAR - 2, SIDE + MATRIZ_BOX.x + MATRIZ_BOX.w / 2 + 52, HEADER + MATRIZ_BOX.y + 643],
  [TAP_NAV_PR - 2, SIDE / 2, sideY(8)],
  [TAP_MONTO - 2, SIDE + PRECIO_TAB.x[0] + 434 + (PRECIO_TAB.w - 434) / 2, HEADER + PRECIO_TAB.y[0] + 68 + PRECIO_TAB.fila / 2],
  [TAP_GUARDAR_PR - 2, PW - 30 - 56, HEADER + 91],
  [TAP_GUARDAR_PR + 40, 760, 640],
];

const PaginaTab: React.FC<{ frame: number }> = ({ frame }) => {
  const escenas: [Escena, React.FC<{ frame: number }>][] = [
    ["variables", VariablesTab],
    ["workflow", WorkflowTab],
    ["matriz", MatrizTab],
    ["pricing", PricingTab],
  ];
  const actual = actualDe(frame);
  return (
    <div style={{ position: "relative", width: PW, height: PH, background: HEADER_BG, fontFamily: FUENTE, overflow: "hidden" }}>
      {escenas.map(([e, C]) => {
        const v = visEscena(frame, e);
        if (v <= 0.001) {
          return null;
        }
        return (
          <div key={e} style={{ position: "absolute", inset: 0, opacity: v, clipPath: `inset(${HEADER}px 0 0 0)` }}>
            <C frame={frame} />
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 0, top: 0, width: PW, height: HEADER, background: HEADER_BG, display: "flex", alignItems: "center", zIndex: 5 }}>
        <div style={{ marginLeft: 20 }}>
          <Logo w={92} />
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginRight: 24 }}>
          <div style={{ width: 22, height: 22, borderRadius: "50%", border: "1.8px solid white", color: "white", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>?</div>
          <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#d6d9de" }} />
          <div style={{ fontSize: 11, fontWeight: 700, color: "white", marginLeft: -6 }}>Delfina Martinez - DMARTINEZ</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, top: HEADER, width: SIDE, bottom: 0, background: SIDE_BG, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 24, gap: 26, zIndex: 5 }}>
        {SIDE_ICONOS.map((d, i) => (
          <div key={i} style={{ transform: `scale(${i in SIDE_TAP ? 1 - pulsado(frame, SIDE_TAP[i]) * 0.2 : 1})` }}>
            <Icono d={d} s={18} c={i === SIDE_ACTIVO[actual] ? "#FF8C42" : "#e5e7eb"} />
          </div>
        ))}
      </div>
      <Toast frame={frame} desde={TAP_GUARDAR_CFG + 6} hasta={248} titulo="Configuración guardada" sub="Bureau A - Básica · Score mínimo 420" />
      <Toast frame={frame} desde={TAP_GUARDAR_WF + 6} hasta={642} titulo="Workflow guardado" sub="wf-Evaluacion · 17 nodos" />
      <Toast frame={frame} desde={TAP_ACTUALIZAR + 6} hasta={922} titulo="Matriz actualizada" sub="Riesgo Medio · Score Bureau A × NSE" />
      <Toast frame={frame} desde={TAP_GUARDAR_PR + 6} hasta={MOTOR_FRAMES} titulo="Risk Pricing guardado" sub="Primarios · Nivel A · Monto máximo $ 230.000" />
      <Dedo frame={frame} camino={DEDO_TAB} />
    </div>
  );
};

// ---------- Phone ----------
const Contenido: React.FC<{ fondo?: string; children: React.ReactNode }> = ({ fondo = "#f1f3f6", children }) => (
  <div style={{ position: "absolute", left: 0, top: M_HEADER, width: MW, height: MH - M_HEADER - M_TABS, background: fondo, overflow: "hidden" }}>{children}</div>
);
const SECCIONES_MOVIL: Seccion[] = [COLUMNAS[0][0], { t: "SITUACIÓN CREDITICIA", vars: [COLUMNAS[1][2].vars[0], COLUMNAS[1][2].vars[3], COLUMNAS[2][0].vars[0]] }, { t: "SCORE / NSE", vars: [COLUMNAS[2][2].vars[0], COLUMNAS[2][2].vars[3], COLUMNAS[2][2].vars[4]] }];
const M_VAR = { top: 92, sec: 28, fila: 40, sep: 5 };
const posVarMovil = (id: "score" | "cons3") => {
  let y = M_VAR.top;
  for (const s of SECCIONES_MOVIL) {
    y += M_VAR.sec;
    for (const v of s.vars) {
      if (v.id === id) {
        return y;
      }
      y += M_VAR.fila + M_VAR.sep;
    }
  }
  return 0;
};
const VariablesMovil: React.FC<{ frame: number }> = ({ frame }) => {
  let y = M_VAR.top;
  const piezas: React.ReactNode[] = [];
  SECCIONES_MOVIL.forEach((s, si) => {
    piezas.push(
      <div key={`s${si}`} style={{ position: "absolute", left: 12, right: 12, top: y, height: M_VAR.sec - 4, borderBottom: `2px solid ${NAVY}`, fontSize: 9.5, fontWeight: 700, letterSpacing: 0.6, color: NAVY, display: "flex", alignItems: "center", paddingLeft: 6 }}>
        {s.t}
      </div>,
    );
    y += M_VAR.sec;
    s.vars.forEach((v, vi) => {
      piezas.push(
        <div key={`v${si}-${vi}`} style={{ position: "absolute", left: 12, right: 12, top: y, height: M_VAR.fila, background: "white", borderRadius: 6, display: "flex", alignItems: "center", gap: 10, padding: "0 10px", fontSize: 11.5, color: TINTA, opacity: aparece(frame, 10 + si * 4 + vi * 2) }}>
          <span style={{ flex: 1 }}>{v.t}</span>
          <Campo v={valorVar(v, frame)} w={86} h={28} sel={v.sel} foco={focoVar(v, frame)} fs={11.5} cursor={focoVar(v, frame) && Math.floor(frame / 8) % 2 === 0} />
          <div style={{ transform: `scale(${v.id === "cons3" ? 1 - pulsado(frame, TAP_TOGGLE) * 0.12 : 1})` }}>
            <Toggle on={encendida(v, frame)} s={1.1} />
          </div>
        </div>,
      );
      y += M_VAR.fila + M_VAR.sep;
    });
  });
  return (
    <Contenido>
      <div style={{ position: "absolute", left: 14, top: 12, fontSize: 15, fontWeight: 700, color: TINTA }}>Variables Bureau A</div>
      <div style={{ position: "absolute", right: 12, top: 8, height: 30, padding: "0 16px", borderRadius: 7, background: NAVY, color: "white", fontSize: 11.5, fontWeight: 700, display: "flex", alignItems: "center", transform: `scale(${1 - pulsado(frame, TAP_GUARDAR_CFG) * 0.07})` }}>Guardar</div>
      <div style={{ position: "absolute", left: 12, top: 48, display: "flex", gap: 6, width: 700 }}>
        {CONFIGS.map((n, i) => (
          <div key={n} style={{ height: 30, padding: "0 12px", borderRadius: 15, background: i === 1 ? NAVY : "white", color: i === 1 ? "white" : TINTA, border: `1px solid ${i === 1 ? NAVY : BORDE}`, fontSize: 10.5, fontWeight: 600, display: "flex", alignItems: "center", whiteSpace: "nowrap" }}>
            {n}
          </div>
        ))}
      </div>
      {piezas}
    </Contenido>
  );
};

const WF_ESC_MOVIL = 0.62;
// The phone canvas pans so the node being built stays in view.
const X_MAX = NODOS.map((n, k) => Math.max(...NODOS.slice(0, k + 1).map((m) => m.x)));
const panWorkflow = (frame: number) => {
  const x = interpolate(frame, NODOS.map((_, k) => NODO_0 + k * NODO_PASO + 4), X_MAX, clamp);
  const destino = Math.min(Math.max(0, x * WF_ESC_MOVIL - 250), 1330 * WF_ESC_MOVIL - 366 + 10);
  return -destino;
};
const WorkflowMovil: React.FC<{ frame: number }> = ({ frame }) => {
  const f0 = ESC.workflow[0];
  return (
    <Contenido>
      <div style={{ position: "absolute", left: 14, top: 12, fontSize: 15, fontWeight: 700, color: TINTA }}>Workflow Editor</div>
      <div style={{ position: "absolute", right: 14, top: 15, fontSize: 10.5, color: TINTA_2 }}>wf-Evaluacion</div>
      <div style={{ position: "absolute", left: 12, top: 42, display: "flex", gap: 6, width: 900 }}>
        {PALETA.map(([n, d], i) => (
          <div key={n} style={{ height: 32, borderRadius: 6, background: "#d7ebf5", display: "flex", alignItems: "center", gap: 6, padding: "0 10px", fontSize: 10, color: TINTA, whiteSpace: "nowrap", opacity: aparece(frame, f0 + 6 + i * 2) }}>
            <Icono d={d} s={14} c="#1d4ed8" w={2.2} /> {n}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 12, right: 12, top: 86, height: 530, background: "#a3a3a3", backgroundImage: "linear-gradient(rgba(0,0,0,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.08) 1px, transparent 1px)", backgroundSize: "14px 14px", borderRadius: 8, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 10 + panWorkflow(frame), top: 70, transform: `scale(${WF_ESC_MOVIL})`, transformOrigin: "0 0" }}>
          <Workflow frame={frame} fs={14.5} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 12, right: 12, top: 628, display: "flex", gap: 8 }}>
        <div style={{ flex: 1, height: 44, borderRadius: 8, background: "#15803d", color: "white", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>Nuevo</div>
        <div style={{ flex: 1.4, height: 44, borderRadius: 8, background: "#0d6efd", color: "white", fontSize: 12.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 - pulsado(frame, TAP_GUARDAR_WF) * 0.06})` }}>Guardar</div>
        <div style={{ flex: 1.4, height: 44, borderRadius: 8, background: "#6d5dfc", color: "white", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Icono d={I.libro} s={14} w={2.2} /> Explicar
        </div>
      </div>
    </Contenido>
  );
};

const GRILLA_MOVIL = { cw: 40, ch: 28, lw: 58, gap: 3 };
const M_GRILLA = { x: 14, y: 176 };
const MatrizMovil: React.FC<{ frame: number }> = ({ frame }) => (
  <Contenido>
    <div style={{ position: "absolute", left: 14, top: 12, fontSize: 15, fontWeight: 700, color: TINTA }}>Matriz de Riesgo</div>
    <div style={{ position: "absolute", left: 12, right: 12, top: 42, height: 120, background: "white", borderRadius: 12, padding: "10px 14px", boxSizing: "border-box", fontSize: 10.5, color: TINTA }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: 8 }}>
        {[["Nombre", "Riesgo Medio"], ["Segmentos", "10"], ["Eje X", "NSE Bureau A"], ["Eje Y", "Score Bureau A"]].map(([k, v]) => (
          <div key={k}>
            <div style={{ fontSize: 8.5, color: TINTA_2, letterSpacing: 0.4 }}>{k.toUpperCase()}</div>
            <div style={{ fontSize: 11.5, fontWeight: 700, marginTop: 2 }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 14, right: 14, bottom: 10, height: 26, borderRadius: 6, background: NAVY, color: "white", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 - pulsado(frame, TAP_GENERAR) * 0.06})` }}>Generar Matriz</div>
    </div>
    <div style={{ position: "absolute", left: M_GRILLA.x, top: M_GRILLA.y }}>
      <Grilla frame={frame} {...GRILLA_MOVIL} fs={10} />
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 520, textAlign: "center", fontSize: 9, fontWeight: 700, letterSpacing: 1, color: NAVY }}>SCORE BUREAU A × NSE BUREAU A</div>
    <div style={{ position: "absolute", left: 12, right: 12, top: 548, display: "flex", gap: 10 }}>
      <div style={{ flex: 1, height: 42, borderRadius: 8, background: "#e8f3fc", border: "1px solid #bfdbfe", color: NAVY, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>Limpiar</div>
      <div style={{ flex: 1, height: 42, borderRadius: 8, background: NAVY, color: "white", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 - pulsado(frame, TAP_ACTUALIZAR) * 0.06})` }}>Actualizar</div>
    </div>
  </Contenido>
);

const M_PRECIO = { y: [76, 336], fila: 38 };
const PricingMovil: React.FC<{ frame: number }> = ({ frame }) => (
  <Contenido>
    <div style={{ position: "absolute", left: 14, top: 12, fontSize: 15, fontWeight: 700, color: TINTA }}>Risk Pricing Model</div>
    <div style={{ position: "absolute", left: 14, top: 34, fontSize: 10, color: TINTA_2 }}>Tasa, plazo y montos por nivel de riesgo</div>
    <div style={{ position: "absolute", right: 12, top: 10, height: 30, padding: "0 14px", borderRadius: 7, background: VERDE, color: "white", fontSize: 11.5, fontWeight: 700, display: "flex", alignItems: "center", transform: `scale(${1 - pulsado(frame, TAP_GUARDAR_PR) * 0.07})` }}>Guardar</div>
    {[0, 1].map((k) => (
      <div key={k} style={{ position: "absolute", left: 12, top: M_PRECIO.y[k] }}>
        <TablaPrecio frame={frame} k={k} w={366} fila={M_PRECIO.fila} fs={10} chico />
      </div>
    ))}
  </Contenido>
);

const TABS_MOVIL: [string, string, Escena][] = [
  ["Variables", I.variables, "variables"],
  ["Workflow", I.flujo, "workflow"],
  ["Matriz", I.capas, "matriz"],
  ["Pricing", I.sliders, "pricing"],
];
const TAP_TAB: Record<number, number> = { 1: TAP_NAV_WF, 2: TAP_NAV_MAT, 3: TAP_NAV_PR };
const tabX = (i: number) => (MW / 4) * i + MW / 8;
const DEDO_MOVIL: [number, number, number][] = [
  [0, 300, 700],
  [TAP_SCORE - 2, MW - 12 - 10 - 35 - 10 - 43, M_HEADER + posVarMovil("score") + M_VAR.fila / 2],
  [TAP_TOGGLE - 2, MW - 12 - 10 - 18, M_HEADER + posVarMovil("cons3") + M_VAR.fila / 2],
  [TAP_GUARDAR_CFG - 2, MW - 12 - 36, M_HEADER + 23],
  [TAP_NAV_WF - 2, tabX(1), MH - M_TABS / 2 - 4],
  [TAP_GUARDAR_WF - 2, 195, M_HEADER + 650],
  [TAP_NAV_MAT - 2, tabX(2), MH - M_TABS / 2 - 4],
  [TAP_GENERAR - 2, 195, M_HEADER + 42 + 120 - 23],
  [TAP_CELDA - 2, M_GRILLA.x + GRILLA_MOVIL.lw + GRILLA_MOVIL.gap + CELDA_EDIT.c * (GRILLA_MOVIL.cw + GRILLA_MOVIL.gap) + GRILLA_MOVIL.cw / 2, M_HEADER + M_GRILLA.y + (CELDA_EDIT.r + 1) * (GRILLA_MOVIL.ch + GRILLA_MOVIL.gap) + GRILLA_MOVIL.ch / 2],
  [TAP_ACTUALIZAR - 2, 290, M_HEADER + 569],
  [TAP_NAV_PR - 2, tabX(3), MH - M_TABS / 2 - 4],
  [TAP_MONTO - 2, 12 + 198 + (366 - 198) / 2, M_HEADER + M_PRECIO.y[0] + 58 + M_PRECIO.fila / 2],
  [TAP_GUARDAR_PR - 2, MW - 12 - 38, M_HEADER + 25],
  [TAP_GUARDAR_PR + 40, 300, 640],
];

const PaginaMovil: React.FC<{ frame: number }> = ({ frame }) => {
  const escenas: [Escena, React.FC<{ frame: number }>][] = [
    ["variables", VariablesMovil],
    ["workflow", WorkflowMovil],
    ["matriz", MatrizMovil],
    ["pricing", PricingMovil],
  ];
  const actual = actualDe(frame);
  return (
    <div style={{ position: "relative", width: MW, height: MH, background: HEADER_BG, fontFamily: FUENTE, overflow: "hidden" }}>
      {escenas.map(([e, C]) => {
        const v = visEscena(frame, e);
        if (v <= 0.001) {
          return null;
        }
        return (
          <div key={e} style={{ position: "absolute", inset: 0, opacity: v, clipPath: `inset(${M_HEADER}px 0 0 0)` }}>
            <C frame={frame} />
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 0, top: 0, width: MW, height: M_HEADER, background: HEADER_BG, zIndex: 5 }}>
        <div style={{ position: "absolute", left: 16, top: 52 }}>
          <Logo w={92} />
        </div>
        <div style={{ position: "absolute", right: 16, top: 50, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: "white" }}>Delfina Martinez</div>
          <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#d6d9de" }} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: M_TABS, background: "white", borderTop: `1px solid ${BORDE}`, display: "flex", zIndex: 5 }}>
        {TABS_MOVIL.map(([n, d, e], i) => {
          const col = e === actual ? "#FF8C42" : "#6b7280";
          return (
            <div key={n} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, paddingBottom: 6, transform: `scale(${i in TAP_TAB ? 1 - pulsado(frame, TAP_TAB[i]) * 0.12 : 1})` }}>
              <Icono d={d} s={19} c={col} />
              <div style={{ fontSize: 9, fontWeight: 700, color: col }}>{n}</div>
            </div>
          );
        })}
      </div>
      <Toast frame={frame} desde={TAP_GUARDAR_CFG + 6} hasta={248} titulo="Configuración guardada" sub="Bureau A - Básica · Score mínimo 420" chico />
      <Toast frame={frame} desde={TAP_GUARDAR_WF + 6} hasta={642} titulo="Workflow guardado" sub="wf-Evaluacion · 17 nodos" chico />
      <Toast frame={frame} desde={TAP_ACTUALIZAR + 6} hasta={922} titulo="Matriz actualizada" sub="Riesgo Medio · Score × NSE" chico />
      <Toast frame={frame} desde={TAP_GUARDAR_PR + 6} hasta={MOTOR_FRAMES} titulo="Risk Pricing guardado" sub="Primarios · Nivel A · $ 230.000" chico />
      <Dedo frame={frame} camino={DEDO_MOVIL} />
    </div>
  );
};

// ---------- Dynamic camera ----------
type Toma = { f: number; z: number; px: number; py: number; ry: number; rx: number; rz: number; cy: number };
const toma = (frame: number, tomas: Toma[]): Toma => {
  for (let k = 1; k < tomas.length; k++) {
    const a = tomas[k - 1];
    const b = tomas[k];
    if (frame <= b.f) {
      const t = interpolate(frame, [a.f, b.f], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
      const mezcla = (u: number, v: number) => u + (v - u) * t;
      return {
        f: frame,
        z: Math.exp(mezcla(Math.log(a.z), Math.log(b.z))),
        px: mezcla(a.px, b.px),
        py: mezcla(a.py, b.py),
        ry: mezcla(a.ry, b.ry),
        rx: mezcla(a.rx, b.rx),
        rz: mezcla(a.rz, b.rz),
        cy: mezcla(a.cy, b.cy),
      };
    }
  }
  return tomas[tomas.length - 1];
};
const tomasDe = (tab: boolean): Toma[] => {
  const c = { px: (tab ? PW : MW) / 2, py: (tab ? PH : MH) / 2 };
  const zz = tab ? 1.3 : 1.25;
  const zwf = tab ? 1.4 : 1.25;
  const izq = { ry: 14, rx: 6, rz: 1.5 };
  const der = { ry: -14, rx: 6, rz: -1.5 };
  // Score variables, the start and the end of the workflow, the pricing table.
  const score = tab ? { px: 860, py: 560 } : { px: 195, py: 560 };
  const wfIni = tab ? { px: 480, py: 470 } : { px: 195, py: 460 };
  const wfFin = tab ? { px: 950, py: 390 } : { px: 195, py: 460 };
  const precio = tab ? { px: 360, py: 300 } : { px: 195, py: 330 };
  return [
    { f: 0, z: 0.92, ...c, ry: -20, rx: 9, rz: -2.5, cy: 0.62 },
    { f: 36, z: zz, ...score, ...der, cy: 0.57 },
    { f: 168, z: zz, ...score, ...der, cy: 0.57 },
    { f: 204, z: 1, ...c, ...der, cy: 0.62 },
    { f: 236, z: 1, ...c, ...der, cy: 0.62 },
    { f: 272, z: 1, ...c, ...izq, cy: 0.62 },
    { f: 300, z: 1, ...c, ...izq, cy: 0.62 },
    { f: 336, z: zwf, ...wfIni, ...izq, cy: 0.57 },
    { f: 520, z: zwf, ...wfFin, ...izq, cy: 0.57 },
    { f: 556, z: 1, ...c, ...izq, cy: 0.62 },
    { f: 900, z: 1, ...c, ...izq, cy: 0.62 },
    { f: 936, z: 1, ...c, ...der, cy: 0.62 },
    { f: 952, z: 1, ...c, ...der, cy: 0.62 },
    { f: 986, z: zz, ...precio, ...der, cy: 0.57 },
    { f: 1040, z: zz, ...precio, ...der, cy: 0.57 },
    { f: 1076, z: 1, ...c, ...der, cy: 0.62 },
    { f: 1130, z: 1, ...c, ...der, cy: 0.62 },
    { f: MOTOR_FRAMES, z: 1.05, ...c, ...der, cy: 0.62 },
  ];
};
const TOMAS_TAB = tomasDe(true);
const TOMAS_CEL = tomasDe(false);

// The generated risk matrix lifts out of the screen and settles back.
type Salto = { x: number; y: number; w: number; h: number; f: [number, number, number, number]; z: number };
const oT = grillaOrigenTab();
const SALTOS_TAB: Salto[] = [{ x: SIDE + oT.x - 8, y: HEADER + oT.y - 8, w: oT.ancho + 16, h: oT.alto + 12, f: [748, 762, 782, 798], z: 90 }];
const SALTOS_CEL: Salto[] = [
  {
    x: M_GRILLA.x - 6,
    y: M_HEADER + M_GRILLA.y - 6,
    w: GRILLA_MOVIL.lw + GRILLA_MOVIL.gap + 7 * (GRILLA_MOVIL.cw + GRILLA_MOVIL.gap) + 9,
    h: 11 * (GRILLA_MOVIL.ch + GRILLA_MOVIL.gap) + 9,
    f: [748, 762, 782, 798],
    z: 90,
  },
];

const Pantalla: React.FC<{ frame: number; tab: boolean }> = ({ frame, tab }) => (tab ? <PaginaTab frame={frame} /> : <PaginaMovil frame={frame} />);

export const MotorDinamico: React.FC<z.infer<typeof motorSchema>> = ({ fondo, paleta }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const tab = width > height;
  const tipo = tab ? "tablet" : "celular";
  const { w, h } = pantallaDe(tipo, !tab);
  const { H: EH } = exteriorDe(tipo, w, h);
  const c = toma(frame, tab ? TOMAS_TAB : TOMAS_CEL);
  const esc = ((height * 0.64) / EH) * c.z;
  const t = spring({ frame, fps, config: { damping: 18, stiffness: 80 } });
  // Device chrome offset (padding + border) so the overlay lines up with the screen.
  const MARCO = tab ? 27 : 17;
  const dx = -(c.px - w / 2) * esc;
  // Keep the top 20% of the video free (for titles), with a margin for the tilt.
  const dy0 = -(c.py - h / 2) * esc;
  const arriba = height * c.cy + dy0 - (EH * esc) / 2;
  const dy = dy0 + Math.max(0, height * 0.23 - arriba);
  return (
    <AbsoluteFill style={{ fontFamily: FUENTE }}>
      <FondoAbstracto paleta={paleta} estilo={fondo} />
      <AbsoluteFill style={{ perspective: 2600 }}>
        <div
          style={{
            position: "absolute",
            left: width / 2,
            top: height * c.cy,
            opacity: t,
            transformStyle: "preserve-3d",
            transform: `translate(-50%, -50%) translate(${dx}px, ${dy}px) scale(${esc}) rotateY(${c.ry}deg) rotateX(${c.rx}deg) rotateZ(${c.rz}deg)`,
          }}
        >
          <Dispositivo tipo={tipo} w={w} h={h}>
            <Pantalla frame={frame} tab={tab} />
          </Dispositivo>
          <div style={{ position: "absolute", left: MARCO, top: MARCO, width: w, height: h, transformStyle: "preserve-3d" }}>
            {(tab ? SALTOS_TAB : SALTOS_CEL).map((s, i) => {
              if (frame <= s.f[0] || frame >= s.f[3]) {
                return null;
              }
              const k = interpolate(frame, s.f, [0, 1, 1, 0], { ...clamp, easing: Easing.inOut(Easing.cubic) });
              return (
                <div key={i}>
                  <div style={{ position: "absolute", left: s.x, top: s.y, width: s.w, height: s.h, borderRadius: 10, background: "#dfe6ef", opacity: Math.min(1, k * 3) }} />
                  <div style={{ position: "absolute", left: s.x, top: s.y, width: s.w, height: s.h, borderRadius: 10, overflow: "hidden", transform: `translate3d(0, ${10 * k}px, ${s.z * k}px)`, boxShadow: `0 ${30 * k}px ${60 * k}px rgba(0,0,0,${0.35 * k})` }}>
                    <div style={{ position: "absolute", left: -s.x, top: -s.y, width: w, height: h }}>
                      <Pantalla frame={frame} tab={tab} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
