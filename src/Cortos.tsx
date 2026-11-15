import { AbsoluteFill, Freeze, interpolate, Sequence, useCurrentFrame } from "remotion";
import { BackOfficeDinamico } from "./BackOffice";
import { CollectionsDinamico } from "./CollectionsAxonia";
import { ContactFlowDinamico } from "./ContactFlow";
import { OnboardingDinamico } from "./OnboardingApp";
import { TiendaDinamico } from "./TiendaAxonia";

// Short versions (10 s max) of the dynamic app videos: a few key moments of
// each one, joined with short crossfades. Same component for 16:9 and 9:16
// (the dynamic videos pick tablet or phone from the composition size).

type Props = { fondo: "ondas"; paleta: "gris" };
// [from, to) in frames of the source video, plus optional frames holding the
// last one (to let a final state read).
type Tramo = [number, number] | [number, number, number];
const largo = ([a, b, extra = 0]: Tramo) => b - a + extra;
const FUNDIDO = 10;

export const duracionCorto = (tramos: Tramo[]) => tramos.reduce((s, t) => s + largo(t), 0) - FUNDIDO * (tramos.length - 1);

const Fundido: React.FC<{ entra: boolean; children: React.ReactNode }> = ({ entra, children }) => {
  const frame = useCurrentFrame();
  const o = entra ? interpolate(frame, [0, FUNDIDO], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

const Pedazo: React.FC<{ C: React.ComponentType<Props>; desde: number; hasta: number; props: Props }> = ({ C, desde, hasta, props }) => {
  const frame = useCurrentFrame();
  return (
    <Freeze frame={hasta - 1 - desde} active={frame >= hasta - desde}>
      <Sequence from={-desde}>
        <C {...props} />
      </Sequence>
    </Freeze>
  );
};

const Corto: React.FC<Props & { C: React.ComponentType<Props>; tramos: Tramo[] }> = ({ C, tramos, ...props }) => {
  const inicios = tramos.map((_, i) => tramos.slice(0, i).reduce((s, t) => s + largo(t) - FUNDIDO, 0));
  return (
    <AbsoluteFill style={{ background: "#111" }}>
      {tramos.map((t, i) => (
        <Sequence key={i} from={inicios[i]} durationInFrames={largo(t)}>
          <Fundido entra={i > 0}>
            <Pedazo C={C} desde={t[0]} hasta={t[1]} props={props} />
          </Fundido>
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

// Key moments of each video (source frames).
export const CORTOS: Record<string, { C: React.ComponentType<Props>; tramos: Tramo[] }> = {
  // Call room zoom, flow editor building the strategy, case segmentation drill-down.
  ContactFlowCorto: { C: ContactFlowDinamico, tramos: [[0, 100], [176, 270], [574, 690]] },
  // Flow diagram zoom, folder to Tesorería with the check, dashboard summary.
  BackOfficeCorto: { C: BackOfficeDinamico, tramos: [[0, 100], [170, 300], [456, 540]] },
  // Home with brand change, product, loan payment, confirmation.
  TiendaCorto: { C: TiendaDinamico, tramos: [[0, 100], [296, 356], [420, 488], [530, 600]] },
  // Containers, client with payment promise, segment cube, reports.
  CollectionsCorto: { C: CollectionsDinamico, tramos: [[0, 85], [266, 346], [500, 570], [930, 1000]] },
  // Data with brand change, offers, end of the identity check, signed contract.
  OnboardingCorto: { C: OnboardingDinamico, tramos: [[0, 95], [232, 300], [544, 597, 24], [1240, 1316]] },
};

export const componenteCorto = (id: string): React.FC<Props> => {
  const { C, tramos } = CORTOS[id];
  const Componente: React.FC<Props> = (p) => <Corto C={C} tramos={tramos} {...p} />;
  return Componente;
};
