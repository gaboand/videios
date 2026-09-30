import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// "Suite de Módulos" design with its 8 cards flying into place.
// Layers come from scripts/recortar-modulos.py: fondo.png is the design
// without the cards and card-N.png are the cards, at these positions in the
// original 941x1672 image.
const ORIGINAL = { w: 941, h: 1672 };
const CARDS = [
  { n: 1, x: 75, y: 516, w: 385, h: 269 },
  { n: 2, x: 481, y: 516, w: 384, h: 269 },
  { n: 3, x: 75, y: 802, w: 385, h: 262 },
  { n: 4, x: 481, y: 802, w: 384, h: 262 },
  { n: 5, x: 75, y: 1081, w: 385, h: 260 },
  { n: 6, x: 481, y: 1081, w: 384, h: 260 },
  { n: 7, x: 75, y: 1357, w: 385, h: 263 },
  { n: 8, x: 481, y: 1357, w: 384, h: 263 },
];

// Frames: first card starts, delay between cards, flight duration.
// The last card lands at 6 + 7 * 7 + 30 = frame 85 (2.8s).
const INICIO = 6;
const ESCALON = 7;
const VUELO = 30;

export const ModulosAxonia: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const escala = width / ORIGINAL.w;

  return (
    <AbsoluteFill style={{ backgroundColor: "#f4f9fd" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: (height - ORIGINAL.h * escala) / 2,
          width: ORIGINAL.w,
          height: ORIGINAL.h,
          transformOrigin: "0 0",
          transform: `scale(${escala})`,
        }}
      >
        <Img
          src={staticFile("modulos/fondo.png")}
          style={{
            position: "absolute",
            width: ORIGINAL.w,
            height: ORIGINAL.h,
          }}
        />
        {CARDS.map((c, i) => {
          const t = interpolate(
            frame,
            [INICIO + i * ESCALON, INICIO + i * ESCALON + VUELO],
            [0, 1],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.back(1.3)),
            },
          );
          // Left column enters from the left edge, right column from the right.
          const lado = c.x < ORIGINAL.w / 2 ? -1 : 1;
          const desde = lado === -1 ? -(c.x + c.w + 40) : ORIGINAL.w - c.x + 40;
          const x = interpolate(t, [0, 1], [desde, 0]);
          const giro = interpolate(t, [0, 1], [lado * 8, 0]);
          const opacidad = interpolate(t, [0, 0.3], [0, 1], {
            extrapolateRight: "clamp",
          });
          return (
            <Img
              key={c.n}
              src={staticFile(`modulos/card-${c.n}.png`)}
              style={{
                position: "absolute",
                left: c.x,
                top: c.y,
                width: c.w,
                height: c.h,
                opacity: opacidad,
                transform: `translateX(${x}px) rotate(${giro}deg)`,
                filter: "drop-shadow(0 6px 14px rgba(40,110,170,0.12))",
              }}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
