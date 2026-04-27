from pathlib import Path
from PIL import Image, ImageOps


ROOT_DIR = Path(__file__).resolve().parent.parent
ASSETS_DIR = ROOT_DIR / "assets"
THUMBNAILS_DIR = ASSETS_DIR / "thumbnails"
CATEGORY_FOLDERS = ("characters", "spells", "equipment", "inventory")
IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}
MAX_SIZE = 256


def iter_source_images(folder: str):
    source_dir = ASSETS_DIR / folder
    if not source_dir.exists():
        return

    for path in source_dir.rglob("*"):
        if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS:
            yield path


def thumbnail_path(folder: str, source_path: Path) -> Path:
    relative_path = source_path.relative_to(ASSETS_DIR / folder)
    return (THUMBNAILS_DIR / folder / relative_path).with_suffix(".png")


def generate_thumbnail(source_path: Path, output_path: Path) -> bool:
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with Image.open(source_path) as image:
        image = ImageOps.exif_transpose(image)
        image.thumbnail((MAX_SIZE, MAX_SIZE), Image.Resampling.LANCZOS)

        if image.mode not in ("RGB", "RGBA"):
            image = image.convert("RGBA")

        image.save(output_path, "PNG", optimize=True)

    return True


def main():
    generated = 0

    for folder in CATEGORY_FOLDERS:
        for source_path in iter_source_images(folder):
            output_path = thumbnail_path(folder, source_path)
            if output_path.exists() and output_path.stat().st_mtime >= source_path.stat().st_mtime:
                continue

            generate_thumbnail(source_path, output_path)
            generated += 1

    print(f"Generated {generated} thumbnails in {THUMBNAILS_DIR.relative_to(ROOT_DIR)}")


if __name__ == "__main__":
    main()
