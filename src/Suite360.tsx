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

// Credit management suite 360 (1920x1080, 15s): the modules of the suite
// (channels, lead funnel, risk manager, loan marketplace, loan core,
// collections CRM and contact flow) appear one by one, linked by hand-drawn
// arrows, while the camera zooms in on each; at the end it pulls back to
// show the whole suite. Each module is a small mock UI drawn in code.

export const suite360Schema = z.object({
  fondo: z.enum(["ondas", "red", "aurora", "geometrico"]),
  paleta: z.enum(["azul", "gris"]),
});

const FUENTE = "Montserrat, sans-serif";
const ACENTO = "#FF8C42";
const NAVY = "#1f2d4d";
const GRIS = "#dfe3ea";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const SUITE_FRAMES = 480;

type Id = "canales" | "funnel" | "riesgo" | "marketplace" | "core" | "crm" | "contact";
const MODULOS: { id: Id; nombre: string; x: number; y: number; w: number; h: number }[] = [
  { id: "canales", nombre: "Onboarding", x: 70, y: 250, w: 330, h: 240 },
  { id: "funnel", nombre: "Lead Funnel", x: 90, y: 660, w: 290, h: 230 },
  { id: "riesgo", nombre: "Gestor de Riesgo", x: 500, y: 470, w: 400, h: 190 },
  { id: "marketplace", nombre: "Marketplace de Préstamos", x: 960, y: 120, w: 440, h: 210 },
  { id: "core", nombre: "Core de Préstamos", x: 960, y: 640, w: 440, h: 250 },
  { id: "crm", nombre: "CRM de Cobranzas", x: 1480, y: 250, w: 380, h: 240 },
  { id: "contact", nombre: "Contact Flow", x: 1480, y: 650, w: 380, h: 260 },
];

// Arrow drawn as each module (from the second on) appears.
const FLECHAS: { d: string; doble?: boolean }[] = [
  { d: "M 235 530 L 235 615", doble: true },
  { d: "M 415 300 Q 700 250 760 455" },
  { d: "M 860 458 C 870 400 885 345 935 305" },
  { d: "M 720 690 Q 760 790 940 760" },
  { d: "M 1408 740 C 1452 700 1428 470 1466 405" },
  { d: "M 1670 525 L 1670 610", doble: true },
];

// Timeline (frames).
const PRIMERO = 22;
const PASO = 56;
const aparicion = (i: number) => PRIMERO + i * PASO;
const ULTIMO = aparicion(MODULOS.length - 1);
const ALEJA = ULTIMO + 40;
const ALEJA_FIN = ALEJA + 48;

type Cam = { x: number; y: number; z: number };
const camDe = (i: number): Cam => {
  const m = MODULOS[i];
  return {
    x: m.x + m.w / 2,
    y: m.y + m.h / 2 - 14,
    z: Math.min((1920 * 0.56) / m.w, (1080 * 0.56) / (m.h + 40), 2.6),
  };
};
const GENERAL: Cam = { x: 960, y: 540, z: 1 };

const camara = (frame: number): Cam => {
  const c0 = camDe(0);
  const claves: { f: number; c: Cam }[] = [
    { f: 0, c: { ...c0, z: c0.z * 0.8 } },
    { f: aparicion(0) + 40, c: c0 },
  ];
  for (let i = 1; i < MODULOS.length; i++) {
    claves.push({ f: aparicion(i) + 4, c: camDe(i) });
    claves.push({ f: aparicion(i) + 30, c: camDe(i) });
  }
  claves.push({ f: ALEJA, c: camDe(MODULOS.length - 1) });
  claves.push({ f: ALEJA_FIN, c: GENERAL });
  for (let k = 1; k < claves.length; k++) {
    const a = claves[k - 1];
    const b = claves[k];
    if (frame <= b.f) {
      const t = interpolate(frame, [a.f, b.f], [0, 1], {
        ...clamp,
        easing: Easing.inOut(Easing.cubic),
      });
      // Zoom interpolated in log space so it feels even.
      let z = Math.exp(Math.log(a.c.z) + (Math.log(b.c.z) - Math.log(a.c.z)) * t);
      // Between two modules the camera pulls back mid-way, so the arrow and
      // both modules stay in view instead of empty background.
      if (b.c !== GENERAL && (a.c.x !== b.c.x || a.c.y !== b.c.y)) {
        z *= 1 - 0.42 * Math.sin(Math.PI * t);
      }
      return { x: a.c.x + (b.c.x - a.c.x) * t, y: a.c.y + (b.c.y - a.c.y) * t, z };
    }
  }
  return GENERAL;
};

const progreso = (frame: number, desde: number, i: number, paso = 2, dur = 8) =>
  interpolate(frame, [desde + i * paso, desde + i * paso + dur], [0, 1], clamp);

const TINTA = "#1f2430";
const TINTA_2 = "#6b7280";
const VERDE = "#2e9e4a";
const AMARILLO = "#d9a21b";
const ROJO = "#d9433a";
const AZUL = "#2f6fe0";

