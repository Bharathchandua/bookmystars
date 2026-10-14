import os
from PIL import Image, ImageFilter

def blur_pad_image(src_path, dest_path, target_w, target_h, blur_radius=50, overlay_opacity=128):
    if not os.path.exists(src_path):
        print(f"Skipping (not found): {src_path}")
        return
        
    # Load source image
    img = Image.open(src_path)
    img_w, img_h = img.size
    
    # Create target canvas
    canvas = Image.new('RGBA', (target_w, target_h), (0, 0, 0, 255))
    
    # 1. Create blurred background
    # Scale source to cover target height
    scale_factor = max(target_w / img_w, target_h / img_h)
    bg_w = int(img_w * scale_factor)
    bg_h = int(img_h * scale_factor)
    bg = img.resize((bg_w, bg_h), Image.Resampling.LANCZOS)
    
    # Crop to canvas size centered
    left = (bg_w - target_w) // 2
    top = (bg_h - target_h) // 2
    bg_cropped = bg.crop((left, top, left + target_w, top + target_h))
    
    # Apply strong blur
    bg_blurred = bg_cropped.filter(ImageFilter.GaussianBlur(blur_radius))
    
    # Draw dark overlay on top of background
    overlay = Image.new('RGBA', (target_w, target_h), (0, 0, 0, overlay_opacity))
    bg_blurred = Image.alpha_composite(bg_blurred.convert('RGBA'), overlay)
    
    # 2. Paste sharp image in center
    # Scale sharp image to fit canvas width
    sharp_w = target_w
    sharp_h = int(img_h * (target_w / img_w))
    sharp_resized = img.resize((sharp_w, sharp_h), Image.Resampling.LANCZOS)
    
    # Paste centered vertically
    paste_y = (target_h - sharp_h) // 2
    canvas.paste(bg_blurred, (0, 0))
    canvas.paste(sharp_resized, (0, paste_y), sharp_resized.convert('RGBA') if img.mode == 'RGBA' else None)
    
    # Save back (overwrite in place)
    # Temporary save then rename to prevent file handle issues on Windows
    temp_path = dest_path + ".temp.png"
    canvas.convert('RGB').save(temp_path, 'PNG')
    img.close()
    
    if os.path.exists(dest_path):
        os.remove(dest_path)
    os.rename(temp_path, dest_path)
    print(f"Success: {src_path} -> {dest_path} ({target_w}x{target_h})")

# 10 categories images (tall 1:2.2 aspect ratio)
categories_files = [
    'card_media.png',
    'card_film.png',
    'card_dance.png',
    'card_makeover2.png',
    'card_fashion.png',
    'card_astrology.png',
    'card_art.png',
    'card_events.png',
    'card_business.png',
    'card_talent.png'
]

for filename in categories_files:
    path = os.path.join('src', 'assets', filename)
    blur_pad_image(path, path, 1024, 2253)

# BookMyStars Magazine Cover (1:1.45 aspect ratio)
mag_path = os.path.join('src', 'assets', 'magazine_cover.png')
blur_pad_image(mag_path, mag_path, 1024, 1489)
