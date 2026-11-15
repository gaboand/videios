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

export const MOTOR_FRAMES = 1800;

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
  pricing: [926, 1110],
  informe: [1106, 1360],
  analisis: [1356, 1580],
  dashboard: [1576, MOTOR_FRAMES + 10],
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
// Each tap pushes one cell a level worse, always next to (not diagonal from)
// the zone of that color and to the previous cell of its group: four orange
// to red, four yellow to orange, four green to yellow.
const CAMBIOS = [
  { r: 1, c: 3, f: 748 },
  { r: 1, c: 2, f: 757 },
  { r: 1, c: 1, f: 766 },
  { r: 1, c: 0, f: 775 },
  { r: 3, c: 4, f: 784 },
  { r: 3, c: 3, f: 793 },
  { r: 3, c: 2, f: 802 },
  { r: 2, c: 3, f: 811 },
  { r: 5, c: 3, f: 820 },
  { r: 6, c: 3, f: 829 },
  { r: 7, c: 3, f: 838 },
  { r: 7, c: 4, f: 847 },
];
const TAP_ACTUALIZAR = 866;
const TAP_NAV_PR = 918;
const TAP_MONTO = 962;
const TIPEO_MONTO = [968, 990];
const TAP_GUARDAR_PR = 1030;
const TAP_NAV_INF = 1100;
const TAP_DNI = 1124;
const TIPEO_DNI = [1128, 1144];
const TAP_BUSCAR_INF = 1152;
const INFORME = 1160;
const TAP_NAV_AN = 1352;
const TAP_MES_ANT = 1386;
const TAP_NAV_DASH = 1572;
const TAPS = [TAP_SCORE, TAP_TOGGLE, TAP_GUARDAR_CFG, TAP_NAV_WF, TAP_GUARDAR_WF, TAP_NAV_MAT, TAP_GENERAR, ...CAMBIOS.map((c) => c.f), TAP_ACTUALIZAR, TAP_NAV_PR, TAP_MONTO, TAP_GUARDAR_PR, TAP_NAV_INF, TAP_DNI, TAP_BUSCAR_INF, TAP_NAV_AN, TAP_MES_ANT, TAP_NAV_DASH];

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
const SIDE_ACTIVO: Record<Escena, number> = { variables: 1, workflow: 5, matriz: 7, pricing: 8, informe: 9, analisis: 3, dashboard: 10 };
const SIDE_TAP: Record<number, number> = { 5: TAP_NAV_WF, 7: TAP_NAV_MAT, 8: TAP_NAV_PR, 9: TAP_NAV_INF, 3: TAP_NAV_AN, 10: TAP_NAV_DASH };

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
const COLOR_RIESGO: Record<string, string> = { A: "#4caf50", B: "#ffeb3b", C: "#ff9800", D: "#f44336" };
const NIVELES = "ABCD";
const valorCelda = (r: number, c: number, frame: number) => {
  const n = CAMBIOS.filter((m) => m.r === r && m.c === c && frame >= m.f + 2).length;
  return NIVELES[Math.min(3, NIVELES.indexOf(MATRIZ[r][c]) + n)];
};
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
          const cambio = CAMBIOS.find((m) => m.r === r && m.c === ci);
          const press = cambio ? pulsado(frame, cambio.f) : 0;
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
// Evaluation report card (content coords).
const INF = { x: 30, y: 102, w: 1074, h: 652, colIzq: 24, colDer: 556, colW: 494 };
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
  const vis = interpolate(frame, [44, 58], [0, 1], clamp) * (1 - interpolate(frame, [TAP_NAV_WF + 14, TAP_NAV_WF + 26, TAP_GUARDAR_WF - 30, TAP_GUARDAR_WF - 16], [0, 1, 1, 0], clamp)) * interpolate(frame, [TAP_NAV_DASH + 30, TAP_NAV_DASH + 44], [1, 0], clamp);
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
const celdaTab = (r: number, c: number) => {
  const o = grillaOrigenTab();
  return { x: SIDE + o.x + GRILLA_TAB.lw + GRILLA_TAB.gap + c * (GRILLA_TAB.cw + GRILLA_TAB.gap) + GRILLA_TAB.cw / 2, y: HEADER + o.y + (r + 1) * (GRILLA_TAB.ch + GRILLA_TAB.gap) + GRILLA_TAB.ch / 2 };
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
  ...CAMBIOS.map((m): [number, number, number] => [m.f - 2, celdaTab(m.r, m.c).x, celdaTab(m.r, m.c).y]),
  [TAP_ACTUALIZAR - 2, SIDE + MATRIZ_BOX.x + MATRIZ_BOX.w / 2 + 52, HEADER + MATRIZ_BOX.y + 643],
  [TAP_NAV_PR - 2, SIDE / 2, sideY(8)],
  [TAP_MONTO - 2, SIDE + PRECIO_TAB.x[0] + 434 + (PRECIO_TAB.w - 434) / 2, HEADER + PRECIO_TAB.y[0] + 68 + PRECIO_TAB.fila / 2],
  [TAP_GUARDAR_PR - 2, PW - 30 - 56, HEADER + 91],
  [TAP_NAV_INF - 2, SIDE / 2, sideY(9)],
  [TAP_DNI - 2, SIDE + INF.x + 420, HEADER + 33],
  [TAP_BUSCAR_INF - 2, SIDE + INF.x + 908 + 83, HEADER + 33],
  [TAP_NAV_AN - 2, SIDE / 2, sideY(3)],
  [TAP_MES_ANT - 2, SIDE + 462, HEADER + 39],
  [TAP_NAV_DASH - 2, SIDE / 2, sideY(10)],
  [TAP_NAV_DASH + 40, 760, 640],
];

