/* 《유창한 영어회화 1》 학습 앱
   - 데이터: assets/data/parts.js (window.FE_PARTS)
   - 로컬 전용 · 외부 요청 없음 */
(function () {
  'use strict';

  /* ============================================================
     0. 데이터 정규화
     ============================================================ */
  var RAW = window.FE_PARTS || [];
  /* 나머지 장의 ①공식 대입 데이터 — assets/data/formulas.js */
  var FORMULAS = window.FE_FORMULAS || {};

  function normItem(it) {
    var yes = (it[2] || '').replace(/^-\s*/, '');
    var tip = it[4] || '';
    /* 셋째 칸이 우리말 설명 only(영문 없음)면 답변이 아니라 해설로 옮깁니다 */
    var looksLikeNote = yes && (
      /[가-힣]/.test(yes) || /\s\+\s/.test(yes) || /~/.test(yes) || /^공식/.test(yes)
    );
    if (looksLikeNote) {
      if (!tip) tip = yes;
      yes = '';
    }
    return {
      ko: it[0] || '',
      q: it[1] || '',
      yes: yes,
      no: it[3] || null,
      tip: tip
    };
  }

  var PARTS = RAW.map(function (p) {
    return {
      id: p.id,
      title: p.title,
      range: p.range,
      chapters: (p.chapters || []).map(function (c) {
        return {
          id: 'p' + p.id + 'c' + c.n,
          part: p.id,
          partTitle: p.title,
          n: c.n,
          t: c.t,
          p: c.p,
          src: !!c.src,
          L: c.L || [],
          T: c.T || [],
          I: (c.I || []).map(normItem),
          F: c.F || FORMULAS['p' + p.id + 'c' + c.n] || null
        };
      })
    };
  });

  var ALL = [];
  PARTS.forEach(function (p) { ALL = ALL.concat(p.chapters); });
  var BY_ID = {};
  ALL.forEach(function (c) { BY_ID[c.id] = c; });

  var TOTAL_CH = ALL.length;
  var TOTAL_ITEMS = ALL.reduce(function (a, c) { return a + c.I.length; }, 0);
  var SRC_CH = ALL.filter(function (c) { return c.src; }).length;

  /* ============================================================
     1. 저장소
     ============================================================ */
  var K_PROG = 'fe1.progress';
  var K_SET = 'fe1.settings';
  var K_LAST = 'fe1.last';

  function read(key, fallback) {
    try {
      var v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch (e) { return fallback; }
  }
  function write(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }

  var progress = read(K_PROG, {});
  var settings = Object.assign({
    accent: 'us', rate: 1, repeat: 2, course: 'ko-en', hideEn: false, filter: 'all'
  }, read(K_SET, {}));
  var last = read(K_LAST, null);

  /* 예전에 저장된 값이 깨져 있어도 안전하게 보정 */
  if (['us', 'uk', 'au', 'in'].indexOf(settings.accent) < 0) settings.accent = 'us';
  settings.rate = Number(settings.rate) > 0 ? Number(settings.rate) : 1;
  settings.repeat = Number(settings.repeat) > 0 ? Number(settings.repeat) : 2;

  function saveSettings() { write(K_SET, settings); }
  function setDone(id, on) {
    progress[id] = Object.assign({}, progress[id] || {});
    if (on) { progress[id].done = true; progress[id].at = new Date().toISOString(); }
    else { delete progress[id].done; }
    write(K_PROG, progress);
  }
  function toggleStar(id) {
    progress[id] = Object.assign({}, progress[id] || {});
    progress[id].star = !progress[id].star;
    write(K_PROG, progress);
    return progress[id].star;
  }
  function isDone(id) { return !!(progress[id] && progress[id].done); }
  function isStar(id) { return !!(progress[id] && progress[id].star); }
  function doneCount() { return ALL.filter(function (c) { return isDone(c.id); }).length; }

  /* ============================================================
     2. 음성 (Web Speech API · 4개국 억양)
     ============================================================ */
  var LANG = { us: 'en-US', uk: 'en-GB', au: 'en-AU', in: 'en-IN', ko: 'ko-KR' };
  var ACCENTS = [
    { id: 'us', label: '미국', flag: '🇺🇸' },
    { id: 'uk', label: '영국', flag: '🇬🇧' },
    { id: 'au', label: '호주', flag: '🇦🇺' },
    { id: 'in', label: '인도', flag: '🇮🇳' }
  ];
  var RATES = [0.75, 0.9, 1, 1.15];

  var speech = {
    ok: (typeof window.speechSynthesis !== 'undefined' &&
         typeof window.SpeechSynthesisUtterance !== 'undefined'),
    voices: []
  };

  function normLang(l) {
    return String(l || '').replace(/_/g, '-').toLowerCase();
  }

  function loadVoices() {
    try { speech.voices = window.speechSynthesis.getVoices() || []; }
    catch (e) { speech.voices = []; }
  }
  if (speech.ok) {
    loadVoices();
    try {
      if (typeof window.speechSynthesis.addEventListener === 'function') {
        window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
      } else {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    } catch (e) {}
    /* 음성 목록이 늦게 채워지는 브라우저(iOS·안드로이드) 대비 */
    setTimeout(function () { loadVoices(); renderSpeechBar(); }, 250);
    setTimeout(function () { loadVoices(); renderSpeechBar(); }, 1200);
  }

  /* lang에 맞는 음성을 찾습니다. exact = 같은 지역(en-GB), region = 같은 지역의 변형
     (en-GB-x-rp 등), base = 같은 언어(en-*)입니다. */
  function voiceFor(lang) {
    var want = normLang(lang);
    var wantBase = want.split('-')[0];
    var wantRegion = want.split('-')[1] || '';
    var vs = speech.voices || [];
    var exact = null, region = null, base = null;
    for (var i = 0; i < vs.length; i++) {
      var v = vs[i];
      var vl = normLang(v.lang);
      if (!vl) continue;
      var parts = vl.split('-');
      var vb = parts[0], vr = parts[1] || '';
      if (!exact && vl === want) exact = v;
      else if (!region && wantRegion && vb === wantBase && vr.indexOf(wantRegion) === 0) region = v;
      else if (!base && vb === wantBase) base = v;
    }
    return { exact: exact, match: exact || region, base: base };
  }

  function pickVoice(lang) {
    var r = voiceFor(lang);
    if (r.match) return r.match;
    /* 한국어는 지역 변형 음성밖에 없어도 그대로 사용 */
    if (normLang(lang).indexOf('ko') === 0) return r.base;
    return null;
  }

  function speak(text, lang, rate) {
    return new Promise(function (resolve) {
      if (!speech.ok || !text) { setTimeout(resolve, 0); return; }
      var done = false;
      function fin() { if (!done) { done = true; resolve(); } }
      try {
        var u = new window.SpeechSynthesisUtterance(text);
        u.lang = lang || LANG[settings.accent] || 'en-US';
        u.rate = rate || settings.rate || 1;
        var v = pickVoice(u.lang);
        if (v) u.voice = v;
        u.onend = fin;
        u.onerror = fin;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
        /* 음성 합성이 끝 이벤트를 주지 않는 환경 대비 */
        var guard = 1500 + (text.length * 150) / Math.max(0.5, u.rate);
        setTimeout(fin, guard);
      } catch (e) { fin(); }
    });
  }

  function stopSpeech() {
    if (!speech.ok) return;
    try { window.speechSynthesis.cancel(); } catch (e) {}
  }

  function enLang() { return LANG[settings.accent] || 'en-US'; }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  /* ---------- 억양·배속 바 (장 화면 전체 모드 공통) ---------- */
  function accentHint() {
    if (!speech.ok || !speech.voices.length) return '';
    var a = null;
    for (var i = 0; i < ACCENTS.length; i++) if (ACCENTS[i].id === settings.accent) a = ACCENTS[i];
    if (!a) return '';
    if (voiceFor(LANG[a.id]).match) return '';
    return '이 기기에는 ' + a.label + ' 영어 음성이 없어 기본 영어 음성으로 들립니다.';
  }

  function renderSpeechBar() {
    var box = $('#speechBar');
    if (!box) return;
    var html = '<div class="sb-row">' +
      '<span class="sb-cap" aria-hidden="true">🗣 억양</span>' +
      '<div class="sb-chips" role="group" aria-label="영어 억양 선택">';
    ACCENTS.forEach(function (a) {
      var on = settings.accent === a.id;
      html += '<button type="button" class="sb-chip' + (on ? ' on' : '') + '"' +
        ' data-accent="' + a.id + '" aria-pressed="' + (on ? 'true' : 'false') + '">' +
        '<span class="flag" aria-hidden="true">' + a.flag + '</span>' + a.label + '</button>';
    });
    html += '</div></div><div class="sb-row">' +
      '<span class="sb-cap" aria-hidden="true">⏩ 배속</span>' +
      '<div class="sb-chips" role="group" aria-label="재생 배속 선택">';
    RATES.forEach(function (n) {
      var on = settings.rate === n;
      html += '<button type="button" class="sb-chip rate' + (on ? ' on' : '') + '"' +
        ' data-rate="' + n + '" aria-pressed="' + (on ? 'true' : 'false') + '">' +
        (n === 1 ? '1x' : n + 'x') + '</button>';
    });
    html += '</div></div>';
    var hint = accentHint();
    if (hint) html += '<p class="sb-hint">⚠️ ' + esc(hint) + '</p>';
    box.innerHTML = html;
  }

  /* 억양 미리 듣기 문장 — 학습 문장의 정답을 미리 읽어 주지 않도록 고정 예문 사용 */
  var PREVIEW_EN = 'Nice to meet you. Where are you from?';

  /* ============================================================
     3. 공통 DOM
     ============================================================ */
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  var screenHome = $('#screen-home');
  var screenChapter = $('#screen-chapter');
  var modePanel = $('#modePanel');

  /* ============================================================
     4. 홈 화면
     ============================================================ */
  function partById(id) {
    for (var i = 0; i < PARTS.length; i++) if (PARTS[i].id === id) return PARTS[i];
    return null;
  }

  function renderStats() {
    var d = doneCount();
    var pct = TOTAL_CH ? Math.round((d / TOTAL_CH) * 100) : 0;
    $('#statbar').innerHTML =
      '<span><b>' + PARTS.length + '</b> PART · <b>' + TOTAL_CH + '</b>장 · <b>' +
      TOTAL_ITEMS.toLocaleString('ko-KR') + '</b>문장</span>' +
      '<span>· 완료 <b>' + d + '</b>장 (' + pct + '%)</span>' +
      '<span>· 📖 원문 <b>' + SRC_CH + '</b>장</span>';
    var ring = $('#ringFg');
    var circumference = 2 * Math.PI * 18;
    ring.style.strokeDasharray = circumference;
    ring.style.strokeDashoffset = circumference * (1 - pct / 100);
    $('#ringNum').textContent = pct + '%';
  }

  function renderResume() {
    var btn = $('#resumeBtn');
    if (!last || !BY_ID[last.id]) { btn.classList.add('hidden'); return; }
    var c = BY_ID[last.id];
    btn.classList.remove('hidden');
    btn.innerHTML = '<span>이어서 학습 · PART ' + c.part + ' 제' + c.n + '장<br>' +
      '<span class="small">' + esc(c.t) + '</span></span><span aria-hidden="true">→</span>';
    btn.setAttribute('data-open', c.id);
  }

  function renderChips() {
    var box = $('#partChips');
    box.innerHTML = '';
    var items = [{ id: 'all', label: '전체', cnt: TOTAL_CH }].concat(
      PARTS.map(function (p) {
        return { id: String(p.id), label: 'PART ' + p.id, cnt: p.chapters.length };
      })
    ).concat([{ id: 'star', label: '⭐ 즐겨찾기', cnt: ALL.filter(function (c) { return isStar(c.id); }).length }]);

    items.forEach(function (it) {
      var b = el('button', 'chip' + (settings.filter === it.id ? ' active' : ''));
      b.type = 'button';
      b.innerHTML = esc(it.label) + ' <span class="cnt">' + it.cnt + '</span>';
      b.setAttribute('data-filter', it.id);
      b.setAttribute('aria-pressed', settings.filter === it.id ? 'true' : 'false');
      box.appendChild(b);
    });
  }

  function matchChapter(c, q) {
    if (!q) return true;
    q = q.toLowerCase();
    if (c.t.toLowerCase().indexOf(q) >= 0) return true;
    for (var i = 0; i < c.I.length; i++) {
      if (c.I[i].ko.toLowerCase().indexOf(q) >= 0) return true;
      if (c.I[i].q.toLowerCase().indexOf(q) >= 0) return true;
    }
    return false;
  }

  function chapterRow(c) {
    var b = el('button', 'row' + (isDone(c.id) ? ' done' : ''));
    b.type = 'button';
    b.setAttribute('data-open', c.id);
    var badge = c.src
      ? '<span class="badge src">📖 교재 원문</span>'
      : '<span class="badge made">✨ 교재 방식 구성</span>';
    b.innerHTML =
      '<span class="num">' + c.n + '</span>' +
      '<span class="body">' +
        '<span class="title">' + esc(c.t) + '</span>' +
        '<span class="meta">' + badge +
          '<span>p.' + esc(c.p) + '</span>' +
          '<span>' + c.I.length + '문장</span>' +
          (c.F ? '<span>공식 ' + c.F.sets.length + '세트</span>' : '') +
        '</span>' +
      '</span>' +
      '<span class="state" aria-hidden="true">' + (isStar(c.id) ? '⭐' : (isDone(c.id) ? '✅' : '›')) + '</span>';
    return b;
  }

  function renderList() {
    var q = ($('#searchInput').value || '').trim();
    var box = $('#chapterList');
    box.innerHTML = '';

    var shown = 0;
    var list = [];

    PARTS.forEach(function (p) {
      if (settings.filter !== 'all' && settings.filter !== 'star' &&
          settings.filter !== String(p.id)) return;
      var chs = p.chapters.filter(function (c) {
        if (settings.filter === 'star' && !isStar(c.id)) return false;
        return matchChapter(c, q);
      });
      if (!chs.length) return;
      list.push({ part: p, chapters: chs });
      shown += chs.length;
    });

    if (!list.length) {
      box.appendChild(el('div', 'empty',
        q ? '‘' + esc(q) + '’에 맞는 장이 없습니다.<br>다른 낱말로 찾아보세요.'
          : '⭐ 즐겨찾기한 장이 아직 없습니다.<br>장 화면 오른쪽 위 ☆를 눌러 담아 두세요.'));
    }

    list.forEach(function (g) {
      var head = el('div', 'part-head');
      head.innerHTML = '<h3>PART ' + g.part.id + '</h3><span>' + esc(g.part.title) +
        ' · ' + g.part.chapters.length + '장 · ' + g.part.range + '</span>';
      box.appendChild(head);
      g.chapters.forEach(function (c) { box.appendChild(chapterRow(c)); });
    });

    var total = TOTAL_CH;
    $('#listSummary').textContent = shown === total && !q
      ? '전체 ' + total + '장'
      : '조건에 맞는 장 ' + shown + ' / ' + total + '장' + (q ? ' · 검색어 “' + q + '”' : '');
  }

  function renderHome() {
    renderStats();
    renderResume();
    renderChips();
    renderList();
  }

  /* ============================================================
     5. 장 화면
     ============================================================ */
  var st = {
    cid: null,
    mode: 'talk',          // talk | formula | course
    talk: { i: 0, revealed: false, ans: null, thinking: false, timer: null },
    fm: { set: 0, aux: 'do' },
    course: { i: 0, playing: false, token: 0 }
  };

  function cur() { return BY_ID[st.cid] || null; }

  function openChapter(id, keepMode) {
    if (!BY_ID[id]) return;
    stopSpeech();
    stopCourse();
    st.cid = id;
    var c = cur();
    if (!keepMode) st.mode = 'talk';   /* 기본은 ② 통역·티키타카 (책의 핵심 훈련) */
    st.talk = { i: 0, revealed: false, ans: null, thinking: false, timer: null };
    var a0 = c.F && c.F.aux && c.F.aux[0];
    st.fm = { set: 0, aux: (a0 && a0.id) ? a0.id : (a0 || 'do') };
    st.course = { i: 0, playing: false, token: 0 };

    last = { id: c.id, at: new Date().toISOString() };
    write(K_LAST, last);

    renderChapter();
    screenHome.classList.add('hidden');
    screenChapter.classList.remove('hidden');
    window.scrollTo(0, 0);
  }

  function closeChapter() {
    stopSpeech();
    stopCourse();
    screenChapter.classList.add('hidden');
    screenHome.classList.remove('hidden');
    renderHome();
    window.scrollTo(0, 0);
  }

  function renderChapter() {
    var c = cur();
    if (!c) return;

    $('#chbarTitle').textContent = 'PART ' + c.part + ' · 제' + c.n + '장';
    $('#chKicker').textContent = 'PART ' + c.part + ' · ' + c.partTitle;
    $('#chTitle').textContent = c.t;

    var badge = c.src
      ? '<span class="badge src">📖 교재 원문</span>'
      : '<span class="badge made">✨ 교재 방식 구성</span>';
    $('#chMeta').innerHTML = badge +
      '<span>p.' + esc(c.p) + '</span>' +
      '<span>' + c.I.length + '문장</span>' +
      (c.F ? '<span>공식 ' + c.F.sets.length + '세트</span>' : '');

    var star = $('#starBtn');
    star.textContent = isStar(c.id) ? '★' : '☆';
    star.classList.toggle('on', isStar(c.id));

    var lec = $('#lectureBox');
    var lb = $('#lectureBody');
    lb.innerHTML = '';
    if (c.L.length) {
      var ul = el('ul');
      c.L.forEach(function (line) { ul.appendChild(el('li', null, esc(line))); });
      lb.appendChild(ul);
    }
    if (c.T.length) {
      var tips = el('div', 'tips');
      c.T.forEach(function (t) {
        var r = el('div', 'tip-row');
        r.innerHTML = '<span class="en">' + esc(t[0]) + '</span><span class="ko">' + esc(t[1]) + '</span>';
        tips.appendChild(r);
      });
      lb.appendChild(tips);
    }
    if (!c.L.length && !c.T.length) {
      lb.innerHTML = '<p>이 장은 문장 훈련이 중심입니다. 아래 ②티키타카로 바로 시작하세요.</p>';
    }
    lec.open = false;

    renderModeTabs();
    renderMode();

    var d = $('#doneBtn');
    d.classList.toggle('on', isDone(c.id));
    d.textContent = isDone(c.id) ? '✅ 학습 완료 · 누르면 해제' : '이 장 학습 완료로 표시';
  }

  function renderModeTabs() {
    var c = cur();
    var tabs = [];
    var hasF = !!c.F;
    if (hasF) tabs.push({ id: 'formula', label: '① 공식 대입' });
    tabs.push({ id: 'talk', label: (hasF ? '② ' : '') + '통역 · 티키타카' });
    tabs.push({ id: 'course', label: (hasF ? '③ ' : '') + '연속 코스' });
    var box = $('#modeTabs');
    box.style.gridTemplateColumns = 'repeat(' + tabs.length + ', 1fr)';
    box.innerHTML = '';
    tabs.forEach(function (t) {
      var b = el('button', st.mode === t.id ? 'active' : '');
      b.type = 'button';
      b.textContent = t.label;
      b.setAttribute('data-mode', t.id);
      b.setAttribute('aria-pressed', st.mode === t.id ? 'true' : 'false');
      box.appendChild(b);
    });
  }

  function beginPanel() {
    modePanel.innerHTML = '';
    if (!speech.ok) {
      modePanel.appendChild(el('div', 'speech-warn',
        '이 브라우저에서는 음성 합성을 쓸 수 없습니다. 화면의 문장으로 같은 훈련을 할 수 있습니다.'));
    }
  }

  function renderMode() {
    stopCourseIfLeaving();
    var c = cur();
    if (st.mode === 'formula' && c.F) renderFormula();
    else if (st.mode === 'course') renderCourse();
    else renderTalk();
    renderModeTabs();
    renderSpeechBar();
  }

  /* ---------- ② 통역 · 티키타카 ---------- */
  function renderTalk() {
    beginPanel();
    var c = cur();
    var items = c.I;
    var i = Math.min(st.talk.i, items.length - 1);
    var it = items[i];
    var t = st.talk;

    var wrap = el('div', 'card');
    var head = el('div', 'card-head');
    head.innerHTML = '<span class="progress-pill">' + (i + 1) + ' / ' + items.length + '</span>' +
      '<button class="btn small ghost" data-act="hide-en" aria-pressed="' + (settings.hideEn ? 'true' : 'false') + '">' +
      (settings.hideEn ? '👀 영어 가림' : '👁 영어 보임') + '</button>';
    wrap.appendChild(head);

    var isQ = /\?\s*$/.test(it.q);
    /* STEP 1 */
    var s1 = el('div', 'stepbox');
    s1.innerHTML =
      '<div class="label">STEP 1 · 우리말을 보고 영어로 말해 보기</div>' +
      '<p class="ko-line">' + esc(it.ko) + '</p>' +
      '<div class="row-actions">' +
        '<button class="btn small" data-act="speak-ko">🔊 우리말 듣기</button>' +
        (t.revealed
          ? '<button class="btn small ghost" data-act="speak-q">🔊 ' + (isQ ? '영어 질문' : '영어 문장') + '</button>'
          : '<button class="btn small primary" data-act="think" id="thinkBtn">' +
            (t.thinking ? '⏱️ ' + t.thinking + '초…' : '⏱️ 3초 생각') + '</button>' +
            '<button class="btn small ghost" data-act="reveal">정답 보기</button>') +
      '</div>';
    wrap.appendChild(s1);

    /* STEP 2 */
    if (t.revealed) {
      var s2 = el('div', 'stepbox');
      var enCls = 'en-line' + (settings.hideEn && !t.shownEn ? ' blurred' : '');
      s2.innerHTML =
        '<div class="label">STEP 2 · ' + (isQ ? '영어 질문을 듣고 따라 말하기' : '영어 문장을 확인하고 따라 말하기') + '</div>' +
        '<p class="' + enCls + '" data-act="show-en">' + esc(it.q) + '</p>' +
        (settings.hideEn && !t.shownEn ? '<p class="tap-hint">영어를 보려면 문장을 탭하세요</p>' : '') +
        '<div class="row-actions">' +
          '<button class="btn small" data-act="speak-q">🔊 ' + (isQ ? '질문 듣기' : '문장 듣기') + '</button>' +
          (it.no
            ? '<button class="btn small" data-act="ans" data-kind="yes">✅ Yes 완전문장</button>' +
              '<button class="btn small" data-act="ans" data-kind="no">🚫 No 완전문장</button>'
            : '<button class="btn small" data-act="ans" data-kind="yes">✅ ' + (isQ ? '모범 답변 보기' : '모범 문장 보기') + '</button>') +
        '</div>';
      wrap.appendChild(s2);
    }

    /* STEP 3 */
    if (t.ans) {
      var s3 = el('div', 'stepbox');
      var isYes = t.ans === 'yes';
      var ans = isYes ? (it.yes || it.q) : (it.no || it.yes || it.q);
      var tag = isYes ? (it.no ? 'YES 완전문장' : '모범 완전문장') : 'NO 완전문장';
      var box = el('div', 'answer-card ' + (isYes ? 'yes' : 'no'));
      box.innerHTML = '<div class="tag">' + tag + '</div>' +
        '<div class="line">' + esc(ans) + '</div>';
      s3.appendChild(el('div', 'label', 'STEP 3 · ' + (isQ ? '완전한 문장으로 크게 따라 말하기' : '영어 문장을 크게 따라 말하기')));
      s3.appendChild(box);
      var acts = el('div', 'row-actions');
      acts.innerHTML = '<button class="btn small primary" data-act="speak-ans">🔊 대답 듣기</button>' +
        '<button class="btn small" data-act="repeat-ans">🔁 ' + settings.repeat + '회 따라 말하기</button>';
      s3.appendChild(acts);
      if (it.tip) s3.appendChild(el('div', 'tip-note', '💡 ' + esc(it.tip)));
      wrap.appendChild(s3);
    }

    var nav = el('div', 'nav-row');
    nav.innerHTML =
      '<button class="btn" data-act="prev" ' + (i === 0 ? 'disabled' : '') + '>← 이전</button>' +
      '<button class="btn primary" data-act="next">' +
        (i === items.length - 1 ? '마지막 문장' : '다음 문장 →') + '</button>';
    wrap.appendChild(nav);

    modePanel.appendChild(wrap);

    var foot = el('p', 'foot', '문장마다 ①우리말→영어로 말하기 ②영어 질문 듣고 따라 말하기 ③Yes/No 완전문장으로 답하기 순서로 훈련합니다.');
    modePanel.appendChild(foot);
    appendChapterNav();
  }

  function appendChapterNav() {
    var c = cur();
    var idx = ALL.indexOf(c);
    var nav = el('div', 'chnav');
    var html = '';
    if (idx > 0) {
      html += '<button class="btn" data-chap="' + ALL[idx - 1].id + '">' +
        '<span class="k">← 이전 장 · PART ' + ALL[idx - 1].part + '</span>' +
        '<span class="v">' + esc(ALL[idx - 1].t) + '</span></button>';
    }
    if (idx < ALL.length - 1) {
      html += '<button class="btn" data-chap="' + ALL[idx + 1].id + '">' +
        '<span class="k">다음 장 · PART ' + ALL[idx + 1].part + ' →</span>' +
        '<span class="v">' + esc(ALL[idx + 1].t) + '</span></button>';
    }
    nav.innerHTML = html;
    modePanel.appendChild(nav);
  }

  function startThink() {
    var t = st.talk;
    if (t.thinking || t.timer) return;
    t.thinking = 3;
    renderTalk();
    t.timer = setInterval(function () {
      t.thinking -= 1;
      if (t.thinking <= 0) {
        clearInterval(t.timer); t.timer = null; t.thinking = false; t.revealed = true;
        renderTalk();
      } else {
        var b = $('#thinkBtn');
        if (b) b.textContent = '⏱️ ' + t.thinking + '초…';
      }
    }, 1000);
  }

  function gotoItem(delta) {
    var c = cur();
    var n = st.talk.i + delta;
    if (n < 0 || n >= c.I.length) return;
    stopSpeech();
    st.talk.i = n;
    st.talk.revealed = false;
    st.talk.ans = null;
    st.talk.shownEn = false;
    st.talk.thinking = false;
    if (st.talk.timer) { clearInterval(st.talk.timer); st.talk.timer = null; }
    renderTalk();
  }

  /* ---------- ① 공식 대입 ---------- */
  /* 조동사·시제 축.  fam: verb(일반동사) | perfect(완료) | prog(진행) |
     be(be동사) | passive(수동) | custom(장마다 직접 쓴 문장) */
  var AUX_META = {
    do:         { label: 'Do',                tense: '현재',      fam: 'verb' },
    dont:       { label: "Don't",             tense: '부정 현재', fam: 'verb' },
    did:        { label: 'Did',               tense: '과거',      fam: 'verb' },
    didnt:      { label: "Didn't",            tense: '부정 과거', fam: 'verb' },
    will:       { label: 'Will',              tense: '미래',      fam: 'verb' },
    can:        { label: 'Can',               tense: '가능',      fam: 'verb' },
    could:      { label: 'Could',             tense: '공손',      fam: 'verb' },
    would:      { label: 'Would',             tense: '공손 요청', fam: 'verb' },
    should:     { label: 'Should',            tense: '충고',      fam: 'verb' },
    must:       { label: 'Must',              tense: '의무',      fam: 'verb' },
    may:        { label: 'May',               tense: '허락',      fam: 'verb' },
    shall:      { label: 'Shall',             tense: '제안',      fam: 'verb' },
    wantto:     { label: 'want to',           tense: '원함',      fam: 'verb' },
    needto:     { label: 'need to',           tense: '필요',      fam: 'verb' },
    intendto:   { label: 'intend to',         tense: '작정',      fam: 'verb' },
    planto:     { label: 'plan to',           tense: '계획',      fam: 'verb' },
    expectto:   { label: 'expect to',         tense: '기대',      fam: 'verb' },
    liketo:     { label: 'like to',           tense: '좋아함',    fam: 'verb' },
    haveto:     { label: 'have to',           tense: '의무',      fam: 'verb' },
    usedto:     { label: 'used to',           tense: '과거 습관', fam: 'verb' },
    goingto:    { label: 'going to',          tense: '예정',      fam: 'verb' },
    ableto:     { label: 'be able to',        tense: '능력',      fam: 'verb' },
    wouldlike:  { label: 'would like',        tense: '권유',      fam: 'verb' },
    wouldliketo:{ label: 'would like to',     tense: '권유',      fam: 'verb' },
    have:       { label: 'Have',              tense: '현재완료',  fam: 'perfect' },
    had:        { label: 'Had',               tense: '과거완료',  fam: 'perfect' },
    willhave:   { label: 'Will have',         tense: '미래완료',  fam: 'perfect' },
    prog:       { label: 'Are you -ing',      tense: '현재진행',  fam: 'prog' },
    progpast:   { label: 'Were you -ing',     tense: '과거진행',  fam: 'prog' },
    progwill:   { label: 'Will you be -ing',  tense: '미래진행',  fam: 'prog' },
    be:         { label: 'Are you',           tense: '현재',      fam: 'be' },
    bep:        { label: 'Were you',          tense: '과거',      fam: 'be' },
    willbe:     { label: 'Will you be',       tense: '미래',      fam: 'be' },
    goingtobe:  { label: 'going to be',       tense: '예정',      fam: 'be' },
    havebe:     { label: 'Have you been',     tense: '완료',      fam: 'be' },
    pbe:        { label: 'is + p.p',          tense: '수동 현재', fam: 'passive' },
    pwas:       { label: 'was + p.p',         tense: '수동 과거', fam: 'passive' },
    pwill:      { label: 'will be + p.p',     tense: '수동 미래', fam: 'passive' },
    phas:       { label: 'has been + p.p',    tense: '수동 완료', fam: 'passive' },
    pcan:       { label: 'can be + p.p',      tense: '수동 가능', fam: 'passive' }
  };

  /* ---------- 주어 인칭·수 ---------- */
  var PRON_PL = { you: 1, we: 1, they: 1 };
  var PRON_SG = { i: 1, he: 1, she: 1, it: 1, this: 1, that: 1,
                  everybody: 1, everyone: 1, somebody: 1, nobody: 1, each: 1 };

  function agrOf(who, agr) {
    if (agr === 'pl') return true;
    if (agr === 'sg') return false;
    var s = String(who == null ? '' : who).trim().toLowerCase();
    if (PRON_PL[s]) return true;
    if (PRON_SG[s]) return false;
    if (/(?:ss|us|news|series|sheep|fish|means)$/.test(s)) return false;
    if (/(?:s|people|children|men|women)$/.test(s)) return true;
    return false;
  }
  function beW(who, agr, tense) {
    var pl = agrOf(who, agr);
    if (tense === 'past') return pl ? 'were' : 'was';
    if (pl) return 'are';
    return String(who == null ? '' : who).trim().toLowerCase() === 'i' ? 'am' : 'is';
  }
  function bePos(who, agr) {            /* I'm / you're / he's / the book is */
    var w = beW(who, agr, 'pres');
    if (w === 'am') return "I'm";
    if (w === 'are') return String(who).trim().toLowerCase() + "'re";
    if (w === 'is') {
      var lw = String(who).trim().toLowerCase();
      if (PRON_SG[lw]) return lw + "'s";
      return who + ' is';
    }
    return who + ' ' + w;
  }
  function beNeg(who, agr) {            /* I'm not / you aren't / he isn't */
    var w = beW(who, agr, 'pres');
    if (w === 'am') return "I'm not";
    if (w === 'are') {
      var lw = String(who).trim().toLowerCase();
      return (PRON_PL[lw] ? lw : who) + " aren't";
    }
    var lw2 = String(who).trim().toLowerCase();
    if (PRON_SG[lw2]) return lw2 + " isn't";
    return who + " isn't";
  }
  /* 3인칭 단수일 때만 -s/does/has 를 씁니다 (I·you·we 는 복수형 취급) */
  function is3s(who, agr) {
    var s = String(who == null ? '' : who).trim().toLowerCase();
    if (s === 'i' || s === 'you' || s === 'we' || s === 'they') return false;
    if (agr === 'pl') return false;
    if (agr === 'sg') return true;
    return !agrOf(who, agr);
  }
  function doW(who, agr) { return is3s(who, agr) ? 'does' : 'do'; }
  function doNeg(who, agr) { return is3s(who, agr) ? "doesn't" : "don't"; }
  function haveW(who, agr) { return is3s(who, agr) ? 'has' : 'have'; }

  /* 3인칭 단수 현재형 — 규칙 + 자주 쓰는 불규칙 */
  var V3 = { have: 'has', do: 'does', go: 'goes', be: 'is' };
  function third(v) {
    var sp = String(v || '').split(' ');
    var w = sp[0], rest = sp.slice(1).join(' ');
    if (!w) return v;
    var t = V3[w.toLowerCase()];
    if (!t) {
      if (/(?:s|sh|ch|x|z|o)$/.test(w)) t = w + 'es';
      else if (/[^aeiou]y$/.test(w)) t = w.slice(0, -1) + 'ies';
      else t = w + 's';
    }
    return t + (rest ? ' ' + rest : '');
  }
  /* 묻는 사람과 답하는 사람이 바뀔 때 대명사를 맞바꿉니다 (flip) */
  var FLIP = { your: 'my', yours: 'mine', yourself: 'myself', you: 'me',
               my: 'your', mine: 'yours', myself: 'yourself', me: 'you' };
  function flipPerson(t) {
    return String(t || '').replace(/\b(your|yours|yourself|you|my|mine|myself|me)\b/gi,
      function (w) {
        var m = FLIP[w.toLowerCase()];
        if (!m) return w;
        return (w.charAt(0) === w.charAt(0).toUpperCase()) ? cap(m) : m;
      });
  }
  function cap(s) {
    s = String(s == null ? '' : s);
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  function jw() {  /* 빈 조각을 빼고 한 칸으로 잇습니다 */
    var out = [];
    for (var i = 0; i < arguments.length; i++) {
      var a = arguments[i];
      if (a != null && String(a).trim() !== '') out.push(String(a).trim());
    }
    return out.join(' ');
  }

  /* ---------- 축 목록 (문자열 id 또는 {id,label,tense} 객체) ---------- */
  function auxListOf(F) {
    var out = [];
    (F.aux || []).forEach(function (a) {
      if (typeof a === 'string') {
        var m = AUX_META[a];
        out.push(m ? { id: a, label: m.label, tense: m.tense, fam: m.fam }
                   : { id: a, label: a, tense: '', fam: 'custom' });
      } else if (a && a.id) {
        out.push({ id: a.id, label: a.label || a.id, tense: a.tense || '', fam: 'custom' });
      }
    });
    return out;
  }
  function auxById(F, id) {
    var l = auxListOf(F);
    for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i];
    return null;
  }
  /* 이 조동사로 말할 수 있는 동사구만 남깁니다 (set.only) */
  function setsFor(F, auxId) {
    var all = F.sets || [];
    var pick = all.filter(function (s) { return !s.only || s.only.indexOf(auxId) >= 0; });
    return pick.length ? pick : all;
  }

  /* ---------- 문장 조립 ---------- */
  /* build(): 질문 1개 + 긍정 서술문(dpos) + 부정 서술문(dneg)
     Pd 는 긍정 서술문에만 쓰는 동사구(의문사 답의 정보를 붙인 형태) */
  function build(aux, s, F, extra) {
    var wh = (s.wh !== undefined) ? s.wh : (F.wh || '');
    var subj = s.subj || F.subj || 'you';
    var asub = s.asub || F.asub || 'I';
    var P  = jw(s.v, s.o);
    var PAST = s.past ? jw(s.past, s.o) : P;
    var PP = s.pp ? jw(s.pp, s.o) : PAST;
    var ING = s.ing ? jw(s.ing, s.o) : P;
    /* 긍정 서술문에만 의문사의 답 정보(extra)를 붙입니다 */
    var Px = jw(P, extra), PASTx = jw(PAST, extra);
    var PPx = jw(PP, extra), INGx = jw(ING, extra);
    var mid = s.mid ? s.mid + ' ' : '';
    var pre = jw(wh, s.hw) ? jw(wh, s.hw) + ' ' : '';
    var S = subj, A = asub;
    var pl = agrOf(S, s.agr), apl = agrOf(A, s.asubAgr);
    var a3 = is3s(A, s.asubAgr);
    var aDo = a3 ? 'does' : 'do';
    var aHave = a3 ? 'has' : 'have';
    var q, dpos, dneg;

    switch (aux) {
      case 'did':
        q = pre + 'did ' + S + ' ' + mid + P + '?';
        dpos = A + ' ' + mid + PASTx; dneg = A + " didn't " + mid + P; break;
      case 'dont':
        q = pre + "don't " + S + ' ' + mid + P + '?';
        dpos = A + ' ' + mid + (a3 ? third(Px) : Px);
        dneg = A + ' ' + doNeg(A, s.asubAgr) + ' ' + mid + P; break;
      case 'didnt':
        q = pre + "didn't " + S + ' ' + mid + P + '?';
        dpos = A + ' ' + mid + PASTx; dneg = A + " didn't " + mid + P; break;
      case 'will':
        q = pre + 'will ' + S + ' ' + mid + P + '?';
        dpos = A + ' will ' + mid + Px; dneg = A + " won't " + mid + P; break;
      case 'can':
        q = pre + 'can ' + S + ' ' + mid + P + '?';
        dpos = A + ' can ' + mid + Px; dneg = A + " can't " + mid + P; break;
      case 'could':
        q = pre + 'could ' + S + ' ' + mid + P + '?';
        dpos = A + ' can ' + mid + Px; dneg = A + " can't " + mid + P; break;
      case 'would':
        q = pre + 'would ' + S + ' ' + mid + P + '?';
        dpos = A + ' will ' + mid + Px; dneg = A + " won't " + mid + P; break;
      case 'should':
        q = pre + 'should ' + S + ' ' + mid + P + '?';
        dpos = A + ' should ' + mid + Px; dneg = A + " shouldn't " + mid + P; break;
      case 'must':
        q = pre + 'must ' + S + ' ' + mid + P + '?';
        dpos = A + ' must ' + mid + Px;
        dneg = A + ' ' + aDo + "n't have to " + mid + P; break;
      case 'may':
        q = pre + 'may ' + S + ' ' + mid + P + '?';
        dpos = A + ' may ' + mid + Px; dneg = A + ' may not ' + mid + P; break;
      case 'shall':
        q = pre + 'shall ' + S + ' ' + mid + P + '?';
        dpos = "let's " + mid + Px; dneg = "let's not " + mid + P; break;
      case 'wantto':
        q = pre + doW(S, s.agr) + ' ' + S + ' ' + mid + 'want to ' + P + '?';
        dpos = A + ' ' + (a3 ? 'wants' : 'want') + ' to ' + mid + Px;
        dneg = A + ' ' + aDo + "n't want to " + mid + P; break;
      case 'needto':
        q = pre + doW(S, s.agr) + ' ' + S + ' ' + mid + 'need to ' + P + '?';
        dpos = A + ' ' + (a3 ? 'needs' : 'need') + ' to ' + mid + Px;
        dneg = A + ' ' + aDo + "n't need to " + mid + P; break;
      case 'intendto':
        q = pre + doW(S, s.agr) + ' ' + S + ' ' + mid + 'intend to ' + P + '?';
        dpos = A + ' ' + (a3 ? 'intends' : 'intend') + ' to ' + mid + Px;
        dneg = A + ' ' + aDo + "n't intend to " + mid + P; break;
      case 'planto':
        q = pre + doW(S, s.agr) + ' ' + S + ' ' + mid + 'plan to ' + P + '?';
        dpos = A + ' ' + (a3 ? 'plans' : 'plan') + ' to ' + mid + Px;
        dneg = A + ' ' + aDo + "n't plan to " + mid + P; break;
      case 'expectto':
        q = pre + doW(S, s.agr) + ' ' + S + ' ' + mid + 'expect to ' + P + '?';
        dpos = A + ' ' + (a3 ? 'expects' : 'expect') + ' to ' + mid + Px;
        dneg = A + ' ' + aDo + "n't expect to " + mid + P; break;
      case 'liketo':
        q = pre + doW(S, s.agr) + ' ' + S + ' ' + mid + 'like to ' + P + '?';
        dpos = A + ' ' + (a3 ? 'likes' : 'like') + ' to ' + mid + Px;
        dneg = A + ' ' + aDo + "n't like to " + mid + P; break;
      case 'haveto':
        q = pre + doW(S, s.agr) + ' ' + S + ' ' + mid + 'have to ' + P + '?';
        dpos = A + ' ' + (a3 ? 'has' : 'have') + ' to ' + mid + Px;
        dneg = A + ' ' + aDo + "n't have to " + mid + P; break;
      case 'usedto':
        q = pre + 'did ' + S + ' ' + mid + 'use to ' + P + '?';
        dpos = A + ' used to ' + mid + Px; dneg = A + " didn't use to " + mid + P; break;
      case 'goingto':
        q = pre + beW(S, s.agr) + ' ' + S + ' ' + mid + 'going to ' + P + '?';
        dpos = bePos(A, s.asubAgr) + ' going to ' + mid + Px;
        dneg = beNeg(A, s.asubAgr) + ' going to ' + mid + P; break;
      case 'ableto':
        q = pre + beW(S, s.agr) + ' ' + S + ' ' + mid + 'able to ' + P + '?';
        dpos = bePos(A, s.asubAgr) + ' able to ' + mid + Px;
        dneg = beNeg(A, s.asubAgr) + ' able to ' + mid + P; break;
      case 'wouldlike':
        q = pre + 'would ' + S + ' ' + mid + 'like ' + P + '?';
        dpos = A + "'d like " + mid + Px;
        dneg = A + " wouldn't like " + mid + P; break;
      case 'wouldliketo':
        q = pre + 'would ' + S + ' ' + mid + 'like to ' + P + '?';
        dpos = A + "'d like to " + mid + Px;
        dneg = A + " wouldn't like to " + mid + P; break;

      /* ---- 완료 ---- */
      case 'have':
        q = pre + haveW(S, s.agr) + ' ' + S + ' ' + mid + PP + '?';
        dpos = A + ' ' + aHave + ' ' + PPx;
        dneg = A + ' ' + (a3 ? "hasn't" : "haven't") + ' ' + PP; break;
      case 'had':
        q = pre + 'Had ' + S + ' ' + mid + PP + '?';
        dpos = A + ' had ' + PPx; dneg = A + " hadn't " + PP; break;
      case 'willhave':
        q = pre + 'will ' + S + ' have ' + mid + PP + '?';
        dpos = A + ' will have ' + PPx;
        dneg = A + " won't have " + PP; break;

      /* ---- 진행 ---- */
      case 'prog':
        q = pre + beW(S, s.agr) + ' ' + S + ' ' + mid + ING + '?';
        dpos = bePos(A, s.asubAgr) + ' ' + mid + INGx;
        dneg = beNeg(A, s.asubAgr) + ' ' + mid + ING; break;
      case 'progpast':
        q = pre + beW(S, s.agr, 'past') + ' ' + S + ' ' + mid + ING + '?';
        dpos = A + ' ' + (apl ? 'were' : 'was') + ' ' + mid + INGx;
        dneg = A + ' ' + (apl ? "weren't" : "wasn't") + ' ' + mid + ING; break;
      case 'progwill':
        q = pre + 'will ' + S + ' be ' + mid + ING + '?';
        dpos = A + ' will be ' + mid + INGx;
        dneg = A + " won't be " + mid + ING; break;

      /* ---- be동사 ---- */
      case 'be':
        q = jw(pre + beW(S, s.agr), S, mid + P) + '?';
        dpos = jw(bePos(A, s.asubAgr), mid + Px);
        dneg = jw(beNeg(A, s.asubAgr), mid + P); break;
      case 'bep':
        q = jw(pre + beW(S, s.agr, 'past'), S, mid + P) + '?';
        dpos = jw(A, apl ? 'were' : 'was', mid + Px);
        dneg = jw(A, apl ? "weren't" : "wasn't", mid + P); break;
      case 'willbe':
        q = jw(pre + 'will', S, 'be', mid + P) + '?';
        dpos = jw(A, 'will be', mid + Px); dneg = jw(A, "won't be", mid + P); break;
      case 'goingtobe':
        q = jw(pre + beW(S, s.agr), S, 'going to be', mid + P) + '?';
        dpos = jw(bePos(A, s.asubAgr), 'going to be', mid + Px);
        dneg = jw(beNeg(A, s.asubAgr), 'going to be', mid + P); break;
      case 'havebe':
        q = jw(pre + haveW(S, s.agr), S, 'been', mid + P) + '?';
        dpos = jw(A, aHave, 'been', mid + Px);
        dneg = jw(A, a3 ? "hasn't" : "haven't", 'been', mid + P); break;

      /* ---- 수동 (be + p.p) ---- */
      case 'pbe':
        q = jw(pre + beW(S, s.agr), S, mid + PP) + '?';
        dpos = jw(bePos(A, s.asubAgr), mid + PPx);
        dneg = jw(beNeg(A, s.asubAgr), mid + PP); break;
      case 'pwas':
        q = jw(pre + beW(S, s.agr, 'past'), S, mid + PP) + '?';
        dpos = jw(A, apl ? 'were' : 'was', mid + PPx);
        dneg = jw(A, apl ? "weren't" : "wasn't", mid + PP); break;
      case 'pwill':
        q = jw(pre + 'will', S, 'be', mid + PP) + '?';
        dpos = jw(A, 'will be', mid + PPx); dneg = jw(A, "won't be", mid + PP); break;
      case 'phas':
        q = jw(pre + haveW(S, s.agr), S, 'been', mid + PP) + '?';
        dpos = jw(A, aHave, 'been', mid + PPx);
        dneg = jw(A, a3 ? "hasn't" : "haven't", 'been', mid + PP); break;
      case 'pcan':
        q = jw(pre + 'can', S, 'be', mid + PP) + '?';
        dpos = jw(A, 'can be', mid + PPx); dneg = jw(A, "can't be", mid + PP); break;

      /* ---- 일반동사 (기본) ---- */
      default:
        q = pre + doW(S, s.agr) + ' ' + S + ' ' + mid + P + '?';
        dpos = A + ' ' + mid + (a3 ? third(Px) : Px);
        dneg = A + ' ' + doNeg(A, s.asubAgr) + ' ' + mid + P;
    }
    q = q.replace(/\s+\?/g, '?');
    return { q: cap(q), dpos: jw(dpos), dneg: jw(dneg) };
  }

  /* 질문·Yes·No(또는 의문사 답)를 만듭니다 */
  function compose(aux, s, F) {
    F = F || {};
    /* 장에서 직접 쓴 문장이 있으면 그대로 씁니다 */
    if (s.forms && s.forms[aux]) {
      var f = s.forms[aux];
      return { q: f.q || '', yes: f.yes || '', no: f.no || '',
               wh: !!f.wh, custom: true };
    }
    var wh = (s.wh !== undefined) ? s.wh : (F.wh || '');
    var whTxt = wh ? jw(wh, s.hw) : '';
    var base = build(aux, s, F, wh ? (s.ans || '') : '');
    if (s.flip) {
      base = { q: base.q, dpos: flipPerson(base.dpos), dneg: flipPerson(base.dneg) };
    }
    var out = { q: base.q, yes: '', no: '', wh: !!wh, custom: false };
    if (wh) {
      /* 의문사 질문에는 Yes/No 대신 완전한 대답 문장을 붙입니다 */
      var ansLine = s.say || base.dpos;
      out.yes = cap(ansLine.replace(/[.?!]*$/, '') + '.');
      out.no = '';
    } else if (s.yes || s.no) {
      out.yes = s.yes || ('Yes, ' + base.dpos + '.');
      out.no = s.no || ('No, ' + base.dneg + '.');
    } else {
      out.yes = 'Yes, ' + base.dpos + '.';
      out.no = 'No, ' + base.dneg + '.';
    }
    out.whWord = whTxt;
    return out;
  }

  /* 공식 머리글에 쓰는 틀: [ Do ] you …? / [ Are ] you …? 처럼 */
  function auxFrame(id, s, F) {
    var a = auxById(F, id);
    if (a && a.fam === 'custom') return a.label;
    var subj = s.subj || F.subj || 'you';
    var agr = s.agr || F.agr;
    switch (id) {
      case 'be': return cap(beW(subj, agr)) + ' ' + subj;
      case 'bep': return cap(beW(subj, agr, 'past')) + ' ' + subj;
      case 'willbe': return 'Will ' + subj + ' be';
      case 'goingtobe': return cap(beW(subj, agr)) + ' ' + subj + ' going to be';
      case 'havebe': return cap(haveW(subj, agr)) + ' ' + subj + ' been';
      case 'prog': return cap(beW(subj, agr)) + ' ' + subj;
      case 'progpast': return cap(beW(subj, agr, 'past')) + ' ' + subj;
      case 'progwill': return 'Will ' + subj + ' be';
      case 'have': return cap(haveW(subj, agr)) + ' ' + subj;
      case 'had': return 'Had ' + subj;
      case 'willhave': return 'Will ' + subj + ' have';
      case 'pbe': return cap(beW(subj, agr)) + ' ' + subj;
      case 'pwas': return cap(beW(subj, agr, 'past')) + ' ' + subj;
      case 'pwill': return 'Will ' + subj + ' be';
      case 'phas': return cap(haveW(subj, agr)) + ' ' + subj + ' been';
      case 'pcan': return 'Can ' + subj + ' be';
      case 'do': case 'did': case 'will': case 'can': case 'could':
      case 'should': case 'must': case 'may': case 'shall': case 'dont': case 'didnt':
        return a.label + ' ' + subj;
      default:
        return (a ? a.label : id) + ' ' + subj;
    }
  }

  function setPredLabel(id, s, F) {
    var a = auxById(F, id);
    var fam = a ? a.fam : 'verb';
    if (fam === 'passive' || fam === 'perfect') return 'p.p';
    if (fam === 'prog') return '-ing';
    if (fam === 'be') return '보어';
    return '동사구';
  }
  function setPredText(id, s, F) {
    var a = auxById(F, id);
    var fam = a ? a.fam : 'verb';
    var t;
    if (fam === 'passive' || fam === 'perfect') t = s.pp || s.past || jw(s.v, s.o);
    else if (fam === 'prog') t = s.ing || jw(s.v, s.o);
    else t = jw(s.v, s.o);
    return t || '—';
  }

  function renderFormula() {
    beginPanel();
    var c = cur();
    var F = c.F;
    var auxes = auxListOf(F);
    if (!auxes.length) return;
    var known = false;
    for (var i = 0; i < auxes.length; i++) if (auxes[i].id === st.fm.aux) known = true;
    if (!known) st.fm.aux = auxes[0].id;

    var sets = setsFor(F, st.fm.aux);
    if (st.fm.set >= sets.length) st.fm.set = 0;
    if (st.fm.set < 0) st.fm.set = 0;
    var set = sets[st.fm.set];
    var auxMeta = auxById(F, st.fm.aux) || { label: st.fm.aux, tense: '' };
    var lines = compose(st.fm.aux, set, F);
    var subjTxt = set.subj || F.subj || 'you';
    var frame = auxFrame(st.fm.aux, set, F);

    var card = el('div', 'card');
    var head = el('div', 'card-head fm');
    head.innerHTML = '<span class="label">공식 ' +
      (lines.wh && lines.whWord ? '<b class="whword">' + esc(lines.whWord) + '</b> · ' : '') +
      '[ ' + esc(frame) + ' ] …?</span>' +
      '<span class="progress-pill">' + (st.fm.set + 1) + ' / ' + sets.length + '</span>';
    card.appendChild(head);

    var aux = el('div', 'auxrow');
    auxes.forEach(function (a) {
      var b = el('button', 'aux-btn' + (a.id === st.fm.aux ? ' active' : ''));
      b.type = 'button';
      b.textContent = a.label;
      b.setAttribute('data-aux', a.id);
      aux.appendChild(b);
    });
    card.appendChild(aux);

    var setrow = el('div', 'setrow');
    setrow.innerHTML = '<span>' + esc(setPredLabel(st.fm.aux, set, F)) +
      ' <b class="vname">' + esc(setPredText(st.fm.aux, set, F)) + '</b></span>' +
      (set.ans && lines.wh ? '<span>답 <b class="vname">' + esc(set.ans) + '</b></span>' : '');
    card.appendChild(setrow);

    var koLine = el('p', 'ko-line');
    koLine.innerHTML = esc(set.ko) + '<span class="tense-chip">' + esc(auxMeta.tense || '') + '</span>';
    card.appendChild(koLine);

    card.appendChild(el('p', 'en-line', esc(lines.q)));
    if (lines.wh) {
      card.appendChild(el('div', 'sub-en', '💬 ' + esc(lines.yes)));
    } else {
      if (lines.yes) card.appendChild(el('div', 'sub-en', '✅ ' + esc(lines.yes)));
      if (lines.no) card.appendChild(el('div', 'sub-en', '🚫 ' + esc(lines.no)));
    }

    var acts = el('div', 'row-actions');
    acts.innerHTML =
      '<button class="btn small primary" data-act="f-q">🔊 질문</button>' +
      '<button class="btn small' + (lines.wh ? ' primary' : '') + '" data-act="f-yes">🔊 ' +
        (lines.wh ? '대답' : 'Yes') + '</button>' +
      (lines.wh ? '' : '<button class="btn small" data-act="f-no">🔊 No</button>');
    card.appendChild(acts);

    var nav = el('div', 'nav-row');
    nav.innerHTML =
      '<button class="btn" data-act="f-prev" ' + (st.fm.set === 0 ? 'disabled' : '') + '>← 이전 동사구</button>' +
      '<button class="btn primary" data-act="f-next">' +
        (st.fm.set === sets.length - 1 ? '처음으로' : '다음 동사구 →') + '</button>';
    card.appendChild(nav);
    modePanel.appendChild(card);

    if (F.note) {
      modePanel.appendChild(el('p', 'foot', esc(F.note) +
        '<br>위 버튼으로 공식을 바꾸면 같은 동사구를 현재·과거·미래·가능·의무로 바로 말할 수 있습니다.'));
    }
  }

  /* ---------- ③ 연속 코스 ---------- */
  function stopCourse() {
    st.course.token++;
    st.course.playing = false;
    stopSpeech();
  }
  function stopCourseIfLeaving() {
    if (st.mode !== 'course') stopCourse();
  }

  function lineText(it) { return it.q; }

  function renderCourse() {
    beginPanel();
    var c = cur();
    var items = c.I;

    var card = el('div', 'card');

    var opts = el('div', 'opt-grid');
    opts.innerHTML =
      '<div class="opt"><label>재생 순서</label><select data-opt="course">' +
        '<option value="ko-en"' + (settings.course === 'ko-en' ? ' selected' : '') + '>한 → 영</option>' +
        '<option value="en-yes-no"' + (settings.course === 'en-yes-no' ? ' selected' : '') + '>영 → Yes → No</option>' +
        '<option value="en"' + (settings.course === 'en' ? ' selected' : '') + '>영어만</option>' +
      '</select></div>' +
      '<div class="opt"><label>문장당 반복</label><select data-opt="repeat">' +
        [1, 2, 3, 5].map(function (n) {
          return '<option value="' + n + '"' + (settings.repeat === n ? ' selected' : '') + '>' + n + '회</option>';
        }).join('') +
      '</select></div>';
    /* 억양·배속은 모드 탭 아래 공통 바에서 바꿉니다 */
    card.appendChild(opts);

    var now = el('div', 'now-line');
    now.id = 'nowLine';
    var ci = Math.min(st.course.i, items.length - 1);
    now.innerHTML = '<span class="now-en' + (settings.hideEn ? ' blurred' : '') + '" id="nowEn" data-act="show-en">' +
      esc(items[ci].q) + '</span>' +
      '<span class="now-ko" id="nowKo">' + esc(items[ci].ko) + '</span>' +
      '<span class="side" id="nowSide">' + (ci + 1) + '/' + items.length + '</span>';
    card.appendChild(now);

    var tr = el('div', 'transport');
    tr.innerHTML =
      '<button class="btn play primary" data-act="c-play">' + (st.course.playing ? '⏸ 멈춤' : '▶ 시작') + '</button>' +
      '<button class="btn" data-act="c-prev">◀</button>' +
      '<button class="btn" data-act="c-next">▶</button>';
    card.appendChild(tr);

    var tog = el('div', 'toggle-row');
    tog.innerHTML = '<span>👀 한국어만 보기 (영어 가리기)</span>' +
      '<button class="switch' + (settings.hideEn ? ' on' : '') + '" data-act="hide-en" aria-label="영어 가리기"></button>';
    card.appendChild(tog);

    var list = el('div', 'line-list');
    list.id = 'lineList';
    items.forEach(function (it, idx) {
      var row = el('div', 'line-item' + (idx === ci ? ' playing' : ''));
      row.setAttribute('data-line', idx);
      row.innerHTML = '<span class="no">' + (idx + 1) + '</span>' +
        '<span class="txt"><span class="en' + (settings.hideEn ? ' blurred' : '') + '" data-act="show-en">' +
        esc(it.q) + '</span><span class="ko">' + esc(it.ko) + '</span></span>';
      list.appendChild(row);
    });
    card.appendChild(list);

    modePanel.appendChild(card);
    modePanel.appendChild(el('p', 'foot',
      '한 장의 문장을 자동으로 이어 재생합니다. 문장을 탭하면 그 문장부터 시작합니다.'));
  }

  function updateNow(idx) {
    var c = cur(); if (!c) return;
    var it = c.I[idx]; if (!it) return;
    var ko = document.getElementById('nowKo');
    var en = document.getElementById('nowEn');
    var side = document.getElementById('nowSide');
    if (ko) ko.textContent = it.ko;
    if (en) { en.textContent = it.q; en.classList.toggle('blurred', !!settings.hideEn); }
    if (side) side.textContent = (idx + 1) + '/' + c.I.length;
    var rows = document.querySelectorAll('.line-item');
    for (var i = 0; i < rows.length; i++) {
      rows[i].classList.toggle('playing', Number(rows[i].getAttribute('data-line')) === idx);
    }
    var active = document.querySelector('.line-item.playing');
    if (active && active.scrollIntoView) {
      try { active.scrollIntoView({ block: 'nearest' }); } catch (e) {}
    }
  }

  async function playCourse() {
    var c = cur(); if (!c) return;
    if (st.course.playing) { stopCourse(); renderCourse(); return; }
    if (st.course.i >= c.I.length) st.course.i = 0;
    st.course.token++;
    var my = st.course.token;
    st.course.playing = true;
    renderCourse();

    for (var i = st.course.i; i < c.I.length; i++) {
      if (my !== st.course.token) return;
      st.course.i = i;
      updateNow(i);
      var it = c.I[i];
      var seq = [];
      if (settings.course === 'ko-en') {
        seq.push({ t: it.ko, lang: LANG.ko });
        seq.push({ t: it.q, lang: enLang() });
      } else if (settings.course === 'en') {
        seq.push({ t: it.q, lang: enLang() });
      } else {
        seq.push({ t: it.q, lang: enLang() });
        seq.push({ t: it.yes || it.q, lang: enLang() });
        if (it.no) seq.push({ t: it.no, lang: enLang() });
      }
      for (var k = 0; k < seq.length; k++) {
        for (var r = 0; r < settings.repeat; r++) {
          if (my !== st.course.token) return;
          await speak(seq[k].t, seq[k].lang, settings.rate);
          await wait(160);
        }
      }
      await wait(300);
    }
    st.course.playing = false;
    st.course.i = 0;
    if (my === st.course.token) renderCourse();
  }

  /* ============================================================
     6. 이벤트
     ============================================================ */
  /* 홈: 칩 / 목록 / 검색 / 이어서 */
  $('#partChips').addEventListener('click', function (e) {
    var b = e.target.closest('[data-filter]');
    if (!b) return;
    settings.filter = b.getAttribute('data-filter');
    saveSettings();
    renderChips();
    renderList();
  });

  $('#chapterList').addEventListener('click', function (e) {
    var b = e.target.closest('[data-open]');
    if (b) openChapter(b.getAttribute('data-open'));
  });

  $('#resumeBtn').addEventListener('click', function () {
    var id = this.getAttribute('data-open');
    if (id) openChapter(id);
  });

  var searchInput = $('#searchInput');
  searchInput.addEventListener('input', function () {
    $('#searchClear').classList.toggle('hidden', !this.value);
    renderList();
  });
  $('#searchClear').addEventListener('click', function () {
    searchInput.value = '';
    this.classList.add('hidden');
    renderList();
    searchInput.focus();
  });

  /* 장 화면 */
  $('#backBtn').addEventListener('click', closeChapter);

  $('#starBtn').addEventListener('click', function () {
    var c = cur(); if (!c) return;
    var on = toggleStar(c.id);
    this.textContent = on ? '★' : '☆';
    this.classList.toggle('on', on);
  });

  $('#doneBtn').addEventListener('click', function () {
    var c = cur(); if (!c) return;
    var next = !isDone(c.id);
    setDone(c.id, next);
    this.classList.toggle('on', next);
    this.textContent = next ? '✅ 학습 완료 · 누르면 해제' : '이 장 학습 완료로 표시';
  });

  $('#modeTabs').addEventListener('click', function (e) {
    var b = e.target.closest('[data-mode]');
    if (!b) return;
    var m = b.getAttribute('data-mode');
    if (m === st.mode) return;
    stopCourse();
    st.mode = m;
    renderMode();
  });

  /* 억양·배속 바: 모든 모드 공통 */
  $('#speechBar').addEventListener('click', function (e) {
    var a = e.target.closest('[data-accent]');
    if (a) {
      var id = a.getAttribute('data-accent');
      if (!LANG[id] || !cur()) return;
      var changed = settings.accent !== id;
      settings.accent = id;
      saveSettings();
      renderSpeechBar();
      /* 고른 억양을 바로 확인할 수 있게 짧은 예문을 들려줍니다 */
      if (changed && !(st.mode === 'course' && st.course.playing)) {
        speak(PREVIEW_EN, LANG[id], settings.rate);
      }
      return;
    }
    var r = e.target.closest('[data-rate]');
    if (r) {
      var rate = Number(r.getAttribute('data-rate'));
      if (!(rate > 0)) return;
      settings.rate = rate;
      saveSettings();
      renderSpeechBar();
      if (st.mode === 'course') { stopCourse(); renderCourse(); }
    }
  });

  /* 모드 패널: 위임 */
  modePanel.addEventListener('click', function (e) {
    var c = cur(); if (!c) return;

    var chap = e.target.closest('[data-chap]');
    if (chap) { openChapter(chap.getAttribute('data-chap')); return; }

    var host = e.target.closest('[data-act]');
    if (!host) return;
    var act = host.getAttribute('data-act');

    if (act === 'hide-en') {
      settings.hideEn = !settings.hideEn;
      saveSettings();
      if (st.mode === 'course') renderCourse();
      else if (st.mode === 'talk') renderTalk();
      return;
    }
    if (act === 'show-en') {
      host.classList.remove('blurred');
      st.talk.shownEn = true;
      return;
    }

    if (act === 'speak-ko') { speak(c.I[st.talk.i].ko, LANG.ko, 0.95); return; }
    if (act === 'speak-q') { speak(c.I[st.talk.i].q, enLang(), settings.rate); return; }
    if (act === 'reveal') {
      st.talk.revealed = true;
      renderTalk();
      var el2 = document.querySelector('.en-line');
      if (el2 && el2.scrollIntoView) { try { el2.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) {} }
      return;
    }
    if (act === 'think') { startThink(); return; }
    if (act === 'ans') {
      st.talk.ans = host.getAttribute('data-kind');
      renderTalk();
      var ac = document.querySelector('.answer-card');
      if (ac && ac.scrollIntoView) { try { ac.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) {} }
      var it = c.I[st.talk.i];
      var line = st.talk.ans === 'yes' ? it.yes : (it.no || it.yes);
      speak(line, enLang(), settings.rate);
      return;
    }
    if (act === 'speak-ans') {
      var it2 = c.I[st.talk.i];
      speak(st.talk.ans === 'no' ? (it2.no || it2.yes) : it2.yes, enLang(), settings.rate);
      return;
    }
    if (act === 'repeat-ans') {
      (async function () {
        var it3 = c.I[st.talk.i];
        var line3 = st.talk.ans === 'no' ? (it3.no || it3.yes) : it3.yes;
        for (var r = 0; r < settings.repeat; r++) {
          await speak(line3, enLang(), settings.rate);
          await wait(180);
        }
      })();
      return;
    }
    if (act === 'prev') { gotoItem(-1); return; }
    if (act === 'next') {
      if (st.talk.i >= c.I.length - 1) return;
      gotoItem(1); return;
    }

    /* 공식 */
    if (act === 'f-q' || act === 'f-yes' || act === 'f-no') {
      if (!c.F) return;
      var fSets = setsFor(c.F, st.fm.aux);
      var set = fSets[Math.min(st.fm.set, fSets.length - 1)];
      if (!set) return;
      var L2 = compose(st.fm.aux, set, c.F);
      speak(act === 'f-q' ? L2.q : (act === 'f-yes' ? L2.yes : L2.no), enLang(), settings.rate);
      return;
    }
    if (act === 'f-prev') {
      if (!c.F) return;
      var nPrev = setsFor(c.F, st.fm.aux).length;
      st.fm.set = (st.fm.set - 1 + nPrev) % nPrev;
      renderFormula(); return;
    }
    if (act === 'f-next') {
      if (!c.F) return;
      var nNext = setsFor(c.F, st.fm.aux).length;
      st.fm.set = (st.fm.set + 1) % nNext;
      renderFormula(); return;
    }

    /* 코스 */
    if (act === 'c-play') { playCourse(); return; }
    if (act === 'c-prev') {
      stopCourse();
      st.course.i = Math.max(0, st.course.i - 1);
      renderCourse(); return;
    }
    if (act === 'c-next') {
      stopCourse();
      st.course.i = Math.min(c.I.length - 1, st.course.i + 1);
      renderCourse(); return;
    }
  });

  modePanel.addEventListener('click', function (e) {
    var aux = e.target.closest('[data-aux]');
    if (aux && cur() && cur().F) {
      st.fm.aux = aux.getAttribute('data-aux');
      st.fm.set = 0;                 /* 조동사에 따라 동사구 목록이 달라집니다 */
      renderFormula();
      var fSets = setsFor(cur().F, st.fm.aux);
      var fSet = fSets[0];
      if (fSet) speak(compose(st.fm.aux, fSet, cur().F).q, enLang(), settings.rate);
      return;
    }
    var line = e.target.closest('[data-line]');
    if (line && cur()) {
      stopCourse();
      st.course.i = Number(line.getAttribute('data-line'));
      st.course.playing = true;
      playCourse();
    }
  });

  modePanel.addEventListener('change', function (e) {
    var s = e.target.closest('[data-opt]');
    if (!s) return;
    var key = s.getAttribute('data-opt');
    var v = s.value;
    if (key === 'repeat') settings.repeat = Number(v);
    else if (key === 'rate') settings.rate = Number(v);
    else settings[key] = v;
    saveSettings();
    if (key !== 'course') { /* 재생 중이면 멈추고 다시 */ stopCourse(); }
    renderCourse();
  });

  document.addEventListener('keydown', function (e) {
    if (screenChapter.classList.contains('hidden')) return;
    if (e.key === 'Escape') closeChapter();
    if (st.mode !== 'talk') return;
    if (e.key === 'ArrowRight') gotoItem(1);
    if (e.key === 'ArrowLeft') gotoItem(-1);
    if (e.key === ' ') { e.preventDefault(); st.talk.revealed = true; renderTalk(); }
  });

  /* ============================================================
     7. 시작
     ============================================================ */
  renderHome();

  /* 테스트·검증용 요약 */
  window.FE_APP = {
    totalParts: PARTS.length,
    totalChapters: TOTAL_CH,
    totalItems: TOTAL_ITEMS,
    sourceChapters: SRC_CH,
    madeChapters: TOTAL_CH - SRC_CH,
    formulas: ALL.filter(function (c) { return c.F; }).length,
    formulaChapters: ALL.filter(function (c) { return c.F; }).map(function (c) { return c.id; }),
    chapterItems: function (id) { return BY_ID[id] ? BY_ID[id].I.length : 0; },
    settings: settings,
    accentLang: function () { return enLang(); },
    open: openChapter,
    /* 검증용: 모든 장의 공식 조립 결과를 그대로 돌려줍니다 */
    formulaAudit: function () {
      var out = [];
      ALL.forEach(function (c) {
        if (!c.F) { out.push({ id: c.id, title: c.t, F: false }); return; }
        var rows = [];
        auxListOf(c.F).forEach(function (a) {
          setsFor(c.F, a.id).forEach(function (s, i) {
            var L = compose(a.id, s, c.F);
            rows.push({ aux: a.id, i: i, ko: s.ko, q: L.q, yes: L.yes, no: L.no,
                        wh: !!L.wh, custom: !!L.custom, frame: auxFrame(a.id, s, c.F) });
          });
        });
        out.push({ id: c.id, part: c.part, n: c.n, title: c.t, F: true,
                   sets: c.F.sets.length, aux: auxListOf(c.F).map(function (a) { return a.id; }), rows: rows });
      });
      return out;
    },
    setMode: function (m) { st.mode = m; renderMode(); },
    setAux: function (a) { st.fm.aux = a; st.fm.set = 0; renderFormula(); },
    setSet: function (i) { st.fm.set = i; renderFormula(); },
    panelText: function () { return modePanel.textContent; }
  };
})();
