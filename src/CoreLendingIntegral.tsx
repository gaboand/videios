import { AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CierreAxonia } from "./CierreAxonia";
import { CORELENDING_FRAMES, CoreLendingDinamico } from "./CoreLending";
import { GanchoFoto } from "./GanchoFoto";
import { compas, FPS, FUNDIDO, MarcaAgua, Pedazo, Pieza, Props, Subtitulo, Titulo } from "./Integral";

// Core Lending ad (16:9 and 9:16), same recipe as the Contact Flow one: a hook with
// a framed clip, the whole dynamic Core Lending video, section titles on top,
// the voice-over with subtitles, the small logo in the corner and the brand closing.

const NARANJA = "#FF8C42";
// The dynamic video starts on bar 3 (after the hook) and plays whole.
const INI = Math.round(compas(3) - FUNDIDO / 2);
const FIN_VIDEO = INI + CORELENDING_FRAMES;
const CIERRE = 160;
export const CL_INTEGRAL_FRAMES = FIN_VIDEO + CIERRE;

const Gancho: React.FC<Props> = () => (
  <GanchoFoto
    variante="c"
    conVideo
    video="videos/cartera.mp4"
    titulo="¿Tu cartera crece más rápido que tu operación?"
    desdeBajada={46}
    bajada={
      <>
        Todo el ciclo del préstamo, <span style={{ color: NARANJA, fontWeight: 700 }}>en un solo core</span>.
      </>
    }
  />
);

const Cierre: React.FC<Props> = (p) => <CierreAxonia {...p} pills={["Procesos automáticos", "Multicartera", "Contabilidad integrada", "100% apificado"]} rapido />;

const PIEZAS: { p: Pieza; ini: number; fin: number }[] = [
  { p: { C: Gancho, desde: 0, de: 0, a: 3 }, ini: 0, fin: INI + FUNDIDO },
  { p: { C: CoreLendingDinamico, desde: 0, de: 3, a: 99 }, ini: INI, fin: FIN_VIDEO + FUNDIDO },
  { p: { C: Cierre, desde: 0, de: 99, a: 99 }, ini: FIN_VIDEO - FUNDIDO / 2, fin: CL_INTEGRAL_FRAMES },
];

// Section titles, in frames of the Core Lending video (its ESC table).
const TITULOS: [number, number, string, string][] = [
  [6, 96, "CORE DE PRÉSTAMOS", "Las reglas de tu negocio, configuradas por vos"],
  [100, 308, "ALTAS Y COBRANZAS", "Todos los canales de pago, con recibo automático"],
  [312, 632, "CURING DE CARTERA", "Refinanciá, consolidá o reestructurá en 3 clicks"],
  [636, 756, "CONTABILIDAD", "Inventarios contables e integración automática"],
  [760, 896, "ESTADOS FINANCIEROS", "Impuestos y balances, siempre al día"],
  [900, 1056, "DASHBOARD Y REPORTES", "Cartera, tesorería y comisiones de un vistazo"],
  [1060, CORELENDING_FRAMES - 4, "INFORMACIÓN AUTOMÁTICA", "Reportes que se generan y se envían solos"],
];

// Side texts beside the device, only while the camera is not zoomed in:
// [from, to] in frames of the Core Lending video, left items, right items.
const LATERALES: [number, number, string[], string[]][] = [
  [8, 96, [], ["Non accrual y write off", "Punitorios y fees a medida", "Bonificación última cuota", "Descuento por pago adelantado"]],
  [110, 200, ["Simulador de préstamos", "Amortizaciones y vencimientos"], ["Altas automáticas\ndesde Onboarding", "Altas manuales"]],
  [205, 300, ["Pago batch y online", "Cajas propias y receptorías", "Débito automático"], ["Pago fecha valor", "Cancelaciones y condonaciones", "Reversas y anulaciones"]],
  [476, 628, ["Baja y alta automática\nde las operaciones", "Contrato generado y enviado"], ["Reestructuraciones", "Ajuste de cuotas"]],
  [768, 890, ["Cálculos impositivos", "Integración contable"], ["Multicartera", "Venta de cartera"]],
  [904, 1052, ["Vintage", "FPD"], ["Rentabilidad", "Análisis de\ncomportamiento"]],
  [1068, 1252, ["Avisos de vencimiento", "Carteras en mora", "Central de Deudores"], ["CRM con bitácora documental", "Comisiones por venta", "100% apificado"]],
];

