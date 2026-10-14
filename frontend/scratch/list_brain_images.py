import os
from PIL import Image

brain_dir = r"C:\Users\Ayush\.gemini\antigravity\brain\775edd14-ec8b-4382-bff8-707fcf7046e8"
files = os.listdir(brain_dir)

for f in files:
    if f.endswith('.png') or f.endswith('.jpg'):
        try:
            img = Image.open(os.path.join(brain_dir, f))
            print(f, img.size)
        except Exception as e:
            pass
