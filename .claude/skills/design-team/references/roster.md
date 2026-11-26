# 디자인 팀 명단

디자이너는 자리 하나에 스킬 하나, Claude 한 명이다. 세션의 스킬 목록에 없는 스킬은 그 회차에서 빠진다. 새 디자인
스킬이 생기면 여기에 자리를 더한다.

- **약칭**: 제안 ID 앞에 붙는다. 예: `취향-2`.
- **파일**: 런 폴더 안에서 그 자리가 쓰는 파일 이름이다. 예: `r1/taste.md`, `feedback/taste.md`.

## 팀장 (늘 1명)

| 자리 | 파일 | 스킬 | 하는 일 |
|---|---|---|---|
| 팀장 | lead | 없음 (디자인 스킬을 불러오지 않는다) | 쟁점마다 판정, 디자이너별 피드백, 최종 결정, 결과 검토 |

## 디자이너: 상시 자리 (화면 디자인 요청이면 앉는다)

| 자리 | 약칭 | 파일 | 스킬 | 보는 것 |
|---|---|---|---|---|
| 취향 | 취향 | taste | `design-taste-frontend` | AI 티·템플릿 티 없는 완성도, 하나의 시스템, 실제 자료 |
| 미감 | 미감 | aesthetic | `frontend-design:frontend-design` | 뚜렷한 미적 방향, 타이포, 뻔한 기본값 피하기 |
| 디자인 엔지니어 | 디엔 | design-eng | `audit-suite:audit-as-design-eng` | 시각 일관성, 토큰, 상태, 다크 모드, 디자인 시스템 위반 |
| UX | UX | ux | `audit-suite:audit-as-ux-eng` | 흐름, 멘탈 모델, 피드백, 오류·빈 상태 |
| 접근성 엔지니어 (거부권) | 접근 | a11y-eng | `audit-suite:audit-as-a11y-eng` | 키보드, 포커스, 스크린리더, ARIA |
| 접근성 감사 (거부권) | 감사 | a11y-wcag | `design:accessibility-review` | WCAG 2.1 AA: 대비, 터치 크기, 대체 텍스트 |
| 디자인 엔지니어링 | 엔지 | emil | `audit-suite:emil-design-engineering` | 입력, 터치, 폰트 렌더링, 레이아웃 흔들림, 성능 |
| 디테일 | 디테일 | polish | `audit-suite:make-interfaces-feel-better` | 그림자, 모서리, 정렬, 숫자 폭, 작은 상호작용 |
| 가이드라인 | 가이드 | guidelines | `audit-suite:web-design-guidelines` | 웹 인터페이스 가이드라인 준수 |
| 비평가 | 비평 | critique | `design:design-critique` | 사용성, 위계, 일관성 |
| 시스템 | 시스템 | system | `design:design-system` | 토큰, 변형, 이름 규칙, 재사용 |

## 디자이너: 조건부 자리 (과제가 닿을 때 앉는다)

| 자리 | 약칭 | 파일 | 스킬 | 앉는 때 |
|---|---|---|---|---|
| 모션 | 모션 | motion | `audit-suite:web-animation-design` | 화면에 전환, 움직임, 누름 반응이 있을 때 (PREVIO는 거의 항상) |
| 카피 | 카피 | copy | `design:ux-copy` | 버튼, 안내, 빈 상태, 오류 문구가 있을 때 (거의 항상) |
| 휴대폰 화면 | 폰화면 | ios-screens | `mobile-app-design:ios-screens` | 휴대폰에서 쓰는 화면일 때 (PREVIO는 항상) |
| 휴대폰 검토 | 폰검토 | ios-review | `mobile-app-design:ios-review` | 휴대폰 화면을 고치거나 검토할 때 |
| 휴대폰 흐름 | 폰흐름 | ios-flows | `mobile-app-design:ios-flows` | 여러 단계 흐름(첫 실행, 가입, 권한, 설정, 결제)을 다룰 때 |
| 첫 실행 | 온보딩 | onboarding | `mobile-app-design:onboarding` | 첫 실행·튜토리얼 흐름일 때 |
| 결제 화면 | 결제 | paywall | `mobile-app-design:paywall` | 구독·결제 화면일 때 |
| 화면 검토 | 화면검토 | review-screen | `mobile-app-design:review-screen` | 휴대폰 화면 하나를 검토해 달라고 할 때 |
| 카드 취향 | 카드 | card-taste | `anthropic-skills:card-taste` | 포스터, 카드, 썸네일, 인쇄용 콘티처럼 정적인 이미지 레이아웃일 때 |
| 데이터 시각화 | 차트 | dataviz | `dataviz` | 차트, 그래프, 계기, 지표가 있을 때 |
| 아티팩트 | 아티팩트 | artifact | `artifact-design` | 결과물이 아티팩트 페이지일 때 |
| 다이어그램 | 도식 | diagram | `artifact-diagramming` | 다이어그램을 그릴 때 |
| 개발 전달 | 전달 | handoff | `design:design-handoff` | 개발 전달 명세를 만들 때 |
| 사용자 조사 | 조사 | research | `design:user-research` | 조사 계획이나 사용성 테스트가 필요할 때 |
| 조사 종합 | 종합 | synthesis | `design:research-synthesis` | 인터뷰, 설문, 피드백 자료가 주어졌을 때 |

## 빠르게 명단 (디자이너 6명과 팀장)

비평, 시스템, 감사(거부권), 취향, 미감, 그리고 과제에 가장 직접 닿는 자리 하나(모션, 카피, 폰화면 중에서 고름).
팀장은 빠르게에서도 앉는다.

## 자리가 아닌 스킬

같은 일을 자리들이 이미 나눠 맡고 있거나, 디자인이 아닌 스킬이다.

- `audit-suite:full-audit`: 감사 렌즈 10개를 혼자 다 돌린다. 각 렌즈가 이미 자리를 갖고 있다.
- 엔지니어링 렌즈: `audit-suite:audit-as-frontend-eng`, `audit-as-backend-eng`, `audit-as-perf-eng`,
  `audit-as-prod-readiness`, `audit-as-repo-maintainer`, `audit-as-structural-eng`, `audit-as-dx-eng`,
  `audit-suite:vercel-react-best-practices`
- 미디어 생성(`creative-claw:*`, `anthropic-skills:ai-video-neutral`), 문서(`docx`, `pdf`, `pptx`, `xlsx`),
  `korean-only`
