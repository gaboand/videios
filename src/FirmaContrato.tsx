import { evolvePath, getLength, getPointAtLength } from "@remotion/paths";
import { fade } from "@remotion/transitions/fade";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Illustrated version of the contract-signing script, laid out on a
// 1080x1920 (9:16) canvas: a wide shot of both people signing, a close-up
// of the pen, and the final handshake.

const COLORS = {
  wall: "#eef1f4",
  floor: "#d9d4cc",
  skyTop: "#9cc7ee",
  skyBottom: "#dcecf8",
  buildings: ["#7d93ad", "#93a8bf", "#6c829c", "#a7b8cb"],
  frame: "#2b2f36",
  wood: "#d8b98f",
  woodDark: "#b8966a",
  paper: "#ffffff",
  ink: "#1f3a8a",
  leaf: "#3f8f5a",
  leafDark: "#2f7047",
  pot: "#f4f4f4",
};

const PERSONAS = {
  hombre: {
    skin: "#e2b48c",
    shirt: "#2f4a6d",
    pants: "#2a2a2e",
    hair: "#3b2a20",
    long: false,
    beard: true,
  },
  mujer: {
    skin: "#e8bf9a",
    shirt: "#c8674a",
    pants: "#34343a",
    hair: "#5a3726",
    long: true,
    beard: false,
  },
};

type Persona = (typeof PERSONAS)[keyof typeof PERSONAS];

// Standing figure with feet at baseY. `facing` is 1 for right, -1 for left.
// `armAngle` rotates the front arm forward from hanging straight down.
const Figura: React.FC<{
  p: Persona;
  cx: number;
  baseY: number;
  facing: 1 | -1;
  armAngle: number;
  // Seated figures hide their legs (the table covers them).
  sentado?: boolean;
  // Draw only the body or only the front arm, so the arm can go on top of
  // the table while the body stays behind it.
  parte?: "todo" | "cuerpo" | "brazo";
}> = ({ p, cx, baseY, facing, armAngle, sentado = false, parte = "todo" }) => {
  const shoulderY = baseY - 740;
  const headY = baseY - 870;
  const arm = (angle: number, dx: number) => (
    <g
      transform={`translate(${cx + dx} ${shoulderY}) rotate(${-facing * angle})`}
    >
      <rect x={-24} y={-10} width={48} height={330} rx={24} fill={p.shirt} />
      <rect x={-22} y={180} width={44} height={140} rx={22} fill={p.skin} />
      <circle cx={0} cy={322} r={28} fill={p.skin} />
    </g>
  );

  const brazo = arm(armAngle, facing * 80);
  if (parte === "brazo") {
    return brazo;
  }

  return (
    <g>
      {p.long ? (
        <rect
          x={cx - 92}
          y={headY - 60}
          width={184}
          height={250}
          rx={80}
          fill={p.hair}
        />
      ) : null}
      {/* Back arm, legs, torso */}
      {arm(8, -facing * 80)}
      {sentado ? null : (
        <>
          <rect
            x={cx - 78}
            y={baseY - 440}
            width={72}
            height={430}
            rx={30}
            fill={p.pants}
          />
          <rect
            x={cx + 6}
            y={baseY - 440}
            width={72}
            height={430}
            rx={30}
            fill={p.pants}
          />
          <ellipse
            cx={cx - 42 + facing * 14}
            cy={baseY - 8}
            rx={52}
            ry={20}
            fill="#1b1b1f"
          />
          <ellipse
            cx={cx + 42 + facing * 14}
            cy={baseY - 8}
            rx={52}
            ry={20}
            fill="#1b1b1f"
          />
        </>
      )}
      <rect
        x={cx - 112}
        y={baseY - 790}
        width={224}
        height={400}
        rx={70}
        fill={p.shirt}
      />
      <rect x={cx - 26} y={headY + 50} width={52} height={50} fill={p.skin} />
      {/* Head */}
      <circle cx={cx} cy={headY} r={78} fill={p.skin} />
      {p.beard ? (
        <path
          d={`M ${cx - 74} ${headY + 5} Q ${cx - 60} ${headY + 88} ${cx} ${headY + 80} Q ${cx + 60} ${headY + 88} ${cx + 74} ${headY + 5} Q ${cx + 50} ${headY + 55} ${cx} ${headY + 58} Q ${cx - 50} ${headY + 55} ${cx - 74} ${headY + 5}`}
          fill={p.hair}
          opacity={0.35}
        />
      ) : null}
      <path
        d={
          p.long
            ? `M ${cx - 84} ${headY + 10} Q ${cx - 90} ${headY - 95} ${cx} ${headY - 88} Q ${cx + 90} ${headY - 95} ${cx + 84} ${headY + 10} Q ${cx + facing * 10} ${headY - 70} ${cx - 84} ${headY + 10}`
            : `M ${cx - 80} ${headY - 5} Q ${cx - 85} ${headY - 100} ${cx} ${headY - 92} Q ${cx + 85} ${headY - 100} ${cx + 80} ${headY - 5} Q ${cx + facing * 20} ${headY - 55} ${cx - 80} ${headY - 5}`
        }
        fill={p.hair}
      />
      <circle cx={cx + facing * 22 - 18} cy={headY - 5} r={7} fill="#222" />
      <circle cx={cx + facing * 22 + 18} cy={headY - 5} r={7} fill="#222" />
      <path
        d={`M ${cx + facing * 20 - 22} ${headY + 32} Q ${cx + facing * 20} ${headY + 50} ${cx + facing * 20 + 22} ${headY + 32}`}
        stroke="#8a3b2e"
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
      />
      {parte === "todo" ? brazo : null}
    </g>
  );
};

