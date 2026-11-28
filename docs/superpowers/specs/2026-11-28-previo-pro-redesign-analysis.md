# PREVIO 전문 소프트웨어 리디자인: 현황 분석 (2026-11-28)

요청 원문은 `2026-11-28-previo-pro-redesign-request.md`에 있다. 이 문서는 요청의 "PHASE 1. 기존 코드 분석"이다.
코드를 고치기 전에 지금 무엇이 어디에 연결되어 있는지 적는다. 줄 번호는 이 날짜의 `index.html` 기준이며, 이름(함수·id)으로 찾는 편이 정확하다.

## 1. 구조

| 경로 | 내용 |
|---|---|
| `index.html` | 앱 전체(약 1.1MB). HTML, CSS(`@layer app`), 바닐라 JS가 한 파일에 있다. React 없음 |
| `ui/` | Astryx 부품 연결 장치. `src/main.jsx`가 숨긴 원래 버튼·입력칸 자리에 Astryx 부품을 그린다. `npm run build` → `ui/dist/` |
| `ui/themes/cart`, `ui/themes/well` | 지금 Astryx 테마: 회색 몸체(cart), 검은 칸(well). `lens`는 예전 테마로 빌드에서 빠짐 |
| `chars/` | 인물 3D(VRM) |
| `props/` | 가구·소품 GLB와 썸네일 |
| `env/` | 배경 HDRI 등(Poly Haven) |
| `tools/` | 자산 준비 스크립트(`char3d`, `polyhaven`). 시험 코드는 없다 |
| `sw.js` | 오프라인 캐시(서비스 워커) |
| `.claude/skills/` | `design-team`, `korean-only`, `design-taste-frontend` |

## 2. 라이브러리

- three.js 0.160(import map, jsDelivr), `@pixiv/three-vrm` 2.1, es-module-shims
- Sortable 1.15(샷 순서 끌기), lz-string 1.4.4(공유 링크 압축)
- Astryx 0.7.17(`ui/`에서 번들), 글꼴 SUIT · Archivo · Archivo Narrow

## 3. 화면 구조와 이동 (라우팅)

- 라우터는 없다. 시작 화면 `#startScreen`(홈) → 편집 화면. 편집 안에서 `setView('edit'|'board')`로 편집과 콘티(보드)를 오간다.
- 공유 링크는 주소의 `#d=` 해시(`openShared`)로 연다.
- 편집 화면 틀: `.app` CSS 그리드(`bar` 위, `rail` 왼쪽, `stage` 가운데, `drawer` 오른쪽, `shots` 아래).
- 대화상자: `.modal`(AI 프롬프트 `#aiModal`, 계산기 `#engModal`, 꾸미기 `#lookModal` 등), 포커스 연습 `#fp`, 조작 가이드 `#keyHelp`, 더보기 `#moreSheet`.

## 4. 3D 렌더링

- `initGL()`: WebGLRenderer 하나(화면 밖 캔버스)와 장면 하나. `glWorld()`가 같은 장면을 그때그때의 시점으로 그려서 2D 캔버스에 옮긴다.
  GL이 없으면 `renderScene()`이 2D로 대신 그린다.
- 보이는 캔버스:
  - `#world`: 3D 또는 탑. `drawWorld()`가 전역 `viewer`(목표점·방위각·고도·거리·화각)로 그린다.
  - `#world2`: 3화면일 때 나머지 하나. `drawWorld2()`가 전역을 잠깐 바꿔 그린다.
  - `#view`: 카메라 모니터. `drawMonitor()` → `renderShot()`
  - `#pip`: 작은 모니터
- 탑 시점은 고도 89.9°, 화각 18°로 흉내 낸다. **직교 투영은 없고 "앞(Front)" 시점도 없다.**
- 클릭·드래그(고르기, 손잡이, 카메라 끌기)는 `#world`에만 붙어 있다. `wLocal()`이 `#world`를 기준으로 재고, 맞힘 판정은 전역 `worldV`·`worldHandles`·`gizmoSpot`을 쓴다.
- 여러 화면: 전역 `vpLay`('1'|'2'|'3'), `applyVp()`, `setVp()`.
  - `.app.vp2`/`.vp3` 클래스로 칸을 나눈다.
  - 크기는 각 칸 기준으로 잰다: `sizeWorld()`는 캔버스의 부모, `sizeView()`는 `#vf`.

## 5. 카메라와 렌즈

- 샷마다 `s.cam`(x, y, z, pan, tilt, roll), `s.f`(초점거리), `s.lensType`
- `optics(s)`: 화각(hf, vf), 35mm 환산(eq), 심도(near, far), 최소 초점(mod), 초점 불가(tooClose)
- 센서는 `state.sensor`(`SENSOR()`), 아나모픽은 `state.squeeze`. 렌즈 키트는 `KIT()`, `kitF()`
- 렌즈를 바꿀 때 샷 크기 유지는 `keepShot()`이 한다.
- 화면: 카메라 패널 렌즈 탭.
  - 프로: 슬라이더 `#fRange`, 눈금 `#ticks`
  - 간편: 프리셋 `#fPresets` = `F_PRESETS`
