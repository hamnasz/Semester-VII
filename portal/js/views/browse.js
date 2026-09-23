import { el, clear } from '../core/dom.js';
import { Breadcrumbs } from '../components/breadcrumbs.js';
import { NodeList } from '../components/nodeRow.js';
import { EmptyState } from '../components/states.js';
import { getNode, ancestors, subjectInfo } from '../core/repo.js';
import { plural } from '../core/format.js';
import { iconEl } from '../core/icons.js';

export function BrowseView(repo, path) {
  const dir = getNode(repo, path);
  if (!dir || dir.kind !== 'dir') return NotFound(path);

  const root = el('div');
  root.append(Breadcrumbs(ancestors(dir), dir));

  const isSubject = dir.parent && !dir.parent.parent;
  const info = isSubject ? subjectInfo(dir) : null;
  root.append(el('header', { style: 'margin-bottom:var(--space-6)' }, [
    el('h1', { class: 'font-serif', style: 'font-size:var(--text-2xl)' }, info?.title || dir.name),
    info ? el('p', { style: 'color:var(--ink-soft);margin-top:.5rem;max-width:var(--measure)' }, info.description) : null,
    dir.restricted ? el('p', { class: 'badge-restricted', style: 'margin-top:.75rem' }, [iconEl('lock'), 'Files in this folder are available to view only.']) : null,
  ].filter(Boolean)));

  if (!dir.children.length) {
    root.append(EmptyState({ title: 'This folder is empty', desc: 'Nothing has been added here yet.', iconName: 'folder' }));
    return root;
  }

  root.append(el('div', { class: 'node-toolbar' }, el('span', { class: 'node-toolbar__count' }, `${plural(dir.children.length, 'item')}`)));
  root.append(NodeList(dir.children));
  return root;
}

function NotFound(path) {
  return EmptyState({ title: 'Folder not found', desc: `\u201c${path}\u201d doesn\u2019t exist in this repository.`, iconName: 'warning' });
}
