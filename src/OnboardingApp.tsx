import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import "@fontsource/montserrat/500.css";
import "@fontsource/montserrat/700.css";
import "@fontsource/montserrat/800.css";
import { z } from "zod";
import { FondoAbstracto } from "./FondoAbstracto";
import { Dispositivo, exteriorDe, pantallaDe } from "./Dispositivos";
import { DniDorso, DniFrente, Persona } from "./Suite360";

// Digital onboarding on a phone held straight (9:16, 44s): the client enters
// their details, the engine looks for an offer (spinner), picks one of four
// offers, validates the email code, captures ID front, back and a selfie
// (each validated by the service, with a spinner) and ends on the WhatsApp
// confirmation, phone verification, operation summary, finger signature
// (with its confirmation modal), the final confirmation and the signed
// contract.

export const onboardingSchema = z.object({
  fondo: z.enum(["ondas", "red", "aurora", "geometrico"]),
  paleta: z.enum(["azul", "gris"]),
});

export const ONBOARDING_FRAMES = 1330;

const FUENTE = "Montserrat, sans-serif";
const TINTA = "#1f2430";
const TINTA_2 = "#6b7280";
const BORDE = "#dfe3ea";
const AZUL = "#4a8bc2";
const AZUL_OSCURO = "#2c5a8c";
const NAVY = "#14284b";
const VERDE = "#1e8a4c";
const W = 390;
const H = 844;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Timeline (frames).
const ESC = {
  datos: [0, 150],
  buscando: [146, 206],
  ofertas: [202, 304],
  email: [300, 408],
  identidad: [404, 606],
  whatsapp: [602, 760],
  resumen: [756, 860],
  firma: [856, 1060],
  final: [1056, 1150],
  contrato: [1146, ONBOARDING_FRAMES + 10],
} as const;
type Escena = keyof typeof ESC;

const TIPEO_DNI = [16, 38];
const TAP_CONSULTAR = 44;
const IDENTIFICADO = 60;
const TIPEO_TEL = [70, 88];
const TIPEO_MAIL = [92, 112];
const TAP_PRODUCTO = 116;
const TAP_CONSUMO = 128;
const TAP_CONTINUAR = 140;
const TAP_OFERTA = 262;
const TAP_OFERTA_CONT = 288;
const TIPEO_COD = [318, 346];
const TAP_VALIDAR = 356;
const EMAIL_OK = 384;
const CAPTURAS = [430, 492, 554];
const VALIDA = 26; // frames the service takes to answer each capture
const TAP_WA = 654;
const TEL_OK = 712;
const TAP_FIRMA = 836;
const TRAZO = [872, 902];
const TAP_FIRMA_CONT = 916;
const MODAL_FIRMA = 920;
const TAP_CONFIRMAR = 954;
const FIRMA_OK = 984;
const TAP_CONTRATO = 1128;
const SCROLL = [1176, 1250];
const SELLO = 1258;


const tapsDe = [
  TAP_CONSULTAR,
  TAP_PRODUCTO,
  TAP_CONSUMO,
  TAP_CONTINUAR,
  TAP_OFERTA,
  TAP_OFERTA_CONT,
  TAP_VALIDAR,
  ...CAPTURAS,
  TAP_WA,
  TAP_FIRMA,
  TAP_FIRMA_CONT,
  TAP_CONFIRMAR,
  TAP_CONTRATO,
];