- 판정만 하는 함수: `autoSize()`(EWS…ECU, `SIZES`·`SIZE_RULES`), `autoAngle()`(버즈아이·웜즈아이·하이·로우·아이 레벨·더치).
  **클릭으로 샷 크기·앵글을 맞추는 함수는 없다.**
- 카메라 조작:
  - 끌기/축(`camMove`, J), 수평(O), A·B 바라보기(U), 맞춤(0)
  - W A S D Q E로 이동, 방향키로 팬·틸트, 모니터 드래그로 팬·틸트, 휠·두 손가락으로 달리
  - 장비(`s.rig`), 크레인(`#craneBar`)

## 6. 초점과 노출

- 초점: `s.focus`('AF'|'M'), `s.afT`(대상), `s.fd`. 카메라 패널 초점 탭(프로)
- 노출: `s.N`(T값), `s.iso`, `s.shutter`(각도), `s.nd`, `s.wb`. `isoInfo()`(EI). 카메라 패널 노출 탭(프로)
- 모니터 표시: 폴스컬러(`showFC`, F), 구도 가이드(`showThirds`, G), 렌즈 격자, HUD(`#hudTop` 등)

## 7. 조명과 세트

- 세트는 씬 전체가 공유한다: `state.set` = { env, room, sun{month, hour, north, wx}, lights[], props[] }
- 조명:
  - `state.set.lights[]`(id, fx, diff, x, y, z, track, dim …). 계산은 `lightCtx(s)`
  - 패널: 배치된 조명 · 조명 추가 · 시간·날씨. 조명 편집에는 밝기 다이얼, 높이, 앞에 다는 것, 스팟↔플러드, 젤, 팬·틸트가 있다
  - 조도 히트맵 `showHeat`
- 인물: 샷마다 `s.A`, `s.B`, `s.C`(x, z, face, on). 배역 이름·성별·나이·키는 세트 패널 인물 탭
- 가구: `state.set.props[]`(id, type, x, z, yaw). 세트 패널 가구 추가·배치된 가구, 놓기(`#placeBar`), 물체 줄(`#objBar`)
  - 물체 줄 기능: 90° 회전, 옮기기, 복제, 삭제, 편집
  - **크기 조절(스케일) 도구는 없다.** 지은 벽만 길이·높이·두께 칸이 있다
- 짓기(`build`): 벽·바닥·블록(`#buildBar`)
- 탑 화면 전용: 줄자(`tape`), 마크(`drawMarks`). 동선(`drawPaths`), 셋업(`drawSetups`), 가상선(샷 패널)

## 8. 샷과 스토리보드

- `state.shots[]`(`newShot()`: cam, f, N, focus, iso, shutter, nd, wb, rig, move, dur, action, dialogue, note, takes, A·B·C …), `state.sel`
- 샷 띠: `buildStrip()`(카드, Sortable). 타임라인 `#tl`. 기능: `select()`, `addShot()`, 복제, 삭제, 접기(`stripFold`)
- 무빙: `MOVES` 15종, 시작/끝 키프레임(`#kfBar`, M). 재생: `playShot()`(Space), 전체 재생 `playSeq()`(P)
- 콘티: `#boardView`, `buildBoard()`
- 내보내기 메뉴 `#xMenu`: AI 프롬프트, 샷 리스트 복사, CSV, 콘티 인쇄·PDF, 테크비즈, 공유 링크, 파일 저장 등
- AI 프롬프트(`openAi`, `#aiModal`): 이미지(ChatGPT)와 영상(Higgsfield) 두 가지.
  **문체가 "real photograph", "실사 영상"으로 고정되어 있다.**

## 9. 저장과 불러오기

- 프로젝트: IndexedDB `frameconti`(`store`). `save()`는 250ms 뒤 `saveProject()`. `openProject(id)`. 형식 버전 `SCHEMA = 10`
- 예전 단일 상태: localStorage `framecontis.v2`. 설정은 `previo.*`, `framecontis.*` 키
- 파일: `#fileIn`(.previo, .frameconti, json). 공유 링크: lz-string 압축 `#d=`
- 실행 취소: `undoS`·`redoS` 스냅샷(`histReset`, `undo`, `redo`)
- **사진(이미지) 입력은 없다.** 파일 입력은 프로젝트와 `.vrm`뿐이다.

## 10. 상태 관리

- 전역 `state`(프로젝트)
- 화면 상태 전역:
  - 보기: `mode`('3d'|'mon'|'top'), `view`('edit'|'board'), `pane`(열린 패널), `vpLay`
  - 고른 것: `selObj`, `camSel`, `placing`, `build`, `tape`
  - 시점과 모드: `viewer`, `uiMode`('simple'|프로)
