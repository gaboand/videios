import { PantallaCollections } from "./CollectionsAxonia";
import { PantallaContactFlow } from "./ContactFlow";
import { PantallaCore } from "./CoreLending";
import { armarCarrusel, NARANJA_CARRUSEL } from "./Carrusel";
import { PantallaMotor } from "./MotorDecision";
import { PantallaOnboarding } from "./OnboardingApp";
import { PantallaSucursal } from "./SucursalVirtual";
import { PantallaTienda } from "./TiendaAxonia";

// Suite carousel (9 slides), built with the carousel recipe.
// npx remotion still CarruselSuite out/carrusel-suite/placa-1.png --props='{"placa":1}'
const { Componente, total } = armarCarrusel({
  portada: { foto: "carrusel/portada-matriz.jpg", posicion: "60% 50%", linea1: "Todo el ciclo del crédito.", linea2: "En una sola plataforma." },
  placas: [
    { Pantalla: PantallaOnboarding, frame: 560, disp: "celular", etiqueta: "ONBOARDING DIGITAL", titulo: "Clientes nuevos en minutos", puntos: ["Validación de identidad con prueba de vida", "Ofertas personalizadas", "Firma desde el celular"] },
    { Pantalla: PantallaMotor, frame: 420, disp: "notebook", etiqueta: "MOTOR DE DECISIÓN", titulo: "Riesgo y negocio, en la misma decisión", puntos: ["Riesgo por canal, producto y perfil", "Rentabilidad ajustada al riesgo", "Champion Challenger"] },
    { Pantalla: PantallaCore, frame: 260, disp: "tablet", etiqueta: "CORE LENDING", titulo: "Todo el ciclo del préstamo, en un solo core", puntos: ["Multicartera", "Curing de cartera en 3 clicks", "Contabilidad integrada"] },
    { Pantalla: PantallaCollections, frame: 560, disp: "notebook", etiqueta: "COBRANZAS", titulo: "Cada cliente, en su estrategia de mora", puntos: ["Segmentación de la cartera", "Promesas de pago", "Todos los ciclos de mora"] },
    { Pantalla: PantallaContactFlow, frame: 120, disp: "tablet", etiqueta: "CONTACT FLOW", titulo: "La productividad de un mes, en horas", puntos: ["Campañas automáticas", "Agentes de IA", "Segmentación de casos"] },
    { Pantalla: PantallaSucursal, frame: 400, disp: "celular", etiqueta: "SUCURSAL VIRTUAL", titulo: "Tu cliente se autogestiona", puntos: ["Préstamos y cuotas al día", "Pagos y nuevos préstamos online", "Reclamos desde la app"] },
    { Pantalla: PantallaTienda, frame: 220, disp: "notebook", etiqueta: "TIENDA ONLINE", titulo: "Financiación en el checkout", puntos: ["Catálogo con cuotas", "Préstamo al momento de pagar", "Aprobación al instante"] },
  ],
  cierre: {
    etiqueta: "SUITE DE CRÉDITOS MODULAR",
    titulo: (
      <>
        Completamos el proceso <span style={{ color: NARANJA_CARRUSEL }}>que te falta</span>.
      </>
    ),
  },
});
export const CarruselSuite = Componente;
export const CARRUSEL_SUITE_PLACAS = total;
