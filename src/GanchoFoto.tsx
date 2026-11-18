import { AbsoluteFill, Easing, Img, interpolate, OffthreadVideo, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import "@fontsource/inter/500.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import { FondoAbstracto } from "./FondoAbstracto";

// Photo hook of the integral video (B2B): a point of sale where the customer
// hesitates, with a slow push-in and a two-beat line: "La venta se define en el
// mostrador." / "Que el crédito no la frene.". Five looks to choose from (variante a-e).

const NARANJA = "#FF8C42";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const FOTO = staticFile("fotos/mostrador.jpg");
const FOTO_W = 1672;
const FOTO_H = 941;
export const GANCHO_FOTO_FRAMES = 118;

const L1 = "La venta se define en el mostrador.";
const L2 = "Que el crédito no la frene.";

type Variante = "a" | "b" | "c" | "d" | "e";

// Text line that slides up and fades in.
const Entra: React.FC<{ desde: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ desde, style, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame: frame - desde, fps, config: { damping: 18, stiffness: 90 } });
  return <div style={{ opacity: a, transform: `translateY(${(1 - a) * 24}px)`, ...style }}>{children}</div>;
};

// The photo covering a box, with zoom z around (ox, oy) in photo pixels.
const Foto: React.FC<{ w: number; h: number; z: number; ox?: number; oy?: number; filtro?: string }> = ({ w, h, z, ox = FOTO_W / 2, oy = FOTO_H / 2, filtro }) => {
  const cubre = Math.max(w / FOTO_W, h / FOTO_H) * z;
  // Keep the zoom centre inside the frame without showing the photo edges.
  const left = Math.min(0, Math.max(w - FOTO_W * cubre, w / 2 - ox * cubre));
  const top = Math.min(0, Math.max(h - FOTO_H * cubre, h / 2 - oy * cubre));
  return <Img src={FOTO} style={{ position: "absolute", left, top, width: FOTO_W * cubre, height: FOTO_H * cubre, maxWidth: "none", maxHeight: "none", filter: filtro }} />;
};

