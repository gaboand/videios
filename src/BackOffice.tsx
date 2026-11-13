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

// Onboarding back office on a straight landscape tablet (16:9, 20s): the
// flow configuration (states and transitions), the back office home where a
// case travels as a folder from Entrada into Pasado a Tesorería and gets a
// green check, the list of loans paid out by treasury with the new one on
// top, and the onboarding dashboard.

export const backOfficeSchema = z.object({
  fondo: z.enum(["ondas", "red", "aurora", "geometrico"]),
  paleta: z.enum(["azul", "gris"]),
});

export const BACKOFFICE_FRAMES = 600;

const FUENTE = "Montserrat, sans-serif";
const NAVY = "#0f2a4d";
const NAVY_2 = "#14284b";
const TINTA = "#1f2430";
const TINTA_2 = "#6b7280";
const BORDE = "#e1e5ec";
const VERDE = "#1e8a4c";
const NARANJA = "#e8742c";
const AZUL = "#2f6fbf";
const PW = 1180;
const PH = 820;
const HEADER = 50;
const SIDE = 46;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Timeline (frames).
const ESC = {
  config: [0, 150],
  home: [146, 300],
  tesoreria: [296, 432],
  dashboard: [428, BACKOFFICE_FRAMES + 10],
} as const;
type Escena = keyof typeof ESC;
const TAP_CERRAR = 134;
const VIAJE = [176, 230];
const LLEGA = 232;
const TAP_TESORERIA = 282;
const TAP_DASH = 414;
const TAPS = [TAP_CERRAR, TAP_TESORERIA, TAP_DASH];

const pesos = (n: number) => `$${n.toLocaleString("es-AR")}`;
const num = (n: number) => n.toLocaleString("es-AR");
const pulsado = (frame: number, f: number) => interpolate(frame, [f, f + 4, f + 12], [0, 1, 0], clamp);

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
const I_DOC = "M6 3 H14 L18 7 V21 H6 Z M14 3 V7 H18 M9 12 H15 M9 16 H15";
const I_ALERTA = "M12 3 L22 20 H2 Z M12 9 V14 M12 17 V17.5";
const I_BANCO = "M3 9 L12 4 L21 9 Z M5 10 V17 M9.5 10 V17 M14.5 10 V17 M19 10 V17 M3 20 H21";
const I_CAJA = "M3 8 L12 4 L21 8 V17 L12 21 L3 17 Z M3 8 L12 12 L21 8 M12 12 V21";
const I_RELOJ = "M7 3 H17 M7 21 H17 M8 3 C8 9 16 9 16 12 C16 15 8 15 8 21 M16 3 C16 9 8 9 8 12";
const I_CARPETA = "M3 6 H10 L12 8 H21 V19 H3 Z";
const ICONOS_SIDE = [
  "M4 11 L12 4 L20 11 V20 H14 V14 H10 V20 H4 Z",
  "M9 7 A3 3 0 1 1 9 13 A3 3 0 1 1 9 7 M3 20 C4 16 14 16 15 20 M17 9 V15 M14 12 H20",
  I_CARPETA,
  "M4 5 H20 L14 13 V19 L10 21 V13 Z",
  "M4 8 L12 4 L20 8 L12 12 Z M4 12 L12 16 L20 12 M4 16 L12 20 L20 16",
  "M12 3 A9 9 0 1 0 21 12 H12 Z M15 3.5 A9 9 0 0 1 20.5 9 H15 Z",
  "M10 4 A6 6 0 1 1 10 16 A6 6 0 1 1 10 4 M15 15 L20 20",
  "M12 8 V12 L15 15 M4 12 A8 8 0 1 0 6.5 6.3 M4 4 V8 H8",
  "M12 8 A4 4 0 1 1 12 16 A4 4 0 1 1 12 8 M12 2 V5 M12 19 V22 M2 12 H5 M19 12 H22",
];
const ACTIVO: Record<Escena, number> = { config: 8, home: 0, tesoreria: 2, dashboard: 5 };
const TITULOS: Record<Escena, string> = {
  config: "CONFIGURACIÓN GLOBAL BACK OFFICE",
  home: "HOME BACK OFFICE",
  tesoreria: "PRÉSTAMOS LIQUIDADOS - TESORERÍA",
  dashboard: "DASHBOARD ONBOARDING",
};

// ---------- Flow nodes, shared by the configuration and the home ----------
type Nodo = { id: string; nombre: string; icono: string; x: number; y: number; color: string; fondo: string };
const NODOS: Nodo[] = [
  { id: "entrada", nombre: "ENTRADA", icono: I_DOC, x: 0, y: 1, color: "#2e7d4f", fondo: "#dcf3e3" },
  { id: "observados", nombre: "OBSERVADOS", icono: I_ALERTA, x: 1, y: 1, color: "#1f5fa8", fondo: "#dbe8f8" },
  { id: "tesoreria", nombre: "PASADO A TESORERÍA", icono: I_BANCO, x: 2, y: 0, color: "#9b2335", fondo: "#f8dde2" },
  { id: "noEntregados", nombre: "NO ENTREGADOS", icono: I_CAJA, x: 2, y: 1, color: "#9b2335", fondo: "#f8dde2" },
  { id: "caducados", nombre: "CADUCADOS", icono: I_RELOJ, x: 2, y: 2, color: "#9b2335", fondo: "#f8dde2" },
];

// ---------- Configuration: flow view modal ----------
const MOD = { x: 120, y: 90, w: 940, h: 640 };
const CFG = { col: [60, 370, 680], fila: [240, 380, 520], w: 200, h: 58 };
const cfgNodo = (n: Nodo) => ({ x: CFG.col[n.x], y: CFG.fila[n.y] });
const FLECHAS_CFG: { d: string; tipo: "manual" | "auto" | "caducidad"; etiqueta?: string }[] = [
  { d: "M 260 409 C 310 409 330 409 370 409", tipo: "manual" },
  { d: "M 260 403 C 420 403 500 269 680 269", tipo: "manual" },
  { d: "M 570 409 C 620 409 640 409 680 409", tipo: "manual" },
  { d: "M 570 403 C 620 380 640 290 680 275", tipo: "manual" },
  { d: "M 570 415 C 620 440 640 530 680 543", tipo: "manual" },
  { d: "M 260 415 C 300 418 340 420 370 416", tipo: "auto" },
  { d: "M 260 418 C 440 430 520 549 680 549", tipo: "caducidad", etiqueta: "1200 min" },
  { d: "M 880 269 C 930 300 930 520 880 549", tipo: "manual" },
];

