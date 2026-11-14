import { createContext, useContext } from "react";
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

// Axonia Collections CRM (16:9 tablet or 9:16 phone, tilted and seen from
// the left, 35s): "Contenedores de Gestión" opens on the CRM home and
// "Cobranzas Clientes Activos" is picked, the S4 cluster's client cards
// appear, on Javier Perez's file a payment promise is registered, the 3D
// segmentation cube builds and ends with one card per segment, the
// extrajudicial portfolio is auto-assigned to three agencies, and it closes on
// the performance and reports dashboard.

export const collectionsSchema = z.object({
  fondo: z.enum(["ondas", "red", "aurora", "geometrico"]),
  paleta: z.enum(["azul", "gris"]),
});

export const COLLECTIONS_FRAMES = 1050;

const FUENTE = "Montserrat, sans-serif";
const HEADER_BG = "#3f4247";
const SIDE_BG = "#1c2130";
const AZUL = "#2f6fe0";
const AZUL_OSC = "#1e3a6e";
const TINTA = "#1f2430";
const TINTA_2 = "#6b7280";
const BORDE = "#e1e5ec";
const FONDO = "#f5f7fa";
const VERDE = "#2e9e4a";
const NARANJA = "#f08a2c";
const ACENTO = "#FF8C42";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Screens: tablet 1180 x 820 (header + sidebar) or phone 390 x 844.
const PW = 1180;
const PH = 820;
const HEADER = 48;
const SIDE = 46;
const X0 = SIDE + 28;
const CW = PW - X0 - 28;
const MW = 390;
const MH = 844;
const M_HEADER = 96;

// Timeline (frames).
const ESC = {
  home: [0, 100],
  cluster: [94, 230],
  cliente: [224, 460],
  cubo: [454, 640],
  asignacion: [634, 860],
  reportes: [854, COLLECTIONS_FRAMES + 10],
} as const;
type Escena = keyof typeof ESC;
const TAP_ACTIVOS = 70;
const TAP_JAVIER = 200;
const TAP_SELECT = 270;
const TAP_PROMESA = 294;
const TIPEO = [310, 338];
const TAP_GUARDAR = 356;
const TAP_AUTO = 684;
const TAP_PREVIEW = 724;
const REPARTO = [728, 762];
const TAP_CONFIRMAR = 800;
const TAPS = [TAP_ACTIVOS, TAP_JAVIER, TAP_SELECT, TAP_PROMESA, TAP_GUARDAR, TAP_AUTO, TAP_PREVIEW, TAP_CONFIRMAR];

// Elements that the dynamic version lifts out of the screen are hidden in the
// page while their copy flies outside it.
const Ocultos = createContext<(id: string) => boolean>(() => false);

const pulsado = (frame: number, f: number) => interpolate(frame, [f, f + 4, f + 12], [0, 1, 0], clamp);
const entra = (frame: number, f: number, d = 10) => interpolate(frame, [f, f + d], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });

// ---------- Shared pieces ----------
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
const I_CASA = "M4 11 L12 4 L20 11 V20 H14 V14 H10 V20 H4 Z";
const I_AURI = "M4 14 V12 A8 8 0 0 1 20 12 V14 M4 14 H7 V19 H4 Z M20 14 H17 V19 H20 Z";
const I_USUARIO = "M12 4 A4 4 0 1 1 12 12 A4 4 0 1 1 12 4 M4 21 C5 15 19 15 20 21";
const I_ORGANIGRAMA = "M9 3 H15 V8 H9 Z M3 16 H9 V21 H3 Z M15 16 H21 V21 H15 Z M12 8 V12 M6 16 V12 H18 V16";
const I_DOC = "M6 3 H14 L18 7 V21 H6 Z M14 3 V7 H18 M9 12 H15 M9 16 H15";
const I_ENGRANAJE = "M12 8 A4 4 0 1 1 12 16 A4 4 0 1 1 12 8 M12 2 V5 M12 19 V22 M2 12 H5 M19 12 H22";
const I_SALIR = "M14 4 H20 V20 H14 M10 8 L6 12 L10 16 M6 12 H16";
const I_CARPETA = "M3 6 H10 L12 8 H21 V19 H3 Z";
const I_TEL = "M5 4 H9 L11 9 L8.5 10.5 C9.5 12.5 11.5 14.5 13.5 15.5 L15 13 L20 15 V19 C20 20 19 21 18 21 C10 20 4 14 3 6 C3 5 4 4 5 4 Z";
const I_MAIL = "M3 6 H21 V18 H3 Z M3 6 L12 13 L21 6";
const I_WA = "M4 20 L5.5 16 A8 8 0 1 1 8 18.5 Z M9 9 C9 12 12 15 15 15";
const I_CHAT = "M4 5 H20 V16 H9 L5 20 V16 H4 Z";
const I_BOT = "M6 9 H18 V19 H6 Z M12 5 V9 M9 13 V14 M15 13 V14 M3 13 V16 M21 13 V16";
const I_RELOJ = "M12 4 A8 8 0 1 1 12 20 A8 8 0 1 1 12 4 M12 8 V12 L15 14";
const I_GUARDAR = "M5 4 H16 L20 8 V20 H5 Z M8 4 V9 H15 V4 M8 20 V14 H16 V20";
const I_FLECHA_IZQ = "M19 12 H5 M11 6 L5 12 L11 18";
const I_SIGUIENTE = "M5 12 H19 M13 6 L19 12 L13 18";
const I_LLAMADA = "M8 6 C5 9 5 15 8 18 M16 6 C19 9 19 15 16 18 M11 9 C10 10.5 10 13.5 11 15 M13 9 C14 10.5 14 13.5 13 15";

const I_LUPA = "M10 4 A6 6 0 1 1 10 16 A6 6 0 1 1 10 4 M15 15 L20 20";
const I_CHART = "M4 20 V10 M10 20 V4 M16 20 V13 M22 20 H2";
const I_ESTRELLA = "M12 3 L14.6 8.6 L20.6 9.2 L16 13.3 L17.4 19.3 L12 16.2 L6.6 19.3 L8 13.3 L3.4 9.2 L9.4 8.6 Z";
const I_MANOS = "M3 11 L7 7 L11 9 L15 6 L21 11 L16 16 L12 13 L9 16 Z";
const I_BALANZA = "M12 4 V20 M7 20 H17 M5 7 H19 M5 7 L2 13 C3 15 7 15 8 13 Z M19 7 L16 13 C17 15 21 15 22 13 Z";
const SIDE_ICONOS = [I_CASA, I_AURI, I_USUARIO, I_ORGANIGRAMA, I_DOC, I_ENGRANAJE];

