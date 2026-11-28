# ③ PC 작업 공간 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 컴퓨터(폭 1000px·높이 560px 이상) 화면을 고정 작업 공간으로 바꾼다.
- 위: 꼭 필요한 것만 남긴 툴바
- 왼쪽: 그룹으로 묶은 도구 팔레트(접기·즐겨찾기·아이콘만 보기)
- 오른쪽: 고른 대상에 따라 바뀌는 인스펙터와, 닫았을 때 다시 여는 색인 줄
- 아래: 고른 샷의 설정을 머리에 둔 타임라인(높이 조절)

**Architecture:**
- 새 화면 요소는 기존 버튼을 누르는 것과 같은 길로만 동작한다(`$('#id').click()` 또는 이미 있는 함수 호출). 새 동작을 만들지 않는다.
- 기존 요소는 지우거나 이름을 바꾸지 않는다. 자리를 옮길 때는 DOM에서 옮긴다(id는 그대로).
- 휴대폰 배치는 건드리지 않는다. ⑦에서 바꾼다.

**Tech Stack:** `index.html`(HTML·CSS·JS), `ui/src/main.jsx`(Astryx 연결 장치의 SPECS), `tests/e2e`

**Spec:** `docs/superpowers/specs/2026-11-28-previo-pro-redesign-design.md` 7-1절, 12절

## Global Constraints

- 컴퓨터 배치 조건: 폭 1000px 이상, 높이 560px 이상(`vpRoom()`). 그보다 작으면 지금 배치 그대로.
- 팔레트에는 있는 기능만 넣는다. 조도 히트맵은 화면에서 켜는 곳이 없어 넣지 않는다. "스케일"은 없다.
- 팔레트 폭: 펼침 168px, 아이콘만 52px. 기기에 저장한다(`previo.palette` = `'wide'|'narrow'`).
- 즐겨찾기: 기기에 저장한다(`previo.favs` = 도구 id 배열).
  - 추가·빼기: 오른쪽 클릭 또는 0.5초 길게 누르기
  - 비어 있으면 즐겨찾기 그룹을 숨긴다
- 접은 그룹도 기기에 저장한다(`previo.palgroups` = 접은 그룹 id 배열).
- 주요(라임) 버튼은 화면에 하나(내보내기). 「+ 샷」은 보조 버튼이고 "+"만 라임이다. 지우는 동작의 글자는 `--danger-ink`.
- 화면 글은 한국어. 마우스를 올리면 "이름 (단축키)" 툴팁(`title`)을 보여 준다.
- `ui/`를 고치면 다시 빌드해 함께 커밋한다. 커밋 메시지는 영어, 세션 서명 줄.

## Review Focus

1. 탑 화면 전용 도구(줄자)는 3D 화면에서 꺼져 보여야 하고, 누르면 아무 일도 없어야 한다(Task 2 시험 `tools that need the top view are off in 3D`).
2. 간편 모드에서는 프로 전용 도구를 숨겨야 한다. 그 예가 크레인(장비)이다(Task 2 시험 `simple mode hides pro-only tools`).
3. 인스펙터를 닫은 채 단축키 C/L/T를 누르면 그 패널이 열리고, 색인 줄 표시가 따라가야 한다(Task 3 시험 `shortcut opens a panel from the closed state`).
4. 샷이 하나뿐일 때 머리의 길이를 1초 아래로 줄일 수 없어야 한다(기존 `#durM`이 1에서 멈춤, Task 4 시험 `length stops at 1 second`).
5. 즐겨찾기에 넣은 도구가 지금 쓸 수 없는 상태(물체를 안 골랐을 때의 복제)이면, 즐겨찾기 칸에서도 꺼져 보여야 한다(Task 2 시험 `favourites follow the tool's state`).

---

### Task 1: 위 툴바 정리 (앱 메뉴, 편집/스토리보드 전환을 타임라인 머리로)

**Files:**
- Modify: `index.html`
  - `.bar`(로고 옆에 앱 메뉴 버튼 `#appMenuBtn`과 메뉴 `#appMenu` 추가)
  - `#uiModeBtn`·`#tourBtn`·`#fpMenuBtn`을 `#xMenu`에서 `#appMenu`로 DOM 이동, 메뉴에 "조작 가이드" 항목 `#keyHelpItem` 추가(`keyHelp(true)` 호출)
  - 편집/보드 `.vtoggle`(`#editBtn`, `#boardBtn`)을 `.shots` 머리 오른쪽으로 이동
