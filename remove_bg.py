from PIL import Image

def remove_black_background(input_path, output_path, threshold=25):
    img = Image.open(input_path).convert("RGBA")
    data = img.getdata()
    
    new_data = []
    for item in data:
        # Check if pixel is close to black
        # item is (R, G, B, A)
        r, g, b, a = item
        if r < threshold and g < threshold and b < threshold:
            # Make it fully transparent
            new_data.append((r, g, b, 0))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    img.save(output_path, "PNG")
    print(f"Created transparent logo at {output_path}")

if __name__ == "__main__":
    remove_black_background("src/assets/logo.png", "src/assets/logo_transparent.png")
