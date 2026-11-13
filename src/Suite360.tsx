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
const GRIS_2 = "#c3cad5";
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
    { f: aparicion(0) + 28, c: c0 },
  ];
  for (let i = 1; i < MODULOS.length; i++) {
    claves.push({ f: aparicion(i) - 6, c: camDe(i) });
    claves.push({ f: aparicion(i) + 28, c: camDe(i) });
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
      const z = Math.exp(Math.log(a.c.z) + (Math.log(b.c.z) - Math.log(a.c.z)) * t);
      return { x: a.c.x + (b.c.x - a.c.x) * t, y: a.c.y + (b.c.y - a.c.y) * t, z };
    }
  }
  return GENERAL;
};

// Small building blocks for the mock UIs.
const Barra: React.FC<{
  w: number | string;
  h?: number;
  c?: string;
  o?: number;
  style?: React.CSSProperties;
}> = ({ w, h = 5, c = GRIS, o = 1, style }) => (
  <div style={{ width: w, height: h, borderRadius: h / 2, background: c, opacity: o, flexShrink: 0, ...style }} />
);

const progreso = (frame: number, desde: number, i: number, paso = 2, dur = 8) =>
  interpolate(frame, [desde + i * paso, desde + i * paso + dur], [0, 1], clamp);

const Canales: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 9, height: "100%", boxSizing: "border-box" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: NAVY, flex: 1 }}>Gestión del Cliente</div>
      {[0, 1, 2, 3].map((i) => (
        <Barra key={i} w={26} h={9} c={i === 3 ? "#5b6b85" : NAVY} o={progreso(t, 4, i)} />
      ))}
    </div>
    <div style={{ display: "flex", gap: 8 }}>
      {[0, 1, 2].map((c) => (
        <div key={c} style={{ flex: 1, border: `1px solid ${GRIS}`, borderRadius: 5, padding: 6, display: "flex", flexDirection: "column", gap: 5 }}>
          <Barra w="55%" h={4} c={GRIS_2} />
          {[0, 1, 2, 3, 4, 5].map((r) => (
            <div key={r} style={{ display: "flex", justifyContent: "space-between", opacity: progreso(t, 8, c * 6 + r, 1) }}>
              <Barra w={22} h={3.5} />
              <Barra w={r % 3 === 1 ? 34 : 26} h={3.5} c={c === 2 && r === 4 ? ACENTO : GRIS_2} />
            </div>
          ))}
        </div>
      ))}
    </div>
    <div style={{ display: "flex", gap: 8, flex: 1 }}>
      <div style={{ flex: 2, border: `1px solid ${GRIS}`, borderRadius: 5, padding: 6, display: "flex", gap: 6 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              borderRadius: 4,
              background: ["linear-gradient(160deg,#9fb3c8,#e8edf3)", "linear-gradient(160deg,#c9b8a6,#f1ece6)", "linear-gradient(160deg,#a9c3d9,#eef3f8)"][i],
              opacity: progreso(t, 26, i, 3),
              transform: `scale(${0.8 + 0.2 * progreso(t, 26, i, 3)})`,
            }}
          />
        ))}
      </div>
      <div style={{ flex: 1, border: `1px solid ${GRIS}`, borderRadius: 5, padding: 6, display: "flex", flexDirection: "column", gap: 6 }}>
        <Barra w={34} h={8} c={NAVY} />
        {[0, 1, 2].map((r) => (
          <div key={r} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Barra w={40} h={3.5} />
            <Barra w={12} h={7} c="#3a3f48" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Funnel: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ padding: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 7, height: "100%", boxSizing: "border-box" }}>
    <div style={{ fontSize: 9, fontWeight: 800, color: NAVY, letterSpacing: 1 }}>FUNNEL</div>
    <div style={{ display: "flex", gap: 4, background: "#5a5f68", borderRadius: 4, padding: 4 }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Barra key={i} w={i === 2 ? 22 : 28} h={6} c={i === 2 ? "#e0493f" : "#d0d4da"} />
      ))}
    </div>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, marginTop: 4 }}>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const p = progreso(t, 6, i, 3, 10);
        const w = 230 - i * 24;
        return (
          <div
            key={i}
            style={{
              width: w,
              height: 17,
              clipPath: "polygon(0 0, 100% 0, calc(100% - 12px) 100%, 12px 100%)",
              background: `linear-gradient(90deg, #2b2d31, ${i === 0 ? "#5d6169" : "#44474d"}, #2b2d31)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: p,
              transform: `translateY(${(1 - p) * -10}px)`,
            }}
          >
            <Barra w={w * 0.35} h={3.5} c="#e8eaee" o={0.85} />
          </div>
        );
      })}
    </div>
    <Barra w={46} h={10} c="#3a3f48" style={{ marginTop: 4, opacity: progreso(t, 32, 0) }} />
  </div>
);

const Riesgo: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ height: "100%", background: "#d4d8de", padding: 8, boxSizing: "border-box", display: "flex", gap: 8 }}>
    <div style={{ width: 70, background: "white", borderRadius: 4, padding: 6, display: "flex", flexDirection: "column", gap: 5 }}>
      <div style={{ fontSize: 7, fontWeight: 700, color: NAVY }}>Servicios</div>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 3, opacity: progreso(t, 4, i, 1) }}>
          <Barra w={9} h={9} c={NAVY} style={{ borderRadius: 2 }} />
          <Barra w={38} h={9} c="#e9edf3" style={{ borderRadius: 2 }} />
        </div>
      ))}
    </div>
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ fontSize: 7, fontWeight: 700, color: NAVY, textAlign: "center" }}>Estrategia de decisión</div>
      <div style={{ flex: 1, background: "#eaf1fb", border: "1px solid #b5c8e6", borderRadius: 4, position: "relative" }}>
        <svg style={{ position: "absolute", inset: 0 }} width="100%" height="100%">
          <line x1="20%" y1="35%" x2="80%" y2="35%" stroke="#7d93b6" strokeWidth={1.5} strokeDasharray="4 3" opacity={progreso(t, 26, 0, 1, 12)} />
        </svg>
        {[0, 1, 2, 3].map((i) => {
          const p = spring({ frame: t - 12 - i * 5, fps: 30, config: { damping: 14 } });
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${6 + i * 23.5}%`,
                top: "16%",
                width: "18%",
                height: "40%",
                background: "white",
                borderRadius: 3,
                border: "1px solid #b5c8e6",
                overflow: "hidden",
                transform: `scale(${p})`,
              }}
            >
              <div style={{ height: 8, background: NAVY }} />
              <div style={{ padding: 3, display: "flex", gap: 2, alignItems: "center" }}>
                <Barra w={8} h={8} c={["#2f6fe0", "#2e9e4a", "#f08a2c", "#e0493f"][i]} style={{ borderRadius: 2 }} />
                <Barra w="60%" h={3} />
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <Barra w={40} h={4} c="#8a93a3" />
        <Barra w={110} h={11} c="white" style={{ borderRadius: 2 }} />
        <div style={{ flex: 1 }} />
        <Barra w={46} h={11} c="#3a8ee6" style={{ borderRadius: 2 }} />
        <Barra w={46} h={11} c="#3a8ee6" style={{ borderRadius: 2 }} />
      </div>
    </div>
  </div>
);

