# 디자인 팀 명단

이 세션에서 쓸 수 있는 디자인 스킬은 26개다. 사용자가 설치하거나 추가한 스킬이 23개, Claude Code에 기본으로 들어 있는
스킬이 3개(`dataviz`, `artifact-design`, `artifact-diagramming`)다. 26개 모두 아래 자리 중 하나에 들어 있다.
세션의 스킬 목록에 없는 스킬은 그 회차에서 빼고, 새 디자인 스킬이 생기면 맞는 묶음에 더한다.

스킬은 관점에 따라 여섯 묶음과 특수 과제로 나뉜다. **묶음 안의 스킬끼리 의견이 실제로 갈리는 묶음(미감, 사용성,
디테일·모션)은 스킬마다 디자이너 한 명씩 따로 앉혀 서로 싸우게 한다.** 거의 같은 말을 하는 점검표 성격의 묶음(시스템,
접근성, 휴대폰)은 디자이너 한 명이 묶음의 스킬을 모두 든다. 나눠 앉혀 봐야 같은 지적이 두 번 나오고 비용만 늘기 때문이다.

- **약칭**: 제안 ID 앞에 붙는다. 예: `취향-2`.
- **파일**: 런 폴더 안에서 그 자리가 쓰는 파일 이름이다. 예: `r1/taste.md`, `feedback/taste.md`.

## 팀장 (늘 1명)

| 자리 | 파일 | 스킬 | 하는 일 |
|---|---|---|---|
| 팀장 | lead | 없음 (디자인 스킬을 불러오지 않는다) | 쟁점마다 판정, 디자이너별 피드백, 최종 결정, 구현 결과 검토 |

## 나눠 앉는 묶음 (스킬 하나에 디자이너 한 명, 같은 묶음끼리 싸운다)

| 묶음 | 자리 | 약칭 | 파일 | 스킬 | 앉는 때 |
|---|---|---|---|---|---|
| 미감 | 취향 | 취향 | taste | `design-taste-frontend` | 화면 디자인 요청이면 늘 |
| 미감 | 미적 방향 | 미적 | aesthetic | `frontend-design:frontend-design` | 늘 |
| 미감 | 카드 취향 | 카드 | card-taste | `anthropic-skills:card-taste` | 포스터, 카드, 썸네일, 인쇄용 콘티처럼 정적인 이미지일 때 |
| 사용성 | 비평 | 비평 | critique | `design:design-critique` | 늘 |
| 사용성 | UX | UX | ux | `audit-suite:audit-as-ux-eng` | 늘 |
| 사용성 | 카피 | 카피 | copy | `design:ux-copy` | 늘 (화면에 글이 없으면 뺀다) |
| 디테일·모션 | 다듬기 | 다듬기 | polish | `audit-suite:make-interfaces-feel-better` | 늘 |
| 디테일·모션 | 엔지니어링 | 엔지 | emil | `audit-suite:emil-design-engineering` | 늘 |
| 디테일·모션 | 모션 | 모션 | motion | `audit-suite:web-animation-design` | 늘 (움직임이 전혀 없는 과제면 뺀다) |

## 묶어 앉는 묶음 (디자이너 한 명이 묶음의 스킬을 모두 든다)

| 묶음 | 자리 | 약칭 | 파일 | 늘 불러오는 스킬 | 과제가 닿을 때 더 불러오는 스킬 |
|---|---|---|---|---|---|
| 시스템 | 시스템 | 시스템 | system | `design:design-system`, `audit-suite:audit-as-design-eng`, `audit-suite:web-design-guidelines` | |
| 접근성 | 접근성 (거부권) | 접근 | a11y | `audit-suite:audit-as-a11y-eng`, `design:accessibility-review` | |
| 휴대폰 | 휴대폰 | 폰 | mobile | `mobile-app-design:ios-screens`, `mobile-app-design:ios-review` | `mobile-app-design:ios-flows`: 여러 단계 흐름 / `mobile-app-design:onboarding`: 첫 실행·튜토리얼 / `mobile-app-design:paywall`: 구독·결제 / `mobile-app-design:review-screen`: 휴대폰 화면 하나 검토 |
| 특수 과제 | 특수 | 특수 | special | 없음 (과제가 닿을 때만 앉는다) | `dataviz`: 차트·지표 / `artifact-design`: 아티팩트 페이지 / `artifact-diagramming`: 다이어그램 / `design:design-handoff`: 개발 전달 명세 / `design:user-research`: 조사 계획·사용성 테스트 / `design:research-synthesis`: 조사 자료 종합 |

스킬 수: 미감 3, 사용성 3, 디테일·모션 3, 시스템 3, 접근성 2, 휴대폰 6, 특수 과제 6. 합계 26.

## 누가 앉는가

- **화면 디자인 요청**: 취향, 미적 방향, 비평, UX, 카피, 다듬기, 엔지니어링, 모션, 시스템, 접근성, 휴대폰. 11명이다.
  PREVIO는 휴대폰 가로 화면이 기본이라 휴대폰 자리는 늘 앉는다.
- **조건부**: 카드 취향과 특수 과제는 표의 조건에 닿을 때만 앉는다. 휴대폰과 특수 과제 자리의 조건부 스킬은 진행자가
  과제를 보고 고른다. 무엇을 왜 더하거나 뺐는지 `brief.md`의 팀 표에 적는다.
- **빠르게**: 취향, 미적 방향, 비평, 접근성. 4명이다. 미감 두 자리를 남겨 묶음 안의 싸움을 지킨다.
- **전원**: 모든 자리. 조건부 자리와 조건부 스킬까지 모두.

## 자리가 아닌 스킬

디자인이 아니거나, 같은 일을 자리들이 이미 나눠 맡고 있는 스킬이다.

- `audit-suite:full-audit`: 감사 렌즈 10개를 혼자 다 돌린다. 디자인 렌즈는 이미 자리마다 들어가 있다.
- 엔지니어링 렌즈: `audit-suite:audit-as-frontend-eng`, `audit-as-backend-eng`, `audit-as-perf-eng`,
  `audit-as-prod-readiness`, `audit-as-repo-maintainer`, `audit-as-structural-eng`, `audit-as-dx-eng`,
  `audit-suite:vercel-react-best-practices`
- 미디어 생성(`creative-claw:*`, `anthropic-skills:ai-video-neutral`), 문서(`docx`, `pdf`, `pptx`, `xlsx`),
  `korean-only`, 이 스킬(`design-team`) 자신
