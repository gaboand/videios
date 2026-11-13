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

// Loan detail (1080x1920, 9s): a white Core Lending window (dark header
// with the Axonia logo and the user, icon sidebar) on the animated
// background, showing the loan data, quick actions and payment plan. A
// cursor presses "Cobranza" and installment 2 flips from PENDIENTE to
// PAGO while the outstanding balance counts down.

export const planPagosSchema = z.object({
  fondo: z.enum(["ondas", "red", "aurora", "geometrico"]),
  paleta: z.enum(["azul", "gris"]),
});

const FUENTE = "Montserrat, sans-serif";
const ACENTO = "#FF8C42";
// Light app palette, after the Core Lending screens.
const TINTA = "#1f2430";
const TINTA_2 = "#6b7280";
const NAVY = "#1f2d4d";
const BOTON = "#2c5a8c";
const FILA_ALT = "#f5f7fa";

// App window on the 1080x1920 canvas.
const VENTANA = { x: 50, y: 270, w: 980, h: 1380 };
const HEADER_H = 84;
const SIDEBAR_W = 72;
// Content area inside the window.
const CX = SIDEBAR_W + 34;
const CW = VENTANA.w - SIDEBAR_W - 68;

const DATOS = [
  ["Cliente", "Javier Perez"],
  ["Capital", "$ 1.500.000"],
  ["TNA", "140%"],
  ["Cuotas", "5"],
  ["Alta", "03/09/2026"],
  ["Sucursal", "Suc. 03"],
  ["Tipo", "Renovación"],
  ["Estado", "Vigente"],
];

const ACCIONES = [
  "Cobranza",
  "Condonación",
  "Reversa",
  "Cancelación",
  "Anulación",
  "Cuenta corriente",
];

const CUOTAS = [
  { n: 1, vto: "10/10/2026", cuota: 449433.9, pagado: true },
  { n: 2, vto: "10/11/2026", cuota: 443610.65, pagado: false },
  { n: 3, vto: "10/12/2026", cuota: 437108.01, pagado: false },
  { n: 4, vto: "10/01/2027", cuota: 429846.74, pagado: false },
  { n: 5, vto: "10/02/2027", cuota: 421738.31, pagado: false },
];

// Vertical layout inside the window (window coordinates).
const TITULO_Y = HEADER_H + 40;
const DATOS_Y = HEADER_H + 120;
const DATOS_H = 300;
const ACC_Y = DATOS_Y + DATOS_H + 40;
const BTN_H = 58;
const BTN_GAP = 14;
const BTN_W = (CW - BTN_GAP * 2) / 3;
const PLAN_Y = ACC_Y + 40 + BTN_H * 2 + BTN_GAP + 50;

// Timeline (frames).
const VENTANA_DESDE = 4;
const DATOS_DESDE = 20;
const ACCIONES_DESDE = 40;
const FILAS_DESDE = 58;
const CLIC = 130;
const PAGO = 145;

