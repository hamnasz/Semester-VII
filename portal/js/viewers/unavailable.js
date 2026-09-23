import { el } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { DownloadButton } from '../components/downloadButton.js';

export async function render(node, ctx) {
  const canDownload = !node.restricted;
  ctx.host.append(el('div', { class: 'viewer-pad' }, el('div', { class: 'state state--center' }, [
    el('span', { class: 'state__icon', html: icon(node.type.glyph) }),
    el('p', { class: 'state__title' }, `No in-browser preview for ${node.type.label.toLowerCase()}`),
    el('p', { class: 'state__desc' }, canDownload
      ? 'This file type isn\u2019t rendered here yet. Download it to open it in the right application.'
      : 'This file type isn\u2019t rendered here yet, and this file is available to view only, so it can\u2019t be downloaded from this page.'),
    canDownload ? DownloadButton(node) : null,
  ].filter(Boolean))));
}
