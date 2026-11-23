# 작업 지침

- 사용자에게 보내는 모든 글(답변, 작업 중 안내, 요약, 질문)은 **한국어로만** 쓴다. 자세한 규칙은 `.claude/skills/korean-only/SKILL.md`를 따른다.
- 파일 이름·코드·명령어처럼 바꾸면 틀리는 것만 원래 표기를 쓰고 `코드 표기`로 감싼다.

## PREVIO와 Astryx

- PREVIO는 React 없이 `index.html` 하나로 된 앱이다. Astryx 부품은 `ui/`의 연결 장치(`ui/src/main.jsx`)가 앱의 기존 버튼·입력칸 자리에 그려 넣는다. 자세한 구조는 `ui/README.md`를 본다.
- 앱 코드는 기존 요소(id·class·data 속성)를 그대로 쓴다. 기존 요소를 지우거나 이름을 바꾸지 말고, 바꿀 때는 기능이 그대로인지 테스트한다.
- `ui/`를 고친 뒤에는 `cd ui && npm run build`로 `ui/dist/`를 다시 만들어 함께 커밋한다.
- 아래 Astryx 안내의 React 전용 규칙(예: `<div>` 금지, 템플릿에서 시작)은 `ui/src/` 안의 React 코드에만 적용한다.

<!-- ASTRYX:START -->
Astryx v0.7.17 · 90+ components
CLI: run every command as `npx @astryxdesign/cli@0.7.17 <cmd>` (shown below as `astryx ...`).

SETUP (once, in app entry e.g. main.tsx) — without these, components render unstyled:
  import "@astryxdesign/core/reset.css";
  import "@astryxdesign/core/astryx.css";

WORKFLOW — start every page from a template, never from scratch:
1. `astryx build "<idea>"` — names the template to scaffold from and the parts it lacks.
2. `astryx template <name> <path>` — scaffold it; keep its frame, gap and padding; replace the content.
3. `astryx component <Name>` to read props before using one; `astryx template <Block>` prints a block example to read for a part it lacks. Astryx names differ from other libraries: buttons, badges, tokens and tabs take their text in `label` (Text, Heading and Link take children), booleans start with `is` or `has` (`isOpen`, `isDisabled`), and every input takes `value` and `onChange`.
Changing an existing page? Keep it: skip step 2 and add components inside its sections; read a block example when it helps.

RULES:
- No <div> — components handle all layout and spacing.
- Read `astryx docs layout` before changing a template's frame.
- Dense data = rows (Table, List/Item), not Card-wrapped lists. Badge = counts only.
- Style with component props first, then tokens (var(--color-*|--spacing-*|--radius-*)). No raw hex/px. No StyleX/Tailwind compiler here — don't use xstyle/utility classes directly. Some templates use StyleX and need a compiler plugin; see `astryx docs styling-overview`.
- THEMES: palettes and custom colors go through the theme, never :root overrides; so does a denser or roomier app (`editor set <name> spacing tight`), never gap and padding changes page by page. A change to one kind of part (the sidebar, its selected item, the gaps in a form) is a theme change too, not props on one page: `editor how "<ask>"` names the `set … --on <part>` line. No app yet: `astryx experimental theme preview app <dir>` makes a starter app that shows the theme. To make or change a theme (colors, fonts, corners, spacing, a look from a picture), prefer the experimental theme editor over hand-written theme files: `astryx experimental theme editor new <name> --like neutral`, then `editor set <name> <thing> <value>` or `editor how "<what you want>"`; wire it with `astryx theme add <name>`; after each change look at it with `astryx experimental theme editor show <name> --png` (takes pictures of real components) and open the PNGs it writes; a theme change is not done until you have looked at the pictures. In code, extend an imported theme to customize it; `theme eject <slug>` only forks source. See `astryx docs theme`.
- SELF-CHECK: re-read the file; replace any raw <div>/<span>, imported .css/@apply, or hardcoded #hex/px with the component or a token.

`astryx help` lists every command. Key ones beyond the workflow:
  search "<query>"   find any component / hook / doc / template
  discover <words>   integrations you could add
  docs <topic>       getting-started, principles, tokens, theme … (`astryx docs` lists all)
  docs cli           commands and API reference
  docs authoring     build an integration package, and every field it holds
  upgrade --from <old version> --apply   run after a dependency bump
To remove this block, run `astryx init --remove-agents`, which removes it from the agent files at the project root and in the folder you run it in; from any other file it leaves, delete everything from ASTRYX:START to ASTRYX:END.
<!-- ASTRYX:END -->
