# Videos Axonia (Remotion)

Proyecto de videos promocionales de Axonia hechos con Remotion. Respondé en español, simple y conciso.

## Cómo trabajar

- Instalar dependencias con `npm i`.
- Antes de renderizar un video, mandar imágenes (frames sueltos o una lámina) para que el usuario las apruebe. Renderizar solo cuando lo aprueba.
- Renderizar siempre con el Chromium preinstalado:
  `npx remotion render <Id> out/<Id>.mp4 --browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell`
  (igual para `npx remotion still ... --frame=N --scale=0.5`).
- Chequear con `npx tsc --noEmit` y `npx eslint src/<archivo>.tsx` antes de commitear.
- Commitear y pushear a `main` al terminar cada cambio.

## Estilo y datos

- Fondo por defecto: `ondas` en paleta `gris` (`src/FondoAbstracto.tsx`). Acento naranja `#FF8C42`.
- Dispositivos (`src/Dispositivos.tsx`): fijos, sin flotar. Sin título de sección en el header de la app.
- Logo Axonia: `public/axonia-letras.png` + `public/axonia-icono.png` (letras blancas, para fondos oscuros); `public/axonia-logo-original.png` (letras oscuras, para fondos blancos).
- Usuaria de back office: **Delfina Martinez** (DMARTINEZ). Cliente: **Javier Perez**, DNI 2845678.
- Nunca usar nombres, DNI, teléfonos ni marcas reales de las capturas: inventarlos (teléfonos enmascarados con XXXXX).
- En 9:16 no van títulos de video sobre el dispositivo.

## Composiciones (src/Root.tsx)

Cada video tiene versión 16:9 y 9:16:

| Video | 16:9 | 9:16 | Archivo |
|---|---|---|---|
| Contact Flow (sala, editor de flujos, plantillas, campaña, segmentación con detalle, franjas, dashboard) | `ContactFlow` (tablet derecha) | `ContactFlowMovil` (celular derecho) | `src/ContactFlow.tsx` |
| Back office (configuración del flujo, carpeta de Entrada a Tesorería con check, listado de Tesorería, dashboard) | `BackOffice` (tablet derecha) | `BackOfficeMovil` | `src/BackOffice.tsx` |
| Tienda online (inicio con cambio de marca, catálogo de celulares, producto, pago con préstamo, confirmación) | `TiendaAxonia` (tablet inclinada desde la izquierda) | `TiendaMovil` | `src/TiendaAxonia.tsx` |
| Collections / CRM de cobranzas (contenedores, cluster S4, ficha con promesa de pago, cubo con cards de segmentos, asignación extrajudicial, reportes) | `Collections` | `CollectionsMovil` | `src/CollectionsAxonia.tsx` |
| Onboarding (datos con cambio de marca, ofertas estilo 4B, email, identidad, teléfono, firma, contrato) | `OnboardingApp169` (tablet) | `OnboardingApp` (celular) | `src/OnboardingApp.tsx` |
| Suite 360 (módulos con zoom) | `Suite360` | `Suite360v` | `src/Suite360.tsx` |
| Consolidación de deudas | `ConsolidacionDeudas169` | `ConsolidacionDeudas` | `src/ConsolidacionDeudas.tsx` |
| Segmentación de cobranzas (cubo) | `SegmentacionApp169` | `SegmentacionApp` | `src/SegmentacionApp.tsx` |
| Detalle de préstamo / plan de pagos | `PlanPagos169` | `PlanPagos` | `src/PlanPagos.tsx` |

Otras: `MarcaAxonia`, `LogoAxonia`, `DashboardAxonia`, `WorkflowAxonia`, `MatrizRiesgo`, `CoreHome`, `ModulosAxonia`, `Transicion`, y láminas de apoyo (`OfertasOpciones`, `RelojTienda`).

## Patrón de los videos de app

- La pantalla se dibuja en código dentro de `<Dispositivo>` (tablet 1180×820, celular 390×844).
- Escenas con una tabla `ESC` de frames, toques `TAP_*` y un recorrido del dedo (`DEDO`) con onda naranja al tocar.
- Números que cuentan con `sube()` / `interpolate`; las tarjetas de estado fijas (como el panel de la sala de Contact Flow) llevan números fijos.

## Encuadre de dispositivos

