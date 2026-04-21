from __future__ import annotations

from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter


ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets" / "inventory"


def load_rgba(name: str) -> Image.Image:
    return Image.open(ASSETS / name).convert("RGBA")


def save_rgba(image: Image.Image, name: str) -> Path:
    output = ASSETS / name
    image.save(output)
    return output


def dominant_blue_mask(image: Image.Image) -> Image.Image:
    width, height = image.size
    pixels = image.load()
    mask = Image.new("L", image.size, 0)
    mask_pixels = mask.load()

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a < 10:
                continue
            if b > r + 12 and b > g + 8 and y > int(height * 0.03):
                strength = min(255, int((b - max(r, g)) * 3.2))
                mask_pixels[x, y] = strength

    return mask.filter(ImageFilter.GaussianBlur(2))


def tint_region(
    image: Image.Image,
    mask: Image.Image,
    color: tuple[int, int, int],
    glow_color: tuple[int, int, int],
    blend: float = 0.75,
) -> Image.Image:
    base = image.copy()
    alpha = base.getchannel("A")
    overlay = Image.new("RGBA", base.size, (*color, 255))
    mixed = Image.blend(base, overlay, blend)
    base = Image.composite(mixed, base, mask)

    glow = Image.new("RGBA", base.size, (*glow_color, 0))
    glow_alpha = mask.filter(ImageFilter.GaussianBlur(12))
    glow.putalpha(glow_alpha)
    base = Image.alpha_composite(glow, base)
    base.putalpha(alpha)
    return base


def add_symbol(
    image: Image.Image,
    points: list[tuple[float, float]],
    color: tuple[int, int, int, int],
    width: int,
    blur: int = 8,
) -> Image.Image:
    canvas = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)
    draw.line(points, fill=color, width=width, joint="curve")
    glow = canvas.filter(ImageFilter.GaussianBlur(blur))
    result = Image.alpha_composite(Image.alpha_composite(image, glow), canvas)
    result.putalpha(image.getchannel("A"))
    return result


def build_potion(base_name: str, output_name: str, liquid: tuple[int, int, int], glow: tuple[int, int, int], symbol: str) -> Path:
    image = load_rgba(base_name)
    alpha = image.getchannel("A")
    mask = dominant_blue_mask(image)
    image = tint_region(image, mask, liquid, glow, blend=0.86)

    width, height = image.size
    cx = width // 2
    cy = int(height * 0.56)

    if symbol == "cross":
        image = add_symbol(
            image,
            [(cx, cy - 72), (cx, cy + 72)],
            (255, 220, 180, 210),
            5,
        )
        image = add_symbol(
            image,
            [(cx - 36, cy), (cx + 36, cy)],
            (255, 220, 180, 210),
            5,
        )
    elif symbol == "star":
        image = add_symbol(
            image,
            [(cx, cy - 64), (cx + 18, cy - 10), (cx + 72, cy - 10), (cx + 28, cy + 20), (cx + 42, cy + 72),
             (cx, cy + 38), (cx - 42, cy + 72), (cx - 28, cy + 20), (cx - 72, cy - 10), (cx - 18, cy - 10), (cx, cy - 64)],
            (255, 230, 190, 210),
            4,
        )
    elif symbol == "sun":
        rays = Image.new("RGBA", image.size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(rays)
        draw.ellipse((cx - 28, cy - 28, cx + 28, cy + 28), outline=(255, 225, 160, 230), width=5)
        for dx, dy in ((0, -52), (0, 52), (-52, 0), (52, 0), (-36, -36), (36, -36), (-36, 36), (36, 36)):
            draw.line((cx, cy, cx + dx, cy + dy), fill=(255, 225, 160, 220), width=4)
        image = Image.alpha_composite(image, rays.filter(ImageFilter.GaussianBlur(6)))
        image = Image.alpha_composite(image, rays)

    image = ImageEnhance.Contrast(image).enhance(1.08)
    image = ImageEnhance.Color(image).enhance(1.1)
    image.putalpha(alpha)
    return save_rgba(image, output_name)


def add_book_sigil(image: Image.Image, palette: tuple[int, int, int], mode: str) -> Image.Image:
    width, height = image.size
    cx = int(width * 0.56)
    cy = int(height * 0.48)
    layer = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    color = (*palette, 230)

    if mode == "ice":
        draw.line((cx, cy - 70, cx, cy + 70), fill=color, width=4)
        draw.line((cx - 58, cy, cx + 58, cy), fill=color, width=4)
        draw.line((cx - 44, cy - 44, cx + 44, cy + 44), fill=color, width=3)
        draw.line((cx - 44, cy + 44, cx + 44, cy - 44), fill=color, width=3)
        draw.ellipse((cx - 26, cy - 26, cx + 26, cy + 26), outline=color, width=3)
    else:
        draw.ellipse((cx - 54, cy - 36, cx + 54, cy + 36), outline=color, width=4)
        draw.ellipse((cx - 18, cy - 18, cx + 18, cy + 18), fill=(*palette, 180))
        draw.line((cx - 72, cy, cx + 72, cy), fill=color, width=3)
        draw.line((cx, cy - 52, cx, cy + 52), fill=color, width=3)
        draw.arc((cx - 74, cy - 58, cx + 74, cy + 58), 205, 335, fill=color, width=3)

    glow = layer.filter(ImageFilter.GaussianBlur(10))
    return Image.alpha_composite(Image.alpha_composite(image, glow), layer)


def build_book(base_name: str, output_name: str, tone: tuple[int, int, int], sigil: tuple[int, int, int], mode: str) -> Path:
    image = load_rgba(base_name)
    alpha = image.getchannel("A")

    toned = Image.new("RGBA", image.size, (*tone, 255))
    image = Image.blend(image, toned, 0.28 if mode == "ice" else 0.32)
    image.putalpha(alpha)

    border = ImageChops.difference(alpha.filter(ImageFilter.GaussianBlur(2)), alpha.filter(ImageFilter.GaussianBlur(10)))
    edge_glow = Image.new("RGBA", image.size, (*sigil, 0))
    edge_glow.putalpha(border)
    image = Image.alpha_composite(edge_glow, image)

    image = add_book_sigil(image, sigil, mode)
    image = ImageEnhance.Contrast(image).enhance(1.12)
    image = ImageEnhance.Sharpness(image).enhance(1.1)
    image.putalpha(alpha)
    return save_rgba(image, output_name)


def main() -> None:
    outputs = [
        build_potion("fiole_bleu.png", "potion_rouge.png", (185, 28, 34), (255, 70, 50), "cross"),
        build_potion("fiole_bleu.png", "fiole_violette.png", (102, 56, 190), (158, 108, 255), "star"),
        build_potion("fiole_bleu.png", "fiole_doree.png", (210, 144, 34), (255, 190, 70), "sun"),
        build_book("livre.png", "livre_glace.png", (78, 118, 146), (120, 220, 255), "ice"),
        build_book("livre.png", "livre_maudit.png", (76, 44, 92), (200, 90, 255), "occult"),
    ]

    for output in outputs:
        print(output.relative_to(ROOT))


if __name__ == "__main__":
    main()
