# 디자인 팀 명단

디자이너는 **스킬을 받아 온 출처(플러그인, 저장소) 하나**를 맡는다. 같은 곳에서 받은 스킬은 한 회사가 역할을 나눠 만든
세트라 서로 보완하는 관계여서, 한 디자이너가 함께 든다. 출처가 다르면 세계관이 달라서, 회의에서는 출처끼리 싸운다
(예: 절제와 실제 사진을 앞세우는 taste-skill 대 과감한 개성을 미는 `frontend-design`).

이 세션의 디자인 스킬은 23개다. 받아 온 출처 6곳의 스킬 20개와 Claude Code 기본 내장 3개(`dataviz`, `artifact-design`,
`artifact-diagramming`)다. `mobile-app-design`의 첫 실행·결제 화면·화면 검토는 스킬이 아니라 그 플러그인 스킬을 불러 쓰는
명령어라 세지 않는다. 새 디자인 스킬을 설치하면 출처를 확인해 그 출처의 자리에 더하거나 새 자리를 만든다.

- **약칭**: 제안 ID 앞에 붙는다. 예: `취향-2`.
- **파일**: 런 폴더 안에서 그 자리가 쓰는 파일 이름이다. 예: `r1/taste.md`, `feedback/taste.md`.

## 팀장 (늘 1명)

| 자리 | 파일 | 스킬 | 하는 일 |
|---|---|---|---|
| 팀장 | lead | 없음 (디자인 스킬을 불러오지 않는다) | 쟁점마다 판정, 디자이너별 피드백, 최종 결정, 구현 결과 검토 |

## 디자이너 (출처 하나에 한 자리)

| 자리 | 약칭 | 파일 | 출처 (만든 곳) | 늘 불러오는 스킬 | 과제가 닿을 때 더 불러오는 스킬 |
|---|---|---|---|---|---|
| 취향 | 취향 | taste | taste-skill (Leonxlnx) | `design-taste-frontend` | |
| 프런트 디자인 | 프런트 | frontend | `frontend-design` 플러그인 (Anthropic) | `frontend-design:frontend-design` | |
| 디자인 | 디자인 | design | `design` 플러그인 (Anthropic) | `design:design-critique`, `design:design-system`, `design:accessibility-review`, `design:ux-copy` | `design:design-handoff`: 개발 전달 명세 / `design:user-research`: 조사 계획·사용성 테스트 / `design:research-synthesis`: 조사 자료 종합 |
| 감사 (2명, 대표 1명만 회의에 나온다) | 감사 | audit | `audit-suite` 플러그인 (Orbit) | 대표: `audit-suite:audit-as-design-eng`, `audit-suite:audit-as-ux-eng`, `audit-suite:audit-as-a11y-eng` / 보조: `audit-suite:emil-design-engineering`, `audit-suite:make-interfaces-feel-better`, `audit-suite:web-animation-design`, `audit-suite:web-design-guidelines` | |
| 휴대폰 | 폰 | mobile | `mobile-app-design` 플러그인 (UXKIN) | `mobile-app-design:ios-screens`, `mobile-app-design:ios-review` | `mobile-app-design:ios-flows`: 여러 단계 흐름(첫 실행, 가입, 권한, 설정, 결제) |
| 카드 취향 | 카드 | card-taste | 사용자가 직접 만든 스킬 | `anthropic-skills:card-taste` | 이 자리는 포스터, 카드, 썸네일, 인쇄용 콘티처럼 정적인 이미지일 때만 앉는다 |
| 기본 내장 | 내장 | builtin | Claude Code 기본 | 없음 (과제가 닿을 때만 앉는다) | `dataviz`: 차트·지표 / `artifact-design`: 아티팩트 페이지 / `artifact-diagramming`: 다이어그램 |

스킬 수: 취향 1, 프런트 디자인 1, 디자인 7, 감사 7(대표 3, 보조 4), 휴대폰 3, 카드 취향 1, 기본 내장 3. 합계 23.

### 감사 자리는 두 명이 일하고 한 명이 말한다

`audit-suite` 스킬 7개는 한 명이 읽기에 많아서, 대표와 보조 두 명이 나눠 든다.

- **1라운드**: 대표와 보조가 다른 디자이너들과 동시에 각자 분석한다. 보조는 회의용 제안서가 아니라 대표에게 줄 메모
  (`r1/audit-notes.md`)를 쓴다. 둘이 끝나면 진행자가 대표에게 메모를 합쳐 감사 자리의 제안서 하나(`r1/audit.md`)를 확정하게
  한다.
- **2라운드부터**: 회의에는 대표만 나온다. 반론, 3라운드 수정, 이의 제기 모두 대표가 하나의 목소리로 한다. 보조는 다시
  부르지 않는다. 대표는 보조의 메모를 근거로 쓸 수 있다.

### 거부권

접근성 스킬이 두 출처에 하나씩 있다. **디자인 자리**(`design:accessibility-review`)와 **감사 대표**
(`audit-suite:audit-as-a11y-eng`)가 둘 다 거부권을 가진다.

## 누가 앉는가

- **화면 디자인 요청**: 취향, 프런트 디자인, 디자인, 감사(대표와 보조), 휴대폰. Claude는 6명, 회의에서 말하는 디자이너는
  5명이다. PREVIO는 휴대폰 가로 화면이 기본이라 휴대폰 자리는 늘 앉는다.
- **조건부**: 카드 취향과 기본 내장 자리는 표의 조건에 닿을 때만 앉는다. 조건부 스킬은 진행자가 과제를 보고 고르고,
  무엇을 왜 더하거나 뺐는지 `brief.md`의 팀 표에 적는다.
- **빠르게**: 취향, 프런트 디자인, 디자인. 3명이다(감사 대표의 접근성 거부권은 디자인 자리가 대신 지킨다).
- **전원**: 모든 자리, 조건부 스킬까지 모두.

## 자리가 아닌 스킬

- `audit-suite:full-audit`: 감사 렌즈 10개를 혼자 다 돌린다. 디자인 렌즈는 이미 감사 자리에 들어 있다.
- `audit-suite`의 엔지니어링 렌즈: `audit-as-frontend-eng`, `audit-as-backend-eng`, `audit-as-perf-eng`,
  `audit-as-prod-readiness`, `audit-as-repo-maintainer`, `audit-as-structural-eng`, `audit-as-dx-eng`,
  `vercel-react-best-practices`
- 미디어 생성(`creative-claw:*`, `anthropic-skills:ai-video-neutral`), 문서(`docx`, `pdf`, `pptx`, `xlsx`),
  `korean-only`, 이 스킬(`design-team`) 자신
