from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageChops, ImageColor, ImageDraw, ImageFilter, ImageOps


ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets" / "inventory"

RNG = random.Random(42)


def radial_background(size: tuple[int, int], inner: str, outer: str) -> Image.Image:
    width, height = size
    inner_rgb = ImageColor.getrgb(inner)
    outer_rgb = ImageColor.getrgb(outer)
    image = Image.new("RGBA", size, outer_rgb + (255,))
    pixels = image.load()
    cx = width / 2
    cy = height / 2
    max_dist = math.hypot(cx, cy)
    for y in range(height):
        for x in range(width):
            dist = math.hypot(x - cx, y - cy) / max_dist
            dist = min(1.0, max(0.0, dist))
            t = dist**1.35
            rgb = tuple(int(inner_rgb[i] * (1 - t) + outer_rgb[i] * t) for i in range(3))
            pixels[x, y] = rgb + (255,)
    shadow = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(shadow)
    draw.ellipse((150, 70, width - 150, height - 70), fill=(255, 210, 120, 38))
    draw.ellipse((40, 40, width - 40, height - 40), outline=(255, 240, 190, 26), width=6)
    return Image.alpha_composite(image, shadow.filter(ImageFilter.GaussianBlur(32)))


def add_noise(image: Image.Image, strength: int = 18) -> Image.Image:
    width, height = image.size
    noise = Image.new("RGBA", image.size, (0, 0, 0, 0))
    pixels = noise.load()
    for y in range(height):
        for x in range(width):
            n = RNG.randint(-strength, strength)
            a = RNG.randint(10, 28)
            pixels[x, y] = (128 + n, 118 + n, 102 + n, a)
    return Image.blend(image, Image.alpha_composite(image, noise), 0.2)


def make_shadow(mask: Image.Image, offset: tuple[int, int] = (0, 24), blur: int = 28, opacity: int = 145) -> Image.Image:
    shadow = Image.new("RGBA", mask.size, (0, 0, 0, 0))
    alpha = mask.point(lambda a: min(opacity, int(a * opacity / 255)))
    shadow.putalpha(alpha)
    shadow = shadow.filter(ImageFilter.GaussianBlur(blur))
    result = Image.new("RGBA", mask.size, (0, 0, 0, 0))
    result.alpha_composite(shadow, offset)
    return result


def masked_gradient(mask: Image.Image, top: str, bottom: str) -> Image.Image:
    width, height = mask.size
    top_rgb = ImageColor.getrgb(top)
    bottom_rgb = ImageColor.getrgb(bottom)
    grad = Image.new("RGBA", mask.size, (0, 0, 0, 0))
    pixels = grad.load()
    for y in range(height):
        t = y / max(1, height - 1)
        rgb = tuple(int(top_rgb[i] * (1 - t) + bottom_rgb[i] * t) for i in range(3))
        for x in range(width):
            pixels[x, y] = rgb + (255,)
    grad.putalpha(mask)
    return grad


def apply_highlight(image: Image.Image, alpha: Image.Image, bbox: tuple[int, int, int, int], color: tuple[int, int, int, int], blur: int) -> Image.Image:
    layer = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    draw.ellipse(bbox, fill=color)
    layer.putalpha(ImageChops.multiply(layer.getchannel("A"), alpha))
    return Image.alpha_composite(image, layer.filter(ImageFilter.GaussianBlur(blur)))


def add_outline(image: Image.Image, alpha: Image.Image, color: tuple[int, int, int, int], blur: int = 3) -> Image.Image:
    edge = ImageChops.difference(alpha.filter(ImageFilter.GaussianBlur(blur)), alpha.filter(ImageFilter.GaussianBlur(blur + 8)))
    outline = Image.new("RGBA", image.size, color)
    outline.putalpha(edge)
    return Image.alpha_composite(outline, image)


