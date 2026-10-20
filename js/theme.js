/* 첫 화면이 깜빡이지 않도록 <head>에서 바로 실행한다.
   저장된 선택이 없으면 시스템 설정을 따른다. */
(function () {
  var t = null;
  try { t = localStorage.getItem('theme'); } catch (e) {}
  if (t !== 'dark' && t !== 'light') {
    t = window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.setAttribute('data-theme', t);
})();