const Lateral: React.FC<{ izq: string[]; der: string[]; dur: number }> = ({ izq, der, dur }) => {
  const f = useCurrentFrame();
  const { height } = useVideoConfig();
  const sale = interpolate(f, [dur - 8, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const columna = (items: string[], lado: "left" | "right", base: number) => (
    <div style={{ position: "absolute", [lado]: 64, top: height * 0.62, transform: "translateY(-50%)", display: "flex", flexDirection: "column", alignItems: lado === "left" ? "flex-start" : "flex-end", gap: 16 }}>
      {items.map((t, i) => {
        const a = interpolate(f, [base + i * 8, base + i * 8 + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
        const dx = (1 - a) * (lado === "left" ? -30 : 30);
        return (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderRadius: 14, background: "rgba(12,14,20,0.72)", border: "1px solid rgba(255,255,255,0.12)", color: "white", fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 22, lineHeight: 1.25, whiteSpace: "pre-line", textAlign: lado === "left" ? "left" : "right", opacity: a * sale, transform: `translateX(${dx}px)`, flexDirection: lado === "left" ? "row" : "row-reverse" }}>
            <div style={{ width: 10, height: 10, borderRadius: 5, background: NARANJA, flexShrink: 0 }} />
            {t}
          </div>
        );
      })}
    </div>
  );
  return (
    <AbsoluteFill>
      {columna(izq, "left", 4)}
      {columna(der, "right", 4 + izq.length * 8)}
    </AbsoluteFill>
  );
};

// Voice-over (ElevenLabs, voice Camila), cut on its silences.
const LOCUCION: string | null = "voz/locucion-corelending.mp3";
// Voice-over phrases: [from, to] in the recording (s), start in the video (s).
const VOZ: [number, number, number][] = [
  [0, 4.53, 0.4],
  [4.97, 7.42, 5.4],
  [7.75, 11.73, 8.18],
  [12.1, 15.27, 12.6],
  [15.53, 17.63, 16.03],
  [18.08, 19.25, 18.5],
  [19.56, 23.57, 19.98],
  [23.9, 28.33, 24.32],
  [28.77, 33.24, 29.1],
  [33.64, 39.87, 33.95],
  [40.29, 47.7, 40.6],
  [48.09, 50.99, 48.4],
];
const TROZOS: string[][] = [
  ["¿Cuánto tiempo pierde tu equipo administrando préstamos", "con planillas y procesos manuales?"],
  ["Con el core de Axonia, vos definís las reglas:"],
  ["punitorios, bonificaciones y cuándo", "una operación pasa a non accrual."],
  ["Simulás, das de alta y cobrás por cualquier canal,"],
  ["con el recibo enviado automáticamente."],
  ["¿Un cliente con atrasos?"],
  ["Refinanciás, consolidás o reestructurás", "sus préstamos en tres clicks:"],
  ["se dan de baja, se da de alta la nueva operación", "y el contrato sale listo para enviar."],
  ["La contabilidad y los impuestos se calculan solos,", "integrados a tu sistema contable."],
  ["Administrás varias carteras, seguís tesorería y comisiones,", "y medís la rentabilidad y el comportamiento de cada una."],
  ["Los avisos de vencimiento y los informes de mora se generan solos,", "y como está cien por ciento apificado,", "se integra con todo tu ecosistema."],
  ["Agendá una demo en axonia.com.ar"],
];
const SUBS = VOZ.flatMap(([a, b, en], i) => {
  const total = TROZOS[i].reduce((n, t) => n + t.length, 0);
  let t0 = en;
  return TROZOS[i].map((t) => {
    const d = ((b - a) * t.length) / total;
    const s = { t, de: Math.round(t0 * FPS), a: Math.round((t0 + d) * FPS) };
    t0 += d;
    return s;
  });
});

export const CoreLendingIntegral: React.FC<Props> = (props) => (
  <AbsoluteFill style={{ background: "#111" }}>
    {PIEZAS.map(({ p, ini, fin }, i) => (
      <Sequence key={i} from={ini} durationInFrames={fin - ini}>
        <Pedazo p={p} props={props} entra={i > 0} dur={fin - ini} acerca={null} />
      </Sequence>
    ))}
    <MarcaAgua hasta={FIN_VIDEO} />
    {LATERALES.map(([de, a, izq, der]) => (
      <Sequence key={de} from={INI + de} durationInFrames={a - de}>
        <Lateral izq={izq} der={der} dur={a - de} />
      </Sequence>
    ))}
    {TITULOS.map(([de, a, etiqueta, frase]) => (
      <Sequence key={etiqueta} from={INI + de} durationInFrames={a - de}>
        <Titulo etiqueta={etiqueta} frase={frase} dur={a - de} />
      </Sequence>
    ))}
    {SUBS.map((s) => (
      <Sequence key={s.t} from={s.de} durationInFrames={s.a - s.de}>
        <Subtitulo texto={s.t} dur={s.a - s.de} />
      </Sequence>
    ))}
    {LOCUCION
      ? VOZ.map(([a, b, en], i) => (
          <Sequence key={`voz-${i}`} from={Math.round(en * FPS)} durationInFrames={Math.round((b - a) * FPS) + 6}>
            <Audio src={staticFile(LOCUCION)} trimBefore={Math.round(a * FPS)} durationInFrames={Math.round((b - a) * FPS) + 6} />
          </Sequence>
        ))
      : null}
    <Audio
      src={staticFile("musica/leave-the-key.mp3")}
      volume={(f) => interpolate(f, [CL_INTEGRAL_FRAMES - 30, CL_INTEGRAL_FRAMES], [0.15, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
    />
  </AbsoluteFill>
);