// Signature drawn with the finger, traced from the reference: a tall narrow
// loop that runs into a long rising flourish, small letters inside and a
// vertical stroke the flourish crosses. Catmull-Rom through a few points per stroke, in signature-pad
// coordinates (330 x 230).
const TRAZOS: [number, number][][] = [
  [[106.0, 149.5], [120.0, 113.6], [142.0, 70.2], [160.0, 36.7], [168.0, 28.0], [162.0, 37.9], [150.0, 49.1], [124.0, 71.4], [92.0, 103.6], [66.0, 137.1], [46.0, 170.6], [36.0, 195.4], [44.0, 205.3], [80.0, 197.9], [146.0, 175.6], [220.0, 142.1], [294.0, 91.2]],
  [[98.0, 160.7], [116.0, 130.9], [124.0, 161.9], [140.0, 143.3], [158.0, 129.7], [164.0, 158.2], [182.0, 143.3]],
  [[242.0, 37.9], [241.0, 91.2], [242.0, 142.1], [237.0, 157.0], [251.0, 151.4]],
];
const muestrear = (P: [number, number][]) => {
  const out: [number, number][] = [];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)];
    const p1 = P[i];
    const p2 = P[i + 1];
    const p3 = P[Math.min(P.length - 1, i + 2)];
    for (let k = 0; k < 8; k++) {
      const t = k / 8;
      const t2 = t * t;
      const t3 = t2 * t;
      const c = (a: number, b: number, cc: number, d: number) =>
        0.5 * (2 * b + (-a + cc) * t + (2 * a - 5 * b + 4 * cc - d) * t2 + (-a + 3 * b - 3 * cc + d) * t3);
      out.push([c(p0[0], p1[0], p2[0], p3[0]), c(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(P[P.length - 1]);
  return out;
};
// Every sampled point, tagged with its stroke.
const FIRMA: { x: number; y: number; trazo: number }[] = TRAZOS.flatMap((tr, k) =>
  muestrear(tr).map(([x, y]) => ({ x, y, trazo: k })),
);
// SVG path of the signature drawn up to `progreso` (0 to 1).
const firmaD = (progreso: number) => {
  const n = progreso * (FIRMA.length - 1);
  let d = "";
  for (let i = 0; i <= Math.min(Math.floor(n) + 1, FIRMA.length - 1); i++) {
    let { x, y } = FIRMA[i];
    if (i > n) {
      const a = FIRMA[i - 1];
      if (a.trazo !== FIRMA[i].trazo) {
        break;
      }
      const f = n - (i - 1);
      x = a.x + (x - a.x) * f;
      y = a.y + (y - a.y) * f;
    }
    const nuevo = i === 0 || FIRMA[i - 1].trazo !== FIRMA[i].trazo;
    d += `${nuevo ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)} `;
  }
  return d;
};
const PAD = { x: 30, y: 262, w: 330, h: 230 };
const puntoFirma = (frame: number) => {
  const t = interpolate(frame, TRAZO, [0, FIRMA.length - 1], clamp);
  const i = Math.floor(t);
  const a = FIRMA[i];
  const b = FIRMA[Math.min(FIRMA.length - 1, i + 1)];
  const f = t - i;
  return { x: PAD.x + a.x + (b.x - a.x) * f, y: PAD.y + a.y + (b.y - a.y) * f };
};

// Finger path: [arrival frame, x, y] in screen coordinates.
const DEDO: [number, number, number][] = [
  [0, 300, 760],
  [12, 195, 315],
  [TAP_CONSULTAR - 2, 195, 439],
  [TAP_PRODUCTO - 2, 195, 671],
  [TAP_CONSUMO - 2, 195, 739],
  [TAP_CONTINUAR - 2, 195, 744],
  [TAP_OFERTA - 2, 286, 400],
  [TAP_OFERTA_CONT - 2, 103, 704],
  [TAP_VALIDAR - 2, 195, 402],
  [CAPTURAS[0] - 2, 195, 452],
  [CAPTURAS[2] + 30, 195, 452],
  [TAP_WA - 2, 195, 452],
  [TAP_WA + 40, 300, 700],
  [TAP_FIRMA - 2, 195, 604],
  [TRAZO[0], PAD.x + TRAZOS[0][0][0], PAD.y + TRAZOS[0][0][1]],
  [TRAZO[1] + 2, PAD.x + TRAZOS[2][TRAZOS[2].length - 1][0], PAD.y + TRAZOS[2][TRAZOS[2].length - 1][1]],
  [TAP_FIRMA_CONT - 2, 280, 534],
  [TAP_CONFIRMAR - 2, 274, 534],
  [TAP_CONFIRMAR + 40, 320, 760],
  [TAP_CONTRATO - 2, 195, 662],
  [TAP_CONTRATO + 40, 320, 780],
];

const posDedo = (frame: number) => {
  if (frame >= TRAZO[0] && frame <= TRAZO[1]) {
    return puntoFirma(frame);
  }
  let p = { x: DEDO[0][1], y: DEDO[0][2] };
  for (let i = 1; i < DEDO.length; i++) {
    const [f, x, y] = DEDO[i];
    const desde = Math.max(DEDO[i - 1][0], f - 16);
    if (frame >= f) {
      p = { x, y };
      continue;
    }
    if (frame > desde) {
      const t = interpolate(frame, [desde, f], [0, 1], {
        ...clamp,
        easing: Easing.inOut(Easing.cubic),
      });
      p = { x: p.x + (x - p.x) * t, y: p.y + (y - p.y) * t };
    }
    break;
  }
  return p;
};

const tipeo = (frame: number, texto: string, [a, b]: readonly number[]) =>
  texto.slice(0, Math.round(interpolate(frame, [a, b], [0, texto.length], clamp)));

const pulsado = (frame: number, f: number) =>
  interpolate(frame, [f, f + 4, f + 12], [0, 1, 0], clamp);

const pesos = (n: number) => `$ ${n.toLocaleString("es-AR")}`;

// Spinner like the app's: white arc with a blue arc turning inside.
const Spinner: React.FC<{ size: number; frame: number; claro?: boolean }> = ({
  size,
  frame,
  claro,
}) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <g transform={`rotate(${frame * 9} 20 20)`}>
      <path
        d="M20 4 A16 16 0 1 0 36 20"
        fill="none"
        stroke={claro ? "white" : "#c9d3df"}
        strokeWidth={3.2}
        strokeLinecap="round"
      />
    </g>
    <g transform={`rotate(${-frame * 13} 20 20)`}>
      <path
        d="M20 9 A11 11 0 0 1 31 20"
        fill="none"
        stroke="#3f8fd6"
        strokeWidth={3.2}
        strokeLinecap="round"
      />
    </g>
  </svg>
);

const Campo: React.FC<{
  etiqueta: string;
  valor: string;
  y: number;
  x?: number;
  w?: number;
  activo?: boolean;
  cursor?: boolean;
  select?: boolean;
  gris?: boolean;
}> = ({ etiqueta, valor, y, x = 30, w = 330, activo, cursor, select, gris }) => (
  <>
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        fontSize: 9.5,
        fontWeight: 700,
        color: TINTA,
        letterSpacing: 0.5,
      }}
    >
      {etiqueta}
    </div>
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + 16,
        width: w,
        height: 42,
        boxSizing: "border-box",
        border: `1.5px solid ${activo ? "#7aa7d6" : BORDE}`,
        borderRadius: 7,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13,
        fontWeight: 500,
        color: gris ? "#9aa3b2" : TINTA,
        background: "white",
      }}
    >
      {valor}
      {cursor ? (
        <span style={{ width: 1.5, height: 16, background: TINTA, marginLeft: 1 }} />
      ) : null}
      {select ? (
        <span style={{ position: "absolute", right: 12, fontSize: 10, color: TINTA }}>▾</span>
      ) : null}
    </div>
  </>
);

const Boton: React.FC<{
  texto: React.ReactNode;
  x?: number;
  y: number;
  w?: number;
  h?: number;
  color?: string;
  press?: number;
  opacity?: number;
}> = ({ texto, x = 30, y, w = 330, h = 44, color = AZUL, press = 0, opacity = 1 }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      borderRadius: 8,
      background: color,
      color: "white",
      fontSize: 13.5,
      fontWeight: 700,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      transform: `scale(${1 - press * 0.06})`,
      boxShadow: `0 4px 10px rgba(30,60,100,${0.18 + press * 0.2})`,
      opacity,
    }}
  >
    {texto}
  </div>
);

const Titulo: React.FC<{ y: number; children: React.ReactNode; s?: number; c?: string }> = ({
  y,
  children,
  s = 17,
  c = TINTA,
}) => (
  <div
    style={{
      position: "absolute",
      left: 16,
      right: 16,
      top: y,
      textAlign: "center",
      fontSize: s,
      fontWeight: 700,
      color: c,
      lineHeight: 1.3,
    }}
  >
    {children}
  </div>
);

const Pasos: React.FC<{ actual: number }> = ({ actual }) => (
  <div
    style={{
      position: "absolute",
      top: 160,
      left: 0,
      right: 0,
      display: "flex",
      justifyContent: "center",
      gap: 9,
    }}
  >
    {Array.from({ length: 8 }).map((_, i) => (
      <div
        key={i}
        style={{
          width: 20,
          height: 20,
          borderRadius: 5,
          background: i + 1 <= actual ? AZUL : "#8a929e",
          color: "white",
          fontSize: 11,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: i + 1 === actual ? "0 0 0 3px rgba(74,139,194,0.3)" : "none",
        }}
      >
        {i + 1}
      </div>
    ))}
  </div>
);

