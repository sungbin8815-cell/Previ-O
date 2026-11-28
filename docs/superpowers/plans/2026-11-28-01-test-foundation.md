# ① 기반: 시험 도구를 저장소로 옮기기 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 지금 세션 임시 폴더에만 있는 Playwright 시험을 저장소 `tests/e2e/`로 옮겨, 저장소 루트에서 `npm test` 한 번으로 모든 시험이 돌고 통과/실패를 판정하게 한다.

**Architecture:** 시험마다 브라우저를 띄워 앱을 여는 공용 도구(`lib/harness.js`, `lib/start.js`)를 두고, 기존의 출력만 하던 스크립트를 Node 내장 시험(`node:test` + `assert`)으로 바꾼다. CDN 라이브러리는 `tests/e2e/node_modules`의 같은 버전으로 돌려 연결해서, 시험이 네트워크에 기대지 않게 한다.

**Tech Stack:** Node 22 `node:test`, Playwright(이 환경에 미리 설치된 것, `require('playwright')`), three@0.160.0, @pixiv/three-vrm@2.1.0, sortablejs@1.15.0, lz-string@1.4.4, es-module-shims@1.10.0

**Spec:** `docs/superpowers/specs/2026-11-28-previo-pro-redesign-design.md` (10절 ①, 12절 5)

**옮겨 올 원본** (세션 임시 폴더 `/tmp/claude-0/-home-user-previ-o/286193a8-8153-5b7d-86e8-6bdc6b387104/scratchpad/`):
- 공용: `harness.js`, `start.js`
- 시험: `buildtest.js`, `edittest.js`, `agetest.js`, `stoptest.js`, `dialtest.js`, `dialturn.js`, `axfunc.js`, `axmenu.js`, `axesc.js`, `axphone.js`, `vptest.js`
- `phonetest.js`는 옮기지 않는다(Astryx 이전 것, 숨긴 버튼을 직접 누른다).

## Global Constraints

- 시험 틀은 Node 내장 `node:test`만 쓴다. 다른 시험 프레임워크를 더하지 않는다.
- Playwright를 npm으로 설치하지 않는다(이 환경의 브라우저와 버전이 맞지 않게 된다). `require('playwright')`로 미리 설치된 것을 쓴다.
- 시험은 한 번에 하나씩 돈다: `node --test --test-concurrency=1`.
- 시험이 만드는 사진·파일은 `tests/e2e/out/`에만 쓴다(git 무시).
- 앱 코드(`index.html`, `ui/`)는 이 계획에서 고치지 않는다. 이 단계는 지금 동작을 그대로 고정하는 시험(특성 시험)이다.
- 커밋 메시지는 영어, 끝에 세션의 Co-Authored-By / Claude-Session 줄을 붙인다.

## Review Focus

1. 포트 8765가 이미 쓰이는 중 → 시험이 실패하지 않고 빈 포트를 잡아야 한다(Task 1의 `serve()`는 포트 0으로 열고 실제 포트를 돌려준다).
2. `tests/e2e/node_modules`가 없음 → "npm --prefix tests/e2e install을 먼저 하세요"라는 분명한 오류로 멈춰야 한다(Task 1 시험 `harness reports missing libs`).
3. 글꼴 서버(fonts.googleapis.com, jsDelivr의 SUIT)에 닿지 않음 → 시험은 통과해야 한다. 글꼴 요청은 실패해도 무시한다(Task 1).
4. 앱이 페이지 오류(`pageerror`)를 낼 때 → 기능 값이 맞아도 실패로 판정해야 한다. 모든 시험은 `errs`가 빈 배열인지 확인한다.
5. 시험 하나가 시간을 넘김 → 브라우저를 닫고 다음 시험으로 넘어가야 한다. 시험마다 `{ timeout: 180_000 }`과 `after(() => b.close())`를 둔다.

---

### Task 1: 공용 도구와 첫 시험, `npm test`

**Files:**
- Create: `package.json` (저장소 루트, `"private": true`, `"scripts": { "test": "npm --prefix tests/e2e test" }`)
- Create: `tests/e2e/package.json` (`"private": true`, devDependencies는 Tech Stack의 정확한 버전, `"scripts": { "test": "node --test --test-concurrency=1 specs/" }`)
- Create: `tests/e2e/lib/harness.js`, `tests/e2e/lib/start.js`
- Create: `tests/e2e/specs/smoke.test.js`
- Modify: `.gitignore` (`tests/e2e/node_modules/`, `tests/e2e/out/`, `node_modules/` 추가)
- Modify: `CLAUDE.md` ("작업 지침"에 한 줄: 앱을 고친 뒤 `npm test`로 시험한다. 처음 한 번 `npm --prefix tests/e2e install`)

