from PIL import Image
import os

def remove_glow_transparent(img_path, threshold=200):
    img = Image.open(img_path).convert("RGBA")
    data = img.getdata()
    new_data = []
    
    for item in data:
        # item is (R, G, B, A)
        if item[3] > 0:
            if item[3] < threshold:
                # remove glow by setting transparent
                new_data.append((item[0], item[1], item[2], 0))
            else:
                # To maintain some antialiasing, if it's very close to edge, maybe keep it?
                # For simplicity, if alpha is high, keep it. 
                # If we just keep it, we'll have a hard edge. 
                # Let's map alpha from [threshold, 255] -> [0, 255]
                new_a = int((item[3] - threshold) * (255.0 / (255 - threshold)))
                new_data.append((item[0], item[1], item[2], new_a))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    img.save(img_path, "PNG")

def remove_glow_solid(img_path, threshold=50):
    img = Image.open(img_path).convert("RGBA")
    data = img.getdata()
    new_data = []
    
    for item in data:
        # The glow is green, the text is bright green (#DFFF00). Background is dark black (#0A0A0A).
        # We can look at the brightness (Luminance) or just the G channel.
        # If G < threshold, force to background color #0A0A0A (10, 10, 10, 255)
        # But wait, original background might be perfectly black (0,0,0) or dark gray.
        if item[1] < threshold:
            new_data.append((10, 10, 10, 255))
        else:
            # map [threshold, 255] to [0, 255] to soften the edge?
            # actually if we just keep original pixel for high brightness
            # it might be hard-edged but fine at 2732x2732.
            # To smooth it, we blend with background.
            factor = (item[1] - threshold) / (255.0 - threshold)
            r = int(10 + (item[0] - 10) * factor)
            g = int(10 + (item[1] - 10) * factor)
            b = int(10 + (item[2] - 10) * factor)
            new_data.append((r, g, b, 255))
            
    img.putdata(new_data)
    img.save(img_path, "PNG")

print("Processing transparent logo...")
remove_glow_transparent("src/assets/logo_transparent.png", threshold=140)
print("Processing solid logo...")
remove_glow_solid("src/assets/logo.png", threshold=140)
print("Processing splash...")
remove_glow_solid("src/assets/splash.png", threshold=140)

# Copy logo.png to icon.png
import shutil
shutil.copy("src/assets/logo.png", "src/assets/icon.png")
print("Processing icon... (copied from logo.png)")

print("Done.")
