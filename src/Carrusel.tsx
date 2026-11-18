import { AbsoluteFill, Img, staticFile, useVideoConfig } from "remotion";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import { Dispositivo } from "./Dispositivos";
import { FondoAbstracto } from "./FondoAbstracto";
import { DispositivoFoto, NotebookFoto } from "./Mockups";

// Carousel recipe for LinkedIn / Instagram (1080x1350 4:5, or 1080x1080):
// swipeable stills, one idea per slide, same look as the ads (wavy grey
// background, orange accent). Cover with a photo panel, slides with a real
// app screen in a phone (points on the left), a tablet or a notebook (points
// under the device), and a closing slide with "Agendá una demo".

const NARANJA = "#FF8C42";
const LOGO_W = 2028;
const LOGO_H = 693;

const Logo: React.FC<{ w: number }> = ({ w }) => {
  const capa: React.CSSProperties = { position: "absolute", left: 0, top: 0, width: w, height: (w * LOGO_H) / LOGO_W, maxWidth: "none" };
  return (
    <div style={{ position: "relative", width: w, height: (w * LOGO_H) / LOGO_W }}>
      <Img src={staticFile("axonia-letras.png")} style={capa} />
      <Img src={staticFile("axonia-icono.png")} style={{ ...capa, filter: "drop-shadow(0 0 24px rgba(125,211,252,0.5))" }} />
    </div>
  );
};

type Disp = "celular" | "tablet" | "notebook";
export type Placa = {
  Pantalla: React.FC<{ frame: number; tab: boolean }>;
  frame: number;
  disp: Disp;
  etiqueta: string;
  titulo: string;
  puntos: string[];
};
export type ConfigCarrusel = {
  // linea2 (orange) or bajada (lighter line with its own highlight); tamano scales the title font.
  portada: { foto: string; posicion?: string; etiqueta?: string; linea1: string; linea2?: string; bajada?: React.ReactNode; tamano?: number; espejo?: boolean };
  placas: Placa[];
  cierre: { etiqueta: string; titulo: React.ReactNode; puntos?: string[] };
};
type Producto = Placa;

// Page dots at the bottom and the swipe arrow on the right edge.
const Paginas: React.FC<{ n: number; total: number }> = ({ n, total }) => (
  <>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 44, display: "flex", justifyContent: "center", gap: 12 }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{ width: i + 1 === n ? 34 : 12, height: 12, borderRadius: 6, background: i + 1 === n ? NARANJA : "rgba(255,255,255,0.3)" }} />
      ))}
    </div>
    {n < total ? (
      <div style={{ position: "absolute", right: 34, bottom: 30, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.75)", fontSize: 34, fontWeight: 600 }}>→</div>
    ) : null}
  </>
);

// Cover: short text on the left and a photo panel bleeding off the right
// edge (the usual carousel opening), cropped to fill, never stretched.
// Square version (1080x1080): same slides with smaller devices and tighter
// spacing.
const useCuadrado = () => useVideoConfig().height < 1200;

const Portada: React.FC<{ c: ConfigCarrusel["portada"]; total: number }> = ({ c, total }) => {
  const q = useCuadrado();
  return (
  <AbsoluteFill style={{ fontFamily: "Inter, sans-serif" }}>
    <FondoAbstracto paleta="gris" estilo="ondas" />
    <div style={{ position: "absolute", right: -40, top: q ? 90 : 110, bottom: q ? 120 : 150, width: q ? 400 : 440, borderRadius: 32, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.55)", border: "2px solid rgba(255,255,255,0.12)" }}>
      <Img src={staticFile(c.foto)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: c.posicion ?? "50% 50%", transform: c.espejo ? "scaleX(-1)" : undefined }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(20,22,26,0.35), rgba(20,22,26,0) 40%)" }} />
    </div>
    <div style={{ position: "absolute", left: 80, width: 520, top: q ? 230 : 330 }}>
      <Logo w={400} />
      {c.etiqueta ? <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 30, fontWeight: 700, letterSpacing: 6, marginTop: 22 }}>{c.etiqueta}</div> : null}
      <div style={{ width: 80, height: 7, borderRadius: 4, background: NARANJA, margin: q ? "48px 0 34px" : "64px 0 44px" }} />
      <div style={{ color: "white", fontSize: (q ? 64 : 72) * (c.tamano ?? 1), fontWeight: 800, lineHeight: 1.05, letterSpacing: -1.5 }}>{c.linea1}</div>
      {c.linea2 ? <div style={{ color: NARANJA, fontSize: (q ? 64 : 72) * (c.tamano ?? 1), fontWeight: 800, lineHeight: 1.05, letterSpacing: -1.5, marginTop: 8 }}>{c.linea2}</div> : null}
      {c.bajada ? <div style={{ color: "rgba(255,255,255,0.9)", fontSize: q ? 34 : 38, fontWeight: 500, lineHeight: 1.3, marginTop: q ? 26 : 34 }}>{c.bajada}</div> : null}
    </div>
    <Paginas n={1} total={total} />
  </AbsoluteFill>
  );
};