- En todos los videos (16:9 y 9:16) el dispositivo arranca al 30% de la altura y llega a ~94%: `esc = (height * 0.64) / EH` y centro en `top: height * 0.62`. El 30% de arriba queda para títulos (los pone el usuario en CapCut).

## Versiones dinámicas

Copias con cámara en movimiento, sin tocar el video original: `CollectionsDinamico`/`CollectionsDinamicoMovil`, `TiendaDinamico`/`TiendaDinamicoMovil`, `OnboardingDinamico`/`OnboardingDinamicoMovil`, `ContactFlowDinamico`/`ContactFlowDinamicoMovil` (en celular la sala va en 3 islas de puestos), `BackOfficeDinamico`/`BackOfficeDinamicoMovil` (mismo componente para 16:9 y 9:16, registradas en `src/Root.tsx`).

- Cámara por keyframes (`TOMAS`: frame, zoom, punto de foco en px de pantalla, rotaciones, centro vertical), interpolada con `Easing.inOut(Easing.cubic)` y zoom en escala log.
- Siempre libre el 20% de arriba: si el zoom sube el dispositivo, se baja (`arriba >= height * 0.23`). Abajo puede salir de cuadro.
- Ritmo calmo y de buen gusto: pocos zooms (1,25–1,4), pausas largas, un solo movimiento por momento (zoom o cambio de inclinación, nunca seguidos). Nada de "zamba".
- Elementos que salen de la pantalla: copia de un rectángulo de la pantalla en una capa `preserve-3d` (con un hueco gris debajo) que va hacia la cámara con `translate3d(0, y, z)` y vuelve, sin rotar ni bailar. Pocos y en momentos clave.
- Evitar el destello blanco bajo el marco: fondo raíz de la pantalla del color del header y escenas con `clipPath: inset(HEADER px 0 0 0)`.

## Otros videos dinámicos y cortos

- `CoreLendingDinamico`, `MotorDinamico` (motor de decisión; nada de nombres de bureaus reales: "Bureau A", "Central de Deudores"), `SucursalDinamico` (home banking de Javier Perez, préstamo de 1.400.000 con 3 cuotas pagas).
- Versiones cortas (≤10 s) en `src/Cortos.tsx` (`CORTOS`: tramos de frames del video dinámico con fundidos), registradas como `<Id>` y `<Id>Movil`.
- `Suite360Corto`/`Suite360CortoMovil`: mismo tiempo por módulo, paneo directo entre módulos.

## Videos publicitarios (con locución)

Tono B2B, de diseñador y publicista: le hablan a quien decide en una entidad o retailer. Sin "historias" ni personajes (nada de "Javier quiere..."). Nunca leer literal el texto de pantalla en la voz.

- `Integral`/`IntegralMovil` (`src/Integral.tsx`, 30 s): gancho con video del mostrador (`GanchoFoto` variante "c", editorial, video enmarcado sobre el fondo), recorrido por los 8 productos cortado en compás de la música (`public/musica/leave-the-key.mp3`, 129 BPM, al 15%), títulos por producto arriba, subtítulos abajo, cierre `CierreAxonia` (logo, píldoras, botón "Agendá una demo" y axonia.com.ar).
- `ContactFlowIntegral`/`ContactFlowIntegralMovil` (`src/ContactFlowIntegral.tsx`, 32,5 s): mismo esquema con `public/videos/escritorio.mp4`, locución `public/voz/locucion-contactflow.mp3` (voz Camila) y píldoras propias.
- Locuciones de ElevenLabs las genera el usuario; se ubican frase por frase (`VOZ`: [desde, hasta en la grabación, inicio en el video]) detectando silencios con `ffmpeg silencedetect`.
- Logo chico arriba a la derecha (`MarcaAgua`) hasta el cierre.
- En 9:16 respetar el área segura de Reels/TikTok: títulos a 255 px de arriba, subtítulos a 400 px de abajo. El celular nunca pegado al borde (zoom de tramo 4% en 9:16; `dxExtraV` para centrar tomas que se van a un costado).

## Canal y marca

- YouTube: canal Axonia `@axonia_global`, vinculado a Google Ads. Banner y foto de perfil: `BannerYouTube`/`AvatarYouTube` (`src/YouTubeMarca.tsx`).
