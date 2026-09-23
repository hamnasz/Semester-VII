import { el } from '../core/dom.js';

export async function render(node, ctx) {
  const isAudio = node.type.id === 'audio';
  const tag = isAudio ? 'audio' : 'video';
  const player = el(tag, { src: ctx.contentUrl, controls: true, style: isAudio ? 'width:100%' : 'width:100%;max-height:78vh;background:#000' });
  ctx.host.append(el('div', { class: 'viewer-pad' }, player));
}
