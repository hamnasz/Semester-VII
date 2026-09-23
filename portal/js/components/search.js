import { el, clear } from '../core/dom.js';
import { icon, iconEl } from '../core/icons.js';
import { search as runSearch, ranges as matchRanges } from '../core/search.js';
import { navigate, href } from '../core/router.js';
import { NodeRow } from './nodeRow.js';

let overlay = null;

function close() {
  overlay?.remove();
  overlay = null;
  document.removeEventListener('keydown', onKey, true);
}

let active = -1;
let items = [];

function onKey(e) {
  if (e.key === 'Escape') { close(); return; }
  if (!items.length) return;
  if (e.key === 'ArrowDown') { e.preventDefault(); setActive(Math.min(active + 1, items.length - 1)); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(Math.max(active - 1, 0)); }
  else if (e.key === 'Enter') { e.preventDefault(); const it = items[active] ?? items[0]; if (it) go(it); }
}

function setActive(i) {
  items.forEach((it) => it.el.removeAttribute('data-active'));
  active = i;
  const it = items[active];
  if (it) { it.el.dataset.active = 'true'; it.el.scrollIntoView({ block: 'nearest' }); }
}

function go(it) {
  close();
  navigate(href.node(it.node));
}

export function openSearch(index) {
  if (overlay) return;
  active = -1; items = [];

  const input = el('input', { type: 'text', placeholder: 'Search files and folders…', 'aria-label': 'Search', autocomplete: 'off', spellcheck: 'false' });
  const resultsEl = el('div', { class: 'search-panel__results', role: 'listbox' });
  const foot = el('div', { class: 'search-panel__foot' }, [
    el('span', {}, [el('span', { class: 'kbd' }, '↑↓'), ' navigate']),
    el('span', {}, [el('span', { class: 'kbd' }, 'Enter'), ' open']),
    el('span', {}, [el('span', { class: 'kbd' }, 'Esc'), ' close']),
  ]);

  const panel = el('div', { class: 'search-panel', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Search' }, [
    el('div', { class: 'search-panel__field' }, [iconEl('search'), input, el('button', { class: 'btn btn-icon', 'aria-label': 'Close search', onClick: close, html: icon('close') })]),
    resultsEl,
    foot,
  ]);

  overlay = el('div', { class: 'search-overlay', onClick: (e) => { if (e.target === overlay) close(); } }, panel);
  document.body.append(overlay);
  document.addEventListener('keydown', onKey, true);
  input.focus();

  const render = () => {
    const q = input.value.trim();
    clear(resultsEl);
    items = [];
    if (!q) {
      resultsEl.append(el('div', { class: 'state', style: 'border:0;padding:2rem 1rem;' }, el('p', { class: 'state__desc' }, 'Type to search across every subject and file.')));
      return;
    }
    const { results, tokens } = runSearch(index, q, { limit: 60 });
    if (!results.length) {
      resultsEl.append(el('div', { class: 'state', style: 'border:0;padding:2rem 1rem;' }, el('p', { class: 'state__desc' }, `No matches for “${q}”.`)));
      return;
    }
    for (const r of results) {
      const rangesForName = matchRanges(r.node.name, tokens);
      const row = NodeRow(r.node, { showPath: true, ranges: rangesForName });
      const wrap = el('div', { class: 'search-result', role: 'option', onClick: (e) => { e.preventDefault(); go({ node: r.node, el: wrap }); } }, row);
      resultsEl.append(wrap);
      items.push({ node: r.node, el: wrap });
    }
    setActive(0);
  };

  input.addEventListener('input', render);
  render();
}
