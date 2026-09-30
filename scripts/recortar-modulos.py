# Splits public/modulos/original.webp (the "Suite de Módulos" design) into:
#   fondo.png     the design with the 8 cards removed (background inpainted)
#   card-N.png    each card with rounded transparent corners
# Card bounds were measured from the card borders in the original image.
# Usage: python3 scripts/recortar-modulos.py   (needs pillow, numpy, opencv)
import json
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw

DIR = Path(__file__).resolve().parent.parent / "public" / "modulos"
COLS = [(75, 460), (481, 865)]
ROWS = [(516, 785), (802, 1064), (1081, 1341), (1357, 1620)]
RADIUS = 20
SHADOW = 14

src = Image.open(DIR / "original.webp").convert("RGB")
arr = np.array(src)
mask = np.zeros(arr.shape[:2], np.uint8)
cards = []

for r, (y0, y1) in enumerate(ROWS):
    for c, (x0, x1) in enumerate(COLS):
        n = r * 2 + c + 1
        w, h = x1 - x0, y1 - y0
        # Antialiased rounded-rectangle alpha, drawn at 4x and downsampled.
        big = Image.new("L", (w * 4, h * 4), 0)
        ImageDraw.Draw(big).rounded_rectangle(
            (0, 0, w * 4 - 1, h * 4 - 1), RADIUS * 4, fill=255
        )
        card = src.crop((x0, y0, x1, y1)).convert("RGBA")
        card.putalpha(big.resize((w, h), Image.LANCZOS))
        card.save(DIR / f"card-{n}.png")
        cards.append({"n": n, "x": x0, "y": y0, "w": w, "h": h})
        mask[y0 - SHADOW : y1 + SHADOW, x0 - SHADOW : x1 + SHADOW] = 255

# Paint the bottom-left circles out first so the inpaint doesn't smear their
# blue into the grid area; they are redrawn cleanly further down.
CIRCULOS = [(1, 1679, 296, (1, 174, 243)), (7, 1680, 154, (75, 200, 254))]
yy, xx = np.mgrid[: arr.shape[0], : arr.shape[1]]
limpia = arr.copy()
cx, cy, r, _ = CIRCULOS[0]
limpia[(xx - cx) ** 2 + (yy - cy) ** 2 < (r + 8) ** 2] = (238, 246, 252)
fondo = cv2.inpaint(cv2.cvtColor(limpia, cv2.COLOR_RGB2BGR), mask, 9, cv2.INPAINT_TELEA)
fondo = cv2.cvtColor(fondo, cv2.COLOR_BGR2RGB)
# Inpainting a large area leaves streaks; a heavy blur inside the mask keeps
# only the smooth gradient, which is all the original background has there.
blur = cv2.GaussianBlur(fondo, (0, 0), 25)
soft = cv2.GaussianBlur(mask.astype(np.float32) / 255, (0, 0), 6)[..., None]
fondo = (blur * soft + fondo * (1 - soft)).astype(np.uint8)

# The bottom-left decoration is two concentric-ish circles that the inpaint
# smears; redraw them (fitted to their visible edges) inside the masked area.
H, W = mask.shape
S = 4
capa = Image.new("RGBA", (W * S, H * S), (0, 0, 0, 0))
d = ImageDraw.Draw(capa)
for (cx, cy, r, color) in CIRCULOS:
    d.ellipse(((cx - r) * S, (cy - r) * S, (cx + r) * S, (cy + r) * S), fill=color + (255,))
capa = np.array(capa.resize((W, H), Image.LANCZOS)).astype(np.float32)
alpha = capa[..., 3:4] / 255 * soft
fondo = (capa[..., :3] * alpha + fondo * (1 - alpha)).astype(np.uint8)
# Outside the grid area keep the original pixels untouched.
fondo = (fondo * soft + arr * (1 - soft)).astype(np.uint8)
Image.fromarray(fondo).save(DIR / "fondo.png")
print(json.dumps({"size": src.size, "cards": cards}))
