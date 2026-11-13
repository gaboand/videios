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
import {
  Dispositivo,
  exteriorDe,
  NOMBRES,
  pantallaDe,
  Tipo,
  TIPOS,
} from "./Dispositivos";

// Collections segmentation inside the Axonia app (12s, 9:16 or 16:9): the
// "Vista 3D del cubo segmentado" screen shown on a device. The cube builds
// up, splits into risk bands (blue lowest risk, red highest), each band is
// highlighted and finally the action per segment appears. With
// dispositivo "secuencia" the device changes along the way: phone, tablet,
// notebook and monitor; otherwise the whole story plays on one device.

export const segmentacionAppSchema = z.object({
  fondo: z.enum(["ondas", "red", "aurora", "geometrico"]),
  paleta: z.enum(["azul", "gris"]),
  dispositivo: z.enum(["secuencia", "celular", "tablet", "notebook", "monitor"]),
});

const FUENTE = "Montserrat, sans-serif";
const ACENTO = "#FF8C42";
const TINTA = "#1f2430";
const TINTA_2 = "#6b7280";
const BORDE = "#d5dbe4";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

type SegId = "S1" | "S2" | "S3" | "S4";
const ORDEN: SegId[] = ["S1", "S2", "S3", "S4"];
const SEGMENTOS: Record<
  SegId,
  { color: string; nombre: string; perfil: string; accion: string; celdas: number }
> = {
  S1: {
    color: "#2f6fe0",
    nombre: "Preventivo",
    perfil: "Mora 0-30 días · riesgo bajo",
    accion: "Recordatorio por WhatsApp",
    celdas: 25,
  },
  S2: {
    color: "#2e9e4a",
    nombre: "Mora temprana",
    perfil: "31-60 días · riesgo moderado",
    accion: "Recordatorio + llamada",
    celdas: 15,
  },
  S3: {
    color: "#f08a2c",
    nombre: "Mora media",
    perfil: "61-90 días · riesgo alto",
    accion: "Propuesta de refinanciación",
    celdas: 15,
  },
  S4: {
    color: "#d9433a",
    nombre: "Mora avanzada",
    perfil: "+90 días · riesgo crítico",
    accion: "Gestión intensiva y agencia externa",
    celdas: 20,
  },
};

// Days past due (Y) sets the band; a low score (back layer) pushes the cell
// one band up.
const segmentoDe = (y: number, z: number): SegId => {
  const banda = Math.max(0, y - 1) + (z === 2 && y >= 1 && y <= 3 ? 1 : 0);
  return ORDEN[Math.min(3, banda)];
};
const VOXELES = Array.from({ length: 3 }).flatMap((_, z) =>
  Array.from({ length: 5 }).flatMap((__, y) =>
    Array.from({ length: 5 }).map((___, x) => ({ x, y, z, seg: segmentoDe(y, z) })),
  ),
);

// Timeline (frames). Each device holds the screen for 90 frames.
const TRAMO = 90;
const ARMADO = 12;
const APERTURA = 100;
const CONTEO = 104;
const ESCALA = 112;
const FOCO = 192;
const PASO_FOCO = 20;
const FIN_FOCO = FOCO + PASO_FOCO * 4;
const CARDS = 282;

const aclarar = (hex: string, f: number) => {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) =>
    Math.round(f >= 1 ? v + (255 - v) * (f - 1) : v * f),
  );
  return `rgb(${c.join(",")})`;
};

const focoEn = (frame: number): SegId | null =>
  frame >= FOCO && frame < FIN_FOCO
    ? ORDEN[Math.floor((frame - FOCO) / PASO_FOCO)]
    : null;