def render_rope() -> Image.Image:
    size = (1024, 1024)
    bg = radial_background(size, "#645b4d", "#262321")
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)

    draw.line([(512, 810), (512, 670)], fill=(110, 68, 32, 255), width=56)
    draw.line([(512, 810), (512, 670)], fill=(201, 154, 88, 255), width=42)

    loops = [
        (262, 290, 762, 780),
        (325, 350, 698, 720),
        (385, 410, 639, 660),
    ]
    widths = [76, 68, 54]
    for bbox, width in zip(loops, widths):
        draw.ellipse(bbox, outline=(104, 63, 30, 255), width=width)
        draw.ellipse(bbox, outline=(196, 150, 88, 255), width=width - 18)

    for y in range(330, 860, 28):
        draw.line([(488, y), (536, y - 18)], fill=(232, 190, 122, 150), width=5)
        draw.line([(476, y + 10), (548, y - 16)], fill=(113, 69, 37, 130), width=3)

    alpha = layer.getchannel("A")
    image = Image.alpha_composite(bg, make_shadow(alpha, offset=(0, 26), blur=34, opacity=160))
    rope = add_outline(layer, alpha, (255, 231, 184, 70))
    rope = apply_highlight(rope, alpha, (370, 220, 690, 430), (255, 232, 180, 100), 24)
    return add_noise(Image.alpha_composite(image, rope), 12)


def key_base(size: tuple[int, int], shaft_h: int, head_r: int, metal_top: str, metal_bottom: str, gem: str | None = None) -> Image.Image:
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    cx = size[0] // 2
    top = 200
    shaft_top = top + head_r * 2 - 35
    shaft_bottom = shaft_top + shaft_h

    draw.rounded_rectangle((cx - 44, shaft_top, cx + 44, shaft_bottom), radius=36, fill=(255, 255, 255, 255))
    draw.ellipse((cx - head_r, top, cx + head_r, top + head_r * 2), fill=(255, 255, 255, 255))
    draw.ellipse((cx - head_r + 54, top + 54, cx + head_r - 54, top + head_r * 2 - 54), fill=(0, 0, 0, 0))
    draw.polygon([(cx - 88, shaft_bottom - 18), (cx - 160, shaft_bottom + 16), (cx - 160, shaft_bottom + 98), (cx - 40, shaft_bottom + 58), (cx - 40, shaft_bottom + 20)], fill=(255, 255, 255, 255))
    draw.rectangle((cx - 158, shaft_bottom + 76, cx - 74, shaft_bottom + 142), fill=(255, 255, 255, 255))
    draw.rectangle((cx + 38, shaft_bottom - 10, cx + 118, shaft_bottom + 42), fill=(255, 255, 255, 255))
    draw.polygon([(cx + 40, shaft_bottom + 28), (cx + 144, shaft_bottom + 8), (cx + 138, shaft_bottom + 82), (cx + 40, shaft_bottom + 62)], fill=(255, 255, 255, 255))
    draw.polygon([(cx, shaft_bottom + 138), (cx - 28, shaft_bottom + 86), (cx + 28, shaft_bottom + 86)], fill=(255, 255, 255, 255))
    alpha = layer.getchannel("A")

    image = masked_gradient(alpha, metal_top, metal_bottom)
    detail = Image.new("RGBA", size, (0, 0, 0, 0))
    d = ImageDraw.Draw(detail)
    d.arc((cx - head_r + 24, top + 24, cx + head_r - 24, top + head_r * 2 - 24), 210, 340, fill=(255, 230, 180, 180), width=9)
    d.line((cx - 26, shaft_top + 40, cx + 26, shaft_top + 40), fill=(80, 50, 25, 120), width=4)
    d.line((cx - 22, shaft_bottom - 80, cx + 22, shaft_bottom - 80), fill=(255, 225, 180, 110), width=4)
    d.line((cx - 98, shaft_bottom + 46, cx - 56, shaft_bottom + 26), fill=(90, 60, 30, 130), width=5)
    d.line((cx + 54, shaft_bottom + 14, cx + 122, shaft_bottom + 22), fill=(255, 235, 195, 120), width=5)
    image = Image.alpha_composite(image, detail.filter(ImageFilter.GaussianBlur(2)))
    image = apply_highlight(image, alpha, (cx - 150, 180, cx + 120, 450), (255, 240, 210, 90), 20)

    if gem:
        glow = Image.new("RGBA", size, (0, 0, 0, 0))
        g = ImageDraw.Draw(glow)
        gem_box = (cx - 42, top + 112, cx + 42, top + 196)
        g.ellipse(gem_box, fill=ImageColor.getrgb(gem) + (220,))
        g.ellipse((cx - 20, top + 126, cx + 12, top + 156), fill=(255, 255, 255, 110))
        glow = glow.filter(ImageFilter.GaussianBlur(12))
        image = Image.alpha_composite(glow, image)
        orb = Image.new("RGBA", size, (0, 0, 0, 0))
        ImageDraw.Draw(orb).ellipse(gem_box, fill=ImageColor.getrgb(gem) + (235,))
        image = Image.alpha_composite(image, orb)

    return add_outline(image, alpha, (255, 245, 220, 80))


