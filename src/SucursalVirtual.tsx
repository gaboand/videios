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

// Virtual branch (client home banking, dynamic camera, 40s), tablet in 16:9
// and phone in 9:16: Javier Perez's home with his credit line and an
// insurance offer, his loan of $ 1.400.000 with 3 installments paid, the
// payoff balance, a pre-approved renewal offer and a support claim. The
// screens share one single-column layout sized to each device.

export const sucursalSchema = z.object({
  fondo: z.enum(["ondas", "red", "aurora", "geometrico"]),
  paleta: z.enum(["azul", "gris"]),
});

export const SUCURSAL_FRAMES = 1200;

const FUENTE = "Montserrat, sans-serif";
const TINTA = "#2b2f36";
const TINTA_2 = "#6b7280";
const BORDE = "#e3e6eb";
const GRIS = "#f4f5f7";
const PRIMARIO = "#2f6a8f";
const AZUL_TXT = "#2c5f8a";
const VERDE = "#1f9d55";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ---------- Devices ----------
type Disp = { tab: boolean; PW: number; PH: number; head: number; tabs: number; x0: number; w: number };
const TAB: Disp = { tab: true, PW: 1180, PH: 820, head: 56, tabs: 60, x0: 210, w: 760 };
const CEL: Disp = { tab: false, PW: 390, PH: 844, head: 92, tabs: 64, x0: 12, w: 366 };

// ---------- Timeline ----------
const ESC = {
  home: [0, 296],
  prestamos: [292, 516],
  saldo: [512, 740],
  nuevo: [736, 960],
  reclamo: [956, SUCURSAL_FRAMES + 10],
} as const;
type Escena = keyof typeof ESC;
const SCROLL_HOME = [156, 210];
const TAP_PRESTAMOS = 280;
const TAP_CARD = 420;
const TAP_SALDO = 500;
const TAP_CALCULAR = 560;
const TAP_VOLVER = 724;
const ARRASTRE = [806, 842];
const TAP_12 = 862;
const TAP_SOLICITAR = 908;
const TAP_MAS = 946;
const TAP_MOTIVO = 988;
const TIPEO_DESC = [1004, 1052];
const TAP_ENVIAR = 1090;
const ENVIADO = 1098;
const TAPS = [TAP_PRESTAMOS, TAP_CARD, TAP_SALDO, TAP_CALCULAR, TAP_VOLVER, ARRASTRE[0], TAP_12, TAP_SOLICITAR, TAP_MAS, TAP_MOTIVO, TAP_ENVIAR];

