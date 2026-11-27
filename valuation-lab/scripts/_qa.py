#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""valuation-lab 로컬 검증 (Playwright 390×844)

- 콘솔 에러 / 페이지 에러 0
- 가로 넘침 0px
- 한국 30 · 미국 30 로드, 검색, 정렬
- 종목 상세: w별 적정주가 · 모델 표 · ROE 토글 · 슬라이더 재계산 · 초기값 복원
- 직접 입력 시뮬레이터 계산
- 스크린샷 downloads/valuation-lab-home.png / -detail.png
"""
import asyncio
import functools
import http.server
import json
import os
import socketserver
import threading

from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = "/workspace/downloads"
PORT = 8767
results = []


def rec(name, ok, detail=""):
    results.append((name, bool(ok), detail))
    print(("PASS " if ok else "FAIL ") + name + ("" if ok else "  | " + str(detail)[:400]))


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


def serve():
    handler = functools.partial(Quiet, directory=ROOT)
    socketserver.TCPServer.allow_reuse_address = True
    httpd = socketserver.TCPServer(("127.0.0.1", PORT), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


async def main():
    httpd = serve()
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch(args=["--no-sandbox"])
        ctx = await browser.new_context(viewport={"width": 390, "height": 844},
                                        device_scale_factor=2, is_mobile=True, has_touch=True,
                                        locale="ko-KR", timezone_id="Asia/Seoul")
        page = await ctx.new_page()
        errors, console_err = [], []
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.on("console", lambda m: console_err.append(m.text) if m.type == "error" else None)
        page.on("requestfailed", lambda r: console_err.append("REQFAIL " + r.url))

        await page.goto(f"http://127.0.0.1:{PORT}/index.html", wait_until="load")
        await page.wait_for_timeout(700)

        # ---------- 1. 로드 ----------
        rec("페이지 로드 · 데이터 파싱", await page.evaluate("!!window.__val && !!window.__val.data()"))
        rec("JS 페이지 에러 0", len(errors) == 0, errors)
        rec("콘솔 error 0", len(console_err) == 0, console_err[:4])

        # ---------- 1-b. 기본 w=0.8 ----------
        st0 = await page.evaluate("window.__val.state().w")
        chip0 = await page.evaluate("document.querySelector('#wsel .chip.on')?.dataset.w || null")
        meta0 = await page.evaluate("document.getElementById('listCount').innerText")
        first0 = await page.evaluate("""() => {
          const row = document.querySelector('#list .row');
          return {r2: row ? row.querySelector('.r2').innerText.replace(/\\s+/g,' ') : '',
                  badge: row ? row.querySelector('.badge').innerText : ''};
        }""")
        rec("기본 w=0.8 (상태값)", abs(st0 - 0.8) < 1e-9, st0)
        rec("기본 w=0.8 칩 활성", chip0 is not None and abs(float(chip0) - 0.8) < 1e-9, chip0)
        rec("목록 메타 w=0.8 표시", "w=0.8" in meta0, meta0)
        rec("초기 적정주가·Gap% 표시", "적정" in first0["r2"] and any(c.isdigit() for c in first0["r2"]) and "%" in first0["badge"], first0)

        # ---------- 2. 가로 넘침 ----------
        ov = await page.evaluate("""() => {
          const de = document.documentElement;
          const over = [];
          document.querySelectorAll('body *').forEach(el=>{
            const r = el.getBoundingClientRect();
            if (r.width>0 && (r.right > 391.5 || r.left < -1.5)) over.push((el.className||el.tagName)+':'+Math.round(r.right));
          });
          return {sw: de.scrollWidth, cw: de.clientWidth, bw: document.body.scrollWidth, over: over.slice(0,6)};
        }""")
        rec("가로 넘침 0px", ov["sw"] <= 390 and ov["bw"] <= 390, ov)

        # ---------- 3. 헤더: 지수·할인율 ----------
        hdr = await page.evaluate("""() => ({
          idx: [...document.querySelectorAll('#idxbar .idx')].map(e=>e.innerText.replace(/\\n/g,' ')),
          rates: [...document.querySelectorAll('#ratebar .rate')].map(e=>e.innerText.replace(/\\n/g,' '))
        })""")
        rec("지수 5개 표시", len(hdr["idx"]) == 5, hdr["idx"])
        rec("KOSPI·S&P500 지수값 존재", any("코스피" in x and any(c.isdigit() for c in x) for x in hdr["idx"])
            and any("S&P" in x for x in hdr["idx"]), hdr["idx"])
        rec("할인율 칩 KR 10.45% / US 9.90%",
            "10.45%" in hdr["rates"][0] and "9.90%" in hdr["rates"][1], hdr["rates"])

        # ---------- 4. 목록 ----------
        n_all = await page.locator("#list .row").count()
        rec("전체 탭 60종목", n_all == 60, n_all)
        await page.evaluate("window.__val.setTab('KR')")
        n_kr = await page.locator("#list .row").count()
        rec("한국 TOP 30 = 30종목", n_kr == 30, n_kr)
        await page.evaluate("window.__val.setTab('US')")
        n_us = await page.locator("#list .row").count()
        rec("미국 TOP 30 = 30종목", n_us == 30, n_us)

        # 실제 30개가 서로 다른 종목인지
        tks = await page.evaluate("window.__val.rows().map(r=>r.ticker)")
        rec("미국 30종목 티커 중복 없음", len(set(tks)) == 30, tks[:6])

        await page.evaluate("window.__val.setTab('ALL')")

        # ---------- 5. 검색 ----------
        await page.evaluate("window.__val.setQuery('삼성')")
        q1 = await page.locator("#list .row").count()
        q1names = await page.locator("#list .row .nm").all_inner_texts()
        rec("검색 '삼성' 필터", q1 >= 5 and all("삼성" in n for n in q1names), (q1, q1names))
        await page.evaluate("window.__val.setQuery('NVDA')")
        q2 = await page.locator("#list .row").count()
        nm2 = await page.locator("#list .row .nm").first.inner_text()
        rec("검색 'NVDA' 1건", q2 == 1 and "NVIDIA" in nm2, (q2, nm2))
        await page.evaluate("window.__val.setQuery('없는종목xyz')")
        empty = await page.locator("#list .row").count()
        rec("검색 결과 없음 안내", empty == 0, empty)
        await page.evaluate("window.__val.setQuery('')")

        # ---------- 6. 정렬 ----------
        await page.evaluate("window.__val.setSort('gap')")
        gaps = await page.evaluate("window.__val.rows().map(r=>r.gap)")
        gaps_num = [g for g in gaps if g is not None]
        rec("Gap% 내림차순 정렬", all(gaps_num[i] >= gaps_num[i+1] - 1e-9 for i in range(len(gaps_num)-1)),
            gaps_num[:5])
        await page.evaluate("window.__val.setSort('mcap')")
        mc = await page.evaluate("window.__val.rows().map(r=>r.ticker)")
        rec("시총순 정렬 (삼성전자·애플 상단)", mc[0] in ("005930", "AAPL", "MSFT"), mc[:3])
        await page.evaluate("window.__val.setSort('roe')")
        roes = await page.evaluate("window.__val.rows().map(r=>window.__val.roeOf(window.__val.data().stocks.find(s=>s.ticker===r.ticker),'y0'))")
        rn = [r for r in roes if r is not None]
        rec("ROE 내림차순 정렬", all(rn[i] >= rn[i+1] - 1e-9 for i in range(len(rn)-1)), rn[:4])
        await page.evaluate("window.__val.setSort('gap')")

        # ---------- 7. w 선택 ----------
        await page.evaluate("window.__val.setW(0.7)")
        st = await page.evaluate("window.__val.state().w")
        rec("w 선택 0.7 반영", abs(st - 0.7) < 1e-9, st)
        gap07 = await page.evaluate("window.__val.rows().map(r=>r.gap)")
        await page.evaluate("window.__val.setW(0.8)")
        rec("w 칩 재선택 0.8 반영", abs(await page.evaluate("window.__val.state().w") - 0.8) < 1e-9)
        gap08 = await page.evaluate("window.__val.rows().map(r=>r.gap)")
        rec("w 변경 시 Gap% 재계산", any(a is not None and b is not None and abs(a-b) > 1e-6 for a, b in zip(gap07, gap08)), (gap07[:3], gap08[:3]))

        # ---------- 8. 상세 ----------
        await page.evaluate("window.__val.open('005930')")
        await page.wait_for_timeout(350)
        rec("상세 시트 열림", await page.evaluate("document.getElementById('sheet').classList.contains('open')"))
        d = await page.evaluate("""() => {
          const t = [...document.querySelectorAll('#dBody .tbl tr')].map(r=>r.innerText.replace(/\\s+/g,' ').trim());
          const kv = [...document.querySelectorAll('#dBody .kv .r')].map(r=>r.innerText.replace(/\\s+/g,' ').trim());
          return {t, kv, h: document.getElementById('dBody').innerText.slice(0,300),
                  bars: [...document.querySelectorAll('#dBody .wb')].map(b=>b.innerText.replace(/\\s+/g,' ').trim())};
        }""")
        rec("상세 w 테이블 4행(1.0/0.9/0.8/0.7)", sum(1 for x in d["t"] if x.startswith("w") or x[:3] in ("1.0", "0.9", "0.8", "0.7")) >= 4, d["t"])
        rec("상세 바차트 현재가+w 4개", len(d["bars"]) == 5, d["bars"])
        rec("모델 표에 Ke·B₀·초과이익", any("할인율" in x for x in d["kv"]) and any("자기자본" in x for x in d["kv"]) and any("초과이익" in x for x in d["kv"]), d["kv"])
        rec("상세 기본 기준 w=0.8", "w=0.8" in d["h"], d["h"][:200])

        # 계산 검증: 페이지 계산 vs 파이썬 재계산
        calc = await page.evaluate("""() => {
          const s = window.__val.data().stocks.find(x=>x.ticker==='005930');
          const m = window.__val.model(s, s.ke, s.roe.y0, 1.0);
          return {fair:m.fair, gap:m.gap, eq:s.equity, roe:s.roe.y0, ke:s.ke, shares:s.shares, treas:s.treasury, pref:s.prefMarketCap, price:s.price};
        }""")
        ke, roe = calc["ke"] / 100, calc["roe"] / 100
        exp = calc["eq"] + calc["eq"] * (roe - ke) * (1.0 / (1 + ke - 1.0))
        exp_fair = (exp - calc["pref"]) / (calc["shares"] - calc["treas"])
        rec("S-RIM 계산식 일치(삼성전자 w1.0)",
            abs(exp_fair - calc["fair"]) < 1e-3 and abs((exp_fair / calc["price"] - 1) * 100 - calc["gap"]) < 1e-6,
            (calc["fair"], exp_fair))

        # ROE 토글
        roe0 = await page.evaluate("window.__val.data().stocks.find(s=>s.ticker==='005930').roe")
        await page.evaluate("window.__val.setRoeMode('avg')")
        after_avg = await page.evaluate("document.getElementById('simFair').innerText")
        await page.evaluate("window.__val.setRoeMode('y0')")
        after_y0 = await page.evaluate("document.getElementById('simFair').innerText")
        rec("ROE 3개년 가중평균 토글 반영", after_avg != after_y0, (after_avg, after_y0, roe0))

        # 슬라이더
        before = await page.evaluate("document.getElementById('simFair').innerText")
        await page.evaluate("window.__val.slide(12.0, 30.0)")
        await page.wait_for_timeout(120)
        after = await page.evaluate("({f:document.getElementById('simFair').innerText, g:document.getElementById('simGap').innerText, k:document.getElementById('keVal').innerText, r:document.getElementById('roeVal').innerText})")
        rec("Ke/ROE 슬라이더 즉시 재계산", after["f"] != before and after["k"].startswith("12.00") and after["r"].startswith("30.00"), (before, after))
        await page.evaluate("window.__val.reset()")
        await page.wait_for_timeout(120)
        reset = await page.evaluate("({f:document.getElementById('simFair').innerText, k:document.getElementById('keVal').innerText})")
        rec("초기값 복원", reset["f"] == before and reset["k"].startswith("10.45"), (before, reset))

        # ---------- 9. 미국 종목 상세 ----------
        await page.evaluate("window.__val.close(); window.__val.open('NVDA')")
        await page.wait_for_timeout(250)
        nv = await page.evaluate("({name:document.getElementById('dName').innerText, body:document.getElementById('dBody').innerText})")
        rec("미국 종목 상세 렌더(NVDA)", "NVIDIA" in nv["name"] and "Gap" in nv["body"] and "USD" in nv["body"], nv["name"])

        await page.evaluate("window.__val.close()")

        # ---------- 10. 직접 입력 시뮬레이터 ----------
        await page.evaluate("window.__val.setTab('SIM')")
        await page.wait_for_timeout(150)
        await page.evaluate("window.__val.simFill()")
        await page.evaluate("window.__val.simCalc()")
        await page.wait_for_timeout(200)
        sim = await page.evaluate("window.__simResult")
        # 예시: price 5만, shares 1천만, equity 3천억, ROE 12, Ke 10.45 — 기본 w=0.8 기준
        eqv, rv, kv = 3e11, 0.12, 0.1045
        exp_sim = (eqv + eqv * (rv - kv) * (0.8 / (1 + kv - 0.8))) / 1e7
        rec("직접 입력 계산 일치(w=0.8)", sim and abs(sim["fair"] - exp_sim) < 1.0, (sim, exp_sim))
        rec("직접 입력 기본 w=0.8 표시", "w=0.8" in (await page.locator("#simRes").inner_text()), await page.locator("#simRes").inner_text())
        rec("직접 입력 결과 표시", await page.locator("#simRes .tbl tr").count() >= 5)

        # 잘못된 입력
        await page.evaluate("document.getElementById('f-price').value=''")
        await page.evaluate("window.__val.simCalc()")
        rec("입력 누락 안내", "입력" in (await page.locator("#simRes").inner_text()))

        # ---------- 11. 스크린샷 ----------
        await page.evaluate("window.__val.setTab('ALL'); window.__val.setSort('gap'); window.__val.setW(0.8)")
        await page.wait_for_timeout(250)
        await page.screenshot(path=os.path.join(OUT, "valuation-lab-home.png"))
        rec("홈 스크린샷", os.path.exists(os.path.join(OUT, "valuation-lab-home.png")))
        await page.screenshot(path=os.path.join(OUT, "valuation-lab-w08.png"))
        rec("기본 w=0.8 홈 스크린샷", os.path.exists(os.path.join(OUT, "valuation-lab-w08.png")))

        await page.evaluate("window.__val.open('005930')")
        await page.wait_for_timeout(400)
        # 상세 전체를 한 장에 담기 위해 시트 패널을 문서 흐름으로 펼친다
        await page.evaluate("""() => {
          const s=document.getElementById('sheet'), p=document.getElementById('sheetPanel');
          s.style.position='static'; s.style.background='#070c15'; s.style.display='block';
          p.style.position='static'; p.style.height='auto'; p.style.overflow='visible'; p.style.maxWidth='390px';
          document.body.style.overflow='visible';
          document.querySelector('.app').style.display='none';
          window.scrollTo(0,0);
        }""")
        await page.wait_for_timeout(300)
        await page.screenshot(path=os.path.join(OUT, "valuation-lab-detail.png"), full_page=True)
        rec("상세 스크린샷", os.path.exists(os.path.join(OUT, "valuation-lab-detail.png")))

        # 넘침 재확인 (상세 화면)
        ov2 = await page.evaluate("({sw:document.documentElement.scrollWidth, bw:document.body.scrollWidth})")
        rec("상세 화면 가로 넘침 0px", ov2["sw"] <= 390 and ov2["bw"] <= 390, ov2)

        await browser.close()
    httpd.shutdown()

    fails = [r for r in results if not r[1]]
    print("\n=== 결과: %d/%d 통과 ===" % (len(results) - len(fails), len(results)))
    if fails:
        for f in fails:
            print(" FAIL:", f[0], f[2])
    return 1 if fails else 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
