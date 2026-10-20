/* 모든 페이지 공통: 상단 메뉴(헤더) · 푸터 · 다크/라이트 토글 · 모바일 메뉴.
   페이지 쪽 <body>에는 data-page(home|about|dayoff|location)와 data-root(루트까지의 경로, 하위 폴더는 '../')만 둔다.
   회사명·문의처·고지는 content/data.js(window.CAMP)에서 읽는다. */
(function () {
  'use strict';

  var C = window.CAMP || { company: { name: '' }, contact: {}, notice: '' };
  var body = document.body;
  var page = body.dataset.page || 'home';
  var ROOT = body.dataset.root || '';

  var PAGES = [
    { key: 'home', href: 'index.html', label: '메인화면' },
    { key: 'about', href: 'about/index.html', label: '캠프소개' },
    { key: 'dayoff', href: 'dayoff/index.html', label: '일정표' },
    { key: 'location', href: 'location/index.html', label: '오시는 길' }
  ];

  var SUN = '<svg class="i-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var MOON = '<svg class="i-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/></svg>';

  function renderHeader(el) {
    var links = PAGES.map(function (p) {
      return '<a href="' + ROOT + p.href + '"' + (p.key === page ? ' aria-current="page"' : '') + '>' + p.label + '</a>';
    }).join('');
    el.innerHTML =
      '<div class="header__inner">' +
      '<a href="' + ROOT + 'index.html" class="logo">' + C.company.name + '<span>.</span></a>' +
      '<nav class="nav" id="nav" aria-label="주요 메뉴">' + links + '</nav>' +
      '<div class="header__tools">' +
      '<button type="button" class="icon-btn" id="themeBtn" aria-label="다크 모드로 전환" aria-pressed="false">' + MOON + SUN + '</button>' +
      '<button type="button" class="icon-btn menu-btn" id="menuBtn" aria-label="메뉴 열기" aria-expanded="false"><span></span><span></span><span></span></button>' +
      '</div></div>';
  }

  function renderFooter(el) {
    var c = C.company, k = C.contact || {};
    el.innerHTML =
      '<div class="container footer__grid">' +
      '<div><p class="logo">' + c.name + '<span>.</span></p></div>' +
      '<dl class="defs defs--small">' +
      '<div><dt>문의</dt><dd>' + (k.dept || '') + '</dd></div>' +
      '<div><dt>이메일</dt><dd>' + (k.email || '') + '</dd></div>' +
      '</dl></div>' +
      '<div class="container footer__notice">' + (C.notice || '') + '</div>';
  }

  function bind() {
    var root = document.documentElement;
    var themeBtn = document.getElementById('themeBtn');
    var menuBtn = document.getElementById('menuBtn');
    var nav = document.getElementById('nav');

    function sync() {
      var dark = root.getAttribute('data-theme') === 'dark';
      themeBtn.setAttribute('aria-pressed', dark);
      themeBtn.setAttribute('aria-label', dark ? '라이트 모드로 전환' : '다크 모드로 전환');
    }
    themeBtn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      sync();
    });
    sync();

    menuBtn.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', open);
    });
  }

  var header = document.getElementById('header');
  var footer = document.getElementById('footer');
  if (header) { renderHeader(header); bind(); }
  if (footer) renderFooter(footer);
})();
