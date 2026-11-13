import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import "@fontsource/montserrat/500.css";
import "@fontsource/montserrat/700.css";
import "@fontsource/montserrat/800.css";
import { z } from "zod";
import { FondoAbstracto } from "./FondoAbstracto";

// Loan detail (1080x1920, 9s), rebuilt from the Core's "Detalle del
// Préstamo" screen for a vertical format: loan data card, quick actions,
// and the payment plan as a compact table. A payment is then registered:
// the "Cobranza" button is pressed and installment 2 goes from PENDIENTE
// to PAGO while its balance counts down to zero.

export const planPagosSchema = z.object({
  fondo: z.enum(["ondas", "red", "aurora", "geometrico"]),
  paleta: z.enum(["azul", "gris"]),
});

const FUENTE = "Montserrat, sans-serif";
const ACENTO = "#FF8C42";
const TEXTO_2 = "#b8bcc4";
const VERDE = "#22c55e";

const DATOS = [
  ["Cliente", "Javier Perez"],
  ["DNI", "30.456.789"],
  ["Capital", "$ 1.500.000"],
  ["TNA", "140%"],
  ["Cuotas", "5"],
  ["Alta", "03/09/2026"],
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

// Timeline (frames).
const CARD = 8;
const ACCIONES_DESDE = 34;
const FILAS_DESDE = 56;
const CLIC = 130; // "Cobranza" pressed
const PAGO = 145; // installment 2 is paid

const pesos = (n: number) =>
  `$ ${n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const Vidrio: React.FC<{
  top: number;
  height: number;
  desde: number;
  children: React.ReactNode;
}> = ({ top, height, desde, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = spring({
    frame: frame - desde,
    fps,
    config: { damping: 16, stiffness: 100 },
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 90,
        width: 900,
        top,
        height,
        borderRadius: 24,
        background: "rgba(22,24,29,0.72)",
        border: "2px solid rgba(255,255,255,0.14)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        backdropFilter: "blur(16px)",
        padding: "28px 34px",
        boxSizing: "border-box",
        opacity: t,
        transform: `translateY(${(1 - t) * 60}px)`,
      }}
    >
      {children}
    </div>
  );
};

const Rotulo: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      fontSize: 18,
      fontWeight: 700,
      letterSpacing: 2,
      textTransform: "uppercase",
      color: TEXTO_2,
      marginBottom: 18,
    }}
  >
    {children}
  </div>
);

const Estado: React.FC<{ pagado: number }> = ({ pagado }) => {
  // pagado: 0 = pending, 1 = paid; in between it cross-fades.
  return (
    <div style={{ position: "relative", width: 150, height: 40 }}>
      {[0, 1].map((p) => (
        <div
          key={p}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 17,
            fontWeight: 800,
            letterSpacing: 1,
            color: p ? "#0b1f10" : "#cfd3da",
            background: p ? VERDE : "rgba(255,255,255,0.1)",
            opacity: p ? pagado : 1 - pagado,
            transform: `scale(${p ? 0.8 + pagado * 0.2 : 1})`,
          }}
        >
          {p ? "PAGO" : "PENDIENTE"}
        </div>
      ))}
    </div>
  );
};

export const PlanPagos: React.FC<z.infer<typeof planPagosSchema>> = ({
  fondo,
  paleta,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titulo = spring({ frame, fps, config: { damping: 18 } });

  const pago = interpolate(frame, [PAGO, PAGO + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const destello = interpolate(frame, [PAGO, PAGO + 8, PAGO + 40], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pulsado = interpolate(frame, [CLIC, CLIC + 4, CLIC + 12], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Totals for the summary line.
  const adeudado = CUOTAS.filter((c) => !c.pagado).reduce(
    (a, c) => a + c.cuota,
    0,
  );
  const adeudadoAhora = adeudado - CUOTAS[1].cuota * pago;

  const COL = { n: 70, vto: 200, cuota: 230, adeudado: 230, estado: 150 };

  return (
    <AbsoluteFill style={{ fontFamily: FUENTE, color: "white" }}>
      <FondoAbstracto paleta={paleta} estilo={fondo} />
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 150,
          width: "100%",
          textAlign: "center",
          opacity: titulo,
          transform: `translateY(${(1 - titulo) * -30}px)`,
        }}
      >
        <div style={{ fontSize: 58, fontWeight: 800 }}>
          Detalle del Préstamo
        </div>
        <div
          style={{
            fontSize: 24,
            fontWeight: 500,
            letterSpacing: 4,
            color: ACENTO,
            textTransform: "uppercase",
            marginTop: 6,
          }}
        >
          Op. 2026090300003
        </div>
      </div>

      {/* Loan data */}
      <Vidrio top={330} height={330} desde={CARD}>
        <Rotulo>Datos del préstamo</Rotulo>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            rowGap: 18,
            columnGap: 30,
          }}
        >
          {DATOS.map(([k, v], i) => {
            const t = interpolate(
              frame,
              [CARD + 8 + i * 2, CARD + 18 + i * 2],
              [0, 1],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            );
            const chip = k === "Tipo" || k === "Estado";
            return (
              <div
                key={k}
                style={{
                  opacity: t,
                  display: "flex",
                  alignItems: "baseline",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 19,
                    fontWeight: 500,
                    color: TEXTO_2,
                    width: 110,
                  }}
                >
                  {k}
                </div>
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    ...(chip
                      ? {
                          fontSize: 19,
                          padding: "4px 12px",
                          borderRadius: 8,
                          background:
                            k === "Estado"
                              ? "rgba(34,197,94,0.18)"
                              : "rgba(57,135,229,0.2)",
                          color: k === "Estado" ? VERDE : "#9cc4f5",
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
      </Vidrio>

      {/* Quick actions */}
      <Vidrio top={690} height={230} desde={ACCIONES_DESDE - 6}>
        <Rotulo>Accesos rápidos</Rotulo>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 14,
          }}
        >
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
                  height: 58,
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 19,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  background: esCobranza ? ACENTO : "#2c4a6e",
                  color: esCobranza ? "#1f1208" : "white",
                  opacity: t,
                  transform: `scale(${(0.7 + t * 0.3) * (1 - pulsado * 0.08)})`,
                  boxShadow: esCobranza
                    ? `0 0 ${pulsado * 40}px rgba(255,140,66,0.9)`
                    : "none",
                }}
              >
                {a}
              </div>
            );
          })}
        </div>
      </Vidrio>

      {/* Payment plan */}
      <Vidrio top={950} height={640} desde={FILAS_DESDE - 8}>
        <Rotulo>Plan de pagos</Rotulo>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: 46,
            borderRadius: 10,
            background: "rgba(255,255,255,0.08)",
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: 1,
            color: TEXTO_2,
            textTransform: "uppercase",
            paddingLeft: 10,
          }}
        >
          <div style={{ width: COL.n }}>Cta</div>
          <div style={{ width: COL.vto }}>Vencimiento</div>
          <div style={{ width: COL.cuota, textAlign: "right" }}>Cuota</div>
          <div style={{ width: COL.adeudado, textAlign: "right" }}>
            Adeudado
          </div>
          <div style={{ width: COL.estado, marginLeft: 24 }}>Estado</div>
        </div>
        {CUOTAS.map((c, i) => {
          const t = spring({
            frame: frame - FILAS_DESDE - i * 5,
            fps,
            config: { damping: 16, stiffness: 140 },
          });
          const estaPagada = c.pagado ? 1 : i === 1 ? pago : 0;
          const deuda = c.pagado ? 0 : c.cuota * (1 - (i === 1 ? pago : 0));
          return (
            <div
              key={c.n}
              style={{
                display: "flex",
                alignItems: "center",
                height: 84,
                paddingLeft: 10,
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                fontSize: 23,
                fontWeight: 500,
                opacity: t,
                transform: `translateX(${(1 - t) * 80}px)`,
                background:
                  i === 1 ? `rgba(34,197,94,${destello * 0.18})` : undefined,
                borderRadius: 10,
              }}
            >
              <div style={{ width: COL.n, fontWeight: 700 }}>{c.n}</div>
              <div style={{ width: COL.vto, color: TEXTO_2 }}>{c.vto}</div>
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
              <div style={{ marginLeft: 24 }}>
                <Estado pagado={estaPagada} />
              </div>
            </div>
          );
        })}
        {/* Summary */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginTop: 26,
            opacity: interpolate(
              frame,
              [FILAS_DESDE + 30, FILAS_DESDE + 45],
              [0, 1],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            ),
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: 2,
              color: TEXTO_2,
              textTransform: "uppercase",
            }}
          >
            Saldo adeudado
          </div>
          <div style={{ fontSize: 40, fontWeight: 800 }}>
            {pesos(adeudadoAhora)}
          </div>
        </div>
      </Vidrio>

      {/* Cursor pressing "Cobranza" */}
      {(() => {
        const llega = interpolate(frame, [CLIC - 30, CLIC], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.inOut(Easing.cubic),
        });
        const sale = interpolate(frame, [PAGO + 20, PAGO + 35], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        if (llega <= 0) {
          return null;
        }
        const x = interpolate(llega, [0, 1], [760, 255]);
        const y = interpolate(llega, [0, 1], [1500, 818]);
        return (
          <svg
            width={44}
            height={52}
            viewBox="0 0 22 26"
            style={{
              position: "absolute",
              left: x,
              top: y,
              opacity: Math.min(llega * 3, sale),
              transform: `scale(${1 - pulsado * 0.15})`,
              filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.5))",
            }}
          >
            <path
              d="M2 1 L2 20 L7 15.5 L10.5 23.5 L13.5 22 L10 14.5 L17 14.5 Z"
              fill="white"
              stroke="#111"
              strokeWidth={1.2}
            />
          </svg>
        );
      })()}
    </AbsoluteFill>
  );
};
