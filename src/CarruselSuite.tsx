import { AbsoluteFill, Freeze, Img, staticFile } from "remotion";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import { CollectionsDinamico } from "./CollectionsAxonia";
import { ContactFlowDinamico } from "./ContactFlow";
import { CoreLendingDinamico } from "./CoreLending";
import { FondoAbstracto } from "./FondoAbstracto";
import { MotorDinamico } from "./MotorDecision";
import { OnboardingDinamico } from "./OnboardingApp";

// Suite carousel for LinkedIn / Instagram (1080x1350, 4:5): swipeable stills,
// one idea per slide, same look as the ads (wavy grey background, orange
// accent). Product slides show a frame of the dynamic video with the phone
// moved right (apartaV) and three points on the left.
// npx remotion still CarruselSuite out/carrusel-suite-1.png --props='{"placa":1}'

const NARANJA = "#FF8C42";
const LOGO_W = 2028;
const LOGO_H = 693;
type P = { fondo: "ondas"; paleta: "gris"; apartaV?: (f: number) => number };

const Logo: React.FC<{ w: number }> = ({ w }) => {
  const capa: React.CSSProperties = { position: "absolute", left: 0, top: 0, width: w, height: (w * LOGO_H) / LOGO_W, maxWidth: "none" };
  return (
    <div style={{ position: "relative", width: w, height: (w * LOGO_H) / LOGO_W }}>
      <Img src={staticFile("axonia-letras.png")} style={capa} />
      <Img src={staticFile("axonia-icono.png")} style={{ ...capa, filter: "drop-shadow(0 0 24px rgba(125,211,252,0.5))" }} />
    </div>
  );
};

type Producto = {
  C: React.ComponentType<P>;
  frame: number;
  etiqueta: string;
  titulo: string;
  puntos: string[];
};

const PRODUCTOS: Producto[] = [
  { C: OnboardingDinamico, frame: 560, etiqueta: "ONBOARDING DIGITAL", titulo: "Clientes nuevos en minutos", puntos: ["Validación de identidad con prueba de vida", "Ofertas personalizadas", "Firma desde el celular"] },
  { C: MotorDinamico, frame: 540, etiqueta: "MOTOR DE DECISIÓN", titulo: "Riesgo y negocio, en la misma decisión", puntos: ["Riesgo por canal, producto y perfil", "Rentabilidad ajustada al riesgo", "Champion Challenger"] },
  { C: CoreLendingDinamico, frame: 260, etiqueta: "CORE LENDING", titulo: "Todo el ciclo del préstamo, en un solo core", puntos: ["Multicartera", "Curing de cartera en 3 clicks", "Contabilidad integrada"] },
  { C: CollectionsDinamico, frame: 560, etiqueta: "COBRANZAS", titulo: "Cada cliente, en su estrategia de mora", puntos: ["Segmentación de la cartera", "Promesas de pago", "Gestión de todos los ciclos de mora"] },
  { C: ContactFlowDinamico, frame: 640, etiqueta: "CONTACT FLOW", titulo: "La productividad de un mes, en horas", puntos: ["Campañas automáticas", "Agentes de IA", "Segmentación de casos"] },
];
export const CARRUSEL_SUITE_PLACAS = PRODUCTOS.length + 2;

// Page dots at the bottom and the swipe arrow on the right edge.
const Paginas: React.FC<{ n: number }> = ({ n }) => (
  <>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 44, display: "flex", justifyContent: "center", gap: 12 }}>
      {Array.from({ length: CARRUSEL_SUITE_PLACAS }, (_, i) => (
        <div key={i} style={{ width: i + 1 === n ? 34 : 12, height: 12, borderRadius: 6, background: i + 1 === n ? NARANJA : "rgba(255,255,255,0.3)" }} />
      ))}
    </div>
    {n < CARRUSEL_SUITE_PLACAS ? (
      <div style={{ position: "absolute", right: 34, bottom: 30, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.75)", fontSize: 34, fontWeight: 600 }}>→</div>
    ) : null}
  </>
);

