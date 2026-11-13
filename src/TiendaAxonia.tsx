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

// Axonia Online Store on a landscape tablet tilted to the other side (seen
// from the left), 16:9, 20s: home with hero and featured products, the
// Electronics catalog, a product page where the item is added to the cart,
// checkout paying with a personal loan, and the order confirmation. The
// products are drawn in code.

export const tiendaSchema = z.object({
  fondo: z.enum(["ondas", "red", "aurora", "geometrico"]),
  paleta: z.enum(["azul", "gris"]),
});

export const TIENDA_FRAMES = 600;

const FUENTE = "Montserrat, sans-serif";
const OSCURO = "#0b1220";
const OSCURO_2 = "#111a2c";
const AZUL = "#2f8cff";
const AZUL_BOTON = "#2556f5";
const TINTA = "#141821";
const TINTA_2 = "#6b7280";
const BORDE = "#e3e7ee";
const VERDE = "#1e8a4c";
const PW = 1180;
const PH = 820;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Timeline (frames).
const ESC = {
  home: [0, 156],
  catalogo: [150, 276],
  producto: [270, 396],
  checkout: [390, 526],
  confirmacion: [520, TIENDA_FRAMES + 10],
} as const;
type Escena = keyof typeof ESC;
const SCROLL_HOME = [46, 100];
const TAP_CELULARES = 138;
const TAP_PRODUCTO = 258;
const TAP_AGREGAR = 318;
const TAP_IR_CARRITO = 372;
const TAP_PRESTAMO = 436;
const TAP_CONTINUAR = 472;
const REVISION = 478;
const TAP_CONFIRMAR = 508;
const TAPS = [TAP_CELULARES, TAP_PRODUCTO, TAP_AGREGAR, TAP_IR_CARRITO, TAP_PRESTAMO, TAP_CONTINUAR, TAP_CONFIRMAR];

const pesos = (n: number) => `$${n.toLocaleString("es-AR")}`;
const pulsado = (frame: number, f: number) => interpolate(frame, [f, f + 4, f + 12], [0, 1, 0], clamp);

// ---------- Products, drawn in a 200 x 140 box ----------
// How a product photo is staged: phones use every option, other products
// ignore it.
type Vista = "par" | "frente" | "dorso" | "caja" | "solo" | "trio" | "lado";
type Producto = React.FC<{ id: string; vista?: Vista }>;

const Sombra: React.FC<{ cx?: number; rx?: number; y?: number }> = ({ cx = 100, rx = 70, y = 128 }) => (
  <ellipse cx={cx} cy={y} rx={rx} ry={6} fill="#0b1220" opacity={0.18} />
);

