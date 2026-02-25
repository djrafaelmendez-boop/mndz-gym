from PIL import Image, ImageDraw
import os
import shutil

# 1. Copy the official logos to src/assets
shutil.copyfile('LOGO/logo.png', 'src/assets/logo_transparent.png')
shutil.copyfile('LOGO/logo 2.png', 'src/assets/logo.png')

ICON_SIZE = 1024

# Create gradient background
# Top: #333333 (dark gray), Bottom: #111111 (almost black)
img = Image.new('RGBA', (ICON_SIZE, ICON_SIZE), (0, 0, 0, 255))
draw = ImageDraw.Draw(img)

for y in range(ICON_SIZE):
    t = y / ICON_SIZE
    r = int(51 + (17 - 51) * t)
    g = int(51 + (17 - 51) * t)
    b = int(51 + (17 - 51) * t)
    draw.line([(0, y), (ICON_SIZE - 1, y)], fill=(r, g, b, 255))

# Load the official transparent logo directly from LOGO folder
logo = Image.open('LOGO/logo.png').convert('RGBA')

# Scale logo to fit ~65% of icon width
logo_target_width = int(ICON_SIZE * 0.65)
ratio = logo_target_width / logo.width
logo_resized = logo.resize((int(logo.width * ratio), int(logo.height * ratio)), Image.LANCZOS)

# Center the logo
x_offset = (ICON_SIZE - logo_resized.width) // 2
y_offset = (ICON_SIZE - logo_resized.height) // 2

# Composite
img.paste(logo_resized, (x_offset, y_offset), logo_resized)

# Save icon
img.save('src/assets/icon.png', 'PNG')
print(f"✅ Generated icon.png ({ICON_SIZE}x{ICON_SIZE}) with gray gradient background")

# Splash version
SPLASH_SIZE = 2732
splash = Image.new('RGBA', (SPLASH_SIZE, SPLASH_SIZE), (0, 0, 0, 255))
splash_draw = ImageDraw.Draw(splash)

for y in range(SPLASH_SIZE):
    t = y / SPLASH_SIZE
    r = int(51 + (17 - 51) * t)
    g = int(51 + (17 - 51) * t)
    b = int(51 + (17 - 51) * t)
    splash_draw.line([(0, y), (SPLASH_SIZE - 1, y)], fill=(r, g, b, 255))

splash_logo_width = int(SPLASH_SIZE * 0.40)
splash_ratio = splash_logo_width / logo.width
splash_logo = logo.resize((int(logo.width * splash_ratio), int(logo.height * splash_ratio)), Image.LANCZOS)

sx = (SPLASH_SIZE - splash_logo.width) // 2
sy = (SPLASH_SIZE - splash_logo.height) // 2
splash.paste(splash_logo, (sx, sy), splash_logo)
splash.save('src/assets/splash.png', 'PNG')
print(f"✅ Generated splash.png ({SPLASH_SIZE}x{SPLASH_SIZE}) with gray gradient background")
