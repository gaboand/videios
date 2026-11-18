import { armarCarrusel, NARANJA_CARRUSEL } from "./Carrusel";
import { PantallaCore } from "./CoreLending";

// Core Lending carousel (9 slides), built with the carousel recipe.
// npx remotion still CarruselCoreLending out/carrusel-corelending/placa-1.png --props='{"placa":1}'
const P = PantallaCore;
const { Componente, total } = armarCarrusel({
  portada: {
    foto: "carrusel/portada-corelending.jpg",
    posicion: "30% 50%",
    etiqueta: "CORE LENDING",
    linea1: "¿Tu cartera crece más rápido que tu operación?",
    tamano: 0.82,
    bajada: (
      <>
        Todo el ciclo del préstamo, <span style={{ color: NARANJA_CARRUSEL, fontWeight: 700 }}>en un solo core</span>.
      </>
    ),
  },
  placas: [
    { Pantalla: P, frame: 60, disp: "notebook", etiqueta: "REGLAS DE NEGOCIO", titulo: "Las reglas de tu negocio, configuradas por vos", puntos: ["Non accrual y write off", "Punitorios y fees a medida", "Bonificaciones y pronto pago"] },
    { Pantalla: P, frame: 150, disp: "celular", etiqueta: "ALTAS", titulo: "Cada préstamo, a tu medida", puntos: ["Simulador de préstamos", "Amortizaciones y vencimientos", "Altas automáticas desde el Onboarding"] },
    { Pantalla: P, frame: 230, disp: "tablet", etiqueta: "COBRANZAS", titulo: "Todos los canales de pago, con recibo automático", puntos: ["Batch, online y débito automático", "Cajas propias y receptorías", "Cancelaciones y condonaciones"] },
    { Pantalla: P, frame: 520, disp: "notebook", etiqueta: "CURING DE CARTERA", titulo: "Refinanciá, consolidá o reestructurá en 3 clicks", puntos: ["Baja y alta automática", "Ajuste de cuotas", "Contrato generado y enviado"] },
    { Pantalla: P, frame: 850, disp: "tablet", etiqueta: "CONTABILIDAD", titulo: "Contabilidad integrada, sin cargas manuales", puntos: ["Inventarios contables", "Cálculos impositivos", "Integración con tu sistema contable"] },
    { Pantalla: P, frame: 980, disp: "celular", etiqueta: "DASHBOARD Y REPORTES", titulo: "Toda la cartera, bajo control", puntos: ["Multicartera y venta de cartera", "Vintage, FPD y rentabilidad", "Tesorería y comisiones"] },
    { Pantalla: P, frame: 1150, disp: "notebook", etiqueta: "INFORMACIÓN AUTOMÁTICA", titulo: "Reportes que se generan y se envían solos", puntos: ["Avisos de vencimiento", "Central de Deudores", "CRM con bitácora documental"] },
  ],
  cierre: {
    etiqueta: "CORE LENDING",
    titulo: (
      <>
        Gestioná más cartera, <span style={{ color: NARANJA_CARRUSEL }}>con el mismo equipo</span>.
      </>
    ),
    puntos: ["Procesos automáticos", "Multicartera", "100% apificado"],
  },
});
export const CarruselCoreLending = Componente;
export const CARRUSEL_CL_PLACAS = total;
