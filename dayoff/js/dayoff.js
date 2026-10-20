/* content/data.js 값으로 일정표 페이지 본문을 그린다.
   날짜·요일·주차는 모두 data.js의 일정표(schedule, roadmap)에서 계산한다. */
(function () {
  'use strict';

  var C = window.CAMP;
  var WD = ['일', '월', '화', '수', '목', '금', '토'];
  var DAY = 86400000;

  /* ---------- 날짜 (KST, 날짜만 다룬다) ---------- */
  function pad(n) { return String(n).padStart(2, '0'); }
  function toUTC(iso) {
    return Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10));
  }
  function fmt(t) {
    var d = new Date(t);
    return String(d.getUTCFullYear()).slice(2) + '.' + pad(d.getUTCMonth() + 1) + '.' + pad(d.getUTCDate()) +
      '(' + WD[d.getUTCDay()] + ')';
  }
  function fmtShort(t) {
    var d = new Date(t);
    return pad(d.getUTCMonth() + 1) + '.' + pad(d.getUTCDate()) + '(' + WD[d.getUTCDay()] + ')';
  }
  function S(id) { return C.schedule.filter(function (x) { return x.id === id; })[0]; }

  var first = toUTC(S('date-start').start);
  // 주차는 개강일이 속한 주의 월요일부터 센다 (개강이 월요일이 아닐 수 있음)
  var start = first - ((new Date(first).getUTCDay() + 6) % 7) * DAY;
  function weekOf(t) { return Math.floor((t - start) / DAY / 7) + 1; }
  function weekMon(n) { return start + (n - 1) * 7 * DAY; }
  function weekFri(n) { return weekMon(n) + 4 * DAY; }

  /* ---------- 파생 값 ---------- */
  var totalWeeks = C.roadmap.reduce(function (n, p) { return n + (p.to - p.from + 1); }, 0);
  var campTitle = C.camp.name + ' ' + C.camp.round + '기';

  function el(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  /* ---------- data-text: 단순 값 채우기 ---------- */
  var VALUES = { campTitle: campTitle };
  document.querySelectorAll('[data-text]').forEach(function (node) {
    var key = node.dataset.text;
    var v = key in VALUES ? VALUES[key] : key.split('.').reduce(function (o, k) { return o && o[k]; }, C);
    node.textContent = v == null ? '' : v;
  });
  document.title = '일정표 · ' + campTitle;

  /* ---------- 히어로 ---------- */
  el('hero-facts').innerHTML = [
    ['교육 기간', '총 ' + totalWeeks + '주'],
    ['수업 시간', C.eligibility.time]
  ].map(function (f) {
    return '<div><dt>' + f[0] + '</dt><dd>' + esc(f[1]) + '</dd></div>';
  }).join('');

  /* ---------- 로드맵 ---------- */
  el('roadmap-title').textContent = C.roadmap.length + '단계, 총 ' + totalWeeks + '주';
  el('roadmap-list').innerHTML = C.roadmap.map(function (p, i) {
    var weeks = p.from === p.to ? p.from + '주차' : p.from + '–' + p.to + '주차';
    // 사진 파일명은 로드맵 ID와 같다 (images/phase-01.svg …)
    return '<li class="card" id="' + p.id + '">' +
      '<img class="card__img" src="images/' + p.id + '.svg" alt="' + esc(p.name) + ' 단계 그림" width="320" height="200" loading="lazy">' +
      '<p class="card__meta">' + (i + 1) + '단계 · ' + weeks + '</p>' +
      '<h3 class="card__title">' + esc(p.name) + '</h3>' +
      '<p class="card__period">' + fmt(Math.max(weekMon(p.from), first)) + ' ~ ' + fmtShort(weekFri(p.to)) + '</p>' +
      (p.output ? '<p class="card__output"><strong>산출물</strong>' + esc(p.output) + '</p>' : '') +
      '</li>';
  }).join('');
  el('roadmap-sum').textContent = '주차 합계: ' + C.roadmap.map(function (p) {
    return p.to - p.from + 1;
  }).join(' + ') + ' = ' + totalWeeks + '주';

  /* ---------- 오프라인 일정 ---------- */
  var offline = C.schedule.filter(function (x) { return x.mode.indexOf('오프라인') === 0; });
  el('offline-list').innerHTML = offline.map(function (x) {
    var t = toUTC(x.start);
    return '<li id="offline-' + x.id + '"><time datetime="' + x.start + '">' + fmt(t) + '</time>' +
      '<span>' + esc(x.label) + '<small>' + weekOf(t) + '주차 · ' + esc(x.mode) + '</small></span></li>';
  }).join('');

  /* ---------- 페이지 안 이동: 지금 보고 있는 구역의 칩을 채운다 ---------- */
  var chips = Array.prototype.slice.call(document.querySelectorAll('.sub-nav__links a'));
  var targets = chips.map(function (a) { return document.querySelector(a.dataset.spy || a.getAttribute('href')); });
  function markChip() {
    var line = window.innerHeight * 0.35, current = null, prevTop = null;
    targets.forEach(function (t, i) {
      if (!t) return;
      var top = t.getBoundingClientRect().top;
      // 오프라인·휴강일처럼 나란히 놓인 구역은 앞의 칩을 남긴다
      if (top <= line && (prevTop === null || top - prevTop > 4)) current = i;
      prevTop = top;
    });
    chips.forEach(function (a, i) {
      if (i === current) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    });
    var bar = chips[0] && chips[0].parentNode;
    if (current !== null && bar.scrollWidth > bar.clientWidth) {
      bar.scrollLeft = chips[current].offsetLeft - 16;
    }
  }
  window.addEventListener('scroll', markChip, { passive: true });
  markChip();
})();
