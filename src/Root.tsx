import "./index.css";
import { Composition } from "remotion";
import { DURACION_FIRMA_CONTRATO, FirmaContrato } from "./FirmaContrato";
import { DashboardAxonia, dashboardSchema } from "./DashboardAxonia";
import { LogoAxonia } from "./LogoAxonia";
import { WorkflowAxonia, workflowSchema } from "./WorkflowAxonia";
import { ModulosAxonia, modulosSchema } from "./ModulosAxonia";
import { Transicion, transicionSchema } from "./Transicion";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        // npx remotion render Transicion
        id="Transicion"
        component={Transicion}
        schema={transicionSchema}
        durationInFrames={180}
        fps={30}
        width={1080}
        height={1350}
        defaultProps={{
          frase: "¿Estás preocupado por la mora y los costos?",
          mostrarSubtitulo: true,
          voz: "",
        }}
      />
      <Composition
        // npx remotion render FirmaContrato
        id="FirmaContrato"
        component={FirmaContrato}
        durationInFrames={DURACION_FIRMA_CONTRATO}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        // npx remotion render LogoAxonia
        id="LogoAxonia"
        component={LogoAxonia}
        durationInFrames={210}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        // npx remotion render ModulosAxonia
        id="ModulosAxonia"
        component={ModulosAxonia}
        schema={modulosSchema}
        defaultProps={{ fondo: "red", paleta: "azul" }}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        // npx remotion render DashboardAxonia
        id="DashboardAxonia"
        component={DashboardAxonia}
        schema={dashboardSchema}
        defaultProps={{ fondo: "ondas", paleta: "gris" }}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        // npx remotion render WorkflowAxonia
        id="WorkflowAxonia"
        component={WorkflowAxonia}
        schema={workflowSchema}
        defaultProps={{ fondo: "ondas", paleta: "gris" }}
        durationInFrames={180}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