const pesos = (n: number) =>
  `$ ${n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Simple line icons for the sidebar.
const ICONOS = [
  "M4 11 L12 4 L20 11 V20 H14 V14 H10 V20 H4 Z", // home
  "M10 4 A6 6 0 1 1 10 16 A6 6 0 1 1 10 4 M15 15 L20 20", // search
  "M3 6 H21 V18 H3 Z M3 10 H21", // card
  "M12 4 V20 M4 12 H20", // plus
  "M4 20 V10 M10 20 V4 M16 20 V13 M22 20 H2", // chart
  "M6 3 H15 L19 7 V21 H6 Z M9 12 H16 M9 16 H16", // document
  "M12 8 V12 L15 15 M4 12 A8 8 0 1 0 6.5 6.3 M4 4 V8 H8", // history
  "M12 3 L14 6 H18 V10 L21 12 L18 14 V18 H14 L12 21 L10 18 H6 V14 L3 12 L6 10 V6 H10 Z", // gear
];

const Ventana: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pago = interpolate(frame, [PAGO, PAGO + 20], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const destello = interpolate(
    frame,
    [PAGO, PAGO + 8, PAGO + 40],
    [0, 1, 0],
    clamp,
  );
  const pulsado = interpolate(
    frame,
    [CLIC, CLIC + 4, CLIC + 12],
    [0, 1, 0],
    clamp,
  );
  const adeudado = CUOTAS.filter((c) => !c.pagado).reduce(
    (a, c) => a + c.cuota,
    0,
  );
  const COL = { n: 60, vto: 175, cuota: 200, adeudado: 200, estado: 140 };

  const aparece = (desde: number) =>
    spring({
      frame: frame - desde,
      fps,
      config: { damping: 16, stiffness: 120 },
    });

  const LOGO_W = 2028;
  const LOGO_H = 693;
  const logoEsc = 170 / LOGO_W;

  return (
    <>
      {/* Header */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: VENTANA.w,
          height: HEADER_H,
          background: "#4a4a4a",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          style={{
            position: "relative",
            marginLeft: 26,
            width: LOGO_W * logoEsc,
            height: LOGO_H * logoEsc,
          }}
        >
          {["axonia-letras.png", "axonia-icono.png"].map((f) => (
            <Img
              key={f}
              src={staticFile(f)}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: LOGO_W * logoEsc,
                height: LOGO_H * logoEsc,
              }}
            />
          ))}
        </div>
        <div
          style={{
            flex: 1,
            textAlign: "center",
            color: "white",
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          DATOS DEL CLIENTE
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginRight: 28,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "#e5e7eb",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: 24,
                height: 14,
                borderRadius: "12px 12px 0 0",
                background: "#9ca3af",
              }}
            />
          </div>
          <div style={{ color: "white", fontSize: 19, fontWeight: 700 }}>
            Delfina Martinez
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: HEADER_H,
          width: SIDEBAR_W,
          bottom: 0,
          background: "#1c1d21",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 26,
          gap: 30,
        }}
      >
        {ICONOS.map((d, i) => (
          <svg
            key={i}
            width={28}
            height={28}
            viewBox="0 0 24 24"
            style={{
              opacity: interpolate(
                frame,
                [VENTANA_DESDE + 8 + i * 2, VENTANA_DESDE + 16 + i * 2],
                [0, 1],
                clamp,
              ),
            }}
          >
            <path
              d={d}
              fill="none"
              stroke={i === 1 ? ACENTO : "#e5e7eb"}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ))}
      </div>

      {/* Title */}
      <div
        style={{
          position: "absolute",
          left: CX,
          width: CW,
          top: TITULO_Y,
          textAlign: "center",
          fontSize: 34,
          fontWeight: 700,
          color: TINTA,
          opacity: aparece(DATOS_DESDE - 8),
        }}
      >
        Detalle del Préstamo: 2026090300003
      </div>

      {/* Loan data */}
      <div
        style={{
          position: "absolute",
          left: CX,
          width: CW,
          top: DATOS_Y,
          height: DATOS_H,
          borderRadius: 16,
          background: "#f3f5f8",
          padding: "30px 36px",
          boxSizing: "border-box",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          rowGap: 26,
          columnGap: 30,
          opacity: aparece(DATOS_DESDE),
        }}
      >
        {DATOS.map(([k, v], i) => {
          const t = interpolate(
            frame,
            [DATOS_DESDE + 6 + i * 2, DATOS_DESDE + 16 + i * 2],
            [0, 1],
            clamp,
          );
          const chip = k === "Tipo" || k === "Estado";
          return (
            <div
              key={k}
              style={{
                opacity: t,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: TINTA_2,
                  width: 100,
                  textTransform: "uppercase",
                }}
              >
                {k}
              </div>
              <div
                style={{
                  fontSize: 23,
                  fontWeight: 700,
                  color: TINTA,
                  ...(chip
                    ? {
                        fontSize: 17,
                        padding: "5px 12px",
                        borderRadius: 8,
                        background: "#dbe6f5",
                        color: NAVY,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }
                    : {}),
                }}
              >
                {v}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div
        style={{
          position: "absolute",
          left: CX,
          top: ACC_Y,
          fontSize: 17,
          fontWeight: 800,
          letterSpacing: 1.5,
          color: NAVY,
          opacity: aparece(ACCIONES_DESDE - 6),
        }}
      >
        ACCESOS RÁPIDOS
      </div>
      {ACCIONES.map((a, i) => {
        const t = spring({
          frame: frame - ACCIONES_DESDE - i * 3,
          fps,
          config: { damping: 14, stiffness: 160 },
        });
        const esCobranza = a === "Cobranza";
        return (
          <div
            key={a}
            style={{
              position: "absolute",
              left: CX + (i % 3) * (BTN_W + BTN_GAP),
              top: ACC_Y + 40 + Math.floor(i / 3) * (BTN_H + BTN_GAP),
              width: BTN_W,
              height: BTN_H,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              color: "white",
              background: esCobranza
                ? `color-mix(in srgb, ${BOTON}, ${ACENTO} ${pulsado * 100}%)`
                : BOTON,
              opacity: t,
              transform: `scale(${(0.7 + t * 0.3) * (esCobranza ? 1 - pulsado * 0.08 : 1)})`,
              boxShadow: esCobranza
                ? `0 0 ${pulsado * 30}px rgba(255,140,66,0.8)`
                : "0 2px 6px rgba(0,0,0,0.15)",
            }}
          >
            {a}
          </div>
        );
      })}

      {/* Payment plan */}
      <div
        style={{
          position: "absolute",
          left: CX,
          width: CW,
          top: PLAN_Y,
          opacity: aparece(FILAS_DESDE - 8),
        }}
      >
        <div
          style={{
            textAlign: "center",
            fontSize: 28,
            fontWeight: 700,
            color: TINTA,
            marginBottom: 20,
          }}
        >
          Plan de Pagos
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: 54,
            background: NAVY,
            color: "white",
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: 1,
            textTransform: "uppercase",
            paddingLeft: 16,
            borderRadius: "8px 8px 0 0",
          }}
        >
          <div style={{ width: COL.n }}>Cta</div>
          <div style={{ width: COL.vto }}>Vencimiento</div>
          <div style={{ width: COL.cuota, textAlign: "right" }}>Cuota</div>
          <div style={{ width: COL.adeudado, textAlign: "right" }}>
            Adeudado
          </div>
          <div
            style={{ width: COL.estado, marginLeft: 24, textAlign: "center" }}
          >
            Estado
          </div>
        </div>
        {CUOTAS.map((c, i) => {
          const t = spring({
            frame: frame - FILAS_DESDE - i * 5,
            fps,
            config: { damping: 16, stiffness: 140 },
          });
          const pagada = c.pagado ? 1 : i === 1 ? pago : 0;
          const deuda = c.pagado ? 0 : c.cuota * (1 - (i === 1 ? pago : 0));
          return (
            <div
              key={c.n}
              style={{
                display: "flex",
                alignItems: "center",
                height: 78,
                paddingLeft: 16,
                fontSize: 21,
                fontWeight: 500,
                color: TINTA,
                background:
                  i === 1 && destello > 0
                    ? `rgba(22,163,74,${destello * 0.16})`
                    : i % 2
                      ? FILA_ALT
                      : "white",
                opacity: t,
                transform: `translateX(${(1 - t) * 60}px)`,
              }}
            >
              <div style={{ width: COL.n, fontWeight: 700 }}>{c.n}</div>
              <div style={{ width: COL.vto }}>{c.vto}</div>
              <div style={{ width: COL.cuota, textAlign: "right" }}>
                {pesos(c.cuota)}
              </div>
              <div
                style={{
                  width: COL.adeudado,
                  textAlign: "right",
                  fontWeight: 700,
                }}
              >
                {pesos(deuda)}
              </div>
              <div
                style={{
                  width: COL.estado,
                  marginLeft: 24,
                  position: "relative",
                  height: 38,
                }}
              >
                {[0, 1].map((p) => (
                  <div
                    key={p}
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 15,
                      fontWeight: 800,
                      letterSpacing: 1,
                      color: p ? "white" : "#4b5563",
                      background: p ? NAVY : "#e5e7eb",
                      opacity: p ? pagada : 1 - pagada,
                      transform: `scale(${p ? 0.8 + pagada * 0.2 : 1})`,
                    }}
                  >
                    {p ? "PAGO" : "PENDIENTE"}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginTop: 24,
            paddingTop: 20,
            borderTop: "2px solid #e5e7eb",
            opacity: interpolate(
              frame,
              [FILAS_DESDE + 30, FILAS_DESDE + 45],
              [0, 1],
              clamp,
            ),
          }}
        >
          <div
            style={{
              fontSize: 19,
              fontWeight: 800,
              letterSpacing: 1.5,
              color: TINTA_2,
              textTransform: "uppercase",
            }}
          >
            Saldo adeudado
          </div>
          <div style={{ fontSize: 38, fontWeight: 800, color: TINTA }}>
            {pesos(adeudado - CUOTAS[1].cuota * pago)}
          </div>
        </div>
      </div>
    </>
  );
};

export const PlanPagos: React.FC<z.infer<typeof planPagosSchema>> = ({
  fondo,
  paleta,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = spring({
    frame: frame - VENTANA_DESDE,
    fps,
    config: { damping: 16, stiffness: 90 },
  });
  const pulsado = interpolate(
    frame,
    [CLIC, CLIC + 4, CLIC + 12],
    [0, 1, 0],
    clamp,
  );

  // Cursor travels to the center of the "Cobranza" button.
  const objetivo = {
    x: VENTANA.x + CX + BTN_W / 2,
    y: VENTANA.y + ACC_Y + 40 + BTN_H / 2,
  };
  const llega = interpolate(frame, [CLIC - 30, CLIC], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const sale = interpolate(frame, [PAGO + 20, PAGO + 35], [1, 0], clamp);

  return (
    <AbsoluteFill style={{ fontFamily: FUENTE }}>
      <FondoAbstracto paleta={paleta} estilo={fondo} />
      <div
        style={{
          position: "absolute",
          left: VENTANA.x,
          top: VENTANA.y,
          width: VENTANA.w,
          height: VENTANA.h,
          borderRadius: 22,
          overflow: "hidden",
          background: "white",
          boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
          opacity: t,
          transform: `translateY(${(1 - t) * 80}px) scale(${0.95 + t * 0.05})`,
        }}
      >
        <Ventana />
      </div>
      {llega > 0 ? (
        <svg
          width={44}
          height={52}
          viewBox="0 0 22 26"
          style={{
            position: "absolute",
            left: interpolate(llega, [0, 1], [820, objetivo.x]),
            top: interpolate(llega, [0, 1], [1550, objetivo.y]),
            opacity: Math.min(llega * 3, sale),
            transform: `scale(${1 - pulsado * 0.15})`,
            filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.4))",
          }}
        >
          <path
            d="M2 1 L2 20 L7 15.5 L10.5 23.5 L13.5 22 L10 14.5 L17 14.5 Z"
            fill="white"
            stroke="#111"
            strokeWidth={1.2}
          />
        </svg>
      ) : null}
    </AbsoluteFill>
  );
};
