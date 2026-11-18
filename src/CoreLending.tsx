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

// Core Lending (dynamic camera, ~31s), tablet in 16:9 and phone in 9:16:
// the "Core de Préstamos" home with the day's indicators and its modules,
// the loan detail of Javier Perez where an installment is collected, and
// the consolidation of five of his loans into a new operation.

export const coreLendingSchema = z.object({
  fondo: z.enum(["ondas", "red", "aurora", "geometrico"]),
  paleta: z.enum(["azul", "gris"]),
});

export const CORELENDING_FRAMES = 1260;

const FUENTE = "Montserrat, sans-serif";
const HEADER_BG = "#4b4d52";
const SIDE_BG = "#17191d";
const NAVY = "#1c2b45";
const AZUL = "#2f5d8f";
const AZUL_TXT = "#3a6ea5";
const TINTA = "#1f2430";
const TINTA_2 = "#6b7280";
const BORDE = "#e1e5ec";
const VERDE = "#1e6b3a";
const ROJO = "#b42318";
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
  home: [0, 100],
  detalle: [96, 312],
  consolidacion: [308, 636],
  conta: [632, 760],
  estados: [756, 900],
  resumen: [896, 1060],
  diario: [1056, CORELENDING_FRAMES + 10],
} as const;
type Escena = keyof typeof ESC;
const TAP_CONSULTAR = 84;
const TAP_COBRANZA = 160;
const HOJA_COBRANZA = [166, 200];
const TAP_CONFIRMAR_COB = 188;
const COBRADA = 202;
const RECIBO_F = [206, 242];
const TAP_MENU = 300;
const TAP_INPUT = 322;
const TIPEO = [326, 346];
const TAP_BUSCAR = 354;
const RESULTADOS = 362;
const TAP_CHECK = [384, 396, 408, 420, 432];
const TAP_CONTINUAR = 452;
const MODAL = 458;
const TAP_PROCESAR = 540;
const PROCESADA = 566;
const TAP_INICIO = 622;
const TAP_MOD_CONTA = 656;
const MODAL_CONTA = 662;
const TAP_ESTADOS = 720;
const TAP_GENERAR = 772;
const TAP_RESULTADOS = 836; // phone only: statements tab
const TAP_REPORTES = 886;
const TAP_DIARIO = 1052;
const TAPS_BASE = [TAP_CONSULTAR, TAP_COBRANZA, TAP_CONFIRMAR_COB, TAP_MENU, TAP_INPUT, TAP_BUSCAR, ...TAP_CHECK, TAP_CONTINUAR, TAP_PROCESAR, TAP_INICIO, TAP_MOD_CONTA, TAP_ESTADOS, TAP_GENERAR, TAP_REPORTES, TAP_DIARIO];
const TAPS_TAB = TAPS_BASE;
const TAPS_CEL = [...TAPS_BASE, TAP_RESULTADOS];

const pesos = (n: number) => `$ ${n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const pulsado = (frame: number, f: number) => interpolate(frame, [f, f + 4, f + 12], [0, 1, 0], clamp);
const sube = (frame: number, desde: number, dur = 30) => interpolate(frame, [desde, desde + dur], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
const aparece = (frame: number, desde: number, dur = 10) => interpolate(frame, [desde, desde + dur], [0, 1], clamp);

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
  lupa: "M10.5 4 A6.5 6.5 0 1 1 10.5 17 A6.5 6.5 0 1 1 10.5 4 M15.5 15.5 L20 20",
  ficha: "M3 6 H21 V18 H3 Z M6 10 H11 M6 14 H10 M14 9 H18 V14 H14 Z",
  mas: "M12 3 A9 9 0 1 1 12 21 A9 9 0 1 1 12 3 M12 8 V16 M8 12 H16",
  chancho: "M5 11 C5 7 9 6 12 6 C16 6 19 8 19 11 V14 L17 15 V18 H14 V16 H10 V18 H7 V15 C5.5 14 5 12.5 5 11 Z M15 9 V9.5",
  operaciones: "M4 5 H10 V11 H4 Z M14 5 H20 V11 H14 Z M4 15 L10 20 M10 15 L4 20 M14 17.5 H20",
  especiales: "M6 4 A3 3 0 1 1 6 10 A3 3 0 1 1 6 4 M18 4 V10 M15 7 H21 M3 17 H9 M15 14 L21 20 M21 14 L15 20",
  gestion: "M4 20 V10 M9 20 V4 M14 20 V13 M19 20 V8",
  operativos: "M6 3 H14 L18 7 V21 H6 Z M9 12 H15 M9 16 H13",
  config: "M12 8 A4 4 0 1 1 12 16 A4 4 0 1 1 12 8 M12 2 V5 M12 19 V22 M2 12 H5 M19 12 H22 M5 5 L7 7 M17 17 L19 19 M5 19 L7 17 M17 7 L19 5",
  conta: "M5 3 H19 V21 H5 Z M8 7 H16 M8 11 H10 M12 11 H14 M8 15 H10 M12 15 H14 M8 18 H16",
  cambios: "M4 12 A8 8 0 1 0 6.5 6.3 M4 4 V8 H8 M12 8 V12 L15 14",
  cesion: "M4 7 H16 M13 4 L16 7 L13 10 M20 17 H8 M11 14 L8 17 L11 20",
  sistemas: "M4 5 H20 V15 H4 Z M9 19 H15 M12 15 V19 M8 9 L10 11 L8 13 M12 13 H15",
  robot: "M7 8 H17 V18 H7 Z M12 4 V8 M10 12 V13 M14 12 V13 M10 15.5 H14 M4 12 V15 M20 12 V15",
  calendario: "M4 6 H20 V20 H4 Z M4 10 H20 M8 3 V7 M16 3 V7",
  grafico: "M4 18 L9 12 L13 15 L20 7",
  pagos: "M3 6 H21 V18 H3 Z M3 10 H21 M7 14 H10",
  monto: "M12 3 V21 M16 7 C15 5.5 13.5 5 12 5 C9.5 5 8 6.2 8 8 C8 12 16 10 16 15 C16 17 14.5 18.5 12 18.5 C10 18.5 8.5 17.8 7.5 16.5",
  persona: "M12 4 A4 4 0 1 1 12 12 A4 4 0 1 1 12 4 M4 21 C5 15 19 15 20 21",
  cruz: "M6 6 L18 18 M18 6 L6 18",
  flecha: "M15 5 L8 12 L15 19",
  correo: "M3 6 H21 V18 H3 Z M3 6 L12 13 L21 6",
};

type Modulo = { t: string; d: string; i: string; estrella?: boolean };
const MODULOS: Modulo[] = [
  { t: "Consultar Préstamos", d: "Buscar o listar préstamos registrados", i: I.lupa, estrella: true },
  { t: "Cliente", d: "Administración y gestión de clientes", i: I.ficha, estrella: true },
  { t: "Alta de Préstamo", d: "Registrar manualmente un nuevo préstamo", i: I.mas, estrella: true },
  { t: "Tesorería", d: "Liquidación y altas de préstamos automáticos", i: I.chancho, estrella: true },
  { t: "Operaciones", d: "Cobranza, condonación, reversa, cancelación, anulación y fecha valor", i: I.operaciones },
  { t: "Operaciones Especiales", d: "Renovación, refinanciación, consolidación, restructuración, ajuste de cuotas y manuales", i: I.especiales },
  { t: "Reportes de Gestión", d: "Dashboard, resumen de cartera, reporte diario y reportes", i: I.gestion },
  { t: "Reportes Operativos", d: "Tesorería, comisiones, proyección de beneficios y bonificaciones", i: I.operativos },
  { t: "Configuración", d: "Líneas de crédito, configuración global y de archivos", i: I.config },
  { t: "Contabilidad", d: "Inventarios contables, libro diario y estados financieros", i: I.conta },
  { t: "Control de Cambios", d: "Auditoría de anulaciones, refinanciaciones, ajustes y reestructuraciones", i: I.cambios, estrella: true },
  { t: "Cesión de Cartera", d: "Selección y movimientos de cartera, contratos y recibos", i: I.cesion },
  { t: "Admin Sistemas", d: "Procesos, reconciliaciones, permisos, usuarios y control de cartera", i: I.sistemas },
];
const SIDE_ICONOS = [I.casa, I.lupa, I.ficha, I.mas, I.chancho, I.operaciones, I.especiales, I.gestion, I.operativos, I.config, I.conta, I.cambios, I.cesion, I.sistemas, I.robot];
const SIDE_ACTIVO: Record<Escena, number> = { home: 0, detalle: 1, consolidacion: 6, conta: 0, estados: 10, resumen: 7, diario: 7 };
const SIDE_ESPECIALES = 6;

// ---------- Data ----------
const INDICADORES = (frame: number) => {
  const t = sube(frame, 14, 40);
  return [
    { k: "Altas", v: `${Math.round(64 * t)}`, i: I.persona },
    { k: "Monto", v: `$ ${(48.5 * t).toFixed(1).replace(".", ",")} MM`, i: I.monto },
    { k: "Pagos", v: `${Math.round(125 * t)}`, i: I.pagos },
    { k: "Monto", v: `$ ${(18.7 * t).toFixed(1).replace(".", ",")} MM`, i: I.gestion },
  ];
};
const CUOTA = 243278;
const CAPITALES = [61778.42, 69253.58, 77633.24, 87026.85, 97557.08, 109361.45, 122594.16, 137428.02, 154056.77, 172697.59, 193593.96, 217018.88];
const PLAN = CAPITALES.map((cap, k) => {
  const interes = (CUOTA - cap) / 1.21;
  const venc = new Date(2026, 9 + k, 10);
  return {
    n: k + 1,
    venc: `10/${String(venc.getMonth() + 1).padStart(2, "0")}/${venc.getFullYear()}`,
    cap,
    interes,
    iva: CUOTA - cap - interes,
  };
});
type Prestamo = { cod: string; capital: number; plazo: number; saldo: number | null; alta: string };
const PRESTAMOS: Prestamo[] = [
  { cod: "2026091800003", capital: 1500000, plazo: 12, saldo: 1438221.58, alta: "18/9/2026" },
  { cod: "2026091800002", capital: 1500000, plazo: 6, saldo: 1681499.34, alta: "18/9/2026" },
  { cod: "2026091800001", capital: 1500000, plazo: 6, saldo: 1681499.34, alta: "18/9/2026" },
  { cod: "2026082900003", capital: 1500000, plazo: 24, saldo: 1681498.88, alta: "29/8/2026" },
  { cod: "2026082900002", capital: 250000, plazo: 4, saldo: 320582.14, alta: "29/8/2026" },
  { cod: "2026082900001", capital: 250000, plazo: 2, saldo: null, alta: "29/8/2026" },
  { cod: "2026081600001", capital: 994666, plazo: 12, saldo: null, alta: "16/8/2026" },
  { cod: "2026081300003", capital: 1999639.67, plazo: 18, saldo: null, alta: "13/8/2026" },
];
const NUEVA_OP = "2026111500001";
const TOTAL = PRESTAMOS.slice(0, 5).reduce((s, p) => s + (p.saldo ?? 0), 0);
const marcados = (frame: number) => TAP_CHECK.filter((f) => frame >= f + 2).length;
const totalMarcado = (frame: number) => {
  // The total eases from one sum to the next after each tick.
  let s = 0;
  TAP_CHECK.forEach((f, i) => {
    s += (PRESTAMOS[i].saldo ?? 0) * interpolate(frame, [f + 2, f + 12], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  });
  return s;
};
const procesada = (frame: number) => aparece(frame, PROCESADA, 12);
const tarjetasModal = (chico: boolean) => [
  { k: "TOTAL A CANCELAR", v: pesos(TOTAL) },
  { k: "QUITA APLICADA", v: pesos(0) },
  { k: "CAPITAL NUEVO", v: pesos(TOTAL), azul: true },
  { k: "PLAZO", v: "18 cuotas" },
  { k: "TNA", v: "120,00%" },
  { k: chico ? "PRIMER VENC." : "PRIMER VENCIMIENTO", v: "15/12/2026" },
];

// ---------- Small pieces ----------
const Chip: React.FC<{ t: string; bg: string; c: string; fs?: number }> = ({ t, bg, c, fs = 9.5 }) => (
  <span style={{ fontSize: fs, fontWeight: 700, color: c, background: bg, borderRadius: 5, padding: "3px 8px", letterSpacing: 0.3 }}>{t}</span>
);
const Check: React.FC<{ t: number; s?: number }> = ({ t, s = 16 }) => (
  <div style={{ width: s, height: s, borderRadius: 3, border: `1.6px solid ${t > 0.5 ? AZUL : "#9aa3b2"}`, background: t > 0.5 ? AZUL : "white", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 + Math.sin(Math.min(1, t) * Math.PI) * 0.2})` }}>
    {t > 0.5 ? <Icono d="M5 12 L10 17 L19 7" s={s - 3} w={3} /> : null}
  </div>
);
const Spinner: React.FC<{ frame: number; s: number; c?: string }> = ({ frame, s, c = "white" }) => (
  <div style={{ width: s, height: s, borderRadius: "50%", border: `2px solid ${c}`, borderTopColor: "transparent", transform: `rotate(${frame * 18}deg)` }} />
);
const EstadoPrestamo: React.FC<{ cancelada: number; nueva?: boolean; fs?: number }> = ({ cancelada, nueva, fs = 9.5 }) =>
  nueva ? (
    <Chip t="NUEVA" bg="#dcf3e3" c={VERDE} fs={fs} />
  ) : cancelada > 0.5 ? (
    <Chip t="CANCELADA" bg="#fde4e1" c={ROJO} fs={fs} />
  ) : (
    <span style={{ fontSize: fs + 1.5, color: TINTA }}>vigente</span>
  );