const MARCAS = ["#1f8a4c", "#f26b1d", "#6b3fd4", "#2a6f5b", "#1d2a4d", "#151515"];
const Marketplace: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ height: "100%", background: "#e4e7ec", padding: 10, boxSizing: "border-box", display: "flex", gap: 10 }}>
    {[0, 1].map((panel) => (
      <div key={panel} style={{ flex: 1, background: "white", borderRadius: 6, padding: 8, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ fontSize: 7.5, fontWeight: 700, color: "#5b6270", textAlign: "center" }}>
          {panel ? "Prioridades" : "Entidades"}
        </div>
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const p = progreso(t, 6 + panel * 6, i, 3);
          return panel === 0 ? (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, height: 16 }}>
              <Barra w={44} h={4} c="#3d4350" />
              <div style={{ width: 20, height: 10, borderRadius: 5, background: p > 0.5 ? "#2f6fe0" : "#c8ced8", position: "relative" }}>
                <div style={{ position: "absolute", top: 1.5, left: 1.5 + p * 10, width: 7, height: 7, borderRadius: "50%", background: "white" }} />
              </div>
              <div
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: 2,
                  border: `1.5px solid ${i < 4 && p > 0.7 ? "#2f6fe0" : "#aab2bf"}`,
                  background: i < 4 && p > 0.7 ? "#2f6fe0" : "white",
                }}
              />
            </div>
          ) : (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, height: 16, opacity: p, transform: `translateX(${(1 - p) * 20}px)` }}>
              <div style={{ width: 70, height: 14, borderRadius: 2, background: MARCAS[i], display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Barra w={36} h={4} c="white" o={0.9} />
              </div>
              <div style={{ flex: 1 }} />
              <div style={{ fontSize: 8, color: i < 4 ? ACENTO : "#c3c9d2" }}>★</div>
              <Barra w={10} h={10} c="#e8ecf2" style={{ borderRadius: 2, border: "1px solid #b9c2cf" }} />
            </div>
          );
        })}
      </div>
    ))}
  </div>
);

