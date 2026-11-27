# S-RIM Valuation Lab (valuation-lab)

사경인 S-RIM 모델로 한국·미국 시총 상위 30종목의 **적정주가와 Gap%(저평가/고평가)** 를 보는 모바일 웹앱.
사용자의 `[Keynes] Valuation` 구글 시트(Assumptions 탭)와 같은 식을 쓰고, 데이터만 매번 새로 수집한다.

- 앱: `index.html` (단일 파일 · 390px 모바일 · 다크 네이비/골드/민트)
- 데이터: `data/valuation.json` (수집 스크립트가 생성)
- 갱신: `python3 scripts/fetch_valuation_data.py` → `python3 build.py`
- 오프라인: `build.py` 가 `valuation.json` 을 `index.html` 안에 심어 두어 `file://` 로 열어도 동작한다.

## 모델 (시트와 동일)

```
초과이익        = B₀ × (ROE − Ke)
기업가치        = B₀ + 초과이익 × [ w / (1 + Ke − w) ]
기업가치_보통주  = 기업가치 − 우선주 시총
적정주가_보통주  = 기업가치_보통주 ÷ (발행주식수 − 자기주식수)
Gap%           = (적정주가 − 현재가) ÷ 현재가 × 100   ( + 저평가 / − 고평가 )
w = 1.0 / 0.9 / 0.8 / 0.7  (기본 선택 0.8)
```

- `B₀` = **지배주주 자기자본**(최근 분기). 사용 시트의 B0와 같은 값.
- `ROE` = 기본은 **컨센서스 Y(당해 연도 추정)**, 토글로 **3개년 가중평균(1:2:3)** 전환.
- 앱의 상세 화면에서 `Ke`·`ROE` 슬라이더로 즉시 재계산(초기값 복원 버튼).
- 상세 화면의 **「산출 로직 · 실제 대입 과정」** 블록이 위 5단계를 공식 → 실제 수치 대입 → 결과 순서로 보여준다. 선택한 `w`·ROE 기준(컨센서스/3개년 가중평균)·슬라이더 값이 바뀌면 대입식과 결과가 함께 갱신되고, 직접 입력 시뮬레이터 결과에도 같은 블록이 붙는다.
- `ROE ≤ 0`(적자), `B₀ ≤ 0`(자본잠식), `ROE < Ke`(음수 적정가)는 화면에 경고를 띄운다.

## 데이터 출처

| 항목 | 출처 | 비고 |
| --- | --- | --- |
| 할인율 KR | KIS채권평가 [등급별금리스프레드](https://www.kisrating.com/ratingsStatistics/statics_spread.do) 무보증회사채 **BBB- 5년** | 시트 `Assumptions` 탭이 IMPORTXML로 읽던 바로 그 표 |
| 할인율 US | Yahoo Finance `^TNX`(미 10년물) + **ERP 5.0%p** | 2026-11-27: 4.90% + 5.0%p = 9.90% |
| 한국 시세·시총 | 네이버 금융 `m.stock.naver.com` | 보통주 기준, 우선주는 같은 앞 5자리 코드로 합산 |
| 한국 재무·컨센서스 | WISEfn `comp.wisereport.co.kr` | 지배주주자본(분기), 연간 ROE(실적/컨센서스), 발행주식수, 자사주 |
| 미국 시세·재무 | Nasdaq `api.nasdaq.com` | 분기 재무상태표(Total Equity), 연간 손익, 애널리스트 EPS 추정 |
| 미국 보조 | SEC XBRL `data.sec.gov` | 나스닥에 재무제표가 없는 종목(예: XOM)만 |
| 지수 | 네이버 금융(코스피/코스닥), Yahoo Finance(S&P500·NASDAQ100·SOX) | |

### 계산 세부

- **한국**: `B₀` = WISEfn 분기 `자본총계(지배)` 최근 실제 분기. `ROE` = WISEfn 연간 `ROE(%)`(Y-1 실적 / Y·Y+1 컨센서스).
  `발행주식수` = WISEfn `발행주식수(보통주)`, `자기주식` = WISEfn 주요주주 표의 `자사주`.
- **미국**: `B₀` = 나스닥 분기 `Total Equity`. `발행주식수` = 시총 ÷ 주가(자기주식 차감 후 유통 기준).
  `ROE` = 컨센서스 EPS ÷ 현재 BPS(추정 연도), Y-1은 직전 회계연도 순이익 ÷ 연말 자기자본.
  → 미국은 ROE를 **EPS/BPS로 유도**하므로 `roeSource`에 `컨센서스 EPS÷BPS(나스닥)`으로 표기한다.
- 외국법인 ADR(TSM·ASML 등)은 현지통화 재무제표와 달러 시총이 섞여 제외했다. 신규 상장으로 재무 공시가 없는 종목(예: ANT)은 목록에 두되 `S-RIM 계산 불가`로 표시한다.

## 검증

```bash
LD_LIBRARY_PATH=/workspace/work/runtime/lib:/workspace/.qa/sys/usr/lib/x86_64-linux-gnu \
  python3 scripts/_qa.py
```

390×844 기준: 콘솔/페이지 에러 0, 가로 넘침 0px, 한국 30·미국 30 로드, 검색·정렬, 상세 모델·ROE 토글·슬라이더·초기값 복원, 산출 로직 5단계 표시·동적 갱신(w/ROE 토글/슬라이더)·값 일치, 직접 입력 계산, 스크린샷(`downloads/valuation-lab-home.png`, `-detail.png`, `-logic-detail.png`)까지 확인한다.

## 배포 (사용자 승인 후)

```bash
cd repos/daily-radar
git add valuation-lab
git commit -m "valuation-lab: S-RIM 밸류에이션 웹앱"
git push
```

→ `https://teri7425.github.io/daily-radar/valuation-lab/`
