import { armarCarrusel, NARANJA_CARRUSEL } from "./Carrusel";
import { PantallaContactFlow } from "./ContactFlow";

// Contact Flow carousel (9 slides), built with the carousel recipe.
// npx remotion still CarruselContactFlow out/carrusel-contactflow/placa-1.png --props='{"placa":1}'
const P = PantallaContactFlow;
const { Componente, total } = armarCarrusel({
  portada: {
    foto: "carrusel/portada-pensando.jpg",
    posicion: "80% 50%",
    // Mirrored so the person looks towards the text.
    espejo: true,
    etiqueta: "CONTACT FLOW",
    linea1: "¿La mora sube y las ventas no acompañan?",
    tamano: 0.82,
    bajada: (
      <>
        Lo que antes te llevaba un mes, hoy lo resolvés <span style={{ color: NARANJA_CARRUSEL, fontWeight: 700 }}>en horas</span>.
      </>
    ),
  },
  placas: [
    { Pantalla: P, frame: 120, disp: "tablet", etiqueta: "SALA DE CONTACTO", titulo: "Toda la operación, en tiempo real", puntos: ["Agentes humanos y de IA", "Estado de cada campaña", "Contactabilidad en vivo"] },
    { Pantalla: P, frame: 284, disp: "notebook", etiqueta: "EDITOR DE FLUJOS", titulo: "Tu flujo de gestión, automatizado", puntos: ["Editor visual", "Reglas y reintentos", "Flujos multicanal"] },
    { Pantalla: P, frame: 380, disp: "tablet", etiqueta: "PLANTILLAS", titulo: "El mensaje justo en cada canal", puntos: ["WhatsApp, SMS, email y voz", "Variables personalizadas", "Listas para usar"] },
    { Pantalla: P, frame: 500, disp: "celular", etiqueta: "AGENTES DE IA", titulo: "Más contactos, menos costos", puntos: ["Llamadas y mensajes 24/7", "Promesas de pago automáticas", "Más recupero"] },
    { Pantalla: P, frame: 640, disp: "notebook", etiqueta: "SEGMENTACIÓN DE CASOS", titulo: "Cada cliente, en su estrategia", puntos: ["Clusterización de la cartera", "Resultados y acciones", "KPIs y performance"] },
    { Pantalla: P, frame: 800, disp: "tablet", etiqueta: "FRANJAS HORARIAS", titulo: "Contactá en el mejor momento", puntos: ["Horarios por canal", "Respeto de la normativa", "Mayor contactabilidad"] },
    { Pantalla: P, frame: 950, disp: "notebook", etiqueta: "DASHBOARD", titulo: "La productividad de un mes, en horas", puntos: ["Resultados en tiempo real", "Reportes por campaña", "Costo por contacto"] },
  ],
  cierre: {
    etiqueta: "CONTACT FLOW",
    titulo: (
      <>
        Optimizá tus gestiones. <span style={{ color: NARANJA_CARRUSEL }}>Escalá tu recupero.</span>
      </>
    ),
    puntos: ["Reducí tus costos", "Agentes de IA", "Campañas automáticas"],
  },
});
export const CarruselContactFlow = Componente;
export const CARRUSEL_CF_PLACAS = total;
