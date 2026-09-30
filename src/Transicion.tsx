import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Both source images are 1122x1402. The scene is laid out in the pixel
// coordinates of image 2 (the wide shot); image 1 (the close-up) is placed
// inside it, scaled and offset so that both faces line up.
const IMG_W = 1122;
const IMG_H = 1402;

// Midpoint between the eyes and the distance between them, measured on each
// image. Their ratio gives how much bigger the face is in the close-up.
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

export const Transicion: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  // 0s-1s: slow push-in on the close-up.
  const pushIn = interpolate(frame, [0, 1 * fps], [0, 0.03], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  // 1s-5.5s: pull the camera back from the close-up to the full wide shot.
  const pullBack = interpolate(frame, [1 * fps, 5.5 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.65, 0, 0.35, 1),
  });
  // 1s-2.6s: crossfade from image 1 to image 2 while the faces are aligned.
  const closeupOpacity = interpolate(frame, [1 * fps, 2.6 * fps], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });
  // The close-up's edge feathering starts off (so frame 0 is the plain
  // close-up) and tightens as the camera pulls back and reveals its borders.
  const maskSize = interpolate(pullBack, [0, 0.2], [200, 80], {
    extrapolateRight: "clamp",
  });
  // A touch of blur at the midpoint of the crossfade hides small mismatches.
  const blur = interpolate(frame, [1 * fps, 1.8 * fps, 2.6 * fps], [0, 3, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Visible rectangle ("camera") in image 2 coordinates: starts on the
  // close-up (tightened by the push-in) and ends on the whole image.
  const shrink = pushIn * CLOSEUP.w;
  const startRect = {
    x: CLOSEUP.x + shrink / 2,
    y: CLOSEUP.y + (shrink * IMG_H) / IMG_W / 2,
    w: CLOSEUP.w - shrink,
  };
  const camX = interpolate(pullBack, [0, 1], [startRect.x, 0]);
  const camY = interpolate(pullBack, [0, 1], [startRect.y, 0]);
  const camW = interpolate(pullBack, [0, 1], [startRect.w, IMG_W]);
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
            maskImage:
              `radial-gradient(ellipse ${maskSize}% ${maskSize}% at 50% 40%, black 55%, transparent 100%)`,
          }}
        />
      </div>
      <Audio src={staticFile("transicion.wav")} />
    </AbsoluteFill>
  );
};