const Toast: React.FC<{ frame: number; desde: number; hasta?: number; titulo: string; sub: string; extra?: string; chico?: boolean }> = ({ frame, desde, hasta = 1e9, titulo, sub, extra, chico }) => {
  const t = spring({ frame: frame - desde, fps: 30, config: { damping: 16 } }) * interpolate(frame, [hasta - 10, hasta], [1, 0], clamp);
  if (frame < desde || frame >= hasta) {
    return null;
  }
  return (
    <div style={{ position: "absolute", right: chico ? 12 : 24, left: chico ? 12 : undefined, top: chico ? M_HEADER + 10 : HEADER + 16, zIndex: 7, background: "white", borderLeft: `4px solid ${VERDE}`, borderRadius: 10, boxShadow: "0 10px 26px rgba(20,30,50,0.22)", padding: chico ? "10px 14px" : "12px 18px", opacity: Math.min(1, t * 1.5), transform: `translateY(${(1 - t) * -16}px)` }}>
      <div style={{ fontSize: chico ? 12 : 13, fontWeight: 800, color: VERDE }}>✓ {titulo}</div>
      <div style={{ fontSize: chico ? 10.5 : 11, color: TINTA_2, marginTop: 3 }}>{sub}</div>
      {extra ? (
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: chico ? 10.5 : 11, color: AZUL, marginTop: 6, paddingTop: 6, borderTop: `1px solid ${BORDE}`, opacity: aparece(frame, desde + 14, 10) }}>
          <Icono d={I.correo} s={13} c={AZUL} w={2.2} /> {extra}
        </div>
      ) : null}
    </div>
  );
};

// Minimal "receipt sent" check in the middle of the screen.
const ReciboEnviado: React.FC<{ frame: number; chico?: boolean }> = ({ frame, chico }) => {
  const [a, b] = RECIBO_F;
  if (frame < a || frame >= b) {
    return null;
  }
  const t = spring({ frame: frame - a, fps: 30, config: { damping: 14 } }) * interpolate(frame, [b - 8, b], [1, 0], clamp);
  const check = interpolate(frame, [a + 4, a + 14], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 7 }}>
      <div style={{ width: chico ? 132 : 150, padding: chico ? "16px 0 14px" : "18px 0 16px", borderRadius: 16, background: "rgba(255,255,255,0.97)", boxShadow: "0 12px 36px rgba(10,20,40,0.28)", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: Math.min(1, t * 1.4), transform: `scale(${0.8 + 0.2 * t})` }}>
        <div style={{ width: chico ? 40 : 44, height: chico ? 40 : 44, borderRadius: "50%", background: VERDE, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width={22} height={22} viewBox="0 0 24 24">
            <path d="M5 12.5 L10 17.5 L19 7.5" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - check} />
          </svg>
        </div>
        <div style={{ fontSize: chico ? 11.5 : 12.5, fontWeight: 700, color: TINTA }}>Recibo enviado</div>
      </div>
    </div>
  );
};

// ---------- Tablet: home ----------
const HomeTab: React.FC<{ frame: number }> = ({ frame }) => (
  <div style={{ position: "absolute", left: SIDE, top: HEADER, right: 0, bottom: 0, background: "white" }}>
    <div style={{ position: "absolute", left: 40, top: 32, fontSize: 25, fontWeight: 500, color: TINTA, borderLeft: `3px solid ${TINTA}`, paddingLeft: 12, lineHeight: 1.1 }}>Core de Préstamos</div>
    <div style={{ position: "absolute", right: 24, top: 22, height: 60, background: "white", border: `1px solid ${BORDE}`, borderRadius: 12, boxShadow: "0 2px 10px rgba(20,30,50,0.06)", display: "flex", alignItems: "center", padding: "0 10px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 14px", fontSize: 12, fontWeight: 700, color: AZUL, borderRight: `1px solid ${BORDE}` }}>
        <Icono d={I.calendario} s={15} c={NAVY} w={2.2} /> Hoy
      </div>
      {INDICADORES(frame).map((it, k) => (
        <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 16px", borderRight: k < 3 ? `1px solid ${BORDE}` : undefined }}>
          <Icono d={it.i} s={20} c={NAVY} w={2.2} />
          <div>
            <div style={{ fontSize: 9.5, color: TINTA_2 }}>{it.k}</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: NAVY, minWidth: k % 2 ? 92 : 34 }}>{it.v}</div>
          </div>
        </div>
      ))}
    </div>
    {MODULOS.map((m, k) => {
      const c = k % 4;
      const r = Math.floor(k / 4);
      const t = aparece(frame, 6 + k * 3, 12);
      const press = k === 0 ? pulsado(frame, TAP_CONSULTAR) : k === 9 ? pulsado(frame, TAP_MOD_CONTA) : 0;
      return (
        <div key={m.t} style={{ position: "absolute", left: 64 + c * 262, top: 122 + r * 150, width: 236, opacity: t, transform: `translateY(${(1 - t) * 12}px) scale(${1 - press * 0.05})` }}>
          <div style={{ width: 42, height: 42, borderRadius: 8, background: AZUL, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icono d={m.i} s={22} />
          </div>
          {m.estrella ? <div style={{ position: "absolute", right: 0, top: -6, fontSize: 13, color: "#9aa3b2" }}>☆</div> : null}
          <div style={{ fontSize: 14.5, fontWeight: 700, color: TINTA, marginTop: 12 }}>{m.t}</div>
          <div style={{ fontSize: 11, color: AZUL_TXT, marginTop: 6, lineHeight: 1.5 }}>{m.d}</div>
        </div>
      );
    })}
  </div>
);

// ---------- Tablet: loan detail ----------
const BOTONES = ["COBRANZA", "CONDONACIÓN", "REVERSA", "CANCELACIÓN", "ANULACIÓN", "COBRANZA FECHA VALOR", "CUENTA CORRIENTE"];
const COLS_PLAN = [50, 90, 82, 82, 72, 82, 96, 82, 82, 82, 46, 60];
const CAB_PLAN = ["N° CTA.", "VENCIMIENTO", "CAPITAL", "INTERÉS", "IVA", "CUOTA", "PUNIT. C/IVA", "PAGADO", "COND / BONIF", "ADEUDADO", "MORA", "ESTADO"];
const MODAL_D = { x: 24, y: 14, w: 1086, h: 742 };
const TABLA_D = { x: 90, y: 312, cab: 30, fila: 30 };

const estadoCuota = (n: number, frame: number) => (n === 1 || (n === 2 && frame >= COBRADA) ? "PAGO" : "PENDIENTE");
const filaPlan = (p: (typeof PLAN)[number], frame: number) => {
  const pago = estadoCuota(p.n, frame) === "PAGO";
  return [
    String(p.n),
    p.venc,
    pesos(p.cap),
    pesos(p.interes),
    pesos(p.iva),
    pesos(CUOTA),
    pesos(0),
    pago ? pesos(CUOTA) : pesos(0),
    pesos(0),
    pago ? pesos(0) : pesos(CUOTA),
    "0",
  ];
};
const Badge: React.FC<{ pago: boolean; fs?: number }> = ({ pago, fs = 9 }) => (
  <span style={{ fontSize: fs, fontWeight: 800, letterSpacing: 0.4, padding: "4px 10px", borderRadius: 5, color: pago ? "white" : "#4b5563", background: pago ? NAVY : "#eceef2" }}>{pago ? "PAGO" : "PENDIENTE"}</span>
);

const HojaCobranza: React.FC<{ frame: number; chico?: boolean }> = ({ frame, chico }) => {
  const [a, b] = HOJA_COBRANZA;
  const v = interpolate(frame, [a, a + 8, b - 8, b], [0, 1, 1, 0], clamp);
  if (v <= 0.001) {
    return null;
  }
  const press = pulsado(frame, TAP_CONFIRMAR_COB);
  const cuerpo = (
    <>
      <div style={{ fontSize: chico ? 15 : 15, fontWeight: 800, color: TINTA }}>Registrar cobranza</div>
      <div style={{ fontSize: 11, color: TINTA_2, marginTop: 4 }}>Cuota 2 · Vence 10/11/2026</div>
      <div style={{ marginTop: 14, fontSize: 10, color: TINTA_2, letterSpacing: 0.5 }}>IMPORTE</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: NAVY, marginTop: 2 }}>{pesos(CUOTA)}</div>
      <div style={{ marginTop: 12, fontSize: 10, color: TINTA_2, letterSpacing: 0.5 }}>MEDIO DE PAGO</div>
      <div style={{ marginTop: 4, height: 32, border: `1px solid ${BORDE}`, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px", fontSize: 12, color: TINTA }}>
        Efectivo <span style={{ fontSize: 9 }}>▾</span>
      </div>
    </>
  );
  if (chico) {
    return (
      <div style={{ position: "absolute", inset: 0, zIndex: 6 }}>
        <div style={{ position: "absolute", inset: 0, background: `rgba(10,14,22,${0.45 * v})` }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 330, background: "white", borderRadius: "18px 18px 0 0", padding: "18px 20px", boxSizing: "border-box", transform: `translateY(${(1 - v) * 330}px)` }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: "#d6dae1", margin: "0 auto 14px" }} />
          {cuerpo}
          <div style={{ position: "absolute", left: 20, right: 20, bottom: 40, height: 44, borderRadius: 9, background: VERDE, color: "white", fontSize: 13, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 - press * 0.05})` }}>Confirmar cobranza</div>
        </div>
      </div>
    );
  }
  return (
    <div style={{ position: "absolute", left: 363, top: 230, width: 360, height: 236, background: "white", borderRadius: 12, boxShadow: "0 20px 50px rgba(10,20,40,0.35)", padding: "18px 22px", boxSizing: "border-box", opacity: v, transform: `scale(${0.94 + 0.06 * v})`, zIndex: 3 }}>
      {cuerpo}
      <div style={{ position: "absolute", right: 22, bottom: 16, display: "flex", gap: 10 }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: TINTA, border: `1px solid ${BORDE}`, borderRadius: 7, padding: "8px 14px" }}>Cancelar</div>
        <div style={{ fontSize: 11.5, fontWeight: 800, color: "white", background: VERDE, borderRadius: 7, padding: "8px 16px", transform: `scale(${1 - press * 0.06})` }}>Confirmar</div>
      </div>
    </div>
  );
};

const DetalleTab: React.FC<{ frame: number }> = ({ frame }) => {
  const f0 = ESC.detalle[0];
  const modal = spring({ frame: frame - f0 - 4, fps: 30, config: { damping: 18 } });
  const hoja = interpolate(frame, [HOJA_COBRANZA[0], HOJA_COBRANZA[0] + 8, HOJA_COBRANZA[1] - 8, HOJA_COBRANZA[1]], [0, 1, 1, 0], clamp);
  const brillo = interpolate(frame, [COBRADA, COBRADA + 8, COBRADA + 70], [0, 1, 0], clamp);
  const info: [string, React.ReactNode][][] = [
    [["NOMBRE", "JAVIER PEREZ"], ["COMERCIO", "COMERCIO CENTRO"], ["DNI", "2845678"]],
    [["CAPITAL", "$ 1.500.000,00"], ["SUCURSAL", "SUC. 01 - CENTRO"], ["CUOTAS", "12"], ["CARTERA", <Chip key="c" t="PROPIA" bg="#e3edf9" c={AZUL} />]],
    [["TNA", "120%"], ["TIPO", <Chip key="t" t="RENOVACIÓN" bg="#e3edf9" c={AZUL} />], ["ESTADO", <Chip key="e" t="VIGENTE" bg="#e3edf9" c={AZUL} />], ["TITULAR CARTERA", "-"]],
    [["FECHA ALTA", "18/09/2026"], ["BONIFICA ÚLT. CUOTA", "NO"], ["PAGO ADELANTADO", "NO"], ["DESC. PRONTO PAGO", "NO"]],
  ];
  return (
    <div style={{ position: "absolute", left: SIDE, top: HEADER, right: 0, bottom: 0, background: "#e9ebef" }}>
      {/* Client page behind the modal */}
      {[0, 1, 2].map((k) => (
        <div key={k} style={{ position: "absolute", left: 30 + k * 370, top: 30, width: 350, height: 300, background: "white", borderRadius: 10 }} />
      ))}
      <div style={{ position: "absolute", left: 30, top: 350, width: 1090, height: 380, background: "white", borderRadius: 10 }} />
      <div style={{ position: "absolute", inset: 0, background: `rgba(15,18,24,${0.5 * modal})` }} />
      <div style={{ position: "absolute", left: MODAL_D.x, top: MODAL_D.y, width: MODAL_D.w, height: MODAL_D.h, background: "white", borderRadius: 12, opacity: Math.min(1, modal * 1.4), transform: `translateY(${(1 - modal) * 30}px)`, overflow: "hidden" }}>
        <div style={{ position: "absolute", right: 24, top: 18 }}>
          <Icono d={I.cruz} s={20} c={TINTA} w={2.2} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 20, textAlign: "center", fontSize: 17, fontWeight: 500, color: TINTA }}>Detalle del Préstamo: 2026091800003</div>
        <div style={{ position: "absolute", left: 70, right: 70, top: 56, height: 150, background: "#f5f6f8", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "space-around" }}>
          {info.map((col, c) => (
            <div key={c} style={{ display: "flex", flexDirection: "column", gap: 11, alignItems: "center" }}>
              {col.map(([k, v]) => (
                <div key={k} style={{ fontSize: 11, color: TINTA, letterSpacing: 0.3, display: "flex", alignItems: "center", gap: 6 }}>
                  {k}: {typeof v === "string" ? <b style={{ fontWeight: 700 }}>{v}</b> : v}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ position: "absolute", left: 157, top: 222, fontSize: 9.5, fontWeight: 700, color: AZUL_TXT, letterSpacing: 0.6 }}>ACCESOS RÁPIDOS</div>
        <div style={{ position: "absolute", left: 157, top: 240, display: "flex", gap: 8 }}>
          {BOTONES.map((b, k) => (
            <div key={b} style={{ height: 26, padding: "0 12px", borderRadius: 5, background: AZUL, color: "white", fontSize: 9.5, fontWeight: 700, letterSpacing: 0.3, display: "flex", alignItems: "center", transform: `scale(${k === 0 ? 1 - pulsado(frame, TAP_COBRANZA) * 0.08 : 1})` }}>
              {b}
            </div>
          ))}
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 282, textAlign: "center", fontSize: 16, fontWeight: 500, color: TINTA }}>Plan de Pagos</div>
        <div style={{ position: "absolute", left: TABLA_D.x, top: TABLA_D.y, width: 906 }}>
          <div style={{ display: "flex", height: TABLA_D.cab, alignItems: "center", background: NAVY, color: "white", fontSize: 9, fontWeight: 700, letterSpacing: 0.3 }}>
            {CAB_PLAN.map((c, k) => (
              <div key={c} style={{ width: COLS_PLAN[k], textAlign: "center" }}>
                {c}
              </div>
            ))}
          </div>
          {PLAN.map((p, i) => {
            const t = aparece(frame, f0 + 14 + i * 3, 10);
            const pago = estadoCuota(p.n, frame) === "PAGO";
            return (
              <div key={p.n} style={{ display: "flex", height: TABLA_D.fila, alignItems: "center", fontSize: 9.5, color: TINTA, borderBottom: "1px solid #f0f2f5", opacity: t, background: p.n === 2 ? `rgba(30,107,58,${brillo * 0.12})` : "white" }}>
                {filaPlan(p, frame).map((v, k) => (
                  <div key={k} style={{ width: COLS_PLAN[k], textAlign: "center" }}>
                    {v}
                  </div>
                ))}
                <div style={{ width: COLS_PLAN[11], display: "flex", justifyContent: "center" }}>
                  <Badge pago={pago} />
                </div>
              </div>
            );
          })}
        </div>
        {hoja > 0.001 ? <div style={{ position: "absolute", inset: 0, background: `rgba(15,18,24,${0.35 * hoja})` }} /> : null}
        <HojaCobranza frame={frame} />
      </div>
    </div>
  );
};

// ---------- Tablet: consolidation ----------
const COLS_C = [50, 150, 130, 60, 96, 100, 70, 134, 104];
const CAB_C = ["", "CÓDIGO", "CAPITAL", "PLAZO", "ESTADO", "CARTERA", "TITULAR", "SALDO CANCEL.", "ALTA"];
const TABLA_C = { x: 120, y: 252, w: 894, cab: 36, fila: 42 };
const MODAL_C = { x: 247, y: 150, w: 640, h: 458, cards: 196 };

const BusquedaDni: React.FC<{ frame: number; chico?: boolean }> = ({ frame, chico }) => {
  const dni = "2845678".slice(0, Math.round(interpolate(frame, TIPEO, [0, 7], clamp)));
  const foco = frame >= TAP_INPUT;
  const cursor = foco && frame < TAP_BUSCAR && Math.floor(frame / 8) % 2 === 0;
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: chico ? 11.5 : 12, color: TINTA }}>
        <Icono d={I.persona} s={15} c={NAVY} w={2.2} /> Buscar préstamos por DNI
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <div style={{ flex: 1, height: 38, border: `1.5px solid ${foco ? AZUL : BORDE}`, borderRadius: 7, display: "flex", alignItems: "center", padding: "0 14px", fontSize: 13, color: TINTA }}>
          {dni}
          {cursor ? <span style={{ width: 1.5, height: 16, background: TINTA, marginLeft: 1 }} /> : null}
        </div>
        <div style={{ width: chico ? 88 : 104, height: 38, borderRadius: 7, background: NAVY, color: "white", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transform: `scale(${1 - pulsado(frame, TAP_BUSCAR) * 0.06})` }}>
          <Icono d={I.lupa} s={14} w={2.4} /> Buscar
        </div>
      </div>
    </>
  );
};

const ModalConsolidacion: React.FC<{ frame: number; chico?: boolean }> = ({ frame, chico }) => {
  const v = interpolate(frame, [MODAL, MODAL + 10, PROCESADA - 8, PROCESADA], [0, 1, 1, 0], clamp);
  if (v <= 0.001) {
    return null;
  }
  const press = pulsado(frame, TAP_PROCESAR);
  const cargando = frame >= TAP_PROCESAR + 4;
  const cards = tarjetasModal(!!chico);
  const chips = (
    <div style={{ display: "flex", flexWrap: "wrap", gap: chico ? 6 : 8, marginTop: 8 }}>
      {PRESTAMOS.slice(0, 5).map((p) => (
        <span key={p.cod} style={{ fontSize: chico ? 10 : 11, color: AZUL, background: "#eef4fb", border: "1px solid #c9daef", borderRadius: 12, padding: chico ? "4px 9px" : "4px 10px" }}>
          {p.cod}
        </span>
      ))}
    </div>
  );
  const boton = (
    <div style={{ height: chico ? 44 : 40, padding: "0 18px", borderRadius: 8, background: VERDE, color: "white", fontSize: chico ? 12.5 : 12.5, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transform: `scale(${1 - press * 0.05})`, flex: chico ? 1.4 : undefined }}>
      {cargando ? <Spinner frame={frame} s={14} /> : null}
      {cargando ? "Procesando…" : "Confirmar y procesar"}
    </div>
  );
  const cancelar = (
    <div style={{ height: chico ? 44 : 40, padding: "0 18px", borderRadius: 8, border: `1px solid ${BORDE}`, color: TINTA, fontSize: 12.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flex: chico ? 1 : undefined }}>Cancelar</div>
  );
  const grilla = (
    <div style={{ display: "grid", gridTemplateColumns: chico ? "1fr 1fr" : "1fr 1fr 1fr", gap: chico ? 8 : 12, marginTop: chico ? 12 : 14 }}>
      {cards.map((c) => (
        <div key={c.k} style={{ height: chico ? 62 : 70, borderRadius: 9, border: `1px solid ${c.azul ? "#c9daef" : BORDE}`, background: c.azul ? "#eef4fb" : "white", padding: chico ? "10px 12px" : "12px 16px", boxSizing: "border-box" }}>
          <div style={{ fontSize: chico ? 8.5 : 9.5, color: TINTA_2, letterSpacing: 0.5 }}>{c.k}</div>
          <div style={{ fontSize: chico ? 14 : 17, fontWeight: 700, color: c.azul ? AZUL : TINTA, marginTop: 6 }}>{c.v}</div>
        </div>
      ))}
    </div>
  );
  const texto = <div style={{ fontSize: chico ? 11 : 11.5, color: TINTA, lineHeight: 1.5 }}>Vas a cancelar los siguientes préstamos y dar de alta una nueva operación. Revisá el resumen antes de confirmar.</div>;
  if (chico) {
    return (
      <div style={{ position: "absolute", inset: 0, zIndex: 6 }}>
        <div style={{ position: "absolute", inset: 0, background: `rgba(10,14,22,${0.5 * v})` }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 300, bottom: 0, background: "white", borderRadius: "18px 18px 0 0", padding: "16px 16px", boxSizing: "border-box", transform: `translateY(${(1 - v) * 544}px)` }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: "#d6dae1", margin: "0 auto 12px" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: TINTA }}>Confirmar consolidación</div>
            <Icono d={I.cruz} s={16} c={TINTA_2} w={2.2} />
          </div>
          {texto}
          <div style={{ fontSize: 10.5, color: TINTA_2, marginTop: 10 }}>Operaciones a cancelar:</div>
          {chips}
          {grilla}
          <div style={{ position: "absolute", left: 16, right: 16, bottom: 28, display: "flex", gap: 10 }}>
            {cancelar}
            {boton}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 4 }}>
      <div style={{ position: "absolute", inset: 0, background: `rgba(15,18,24,${0.45 * v})` }} />
      <div style={{ position: "absolute", left: MODAL_C.x, top: MODAL_C.y, width: MODAL_C.w, height: MODAL_C.h, background: "white", borderRadius: 12, boxShadow: "0 24px 60px rgba(10,20,40,0.35)", opacity: v, transform: `scale(${0.95 + 0.05 * v})` }}>
        <div style={{ height: 62, borderBottom: `1px solid ${BORDE}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: TINTA }}>Confirmar consolidación</div>
          <Icono d={I.cruz} s={16} c={TINTA_2} w={2.2} />
        </div>
        <div style={{ padding: "18px 24px 0" }}>
          {texto}
          <div style={{ fontSize: 11, color: TINTA_2, marginTop: 14 }}>Operaciones a cancelar:</div>
          {chips}
        </div>
        <div style={{ position: "absolute", left: 24, right: 24, top: MODAL_C.cards - 14 }}>{grilla}</div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 86, borderTop: `1px solid ${BORDE}`, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10, padding: "0 24px" }}>
          {cancelar}
          {boton}
        </div>
      </div>
    </div>
  );
};