const Cartera: Producto = ({ id }) => (
  <svg viewBox="0 0 200 140" width="100%" height="100%">
    <defs>
      <linearGradient id={`${id}c`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#4c6ef5" />
        <stop offset="0.55" stopColor="#2541b2" />
        <stop offset="1" stopColor="#13216b" />
      </linearGradient>
      <linearGradient id={`${id}f`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#5c7cfa" />
        <stop offset="1" stopColor="#2b48c2" />
      </linearGradient>
      <linearGradient id={`${id}o`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fbe7a1" />
        <stop offset="1" stopColor="#b8892b" />
      </linearGradient>
    </defs>
    <Sombra rx={62} />
    <path d="M72 54 C70 22 130 22 128 54" fill="none" stroke="#16245e" strokeWidth={8} strokeLinecap="round" />
    <path d="M72 54 C71 28 129 28 128 54" fill="none" stroke="#3b5bdb" strokeWidth={3} strokeLinecap="round" opacity={0.6} />
    <path d="M48 54 L152 54 C156 54 158 57 158 61 L162 118 C162 123 158 126 153 126 L47 126 C42 126 38 123 38 118 L42 61 C42 57 44 54 48 54 Z" fill={`url(#${id}c)`} />
    <path d="M44 58 L156 58 L154 66 C130 84 70 84 46 66 Z" fill={`url(#${id}f)`} />
    <path d="M46 64 C70 82 130 82 154 64" fill="none" stroke="#9fb3ff" strokeWidth={1} strokeDasharray="3 2" opacity={0.7} />
    <path d="M44 122 L156 122" stroke="#9fb3ff" strokeWidth={1} strokeDasharray="3 2" opacity={0.5} />
    <rect x={91} y={76} width={18} height={13} rx={3} fill={`url(#${id}o)`} stroke="#8a6a1f" strokeWidth={0.8} />
    <rect x={97} y={80} width={6} height={5} rx={1} fill="#8a6a1f" />
    <rect x={64} y={48} width={8} height={10} rx={2} fill={`url(#${id}o)`} />
    <rect x={128} y={48} width={8} height={10} rx={2} fill={`url(#${id}o)`} />
    <path d="M50 70 C56 92 56 108 52 120" stroke="white" strokeWidth={4} opacity={0.12} strokeLinecap="round" />
  </svg>
);

const Reloj: Producto = ({ id }) => (
  <svg viewBox="0 0 200 140" width="100%" height="100%">
    <defs>
      <linearGradient id={`${id}m`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#e2e5ea" />
        <stop offset="0.5" stopColor="#9aa2ae" />
        <stop offset="1" stopColor="#5b616c" />
      </linearGradient>
      <linearGradient id={`${id}c`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2b4fb8" />
        <stop offset="1" stopColor="#152a6b" />
      </linearGradient>
      <radialGradient id={`${id}p`} cx="0.35" cy="0.3" r="0.8">
        <stop offset="0" stopColor="#1b2740" />
        <stop offset="1" stopColor="#05080f" />
      </radialGradient>
    </defs>
    <Sombra rx={40} y={132} />
    <path d="M80 6 L120 6 L116 40 L84 40 Z" fill={`url(#${id}c)`} />
    <path d="M84 100 L116 100 L120 134 L80 134 Z" fill={`url(#${id}c)`} />
    {[12, 20, 28].map((y) => (
      <rect key={y} x={86} y={y} width={28} height={2} rx={1} fill="#0f1f4d" opacity={0.5} />
    ))}
    {[110, 118, 126].map((y) => (
      <rect key={y} x={86} y={y} width={28} height={2} rx={1} fill="#0f1f4d" opacity={0.5} />
    ))}
    <rect x={64} y={32} width={72} height={76} rx={20} fill={`url(#${id}m)`} />
    <rect x={136} y={56} width={6} height={14} rx={3} fill="#7d838c" />
    <rect x={136} y={76} width={5} height={8} rx={2.5} fill="#7d838c" />
    <rect x={70} y={38} width={60} height={64} rx={15} fill={`url(#${id}p)`} />
    <circle cx={100} cy={70} r={22} fill="none" stroke="#1e293b" strokeWidth={4} />
    <path d="M100 48 A22 22 0 1 1 79 76" fill="none" stroke="#2f8cff" strokeWidth={4} strokeLinecap="round" />
    <path d="M100 54 A16 16 0 0 1 114 78" fill="none" stroke="#22c55e" strokeWidth={3.4} strokeLinecap="round" />
    <text x={100} y={74} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={12} fill="white">
      10:09
    </text>
    <text x={100} y={84} textAnchor="middle" fontFamily="Montserrat" fontWeight={500} fontSize={5} fill="#9fb2cc">
      8.420 pasos
    </text>
    <path d="M74 46 C80 40 90 40 96 42" stroke="white" strokeWidth={2.4} opacity={0.2} fill="none" strokeLinecap="round" />
  </svg>
);

const Anteojos: Producto = ({ id }) => (
  <svg viewBox="0 0 200 140" width="100%" height="100%">
    <defs>
      <linearGradient id={`${id}l`} x1="0" y1="0" x2="0.4" y2="1">
        <stop offset="0" stopColor="#3b2a1d" />
        <stop offset="0.55" stopColor="#7a4a22" />
        <stop offset="1" stopColor="#c27a32" />
      </linearGradient>
      <linearGradient id={`${id}m`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#2a2d33" />
        <stop offset="1" stopColor="#0f1114" />
      </linearGradient>
    </defs>
    <Sombra rx={74} y={112} />
    <path d="M14 50 L34 54" stroke={`url(#${id}m)`} strokeWidth={5} strokeLinecap="round" />
    <path d="M186 50 L166 54" stroke={`url(#${id}m)`} strokeWidth={5} strokeLinecap="round" />
    <path d="M24 52 C24 46 92 46 94 54 C96 72 88 92 62 92 C34 92 24 74 24 52 Z" fill={`url(#${id}l)`} stroke={`url(#${id}m)`} strokeWidth={5} />
    <path d="M106 54 C108 46 176 46 176 52 C176 74 166 92 138 92 C112 92 104 72 106 54 Z" fill={`url(#${id}l)`} stroke={`url(#${id}m)`} strokeWidth={5} />
    <path d="M94 56 C98 50 102 50 106 56" fill="none" stroke={`url(#${id}m)`} strokeWidth={5} />
    <path d="M34 58 C46 54 62 54 72 58 L40 82 C34 76 32 66 34 58 Z" fill="white" opacity={0.22} />
    <path d="M116 58 C128 54 144 54 154 58 L122 82 C116 76 114 66 116 58 Z" fill="white" opacity={0.22} />
    <circle cx={30} cy={53} r={2} fill="#d4af37" />
    <circle cx={170} cy={53} r={2} fill="#d4af37" />
  </svg>
);

const Auriculares: Producto = ({ id }) => (
  <svg viewBox="0 0 200 140" width="100%" height="100%">
    <defs>
      <linearGradient id={`${id}a`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#4a505b" />
        <stop offset="1" stopColor="#14161a" />
      </linearGradient>
      <radialGradient id={`${id}c`} cx="0.4" cy="0.35" r="0.7">
        <stop offset="0" stopColor="#5b616c" />
        <stop offset="1" stopColor="#1a1c20" />
      </radialGradient>
    </defs>
    <Sombra rx={60} />
    <path d="M54 84 C46 22 154 22 146 84" fill="none" stroke={`url(#${id}a)`} strokeWidth={11} strokeLinecap="round" />
    <path d="M70 36 C88 24 112 24 130 36" fill="none" stroke="#8a929e" strokeWidth={6} strokeLinecap="round" opacity={0.55} />
    <rect x={48} y={66} width={10} height={16} rx={3} fill="#9aa2ae" />
    <rect x={142} y={66} width={10} height={16} rx={3} fill="#9aa2ae" />
    <rect x={36} y={76} width={36} height={52} rx={16} fill={`url(#${id}c)`} />
    <rect x={128} y={76} width={36} height={52} rx={16} fill={`url(#${id}c)`} />
    <rect x={62} y={82} width={12} height={40} rx={6} fill="#2b2f36" />
    <rect x={126} y={82} width={12} height={40} rx={6} fill="#2b2f36" />
    <circle cx={50} cy={102} r={7} fill="none" stroke="#2f8cff" strokeWidth={2.4} />
    <circle cx={150} cy={102} r={7} fill="none" stroke="#2f8cff" strokeWidth={2.4} />
    <path d="M40 86 C40 80 46 78 50 78" stroke="white" strokeWidth={2.4} opacity={0.25} fill="none" strokeLinecap="round" />
  </svg>
);

const Campera: Producto = ({ id }) => (
  <svg viewBox="0 0 200 140" width="100%" height="100%">
    <defs>
      <linearGradient id={`${id}h`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#2b4fb8" />
        <stop offset="1" stopColor="#0f1f4d" />
      </linearGradient>
    </defs>
    <Sombra rx={58} y={132} />
    <path d="M76 22 C84 6 116 6 124 22 L152 34 L172 98 L154 104 L142 70 L142 128 L58 128 L58 70 L46 104 L28 98 L48 34 Z" fill={`url(#${id}h)`} />
    <path d="M78 22 C82 44 118 44 122 22 C116 10 84 10 78 22 Z" fill="#16307a" />
    <path d="M92 38 L90 60 M108 38 L110 60" stroke="#e6ebf5" strokeWidth={1.8} strokeLinecap="round" />
    <circle cx={90} cy={62} r={2} fill="#e6ebf5" />
    <circle cx={110} cy={62} r={2} fill="#e6ebf5" />
    <path d="M70 92 L130 92 L126 112 L74 112 Z" fill="#16307a" />
    <path d="M58 122 L142 122" stroke="#16307a" strokeWidth={6} />
    <path d="M150 40 L166 92" stroke="white" strokeWidth={3} opacity={0.12} strokeLinecap="round" />
  </svg>
);

const Lampara: Producto = ({ id }) => (
  <svg viewBox="0 0 200 140" width="100%" height="100%">
    <defs>
      <linearGradient id={`${id}p`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#f3ead8" />
        <stop offset="1" stopColor="#cdbb98" />
      </linearGradient>
    </defs>
    <Sombra rx={34} y={124} />
    <ellipse cx={100} cy={68} rx={52} ry={10} fill="#fff4c2" opacity={0.6} />
    <path d="M70 18 L130 18 L146 62 L54 62 Z" fill={`url(#${id}p)`} stroke="#bfa97f" strokeWidth={1.5} />
    <rect x={97} y={62} width={6} height={52} rx={2} fill="#7a6a52" />
    <ellipse cx={100} cy={118} rx={28} ry={6} fill="#7a6a52" />
  </svg>
);

// Phones: front and back of each model, drawn from a few parameters.
type Modelo = {
  cuerpo: [string, string];
  // Other colors, for the "trio" photo.
  variantes?: [string, string][];
  modulo: "triple" | "doble" | "vertical" | "pastilla" | "circulo" | "simple" | "diagonal" | "cuadrado";
  pantalla: [string, string];
};
const Lente: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill="#1a1c20" stroke="#3a3f48" strokeWidth={r * 0.18} />
    <circle cx={x} cy={y} r={r * 0.62} fill="#0b1830" />
    <circle cx={x - r * 0.22} cy={y - r * 0.22} r={r * 0.2} fill="#7fb2ff" opacity={0.8} />
  </g>
);
const Dorso: React.FC<{ m: Modelo; id: string }> = ({ m, id }) => {
  // Back of the phone in a 56 x 116 box.
  const L = (x: number, y: number, r: number) => <Lente key={`${x}-${y}`} x={x} y={y} r={r} />;
  const flash = (x: number, y: number) => <circle cx={x} cy={y} r={2} fill="#fff6d6" />;
  let modulo: React.ReactNode = null;
  switch (m.modulo) {
    case "triple":
      modulo = (
        <>
          <rect x={5} y={5} width={28} height={28} rx={7} fill="rgba(0,0,0,0.18)" stroke="rgba(255,255,255,0.25)" />
          {L(13, 13, 5.5)}
          {L(13, 25, 5.5)}
          {L(25, 19, 5.5)}
          {flash(26, 9)}
        </>
      );
      break;
    case "doble":
      modulo = (
        <>
          <rect x={6} y={6} width={14} height={28} rx={7} fill="rgba(0,0,0,0.18)" />
          {L(13, 13, 5)}
          {L(13, 27, 5)}
          {flash(24, 10)}
        </>
      );
      break;
    case "vertical":
      modulo = (
        <>
          {L(12, 12, 5.5)}
          {L(12, 26, 5.5)}
          {L(12, 40, 5.5)}
          {flash(22, 12)}
        </>
      );
      break;
    case "pastilla":
      modulo = (
        <>
          <rect x={6} y={6} width={44} height={16} rx={8} fill="rgba(0,0,0,0.22)" />
          {L(15, 14, 5)}
          {L(29, 14, 5)}
          {flash(42, 14)}
        </>
      );
      break;
    case "circulo":
      modulo = (
        <>
          <circle cx={28} cy={24} r={16} fill="rgba(0,0,0,0.28)" stroke="rgba(255,255,255,0.3)" />
          {L(22, 18, 4.6)}
          {L(34, 18, 4.6)}
          {L(22, 30, 4.6)}
          {L(34, 30, 4.6)}
        </>
      );
      break;
    case "simple":
      modulo = (
        <>
          {L(13, 13, 6)}
          {flash(13, 25)}
        </>
      );
      break;
    case "diagonal":
      modulo = (
        <>
          <rect x={5} y={5} width={26} height={26} rx={6} fill="rgba(0,0,0,0.15)" />
          {L(12, 12, 4.6)}
          {L(18, 18, 4.6)}
          {L(24, 24, 4.6)}
          {flash(25, 10)}
        </>
      );
      break;
    case "cuadrado":
      modulo = (
        <>
          <rect x={5} y={5} width={34} height={34} rx={8} fill="rgba(0,0,0,0.25)" stroke="rgba(255,255,255,0.3)" />
          {L(14, 14, 5.4)}
          {L(30, 14, 5.4)}
          {L(14, 30, 5.4)}
          {L(30, 30, 5.4)}
        </>
      );
      break;
  }
  return (
    <g>
      <defs>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={m.cuerpo[0]} />
          <stop offset="1" stopColor={m.cuerpo[1]} />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={56} height={116} rx={10} fill={`url(#${id}b)`} stroke="rgba(0,0,0,0.25)" strokeWidth={0.8} />
      <path d="M4 60 C20 50 36 72 52 58 L52 106 C52 110 48 112 44 112 L12 112 C8 112 4 110 4 106 Z" fill="white" opacity={0.08} />
      {modulo}
      <rect x={20} y={92} width={16} height={3} rx={1.5} fill="white" opacity={0.35} />
    </g>
  );
};
const Frente: React.FC<{ m: Modelo; id: string }> = ({ m, id }) => (
  <g>
    <defs>
      <linearGradient id={`${id}w`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={m.pantalla[0]} />
        <stop offset="1" stopColor={m.pantalla[1]} />
      </linearGradient>
    </defs>
    <rect x={0} y={0} width={56} height={116} rx={10} fill="#15171b" stroke={m.cuerpo[1]} strokeWidth={1.6} />
    <rect x={2.5} y={2.5} width={51} height={111} rx={8} fill={`url(#${id}w)`} />
    <path d="M2.5 70 C18 56 36 84 53.5 66 L53.5 105 C53.5 110 50 113.5 45 113.5 L11 113.5 C6 113.5 2.5 110 2.5 105 Z" fill="white" opacity={0.14} />
    <rect x={20} y={6} width={16} height={4.5} rx={2.25} fill="#0b0c0e" />
    <text x={28} y={30} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={10} fill="white">
      10:09
    </text>
    <text x={28} y={37} textAnchor="middle" fontFamily="Montserrat" fontWeight={500} fontSize={3.6} fill="white" opacity={0.85}>
      Jueves 13 de noviembre
    </text>
  </g>
);
const telefono = (m: Modelo) => {
  const T: Producto = ({ id, vista = "par" }) => {
    let foto: React.ReactNode;
    switch (vista) {
      case "par":
        foto = (
          <>
            <g transform="translate(58 10) rotate(-8 28 58)">
              <Dorso m={m} id={`${id}d`} />
            </g>
            <g transform="translate(92 14) rotate(6 28 58)">
              <Frente m={m} id={`${id}f`} />
            </g>
          </>
        );
        break;
      case "caja": {
        // Retail box behind, phone standing in front of it.
        foto = (
          <>
            <defs>
              <linearGradient id={`${id}k`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#ffffff" />
                <stop offset="1" stopColor="#dfe4ec" />
              </linearGradient>
            </defs>
            <path d="M44 18 L116 18 L124 12 L52 12 Z" fill="#c9d0da" />
            <path d="M116 18 L124 12 L124 118 L116 126 Z" fill="#b3bbc7" />
            <rect x={44} y={18} width={72} height={108} rx={3} fill={`url(#${id}k)`} stroke="#c3cad5" />
            <g transform="translate(64 32) scale(0.55)">
              <Frente m={m} id={`${id}kf`} />
            </g>
            <rect x={56} y={104} width={48} height={4} rx={2} fill={m.cuerpo[1]} opacity={0.8} />
            <rect x={66} y={112} width={28} height={3} rx={1.5} fill="#9aa3b2" />
            <g transform="translate(110 22) rotate(4 28 58) scale(0.92)">
              <Dorso m={m} id={`${id}d`} />
            </g>
          </>
        );
        break;
      }
      case "solo":
        foto = (
          <g transform="translate(72 12) rotate(-14 28 58)">
            <Dorso m={m} id={`${id}d`} />
          </g>
        );
        break;
      case "trio": {
        const colores = [m.variantes?.[0] ?? m.cuerpo, m.cuerpo, m.variantes?.[1] ?? m.cuerpo];
        foto = (
          <>
            {colores.map((c, i) => (
              <g key={i} transform={`translate(${38 + i * 34} ${i === 1 ? 8 : 16}) rotate(${(i - 1) * 12} 28 58) scale(${i === 1 ? 1 : 0.9})`}>
                <Dorso m={{ ...m, cuerpo: c }} id={`${id}t${i}`} />
              </g>
            ))}
          </>
        );
        break;
      }
      case "lado":
        foto = (
          <>
            <g transform="translate(66 12) skewY(-8) scale(0.9 1)">
              <Dorso m={m} id={`${id}d`} />
            </g>
            <rect x={116} y={4} width={6} height={112} rx={3} fill={m.cuerpo[1]} transform="skewY(-8)" opacity={0.9} />
          </>
        );
        break;
      default:
        foto = <g transform="translate(72 10)">{vista === "dorso" ? <Dorso m={m} id={`${id}d`} /> : <Frente m={m} id={`${id}f`} />}</g>;
    }
    return (
      <svg viewBox="0 0 200 140" width="100%" height="100%">
        <Sombra rx={vista === "par" || vista === "caja" || vista === "trio" ? 62 : 34} y={132} />
        {foto}
      </svg>
    );
  };
  return T;
};
const MODELOS: Record<string, Modelo> = {
  novaPro: { cuerpo: ["#c9ccd1", "#7d828a"], modulo: "triple", pantalla: ["#1e3a8a", "#7c3aed"] },
  nova: { cuerpo: ["#3b4f7a", "#141f3b"], modulo: "doble", pantalla: ["#0ea5e9", "#1e3a8a"] },
  lumenUltra: { cuerpo: ["#3a3d44", "#0d0e11"], modulo: "vertical", pantalla: ["#fb923c", "#be123c"] },
  lumen: { cuerpo: ["#b8ead6", "#5fbf9a"], modulo: "pastilla", pantalla: ["#34d399", "#0f766e"], variantes: [["#fde2e4", "#e8a0a8"], ["#e0e7ff", "#8b9cf0"]] },
  pulseEdge: { cuerpo: ["#ef4444", "#7f1d1d"], modulo: "circulo", pantalla: ["#f43f5e", "#4c1d95"] },
  pulseLite: { cuerpo: ["#ffffff", "#d3d8e0"], modulo: "simple", pantalla: ["#93c5fd", "#6366f1"] },
  orbit: { cuerpo: ["#d8c8f5", "#8b6fd6"], modulo: "diagonal", pantalla: ["#c084fc", "#1d4ed8"], variantes: [["#3a3d44", "#0d0e11"], ["#fef3c7", "#d9b45a"]] },
  zeta: { cuerpo: ["#f3dfa7", "#b98b32"], modulo: "cuadrado", pantalla: ["#fde68a", "#b45309"] },
  novaMini: { cuerpo: ["#fbcfe8", "#db7aa6"], modulo: "doble", pantalla: ["#f9a8d4", "#9d174d"] },
  lumenS9: { cuerpo: ["#9cc3f5", "#3b6fc4"], modulo: "vertical", pantalla: ["#60a5fa", "#1e3a8a"] },
  pulsePro: { cuerpo: ["#2b2f36", "#0b0c0e"], modulo: "circulo", pantalla: ["#22d3ee", "#1e40af"], variantes: [["#e5e7eb", "#9ca3af"], ["#93c5fd", "#1d4ed8"]] },
  zetaFold: { cuerpo: ["#e5e7eb", "#8f96a3"], modulo: "cuadrado", pantalla: ["#a5b4fc", "#312e81"] },
};
const Celular = telefono(MODELOS.novaPro);
const LumenUltra = telefono(MODELOS.lumenUltra);

type ItemTienda = { nombre: string; marca: string; precio: number; P: Producto; vista?: Vista };
const DESTACADOS: ItemTienda[] = [
  { nombre: "Cartera Classic", marca: "Urbana", precio: 74900, P: Cartera },
  { nombre: "Smartwatch Fit", marca: "Pulse", precio: 159900, P: Reloj },
  { nombre: "Smartphone X12", marca: "Nova", precio: 649900, P: Celular },
  { nombre: "Anteojos de Sol", marca: "Fashion Shades", precio: 29900, P: Anteojos },
  { nombre: "Auriculares Inalámbricos", marca: "Sonic", precio: 89900, P: Auriculares },
];
const CELULARES: ItemTienda[] = [
  { nombre: "Nova X12 Pro", marca: "Nova", precio: 1249900, P: Celular },
  { nombre: "Nova X12", marca: "Nova", precio: 899900, P: telefono(MODELOS.nova), vista: "caja" },
  { nombre: "Lumen A5", marca: "Lumen", precio: 349900, P: telefono(MODELOS.lumen), vista: "trio" },
  { nombre: "Pulse Edge 5G", marca: "Pulse", precio: 729900, P: telefono(MODELOS.pulseEdge), vista: "solo" },
  { nombre: "Pulse Lite", marca: "Pulse", precio: 285000, P: telefono(MODELOS.pulseLite), vista: "frente" },
  { nombre: "Lumen S9 Ultra", marca: "Lumen", precio: 1149900, P: LumenUltra },
  { nombre: "Orbit Flex", marca: "Orbit", precio: 539900, P: telefono(MODELOS.orbit), vista: "trio" },
  { nombre: "Zeta Max", marca: "Zeta", precio: 989900, P: telefono(MODELOS.zeta), vista: "caja" },
  { nombre: "Nova Mini", marca: "Nova", precio: 459900, P: telefono(MODELOS.novaMini), vista: "lado" },
  { nombre: "Lumen S9", marca: "Lumen", precio: 869900, P: telefono(MODELOS.lumenS9), vista: "par" },
  { nombre: "Pulse Edge Pro", marca: "Pulse", precio: 999900, P: telefono(MODELOS.pulsePro), vista: "trio" },
  { nombre: "Zeta Fold", marca: "Zeta", precio: 1399900, P: telefono(MODELOS.zetaFold), vista: "solo" },
];
const CATEGORIAS: [string, Producto][] = [
  ["Relojes", Reloj],
  ["Indumentaria", Campera],
  ["Electrónica", Auriculares],
  ["Hogar", Lampara],
  ["Accesorios", Anteojos],
];
const MENU = ["Inicio", "Catálogo", "Calzado", "Hombre", "Mujer", "Indumentaria", "Electrónica", "Celulares", "Tablets", "Notebooks", "Hogar", "Accesorios"];

// ---------- Shared pieces ----------
const LOGO_W = 2028;
const LOGO_H = 693;
const Logo: React.FC<{ w: number }> = ({ w }) => (
  <div style={{ position: "relative", width: w, height: (w * LOGO_H) / LOGO_W }}>
    {["axonia-letras.png", "axonia-icono.png"].map((f) => (
      <Img key={f} src={staticFile(f)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    ))}
  </div>
);

const Icono: React.FC<{ d: string; s?: number; c?: string }> = ({ d, s = 20, c = "white" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24">
    <path d={d} fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const I_USUARIO = "M12 4 A4 4 0 1 1 12 12 A4 4 0 1 1 12 4 M4 21 C5 15 19 15 20 21";
const I_CORAZON = "M12 20 C5 15 3 11 3 8 A4.5 4.5 0 0 1 12 6 A4.5 4.5 0 0 1 21 8 C21 11 19 15 12 20 Z";
const I_CARRITO = "M3 4 H6 L8 15 H18 L20 7 H7 M9 19 A1 1 0 1 0 9 21 M17 19 A1 1 0 1 0 17 21";
const I_LUPA = "M10 4 A6 6 0 1 1 10 16 A6 6 0 1 1 10 4 M15 15 L20 20";

const Badge: React.FC<{ n: number; pop?: number }> = ({ n, pop = 0 }) => (
  <div
    style={{
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      background: AZUL,
      color: "white",
      fontSize: 10.5,
      fontWeight: 800,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transform: `scale(${1 + pop * 0.5})`,
    }}
  >
    {n}
  </div>
);

const Header: React.FC<{ frame: number; seccion: string }> = ({ frame, seccion }) => {
  const carrito = frame >= TAP_AGREGAR + 4 ? 2 : 1;
  const pop = interpolate(frame, [TAP_AGREGAR + 4, TAP_AGREGAR + 9, TAP_AGREGAR + 18], [0, 1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: PW, zIndex: 5 }}>
      <div style={{ height: 66, background: OSCURO, display: "flex", alignItems: "center", padding: "0 30px", gap: 30 }}>
        <Logo w={118} />
        <div style={{ flex: 1, height: 40, background: "white", borderRadius: 7, display: "flex", alignItems: "center", overflow: "hidden" }}>
          <div style={{ flex: 1, fontSize: 12.5, color: "#8a929e", paddingLeft: 14 }}>Buscar productos, marcas y más…</div>
          <div style={{ width: 180, borderLeft: `1px solid ${BORDE}`, height: "100%", display: "flex", alignItems: "center", padding: "0 12px", fontSize: 12, color: TINTA, justifyContent: "space-between", boxSizing: "border-box", whiteSpace: "nowrap" }}>
            {seccion === "Celulares" ? "Celulares" : "Todas las categorías"} <span style={{ fontSize: 9 }}>▾</span>
          </div>
          <div style={{ width: 52, height: "100%", background: AZUL, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icono d={I_LUPA} />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "white" }}>
          <Icono d={I_USUARIO} />
          <div style={{ lineHeight: 1.15 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700 }}>Hola, Javier</div>
            <div style={{ fontSize: 10, color: "#9aa3b2" }}>Mi cuenta ▾</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, color: "white", fontSize: 12.5, fontWeight: 700 }}>
          <Icono d={I_CORAZON} /> Favoritos <Badge n={1} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, color: "white", fontSize: 12.5, fontWeight: 700 }}>
          <Icono d={I_CARRITO} /> Carrito <Badge n={carrito} pop={pop} />
        </div>
      </div>
      <div style={{ height: 40, background: OSCURO_2, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", padding: "0 30px", gap: 30 }}>
        {MENU.map((m) => (
          <div
            key={m}
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: m === seccion ? AZUL : "white",
              height: "100%",
              display: "flex",
              alignItems: "center",
              borderBottom: `2px solid ${m === seccion ? AZUL : "transparent"}`,
              boxSizing: "border-box",
            }}
          >
            {m}
          </div>
        ))}
      </div>
    </div>
  );
};
const HEADER_H = 106;

const CardProducto: React.FC<{ it: ItemTienda; id: string; w: number; h: number; t: number; destacada?: number }> = ({ it, id, w, h, t, destacada = 0 }) => (
  <div
    style={{
      width: w,
      height: h,
      background: "white",
      borderRadius: 12,
      border: `1px solid ${destacada > 0.01 ? AZUL : BORDE}`,
      boxShadow: destacada > 0.01 ? `0 10px 24px rgba(47,140,255,${0.25 * destacada})` : "0 2px 8px rgba(15,25,45,0.05)",
      padding: 12,
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      opacity: t,
      transform: `translateY(${(1 - t) * 24}px) scale(${1 + destacada * 0.03})`,
    }}
  >
    <div style={{ position: "absolute", right: 10, top: 10, width: 26, height: 26, borderRadius: "50%", border: `1px solid ${BORDE}`, display: "flex", alignItems: "center", justifyContent: "center", background: "white" }}>
      <Icono d={I_CORAZON} s={13} c={TINTA_2} />
    </div>
    <div style={{ flex: 1, background: "#f6f7fa", borderRadius: 8, padding: "6px 10px" }}>
      <it.P id={id} vista={it.vista} />
    </div>
    <div style={{ fontSize: 12, fontWeight: 800, color: TINTA, marginTop: 9, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.nombre}</div>
    <div style={{ fontSize: 10, color: TINTA_2, marginTop: 1 }}>{it.marca}</div>
    <div style={{ fontSize: 15, fontWeight: 800, color: TINTA, marginTop: 5 }}>{pesos(it.precio)}</div>
    <div style={{ marginTop: 7, height: 28, border: `1.5px solid ${AZUL}`, borderRadius: 6, color: AZUL, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", background: destacada > 0.5 ? "#eef5ff" : "white" }}>
      Ver producto →
    </div>
  </div>
);

// ---------- Screens ----------
const Home: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const scroll = interpolate(frame, SCROLL_HOME, [0, 330], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const brillo = 0.75 + Math.sin(frame / 12) * 0.25;
  const entra = (d: number) => spring({ frame: frame - d, fps, config: { damping: 16, stiffness: 120 } });
  return (
    <div style={{ position: "absolute", left: 0, top: HEADER_H, width: PW, transform: `translateY(${-scroll}px)` }}>
      {/* Hero */}
      <div style={{ margin: "18px 24px 0", height: 360, borderRadius: 16, background: "radial-gradient(ellipse at 75% 55%, #0d2a5c 0%, #050912 60%)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 70, top: 48, opacity: entra(4), transform: `translateX(${(1 - entra(4)) * -30}px)` }}>
          <div style={{ display: "inline-block", background: AZUL, color: "white", fontSize: 11, fontWeight: 800, letterSpacing: 1, padding: "7px 16px", borderRadius: 16 }}>BIENVENIDO A</div>
          <div style={{ fontSize: 40, fontWeight: 800, color: "white", marginTop: 14 }}>Axonia Online Store</div>
          <div style={{ fontSize: 15, color: "#d6dce6", marginTop: 8, width: 470, lineHeight: 1.45 }}>
            Descubrí productos seleccionados para cada momento, todo en un solo lugar.
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 22 }}>
            <div style={{ background: AZUL, color: "white", fontSize: 13.5, fontWeight: 700, padding: "13px 22px", borderRadius: 7 }}>Ver todo el catálogo →</div>
            <div style={{ border: "1.5px solid white", color: "white", fontSize: 13.5, fontWeight: 700, padding: "12px 22px", borderRadius: 7 }}>Ofertas destacadas</div>
          </div>
        </div>
        <div style={{ position: "absolute", left: 70, bottom: 26, display: "flex", gap: 34, color: "white", opacity: entra(14) }}>
          {[
            ["Envíos flexibles", "A domicilio o retiro"],
            ["Pagos controlados", "Operaciones registradas"],
            ["Seguimiento del pedido", "Consultá su estado"],
          ].map(([a, b]) => (
            <div key={a}>
              <div style={{ fontSize: 12, fontWeight: 800 }}>{a}</div>
              <div style={{ fontSize: 10.5, color: "#aab3c0" }}>{b}</div>
            </div>
          ))}
        </div>
        {/* Glowing ring with products on a podium */}
        <div style={{ position: "absolute", left: 700, top: 40, width: 380, height: 380, borderRadius: "50%", border: `5px solid rgba(47,140,255,${brillo})`, boxShadow: `0 0 40px rgba(47,140,255,${0.6 * brillo}), inset 0 0 40px rgba(47,140,255,${0.4 * brillo})` }} />
        <div style={{ position: "absolute", left: 690, top: 290, width: 400, height: 60, borderRadius: "50%", background: "radial-gradient(ellipse, #1a3a78 0%, #0a1430 70%)", boxShadow: `0 0 30px rgba(47,140,255,${0.5 * brillo})` }} />
        {[
          { P: Cartera, x: 730, y: 120, w: 190, d: 8 },
          { P: Celular, x: 900, y: 150, w: 150, d: 12 },
          { P: Reloj, x: 800, y: 200, w: 170, d: 16 },
          { P: Anteojos, x: 930, y: 250, w: 120, d: 20 },
        ].map(({ P, x, y, w, d }, i) => (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: w, height: w * 0.7, opacity: entra(d), transform: `translateY(${(1 - entra(d)) * 30}px)`, filter: "drop-shadow(0 12px 14px rgba(0,0,0,0.5))" }}>
            <P id={`hero${i}`} />
          </div>
        ))}
        <div style={{ position: "absolute", left: 780, bottom: 22, display: "flex", gap: 8 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: i === 0 ? AZUL : "#5b6472" }} />
          ))}
        </div>
      </div>
      {/* Categories */}
      <div style={{ margin: "26px 30px 0", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ fontSize: 19, fontWeight: 800, color: TINTA }}>Explorá por categorías</div>
        <div style={{ fontSize: 12, fontWeight: 700, color: AZUL }}>Ver todas las categorías →</div>
      </div>
      <div style={{ margin: "14px 24px 0", display: "flex", gap: 14 }}>
        {CATEGORIAS.map(([n, P], i) => (
          <div key={n} style={{ flex: 1, height: 82, background: "white", borderRadius: 12, border: `1px solid ${BORDE}`, display: "flex", alignItems: "center", gap: 12, padding: "0 14px", opacity: entra(24 + i * 3) }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#f2f4f8", padding: 6, boxSizing: "border-box" }}>
              <P id={`cat${i}`} />
            </div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: TINTA }}>{n}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: AZUL, marginTop: 3 }}>Ver productos ›</div>
            </div>
          </div>
        ))}
      </div>
      {/* Featured */}
      <div style={{ margin: "28px 30px 0", fontSize: 19, fontWeight: 800, color: TINTA }}>Productos destacados</div>
      <div style={{ margin: "14px 24px 0", display: "flex", gap: 14 }}>
        {DESTACADOS.map((it, i) => (
          <CardProducto key={it.nombre} it={it} id={`dest${i}`} w={210} h={268} t={interpolate(frame, [SCROLL_HOME[0] + 20 + i * 5, SCROLL_HOME[0] + 34 + i * 5], [0, 1], clamp)} />
        ))}
      </div>
    </div>
  );
};

const SCROLL_CATALOGO = [196, 236];
const Catalogo: React.FC<{ frame: number }> = ({ frame }) => {
  const f0 = ESC.catalogo[0];
  const destacada = interpolate(frame, [TAP_PRODUCTO - 14, TAP_PRODUCTO - 4], [0, 1], clamp);
  const scroll = interpolate(frame, SCROLL_CATALOGO, [0, 300], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  return (
    <div style={{ position: "absolute", left: 0, top: HEADER_H, width: PW, height: PH - HEADER_H, background: "#f4f6f9", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: PW, height: 1100, transform: `translateY(${-scroll}px)` }}>
      <div style={{ position: "absolute", left: 40, top: 24, fontSize: 28, fontWeight: 800, color: TINTA }}>Catálogo</div>
      <div style={{ position: "absolute", left: 270, top: 34, fontSize: 12, color: TINTA_2 }}>12 productos</div>
      <div style={{ position: "absolute", right: 40, top: 24, display: "flex", gap: 10, alignItems: "center" }}>
        <span style={{ fontSize: 12, color: TINTA_2 }}>Ordenar por</span>
        <div style={{ width: 130, height: 34, background: "white", border: `1px solid ${BORDE}`, borderRadius: 7, fontSize: 12, display: "flex", alignItems: "center", padding: "0 10px", boxSizing: "border-box", justifyContent: "space-between" }}>
          Más nuevos <span style={{ fontSize: 9 }}>▾</span>
        </div>
        <div style={{ height: 34, border: `1px solid ${AZUL}`, borderRadius: 7, fontSize: 12, fontWeight: 700, color: AZUL, display: "flex", alignItems: "center", gap: 8, padding: "0 12px", background: "white" }}>
          Filtros activos <Badge n={1} />
        </div>
      </div>
      {/* Filters */}
      <div style={{ position: "absolute", left: 40, top: 76, width: 210, background: "white", borderRadius: 12, border: `1px solid ${BORDE}`, padding: 16, boxSizing: "border-box" }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: TINTA }}>Filtros</div>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: TINTA, marginTop: 14 }}>Categoría</div>
        <div style={{ height: 32, border: `1px solid ${BORDE}`, borderRadius: 6, fontSize: 11.5, display: "flex", alignItems: "center", padding: "0 10px", marginTop: 6, justifyContent: "space-between" }}>
          Celulares <span style={{ fontSize: 9 }}>▾</span>
        </div>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: TINTA, marginTop: 14 }}>Precio</div>
        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
          {["$ 0", "Sin límite"].map((v) => (
            <div key={v} style={{ flex: 1, height: 30, border: `1px solid ${BORDE}`, borderRadius: 6, fontSize: 11, display: "flex", alignItems: "center", padding: "0 8px", color: TINTA_2 }}>
              {v}
            </div>
          ))}
        </div>
        <div style={{ height: 32, background: AZUL, color: "white", borderRadius: 6, fontSize: 11.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 12 }}>Aplicar filtros</div>
        <div style={{ fontSize: 13, fontWeight: 800, color: TINTA, marginTop: 20 }}>Marcas</div>
        {[
          ["Nova", 3],
          ["Lumen", 3],
          ["Pulse", 3],
          ["Orbit", 1],
          ["Zeta", 2],
        ].map(([m, n]) => (
          <div key={m as string} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 9, fontSize: 11.5, color: TINTA }}>
            <div style={{ width: 13, height: 13, border: "1.5px solid #aab3c0", borderRadius: 3 }} />
            <span style={{ flex: 1 }}>{m}</span>
            <span style={{ fontSize: 10, background: "#f0f2f6", borderRadius: 6, padding: "1px 6px", color: TINTA_2 }}>{n}</span>
          </div>
        ))}
      </div>
      {/* Grid */}
      <div style={{ position: "absolute", left: 270, top: 76, width: 870, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {CELULARES.map((it, i) => (
          <CardProducto
            key={it.nombre}
            it={it}
            id={`celu${i}`}
            w={207}
            h={300}
            t={interpolate(frame, [f0 + 6 + i * 4, f0 + 20 + i * 4], [0, 1], clamp)}
            destacada={i === 5 ? destacada : 0}
          />
        ))}
      </div>
      </div>
    </div>
  );
};

