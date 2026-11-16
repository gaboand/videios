import { AbsoluteFill, Audio, interpolate, Sequence, staticFile } from "remotion";
import { CierreAxonia } from "./CierreAxonia";
import { ContactFlowDinamico } from "./ContactFlow";
import { GanchoFoto } from "./GanchoFoto";
import { compas, FPS, FUNDIDO, Pedazo, Pieza, Props, Subtitulo, Titulo } from "./Integral";

// Contact Flow ad (35 s, 16:9 and 9:16), same recipe as the integral video:
// a hook with a framed clip ("¿La mora sube y las ventas no acompañan?"),
// a voice-over that complements the screen texts instead of reading them,
// pieces of the dynamic Contact Flow video cut on the bars of the music,
// screen titles, subtitles of the voice-over and the brand closing.

export const CF_INTEGRAL_FRAMES = 1050;
const NARANJA = "#FF8C42";

const Gancho: React.FC<Props> = () => (
  <GanchoFoto
    variante="c"
    conVideo
    video="videos/escritorio.mp4"
    titulo="¿La mora sube y las ventas no acompañan?"
    desdeBajada={46}
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
  { C: ContactFlowDinamico, desde: 30, de: 2, a: 4 },
  // Message templates.
  { C: ContactFlowDinamico, desde: 330, de: 4, a: 5 },
  // Segmentation with the drill-down.
  { C: ContactFlowDinamico, desde: 560, de: 5, a: 7 },
  // Time slots.
  { C: ContactFlowDinamico, desde: 750, de: 7, a: 8 },
  // Results dashboard ("lo que antes hacías en un mes...").
  { C: ContactFlowDinamico, desde: 860, de: 8, a: 10 },
  // Campaign set-up ("tus campañas se programan").
  { C: ContactFlowDinamico, desde: 440, de: 10, a: 12 },
  // Flow editor ("tus procesos se automatizan"), on the drop.
  { C: ContactFlowDinamico, desde: 176, de: 12, a: 13.5 },
  // Reports ("tus resultados mejoran").
  { C: ContactFlowDinamico, desde: 940, de: 13.5, a: 15 },
  // Brand closing with the Contact Flow pills.
  { C: Cierre, desde: 0, de: 15, a: 99 },
];

const TITULOS: [number, number, string, string][] = [
  [2, 4, "SALA DE CONTACTO", "Toda la operación de un vistazo"],
  [4, 5, "PLANTILLAS", "Mensajes listos para cada canal"],
  [5, 7, "SEGMENTACIÓN", "El mensaje justo para cada cliente"],
  [7, 8, "FRANJAS HORARIAS", "Contactá en el mejor momento"],
  [8, 10, "DASHBOARD", "Resultados medibles al instante"],
  [10, 12, "CAMPAÑAS", "Programadas y automáticas"],
  [12, 13.5, "EDITOR DE FLUJOS", "Procesos automatizados sin programar"],
  [13.5, 15, "REPORTES", "Seguimiento de cada campaña"],
];

// Voice-over phrases: [from, to] in the recording (s), start in the video (s).
const VOZ: [number, number, number][] = [
  // ¿Tu negocio ya no rinde como antes?
  [0, 2.11, 0.3],
  // Hoy, podés contactar a miles de clientes en horas.
  [2.53, 5.55, 2.75],
  // Tenés que saber que ya cambió la manera de hablar con tus clientes.
  [5.97, 9.02, 6.0],
  // Antes necesitabas un call center con muchos agentes, tareas manuales...
  [9.44, 15.75, 9.8],
  // Todo eso se acabó.
  [16.11, 17.41, 16.6],
  // Lo que antes hacías en un mes, ahora lo hacés en horas.
  [17.77, 20.69, 18.3],
  // Tus campañas se programan, tus procesos se automatizan y tus resultados mejoran...
  [20.99, 26.17, 21.7],
  // Agendá una demo en axonia punto com punto ar.
  [26.48, 29.39, 31.6],
];
const TROZOS: string[][] = [
  ["¿Tu negocio ya no rinde como antes?"],
  ["Hoy, podés contactar a miles de clientes en horas."],
  ["Tenés que saber que ya cambió", "la manera de hablar con tus clientes."],
  ["Antes necesitabas un call center con muchos agentes,", "tareas manuales, muchos sistemas", "y procesos complejos."],
  ["Todo eso se acabó."],
  ["Lo que antes hacías en un mes,", "ahora lo hacés en horas."],
  ["Tus campañas se programan,", "tus procesos se automatizan", "y tus resultados mejoran más rápidamente."],
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
