// PREVIO × Astryx: real Astryx components drawn in place of the app's own controls.
//
// The app (../index.html) is plain JavaScript that owns all state and wires every control by id, class and data attribute.
// This bundle does not change that wiring. Each control it upgrades stays in the page, hidden from sight and from screen
// readers ("legacy"), and an Astryx component is drawn just before it ("host"). The component reads what it shows from the
// legacy element (text, icon, pressed, disabled, value, options) and hands every action back to it (a click on the legacy
// button, a value set on the legacy input followed by the same input / change events the app listens for). So the app's
// code, its tests and its keyboard shortcuts keep working exactly as before; only the drawing changes.
import React, { useEffect, useReducer } from 'react';
import { createRoot } from 'react-dom/client';
import { createPortal, flushSync } from 'react-dom';
import { Theme } from '@astryxdesign/core/theme';
import { Button } from '@astryxdesign/core/Button';
import { ToggleButton } from '@astryxdesign/core/ToggleButton';
import { SegmentedControl, SegmentedControlItem } from '@astryxdesign/core/SegmentedControl';
import { TabList, Tab } from '@astryxdesign/core/TabList';
import { Slider } from '@astryxdesign/core/Slider';
import { Selector } from '@astryxdesign/core/Selector';
import { lensTheme } from './themes/lens/lens.js';

// ---- which controls are upgraded -------------------------------------------------------------------------------------
// Left alone on purpose: things the app drives with pointer down / up or drag (move pad, crane keys, joystick, dials,
// rulers, shot cards), the start screen and full-screen tools, and anything inside a dialog the app builds on the fly.
const SKIP = '.movepad, #craneBar, #joy, .dial, .fpresets, .ruler, .ticks, .card, .shots .cards, #home, .hm-top, .fp-top, .modal, .mc-panel, #lookModal, .ax-host, [data-ax-skip]';
const SPECS = [
  { kind: 'seg', sel: '.bar .vtoggle, #modeSeg, .drawer .seg' },
  { kind: 'tabs', sel: '.drawer .ptabs, .drawer .dtabs' },
  { kind: 'rail', sel: '#rail > button' },
  { kind: 'button', sel: '.bar .btn, .drawer .btn, .shots .btn, #camBar .fab, #kfBar .fab, #placeBar .btn, #placeBar .fab, #objBar .fab, #buildBar .btn, #buildBar .fab' },
  { kind: 'select', sel: '.drawer select' },
  { kind: 'slider', sel: '.drawer input[type=range]:not(.dialin)' },
];

const reg = new Map();   // legacy element -> { host, kind }
function adopt(el, kind) {
  const host = document.createElement('span'); host.className = 'ax-host ax-' + kind; host.dataset.astryxTheme = 'lens';
  el.before(host); el.classList.add('ax-legacy'); el.setAttribute('aria-hidden', 'true'); el.tabIndex = -1;
  // the component's own click (and the input / change of its inner fields) must not also reach the app's listeners on the
  // parent, or they would run twice: the action is handed to the legacy element instead, whose event bubbles as it always
  // did. Presses (pointer, mouse, touch, keys) bubble on as the app's own buttons' did, so "click outside closes the menu" works.
  for (const t of ['click', 'input', 'change'])
    host.addEventListener(t, e => e.stopPropagation());
  reg.set(el, { host, kind });
}
function scan() {
  let changed = false;
  for (const [el, r] of reg) if (!el.isConnected || el.matches('.dialin')) { r.host.remove(); reg.delete(el); if (el.isConnected) { el.classList.remove('ax-legacy'); el.removeAttribute('aria-hidden'); el.removeAttribute('tabindex'); } changed = true; }
  for (const { kind, sel } of SPECS) for (const el of document.querySelectorAll(sel)) {
    if (reg.has(el) || el.closest(SKIP)) continue;
    if (kind === 'button' && el.closest('.seg, .vtoggle, .modeseg, .dtabs, .ptabs')) continue;
    adopt(el, kind); changed = true;
  }
  return changed;
}

// ---- reading the legacy element --------------------------------------------------------------------------------------
const shown = el => !el.hidden && getComputedStyle(el).display !== 'none' && !el.closest('[hidden]');
// the text a person sees: words the app's CSS hides (e.g. toolbar labels on a narrow stage) are left out, as they were
const textIn = el => { let t = ''; for (const n of el.childNodes) { if (n.nodeType === 3) t += n.textContent; else if (n.nodeType === 1 && !/^(svg|kbd)$/i.test(n.tagName) && !n.classList.contains('ax-host') && getComputedStyle(n).display !== 'none') t += textIn(n); } return t; };
const textOf = el => textIn(el).replace(/\s+/g, ' ').trim();
const labelOf = el => textOf(el) || el.getAttribute('aria-label') || el.title || '';
const iconOf = el => { const s = el.querySelector(':scope > svg'); if (s) return <span className="ax-ic" dangerouslySetInnerHTML={{ __html: s.outerHTML }} />;
  // a colour mark (the cast's A / B / C dots, gel swatches) keeps the colour and shape the app's CSS gave it
  const d = el.querySelector(':scope > i, :scope > .dot'); if (!d) return undefined; const c = getComputedStyle(d);
  return <span className="ax-dot" style={{ width: c.width, height: c.height, borderRadius: c.borderRadius, background: c.backgroundColor, backgroundImage: c.backgroundImage }} />; };