- Modify: `ui/src/main.jsx` SPECS의 seg 선택자에 `.shots .vtoggle` 추가, `ui/dist/*`
- Create: `tests/e2e/specs/workspace.test.js`

**Interfaces:**
- Produces:
  - `appMenu(open?: boolean): void`: `#appMenu`를 열고 닫는다. 바깥을 누르거나 Esc면 닫힌다(`xMenu`와 같은 규칙)
  - `#appMenuBtn`: `aria-haspopup="menu"`, `aria-expanded`

- [ ] **Step 1: 시험 작성** (`workspace.test.js`, 1440×900 프로)
  - `'edit/storyboard switch lives in the timeline header and still switches'`
    - `#boardBtn`이 `.shots` 안에 있다
    - 그 Astryx 칸을 눌러 `#boardBtn`의 `aria-pressed === 'true'`
    - 다시 편집으로 돌아온다
  - `'app menu holds mode, tutorial, focus practice and key help'`
    - `#appMenuBtn`을 누르면 `#appMenu`가 열린다
    - 그 안에 `#uiModeBtn`, `#tourBtn`, `#fpMenuBtn`, `#keyHelpItem`이 있다
    - `#keyHelpItem`을 누르면 `#keyHelp`가 열린다
    - Esc로 닫힌다

- [ ] **Step 2: 실패 확인** — Run: `cd tests/e2e && node --test --test-force-exit specs/workspace.test.js` / Expected: FAIL (`#boardBtn` not in `.shots`)

- [ ] **Step 3: 구현** — 위 Files 목록대로. 옮긴 버튼의 기존 핸들러는 id로 붙어 있어서 그대로 작동한다. `astryx.test.js`의 `getByRole('radio', { name: '보드' })`도 그대로 통과해야 한다.

- [ ] **Step 4: 통과 확인** — Run: `cd tests/e2e && node --test --test-force-exit specs/workspace.test.js specs/astryx.test.js` / Expected: PASS

- [ ] **Step 5: 커밋** — `git commit -m "workspace: app menu in the toolbar, edit/storyboard switch in the timeline header"`

---

### Task 2: 왼쪽 도구 팔레트

**Files:**
- Modify: `index.html`
  - 새 `<nav class="palette" id="palette" aria-label="도구">`
  - 컴퓨터 격자: 열 `palette stage drawer rail`
  - 컴퓨터에서 `#camBar` 숨김(팔레트가 대신)
  - `TOOLS` 목록, `buildPalette()`, `syncPalette()`(`syncBars()` 끝에서 부른다)
- Test: `tests/e2e/specs/palette.test.js`

**Interfaces:**
- Produces:
  - `TOOLS: Array<{ id: string, group: string, name: string, key?: string, icon: string, run: () => void, on?: () => boolean, active?: () => boolean, pro?: boolean }>`
  - `buildPalette(): void`, `syncPalette(): void`, `paletteFav(id: string): void`(넣기·빼기 전환)
  - 팔레트 버튼: `button.ptool[data-tool="<id>"]`, 꺼짐은 `disabled`, 켜짐은 `aria-pressed="true"`

도구 목록(그룹 id → 도구 id: 동작):

| 그룹 | 도구 |
|---|---|
| `fav` 즐겨찾기 | 고른 도구들 |
| `move` 선택·이동 | `select`: `placing`이면 `cancelPlace()`, `build.on`이면 `buildToggle(false)`, `tape.on`이면 `#tapeBtn` 클릭, 그다음 `selObj = null; camSel = false; syncSet(); syncBars(); renderWorld()` / `camMove`: `#moveModeBtn` 클릭(켜짐 = `camMove === 'free'`) / `objMove`: `#oMove` 클릭(물체를 골랐을 때만) |
| `rotate` 회전 | `rotL`: `#oRotL` / `rotR`: `#oRotR`(둘 다 물체를 골랐을 때만) / `level`: `#levelBtn` |
| `camera` 카메라 | `aimA`: `#aimA` / `aimB`: `#aimB`(B가 켜져 있을 때만) / `fit`: `#fitBtn`(모니터 화면 아닐 때) / `wider`·`narrower`: 키보드 Z/X와 같은 함수 |
| `light` 조명 | `lightAdd`: `openPane('light'); paneTab('light', 'add')` / `sky`: `openPane('light'); paneTab('light', 'sky')` |
| `set` 세트 | `cast`: `openPane('set'); paneTab('set', 'cast')` / `propAdd`: `openPane('set'); paneTab('set', 'add')` / `build`: `#buildBtn` 클릭(켜짐 = `build.on`, 모니터 화면 아닐 때) |
| `object` 오브젝트 | `dup`: `#oDup` / `del`: `#oDel` / `edit`: `#oEdit`(물체를 골랐을 때만) |
| `measure` 측정 | `tape`: `#tapeBtn`(탑 화면에서만, 켜짐 = `tape.on`) |
| `note` 주석 | `axis`: `openPane('shot'); paneTab('shot', 'axis')` / `path`: `#kfAdd` 클릭 |