const num = (n: number, dec = 0) =>
  n.toLocaleString("es-AR", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const pesos = (n: number, dec = 0) => `$ ${num(n, dec)}`;

// Plain text with a fixed size; the mock screens use tiny type that reads
// once the camera zooms in.
const T: React.FC<{
  s?: number;
  b?: boolean;
  c?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ s = 7, b, c = TINTA, style, children }) => (
  <div style={{ fontSize: s, fontWeight: b ? 700 : 500, color: c, whiteSpace: "nowrap", lineHeight: 1.25, ...style }}>
    {children}
  </div>
);

const Pill: React.FC<{ fondo: string; color?: string; s?: number; children: React.ReactNode }> = ({
  fondo,
  color = "white",
  s = 6,
  children,
}) => (
  <span
    style={{
      fontSize: s,
      fontWeight: 700,
      color,
      background: fondo,
      borderRadius: 3,
      padding: "1.5px 4px",
      whiteSpace: "nowrap",
      letterSpacing: 0.2,
    }}
  >
    {children}
  </span>
);

const Caja: React.FC<{ titulo: string; style?: React.CSSProperties; children: React.ReactNode }> = ({
  titulo,
  style,
  children,
}) => (
  <div style={{ border: `1px solid ${GRIS}`, borderRadius: 5, padding: "5px 6px", display: "flex", flexDirection: "column", gap: 3.5, ...style }}>
    <T s={6.5} b c={NAVY} style={{ textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 1 }}>
      {titulo}
    </T>
    {children}
  </div>
);

const Dato: React.FC<{ k: string; v: React.ReactNode; o?: number }> = ({ k, v, o = 1 }) => (
  <div style={{ display: "flex", justifyContent: "space-between", gap: 4, opacity: o }}>
    <T s={6.2} c={TINTA_2}>{k}</T>
    <T s={6.2} b>{v}</T>
  </div>
);

// Generic ID card (front and back) and a drawn selfie for the onboarding
// documents.
// Drawn portrait (60 x 70 box) used in the ID photo and the selfie.
const Persona: React.FC<{ fondo: string }> = ({ fondo }) => (
  <g>
    <rect width={60} height={70} fill={fondo} />
    {/* Jacket, shirt and lapels */}
    <path d="M5 70 C6 59 15 53.5 24.5 52.5 L35.5 52.5 C45 53.5 54 59 55 70 Z" fill="#2c4d75" />
    <path d="M24.5 52.5 L30 63 L35.5 52.5 Z" fill="#e3edf8" />
    <path d="M24.5 52.5 L28.5 70 M35.5 52.5 L31.5 70" stroke="#1f3a5c" strokeWidth={1} />
    <path d="M24.5 52.5 L27.5 58 L30 55 Z M35.5 52.5 L32.5 58 L30 55 Z" fill="#f7fafd" />
    {/* Neck */}
    <path d="M25.5 43 L25.5 53 C27.5 55 32.5 55 34.5 53 L34.5 43 Z" fill="#c98f6c" />
    <path d="M25.5 46 C28 49 32 49 34.5 46 L34.5 43 L25.5 43 Z" fill="#b57b59" />
    {/* Ears */}
    <ellipse cx={18.6} cy={34} rx={2.2} ry={3.6} fill="#d39a77" />
    <ellipse cx={41.4} cy={34} rx={2.2} ry={3.6} fill="#d39a77" />
    {/* Face */}
    <path d="M19 29 C19 19.5 41 19.5 41 29 L41 36 C41 43.5 36 48.5 30 48.5 C24 48.5 19 43.5 19 36 Z" fill="#e0a986" />
    <path d="M22 41 C24.5 46.5 35.5 46.5 38 41 C37 46 33.5 48.5 30 48.5 C26.5 48.5 23 46 22 41 Z" fill="#cf9572" opacity={0.6} />
    {/* Hair with side part */}
    <path d="M18.4 32 C16.5 18.5 24 12.5 31 13 C38.5 13 44 18.5 41.6 32 C40.8 27.5 39.5 24.5 36.5 22.8 C31 25.5 25 25.2 21.5 23.8 C20 26 19 28.8 18.4 32 Z" fill="#3a2a20" />
    <path d="M24 16.5 C28 14.5 34 14.8 37.5 17.5 C33.5 16.6 28.5 16.4 24 16.5 Z" fill="#5a4334" />
    {/* Brows, eyes, nose, mouth */}
    <path d="M22.8 29.4 C24.2 28.4 26.4 28.4 27.6 29.2 M32.4 29.2 C33.6 28.4 35.8 28.4 37.2 29.4" stroke="#3a2a20" strokeWidth={1.1} strokeLinecap="round" fill="none" />
    <ellipse cx={25.2} cy={32.6} rx={1.9} ry={1.3} fill="white" />
    <ellipse cx={34.8} cy={32.6} rx={1.9} ry={1.3} fill="white" />
    <circle cx={25.4} cy={32.7} r={1} fill="#3b2a20" />
    <circle cx={34.6} cy={32.7} r={1} fill="#3b2a20" />
    <path d="M30 33.5 C29.6 36 29 37.5 28.6 38.2 C29.4 38.8 30.6 38.8 31.4 38.4" stroke="#b57b59" strokeWidth={0.8} fill="none" strokeLinecap="round" />
    <path d="M26.4 41.2 C28.4 43 31.6 43 33.6 41.2 C31.6 42 28.4 42 26.4 41.2 Z" fill="#9c4f3f" stroke="#9c4f3f" strokeWidth={0.6} strokeLinejoin="round" />
    <ellipse cx={23} cy={38} rx={1.8} ry={1} fill="#e8907a" opacity={0.35} />
    <ellipse cx={37} cy={38} rx={1.8} ry={1} fill="#e8907a" opacity={0.35} />
  </g>
);

