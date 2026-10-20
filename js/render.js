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
    var close = S('date-close');
    if (Date.now() <= ms(close.start)) {
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
      '<p>' + F.doneText.replace('{name}', '<b data-name></b>') + '</p>' +
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

  /* 16주 로드맵 비주얼: 단계 폭은 주차에 비례, 오프라인 일정은 날짜 위치에 표시 */
  function journey() {
    var st = S('date-start'), en = S('date-end');
    var segs = C.roadmap.map(function (p, i) {
      var w = p.to - p.from + 1;
      return '<li class="seg" style="flex:' + w + '"><span class="seg__no">0' + (i + 1) + '</span>' +
        '<div><b>' + p.name + '</b><small>' + (p.from === p.to ? p.from : p.from + '–' + p.to) + '주</small></div></li>';
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

  /* 히어로 배경 영상: 소리 없이 자동 재생·반복. 글자 대비를 위해 CSS에서 어두운 막을 한 겹 덮는다 */
  function heroBg() {
    return '<div class="hero__bg" aria-hidden="true">' +
      '<video class="hero__video" autoplay muted loop playsinline preload="auto" tabindex="-1">' +
      '<source src="design/assets/hero/hero-bg.mp4" type="video/mp4"></video></div>';
  }

  /* ---------- 메인화면 ---------- */
  function home() {
    var st = status();
    var perks = C.benefits.slice(0, 3).map(function (b) {
      return '<li class="perk reveal"><strong>' + benefitValue(b) + '</strong><h3>' + b.name + '</h3><p>' + benefitDetail(b) + '</p></li>';
    }).join('');

    var hero = '<section class="hero">' + heroBg() + '<div class="container">' +
      '<p class="chip reveal">' + st.label + (st.note ? ' · ' + st.note : '') + '</p>' +
      '<p class="eyebrow reveal">' + campTitle + '</p>' +
      '<h1 class="reveal">' + C.camp.tagline + '</h1>' +
      '<p class="lead reveal">' + C.camp.definition + '</p>' +
      '<div class="hero__actions reveal">' + applyBtn('') + '</div>' +
      '<p class="hero__meta reveal">정원 ' + C.camp.capacity + '명 · ' + C.camp.jobs.join(' · ') + ' · 지원 마감 ' + fmt(S('date-close').start) + '</p>' +
      journey() +
      '</div></section>';

    var summary = timeline(['date-close', 'date-start', 'date-end']);

    var L = C.location;
    var loc = defs([['장소', L.name], ['주소', L.address]]) +
      '<p class="more reveal"><a href="location/index.html">오시는 길 보기 →</a></p>';

    var perkBody = '<ul class="perks">' + perks + '</ul>' +
      '<p class="more reveal"><a href="about/index.html#benefits">혜택 전체 보기 →</a></p>';

    return hero +
      section('perks', '캠프가 드리는 것', perkBody) +
      section('schedule-summary', '일정 요약', summary) +
      section('location-summary', '위치', loc, true) +
      cta();
  }

  /* ---------- 실행 ---------- */
  document.getElementById('main').innerHTML = home();
  document.title = campTitle + ' | ' + C.company.name;
  var meta = document.querySelector('meta[name="description"]');
  if (meta) meta.content = C.camp.definition;
  renderApplyDialog();
})();
