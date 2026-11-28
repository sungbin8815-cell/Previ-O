# ② 디자인 시스템 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 앱 전체를 첫 디자인 회의(렌즈 콘셉트)의 색·모서리·버튼 규칙과 SUIT 글꼴 한 벌로 통일한다. 회색 "모니터 카트" 색과 `cart`/`well` 테마를 걷어 낸다.

**Architecture:**
- Astryx 부품은 되살린 `lens` 테마 하나로 그린다(테마 편집기로 글꼴과 회의 값을 넣는다).
- 앱 자체 CSS는 `:root` 토큰을 렌즈 값으로 되돌리고, 무대만 어둡게 다시 정의하던 겹(`.stage,.pip,.home{…}`)을 없앤다. 앱 전체가 어두운 한 벌이 된다.
- 배치는 바꾸지 않는다. 배치는 ③ 단계에서 바꾼다.

**Tech Stack:** `index.html`(CSS `@layer app`), `ui/`(Astryx 0.7.17, `npx @astryxdesign/cli@0.7.17 experimental theme editor`), `tests/e2e`(node:test + Playwright)

**Spec:** `docs/superpowers/specs/2026-11-28-previo-pro-redesign-design.md` 8절, 기준 문서 `docs/superpowers/specs/2026-11-26-lens-meeting-decision.md` "최종 변경 목록" 1·2절

## Global Constraints

- 색 토큰:
  - 면: `--paper #0D0E0F`, `--sheet #151618`, `--raise #1C1D20`
  - 선: `--line #2A2C30`, `--line-strong #686B70`
  - 글: `--ink #ECEDEE`, `--ink2 #B6B8BC`, `--muted #8B8E94`, `--silver #AEB3BA`
  - 강조: `--accent #C9DD4F`, `--accent-ink #121309`
  - 경고·녹화: `--rec #E5483A`, `--danger-ink #E5675C`, `--caution #E3B341`
- 글꼴: SUIT(글), Archivo Narrow(숫자), 넓은 Archivo(로고). 자간을 벌린 대문자 없음. 글자 바닥 12px.
- 모서리:
  - 0: 붙은 면
  - 4: 썸네일·클립·미리보기
  - 6: 버튼·입력칸·메뉴·떠 있는 판
- 그림자: 메뉴·툴팁·알림·튜토리얼 말풍선에만 `--sh-float: 0 0 0 1px var(--line), 0 8px 24px rgba(0,0,0,.45)`. 반투명 유리(`.glass`) 없음.
- 버튼 세 종류:
  - 주요: 라임 채움 `--accent` / 글 `--accent-ink`
  - 보조: `--raise` 바탕 + 1px `--line-strong`
  - 글 버튼: 상자 없음
- 초점 표시: `outline: 2px solid var(--ink); outline-offset: 2px`
- 녹화 빨간 테두리는 전체 재생 중에만(`.app.anim`), 색은 `--rec`.
- 기존 요소의 id·class·data 속성은 지우거나 이름을 바꾸지 않는다. `ui/`를 고치면 `cd ui && npm run build` 결과를 함께 커밋한다.
- 커밋 메시지는 영어, 끝에 세션의 Co-Authored-By / Claude-Session 줄.

## Review Focus

1. 무대 위 3D 그림의 글자색: 캔버스 글자색은 `readColors()`가 `#stage`의 토큰에서 읽는다. 토큰을 옮긴 뒤에도 3D의 이름표·치수 글자가 어두운 바탕에서 밝게 보여야 한다(Task 2 시험 `canvas colours stay light on the dark stage`).
2. 간편 모드: `html.simple`에서도 같은 색과 버튼이어야 한다. 간편 모드 전용 규칙이 회색 값을 남기면 안 된다(Task 2 시험 `simple mode uses the same tokens`).
3. 휴대폰 가로: 손잡이 줄(`#camBar` 세로 줄)과 오른쪽 줄의 바탕이 회색(`#D4D5D7`)으로 남으면 안 된다(Task 2 시험 `phone grips are dark`).
4. 내보내기 메뉴·알림·튜토리얼 말풍선 같은 떠 있는 판: 단색 `--raise`와 `--sh-float`로 보여야 하고, 반투명이면 안 된다(Task 2 시험 `floating panels are solid`).
5. 꺼진 버튼: `--muted` 글로 구분되어야 하고, 대비가 3:1 이상이어야 한다(`#8B8E94` on `#151618` ≈ 5.7:1, 값으로 고정).