const Oficina: React.FC = () => {
  const frame = useCurrentFrame();
  // Slow cloud drift keeps the background alive.
  const drift = (frame * 0.4) % 1400;
  const buildings = [
    [120, 520, 90],
    [215, 420, 70],
    [290, 560, 110],
    [405, 380, 80],
    [490, 480, 120],
    [615, 330, 90],
    [710, 450, 100],
    [815, 540, 80],
    [900, 400, 100],
  ];
  return (
    <g>
      <defs>
        <linearGradient id="cielo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={COLORS.skyTop} />
          <stop offset="1" stopColor={COLORS.skyBottom} />
        </linearGradient>
      </defs>
      <rect width={1080} height={1920} fill={COLORS.wall} />
      <rect y={1500} width={1080} height={420} fill={COLORS.floor} />
      <rect x={80} y={180} width={920} height={780} fill="url(#cielo)" />
      <g opacity={0.8} fill="white">
        <ellipse cx={200 + drift} cy={290} rx={90} ry={26} />
        <ellipse cx={-500 + drift} cy={350} rx={120} ry={30} />
        <ellipse cx={-1000 + drift} cy={260} rx={70} ry={20} />
      </g>
      {buildings.map(([x, top, w], i) => (
        <g key={i}>
          <rect
            x={x}
            y={top}
            width={w}
            height={960 - top}
            fill={COLORS.buildings[i % 4]}
          />
          {Array.from({ length: Math.floor((940 - top) / 60) }).map((_, j) => (
            <rect
              key={j}
              x={x + 14}
              y={top + 20 + j * 60}
              width={w - 28}
              height={14}
              fill="white"
              opacity={0.25}
            />
          ))}
        </g>
      ))}
      <rect
        x={80}
        y={840}
        width={920}
        height={120}
        fill="#8fb98f"
        opacity={0.6}
      />
      <rect
        x={70}
        y={170}
        width={940}
        height={800}
        fill="none"
        stroke={COLORS.frame}
        strokeWidth={20}
      />
      <rect x={530} y={170} width={20} height={800} fill={COLORS.frame} />
      {/* Plant */}
      <rect
        x={880}
        y={1330}
        width={140}
        height={170}
        rx={16}
        fill={COLORS.pot}
      />
      {[-40, -15, 10, 35].map((a, i) => (
        <ellipse
          key={i}
          cx={950}
          cy={1210}
          rx={34}
          ry={140}
          fill={i % 2 ? COLORS.leaf : COLORS.leafDark}
          transform={`rotate(${a + Math.sin(frame / 25 + i) * 2} 950 1330)`}
        />
      ))}
    </g>
  );
};

const Mesa: React.FC = () => (
  <g>
    <path
      d="M 150 1230 L 930 1230 L 1010 1330 L 70 1330 Z"
      fill={COLORS.wood}
    />
    <rect x={70} y={1330} width={940} height={64} fill={COLORS.woodDark} />
    <rect x={120} y={1394} width={30} height={306} fill={COLORS.woodDark} />
    <rect x={930} y={1394} width={30} height={306} fill={COLORS.woodDark} />
  </g>
);