def render_key_bronze() -> Image.Image:
    size = (1024, 1536)
    bg = radial_background(size, "#5d5a56", "#252321")
    key = key_base(size, shaft_h=760, head_r=172, metal_top="#dcb171", metal_bottom="#5f3b1d", gem="#d37c25")
    alpha = key.getchannel("A")
    image = Image.alpha_composite(bg, make_shadow(alpha, offset=(0, 28), blur=42, opacity=180))
    return add_noise(Image.alpha_composite(image, key), 10)


def render_key_arcane() -> Image.Image:
    size = (1024, 1536)
    bg = radial_background(size, "#5b5f68", "#1d1f26")
    key = key_base(size, shaft_h=760, head_r=168, metal_top="#a9b6d1", metal_bottom="#38435f", gem="#69d7ff")
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    cx = size[0] // 2
    draw.arc((290, 190, 734, 610), 220, 325, fill=(150, 228, 255, 160), width=8)
    draw.arc((330, 230, 694, 570), 200, 345, fill=(150, 228, 255, 120), width=4)
    for start in (650, 840, 1040):
        draw.line((cx - 72, start, cx + 72, start - 42), fill=(145, 220, 255, 150), width=5)
    sigil = layer.filter(ImageFilter.GaussianBlur(12))
    key = Image.alpha_composite(Image.alpha_composite(sigil, key), layer)
    alpha = key.getchannel("A")
    image = Image.alpha_composite(bg, make_shadow(alpha, offset=(0, 26), blur=42, opacity=170))
    return add_noise(Image.alpha_composite(image, key), 10)


def render_map() -> Image.Image:
    size = (1024, 1024)
    bg = radial_background(size, "#6a6256", "#27231f")
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    paper = (224, 188, 132, 255)
    edge = (117, 79, 42, 255)
    draw.rounded_rectangle((238, 176, 792, 840), radius=36, fill=paper, outline=edge, width=8)
    draw.line((423, 188, 398, 830), fill=(140, 103, 70, 160), width=5)
    draw.line((606, 188, 624, 828), fill=(140, 103, 70, 150), width=5)
    draw.arc((270, 226, 484, 444), 220, 40, fill=(110, 80, 45, 180), width=8)
    draw.line((360, 540, 468, 628), fill=(110, 78, 44, 190), width=8)
    draw.line((468, 628, 550, 514), fill=(110, 78, 44, 190), width=8)
    draw.line((550, 514, 674, 660), fill=(110, 78, 44, 190), width=8)
    draw.line((674, 660, 718, 592), fill=(110, 78, 44, 190), width=8)
    draw.ellipse((336, 302, 378, 344), fill=(145, 88, 52, 210))
    draw.ellipse((510, 604, 552, 646), fill=(145, 88, 52, 210))
    draw.ellipse((690, 575, 732, 617), fill=(145, 88, 52, 210))
    draw.polygon([(666, 284), (736, 356), (674, 428), (608, 354)], outline=(76, 55, 38, 180), fill=(0, 0, 0, 0), width=6)
    draw.line((672, 302, 672, 410), fill=(76, 55, 38, 160), width=4)
    draw.line((620, 356, 724, 356), fill=(76, 55, 38, 160), width=4)
    alpha = layer.getchannel("A")
    paper_img = Image.alpha_composite(bg, make_shadow(alpha, offset=(0, 24), blur=32, opacity=150))
    paper_img = Image.alpha_composite(paper_img, layer)
    paper_img = apply_highlight(paper_img, alpha, (280, 200, 708, 420), (255, 241, 203, 90), 22)
    return add_noise(paper_img, 14)