// Tablet header + sidebar around the content.
const MarcoTablet: React.FC<{ activo: number }> = ({ activo }) => (
  <>
    <div style={{ position: "absolute", left: 0, top: 0, width: PW, height: HEADER, background: HEADER_BG, display: "flex", alignItems: "center", zIndex: 6 }}>
      <div style={{ marginLeft: 18 }}>
        <Logo w={92} />
      </div>
      <div style={{ display: "flex", gap: 10, marginLeft: 30 }}>
        {[I_CARPETA, I_ENGRANAJE, "S4", I_DOC, I_LLAMADA].map((d, i) => (
          <div key={i} style={{ width: 26, height: 26, borderRadius: 6, background: i === 2 ? AZUL : "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "white" }}>
            {d === "S4" ? "S4" : <Icono d={d} s={14} c="#c9d4e6" />}
          </div>
        ))}
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 22 }}>
        <div style={{ width: 22, height: 22, borderRadius: "50%", border: "1.8px solid white", color: "white", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>?</div>
        <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#cfd6e0" }} />
        <div style={{ fontSize: 11, fontWeight: 700, color: "white" }}>Delfina Martinez - DMARTINEZ</div>
      </div>
    </div>
    <div style={{ position: "absolute", left: 0, top: HEADER, width: SIDE, bottom: 0, background: SIDE_BG, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 22, gap: 26, zIndex: 6 }}>
      {SIDE_ICONOS.map((d, i) => (
        <Icono key={i} d={d} s={17} c={i === activo ? ACENTO : "#e5e7eb"} />
      ))}
      <div style={{ width: 26, height: 1, background: "rgba(255,255,255,0.2)" }} />
      <Icono d={I_USUARIO} s={17} c="#e5e7eb" />
      <Icono d={I_SALIR} s={17} c="#e5e7eb" />
    </div>
  </>
);

const MarcoMovil: React.FC = () => (
  <div style={{ position: "absolute", left: 0, top: 0, width: MW, height: M_HEADER, background: HEADER_BG, zIndex: 6 }}>
    <div style={{ position: "absolute", left: 18, top: 52 }}>
      <Logo w={92} />
    </div>
    <div style={{ position: "absolute", right: 18, top: 50, display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: "white" }}>Delfina Martinez</div>
      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#cfd6e0" }} />
    </div>
  </div>
);

const Titulo: React.FC<{ x: number; y: number; s?: number; children: React.ReactNode }> = ({ x, y, s = 22, children }) => (
  <div style={{ position: "absolute", left: x, top: y, display: "flex", alignItems: "center", gap: 10 }}>
    <div style={{ width: 3, height: s + 4, background: TINTA }} />
    <div style={{ fontSize: s, fontWeight: 700, color: TINTA }}>{children}</div>
  </div>
);

// ---------- Home: CRM Cobranzas + "Contenedores de Gestión" modal ----------
const TARJETAS: [string, string, string][] = [
  [I_LUPA, "Buscar Clientes", "Búsqueda por DNI, nombre o número de crédito"],
  [I_CARPETA, "Contenedores de Gestión", "Carteras de trabajo por segmento"],
  [I_ORGANIGRAMA, "Asignaciones", "Distribución de la cartera entre gestores"],
  [I_ENGRANAJE, "Estrategia", "Reglas y acciones por segmento"],
  [I_CHART, "Reportes de Gestión", "Resultados y productividad del equipo"],
];
const HOME_T = { cols: 4, w: 254, h: 130, gap: 20, y: 138 };
const HOME_M = { cols: 2, w: 173, h: 128, gap: 12, y: 166 };
const tarjetaPos = (m: boolean, i: number) => {
  const L = m ? HOME_M : HOME_T;
  const x0 = m ? 16 : X0;
  return { x: x0 + (i % L.cols) * (L.w + L.gap), y: L.y + Math.floor(i / L.cols) * (L.h + (m ? 12 : 20)), w: L.w, h: L.h };
};
const MODAL_T = { x: 130, y: 280, w: 920, h: 250 };
const MODAL_M = { x: 20, y: 200, w: 350, h: 356 };
const OPCIONES: [string, string, string][] = [
  [I_LLAMADA, "Cobranzas Clientes Activos", "Gestión de clientes de cartera viva por segmentos"],
  [I_MANOS, "Mi Cartera Extrajudicial", "Gestionar mi cartera de clientes extrajudiciales asignada"],
  [I_BALANZA, "Mi Cartera Judicial", "Gestionar mi cartera de clientes judiciales asignada"],
];
const opcionPos = (m: boolean, i: number) =>
  m
    ? { x: MODAL_M.x + 14, y: MODAL_M.y + 64 + i * 92, w: MODAL_M.w - 28, h: 84 }
    : { x: MODAL_T.x + 26 + i * 289, y: MODAL_T.y + 70, w: 279, h: 150 };

const Home: React.FC<{ frame: number; m: boolean }> = ({ frame, m }) => {
  const modal = entra(frame, 4, 10);
  const M = m ? MODAL_M : MODAL_T;
  return (
    <div style={{ position: "absolute", inset: 0, background: FONDO }}>
      <div style={{ position: "absolute", inset: 0, filter: modal > 0 ? `blur(${modal * 3}px)` : undefined }}>
        <Titulo x={m ? 18 : X0} y={m ? 114 : 74} s={m ? 19 : 22}>
          CRM Cobranzas
        </Titulo>
        {TARJETAS.map(([d, t, s], i) => {
          const p = tarjetaPos(m, i);
          const e = 1;
          return (
            <div key={t} style={{ position: "absolute", left: p.x, top: p.y, width: p.w, height: p.h, background: "white", borderRadius: 12, border: `1px solid ${BORDE}`, boxShadow: "0 3px 10px rgba(15,25,45,0.06)", padding: m ? 14 : 18, boxSizing: "border-box", opacity: e, transform: `translateY(${(1 - e) * 14}px)` }}>
              <div style={{ width: 40, height: 40, borderRadius: 9, background: "#3a3d44", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icono d={d} s={20} />
              </div>
              <div style={{ fontSize: m ? 12.5 : 14, fontWeight: 800, color: TINTA, marginTop: 12 }}>{t}</div>
              <div style={{ fontSize: m ? 9.5 : 10.5, color: TINTA_2, marginTop: 4, lineHeight: 1.35 }}>{s}</div>
            </div>
          );
        })}
      </div>
      {modal > 0 ? (
        <>
          <div style={{ position: "absolute", inset: 0, background: `rgba(30,36,48,${modal * 0.35})` }} />
          <div style={{ position: "absolute", left: M.x, top: M.y, width: M.w, height: M.h, background: "white", borderRadius: 18, boxShadow: "0 30px 60px rgba(0,0,0,0.3)", opacity: modal, transform: `scale(${0.94 + 0.06 * modal})` }}>
            <div style={{ position: "absolute", left: m ? 18 : 26, top: m ? 20 : 26, fontSize: m ? 17 : 20, fontWeight: 700, color: AZUL_OSC }}>Contenedores de Gestión</div>
            <div style={{ position: "absolute", right: m ? 18 : 26, top: m ? 18 : 24, fontSize: 22, color: TINTA_2 }}>×</div>
          </div>
          {OPCIONES.map(([d, t, s], i) => {
            const p = opcionPos(m, i);
            const e = entra(frame, 10 + i * 3);
            const sel = i === 0 ? pulsado(frame, TAP_ACTIVOS) : 0;
            const hover = i === 0 ? interpolate(frame, [TAP_ACTIVOS - 12, TAP_ACTIVOS - 4], [0, 1], clamp) : 0;
            return (
              <div key={t} style={{ position: "absolute", left: p.x, top: p.y, width: p.w, height: p.h, borderRadius: 12, background: hover > 0 ? `rgba(47,111,224,${0.07 * hover})` : "white", border: `1.5px solid ${hover > 0 ? `rgba(47,111,224,${0.6 * hover})` : "transparent"}`, padding: m ? "12px 14px" : "16px 14px", boxSizing: "border-box", opacity: e * modal, transform: `scale(${1 - sel * 0.04})`, display: m ? "flex" : "block", gap: 12, alignItems: "center" }}>
                <div style={{ position: "absolute", right: 12, top: 10 }}>
                  <Icono d={I_ESTRELLA} s={13} c={TINTA} w={1.6} />
                </div>
                <div style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 9, background: "#3a3d44", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icono d={d} s={20} />
                </div>
                <div>
                  <div style={{ fontSize: m ? 13 : 15, fontWeight: 700, color: TINTA, marginTop: m ? 0 : 18 }}>{t}</div>
                  <div style={{ fontSize: m ? 9.5 : 10.5, color: TINTA_2, marginTop: 5, lineHeight: 1.4 }}>{s}</div>
                </div>
              </div>
            );
          })}
        </>
      ) : null}
    </div>
  );
};

// ---------- 3D segmentation cube ----------
type SegId = "S1" | "S2" | "S3" | "S4";
const SEGS: SegId[] = ["S1", "S2", "S3", "S4"];
const COLOR: Record<SegId, string> = { S1: "#2f6fe0", S2: "#2e9e4a", S3: "#f08a2c", S4: "#d9433a" };
// X: days past due, Y: score, Z: updated debt (three slabs, front to back).
const segDe = (x: number, y: number, z: number): SegId => {
  if (z === 0) {
    return y >= 3 || (y === 2 && x <= 1) ? "S4" : y >= 1 ? "S3" : "S2";
  }
  if (z === 1) {
    return y === 0 ? "S2" : "S1";
  }
  return "S1";
};
const VOXELES = Array.from({ length: 3 }).flatMap((_, z) =>
  Array.from({ length: 5 }).flatMap((__, y) => Array.from({ length: 5 }).map((___, x) => ({ x, y, z, seg: segDe(x, y, z) }))),
);
const CUENTA = SEGS.map((s) => VOXELES.filter((v) => v.seg === s).length);
const CUBO0 = ESC.cubo[0] + 10;

const aclarar = (hex: string, f: number) => {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(f >= 1 ? v + (255 - v) * (f - 1) : v * f));
  return `rgb(${c.join(",")})`;
};

const Cubo: React.FC<{ frame: number; L: number }> = ({ frame, L }) => {
  const giro = interpolate(frame, [CUBO0, ESC.cubo[1]], [-62, -30], clamp);
  return (
    <div style={{ position: "absolute", left: "50%", top: "50%", perspective: 1400 }}>
      <div style={{ transformStyle: "preserve-3d", transform: `rotateX(-16deg) rotateY(${giro}deg)` }}>
        {VOXELES.map(({ x, y, z, seg }) => {
          const a = interpolate(frame, [CUBO0 + y * 6 + (x + z) * 1.4, CUBO0 + y * 6 + (x + z) * 1.4 + 10], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.6)) });
          if (a <= 0) {
            return null;
          }
          const px = (x - 2) * L;
          const py = -(y - 2) * L - (1 - a) * L * 2;
          const pz = -(z - 1) * L * 1.7;
          const cara = (transform: string, f: number): React.CSSProperties => ({
            position: "absolute",
            width: L,
            height: L,
            left: -L / 2,
            top: -L / 2,
            background: aclarar(COLOR[seg], f),
            border: "1px solid rgba(0,0,0,0.2)",
            boxSizing: "border-box",
            transform,
            opacity: Math.min(1, a * 1.5),
          });
          return (
            <div key={`${x}${y}${z}`} style={{ position: "absolute", transformStyle: "preserve-3d", transform: `translate3d(${px}px, ${py}px, ${pz}px)` }}>
              <div style={cara(`translateZ(${L / 2}px)`, 1)} />
              <div style={cara(`rotateY(90deg) translateZ(${L / 2}px)`, 0.74)} />
              <div style={cara(`rotateY(-90deg) translateZ(${L / 2}px)`, 0.74)} />
              <div style={cara(`rotateX(90deg) translateZ(${L / 2}px)`, 1.22)} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CUBO_T = { x: X0, y: HEADER + 24, w: CW, h: 720, chipY: HEADER + 24 + 110, chipW: 138, chipGap: 12 };
const CUBO_M = { x: 10, y: 104, w: 370, h: 730, chipY: 224, chipW: 165, chipGap: 12 };
const chipPos = (m: boolean, i: number) =>
  m
    ? { x: CUBO_M.x + 14 + (i % 2) * (CUBO_M.chipW + CUBO_M.chipGap), y: CUBO_M.chipY + Math.floor(i / 2) * 40, w: CUBO_M.chipW, h: 32 }
    : { x: CUBO_T.x + 18 + i * (CUBO_T.chipW + CUBO_T.chipGap), y: CUBO_T.chipY, w: CUBO_T.chipW, h: 32 };

// Segment cards shown once the cube is built.
const SEG_INFO: Record<SegId, { nombre: string; perfil: string; clientes: number; accion: string }> = {
  S1: { nombre: "Mora preventiva", perfil: "0 a 10 días · al día o por vencer", clientes: 3120, accion: "Recordatorio WhatsApp" },
  S2: { nombre: "Riesgo bajo", perfil: "11 a 30 días de mora", clientes: 1845, accion: "Llamada con bot" },
  S3: { nombre: "Riesgo medio", perfil: "31 a 90 días de mora", clientes: 960, accion: "Gestor + refinanciación" },
  S4: { nombre: "Riesgo alto", perfil: "Más de 90 días de mora", clientes: 412, accion: "Agencia externa" },
};
const SEG_CARDS = CUBO0 + 70;
const segCardPos = (m: boolean, i: number) =>
  m ? { x: 24 + (i % 2) * 177, y: 632 + Math.floor(i / 2) * 88, w: 165, h: 82 } : { x: X0 + 18 + i * 262, y: 660, w: 250, h: 112 };

const SegCard: React.FC<{ frame: number; m: boolean; i: number; suelto?: boolean }> = ({ frame, m, i, suelto }) => {
  const oculto = useContext(Ocultos);
  if (!suelto && oculto(`seg${i}`)) {
    return null;
  }
  const s = SEGS[i];
  const p = segCardPos(m, i);
  const e = entra(frame, SEG_CARDS + i * 8, 14);
  const info = SEG_INFO[s];
  const n = Math.round(info.clientes * entra(frame, SEG_CARDS + i * 8, 30));
  return (
          <div style={{ position: "absolute", left: suelto ? 0 : p.x, top: suelto ? 0 : p.y, width: p.w, height: p.h, background: "white", borderRadius: 12, border: `1px solid ${BORDE}`, boxShadow: `0 10px 24px ${COLOR[s]}26`, overflow: "hidden", opacity: suelto ? 1 : e, transform: suelto ? undefined : `translateY(${(1 - e) * 30}px)`, boxSizing: "border-box", padding: m ? "9px 10px" : "12px 14px" }}>
            <div style={{ position: "absolute", left: 0, top: 0, right: 0, height: 4, background: COLOR[s] }} />
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{ width: 9, height: 9, borderRadius: "50%", background: COLOR[s] }} />
              <div style={{ fontSize: m ? 11 : 12.5, fontWeight: 800, color: TINTA }}>{info.nombre}</div>
            </div>
            {!m ? <div style={{ fontSize: 10, color: TINTA_2, marginTop: 3 }}>{info.perfil}</div> : null}
            <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginTop: m ? 4 : 6 }}>
              <div style={{ fontSize: m ? 16 : 20, fontWeight: 800, color: COLOR[s] }}>{n.toLocaleString("es-AR")}</div>
              <div style={{ fontSize: m ? 9 : 10.5, color: TINTA_2 }}>clientes</div>
            </div>
            <div style={{ display: "inline-block", marginTop: m ? 3 : 6, background: `${COLOR[s]}1a`, color: COLOR[s], fontSize: m ? 8 : 10, fontWeight: 700, borderRadius: 6, padding: "4px 8px", whiteSpace: "nowrap" }}>{info.accion}</div>
          </div>
          );
};

const CuboPantalla: React.FC<{ frame: number; m: boolean }> = ({ frame, m }) => {
  const C = m ? CUBO_M : CUBO_T;
  const area = m ? { y: 320, h: 308 } : { y: 232, h: 414 };
  return (
    <div style={{ position: "absolute", inset: 0, background: FONDO }}>
      <div style={{ position: "absolute", left: C.x, top: C.y, width: C.w, height: C.h, background: "white", borderRadius: 12, border: `1px solid ${BORDE}`, boxShadow: "0 8px 24px rgba(15,25,45,0.08)" }}>
        <div style={{ position: "absolute", left: 18, top: 16, fontSize: m ? 14 : 15, fontWeight: 700, color: TINTA }}>Vista 3D del cubo segmentado</div>
        <div style={{ position: "absolute", right: 18, top: 12, fontSize: 22, color: TINTA_2 }}>×</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 48, height: 1, background: BORDE }} />
        <div style={{ position: "absolute", left: 18, right: 18, top: 62, fontSize: m ? 9.5 : 10.5, color: TINTA_2, lineHeight: 1.45 }}>
          Cada cubito es una intersección X × Y × Z; el color indica el segmento asignado.
        </div>
        {!m ? (
          <div style={{ position: "absolute", right: 18, top: 110 }}>
            <div style={{ display: "inline-block", border: `1px solid ${BORDE}`, borderRadius: 6, padding: "4px 10px", fontSize: 10, color: TINTA }}>Reset rotación</div>
          </div>
        ) : null}
        <div style={{ position: "absolute", left: 18, right: 18, top: area.y - C.y, height: area.h, background: "#eef2f8", borderRadius: 10, border: `1px solid ${BORDE}` }}>
          <div style={{ position: "absolute", left: 12, top: 12, background: "white", border: `1px solid ${BORDE}`, borderRadius: 6, padding: "6px 10px", fontSize: m ? 8.5 : 9.5, color: TINTA, lineHeight: 1.6 }}>
            <div>X → Días de mora</div>
            <div>Y ↑ Score</div>
            <div>Z ◯ Saldo deuda actualizada</div>
          </div>
          <div style={{ position: "absolute", left: "50%", top: "54%" }}>
            <Cubo frame={frame} L={m ? 24 : 36} />
          </div>
        </div>
      </div>
      {SEGS.map((s, i) => {
        const p = chipPos(m, i);
        const n = Math.round(CUENTA[i] * interpolate(frame, [CUBO0 + 10, CUBO0 + 50], [0, 1], clamp));
        return (
          <div key={s} style={{ position: "absolute", left: p.x, top: p.y, width: p.w, height: p.h, borderRadius: 7, border: `1.5px solid ${BORDE}`, background: "white", display: "flex", alignItems: "center", gap: 8, padding: "0 10px", boxSizing: "border-box" }}>
            <div style={{ width: 13, height: 13, borderRadius: 3, background: COLOR[s] }} />
            <div style={{ fontSize: 11.5, fontWeight: 800, color: TINTA }}>{s}</div>
            <div style={{ fontSize: 10.5, color: TINTA_2 }}>{n} cubitos</div>
          </div>
        );
      })}
      {SEGS.map((_, i) => (
        <SegCard key={i} frame={frame} m={m} i={i} />
      ))}
    </div>
  );
};

// ---------- S4 cluster client cards ----------
type Cliente = { nombre: string; dni: string; dias: number; deuda: number; tel: string };
const CLIENTES: Cliente[] = [
  { nombre: "MARTA SUSANA GIMENEZ", dni: "27.481.903", dias: 3, deuda: 212480, tel: "11 XXXXX-4821" },
  { nombre: "JAVIER PEREZ", dni: "2.845.678", dias: 20, deuda: 200629, tel: "11 XXXXX-0123" },
  { nombre: "LUCAS DANIEL FERREYRA", dni: "35.902.114", dias: 35, deuda: 178350, tel: "351 XXXXX-772" },
  { nombre: "ANDREA NOEMI SOSA", dni: "31.554.087", dias: 3, deuda: 156900, tel: "11 XXXXX-3390" },
  { nombre: "RAMIRO ESTEBAN QUIROGA", dni: "38.017.652", dias: 3, deuda: 149212, tel: "261 XXXXX-118" },
  { nombre: "VALERIA INES MOLINA", dni: "29.665.430", dias: 3, deuda: 138700, tel: "11 XXXXX-5602" },
  { nombre: "GUSTAVO ARIEL PAZ", dni: "33.208.991", dias: 28, deuda: 131455, tel: "381 XXXXX-904" },
  { nombre: "CAROLINA BEATRIZ RIOS", dni: "40.112.375", dias: 3, deuda: 127090, tel: "11 XXXXX-2275" },
  { nombre: "SERGIO MARTIN LEDESMA", dni: "26.330.719", dias: 3, deuda: 119840, tel: "341 XXXXX-650" },
  { nombre: "NATALIA SOLEDAD VERA", dni: "36.774.208", dias: 3, deuda: 112300, tel: "11 XXXXX-8814" },
  { nombre: "FEDERICO JOSE ACOSTA", dni: "32.459.066", dias: 3, deuda: 108975, tel: "223 XXXXX-431" },
  { nombre: "ROMINA PAOLA CABRERA", dni: "39.881.540", dias: 35, deuda: 101620, tel: "11 XXXXX-1967" },
  { nombre: "DIEGO HERNAN SUAREZ", dni: "30.214.885", dias: 3, deuda: 98410, tel: "11 XXXXX-7703" },
  { nombre: "LAURA CECILIA DOMINGUEZ", dni: "34.670.312", dias: 3, deuda: 95230, tel: "351 XXXXX-208" },
  { nombre: "PABLO ANDRES CASTRO", dni: "28.903.447", dias: 3, deuda: 91870, tel: "11 XXXXX-6145" },
  { nombre: "MARIELA ALEJANDRA LUNA", dni: "37.526.019", dias: 3, deuda: 88300, tel: "11 XXXXX-3528" },
];
const pesos = (n: number) => `$ ${n.toLocaleString("es-AR")}`;
const CLUSTER_T = { cols: 4, w: 254, h: 150, gap: 20, rowGap: 18, y: 140 };
const CLUSTER_M = { cols: 1, w: 358, h: 108, gap: 0, rowGap: 12, y: 150 };
const clientePos = (m: boolean, i: number) => {
  const L = m ? CLUSTER_M : CLUSTER_T;
  const x0 = m ? 16 : X0;
  return { x: x0 + (i % L.cols) * (L.w + L.gap), y: L.y + Math.floor(i / L.cols) * (L.h + L.rowGap), w: L.w, h: L.h };
};

const TarjetaCliente: React.FC<{ c: Cliente; i: number; frame: number; m: boolean; suelto?: boolean }> = ({ c, i, frame, m, suelto }) => {
  const oculto = useContext(Ocultos);
  const es = c.nombre === "JAVIER PEREZ";
  if (!suelto && es && oculto("javier")) {
    return null;
  }
  const f0 = ESC.cluster[0];
  const p = clientePos(m, i);
  const e = entra(frame, f0 + 8 + i * 2);
  const brillo = es ? interpolate(frame, [TAP_JAVIER - 16, TAP_JAVIER - 6], [0, 1], clamp) : 0;
  const toque = es ? pulsado(frame, TAP_JAVIER) : 0;
  const color = c.dias <= 10 ? VERDE : NARANJA;
  return (
          <div style={{ position: "absolute", left: suelto ? 0 : p.x, top: suelto ? 0 : p.y, width: p.w, height: p.h, background: "white", borderRadius: 10, border: `1.5px solid ${brillo > 0 ? `rgba(47,111,224,${brillo})` : BORDE}`, boxShadow: brillo > 0 ? `0 10px 24px rgba(47,111,224,${0.22 * brillo})` : "0 3px 10px rgba(15,25,45,0.07)", padding: "14px 14px", boxSizing: "border-box", opacity: suelto ? 1 : e, transform: suelto ? undefined : `translateY(${(1 - e) * 16}px) scale(${1 + brillo * 0.03 - toque * 0.05})` }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <Icono d={I_USUARIO} s={22} c={TINTA} w={2.4} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: TINTA, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.nombre}</div>
                <div style={{ fontSize: 10, color: TINTA_2, marginTop: 3 }}>DNI: {c.dni}</div>
              </div>
              <div style={{ background: color, color: "white", borderRadius: 10, padding: "2px 7px", fontSize: 9.5, fontWeight: 800, display: "flex", alignItems: "center", gap: 3 }}>
                <Icono d={I_RELOJ} s={10} w={2.4} />
                {c.dias}d
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: m ? 14 : 36 }}>
              <div style={{ fontSize: 10.5, color: TINTA }}>Deuda Total</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: TINTA }}>{pesos(c.deuda)}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 9.5, color: TINTA_2 }}>
              <Icono d={I_TEL} s={11} c={TINTA} w={2} /> {c.tel}
            </div>
          </div>
          );
};