const pesos = (n: number, dec = 2) => `$ ${n.toLocaleString("es-AR", { minimumFractionDigits: dec, maximumFractionDigits: dec })}`;
const pulsado = (frame: number, f: number) => interpolate(frame, [f, f + 4, f + 12], [0, 1, 0], clamp);
const aparece = (frame: number, desde: number, dur = 10) => interpolate(frame, [desde, desde + dur], [0, 1], clamp);
const sube = (frame: number, desde: number, dur = 30) => interpolate(frame, [desde, desde + dur], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
const tipeo = (frame: number, texto: string, [a, b]: readonly number[]) => texto.slice(0, Math.round(interpolate(frame, [a, b], [0, texto.length], clamp)));
const pres = (frame: number, f: number, k = 0.05) => `scale(${1 - pulsado(frame, f) * k})`;

const Icono: React.FC<{ d: string; s?: number; c?: string; w?: number }> = ({ d, s = 18, c = "white", w = 1.9 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24">
    <path d={d} fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const I = {
  casa: "M4 11 L12 4 L20 11 V20 H14 V14 H10 V20 H4 Z",
  mano: "M3 15 H7 L12 17 H17 C18.5 17 18.5 15 17 15 H13 M7 15 L11 12 H15 M12 3 V10 M14 4.5 C14 3.5 10 3.5 10 5 C10 6.5 14 6 14 7.5 C14 9 10 9 10 8",
  menu: "M4 7 H20 M4 12 H20 M4 17 H20",
  salir: "M10 5 H5 V19 H10 M14 8 L18 12 L14 16 M18 12 H9",
  lista: "M6 3 H18 V21 H6 Z M9 8 H15 M9 12 H15 M9 16 H13",
  peso: "M12 3 V21 M16 7 C15 5.5 13.5 5 12 5 C9.5 5 8 6.2 8 8 C8 12 16 10 16 15 C16 17 14.5 18.5 12 18.5 C10 18.5 8.5 17.8 7.5 16.5",
  doc: "M6 3 H14 L18 7 V21 H6 Z M12 10 V17 M10 12 C10 11 14 11 14 12.5 C14 14 10 13.5 10 15 C10 16.3 14 16.3 14 15.2",
  grafico: "M6 3 H14 L18 7 V21 H6 Z M9 17 L11 14 L13 15.5 L15 12",
  tramite: "M6 3 H14 L18 7 V21 H6 Z M9 12 H15 M9 16 H15",
  alerta: "M12 3 A9 9 0 1 1 12 21 A9 9 0 1 1 12 3 M12 8 V13 M12 16 V16.5",
  persona: "M9 7 A3 3 0 1 1 9 13 A3 3 0 1 1 9 7 M3 20 C4 15 14 15 15 20 M16 11 L19 14 L22 9",
  banco: "M3 9 L12 4 L21 9 Z M5 10 V17 M9.5 10 V17 M14.5 10 V17 M19 10 V17 M3 20 H21",
  triangulo: "M12 4 L21 19 H3 Z M12 10 V14 M12 16.5 V17",
  baja: "M12 3 A9 9 0 1 1 12 21 A9 9 0 1 1 12 3 M6 6 L18 18",
  escudo: "M12 3 L20 6 V11 C20 16 16.5 19.5 12 21 C7.5 19.5 4 16 4 11 V6 Z M8.5 12 L11 14.5 L15.5 9.5",
  flecha: "M15 5 L8 12 L15 19",
  izq: "M19 12 H5 M11 6 L5 12 L11 18",
  der: "M9 6 L15 12 L9 18",
  check: "M5 12.5 L10 17.5 L19 7.5",
  auricular: "M5 14 V12 A7 7 0 0 1 19 12 V14 M5 14 H8 V19 H5 Z M19 14 H16 V19 H19 Z",
  avion: "M3 11 L21 4 L15 20 L11 13 Z M11 13 L21 4",
  calendario: "M4 6 H20 V20 H4 Z M4 10 H20 M8 3 V7 M16 3 V7",
  descarga: "M12 4 V15 M7 10 L12 15 L17 10 M5 19 H19",
};

// ---------- Loan data ----------
const MONTO = 1400000;
const CUOTA = 198900;
const TASA = 1.12 / 12;
const PLAN = Array.from({ length: 12 }, (_, k) => {
  const venc = new Date(2026, 8 + k, 10);
  return { n: k + 1, venc: `10/${String(venc.getMonth() + 1).padStart(2, "0")}/${venc.getFullYear()}` };
});
const AMORTIZADO = (() => {
  let saldo = MONTO;
  let am = 0;
  for (let k = 0; k < 3; k++) {
    const cap = CUOTA - saldo * TASA;
    am += cap;
    saldo -= cap;
  }
  return Math.round(am);
})();
const PENDIENTE = MONTO - AMORTIZADO;
const INTERES_DEV = 18300;
const IVA_DEV = 3843;
const TOTAL_CANCEL = PENDIENTE + INTERES_DEV + IVA_DEV;
const AHORRO = CUOTA * 9 - TOTAL_CANCEL;
const CODIGO = "2026080500004";

// ---------- Common pieces ----------
const Contenido: React.FC<{ d: Disp; children: React.ReactNode }> = ({ d, children }) => (
  <div style={{ position: "absolute", left: 0, top: d.head, width: d.PW, height: d.PH - d.head - d.tabs, background: "white", overflow: "hidden" }}>
    <div style={{ position: "absolute", left: d.x0, top: 0, width: d.w, height: "100%" }}>{children}</div>
  </div>
);
const Volver: React.FC<{ t: string; frame: number }> = ({ t, frame }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 56, borderBottom: `1px solid ${BORDE}`, display: "flex", alignItems: "center", gap: 14 }}>
    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12.5, color: AZUL_TXT, transform: pres(frame, TAP_VOLVER, 0.1) }}>
      <Icono d={I.izq} s={14} c={AZUL_TXT} w={2.2} /> Volver
    </span>
    <span style={{ fontSize: 17, fontWeight: 700, color: TINTA }}>{t}</span>
  </div>
);
const Boton: React.FC<{ t: string; frame?: number; tap?: number; outline?: boolean; h?: number; ancho?: number | string; icono?: string }> = ({ t, frame = 0, tap = -100, outline, h = 42, ancho = "100%", icono }) => (
  <div style={{ width: ancho, height: h, borderRadius: 10, background: outline ? "white" : PRIMARIO, border: outline ? `1.5px solid ${PRIMARIO}` : "none", color: outline ? PRIMARIO : "white", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxSizing: "border-box", transform: pres(frame, tap, 0.05) }}>
    {icono ? <Icono d={icono} s={15} c={outline ? PRIMARIO : "white"} w={2.2} /> : null}
    {t}
  </div>
);
const Burbuja: React.FC<{ d: string; s?: number; bg?: string; c?: string }> = ({ d, s = 34, bg = "#e3ecf4", c = AZUL_TXT }) => (
  <div style={{ width: s, height: s, borderRadius: s > 40 ? "50%" : 9, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
    <Icono d={d} s={s * 0.5} c={c} w={2.2} />
  </div>
);

// ---------- Home ----------
const ACCESOS: [string, string][] = [
  ["Mis Préstamos", I.lista],
  ["Pagar Cuota", I.peso],
  ["Nuevo Préstamo", I.doc],
  ["Saldo Cancelación", I.grafico],
  ["Trámites", I.tramite],
  ["Reclamos", I.alerta],
];
const SERVICIOS: [string, string, string, string, string][] = [
  ["Datos personales", "Domicilio, teléfono y más", I.persona, "#e3ecf4", AZUL_TXT],
  ["Datos bancarios", "Actualizá tu CBU y banco", I.banco, "#e3ecf4", AZUL_TXT],
  ["Hacer un reclamo", "Reportá un problema", I.triangulo, "#fdf0d8", "#d97706"],
  ["Solicitar baja de cuenta", "Dar de baja tu cuenta", I.baja, "#fde4e4", "#dc2626"],
];
const LINEA_Y = 78;
const scrollHome = (d: Disp, frame: number) => interpolate(frame, SCROLL_HOME, [0, d.tab ? -84 : -272], { ...clamp, easing: Easing.inOut(Easing.cubic) });
const homeLayout = (d: Disp) => {
  const cols = d.tab ? 6 : 3;
  const ah = d.tab ? 88 : 80;
  const accesosY = 372;
  const filas = 6 / cols;
  const prestY = accesosY + filas * (ah + 8) + 10;
  return { cols, ah, accesosY, prestY, servY: prestY + 26 + 132 + 16 };
};
const TarjetaPrestamo: React.FC<{ frame: number; desde: number; acciones?: boolean; d: Disp }> = ({ frame, desde, acciones, d }) => {
  const t = sube(frame, desde, 30);
  return (
    <div style={{ borderRadius: 12, border: `1px solid ${BORDE}`, background: "white", boxShadow: "0 2px 10px rgba(20,30,50,0.06)", padding: "12px 14px", boxSizing: "border-box", transform: pres(frame, acciones ? TAP_CARD : -100, 0.02) }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Burbuja d={I.mano} s={32} />
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: TINTA }}>Préstamo Personal</div>
          <div style={{ fontSize: 10, color: TINTA_2, marginTop: 1 }}>N° {CODIGO}</div>
        </div>
        <span style={{ marginLeft: "auto", fontSize: 9.5, fontWeight: 800, color: VERDE, background: "#dcf3e3", borderRadius: 10, padding: "3px 9px" }}>VIGENTE</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 10 }}>
        <span style={{ fontSize: 19, fontWeight: 800, color: TINTA }}>{pesos(MONTO * t)}</span>
        <span style={{ fontSize: 11, color: TINTA_2 }}>12 cuotas de {pesos(CUOTA, 0)}</span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: "#e6eaf0", marginTop: 10 }}>
        <div style={{ width: `${25 * t}%`, height: "100%", borderRadius: 3, background: VERDE }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: TINTA_2, marginTop: 6 }}>
        <span>{Math.round(3 * t)} de 12 cuotas pagas</span>
        <span>Próximo vencimiento: 10/12/2026</span>
      </div>
      {acciones ? (
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <Boton t="Pagar cuota" h={34} outline />
          <Boton t={d.tab ? "Saldo de cancelación" : "Saldo cancelación"} h={34} frame={frame} tap={TAP_SALDO} />
        </div>
      ) : null}
    </div>
  );
};
const Home: React.FC<{ frame: number; d: Disp }> = ({ frame, d }) => {
  const L = homeLayout(d);
  const t = sube(frame, 14, 40);
  const banner = spring({ frame: frame - 70, fps: 30, config: { damping: 16 } });
  const aw = (d.w - (L.cols - 1) * 8) / L.cols;
  return (
    <Contenido d={d}>
      <div style={{ position: "absolute", left: 0, right: 0, top: scrollHome(d, frame) }}>
        <div style={{ position: "absolute", left: 0, top: 14, fontSize: 20, fontWeight: 700, color: TINTA }}>Hola, Javier</div>
        <div style={{ position: "absolute", left: 0, top: 44, fontSize: 10, color: TINTA_2 }}>Último acceso: 15/11/2026 09:41 a. m.</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 66, borderTop: `1px solid ${BORDE}` }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: LINEA_Y, height: 160, borderRadius: 14, background: "linear-gradient(135deg, #1f4f8a, #2f6f99)", boxShadow: "0 8px 22px rgba(31,79,138,0.3)", padding: "14px 18px", boxSizing: "border-box", color: "white" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: 700 }}>
            <Burbuja d={I.mano} s={28} bg="rgba(255,255,255,0.18)" c="white" /> Tu línea de crédito
          </div>
          {(
            [
              ["Capital total otorgado", MONTO],
              ["Capital pendiente", PENDIENTE],
              ["Capital amortizado", AMORTIZADO],
            ] as [string, number][]
          ).map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, marginTop: 8 }}>
              {k}
              <b style={{ fontSize: 14 }}>{pesos(v * t)}</b>
            </div>
          ))}
          <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.25)", marginTop: 12 }}>
            <div style={{ width: `${(AMORTIZADO / MONTO) * 100 * t}%`, height: "100%", borderRadius: 3, background: "#7dd3fc" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8.5, marginTop: 4, opacity: 0.85 }}>
            <span>0%</span>
            <span>Amortizado: {Math.round((AMORTIZADO / MONTO) * 100 * t)}%</span>
            <span>100%</span>
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 250, height: d.tab ? 76 : 82, borderRadius: 14, background: "linear-gradient(110deg, #0f766e, #14b8a6)", display: "flex", alignItems: "center", gap: 12, padding: "0 16px", boxSizing: "border-box", color: "white", opacity: Math.min(1, banner * 1.5), transform: `translateX(${(1 - banner) * 40}px)` }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icono d={I.escudo} s={24} w={2} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 0.6, opacity: 0.9 }}>OFERTA EXCLUSIVA</div>
            <div style={{ fontSize: d.tab ? 13.5 : 12.5, fontWeight: 800, marginTop: 2, whiteSpace: "nowrap" }}>{d.tab ? "Protegé tu préstamo y tu familia" : "Protegé tu préstamo"}</div>
            <div style={{ fontSize: d.tab ? 10 : 9.5, opacity: 0.9, marginTop: 2, whiteSpace: "nowrap" }}>{d.tab ? "Seguro de vida desde $ 2.900 por mes" : "Seguro de vida desde $ 2.900/mes"}</div>
          </div>
          <div style={{ fontSize: 11, fontWeight: 800, background: "white", color: "#0f766e", borderRadius: 18, padding: "7px 12px", whiteSpace: "nowrap" }}>Ver oferta</div>
        </div>
        <div style={{ position: "absolute", left: 0, top: 344, fontSize: 14, fontWeight: 700, color: TINTA }}>Accesos rápidos</div>
        {ACCESOS.map(([n, ic], i) => (
          <div key={n} style={{ position: "absolute", left: (i % L.cols) * (aw + 8), top: L.accesosY + Math.floor(i / L.cols) * (L.ah + 8), width: aw, height: L.ah, borderRadius: 10, border: `1px solid ${BORDE}`, background: GRIS, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, opacity: aparece(frame, 20 + i * 3) }}>
            <Burbuja d={ic} s={32} bg="#dbe6f0" />
            <span style={{ fontSize: 10.5, color: TINTA, textAlign: "center", lineHeight: 1.2, padding: "0 4px" }}>{n}</span>
          </div>
        ))}
        <div style={{ position: "absolute", left: 0, right: 0, top: L.prestY, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: TINTA }}>Tus préstamos</span>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: AZUL_TXT, display: "flex", alignItems: "center" }}>
            VER TODOS <Icono d={I.der} s={12} c={AZUL_TXT} w={2.4} />
          </span>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: L.prestY + 26 }}>
          <TarjetaPrestamo frame={frame} desde={30} d={d} />
        </div>
        <div style={{ position: "absolute", left: 0, top: L.servY, fontSize: 14, fontWeight: 700, color: TINTA }}>Servicios y gestiones</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: L.servY + 26, borderRadius: 10, border: `1px solid ${BORDE}`, background: GRIS, display: "grid", gridTemplateColumns: d.tab ? "1fr 1fr" : "1fr", overflow: "hidden" }}>
          {SERVICIOS.map(([n, s, ic, bg, c], i) => (
            <div key={n} style={{ height: 46, display: "flex", alignItems: "center", gap: 10, padding: "0 12px", borderTop: (d.tab ? i > 1 : i > 0) ? `1px solid ${BORDE}` : "none", borderLeft: d.tab && i % 2 ? `1px solid ${BORDE}` : "none" }}>
              <Burbuja d={ic} s={28} bg={bg} c={c} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11.5, color: TINTA }}>{n}</div>
                <div style={{ fontSize: 9, color: TINTA_2 }}>{s}</div>
              </div>
              <Icono d={I.der} s={14} c={TINTA_2} w={2.2} />
            </div>
          ))}
        </div>
      </div>
    </Contenido>
  );
};