def render_tool() -> Image.Image:
    size = (1024, 1024)
    bg = radial_background(size, "#64615e", "#222220")
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)

    draw.rounded_rectangle((452, 240, 572, 846), radius=58, fill=(125, 75, 41, 255))
    draw.rounded_rectangle((468, 258, 556, 830), radius=42, fill=(186, 126, 74, 255))
    draw.rounded_rectangle((286, 266, 736, 420), radius=42, fill=(76, 83, 92, 255))
    draw.rounded_rectangle((304, 286, 718, 402), radius=32, fill=(132, 140, 152, 255))
    draw.polygon([(278, 320), (164, 470), (232, 520), (366, 378)], fill=(95, 102, 111, 255))
    draw.polygon([(296, 330), (198, 465), (230, 495), (346, 370)], fill=(174, 179, 186, 220))
    draw.line((442, 352, 582, 352), fill=(74, 41, 24, 100), width=5)
    draw.line((498, 432, 526, 804), fill=(255, 215, 180, 80), width=6)
    alpha = layer.getchannel("A")
    tool = apply_highlight(layer, alpha, (268, 250, 730, 460), (255, 255, 255, 70), 18)
    tool = add_outline(tool, alpha, (240, 226, 205, 70))
    image = Image.alpha_composite(bg, make_shadow(alpha, offset=(0, 26), blur=34, opacity=175))
    return add_noise(Image.alpha_composite(image, tool), 12)


def render_bag() -> Image.Image:
    size = (1024, 1024)
    bg = radial_background(size, "#625b50", "#211f1d")
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)

    draw.polygon([(350, 304), (420, 240), (604, 240), (674, 304), (716, 442), (690, 720), (334, 720), (308, 442)], fill=(96, 55, 34, 255))
    draw.polygon([(370, 320), (432, 262), (594, 262), (654, 320), (690, 444), (668, 692), (356, 692), (334, 444)], fill=(164, 102, 64, 255))
    draw.arc((394, 152, 630, 380), 190, 350, fill=(112, 68, 40, 240), width=24)
    draw.arc((406, 164, 618, 368), 190, 350, fill=(198, 144, 98, 230), width=16)
    draw.line((376, 382, 648, 382), fill=(89, 50, 32, 220), width=16)
    draw.line((390, 380, 632, 380), fill=(218, 174, 124, 120), width=7)
    for x in (420, 512, 604):
        draw.line((x, 412, x, 654), fill=(120, 72, 44, 100), width=4)
    alpha = layer.getchannel("A")
    bag = apply_highlight(layer, alpha, (360, 250, 644, 470), (255, 230, 195, 78), 18)
    bag = add_outline(bag, alpha, (255, 219, 170, 64))
    image = Image.alpha_composite(bg, make_shadow(alpha, offset=(0, 24), blur=34, opacity=160))
    return add_noise(Image.alpha_composite(image, bag), 14)


def render_stone() -> Image.Image:
    size = (1024, 1024)
    bg = radial_background(size, "#4c535d", "#171a20")
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    pts = [(510, 180), (710, 284), (782, 520), (652, 778), (398, 818), (242, 588), (304, 310)]
    draw.polygon(pts, fill=(82, 88, 102, 255))
    draw.polygon([(500, 210), (684, 302), (736, 512), (626, 736), (418, 766), (286, 572), (336, 326)], fill=(132, 140, 164, 220))
    rune = Image.new("RGBA", size, (0, 0, 0, 0))
    r = ImageDraw.Draw(rune)
    lines = [
        ((496, 298), (496, 700)),
        ((496, 298), (598, 388)),
        ((494, 500), (618, 500)),
        ((494, 700), (614, 612)),
        ((428, 420), (566, 420)),
    ]
    for a, b in lines:
        r.line((a, b), fill=(112, 235, 255, 220), width=14)
    r.ellipse((454, 454, 540, 540), outline=(160, 245, 255, 230), width=10)
    glow = rune.filter(ImageFilter.GaussianBlur(24))
    layer = Image.alpha_composite(Image.alpha_composite(layer, glow), rune)
    alpha = layer.getchannel("A")
    stone = add_outline(layer, alpha, (205, 228, 255, 44))
    stone = apply_highlight(stone, alpha, (340, 220, 658, 428), (255, 255, 255, 74), 22)
    image = Image.alpha_composite(bg, make_shadow(alpha, offset=(0, 28), blur=38, opacity=170))
    aura = Image.new("RGBA", size, (0, 0, 0, 0))
    ImageDraw.Draw(aura).ellipse((280, 210, 740, 820), fill=(90, 220, 255, 38))
    image = Image.alpha_composite(image, aura.filter(ImageFilter.GaussianBlur(54)))
    return add_noise(Image.alpha_composite(image, stone), 8)


