import { ONBOARDING_FRAMES, OnboardingDinamico } from "./OnboardingApp";
import { armarPublicitario, destacado } from "./Publicitario";

// Onboarding ad (16:9 and 9:16), built with the product ad recipe.

// Section titles, in frames of the Onboarding video (its ESC table).
const TITULOS: [number, number, string, string][] = [
  [6, 146, "ONBOARDING DIGITAL", "Arranca con solo dos datos"],
  [150, 300, "OFERTAS PERSONALIZADAS", "El recorrido y la oferta, según cada cliente"],
  [304, 404, "VERIFICACIONES TEMPRANAS", "Email y teléfono validados desde el inicio"],
  [408, 602, "VALIDACIÓN DE IDENTIDAD", "Reconocimiento facial con prueba de vida"],
  [606, 756, "INTEGRACIONES", "Confirmaciones por SMS y WhatsApp"],
  [760, 856, "RESUMEN DE LA OFERTA", "Datos adicionales y la oferta elegida"],
  [860, 1056, "FIRMA DIGITAL", "El cliente firma con el dedo desde su celular"],
  [1060, ONBOARDING_FRAMES - 4, "CONTRATO DIGITAL", "Firmado y guardado en su legajo"],
];

// Side texts beside the device: [from, to] in frames of the Onboarding video,
// left items, right items.
const LATERALES: [number, number, string[], string[]][] = [
  [20, 146, [], ["Carga inicial: DNI y género", "Normalización de\nnombre y apellido", "Aceptación de\ntérminos y condiciones"]],
  [176, 298, ["Políticas por producto", "Pasos según el\nperfil del cliente"], ["Ofertas personalizadas\npor cliente"]],
  [310, 402, [], ["Verificación de email", "Verificación telefónica", "Verificaciones tempranas"]],
  [450, 598, ["Validación de identidad", "Reconocimiento facial"], ["Selfie con prueba de vida", "Prevención de fraude"]],
  [640, 752, ["Integración con SMS"], ["Integración con WhatsApp"]],
  [768, 852, ["Captura de datos adicionales"], ["Resumen de la\noferta seleccionada"]],
  [1070, 1320, ["Contrato digital firmado", "Cero papeles"], ["Legajo digital del cliente"]],
];

// Voice-over (ElevenLabs, voice Camila), cut on its silences:
// [from, to] in the recording (s), start in the video (s).
const VOZ: [number, number, number][] = [
  [0, 3.34, 0.4],
  [3.8, 9.44, 4.6],
  [9.84, 15.02, 10.64],
  [15.41, 20.11, 16.22],
  [20.47, 25.88, 21.32],
  [26.2, 28.49, 27.13],
  [28.81, 30.54, 29.74],
  [30.89, 35.06, 32.4],
  [35.47, 41.48, 37.5],
  [41.83, 46.02, 44.6],
  [46.32, 49.16, 50.0],
];
const TROZOS: string[][] = [
  ["¿Cuántos clientes abandonan", "antes de terminar de pedir un préstamo?"],
  ["Con el onboarding de Axonia empiezan con solo dos datos,", "y el resto se completa y se ordena solo."],
  ["Según tus políticas y el perfil de cada cliente,", "el recorrido cambia y las ofertas son a su medida."],
  ["Email y teléfono se verifican desde el primer momento,", "para no perder tiempo con datos falsos."],
  ["La identidad se valida con reconocimiento facial y prueba de vida,", "frenando el fraude antes de que entre."],
  ["Todo se integra con SMS y WhatsApp,"],
  ["los canales que tu cliente ya usa."],
  ["Antes de firmar, completa lo que falta", "y revisa su oferta con total claridad."],
  ["Firma con el dedo desde su propio celular,", "y el contrato digital queda guardado en su legajo,", "sin un solo papel."],
  ["Más clientes que terminan el proceso,", "con menos riesgo y cero carga operativa."],
  ["Agendá una demo en axonia.com.ar"],
];

const { Componente, frames } = armarPublicitario({
  Video: OnboardingDinamico,
  frames: ONBOARDING_FRAMES,
  gancho: {
    video: "videos/firma.mp4",
    velocidad: 0.7,
    titulo: "¿Cuánto esfuerzo te lleva dar de alta cada cliente?",
    bajada: <>Automatizalo {destacado("de punta a punta")}.</>,
  },
  pills: ["100% digital", "Ofertas personalizadas", "Validación de identidad", "Cero papeles"],
  titulos: TITULOS,
  laterales: LATERALES,
  locucion: "voz/locucion-onboarding.mp3",
  voz: VOZ,
  trozos: TROZOS,
});
export const OnboardingIntegral = Componente;
export const OB_INTEGRAL_FRAMES = frames;
