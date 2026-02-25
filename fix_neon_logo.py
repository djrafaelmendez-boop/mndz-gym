from PIL import Image

def create_transparent_neon():
    # Open the neon green logo with black background
    img = Image.open('LOGO/logo 2.png').convert('RGBA')
    w, h = img.size
    pixels = img.load()
    
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            # If the pixel is very dark (close to black background)
            if r < 15 and g < 15 and b < 15:
                # Set alpha to 0 (transparent)
                pixels[x, y] = (r, g, b, 0)
            else:
                # Keep original color but ensure full opacity
                pass
                
    img.save('src/assets/logo_transparent.png', 'PNG')
    # Also save as the primary logo for consistent branding everywhere
    img.save('src/assets/logo.png', 'PNG')
    print("✅ Created transparent green neon logo")

create_transparent_neon()
