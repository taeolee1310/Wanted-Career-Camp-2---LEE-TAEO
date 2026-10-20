# 개발 규칙

| 항목 | 규칙 |
| --- | --- |
| 구조 | 정적 HTML + CSS + JS. 메인화면은 루트 `index.html`, 캠프소개는 `about/`, 오시는 길은 `location/`, 일정표는 `dayoff/` 폴더 |
| 콘텐츠 연동 | 화면 텍스트·날짜·숫자는 `content/data.js`에서 읽음. HTML과 JS에 하드코딩 금지 |
| 렌더링 | `js/render.js`가 메인화면의 헤더·본문·푸터를 그림. `js/main.js`는 메뉴·등장 효과만 담당. `about/`·`location/`·`dayoff/`는 각 폴더의 파일로 그림 |
| 날짜 처리 | 요일, D-day, 모집 상태(예정·중·마감)는 일정표 값으로 계산. 시간대는 KST |
| 디자인 토큰 | 색·글꼴·간격은 `css/style.css`의 `:root` 변수만 사용 (값은 `design/tokens.json`과 동일) |
| 명명 | 파일·폴더 `kebab-case`, 콘텐츠 ID는 `docs/company.md`의 ID와 동일 |
| 페이지 이동 | 메인화면·캠프소개·오시는 길 링크, 현재 페이지에 `aria-current="page"`, 키보드 이동 가능 |
| 푸터 | 전 페이지 공통. 회사 정보·가상 고지·문의처는 data.js에서 읽음 |
| 오시는 길 | 실제 지도 API 금지. 약도 이미지 + 텍스트 주소 |
| 외부 링크 | 신청 버튼은 `#`(가상). 실존 서비스로 연결 금지 |
| 접근성 | 이미지 alt 필수, 시맨틱 태그(`header`, `nav`, `main`, `footer`), 포커스 표시 유지 |
| 확인 | PR 전 데스크톱·태블릿·모바일 3구간 확인, 스크린샷 첨부 |

## 사실이 바뀔 때
1. `docs/company.md`를 먼저 고칩니다.
2. 같은 PR에서 `content/data.js`를 맞춥니다.
3. `docs/CHANGELOG.md`에 기록합니다.
