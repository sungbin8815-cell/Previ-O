# PREVIO UI (Astryx)

The app's controls are drawn with real [Astryx](https://www.npmjs.com/package/@astryxdesign/core) components.

PREVIO itself (`../index.html`) is plain JavaScript and stays that way: it owns the state and wires every control by id,
class and data attribute. `src/main.jsx` is a bridge that draws an Astryx component in place of each app control and
keeps the app's control in the page, hidden, as the source of truth:

- the component reads text, icon, pressed / disabled state, value and options from the app's control;
- every action goes back to it (a click on the app's button; a value set on the app's input plus the `input` / `change`
  events the app listens for), so the app's code, keyboard shortcuts and tests run unchanged;
- presses (pointer, mouse and touch down / up) are dispatched again on the app's control, so listeners higher up see the
  target they always saw (e.g. "a press outside the export menu closes it, except on the export button");
- `aria-haspopup`, `aria-expanded` and `aria-controls` are copied onto the component, so a button that opens a menu
  still says so to screen readers.

What is upgraded, and what is left alone on purpose, is the `SPECS` / `SKIP` list at the top of `src/main.jsx`.

## Theme

Two themes made with the Astryx theme editor, as the "monitor cart" design asks: `themes/cart/` (aluminium-grey body, ink
accent, SUIT, light only) for every control on the grey chrome, and `themes/well/` (black wells, white accent, dark only) for
the controls that sit on the stage. `themeFor()` in `src/main.jsx` picks one per control. `themes/lens/` is the old theme,
kept for reference and no longer built.

    npx @astryxdesign/cli@0.7.17 experimental theme editor show cart --png
    npx @astryxdesign/cli@0.7.17 experimental theme editor set cart <thing> <value>

## Build

    npm install
    npm run build      # writes dist/previo-ui.js and dist/previo-ui.css; commit dist/

`index.html` loads both files. Its own stylesheet sits in the `app` cascade layer, above Astryx's page reset and below
Astryx's component styles (`@layer reset, app, astryx-base, astryx-theme`).
