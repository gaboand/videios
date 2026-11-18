import { armarCarrusel, NARANJA_CARRUSEL } from "./Carrusel";
import { PantallaOnboarding } from "./OnboardingApp";

// Onboarding carousel (9 slides), built with the carousel recipe.
// npx remotion still CarruselOnboarding out/carrusel-onboarding/placa-1.png --props='{"placa":1}'
const P = PantallaOnboarding;
const { Componente, total } = armarCarrusel({
  portada: {
    foto: "carrusel/portada-onboarding-facial.jpg",
    posicion: "50% 40%",
    etiqueta: "ONBOARDING DIGITAL",
    linea1: "¿Cuánto esfuerzo te lleva dar de alta cada cliente?",
    tamano: 0.82,
    bajada: (
      <>
        Automatizalo <span style={{ color: NARANJA_CARRUSEL, fontWeight: 700 }}>de punta a punta</span>.
      </>
    ),
  },
  placas: [
    { Pantalla: P, frame: 120, disp: "celular", etiqueta: "CARGA INICIAL", titulo: "Comienza con solo dos datos", puntos: ["DNI y género", "Normalización de nombre y apellido", "Aceptación de términos y condiciones"] },
    { Pantalla: P, frame: 270, disp: "tablet", etiqueta: "ONBOARDING PERSONALIZADO", titulo: "Pasos y ofertas por perfil del cliente", puntos: ["Políticas por producto", "Pasos según el perfil", "Ofertas personalizadas"] },
    { Pantalla: P, frame: 380, disp: "celular", etiqueta: "VERIFICACIONES TEMPRANAS", titulo: "Email y teléfono validados desde el inicio", puntos: ["Verificación de email", "Verificación telefónica", "Datos confiables desde el primer paso"] },
    { Pantalla: P, frame: 560, disp: "tablet", etiqueta: "VALIDACIÓN DE IDENTIDAD", titulo: "Reconocimiento facial con prueba de vida", puntos: ["DNI frente y dorso", "Selfie con prueba de vida", "Prevención de fraude"] },
    { Pantalla: P, frame: 700, disp: "celular", etiqueta: "INTEGRACIONES", titulo: "Confirmaciones por SMS y WhatsApp", puntos: ["Integración con SMS", "Integración con WhatsApp", "Los canales que tu cliente ya usa"] },
    { Pantalla: P, frame: 820, disp: "notebook", etiqueta: "RESUMEN DE LA OFERTA", titulo: "Todo claro antes de firmar", puntos: ["Captura de datos adicionales", "Resumen de la oferta elegida", "Desde cualquier dispositivo"] },
    { Pantalla: P, frame: 945, disp: "celular", etiqueta: "FIRMA Y CONTRATO", titulo: "Firma con el dedo, sin papeles", puntos: ["Firma desde el celular del cliente", "Contrato digital firmado", "Legajo digital del cliente"] },
  ],
  cierre: {
    etiqueta: "ONBOARDING DIGITAL",
    titulo: (
      <>
        Más clientes que terminan el proceso, <span style={{ color: NARANJA_CARRUSEL }}>con menos riesgo</span>.
      </>
    ),
    puntos: ["100% digital", "Prevención de fraude", "Cero papeles"],
  },
});
export const CarruselOnboarding = Componente;
export const CARRUSEL_OB_PLACAS = total;
