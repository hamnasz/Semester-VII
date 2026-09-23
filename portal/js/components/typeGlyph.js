import { el } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { groupById } from '../core/filetypes.js';

export function TypeGlyph(node, { size = '' } = {}) {
  const cls = ['type-glyph', size && `type-glyph--${size}`, node.kind === 'dir' && 'type-glyph--folder'].filter(Boolean).join(' ');
  const glyph = node.kind === 'dir' ? 'folder' : node.type.glyph;
  const hue = node.kind === 'dir' ? null : groupById[node.type.group]?.hue;
  return el('span', { class: cls, style: hue != null ? `--hue:${hue}` : '', 'aria-hidden': 'true', html: icon(glyph) });
}