const Configuracion: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const modal = spring({ frame: frame - 8, fps, config: { damping: 18, stiffness: 120 } });
  const cierre = interpolate(frame, [TAP_CERRAR + 2, TAP_CERRAR + 12], [0, 1], clamp);
  const v = modal * (1 - cierre);
  return (
    <div style={{ position: "absolute", left: SIDE, top: HEADER, right: 0, bottom: 0, background: "#f4f6f9" }}>
      {/* Page behind the modal */}
      <div style={{ position: "absolute", left: 30, top: 24, fontSize: 22, fontWeight: 800, color: TINTA }}>Configuración global</div>
      {["Estados del flujo", "Transiciones", "Caducidad", "Notificaciones"].map((t, i) => (
        <div key={t} style={{ position: "absolute", left: 30, top: 74 + i * 64, width: 1070, height: 52, background: "white", borderRadius: 10, border: `1px solid ${BORDE}`, display: "flex", alignItems: "center", padding: "0 18px", boxSizing: "border-box", fontSize: 13, fontWeight: 700, color: TINTA }}>
          {t}
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: 11, color: "white", background: NAVY_2, borderRadius: 6, padding: "6px 12px" }}>Editar</div>
        </div>
      ))}
      {v > 0.001 ? (
        <>
          <div style={{ position: "absolute", inset: 0, background: `rgba(30,34,42,${0.55 * v})` }} />
          <div
            style={{
              position: "absolute",
              left: MOD.x - SIDE,
              top: MOD.y - HEADER,
              width: MOD.w,
              height: MOD.h,
              background: "white",
              borderRadius: 12,
              boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
              opacity: v,
              transform: `scale(${0.94 + 0.06 * v})`,
              overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", left: 24, top: 18, fontSize: 16, fontWeight: 800, color: TINTA }}>Visualización del flujo</div>
            <div style={{ position: "absolute", left: 24, top: 42, fontSize: 11, color: TINTA_2 }}>
              Pasá el cursor sobre un estado para ver hacia dónde puede dirigirse el prospecto desde ese estado.
            </div>
            <div
              style={{ position: "absolute", right: 20, top: 16, width: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: TINTA_2, background: pulsado(frame, TAP_CERRAR) > 0 ? "#eef1f5" : "transparent" }}
            >
              ×
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 68, borderTop: `1px solid ${BORDE}` }} />
            <div style={{ position: "absolute", left: 24, top: 82, display: "flex", gap: 18, fontSize: 10.5, color: TINTA_2, alignItems: "center" }}>
              {[
                ["Transición manual", "#9aa3b2", "4 3"],
                ["Pase automático", AZUL, "5 3"],
                ["Caducidad", NARANJA, ""],
              ].map(([t, c, dash]) => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width={22} height={6}>
                    <line x1={0} y1={3} x2={22} y2={3} stroke={c} strokeWidth={2} strokeDasharray={dash} />
                  </svg>
                  {t}
                </div>
              ))}
            </div>
            <div style={{ position: "absolute", right: 20, top: 76, background: NAVY_2, color: "white", fontSize: 11, fontWeight: 700, borderRadius: 6, padding: "7px 12px" }}>Ver automáticos</div>
            {["ENTRADA", "INTERMEDIOS", "FINALES"].map((t, i) => (
              <div key={t} style={{ position: "absolute", left: CFG.col[i] - 30, top: 140, width: 260, fontSize: 10.5, fontWeight: 800, letterSpacing: 1.2, color: TINTA_2, borderBottom: `1.5px solid ${BORDE}`, paddingBottom: 8 }}>
                {t}
              </div>
            ))}
            <svg width={MOD.w} height={MOD.h} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
              {FLECHAS_CFG.map((f, i) => {
                const op = interpolate(frame, [40 + i * 6, 56 + i * 6], [0, 1], clamp);
                const color = f.tipo === "auto" ? AZUL : f.tipo === "caducidad" ? NARANJA : "#9aa3b2";
                return (
                  <g key={i} opacity={op}>
                    <path d={f.d} fill="none" stroke={color} strokeWidth={f.tipo === "caducidad" ? 2 : 1.6} strokeDasharray={f.tipo === "caducidad" ? undefined : f.tipo === "auto" ? "6 4" : "4 4"} />
                    {f.etiqueta ? (
                      <text x={560} y={500} fontSize={11} fontWeight={700} fill={NARANJA} fontFamily="Montserrat">
                        {f.etiqueta}
                      </text>
                    ) : null}
                  </g>
                );
              })}
            </svg>
            {NODOS.map((n, i) => {
              const p = cfgNodo(n);
              const t = spring({ frame: frame - 20 - i * 5, fps, config: { damping: 15 } });
              return (
                <div key={n.id} style={{ position: "absolute", left: p.x, top: p.y, width: CFG.w, height: CFG.h, borderRadius: 8, background: "#e9ecf0", border: "1px solid #cfd5dd", boxShadow: "0 3px 8px rgba(20,30,50,0.1)", display: "flex", alignItems: "center", gap: 12, padding: "0 14px", boxSizing: "border-box", opacity: t, transform: `scale(${0.85 + 0.15 * t})` }}>
                  <div style={{ width: 32, height: 32, borderRadius: 7, background: n.fondo, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icono d={n.icono} s={17} c={n.color} />
                  </div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: TINTA, lineHeight: 1.25 }}>{n.nombre}</div>
                </div>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
};

// ---------- Back office home with the case traveling to treasury ----------
const HOME = { col: [60, 420, 780], fila: [200, 350, 500], w: 300, h: 70 };
const homeNodo = (n: Nodo) => ({ x: HOME.col[n.x], y: HOME.fila[n.y] });
// Leaves Entrada from its top and rises above Observados so the route does
// not cross it.
const P0 = { x: HOME.col[0] + HOME.w / 2, y: HOME.fila[1] };
const P1 = { x: HOME.col[0] + HOME.w / 2 + 10, y: HOME.fila[0] - 10 };
const P2 = { x: 540, y: HOME.fila[0] + 35 };
const P3 = { x: HOME.col[2], y: HOME.fila[0] + 35 };
const bezier = (t: number) => {
  const u = 1 - t;
  const f = (a: number, b: number, c: number, d: number) => u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
  return { x: f(P0.x, P1.x, P2.x, P3.x), y: f(P0.y, P1.y, P2.y, P3.y) };
};
const CAMINO = `M ${P0.x} ${P0.y} C ${P1.x} ${P1.y} ${P2.x} ${P2.y} ${P3.x} ${P3.y}`;

const Home: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const f0 = ESC.home[0];
  const linea = interpolate(frame, [VIAJE[0] - 14, VIAJE[0] + 6], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const t = interpolate(frame, VIAJE, [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const sale = interpolate(frame, [VIAJE[0] - 8, VIAJE[0]], [0, 1], clamp);
  const entra = interpolate(frame, [VIAJE[1] - 6, LLEGA], [1, 0], clamp);
  const pos = bezier(t);
  const check = spring({ frame: frame - LLEGA, fps, config: { damping: 11, stiffness: 160 } });
  const llegado = frame >= LLEGA;
  const desvanece = interpolate(frame, [LLEGA + 30, LLEGA + 46], [1, 0], clamp);
  const casos: Record<string, number> = {
    entrada: frame >= VIAJE[0] ? 15 : 16,
    observados: 0,
    tesoreria: llegado ? 6392 : 6391,
    noEntregados: 0,
    caducados: 43,
  };
  return (
    <div style={{ position: "absolute", left: SIDE, top: HEADER, right: 0, bottom: 0, background: "white" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 22, textAlign: "center", fontSize: 24, fontWeight: 700, color: TINTA }}>Back Office</div>
      <div style={{ position: "absolute", right: 24, top: 22, background: NAVY_2, color: "white", fontSize: 11.5, fontWeight: 700, borderRadius: 7, padding: "9px 14px", display: "flex", gap: 6, alignItems: "center" }}>
        <Icono d="M10 4 A6 6 0 1 1 10 16 A6 6 0 1 1 10 4 M15 15 L20 20" s={13} /> Buscar cliente
      </div>
      <div style={{ position: "absolute", left: 24, right: 24, top: 70, height: 52, background: "#b9bec7", borderRadius: 8, display: "flex", alignItems: "center", gap: 7, padding: "0 14px" }}>
        {["Hoy", "Ayer", "Esta semana", "Semana anterior", "Este mes", "Mes anterior", "Todos"].map((b) => (
          <div key={b} style={{ fontSize: 10.5, fontWeight: 700, padding: "7px 11px", borderRadius: 7, background: b === "Todos" ? NAVY_2 : "white", color: b === "Todos" ? "white" : TINTA }}>
            {b}
          </div>
        ))}
        <div style={{ flex: 1 }} />
        {["Desde", "Hasta"].map((k) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10.5, color: TINTA }}>
            {k}:
            <div style={{ background: "white", borderRadius: 5, padding: "6px 10px", fontSize: 10.5, color: TINTA_2 }}>dd/mm/aaaa</div>
          </div>
        ))}
        <div style={{ fontSize: 10.5, fontWeight: 700, padding: "7px 12px", borderRadius: 7, background: NAVY_2, color: "white" }}>Aplicar</div>
      </div>
      {["ENTRADA", "INTERMEDIOS", "FINALES"].map((tx, i) => (
        <div key={tx} style={{ position: "absolute", left: HOME.col[i], top: 146, width: HOME.w, fontSize: 10.5, fontWeight: 800, letterSpacing: 1.2, color: TINTA_2, borderBottom: `1.5px solid ${BORDE}`, paddingBottom: 8 }}>
          {tx}
        </div>
      ))}
      {/* Route line */}
      <svg width={PW} height={PH} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <path d={CAMINO} fill="none" stroke={VERDE} strokeWidth={3} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - linea} opacity={0.9 * desvanece} />
        <path d={CAMINO} fill="none" stroke={VERDE} strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - linea} opacity={0.15 * desvanece} />
      </svg>
      {NODOS.map((n, i) => {
        const p = homeNodo(n);
        const tt = spring({ frame: frame - f0 - 4 - i * 4, fps, config: { damping: 15 } });
        const meta = n.id === "tesoreria";
        const latido = meta ? interpolate(frame, [LLEGA, LLEGA + 6, LLEGA + 18], [0, 1, 0], clamp) : 0;
        return (
          <div
            key={n.id}
            style={{
              position: "absolute",
              left: p.x,
              top: p.y,
              width: HOME.w,
              height: HOME.h,
              borderRadius: 9,
              background: "#262729",
              color: "white",
              display: "flex",
              alignItems: "center",
              padding: "0 20px",
              boxSizing: "border-box",
              gap: 16,
              opacity: tt,
              transform: `scale(${(0.9 + 0.1 * tt) * (1 + latido * 0.05) * (meta ? 1 - pulsado(frame, TAP_TESORERIA) * 0.04 : 1)})`,
              boxShadow: meta && llegado ? `0 0 0 ${3 + latido * 4}px rgba(30,138,76,${0.5 * desvanece + 0.15})` : "0 4px 10px rgba(0,0,0,0.15)",
            }}
          >
            <Icono d={n.icono} s={20} />
            <div style={{ flex: 1, fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>{n.nombre}</div>
            <div style={{ fontSize: 11, color: "#d6d9de" }}>
              Casos: <b style={{ color: "white" }}>{num(casos[n.id])}</b>
            </div>
          </div>
        );
      })}
      {/* Folder that travels */}
      {sale > 0 && entra > 0 ? (
        <div style={{ position: "absolute", left: pos.x, top: pos.y, transform: `translate(-50%, -50%) scale(${(0.6 + 0.4 * sale) * (0.3 + 0.7 * entra)}) rotate(${Math.sin(t * Math.PI) * -8}deg)`, opacity: Math.min(sale, entra), zIndex: 3, filter: "drop-shadow(0 8px 10px rgba(0,0,0,0.3))" }}>
          <svg width={64} height={52} viewBox="0 0 64 52">
            <path d="M3 8 C3 5 5 3 8 3 H24 L30 9 H56 C59 9 61 11 61 14 V44 C61 47 59 49 56 49 H8 C5 49 3 47 3 44 Z" fill="#f5b942" />
            <rect x={12} y={12} width={40} height={30} rx={2} fill="white" />
            <path d="M18 20 H44 M18 26 H44 M18 32 H36" stroke="#9aa3b2" strokeWidth={2} strokeLinecap="round" />
            <path d="M3 18 H61 V44 C61 47 59 49 56 49 H8 C5 49 3 47 3 44 Z" fill="#f7c55c" />
            <text x={32} y={39} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={9} fill="#8a5a12">
              J. PEREZ
            </text>
          </svg>
        </div>
      ) : null}
      {/* Green check on treasury */}
      {check > 0.01 ? (
        <div style={{ position: "absolute", left: HOME.col[2] + HOME.w - 18, top: HOME.fila[0] - 16, width: 38, height: 38, borderRadius: "50%", background: VERDE, color: "white", fontSize: 22, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${check})`, boxShadow: "0 6px 14px rgba(30,138,76,0.45)", zIndex: 4 }}>
          ✓
        </div>
      ) : null}
      {check > 0.01 ? (
        <div style={{ position: "absolute", left: HOME.col[2], top: HOME.fila[0] + HOME.h + 10, width: HOME.w, textAlign: "center", fontSize: 12, fontWeight: 700, color: VERDE, opacity: Math.min(1, check) }}>
          Operación dada de alta · Javier Perez
        </div>
      ) : null}
    </div>
  );
};

// ---------- Treasury: paid-out loans ----------
const FILAS: [string, string, string, number, string, number, string][] = [
  ["30184562", "LAURA BEATRIZ MENDEZ", "AXN000036115", 11, "Comercio Centro", 79671, "13/11/2026 11:52"],
  ["27458913", "MARTIN ALEJANDRO SUAREZ", "AXN000036097", 23, "Comercio Norte", 43960, "13/11/2026 11:16"],
  ["35920471", "VALENTINA SOL ROMERO", "AXN000036079", 23, "Comercio Norte", 59990, "13/11/2026 10:59"],
  ["22671038", "DIEGO HERNAN CASTRO", "AXN000036037", 12, "Comercio Sur", 42990, "13/11/2026 10:12"],
  ["41239856", "CAMILA ANDREA LUNA", "AXN000035980", 11, "Comercio Centro", 93970, "13/11/2026 09:38"],
  ["18556204", "ROBERTO CARLOS GIMENEZ", "AXN000035975", 11, "Comercio Centro", 73970, "13/11/2026 09:38"],
  ["38770215", "SOFIA BELEN AGUIRRE", "AXN000035973", 11, "Comercio Centro", 162960, "13/11/2026 09:38"],
  ["33402917", "NICOLAS EZEQUIEL VEGA", "AXN000035972", 12, "Comercio Sur", 32990, "13/11/2026 09:37"],
  ["29845630", "PAULA ANDREA MOLINA", "AXN000035958", 23, "Comercio Norte", 69990, "13/11/2026 09:37"],
  ["36218904", "LUCAS MATIAS HERRERA", "AXN000035959", 12, "Comercio Sur", 99980, "13/11/2026 09:37"],
  ["25103478", "GABRIELA INES ROJAS", "AXN000035957", 23, "Comercio Norte", 119990, "13/11/2026 09:36"],
];
const NUEVA: [string, string, string, number, string, number, string] = ["2845678", "JAVIER PEREZ", "AXN000036130", 11, "Comercio Centro", 850000, "13/11/2026 12:04"];
const COLS = [70, 180, 100, 40, 110, 80, 120, 90, 120, 70];
const CAB = ["DNI", "NOMBRE", "CÓDIGO", "SUC", "COMERCIO", "MONTO", "LIQUIDACIÓN", "ESTADO", "DOCUMENTOS", "ACCIONES"];

const Fila: React.FC<{ d: typeof NUEVA; i: number; t: number; nueva?: boolean; brillo?: number }> = ({ d, i, t, nueva, brillo = 0 }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      height: 34,
      padding: "0 14px",
      fontSize: 10.5,
      color: TINTA,
      background: nueva ? `rgba(30,138,76,${0.08 + brillo * 0.14})` : i % 2 ? "#f7f9fb" : "white",
      borderBottom: `1px solid ${BORDE}`,
      opacity: t,
      transform: `translateX(${(1 - t) * 30}px)`,
      fontWeight: nueva ? 700 : 500,
    }}
  >
    {[d[0], d[1], d[2], String(d[3]), d[4], pesos(d[5]), d[6]].map((v, k) => (
      <div key={k} style={{ width: COLS[k], whiteSpace: "nowrap", overflow: "hidden" }}>
        {v}
      </div>
    ))}
    <div style={{ width: COLS[7] }}>
      <span style={{ fontSize: 9.5, fontWeight: 700, color: VERDE, background: "#dcf3e3", borderRadius: 9, padding: "2px 8px" }}>✓ Liquidado</span>
    </div>
    <div style={{ width: COLS[8], display: "flex", gap: 4 }}>
      {["Contrato", "Perfil"].map((b) => (
        <span key={b} style={{ fontSize: 9.5, fontWeight: 700, color: "white", background: NAVY_2, borderRadius: 4, padding: "3px 7px" }}>
          {b}
        </span>
      ))}
    </div>
    <div style={{ width: COLS[9] }}>
      <span style={{ fontSize: 9.5, fontWeight: 700, color: "white", background: NAVY_2, borderRadius: 4, padding: "4px 10px" }}>Detalle</span>
    </div>
  </div>
);

const Tesoreria: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const f0 = ESC.tesoreria[0];
  const nueva = spring({ frame: frame - f0 - 40, fps, config: { damping: 15 } });
  const brillo = interpolate(frame, [f0 + 40, f0 + 50, f0 + 110], [0, 1, 0.3], clamp);
  return (
    <div style={{ position: "absolute", left: SIDE, top: HEADER, right: 0, bottom: 0, background: "white" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 22, textAlign: "center", fontSize: 20, fontWeight: 700, color: TINTA }}>Préstamos Liquidados - Tesorería</div>
      <div style={{ position: "absolute", left: 24, right: 24, top: 62, height: 46, background: "#b9bec7", borderRadius: 8, display: "flex", alignItems: "center", gap: 7, padding: "0 14px" }}>
        {["Hoy", "Ayer", "Esta semana", "Semana anterior", "Este mes", "Mes anterior", "Todos"].map((b) => (
          <div key={b} style={{ fontSize: 10, fontWeight: 700, padding: "6px 10px", borderRadius: 7, background: b === "Hoy" ? NAVY_2 : "white", color: b === "Hoy" ? "white" : TINTA }}>
            {b}
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 10, color: TINTA }}>
          Desde <span style={{ background: "white", borderRadius: 5, padding: "5px 8px", marginLeft: 4 }}>13/11/2026</span>
        </div>
        <div style={{ fontSize: 10, color: TINTA }}>
          Hasta <span style={{ background: "white", borderRadius: 5, padding: "5px 8px", marginLeft: 4 }}>13/11/2026</span>
        </div>
        <div style={{ fontSize: 10, fontWeight: 700, padding: "6px 12px", borderRadius: 7, background: NAVY_2, color: "white" }}>Aplicar</div>
      </div>
      <div style={{ position: "absolute", left: 24, right: 24, top: 122, borderRadius: 8, overflow: "hidden", border: `1px solid ${BORDE}` }}>
        <div style={{ display: "flex", alignItems: "center", height: 36, padding: "0 14px", background: NAVY_2, color: "white", fontSize: 10, fontWeight: 700, letterSpacing: 0.5 }}>
          {CAB.map((c, k) => (
            <div key={c} style={{ width: COLS[k] }}>
              {c}
            </div>
          ))}
        </div>
        {nueva > 0.01 ? (
          <div style={{ height: 34 * nueva, overflow: "hidden" }}>
            <Fila d={NUEVA} i={0} t={nueva} nueva brillo={brillo} />
          </div>
        ) : null}
        {FILAS.map((d, i) => (
          <Fila key={d[2]} d={d} i={i} t={interpolate(frame, [f0 + 6 + i * 2, f0 + 14 + i * 2], [0, 1], clamp)} />
        ))}
      </div>
      {nueva > 0.01 ? (
        <div style={{ position: "absolute", right: 30, top: 20, background: "white", borderLeft: `4px solid ${VERDE}`, borderRadius: 8, boxShadow: "0 8px 20px rgba(20,30,50,0.18)", padding: "8px 14px", opacity: Math.min(1, nueva), transform: `translateY(${(1 - nueva) * -12}px)` }}>
          <div style={{ fontSize: 11.5, fontWeight: 800, color: VERDE }}>✓ Nueva liquidación</div>
          <div style={{ fontSize: 10, color: TINTA_2 }}>Javier Perez · {pesos(850000)}</div>
        </div>
      ) : null}
    </div>
  );
};

// ---------- Dashboard ----------
const Dashboard: React.FC<{ frame: number }> = ({ frame }) => {
  const f0 = ESC.dashboard[0];
  const c = (d: number, dur = 30) => interpolate(frame, [f0 + d, f0 + d + dur], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const OSC = "#0d1424";
  const PANEL = "#151d30";
  const LINEA = "#26314a";
  const KPIS: [string, number, string, string][] = [
    ["LEADS EVALUADOS", 2508, "", ""],
    ["APROBADOS", 1293, "Tasa aprob. 51,6%", ""],
    ["RECHAZADOS", 1215, "Tasa rechazo 48,4%", ""],
    ["CONCRETADOS", 465, "Tasa éxito 18,5%", ""],
    ["CONVERSIÓN DE APROBADOS", 36, "Concretados / Aprobados", "%"],
  ];
  const Barra: React.FC<{ k: string; v: number; p: number; d: number }> = ({ k, v, p, d }) => (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "#d6dde8" }}>
        <span>{k}</span>
        <span>
          <b style={{ color: "white" }}>{num(Math.round(v * c(d)))}</b> ({(p * 100).toFixed(1).replace(".", ",")}%)
        </span>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: LINEA, marginTop: 5 }}>
        <div style={{ width: `${p * 100 * c(d)}%`, height: "100%", borderRadius: 4, background: "#5b84b8" }} />
      </div>
    </div>
  );
  const Dona: React.FC<{ partes: [string, number, string][]; d: number }> = ({ partes, d }) => {
    let acc = 0;
    const R = 46;
    const L = 2 * Math.PI * R;
    return (
      <svg width={120} height={120} viewBox="0 0 120 120">
        {partes.map(([, v, col], i) => {
          const len = v * L * c(d, 40);
          const el = <circle key={i} cx={60} cy={60} r={R} fill="none" stroke={col} strokeWidth={22} strokeDasharray={`${len} ${L}`} strokeDashoffset={-acc * L * c(d, 40)} transform="rotate(-90 60 60)" />;
          acc += v;
          return el;
        })}
      </svg>
    );
  };
  const ABANDONO: [string, number, string][] = [
    ["Oferta", 0.744, "#5b84b8"],
    ["WhatsApp", 0.105, "#4f9c7a"],
    ["Verificar email", 0.076, "#8b74c4"],
    ["Fotos DNI/Selfie", 0.066, "#c98a4b"],
    ["Caducado", 0.009, "#b85b5b"],
  ];
  return (
    <div style={{ position: "absolute", left: SIDE, top: HEADER, right: 0, bottom: 0, background: OSC, color: "white" }}>
      <div style={{ position: "absolute", left: 20, right: 20, top: 12, height: 40, background: PANEL, borderRadius: 8, display: "flex", alignItems: "center", gap: 6, padding: "0 10px" }}>
        {["Hoy", "Ayer", "Esta semana", "Semana anterior", "Mes actual", "Mes anterior", "Este año", "Todo"].map((b) => (
          <div key={b} style={{ fontSize: 9.5, fontWeight: 700, padding: "5px 9px", borderRadius: 6, border: `1px solid ${b === "Mes actual" ? "#3b82f6" : LINEA}`, background: b === "Mes actual" ? "#2563eb" : "transparent" }}>
            {b}
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 9.5, color: "#aab3c0" }}>01/11/2026 – 13/11/2026</div>
        <div style={{ fontSize: 9.5, fontWeight: 700, padding: "5px 12px", borderRadius: 6, background: "#22a35a" }}>Aplicar</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 66, textAlign: "center", fontSize: 12.5, fontWeight: 700, letterSpacing: 0.5 }}>RESUMEN EJECUTIVO (KPI)</div>
      <div style={{ position: "absolute", left: 30, right: 30, top: 90, display: "flex", gap: 14 }}>
        {KPIS.map(([k, v, s, suf], i) => (
          <div key={k} style={{ flex: 1, height: 92, background: PANEL, borderRadius: 10, border: `1px solid ${LINEA}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, opacity: c(i * 3, 12) }}>
            <div style={{ fontSize: 9.5, letterSpacing: 0.6, color: "#aab3c0", textAlign: "center" }}>{k}</div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>
              {num(Math.round(v * c(6 + i * 3)))}
              {suf}
            </div>
            {s ? <div style={{ fontSize: 9.5, color: "#aab3c0" }}>{s}</div> : null}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 200, textAlign: "center", fontSize: 12.5, fontWeight: 700 }}>EMBUDO DE CONVERSIÓN</div>
      {[
        ["EVALUADOS → APROBADOS / RECHAZADOS", [["Leads totales", 2508, 1], ["Rechazados", 1215, 0.484], ["Aprobados", 1293, 0.516]]],
        ["APROBADOS → CONCRETADOS / ABANDONO", [["Aprobados", 1293, 1], ["Abandono", 828, 0.64], ["Concretados", 465, 0.36]]],
      ].map(([titulo, barras], j) => (
        <div key={titulo as string} style={{ position: "absolute", left: 30 + j * 552, top: 224, width: 522, height: 186, background: PANEL, borderRadius: 10, border: `1px solid ${LINEA}`, padding: "12px 20px", boxSizing: "border-box" }}>
          <div style={{ fontSize: 11, fontWeight: 700, textAlign: "center", borderBottom: `1px solid ${LINEA}`, paddingBottom: 8 }}>{titulo as string}</div>
          {(barras as [string, number, number][]).map(([k, v, p], i) => (
            <Barra key={k} k={k} v={v} p={p} d={20 + j * 6 + i * 5} />
          ))}
        </div>
      ))}
      <div style={{ position: "absolute", left: 0, right: 0, top: 424, textAlign: "center", fontSize: 12.5, fontWeight: 700 }}>MOTIVOS DE FUGA</div>
      <div style={{ position: "absolute", left: 30, top: 448, width: 522, height: 250, background: PANEL, borderRadius: 10, border: `1px solid ${LINEA}`, padding: "12px 20px", boxSizing: "border-box" }}>
        <div style={{ fontSize: 11, fontWeight: 700, textAlign: "center", borderBottom: `1px solid ${LINEA}`, paddingBottom: 8 }}>TOP MOTIVOS DE ABANDONO</div>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 14 }}>
          <Dona partes={ABANDONO} d={40} />
          <div style={{ flex: 1 }}>
            {ABANDONO.map(([k, v, col]) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10.5, marginTop: 7, color: "#d6dde8" }}>
                <div style={{ width: 9, height: 9, borderRadius: "50%", background: col }} />
                <span style={{ flex: 1 }}>{k}</span>
                <b style={{ color: "white" }}>{num(Math.round(828 * v * c(44)))}</b>
                <span style={{ width: 44, textAlign: "right" }}>({(v * 100).toFixed(1).replace(".", ",")}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 582, top: 448, width: 522, height: 250, background: PANEL, borderRadius: 10, border: `1px solid ${LINEA}`, padding: "12px 20px", boxSizing: "border-box" }}>
        <div style={{ fontSize: 11, fontWeight: 700, textAlign: "center", borderBottom: `1px solid ${LINEA}`, paddingBottom: 8 }}>MOTIVOS DE RECHAZO</div>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 14 }}>
          <Dona
            partes={[
              ["Política del motor", 0.82, "#5b84b8"],
              ["Score insuficiente", 0.12, "#8b74c4"],
              ["Validación de identidad", 0.06, "#c98a4b"],
            ]}
            d={48}
          />
          <div style={{ flex: 1 }}>
            {(
              [
                ["Política del motor", 0.82, "#5b84b8"],
                ["Score insuficiente", 0.12, "#8b74c4"],
                ["Validación de identidad", 0.06, "#c98a4b"],
              ] as [string, number, string][]
            ).map(([k, v, col]) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10.5, marginTop: 9, color: "#d6dde8" }}>
                <div style={{ width: 9, height: 9, borderRadius: "50%", background: col }} />
                <span style={{ flex: 1 }}>{k}</span>
                <b style={{ color: "white" }}>{num(Math.round(1215 * v * c(52)))}</b>
                <span style={{ width: 44, textAlign: "right" }}>({(v * 100).toFixed(0)}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- Page ----------
const DEDO: [number, number, number][] = [
  [0, 700, 700],
  [TAP_CERRAR - 2, MOD.x + MOD.w - 34, MOD.y + 30],
  [TAP_TESORERIA - 2, SIDE + HOME.col[2] + 150, HEADER + HOME.fila[0] + 35],
  [TAP_DASH - 2, SIDE / 2, HEADER + 22 + 5 * 42 + 9],
  [TAP_DASH + 40, 640, 700],
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
    ["config", Configuracion],
    ["home", Home],
    ["tesoreria", Tesoreria],
    ["dashboard", Dashboard],
  ];
  const actual = (Object.keys(ESC) as Escena[]).filter((e) => frame >= ESC[e][0]).pop() ?? "config";
  const dedo = posDedo(frame);
  const tap = TAPS.find((f) => frame >= f && frame < f + 16);
  const onda = tap === undefined ? 0 : (frame - tap) / 16;
  const presion = tap === undefined ? 0 : interpolate(frame - tap, [0, 3, 8], [0, 1, 0], clamp);
  const dedoVis =
    interpolate(frame, [100, 114], [0, 1], clamp) *
    interpolate(frame, [TAP_CERRAR + 24, TAP_CERRAR + 34, TAP_TESORERIA - 30, TAP_TESORERIA - 18], [1, 0, 0, 1], clamp) *
    interpolate(frame, [TAP_DASH + 30, TAP_DASH + 44], [1, 0], clamp);
  return (
    <div style={{ position: "relative", width: PW, height: PH, background: NAVY, fontFamily: FUENTE, overflow: "hidden" }}>
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
      {/* Header */}
      <div style={{ position: "absolute", left: 0, top: 0, width: PW, height: HEADER, background: NAVY, display: "flex", alignItems: "center", zIndex: 5 }}>
        <div style={{ marginLeft: 18 }}>
          <Logo w={96} />
        </div>
        <div style={{ marginLeft: 26 }}>
          <Icono d="M4 11 L12 4 L20 11 V20 H14 V14 H10 V20 H4 Z" s={17} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, textAlign: "center", fontSize: 11, fontWeight: 700, letterSpacing: 0.8, color: "white" }}>{TITULOS[actual]}</div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 22 }}>
          <div style={{ width: 22, height: 22, borderRadius: "50%", border: "1.8px solid white", color: "white", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>?</div>
          <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#cfd6e0" }} />
          <div style={{ fontSize: 11, fontWeight: 700, color: "white" }}>Delfina Martinez - DMARTINEZ</div>
        </div>
      </div>
      {/* Sidebar */}
      <div style={{ position: "absolute", left: 0, top: HEADER, width: SIDE, bottom: 0, background: "#16181d", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 22, gap: 24, zIndex: 5 }}>
        {ICONOS_SIDE.map((d, i) => (
          <div key={i} style={{ transform: `scale(${i === 5 ? 1 - pulsado(frame, TAP_DASH) * 0.2 : 1})` }}>
            <Icono d={d} s={18} c={i === ACTIVO[actual] ? "#FF8C42" : "#e5e7eb"} />
          </div>
        ))}
      </div>
      {tap !== undefined ? (
        <div style={{ position: "absolute", left: dedo.x, top: dedo.y, width: 18 + onda * 54, height: 18 + onda * 54, transform: "translate(-50%, -50%)", borderRadius: "50%", border: `3px solid rgba(255,140,66,${1 - onda})`, background: `rgba(255,140,66,${(1 - onda) * 0.2})`, zIndex: 8 }} />
      ) : null}
      <div
        style={{
          position: "absolute",
          left: dedo.x,
          top: dedo.y,
          width: 36,
          height: 36,
          transform: `translate(-50%, -50%) scale(${1 - presion * 0.2})`,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.55)",
          border: "2px solid rgba(40,48,64,0.35)",
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          opacity: dedoVis * 0.9,
          zIndex: 9,
        }}
      />
    </div>
  );
};