// conVideo: the editorial look shows the store clip (first part, the doubt)
// instead of the photo; the clip already has its own camera move.
// video / titulo / bajada / desdeBajada: optional overrides of the editorial
// look (other clip and texts, used by other videos).
export const GanchoFoto: React.FC<{
  variante: Variante;
  conVideo?: boolean;
  video?: string;
  titulo?: React.ReactNode;
  bajada?: React.ReactNode;
  desdeBajada?: number;
  // velocidad: playback rate of the clip (below 1 to stretch a short clip).
  velocidad?: number;
  // textoV: scale of the title and line in 9:16 (for long texts that would
  // reach the subtitles).
  textoV?: number;
}> = ({ variante, conVideo, video = "videos/mostrador.mp4", titulo, bajada, desdeBajada = 48, velocidad = 1, textoV = 1 }) => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const empuje = interpolate(frame, [0, durationInFrames], [1, 1.08], clamp);
  const entra = interpolate(frame, [0, 12], [0, 1], clamp);

  if (variante === "a") {
    // Full photo, dark gradient on top, centred text.
    return (
      <AbsoluteFill style={{ fontFamily: "Inter, sans-serif", background: "#111", opacity: entra }}>
        <Foto w={width} h={height} z={empuje} ox={900} oy={420} />
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,14,22,0.85) 0%, rgba(10,14,22,0.45) 32%, rgba(10,14,22,0) 55%)" }} />
        <div style={{ position: "absolute", top: 70, left: 0, right: 0, textAlign: "center" }}>
          <Entra desde={12} style={{ color: "white", fontSize: 62, fontWeight: 800, letterSpacing: -0.5 }}>{L1}</Entra>
          <Entra desde={46} style={{ color: NARANJA, fontSize: 44, fontWeight: 700, marginTop: 14 }}>{L2}</Entra>
        </div>
      </AbsoluteFill>
    );
  }

  if (variante === "b") {
    // Black and white, text in the lower left with an orange bar.
    const barra = interpolate(frame, [8, 30], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
    return (
      <AbsoluteFill style={{ fontFamily: "Inter, sans-serif", background: "#111", opacity: entra }}>
        <Foto w={width} h={height} z={empuje} ox={760} oy={470} filtro="grayscale(1) contrast(1.05) brightness(0.9)" />
        <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(10,12,16,0.9) 0%, rgba(10,12,16,0.5) 30%, rgba(10,12,16,0) 55%)" }} />
        <div style={{ position: "absolute", left: 110, bottom: 110, display: "flex", gap: 28 }}>
          <div style={{ width: 6, borderRadius: 3, background: NARANJA, transform: `scaleY(${barra})`, transformOrigin: "top" }} />
          <div>
            <Entra desde={14} style={{ color: "white", fontSize: 84, fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.05 }}>{L1}</Entra>
            <Entra desde={48} style={{ color: "rgba(255,255,255,0.9)", fontSize: 56, fontWeight: 500, marginTop: 16, letterSpacing: -0.5 }}>
              Que el crédito <span style={{ color: NARANJA, fontWeight: 700 }}>no la frene</span>.
            </Entra>
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  if (variante === "c") {
    // Editorial: the photo framed on the current wavy background, with the
    // text beside it (16:9) or below it (9:16).
    const vertical = height > width;
    const fw = vertical ? width - 120 : width * 0.56;
    const fh = vertical ? fw * 0.66 : fw * 0.62;
    const fx = vertical ? 60 : 100;
    const fy = vertical ? 300 : (height - fh) / 2;
    return (
      <AbsoluteFill style={{ fontFamily: "Inter, sans-serif", opacity: entra }}>
        <FondoAbstracto paleta="gris" estilo="ondas" />
        <div style={{ position: "absolute", left: fx, top: fy, width: fw, height: fh, borderRadius: 22, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.55)", border: "2px solid rgba(255,255,255,0.15)" }}>
          {conVideo ? (
            <OffthreadVideo src={staticFile(video)} muted playbackRate={velocidad} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <Foto w={fw} h={fh} z={empuje * 1.05} ox={820} oy={460} />
          )}
        </div>
        <div style={vertical ? { position: "absolute", left: 80, right: 80, top: fy + fh + 60 } : { position: "absolute", left: fx + fw + 80, right: 100, top: height / 2 - 150 }}>
          <Entra desde={14} style={{ color: "white", fontSize: vertical ? 76 * textoV : 66, fontWeight: 800, lineHeight: 1.08, letterSpacing: -1 }}>{titulo ?? L1}</Entra>
          <Entra desde={desdeBajada - 14} style={{ width: 80, height: 6, borderRadius: 3, background: NARANJA, margin: "30px 0" }}>{null}</Entra>
          <Entra desde={desdeBajada} style={{ color: "rgba(255,255,255,0.9)", fontSize: vertical ? 50 * textoV : 44, fontWeight: 500, lineHeight: 1.25 }}>
            {bajada ?? (
              <>
                Que el crédito <span style={{ color: NARANJA, fontWeight: 700 }}>no la frene</span>.
              </>
            )}
          </Entra>
        </div>
      </AbsoluteFill>
    );
  }

  if (variante === "d") {
    // Cinema: letterbox bars, the lines appear as subtitles one after the other.
    const barra = height * 0.13;
    const sub1 = interpolate(frame, [12, 20, 44, 50], [0, 1, 1, 0], clamp);
    const sub2 = interpolate(frame, [52, 60], [0, 1], clamp);
    return (
      <AbsoluteFill style={{ fontFamily: "Inter, sans-serif", background: "#000", opacity: entra }}>
        <div style={{ position: "absolute", left: 0, top: barra, width, height: height - 2 * barra, overflow: "hidden" }}>
          <Foto w={width} h={height - 2 * barra} z={empuje} ox={840} oy={450} filtro="saturate(0.75) contrast(1.05)" />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: barra, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", color: "white", fontSize: 44, fontWeight: 500, opacity: sub1 }}>{L1}</div>
          <div style={{ position: "absolute", color: "white", fontSize: 44, fontWeight: 500, opacity: sub2 }}>
            Que el crédito <span style={{ color: NARANJA, fontWeight: 700 }}>no la frene</span>.
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  // e: starts close on the wallet and the paper, pulls back to the whole scene.
  const k = interpolate(frame, [0, 70], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const z = interpolate(k, [0, 1], [2.3, 1.02]);
  const ox = interpolate(k, [0, 1], [640, FOTO_W / 2]);
  const oy = interpolate(k, [0, 1], [650, FOTO_H / 2]);
  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif", background: "#111", opacity: entra }}>
      <Foto w={width} h={height} z={z} ox={ox} oy={oy} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,14,22,0.8) 0%, rgba(10,14,22,0) 40%)", opacity: k }} />
      <div style={{ position: "absolute", top: 70, left: 0, right: 0, textAlign: "center" }}>
        <Entra desde={10} style={{ color: "white", fontSize: 58, fontWeight: 800, letterSpacing: -0.5, textShadow: "0 4px 20px rgba(0,0,0,0.6)" }}>{L1}</Entra>
        <Entra desde={64} style={{ color: NARANJA, fontSize: 42, fontWeight: 700, marginTop: 14, textShadow: "0 4px 20px rgba(0,0,0,0.6)" }}>{L2}</Entra>
      </div>
    </AbsoluteFill>
  );
};

// Editorial look with the props of the other pieces (used by the integral video).
export const GanchoEditorial: React.FC<{ fondo: "ondas"; paleta: "gris" }> = () => (
  <GanchoFoto
    variante="c"
    conVideo
    textoV={0.84}
    titulo="¿Y si todo el ciclo del crédito estuviera en un solo lugar?"
    bajada={
      <>
        Originación, gestión y cobranza, <span style={{ color: NARANJA, fontWeight: 700 }}>en una plataforma</span>.
      </>
    }
  />
);
