# -*- coding: utf-8 -*-
"""SceneLoop 앱 아이콘: 클래퍼보드 + 반복 화살표 + 5× """
from PIL import Image, ImageDraw, ImageFont
import math, os

def font(size):
    for p in ("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
              "/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf",
              "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"):
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

def make(size, path):
    S = size * 4  # 슈퍼샘플링
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # 배경 라운드 사각형 + 세로 그라데이션
    r = int(S * 0.225)
    bg = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    bd = ImageDraw.Draw(bg)
    top = (26, 32, 44); bot = (8, 10, 15)
    for y in range(S):
        t = y / S
        col = tuple(int(top[i] * (1 - t) + bot[i] * t) for i in range(3)) + (255,)
        bd.line([(0, y), (S, y)], fill=col)
    mask = Image.new("L", (S, S), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, S - 1, S - 1], radius=r, fill=255)
    img.paste(bg, (0, 0), mask)

    # 붉은 글로우
    glow = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([S * 0.06, S * 0.02, S * 0.94, S * 0.86], fill=(229, 9, 20, 38))
    img = Image.alpha_composite(img, glow)
    d = ImageDraw.Draw(img)

    # 클래퍼보드 본체
    bx0, bx1 = S * 0.17, S * 0.83
    by0, by1 = S * 0.30, S * 0.80
    d.rounded_rectangle([bx0, by0, bx1, by1], radius=S * 0.045, fill=(247, 249, 252, 255))
    # 상단 접힌 판
    tx0, tx1 = bx0, bx1
    ty0, ty1 = S * 0.20, S * 0.315
    d.rounded_rectangle([tx0, ty0, tx1, ty1], radius=S * 0.04, fill=(229, 9, 20, 255))
    # 빗금
    step = (tx1 - tx0) / 6.0
    for i in range(6):
        if i % 2 == 0:
            x = tx0 + i * step + step * 0.18
            d.polygon([(x, ty1), (x + step * 0.30, ty1), (x + step * 0.52, ty0), (x + step * 0.22, ty0)], fill=(255, 255, 255, 235))
    # 본체 위 네모 두 개(클래퍼 홈)
    d.rounded_rectangle([bx0 + S*0.055, by0 + S*0.075, bx1 - S*0.055, by0 + S*0.105], radius=S*0.012, fill=(205, 213, 226, 255))

    # 반복 화살표 (본체 안쪽)
    cx, cy = S * 0.5, S * 0.60
    rr = S * 0.115
    w = int(S * 0.028)
    d.arc([cx - rr, cy - rr, cx + rr, cy + rr], start=205, end=340, fill=(59, 130, 246, 255), width=w)
    d.arc([cx - rr, cy - rr, cx + rr, cy + rr], start=25, end=160, fill=(59, 130, 246, 255), width=w)
    # 화살촉 2개
    def head(px, py, ang):
        s = S * 0.052
        a1, a2 = ang + math.radians(150), ang - math.radians(150)
        d.polygon([(px, py), (px + s * math.cos(a1), py + s * math.sin(a1)),
                   (px + s * math.cos(a2), py + s * math.sin(a2))], fill=(59, 130, 246, 255))
    head(cx + rr * math.cos(math.radians(-20)), cy + rr * math.sin(math.radians(-20)), math.radians(70))
    head(cx + rr * math.cos(math.radians(160)), cy + rr * math.sin(math.radians(160)), math.radians(250))

    # 5× 배지
    f = font(int(S * 0.135))
    txt = "5×"
    bb = d.textbbox((0, 0), txt, font=f)
    tw, th = bb[2] - bb[0], bb[3] - bb[1]
    px, py = S * 0.705, S * 0.845
    d.rounded_rectangle([px - tw/2 - S*0.045, py - th/2 - S*0.028, px + tw/2 + S*0.045, py + th/2 + S*0.032],
                        radius=S * 0.05, fill=(16, 185, 129, 255))
    d.text((px - tw/2 - bb[0], py - th/2 - bb[1]), txt, font=f, fill=(9, 14, 20, 255))

    img = img.resize((size, size), Image.LANCZOS)
    img.save(path)

make(180, "icon-180.png")
make(512, "icon-512.png")
print("icons:", os.path.getsize("icon-180.png"), os.path.getsize("icon-512.png"))
