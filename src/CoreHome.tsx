import {
  AbsoluteFill,
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

// Core de Préstamos home (1080x1920, 10s): the app's home screen sits in a
// monitor; the day's indicators peel off it with their numbers counting
// up, then each of the 13 modules peels off from its place on the screen
// into a two-column list below, its origin glowing as it leaves.

export const coreHomeSchema = z.object({
  fondo: z.enum(["ondas", "red", "aurora", "geometrico"]),
  paleta: z.enum(["azul", "gris"]),
});

const FUENTE = "Montserrat, sans-serif";
const ACENTO = "#FF8C42";
const TEXTO_2 = "#b8bcc4";

// Screenshot (browser bar and taskbar cropped) and where it sits.
const CAPTURA = { w: 1913, h: 945 };
const PANTALLA_W = 900;
const ESCALA = PANTALLA_W / CAPTURA.w;
const PANTALLA_H = CAPTURA.h * ESCALA;
const BISEL = 14;
const MONITOR_X = (1080 - PANTALLA_W) / 2 - BISEL;
const MONITOR_Y = 370;
const PANTALLA_X = MONITOR_X + BISEL;
const PANTALLA_Y = MONITOR_Y + BISEL;

// Point in screenshot pixels -> point on the video.
const enPantalla = (x: number, y: number) => ({
  x: PANTALLA_X + x * ESCALA,
  y: PANTALLA_Y + y * ESCALA,
});

const KPIS = [
  {
    etiqueta: "Altas",
    valor: 24,
    formato: (n: number) => `${Math.round(n)}`,
    origen: [1390, 110],
  },
  {
    etiqueta: "Monto altas",
    valor: 3.2,
    formato: (n: number) =>
      `$ ${n.toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} MM`,
    origen: [1540, 110],
  },
  {
    etiqueta: "Pagos",
    valor: 39,
    formato: (n: number) => `${Math.round(n)}`,
    origen: [1670, 110],
  },
  {
    etiqueta: "Monto pagos",
    valor: 2.7,
    formato: (n: number) =>
      `$ ${n.toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} MM`,
    origen: [1815, 110],
  },
];

// Modules in screen order, with their icon centers in the screenshot.
const MODULOS: { nombre: string; x: number; y: number }[] = [
  { nombre: "Consultar Préstamos", x: 218, y: 224 },
  { nombre: "Cliente", x: 648, y: 224 },
  { nombre: "Alta de Préstamo", x: 1078, y: 224 },
  { nombre: "Tesorería", x: 1508, y: 214 },
  { nombre: "Operaciones", x: 218, y: 374 },
  { nombre: "Operaciones Especiales", x: 648, y: 374 },
  { nombre: "Reportes de Gestión", x: 1078, y: 374 },
  { nombre: "Reportes Operativos", x: 1508, y: 374 },
  { nombre: "Configuración", x: 218, y: 534 },
  { nombre: "Contabilidad", x: 648, y: 534 },
  { nombre: "Control de Cambios", x: 1078, y: 532 },
  { nombre: "Cesión de Cartera", x: 1508, y: 534 },
  { nombre: "Admin Sistemas", x: 218, y: 694 },
];

// Timeline (frames).
const MONITOR = 8;
const KPI_DESDE = 40;
const KPI_ESCALON = 8;
const MODULO_DESDE = 88;
const MODULO_ESCALON = 6;

// Destination layout.
const KPI_Y = 920;
const KPI_W = 206;
const KPI_GAP = 12;
const LISTA_Y = 1080;
const CHIP_W = 434;
const CHIP_H = 70;
const CHIP_GAP = 12;

const Kpi: React.FC<{ i: number }> = ({ i }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = KPIS[i];
  const t = spring({
    frame: frame - (KPI_DESDE + i * KPI_ESCALON),
    fps,
    config: { damping: 16, stiffness: 100 },
  });
  const o = enPantalla(k.origen[0], k.origen[1]);
  const fx = 540 - (KPI_W * 4 + KPI_GAP * 3) / 2 + i * (KPI_W + KPI_GAP);
  const x = interpolate(t, [0, 1], [o.x - KPI_W / 2, fx]);
  const y = interpolate(t, [0, 1], [o.y - 60, KPI_Y]);
  const conteo =
    k.valor *
    interpolate(t, [0.3, 1], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: KPI_W,
        height: 120,
        transform: `scale(${interpolate(t, [0, 1], [0.3, 1])})`,
        opacity: interpolate(t, [0, 0.15], [0, 1], {
          extrapolateRight: "clamp",
        }),
        borderRadius: 18,
        background: "rgba(22,24,29,0.72)",
        border: "2px solid rgba(255,255,255,0.14)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        backdropFilter: "blur(16px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
      }}
    >
      <div
        style={{
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: 1.5,
          textTransform: "uppercase",
          color: TEXTO_2,
        }}
      >
        {k.etiqueta}
      </div>
      <div style={{ fontSize: 36, fontWeight: 800, color: "white" }}>
        {k.formato(conteo)}
      </div>
    </div>
  );
};