const pressed = el => el.getAttribute('aria-pressed') === 'true' || el.getAttribute('aria-selected') === 'true';
const fire = (el, type) => el.dispatchEvent(new Event(type, { bubbles: true }));
const rowLabel = el => { const row = el.closest('.xrow, .lh, label, .row'); const t = row && row.firstElementChild && row.firstElementChild !== el ? textOf(row.firstElementChild) : ''; return el.getAttribute('aria-label') || t || el.id || '값'; };
const size = el => (el.classList.contains('sm') || el.closest('.toolbar, .seg.kr') ? 'sm' : 'md');

// ---- the components --------------------------------------------------------------------------------------------------
function LegacyButton({ el }) {
  const label = labelOf(el), text = textOf(el), icon = iconOf(el), common = { label: label || '버튼', icon, isIconOnly: !text && !!icon, isDisabled: el.disabled, size: size(el) };
  if (el.hasAttribute('aria-pressed') && !el.classList.contains('primary'))
    return <ToggleButton {...common} isPressed={pressed(el)} onPressedChange={() => el.click()}>{text || undefined}</ToggleButton>;
  const variant = el.classList.contains('primary') ? 'primary' : el.classList.contains('ghost') ? 'ghost' : el.classList.contains('warn') ? 'destructive' : el.classList.contains('fab') ? 'ghost' : 'secondary';
  return <Button {...common} variant={variant} onClick={() => el.click()}>{text || undefined}</Button>;
}
function LegacySeg({ el }) {
  const items = [...el.querySelectorAll(':scope > button')].filter(shown);
  const marks = items.filter(b => b.hasAttribute('aria-pressed') || b.hasAttribute('aria-selected'));
  const on = items.filter(pressed);
  if (!items.length) return null;
  // a single choice: Astryx SegmentedControl. Several at once (or plain commands): a row of buttons.
  // on the picture of a narrow stage (phones) the view switch shows its icons only, so it clears the shot chips beside it
  const compact = !!el.closest('.stage') && el.closest('.stage').clientWidth < 1000;
  if (marks.length === items.length && on.length <= 1) {
    const v = on.length ? String(items.indexOf(on[0])) : '';
    return <SegmentedControl label={el.getAttribute('aria-label') || '선택'} value={v} size={size(el)} layout={el.closest('.drawer') ? 'fill' : 'hug'} onChange={i => items[+i] && items[+i].click()}>
      {items.map((b, i) => <SegmentedControlItem key={i} value={String(i)} label={labelOf(b) || String(i + 1)} icon={iconOf(b)} isDisabled={b.disabled} isLabelHidden={compact && !!iconOf(b)} />)}
    </SegmentedControl>;
  }
  return <span className="ax-row">{items.map((b, i) => <LegacyButton key={i} el={b} />)}</span>;
}
function LegacyTabs({ el }) {
  const items = [...el.querySelectorAll(':scope > button')].filter(shown); const on = items.findIndex(pressed);
  return <TabList value={String(on)} onChange={i => items[+i] && items[+i].click()} hasDivider layout="fill" size="md">
    {items.map((b, i) => <Tab key={i} value={String(i)} label={labelOf(b)} />)}
  </TabList>;
}
function RailItem({ el }) {
  const kbd = el.querySelector('kbd'); const extra = el.querySelector(':scope > b');
  return <ToggleButton label={textOf(el)} isPressed={pressed(el)} onPressedChange={() => el.click()} icon={iconOf(el)}>
    <span className="ax-rail-t">{textOf(el).replace(extra ? extra.textContent : '', '').trim()}{extra ? <b className="ax-rail-b">{extra.textContent}</b> : null}</span>
  </ToggleButton>;
}
function LegacySelect({ el }) {
  const opts = []; for (const n of el.children) {
    if (n.tagName === 'OPTGROUP') opts.push({ type: 'section', title: n.label, options: [...n.children].map(o => ({ value: o.value, label: o.textContent, disabled: o.disabled })) });
    else opts.push({ value: n.value, label: n.textContent, disabled: n.disabled });
  }
  return <Selector label={rowLabel(el)} isLabelHidden options={opts} value={el.value} size="md" isDisabled={el.disabled} onChange={v => { if (v === el.value) return; el.value = v; fire(el, 'input'); fire(el, 'change'); }} />;
}
function LegacySlider({ el }) {
  const min = el.min === '' ? 0 : +el.min, max = el.max === '' ? 100 : +el.max, step = el.step === '' ? 1 : el.step === 'any' ? (max - min) / 1000 : +el.step;
  return <Slider label={rowLabel(el)} isLabelHidden valueDisplay="none" min={min} max={max} step={step} value={+el.value} isDisabled={el.disabled}
    onChange={v => { if (Math.abs(v - +el.value) < 1e-9) return; el.value = v; fire(el, 'input'); }} onChangeEnd={v => { el.value = v; fire(el, 'change'); }} />;
}
const DRAW = { button: LegacyButton, seg: LegacySeg, tabs: LegacyTabs, rail: RailItem, select: LegacySelect, slider: LegacySlider };

