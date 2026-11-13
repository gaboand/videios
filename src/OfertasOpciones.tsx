import { AbsoluteFill } from "remotion";
import "@fontsource/montserrat/500.css";
import "@fontsource/montserrat/700.css";
import "@fontsource/montserrat/800.css";

// Still with six style options for the onboarding offer cards, each shown as
// the row of four offers with the 6-installment one selected.

const FUENTE = "Montserrat, sans-serif";
const TINTA = "#1f2430";
const TINTA_2 = "#6b7280";
const AZUL = "#2f6fbf";
const NAVY = "#14284b";
const ACENTO = "#FF8C42";
const VERDE = "#1e8a4c";

const OFERTAS = [
  { n: 3, cuota: 340420 },
  { n: 6, cuota: 196180 },
  { n: 9, cuota: 148950 },
  { n: 12, cuota: 125310 },
];
const SEL = 1;
const pesos = (n: number) => `$ ${n.toLocaleString("es-AR")}`;
const BENEFICIOS = ["Tasa preferencial", "Sin costos ocultos", "Aprobación inmediata"];

type Card = React.FC<{ n: number; cuota: number; sel: boolean }>;

const Beneficios: React.FC<{ color: string; tilde?: string; s?: number }> = ({ color, tilde = "✓", s = 10.5 }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 3, fontSize: s, color }}>
    {BENEFICIOS.map((b) => (
      <div key={b}>
        {tilde} {b}
      </div>
    ))}
  </div>
);

// 1. Refined current: soft white cards, selected one blue gradient with ring
// and a "Recomendada" badge.
const Opcion1: Card = ({ n, cuota, sel }) => (
  <div
    style={{
      position: "relative",
      height: "100%",
      borderRadius: 16,
      background: sel ? "linear-gradient(160deg, #6aa2ea, #2c5a9e)" : "linear-gradient(160deg, #ffffff, #eef2f7)",
      border: `1.5px solid ${sel ? "#2c5a9e" : "#d3dbe6"}`,
      boxShadow: sel ? "0 16px 30px rgba(44,90,158,0.35), 0 0 0 4px rgba(106,162,234,0.25)" : "0 4px 10px rgba(20,30,50,0.06)",
      color: sel ? "white" : TINTA,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      transform: sel ? "translateY(-8px)" : "none",
    }}
  >
    {sel ? (
      <div style={{ position: "absolute", top: -11, background: ACENTO, color: "white", fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 10, letterSpacing: 0.5 }}>
        RECOMENDADA
      </div>
    ) : null}
    <div style={{ fontSize: 13, opacity: 0.85 }}>{n} cuotas</div>
    <div style={{ fontSize: 27, fontWeight: 800 }}>{pesos(cuota)}</div>
    <div style={{ fontSize: 11, opacity: 0.8 }}>Monto total {pesos(cuota * n)}</div>
    <div style={{ marginTop: 8 }}>
      <Beneficios color={sel ? "rgba(255,255,255,0.9)" : TINTA_2} />
    </div>
  </div>
);

// 2. Header band: installments in a colored top band, amount in the body.
const Opcion2: Card = ({ n, cuota, sel }) => (
  <div
    style={{
      height: "100%",
      borderRadius: 14,
      overflow: "hidden",
      background: "white",
      border: `2px solid ${sel ? ACENTO : "#d3dbe6"}`,
      boxShadow: sel ? "0 14px 28px rgba(255,140,66,0.3)" : "0 4px 10px rgba(20,30,50,0.06)",
      display: "flex",
      flexDirection: "column",
    }}
  >
    <div style={{ background: sel ? NAVY : "#e9eef5", color: sel ? "white" : NAVY, padding: "12px 0", textAlign: "center" }}>
      <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1 }}>{n}</div>
      <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1 }}>CUOTAS</div>
    </div>
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, color: TINTA }}>
      <div style={{ fontSize: 26, fontWeight: 800, color: sel ? NAVY : TINTA }}>{pesos(cuota)}</div>
      <div style={{ fontSize: 11, color: TINTA_2 }}>por mes · total {pesos(cuota * n)}</div>
      <div style={{ marginTop: 6 }}>
        <Beneficios color={TINTA_2} tilde="•" />
      </div>
    </div>
  </div>
);

// 3. Minimal outline with a radio button: light, form-like.
const Opcion3: Card = ({ n, cuota, sel }) => (
  <div
    style={{
      position: "relative",
      height: "100%",
      borderRadius: 12,
      background: sel ? "#eef5ff" : "white",
      border: `${sel ? 2.5 : 1.5}px solid ${sel ? AZUL : "#d3dbe6"}`,
      padding: "18px 18px",
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      gap: 6,
      color: TINTA,
    }}
  >
    <div
      style={{
        position: "absolute",
        top: 16,
        right: 16,
        width: 20,
        height: 20,
        borderRadius: "50%",
        border: `2px solid ${sel ? AZUL : "#aab3c0"}`,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {sel ? <div style={{ width: 10, height: 10, borderRadius: "50%", background: AZUL }} /> : null}
    </div>
    <div style={{ fontSize: 12, fontWeight: 700, color: sel ? AZUL : TINTA_2, letterSpacing: 0.5 }}>{n} CUOTAS</div>
    <div style={{ fontSize: 28, fontWeight: 800, marginTop: 6 }}>{pesos(cuota)}</div>
    <div style={{ fontSize: 11, color: TINTA_2 }}>Monto total {pesos(cuota * n)}</div>
    <div style={{ borderTop: "1px solid #e1e6ee", margin: "10px 0 6px" }} />
    <Beneficios color={TINTA_2} tilde="✓" />
  </div>
);

// 4. Dark cards with orange accent; the selected one glows orange.
const Opcion4: Card = ({ n, cuota, sel }) => (
  <div
    style={{
      height: "100%",
      borderRadius: 16,
      background: sel ? "linear-gradient(165deg, #22385f, #0f1e38)" : "linear-gradient(165deg, #2b3340, #1d232c)",
      border: `2px solid ${sel ? ACENTO : "rgba(255,255,255,0.08)"}`,
      boxShadow: sel ? "0 0 0 4px rgba(255,140,66,0.25), 0 16px 30px rgba(0,0,0,0.35)" : "0 6px 14px rgba(0,0,0,0.2)",
      color: "white",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    }}
  >
    <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: sel ? ACENTO : "#aab3c0" }}>{n} CUOTAS</div>
    <div style={{ fontSize: 27, fontWeight: 800 }}>{pesos(cuota)}</div>
    <div style={{ fontSize: 11, color: "#aab3c0" }}>Total {pesos(cuota * n)}</div>
    <div style={{ marginTop: 8 }}>
      <Beneficios color="#c9d0da" tilde="✓" />
    </div>
  </div>
);