const Modulo: React.FC<{ i: number }> = ({ i }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const m = MODULOS[i];
  const t = spring({
    frame: frame - (MODULO_DESDE + i * MODULO_ESCALON),
    fps,
    config: { damping: 16, stiffness: 110 },
  });
  const o = enPantalla(m.x, m.y);
  const col = i % 2;
  const fila = Math.floor(i / 2);
  const fx = 540 - CHIP_W - CHIP_GAP / 2 + col * (CHIP_W + CHIP_GAP);
  const fy = LISTA_Y + fila * (CHIP_H + CHIP_GAP);
  // The chip starts as the icon on the screen and grows into the list.
  const x = interpolate(t, [0, 1], [o.x - 23, fx]);
  const y = interpolate(t, [0, 1], [o.y - 23, fy]);
  const w = interpolate(t, [0, 1], [46, CHIP_W]);
  const h = interpolate(t, [0, 1], [46, CHIP_H]);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        opacity: interpolate(t, [0, 0.1], [0, 1], {
          extrapolateRight: "clamp",
        }),
        borderRadius: 16,
        background: `rgba(22,24,29,${interpolate(t, [0, 1], [0, 0.72])})`,
        border: `2px solid rgba(255,255,255,${interpolate(t, [0, 1], [0, 0.14])})`,
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        display: "flex",
        alignItems: "center",
        gap: 16,
        paddingLeft: interpolate(t, [0, 1], [0, 14]),
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <Img
        src={staticFile(`core/icono-${i + 1}.png`)}
        style={{ width: 42, height: 42, borderRadius: 10, flexShrink: 0 }}
      />
      <div
        style={{
          fontSize: 23,
          fontWeight: 700,
          color: "white",
          whiteSpace: "nowrap",
          opacity: interpolate(t, [0.5, 1], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {m.nombre}
      </div>
    </div>
  );
};

// Orange ring on the screen where a module or indicator is leaving from.
const Destello: React.FC<{
  x: number;
  y: number;
  desde: number;
  r: number;
}> = ({ x, y, desde, r }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [desde, desde + 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (t <= 0 || t >= 1) {
    return null;
  }
  const p = enPantalla(x, y);
  return (
    <div
      style={{
        position: "absolute",
        left: p.x,
        top: p.y,
        width: r * 2 * (0.6 + t * 0.8),
        height: r * 2 * (0.6 + t * 0.8),
        transform: "translate(-50%, -50%)",
        borderRadius: "50%",
        border: `3px solid ${ACENTO}`,
        opacity: 1 - t,
        boxShadow: `0 0 18px ${ACENTO}`,
      }}
    />
  );
};

export const CoreHome: React.FC<z.infer<typeof coreHomeSchema>> = ({
  fondo,
  paleta,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titulo = spring({ frame, fps, config: { damping: 18 } });
  const monitor = spring({
    frame: frame - MONITOR,
    fps,
    config: { damping: 16, stiffness: 90 },
  });

  return (
    <AbsoluteFill style={{ fontFamily: FUENTE }}>
      <FondoAbstracto paleta={paleta} estilo={fondo} />
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 170,
          width: "100%",
          textAlign: "center",
          opacity: titulo,
          transform: `translateY(${(1 - titulo) * -30}px)`,
        }}
      >
        <div style={{ fontSize: 62, fontWeight: 800, color: "white" }}>
          Core de Préstamos
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
          Toda tu cartera en un solo lugar
        </div>
      </div>
      {/* Monitor with the app's home screen */}
      <div
        style={{
          position: "absolute",
          left: MONITOR_X,
          top: MONITOR_Y,
          opacity: monitor,
          transform: `translateY(${(1 - monitor) * 120}px) scale(${0.9 + monitor * 0.1})`,
          transformOrigin: "50% 100%",
        }}
      >
        <div
          style={{
            width: PANTALLA_W + BISEL * 2,
            height: PANTALLA_H + BISEL * 2,
            borderRadius: 22,
            background: "#0e0f12",
            border: "2px solid rgba(255,255,255,0.12)",
            boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
            padding: BISEL,
            boxSizing: "border-box",
          }}
        >
          <Img
            src={staticFile("core-home.png")}
            style={{
              width: PANTALLA_W,
              height: PANTALLA_H,
              borderRadius: 8,
              display: "block",
            }}
          />
        </div>
        {/* Stand */}
        <div
          style={{
            width: 160,
            height: 34,
            margin: "0 auto",
            background: "linear-gradient(#2a2d33, #1a1c20)",
            clipPath: "polygon(18% 0, 82% 0, 100% 100%, 0 100%)",
          }}
        />
        <div
          style={{
            width: 260,
            height: 8,
            margin: "0 auto",
            borderRadius: 4,
            background: "#2a2d33",
          }}
        />
      </div>
      {KPIS.map((k, i) => (
        <Destello
          key={k.etiqueta}
          x={k.origen[0]}
          y={k.origen[1]}
          desde={KPI_DESDE + i * KPI_ESCALON}
          r={40}
        />
      ))}
      {MODULOS.map((m, i) => (
        <Destello
          key={m.nombre}
          x={m.x}
          y={m.y}
          desde={MODULO_DESDE + i * MODULO_ESCALON}
          r={24}
        />
      ))}
      {KPIS.map((k, i) => (
        <Kpi key={k.etiqueta} i={i} />
      ))}
      {MODULOS.map((m, i) => (
        <Modulo key={m.nombre} i={i} />
      ))}
    </AbsoluteFill>
  );
};