const ConsolidacionTab: React.FC<{ frame: number }> = ({ frame }) => {
  const res = aparece(frame, RESULTADOS, 10);
  const n = marcados(frame);
  const fin = procesada(frame);
  const nueva = spring({ frame: frame - PROCESADA - 4, fps: 30, config: { damping: 16 } });
  const brillo = interpolate(frame, [PROCESADA + 4, PROCESADA + 14, PROCESADA + 90], [0, 1, 0.35], clamp);
  const fila = (cells: React.ReactNode[], key: string, extra: React.CSSProperties = {}) => (
    <div key={key} style={{ display: "flex", height: TABLA_C.fila, alignItems: "center", borderTop: `1px solid ${BORDE}`, fontSize: 11.5, color: TINTA, ...extra }}>
      {cells.map((c, k) => (
        <div key={k} style={{ width: COLS_C[k], paddingLeft: k === 0 ? 18 : 0, textAlign: k === 2 || k === 7 ? "right" : k === 3 ? "center" : "left", paddingRight: k === 2 || k === 7 ? 18 : 0, boxSizing: "border-box", display: k === 0 ? "flex" : "block" }}>
          {c}
        </div>
      ))}
    </div>
  );
  return (
    <div style={{ position: "absolute", left: SIDE, top: HEADER, right: 0, bottom: 0, background: "#eef0f3" }}>
      <div style={{ position: "absolute", left: 317, top: 36, width: 500, height: 118, background: "white", borderRadius: 10, boxShadow: "0 2px 8px rgba(20,30,50,0.05)", padding: "22px 28px", boxSizing: "border-box" }}>
        <BusquedaDni frame={frame} />
      </div>
      <div style={{ opacity: res, transform: `translateY(${(1 - res) * 10}px)` }}>
        <div style={{ position: "absolute", left: TABLA_C.x, top: 172, width: TABLA_C.w, height: 44, background: "white", borderRadius: 10, display: "flex", alignItems: "center", padding: "0 22px", boxSizing: "border-box", fontSize: 12.5, color: TINTA }}>
          <Icono d={I.persona} s={15} c={NAVY} w={2.4} />
          <b style={{ marginLeft: 8, fontWeight: 700 }}>JAVIER PEREZ</b>
          <span style={{ marginLeft: "auto", marginRight: "auto", fontSize: 11.5 }}>DNI: 2845678</span>
          <span style={{ fontSize: 11.5, color: TINTA_2 }}>Préstamos elegibles: 8</span>
        </div>
        <div style={{ position: "absolute", left: TABLA_C.x + 4, top: 228, fontSize: 12, color: TINTA }}>Seleccioná los préstamos a consolidar (mínimo 2)</div>
        <div style={{ position: "absolute", left: TABLA_C.x, top: TABLA_C.y, width: TABLA_C.w, background: "white", borderRadius: 10, overflow: "hidden", boxShadow: "0 2px 8px rgba(20,30,50,0.05)" }}>
          <div style={{ display: "flex", height: TABLA_C.cab, alignItems: "center", fontSize: 9.5, fontWeight: 600, color: TINTA_2, letterSpacing: 0.5 }}>
            {CAB_C.map((c, k) => (
              <div key={k} style={{ width: COLS_C[k], textAlign: k === 2 || k === 7 ? "right" : k === 3 ? "center" : "left", paddingRight: k === 2 || k === 7 ? 18 : 0, boxSizing: "border-box" }}>
                {c}
              </div>
            ))}
          </div>
          {fin > 0.01 ? (
            <div style={{ height: TABLA_C.fila * Math.min(1, nueva), overflow: "hidden" }}>
              {fila(
                [<div key="x" style={{ width: 16 }} />, <b key="c">{NUEVA_OP}</b>, pesos(TOTAL), "18", <EstadoPrestamo key="e" cancelada={0} nueva />, <Chip key="p" t="PROPIA" bg="#e6f6f4" c="#0f766e" />, "—", "—", "15/11/2026"],
                "nueva",
                { background: `rgba(30,107,58,${0.06 + brillo * 0.12})`, borderTop: "none" },
              )}
            </div>
          ) : null}
          {PRESTAMOS.map((p, i) => {
            const t = aparece(frame, RESULTADOS + 4 + i * 3, 10);
            const sel = i < 5 ? interpolate(frame, [TAP_CHECK[i] + 1, TAP_CHECK[i] + 6], [0, 1], clamp) : 0;
            const cancelada = i < 5 ? fin : 0;
            return fila(
              [
                <Check key="k" t={sel * (1 - cancelada)} />,
                <span key="c" style={{ textDecoration: cancelada > 0.5 ? "line-through" : "none", color: cancelada > 0.5 ? TINTA_2 : TINTA }}>{p.cod}</span>,
                pesos(p.capital),
                String(p.plazo),
                <EstadoPrestamo key="e" cancelada={cancelada} />,
                <Chip key="p" t="PROPIA" bg="#e6f6f4" c="#0f766e" />,
                "—",
                sel > 0.5 && p.saldo ? pesos(p.saldo) : <span key="s" style={{ color: "#c0c6d0" }}>—</span>,
                p.alta,
              ],
              p.cod,
              { opacity: t, background: sel > 0.5 && cancelada < 0.5 ? "#f2f6fc" : "white" },
            );
          })}
          <div style={{ height: 54 * (1 - fin), overflow: "hidden", opacity: 1 - fin }}>
            <div style={{ height: 54, borderTop: `1px solid ${BORDE}`, background: "#fafbfc", display: "flex", alignItems: "center", padding: "0 24px", fontSize: 12, color: TINTA }}>
              Seleccionados: <b style={{ marginLeft: 6 }}>{n}</b>
              <span style={{ margin: "0 14px", color: BORDE }}>|</span>
              Total cancelación: <b style={{ marginLeft: 6, color: AZUL, minWidth: 120 }}>{pesos(totalMarcado(frame))}</b>
              <div style={{ marginLeft: "auto", height: 34, padding: "0 18px", borderRadius: 7, background: NAVY, color: "white", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, opacity: n >= 2 ? 1 : 0.45, transform: `scale(${1 - pulsado(frame, TAP_CONTINUAR) * 0.06})` }}>
                Continuar →
              </div>
            </div>
          </div>
        </div>
      </div>
      <ModalConsolidacion frame={frame} />
    </div>
  );
};

