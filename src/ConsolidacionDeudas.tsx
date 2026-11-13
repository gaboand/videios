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

// Debt consolidation (13s, 9:16 on a phone or 16:9 on a notebook): in the
// Core Lending "Consolidaciones" screen, Delfina Martinez looks up Javier
// Perez, ticks his five loans in arrears, confirms in a modal and a new
// loan for the total is created while the old ones turn "Cancelada".

export const consolidacionSchema = z.object({
  fondo: z.enum(["ondas", "red", "aurora", "geometrico"]),
  paleta: z.enum(["azul", "gris"]),
  dispositivo: z.enum(["celular", "notebook"]),
});

const FUENTE = "Montserrat, sans-serif";
const ACENTO = "#FF8C42";
const TINTA = "#1f2430";
const TINTA_2 = "#6b7280";
const BORDE = "#e1e5ec";
const NAVY = "#14284b";
const VERDE = "#1e6b3a";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const CONSOLIDACION_FRAMES = 390;

type Prestamo = {
  codigo: string;
  capital: number;
  plazo: number;
  mora: number; // days past due, 0 = up to date
  saldo: number;
  alta: string;
};
const PRESTAMOS: Prestamo[] = [
  { codigo: "2026091800003", capital: 1500000, plazo: 12, mora: 26, saldo: 1438221.58, alta: "18/9/2026" },
  { codigo: "2026091800002", capital: 1500000, plazo: 6, mora: 26, saldo: 1681499.34, alta: "18/9/2026" },
  { codigo: "2026091800001", capital: 1500000, plazo: 6, mora: 26, saldo: 1681499.34, alta: "18/9/2026" },
  { codigo: "2026082900003", capital: 1500000, plazo: 24, mora: 45, saldo: 1681498.88, alta: "29/8/2026" },
  { codigo: "2026082900002", capital: 250000, plazo: 4, mora: 45, saldo: 320582.14, alta: "29/8/2026" },
  { codigo: "2026082900001", capital: 250000, plazo: 2, mora: 0, saldo: 0, alta: "29/8/2026" },
  { codigo: "2026081600001", capital: 994666, plazo: 12, mora: 0, saldo: 0, alta: "16/8/2026" },
  { codigo: "2026081300003", capital: 1999639.67, plazo: 18, mora: 0, saldo: 0, alta: "13/8/2026" },
];
const SELECCION = 5;
const TOTAL = PRESTAMOS.slice(0, SELECCION).reduce((a, p) => a + p.saldo, 0);
const NUEVO = "2026111300001";

// Timeline (frames).
const CLIC_INPUT = 20;
const TIPEO = [24, 48];
const CLIC_BUSCAR = 62;
const RESULTADOS = 68;
const CLIC_FILA = (i: number) => 106 + i * 14;
const CLIC_CONTINUAR = 184;
const MODAL = 188;
const CLIC_CONFIRMAR = 246;
const FIN_MODAL = 274;
const CANCELA = 284;
const ALTA = 294;
const TOAST = 302;

