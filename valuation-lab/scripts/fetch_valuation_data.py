#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
S-RIM 밸류에이션 데이터 수집기 (valuation-lab)

수집 항목
  1) 할인율(Ke)
     - 한국 : KIS채권평가(kisrating.com) '등급별금리스프레드' 무보증회사채 BBB- 5년
     - 미국 : Yahoo Finance 10년물 국채금리(^TNX) + ERP 5.0%p
  2) 종목 : 한국 시총 상위 30(보통주 기준) + 미국 시총 상위 30
  3) 지수 : KOSPI, KOSDAQ, S&P500, NASDAQ100, SOX

출력: <app>/data/valuation.json

값은 모두 '실제 조회값'이며, 산출 근거를 함께 기록한다.
  - 한국 재무 : WISEfn(comp.wisereport.co.kr) 연결재무제표(지배주주지분) + 연간 컨센서스 ROE
  - 한국 시세 : 네이버 금융(m.stock.naver.com)
  - 미국 재무 : Nasdaq(api.nasdaq.com) 분기 재무상태표·연간 손익계산서·애널리스트 EPS 추정
  - 미국 지수/금리 : Yahoo Finance

사용법:
  python3 fetch_valuation_data.py                 # 전체 수집 (캐시 사용)
  python3 fetch_valuation_data.py --no-cache      # 캐시 무시하고 새로 수집
  python3 fetch_valuation_data.py --out ../data/valuation.json