const PaginaTab: React.FC<{ frame: number }> = ({ frame }) => {
  const escenas: [Escena, React.FC<{ frame: number }>][] = [
    ["variables", VariablesTab],
    ["workflow", WorkflowTab],
    ["matriz", MatrizTab],
    ["pricing", PricingTab],
    ["informe", InformeTab],
    ["analisis", AnalisisTab],
    ["dashboard", DashTab],
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
      <Toast frame={frame} desde={TAP_GUARDAR_PR + 6} hasta={1100} titulo="Risk Pricing guardado" sub="Primarios · Nivel A · Monto máximo $ 230.000" />
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

// ---------- Evaluation report ----------
const OSC = { fondo: "#0b111d", panel: "#111a2b", linea: "#22304a", texto: "#e5e9f0", texto2: "#9aa6b8", azul: "#4f7cac" };
const informeVis = (frame: number) => aparece(frame, INFORME, 10);
const DATOS_LEAD: [string, string][] = [
  ["NOMBRE", "JAVIER PEREZ"],
  ["DNI", "2845678"],
  ["CUIL", "20-02845678-3"],
  ["GÉNERO", "Masculino"],
  ["TELÉFONO", "11 XXXXX-4521"],
  ["PRODUCTO", "consumo"],
  ["SUCURSAL", "11"],
  ["CÓDIGO ONBOARDING", "HUB-7K2Q9"],
  ["CÓDIGO LEAD", "AXN000036130"],
];
const CHIPS_BASES = ["moraTemprana: NO", "moraExtrajudicial: NO", "fraude: NO", "legales: NO", "préstamosVigentes: NO", "refinanciado: NO", "consolidado: NO", "empleado: NO", "listaNegra: NO", "préstamosVigentesMax: 3"];
const VALORIZACION: [string, string][] = [
  ["FUENTE", "Tabla NSE (Bureau A)"],
  ["NSE (NIVEL)", "C2"],
  ["SCORE BUREAU A", "612"],
  ["SEGMENTO DE RIESGO", "B"],
  ["INGRESO NSE", "$642.180"],
  ["INGRESO INFERIDO FINAL", "$642.180"],
];
const DICTAMEN: [string, string][] = [
  ["RESULTADO", "APROBADO"],
  ["MONTO", "$215.000"],
  ["MONTO MÁX.", "$215.000"],
  ["PLAZO", "7 meses"],
  ["TNA", "252%"],
  ["RCI", "20%"],
  ["INGRESO INFERIDO", "$642.180"],
  ["INGRESO NETO", "$642.180"],
  ["CUOTA MÁX.", "$128.436"],
];
const cuentaTxt = (frame: number, desde: number, txt: string) => {
  const m = txt.match(/[\d.,]+/);
  if (!m) {
    return txt;
  }
  const crudo = m[0];
  const n = parseFloat(crudo.replace(/\./g, "").replace(",", "."));
  const dec = crudo.includes(",") ? crudo.split(",")[1].length : 0;
  const t = interpolate(frame, [desde, desde + 30], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  return txt.replace(crudo, (n * t).toLocaleString("es-AR", { minimumFractionDigits: dec, maximumFractionDigits: dec }));
};
const Seccion: React.FC<{ t: string; children: React.ReactNode; fs?: number }> = ({ t, children, fs = 10.5 }) => (
  <div style={{ borderTop: `1px solid ${BORDE}`, paddingTop: 10, marginTop: 12 }}>
    <div style={{ fontSize: fs, fontWeight: 700, color: TINTA, letterSpacing: 0.5 }}>{t}</div>
    {children}
  </div>
);
const DatoK: React.FC<{ k: string; v: string; fs?: number }> = ({ k, v, fs = 11 }) => (
  <div>
    <div style={{ fontSize: fs - 2.5, color: TINTA_2, letterSpacing: 0.4 }}>{k}</div>
    <div style={{ fontSize: fs, fontWeight: 600, color: TINTA, marginTop: 2 }}>{v}</div>
  </div>
);
const Tarjeta: React.FC<{ k: string; v: string; fs?: number; h?: number; verde?: boolean }> = ({ k, v, fs = 14, h = 56, verde }) => (
  <div style={{ height: h, borderRadius: 8, background: "#f6f8fb", border: `1px solid ${BORDE}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 3 }}>
    <div style={{ fontSize: fs * 0.58, color: TINTA_2, letterSpacing: 0.4 }}>{k}</div>
    <div style={{ fontSize: fs, fontWeight: 700, color: verde ? "#15803d" : NAVY }}>{v}</div>
  </div>
);
const PasoPipeline: React.FC<{ n: number; t: string; chips?: string[]; frame: number; desde: number; fs?: number; maxChips?: number }> = ({ n, t, chips, frame, desde, fs = 11, maxChips }) => {
  const ok = aparece(frame, desde, 8);
  return (
    <div style={{ marginTop: 8, borderRadius: 8, background: "#f6f8fb", border: `1px solid ${BORDE}`, padding: "8px 10px", opacity: aparece(frame, desde - 6, 8) }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 20, height: 20, borderRadius: "50%", background: ok > 0.5 ? "#22a35a" : "#cbd2dc", color: "white", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{n}</div>
        <span style={{ fontSize: fs, color: TINTA }}>{t}</span>
        <span style={{ marginLeft: "auto", fontSize: fs - 2.5, fontWeight: 800, color: "#15803d", background: "#dcf3e3", borderRadius: 4, padding: "3px 7px", opacity: ok }}>APROBADO</span>
      </div>
      {chips ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6, paddingLeft: 28 }}>
          {chips.slice(0, maxChips ?? chips.length).map((c) => (
            <span key={c} style={{ fontSize: fs - 3, color: "#374151", background: "#e8ecf2", borderRadius: 4, padding: "2px 6px" }}>
              {c}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
};
const DICT_Y = 214;
const BuscadorInforme: React.FC<{ frame: number; chico?: boolean }> = ({ frame, chico }) => {
  const foco = frame >= TAP_DNI && frame < TAP_BUSCAR_INF;
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <Campo v={frame >= TIPEO_DNI[0] ? tipeo(frame, "2845678", TIPEO_DNI) : ""} w={chico ? 266 : 900} h={chico ? 36 : 34} fs={12} foco={foco} cursor={foco && Math.floor(frame / 8) % 2 === 0} />
      <div style={{ flex: 1, height: chico ? 36 : 34, borderRadius: 6, background: NAVY, color: "white", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 - pulsado(frame, TAP_BUSCAR_INF) * 0.06})` }}>Buscar</div>
    </div>
  );
};
const InformeTab: React.FC<{ frame: number }> = ({ frame }) => {
  const v = informeVis(frame);
  const s = (k: number) => ({ opacity: aparece(frame, INFORME + 4 + k * 5, 10), transform: `translateY(${(1 - aparece(frame, INFORME + 4 + k * 5, 10)) * 8}px)` });
  return (
    <div style={{ position: "absolute", left: SIDE, top: HEADER, right: 0, bottom: 0, background: "#f1f3f6" }}>
      <div style={{ position: "absolute", left: INF.x, top: 16, width: INF.w }}>
        <BuscadorInforme frame={frame} />
      </div>
      <div style={{ position: "absolute", left: INF.x, top: 60, width: INF.w, height: 32, borderRadius: 6, background: "white", border: `1px solid ${BORDE}`, display: "flex", alignItems: "center", padding: "0 12px", gap: 10, fontSize: 11, color: TINTA_2, boxSizing: "border-box", opacity: v }}>
        Evaluaciones encontradas:
        <span style={{ flex: 1, height: 24, border: `1px solid ${BORDE}`, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 10px", color: TINTA }}>
          15/11/2026 09:57 — APROBADO — HUB-7K2Q9 <span style={{ fontSize: 8 }}>▾</span>
        </span>
      </div>
      <div style={{ position: "absolute", left: INF.x, top: INF.y, width: INF.w, height: INF.h, background: "white", borderRadius: 10, boxShadow: "0 2px 12px rgba(20,30,50,0.08)", opacity: v, transform: `translateY(${(1 - v) * 14}px)` }}>
        <div style={{ position: "absolute", left: 24, top: 18, fontSize: 17, fontWeight: 600, color: NAVY }}>Informe de Evaluación</div>
        <div style={{ position: "absolute", left: 24, top: 42, fontSize: 10, color: TINTA_2 }}>15/11/2026 09:57 a. m.</div>
        <div style={{ position: "absolute", right: 24, top: 18, height: 30, padding: "0 16px", borderRadius: 6, background: "#dcf3e3", border: "1px solid #86efac", color: "#15803d", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center" }}>APROBADO</div>
        <div style={{ position: "absolute", left: INF.colIzq, top: 56, width: INF.colW }}>
          <div style={s(0)}>
            <Seccion t="DATOS DEL LEAD">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", rowGap: 10, marginTop: 10 }}>
                {DATOS_LEAD.map(([k, val]) => (
                  <DatoK key={k} k={k} v={val} />
                ))}
              </div>
            </Seccion>
          </div>
          <div style={s(1)}>
            <Seccion t="VERIFICACIÓN GEOGRÁFICA">
              <div style={{ fontSize: 10.5, fontStyle: "italic", color: TINTA_2, marginTop: 6 }}>Domicilio validado dentro de la zona de cobertura</div>
            </Seccion>
          </div>
          <div style={s(2)}>
            <Seccion t="ESTRATEGIA APLICADA">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", rowGap: 10, marginTop: 10 }}>
                <DatoK k="ESTRATEGIA" v="Renovación Activos" />
                <DatoK k="MATRIZ DE RIESGO" v="Riesgo Medio" />
                <DatoK k="SEGMENTO PRODUCTO" v="renovados" />
                <DatoK k="ETAPAS COMPLETADAS" v="2" />
              </div>
            </Seccion>
          </div>
          <div style={s(3)}>
            <Seccion t="PIPELINE DE EVALUACIÓN">
              <PasoPipeline n={1} t="Bases Negativas" chips={CHIPS_BASES} frame={frame} desde={INFORME + 30} />
              <PasoPipeline n={2} t="Bureau A" frame={frame} desde={INFORME + 44} />
            </Seccion>
          </div>
        </div>
        <div style={{ position: "absolute", left: INF.colDer, top: 56, width: INF.colW }}>
          <div style={s(1)}>
            <Seccion t="VALORIZACIÓN DE INGRESO">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 10 }}>
                {VALORIZACION.map(([k, val]) => (
                  <Tarjeta key={k} k={k} v={cuentaTxt(frame, INFORME + 20, val)} fs={13} h={50} />
                ))}
              </div>
            </Seccion>
          </div>
          <div style={{ position: "absolute", left: 0, top: DICT_Y, width: INF.colW, ...s(3) }}>
            <Seccion t="DICTAMEN FINAL">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 10 }}>
                {DICTAMEN.map(([k, val], i) => (
                  <Tarjeta key={k} k={k} v={cuentaTxt(frame, INFORME + 40, val)} verde={i === 0} fs={14} h={54} />
                ))}
              </div>
            </Seccion>
          </div>
          <div style={{ position: "absolute", left: 0, top: DICT_Y + 230, width: INF.colW, ...s(4) }}>
            <Seccion t="CALIFICACIÓN POR PRODUCTO">
              <div style={{ marginTop: 8, borderRadius: 8, background: "#f6f8fb", border: `1px solid ${BORDE}`, padding: "10px 12px", fontSize: 10.5, color: TINTA }}>
                Sin calificación por producto. <span style={{ color: AZUL }}>Evaluación multiproducto desactivada</span>
              </div>
            </Seccion>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- Evaluation analysis (dark) ----------
const KPIS_AN: [string, string, string][] = [
  ["6.312", "TOTAL EVALUADOS", "#5b84b8"],
  ["4.108", "APROBADOS", "#4f9c7a"],
  ["2.204", "RECHAZADOS", "#b85b5b"],
  ["65,1%", "TASA DE APROBACIÓN", "#5b84b8"],
  ["$198.420", "MONTO PROMEDIO", "#5b84b8"],
  ["279,4%", "TNA PROMEDIO", "#c9a45b"],
  ["11,8%", "RCI PROMEDIO", "#8b7bc9"],
  ["6,9 meses", "PLAZO PROMEDIO", "#5b84b8"],
];
const RIESGO_AN: [string, number, number, string][] = [
  ["A", 2.4, 99, "#22a35a"],
  ["B", 7.8, 320, "#eab308"],
  ["C", 18.6, 764, "#f97316"],
  ["D", 71.2, 2925, "#ef4444"],
];
const MONTOS_AN: [string, number, number][] = [
  ["$0 - $250K", 82.4, 3385],
  ["$250K - $500K", 14.9, 612],
  ["$500K - $1M", 2.7, 111],
  ["$1M+", 0, 0],
];
const SERVICIOS_AN: [string, number, number][] = [
  ["Central de Deudores", 41.8, 921],
  ["Bureau A", 35.2, 776],
  ["Bases internas", 23.0, 507],
];
const MOTIVOS_AN: [string, number, number][] = [
  ["Score vigente por debajo del mínimo permitido", 612, 27.8],
  ["Figura en la base de mora extrajudicial", 298, 13.5],
  ["Peor situación 12M por encima del máximo permitido", 271, 12.3],
  ["Peor situación 6M por encima del máximo permitido", 133, 6.0],
  ["Alcanzó el máximo de préstamos vigentes", 118, 5.4],
  ["Entidad Financiera A con situación 5, supera máximo 1", 104, 4.7],
  ["Peor situación vigente por encima del máximo permitido", 91, 4.1],
  ["Entidad Financiera B con situación 4, supera máximo 1", 66, 3.0],
];
const datosAn = (frame: number) => interpolate(frame, [TAP_MES_ANT + 6, TAP_MES_ANT + 40], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
const pct = (n: number) => `${n.toFixed(1).replace(".", ",")}%`;
const BarraOsc: React.FC<{ k: string; p: number; n: number; c: string; t: number; lw: number; fs?: number; max?: number }> = ({ k, p, n, c, t, lw, fs = 10, max = 100 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, fontSize: fs }}>
    <span style={{ width: lw, textAlign: "right", color: OSC.texto }}>{k}</span>
    <div style={{ flex: 1, height: fs + 4, borderRadius: 3, background: "#1d2a40", position: "relative" }}>
      <div style={{ width: `${Math.max((p / max) * 100 * t, p > 0 ? 3 : 1.5)}%`, height: "100%", borderRadius: 3, background: c, display: "flex", alignItems: "center", paddingLeft: 4, boxSizing: "border-box", fontSize: fs - 2.5, fontWeight: 700, color: "white", whiteSpace: "nowrap" }}>{pct(p * t)}</div>
    </div>
    <span style={{ width: 40, textAlign: "right", color: OSC.texto2 }}>{Math.round(n * t).toLocaleString("es-AR")}</span>
  </div>
);
const FILTROS_AN = ["Hoy", "Ayer", "Esta semana", "Semana anterior", "Mes actual", "Mes anterior", "Este año", "Todo"];
const BotonFiltro: React.FC<{ t: string; sel: boolean; press?: number; fs?: number }> = ({ t, sel, press = 0, fs = 10 }) => (
  <div style={{ height: fs * 2.6, padding: `0 ${fs}px`, borderRadius: 6, border: `1px solid ${sel ? "#2563eb" : "#3a4a66"}`, background: sel ? "#2563eb" : "transparent", color: OSC.texto, fontSize: fs, fontWeight: 600, display: "flex", alignItems: "center", whiteSpace: "nowrap", transform: `scale(${1 - press * 0.08})` }}>{t}</div>
);
const AN_KPI = { y: 76, h: 62 };
const AnalisisTab: React.FC<{ frame: number }> = ({ frame }) => {
  const t = datosAn(frame);
  const panel = { position: "absolute" as const, background: OSC.panel, borderRadius: 10, border: `1px solid ${OSC.linea}`, padding: "12px 16px", boxSizing: "border-box" as const };
  const titulo = (s: string) => <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, paddingBottom: 6, borderBottom: `1px solid ${OSC.linea}` }}>{s}</div>;
  const mesAnt = frame >= TAP_MES_ANT + 2;
  return (
    <div style={{ position: "absolute", left: SIDE, top: HEADER, right: 0, bottom: 0, background: OSC.fondo, color: OSC.texto }}>
      <div style={{ ...panel, left: 16, top: 14, width: 1102, height: 50, display: "flex", alignItems: "center", gap: 6, padding: "0 12px" }}>
        {FILTROS_AN.map((f) => (
          <BotonFiltro key={f} t={f} sel={f === (mesAnt ? "Mes anterior" : "Mes actual")} press={f === "Mes anterior" ? pulsado(frame, TAP_MES_ANT) : 0} />
        ))}
        <span style={{ marginLeft: "auto", fontSize: 9.5, color: OSC.texto2 }}>Desde</span>
        <span style={{ height: 26, padding: "0 10px", borderRadius: 5, background: "#1a2438", fontSize: 9.5, display: "flex", alignItems: "center" }}>{mesAnt ? "01/10/2026" : "01/11/2026"}</span>
        <span style={{ fontSize: 9.5, color: OSC.texto2 }}>Hasta</span>
        <span style={{ height: 26, padding: "0 10px", borderRadius: 5, background: "#1a2438", fontSize: 9.5, display: "flex", alignItems: "center" }}>{mesAnt ? "31/10/2026" : "15/11/2026"}</span>
        <span style={{ height: 26, padding: "0 12px", borderRadius: 5, background: "#16a34a", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center" }}>Aplicar</span>
      </div>
      <div style={{ position: "absolute", left: 16, top: AN_KPI.y, width: 1102, display: "flex", gap: 10 }}>
        {KPIS_AN.map(([v, k, c]) => (
          <div key={k} style={{ flex: 1, height: AN_KPI.h, background: OSC.panel, borderRadius: 9, borderTop: `2px solid ${c}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
            <div style={{ fontSize: 17, fontWeight: 800 }}>{t > 0 ? cuentaTxt(frame, TAP_MES_ANT + 6, v) : "—"}</div>
            <div style={{ fontSize: 7.5, letterSpacing: 0.5, color: "#c9d0da" }}>{k}</div>
          </div>
        ))}
      </div>
      <div style={{ ...panel, left: 16, top: 152, width: 545, height: 152 }}>
        {titulo("DISTRIBUCIÓN POR RIESGO")}
        {RIESGO_AN.map(([k, p, n, c]) => (
          <BarraOsc key={k} k={k} p={p} n={n} c={c} t={t} lw={20} />
        ))}
      </div>
      <div style={{ ...panel, left: 573, top: 152, width: 545, height: 152 }}>
        {titulo("DISTRIBUCIÓN DE MONTOS APROBADOS")}
        {MONTOS_AN.map(([k, p, n]) => (
          <BarraOsc key={k} k={k} p={p} n={n} c="#3b6fd6" t={t} lw={86} />
        ))}
      </div>
      <div style={{ ...panel, left: 16, top: 316, width: 545, height: 124 }}>
        {titulo("RECHAZOS POR SERVICIO")}
        {SERVICIOS_AN.map(([k, p, n]) => (
          <BarraOsc key={k} k={k} p={p} n={n} c="#ef4444" t={t} lw={110} />
        ))}
      </div>
      <div style={{ ...panel, left: 573, top: 316, width: 545, height: 124 }}>
        {titulo("EVALUACIONES POR PRODUCTO")}
        <div style={{ display: "flex", marginTop: 10, background: "#1d3557", fontSize: 9.5, fontWeight: 700, padding: "6px 0" }}>
          {["Producto", "Total", "Aprob.", "Rech.", "Tasa"].map((c) => (
            <div key={c} style={{ flex: 1, textAlign: "center" }}>
              {c}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", fontSize: 10, padding: "8px 0", borderBottom: `1px solid ${OSC.linea}`, opacity: t }}>
          {["consumo", "6.312", "4.108", "2.204", "65,1%"].map((c, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center" }}>
              {c}
            </div>
          ))}
        </div>
      </div>
      <div style={{ ...panel, left: 16, top: 452, width: 740, height: 300 }}>
        {titulo("TOP MOTIVOS DE RECHAZO")}
        <div style={{ display: "flex", marginTop: 8, background: "#1d3557", fontSize: 9.5, fontWeight: 700, padding: "6px 10px" }}>
          <div style={{ flex: 1 }}>Motivo</div>
          <div style={{ width: 80, textAlign: "center" }}>Cantidad</div>
          <div style={{ width: 90, textAlign: "center" }}>% Rechazos</div>
        </div>
        {MOTIVOS_AN.map(([m, n, p], i) => (
          <div key={m} style={{ display: "flex", fontSize: 9.5, padding: "7px 10px", borderBottom: `1px solid ${OSC.linea}`, opacity: aparece(frame, TAP_MES_ANT + 14 + i * 3) }}>
            <div style={{ flex: 1 }}>{m}</div>
            <div style={{ width: 80, textAlign: "center" }}>{Math.round(n * t)}</div>
            <div style={{ width: 90, textAlign: "center" }}>{pct(p * t)}</div>
          </div>
        ))}
      </div>
      <div style={{ ...panel, left: 768, top: 452, width: 350, height: 300 }}>
        {titulo("CONSUMO DE SERVICIOS")}
        <div style={{ display: "flex", marginTop: 8, background: "#1d3557", fontSize: 9.5, fontWeight: 700, padding: "6px 8px" }}>
          <div style={{ flex: 1.3 }}>Servicio</div>
          <div style={{ flex: 1, textAlign: "center" }}>Consumos</div>
          <div style={{ flex: 1.2, textAlign: "center" }}>Consumo real</div>
        </div>
        {([["Bases internas", 6312, 6312], ["Bureau A", 4886, 2951], ["Central de Deudores", 2398, 2398]] as [string, number, number][]).map(([s, a, b]) => (
          <div key={s} style={{ display: "flex", fontSize: 9.5, padding: "8px 8px", borderBottom: `1px solid ${OSC.linea}`, opacity: t }}>
            <div style={{ flex: 1.3 }}>{s}</div>
            <div style={{ flex: 1, textAlign: "center" }}>{Math.round(a * t).toLocaleString("es-AR")}</div>
            <div style={{ flex: 1.2, textAlign: "center" }}>
              {Math.round(b * t).toLocaleString("es-AR")}
              {a !== b ? <span style={{ color: "#4ade80", fontSize: 8.5 }}> (−{Math.round((a - b) * t).toLocaleString("es-AR")})</span> : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------- Credit engine dashboard (dark) ----------
const FUNNEL: [string, string, string][] = [
  ["CASOS TOTALES (EVALUADOS)", "2.418", "#5b84b8"],
  ["APROBADOS", "1.502", "#4f9c7a"],
  ["RECHAZADOS", "916", "#b85b5b"],
  ["OFERTADOS (CONCENTRADOR)", "0", "#c9a45b"],
];
const RATIOS: [string, string, string][] = [
  ["% TASA DE APROBACIÓN", "62,12%", "#6b7280"],
  ["% TASA DE RECHAZO", "37,88%", "#b85b5b"],
  ["% TASA DE CONVERSIÓN TOTAL", "62,12%", "#6b7280"],
];
const WORKFLOWS: [string, string, string][] = [
  ["RENOVACIÓN ACTIVOS", "1.362", "83,70%"],
  ["BÁSICA APERTURA", "1.056", "34,28%"],
];
const ETAPAS: [string, string][] = [
  ["CENTRAL DE DEUDORES", "372"],
  ["BUREAU A", "318"],
  ["BASES INTERNAS", "226"],
];
const DIARIO = [62, 88, 95, 71, 104, 112, 48, 30, 97, 118, 109, 124, 131, 57, 41];
const DASH = { cards: 142, ratios: 258, wf: 374, etapas: 548, evol: 648 };
const DashTab: React.FC<{ frame: number }> = ({ frame }) => {
  const f0 = ESC.dashboard[0];
  const sec = (t: string, y: number) => <div style={{ position: "absolute", left: 0, right: 0, top: y, textAlign: "center", fontSize: 12, fontWeight: 700, letterSpacing: 0.6 }}>{t}</div>;
  const card = (k: string, v: string, c: string, i: number, w: number, h: number, fs = 21) => (
    <div key={k} style={{ width: w, height: h, background: OSC.panel, borderRadius: 10, borderTop: `2px solid ${c}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, opacity: aparece(frame, f0 + 8 + i * 3) }}>
      <div style={{ fontSize: 9.5, letterSpacing: 0.5, color: "#c9d0da" }}>{k}</div>
      <div style={{ fontSize: fs, fontWeight: 800 }}>{cuentaTxt(frame, f0 + 10 + i * 3, v)}</div>
    </div>
  );
  return (
    <div style={{ position: "absolute", left: SIDE, top: HEADER, right: 0, bottom: 0, background: OSC.fondo, color: OSC.texto }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 18, textAlign: "center", fontSize: 19, fontWeight: 700 }}>Dashboard del Motor de Crédito</div>
      <div style={{ position: "absolute", left: 40, right: 40, top: 56, height: 44, background: "#111827", borderRadius: 8, display: "flex", alignItems: "center", gap: 6, padding: "0 12px" }}>
        {FILTROS_AN.map((f) => (
          <BotonFiltro key={f} t={f} sel={f === "Mes actual"} />
        ))}
        <span style={{ marginLeft: 8, height: 26, padding: "0 10px", borderRadius: 5, background: "#1a2438", fontSize: 9.5, display: "flex", alignItems: "center" }}>Todas las sucursales ▾</span>
        <span style={{ height: 26, padding: "0 10px", borderRadius: 5, background: "#1a2438", fontSize: 9.5, display: "flex", alignItems: "center" }}>Todos los segmentos ▾</span>
        <span style={{ marginLeft: "auto", height: 28, padding: "0 14px", borderRadius: 6, background: "#16a34a", fontSize: 10.5, fontWeight: 700, display: "flex", alignItems: "center" }}>Aplicar</span>
      </div>
      {sec("RESUMEN DEL FUNNEL DE EVALUACIÓN", 116)}
      <div style={{ position: "absolute", left: 0, right: 0, top: DASH.cards, display: "flex", justifyContent: "center", gap: 12 }}>{FUNNEL.map(([k, v, c], i) => card(k, v, c, i, 210, 76))}</div>
      {sec("RATIOS DE EFECTIVIDAD", DASH.ratios - 26)}
      <div style={{ position: "absolute", left: 0, right: 0, top: DASH.ratios, display: "flex", justifyContent: "center", gap: 12 }}>{RATIOS.map(([k, v, c], i) => card(k, v, c, i + 4, 284, 76))}</div>
      {sec("PERFORMANCE POR WORKFLOW", DASH.wf - 26)}
      <div style={{ position: "absolute", left: 0, right: 0, top: DASH.wf, display: "flex", justifyContent: "center", gap: 12 }}>
        {WORKFLOWS.map(([n, ev, tasa], i) => (
          <div key={n} style={{ width: 430, height: 146, background: OSC.panel, borderRadius: 10, borderTop: "2px solid #6b7280", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 14, boxSizing: "border-box", opacity: aparece(frame, f0 + 20 + i * 4) }}>
            <div style={{ fontSize: 9.5, letterSpacing: 0.5, color: "#c9d0da" }}>{n}</div>
            <div style={{ fontSize: 21, fontWeight: 800, marginTop: 6 }}>{cuentaTxt(frame, f0 + 24, ev)}</div>
            <div style={{ fontSize: 9, color: OSC.texto2 }}>Evaluaciones</div>
            <div style={{ width: "86%", borderTop: `1px solid ${OSC.linea}`, margin: "10px 0 8px" }} />
            <div style={{ fontSize: 20, fontWeight: 800, color: "#5f9e86" }}>{cuentaTxt(frame, f0 + 28, tasa)}</div>
            <div style={{ fontSize: 9, color: OSC.texto2 }}>Tasa Aprobación</div>
          </div>
        ))}
      </div>
      {sec("ANÁLISIS DE RECHAZOS POR ETAPA", DASH.etapas - 26)}
      <div style={{ position: "absolute", left: 0, right: 0, top: DASH.etapas, display: "flex", justifyContent: "center", gap: 12 }}>{ETAPAS.map(([k, v], i) => card(k, v, "#b85b5b", i + 9, 284, 76, 20))}</div>
      <div style={{ position: "absolute", left: 160, right: 160, top: DASH.evol, height: 108, background: OSC.panel, borderRadius: 10, padding: "10px 16px", boxSizing: "border-box" }}>
        <div style={{ fontSize: 9.5, letterSpacing: 0.5, color: "#c9d0da", textAlign: "center" }}>EVALUACIONES POR DÍA</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 64, marginTop: 10 }}>
          {DIARIO.map((d, i) => (
            <div key={i} style={{ flex: 1, height: `${(d / 135) * 100 * aparece(frame, f0 + 30 + i * 2, 16)}%`, background: "#4f7cac", borderRadius: "2px 2px 0 0" }} />
          ))}
        </div>
      </div>
    </div>
  );
};

// ---------- Phone: reports ----------
const SegmentoMotor: React.FC<{ frame: number; sel: 0 | 1 | 2; oscuro?: boolean }> = ({ frame, sel, oscuro }) => (
  <div style={{ position: "absolute", left: 12, right: 12, top: 10, height: 34, borderRadius: 8, background: oscuro ? "#1a2438" : "#e4e7ec", display: "flex", padding: 3, boxSizing: "border-box" }}>
    {["Informe", "Análisis", "Dashboard"].map((s, i) => (
      <div key={s} style={{ flex: 1, borderRadius: 6, background: i === sel ? (oscuro ? "#2563eb" : "white") : "transparent", fontSize: 11, fontWeight: 700, color: i === sel ? (oscuro ? "white" : TINTA) : oscuro ? OSC.texto2 : TINTA_2, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${(i === 1 ? 1 - pulsado(frame, TAP_NAV_AN) * 0.06 : 1) * (i === 2 ? 1 - pulsado(frame, TAP_NAV_DASH) * 0.06 : 1)})` }}>
        {s}
      </div>
    ))}
  </div>
);
const scrollInforme = (frame: number) => interpolate(frame, [INFORME + 70, INFORME + 150], [0, -470], { ...clamp, easing: Easing.inOut(Easing.cubic) });
const InformeMovil: React.FC<{ frame: number }> = ({ frame }) => {
  const v = informeVis(frame);
  const s = (k: number) => ({ opacity: aparece(frame, INFORME + 4 + k * 5, 10) });
  return (
    <Contenido>
      <SegmentoMotor frame={frame} sel={0} />
      <div style={{ position: "absolute", left: 12, right: 12, top: 52 }}>
        <BuscadorInforme frame={frame} chico />
      </div>
      <div style={{ position: "absolute", left: 12, right: 12, top: 98, bottom: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: scrollInforme(frame), background: "white", borderRadius: 12, padding: "14px 14px 16px", opacity: v }}>
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: NAVY }}>Informe de Evaluación</div>
              <div style={{ fontSize: 9.5, color: TINTA_2, marginTop: 2 }}>15/11/2026 09:57 a. m.</div>
            </div>
            <div style={{ marginLeft: "auto", padding: "6px 10px", borderRadius: 6, background: "#dcf3e3", border: "1px solid #86efac", color: "#15803d", fontSize: 10.5, fontWeight: 800 }}>APROBADO</div>
          </div>
          <div style={s(0)}>
            <Seccion t="DATOS DEL LEAD" fs={10}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: 8, marginTop: 8 }}>
                {DATOS_LEAD.slice(0, 6).map(([k, val]) => (
                  <DatoK key={k} k={k} v={val} fs={11} />
                ))}
              </div>
            </Seccion>
          </div>
          <div style={s(1)}>
            <Seccion t="ESTRATEGIA APLICADA" fs={10}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: 8, marginTop: 8 }}>
                <DatoK k="ESTRATEGIA" v="Renovación Activos" fs={11} />
                <DatoK k="MATRIZ DE RIESGO" v="Riesgo Medio" fs={11} />
              </div>
            </Seccion>
          </div>
          <div style={s(2)}>
            <Seccion t="PIPELINE DE EVALUACIÓN" fs={10}>
              <PasoPipeline n={1} t="Bases Negativas" chips={CHIPS_BASES} maxChips={6} frame={frame} desde={INFORME + 30} fs={11} />
              <PasoPipeline n={2} t="Bureau A" frame={frame} desde={INFORME + 44} fs={11} />
            </Seccion>
          </div>
          <div style={s(3)}>
            <Seccion t="VALORIZACIÓN DE INGRESO" fs={10}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 8 }}>
                {VALORIZACION.slice(1, 5).map(([k, val]) => (
                  <Tarjeta key={k} k={k} v={cuentaTxt(frame, INFORME + 20, val)} fs={13} h={48} />
                ))}
              </div>
            </Seccion>
          </div>
          <div style={s(4)}>
            <Seccion t="DICTAMEN FINAL" fs={10}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 8 }}>
                {DICTAMEN.slice(0, 8).map(([k, val], i) => (
                  <Tarjeta key={k} k={k} v={cuentaTxt(frame, INFORME + 90, val)} verde={i === 0} fs={14} h={50} />
                ))}
              </div>
            </Seccion>
          </div>
        </div>
      </div>
    </Contenido>
  );
};
const AnalisisMovil: React.FC<{ frame: number }> = ({ frame }) => {
  const t = datosAn(frame);
  const mesAnt = frame >= TAP_MES_ANT + 2;
  const panel = { position: "absolute" as const, left: 12, right: 12, background: OSC.panel, borderRadius: 10, padding: "10px 12px", boxSizing: "border-box" as const };
  return (
    <Contenido fondo={OSC.fondo}>
      <div style={{ color: OSC.texto }}>
        <SegmentoMotor frame={frame} sel={1} oscuro />
        <div style={{ position: "absolute", left: 12, top: 52, display: "flex", gap: 6 }}>
          {["Mes actual", "Mes anterior", "Este año"].map((f) => (
            <BotonFiltro key={f} t={f} sel={f === (mesAnt ? "Mes anterior" : "Mes actual")} press={f === "Mes anterior" ? pulsado(frame, TAP_MES_ANT) : 0} fs={10} />
          ))}
        </div>
        <div style={{ position: "absolute", left: 12, right: 12, top: 88, display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6 }}>
          {KPIS_AN.map(([v, k, c]) => (
            <div key={k} style={{ height: 56, background: OSC.panel, borderRadius: 8, borderTop: `2px solid ${c}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, textAlign: "center" }}>
              <div style={{ fontSize: 12.5, fontWeight: 800 }}>{t > 0 ? cuentaTxt(frame, TAP_MES_ANT + 6, v) : "—"}</div>
              <div style={{ fontSize: 6.3, letterSpacing: 0.3, color: "#c9d0da", lineHeight: 1.2 }}>{k}</div>
            </div>
          ))}
        </div>
        <div style={{ ...panel, top: 216, height: 140 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5 }}>DISTRIBUCIÓN POR RIESGO</div>
          {RIESGO_AN.map(([k, p, n, c]) => (
            <BarraOsc key={k} k={k} p={p} n={n} c={c} t={t} lw={14} fs={10} />
          ))}
        </div>
        <div style={{ ...panel, top: 366, height: 114 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5 }}>RECHAZOS POR SERVICIO</div>
          {SERVICIOS_AN.map(([k, p, n]) => (
            <BarraOsc key={k} k={k} p={p} n={n} c="#ef4444" t={t} lw={100} fs={9.5} />
          ))}
        </div>
        <div style={{ ...panel, top: 490, height: 190 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5 }}>TOP MOTIVOS DE RECHAZO</div>
          {MOTIVOS_AN.slice(0, 5).map(([m, n, p], i) => (
            <div key={m} style={{ display: "flex", gap: 8, fontSize: 9, padding: "7px 0", borderBottom: `1px solid ${OSC.linea}`, opacity: aparece(frame, TAP_MES_ANT + 14 + i * 3) }}>
              <div style={{ flex: 1 }}>{m}</div>
              <div style={{ width: 34, textAlign: "right" }}>{Math.round(n * t)}</div>
              <div style={{ width: 40, textAlign: "right", color: OSC.texto2 }}>{pct(p * t)}</div>
            </div>
          ))}
        </div>
      </div>
    </Contenido>
  );
};
const M_DASH = { wf: 344 };
const DashMovil: React.FC<{ frame: number }> = ({ frame }) => {
  const f0 = ESC.dashboard[0];
  const card = (k: string, v: string, c: string, i: number, h: number, fs = 17) => (
    <div key={k} style={{ height: h, background: OSC.panel, borderRadius: 9, borderTop: `2px solid ${c}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, textAlign: "center", opacity: aparece(frame, f0 + 8 + i * 3) }}>
      <div style={{ fontSize: 7.5, letterSpacing: 0.4, color: "#c9d0da", lineHeight: 1.2, padding: "0 4px" }}>{k}</div>
      <div style={{ fontSize: fs, fontWeight: 800 }}>{cuentaTxt(frame, f0 + 10 + i * 3, v)}</div>
    </div>
  );
  const sec = (t: string, y: number) => <div style={{ position: "absolute", left: 0, right: 0, top: y, textAlign: "center", fontSize: 10, fontWeight: 700, letterSpacing: 0.5 }}>{t}</div>;
  return (
    <Contenido fondo={OSC.fondo}>
      <div style={{ color: OSC.texto }}>
        <SegmentoMotor frame={frame} sel={2} oscuro />
        {sec("RESUMEN DEL FUNNEL", 56)}
        <div style={{ position: "absolute", left: 12, right: 12, top: 74, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>{FUNNEL.map(([k, v, c], i) => card(k, v, c, i, 62))}</div>
        {sec("RATIOS DE EFECTIVIDAD", 220)}
        <div style={{ position: "absolute", left: 12, right: 12, top: 238, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>{RATIOS.map(([k, v, c], i) => card(k, v, c, i + 4, 72, 15))}</div>
        {sec("PERFORMANCE POR WORKFLOW", 326)}
        <div style={{ position: "absolute", left: 12, right: 12, top: M_DASH.wf, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {WORKFLOWS.map(([n, ev, tasa], i) => (
            <div key={n} style={{ height: 132, background: OSC.panel, borderRadius: 9, borderTop: "2px solid #6b7280", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 12, boxSizing: "border-box", opacity: aparece(frame, f0 + 20 + i * 4) }}>
              <div style={{ fontSize: 8, letterSpacing: 0.4, color: "#c9d0da" }}>{n}</div>
              <div style={{ fontSize: 18, fontWeight: 800, marginTop: 6 }}>{cuentaTxt(frame, f0 + 24, ev)}</div>
              <div style={{ fontSize: 8, color: OSC.texto2 }}>Evaluaciones</div>
              <div style={{ width: "80%", borderTop: `1px solid ${OSC.linea}`, margin: "8px 0 6px" }} />
              <div style={{ fontSize: 17, fontWeight: 800, color: "#5f9e86" }}>{cuentaTxt(frame, f0 + 28, tasa)}</div>
              <div style={{ fontSize: 8, color: OSC.texto2 }}>Tasa Aprobación</div>
            </div>
          ))}
        </div>
        {sec("RECHAZOS POR ETAPA", 494)}
        <div style={{ position: "absolute", left: 12, right: 12, top: 512, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>{ETAPAS.map(([k, v], i) => card(k, v, "#b85b5b", i + 9, 70, 16))}</div>
        <div style={{ position: "absolute", left: 12, right: 12, top: 594, height: 86, background: OSC.panel, borderRadius: 9, padding: "8px 12px", boxSizing: "border-box" }}>
          <div style={{ fontSize: 8, letterSpacing: 0.4, color: "#c9d0da", textAlign: "center" }}>EVALUACIONES POR DÍA</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 50, marginTop: 6 }}>
            {DIARIO.map((d, i) => (
              <div key={i} style={{ flex: 1, height: `${(d / 135) * 100 * aparece(frame, f0 + 30 + i * 2, 16)}%`, background: "#4f7cac", borderRadius: "2px 2px 0 0" }} />
            ))}
          </div>
        </div>
      </div>
    </Contenido>
  );
};

const TABS_MOVIL: [string, string, Escena[]][] = [
  ["Variables", I.variables, ["variables"]],
  ["Workflow", I.flujo, ["workflow"]],
  ["Matriz", I.capas, ["matriz"]],
  ["Pricing", I.sliders, ["pricing"]],
  ["Reportes", I.barras, ["informe", "analisis", "dashboard"]],
];
const TAP_TAB: Record<number, number> = { 1: TAP_NAV_WF, 2: TAP_NAV_MAT, 3: TAP_NAV_PR, 4: TAP_NAV_INF };
const tabX = (i: number) => (MW / 5) * i + MW / 10;
const DEDO_MOVIL: [number, number, number][] = [
  [0, 300, 700],
  [TAP_SCORE - 2, MW - 12 - 10 - 35 - 10 - 43, M_HEADER + posVarMovil("score") + M_VAR.fila / 2],
  [TAP_TOGGLE - 2, MW - 12 - 10 - 18, M_HEADER + posVarMovil("cons3") + M_VAR.fila / 2],
  [TAP_GUARDAR_CFG - 2, MW - 12 - 36, M_HEADER + 23],
  [TAP_NAV_WF - 2, tabX(1), MH - M_TABS / 2 - 4],
  [TAP_GUARDAR_WF - 2, 195, M_HEADER + 650],
  [TAP_NAV_MAT - 2, tabX(2), MH - M_TABS / 2 - 4],
  [TAP_GENERAR - 2, 195, M_HEADER + 42 + 120 - 23],
  ...CAMBIOS.map((m): [number, number, number] => [m.f - 2, M_GRILLA.x + GRILLA_MOVIL.lw + GRILLA_MOVIL.gap + m.c * (GRILLA_MOVIL.cw + GRILLA_MOVIL.gap) + GRILLA_MOVIL.cw / 2, M_HEADER + M_GRILLA.y + (m.r + 1) * (GRILLA_MOVIL.ch + GRILLA_MOVIL.gap) + GRILLA_MOVIL.ch / 2]),
  [TAP_ACTUALIZAR - 2, 290, M_HEADER + 569],
  [TAP_NAV_PR - 2, tabX(3), MH - M_TABS / 2 - 4],
  [TAP_MONTO - 2, 12 + 198 + (366 - 198) / 2, M_HEADER + M_PRECIO.y[0] + 58 + M_PRECIO.fila / 2],
  [TAP_GUARDAR_PR - 2, MW - 12 - 38, M_HEADER + 25],
  [TAP_NAV_INF - 2, tabX(4), MH - M_TABS / 2 - 4],
  [TAP_DNI - 2, 12 + 133, M_HEADER + 70],
  [TAP_BUSCAR_INF - 2, 332, M_HEADER + 70],
  [TAP_NAV_AN - 2, 195, M_HEADER + 27],
  [TAP_MES_ANT - 2, 146, M_HEADER + 65],
  [TAP_NAV_DASH - 2, 315, M_HEADER + 27],
  [TAP_NAV_DASH + 40, 300, 640],
];

const PaginaMovil: React.FC<{ frame: number }> = ({ frame }) => {
  const escenas: [Escena, React.FC<{ frame: number }>][] = [
    ["variables", VariablesMovil],
    ["workflow", WorkflowMovil],
    ["matriz", MatrizMovil],
    ["pricing", PricingMovil],
    ["informe", InformeMovil],
    ["analisis", AnalisisMovil],
    ["dashboard", DashMovil],
  ];
  const actual = actualDe(frame);
  const oscuro = actual === "analisis" || actual === "dashboard";
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
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: M_TABS, background: oscuro ? "#111827" : "white", borderTop: `1px solid ${oscuro ? "#26314a" : BORDE}`, display: "flex", zIndex: 5 }}>
        {TABS_MOVIL.map(([n, d, e], i) => {
          const col = e.includes(actual) ? "#FF8C42" : oscuro ? "#9aa3b2" : "#6b7280";
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
      <Toast frame={frame} desde={TAP_GUARDAR_PR + 6} hasta={1100} titulo="Risk Pricing guardado" sub="Primarios · Nivel A · $ 230.000" chico />
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
  // Analysis KPIs and risk distribution.
  const kpis = tab ? { px: 590, py: 300 } : { px: 195, py: 330 };
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
    { f: 1100, z: 1, ...c, ...der, cy: 0.62 },
    { f: 1136, z: 1, ...c, ...izq, cy: 0.62 },
    { f: 1400, z: 1, ...c, ...izq, cy: 0.62 },
    { f: 1436, z: zz, ...kpis, ...izq, cy: 0.57 },
    { f: 1520, z: zz, ...kpis, ...izq, cy: 0.57 },
    { f: 1556, z: 1, ...c, ...izq, cy: 0.62 },
    { f: 1590, z: 1, ...c, ...izq, cy: 0.62 },
    { f: 1626, z: 1, ...c, ...der, cy: 0.62 },
    { f: 1740, z: 1, ...c, ...der, cy: 0.62 },
    { f: MOTOR_FRAMES, z: 1.05, ...c, ...der, cy: 0.62 },
  ];
};
const TOMAS_TAB = tomasDe(true);
const TOMAS_CEL = tomasDe(false);

// The generated risk matrix lifts out of the screen and settles back.
type Salto = { x: number; y: number; w: number; h: number; f: [number, number, number, number]; z: number; hueco?: string };
const oT = grillaOrigenTab();
const SALTOS_TAB: Salto[] = [
  { x: SIDE + oT.x - 8, y: HEADER + oT.y - 8, w: oT.ancho + 16, h: oT.alto + 12, f: [872, 884, 902, 916], z: 90 },
  { x: SIDE + INF.x + INF.colDer - 8, y: HEADER + INF.y + 56 + DICT_Y + 4, w: INF.colW + 16, h: 222, f: [1250, 1264, 1284, 1300], z: 100 },
  { x: SIDE + (PW - SIDE) / 2 - 436 - 6, y: HEADER + DASH.wf - 6, w: 884, h: 158, f: [1690, 1704, 1724, 1740], z: 100, hueco: "#060a12" },
];
const SALTOS_CEL: Salto[] = [
  {
    x: M_GRILLA.x - 6,
    y: M_HEADER + M_GRILLA.y - 6,
    w: GRILLA_MOVIL.lw + GRILLA_MOVIL.gap + 7 * (GRILLA_MOVIL.cw + GRILLA_MOVIL.gap) + 9,
    h: 11 * (GRILLA_MOVIL.ch + GRILLA_MOVIL.gap) + 9,
    f: [872, 884, 902, 916],
    z: 90,
  },
  { x: 6, y: M_HEADER + M_DASH.wf - 6, w: 378, h: 144, f: [1690, 1704, 1724, 1740], z: 100, hueco: "#060a12" },
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
                  <div style={{ position: "absolute", left: s.x, top: s.y, width: s.w, height: s.h, borderRadius: 10, background: s.hueco ?? "#dfe6ef", opacity: Math.min(1, k * 3) }} />
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