// 5. Big round badge with the number of installments.
const Opcion5: Card = ({ n, cuota, sel }) => (
  <div
    style={{
      height: "100%",
      borderRadius: 18,
      background: "white",
      border: `2px solid ${sel ? AZUL : "#e1e6ee"}`,
      boxShadow: sel ? "0 14px 28px rgba(47,111,191,0.28)" : "0 4px 10px rgba(20,30,50,0.06)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      color: TINTA,
    }}
  >
    <div
      style={{
        width: 64,
        height: 64,
        borderRadius: "50%",
        background: sel ? `linear-gradient(150deg, #5a9be6, ${AZUL})` : "#eef2f7",
        color: sel ? "white" : NAVY,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: sel ? "0 6px 14px rgba(47,111,191,0.4)" : "none",
      }}
    >
      <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1 }}>{n}</div>
      <div style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: 0.8 }}>CUOTAS</div>
    </div>
    <div style={{ fontSize: 25, fontWeight: 800, color: sel ? AZUL : TINTA }}>{pesos(cuota)}</div>
    <div style={{ fontSize: 11, color: TINTA_2 }}>Total {pesos(cuota * n)}</div>
    <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
      {["Tasa pref.", "Sin costos"].map((b) => (
        <span key={b} style={{ fontSize: 9.5, fontWeight: 700, color: VERDE, background: "#e8f6ee", borderRadius: 8, padding: "3px 7px" }}>
          ✓ {b}
        </span>
      ))}
    </div>
  </div>
);

// 6. Ticket: notched sides, dashed divider and total at the bottom.
const Opcion6: Card = ({ n, cuota, sel }) => (
  <div style={{ position: "relative", height: "100%", filter: sel ? "drop-shadow(0 14px 22px rgba(20,40,80,0.28))" : "drop-shadow(0 4px 8px rgba(20,30,50,0.08))" }}>
    <div
      style={{
        height: "100%",
        borderRadius: 14,
        background: sel ? "#fff7f0" : "white",
        border: `2px solid ${sel ? ACENTO : "#dfe5ee"}`,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        color: TINTA,
      }}
    >
      <div style={{ height: 6, background: sel ? ACENTO : "transparent" }} />
      <div style={{ flex: 1.4, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
        <div style={{ fontSize: 12, color: TINTA_2 }}>{n} cuotas de</div>
        <div style={{ fontSize: 27, fontWeight: 800 }}>{pesos(cuota)}</div>
        {sel ? <div style={{ fontSize: 10, fontWeight: 800, color: ACENTO, letterSpacing: 1 }}>ELEGIDA</div> : null}
      </div>
      <div style={{ borderTop: `2px dashed ${sel ? "#f5c29e" : "#dfe5ee"}`, margin: "0 16px" }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <div style={{ fontSize: 11, color: TINTA_2 }}>Monto total</div>
        <div style={{ fontSize: 15, fontWeight: 800 }}>{pesos(cuota * n)}</div>
        <div style={{ fontSize: 10, color: VERDE, fontWeight: 700 }}>✓ Aprobación inmediata</div>
      </div>
    </div>
    {[0, 1].map((l) => (
      <div
        key={l}
        style={{
          position: "absolute",
          top: "58%",
          [l ? "right" : "left"]: -11,
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: "#f4f6f9",
          border: `2px solid ${sel ? ACENTO : "#dfe5ee"}`,
          clipPath: l ? "inset(0 50% 0 0)" : "inset(0 0 0 50%)",
        }}
      />
    ))}
  </div>
);

const OPCIONES: [string, Card][] = [
  ["Opción 1 · Degradé con sello", Opcion1],
  ["Opción 2 · Encabezado de color", Opcion2],
  ["Opción 3 · Minimal con radio", Opcion3],
  ["Opción 4 · Oscura con acento naranja", Opcion4],
  ["Opción 5 · Insignia redonda", Opcion5],
  ["Opción 6 · Ticket", Opcion6],
];

export const OfertasOpciones: React.FC = () => (
  <AbsoluteFill style={{ background: "#d9dee6", fontFamily: FUENTE, padding: 30, boxSizing: "border-box" }}>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr 1fr", gap: 30, height: "100%" }}>
      {OPCIONES.map(([titulo, C]) => (
        <div key={titulo} style={{ background: "#f4f6f9", borderRadius: 18, padding: "18px 26px 26px", display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: TINTA }}>{titulo}</div>
          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, alignItems: "stretch", padding: "10px 0" }}>
            {OFERTAS.map((o, i) => (
              <C key={o.n} n={o.n} cuota={o.cuota} sel={i === SEL} />
            ))}
          </div>
        </div>
      ))}
    </div>
  </AbsoluteFill>
);
