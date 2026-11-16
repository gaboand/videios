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
import { COLLECTIONS_FRAMES, CollectionsAxonia, CollectionsDinamico, collectionsSchema } from "./CollectionsAxonia";
import { WorkflowAxonia, workflowSchema } from "./WorkflowAxonia";
import { ModulosAxonia, modulosSchema } from "./ModulosAxonia";
import { Transicion, transicionSchema } from "./Transicion";
import { SegmentacionApp, segmentacionAppSchema } from "./SegmentacionApp";
import {
  CONSOLIDACION_FRAMES,
  ConsolidacionDeudas,
  consolidacionSchema,
} from "./ConsolidacionDeudas";
import { INTEGRAL_FRAMES, Integral } from "./Integral";
import { CF_INTEGRAL_FRAMES, ContactFlowIntegral } from "./ContactFlowIntegral";
import { GANCHO_FRAMES, GanchoCaos } from "./GanchoCaos";
import { GANCHO_FOTO_FRAMES, GanchoFoto } from "./GanchoFoto";
import { SUITE_CORTO_FRAMES, SUITE_FRAMES, Suite360, Suite360Corto, suite360Schema } from "./Suite360";
import {
  ONBOARDING_FRAMES,
  OnboardingApp,
  OnboardingDinamico,
  onboardingSchema,
} from "./OnboardingApp";
import { OfertasOpciones } from "./OfertasOpciones";
import { CONTACTFLOW_FRAMES, ContactFlow, ContactFlowDinamico, ContactFlowMovil, contactFlowSchema } from "./ContactFlow";
import { BACKOFFICE_FRAMES, BackOffice, BackOfficeDinamico, BackOfficeMovil, backOfficeSchema } from "./BackOffice";
import { Reloj, TIENDA_FRAMES, TiendaAxonia, TiendaDinamico, TiendaMovil, tiendaSchema } from "./TiendaAxonia";

import { CORTOS, componenteCorto, duracionCorto } from "./Cortos";
import { CORELENDING_FRAMES, CoreLendingDinamico, coreLendingSchema } from "./CoreLending";
import { MOTOR_FRAMES, MotorDinamico, motorSchema } from "./MotorDecision";
import { SUCURSAL_FRAMES, SucursalDinamico, sucursalSchema } from "./SucursalVirtual";