const pesos = (n: number) =>
  `$ ${n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const lay = (chico: boolean) =>
  chico
    ? {
        w: 390,
        h: 844,
        HEADER: 74,
        SIDE: 0,
        colX: 12,
        colW: 366,
        busq: { x: 12, y: 86, w: 366, h: 100, pad: 14, btnW: 88 },
        clienteY: 196,
        clienteH: 40,
        etiquetaY: 248,
        tablaY: 270,
        cabH: 0,
        filaH: 50,
        pieGap: 10,
        pieH: 64,
        contW: 118,
        modal: { x: 12, y: 120, w: 366, h: 600 },
      }
    : {
        w: 1280,
        h: 800,
        HEADER: 58,
        SIDE: 54,
        colX: 137,
        colW: 1060,
        busq: { x: 437, y: 76, w: 460, h: 104, pad: 16, btnW: 100 },
        clienteY: 196,
        clienteH: 44,
        etiquetaY: 250,
        tablaY: 272,
        cabH: 34,
        filaH: 44,
        pieGap: 8,
        pieH: 54,
        contW: 130,
        modal: { x: 330, y: 165, w: 620, h: 490 },
      };
type Lay = ReturnType<typeof lay>;

// Window-local click targets.
const objetivos = (L: Lay) => {
  const b = L.busq;
  const pieY = L.tablaY + L.cabH + PRESTAMOS.length * L.filaH + L.pieGap;
  return {
    input: { x: b.x + b.pad + 60, y: b.y + 44 + 20 },
    buscar: { x: b.x + b.w - b.pad - b.btnW / 2, y: b.y + 44 + 20 },
    fila: (i: number) => ({
      x: L.colX + (L.SIDE ? 16 : 12) + 9,
      y: L.tablaY + L.cabH + i * L.filaH + L.filaH / 2,
    }),
    continuar: {
      x: L.colX + L.colW - (L.SIDE ? 16 : 12) - L.contW / 2,
      y: pieY + L.pieH / 2,
    },
    confirmar: {
      x: L.modal.x + L.modal.w - (L.SIDE ? 20 : 14) - 95,
      y: L.modal.y + L.modal.h - 36,
    },
  };
};

// Cursor path: [arrival frame, target, travel frames].
const recorrido = (L: Lay) => {
  const o = objetivos(L);
  return [
    { f: 0, p: { x: L.w * 0.62, y: L.h * 0.85 }, d: 0 },
    { f: CLIC_INPUT - 2, p: o.input, d: 16 },
    { f: CLIC_BUSCAR - 2, p: o.buscar, d: 12 },
    ...Array.from({ length: SELECCION }).map((_, i) => ({
      f: CLIC_FILA(i) - 2,
      p: o.fila(i),
      d: i === 0 ? 24 : 10,
    })),
    { f: CLIC_CONTINUAR - 3, p: o.continuar, d: 16 },
    { f: CLIC_CONFIRMAR - 4, p: o.confirmar, d: 18 },
    { f: CLIC_CONFIRMAR + 60, p: { x: o.confirmar.x + 120, y: o.confirmar.y + 70 }, d: 30 },
  ];
};
const CLICS = [
  CLIC_INPUT,
  CLIC_BUSCAR,
  ...Array.from({ length: SELECCION }).map((_, i) => CLIC_FILA(i)),
  CLIC_CONTINUAR,
  CLIC_CONFIRMAR,
];

const posicionCursor = (L: Lay, frame: number) => {
  const r = recorrido(L);
  let pos = r[0].p;
  for (let i = 1; i < r.length; i++) {
    const k = r[i];
    if (frame >= k.f) {
      pos = k.p;
      continue;
    }
    if (frame >= k.f - k.d) {
      const t = interpolate(frame, [k.f - k.d, k.f], [0, 1], {
        ...clamp,
        easing: Easing.inOut(Easing.cubic),
      });
      pos = { x: pos.x + (k.p.x - pos.x) * t, y: pos.y + (k.p.y - pos.y) * t };
    }
    break;
  }
  return pos;
};

const Check: React.FC<{ t: number; size?: number }> = ({ t, size = 18 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: 4,
      boxSizing: "border-box",
      border: `2px solid ${t > 0.5 ? NAVY : "#9aa3b2"}`,
      background: t > 0.5 ? NAVY : "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transform: `scale(${1 + Math.sin(t * Math.PI) * 0.25})`,
    }}
  >
    {t > 0.5 ? (
      <svg width={size - 6} height={size - 6} viewBox="0 0 12 12">
        <path
          d="M2 6.5 L5 9 L10 3"
          fill="none"
          stroke="white"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={14}
          strokeDashoffset={14 * (1 - Math.min(1, (t - 0.5) * 2))}
        />
      </svg>
    ) : null}
  </div>
);

const Chip: React.FC<{ texto: string; fondo: string; color: string; fs: number }> = ({
  texto,
  fondo,
  color,
  fs,
}) => (
  <span
    style={{
      fontSize: fs,
      fontWeight: 700,
      padding: "3px 9px",
      borderRadius: 6,
      background: fondo,
      color,
      letterSpacing: 0.3,
      whiteSpace: "nowrap",
    }}
  >
    {texto}
  </span>
);

const Estado: React.FC<{ p: Prestamo; cancelada: number; fs: number; nuevo?: boolean }> = ({
  p,
  cancelada,
  fs,
  nuevo,
}) => {
  if (nuevo) {
    return <Chip texto="NUEVA · VIGENTE" fondo="#dcf3e3" color={VERDE} fs={fs} />;
  }
  if (cancelada > 0.5) {
    return <Chip texto="CANCELADA" fondo="#e5e7eb" color="#4b5563" fs={fs} />;
  }
  return p.mora ? (
    <Chip texto={`MORA ${p.mora} D`} fondo="#fde4e1" color="#b93a2e" fs={fs} />
  ) : (
    <span style={{ fontSize: fs + 1, color: NAVY }}>vigente</span>
  );
};

// Line icons for the sidebar, after the Core Lending menu.
const ICONOS = [
  "M4 11 L12 4 L20 11 V20 H14 V14 H10 V20 H4 Z", // home
  "M10 4 A6 6 0 1 1 10 16 A6 6 0 1 1 10 4 M15 15 L20 20", // search
  "M3 6 H21 V18 H3 Z M7 10 H11 M7 14 H15", // client card
  "M12 3 A9 9 0 1 1 12 21 A9 9 0 1 1 12 3 M12 8 V16 M8 12 H16", // new loan
  "M4 12 C4 8 8 6 12 6 C16 6 20 8 20 12 C20 15 18 17 16 18 V20 H13 V18.5 H11 V20 H8 V18 C6 17 4 15 4 12 M15 10 H15.5", // savings
  "M4 8 H20 M4 12 H20 M4 16 H20 M6 4 H18 V20 H6 Z", // portfolio
  "M8 6 A3 3 0 1 1 8 12 A3 3 0 1 1 8 6 M16 12 A3 3 0 1 1 16 18 A3 3 0 1 1 16 12 M8 3 V5 M8 13 V15 M16 9 V11 M16 19 V21", // consolidation
  "M12 3 A9 9 0 1 0 21 12 H12 Z M15 3.5 A9 9 0 0 1 20.5 9 H15 Z", // reports
  "M6 3 H15 L19 7 V21 H6 Z M9 12 H16 M9 16 H16", // document
  "M12 8 A4 4 0 1 1 12 16 A4 4 0 1 1 12 8 M12 2 V5 M12 19 V22 M2 12 H5 M19 12 H22 M5 5 L7 7 M17 17 L19 19 M5 19 L7 17 M17 7 L19 5", // settings
  "M6 3 H18 V21 H6 Z M9 7 H15 M9 11 H10 M14 11 H15 M9 15 H10 M14 15 H15", // calculator
  "M12 8 V12 L15 15 M4 12 A8 8 0 1 0 6.5 6.3 M4 4 V8 H8", // history
  "M4 9 H20 V19 H4 Z M8 9 V6 A4 4 0 0 1 16 6 V9 M9 14 H15", // robot
];
const ICONO_ACTIVO = 6;
const ICONOS_PIE = [
  "M12 4 A4 4 0 1 1 12 12 A4 4 0 1 1 12 4 M4 21 C5 15 19 15 20 21", // user
  "M10 4 H5 V20 H10 M14 8 L18 12 L14 16 M18 12 H9", // logout
];

const LOGO_W = 2028;
const LOGO_H = 693;

const App: React.FC<{ L: Lay; frame: number }> = ({ L, frame }) => {
  const { fps } = useVideoConfig();
  const chico = L.SIDE === 0;
  const b = L.busq;
  const o = objetivos(L);
  const fs = chico ? 0.88 : 1;

  const aparece = (desde: number) =>
    spring({ frame: frame - desde, fps, config: { damping: 16, stiffness: 120 } });

  const tipeado = "Javier Perez".slice(
    0,
    Math.round(interpolate(frame, TIPEO, [0, 12], clamp)),
  );
  const pulsado = (f: number) =>
    interpolate(frame, [f, f + 4, f + 12], [0, 1, 0], clamp);

  const marca = (i: number) =>
    i < SELECCION ? interpolate(frame, [CLIC_FILA(i), CLIC_FILA(i) + 8], [0, 1], clamp) : 0;
  const seleccionados = Array.from({ length: SELECCION }).filter(
    (_, i) => marca(i) > 0.5,
  ).length;
  const totalSel = PRESTAMOS.slice(0, SELECCION).reduce(
    (a, p, i) => a + p.saldo * marca(i),
    0,
  );

  const modal = spring({
    frame: frame - MODAL,
    fps,
    config: { damping: 16, stiffness: 140 },
  });
  const cierre = interpolate(frame, [FIN_MODAL, FIN_MODAL + 12], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  });
  const vModal = modal * (1 - cierre);
  const procesando = frame >= CLIC_CONFIRMAR + 2 && frame < FIN_MODAL;
  const cancelada = interpolate(frame, [CANCELA, CANCELA + 14], [0, 1], clamp);
  const alta = spring({ frame: frame - ALTA, fps, config: { damping: 15, stiffness: 110 } });
  const destello = interpolate(frame, [ALTA, ALTA + 10, ALTA + 70], [0, 1, 0.25], clamp);
  const toast = spring({ frame: frame - TOAST, fps, config: { damping: 15, stiffness: 120 } });
  const conteo = interpolate(frame, [MODAL + 10, MODAL + 40], [0, 1], clamp);

  const logoEsc = (chico ? 110 : 130) / LOGO_W;
  const filaY = (i: number) => L.tablaY + L.cabH + (i + alta) * L.filaH;
  const pieY = L.tablaY + L.cabH + (PRESTAMOS.length + alta) * L.filaH + L.pieGap;

  // Table columns (notebook).
  const COL = { codigo: 50, capital: 330, plazo: 400, estado: 430, cartera: 580, saldo: 870, alta: 910 };

  const filaNotebook = (p: Prestamo, i: number, nuevo: boolean) => {
    const m = nuevo ? 0 : marca(i);
    const c = !nuevo && i < SELECCION ? cancelada : 0;
    const t = nuevo ? alta : aparece(RESULTADOS + 4 + i * 3);
    return (
      <div
        key={p.codigo}
        style={{
          position: "absolute",
          left: L.colX,
          width: L.colW,
          top: nuevo ? L.tablaY + L.cabH : filaY(i),
          height: L.filaH,
          background: nuevo
            ? `rgba(30,140,70,${0.08 + destello * 0.14})`
            : m > 0.5 && c < 0.5
              ? "#eef3fc"
              : "white",
          borderBottom: `1px solid ${BORDE}`,
          fontSize: 14,
          color: TINTA,
          opacity: t * (1 - c * 0.45),
          transform: nuevo ? `scaleY(${alta})` : `translateX(${(1 - t) * 40}px)`,
          transformOrigin: "top",
        }}
      >
        <div style={{ position: "absolute", left: 16, top: L.filaH / 2 - 9 }}>
          {nuevo ? (
            <div style={{ fontSize: 16, color: VERDE, fontWeight: 800 }}>✓</div>
          ) : c > 0.5 ? null : (
            <Check t={m} />
          )}
        </div>
        {[
          { x: COL.codigo, v: p.codigo, b: nuevo },
          { x: COL.capital, v: pesos(p.capital), r: true },
          { x: COL.plazo, v: String(p.plazo), r: true },
          { x: COL.alta, v: p.alta },
        ].map((k) => (
          <div
            key={k.x}
            style={{
              position: "absolute",
              top: 0,
              height: L.filaH,
              display: "flex",
              alignItems: "center",
              fontWeight: k.b ? 800 : 500,
              ...(k.r ? { right: L.colW - k.x } : { left: k.x }),
            }}
          >
            {k.v}
          </div>
        ))}
        <div
          style={{
            position: "absolute",
            left: COL.estado,
            top: 0,
            height: L.filaH,
            display: "flex",
            alignItems: "center",
          }}
        >
          <Estado p={p} cancelada={c} fs={12} nuevo={nuevo} />
        </div>
        <div
          style={{
            position: "absolute",
            left: COL.cartera,
            top: 0,
            height: L.filaH,
            display: "flex",
            alignItems: "center",
          }}
        >
          <Chip texto="PROPIA" fondo="#e3f4f7" color="#147a8a" fs={11.5} />
        </div>
        <div
          style={{
            position: "absolute",
            right: L.colW - COL.saldo,
            top: 0,
            height: L.filaH,
            display: "flex",
            alignItems: "center",
            fontWeight: 700,
            textDecoration: c > 0.5 ? "line-through" : "none",
          }}
        >
          {p.saldo ? pesos(p.saldo) : "—"}
        </div>
      </div>
    );
  };

  const filaCelular = (p: Prestamo, i: number, nuevo: boolean) => {
    const m = nuevo ? 0 : marca(i);
    const c = !nuevo && i < SELECCION ? cancelada : 0;
    const t = nuevo ? alta : aparece(RESULTADOS + 4 + i * 3);
    return (
      <div
        key={p.codigo}
        style={{
          position: "absolute",
          left: L.colX,
          width: L.colW,
          top: nuevo ? L.tablaY : filaY(i),
          height: L.filaH,
          background: nuevo
            ? `rgba(30,140,70,${0.08 + destello * 0.14})`
            : m > 0.5 && c < 0.5
              ? "#eef3fc"
              : "white",
          borderBottom: `1px solid ${BORDE}`,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 12px",
          boxSizing: "border-box",
          opacity: t * (1 - c * 0.45),
          transform: nuevo ? `scaleY(${alta})` : `translateX(${(1 - t) * 30}px)`,
          transformOrigin: "top",
        }}
      >
        <div style={{ width: 18 }}>
          {nuevo ? (
            <div style={{ fontSize: 15, color: VERDE, fontWeight: 800 }}>✓</div>
          ) : c > 0.5 ? null : (
            <Check t={m} />
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: TINTA }}>{p.codigo}</div>
          <div
            style={{
              fontSize: 11,
              color: TINTA_2,
              marginTop: 2,
              textDecoration: c > 0.5 ? "line-through" : "none",
            }}
          >
            {p.saldo ? `Saldo ${pesos(p.saldo)}` : `Capital ${pesos(p.capital)}`} ·{" "}
            {p.plazo} ctas
          </div>
        </div>
        <Estado p={p} cancelada={c} fs={10.5} nuevo={nuevo} />
      </div>
    );
  };
  const fila = chico ? filaCelular : filaNotebook;
  const nuevoPrestamo: Prestamo = {
    codigo: NUEVO,
    capital: TOTAL,
    plazo: 18,
    mora: 0,
    saldo: TOTAL,
    alta: "13/11/2026",
  };

  const stats = [
    ["Total a cancelar", pesos(TOTAL * conteo)],
    ["Quita aplicada", pesos(0)],
    ["Capital nuevo", pesos(TOTAL * conteo)],
    ["Plazo", "18 cuotas"],
    ["TNA", "120,00%"],
    ["Primer vencimiento", "15/12/2026"],
  ];

  return (
    <div
      style={{
        position: "relative",
        width: L.w,
        height: L.h,
        background: "#f1f3f6",
        fontFamily: FUENTE,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: L.w,
          height: L.HEADER,
          background: "#4a4a4a",
          display: "flex",
          alignItems: "center",
          paddingTop: chico ? 26 : 0,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            position: "relative",
            marginLeft: chico ? 16 : 22,
            width: LOGO_W * logoEsc,
            height: LOGO_H * logoEsc,
          }}
        >
          {["axonia-letras.png", "axonia-icono.png"].map((f) => (
            <Img
              key={f}
              src={staticFile(f)}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
            />
          ))}
        </div>
        <div
          style={{
            flex: 1,
            textAlign: "center",
            color: "white",
            fontSize: chico ? 12 : 15,
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          CONSOLIDACIONES
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginRight: chico ? 14 : 24,
          }}
        >
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#d6d9de" }} />
          {chico ? null : (
            <div style={{ color: "white", fontSize: 14, fontWeight: 700 }}>
              Delfina Martinez
            </div>
          )}
        </div>
      </div>
      {/* Sidebar */}
      {chico ? null : (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: L.HEADER,
            bottom: 0,
            width: L.SIDE,
            background: "#1c1d21",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: 20,
            gap: 22,
          }}
        >
          {ICONOS.map((d, i) => (
            <svg key={i} width={22} height={22} viewBox="0 0 24 24">
              <path
                d={d}
                fill="none"
                stroke={i === ICONO_ACTIVO ? ACENTO : "#e5e7eb"}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ))}
          <div style={{ flex: 1 }} />
          {ICONOS_PIE.map((d, i) => (
            <svg key={`p${i}`} width={22} height={22} viewBox="0 0 24 24">
              <path
                d={d}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ))}
          <div style={{ height: 6 }} />
        </div>
      )}

      {/* Search */}
      <div
        style={{
          position: "absolute",
          left: b.x,
          top: b.y,
          width: b.w,
          height: b.h,
          background: "white",
          borderRadius: 12,
          border: `1px solid ${BORDE}`,
          boxShadow: "0 2px 10px rgba(20,30,50,0.05)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: b.pad,
            top: chico ? 12 : 16,
            fontSize: 14 * fs,
            color: TINTA,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <svg width={16} height={16} viewBox="0 0 16 16">
            <circle cx={6} cy={5} r={3.2} fill={NAVY} />
            <path d="M0.5 15 C1 10.5 11 10.5 11.5 15 Z" fill={NAVY} />
          </svg>
          Buscar préstamos por cliente
        </div>
        <div
          style={{
            position: "absolute",
            left: b.pad,
            top: 44,
            width: b.w - b.pad * 2 - b.btnW - 10,
            height: 40,
            border: `1px solid ${frame >= CLIC_INPUT && frame < CLIC_BUSCAR ? "#7aa2e3" : "#cfd5de"}`,
            borderRadius: 8,
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            padding: "0 14px",
            fontSize: 15 * fs,
            color: TINTA,
          }}
        >
          {tipeado}
          {frame >= CLIC_INPUT && frame < CLIC_BUSCAR && Math.floor(frame / 8) % 2 === 0 ? (
            <span style={{ width: 1.5, height: 18, background: TINTA, marginLeft: 1 }} />
          ) : null}
        </div>
        <div
          style={{
            position: "absolute",
            right: b.pad,
            top: 44,
            width: b.btnW,
            height: 40,
            borderRadius: 8,
            background: NAVY,
            color: "white",
            fontSize: 14 * fs,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${1 - pulsado(CLIC_BUSCAR) * 0.07})`,
          }}
        >
          Buscar
        </div>
      </div>

      {/* Client */}
      <div
        style={{
          position: "absolute",
          left: L.colX,
          top: L.clienteY,
          width: L.colW,
          height: L.clienteH,
          background: "white",
          borderRadius: 10,
          border: `1px solid ${BORDE}`,
          display: "flex",
          alignItems: "center",
          padding: `0 ${chico ? 12 : 22}px`,
          boxSizing: "border-box",
          opacity: aparece(RESULTADOS),
          transform: `translateY(${(1 - aparece(RESULTADOS)) * 14}px)`,
        }}
      >
        <svg width={14} height={14} viewBox="0 0 16 16" style={{ marginRight: 8 }}>
          <circle cx={8} cy={5} r={3.5} fill={NAVY} />
          <path d="M1.5 15.5 C2 10 14 10 14.5 15.5 Z" fill={NAVY} />
        </svg>
        <div style={{ flex: 1, fontSize: 15 * fs, fontWeight: 700, color: TINTA }}>
          JAVIER PEREZ
        </div>
        <div style={{ fontSize: 13 * fs, color: TINTA }}>
          Préstamos elegibles: <b>8</b>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: L.colX + 4,
          top: L.etiquetaY,
          fontSize: 13.5 * fs,
          color: TINTA,
          opacity: aparece(RESULTADOS + 4),
        }}
      >
        Seleccioná los préstamos a consolidar (mínimo 2)
      </div>

      {/* Table */}
      <div
        style={{
          position: "absolute",
          left: L.colX,
          top: L.tablaY,
          width: L.colW,
          height: L.cabH + (PRESTAMOS.length + alta) * L.filaH,
          background: "white",
          borderRadius: 10,
          border: `1px solid ${BORDE}`,
          opacity: aparece(RESULTADOS + 2),
        }}
      />
      {chico ? null : (
        <div
          style={{
            position: "absolute",
            left: L.colX,
            top: L.tablaY,
            width: L.colW,
            height: L.cabH,
            fontSize: 11.5,
            fontWeight: 700,
            letterSpacing: 0.8,
            color: TINTA_2,
            opacity: aparece(RESULTADOS + 2),
            borderBottom: `1px solid ${BORDE}`,
          }}
        >
          {[
            ["CÓDIGO", COL.codigo, false],
            ["CAPITAL", COL.capital, true],
            ["PLAZO", COL.plazo, true],
            ["ESTADO", COL.estado, false],
            ["CARTERA", COL.cartera, false],
            ["SALDO CANCEL.", COL.saldo, true],
            ["ALTA", COL.alta, false],
          ].map(([t, x, r]) => (
            <div
              key={t as string}
              style={{
                position: "absolute",
                top: 0,
                height: L.cabH,
                display: "flex",
                alignItems: "center",
                ...(r ? { right: L.colW - (x as number) } : { left: x as number }),
              }}
            >
              {t}
            </div>
          ))}
        </div>
      )}
      {PRESTAMOS.map((p, i) => fila(p, i, false))}
      {alta > 0.001 ? fila(nuevoPrestamo, 0, true) : null}

      {/* Footer */}
      <div
        style={{
          position: "absolute",
          left: L.colX,
          top: pieY,
          width: L.colW,
          height: L.pieH,
          background: "white",
          borderRadius: 10,
          border: `1px solid ${BORDE}`,
          display: "flex",
          alignItems: "center",
          padding: `0 ${chico ? 12 : 16}px`,
          boxSizing: "border-box",
          fontSize: 13.5 * fs,
          color: TINTA,
          opacity: aparece(RESULTADOS + 30),
        }}
      >
        <div style={{ flex: 1, position: "relative", height: "100%" }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: chico ? "column" : "row",
              justifyContent: chico ? "center" : "flex-start",
              alignItems: chico ? "flex-start" : "center",
              gap: chico ? 3 : 22,
              opacity: 1 - cancelada,
            }}
          >
            <div>
              Seleccionados: <b>{seleccionados}</b>
            </div>
            <div>
              Total cancelación:{" "}
              <b style={{ color: NAVY }}>{pesos(totalSel)}</b>
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              color: VERDE,
              fontWeight: 700,
              opacity: cancelada,
            }}
          >
            ✓ Nueva operación {NUEVO} por {pesos(TOTAL)}
          </div>
        </div>
        <div
          style={{
            width: L.contW,
            height: chico ? 40 : 38,
            borderRadius: 8,
            background: NAVY,
            color: "white",
            fontWeight: 700,
            fontSize: 14 * fs,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: (seleccionados >= 2 ? 1 : 0.45) * (1 - cancelada),
            transform: `scale(${1 - pulsado(CLIC_CONTINUAR) * 0.07})`,
            flexShrink: 0,
          }}
        >
          Continuar →
        </div>
      </div>

      {/* Confirmation modal */}
      {vModal > 0.001 ? (
        <>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `rgba(40,48,64,${0.45 * vModal})`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: L.modal.x,
              top: L.modal.y,
              width: L.modal.w,
              height: L.modal.h,
              background: "white",
              borderRadius: 14,
              boxShadow: "0 24px 60px rgba(10,20,40,0.35)",
              opacity: vModal,
              transform: `scale(${0.9 + vModal * 0.1}) translateY(${(1 - modal) * 30}px)`,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: 52,
                display: "flex",
                alignItems: "center",
                padding: `0 ${chico ? 16 : 22}px`,
                borderBottom: `1px solid ${BORDE}`,
                fontSize: 16 * fs,
                fontWeight: 700,
                color: TINTA,
              }}
            >
              <div style={{ flex: 1 }}>Confirmar consolidación</div>
              <div style={{ color: TINTA_2, fontSize: 22, fontWeight: 500 }}>×</div>
            </div>
            <div style={{ padding: chico ? "14px 16px" : "18px 22px" }}>
              <div style={{ fontSize: 13 * fs, color: TINTA, lineHeight: 1.45 }}>
                Vas a cancelar los siguientes préstamos y dar de alta una nueva
                operación. Revisá el resumen antes de confirmar.
              </div>
              <div style={{ fontSize: 12.5 * fs, color: TINTA_2, marginTop: 12 }}>
                Operaciones a cancelar:
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 8 }}>
                {PRESTAMOS.slice(0, SELECCION).map((p, i) => (
                  <div
                    key={p.codigo}
                    style={{
                      fontSize: 12 * fs,
                      color: "#1f4e9c",
                      border: "1px solid #b9cdf0",
                      background: "#eef4ff",
                      borderRadius: 14,
                      padding: "4px 10px",
                      opacity: interpolate(frame, [MODAL + 6 + i * 3, MODAL + 12 + i * 3], [0, 1], clamp),
                    }}
                  >
                    {p.codigo}
                  </div>
                ))}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${chico ? 2 : 3}, 1fr)`,
                  gap: chico ? 8 : 12,
                  marginTop: 16,
                }}
              >
                {stats.map(([k, v], i) => (
                  <div
                    key={k}
                    style={{
                      border: `1px solid ${i === 2 ? "#b9cdf0" : BORDE}`,
                      background: i === 2 ? "#eef4ff" : "white",
                      borderRadius: 10,
                      padding: chico ? "10px 12px" : "12px 16px",
                      opacity: interpolate(frame, [MODAL + 12 + i * 3, MODAL + 20 + i * 3], [0, 1], clamp),
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10.5 * fs,
                        letterSpacing: 0.8,
                        color: TINTA_2,
                        textTransform: "uppercase",
                      }}
                    >
                      {k}
                    </div>
                    <div
                      style={{
                        fontSize: (chico ? 15 : 18) * fs,
                        fontWeight: 700,
                        marginTop: 5,
                        color: i === 2 ? "#1f4e9c" : TINTA,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {v}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: 72,
                borderTop: `1px solid ${BORDE}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 10,
                padding: `0 ${chico ? 14 : 20}px`,
              }}
            >
              <div
                style={{
                  height: 42,
                  padding: "0 18px",
                  border: `1px solid #cfd5de`,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  fontSize: 13.5 * fs,
                  color: TINTA,
                }}
              >
                Cancelar
              </div>
              <div
                style={{
                  width: 190,
                  height: 42,
                  borderRadius: 8,
                  background: VERDE,
                  color: "white",
                  fontSize: 13.5 * fs,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transform: `scale(${1 - pulsado(CLIC_CONFIRMAR) * 0.07})`,
                }}
              >
                {procesando ? (
                  <>
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        border: "2px solid rgba(255,255,255,0.35)",
                        borderTopColor: "white",
                        transform: `rotate(${frame * 18}deg)`,
                      }}
                    />
                    Procesando…
                  </>
                ) : (
                  "Confirmar y procesar"
                )}
              </div>
            </div>
          </div>
        </>
      ) : null}

      {/* Toast */}
      {toast > 0.001 ? (
        <div
          style={{
            position: "absolute",
            right: chico ? 12 : 24,
            left: chico ? 12 : undefined,
            top: L.HEADER + 14,
            width: chico ? undefined : 380,
            background: "white",
            borderRadius: 10,
            borderLeft: `5px solid ${VERDE}`,
            boxShadow: "0 10px 30px rgba(10,20,40,0.2)",
            padding: "12px 16px",
            opacity: toast,
            transform: `translateY(${(1 - toast) * -30}px)`,
          }}
        >
          <div style={{ fontSize: 14.5 * fs, fontWeight: 800, color: VERDE }}>
            ✓ Consolidación procesada
          </div>
          <div style={{ fontSize: 12.5 * fs, color: TINTA, marginTop: 4, lineHeight: 1.4 }}>
            Alta de la operación {NUEVO} · 5 préstamos cancelados
          </div>
        </div>
      ) : null}

      {/* Pointer: arrow on the notebook, finger tap on the phone */}
      <Puntero L={L} frame={frame} chico={chico} objetivos={o} />
    </div>
  );
};