const Cluster: React.FC<{ frame: number; m: boolean }> = ({ frame, m }) => {
  const n = m ? 6 : 16;
  return (
    <div style={{ position: "absolute", inset: 0, background: FONDO }}>
      <div style={{ position: "absolute", left: m ? 16 : X0, top: m ? 108 : 66, display: "flex", alignItems: "center", gap: 6, fontSize: m ? 10.5 : 12, color: AZUL }}>
        <Icono d={I_FLECHA_IZQ} s={14} c={AZUL} /> Volver a Segmentos
      </div>
      {!m ? (
        <div style={{ position: "absolute", right: 28, top: 60, display: "flex", border: `1px solid ${BORDE}`, borderRadius: 6, overflow: "hidden", fontSize: 10.5, fontWeight: 700 }}>
          <div style={{ background: AZUL, color: "white", padding: "6px 12px" }}>Cards</div>
          <div style={{ background: "white", color: TINTA_2, padding: "6px 12px" }}>Listado</div>
        </div>
      ) : null}
      <div style={{ position: "absolute", left: 0, right: m ? 0 : -SIDE, top: m ? 126 : 96, textAlign: "center", fontSize: m ? 15 : 18, fontWeight: 700, color: TINTA }}>Clientes del Cluster S4</div>
      {CLIENTES.slice(0, n).map((c, i) => (
        <TarjetaCliente key={c.dni} c={c} i={i} frame={frame} m={m} />
      ))}
    </div>
  );
};

// ---------- Client file: register a payment promise ----------
const OPCIONES_GESTION = ["Llamada saliente", "Promesa de pago", "Mensaje de WhatsApp", "Sin contacto"];
const COMENTARIO = "Se compromete a pagar el 25/11";
const KPIS: [string, string, boolean][] = [
  ["S4", "CONTENEDOR", false],
  ["20", "DÍAS MORA", true],
  ["$ 200.629", "DEUDA TOTAL", false],
  ["$ 184.310", "DEUDA VENCIDA", false],
  ["$ 231.540", "DEUDA ACTUALIZADA", false],
];
const ACCIONES: [string, string, string][] = [
  [I_TEL, AZUL, "white"],
  [I_MAIL, "#e5e7eb", TINTA],
  [I_WA, VERDE, "white"],
  [I_CHAT, "#e5e7eb", TINTA],
  [I_BOT, "#e5e7eb", TINTA],
];
// Form layout (absolute y on each screen).
const FORM_T = { x: 772, w: 380, y: 322 };
const FORM_M = { x: 12, w: 366, y: 322 };
const formY = (m: boolean) => {
  const F = m ? FORM_M : FORM_T;
  const select = F.y + (m ? 64 : 70);
  return { select, campos: select + 52, dropdown: select + 40 };
};
const guardarY = (m: boolean, c: number) => formY(m).campos + c * 68 + 18 + (m ? 46 : 50) + 14;

const Caja: React.FC<{ x: number; y: number; w: number; h: number; children?: React.ReactNode; style?: React.CSSProperties }> = ({ x, y, w, h, children, style }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, background: "white", borderRadius: 10, border: `1px solid ${BORDE}`, boxShadow: "0 3px 10px rgba(15,25,45,0.05)", boxSizing: "border-box", ...style }}>{children}</div>
);

const Etiqueta: React.FC<{ children: React.ReactNode }> = ({ children }) => <div style={{ fontSize: 11, color: TINTA, marginBottom: 5 }}>{children}</div>;
const Campo: React.FC<{ h?: number; children?: React.ReactNode; activo?: boolean; style?: React.CSSProperties }> = ({ h = 34, children, activo, style }) => (
  <div style={{ height: h, border: `1.5px solid ${activo ? AZUL : "#9aa3b2"}`, borderRadius: 7, display: "flex", alignItems: "center", padding: "0 12px", fontSize: 11.5, color: TINTA, boxSizing: "border-box", background: "white", ...style }}>{children}</div>
);