"물체를 골랐을 때만"은 `#objBar`가 보이는지로 판단한다(`!$('#objBar').hidden`).

- [ ] **Step 1: 시험 작성** (`palette.test.js`, 1440×900 프로)
  - `'palette shows the tool groups in order'`
    - 보이는 그룹 머리 = `['선택·이동', '회전', '카메라', '조명', '세트', '오브젝트', '측정', '주석']`(즐겨찾기는 비어서 숨김)
    - `#camBar`의 `offsetParent === null`
  - `'a palette tool runs the same action'`
    - `cur().cam.roll = 7` 뒤 `[data-tool="level"]` 클릭 → `cur().cam.roll === 0`
    - `[data-tool="lightAdd"]` → `pane === 'light'`
  - `'object tools are off until an object is picked'`
    - `[data-tool="dup"]`이 `disabled`
    - 가구 하나를 고른 뒤(`selObj = { id: state.set.props[0].id, kind: 'prop' }; syncSet(); syncBars()`) 켜진다
  - `'tools that need the top view are off in 3D'`: `mode === '3d'`에서 `[data-tool="tape"]`이 `disabled`, `setMode('top')` 뒤 켜진다
  - `'simple mode hides pro-only tools'`: 간편 모드로 열면 `[data-tool="aimB"]` 등 `pro: true` 도구가 없다. 프로 전용인 것만 `pro: true`로 표시한다(장비·크레인 계열이 없으면 이 시험은 "프로 전용 도구 수 = 0이면 통과"로 둔다).
  - `'favourite added by right-click appears and survives reload'`
    - `[data-tool="level"]` 오른쪽 클릭 → 즐겨찾기 그룹에 `level`
    - `p.reload()` 뒤에도 있다
  - `'favourites follow the tool state'`: `dup`을 즐겨찾기에 넣으면, 물체를 안 골랐을 때 즐겨찾기 칸의 `dup`도 `disabled`다
  - `'groups collapse and the palette narrows'`
    - `카메라` 그룹 머리를 누르면 그 그룹의 도구가 숨는다
    - 폭 전환 버튼 `#paletteWidth`를 누르면 팔레트 폭이 52px가 된다

- [ ] **Step 2: 실패 확인** — Run: `cd tests/e2e && node --test --test-force-exit specs/palette.test.js` / Expected: FAIL (no `#palette`)

- [ ] **Step 3: 구현**
  - 팔레트 모양(렌즈 토큰):
    - 그룹 머리: 12px `--ink2`, 접힘 화살표
    - 도구 줄: 높이 32, 아이콘 18 + 이름 13
    - 켜짐: 라임 아이콘 + 왼쪽 2px 라임 막대
    - 꺼짐: `--muted`
  - 아이콘: 해당 기존 버튼의 `svg`를 복제해서 쓴다.

- [ ] **Step 4: 통과 확인** — Run: `cd tests/e2e && node --test --test-force-exit specs/palette.test.js specs/astryx.test.js specs/viewports.test.js` / Expected: PASS

- [ ] **Step 5: 커밋** — `git commit -m "workspace: grouped tool palette with favourites, collapsing groups and a narrow mode"`

---

### Task 3: 오른쪽 인스펙터와 색인 줄

**Files:**
- Modify: `index.html`
  - 컴퓨터에서 `.rail`을 오른쪽 끝 열로 옮긴다(CSS 격자)
  - 패널이 닫혔을 때만 보인다(폭 44px, 아이콘만)
  - 패널 머리에 고른 대상 이름 줄(`#inspTarget`: "카메라", 조명 이름, 인물 이름, 가구 이름)
- Test: `tests/e2e/specs/inspector.test.js`

**Interfaces:**
- Consumes: 기존 `autoInspect()`, `openPane()`, `#drawerClose`
- Produces: `inspTargetName(): string`(지금 인스펙터가 보여 주는 대상의 이름)

