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

const Cierre: React.FC<Props> = (p) => <CierreAxonia {...p} pills={["Multicartera", "Operaciones especiales", "Contabilidad automática", "Reportes de gestión"]} rapido />;

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
  [110, 200, ["Non accrual y write off", "Punitorios y fees a medida", "Amortizaciones y vencimientos"], ["Simulador de préstamos", "Altas desde el onboarding", "Altas manuales"]],
  [205, 300, ["Pago batch y online", "Cajas propias y receptorías", "Débito automático"], ["Pago fecha valor", "Cancelaciones y condonaciones", "Reversas y anulaciones"]],
  [476, 628, ["Baja de las operaciones", "Alta de la nueva operación", "Contrato generado y enviado"], ["Reestructuraciones", "Pronto pago", "Bonificación última cuota"]],
  [768, 890, ["Cálculos impositivos", "Integración contable"], ["Multicartera", "Venta de cartera"]],
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
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderRadius: 14, background: "rgba(12,14,20,0.72)", border: "1px solid rgba(255,255,255,0.12)", color: "white", fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 24, opacity: a * sale, transform: `translateX(${dx}px)`, flexDirection: lado === "left" ? "row" : "row-reverse" }}>
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

// Voice-over file (generated in ElevenLabs). While it is missing the subtitles
// use the estimated times of GUION.
const LOCUCION: string | null = null;
// Voice-over phrases: [from, to] in the recording (s), start in the video (s).
const VOZ: [number, number, number][] = [
  [0, 3.2, 0.4],
  [0, 5.6, 6.0],
  [0, 4.4, 12.2],
  [0, 6.4, 17.4],
  [0, 4.6, 27.0],
  [0, 5.0, 32.6],
  [0, 4.2, 41.8],
  [0, 2.8, 49.0],
];
const TROZOS: string[][] = [
  ["¿Cuánto tiempo pierde tu equipo", "administrando préstamos a mano?"],
  ["Con el core de Axonia definís las reglas de tu negocio:", "punitorios, cargos y cuándo una operación pasa a non accrual."],
  ["Cobrás por cualquier canal,", "y cada pago genera su recibo y lo envía solo."],
  ["¿Un cliente con atrasos? Refinanciás o consolidás", "sus préstamos en tres clicks, con el contrato listo para enviar."],
  ["La contabilidad y los impuestos se calculan solos,", "integrados a tu sistema contable."],
  ["Administrás varias carteras, incluso para venderlas,", "y medís todo con dashboards y reportes."],
  ["Y como está cien por ciento apificado,", "se integra con todo tu ecosistema."],
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
