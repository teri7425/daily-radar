# 유창한 영어회화 1 · 목차 훈련 (로컬 시안)

《유창한 영어회화를 꼭 원하는 분 1》(강성구) 사진 36장을 판독해 만든 **모바일 우선 학습 웹앱**입니다.
외부 요청 없이 `index.html`을 그대로 열면 동작합니다(`file://` 가능).

## 구성
- `index.html` — 화면 뼈대
- `assets/styles.css` — 390×844 기준 모바일 스타일
- `assets/app.js` — 목차·3가지 훈련 모드·음성·로컬 저장
- `assets/data/parts.js` — 전체 목차와 문장 데이터 (PART 1~6, 107장, 1,107문장)
- `assets/data/formulas.js` — ① 공식 대입 데이터 (나머지 94개 장, 471세트)

## 데이터 표기
- 📖 **교재 원문** — 사진으로 확인한 실제 본문(PART 1 제1~19장, PART 2 제1~4장, p.14~79)
- ✨ **교재 방식 구성** — 목차 제목에 책의 훈련 공식([ ] you …? → 통역 → Yes/No 완전문장)을 적용해 새로 구성

## 훈련 모드
1. **공식 대입** — [ ] you …? 의 조동사를 바꿔 말하기 (**전체 107개 장**, 567세트)
   - 일반동사: Do·Did·Will·Can·want to·have to·used to·intend to·plan to·would like to
   - be동사: Are you / Were you / Will you be / Have you been (형용사·전치사 장)
   - 완료·진행·수동: Have you p.p / Are you -ing / Is it p.p
   - 의문사: What·Where·When·Why·How·Who·Which + [ ] you …? (답 문장까지 한 벌)
   - 부정·부가 의문문: Don't you …? / …, aren't you?
2. **통역 · 티키타카** — 우리말 보고 영어로 말하기 → 영어 질문 듣기 → Yes/No 완전문장으로 답하기
3. **연속 코스** — 한→영 / 영→Yes→No / 영어만, 반복 1·2·3·5회

모드 탭 아래 **공통 음성 바**에서 4개국 억양(🇺🇸 미국 · 🇬🇧 영국 · 🇦🇺 호주 · 🇮🇳 인도)과 배속(0.75·0.9·1·1.15x)을 ①·②·③ 어느 모드에서든 바로 바꿉니다.
선택은 `localStorage`에 저장되어 모든 모드의 영어 재생(질문·Yes/No·따라 말하기·코스)에 적용되고, `🔊 우리말 듣기`는 항상 한국어(ko-KR)로 재생됩니다.

## 저장
완료 체크·즐겨찾기·설정은 브라우저 `localStorage`(`fe1.progress`, `fe1.settings`, `fe1.last`)에만 저장됩니다. 서버로 보내지 않습니다.

## 실행
```sh
# 방법 1: 파일 열기
open index.html

# 방법 2: 로컬 서버
python3 -m http.server 8000   # → http://localhost:8000
```
