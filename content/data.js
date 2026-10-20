/* docs/company.md의 값을 화면이 읽을 수 있게 옮긴 파일. (원천: docs/careercamp.json)
   사실이 바뀌면 company.md를 먼저 고치고, 같은 PR에서 이 파일을 맞춘다.
   날짜는 schedule에서만 정의한다. */
window.CAMP = {
  notice: '원티드랩 AI 네이티브 커리어 캠프 2기 모집 페이지(event.wanted.co.kr, 2026-10-20 수집)를 바탕으로 만든 수업용 페이지입니다. 신청 버튼은 실제로 접수되지 않습니다.',

  company: {
    name: '원티드랩'
  },

  camp: {
    name: 'AI 네이티브 커리어 캠프',
    round: 2,
    tagline: '수강료 0원 · 매월 60만 원 지급 · 선착순 45명',
    definition: 'AI 활용 역량과 실전 포트폴리오를 동시에 갖추는 커리어 캠프',
    capacity: 45,
    jobs: ['PO', '개발', '디자인', '마케팅', 'HR'],
    applyLabel: '지원서 작성하기'
  },

  applyForm: {
    title: '지원서 작성',
    lead: '아래 내용을 적어 주세요. 신청서를 검토한 뒤 온라인 인터뷰 일정을 개별로 안내해 드려요.',
    labels: { name: '이름', email: '이메일', phone: '연락처', job: '희망 직군', motive: '지원 동기' },
    placeholders: { name: '홍길동', email: 'name@example.com', phone: '010-0000-0000', motive: '캠프에서 만들고 싶은 결과물과 지원 이유를 적어 주세요.' },
    jobPlaceholder: '직군을 선택해 주세요',
    consent: '수업용 데모라 입력한 정보는 전송·저장되지 않는다는 점을 확인했어요.',
    closedNote: '모집은 마감됐지만, 수업용 페이지라 지원서 작성을 체험해 볼 수 있어요.',
    submit: '제출하기',
    cancel: '취소',
    close: '닫기',
    error: '비어 있거나 형식이 맞지 않는 항목이 있어요. 표시된 칸을 확인해 주세요.',
    doneTitle: '지원서가 접수되었어요',
    doneText: '{name}님, 신청서를 검토한 뒤 개별로 연락드려요.',
    doneNote: '가상 접수예요. 입력한 정보는 어디로도 전송되지 않았어요.'
  },

  schedule: [
    { id: 'date-close', label: '모집 마감', start: '2026-09-30T13:00', mode: '온라인 (조기 마감 가능)' },
    { id: 'date-start', label: '개강', start: '2026-10-06', mode: '오프라인' },
    { id: 'date-end', label: '수료', start: '2027-01-29', mode: '오프라인 (수료식)' }
  ],

  roadmap: [
    { id: 'phase-01', name: '직무훈련', from: 1, to: 2, output: '취업 장벽 진단서, 직군별 AI 유즈케이스, AI 도구 체인 초안' },
    { id: 'phase-02', name: 'AI 교육', from: 3, to: 8 },
    { id: 'phase-03', name: 'AI 실전 적용', from: 9, to: 9 },
    { id: 'phase-04', name: '직군 맞춤 AI 포트폴리오 제작 · 발표', from: 10, to: 15 },
    { id: 'phase-05', name: '취업 지원', from: 16, to: 16 }
  ],

  benefits: [
    { id: 'benefit-01', name: '참여자 수당', monthly: 60, condition: '매월 출석률에 따라 지급' },
    { id: 'benefit-02', name: '교육 장비', value: 'RTX 4070 AI 최적화 고사양 노트북', detail: '교육 기간 내내 무상 사용' },
    { id: 'benefit-03', name: '커리어 코칭', value: '40시간', detail: '전담 커리어 코치 특강 및 1:1 코칭' },
    { id: 'benefit-04', name: 'AI 툴 지원', value: '50만 원 상당 구독', detail: 'Claude(Max), Ennoia(원티드 AI 에이전트 플랫폼)' },
    { id: 'benefit-05', name: 'Claude VOD', value: '10시간 분량 (15만 원 상당)', detail: 'Claude 활용법부터 실무 적용까지 단계별 학습' }
  ],

  people: [
    { id: 'lecturer-ai', name: '신영희', role: 'AI 전문 강사', now: '직업훈련 전문강사 (직훈교사 자격 보유)', prev: '기업 대상 AI 전환(AX) 컨설팅 및 n8n 기반 업무 자동화 솔루션 지도' },
    { id: 'mentor-ai', name: '정기수', role: 'AI 멘토', now: '원티드랩 AI부문 부문장', prev: '카카오뱅크 머신러닝 엔지니어' },
    { id: 'mentor-po', name: '장수지', role: 'PO 멘토', now: '원티드랩 Product Owner', prev: '11년 차 Product Owner' },
    { id: 'mentor-dev', name: '장원진', role: '개발 멘토', now: '원티드랩 AI 플랫폼팀 엔지니어', prev: '신사업 담당 서버 엔지니어' },
    { id: 'mentor-design', name: '이지수', role: '디자인 멘토', now: '원티드랩 시니어 디자이너', prev: 'NBT 프로덕트 디자이너' },
    { id: 'mentor-marketing', name: '김경수', role: '마케팅 멘토', now: '원티드랩 마케팅팀 파트장', prev: '튜터링·패스트캠퍼스 퍼포먼스 마케터' },
    { id: 'mentor-hr', name: '정보미', role: 'HR 멘토', now: '원티드랩 피플팀 팀장', prev: '스마일게이트 HR' }
  ],

  tools: [
    { name: 'Claude', text: '직군에 상관없이 프롬프트 설계부터 문서 작성, 포트폴리오 보완까지 매일 쓰는 AI 도구' },
    { name: 'Ennoia', text: '원티드랩이 자체 개발한 AI 에이전트 플랫폼으로, 나만의 에이전트를 직접 만들 수 있어요.' }
  ],

  stats: {
    asOf: '2026년 5월 포텐업 AI 트랙 기준',
    items: [
      { label: '연간 IT·AI 인재 양성', value: '300명+', note: '고용노동부 KDT 훈련기관' },
      { label: '완주율', value: '88%' },
      { label: '교육 만족도', value: '4.7 / 5' },
      { label: 'AI 교육 취업률', value: '80%' }
    ]
  },

  eligibility: {
    conditions: [
      '만 34세 이하 청년',
      '최근 1년간 고용보험 미가입자',
      '1년 이상 구직 활동 중인 미취업자',
      'PO, 개발, 디자인, 마케팅, HR 직군을 희망하는 분'
    ],
    proof: '최종 합격자에 한해 증빙 서류를 제출해야 해요.',
    time: '평일 오전 10시 ~ 오후 7시 (멘토링 일정에 따라 일부 변경 가능)',
    mode: '온라인 (개강일·수료식 오프라인)'
  },

  apply: [
    { id: 'step-01', name: '온라인 지원', ref: 'date-close', text: '청년 일경험포털에서 신청서를 제출해요.', prefix: '~ ' },
    { id: 'step-02', name: '온라인 인터뷰', text: '신청서를 검토한 뒤 개별로 연락드려요. 인터뷰는 Google Meet로 약 30분 진행해요.' },
    { id: 'step-03', name: '최종 합격 발표', text: '합격자에게 개별로 안내하고, 참가 자격 증빙 서류를 받아요.' },
    { id: 'step-04', name: '교육 시작', ref: 'date-start', text: '오프라인 개강으로 시작해요.' }
  ],

  faq: [
    { id: 'faq-01', q: '참가비가 있나요?', a: '수강료는 전액 무료예요. 매월 출석률에 따라 최대 60만 원의 수당이 지급되고, 노트북과 AI 툴도 무상으로 지원해요.' },
    { id: 'faq-02', q: '풀타임으로 참여해야 하나요?', a: '네, 평일 오전 10시부터 오후 7시까지 온라인 풀타임으로 참여해야 해요.' },
    { id: 'faq-03', q: 'AI나 프로그래밍을 전혀 몰라도 참여할 수 있나요?', a: '가능해요. AI 툴 사용법부터 단계적으로 배우는 과정이에요.' },
    { id: 'faq-04', q: '부트캠프를 이미 수료했는데 또 참여해도 되나요?', a: '직무 교육을 다시 제공하는 과정이 아니라, AI로 실무 수준의 포트폴리오를 완성하는 과정이에요. 자격을 충족하면 지원할 수 있어요.' }
  ],

  contact: { dept: '미래내일 일경험(ESG지원형) 전담 커리어사업팀', email: 'learning@wantedlab.com' },

  location: {
    name: '원티드그라운드',
    address: '서울시 송파구 백제고분로 37길 22, 원티드그라운드'
  }
};
