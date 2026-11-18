// Realistic device mockups for stills (carousels): a tablet and a notebook
// seen in perspective, with thin bezels, metal rims, a visible edge and a
// soft shadow on the floor. The screen content is passed as children at its
// own size (w x h CSS px).

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
