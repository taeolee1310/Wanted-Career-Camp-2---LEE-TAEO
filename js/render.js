/* content/data.js 값으로 공통 헤더·푸터와 4개 페이지 본문을 그린다.
   화면의 문구·날짜·숫자는 모두 data.js에서 가져온다. */
(function () {
  'use strict';

  var C = window.CAMP;
  var page = document.body.dataset.page;
  var WD = ['일', '월', '화', '수', '목', '금', '토'];

  /* ---------- 날짜 (KST) ---------- */
  function pad(n) { return String(n).padStart(2, '0'); }

  function fmt(iso, noTime) {
    var y = +iso.slice(0, 4), m = +iso.slice(5, 7), d = +iso.slice(8, 10);
    var wd = WD[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
    var s = String(y).slice(2) + '.' + pad(m) + '.' + pad(d) + '(' + wd + ')';
    if (iso.length > 10 && !noTime) s += ' ' + iso.slice(11, 16);
    return s;
  }
  function when(it) {
    return it.end ? fmt(it.start, true) + ' ~ ' + fmt(it.end, true) : fmt(it.start);
  }
  function ms(iso) {
    return new Date(iso.length > 10 ? iso + ':00+09:00' : iso + 'T00:00:00+09:00').getTime();
  }
  function kstDay(t) { return Math.floor((t + 9 * 3600000) / 86400000); }
  function dday(iso) { return kstDay(ms(iso)) - kstDay(Date.now()); }
  function S(id) { return C.schedule.filter(function (x) { return x.id === id; })[0]; }

  function status() {
    var open = S('date-open'), close = S('date-close'), now = Date.now();
    if (now < ms(open.start)) return { label: '모집 예정', note: '모집 시작 D-' + dday(open.start) };
    if (now <= ms(close.start)) {
      var d = dday(close.start);
      return { label: '모집 중', note: d === 0 ? '오늘 마감' : '마감 D-' + d };
    }
    return { label: '모집 마감', note: '' };
  }

  /* ---------- 파생 값 ---------- */
  var totalWeeks = C.roadmap.reduce(function (n, p) { return n + (p.to - p.from + 1); }, 0);
  var months = Math.round(totalWeeks / 4);
  var campTitle = C.camp.name + ' ' + C.camp.round + '기';

  function benefitValue(b) {
    return b.monthly ? '월 최대 ' + b.monthly + '만 원' : b.value;
  }
  function benefitDetail(b) {
    return b.monthly ? b.monthly + '만 원 × ' + months + '개월 = 최대 ' + (b.monthly * months) + '만 원' : b.detail;
  }

  /* ---------- 공통 조각 ---------- */
  var PAGES = [
    { key: 'home', href: 'index.html', label: '메인화면' },
    { key: 'about', href: 'about.html', label: '캠프소개' },
    { key: 'schedule', href: 'schedule.html', label: '일정표' },
    { key: 'location', href: 'location.html', label: '오시는 길' }
  ];

  function head(title) {
    return '<div class="section__head reveal"><h2 class="section__title">' + title + '</h2></div>';
  }
  function section(id, title, body, tint) {
    return '<section class="section' + (tint === 'dark' ? ' section--dark' : '') + '" id="' + id + '"><div class="container">' +
      head(title) + body + '</div></section>';
  }
  function pageTitle(eyebrow, title, desc) {
    return '<section class="page-head"><div class="container">' +
      '<p class="eyebrow reveal">' + eyebrow + '</p><h1 class="reveal">' + title + '</h1>' +
      (desc ? '<p class="lead reveal">' + desc + '</p>' : '') + '</div></section>';
  }
  function cta() {
    var st = status(), close = S('date-close');
    return '<section class="section cta"><div class="container cta__inner reveal">' +
      '<div><h2 class="cta__title">' + campTitle + '</h2>' +
      '<p class="muted">' + st.label + (st.note ? ' · ' + st.note : '') + ' · 지원 마감 ' + fmt(close.start) + '</p></div>' +
      applyBtn('') + '</div></section>';
  }

  function applyBtn(extra) {
    return '<button type="button" class="btn' + extra + '" data-apply>' + C.camp.applyLabel + '</button>';
  }

  /* 지원서 팝업 (가상 접수: 전송·저장 없음) */
  function renderApplyDialog() {
    var F = C.applyForm, L = F.labels, P = F.placeholders;
    var jobs = C.camp.jobs.map(function (j) { return '<option value="' + j + '">' + j + '</option>'; }).join('');
    var dlg = document.createElement('dialog');
    dlg.className = 'modal';
    dlg.id = 'applyDialog';
    dlg.setAttribute('aria-labelledby', 'applyTitle');
    dlg.innerHTML =
      '<button type="button" class="modal__close" data-close aria-label="' + F.close + '">×</button>' +
      '<form class="modal__panel" id="applyForm" novalidate>' +
      '<p class="eyebrow">' + campTitle + '</p>' +
      '<h2 class="modal__title" id="applyTitle">' + F.title + '</h2>' +
      '<p class="muted">' + F.lead + '</p>' +
      '<label class="field"><span>' + L.name + '</span><input class="input" name="name" type="text" autocomplete="name" placeholder="' + P.name + '" required></label>' +
      '<label class="field"><span>' + L.email + '</span><input class="input" name="email" type="email" autocomplete="email" placeholder="' + P.email + '" required></label>' +
      '<label class="field"><span>' + L.phone + '</span><input class="input" name="phone" type="tel" autocomplete="tel" placeholder="' + P.phone + '" required></label>' +
      '<label class="field"><span>' + L.job + '</span><select class="input" name="job" required><option value="">' + F.jobPlaceholder + '</option>' + jobs + '</select></label>' +
      '<label class="field"><span>' + L.motive + '</span><textarea class="input input--area" name="motive" rows="4" maxlength="500" placeholder="' + P.motive + '" required></textarea></label>' +
      '<label class="check-field"><input type="checkbox" name="consent" required><span>' + F.consent + '</span></label>' +
      '<p class="form-error" id="applyError" role="alert" hidden></p>' +
      '<div class="modal__actions"><button type="button" class="btn btn--ghost" data-close>' + F.cancel + '</button>' +
      '<button type="submit" class="btn">' + F.submit + '</button></div>' +
      '</form>' +
      '<div class="modal__panel modal__done" id="applyDone" hidden>' +
      '<h2 class="modal__title">' + F.doneTitle + '</h2>' +
      '<p>' + F.doneText.replace('{name}', '<b data-name></b>').replace('{date}', fmt(S('date-result').start)) + '</p>' +
      '<p class="muted">' + F.doneNote + '</p>' +
      '<div class="modal__actions"><button type="button" class="btn" data-close>' + F.close + '</button></div>' +
      '</div>';
    document.body.appendChild(dlg);
  }

  function timeline(ids) {
    return '<ol class="timeline">' + ids.map(function (id) {
      var it = S(id);
      return '<li class="reveal" id="' + it.id + '"><time>' + when(it) + '</time>' +
        '<p><b>' + it.label + '</b><span class="muted"> · ' + it.mode + '</span></p></li>';
    }).join('') + '</ol>';
  }

  function defs(rows) {
    return '<dl class="defs reveal">' + rows.map(function (r) {
      return '<div><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>';
    }).join('') + '</dl>';
  }

  function offline() {
    return C.schedule.filter(function (x) { return x.mode.indexOf('오프라인') === 0; });
  }
  function offlineList() {
    return '<ul class="plain reveal">' + offline().map(function (it) {
      return '<li><b>' + it.label + '</b> <span class="muted">' + when(it) + '</span></li>';
    }).join('') + '</ul>';
  }

  /* ---------- 헤더·푸터 ---------- */
  function renderHeader() {
    var links = PAGES.map(function (p) {
      return '<a href="' + p.href + '"' + (p.key === page ? ' aria-current="page"' : '') + '>' + p.label + '</a>';
    }).join('');
    document.getElementById('header').innerHTML =
      '<div class="container header__inner">' +
      '<a href="index.html" class="logo">' + C.company.name + '<span>.</span></a>' +
      '<nav class="nav" id="nav" aria-label="주요 메뉴">' + links + '</nav>' +
      '<button class="menu-btn" id="menuBtn" aria-label="메뉴 열기" aria-expanded="false"><span></span><span></span><span></span></button>' +
      '</div>';
  }

  function renderFooter() {
    var c = C.company, k = C.contact;
    document.getElementById('footer').innerHTML =
      '<div class="container footer__grid">' +
      '<div><p class="logo">' + c.name + '<span>.</span></p><p class="muted">' + c.tagline + '</p></div>' +
      '<dl class="defs defs--small">' +
      '<div><dt>대표</dt><dd>' + c.ceo + '</dd></div>' +
      '<div><dt>설립</dt><dd>' + c.founded + '</dd></div>' +
      '<div><dt>소재지</dt><dd>' + c.address + '</dd></div>' +
      '</dl>' +
      '<dl class="defs defs--small">' +
      '<div><dt>문의</dt><dd>' + k.dept + '</dd></div>' +
      '<div><dt>연락처</dt><dd>' + k.email + '<br>' + k.phone + '</dd></div>' +
      '<div><dt>응답 시간</dt><dd>' + k.hours + '</dd></div>' +
      '</dl></div>' +
      '<div class="container footer__notice">' + C.notice + '</div>';
  }

  /* ---------- 메인화면 ---------- */
  function home() {
    var st = status();
    var core = C.benefits.slice(0, 3).map(function (b) {
      return '<li><strong>' + benefitValue(b) + '</strong><span>' + b.name + '</span></li>';
    }).join('');

    var hero = '<section class="hero"><div class="container">' +
      '<p class="eyebrow reveal"><span class="dot"></span>' + campTitle + ' · ' + st.label + (st.note ? ' · ' + st.note : '') + '</p>' +
      '<h1 class="reveal">' + C.copy.headline[0] + '</h1>' +
      '<p class="lead reveal">' + C.copy.sub + '</p>' +
      '<ul class="core reveal">' + core + '</ul>' +
      '<p class="hero__meta reveal">정원 ' + C.camp.capacity + '명 · ' + C.camp.jobs.join(' · ') + ' · 지원 마감 ' + fmt(S('date-close').start) + '</p>' +
      applyBtn(' reveal') +
      '</div></section>';

    var personas = '<ul class="personas">' + C.personas.map(function (p) {
      return '<li class="persona reveal" id="' + p.id + '"><p class="persona__text">“' + p.text + '”</p>' +
        '<p class="persona__who">' + p.job + ' · ' + p.age + '세</p></li>';
    }).join('') + '</ul>';

    var message = '<p class="statement reveal">' + C.message.philosophy + '</p>' +
      '<ul class="grid grid--4">' + C.message.skills.map(function (s, i) {
        return '<li class="cell reveal"><span class="num">0' + (i + 1) + '</span><h3>' + s.name + '</h3><p class="muted">' + s.text + '</p></li>';
      }).join('') + '</ul>';

    var summary = timeline(['date-open', 'date-close', 'date-result', 'date-start']) +
      '<p class="more reveal"><a href="schedule.html">전체 일정 보기 →</a></p>';

    var L = C.location;
    var loc = defs([['장소', L.name], ['주소', L.address], ['지하철', L.subway]]) +
      '<p class="more reveal"><a href="location.html">오시는 길 보기 →</a></p>';

    return hero +
      section('empathy', '이런 고민, 있으셨나요', personas) +
      section('message', '캠프가 보는 것', message, 'dark') +
      section('schedule-summary', '일정 요약', summary) +
      section('location-summary', '위치', loc, true) +
      cta();
  }

  /* ---------- 캠프소개 ---------- */
  function about() {
    var define = '<p class="statement reveal">' + C.camp.positioning + '</p>' +
      '<p class="lead reveal">' + C.camp.definition + '</p>' +
      '<p class="muted reveal">협력 기관 · ' + C.camp.partner + '</p>';

    var overview = '<p class="lead reveal">총 ' + totalWeeks + '주 · 4가지 구성</p>' +
      '<ul class="grid grid--4">' + C.overview.map(function (o, i) {
        return '<li class="cell reveal"><span class="num">0' + (i + 1) + '</span><h3>' + o.name + '</h3><p class="muted">' + o.text + '</p></li>';
      }).join('') + '</ul>';

    var benefits = '<div class="table-scroll reveal"><table class="table"><thead><tr><th>혜택</th><th>내용</th><th>조건</th></tr></thead><tbody>' +
      C.benefits.map(function (b) {
        return '<tr id="' + b.id + '"><th>' + b.name + '</th><td><b>' + benefitValue(b) + '</b><br><span class="muted">' + benefitDetail(b) + '</span></td><td>' + b.condition + '</td></tr>';
      }).join('') + '</tbody></table></div>';

    var people = '<ul class="grid grid--3">' + C.people.map(function (p) {
      return '<li class="person reveal" id="' + p.id + '"><span class="avatar" aria-hidden="true">' + p.name.charAt(0) + '</span>' +
        '<h3>' + p.name + '</h3><p class="person__role">' + p.role + '</p>' +
        '<p class="muted">' + p.now + '<br>전 ' + p.prev + '</p><p>' + p.bio + '</p></li>';
    }).join('') + '</ul>';

    var tools = '<ul class="rows">' + C.tools.map(function (t) {
      return '<li class="reveal"><b>' + t.name + '</b><span class="muted">' + t.text + '</span></li>';
    }).join('') + '</ul>';

    var stats = '<ul class="stats">' + C.stats.items.map(function (s) {
      return '<li class="stat reveal"><strong>' + s.value + '</strong><span>' + s.label + '</span>' + (s.note ? '<small>' + s.note + '</small>' : '') + '</li>';
    }).join('') + '</ul><p class="muted reveal">' + C.stats.asOf + '</p>';

    var d = S('date-start'), e = S('date-end'), E = C.eligibility;
    var eligibility = '<div class="split"><div class="reveal"><h3>참가 자격 <span class="muted">모두 충족</span></h3><ul class="check">' +
      E.conditions.map(function (c) { return '<li>' + c + '</li>'; }).join('') + '</ul>' +
      '<p class="muted">증빙 제출 · ' + E.proof + '</p></div>' +
      '<div>' + defs([
        ['기간', fmt(d.start) + ' ~ ' + fmt(e.start) + ' (총 ' + totalWeeks + '주)'],
        ['시간', E.time],
        ['방식', E.mode],
        ['장소', '<a href="location.html">' + C.location.name + '</a>'],
        ['정원', C.camp.capacity + '명']
      ]) + '</div></div>';

    var apply = '<ol class="steps">' + C.apply.map(function (s, i) {
      var it = S(s.ref);
      return '<li class="step reveal" id="' + s.id + '"><span class="num">0' + (i + 1) + '</span><h3>' + s.name + '</h3>' +
        '<p class="step__date">' + (s.prefix || '') + when(it) + '</p><p class="muted">' + s.text + '</p></li>';
    }).join('') + '</ol><p class="reveal">' + applyBtn('') + '</p>';

    var faq = '<div class="faq">' + C.faq.map(function (f) {
      return '<details class="reveal" id="' + f.id + '"><summary>' + f.q + '</summary><p>' + f.a + '</p></details>';
    }).join('') + '</div>';

    return pageTitle('ABOUT', '캠프소개', C.camp.definition) +
      section('define', '캠프 정의', define) +
      section('overview', '과정 한눈에', overview, true) +
      section('benefits', '혜택', benefits) +
      section('people', '강사·멘토', people, true) +
      section('tools', '사용 도구', tools) +
      section('stats', '운영 실적', stats, 'dark') +
      section('eligibility', '참가 자격·교육 안내', eligibility) +
      section('apply', '신청 방법', apply, true) +
      section('faq', '자주 묻는 질문', faq);
  }

  /* ---------- 일정표 ---------- */
  function schedule() {
    var recruit = timeline(['date-open', 'date-close', 'date-interview', 'date-result', 'date-start', 'date-demo', 'date-end']);

    var roadmap = '<div class="table-scroll reveal"><table class="table"><thead><tr><th>단계</th><th>주차</th><th>내용</th><th>산출물</th></tr></thead><tbody>' +
      C.roadmap.map(function (p) {
        return '<tr id="' + p.id + '"><th>' + p.name + '</th><td>' + p.from + '–' + p.to + '주</td><td>' + p.text + '</td><td>' + p.output + '</td></tr>';
      }).join('') + '</tbody></table></div><p class="muted reveal">총 ' + totalWeeks + '주</p>';

    var week = '<div class="table-scroll reveal"><table class="table"><thead><tr><th>요일</th><th>시간</th><th>활동</th></tr></thead><tbody>' +
      C.timetable.map(function (r) {
        return '<tr><th>' + r.day + '</th><td>' + r.time + '</td><td>' + r.text + '</td></tr>';
      }).join('') + '</tbody></table></div>';

    return pageTitle('SCHEDULE', '일정표', '모집부터 수료까지, 모든 날짜는 이 표를 기준으로 합니다.') +
      section('recruit', '캠프 일정 (KST)', recruit) +
      section('roadmap', '단계별 로드맵', roadmap, true) +
      section('timetable', '주간 시간표', week) +
      section('offline', '오프라인 일정', offlineList() + '<p class="more reveal"><a href="location.html">오시는 길 보기 →</a></p>', true);
  }

  /* ---------- 오시는 길 ---------- */
  function location_() {
    var L = C.location;
    var map = '<figure class="map reveal"><img src="' + L.map + '" alt="' + L.name + ' 가상 약도: 한울역 3번 출구에서 새벽로를 따라 도보 5분"></figure>';
    var info = defs([['장소명', L.name], ['주소', L.address], ['지하철', L.subway], ['버스', L.bus], ['주차', L.parking]]);

    return pageTitle('LOCATION', '오시는 길', L.address) +
      section('map', '약도', map) +
      section('address', '주소와 교통', info, true) +
      section('offline', '오프라인 일정 안내', '<p class="muted reveal">아래 날짜에만 캠퍼스로 모입니다. 나머지는 온라인으로 진행해요.</p>' + offlineList());
  }

  /* ---------- 실행 ---------- */
  var builders = { home: home, about: about, schedule: schedule, location: location_ };
  var titles = {
    home: campTitle + ' | ' + C.company.name,
    about: '캠프소개 | ' + campTitle,
    schedule: '일정표 | ' + campTitle,
    location: '오시는 길 | ' + campTitle
  };

  renderHeader();
  document.getElementById('main').innerHTML = builders[page]();
  renderFooter();
  renderApplyDialog();
  document.title = titles[page];
  var meta = document.querySelector('meta[name="description"]');
  if (meta) meta.content = C.camp.definition;
})();