const Datos: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const ident = spring({ frame: frame - IDENTIFICADO, fps, config: { damping: 16 } });
  const abierto = frame >= TAP_PRODUCTO + 2 && frame < TAP_CONSUMO + 4;
  const producto = frame >= TAP_CONSUMO + 2 ? "CONSUMO" : "ELEGÍ UN PRODUCTO";
  const buscandoBoton = frame >= TAP_CONSULTAR + 2 && frame < IDENTIFICADO;
  const enCampo = (r: readonly number[]) => frame >= r[0] - 4 && frame <= r[1] + 4;
  return (
    <>
      <Pasos actual={1} />
      <Titulo y={194}>Ingresar los datos *</Titulo>
      <div style={{ position: "absolute", top: 222, width: "100%", textAlign: "center", fontSize: 11, color: TINTA }}>
        *Todos los campos son obligatorios.
      </div>
      <div
        style={{
          position: "absolute",
          left: 16,
          top: 256,
          width: 358,
          height: ident > 0.01 ? 270 + ident * 260 : 236,
          border: `1px solid ${BORDE}`,
          borderRadius: 10,
          boxShadow: "0 4px 14px rgba(20,30,50,0.06)",
        }}
      />
      <Campo etiqueta="DNI" valor={tipeo(frame, "2845678", TIPEO_DNI)} y={270} activo={enCampo(TIPEO_DNI)} cursor={enCampo(TIPEO_DNI) && Math.floor(frame / 8) % 2 === 0} gris={ident > 0.5} />
      <Campo etiqueta="GÉNERO" valor="MASCULINO" y={340} select gris={ident > 0.5} />
      {/* Consultar turns into the identified client card */}
      <Boton
        y={418}
        texto={buscandoBoton ? <Spinner size={20} frame={frame} claro /> : "Consultar"}
        press={pulsado(frame, TAP_CONSULTAR)}
        opacity={1 - ident}
      />
      {ident > 0.01 ? (
        <>
          <div
            style={{
              position: "absolute",
              left: 30,
              top: 412,
              width: 330,
              height: 60,
              borderRadius: 8,
              background: "#eaf2fb",
              borderLeft: `4px solid ${NAVY}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              opacity: ident,
              transform: `scale(${0.9 + ident * 0.1})`,
            }}
          >
            <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 1, color: NAVY }}>CLIENTE IDENTIFICADO</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: TINTA, marginTop: 3 }}>JAVIER PEREZ</div>
          </div>
          <div style={{ opacity: ident }}>
            <Campo etiqueta="TELÉFONO" valor={tipeo(frame, "11 5555-0123", TIPEO_TEL)} y={488} activo={enCampo(TIPEO_TEL)} />
            <Campo etiqueta="EMAIL" valor={tipeo(frame, "JPEREZ@MAIL.COM", TIPEO_MAIL)} y={558} activo={enCampo(TIPEO_MAIL)} />
            <Campo etiqueta="PRODUCTO" valor={producto} y={628} select activo={abierto} gris={producto !== "CONSUMO"} />
            <Boton y={712} texto="Continuar" press={pulsado(frame, TAP_CONTINUAR)} opacity={frame >= TAP_CONSUMO + 2 ? 1 : 0.45} />
          </div>
        </>
      ) : null}
      {abierto ? (
        <div
          style={{
            position: "absolute",
            left: 30,
            top: 694,
            width: 330,
            background: "white",
            border: `1px solid #b9c4d2`,
            borderRadius: 6,
            boxShadow: "0 10px 24px rgba(20,30,50,0.2)",
            overflow: "hidden",
            zIndex: 3,
          }}
        >
          {["ELEGÍ UN PRODUCTO", "CONSUMO", "EFECTIVO", "PRENDARIO"].map((o, i) => {
            const sel = i === 1 && frame >= TAP_CONSUMO - 4;
            return (
              <div
                key={o}
                style={{
                  height: 30,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  color: sel ? "white" : i === 0 ? "#8a929e" : TINTA,
                  background: sel ? "#2f6fe0" : "white",
                }}
              >
                {o}
              </div>
            );
          })}
        </div>
      ) : null}
    </>
  );
};

const OFERTAS = [
  { n: 3, cuota: 340420 },
  { n: 6, cuota: 196180 },
  { n: 9, cuota: 148950 },
  { n: 12, cuota: 125310 },
];
const Ofertas: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const elegida = frame >= TAP_OFERTA + 2 ? 1 : -1;
  const monto = Math.round(850000 * interpolate(frame, [ESC.ofertas[0] + 6, ESC.ofertas[0] + 30], [0, 1], clamp));
  return (
    <>
      <Pasos actual={2} />
      <Titulo y={194} s={19}>Monto aprobado: {pesos(850000)}</Titulo>
      <div style={{ position: "absolute", top: 236, left: 16, right: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: AZUL_OSCURO }}>Seleccioná un monto:</span>
        <span style={{ fontSize: 13, border: `1px solid ${BORDE}`, borderRadius: 5, padding: "4px 8px", fontWeight: 700, color: TINTA }}>
          {pesos(monto)}
        </span>
      </div>
      <div style={{ position: "absolute", top: 272, left: 70, width: 250, height: 5, borderRadius: 3, background: "#d6dee8" }}>
        <div style={{ width: `${(monto / 850000) * 100}%`, height: "100%", borderRadius: 3, background: AZUL_OSCURO, position: "relative" }}>
          <div style={{ position: "absolute", right: -7, top: -5, width: 14, height: 14, borderRadius: "50%", background: AZUL_OSCURO }} />
        </div>
      </div>
      {OFERTAS.map((o, i) => {
        const t = spring({ frame: frame - ESC.ofertas[0] - 10 - i * 5, fps, config: { damping: 15 } });
        const sel = i === elegida;
        const p = i === 1 ? pulsado(frame, TAP_OFERTA) : 0;
        return (
          <div
            key={o.n}
            style={{
              position: "absolute",
              left: 16 + (i % 2) * 183,
              top: 300 + Math.floor(i / 2) * 186,
              width: 175,
              height: 172,
              borderRadius: 12,
              border: `2px solid ${sel ? "#5b7fb5" : "#c5d0df"}`,
              background: sel ? "linear-gradient(160deg, #8fb4ea, #4f6f9e)" : "linear-gradient(160deg, #f8fafc, #e9eef5)",
              color: sel ? "white" : TINTA,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              opacity: t,
              transform: `scale(${(0.85 + 0.15 * t) * (1 - p * 0.05) * (sel ? 1.03 : 1)})`,
              boxShadow: sel ? "0 12px 26px rgba(40,70,120,0.35)" : "0 3px 8px rgba(20,30,50,0.06)",
            }}
          >
            <div style={{ fontSize: 12, opacity: 0.9 }}>{o.n} cuotas</div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{pesos(o.cuota)}</div>
            <div style={{ fontSize: 10.5, opacity: 0.85 }}>Monto total {pesos(o.cuota * o.n)}</div>
            <div style={{ fontSize: 9.5, marginTop: 6, lineHeight: 1.6, textAlign: "center", opacity: 0.9 }}>
              ✓ Tasa preferencial
              <br />✓ Sin costos ocultos
              <br />✓ Aprobación inmediata
            </div>
          </div>
        );
      })}
      <Boton x={16} y={682} w={175} h={42} texto="Continuar" press={pulsado(frame, TAP_OFERTA_CONT)} opacity={elegida >= 0 ? 1 : 0.5} />
      <Boton x={199} y={682} w={175} h={42} texto="Finalizar" color="#d62b2b" />
    </>
  );
};