// Short versions (10 s max): ContactFlowCorto, BackOfficeCorto, TiendaCorto,
// CollectionsCorto, OnboardingCorto, CoreLendingCorto, MotorCorto, SucursalCorto, each with a ...Movil 9:16 twin.
const CORTOS_COMP = Object.keys(CORTOS).map((id) => ({ id, C: componenteCorto(id), dur: duracionCorto(CORTOS[id].tramos) }));

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
        // npx remotion render Suite360Corto
        id="Suite360Corto"
        component={Suite360Corto}
        schema={suite360Schema}
        defaultProps={{ fondo: "ondas", paleta: "gris" }}
        durationInFrames={SUITE_CORTO_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        // npx remotion render Suite360CortoMovil
        id="Suite360CortoMovil"
        component={Suite360Corto}
        schema={suite360Schema}
        defaultProps={{ fondo: "ondas", paleta: "gris" }}
        durationInFrames={SUITE_CORTO_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        // Photo hook of the integral video, editorial look (9:16)
        id="GanchoFotoCMovil"
        component={GanchoFoto}
        defaultProps={{ variante: "c" as const }}
        durationInFrames={GANCHO_FOTO_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        // Photo hook of the integral video, look "a" (16:9)
        id="GanchoFotoA"
        component={GanchoFoto}
        defaultProps={{ variante: "a" as const }}
        durationInFrames={GANCHO_FOTO_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        // Photo hook of the integral video, look "b" (16:9)
        id="GanchoFotoB"
        component={GanchoFoto}
        defaultProps={{ variante: "b" as const }}
        durationInFrames={GANCHO_FOTO_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        // Photo hook of the integral video, look "c" (16:9)
        id="GanchoFotoC"
        component={GanchoFoto}
        defaultProps={{ variante: "c" as const }}
        durationInFrames={GANCHO_FOTO_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        // Photo hook of the integral video, look "d" (16:9)
        id="GanchoFotoD"
        component={GanchoFoto}
        defaultProps={{ variante: "d" as const }}
        durationInFrames={GANCHO_FOTO_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        // Photo hook of the integral video, look "e" (16:9)
        id="GanchoFotoE"
        component={GanchoFoto}
        defaultProps={{ variante: "e" as const }}
        durationInFrames={GANCHO_FOTO_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        // Hook of the integral video (chaos to order), 16:9
        id="Gancho"
        component={GanchoCaos}
        defaultProps={{ fondo: "ondas" as const, paleta: "gris" as const }}
        durationInFrames={GANCHO_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        // Hook of the integral video (chaos to order), 9:16
        id="GanchoMovil"
        component={GanchoCaos}
        defaultProps={{ fondo: "ondas" as const, paleta: "gris" as const }}
        durationInFrames={GANCHO_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        // Contact Flow ad with hook, voice-over and closing (16:9)
        id="ContactFlowIntegral"
        component={ContactFlowIntegral}
        defaultProps={{ fondo: "ondas" as const, paleta: "gris" as const }}
        durationInFrames={CF_INTEGRAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        // Contact Flow ad with hook, voice-over and closing (9:16)
        id="ContactFlowIntegralMovil"
        component={ContactFlowIntegral}
        defaultProps={{ fondo: "ondas" as const, paleta: "gris" as const }}
        durationInFrames={CF_INTEGRAL_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        // npx remotion render Integral (25 s, Javier's journey with music)
        id="Integral"
        component={Integral}
        defaultProps={{ fondo: "ondas" as const, paleta: "gris" as const }}
        durationInFrames={INTEGRAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        // npx remotion render IntegralMovil (9:16)
        id="IntegralMovil"
        component={Integral}
        defaultProps={{ fondo: "ondas" as const, paleta: "gris" as const }}
        durationInFrames={INTEGRAL_FRAMES}
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
      <Composition
        // npx remotion render OnboardingDinamico
        id="OnboardingDinamico"
        component={OnboardingDinamico}
        schema={onboardingSchema}
        defaultProps={{ fondo: "ondas", paleta: "gris" }}
        durationInFrames={ONBOARDING_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        // npx remotion render OnboardingDinamicoMovil
        id="OnboardingDinamicoMovil"
        component={OnboardingDinamico}
        schema={onboardingSchema}
        defaultProps={{ fondo: "ondas", paleta: "gris" }}
        durationInFrames={ONBOARDING_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        // Still: npx remotion still OfertasOpciones
        id="OfertasOpciones"
        component={OfertasOpciones}
        durationInFrames={1}
        fps={30}
        width={2000}
        height={1500}
      />
      <Composition
        // npx remotion render Collections
        id="Collections"
        component={CollectionsAxonia}
        schema={collectionsSchema}
        defaultProps={{ fondo: "ondas", paleta: "gris" }}
        durationInFrames={COLLECTIONS_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        // npx remotion render CollectionsDinamico
        id="CollectionsDinamico"
        component={CollectionsDinamico}
        schema={collectionsSchema}
        defaultProps={{ fondo: "ondas", paleta: "gris" }}
        durationInFrames={COLLECTIONS_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        // npx remotion render CollectionsDinamicoMovil
        id="CollectionsDinamicoMovil"
        component={CollectionsDinamico}
        schema={collectionsSchema}
        defaultProps={{ fondo: "ondas", paleta: "gris" }}
        durationInFrames={COLLECTIONS_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        // npx remotion render CollectionsMovil
        id="CollectionsMovil"
        component={CollectionsAxonia}
        schema={collectionsSchema}
        defaultProps={{ fondo: "ondas", paleta: "gris" }}
        durationInFrames={COLLECTIONS_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        // npx remotion render TiendaAxonia
        id="TiendaAxonia"
        component={TiendaAxonia}
        schema={tiendaSchema}
        defaultProps={{ fondo: "ondas", paleta: "gris" }}
        durationInFrames={TIENDA_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        // npx remotion render TiendaDinamico
        id="TiendaDinamico"
        component={TiendaDinamico}
        schema={tiendaSchema}
        defaultProps={{ fondo: "ondas", paleta: "gris" }}
        durationInFrames={TIENDA_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        // npx remotion render TiendaDinamicoMovil
        id="TiendaDinamicoMovil"
        component={TiendaDinamico}
        schema={tiendaSchema}
        defaultProps={{ fondo: "ondas", paleta: "gris" }}
        durationInFrames={TIENDA_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        // npx remotion render TiendaMovil
        id="TiendaMovil"
        component={TiendaMovil}
        schema={tiendaSchema}
        defaultProps={{ fondo: "ondas", paleta: "gris" }}
        durationInFrames={TIENDA_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        // Still: close-up of the store smartwatch drawing
        id="RelojTienda"
        component={() => (
          <div style={{ width: 800, height: 560, background: "#f6f7fa" }}>
            <Reloj id="preview" />
          </div>
        )}
        durationInFrames={1}
        fps={30}
        width={800}
        height={560}
      />
      <Composition
        // npx remotion render BackOffice
        id="BackOffice"
        component={BackOffice}
        schema={backOfficeSchema}
        defaultProps={{ fondo: "ondas", paleta: "gris" }}
        durationInFrames={BACKOFFICE_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        // npx remotion render BackOfficeMovil
        id="BackOfficeMovil"
        component={BackOfficeMovil}
        schema={backOfficeSchema}
        defaultProps={{ fondo: "ondas", paleta: "gris" }}
        durationInFrames={BACKOFFICE_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        // npx remotion render BackOfficeDinamico
        id="BackOfficeDinamico"
        component={BackOfficeDinamico}
        schema={backOfficeSchema}
        defaultProps={{ fondo: "ondas", paleta: "gris" }}
        durationInFrames={BACKOFFICE_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        // npx remotion render BackOfficeDinamicoMovil
        id="BackOfficeDinamicoMovil"
        component={BackOfficeDinamico}
        schema={backOfficeSchema}
        defaultProps={{ fondo: "ondas", paleta: "gris" }}
        durationInFrames={BACKOFFICE_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        // npx remotion render ContactFlow
        id="ContactFlow"
        component={ContactFlow}
        schema={contactFlowSchema}
        defaultProps={{ fondo: "ondas", paleta: "gris" }}
        durationInFrames={CONTACTFLOW_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        // npx remotion render ContactFlowMovil
        id="ContactFlowMovil"
        component={ContactFlowMovil}
        schema={contactFlowSchema}
        defaultProps={{ fondo: "ondas", paleta: "gris" }}
        durationInFrames={CONTACTFLOW_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        // npx remotion render ContactFlowDinamico
        id="ContactFlowDinamico"
        component={ContactFlowDinamico}
        schema={contactFlowSchema}
        defaultProps={{ fondo: "ondas", paleta: "gris" }}
        durationInFrames={CONTACTFLOW_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        // npx remotion render ContactFlowDinamicoMovil
        id="ContactFlowDinamicoMovil"
        component={ContactFlowDinamico}
        schema={contactFlowSchema}
        defaultProps={{ fondo: "ondas", paleta: "gris" }}
        durationInFrames={CONTACTFLOW_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        // npx remotion render CoreLendingDinamico
        id="CoreLendingDinamico"
        component={CoreLendingDinamico}
        schema={coreLendingSchema}
        defaultProps={{ fondo: "ondas", paleta: "gris" }}
        durationInFrames={CORELENDING_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        // npx remotion render CoreLendingDinamicoMovil
        id="CoreLendingDinamicoMovil"
        component={CoreLendingDinamico}
        schema={coreLendingSchema}
        defaultProps={{ fondo: "ondas", paleta: "gris" }}
        durationInFrames={CORELENDING_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        // npx remotion render MotorDinamico
        id="MotorDinamico"
        component={MotorDinamico}
        schema={motorSchema}
        defaultProps={{ fondo: "ondas", paleta: "gris" }}
        durationInFrames={MOTOR_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        // npx remotion render MotorDinamicoMovil
        id="MotorDinamicoMovil"
        component={MotorDinamico}
        schema={motorSchema}
        defaultProps={{ fondo: "ondas", paleta: "gris" }}
        durationInFrames={MOTOR_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        // npx remotion render SucursalDinamico
        id="SucursalDinamico"
        component={SucursalDinamico}
        schema={sucursalSchema}
        defaultProps={{ fondo: "ondas", paleta: "gris" }}
        durationInFrames={SUCURSAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        // npx remotion render SucursalDinamicoMovil
        id="SucursalDinamicoMovil"
        component={SucursalDinamico}
        schema={sucursalSchema}
        defaultProps={{ fondo: "ondas", paleta: "gris" }}
        durationInFrames={SUCURSAL_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      {CORTOS_COMP.flatMap(({ id, C, dur }) =>
        [
          [id, 1920, 1080],
          [`${id}Movil`, 1080, 1920],
        ].map(([nombre, w, h]) => (
          <Composition
            key={nombre}
            id={String(nombre)}
            component={C}
            defaultProps={{ fondo: "ondas" as const, paleta: "gris" as const }}
            durationInFrames={dur}
            fps={30}
            width={Number(w)}
            height={Number(h)}
          />
        )),
      )}
    </>
  );
};