const ProductoPagina: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const f0 = ESC.producto[0];
  const entra = (d: number) => spring({ frame: frame - f0 - d, fps, config: { damping: 16, stiffness: 120 } });
  const agregado = frame >= TAP_AGREGAR + 4;
  const vista = Math.floor(interpolate(frame, [f0 + 30, f0 + 90], [0, 2.99], clamp));
  return (
    <div style={{ position: "absolute", left: 0, top: HEADER_H, width: PW, height: PH - HEADER_H, background: "#f4f6f9" }}>
      <div style={{ position: "absolute", left: 40, top: 18, width: 1100, height: 680, background: "white", borderRadius: 14, border: `1px solid ${BORDE}` }}>
        <div style={{ position: "absolute", left: 24, top: 18, fontSize: 11.5, color: TINTA_2 }}>Catálogo / Celulares</div>
        {/* Thumbnails */}
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ position: "absolute", left: 24, top: 48 + i * 82, width: 64, height: 70, borderRadius: 8, border: `2px solid ${i === vista ? AZUL : BORDE}`, background: "#f6f7fa", padding: 4, boxSizing: "border-box" }}>
            <LumenUltra id={`thumb${i}`} vista={VISTAS[i]} />
          </div>
        ))}
        {/* Main image */}
        <div style={{ position: "absolute", left: 104, top: 48, width: 430, height: 420, borderRadius: 12, background: "radial-gradient(circle at 50% 45%, #ffffff, #eef1f6)", display: "flex", alignItems: "center", justifyContent: "center", opacity: entra(0) }}>
          <div style={{ width: 420, height: 300, transform: `scale(${0.9 + entra(0) * 0.1})`, filter: "drop-shadow(0 20px 18px rgba(15,25,45,0.25))" }}>
            <LumenUltra id="principal" vista={VISTAS[vista]} />
          </div>
        </div>
        {/* Description */}
        <div style={{ position: "absolute", left: 24, top: 488, width: 752, borderTop: `1px solid ${BORDE}`, paddingTop: 16, opacity: entra(14) }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: TINTA }}>Descripción</div>
          <div style={{ fontSize: 12, color: TINTA_2, marginTop: 8, lineHeight: 1.6 }}>
            El Lumen S9 Ultra combina una pantalla AMOLED de 6,8" con 120 Hz, procesador de última generación y una cámara
            principal de 200 MP con zoom óptico 10x para fotos nítidas de día y de noche. Su batería de 5.000 mAh con carga
            rápida de 45 W te acompaña todo el día. Incluye 256 GB de almacenamiento, resistencia al agua IP68 y 12 meses de
            garantía oficial.
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            {["Envío gratis", "12 meses de garantía", "Devolución sin cargo"].map((t) => (
              <span key={t} style={{ fontSize: 11, fontWeight: 700, color: AZUL, background: "#eef5ff", borderRadius: 12, padding: "4px 11px" }}>
                ✓ {t}
              </span>
            ))}
          </div>
        </div>
        {/* Info */}
        <div style={{ position: "absolute", left: 566, top: 50, width: 210, opacity: entra(6) }}>
          <div style={{ fontSize: 11.5, color: AZUL }}>Ver más productos de Lumen</div>
          <div style={{ fontSize: 23, fontWeight: 800, color: TINTA, marginTop: 10, lineHeight: 1.2 }}>Lumen S9 Ultra</div>
          <div style={{ fontSize: 12, color: "#f5b301", marginTop: 8 }}>
            ★★★★★ <span style={{ color: TINTA_2 }}>(128)</span>
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, color: TINTA, marginTop: 14 }}>{pesos(1149900)}</div>
          <div style={{ fontSize: 11.5, color: VERDE, fontWeight: 700, marginTop: 4 }}>12 cuotas de {pesos(95825)}</div>
          <div style={{ fontSize: 11.5, color: TINTA_2, marginTop: 16, lineHeight: 1.6 }}>
            • Pantalla 6,8" AMOLED
            <br />• 256 GB · 12 GB RAM
            <br />• Cámara de 200 MP
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            {["#1c1e22", "#c9ccd1", "#be123c"].map((c, i) => (
              <div key={c} style={{ width: 24, height: 24, borderRadius: "50%", background: c, border: `2px solid ${i === 0 ? AZUL : "white"}`, boxShadow: `0 0 0 1px ${BORDE}` }} />
            ))}
          </div>
        </div>
        {/* Buy box */}
        <div style={{ position: "absolute", left: 790, top: 48, width: 290, border: `1px solid ${BORDE}`, borderRadius: 12, padding: 18, boxSizing: "border-box", opacity: entra(10) }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: VERDE }}>Entrega y retiro</div>
          {[
            ["Envío a domicilio", "Costo $4.999"],
            ["Retiro en local", "Sin costo"],
          ].map(([a, b]) => (
            <div key={a} style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: TINTA }}>{a}</div>
              <div style={{ fontSize: 10.5, color: TINTA_2 }}>{b}</div>
            </div>
          ))}
          <div style={{ borderTop: `1px solid ${BORDE}`, margin: "16px 0 12px" }} />
          <div style={{ fontSize: 12, fontWeight: 800, color: TINTA }}>Stock disponible</div>
          <div style={{ fontSize: 11.5, color: VERDE, marginTop: 3 }}>En stock · 22 unidades</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
            <span style={{ fontSize: 12, color: TINTA }}>Cantidad</span>
            <div style={{ width: 70, height: 30, border: `1px solid ${BORDE}`, borderRadius: 6, fontSize: 12, display: "flex", alignItems: "center", paddingLeft: 10 }}>1</div>
          </div>
          <div style={{ height: 42, background: AZUL_BOTON, color: "white", borderRadius: 7, fontSize: 13.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 16 }}>Comprar ahora</div>
          <div
            style={{
              height: 42,
              border: `1.5px solid ${AZUL_BOTON}`,
              background: agregado ? "#eef2ff" : "white",
              color: AZUL_BOTON,
              borderRadius: 7,
              fontSize: 13.5,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginTop: 10,
              transform: `scale(${1 - pulsado(frame, TAP_AGREGAR) * 0.05})`,
            }}
          >
            <Icono d={I_CARRITO} s={16} c={AZUL_BOTON} /> Agregar al carrito
          </div>
          {agregado ? (
            <>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: VERDE, textAlign: "center", marginTop: 8 }}>Agregado ✓</div>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <div style={{ flex: 1, whiteSpace: "nowrap", height: 36, border: `1.5px solid ${AZUL_BOTON}`, background: "#eef2ff", color: AZUL_BOTON, borderRadius: 7, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 - pulsado(frame, TAP_IR_CARRITO) * 0.06})` }}>
                  Ir al carrito
                </div>
                <div style={{ flex: 1.3, whiteSpace: "nowrap", height: 36, border: `1px solid ${BORDE}`, color: TINTA, borderRadius: 7, fontSize: 11.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>Seguir comprando</div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const VISTAS: Vista[] = ["par", "dorso", "frente"];
const PEDIDO = [
  { nombre: "Lumen S9 Ultra", precio: 1149900, P: LumenUltra },
  { nombre: "Anteojos de Sol", precio: 29900, P: Anteojos },
];
const TOTAL = PEDIDO.reduce((a, p) => a + p.precio, 0);
const METODOS = [
  ["Tarjeta de débito", ""],
  ["Billetera virtual", "Tarjeta de crédito o débito, en cuotas"],
  ["Tarjeta de crédito", "Te contactamos para coordinar el pago"],
  ["Préstamo Personal", "Aprobación inmediata, sin papeles"],
  ["Contra entrega", "Efectivo o tarjeta al retirar en el local"],
];

const Pasos: React.FC<{ paso: number }> = ({ paso }) => (
  <div style={{ position: "absolute", left: 250, top: 74, width: 680, height: 80, background: "white", borderRadius: 12, border: `1px solid ${BORDE}` }}>
    <div style={{ position: "absolute", left: 120, right: 120, top: 28, height: 2, background: "#d6dbe3" }}>
      <div style={{ width: `${paso === 1 ? 50 : 100}%`, height: "100%", background: AZUL }} />
    </div>
    {["Entrega", "Pago", "Revisión"].map((n, i) => {
      const hecho = i < paso;
      const actual = i === paso;
      return (
        <div key={n} style={{ position: "absolute", left: 120 + i * 220 - 40, width: 80, top: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: hecho ? AZUL : "white",
              border: `2px solid ${hecho || actual ? AZUL : "#c3c9d2"}`,
              color: hecho ? "white" : actual ? AZUL : TINTA_2,
              fontSize: 13,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxSizing: "border-box",
            }}
          >
            {hecho ? "✓" : i + 1}
          </div>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: hecho || actual ? AZUL : TINTA_2 }}>{n}</div>
        </div>
      );
    })}
  </div>
);

const Checkout: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const f0 = ESC.checkout[0];
  const elegido = frame >= TAP_PRESTAMO + 2;
  const revision = frame >= REVISION;
  const plan = spring({ frame: frame - TAP_PRESTAMO - 4, fps, config: { damping: 16 } });
  return (
    <div style={{ position: "absolute", left: 0, top: HEADER_H, width: PW, height: PH - HEADER_H, background: "#f4f6f9" }}>
      <div style={{ position: "absolute", left: 250, top: 14, fontSize: 11, fontWeight: 800, color: AZUL, letterSpacing: 1 }}>CHECKOUT</div>
      <div style={{ position: "absolute", left: 250, top: 30, fontSize: 26, fontWeight: 800, color: TINTA }}>Finalizar compra</div>
      <Pasos paso={revision ? 2 : 1} />
      {/* Left panel */}
      <div style={{ position: "absolute", left: 120, top: 172, width: 600, height: 530, background: "white", borderRadius: 12, border: `1px solid ${BORDE}`, padding: 20, boxSizing: "border-box" }}>
        {!revision ? (
          <>
            <div style={{ fontSize: 15, fontWeight: 800, color: TINTA }}>Método de pago</div>
            {METODOS.map(([n, d], i) => {
              const sel = i === 3 && elegido;
              return (
                <div
                  key={n}
                  style={{
                    marginTop: 8,
                    border: `1.5px solid ${sel ? AZUL : BORDE}`,
                    background: sel ? "#eef5ff" : "white",
                    borderRadius: 9,
                    padding: "8px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    opacity: interpolate(frame, [f0 + 6 + i * 3, f0 + 14 + i * 3], [0, 1], clamp),
                    transform: `scale(${i === 3 ? 1 - pulsado(frame, TAP_PRESTAMO) * 0.03 : 1})`,
                  }}
                >
                  <div style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${sel ? AZUL : "#aab3c0"}`, display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box" }}>
                    {sel ? <div style={{ width: 8, height: 8, borderRadius: "50%", background: AZUL }} /> : null}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: TINTA }}>{n}</div>
                    {d ? <div style={{ fontSize: 10.5, color: TINTA_2, marginTop: 2 }}>{d}</div> : null}
                  </div>
                  {i === 3 ? <div style={{ fontSize: 10, fontWeight: 800, color: "white", background: VERDE, borderRadius: 10, padding: "3px 9px" }}>NUEVO</div> : null}
                </div>
              );
            })}
            {elegido ? (
              <div style={{ marginTop: 10, border: `1px solid #b9d4f5`, background: "#f5f9ff", borderRadius: 9, padding: "8px 14px", display: "flex", gap: 10, opacity: plan, transform: `translateY(${(1 - plan) * 10}px)` }}>
                {[3, 6, 9].map((n) => (
                  <div key={n} style={{ flex: 1, borderRadius: 7, border: `1.5px solid ${n === 6 ? AZUL : BORDE}`, background: "white", textAlign: "center", padding: "6px 0" }}>
                    <div style={{ fontSize: 10.5, color: TINTA_2 }}>{n} cuotas de</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: n === 6 ? AZUL : TINTA }}>{pesos(Math.round((TOTAL * (1 + n * 0.06)) / n))}</div>
                  </div>
                ))}
              </div>
            ) : null}
            <div style={{ position: "absolute", right: 20, bottom: 20, display: "flex", gap: 10 }}>
              <div style={{ height: 38, padding: "0 18px", border: `1px solid ${BORDE}`, borderRadius: 7, fontSize: 12.5, fontWeight: 700, display: "flex", alignItems: "center" }}>Volver</div>
              <div style={{ height: 38, padding: "0 22px", background: AZUL_BOTON, color: "white", borderRadius: 7, fontSize: 12.5, fontWeight: 700, display: "flex", alignItems: "center", opacity: elegido ? 1 : 0.5, transform: `scale(${1 - pulsado(frame, TAP_CONTINUAR) * 0.06})` }}>
                Continuar
              </div>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 15, fontWeight: 800, color: TINTA }}>Revisá tu compra</div>
            {[
              ["Entrega", "Retiro en local · Sin costo"],
              ["Pago", "Préstamo Personal · 6 cuotas de " + pesos(Math.round((TOTAL * 1.36) / 6))],
              ["Contacto", "11 5328-8468 · javier@mail.com"],
            ].map(([k, v], i) => (
              <div key={k} style={{ marginTop: 14, padding: "14px 16px", border: `1px solid ${BORDE}`, borderRadius: 9, display: "flex", justifyContent: "space-between", opacity: interpolate(frame, [REVISION + 4 + i * 4, REVISION + 12 + i * 4], [0, 1], clamp) }}>
                <span style={{ fontSize: 12, color: TINTA_2 }}>{k}</span>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: TINTA }}>{v}</span>
              </div>
            ))}
            <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 8, fontSize: 11.5, color: TINTA }}>
              <div style={{ width: 15, height: 15, borderRadius: 3, background: AZUL, color: "white", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>✓</div>
              Acepto los términos y condiciones de compra
            </div>
            <div style={{ position: "absolute", left: 20, right: 20, bottom: 20, height: 46, background: VERDE, color: "white", borderRadius: 8, fontSize: 14.5, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 - pulsado(frame, TAP_CONFIRMAR) * 0.04})` }}>
              Confirmar compra · {pesos(TOTAL)}
            </div>
          </>
        )}
      </div>
      {/* Order summary */}
      <div style={{ position: "absolute", left: 740, top: 172, width: 320, background: "white", borderRadius: 12, border: `1px solid ${BORDE}`, padding: 20, boxSizing: "border-box" }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: TINTA }}>Tu pedido</div>
        {PEDIDO.map((p, i) => (
          <div key={p.nombre} style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 14, paddingBottom: 14, borderBottom: `1px solid ${BORDE}` }}>
            <div style={{ width: 54, height: 46, background: "#f6f7fa", borderRadius: 7, padding: 3, boxSizing: "border-box" }}>
              <p.P id={`ped${i}`} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: TINTA }}>{p.nombre}</div>
              <div style={{ fontSize: 10.5, color: TINTA_2 }}>×1</div>
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 800, color: TINTA }}>{pesos(p.precio)}</div>
          </div>
        ))}
        {[
          ["Subtotal", pesos(TOTAL)],
          ["Envío", "$0"],
        ].map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 12, color: TINTA_2 }}>
            <span>{k}</span>
            <b style={{ color: TINTA }}>{v}</b>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 16, paddingTop: 14, borderTop: `1px solid ${BORDE}` }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: TINTA }}>Total</span>
          <span style={{ fontSize: 24, fontWeight: 800, color: TINTA }}>{pesos(TOTAL)}</span>
        </div>
      </div>
    </div>
  );
};

const Confirmacion: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const f0 = ESC.confirmacion[0];
  const t = spring({ frame: frame - f0 - 4, fps, config: { damping: 12, stiffness: 120 } });
  const confeti = Array.from({ length: 26 });
  return (
    <div style={{ position: "absolute", left: 0, top: HEADER_H, width: PW, height: PH - HEADER_H, background: "#f4f6f9" }}>
      <div style={{ position: "absolute", left: 290, top: 40, width: 600, height: 600, background: "white", borderRadius: 16, border: `1px solid ${BORDE}`, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 44, boxSizing: "border-box", overflow: "hidden" }}>
        {confeti.map((_, i) => {
          const x = (i * 97) % 600;
          const y = interpolate(frame - f0 - (i % 7) * 2, [0, 70], [-20, 260 + (i % 5) * 40], clamp);
          return <div key={i} style={{ position: "absolute", left: x, top: y, width: 7, height: 11, borderRadius: 2, background: [AZUL, "#FF8C42", VERDE, "#f5b301"][i % 4], transform: `rotate(${i * 37 + frame * 6}deg)`, opacity: interpolate(frame - f0, [50, 80], [1, 0], clamp) }} />;
        })}
        <div style={{ width: 86, height: 86, borderRadius: "50%", background: VERDE, color: "white", fontSize: 48, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${t})`, boxShadow: `0 0 0 ${12 * t}px rgba(30,138,76,0.15)` }}>✓</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: TINTA, marginTop: 24 }}>¡Gracias por tu compra, Javier!</div>
        <div style={{ fontSize: 13.5, color: TINTA_2, marginTop: 8 }}>Pedido N.º 2026-111300157 · Préstamo aprobado</div>
        <div style={{ width: 440, marginTop: 26, border: `1px solid ${BORDE}`, borderRadius: 12, padding: "6px 18px", boxSizing: "border-box" }}>
          {PEDIDO.map((p, i) => (
            <div key={p.nombre} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderTop: i ? `1px solid ${BORDE}` : "none", opacity: interpolate(frame, [f0 + 12 + i * 5, f0 + 20 + i * 5], [0, 1], clamp) }}>
              <div style={{ width: 54, height: 44, background: "#f6f7fa", borderRadius: 7, padding: 3, boxSizing: "border-box" }}>
                <p.P id={`conf${i}`} />
              </div>
              <div style={{ flex: 1, fontSize: 13, fontWeight: 700, color: TINTA }}>{p.nombre}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: TINTA }}>{pesos(p.precio)}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 30, marginTop: 22, fontSize: 12.5, color: TINTA }}>
          <div>
            Retiro: <b>Local Centro</b>
          </div>
          <div>
            Total: <b>{pesos(TOTAL)}</b>
          </div>
        </div>
        <div style={{ marginTop: 26, height: 44, padding: "0 30px", background: AZUL_BOTON, color: "white", borderRadius: 8, fontSize: 13.5, fontWeight: 700, display: "flex", alignItems: "center" }}>Seguir comprando</div>
      </div>
    </div>
  );
};

