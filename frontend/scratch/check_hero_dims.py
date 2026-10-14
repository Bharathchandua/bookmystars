from PIL import Image

files = [
    'client-hero.png',
    'card_film.png',
    'card_dance.png',
    'card_makeover2.png',
    'card_fashion.png',
    'card_astrology.png',
    'card_art.png',
    'card_events.png',
    'card_business.png',
    'card_talent.png',
    'magazine_cover.png'
]

for f in files:
    try:
        img = Image.open('src/assets/' + f)
        print(f, img.size)
    except Exception as e:
        print(f, "Error:", e)
