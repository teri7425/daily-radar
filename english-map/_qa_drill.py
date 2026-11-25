import asyncio, json, os, re, sys
from playwright.async_api import async_playwright

URL = "file:///workspace/repos/daily-radar/english-map/index.html"
OUT = "/workspace/downloads"
results = []
shots = []


def rec(name, ok, detail=""):
    results.append((name, bool(ok), detail))
    print(("PASS " if ok else "FAIL ") + name + ("" if ok else " | " + str(detail)))


MOCK_TTS = """
window.__spoken = [];
window.SpeechSynthesisUtterance = function (text) {
  this.text = text; this.lang = ""; this.rate = 1; this.pitch = 1; this.volume = 1;
  this.onend = null; this.onerror = null;
};
Object.defineProperty(window, "speechSynthesis", {
  configurable: true,
  value: {
    getVoices: function () { return [{ name: "Google US English", lang: "en-US" }]; },
    speak: function (u) {
      window.__spoken.push({ text: u.text, rate: u.rate, lang: u.lang });
      setTimeout(function () { if (u.onend) u.onend(); }, 4);
    },
    cancel: function () {}, addEventListener: function () {}, onvoiceschanged: null
  }
});
"""


async def full_shot(page, path, out_list):
    """sticky 헤더/탭바는 full-page 캡처에서 겹치므로 잠깐 static으로 바꿔 찍는다."""
    await page.evaluate("() => { const h=document.querySelector('.hdr'); if(h){ h.dataset.pos=h.style.position; h.style.position='static'; } const t=document.querySelector('.tabbar'); if(t){ t.dataset.pos=t.style.position; t.style.position='static'; document.body.style.paddingBottom='0'; } window.scrollTo(0,0); }")
    await page.wait_for_timeout(150)
    await page.screenshot(path=path, full_page=True)
    await page.evaluate("() => { const h=document.querySelector('.hdr'); if(h){ h.style.position=h.dataset.pos||''; } const t=document.querySelector('.tabbar'); if(t){ t.style.position=t.dataset.pos||''; document.body.style.paddingBottom=''; } }")
    out_list.append(path)


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(args=["--no-sandbox"])
        ctx = await browser.new_context(viewport={"width": 390, "height": 844},
                                        device_scale_factor=2, is_mobile=True, has_touch=True,
                                        locale="ko-KR", timezone_id="Asia/Seoul")
        await ctx.add_init_script(MOCK_TTS)
        page = await ctx.new_page()
        errors, console_err = [], []
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.on("console", lambda m: console_err.append(m.text) if m.type == "error" else None)

        await page.goto(URL, wait_until="load")
        await page.wait_for_timeout(500)
        rec("페이지 로드 · JS 런타임 에러 없음", len(errors) == 0, errors[:3])
        rec("콘솔 error 없음", not console_err, console_err[:3])

        nverbs = await page.evaluate("window.__cms.VERBS.length")
        rec("동사 23개", nverbs == 23, nverbs)

        # ---------- 전수 조사: 23동사 × 3드릴 × 3문장종류 ----------
        combo = await page.evaluate("""() => {
          const D = window.__cms.drill, bad = [];
          const types = ['aff','neg','q'];
          const summaries = {};
          for(let v=0; v<window.__cms.VERBS.length; v++){
            for(const drill of ['subj','tense','modal']){
              for(const type of types){
                D.set({verb:v, drill:drill, type:type});
                const cards = D.cards();
                const key = drill+':'+type;
                const ok = cards.length > 0 && cards.every(c => c && typeof c.en === 'string' && c.en.trim() &&
                                           typeof c.ko === 'string' && c.ko.trim());
                if(!ok) bad.push({verb:window.__cms.VERBS[v].key, drill:drill, type:type,
                                  cards: cards.map(c=>({en:c&&c.en, ko:c&&c.ko}))});
                if(v===0 && !summaries[key]) summaries[key] = cards.map(c=>({en:c.en, ko:c.ko, note:c.note, badge:c.badge,
                                                                             yes:c.ans&&c.ans.yes, no:c.ans&&c.ans.no}));
              }
            }
          }
          return {bad:bad, summaries:summaries};
        }""")
        rec("23동사 × 3드릴 × 3종류 카드 누락 없음", len(combo["bad"]) == 0, combo["bad"][:2])

        # DOM 렌더 텍스트에 undefined/NaN 없음 + 카드 수
        dom = await page.evaluate("""() => {
          const D = window.__cms.drill, bad = [];
          for(let v=0; v<window.__cms.VERBS.length; v++){
            for(const drill of ['subj','tense','modal']){
              for(const type of ['aff','neg','q']){
                D.set({verb:v, drill:drill, type:type});
                const body = document.querySelector('#drillRoot .dbody').innerText;
                if(/undefined|NaN|\\[object|\\bnull\\b/.test(body)) bad.push({v:v, drill:drill, type:type, body:body.slice(0,200)});
                const n = document.querySelectorAll('#drillRoot .dcard').length;
                if(n === 0) bad.push({v:v, drill:drill, type:type, cards:0});
              }
            }
          }
          return bad;
        }""")
        rec("DOM에 undefined/NaN/빈 드릴 없음", len(dom) == 0, dom[:2])

        s = combo["summaries"]
        print("\n--- ① 주어 변경 의문 + 완전 답변 ---")
        for c in s["subj:q"]:
            print(" ", c["en"], "|", c["yes"], "|", c["no"])
        print("\n--- ② 시제 변경 의문 + 완전 답변 ---")
        for c in s["tense:q"]:
            print(" ", c["en"], "|", c["yes"], "|", c["no"])
        print("\n--- ③ 조동사 변경 의문 + 완전 답변 ---")
        for c in s["modal:q"]:
            print(" ", c["en"], "|", c["yes"], "|", c["no"])

        # ---------- 문장 정확성 검증 (make 기준) ----------
        def en(t, i):
            return s[t][i]["en"]

        subj_neg = [en("subj:neg", i) for i in range(6)]
        rec("① 부정: I don't / You don't / We don't / She doesn't / He doesn't / They don't",
            subj_neg == ["I don't make a decision.", "You don't make a decision.",
                         "We don't make a decision.", "She doesn't make a decision.",
                         "He doesn't make a decision.", "They don't make a decision."], subj_neg)
        subj_q = [en("subj:q", i) for i in range(6)]
        rec("① 의문: Do I / Do you / Do we / Does she / Does he / Do they …?",
            subj_q == ["Do I make a decision?", "Do you make a decision?",
                       "Do we make a decision?", "Does she make a decision?",
                       "Does he make a decision?", "Do they make a decision?"], subj_q)

        tense_neg = [en("tense:neg", i) for i in range(5)]
        rec("② 부정 5시제: don't / didn't / 'm not going to / 'm not -ing / haven't p.p.",
            all([
                "don't make" in tense_neg[0],
                "didn't make" in tense_neg[1],
                "am not going to make" in tense_neg[2] and tense_neg[2].endswith("decision."),
                "am not making" in tense_neg[3],
                "haven't made" in tense_neg[4],
            ]), tense_neg)
        tense_q = [en("tense:q", i) for i in range(5)]
        rec("② 의문 5시제: Do I / Did I / Am I going to / Am I -ing / Have I p.p.?",
            all([
                tense_q[0] == "Do I make a decision?",
                tense_q[1] == "Did I make a decision?",
                tense_q[2] == "Am I going to make a decision?",
                tense_q[3] == "Am I making a decision?",
                tense_q[4] == "Have I made a decision?",
            ]), tense_q)

        modal_neg = [en("modal:neg", i) for i in range(5)]
        rec("③ 부정 5조동사: can't / shouldn't / mustn't / might not / wouldn't like to",
            all([
                "can't make" in modal_neg[0],
                "shouldn't make" in modal_neg[1],
                "mustn't make" in modal_neg[2],
                "might not make" in modal_neg[3],
                "wouldn't like to make" in modal_neg[4],
            ]), modal_neg)
        modal_q = [en("modal:q", i) for i in range(5)]
        rec("③ 의문 5조동사: Can I / Should I / Must I / Might I / Would I like to?",
            all([
                modal_q[0] == "Can I make a decision?",
                modal_q[1] == "Should I make a decision?",
                modal_q[2] == "Must I make a decision?",
                modal_q[3] == "Might I make a decision?",
                modal_q[4] == "Would I like to make a decision?",
            ]), modal_q)

        # 완전 문장 답변 — ① 주어 변경 6장
        sq = s["subj:q"]
        rec("① 완전 답변(긍정): Yes, you/we/she/he/they + 동사 …",
            [c["yes"] for c in sq] == [
                "Yes, you make a decision.", "Yes, I make a decision.", "Yes, we make a decision.",
                "Yes, she makes a decision.", "Yes, he makes a decision.", "Yes, they make a decision."],
            [c["yes"] for c in sq])
        rec("① 완전 답변(부정): No, you/we/she/he/they + don't/doesn't …",
            [c["no"] for c in sq] == [
                "No, you don't make a decision.", "No, I don't make a decision.", "No, we don't make a decision.",
                "No, she doesn't make a decision.", "No, he doesn't make a decision.", "No, they don't make a decision."],
            [c["no"] for c in sq])

        # ② 시제 변경 5장 (I → you)
        tq = s["tense:q"]
        rec("② 완전 답변(긍정) 5시제",
            [c["yes"] for c in tq] == [
                "Yes, you make a decision.", "Yes, you made a decision.",
                "Yes, you are going to make a decision.", "Yes, you are making a decision.",
                "Yes, you have made a decision."], [c["yes"] for c in tq])
        rec("② 완전 답변(부정) 5시제",
            [c["no"] for c in tq] == [
                "No, you don't make a decision.", "No, you didn't make a decision.",
                "No, you aren't going to make a decision.", "No, you aren't making a decision.",
                "No, you haven't made a decision."], [c["no"] for c in tq])

        # ③ 조동사 변경 5장 (I → you)
        mq = s["modal:q"]
        rec("③ 완전 답변(긍정) 5조동사",
            [c["yes"] for c in mq] == [
                "Yes, you can make a decision.", "Yes, you should make a decision.",
                "Yes, you must make a decision.", "Yes, you might make a decision.",
                "Yes, you would like to make a decision."], [c["yes"] for c in mq])
        rec("③ 완전 답변(부정) 5조동사",
            [c["no"] for c in mq] == [
                "No, you can't make a decision.", "No, you shouldn't make a decision.",
                "No, you mustn't make a decision.", "No, you might not make a decision.",
                "No, you wouldn't like to make a decision."], [c["no"] for c in mq])

        # 한국어 문장 확인
        rec("한국어 부정 문장 자연스러움",
            all(c["ko"].endswith("요.") and "undefined" not in c["ko"] for c in s["tense:neg"] + s["modal:neg"]),
            [c["ko"] for c in s["tense:neg"] + s["modal:neg"]])
        rec("한국어 의문 문장 물음표",
            all(c["ko"].endswith("?") for c in s["tense:q"] + s["modal:q"] + s["subj:q"]),
            [c["ko"] for c in s["tense:q"]])

        # 3인칭에서 does/doesn't, has, is 확인 (She)
        third = await page.evaluate("""() => {
          const D = window.__cms.drill, out = {};
          const idx = window.__cms.VERBS.findIndex(v=>v.key==='make');
          const key = window.__cms.SUBJECTS.findIndex(s=>s.en==='She');
          D.set({verb:idx, drill:'tense', type:'neg', subj:key});
          out.neg = D.cards().map(c=>c.en);
          D.set({verb:idx, drill:'tense', type:'q', subj:key});
          const cards = D.cards();
          out.q = cards.map(c=>c.en);
          out.yes = cards.map(c=>c.ans.yes);
          out.no = cards.map(c=>c.ans.no);
          return out;
        }""")
        rec("She + 부정: doesn't / didn't / isn't going to / isn't -ing / hasn't",
            all(["doesn't make" in third["neg"][0], "didn't make" in third["neg"][1],
                 "isn't going to make" in third["neg"][2], "isn't making" in third["neg"][3],
                 "hasn't made" in third["neg"][4]]), third["neg"])
        rec("She + 의문: Does she / Did she / Is she going to / Is she -ing / Has she",
            all([third["q"][0].startswith("Does she"), third["q"][1].startswith("Did she"),
                 third["q"][2].startswith("Is she going to"), third["q"][3].startswith("Is she making"),
                 third["q"][4].startswith("Has she")]), third["q"])
        rec("She 의문 → 완전 답변 does/makes/has",
            all([third["yes"][0] == "Yes, she makes a decision.",
                 third["no"][0] == "No, she doesn't make a decision.",
                 third["yes"][1] == "Yes, she made a decision.",
                 third["yes"][2] == "Yes, she is going to make a decision.",
                 third["no"][2] == "No, she isn't going to make a decision.",
                 third["yes"][3] == "Yes, she is making a decision.",
                 third["yes"][4] == "Yes, she has made a decision.",
                 third["no"][4] == "No, she hasn't made a decision."]), third)

        # some / something → any / anything
        some = await page.evaluate("""() => {
          const D = window.__cms.drill, out = {};
          const V = k => window.__cms.VERBS.findIndex(v=>v.key===k);
          const S = n => window.__cms.SUBJECTS.findIndex(s=>s.en===n);
          const pick = o => { D.set(o); return D.cards().map(c=>({en:c.en, yes:c.ans&&c.ans.yes, no:c.ans&&c.ans.no})); };
          out.get = pick({verb:V('get'), drill:'tense', type:'q', subj:S('I')})[0];
          out.say = pick({verb:V('say'), drill:'tense', type:'q', subj:S('I')})[0];
          out.bring = pick({verb:V('bring'), drill:'tense', type:'q', subj:S('I')})[0];
          out.some = pick({verb:V('get'), drill:'tense', type:'q', subj:S('She')})[0];
          return out;
        }""")
        rec("some → any: Do I get any coffee? / Yes, you get some coffee. / No, you don't get any coffee.",
            some["get"]["en"] == "Do I get any coffee?"
            and some["get"]["yes"] == "Yes, you get some coffee."
            and some["get"]["no"] == "No, you don't get any coffee.", some["get"])
        rec("something → anything: Do I say anything nice? / Yes, you say something nice. / No, you don't say anything nice.",
            some["say"]["en"] == "Do I say anything nice?"
            and some["say"]["yes"] == "Yes, you say something nice."
            and some["say"]["no"] == "No, you don't say anything nice.", some["say"])
        rec("3인칭 some → any: Does she get any coffee? / Yes, she gets some coffee. / No, she doesn't get any coffee.",
            some["some"]["en"] == "Does she get any coffee?"
            and some["some"]["yes"] == "Yes, she gets some coffee."
            and some["some"]["no"] == "No, she doesn't get any coffee.", some["some"])

        # me/my → you/your (질문 속 화자를 답변자 기준으로)
        pron = await page.evaluate("""() => {
          const D = window.__cms.drill, out = {};
          const V = k => window.__cms.VERBS.findIndex(v=>v.key===k);
          const S = n => window.__cms.SUBJECTS.findIndex(s=>s.en===n);
          const pick = (o,i) => { D.set(o); return D.cards().filter(c=>c.ans)[i||0]; };
          const h = pick({verb:V('help'), drill:'subj', type:'q'});            /* Do you help me out? */
          out.help = {en:h.en, yes:h.ans.yes, no:h.ans.no};
          const h2 = pick({verb:V('help'), drill:'subj', type:'q'}, 1);
          out.helpShe = {en:h2.en, yes:h2.ans.yes, no:h2.ans.no};
          const t = pick({verb:V('tell'), drill:'subj', type:'q'});
          out.tell = {en:t.en, yes:t.ans.yes, no:t.ans.no};
          const b = pick({verb:V('bring'), drill:'subj', type:'q'});
          out.bring = {en:b.en, yes:b.ans.yes, no:b.ans.no};
          return out;
        }""")
        rec("Do you help me out? → Yes, I help you out. / No, I don't help you out.",
            pron["help"]["en"] == "Do you help me out?"
            and pron["help"]["yes"] == "Yes, I help you out."
            and pron["help"]["no"] == "No, I don't help you out.", pron["help"])
        rec("Do they help me out? → Yes, they help you out.",
            pron["helpShe"]["yes"] == "Yes, she helps you out.", pron["helpShe"])
        rec("Do you tell me the truth? → Yes, I tell you the truth.",
            pron["tell"]["yes"] == "Yes, I tell you the truth."
            and pron["tell"]["no"] == "No, I don't tell you the truth.", pron["tell"])
        rec("Do I bring my umbrella? → Yes, you bring your umbrella.",
            pron["bring"]["yes"] == "Yes, you bring your umbrella."
            and pron["bring"]["no"] == "No, you don't bring your umbrella.", pron["bring"])

        # ---------- 407장 전수 검증 ----------
        allq = await page.evaluate("""() => {
          const D = window.__cms.drill, bad = [], map = {};
          let n = 0;
          const norm = s => String(s).replace(/\\.$/, '');
          for(let v=0; v<window.__cms.VERBS.length; v++){
            for(const drill of ['subj','tense','modal','type','course']){
              D.set({verb:v, drill:drill, type:'q', subj:0});
              D.cards().forEach(function(c){
                if(!(c.tokens && /\?$/.test(c.en||''))) return;
                n++;
                const a = c.ans;
                const p = [];
                if(!a) p.push('no-ans');
                else {
                  if(!/^Yes, /.test(a.yes)) p.push('yes-prefix');
                  if(!/^No, /.test(a.no)) p.push('no-prefix');
                  if(!/\\.$/.test(a.yes)) p.push('yes-period');
                  if(!/\\.$/.test(a.no)) p.push('no-period');
                  if(/\\?/.test(a.yes) || /\\?/.test(a.no)) p.push('answer-has-question-mark');
                  if(/undefined|NaN|\\[object|\\bnull\\b/.test(a.yes + a.no)) p.push('undefined');
                  if(/  /.test(a.yes) || /  /.test(a.no)) p.push('double-space');
                  if(!(/^[a-z]/.test(a.yes.slice(5)) || /^I /.test(a.yes.slice(5)))) p.push('yes-case');
                  if(!(/^[a-z]/.test(a.no.slice(4)) || /^I /.test(a.no.slice(4)))) p.push('no-case');
                  if(/\\bYes, Yes\\b|\\bNo, No\\b/.test(a.yes + a.no)) p.push('double-yes');
                }
                if(p.length) bad.push({v:window.__cms.VERBS[v].key, drill:drill, en:c.en, ans:a, p:p});
              });
            }
          }
          return {n:n, bad:bad.slice(0,10), badCount:bad.length};
        }""")
        rec("의문 카드 407장 전수 · 답변 형식(Yes/No + 마침표) 이상 없음",
            allq["n"] == 407 and allq["badCount"] == 0, {"n": allq["n"], "bad": allq["bad"]})

        # 답변 문장이 질문의 청크·시제를 그대로 쓰는지 (동사·청크 일치)
        chunkchk = await page.evaluate("""() => {
          const D = window.__cms.drill, bad = [], map = {};
          for(let v=0; v<window.__cms.VERBS.length; v++){
            const V = window.__cms.VERBS[v];
            for(const drill of ['subj','tense','modal','type','course']){
              D.set({verb:v, drill:drill, type:'q', subj:0});
              D.cards().forEach(function(c){
                if(!(c.tokens && /\\?$/.test(c.en||''))) return;
                if(!c.ans) return;
                const some = V.objs[0].en.match(/^(some|something)\\b/);
                const anyObj = V.objs[0].en.replace(/^some\\b/, 'any').replace(/^something\\b/, 'anything');
                /* 답변에서는 질문 속 me/my가 you/your로 바뀐다 */
                const turn = s => s.replace(/\\bme\\b/g, 'you').replace(/\\bmy\\b/g, 'your');
                const inQ = c.en.toLowerCase().indexOf(anyObj.toLowerCase()) >= 0;
                const ansObj = turn(anyObj);
                const inYes = some ? c.ans.yes.toLowerCase().indexOf(turn(V.objs[0].en).toLowerCase()) >= 0
                                   : c.ans.yes.toLowerCase().indexOf(ansObj.toLowerCase()) >= 0;
                const inNo = c.ans.no.toLowerCase().indexOf(ansObj.toLowerCase()) >= 0;
                if(!inQ || !inYes || !inNo) bad.push({v:V.key, drill:drill, en:c.en, obj:V.objs[0].en, ans:c.ans, inQ:inQ, inYes:inYes, inNo:inNo});
              });
            }
          }
          return {badCount:bad.length, bad:bad.slice(0,10)};
        }""")
        rec("407장 모두 질문·긍정답변·부정답변에 같은 청크(긍정 some / 부정 any) 포함", chunkchk["badCount"] == 0,
            chunkchk["bad"])

        # ---------- 나머지 드릴 회귀 ----------
        rest = await page.evaluate("""() => {
          const D = window.__cms.drill, out = {};
          const idx = window.__cms.VERBS.findIndex(v=>v.key==='make');
          D.set({verb:idx, drill:'type', type:'aff', subj:0});
          out.type = D.cards().map(c=>c.en);
          D.set({verb:idx, drill:'chunk', type:'aff', subj:0});
          out.chunk = D.cards().map(c=>c.en);
          D.set({verb:idx, drill:'pv', type:'aff', subj:0});
          out.pv = D.cards().map(c=>c.en);
          D.set({verb:idx, drill:'course', type:'aff', subj:0});
          out.course = D.cards().map(c=>c.en).length;
          const counts = [];
          for(let v=0; v<window.__cms.VERBS.length; v++){
            D.set({verb:v, drill:'course'});
            counts.push(D.cards().length);
          }
          out.counts = counts;
          D.set({verb:idx, drill:'type', type:'aff', subj:0});
          return out;
        }""")
        rec("④ 평서·부정·의문 3문장 유지", len(rest["type"]) == 3 and rest["type"][1].startswith("I don't"), rest["type"])
        rec("⑤ 청크 변경 8개 유지", len(rest["chunk"]) == 8, len(rest["chunk"]))
        rec("⑥ 구동사 4개 유지", len(rest["pv"]) == 4, len(rest["pv"]))
        rec("⑦ 코스 make 31장 유지", rest["course"] == 31, rest["course"])
        rec("⑦ 코스 전 동사 18장 이상/구성 유지", all(c >= 18 for c in rest["counts"]) and rest["counts"][0] == 31,
            rest["counts"])

        # ---------- 토글 UI 동작 ----------
        await page.evaluate("window.__cms.switchTab('build')")
        await page.wait_for_timeout(200)
        await page.evaluate("window.__cms.drill.set({verb:0, drill:'tense', type:'aff', subj:0})")
        await page.wait_for_timeout(200)
        rec("토글 3개 표시(주어/시제/조동사 드릴)", await page.locator("#drillRoot .dtype button").count() == 3)
        rec("기본값 긍정 on", await page.locator('#drillRoot .dtype button[data-dtype="aff"]').get_attribute("class") == "aff on")
        await page.locator('#drillRoot .dtype button[data-dtype="neg"]').click()
        await page.wait_for_timeout(250)
        rec("부정 클릭 → neg on", "on" in (await page.locator('#drillRoot .dtype button[data-dtype="neg"]').get_attribute("class")))
        rec("부정 클릭 → 카드 즉시 변화",
            "didn't" in (await page.locator("#drillRoot .dcard .den").nth(1).inner_text()),
            await page.locator("#drillRoot .dcard .den").nth(1).inner_text())

        await page.locator('#drillRoot .dtype button[data-dtype="q"]').click()
        await page.wait_for_timeout(300)
        rec("의문 클릭 → 답변 pill 표시", await page.locator("#drillRoot .dcard .dans button.yes").count() == 5)
        await full_shot(page, os.path.join(OUT, "english-map-drill-answer.png"), shots)
        rec("스크린샷 english-map-drill-answer.png 저장", os.path.exists(os.path.join(OUT, "english-map-drill-answer.png")))

        # 조동사 드릴에서 토글 유지 + ④ 드릴에는 토글 없음
        await page.evaluate("window.__cms.drill.set({verb:0, drill:'modal', type:'q', subj:0})")
        await page.wait_for_timeout(150)
        rec("③ 조동사 드릴: 의문 카드", "Can I make" in (await page.locator("#drillRoot .dcard .den").first.inner_text()),
            await page.locator("#drillRoot .dcard .den").first.inner_text())
        await page.locator('#drillRoot .dtype button[data-dtype="neg"]').click()
        await page.wait_for_timeout(250)
        rec("③ 조동사 드릴: 부정 카드", "can't make" in (await page.locator("#drillRoot .dcard .den").first.inner_text()))
        await full_shot(page, os.path.join(OUT, "english-map-drill-modal-neg.png"), shots)
        rec("스크린샷 english-map-drill-modal-neg.png 저장(조동사·부정)", True)
        await page.locator('#drillRoot .dtab[data-drill="type"]').click()
        await page.wait_for_timeout(200)
        rec("④ 드릴에는 토글 숨김", await page.locator("#drillRoot .dtype").count() == 0)
        await page.locator('#drillRoot .dtab[data-drill="subj"]').click()
        await page.wait_for_timeout(200)
        rec("① 드릴 복귀 시 토글 유지(neg)", "on" in (await page.locator('#drillRoot .dtype button[data-dtype="neg"]').get_attribute("class")))
        rec("① 부정 카드 6장", await page.locator("#drillRoot .dcard").count() == 6)

        # 주어 칩은 시제/조동사 드릴에서만
        rec("② 시제 드릴 주어 칩 6개", await page.evaluate("""() => {
          window.__cms.drill.set({drill:'tense'});
          return document.querySelectorAll('#drillRoot [data-dsubj]').length;
        }""") == 6)

        # 음성 재생(목)
        await page.evaluate("window.__spoken = []")
        await page.locator('#drillRoot .dtype button[data-dtype="q"]').click()
        await page.wait_for_timeout(120)
        await page.locator('#drillRoot .dcard [data-say]').first.click()
        await page.wait_for_timeout(400)
        sp = await page.evaluate("window.__spoken.map(s=>s.text)")
        rec("의문 카드 음성 재생", len(sp) >= 1 and sp[-1].endswith("?"), sp)

        # ---------- UI: 완전 문장 답변 pill ----------
        await page.evaluate("window.__cms.drill.set({verb:0, drill:'tense', type:'q', subj:0, koOnly:false})")
        await page.wait_for_timeout(200)
        rec("답변 pill 2개 + 🔊 문답 버튼 (카드 5장씩)",
            await page.locator("#drillRoot .dcard .dans button.yes").count() == 5 and
            await page.locator("#drillRoot .dcard .dans button.no").count() == 5 and
            await page.locator("#drillRoot .dcard .dans button.qa").count() == 5)
        yes0 = await page.locator("#drillRoot .dcard .dans button.yes").first.inner_text()
        no0 = await page.locator("#drillRoot .dcard .dans button.no").first.inner_text()
        rec("pill에 완전 문장 표시", yes0.strip() == "✅ Yes, you make a decision." and no0.strip() == "🚫 No, you don't make a decision.",
            [yes0, no0])

        # 두 pill 이 세로로 쌓이는지 (겹침/넘침 없음)
        stack = await page.evaluate("""() => {
          const card = document.querySelector('#drillRoot .dcard');
          const btns = Array.from(card.querySelectorAll('.dans button'));
          return btns.map(b => { const r = b.getBoundingClientRect(); return {top:r.top, bottom:r.bottom, left:r.left, right:r.right, w:r.width, h:r.height}; });
        }""")
        cardbox = await page.evaluate("""() => { const r=document.querySelector('#drillRoot .dcard').getBoundingClientRect(); return {left:r.left, right:r.right}; }""")
        rec("답변 pill 카드 폭 안에 들어옴",
            all(b["left"] >= cardbox["left"] - 0.5 and b["right"] <= cardbox["right"] + 0.5 for b in stack), [stack, cardbox])
        rec("Yes/No pill 세로로 겹치지 않음",
            stack[0]["bottom"] <= stack[1]["top"] + 0.5, stack)

        # pill 클릭 → 완전 문장 음성
        await page.evaluate("window.__spoken = []")
        await page.locator("#drillRoot .dcard .dans button.yes").first.click()
        await page.wait_for_timeout(450)
        sp1 = await page.evaluate("window.__spoken.map(s=>s.text)")
        rec("Yes pill 클릭 → 완전 문장 음성", sp1 == ["Yes, you make a decision."], sp1)
        await page.locator("#drillRoot .dcard .dans button.no").first.click()
        await page.wait_for_timeout(450)
        sp2 = await page.evaluate("window.__spoken.map(s=>s.text)")
        rec("No pill 클릭 → 부정 완전 문장 음성", sp2[-1] == "No, you don't make a decision.", sp2)

        await page.evaluate("window.__spoken = []")
        await page.locator("#drillRoot .dcard .dans button.qa").first.click()
        await page.wait_for_timeout(1200)
        sp3 = await page.evaluate("window.__spoken.map(s=>s.text)")
        rec("🔊 문답 → 질문 → 긍정 완전문장 → 부정 완전문장 순서로 재생",
            sp3 == ["Do I make a decision?", "Yes, you make a decision.", "No, you don't make a decision."], sp3)

        # 조동사·시제 문답 세트도 확인
        await page.evaluate("window.__cms.drill.set({verb:0, drill:'tense', type:'q', subj:0})")
        await page.wait_for_timeout(150)
        await page.evaluate("window.__spoken = []")
        await page.locator("#drillRoot .dcard").nth(2).locator(".dans button.qa").click()
        await page.wait_for_timeout(1400)
        sp4 = await page.evaluate("window.__spoken.map(s=>s.text)")
        rec("문답(미래) → Am I going to…? / Yes, you are going to… / No, you aren't going to…",
            sp4 == ["Am I going to make a decision?", "Yes, you are going to make a decision.",
                    "No, you aren't going to make a decision."], sp4)

        # ---------- 👀 한국어만 보기 ----------
        await page.evaluate("window.__cms.drill.set({verb:0, drill:'tense', type:'q', subj:0}); localStorage.removeItem('cms_koOnly'); window.__cms.drill.set({koOnly:false})")
        await page.wait_for_timeout(200)
        rec("한국어만 보기 토글 표시(기본 꺼짐)",
            await page.locator("#drillRoot [data-koonly]").count() == 1 and
            (await page.locator("#drillRoot [data-koonly]").get_attribute("class")) == "dkoonly",
            await page.locator("#drillRoot [data-koonly]").get_attribute("class"))
        await page.locator("#drillRoot [data-koonly]").click()
        await page.wait_for_timeout(250)
        rec("토글 켜면 전 카드 가림", await page.locator("#drillRoot .dcard.masked").count() == 5)
        rec("켜면 영어 숨김", not await page.locator("#drillRoot .dcard .den").first.is_visible())
        rec("켜면 안내문 표시", await page.locator("#drillRoot .dcard .den-ph").first.is_visible())
        rec("켜면 한국어는 보임", await page.locator("#drillRoot .dcard .dko").first.is_visible())
        rec("켜면 해설(note) 숨김", not await page.locator("#drillRoot .dcard .dnote").first.is_visible())
        masked_yes = (await page.locator("#drillRoot .dcard .dans button.yes").first.inner_text()).strip()
        masked_no = (await page.locator("#drillRoot .dcard .dans button.no").first.inner_text()).strip()
        rec("가림 모드 답변 라벨: ✅ Yes (눌러서 확인) / 🚫 No (눌러서 확인)",
            masked_yes == "✅ Yes (눌러서 확인)" and masked_no == "🚫 No (눌러서 확인)", [masked_yes, masked_no])
        rec("토글 상태 저장", (await page.evaluate("JSON.parse(localStorage.getItem('cms_koOnly'))")) == True)

        # 카드 본문 탭 → 영어 공개 + 듣기
        await page.evaluate("window.__spoken = []")
        await page.locator("#drillRoot .dcard .dko").first.click()
        await page.wait_for_timeout(500)
        rec("카드 탭 → 영어 공개", await page.locator("#drillRoot .dcard .den").first.is_visible())
        sp5 = await page.evaluate("window.__spoken.map(s=>s.text)")
        rec("카드 탭 → 영어 음성 재생", sp5 == ["Do I make a decision?"], sp5)
        rec("공개된 카드만 rev, 나머지는 가림",
            await page.locator("#drillRoot .dcard.rev").count() == 1 and
            await page.locator("#drillRoot .dcard.masked").count() == 5)

        # 답변 pill 탭 → 완전 문장 공개 + 듣기
        await page.evaluate("window.__spoken = []")
        btn_yes = page.locator("#drillRoot .dcard").nth(1).locator(".dans button.yes")
        rec("가려진 답변 pill은 짧은 라벨", "눌러서 확인" in (await btn_yes.inner_text()), await btn_yes.inner_text())
        await btn_yes.click()
        await page.wait_for_timeout(550)
        txt_yes = (await btn_yes.inner_text()).strip()
        rec("답변 pill 탭 → 완전 문장 공개", txt_yes == "✅ Yes, you made a decision.", txt_yes)
        sp6 = await page.evaluate("window.__spoken.map(s=>s.text)")
        rec("답변 pill 탭 → 완전 문장 음성", sp6 == ["Yes, you made a decision."], sp6)

        # 가림 모드에서 문답 → 카드 공개 + 세트 재생
        await page.evaluate("window.__spoken = []")
        await page.locator("#drillRoot .dcard").nth(2).locator(".dans button.qa").click()
        await page.wait_for_timeout(1400)
        rec("가림 모드 문답 → 카드 자동 공개",
            await page.locator("#drillRoot .dcard").nth(2).evaluate("el=>el.classList.contains('rev')"))
        sp7 = await page.evaluate("window.__spoken.map(s=>s.text)")
        rec("가림 모드 문답 → 질문·긍정·부정 완전 문장",
            sp7 == ["Am I going to make a decision?", "Yes, you are going to make a decision.",
                    "No, you aren't going to make a decision."], sp7)

        # 가림 모드 가로 스크롤
        ov_ko = []
        for w, h in ((390, 844), (360, 780)):
            await page.set_viewport_size({"width": w, "height": h})
            await page.wait_for_timeout(150)
            bad = await page.evaluate("""() => {
              const D = window.__cms.drill, bad = [];
              for(const drill of ['subj','tense','modal','type','chunk']){
                for(const type of ['aff','neg','q']){
                  D.set({drill:drill, type:type, koOnly:true});
                  const sw = document.documentElement.scrollWidth, iw = window.innerWidth;
                  if(sw > iw + 1) bad.push({drill:drill, type:type, sw:sw, iw:iw});
                }
              }
              return bad;
            }""")
            ov_ko.extend([(w, b) for b in bad])
        rec("가림 모드 390·360 가로 스크롤 없음", len(ov_ko) == 0, ov_ko[:3])
        await page.set_viewport_size({"width": 390, "height": 844})

        # 의문 카드 답변 pill 넘침 — 모든 동사 · 의문 카드
        pill_over = []
        for w, h in ((390, 844), (360, 780)):
            await page.set_viewport_size({"width": w, "height": h})
            await page.evaluate("window.__cms.drill.set({koOnly:false})")
            await page.wait_for_timeout(150)
            bad = await page.evaluate("""() => {
              const D = window.__cms.drill, bad = [];
              for(let v=0; v<window.__cms.VERBS.length; v++){
                for(const drill of ['subj','tense','modal','type']){
                  D.set({verb:v, drill:drill, type:'q', subj:0, koOnly:false});
                  const sw = document.documentElement.scrollWidth, iw = window.innerWidth;
                  if(sw > iw + 1){ bad.push({v:v, drill:drill, scroll:sw, win:iw}); continue; }
                  document.querySelectorAll('#drillRoot .dans button').forEach(function(b){
                    if(b.scrollWidth > b.clientWidth + 1) bad.push({v:v, drill:drill, txt:b.textContent.slice(0,50), sw:b.scrollWidth, cw:b.clientWidth});
                    const r = b.getBoundingClientRect();
                    if(r.right > iw + 1) bad.push({v:v, drill:drill, txt:b.textContent.slice(0,50), right:r.right, win:iw});
                  });
                }
              }
              return bad;
            }""")
            if bad:
                pill_over.extend([(w, b) for b in bad])
        rec("390·360 · 전 동사 의문 카드 답변 pill 넘침 없음", len(pill_over) == 0, pill_over[:4])

        # 가장 긴 답변 문장이 들어가는지 (360px, will-be-longest 조합)
        longest = await page.evaluate("""() => {
          const D = window.__cms.drill; let best = {len:0};
          for(let v=0; v<window.__cms.VERBS.length; v++){
            for(const drill of ['subj','tense','modal','type']){
              D.set({verb:v, drill:drill, type:'q', subj:0});
              D.cards().forEach(c=>{
                if(!c.ans) return;
                if(c.ans.no.length > best.len) best = {len:c.ans.no.length, en:c.en, no:c.ans.no, v:v, drill:drill};
              });
            }
          }
          return best;
        }""")
        print("가장 긴 답변:", json.dumps(longest, ensure_ascii=False))

        # ---------- 가로 스크롤: 두 해상도 × 모든 드릴·종류 ----------
        overflow = []
        for w, h in ((390, 844), (360, 780)):
            await page.set_viewport_size({"width": w, "height": h})
            await page.wait_for_timeout(150)
            bad = await page.evaluate("""() => {
              const D = window.__cms.drill, bad = [];
              for(let v=0; v<window.__cms.VERBS.length; v++){
                for(const drill of ['subj','tense','modal','type','chunk','pv']){
                  for(const type of ['aff','neg','q']){
                    D.set({verb:v, drill:drill, type:type});
                    const sw = document.documentElement.scrollWidth, iw = window.innerWidth;
                    if(sw > iw + 1) bad.push({v:v, drill:drill, type:type, sw:sw, iw:iw});
                  }
                }
              }
              return bad;
            }""")
            if bad:
                overflow.extend([(w, b) for b in bad])
        rec("390·360 폭 전 조합 가로 스크롤 없음", len(overflow) == 0, overflow[:3])

        # 토글 버튼 자체가 넘치지 않는지
        for w, h in ((390, 844), (360, 780)):
            await page.set_viewport_size({"width": w, "height": h})
            await page.evaluate("window.__cms.drill.set({verb:0, drill:'tense', type:'neg'})")
            await page.wait_for_timeout(150)
            box = await page.evaluate("""() => {
              const r = document.querySelector('#drillRoot .dtype').getBoundingClientRect();
              return {l:r.left, r:r.right, w:window.innerWidth};
            }""")
            rec(f"{w}px 토글 화면 안에 표시", box["l"] >= 0 and box["r"] <= box["w"] + 0.5, box)
            await full_shot(page, os.path.join(OUT, f"english-map-drill-{w}.png"), shots)

        # ---------- 최종 스크린샷 ----------
        await page.set_viewport_size({"width": 390, "height": 844})
        await page.evaluate("window.__cms.drill.set({verb:0, drill:'tense', type:'q', subj:0, koOnly:false})")
        await page.wait_for_timeout(200)
        await page.locator("#drillRoot .dcard .dans button.yes").first.click()
        await page.wait_for_timeout(200)
        await full_shot(page, os.path.join(OUT, "english-map-drill-answer.png"), shots)
        rec("스크린샷 english-map-drill-answer.png (완전 문장 답변)", True)

        await page.evaluate("window.__cms.drill.set({verb:0, drill:'tense', type:'q', subj:0, koOnly:true})")
        await page.wait_for_timeout(250)
        await page.evaluate("() => { const els=document.querySelectorAll('#drillRoot .dcard'); if(els[0]){ els[0].classList.add('rev'); els[0].querySelectorAll('.dans button').forEach(function(b){ b.classList.add('rev'); }); } }")
        await page.wait_for_timeout(200)
        await full_shot(page, os.path.join(OUT, "english-map-drill.png"), shots)
        rec("스크린샷 english-map-drill.png (가림·공개·완전 문장 답변)", True)

        await page.set_viewport_size({"width": 360, "height": 780})
        await page.wait_for_timeout(200)
        await full_shot(page, os.path.join(OUT, "english-map-drill-360-q.png"), shots)
        rec("스크린샷 english-map-drill-360-q.png (360px 의문 카드)", True)

        rec("최종 JS 런타임 에러 없음", len(errors) == 0, errors[:3])
        rec("최종 콘솔 error 없음", not console_err, console_err[:3])

        await browser.close()

    bad = [r for r in results if not r[1]]
    print("\n=== %d checks, %d passed, %d failed ===" % (len(results), len(results) - len(bad), len(bad)))
    print("shots:", shots)
    if sys.argv[1:2] == ["--json"]:
        print(json.dumps({"total": len(results), "failed": [r[0] for r in bad]}, ensure_ascii=False))
    sys.exit(1 if bad else 0)


asyncio.run(main())