const EscenaFirma: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const zoom = interpolate(frame, [0, durationInFrames], [1, 1.14], {
    easing: Easing.inOut(Easing.sin),
  });
  // Each person scribbles in turn: the man first, then the woman.
  const escribe = (from: number, to: number) =>
    frame > from && frame < to ? Math.sin(frame * 1.3) * 3 : 0;
  const hombre = {
    p: PERSONAS.hombre,
    cx: 200,
    baseY: 1780,
    facing: 1 as const,
    armAngle: 40 + escribe(15, 55),
    sentado: true,
  };
  const mujer = {
    p: PERSONAS.mujer,
    cx: 880,
    baseY: 1780,
    facing: -1 as const,
    armAngle: 40 + escribe(50, 95),
    sentado: true,
  };

  return (
    <AbsoluteFill>
      <svg viewBox="0 0 1080 1920">
        <g
          transform={`translate(540 1150) scale(${zoom}) translate(-540 -1150)`}
        >
          <Oficina />
          {/* Chair backs */}
          <rect
            x={60}
            y={1010}
            width={280}
            height={380}
            rx={40}
            fill="#3a3d44"
          />
          <rect
            x={740}
            y={1010}
            width={280}
            height={380}
            rx={40}
            fill="#3a3d44"
          />
          <Figura {...hombre} parte="cuerpo" />
          <Figura {...mujer} parte="cuerpo" />
          <Mesa />
          {/* Each contract sits under its signer's hand */}
          <path
            d="M 390 1250 L 500 1250 L 510 1300 L 385 1300 Z"
            fill={COLORS.paper}
          />
          <path
            d="M 580 1250 L 690 1250 L 695 1300 L 570 1300 Z"
            fill={COLORS.paper}
          />
          <Figura {...hombre} parte="brazo" />
          <Figura {...mujer} parte="brazo" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

const FIRMA =
  "M 250 1330 C 300 1230, 330 1230, 320 1330 C 312 1400, 360 1300, 400 1290 C 440 1280, 420 1350, 460 1340 C 500 1330, 520 1270, 560 1300 C 590 1320, 600 1350, 640 1310 C 670 1280, 700 1300, 720 1320 C 750 1345, 800 1290, 840 1300";

const EscenaPrimerPlano: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = interpolate(frame, [12, durationInFrames - 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const { strokeDasharray, strokeDashoffset } = evolvePath(progress, FIRMA);
  const tip = getPointAtLength(FIRMA, progress * getLength(FIRMA)) ?? {
    x: 250,
    y: 1330,
  };
  const zoom = interpolate(frame, [0, durationInFrames], [1, 1.08]);

  return (
    <AbsoluteFill>
      <svg viewBox="0 0 1080 1920">
        <g
          transform={`translate(540 1200) scale(${zoom}) translate(-540 -1200)`}
        >
          <rect width={1080} height={1920} fill={COLORS.wood} />
          {Array.from({ length: 14 }).map((_, i) => (
            <path
              key={i}
              d={`M 0 ${i * 150 + 40} Q 540 ${i * 150 + 90} 1080 ${i * 150 + 30}`}
              stroke={COLORS.woodDark}
              strokeWidth={4}
              fill="none"
              opacity={0.35}
            />
          ))}
          <g transform="rotate(-4 540 960)">
            <rect
              x={150}
              y={330}
              width={780}
              height={1200}
              fill={COLORS.paper}
            />
            <rect
              x={380}
              y={420}
              width={320}
              height={34}
              rx={6}
              fill="#30343b"
            />
            {Array.from({ length: 11 }).map((_, i) => (
              <rect
                key={i}
                x={220}
                y={520 + i * 58}
                width={i % 4 === 3 ? 420 : 640}
                height={16}
                rx={8}
                fill="#c9ced6"
              />
            ))}
            <line
              x1={230}
              y1={1360}
              x2={870}
              y2={1360}
              stroke="#30343b"
              strokeWidth={4}
            />
            <path
              d={FIRMA}
              stroke={COLORS.ink}
              strokeWidth={9}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
            />
            {/* Pen, tip on the current end of the signature */}
            <g transform={`translate(${tip.x} ${tip.y}) rotate(35)`}>
              <path d="M 0 0 L -14 -40 L 14 -40 Z" fill="#c9a24a" />
              <rect
                x={-20}
                y={-560}
                width={40}
                height={522}
                rx={18}
                fill="#1d1f24"
              />
              <rect x={-20} y={-300} width={40} height={20} fill="#c9a24a" />
            </g>
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

const EscenaApreton: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const alcanzar = interpolate(frame, [10, 40], [8, 35], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  // Both hands shake together once they meet.
  const sacudida =
    frame > 42 && frame < 90 ? Math.sin((frame - 42) * 0.45) * 4 : 0;
  const zoom = interpolate(frame, [0, durationInFrames], [1, 1.35], {
    easing: Easing.inOut(Easing.sin),
  });
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 1080 1920">
        <g
          transform={`translate(540 1250) scale(${zoom}) translate(-540 -1250)`}
        >
          <Oficina />
          <Figura
            p={PERSONAS.hombre}
            cx={272}
            baseY={1760}
            facing={1}
            armAngle={alcanzar + sacudida}
          />
          <Figura
            p={PERSONAS.mujer}
            cx={808}
            baseY={1760}
            facing={-1}
            armAngle={alcanzar + sacudida}
          />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

const TRANSICION = 15;
export const ESCENAS = { firma: 110, primerPlano: 110, apreton: 130 };
export const DURACION_FIRMA_CONTRATO =
  ESCENAS.firma + ESCENAS.primerPlano + ESCENAS.apreton - 2 * TRANSICION;

export const FirmaContrato: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.wall }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={ESCENAS.firma}>
          <EscenaFirma />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSICION })}
        />
        <TransitionSeries.Sequence durationInFrames={ESCENAS.primerPlano}>
          <EscenaPrimerPlano />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSICION })}
        />
        <TransitionSeries.Sequence durationInFrames={ESCENAS.apreton}>
          <EscenaApreton />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
