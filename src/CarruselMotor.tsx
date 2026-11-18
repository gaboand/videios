import { armarCarrusel, NARANJA_CARRUSEL } from "./Carrusel";
import { PantallaMotor } from "./MotorDecision";

// Decision engine carousel (9 slides), built with the carousel recipe.
// npx remotion still CarruselMotor out/carrusel-motor/placa-1.png --props='{"placa":1}'
const P = PantallaMotor;
const { Componente, total } = armarCarrusel({
  portada: {
    foto: "carrusel/portada-matriz.jpg",
    posicion: "60% 50%",
    etiqueta: "MOTOR DE DECISIÓN",
    linea1: "¿Tu riesgo se mide en mora o en rentabilidad?",
    tamano: 0.82,
    bajada: (
      <>
        Riesgo y negocio, <span style={{ color: NARANJA_CARRUSEL, fontWeight: 700 }}>en la misma decisión</span>.
      </>
    ),
  },
  placas: [
    { Pantalla: P, frame: 200, disp: "notebook", etiqueta: "FUENTES DE DATOS", titulo: "Todas tus fuentes, en una sola decisión", puntos: ["Bureaus y Central de Deudores", "AML", "Bases internas y negativas"] },
    { Pantalla: P, frame: 420, disp: "tablet", etiqueta: "WORKFLOW DE EVALUACIÓN", titulo: "Tu circuito de evaluación, en un editor visual", puntos: ["Multi workflow", "Multi estrategias", "Evaluación manual de casos observados"] },
    { Pantalla: P, frame: 540, disp: "celular", etiqueta: "MATRIZ DE RIESGO", titulo: "Riesgo por canal, producto y perfil", puntos: ["Presencial, online y por sucursal", "Consumo, efectivo, moto", "Clusterización de clientes"] },
    { Pantalla: P, frame: 700, disp: "notebook", etiqueta: "RISK PRICING", titulo: "Rentabilidad ajustada al riesgo", puntos: ["Tasa, monto y plazo según riesgo", "Relación cuota ingreso", "Elasticidad de la oferta"] },
    { Pantalla: P, frame: 900, disp: "celular", etiqueta: "INFORME DE EVALUACIÓN", titulo: "Cada decisión, explicada", puntos: ["Dictamen automático", "Trazabilidad de cada regla", "Análisis multiproducto"] },
    { Pantalla: P, frame: 1150, disp: "tablet", etiqueta: "ANÁLISIS DE EVALUACIONES", titulo: "Desafiá tu estrategia todo el tiempo", puntos: ["Champion Challenger", "Dictamen por etapa y servicio", "Costo por lead evaluado"] },
    { Pantalla: P, frame: 1400, disp: "notebook", etiqueta: "DASHBOARD", titulo: "Información online, desde cualquier lugar", puntos: ["Tasa de aprobación", "Performance por workflow", "Cambios en tiempo real"] },
  ],
  cierre: {
    etiqueta: "MOTOR DE DECISIÓN",
    titulo: (
      <>
        Decidí mejor, más rápido <span style={{ color: NARANJA_CARRUSEL }}>y con tus reglas</span>.
      </>
    ),
    puntos: ["Time to market", "Líneas de crédito y BNPL", "100% apificado"],
  },
});
export const CarruselMotor = Componente;
export const CARRUSEL_MOTOR_PLACAS = total;