export const BackOffice: React.FC<z.infer<typeof backOfficeSchema>> = ({ fondo, paleta }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const { w, h } = pantallaDe("tablet", false);
  const { W: EW, H: EH } = exteriorDe("tablet", w, h);
  const esc = Math.min((width * 0.86) / EW, (height * 0.9) / EH);
  const t = spring({ frame, fps, config: { damping: 18, stiffness: 80 } });
  return (
    <AbsoluteFill style={{ fontFamily: FUENTE }}>
      <FondoAbstracto paleta={paleta} estilo={fondo} />
      {/* Straight tablet, fixed in place */}
      <div style={{ position: "absolute", left: width / 2, top: height / 2, opacity: t, transform: `translate(-50%, -50%) scale(${esc})` }}>
        <Dispositivo tipo="tablet" w={w} h={h}>
          <Pagina frame={frame} />
        </Dispositivo>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 9:16 version: the same back office as a mobile app on a phone ----------
const MW = 390;
const MH = 844;
const M_HEADER = 92;
const M_NAV = 64;
const TABS: [string, string, Escena | null][] = [
  ["Inicio", ICONOS_SIDE[0], "home"],
  ["Tesorería", I_BANCO, "tesoreria"],
  ["Dashboard", ICONOS_SIDE[5], "dashboard"],
  ["Ajustes", ICONOS_SIDE[8], "config"],
];

const ConfigMovil: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const hoja = spring({ frame: frame - 8, fps, config: { damping: 18, stiffness: 120 } });
  const cierre = interpolate(frame, [TAP_CERRAR + 2, TAP_CERRAR + 12], [0, 1], clamp);
  const v = hoja * (1 - cierre);
  const N: Record<string, { x: number; y: number }> = {
    entrada: { x: 20, y: 220 },
    observados: { x: 200, y: 220 },
    tesoreria: { x: 110, y: 380 },
    noEntregados: { x: 110, y: 480 },
    caducados: { x: 110, y: 580 },
  };
  const NW = 160;
  const NH = 56;
  const L: { d: string; tipo: "manual" | "auto" | "caducidad" }[] = [
    { d: "M 180 248 L 200 248", tipo: "manual" },
    { d: "M 100 276 C 100 330 150 340 170 380", tipo: "manual" },
    { d: "M 280 276 C 280 330 230 340 210 380", tipo: "manual" },
    { d: "M 300 276 C 340 340 320 470 270 508", tipo: "manual" },
    { d: "M 320 270 C 370 360 360 560 270 608", tipo: "manual" },
    { d: "M 180 256 C 186 258 194 258 200 256", tipo: "auto" },
    { d: "M 60 276 C 40 420 50 560 110 608", tipo: "caducidad" },
  ];
  return (
    <div style={{ position: "absolute", left: 0, top: M_HEADER, width: MW, height: MH - M_HEADER - M_NAV, background: "#f4f6f9" }}>
      <div style={{ position: "absolute", left: 16, top: 18, fontSize: 20, fontWeight: 800, color: TINTA }}>Configuración</div>
      {["Estados del flujo", "Transiciones", "Caducidad", "Notificaciones"].map((t, i) => (
        <div key={t} style={{ position: "absolute", left: 12, right: 12, top: 60 + i * 58, height: 48, background: "white", borderRadius: 10, border: `1px solid ${BORDE}`, display: "flex", alignItems: "center", padding: "0 14px", fontSize: 12.5, fontWeight: 700, color: TINTA }}>
          {t}
        </div>
      ))}
      {v > 0.001 ? (
        <>
          <div style={{ position: "absolute", inset: 0, background: `rgba(30,34,42,${0.5 * v})` }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 10, bottom: 0, background: "white", borderRadius: "16px 16px 0 0", transform: `translateY(${(1 - v) * 700}px)`, overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 18, top: 16, fontSize: 15, fontWeight: 800, color: TINTA }}>Visualización del flujo</div>
            <div style={{ position: "absolute", left: 18, right: 50, top: 38, fontSize: 10, color: TINTA_2, lineHeight: 1.4 }}>Tocá un estado para ver hacia dónde puede avanzar el prospecto.</div>
            <div style={{ position: "absolute", right: 14, top: 12, width: 30, height: 30, borderRadius: 7, fontSize: 22, color: TINTA_2, display: "flex", alignItems: "center", justifyContent: "center", background: pulsado(frame, TAP_CERRAR) > 0 ? "#eef1f5" : "transparent" }}>×</div>
            <div style={{ position: "absolute", left: 18, top: 78, display: "flex", gap: 12, fontSize: 9.5, color: TINTA_2 }}>
              {[
                ["Manual", "#9aa3b2", "4 3"],
                ["Automático", AZUL, "5 3"],
                ["Caducidad", NARANJA, ""],
              ].map(([t, c, dash]) => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <svg width={18} height={6}>
                    <line x1={0} y1={3} x2={18} y2={3} stroke={c} strokeWidth={2} strokeDasharray={dash} />
                  </svg>
                  {t}
                </div>
              ))}
            </div>
            {[
              ["ENTRADA E INTERMEDIOS", 180],
              ["FINALES", 340],
            ].map(([t, y]) => (
              <div key={t as string} style={{ position: "absolute", left: 18, right: 18, top: y as number, fontSize: 9.5, fontWeight: 800, letterSpacing: 1.2, color: TINTA_2, borderBottom: `1.5px solid ${BORDE}`, paddingBottom: 6 }}>
                {t}
              </div>
            ))}
            <svg width={MW} height={700} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
              {L.map((f, i) => {
                const op = interpolate(frame, [40 + i * 6, 56 + i * 6], [0, 1], clamp);
                const color = f.tipo === "auto" ? AZUL : f.tipo === "caducidad" ? NARANJA : "#9aa3b2";
                return (
                  <g key={i} opacity={op}>
                    <path d={f.d} fill="none" stroke={color} strokeWidth={f.tipo === "caducidad" ? 2 : 1.6} strokeDasharray={f.tipo === "caducidad" ? undefined : f.tipo === "auto" ? "6 4" : "4 4"} />
                  </g>
                );
              })}
              <text x={18} y={470} fontSize={10} fontWeight={700} fill={NARANJA} fontFamily="Montserrat" opacity={interpolate(frame, [76, 90], [0, 1], clamp)}>
                1200 min
              </text>
            </svg>
            {NODOS.map((n, i) => {
              const p = N[n.id];
              const t = spring({ frame: frame - 20 - i * 5, fps, config: { damping: 15 } });
              return (
                <div key={n.id} style={{ position: "absolute", left: p.x, top: p.y, width: NW, height: NH, borderRadius: 8, background: "#e9ecf0", border: "1px solid #cfd5dd", boxShadow: "0 3px 8px rgba(20,30,50,0.1)", display: "flex", alignItems: "center", gap: 10, padding: "0 10px", boxSizing: "border-box", opacity: t, transform: `scale(${0.85 + 0.15 * t})` }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: n.fondo, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icono d={n.icono} s={15} c={n.color} />
                  </div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: TINTA, lineHeight: 1.2 }}>{n.nombre}</div>
                </div>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
};

// Home: stacked cards, the route runs down the right gutter.
const MC = { x: 16, w: 300, h: 64, y: { entrada: 170, observados: 250, tesoreria: 360, noEntregados: 440, caducados: 520 } as Record<string, number> };
const MQ0 = { x: MC.x + MC.w, y: MC.y.entrada + 32 };
const MQ1 = { x: 380, y: MC.y.entrada + 40 };
const MQ2 = { x: 380, y: MC.y.tesoreria + 24 };
const MQ3 = { x: MC.x + MC.w, y: MC.y.tesoreria + 32 };
const bezierMovil = (t: number) => {
  const u = 1 - t;
  const f = (a: number, b: number, c: number, d: number) => u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
  return { x: f(MQ0.x, MQ1.x, MQ2.x, MQ3.x), y: f(MQ0.y, MQ1.y, MQ2.y, MQ3.y) };
};
const CAMINO_MOVIL = `M ${MQ0.x} ${MQ0.y} C ${MQ1.x} ${MQ1.y} ${MQ2.x} ${MQ2.y} ${MQ3.x} ${MQ3.y}`;

const HomeMovil: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const f0 = ESC.home[0];
  const linea = interpolate(frame, [VIAJE[0] - 14, VIAJE[0] + 6], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const t = interpolate(frame, VIAJE, [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const sale = interpolate(frame, [VIAJE[0] - 8, VIAJE[0]], [0, 1], clamp);
  const entra = interpolate(frame, [VIAJE[1] - 6, LLEGA], [1, 0], clamp);
  const pos = bezierMovil(t);
  const check = spring({ frame: frame - LLEGA, fps, config: { damping: 11, stiffness: 160 } });
  const llegado = frame >= LLEGA;
  const desvanece = interpolate(frame, [LLEGA + 30, LLEGA + 46], [1, 0], clamp);
  const casos: Record<string, number> = { entrada: frame >= VIAJE[0] ? 15 : 16, observados: 0, tesoreria: llegado ? 6392 : 6391, noEntregados: 0, caducados: 43 };
  return (
    <div style={{ position: "absolute", left: 0, top: M_HEADER, width: MW, height: MH - M_HEADER - M_NAV, background: "white" }}>
      <div style={{ position: "absolute", left: 16, top: 16, fontSize: 20, fontWeight: 800, color: TINTA }}>Back Office</div>
      <div style={{ position: "absolute", right: 14, top: 14, background: NAVY_2, color: "white", fontSize: 10.5, fontWeight: 700, borderRadius: 7, padding: "7px 10px" }}>Buscar cliente</div>
      <div style={{ position: "absolute", left: 12, right: 12, top: 60, height: 40, background: "#b9bec7", borderRadius: 8, display: "flex", alignItems: "center", gap: 6, padding: "0 8px" }}>
        {["Hoy", "Ayer", "Semana", "Mes", "Todos"].map((b) => (
          <div key={b} style={{ fontSize: 10, fontWeight: 700, padding: "6px 9px", borderRadius: 7, background: b === "Todos" ? NAVY_2 : "white", color: b === "Todos" ? "white" : TINTA }}>
            {b}
          </div>
        ))}
      </div>
      {[
        ["ENTRADA E INTERMEDIOS", 140],
        ["FINALES", 330],
      ].map(([tx, y]) => (
        <div key={tx as string} style={{ position: "absolute", left: 16, right: 16, top: y as number, fontSize: 9.5, fontWeight: 800, letterSpacing: 1.2, color: TINTA_2 }}>
          {tx}
        </div>
      ))}
      <svg width={MW} height={700} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <path d={CAMINO_MOVIL} fill="none" stroke={VERDE} strokeWidth={3} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - linea} opacity={0.9 * desvanece} />
        <path d={CAMINO_MOVIL} fill="none" stroke={VERDE} strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - linea} opacity={0.15 * desvanece} />
      </svg>
      {NODOS.map((n, i) => {
        const tt = spring({ frame: frame - f0 - 4 - i * 4, fps, config: { damping: 15 } });
        const meta = n.id === "tesoreria";
        const latido = meta ? interpolate(frame, [LLEGA, LLEGA + 6, LLEGA + 18], [0, 1, 0], clamp) : 0;
        return (
          <div
            key={n.id}
            style={{
              position: "absolute",
              left: MC.x,
              top: MC.y[n.id],
              width: MC.w,
              height: MC.h,
              borderRadius: 9,
              background: "#262729",
              color: "white",
              display: "flex",
              alignItems: "center",
              padding: "0 14px",
              boxSizing: "border-box",
              gap: 12,
              opacity: tt,
              transform: `scale(${(0.9 + 0.1 * tt) * (1 + latido * 0.04) * (meta ? 1 - pulsado(frame, TAP_TESORERIA) * 0.04 : 1)})`,
              boxShadow: meta && llegado ? `0 0 0 ${3 + latido * 4}px rgba(30,138,76,${0.5 * desvanece + 0.15})` : "0 4px 10px rgba(0,0,0,0.15)",
            }}
          >
            <Icono d={n.icono} s={18} />
            <div style={{ flex: 1, fontSize: 11, fontWeight: 700 }}>{n.nombre}</div>
            <div style={{ fontSize: 10, color: "#d6d9de" }}>
              Casos: <b style={{ color: "white" }}>{num(casos[n.id])}</b>
            </div>
          </div>
        );
      })}
      {sale > 0 && entra > 0 ? (
        <div style={{ position: "absolute", left: pos.x, top: pos.y, transform: `translate(-50%, -50%) scale(${(0.5 + 0.35 * sale) * (0.3 + 0.7 * entra)})`, opacity: Math.min(sale, entra), zIndex: 3, filter: "drop-shadow(0 6px 8px rgba(0,0,0,0.3))" }}>
          <svg width={64} height={52} viewBox="0 0 64 52">
            <path d="M3 8 C3 5 5 3 8 3 H24 L30 9 H56 C59 9 61 11 61 14 V44 C61 47 59 49 56 49 H8 C5 49 3 47 3 44 Z" fill="#f5b942" />
            <rect x={12} y={12} width={40} height={30} rx={2} fill="white" />
            <path d="M3 18 H61 V44 C61 47 59 49 56 49 H8 C5 49 3 47 3 44 Z" fill="#f7c55c" />
            <text x={32} y={39} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={9} fill="#8a5a12">
              J. PEREZ
            </text>
          </svg>
        </div>
      ) : null}
      {check > 0.01 ? (
        <>
          <div style={{ position: "absolute", left: MC.x + MC.w - 16, top: MC.y.tesoreria - 14, width: 32, height: 32, borderRadius: "50%", background: VERDE, color: "white", fontSize: 18, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${check})`, boxShadow: "0 6px 14px rgba(30,138,76,0.45)", zIndex: 4 }}>✓</div>
          <div style={{ position: "absolute", left: 16, right: 16, top: 610, background: "#eef8f1", border: "1px solid #b9e0c8", borderRadius: 10, padding: "10px 14px", fontSize: 11.5, fontWeight: 700, color: VERDE, opacity: Math.min(1, check) }}>
            ✓ Operación dada de alta · Javier Perez
          </div>
        </>
      ) : null}
    </div>
  );
};

const TesoreriaMovil: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const f0 = ESC.tesoreria[0];
  const nueva = spring({ frame: frame - f0 - 40, fps, config: { damping: 15 } });
  const brillo = interpolate(frame, [f0 + 40, f0 + 50, f0 + 110], [0, 1, 0.3], clamp);
  const Tarjeta: React.FC<{ d: typeof NUEVA; t: number; destacada?: boolean }> = ({ d, t, destacada }) => (
    <div style={{ height: 66, marginBottom: 8, background: destacada ? `rgba(30,138,76,${0.08 + brillo * 0.12})` : "white", border: `1px solid ${destacada ? "#b9e0c8" : BORDE}`, borderRadius: 10, padding: "8px 12px", boxSizing: "border-box", opacity: t, transform: `translateX(${(1 - t) * 24}px)` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 11.5, fontWeight: 800, color: TINTA }}>{d[1]}</div>
        <div style={{ fontSize: 12, fontWeight: 800, color: TINTA }}>{pesos(d[5])}</div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
        <div style={{ fontSize: 9.5, color: TINTA_2 }}>
          DNI {d[0]} · {d[2]} · {d[6].slice(11)}
        </div>
        <span style={{ fontSize: 9, fontWeight: 700, color: VERDE, background: "#dcf3e3", borderRadius: 9, padding: "2px 7px" }}>✓ Liquidado</span>
      </div>
    </div>
  );
  return (
    <div style={{ position: "absolute", left: 0, top: M_HEADER, width: MW, height: MH - M_HEADER - M_NAV, background: "#f4f6f9", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 16, top: 14, fontSize: 18, fontWeight: 800, color: TINTA }}>Préstamos liquidados</div>
      <div style={{ position: "absolute", left: 16, top: 38, fontSize: 11, color: TINTA_2 }}>Tesorería · Hoy 13/11/2026</div>
      <div style={{ position: "absolute", left: 12, right: 12, top: 62, display: "flex", gap: 6 }}>
        {["Hoy", "Ayer", "Semana", "Mes", "Todos"].map((b) => (
          <div key={b} style={{ fontSize: 10, fontWeight: 700, padding: "6px 10px", borderRadius: 14, background: b === "Hoy" ? NAVY_2 : "white", color: b === "Hoy" ? "white" : TINTA, border: `1px solid ${b === "Hoy" ? NAVY_2 : BORDE}` }}>
            {b}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 12, right: 12, top: 104 }}>
        {nueva > 0.01 ? (
          <div style={{ height: 74 * nueva, overflow: "hidden" }}>
            <Tarjeta d={NUEVA} t={nueva} destacada />
          </div>
        ) : null}
        {FILAS.slice(0, 8).map((d, i) => (
          <Tarjeta key={d[2]} d={d} t={interpolate(frame, [f0 + 6 + i * 3, f0 + 14 + i * 3], [0, 1], clamp)} />
        ))}
      </div>
    </div>
  );
};

const DashboardMovil: React.FC<{ frame: number }> = ({ frame }) => {
  const f0 = ESC.dashboard[0];
  const c = (d: number, dur = 30) => interpolate(frame, [f0 + d, f0 + d + dur], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const PANEL = "#151d30";
  const LINEA = "#26314a";
  const KPIS: [string, number, string][] = [
    ["EVALUADOS", 2508, ""],
    ["APROBADOS", 1293, "51,6%"],
    ["RECHAZADOS", 1215, "48,4%"],
    ["CONCRETADOS", 465, "18,5%"],
  ];
  const ABANDONO: [string, number, string][] = [
    ["Oferta", 0.744, "#5b84b8"],
    ["WhatsApp", 0.105, "#4f9c7a"],
    ["Verificar email", 0.076, "#8b74c4"],
    ["Fotos DNI/Selfie", 0.066, "#c98a4b"],
    ["Caducado", 0.009, "#b85b5b"],
  ];
  const R = 40;
  const LL = 2 * Math.PI * R;
  let acc = 0;
  return (
    <div style={{ position: "absolute", left: 0, top: M_HEADER, width: MW, height: MH - M_HEADER - M_NAV, background: "#0d1424", color: "white", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 12, right: 12, top: 10, display: "flex", gap: 6 }}>
        {["Hoy", "Semana", "Mes actual", "Año"].map((b) => (
          <div key={b} style={{ fontSize: 9.5, fontWeight: 700, padding: "5px 10px", borderRadius: 6, border: `1px solid ${b === "Mes actual" ? "#3b82f6" : LINEA}`, background: b === "Mes actual" ? "#2563eb" : "transparent" }}>
            {b}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 16, top: 46, fontSize: 11.5, fontWeight: 700 }}>RESUMEN EJECUTIVO</div>
      <div style={{ position: "absolute", left: 12, right: 12, top: 68, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {KPIS.map(([k, v, s], i) => (
          <div key={k} style={{ height: 66, background: PANEL, borderRadius: 10, border: `1px solid ${LINEA}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, opacity: c(i * 3, 12) }}>
            <div style={{ fontSize: 9, letterSpacing: 0.6, color: "#aab3c0" }}>{k}</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{num(Math.round(v * c(6 + i * 3)))}</div>
            {s ? <div style={{ fontSize: 9, color: "#aab3c0" }}>{s}</div> : null}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 12, right: 12, top: 222, height: 66, background: "linear-gradient(135deg, #1d4f8a, #123462)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", opacity: c(14, 12) }}>
        <div>
          <div style={{ fontSize: 9.5, color: "#c9d8ee", letterSpacing: 0.6 }}>CONVERSIÓN DE APROBADOS</div>
          <div style={{ fontSize: 9.5, color: "#c9d8ee" }}>Concretados / Aprobados</div>
        </div>
        <div style={{ fontSize: 26, fontWeight: 800 }}>{Math.round(36 * c(18))}%</div>
      </div>
      <div style={{ position: "absolute", left: 12, right: 12, top: 300, background: PANEL, borderRadius: 10, border: `1px solid ${LINEA}`, padding: "10px 14px", boxSizing: "border-box" }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, textAlign: "center", borderBottom: `1px solid ${LINEA}`, paddingBottom: 6 }}>EMBUDO DE CONVERSIÓN</div>
        {(
          [
            ["Leads totales", 2508, 1],
            ["Aprobados", 1293, 0.516],
            ["Concretados", 465, 0.185],
          ] as [string, number, number][]
        ).map(([k, v, p], i) => (
          <div key={k} style={{ marginTop: 9 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#d6dde8" }}>
              <span>{k}</span>
              <b style={{ color: "white" }}>{num(Math.round(v * c(20 + i * 5)))}</b>
            </div>
            <div style={{ height: 7, borderRadius: 4, background: LINEA, marginTop: 4 }}>
              <div style={{ width: `${p * 100 * c(20 + i * 5)}%`, height: "100%", borderRadius: 4, background: "#5b84b8" }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 12, right: 12, top: 456, background: PANEL, borderRadius: 10, border: `1px solid ${LINEA}`, padding: "10px 14px", boxSizing: "border-box" }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, textAlign: "center", borderBottom: `1px solid ${LINEA}`, paddingBottom: 6 }}>MOTIVOS DE ABANDONO</div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 8 }}>
          <svg width={104} height={104} viewBox="0 0 104 104">
            {ABANDONO.map(([, v, col], i) => {
              const len = v * LL * c(40, 40);
              const el = <circle key={i} cx={52} cy={52} r={R} fill="none" stroke={col} strokeWidth={18} strokeDasharray={`${len} ${LL}`} strokeDashoffset={-acc * LL * c(40, 40)} transform="rotate(-90 52 52)" />;
              acc += v;
              return el;
            })}
          </svg>
          <div style={{ flex: 1 }}>
            {ABANDONO.map(([k, v, col]) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 9.5, marginTop: 5, color: "#d6dde8" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: col }} />
                <span style={{ flex: 1 }}>{k}</span>
                <b style={{ color: "white" }}>{(v * 100).toFixed(1).replace(".", ",")}%</b>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const DEDO_MOVIL: [number, number, number][] = [
  [0, 300, 700],
  [TAP_CERRAR - 2, MW - 29, M_HEADER + 10 + 27],
  [TAP_TESORERIA - 2, 160, M_HEADER + MC.y.tesoreria + 32],
  [TAP_DASH - 2, 12 + (MW - 24) / 8 * 5, MH - M_NAV / 2 - 4],
  [TAP_DASH + 40, 300, 640],
];
const posDedoMovil = (frame: number) => {
  let p = { x: DEDO_MOVIL[0][1], y: DEDO_MOVIL[0][2] };
  for (let i = 1; i < DEDO_MOVIL.length; i++) {
    const [f, x, y] = DEDO_MOVIL[i];
    const desde = Math.max(DEDO_MOVIL[i - 1][0], f - 18);
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

const PaginaMovil: React.FC<{ frame: number }> = ({ frame }) => {
  const escenas: [Escena, React.FC<{ frame: number }>][] = [
    ["config", ConfigMovil],
    ["home", HomeMovil],
    ["tesoreria", TesoreriaMovil],
    ["dashboard", DashboardMovil],
  ];
  const actual = (Object.keys(ESC) as Escena[]).filter((e) => frame >= ESC[e][0]).pop() ?? "config";
  const oscuro = actual === "dashboard";
  const dedo = posDedoMovil(frame);
  const tap = TAPS.find((f) => frame >= f && frame < f + 16);
  const onda = tap === undefined ? 0 : (frame - tap) / 16;
  const presion = tap === undefined ? 0 : interpolate(frame - tap, [0, 3, 8], [0, 1, 0], clamp);
  const dedoVis =
    interpolate(frame, [100, 114], [0, 1], clamp) *
    interpolate(frame, [TAP_CERRAR + 24, TAP_CERRAR + 34, TAP_TESORERIA - 30, TAP_TESORERIA - 18], [1, 0, 0, 1], clamp) *
    interpolate(frame, [TAP_DASH + 30, TAP_DASH + 44], [1, 0], clamp);
  return (
    <div style={{ position: "relative", width: MW, height: MH, background: NAVY, fontFamily: FUENTE, overflow: "hidden" }}>
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
      {/* Header */}
      <div style={{ position: "absolute", left: 0, top: 0, width: MW, height: M_HEADER, background: NAVY, zIndex: 5 }}>
        <div style={{ position: "absolute", left: 16, top: 52 }}>
          <Logo w={92} />
        </div>
        <div style={{ position: "absolute", right: 16, top: 50, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: "white" }}>Delfina Martinez</div>
          <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#cfd6e0" }} />
        </div>
      </div>
      {/* Bottom tab bar */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: M_NAV, background: oscuro ? "#111827" : "white", borderTop: `1px solid ${oscuro ? "#26314a" : BORDE}`, display: "flex", zIndex: 5 }}>
        {TABS.map(([n, d, e], i) => {
          const sel = e === actual;
          return (
            <div key={n} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, paddingBottom: 6, transform: `scale(${i === 2 ? 1 - pulsado(frame, TAP_DASH) * 0.12 : 1})` }}>
              <Icono d={d} s={20} c={sel ? "#FF8C42" : oscuro ? "#9aa3b2" : "#6b7280"} />
              <div style={{ fontSize: 9.5, fontWeight: 700, color: sel ? "#FF8C42" : oscuro ? "#9aa3b2" : "#6b7280" }}>{n}</div>
            </div>
          );
        })}
      </div>
      {tap !== undefined ? (
        <div style={{ position: "absolute", left: dedo.x, top: dedo.y, width: 18 + onda * 50, height: 18 + onda * 50, transform: "translate(-50%, -50%)", borderRadius: "50%", border: `3px solid rgba(255,140,66,${1 - onda})`, background: `rgba(255,140,66,${(1 - onda) * 0.2})`, zIndex: 8 }} />
      ) : null}
      <div
        style={{
          position: "absolute",
          left: dedo.x,
          top: dedo.y,
          width: 34,
          height: 34,
          transform: `translate(-50%, -50%) scale(${1 - presion * 0.2})`,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.55)",
          border: "2px solid rgba(40,48,64,0.35)",
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          opacity: dedoVis * 0.9,
          zIndex: 9,
        }}
      />
    </div>
  );
};

export const BackOfficeMovil: React.FC<z.infer<typeof backOfficeSchema>> = ({ fondo, paleta }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const { w, h } = pantallaDe("celular", true);
  const { W: EW, H: EH } = exteriorDe("celular", w, h);
  const esc = Math.min((width * 0.88) / EW, (height * 0.84) / EH);
  const t = spring({ frame, fps, config: { damping: 18, stiffness: 80 } });
  return (
    <AbsoluteFill style={{ fontFamily: FUENTE }}>
      <FondoAbstracto paleta={paleta} estilo={fondo} />
      {/* Straight phone, fixed in place */}
      <div style={{ position: "absolute", left: width / 2, top: height / 2, opacity: t, transform: `translate(-50%, -50%) scale(${esc})` }}>
        <Dispositivo tipo="celular" w={w} h={h}>
          <PaginaMovil frame={frame} />
        </Dispositivo>
      </div>
    </AbsoluteFill>
  );
};
