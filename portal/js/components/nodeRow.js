import { el, esc } from '../core/dom.js';
import { href } from '../core/router.js';
import { iconEl } from '../core/icons.js';
import { TypeGlyph } from './typeGlyph.js';
import { DownloadButton } from './downloadButton.js';
import { plural, formatBytes, formatDate } from '../core/format.js';

function highlightedName(name, ranges) {
  if (!ranges?.length) return name;
  const frag = document.createDocumentFragment();
  let i = 0;
  for (const [s, e] of ranges) {
    if (s > i) frag.append(name.slice(i, s));
    const mark = el('mark', { class: 'node-row__mark' }, name.slice(s, e));
    frag.append(mark);
    i = e;
  }
  if (i < name.length) frag.append(name.slice(i));
  return frag;
}

/** options: showPath (for search results), ranges (highlight spans for the name) */
export function NodeRow(node, { showPath = false, ranges = [] } = {}) {
  const metaBits = [];
  if (node.kind === 'dir') metaBits.push(plural(node.fileCount, 'file'));
  else { if (node.size != null) metaBits.push(formatBytes(node.size)); metaBits.push(node.type.label); }
  if (node.modified) metaBits.push(formatDate(node.modified));

  const link = el('a', { class: 'node-row__link', href: href.node(node) }, [
    TypeGlyph(node),
    el('span', { class: 'node-row__body' }, [
      el('span', { class: 'node-row__name' }, highlightedName(node.name, ranges)),
      showPath ? el('div', { class: 'node-row__path' }, node.path) : el('div', { class: 'node-row__meta' }, metaBits.map((t) => el('span', {}, t))),
    ]),
  ]);

  const actions = el('div', { class: 'node-row__actions' }, [
    node.kind === 'file' ? DownloadButton(node, { compact: true }) : iconEl('chevron'),
  ]);

  return el('div', { class: 'node-row', role: 'listitem' }, [link, actions]);
}

export function NodeList(nodes, opts = {}) {
  return el('div', { class: 'node-list', role: 'list' }, nodes.map((n) => NodeRow(n, opts)));
}