const DniFrente: React.FC = () => (
  <svg viewBox="0 0 86 54" width="94%">
    <rect x={0.5} y={0.5} width={85} height={53} rx={4} fill="#dfe9f3" stroke="#9fb3c8" />
    <rect x={0.5} y={0.5} width={85} height={9} rx={4} fill="#5f86b3" />
    <rect x={0.5} y={5} width={85} height={4.5} fill="#5f86b3" />
    <text x={43} y={6.6} fontSize={4} fontWeight={700} fill="white" textAnchor="middle" fontFamily="Montserrat">
      DOCUMENTO DE IDENTIDAD
    </text>
    <rect x={5} y={14} width={22} height={28} rx={2} fill="#eef2f6" stroke="#b9c7d6" strokeWidth={0.4} />
    <svg x={5} y={14} width={22} height={28} viewBox="9 9 42 54" preserveAspectRatio="xMidYMid slice">
      <Persona fondo="#eef2f6" />
    </svg>
    {[
      ["APELLIDO", "PEREZ"],
      ["NOMBRE", "JAVIER"],
      ["NACIMIENTO", "14 MAY 1985"],
      ["VENCIMIENTO", "10 JUN 2034"],
    ].map(([k, v], i) => (
      <g key={k}>
        <text x={31} y={16 + i * 8} fontSize={2.6} fill="#6b7f96" fontFamily="Montserrat">{k}</text>
        <text x={31} y={19.6 + i * 8} fontSize={3.6} fontWeight={700} fill="#1f2d4d" fontFamily="Montserrat">{v}</text>
      </g>
    ))}
    <path d="M60 46 C64 42 67 49 71 45 S78 43 80 46" fill="none" stroke="#1f2d4d" strokeWidth={0.8} />
  </svg>
);

const DniDorso: React.FC = () => (
  <svg viewBox="0 0 86 54" width="94%">
    <rect x={0.5} y={0.5} width={85} height={53} rx={4} fill="#e6edf4" stroke="#9fb3c8" />
    <g fill="none" stroke="#7d93b6" strokeWidth={0.7}>
      {[0, 1, 2, 3, 4].map((i) => (
        <ellipse key={i} cx={72} cy={16} rx={2 + i * 1.6} ry={3 + i * 1.9} />
      ))}
    </g>
    {Array.from({ length: 34 }).map((_, i) => (
      <rect key={i} x={6 + i * 1.6} y={6} width={i % 3 === 0 ? 1 : 0.5} height={14} fill="#1f2430" />
    ))}
    <rect x={4} y={34} width={78} height={16} rx={1.5} fill="white" />
    {["IDARG004512<<<<<<<<<<<<", "8505148M3406106ARG<<<<<", "PEREZ<<JAVIER<<<<<<<<<<"].map((l, i) => (
      <text key={i} x={6} y={39 + i * 4.6} fontSize={3.4} fill="#1f2430" fontFamily="monospace">{l}</text>
    ))}
  </svg>
);

const Selfie: React.FC = () => (
  <svg viewBox="0 0 60 70" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
    <Persona fondo="url(#fondoSelfie)" />
    <defs>
      <linearGradient id="fondoSelfie" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#dbe8f2" />
        <stop offset="1" stopColor="#b9cfe0" />
      </linearGradient>
    </defs>
    <ellipse cx={30} cy={33} rx={17} ry={21} fill="none" stroke="white" strokeWidth={1.1} strokeDasharray="3 2" opacity={0.95} />
  </svg>
);

