from PIL import Image
import os

def process_square_icon(input_path, output_path):
    if not os.path.exists(input_path):
        print(f"Skip: {input_path} not found")
        return
        
    img = Image.open(input_path).convert("RGBA")
    
    # Tight crop logic - UPDATED for wider field of view
    # We want to show MORE of the image, so we use the full minor dimension (1.0 factor)
    # instead of cropping in to 0.8.
    width, height = img.size
    side = min(width, height)  # Use full available square area
    
    left = (width - side) / 2
    top = (height - side) / 2
    right = (width + side) / 2
    bottom = (height + side) / 2
    
    img = img.crop((left, top, right, bottom))
    
    # Save as PNG
    img.save(output_path, "PNG")
    print(f"Refined square icon saved to {output_path}")

base_dir = "/Users/rafaelmendez/Desktop/antigravity/GYM2"
assets = [
    ("chest", "Gemini_Generated_Image_ash9v0ash9v0ash9.png", "chest_new.png"),
    ("back", "Gemini_Generated_Image_sb25spsb25spsb25.png", "back_new.png"),
    ("shoulders ", "Gemini_Generated_Image_jfb8ytjfb8ytjfb8.png", "shoulders_new.png"),
    ("legs", "Gemini_Generated_Image_jpj3l0jpj3l0jpj3.png", "legs_new.png"),
    ("abs", "Gemini_Generated_Image_8i1tek8i1tek8i1t.png", "abs_new.png"),
    ("arms", "Gemini_Generated_Image_wrdrtywrdrtywrdr.png", "arms_new.png"),
]

for folder, filename, output_name in assets:
    input_p = os.path.join(base_dir, folder, filename)
    output_p = os.path.join(base_dir, "src/assets", output_name)
    process_square_icon(input_p, output_p)
