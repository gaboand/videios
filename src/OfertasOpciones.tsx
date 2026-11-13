import { AbsoluteFill } from "remotion";
import "@fontsource/montserrat/500.css";
import "@fontsource/montserrat/700.css";
import "@fontsource/montserrat/800.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "@fontsource/roboto/900.css";

// Still with three variants (color and typeface) of the two offer card
// styles picked: dark with accent (4) and round badge (5). Each is shown as
// the row of four offers with the 6-installment one selected.

const FUENTE = "Montserrat, sans-serif";
const TINTA = "#1f2430";
const TINTA_2 = "#6b7280";

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

// Variants of options 4 and 5: color scheme and typeface.
type Tema4 = { fondo: string; fondoSel: string; acento: string; texto2: string; fuente: string; peso: number };
const variante4 = (t: Tema4): Card => {
  const V: Card = ({ n, cuota, sel }) => (
    <div
      style={{
        height: "100%",
        borderRadius: 16,
        background: sel ? t.fondoSel : t.fondo,
        border: `2px solid ${sel ? t.acento : "rgba(255,255,255,0.08)"}`,
        boxShadow: sel ? `0 0 0 4px ${t.acento}40, 0 16px 30px rgba(0,0,0,0.35)` : "0 6px 14px rgba(0,0,0,0.2)",
        color: "white",
        fontFamily: t.fuente,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: sel ? t.acento : t.texto2 }}>{n} CUOTAS</div>
      <div style={{ fontSize: 28, fontWeight: t.peso }}>{pesos(cuota)}</div>
      <div style={{ fontSize: 11, color: t.texto2 }}>Total {pesos(cuota * n)}</div>
      <div style={{ marginTop: 8 }}>
        <Beneficios color={t.texto2} tilde="✓" />
      </div>
    </div>
  );
  return V;
};
type Tema5 = { color: string; color2: string; suave: string; tinta: string; fuente: string; peso: number; etiqueta: string; etiquetaFondo: string };
const variante5 = (t: Tema5): Card => {
  const V: Card = ({ n, cuota, sel }) => (
    <div
      style={{
        height: "100%",
        borderRadius: 18,
        background: "white",
        border: `2px solid ${sel ? t.color : "#e1e6ee"}`,
        boxShadow: sel ? `0 14px 28px ${t.color}48` : "0 4px 10px rgba(20,30,50,0.06)",
        fontFamily: t.fuente,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        color: t.tinta,
      }}
    >
      <div
        style={{
          width: 66,
          height: 66,
          borderRadius: "50%",
          background: sel ? `linear-gradient(150deg, ${t.color2}, ${t.color})` : t.suave,
          color: sel ? "white" : t.tinta,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: sel ? `0 6px 14px ${t.color}66` : "none",
        }}
      >
        <div style={{ fontSize: 25, fontWeight: t.peso, lineHeight: 1 }}>{n}</div>
        <div style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: 0.8 }}>CUOTAS</div>
      </div>
      <div style={{ fontSize: 26, fontWeight: t.peso, color: sel ? t.color : t.tinta }}>{pesos(cuota)}</div>
      <div style={{ fontSize: 11, color: TINTA_2 }}>Total {pesos(cuota * n)}</div>
      <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
        {["Tasa pref.", "Sin costos"].map((b) => (
          <span key={b} style={{ fontSize: 9.5, fontWeight: 700, color: t.etiqueta, background: t.etiquetaFondo, borderRadius: 8, padding: "3px 7px" }}>
            ✓ {b}
          </span>
        ))}
      </div>
    </div>
  );
  return V;
};

const OPCIONES: [string, Card][] = [
  ["4A · Grafito + naranja · Montserrat", variante4({ fondo: "linear-gradient(165deg, #2b3340, #1d232c)", fondoSel: "linear-gradient(165deg, #22385f, #0f1e38)", acento: "#FF8C42", texto2: "#aab3c0", fuente: "Montserrat, sans-serif", peso: 800 })],
  ["5A · Azul Axonia · Montserrat", variante5({ color: "#2f6fbf", color2: "#5a9be6", suave: "#eef2f7", tinta: "#14284b", fuente: "Montserrat, sans-serif", peso: 800, etiqueta: "#1e8a4c", etiquetaFondo: "#e8f6ee" })],
  ["4B · Navy + celeste · Inter", variante4({ fondo: "linear-gradient(165deg, #1b2a44, #111b2e)", fondoSel: "linear-gradient(165deg, #1d4f8a, #123462)", acento: "#4fb3ff", texto2: "#9fb2cc", fuente: "Inter, sans-serif", peso: 800 })],
  ["5B · Naranja · Inter", variante5({ color: "#e8742c", color2: "#ffa25e", suave: "#fff1e6", tinta: "#2b2f38", fuente: "Inter, sans-serif", peso: 800, etiqueta: "#b85a1d", etiquetaFondo: "#fff1e6" })],
  ["4C · Negro + verde · Roboto", variante4({ fondo: "linear-gradient(165deg, #23262b, #15171a)", fondoSel: "linear-gradient(165deg, #133b2c, #0b241b)", acento: "#2fd17f", texto2: "#a3aab3", fuente: "Roboto, sans-serif", peso: 900 })],
  ["5C · Navy + naranja · Roboto", variante5({ color: "#14284b", color2: "#2c5a8c", suave: "#eef2f7", tinta: "#14284b", fuente: "Roboto, sans-serif", peso: 900, etiqueta: "#c2621f", etiquetaFondo: "#fff1e6" })],
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