- 다시 그리기: `changed()` → `renderAll()` → `syncPanels()` · `syncBars()` · `flushWorld()` · `drawWorld2()` · `drawMonitor()` · `pipSoon()`
- 간편/프로: `isPro()`. HTML의 `data-pro`, `data-simple` 속성으로 보이고 숨긴다.

## 11. 반응형 (지금)

| 조건 | 배치 |
|---|---|
| 세로 휴대폰 (≤719px) | 돌려 달라는 안내(무시 가능) |
| 가로 휴대폰 (높이 ≤520px) | 왼쪽 손잡이에 카메라 도구, 오른쪽 손잡이에 패널, 화면 하나 |
| 720×521 이상 | 패널 폭을 끌어서 조절(`.dresize`) |
| 1000×560 이상 | 화면 1·2·3 전환, 패널 기본 열림, 패널이 열리면 도구 줄 숨김 |

## 12. 시험

- Playwright 시험이 **세션 임시 폴더에만** 있다: `harness.js`, `buildtest`, `dialtest`, `axfunc`, `axmenu`, `axesc`, `axphone`, `edittest`, `vptest` 등.
  저장소에 없으니 다음 세션에서는 쓸 수 없다. 리디자인 전에 저장소로 옮겨야 한다.

## 13. 기존 기능 목록 (재배치 판단용)

| 기능 | 지금 자리 | 단축키 |
|---|---|---|
| 카메라 패널(렌즈·초점·노출·거리·센서) | 도구 줄 / 패널 | C |
| 장비(손·바닥, 이동, 지미집·크레인, 공중) | 도구 줄 / 패널(프로) | R |
| 조명(배치된 조명, 조명 추가, 시간·날씨) | 도구 줄 / 패널 | L |
| 세트(인물, 공간, 가구 배치, 가구 추가) | 도구 줄 / 패널 | T |
| 샷(무빙, 가상선, 테크비즈, 촬영 순서, 메모) | 도구 줄 / 패널 | H |
| 보기 전환 3D · 모니터 · 탑 | 무대 왼쪽 위 | 1 2 3, V, 0(맞춤) |
| 카메라 이동 방식(끌기/축) | 카메라 도구 줄 | J |
| 수평 맞추기 | 카메라 도구 줄 | O |
| A·B 인물 바라보기 | 카메라 도구 줄 | U |
| 짓기(벽·바닥·블록) | 카메라 도구 줄 | — |
| 맞춤(카메라와 인물이 다 보이게) | 카메라 도구 줄 | 0 |
| 줄자(탑 화면) | 카메라 도구 줄 | — |
| 물체: 회전·옮기기·복제·삭제·편집 | 물체 줄(고르면 나타남) | Delete |
| 크레인: 스윙·붐·암 | 크레인 줄 | — |
| 렌즈 넓게/좁게 | 키보드 | Z / X |
| 구도 가이드, 폴스컬러 | 모니터 오른쪽 | G / F |
| 조도 히트맵 | 조명 패널 | — |
| 무빙 시작/끝 편집, 이 샷 재생, 전체 재생 | 키프레임 줄, 샷 띠 | M, Space, P |
| 새 샷, 복제, 삭제, 이전/다음, 길이 ±1초 | 샷 띠 | N, ⌘D, [ ], , . |
| 실행 취소 / 다시 | 위쪽 바 | ⌘Z / ⇧⌘Z |
| 편집 ↔ 콘티 | 위쪽 바 | B |
| 내보내기(16가지) | 위쪽 바 메뉴 | — |
| 간편/프로 전환, 튜토리얼, 포커스 연습, 조작 가이드 | 내보내기 메뉴·더보기·홈 | ? |
| 렌즈 계산기·렌즈 비교·조도 계산기 | 패널 안 링크 | — |
| 게임패드 조작 | — | 패드 |

## 14. 위험 요소

1. **한 파일 1.1MB**: 고칠 곳이 흩어져 있다. 시험 없이 고치면 쉽게 깨진다.
2. **칸마다 입력 받기**: 위·앞 칸에서 물체를 옮기려면 `#world` 하나에 묶인 입력·맞힘 판정 전역을 칸마다 나눠야 한다. 가장 큰 공사다.
3. **앞(Front) 시점과 직교 투영**: 렌더러에 없다. 좁은 화각으로 흉내 내거나 투영 계산을 더해야 한다.
4. **튜토리얼**: 안내 단계가 요소 위치와 id를 가리킨다(예: 더보기 단계). 배치를 바꾸면 안내가 틀어진다.
5. **성능**: 세 칸을 동시에 그리면 GL 그리기가 세 배가 된다. 보조 칸은 늦춰 그려야 한다(지금 0.14초 간격).
6. **휴대폰 가로**: 높이가 390px이라 아래 탭과 아래 시트가 화면을 많이 가린다.
7. **사진 저장**: 사진을 프로젝트에 넣으면 IndexedDB 용량이 커지고, 공유 링크로는 보낼 수 없다.
8. **Astryx 테마 교체**: 모든 버튼·탭·슬라이더 모양이 함께 바뀐다. 테마 한 벌로 다시 만들어야 한다.