**Interfaces:**
- Produces:
  - `open(opts?: { viewport?: {width, height}, device?: string, q?: string }) => Promise<{ b: Browser, p: Page, errs: string[] }>`
    - 원본 `harness.js`와 같은 동작. 서버 뿌리는 `path.resolve(__dirname, '../../..')`, 라이브러리는 `tests/e2e/node_modules`
    - `p.click`은 숨긴 원래 버튼을 Astryx 부품으로 돌려 누른다(원본의 `axTarget`)
    - 글꼴 요청은 그대로 보낸다
  - `serve() => Promise<number>`: 포트 0으로 열고 실제 포트를 돌려준다. `open`은 이 포트로 접속한다.
  - `blank(p: Page, pro?: boolean) => Promise<void>`: 원본 `start.js`와 같다(간편/프로를 고르고 빈 프로젝트를 연 뒤 튜토리얼 말풍선을 Esc로 닫는다)
  - `OUT`: `tests/e2e/out` 절대 경로(없으면 만든다)

- [ ] **Step 1: 시험 작성** `tests/e2e/specs/smoke.test.js`

```js
test('app opens a blank pro project without page errors', { timeout: 180_000 }, async () => {
  const { b, p, errs } = await open(); after(() => b.close());
  await blank(p, true);
  assert.equal(await p.evaluate(() => document.getElementById('startScreen').hidden), true);
  assert.equal(await p.evaluate(() => state.shots.length), 1);
  assert.deepEqual(errs, []);
});
test('harness reports missing libs', () => {
  assert.throws(() => libPath('three/build/three.module.js', '/nonexistent'), /npm --prefix tests\/e2e install/);
});
```

(`libPath(rel: string, root?: string) => string`는 `harness.js`가 내보낸다. 파일이 없으면 위 문구로 오류를 던진다.)

- [ ] **Step 2: 실패 확인**

Run: `npm test`
Expected: FAIL (`tests/e2e/lib/harness.js`가 아직 없음)

- [ ] **Step 3: `harness.js`, `start.js`, 두 `package.json`, `.gitignore`, `CLAUDE.md` 작성**

라이브러리 경로 대응은 원본과 같다(Sortable, lz-string, es-module-shims, three-vrm, `three@0.160.0/…`). 원본의 `NM` 대신 `libPath()`를 쓴다.

- [ ] **Step 4: 설치하고 통과 확인**

Run: `npm --prefix tests/e2e install && npm test`
Expected: `# pass 2`, `# fail 0`

- [ ] **Step 5: 커밋**

```bash
git add package.json tests/e2e/package.json tests/e2e/package-lock.json tests/e2e/lib tests/e2e/specs/smoke.test.js .gitignore CLAUDE.md
git commit -m "test: add the e2e harness to the repo and run it with npm test"
```

---

### Task 2: 편집 기능 시험 옮기기 (짓기 · 벽 편집 · 인물 · 조리개)

**Files:**
- Create: `tests/e2e/specs/build.test.js` (원본 `buildtest.js`)
- Create: `tests/e2e/specs/edit.test.js` (원본 `edittest.js`)
- Create: `tests/e2e/specs/cast.test.js` (원본 `agetest.js`)
- Create: `tests/e2e/specs/stops.test.js` (원본 `stoptest.js`)

**Interfaces:**
- Consumes: Task 1의 `open`, `blank`, `OUT`

시험 몸체는 원본 스크립트의 조작을 그대로 옮긴다. `console.log` 대신 아래 값으로 판정한다. 사진은 `OUT` 아래에 쓴다.

- [ ] **Step 1: 시험 작성**
  - `build.test.js` `'drawn room, door and window cut the walls'`:
    `assert.deepEqual(pieces, [3, 3, 1, 1]); assert.equal(boxes, 8); assert.deepEqual(errs, [])`
  - `edit.test.js` `'wall rows edit, floor material and undo'`:
    `assert.deepEqual(r.wallRows, ['길이', '높이', '두께', '방향']); assert.equal(r.wh, 3.2); assert.equal(r.fmat, 'grass'); assert.equal(r.afterUndo, 'oak'); assert.deepEqual(errs, [])`
  - `cast.test.js` `'every age and gender renders without errors'`: 원본 네 조합을 돌린 뒤 `assert.deepEqual(errs, [])`
  - `stops.test.js` `'stop readout per lens kit'`:
    `assert.deepEqual(r.map(x => x.kit), ['free', 'free', 'gm', 'masterp']); for (const x of r) assert.ok(x.label.length > 0); assert.deepEqual(errs, [])`

