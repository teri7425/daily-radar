#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""valuation-lab 빌드

1) data/valuation.json 을 index.html 안에 심어 file:// 로 열어도 데이터가 보이게 한다.
2) data/valuation.json 이 있으면 <script> 안의 EMBEDDED_DATA 를 최신 스냅샷으로 교체.
3) 홈스크린 아이콘(icon-180/192/512.png)을 만든다.

사용법: python3 build.py [--no-icon]
"""
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
HTML = os.path.join(HERE, "index.html")
DATA = os.path.join(HERE, "data", "valuation.json")


def embed_data():
    with open(DATA, encoding="utf-8") as f:
        raw = json.load(f)
    blob = json.dumps(raw, ensure_ascii=False, separators=(",", ":"))
    with open(HTML, encoding="utf-8") as f:
        html = f.read()
    pat = re.compile(r"const EMBEDDED_DATA = .*?; /\* __DATA_START__ \*/", re.S)
    new = "const EMBEDDED_DATA = " + blob + "; /* __DATA_START__ */"
    if not pat.search(html):
        raise SystemExit("EMBEDDED_DATA 마커를 찾지 못했습니다")
    html = pat.sub(lambda m: new, html, count=1)
    with open(HTML, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"embedded {len(blob)/1024:.0f}KB into index.html")


def make_icons():
    from PIL import Image, ImageDraw

    def icon(size):
        img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        d = ImageDraw.Draw(img)
        s = size / 180.0
        # 배경 라운드 사각형
        d.rounded_rectangle([0, 0, size - 1, size - 1], radius=int(40 * s), fill=(10, 17, 29, 255))
        d.rounded_rectangle([int(1 * s), int(1 * s), size - 1 - int(1 * s), size - 1 - int(1 * s)],
                            radius=int(39 * s), outline=(109, 85, 39, 255), width=max(1, int(1.4 * s)))
        # 골드 상승 막대 3개 + 민트 화살표
        base = int(132 * s)
        bars = [(44, 100, 18), (80, 78, 18), (116, 52, 18)]
        for x, top, w in bars:
            d.rounded_rectangle([int(x * s), int(top * s), int((x + w) * s), base * s],
                                radius=int(5 * s), fill=(242, 199, 110, 255))
        d.line([int(50 * s), int(120 * s), int(90 * s), int(96 * s), int(128 * s), int(60 * s)],
               fill=(95, 227, 192, 255), width=max(2, int(5 * s)), joint="curve")
        # S 자
        d.line([int(64 * s), int(150 * s), int(112 * s), int(150 * s)], fill=(242, 199, 110, 120),
               width=max(2, int(4 * s)))
        return img

    for size, name in ((180, "icon-180.png"), (192, "icon-192.png"), (512, "icon-512.png")):
        icon(size).save(os.path.join(HERE, name))
        print("wrote", name)


if __name__ == "__main__":
    if "--no-icon" not in sys.argv:
        make_icons()
    if os.path.exists(DATA):
        embed_data()
    else:
        print("data/valuation.json 없음 — 임베드 생략")