const Canales: React.FC<{ t: number }> = ({ t }) => {
  const col = [
    {
      titulo: "Datos personales",
      datos: [
        ["Nombre", "Javier Perez"],
        ["Nro. cliente", "004512"],
        ["Nacimiento", "14/05/1985"],
        ["Teléfono", "11 5555-0123"],
        ["Email", "jperez@mail.com"],
        ["Canal", "WhatsApp"],
      ],
    },
    {
      titulo: "Laboral",
      datos: [
        ["Empleador", "Acme S.A."],
        ["Antigüedad", "6 años"],
        ["Ingreso", pesos(1850000)],
        ["Actividad", "Dependencia"],
        ["Sit. BCRA", "1 · Normal"],
        ["Score", "742"],
      ],
    },
    {
      titulo: "Domicilio",
      datos: [
        ["Calle", "Rivadavia 4520"],
        ["Localidad", "CABA"],
        ["C.P.", "1424"],
        ["Provincia", "Bs. As."],
        ["Vivienda", "Propia"],
        ["Validado", "✓ Sí"],
      ],
    },
  ];
  return (
    <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 7, height: "100%", boxSizing: "border-box" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <T s={9} b c={NAVY} style={{ flex: 1 }}>Análisis del Cliente</T>
        {["Simular", "Legajo", "Contrato", "Factura"].map((b, i) => (
          <div key={b} style={{ opacity: progreso(t, 4, i) }}>
            <Pill fondo={i === 3 ? "#5b6b85" : NAVY} s={5.8}>{b}</Pill>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {col.map((c, ci) => (
          <Caja key={c.titulo} titulo={c.titulo} style={{ flex: 1 }}>
            {c.datos.map(([k, v], r) => (
              <Dato key={k} k={k} v={k === "Validado" ? <span style={{ color: VERDE }}>{v}</span> : v} o={progreso(t, 8, ci * 6 + r, 1)} />
            ))}
          </Caja>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6, flex: 1 }}>
        <Caja titulo="Documentación" style={{ flex: 1.6 }}>
          <div style={{ display: "flex", gap: 5, flex: 1 }}>
            {["DNI frente", "DNI dorso", "Selfie"].map((d, i) => {
              const p = progreso(t, 16, i, 3);
              return (
                <div key={d} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, opacity: p, transform: `scale(${0.8 + 0.2 * p})` }}>
                  <div
                    style={{
                      flex: 1,
                      borderRadius: 3,
                      background: "#eef1f5",
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    {[<DniFrente key="f" />, <DniDorso key="d" />, <Selfie key="s" />][i]}
                    <div style={{ position: "absolute", right: 2, top: 2, width: 9, height: 9, borderRadius: "50%", background: VERDE, color: "white", fontSize: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>✓</div>
                  </div>
                  <T s={5.8} c={TINTA_2} style={{ textAlign: "center" }}>{d}</T>
                </div>
              );
            })}
          </div>
        </Caja>
        <Caja titulo="Contactos" style={{ flex: 1 }}>
          {[
            ["Web", "12/11"],
            ["WhatsApp", "13/11"],
            ["Sucursal", "08/10"],
          ].map(([c, f], i) => (
            <div key={c} style={{ display: "flex", alignItems: "center", gap: 4, opacity: progreso(t, 20, i, 3) }}>
              <T s={6.2} b style={{ flex: 1 }}>{c}</T>
              <T s={6} c={TINTA_2}>{f}</T>
              <Pill fondo="#3a3f48" s={5.5}>Ver</Pill>
            </div>
          ))}
        </Caja>
      </div>
    </div>
  );
};

const ETAPAS: [string, number][] = [
  ["Visitas", 12480],
  ["Leads", 4215],
  ["Datos validados", 2960],
  ["Score aprobado", 1874],
  ["Oferta aceptada", 1122],
  ["Firma digital", 986],
  ["Desembolsados", 912],
];
const Funnel: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ padding: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%", boxSizing: "border-box" }}>
    <T s={8.5} b c={NAVY} style={{ letterSpacing: 1 }}>FUNNEL DE ORIGINACIÓN</T>
    <div style={{ display: "flex", gap: 3, background: "#5a5f68", borderRadius: 4, padding: 3 }}>
      {["Hoy", "7 días", "30 días", "Web", "WhatsApp"].map((f, i) => (
        <Pill key={f} fondo={i === 2 ? "#e0493f" : "#d0d4da"} color={i === 2 ? "white" : TINTA} s={5.5}>
          {f}
        </Pill>
      ))}
    </div>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, marginTop: 2 }}>
      {ETAPAS.map(([nombre, n], i) => {
        const p = progreso(t, 6, i, 3, 10);
        const w = 250 - i * 25;
        return (
          <div
            key={nombre}
            style={{
              width: w,
              height: 18,
              clipPath: "polygon(0 0, 100% 0, calc(100% - 12px) 100%, 12px 100%)",
              background: `linear-gradient(90deg, #2b2d31, #4a4d54, #2b2d31)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              opacity: p,
              transform: `translateY(${(1 - p) * -10}px)`,
            }}
          >
            <T s={6} c="#d6d9de">{nombre}</T>
            <T s={6.5} b c="white">{num(Math.round(n * progreso(t, 10, i, 3, 18)))}</T>
          </div>
        );
      })}
    </div>
    <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 3, opacity: progreso(t, 34, 0) }}>
      <T s={6.5} c={TINTA_2}>Conversión</T>
      <T s={9} b c={ACENTO}>7,3%</T>
    </div>
  </div>
);

const SERVICIOS = ["Renaper", "BCRA", "Bureau crédito", "Score interno", "Antifraude", "Ingresos", "Modelo IA", "Listas PEP"];
const NODOS = [
  { n: "Renaper", r: "Identidad OK", c: VERDE },
  { n: "BCRA", r: "Situación 1", c: VERDE },
  { n: "Score", r: "742 · Bajo", c: AZUL },
  { n: "Decisión", r: "Aprobado", c: ACENTO },
];
const Riesgo: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ height: "100%", background: "#d4d8de", padding: 8, boxSizing: "border-box", display: "flex", gap: 8 }}>
    <div style={{ width: 82, background: "white", borderRadius: 4, padding: 6, display: "flex", flexDirection: "column", gap: 4 }}>
      <T s={7} b c={NAVY}>Servicios</T>
      {SERVICIOS.map((s, i) => (
        <div key={s} style={{ display: "flex", alignItems: "center", gap: 3, opacity: progreso(t, 4, i, 1), background: "#eef1f5", borderRadius: 2, padding: "1.5px 3px" }}>
          <div style={{ width: 6, height: 6, borderRadius: 1.5, background: i < 3 || i === 3 ? NAVY : "#9aa3b2" }} />
          <T s={5.8}>{s}</T>
        </div>
      ))}
    </div>
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <T s={7} b c={NAVY}>Estrategia de originación</T>
        <T s={6.5} c={TINTA_2}>Costo por consulta: <b style={{ color: TINTA }}>$ 260,00</b></T>
      </div>
      <div style={{ flex: 1, background: "#eaf1fb", border: "1px solid #b5c8e6", borderRadius: 4, position: "relative" }}>
        <svg style={{ position: "absolute", inset: 0 }} width="100%" height="100%">
          <line x1="15%" y1="42%" x2="85%" y2="42%" stroke="#7d93b6" strokeWidth={1.5} strokeDasharray="4 3" opacity={progreso(t, 26, 0, 1, 12)} />
        </svg>
        {NODOS.map((nodo, i) => {
          const p = spring({ frame: t - 12 - i * 5, fps: 30, config: { damping: 14 } });
          return (
            <div
              key={nodo.n}
              style={{
                position: "absolute",
                left: `${4 + i * 24.5}%`,
                top: "14%",
                width: "21%",
                height: "56%",
                background: "white",
                borderRadius: 3,
                border: `1px solid ${i === 3 ? ACENTO : "#b5c8e6"}`,
                overflow: "hidden",
                transform: `scale(${p})`,
              }}
            >
              <div style={{ background: NAVY, padding: "2px 4px" }}>
                <T s={6} b c="white">{nodo.n}</T>
              </div>
              <div style={{ padding: "4px 4px", display: "flex", flexDirection: "column", gap: 3 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: nodo.c }} />
                  <T s={6} b>{nodo.r}</T>
                </div>
                {i === 3 ? <T s={6.5} b c={ACENTO}>{pesos(2500000)}</T> : <T s={5.5} c={TINTA_2}>0,4 s</T>}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
        <T s={6} c={TINTA_2}>Nombre</T>
        <div style={{ width: 110, background: "white", borderRadius: 2, padding: "2px 4px" }}>
          <T s={6}>Alta préstamos personales</T>
        </div>
        <div style={{ flex: 1 }} />
        <Pill fondo="#3a8ee6" s={6}>Simular</Pill>
        <Pill fondo="#3a8ee6" s={6}>Guardar</Pill>
      </div>
    </div>
  </div>
);

const ENTIDADES = [
  { n: "Banco Norte", c: "#1f8a4c", tna: "92%", max: "5 M", req: true },
  { n: "Crédito Ya", c: "#f26b1d", tna: "98%", max: "3 M", req: true },
  { n: "Fintech Uno", c: "#6b3fd4", tna: "105%", max: "2 M", req: true },
  { n: "Coop. Centro", c: "#2a6f5b", tna: "110%", max: "1,5 M", req: true },
  { n: "Banco Plata", c: "#1d2a4d", tna: "118%", max: "4 M", req: false },
  { n: "Mutual Sur", c: "#151515", tna: "125%", max: "1 M", req: false },
];
const Marketplace: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ height: "100%", background: "#e4e7ec", padding: 9, boxSizing: "border-box", display: "flex", gap: 9 }}>
    <div style={{ flex: 1, background: "white", borderRadius: 6, padding: 7, display: "flex", flexDirection: "column", gap: 4 }}>
      <T s={7.5} b c="#5b6270" style={{ textAlign: "center" }}>Entidades</T>
      <div style={{ display: "flex", gap: 6 }}>
        <T s={5.8} c={TINTA_2} style={{ width: 62 }}>Entidad</T>
        <T s={5.8} c={TINTA_2} style={{ width: 36 }}>Habilitar</T>
        <T s={5.8} c={TINTA_2}>Requerida</T>
      </div>
      {ENTIDADES.map((e, i) => {
        const p = progreso(t, 6, i, 3);
        return (
          <div key={e.n} style={{ display: "flex", alignItems: "center", gap: 6, height: 15 }}>
            <T s={6.5} b style={{ width: 62 }}>{e.n}</T>
            <div style={{ width: 36 }}>
              <div style={{ width: 20, height: 10, borderRadius: 5, background: p > 0.5 ? AZUL : "#c8ced8", position: "relative" }}>
                <div style={{ position: "absolute", top: 1.5, left: 1.5 + p * 10, width: 7, height: 7, borderRadius: "50%", background: "white" }} />
              </div>
            </div>
            <div
              style={{
                width: 9,
                height: 9,
                borderRadius: 2,
                border: `1.5px solid ${e.req && p > 0.7 ? AZUL : "#aab2bf"}`,
                background: e.req && p > 0.7 ? AZUL : "white",
                color: "white",
                fontSize: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {e.req && p > 0.7 ? "✓" : ""}
            </div>
          </div>
        );
      })}
    </div>
    <div style={{ flex: 1.15, background: "white", borderRadius: 6, padding: 7, display: "flex", flexDirection: "column", gap: 4 }}>
      <T s={7.5} b c="#5b6270" style={{ textAlign: "center" }}>Prioridades</T>
      <div style={{ display: "flex", gap: 6 }}>
        <T s={5.8} c={TINTA_2} style={{ width: 74 }}>Entidad</T>
        <T s={5.8} c={TINTA_2} style={{ width: 28 }}>TNA</T>
        <T s={5.8} c={TINTA_2}>Monto máx.</T>
      </div>
      {ENTIDADES.map((e, i) => {
        const p = progreso(t, 12, i, 3);
        return (
          <div key={e.n} style={{ display: "flex", alignItems: "center", gap: 6, height: 15, opacity: p, transform: `translateX(${(1 - p) * 20}px)` }}>
            <div style={{ width: 74, height: 13, borderRadius: 2, background: e.c, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <T s={6} b c="white" style={{ lineHeight: "13px" }}>{e.n}</T>
            </div>
            <T s={6.5} b style={{ width: 28 }}>{e.tna}</T>
            <T s={6.5} style={{ flex: 1 }}>$ {e.max}</T>
            <div style={{ fontSize: 8, color: i < 4 ? ACENTO : "#c3c9d2" }}>★</div>
          </div>
        );
      })}
    </div>
  </div>
);

// French amortization of the sample loan.
const CAPITAL = 1500000;
const TASA = 1.4 / 12;
const N = 12;
const CUOTA = (CAPITAL * TASA) / (1 - Math.pow(1 + TASA, -N));
const PLAN = (() => {
  let saldo = CAPITAL;
  return Array.from({ length: N }).map((_, i) => {
    const interes = saldo * TASA;
    const capital = CUOTA - interes;
    saldo -= capital;
    const mes = (10 + i) % 12 || 12;
    const anio = 2026 + Math.floor((9 + i) / 12);
    return { n: i + 1, vto: `10/${String(mes).padStart(2, "0")}/${anio}`, capital, interes };
  });
})();
const Core: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ padding: 9, display: "flex", flexDirection: "column", gap: 5, height: "100%", boxSizing: "border-box" }}>
    <div style={{ display: "flex", justifyContent: "space-around", background: "#f3f5f8", borderRadius: 4, padding: "4px 6px" }}>
      {[
        ["Cliente", "Javier Perez"],
        ["Préstamo", "2026091800003"],
        ["Capital", pesos(CAPITAL)],
        ["TNA", "140%"],
        ["Estado", "Vigente"],
      ].map(([k, v]) => (
        <div key={k} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
          <T s={5.5} c={TINTA_2} style={{ textTransform: "uppercase" }}>{k}</T>
          <T s={6.8} b c={k === "Estado" ? VERDE : TINTA}>{v}</T>
        </div>
      ))}
    </div>
    <div style={{ display: "flex", justifyContent: "center", gap: 4 }}>
      {["Cobranza", "Condonación", "Reversa", "Cancelación", "Refinanciar", "Cta. cte."].map((b, i) => (
        <div key={b} style={{ opacity: progreso(t, 4, i, 1) }}>
          <Pill fondo="#2c5a8c" s={5.6}>{b.toUpperCase()}</Pill>
        </div>
      ))}
    </div>
    <T s={8} b style={{ textAlign: "center" }}>Plan de Pagos</T>
    <div style={{ display: "flex", flexDirection: "column" }}>
      {[{ cab: true }, ...PLAN.slice(0, 9).map((c) => ({ cab: false, c }))].map((f, r) => {
        const p = f.cab ? 1 : progreso(t, 12, r, 2);
        const c = "c" in f ? f.c : undefined;
        const pago = c ? c.n <= 3 : false;
        const celdas = c
          ? [String(c.n), c.vto, pesos(c.capital, 2), pesos(c.interes, 2), pesos(CUOTA, 2)]
          : ["N°", "Vencimiento", "Capital", "Interés", "Cuota"];
        return (
          <div
            key={r}
            style={{
              height: 13,
              background: f.cab ? NAVY : r % 2 ? "#f3f5f8" : "white",
              borderRadius: f.cab ? "2px 2px 0 0" : 0,
              display: "flex",
              alignItems: "center",
              padding: "0 6px",
              opacity: p,
              transform: `translateX(${(1 - p) * 16}px)`,
            }}
          >
            {celdas.map((v, i) => (
              <T
                key={i}
                s={6}
                b={f.cab || i === 4}
                c={f.cab ? "white" : TINTA}
                style={{ width: [22, 70, 78, 78, 78][i], textAlign: i >= 2 ? "right" : "left" }}
              >
                {v}
              </T>
            ))}
            <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
              {f.cab ? (
                <T s={6} b c="white">Estado</T>
              ) : (
                <Pill fondo={pago ? NAVY : "#e1e4e9"} color={pago ? "white" : "#4b5563"} s={5.3}>
                  {pago ? "PAGO" : "PENDIENTE"}
                </Pill>
              )}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

const CLIENTES: { n: string; mora: number; saldo: number; estado: "promesa" | "mora" | "pago" }[] = [
  { n: "Ana Díaz", mora: 34, saldo: 182400, estado: "promesa" },
  { n: "Pedro Martínez", mora: 41, saldo: 245900, estado: "mora" },
  { n: "Lucía Ramírez", mora: 38, saldo: 98300, estado: "pago" },
  { n: "Carlos Rodríguez", mora: 52, saldo: 412700, estado: "mora" },
  { n: "Javier Perez", mora: 45, saldo: 320580, estado: "promesa" },
  { n: "Sofía Gómez", mora: 33, saldo: 76200, estado: "pago" },
  { n: "Martín López", mora: 47, saldo: 158000, estado: "promesa" },
  { n: "Valeria Torres", mora: 59, saldo: 503100, estado: "mora" },
  { n: "Diego Álvarez", mora: 36, saldo: 134800, estado: "pago" },
  { n: "Laura Fernández", mora: 44, saldo: 221500, estado: "promesa" },
  { n: "Jorge Sosa", mora: 55, saldo: 367900, estado: "mora" },
  { n: "Camila Ruiz", mora: 31, saldo: 89600, estado: "pago" },
];
const ESTADO_CRM = {
  promesa: { t: "PROMESA", c: AMARILLO },
  mora: { t: "MORA", c: ROJO },
  pago: { t: "PAGÓ", c: VERDE },
};
const CRM: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ padding: 9, display: "flex", flexDirection: "column", gap: 5, height: "100%", boxSizing: "border-box" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
      <T s={8} b>Clúster S2 · Mora 31-60 días</T>
      <T s={6.5} c={TINTA_2}>
        Recupero <b style={{ color: VERDE }}>38%</b>
      </T>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 5, flex: 1 }}>
      {CLIENTES.map((cl, i) => {
        const p = spring({ frame: t - 6 - i * 2, fps: 30, config: { damping: 14, stiffness: 140 } });
        const e = ESTADO_CRM[cl.estado];
        return (
          <div
            key={cl.n}
            style={{
              border: `1px solid ${GRIS}`,
              borderRadius: 4,
              padding: 4,
              display: "flex",
              flexDirection: "column",
              gap: 2.5,
              transform: `scale(${p})`,
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#2b2f38", color: "white", fontSize: 5, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                {cl.n.split(" ").map((x) => x[0]).join("")}
              </div>
              <T s={5.8} b style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>{cl.n}</T>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <T s={5.5} c={TINTA_2}>{cl.mora} días</T>
              <Pill fondo={e.c} s={4.8}>{e.t}</Pill>
            </div>
            <T s={6.5} b>{pesos(cl.saldo)}</T>
          </div>
        );
      })}
    </div>
  </div>
);

const CAMPANIAS = [
  { n: "Mora temprana", a: 6, avance: 0.62 },
  { n: "Preventiva", a: 4, avance: 0.81 },
  { n: "Promesas", a: 3, avance: 0.45 },
];
const Contact: React.FC<{ t: number }> = ({ t }) => {
  // Fixed seat states; only two seats go from available (blue) to on a
  // call (green) during the shot.
  const cambios: Record<number, number> = { 4: 44, 25: 60 };
  const estado = (i: number) =>
    i in cambios && t >= cambios[i]
      ? VERDE
      : [VERDE, AZUL, VERDE, VERDE, AMARILLO, AZUL, VERDE][(i * 3) % 7];
  const kpis: [string, number, string][] = [
    ["Campañas", 4, ""],
    ["Contactados", 1284, ""],
    ["Promesas", 312, ""],
    ["Agentes", 18, ""],
    ["Contactab.", 64, "%"],
  ];
  return (
    <div style={{ height: "100%", padding: 8, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 6, background: "#f2f4f7" }}>
      <T s={7.5} b c={NAVY}>Discador automático</T>
      <div style={{ display: "flex", gap: 4 }}>
        {kpis.map(([k, v, suf], i) => (
          <div key={k} style={{ flex: 1, background: "white", borderRadius: 3, padding: "3px 4px", display: "flex", flexDirection: "column", gap: 1, opacity: progreso(t, 4, i, 2) }}>
            <T s={5.5} c={TINTA_2}>{k}</T>
            <T s={8} b c={i === 2 ? ACENTO : NAVY}>
              {num(Math.round(v * progreso(t, 8, i, 2, 20)))}
              {suf}
            </T>
          </div>
        ))}
      </div>
      <div style={{ flex: 1, background: "linear-gradient(#3b5378, #2a3d5c)", borderRadius: 5, padding: 6, display: "flex", flexDirection: "column", gap: 5 }}>
        <div style={{ display: "flex", gap: 3.5, justifyContent: "center" }}>
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} style={{ width: 10, height: 9, borderRadius: 2, background: progreso(t, 10, i, 1) > 0.5 ? estado(i) : "#5a6d8c" }} />
          ))}
        </div>
        <div style={{ flex: 1, display: "flex", gap: 6 }}>
          {[0, 1].map((lado) => (
            <div key={lado} style={{ display: "grid", gridTemplateColumns: "repeat(2, 8px)", gap: 3.5, alignContent: "start", order: lado ? 2 : 0 }}>
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: 2, background: progreso(t, 16, i, 1) > 0.5 ? estado(i + 20 + lado * 10) : "#e9edf3", opacity: 0.95 }} />
              ))}
            </div>
          ))}
          <div style={{ flex: 1, order: 1, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 5, display: "flex", alignItems: "center", gap: 5, padding: 5 }}>
            {CAMPANIAS.map((c, i) => {
              const p = spring({ frame: t - 20 - i * 5, fps: 30, config: { damping: 14 } });
              const av = c.avance * progreso(t, 26, i, 4, 20);
              return (
                <div key={c.n} style={{ flex: 1, background: "white", borderRadius: 3, padding: 4, display: "flex", flexDirection: "column", gap: 2.5, alignItems: "center", transform: `scale(${p})` }}>
                  <T s={6} b>{c.n}</T>
                  <T s={5.5} c={TINTA_2}>{c.a} agentes</T>
                  <div style={{ width: "100%", height: 4, borderRadius: 2, background: "#e1e5ec" }}>
                    <div style={{ width: `${av * 100}%`, height: "100%", borderRadius: 2, background: VERDE }} />
                  </div>
                  <T s={6.5} b c={VERDE}>{Math.round(av * 100)}%</T>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
          {[
            ["En llamada", VERDE],
            ["Disponible", AZUL],
            ["Pausa", AMARILLO],
          ].map(([n, c]) => (
            <div key={n} style={{ display: "flex", alignItems: "center", gap: 2.5 }}>
              <div style={{ width: 5, height: 5, borderRadius: 1, background: c }} />
              <T s={5.2} c="#d6dde8">{n}</T>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CONTENIDO: Record<Id, React.FC<{ t: number }>> = {
  canales: Canales,
  funnel: Funnel,
  riesgo: Riesgo,
  marketplace: Marketplace,
  core: Core,
  crm: CRM,
  contact: Contact,
};

export const Suite360: React.FC<z.infer<typeof suite360Schema>> = ({ fondo, paleta }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cam = camara(frame);
  const general = interpolate(frame, [ALEJA, ALEJA_FIN], [0, 1], clamp);
  const actual = Math.min(
    MODULOS.length - 1,
    Math.max(0, Math.floor((frame - PRIMERO + 10) / PASO)),
  );

  return (
    <AbsoluteFill style={{ fontFamily: FUENTE }}>
      <FondoAbstracto paleta={paleta} estilo={fondo} />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1920,
          height: 1080,
          transformOrigin: "0 0",
          transform: `translate(960px, 540px) scale(${cam.z}) translate(${-cam.x}px, ${-cam.y}px)`,
        }}
      >
        {/* Arrows */}
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <defs>
            <marker id="punta" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="white" />
            </marker>
          </defs>
          {FLECHAS.map((f, i) => {
            const desde = aparicion(i + 1) - 22;
            const p = interpolate(frame, [desde, desde + 20], [0, 1], {
              ...clamp,
              easing: Easing.inOut(Easing.quad),
            });
            if (p <= 0) {
              return null;
            }
            return (
              <g key={i}>
                <path
                  d={f.d}
                  fill="none"
                  stroke="white"
                  strokeWidth={5}
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1 - p}
                />
                <path
                  d={f.d}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={5}
                  markerEnd="url(#punta)"
                  markerStart={f.doble ? "url(#punta)" : undefined}
                  opacity={p > 0.92 ? 1 : 0}
                />
              </g>
            );
          })}
        </svg>
        {/* Modules */}
        {MODULOS.map((m, i) => {
          const t = frame - aparicion(i);
          const s = spring({ frame: t, fps, config: { damping: 15, stiffness: 110 } });
          if (s <= 0.001) {
            return null;
          }
          const activo = i === actual && general < 1 ? 1 - general : 0;
          const ola = interpolate(frame - ALEJA_FIN - i * 4, [0, 8, 22], [0, 1, 0], clamp);
          const Contenido = CONTENIDO[m.id];
          return (
            <div key={m.id}>
              <div
                style={{
                  position: "absolute",
                  left: m.x,
                  top: m.y - 34,
                  width: m.w,
                  textAlign: m.id === "funnel" ? "center" : "left",
                  fontSize: 21,
                  fontWeight: 800,
                  color: "white",
                  opacity: interpolate(t, [6, 16], [0, 1], clamp),
                  transform: `translateY(${interpolate(t, [6, 16], [8, 0], clamp)}px)`,
                  whiteSpace: "nowrap",
                }}
              >
                {m.nombre}
                <div
                  style={{
                    height: 3,
                    width: 34,
                    background: ACENTO,
                    borderRadius: 2,
                    marginTop: 4,
                    marginLeft: m.id === "funnel" ? "auto" : 0,
                    marginRight: m.id === "funnel" ? "auto" : 0,
                  }}
                />
              </div>
              <div
                style={{
                  position: "absolute",
                  left: m.x,
                  top: m.y,
                  width: m.w,
                  height: m.h,
                  background: "white",
                  borderRadius: 10,
                  overflow: "hidden",
                  opacity: Math.min(1, s * 1.4),
                  transform: `scale(${0.85 + 0.15 * s}) translateY(${(1 - s) * 20}px)`,
                  boxShadow: `0 18px 40px rgba(0,0,0,0.45), 0 0 0 ${2 + activo * 1 + ola * 2}px rgba(255,140,66,${0.15 + activo * 0.7 + ola * 0.8})`,
                }}
              >
                <Contenido t={t} />
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
