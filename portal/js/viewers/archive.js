import { el } from '../core/dom.js';
import { libs } from '../core/loader.js';
import { formatBytes } from '../core/format.js';
import { icon } from '../core/icons.js';

export async function render(node, ctx) {
  ctx.host.append(el('div', { class: 'viewer-pad', style: 'padding-bottom:0' },
    el('p', { class: 'state__desc' }, 'Contents of the archive:')));
  const list = el('div', { class: 'archive-list' });
  ctx.host.append(list);

  const JSZip = await libs.jszip();
  const buf = await (await fetch(ctx.contentUrl)).arrayBuffer();
  const zip = await JSZip.loadAsync(buf);
  const entries = Object.values(zip.files).sort((a, b) => a.name.localeCompare(b.name));
  if (!entries.length) { list.append(el('p', { class: 'state__desc' }, 'This archive is empty.')); return; }

  for (const e of entries) {
    const nameCell = el('span', { html: e.dir ? icon('folder') + ' ' : '' });
    nameCell.append(document.createTextNode(e.name));
    const sizeCell = el('span', {}, e.dir ? '' : formatBytes(e._data?.uncompressedSize ?? 0));
    list.append(el('div', { class: 'archive-list__row' }, [nameCell, sizeCell]));
  }
}
