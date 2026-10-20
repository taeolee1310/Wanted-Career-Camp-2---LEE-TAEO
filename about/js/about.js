/* 캠프소개 페이지 렌더링.
   모든 문구·날짜·숫자는 window.CAMP(content/data.js ← docs/company.md)에서 읽는다.
   날짜는 schedule에서만 가져오고, 요일·D-day·모집 상태는 KST 기준으로 계산한다. */
(function () {
  const C = window.CAMP;
  if (!C) return;

  const $ = (sel) => document.querySelector(sel);
  const esc = (s) => String(s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

  /* ---------- 날짜 (KST) ---------- */
  const date = (id) => C.schedule.find((d) => d.id === id);

  // 'YYYY-MM-DD' 또는 'YYYY-MM-DDTHH:MM'을 KST 시각의 Date로
  function toKst(value) {
    const [d, t = '00:00'] = value.split('T');
    return new Date(`${d}T${t}:00+09:00`);
  }

  // 26.11.02(월) 18:00 형식
  function fmt(value) {
    const [d, t] = value.split('T');
    const [y, m, day] = d.split('-').map(Number);
    const dow = DAYS[new Date(Date.UTC(y, m - 1, day)).getUTCDay()];
    const base = `${String(y).slice(2)}.${String(m).padStart(2, '0')}.${String(day).padStart(2, '0')}(${dow})`;
    return t ? `${base} ${t}` : base;
  }

  const fmtRange = (d) => (d.end ? `${fmt(d.start)} ~ ${fmt(d.end)}` : fmt(d.start));

  // 오늘(KST) 자정 기준 남은 일수
  function daysUntil(value) {
    const nowKst = new Date(Date.now() + 9 * 3600 * 1000);
    const today = Date.UTC(nowKst.getUTCFullYear(), nowKst.getUTCMonth(), nowKst.getUTCDate());
    const [y, m, d] = value.split('T')[0].split('-').map(Number);
    return Math.round((Date.UTC(y, m - 1, d) - today) / 86400000);
  }

  /* ---------- 공통 값 ---------- */
  const campTitle = `${C.camp.name} ${C.camp.round}기`;
  const totalWeeks = C.roadmap[C.roadmap.length - 1].to;
  const months = totalWeeks / 4;
  const open = date('date-open');
  const close = date('date-close');
  const start = date('date-start');
  const end = date('date-end');
  const offline = ['date-start', 'date-demo', 'date-end'].map(date);

  const bind = {
    'camp-title': campTitle,
    positioning: C.camp.positioning,
    definition: C.camp.definition,
    partner: C.camp.partner,
    'apply-label': C.camp.applyLabel,
    'total-weeks': `${totalWeeks}주`,
    period: `${fmt(start.start)} 개강 → ${fmt(end.start)} 수료 · 정원 ${C.camp.capacity}명`,
    'stats-asof': C.stats.asOf,
    proof: `증빙 제출: ${C.eligibility.proof}`,
    notice: C.notice
  };
  document.querySelectorAll('[data-bind]').forEach((el) => {
    const v = bind[el.dataset.bind];
    if (v != null) el.textContent = v;
  });

  /* ---------- 모집 상태 · D-day ---------- */
  const status = $('#recruit-status');
  const applyBtn = $('#apply-btn');
  const now = Date.now();
  if (now < toKst(open.start).getTime()) {
    status.innerHTML = `모집 예정 · <strong>${fmt(open.start)}</strong> 접수 시작`;
  } else if (now < toKst(close.start).getTime()) {
    const left = daysUntil(close.start);
    status.innerHTML = `모집 중 · <strong>${left === 0 ? 'D-DAY' : `D-${left}`}</strong> · ${fmt(close.start)} 마감`;
  } else {
    status.textContent = `모집 마감 · ${fmt(close.start)}에 접수를 마감했습니다`;
    applyBtn.setAttribute('aria-disabled', 'true');
    applyBtn.textContent = '모집 마감';
  }

  /* ---------- 과정 한눈에 ---------- */
  $('#overview-list').innerHTML = C.overview.map((o, i) => `
    <article class="card">
      <span class="card__num">${String(i + 1).padStart(2, '0')}</span>
      <h3>${esc(o.name)}</h3>
      <p>${esc(o.text)}</p>
    </article>`).join('');

  $('#phase-list').innerHTML = C.roadmap.map((p) => `
    <li id="${p.id}">
      <span class="caption">${p.from}–${p.to}주</span>
      <strong>${esc(p.name)}</strong>
    </li>`).join('');

  /* ---------- 혜택 ---------- */
  $('#benefit-list').innerHTML = C.benefits.map((b, i) => {
    let value = b.value;
    let calc = b.detail;
    if (b.monthly) {
      // 월 수당 × 개월 = 최대 총액
      value = `월 최대 ${b.monthly}만 원`;
      calc = `${b.monthly}만 원 × ${months}개월 = 최대 ${b.monthly * months}만 원`;
    }
    const cond = b.condition && b.condition !== '—' ? `<p class="caption">조건: ${esc(b.condition)}</p>` : '';
    return `
    <article class="card card--line${i < 2 ? ' benefit--feature' : ''}" id="${b.id}">
      <h3>${esc(b.name)}</h3>
      <p class="benefit__value">${esc(value)}</p>
      <p class="benefit__calc">${esc(calc)}</p>
      ${cond}
    </article>`;
  }).join('');

  /* ---------- 강사·멘토 (사진 없음 → 이니셜) ---------- */
  $('#people-list').innerHTML = C.people.map((p) => {
    const lead = p.id.startsWith('lecturer');
    return `
    <article class="person${lead ? ' person--lead' : ''}" id="${p.id}">
      <div class="person__head">
        <span class="avatar" role="img" aria-label="${esc(p.role)} ${esc(p.name)}">${esc(p.name.charAt(0))}</span>
        <div>
          <p class="person__role">${esc(p.role)}</p>
          <h3>${esc(p.name)}</h3>
        </div>
      </div>
      <div>
        <dl>
          <dt>현직</dt><dd>${esc(p.now)}</dd>
          <dt>전직</dt><dd>${esc(p.prev)}</dd>
        </dl>
        <p>${esc(p.bio)}</p>
      </div>
    </article>`;
  }).join('');

  /* ---------- 사용 도구 ---------- */
  $('#tool-list').innerHTML = C.tools.map((t) => `
    <li><strong>${esc(t.name)}</strong><span>${esc(t.text)}</span></li>`).join('');

  /* ---------- 운영 실적 ---------- */
  $('#stat-list').innerHTML = C.stats.items.map((s) => `
    <div>
      <dt>${esc(s.label)}${s.note ? `<span class="caption">${esc(s.note)}</span>` : ''}</dt>
      <dd>${esc(s.value)}</dd>
    </div>`).join('');

  /* ---------- 참가 자격·교육 안내 ---------- */
  $('#condition-list').innerHTML = C.eligibility.conditions.map((c) => `<li>${esc(c)}</li>`).join('');

  const info = [
    ['기간', `${fmt(start.start)} ~ ${fmt(end.start)}`, `총 ${totalWeeks}주`],
    ['시간', C.eligibility.time, ''],
    ['방식', C.eligibility.mode, `오프라인: ${offline.map((d) => `${d.label} ${fmt(d.start)}`).join(' · ')}`],
    ['장소', C.location.name, C.location.address],
    ['정원', `${C.camp.capacity}명`, `대상 직군: ${C.camp.jobs.join(' · ')}`]
  ];
  $('#info-list').innerHTML = info.map(([k, v, sub]) => `
    <div><dt>${k}</dt><dd>${esc(v)}${sub ? `<span class="caption">${esc(sub)}</span>` : ''}</dd></div>`).join('');

  /* ---------- 신청 방법 ---------- */
  $('#step-list').innerHTML = C.apply.map((s) => {
    const d = date(s.ref);
    return `
    <li id="${s.id}">
      <h3>${esc(s.name)}</h3>
      <time datetime="${d.start}">${s.prefix || ''}${fmtRange(d)}</time>
      <p>${esc(s.text)}</p>
    </li>`;
  }).join('');

  // 신청 버튼은 가상(#). 실제 접수는 일어나지 않는다.
  applyBtn.addEventListener('click', (e) => {
    e.preventDefault();
    $('#apply-note').textContent = `수업용 가상 페이지라 실제 접수는 진행되지 않습니다. 문의: ${C.contact.dept} ${C.contact.email}`;
  });

  /* ---------- FAQ (하나만 열림) ---------- */
  const faq = $('#faq-list');
  faq.innerHTML = C.faq.map((f) => `
    <details id="${f.id}">
      <summary>${esc(f.q)}</summary>
      <p>${esc(f.a)}</p>
    </details>`).join('');
  faq.querySelectorAll('details').forEach((d) => {
    d.addEventListener('toggle', () => {
      if (!d.open) return;
      faq.querySelectorAll('details[open]').forEach((o) => { if (o !== d) o.open = false; });
    });
  });

  /* ---------- 푸터 ---------- */
  const rows = (list) => list.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('');
  $('#footer-company-list').innerHTML = rows([
    ['회사명', `${C.company.name} (${C.company.nameEn})`],
    ['대표', C.company.ceo],
    ['소재지', C.company.address],
    ['연락처', `${C.contact.email} / ${C.contact.phone}`]
  ]);
  $('#footer-contact-list').innerHTML = rows([
    ['담당 부서', C.contact.dept],
    ['이메일', C.contact.email],
    ['전화', C.contact.phone],
    ['응답 시간', C.contact.hours]
  ]);

  /* ---------- 모바일 메뉴 ---------- */
  const toggle = $('.gnav__toggle');
  const links = $('#gnav-links');
  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', isOpen);
  });
})();