// Finger path in page coordinates: [arrival frame, x, y].
const DEDO: [number, number, number][] = [
  [0, 900, 700],
  [TAP_CELULARES - 2, 668, 86],
  [TAP_PRODUCTO - 2, 640, 310],
  [TAP_AGREGAR - 2, 978, 512],
  [TAP_IR_CARRITO - 2, 910, 590],
  [TAP_PRESTAMO - 2, 300, 507],
  [TAP_CONTINUAR - 2, 678, 648],
  [TAP_CONFIRMAR - 2, 420, 648],
  [TAP_CONFIRMAR + 40, 760, 760],
];
const posDedo = (frame: number) => {
  let p = { x: DEDO[0][1], y: DEDO[0][2] };
  for (let i = 1; i < DEDO.length; i++) {
    const [f, x, y] = DEDO[i];
    const desde = Math.max(DEDO[i - 1][0], f - 18);
    if (frame >= f) {
      p = { x, y };
      continue;
    }
    if (frame > desde) {
      const t = interpolate(frame, [desde, f], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
      p = { x: p.x + (x - p.x) * t, y: p.y + (y - p.y) * t };
    }
    break;
  }
  return p;
};

const SECCION: Record<Escena, string> = {
  home: "Inicio",
  catalogo: "Celulares",
  producto: "Celulares",
  checkout: "",
  confirmacion: "",
};

const Pagina: React.FC<{ frame: number }> = ({ frame }) => {
  const escenas: [Escena, React.FC<{ frame: number }>][] = [
    ["home", Home],
    ["catalogo", Catalogo],
    ["producto", ProductoPagina],
    ["checkout", Checkout],
    ["confirmacion", Confirmacion],
  ];
  const actual = (Object.keys(ESC) as Escena[]).filter((e) => frame >= ESC[e][0]).pop() ?? "home";
  const dedo = posDedo(frame);
  const tap = TAPS.find((f) => frame >= f && frame < f + 16);
  const onda = tap === undefined ? 0 : (frame - tap) / 16;
  const presion = tap === undefined ? 0 : interpolate(frame - tap, [0, 3, 8], [0, 1, 0], clamp);
  const dedoVis = interpolate(frame, [100, 116], [0, 1], clamp) * interpolate(frame, [TAP_CONFIRMAR + 30, TAP_CONFIRMAR + 44], [1, 0], clamp);
  return (
    <div style={{ position: "relative", width: PW, height: PH, background: "#f4f6f9", fontFamily: FUENTE, overflow: "hidden" }}>
      {escenas.map(([e, C]) => {
        const [a, b] = ESC[e];
        const v = interpolate(frame, [a, a + 6, b - 6, b], [0, 1, 1, 0], clamp);
        if (v <= 0.001) {
          return null;
        }
        return (
          <div key={e} style={{ position: "absolute", inset: 0, opacity: v }}>
            <C frame={frame} />
          </div>
        );
      })}
      <Header frame={frame} seccion={SECCION[actual]} />
      {tap !== undefined ? (
        <div style={{ position: "absolute", left: dedo.x, top: dedo.y, width: 18 + onda * 54, height: 18 + onda * 54, transform: "translate(-50%, -50%)", borderRadius: "50%", border: `3px solid rgba(255,140,66,${1 - onda})`, background: `rgba(255,140,66,${(1 - onda) * 0.2})`, zIndex: 8 }} />
      ) : null}
      <div
        style={{
          position: "absolute",
          left: dedo.x,
          top: dedo.y,
          width: 36,
          height: 36,
          transform: `translate(-50%, -50%) scale(${1 - presion * 0.2})`,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.55)",
          border: "2px solid rgba(40,48,64,0.35)",
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          opacity: dedoVis * 0.9,
          zIndex: 9,
        }}
      />
    </div>
  );
};

export const TiendaAxonia: React.FC<z.infer<typeof tiendaSchema>> = ({ fondo, paleta }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const { w, h } = pantallaDe("tablet", false);
  const { W: EW, H: EH } = exteriorDe("tablet", w, h);
  const esc = Math.min((width * 0.8) / EW, (height * 0.84) / EH);
  const t = spring({ frame, fps, config: { damping: 18, stiffness: 80 } });
  return (
    <AbsoluteFill style={{ fontFamily: FUENTE }}>
      <FondoAbstracto paleta={paleta} estilo={fondo} />
      <AbsoluteFill style={{ perspective: 2600 }}>
        <div
          style={{
            position: "absolute",
            left: width / 2,
            top: height / 2,
            opacity: t,
            // Tilted to the other side: seen from the left. Fixed, no floating.
            transform: `translate(-50%, -50%) scale(${esc}) rotateY(16deg) rotateX(8deg) rotateZ(2deg)`,
          }}
        >
          <Dispositivo tipo="tablet" w={w} h={h}>
            <Pagina frame={frame} />
          </Dispositivo>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
