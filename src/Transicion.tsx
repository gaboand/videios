import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";

export const transicionSchema = z.object({
  // Line the man says, shown on screen from INICIO_HABLA.
  frase: z.string(),
  mostrarSubtitulo: z.boolean(),
  // Optional voice-over file in public/ (e.g. "voz.mp3"), played from
  // INICIO_HABLA. Empty string means the video is silent.
  voz: z.string(),
});

// Second at which the man starts speaking.
export const INICIO_HABLA = 1.5;

// Both source images are 1122x1402. The scene is laid out in the pixel
// coordinates of image 2 (the wide shot); image 1 (the close-up) is placed
// inside it, scaled and offset so that both faces line up.
const IMG_W = 1122;
const IMG_H = 1402;

// Midpoint between the pupils and the distance between them, measured on
// each image. Their ratio gives how much bigger the face is in the close-up.
const EYES_1 = { x: 604.5, y: 433.5, dist: 161 };
const EYES_2 = { x: 608, y: 285, dist: 95 };
const SCALE = EYES_1.dist / EYES_2.dist;

// Rectangle that image 1 occupies in image 2's coordinate space.
const CLOSEUP = {
  x: EYES_2.x - EYES_1.x / SCALE,
  y: EYES_2.y - EYES_1.y / SCALE,
  w: IMG_W / SCALE,
  h: IMG_H / SCALE,
};

const Subtitulo: React.FC<{ frase: string }> = ({ frase }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const palabras = frase.split(" ");
  // Reveal word by word at a natural speaking pace (~3 words per second).
  const framesPorPalabra = fps / 3;

  return (
    <AbsoluteFill
      style={{ justifyContent: "flex-end", alignItems: "center", padding: 70 }}
    >
      <div
        style={{
          fontFamily: "Helvetica, Arial, sans-serif",
          fontSize: 58,
          fontWeight: 700,
          lineHeight: 1.25,
          color: "white",
          textAlign: "center",
          textShadow: "0 3px 18px rgba(0,0,0,0.65)",
          maxWidth: 900,
        }}
      >
        {palabras.map((palabra, i) => {
          const t = frame - i * framesPorPalabra;
          const opacity = interpolate(t, [0, 6], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const y = interpolate(t, [0, 8], [14, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.quad),
          });
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                marginRight: "0.28em",
                opacity,
                transform: `translateY(${y}px)`,
              }}
            >
              {palabra}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Transicion: React.FC<z.infer<typeof transicionSchema>> = ({
  frase,
  mostrarSubtitulo,
  voz,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, durationInFrames } = useVideoConfig();

  // The camera moves for the whole video: it starts moving on frame 0 and
  // only settles on the very last frame, pulling back from the close-up to
  // the full wide shot.
  const pullBack = interpolate(frame, [0, durationInFrames - 1], [0, 1], {
    easing: Easing.bezier(0.5, 0, 0.25, 1),
  });
  // 0.4s-2.2s: crossfade from image 1 to image 2 while the faces are aligned.
  const closeupOpacity = interpolate(frame, [0.4 * fps, 2.2 * fps], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });
  // The close-up's edge feathering starts off (so frame 0 is the plain
  // close-up) and tightens as the camera pulls back and reveals its borders.
  const maskSize = interpolate(frame, [0, 0.4 * fps], [200, 70], {
    extrapolateRight: "clamp",
  });
  // A touch of blur at the midpoint of the crossfade hides small mismatches.
  const blur = interpolate(frame, [0.4 * fps, 1.3 * fps, 2.2 * fps], [0, 3, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Visible rectangle ("camera") in image 2 coordinates: starts on the
  // close-up and ends on the whole image.
  const camX = interpolate(pullBack, [0, 1], [CLOSEUP.x, 0]);
  const camY = interpolate(pullBack, [0, 1], [CLOSEUP.y, 0]);
  const camW = interpolate(pullBack, [0, 1], [CLOSEUP.w, IMG_W]);
  const zoom = width / camW;

  const world: React.CSSProperties = {
    position: "absolute",
    left: 0,
    top: 0,
    width: IMG_W,
    height: IMG_H,
    transformOrigin: "0 0",
    transform: `scale(${zoom}) translate(${-camX}px, ${-camY}px)`,
  };

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <div style={world}>
        <Img
          src={staticFile("imagen2.webp")}
          style={{ position: "absolute", width: IMG_W, height: IMG_H }}
        />
        <Img
          src={staticFile("imagen1.webp")}
          style={{
            position: "absolute",
            left: CLOSEUP.x,
            top: CLOSEUP.y,
            width: CLOSEUP.w,
            height: CLOSEUP.h,
            opacity: closeupOpacity,
            filter: `blur(${blur / zoom}px)`,
            // Feathered edges so the close-up never shows a hard border
            // once the camera starts pulling back.
            maskImage: `radial-gradient(ellipse ${maskSize}% ${maskSize}% at 50% 38%, black 45%, transparent 100%)`,
          }}
        />
      </div>
      <Sequence from={Math.round(INICIO_HABLA * fps)} layout="none">
        {mostrarSubtitulo ? <Subtitulo frase={frase} /> : null}
        {voz ? <Audio src={staticFile(voz)} /> : null}
      </Sequence>
    </AbsoluteFill>
  );
};
