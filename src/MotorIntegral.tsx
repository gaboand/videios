import { MOTOR_FRAMES, MotorDinamico } from "./MotorDecision";
import { armarPublicitario, destacado } from "./Publicitario";

// Decision engine ad (16:9 and 9:16), built with the product ad recipe.
// No real bureau names: "Bureau A", "Central de Deudores".

// Section titles, in frames of the Motor video (its ESC table).
const TITULOS: [number, number, string, string][] = [
  [6, 252, "MOTOR DE DECISIÓN", "Variables y reglas configuradas por tu equipo"],
  [256, 438, "WORKFLOW DE EVALUACIÓN", "Diseñá el circuito de aprobación sin programar"],
  [442, 608, "MATRIZ DE RIESGO", "Cada cliente en su segmento de riesgo"],
  [612, 788, "RISK PRICING", "Tasa, monto y plazo según el riesgo"],
  [792, 1038, "INFORME DE EVALUACIÓN", "Cada decisión, explicada paso a paso"],
  [1042, 1258, "ANÁLISIS DE RECHAZOS", "Detectá dónde se caen tus solicitudes"],
  [1262, MOTOR_FRAMES - 4, "DASHBOARD", "Aprobación y performance en tiempo real"],
];

// Side texts beside the device: [from, to] in frames of the Motor video,
// left items, right items.
const LATERALES: [number, number, string[], string[]][] = [
  [40, 246, ["Bureau A", "Central de Deudores"], ["Bases internas", "Bases negativas"]],
  [258, 436, [], ["Editor visual sin código", "Gates manuales", "Varios workflows", "Champion Challenger"]],
  [446, 604, ["Score de bureau y propio", "Ingreso inferido"], ["Segmentos por producto", "Cambios en tiempo real"]],
  [616, 784, ["Tasa según riesgo", "Montos y plazos", "Ofertas por segmento"], []],
  [800, 1034, ["Dictamen automático", "Trazabilidad de cada regla"], ["Ingreso inferido", "Relación cuota ingreso"]],
  [1046, 1254, ["Funnel de evaluación", "Rechazos por etapa"], ["Rechazos por servicio"]],
  [1266, 1478, ["Tasa de aprobación", "Performance por workflow"], ["Distribución por riesgo", "100% apificado"]],
];

// Voice-over: draft script with estimated times until the recording arrives.
// [from, to] in the recording (s), start in the video (s).
const VOZ: [number, number, number][] = [
  [0, 4.0, 0.4],
  [0, 6.2, 5.0],
  [0, 5.8, 11.8],
  [0, 5.4, 18.2],
  [0, 5.4, 24.2],
  [0, 6.0, 30.2],
  [0, 6.4, 36.8],
  [0, 6.0, 43.8],
  [0, 5.0, 50.4],
  [0, 2.8, 56.6],
];
const TROZOS: string[][] = [
  ["¿Tus aprobaciones dependen", "de un analista y una planilla?"],
  ["Con el motor de decisión de Axonia, combinás bureaus,", "bases internas y tus propias reglas en un solo lugar."],
  ["Armás el circuito de evaluación arrastrando bloques,", "sin esperar a sistemas."],
  ["Segmentás a cada cliente por riesgo", "y ajustás la matriz en tiempo real."],
  ["La tasa, el monto y el plazo", "se definen solos según ese riesgo."],
  ["Cada decisión queda explicada,", "con el detalle de cada regla que se aplicó."],
  ["Ves en qué etapa se caen las solicitudes", "y probás estrategias nuevas con Champion Challenger."],
  ["Todo se mide en un dashboard:", "aprobación, montos y performance de cada workflow."],
  ["Decidís mejor y más rápido,", "sin un gran equipo de especialistas."],
  ["Agendá una demo en axonia.com.ar"],
];

const { Componente, frames } = armarPublicitario({
  Video: MotorDinamico,
  frames: MOTOR_FRAMES,
  gancho: {
    video: "videos/escritorio.mp4",
    titulo: "¿Quién decide hoy a quién le prestás?",
    bajada: <>Decisiones de crédito {destacado("en segundos")}, con tus reglas.</>,
  },
  pills: ["Reglas sin programar", "Matriz de riesgo", "Risk pricing", "Champion Challenger"],
  titulos: TITULOS,
  laterales: LATERALES,
  locucion: null,
  voz: VOZ,
  trozos: TROZOS,
});
export const MotorIntegral = Componente;
export const MOTOR_INTEGRAL_FRAMES = frames;
