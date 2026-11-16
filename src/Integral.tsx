import { AbsoluteFill, Audio, Easing, Freeze, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import { BackOfficeDinamico } from "./BackOffice";
import { CollectionsDinamico } from "./CollectionsAxonia";
import { ContactFlowDinamico } from "./ContactFlow";
import { CoreLendingDinamico } from "./CoreLending";
import { MotorDinamico } from "./MotorDecision";
import { OnboardingDinamico } from "./OnboardingApp";
import { CierreAxonia } from "./CierreAxonia";
import { GanchoEditorial } from "./GanchoFoto";
import { Suite360 } from "./Suite360";
import { SucursalDinamico } from "./SucursalVirtual";
import { TiendaDinamico } from "./TiendaAxonia";

// Integral video (30 s, 16:9 and 9:16): Javier Perez's journey through the suite, made
// of pieces of the dynamic videos, cut on the bars of the music
// ("Leave the Key", 129 BPM: a bar is 1.86 s, the drop lands at 22.54 s).
// It opens with the point-of-sale photo hook over the soft intro (two bars). Core
// products get between one and two bars and the rest one bar each; the Suite 360 pull-back
// lands on the drop and the brand closing (logo, pills, "Agendá una demo")
// ends it.

type Props = { fondo: "ondas"; paleta: "gris" };
const FPS = 30;
const COMPAS = (60 / 129.03) * 4 * FPS; // frames per bar
const FASE = 0.225 * FPS; // first downbeat
const compas = (n: number) => FASE + n * COMPAS;
export const INTEGRAL_FRAMES = 900;
const FUNDIDO = 8;
const NARANJA = "#FF8C42";

// [component, source start frame, start bar, end bar]; bar 0 starts the video.
type Pieza = { C: React.ComponentType<Props & Record<string, unknown>>; desde: number; de: number; a: number; extra?: Record<string, unknown> };
const PIEZAS: Pieza[] = [
  // Hook: point-of-sale clip framed on the background, "La venta se define
  // en el mostrador. Que el crédito no la frene."
  { C: GanchoEditorial, desde: 0, de: 0, a: 2 },
  // Phone catalog (the product gets picked), then "Agregar al carrito".
  { C: TiendaDinamico, desde: 236, de: 2, a: 2.5 },
  { C: TiendaDinamico, desde: 300, de: 2.5, a: 3 },
  // Data with the brand change, then the identity check ends with the check.
  { C: OnboardingDinamico, desde: 20, de: 3, a: 3.75 },
  { C: OnboardingDinamico, desde: 555, de: 3.75, a: 4.5 },
  // The engine: workflow building, then the risk matrix changes.
  { C: MotorDinamico, desde: 300, de: 4.5, a: 5.5 },
  { C: MotorDinamico, desde: 462, de: 5.5, a: 6.5 },
  // The folder goes to Tesorería with the check.
  { C: BackOfficeDinamico, desde: 215, de: 6.5, a: 7.5, extra: { sinSaltos: true } },
  // Payment plan, collection and receipt sent.
  { C: CoreLendingDinamico, desde: 146, de: 7.5, a: 9 },
  // Home banking with the loan and the insurance banner.
  { C: SucursalDinamico, desde: 40, de: 9, a: 10 },
  // Collections: payment promise.
  { C: CollectionsDinamico, desde: 290, de: 10, a: 11 },
  // Contact Flow: call room, then segmentation.
  { C: ContactFlowDinamico, desde: 40, de: 11, a: 11.5 },
  { C: ContactFlowDinamico, desde: 570, de: 11.5, a: 12 },
  // Drop: pull-back to the whole suite.
  { C: Suite360, desde: 572, de: 12, a: 13, extra: { generalAmplio: true } },
  // Brand closing: logo, service pills, "Agendá una demo" and the website.
  { C: CierreAxonia, desde: 0, de: 13, a: 99 },
];

// Quick zoom on each piece (fast start, soft stop), alternating in and out, around the device centre
// anchored on the 20% line so the device never climbs into the title area.
const ZOOM = 0.12;
// Voice-over phrases: [from, to] in the recording (s), and where they start
// in the video (s).
const VOZ: [number, number, number][] = [
  // ¿Querés financiar la venta de tus productos o hacer crecer tu negocio de préstamos?
  [0, 4.24, 0],
  // Hoy es más simple de lo que imaginás:
  [4.61, 6.59, 4.55],
  // procesos automatizados, validaciones más robustas y cero papeles.
  [6.96, 10.9, 6.85],
  // Decidí mejor y más rápido, sin necesidad de un gran equipo de especialistas.
  [11.28, 15.46, 11.3],
  // Una suite creada por quienes gestionaron estos procesos durante años...
  [15.73, 21.1, 16.1],
  // Todo el ciclo del crédito, en una sola plataforma.
  [21.41, 24.16, 22.6],
  // Agendá una demo en axonia punto com punto ar.
  [24.47, 27.33, 26.9],
];

// On-screen titles in the free top band: [start bar, end bar, label, line].
const TITULOS: [number, number, string, string][] = [
  [2, 3, "TIENDA ONLINE", "Financiación en el checkout"],
  [3, 4.5, "ONBOARDING DIGITAL", "Ofertas personalizadas, validaciones y firma digital"],
  [4.5, 6.5, "MOTOR DE DECISIÓN", "Matriz de segmentación, ofertas por riesgo y Champion Challenger"],
  [6.5, 7.5, "BACK OFFICE", "Procesos automatizados y sin papeles"],
  [7.5, 9, "CORE LENDING", "Multicartera, consolidaciones y contabilidad"],
  [9, 10, "SUCURSAL VIRTUAL", "Autogestión del cliente"],
  [10, 11, "COBRANZAS", "Segmentación y administración de todos los ciclos de mora"],
  [11, 12, "CONTACT FLOW", "Campañas automáticas y agente de IA"],
];

// Subtitles: each voice phrase split in chunks (timed by length).
const TROZOS: string[][] = [
  ["¿Querés financiar la venta de tus productos", "o hacer crecer tu negocio de préstamos?"],
  ["Hoy es más simple de lo que imaginás:"],
  ["procesos automatizados,", "validaciones más robustas y cero papeles."],
  ["Decidí mejor y más rápido,", "sin necesidad de un gran equipo de especialistas."],
  ["Una suite creada por quienes gestionaron estos procesos", "durante años en las principales entidades financieras."],
  ["Todo el ciclo del crédito,", "en una sola plataforma."],
  ["Agendá una demo en axonia.com.ar"],
];
const SUBS: { t: string; de: number; a: number }[] = VOZ.flatMap(([a, b, en], i) => {
  const total = TROZOS[i].reduce((n, t) => n + t.length, 0);
  let t0 = en;
  return TROZOS[i].map((t) => {
    const d = ((b - a) * t.length) / total;
    const s = { t, de: Math.round(t0 * FPS), a: Math.round((t0 + d) * FPS) };
    t0 += d;
    return s;
  });
});

const Titulo: React.FC<{ etiqueta: string; frase: string; dur: number }> = ({ etiqueta, frase, dur }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const v = height > width;
  const sale = interpolate(f, [dur - 6, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const a = interpolate(f, [2, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const b = interpolate(f, [5, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: v ? 150 : 56, textAlign: "center", fontFamily: "Inter, sans-serif", opacity: sale }}>
      <div style={{ color: NARANJA, fontSize: v ? 30 : 24, fontWeight: 700, letterSpacing: v ? 6 : 5, opacity: a, transform: `translateY(${(1 - a) * 10}px)` }}>{etiqueta}</div>
      <div style={{ color: "white", fontSize: v ? 50 : 46, fontWeight: 800, lineHeight: 1.15, letterSpacing: -0.5, maxWidth: v ? 940 : 1500, margin: `${v ? 12 : 8}px auto 0`, opacity: b, transform: `translateY(${(1 - b) * 14}px)`, textShadow: "0 4px 24px rgba(0,0,0,0.5)" }}>{frase}</div>
    </div>
  );
};

const Subtitulo: React.FC<{ texto: string; dur: number }> = ({ texto, dur }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const v = height > width;
  const o = interpolate(f, [0, 3, dur - 3, dur], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: v ? 170 : 54, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ maxWidth: v ? 900 : 1500, padding: v ? "14px 28px" : "10px 26px", borderRadius: 14, background: "rgba(12,14,20,0.72)", color: "white", fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: v ? 44 : 38, lineHeight: 1.3, textAlign: "center" }}>{texto}</div>
    </div>
  );
};

const Pedazo: React.FC<{ p: Pieza; props: Props; entra: boolean; dur: number; acerca: boolean | null }> = ({ p, props, entra, dur, acerca }) => {
  const f = useCurrentFrame();
  const o = entra ? interpolate(f, [0, FUNDIDO], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  const k = interpolate(f, [0, dur * 0.7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const z = acerca === null ? 1 : 1 + ZOOM * (acerca ? k : 1 - k);
  return (
    <AbsoluteFill style={{ opacity: o, transform: `scale(${z})`, transformOrigin: "50% 20%" }}>
      <Freeze frame={0}>
        <Sequence from={-(p.desde + f)}>
          <p.C {...props} {...p.extra} />
        </Sequence>
      </Freeze>
    </AbsoluteFill>
  );
};

export const Integral: React.FC<Props> = (props) => {
  return (
    <AbsoluteFill style={{ background: "#111" }}>
      {PIEZAS.map((p, i) => {
        // Each piece starts half a fade before its bar so the cut lands on it.
        const ini = i === 0 ? 0 : Math.round(compas(p.de) - FUNDIDO / 2);
        const fin = p.a >= 99 ? INTEGRAL_FRAMES : Math.round(compas(p.a) + FUNDIDO / 2);
        return (
          <Sequence key={i} from={ini} durationInFrames={fin - ini}>
            <Pedazo p={p} props={props} entra={i > 0} dur={fin - ini} acerca={p.C === Suite360 || p.C === CierreAxonia || p.C === GanchoEditorial ? null : i % 2 === 0} />
          </Sequence>
        );
      })}
      {TITULOS.map(([de, a, etiqueta, frase]) => {
        const ini = Math.round(compas(de));
        const fin = Math.round(compas(a));
        return (
          <Sequence key={etiqueta} from={ini} durationInFrames={fin - ini}>
            <Titulo etiqueta={etiqueta} frase={frase} dur={fin - ini} />
          </Sequence>
        );
      })}
      {SUBS.map((s) => (
        <Sequence key={s.t} from={s.de} durationInFrames={s.a - s.de}>
          <Subtitulo texto={s.t} dur={s.a - s.de} />
        </Sequence>
      ))}
      {/* Voice-over, phrase by phrase, each placed on its scene. */}
      {VOZ.map(([a, b, en], i) => (
        <Sequence key={`voz-${i}`} from={Math.round(en * FPS)} durationInFrames={Math.round((b - a) * FPS) + 6}>
          <Audio src={staticFile("voz/locucion.mp3")} trimBefore={Math.round(a * FPS)} durationInFrames={Math.round((b - a) * FPS) + 6} />
        </Sequence>
      ))}
      <Audio
        src={staticFile("musica/leave-the-key.mp3")}
        volume={(f) => interpolate(f, [INTEGRAL_FRAMES - 30, INTEGRAL_FRAMES], [0.15, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
      />
    </AbsoluteFill>
  );
};
