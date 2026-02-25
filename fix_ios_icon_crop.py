from PIL import Image, ImageDraw

def crop_and_generate_icon():
    ICON_SIZE = 1024

    # 1. Create RGB dark gray gradient background (no transparency for iOS)
    img = Image.new('RGB', (ICON_SIZE, ICON_SIZE))
    draw = ImageDraw.Draw(img)

    for y in range(ICON_SIZE):
        t = y / ICON_SIZE
        r = int(51 + (17 - 51) * t)
        g = int(51 + (17 - 51) * t)
        b = int(51 + (17 - 51) * t)
        draw.line([(0, y), (ICON_SIZE - 1, y)], fill=(r, g, b))

    # 2. Load the transparent neon lime logo
    logo = Image.open('src/assets/logo_transparent.png').convert('RGBA')
    
    # 3. Find true bounding box by ignoring completely transparent pixels
    # getbbox() returns the bounding box of the non-zero regions in the image.
    bbox = logo.getbbox()
    if bbox:
        logo = logo.crop(bbox)
        print(f"Cropped logo to true bounds: {bbox}")

    # 4. Scale cropped logo to be 85% of the icon width (which will now look enormous and correct)
    logo_target_width = int(ICON_SIZE * 0.85)
    ratio = logo_target_width / logo.width
    new_h = int(logo.height * ratio)
    logo_resized = logo.resize((logo_target_width, new_h), Image.LANCZOS)

    # 5. Center and paste
    x_offset = (ICON_SIZE - logo_target_width) // 2
    y_offset = (ICON_SIZE - new_h) // 2
    img.paste(logo_resized, (x_offset, y_offset), mask=logo_resized)

    # 6. Save
    img.save('resources/icon.png', 'PNG')
    print("✅ Generated perfectly scaled icon.png")

if __name__ == '__main__':
    crop_and_generate_icon()
