import { AbsoluteFill, Audio, interpolate, Sequence, staticFile } from "remotion";
import { CierreAxonia } from "./CierreAxonia";
import { ContactFlowDinamico } from "./ContactFlow";
import { GanchoFoto } from "./GanchoFoto";
import { compas, FPS, FUNDIDO, Pedazo, Pieza, Props, Subtitulo, Titulo } from "./Integral";

// Contact Flow ad (30 s, 16:9 and 9:16), same recipe as the integral video:
// a hook with a framed clip ("¿La mora sube y las ventas no acompañan?"),
// pieces of the dynamic Contact Flow video cut on the bars of the music,
// screen titles, subtitles of the voice-over and the brand closing.

export const CF_INTEGRAL_FRAMES = 900;
const NARANJA = "#FF8C42";

const Gancho: React.FC<Props> = () => (
  <GanchoFoto
    variante="c"
    conVideo
    video="videos/escritorio.mp4"
    titulo="¿La mora sube y las ventas no acompañan?"
    desdeBajada={93}
    bajada={
      <>
        Lo que antes te llevaba un mes, hoy lo resolvés <span style={{ color: NARANJA, fontWeight: 700 }}>en horas</span>.
      </>
    }
  />
);

const Cierre: React.FC<Props> = (p) => <CierreAxonia {...p} pills={["Campañas automáticas", "Agente de IA", "Segmentación", "Dashboard de resultados"]} />;

// [component, source start frame, start bar, end bar].
const PIEZAS: Pieza[] = [
  { C: Gancho, desde: 0, de: 0, a: 2 },
  // Call room with the live panel.
  { C: ContactFlowDinamico, desde: 30, de: 2, a: 3.5 },
  // Flow editor building the strategy.
  { C: ContactFlowDinamico, desde: 176, de: 3.5, a: 5 },
  // Message templates.
  { C: ContactFlowDinamico, desde: 330, de: 5, a: 6 },
  // Campaign set-up.
  { C: ContactFlowDinamico, desde: 440, de: 6, a: 7.5 },
  // Segmentation with the drill-down.
  { C: ContactFlowDinamico, desde: 560, de: 7.5, a: 9 },
  // Time slots.
  { C: ContactFlowDinamico, desde: 750, de: 9, a: 10 },
  // Results dashboard.
  { C: ContactFlowDinamico, desde: 860, de: 10, a: 13 },
  // Brand closing with the Contact Flow pills.
  { C: Cierre, desde: 0, de: 13, a: 99 },
];

const TITULOS: [number, number, string, string][] = [
  [2, 3.5, "SALA DE CONTACTO", "Toda la operación de un vistazo"],
  [3.5, 5, "EDITOR DE FLUJOS", "Estrategias de contacto sin programar"],
  [5, 6, "PLANTILLAS", "Mensajes listos para cada canal"],
  [6, 7.5, "CAMPAÑAS", "Programadas y automáticas"],
  [7.5, 9, "SEGMENTACIÓN", "El mensaje justo para cada cliente"],
  [9, 10, "FRANJAS HORARIAS", "Contactá en el mejor momento"],
  [10, 13, "DASHBOARD", "Resultados medibles al instante"],
];

// Voice-over phrases: [from, to] in the recording (s), start in the video (s).
const VOZ: [number, number, number][] = [
  [0, 2.48, 0.3],
  [2.89, 5.91, 3.1],
  [6.26, 11.74, 6.75],
  [12.04, 17.3, 12.7],
  [17.63, 20.56, 19.4],
  [20.86, 23.72, 26.9],
];
const TROZOS: string[][] = [
  ["¿La mora sube y las ventas no acompañan?"],
  ["Lo que antes te llevaba un mes,", "hoy lo resolvés en horas."],
  ["Antes necesitabas muchos sistemas, tareas manuales", "y procesos complejos para llegar a tus clientes."],
  ["Ahora tus campañas se programan,", "tus procesos se automatizan", "y tus resultados mejoran más rápido."],
  ["Todo el contacto con tu cartera,", "en una sola plataforma."],
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

export const ContactFlowIntegral: React.FC<Props> = (props) => (
  <AbsoluteFill style={{ background: "#111" }}>
    {PIEZAS.map((p, i) => {
      const ini = i === 0 ? 0 : Math.round(compas(p.de) - FUNDIDO / 2);
      const fin = p.a >= 99 ? CF_INTEGRAL_FRAMES : Math.round(compas(p.a) + FUNDIDO / 2);
      return (
        <Sequence key={i} from={ini} durationInFrames={fin - ini}>
          <Pedazo p={p} props={props} entra={i > 0} dur={fin - ini} acerca={p.C === ContactFlowDinamico ? i % 2 === 1 : null} />
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
    {VOZ.map(([a, b, en], i) => (
      <Sequence key={`voz-${i}`} from={Math.round(en * FPS)} durationInFrames={Math.round((b - a) * FPS) + 6}>
        <Audio src={staticFile("voz/locucion-contactflow.mp3")} trimBefore={Math.round(a * FPS)} durationInFrames={Math.round((b - a) * FPS) + 6} />
      </Sequence>
    ))}
    <Audio
      src={staticFile("musica/leave-the-key.mp3")}
      volume={(f) => interpolate(f, [CF_INTEGRAL_FRAMES - 30, CF_INTEGRAL_FRAMES], [0.15, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
    />
  </AbsoluteFill>
);