// Device with the app screen. The tablet screen (1180x820) fills the
// notebook screen (1280x800) by width; the bottom is cut.
const Equipo: React.FC<{ p: Producto }> = ({ p }) => {
  const q = useCuadrado();
  if (p.disp === "celular") {
    return (
      <Dispositivo tipo="celular" w={390} h={844}>
        <p.Pantalla frame={p.frame} tab={false} />
      </Dispositivo>
    );
  }
  if (p.disp === "tablet") {
    return (
      <DispositivoFoto tipo="tablet" ancho={q ? 740 : 880}>
        <p.Pantalla frame={p.frame} tab />
      </DispositivoFoto>
    );
  }
  const k = 1280 / 1180;
  return (
    <NotebookFoto ancho={q ? 840 : 1000}>
      <div style={{ width: 1180, height: 820, transform: `scale(${k})`, transformOrigin: "0 0" }}>
        <p.Pantalla frame={p.frame} tab />
      </div>
    </NotebookFoto>
  );
};

const Punto: React.FC<{ t: string; chico?: boolean }> = ({ t, chico }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14, padding: chico ? "14px 22px" : "20px 26px", borderRadius: 18, background: "rgba(12,14,20,0.86)", border: "1px solid rgba(255,255,255,0.14)", boxShadow: "0 10px 30px rgba(0,0,0,0.45)", color: "white", fontSize: chico ? 27 : 32, fontWeight: 600, lineHeight: 1.2, whiteSpace: chico ? "nowrap" : undefined }}>
    <div style={{ width: 13, height: 13, borderRadius: 7, background: NARANJA, flexShrink: 0 }} />
    {t}
  </div>
);

const PlacaProducto: React.FC<{ p: Producto; n: number; total: number }> = ({ p, n, total }) => {
  const cel = p.disp === "celular";
  const q = useCuadrado();
  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif" }}>
      <FondoAbstracto paleta="gris" estilo="ondas" />
      <div style={{ position: "absolute", right: 56, top: 54 }}>
        <Logo w={190} />
      </div>
      <div style={{ position: "absolute", left: 70, right: 300, top: q ? 96 : 120 }}>
        <div style={{ color: NARANJA, fontSize: 30, fontWeight: 700, letterSpacing: 6 }}>{p.etiqueta}</div>
        <div style={{ color: "white", fontSize: q ? 54 : 62, fontWeight: 800, lineHeight: 1.08, letterSpacing: -1, marginTop: 14, textShadow: "0 4px 24px rgba(0,0,0,0.5)" }}>{p.titulo}</div>
      </div>
      {cel ? (
        <>
          <div style={{ position: "absolute", right: q ? 130 : 100, top: q ? 320 : 420, perspective: 2400 }}>
            <div style={{ transform: `scale(${q ? 0.7 : 0.86}) rotateY(-10deg) rotateX(4deg)`, transformOrigin: "50% 0" }}>
              <Equipo p={p} />
            </div>
          </div>
          <div style={{ position: "absolute", left: 60, width: 440, top: q ? 450 : 640, display: "flex", flexDirection: "column", gap: q ? 18 : 22 }}>
            {p.puntos.map((t) => (
              <Punto key={t} t={t} />
            ))}
          </div>
        </>
      ) : (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: q ? (p.disp === "tablet" ? 300 : 300) : p.disp === "tablet" ? 410 : 400, display: "flex", justifyContent: "center", perspective: 2600 }}>
            <div style={{ transform: `scale(1)`, transformOrigin: "50% 0" }}>
              <Equipo p={p} />
            </div>
          </div>
          <div style={{ position: "absolute", left: 60, right: 60, bottom: q ? 92 : 110, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14 }}>
            {p.puntos.map((t) => (
              <Punto key={t} t={t} chico />
            ))}
          </div>
        </>
      )}
      <Paginas n={n} total={total} />
    </AbsoluteFill>
  );
};

const Cierre: React.FC<{ c: ConfigCarrusel["cierre"]; total: number }> = ({ c, total }) => {
  const q = useCuadrado();
  return (
  <AbsoluteFill style={{ fontFamily: "Inter, sans-serif", alignItems: "center" }}>
    <FondoAbstracto paleta="gris" estilo="ondas" />
    <div style={{ position: "absolute", left: 90, right: 90, top: q ? 170 : 250, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
      <Logo w={520} />
      <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 28, fontWeight: 600, letterSpacing: 6, marginTop: 24 }}>{c.etiqueta}</div>
      <div style={{ color: "white", fontSize: 64, fontWeight: 800, lineHeight: 1.1, letterSpacing: -1, marginTop: q ? 60 : 80 }}>
        {c.titulo}
      </div>
      {c.puntos ? (
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14, marginTop: q ? 34 : 44 }}>
          {c.puntos.map((t) => (
            <Punto key={t} t={t} chico />
          ))}
        </div>
      ) : null}
      <div style={{ marginTop: q ? 60 : 80, padding: "26px 60px", borderRadius: 999, background: NARANJA, color: "white", fontSize: 40, fontWeight: 700, boxShadow: "0 12px 40px rgba(255,140,66,0.45)" }}>Agendá una demo</div>
      <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 32, fontWeight: 600, letterSpacing: 2, marginTop: 30 }}>axonia.com.ar</div>
    </div>
    <Paginas n={total} total={total} />
  </AbsoluteFill>
  );
};

export const NARANJA_CARRUSEL = NARANJA;
export const armarCarrusel = (cfg: ConfigCarrusel) => {
  const total = cfg.placas.length + 2;
  // foto: optional override of the cover photo (to try alternatives).
  const Componente: React.FC<{ placa: number; foto?: string }> = ({ placa, foto }) => {
    if (placa <= 1) return <Portada c={foto ? { ...cfg.portada, foto } : cfg.portada} total={total} />;
    if (placa >= total) return <Cierre c={cfg.cierre} total={total} />;
    return <PlacaProducto p={cfg.placas[placa - 2]} n={placa} total={total} />;
  };
  return { Componente, total };
};
