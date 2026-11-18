import { MOTOR_FRAMES, MotorDinamico } from "./MotorDecision";
import { armarPublicitario, destacado } from "./Publicitario";

// Decision engine ad (16:9 and 9:16), built with the product ad recipe.
// No real bureau names: "Bureau A", "Central de Deudores".

// Section titles, in frames of the Motor video (its ESC table).
const TITULOS: [number, number, string, string][] = [
  [6, 252, "MOTOR DE DECISIÓN", "Variables y reglas configuradas por tu equipo"],
  [256, 438, "WORKFLOW DE EVALUACIÓN", "El circuito de aprobación, en un editor visual"],
  [442, 608, "MATRIZ DE RIESGO", "Cada cliente en su segmento de riesgo"],
  [612, 788, "RISK PRICING", "Tasa, monto y plazo según el riesgo"],
  [792, 1038, "INFORME DE EVALUACIÓN", "Cada decisión, explicada paso a paso"],
  [1042, 1258, "ANÁLISIS DE EVALUACIONES", "Cada evaluación medida, etapa por etapa"],
  [1262, MOTOR_FRAMES - 4, "DASHBOARD", "Aprobación y performance en tiempo real"],
];

// Side texts beside the device: [from, to] in frames of the Motor video,
// left items, right items.
const LATERALES: [number, number, string[], string[]][] = [
  [40, 246, [], ["Bureaus", "Central de Deudores", "AML", "Bases internas", "Bases negativas"]],
  [258, 436, [], ["Editor visual", "Cambios en tiempo real\n(time to market)", "Evaluación manual de\ncasos observados", "Multi configuraciones", "Multi workflow", "Multi estrategias", "Champion Challenger"]],
  [446, 604, ["Score de bureau y propio", "Georreferencia", "Segmentos de renovadores\nautomáticos"], ["Riesgo por canal: presencial,\nonline y por sucursal", "Riesgo por perfil\n(clusterización)", "Riesgo por producto:\nconsumo, efectivo, moto"]],
  [616, 784, ["Tasa según riesgo", "Relación cuota ingreso", "Elasticidad de la oferta", "Rentabilidad ajustada\nal riesgo"], []],
  [800, 1034, ["Dictamen automático", "Trazabilidad de cada regla"], ["Análisis multiproducto", "Líneas globales,\nindividuales y BNPL"]],
  [1046, 1254, ["Funnel de evaluación", "Dictamen por etapa", "Dictamen por servicio", "Costo por lead evaluado"], []],
  [1266, 1478, ["Tasa de aprobación", "Performance por workflow"], ["Online, en tiempo real\ny desde cualquier lugar", "100% apificado"]],
];

// Voice-over (ElevenLabs, voice Camila), cut on its silences:
// [from, to] in the recording (s), start in the video (s).
const VOZ: [number, number, number][] = [
  [0, 3.72, 0.4],
  [4.21, 10.57, 5.2],
  [10.93, 17.78, 12.4],
  [18.18, 24.76, 20.1],
  [25.06, 30.6, 27.4],
  [30.96, 36.26, 33.7],
  [36.6, 41.66, 39.9],
  [41.96, 45.88, 45.9],
  [46.18, 49.0, 50.8],
  [49.28, 52.11, 54.9],
];
const TROZOS: string[][] = [
  ["¿Tu riesgo se mide solo en mora,", "o también en lo que dejás de ganar?"],
  ["Con el motor de decisión de Axonia combinás bureaus, bases internas", "y controles de AML con tus propias reglas."],
  ["Armás tus circuitos de evaluación en un editor visual,", "y cada cambio sale a producción en el momento,", "administrado por tu equipo."],
  ["Medís el riesgo por canal, por sucursal, por producto", "y por perfil de cliente,", "y los renovadores se segmentan solos."],
  ["La oferta se ajusta a la elasticidad de cada segmento", "para maximizar la rentabilidad ajustada al riesgo."],
  ["Administrás líneas globales e individuales,", "incluso para compras en cuotas con Buy Now Pay Later."],
  ["Con Champion Challenger desafiás todo el tiempo tu estrategia activa", "y te quedás con la que mejor rinde."],
  ["Y seguís cada evaluación online,", "en tiempo real y desde cualquier lugar."],
  ["Decidís mejor, más rápido y con tus reglas."],
  ["Agendá una demo en axonia.com.ar"],
];

const { Componente, frames } = armarPublicitario({
  Video: MotorDinamico,
  frames: MOTOR_FRAMES,
  gancho: {
    video: "videos/escritorio.mp4",
    titulo: "¿Tu riesgo se mide en mora o en rentabilidad?",
    bajada: <>Riesgo y negocio, {destacado("en la misma decisión")}.</>,
  },
  pills: ["Riesgo por canal y producto", "Rentabilidad ajustada al riesgo", "Time to market", "Champion Challenger"],
  titulos: TITULOS,
  laterales: LATERALES,
  locucion: "voz/locucion-motor.mp3",
  voz: VOZ,
  trozos: TROZOS,
});
export const MotorIntegral = Componente;
export const MOTOR_INTEGRAL_FRAMES = frames;
