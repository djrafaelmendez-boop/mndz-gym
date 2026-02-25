from PIL import Image, ImageDraw
import os, shutil

# Generate a new icon with gradient background + original logo overlay
ICON_SIZE = 1024

# Create gradient background (dark gray gradient, not flat black)
img = Image.new('RGBA', (ICON_SIZE, ICON_SIZE), (0, 0, 0, 255))
draw = ImageDraw.Draw(img)

# Gradient from charcoal (#262626 = 38,38,38) at top to near-black (#0D0D0D = 13,13,13) at bottom
for y in range(ICON_SIZE):
    t = y / ICON_SIZE
    r = int(38 + (13 - 38) * t)
    g = int(38 + (13 - 38) * t)
    b = int(38 + (13 - 38) * t)
    draw.line([(0, y), (ICON_SIZE - 1, y)], fill=(r, g, b, 255))

# Load the original transparent logo
logo = Image.open('src/assets/logo_transparent.png').convert('RGBA')

# Scale logo to fit ~70% of icon width
logo_target_width = int(ICON_SIZE * 0.70)
ratio = logo_target_width / logo.width
logo_resized = logo.resize((int(logo.width * ratio), int(logo.height * ratio)), Image.LANCZOS)

# Center the logo on the gradient
x_offset = (ICON_SIZE - logo_resized.width) // 2
y_offset = (ICON_SIZE - logo_resized.height) // 2

# Composite
img.paste(logo_resized, (x_offset, y_offset), logo_resized)

# Save as icon.png
img.save('src/assets/icon.png', 'PNG')
print(f"✅ Generated icon.png ({ICON_SIZE}x{ICON_SIZE}) with gradient background")

# Also generate splash with same gradient background
SPLASH_SIZE = 2732
splash = Image.new('RGBA', (SPLASH_SIZE, SPLASH_SIZE), (0, 0, 0, 255))
splash_draw = ImageDraw.Draw(splash)

for y in range(SPLASH_SIZE):
    t = y / SPLASH_SIZE
    r = int(38 + (13 - 38) * t)
    g = int(38 + (13 - 38) * t)
    b = int(38 + (13 - 38) * t)
    splash_draw.line([(0, y), (SPLASH_SIZE - 1, y)], fill=(r, g, b, 255))

# Scale logo for splash (~45% width)
splash_logo_width = int(SPLASH_SIZE * 0.45)
splash_ratio = splash_logo_width / logo.width
splash_logo = logo.resize((int(logo.width * splash_ratio), int(logo.height * splash_ratio)), Image.LANCZOS)

sx = (SPLASH_SIZE - splash_logo.width) // 2
sy = (SPLASH_SIZE - splash_logo.height) // 2

splash.paste(splash_logo, (sx, sy), splash_logo)
splash.save('src/assets/splash.png', 'PNG')
print(f"✅ Generated splash.png ({SPLASH_SIZE}x{SPLASH_SIZE}) with gradient background")
