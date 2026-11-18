import { Img, staticFile } from "remotion";
// Realistic device mockups for stills (carousels): a tablet and a notebook
// seen in perspective, with thin bezels, metal rims, a visible edge and a
// soft shadow on the floor. The screen content is passed as children at its
// own size (w x h CSS px).

// The screen content is drawn a little larger than the photo's glass and then
// clipped with a mask of the glass (public/carrusel/<tipo>-pantalla.png).
const mascara = (src: string, W: number, H: number): React.CSSProperties => ({
  position: "absolute",
  left: 0,
  top: 0,
  width: W,
  height: H,
  WebkitMaskImage: `url(${staticFile(src)})`,
  maskImage: `url(${staticFile(src)})`,
  WebkitMaskSize: "100% 100%",
  maskSize: "100% 100%",
});

const sombraPiso = (w: number, top: number, opacidad = 0.55): React.CSSProperties => ({
  position: "absolute",
  left: -w * 0.05,
  width: w * 1.1,
  top,
  height: 80,
  borderRadius: "50%",
  background: `radial-gradient(ellipse at center, rgba(0,0,0,${opacidad}) 0%, rgba(0,0,0,0) 70%)`,
  filter: "blur(6px)",
});

// Tablet in landscape: 18 px bezel, rounded 46 px, metal rim and an edge
// plane behind it that shows as the side of the device.
export const TabletReal: React.FC<{ w: number; h: number; ry?: number; rx?: number; children: React.ReactNode }> = ({ w, h, ry = 24, rx = 10, children }) => {
  const B = 22;
  const W = w + 2 * B;
  const H = h + 2 * B;
  return (
    <div style={{ position: "relative", width: W, height: H + 60, perspective: 3200 }}>
      <div style={sombraPiso(W, H - 10)} />
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transformStyle: "preserve-3d", transform: `rotateY(${ry}deg) rotateX(${rx}deg)` }}>
        {/* Edge: two planes behind, lighter, to read as the aluminium side. */}
        <div style={{ position: "absolute", inset: 0, borderRadius: 46, background: "linear-gradient(135deg, #6b7a90, #2a3240 60%, #4f5d72)", transform: "translateZ(-16px)" }} />
        <div style={{ position: "absolute", inset: 0, borderRadius: 46, background: "#1b2029", transform: "translateZ(-8px)" }} />
        <div style={{ position: "absolute", inset: 0, borderRadius: 46, padding: 3, background: "linear-gradient(135deg, #8d9bb0, #39424f 45%, #6f7f96)", boxShadow: "0 40px 80px rgba(0,0,0,0.45)" }}>
          <div style={{ width: "100%", height: "100%", borderRadius: 43, background: "#0b0d10", padding: B - 3, boxSizing: "border-box" }}>
            <div style={{ width: w, height: h, borderRadius: 14, overflow: "hidden", position: "relative" }}>
              {children}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(115deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 35%)" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Notebook from a product photo (public/carrusel/notebook.png, 1084x670,
