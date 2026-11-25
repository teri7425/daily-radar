"""hot-trends 홈스크린 아이콘(180x180 PNG)을 icon.svg에서 렌더링한다."""
import os, pathlib
os.environ.setdefault("LD_LIBRARY_PATH",
  "/workspace/.qa/sys2/usr/lib/x86_64-linux-gnu:/workspace/.qa/sys/usr/lib/x86_64-linux-gnu")
from playwright.sync_api import sync_playwright

here = pathlib.Path(__file__).parent
svg = (here / "icon.svg").read_text()
html = f"<html><body style='margin:0;background:transparent'>{svg}</body></html>"
with sync_playwright() as p:
    b = p.chromium.launch(args=["--no-sandbox"])
    pg = b.new_page(viewport={"width": 180, "height": 180}, device_scale_factor=1)
    pg.set_content(html)
    pg.wait_for_timeout(200)
    pg.screenshot(path=str(here / "icon-180.png"), omit_background=True)
    b.close()
print("icon-180.png written")