// ---------- Loans ----------
const PREST_CARD_Y = 184;
const PLAN_Y = 384;
const planVis = (frame: number) => aparece(frame, TAP_CARD + 6, 12);
const Prestamos: React.FC<{ frame: number; d: Disp }> = ({ frame, d }) => {
  const f0 = ESC.prestamos[0];
  const plan = planVis(frame);
  const resumen: [string, string][] = [
    ["Préstamos activos", "1"],
    ["Próximo vencimiento", "10/12/2026"],
    ["Capital total", pesos(MONTO * sube(frame, f0 + 8))],
  ];
  return (
    <Contenido d={d}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 16, textAlign: "center", fontSize: 18, fontWeight: 700, color: TINTA }}>Préstamos</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 52, height: 70, borderRadius: 12, border: `1px solid ${BORDE}`, background: GRIS, display: "flex", alignItems: "center", opacity: aparece(frame, f0 + 4) }}>
        {resumen.map(([k, v]) => (
          <div key={k} style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: d.tab ? 11 : 9, color: TINTA_2 }}>{k}</div>
            <div style={{ fontSize: d.tab ? 15 : 12, fontWeight: 700, color: TINTA, marginTop: 4 }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, top: 138, display: "flex", gap: 8 }}>
        {["Todos", "Vigentes", "Finalizados"].map((c, i) => (
          <span key={c} style={{ fontSize: 11.5, fontWeight: 600, padding: "7px 14px", borderRadius: 16, background: i === 0 ? PRIMARIO : GRIS, color: i === 0 ? "white" : TINTA, border: i === 0 ? "none" : `1px solid ${BORDE}` }}>
            {c}
          </span>
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: PREST_CARD_Y, opacity: aparece(frame, f0 + 8), transform: `translateY(${(1 - aparece(frame, f0 + 8)) * 10}px)` }}>
        <TarjetaPrestamo frame={frame} desde={f0 + 10} acciones d={d} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: PLAN_Y, opacity: plan, transform: `translateY(${(1 - plan) * 14}px)` }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: TINTA }}>Plan de cuotas</div>
        <div style={{ marginTop: 10, borderRadius: 10, border: `1px solid ${BORDE}`, overflow: "hidden" }}>
          {PLAN.slice(0, d.tab ? 7 : 7).map((p, i) => {
            const estado = p.n <= 3 ? "PAGADA" : p.n === 4 ? "PRÓXIMA" : "PENDIENTE";
            const col = estado === "PAGADA" ? [VERDE, "#dcf3e3"] : estado === "PRÓXIMA" ? [AZUL_TXT, "#dbeafe"] : [TINTA_2, "#eef0f3"];
            return (
              <div key={p.n} style={{ height: 34, display: "flex", alignItems: "center", padding: "0 12px", borderTop: i ? `1px solid ${BORDE}` : "none", fontSize: 11.5, color: TINTA, background: p.n === 4 ? "#f5f9ff" : "white", opacity: aparece(frame, TAP_CARD + 10 + i * 2, 8) }}>
                <span style={{ width: 70, fontWeight: 700 }}>Cuota {p.n}</span>
                <span style={{ flex: 1, color: TINTA_2 }}>{p.venc}</span>
                <span style={{ width: d.tab ? 140 : 96, textAlign: "right", fontWeight: 600 }}>{pesos(CUOTA, 0)}</span>
                <span style={{ width: d.tab ? 120 : 84, display: "flex", justifyContent: "flex-end" }}>
                  <span style={{ fontSize: 8.5, fontWeight: 800, color: col[0], background: col[1], borderRadius: 8, padding: "3px 8px" }}>{estado}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Contenido>
  );
};

// ---------- Payoff balance ----------
const RESULTADO_Y = 200;
const resultado = (frame: number) => sube(frame, TAP_CALCULAR + 6, 34);
const Saldo: React.FC<{ frame: number; d: Disp }> = ({ frame, d }) => {
  const t = resultado(frame);
  const vis = aparece(frame, TAP_CALCULAR + 4, 10);
  const filas: [string, number][] = [
    ["Capital pendiente", PENDIENTE],
    ["Intereses devengados", INTERES_DEV],
    ["IVA sobre intereses", IVA_DEV],
    ["Cargos administrativos", 0],
  ];
  return (
    <Contenido d={d}>
      <Volver t="Saldo de Cancelación" frame={frame} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 70, height: 50, borderRadius: 10, border: `1px solid ${BORDE}`, background: GRIS, display: "flex", alignItems: "center", gap: 10, padding: "0 12px" }}>
        <Burbuja d={I.mano} s={30} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: TINTA }}>Préstamo Personal · N° {CODIGO}</div>
          <div style={{ fontSize: 9.5, color: TINTA_2 }}>3 de 12 cuotas pagas · {pesos(MONTO, 0)}</div>
        </div>
        <span style={{ fontSize: 9 }}>▾</span>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 134, display: "flex", alignItems: "flex-end", gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: TINTA_2, marginBottom: 6 }}>Fecha de cancelación</div>
          <div style={{ height: 42, borderRadius: 10, background: GRIS, border: `1px solid ${BORDE}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px", fontSize: 13, color: TINTA }}>
            15/11/2026 <Icono d={I.calendario} s={16} c={TINTA_2} w={2} />
          </div>
        </div>
        <Boton t="Calcular" ancho={d.tab ? 180 : 110} frame={frame} tap={TAP_CALCULAR} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: RESULTADO_Y, borderRadius: 14, border: `1px solid ${BORDE}`, background: "white", boxShadow: "0 4px 16px rgba(20,30,50,0.08)", padding: "14px 18px", boxSizing: "border-box", opacity: vis, transform: `translateY(${(1 - vis) * 12}px)` }}>
        {filas.map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: TINTA, padding: "8px 0", borderBottom: `1px solid ${BORDE}` }}>
            <span style={{ color: TINTA_2 }}>{k}</span>
            <b style={{ fontWeight: 600 }}>{pesos(v * t)}</b>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: TINTA, letterSpacing: 0.4 }}>TOTAL A CANCELAR</span>
          <span style={{ fontSize: 22, fontWeight: 800, color: PRIMARIO }}>{pesos(TOTAL_CANCEL * t)}</span>
        </div>
        <div style={{ fontSize: 9.5, color: TINTA_2, marginTop: 4, textAlign: "right" }}>Válido hasta el 15/11/2026 a las 23:59</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: RESULTADO_Y + 238, height: 48, borderRadius: 10, background: "#e8f6ee", border: "1px solid #b7e4c7", display: "flex", alignItems: "center", gap: 10, padding: "0 14px", fontSize: 11.5, color: "#14532d", opacity: aparece(frame, TAP_CALCULAR + 30, 10) }}>
        <Burbuja d={I.check} s={26} bg={VERDE} c="white" />
        Cancelando hoy ahorrás <b style={{ marginLeft: 4 }}>{pesos(AHORRO * t, 0)}</b>&nbsp;en intereses
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: RESULTADO_Y + 304, display: "flex", gap: 10, opacity: aparece(frame, TAP_CALCULAR + 36, 10) }}>
        <Boton t="Cancelar préstamo" />
        <Boton t={d.tab ? "Descargar detalle" : "Descargar"} outline icono={I.descarga} />
      </div>
    </Contenido>
  );
};

// ---------- New loan (pre-approved offer) ----------
const OFERTA_Y = 196;
const SLIDER = { y: OFERTA_Y + 96, min: 500000, max: 2000000 };
const montoElegido = (frame: number) => interpolate(frame, ARRASTRE, [1000000, 1600000], { ...clamp, easing: Easing.inOut(Easing.cubic) });
const cuotasElegidas = (frame: number) => (frame >= TAP_12 + 2 ? 12 : 9);
const cuotaDe = (monto: number, n: number) => {
  const i = 0.98 / 12;
  return (monto * i) / (1 - Math.pow(1 + i, -n));
};
const Nuevo: React.FC<{ frame: number; d: Disp }> = ({ frame, d }) => {
  const f0 = ESC.nuevo[0];
  const monto = montoElegido(frame);
  const n = cuotasElegidas(frame);
  const p = (monto - SLIDER.min) / (SLIDER.max - SLIDER.min);
  return (
    <Contenido d={d}>
      <Volver t="Nuevo Préstamo" frame={frame} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 70, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", opacity: aparece(frame, f0 + 4) }}>
        <div style={{ width: 62, height: 62, borderRadius: "50%", background: "#e3ecf4", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icono d={I.mano} s={32} c={AZUL_TXT} w={2} />
        </div>
        <div style={{ fontSize: 17, fontWeight: 800, color: TINTA, marginTop: 10 }}>¡Tenés una oferta preaprobada!</div>
        <div style={{ fontSize: 11.5, color: TINTA_2, marginTop: 4 }}>Por tu buen historial de pago podés renovar tu préstamo.</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: OFERTA_Y, borderRadius: 14, border: `1px solid ${BORDE}`, background: GRIS, padding: "14px 18px", boxSizing: "border-box", opacity: aparece(frame, f0 + 10), transform: `translateY(${(1 - aparece(frame, f0 + 10)) * 12}px)` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontSize: 11, color: TINTA_2 }}>Monto disponible hasta</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: VERDE }}>$ 2.000.000</span>
        </div>
        <div style={{ textAlign: "center", fontSize: 26, fontWeight: 800, color: TINTA, marginTop: 10 }}>{pesos(Math.round(monto / 10000) * 10000, 0)}</div>
        <div style={{ position: "relative", height: 24, marginTop: 10 }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 10, height: 5, borderRadius: 3, background: "#d6dde6" }} />
          <div style={{ position: "absolute", left: 0, width: `${p * 100}%`, top: 10, height: 5, borderRadius: 3, background: PRIMARIO }} />
          <div style={{ position: "absolute", left: `${p * 100}%`, top: 2, width: 20, height: 20, marginLeft: -10, borderRadius: "50%", background: "white", border: `3px solid ${PRIMARIO}`, boxSizing: "border-box", boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9.5, color: TINTA_2 }}>
          <span>$ 500.000</span>
          <span>$ 2.000.000</span>
        </div>
        <div style={{ fontSize: 11, color: TINTA_2, marginTop: 14 }}>Cantidad de cuotas</div>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          {[6, 9, 12].map((c) => (
            <div key={c} style={{ flex: 1, height: 36, borderRadius: 9, background: c === n ? PRIMARIO : "white", color: c === n ? "white" : TINTA, border: `1px solid ${c === n ? PRIMARIO : BORDE}`, fontSize: 12.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", transform: c === 12 ? pres(frame, TAP_12, 0.08) : undefined }}>
              {c} cuotas
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, paddingTop: 12, borderTop: `1px solid ${BORDE}` }}>
          <span style={{ fontSize: 11.5, color: TINTA }}>Cuota estimada · TNA 98%</span>
          <span style={{ fontSize: 17, fontWeight: 800, color: PRIMARIO }}>{pesos(Math.round(cuotaDe(monto, n) / 10) * 10, 0)}</span>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: OFERTA_Y + 330, opacity: aparece(frame, f0 + 16) }}>
        <Boton t="Solicitar préstamo" frame={frame} tap={TAP_SOLICITAR} h={46} />
      </div>
    </Contenido>
  );
};

// ---------- Claim ----------
const RECLAMO = { motivo: 168, desc: 236, tel: 360, mail: 428, enviar: 500 };
const DESCRIPCION = "Quiero adherir el débito automático para las próximas cuotas de mi préstamo.";
const Reclamo: React.FC<{ frame: number; d: Disp }> = ({ frame, d }) => {
  const campo = (label: string, v: string, y: number, h = 42, ph?: string, foco?: boolean, sel?: boolean) => (
    <div style={{ position: "absolute", left: 0, right: 0, top: y }}>
      <div style={{ fontSize: 11, color: TINTA_2, marginBottom: 6 }}>{label}</div>
      <div style={{ height: h, borderRadius: 10, background: GRIS, border: `1.3px solid ${foco ? PRIMARIO : BORDE}`, display: "flex", alignItems: h > 50 ? "flex-start" : "center", justifyContent: "space-between", padding: h > 50 ? "10px 12px" : "0 12px", boxSizing: "border-box", fontSize: 12.5, color: v ? TINTA : "#9aa3af", lineHeight: 1.45 }}>
        <span>
          {v || ph}
          {foco && Math.floor(frame / 8) % 2 === 0 ? <span style={{ display: "inline-block", width: 1.3, height: 14, background: TINTA, marginLeft: 1, verticalAlign: "middle" }} /> : null}
        </span>
        {sel ? <span style={{ fontSize: 9 }}>▾</span> : null}
      </div>
    </div>
  );
  return (
    <Contenido d={d}>
      <Volver t="Reportar un problema" frame={frame} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 70, height: 64, borderRadius: 12, background: "#eef5fb", border: "1px solid #d4e5f3", display: "flex", alignItems: "center", gap: 12, padding: "0 14px" }}>
        <Burbuja d={I.auricular} s={36} bg={PRIMARIO} c="white" />
        <span style={{ fontSize: 11, color: TINTA }}>Contanos qué problema tenés y nuestro equipo se va a comunicar con vos a la brevedad.</span>
      </div>
      {campo("Motivo del reclamo", frame >= TAP_MOTIVO + 2 ? "Consulta sobre mis cuotas" : "", RECLAMO.motivo, 42, "Seleccioná un motivo", false, true)}
      {campo("Describí tu problema", tipeo(frame, DESCRIPCION, TIPEO_DESC), RECLAMO.desc, 92, "Contanos con el mayor detalle posible qué sucedió…", frame >= TIPEO_DESC[0] && frame < TAP_ENVIAR)}
      {campo("Teléfono de contacto", "11 XXXXX-4521", RECLAMO.tel)}
      {campo("Email de contacto", "jperez@correo.com", RECLAMO.mail)}
      <div style={{ position: "absolute", left: 0, right: 0, top: RECLAMO.enviar }}>
        <Boton t="Enviar reclamo" frame={frame} tap={TAP_ENVIAR} h={46} icono={I.avion} />
      </div>
    </Contenido>
  );
};

// Claim sent: card in the middle of the screen that stays.
const ENVIADO_CARD = { w: 260, h: 170 };
const ReclamoEnviado: React.FC<{ frame: number; d: Disp }> = ({ frame, d }) => {
  if (frame < ENVIADO) {
    return null;
  }
  const t = spring({ frame: frame - ENVIADO, fps: 30, config: { damping: 14 } });
  const check = interpolate(frame, [ENVIADO + 6, ENVIADO + 18], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 7 }}>
      <div style={{ position: "absolute", inset: 0, background: `rgba(15,20,30,${0.35 * Math.min(1, t)})` }} />
      <div style={{ position: "absolute", left: (d.PW - ENVIADO_CARD.w) / 2, top: (d.PH - ENVIADO_CARD.h) / 2, width: ENVIADO_CARD.w, height: ENVIADO_CARD.h, borderRadius: 16, background: "white", boxShadow: "0 16px 40px rgba(10,20,40,0.3)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, textAlign: "center", opacity: Math.min(1, t * 1.4), transform: `scale(${0.8 + 0.2 * t})` }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: VERDE, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width={26} height={26} viewBox="0 0 24 24">
            <path d={I.check} fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - check} />
          </svg>
        </div>
        <div style={{ fontSize: 15, fontWeight: 800, color: TINTA }}>Reclamo enviado</div>
        <div style={{ fontSize: 11, color: TINTA_2 }}>N° 48213 · Te contactamos en 48 h</div>
      </div>
    </div>
  );
};

const Toast: React.FC<{ frame: number; desde: number; hasta: number; titulo: string; sub: string; d: Disp }> = ({ frame, desde, hasta, titulo, sub, d }) => {
  if (frame < desde || frame >= hasta) {
    return null;
  }
  const t = spring({ frame: frame - desde, fps: 30, config: { damping: 16 } }) * interpolate(frame, [hasta - 10, hasta], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: d.x0, width: d.w, top: d.head + 10, zIndex: 7, background: "white", borderLeft: `4px solid ${VERDE}`, borderRadius: 10, boxShadow: "0 10px 26px rgba(20,30,50,0.22)", padding: "10px 14px", boxSizing: "border-box", opacity: Math.min(1, t * 1.5), transform: `translateY(${(1 - t) * -16}px)` }}>
      <div style={{ fontSize: 12.5, fontWeight: 800, color: VERDE }}>✓ {titulo}</div>
      <div style={{ fontSize: 10.5, color: TINTA_2, marginTop: 3 }}>{sub}</div>
    </div>
  );
};

// ---------- Finger ----------
const tabX = (d: Disp, i: number) => (d.PW / 4) * i + d.PW / 8;
const caminoDe = (d: Disp): [number, number, number][] => {
  const cx = (x: number) => d.x0 + x;
  const cy = (y: number) => d.head + y;
  const tabY = d.PH - d.tabs / 2 - 4;
  const cardAcc = cy(PREST_CARD_Y + 152);
  const sliderX = (m: number) => cx(18 + ((m - SLIDER.min) / (SLIDER.max - SLIDER.min)) * (d.w - 36));
  const chip12 = cx(d.w - 18 - (d.w - 36 - 16) / 6);
  return [
    [0, d.PW * 0.7, d.PH * 0.8],
    [TAP_PRESTAMOS - 2, tabX(d, 1), tabY],
    [TAP_CARD - 2, cx(d.w * 0.35), cy(PREST_CARD_Y + 60)],
    [TAP_SALDO - 2, cx(d.w * 0.75), cardAcc],
    [TAP_CALCULAR - 2, cx(d.w - (d.tab ? 90 : 55)), cy(134 + 38)],
    [TAP_VOLVER - 2, cx(28), cy(28)],
    [ARRASTRE[0] - 2, sliderX(1000000), cy(SLIDER.y + 12)],
    [ARRASTRE[1], sliderX(1600000), cy(SLIDER.y + 12)],
    [TAP_12 - 2, chip12, cy(OFERTA_Y + 214)],
    [TAP_SOLICITAR - 2, cx(d.w / 2), cy(OFERTA_Y + 353)],
    [TAP_MAS - 2, tabX(d, 2), tabY],
    [TAP_MOTIVO - 2, cx(d.w * 0.5), cy(RECLAMO.motivo + 38)],
    [TIPEO_DESC[0], cx(d.w * 0.6), cy(RECLAMO.desc + 60)],
    [TAP_ENVIAR - 2, cx(d.w / 2), cy(RECLAMO.enviar + 23)],
    [TAP_ENVIAR + 40, d.PW * 0.7, d.PH * 0.85],
  ];
};
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
const Dedo: React.FC<{ frame: number; d: Disp }> = ({ frame, d }) => {
  const dedo = posDedo(frame, caminoDe(d));
  const tap = TAPS.find((f) => frame >= f && frame < f + 16);
  const onda = tap === undefined ? 0 : (frame - tap) / 16;
  const arrastrando = frame >= ARRASTRE[0] && frame <= ARRASTRE[1];
  const presion = arrastrando ? 1 : tap === undefined ? 0 : interpolate(frame - tap, [0, 3, 8], [0, 1, 0], clamp);
  const vis = interpolate(frame, [230, 246], [0, 1], clamp) * interpolate(frame, [TAP_ENVIAR + 26, TAP_ENVIAR + 40], [1, 0], clamp);
  return (
    <>
      {tap !== undefined && !arrastrando ? (
        <div style={{ position: "absolute", left: dedo.x, top: dedo.y, width: 18 + onda * 52, height: 18 + onda * 52, transform: "translate(-50%, -50%)", borderRadius: "50%", border: `3px solid rgba(255,140,66,${1 - onda})`, background: `rgba(255,140,66,${(1 - onda) * 0.2})`, zIndex: 8 }} />
      ) : null}
      <div style={{ position: "absolute", left: dedo.x, top: dedo.y, width: 34, height: 34, transform: `translate(-50%, -50%) scale(${1 - presion * 0.2})`, borderRadius: "50%", background: "rgba(255,255,255,0.55)", border: "2px solid rgba(40,48,64,0.35)", boxShadow: "0 4px 10px rgba(0,0,0,0.2)", opacity: vis * 0.9, zIndex: 9 }} />
    </>
  );
};

// ---------- Page ----------
const actualDe = (frame: number) => (Object.keys(ESC) as Escena[]).filter((e) => frame >= ESC[e][0]).pop() ?? "home";
const TABS: [string, string, Escena[]][] = [
  ["Inicio", I.casa, ["home"]],
  ["Préstamos", I.mano, ["prestamos", "saldo", "nuevo"]],
  ["Más", I.menu, ["reclamo"]],
  ["Salir", I.salir, []],
];
const TAP_TAB: Record<number, number> = { 1: TAP_PRESTAMOS, 2: TAP_MAS };
const LOGO_RATIO = 231 / 676;
const Pagina: React.FC<{ frame: number; d: Disp }> = ({ frame, d }) => {
  const escenas: [Escena, React.FC<{ frame: number; d: Disp }>][] = [
    ["home", Home],
    ["prestamos", Prestamos],
    ["saldo", Saldo],
    ["nuevo", Nuevo],
    ["reclamo", Reclamo],
  ];
  const actual = actualDe(frame);
  return (
    <div style={{ position: "relative", width: d.PW, height: d.PH, background: "white", fontFamily: FUENTE, overflow: "hidden" }}>
      {escenas.map(([e, C]) => {
        const [a, b] = ESC[e];
        const v = interpolate(frame, [a, a + 6, b - 6, b], [0, 1, 1, 0], clamp);
        if (v <= 0.001) {
          return null;
        }
        return (
          <div key={e} style={{ position: "absolute", inset: 0, opacity: v, clipPath: `inset(${d.head}px 0 0 0)` }}>
            <C frame={frame} d={d} />
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 0, top: 0, width: d.PW, height: d.head, background: "white", borderBottom: `1px solid ${BORDE}`, zIndex: 5 }}>
        <div style={{ position: "absolute", left: d.x0, bottom: 14, width: 96, height: 96 * LOGO_RATIO }}>
          <Img src={staticFile("axonia-logo-original.png")} style={{ width: "100%", height: "100%" }} />
        </div>
        <div style={{ position: "absolute", right: d.PW - d.x0 - d.w, bottom: 12, height: 28, padding: "0 14px", borderRadius: 5, border: "1.5px solid #1e3a8a", color: "#1e3a8a", fontSize: 11, fontWeight: 800, letterSpacing: 0.5, display: "flex", alignItems: "center" }}>AYUDA</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: d.tabs, background: "white", borderTop: `1px solid ${BORDE}`, boxShadow: "0 -2px 10px rgba(0,0,0,0.04)", display: "flex", zIndex: 5 }}>
        {TABS.map(([n, ic, es], i) => {
          const col = es.includes(actual) ? PRIMARIO : "#7b8190";
          return (
            <div key={n} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, paddingBottom: d.tab ? 0 : 6, transform: `scale(${i in TAP_TAB ? 1 - pulsado(frame, TAP_TAB[i]) * 0.12 : 1})` }}>
              <Icono d={ic} s={20} c={col} w={2} />
              <div style={{ fontSize: 9.5, fontWeight: es.includes(actual) ? 700 : 500, color: col }}>{n}</div>
            </div>
          );
        })}
      </div>
      <Toast frame={frame} desde={TAP_SOLICITAR + 6} hasta={950} titulo="Solicitud enviada" sub="Préstamo de $ 1.600.000 en 12 cuotas · Te avisamos por email" d={d} />
      <ReclamoEnviado frame={frame} d={d} />
      <Dedo frame={frame} d={d} />
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
const tomasDe = (d: Disp): Toma[] => {
  const c = { px: d.PW / 2, py: d.PH / 2 };
  const zz = d.tab ? 1.3 : 1.25;
  const izq = { ry: 14, rx: 6, rz: 1.5 };
  const der = { ry: -14, rx: 6, rz: -1.5 };
  // Credit line card of the home and the payoff total.
  const linea = { px: d.PW / 2, py: d.head + LINEA_Y + 100 };
  const total = { px: d.PW / 2, py: d.head + RESULTADO_Y + 120 };
  return [
    { f: 0, z: 0.92, ...c, ry: 20, rx: 9, rz: 2.5, cy: 0.62 },
    { f: 36, z: zz, ...linea, ...izq, cy: 0.57 },
    { f: 120, z: zz, ...linea, ...izq, cy: 0.57 },
    { f: 152, z: 1, ...c, ...izq, cy: 0.62 },
    { f: 290, z: 1, ...c, ...izq, cy: 0.62 },
    { f: 326, z: 1, ...c, ...der, cy: 0.62 },
    { f: 572, z: 1, ...c, ...der, cy: 0.62 },
    { f: 606, z: zz, ...total, ...der, cy: 0.57 },
    { f: 684, z: zz, ...total, ...der, cy: 0.57 },
    { f: 716, z: 1, ...c, ...der, cy: 0.62 },
    { f: 742, z: 1, ...c, ...der, cy: 0.62 },
    { f: 778, z: 1, ...c, ...izq, cy: 0.62 },
    { f: 1180, z: 1, ...c, ...izq, cy: 0.62 },
    { f: SUCURSAL_FRAMES, z: 1.03, ...c, ...izq, cy: 0.62 },
  ];
};
const TOMAS_TAB = tomasDe(TAB);
const TOMAS_CEL = tomasDe(CEL);

// Pieces that lift out of the screen and settle back: the loan card and the
// claim confirmation.
type Salto = { x: number; y: number; w: number; h: number; f: [number, number, number, number]; z: number };
const saltosDe = (d: Disp): Salto[] => [
  { x: d.x0 - 6, y: d.head + PREST_CARD_Y - 6, w: d.w + 12, h: 196, f: [350, 364, 384, 400], z: 110 },
  { x: (d.PW - ENVIADO_CARD.w) / 2 - 4, y: (d.PH - ENVIADO_CARD.h) / 2 - 4, w: ENVIADO_CARD.w + 8, h: ENVIADO_CARD.h + 8, f: [1126, 1140, 1162, 1178], z: 110 },
];
const SALTOS_TAB = saltosDe(TAB);
const SALTOS_CEL = saltosDe(CEL);

export const SucursalDinamico: React.FC<z.infer<typeof sucursalSchema>> = ({ fondo, paleta }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const tab = width > height;
  const d = tab ? TAB : CEL;
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
            <Pagina frame={frame} d={d} />
          </Dispositivo>
          <div style={{ position: "absolute", left: MARCO, top: MARCO, width: w, height: h, transformStyle: "preserve-3d" }}>
            {(tab ? SALTOS_TAB : SALTOS_CEL).map((s, i) => {
              if (frame <= s.f[0] || frame >= s.f[3]) {
                return null;
              }
              const k = interpolate(frame, s.f, [0, 1, 1, 0], { ...clamp, easing: Easing.inOut(Easing.cubic) });
              return (
                <div key={i}>
                  <div style={{ position: "absolute", left: s.x, top: s.y, width: s.w, height: s.h, borderRadius: 14, background: "#e6eaf0", opacity: Math.min(1, k * 3) }} />
                  <div style={{ position: "absolute", left: s.x, top: s.y, width: s.w, height: s.h, borderRadius: 14, overflow: "hidden", transform: `translate3d(0, ${10 * k}px, ${s.z * k}px)`, boxShadow: `0 ${30 * k}px ${60 * k}px rgba(0,0,0,${0.35 * k})` }}>
                    <div style={{ position: "absolute", left: -s.x, top: -s.y, width: w, height: h }}>
                      <Pagina frame={frame} d={d} />
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