const Voxel: React.FC<{
  x: number;
  y: number;
  z: number;
  seg: SegId;
  L: number;
  frame: number;
}> = ({ x, y, z, seg, L, frame }) => {
  const s = SEGMENTOS[seg];
  const banda = ORDEN.indexOf(seg);
  const apertura = interpolate(frame, [APERTURA, APERTURA + 28], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  // Pops in layer by layer from the bottom.
  const a = interpolate(
    frame,
    [ARMADO + y * 6 + (x + z) * 1.2, ARMADO + y * 6 + (x + z) * 1.2 + 10],
    [0, 1],
    { ...clamp, easing: Easing.out(Easing.back(1.6)) },
  );
  const hueco = L * 0.6;
  const px = (x - 2) * L;
  const py = -(y - 2) * L - (banda - 1.5) * hueco * apertura - (1 - a) * L * 2;
  const pz = -(z - 1) * L;
  const foco = focoEn(frame);
  const filtro =
    foco && foco !== seg ? "saturate(0.25) brightness(0.8) opacity(0.35)" : "none";
  const cara = (transform: string, f: number): React.CSSProperties => ({
    position: "absolute",
    width: L,
    height: L,
    left: -L / 2,
    top: -L / 2,
    background: aclarar(s.color, f),
    border: "1px solid rgba(0,0,0,0.2)",
    boxSizing: "border-box",
    transform,
    filter: filtro,
    opacity: Math.min(1, a * 1.5),
  });
  return (
    <div
      style={{
        position: "absolute",
        transformStyle: "preserve-3d",
        transform: `translate3d(${px}px, ${py}px, ${pz}px)`,
      }}
    >
      <div style={cara(`translateZ(${L / 2}px)`, 1)} />
      <div style={cara(`rotateY(90deg) translateZ(${L / 2}px)`, 0.74)} />
      <div style={cara(`rotateY(-90deg) translateZ(${L / 2}px)`, 0.74)} />
      <div style={cara(`rotateX(90deg) translateZ(${L / 2}px)`, 1.22)} />
    </div>
  );
};

const LOGO_W = 2028;
const LOGO_H = 693;

// The app screen at w x h (CSS px), laid out for that size.
const App: React.FC<{ w: number; h: number; frame: number }> = ({ w, h, frame }) => {
  const { fps } = useVideoConfig();
  const chico = w < 600;
  const HEADER = chico ? 74 : 58;
  const SIDE = chico ? 0 : 54;
  const PAD = chico ? 10 : 20;
  const lateral = w >= 1500;
  const LAT_W = 300;
  const foco = focoEn(frame);

  // Estimated viewport size, to size the cube.
  const vpW = w - SIDE - PAD * 2 - (chico ? 24 : 40) - (lateral ? LAT_W + 16 : 0);
  const vpH =
    h - HEADER - PAD * 2 - 50 - 28 - (chico ? 34 : 20) - 36 - (chico ? 76 : 44) - 36;
  const L = Math.min(vpW / 8.5, vpH / 8.6);

  const giroY = -30 + Math.sin(frame / 50) * 14;
  const giroX = -18 + Math.sin(frame / 75) * 3;
  const conteo = interpolate(frame, [CONTEO, CONTEO + 30], [0, 1], clamp);
  const escala = interpolate(frame, [ESCALA, ESCALA + 18], [0, 1], clamp);
  const fs = chico ? 0.86 : 1;
  // Bottom sheet with the action per segment where there is no side column.
  const hoja = lateral
    ? 0
    : spring({ frame: frame - CARDS, fps, config: { damping: 18, stiffness: 90 } });
  const logoEsc = (chico ? 110 : 130) / LOGO_W;

  return (
    <div
      style={{
        position: "relative",
        width: w,
        height: h,
        background: "#e9edf2",
        fontFamily: FUENTE,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: w,
          height: HEADER,
          background: "#2f3b52",
          display: "flex",
          alignItems: "center",
          paddingTop: chico ? 26 : 0,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            position: "relative",
            marginLeft: chico ? 16 : 22,
            width: LOGO_W * logoEsc,
            height: LOGO_H * logoEsc,
          }}
        >
          {["axonia-letras.png", "axonia-icono.png"].map((f) => (
            <Img
              key={f}
              src={staticFile(f)}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
              }}
            />
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginRight: chico ? 14 : 22,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "#cfd6e0",
            }}
          />
          {chico ? null : (
            <div style={{ color: "white", fontSize: 15, fontWeight: 700 }}>
              Delfina Martinez
            </div>
          )}
        </div>
      </div>
      {/* Sidebar */}
      {chico ? null : (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: HEADER,
            bottom: 0,
            width: SIDE,
            background: "#253046",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: 22,
            gap: 24,
          }}
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                border: `2px solid ${i === 2 ? ACENTO : "#9aa6ba"}`,
              }}
            />
          ))}
        </div>
      )}
      {/* Panel */}
      <div
        style={{
          position: "absolute",
          left: SIDE + PAD,
          top: HEADER + PAD,
          right: PAD,
          bottom: PAD,
          background: "white",
          borderRadius: 12,
          boxShadow: "0 8px 24px rgba(20,30,50,0.12)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: 50,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            padding: `0 ${chico ? 12 : 20}px`,
            borderBottom: `1px solid ${BORDE}`,
            fontSize: 17 * fs,
            fontWeight: 700,
            color: TINTA,
          }}
        >
          <div style={{ flex: 1 }}>Vista 3D del cubo segmentado</div>
          <div style={{ fontSize: 22, color: TINTA_2, fontWeight: 500 }}>×</div>
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            padding: chico ? 12 : "14px 20px",
            minHeight: 0,
          }}
        >
          <div style={{ fontSize: 13 * fs, color: TINTA_2, lineHeight: 1.35 }}>
            {chico
              ? "Cada cubito es una intersección X × Y × Z; el color indica el segmento."
              : "Arrastrá el cubo para rotarlo. Cada cubito es una intersección X × Y × Z; el color indica el segmento de riesgo asignado."}
          </div>
          <div style={{ display: "flex", alignItems: "center", height: 36 }}>
            <div
              style={{
                border: `1px solid ${BORDE}`,
                borderRadius: 6,
                padding: "8px 14px",
                fontSize: 13 * fs,
                color: TINTA,
              }}
            >
              Reset rotación
            </div>
            <div style={{ flex: 1 }} />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13 * fs,
                color: TINTA,
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  border: `1.5px solid ${TINTA_2}`,
                  borderRadius: 3,
                }}
              />
              {chico ? "Ocultar sin asignar" : "Ocultar celdas sin asignar"}
            </div>
          </div>
          {/* Segment chips */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              border: `1px solid ${BORDE}`,
              borderRadius: 8,
              padding: 8,
            }}
          >
            {ORDEN.map((id) => {
              const s = SEGMENTOS[id];
              const activo = foco === id;
              return (
                <div
                  key={id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 9px",
                    borderRadius: 6,
                    border: `1.5px solid ${activo ? s.color : BORDE}`,
                    background: activo ? aclarar(s.color, 1.85) : "white",
                    fontSize: 12.5 * fs,
                    color: TINTA,
                  }}
                >
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 3,
                      background: s.color,
                    }}
                  />
                  <b>{id}</b>
                  <span style={{ color: TINTA_2 }}>
                    {Math.round(s.celdas * conteo)} cubitos
                  </span>
                </div>
              );
            })}
          </div>
          <div style={{ flex: 1, display: "flex", gap: 16, minHeight: 0 }}>
            {/* 3D viewport */}
            <div
              style={{
                flex: 1,
                position: "relative",
                border: `1px solid ${BORDE}`,
                borderRadius: 10,
                background: "linear-gradient(#f5f7fb, #e6ebf3)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 10,
                  top: 10,
                  background: "white",
                  border: `1px solid ${BORDE}`,
                  borderRadius: 6,
                  padding: "6px 10px",
                  fontSize: 11.5 * fs,
                  color: TINTA,
                  lineHeight: 1.6,
                  zIndex: 2,
                  opacity: 1 - hoja,
                }}
              >
                <div>X → Saldo de deuda</div>
                <div>Y ↑ Días de mora</div>
                <div>Z ⊙ Score</div>
              </div>
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: `${54 - hoja * 22}%`,
                  perspective: 1600,
                  scale: String(1 - hoja * 0.3),
                  transformStyle: "preserve-3d",
                }}
              >
                <div
                  style={{
                    transformStyle: "preserve-3d",
                    transform: `rotateX(${giroX}deg) rotateY(${giroY}deg)`,
                  }}
                >
                  {VOXELES.map((v) => (
                    <Voxel
                      key={`${v.x}-${v.y}-${v.z}`}
                      {...v}
                      L={L}
                      frame={frame}
                    />
                  ))}
                </div>
              </div>
              {/* Risk scale */}
              <div
                style={{
                  position: "absolute",
                  right: chico ? 10 : 18,
                  top: "16%",
                  bottom: `${14 + hoja * 40}%`,
                  display: "flex",
                  gap: 8,
                  opacity: escala,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    textAlign: "right",
                    fontSize: 10.5 * fs,
                    fontWeight: 800,
                    color: TINTA,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  <div>
                    Más
                    <br />
                    riesgo
                  </div>
                  <div>
                    Menos
                    <br />
                    riesgo
                  </div>
                </div>
                <div
                  style={{
                    width: 9,
                    borderRadius: 5,
                    background: `linear-gradient(${SEGMENTOS.S4.color}, ${SEGMENTOS.S3.color}, ${SEGMENTOS.S2.color}, ${SEGMENTOS.S1.color})`,
                  }}
                />
              </div>
              {hoja > 0.001 ? (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "white",
                    borderTop: `1px solid ${BORDE}`,
                    borderRadius: "14px 14px 0 0",
                    boxShadow: "0 -8px 24px rgba(20,30,50,0.14)",
                    padding: chico ? "10px 12px" : "12px 18px",
                    transform: `translateY(${(1 - hoja) * 110}%)`,
                    zIndex: 3,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11 * fs,
                      fontWeight: 800,
                      letterSpacing: 1.2,
                      color: TINTA_2,
                      textTransform: "uppercase",
                      marginBottom: 6,
                    }}
                  >
                    Estrategia por segmento
                  </div>
                  {[...ORDEN].reverse().map((id, i) => {
                    const s = SEGMENTOS[id];
                    const t = interpolate(
                      frame,
                      [CARDS + 8 + i * 6, CARDS + 16 + i * 6],
                      [0, 1],
                      clamp,
                    );
                    return (
                      <div
                        key={id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "6px 0",
                          borderTop: i ? `1px solid ${BORDE}` : "none",
                          opacity: t,
                          transform: `translateX(${(1 - t) * 30}px)`,
                        }}
                      >
                        <div
                          style={{
                            width: 6,
                            alignSelf: "stretch",
                            borderRadius: 3,
                            background: s.color,
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div
                            style={{ fontSize: 13 * fs, fontWeight: 800, color: TINTA }}
                          >
                            {id} · {s.nombre}
                          </div>
                          <div
                            style={{
                              fontSize: 11.5 * fs,
                              fontWeight: 700,
                              color: ACENTO,
                              marginTop: 1,
                            }}
                          >
                            {s.accion}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
              {/* Segment in focus */}
              {foco ? (
                <div
                  style={{
                    position: "absolute",
                    left: 10,
                    bottom: 10,
                    background: "white",
                    border: `1px solid ${BORDE}`,
                    borderLeft: `5px solid ${SEGMENTOS[foco].color}`,
                    borderRadius: 8,
                    padding: "8px 12px",
                    boxShadow: "0 4px 12px rgba(20,30,50,0.12)",
                    opacity: interpolate(
                      (frame - FOCO) % PASO_FOCO,
                      [0, 4],
                      [0, 1],
                      clamp,
                    ),
                  }}
                >
                  <div style={{ fontSize: 14 * fs, fontWeight: 800, color: TINTA }}>
                    {foco} · {SEGMENTOS[foco].nombre}
                  </div>
                  <div style={{ fontSize: 12 * fs, color: TINTA_2, marginTop: 2 }}>
                    {SEGMENTOS[foco].perfil}
                  </div>
                </div>
              ) : null}
            </div>
            {/* Action per segment, on wide screens or at the end */}
            {lateral ? (
              <div
                style={{
                  width: LAT_W,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: 1.2,
                    color: TINTA_2,
                    textTransform: "uppercase",
                  }}
                >
                  Estrategia por segmento
                </div>
                {[...ORDEN].reverse().map((id, i) => {
                  const s = SEGMENTOS[id];
                  const t = spring({
                    frame: frame - CARDS - i * 8,
                    fps,
                    config: { damping: 16, stiffness: 120 },
                  });
                  return (
                    <div
                      key={id}
                      style={{
                        flex: 1,
                        borderRadius: 10,
                        border: `1px solid ${BORDE}`,
                        borderLeft: `6px solid ${s.color}`,
                        padding: "10px 14px",
                        opacity: t,
                        transform: `translateX(${(1 - t) * 40}px)`,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                      }}
                    >
                      <div style={{ fontSize: 15, fontWeight: 800, color: TINTA }}>
                        {id} · {s.nombre}
                      </div>
                      <div style={{ fontSize: 12, color: TINTA_2, marginTop: 3 }}>
                        {s.perfil} · {s.celdas} celdas
                      </div>
                      <div
                        style={{
                          fontSize: 12.5,
                          fontWeight: 700,
                          color: ACENTO,
                          marginTop: 5,
                        }}
                      >
                        {s.accion}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

const GIROS: Record<Tipo, [number, number]> = {
  celular: [-16, 6],
  tablet: [14, 7],
  notebook: [-12, 5],
  monitor: [-6, 3],
};

export const SegmentacionApp: React.FC<z.infer<typeof segmentacionAppSchema>> = ({
  fondo,
  paleta,
  dispositivo,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const vertical = height > width;
  const soloCelular = dispositivo === "celular";
  const caja = vertical
    ? soloCelular
      ? { cx: 540, cy: 960, w: 980, h: 1560 }
      : { cx: 540, cy: 960, w: 960, h: 1300 }
    : { cx: 960, cy: 540, w: 1560, h: 930 };
  const lista: Tipo[] = dispositivo === "secuencia" ? TIPOS : [dispositivo];
  const flota = Math.sin(frame / 40) * 6;
  const actual = lista[Math.min(lista.length - 1, Math.floor(frame / TRAMO))];
  const titulo = spring({ frame, fps, config: { damping: 18 } });

  return (
    <AbsoluteFill style={{ fontFamily: FUENTE }}>
      <FondoAbstracto paleta={paleta} estilo={fondo} />
      <AbsoluteFill style={{ perspective: 2400 }}>
        {lista.map((tipo, i) => {
          const inicio = i * TRAMO;
          const fin = (i + 1) * TRAMO;
          const tIn = spring({
            frame: frame - (i === 0 ? 0 : inicio - 12),
            fps,
            config: { damping: 18, stiffness: 80 },
          });
          const tOut =
            i === lista.length - 1
              ? 0
              : interpolate(frame, [fin - 12, fin + 6], [0, 1], {
                  ...clamp,
                  easing: Easing.in(Easing.cubic),
                });
          if (tIn < 0.001 || tOut > 0.999) {
            return null;
          }
          const { w, h } = pantallaDe(tipo, vertical);
          const { W, H } = exteriorDe(tipo, w, h);
          const esc = Math.min(caja.w / W, caja.h / H);
          const [gy, gx] = GIROS[tipo];
          const dx =
            i === 0
              ? 0
              : (1 - tIn) * width * 0.7 - tOut * width * 0.7;
          const dy = i === 0 ? (1 - tIn) * 120 : 0;
          return (
            <div
              key={tipo}
              style={{
                position: "absolute",
                left: caja.cx,
                top: caja.cy,
                opacity: Math.min(tIn, 1 - tOut),
                transform: `translate(-50%, -50%) translate(${dx - tOut * 0}px, ${
                  flota + dy
                }px) scale(${esc}) rotateY(${gy + (1 - tIn) * 25 - tOut * 25}deg) rotateX(${gx}deg)`,
              }}
            >
              <Dispositivo tipo={tipo} w={w} h={h}>
                <App w={w} h={h} frame={frame} />
              </Dispositivo>
            </div>
          );
        })}
      </AbsoluteFill>
      {vertical && dispositivo === "secuencia" ? (
        <div
          style={{
            position: "absolute",
            bottom: 150,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            gap: 14,
            opacity: titulo,
          }}
        >
          {TIPOS.map((t) => (
            <div
              key={t}
              style={{
                fontSize: 22,
                fontWeight: 700,
                padding: "8px 18px",
                borderRadius: 20,
                color: t === actual ? "white" : "#b8bcc4",
                background: t === actual ? ACENTO : "rgba(255,255,255,0.08)",
              }}
            >
              {NOMBRES[t]}
            </div>
          ))}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
