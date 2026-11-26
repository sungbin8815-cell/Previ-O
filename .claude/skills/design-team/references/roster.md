# 디자인 팀 명단

디자이너는 관점 하나를 맡고, 그 관점의 디자인 스킬을 여러 개 들고 들어간다. 팀장은 스킬 없이 판정한다.

이 세션에서 쓸 수 있는 디자인 스킬은 26개다. 사용자가 설치하거나 추가한 스킬이 23개, Claude Code에 기본으로 들어 있는
스킬이 3개(`dataviz`, `artifact-design`, `artifact-diagramming`)다. 26개 모두 아래 자리 중 하나에 들어 있다.
세션의 스킬 목록에 없는 스킬은 그 회차에서 빼고, 새 디자인 스킬이 생기면 관점이 맞는 자리에 더한다.

- **약칭**: 제안 ID 앞에 붙는다. 예: `미감-2`.
- **파일**: 런 폴더 안에서 그 자리가 쓰는 파일 이름이다. 예: `r1/aesthetic.md`, `feedback/aesthetic.md`.

## 팀장 (늘 1명)

| 자리 | 파일 | 스킬 | 하는 일 |
|---|---|---|---|
| 팀장 | lead | 없음 (디자인 스킬을 불러오지 않는다) | 쟁점마다 판정, 디자이너별 피드백, 최종 결정, 구현 결과 검토 |

## 디자이너

| 자리 | 약칭 | 파일 | 늘 불러오는 스킬 | 과제가 닿을 때 더 불러오는 스킬 | 보는 것 |
|---|---|---|---|---|---|
| 미감 | 미감 | aesthetic | `design-taste-frontend`, `frontend-design:frontend-design` | `anthropic-skills:card-taste`: 포스터, 카드, 썸네일, 인쇄용 콘티처럼 정적인 이미지일 때 | AI 티·템플릿 티 없는 완성도, 뚜렷한 미적 방향, 타이포 |
| 사용성 | 사용 | usability | `design:design-critique`, `audit-suite:audit-as-ux-eng`, `design:ux-copy` | | 흐름, 위계, 피드백, 오류·빈 상태, 화면 문구 |
| 시스템 | 시스템 | system | `design:design-system`, `audit-suite:audit-as-design-eng`, `audit-suite:web-design-guidelines` | | 토큰, 부품 변형, 일관성, 웹 인터페이스 가이드라인 |
| 접근성 (거부권) | 접근 | a11y | `audit-suite:audit-as-a11y-eng`, `design:accessibility-review` | | 대비, 터치 크기, 키보드, 포커스, 스크린리더 |
| 디테일·모션 | 디테일 | craft | `audit-suite:make-interfaces-feel-better`, `audit-suite:emil-design-engineering`, `audit-suite:web-animation-design` | | 정렬, 그림자, 모서리, 숫자 폭, 누름 반응, 움직임의 이징과 시간 |
| 휴대폰 | 폰 | mobile | `mobile-app-design:ios-screens`, `mobile-app-design:ios-review` | `mobile-app-design:ios-flows`: 여러 단계 흐름 / `mobile-app-design:onboarding`: 첫 실행·튜토리얼 / `mobile-app-design:paywall`: 구독·결제 / `mobile-app-design:review-screen`: 휴대폰 화면 하나 검토 | 안전 영역, 터치 대상 크기, 시트, 한 손 조작, 가로·세로 |
| 특수 과제 | 특수 | special | 없음 (과제가 닿을 때만 앉는다) | `dataviz`: 차트·지표 / `artifact-design`: 아티팩트 페이지 / `artifact-diagramming`: 다이어그램 / `design:design-handoff`: 개발 전달 명세 / `design:user-research`: 조사 계획·사용성 테스트 / `design:research-synthesis`: 조사 자료 종합 | 그 과제의 전문 기준 |

스킬 수: 미감 3, 사용성 3, 시스템 3, 접근성 2, 디테일·모션 3, 휴대폰 6, 특수 과제 6. 합계 26.

## 누가 앉는가

- **화면 디자인 요청**: 미감, 사용성, 시스템, 접근성, 디테일·모션, 휴대폰. 6명이다. PREVIO는 휴대폰 가로 화면이 기본이라
  휴대폰 자리는 늘 앉는다.
- **특수 과제**: 표의 조건에 닿는 과제일 때만 7번째로 앉는다. 닿는 스킬만 불러온다.
- **조건부 스킬**: 진행자가 과제를 보고 고른다. 무엇을 왜 더 불러오게 했는지 `brief.md`의 팀 표에 적는다.
- **빠르게**: 미감, 사용성, 접근성, 그리고 과제에 가장 닿는 자리 하나. 4명이다.
- **전원**: 7자리 모두. 각 자리의 조건부 스킬까지 모두 불러온다.

## 자리가 아닌 스킬

디자인이 아니거나, 같은 일을 자리들이 이미 나눠 맡고 있는 스킬이다.

- `audit-suite:full-audit`: 감사 렌즈 10개를 혼자 다 돌린다. 디자인 렌즈는 이미 자리마다 들어가 있다.
- 엔지니어링 렌즈: `audit-suite:audit-as-frontend-eng`, `audit-as-backend-eng`, `audit-as-perf-eng`,
  `audit-as-prod-readiness`, `audit-as-repo-maintainer`, `audit-as-structural-eng`, `audit-as-dx-eng`,
  `audit-suite:vercel-react-best-practices`
- 미디어 생성(`creative-claw:*`, `anthropic-skills:ai-video-neutral`), 문서(`docx`, `pdf`, `pptx`, `xlsx`),
  `korean-only`, 이 스킬(`design-team`) 자신