// ---------- Accounting: module modal over the home ----------
type Sub = { t: string; d: string; i: string };
const SUBMODULOS: Sub[] = [
  { t: "Inventarios Contables", d: "Genera los stock de las operaciones realizadas", i: "M12 3 L21 8 L12 13 L3 8 Z M3 12 L12 17 L21 12 M3 16 L12 21 L21 16" },
  { t: "Libro Diario", d: "Generación y consulta de asientos contables mensuales", i: "M6 3 H18 V21 H6 Z M9 7 H15 M9 11 H15" },
  { t: "Plan de Cuentas", d: "Alias de código/nombre y descripción de las cuentas contables", i: "M4 6 H6 M4 12 H6 M4 18 H6 M9 6 H20 M9 12 H20 M9 18 H20" },
  { t: "Sellados", d: "Impuesto de sellos: alícuotas por provincia, sucursal o general", i: "M9 4 H15 V10 H9 Z M12 10 V14 M5 14 H19 V18 H5 Z M5 21 H19" },
  { t: "Ingresos Brutos", d: "IIBB sobre ingresos facturables: alícuotas por provincia, sucursal o general", i: "M6 18 L18 6 M7.5 6 A1.5 1.5 0 1 1 7.5 9 A1.5 1.5 0 1 1 7.5 6 M16.5 15 A1.5 1.5 0 1 1 16.5 18 A1.5 1.5 0 1 1 16.5 15" },
  { t: "Estados Financieros", d: "Patrimonial y resultados acumulados del proceso de créditos", i: "M12 4 V20 M5 20 H19 M4 8 H20 M4 8 L2 14 H6 Z M20 8 L18 14 H22 Z" },
];
const MODAL_K = { x: 87, y: 140, w: 960, h: 442 };
const modalConta = (frame: number) => interpolate(frame, [MODAL_CONTA, MODAL_CONTA + 10, ESC.conta[1] - 6, ESC.conta[1]], [0, 1, 1, 0], clamp);

const ContaTab: React.FC<{ frame: number }> = ({ frame }) => {
  const v = modalConta(frame);
  return (
    <>
      <HomeTab frame={frame} />
      <div style={{ position: "absolute", left: SIDE, top: HEADER, right: 0, bottom: 0, backdropFilter: `blur(${3 * v}px)`, background: `rgba(30,36,48,${0.4 * v})` }}>
        <div style={{ position: "absolute", left: MODAL_K.x, top: MODAL_K.y, width: MODAL_K.w, height: MODAL_K.h, background: "white", borderRadius: 14, boxShadow: "0 24px 60px rgba(10,20,40,0.3)", opacity: v, transform: `scale(${0.95 + 0.05 * v})` }}>
          <div style={{ position: "absolute", left: 28, top: 24, fontSize: 20, fontWeight: 500, color: TINTA }}>Contabilidad</div>
          <div style={{ position: "absolute", right: 28, top: 26 }}>
            <Icono d={I.cruz} s={18} c={TINTA_2} w={2.2} />
          </div>
          {SUBMODULOS.map((m, k) => {
            const c = k % 3;
            const r = Math.floor(k / 3);
            const t = aparece(frame, MODAL_CONTA + 6 + k * 3, 10);
            return (
              <div key={m.t} style={{ position: "absolute", left: 56 + c * 300, top: 98 + r * 170, width: 256, opacity: t, transform: `translateY(${(1 - t) * 10}px) scale(${k === 5 ? 1 - pulsado(frame, TAP_ESTADOS) * 0.05 : 1})` }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: AZUL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icono d={m.i} s={20} />
                </div>
                <div style={{ position: "absolute", right: 0, top: -6, fontSize: 13, color: "#9aa3b2" }}>☆</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: TINTA, marginTop: 14 }}>{m.t}</div>
                <div style={{ fontSize: 11.5, color: TINTA_2, marginTop: 6, lineHeight: 1.5 }}>{m.d}</div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

// ---------- Financial statements ----------
type Linea = { t: string; v?: number; tipo?: "cab" | "sub" | "total" | "final" };
const PATRIMONIAL: Linea[] = [
  { t: "ACTIVO", tipo: "cab" },
  { t: "Cartera bruta (Préstamos a terceros)", v: 1263712450 },
  { t: "(-) Intereses a devengar", v: -312480120, tipo: "sub" },
  { t: "(-) Previsión incobrables", v: -48906300, tipo: "sub" },
  { t: "Cartera neta", v: 902326030 },
  { t: "Intereses a cobrar", v: 64218900 },
  { t: "IVA int. devengados a cobrar", v: 13485969 },
  { t: "Banco", v: 186540210 },
  { t: "Puente refinanciación (transitorio)", v: 4120000 },
  { t: "TOTAL ACTIVO", v: 1170691109, tipo: "total" },
  { t: "PASIVO", tipo: "cab" },
  { t: "IVA débito fiscal", v: 21904330 },
  { t: "Ley de sellos a pagar", v: 6318560 },
  { t: "IIBB a pagar", v: 9477840 },
  { t: "TOTAL PASIVO", v: 37700730, tipo: "total" },
  { t: "PATRIMONIO NETO", v: 1132990379, tipo: "final" },
];
const RESULTADOS_EF: Linea[] = [
  { t: "INGRESOS", tipo: "cab" },
  { t: "Intereses ganados", v: 412860540 },
  { t: "Gestión administrativa", v: 38214000 },
  { t: "Recupero de previsión", v: 5630200 },
  { t: "TOTAL INGRESOS", v: 456704740, tipo: "total" },
  { t: "EGRESOS", tipo: "cab" },
  { t: "Cargo previsión", v: 48906300 },
  { t: "Pérdida por condonación", v: 3540900 },
  { t: "Pérdida por incobrabilidad", v: 12284610 },
  { t: "Ingresos brutos (IIBB)", v: 19760400 },
  { t: "TOTAL EGRESOS", v: 84492210, tipo: "total" },
  { t: "RESULTADO NETO", v: 372212530, tipo: "final" },
];
const generado = (frame: number) => sube(frame, TAP_GENERAR + 6, 40);
const FILA_EF = 30;
const LineaEF: React.FC<{ l: Linea; t: number; fs?: number; h?: number }> = ({ l, t, fs = 11.5, h = FILA_EF }) => {
  const cab = l.tipo === "cab";
  const final = l.tipo === "final";
  const verde = final && l.t === "RESULTADO NETO";
  return (
    <div style={{ height: h, display: "flex", alignItems: "center", padding: `0 ${final ? 10 : 10}px 0 ${l.tipo === "sub" ? 24 : 10}px`, fontSize: cab ? fs - 2 : fs, fontWeight: cab ? 600 : final ? 600 : 500, letterSpacing: cab ? 0.6 : 0, color: verde ? "#16a34a" : TINTA, background: cab || l.tipo === "total" ? "#f1f3f6" : "white", borderBottom: final ? "none" : "1px solid #f0f2f5", borderTop: final ? `1.5px solid ${TINTA}` : undefined }}>
      {l.t}
      {l.v !== undefined ? <span style={{ marginLeft: "auto", fontWeight: final || l.tipo === "total" ? 700 : 500, color: final ? "#16a34a" : TINTA }}>{pesos(l.v * t)}</span> : null}
    </div>
  );
};
const EF_IZQ = { x: 120, y: 152, w: 440 };
const EF_DER = { x: 584, y: 152, w: 440 };
const EstadosTab: React.FC<{ frame: number }> = ({ frame }) => {
  const t = generado(frame);
  const tarjeta = (titulo: string, lineas: Linea[], pos: { x: number; y: number; w: number }) => (
    <div style={{ position: "absolute", left: pos.x, top: pos.y, width: pos.w, border: `1px solid ${BORDE}`, borderRadius: 10, padding: "16px 20px 14px", boxSizing: "border-box", background: "white" }}>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: TINTA, paddingBottom: 10, borderBottom: `1.5px solid ${AZUL}`, marginBottom: 12 }}>{titulo}</div>
      {lineas.map((l, k) => (
        <div key={l.t} style={{ opacity: aparece(frame, ESC.estados[0] + 8 + k * 2, 8) }}>
          <LineaEF l={l} t={t} />
        </div>
      ))}
    </div>
  );
  return (
    <div style={{ position: "absolute", left: SIDE, top: HEADER, right: 0, bottom: 0, background: "white" }}>
      <div style={{ position: "absolute", left: EF_IZQ.x, top: 38, fontSize: 19, fontWeight: 600, color: TINTA }}>Estados Financieros — Créditos</div>
      <div style={{ position: "absolute", right: 110, top: 30, display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: TINTA_2 }}>
        Mes:
        <div style={{ height: 34, padding: "0 12px", border: `1px solid ${BORDE}`, borderRadius: 6, display: "flex", alignItems: "center", gap: 18, color: TINTA }}>
          Octubre <span style={{ fontSize: 9 }}>▾</span>
        </div>
        Año:
        <div style={{ height: 34, width: 70, padding: "0 12px", border: `1px solid ${BORDE}`, borderRadius: 6, display: "flex", alignItems: "center", color: TINTA, boxSizing: "border-box" }}>2026</div>
        <div style={{ height: 34, padding: "0 16px", borderRadius: 6, background: "#2563eb", color: "white", fontWeight: 600, display: "flex", alignItems: "center", transform: `scale(${1 - pulsado(frame, TAP_GENERAR) * 0.07})` }}>Generar</div>
        <div style={{ height: 34, padding: "0 14px", borderRadius: 6, background: "#e5e7eb", color: TINTA, fontWeight: 600, display: "flex", alignItems: "center" }}>Imprimir</div>
      </div>
      <div style={{ position: "absolute", left: EF_IZQ.x, top: 92, fontSize: 11, fontStyle: "italic", color: TINTA_2 }}>
        Acumulado a Octubre 2026 — {Math.round(1284 * t).toLocaleString("es-AR")} asiento(s) confirmado(s) considerado(s)
      </div>
      {tarjeta("Estado Patrimonial", PATRIMONIAL, EF_IZQ)}
      {tarjeta("Estado de Resultados", RESULTADOS_EF, EF_DER)}
    </div>
  );
};

// ---------- Dark reports ----------
const OSC = { fondo: "#0b111d", panel: "#111a2b", linea: "#22304a", texto: "#e5e9f0", texto2: "#9aa6b8", azul: "#4f7cac", verde: "#5f9e86" };
const MESES = ["2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06", "2026-07", "2026-08", "2026-09", "2026-10"];
const MESES_CORTOS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct"];
const ALTAS_OPS = [610, 840, 720, 1180, 960, 1350, 870, 1240, 1490, 1110];
const ALTAS_CAP = [62, 96, 74, 128, 101, 152, 88, 139, 171, 118];
const kpisCartera = (frame: number) => {
  const t = sube(frame, ESC.resumen[0] + 10, 36);
  return [
    { k: "OPERACIONES", v: Math.round(11482 * t).toLocaleString("es-AR"), c: "#5b84b8" },
    { k: "CAPITAL OTORGADO", v: `$${(1318.4 * t).toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} MM`, c: "#5b84b8" },
    { k: "CAPITAL EN MORA", v: `$${(259.6 * t).toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} MM`, c: "#b85b5b" },
    { k: "TNA PROMEDIO", v: `${Math.round(198 * t)}%`, c: "#c9a45b" },
    { k: "% EN MORA", v: `${(19.7 * t).toFixed(1).replace(".", ",")}%`, c: "#c98a4b" },
    { k: "% MORA >30", v: `${(14.9 * t).toFixed(1).replace(".", ",")}%`, c: "#8b7bc9" },
  ];
};
const GraficoAltas: React.FC<{ frame: number; w: number; h: number; fs?: number }> = ({ frame, w, h, fs = 10 }) => {
  const izq = fs * 3.2;
  const der = fs * 4.6;
  const abajo = fs * 2;
  const W = w - izq - der;
  const H = h - abajo - 6;
  const paso = W / MESES.length;
  const f0 = ESC.resumen[0] + 18;
  const pts = ALTAS_CAP.map((c, i) => [izq + paso * (i + 0.5), 6 + H - (c / 180) * H]);
  const d = pts.reduce((acc, [x, y], i) => {
    if (i === 0) {
      return `M ${x} ${y}`;
    }
    const [px, py] = pts[i - 1];
    const mx = (px + x) / 2;
    return `${acc} C ${mx} ${py} ${mx} ${y} ${x} ${y}`;
  }, "");
  const linea = interpolate(frame, [f0 + 20, f0 + 70], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  return (
    <svg width={w} height={h}>
      {[0, 0.25, 0.5, 0.75, 1].map((g) => (
        <g key={g}>
          <line x1={izq} x2={izq + W} y1={6 + H - g * H} y2={6 + H - g * H} stroke={OSC.linea} strokeWidth={1} />
          <text x={izq - 6} y={6 + H - g * H + fs * 0.35} fill={OSC.texto2} fontSize={fs * 0.85} textAnchor="end">
            {Math.round(1600 * g)}
          </text>
          <text x={izq + W + 6} y={6 + H - g * H + fs * 0.35} fill={OSC.texto2} fontSize={fs * 0.85}>
            ${Math.round(180 * g)} MM
          </text>
        </g>
      ))}
      {ALTAS_OPS.map((o, i) => {
        const t = sube(frame, f0 + i * 4, 24);
        const bh = (o / 1600) * H * t;
        return <rect key={i} x={izq + paso * i + paso * 0.15} y={6 + H - bh} width={paso * 0.7} height={bh} rx={2} fill="#3c5272" stroke="#5b7aa3" strokeWidth={1} />;
      })}
      <path d={d} fill="none" stroke={OSC.verde} strokeWidth={2.4} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - linea} />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3.5} fill={OSC.verde} opacity={linea >= (i + 0.5) / pts.length ? 1 : 0} />
      ))}
      {MESES.map((m, i) => (
        <text key={m} x={izq + paso * (i + 0.5)} y={h - fs * 0.5} fill={OSC.texto} fontSize={fs * 0.85} textAnchor="middle">
          {fs < 9 ? MESES_CORTOS[i] : m}
        </text>
      ))}
    </svg>
  );
};
const Barras: React.FC<{ frame: number; desde: number; datos: number[]; max: number; w: number; h: number; color: string }> = ({ frame, desde, datos, max, w, h, color }) => (
  <svg width={w} height={h}>
    {datos.map((v, i) => {
      const t = sube(frame, desde + i * 3, 22);
      const paso = w / datos.length;
      const bh = (v / max) * h * t;
      return <rect key={i} x={paso * i + paso * 0.2} y={h - bh} width={paso * 0.6} height={bh} rx={2} fill={color} />;
    })}
  </svg>
);
const Dona: React.FC<{ frame: number; desde: number; partes: [number, string][]; s: number; grosor: number }> = ({ frame, desde, partes, s, grosor }) => {
  const r = (s - grosor) / 2;
  const L = 2 * Math.PI * r;
  const t = sube(frame, desde, 40);
  let acc = 0;
  return (
    <svg width={s} height={s} style={{ transform: "rotate(-90deg)" }}>
      {partes.map(([p, c], i) => {
        const seg = (
          <circle key={i} cx={s / 2} cy={s / 2} r={r} fill="none" stroke={c} strokeWidth={grosor} strokeDasharray={`${L * p * t} ${L}`} strokeDashoffset={-L * acc * t} />
        );
        acc += p;
        return seg;
      })}
    </svg>
  );
};

