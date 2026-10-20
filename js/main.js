(function () {
  'use strict';

  /* 상단 메뉴·다크 모드 토글·모바일 메뉴는 js/chrome.js가 모든 페이지에서 공통으로 처리한다 */

  /* 지원서 팝업 */
  var dlg = document.getElementById('applyDialog');
  var form = document.getElementById('applyForm');
  var done = document.getElementById('applyDone');
  var errBox = document.getElementById('applyError');
  var opener = null;

  function resetDialog() {
    form.reset();
    form.hidden = false;
    done.hidden = true;
    errBox.hidden = true;
    form.querySelectorAll('[aria-invalid]').forEach(function (el) { el.removeAttribute('aria-invalid'); });
  }

  document.addEventListener('click', function (e) {
    var open = e.target.closest('[data-apply]');
    if (open) {
      opener = open;
      resetDialog();
      dlg.showModal();
      document.body.classList.add('modal-open');
      return;
    }
    if (e.target.closest('[data-close]')) { dlg.close(); return; }
    if (e.target === dlg) dlg.close(); // 배경 클릭
  });

  dlg.addEventListener('close', function () {
    document.body.classList.remove('modal-open');
    if (opener) opener.focus();
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = null;
    form.querySelectorAll('input, select, textarea').forEach(function (el) {
      var ok = el.checkValidity();
      if (ok) el.removeAttribute('aria-invalid'); else { el.setAttribute('aria-invalid', 'true'); bad = bad || el; }
    });
    if (bad) {
      errBox.textContent = window.CAMP.applyForm.error;
      errBox.hidden = false;
      bad.focus();
      return;
    }
    done.querySelector('[data-name]').textContent = form.elements.name.value.trim();
    form.hidden = true;
    done.hidden = false;
  });

  var items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  items.forEach(function (el) { io.observe(el); });
})();
