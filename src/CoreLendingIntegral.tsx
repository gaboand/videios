import { AbsoluteFill, Audio, interpolate, Sequence, staticFile } from "remotion";
import { CierreAxonia } from "./CierreAxonia";
import { CORELENDING_FRAMES, CoreLendingDinamico } from "./CoreLending";
import { GanchoFoto } from "./GanchoFoto";
import { compas, FPS, FUNDIDO, MarcaAgua, Pedazo, Pieza, Props, Subtitulo, Titulo } from "./Integral";

// Core Lending ad (16:9 and 9:16), same recipe as the Contact Flow one: a hook with
// a framed clip, the whole dynamic Core Lending video, section titles on top,
// the voice-over with subtitles, the small logo in the corner and the brand closing.

const NARANJA = "#FF8C42";
// The dynamic video starts on bar 2 (after the hook) and plays whole.
const INI = Math.round(compas(2) - FUNDIDO / 2);
const FIN_VIDEO = INI + CORELENDING_FRAMES;
const CIERRE = 160;
export const CL_INTEGRAL_FRAMES = FIN_VIDEO + CIERRE;

const Gancho: React.FC<Props> = () => (
  <GanchoFoto
    variante="c"
    conVideo
    video="videos/escritorio.mp4"
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
  { p: { C: Gancho, desde: 0, de: 0, a: 2 }, ini: 0, fin: INI + FUNDIDO },
  { p: { C: CoreLendingDinamico, desde: 0, de: 2, a: 99 }, ini: INI, fin: FIN_VIDEO + FUNDIDO },
  { p: { C: Cierre, desde: 0, de: 99, a: 99 }, ini: FIN_VIDEO - FUNDIDO / 2, fin: CL_INTEGRAL_FRAMES },
];

// Section titles, in frames of the Core Lending video (its ESC table).
const TITULOS: [number, number, string, string][] = [
  [6, 96, "CORE DE PRÉSTAMOS", "Todo tu negocio de crédito en un solo lugar"],
  [100, 308, "GESTIÓN DE PRÉSTAMOS", "Plan de pagos, cobranzas y recibos al instante"],
  [312, 632, "OPERACIONES ESPECIALES", "Consolidá varios préstamos en una nueva operación"],
  [636, 756, "CONTABILIDAD", "Asientos e inventarios contables automáticos"],
  [760, 896, "ESTADOS FINANCIEROS", "Patrimonial y resultados, siempre al día"],
  [900, 1056, "RESUMEN DE CARTERA", "Toda la cartera por estado, de un vistazo"],
  [1060, CORELENDING_FRAMES - 4, "REPORTE DIARIO", "Los indicadores del día, en tiempo real"],
];

// Voice-over file (generated in ElevenLabs). While it is missing the subtitles
// use the estimated times of GUION.
const LOCUCION: string | null = null;
// Voice-over phrases: [from, to] in the recording (s), start in the video (s).
const VOZ: [number, number, number][] = [
  [0, 2.8, 0.4],
  [0, 4.6, 4.3],
  [0, 4.4, 8.8],
  [0, 5.2, 15.4],
  [0, 5.6, 25.4],
  [0, 4.8, 34.2],
  [0, 2.8, 40.6],
  [0, 2.8, 47.6],
];
const TROZOS: string[][] = [
  ["¿Tu negocio de préstamos crece,", "pero tus sistemas no te acompañan?"],
  ["Con el core de Axonia, administrás cada operación", "de punta a punta en una sola plataforma."],
  ["Cobrás una cuota y el plan de pagos,", "el recibo y la cuenta del cliente se actualizan solos."],
  ["Refinanciás, renovás o consolidás varios préstamos", "en una nueva operación, en segundos y sin errores."],
  ["Cada movimiento impacta directo en la contabilidad:", "asientos, inventarios y balances, sin cargas manuales."],
  ["Y con los reportes de cartera y del día,", "sabés en todo momento cómo rinde tu negocio."],
  ["Multicartera y a escala, desde el primer día."],
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
