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
  { id: "canales", nombre: "Canales", x: 70, y: 250, w: 330, h: 240 },
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
  { d: "M 415 300 Q 540 270 590 440" },
  { d: "M 860 440 C 880 380 920 420 925 350 S 945 290 955 265" },
  { d: "M 720 690 Q 760 790 940 760" },
  { d: "M 1420 620 Q 1410 430 1470 390" },
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
    { f: aparicion(0) + 30, c: c0 },
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
        <T s={9} b c={NAVY} style={{ flex: 1 }}>Gestión del Cliente</T>
        {["Simular", "Legajo", "Préstamos", "Cobranzas"].map((b, i) => (
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
              const p = progreso(t, 26, i, 3);
              return (
                <div key={d} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, opacity: p, transform: `scale(${0.8 + 0.2 * p})` }}>
                  <div
                    style={{
                      flex: 1,
                      borderRadius: 3,
                      background: ["linear-gradient(160deg,#9fb3c8,#e8edf3)", "linear-gradient(160deg,#b7c2cf,#eef1f5)", "linear-gradient(160deg,#c9b8a6,#f1ece6)"][i],
                      position: "relative",
                    }}
                  >
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
            <div key={c} style={{ display: "flex", alignItems: "center", gap: 4, opacity: progreso(t, 30, i, 3) }}>
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
              background: `linear-gradient(90deg, #2b2d31, ${i === ETAPAS.length - 1 ? "#a8521f" : "#4a4d54"}, #2b2d31)`,
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
              <T s={6} b c="white">{e.n}</T>
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
  const estado = (i: number) => [VERDE, AMARILLO, ROJO, AZUL][(i * 7 + Math.floor(t / 10)) % 4];
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
            ["Cierre", ROJO],
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
  const cierre = spring({ frame: frame - ALEJA_FIN + 6, fps, config: { damping: 18 } });

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
      {/* Closing line once the whole suite is in view */}
      <div
        style={{
          position: "absolute",
          bottom: 52,
          width: "100%",
          textAlign: "center",
          opacity: cierre,
          transform: `translateY(${(1 - cierre) * 20}px)`,
        }}
      >
        <span style={{ fontSize: 34, fontWeight: 800, color: "white" }}>Gestión de Créditos </span>
        <span style={{ fontSize: 34, fontWeight: 800, color: ACENTO }}>360</span>
      </div>
    </AbsoluteFill>
  );
};
