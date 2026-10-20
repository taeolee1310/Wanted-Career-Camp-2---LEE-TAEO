/* content/data.js 값으로 메인화면의 헤더·본문·푸터를 그린다.
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
    { key: 'about', href: 'about/index.html', label: '캠프소개' },
    { key: 'location', href: 'location/index.html', label: '오시는 길' }
  ];

  function head(title) {
    return '<div class="section__head reveal"><h2 class="section__title">' + title + '</h2></div>';
  }
  function section(id, title, body, tint) {
    return '<section class="section' + (tint === 'dark' ? ' section--dark' : '') + '" id="' + id + '"><div class="container">' +
      head(title) + body + '</div></section>';
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

  /* ---------- 헤더·푸터 ---------- */
  function renderHeader() {
    var links = PAGES.map(function (p) {
      return '<a href="' + p.href + '"' + (p.key === page ? ' aria-current="page"' : '') + '>' + p.label + '</a>';
    }).join('');
    var sun = '<svg class="i-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
    var moon = '<svg class="i-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/></svg>';
    document.getElementById('header').innerHTML =
      '<div class="header__inner">' +
      '<a href="index.html" class="logo">' + C.company.name + '<span>.</span></a>' +
      '<nav class="nav" id="nav" aria-label="주요 메뉴">' + links + '</nav>' +
      '<div class="header__tools">' +
      '<button type="button" class="icon-btn" id="themeBtn" aria-label="다크 모드 전환" aria-pressed="false">' + moon + sun + '</button>' +
      '<button type="button" class="icon-btn menu-btn" id="menuBtn" aria-label="메뉴 열기" aria-expanded="false"><span></span><span></span><span></span></button>' +
      '</div></div>';
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

  /* 16주 로드맵 비주얼: 단계 폭은 주차에 비례, 오프라인 일정은 날짜 위치에 표시 */
  function journey() {
    var st = S('date-start'), en = S('date-end');
    var segs = C.roadmap.map(function (p, i) {
      var w = p.to - p.from + 1;
      return '<li class="seg" style="flex:' + w + '"><span class="seg__no">0' + (i + 1) + '</span>' +
        '<div><b>' + p.name + '</b><small>' + p.from + '–' + p.to + '주</small></div></li>';
    }).join('');

    var days = totalWeeks * 7, startMs = kstDay(ms(st.start));
    var marks = offline().map(function (it, i, arr) {
      var pct = Math.min(100, Math.max(0, (kstDay(ms(it.start)) - startMs + 1) / days * 100));
      var cls = i === 0 ? ' mark--start' : (i === arr.length - 1 ? ' mark--end' : '');
      var pos = cls ? (i === 0 ? 'left:0' : 'left:100%') : 'left:' + pct.toFixed(1) + '%';
      return '<li class="mark' + cls + '" style="' + pos + '"><span>' + it.label + '</span><time>' + fmt(it.start, true) + '</time></li>';
    }).join('');

    return '<div class="journey reveal"><div class="journey__head">' +
      '<h3 class="journey__title">' + totalWeeks + '주 로드맵</h3>' +
      '<p class="journey__range">' + fmt(st.start, true) + ' → ' + fmt(en.start, true) + '</p></div>' +
      '<ol class="track">' + segs + '</ol><ul class="marks">' + marks + '</ul></div>';
  }

  /* ---------- 메인화면 ---------- */
  function home() {
    var st = status();
    var perks = C.benefits.slice(0, 3).map(function (b) {
      return '<li class="perk reveal"><strong>' + benefitValue(b) + '</strong><h3>' + b.name + '</h3><p>' + benefitDetail(b) + '</p></li>';
    }).join('');

    var hero = '<section class="hero"><div class="container">' +
      '<p class="chip reveal">' + st.label + (st.note ? ' · ' + st.note : '') + '</p>' +
      '<p class="eyebrow reveal">' + campTitle + '</p>' +
      '<h1 class="reveal">' + C.copy.headline[0] + '</h1>' +
      '<p class="lead reveal">' + C.copy.sub + '</p>' +
      '<div class="hero__actions reveal">' + applyBtn('') + '</div>' +
      '<p class="hero__meta reveal">정원 ' + C.camp.capacity + '명 · ' + C.camp.jobs.join(' · ') + ' · 지원 마감 ' + fmt(S('date-close').start) + '</p>' +
      journey() +
      '</div></section>';

    var personas = '<ul class="personas">' + C.personas.map(function (p) {
      return '<li class="persona reveal" id="' + p.id + '"><p class="persona__text">“' + p.text + '”</p>' +
        '<p class="persona__who">' + p.job + ' · ' + p.age + '세</p></li>';
    }).join('') + '</ul>';

    var message = '<p class="statement reveal">' + C.message.philosophy + '</p>' +
      '<ul class="grid grid--4">' + C.message.skills.map(function (s, i) {
        return '<li class="cell reveal"><span class="num">0' + (i + 1) + '</span><h3>' + s.name + '</h3><p class="muted">' + s.text + '</p></li>';
      }).join('') + '</ul>';

    var summary = timeline(['date-open', 'date-close', 'date-result', 'date-start']);

    var L = C.location;
    var loc = defs([['장소', L.name], ['주소', L.address], ['지하철', L.subway]]) +
      '<p class="more reveal"><a href="location/index.html">오시는 길 보기 →</a></p>';

    var perkBody = '<ul class="perks">' + perks + '</ul>' +
      '<p class="more reveal"><a href="about/index.html#benefits">혜택 전체 보기 →</a></p>';

    return hero +
      section('perks', '캠프가 드리는 것', perkBody) +
      section('empathy', '이런 고민, 있으셨나요', personas) +
      section('message', '캠프가 보는 것', message, 'dark') +
      section('schedule-summary', '일정 요약', summary) +
      section('location-summary', '위치', loc, true) +
      cta();
  }

  /* ---------- 실행 ---------- */
  renderHeader();
  document.getElementById('main').innerHTML = home();
  document.title = campTitle + ' | ' + C.company.name;
  var meta = document.querySelector('meta[name="description"]');
  if (meta) meta.content = C.camp.definition;
  renderFooter();
  renderApplyDialog();
})();
