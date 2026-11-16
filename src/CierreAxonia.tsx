import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import { FondoAbstracto } from "./FondoAbstracto";

// Brand closing for the integral video (16:9 or 9:16): the Axonia logo
// arrives spinning from the background (as in LogoAxonia), moves up, the four
// service pills appear and then the "Agendá una demo" button with the website.

const LOGO_W = 2028;
const LOGO_H = 693;
const ICON_CENTER = { x: 921, y: 325 };
const NARANJA = "#FF8C42";
const PILLS = ["Gestión del Riesgo", "Automatizaciones", "Herramientas de Cobranzas", "Core Lending"];
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Timeline (frames from the start of the closing).
const SUBIDA = 52;
const PILLS_DESDE = 70;
const ESCALON = 6;
const BOTON = 100;
export const CIERRE_FRAMES = 168;

// Layout per format.
const LAYOUT = {
  ancho: { logoW: 760, logoY: 300, pillW: 430, pillH: 72, pillsY: 540, fila: true, gap: 22, botonY: 700, botonW: 560, botonH: 100, fuente: 28, fuenteBoton: 38 },
  alto: { logoW: 900, logoY: 620, pillW: 560, pillH: 80, pillsY: 860, fila: false, gap: 28, botonY: 1330, botonW: 640, botonH: 116, fuente: 32, fuenteBoton: 44 },
};

export const CierreAxonia: React.FC<{ fondo: "ondas"; paleta: "gris" }> = ({ fondo, paleta }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const L = width > height ? LAYOUT.ancho : LAYOUT.alto;

  // Logo arrival: tiny and blurred, grows past its size and settles.
  const llegada = spring({ frame: frame - 4, fps, config: { damping: 11, stiffness: 70 } });
  const entrada = interpolate(frame, [4, 34], [0, 1], clamp);
  const subida = interpolate(frame, [SUBIDA, SUBIDA + 24], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const logoY = interpolate(subida, [0, 1], [height / 2, L.logoY]);
  const escala = interpolate(llegada, [0, 1], [0.08, 1]) * interpolate(subida, [0, 1], [1, 0.82]);
  const desenfoque = interpolate(entrada, [0, 1], [18, 0]);
  const giro = interpolate(llegada, [0, 1], [-540, 0]);
  const letras = interpolate(frame, [20, 42], [0, 1], clamp);
  const onda = interpolate(frame, [28, 68], [0, 1], clamp);
  const brillo = 12 + Math.max(0, Math.sin((frame - 50) / 12)) * 18;

  const k = L.logoW / LOGO_W;
  const iconoX = width / 2 + (ICON_CENTER.x - LOGO_W / 2) * k * escala;
  const iconoY = logoY + (ICON_CENTER.y - LOGO_H / 2) * k * escala;
  const capa: React.CSSProperties = { position: "absolute", left: 0, top: 0, width: LOGO_W, height: LOGO_H };

  // Pills: a row in 16:9, a column in 9:16.
  const pillPos = (i: number) =>
    L.fila
      ? { left: (width - (PILLS.length * L.pillW + (PILLS.length - 1) * L.gap)) / 2 + i * (L.pillW + L.gap), top: L.pillsY }
      : { left: (width - L.pillW) / 2, top: L.pillsY + i * (L.pillH + L.gap) };

  const boton = spring({ frame: frame - BOTON, fps, config: { damping: 12, stiffness: 120 } });
  // Soft pulse once the button is in, inviting the click.
  const pulso = frame > BOTON + 20 ? 1 + 0.03 * Math.max(0, Math.sin((frame - BOTON - 20) / 7)) : 1;
  const halo = interpolate((frame - BOTON - 20) % 40, [0, 40], [0, 1], clamp);
  const web = interpolate(frame, [BOTON + 14, BOTON + 30], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif" }}>
      <FondoAbstracto paleta={paleta} estilo={fondo} />
      {onda > 0 && onda < 1 ? (
        <div
          style={{
            position: "absolute",
            left: iconoX,
            top: iconoY,
            width: onda * 1400,
            height: onda * 1400,
            borderRadius: "50%",
            border: "4px solid #e5e7eb",
            transform: "translate(-50%, -50%)",
            opacity: (1 - onda) * 0.8,
            boxShadow: "0 0 20px rgba(255,255,255,0.5)",
          }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          left: width / 2,
          top: logoY,
          width: LOGO_W,
          height: LOGO_H,
          transform: `translate(-50%, -50%) scale(${k * escala})`,
          opacity: entrada,
          filter: `blur(${desenfoque / (k * escala)}px)`,
        }}
      >
        <Img src={staticFile("axonia-letras.png")} style={{ ...capa, opacity: letras, filter: "drop-shadow(0 0 18px rgba(255,255,255,0.3))" }} />
        <Img
          src={staticFile("axonia-icono.png")}
          style={{
            ...capa,
            transformOrigin: `${ICON_CENTER.x}px ${ICON_CENTER.y}px`,
            transform: `rotate(${giro}deg)`,
            filter: `drop-shadow(0 0 ${brillo}px rgba(125,211,252,0.9))`,
          }}
        />
      </div>
      {PILLS.map((texto, i) => {
        const a = spring({ frame: frame - PILLS_DESDE - i * ESCALON, fps, config: { damping: 14, stiffness: 110 } });
        return (
          <div
            key={texto}
            style={{
              position: "absolute",
              ...pillPos(i),
              width: L.pillW,
              height: L.pillH,
              borderRadius: L.pillH / 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255,255,255,0.10)",
              border: "2px solid rgba(255,255,255,0.35)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.25)",
              backdropFilter: "blur(14px)",
              opacity: a,
              transform: `translateY(${(1 - a) * 40}px) scale(${0.9 + a * 0.1})`,
              fontWeight: 600,
              fontSize: L.fuente,
              color: "white",
              whiteSpace: "nowrap",
            }}
          >
            {texto}
          </div>
        );
      })}
      {/* Call to action */}
      <div style={{ position: "absolute", left: (width - L.botonW) / 2, top: L.botonY, width: L.botonW, height: L.botonH, opacity: boton, transform: `translateY(${(1 - boton) * 50}px) scale(${(0.85 + boton * 0.15) * pulso})` }}>
        {frame > BOTON + 20 ? (
          <div
            style={{
              position: "absolute",
              inset: -halo * 22,
              borderRadius: (L.botonH + halo * 44) / 2,
              border: `3px solid ${NARANJA}`,
              opacity: (1 - halo) * 0.7,
            }}
          />
        ) : null}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: L.botonH / 2,
            background: `linear-gradient(180deg, #ff9d5c, ${NARANJA} 55%, #f07a2c)`,
            boxShadow: "0 14px 40px rgba(255,140,66,0.45), inset 0 1px 0 rgba(255,255,255,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 18,
            color: "white",
            fontWeight: 700,
            fontSize: L.fuenteBoton,
            letterSpacing: 0.3,
          }}
        >
          <svg width={L.fuenteBoton} height={L.fuenteBoton} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 10h18M8 3v4M16 3v4" />
          </svg>
          Agendá una demo
        </div>
      </div>
      {/* Website under the button. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: L.botonY + L.botonH + (L.fila ? 34 : 44),
          textAlign: "center",
          color: "rgba(255,255,255,0.85)",
          fontWeight: 600,
          fontSize: L.fuenteBoton * 0.8,
          letterSpacing: 2,
          opacity: web,
          transform: `translateY(${(1 - web) * 16}px)`,
        }}
      >
        axonia.com.ar
      </div>
    </AbsoluteFill>
  );
};
