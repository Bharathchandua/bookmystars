from PIL import Image

def inspect_image(name):
    img = Image.open('src/assets/' + name)
    w, h = img.size
    print(f"=== {name} ({w}x{h}) ===")
    
    # Get border pixels
    pixels = img.load()
    
    top = [pixels[x, 0] for x in range(w)]
    bottom = [pixels[x, h-1] for x in range(w)]
    left = [pixels[0, y] for y in range(h)]
    right = [pixels[w-1, y] for y in range(h)]
    
    def avg_color(lst):
        # handle transparency if RGBA
        r = sum(c[0] for c in lst) / len(lst)
        g = sum(c[1] for c in lst) / len(lst)
        b = sum(c[2] for c in lst) / len(lst)
        return (r, g, b)
        
    print("Top row mean color:", avg_color(top))
    print("Bottom row mean color:", avg_color(bottom))
    print("Left col mean color:", avg_color(left))
    print("Right col mean color:", avg_color(right))

for name in ['cta_mag_left.png', 'cta_mag_mid.png', 'cta_mag_right.png']:
    inspect_image(name)
