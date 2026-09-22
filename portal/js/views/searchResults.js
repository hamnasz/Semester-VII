import { el, clear } from '../core/dom.js';
import { href, navigate } from '../core/router.js';
import { search as runSearch, ranges as matchRanges } from '../core/search.js';
import { NodeRow } from '../components/nodeRow.js';
import { EmptyState } from '../components/states.js';
import { GROUPS } from '../core/filetypes.js';
import { plural } from '../core/format.js';
import { icon } from '../core/icons.js';

export function SearchResultsView(repo, index, { q, group }) {
  const root = el('div');
  const input = el('input', {
    type: 'text', value: q, placeholder: 'Search files and folders\u2026', 'aria-label': 'Search',
    style: 'width:100%;font-size:var(--text-lg);font-family:var(--font-serif);border:0;border-bottom:2px solid var(--border-strong);padding:0.5rem 0;background:none;outline:0;',
  });
  root.append(el('h1', { class: 'visually-hidden' }, 'Search results'));
  root.append(el('div', { style: 'margin-bottom:var(--space-5)' }, input));

  const chips = el('div', { class: 'filter-row', style: 'margin-bottom:var(--space-6)' });
  const activeGroups = repo.groups;
  const allChip = el('button', { class: 'filter-chip', 'aria-pressed': String(!group), onClick: () => navigate(href.search({ q: input.value, group: '' })) }, 'All types');
  chips.append(allChip);
  for (const g of activeGroups) {
    chips.append(el('button', {
      class: 'filter-chip', 'aria-pressed': String(group === g.id),
      onClick: () => navigate(href.search({ q: input.value, group: g.id })),
    }, `${g.label} (${g.count})`));
  }
  root.append(chips);

  const resultsHost = el('div');
  root.append(resultsHost);

  const renderResults = () => {
    clear(resultsHost);
    if (!q.trim() && !group) {
      resultsHost.append(EmptyState({ title: 'Search this portal', desc: 'Start typing to search across every subject, folder and file.', iconName: 'search' }));
      return;
    }
    const { results, tokens } = runSearch(index, q, { group, limit: 200 });
    if (!results.length) {
      resultsHost.append(EmptyState({ title: 'No matches', desc: q ? `Nothing matched \u201c${q}\u201d.` : 'No files of this type were found.', iconName: 'search' }));
      return;
    }
    resultsHost.append(el('p', { style: 'color:var(--ink-faint);font-size:var(--text-sm);margin-bottom:var(--space-3)' }, plural(results.length, 'result')));
    const list = el('div', { class: 'node-list' }, results.map((r) => NodeRow(r.node, { showPath: true, ranges: matchRanges(r.node.name, tokens) })));
    resultsHost.append(list);
  };
  renderResults();

  let t;
  input.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => navigate(href.search({ q: input.value, group }), { replace: true }), 200); });

  return root;
}