---

### Task 1: Astryx `lens` 테마 되살리기

**Files:**
- Modify: `ui/themes/lens/*` (테마 편집기가 고친다), `ui/src/themes/lens/*`(편집기가 다시 쓴다)
- Modify: `ui/src/main.jsx` (`themeFor`, 루트 `<Theme>`)
- Modify: `ui/build.mjs` (CSS 목록을 `src/themes/lens/lens.css` 하나로)
- Modify: `ui/README.md` (Theme 절: 이제 `lens` 한 벌)
- Modify: `ui/dist/*` (빌드 결과)
- Test: `tests/e2e/specs/design.test.js`

**Interfaces:**
- Produces: 모든 `.ax-host`의 `data-astryx-theme`가 `"lens"`, `data-theme`가 `"dark"`

- [ ] **Step 1: 시험 작성** `tests/e2e/specs/design.test.js`

```js
test('every Astryx control is drawn with the lens theme', { timeout: 180_000 }, async () => {
  // blank pro project at 1280×800 → collect the theme attribute of every .ax-host
  assert.deepEqual([...new Set(themes)], ['lens']);
  // the primary export button is lime
  assert.equal(primaryBg, 'rgb(201, 221, 79)');
});
```

`primaryBg` = 내보내기 버튼(`#exportBtn`)의 Astryx 부품 `button`의 계산된 `background-color`.

- [ ] **Step 2: 실패 확인**

Run: `cd tests/e2e && node --test specs/design.test.js`
Expected: FAIL (`['cart','well']` ≠ `['lens']`)

- [ ] **Step 3: 테마를 고치고 연결한다**
  - 편집기로 `lens` 글꼴을 `"SUIT Variable"`로 바꾼다.
  - 기준 문서 1절의 값을 넣는다: 보조 글자색 `#8B8E94`, 경계 `#686B70`, 모서리 6/4, 초점 고리 2px `#ECEDEE`. 줄은 `editor how "…"`가 알려 주는 `set lens … --on <part>`를 쓴다.
  - `editor show lens --png`로 사진을 보고 확인한다.
  - `themeFor`는 늘 `'lens'`를 돌려준다. `data-theme`는 `'dark'`, 루트 `<Theme theme={lensTheme} mode="dark">`.
  - `build.mjs`의 CSS 목록에서 `cart`/`well`을 빼고 `lens`를 넣는다. 그다음 `cd ui && npm run build`.

- [ ] **Step 4: 통과 확인**

