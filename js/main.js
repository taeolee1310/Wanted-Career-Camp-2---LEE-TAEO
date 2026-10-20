(function () {
  'use strict';

  var header = document.getElementById('header');
  var nav = document.getElementById('nav');
  var menuBtn = document.getElementById('menuBtn');

  // 헤더 스크롤 그림자
  window.addEventListener('scroll', function () {
    header.classList.toggle('is-scrolled', window.scrollY > 10);
  }, { passive: true });

  // 모바일 메뉴
  menuBtn.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    menuBtn.setAttribute('aria-expanded', open);
  });
  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      nav.classList.remove('is-open');
      menuBtn.setAttribute('aria-expanded', 'false');
    }
  });

  // 숫자 카운트 업
  function countUp(el) {
    var target = Number(el.dataset.count);
    var suffix = el.dataset.suffix || '';
    var start = performance.now();
    var duration = 1200;
    function tick(now) {
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString('ko-KR') + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // 스크롤 등장 효과
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      el.classList.add('is-visible');
      el.querySelectorAll('[data-count]').forEach(countUp);
      el.querySelectorAll('[data-width]').forEach(function (bar) {
        bar.style.width = bar.dataset.width + '%';
      });
      io.unobserve(el);
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  // 팀별 고민 탭
  var tabs = document.querySelectorAll('.tab');
  var panels = document.querySelectorAll('.panel');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.toggle('is-active', t === tab); });
      panels.forEach(function (p) { p.classList.toggle('is-active', p.id === tab.dataset.tab); });
    });
  });

  // 현재 섹션 메뉴 강조
  var links = nav.querySelectorAll('a');
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      links.forEach(function (a) {
        a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id);
      });
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  document.querySelectorAll('main section[id]').forEach(function (s) { spy.observe(s); });
})();