const FILTROS = ["Todas las carteras", "Todos los segmentos", "Todas las Lín. Cdto.", "Todos los titulares", "Todas las sucursales", "Todos los subsegmentos", "Todos los riesgos"];
const ESTADOS_CARTERA = ["Vigente", "Non Accrual", "Castigado", "Cancelado", "Pagado", "Refinanciado", "Renovado", "Consolidado", "Anulado"];
const KPI_CARTERA = { x: 16, y: 210, w: 1102, h: 82 };
const ResumenTab: React.FC<{ frame: number }> = ({ frame }) => {
  const f0 = ESC.resumen[0];
  const panel = { background: OSC.panel, borderRadius: 12, position: "absolute" as const };
  const boton = (t: string, sel = false) => (
    <div key={t} style={{ height: 30, padding: "0 14px", borderRadius: 6, border: `1px solid ${sel ? "#2563eb" : "#3a4a66"}`, background: sel ? "#2563eb" : "transparent", color: OSC.texto, fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center" }}>{t}</div>
  );
  return (
    <div style={{ position: "absolute", left: SIDE, top: HEADER, right: 0, bottom: 0, background: OSC.fondo, color: OSC.texto }}>
      <div style={{ ...panel, left: 16, top: 14, width: 1102, height: 180, padding: "14px 18px", boxSizing: "border-box", opacity: aparece(frame, f0 + 2) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11 }}>
          {boton("Mes actual")}
          {boton("Este año", true)}
          {boton("Todo")}
          <span style={{ marginLeft: 10, color: OSC.texto2 }}>Desde</span>
          <div style={{ height: 30, padding: "0 12px", borderRadius: 6, background: "#1a2438", display: "flex", alignItems: "center" }}>01/01/2026</div>
          <span style={{ color: OSC.texto2 }}>Hasta</span>
          <div style={{ height: 30, padding: "0 12px", borderRadius: 6, background: "#1a2438", display: "flex", alignItems: "center" }}>31/10/2026</div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          {FILTROS.map((f) => (
            <div key={f} style={{ height: 30, padding: "0 10px", borderRadius: 6, background: "#1a2438", border: `1px solid ${OSC.linea}`, fontSize: 10, display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
              {f} <span style={{ fontSize: 8 }}>▾</span>
            </div>
          ))}
        </div>
        <div style={{ position: "absolute", right: 18, top: 92, display: "flex", gap: 8 }}>
          <div style={{ height: 30, padding: "0 16px", borderRadius: 6, background: "#16a34a", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center" }}>Aplicar</div>
          <div style={{ height: 30, padding: "0 14px", borderRadius: 6, border: "1px solid #3a4a66", fontSize: 11, display: "flex", alignItems: "center" }}>Resetear</div>
        </div>
        <div style={{ position: "absolute", left: 18, right: 18, bottom: 14, paddingTop: 10, borderTop: `1px solid ${OSC.linea}`, display: "flex", alignItems: "center", gap: 6, fontSize: 10 }}>
          <span style={{ color: OSC.texto2, marginRight: 4 }}>ESTADO:</span>
          {ESTADOS_CARTERA.map((e) => (
            <span key={e} style={{ padding: "4px 11px", borderRadius: 12, background: "#1d3557", border: "1px solid #2f4f7a", fontWeight: 600 }}>{e}</span>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", left: KPI_CARTERA.x, top: KPI_CARTERA.y, width: KPI_CARTERA.w, display: "flex", gap: 12 }}>
        {kpisCartera(frame).map((k, i) => (
          <div key={k.k} style={{ flex: 1, height: KPI_CARTERA.h, background: OSC.panel, borderRadius: 10, borderTop: `2px solid ${k.c}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, opacity: aparece(frame, f0 + 6 + i * 3) }}>
            <div style={{ fontSize: 10, letterSpacing: 0.6, color: "#c9d0da" }}>{k.k}</div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{k.v}</div>
          </div>
        ))}
      </div>
      <div style={{ ...panel, left: 16, top: 306, width: 1102, height: 300, padding: "14px 18px", boxSizing: "border-box" }}>
        <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700 }}>ALTAS POR MES</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 16, fontSize: 10, color: OSC.texto2, marginTop: 6 }}>
          <span><span style={{ display: "inline-block", width: 12, height: 9, background: "#3c5272", border: "1px solid #5b7aa3", marginRight: 5 }} />Operaciones</span>
          <span><span style={{ display: "inline-block", width: 12, height: 9, border: `2px solid ${OSC.verde}`, marginRight: 5 }} />Capital</span>
        </div>
        <div style={{ marginTop: 6 }}>
          <GraficoAltas frame={frame} w={1066} h={232} />
        </div>
      </div>
      <div style={{ ...panel, left: 16, top: 622, width: 545, height: 160, padding: "12px 18px", boxSizing: "border-box" }}>
        <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700 }}>ESTADO DE MORA</div>
        <div style={{ marginTop: 10 }}>
          <Barras frame={frame} desde={f0 + 40} datos={[8200, 3300, 2700, 1200, 1100, 1900]} max={10000} w={510} h={100} color="#5b84b8" />
        </div>
      </div>
      <div style={{ ...panel, left: 573, top: 622, width: 545, height: 160, padding: "12px 18px", boxSizing: "border-box" }}>
        <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700 }}>DISTRIBUCIÓN POR CUOTAS</div>
        <div style={{ marginTop: 10 }}>
          <Barras frame={frame} desde={f0 + 44} datos={[900, 2100, 4600, 3100, 2900, 1500, 700, 400]} max={6000} w={510} h={100} color="#8b7bc9" />
        </div>
      </div>
    </div>
  );
};

const KPIS_DIARIO: [string, string, string, string][] = [
  ["52", "ALTAS", "$6,4 M", "#5b84b8"],
  ["431", "PAGOS", "$13,86 M", "#4f9c7a"],
  ["2", "CANC. ANTICIPADA", "$27.140", "#4f9c7a"],
  ["4", "CANC. P/ REFI-CONSOL.", "$1,62 M", "#4f9c7a"],
  ["0", "ANULACIONES", "$0", "#c98a4b"],
  ["37", "CONDONACIONES", "$0,94 M", "#c98a4b"],
  ["1", "REVERSAS", "$48.300", "#b85b5b"],
  ["46", "BONIFICACIONES", "$412.870", "#8b7bc9"],
];
const CANALES: [string, number, number][] = [
  ["Sucursal Centro", 88, 20.1],
  ["Transferencia", 79, 18.0],
  ["Sucursal Norte", 61, 13.9],
  ["Débito automático", 58, 13.2],
  ["Sucursal Sur", 54, 12.3],
  ["Billetera virtual", 49, 11.2],
  ["Sucursal Oeste", 31, 7.1],
  ["Corresponsal", 18, 4.1],
];
const KPI_DIARIO = { x: 20, y: 112, w: 1094, h: 118 };
const cuenta = (frame: number, desde: number, txt: string) => {
  // Counts the first number in the text up from zero.
  const m = txt.match(/[\d.,]+/);
  if (!m) {
    return txt;
  }
  const crudo = m[0];
  const decimales = crudo.includes(",") ? crudo.split(",")[1].length : 0;
  const n = parseFloat(crudo.replace(/\./g, "").replace(",", "."));
  const t = sube(frame, desde, 34);
  const v = (n * t).toLocaleString("es-AR", { minimumFractionDigits: decimales, maximumFractionDigits: decimales });
  return txt.replace(crudo, v);
};
const DiarioTab: React.FC<{ frame: number }> = ({ frame }) => {
  const f0 = ESC.diario[0];
  const panel = { background: OSC.panel, borderRadius: 12, position: "absolute" as const, border: `1px solid ${OSC.linea}` };
  const stat = (v: string, k: string, i: number) => (
    <div key={k}>
      <div style={{ fontSize: 16, fontWeight: 700 }}>{cuenta(frame, f0 + 30 + i * 3, v)}</div>
      <div style={{ fontSize: 9.5, color: OSC.texto2, letterSpacing: 0.4, marginTop: 2 }}>{k}</div>
    </div>
  );
  return (
    <div style={{ position: "absolute", left: SIDE, top: HEADER, right: 0, bottom: 0, background: OSC.fondo, color: OSC.texto }}>
      <div style={{ ...panel, left: 20, top: 16, width: 1094, height: 80, borderLeft: "4px solid #3b82f6", display: "flex", alignItems: "center", padding: "0 20px", boxSizing: "border-box" }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Reporte Diario</div>
          <div style={{ fontSize: 11, color: OSC.texto2, marginTop: 4 }}>Reporte del 31/10/2026</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, fontSize: 10.5, color: OSC.texto2 }}>
          {[["Fecha", "31/10/2026"], ["Cartera", "Todas"], ["Sucursal", "Todas"], ["Titular Cartera", "Todos"]].map(([k, v]) => (
            <span key={k} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {k}
              <span style={{ height: 30, padding: "0 12px", borderRadius: 6, background: "#1a2438", border: `1px solid ${OSC.linea}`, color: OSC.texto, display: "flex", alignItems: "center", gap: 10 }}>
                {v} <span style={{ fontSize: 8 }}>▾</span>
              </span>
            </span>
          ))}
          <span style={{ height: 30, padding: "0 16px", borderRadius: 6, background: "#2563eb", color: "white", fontWeight: 700, display: "flex", alignItems: "center" }}>Generar</span>
        </div>
      </div>
      <div style={{ position: "absolute", left: KPI_DIARIO.x, top: KPI_DIARIO.y, width: KPI_DIARIO.w, display: "flex", gap: 10 }}>
        {KPIS_DIARIO.map(([n, k, m, c], i) => (
          <div key={k} style={{ flex: 1, height: KPI_DIARIO.h, background: OSC.panel, borderRadius: 10, borderTop: `2px solid ${c}`, padding: "12px 12px", boxSizing: "border-box", opacity: aparece(frame, f0 + 6 + i * 3) }}>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{cuenta(frame, f0 + 10 + i * 3, n)}</div>
            <div style={{ fontSize: 8.5, color: "#c9d0da", letterSpacing: 0.6, marginTop: 6, lineHeight: 1.3, minHeight: 22 }}>{k}</div>
            <div style={{ fontSize: 13, color: "#c9d0da", marginTop: 6 }}>{cuenta(frame, f0 + 14 + i * 3, m)}</div>
          </div>
        ))}
      </div>
      <div style={{ ...panel, left: 20, top: 246, width: 540, height: 500, padding: "16px 18px", boxSizing: "border-box" }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.5 }}>ALTAS DEL DÍA</div>
        <div style={{ display: "flex", gap: 26, marginTop: 14, paddingBottom: 12, borderBottom: `1px solid ${OSC.linea}` }}>
          {stat("52", "OPERACIONES", 0)}
          {stat("$6,4 M", "CAPITAL TOTAL", 1)}
          {stat("241,8%", "TNA PROMEDIO", 2)}
          {stat("4,8 ctas", "PLAZO PROM.", 3)}
          {stat("$123.077", "TICKET PROM.", 4)}
        </div>
        <div style={{ display: "flex", marginTop: 14 }}>
          <div style={{ width: 240 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.4 }}>POR LÍNEA DE CRÉDITO</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14 }}>
              <Dona frame={frame} desde={f0 + 40} partes={[[0.72, "#5f9e86"], [0.11, "#4f7cac"], [0.17, "#8b7bc9"]]} s={110} grosor={26} />
              <div style={{ fontSize: 9, color: OSC.texto2, display: "flex", flexDirection: "column", gap: 6 }}>
                {[["Cuota fija", "#5f9e86", "72%"], ["Pago adelantado", "#4f7cac", "11%"], ["Refinanciación", "#8b7bc9", "17%"]].map(([n, c, p]) => (
                  <span key={n} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ width: 9, height: 9, background: c }} />
                    {n} {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div style={{ flex: 1, marginLeft: 16 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.4 }}>POR SEGMENTO DE CLIENTE</div>
            {([["primario", 5, 9.6], ["renovación", 40, 76.9], ["refinanciación", 7, 13.5]] as [string, number, number][]).map(([n, v, p], i) => (
              <div key={n} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, fontSize: 10.5 }}>
                <span style={{ width: 86 }}>{n}</span>
                <div style={{ flex: 1, height: 12, borderRadius: 3, background: "#1d2a40" }}>
                  <div style={{ width: `${p * sube(frame, f0 + 44 + i * 4)}%`, height: "100%", borderRadius: 3, background: "#4f7cac" }} />
                </div>
                <span style={{ width: 62, textAlign: "right", color: OSC.texto2 }}>
                  {v} {p.toFixed(1).replace(".", ",")}%
                </span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", marginTop: 34 }}>
          <div style={{ width: 240 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.4 }}>POR CARTERA</div>
            {([["propia", 46, 88.5], ["administrada", 6, 11.5]] as [string, number, number][]).map(([n, v, p], i) => (
              <div key={n} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, fontSize: 10.5 }}>
                <span style={{ width: 76 }}>{n}</span>
                <div style={{ flex: 1, height: 12, borderRadius: 3, background: "#1d2a40" }}>
                  <div style={{ width: `${p * sube(frame, f0 + 50 + i * 4)}%`, height: "100%", borderRadius: 3, background: "#4f7cac" }} />
                </div>
                <span style={{ width: 62, textAlign: "right", color: OSC.texto2 }}>
                  {v} {p.toFixed(1).replace(".", ",")}%
                </span>
              </div>
            ))}
          </div>
          <div style={{ flex: 1, marginLeft: 16 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.4 }}>POR PROVINCIA</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 18, height: 90, marginTop: 12, paddingLeft: 10 }}>
              {([["Norte", 19], ["Centro", 17], ["Sur", 11], ["Sin datos", 5]] as [string, number][]).map(([n, v], i) => (
                <div key={n} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 34, height: (v / 22) * 70 * sube(frame, f0 + 54 + i * 4), background: "#4f7cac", borderRadius: "2px 2px 0 0" }} />
                  <span style={{ fontSize: 9, color: OSC.texto2 }}>{n}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div style={{ ...panel, left: 574, top: 246, width: 540, height: 500, padding: "16px 18px", boxSizing: "border-box" }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.5 }}>
          COBRANZA <span style={{ fontSize: 9, color: OSC.texto2, fontWeight: 500 }}>(Pagos y Canc. Anticipadas)</span>
        </div>
        <div style={{ display: "flex", gap: 26, marginTop: 14, paddingBottom: 12, borderBottom: `1px solid ${OSC.linea}` }}>
          {stat("438", "COBROS", 5)}
          {stat("$15,92 M", "TOTAL COBRADO", 6)}
          {stat("433", "SIN REFI/CONSOL.", 7)}
          {stat("$14,06 M", "COBRADO NETO", 8)}
        </div>
        <div style={{ display: "flex", marginTop: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.4 }}>POR CANAL</div>
            {CANALES.map(([n, v, p], i) => (
              <div key={n} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 13, fontSize: 10 }}>
                <span style={{ width: 104 }}>{n}</span>
                <div style={{ flex: 1, height: 11, borderRadius: 3, background: "#1d2a40" }}>
                  <div style={{ width: `${(p / 22) * 100 * sube(frame, f0 + 40 + i * 3)}%`, height: "100%", borderRadius: 3, background: "#4f7cac" }} />
                </div>
                <span style={{ width: 60, textAlign: "right", color: OSC.texto2 }}>
                  {v} {p.toFixed(1).replace(".", ",")}%
                </span>
              </div>
            ))}
          </div>
          <div style={{ width: 170, marginLeft: 16 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.4 }}>DESGLOSE</div>
            <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
              <Dona frame={frame} desde={f0 + 46} partes={[[0.45, "#4f7cac"], [0.43, "#5f9e86"], [0.08, "#8b7bc9"], [0.03, "#c9a45b"], [0.01, "#b85b5b"]]} s={120} grosor={28} />
            </div>
            <div style={{ fontSize: 9, color: OSC.texto2, display: "flex", flexDirection: "column", gap: 6, marginTop: 14, paddingLeft: 20 }}>
              {[["Capital 45%", "#4f7cac"], ["Interés 43%", "#5f9e86"], ["IVA Int. 8%", "#8b7bc9"], ["Comp. 3%", "#c9a45b"], ["Punit. 1%", "#b85b5b"]].map(([n, c]) => (
                <span key={n} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 9, height: 9, background: c }} />
                  {n}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- Tablet page ----------
const DEDO_TAB: [number, number, number][] = [
  [0, 700, 700],
  [TAP_CONSULTAR - 2, SIDE + 64 + 21, HEADER + 122 + 21],
  [TAP_COBRANZA - 2, SIDE + MODAL_D.x + 157 + 42, HEADER + MODAL_D.y + 240 + 13],
  [TAP_CONFIRMAR_COB - 2, SIDE + MODAL_D.x + 363 + 360 - 22 - 44, HEADER + MODAL_D.y + 230 + 236 - 16 - 15],
  [TAP_MENU - 2, SIDE / 2, HEADER + 24 + SIDE_ESPECIALES * 40 + 9],
  [TAP_INPUT - 2, SIDE + 317 + 28 + 150, HEADER + 36 + 22 + 30 + 19],
  [TAP_BUSCAR - 2, SIDE + 317 + 28 + 334 + 52, HEADER + 36 + 22 + 30 + 19],
  ...TAP_CHECK.map((f, i): [number, number, number] => [f - 2, SIDE + TABLA_C.x + 26, HEADER + TABLA_C.y + TABLA_C.cab + TABLA_C.fila * i + 21]),
  [TAP_CONTINUAR - 2, SIDE + TABLA_C.x + TABLA_C.w - 24 - 52, HEADER + TABLA_C.y + TABLA_C.cab + TABLA_C.fila * 8 + 27],
  [TAP_PROCESAR - 2, SIDE + MODAL_C.x + MODAL_C.w - 24 - 82, HEADER + MODAL_C.y + MODAL_C.h - 43],
  [TAP_PROCESAR + 40, 760, 760],
  [TAP_INICIO - 2, SIDE / 2, HEADER + 24 + 9],
  [TAP_MOD_CONTA - 2, SIDE + 64 + 262 + 21, HEADER + 122 + 300 + 21],
  [TAP_ESTADOS - 2, SIDE + MODAL_K.x + 56 + 600 + 20, HEADER + MODAL_K.y + 98 + 170 + 20],
  [TAP_GENERAR - 2, SIDE + 895, HEADER + 30 + 17],
  [TAP_REPORTES - 2, 139, 25],
  [TAP_DIARIO - 2, 179, 25],
  [TAP_DIARIO + 40, 700, 600],
];

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

const Dedo: React.FC<{ frame: number; camino: [number, number, number][]; taps: number[] }> = ({ frame, camino, taps }) => {
  const dedo = posDedo(frame, camino);
  const tap = taps.find((f) => frame >= f && frame < f + 16);
  const onda = tap === undefined ? 0 : (frame - tap) / 16;
  const presion = tap === undefined ? 0 : interpolate(frame - tap, [0, 3, 8], [0, 1, 0], clamp);
  const vis =
    interpolate(frame, [50, 64], [0, 1], clamp) *
    (1 - interpolate(frame, [TAP_PROCESAR + 26, TAP_PROCESAR + 40, TAP_INICIO - 30, TAP_INICIO - 16], [0, 1, 1, 0], clamp)) *
    interpolate(frame, [TAP_DIARIO + 30, TAP_DIARIO + 44], [1, 0], clamp);
  return (
    <>
      {tap !== undefined ? (
        <div style={{ position: "absolute", left: dedo.x, top: dedo.y, width: 18 + onda * 52, height: 18 + onda * 52, transform: "translate(-50%, -50%)", borderRadius: "50%", border: `3px solid rgba(255,140,66,${1 - onda})`, background: `rgba(255,140,66,${(1 - onda) * 0.2})`, zIndex: 8 }} />
      ) : null}
      <div style={{ position: "absolute", left: dedo.x, top: dedo.y, width: 34, height: 34, transform: `translate(-50%, -50%) scale(${1 - presion * 0.2})`, borderRadius: "50%", background: "rgba(255,255,255,0.55)", border: "2px solid rgba(40,48,64,0.35)", boxShadow: "0 4px 10px rgba(0,0,0,0.2)", opacity: vis * 0.9, zIndex: 9 }} />
    </>
  );
};

const actualDe = (frame: number) => (Object.keys(ESC) as Escena[]).filter((e) => frame >= ESC[e][0]).pop() ?? "home";
const visEscena = (frame: number, e: Escena) => {
  const [a, b] = ESC[e];
  return interpolate(frame, [a, a + 6, b - 6, b], [0, 1, 1, 0], clamp);
};

const PaginaTab: React.FC<{ frame: number }> = ({ frame }) => {
  const escenas: [Escena, React.FC<{ frame: number }>][] = [
    ["home", HomeTab],
    ["detalle", DetalleTab],
    ["consolidacion", ConsolidacionTab],
    ["conta", ContaTab],
    ["estados", EstadosTab],
    ["resumen", ResumenTab],
    ["diario", DiarioTab],
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
        {[I.grafico, I.calendario].map((d, i) => (
          <div key={d} style={{ marginLeft: 14, width: 26, height: 26, borderRadius: "50%", background: (i === 0 ? actual === "resumen" : actual === "diario") ? "#2f5d8f" : "#5d6068", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 - pulsado(frame, i === 0 ? TAP_REPORTES : TAP_DIARIO) * 0.2})` }}>
            <Icono d={d} s={14} c="#a9c7ec" w={2.2} />
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginRight: 24 }}>
          <Icono d={I.robot} s={20} c="white" w={2} />
          <div style={{ width: 22, height: 22, borderRadius: "50%", border: "1.8px solid white", color: "white", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>?</div>
          <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#d6d9de" }} />
          <div style={{ fontSize: 11, fontWeight: 700, color: "white", marginLeft: -6 }}>Delfina Martinez - DMARTINEZ</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, top: HEADER, width: SIDE, bottom: 0, background: SIDE_BG, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 24, gap: 22, zIndex: 5 }}>
        {SIDE_ICONOS.map((d, i) => (
          <div key={i} style={{ transform: `scale(${i === SIDE_ESPECIALES ? 1 - pulsado(frame, TAP_MENU) * 0.2 : i === 0 ? 1 - pulsado(frame, TAP_INICIO) * 0.2 : 1})` }}>
            <Icono d={d} s={18} c={i === SIDE_ACTIVO[actual] ? "#FF8C42" : "#e5e7eb"} />
          </div>
        ))}
      </div>
      <Toast frame={frame} desde={COBRADA + 2} hasta={296} titulo="Cobranza registrada" sub={`Cuota 2 · ${pesos(CUOTA)} · Efectivo`} />
      <ReciboEnviado frame={frame} />
      <Toast frame={frame} desde={PROCESADA + 10} hasta={630} titulo="Consolidación procesada" sub={`Nueva operación ${NUEVA_OP} · ${pesos(TOTAL)} · 18 cuotas`} />
      <Dedo frame={frame} camino={DEDO_TAB} taps={TAPS_TAB} />
    </div>
  );
};

// ---------- Phone: screens ----------
const Contenido: React.FC<{ fondo?: string; children: React.ReactNode }> = ({ fondo = "#f1f3f6", children }) => (
  <div style={{ position: "absolute", left: 0, top: M_HEADER, width: MW, height: MH - M_HEADER - M_TABS, background: fondo, overflow: "hidden" }}>{children}</div>
);

const HomeMovil: React.FC<{ frame: number }> = ({ frame }) => (
  <Contenido fondo="white">
    <div style={{ position: "absolute", left: 14, top: 14, fontSize: 19, fontWeight: 500, color: TINTA, borderLeft: `3px solid ${TINTA}`, paddingLeft: 9 }}>Core de Préstamos</div>
    <div style={{ position: "absolute", left: 12, right: 12, top: 50, height: 104, border: `1px solid ${BORDE}`, borderRadius: 12, boxShadow: "0 2px 10px rgba(20,30,50,0.06)", display: "grid", gridTemplateColumns: "1fr 1fr", padding: "8px 6px", boxSizing: "border-box" }}>
      {INDICADORES(frame).map((it, k) => (
        <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 10px" }}>
          <Icono d={it.i} s={20} c={NAVY} w={2.2} />
          <div>
            <div style={{ fontSize: 9.5, color: TINTA_2 }}>
              {it.k}
              {k === 0 ? " · Hoy" : ""}
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: NAVY }}>{it.v}</div>
          </div>
        </div>
      ))}
    </div>
    {MODULOS.slice(0, 12).map((m, k) => {
      const c = k % 2;
      const r = Math.floor(k / 2);
      const t = aparece(frame, 6 + k * 3, 12);
      const press = k === 0 ? pulsado(frame, TAP_CONSULTAR) : k === 9 ? pulsado(frame, TAP_MOD_CONTA) : 0;
      return (
        <div key={m.t} style={{ position: "absolute", left: 12 + c * 185, top: 166 + r * 84, width: 177, height: 76, border: `1px solid ${BORDE}`, borderRadius: 10, background: "white", padding: "10px 10px", boxSizing: "border-box", display: "flex", gap: 9, opacity: t, transform: `translateY(${(1 - t) * 10}px) scale(${1 - press * 0.05})` }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: AZUL, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icono d={m.i} s={17} />
          </div>
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: TINTA, lineHeight: 1.2 }}>{m.t}</div>
            <div style={{ fontSize: 8.5, color: AZUL_TXT, marginTop: 4, lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{m.d}</div>
          </div>
        </div>
      );
    })}
  </Contenido>
);

const M_PLAN_Y = 290;
const DetalleMovil: React.FC<{ frame: number }> = ({ frame }) => {
  const f0 = ESC.detalle[0];
  const brillo = interpolate(frame, [COBRADA, COBRADA + 8, COBRADA + 70], [0, 1, 0], clamp);
  const datos: [string, React.ReactNode][] = [
    ["Capital", "$ 1.500.000"],
    ["Cuotas", "12"],
    ["TNA", "120%"],
    ["Tipo", <Chip key="t" t="RENOVACIÓN" bg="#e3edf9" c={AZUL} fs={8.5} />],
    ["Estado", <Chip key="e" t="VIGENTE" bg="#e3edf9" c={AZUL} fs={8.5} />],
    ["Alta", "18/09/2026"],
  ];
  return (
    <Contenido>
      <div style={{ position: "absolute", left: 12, top: 12, display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, color: TINTA }}>
        <Icono d={I.flecha} s={16} c={TINTA} w={2.4} /> Préstamo 2026091800003
      </div>
      <div style={{ position: "absolute", left: 12, right: 12, top: 42, height: 150, background: "white", borderRadius: 12, padding: "12px 14px", boxSizing: "border-box", opacity: aparece(frame, f0 + 6) }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: TINTA }}>JAVIER PEREZ</div>
        <div style={{ fontSize: 10, color: TINTA_2, marginTop: 2 }}>DNI 2845678 · Comercio Centro · Suc. 01</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", rowGap: 12, marginTop: 12 }}>
          {datos.map(([k, v]) => (
            <div key={k}>
              <div style={{ fontSize: 8.5, color: TINTA_2, letterSpacing: 0.4 }}>{k.toUpperCase()}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: TINTA, marginTop: 4 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", left: 14, top: 202, fontSize: 9, fontWeight: 700, color: AZUL_TXT, letterSpacing: 0.6 }}>ACCESOS RÁPIDOS</div>
      <div style={{ position: "absolute", left: 12, top: 218, display: "flex", gap: 6, width: 600 }}>
        {BOTONES.slice(0, 5).map((b, k) => (
          <div key={b} style={{ height: 30, padding: "0 12px", borderRadius: 6, background: AZUL, color: "white", fontSize: 9.5, fontWeight: 700, display: "flex", alignItems: "center", whiteSpace: "nowrap", transform: `scale(${k === 0 ? 1 - pulsado(frame, TAP_COBRANZA) * 0.08 : 1})` }}>
            {b}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 14, top: 262, fontSize: 14, fontWeight: 700, color: TINTA }}>Plan de Pagos</div>
      <div style={{ position: "absolute", left: 12, right: 12, top: M_PLAN_Y, background: "white", borderRadius: 12, overflow: "hidden" }}>
        {PLAN.slice(0, 9).map((p, i) => {
          const pago = estadoCuota(p.n, frame) === "PAGO";
          return (
            <div key={p.n} style={{ height: 44, display: "flex", alignItems: "center", padding: "0 12px", borderTop: i ? "1px solid #eef0f3" : "none", opacity: aparece(frame, f0 + 14 + i * 3), background: p.n === 2 ? `rgba(30,107,58,${brillo * 0.12})` : "white" }}>
              <div style={{ width: 26, height: 26, borderRadius: 13, background: "#eef2f7", fontSize: 11, fontWeight: 800, color: NAVY, display: "flex", alignItems: "center", justifyContent: "center" }}>{p.n}</div>
              <div style={{ marginLeft: 10 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: TINTA }}>{pesos(CUOTA)}</div>
                <div style={{ fontSize: 9, color: TINTA_2, marginTop: 1 }}>Vence {p.venc}</div>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <Badge pago={pago} fs={8.5} />
              </div>
            </div>
          );
        })}
      </div>
    </Contenido>
  );
};

const M_LISTA_Y = 186;
const M_FILA = 52;
const ConsolidacionMovil: React.FC<{ frame: number }> = ({ frame }) => {
  const res = aparece(frame, RESULTADOS, 10);
  const n = marcados(frame);
  const fin = procesada(frame);
  const nueva = spring({ frame: frame - PROCESADA - 4, fps: 30, config: { damping: 16 } });
  const brillo = interpolate(frame, [PROCESADA + 4, PROCESADA + 14, PROCESADA + 90], [0, 1, 0.35], clamp);
  return (
    <Contenido>
      <div style={{ position: "absolute", left: 12, right: 12, top: 12, height: 94, background: "white", borderRadius: 12, padding: "14px 14px", boxSizing: "border-box" }}>
        <BusquedaDni frame={frame} chico />
      </div>
      <div style={{ opacity: res, transform: `translateY(${(1 - res) * 10}px)` }}>
        <div style={{ position: "absolute", left: 12, right: 12, top: 116, height: 40, background: "white", borderRadius: 10, display: "flex", alignItems: "center", padding: "0 12px", fontSize: 11, color: TINTA }}>
          <Icono d={I.persona} s={14} c={NAVY} w={2.4} />
          <b style={{ marginLeft: 6 }}>JAVIER PEREZ</b>
          <span style={{ marginLeft: 8, color: TINTA_2 }}>DNI 2845678</span>
          <span style={{ marginLeft: "auto", color: TINTA_2, fontSize: 10 }}>8 elegibles</span>
        </div>
        <div style={{ position: "absolute", left: 14, top: 164, fontSize: 11, color: TINTA }}>Seleccioná los préstamos a consolidar (mín. 2)</div>
        <div style={{ position: "absolute", left: 12, right: 12, top: M_LISTA_Y, background: "white", borderRadius: 12, overflow: "hidden" }}>
          {fin > 0.01 ? (
            <div style={{ height: M_FILA * Math.min(1, nueva), overflow: "hidden" }}>
              <div style={{ height: M_FILA, display: "flex", alignItems: "center", padding: "0 12px", background: `rgba(30,107,58,${0.06 + brillo * 0.12})` }}>
                <div style={{ width: 16 }} />
                <div style={{ marginLeft: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: TINTA }}>{NUEVA_OP}</div>
                  <div style={{ fontSize: 9.5, color: TINTA_2, marginTop: 2 }}>{pesos(TOTAL)} · 18 cuotas</div>
                </div>
                <div style={{ marginLeft: "auto" }}>
                  <EstadoPrestamo cancelada={0} nueva fs={8.5} />
                </div>
              </div>
            </div>
          ) : null}
          {PRESTAMOS.map((p, i) => {
            const t = aparece(frame, RESULTADOS + 4 + i * 3, 10);
            const sel = i < 5 ? interpolate(frame, [TAP_CHECK[i] + 1, TAP_CHECK[i] + 6], [0, 1], clamp) : 0;
            const cancelada = i < 5 ? fin : 0;
            return (
              <div key={p.cod} style={{ height: M_FILA, display: "flex", alignItems: "center", padding: "0 12px", borderTop: "1px solid #eef0f3", opacity: t, background: sel > 0.5 && cancelada < 0.5 ? "#f2f6fc" : "white" }}>
                <Check t={sel * (1 - cancelada)} />
                <div style={{ marginLeft: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: cancelada > 0.5 ? TINTA_2 : TINTA, textDecoration: cancelada > 0.5 ? "line-through" : "none" }}>{p.cod}</div>
                  <div style={{ fontSize: 9.5, color: TINTA_2, marginTop: 2 }}>
                    {pesos(p.capital)} · {p.plazo} cuotas
                  </div>
                </div>
                <div style={{ marginLeft: "auto", textAlign: "right" }}>
                  {cancelada > 0.5 ? (
                    <EstadoPrestamo cancelada={1} fs={8.5} />
                  ) : (
                    <>
                      <div style={{ fontSize: 8.5, color: TINTA_2 }}>Saldo cancel.</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: sel > 0.5 ? AZUL : "#c0c6d0", marginTop: 2 }}>{sel > 0.5 && p.saldo ? pesos(p.saldo) : "—"}</div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ position: "absolute", left: 12, right: 12, top: 610, height: 70, background: "white", borderRadius: 12, boxShadow: "0 -4px 16px rgba(20,30,50,0.08)", display: "flex", alignItems: "center", padding: "0 14px", opacity: 1 - fin, transform: `translateY(${fin * 30}px)` }}>
          <div>
            <div style={{ fontSize: 10, color: TINTA_2 }}>Seleccionados: {n}</div>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: AZUL, marginTop: 3 }}>{pesos(totalMarcado(frame))}</div>
          </div>
          <div style={{ marginLeft: "auto", height: 38, padding: "0 16px", borderRadius: 8, background: NAVY, color: "white", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", opacity: n >= 2 ? 1 : 0.45, transform: `scale(${1 - pulsado(frame, TAP_CONTINUAR) * 0.06})` }}>Continuar →</div>
        </div>
      </div>
    </Contenido>
  );
};

// ---------- Phone: accounting, statements and reports ----------
const M_HOJA_CONTA = 360;
const HojaConta: React.FC<{ frame: number }> = ({ frame }) => {
  const v = modalConta(frame);
  if (v <= 0.001) {
    return null;
  }
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", inset: 0, background: `rgba(10,14,22,${0.45 * v})` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: M_HOJA_CONTA, bottom: 0, background: "white", borderRadius: "18px 18px 0 0", transform: `translateY(${(1 - v) * (MH - M_HOJA_CONTA)}px)` }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: "#d6dae1", margin: "12px auto 0" }} />
        <div style={{ position: "absolute", left: 18, top: 28, fontSize: 17, fontWeight: 600, color: TINTA }}>Contabilidad</div>
        <div style={{ position: "absolute", right: 18, top: 30 }}>
          <Icono d={I.cruz} s={16} c={TINTA_2} w={2.2} />
        </div>
        {SUBMODULOS.map((m, k) => (
          <div key={m.t} style={{ position: "absolute", left: 12, right: 12, top: 70 + k * 66, height: 60, display: "flex", alignItems: "center", gap: 12, padding: "0 8px", borderRadius: 10, background: k === 5 ? `rgba(47,93,143,${pulsado(frame, TAP_ESTADOS) * 0.1})` : "white", opacity: aparece(frame, MODAL_CONTA + 6 + k * 3, 10) }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: AZUL, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icono d={m.i} s={18} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: TINTA }}>{m.t}</div>
              <div style={{ fontSize: 9.5, color: TINTA_2, marginTop: 3, lineHeight: 1.35 }}>{m.d}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const M_EF = { y: 146, fila: 30 };
const EstadosMovil: React.FC<{ frame: number }> = ({ frame }) => {
  const t = generado(frame);
  const res = interpolate(frame, [TAP_RESULTADOS + 2, TAP_RESULTADOS + 10], [0, 1], clamp);
  const lista = (lineas: Linea[], o: number) => (
    <div style={{ position: "absolute", left: 12, right: 12, top: M_EF.y, background: "white", borderRadius: 12, padding: "10px 4px", opacity: o }}>
      {lineas.map((l, k) => (
        <div key={l.t} style={{ opacity: aparece(frame, ESC.estados[0] + 8 + k * 2, 8) }}>
          <LineaEF l={l} t={t} fs={10.5} h={M_EF.fila} />
        </div>
      ))}
    </div>
  );
  return (
    <Contenido>
      <div style={{ position: "absolute", left: 14, top: 12, fontSize: 16, fontWeight: 700, color: TINTA }}>Estados Financieros</div>
      <div style={{ position: "absolute", left: 14, top: 34, fontSize: 10, fontStyle: "italic", color: TINTA_2 }}>
        Créditos · {Math.round(1284 * t).toLocaleString("es-AR")} asientos confirmados
      </div>
      <div style={{ position: "absolute", left: 12, right: 12, top: 56, display: "flex", gap: 8 }}>
        <div style={{ flex: 1, height: 34, borderRadius: 7, background: "white", border: `1px solid ${BORDE}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px", fontSize: 12, color: TINTA }}>
          Octubre 2026 <span style={{ fontSize: 9 }}>▾</span>
        </div>
        <div style={{ height: 34, padding: "0 16px", borderRadius: 7, background: "#2563eb", color: "white", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", transform: `scale(${1 - pulsado(frame, TAP_GENERAR) * 0.07})` }}>Generar</div>
      </div>
      <div style={{ position: "absolute", left: 12, right: 12, top: 102, height: 34, borderRadius: 8, background: "#e4e7ec", display: "flex", padding: 3, boxSizing: "border-box" }}>
        {["Patrimonial", "Resultados"].map((s, i) => {
          const sel = i === 0 ? 1 - res : res;
          return (
            <div key={s} style={{ flex: 1, borderRadius: 6, background: `rgba(255,255,255,${sel})`, boxShadow: sel > 0.5 ? "0 1px 3px rgba(0,0,0,0.12)" : "none", fontSize: 11.5, fontWeight: 700, color: sel > 0.5 ? TINTA : TINTA_2, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {s}
            </div>
          );
        })}
      </div>
      {res < 1 ? lista(PATRIMONIAL, 1 - res) : null}
      {res > 0 ? lista(RESULTADOS_EF, res) : null}
    </Contenido>
  );
};

const SegmentoReportes: React.FC<{ diario: boolean; frame: number }> = ({ diario, frame }) => (
  <div style={{ position: "absolute", left: 12, right: 12, top: 12, height: 34, borderRadius: 8, background: "#1a2438", display: "flex", padding: 3, boxSizing: "border-box" }}>
    {["Resumen de cartera", "Reporte diario"].map((s, i) => {
      const sel = (i === 1) === diario;
      return (
        <div key={s} style={{ flex: 1, borderRadius: 6, background: sel ? "#2563eb" : "transparent", fontSize: 11, fontWeight: 700, color: sel ? "white" : OSC.texto2, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${i === 1 && !diario ? 1 - pulsado(frame, TAP_DIARIO) * 0.06 : 1})` }}>
          {s}
        </div>
      );
    })}
  </div>
);

const ResumenMovil: React.FC<{ frame: number }> = ({ frame }) => {
  const f0 = ESC.resumen[0];
  return (
    <Contenido fondo={OSC.fondo}>
      <div style={{ color: OSC.texto }}>
        <SegmentoReportes diario={false} frame={frame} />
        <div style={{ position: "absolute", left: 12, right: 12, top: 56, display: "flex", gap: 6, alignItems: "center" }}>
          {["Mes actual", "Este año", "Todo"].map((b) => (
            <div key={b} style={{ fontSize: 10, fontWeight: 700, padding: "6px 10px", borderRadius: 6, border: `1px solid ${b === "Este año" ? "#2563eb" : "#3a4a66"}`, background: b === "Este año" ? "#2563eb" : "transparent" }}>
              {b}
            </div>
          ))}
          <span style={{ marginLeft: "auto", fontSize: 9.5, color: OSC.texto2 }}>01/01 – 31/10/2026</span>
        </div>
        <div style={{ position: "absolute", left: 12, right: 12, top: 96, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {kpisCartera(frame).map((k, i) => (
            <div key={k.k} style={{ height: 64, background: OSC.panel, borderRadius: 10, borderTop: `2px solid ${k.c}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, opacity: aparece(frame, f0 + 6 + i * 3) }}>
              <div style={{ fontSize: 8.5, letterSpacing: 0.5, color: "#c9d0da" }}>{k.k}</div>
              <div style={{ fontSize: 17, fontWeight: 800 }}>{k.v}</div>
            </div>
          ))}
        </div>
        <div style={{ position: "absolute", left: 12, right: 12, top: 324, height: 236, background: OSC.panel, borderRadius: 12, padding: "12px 10px", boxSizing: "border-box" }}>
          <div style={{ textAlign: "center", fontSize: 11, fontWeight: 700 }}>ALTAS POR MES</div>
          <div style={{ marginTop: 8 }}>
            <GraficoAltas frame={frame} w={346} h={194} fs={8} />
          </div>
        </div>
        <div style={{ position: "absolute", left: 12, right: 12, top: 572, height: 108, background: OSC.panel, borderRadius: 12, padding: "10px 14px", boxSizing: "border-box" }}>
          <div style={{ textAlign: "center", fontSize: 11, fontWeight: 700 }}>ESTADO DE MORA</div>
          <div style={{ marginTop: 8 }}>
            <Barras frame={frame} desde={f0 + 40} datos={[8200, 3300, 2700, 1200, 1100, 1900]} max={10000} w={338} h={62} color="#5b84b8" />
          </div>
        </div>
      </div>
    </Contenido>
  );
};

const M_KPI_D = { y: 80, w: 87, h: 80, gap: 6 };
const DiarioMovil: React.FC<{ frame: number }> = ({ frame }) => {
  const f0 = ESC.diario[0];
  return (
    <Contenido fondo={OSC.fondo}>
      <div style={{ color: OSC.texto }}>
        <SegmentoReportes diario frame={frame} />
        <div style={{ position: "absolute", left: 14, top: 56, fontSize: 11, color: OSC.texto2 }}>Reporte del 31/10/2026 · Todas las carteras</div>
        <div style={{ position: "absolute", left: 12, top: M_KPI_D.y, display: "grid", gridTemplateColumns: `repeat(4, ${M_KPI_D.w}px)`, gap: M_KPI_D.gap }}>
          {KPIS_DIARIO.map(([n, k, m, c], i) => (
            <div key={k} style={{ height: M_KPI_D.h, background: OSC.panel, borderRadius: 9, borderTop: `2px solid ${c}`, padding: "8px 8px", boxSizing: "border-box", opacity: aparece(frame, f0 + 6 + i * 3) }}>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{cuenta(frame, f0 + 10 + i * 3, n)}</div>
              <div style={{ fontSize: 6.8, color: "#c9d0da", letterSpacing: 0.3, marginTop: 3, lineHeight: 1.25, minHeight: 17 }}>{k}</div>
              <div style={{ fontSize: 10, color: "#c9d0da", marginTop: 3 }}>{cuenta(frame, f0 + 14 + i * 3, m)}</div>
            </div>
          ))}
        </div>
        <div style={{ position: "absolute", left: 12, right: 12, top: 258, height: 112, background: OSC.panel, borderRadius: 12, padding: "12px 14px", boxSizing: "border-box" }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5 }}>ALTAS DEL DÍA</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", rowGap: 10, marginTop: 10 }}>
            {[["52", "OPERACIONES"], ["$6,4 M", "CAPITAL TOTAL"], ["241,8%", "TNA PROM."], ["4,8 ctas", "PLAZO PROM."], ["$123.077", "TICKET PROM."]].map(([v, k], i) => (
              <div key={k}>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>{cuenta(frame, f0 + 30 + i * 3, v)}</div>
                <div style={{ fontSize: 8, color: OSC.texto2, marginTop: 1 }}>{k}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: "absolute", left: 12, right: 12, top: 382, height: 298, background: OSC.panel, borderRadius: 12, padding: "12px 14px", boxSizing: "border-box" }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5 }}>COBRANZA</div>
          <div style={{ display: "flex", gap: 22, marginTop: 8 }}>
            {[["438", "COBROS"], ["$15,92 M", "TOTAL COBRADO"], ["$14,06 M", "NETO"]].map(([v, k], i) => (
              <div key={k}>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>{cuenta(frame, f0 + 36 + i * 3, v)}</div>
                <div style={{ fontSize: 8, color: OSC.texto2, marginTop: 1 }}>{k}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 0.4, marginTop: 12 }}>POR CANAL</div>
          {CANALES.slice(0, 7).map(([n, v, p], i) => (
            <div key={n} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 9, fontSize: 9.5 }}>
              <span style={{ width: 98 }}>{n}</span>
              <div style={{ flex: 1, height: 9, borderRadius: 3, background: "#1d2a40" }}>
                <div style={{ width: `${(p / 22) * 100 * sube(frame, f0 + 40 + i * 3)}%`, height: "100%", borderRadius: 3, background: "#4f7cac" }} />
              </div>
              <span style={{ width: 56, textAlign: "right", color: OSC.texto2 }}>
                {v} {p.toFixed(1).replace(".", ",")}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </Contenido>
  );
};

const TABS_MOVIL: [string, string, Escena[]][] = [
  ["Inicio", I.casa, ["home", "conta", "estados"]],
  ["Préstamos", I.lupa, ["detalle"]],
  ["Operaciones", I.especiales, ["consolidacion"]],
  ["Reportes", I.gestion, ["resumen", "diario"]],
  ["Más", I.config, []],
];
const TAP_TAB: Record<number, number> = { 0: TAP_INICIO, 2: TAP_MENU, 3: TAP_REPORTES };
const tabX = (i: number) => (MW / 5) * i + MW / 10;
const DEDO_MOVIL: [number, number, number][] = [
  [0, 300, 700],
  [TAP_CONSULTAR - 2, 12 + 88, M_HEADER + 166 + 38],
  [TAP_COBRANZA - 2, 12 + 44, M_HEADER + 218 + 15],
  [TAP_CONFIRMAR_COB - 2, 195, MH - 40 - 22],
  [TAP_MENU - 2, tabX(2), MH - M_TABS / 2 - 4],
  [TAP_INPUT - 2, 140, M_HEADER + 12 + 14 + 26 + 19],
  [TAP_BUSCAR - 2, MW - 12 - 14 - 44, M_HEADER + 12 + 14 + 26 + 19],
  ...TAP_CHECK.map((f, i): [number, number, number] => [f - 2, 12 + 12 + 8, M_HEADER + M_LISTA_Y + M_FILA * i + M_FILA / 2]),
  [TAP_CONTINUAR - 2, MW - 12 - 14 - 50, M_HEADER + 610 + 35],
  [TAP_PROCESAR - 2, 250, MH - 28 - 22],
  [TAP_PROCESAR + 40, 300, 640],
  [TAP_INICIO - 2, tabX(0), MH - M_TABS / 2 - 4],
  [TAP_MOD_CONTA - 2, 12 + 185 + 88, M_HEADER + 166 + 4 * 84 + 38],
  [TAP_ESTADOS - 2, 195, M_HOJA_CONTA + 70 + 5 * 66 + 30],
  [TAP_GENERAR - 2, MW - 12 - 42, M_HEADER + 56 + 17],
  [TAP_RESULTADOS - 2, 285, M_HEADER + 102 + 17],
  [TAP_REPORTES - 2, tabX(3), MH - M_TABS / 2 - 4],
  [TAP_DIARIO - 2, 285, M_HEADER + 12 + 17],
  [TAP_DIARIO + 40, 300, 640],
];

const PaginaMovil: React.FC<{ frame: number }> = ({ frame }) => {
  const escenas: [Escena, React.FC<{ frame: number }>][] = [
    ["home", HomeMovil],
    ["detalle", DetalleMovil],
    ["consolidacion", ConsolidacionMovil],
    ["conta", HomeMovil],
    ["estados", EstadosMovil],
    ["resumen", ResumenMovil],
    ["diario", DiarioMovil],
  ];
  const actual = actualDe(frame);
  const oscuro = actual === "resumen" || actual === "diario";
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
          const sel = e.includes(actual);
          const col = sel ? "#FF8C42" : oscuro ? "#9aa3b2" : "#6b7280";
          return (
            <div key={n} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, paddingBottom: 6, transform: `scale(${i in TAP_TAB ? 1 - pulsado(frame, TAP_TAB[i]) * 0.12 : 1})` }}>
              <Icono d={d} s={19} c={col} />
              <div style={{ fontSize: 9, fontWeight: 700, color: col }}>{n}</div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", inset: 0, zIndex: 6, pointerEvents: "none" }}>
        <HojaCobranza frame={frame} chico />
        <ModalConsolidacion frame={frame} chico />
        <HojaConta frame={frame} />
      </div>
      <Toast frame={frame} desde={COBRADA + 2} hasta={296} titulo="Cobranza registrada" sub={`Cuota 2 · ${pesos(CUOTA)} · Efectivo`} chico />
      <ReciboEnviado frame={frame} chico />
      <Toast frame={frame} desde={PROCESADA + 10} hasta={630} titulo="Consolidación procesada" sub={`Nueva operación ${NUEVA_OP} · 18 cuotas`} chico />
      <Dedo frame={frame} camino={DEDO_MOVIL} taps={TAPS_CEL} />
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
  const izq = { ry: 14, rx: 6, rz: 1.5 };
  const der = { ry: -14, rx: 6, rz: -1.5 };
  // Day's indicators of the home and the consolidation list.
  const indicadores = tab ? { px: 760, py: 240 } : { px: 195, py: 280 };
  const lista = tab ? { px: 590, py: 470 } : { px: 195, py: 430 };
  // Accounting modal and the monthly chart of the portfolio summary.
  const modalConta = tab ? { px: 620, py: 420 } : { px: 195, py: 600 };
  const grafico = tab ? { px: 600, py: 500 } : { px: 195, py: 530 };
  return [
    { f: 0, z: 0.92, ...c, ry: 20, rx: 9, rz: 2.5, cy: 0.62 },
    { f: 34, z: zz, ...indicadores, ...izq, cy: 0.57 },
    { f: 62, z: zz, ...indicadores, ...izq, cy: 0.57 },
    { f: 96, z: 1, ...c, ...izq, cy: 0.62 },
    { f: 304, z: 1, ...c, ...izq, cy: 0.62 },
    { f: 338, z: 1, ...c, ...der, cy: 0.62 },
    { f: 366, z: 1, ...c, ...der, cy: 0.62 },
    { f: 400, z: zz, ...lista, ...der, cy: 0.57 },
    { f: 440, z: zz, ...lista, ...der, cy: 0.57 },
    { f: 470, z: 1, ...c, ...der, cy: 0.62 },
    { f: 668, z: 1, ...c, ...der, cy: 0.62 },
    { f: 698, z: zz, ...modalConta, ...der, cy: 0.57 },
    { f: 716, z: zz, ...modalConta, ...der, cy: 0.57 },
    { f: 752, z: 1, ...c, ...der, cy: 0.62 },
    { f: 932, z: 1, ...c, ...der, cy: 0.62 },
    { f: 966, z: zz, ...grafico, ...der, cy: 0.57 },
    { f: 1026, z: zz, ...grafico, ...der, cy: 0.57 },
    { f: 1060, z: 1, ...c, ...der, cy: 0.62 },
    { f: 1086, z: 1, ...c, ...der, cy: 0.62 },
    { f: 1120, z: 1, ...c, ...izq, cy: 0.62 },
    { f: 1200, z: 1, ...c, ...izq, cy: 0.62 },
    { f: CORELENDING_FRAMES, z: 1.05, ...c, ...izq, cy: 0.62 },
  ];
};
const TOMAS_TAB = tomasDe(true);
const TOMAS_CEL = tomasDe(false);

// Pieces that lift out of the screen and settle back: the collected
// installment and the new capital of the consolidation.
type Salto = { x: number; y: number; w: number; h: number; f: [number, number, number, number]; z: number; hueco?: string };
const SALTOS_TAB: Salto[] = [
  { x: SIDE + MODAL_D.x + TABLA_D.x - 4, y: HEADER + MODAL_D.y + TABLA_D.y + TABLA_D.cab + TABLA_D.fila - 4, w: 914, h: TABLA_D.fila + 8, f: [244, 256, 272, 286], z: 110 },
  { x: SIDE + MODAL_C.x + 24 + 2 * (188 + 12) - 2, y: HEADER + MODAL_C.y + MODAL_C.cards - 2, w: 192, h: 74, f: [490, 502, 520, 534], z: 110 },
  { x: SIDE + EF_DER.x + 14, y: HEADER + EF_DER.y + 56 + 11 * FILA_EF - 4, w: EF_DER.w - 28, h: FILA_EF + 8, f: [852, 864, 880, 894], z: 110 },
  { x: SIDE + KPI_DIARIO.x + (KPI_DIARIO.w - 70) / 8 + 10 - 4, y: HEADER + KPI_DIARIO.y - 4, w: (KPI_DIARIO.w - 70) / 8 + 8, h: KPI_DIARIO.h + 8, f: [1146, 1160, 1180, 1196], z: 110, hueco: "#060a12" },
];
const SALTOS_CEL: Salto[] = [
  { x: 8, y: M_HEADER + M_PLAN_Y + 44 - 4, w: 374, h: 52, f: [244, 256, 272, 286], z: 110 },
  { x: 14, y: 300 + 263 - 2, w: 179, h: 66, f: [490, 502, 520, 534], z: 110 },
  { x: 8, y: M_HEADER + M_EF.y + 10 + 11 * M_EF.fila - 4, w: 374, h: M_EF.fila + 8, f: [852, 864, 880, 894], z: 110 },
  { x: 12 + M_KPI_D.w + M_KPI_D.gap - 3, y: M_HEADER + M_KPI_D.y - 3, w: M_KPI_D.w + 6, h: M_KPI_D.h + 6, f: [1146, 1160, 1180, 1196], z: 110, hueco: "#060a12" },
];

const Pantalla: React.FC<{ frame: number; tab: boolean }> = ({ frame, tab }) => (tab ? <PaginaTab frame={frame} /> : <PaginaMovil frame={frame} />);

// apartaV (9:16 only, used by the ad): 0..1 per frame; the phone shrinks a bit
// and moves right to leave a free column on the left for side texts.
export const CoreLendingDinamico: React.FC<z.infer<typeof coreLendingSchema> & { apartaV?: (frame: number) => number }> = ({ fondo, paleta, apartaV }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const tab = width > height;
  const tipo = tab ? "tablet" : "celular";
  const { w, h } = pantallaDe(tipo, !tab);
  const { H: EH } = exteriorDe(tipo, w, h);
  const c = toma(frame, tab ? TOMAS_TAB : TOMAS_CEL);
  const ap = !tab && apartaV ? apartaV(frame) : 0;
  const esc = ((height * 0.64) / EH) * c.z * (1 - 0.2 * ap);
  const t = spring({ frame, fps, config: { damping: 18, stiffness: 80 } });
  // Device chrome offset (padding + border) so the overlay lines up with the screen.
  const MARCO = tab ? 27 : 17;
  const dx = -(c.px - w / 2) * esc + 190 * ap;
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
                  <div style={{ position: "absolute", left: s.x, top: s.y, width: s.w, height: s.h, borderRadius: 10, background: s.hueco ?? "#e6eaf0", opacity: Math.min(1, k * 3) }} />
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