- [ ] **Step 2: 돌려 확인**

Run: `npm test`
Expected: `# fail 0` (지금 동작을 고정하는 특성 시험이라 처음부터 통과해야 한다. 실패하면 옮기면서 생긴 차이이니 원본 출력과 비교해 고친다)

- [ ] **Step 3: 커밋**

```bash
git add tests/e2e/specs/build.test.js tests/e2e/specs/edit.test.js tests/e2e/specs/cast.test.js tests/e2e/specs/stops.test.js
git commit -m "test: port the build, wall edit, cast and stop tests"
```

---

### Task 3: 화면 조작 시험 옮기기 (다이얼 · Astryx · 휴대폰 · 여러 화면)

**Files:**
- Create: `tests/e2e/specs/dials.test.js` (원본 `dialtest.js`, `dialturn.js`)
- Create: `tests/e2e/specs/astryx.test.js` (원본 `axfunc.js`, `axmenu.js`, `axesc.js`)
- Create: `tests/e2e/specs/phone.test.js` (원본 `axphone.js`)
- Create: `tests/e2e/specs/viewports.test.js` (원본 `vptest.js`)

**Interfaces:**
- Consumes: Task 1의 `open`, `blank`, `OUT`

- [ ] **Step 1: 시험 작성**
  - `dials.test.js`
    - `'stop ruler sets T8 and one dial shows'`: `assert.equal(N, 8); assert.equal(dials, 1)`
    - `'dim dial follows a clockwise and counter-clockwise turn'`:
      `assert.deepEqual(log, [[-135, 0.05], [-90, 0.21], [-45, 0.37], [0, 0.53], [45, 0.68], [90, 0.84], [135, 1], ['cw end', 1], ['ccw end', 0.05]])`
  - `astryx.test.js`
    - `'shortcut, slider, kit, board and add shot through Astryx'`:
      `assert.equal(out.keyC, 'true'); assert.notEqual(out.focal[1], out.focal[0]); assert.equal(out.kit, 'sig'); assert.equal(out.board, 'true'); assert.equal(out.menu, true); assert.deepEqual(out.shots, [1, 2])`
    - `'export menu opens, toggles and closes'`:
      `assert.deepEqual(out.firstClick, [true, 'true']); assert.deepEqual(out.secondClick, [false, 'false']); assert.deepEqual(out.thirdClick, [true, 'true']); assert.deepEqual(out.outside, [false, 'false']); assert.equal(out.otherControl, false); assert.equal(out.haspopup, 'menu')`
    - `'Esc and outside presses close the export menu'`:
      `assert.deepEqual(r, { open: true, afterEsc: false, afterCanvasClick: false, afterOtherButton: false })`
  - `phone.test.js` `'phone landscape opens and the camera panel opens'`(iPhone 13 landscape):
    `assert.equal(await p.evaluate(() => pane), 'cam'); assert.deepEqual(errs, [])`
  - `viewports.test.js` `'desktop viewport layouts'`(1440×900). 원본 `vptest.js`의 판정값을 그대로 쓴다:
    - `start.vp === '2'`
    - `monPan[1] !== monPan[0]`, `orbit[1] !== orbit[0]`
    - `three.w2 === true`, `swap === 'top'`
    - `monOnly` = `{ vp: '1', mode: 'mon' }`, `back2` = `{ vp: '2', mode: '3d' }`
    - `play.anim === true`이고 `play.border`가 `'rgb(227, 36, 27)'`로 시작
    - `after.anim === false`
    - `f6b === 'shots'`
    - 이 값들은 ②·④ 단계에서 바뀐다. 그 단계의 계획이 이 시험을 고친다.

- [ ] **Step 2: 돌려 확인**

Run: `npm test`
Expected: `# fail 0`, 시험 수 15 이상

- [ ] **Step 3: 커밋하고 올리기**

```bash
git add tests/e2e/specs/dials.test.js tests/e2e/specs/astryx.test.js tests/e2e/specs/phone.test.js tests/e2e/specs/viewports.test.js
git commit -m "test: port the dial, Astryx, phone and viewport tests"
git push -u origin assets-layout && git push origin assets-layout:main
```
