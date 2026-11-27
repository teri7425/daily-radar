# AI 매거진 데스크 (AI Magazine Desk)

매일 오전 9시에 한 호씩 쌓이고, 일요일 오전 9시에 한 주를 결산하는 **일자별 누적 아카이브** 모바일 매거진입니다.
케인리님 검토·승인 전 **로컬 전용** 상태이며, 아직 `git commit`/`push` 하지 않았습니다.

## 파일

| 파일 | 역할 |
| --- | --- |
| `index.html` | 앱 전체 (HTML + CSS + JS 단일 파일). 데이터는 `data/`에서 읽습니다 |
| `data/index.json` | 호수 목록 (최신순). 선택기·이전호/다음호·전체 누적 검색의 기준 |
| `data/YYYY-MM-DD.json` | 그 날의 호 — 표지 메타 + 오늘의 추천 + 카드 12건 |
| `data/weeks.json` | 일요 주간 결산 목록 (최신순). 매주 일요일에 맨 앞에 추가 |
| `manifest.json` | 홈 화면 추가(PWA)용 매니페스트 |
| `icon-*.png` | 홈 화면 아이콘 |

영구 마크다운 백업은 저장소 밖 `briefings/ai-magazine/YYYY-MM-DD.md`에 함께 남깁니다.

## 3개 탭

1. **📰 오늘의 매거진** — 선택한 호의 표지·오늘의 추천·카드. 카테고리 칩(전체/업무/개인·가족/아이디어·앱/트렌드·툴)과 키워드 검색.
   - 상단 **호수 선택기**: `◀ 이전호` · `📅 2026.11.27 (ISSUE 01) ▾` · `다음호 ▶`. 스크롤해도 화면 위에 고정됩니다.
   - **검색 범위 토글**: `이 호만` / `전체 누적`. 전체 누적은 `data/index.json`의 모든 호를 불러와 통합 검색하고, 결과 카드마다 금색 **발행일 배지**(`2026.11.27`)를 붙입니다.
2. **🗓️ 일요 주간 결산** — 이번 주 3개 테마·주간 보도 목록·TOP 3. 주가 2개 이상이면 상단 선택기로 지난 결산도 열람.
3. **⭐ 내 찜 목록** — 찜한 카드 스냅샷 + 메모 + `지안아, 이거 만들어줘` 복사 + **JSON 백업/복원**.

## 데이터 스키마

`data/YYYY-MM-DD.json`

```json
{
  "date": "2026-11-27",
  "issue": "ISSUE 01",
  "weekday": "Friday",
  "weekdayKo": "금요일",
  "headline": "오늘, AI로 무엇을 만들었나",
  "headlineHtml": "오늘, AI로<br><em>무엇을 만들었나</em>",
  "subcopy": "실제로 확인된 <b>12건</b>을 골라 …",
  "highlight": {
    "kicker": "★ 오늘의 추천",
    "title": "「감사 증빙 → 조서 초안」<br>1인용 도구부터",
    "body": "…",
    "steps": ["…", "…", "…"],
    "requestText": "지안아, 이거 만들어줘. …"
  },
  "cards": [
    {
      "id": "audit-snowflake",
      "cat": "업무",
      "date": "2026.11.10",
      "title": "…",
      "source": "Snowflake 블로그",
      "srcShort": "snowflake.com",
      "link": "https://…",
      "summary": "…<b>강조</b>…",
      "apply": "케인리님 적용 포인트…"
    }
  ]
}
```

- `id`는 그 호 안에서 유일하면 됩니다. 찜 키는 `발행일::id`라서 호가 달라도 충돌하지 않습니다.
- `date`(카드)는 **출처 보도일**, `date`(최상위)·`issueDate`는 **이 호의 발행일**입니다.
- `headlineHtml`·`subcopy`·`summary`·`apply`는 `<b>`, `<br>`, `<em>` 정도의 인라인 HTML을 허용합니다.

`data/index.json` — 최신순 배열. 새 호는 **맨 앞에 추가**합니다.