// background removed): the app screen (1280x800) is mapped onto the photo's
// screen with a perspective matrix, so it sits exactly on the glass.
const NB_MATRIZ = "matrix3d(0.37153578, -0.086574782, 0, -0.00018570713, -0.059937381, 0.44677352, 0, -3.0286637e-05, 0, 0, 1, 0, 295.91121, 139.82941, 0, 1)";
export const NotebookFoto: React.FC<{ ancho: number; children: React.ReactNode }> = ({ ancho, children }) => {
  const k = ancho / 1084;
  return (
    <div style={{ position: "relative", width: ancho, height: 670 * k }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1084, height: 670, transform: `scale(${k})`, transformOrigin: "0 0" }}>
        <Img src={staticFile("carrusel/notebook.png")} style={{ position: "absolute", left: 0, top: 0, width: 1084, height: 670 }} />
        <div style={mascara("carrusel/notebook-pantalla.png", 1084, 670)}>
          <div style={{ position: "absolute", left: 0, top: 0, width: 1280, height: 800, overflow: "hidden", transformOrigin: "0 0", transform: NB_MATRIZ }}>
            {children}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(115deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 40%)" }} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Generic version for the other product photos (background removed): the
// app screen (sw x sh) is mapped onto the photo's screen with a matrix.
const FOTOS = {
  celular: { src: "carrusel/celular.png", mascara: "carrusel/celular-pantalla.png", W: 317, H: 610, sw: 390, sh: 844, m: "matrix3d(0.58034557, -0.045954471, 0, -9.6601991e-05, -0.0077620771, 0.60992361, 0, -4.4173163e-05, 0, 0, 1, 0, 43.923772, 38.868496, 0, 1)" },
  tablet: { src: "carrusel/tablet.png", mascara: "carrusel/tablet-pantalla.png", W: 653, H: 488, sw: 1180, sh: 820, m: "matrix3d(0.33858237, -0.071322198, 0, -0.00019491728, -0.034582385, 0.37658256, 0, -1.9645367e-05, 0, 0, 1, 0, 59.198345, 116.25333, 0, 1)" },
};
export const DispositivoFoto: React.FC<{ tipo: keyof typeof FOTOS; ancho: number; children: React.ReactNode }> = ({ tipo, ancho, children }) => {
  const f = FOTOS[tipo];
  const k = ancho / f.W;
  return (
    <div style={{ position: "relative", width: ancho, height: f.H * k }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: f.W, height: f.H, transform: `scale(${k})`, transformOrigin: "0 0" }}>
        <Img src={staticFile(f.src)} style={{ position: "absolute", left: 0, top: 0, width: f.W, height: f.H }} />
        <div style={mascara(f.mascara, f.W, f.H)}>
          <div style={{ position: "absolute", left: 0, top: 0, width: f.sw, height: f.sh, overflow: "hidden", transformOrigin: "0 0", transform: f.m }}>
            {children}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(115deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 40%)" }} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Notebook seen from the front and a little above: the lid upright and the
// base drawn as a trapezoid (keyboard, trackpad and front lip), the whole
// laptop turned slightly in perspective.
export const NotebookReal: React.FC<{ w: number; h: number; ry?: number; rx?: number; children: React.ReactNode }> = ({ w, h, ry = -12, rx = 6, children }) => {
  const B = 16;
  const W = w + 2 * B;
  const H = h + B + 26;
  const baseW = W * 1.16;
  const baseH = H * 0.2;
  const lado = ((baseW - W * 0.98) / 2 / baseW) * 100;
  return (
    <div style={{ position: "relative", width: baseW, height: H + baseH + 70, perspective: 3600 }}>
      <div style={sombraPiso(baseW, H + baseH - 6, 0.6)} />
      <div style={{ position: "absolute", left: 0, top: 0, width: baseW, transform: `rotateY(${ry}deg) rotateX(${rx}deg)`, transformOrigin: "50% 100%" }}>
        {/* Lid. */}
        <div style={{ marginLeft: (baseW - W) / 2, width: W, height: H, borderRadius: "22px 22px 6px 6px", padding: 3, boxSizing: "border-box", background: "linear-gradient(135deg, #7d8796, #2b3038 45%, #5c6676)", boxShadow: "0 30px 70px rgba(0,0,0,0.45)" }}>
          <div style={{ width: "100%", height: "100%", borderRadius: "19px 19px 4px 4px", background: "#0b0d10", boxSizing: "border-box", padding: `${B}px ${B}px 0`, position: "relative" }}>
            <div style={{ position: "absolute", left: "50%", top: 5, width: 7, height: 7, marginLeft: -3.5, borderRadius: "50%", background: "#26324a" }} />
            <div style={{ width: w, height: h, borderRadius: 6, overflow: "hidden", position: "relative" }}>
              {children}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(115deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 40%)" }} />
            </div>
          </div>
        </div>
        {/* Hinge. */}
        <div style={{ marginLeft: (baseW - W * 0.98) / 2, width: W * 0.98, height: 8, background: "linear-gradient(#1a1c20, #3a3e45)" }} />
        {/* Base: keyboard deck in perspective. */}
        <div style={{ position: "relative", width: baseW, height: baseH, clipPath: `polygon(${lado}% 0, ${100 - lado}% 0, 100% 100%, 0 100%)`, background: "linear-gradient(180deg, #555a62, #3a3e45 70%, #2c2f34)" }}>
          <div
            style={{
              position: "absolute",
              left: `${lado + 6}%`,
              right: `${lado + 6}%`,
              top: "10%",
              height: "52%",
              clipPath: "polygon(2% 0, 98% 0, 100% 100%, 0 100%)",
              background: "#17191c",
              backgroundImage: "repeating-linear-gradient(90deg, #2b2e33 0 30px, #17191c 30px 35px), repeating-linear-gradient(0deg, transparent 0 22px, #17191c 22px 27px)",
              backgroundBlendMode: "darken",
            }}
          />
          <div style={{ position: "absolute", left: "40%", right: "40%", top: "68%", height: "24%", borderRadius: 6, background: "#474b52", boxShadow: "inset 0 0 0 2px #3a3d43" }} />
        </div>
        {/* Front lip. */}
        <div style={{ width: baseW, height: 16, borderRadius: "0 0 18px 18px", background: "linear-gradient(#9aa0a9, #5d626a)", position: "relative" }}>
          <div style={{ position: "absolute", left: "44%", right: "44%", top: 0, height: 7, borderRadius: "0 0 8px 8px", background: "#4a4e55" }} />
        </div>
      </div>
    </div>
  );
};
