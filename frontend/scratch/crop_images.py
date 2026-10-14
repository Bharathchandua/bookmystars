import os
from PIL import Image

brain_dir = r"C:\Users\Ayush\.gemini\antigravity\brain\775edd14-ec8b-4382-bff8-707fcf7046e8"
assets_dir = r"C:\Users\Ayush\Downloads\book_my_stars-main\book_my_stars-main\src\assets"

image_mappings = {
    'card_media.png': 'card_media_1782468413038.png',
    'card_film.png': 'card_film_1782468428536.png',
    'card_dance.png': 'card_dance_1782468444928.png',
    'card_makeover2.png': 'card_makeover2_1782468460295.png',
    'card_fashion.png': 'card_fashion_1782468496466.png',
    'card_astrology.png': 'card_astrology_1782468513336.png',
    'card_art.png': 'card_art_1782468529824.png',
    'card_events.png': 'card_events_1782388345810.png',
    'card_business.png': 'card_business_1782388365369.png',
    'card_talent.png': 'card_talent_spotlight_1782388383956.png',
}

# Process 10 category cards (target aspect ratio 1:2.2)
# height = 1024, width = 1024 / 2.2 = 465
for dest_name, src_name in image_mappings.items():
    src_path = os.path.join(brain_dir, src_name)
    dest_path = os.path.join(assets_dir, dest_name)
    
    if not os.path.exists(src_path):
        print(f"Error: source not found: {src_path}")
        continue
        
    img = Image.open(src_path)
    w, h = img.size
    
    # Target aspect ratio is 1:2.2 (so width = h / 2.2)
    target_h = h
    target_w = int(h / 2.2)
    
    left = (w - target_w) // 2
    top = 0
    right = left + target_w
    bottom = h
    
    cropped = img.crop((left, top, right, bottom))
    
    if os.path.exists(dest_path):
        os.remove(dest_path)
        
    cropped.convert('RGB').save(dest_path, 'PNG')
    print(f"Cropped category card: {src_name} ({w}x{h}) -> {dest_name} ({target_w}x{target_h})")

# Process magazine_cover.png (target aspect ratio 1:1.45)
# height = 1024, width = 1024 / 1.45 = 706
src_mag = os.path.join(brain_dir, 'magazine_cover_1782387759768.png')
dest_mag = os.path.join(assets_dir, 'magazine_cover.png')

if os.path.exists(src_mag):
    img = Image.open(src_mag)
    w, h = img.size
    target_h = h
    target_w = int(h / 1.45)
    
    left = (w - target_w) // 2
    top = 0
    right = left + target_w
    bottom = h
    
    cropped = img.crop((left, top, right, bottom))
    
    if os.path.exists(dest_mag):
        os.remove(dest_mag)
        
    cropped.convert('RGB').save(dest_mag, 'PNG')
    print(f"Cropped magazine cover: magazine_cover_1782387759768.png ({w}x{h}) -> magazine_cover.png ({target_w}x{target_h})")
else:
    print(f"Error: magazine source not found: {src_mag}")
