// Device chrome (phone, tablet, notebook, monitor) around an app screen of
// w x h CSS px, plus each device's screen size and outer size.

export type Tipo = "celular" | "tablet" | "notebook" | "monitor";
export const TIPOS: Tipo[] = ["celular", "tablet", "notebook", "monitor"];
export const NOMBRES: Record<Tipo, string> = {
  celular: "Celular",
  tablet: "Tablet",
  notebook: "Notebook",
  monitor: "Monitor",
};

// Screen size (CSS px) of each device and its outer size with the chrome.
export const pantallaDe = (tipo: Tipo, vertical: boolean) => {
  switch (tipo) {
    case "celular":
      return { w: 390, h: 844 };
    case "tablet":
      return vertical ? { w: 820, h: 1180 } : { w: 1180, h: 820 };
    case "notebook":
      return { w: 1280, h: 800 };
    case "monitor":
      return { w: 1600, h: 900 };
  }
};
export const exteriorDe = (tipo: Tipo, w: number, h: number) => {
  switch (tipo) {
    case "celular":
      return { W: w + 28, H: h + 28 };
    case "tablet":
      return { W: w + 48, H: h + 48 };
    case "notebook":
      return { W: (w + 28) * 1.14, H: h + 38 + 26 };
    case "monitor":
      return { W: w + 32, H: h + 32 + 140 };
  }
};

export const Dispositivo: React.FC<{
  tipo: Tipo;
  w: number;
  h: number;
  children: React.ReactNode;
}> = ({ tipo, w, h, children }) => {
  const pantalla = children;
  const negro = "linear-gradient(145deg, #2b2e35, #0d0e11)";
  const sombra = "0 50px 100px rgba(0,0,0,0.55)";
  if (tipo === "celular" || tipo === "tablet") {
    const cel = tipo === "celular";
    const pad = cel ? 14 : 24;
    return (
      <div
        style={{
          position: "relative",
          padding: pad,
          borderRadius: cel ? 58 : 44,
          background: negro,
          border: "3px solid #3a3e46",
          boxShadow: sombra,
        }}
      >
        <div
          style={{
            borderRadius: cel ? 44 : 16,
            overflow: "hidden",
            width: w,
            height: h,
          }}
        >
          {pantalla}
        </div>
        <div
          style={
            cel
              ? {
                  position: "absolute",
                  left: "50%",
                  top: pad + 10,
                  width: 100,
                  height: 28,
                  marginLeft: -50,
                  borderRadius: 14,
                  background: "#0a0b0d",
                }
              : {
                  position: "absolute",
                  left: "50%",
                  top: 8,
                  width: 9,
                  height: 9,
                  marginLeft: -4,
                  borderRadius: "50%",
                  background: "#1b2a3a",
                }
          }
        />
      </div>
    );
  }
  if (tipo === "notebook") {
    const lidW = w + 28;
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div
          style={{
            position: "relative",
            padding: "24px 14px 14px",
            borderRadius: "22px 22px 6px 6px",
            background: "#121418",
            border: "2px solid #3a3e46",
            boxShadow: sombra,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 8,
              width: 8,
              height: 8,
              marginLeft: -4,
              borderRadius: "50%",
              background: "#26324a",
            }}
          />
          <div style={{ width: w, height: h, borderRadius: 4, overflow: "hidden" }}>
            {pantalla}
          </div>
        </div>
        <div
          style={{
            position: "relative",
            width: lidW * 1.14,
            height: 26,
            borderRadius: "4px 4px 22px 22px",
            background: "linear-gradient(#d9dde3, #9da3ac)",
            boxShadow: "0 30px 50px rgba(0,0,0,0.45)",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 0,
              width: 200,
              height: 9,
              marginLeft: -100,
              borderRadius: "0 0 10px 10px",
              background: "#868c95",
            }}
          />
        </div>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div
        style={{
          padding: 16,
          borderRadius: 16,
          background: "#0f1013",
          border: "2px solid #34373e",
          boxShadow: sombra,
        }}
      >
        <div style={{ width: w, height: h, borderRadius: 4, overflow: "hidden" }}>
          {pantalla}
        </div>
      </div>
      <div
        style={{
          width: 160,
          height: 118,
          background: "linear-gradient(90deg, #7d838c, #c3c8cf, #7d838c)",
        }}
      />
      <div
        style={{
          width: 460,
          height: 22,
          borderRadius: 11,
          background: "linear-gradient(#c3c8cf, #80868f)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.45)",
        }}
      />
    </div>
  );
};