Run: `cd tests/e2e && node --test specs/design.test.js`
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add ui tests/e2e/specs/design.test.js
git commit -m "ui: draw every control with the revived lens theme (SUIT)"
```

---

### Task 2: 앱 토큰과 공통 모양 되돌리기

**Files:**
- Modify: `index.html`
  - `:root` 토큰 블록(“design tokens (2026-11-28, monitor cart)”)
  - `.stage,.pip,.home{…}` 겹 삭제
  - "monitor cart pass" 블록, `:root{--body:#D4D5D7}`
  - `.btn` 계열, `.glass`, `:focus-visible`, 녹화 테두리 규칙
- Modify: `tests/e2e/specs/design.test.js`, `tests/e2e/specs/viewports.test.js`(녹화 테두리 색)

**Interfaces:**
- Consumes: Task 1의 `lens` 테마
- Produces: 렌즈 토큰(Global Constraints 값), `--line-strong`, `--danger-ink`, `--sh-float`. `--body`는 지우지 않고 `var(--paper)`로 둔다(여러 칸 사이 틈과 휴대폰 손잡이가 쓴다).

- [ ] **Step 1: 시험 작성** (`design.test.js`에 추가)
  - `'app surfaces and text use the lens tokens'`: 1280×800 프로
    - `getComputedStyle(body).backgroundColor === 'rgb(13, 14, 15)'`
    - `.bar` 바탕 `'rgb(21, 22, 24)'`
    - `body` 글자색 `'rgb(236, 237, 238)'`
    - `body` 글꼴이 `SUIT`로 시작
  - `'canvas colours stay light on the dark stage'`: `C.ink === '#ECEDEE'`
  - `'simple mode uses the same tokens'`: 간편 모드로 연 뒤 `.bar` 바탕 `'rgb(21, 22, 24)'`
  - `'phone grips are dark'`: iPhone 13 가로에서 `#camBar`와 `#rail`의 바탕이 `'rgb(13, 14, 15)'` 또는 `'rgb(21, 22, 24)'`
  - `'floating panels are solid'`: 내보내기 메뉴를 열고
    - `#xMenu` 바탕 `'rgb(28, 29, 32)'`
    - `backdrop-filter`가 `'none'`
    - `box-shadow`에 `'0px 8px 24px'`이 들어 있음
  - `'focus ring is 2px ink'`: Tab 한 번 뒤 `document.activeElement`의 `outline-width` `'2px'`, `outline-color` `'rgb(236, 237, 238)'`
  - `viewports.test.js`의 재생 테두리 판정을 `'rgb(229, 72, 58)'`로 바꾼다

- [ ] **Step 2: 실패 확인**

Run: `cd tests/e2e && node --test specs/design.test.js specs/viewports.test.js`
Expected: FAIL (바탕이 `rgb(212, 213, 215)`, 테두리가 `rgb(227, 36, 27)`)

- [ ] **Step 3: 토큰과 규칙을 고친다**
  - `:root`를 Global Constraints 값으로 바꾸고 `color-scheme: dark`로 한다. 나머지 토큰(`--soft #18191B`, `--line2 #212225`, `--tally`, `--grid`, `--vf`, 크기·간격·글꼴)은 렌즈 패스 값을 쓰되, 글꼴은 지금 값을 유지한다.
  - `.stage,.pip,.home{…}` 겹을 지운다.
  - "monitor cart pass" 블록은 남긴다(타임라인 필름 띠). 다만 `--body`를 `var(--paper)`로 둔다. 빨강이던 선택 표시는 `--tally`(라임)를 따른다.
  - 버튼: Global Constraints의 세 종류
  - `.glass`: 단색 `--raise` + `--sh-float`
  - `:focus-visible`: 2px `--ink`
  - 녹화 테두리: `--rec`

- [ ] **Step 4: 통과 확인**

Run: `npm test`
Expected: `# fail 0`

- [ ] **Step 5: 화면 사진으로 확인**
  - 찍을 화면 네 가지(`tests/e2e/out/`): 컴퓨터 2화면 + 패널, 3화면, 휴대폰 가로, 홈
  - 회색 면이 남은 곳이 없는지 본다.

- [ ] **Step 6: 커밋**

```bash
git add index.html tests/e2e/specs/design.test.js tests/e2e/specs/viewports.test.js
git commit -m "style: return the app to the lens tokens, solid panels, three button kinds"
```

---

### Task 3: 결정 기록 고치기

**Files:**
- Modify: `.claude/skills/design-team/references/decisions.md`
- Modify: `sw.js` (`CACHE` 이름을 `frameconti-lens2`로)

- [ ] **Step 1: 결정 기록을 고친다**
  - "분위기와 색 (모니터 카트)" 절을 렌즈 콘셉트로 되돌린다: 무광 검정 + 라임, 첫 회의 결정 기준. 애플·종이·모니터 카트는 쓰지 않는다.
  - "글꼴" 절: SUIT, 숫자 Archivo Narrow
  - Astryx 테마: `lens` 한 벌

- [ ] **Step 2: 전체 시험**

Run: `npm test`
Expected: `# fail 0`

- [ ] **Step 3: 커밋과 올리기**

```bash
git add .claude/skills/design-team/references/decisions.md sw.js
git commit -m "docs: record the lens design system decision"
git push origin assets-layout && git push origin assets-layout:main
```
