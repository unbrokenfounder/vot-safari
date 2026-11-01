"""Generates the dark VOT Safari icon in every size the project uses."""
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
BASE = 2048
BARS = [0.20, 0.40, 0.60, 0.40, 0.20]  # relative heights: a voice waveform


def draw_icon() -> Image.Image:
    img = Image.new("RGBA", (BASE, BASE), (0, 0, 0, 0))

    gradient = Image.new("RGBA", (BASE, BASE))
    pixels = gradient.load()
    for y in range(BASE):
        t = y / (BASE - 1)
        shade = int(34 * (1 - t) + 6 * t)
        for x in range(BASE):
            pixels[x, y] = (shade, shade, shade + 2, 255)

    mask = Image.new("L", (BASE, BASE), 0)
    radius = int(BASE * 0.225)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, BASE - 1, BASE - 1), radius, fill=255)
    img.paste(gradient, (0, 0), mask)

    draw = ImageDraw.Draw(img)
    inset = int(BASE * 0.012)
    draw.rounded_rectangle(
        (inset, inset, BASE - 1 - inset, BASE - 1 - inset),
        radius - inset,
        outline=(255, 255, 255, 30),
        width=int(BASE * 0.008),
    )

    bar_w = int(BASE * 0.085)
    gap = int(BASE * 0.062)
    total = bar_w * len(BARS) + gap * (len(BARS) - 1)
    x = (BASE - total) // 2
    for i, rel in enumerate(BARS):
        h = int(BASE * rel)
        y0 = (BASE - h) // 2
        alpha = 255 if i == 2 else 230 - abs(i - 2) * 25
        draw.rounded_rectangle(
            (x, y0, x + bar_w, y0 + h), bar_w // 2, fill=(255, 255, 255, alpha)
        )
        x += bar_w + gap
    return img


def save(img: Image.Image, path: Path, size: int) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    img.resize((size, size), Image.LANCZOS).save(path, optimize=True)


def main() -> None:
    icon = draw_icon()
    for size in (16, 32, 48, 64, 96, 128, 256):
        save(icon, ROOT / "src/public/icons" / f"icon-{size}.png", size)

    appicon = ROOT / "safari/VOT Safari/VOT Safari/Assets.xcassets/AppIcon.appiconset"
    for base in (16, 32, 128, 256, 512):
        save(icon, appicon / f"mac-icon-{base}@1x.png", base)
        save(icon, appicon / f"mac-icon-{base}@2x.png", base * 2)


if __name__ == "__main__":
    main()
