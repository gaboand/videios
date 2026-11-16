import { AbsoluteFill, Audio, Freeze, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
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
type Pieza = { C: React.ComponentType<Props>; desde: number; de: number; a: number };
const PIEZAS: Pieza[] = [
  // Pays the phone with a loan, purchase confirmed.
  { C: TiendaDinamico, desde: 478, de: 0, a: 1 },
  // Data with the brand change, then the identity check ends with the check.
  { C: OnboardingDinamico, desde: 20, de: 1, a: 2 },
  { C: OnboardingDinamico, desde: 545, de: 2, a: 3 },
  // The engine: workflow building, then the risk matrix changes (on the drums).
  { C: MotorDinamico, desde: 300, de: 3, a: 4 },
  { C: MotorDinamico, desde: 462, de: 4, a: 5 },
  // His folder goes to Tesorería with the check.
  { C: BackOfficeDinamico, desde: 215, de: 5, a: 6 },
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
  { C: Suite360, desde: 572, de: 12, a: 99 },
];

const Pedazo: React.FC<{ p: Pieza; props: Props; entra: boolean }> = ({ p, props, entra }) => {
  const f = useCurrentFrame();
  const o = entra ? interpolate(f, [0, FUNDIDO], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Freeze frame={0}>
        <Sequence from={-(p.desde + f)}>
          <p.C {...props} />
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
            <Pedazo p={p} props={props} entra={i > 0} />
          </Sequence>
        );
      })}
      <Audio
        src={staticFile("musica/leave-the-key.mp3")}
        volume={(f) => interpolate(f, [INTEGRAL_FRAMES - 30, INTEGRAL_FRAMES], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
      />
    </AbsoluteFill>
  );
};
