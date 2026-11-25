# hot-trends — 소비·행동·아이디어 레이더 (로컬 시안)

`🔥 매일 아침 실시간 트렌드·핫이슈 브리핑`(08:00)의 모바일 홈 화면.
**로컬 전용 시안** — 사용자 검토·승인 전에는 커밋·푸시하지 않습니다.

## 파일
| 파일 | 역할 |
|---|---|
| `index.html` | 앱 본체. 데이터·렌더러·스타일이 한 파일에 있음 (오프라인 동작) |
| `icon.svg` | 홈스크린 아이콘 원본 (불꽃 + 레이더 링) |
| `icon-180.png` | `apple-touch-icon`용 180×180 PNG |
| `make-icon.py` | `icon.svg` → `icon-180.png` 렌더 스크립트 |

## 08:00 정기 실행에서 갱신하는 곳
`index.html` 안의 `const DATA = { ... }` **한 곳만** 고치면 화면 전체가 바뀝니다.

```
DATA = {
  meta:      { date, asof, mode, version, updated, note }
  keywords:  ["#태그", ...]                     // 히어로 키워드 칩
  summary:   { lead, sub }                      // 한 줄 요약 (lead는 <b> 허용)
  signals:   [{ k, v }, { k, v }, { k, v }]     // 상단 3칸 숫자
  products:  [{ rank, name, price, badges[], line, why, nums[], src{label,url} }]
  behavior:  [{ ico, title, sub, line, bullets[], big{k,v}, src{label,url} }]
  ideas:     [{ from, title, biz, money, life }]
  action:    { title, why, steps[] }
  readRule:  ["...", ...]                       // 소비 탭 접이식 안내
  verify:    { scope[], conflicts[{item,a,b,note}], status[{k,c,v}], sources[{g,links[{l,u}]}] }
}
```

- `badges[].c`는 `b-hot`(빨강) / `b-ok`(확인) / `b-early`(추정) 중 하나.
- `status[].c`도 같은 클래스.
- 링크는 전부 `target="_blank" rel="noopener"`로 렌더됩니다.
- 체크리스트 상태와 테마는 `localStorage`(`ht-check`, `ht-theme`)에 저장됩니다.

## 확인된 QA (Playwright, 390×844)
- 콘솔 오류 0, 페이지 오류 0
- 세 탭 모두 `scrollWidth == clientWidth`(가로 스크롤 없음), 넘치는 요소 0
- 탭 전환·테마 토글·체크리스트 저장/복원·출처 접이식 동작
- 확대 가능: viewport에 `user-scalable=no` 없음