const Puntero: React.FC<{
  L: Lay;
  frame: number;
  chico: boolean;
  objetivos: ReturnType<typeof objetivos>;
}> = ({ L, frame, chico }) => {
  const pos = posicionCursor(L, frame);
  const clic = CLICS.find((f) => frame >= f && frame < f + 16);
  const onda = clic === undefined ? 0 : (frame - clic) / 16;
  const presion = clic === undefined ? 0 : interpolate(frame - clic, [0, 3, 8], [0, 1, 0], clamp);
  const visible =
    interpolate(frame, [6, 14], [0, 1], clamp) *
    (chico ? interpolate(frame, [CLIC_CONFIRMAR + 16, CLIC_CONFIRMAR + 26], [1, 0], clamp) : 1);
  return (
    <>
      {clic !== undefined ? (
        <div
          style={{
            position: "absolute",
            left: pos.x,
            top: pos.y,
            width: 16 + onda * 50,
            height: 16 + onda * 50,
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            border: `3px solid rgba(255,140,66,${1 - onda})`,
            background: `rgba(255,140,66,${(1 - onda) * 0.2})`,
          }}
        />
      ) : null}
      {chico ? (
        <div
          style={{
            position: "absolute",
            left: pos.x,
            top: pos.y,
            width: 34,
            height: 34,
            transform: `translate(-50%, -50%) scale(${1 - presion * 0.2})`,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.55)",
            border: "2px solid rgba(40,48,64,0.35)",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            opacity: visible * 0.9,
          }}
        />
      ) : (
        <svg
          width={26}
          height={26}
          viewBox="0 0 24 24"
          style={{
            position: "absolute",
            left: pos.x - 4,
            top: pos.y - 2,
            opacity: visible,
            transform: `scale(${1 - presion * 0.15})`,
            filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.35))",
          }}
        >
          <path
            d="M4 2 L4 19 L8.5 15 L11.5 21.5 L14.5 20 L11.5 13.8 L17.5 13.5 Z"
            fill="white"
            stroke="#111"
            strokeWidth={1.4}
            strokeLinejoin="round"
          />
        </svg>
      )}
    </>
  );
};

