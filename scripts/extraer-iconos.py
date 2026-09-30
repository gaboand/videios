# Extracts the 8 card icons from public/modulos/original.webp as white
# line icons with their blue accents, on transparent background, so they
# can sit on a dark background. Output: public/modulos/iconos/icono-N.png
# Usage: python3 scripts/extraer-iconos.py   (needs pillow, numpy)
from pathlib import Path

import numpy as np
from PIL import Image

DIR = Path(__file__).resolve().parent.parent / "public" / "modulos"
# Icon centers (the light circle behind each icon) in the original image.
CENTROS = [(270, 613), (673, 613), (270, 897), (673, 897),
           (270, 1180), (673, 1180), (270, 1450), (673, 1450)]
R = 70
# Color for the icons' accents (dots, $ badge, AI chip), originally blue.
ACENTO = (237, 224, 208)  # #EDE0D0

img = np.array(Image.open(DIR / "original.webp").convert("RGB")).astype(np.float32)
for n, (cx, cy) in enumerate(CENTROS, start=1):
    c = img[cy - R : cy + R, cx - R : cx + R]
    r, g, b = c[..., 0], c[..., 1], c[..., 2]
    lum = c.mean(axis=2)
    azul = np.clip((b - r - 40) / 150, 0, 1)
    oscuro = np.clip((190 - lum) / 150, 0, 1) * (1 - azul)
    alpha = np.clip(azul + oscuro, 0, 1)
    # Keep only what is inside the icon's circle (drops the label text and
    # background gradients around it), and drop faint noise.
    yy, xx = np.mgrid[-R:R, -R:R]
    alpha[xx**2 + yy**2 > (R - 2) ** 2] = 0
    alpha[alpha < 0.08] = 0
    color = np.zeros_like(c)
    color[:] = (255, 255, 255)
    color = color * (1 - azul[..., None]) + np.array(ACENTO) * azul[..., None]
    out = np.dstack([color, alpha * 255]).astype(np.uint8)
    im = Image.fromarray(out, "RGBA")
    im = im.crop(im.getbbox())
    # Pad to a square so all icons share the same box.
    lado = max(im.size) + 4
    cuadro = Image.new("RGBA", (lado, lado), (0, 0, 0, 0))
    cuadro.paste(im, ((lado - im.width) // 2, (lado - im.height) // 2))
    cuadro.save(DIR / "iconos" / f"icono-{n}.png")
    print(n, im.size)
