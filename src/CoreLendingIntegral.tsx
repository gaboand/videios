import { CORELENDING_FRAMES, CoreLendingDinamico } from "./CoreLending";
import { armarPublicitario, destacado } from "./Publicitario";

// Core Lending ad (16:9 and 9:16, 53 s), built with the product ad recipe.

// Section titles, in frames of the Core Lending video (its ESC table).
const TITULOS: [number, number, string, string][] = [
  [6, 96, "CORE DE PRÉSTAMOS", "Las reglas de tu negocio, configuradas por vos"],
  [100, 308, "ALTAS Y COBRANZAS", "Todos los canales de pago, con recibo automático"],
  [312, 632, "CURING DE CARTERA", "Refinanciá, consolidá o reestructurá en 3 clicks"],
  [636, 756, "CONTABILIDAD", "Inventarios contables e integración automática"],
  [760, 896, "ESTADOS FINANCIEROS", "Impuestos y balances, siempre al día"],
  [900, 1056, "DASHBOARD Y REPORTES", "Cartera, tesorería y comisiones de un vistazo"],
  [1060, CORELENDING_FRAMES - 4, "INFORMACIÓN AUTOMÁTICA", "Reportes que se generan y se envían solos"],
];

// Side texts beside the device: [from, to] in frames of the Core Lending video,
// left items, right items.
const LATERALES: [number, number, string[], string[]][] = [
  [8, 96, [], ["Non accrual y write off", "Punitorios y fees a medida", "Bonificación última cuota", "Descuento por pago adelantado"]],
  [110, 200, ["Simulador de préstamos", "Amortizaciones y vencimientos"], ["Altas automáticas\ndesde Onboarding", "Altas manuales"]],
  [205, 300, ["Pago batch y online", "Cajas propias y receptorías", "Débito automático"], ["Pago fecha valor", "Cancelaciones y condonaciones", "Reversas y anulaciones"]],
  [476, 628, ["Baja y alta automática\nde las operaciones", "Contrato generado y enviado"], ["Reestructuraciones", "Ajuste de cuotas"]],
  [768, 890, ["Cálculos impositivos", "Integración contable"], ["Multicartera", "Venta de cartera"]],
  [904, 1052, ["Vintage", "FPD"], ["Rentabilidad", "Análisis de\ncomportamiento"]],
  [1068, 1252, ["Avisos de vencimiento", "Carteras en mora", "Central de Deudores"], ["CRM con bitácora documental", "Comisiones por venta", "100% apificado"]],
];

// Voice-over (ElevenLabs, voice Camila), cut on its silences:
// [from, to] in the recording (s), start in the video (s).
const VOZ: [number, number, number][] = [
  [0, 4.53, 0.4],
  [4.97, 7.42, 5.4],
  [7.75, 11.73, 8.18],
  [12.1, 15.27, 12.6],
  [15.53, 17.63, 16.03],
  [18.08, 19.25, 18.5],
  [19.56, 23.57, 19.98],
  [23.9, 28.33, 24.32],
  [28.77, 33.24, 29.1],
  [33.64, 39.87, 33.95],
  [40.29, 47.7, 40.6],
  [48.09, 50.99, 48.4],
];
const TROZOS: string[][] = [
  ["¿Cuánto tiempo pierde tu equipo administrando préstamos", "con planillas y procesos manuales?"],
  ["Con el core de Axonia, vos definís las reglas:"],
  ["punitorios, bonificaciones y cuándo", "una operación pasa a non accrual."],
  ["Simulás, das de alta y cobrás por cualquier canal,"],
  ["con el recibo enviado automáticamente."],
  ["¿Un cliente con atrasos?"],
  ["Refinanciás, consolidás o reestructurás", "sus préstamos en tres clicks:"],
  ["se dan de baja, se da de alta la nueva operación", "y el contrato sale listo para enviar."],
  ["La contabilidad y los impuestos se calculan solos,", "integrados a tu sistema contable."],
  ["Administrás varias carteras, seguís tesorería y comisiones,", "y medís la rentabilidad y el comportamiento de cada una."],
  ["Los avisos de vencimiento y los informes de mora se generan solos,", "y como está cien por ciento apificado,", "se integra con todo tu ecosistema."],
  ["Agendá una demo en axonia.com.ar"],
];

const { Componente, frames } = armarPublicitario({
  Video: CoreLendingDinamico,
  frames: CORELENDING_FRAMES,
  gancho: {
    video: "videos/cartera.mp4",
    titulo: "¿Tu cartera crece más rápido que tu operación?",
    bajada: <>Todo el ciclo del préstamo, {destacado("en un solo core")}.</>,
  },
  pills: ["Procesos automáticos", "Multicartera", "Contabilidad integrada", "100% apificado"],
  titulos: TITULOS,
  laterales: LATERALES,
  locucion: "voz/locucion-corelending.mp3",
  voz: VOZ,
  trozos: TROZOS,
});
export const CoreLendingIntegral = Componente;
export const CL_INTEGRAL_FRAMES = frames;