const Email: React.FC<{ frame: number }> = ({ frame }) => {
  const codigo = tipeo(frame, "482913", TIPEO_COD);
  const validando = frame >= TAP_VALIDAR + 2 && frame < EMAIL_OK;
  const ok = frame >= EMAIL_OK;
  return (
    <>
      <Pasos actual={3} />
      <Titulo y={194}>Validá tu email</Titulo>
      <div style={{ position: "absolute", top: 228, left: 30, right: 30, textAlign: "center", fontSize: 12, color: TINTA_2, lineHeight: 1.5 }}>
        Te enviamos un código de 6 dígitos a<br />
        <b style={{ color: TINTA }}>jperez@mail.com</b>
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 38 + i * 54,
            top: 290,
            width: 44,
            height: 54,
            borderRadius: 8,
            border: `1.5px solid ${ok ? VERDE : codigo.length === i ? "#7aa7d6" : BORDE}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            fontWeight: 800,
            color: TINTA,
            background: ok ? "#eef8f1" : "white",
          }}
        >
          {codigo[i] ?? ""}
        </div>
      ))}
      <Boton y={380} texto="Validar código" press={pulsado(frame, TAP_VALIDAR)} opacity={codigo.length === 6 ? 1 : 0.5} />
      {validando || ok ? (
        <div style={{ position: "absolute", top: 452, left: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          {validando ? (
            <>
              <Spinner size={30} frame={frame} />
              <span style={{ fontSize: 13, color: TINTA_2 }}>Validando código…</span>
            </>
          ) : (
            <span style={{ fontSize: 15, fontWeight: 700, color: VERDE }}>✓ Email validado</span>
          )}
        </div>
      ) : null}
      <div style={{ position: "absolute", top: 520, width: "100%", textAlign: "center", fontSize: 11.5, color: AZUL_OSCURO, textDecoration: "underline" }}>
        Reenviar código
      </div>
    </>
  );
};

const ITEMS = [
  { n: "DNI frente", s: "Validando con RENAPER…" },
  { n: "DNI dorso", s: "Leyendo código del documento…" },
  { n: "Selfie", s: "Validando biometría…" },
];
const Identidad: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const idx = CAPTURAS.findIndex((c) => frame < c + VALIDA + 8);
  const actual = idx === -1 ? 3 : idx;
  const flash = Math.max(...CAPTURAS.map((c) => interpolate(frame, [c, c + 2, c + 10], [0, 0.9, 0], clamp)));
  const listo = spring({ frame: frame - (CAPTURAS[2] + VALIDA + 6), fps, config: { damping: 16 } });
  const guia = [
    "Ubicá el frente del DNI dentro del marco",
    "Ahora el dorso del DNI",
    "Mirá a la cámara para la selfie",
  ][Math.min(actual, 2)];
  const vista = Math.min(actual, 2);
  return (
    <>
      <Pasos actual={4} />
      <Titulo y={194}>Verificación de identidad</Titulo>
      <div
        style={{
          position: "absolute",
          left: 30,
          top: 228,
          width: 330,
          height: 250,
          borderRadius: 14,
          background: "#1c2129",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ width: vista === 2 ? 150 : 236, height: vista === 2 ? 170 : 150, display: "flex", alignItems: "center", justifyContent: "center", marginTop: -46 }}>
          {vista === 0 ? <DniFrente /> : null}
          {vista === 1 ? <DniDorso /> : null}
          {vista === 2 ? (
            <svg viewBox="0 0 60 70" width="100%" height="100%">
              <defs>
                <clipPath id="ovaloSelfie">
                  <ellipse cx={30} cy={34} rx={21} ry={27} />
                </clipPath>
              </defs>
              <g clipPath="url(#ovaloSelfie)">
                <rect width={60} height={70} fill="#c9d8e6" />
                <Persona id="onbSelfie" />
              </g>
              <ellipse cx={30} cy={34} rx={21} ry={27} fill="none" stroke="white" strokeWidth={1} strokeDasharray="3 2" />
            </svg>
          ) : null}
        </div>
        <svg width={330} height={250} style={{ position: "absolute", inset: 0 }}>
          <g stroke="white" strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.9}>
            <path d="M24 40 V20 H44 M286 20 H306 V40 M24 158 V178 H44 M286 178 H306 V158" />
          </g>
        </svg>
        <div style={{ position: "absolute", bottom: 56, width: "100%", textAlign: "center", fontSize: 11, color: "white", opacity: 0.9 }}>
          {actual < 3 ? guia : "Captura completa"}
        </div>
        {/* Shutter */}
        <div
          style={{
            position: "absolute",
            bottom: 8,
            left: 165 - 20,
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "3px solid white",
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${1 - Math.max(...CAPTURAS.map((c) => pulsado(frame, c))) * 0.12})`,
          }}
        >
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "white" }} />
        </div>
        <div style={{ position: "absolute", inset: 0, background: "white", opacity: flash }} />
      </div>
      {ITEMS.map((it, i) => {
        const c = CAPTURAS[i];
        const estado = frame < c + 2 ? "pendiente" : frame < c + VALIDA ? "validando" : "ok";
        return (
          <div
            key={it.n}
            style={{
              position: "absolute",
              left: 30,
              top: 496 + i * 58,
              width: 330,
              height: 48,
              borderRadius: 9,
              border: `1px solid ${estado === "ok" ? "#b9e0c8" : i === actual ? "#9cc0e6" : BORDE}`,
              background: estado === "ok" ? "#f0f9f3" : "white",
              display: "flex",
              alignItems: "center",
              padding: "0 14px",
              boxSizing: "border-box",
              gap: 10,
            }}
          >
            <div style={{ width: 26, height: 26, borderRadius: 6, background: i === 2 ? "#e6eef7" : "#e9eef5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>
              {i === 2 ? "☺" : "▭"}
            </div>
            <div style={{ flex: 1, fontSize: 13, fontWeight: 700, color: TINTA }}>{it.n}</div>
            {estado === "pendiente" ? <span style={{ fontSize: 11, color: "#9aa3b2" }}>Pendiente</span> : null}
            {estado === "validando" ? (
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: TINTA_2 }}>
                <Spinner size={20} frame={frame} />
                {it.s}
              </span>
            ) : null}
            {estado === "ok" ? <span style={{ fontSize: 12, fontWeight: 700, color: VERDE }}>✓ Validado</span> : null}
          </div>
        );
      })}
      {listo > 0.01 ? (
        <div
          style={{
            position: "absolute",
            left: 30,
            top: 680,
            width: 330,
            height: 50,
            borderRadius: 10,
            background: VERDE,
            color: "white",
            fontSize: 15,
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: listo,
            transform: `scale(${0.9 + 0.1 * listo})`,
          }}
        >
          ✓ Identidad verificada
        </div>
      ) : null}
    </>
  );
};

