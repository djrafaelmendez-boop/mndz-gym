from PIL import Image, ImageDraw
import os

ICON_SIZE = 1024

# Create background in RGB mode to guarantee NO alpha channel
# iOS app icons must not have transparency, otherwise they get a white or black background
img = Image.new('RGB', (ICON_SIZE, ICON_SIZE))
draw = ImageDraw.Draw(img)

# Modern dark gray gradient
# Top: #333333 (rgb 51,51,51), Bottom: #111111 (rgb 17,17,17)
for y in range(ICON_SIZE):
    t = y / ICON_SIZE
    r = int(51 + (17 - 51) * t)
    g = int(51 + (17 - 51) * t)
    b = int(51 + (17 - 51) * t)
    draw.line([(0, y), (ICON_SIZE - 1, y)], fill=(r, g, b))

# Load the previously extracted transparent neon lime logo
logo = Image.open('src/assets/logo_transparent.png').convert('RGBA')

# Scale logo to be well-balanced (60% width)
logo_target_width = int(ICON_SIZE * 0.60)
ratio = logo_target_width / logo.width
new_h = int(logo.height * ratio)
logo_resized = logo.resize((logo_target_width, new_h), Image.LANCZOS)

# Center the logo precisely
x_offset = (ICON_SIZE - logo_target_width) // 2
y_offset = (ICON_SIZE - new_h) // 2

# Paste using the logo's alpha channel as the mask onto the RGB background
img.paste(logo_resized, (x_offset, y_offset), mask=logo_resized)

# Save as RGB PNG
img.save('src/assets/icon.png', 'PNG')
print(f"✅ Generated strict RGB icon.png ({ICON_SIZE}x{ICON_SIZE}) to prevent iOS white background glitch.")
