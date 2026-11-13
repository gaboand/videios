import "./index.css";
import { Composition } from "remotion";
import { DURACION_FIRMA_CONTRATO, FirmaContrato } from "./FirmaContrato";
import { DashboardAxonia, dashboardSchema } from "./DashboardAxonia";
import { CoreHome, coreHomeSchema } from "./CoreHome";
import { LogoAxonia, logoSchema } from "./LogoAxonia";
import { MarcaAxonia, marcaSchema } from "./MarcaAxonia";
import {
  SegmentacionCobranzas,
  segmentacionSchema,
} from "./SegmentacionCobranzas";
import { MatrizRiesgo, matrizSchema } from "./MatrizRiesgo";
import { PlanPagos, planPagosSchema } from "./PlanPagos";
import { WorkflowAxonia, workflowSchema } from "./WorkflowAxonia";
import { ModulosAxonia, modulosSchema } from "./ModulosAxonia";
import { Transicion, transicionSchema } from "./Transicion";
import { SegmentacionApp, segmentacionAppSchema } from "./SegmentacionApp";
import {
  CONSOLIDACION_FRAMES,
  ConsolidacionDeudas,
  consolidacionSchema,
} from "./ConsolidacionDeudas";
import { SUITE_FRAMES, Suite360, suite360Schema } from "./Suite360";
import {
  ONBOARDING_FRAMES,
  OnboardingApp,
  onboardingSchema,
} from "./OnboardingApp";

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
        schema={logoSchema}
        defaultProps={{ fondo: "ondas", cierre: "contacto" }}
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
      <Composition
        // npx remotion render MatrizRiesgo
        id="MatrizRiesgo"
        component={MatrizRiesgo}
        schema={matrizSchema}
        defaultProps={{ fondo: "ondas", paleta: "gris" }}
        durationInFrames={270}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        // npx remotion render SegmentacionCobranzas
        id="SegmentacionCobranzas"
        component={SegmentacionCobranzas}
        schema={segmentacionSchema}
        defaultProps={{ fondo: "ondas", paleta: "gris" }}
        durationInFrames={270}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        // npx remotion render CoreHome
        id="CoreHome"
        component={CoreHome}
        schema={coreHomeSchema}
        defaultProps={{ fondo: "ondas", paleta: "gris" }}
        durationInFrames={210}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        // npx remotion render MarcaAxonia
        id="MarcaAxonia"
        component={MarcaAxonia}
        schema={marcaSchema}
        defaultProps={{
          fondo: "geometrico",
          paleta: "gris",
          entrada: "iris",
          frase: "Todo *conectado* y\nen un *mismo lugar*",
        }}
        durationInFrames={210}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        // npx remotion render PlanPagos
        id="PlanPagos"
        component={PlanPagos}
        schema={planPagosSchema}
        defaultProps={{ fondo: "ondas", paleta: "gris" }}
        durationInFrames={270}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        // npx remotion render PlanPagos169
        id="PlanPagos169"
        component={PlanPagos}
        schema={planPagosSchema}
        defaultProps={{ fondo: "ondas", paleta: "gris" }}
        durationInFrames={270}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        // npx remotion render SegmentacionApp
        id="SegmentacionApp"
        component={SegmentacionApp}
        schema={segmentacionAppSchema}
        defaultProps={{
          fondo: "ondas",
          paleta: "gris",
          dispositivo: "celular" as const,
        }}
        durationInFrames={360}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        // npx remotion render SegmentacionApp169
        id="SegmentacionApp169"
        component={SegmentacionApp}
        schema={segmentacionAppSchema}
        defaultProps={{
          fondo: "ondas",
          paleta: "gris",
          dispositivo: "notebook" as const,
        }}
        durationInFrames={360}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        // npx remotion render ConsolidacionDeudas
        id="ConsolidacionDeudas"
        component={ConsolidacionDeudas}
        schema={consolidacionSchema}
        defaultProps={{
          fondo: "ondas",
          paleta: "gris",
          dispositivo: "celular" as const,
        }}
        durationInFrames={CONSOLIDACION_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        // npx remotion render ConsolidacionDeudas169
        id="ConsolidacionDeudas169"
        component={ConsolidacionDeudas}
        schema={consolidacionSchema}
        defaultProps={{
          fondo: "ondas",
          paleta: "gris",
          dispositivo: "notebook" as const,
        }}
        durationInFrames={CONSOLIDACION_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        // npx remotion render Suite360
        id="Suite360"
        component={Suite360}
        schema={suite360Schema}
        defaultProps={{ fondo: "ondas", paleta: "gris" }}
        durationInFrames={SUITE_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        // npx remotion render Suite360v
        id="Suite360v"
        component={Suite360}
        schema={suite360Schema}
        defaultProps={{ fondo: "ondas", paleta: "gris" }}
        durationInFrames={SUITE_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        // npx remotion render OnboardingApp
        id="OnboardingApp"
        component={OnboardingApp}
        schema={onboardingSchema}
        defaultProps={{ fondo: "ondas", paleta: "gris" }}
        durationInFrames={ONBOARDING_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        // npx remotion render OnboardingApp169
        id="OnboardingApp169"
        component={OnboardingApp}
        schema={onboardingSchema}
        defaultProps={{ fondo: "ondas", paleta: "gris" }}
        durationInFrames={ONBOARDING_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
