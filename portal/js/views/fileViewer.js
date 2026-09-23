import { el, clear, mount } from '../core/dom.js';
import { Breadcrumbs } from '../components/breadcrumbs.js';
import { DownloadButton } from '../components/downloadButton.js';
import { TypeGlyph } from '../components/typeGlyph.js';
import { EmptyState, ErrorState, SpinnerLine } from '../components/states.js';
import { getNode, ancestors } from '../core/repo.js';
import { contentUrl } from '../core/urls.js';
import { formatBytes, formatDate } from '../core/format.js';
import { icon } from '../core/icons.js';
import { getViewer } from '../viewers/index.js';
import { CONFIG } from '../../config.js';

export function FileViewerView(repo, path) {
  const node = getNode(repo, path);
  if (!node || node.kind !== 'file') return NotFound(path);

  const root = el('div');
  root.append(Breadcrumbs(ancestors(node), node));

  const meta = [node.type.label];
  if (node.size != null) meta.push(formatBytes(node.size));
  if (node.modified) meta.push(formatDate(node.modified));

  root.append(el('div', { class: 'viewer-toolbar' }, [
    el('div', { class: 'viewer-toolbar__title' }, [
      TypeGlyph(node, { size: 'sm' }),
      el('div', {}, [
        el('div', { class: 'viewer-toolbar__name' }, node.name),
        el('div', { class: 'viewer-toolbar__meta' }, meta.join(' \u00b7 ')),
      ]),
    ]),
    el('div', { class: 'viewer-toolbar__actions' }, [
      el('a', { class: 'btn btn-icon', href: contentUrl(node), target: '_blank', rel: 'noopener', 'aria-label': 'Open in a new tab', html: icon('external') }),
      DownloadButton(node),
    ]),
  ]));

  const body = el('div', { class: 'viewer-body' });
  root.append(body);
  loadInto(body, node);
  return root;
}

async function loadInto(body, node) {
  mount(body, SpinnerLine('Loading preview\u2026'));

  const big = node.size != null && node.size > CONFIG.maxPreviewMB * 1024 * 1024;
  if (big && !body.dataset.confirmed) {
    mount(body, EmptyState({
      title: 'This file is large',
      desc: `It\u2019s about ${formatBytes(node.size)}. Loading a preview may take a moment on a slow connection.`,
      iconName: 'info',
      action: el('button', { class: 'btn btn-primary', onClick: () => { body.dataset.confirmed = '1'; loadInto(body, node); } }, 'Load preview'),
    }));
    return;
  }

  try {
    const renderFn = await getViewer(node.type.viewer);
    clear(body);
    body.className = 'viewer-body' + (['pdf', 'docx', 'pptx', 'html', 'image', 'sheet', 'csv'].includes(node.type.viewer) ? ' viewer-body--flush' : '');
    await renderFn(node, { host: body, contentUrl: contentUrl(node) });
  } catch (err) {
    console.error(err);
    mount(body, ErrorState({
      title: 'This preview couldn\u2019t be loaded',
      desc: 'Something went wrong while rendering this file. You can try again, or open it directly.',
      retry: () => loadInto(body, node),
    }));
  }
}

function NotFound(path) {
  return EmptyState({ title: 'File not found', desc: `\u201c${path}\u201d doesn\u2019t exist in this repository.`, iconName: 'warning' });
}