```json
[{ "date": "2026-11-27", "issue": "ISSUE 01", "headline": "오늘, AI로 무엇을 만들었나", "subcopy": "…", "count": 12 }]
```

`data/weeks.json` — 최신순 배열. 한 주 항목은 `week`, `label`, `range`, `collectedAt`, `status`, `heroTitle`, `themes[{t,d}]`, `items[{d,t,s,src,link}]`, `top3[{title,desc,why}]`, `warn`으로 이뤄집니다.

## 저장 방식 (찜 = 영구 보관)

| 키 | 내용 |
| --- | --- |
| `amd_bookmarks_v2` | `{"2026-11-27::audit-snowflake": {savedAt, date, card:{제목·요약·적용포인트·출처·링크·카테고리·보도일}, memo}}` |
| `amd_lastTab_v1` | 마지막으로 본 탭 |
| `amd_migrated_v2` | v1→v2 이전 완료 표시 |
| `amd_lastExport_v1` | 마지막 백업 시각 |

- 찜할 때 카드 내용을 **스냅샷으로 복사**해 저장하므로, 며칠 지나 그 호가 목록에서 밀려나도 찜 목록은 그대로 남습니다.
- 예전 형식(`amd_bookmarks_v1`: `{id: true}`, `amd_memos_v1`: `{id: "메모"}`)은 첫 실행 때 자동으로 v2 스냅샷+메모로 옮깁니다.
- `📤 찜/메모 백업(JSON)` → `ai-magazine-bookmarks-YYYYMMDD.json` 다운로드.
- `📥 백업 불러오기` → 파일을 골라 **병합**(같은 카드는 백업 내용으로 갱신, 나머지 찜은 유지). 예전 v1 형식 파일도 이때 함께 읽습니다.

## 로컬에서 보기

`data/`를 `fetch`로 읽기 때문에 `index.html`을 파일로 직접 열면(=`file://`) 데이터를 불러오지 못합니다. 아래처럼 폴더를 HTTP로 열어 주세요.

```bash
cd repos/daily-radar/ai-magazine && python3 -m http.server 8791
# http://127.0.0.1:8791/index.html
```

배포 주소(`https://teri7425.github.io/daily-radar/ai-magazine/`)에서는 그대로 동작합니다.

## 콘텐츠 출처 원칙

- 2025.11 ~ 2026.11 공개 글·게시물 중 원문을 직접 열어 확인한 것만 수록했습니다.
- 인스타그램 카드는 해당 계정의 실제 게시 내용을 요약했고, 계정 링크는 로그인 없이 열리지 않을 수 있습니다.
- 요약은 원문의 주장이며, 수치는 원문 표기를 그대로 옮겼습니다.

## 검증

`Playwright`(Chromium, 390×844, DPR 2)로 로컬 HTTP 서버에서 **81/81 PASS**.
콘솔/페이지 에러 0, 가로 넘침 0px(320·360·390·414·430), `data/index.json`·`data/2026-11-27.json`·`data/weeks.json` 200 로드, 호수 선택기(단일 호 비활성 / 2개 호 이전·다음 이동), `이 호만 / 전체 누적` 검색과 발행일 배지, 찜 스냅샷·새로고침 유지·메모, JSON 내보내기(다운로드 파일 검사)·불러오기 복원·깨진 파일 처리, v1 자동 이전, 주간 결산·주 선택기까지 확인했습니다.
검증 스크립트: `handoffs/🗂️-ai-매거진-일자별-아카이브-업그레이드/verify.py`

## 다음 단계 (미실행)

- 매일 09:00 갱신·일요일 09:00 결산은 `scheduled-actions/🤖-매일-아침-AI-매거진-데스크-갱신/`이 이 구조(`data/YYYY-MM-DD.json` 추가 → `data/index.json` 맨 앞에 추가 → 일요일이면 `data/weeks.json` 추가 → `briefings/ai-magazine/YYYY-MM-DD.md` 백업)로 실행합니다.
- 케인리님 검토 후 `git add ai-magazine && git commit`, `git push`로 배포하면 됩니다.