- [ ] **Step 1: 시험 작성** (1440×900 프로)
  - `'picking switches the inspector and names the target'`
    - 조명을 고르면(`selObj = { id: state.set.lights[0].id, kind: 'light' }; syncBars()`) `pane === 'light'`이고 `#inspTarget`이 비어 있지 않다
    - 고른 것을 풀면(`selObj = null; camSel = false; syncBars()`) 카메라로 돌아온다
  - `'closing the inspector leaves a right index that reopens panels'`
    - `#drawerClose` 클릭 → `#rail`이 보이고 화면 오른쪽 끝(`right === innerWidth`)에 있다
    - `#rail [data-pane="set"]` 클릭 → `pane === 'set'`이고 `#rail`이 숨는다
  - `'shortcut opens a panel from the closed state'`: 패널을 닫은 뒤 `l` 키 → `pane === 'light'`

- [ ] **Step 2: 실패 확인** — Run: `cd tests/e2e && node --test --test-force-exit specs/inspector.test.js` / Expected: FAIL (`#inspTarget` 없음, rail이 왼쪽)

- [ ] **Step 3: 구현** — 위 Files대로. `autoInspect()`는 그대로 쓴다(이미 고른 대상에 따라 패널을 바꾼다).

- [ ] **Step 4: 통과 확인** — Run: `cd tests/e2e && node --test --test-force-exit specs/inspector.test.js specs/astryx.test.js` / Expected: PASS

- [ ] **Step 5: 커밋** — `git commit -m "workspace: right index rail when the inspector is closed, target name in the inspector"`

---

### Task 4: 타임라인 머리와 높이

**Files:**
- Modify: `index.html`
  - `.shots` 머리에 고른 샷의 설정 줄 `#tlHead`:
    - 샷 번호
    - 무빙 고르기 `#tlMove`(`<select>`, `MOVES`의 한국어 이름)
    - 길이 `#tlDurM` / `#tlDur` / `#tlDurP`
    - 메모 `#tlNote`(한 줄 입력)
  - 위 경계 끌기 손잡이 `#tlResize`(높이 96~360px, `previo.tlh`에 저장)
  - 「+ 샷」(`#addBtn`)을 보조 버튼 + 라임 "+"로, 「삭제」(`#delBtn`)를 `--danger-ink`로
- Test: `tests/e2e/specs/timeline.test.js`

**Interfaces:**
- Consumes: `#moves [data-move]` 클릭(무빙 바꾸기), `#durM`/`#durP` 클릭(길이), `#fNote`의 값과 `input` 이벤트(메모)
- Produces: `syncTlHead(): void`(`renderAll()`에서 부른다)

- [ ] **Step 1: 시험 작성** (1440×900 프로)
  - `'header edits move, length and memo of the picked shot'`
    - `#tlMove`를 `'dolly_in'`처럼 `MOVES`에 있는 첫 번째 비고정 값으로 바꾸면 `cur().move`가 그 값이다
    - `#tlDurP` 클릭 → `cur().dur === 4`
    - `#tlNote`에 "테스트 메모" 입력 → `cur().note === '테스트 메모'`
    - 실행 취소(`undo()`) 한 번이면 메모가 되돌아간다
  - `'length stops at 1 second'`: `#tlDurM`을 다섯 번 누르면 `cur().dur === 1`
  - `'timeline height drags and is remembered'`
    - `#tlResize`를 위로 100px 끌면 `.shots` 높이가 늘어난다
    - 새로고침 뒤에도 같은 높이다
  - `'only export is a lime button; delete reads as danger'`
    - 라임 바탕(`rgb(201, 221, 79)`)인 Astryx 버튼이 하나뿐이다
    - `#delBtn`의 Astryx 버튼 글자색이 `rgb(229, 103, 92)`다

- [ ] **Step 2: 실패 확인** — Run: `cd tests/e2e && node --test --test-force-exit specs/timeline.test.js` / Expected: FAIL (no `#tlHead`)

- [ ] **Step 3: 구현** — 위 Files대로. 머리 값은 `syncTlHead()`가 `cur()`에서 다시 채운다.

- [ ] **Step 4: 전체 시험** — Run: `npm test` / Expected: `# fail 0`

- [ ] **Step 5: 화면 사진** — `tests/e2e/out/`에 1440×900 2화면·3화면, 패널 닫힘, 팔레트 아이콘만 상태를 찍어 확인한다.

- [ ] **Step 6: 커밋과 올리기**

```bash
git commit -m "workspace: timeline header for the picked shot, resizable timeline, one lime button"
git push origin assets-layout && git push origin assets-layout:main
```
