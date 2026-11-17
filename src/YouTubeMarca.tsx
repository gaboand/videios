import { AbsoluteFill, Img, staticFile } from "remotion";
import "@fontsource/inter/600.css";
import "@fontsource/inter/800.css";
import { FondoAbstracto } from "./FondoAbstracto";

// Brand images for the Axonia YouTube channel: banner (2560x1440, content
// inside the 1546x423 area that every device shows) and profile picture
// (800x800, shown as a circle).

const LOGO_W = 2028;
const LOGO_H = 693;
const NARANJA = "#FF8C42";

const Logo: React.FC<{ w: number; soloIcono?: boolean }> = ({ w, soloIcono }) => {
  const capa: React.CSSProperties = { position: "absolute", left: 0, top: 0, width: w, height: (w * LOGO_H) / LOGO_W, maxWidth: "none" };
  return (
    <div style={{ position: "relative", width: w, height: (w * LOGO_H) / LOGO_W }}>
      {soloIcono ? null : <Img src={staticFile("axonia-letras.png")} style={capa} />}
      <Img src={staticFile("axonia-icono.png")} style={{ ...capa, filter: "drop-shadow(0 0 30px rgba(125,211,252,0.6))" }} />
    </div>
  );
};

export const BannerYouTube: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: "Inter, sans-serif" }}>
    <FondoAbstracto paleta="gris" estilo="ondas" />
    {/* Safe area: 1546x423 centred. */}
    <div style={{ position: "absolute", left: (2560 - 1546) / 2, top: (1440 - 423) / 2, width: 1546, height: 423, display: "flex", alignItems: "center", gap: 70 }}>
      <Logo w={620} />
      <div style={{ width: 3, height: 230, background: "rgba(255,255,255,0.25)" }} />
      <div>
        <div style={{ color: "white", fontSize: 64, fontWeight: 800, lineHeight: 1.1, letterSpacing: -1 }}>Todo el ciclo del crédito.</div>
        <div style={{ color: NARANJA, fontSize: 64, fontWeight: 800, lineHeight: 1.1, letterSpacing: -1 }}>En una sola plataforma.</div>
        <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 34, fontWeight: 600, marginTop: 22, letterSpacing: 2 }}>axonia.com.ar</div>
      </div>
    </div>
  </AbsoluteFill>
);

// The icon alone reads at small sizes: the layer is placed so the centre of
// the icon's ring (921, 325 in the 2028x693 layer) lands on the centre.
const AVATAR_W = 1700;
export const AvatarYouTube: React.FC = () => {
  const k = AVATAR_W / LOGO_W;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #3a414d 0%, #1b1f26 75%)" }}>
      <div style={{ position: "absolute", left: 400 - 921 * k, top: 400 - 325 * k }}>
        <Logo w={AVATAR_W} soloIcono />
      </div>
    </AbsoluteFill>
  );
};