const WhatsApp: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const enviado = spring({ frame: frame - TAP_WA - 6, fps, config: { damping: 16 } });
  return (
    <>
      <Pasos actual={5} />
      <Titulo y={196} s={15} c={AZUL_OSCURO}>
        Te vamos a enviar un mensaje por WhatsApp con los términos y condiciones de privacidad y uso de tus datos para
        finalizar el proceso.
      </Titulo>
      <div style={{ position: "absolute", top: 300, width: "100%", textAlign: "center", fontSize: 12, color: TINTA }}>
        Debés continuar con las instrucciones allí.
      </div>
      <svg width={64} height={64} viewBox="0 0 64 64" style={{ position: "absolute", left: 163, top: 334 }}>
        <circle cx={32} cy={32} r={30} fill="#25d366" />
        <path d="M32 14 A18 18 0 0 0 16.5 41 L14 50 L23.2 47.6 A18 18 0 1 0 32 14 Z" fill="white" />
        <path d="M32 17.5 A14.5 14.5 0 0 0 19.6 39.8 L18.2 45 L23.6 43.6 A14.5 14.5 0 1 0 32 17.5 Z" fill="#25d366" />
        <path d="M26 24.5 C25 24.5 24 26 24.5 28 C25.5 32 30 37.5 35.5 39.5 C37.5 40.2 39 39.2 39.4 38 L39.6 36.6 L36 34.8 L34.6 36.4 C32 35.4 29.6 33 28.6 30.4 L30.2 29 L28.4 25 Z" fill="white" />
      </svg>
      <Boton x={70} y={430} w={250} texto="Enviar Mensaje" color={AZUL_OSCURO} press={pulsado(frame, TAP_WA)} />
      {enviado > 0.01 ? (
        <div
          style={{
            position: "absolute",
            left: 30,
            top: 500,
            width: 330,
            borderRadius: 10,
            background: "#eef8f1",
            border: "1px solid #b9e0c8",
            padding: "12px 14px",
            boxSizing: "border-box",
            opacity: enviado,
            transform: `translateY(${(1 - enviado) * 16}px)`,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 800, color: VERDE }}>✓ Mensaje enviado</div>
          <div style={{ fontSize: 11.5, color: TINTA, marginTop: 4 }}>Revisá tu WhatsApp al 11 5555-0123</div>
        </div>
      ) : null}
      {frame >= TAP_WA + 14 ? (
        <div
          style={{
            position: "absolute",
            left: 30,
            top: 588,
            width: 330,
            height: 56,
            borderRadius: 10,
            border: `1px solid ${frame >= TEL_OK ? "#b9e0c8" : BORDE}`,
            background: frame >= TEL_OK ? "#eef8f1" : "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          {frame < TEL_OK ? (
            <>
              <Spinner size={26} frame={frame} />
              <span style={{ fontSize: 12.5, color: TINTA_2 }}>Esperando confirmación del cliente…</span>
            </>
          ) : (
            <span style={{ fontSize: 14, fontWeight: 800, color: VERDE }}>✓ Teléfono verificado</span>
          )}
        </div>
      ) : null}
    </>
  );
};

const Resumen: React.FC<{ frame: number }> = ({ frame }) => (
  <>
    <Pasos actual={6} />
    <Titulo y={194} s={19}>¡Ya está todo listo!</Titulo>
    <div style={{ position: "absolute", top: 232, left: 30, right: 30, textAlign: "center", fontSize: 12, color: TINTA, lineHeight: 1.5 }}>
      Este es el resumen de la operación. Para finalizar el proceso tenés que aceptarlo y firmarlo.
    </div>
    <div
      style={{
        position: "absolute",
        left: 40,
        top: 296,
        width: 310,
        borderRadius: 10,
        background: "#dfe9f2",
        border: "1px solid #b7c8da",
        boxShadow: "0 6px 14px rgba(20,40,70,0.15)",
        padding: "18px 16px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        alignItems: "center",
        fontSize: 12.5,
        color: TINTA,
      }}
    >
      {[
        ["Monto otorgado", pesos(850000) + ",00"],
        ["Plan", "6 cuotas de " + pesos(196180) + ",00"],
        ["Primer vencimiento", "10/12/2026"],
        ["TNA", "120,00%"],
      ].map(([k, v], i) => (
        <div key={k} style={{ opacity: interpolate(frame, [ESC.resumen[0] + 8 + i * 4, ESC.resumen[0] + 16 + i * 4], [0, 1], clamp) }}>
          {k}: <b>{v}</b>
        </div>
      ))}
    </div>
    <div style={{ position: "absolute", top: 494, left: 30, right: 30, textAlign: "center", fontSize: 12, color: TINTA, lineHeight: 1.5 }}>
      En el siguiente paso vas a firmar digitalmente usando tu dedo.
    </div>
    <Boton x={70} y={582} w={250} texto="Pasar a la firma" press={pulsado(frame, TAP_FIRMA)} />
  </>
);