// Cover: short text on the left and a photo panel bleeding off the right
// edge (the usual carousel opening), cropped to fill, never stretched.
const Portada: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: "Inter, sans-serif" }}>
    <FondoAbstracto paleta="gris" estilo="ondas" />
    <div style={{ position: "absolute", right: -40, top: 110, bottom: 150, width: 440, borderRadius: 32, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.55)", border: "2px solid rgba(255,255,255,0.12)" }}>
      <Img src={staticFile("carrusel/portada-matriz.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "60% 50%" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(20,22,26,0.35), rgba(20,22,26,0) 40%)" }} />
    </div>
    <div style={{ position: "absolute", left: 80, width: 520, top: 330 }}>
      <Logo w={400} />
      <div style={{ width: 80, height: 7, borderRadius: 4, background: NARANJA, margin: "64px 0 44px" }} />
      <div style={{ color: "white", fontSize: 72, fontWeight: 800, lineHeight: 1.05, letterSpacing: -1.5 }}>Todo el ciclo del crédito.</div>
      <div style={{ color: NARANJA, fontSize: 72, fontWeight: 800, lineHeight: 1.05, letterSpacing: -1.5, marginTop: 8 }}>En una sola plataforma.</div>
    </div>
    <Paginas n={1} />
  </AbsoluteFill>
);

const siempre = () => 1;
const PlacaProducto: React.FC<{ p: Producto; n: number }> = ({ p, n }) => (
  <AbsoluteFill style={{ fontFamily: "Inter, sans-serif" }}>
    <Freeze frame={p.frame}>
      <p.C fondo="ondas" paleta="gris" apartaV={siempre} />
    </Freeze>
    <div style={{ position: "absolute", right: 56, top: 54 }}>
      <Logo w={190} />
    </div>
    <div style={{ position: "absolute", left: 70, right: 300, top: 120 }}>
      <div style={{ color: NARANJA, fontSize: 30, fontWeight: 700, letterSpacing: 6 }}>{p.etiqueta}</div>
      <div style={{ color: "white", fontSize: 62, fontWeight: 800, lineHeight: 1.08, letterSpacing: -1, marginTop: 14, textShadow: "0 4px 24px rgba(0,0,0,0.5)" }}>{p.titulo}</div>
    </div>
    <div style={{ position: "absolute", left: 60, width: 430, top: 600, display: "flex", flexDirection: "column", gap: 22 }}>
      {p.puntos.map((t) => (
        <div key={t} style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 26px", borderRadius: 18, background: "rgba(12,14,20,0.86)", border: "1px solid rgba(255,255,255,0.14)", boxShadow: "0 10px 30px rgba(0,0,0,0.45)", color: "white", fontSize: 32, fontWeight: 600, lineHeight: 1.2 }}>
          <div style={{ width: 14, height: 14, borderRadius: 7, background: NARANJA, flexShrink: 0 }} />
          {t}
        </div>
      ))}
    </div>
    <Paginas n={n} />
  </AbsoluteFill>
);

const Cierre: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: "Inter, sans-serif", alignItems: "center" }}>
    <FondoAbstracto paleta="gris" estilo="ondas" />
    <div style={{ position: "absolute", left: 90, right: 90, top: 250, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
      <Logo w={520} />
      <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 28, fontWeight: 600, letterSpacing: 6, marginTop: 24 }}>SUITE DE CRÉDITOS MODULAR</div>
      <div style={{ color: "white", fontSize: 64, fontWeight: 800, lineHeight: 1.1, letterSpacing: -1, marginTop: 80 }}>
        Completamos el proceso <span style={{ color: NARANJA }}>que te falta</span>.
      </div>
      <div style={{ marginTop: 80, padding: "26px 60px", borderRadius: 999, background: NARANJA, color: "white", fontSize: 40, fontWeight: 700, boxShadow: "0 12px 40px rgba(255,140,66,0.45)" }}>Agendá una demo</div>
      <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 32, fontWeight: 600, letterSpacing: 2, marginTop: 30 }}>axonia.com.ar</div>
    </div>
    <Paginas n={CARRUSEL_SUITE_PLACAS} />
  </AbsoluteFill>
);

export const CarruselSuite: React.FC<{ placa: number }> = ({ placa }) => {
  if (placa <= 1) return <Portada />;
  if (placa >= CARRUSEL_SUITE_PLACAS) return <Cierre />;
  return <PlacaProducto p={PRODUCTOS[placa - 2]} n={placa} />;
};
