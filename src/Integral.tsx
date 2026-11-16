import { AbsoluteFill, Audio, Easing, Freeze, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { BackOfficeDinamico } from "./BackOffice";
import { CollectionsDinamico } from "./CollectionsAxonia";
import { ContactFlowDinamico } from "./ContactFlow";
import { CoreLendingDinamico } from "./CoreLending";
import { MotorDinamico } from "./MotorDecision";
import { OnboardingDinamico } from "./OnboardingApp";
import { Suite360 } from "./Suite360";
import { SucursalDinamico } from "./SucursalVirtual";
import { TiendaDinamico } from "./TiendaAxonia";

// Integral video (25 s, 16:9): Javier Perez's journey through the suite, made
// of pieces of the dynamic videos, cut on the bars of the music
// ("Leave the Key", 129 BPM: a bar is 1.86 s, the drop lands at 22.54 s).
// Core products (onboarding, engine, core lending, contact flow) get two bars,
// the rest one; the Suite 360 pull-back closes on the drop.

type Props = { fondo: "ondas"; paleta: "gris" };
const FPS = 30;
const COMPAS = (60 / 129.03) * 4 * FPS; // frames per bar
const FASE = 0.225 * FPS; // first downbeat
const compas = (n: number) => FASE + n * COMPAS;
export const INTEGRAL_FRAMES = 750;
const FUNDIDO = 8;

// [component, source start frame, start bar, end bar]; bar 0 starts the video.
type Pieza = { C: React.ComponentType<Props & Record<string, unknown>>; desde: number; de: number; a: number; extra?: Record<string, unknown> };
const PIEZAS: Pieza[] = [
  // Phone catalog (the product gets picked), then "Agregar al carrito".
  { C: TiendaDinamico, desde: 236, de: 0, a: 0.5 },
  { C: TiendaDinamico, desde: 300, de: 0.5, a: 1 },
  // Data with the brand change, then the identity check ends with the check.
  { C: OnboardingDinamico, desde: 20, de: 1, a: 2 },
  { C: OnboardingDinamico, desde: 545, de: 2, a: 3 },
  // The engine: workflow building, then the risk matrix changes (on the drums).
  { C: MotorDinamico, desde: 300, de: 3, a: 4 },
  { C: MotorDinamico, desde: 462, de: 4, a: 5 },
  // His folder goes to Tesorería with the check.
  { C: BackOfficeDinamico, desde: 215, de: 5, a: 6, extra: { sinSaltos: true } },
  // Payment plan, collection and receipt sent.
  { C: CoreLendingDinamico, desde: 146, de: 6, a: 8 },
  // His home banking with the loan and the insurance banner.
  { C: SucursalDinamico, desde: 40, de: 8, a: 9 },
  // Collections: payment promise.
  { C: CollectionsDinamico, desde: 290, de: 9, a: 10 },
  // Contact Flow: call room, then segmentation.
  { C: ContactFlowDinamico, desde: 30, de: 10, a: 11 },
  { C: ContactFlowDinamico, desde: 570, de: 11, a: 12 },
  // Drop: pull-back to the whole suite.
  { C: Suite360, desde: 572, de: 12, a: 99, extra: { generalAmplio: true } },
];

// Quick zoom on each piece (fast start, soft stop), alternating in and out, around the device centre
// anchored on the 20% line so the device never climbs into the title area.
const ZOOM = 0.12;
const Pedazo: React.FC<{ p: Pieza; props: Props; entra: boolean; dur: number; acerca: boolean | null }> = ({ p, props, entra, dur, acerca }) => {
  const f = useCurrentFrame();
  const o = entra ? interpolate(f, [0, FUNDIDO], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  const k = interpolate(f, [0, dur * 0.7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const z = acerca === null ? 1 : 1 + ZOOM * (acerca ? k : 1 - k);
  return (
    <AbsoluteFill style={{ opacity: o, transform: `scale(${z})`, transformOrigin: "50% 20%" }}>
      <Freeze frame={0}>
        <Sequence from={-(p.desde + f)}>
          <p.C {...props} {...p.extra} />
        </Sequence>
      </Freeze>
    </AbsoluteFill>
  );
};

export const Integral: React.FC<Props> = (props) => {
  return (
    <AbsoluteFill style={{ background: "#111" }}>
      {PIEZAS.map((p, i) => {
        // Each piece starts half a fade before its bar so the cut lands on it.
        const ini = i === 0 ? 0 : Math.round(compas(p.de) - FUNDIDO / 2);
        const fin = p.a >= 99 ? INTEGRAL_FRAMES : Math.round(compas(p.a) + FUNDIDO / 2);
        return (
          <Sequence key={i} from={ini} durationInFrames={fin - ini}>
            <Pedazo p={p} props={props} entra={i > 0} dur={fin - ini} acerca={p.C === Suite360 ? null : i % 2 === 0} />
          </Sequence>
        );
      })}
      <Audio
        src={staticFile("musica/leave-the-key.mp3")}
        volume={(f) => interpolate(f, [INTEGRAL_FRAMES - 30, INTEGRAL_FRAMES], [0.5, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
      />
    </AbsoluteFill>
  );
};