const Core: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 6, height: "100%", boxSizing: "border-box" }}>
    <div style={{ display: "flex", justifyContent: "space-around", background: "#f3f5f8", borderRadius: 4, padding: 6 }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "center" }}>
          <Barra w={44} h={4} c={GRIS_2} />
          <Barra w={56} h={4} c="#3d4350" />
        </div>
      ))}
    </div>
    <div style={{ display: "flex", justifyContent: "center", gap: 5 }}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Barra key={i} w={36} h={9} c="#2c5a8c" style={{ borderRadius: 2, opacity: progreso(t, 4, i, 1) }} />
      ))}
    </div>
    <div style={{ fontSize: 8, fontWeight: 700, color: "#2b2f38", textAlign: "center" }}>Plan de Pagos</div>
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ height: 10, background: NAVY, borderRadius: "2px 2px 0 0", display: "flex", alignItems: "center", gap: 8, padding: "0 6px" }}>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <Barra key={i} w={i ? 34 : 12} h={3} c="white" o={0.8} />
        ))}
      </div>
      {Array.from({ length: 10 }).map((_, r) => {
        const p = progreso(t, 12, r, 2);
        return (
          <div
            key={r}
            style={{
              height: 11.5,
              background: r % 2 ? "#f3f5f8" : "white",
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "0 6px",
              opacity: p,
              transform: `translateX(${(1 - p) * 16}px)`,
            }}
          >
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Barra key={i} w={i ? 34 : 12} h={3} c="#9aa3b2" />
            ))}
            <Barra w={22} h={6} c={r < 3 ? NAVY : "#d9dde3"} style={{ borderRadius: 2 }} />
          </div>
        );
      })}
    </div>
  </div>
);

const CRM: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 7, height: "100%", boxSizing: "border-box" }}>
    <div style={{ fontSize: 8, fontWeight: 700, color: "#2b2f38", textAlign: "center" }}>Clientes del clúster</div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, flex: 1 }}>
      {Array.from({ length: 12 }).map((_, i) => {
        const p = spring({ frame: t - 6 - i * 2, fps: 30, config: { damping: 14, stiffness: 140 } });
        const chip = ["#2e9e4a", "#2e9e4a", "#e6b422", "#e6b422", "#2e9e4a", "#2e9e4a", "#2e9e4a", "#2e9e4a", "#2e9e4a", "#2e9e4a", "#e0493f", "#2e9e4a"][i];
        return (
          <div
            key={i}
            style={{
              border: `1px solid ${GRIS}`,
              borderRadius: 4,
              padding: 5,
              display: "flex",
              flexDirection: "column",
              gap: 4,
              transform: `scale(${p})`,
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#2b2f38" }} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                <Barra w="70%" h={3} c="#3d4350" />
                <Barra w="45%" h={2.5} />
              </div>
              <Barra w={14} h={6} c={chip} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Barra w={22} h={3} />
              <Barra w={18} h={3} c="#3d4350" />
            </div>
            <Barra w="60%" h={2.5} />
          </div>
        );
      })}
    </div>
  </div>
);

const Contact: React.FC<{ t: number }> = ({ t }) => {
  const estado = (i: number) => ["#2e9e4a", "#e6b422", "#e0493f", "#2f6fe0"][(i * 7 + Math.floor(t / 10)) % 4];
  return (
    <div style={{ height: "100%", padding: 8, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 7, background: "#f2f4f7" }}>
      <div style={{ fontSize: 7.5, fontWeight: 700, color: NAVY }}>Discador automático</div>
      <div style={{ display: "flex", gap: 5 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={{ flex: 1, background: "white", borderRadius: 3, padding: 4, display: "flex", flexDirection: "column", gap: 3, opacity: progreso(t, 4, i, 2) }}>
            <Barra w={9} h={9} c="#2f6fe0" style={{ borderRadius: 2 }} />
            <Barra w="80%" h={3} c="#3d4350" />
            <Barra w="60%" h={2.5} />
          </div>
        ))}
      </div>
      <div style={{ flex: 1, background: "linear-gradient(#3b5378, #2a3d5c)", borderRadius: 5, padding: 7, position: "relative", display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} style={{ width: 11, height: 10, borderRadius: 2, background: progreso(t, 10, i, 1) > 0.5 ? estado(i) : "#5a6d8c" }} />
          ))}
        </div>
        <div style={{ flex: 1, display: "flex", gap: 8 }}>
          {[0, 1].map((lado) => (
            <div key={lado} style={{ display: "grid", gridTemplateColumns: "repeat(2, 9px)", gap: 4, alignContent: "start", order: lado ? 2 : 0 }}>
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} style={{ width: 9, height: 9, borderRadius: 2, background: "#e9edf3", opacity: progreso(t, 16, i, 1) }} />
              ))}
            </div>
          ))}
          <div style={{ flex: 1, order: 1, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: 6 }}>
            {[0, 1, 2].map((i) => {
              const p = spring({ frame: t - 20 - i * 5, fps: 30, config: { damping: 14 } });
              return (
                <div key={i} style={{ flex: 1, background: "white", borderRadius: 3, padding: 4, display: "flex", flexDirection: "column", gap: 3, alignItems: "center", transform: `scale(${p})` }}>
                  <Barra w="80%" h={3} c="#3d4350" />
                  <Barra w="60%" h={2.5} />
                  <Barra w="70%" h={2.5} />
                  <Barra w={24} h={6} c="#2e9e4a" style={{ borderRadius: 2, marginTop: 2 }} />
                </div>
              );
            })}
          </div>
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
