# PREVIO UI (Astryx)

The app's controls are drawn with real [Astryx](https://www.npmjs.com/package/@astryxdesign/core) components.

PREVIO itself (`../index.html`) is plain JavaScript and stays that way: it owns the state and wires every control by id,
class and data attribute. `src/main.jsx` is a bridge that draws an Astryx component in place of each app control and
keeps the app's control in the page, hidden, as the source of truth:

- the component reads text, icon, pressed / disabled state, value and options from the app's control;
- every action goes back to it (a click on the app's button; a value set on the app's input plus the `input` / `change`
  events the app listens for), so the app's code, keyboard shortcuts and tests run unchanged.

What is upgraded, and what is left alone on purpose, is the `SPECS` / `SKIP` list at the top of `src/main.jsx`.

## Theme

`themes/lens/` is the lens theme (graphite surfaces, lime `#C9DD4F` accent, IBM Plex Sans KR, dark only), made with the
Astryx theme editor:

    npx @astryxdesign/cli@0.7.17 experimental theme editor show lens --png   # pictures of every component
    npx @astryxdesign/cli@0.7.17 experimental theme editor set lens <thing> <value>

## Build

    npm install
    npm run build      # writes dist/previo-ui.js and dist/previo-ui.css; commit dist/

`index.html` loads both files. Its own stylesheet sits in the `app` cascade layer, above Astryx's page reset and below
Astryx's component styles (`@layer reset, app, astryx-base, astryx-theme`).
