import { AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CierreAxonia } from "./CierreAxonia";
import { GanchoFoto } from "./GanchoFoto";
import { compas, FPS, FUNDIDO, MarcaAgua, Pedazo, Pieza, Props, Subtitulo, Titulo } from "./Integral";

// Product ad recipe (16:9 and 9:16), used by Core Lending and Onboarding: a hook
// with a framed clip, the whole dynamic product video, section titles on top,
// side texts with the product features, the voice-over with subtitles, the
// small logo in the corner and the brand closing.

const NARANJA = "#FF8C42";
const CIERRE = 160;

export type ConfigPublicitario = {
  // Dynamic video; it must take apartaV (9:16: 0..1 per frame, the phone
  // shrinks and moves right to leave the left column for the side texts).
  Video: React.ComponentType<Props & { apartaV?: (frame: number) => number }>;
  frames: number;
  gancho: { video: string; titulo: string; bajada: React.ReactNode; velocidad?: number };
  pills: string[];
  // [from, to] in frames of the product video, label, line.
  titulos: [number, number, string, string][];
  // [from, to] in frames of the product video, left items, right items.
  laterales: [number, number, string[], string[]][];
  // Voice-over file in public/ (null while it is missing).
  locucion: string | null;
  // Voice-over phrases: [from, to] in the recording (s), start in the video (s),
  // and the subtitle chunks of each phrase.
  voz: [number, number, number][];
  trozos: string[][];
};

export const destacado = (t: string) => <span style={{ color: NARANJA, fontWeight: 700 }}>{t}</span>;

const Lateral: React.FC<{ izq: string[]; der: string[]; dur: number }> = ({ izq, der, dur }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const sale = interpolate(f, [dur - 8, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (height > width) {
    // 9:16: the phone moves right and the texts go in a left column, left
    // items first and right items after.
    // At most 3 texts at a time so the column never reaches the subtitles.
    const grupos = [izq, der].filter((g) => g.length > 0).flatMap((g) => (g.length > 3 ? [g.slice(0, Math.ceil(g.length / 2)), g.slice(Math.ceil(g.length / 2))] : [g]));
    const tramo = dur / grupos.length;
    const g = Math.min(grupos.length - 1, Math.floor(f / tramo));
    const fl = f - g * tramo;
    const fuera = interpolate(fl, [tramo - 8, tramo], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return (
      <AbsoluteFill>
        <div style={{ position: "absolute", left: 36, width: 450, top: height * 0.57, transform: "translateY(-50%)", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 18 }}>
          {grupos[g].map((t, i) => {
            const a = interpolate(fl, [4 + i * 8, 16 + i * 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
            return (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 24px", borderRadius: 16, background: "rgba(12,14,20,0.86)", border: "1px solid rgba(255,255,255,0.14)", boxShadow: "0 10px 30px rgba(0,0,0,0.45)", color: "white", fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 31, lineHeight: 1.2, whiteSpace: "pre-line", opacity: a * fuera, transform: `translateX(${(1 - a) * -30}px)` }}>
                <div style={{ width: 13, height: 13, borderRadius: 7, background: NARANJA, flexShrink: 0 }} />
                {t}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    );
  }
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

export const armarPublicitario = (cfg: ConfigPublicitario) => {
  // The product video starts on bar 3 (after the hook) and plays whole.
  const INI = Math.round(compas(3) - FUNDIDO / 2);
  const FIN_VIDEO = INI + cfg.frames;
  const total = FIN_VIDEO + CIERRE;

  const Gancho: React.FC<Props> = () => <GanchoFoto variante="c" conVideo video={cfg.gancho.video} titulo={cfg.gancho.titulo} desdeBajada={46} bajada={cfg.gancho.bajada} velocidad={cfg.gancho.velocidad} />;
  const Cierre: React.FC<Props> = (p) => <CierreAxonia {...p} pills={cfg.pills} rapido />;
  const ventana = (v: number) =>
    Math.max(0, ...cfg.laterales.map(([de, a]) => interpolate(v, [de - 14, de, a, a + 14], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) })));
  const piezas: { p: Pieza; ini: number; fin: number }[] = [
    { p: { C: Gancho, desde: 0, de: 0, a: 3 }, ini: 0, fin: INI + FUNDIDO },
    { p: { C: cfg.Video, desde: 0, de: 3, a: 99, extra: { apartaV: ventana } }, ini: INI, fin: FIN_VIDEO + FUNDIDO },
    { p: { C: Cierre, desde: 0, de: 99, a: 99 }, ini: FIN_VIDEO - FUNDIDO / 2, fin: total },
  ];
  const subs = cfg.voz.flatMap(([a, b, en], i) => {
    const largo = cfg.trozos[i].reduce((n, t) => n + t.length, 0);
    let t0 = en;
    return cfg.trozos[i].map((t) => {
      const d = ((b - a) * t.length) / largo;
      const s = { t, de: Math.round(t0 * FPS), a: Math.round((t0 + d) * FPS) };
      t0 += d;
      return s;
    });
  });

  const Componente: React.FC<Props> = (props) => (
    <AbsoluteFill style={{ background: "#111" }}>
      {piezas.map(({ p, ini, fin }, i) => (
        <Sequence key={i} from={ini} durationInFrames={fin - ini}>
          <Pedazo p={p} props={props} entra={i > 0} dur={fin - ini} acerca={null} />
        </Sequence>
      ))}
      <MarcaAgua hasta={FIN_VIDEO} />
      {cfg.laterales.map(([de, a, izq, der]) => (
        <Sequence key={de} from={INI + de} durationInFrames={a - de}>
          <Lateral izq={izq} der={der} dur={a - de} />
        </Sequence>
      ))}
      {cfg.titulos.map(([de, a, etiqueta, frase]) => (
        <Sequence key={etiqueta} from={INI + de} durationInFrames={a - de}>
          <Titulo etiqueta={etiqueta} frase={frase} dur={a - de} />
        </Sequence>
      ))}
      {subs.map((s) => (
        <Sequence key={s.t} from={s.de} durationInFrames={s.a - s.de}>
          <Subtitulo texto={s.t} dur={s.a - s.de} />
        </Sequence>
      ))}
      {cfg.locucion
        ? cfg.voz.map(([a, b, en], i) => (
            <Sequence key={`voz-${i}`} from={Math.round(en * FPS)} durationInFrames={Math.round((b - a) * FPS) + 6}>
              <Audio src={staticFile(cfg.locucion!)} trimBefore={Math.round(a * FPS)} durationInFrames={Math.round((b - a) * FPS) + 6} />
            </Sequence>
          ))
        : null}
      <Audio
        src={staticFile("musica/leave-the-key.mp3")}
        volume={(f) => interpolate(f, [total - 30, total], [0.15, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
      />
    </AbsoluteFill>
  );
  return { Componente, frames: total };
};
