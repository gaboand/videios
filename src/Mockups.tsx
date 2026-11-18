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

// Notebook: lid with a thin bezel and camera, slightly tilted back, and the
// base (keyboard and trackpad) lying flat towards the viewer.
export const NotebookReal: React.FC<{ w: number; h: number; ry?: number; rx?: number; children: React.ReactNode }> = ({ w, h, ry = -16, rx = 14, children }) => {
  const B = 16;
  const W = w + 2 * B;
  const H = h + B + 30;
  const baseW = W * 1.1;
  const baseD = H * 0.72;
  return (
    <div style={{ position: "relative", width: W, height: H + baseD * 0.55 + 40, perspective: 3600 }}>
      <div style={sombraPiso(baseW, H + baseD * 0.35, 0.6)} />
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transformStyle: "preserve-3d", transform: `rotateX(${rx}deg) rotateY(${ry}deg)`, transformOrigin: "50% 100%" }}>
        {/* Base, hinged at the bottom of the lid. */}
        <div
          style={{
            position: "absolute",
            left: (W - baseW) / 2,
            top: H,
            width: baseW,
            height: baseD,
            transformOrigin: "50% 0",
            transform: "rotateX(-80deg)",
            borderRadius: "10px 10px 26px 26px",
            background: "linear-gradient(180deg, #4a4e55, #2e3136)",
            boxShadow: "inset 0 2px 0 rgba(255,255,255,0.15), inset 0 -6px 0 #1d1f23",
          }}
        >
          {/* Keyboard. */}
          <div
            style={{
              position: "absolute",
              left: "9%",
              right: "9%",
              top: "8%",
              height: "46%",
              borderRadius: 10,
              background: "#16181b",
              backgroundImage:
                "repeating-linear-gradient(90deg, transparent 0 3px, #2a2d32 3px 34px, transparent 34px 38px), repeating-linear-gradient(0deg, transparent 0 4px, rgba(0,0,0,0) 4px 30px, #16181b 30px 36px)",
              opacity: 0.95,
            }}
          />
          {/* Trackpad. */}
          <div style={{ position: "absolute", left: "33%", right: "33%", top: "60%", height: "30%", borderRadius: 12, background: "#3a3e44", boxShadow: "inset 0 0 0 2px #2b2e33" }} />
        </div>
        {/* Lid. */}
        <div style={{ position: "absolute", inset: 0, borderRadius: "24px 24px 8px 8px", padding: 3, background: "linear-gradient(135deg, #7d8796, #2b3038 45%, #5c6676)", boxShadow: "0 40px 90px rgba(0,0,0,0.5)" }}>
          <div style={{ width: "100%", height: "100%", borderRadius: "21px 21px 6px 6px", background: "#0b0d10", boxSizing: "border-box", padding: `${B}px ${B}px 0`, position: "relative" }}>
            <div style={{ position: "absolute", left: "50%", top: 5, width: 7, height: 7, marginLeft: -3.5, borderRadius: "50%", background: "#26324a" }} />
            <div style={{ width: w, height: h, borderRadius: 6, overflow: "hidden", position: "relative" }}>
              {children}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(115deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 40%)" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