def render_gem(fill_top: str, fill_bottom: str, glow: str) -> Image.Image:
    size = (1024, 1536)
    bg = radial_background(size, "#5b5958", "#1f1d1e")
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    pts = [(520, 182), (692, 372), (650, 954), (506, 1328), (352, 928), (312, 372)]
    draw.polygon(pts, fill=(255, 255, 255, 255))
    alpha = layer.getchannel("A")
    gem = masked_gradient(alpha, fill_top, fill_bottom)

    facets = Image.new("RGBA", size, (0, 0, 0, 0))
    f = ImageDraw.Draw(facets)
    lines = [
        ((520, 182), (352, 928)),
        ((520, 182), (650, 954)),
        ((312, 372), (692, 372)),
        ((352, 928), (650, 954)),
        ((312, 372), (506, 1328)),
        ((692, 372), (506, 1328)),
        ((412, 620), (612, 628)),
        ((454, 782), (560, 1078)),
    ]
    for a, b in lines:
        f.line((a, b), fill=(255, 255, 255, 120), width=6)
    f.polygon([(520, 182), (692, 372), (520, 514), (312, 372)], fill=(255, 255, 255, 55))
    f.polygon([(352, 928), (506, 1328), (650, 954), (506, 980)], fill=(0, 0, 0, 36))
    glow_layer = Image.new("RGBA", size, ImageColor.getrgb(glow) + (0,))
    glow_layer.putalpha(alpha.filter(ImageFilter.GaussianBlur(20)))
    gem = Image.alpha_composite(glow_layer, gem)
    gem = Image.alpha_composite(gem, facets.filter(ImageFilter.GaussianBlur(4)))
    gem = Image.alpha_composite(gem, facets)
    gem = add_outline(gem, alpha, (255, 255, 255, 85))
    gem = apply_highlight(gem, alpha, (360, 210, 582, 460), (255, 255, 255, 110), 18)

    image = Image.alpha_composite(bg, make_shadow(alpha, offset=(0, 28), blur=42, opacity=180))
    aura = Image.new("RGBA", size, (0, 0, 0, 0))
    ImageDraw.Draw(aura).ellipse((214, 130, 808, 1380), fill=ImageColor.getrgb(glow) + (30,))
    image = Image.alpha_composite(image, aura.filter(ImageFilter.GaussianBlur(60)))
    return add_noise(Image.alpha_composite(image, gem), 8)


def save(image: Image.Image, name: str) -> Path:
    output = ASSETS / name
    image.save(output)
    return output


def main() -> None:
    outputs = [
        save(render_rope(), "corde.png"),
        save(render_key_bronze(), "cle_bronze.png"),
        save(render_key_arcane(), "cle_arcanique.png"),
        save(render_map(), "carte.png"),
        save(render_tool(), "outil_marteau.png"),
        save(render_bag(), "sac_cuir.png"),
        save(render_stone(), "pierre_communication.png"),
        save(render_gem("#86e6ff", "#1763a5", "#5be4ff"), "gemme_azur.png"),
        save(render_gem("#ff8fab", "#8d1634", "#ff6a88"), "gemme_rose.png"),
        save(render_gem("#9df58c", "#1c7a52", "#6dffba"), "gemme_verte.png"),
    ]
    for output in outputs:
        print(output.relative_to(ROOT))


if __name__ == "__main__":
    main()
