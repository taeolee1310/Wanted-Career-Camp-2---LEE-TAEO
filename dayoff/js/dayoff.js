/* content/data.js 값으로 휴강일 페이지 본문을 그린다.
   날짜·요일·주차는 모두 data.js의 일정표(schedule, roadmap, dayoff)에서 계산한다. */
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

  var start = toUTC(S('date-start').start);
  function weekOf(t) { return Math.floor((t - start) / DAY / 7) + 1; }
  function weekMon(n) { return start + (n - 1) * 7 * DAY; }
  function weekFri(n) { return weekMon(n) + 4 * DAY; }

  /* ---------- 파생 값 ---------- */
  var totalWeeks = C.roadmap.reduce(function (n, p) { return n + (p.to - p.from + 1); }, 0);
  var dayoffs = C.dayoff.items.map(function (d) {
    var t = toUTC(d.date);
    return { id: d.id, label: d.label, t: t, week: weekOf(t) };
  });
  var campTitle = C.camp.name + ' ' + C.camp.round + '기';

  function el(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function phaseOf(week) {
    return C.roadmap.filter(function (p) { return week >= p.from && week <= p.to; })[0];
  }

  /* ---------- data-text: 단순 값 채우기 ---------- */
  var VALUES = { campTitle: campTitle };
  document.querySelectorAll('[data-text]').forEach(function (node) {
    var key = node.dataset.text;
    var v = key in VALUES ? VALUES[key] : key.split('.').reduce(function (o, k) { return o && o[k]; }, C);
    node.textContent = v == null ? '' : v;
  });
  document.title = '휴강일 · ' + campTitle;

  /* ---------- 히어로 ---------- */
  el('hero-facts').innerHTML = [
    ['교육 기간', '총 ' + totalWeeks + '주'],
    ['수업 시간', C.eligibility.time],
    ['휴강일', dayoffs.length + '일']
  ].map(function (f) {
    return '<div><dt>' + f[0] + '</dt><dd>' + esc(f[1]) + '</dd></div>';
  }).join('');

  /* ---------- 로드맵 ---------- */
  el('roadmap-title').textContent = C.roadmap.length + '단계, 총 ' + totalWeeks + '주';
  el('roadmap-list').innerHTML = C.roadmap.map(function (p, i) {
    var off = dayoffs.filter(function (d) { return d.week >= p.from && d.week <= p.to; });
    var weeks = p.from === p.to ? p.from + '주차' : p.from + '–' + p.to + '주차';
    // 사진 파일명은 로드맵 ID와 같다 (images/phase-01.svg …)
    return '<li class="card" id="' + p.id + '">' +
      '<img class="card__img" src="images/' + p.id + '.svg" alt="' + esc(p.name) + ' 단계 그림" width="320" height="200" loading="lazy">' +
      '<p class="card__meta">' + (i + 1) + '단계 · ' + weeks + '</p>' +
      '<h3 class="card__title">' + esc(p.name) + '</h3>' +
      '<p class="card__period">' + fmt(weekMon(p.from)) + ' ~ ' + fmtShort(weekFri(p.to)) +
      (off.length ? ' · 휴강 ' + off.length + '일' : '') + '</p>' +
      '<p class="card__body">' + esc(p.text) + '</p>' +
      '<p class="card__output"><strong>산출물</strong>' + esc(p.output) + '</p>' +
      '</li>';
  }).join('');
  el('roadmap-sum').textContent = '주차 합계: ' + C.roadmap.map(function (p) {
    return p.to - p.from + 1;
  }).join(' + ') + ' = ' + totalWeeks + '주';

  /* ---------- 주간 시간표 ---------- */
  el('weekly-title').textContent = '평일 ' + C.eligibility.time.replace('평일 ', '');
  var days = [];
  C.timetable.forEach(function (r) {
    var last = days[days.length - 1];
    if (!last || last.day !== r.day) days.push(last = { day: r.day, slots: [] });
    last.slots.push(r);
  });
  // 활동 문구의 낱말로 픽토그램을 고른다 (위에서부터 먼저 맞는 것). 24px, 선 굵기 1.5
  var ICONS = [
    ['멘토링', '<circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M3 19a5 5 0 0 1 10 0M11 19a5 5 0 0 1 10 0"/>'],
    ['특강', '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6"/>'],
    ['강의', '<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M8 20l4-4 4 4M7 9h6M7 12h10"/>'],
    ['워크숍', '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><path d="M17.5 14v7M14 17.5h7"/>'],
    ['회고', '<path d="M4 5h16v10H9l-5 4z"/><path d="M8 9h8M8 12h5"/>'],
    ['코칭', '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 12h18"/>'],
    ['프로젝트', '<rect x="4" y="5" width="16" height="11" rx="1.5"/><path d="M2 19h20M10 9l-2 2 2 2M14 9l2 2-2 2"/>']
  ];
  function icon(text) {
    var hit = ICONS.filter(function (i) { return text.indexOf(i[0]) !== -1; })[0];
    if (!hit) return '';
    return '<svg class="week__icon" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">' + hit[1] + '</svg>';
  }

  el('week-list').innerHTML = days.map(function (d) {
    return '<li class="week__day"><p class="week__name">' + d.day + '</p>' +
      d.slots.map(function (s) {
        return '<p class="week__slot">' + icon(s.text) +
          '<span><span class="week__time">' + s.time + '</span>' + esc(s.text) + '</span></p>';
      }).join('') + '</li>';
  }).join('');

  /* ---------- 오프라인 일정 (개강·중간 발표, 수료는 schedule.html에서 안내) ---------- */
  var offline = C.schedule.filter(function (x) {
    return x.mode.indexOf('오프라인') === 0 && x.id !== 'date-end';
  });
  el('offline-list').innerHTML = offline.map(function (x) {
    var t = toUTC(x.start);
    return '<li id="offline-' + x.id + '"><time datetime="' + x.start + '">' + fmt(t) + '</time>' +
      '<span>' + esc(x.label) + '<small>' + weekOf(t) + '주차 · ' + esc(x.mode) + '</small></span></li>';
  }).join('');

  /* ---------- 휴강일 ---------- */
  el('dayoff-list').innerHTML = dayoffs.map(function (d) {
    var p = phaseOf(d.week);
    return '<li id="' + d.id + '"><time datetime="' + new Date(d.t).toISOString().slice(0, 10) + '">' + fmt(d.t) + '</time>' +
      '<span>' + esc(d.label) + '<small>' + d.week + '주차' + (p ? ' · ' + esc(p.name) : '') + '</small></span></li>';
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