// ---- one React root, one portal per host ------------------------------------------------------------------------------
// The page changes all the time (the monitor's readouts, the timecode, the dial being turned), so the root does not redraw
// on every change: a change marks only the control it touched, new or removed controls are picked up by a scan, and a
// change to the page's mode (body / html class, a panel shown or hidden) redraws everything once.
const ALL = SPECS.map(x => x.sel).join(', ');
const dirty = new Set(); let all = true;
const owner = n => { for (let e = n; e && e !== document.body; e = e.parentElement) if (reg.has(e)) return e; return null; };
const touches = n => n.nodeType === 1 && (n.matches(ALL) || !!n.querySelector(ALL));
const Slot = React.memo(function Slot({ el, kind }) { const C = DRAW[kind]; return shown(el) ? <C el={el} /> : null; }, (a, b) => a.el === b.el && a.v === b.v);
function App() {
  const [, tick] = useReducer(n => n + 1, 0);
  useEffect(() => {
    let raf = 0; const kick = () => { if (!raf) raf = requestAnimationFrame(go); };
    function go() { raf = 0; if (scan()) all = true; if (all) for (const [, r] of reg) r.v = (r.v || 0) + 1; else for (const el of dirty) { const r = reg.get(el); if (r) r.v = (r.v || 0) + 1; } all = false; dirty.clear(); tick(); }
    const mo = new MutationObserver(recs => { let now = false;
      for (const r of recs) {
        const t = r.target.nodeType === 1 ? r.target : r.target.parentElement; if (!t || t.closest('.ax-host, #ax-root')) continue;
        if (r.type === 'attributes' && (t === document.body || t === document.documentElement || t.matches('.drawer, .ptab, .app, #rail, .bar, .stage, .shots, .ov, .toolbar, [data-pane]'))) { all = true; kick(); continue; }
        const o = owner(t); if (o) { dirty.add(o); kick(); continue; }
        if (r.type === 'childList' && ([...r.addedNodes].some(touches) || [...r.removedNodes].some(n => n.nodeType === 1 && (reg.has(n) || touches(n))))) { now = true; continue; }
        if (r.type === 'attributes' && r.attributeName === 'hidden' && touches(t)) { all = true; kick(); }
      }
      // controls the app just built are swapped before the browser paints, so the panel never shows them for a frame or jumps
      if (now) { if (raf) { cancelAnimationFrame(raf); raf = 0; } flushSync(go); }
    });
    mo.observe(document.documentElement, { subtree: true, childList: true, attributes: true, characterData: true, attributeFilter: ['aria-pressed', 'aria-selected', 'disabled', 'hidden', 'class', 'title', 'aria-label'] });
    // values the app sets from code fire no event and change no attribute: re-read sliders and selects a few times a second
    const iv = setInterval(() => { for (const [el, r] of reg) if ((r.kind === 'slider' || r.kind === 'select') && r.last !== el.value) { r.last = el.value; dirty.add(el); kick(); } }, 250);
    go(); return () => { mo.disconnect(); clearInterval(iv); };
  }, []);
  return <Theme theme={lensTheme} mode="dark">
    {[...reg].map(([el, r]) => { if (!r.key) r.key = 'ax' + (++keys); return createPortal(<Slot el={el} kind={r.kind} v={r.v} />, r.host, r.key); })}
  </Theme>;
}
let keys = 0;
// The app rebuilds panels with innerHTML. When it wipes a node that an Astryx floating layer (tooltip, menu) was attached to,
// React later tries to remove a node that is already gone and the whole root would stop. Removing something that is no
// longer there is treated as done, which is what React wanted anyway.
const rc = Node.prototype.removeChild;
Node.prototype.removeChild = function (c) { if (c && c.parentNode !== this) return c; return rc.call(this, c); };
const ib = Node.prototype.insertBefore;
Node.prototype.insertBefore = function (n, r) { if (r && r.parentNode !== this) return this.appendChild(n); return ib.call(this, n, r); };
function start() { const box = document.createElement('div'); box.id = 'ax-root'; document.body.append(box); scan(); createRoot(box).render(<App />); window.PREVIO_UI = { reg, scan, version: '1' }; }
document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', start) : start();
