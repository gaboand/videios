import { AbsoluteFill, Freeze, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import "@fontsource/inter/600.css";
import "@fontsource/inter/800.css";
import { FondoAbstracto } from "./FondoAbstracto";
import { modulosEnGeneral, Suite360, SUITE_FRAMES } from "./Suite360";

// Hook of the integral video (16:9 or 9:16): chaos to order. Loose papers
// (spreadsheets, emails, sticky notes, error windows...) float scattered and
// tilted; then they fly and land on the modules of the Suite 360 map, which
// takes their place, and the line "Todo el ciclo del crédito. En una sola
// plataforma." appears.

const NARANJA = "#FF8C42";
const ROJO = "#d9433a";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
// Inner size of every paper (scaled to its box).
const CW = 260;
const CH = 170;

// Timeline (frames).
const VUELA = 38;
const MAPA = 64;
const TEXTO = 76;
export const GANCHO_FRAMES = 118;

// Deterministic pseudo-random numbers in [0, 1).
const azar = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const Linea: React.FC<{ w: number; c?: string; h?: number }> = ({ w, c = "#d5dae2", h = 6 }) => (
  <div style={{ width: `${w}%`, height: h, borderRadius: 3, background: c, flexShrink: 0 }} />
);

const Planilla: React.FC = () => (
  <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
    <div style={{ height: 22, background: "#1f7a4d", display: "flex", alignItems: "center", padding: "0 8px", color: "white", fontSize: 11, fontWeight: 600 }}>cartera_final_v7.xls</div>
    <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(5, 1fr)" }}>
      {Array.from({ length: 30 }, (_, i) => (
        <div key={i} style={{ borderRight: "1px solid #e1e5ea", borderBottom: "1px solid #e1e5ea", background: i < 5 ? "#eef3ef" : i === 17 ? "#fde2e1" : "white", fontSize: 8, color: i === 17 ? ROJO : "#6b7280", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {i < 5 ? ["Cliente", "Monto", "Cuota", "Mora", "Estado"][i] : i === 17 ? "#¡REF!" : i % 5 === 1 ? "$ 1.2M" : ""}
        </div>
      ))}
    </div>
  </div>
);

const Mail: React.FC = () => (
  <div style={{ height: "100%", padding: 12, display: "flex", flexDirection: "column", gap: 7, boxSizing: "border-box" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#2f6fe0" strokeWidth={2}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 7l9 6 9-6" />
      </svg>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#1f2430" }}>RE: RE: FW: legajo Javier</div>
    </div>
    <Linea w={90} />
    <Linea w={75} />
    <Linea w={82} />
    <div style={{ marginTop: "auto", fontSize: 10, color: ROJO, fontWeight: 600 }}>⚠ Falta firma del cliente</div>
  </div>
);

const Postit: React.FC = () => (
  <div style={{ height: "100%", background: "#fde68a", padding: 14, boxSizing: "border-box", fontFamily: "'Comic Sans MS', 'Segoe Print', cursive", color: "#5b4a12", fontSize: 19, lineHeight: 1.3 }}>
    Llamar a Javier
    <br />
    por la cuota!!
    <br />
    <span style={{ fontSize: 14 }}>(vence hoy)</span>
  </div>
);

const Ventana: React.FC = () => (
  <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#e9ebef" }}>
    <div style={{ height: 22, background: "linear-gradient(90deg, #374151, #6b7280)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px", color: "white", fontSize: 11, fontWeight: 600 }}>
      Sistema legado <span>✕</span>
    </div>
    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12, padding: 14 }}>
      <div style={{ width: 34, height: 34, borderRadius: "50%", background: ROJO, color: "white", fontWeight: 800, fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>!</div>
      <div style={{ fontSize: 12, color: "#1f2430", fontWeight: 600, lineHeight: 1.35 }}>
        Error al procesar la solicitud
        <div style={{ fontSize: 10, color: "#6b7280", fontWeight: 500 }}>Código 0x0004F · Reintente</div>
      </div>
    </div>
  </div>
);

const Pdf: React.FC = () => (
  <div style={{ height: "100%", padding: 12, display: "flex", flexDirection: "column", gap: 7, boxSizing: "border-box" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ background: ROJO, color: "white", fontSize: 10, fontWeight: 800, padding: "3px 6px", borderRadius: 3 }}>PDF</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#1f2430" }}>Recibo_sueldo_escaneado</div>
    </div>
    <Linea w={95} c="#e5e7eb" h={8} />
    <Linea w={70} c="#e5e7eb" h={8} />
    <Linea w={85} c="#e5e7eb" h={8} />
    <Linea w={60} c="#e5e7eb" h={8} />
  </div>
);

const Chat: React.FC = () => (
  <div style={{ height: "100%", background: "#ece5dd", padding: 10, display: "flex", flexDirection: "column", gap: 6, boxSizing: "border-box", fontSize: 11 }}>
    <div style={{ alignSelf: "flex-start", background: "white", borderRadius: 8, padding: "5px 8px", color: "#1f2430" }}>¿Ya está aprobado mi préstamo?</div>
    <div style={{ alignSelf: "flex-end", background: "#d9fdd3", borderRadius: 8, padding: "5px 8px", color: "#1f2430" }}>Lo consulto con riesgo 🙏</div>
    <div style={{ alignSelf: "flex-start", background: "white", borderRadius: 8, padding: "5px 8px", color: "#1f2430" }}>Hace 3 días...</div>
  </div>
);

const TIPOS = [Planilla, Mail, Postit, Ventana, Pdf, Chat];
const N_PAPELES = 14;

export const GanchoCaos: React.FC<{ fondo: "ondas"; paleta: "gris" }> = ({ fondo, paleta }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const vertical = height > width;
  const destinos = modulosEnGeneral(vertical);
  const base = vertical ? 1.25 : 1.15;
  const mapa = interpolate(frame, [MAPA - 6, MAPA + 10], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif" }}>
      <FondoAbstracto paleta={paleta} estilo={fondo} />
      {/* The Suite 360 map (final overview) takes the place of the papers. */}
      <AbsoluteFill style={{ opacity: mapa }}>
        <Freeze frame={0}>
          <Sequence from={-(SUITE_FRAMES - 1)}>
            <Suite360 fondo={fondo} paleta={paleta} sinFondo generalAmplio />
          </Sequence>
        </Freeze>
      </AbsoluteFill>
      {Array.from({ length: N_PAPELES }, (_, i) => {
        const Tipo = TIPOS[i % TIPOS.length];
        // Scattered start (a loose grid with jitter so they cover the frame).
        const cols = vertical ? 3 : 5;
        const fila = Math.floor(i / cols);
        const filas = Math.ceil(N_PAPELES / cols);
        const x0 = ((i % cols) + 0.5 + (azar(i) - 0.5) * 0.7) * (width / cols);
        const y0 = (fila + 0.5 + (azar(i + 50) - 0.5) * 0.6) * (height / filas);
        const r0 = (azar(i + 9) - 0.5) * 50;
        const s0 = base * (0.8 + azar(i + 21) * 0.45);
        // Floating while in chaos.
        const fx = Math.sin(frame / 17 + i * 1.7) * 14;
        const fy = Math.cos(frame / 21 + i * 2.3) * 12;
        const fr = Math.sin(frame / 25 + i) * 4;
        const vuelo = spring({ frame: frame - VUELA - (i % 10) * 2, fps, config: { damping: 16, stiffness: 90 } });
        let cx: number;
        let cy: number;
        let w: number;
        let h: number;
        let rot: number;
        let op: number;
        if (i < destinos.length) {
          // Lands on module i of the map.
          const d = destinos[i];
          cx = interpolate(vuelo, [0, 1], [x0 + fx, d.x + d.w / 2]);
          cy = interpolate(vuelo, [0, 1], [y0 + fy, d.y + d.h / 2]);
          w = interpolate(vuelo, [0, 1], [CW * s0, d.w]);
          h = interpolate(vuelo, [0, 1], [CH * s0, d.h]);
          rot = interpolate(vuelo, [0, 1], [r0 + fr, 0]);
          op = 1 - mapa;
        } else {
          // Extra papers fly out of the frame.
          const ang = Math.atan2(y0 - height / 2, x0 - width / 2);
          cx = x0 + fx + Math.cos(ang) * vuelo * width;
          cy = y0 + fy + Math.sin(ang) * vuelo * width;
          w = CW * s0;
          h = CH * s0;
          rot = r0 + fr + vuelo * 40;
          op = 1 - vuelo;
        }
        // Red alert badge blinking on some papers while in chaos.
        const alerta = i % 3 === 0 && frame < VUELA ? (Math.floor((frame + i * 5) / 8) % 2 === 0 ? 1 : 0) : 0;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: cx - w / 2,
              top: cy - h / 2,
              width: w,
              height: h,
              transform: `rotate(${rot}deg)`,
              opacity: op,
              zIndex: i % 5,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: CW,
                height: CH,
                transformOrigin: "0 0",
                transform: `scale(${w / CW}, ${h / CH})`,
                background: "white",
                borderRadius: 8,
                overflow: "hidden",
                boxShadow: "0 18px 40px rgba(0,0,0,0.45)",
              }}
            >
              <Tipo />
            </div>
            {alerta ? (
              <div style={{ position: "absolute", right: -12, top: -12, width: 30, height: 30, borderRadius: "50%", background: ROJO, color: "white", fontWeight: 800, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 18px rgba(217,67,58,0.8)" }}>!</div>
            ) : null}
          </div>
        );
      })}
      {/* Tagline above the map. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: vertical ? 150 : 70, textAlign: "center", color: "white", fontWeight: 800, fontSize: vertical ? 70 : 72, lineHeight: 1.2, letterSpacing: -0.5 }}>
        {["Todo el ciclo del crédito.", "En una sola plataforma."].map((t, i) => {
          const a = spring({ frame: frame - TEXTO - i * 10, fps, config: { damping: 16, stiffness: 110 } });
          return (
            <div key={t} style={{ opacity: a, transform: `translateY(${(1 - a) * 30}px)`, color: i === 1 ? NARANJA : "white" }}>
              {t}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