"""

import argparse
import concurrent.futures
import datetime as dt
import hashlib
import html
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
APP_DIR = os.path.dirname(HERE)
DEFAULT_OUT = os.path.join(APP_DIR, "data", "valuation.json")

UA_DESKTOP = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
              "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")
UA_MOBILE = "Mozilla/5.0 (Linux; Android 14; SM-S921N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36"

ERP_US = 5.0          # 미국 ERP 가정 (사용자 지정)
KR_TOP_N = 30
US_TOP_N = 30

NOTES = []
CACHE_DIR = os.path.join(HERE, ".cache")
USE_CACHE = True


def log(msg):
    print(msg, flush=True)


# ---------------------------------------------------------------- HTTP
def _cache_path(url):
    h = hashlib.sha1(url.encode()).hexdigest()[:16]
    return os.path.join(CACHE_DIR, h + ".cache")


def http_get(url, referer=None, ua=UA_DESKTOP, timeout=40, tries=3, cache=True):
    """URL 본문을 문자열로 반환. cache=True면 30분 이내 캐시를 재사용."""
    if cache and USE_CACHE:
        p = _cache_path(url)
        if os.path.exists(p) and time.time() - os.path.getmtime(p) < 1800:
            with open(p, encoding="utf-8") as f:
                return f.read()
    headers = {
        "User-Agent": ua,
        "Accept": "*/*",
        "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
    }
    if referer:
        headers["Referer"] = referer
    last = None
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=timeout) as r:
                body = r.read().decode("utf-8", "ignore")
            if cache and USE_CACHE:
                os.makedirs(CACHE_DIR, exist_ok=True)
                with open(_cache_path(url), "w", encoding="utf-8") as f:
                    f.write(body)
            return body
        except Exception as e:  # noqa: BLE001
            last = e
            time.sleep(0.8 * (i + 1))
    raise RuntimeError(f"GET 실패 {url} :: {last}")


def http_json(url, referer=None, ua=UA_DESKTOP, timeout=40, tries=3):
    body = http_get(url, referer=referer, ua=ua, timeout=timeout, tries=tries)
    return json.loads(body)


# ---------------------------------------------------------------- parsing helpers
def strip_tags(s):
    s = re.sub(r"<[^>]+>", " ", s)
    s = html.unescape(s)
    return re.sub(r"[\s\u00a0]+", " ", s).strip()


def table_rows(table_html):
    out = []
    for tr in re.findall(r"<tr[^>]*>(.*?)</tr>", table_html, re.S):
        cells = [strip_tags(c) for c in re.findall(r"<t[hd][^>]*>(.*?)</t[hd]>", tr, re.S)]
        if cells:
            out.append(cells)
    return out


def get_table(h, tid):
    m = re.search(r'<table[^>]*id="%s".*?</table>' % re.escape(tid), h, re.S)
    return m.group(0) if m else None


def num(s):
    if s is None:
        return None
    s = (str(s).replace(",", "").replace("&nbsp;", "").replace("$", "")
         .replace("%", "").replace("배", "").replace("원", "").replace("주", "").strip())
    if s in ("", "-", "--", "N/A", "N／A"):
        return None
    try:
        return float(s)
    except ValueError:
        return None


# ---------------------------------------------------------------- 1) 할인율
def fetch_ke_kr():
    """KIS채권평가 등급별금리스프레드 → 무보증회사채 BBB- 5년 (%)"""
    url = "https://www.kisrating.com/ratingsStatistics/statics_spread.do"
    h = http_get(url)
    asof = None
    m = re.search(r'id="startDt"[^>]*value="([\d.]+)"', h)
    if m:
        asof = m.group(1)
    block = re.search(r'<div id="con_tab1".*?</div>\s*</div>\s*</div>', h, re.S)
    tk = get_table(h, "con_tab1") or ""
    # con_tab1은 div id 이므로 표를 직접 찾는다 (수익률 표 = 단위:%)
    m2 = re.search(r"\[단위:%\](.*?)\[단위:bp\]", h, re.S)
    seg = m2.group(1) if m2 else h
    heads, bbb = None, None
    for tr in re.findall(r"<tr[^>]*>(.*?)</tr>", seg, re.S):
        cells = [strip_tags(c) for c in re.findall(r"<t[hd][^>]*>(.*?)</t[hd]>", tr, re.S)]
        if not cells:
            continue
        if heads is None and any(c.startswith("1년") or c.startswith("5년") for c in cells):
            heads = cells
            continue
        if heads and cells[0].startswith("BBB-"):
            bbb = cells
            break
    if not heads or not bbb:
        raise RuntimeError("KIS 표 파싱 실패")
    # heads: ['구분','3월','6월','9월','1년','1년6월','2년','3년','5년']
    idx5 = heads.index("5년") if "5년" in heads else len(heads) - 1
    val5 = num(bbb[idx5]) if idx5 < len(bbb) else None
    idx3 = heads.index("3년") if "3년" in heads else None
    val3 = num(bbb[idx3]) if idx3 is not None and idx3 < len(bbb) else None
    # 같은 표의 국고채 5년
    treasury5 = None
    for tr in re.findall(r"<tr[^>]*>(.*?)</tr>", seg, re.S):
        cells = [strip_tags(c) for c in re.findall(r"<t[hd][^>]*>(.*?)</t[hd]>", tr, re.S)]
        if cells and cells[0].startswith("국고채") and idx5 < len(cells):
            treasury5 = num(cells[idx5])
            break
    if val5 is None:
        raise RuntimeError("KIS BBB- 5년 값 없음")
    return {
        "market": "KR",
        "label": "KR BBB- 5Y",
        "valuePct": round(val5, 2),
        "detail": "무보증회사채 BBB- 5년",
        "bbb3yPct": val3,
        "treasury5yPct": treasury5,
        "asOf": asof,
        "source": "KIS채권평가 등급별금리스프레드 (kisrating.com)",
        "url": url,
    }


def fetch_ke_us():
    """미국 10년물(^TNX) + ERP 5.0%p"""
    url = "https://query1.finance.yahoo.com/v8/finance/chart/%5ETNX?interval=1d&range=5d"
    d = http_json(url)
    meta = d["chart"]["result"][0]["meta"]
    ust = float(meta["regularMarketPrice"])
    ts = meta.get("regularMarketTime")
    asof = dt.datetime.fromtimestamp(ts, dt.timezone.utc).astimezone(
        dt.timezone(dt.timedelta(hours=9))).strftime("%Y-%m-%d %H:%M KST") if ts else None
    return {
        "market": "US",
        "label": "US Ke",
        "valuePct": round(ust + ERP_US, 2),
        "ust10yPct": round(ust, 2),
        "erpPct": ERP_US,
        "asOf": asof,
        "source": "Yahoo Finance ^TNX(미 10년물) + ERP 5.0%p 가정",
        "url": url,
    }


# ---------------------------------------------------------------- 2) 지수
def fetch_indices():
    out = []
    for code, name in [("KOSPI", "코스피"), ("KOSDAQ", "코스닥")]:
        try:
            d = http_json(f"https://m.stock.naver.com/api/index/{code}/basic",
                          referer="https://m.stock.naver.com/")
            out.append({
                "id": code, "name": name,
                "value": num(d.get("closePrice")),
                "changePct": num(d.get("fluctuationsRatio")),
                "asOf": d.get("localTradedAt"),
                "source": "네이버 금융",
            })
        except Exception as e:  # noqa: BLE001
            NOTES.append(f"지수 {code} 수집 실패: {e}")
    for sym, code, name in [("%5EGSPC", "SPX", "S&P 500"), ("%5ENDX", "NDX", "NASDAQ 100"),
                            ("%5ESOX", "SOX", "SOX(반도체)")]:
        try:
            d = http_json(f"https://query1.finance.yahoo.com/v8/finance/chart/{sym}?interval=1d&range=2d")
            meta = d["chart"]["result"][0]["meta"]
            out.append({
                "id": code, "name": name,
                "value": float(meta["regularMarketPrice"]),
                "changePct": float(meta.get("regularMarketChangePercent") or 0),
                "asOf": dt.datetime.fromtimestamp(meta["regularMarketTime"], dt.timezone.utc)
                        .astimezone(dt.timezone(dt.timedelta(hours=-5))).strftime("%Y-%m-%d %H:%M ET"),
                "source": "Yahoo Finance",
            })
        except Exception as e:  # noqa: BLE001
            NOTES.append(f"지수 {name} 수집 실패: {e}")
    return out


# ---------------------------------------------------------------- 3) 한국 종목
def naver_all_listed():
    items = []
    for market in ("KOSPI", "KOSDAQ"):
        page = 1
        while True:
            url = (f"https://m.stock.naver.com/api/stocks/marketValue/{market}"
                   f"?page={page}&pageSize=100")
            d = http_json(url, referer="https://m.stock.naver.com/")
            stocks = d.get("stocks") or []
            if not stocks:
                break
            for s in stocks:
                items.append({
                    "market": market,
                    "code": s.get("itemCode"),
                    "name": s.get("stockName"),
                    "price": num(s.get("closePrice")),
                    "changePct": num(s.get("fluctuationsRatio")),
                    "marketCapEok": num(s.get("marketValue")),  # 억원
                    "endType": s.get("stockEndType"),
                    "tradedAt": s.get("localTradedAt"),
                })
            if len(stocks) < 100 or page >= 40:
                break
            page += 1
    return items


def kr_top(n=KR_TOP_N):
    items = naver_all_listed()
    commons = [x for x in items
               if x["endType"] == "stock" and x["code"] and x["code"][-1] == "0"
               and x["marketCapEok"]]
    commons.sort(key=lambda x: x["marketCapEok"], reverse=True)
    top = commons[:n]
    # 우선주(같은 앞 5자리, 다른 종목코드) 시총 합
    by_prefix = {}
    for it in items:
        if not it["code"] or it["endType"] != "stock":
            continue
        by_prefix.setdefault(it["code"][:5], []).append(it)
    for t in top:
        pref = 0.0
        precs = []
        for it in by_prefix.get(t["code"][:5], []):
            if it["code"] != t["code"] and it["code"][-1] != "0":
                pref += (it["marketCapEok"] or 0)
                precs.append({"code": it["code"], "name": it["name"], "mcapEok": it["marketCapEok"]})
        t["prefMarketCapEok"] = pref
        t["prefList"] = precs
    return top


def wise_page(code):
    url = f"https://comp.wisereport.co.kr/company/c1010001.aspx?cmp_cd={code}"
    h = http_get(url)
    enc = re.search(r"encparam:\s*'([^']+)'", h)
    enc = enc.group(1) if enc else ""
    shares = None
    for r in table_rows(get_table(h, "cTB11") or ""):
        if r and "발행주식수" in r[0] and len(r) > 1:
            m = re.search(r"([\d,]+)\s*주", r[1])
            if m:
                shares = int(m.group(1).replace(",", ""))
    treasury = 0
    treasury_txt = None
    for r in table_rows(get_table(h, "cTB13") or ""):
        if r and ("자사주" in r[0] or "자기주식" in r[0]):
            treasury = int((r[1] or "0").replace(",", "").replace("-", "0") or 0) if len(r) > 1 else 0
            treasury_txt = r[0]
    stock_name = None
    m = re.search(r'<span class="title">([^<]+)</span>', h)
    if m:
        stock_name = strip_tags(m.group(1))
    return {"shares": shares, "treasury": treasury, "enc": enc, "name": stock_name}


def wise_fin(code, enc, freq):
    url = ("https://comp.wisereport.co.kr/company/ajax/cF1001.aspx?"
           f"cmp_cd={code}&fin_typ=0&freq_typ={freq}&extY=1&extQ=1"
           f"&encparam={urllib.parse.quote(enc)}&id=VGVTbkwxZ2")
    h = http_get(url, referer=f"https://comp.wisereport.co.kr/company/c1010001.aspx?cmp_cd={code}")
    headers, data = None, {}
    for r in table_rows(h):
        if headers is None and any(re.match(r"^\d{4}/\d{2}", c) for c in r):
            headers = r
            continue
        if headers and r and not all(c in ("4388", "5,844", "5844") for c in r):
            data[r[0]] = r[1:]
    return headers or [], data


def _col(date_label, year, est):
    """헤더 '2026/12 (IFRS연결)' → (연, 월, 추정여부)"""
    m = re.match(r"^(\d{4})/(\d{2})", date_label or "")
    if not m:
        return None
    return (int(m.group(1)), int(m.group(2)), date_label)


def pick_roe_columns(headers, this_year):
    cols = []
    for i, hh in enumerate(headers):
        p = _col(hh, None, None)
        if p:
            cols.append((i, p[0], p[1], "(E)" in hh))
    if not cols:
        return {}
    actual = [c for c in cols if not c[3]]
    est = [c for c in cols if c[3]]

    def find(lst, year):
        return next((c for c in lst if c[1] == year), None)

    y1 = find(actual, this_year - 1) or (actual[-1] if actual else None)
    y0 = find(est, this_year) or (est[0] if est else None)
    yn = find(est, this_year + 1) or (est[1] if len(est) > 1 else None)
    out = {}
    if y1: out["y1"] = y1[0]
    if y0: out["y0"] = y0[0]
    if yn: out["yn"] = yn[0]
    out["labels"] = {
        "y1": headers[y1[0]] if y1 else None,
        "y0": headers[y0[0]] if y0 else None,
        "yn": headers[yn[0]] if yn else None,
    }
    return out


def latest_actual_equity(headers, data):
    """분기표에서 값이 있는 가장 최근 실제(비추정) 지배주주자본."""
    series = data.get("자본총계(지배)") or []
    best = None
    for i, hh in enumerate(headers):
        if i >= len(series):
            continue
        v = num(series[i])
        if v is None or "(E)" in hh:
            continue
        best = (hh, v)
    return best


def kr_detail(item, this_year):
    code = item["code"]
    out = dict(item)
    out["market"] = "KR"
    out["ticker"] = code
    out["currency"] = "KRW"
    warnings = []
    # 시세·밸류에이션 배수
    per = pbr = eps = bps = None
    try:
        d = http_json(f"https://m.stock.naver.com/api/stock/{code}/integration",
                      referer="https://m.stock.naver.com/")
        for t in d.get("totalInfos", []):
            if t.get("code") == "per":
                per = num(t.get("value"))
            elif t.get("code") == "pbr":
                pbr = num(t.get("value"))
            elif t.get("code") == "eps":
                eps = num(t.get("value"))
            elif t.get("code") == "bps":
                bps = num(t.get("value"))
    except Exception as e:  # noqa: BLE001
        warnings.append(f"네이버 지표 실패: {e}")
    out["per"] = per
    out["pbr"] = pbr
    # 재무
    try:
        w = wise_page(code)
        out["shares"] = w["shares"]
        out["treasury"] = w["treasury"]
        yh, yd = wise_fin(code, w["enc"], "Y")
        qh, qd = wise_fin(code, w["enc"], "Q")
        sel = pick_roe_columns(yh, this_year)
        roe = {}
        for k in ("y1", "y0", "yn"):
            i = sel.get(k)
            roe[k] = num((yd.get("ROE(%)") or [])[i]) if i is not None and i < len(yd.get("ROE(%)") or []) else None
        out["roe"] = roe
        out["roeLabels"] = {
            "y1": (sel.get("labels", {}).get("y1") or "").replace(" (IFRS연결)", ""),
            "y0": (sel.get("labels", {}).get("y0") or "").replace(" (IFRS연결)", ""),
            "yn": (sel.get("labels", {}).get("yn") or "").replace(" (IFRS연결)", ""),
        }
        out["roeSource"] = "컨센서스(WISEfn)"
        if roe.get("y0") is None:
            out["roeSource"] = "TTM/실적(WISEfn)"
        eq = latest_actual_equity(qh, qd)
        if eq is None:
            # 연간표 마지막 실제값
            series = yd.get("자본총계(지배)") or []
            for i in range(len(series) - 1, -1, -1):
                v = num(series[i])
                if v is not None and i < len(yh) and "(E)" not in yh[i]:
                    eq = (yh[i], v)
                    break
        if eq is None and bps and out.get("shares"):
            eqv = bps * out["shares"] / 1e8
            eq = ("BPS×주식수", eqv)
            warnings.append("지배주주자본을 공시값 대신 BPS×주식수로 추정")
        if eq:
            out["equityEok"] = eq[1]
            out["equityAsOf"] = re.sub(r"\s*\(.*\)$", "", eq[0])
        else:
            out["equityEok"] = None
            warnings.append("지배주주자본 없음")
        # 발행주식수 보정: WISEfn 발행주식수(보통주) 없으면 시총/주가
        if not out.get("shares") and out.get("marketCapEok") and out.get("price"):
            out["shares"] = int(out["marketCapEok"] * 1e8 / out["price"])
    except Exception as e:  # noqa: BLE001
        warnings.append(f"WISEfn 실패: {e}")
        out.setdefault("shares", None)
        out.setdefault("treasury", 0)
        out.setdefault("roe", {})
        out.setdefault("equityEok", None)
        if bps and out.get("shares"):
            out["equityEok"] = bps * out["shares"] / 1e8
    out["warnings"] = warnings
    return out


# ---------------------------------------------------------------- 4) 미국 종목
US_EXCLUDE_NAME = re.compile(
    r"(American Deposit|Depositary|\bADR\b|Warrant|Unit|Right|Preferred|Notes|ETF|Fund"
    r"|\bN\.V\.|\bplc\b|Taiwan Semiconductor)", re.I)
# 미국 기업이 아닌 외국법인(20-F 제출, 현지통화 재무제표)은 달러 재무제표와 섞이지 않도록 제외
SYMBOL_FIX = {"BRK/A": "BRK.B"}

_SEC_TICKERS = None
_FX_CACHE = {}


def us_top(n=US_TOP_N):
    url = ("https://api.nasdaq.com/api/screener/stocks?tableonly=true"
           "&limit=10000&offset=0&download=true")
    d = http_json(url, referer="https://www.nasdaq.com/market-activity/stocks/screener")
    rows = d["data"]["rows"]
    clean = []
    for r in rows:
        mc = num(r.get("marketCap"))
        if not mc:
            continue
        name = r.get("name") or ""
        sym = r.get("symbol") or ""
        if US_EXCLUDE_NAME.search(name):
            continue
        if sym not in SYMBOL_FIX and "/" in sym:
            continue
        clean.append({
            "symbol": SYMBOL_FIX.get(sym, sym),
            "name": re.sub(r"\s+(Common Stock|Class [A-Z].*|Capital Stock.*)$", "", name).strip(),
            "marketCap": mc,
            "price": num(r.get("lastsale")),
            "changePct": num(r.get("pctchange")),
            "sector": r.get("sector"),
        })
    clean.sort(key=lambda x: x["marketCap"], reverse=True)
    seen = set()
    out = []
    for c in clean:
        key = re.sub(r"[^a-z]", "", c["name"].split()[0].lower())
        if key in seen:
            # 같은 회사의 다른 클래스(예: BRK/A vs BRK/B) → 시총이 큰 쪽 유지
            continue
        seen.add(key)
        out.append(c)
        if len(out) >= n:
            break
    return out



def fy_label(date_str):
    """'9/26/2026' 또는 '2026-09-30' → '2026.09'"""
    if not date_str:
        return ""
    m = re.match(r"^(\d{1,2})/(\d{1,2})/(\d{4})$", date_str)
    if m:
        return f"{m.group(3)}.{int(m.group(1)):02d}"
    m = re.match(r"^(\d{4})-(\d{2})", date_str)
    if m:
        return f"{m.group(1)}.{m.group(2)}"
    return date_str


def _rows_to_map(table):
    mmp = {}
    heads = table.get("headers", {})
    for r in table.get("rows", []):
        mmp[r.get("value1")] = [r.get(f"value{i}") for i in range(2, 6)]
    return mmp, heads


def sec_cik_map():
    global _SEC_TICKERS
    if _SEC_TICKERS is None:
        body = http_get("https://www.sec.gov/files/company_tickers.json",
                        ua="valuation-lab/1.0 (research script)")
        raw = json.loads(body)
        _SEC_TICKERS = {v["ticker"].upper(): str(v["cik_str"]).zfill(10) for v in raw.values()}
    return _SEC_TICKERS


def sec_concept(cik, tax, tag):
    url = f"https://data.sec.gov/api/xbrl/companyconcept/CIK{cik}/{tax}/{tag}.json"
    try:
        return http_json(url, ua="valuation-lab/1.0 (research script)")
    except Exception:  # noqa: BLE001
        return None


def sec_latest(sym, tags, annual=False):
    """SEC XBRL에서 (값, 기준일, 통화) 반환. annual=True면 1년치 손익만."""
    cik = sec_cik_map().get(sym.upper()) or sec_cik_map().get(sym.upper().replace(".", "-"))
    if not cik:
        return None
    for tax, tag in tags:
        d = sec_concept(cik, tax, tag)
        if not d:
            continue
        for unit, arr in (d.get("units") or {}).items():
            rows = [e for e in arr if e.get("val") is not None and e.get("end")]
            if annual:
                year_rows, q_rows = [], []
                for e in rows:
                    if not e.get("start"):
                        continue
                    try:
                        d0 = dt.date.fromisoformat(e["start"])
                        d1 = dt.date.fromisoformat(e["end"])
                    except ValueError:
                        continue
                    days = (d1 - d0).days
                    if 300 <= days <= 430:
                        year_rows.append(e)
                    elif 80 <= days <= 100:
                        q_rows.append(e)
                if year_rows:
                    rows = year_rows
                elif len(q_rows) >= 4:
                    # 연간 공시가 없으면 최근 4개 분기 합 = TTM
                    q_rows.sort(key=lambda e: (e["end"], e.get("filed", "")))
                    last4 = q_rows[-4:]
                    return {"value": float(sum(float(x["val"]) for x in last4)),
                            "asOf": last4[-1]["end"], "unit": unit,
                            "form": "TTM(4분기 합)", "tag": f"{tax}:{tag}"}
                else:
                    continue
            if not rows:
                continue
            rows.sort(key=lambda e: (e["end"], e.get("filed", "")))
            last = rows[-1]
            return {"value": float(last["val"]), "asOf": last["end"], "unit": unit,
                    "form": last.get("form"), "tag": f"{tax}:{tag}"}
    return None


def fx_to_usd(ccy):
    """통화 → USD 환율(1단위당 USD)."""
    if not ccy or ccy.upper() == "USD":
        return 1.0
    c = ccy.upper()
    if c in _FX_CACHE:
        return _FX_CACHE[c]
    rate = None
    try:
        if c == "EUR":
            d = http_json("https://query1.finance.yahoo.com/v8/finance/chart/EURUSD%3DX?interval=1d&range=2d")
            rate = float(d["chart"]["result"][0]["meta"]["regularMarketPrice"])  # USD per EUR
        elif c in ("GBP",):
            d = http_json("https://query1.finance.yahoo.com/v8/finance/chart/GBPUSD%3DX?interval=1d&range=2d")
            rate = float(d["chart"]["result"][0]["meta"]["regularMarketPrice"])
        else:
            # USD/XXX (예: TWD=X = 1 USD당 TWD)
            d = http_json(f"https://query1.finance.yahoo.com/v8/finance/chart/{c}%3DX?interval=1d&range=2d")
            per_usd = float(d["chart"]["result"][0]["meta"]["regularMarketPrice"])
            rate = 1.0 / per_usd if per_usd else None
    except Exception:  # noqa: BLE001
        rate = None
    _FX_CACHE[c] = rate
    return rate


def us_detail(item):
    sym = item["symbol"]
    out = {
        "market": "US", "ticker": sym, "name": item["name"], "currency": "USD",
        "marketCap": item["marketCap"], "price": item["price"], "changePct": item["changePct"],
        "sector": item.get("sector"), "warnings": [], "equity": None, "equityAsOf": None,
        "prefMarketCap": 0, "treasury": 0, "roe": {"y0": None, "yn": None, "y1": None},
        "roeLabels": {}, "dataMissing": False,
    }
    w = out["warnings"]
    price = out["price"]
    try:
        info = http_json(f"https://api.nasdaq.com/api/quote/{sym}/info?assetclass=stocks",
                         referer=f"https://www.nasdaq.com/market-activity/stocks/{sym.lower()}")
        pd = info["data"]["primaryData"]
        price = num(pd.get("lastSalePrice")) or price
        out["price"] = price
        pct = str(pd.get("percentageChange", "")).replace("+", "").replace("%", "")
        out["changePct"] = num(pct)
        out["quoteTime"] = pd.get("lastTradeTimestamp")
    except Exception as e:  # noqa: BLE001
        w.append(f"시세 실패: {e}")
    shares = out["marketCap"] / price if price else None
    out["shares"] = int(round(shares)) if shares else None

    # ---- 자기자본 : 나스닥 분기 재무상태표 → 없으면 SEC XBRL
    eq_map = []
    try:
        bs = http_json(f"https://api.nasdaq.com/api/company/{sym}/financials?frequency=2",
                       referer=f"https://www.nasdaq.com/market-activity/stocks/{sym.lower()}/financials")
        bmap, bheads = _rows_to_map(bs["data"]["balanceSheetTable"])
        eq_row = bmap.get("Total Equity") or bmap.get("Stockholders Equity") or []
        dates = [bheads.get(f"value{i}") for i in range(2, 6)]
        eq_map = [(d_, num(v)) for d_, v in zip(dates, eq_row) if num(v) is not None]
        if eq_map:
            out["equity"] = eq_map[0][1] * 1000  # 천 달러 → 달러
            out["equityAsOf"] = eq_map[0][0]
            out["equitySource"] = "나스닥 분기 재무상태표"
    except Exception as e:  # noqa: BLE001
        w.append(f"나스닥 재무상태표 없음: {e}")

    # ---- 손익(연간)
    ni_last = ni_date = ni_currency = None
    try:
        is_ = http_json(f"https://api.nasdaq.com/api/company/{sym}/financials?frequency=1",
                        referer=f"https://www.nasdaq.com/market-activity/stocks/{sym.lower()}/financials")
        imap, iheads = _rows_to_map(is_["data"]["incomeStatementTable"])
        ni = [num(v) for v in (imap.get("Net Income Applicable to Common Shareholders")
                               or imap.get("Net Income") or [])]
        dts = [iheads.get(f"value{i}") for i in range(2, 6)]
        pairs = [(d_, v) for d_, v in zip(dts, ni) if v is not None]
        if pairs:
            ni_date, ni_last = pairs[0]
            ni_last = ni_last * 1000  # 나스닥은 천 달러 단위 → 달러
            ni_currency = "USD"
    except Exception as e:  # noqa: BLE001
        w.append(f"나스닥 손익계산서 없음: {e}")

    if out["equity"] is None:
        sec = sec_latest(sym, [("us-gaap", "StockholdersEquity"),
                               ("us-gaap", "StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest"),
                               ("ifrs-full", "EquityAttributableToOwnersOfParent"),
                               ("ifrs-full", "Equity")])
        if sec:
            ccy = {"USD": "USD", "TWD": "TWD", "EUR": "EUR", "GBP": "GBP"}.get(sec["unit"].upper(), sec["unit"])
            rate = fx_to_usd(ccy)
            if rate:
                out["equity"] = sec["value"] * rate
                out["equityAsOf"] = sec["asOf"]
                out["equitySource"] = f"SEC XBRL({sec['form']}, {ccy}→USD 환산)"
                out["equityLocal"] = {"value": sec["value"], "currency": ccy, "fxToUsd": rate}
                w.append(f"나스닥 재무제표 없어 SEC 공시값 사용({sec['asOf']}, {ccy}→USD 환산)")
            else:
                w.append("자기자본 통화 환산 실패")
        if ni_last is None:
            secni = sec_latest(sym, [("us-gaap", "NetIncomeLoss"), ("ifrs-full", "ProfitLoss")], annual=True)
            if secni:
                rate = fx_to_usd(secni["unit"])
                if rate:
                    ni_last = secni["value"] * rate
                    ni_date = secni["asOf"]
                    w.append(f"순이익도 SEC 값 사용({secni['asOf']}, 전액 달러 환산)")

    # 직전 회계연도 ROE
    roe_last = None
    if ni_last is not None and out["equity"]:
        roe_last = ni_last / out["equity"] * 100

    # 컨센서스 EPS → ROE
    try:
        fc = http_json(f"https://api.nasdaq.com/api/analyst/{sym}/earnings-forecast",
                       referer=f"https://www.nasdaq.com/market-activity/stocks/{sym.lower()}/earnings")
        rows = (fc["data"].get("yearlyForecast") or {}).get("rows") or []
        rows = [r for r in rows if r.get("consensusEPSForecast") is not None]
        bps = out["equity"] / out["shares"] if out.get("equity") and out.get("shares") else None
        if bps and rows:
            out["roe"]["y0"] = round(rows[0]["consensusEPSForecast"] / bps * 100, 2)
            out["roeLabels"]["y0"] = rows[0]["fiscalEnd"] + "(E)"
            if len(rows) >= 2:
                out["roe"]["yn"] = round(rows[1]["consensusEPSForecast"] / bps * 100, 2)
                out["roeLabels"]["yn"] = rows[1]["fiscalEnd"] + "(E)"
            out["roeSource"] = "컨센서스 EPS÷BPS(나스닥)"
            out["epsEst"] = [{"fy": r["fiscalEnd"], "eps": r["consensusEPSForecast"]} for r in rows[:3]]
    except Exception as e:  # noqa: BLE001
        w.append(f"EPS 컨센서스 없음: {e}")

    if roe_last is not None:
        out["roe"]["y1"] = round(roe_last, 2)
        out["roeLabels"]["y1"] = fy_label(ni_date) + " 실적"
    if not out.get("roeSource"):
        out["roeSource"] = "TTM(재무제표)"
    if out["roe"].get("y0") is None and roe_last is not None:
        out["roe"]["y0"] = round(roe_last, 2)
        out["roeLabels"]["y0"] = out["roeLabels"].get("y1", "실적")
    if out["roe"].get("yn") is None and roe_last is not None:
        out["roe"]["yn"] = round(roe_last, 2)

    # 배수
    if out.get("shares") and ni_last:
        eps_ttm = ni_last / out["shares"]
        out["per"] = round(price / eps_ttm, 2) if eps_ttm and eps_ttm > 0 else None
    if out.get("equity"):
        out["pbr"] = round(out["marketCap"] / out["equity"], 2)

    if out["equity"] is None:
        out["dataMissing"] = True
        out["equity"] = 0
        w.append("재무데이터 없음(S-RIM 계산 불가)")
    return out


# ---------------------------------------------------------------- 5) 조립
def main():
    global USE_CACHE
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=DEFAULT_OUT)
    ap.add_argument("--no-cache", action="store_true")
    ap.add_argument("--kr", type=int, default=KR_TOP_N)
    ap.add_argument("--us", type=int, default=US_TOP_N)
    ap.add_argument("--workers", type=int, default=6)
    args = ap.parse_args()
    USE_CACHE = not args.no_cache
    t0 = time.time()
    today = dt.date.today()
    this_year = today.year

    log("· 할인율 수집")
    try:
        ke_kr = fetch_ke_kr()
    except Exception as e:  # noqa: BLE001
        NOTES.append(f"KIS 할인율 실패: {e}")
        ke_kr = None
    try:
        ke_us = fetch_ke_us()
    except Exception as e:  # noqa: BLE001
        NOTES.append(f"미국 할인율 실패: {e}")
        ke_us = None
    log(f"  KR Ke {ke_kr and ke_kr['valuePct']}% / US Ke {ke_us and ke_us['valuePct']}%")

    log("· 지수 수집")
    indices = fetch_indices()

    log("· 한국 시총 상위 수집")
    kr_list = kr_top(args.kr)
    log(f"  {len(kr_list)}종목: " + ", ".join(x["name"] for x in kr_list[:5]) + " ...")

    log("· 미국 시총 상위 수집")
    us_list = us_top(args.us)
    log(f"  {len(us_list)}종목: " + ", ".join(x["symbol"] for x in us_list[:5]) + " ...")

    stocks = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as ex:
        futs = {ex.submit(kr_detail, it, this_year): ("KR", it) for it in kr_list}
        futs.update({ex.submit(us_detail, it): ("US", it) for it in us_list})
        for f in concurrent.futures.as_completed(futs):
            kind, it = futs[f]
            try:
                s = f.result()
            except Exception as e:  # noqa: BLE001
                NOTES.append(f"{kind} {it.get('code') or it.get('symbol')} 수집 실패: {e}")
                continue
            s["market"] = kind
            s["ke"] = (ke_kr or {}).get("valuePct") if kind == "KR" else (ke_us or {}).get("valuePct")
            stocks.append(s)
    stocks.sort(key=lambda s: (s["market"] != "KR", -(s.get("marketCapEok") or 0) if s["market"] == "KR" else -(s.get("marketCap") or 0)))

    # 표준화
    for s in stocks:
        if s["market"] == "KR":
            s["marketCap"] = (s.get("marketCapEok") or 0) * 1e8
            s["prefMarketCap"] = (s.get("prefMarketCapEok") or 0) * 1e8
            s["equity"] = (s.get("equityEok") or 0) * 1e8
            s["price"] = s.get("price") or 0
        s.pop("marketCapEok", None)
        s.pop("equityEok", None)
        s.pop("prefMarketCapEok", None)
        s["fiscalYear"] = this_year
        s["hasEstimates"] = bool((s.get("roe") or {}).get("y0"))
        if not s.get("shares"):
            NOTES.append(f"{s['ticker']} 발행주식수 없음")

    payload = {
        "generatedAt": dt.datetime.now(dt.timezone(dt.timedelta(hours=9))).isoformat(timespec="seconds"),
        "asOfDate": today.isoformat(),
        "title": "S-RIM Valuation Lab",
        "rates": {"kr": ke_kr, "us": ke_us},
        "indices": indices,
        "stocks": stocks,
        "counts": {"kr": sum(1 for s in stocks if s["market"] == "KR"),
                   "us": sum(1 for s in stocks if s["market"] == "US")},
        "notes": NOTES,
        "method": {
            "excess": "초과이익 = B0 × (ROE − Ke)",
            "value": "기업가치 = B0 + 초과이익 × [w / (1 + Ke − w)]",
            "common": "기업가치_보통주 = 기업가치 − 우선주 시총",
            "fair": "적정주가 = 기업가치_보통주 ÷ (발행주식수 − 자기주식수)",
            "gap": "Gap% = (적정주가 − 현재가) ÷ 현재가 × 100",
        },
    }
    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=1)
    log(f"· 저장 {args.out} ({os.path.getsize(args.out)/1024:.0f}KB, {time.time()-t0:.0f}s)")
    log(f"· 종목 {payload['counts']}, 지수 {len(indices)}, 경고 {len(NOTES)}")


if __name__ == "__main__":
    main()