const Gestion: React.FC<{ tipo: string; color: string; fecha: string; texto: string; por: string; m: boolean; brillo?: number }> = ({ tipo, color, fecha, texto, por, m, brillo = 0 }) => (
  <div style={{ display: "flex", gap: 10, padding: "8px 12px", borderBottom: `1px solid ${BORDE}`, background: brillo > 0 ? `rgba(46,158,74,${0.1 * brillo})` : "transparent" }}>
    <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${color}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icono d={tipo.startsWith("Llamada") ? I_BOT : I_CHAT} s={15} c={color} />
    </div>
    <div style={{ minWidth: 0 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
        <div style={{ fontSize: m ? 11.5 : 13, fontWeight: 500, color }}>{tipo}</div>
        <div style={{ fontSize: 9.5, color: TINTA_2 }}>{fecha}</div>
      </div>
      <div style={{ fontSize: m ? 9.5 : 10.5, color: TINTA, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{texto}</div>
      <div style={{ fontSize: 8.5, color: TINTA_2, marginTop: 2 }}>Por: {por}</div>
    </div>
  </div>
);

const ClienteFicha: React.FC<{ frame: number; m: boolean }> = ({ frame, m }) => {
  const f0 = ESC.cliente[0];
  const F = m ? FORM_M : FORM_T;
  const Y = formY(m);
  const abierto = frame >= TAP_SELECT + 2 && frame < TAP_PROMESA + 4;
  const elegido = frame >= TAP_PROMESA + 2;
  const c = interpolate(frame, [TAP_PROMESA + 4, TAP_PROMESA + 14], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const tipeo = Math.round(interpolate(frame, TIPEO, [0, COMENTARIO.length], clamp));
  const guardado = frame >= TAP_GUARDAR + 4;
  const nueva = entra(frame, TAP_GUARDAR + 6, 12);
  const brillo = interpolate(frame, [TAP_GUARDAR + 6, TAP_GUARDAR + 16, TAP_GUARDAR + 50], [0, 1, 0], clamp);
  const toast = interpolate(frame, [TAP_GUARDAR + 4, TAP_GUARDAR + 12, TAP_GUARDAR + 50, TAP_GUARDAR + 58], [0, 1, 1, 0], clamp);
  const gy = guardarY(m, c);
  const e = (d: number) => entra(frame, f0 + d);
  const filaPromesa = ["14/11/2026", "25/11/2026", "$ 50.000", "$ 0", "PENDIENTE", "DMARTINEZ"];

  const form = (
    <Caja x={F.x} y={F.y} w={F.w} h={gy + 34 + 16 - F.y} style={{ opacity: e(10) }}>
      <div style={{ position: "absolute", left: 18, top: 16, fontSize: 13.5, fontWeight: 700, color: TINTA }}>Nueva Gestión</div>
      <div style={{ position: "absolute", left: 18, right: 18, top: Y.select - F.y - 20 }}>
        <Etiqueta>Tipo de gestión</Etiqueta>
      </div>
      <div style={{ position: "absolute", left: 18, right: 18, top: Y.select - F.y, transform: `scale(${1 - pulsado(frame, TAP_SELECT) * 0.03})` }}>
        <Campo h={38} activo={abierto} style={{ justifyContent: "space-between", fontWeight: elegido ? 700 : 500 }}>
          <span>{elegido ? "Promesa de pago" : "Selecciona una acción"}</span>
          <span style={{ fontSize: 9 }}>▾</span>
        </Campo>
      </div>
      {c > 0 ? (
        <div style={{ position: "absolute", left: 18, right: 18, top: Y.campos - F.y, display: "flex", gap: 12, opacity: c }}>
          <div style={{ flex: 1 }}>
            <Etiqueta>Monto</Etiqueta>
            <Campo>$ 50.000</Campo>
          </div>
          <div style={{ flex: 1 }}>
            <Etiqueta>Fecha promesa</Etiqueta>
            <Campo>25/11/2026</Campo>
          </div>
        </div>
      ) : null}
      <div style={{ position: "absolute", left: 18, right: 18, top: Y.campos - F.y + c * 68 }}>
        <Etiqueta>Comentario:</Etiqueta>
        <Campo h={m ? 46 : 50} activo={frame >= TIPEO[0] - 4 && frame < TAP_GUARDAR} style={{ alignItems: "flex-start", paddingTop: 9 }}>
          {COMENTARIO.slice(0, tipeo)}
          {frame >= TIPEO[0] - 4 && frame < TAP_GUARDAR && Math.floor(frame / 8) % 2 === 0 ? <span style={{ color: AZUL }}>|</span> : null}
        </Campo>
      </div>
      <div style={{ position: "absolute", left: 18, right: 18, top: gy - F.y, height: 34, background: AZUL, borderRadius: 7, color: "white", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, transform: `scale(${1 - pulsado(frame, TAP_GUARDAR) * 0.05})` }}>
        <Icono d={I_GUARDAR} s={14} /> Guardar
      </div>
    </Caja>
  );

  const dropdown = abierto ? (
    <div style={{ position: "absolute", left: F.x + 18, width: F.w - 36, top: Y.dropdown, background: "white", border: `1px solid #9aa3b2`, borderRadius: 7, boxShadow: "0 12px 24px rgba(0,0,0,0.15)", overflow: "hidden", zIndex: 4 }}>
      {OPCIONES_GESTION.map((o, i) => {
        const sel = i === 1 ? interpolate(frame, [TAP_PROMESA - 10, TAP_PROMESA - 4], [0, 1], clamp) : 0;
        return (
          <div key={o} style={{ height: 34, display: "flex", alignItems: "center", padding: "0 12px", fontSize: 11.5, color: sel > 0.5 ? "white" : TINTA, background: sel > 0.5 ? AZUL : "white" }}>
            {o}
          </div>
        );
      })}
    </div>
  ) : null;

  const gestionNueva = (
    <div style={{ height: nueva * (m ? 62 : 64), overflow: "hidden", opacity: nueva }}>
      <Gestion m={m} tipo="Promesa de pago" color={VERDE} fecha="14/11/2026" texto={`${COMENTARIO} · $ 50.000`} por="DMARTINEZ" brillo={brillo} />
    </div>
  );
  const gestionesViejas = (
    <>
      <Gestion m={m} tipo="Llamada Bot" color="#7c3aed" fecha="21/10/2026" texto="No contestó → Reintento → vuelve al pool (disponible)" por="DIALER" />
      <Gestion m={m} tipo="Llamada Bot" color="#7c3aed" fecha="15/09/2026" texto="Llamada muy breve: cortó al instante → Reintento" por="DIALER" />
      <Gestion m={m} tipo="Mensaje WhatsApp" color={VERDE} fecha="02/09/2026" texto="Recordatorio de cuota vencida enviado" por="DIALER" />
    </>
  );
  const promesa = guardado ? (
    <div style={{ opacity: nueva, background: brillo > 0 ? `rgba(46,158,74,${0.1 * brillo})` : "transparent" }}>
      {m ? (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px" }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: TINTA }}>$ 50.000 · 25/11/2026</div>
            <div style={{ fontSize: 9.5, color: TINTA_2, marginTop: 3 }}>Registrada 14/11/2026 · DMARTINEZ</div>
          </div>
          <div style={{ background: "#fdf3dc", color: "#a8730a", fontSize: 9, fontWeight: 800, borderRadius: 5, padding: "3px 8px" }}>PENDIENTE</div>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", height: 38, fontSize: 10.5, color: TINTA }}>
          {filaPromesa.map((v, i) => (
            <div key={i} style={{ flex: i === 5 ? 1.1 : 1, padding: "0 10px" }}>
              {i === 4 ? <span style={{ background: "#fdf3dc", color: "#a8730a", fontSize: 9, fontWeight: 800, borderRadius: 5, padding: "3px 8px" }}>{v}</span> : v}
            </div>
          ))}
          <div style={{ flex: 0.9, padding: "0 10px", color: AZUL, fontWeight: 700 }}>Editar</div>
        </div>
      )}
    </div>
  ) : (
    <div style={{ height: m ? 52 : 38, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: TINTA }}>NO HAY PROMESAS DE PAGO.</div>
  );

  if (m) {
    return (
      <div style={{ position: "absolute", inset: 0, background: FONDO }}>
        <Caja x={12} y={104} w={366} h={86} style={{ opacity: e(0) }}>
          <div style={{ position: "absolute", left: 14, top: 22, width: 40, height: 40, borderRadius: "50%", background: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icono d={I_USUARIO} s={22} c={TINTA_2} w={2.2} />
          </div>
          <div style={{ position: "absolute", left: 66, top: 20, fontSize: 14, fontWeight: 700, color: TINTA }}>JAVIER PEREZ</div>
          <div style={{ position: "absolute", left: 66, top: 42, fontSize: 11, color: TINTA, letterSpacing: 0.5 }}>• DNI: 2845678</div>
          <div style={{ position: "absolute", right: 14, top: 18, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            <div style={{ background: "#eaf1fd", color: AZUL, fontSize: 10, fontWeight: 800, borderRadius: 5, padding: "3px 8px" }}>S4</div>
            <div style={{ background: NARANJA, color: "white", fontSize: 10, fontWeight: 800, borderRadius: 10, padding: "3px 8px" }}>20 días</div>
          </div>
        </Caja>
        {KPIS.slice(2).map(([v, l], i) => (
          <Caja key={l} x={12 + i * 124} y={200} w={114} h={56} style={{ borderLeft: `3px solid ${AZUL}`, opacity: e(4 + i * 2), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: TINTA }}>{v}</div>
            <div style={{ fontSize: 7.5, color: TINTA_2, letterSpacing: 0.5, marginTop: 3 }}>{l}</div>
          </Caja>
        ))}
        <div style={{ position: "absolute", left: 12, right: 12, top: 268, display: "flex", justifyContent: "space-between", opacity: e(8) }}>
          {ACCIONES.map(([d, bg, col], i) => (
            <div key={i} style={{ width: 62, height: 40, borderRadius: 8, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icono d={d} s={18} c={col} />
            </div>
          ))}
        </div>
        {form}
        {dropdown}
        <div style={{ position: "absolute", left: 14, top: gy + 64, fontSize: 13, fontWeight: 700, color: TINTA, opacity: e(14) }}>Promesas de Pago</div>
        <Caja x={12} y={gy + 88} w={366} h={58} style={{ opacity: e(14), overflow: "hidden" }}>
          {promesa}
        </Caja>
        <div style={{ position: "absolute", left: 14, top: gy + 160, fontSize: 13, fontWeight: 700, color: TINTA, opacity: e(16) }}>Últimas Gestiones</div>
        <Caja x={12} y={gy + 184} w={366} h={200} style={{ opacity: e(16), overflow: "hidden" }}>
          {gestionNueva}
          {gestionesViejas}
        </Caja>
        {toast > 0 ? <Toast t={toast} x={195} y={120} /> : null}
      </div>
    );
  }

  return (
    <div style={{ position: "absolute", inset: 0, background: "white" }}>
      <div style={{ position: "absolute", left: X0, top: 62, display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: AZUL }}>
        <Icono d={I_FLECHA_IZQ} s={14} c={AZUL} /> Volver al Contenedor
      </div>
      <Caja x={X0} y={88} w={CW} h={90} style={{ opacity: e(0), boxShadow: "0 6px 18px rgba(15,25,45,0.08)" }}>
        <div style={{ position: "absolute", left: 14, top: 24, width: 40, height: 40, borderRadius: "50%", background: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icono d={I_USUARIO} s={22} c={TINTA_2} w={2.2} />
        </div>
        <div style={{ position: "absolute", left: 66, top: 24, fontSize: 14, fontWeight: 700, color: TINTA }}>JAVIER PEREZ</div>
        <div style={{ position: "absolute", left: 66, top: 46, fontSize: 12, color: TINTA, letterSpacing: 1 }}>• DNI: 2845678</div>
        <div style={{ position: "absolute", left: 226, top: 30, background: "#8fb3ee", color: "white", fontSize: 10, fontWeight: 700, borderRadius: 5, padding: "6px 12px", display: "flex", alignItems: "center", gap: 5 }}>
          <Icono d={I_SIGUIENTE} s={11} /> Próximo
        </div>
        {KPIS.map(([v, l, rojo], i) => (
          <div key={l} style={{ position: "absolute", left: 330 + i * 106, top: 12, width: 98, height: 66, borderRadius: 8, background: "#f4f6fa", borderLeft: `3px solid ${AZUL}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: e(4 + i * 2) }}>
            {rojo ? (
              <div style={{ background: NARANJA, color: "white", fontSize: 12.5, fontWeight: 800, borderRadius: 10, padding: "1px 9px" }}>{v}</div>
            ) : (
              <div style={{ fontSize: 12.5, fontWeight: 700, color: TINTA }}>{v}</div>
            )}
            <div style={{ fontSize: 6.8, color: TINTA_2, letterSpacing: 0.4, marginTop: 4, whiteSpace: "nowrap" }}>{l}</div>
          </div>
        ))}
        <div style={{ position: "absolute", right: 12, top: 26, display: "flex", gap: 6 }}>
          {ACCIONES.map(([d, bg, col], i) => (
            <div key={i} style={{ width: 34, height: 36, borderRadius: 8, background: bg, display: "flex", alignItems: "center", justifyContent: "center", opacity: e(10 + i) }}>
              <Icono d={d} s={16} c={col} />
            </div>
          ))}
        </div>
      </Caja>
      <div style={{ position: "absolute", left: X0, top: 194, width: 660, height: 36, borderBottom: `1.5px solid ${TINTA}`, display: "flex", opacity: e(6) }}>
        {["Gestiones", "Información", "Productos", "Pautas", "Otros"].map((t, i) => (
          <div key={t} style={{ width: 132, textAlign: "center", fontSize: 13, color: i === 0 ? AZUL : TINTA, borderBottom: i === 0 ? `3px solid ${AZUL}` : undefined, height: 33 }}>
            {t}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: X0 + 8, top: 246, fontSize: 13, fontWeight: 700, color: TINTA, opacity: e(8) }}>Últimas Gestiones</div>
      <Caja x={X0 + 8} y={270} w={652} h={222} style={{ opacity: e(8), overflow: "hidden", border: `1.5px solid ${TINTA}` }}>
        {gestionNueva}
        {gestionesViejas}
      </Caja>
      <div style={{ position: "absolute", left: X0 + 8, top: 512, fontSize: 13, fontWeight: 700, color: TINTA, opacity: e(12) }}>Promesas de Pago</div>
      <Caja x={X0 + 8} y={536} w={652} h={118} style={{ opacity: e(12), border: `1.5px solid ${TINTA}`, padding: 12 }}>
        <div style={{ border: `1px solid ${BORDE}` }}>
          <div style={{ display: "flex", height: 32, alignItems: "center", fontSize: 10, color: TINTA_2, background: "#fafbfc", borderBottom: `1px solid ${BORDE}` }}>
            {["Fecha", "Fecha Promesa", "Monto", "Pagado parcial", "Estado", "Gestor", "Acciones"].map((h, i) => (
              <div key={h} style={{ flex: i === 5 ? 1.1 : i === 6 ? 0.9 : 1, padding: "0 10px", borderRight: i < 6 ? `1px solid ${BORDE}` : undefined }}>
                {h}
              </div>
            ))}
          </div>
          {promesa}
        </div>
      </Caja>
      <Caja x={FORM_T.x} y={188} w={FORM_T.w} h={122} style={{ opacity: e(6) }}>
        <div style={{ position: "absolute", left: 18, top: 12, fontSize: 13, fontWeight: 700, color: TINTA }}>Notas Adicionales</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 38, height: 1, background: BORDE }} />
        <div style={{ position: "absolute", left: 12, right: 12, top: 46, height: 36, background: "#fbf8d4", border: "1px solid #e9e2a0", borderRadius: 4, fontSize: 9.5, color: TINTA_2, padding: "6px 8px", boxSizing: "border-box" }}>Info importante (ej: llamarlo por la mañana)…</div>
        <div style={{ position: "absolute", left: 12, right: 12, top: 88, height: 26, background: AZUL, borderRadius: 6, color: "white", fontSize: 10.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Icono d={I_GUARDAR} s={12} /> Guardar
        </div>
      </Caja>
      {form}
      {dropdown}
      {toast > 0 ? <Toast t={toast} x={X0 + 334} y={70} /> : null}
    </div>
  );
};

const Toast: React.FC<{ t: number; x: number; y: number; texto?: string }> = ({ t, x, y, texto = "✓ Gestión guardada" }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, ${(1 - t) * -12}px)`, opacity: t, background: VERDE, color: "white", fontSize: 12, fontWeight: 700, borderRadius: 8, padding: "9px 16px", boxShadow: "0 10px 24px rgba(0,0,0,0.2)", whiteSpace: "nowrap", zIndex: 7 }}>
    {texto}
  </div>
);

// ---------- Extrajudicial portfolio assignment ----------
const AGENCIAS = [
  { nombre: "Estudio Lagos", cod: "LAGOS", casos: 85, monto: "$ 33.412.880", mora: 366, rango: "361 - 372" },
  { nombre: "Estudio Rivas Paz", cod: "RIVASPAZ", casos: 92, monto: "$ 32.904.115", mora: 365, rango: "361 - 371" },
  { nombre: "Estudio Montes", cod: "MONTES", casos: 83, monto: "$ 32.328.215", mora: 367, rango: "362 - 372" },
];
const PENDIENTES: [string, string, string, number][] = [
  ["39.214.876", "HÉCTOR DAMIÁN FARÍAS", "$ 392.235", 362],
  ["31.087.552", "GRACIELA BEATRIZ ROJAS", "$ 1.104.300", 371],
  ["36.540.219", "MAXIMILIANO OSCAR PEREYRA", "$ 288.910", 365],
  ["28.772.104", "SILVINA ANDREA CORREA", "$ 2.415.300", 368],
  ["40.336.981", "EZEQUIEL RAMÓN BRITEZ", "$ 74.520", 361],
  ["33.905.447", "LORENA PATRICIA MEDINA", "$ 512.880", 366],
  ["27.618.093", "OMAR ALBERTO GODOY", "$ 640.115", 372],
];
const RESUMEN: [string, string][] = [
  ["Casos para Asignar", "260"],
  ["Deuda Total", "$ 98.645.210"],
  ["Deuda Promedio", "$ 379.404"],
  ["Deuda Mínima", "$ 5.120"],
  ["Deuda Máxima", "$ 2.415.300"],
];
const autoPos = (m: boolean) => (m ? { x: 24, y: 352, w: 342, h: 36 } : { x: 942, y: 342, w: 170, h: 36 });
const modalAsig = (m: boolean) =>
  m ? { x: 12, y: 108, w: 366, h: 590, preview: 246, confirmar: 510 } : { x: 340, y: 66, w: 500, h: 700, preview: 290, confirmar: 610 };

const Check: React.FC<{ on?: boolean }> = ({ on = true }) => (
  <div style={{ width: 14, height: 14, borderRadius: 3, background: on ? AZUL : "white", border: `1.5px solid ${on ? AZUL : "#9aa3b2"}`, color: "white", fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{on ? "✓" : ""}</div>
);
const Input: React.FC<{ w: number; children?: React.ReactNode; vacio?: boolean }> = ({ w, children, vacio }) => (
  <div style={{ width: w, height: 32, background: "white", borderRadius: 6, border: `1px solid ${BORDE}`, display: "flex", alignItems: "center", padding: "0 10px", boxSizing: "border-box", fontSize: 11, color: vacio ? "#9aa3b2" : TINTA }}>{children}</div>
);
const Boton: React.FC<{ bg: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ bg, children, style }) => (
  <div style={{ height: 34, background: bg, color: "white", borderRadius: 7, fontSize: 11.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 14px", boxSizing: "border-box", whiteSpace: "nowrap", ...style }}>{children}</div>
);

const Asignacion: React.FC<{ frame: number; m: boolean }> = ({ frame, m }) => {
  const f0 = ESC.asignacion[0];
  const e = (d: number) => entra(frame, f0 + d);
  const modal = entra(frame, TAP_AUTO + 4, 10) * (1 - entra(frame, TAP_CONFIRMAR + 8, 10));
  const avance = interpolate(frame, REPARTO, [0, 100], clamp);
  const asignado = entra(frame, TAP_CONFIRMAR + 12, 16);
  const casos = Math.round(260 * (1 - asignado));
  const toast = interpolate(frame, [TAP_CONFIRMAR + 10, TAP_CONFIRMAR + 18, TAP_CONFIRMAR + 52, TAP_CONFIRMAR + 60], [0, 1, 1, 0], clamp);
  const A = autoPos(m);
  const MD = modalAsig(m);
  const valor = (i: number, v: string) => (i === 0 ? String(casos) : v);
  const chipAg = (i: number) => (
    <span style={{ opacity: asignado, background: "#eaf1fd", color: AZUL, fontSize: 9, fontWeight: 800, borderRadius: 5, padding: "3px 7px" }}>{AGENCIAS[i % 3].cod}</span>
  );
  const fondo = (
    <div style={{ position: "absolute", inset: 0, filter: modal > 0 ? `blur(${modal * 2.5}px)` : undefined }}>
      {m ? (
        <>
          <div style={{ position: "absolute", left: 16, top: 106, fontSize: 15, fontWeight: 800, color: TINTA, opacity: e(0) }}>Asignación Extrajudicial</div>
          {RESUMEN.slice(0, 4).map(([l, v], i) => (
            <Caja key={l} x={12 + (i % 2) * 189} y={134 + Math.floor(i / 2) * 64} w={177} h={56} style={{ borderLeft: `3px solid ${AZUL}`, opacity: e(2 + i * 2), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: 8.5, color: TINTA_2, letterSpacing: 0.4 }}>{l}</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: TINTA, marginTop: 3 }}>{valor(i, v)}</div>
            </Caja>
          ))}
          <div style={{ position: "absolute", left: 12, top: 268, width: 366, height: 136, background: "#e9ecf1", borderRadius: 10, opacity: e(10) }}>
            <div style={{ position: "absolute", left: 12, top: 10, fontSize: 10.5, color: TINTA }}>Días de Mora:</div>
            <div style={{ position: "absolute", left: 12, top: 30, display: "flex", gap: 10 }}>
              <Input w={166}>360</Input>
              <Input w={166}>800</Input>
            </div>
          </div>
          <div style={{ position: "absolute", left: 16, right: 16, top: 414, fontSize: 9, color: TINTA_2, opacity: e(12) }}>Las asignaciones se aplican a los {casos} caso(s) del filtro actual.</div>
          {PENDIENTES.slice(0, 5).map(([dni, n, d, dias], i) => (
            <Caja key={dni} x={12} y={440 + i * 78} w={366} h={70} style={{ opacity: e(14 + i * 2), padding: "10px 12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Check />
                <div style={{ fontSize: 11, fontWeight: 700, color: TINTA, flex: 1 }}>{n}</div>
                {chipAg(i)}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 10, color: TINTA_2 }}>
                <span>DNI {dni}</span>
                <span style={{ color: TINTA, fontWeight: 700 }}>{d}</span>
                <span>{dias} días</span>
              </div>
            </Caja>
          ))}
        </>
      ) : (
        <>
          <div style={{ position: "absolute", left: X0, width: CW, top: 60, textAlign: "center", fontSize: 16, fontWeight: 700, color: TINTA, opacity: e(0) }}>Asignación de Cartera Extrajudicial</div>
          <Caja x={X0} y={92} w={CW} h={140} style={{ opacity: e(2) }}>
            <div style={{ position: "absolute", left: 18, top: 14, fontSize: 15, color: TINTA }}>Resumen de Cartera Pendiente</div>
            <div style={{ position: "absolute", left: 18, right: 18, top: 42, height: 1.5, background: AZUL_OSC }} />
            {RESUMEN.map(([l, v], i) => (
              <div key={l} style={{ position: "absolute", left: 16 + i * 212, top: 56, width: 198, height: 66, borderRadius: 8, background: "#f4f6fa", borderLeft: `3px solid ${AZUL}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: e(4 + i * 2) }}>
                <div style={{ fontSize: 9.5, color: TINTA_2, letterSpacing: 0.4 }}>{l}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: TINTA, marginTop: 5 }}>{valor(i, v)}</div>
              </div>
            ))}
          </Caja>
          <Caja x={X0} y={246} w={CW} h={556} style={{ opacity: e(8) }}>
            <div style={{ position: "absolute", left: 18, top: 14, fontSize: 15, color: TINTA }}>Clientes Pendientes de Asignación</div>
            <div style={{ position: "absolute", left: 18, right: 18, top: 42, height: 1.5, background: AZUL_OSC }} />
          </Caja>
          <div style={{ position: "absolute", left: X0 + 20, top: 304, width: CW - 40, height: 92, background: "#e9ecf1", borderRadius: 10, opacity: e(10) }}>
            {[
              ["Días de Mora:", 40, ["360", "800"]],
              ["Deuda Total:", 226, ["Mín.", "Máx."]],
              ["Score BCRA:", 412, ["Mín."]],
            ].map(([l, x, vals]) => (
              <div key={l as string} style={{ position: "absolute", left: x as number, top: 14 }}>
                <div style={{ fontSize: 10.5, color: TINTA, marginBottom: 6 }}>{l as string}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {(vals as string[]).map((v) => (
                    <Input key={v} w={80} vacio={v.startsWith("M")}>
                      {v}
                    </Input>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <Boton bg={AZUL_OSC} style={{ position: "absolute", left: 600, top: 342, width: 80, opacity: e(10) }}>Filtrar</Boton>
          <Boton bg={AZUL_OSC} style={{ position: "absolute", left: 692, top: 342, width: 80, opacity: e(10), textDecoration: "underline" }}>Limpiar</Boton>
          <div style={{ position: "absolute", left: X0 + 18, top: 410, fontSize: 11, color: TINTA, opacity: e(12) }}>Las asignaciones se aplican a los {casos} caso(s) del filtro actual. Si tildás casos puntuales, se asignan solo esos.</div>
          <div style={{ position: "absolute", left: X0 + 18, top: 436, display: "flex", alignItems: "center", gap: 10, opacity: e(12) }}>
            <div style={{ fontSize: 12, color: TINTA }}>Asignar a:</div>
            <Input w={720} vacio>
              Seleccione un agente o agencia… <span style={{ marginLeft: "auto", fontSize: 9 }}>▾</span>
            </Input>
            <Boton bg={AZUL_OSC}>Asignar Seleccionados</Boton>
          </div>
          <div style={{ position: "absolute", left: X0 + 18, top: 484, width: CW - 36, border: `1px solid ${BORDE}`, borderRadius: 6, overflow: "hidden", opacity: e(14) }}>
            <div style={{ display: "flex", height: 34, alignItems: "center", background: "#fafbfc", fontSize: 10.5, color: TINTA_2, borderBottom: `1px solid ${BORDE}` }}>
              <div style={{ width: 50, display: "flex", justifyContent: "center" }}>
                <Check />
              </div>
              {["DNI", "Nombre", "Deuda Total", "Días de Mora", "Asignado a"].map((h, i) => (
                <div key={h} style={{ flex: i === 1 ? 2.2 : 1, padding: "0 12px" }}>
                  {h}
                </div>
              ))}
            </div>
            {PENDIENTES.map(([dni, n, d, dias], i) => (
              <div key={dni} style={{ display: "flex", height: 38, alignItems: "center", fontSize: 11, color: TINTA, borderBottom: `1px solid ${BORDE}`, opacity: e(16 + i * 2) }}>
                <div style={{ width: 50, display: "flex", justifyContent: "center" }}>
                  <Check />
                </div>
                <div style={{ flex: 1, padding: "0 12px" }}>{dni}</div>
                <div style={{ flex: 2.2, padding: "0 12px" }}>{n}</div>
                <div style={{ flex: 1, padding: "0 12px" }}>{d}</div>
                <div style={{ flex: 1, padding: "0 12px" }}>{dias}</div>
                <div style={{ flex: 1, padding: "0 12px" }}>{chipAg(i)}</div>
              </div>
            ))}
          </div>
        </>
      )}
      <Boton bg="#1fbf75" style={{ position: "absolute", left: A.x, top: A.y, width: A.w, height: A.h, opacity: e(10), transform: `scale(${1 - pulsado(frame, TAP_AUTO) * 0.05})` }}>
        Asignación Automática
      </Boton>
    </div>
  );
  const listo = avance >= 100;
  return (
    <div style={{ position: "absolute", inset: 0, background: FONDO }}>
      {fondo}
      {modal > 0 ? (
        <>
          <div style={{ position: "absolute", inset: 0, background: `rgba(30,36,48,${modal * 0.3})` }} />
          <div style={{ position: "absolute", left: MD.x, top: MD.y, width: MD.w, height: MD.h, background: "white", borderRadius: 14, boxShadow: "0 30px 60px rgba(0,0,0,0.3)", opacity: modal, transform: `scale(${0.95 + 0.05 * modal})`, fontSize: 11, color: TINTA }}>
            <div style={{ position: "absolute", left: 18, top: m ? 18 : 22, fontSize: m ? 13.5 : 16, fontWeight: 700 }}>Asignación Automática de Cartera</div>
            <div style={{ position: "absolute", right: 18, top: 14, fontSize: 20, color: TINTA_2 }}>×</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: m ? 52 : 64, textAlign: "center", fontSize: 12 }}>Criterio de Distribución</div>
            <div style={{ position: "absolute", left: m ? 24 : 50, right: m ? 24 : 50, top: m ? 70 : 86, height: 32, borderBottom: `1.5px solid ${TINTA_2}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10.5, letterSpacing: 0.3 }}>
              POR MONTO DE DEUDA <span style={{ position: "absolute", right: 8, fontSize: 9 }}>▾</span>
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: m ? 114 : 134, textAlign: "center", fontSize: 12 }}>Seleccionar Agencias para el Reparto</div>
            <div style={{ position: "absolute", left: 18, right: 18, top: m ? 134 : 156, height: m ? 100 : 112, border: `1px solid ${BORDE}`, borderRadius: 8 }}>
              {AGENCIAS.map((a, i) => (
                <div key={a.cod} style={{ position: "absolute", left: m ? 14 : 30 + (i % 2) * 230, top: m ? 8 + i * 30 : 12 + Math.floor(i / 2) * 50, display: "flex", alignItems: "center", gap: 10, opacity: entra(frame, TAP_AUTO + 12 + i * 3) }}>
                  <Check />
                  <div style={{ lineHeight: 1.35 }}>
                    <span style={{ fontWeight: 700 }}>{a.nombre}</span>
                    {m ? <span style={{ color: TINTA_2 }}> · Agencia externa</span> : <div style={{ color: TINTA_2 }}>(Agencia Externa)</div>}
                  </div>
                </div>
              ))}
            </div>
            <Boton bg={AZUL_OSC} style={{ position: "absolute", left: MD.w / 2 - 95, width: 190, top: MD.preview, height: 32, transform: `scale(${1 - pulsado(frame, TAP_PREVIEW) * 0.05})` }}>
              Previsualizar Asignación
            </Boton>
            <div style={{ position: "absolute", left: 18, top: MD.preview + (m ? 46 : 50), fontSize: m ? 13 : 16, fontWeight: 700 }}>Previsualización del Reparto</div>
            <div style={{ position: "absolute", left: 18, right: 18, top: MD.preview + (m ? 68 : 78), height: 1.5, background: AZUL_OSC }} />
            <div style={{ position: "absolute", left: 18, right: 18, top: MD.preview + (m ? 76 : 94), height: 9, background: "#e5e7eb", borderRadius: 5, overflow: "hidden" }}>
              <div style={{ width: `${avance}%`, height: "100%", background: listo ? VERDE : AZUL, borderRadius: 5 }} />
            </div>
            <div style={{ position: "absolute", left: 18, top: MD.preview + (m ? 88 : 110), fontSize: 10.5, fontWeight: 700, color: listo ? VERDE : TINTA }}>{Math.round(avance)}%</div>
            <div style={{ position: "absolute", left: 18, right: 18, top: MD.preview + (m ? 104 : 134), border: `1px solid ${BORDE}`, borderRadius: 6, overflow: "hidden" }}>
              <div style={{ display: "flex", height: m ? 30 : 36, alignItems: "center", background: "#fafbfc", fontSize: 9.5, color: TINTA_2, borderBottom: `1px solid ${BORDE}` }}>
                {(m ? ["Agencia", "Casos", "Monto"] : ["Agencia", "Casos", "Monto Total", "Mora Prom.", "Mín. - Máx."]).map((h, i) => (
                  <div key={h} style={{ flex: i === 0 || i === 2 ? 1.5 : 1, padding: "0 8px" }}>
                    {h}
                  </div>
                ))}
              </div>
              {AGENCIAS.map((a, i) => {
                const v = interpolate(avance, [20 + i * 25, 35 + i * 25], [0, 1], clamp);
                const vals = m ? [a.cod, a.casos, a.monto] : [a.cod, a.casos, a.monto, a.mora, a.rango];
                return (
                  <div key={a.cod} style={{ display: "flex", height: m ? 36 : 40, alignItems: "center", fontSize: m ? 10 : 11, borderBottom: `1px solid ${BORDE}`, opacity: v, transform: `translateX(${(1 - v) * 12}px)` }}>
                    {vals.map((x, j) => (
                      <div key={j} style={{ flex: j === 0 || j === 2 ? 1.5 : 1, padding: "0 8px", fontWeight: j === 0 ? 700 : 500 }}>
                        {x}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
            <Boton bg={VERDE} style={{ position: "absolute", left: MD.w / 2 - 95, width: 190, top: MD.confirmar, opacity: listo ? 1 : 0.45, transform: `scale(${1 - pulsado(frame, TAP_CONFIRMAR) * 0.05})` }}>
              Confirmar y Asignar
            </Boton>
            <div style={{ position: "absolute", left: 18, top: MD.confirmar + (m ? 46 : 54), fontSize: m ? 12 : 14, fontWeight: 700, color: AZUL }}>Se repartirán 260 caso(s).</div>
          </div>
        </>
      ) : null}
      {toast > 0 ? <Toast t={toast} x={m ? 195 : X0 + CW / 2} y={m ? 110 : 66} texto="✓ 260 casos asignados" /> : null}
    </div>
  );
};

// ---------- Performance and reports ----------
const KPIS_R: [string, string, number, string, string, string][] = [
  [I_USUARIO, "Clientes en cartera", 1452, "", "+3,1%", AZUL],
  [I_LLAMADA, "Gestiones", 7918, "", "+12,4%", "#7c3aed"],
  [I_TEL, "Contactos efectivos", 3106, "", "+8,9%", VERDE],
  [I_DOC, "Promesas de pago", 712, "", "+5,6%", NARANJA],
  [I_CHART, "Tasa de contacto", 392, "%", "+2,3 pp", "#0ea5b7"],
];
const SEMANAS: [string, number][] = [
  ["Sem 42", 1010],
  ["Sem 43", 2450],
  ["Sem 44", 1400],
  ["Sem 45", 1280],
  ["Sem 46", 2110],
  ["Sem 47", 1668],
];
const ACCIONES_R: [string, number, string][] = [
  ["No efectivo", 3040, "#94a3b8"],
  ["Efectivo", 2390, VERDE],
  ["Revisión", 1725, AZUL],
  ["Promesa de pago", 712, NARANJA],
  ["Rellamado", 38, "#7c3aed"],
  ["Negativo", 13, "#d9433a"],
];
const GESTORES: [string, string, number, number, number, number][] = [
  ["DM", "Delfina Martinez", 1248, 506, 109, 76.4],
  ["SC", "Sofía Castillo", 1085, 421, 84, 58.9],
  ["MI", "Martín Ibarra", 1016, 338, 90, 55.1],
  ["PF", "Paula Ferrer", 941, 345, 71, 43.8],
  ["TA", "Tomás Aguirre", 862, 317, 75, 64.2],
];
const num = (n: number) => Math.round(n).toLocaleString("es-AR");

const Barras: React.FC<{ frame: number; f0: number; w: number; h: number }> = ({ frame, f0, w, h }) => {
  const max = 2800;
  const bw = (w - 40) / SEMANAS.length;
  return (
    <div style={{ position: "relative", width: w, height: h }}>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{ position: "absolute", left: 30, right: 0, top: (h - 22) * (i / 3), height: 1, background: "#eef1f5" }} />
      ))}
      {[2800, 1867, 933, 0].map((v, i) => (
        <div key={v} style={{ position: "absolute", left: 0, top: (h - 22) * (i / 3) - 6, fontSize: 8, color: TINTA_2 }}>
          {v >= 1000 ? `${(v / 1000).toFixed(1).replace(".", ",")}k` : v}
        </div>
      ))}
      {SEMANAS.map(([l, v], i) => {
        const t = interpolate(frame, [f0 + i * 5, f0 + i * 5 + 22], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
        const bh = ((h - 22) * v * t) / max;
        const ultima = i === SEMANAS.length - 1;
        return (
          <div key={l} style={{ position: "absolute", left: 36 + i * bw, width: bw - 12, bottom: 0, height: h, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end" }}>
            <div style={{ fontSize: 8.5, fontWeight: 700, color: TINTA, opacity: t, marginBottom: 3 }}>{num(v * t)}</div>
            <div style={{ width: "100%", height: bh, borderRadius: "6px 6px 2px 2px", background: ultima ? `linear-gradient(180deg, ${ACENTO}, #f26a1b)` : "linear-gradient(180deg, #6b9cf5, #2f6fe0)" }} />
            <div style={{ fontSize: 8, color: TINTA_2, height: 18, marginTop: 4 }}>{l}</div>
          </div>
        );
      })}
    </div>
  );
};

const KpiCard: React.FC<{ k: (typeof KPIS_R)[0]; i: number; x: number; y: number; w: number; h: number; frame: number; m: boolean; suelto?: boolean }> = ({ k, i, x, y, w, h, frame, m, suelto }) => {
  const oculto = useContext(Ocultos);
  if (!suelto && oculto(`kpi${i}`)) {
    return null;
  }
  const f0 = ESC.reportes[0];
  const e = (d: number) => entra(frame, f0 + d, 12);
  const cuenta = (d: number) => interpolate(frame, [f0 + d, f0 + d + 40], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const [d, l, v, suf, delta, color] = k;
  const c = cuenta(8 + i * 3);
  const valor = suf === "%" ? `${((v * c) / 10).toFixed(1).replace(".", ",")}%` : num(v * c);
  return (
      <div style={{ position: "absolute", left: suelto ? 0 : x, top: suelto ? 0 : y, width: w, height: h, background: "white", borderRadius: 14, boxShadow: "0 6px 18px rgba(15,25,45,0.07)", border: `1px solid ${BORDE}`, padding: m ? "10px 12px" : "14px 14px", boxSizing: "border-box", opacity: suelto ? 1 : e(4 + i * 3), transform: suelto ? undefined : `translateY(${(1 - e(4 + i * 3)) * 14}px)` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ width: m ? 26 : 30, height: m ? 26 : 30, borderRadius: 9, background: `${color}1f`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icono d={d} s={m ? 14 : 16} c={color} w={2.1} />
          </div>
          <div style={{ fontSize: 9, fontWeight: 700, color: VERDE, background: "#e7f6ec", borderRadius: 10, padding: "2px 7px" }}>▲ {delta}</div>
        </div>
        <div style={{ fontSize: m ? 18 : 22, fontWeight: 800, color: TINTA, marginTop: m ? 6 : 10 }}>{valor}</div>
        <div style={{ fontSize: m ? 8.5 : 9.5, color: TINTA_2, marginTop: 2 }}>{l}</div>
      </div>
      );
};

const Reportes: React.FC<{ frame: number; m: boolean }> = ({ frame, m }) => {
  const f0 = ESC.reportes[0];
  const e = (d: number) => entra(frame, f0 + d, 12);
  const cuenta = (d: number) => interpolate(frame, [f0 + d, f0 + d + 40], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const kpis = m ? KPIS_R.slice(0, 4) : KPIS_R;
  const periodos = m ? ["Hoy", "Semana", "Mes", "Mes ant."] : ["Hoy", "Ayer", "Semana", "Mes", "Mes anterior"];
  const chips = (
    <div style={{ position: "absolute", ...(m ? { left: 12, top: 150 } : { right: 28, top: 70 }), display: "flex", gap: 6, background: "white", border: `1px solid ${BORDE}`, borderRadius: 10, padding: 4, opacity: e(2) }}>
      {periodos.map((p) => (
        <div key={p} style={{ fontSize: 10.5, fontWeight: 700, padding: m ? "5px 12px" : "6px 14px", borderRadius: 7, color: p === "Mes" ? "white" : TINTA_2, background: p === "Mes" ? "linear-gradient(135deg, #4b86f0, #2556d6)" : "transparent" }}>
          {p}
        </div>
      ))}
    </div>
  );
  const maxAcc = ACCIONES_R[0][1];
  if (m) {
    return (
      <div style={{ position: "absolute", inset: 0, background: FONDO }}>
        <div style={{ position: "absolute", left: 16, top: 106, fontSize: 17, fontWeight: 800, color: TINTA, opacity: e(0) }}>Performance</div>
        <div style={{ position: "absolute", left: 16, top: 130, fontSize: 9.5, color: TINTA_2, opacity: e(0) }}>Cartera Activa · 01/11 al 14/11/2026</div>
        {chips}
        {kpis.map((k, i) => (
          <KpiCard key={i} k={k} i={i} x={12 + (i % 2) * 189} y={192 + Math.floor(i / 2) * 84} w={177} h={76} frame={frame} m={m} />
        ))}
        <Caja x={12} y={364} w={366} h={214} style={{ borderRadius: 14, opacity: e(16), padding: "12px 14px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: TINTA }}>Gestiones por semana</div>
          <div style={{ marginTop: 10 }}>
            <Barras frame={frame} f0={f0 + 20} w={338} h={164} />
          </div>
        </Caja>
        <Caja x={12} y={590} w={366} h={244} style={{ borderRadius: 14, opacity: e(24), padding: "12px 14px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: TINTA }}>Productividad por gestor</div>
          {GESTORES.slice(0, 4).map(([ini, n, acc, , , pct], i) => {
            const t = cuenta(30 + i * 5);
            return (
              <div key={n} style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12, opacity: e(28 + i * 4) }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: ["#2f6fe0", "#7c3aed", "#2e9e4a", "#f08a2c"][i], color: "white", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{ini}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5 }}>
                    <span style={{ fontWeight: 700, color: TINTA }}>{n}</span>
                    <span style={{ color: TINTA_2 }}>{num(acc * t)} acciones</span>
                  </div>
                  <div style={{ height: 6, background: "#eef1f5", borderRadius: 3, marginTop: 5 }}>
                    <div style={{ width: `${pct * t}%`, height: "100%", borderRadius: 3, background: "linear-gradient(90deg, #6b9cf5, #2f6fe0)" }} />
                  </div>
                </div>
                <div style={{ fontSize: 10.5, fontWeight: 800, color: TINTA, width: 38, textAlign: "right" }}>{(pct * t).toFixed(1).replace(".", ",")}%</div>
              </div>
            );
          })}
        </Caja>
      </div>
    );
  }
  return (
    <div style={{ position: "absolute", inset: 0, background: FONDO }}>
      <div style={{ position: "absolute", left: X0, top: 62, fontSize: 22, fontWeight: 800, color: TINTA, opacity: e(0) }}>Performance y Reportes</div>
      <div style={{ position: "absolute", left: X0, top: 92, fontSize: 11, color: TINTA_2, opacity: e(0) }}>Cartera Activa · 01/11/2026 al 14/11/2026</div>
      {chips}
      {kpis.map((k, i) => (
        <KpiCard key={i} k={k} i={i} x={X0 + i * 218} y={122} w={204} h={104} frame={frame} m={m} />
      ))}
      <Caja x={X0} y={240} w={640} h={290} style={{ borderRadius: 14, opacity: e(16), padding: "14px 18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: TINTA }}>Evolución semanal de gestiones</div>
          <div style={{ display: "flex", gap: 6 }}>
            {["CSV", "EXCEL", "JSON"].map((x) => (
              <div key={x} style={{ fontSize: 9, fontWeight: 700, color: TINTA_2, border: `1px solid ${BORDE}`, borderRadius: 6, padding: "3px 8px" }}>⬇ {x}</div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <Barras frame={frame} f0={f0 + 20} w={604} h={220} />
        </div>
      </Caja>
      <Caja x={X0 + 654} y={240} w={424} h={290} style={{ borderRadius: 14, opacity: e(20), padding: "14px 18px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: TINTA }}>Resultado por tipo de acción</div>
        {ACCIONES_R.map(([l, v, color], i) => {
          const t = cuenta(26 + i * 4);
          return (
            <div key={l} style={{ marginTop: i === 0 ? 18 : 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5 }}>
                <span style={{ color: TINTA }}>{l}</span>
                <span style={{ fontWeight: 700, color: TINTA }}>{num(v * t)}</span>
              </div>
              <div style={{ height: 8, background: "#eef1f5", borderRadius: 4, marginTop: 5 }}>
                <div style={{ width: `${Math.max(1.5, (v / maxAcc) * 100) * t}%`, height: "100%", borderRadius: 4, background: color }} />
              </div>
            </div>
          );
        })}
      </Caja>
      <Caja x={X0} y={544} w={CW} h={256} style={{ borderRadius: 14, opacity: e(26), padding: "14px 18px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: TINTA }}>Productividad por gestor</div>
        <div style={{ display: "flex", fontSize: 9.5, color: TINTA_2, marginTop: 12, paddingBottom: 6, borderBottom: `1px solid ${BORDE}` }}>
          {["Gestor", "Acciones", "Efectivas", "Promesas", "Cumplimiento de promesas"].map((h, i) => (
            <div key={h} style={{ flex: i === 0 ? 2 : i === 4 ? 2.6 : 1 }}>{h}</div>
          ))}
        </div>
        {GESTORES.map(([ini, n, acc, ef, pr, pct], i) => {
          const t = cuenta(32 + i * 5);
          return (
            <div key={n} style={{ display: "flex", alignItems: "center", height: 36, fontSize: 11, color: TINTA, borderBottom: `1px solid ${BORDE}`, opacity: e(30 + i * 4) }}>
              <div style={{ flex: 2, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: ["#2f6fe0", "#7c3aed", "#2e9e4a", "#f08a2c", "#0ea5b7"][i], color: "white", fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{ini}</div>
                <span style={{ fontWeight: 700 }}>{n}</span>
              </div>
              <div style={{ flex: 1 }}>{num(acc * t)}</div>
              <div style={{ flex: 1 }}>{num(ef * t)}</div>
              <div style={{ flex: 1 }}>{num(pr * t)}</div>
              <div style={{ flex: 2.6, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1, height: 7, background: "#eef1f5", borderRadius: 4 }}>
                  <div style={{ width: `${pct * t}%`, height: "100%", borderRadius: 4, background: pct >= 60 ? "linear-gradient(90deg, #5fd08a, #2e9e4a)" : "linear-gradient(90deg, #ffc27a, #f08a2c)" }} />
                </div>
                <div style={{ width: 40, fontWeight: 800 }}>{(pct * t).toFixed(1).replace(".", ",")}%</div>
              </div>
            </div>
          );
        })}
      </Caja>
    </div>
  );
};

// ---------- Finger ----------
const dedoDe = (m: boolean): [number, number, number][] => {
  const au = autoPos(m);
  const MD = modalAsig(m);
  const o0 = opcionPos(m, 0);
  const jp = clientePos(m, 1);
  const F = m ? FORM_M : FORM_T;
  const cx = F.x + F.w / 2;
  const Y = formY(m);
  return [
    [0, m ? 260 : 700, m ? 700 : 640],
    [TAP_ACTIVOS - 2, o0.x + o0.w / 2, o0.y + o0.h / 2],
    [TAP_JAVIER - 2, jp.x + jp.w / 2, jp.y + jp.h / 2],
    [TAP_SELECT - 2, cx, Y.select + 19],
    [TAP_PROMESA - 2, cx, Y.dropdown + 34 + 17],
    [TAP_GUARDAR - 2, cx, guardarY(m, 1) + 17],
    [TAP_AUTO - 2, au.x + au.w / 2, au.y + au.h / 2],
    [TAP_PREVIEW - 2, MD.x + MD.w / 2, MD.y + MD.preview + 16],
    [TAP_CONFIRMAR - 2, MD.x + MD.w / 2, MD.y + MD.confirmar + 17],
    [TAP_CONFIRMAR + 40, MD.x + MD.w / 2 + 60, MD.y + MD.confirmar + 140],
  ];
};
const posDedo = (frame: number, m: boolean) => {
  const D = dedoDe(m);
  let p = { x: D[0][1], y: D[0][2] };
  for (let i = 1; i < D.length; i++) {
    const [f, x, y] = D[i];
    const desde = Math.max(D[i - 1][0], f - 18);
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

const Pagina: React.FC<{ frame: number; m: boolean }> = ({ frame, m }) => {
  const escenas: [Escena, React.FC<{ frame: number; m: boolean }>][] = [
    ["home", Home],
    ["cluster", Cluster],
    ["cliente", ClienteFicha],
    ["cubo", CuboPantalla],
    ["asignacion", Asignacion],
    ["reportes", Reportes],
  ];
  const actual = (Object.keys(ESC) as Escena[]).filter((e) => frame >= ESC[e][0]).pop() ?? "home";
  const dedo = posDedo(frame, m);
  const tap = TAPS.find((f) => frame >= f && frame < f + 16);
  const onda = tap === undefined ? 0 : (frame - tap) / 16;
  const presion = tap === undefined ? 0 : interpolate(frame - tap, [0, 3, 8], [0, 1, 0], clamp);
  const dedoVis =
    interpolate(frame, [26, 40], [0, 1], clamp) *
    interpolate(frame, [TAP_GUARDAR + 30, TAP_GUARDAR + 44, TAP_AUTO - 30, TAP_AUTO - 18], [1, 0, 0, 1], clamp) *
    interpolate(frame, [TAP_CONFIRMAR + 30, TAP_CONFIRMAR + 44], [1, 0], clamp);
  return (
    // Dark root (same as the header) so no light edge shows between the
    // device bezel and the header; the light page background starts below it.
    <div style={{ position: "relative", width: m ? MW : PW, height: m ? MH : PH, background: HEADER_BG, fontFamily: FUENTE, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: m ? M_HEADER : HEADER, bottom: 0, background: FONDO }} />
      {escenas.map(([e, C]) => {
        const [a, b] = ESC[e];
        const v = interpolate(frame, [a, a + 6, b - 6, b], [0, 1, 1, 0], clamp);
        if (v <= 0.001) {
          return null;
        }
        return (
          <div key={e} style={{ position: "absolute", inset: 0, opacity: v, clipPath: `inset(${m ? M_HEADER : HEADER}px 0 0 0)` }}>
            <C frame={frame} m={m} />
          </div>
        );
      })}
      {m ? <MarcoMovil /> : <MarcoTablet activo={actual === "asignacion" ? 2 : actual === "reportes" ? 3 : 1} />}
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

// Tablet (16:9) or phone (9:16), tilted and seen from the left; top at 30%
// of the screen height, bottom near 94%.
export const CollectionsAxonia: React.FC<z.infer<typeof collectionsSchema>> = ({ fondo, paleta }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const m = height > width;
  const tipo = m ? "celular" : "tablet";
  const { w, h } = pantallaDe(tipo, m);
  const { H: EH } = exteriorDe(tipo, w, h);
  const esc = (height * 0.64) / EH;
  const t = spring({ frame, fps, config: { damping: 18, stiffness: 80 } });
  const giro = m ? "rotateY(14deg) rotateX(6deg) rotateZ(2deg)" : "rotateY(16deg) rotateX(8deg) rotateZ(2deg)";
  return (
    <AbsoluteFill style={{ fontFamily: FUENTE }}>
      <FondoAbstracto paleta={paleta} estilo={fondo} />
      <AbsoluteFill style={{ perspective: 2600 }}>
        <div style={{ position: "absolute", left: width / 2, top: height * 0.62, opacity: t, transform: `translate(-50%, -50%) scale(${esc}) ${giro}` }}>
          <Dispositivo tipo={tipo} w={w} h={h}>
            <Pagina frame={frame} m={m} />
          </Dispositivo>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- Dynamic 16:9 version: camera moves and elements leaving the screen ----------
// Camera keyframes: zoom, focus point on the screen (page px), tilt and the
// vertical position of the device centre (fraction of the video height).
type Toma = { f: number; z: number; px: number; py: number; ry: number; rx: number; rz: number; cy: number };
const CENTRO = { px: PW / 2, py: PH / 2 };
const TOMAS: Toma[] = [
  { f: 0, z: 0.92, ...CENTRO, ry: 22, rx: 10, rz: 3, cy: 0.62 },
  { f: 58, z: 1.5, px: 420, py: 420, ry: 9, rx: 5, rz: 1, cy: 0.56 },
  { f: 92, z: 1.5, px: 420, py: 420, ry: 9, rx: 5, rz: 1, cy: 0.56 },
  { f: 122, z: 1, ...CENTRO, ry: -15, rx: 7, rz: -2, cy: 0.62 },
  { f: 190, z: 1.55, px: 475, py: 230, ry: -7, rx: 4, rz: -1, cy: 0.56 },
  { f: 214, z: 1.55, px: 475, py: 230, ry: -7, rx: 4, rz: -1, cy: 0.56 },
  { f: 242, z: 1.05, ...CENTRO, ry: 13, rx: 6, rz: 1.5, cy: 0.62 },
  { f: 264, z: 1.6, px: 920, py: 440, ry: 6, rx: 3, rz: 0.5, cy: 0.56 },
  { f: 352, z: 1.6, px: 920, py: 520, ry: 6, rx: 3, rz: 0.5, cy: 0.56 },
  { f: 380, z: 1.35, px: 520, py: 490, ry: 9, rx: 4, rz: 1, cy: 0.57 },
  { f: 444, z: 1.35, px: 520, py: 490, ry: 9, rx: 4, rz: 1, cy: 0.57 },
  { f: 472, z: 1, ...CENTRO, ry: 0, rx: 5, rz: 0, cy: 0.6 },
  { f: 632, z: 1, px: 590, py: 440, ry: 3, rx: 4, rz: 0, cy: 0.6 },
  { f: 652, z: 1, ...CENTRO, ry: -15, rx: 7, rz: -2, cy: 0.62 },
  { f: 698, z: 1.35, px: 590, py: 430, ry: -6, rx: 3, rz: -0.5, cy: 0.56 },
  { f: 812, z: 1.35, px: 590, py: 470, ry: -6, rx: 3, rz: -0.5, cy: 0.56 },
  { f: 846, z: 1, ...CENTRO, ry: -11, rx: 6, rz: -1.5, cy: 0.62 },
  { f: 872, z: 1, ...CENTRO, ry: 16, rx: 8, rz: 2, cy: 0.62 },
  { f: 930, z: 1.3, px: 560, py: 180, ry: 9, rx: 5, rz: 1, cy: 0.56 },
  { f: COLLECTIONS_FRAMES, z: 1, ...CENTRO, ry: 12, rx: 6, rz: 1.5, cy: 0.62 },
];
const toma = (frame: number): Toma => {
  for (let k = 1; k < TOMAS.length; k++) {
    const a = TOMAS[k - 1];
    const b = TOMAS[k];
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
  return TOMAS[TOMAS.length - 1];
};

// Elements that jump out of the screen and settle back.
const SALTO_JAVIER = [146, 162, 176, 192];
const SALTO_KPI = [ESC.reportes[0] + 58, ESC.reportes[0] + 72, ESC.reportes[0] + 88, ESC.reportes[0] + 104];
const saltoSeg = (i: number) => [SEG_CARDS + i * 8, SEG_CARDS + i * 8 + 30];
const ocultoEn = (frame: number) => (id: string) => {
  const dentro = (r: number[]) => frame > r[0] && frame < r[r.length - 1];
  if (id === "javier") {
    return dentro(SALTO_JAVIER);
  }
  if (id.startsWith("seg")) {
    return dentro(saltoSeg(Number(id.slice(3))));
  }
  if (id.startsWith("kpi")) {
    return dentro(SALTO_KPI);
  }
  return false;
};

const Salta: React.FC<{ x: number; y: number; w: number; h: number; transform: string; sombra: number; children: React.ReactNode }> = ({ x, y, w, h, transform, sombra, children }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, transform, transformStyle: "preserve-3d" }}>
    <div style={{ position: "absolute", inset: 0, borderRadius: 14, boxShadow: `0 ${30 * sombra}px ${60 * sombra}px rgba(0,0,0,${0.35 * sombra})` }} />
    {children}
  </div>
);

const Saltos: React.FC<{ frame: number }> = ({ frame }) => {
  const oculto = ocultoEn(frame);
  const piezas: React.ReactNode[] = [];
  if (oculto("javier")) {
    const t = interpolate(frame, SALTO_JAVIER, [0, 1, 1, 0], { ...clamp, easing: Easing.inOut(Easing.cubic) });
    const p = clientePos(false, 1);
    piezas.push(
      <Salta key="javier" x={p.x} y={p.y} w={p.w} h={p.h} sombra={t} transform={`translate3d(0, ${10 * t}px, ${170 * t}px) rotateX(${-12 * t}deg) rotateZ(${-3 * t}deg)`}>
        <TarjetaCliente c={CLIENTES[1]} i={1} frame={frame} m={false} suelto />
      </Salta>,
    );
  }
  SEGS.forEach((_, i) => {
    if (!oculto(`seg${i}`)) {
      return;
    }
    const r = saltoSeg(i);
    const t = interpolate(frame, r, [1, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
    const op = interpolate(frame, [r[0], r[0] + 6], [0, 1], clamp);
    const p = segCardPos(false, i);
    piezas.push(
      <Salta key={`seg${i}`} x={p.x} y={p.y} w={p.w} h={p.h} sombra={Math.max(0, t)} transform={`translate3d(0, 0, ${380 * t}px)`}>
        <div style={{ opacity: op }}>
          <SegCard frame={frame} m={false} i={i} suelto />
        </div>
      </Salta>,
    );
  });
  KPIS_R.forEach((k, i) => {
    if (!oculto(`kpi${i}`)) {
      return;
    }
    const t = interpolate(frame, SALTO_KPI, [0, 1, 1, 0], { ...clamp, easing: Easing.inOut(Easing.cubic) });
    piezas.push(
      <Salta key={`kpi${i}`} x={X0 + i * 218} y={122} w={204} h={104} sombra={t} transform={`translate3d(0, ${18 * t}px, ${140 * t}px)`}>
        <KpiCard k={k} i={i} x={0} y={0} w={204} h={104} frame={frame} m={false} suelto />
      </Salta>,
    );
  });
  return <>{piezas}</>;
};

export const CollectionsDinamico: React.FC<z.infer<typeof collectionsSchema>> = ({ fondo, paleta }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const { w, h } = pantallaDe("tablet", false);
  const { H: EH } = exteriorDe("tablet", w, h);
  const c = toma(frame);
  const esc = ((height * 0.64) / EH) * c.z;
  const t = spring({ frame, fps, config: { damping: 18, stiffness: 80 } });
  // Device chrome offset (padding + border) so the overlay lines up with the screen.
  const BORDE_TABLET = 27;
  const dx = -(c.px - PW / 2) * esc;
  // Keep the top 20% of the video free (for titles): if the zoom pushes the
  // device above that line, move it down (with a margin for the tilt).
  const dy0 = -(c.py - PH / 2) * esc;
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
          <Ocultos.Provider value={ocultoEn(frame)}>
            <Dispositivo tipo="tablet" w={w} h={h}>
              <Pagina frame={frame} m={false} />
            </Dispositivo>
            <div style={{ position: "absolute", left: BORDE_TABLET, top: BORDE_TABLET, width: PW, height: PH, transformStyle: "preserve-3d", fontFamily: FUENTE }}>
              <Saltos frame={frame} />
            </div>
          </Ocultos.Provider>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
