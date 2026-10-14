from PIL import Image

def find_borders(name):
    img = Image.open('src/assets/' + name)
    w, h = img.size
    pixels = img.load()
    
    # We want to check from top, bottom, left, right how many pixels have near-identical colors
    # suggesting a flat solid border.
    
    # Let's check from left edge
    left_border = 0
    ref_color = pixels[0, h // 2]
    for x in range(w // 4):
        # check average color deviation along the column
        col_pixels = [pixels[x, y] for y in range(h // 4, 3 * h // 4)]
        # check if all pixels in this column segment are very close to each other
        std_dev = sum(sum((c[i] - col_pixels[0][i])**2 for i in range(3)) for c in col_pixels) / len(col_pixels)
        if std_dev < 10:
            left_border = x
        else:
            break
            
    # Right edge
    right_border = 0
    for x in range(w - 1, 3 * w // 4, -1):
        col_pixels = [pixels[x, y] for y in range(h // 4, 3 * h // 4)]
        std_dev = sum(sum((c[i] - col_pixels[0][i])**2 for i in range(3)) for c in col_pixels) / len(col_pixels)
        if std_dev < 10:
            right_border = w - 1 - x
        else:
            break

    # Top edge
    top_border = 0
    for y in range(h // 4):
        row_pixels = [pixels[x, y] for x in range(w // 4, 3 * w // 4)]
        std_dev = sum(sum((c[i] - row_pixels[0][i])**2 for i in range(3)) for c in row_pixels) / len(row_pixels)
        if std_dev < 10:
            top_border = y
        else:
            break
            
    # Bottom edge
    bottom_border = 0
    for y in range(h - 1, 3 * h // 4, -1):
        row_pixels = [pixels[x, y] for x in range(w // 4, 3 * w // 4)]
        std_dev = sum(sum((c[i] - row_pixels[0][i])**2 for i in range(3)) for c in row_pixels) / len(row_pixels)
        if std_dev < 10:
            bottom_border = h - 1 - y
        else:
            break
            
    print(f"{name}: borders - Left: {left_border}px, Right: {right_border}px, Top: {top_border}px, Bottom: {bottom_border}px")

for name in ['cta_mag_left.png', 'cta_mag_mid.png', 'cta_mag_right.png']:
    find_borders(name)