export const ConsolidacionDeudas: React.FC<z.infer<typeof consolidacionSchema>> = ({
  fondo,
  paleta,
  dispositivo,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const vertical = height > width;
  const chico = dispositivo === "celular";
  const L = lay(chico);
  const { w, h } = pantallaDe(dispositivo, vertical);
  const { W, H } = exteriorDe(dispositivo, w, h);
  const caja = vertical
    ? chico
      ? { cx: 540, cy: 1080, w: 960, h: 1440 }
      : { cx: 540, cy: 1010, w: 960, h: 1220 }
    : { cx: 960, cy: 540, w: 1560, h: 930 };
  const esc = Math.min(caja.w / W, caja.h / H);
  const t = spring({ frame, fps, config: { damping: 18, stiffness: 80 } });
  const flota = Math.sin(frame / 40) * 6;
  const giro = chico ? -14 : -10;
  const titulo = spring({ frame: frame - 4, fps, config: { damping: 18 } });

  return (
    <AbsoluteFill style={{ fontFamily: FUENTE }}>
      <FondoAbstracto paleta={paleta} estilo={fondo} />
      {vertical ? (
        <div
          style={{
            position: "absolute",
            top: 140,
            width: "100%",
            textAlign: "center",
            opacity: titulo,
            transform: `translateY(${(1 - titulo) * -30}px)`,
          }}
        >
          <div style={{ fontSize: 56, fontWeight: 800, color: "white" }}>
            Consolidación de deudas
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
            Varias deudas, una nueva operación
          </div>
        </div>
      ) : null}
      <AbsoluteFill style={{ perspective: 2400 }}>
        <div
          style={{
            position: "absolute",
            left: caja.cx,
            top: caja.cy,
            opacity: t,
            transform: `translate(-50%, -50%) translateY(${flota + (1 - t) * 120}px) scale(${esc}) rotateY(${giro + (1 - t) * 20}deg) rotateX(${chico ? 6 : 5}deg)`,
          }}
        >
          <Dispositivo tipo={dispositivo} w={w} h={h}>
            <App L={L} frame={frame} />
          </Dispositivo>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