const Firma: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const trazo = interpolate(frame, TRAZO, [0, 1], clamp);
  const modal = spring({ frame: frame - MODAL_FIRMA, fps, config: { damping: 16, stiffness: 140 } });
  const cierre = interpolate(frame, [FIRMA_OK, FIRMA_OK + 10], [0, 1], clamp);
  const vModal = modal * (1 - cierre);
  const enviando = frame >= TAP_CONFIRMAR + 2 && frame < FIRMA_OK;
  const recibida = spring({ frame: frame - FIRMA_OK - 4, fps, config: { damping: 15 } });
  const firma = (w: number, h: number, progreso = 1) => (
    <svg width={w} height={h} viewBox="0 0 330 230">
      <path
        d={firmaD(progreso)}
        fill="none"
        stroke="#1a3fbf"
        strokeWidth={3.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
  return (
    <>
      <Pasos actual={7} />
      <Titulo y={194}>Firma Digital</Titulo>
      <div style={{ position: "absolute", top: 226, width: "100%", textAlign: "center", fontSize: 11.5, color: TINTA_2 }}>
        Firmá en el recuadro usando tu dedo.
      </div>
      <div
        style={{
          position: "absolute",
          left: PAD.x,
          top: PAD.y,
          width: PAD.w,
          height: PAD.h,
          borderRadius: 12,
          border: "1.5px solid #1e3a5f",
          background: "#f7f9fc",
          overflow: "hidden",
        }}
      >
        {firma(PAD.w, PAD.h, trazo)}
        <div style={{ position: "absolute", left: 24, right: 24, bottom: 34, borderBottom: "1px dashed #b9c4d2" }} />
      </div>
      <Boton x={30} y={512} w={160} texto="Borrar" color="#e9edf2" />
      <div style={{ position: "absolute", left: 30, top: 512, width: 160, height: 44, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13.5, fontWeight: 700, color: "#3d4350" }}>
        Borrar
      </div>
      <Boton x={200} y={512} w={160} texto="Continuar" color="#1e3a5f" press={pulsado(frame, TAP_FIRMA_CONT)} opacity={trazo >= 1 ? 1 : 0.5} />
      {recibida > 0.01 ? (
        <div style={{ position: "absolute", top: 584, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: recibida, transform: `scale(${0.9 + 0.1 * recibida})` }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: VERDE, color: "white", fontSize: 22, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>✓</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: VERDE }}>¡Firma recibida!</div>
          <div style={{ border: `1px solid ${BORDE}`, borderRadius: 8, background: "white", padding: 4 }}>{firma(120, 84)}</div>
        </div>
      ) : null}
      {vModal > 0.001 ? (
        <>
          <div style={{ position: "absolute", inset: -1500, background: `rgba(40,44,52,${0.55 * vModal})` }} />
          <div
            style={{
              position: "absolute",
              left: 30,
              top: 250,
              width: 330,
              height: 320,
              borderRadius: 16,
              background: "white",
              boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
              opacity: vModal,
              transform: `scale(${0.9 + 0.1 * vModal})`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              paddingTop: 22,
              boxSizing: "border-box",
            }}
          >
            <div style={{ fontSize: 17, fontWeight: 800, color: TINTA }}>¿Confirmar firma?</div>
            <div style={{ fontSize: 11.5, color: TINTA_2, marginTop: 6 }}>Verificá que tu firma sea legible antes de enviar.</div>
            <div style={{ marginTop: 16, border: `1px solid ${BORDE}`, borderRadius: 10, padding: 6 }}>{firma(200, 140)}</div>
          </div>
          <div style={{ opacity: vModal }}>
            {enviando ? (
              <div style={{ position: "absolute", left: 46, top: 512, width: 298, height: 44, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <Spinner size={26} frame={frame} />
                <span style={{ fontSize: 13, color: TINTA_2 }}>Enviando firma…</span>
              </div>
            ) : (
              <>
                <Boton x={46} y={512} w={140} texto="Corregir" color="#e9edf2" />
                <div style={{ position: "absolute", left: 46, top: 512, width: 140, height: 44, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13.5, fontWeight: 700, color: "#3d4350" }}>
                  Corregir
                </div>
                <Boton x={204} y={512} w={140} texto="Confirmar" color="#1e3a5f" press={pulsado(frame, TAP_CONFIRMAR)} />
              </>
            )}
          </div>
        </>
      ) : null}
    </>
  );
};

const Final: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const t = spring({ frame: frame - ESC.final[0] - 4, fps, config: { damping: 12, stiffness: 120 } });
  return (
    <>
      <Pasos actual={8} />
      <div style={{ position: "absolute", top: 200, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div
          style={{
            width: 76,
            height: 76,
            borderRadius: "50%",
            background: VERDE,
            color: "white",
            fontSize: 42,
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${t})`,
            boxShadow: `0 0 0 ${10 * t}px rgba(30,138,76,0.15)`,
          }}
        >
          ✓
        </div>
      </div>
      <Titulo y={298} s={20}>¡Onboarding completo!</Titulo>
      <div style={{ position: "absolute", top: 334, left: 34, right: 34, textAlign: "center", fontSize: 12.5, color: TINTA_2, lineHeight: 1.5 }}>
        Tu préstamo fue aprobado. El dinero se acreditará en tu cuenta en minutos.
      </div>
      <div
        style={{
          position: "absolute",
          left: 30,
          top: 396,
          width: 330,
          borderRadius: 12,
          border: `1px solid ${BORDE}`,
          padding: "6px 16px",
          boxSizing: "border-box",
        }}
      >
        {[
          ["Cliente", "Javier Perez"],
          ["Operación", "2026111300002"],
          ["Monto", pesos(850000)],
          ["Plan", "6 cuotas de " + pesos(196180)],
          ["Primer vencimiento", "10/12/2026"],
        ].map(([k, v], i) => (
          <div
            key={k}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 0",
              borderTop: i ? `1px solid ${BORDE}` : "none",
              fontSize: 12.5,
              opacity: interpolate(frame, [ESC.final[0] + 14 + i * 4, ESC.final[0] + 22 + i * 4], [0, 1], clamp),
            }}
          >
            <span style={{ color: TINTA_2 }}>{k}</span>
            <b style={{ color: TINTA }}>{v}</b>
          </div>
        ))}
      </div>
      <Boton x={70} y={640} w={250} texto="Ver contrato" color={AZUL_OSCURO} press={pulsado(frame, TAP_CONTRATO)} />
    </>
  );
};


// Signed contract as a PDF on the phone: Axonia logo, installment table,
// payment methods and, below, the client's declaration with the signature.
const NARANJA_DOC = "#f5a033";
const VENCIMIENTOS = ["10/12/2026", "10/01/2027", "10/02/2027", "10/03/2027", "10/04/2027", "10/05/2027"];
const Contrato: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const scroll = interpolate(frame, SCROLL, [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const sello = spring({ frame: frame - SELLO, fps, config: { damping: 11, stiffness: 140 } });
  const T: React.FC<{ s?: number; b?: boolean; style?: React.CSSProperties; children: React.ReactNode }> = ({ s = 9, b, style, children }) => (
    <div style={{ fontSize: s, fontWeight: b ? 700 : 500, color: "#1d1f24", lineHeight: 1.45, ...style }}>{children}</div>
  );
  return (
    <>
      {/* Viewer toolbar */}
      <div style={{ position: "absolute", left: 8, top: 86, width: W - 16, height: H - 100, background: "#e3e6ea", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ height: 40, background: "#3b3f46", display: "flex", alignItems: "center", padding: "0 14px", gap: 8, color: "white" }}>
          <div style={{ width: 18, height: 22, borderRadius: 3, background: "#e04a3f", fontSize: 6, fontWeight: 800, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 2, boxSizing: "border-box" }}>PDF</div>
          <div style={{ flex: 1, fontSize: 11.5, fontWeight: 700 }}>Contrato_2026111300002.pdf</div>
          <div style={{ fontSize: 14 }}>⤓</div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 40, bottom: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 12, right: 12, top: 12, transform: `scale(${1 + scroll * 0.22})`, transformOrigin: "50% 96%" }}>
          <div style={{ background: "white", boxShadow: "0 4px 14px rgba(0,0,0,0.18)", padding: "20px 20px 26px", boxSizing: "border-box" }}>
            <Img src={staticFile("axonia-logo-original.png")} style={{ width: 92, height: (92 * 231) / 676 }} />
            <T s={13} b style={{ textAlign: "center", marginTop: 14 }}>Contrato de préstamo personal</T>
            <T s={8.5} style={{ textAlign: "center", color: "#5b6270", marginTop: 2 }}>
              Operación 2026111300002 · Javier Perez · {pesos(850000)} en 6 cuotas
            </T>
            <T s={11} b style={{ textAlign: "center", marginTop: 14, marginBottom: 8 }}>Cronograma de pagos</T>
            <div style={{ margin: "0 14px" }}>
              <div style={{ display: "flex", background: "#ffe4c4", border: `1px solid ${NARANJA_DOC}` }}>
                {["Cuota", "Vencimiento", "Importe"].map((c, i) => (
                  <T key={c} s={9} b style={{ flex: 1, textAlign: "center", padding: "4px 0", borderLeft: i ? `1px solid ${NARANJA_DOC}` : "none" }}>{c}</T>
                ))}
              </div>
              {VENCIMIENTOS.map((v, i) => (
                <div key={v} style={{ display: "flex", borderBottom: `1px solid ${NARANJA_DOC}` }}>
                  <T s={9} style={{ flex: 1, textAlign: "center", padding: "3px 0" }}>{i + 1}</T>
                  <T s={9} style={{ flex: 1, textAlign: "right", padding: "3px 6px" }}>{v}</T>
                  <T s={9} style={{ flex: 1, textAlign: "right", padding: "3px 6px" }}>{pesos(196180)},00</T>
                </div>
              ))}
            </div>
            <T s={8.5} style={{ marginTop: 14 }}>
              <b>Medios de pago disponibles:</b> efectivo en puntos de cobranza autorizados, débito automático en cuenta
              bancaria, tarjeta de débito, billeteras virtuales con QR habilitadas y empresas de cobranza extrabancaria.
            </T>
            <T s={8.5} style={{ marginTop: 6 }}>
              Podés consultar el detalle de tu préstamo por WhatsApp o escribirnos a consultas@axonia.com.ar.
            </T>
            <div style={{ borderTop: `1.5px solid ${NARANJA_DOC}`, margin: "12px 0" }} />
            <T s={10} b>Declaración y firma</T>
            <T s={8.5} style={{ marginTop: 4 }}>
              Declaro haber leído y aceptado las condiciones del presente contrato de préstamo, el cronograma de pagos y
              la política de privacidad y uso de datos. Presto conformidad mediante firma digital, previa verificación de
              identidad, email y teléfono.
            </T>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 8 }}>
              <div style={{ width: 170 }}>
                <svg width={170} height={112} viewBox="20 0 300 230">
                  <path d={firmaD(1)} fill="none" stroke="#1a3fbf" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div style={{ borderTop: "1px solid #1d1f24", marginTop: 2 }} />
                <T s={9} b style={{ marginTop: 3 }}>Javier Perez</T>
                <T s={7.5} style={{ color: "#5b6270" }}>Firma digital · 13/11/2026 11:44</T>
              </div>
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: "50%",
                  border: `2.5px solid ${VERDE}`,
                  color: VERDE,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  fontSize: 8,
                  fontWeight: 800,
                  letterSpacing: 0.5,
                  transform: `rotate(-14deg) scale(${sello * 1})`,
                  opacity: Math.min(1, sello),
                  marginBottom: 14,
                }}
              >
                <div style={{ fontSize: 20 }}>✓</div>
                FIRMADO
                <br />
                DIGITALMENTE
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
};

const TITULOS: Record<Escena, string> = {
  datos: "CARGAR DATOS",
  buscando: "CARGAR DATOS",
  ofertas: "OFERTAS DISPONIBLES",
  email: "VALIDACIÓN DE EMAIL",
  identidad: "VERIFICACIÓN DE IDENTIDAD",
  whatsapp: "VERIFICACIÓN TELEFÓNICA",
  resumen: "TÉRMINOS Y CONDICIONES",
  firma: "FIRMA DIGITAL",
  final: "ONBOARDING COMPLETO",
  contrato: "CONTRATO",
};

const LOGO_W = 2028;
const LOGO_H = 693;
const Logo: React.FC<{ w: number }> = ({ w }) => (
  <div style={{ position: "relative", width: w, height: (w * LOGO_H) / LOGO_W }}>
    {["axonia-letras.png", "axonia-icono.png"].map((f) => (
      <Img key={f} src={staticFile(f)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    ))}
  </div>
);

const escenaActual = (frame: number) =>
  (Object.keys(ESC) as Escena[]).filter((e) => frame >= ESC[e][0]).pop() ?? "datos";

// Finger/cursor visibility: hidden while the offer search runs and once the
// contract is open.
const punteroVisible = (frame: number) =>
  interpolate(frame, [6, 14], [0, 1], clamp) *
  (1 - interpolate(frame, [ESC.buscando[0], ESC.buscando[0] + 6, ESC.buscando[1] - 6, ESC.buscando[1]], [0, 1, 1, 0], clamp)) *
  interpolate(frame, [TAP_CONTRATO + 30, TAP_CONTRATO + 44], [1, 0], clamp);

const visBuscando = (frame: number) => {
  const [a, b] = ESC.buscando;
  return interpolate(frame, [a, a + 6, b - 6, b], [0, 1, 1, 0], clamp);
};

const Buscando: React.FC<{ frame: number; grande?: boolean }> = ({ frame, grande }) => {
  const v = visBuscando(frame);
  if (v <= 0.001) {
    return null;
  }
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `rgba(10,12,16,${0.82 * v})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: grande ? 34 : 26,
        color: "white",
        textAlign: "center",
        padding: "0 28px",
        zIndex: 5,
      }}
    >
      <div style={{ fontSize: grande ? 28 : 17, fontWeight: 700, lineHeight: 1.35, opacity: v }}>
        Estamos analizando los datos y buscando una oferta.
      </div>
      <div style={{ fontSize: grande ? 24 : 14, lineHeight: 1.4, opacity: v * 0.9 }}>
        Por favor aguardá, puede demorar hasta 60 segundos.
      </div>
      <div style={{ opacity: v }}>
        <Spinner size={grande ? 110 : 86} frame={frame} claro />
      </div>
    </div>
  );
};

// `escritorio`: only the page content, for the notebook page that draws its
// own header, card, overlay and mouse cursor around it.
const App: React.FC<{ frame: number; escritorio?: boolean }> = ({ frame, escritorio }) => {
  const vis = (e: Escena) => {
    const [a, b] = ESC[e];
    return interpolate(frame, [a, a + 6, b - 6, b], [0, 1, 1, 0], clamp) * (a === 0 ? 1 : 1);
  };
  const desliza = (e: Escena) => {
    const [a, b] = ESC[e];
    return interpolate(frame, [a, a + 8], [30, 0], clamp) + interpolate(frame, [b - 6, b], [0, -30], clamp);
  };
  const escenas: [Escena, React.FC<{ frame: number }>][] = [
    ["datos", Datos],
    ["ofertas", Ofertas],
    ["email", Email],
    ["identidad", Identidad],
    ["whatsapp", WhatsApp],
    ["resumen", Resumen],
    ["firma", Firma],
    ["final", Final],
    ["contrato", Contrato],
  ];
  const actual = escenaActual(frame);
  const dedo = posDedo(frame);
  const tap = tapsDe.find((f) => frame >= f && frame < f + 16);
  const onda = tap === undefined ? 0 : (frame - tap) / 16;
  const dedoVis = punteroVisible(frame);

  return (
    <div style={{ position: "relative", width: W, height: H, background: escritorio ? "transparent" : "#f4f6f9", fontFamily: FUENTE, overflow: escritorio ? "visible" : "hidden" }}>
      {escritorio ? null : (
      <>
      {/* Header */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: W,
          height: 78,
          background: "#4a4a4a",
          display: "flex",
          alignItems: "center",
          paddingTop: 30,
          boxSizing: "border-box",
        }}
      >
        <div style={{ marginLeft: 16 }}>
          <Logo w={92} />
        </div>
        <div style={{ flex: 1, textAlign: "center", color: "white", fontSize: 10.5, fontWeight: 700, letterSpacing: 0.8 }}>
          {TITULOS[actual]}
        </div>
        <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#d6d9de", marginRight: 16 }} />
      </div>
      {/* Content card */}
      <div
        style={{
          position: "absolute",
          left: 8,
          top: 86,
          width: W - 16,
          height: H - 100,
          background: "white",
          borderRadius: 12,
          boxShadow: "0 4px 18px rgba(20,30,50,0.08)",
        }}
      />
      </>
      )}
      <div style={{ position: "absolute", top: 100, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        {/* Dark-lettered logo for the white page */}
        <Img
          src={staticFile("axonia-logo-original.png")}
          style={{ width: 150, height: (150 * 231) / 676, opacity: interpolate(frame, [ESC.contrato[0], ESC.contrato[0] + 6], [1, 0], clamp) }}
        />
      </div>
      {escenas.map(([e, C]) => {
        const v = vis(e);
        if (v <= 0.001) {
          return null;
        }
        return (
          <div key={e} style={{ position: "absolute", inset: 0, opacity: v, transform: `translateX(${desliza(e)}px)` }}>
            <C frame={frame} />
          </div>
        );
      })}
      {escritorio ? null : <Buscando frame={frame} />}
      {/* Finger */}
      {tap !== undefined && !escritorio ? (
        <div
          style={{
            position: "absolute",
            left: dedo.x,
            top: dedo.y,
            width: 18 + onda * 54,
            height: 18 + onda * 54,
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            border: `3px solid rgba(255,140,66,${1 - onda})`,
            background: `rgba(255,140,66,${(1 - onda) * 0.2})`,
          }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          left: dedo.x,
          top: dedo.y,
          width: 34,
          height: 34,
          transform: `translate(-50%, -50%) scale(${1 - (tap === undefined ? 0 : interpolate(frame - tap, [0, 3, 8], [0, 1, 0], clamp)) * 0.2})`,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.55)",
          border: "2px solid rgba(40,48,64,0.35)",
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          opacity: escritorio ? 0 : dedoVis * 0.9,
        }}
      />
    </div>
  );
};

// Landscape page (tablet 1180 x 820 or notebook 1280 x 800): full-width header, centered white card with
// the onboarding content, full-page spinner overlay and a mouse cursor.
// The form is shown larger than on the phone; the page scrolls to keep the
// spot being touched in view, as on a real tablet.
const ESC_PAGINA = 1.3;
const objetivoScroll = (f: number) => (f >= ESC.contrato[0] ? 760 : f < 14 ? 315 : posDedo(f).y);
const Escritorio: React.FC<{ frame: number; PW: number; PH: number; tactil?: boolean }> = ({ frame, PW, PH, tactil }) => {
  const HEADER = 58;
  const CARD = { x: PW / 2 - 330, y: HEADER + 14, w: 660, h: PH - HEADER + 40 };
  const visible = PH - CARD.y;
  const maxScroll = (H - 86) * ESC_PAGINA - visible + 10;
  let media = 0;
  for (let k = 0; k < 12; k++) {
    media += objetivoScroll(Math.max(0, frame - k));
  }
  media /= 12;
  const scroll = Math.max(0, Math.min(maxScroll, (media - 86) * ESC_PAGINA - visible * 0.65));
  const ox = PW / 2 - (W / 2) * ESC_PAGINA;
  const oy = CARD.y + 4 - 86 * ESC_PAGINA - scroll;
  const actual = escenaActual(frame);
  const p = posDedo(frame);
  const cx = ox + p.x * ESC_PAGINA;
  const cy = oy + p.y * ESC_PAGINA;
  const tap = tapsDe.find((f) => frame >= f && frame < f + 16);
  const onda = tap === undefined ? 0 : (frame - tap) / 16;
  const presion = tap === undefined ? 0 : interpolate(frame - tap, [0, 3, 8], [0, 1, 0], clamp);
  return (
    <div style={{ position: "relative", width: PW, height: PH, background: "#f1f3f6", fontFamily: FUENTE, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: CARD.x,
          top: CARD.y - scroll,
          width: CARD.w,
          height: CARD.h + scroll,
          background: "white",
          borderRadius: 14,
          boxShadow: "0 6px 24px rgba(20,30,50,0.1)",
        }}
      />
      <div style={{ position: "absolute", left: ox, top: oy, transform: `scale(${ESC_PAGINA})`, transformOrigin: "0 0" }}>
        <App frame={frame} escritorio />
      </div>
      <div style={{ position: "absolute", left: 0, top: 0, width: PW, height: HEADER, background: "#4a4a4a", display: "flex", alignItems: "center", zIndex: 4 }}>
        <div style={{ marginLeft: 24 }}>
          <Logo w={110} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, textAlign: "center", color: "white", fontSize: 13, fontWeight: 700, letterSpacing: 1 }}>
          {TITULOS[actual]}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 26 }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#d6d9de" }} />
          <div style={{ color: "white", fontSize: 13, fontWeight: 700 }}>Delfina Martinez</div>
        </div>
      </div>
      <Buscando frame={frame} grande />
      {tap !== undefined ? (
        <div
          style={{
            position: "absolute",
            left: cx,
            top: cy,
            width: 14 + onda * 46,
            height: 14 + onda * 46,
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            border: `3px solid rgba(255,140,66,${1 - onda})`,
            background: `rgba(255,140,66,${(1 - onda) * 0.2})`,
            zIndex: 6,
          }}
        />
      ) : null}
      {tactil ? (
        <div
          style={{
            position: "absolute",
            left: cx,
            top: cy,
            width: 34,
            height: 34,
            transform: `translate(-50%, -50%) scale(${1 - presion * 0.2})`,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.55)",
            border: "2px solid rgba(40,48,64,0.35)",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            opacity: punteroVisible(frame) * 0.9,
            zIndex: 7,
          }}
        />
      ) : (
      <svg
        width={26}
        height={26}
        viewBox="0 0 24 24"
        style={{
          position: "absolute",
          left: cx - 4,
          top: cy - 2,
          opacity: punteroVisible(frame),
          transform: `scale(${1 - presion * 0.15})`,
          filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.35))",
          zIndex: 7,
        }}
      >
        <path d="M4 2 L4 19 L8.5 15 L11.5 21.5 L14.5 20 L11.5 13.8 L17.5 13.5 Z" fill="white" stroke="#111" strokeWidth={1.4} strokeLinejoin="round" />
      </svg>
      )}
    </div>
  );
};

export const OnboardingApp: React.FC<z.infer<typeof onboardingSchema>> = ({ fondo, paleta }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const vertical = height > width;
  const tipo = vertical ? "celular" : "tablet";
  const { w, h } = pantallaDe(tipo, vertical);
  const { W: EW, H: EH } = exteriorDe(tipo, w, h);
  const esc = vertical ? Math.min(980 / EW, 1560 / EH) : Math.min(1640 / EW, 960 / EH);
  const t = spring({ frame, fps, config: { damping: 18, stiffness: 80 } });
  const flota = Math.sin(frame / 45) * 5;
  return (
    <AbsoluteFill style={{ fontFamily: FUENTE }}>
      <FondoAbstracto paleta={paleta} estilo={fondo} />
      <div
        style={{
          position: "absolute",
          left: width / 2,
          top: height / 2,
          opacity: t,
          transform: `translate(-50%, -50%) translateY(${flota + (1 - t) * 120}px) scale(${esc})`,
        }}
      >
        <Dispositivo tipo={tipo} w={w} h={h}>
          {vertical ? <App frame={frame} /> : <Escritorio frame={frame} PW={w} PH={h} tactil />}
        </Dispositivo>
      </div>
    </AbsoluteFill>
  );
};
