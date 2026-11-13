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
const TAP_ELECTRONICA = 138;
const TAP_PRODUCTO = 258;
const TAP_AGREGAR = 318;
const TAP_IR_CARRITO = 372;
const TAP_PRESTAMO = 436;
const TAP_CONTINUAR = 472;
const REVISION = 478;
const TAP_CONFIRMAR = 508;
const TAPS = [TAP_ELECTRONICA, TAP_PRODUCTO, TAP_AGREGAR, TAP_IR_CARRITO, TAP_PRESTAMO, TAP_CONTINUAR, TAP_CONFIRMAR];

const pesos = (n: number) => `$${n.toLocaleString("es-AR")}`;
const pulsado = (frame: number, f: number) => interpolate(frame, [f, f + 4, f + 12], [0, 1, 0], clamp);

// ---------- Products, drawn in a 200 x 140 box ----------
type Producto = React.FC<{ id: string }>;

const Cartera: Producto = ({ id }) => (
  <svg viewBox="0 0 200 140" width="100%" height="100%">
    <defs>
      <linearGradient id={`${id}c`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#3b5bdb" />
        <stop offset="1" stopColor="#14246b" />
      </linearGradient>
    </defs>
    <path d="M74 52 C74 22 126 22 126 52" fill="none" stroke="#1b2a6b" strokeWidth={7} strokeLinecap="round" />
    <path d="M52 56 L148 56 L158 126 L42 126 Z" fill={`url(#${id}c)`} />
    <path d="M52 56 L148 56 L150 70 L50 70 Z" fill="#4c6ef5" opacity={0.6} />
    <rect x={92} y={78} width={16} height={11} rx={2} fill="#d4af37" />
    <path d="M60 64 L56 120" stroke="#1b2a6b" strokeWidth={1.5} opacity={0.5} />
    <path d="M140 64 L144 120" stroke="#1b2a6b" strokeWidth={1.5} opacity={0.5} />
  </svg>
);

const Zapatilla: Producto = ({ id }) => (
  <svg viewBox="0 0 200 140" width="100%" height="100%">
    <defs>
      <linearGradient id={`${id}z`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="1" stopColor="#dfe4ec" />
      </linearGradient>
    </defs>
    <path d="M24 98 C30 72 56 66 76 58 C88 70 104 74 120 76 C150 80 172 86 178 102 L180 110 L24 110 Z" fill={`url(#${id}z)`} stroke="#b8c0cc" strokeWidth={1.5} />
    <path d="M22 108 L182 108 L180 120 C120 124 70 124 24 120 Z" fill="#f4f6f9" stroke="#b8c0cc" strokeWidth={1.5} />
    <path d="M76 58 C70 72 72 86 84 96" fill="none" stroke="#c8ced8" strokeWidth={2} />
    {[0, 1, 2, 3].map((i) => (
      <path key={i} d={`M${88 + i * 8} ${68 + i * 2} L${96 + i * 8} ${62 + i * 2}`} stroke="#8a94a3" strokeWidth={2.4} strokeLinecap="round" />
    ))}
    <path d="M104 92 C126 88 150 92 168 100" fill="none" stroke="#2f8cff" strokeWidth={4} strokeLinecap="round" />
  </svg>
);

const Celular: Producto = ({ id }) => (
  <svg viewBox="0 0 200 140" width="100%" height="100%">
    <defs>
      <linearGradient id={`${id}p`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#3a3f48" />
        <stop offset="1" stopColor="#111317" />
      </linearGradient>
      <linearGradient id={`${id}s`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#2f8cff" />
        <stop offset="0.5" stopColor="#7c3aed" />
        <stop offset="1" stopColor="#ff6b9a" />
      </linearGradient>
    </defs>
    <rect x={72} y={10} width={58} height={122} rx={11} fill={`url(#${id}p)`} />
    <rect x={76} y={14} width={50} height={114} rx={8} fill={`url(#${id}s)`} />
    <rect x={92} y={18} width={18} height={5} rx={2.5} fill="#111317" />
    <path d="M76 70 C92 60 108 84 126 70 L126 128 L76 128 Z" fill="white" opacity={0.12} />
  </svg>
);

const Anteojos: Producto = ({ id }) => (
  <svg viewBox="0 0 200 140" width="100%" height="100%">
    <defs>
      <linearGradient id={`${id}l`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2b2f38" />
        <stop offset="1" stopColor="#6b4a2b" />
      </linearGradient>
    </defs>
    <path d="M20 56 L180 56" stroke="#1c1f25" strokeWidth={5} strokeLinecap="round" />
    <path d="M26 58 C26 92 86 96 90 62 L90 56 L26 56 Z" fill={`url(#${id}l)`} stroke="#1c1f25" strokeWidth={4} />
    <path d="M110 56 L110 62 C114 96 174 92 174 58 L174 56 Z" fill={`url(#${id}l)`} stroke="#1c1f25" strokeWidth={4} />
    <path d="M90 60 C96 54 104 54 110 60" fill="none" stroke="#1c1f25" strokeWidth={4} />
    <path d="M36 64 L56 64" stroke="white" strokeWidth={3} opacity={0.35} strokeLinecap="round" />
    <path d="M120 64 L140 64" stroke="white" strokeWidth={3} opacity={0.35} strokeLinecap="round" />
  </svg>
);

const Notebook: Producto = ({ id }) => (
  <svg viewBox="0 0 200 140" width="100%" height="100%">
    <defs>
      <linearGradient id={`${id}n`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#0f4c81" />
        <stop offset="0.6" stopColor="#38bdf8" />
        <stop offset="1" stopColor="#a5f3fc" />
      </linearGradient>
    </defs>
    <rect x={44} y={22} width={112} height={74} rx={5} fill="#2b2f38" />
    <rect x={48} y={26} width={104} height={66} rx={2} fill={`url(#${id}n)`} />
    <path d="M30 98 L170 98 L162 112 L38 112 Z" fill="#c9ced6" />
    <rect x={88} y={98} width={24} height={4} rx={2} fill="#9aa2ae" />
  </svg>
);

const Tablet: Producto = ({ id }) => (
  <svg viewBox="0 0 200 140" width="100%" height="100%">
    <defs>
      <linearGradient id={`${id}t`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fb923c" />
        <stop offset="0.5" stopColor="#ec4899" />
        <stop offset="1" stopColor="#6366f1" />
      </linearGradient>
    </defs>
    <rect x={40} y={26} width={120} height={88} rx={9} fill="#e4e7ec" stroke="#c3c9d2" />
    <rect x={46} y={32} width={108} height={76} rx={4} fill={`url(#${id}t)`} />
  </svg>
);

const Auriculares: Producto = ({ id }) => (
  <svg viewBox="0 0 200 140" width="100%" height="100%">
    <defs>
      <linearGradient id={`${id}a`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3a3f48" />
        <stop offset="1" stopColor="#15171b" />
      </linearGradient>
    </defs>
    <path d="M58 86 C52 30 148 30 142 86" fill="none" stroke={`url(#${id}a)`} strokeWidth={10} strokeLinecap="round" />
    <path d="M60 46 C80 30 120 30 140 46" fill="none" stroke="#5b616c" strokeWidth={3} opacity={0.6} />
    <rect x={42} y={72} width={32} height={50} rx={14} fill={`url(#${id}a)`} />
    <rect x={126} y={72} width={32} height={50} rx={14} fill={`url(#${id}a)`} />
    <rect x={50} y={80} width={8} height={34} rx={4} fill="#2f8cff" opacity={0.85} />
    <rect x={142} y={80} width={8} height={34} rx={4} fill="#2f8cff" opacity={0.85} />
  </svg>
);

const Reloj: Producto = ({ id }) => (
  <svg viewBox="0 0 200 140" width="100%" height="100%">
    <defs>
      <linearGradient id={`${id}r`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#22c55e" />
        <stop offset="1" stopColor="#0ea5e9" />
      </linearGradient>
    </defs>
    <rect x={82} y={6} width={36} height={128} rx={12} fill="#2b2f38" />
    <rect x={70} y={36} width={60} height={68} rx={16} fill="#15171b" />
    <rect x={76} y={42} width={48} height={56} rx={11} fill="#0b1220" />
    <circle cx={100} cy={70} r={18} fill="none" stroke={`url(#${id}r)`} strokeWidth={5} />
    <text x={100} y={74} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={11} fill="white">
      10:09
    </text>
  </svg>
);

const Campera: Producto = ({ id }) => (
  <svg viewBox="0 0 200 140" width="100%" height="100%">
    <defs>
      <linearGradient id={`${id}h`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#1e3a8a" />
        <stop offset="1" stopColor="#0f1f4d" />
      </linearGradient>
    </defs>
    <path d="M76 20 C84 10 116 10 124 20 L150 32 L170 96 L152 102 L142 66 L142 128 L58 128 L58 66 L48 102 L30 96 L50 32 Z" fill={`url(#${id}h)`} />
    <path d="M80 20 C86 40 114 40 120 20" fill="#16307a" />
    <path d="M100 34 L100 128" stroke="#9aa9d6" strokeWidth={1.6} />
    <rect x={72} y={92} width={56} height={18} rx={4} fill="#16307a" />
  </svg>
);

const Lampara: Producto = () => (
  <svg viewBox="0 0 200 140" width="100%" height="100%">
    <path d="M70 20 L130 20 L144 62 L56 62 Z" fill="#e7dcc8" stroke="#c9b99c" strokeWidth={2} />
    <rect x={97} y={62} width={6} height={52} fill="#8a7a63" />
    <ellipse cx={100} cy={118} rx={30} ry={7} fill="#8a7a63" />
    <ellipse cx={100} cy={62} rx={44} ry={6} fill="#fff7d6" opacity={0.7} />
  </svg>
);

type ItemTienda = { nombre: string; marca: string; precio: number; P: Producto };
const DESTACADOS: ItemTienda[] = [
  { nombre: "Cartera Classic", marca: "Urbana", precio: 74900, P: Cartera },
  { nombre: "Zapatillas Urban", marca: "Street", precio: 59900, P: Zapatilla },
  { nombre: "Smartphone X12", marca: "Nova", precio: 649900, P: Celular },
  { nombre: "Anteojos de Sol", marca: "Fashion Shades", precio: 29900, P: Anteojos },
  { nombre: "Auriculares Inalámbricos", marca: "Sonic", precio: 89900, P: Auriculares },
];
const ELECTRONICA: ItemTienda[] = [
  { nombre: "Notebook Pro 14", marca: "Nova", precio: 1820000, P: Notebook },
  { nombre: "Notebook Air 13", marca: "Lumen", precio: 2340000, P: Notebook },
  { nombre: "Tablet 11 pulgadas", marca: "Nova", precio: 455000, P: Tablet },
  { nombre: "Smartwatch Fit", marca: "Pulse", precio: 159900, P: Reloj },
  { nombre: "Smartphone X12", marca: "Nova", precio: 649900, P: Celular },
  { nombre: "Auriculares Inalámbricos", marca: "Sonic", precio: 89900, P: Auriculares },
  { nombre: "Tablet Lite 10", marca: "Lumen", precio: 325000, P: Tablet },
  { nombre: "Smartphone Lite", marca: "Pulse", precio: 285000, P: Celular },
];
const CATEGORIAS: [string, Producto][] = [
  ["Calzado", Zapatilla],
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
            {seccion === "Electrónica" ? "Electrónica" : "Todas las categorías"} <span style={{ fontSize: 9 }}>▾</span>
          </div>
          <div style={{ width: 52, height: "100%", background: AZUL, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icono d={I_LUPA} />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "white" }}>
          <Icono d={I_USUARIO} />
          <div style={{ lineHeight: 1.15 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700 }}>Hola, Mary</div>
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
      <it.P id={id} />
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
          { P: Zapatilla, x: 790, y: 210, w: 190, d: 16 },
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

const Catalogo: React.FC<{ frame: number }> = ({ frame }) => {
  const f0 = ESC.catalogo[0];
  const destacada = interpolate(frame, [TAP_PRODUCTO - 14, TAP_PRODUCTO - 4], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: 0, top: HEADER_H, width: PW, height: PH - HEADER_H, background: "#f4f6f9" }}>
      <div style={{ position: "absolute", left: 40, top: 24, fontSize: 28, fontWeight: 800, color: TINTA }}>Catálogo</div>
      <div style={{ position: "absolute", left: 270, top: 34, fontSize: 12, color: TINTA_2 }}>11 productos</div>
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
          Electrónica <span style={{ fontSize: 9 }}>▾</span>
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
          ["Nova", 4],
          ["Lumen", 3],
          ["Pulse", 2],
          ["Sonic", 2],
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
        {ELECTRONICA.map((it, i) => (
          <CardProducto
            key={it.nombre}
            it={it}
            id={`elec${i}`}
            w={207}
            h={300}
            t={interpolate(frame, [f0 + 6 + i * 4, f0 + 20 + i * 4], [0, 1], clamp)}
            destacada={i === 5 ? destacada : 0}
          />
        ))}
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
        <div style={{ position: "absolute", left: 24, top: 18, fontSize: 11.5, color: TINTA_2 }}>Catálogo / Electrónica</div>
        {/* Thumbnails */}
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ position: "absolute", left: 24, top: 48 + i * 82, width: 64, height: 70, borderRadius: 8, border: `2px solid ${i === vista ? AZUL : BORDE}`, background: "#f6f7fa", padding: 4, boxSizing: "border-box" }}>
            <div style={{ width: "100%", height: "100%", transform: `rotate(${(i - 1) * 12}deg)` }}>
              <Auriculares id={`thumb${i}`} />
            </div>
          </div>
        ))}
        {/* Main image */}
        <div style={{ position: "absolute", left: 104, top: 48, width: 430, height: 470, borderRadius: 12, background: "radial-gradient(circle at 50% 45%, #ffffff, #eef1f6)", display: "flex", alignItems: "center", justifyContent: "center", opacity: entra(0) }}>
          <div style={{ width: 380, height: 270, transform: `rotate(${(vista - 1) * 12}deg) scale(${0.9 + entra(0) * 0.1})`, filter: "drop-shadow(0 20px 18px rgba(15,25,45,0.25))" }}>
            <Auriculares id="principal" />
          </div>
        </div>
        {/* Info */}
        <div style={{ position: "absolute", left: 566, top: 50, width: 210, opacity: entra(6) }}>
          <div style={{ fontSize: 11.5, color: AZUL }}>Ver más productos de Sonic</div>
          <div style={{ fontSize: 23, fontWeight: 800, color: TINTA, marginTop: 10, lineHeight: 1.2 }}>Auriculares Inalámbricos</div>
          <div style={{ fontSize: 12, color: "#f5b301", marginTop: 8 }}>
            ★★★★★ <span style={{ color: TINTA_2 }}>(128)</span>
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, color: TINTA, marginTop: 14 }}>{pesos(89900)}</div>
          <div style={{ fontSize: 11.5, color: VERDE, fontWeight: 700, marginTop: 4 }}>6 cuotas de {pesos(14983)}</div>
          <div style={{ fontSize: 11.5, color: TINTA_2, marginTop: 16, lineHeight: 1.6 }}>
            • Cancelación de ruido
            <br />• 30 h de batería
            <br />• Bluetooth 5.3
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            {["#15171b", "#e4e7ec", "#2f8cff"].map((c, i) => (
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

const PEDIDO = [
  { nombre: "Auriculares Inalámbricos", precio: 89900, P: Auriculares },
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
              ["Contacto", "11 5328-8468 · mary@mail.com"],
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
        <div style={{ fontSize: 26, fontWeight: 800, color: TINTA, marginTop: 24 }}>¡Gracias por tu compra, Mary!</div>
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
  [TAP_ELECTRONICA - 2, 643, 86],
  [TAP_PRODUCTO - 2, 640, 610],
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
  catalogo: "Electrónica",
  producto: "Electrónica",
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
