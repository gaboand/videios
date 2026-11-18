import { ONBOARDING_FRAMES, OnboardingDinamico } from "./OnboardingApp";
import { armarPublicitario, destacado } from "./Publicitario";

// Onboarding ad (16:9 and 9:16), built with the product ad recipe.

// Section titles, in frames of the Onboarding video (its ESC table).
const TITULOS: [number, number, string, string][] = [
  [6, 146, "ONBOARDING DIGITAL", "Tu cliente se registra en minutos, desde donde esté"],
  [150, 300, "OFERTAS PERSONALIZADAS", "El motor decide y ofrece en tiempo real"],
  [304, 404, "VALIDACIÓN DE EMAIL", "Código de verificación automático"],
  [408, 602, "IDENTIDAD DIGITAL", "DNI y selfie validados al instante"],
  [606, 756, "VALIDACIÓN DE TELÉFONO", "Confirmación por WhatsApp"],
  [760, 856, "RESUMEN DE LA OPERACIÓN", "Cuotas, tasas y costos claros desde el inicio"],
  [860, 1056, "FIRMA DIGITAL", "Firma con el dedo, con validez legal"],
  [1060, ONBOARDING_FRAMES - 4, "CONTRATO DIGITAL", "Firmado y enviado al instante"],
];

// Side texts beside the device: [from, to] in frames of the Onboarding video,
// left items, right items.
const LATERALES: [number, number, string[], string[]][] = [
  [20, 140, [], ["Prellenado con DNI", "Consulta a bureaus", "Multiproducto"]],
  [176, 296, ["Motor de decisión", "Ofertas según riesgo"], ["Montos y plazos a medida", "Champion Challenger"]],
  [450, 598, ["DNI frente y dorso", "Selfie con prueba de vida"], ["Validación biométrica", "Prevención de fraude"]],
  [1070, 1320, ["Alta automática en el core", "Legajo digital"], ["Cero papeles", "100% apificado"]],
];

// Voice-over: draft script with estimated times until the recording arrives.
// [from, to] in the recording (s), start in the video (s).
const VOZ: [number, number, number][] = [
  [0, 4.4, 0.4],
  [0, 5.8, 5.8],
  [0, 5.6, 12.0],
  [0, 5.2, 18.0],
  [0, 6.4, 23.6],
  [0, 5.4, 30.4],
  [0, 6.2, 36.2],
  [0, 6.4, 42.8],
  [0, 2.8, 50.4],
];
const TROZOS: string[][] = [
  ["¿Cuántos clientes se te caen", "antes de terminar de pedir un préstamo?"],
  ["Con el onboarding de Axonia, se registran en minutos,", "desde el celular y sin pisar una sucursal."],
  ["El motor de decisión evalúa al instante", "y les muestra solo las ofertas que podés aprobar."],
  ["Validamos email, identidad y teléfono", "con biometría y prueba de vida."],
  ["Así reducís el fraude", "sin sumar fricción para tu cliente."],
  ["Antes de firmar, ve con claridad", "cuotas, tasas y costos."],
  ["Firma con el dedo, con validez legal,", "y el contrato le llega al instante."],
  ["Y la operación se da de alta sola en tu core,", "sin papeles ni carga manual."],
  ["Agendá una demo en axonia.com.ar"],
];

const { Componente, frames } = armarPublicitario({
  Video: OnboardingDinamico,
  frames: ONBOARDING_FRAMES,
  gancho: {
    video: "videos/mostrador.mp4",
    titulo: "¿Cuántos clientes perdés en el camino al préstamo?",
    bajada: <>Onboarding 100% digital, {destacado("en minutos")}.</>,
  },
  pills: ["100% digital", "Validación de identidad", "Firma electrónica", "Ofertas a medida"],
  titulos: TITULOS,
  laterales: LATERALES,
  locucion: null,
  voz: VOZ,
  trozos: TROZOS,
});
export const OnboardingIntegral = Componente;
export const OB_INTEGRAL_FRAMES = frames;
