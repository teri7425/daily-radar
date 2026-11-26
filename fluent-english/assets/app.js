/* 《유창한 영어회화 1》 학습 앱
   - 데이터: assets/data/parts.js (window.FE_PARTS)
   - 로컬 전용 · 외부 요청 없음 */
(function () {
  'use strict';

  /* ============================================================
     0. 데이터 정규화
     ============================================================ */
  var RAW = window.FE_PARTS || [];

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
          F: c.F || null
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
    st.fm = { set: 0, aux: (c.F && c.F.aux[0]) || 'do' };
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
  var AUX_META = {
    do: { label: 'Do', tense: '현재' },
    did: { label: 'Did', tense: '과거' },
    will: { label: 'Will', tense: '미래' },
    can: { label: 'Can', tense: '가능' },
    wantto: { label: 'want to', tense: '원함' },
    haveto: { label: 'have to', tense: '의무' },
    usedto: { label: 'used to', tense: '과거 습관' },
    goingto: { label: 'be going to', tense: '예정' }
  };

  function compose(aux, s) {
    var o = s.o ? ' ' + s.o : '';
    var v = s.v, past = s.past || s.v;
    var q, yes, no;
    switch (aux) {
      case 'did':
        q = 'Did you ' + v + o + '?';
        yes = 'Yes, I ' + past + o + '.';
        no = "No, I didn't " + v + o + '.';
        break;
      case 'will':
        q = 'Will you ' + v + o + '?';
        yes = 'Yes, I will ' + v + o + '.';
        no = "No, I won't " + v + o + '.';
        break;
      case 'can':
        q = 'Can you ' + v + o + '?';
        yes = 'Yes, I can ' + v + o + '.';
        no = "No, I can't " + v + o + '.';
        break;
      case 'wantto':
        q = 'Do you want to ' + v + o + '?';
        yes = 'Yes, I want to ' + v + o + '.';
        no = "No, I don't want to " + v + o + '.';
        break;
      case 'haveto':
        q = 'Do you have to ' + v + o + '?';
        yes = 'Yes, I have to ' + v + o + '.';
        no = "No, I don't have to " + v + o + '.';
        break;
      case 'usedto':
        q = 'Did you use to ' + v + o + '?';
        yes = 'Yes, I used to ' + v + o + '.';
        no = "No, I didn't use to " + v + o + '.';
        break;
      case 'goingto':
        q = 'Are you going to ' + v + o + '?';
        yes = 'Yes, I am going to ' + v + o + '.';
        no = "No, I'm not going to " + v + o + '.';
        break;
      default:
        q = 'Do you ' + v + o + '?';
        yes = 'Yes, I ' + v + o + '.';
        no = "No, I don't " + v + o + '.';
    }
    return { q: q, yes: yes, no: no };
  }

  function renderFormula() {
    beginPanel();
    var c = cur();
    var F = c.F;
    var auxList = F.aux.filter(function (a) { return AUX_META[a]; });
    var set = F.sets[Math.min(st.fm.set, F.sets.length - 1)];
    if (auxList.indexOf(st.fm.aux) < 0) st.fm.aux = auxList[0];
    var lines = compose(st.fm.aux, set);
    var meta = AUX_META[st.fm.aux];

    var card = el('div', 'card');
    card.appendChild(el('div', 'card-head',
      '<span class="label">공식 [ ' + esc(AUX_META[st.fm.aux].label) + ' ] you …?</span>' +
      '<span class="progress-pill">' + (st.fm.set + 1) + ' / ' + F.sets.length + '</span>'));

    var aux = el('div', 'auxrow');
    auxList.forEach(function (a) {
      var b = el('button', 'aux-btn' + (a === st.fm.aux ? ' active' : ''));
      b.type = 'button';
      b.textContent = AUX_META[a].label;
      b.setAttribute('data-aux', a);
      aux.appendChild(b);
    });
    card.appendChild(aux);

    var setrow = el('div', 'setrow');
    setrow.innerHTML = '<span>동사구 <b class="vname">' + esc(set.v) + '</b></span>';
    card.appendChild(setrow);

    var koLine = el('p', 'ko-line');
    koLine.innerHTML = esc(set.ko) + '<span class="tense-chip">' + meta.tense + '</span>';
    card.appendChild(koLine);

    card.appendChild(el('p', 'en-line', esc(lines.q)));
    card.appendChild(el('div', 'sub-en', '✅ ' + esc(lines.yes)));
    card.appendChild(el('div', 'sub-en', '🚫 ' + esc(lines.no)));

    var acts = el('div', 'row-actions');
    acts.innerHTML =
      '<button class="btn small primary" data-act="f-q">🔊 질문</button>' +
      '<button class="btn small" data-act="f-yes">🔊 Yes</button>' +
      '<button class="btn small" data-act="f-no">🔊 No</button>';
    card.appendChild(acts);

    var nav = el('div', 'nav-row');
    nav.innerHTML =
      '<button class="btn" data-act="f-prev" ' + (st.fm.set === 0 ? 'disabled' : '') + '>← 이전 동사</button>' +
      '<button class="btn primary" data-act="f-next">' + (st.fm.set === F.sets.length - 1 ? '처음으로' : '다음 동사 →') + '</button>';
    card.appendChild(nav);
    modePanel.appendChild(card);

    if (F.note) modePanel.appendChild(el('p', 'foot', esc(F.note) +
      '<br>버튼으로 조동사를 바꾸면 같은 뜻을 현재·과거·미래·가능·의무로 바로 말할 수 있습니다.'));
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
      var set = c.F.sets[st.fm.set];
      var L2 = compose(st.fm.aux, set);
      speak(act === 'f-q' ? L2.q : (act === 'f-yes' ? L2.yes : L2.no), enLang(), settings.rate);
      return;
    }
    if (act === 'f-prev') {
      st.fm.set = (st.fm.set - 1 + c.F.sets.length) % c.F.sets.length;
      renderFormula(); return;
    }
    if (act === 'f-next') {
      st.fm.set = (st.fm.set + 1) % c.F.sets.length;
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
      renderFormula();
      var set = cur().F.sets[st.fm.set];
      speak(compose(st.fm.aux, set).q, enLang(), settings.rate);
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
    open: openChapter
  };
})();
